import { describe, expect, it } from 'vitest';
import { createPlot } from './plot';

describe('createPlot', () => {
  const plot = createPlot(360, 300, 30, [0, 10], [0, 8]);

  it('lleva los extremos del dominio a los bordes del área útil', () => {
    expect(plot.sx(0)).toBe(30);
    expect(plot.sx(10)).toBe(330);
    expect(plot.sy(0)).toBe(270); // el eje y del SVG crece hacia abajo
    expect(plot.sy(8)).toBe(30);
  });

  it('ix e iy invierten sx y sy', () => {
    expect(plot.ix(plot.sx(3.3))).toBeCloseTo(3.3);
    expect(plot.iy(plot.sy(6.1))).toBeCloseTo(6.1);
  });

  it('lanza un error con un dominio vacío', () => {
    expect(() => createPlot(360, 300, 30, [2, 2], [0, 8])).toThrow('Dominio vacío en createPlot');
    expect(() => createPlot(360, 300, 30, [0, 10], [4, 4])).toThrow('Dominio vacío en createPlot');
  });
});
