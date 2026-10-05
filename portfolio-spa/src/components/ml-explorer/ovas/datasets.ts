import type { Grid, LabeledPt, Mlp2, Pt, SliderRange } from './ovaMath';

/**
 * Datos fijos de las OVAs. Viven fuera de los componentes para que
 * datasets.test.ts verifique, con estos mismos datos, lo que dicen los
 * textos de cada OVA (aciertos, hojas, votos). Si cambias un punto, el test
 * señala qué texto quedó desactualizado.
 */

const labeled = (points: [number, number][], label: 0 | 1): LabeledPt[] =>
  points.map(([x, y]) => ({ x, y, label }));

// ---------- Regresión lineal (x de 0 a 10, y de 0 a 8) ----------

export const LR_INITIAL: Pt[] = [
  { x: 1, y: 1.6 },
  { x: 2, y: 2.1 },
  { x: 3, y: 3.4 },
  { x: 4, y: 3.2 },
  { x: 5, y: 4.6 },
  { x: 6, y: 4.4 },
  { x: 7, y: 5.9 },
  { x: 8, y: 6.1 },
  { x: 9, y: 6.8 },
];

export const LR_OUTLIER: Pt = { x: 8.5, y: 0.8 };

// ---------- Regresión logística ----------
// x = veces que el correo dice «gratis». Las clases se solapan entre 3 y
// 4.5: ningún umbral acierta todo, como en los datos reales.

const LOGISTIC_NORMAL = [0, 0.5, 1, 1, 1.5, 2, 2.5, 3, 4];
const LOGISTIC_SPAM = [3, 3.5, 4.5, 5, 5.5, 6, 7, 8, 9];

export const LOGISTIC_XS = [...LOGISTIC_NORMAL, ...LOGISTIC_SPAM];
export const LOGISTIC_YS = [...LOGISTIC_NORMAL.map(() => 0), ...LOGISTIC_SPAM.map(() => 1)];
export const LOGISTIC_B0: SliderRange = { min: -10, max: 4, step: 0.1 };
export const LOGISTIC_B1: SliderRange = { min: -1, max: 3, step: 0.05 };

// ---------- Árbol de decisión (x = ingreso, y = deuda, de 0 a 10) ----------

/**
 * Los dos clientes de ruido de TREE_POINTS: cada uno lleva la etiqueta contraria
 * a la de sus vecinos. La OVA del bosque los marca con un anillo.
 */
export const TREE_NOISE: readonly LabeledPt[] = [
  { x: 8, y: 8, label: 0 }, // paga aunque su deuda es alta
  { x: 3, y: 1.5, label: 1 }, // no paga aunque su deuda es baja
];

export const TREE_POINTS: LabeledPt[] = [
  ...labeled(
    [
      [2, 1], [4, 2], [6, 1.5], [8, 3], [9, 1], [7, 5], [8.5, 5.5], [5, 3.5],
      [3, 2.5], [6.5, 4.5], [9, 4], [1, 3], [4.5, 5], [7.5, 2],
    ],
    0,
  ),
  TREE_NOISE[0],
  ...labeled(
    [
      [1, 5], [2, 6.5], [1.5, 8], [3, 9], [5, 7.5], [6, 8.5], [8, 7], [9, 9],
      [2.5, 5.5], [4, 8], [7, 9.5], [0.8, 6],
    ],
    1,
  ),
  TREE_NOISE[1],
];

// ---------- KNN (x = gusto por la acción, y = por la ciencia ficción) ----------

export const KNN_POINTS: LabeledPt[] = [
  ...labeled(
    [
      [1, 2], [2, 1], [1.5, 3.5], [3, 2.5], [2.5, 4.5], [4, 1.5], [3.5, 3.5],
      [0.8, 5], [5, 3], [4.5, 5.2], [6, 1],
      [6.5, 7.2], // ruido: rodeado de personas a las que sí les gustó
    ],
    0,
  ),
  ...labeled(
    [[6, 7], [7, 8], [8, 6.5], [7.5, 9], [9, 8], [5.5, 8.5], [8.5, 5], [6.5, 6], [9, 9.2], [4, 7.5], [3, 6.5]],
    1,
  ),
];

/** Junto al punto de ruido: con k = 1 decide él; con k ≥ 3, la mayoría. */
export const KNN_START: Pt = { x: 6.4, y: 7 };

