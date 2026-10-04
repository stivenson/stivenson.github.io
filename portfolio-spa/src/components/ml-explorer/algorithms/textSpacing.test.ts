import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AVAILABLE_SLUGS, loadAlgorithm } from '../registry';
import { TAB_IDS } from '../types';
import { CLOSE, OPEN, findGlued, toMarkedText } from './visibleText';

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
