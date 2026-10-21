// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NaiveBayesOva } from './NaiveBayesOva';

// Las pruebas de interacción examinan resultados estables; el hook tiene pruebas propias en otras OVAs.
const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock('./useMotion', () => ({ useInViewport: () => true, usePrefersReducedMotion: () => motion.reduced }));
afterEach(() => { cleanup(); motion.reduced = false; vi.useRealTimers(); vi.restoreAllMocks(); });
const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const words = (c: HTMLElement) => Array.from(c.querySelectorAll('.mlx-nb-words li'), (li) => li.textContent);

describe('NaiveBayesOva', () => {
  it('reproduce los valores de Python con los ajustes iniciales', () => {
    const { container } = render(<NaiveBayesOva />);
    expect(status(container)).toContain('P(positiva) = 93 %');
    expect(status(container)).toContain('Palabras leídas: 4 de 4');
    expect(words(container)).toEqual([
      'Odds iniciales: 1.00', '«excelente»: factor ×5.27', '«calidad»: factor ×1.05',
      '«llegó»: factor ×0.70', '«rápido»: factor ×3.16', 'Odds finales: 12.34 · P(positiva): 93 %',
    ]);
  });

  it('alpha recalcula la evidencia; restaurar devuelve el resultado original', () => {
    const { container } = render(<NaiveBayesOva />);
    const alpha = screen.getByRole('slider', { name: /Suavizado/ });
    fireEvent.change(alpha, { target: { value: '5' } });
    expect(status(container)).toContain('alpha = 5.0');
    expect(status(container)).toContain('P(positiva) = 70 %');
    expect(words(container)).toContain('«excelente»: factor ×1.83');
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer alpha y prior' }));
    expect(status(container)).toContain('P(positiva) = 93 %');
  });

  it('el prior modifica el punto de partida y el resultado, sin cambiar los factores de palabras', () => {
    const { container } = render(<NaiveBayesOva />);
    const evidence = words(container).slice(1, -1);
    fireEvent.change(screen.getByRole('slider', { name: /Probabilidad inicial/ }), { target: { value: '0.2' } });
    expect(status(container)).toContain('prior positivo = 20 %');
    expect(status(container)).toContain('P(positiva) = 76 %');
    expect(words(container).slice(1, -1)).toEqual(evidence);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'desconocidísima' } });
    expect(status(container)).toContain('P(positiva) = 20 %');
    expect(container.querySelector('.mlx-nb-chart')?.getAttribute('aria-label')).toContain('20 %');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    expect(status(container)).toContain('P(positiva) = 20 %');
  });

  it('los ejemplos y las palabras desconocidas conservan su comportamiento', () => {
    const { container } = render(<NaiveBayesOva />);
    fireEvent.click(screen.getByRole('button', { name: 'no funciona mala compra' }));
    expect(status(container)).toContain('P(positiva) = 5 %');
    fireEvent.click(screen.getByRole('button', { name: 'llegó la batería nueva' }));
    expect(status(container)).toContain('P(positiva) = 28 %');
    expect(words(container)).toContain('«nueva»: no está en el vocabulario, se ignora');
  });

  it('2D y 3D muestran el mismo cálculo y la vista 3D no falla', () => {
    const { container } = render(<NaiveBayesOva />);
    const before = status(container);
    fireEvent.click(screen.getByRole('button', { name: '3D' }));
    expect(status(container)).toBe(before);
    expect(container.querySelectorAll('.mlx-nb-3d-evidence')).toHaveLength(4);
    fireEvent.click(screen.getByRole('button', { name: '2D' }));
    expect(status(container)).toBe(before);
  });

  it('el resultado completo detiene el recorrido y cambiar alpha actualiza el resultado visible', () => {
    vi.useFakeTimers();
    const { container } = render(<NaiveBayesOva autoPlay />);
    expect(status(container)).toContain('Palabras leídas: 0 de 4');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar resultado completo' }));
    expect(status(container)).toContain('Palabras leídas: 4 de 4');
    expect(status(container)).toContain('P(positiva) = 93 %');
    fireEvent.change(screen.getByRole('slider', { name: /Suavizado/ }), { target: { value: '5' } });
    expect(status(container)).toContain('P(positiva) = 70 %');
    expect(vi.getTimerCount()).toBe(0);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar resultado completo' }));
    expect(status(container)).toContain('Palabras leídas: 0 de 4');
  });

  it('con movimiento reducido muestra el resultado final sin temporizadores', () => {
    vi.useFakeTimers();
    motion.reduced = true;
    const { container } = render(<NaiveBayesOva autoPlay />);
    expect(status(container)).toContain('Palabras leídas: 4 de 4');
    expect(status(container)).toContain('P(positiva) = 93 %');
    fireEvent.change(screen.getByRole('slider', { name: /Suavizado/ }), { target: { value: '5' } });
    expect(status(container)).toContain('P(positiva) = 70 %');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('la ficha de alpha se puede abrir desde los ajustes de la OVA', () => {
    render(<NaiveBayesOva />);
    fireEvent.click(screen.getByRole('button', { name: 'alpha mayor' }));
    expect(screen.getByRole('dialog', { name: 'Suavizado aditivo (alpha)' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
