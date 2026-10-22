// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GradientBoostingOva } from './GradientBoostingOva';

const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock('./useMotion', () => ({ useInViewport: () => true, usePrefersReducedMotion: () => motion.reduced }));

afterEach(() => {
  motion.reduced = false;
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
    expect(status(container)).toContain('MSE actual · entrenamiento2,41');
    expect(status(container)).toContain('Predicción base: el promedio de los 21 consumos');

    next();
    expect(progress(container)).toBe('Árbol 1 · primera corrección · etapa 1 de 7');
    expect(status(container)).toContain('MSE anterior · entrenamiento2,41');
    expect(status(container)).toContain('MSE actual · entrenamiento1,97');
    expect(status(container)).toContain('Este hito−18,1 %');
    expect(status(container)).toContain('Una corrección, con números');
    expect(status(container)).toContain('Primer árbol del hito: 0,3 ×');

    fireEvent.click(screen.getByRole('button', { name: 'Tasa 1' }));
    expect(progress(container)).toContain('Predicción inicial');
    expect(screen.getByRole('button', { name: 'Tasa 1' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Tasa 0,3' }).getAttribute('aria-pressed')).toBe('false');
    expect(status(container)).toContain('MSE actual · entrenamiento2,41');
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
    expect(progress(container)).toBe('50 árboles · correcciones acumuladas · etapa 7 de 7');
    expect(status(container)).toContain('Ojo con el resultado final');
    expect(status(container)).toContain('No permite decidir cuántos árboles funcionarán mejor en días nuevos');
  });
  it('compara tasa y cantidad con el conjunto final, y restaura los ajustes', () => {
    const { container } = render(<GradientBoostingOva />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar conjunto final' }));
    const plot = () => container.querySelector('.mlx-gb-curve')?.getAttribute('d');
    const original = plot();
    fireEvent.change(screen.getByRole('combobox', { name: 'Árboles solicitados (n_estimators)' }), { target: { value: '10' } });
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('10 árboles');
    expect(screen.queryByRole('button', { name: 'Reproducir' })).toBeNull();
    expect(plot()).not.toBe(original);
    const ten = plot();
    fireEvent.click(screen.getByRole('button', { name: 'Tasa 0,1' }));
    expect(plot()).not.toBe(ten);
    expect(screen.getByLabelText('Resultado del conjunto completo').textContent).toContain('Con 10 árboles y tasa 0,1');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar conjunto final' }));
    expect(progress(container)).toContain('Predicción inicial');
    for (let i = 0; i < 4; i++) next();
    expect(progress(container)).toBe('10 árboles · correcciones acumuladas · etapa 4 de 4');
    expect(screen.getByRole('button', { name: 'Siguiente paso' }).hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer ajustes' }));
    expect(progress(container)).toContain('etapa 0 de 7');
    expect(screen.getByRole('combobox', { name: 'Árboles solicitados (n_estimators)' }).getAttribute('aria-label')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Tasa 0,3' }).getAttribute('aria-pressed')).toBe('true');
  });
  it('abre la ficha de tasa desde los ajustes y devuelve el foco al cerrar', () => {
    render(<GradientBoostingOva />);
    const opener = screen.getByRole('button', { name: /^tasa menor/ });
    fireEvent.click(opener);
    expect(screen.getByRole('dialog', { name: 'Tasa de aprendizaje (learning rate)' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
    expect(document.activeElement).toBe(opener);
  });

  it('con movimiento reducido muestra el resultado sin reproducir automáticamente', () => {
    motion.reduced = true;
    const { container } = render(<GradientBoostingOva autoPlay />);
    expect(progress(container)).toContain('50 árboles');
    expect(screen.queryByRole('button', { name: /Pausar/ })).toBeNull();
    fireEvent.change(screen.getByRole('combobox', { name: 'Árboles solicitados (n_estimators)' }), { target: { value: '10' } });
    expect(progress(container)).toContain('10 árboles');
  });

});
