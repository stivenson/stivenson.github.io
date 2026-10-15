// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RandomForestOva } from './RandomForestOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Siguiente paso' }));

describe('RandomForestOva', () => {
  it('con 1 árbol acierta 24 de 28 y 35 de 40 nuevos; con 100, 28 de 28 y 39 de 40', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<RandomForestOva />);
    expect(status(container)).toContain('Reproduce la animación');
    expect(container.querySelector('.mlx-ova-progress')?.textContent).toBe('Sin árboles · etapa 0 de 5');
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('100');

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
    const hint = screen.getByText(/El ciclo empieza con los clientes neutrales/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
    expect(hint.textContent).toContain('anillo blanco son casos contradictorios');
    expect(hint.textContent).toContain('comprobar si el bosque generaliza');
    expect(screen.getByText('Azul: paga')).toBeTruthy();
    expect(screen.getByText('Naranja: no paga')).toBeTruthy();
  });
});
