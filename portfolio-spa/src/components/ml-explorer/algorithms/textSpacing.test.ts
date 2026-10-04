import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AVAILABLE_SLUGS, loadAlgorithm } from '../registry';
import { TAB_IDS } from '../types';

const OPEN = '';
const CLOSE = '';
const WORDY = /[\p{L}\p{N}]/u;

/** Reemplaza cada <span class="katex"> (con su <span> envolvente) por marcadores, contando spans. */
function markTex(html: string): string {
  const start = '<span><span class="katex">';
  let out = '';
  let i = 0;
  for (;;) {
    const at = html.indexOf(start, i);
    if (at < 0) return out + html.slice(i);
    out += html.slice(i, at);
    let depth = 0;
    let j = at;
    const tag = /<(\/?)span\b[^>]*>/g;
    tag.lastIndex = at;
    for (let m = tag.exec(html); m; m = tag.exec(html)) {
      depth += m[1] ? -1 : 1;
      j = tag.lastIndex;
      if (depth === 0) break;
    }
    out += OPEN + CLOSE;
    i = j;
  }
}

/** Texto visible con marcadores alrededor de cada término del glosario y cada fórmula en línea. */
function toMarkedText(html: string): string {
  const withGloss = html.replace(
    /<button[^>]*class="mlx-gl"[^>]*>[\s\S]*?<\/button>/g,
    (b) => OPEN + b.replace(/<[^>]*>/g, '') + CLOSE,
  );
  return markTex(withGloss)
    .replace(/<[^>]*>/g, '')
    .replace(/&(amp|lt|gt|quot|#x27);/g, (_, e: string) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#x27': "'" })[e]!);
}

export function findGlued(text: string): string[] {
  const bad: string[] = [];
  const re = new RegExp(`${OPEN}([^${CLOSE}]*)${CLOSE}`, 'gu');
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const before = [...text.slice(0, m.index)].pop() ?? '';
    const after = [...text.slice(m.index + m[0].length)][0] ?? '';
    if (WORDY.test(before) || WORDY.test(after)) {
      const from = Math.max(0, m.index - 25);
      bad.push(text.slice(from, m.index + m[0].length + 25).replaceAll(OPEN, '[[').replaceAll(CLOSE, ']]'));
    }
  }
  return bad;
}

describe('findGlued', () => {
  it('detecta letras pegadas y acepta espacios y puntuación', () => {
    expect(findGlued(`a${OPEN}x${CLOSE} b`)).toHaveLength(1);
    expect(findGlued(`a ${OPEN}x${CLOSE}b`)).toHaveLength(1);
    expect(findGlued(`a (${OPEN}x${CLOSE}), b`)).toHaveLength(0);
  });
});

describe('espacios alrededor de términos del glosario y fórmulas', () => {
  for (const slug of AVAILABLE_SLUGS) {
    it(`${slug}: ningún término queda pegado a una palabra`, async () => {
      const mod = await loadAlgorithm(slug);
      const problems: string[] = [];
      for (const tab of TAB_IDS) {
        for (const part of ['essential', 'deepDive'] as const) {
          const node = mod.tabs[tab][part];
          if (node == null) continue;
          for (const frag of findGlued(toMarkedText(renderToStaticMarkup(node as never)))) {
            problems.push(`${slug} / ${tab} / ${part}: «${frag}»`);
          }
        }
      }
      expect(problems).toEqual([]);
    });
  }
});
