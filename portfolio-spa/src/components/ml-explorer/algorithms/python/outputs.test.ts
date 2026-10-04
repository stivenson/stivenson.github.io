import { describe, expect, it } from 'vitest';
import linearRegression from './linear-regression.out.txt?raw';
import decisionTree from './decision-tree.out.txt?raw';
import logisticRegression from './logistic-regression.out.txt?raw';
import knn from './knn.out.txt?raw';

import randomForest from './random-forest.out.txt?raw';
import gradientBoosting from './gradient-boosting.out.txt?raw';
import svm from './svm.out.txt?raw';
import naiveBayes from './naive-bayes.out.txt?raw';
import dbscan from './dbscan.out.txt?raw';
/**
 * Cifras de la salida de los ejercicios que aparecen en los textos del
 * explorador. Los .out.txt se generan y verifican con Python real
 * (scripts/check-ml-exercises.py); este test evita que el texto se quede
 * con cifras viejas si esa salida cambia.
 */
describe('cifras citadas en los textos', () => {
  it('Linear Regression: la casa de 120 m² y 3 habitaciones vale 425 millones', () => {
    expect(linearRegression).toContain('Casa de 120 m² y 3 habitaciones: 425 millones');
    expect(linearRegression).toContain('Por cada m² (b1): 2.47');
    expect(linearRegression).toContain('Por cada habitación (b2): 16.0');
  });

  it('Logistic Regression: «gratis» y enlaces suben el spam, el remitente conocido lo baja; 94 % de spam', () => {
    expect(logisticRegression).toContain('Pesos [gratis, enlaces, conocido]: [ 1.84  0.99 -1.75]');
    expect(logisticRegression).toContain('P(spam) = 94.4%');
    // El texto dice «e^1.84 ≈ 6.3».
    expect(Math.exp(1.84)).toBeCloseTo(6.3, 1);
  });

  it('Decision Tree: profundidad 15 → 99.7 % en entrenamiento y 70 % en datos nuevos; de las cuatro profundidades que imprime el ejercicio, la 3 es la que mejor generaliza', () => {
    expect(decisionTree).toMatch(/^\s*15 \|\s+99\.7% \|\s+70\.0%$/m);
    expect(decisionTree).toMatch(/^\s*3 \|\s+78\.0% \|\s+73\.3%$/m);
  });

  it('Decision Tree: «ingreso ≤ 2.50» y «deuda > 0.88», los dos detalles que comenta Ejemplo real', () => {
    expect(decisionTree).toContain('|   |   |--- deuda >  0.88');
    expect(decisionTree).toContain('|   |   |--- ingreso <= 2.50');
  });

  it('KNN: Beto calificó igual que Ana (distancia 0) e Interestelar es la primera recomendación', () => {
    expect(knn).toContain('Vecino: Beto  distancia = 0.00');
    expect(knn).toMatch(/Recomendaciones para Ana.*\n\s+Interestelar\s+3\.7 \/ 5/);
  });

  it('KNN: Alien y Matrix empatan en 1.3, así que no se le recomiendan a Ana', () => {
    expect(knn).toMatch(/Alien\s+1\.3 \/ 5/);
    expect(knn).toMatch(/Matrix\s+1\.3 \/ 5/);
  });

  it('Random Forest: 30 % de fraudes; el árbol solo 77.7 % y el bosque 82.3 % en compras nuevas, ambos 100 % en entrenamiento', () => {
    expect(randomForest).toContain('Fraudes: 303 de 1000 compras (30%)');
    expect(randomForest).toContain('Un árbol solo   → entrenamiento 100.0% | datos nuevos 77.7%');
    expect(randomForest).toContain('Bosque de 100   → entrenamiento 100.0% | datos nuevos 82.3%');
  });

  it('Random Forest: «antigüedad» saca 0.12 por impureza (más que «intentos») y −0.006 por permutación', () => {
    expect(randomForest).toMatch(/^\s+intentos\s+0\.06\s+0\.015$/m);
    expect(randomForest).toMatch(/^\s+antigüedad\s+0\.12\s+-0\.006$/m);
    expect(randomForest).toMatch(/^\s+monto\s+0\.44\s+0\.139$/m);
  });

  it('Gradient Boosting: la pérdida en datos nuevos toca fondo (0.504) con 24 árboles y sube a 0.611 con 300', () => {
    expect(gradientBoosting).toContain('Impagos: 271 de 800 clientes');
    expect(gradientBoosting).toContain('Menor pérdida en datos nuevos: 0.504 con 24 árboles');
    expect(gradientBoosting).toMatch(/^\s+1 \|\s+0\.620 \|\s+0\.619$/m);
    expect(gradientBoosting).toMatch(/^\s+300 \|\s+0\.265 \|\s+0\.611$/m);
  });

  it('Gradient Boosting: en entrenamiento la pérdida baja en cada fila de la tabla (de 0.620 a 0.265)', () => {
    const train = [...gradientBoosting.matchAll(/^\s+\d+ \|\s+([\d.]+) \|/gm)].map((m) => Number(m[1]));
    expect(train).toEqual([0.62, 0.53, 0.437, 0.386, 0.317, 0.265]);
    for (let i = 1; i < train.length; i++) expect(train[i]).toBeLessThan(train[i - 1]);
  });

  it('SVM: RBF con C = 1 acierta 98.7 % (7 fallos de 540) y guarda 593 de 1257; C = 100, 99.4 %; C = 0.01, 18.3 % con 1257 vectores', () => {
    expect(svm).toContain('1257 imágenes para entrenar, 540 nuevas para probar');
    expect(svm).toMatch(/^rbf\s+1\s+98\.7%\s+593$/m);
    expect(svm).toMatch(/^rbf\s+100\s+99\.4%\s+528$/m);
    expect(svm).toMatch(/^rbf\s+0\.01\s+18\.3%\s+1257$/m);
    expect(svm).toMatch(/^linear\s+1\s+98\.5%\s+386$/m);
    expect(svm).toContain('Con RBF y C = 1 falla 7 de 540.');
  });
  it('Naive Bayes: 16 reseñas, 38 palabras; 93 %, 5 % y 28 %; «nueva» se ignora', () => {
    expect(naiveBayes).toContain('16 reseñas, 38 palabras distintas');
    expect(naiveBayes).toContain('Prior: P(positiva) = 0.50');
    expect(naiveBayes).toMatch(/excelente calidad llegó rápido\s+93%/);
    expect(naiveBayes).toMatch(/no funciona mala compra\s+5%/);
    expect(naiveBayes).toMatch(/llegó la batería nueva\s+28%/);
    expect(naiveBayes).toContain('«llegó» multiplica los odds de positiva por 0.70');
    expect(naiveBayes).toContain('«batería» multiplica los odds de positiva por 1.05');
    expect(naiveBayes).toContain('«la» multiplica los odds de positiva por 0.53');
    expect(naiveBayes).toContain('«nueva» no estaba en el entrenamiento: se ignora');
  });
  it('DBSCAN: 145 reportes; con 300 m, 3 zonas (62, 40, 30) y 13 de ruido; 150 m → 7 zonas y 32; 800 m → 2 zonas', () => {
    expect(dbscan).toContain('145 reportes');
    expect(dbscan).toContain('eps = 300 m → 3 zonas [62, 40, 30], ruido: 13');
    expect(dbscan).toContain('eps = 150 m → 7 zonas [39, 28, 13, 12, 10, 6, 5], ruido: 32');
    expect(dbscan).toContain('eps = 800 m → 2 zonas [106, 31], ruido: 8');
  });
  it('DBSCAN: K-Means con K = 3 manda 17 de 60 reportes de la avenida a otra zona; el aislado más lejano queda a 2.2 km', () => {
    expect(dbscan).toContain('K-Means (K = 3) manda 17 de los 60 reportes de la avenida a otra zona');
    expect(dbscan).toContain('mete los 15 aislados en alguna zona: el más lejano queda a 2.2 km de su centro');
  });
});
