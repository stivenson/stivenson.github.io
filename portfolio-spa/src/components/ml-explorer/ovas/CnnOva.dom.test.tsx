// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CnnOva } from './CnnOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Siguiente paso' }));
const advance = (steps: number) => Array.from({ length: steps }, next);
const progress = (c: HTMLElement) => c.querySelector('.mlx-ova-progress');

describe('CnnOva', () => {
  it('conecta ventana, multiplicaciones, suma y ReLU con la casilla de salida', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<CnnOva />);

    expect(progress(container)?.textContent).toBe('Imagen original');
    expect(container.querySelector('.mlx-cnn-equation')).toBeNull();

    next();
    expect(progress(container)?.textContent).toContain('Ventana 1 de 36 · salida (1, 1)');
    expect(status(container)).toContain('Muestra 1 de 13 · ventana 1 de 36');
    expect(status(container)).toContain('Suma de productos: 33 → tras ReLU: 33');
    expect(container.querySelector('.mlx-cnn-equation')?.getAttribute('aria-label')).toContain('suma 33, tras ReLU 33');
    expect(container.querySelectorAll('.mlx-cnn-matrix')).toHaveLength(3);
    expect(container.querySelectorAll('.mlx-cnn-matrix b')).toHaveLength(27);

    next();
    expect(progress(container)?.textContent).toContain('Ventana 4 de 36 · salida (1, 4)');
    expect(status(container)).toContain('Suma de productos: -3 → tras ReLU: 0');
    expect(status(container)).toContain('ReLU = max(0, -3) = 0');
    expect(error).not.toHaveBeenCalled();
  });

  it('termina con el mapa completo y hace visibles los nueve bloques de pooling', () => {
    const { container } = render(<CnnOva />);
    advance(14);

    expect(progress(container)?.textContent).toContain('Max pooling · 6×6 → 3×3');
    expect(status(container)).toContain('Mapa completo: 18 de 36 casillas se encienden');
    expect(container.querySelectorAll('.mlx-cnn-pool-block')).toHaveLength(9);
    expect(container.querySelectorAll('.mlx-cnn-pool')).toHaveLength(9);
    expect((screen.getByRole('button', { name: 'Siguiente paso' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('explica el propósito del filtro horizontal y recalcula el pooling', () => {
    const { container } = render(<CnnOva />);
    next();
    fireEvent.click(screen.getByRole('button', { name: 'Borde horizontal' }));

    expect(screen.getByRole('button', { name: 'Borde horizontal' }).getAttribute('aria-pressed')).toBe('true');
    expect(progress(container)?.textContent).toBe('Imagen original');
    expect(screen.getByText(/Compara la fila inferior con la superior/)).toBeTruthy();

    advance(14);
    expect(status(container)).toContain('Mapa completo: 16 de 36');
    const pooled = Array.from(container.querySelectorAll('.mlx-cnn-pool text'), (text) => text.textContent);
    expect(pooled).toEqual(['13', '0', '18', '0', '5', '4', '8', '21', '5']);
  });

  it('presenta el recorrido como imagen y mantiene la guía fuera del estado dinámico', () => {
    const { container } = render(<CnnOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('.mlx-cnn-cell')).toHaveLength(36);
    expect(svg?.querySelectorAll('rect').length).toBeGreaterThanOrEqual(64 + 36);
    const hint = screen.getByText(/Lee de izquierda a derecha/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });
});
