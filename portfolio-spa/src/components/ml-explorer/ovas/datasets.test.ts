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
