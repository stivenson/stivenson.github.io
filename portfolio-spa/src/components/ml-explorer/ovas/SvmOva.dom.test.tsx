// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SvmOva } from './SvmOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const setC = (i: number) => fireEvent.change(screen.getByRole('slider'), { target: { value: String(i) } });
const rings = (c: HTMLElement) => c.querySelectorAll('svg circle[r="10"]').length;
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Siguiente paso' }));
const advance = (steps: number) => {
  for (let i = 0; i < steps; i++) next();
};

describe('SvmOva', () => {
  it('lineal: C pequeño → margen ancho y muchos vectores de soporte; C grande → margen estrecho', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<SvmOva />);
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('1');
    expect(status(container)).toContain('Puntos observados: 22');

    advance(1);
    expect(status(container)).toContain('Vectores de soporte: 17 de 22');
    expect(status(container)).toContain('Ancho del margen: 7.03');

    advance(2);
    expect(status(container)).toContain('Vectores de soporte: 5 de 22');
    expect(status(container)).toContain('acierta 21 de 22 puntos');
    expect(status(container)).toContain('Ancho del margen: 2.13');
    expect(rings(container)).toBe(5);

    setC(4);
    advance(5);
    expect(status(container)).toContain('Vectores de soporte: 4 de 22');
    expect(status(container)).toContain('acierta 21 de 22 puntos');
    expect(status(container)).toContain('Ancho del margen: 1.94');
    expect(error).not.toHaveBeenCalled();
  });

  it('RBF con C = 10 rodea el punto raro y acierta los 22; con C = 1 lo deja pasar', () => {
    const { container } = render(<SvmOva />);
    fireEvent.click(screen.getByRole('button', { name: 'RBF (curvo)' }));
    expect(screen.getByRole('button', { name: 'RBF (curvo)' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('RBF: permite curvas; γ = 0.3.')).toBeTruthy();
    advance(3);
    expect(status(container)).toContain('Vectores de soporte: 19 de 22');
    expect(status(container)).toContain('acierta 21 de 22 puntos');
    expect(status(container)).not.toContain('margen');

    setC(3);
    advance(4);
    expect(status(container)).toContain('Vectores de soporte: 14 de 22');
    expect(status(container)).toContain('acierta 22 de 22 puntos');

    fireEvent.click(screen.getByRole('button', { name: 'Lineal' }));
    advance(3);
    expect(status(container)).toContain('Ancho del margen: 2.13');
  });

  it('el svg es una imagen con 22 puntos y 1024 celdas; el hint va fuera del readout', () => {
    const { container } = render(<SvmOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('circle[r="6"]')).toHaveLength(22);
    expect(svg?.querySelectorAll('rect')).toHaveLength(1024);
    const hint = screen.getByText(/La franja oscura es el margen/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
    expect(hint.textContent?.split(/\s+/).length).toBeLessThan(35);
  });

  it('hace visible la frontera verde y explica C en el paso actual', () => {
    const { container } = render(<SvmOva />);
    next();
    expect(container.querySelectorAll('.mlx-svm-cell.is-boundary').length).toBeGreaterThan(0);
    expect(status(container)).toContain('C bajo tolera más errores');
    expect(screen.getByText(/Prueba 1 de 3/).textContent).toContain('C = 0.01');
  });
});
