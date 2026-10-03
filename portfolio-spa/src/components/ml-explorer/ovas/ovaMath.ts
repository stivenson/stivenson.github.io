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

/**
 * Regresión logística de una variable por el método de Newton.
 *
 * Usa la curvatura además de la pendiente de la pérdida, así que llega al
 * óptimo en unas 8 iteraciones y no depende de una tasa de aprendizaje.
 * Lleva una regularización L2 mínima (`lambda`) solo sobre b1: con clases
 * separables hace finito el óptimo (sin ella b1 → ∞ y Newton da NaN); con
 * clases solapadas cambia el resultado en menos de 0.001.
 *
 * Precondición: al menos 2 puntos y ambas clases presentes. Sin eso no hay
 * frontera que ajustar (b0 no se penaliza y el hessiano se vuelve singular),
 * así que devuelve la recta neutra `{ b0: 0, b1: 0 }` (P = 0.5 en todas partes).
 */
export function fitLogistic1D(
  xs: number[],
  ys: number[],
  lambda = 1e-4,
  maxIterations = 100,
  tolerance = 1e-12,
): Line {
  if (xs.length < 2 || !ys.includes(0) || !ys.includes(1)) return { b0: 0, b1: 0 };
  let b0 = 0;
  let b1 = 0;
  for (let it = 0; it < maxIterations; it++) {
    let g0 = 0;
    let g1 = lambda * b1;
    let h00 = 0;
    let h01 = 0;
    let h11 = lambda;
    for (let i = 0; i < xs.length; i++) {
      const p = sigmoid(b0 + b1 * xs[i]);
      const e = p - ys[i];
      const w = p * (1 - p);
      g0 += e;
      g1 += e * xs[i];
      h00 += w;
      h01 += w * xs[i];
      h11 += w * xs[i] * xs[i];
    }
    const det = h00 * h11 - h01 * h01;
    if (!(Math.abs(det) > 1e-300)) break;
    const d0 = (h11 * g0 - h01 * g1) / det;
    const d1 = (h00 * g1 - h01 * g0) / det;
    b0 -= d0;
    b1 -= d1;
    if (Math.abs(d0) + Math.abs(d1) < tolerance) break;
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
  const top = order.slice(0, Math.max(0, Math.min(k, points.length)));
  if (top.length === 0) return { neighbors: [], votes: [0, 0], winner: 0, radius: 0 };
  const votes: [number, number] = [0, 0];
  for (const t of top) votes[points[t.i].label]++;
  const winner: 0 | 1 = votes[0] === votes[1] ? points[top[0].i].label : votes[1] > votes[0] ? 1 : 0;
  return { neighbors: top.map((t) => t.i), votes, winner, radius: top[top.length - 1].d };
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
