// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PCA_BEST_ANGLE, PcaOva } from './PcaOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';

describe('PcaOva', () => {
  it('a 0° captura 66.5 %; en el eje principal (34°), 94.6 %; en el perpendicular, 5.4 %', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<PcaOva />);
    expect(status(container)).toContain('Eje a 0°: captura 66.5 % de la varianza');
    expect(status(container)).toContain('Se pierde: 33.5 %');
    expect(PCA_BEST_ANGLE).toBe(34);
    fireEvent.click(screen.getByRole('button', { name: 'Ir al eje de máxima varianza' }));
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('34°');
    expect(status(container)).toContain('captura 94.6 %');
    fireEvent.change(screen.getByRole('slider'), { target: { value: '124' } });
    expect(status(container)).toContain('captura 5.4 %');
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }));
    expect(status(container)).toContain('Eje a 0°');
    expect(error).not.toHaveBeenCalled();
  });

  it('el svg es una imagen con 20 puntos y sus 20 proyecciones; el hint va fuera del readout', () => {
    const { container } = render(<PcaOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('circle[r="6"]')).toHaveLength(20);
    expect(svg?.querySelectorAll('circle.mlx-pca-proj')).toHaveLength(20);
    const hint = screen.getByText(/las líneas rosas son lo que se pierde/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });
});
