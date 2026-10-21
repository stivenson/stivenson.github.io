import { describe, expect, it } from 'vitest';
import { LOGISTIC_XS as XS, LOGISTIC_YS as YS } from './datasets';
import { sigmoid } from './ovaMath';
import { logisticTrace, logisticDecisions } from './logisticOvaMath';
import reference from './logistic-regression-reference.json';

describe(`regularización contrastada con ${reference.source}`, () => {
  it.each(reference.cases)('C=$C reproduce coeficientes y probabilidades', ({ C, b0, b1, probabilities }) => {
    const trace = logisticTrace(XS, YS, C);
    const final = trace.frames[trace.frames.length - 1];
    expect(trace.convergedAt).not.toBeNull();
    expect(final.b0).toBeCloseTo(b0, 7);
    expect(final.b1).toBeCloseTo(b1, 7);
    XS.forEach((x, i) => expect(sigmoid(final.b0 + final.b1 * x)).toBeCloseTo(probabilities[i], 8));
  });

  it('C pequeño reduce la pendiente en estos datos y el límite puede detener el ajuste', () => {
    const strong = logisticTrace(XS, YS, 0.01).frames.at(-1)!;
    const weak = logisticTrace(XS, YS, 100).frames.at(-1)!;
    expect(Math.abs(strong.b1)).toBeLessThan(Math.abs(weak.b1));
    const early = logisticTrace(XS, YS, 1, 1);
    expect(early.frames).toHaveLength(2);
    expect(early.convergedAt).toBeNull();
    expect(early.frames[1]).not.toEqual(logisticTrace(XS, YS, 1).frames.at(-1));
  });

  it('conserva el resultado una vez que converge', () => {
    const trace = logisticTrace(XS, YS, 1);
    expect(trace.frames.slice(trace.convergedAt!)).toEqual(Array.from({ length: trace.frames.length - trace.convergedAt! }, () => trace.frames[trace.convergedAt!]));
    for (const C of [0, -1, NaN, Infinity]) expect(() => logisticTrace(XS, YS, C)).toThrow(RangeError);
  });

  it('el umbral cambia las decisiones, sin modificar las probabilidades', () => {
    const probabilities = [0.2, 0.4, 0.6, 0.8], labels = [0, 0, 1, 1];
    const original = [...probabilities];
    expect(logisticDecisions(probabilities, labels, 0.3)).toMatchObject({ fp: 1, fn: 0, hits: 3 });
    expect(logisticDecisions(probabilities, labels, 0.7)).toMatchObject({ fp: 0, fn: 1, hits: 3 });
    expect(probabilities).toEqual(original);
  });
});
