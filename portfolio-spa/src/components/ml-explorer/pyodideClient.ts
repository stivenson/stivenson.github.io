export type WorkerRequest = { type: 'run'; id: number; code: string };

export type WorkerResponse =
  | { type: 'progress'; id: number; message: string }
  | { type: 'started'; id: number }
  | { type: 'result'; id: number; ok: true; stdout: string; images: string[] }
  | { type: 'result'; id: number; ok: false; stdout: string; images: string[]; error: string; loadFailed?: boolean };

export type RunResult =
  | { status: 'ok'; stdout: string; images: string[] }
  | { status: 'error'; stdout: string; images: string[]; error: string }
  | { status: 'timeout' }
  | { status: 'stopped' }
  | { status: 'load-failed'; error: string };

/** Lo mínimo de `Worker` que usa el cliente; los tests lo simulan. */
export interface WorkerLike {
  postMessage(message: WorkerRequest): void;
  terminate(): void;
  onmessage: ((event: { data: WorkerResponse }) => void) | null;
  onerror: ((event: unknown) => void) | null;
}

export interface PyodideClient {
  run(code: string, onProgress?: (message: string) => void): Promise<RunResult>;
  stop(): void;
}

interface CurrentRun {
  id: number;
  resolve: (result: RunResult) => void;
  onProgress?: (message: string) => void;
  timer?: ReturnType<typeof setTimeout>;
}

/**
 * Habla con el worker de Pyodide. Una ejecucion a la vez.
 *
 * Python no se puede interrumpir desde fuera: para cortar un bucle infinito
 * hay que terminar el worker. Por eso el timeout (y «Detener») matan el
 * worker y la siguiente ejecucion crea uno nuevo, que vuelve a cargar
 * Pyodide desde la cache del navegador.
 */
export function createPyodideClient(makeWorker: () => WorkerLike, timeoutMs = 15_000): PyodideClient {
  let worker: WorkerLike | null = null;
  let nextId = 1;
  let current: CurrentRun | null = null;

  function finish(result: RunResult) {
    if (!current) return;
    if (current.timer) clearTimeout(current.timer);
    const { resolve } = current;
    current = null;
    resolve(result);
  }

  function kill() {
    worker?.terminate();
    worker = null;
  }

  function ensureWorker(): WorkerLike {
    if (worker) return worker;
    const w = makeWorker();
    w.onmessage = ({ data }) => {
      // Un worker ya terminado puede alcanzar a enviar algo: se descarta.
      if (w !== worker || !current || data.id !== current.id) return;
      if (data.type === 'progress') {
        current.onProgress?.(data.message);
      } else if (data.type === 'started') {
        current.timer = setTimeout(() => {
          kill();
          finish({ status: 'timeout' });
        }, timeoutMs);
      } else if (data.ok) {
        finish({ status: 'ok', stdout: data.stdout, images: data.images });
      } else if (data.loadFailed) {
        kill();
        finish({ status: 'load-failed', error: data.error });
      } else {
        finish({ status: 'error', stdout: data.stdout, images: data.images, error: data.error });
      }
    };
    w.onerror = () => {
      if (w !== worker) return;
      kill();
      finish({ status: 'load-failed', error: 'El worker de Python no pudo iniciar.' });
    };
    worker = w;
    return w;
  }

  return {
    run(code, onProgress) {
      if (current) {
        kill();
        finish({ status: 'stopped' });
      }
      const id = nextId++;
      return new Promise<RunResult>((resolve) => {
        current = { id, resolve, onProgress };
        ensureWorker().postMessage({ type: 'run', id, code });
      });
    },
    stop() {
      if (!current) return;
      kill();
      finish({ status: 'stopped' });
    },
  };
}
