/**
 * Redacción del encabezado (figcaption: título + hint) de la OVA de cada algoritmo disponible.
 * Los tests de redacción de las pestañas (glossaryTerms, glossaryDensity, textSpacing) no ven
 * el `hint` de las OVAs; este test cubre ese hueco con dos reglas:
 *  1. Frases vetadas por slug (BANNED): p. ej. en PCA no se habla de «información»
 *     (la varianza retenida no es información; se dice «variación»).
 *  2. Espaciado: ningún término marcado queda pegado (findGlued, como en textSpacing)
 *     y no hay espacios dobles ni espacio antes de puntuación.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { findGlued, toMarkedText } from '../algorithms/visibleText';
import { AVAILABLE_SLUGS, loadAlgorithm } from '../registry';

/** Frases que no deben aparecer en el encabezado de la OVA de cada algoritmo (sin distinguir mayúsculas). */
const BANNED: Record<string, RegExp[]> = {
  pca: [/información/i],
  dbscan: [/núcleos que se tocan/i],
};

/** Texto visible del <figcaption> de la OVA. */
async function ovaCaption(slug: string): Promise<string> {
  const mod = await loadAlgorithm(slug);
  const html = renderToStaticMarkup(createElement(mod.Ova));
  const m = /<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/.exec(html);
  return m ? toMarkedText(m[1]) : '';
}

describe('encabezado (hint) de la OVA de cada algoritmo', () => {
  it.each(AVAILABLE_SLUGS)('%s', async (slug) => {
    const text = await ovaCaption(slug);
    expect(text, `${slug}: la OVA no tiene figcaption`).not.toBe('');
    const plain = text.replace(/<[^>]*>/g, '');
    const problems: string[] = [];
    for (const re of BANNED[slug] ?? []) if (re.test(text)) problems.push(`frase vetada ${re}`);
    for (const g of findGlued(text)) problems.push(`pegado: «${g}»`);
    if (/ {2}/.test(plain)) problems.push('espacio doble');
    if (/\s[,;:.)»]/.test(plain)) problems.push('espacio antes de puntuación');
    expect(problems).toEqual([]);
  });
});
