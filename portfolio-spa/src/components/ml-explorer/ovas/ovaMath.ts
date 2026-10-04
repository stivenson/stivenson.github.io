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
  // Con una sola clase uno de los dos extremos queda infinito: se usa el otro (o 0) para que b sea finito.
  const mid = Number.isFinite(ub) && Number.isFinite(lb) ? (ub + lb) / 2 : Number.isFinite(ub) ? ub : Number.isFinite(lb) ? lb : 0;
  const rho = free > 0 ? sum / free : mid;
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

/**
 * Como CountVectorizer de scikit-learn: minúsculas y palabras de 2+ letras.
 * NFC junta letra + tilde combinante («e» + «´» → «é») para que la misma palabra
 * escrita de dos formas cuente igual; \p{M} cubre las marcas que NFC no puede
 * componer, para que no partan la palabra en dos.
 */
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
  // Sin documentos no hay prior que estimar: se asume empate (evita log(0 / 0) = NaN).
  const prior = (c: 0 | 1) => (n === 0 ? Math.log(0.5) : Math.log(docsPerClass[c] / n));
  return { vocabulary, logPrior: [prior(0), prior(1)], logLikelihood };
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

// ---------- Distancias (fase 3) ----------

export function sqDist(a: Pt, b: Pt): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

export function dist(a: Pt, b: Pt): number {
  return Math.sqrt(sqDist(a, b));
}

// ---------- K-Means ----------

/** Índice del centroide más cercano; con empate gana el de índice menor. */
export function nearestCentroid(p: Pt, centroids: Pt[]): number {
  let best = 0;
  for (let c = 1; c < centroids.length; c++) if (sqDist(p, centroids[c]) < sqDist(p, centroids[best])) best = c;
  return best;
}

/**
 * Centroides iniciales: k puntos distintos de los datos, sorteados con `rng`
 * (el init="random" de scikit-learn). Con semilla fija, siempre los mismos.
 */
export function randomInit(points: Pt[], k: number, rng: () => number): Pt[] {
  const idx = points.map((_, i) => i);
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(rng() * (idx.length - i));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, k).map((i) => ({ x: points[i].x, y: points[i].y }));
}

export interface KMeansState {
  centroids: Pt[];
  labels: number[];
  /** Suma de distancias² de cada punto a su centroide. */
  inertia: number;
}

function assign(points: Pt[], centroids: Pt[]): KMeansState {
  const labels = points.map((p) => nearestCentroid(p, centroids));
  const inertia = points.reduce((s, p, i) => s + sqDist(p, centroids[labels[i]]), 0);
  return { centroids, labels, inertia };
}

/**
 * Algoritmo de Lloyd paso a paso. El estado 0 son los centroides iniciales
 * con su asignación; cada estado siguiente mueve cada centroide al promedio
 * de sus puntos y reasigna. Para cuando ninguna asignación cambia (igual que
 * KMeans(init=…, n_init=1, algorithm="lloyd") de scikit-learn). Un grupo que
 * se queda sin puntos conserva su centroide.
 */
export function kmeansRun(points: Pt[], init: Pt[], maxIterations = 100): KMeansState[] {
  const states = [assign(points, init)];
  for (let it = 0; it < maxIterations; it++) {
    const prev = states[states.length - 1];
    const centroids = prev.centroids.map((c, j) => {
      const mine = points.filter((_, i) => prev.labels[i] === j);
      if (mine.length === 0) return c;
      return { x: mine.reduce((s, p) => s + p.x, 0) / mine.length, y: mine.reduce((s, p) => s + p.y, 0) / mine.length };
    });
    const next = assign(points, centroids);
    states.push(next);
    if (next.labels.every((l, i) => l === prev.labels[i])) break;
  }
  return states;
}

/**
 * Silueta media: para cada punto, a = distancia media a los de su grupo y
 * b = distancia media al grupo vecino más cercano; s = (b − a) / max(a, b).
 * Un punto solo en su grupo vale 0 (como silhouette_score de scikit-learn).
 */
