import { describe, expect, it } from 'vitest';
import {
  FOREST_DEPTH,
  FOREST_SEED,
  FOREST_SIZES,
  FOREST_TEST,
  GB_MAX_STEPS,
  GB_RATES,
  GB_XS,
  GB_YS,
  KNN_POINTS,
  KNN_START,
  LOGISTIC_B0,
  LOGISTIC_B1,
  LOGISTIC_XS,
  LOGISTIC_YS,
  LR_INITIAL,
  LR_OUTLIER,
  NB_REVIEWS,
  NB_START,
  SVM_CS,
  SVM_GAMMA,
  SVM_POINTS,
  TREE_NOISE,
  TREE_POINTS,
} from './datasets';
import {
  accuracy,
  boost,
  boostMse,
  buildForest,
  buildTree,
  countLeaves,
  explainNaiveBayes,
  fitLine,
  fitLogistic1D,
  forestAccuracy,
  forestVote,
  knnVote,
  marginWidth,
  mse,
  predictTree,
  sigmoid,
  snap,
  supportVectors,
  svmAccuracy,
  svmDecision,
  trainNaiveBayes,
  trainSvm,
} from './ovaMath';
import { DB_POINTS, DB_START, HC_CUT, HC_POINTS, HC_START_CUT, KM_MAX_K, KM_POINTS, KM_START_K, KM_STARTS, PCA_POINTS } from './datasets';
import {
  averageLinkage,
  capturedShare,
  covariance2,
  cutTree,
  dbscan,
  kmeansRun,
  mulberry32,
  principalAngle,
  randomInit,
  silhouette,
} from './ovaMath';

describe('OVA de regresión lineal', () => {
  it('la recta inicial es ŷ ≈ 0.98 + 0.65·x, con MSE ≈ 0.10', () => {
    const line = fitLine(LR_INITIAL);
    expect(line.b0).toBeCloseTo(0.983, 3);
    expect(line.b1).toBeCloseTo(0.65, 3);
    expect(mse(LR_INITIAL, line)).toBeCloseTo(0.101, 3);
  });

  it('un solo outlier sube el MSE de 0.10 a 2.57 y baja la pendiente de 0.65 a 0.40 (simulador de la pestaña Fórmula, cifras citadas en Contras)', () => {
    const before = fitLine(LR_INITIAL);
    const points = [...LR_INITIAL, LR_OUTLIER];
    const line = fitLine(points);
    expect(line.b1).toBeCloseTo(0.397, 3);
    expect(mse(points, line)).toBeCloseTo(2.568, 3);
    // Los redondeos exactos que cita el texto de la pestaña Contras.
    expect(mse(LR_INITIAL, before).toFixed(2)).toBe('0.10');
    expect(mse(points, line).toFixed(2)).toBe('2.57');
    expect(before.b1.toFixed(2)).toBe('0.65');
    expect(line.b1.toFixed(2)).toBe('0.40');
    expect(Math.round(mse(points, line) / mse(LR_INITIAL, before))).toBe(25);
  });
});

