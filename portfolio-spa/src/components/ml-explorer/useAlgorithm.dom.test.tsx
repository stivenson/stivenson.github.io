// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { control } from './testRegistry';
import { useAlgorithm, type AlgorithmState } from './useAlgorithm';

vi.mock('./registry', () => import('./testRegistry'));

beforeEach(() => {
  control.auto = false;
  control.pending.length = 0;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** Nunca debe verse el módulo de un slug distinto al pedido. */
function expectConsistent(state: AlgorithmState, slug: string) {
  if (state.status === 'ready') expect(state.module.slug).toBe(slug);
}

const flush = () => act(async () => {});

describe('useAlgorithm', () => {
  it('A→B→A rápido con respuestas en desorden nunca muestra el módulo de otro slug', async () => {
    const { result, rerender } = renderHook(({ slug }) => useAlgorithm(slug), { initialProps: { slug: 'alpha' } });
    rerender({ slug: 'beta' });
    rerender({ slug: 'alpha' });
    expect(control.pending.map((p) => p.slug)).toEqual(['alpha', 'beta', 'alpha']);
    const [a1, b, a2] = control.pending;

    // Llega primero la de beta (ya obsoleta): sigue cargando alpha.
    b.resolve();
    await flush();
    expectConsistent(result.current, 'alpha');
    expect(result.current.status).toBe('loading');

    // Luego la última petición de alpha.
    a2.resolve();
    await flush();
    expect(result.current.status).toBe('ready');
    expectConsistent(result.current, 'alpha');

    // La primera de alpha llega tarde y no cambia nada.
    a1.resolve();
    await flush();
    expectConsistent(result.current, 'alpha');
    expect(result.current.status).toBe('ready');
  });

  it('una respuesta tardía de B no se cuela tras volver a A', async () => {
    const { result, rerender } = renderHook(({ slug }) => useAlgorithm(slug), { initialProps: { slug: 'alpha' } });
    rerender({ slug: 'beta' });
    rerender({ slug: 'alpha' });
    const [, b, a2] = control.pending;
    a2.resolve();
    await flush();
    b.resolve();
    await flush();
    expect(result.current.status).toBe('ready');
    expectConsistent(result.current, 'alpha');
  });

  it('error → Reintentar → listo', async () => {
    const { result } = renderHook(() => useAlgorithm('beta'));
    control.pending[0].reject();
    await flush();
    expect(result.current.status).toBe('error');

    act(() => {
      if (result.current.status === 'error') result.current.retry();
    });
    expect(result.current.status).toBe('loading');
    expect(control.pending).toHaveLength(2);
    control.pending[1].resolve();
    await flush();
    expect(result.current.status).toBe('ready');
    expectConsistent(result.current, 'beta');
  });

  it('desmontar con la carga pendiente no produce avisos', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { unmount } = renderHook(() => useAlgorithm('alpha'));
    unmount();
    control.pending[0].resolve();
    await flush();
    const { unmount: unmount2 } = renderHook(() => useAlgorithm('beta'));
    unmount2();
    control.pending[1].reject();
    await flush();
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it('sin slug (registry vacío) queda cargando y no pide nada', () => {
    const { result } = renderHook(() => useAlgorithm(null));
    expect(result.current.status).toBe('loading');
    expect(control.pending).toHaveLength(0);
  });
});