// ---------- Random Forest (mismos clientes del árbol; x = ingreso, y = deuda) ----------
// El bosque aprende de TREE_POINTS (con sus dos puntos de ruido) y se evalúa
// en FOREST_TEST: 40 clientes nuevos que siguen la regla limpia «impago si
// la deuda pasa de 5.25». Ningún punto nuevo cae justo en la frontera.

export const FOREST_TEST: LabeledPt[] = [
  ...labeled(
    [
      [3.5, 1.5], [5, 1], [4.5, 4.5], [9.5, 1.5], [0, 3.5], [3, 4], [2, 4.5], [3.5, 4.5], [9.5, 1], [8, 1],
      [9, 4], [7, 0], [3, 3.5], [8, 2], [2.5, 4], [9, 1], [3, 1], [8, 4.5], [5, 0.5], [8.5, 0.5],
    ],
    0,
  ),
  ...labeled(
    [
      [8, 7], [6.5, 7], [5, 6.5], [4.5, 7], [6.5, 8], [0, 6], [10, 9], [3, 9], [4, 7.5], [1, 6.5],
      [6.5, 7.5], [4.5, 8], [9, 9.5], [2, 7], [3.5, 7.5], [3.5, 6], [2, 6.5], [1.5, 6], [5.5, 9], [7.5, 7],
    ],
    1,
  ),
];

/** Semilla del bosque: con ella los textos citan cifras que no cambian. */
export const FOREST_SEED = 1;
/** Profundidad máxima de cada árbol: con 28 puntos, 8 equivale a «sin límite». */
export const FOREST_DEPTH = 8;
/** Tamaños del bosque que ofrece el slider. */
export const FOREST_SIZES = [1, 3, 10, 30, 100] as const;

// ---------- Gradient Boosting (regresión de una variable) ----------
// Una curva con forma de ola y algo de ruido: un solo corte no la explica,
// muchos cortes pequeños sumados sí.

export const GB_XS = Array.from({ length: 21 }, (_, i) => i / 2);
export const GB_YS = [4, 5, 5.9, 6.5, 7.2, 6.9, 6.1, 6.2, 5.6, 4.6, 3.8, 3.6, 2.6, 2.7, 2.8, 2.6, 3.2, 4.2, 5.3, 6.2, 7.2];
export const GB_RATES = [0.1, 0.3, 1] as const;
export const GB_MAX_STEPS = 50;

// ---------- SVM (dos grupos y un punto raro de la clase 1 dentro de la 0) ----------
// Coordenadas con decimales a propósito: con valores redondos varios puntos
// caen justo en el borde del margen y el número de vectores de soporte deja
// de estar bien definido.

export const SVM_POINTS: LabeledPt[] = [
  ...labeled(
    [
      [1.2, 2.1], [2.3, 0.9], [2.1, 3.6], [3.2, 2.2], [0.9, 5.1], [3.6, 4.3],
      [4.7, 1.4], [2.6, 6.2], [6.1, 2.3], [5.2, 3.4], [1.4, 7.3],
    ],
    0,
  ),
  ...labeled(
    [
      [6.2, 7.1], [7.6, 5.8], [7.1, 8.6], [8.4, 7.4], [5.1, 8.7], [8.9, 4.4],
      [6.6, 9.3], [9.2, 8.8], [6.7, 5.2], [4.6, 6.9],
      [4.1, 3.1], // el punto raro: clase 1 rodeada de clase 0
    ],
    1,
  ),
];
export const SVM_GAMMA = 0.3;
export const SVM_CS = [0.01, 0.1, 1, 10, 100] as const;

// ---------- Naive Bayes (las mismas 16 reseñas del ejercicio de Python) ----------

export const NB_REVIEWS: { text: string; label: 0 | 1 }[] = [
  { text: 'excelente producto llegó rápido y funciona perfecto', label: 1 },
  { text: 'muy buena calidad lo recomiendo', label: 1 },
  { text: 'me encantó excelente atención', label: 1 },
  { text: 'funciona perfecto buena compra', label: 1 },
  { text: 'rápido y buena calidad recomendado', label: 1 },
  { text: 'excelente precio muy contento', label: 1 },
  { text: 'buena batería y pantalla excelente', label: 1 },
  { text: 'lo recomiendo a todos me encantó', label: 1 },
  { text: 'pésimo producto llegó roto', label: 0 },
  { text: 'muy mala calidad no lo recomiendo', label: 0 },
  { text: 'llegó tarde y no funciona', label: 0 },
  { text: 'mala atención pésimo servicio', label: 0 },
  { text: 'se dañó en una semana mala compra', label: 0 },
  { text: 'no funciona devolví el producto', label: 0 },
  { text: 'la batería dura poco mala calidad', label: 0 },
  { text: 'pésimo no lo compren', label: 0 },
];

