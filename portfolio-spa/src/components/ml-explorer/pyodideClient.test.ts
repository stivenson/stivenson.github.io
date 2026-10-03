import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createPyodideClient,
  type RunResult,
  type WorkerLike,
  type WorkerRequest,
  type WorkerResponse,
} from './pyodideClient';

class FakeWorker implements WorkerLike {
  onmessage: WorkerLike['onmessage'] = null;
  onerror: WorkerLike['onerror'] = null;
  sent: WorkerRequest[] = [];
  terminated = false;
  postMessage(message: WorkerRequest) {
    this.sent.push(message);
  }
  terminate() {
    this.terminated = true;
  }
  emit(data: WorkerResponse) {
    this.onmessage?.({ data });
  }
}

function setup(timeoutMs = 15_000) {
  const workers: FakeWorker[] = [];
  const client = createPyodideClient(() => {
    const w = new FakeWorker();
    workers.push(w);
    return w;
  }, timeoutMs);
  return { client, workers };
}

describe('createPyodideClient', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('envía el código y resuelve con la salida', async () => {
    const { client, workers } = setup();
    const run = client.run('print(1)');
    expect(workers[0].sent).toEqual([{ type: 'run', id: 1, code: 'print(1)' }]);
    workers[0].emit({ type: 'started', id: 1 });
    workers[0].emit({ type: 'result', id: 1, ok: true, stdout: '1', images: [] });
    await expect(run).resolves.toEqual({ status: 'ok', stdout: '1', images: [] });
  });

  it('reenvía los mensajes de progreso', async () => {
    const { client, workers } = setup();
    const progress: string[] = [];
    const run = client.run('x', (m) => progress.push(m));
    workers[0].emit({ type: 'progress', id: 1, message: 'Descargando…' });
    workers[0].emit({ type: 'result', id: 1, ok: true, stdout: '', images: [] });
    await run;
    expect(progress).toEqual(['Descargando…']);
  });

  it('la descarga de Pyodide no cuenta para el timeout', async () => {
    const { client, workers } = setup();
    let settled = false;
    const run = client.run('x').then((r) => {
      settled = true;
      return r;
    });
    await vi.advanceTimersByTimeAsync(60_000);
    expect(settled).toBe(false);
    workers[0].emit({ type: 'result', id: 1, ok: true, stdout: '', images: [] });
    await expect(run).resolves.toMatchObject({ status: 'ok' });
  });

  it('corta un bucle infinito a los 15 s y usa un worker nuevo en la siguiente ejecución', async () => {
    const { client, workers } = setup();
    const run = client.run('while True: pass');
    workers[0].emit({ type: 'started', id: 1 });
    await vi.advanceTimersByTimeAsync(15_000);
    await expect(run).resolves.toEqual({ status: 'timeout' });
    expect(workers[0].terminated).toBe(true);

    void client.run('print(2)');
    expect(workers).toHaveLength(2);
  });

  it('ignora mensajes tardíos del worker terminado', async () => {
    const { client, workers } = setup();
    const run = client.run('x');
    workers[0].emit({ type: 'started', id: 1 });
    await vi.advanceTimersByTimeAsync(15_000);
    await run;
    expect(() => workers[0].emit({ type: 'result', id: 1, ok: true, stdout: '', images: [] })).not.toThrow();
  });

  it('reporta load-failed si Pyodide no carga, y reinicia el worker', async () => {
    const { client, workers } = setup();
    const run = client.run('x');
    workers[0].emit({ type: 'result', id: 1, ok: false, stdout: '', images: [], error: 'CDN caído', loadFailed: true });
    await expect(run).resolves.toEqual({ status: 'load-failed', error: 'CDN caído' });
    expect(workers[0].terminated).toBe(true);
  });

  it('devuelve el error de Python sin reiniciar el worker', async () => {
    const { client, workers } = setup();
    const run = client.run('1/0');
    workers[0].emit({ type: 'started', id: 1 });
    workers[0].emit({ type: 'result', id: 1, ok: false, stdout: 'antes', images: [], error: 'ZeroDivisionError' });
    const result: RunResult = await run;
    expect(result).toEqual({ status: 'error', stdout: 'antes', images: [], error: 'ZeroDivisionError' });
    expect(workers[0].terminated).toBe(false);
  });

  it('stop() termina la ejecución en curso', async () => {
    const { client, workers } = setup();
    const run = client.run('x');
    workers[0].emit({ type: 'started', id: 1 });
    client.stop();
    await expect(run).resolves.toEqual({ status: 'stopped' });
    expect(workers[0].terminated).toBe(true);
  });

  it('un started duplicado no deja un timer huérfano', async () => {
    const { client, workers } = setup();
    const a = client.run('a');
    workers[0].emit({ type: 'started', id: 1 });
    workers[0].emit({ type: 'started', id: 1 });
    workers[0].emit({ type: 'result', id: 1, ok: true, stdout: '', images: [] });
    await a;
    // El timer huérfano de A vencería a los 15 s, en mitad de la ejecución B.
    await vi.advanceTimersByTimeAsync(10_000);
    const b = client.run('b');
    workers[0].emit({ type: 'started', id: 2 });
    await vi.advanceTimersByTimeAsync(14_999);
    let settled = false;
    void b.then(() => {
      settled = true;
    });
    await vi.advanceTimersByTimeAsync(0);
    expect(settled).toBe(false);
    workers[0].emit({ type: 'result', id: 2, ok: true, stdout: 'b', images: [] });
    await expect(b).resolves.toEqual({ status: 'ok', stdout: 'b', images: [] });
  });

  it('si makeWorker lanza, run() resuelve load-failed y el siguiente run reintenta', async () => {
    let calls = 0;
    const client = createPyodideClient(() => {
      calls++;
      throw new Error('SecurityError');
    });
    await expect(client.run('x')).resolves.toEqual({ status: 'load-failed', error: 'Error: SecurityError' });
    await expect(client.run('x')).resolves.toEqual({ status: 'load-failed', error: 'Error: SecurityError' });
    expect(calls).toBe(2);
  });

  it('run() con otra ejecución en curso detiene la primera y usa un worker nuevo', async () => {
    const { client, workers } = setup();
    const first = client.run('a');
    const second = client.run('b');
    await expect(first).resolves.toEqual({ status: 'stopped' });
    expect(workers[0].terminated).toBe(true);
    expect(workers).toHaveLength(2);
    expect(workers[1].sent).toEqual([{ type: 'run', id: 2, code: 'b' }]);
    workers[0].emit({ type: 'result', id: 2, ok: true, stdout: 'zombi', images: [] });
    let settled = false;
    void second.then(() => {
      settled = true;
    });
    await vi.advanceTimersByTimeAsync(0);
    expect(settled).toBe(false);
    workers[1].emit({ type: 'result', id: 2, ok: true, stdout: 'b', images: [] });
    await expect(second).resolves.toMatchObject({ status: 'ok', stdout: 'b' });
  });

  it('tras un result ok no queda ningún timer pendiente', async () => {
    const { client, workers } = setup();
    const run = client.run('x');
    workers[0].emit({ type: 'started', id: 1 });
    workers[0].emit({ type: 'result', id: 1, ok: true, stdout: '', images: [] });
    await run;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('onerror durante una ejecución da load-failed y termina el worker', async () => {
    const { client, workers } = setup();
    const run = client.run('x');
    workers[0].onerror?.(new Error('boom'));
    await expect(run).resolves.toMatchObject({ status: 'load-failed' });
    expect(workers[0].terminated).toBe(true);
  });
});