describe('OVA de regresión logística', () => {
  const hits = (b0: number, b1: number) =>
    LOGISTIC_XS.filter((x, i) => (sigmoid(b0 + b1 * x) >= 0.5 ? 1 : 0) === LOGISTIC_YS[i]).length;

  it('con los valores iniciales (b₀ = −4, b₁ = 1) acierta 15 de 18', () => {
    expect(hits(-4, 1)).toBe(15);
  });

  it('«Mejor ajuste» llega al óptimo, es determinista y acierta 16 de 18', () => {
    const fit = fitLogistic1D(LOGISTIC_XS, LOGISTIC_YS);
    expect(fitLogistic1D(LOGISTIC_XS, LOGISTIC_YS)).toEqual(fit);
    expect(fit.b0).toBeCloseTo(-6.638, 3);
    expect(fit.b1).toBeCloseTo(1.946, 3);
    expect(-fit.b0 / fit.b1).toBeCloseTo(3.41, 2);
    // scikit-learn sin regularizar (penalty=None) da −6.63865 y 1.94644.
    expect(fit.b0).toBeCloseTo(-6.64, 2);
    expect(fit.b1).toBeCloseTo(1.95, 2);
    const b0 = snap(fit.b0, LOGISTIC_B0);
    const b1 = snap(fit.b1, LOGISTIC_B1);
    expect(b0).toBeCloseTo(-6.6, 5);
    expect(b1).toBeCloseTo(1.95, 5);
    expect(hits(b0, b1)).toBe(16);
  });

  it('ningún ajuste acierta los 18: las clases se solapan', () => {
    // La predicción depende solo de x: dos puntos con el mismo x reciben la
    // misma clase. Si hay un x presente en ambas clases (p. ej. x = 3), uno
    // de los dos falla siempre, sean cuales sean b0 y b1.
    const x = 3;
    const labelsAtX = new Set(LOGISTIC_YS.filter((_, i) => LOGISTIC_XS[i] === x));
    expect(labelsAtX).toEqual(new Set([0, 1]));
    const fit = fitLogistic1D(LOGISTIC_XS, LOGISTIC_YS);
    for (const [b0, b1] of [[fit.b0, fit.b1], [-4, 1], [-6.6, 1.95], [0, 0], [-10, 3], [4, -1]]) {
      expect(hits(b0, b1)).toBeLessThanOrEqual(17);
    }
  });
});

describe('OVA del árbol de decisión', () => {
  it.each([
    { depth: 0, leaves: 1, acc: 15 / 28 },
    { depth: 1, leaves: 2, acc: 24 / 28 },
    { depth: 2, leaves: 4, acc: 24 / 28 },
    { depth: 3, leaves: 6, acc: 26 / 28 },
    { depth: 4, leaves: 8, acc: 27 / 28 },
    { depth: 5, leaves: 9, acc: 1 },
  ])('profundidad $depth → $leaves hojas y $acc de acierto', ({ depth, leaves, acc }) => {
    const tree = buildTree(TREE_POINTS, depth);
    expect(countLeaves(tree)).toBe(leaves);
    expect(accuracy(tree, TREE_POINTS)).toBe(acc);
  });

  it('con 4 encierra el ruido de (8, 8); el de (3, 1.5) cae recién con 5', () => {
    expect(predictTree(buildTree(TREE_POINTS, 4), { x: 8, y: 8 })).toBe(0);
    expect(predictTree(buildTree(TREE_POINTS, 4), { x: 3, y: 1.5 })).toBe(0); // aún falla: el ruido lleva la etiqueta contraria a esa regla
    expect(predictTree(buildTree(TREE_POINTS, 5), { x: 3, y: 1.5 })).toBe(1);
  });
});

describe('OVA de KNN', () => {
  it.each([
    { k: 1, votes: [1, 0], winner: 0 },
    { k: 3, votes: [1, 2], winner: 1 },
    { k: 5, votes: [1, 4], winner: 1 },
    { k: 7, votes: [1, 6], winner: 1 },
    { k: 9, votes: [2, 7], winner: 1 },
    { k: 11, votes: [2, 9], winner: 1 },
    { k: 13, votes: [2, 11], winner: 1 },
    { k: 15, votes: [4, 11], winner: 1 },
  ])('k = $k desde la posición inicial → votos $votes', ({ k, votes, winner }) => {
    const result = knnVote(KNN_POINTS, KNN_START, k);
    expect(result.votes).toEqual(votes);
    expect(result.winner).toBe(winner);
  });

  it('con k = 1 el vecino más cercano es el punto de ruido (6.5, 7.2)', () => {
    const noise = KNN_POINTS.findIndex((p) => p.x === 6.5 && p.y === 7.2);
    expect(noise).toBe(11);
    expect(KNN_POINTS[noise].label).toBe(0);
    expect(knnVote(KNN_POINTS, KNN_START, 1).neighbors[0]).toBe(11); // (6.5, 7.2), el ruido
  });
});

