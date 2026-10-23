import { describe, expect, it } from 'vitest';
import linearRegression from './linear-regression.out.txt?raw';
import decisionTree from './decision-tree.out.txt?raw';
import logisticRegression from './logistic-regression.out.txt?raw';
import knn from './knn.out.txt?raw';

import randomForest from './random-forest.out.txt?raw';
import gradientBoosting from './gradient-boosting.out.txt?raw';
import svm from './svm.out.txt?raw';
import naiveBayes from './naive-bayes.out.txt?raw';
import pca from './pca.out.txt?raw';
import hierarchical from './hierarchical-clustering.out.txt?raw';
import kMeans from './k-means.out.txt?raw';
import dbscan from './dbscan.out.txt?raw';
import mlp from './mlp.out.txt?raw';
import cnn from './cnn.out.txt?raw';
import rnn from './rnn.out.txt?raw';
import transformer from './transformer.out.txt?raw';
import autoencoders from './autoencoders.out.txt?raw';
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
    // El texto dice «e^{1.84} ≈ 6.3».
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

  it('KNN: pesos por distancia usan la coincidencia exacta y la evaluación aparte reserva la prueba', () => {
    expect(knn).toContain('weights=distance: Alien=1.0, Matrix=2.0, Interestelar=2.0');
    expect(knn).toContain('Clasificación: entrenamiento=106, validación=36, prueba=36');
    expect(knn).toContain('Elegido con validación: k=11, weights=uniform, p=1');
    expect(knn).toContain('brute y kd_tree coinciden en validación: True');
    expect(knn).toContain('Prueba final: 97.2%, errores=1 de 36');
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

  it('Gradient Boosting: elige tasa y etapas con validación y evalúa una prueba separada', () => {
    expect(gradientBoosting).toContain('Clientes: entrenamiento=480, validación=160, prueba=160');
    expect(gradientBoosting).toContain('Elegido con validación: tasa=0.03, árboles=129, pérdida=0.575');
    expect(gradientBoosting).toContain('Prueba final: pérdida=0.509');
    expect(gradientBoosting.match(/^0\./gm)).toHaveLength(3);
  });

  it('SVM: elige C, kernel y gamma con validación y reserva la prueba final', () => {
    expect(svm).toContain('Imágenes: entrenamiento=1077, validación=360, prueba=360');
    expect(svm).toContain('Elegido con validación: kernel=rbf, C=100, gamma=0.001');
    expect(svm).toContain('Prueba final: 97.8%, errores=8 de 360');
    expect(svm).toContain('Vectores de soporte: 413 de 1077');
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
  it('K-Means: la inercia cae de 600.0 a 250.0 y a 39.5 hasta K = 3 y luego apenas baja; la silueta es máxima en K = 3 (0.79)', () => {
    expect(kMeans).toMatch(/^1 \|\s+600\.0 \|\s+—$/m);
    expect(kMeans).toMatch(/^2 \|\s+250\.0 \| 0\.60$/m);
    expect(kMeans).toMatch(/^3 \|\s+39\.5 \| 0\.79$/m);
    expect(kMeans).toMatch(/^4 \|\s+33\.8 \| 0\.64$/m);
    const sil = [...kMeans.matchAll(/^\d \|\s+[\d.]+ \| (0\.\d\d)$/gm)].map((m) => Number(m[1]));
    expect(sil).toEqual([0.6, 0.79, 0.64, 0.49, 0.33]);
    expect(Math.max(...sil)).toBe(0.79);
  });
  it('K-Means: tres segmentos de 100 clientes (114 mil y 1.9 visitas, 301 mil y 11.5, 447 mil y 3.9)', () => {
    expect(kMeans).toContain('100 clientes | gasto 114 mil |  1.9 visitas al mes');
    expect(kMeans).toContain('100 clientes | gasto 301 mil | 11.5 visitas al mes');
    expect(kMeans).toContain('100 clientes | gasto 447 mil |  3.9 visitas al mes');
  });
  it('Hierarchical Clustering: cada patrón se une por debajo de 0.06 y los patrones a 0.96 y 1.48; con 3 grupos salen los 3 patrones', () => {
    const heights = [...hierarchical.matchAll(/altura ([\d.]+) → grupo de (\d+) genes/g)].map((m) => [Number(m[1]), Number(m[2])]);
    expect(heights).toEqual([
      [0.05, 4],
      [0.06, 4],
      [0.96, 8],
      [1.48, 12],
    ]);
    // «cada patrón queda unido por debajo de 0.07»: las uniones de 4 genes se imprimen como 0.05 y 0.06 (< 0.065).
    expect(heights[1][0]).toBeLessThan(0.07);
    expect(hierarchical).toContain('grupo 1: sube-1, sube-2, sube-3, sube-4\n  grupo 2: pico-1, pico-2, pico-3, pico-4\n  grupo 3: baja-1, baja-2, baja-3, baja-4');
    expect(hierarchical).toContain('grupo 2: baja-1, baja-2, baja-3, baja-4, pico-1, pico-2, pico-3, pico-4');
    expect(hierarchical).toContain('Correlación cofenética: 0.87 (cerca de 1 = el árbol respeta bien las distancias)');
  });
  it('PCA: 1797 imágenes de 64 píxeles; varianza retenida y error típico por píxel; 21 componentes para el 90 %', () => {
    expect(pca).toContain('1797 imágenes de 64 píxeles');
    expect(pca).toContain('k números | varianza retenida | error típico por píxel');
    const rows = [...pca.matchAll(/^\s+(\d+) \|\s+(\d+)% \|\s+([\d.]+)$/gm)].map((m) => [Number(m[1]), Number(m[2]), Number(m[3])]);
    expect(rows).toEqual([
      [1, 15, 4.0],
      [2, 29, 3.66],
      [5, 54, 2.92],
      [10, 74, 2.22],
      [20, 89, 1.41],
      [40, 99, 0.47],
    ]);
    expect(pca).toContain('Para retener el 90 % bastan 21 de 64 componentes');
  });

  it('MLP: selecciona con validación y consulta la prueba final después', () => {
    expect(mlp).toContain('Datos: entrenamiento=1077, validación=360, prueba=360');
    expect(mlp).toContain('Elegido con validación: candidato 5 (96.4%)');
    expect(mlp).toContain('Prueba final: 97.2%, errores=10 de 360');
    expect(mlp).toContain('Pesos y sesgos aprendidos: 2410');
    expect(mlp).toContain('Aviso candidato 5: alcanzó el presupuesto sin convergencia declarada.');
  });

  it('CNN: usa un dígito manuscrito real; los filtros producen mapas 6×6 y pooling 3×3; 9 pesos contra 2304', () => {
    expect(cnn).toContain('[[33 27  0  0  0  0]\n [40 10  0 17 11  0]\n [35  0  0 26 24  0]\n [31  0  0 29 22  0]\n [33  0  0 28  4  0]\n [31 12  0  6  0  0]]');
    expect(cnn).toContain('[[13  2  0  0  9 18]');
    expect(cnn).toContain('[[13  0 18]\n [ 0  5  4]\n [ 8 21  5]]');
    expect(cnn.match(/Tras max pooling 2×2 \(3×3\)/g)).toHaveLength(2);
    expect(cnn).toContain('Pesos de un filtro de 3×3: 9, los mismos en las 36 posiciones');
    expect(cnn).toContain('Una capa densa de 64 píxeles a 36 salidas necesitaría 2304 pesos');
  });

  it('RNN: con w = 0.9 la influencia del primer dato baja de 5.0e-01 a 2.4e-02 (10), 6.2e-06 (20) y 5.8e-14 (50); w = 0.5 → 2.0e-04 con 10; comprobación 0.0242', () => {
    const row = (T: number) => rnn.match(new RegExp(`^\\s+${T} \\|\\s+(\\S+) \\|\\s+(\\S+) \\|\\s+(\\S+)$`, 'm'))!.slice(1);
    expect(row(1)).toEqual(['5.0e-01', '5.0e-01', '5.0e-01']);
    expect(row(10)).toEqual(['2.0e-04', '2.4e-02', '4.3e-02']);
    expect(row(20)[1]).toBe('6.2e-06');
    expect(row(50)[1]).toBe('5.8e-14');
    expect(Number(row(50)[2])).toBeLessThan(1e-12); // aun con w = 1.0 se desvanece
    expect(rnn).toContain('regla de la cadena 0.0242, numérica 0.0242');
  });

  it('Transformer: banco atiende 0.41 a río y sale con naturaleza 1.23; con interés, dinero 1.38; causal 0.18 / 0.82; invertir: 0.00 sin posición y 0.30 con ella', () => {
    expect(transformer).toMatch(/^\s+banco\s+0\.09\s+0\.41\s+0\.09\s+0\.41$/m);
    expect(transformer).toContain('«banco» después de la atención: dinero 0.41, naturaleza 1.23');
    expect(transformer).toContain('«banco» después de la atención: dinero 1.38, naturaleza 0.35');
    expect(transformer).toMatch(/^\s+banco\s+0\.18\s+0\.82\s+0\.00\s+0\.00$/m);
    expect(transformer).toContain('sin codificación posicional: «banco» cambia 0.00 al invertir la frase');
    expect(transformer).toContain('con codificación posicional: «banco» cambia 0.30 al invertir la frase');
  });

  it('Autoencoders: 1000 normales y 10 fraudes; k = 1 detecta 9, k = 2 los 10 (0.17 contra 20.06); con k = 4 el error de los fraudes baja a 0.70 y detecta 9', () => {
    expect(autoencoders).toContain('1000 compras normales para entrenar y 10 fraudes que el modelo nunca ve');
    const rows = [...autoencoders.matchAll(/^\s+(\d) \|\s+([\d.]+) \|\s+([\d.]+) \|\s+(\d+) de 10$/gm)].map((m) => m.slice(1).map(Number));
    expect(rows).toEqual([
      [1, 0.52, 20.49, 9],
      [2, 0.17, 20.06, 10],
      [4, 0.01, 0.7, 9],
    ]);
  });
});
