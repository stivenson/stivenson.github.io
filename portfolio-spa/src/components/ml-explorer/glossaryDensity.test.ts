import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AVAILABLE_SLUGS, loadAlgorithm } from './registry';
import { TAB_IDS } from './types';

export const MAX_CHIPS_PER_BLOCK = 3;

/** Bloques <p>, <li> y <blockquote> (las reglas son <p class="mlx-rule">) con más fichas 💡 de las permitidas. */
export function crowdedBlocks(html: string, max = MAX_CHIPS_PER_BLOCK): string[] {
  const bad: string[] = [];
  const block = /<(p|li|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/g;
  for (let m = block.exec(html); m; m = block.exec(html)) {
    const chips = (m[2].match(/class="mlx-gl"/g) ?? []).length;
    if (chips > max) bad.push(`${chips} fichas: «${m[2].replace(/<[^>]*>/g, '').slice(0, 70)}…»`);
  }
  return bad;
}

describe('crowdedBlocks', () => {
  it('cuenta fichas por bloque', () => {
    const chip = '<button class="mlx-gl">x</button>';
    expect(crowdedBlocks(`<p>${chip.repeat(3)}</p>`)).toEqual([]);
    expect(crowdedBlocks(`<p>${chip.repeat(4)}</p>`)).toHaveLength(1);
    expect(crowdedBlocks(`<li>${chip.repeat(4)}</li>`)).toHaveLength(1);
  });
});

describe(`como máximo ${MAX_CHIPS_PER_BLOCK} fichas 💡 por bloque`, () => {
  it.each(AVAILABLE_SLUGS)('%s', async (slug) => {
    const mod = await loadAlgorithm(slug);
    const problems: string[] = [];
    for (const tab of TAB_IDS) {
      for (const part of ['essential', 'deepDive'] as const) {
        const node = mod.tabs[tab][part];
        if (node == null) continue;
        for (const b of crowdedBlocks(renderToStaticMarkup(node as never))) problems.push(`${slug} / ${tab} / ${part}: ${b}`);
      }
    }
    expect(problems).toEqual([]);
  });
});
