// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GradientBoostingOva } from './GradientBoostingOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const setSteps = (v: number) => fireEvent.change(screen.getByRole('slider'), { target: { value: String(v) } });

describe('GradientBoostingOva', () => {
  it('parte del promedio (MSE 2.41) y cada árbol baja el error; la tasa cambia la velocidad', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<GradientBoostingOva />);
    expect(status(container)).toBe('Con 0 árboles y tasa 0.3: error cuadrático medio 2.41');

    setSteps(1);
    expect(status(container)).toBe('Con 1 árbol y tasa 0.3: error cuadrático medio 1.97');
    setSteps(10);
    expect(status(container)).toContain('0.73');

    fireEvent.click(screen.getByRole('button', { name: '1' }));
    expect(screen.getByRole('button', { name: '1' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: '0.3' }).getAttribute('aria-pressed')).toBe('false');
    expect(status(container)).toBe('Con 10 árboles y tasa 1: error cuadrático medio 0.15');

    fireEvent.click(screen.getByRole('button', { name: '0.1' }));
    setSteps(50);
    expect(status(container)).toBe('Con 50 árboles y tasa 0.1: error cuadrático medio 0.48');

    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }));
    expect(status(container)).toBe('Con 0 árboles y tasa 0.3: error cuadrático medio 2.41');
    expect(error).not.toHaveBeenCalled();
  });

  it('el svg es una imagen con los 21 puntos y una línea de error por punto', () => {
    const { container } = render(<GradientBoostingOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('circle')).toHaveLength(21);
    expect(svg?.querySelectorAll('line')).toHaveLength(21);
  });

  it('la explicación va en el hint, fuera del readout', () => {
    const { container } = render(<GradientBoostingOva />);
    const hint = screen.getByText(/Con 0 árboles el modelo predice el promedio/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
    expect(hint.textContent).toContain('El error que ves es sobre estos mismos puntos: llevarlo a casi 0 no es mérito, es memorizar.');
  });
});
