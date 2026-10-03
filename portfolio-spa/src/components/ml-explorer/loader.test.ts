import { describe, expect, it, vi } from 'vitest';
import { createAlgorithmLoader } from './loader';
import type { AlgorithmModule } from './types';

const fakeModule = { slug: 'knn' } as AlgorithmModule;

describe('createAlgorithmLoader', () => {
  it('llama al import() una sola vez aunque se pida dos veces', async () => {
    const importKnn = vi.fn(async () => ({ default: fakeModule }));
    const load = createAlgorithmLoader({ knn: importKnn });

    await expect(load('knn')).resolves.toBe(fakeModule);
    await expect(load('knn')).resolves.toBe(fakeModule);
    expect(importKnn).toHaveBeenCalledTimes(1);
  });

  it('tras un fallo de red, el siguiente intento vuelve a pedir el chunk', async () => {
    const importKnn = vi
      .fn<() => Promise<{ default: AlgorithmModule }>>()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ default: fakeModule });
    const load = createAlgorithmLoader({ knn: importKnn });

    await expect(load('knn')).rejects.toThrow('network');
    await expect(load('knn')).resolves.toBe(fakeModule);
    expect(importKnn).toHaveBeenCalledTimes(2);
  });

  it('rechaza un slug desconocido', async () => {
    const load = createAlgorithmLoader({});
    await expect(load('nope')).rejects.toThrow('Algoritmo desconocido: nope');
  });

  it('no confunde claves heredadas del prototipo con algoritmos', async () => {
    const load = createAlgorithmLoader({});
    await expect(load('constructor')).rejects.toThrow('Algoritmo desconocido: constructor');
    await expect(load('toString')).rejects.toThrow('Algoritmo desconocido: toString');
  });
});