/** Frase inicial del simulador (la primera reseña nueva del ejercicio). */
export const NB_START = 'excelente calidad llegó rápido';

// ---------- K-Means (24 clientes en tres nubes; sin etiquetas) ----------

const xy = (pairs: [number, number][]): Pt[] => pairs.map(([x, y]) => ({ x, y }));

export const KM_POINTS: Pt[] = xy([
  [2.5, 3.5], [3.4, 2.1], [2.3, 2.1], [2.9, 2.5], [3.0, 1.2], [3.6, 2.4], [3.0, 2.4], [2.2, 2.8],
  [7.8, 2.9], [7.1, 3.5], [6.6, 1.9], [7.5, 2.5], [5.9, 2.4], [6.9, 2.2], [6.2, 3.0], [7.8, 2.8],
  [4.3, 7.8], [5.3, 7.3], [5.2, 8.2], [4.7, 6.9], [5.0, 7.7], [5.6, 6.6], [4.3, 6.9], [3.6, 7.6],
]);
/**
 * Dos arranques (semillas de mulberry32 para sortear los centroides
 * iniciales): con K = 3, el A llega a la buena solución en 6 pasos y el B
 * se atasca en una peor. Fijos para que las cifras sean siempre las mismas.
 */
export const KM_STARTS = [
  { id: 'A', seed: 11 },
  { id: 'B', seed: 12 },
] as const;
export const KM_START_K = 3;
export const KM_MAX_K = 6;

// ---------- Agrupamiento jerárquico (12 puntos: tres grupos y uno intermedio) ----------

export const HC_POINTS: Pt[] = xy([
  [1.67, 1.91], [2.83, 2.33], [1.18, 2.0], [1.69, 2.07],
  [2.4, 7.62], [3.32, 8.29], [3.36, 7.76], [2.45, 8.63],
  [6.54, 5.55], [7.34, 4.56], [7.17, 4.66],
  [5.6, 3.4],
]);
export const HC_CUT = { min: 0, max: 6, step: 0.1 } as const;
export const HC_START_CUT = 3;

// ---------- PCA (20 puntos: dos medidas muy correlacionadas) ----------

export const PCA_POINTS: Pt[] = xy([
  [1.2, 3.2], [2.1, 3.6], [2.0, 2.2], [4.2, 4.8], [-0.1, 2.1], [4.6, 4.6], [2.9, 3.7], [7.0, 6.2], [7.1, 4.9], [8.1, 7.8],
  [6.7, 5.3], [4.9, 3.4], [6.9, 6.0], [8.3, 7.8], [3.6, 3.8], [6.3, 6.8], [4.9, 6.0], [8.2, 6.1], [3.2, 2.3], [4.3, 3.8],
]);

// ---------- DBSCAN (dos lunas entrelazadas y 3 puntos sueltos) ----------
// Las lunas son make_moons(56, noise=0.07, random_state=3) de scikit-learn,
// escaladas ×3, desplazadas y redondeadas a 2 decimales; un punto se movió
// 0.01 para que ninguna distancia caiga justo en un valor de ε del slider.
// Los 3 últimos puntos son ruido a propósito.

