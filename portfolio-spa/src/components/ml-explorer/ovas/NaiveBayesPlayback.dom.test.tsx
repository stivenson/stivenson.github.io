// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NaiveBayesOva } from './NaiveBayesOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const words = (c: HTMLElement) => Array.from(c.querySelectorAll('.mlx-nb-words li'), (li) => li.textContent);
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Siguiente paso' }));
const advance = (steps: number) => Array.from({ length: steps }, next);

describe('NaiveBayesOva: reproducción guiada', () => {
  it('conecta cada palabra con su factor, cambio y nuevo resultado', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<NaiveBayesOva autoPlay />);

    expect(screen.getByText('Antes de leer')).toBeTruthy();
    expect(status(container)).toContain('P(positiva) = 50 %');

    next();
    expect(container.querySelector('.mlx-ova-progress')?.textContent).toContain('Palabra 1 de 4');
    expect(container.querySelector('.mlx-nb-token.is-current')?.textContent).toContain('excelente');
    expect(container.querySelectorAll('.mlx-nb-segment.is-current')).toHaveLength(1);
    expect(status(container)).toContain('Factor: ×5.27');
    expect(status(container)).toContain('Efecto: +34 puntos hacia positiva');
    expect(status(container)).toContain('P(positiva): 50 % → 84 %');

    advance(3);
    expect(status(container)).toContain('P(positiva) = 93 %');
    expect(status(container)).toContain('Predicción: positiva');
    expect(words(container)).toEqual([
      'Odds iniciales: 1.00',
      '«excelente»: factor ×5.27',
      '«calidad»: factor ×1.05',
      '«llegó»: factor ×0.70',
      '«rápido»: factor ×3.16',
      'Odds finales: 12.34 · P(positiva): 93 %',
    ]);
    expect(error).not.toHaveBeenCalled();
  });

  it('reinicia al cambiar la reseña y explica las palabras desconocidas', () => {
    const { container } = render(<NaiveBayesOva autoPlay />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'no funciona mala compra' } });
    expect(status(container)).toContain('P(positiva) = 50 %');
    advance(4);
    expect(status(container)).toContain('P(positiva) = 5 %');
    expect(status(container)).toContain('Predicción: negativa');

    fireEvent.click(screen.getByRole('button', { name: 'llegó la batería nueva' }));
    advance(4);
    expect(status(container)).toContain('P(positiva) = 28 %');
    expect(status(container)).toContain('Efecto: sin cambio');
    expect(words(container)).toContain('«nueva»: no está en el vocabulario, se ignora');

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    expect(status(container)).toContain('P(positiva) = 50 %');
    expect(status(container)).toContain('Predicción: solo probabilidad inicial');
  });

  it('mantiene la explicación breve fuera del estado dinámico', () => {
    const { container } = render(<NaiveBayesOva autoPlay />);
    const live = container.querySelector('[role="status"]');
    expect(live?.contains(container.querySelector('.mlx-nb-words'))).toBe(false);
    expect(live?.contains(screen.getByText(/El modelo aprende de 16 reseñas/))).toBe(false);
  });

  it('resalta el último avance también en la vista 3D', () => {
    const { container } = render(<NaiveBayesOva autoPlay />);
    fireEvent.click(screen.getByRole('button', { name: '3D' }));
    next();

    expect(container.querySelector('svg[aria-label*="tridimensional"]')).toBeTruthy();
    expect(container.querySelectorAll('.mlx-nb-segment.is-current')).toHaveLength(2);
    expect(container.querySelector('.mlx-nb-3d-evidence.is-current')).toBeTruthy();
  });
});
