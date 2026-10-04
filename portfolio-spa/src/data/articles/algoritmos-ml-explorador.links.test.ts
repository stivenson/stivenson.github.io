import { describe, expect, it } from 'vitest';
import article from './algoritmos-ml-explorador.md?raw';
import { ALGORITHMS, AVAILABLE_SLUGS } from '../../components/ml-explorer/registry';
import { TAB_IDS } from '../../components/ml-explorer/types';

const NUMBER_WORDS = [
  'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
  'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete',
];

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

  it('la description cuenta en palabras los algoritmos ya disponibles', () => {
    const description = article.match(/^description:\s*"(.*)"$/m)?.[1] ?? '';
    expect(NUMBER_WORDS).toHaveLength(ALGORITHMS.length + 1);
    expect(description).toContain(`Los primeros ${NUMBER_WORDS[AVAILABLE_SLUGS.length]} ya están completos`);
  });
});