export const DB_POINTS: Pt[] = xy([
  [4.31, 5.67], [4.33, 1.99], [5.13, 5.7], [9.54, 3.37], [8.18, 1.78], [9.4, 4.55], [3.69, 5.77], [0.47, 3.88],
  [9.24, 2.48], [6.08, 4.69], [7.55, 1.33], [2.64, 5.23], [4.73, 2.17], [3.49, 3.44], [9.36, 4.16], [6.18, 4.06],
  [0.5, 2.7], [2.6, 5.75], [3.2, 5.93], [0.56, 4.4], [4.45, 5.21], [5.82, 4.92], [7.9, 1.58], [5.86, 1.58],
  [8.36, 1.94], [9.17, 3.47], [6.03, 4.66], [4.33, 2.25], [8.66, 2.49], [6.54, 2.45], [3.39, 4.12], [3.8, 3.2],
  [4.58, 2.68], [6.65, 3.15], [0.81, 4.25], [5.09, 1.65], [2.26, 5.6], [0.41, 3.78], [3.45, 5.69], [5.62, 1.17],
  [3.31, 4.22], [1.66, 5.16], [3.9, 3.02], [5.26, 1.44], [9.17, 2.68], [8.53, 1.94], [6.77, 1.42], [7.2, 1.24],
  [5.09, 5.55], [1.93, 5.52], [1.08, 4.92], [6.43, 2.68], [5.09, 5.37], [6.28, 3.96], [0.82, 4.01], [6.38, 1.42],
  [1.2, 1.2], [9.0, 6.2], [4.8, 7.1],
]);
export const DB_EPS = { min: 0.2, max: 2, step: 0.1 } as const;
export const DB_MIN_PTS = { min: 2, max: 10, step: 1 } as const;
export const DB_START = { eps: 1, minPts: 4 } as const;

// ---------- MLP: XOR (20 puntos, 5 alrededor de cada esquina) ----------

const XOR_JITTER: [number, number][] = [[0.05, 0.08], [-0.07, 0.03], [0.09, -0.06], [-0.04, -0.09], [0.02, -0.02]];
/** Esquinas (0, 0) y (1, 1) → clase 0; (0, 1) y (1, 0) → clase 1: ninguna recta las separa. */
export const XOR_POINTS: LabeledPt[] = ([[0, 0, 0], [1, 1, 0], [0, 1, 1], [1, 0, 1]] as const).flatMap(([cx, cy, label]) =>
  XOR_JITTER.map(([dx, dy]) => ({ x: Math.round((cx + dx) * 100) / 100, y: Math.round((cy + dy) * 100) / 100, label })),
);
export const MLP_WEIGHT: SliderRange = { min: -20, max: 20, step: 1 };
export const MLP_BIAS: SliderRange = { min: -30, max: 30, step: 1 };
/**
 * Arranque: la neurona oculta 1 traza una recta que separa (0, 0) de las demás
 * esquinas (un «o» lógico) y la salida solo la copia; la neurona 2 está apagada
 * (pesos 0, siempre vale 0.5). Acierta 15 de 20: lo máximo con una sola recta.
 */
export const MLP_START: Mlp2 = { h1: [10, 10, -5], h2: [0, 0, 0], out: [10, 0, -5] };
/** Una solución: «o» en la neurona 1, «no-y» en la 2 y «y» de las dos en la salida. */
export const MLP_SOLUTION: Mlp2 = { h1: [20, 20, -10], h2: [-20, -20, 30], out: [20, 20, -30] };

// ---------- CNN: un «7» de 8×8 y dos filtros de 3×3 ----------
// Los mismos datos que el ejercicio de Python (cnn.py).

export const CNN_IMAGE: Grid = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];
export const CNN_KERNELS: { id: string; label: string; kernel: Grid }[] = [
  { id: 'vertical', label: 'Borde vertical', kernel: [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]] },
  { id: 'horizontal', label: 'Borde horizontal', kernel: [[-1, -1, -1], [0, 0, 0], [1, 1, 1]] },
];

// ---------- RNN: 30 mediciones ----------
// np.random.default_rng(0).normal(size=30), redondeadas a 2 decimales.

export const RNN_INPUTS = [
  0.13, -0.13, 0.64, 0.1, -0.54, 0.36, 1.3, 0.95, -0.7, -1.27, -0.62, 0.04, -2.33, -0.22, -1.25,
  -0.73, -0.54, -0.32, 0.41, 1.04, -0.13, 1.37, -0.67, 0.35, 0.9, 0.09, -0.74, -0.92, -0.46, 0.22,
];
/** Peso de la entrada (fijo) y rangos de los sliders. */
export const RNN_U = 0.5;
export const RNN_W: SliderRange = { min: 0.1, max: 1, step: 0.1 };
export const RNN_STEPS: SliderRange = { min: 1, max: 30, step: 1 };
export const RNN_START = { w: 0.9, steps: 10 } as const;

// ---------- Transformer: embeddings de juguete ----------
// Los mismos que el ejercicio de Python (transformer.py): [función, cosa, dinero, naturaleza].