describe('OVA de Random Forest', () => {
  const forest = buildForest(TREE_POINTS, 100, FOREST_DEPTH, FOREST_SEED);

  it('los datos nuevos siguen la regla «impago si deuda > 5.25»: 20 y 20, sin puntos en la frontera', () => {
    expect(FOREST_TEST).toHaveLength(40);
    expect(FOREST_TEST.filter((p) => p.label === 1)).toHaveLength(20);
    for (const p of FOREST_TEST) expect(p.label).toBe(p.y > 5.25 ? 1 : 0);
    expect(new Set(FOREST_TEST.map((p) => `${p.x},${p.y}`)).size).toBe(40);
  });

  it.each([
    { n: 1, train: 24, test: 35 },
    { n: 3, train: 26, test: 37 },
    { n: 10, train: 27, test: 38 },
    { n: 30, train: 28, test: 39 },
    { n: 100, train: 28, test: 39 },
  ])('$n árboles → $train de 28 en entrenamiento y $test de 40 nuevos', ({ n, train, test }) => {
    expect(FOREST_SIZES).toContain(n);
    const trees = forest.slice(0, n);
    expect(forestAccuracy(trees, TREE_POINTS) * 28).toBeCloseTo(train, 9);
    expect(forestAccuracy(trees, FOREST_TEST) * 40).toBeCloseTo(test, 9);
  });

  it('un solo árbol profundo (sin azar) acierta 36 de 40 nuevos: el bosque de 100 lo supera (39)', () => {
    expect(accuracy(buildTree(TREE_POINTS, FOREST_DEPTH), TREE_POINTS)).toBe(1);
    expect(accuracy(buildTree(TREE_POINTS, FOREST_DEPTH), FOREST_TEST) * 40).toBeCloseTo(36, 9);
  });

  it('el bosque de 100 aún vota «impago» en el ruido de (3, 1.5) (60 de 100): el 100 % de entrenamiento no prueba nada', () => {
    expect(forestVote(forest, { x: 3, y: 1.5 })).toBeCloseTo(0.6, 9);
    expect(forestVote(forest, { x: 8, y: 8 })).toBeCloseTo(0.4, 9);
  });
});

describe('OVA de Gradient Boosting', () => {
  it('21 puntos de x = 0 a 10; el punto de partida es el promedio, 4.87, con MSE 2.41', () => {
    expect(GB_XS).toHaveLength(21);
    expect(GB_YS).toHaveLength(21);
    const m = boost(GB_XS, GB_YS, GB_MAX_STEPS, 0.3);
    expect(m.base).toBeCloseTo(4.867, 3);
    expect(boostMse(m, GB_XS, GB_YS, 0).toFixed(2)).toBe('2.41');
  });

  it('el primer tocón corta en x = 4.25: suma 1.07 a la izquierda y resta 0.80 a la derecha', () => {
    const [first] = boost(GB_XS, GB_YS, 1, 0.3).stumps;
    expect(first.threshold).toBe(4.25);
    expect(first.left.toFixed(2)).toBe('1.07');
    expect(first.right.toFixed(2)).toBe('-0.80');
  });

  it.each([
    { rate: 0.1, mse: ['2.25', '1.49', '0.48'] },
    { rate: 0.3, mse: ['1.97', '0.73', '0.06'] },
    { rate: 1, mse: ['1.56', '0.15', '0.03'] },
  ])('tasa $rate → MSE tras 1, 10 y 50 pasos: $mse', ({ rate, mse }) => {
    expect(GB_RATES).toContain(rate);
    const m = boost(GB_XS, GB_YS, GB_MAX_STEPS, rate);
    expect([1, 10, 50].map((k) => boostMse(m, GB_XS, GB_YS, k).toFixed(2))).toEqual(mse);
  });
});

