import { describe, expect, it } from 'vitest';
import { parseExplorerState, withExplorerState } from './urlState';

const slugs = ['linear-regression', 'knn'];

describe('parseExplorerState', () => {
  it('lee alg y tab válidos', () => {
    const p = new URLSearchParams('alg=knn&tab=cons');
    expect(parseExplorerState(p, slugs)).toEqual({ alg: 'knn', tab: 'cons' });
  });

  it('ignora un alg desconocido o no disponible y abre el primero', () => {
    const p = new URLSearchParams('alg=svm&tab=pros');
    expect(parseExplorerState(p, slugs)).toEqual({ alg: 'linear-regression', tab: 'pros' });
  });

  it('ignora una pestaña desconocida y abre «type»', () => {
    const p = new URLSearchParams('alg=knn&tab=hack');
    expect(parseExplorerState(p, slugs)).toEqual({ alg: 'knn', tab: 'type' });
  });

  it('sin parámetros abre el primer algoritmo en «type»', () => {
    expect(parseExplorerState(new URLSearchParams(), slugs)).toEqual({ alg: 'linear-regression', tab: 'type' });
  });

  it('sin algoritmos disponibles devuelve alg null (y conserva la pestaña válida)', () => {
    expect(parseExplorerState(new URLSearchParams('alg=knn&tab=pros'), [])).toEqual({ alg: null, tab: 'pros' });
    expect(parseExplorerState(new URLSearchParams(), [])).toEqual({ alg: null, tab: 'type' });
  });
});

describe('withExplorerState', () => {
  it('escribe alg y tab sin borrar otros parámetros', () => {
    const next = withExplorerState(new URLSearchParams('ref=x'), { alg: 'knn', tab: 'formula' });
    expect(next.toString()).toBe('ref=x&alg=knn&tab=formula');
  });

  it('sobrescribe alg y tab si ya estaban', () => {
    const next = withExplorerState(new URLSearchParams('alg=knn&tab=pros'), { alg: 'linear-regression', tab: 'cons' });
    expect(next.get('alg')).toBe('linear-regression');
    expect(next.get('tab')).toBe('cons');
    expect(next.getAll('alg')).toHaveLength(1);
  });
});
