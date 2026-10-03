import { describe, expect, it } from 'vitest';
import {
  accuracy,
  buildTree,
  fitLine,
  fitLogistic1D,
  countLeaves,
  gini,
  knnVote,
  logit,
  mse,
  predictTree,
  sigmoid,
  snap,
  treeRegions,
  type LabeledPt,
  type TreeNode,
} from './ovaMath';
import { LOGISTIC_XS, LOGISTIC_YS } from './datasets';

describe('regresión lineal', () => {
  it('fitLine recupera una recta exacta', () => {
    const line = fitLine([{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }]);
    expect(line.b0).toBeCloseTo(1);
    expect(line.b1).toBeCloseTo(2);
  });

  it('fitLine con todas las x iguales devuelve la media horizontal', () => {
    expect(fitLine([{ x: 2, y: 1 }, { x: 2, y: 3 }])).toEqual({ b0: 2, b1: 0 });
  });

  it('mse promedia los residuos al cuadrado', () => {
    const points = [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 5 }];
    expect(mse(points, { b0: 1, b1: 1 })).toBeCloseTo(4 / 3);
  });
});

describe('regresión logística', () => {
  it('sigmoid y logit son inversas', () => {
    expect(sigmoid(0)).toBe(0.5);
    expect(logit(sigmoid(1.3))).toBeCloseTo(1.3);
  });

  it('fitLogistic1D pone la frontera entre las dos clases', () => {
    const { b0, b1 } = fitLogistic1D([0, 1, 2, 3], [0, 0, 1, 1]);
    expect(b1).toBeGreaterThan(0);
    // Datos separables: la frontera exacta es el punto medio entre x=1 y x=2.
    expect(Number.isFinite(b0)).toBe(true);
    expect(Number.isFinite(b1)).toBe(true);
    expect(-b0 / b1).toBeCloseTo(1.5, 6);
  });

  it('llega al óptimo: el gradiente penalizado es ~0', () => {
    const lambda = 1e-4;
    const { b0, b1 } = fitLogistic1D(LOGISTIC_XS, LOGISTIC_YS, lambda);
    let g0 = 0;
    let g1 = lambda * b1;
    LOGISTIC_XS.forEach((x, i) => {
      const e = sigmoid(b0 + b1 * x) - LOGISTIC_YS[i];
      g0 += e;
      g1 += e * x;
    });
    expect(Math.abs(g0)).toBeLessThan(1e-9);
    expect(Math.abs(g1)).toBeLessThan(1e-9);
  });

  it('es determinista', () => {
    expect(fitLogistic1D(LOGISTIC_XS, LOGISTIC_YS)).toEqual(fitLogistic1D(LOGISTIC_XS, LOGISTIC_YS));
  });
});

describe('KNN', () => {
  const points: LabeledPt[] = [
    { x: 0, y: 0, label: 0 },
    { x: 1, y: 0, label: 0 },
    { x: 0, y: 1, label: 1 },
    { x: 5, y: 5, label: 1 },
  ];

  it('elige los k más cercanos y cuenta los votos', () => {
    const r = knnVote(points, { x: 0.1, y: 0.1 }, 3);
    expect(r.neighbors).toEqual([0, 1, 2]);
    expect(r.votes).toEqual([2, 1]);
    expect(r.winner).toBe(0);
    expect(r.radius).toBeCloseTo(Math.hypot(0.9, 0.1));
  });

  it('en empate gana la clase del vecino más cercano', () => {
    const tie: LabeledPt[] = [
      { x: 0, y: 0, label: 1 },
      { x: 1, y: 0, label: 0 },
    ];
    expect(knnVote(tie, { x: 0.2, y: 0 }, 2).winner).toBe(1);
  });

  it('con lista vacía o k <= 0 no lanza y devuelve un resultado vacío', () => {
    const empty = { neighbors: [], votes: [0, 0], winner: 0, radius: 0 };
    expect(knnVote([], { x: 0, y: 0 }, 3)).toEqual(empty);
    expect(knnVote(points, { x: 0, y: 0 }, 0)).toEqual(empty);
    expect(knnVote(points, { x: 0, y: 0 }, -2)).toEqual(empty);
  });

  it('con k mayor que n devuelve los n puntos', () => {
    expect(knnVote(points, { x: 0.1, y: 0.1 }, 10).neighbors).toHaveLength(4);
  });
});