describe('OVA de SVM', () => {
  const outlier = SVM_POINTS.findIndex((p) => p.x === 4.1 && p.y === 3.1);

  it('22 puntos; el punto raro (4.1, 3.1) es de la clase 1', () => {
    expect(SVM_POINTS).toHaveLength(22);
    expect(outlier).toBe(21);
    expect(SVM_POINTS[outlier].label).toBe(1);
  });

  // Cifras comparadas con scikit-learn 1.6.1: SVC(kernel=..., C=..., gamma=0.3, tol=1e-6).
  it.each([
    { C: 0.01, sv: 17, margin: '7.03' },
    { C: 0.1, sv: 8, margin: '3.74' },
    { C: 1, sv: 5, margin: '2.13' },
    { C: 10, sv: 4, margin: '1.94' },
    { C: 100, sv: 4, margin: '1.94' },
  ])('lineal, C = $C → $sv vectores de soporte, margen $margin; el punto raro siempre falla', ({ C, sv, margin }) => {
    expect(SVM_CS).toContain(C);
    const m = trainSvm(SVM_POINTS, C, { kind: 'linear' });
    expect(supportVectors(m)).toHaveLength(sv);
    expect(marginWidth(m).toFixed(2)).toBe(margin);
    expect(svmAccuracy(m, SVM_POINTS) * 22).toBeCloseTo(21, 9);
    expect(svmDecision(m, SVM_POINTS[outlier])).toBeLessThan(0);
  });

  it.each([
    { C: 0.01, sv: 22, hits: 21 },
    { C: 0.1, sv: 22, hits: 21 },
    { C: 1, sv: 19, hits: 21 },
    { C: 10, sv: 14, hits: 22 },
    { C: 100, sv: 14, hits: 22 },
  ])('RBF (γ = 0.3), C = $C → $sv vectores de soporte, acierta $hits de 22', ({ C, sv, hits }) => {
    const m = trainSvm(SVM_POINTS, C, { kind: 'rbf', gamma: SVM_GAMMA });
    expect(supportVectors(m)).toHaveLength(sv);
    expect(svmAccuracy(m, SVM_POINTS) * 22).toBeCloseTo(hits, 9);
    expect(svmDecision(m, SVM_POINTS[outlier]) > 0).toBe(hits === 22);
  });
});

describe('OVA de Naive Bayes', () => {
  const model = trainNaiveBayes(NB_REVIEWS);

  it('16 reseñas mitad y mitad, 38 palabras distintas (igual que el ejercicio de Python)', () => {
    expect(NB_REVIEWS).toHaveLength(16);
    expect(NB_REVIEWS.filter((r) => r.label === 1)).toHaveLength(8);
    expect(model.vocabulary).toHaveLength(38);
  });

  it.each([
    { text: NB_START, p: '93' },
    { text: 'no funciona mala compra', p: '5' },
    { text: 'llegó la batería nueva', p: '28' },
  ])('«$text» → P(positiva) = $p % (lo mismo que imprime MultinomialNB)', ({ text, p }) => {
    expect((explainNaiveBayes(model, text).pPositive * 100).toFixed(0)).toBe(p);
  });

  it('los factores de la frase inicial: excelente ×5.27, calidad ×1.05, llegó ×0.70, rápido ×3.16', () => {
    const e = explainNaiveBayes(model, NB_START);
    expect(e.words.map((w) => `${w.word} ×${w.factor.toFixed(2)}`)).toEqual([
      'excelente ×5.27',
      'calidad ×1.05',
      'llegó ×0.70',
      'rápido ×3.16',
    ]);
  });

  it('los odds finales de la frase inicial son 12.34 a 1', () => {
    const e = explainNaiveBayes(model, NB_START);
    expect((e.pPositive / (1 - e.pPositive)).toFixed(2)).toBe('12.34');
  });

  it('«nueva» no está en el vocabulario y se ignora; «la» multiplica por 0.53', () => {
    const e = explainNaiveBayes(model, 'llegó la batería nueva');
    expect(e.words[3]).toEqual({ word: 'nueva', known: false, factor: 1 });
    expect(e.words[1].factor.toFixed(2)).toBe('0.53');
  });

  it('«batería» (una vez en cada clase) multiplica por 78/74 ≈ 1.05: las positivas suman 36 palabras y las negativas 40', () => {
    const [b] = explainNaiveBayes(model, 'batería').words;
    expect(b.factor).toBeCloseTo((2 / (36 + 38)) / (2 / (40 + 38)), 12);
    expect(b.factor.toFixed(2)).toBe('1.05');
  });

  it('no ve el orden ni las negaciones: «no me encantó» sale 68 % y «no fue nada excelente», 53 %', () => {
    expect((explainNaiveBayes(model, 'no me encantó').pPositive * 100).toFixed(0)).toBe('68');
    expect((explainNaiveBayes(model, 'no fue nada excelente').pPositive * 100).toFixed(0)).toBe('53');
  });
});

