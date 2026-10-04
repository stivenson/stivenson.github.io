import type { LabeledPt, Pt, SliderRange } from './ovaMath';

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
