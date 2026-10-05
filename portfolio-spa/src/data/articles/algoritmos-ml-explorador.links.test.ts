import { describe, expect, it } from 'vitest';
import article from './algoritmos-ml-explorador.md?raw';
import { ALGORITHMS, AVAILABLE_SLUGS } from '../../components/ml-explorer/registry';
import { TAB_IDS } from '../../components/ml-explorer/types';

const internalLinks = Array.from(article.matchAll(/\]\((#\/articles\/algoritmos-ml-explorador\?[^)\s]+)\)/g), (m) => m[1]);

describe('artículo del explorador: enlaces y description al día', () => {
  it('tiene enlaces internos al explorador', () => {
    expect(internalLinks.length).toBeGreaterThan(0);
  });

  it.each(internalLinks)('%s apunta a un algoritmo disponible y a una pestaña válida', (href) => {
    const params = new URLSearchParams(href.slice(href.indexOf('?') + 1));
    const alg = params.get('alg');
    expect(AVAILABLE_SLUGS).toContain(alg);
    const tab = params.get('tab');
    if (tab !== null) expect(TAB_IDS as readonly string[]).toContain(tab);
  });

  it('la guía enlaza los 17 algoritmos, cada uno al menos una vez', () => {
    const algs = new Set(internalLinks.map((h) => new URLSearchParams(h.slice(h.indexOf('?') + 1)).get('alg')));
    expect([...algs].sort()).toEqual([...AVAILABLE_SLUGS].sort());
    expect(AVAILABLE_SLUGS).toHaveLength(ALGORITHMS.length);
  });

  it('ni la description ni el artículo prometen entregas futuras', () => {
    const description = article.match(/^description:\s*"(.*)"$/m)?.[1] ?? '';
    expect(description).toContain('Los 17 algoritmos');
    expect(article).not.toMatch(/próximamente|«pronto»|entregas|ya están completos|los primeros \p{L}+ ya/iu);
  });
});

/** Términos técnicos que el artículo explica entre paréntesis la primera vez (el .md no usa fichas 💡). */
const ARTICLE_TERMS = [
  'cheatsheet',
  'machine learning',
  'redes neuronales',
  'CNN',
  'RNN',
  'Transformer',
  'aprendizaje supervisado',
  'aprendizaje no supervisado',
  'PCA',
  'línea base',
  'notebook de Colab',
  'GPU',
  'numpy, scikit-learn y matplotlib',
  'datos de entrenamiento y de prueba',
];

/** El término va seguido (tras un cierre de negrita o de enlace) por una explicación entre paréntesis. */
export function explainedOnFirstUse(body: string, term: string): boolean {
  const at = body.search(new RegExp(`(?<![\\p{L}-])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}])`, 'u'));
  if (at < 0) return true;
  return /^(\*+|\]\([^)]*\))?\s*\((?!próximamente)[^)]{8,}\)/u.test(body.slice(at + term.length));
}

describe('artículo del explorador: jerga explicada', () => {
  const body = article.replace(/^---[\s\S]*?\n---\n/, '');

  it('detecta un término sin explicación', () => {
    expect(explainedOnFirstUse('usa PCA y ya', 'PCA')).toBe(false);
    expect(explainedOnFirstUse('usa PCA (componentes principales) y ya', 'PCA')).toBe(true);
    expect(explainedOnFirstUse('un [notebook de Colab](https://x) (cuaderno en la nube)', 'notebook de Colab')).toBe(true);
    expect(explainedOnFirstUse('**Sí → aprendizaje supervisado** (aprende con respuesta)', 'aprendizaje supervisado')).toBe(true);
  });

  it.each(ARTICLE_TERMS)('«%s» se explica la primera vez que aparece', (term) => {
    expect(body).toContain(term);
    expect(explainedOnFirstUse(body, term)).toBe(true);
  });
});
