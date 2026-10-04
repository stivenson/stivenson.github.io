import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AVAILABLE_SLUGS, loadAlgorithm } from '../registry';
import { TAB_IDS } from '../types';
import { CLOSE, OPEN, toMarkedText } from './visibleText';

const WORDY = /[\p{L}\p{N}]/u;
/** Puntuación que cierra y pide espacio después: «riesgo),[[término]]» está pegado. */
const CLOSING_PUNCT = /[,;:.)»!?]/u;
/** Lo que no puede seguir a un término sin espacio: letra, dígito o una apertura. */
const OPENING = /[(«]/u;


export function findGlued(text: string): string[] {
  const bad: string[] = [];
  const re = new RegExp(`${OPEN}([^${CLOSE}]*)${CLOSE}`, 'gu');
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const before = [...text.slice(0, m.index)].pop() ?? '';
    const after = [...text.slice(m.index + m[0].length)][0] ?? '';
    const gluedBefore = WORDY.test(before) || CLOSING_PUNCT.test(before);
    const gluedAfter = WORDY.test(after) || OPENING.test(after);
    if (gluedBefore || gluedAfter) {
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
    expect(findGlued(`«${OPEN}x${CLOSE}» y ${OPEN}y${CLOSE}.`)).toHaveLength(0);
    expect(findGlued(`riesgo),${OPEN}x${CLOSE} con`)).toHaveLength(1);
    expect(findGlued(`fin.${OPEN}x${CLOSE} b`)).toHaveLength(1);
    expect(findGlued(`a»${OPEN}x${CLOSE} b`)).toHaveLength(1);
    expect(findGlued(`a ${OPEN}x${CLOSE}(b)`)).toHaveLength(1);
    expect(findGlued(`a ${OPEN}x${CLOSE}«b»`)).toHaveLength(1);
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
