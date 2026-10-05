// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AutoencoderOva } from './AutoencoderOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const setK = (k: number) => fireEvent.change(screen.getByRole('slider'), { target: { value: String(k) } });

describe('AutoencoderOva', () => {
  it('k = 2: normales 0.012, fraudes 2.44, umbral 0.035 y los 3 fraudes detectados', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<AutoencoderOva />);
    expect(status(container)).toContain('Error medio: normales 0.012 · fraudes 2.44');
    expect(status(container)).toContain('Umbral: 0.035');
    expect(status(container)).toContain('Fraudes detectados: 3 de 3');
    expect(error).not.toHaveBeenCalled();
  });

  it('k = 1 detecta 1; k = 5 detecta 2; k = 6 copia todo y no detecta ninguno; Restablecer vuelve a k = 2', () => {
    const { container } = render(<AutoencoderOva />);
    setK(1);
    expect(status(container)).toContain('Fraudes detectados: 1 de 3');
    setK(5);
    expect(status(container)).toContain('Fraudes detectados: 2 de 3');
    setK(6);
    expect(status(container)).toContain('Error medio: normales 0 · fraudes 0');
    expect(status(container)).toContain('Fraudes detectados: 0 de 3');
    expect(status(container)).toContain('Sin cuello de botella');
    expect(container.querySelector('svg')?.textContent).not.toContain('la más rara');
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }));
    expect(status(container)).toContain('Fraudes detectados: 3 de 3');
  });

  it('el svg es una imagen con 43 barras (3 de fraude) y marca la compra más rara; el hint va fuera del readout', () => {
    const { container } = render(<AutoencoderOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('.mlx-ae-bar')).toHaveLength(43);
    expect(svg?.querySelectorAll('.mlx-ae-bar.is-fraud')).toHaveLength(3);
    expect(svg?.textContent).toContain('la más rara');
    const hint = screen.getByText(/copia todo, también el fraude/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });
});