describe('TREE_NOISE', () => {
  it('son dos puntos de TREE_POINTS con la etiqueta contraria a la de su zona', () => {
    expect(TREE_NOISE).toHaveLength(2);
    for (const p of TREE_NOISE) {
      expect(TREE_POINTS.filter((q) => q.x === p.x && q.y === p.y && q.label === p.label)).toHaveLength(1);
      // Regla limpia del dataset: impago (1) si la deuda pasa de 5.25.
      expect(p.label).toBe(p.y > 5.25 ? 0 : 1);
    }
  });
});

// ---------- Fase 3 ----------
// Cifras contrastadas con scikit-learn 1.6.1 / scipy 1.14.1 (ver el plan de la fase 3):
// KMeans(init=<los mismos centroides>, n_init=1, algorithm="lloyd") da la misma
// inercia y las mismas etiquetas en los 12 casos (K = 1…6, arranques A y B);
// linkage(HC_POINTS, "average") da las mismas 11 uniones y fcluster(…, "distance")
// los mismos grupos en los 61 cortes del slider; PCA().explained_variance_ratio_[0]
// = 0.946006; DBSCAN(eps, min_samples) da las mismas etiquetas y núcleos en las
// 171 combinaciones del simulador.

const kmeansFinal = (k: number, start: number) => {
  const run = kmeansRun(KM_POINTS, randomInit(KM_POINTS, k, mulberry32(KM_STARTS[start].seed)));
  const last = run.at(-1)!;
  return { steps: run.length - 1, first: run[0].inertia, inertia: last.inertia, sil: silhouette(KM_POINTS, last.labels) };
};

describe('OVA de K-Means', () => {
  it('24 puntos; K de 1 a 6, empieza en 3', () => {
    expect(KM_POINTS).toHaveLength(24);
    expect(KM_START_K).toBe(3);
    expect(KM_MAX_K).toBe(6);
  });

  it('arranque A con K = 3: 6 pasos, la inercia baja de 294.05 a 15.18 y la silueta es 0.75', () => {
    const a = kmeansFinal(3, 0);
    expect(a.steps).toBe(6);
    expect(a.first.toFixed(2)).toBe('294.05');
    expect(a.inertia.toFixed(2)).toBe('15.18');
    expect(a.sil.toFixed(2)).toBe('0.75');
  });

  it('arranque B con K = 3: se atasca en 123.31 (8 veces más), silueta 0.18', () => {
    const b = kmeansFinal(3, 1);
    expect(b.steps).toBe(2);
    expect(b.inertia.toFixed(2)).toBe('123.31');
    expect(b.sil.toFixed(2)).toBe('0.18');
    expect(Math.round(b.inertia / kmeansFinal(3, 0).inertia)).toBe(8);
  });

  it('arranque A: la inercia baja siempre al subir K, pero la silueta es máxima en K = 3', () => {
    const rows = [1, 2, 3, 4, 5, 6].map((k) => kmeansFinal(k, 0));
    expect(rows.map((r) => r.inertia.toFixed(2))).toEqual(['209.39', '129.43', '15.18', '11.93', '11.02', '9.83']);
    expect(rows.slice(1).map((r) => r.sil.toFixed(2))).toEqual(['0.43', '0.75', '0.64', '0.63', '0.46']);
  });

  it('15.18 es también la inercia de KMeans(n_clusters=3, n_init=10) de scikit-learn', () => {
    // Valor de scikit-learn: 15.183749999999995.
    expect(kmeansFinal(3, 0).inertia).toBeCloseTo(15.18375, 9);
  });
});

