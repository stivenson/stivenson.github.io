import { describe, expect, it } from 'vitest';
import linearRegression from './linear-regression.out.txt?raw';
import decisionTree from './decision-tree.out.txt?raw';
import logisticRegression from './logistic-regression.out.txt?raw';
import knn from './knn.out.txt?raw';

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
});
