// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LogisticRegressionOva } from './LogisticRegressionOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const hitsText = () => screen.getByText(/^Aciertos:/).querySelector('b')?.textContent;
const exampleText = () => screen.getByText(/^Con x = 4:/).textContent ?? '';
const sliders = () => screen.getAllByRole('slider') as HTMLInputElement[];

describe('LogisticRegressionOva', () => {
  it('al abrir acierta 15 de 18 y «Mejor ajuste» deja 16 de 18 con b₀ = −6.6 y b₁ = 1.95', () => {
    const error = vi.spyOn(console, 'error');
    render(<LogisticRegressionOva />);
    expect(hitsText()).toBe('15 de 18');
    expect(exampleText()).toContain('z = -4.0 + 1.00·4 = 0.00');

    fireEvent.click(screen.getByRole('button', { name: 'Mejor ajuste (método de Newton)' }));
    expect(hitsText()).toBe('16 de 18');
    const [b0, b1, threshold] = sliders();
    expect(b0.getAttribute('aria-valuetext')).toBe('-6.6');
    expect(Number(b0.value)).toBeCloseTo(-6.6, 5);
    expect(b1.getAttribute('aria-valuetext')).toBe('1.95');
    expect(Number(b1.value)).toBeCloseTo(1.95, 5);
    expect(threshold.getAttribute('aria-valuetext')).toBe('0.50');
    expect(error).not.toHaveBeenCalled();
  });

  it('con b₁ negativo el readout resta con «−» en vez de mostrar «+ -»', () => {
    const error = vi.spyOn(console, 'error');
    render(<LogisticRegressionOva />);
    fireEvent.change(sliders()[1], { target: { value: '-0.5' } });
    const text = exampleText();
    expect(text).toContain('z = -4.0 − 0.50·4 = -6.00');
    expect(text).not.toContain('+ -');
    expect(error).not.toHaveBeenCalled();
  });

  it('el texto fijo sobre los círculos rosa va en la indicación, no en el readout', () => {
    const { container } = render(<LogisticRegressionOva />);
    const readout = container.querySelector('[role="status"]');
    expect(readout?.textContent).not.toMatch(/borde rosa/);
    expect(container.querySelector('figcaption')?.textContent).toMatch(/borde rosa están mal clasificados/);
  });
});