describe('OVA de agrupamiento jerárquico', () => {
  const merges = averageLinkage(HC_POINTS);
  const groupsAt = (h: number) => Math.max(...cutTree(merges, HC_POINTS.length, h)) + 1;

  it('las 11 alturas de unión coinciden con linkage(…, "average") de scipy', () => {
    expect(merges.map((m) => m.height.toFixed(3))).toEqual([
      '0.161', '0.197', '0.506', '0.532', '1.011', '1.075', '1.182', '1.362', '2.150', '5.269', '5.790',
    ]);
  });

  it('el punto 12 (índice 11) se une al grupo de la derecha a altura 2.15', () => {
    const m = merges[8];
    expect(m.a).toBe(11);
    expect(m.height.toFixed(2)).toBe('2.15');
  });

  it('corte inicial 3.0: 3 grupos de 4; entre 2.2 y 5.2 siempre 3; con 2.0, 4; con 5.5, 2; desde 5.8, 1', () => {
    expect(HC_START_CUT).toBe(3);
    expect(HC_CUT.max).toBe(6);
    const labels = cutTree(merges, HC_POINTS.length, 3);
    expect([0, 1, 2].map((g) => labels.filter((l) => l === g).length)).toEqual([4, 4, 4]);
    for (let h = 22; h <= 52; h++) expect(groupsAt(h / 10)).toBe(3);
    expect(groupsAt(2)).toBe(4);
    expect(groupsAt(5.5)).toBe(2);
    expect(groupsAt(5.8)).toBe(1);
    expect(groupsAt(0)).toBe(12);
  });
});

describe('OVA de PCA', () => {
  const cov = covariance2(PCA_POINTS);

  it('el primer componente está a 34° y captura 94.6 % (scikit-learn: 0.946006)', () => {
    expect(principalAngle(cov).toFixed(2)).toBe('34.14');
    expect(capturedShare(cov, principalAngle(cov))).toBeCloseTo(0.946006, 6);
    expect((capturedShare(cov, 34) * 100).toFixed(1)).toBe('94.6');
  });

  it('el eje horizontal (0°) captura 66.5 %, el vertical 33.5 % y el perpendicular al mejor (124°) solo 5.4 %', () => {
    expect((capturedShare(cov, 0) * 100).toFixed(1)).toBe('66.5');
    expect((capturedShare(cov, 90) * 100).toFixed(1)).toBe('33.5');
    expect((capturedShare(cov, 124) * 100).toFixed(1)).toBe('5.4');
  });
});