export function silhouette(points: Pt[], labels: number[]): number {
  const groups = [...new Set(labels)];
  if (groups.length < 2) return 0;
  let total = 0;
  points.forEach((p, i) => {
    const mean = (g: number) => {
      const others = points.filter((_, j) => labels[j] === g && j !== i);
      return others.reduce((s, q) => s + dist(p, q), 0) / others.length;
    };
    if (labels.filter((l) => l === labels[i]).length === 1) return;
    const a = mean(labels[i]);
    const b = Math.min(...groups.filter((g) => g !== labels[i]).map(mean));
    total += (b - a) / Math.max(a, b);
  });
  return total / points.length;
}

// ---------- Agrupamiento jerárquico (enlace promedio) ----------

export interface Merge {
  /** Grupos que se unen: 0…n−1 son los puntos; n + i es el grupo creado en la unión i (como scipy). */
  a: number;
  b: number;
  /** Distancia a la que se unen: promedio de las distancias entre sus puntos. */
  height: number;
  size: number;
}

/**
 * Agrupamiento aglomerativo con enlace promedio (UPGMA): empieza con cada
 * punto solo y en cada paso une los dos grupos más cercanos. Da las mismas
 * uniones que linkage(points, "average") de scipy.
 */
export function averageLinkage(points: Pt[]): Merge[] {
  const n = points.length;
  let clusters = points.map((_, i) => ({ id: i, members: [i] }));
  const merges: Merge[] = [];
  const avg = (A: number[], B: number[]) => {
    let s = 0;
    for (const i of A) for (const j of B) s += dist(points[i], points[j]);
    return s / (A.length * B.length);
  };
  while (clusters.length > 1) {
    let best = { i: 0, j: 1, d: Infinity };
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const d = avg(clusters[i].members, clusters[j].members);
        if (d < best.d) best = { i, j, d };
      }
    }
    const A = clusters[best.i];
    const B = clusters[best.j];
    const members = [...A.members, ...B.members];
    merges.push({ a: Math.min(A.id, B.id), b: Math.max(A.id, B.id), height: best.d, size: members.length });
    clusters = clusters.filter((_, k) => k !== best.i && k !== best.j);
    clusters.push({ id: n + merges.length - 1, members });
  }
  return merges;
}

/**
 * Corta el árbol a la altura h: se aplican solo las uniones con altura ≤ h.
 * Devuelve el grupo de cada punto, numerados 0, 1, 2… en el orden en que
 * aparece su primer punto.
 */
