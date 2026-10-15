// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MlpOva } from './MlpOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const slider = (name: string) => screen.getByRole('slider', { name: new RegExp(`^${name}`) });
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Siguiente paso' }));
const advance = (steps: number) => Array.from({ length: steps }, next);
const plot = (c: HTMLElement) => c.querySelector<SVGSVGElement>('svg[aria-label^="Propagación por una red MLP"]');

describe('MlpOva', () => {
  it('explica el recorrido entrada → h₁ → h₂ → salida sin ocultar las activaciones', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<MlpOva />);

    expect(container.querySelector('.mlx-ova-progress')?.textContent).toContain('Entrada · elegir un caso');
    expect(status(container)).toContain('Caso seguido: (0, 0) · clase real 0');

    next();
    expect(container.querySelector('.mlx-ova-progress')?.textContent).toContain('h₁ · ¿al menos una?');
    expect(status(container)).toMatch(/h₁ «al menos una»: 0\.00 · inactiva/);
    expect(container.querySelectorAll('.mlx-mlp-neuron-line')).toHaveLength(1);

    next();
    expect(container.querySelector('.mlx-ova-progress')?.textContent).toContain('h₂ · ¿no ambas?');
    expect(status(container)).toMatch(/h₂ «no ambas»: 1\.00 · activa/);
    expect(container.querySelectorAll('.mlx-mlp-neuron-line')).toHaveLength(2);

    next();
    expect(status(container)).toContain('ŷ = 0.00 · predicción clase 0');
    expect(status(container)).toContain('Aciertos: 20 de 20');
    expect(container.querySelectorAll('.mlx-mlp-cell')).toHaveLength(400);
    expect(error).not.toHaveBeenCalled();
  });

  it('permite comparar las cuatro esquinas sin reiniciar la propagación', () => {
    const { container } = render(<MlpOva />);
    advance(3);

    fireEvent.click(screen.getByRole('button', { name: /Esquina \(0, 1\).*clase 1/ }));
    expect(status(container)).toContain('Caso seguido: (0, 1) · clase real 1');
    expect(status(container)).toContain('predicción clase 1');
    expect(screen.getByRole('button', { name: /Esquina \(0, 1\)/ }).getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: /Esquina \(1, 1\).*clase 0/ }));
    expect(status(container)).toContain('Caso seguido: (1, 1) · clase real 0');
    expect(status(container)).toContain('predicción clase 0');
    expect(container.querySelector('.mlx-ova-progress')?.getAttribute('data-step')).toBe('3');
    expect(container.querySelector('.mlx-mlp-traced-ring')).toBeTruthy();
  });

  it('mantiene disponibles los nueve pesos y actualiza la frontera al editarlos', () => {
    const { container } = render(<MlpOva />);
    expect(screen.getAllByRole('slider')).toHaveLength(9);
    expect(screen.getAllByRole('group', { name: /^Neurona/ })).toHaveLength(3);

    fireEvent.change(slider('Salida · peso de oculta 1'), { target: { value: '0' } });
    expect(container.querySelector('.mlx-ova-progress')?.getAttribute('data-step')).toBe('0');
    advance(3);
    expect(status(container)).toContain('Aciertos: 10 de 20');
  });

  it('presenta el plano como imagen y deja la guía fuera del estado dinámico', () => {
    const { container } = render(<MlpOva />);
    const svg = plot(container);
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('circle.mlx-mlp-point')).toHaveLength(20);
    expect(svg?.querySelector('.mlx-mlp-traced-ring')).toBeTruthy();
    expect(svg?.querySelectorAll('rect.mlx-mlp-cell')).toHaveLength(0);
    const hint = screen.getByText(/Cada neurona oculta aprende un corte lineal distinto/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });
});
