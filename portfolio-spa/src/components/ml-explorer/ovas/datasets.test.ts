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
import {
  accuracy,
  buildTree,
  countLeaves,
  fitLine,
  fitLogistic1D,
  knnVote,
  mse,
  predictTree,
  sigmoid,
  snap,
} from './ovaMath';

describe('OVA de regresión lineal', () => {
  it('la recta inicial es ŷ ≈ 0.98 + 0.65·x, con MSE ≈ 0.10', () => {
    const line = fitLine(LR_INITIAL);
    expect(line.b0).toBeCloseTo(0.983, 3);
    expect(line.b1).toBeCloseTo(0.65, 3);
    expect(mse(LR_INITIAL, line)).toBeCloseTo(0.101, 3);
  });

  it('un solo outlier sube el MSE de 0.10 a 2.57 y baja la pendiente de 0.65 a 0.40 (simulador de la pestaña Fórmula, cifras citadas en Contras)', () => {
    const before = fitLine(LR_INITIAL);
    const points = [...LR_INITIAL, LR_OUTLIER];
    const line = fitLine(points);
    expect(line.b1).toBeCloseTo(0.397, 3);
    expect(mse(points, line)).toBeCloseTo(2.568, 3);
    // Los redondeos exactos que cita el texto de la pestaña Contras.
    expect(mse(LR_INITIAL, before).toFixed(2)).toBe('0.10');
    expect(mse(points, line).toFixed(2)).toBe('2.57');
    expect(before.b1.toFixed(2)).toBe('0.65');
    expect(line.b1.toFixed(2)).toBe('0.40');
    expect(Math.round(mse(points, line) / mse(LR_INITIAL, before))).toBe(25);
  });
});

describe('OVA de regresión logística', () => {
  const hits = (b0: number, b1: number) =>
    LOGISTIC_XS.filter((x, i) => (sigmoid(b0 + b1 * x) >= 0.5 ? 1 : 0) === LOGISTIC_YS[i]).length;

  it('con los valores iniciales (b₀ = −4, b₁ = 1) acierta 15 de 18', () => {
    expect(hits(-4, 1)).toBe(15);
  });

  it('«Mejor ajuste» llega al óptimo, es determinista y acierta 16 de 18', () => {
    const fit = fitLogistic1D(LOGISTIC_XS, LOGISTIC_YS);
    expect(fitLogistic1D(LOGISTIC_XS, LOGISTIC_YS)).toEqual(fit);
    expect(fit.b0).toBeCloseTo(-6.638, 3);
    expect(fit.b1).toBeCloseTo(1.946, 3);
    expect(-fit.b0 / fit.b1).toBeCloseTo(3.41, 2);
    // scikit-learn sin regularizar (penalty=None) da −6.63865 y 1.94644.
    expect(fit.b0).toBeCloseTo(-6.64, 2);
    expect(fit.b1).toBeCloseTo(1.95, 2);
    const b0 = snap(fit.b0, LOGISTIC_B0);
    const b1 = snap(fit.b1, LOGISTIC_B1);
    expect(b0).toBeCloseTo(-6.6, 5);
    expect(b1).toBeCloseTo(1.95, 5);
    expect(hits(b0, b1)).toBe(16);
  });

  it('ningún ajuste acierta los 18: las clases se solapan', () => {
    // La predicción depende solo de x: dos puntos con el mismo x reciben la
    // misma clase. Si hay un x presente en ambas clases (p. ej. x = 3), uno
    // de los dos falla siempre, sean cuales sean b0 y b1.
    const x = 3;
    const labelsAtX = new Set(LOGISTIC_YS.filter((_, i) => LOGISTIC_XS[i] === x));
    expect(labelsAtX).toEqual(new Set([0, 1]));
    const fit = fitLogistic1D(LOGISTIC_XS, LOGISTIC_YS);
    for (const [b0, b1] of [[fit.b0, fit.b1], [-4, 1], [-6.6, 1.95], [0, 0], [-10, 3], [4, -1]]) {
      expect(hits(b0, b1)).toBeLessThanOrEqual(17);
    }
  });
});

describe('OVA del árbol de decisión', () => {
  it.each([
    { depth: 0, leaves: 1, acc: 15 / 28 },
    { depth: 1, leaves: 2, acc: 24 / 28 },
    { depth: 2, leaves: 4, acc: 24 / 28 },
    { depth: 3, leaves: 6, acc: 26 / 28 },
    { depth: 4, leaves: 8, acc: 27 / 28 },
    { depth: 5, leaves: 9, acc: 1 },
  ])('profundidad $depth → $leaves hojas y $acc de acierto', ({ depth, leaves, acc }) => {
    const tree = buildTree(TREE_POINTS, depth);
    expect(countLeaves(tree)).toBe(leaves);
    expect(accuracy(tree, TREE_POINTS)).toBe(acc);
  });

  it('con 4 encierra el ruido de (8, 8); el de (3, 1.5) cae recién con 5', () => {
    expect(predictTree(buildTree(TREE_POINTS, 4), { x: 8, y: 8 })).toBe(0);
    expect(predictTree(buildTree(TREE_POINTS, 4), { x: 3, y: 1.5 })).toBe(0); // aún falla
    expect(predictTree(buildTree(TREE_POINTS, 5), { x: 3, y: 1.5 })).toBe(1);
  });
});

describe('OVA de KNN', () => {
  it.each([
    { k: 1, votes: [1, 0], winner: 0 },
    { k: 3, votes: [1, 2], winner: 1 },
    { k: 5, votes: [1, 4], winner: 1 },
    { k: 7, votes: [1, 6], winner: 1 },
    { k: 9, votes: [2, 7], winner: 1 },
    { k: 11, votes: [2, 9], winner: 1 },
    { k: 13, votes: [2, 11], winner: 1 },
    { k: 15, votes: [4, 11], winner: 1 },
  ])('k = $k desde la posición inicial → votos $votes', ({ k, votes, winner }) => {
    const result = knnVote(KNN_POINTS, KNN_START, k);
    expect(result.votes).toEqual(votes);
    expect(result.winner).toBe(winner);
  });
});
