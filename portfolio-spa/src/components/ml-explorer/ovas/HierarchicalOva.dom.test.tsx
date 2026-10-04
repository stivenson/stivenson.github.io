// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HierarchicalOva } from './HierarchicalOva';
import { CLUSTER_COLORS, OVA_COLORS } from './OvaFrame';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const cut = (v: string) => fireEvent.change(screen.getByRole('slider'), { target: { value: v } });

describe('HierarchicalOva', () => {
  it('corte inicial en 3.0: 3 grupos de 4; al bajar o subir el corte cambian los grupos', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<HierarchicalOva />);
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('3.0');
    expect(status(container)).toContain('Corte en 3.0: 3 grupos');
    expect(status(container)).toContain('Tamaños: 4, 4, 4');
    cut('2');
    expect(status(container)).toContain('Corte en 2.0: 4 grupos');
    expect(status(container)).toContain('Tamaños: 4, 4, 3, 1');
    cut('5.5');
    expect(status(container)).toContain('2 grupos');
    cut('6');
    expect(status(container)).toContain('Corte en 6.0: 1 grupo');
    cut('0');
    expect(status(container)).toContain('12 grupos');
    expect(error).not.toHaveBeenCalled();
  });

  it('dos imágenes: 12 puntos numerados y un dendrograma con 11 uniones y la línea de corte', () => {
    const { container } = render(<HierarchicalOva />);
    const [scatter, tree] = container.querySelectorAll('svg');
    expect(scatter.getAttribute('role')).toBe('img');
    expect(tree.getAttribute('role')).toBe('img');
    expect(scatter.querySelectorAll('circle')).toHaveLength(12);
    expect(tree.querySelectorAll('g path')).toHaveLength(22);
    expect(tree.querySelectorAll('line')).toHaveLength(1);
    // Hojas en el orden del dendrograma.
    expect(Array.from(tree.querySelectorAll('text'), (t) => t.textContent).join(' ')).toBe('2 3 1 4 6 7 5 8 12 9 10 11');
  });

  it('el hint (fuera del readout) cita el salto entre 2.2 y 5.2 y la unión del punto 12 a 2.15', () => {
    const { container } = render(<HierarchicalOva />);
    const hint = screen.getByText(/Mueve la línea de corte/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
    expect(hint.textContent).toContain('Entre 2.2 y 5.2');
    expect(hint.textContent).toContain('a altura 2.15');
  });

  it('uniones por encima del corte en gris, las de abajo y los puntos con el color de su grupo', () => {
    const { container } = render(<HierarchicalOva />);
    const tree = () => container.querySelectorAll('svg')[1];
    const strokes = () => Array.from(tree().querySelectorAll('g'), (g) => g.getAttribute('stroke'));
    const groupColors = new Set<string>(CLUSTER_COLORS);
    // Corte 3.0: las 2 uniones de arriba (5.2 y la raíz) quedan grises; las 9 de abajo, en color.
    expect(strokes().filter((s) => s === OVA_COLORS.axis)).toHaveLength(2);
    expect(strokes().filter((s) => s !== null && groupColors.has(s))).toHaveLength(9);
    const fills = Array.from(container.querySelectorAll('svg')[0].querySelectorAll('circle'), (c) => c.getAttribute('fill'));
    expect(new Set(fills).size).toBe(3);
    // Puntos 1-4, 5-8 y 9-12 comparten color dentro de su grupo.
    expect(new Set(fills.slice(0, 4)).size).toBe(1);
    expect(new Set(fills.slice(4, 8)).size).toBe(1);
    expect(new Set(fills.slice(8, 12)).size).toBe(1);
    cut('6');
    expect(strokes().filter((s) => s === OVA_COLORS.axis)).toHaveLength(0);
    expect(new Set(Array.from(container.querySelectorAll('svg')[0].querySelectorAll('circle'), (c) => c.getAttribute('fill'))).size).toBe(1);
  });

  it('el aria-label del dendrograma dice el corte actual', () => {
    const { container } = render(<HierarchicalOva />);
    const label = () => container.querySelectorAll('svg')[1].getAttribute('aria-label') ?? '';
    expect(label()).toContain('corte en 3.0');
    cut('2');
    expect(label()).toContain('corte en 2.0');
  });
});
