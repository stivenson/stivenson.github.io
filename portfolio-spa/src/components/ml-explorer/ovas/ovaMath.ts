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
 * El mejor corte sobre un eje: punto medio entre valores consecutivos con la
 * menor impureza de Gini ponderada. null si todos los valores son iguales.
 */
export function bestSplitOnAxis(points: LabeledPt[], axis: 'x' | 'y'): { threshold: number; score: number } | null {
  const values = [...new Set(points.map((p) => p[axis]))].sort((a, b) => a - b);
  let best: { threshold: number; score: number } | null = null;
  for (let i = 0; i < values.length - 1; i++) {
    const threshold = (values[i] + values[i + 1]) / 2;
    const left = points.filter((p) => p[axis] <= threshold);
    const right = points.filter((p) => p[axis] > threshold);
    const score = (left.length * gini(countLabels(left)) + right.length * gini(countLabels(right))) / points.length;
    if (best === null || score < best.score - 1e-12) best = { threshold, score };
  }
  return best;
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
    const split = bestSplitOnAxis(points, axis);
    if (split !== null && (best === null || split.score < best.score - 1e-12)) best = { axis, ...split };
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

// ---------- Aleatoriedad reproducible ----------

/**
 * Generador pseudoaleatorio mulberry32: con la misma semilla da siempre la
 * misma secuencia de números en [0, 1). Las OVAs lo usan en lugar de
 * Math.random() para que el bosque (y las cifras que citan los textos) sea
 * el mismo en cada visita y en cada test.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Random Forest ----------

/**
 * Árbol del bosque: como buildTree, pero en cada nodo prueba primero un eje
 * elegido al azar (max_features = 1 con dos features) y solo si ese eje no
 * mejora la impureza prueba el otro. Así los árboles se parecen menos entre sí.
 */
export function buildRandomTree(points: LabeledPt[], maxDepth: number, rng: () => number): TreeNode {
  const count = countLabels(points);
  const leaf: TreeNode = { kind: 'leaf', label: count[1] > count[0] ? 1 : 0, count };
  if (maxDepth <= 0 || points.length < 2 || count[0] === 0 || count[1] === 0) return leaf;
  const axes: ('x' | 'y')[] = rng() < 0.5 ? ['x', 'y'] : ['y', 'x'];
  for (const axis of axes) {
    const split = bestSplitOnAxis(points, axis);
    if (split === null || split.score >= gini(count) - 1e-12) continue;
    const { threshold } = split;
    return {
      kind: 'split',
      axis,
      threshold,
      count,
      left: buildRandomTree(points.filter((p) => p[axis] <= threshold), maxDepth - 1, rng),
      right: buildRandomTree(points.filter((p) => p[axis] > threshold), maxDepth - 1, rng),
    };
  }
  return leaf;
}

/**
 * Bosque de `nTrees` árboles. Cada uno aprende de una muestra bootstrap
 * (n puntos sacados con reposición) y con ejes al azar. Todo sale de una sola
 * semilla: los primeros N árboles de un bosque de 100 son el bosque de N.
 */
export function buildForest(points: LabeledPt[], nTrees: number, maxDepth: number, seed: number): TreeNode[] {
  const rng = mulberry32(seed);
  const trees: TreeNode[] = [];
  for (let t = 0; t < nTrees; t++) {
    const sample = points.map(() => points[Math.floor(rng() * points.length)]);
    trees.push(buildRandomTree(sample, maxDepth, rng));
  }
  return trees;
}

/** Fracción de árboles que votan «clase 1» en el punto p. */
export function forestVote(trees: TreeNode[], p: Pt): number {
  if (trees.length === 0) return 0;
  return trees.reduce((s, t) => s + predictTree(t, p), 0) / trees.length;
}

/** Clase del bosque: mayoría; con empate exacto, clase 0. */
export function forestPredict(trees: TreeNode[], p: Pt): 0 | 1 {
  return forestVote(trees, p) > 0.5 ? 1 : 0;
}

export function forestAccuracy(trees: TreeNode[], points: LabeledPt[]): number {
  if (points.length === 0) return 0;
  return points.filter((p) => forestPredict(trees, p) === p.label).length / points.length;
}

// ---------- Gradient Boosting ----------

/** Un «tocón»: árbol de regresión de un solo corte. */
export interface Stump {
  threshold: number;
  left: number;
  right: number;
}

/** El corte que más reduce la suma de errores al cuadrado de `ys`. */
export function fitStump(xs: number[], ys: number[]): Stump {
  const mean = (v: number[]) => (v.length ? v.reduce((s, a) => s + a, 0) / v.length : 0);
  const values = [...new Set(xs)].sort((a, b) => a - b);
  let best: (Stump & { sse: number }) | null = null;
  for (let i = 0; i < values.length - 1; i++) {
    const threshold = (values[i] + values[i + 1]) / 2;
    const l = ys.filter((_, k) => xs[k] <= threshold);
    const r = ys.filter((_, k) => xs[k] > threshold);
    const left = mean(l);
    const right = mean(r);
    const sse = l.reduce((s, y) => s + (y - left) ** 2, 0) + r.reduce((s, y) => s + (y - right) ** 2, 0);
    if (best === null || sse < best.sse - 1e-12) best = { threshold, left, right, sse };
  }
  if (best === null) return { threshold: Infinity, left: mean(ys), right: mean(ys) };
  return { threshold: best.threshold, left: best.left, right: best.right };
}

export interface BoostModel {
  /** Predicción inicial: el promedio de y. */
  base: number;
  learningRate: number;
  stumps: Stump[];
}

/**
 * Gradient boosting para regresión con pérdida cuadrática: cada tocón se
 * ajusta a los residuos de la suma anterior y entra multiplicado por la
 * tasa de aprendizaje.
 */
export function boost(xs: number[], ys: number[], nSteps: number, learningRate: number): BoostModel {
  const base = ys.length ? ys.reduce((s, y) => s + y, 0) / ys.length : 0;
  const pred = xs.map(() => base);
  const stumps: Stump[] = [];
  for (let m = 0; m < nSteps; m++) {
    const residuals = ys.map((y, i) => y - pred[i]);
    const s = fitStump(xs, residuals);
    stumps.push(s);
    for (let i = 0; i < xs.length; i++) pred[i] += learningRate * (xs[i] <= s.threshold ? s.left : s.right);
  }
  return { base, learningRate, stumps };
}

/** Predicción usando solo los primeros `steps` tocones (por defecto, todos). */
export function predictBoost(model: BoostModel, x: number, steps = model.stumps.length): number {
  let y = model.base;
  for (const s of model.stumps.slice(0, steps)) y += model.learningRate * (x <= s.threshold ? s.left : s.right);
  return y;
}

export function boostMse(model: BoostModel, xs: number[], ys: number[], steps = model.stumps.length): number {
  if (xs.length === 0) return 0;
  return xs.reduce((s, x, i) => s + (ys[i] - predictBoost(model, x, steps)) ** 2, 0) / xs.length;
}

// ---------- SVM ----------

export type Kernel = { kind: 'linear' } | { kind: 'rbf'; gamma: number };

export function kernelValue(k: Kernel, a: Pt, b: Pt): number {
  if (k.kind === 'linear') return a.x * b.x + a.y * b.y;
  return Math.exp(-k.gamma * ((a.x - b.x) ** 2 + (a.y - b.y) ** 2));
}

export interface SvmModel {
  kernel: Kernel;
  points: LabeledPt[];
  /** Multiplicadores de Lagrange αᵢ (0 ≤ αᵢ ≤ C). αᵢ > 0 ⇔ vector de soporte. */
  alpha: number[];
  /** Sesgo: f(x) = Σ αᵢ yᵢ K(xᵢ, x) + b. */
  b: number;
}

const sign = (label: 0 | 1) => (label === 1 ? 1 : -1);

/**
 * SVM de margen suave resuelto con SMO (el método de LIBSVM, que es lo que
 * usa scikit-learn por dentro): en cada paso elige el par de αᵢ que más viola
 * las condiciones de óptimo y lo optimiza de forma exacta. Determinista: no
 * hay elecciones al azar.
 */
export function trainSvm(points: LabeledPt[], C: number, kernel: Kernel, tol = 1e-6, maxIterations = 1_000_000): SvmModel {
  const n = points.length;
  const y = points.map((p) => sign(p.label));
  const K = points.map((a) => points.map((b) => kernelValue(kernel, a, b)));
  const alpha = new Array<number>(n).fill(0);
  const G = new Array<number>(n).fill(-1); // gradiente del dual: (Qα)ᵢ − 1
  const isUp = (t: number) => (y[t] === 1 ? alpha[t] < C : alpha[t] > 0);
  const isLow = (t: number) => (y[t] === 1 ? alpha[t] > 0 : alpha[t] < C);

  for (let it = 0; it < maxIterations; it++) {
    let i = -1;
    let j = -1;
    let gMax = -Infinity;
    let gMin = Infinity;
    for (let t = 0; t < n; t++) {
      const v = -y[t] * G[t];
      if (isUp(t) && v > gMax) {
        gMax = v;
        i = t;
      }
      if (isLow(t) && v < gMin) {
        gMin = v;
        j = t;
      }
    }
    if (i < 0 || j < 0 || gMax - gMin < tol) break;

    const quad = Math.max(K[i][i] + K[j][j] - 2 * K[i][j], 1e-12);
    const oldI = alpha[i];
    const oldJ = alpha[j];
    // Paso exacto sobre la recta yᵢαᵢ + yⱼαⱼ = constante, recortado a la caja [0, C].
    let ai = oldI + (y[i] * (gMax - gMin)) / quad;
    const s = y[i] * oldI + y[j] * oldJ;
    ai = Math.min(C, Math.max(0, ai));
    let aj = y[j] * (s - y[i] * ai);
    if (aj < 0 || aj > C) {
      aj = Math.min(C, Math.max(0, aj));
      ai = y[i] * (s - y[j] * aj);
    }
    alpha[i] = ai;
    alpha[j] = aj;
    const di = ai - oldI;
    const dj = aj - oldJ;
    for (let t = 0; t < n; t++) G[t] += y[t] * (y[i] * K[t][i] * di + y[j] * K[t][j] * dj);
  }

  // Sesgo como en LIBSVM: promedio sobre los vectores libres (0 < α < C);
  // si no hay, el punto medio del intervalo permitido.
  let sum = 0;
  let free = 0;
  let ub = Infinity;
  let lb = -Infinity;
  for (let t = 0; t < n; t++) {
    const yG = y[t] * G[t];
    if (alpha[t] > 1e-9 && alpha[t] < C - 1e-9) {
      sum += yG;
      free++;
    } else if ((y[t] === 1 && alpha[t] <= 1e-9) || (y[t] === -1 && alpha[t] >= C - 1e-9)) {
      ub = Math.min(ub, yG);
    } else {
      lb = Math.max(lb, yG);
    }
  }
  const rho = free > 0 ? sum / free : (ub + lb) / 2;
  return { kernel, points, alpha, b: -rho };
}

/** f(x): positivo → clase 1; |f(x)| = 1 son los bordes del margen. */
export function svmDecision(m: SvmModel, p: Pt): number {
  let f = m.b;
  for (let i = 0; i < m.points.length; i++) {
    if (m.alpha[i] > 0) f += m.alpha[i] * sign(m.points[i].label) * kernelValue(m.kernel, m.points[i], p);
  }
  return f;
}

/** Índices de los vectores de soporte (α > 1e-8). */
export function supportVectors(m: SvmModel): number[] {
  return m.alpha.flatMap((a, i) => (a > 1e-8 ? [i] : []));
}

/** Solo kernel lineal: w = Σ αᵢ yᵢ xᵢ. */
export function svmWeights(m: SvmModel): Pt {
  let wx = 0;
  let wy = 0;
  m.alpha.forEach((a, i) => {
    wx += a * sign(m.points[i].label) * m.points[i].x;
    wy += a * sign(m.points[i].label) * m.points[i].y;
  });
  return { x: wx, y: wy };
}

/** Solo kernel lineal: ancho del margen, 2 / ‖w‖. */
export function marginWidth(m: SvmModel): number {
  const w = svmWeights(m);
  return 2 / Math.hypot(w.x, w.y);
}

export function svmAccuracy(m: SvmModel, points: LabeledPt[]): number {
  if (points.length === 0) return 0;
  return points.filter((p) => (svmDecision(m, p) > 0 ? 1 : 0) === p.label).length / points.length;
}

// ---------- Naive Bayes ----------

/** Como CountVectorizer de scikit-learn: minúsculas y palabras de 2+ letras. */
export function tokenize(text: string): string[] {
  return (text.normalize('NFC').toLowerCase().match(/[\p{L}\p{M}\p{N}_]+/gu) ?? []).filter(
    (w) => [...w].length >= 2,
  );
}

export interface NaiveBayesModel {
  vocabulary: string[];
  /** log P(clase), [negativa, positiva]. */
  logPrior: [number, number];
  /** log P(palabra | clase) por palabra, con suavizado de Laplace. */
  logLikelihood: Map<string, [number, number]>;
}

/** MultinomialNB con suavizado alpha (1 = Laplace), igual que scikit-learn. */
export function trainNaiveBayes(docs: { text: string; label: 0 | 1 }[], alpha = 1): NaiveBayesModel {
  const counts = new Map<string, [number, number]>();
  const docsPerClass: [number, number] = [0, 0];
  const wordsPerClass: [number, number] = [0, 0];
  for (const d of docs) {
    docsPerClass[d.label]++;
    for (const w of tokenize(d.text)) {
      const c = counts.get(w) ?? [0, 0];
      c[d.label]++;
      counts.set(w, c);
      wordsPerClass[d.label]++;
    }
  }
  const vocabulary = [...counts.keys()].sort();
  const V = vocabulary.length;
  const logLikelihood = new Map<string, [number, number]>();
  for (const w of vocabulary) {
    const c = counts.get(w)!;
    logLikelihood.set(w, [
      Math.log((c[0] + alpha) / (wordsPerClass[0] + alpha * V)),
      Math.log((c[1] + alpha) / (wordsPerClass[1] + alpha * V)),
    ]);
  }
  const n = docs.length;
  return { vocabulary, logPrior: [Math.log(docsPerClass[0] / n), Math.log(docsPerClass[1] / n)], logLikelihood };
}

export interface WordEvidence {
  word: string;
  /** false: la palabra no estaba en el entrenamiento y se ignora. */
  known: boolean;
  /** Por cuánto multiplica los odds de «positiva»: P(w | pos) / P(w | neg). */
  factor: number;
}

export interface NaiveBayesExplanation {
  words: WordEvidence[];
  /** Odds a priori: P(pos) / P(neg). */
  priorOdds: number;
  /** P(positiva | texto). */
  pPositive: number;
}

/** Explica la predicción palabra por palabra: odds finales = odds a priori × Π factores. */
export function explainNaiveBayes(model: NaiveBayesModel, text: string): NaiveBayesExplanation {
  let logOdds = model.logPrior[1] - model.logPrior[0];
  const priorOdds = Math.exp(logOdds);
  const words = tokenize(text).map((word) => {
    const ll = model.logLikelihood.get(word);
    if (!ll) return { word, known: false, factor: 1 };
    logOdds += ll[1] - ll[0];
    return { word, known: true, factor: Math.exp(ll[1] - ll[0]) };
  });
  return { words, priorOdds, pPositive: 1 / (1 + Math.exp(-logOdds)) };
}
