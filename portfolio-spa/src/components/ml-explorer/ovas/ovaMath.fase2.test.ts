import { describe, expect, it } from 'vitest';
import {
  bestSplitOnAxis,
  boost,
  boostMse,
  buildForest,
  buildRandomTree,
  explainNaiveBayes,
  fitStump,
  forestAccuracy,
  forestPredict,
  forestVote,
  kernelValue,
  marginWidth,
  mulberry32,
  predictBoost,
  predictTree,
  supportVectors,
  svmAccuracy,
  svmDecision,
  svmWeights,
  tokenize,
  trainNaiveBayes,
  trainSvm,
  type LabeledPt,
} from './ovaMath';

describe('mulberry32', () => {
  it('con la misma semilla repite la secuencia; con otra, cambia', () => {
    const a = mulberry32(1);
    expect([a(), a(), a()]).toEqual([0.6270739405881613, 0.002735721180215478, 0.5274470399599522]);
    const b = mulberry32(1);
    expect(b()).toBe(0.6270739405881613);
    expect(mulberry32(2)()).not.toBe(0.6270739405881613);
  });

  it('da valores en [0, 1)', () => {
    const r = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

const fourCorners: LabeledPt[] = [
  { x: 1, y: 1, label: 0 },
  { x: 2, y: 1, label: 0 },
  { x: 1, y: 8, label: 1 },
  { x: 2, y: 9, label: 1 },
];

describe('bestSplitOnAxis', () => {
  it('encuentra el corte puro en y y ninguno útil en x', () => {
    expect(bestSplitOnAxis(fourCorners, 'y')).toEqual({ threshold: 4.5, score: 0 });
    expect(bestSplitOnAxis(fourCorners, 'x')?.score).toBe(0.5);
  });

  it('devuelve null si todos los valores del eje son iguales', () => {
    expect(bestSplitOnAxis([{ x: 1, y: 1, label: 0 }, { x: 1, y: 2, label: 1 }], 'x')).toBeNull();
  });
});

describe('buildRandomTree', () => {
  it('si el eje sorteado no sirve, prueba el otro', () => {
    // rng() = 0.1 < 0.5 → prueba x primero; x no mejora, así que corta en y.
    const tree = buildRandomTree(fourCorners, 3, () => 0.1);
    expect(tree.kind).toBe('split');
    if (tree.kind === 'split') {
      expect(tree.axis).toBe('y');
      expect(tree.threshold).toBe(4.5);
    }
  });

  it('respeta la profundidad 0 y los grupos puros', () => {
    expect(buildRandomTree(fourCorners, 0, () => 0.9).kind).toBe('leaf');
    expect(buildRandomTree(fourCorners.slice(0, 2), 5, () => 0.9).kind).toBe('leaf');
  });
});

describe('bosque', () => {
  it('es determinista y los primeros N árboles no dependen del total', () => {
    const big = buildForest(fourCorners, 10, 3, 7);
    expect(buildForest(fourCorners, 10, 3, 7)).toEqual(big);
    expect(buildForest(fourCorners, 4, 3, 7)).toEqual(big.slice(0, 4));
  });

  it('forestVote es la fracción de árboles que votan 1; con empate exacto gana la clase 0', () => {
    const leaf0 = { kind: 'leaf' as const, label: 0 as const, count: [1, 0] as [number, number] };
    const leaf1 = { kind: 'leaf' as const, label: 1 as const, count: [0, 1] as [number, number] };
    expect(forestVote([leaf0, leaf1, leaf1], { x: 0, y: 0 })).toBeCloseTo(2 / 3);
    expect(forestPredict([leaf0, leaf1], { x: 0, y: 0 })).toBe(0);
    expect(forestVote([], { x: 0, y: 0 })).toBe(0);
    expect(forestAccuracy([leaf1], fourCorners)).toBe(0.5);
  });

  it('cada árbol predice algo coherente con su muestra bootstrap', () => {
    for (const t of buildForest(fourCorners, 5, 3, 3)) expect([0, 1]).toContain(predictTree(t, { x: 1, y: 1 }));
  });
});

describe('gradient boosting', () => {
  it('fitStump elige el corte que separa los dos niveles', () => {
    expect(fitStump([0, 1, 2, 3], [1, 1, 5, 5])).toEqual({ threshold: 1.5, left: 1, right: 5 });
  });

  it('fitStump sin cortes posibles predice el promedio', () => {
    expect(fitStump([2, 2], [1, 3])).toEqual({ threshold: Infinity, left: 2, right: 2 });
  });

  it('con tasa 1 un solo tocón basta para un escalón; con tasa 0.5 queda a mitad de camino', () => {
    const xs = [0, 1, 2, 3];
    const ys = [1, 1, 5, 5];
    const full = boost(xs, ys, 1, 1);
    expect(full.base).toBe(3);
    expect(boostMse(full, xs, ys)).toBe(0);
    const half = boost(xs, ys, 1, 0.5);
    expect(predictBoost(half, 0)).toBe(2); // 3 + 0.5 · (−2)
    expect(boostMse(half, xs, ys)).toBe(1);
    // Cada paso nuevo corrige la mitad del residuo que queda.
    expect(boostMse(boost(xs, ys, 2, 0.5), xs, ys)).toBe(0.25);
  });

  it('predictBoost con steps = 0 es el promedio', () => {
    const m = boost([0, 1, 2, 3], [1, 1, 5, 5], 5, 0.3);
    expect(predictBoost(m, 0, 0)).toBe(3);
    expect(boostMse(m, [0, 1, 2, 3], [1, 1, 5, 5], 0)).toBe(4);
  });
});

describe('SVM', () => {
  const pair: LabeledPt[] = [
    { x: 0, y: 0, label: 0 },
    { x: 2, y: 0, label: 1 },
  ];

  it('kernelValue: producto punto y RBF', () => {
    expect(kernelValue({ kind: 'linear' }, { x: 1, y: 2 }, { x: 3, y: 4 })).toBe(11);
    expect(kernelValue({ kind: 'rbf', gamma: 0.5 }, { x: 0, y: 0 }, { x: 0, y: 2 })).toBeCloseTo(Math.exp(-2));
  });

  it('con dos puntos y C grande, la frontera pasa por el medio y el margen mide 2', () => {
    const m = trainSvm(pair, 100, { kind: 'linear' });
    expect(svmDecision(m, { x: 1, y: 5 })).toBeCloseTo(0, 6);
    expect(svmDecision(m, { x: 2, y: 0 })).toBeCloseTo(1, 6);
    expect(svmDecision(m, { x: 0, y: 0 })).toBeCloseTo(-1, 6);
    expect(svmWeights(m).x).toBeCloseTo(1, 6);
    expect(marginWidth(m)).toBeCloseTo(2, 6);
    expect(supportVectors(m)).toEqual([0, 1]);
    expect(svmAccuracy(m, pair)).toBe(1);
  });

  it('con C pequeño los α topan en C y el margen se ensancha', () => {
    const m = trainSvm(pair, 0.1, { kind: 'linear' });
    expect(m.alpha).toEqual([0.1, 0.1]);
    expect(marginWidth(m)).toBeCloseTo(10, 6);
  });

  it('respeta Σ αᵢ yᵢ = 0 y 0 ≤ αᵢ ≤ C', () => {
    const pts: LabeledPt[] = [
      { x: 1, y: 1, label: 0 },
      { x: 2, y: 2.5, label: 0 },
      { x: 3, y: 1, label: 0 },
      { x: 4, y: 4, label: 1 },
      { x: 5, y: 2, label: 1 },
      { x: 2.5, y: 2, label: 1 },
    ];
    for (const kernel of [{ kind: 'linear' } as const, { kind: 'rbf', gamma: 0.5 } as const]) {
      const m = trainSvm(pts, 1, kernel);
      const sum = m.alpha.reduce((s, a, i) => s + a * (pts[i].label ? 1 : -1), 0);
      expect(Math.abs(sum)).toBeLessThan(1e-9);
      for (const a of m.alpha) {
        expect(a).toBeGreaterThanOrEqual(0);
        expect(a).toBeLessThanOrEqual(1 + 1e-12);
      }
    }
  });
});

describe('Naive Bayes', () => {
  it('tokenize imita a CountVectorizer: minúsculas, sin signos, palabras de 2+ letras', () => {
    expect(tokenize('¡Excelente! Llegó a tiempo, 10/10 y')).toEqual(['excelente', 'llegó', 'tiempo', '10', '10']);
    expect(tokenize('')).toEqual([]);
  });

  it('con suavizado de Laplace, una palabra vista solo en una clase no anula la otra', () => {
    const model = trainNaiveBayes([
      { text: 'bueno bueno', label: 1 },
      { text: 'malo', label: 0 },
    ]);
    // Vocabulario de 2 palabras. P(bueno | pos) = (2 + 1) / (2 + 2); P(bueno | neg) = (0 + 1) / (1 + 2).
    expect(model.vocabulary).toEqual(['bueno', 'malo']);
    const e = explainNaiveBayes(model, 'bueno');
    expect(e.words[0].factor).toBeCloseTo((3 / 4) / (1 / 3));
    expect(e.priorOdds).toBe(1);
    expect(e.pPositive).toBeCloseTo(2.25 / 3.25);
  });

  it('una palabra desconocida no cambia nada; sin palabras queda el prior', () => {
    const model = trainNaiveBayes([
      { text: 'bueno', label: 1 },
      { text: 'malo', label: 0 },
      { text: 'malo malo', label: 0 },
    ]);
    const e = explainNaiveBayes(model, 'nuevo');
    expect(e.words).toEqual([{ word: 'nuevo', known: false, factor: 1 }]);
    expect(e.priorOdds).toBeCloseTo(0.5);
    expect(e.pPositive).toBeCloseTo(1 / 3);
  });
});
