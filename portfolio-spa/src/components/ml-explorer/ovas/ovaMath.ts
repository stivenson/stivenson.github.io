export interface Pt {
  x: number;
  y: number;
}

export interface LabeledPt extends Pt {
  label: 0 | 1;
}

export interface Line {
  b0: number;
  b1: number;
}

// ---------- Regresión lineal ----------

/** Mínimos cuadrados con una sola variable. */
export function fitLine(points: Pt[]): Line {
  const n = points.length;
  if (n === 0) return { b0: 0, b1: 0 };
  const mx = points.reduce((s, p) => s + p.x, 0) / n;
  const my = points.reduce((s, p) => s + p.y, 0) / n;
  let sxy = 0;
  let sxx = 0;
  for (const p of points) {
    sxy += (p.x - mx) * (p.y - my);
    sxx += (p.x - mx) ** 2;
  }
  const b1 = sxx === 0 ? 0 : sxy / sxx;
  return { b0: my - b1 * mx, b1 };
}

export function mse(points: Pt[], line: Line): number {
  if (points.length === 0) return 0;
  return points.reduce((s, p) => s + (p.y - (line.b0 + line.b1 * p.x)) ** 2, 0) / points.length;
}

// ---------- Regresión logística ----------

export function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

export function logit(p: number): number {
  return Math.log(p / (1 - p));
}

export interface SliderRange {
  min: number;
  max: number;
  step: number;
}

/** Redondea al paso de un slider y lo limita a su rango. */
export function snap(v: number, { min, max, step }: SliderRange): number {
  return Math.min(max, Math.max(min, Math.round(v / step) * step));
}

/** Descenso de gradiente sobre la pérdida logística (una variable). */
export function fitLogistic1D(xs: number[], ys: number[], iterations = 5000, lr = 0.05): Line {
  let b0 = 0;
  let b1 = 0;
  const n = xs.length;
  for (let it = 0; it < iterations; it++) {
    let g0 = 0;
    let g1 = 0;
    for (let i = 0; i < n; i++) {
      const e = sigmoid(b0 + b1 * xs[i]) - ys[i];
      g0 += e;
      g1 += e * xs[i];
    }
    b0 -= (lr * g0) / n;
    b1 -= (lr * g1) / n;
  }
  return { b0, b1 };
}

// ---------- KNN ----------

export interface KnnResult {
  /** Índices de los k vecinos, del más cercano al más lejano. */
  neighbors: number[];
  /** Votos por clase: [clase 0, clase 1]. */
  votes: [number, number];
  winner: 0 | 1;
  /** Distancia al k-ésimo vecino (radio del círculo que los contiene). */
  radius: number;
}

export function knnVote(points: LabeledPt[], query: Pt, k: number): KnnResult {
  const order = points
    .map((p, i) => ({ i, d: Math.hypot(p.x - query.x, p.y - query.y) }))
    .sort((a, b) => a.d - b.d || a.i - b.i);
  const top = order.slice(0, Math.min(k, points.length));
  const votes: [number, number] = [0, 0];
  for (const t of top) votes[points[t.i].label]++;
  const winner: 0 | 1 = votes[0] === votes[1] ? points[top[0].i].label : votes[1] > votes[0] ? 1 : 0;
  return { neighbors: top.map((t) => t.i), votes, winner, radius: top.length ? top[top.length - 1].d : 0 };
}

// ---------- Árbol de decisión ----------

export type TreeNode =
  | { kind: 'leaf'; label: 0 | 1; count: [number, number] }
  | { kind: 'split'; axis: 'x' | 'y'; threshold: number; count: [number, number]; left: TreeNode; right: TreeNode };

export interface Bounds {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface Region extends Bounds {
  label: 0 | 1;
}

function countLabels(points: LabeledPt[]): [number, number] {
  const c: [number, number] = [0, 0];
  for (const p of points) c[p.label]++;
  return c;
}

/** 0 si el grupo es de una sola clase; 0.5 si está mitad y mitad. */
export function gini([a, b]: [number, number]): number {
  const n = a + b;
  if (n === 0) return 0;
  const p = b / n;
  return 1 - p * p - (1 - p) * (1 - p);
}

/**
 * Árbol CART con impureza de Gini, cortes en el punto medio entre valores
 * consecutivos. Se detiene si llega a la profundidad, si el grupo es puro o
 * si ningún corte mejora la impureza.
 */
export function buildTree(points: LabeledPt[], maxDepth: number): TreeNode {
  const count = countLabels(points);
  const leaf: TreeNode = { kind: 'leaf', label: count[1] > count[0] ? 1 : 0, count };
  if (maxDepth <= 0 || points.length < 2 || count[0] === 0 || count[1] === 0) return leaf;

  let best: { axis: 'x' | 'y'; threshold: number; score: number } | null = null;
  for (const axis of ['x', 'y'] as const) {
    const values = [...new Set(points.map((p) => p[axis]))].sort((a, b) => a - b);
    for (let i = 0; i < values.length - 1; i++) {
      const threshold = (values[i] + values[i + 1]) / 2;
      const left = points.filter((p) => p[axis] <= threshold);
      const right = points.filter((p) => p[axis] > threshold);
      const score = (left.length * gini(countLabels(left)) + right.length * gini(countLabels(right))) / points.length;
      if (best === null || score < best.score - 1e-12) best = { axis, threshold, score };
    }
  }
  if (best === null || best.score >= gini(count) - 1e-12) return leaf;

  const { axis, threshold } = best;
  return {
    kind: 'split',
    axis,
    threshold,
    count,
    left: buildTree(points.filter((p) => p[axis] <= threshold), maxDepth - 1),
    right: buildTree(points.filter((p) => p[axis] > threshold), maxDepth - 1),
  };
}

export function predictTree(node: TreeNode, p: Pt): 0 | 1 {
  if (node.kind === 'leaf') return node.label;
  return predictTree(p[node.axis] <= node.threshold ? node.left : node.right, p);
}

export function accuracy(node: TreeNode, points: LabeledPt[]): number {
  if (points.length === 0) return 0;
  return points.filter((p) => predictTree(node, p) === p.label).length / points.length;
}

export function countLeaves(node: TreeNode): number {
  return node.kind === 'leaf' ? 1 : countLeaves(node.left) + countLeaves(node.right);
}

export function treeRegions(node: TreeNode, b: Bounds): Region[] {
  if (node.kind === 'leaf') return [{ ...b, label: node.label }];
  if (node.axis === 'x') {
    return [
      ...treeRegions(node.left, { ...b, x1: node.threshold }),
      ...treeRegions(node.right, { ...b, x0: node.threshold }),
    ];
  }
  return [
    ...treeRegions(node.left, { ...b, y1: node.threshold }),
    ...treeRegions(node.right, { ...b, y0: node.threshold }),
  ];
}
