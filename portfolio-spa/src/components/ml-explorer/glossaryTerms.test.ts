import { isValidElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { G } from './Gloss';
import { GLOSSARY } from './glossary';
import { REQUIRED_TERMS, termRegExp } from './glossaryTerms';
import { AVAILABLE_SLUGS, loadAlgorithm } from './registry';
import { TAB_IDS } from './types';
import { proseText } from './algorithms/visibleText';

/** Claves de todos los <G k> dentro de un árbol de JSX. */
export function glossKeys(node: ReactNode, out = new Set<string>()): Set<string> {
  if (Array.isArray(node)) node.forEach((n) => glossKeys(n, out));
  else if (isValidElement<{ k?: string; children?: ReactNode }>(node)) {
    if (node.type === G && node.props.k) out.add(node.props.k);
    glossKeys(node.props.children, out);
  }
  return out;
}

/** Términos de la lista que aparecen en el texto pero no llevan su ficha en ninguna parte del árbol. */
export function missingGloss(text: string, keys: Set<string>): string[] {
  return REQUIRED_TERMS.filter(
    ({ re, key, alsoBy = [] }) => termRegExp(re).test(text) && ![key, ...alsoBy].some((k) => keys.has(k)),
  ).map(
    ({ re, key }) => `${key} («${text.match(termRegExp(re))![0]}»)`,
  );
}

describe('lista de términos obligatorios', () => {
  it('cada clave existe en el glosario', () => {
    for (const { key } of REQUIRED_TERMS) expect(GLOSSARY, key).toHaveProperty(key);
  });

  it('detecta un término sin ficha y acepta uno con ficha', () => {
    expect(missingGloss('usa un kernel lineal', new Set())).toEqual(['kernel («kernel»)']);
    expect(missingGloss('usa un kernel lineal', new Set(['kernel']))).toEqual([]);
    expect(missingGloss('los log-odds suben', new Set(['logOdds']))).toEqual([]);
    expect(missingGloss('Gradient Boosting gana', new Set())).toEqual([]);
    expect(missingGloss('con kernel RBF', new Set(['rbf']))).toEqual([]);
    expect(missingGloss('el descenso de gradiente', new Set(['descensoGradiente']))).toEqual([]);
    expect(missingGloss('kernelizado y featureless', new Set())).toEqual([]);
  });
});

describe('cada término técnico lleva su ficha 💡 en cada pestaña donde aparece', () => {
  it.each(AVAILABLE_SLUGS)('%s', async (slug) => {
    const mod = await loadAlgorithm(slug);
    const problems: string[] = [];
    for (const tab of TAB_IDS) {
      const { essential, deepDive } = mod.tabs[tab];
      const text = [essential, deepDive]
        .filter((n) => n != null)
        .map((n) => proseText(renderToStaticMarkup(n as never)))
        .join('\n');
      const keys = glossKeys([essential, deepDive]);
      for (const m of missingGloss(text, keys)) problems.push(`${slug} / ${tab}: ${m}`);
    }
    if (problems.length) console.log(problems.join('\n'));
    expect(problems).toEqual([]);
  });
});