describe('OVA de DBSCAN', () => {
  it('59 puntos: dos lunas de 56 y 3 puntos sueltos', () => {
    expect(DB_POINTS).toHaveLength(59);
  });

  it('inicio ε = 1.0, minPts = 4: las 2 lunas y 4 puntos de ruido (los 3 sueltos y la punta de una luna)', () => {
    expect(DB_START).toEqual({ eps: 1, minPts: 4 });
    const r = dbscan(DB_POINTS, 1, 4);
    expect(r.clusters).toBe(2);
    expect(r.labels.flatMap((l, i) => (l < 0 ? [i] : []))).toEqual([16, 56, 57, 58]);
    expect(r.core.filter(Boolean)).toHaveLength(50);
  });

  it('ε = 0.8 parte las lunas en 4 grupos (9 de ruido); ε = 0.4 deja 55 de 59 como ruido; ε = 1.1 las funde en 1', () => {
    expect(dbscan(DB_POINTS, 0.8, 4)).toMatchObject({ clusters: 4, noise: 9 });
    expect(dbscan(DB_POINTS, 0.4, 4)).toMatchObject({ clusters: 1, noise: 55 });
    expect(dbscan(DB_POINTS, 1.1, 4)).toMatchObject({ clusters: 1, noise: 3 });
  });

  it('con ε = 1.0, subir minPts a 6 deja 4 grupos y 13 puntos de ruido', () => {
    expect(dbscan(DB_POINTS, 1, 6)).toMatchObject({ clusters: 4, noise: 13 });
  });
});

describe('cifras de los ejemplos de los textos (fase 3)', () => {
  it('K-Means › Fórmula: gastos 1, 2, 9 y 10 con centroides en 1 y 2 → grupos {1, 2} y {9, 10}, centroides 1.5 y 9.5, inercia 1, en 2 pasos', () => {
    const pts = [1, 2, 9, 10].map((x) => ({ x, y: 0 }));
    const run = kmeansRun(pts, [{ x: 1, y: 0 }, { x: 2, y: 0 }]);
    expect(run[0].labels).toEqual([0, 1, 1, 1]);
    expect(run[1].centroids[1].x).toBe(7);
    expect(run[1].labels).toEqual([0, 0, 1, 1]);
    expect(run.at(-1)!.centroids.map((c) => c.x)).toEqual([1.5, 9.5]);
    expect(run.at(-1)!.inertia).toBe(1);
    expect(run).toHaveLength(3); // arranque + 2 pasos (el 2.º ya no cambia nada)
  });

  it('Hierarchical › Fórmula: 0, 1, 5 y 7 se unen a 1, 2 y 5.5', () => {
    const m = averageLinkage([0, 1, 5, 7].map((x) => ({ x, y: 0 })));
    expect(m.map((u) => u.height)).toEqual([1, 2, 5.5]);
  });

  it('Hierarchical › Contras y Cuándo no usarlo: 10 000 datos → unos 50 millones de distancias (400 MB); 100 000 → 5 000 millones (40 GB)', () => {
    const pairs = (n: number) => (n * (n - 1)) / 2;
    expect(Math.round(pairs(10_000) / 1e6)).toBe(50);
    expect(Math.round((pairs(10_000) * 8) / 1e6)).toBe(400);
    expect(Math.round(pairs(100_000) / 1e9)).toBe(5);
    expect(Math.round((pairs(100_000) * 8) / 1e9)).toBe(40);
  });

  it('DBSCAN › Fórmula: 0, 0.5, 1, 5 y 5.5 con ε = 0.5 y minPts = 3 → 0.5 núcleo, 0 y 1 borde, 5 y 5.5 ruido', () => {
    const r = dbscan([0, 0.5, 1, 5, 5.5].map((x) => ({ x, y: 0 })), 0.5, 3);
    expect(r.core).toEqual([false, true, false, false, false]);
    expect(r.labels).toEqual([0, 0, 0, -1, -1]);
  });

  it('PCA › Fórmula: puntos sobre la diagonal → 45° captura 100 %, el eje horizontal 50 % y el perpendicular 0 %', () => {
    const cov = covariance2([0, 1, 2, 3].map((v) => ({ x: v, y: v })));
    expect(capturedShare(cov, 45)).toBeCloseTo(1, 12);
    expect(capturedShare(cov, 0)).toBeCloseTo(0.5, 12);
    expect(capturedShare(cov, 135)).toBeCloseTo(0, 12);
  });
});
