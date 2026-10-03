import { describe, expect, it } from 'vitest';
import linearRegression from './linear-regression.out.txt?raw';

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
});
