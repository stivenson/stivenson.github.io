import { describe, expect, it } from 'vitest';
import reference from './gradient-boosting-reference.json';
import { GB_XS, GB_YS } from './datasets';
import { boost, predictBoost } from './ovaMath';

describe('Gradient Boosting: tasa y cantidad de árboles', () => {
  it.each(reference.cases)('coincide con sklearn para tasa $rate y $count árboles', ({ rate, count, predictions }) => {
    const model = boost(GB_XS, GB_YS, count, rate);
    expect(model.stumps).toHaveLength(count);
    reference.queries.forEach((x, i) => expect(predictBoost(model, x)).toBeCloseTo(predictions[i], 6));
  });
  it('un prefijo de 50 árboles conserva exactamente el ajuste de 10 con la misma tasa', () => {
    const full = boost(GB_XS, GB_YS, 50, 0.3);
    const short = boost(GB_XS, GB_YS, 10, 0.3);
    expect(full.stumps.slice(0, 10)).toEqual(short.stumps);
    for (const x of reference.queries) expect(predictBoost(full, x, 10)).toBe(predictBoost(short, x));
  });
});