describe('árbol de decisión', () => {
  const separable: LabeledPt[] = [
    { x: 1, y: 1, label: 0 },
    { x: 2, y: 1, label: 0 },
    { x: 8, y: 1, label: 1 },
    { x: 9, y: 1, label: 1 },
  ];

  it('con profundidad 0 es una hoja con la clase mayoritaria', () => {
    const tree = buildTree([...separable, { x: 3, y: 1, label: 0 }], 0);
    expect(tree).toEqual({ kind: 'leaf', label: 0, count: [3, 2] });
  });

  it('encuentra el corte que separa las clases', () => {
    const tree = buildTree(separable, 1);
    expect(tree.kind).toBe('split');
    if (tree.kind !== 'split') return;
    expect(tree.axis).toBe('x');
    expect(tree.threshold).toBe(5);
    expect(accuracy(tree, separable)).toBe(1);
  });

  it('no corta un grupo que ya es puro', () => {
    const pure = separable.filter((p) => p.label === 0);
    expect(buildTree(pure, 3).kind).toBe('leaf');
  });

  it('treeRegions convierte el árbol en rectángulos', () => {
    const regions = treeRegions(buildTree(separable, 1), { x0: 0, x1: 10, y0: 0, y1: 10 });
    expect(regions).toEqual([
      { x0: 0, x1: 5, y0: 0, y1: 10, label: 0 },
      { x0: 5, x1: 10, y0: 0, y1: 10, label: 1 },
    ]);
  });
});

// Los ejemplos con números de las pestañas «Fórmula» se calculan con estas
// mismas funciones: si el texto y el cálculo se separan, falla aquí.
describe('predictTree y countLeaves', () => {
  const tree: TreeNode = {
    kind: 'split',
    axis: 'x',
    threshold: 5,
    count: [2, 2],
    left: { kind: 'leaf', label: 0, count: [2, 0] },
    right: {
      kind: 'split',
      axis: 'y',
      threshold: 3,
      count: [0, 2],
      left: { kind: 'leaf', label: 1, count: [0, 1] },
      right: { kind: 'leaf', label: 0, count: [0, 1] },
    },
  };

  it('predictTree sigue los cortes (<= va a la izquierda)', () => {
    expect(predictTree(tree, { x: 5, y: 9 })).toBe(0);
    expect(predictTree(tree, { x: 6, y: 3 })).toBe(1);
    expect(predictTree(tree, { x: 6, y: 3.1 })).toBe(0);
  });

  it('countLeaves cuenta las hojas', () => {
    expect(countLeaves(tree)).toBe(3);
    expect(countLeaves({ kind: 'leaf', label: 0, count: [1, 0] })).toBe(1);
  });
});

describe('ejemplos numéricos del texto', () => {
  it('Gini: 5 y 5 → 0.5; 4 y 1 → 0.32 (Decision Tree)', () => {
    expect(gini([5, 5])).toBeCloseTo(0.5);
    expect(gini([4, 1])).toBeCloseTo(0.32);
  });

  it('sigmoide: z = 0 → 0.5 y z = 3 → ≈ 0.95 (Logistic Regression)', () => {
    expect(sigmoid(0)).toBe(0.5);
    expect(sigmoid(3)).toBeCloseTo(0.9526, 4);
  });

  it('distancia entre (6, 7) y (7, 8) ≈ 1.41 (KNN)', () => {
    expect(knnVote([{ x: 7, y: 8, label: 1 }], { x: 6, y: 7 }, 1).radius).toBeCloseTo(1.41, 2);
  });
});

describe('snap', () => {
  it('ajusta un valor al paso y al rango de un slider', () => {
    expect(snap(1.6815, { min: -1, max: 3, step: 0.05 })).toBeCloseTo(1.7);
    expect(snap(-12, { min: -10, max: 4, step: 0.1 })).toBe(-10);
  });
});
