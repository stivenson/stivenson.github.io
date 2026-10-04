import { createAlgorithmLoader, type ModuleLoader } from './loader';
import { GROUP_ORDER, type AlgorithmMeta } from './types';

/**
 * Un import() por algoritmo: Vite genera un chunk para cada uno y solo lo
 * descarga cuando el lector lo elige en el menu. Cada fase agrega aqui los
 * algoritmos que implementa.
 */
const LOADERS: Record<string, ModuleLoader> = {
  'linear-regression': () => import('./algorithms/linear-regression'),
  'logistic-regression': () => import('./algorithms/logistic-regression'),
  'decision-tree': () => import('./algorithms/decision-tree'),
  'random-forest': () => import('./algorithms/random-forest'),
  'gradient-boosting': () => import('./algorithms/gradient-boosting'),
  svm: () => import('./algorithms/svm'),
  knn: () => import('./algorithms/knn'),
  'naive-bayes': () => import('./algorithms/naive-bayes'),
};

type Entry = Omit<AlgorithmMeta, 'available'>;

/** Las 17 filas del cheatsheet. El menú las agrupa según GROUP_ORDER. */
const ENTRIES: Entry[] = [
  { slug: 'linear-regression', name: 'Linear Regression', nameEs: 'Regresión lineal', icon: '📈', group: 'supervised' },
  { slug: 'logistic-regression', name: 'Logistic Regression', nameEs: 'Regresión logística', icon: '〰️', group: 'supervised' },
  { slug: 'decision-tree', name: 'Decision Tree', nameEs: 'Árbol de decisión', icon: '🌳', group: 'supervised' },
  { slug: 'random-forest', name: 'Random Forest', nameEs: 'Bosque aleatorio', icon: '🌲', group: 'supervised' },
  { slug: 'gradient-boosting', name: 'Gradient Boosting', nameEs: 'Potenciación por gradiente', icon: '🚀', group: 'supervised' },
  { slug: 'svm', name: 'SVM', nameEs: 'Máquina de vectores de soporte', icon: '↔️', group: 'supervised' },
  { slug: 'knn', name: 'KNN', nameEs: 'K vecinos más cercanos', icon: '🎯', group: 'supervised' },
  { slug: 'naive-bayes', name: 'Naive Bayes', nameEs: 'Bayes ingenuo', icon: '📄', group: 'supervised' },
  { slug: 'k-means', name: 'K-Means', nameEs: 'K-medias', icon: '⚪', group: 'unsupervised' },
  { slug: 'hierarchical-clustering', name: 'Hierarchical Clustering', nameEs: 'Agrupamiento jerárquico', icon: '🌿', group: 'unsupervised' },
  { slug: 'dbscan', name: 'DBSCAN', nameEs: 'Agrupamiento por densidad', icon: '🫧', group: 'unsupervised' },
  { slug: 'pca', name: 'PCA', nameEs: 'Análisis de componentes principales', icon: '🧭', group: 'reduction' },
  { slug: 'mlp', name: 'Neural Networks (MLP)', nameEs: 'Perceptrón multicapa', icon: '🕸️', group: 'neural' },
  { slug: 'cnn', name: 'CNN', nameEs: 'Red neuronal convolucional', icon: '🖼️', group: 'neural' },
  { slug: 'rnn', name: 'RNN', nameEs: 'Red neuronal recurrente', icon: '🔁', group: 'neural' },
  { slug: 'transformer', name: 'Transformer (BERT, GPT)', nameEs: 'Transformer', icon: '🤖', group: 'neural' },
  { slug: 'autoencoders', name: 'Autoencoders', nameEs: 'Autocodificadores', icon: '🗜️', group: 'neural' },
];

export const ALGORITHMS: AlgorithmMeta[] = GROUP_ORDER.flatMap((group) =>
  ENTRIES.filter((e) => e.group === group).map((e) => ({ ...e, available: Object.hasOwn(LOADERS, e.slug) })),
);

export const AVAILABLE_SLUGS: string[] = ALGORITHMS.filter((a) => a.available).map((a) => a.slug);

export function getMeta(slug: string): AlgorithmMeta {
  const meta = ALGORITHMS.find((a) => a.slug === slug);
  if (!meta) throw new Error(`Algoritmo sin fila en el registry: ${slug}`);
  return meta;
}

export const loadAlgorithm = createAlgorithmLoader(LOADERS);

/** Precarga al pasar el mouse: si falla, el clic lo reintentará. */
export function prefetchAlgorithm(slug: string): void {
  if (Object.hasOwn(LOADERS, slug)) loadAlgorithm(slug).catch(() => {});
}
