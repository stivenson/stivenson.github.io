// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AVAILABLE_SLUGS, loadAlgorithm } from '../registry';
import { TAB_IDS } from '../types';

/**
 * Un término 💡 (botón) o una fórmula en línea son cajas atómicas: el
 * navegador puede cortar la línea justo antes del «.» que las sigue y dejar
 * la puntuación sola al principio de la línea siguiente. Toda puntuación
 * pegada a uno de ellos debe ir con él dentro de un .mlx-nowrap.
 */
const CLOSING = /^[:;,.)?!»]/u;
const OPENING = /[(«]$/u;

export function findOrphans(html: string): string[] {
  const doc = new DOMParser().parseFromString(`<div id="root">${html}</div>`, 'text/html');
  const atoms = [
    ...doc.querySelectorAll('button.mlx-gl'),
    // Fórmula en línea: el <span> que envuelve a .katex (las de bloque viven en .mlx-tex-block).
    ...[...doc.querySelectorAll('.katex')].map((k) => k.parentElement!).filter((p) => !p.closest('.mlx-tex-block')),
  ];
  const bad: string[] = [];
  for (const el of atoms) {
    const wrapped = el.parentElement?.classList.contains('mlx-nowrap') ?? false;
    const next = el.nextSibling;
    const prev = el.previousSibling;
    const label = (el.textContent ?? '').slice(0, 30);
    if (next?.nodeType === 3 && CLOSING.test(next.textContent ?? '') && !wrapped) bad.push(`«${label}» + «${next.textContent![0]}»`);
    if (prev?.nodeType === 3 && OPENING.test(prev.textContent ?? '') && !wrapped) bad.push(`«${prev.textContent!.slice(-1)}» + «${label}»`);
  }
  return bad;
}

describe('findOrphans', () => {
  it('detecta puntuación suelta y acepta la envuelta en nowrap', () => {
    expect(findOrphans('<p>el <button class="mlx-gl">x</button>. y</p>')).toHaveLength(1);
    expect(findOrphans('<p>(<button class="mlx-gl">x</button> y)</p>')).toHaveLength(1);
    expect(findOrphans('<p><span class="mlx-nowrap"><button class="mlx-gl">x</button>.</span> y</p>')).toHaveLength(0);
    expect(findOrphans('<p>el <button class="mlx-gl">x</button> y</p>')).toHaveLength(0);
    expect(findOrphans('<p>con <span><span class="katex">h</span></span>.</p>')).toHaveLength(1);
  });
});

describe('ninguna puntuación queda huérfana tras un término 💡 o una fórmula en línea', () => {
  for (const slug of AVAILABLE_SLUGS) {
    it(slug, async () => {
      const mod = await loadAlgorithm(slug);
      const problems: string[] = [];
      for (const tab of TAB_IDS) {
        for (const part of ['essential', 'deepDive'] as const) {
          const node = mod.tabs[tab][part];
          if (node == null) continue;
          for (const p of findOrphans(renderToStaticMarkup(node as never))) problems.push(`${tab}/${part}: ${p}`);
        }
      }
      expect(problems).toEqual([]);
    });
  }
});
