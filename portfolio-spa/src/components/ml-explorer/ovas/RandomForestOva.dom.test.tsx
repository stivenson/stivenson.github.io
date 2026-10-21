// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RandomForestOva } from './RandomForestOva';

const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock('./useMotion', () => ({ useInViewport: () => true, usePrefersReducedMotion: () => motion.reduced }));
afterEach(() => {
  motion.reduced = false; vi.useRealTimers();
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Siguiente paso' }));

describe('RandomForestOva', () => {
  it('con 1 árbol acierta 24 de 28 y 35 de 40 casos de comparación; con 100, 28 de 28 y 39 de 40', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<RandomForestOva />);
    expect(status(container)).toContain('Reproduce la animación');
    expect(container.querySelector('.mlx-ova-progress')?.textContent).toBe('Sin árboles · etapa 0 de 5');
    expect(screen.getByRole('slider', { name: /Árboles solicitados/ }).getAttribute('aria-valuetext')).toBe('100');

    next();
    expect(status(container)).toContain('24 de 28');
    expect(status(container)).toContain('85,7 % de acierto');
    expect(status(container)).toContain('35 de 40');
    expect(status(container)).toContain('87,5 % de acierto');
    expect(container.querySelector('.mlx-ova-progress')?.textContent).toBe('Bosque de 1 árbol · etapa 1 de 5');

    next();
    next();
    expect(status(container)).toContain('27 de 28');
    expect(status(container)).toContain('96,4 % de acierto');
    expect(status(container)).toContain('38 de 40');
    expect(status(container)).toContain('95 % de acierto');

    next();
    expect(status(container)).toContain('28 de 28');

    next();
    expect(status(container)).toContain('28 de 28');
    expect(status(container)).toContain('39 de 40');
    expect(error).not.toHaveBeenCalled();
  });

  it('el svg es una imagen (sin elementos enfocables) con los 28 clientes y 625 celdas', () => {
    const { container } = render(<RandomForestOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.classList.contains('mlx-rf-plot')).toBe(true);
    expect(svg?.querySelectorAll('circle')).toHaveLength(28);
    expect(svg?.querySelectorAll('rect')).toHaveLength(625);
    expect(svg?.querySelector('[tabindex]')).toBeNull();
    // Los dos clientes de ruido llevan un anillo.
    expect(svg?.querySelectorAll('path[fill="none"]')).toHaveLength(2);
  });

  it('la explicación va en el hint, fuera del readout', () => {
    const { container } = render(<RandomForestOva />);
    const hint = screen.getByText(/El bosque aprende de 28 clientes simulados/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
    expect(hint.textContent).toContain('anillo blanco: caso contradictorio');
    expect(hint.textContent).toContain('no sustituyen una evaluación independiente');
    expect(screen.getByText('Azul: paga')).toBeTruthy();
    expect(screen.getByText('Naranja: no paga')).toBeTruthy();
  });
  it('separa árboles solicitados de los que muestra el recorrido', () => {
    const { container } = render(<RandomForestOva />);
    next();
    expect(container.querySelector('.mlx-rf-summary')?.textContent).toContain('1 de 100 árboles');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar bosque final' }));
    expect(container.querySelector('.mlx-rf-summary')?.textContent).toContain('100 de 100 árboles');
    fireEvent.change(screen.getByRole('slider', { name: /Árboles solicitados/ }), { target: { value: '0' } });
    expect(container.querySelector('.mlx-rf-summary')?.textContent).toContain('1 de 1 árbol');
    expect(status(container)).toContain('35 de 40');
  });
  it('profundidad y mínimo por hoja modifican el cálculo y restaurar recupera el inicial', () => {
    const { container } = render(<RandomForestOva />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar bosque final' }));
    const colors = () => Array.from(container.querySelectorAll('.mlx-rf-cell'), (el) => [el.getAttribute('fill'), el.getAttribute('fill-opacity')]);
    const initial = colors();
    fireEvent.change(screen.getByRole('slider', { name: /Profundidad por árbol/ }), { target: { value: '1' } });
    expect(colors()).not.toEqual(initial);
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer ajustes' }));
    expect(colors()).toEqual(initial);
    fireEvent.change(screen.getByRole('slider', { name: /Mínimo de clientes/ }), { target: { value: '5' } });
    expect(colors()).not.toEqual(initial);
  });
  it('max_features y bootstrap recalculan el bosque final', () => {
    const { container } = render(<RandomForestOva />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar bosque final' }));
    const before = container.querySelector('.mlx-rf-plot')?.outerHTML;
    fireEvent.change(screen.getByRole('combobox', { name: /Variables por corte/ }), { target: { value: '2' } });
    expect(container.querySelector('.mlx-rf-plot')?.outerHTML).not.toBe(before);
    const both = container.querySelector('.mlx-rf-plot')?.outerHTML;
    fireEvent.click(screen.getByRole('checkbox', { name: /Muestreo con reposición/ }));
    expect(container.querySelector('.mlx-rf-plot')?.outerHTML).not.toBe(both);
  });
  it('el resultado final detiene los temporizadores sin perder los ajustes', () => {
    vi.useFakeTimers();
    const { container } = render(<RandomForestOva autoPlay />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar bosque final' }));
    fireEvent.change(screen.getByRole('slider', { name: /Mínimo de clientes/ }), { target: { value: '3' } });
    expect(vi.getTimerCount()).toBe(0);
    expect(container.querySelector('.mlx-rf-summary')?.textContent).toContain('Mínimo por hoja 3');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar bosque final' }));
    expect(container.querySelector('.mlx-rf-summary')?.textContent).toContain('0 de 100');
    next();
    expect(container.querySelector('.mlx-rf-summary')?.textContent).toContain('1 de 100');
  });
  it('movimiento reducido conserva el resultado al cambiar ajustes', () => {
    vi.useFakeTimers(); motion.reduced = true;
    const { container } = render(<RandomForestOva autoPlay />);
    fireEvent.change(screen.getByRole('slider', { name: /Profundidad por árbol/ }), { target: { value: '2' } });
    expect(container.querySelector('.mlx-rf-summary')?.textContent).toContain('100 de 100');
    expect(vi.getTimerCount()).toBe(0);
  });
  it('abre la ficha de diversidad y devuelve el foco al cerrar', () => {
    render(<RandomForestOva />);
    const trigger = screen.getByRole('button', { name: /diversidad entre árboles/ });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Diversidad entre árboles (max_features)' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
    expect(document.activeElement).toBe(trigger);
  });

});
