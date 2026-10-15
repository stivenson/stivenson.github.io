// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GradientBoostingOva } from './GradientBoostingOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (container: HTMLElement) => container.querySelector('[role="status"]')?.textContent ?? '';
const progress = (container: HTMLElement) => container.querySelector('.mlx-ova-progress')?.textContent ?? '';
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Siguiente paso' }));

describe('GradientBoostingOva', () => {
  it('compara el MSE anterior con el actual y explica una corrección numérica', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<GradientBoostingOva />);

    expect(progress(container)).toBe('Predicción inicial · promedio · etapa 0 de 7');
    expect(status(container)).toContain('MSE actual2,41');
    expect(status(container)).toContain('Predicción base: el promedio de los 21 consumos');

    next();
    expect(progress(container)).toBe('Árbol 1 · primera corrección · etapa 1 de 7');
    expect(status(container)).toContain('MSE anterior2,41');
    expect(status(container)).toContain('MSE actual1,97');
    expect(status(container)).toContain('Este hito−18,1 %');
    expect(status(container)).toContain('Una corrección, con números');
    expect(status(container)).toContain('Primer árbol del hito: 0,3 ×');

    fireEvent.click(screen.getByRole('button', { name: 'Tasa 1: Agresiva' }));
    expect(progress(container)).toContain('Predicción inicial');
    expect(screen.getByRole('button', { name: 'Tasa 1: Agresiva' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Tasa 0,3: Equilibrada' }).getAttribute('aria-pressed')).toBe('false');
    expect(status(container)).toContain('MSE actual2,41');
    expect(error).not.toHaveBeenCalled();
  });

  it('contrasta la curva anterior con la nueva y resalta el residuo explicado', () => {
    const { container } = render(<GradientBoostingOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.classList.contains('mlx-gb-plot')).toBe(true);
    expect(svg?.querySelectorAll('.mlx-gb-point')).toHaveLength(21);
    expect(svg?.querySelectorAll('.mlx-gb-grid line')).toHaveLength(5);
    expect(svg?.querySelector('.mlx-gb-curve-previous')).toBeNull();

    next();
    expect(svg?.querySelectorAll('.mlx-gb-residual')).toHaveLength(21);
    expect(svg?.querySelector('.mlx-gb-curve-previous')).toBeTruthy();
    expect(svg?.querySelector('.mlx-gb-focus-before')).toBeTruthy();
    expect(svg?.querySelector('.mlx-gb-focus-ring')).toBeTruthy();
  });

  it('mantiene la guía visual junto al gráfico y advierte sobre el resultado final', () => {
    const { container } = render(<GradientBoostingOva />);
    const hint = screen.getByText(/Ejemplo de demanda eléctrica/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
    expect(hint.textContent).toContain('línea discontinua conserva la predicción anterior');
    expect(screen.getByRole('group', { name: 'Leyenda del gráfico' }).textContent).toContain('Predijo poco');

    for (let i = 0; i < 7; i += 1) next();
    expect(progress(container)).toBe('50 árboles · error mínimo · etapa 7 de 7');
    expect(status(container)).toContain('Ojo con el resultado final');
    expect(status(container)).toContain('puede empeorar si el bosque memoriza el ruido');
  });
});
