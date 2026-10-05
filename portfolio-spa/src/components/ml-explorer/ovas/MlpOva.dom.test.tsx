// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MlpOva } from './MlpOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const slider = (name: string) => screen.getByRole('slider', { name: new RegExp(`^${name}`) });

describe('MlpOva', () => {
  it('arranca con 15 de 20 (una sola recta útil); la solución acierta 20; Restablecer vuelve a 15', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<MlpOva />);
    expect(status(container)).toContain('Aciertos: 15 de 20');
    expect(status(container)).toContain('La neurona oculta 2 no mira x ni y');
    fireEvent.click(screen.getByRole('button', { name: 'Ver una solución' }));
    expect(status(container)).toContain('Aciertos: 20 de 20');
    expect(status(container)).toContain('La red separa XOR');
    expect(slider('Oculta 2 · sesgo').getAttribute('aria-valuetext')).toBe('30');
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }));
    expect(status(container)).toContain('Aciertos: 15 de 20');
    expect(error).not.toHaveBeenCalled();
  });

  it('9 sliders, 3 por neurona; mover un peso cambia la predicción', () => {
    const { container } = render(<MlpOva />);
    expect(screen.getAllByRole('slider')).toHaveLength(9);
    expect(screen.getAllByRole('group', { name: /^Neurona/ })).toHaveLength(3);
    // Con el peso de la salida hacia la oculta 1 en 0, la salida es constante (σ(−5) < 0.5): todo es clase 0.
    fireEvent.change(slider('Salida · peso de oculta 1'), { target: { value: '0' } });
    expect(status(container)).toContain('Aciertos: 10 de 20');
  });

  it('la receta del hint (oculta 2 en −20, −20, 30; salida en 20, 20, −30) acierta 20 de 20 desde el arranque', () => {
    const { container } = render(<MlpOva />);
    expect(screen.getByText(/la oculta 2 en −20, −20 y 30, y la salida en 20, 20 y −30/)).toBeTruthy();
    const recipe: [string, string][] = [
      ['Oculta 2 · peso de x', '-20'],
      ['Oculta 2 · peso de y', '-20'],
      ['Oculta 2 · sesgo', '30'],
      ['Salida · peso de oculta 1', '20'],
      ['Salida · peso de oculta 2', '20'],
      ['Salida · sesgo', '-30'],
    ];
    for (const [name, value] of recipe) fireEvent.change(slider(name), { target: { value } });
    expect(status(container)).toContain('Aciertos: 20 de 20');
    expect(screen.getByRole('group', { name: 'Neurona de salida' })).toBeTruthy();
  });

  it('el svg es una imagen con 20 puntos, 400 celdas y la recta de la oculta 1; el hint va fuera del readout', () => {
    const { container } = render(<MlpOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('circle')).toHaveLength(20);
    expect(svg?.querySelectorAll('rect.mlx-mlp-cell')).toHaveLength(400);
    expect(svg?.querySelectorAll('line')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Ver una solución' }));
    expect(svg?.querySelectorAll('line')).toHaveLength(2);
    const hint = screen.getByText(/ninguna recta los separa/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });
});
