import { describe, expect, it } from 'vitest';
import { ALGORITHMS, AVAILABLE_SLUGS, getMeta, prefetchAlgorithm } from './registry';

describe('registry', () => {
  it('tiene las 17 filas del cheatsheet, sin slugs repetidos', () => {
    expect(ALGORITHMS).toHaveLength(17);
    expect(new Set(ALGORITHMS.map((a) => a.slug)).size).toBe(17);
  });

  it('marca como disponibles solo los algoritmos implementados', () => {
    expect(AVAILABLE_SLUGS).toEqual([]);
  });

  it('getMeta devuelve la fila o lanza si no existe', () => {
    expect(getMeta('knn').name).toBe('KNN');
    expect(() => getMeta('nope')).toThrow('nope');
  });

  it('prefetch ignora slugs desconocidos o heredados', () => {
    expect(() => prefetchAlgorithm('constructor')).not.toThrow();
    expect(() => prefetchAlgorithm('nope')).not.toThrow();
  });
});