export const TF_DIMS = ['función', 'cosa', 'dinero', 'naturaleza'] as const;
export const TF_EMBEDDINGS: Record<string, number[]> = {
  el: [1, 0, 0, 0],
  banco: [0, 1, 1, 1],
  del: [1, 0, 0, 0],
  río: [0, 1, 0, 2],
  cobra: [0, 0.5, 1.5, 0],
  interés: [0, 1, 2, 0],
};
export const TF_SENTENCES = [
  ['el', 'banco', 'del', 'río'],
  ['el', 'banco', 'cobra', 'interés'],
] as const;

// ---------- Autoencoder: 40 compras normales y 3 fraudes, 6 medidas cada una ----------
// Las normales salen de 2 factores ocultos más ruido; los fraudes no siguen ese
// patrón. Generadas con np.random.default_rng(16) y redondeadas a 2 decimales.

export const AE_NORMAL: Grid = [
  [0.7, -0.24, -2.1, -0.94, -0.18, -1.33],
  [-0.12, -0.03, -0.43, 0.07, 0.94, -0.69],
  [-0.23, 0.32, 0.48, 0.41, 0.86, -0.02],
  [1.65, -1.63, -3.27, -2.49, -3.14, -0.12],
  [1.12, -1.06, -1.78, -1.85, -2.69, 0.51],
  [-0.01, 0, -0.26, -0.39, -0.43, -0.33],
  [-0.49, 0.33, 0.78, 0.68, 0.75, 0.14],
  [-1.54, 0.82, 2.46, 1.73, 1.38, 1.02],
  [-1.62, 1.08, 3.2, 1.99, 1.12, 1.56],
  [-1.01, 0.94, 2.06, 1.61, 2.35, -0.17],
  [0.57, -0.39, -1.77, -0.54, 0.79, -1.82],
  [1.12, -1.41, -1.71, -1.97, -3.66, 1.2],
  [0.02, 0.09, -0.53, -0.03, 1.16, -1.08],
  [-0.54, 0.5, 0.73, 1.03, 2.34, -0.92],
  [-0.24, 0.32, 0.41, 0.63, 0.62, -0.3],
  [-0.04, 0.12, -0.07, 0.03, 0.53, 0.05],
  [-0.79, 0.48, 0.85, 0.95, 1.91, -0.35],
  [0.6, -0.39, -1.65, -0.61, 1.44, -1.51],
  [-0.72, 1.22, 1.92, 1.62, 2.24, -0.23],
  [0.45, -0.24, -1.03, -0.52, -0.22, -0.78],
  [-0.78, 0.55, 1.93, 0.76, -1.42, 1.91],
  [0.87, -0.88, -1.8, -1.29, -1.95, -0.09],
  [-0.1, -0.06, 0.4, 0.28, -0.63, 0.44],
  [-0.85, 0.99, 2.04, 1.59, 1.16, 0.62],
  [-1.21, 1.27, 2.36, 2.45, 4.03, -1.04],
  [1.63, -1.09, -3.04, -1.86, -0.28, -1.81],
  [0.41, -0.48, -0.58, -0.79, -1.9, 0.76],
  [-0.8, 0.34, 1.15, 0.64, -0.35, 0.8],
  [0.48, -0.37, -1.13, -0.95, -0.74, -0.59],
  [0.05, 0.15, 0.11, 0.17, 0.5, -0.19],
  [0.37, 0.04, -1.55, -0.22, 1.91, -2.11],
  [-2.43, 1.69, 4.51, 2.99, 2.73, 1.28],
  [-0.43, 0.68, 0.58, 0.74, 2.7, -1.29],
  [-1.02, 0.53, 1.87, 1.07, 0.54, 0.74],
  [0.11, -0.25, -0.33, -0.23, -1.2, 0.39],
  [1.38, -1.22, -3.38, -2.66, -2.29, -0.44],
  [-0.82, 0.63, 0.98, 0.78, 1.71, -0.46],
  [1.44, -0.91, -2.97, -1.98, -1.53, -1.16],
  [0.1, 0.01, -0.52, 0.09, 1.35, -1.35],
  [1.61, -1.13, -4.05, -2.16, -0.64, -2.11],
];
export const AE_FRAUD: Grid = [
  [-4.93, 2.11, -0.81, -1.66, -1.01, -2.53],
  [-0.31, 1.97, 0.38, -0.6, -0.27, 0.1],
  [-0.64, -0.94, -0.03, 0.34, -0.88, 0.38],
];
export const AE_BOTTLENECK: SliderRange = { min: 1, max: 6, step: 1 };
export const AE_START_K = 2;