export function cutTree(merges: Merge[], n: number, h: number): number[] {
  const parent = Array.from({ length: n + merges.length }, (_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  merges.forEach((m, k) => {
    if (m.height <= h) {
      parent[find(m.a)] = n + k;
      parent[find(m.b)] = n + k;
    }
  });
  const ids = new Map<number, number>();
  return Array.from({ length: n }, (_, i) => {
    const root = find(i);
    if (!ids.has(root)) ids.set(root, ids.size);
    return ids.get(root)!;
  });
}

export interface DendrogramNode {
  x: number;
  height: number;
}

/**
 * Posiciones para dibujar el dendrograma: el orden de las hojas (recorriendo
 * el árbol desde la raíz, primero `a` y luego `b`) y, para cada grupo, su x
 * (hojas en 0, 1, 2…; una unión, en el medio de sus dos hijos) y su altura.
 */
export function dendrogramLayout(merges: Merge[], n: number): { order: number[]; nodes: DendrogramNode[] } {
  const order: number[] = [];
  const visit = (id: number) => {
    if (id < n) order.push(id);
    else {
      visit(merges[id - n].a);
      visit(merges[id - n].b);
    }
  };
  visit(n + merges.length - 1);
  const nodes: DendrogramNode[] = [];
  order.forEach((leaf, i) => (nodes[leaf] = { x: i, height: 0 }));
  merges.forEach((m, k) => (nodes[n + k] = { x: (nodes[m.a].x + nodes[m.b].x) / 2, height: m.height }));
  return { order, nodes };
}

// ---------- PCA en 2D ----------

export interface Covariance2 {
  mean: Pt;
  sxx: number;
  syy: number;
  sxy: number;
}

/** Media y covarianza (dividida entre n − 1, como numpy y scikit-learn). */
export function covariance2(points: Pt[]): Covariance2 {
  const n = points.length;
  const mean = { x: points.reduce((s, p) => s + p.x, 0) / n, y: points.reduce((s, p) => s + p.y, 0) / n };
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const p of points) {
    sxx += (p.x - mean.x) ** 2;
    syy += (p.y - mean.y) ** 2;
    sxy += (p.x - mean.x) * (p.y - mean.y);
  }
  return { mean, sxx: sxx / (n - 1), syy: syy / (n - 1), sxy: sxy / (n - 1) };
}

/** Varianza de los puntos proyectados sobre un eje que forma `deg` grados con el eje x. */
export function varianceAlong(cov: Covariance2, deg: number): number {
  const t = (deg * Math.PI) / 180;
  const c = Math.cos(t);
  const s = Math.sin(t);
  return cov.sxx * c * c + 2 * cov.sxy * c * s + cov.syy * s * s;
}

/** Fracción de la varianza total que captura ese eje (entre 0 y 1). */
export function capturedShare(cov: Covariance2, deg: number): number {
  return varianceAlong(cov, deg) / (cov.sxx + cov.syy);
}

/** Ángulo (0 a 180°) del primer componente principal: el eje de máxima varianza. */
export function principalAngle(cov: Covariance2): number {
  const deg = ((0.5 * Math.atan2(2 * cov.sxy, cov.sxx - cov.syy)) * 180) / Math.PI;
  return (deg + 180) % 180;
}

/** Proyección de p sobre la recta que pasa por `mean` con ángulo `deg`. */
export function projectOnAxis(p: Pt, mean: Pt, deg: number): Pt {
  const t = (deg * Math.PI) / 180;
  const u = { x: Math.cos(t), y: Math.sin(t) };
  const s = (p.x - mean.x) * u.x + (p.y - mean.y) * u.y;
  return { x: mean.x + s * u.x, y: mean.y + s * u.y };
}

// ---------- DBSCAN ----------

export interface DbscanResult {
  /** Grupo de cada punto (0, 1, 2…) o −1 si es ruido. */
  labels: number[];
  /** true si el punto es núcleo: hay al menos minPts puntos (contándose él) a distancia ≤ ε. */
  core: boolean[];
  clusters: number;
  noise: number;
}

/**
 * DBSCAN como en scikit-learn: vecinos a distancia ≤ ε contando el propio
 * punto; recorre los puntos en orden y, desde cada núcleo sin grupo, expande
 * un grupo nuevo por los núcleos alcanzables. Un punto de borde se queda en
 * el primer grupo que lo alcanza.
 */
export function dbscan(points: Pt[], eps: number, minPts: number): DbscanResult {
  const neighbors = points.map((p) => points.flatMap((q, j) => (dist(p, q) <= eps + 1e-9 ? [j] : [])));
  const core = neighbors.map((nb) => nb.length >= minPts);
  const labels = points.map(() => -1);
  let label = 0;
  points.forEach((_, start) => {
    if (labels[start] !== -1 || !core[start]) return;
    const stack = [start];
    while (stack.length) {
      const i = stack.pop()!;
      if (labels[i] !== -1) continue;
      labels[i] = label;
      if (core[i]) for (const v of neighbors[i]) if (labels[v] === -1) stack.push(v);
    }
    label++;
  });
  return { labels, core, clusters: label, noise: labels.filter((l) => l === -1).length };
}
