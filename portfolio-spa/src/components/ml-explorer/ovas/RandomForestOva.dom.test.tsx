// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RandomForestOva } from './RandomForestOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const setIndex = (v: number) => fireEvent.change(screen.getByRole('slider'), { target: { value: String(v) } });

describe('RandomForestOva', () => {
  it('con 1 árbol acierta 24 de 28 y 35 de 40 nuevos; con 100, 28 de 28 y 39 de 40', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<RandomForestOva />);
    expect(status(container)).toContain('Clientes de entrenamiento: acierta 24 de 28');
    expect(status(container)).toContain('Clientes nuevos: acierta 35 de 40');
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('1');

    setIndex(2);
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('10');
    expect(status(container)).toContain('acierta 27 de 28');
    expect(status(container)).toContain('acierta 38 de 40');

    setIndex(3);
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('30');
    expect(status(container)).toContain('acierta 28 de 28');

    setIndex(4);
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('100');
    expect(status(container)).toContain('acierta 28 de 28');
    expect(status(container)).toContain('acierta 39 de 40');
    expect(error).not.toHaveBeenCalled();
  });

  it('el svg es una imagen (sin elementos enfocables) con los 28 clientes y 625 celdas', () => {
    const { container } = render(<RandomForestOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('circle')).toHaveLength(28);
    expect(svg?.querySelectorAll('rect')).toHaveLength(625);
    expect(svg?.querySelector('[tabindex]')).toBeNull();
    // Los dos clientes de ruido llevan un anillo.
    expect(svg?.querySelectorAll('path[fill="none"]')).toHaveLength(2);
  });

  it('la explicación va en el hint, fuera del readout', () => {
    const { container } = render(<RandomForestOva />);
    const hint = screen.getByText(/Compara los aciertos en clientes nuevos/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
    expect(hint.textContent).toContain('Los dos clientes con anillo son ruido');
    expect(hint.textContent).toContain('(35 → 39 de 40)');
  });
});
