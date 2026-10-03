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

export const TREE_POINTS: LabeledPt[] = [
  ...labeled(
    [
      [2, 1], [4, 2], [6, 1.5], [8, 3], [9, 1], [7, 5], [8.5, 5.5], [5, 3.5],
      [3, 2.5], [6.5, 4.5], [9, 4], [1, 3], [4.5, 5], [7.5, 2],
      [8, 8], // ruido: paga aunque su deuda es alta
    ],
    0,
  ),
  ...labeled(
    [
      [1, 5], [2, 6.5], [1.5, 8], [3, 9], [5, 7.5], [6, 8.5], [8, 7], [9, 9],
      [2.5, 5.5], [4, 8], [7, 9.5], [0.8, 6],
      [3, 1.5], // ruido: no paga aunque su deuda es baja
    ],
    1,
  ),
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
