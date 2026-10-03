import { describe, expect, it } from 'vitest';
import {
  KNN_POINTS,
  KNN_START,
  LOGISTIC_B0,
  LOGISTIC_B1,
  LOGISTIC_XS,
  LOGISTIC_YS,
  LR_INITIAL,
  LR_OUTLIER,
  TREE_POINTS,
} from './datasets';
import { accuracy, buildTree, countLeaves, fitLine, fitLogistic1D, knnVote, mse, sigmoid, snap } from './ovaMath';

describe('OVA de regresión lineal', () => {
  it('la recta inicial es ŷ ≈ 0.98 + 0.65·x, con MSE ≈ 0.10', () => {
    const line = fitLine(LR_INITIAL);
    expect(line.b0).toBeCloseTo(0.983, 3);
    expect(line.b1).toBeCloseTo(0.65, 3);
    expect(mse(LR_INITIAL, line)).toBeCloseTo(0.101, 3);
  });

  it('un solo outlier aplana la recta y multiplica el MSE por 25 (pestaña Contras)', () => {
    const points = [...LR_INITIAL, LR_OUTLIER];
    const line = fitLine(points);
    expect(line.b1).toBeCloseTo(0.397, 3);
    expect(mse(points, line)).toBeCloseTo(2.568, 3);
  });
});

describe('OVA de regresión logística', () => {
  const hits = (b0: number, b1: number) =>
    LOGISTIC_XS.filter((x, i) => (sigmoid(b0 + b1 * x) >= 0.5 ? 1 : 0) === LOGISTIC_YS[i]).length;

  it('con los valores iniciales (b₀ = −4, b₁ = 1) acierta 15 de 18', () => {
    expect(hits(-4, 1)).toBe(15);
  });

  it('«Mejor ajuste» es determinista, cae dentro de los sliders y acierta 16 de 18', () => {
    const fit = fitLogistic1D(LOGISTIC_XS, LOGISTIC_YS);
    expect(fitLogistic1D(LOGISTIC_XS, LOGISTIC_YS)).toEqual(fit);
    expect(-fit.b0 / fit.b1).toBeCloseTo(3.39, 2);
    const b0 = snap(fit.b0, LOGISTIC_B0);
    const b1 = snap(fit.b1, LOGISTIC_B1);
    expect(b0).toBeCloseTo(-5.7, 5);
    expect(b1).toBeCloseTo(1.7, 5);
    expect(hits(b0, b1)).toBe(16);
  });

  it('ningún ajuste de los sliders acierta los 18: las clases se solapan', () => {
    let best = 0;
    for (let b0 = LOGISTIC_B0.min; b0 <= LOGISTIC_B0.max; b0 += 0.25) {
      for (let b1 = LOGISTIC_B1.min; b1 <= LOGISTIC_B1.max; b1 += 0.05) best = Math.max(best, hits(b0, b1));
    }
    expect(best).toBeLessThan(18);
  });
});

describe('OVA del árbol de decisión', () => {
  it.each([
    { depth: 0, leaves: 1, acc: 0.536 },
    { depth: 1, leaves: 2, acc: 0.857 },
    { depth: 2, leaves: 4, acc: 0.857 },
    { depth: 3, leaves: 6, acc: 0.929 },
    { depth: 4, leaves: 8, acc: 0.964 },
    { depth: 5, leaves: 9, acc: 1 },
  ])('profundidad $depth → $leaves hojas y $acc de acierto', ({ depth, leaves, acc }) => {
    const tree = buildTree(TREE_POINTS, depth);
    expect(countLeaves(tree)).toBe(leaves);
    expect(accuracy(tree, TREE_POINTS)).toBeCloseTo(acc, 3);
  });
});

describe('OVA de KNN', () => {
  it.each([
    { k: 1, votes: [1, 0], winner: 0 },
    { k: 3, votes: [1, 2], winner: 1 },
    { k: 5, votes: [1, 4], winner: 1 },
    { k: 7, votes: [1, 6], winner: 1 },
  ])('k = $k desde la posición inicial → votos $votes', ({ k, votes, winner }) => {
    const result = knnVote(KNN_POINTS, KNN_START, k);
    expect(result.votes).toEqual(votes);
    expect(result.winner).toBe(winner);
  });
});
