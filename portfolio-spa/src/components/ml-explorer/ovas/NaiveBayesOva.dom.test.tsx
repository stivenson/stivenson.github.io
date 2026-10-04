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

describe('NaiveBayesOva', () => {
  it('la frase inicial da 93 %, con el factor de cada palabra', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<NaiveBayesOva />);
    expect(status(container)).toBe('P(positiva) = 93 %Predicción: 🟠 positiva');
    expect(words(container)).toEqual([
      'Odds iniciales (prior): 1.00',
      '«excelente»: ×5.27',
      '«calidad»: ×1.05',
      '«llegó»: ×0.70',
      '«rápido»: ×3.16',
      'Odds finales: 12.34 → probabilidad 93 %',
    ]);
    expect(error).not.toHaveBeenCalled();
  });

  it('escribir cambia el resultado; las palabras desconocidas se ignoran', () => {
    const { container } = render(<NaiveBayesOva />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'no funciona mala compra' } });
    expect(status(container)).toContain('P(positiva) = 5 %');
    expect(status(container)).toContain('🔵 negativa');

    fireEvent.click(screen.getByRole('button', { name: 'llegó la batería nueva' }));
    expect(status(container)).toContain('P(positiva) = 28 %');
    expect(words(container)).toContain('«nueva»: no la conoce, se ignora');

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    expect(status(container)).toBe('P(positiva) = 50 %Predicción: empate');
  });

  it('la lista de palabras y el hint van fuera del readout', () => {
    const { container } = render(<NaiveBayesOva />);
    const live = container.querySelector('[role="status"]');
    expect(live?.contains(container.querySelector('.mlx-nb-words'))).toBe(false);
    expect(live?.contains(screen.getByText(/Las palabras que el modelo nunca vio no cuentan/))).toBe(false);
  });
});
