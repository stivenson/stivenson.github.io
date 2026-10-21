import { describe, expect, it } from 'vitest';
import { NB_REVIEWS } from './datasets';
import { explainNaiveBayes, trainNaiveBayes } from './ovaMath';
import reference from './naive-bayes-reference.json';

describe(`ajustes de la OVA contrastados con ${reference.source}`, () => {
  it.each(reference.cases)('alpha=$alpha, prior=$positivePrior: $text', ({ alpha, positivePrior, text, pPositive }) => {
    const model = trainNaiveBayes(NB_REVIEWS, alpha, positivePrior);
    expect(explainNaiveBayes(model, text).pPositive).toBeCloseTo(pPositive, 12);
  });

  it('un prior explícito cambia el inicio sin cambiar lo aprendido sobre las palabras', () => {
    const learnedPrior = trainNaiveBayes([{ text: 'bueno', label: 1 }, { text: 'bueno', label: 1 }, { text: 'malo', label: 0 }]);
    expect(explainNaiveBayes(learnedPrior, '').pPositive).toBeCloseTo(2 / 3);
    const fixed = trainNaiveBayes([{ text: 'bueno', label: 1 }, { text: 'bueno', label: 1 }, { text: 'malo', label: 0 }], 1, 0.2);
    expect(explainNaiveBayes(fixed, '').pPositive).toBeCloseTo(0.2);
    expect(fixed.logLikelihood).toEqual(learnedPrior.logLikelihood);
  });

  it('el suavizado hace finita la evidencia de palabras ausentes en una clase', () => {
    for (const alpha of [0.1, 1, 5]) {
      const model = trainNaiveBayes([{ text: 'bueno bueno', label: 1 }, { text: 'malo', label: 0 }], alpha);
      const result = explainNaiveBayes(model, 'bueno');
      expect(result.words[0].factor).toBeCloseTo(((2 + alpha) / (2 + 2 * alpha)) / (alpha / (1 + 2 * alpha)), 12);
      expect(result.pPositive).toBeGreaterThan(0);
      expect(result.pPositive).toBeLessThan(1);
    }
  });

  it('rechaza ajustes que la OVA no admite', () => {
    for (const alpha of [0, -1, NaN, Infinity]) expect(() => trainNaiveBayes(NB_REVIEWS, alpha)).toThrow(RangeError);
    for (const prior of [0, 1, -0.1, NaN]) expect(() => trainNaiveBayes(NB_REVIEWS, 1, prior)).toThrow(RangeError);
  });
});
