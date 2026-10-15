// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PCA_BEST_ANGLE, PCA_ROTATION_STEP_MS, PcaOva } from './PcaOva';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Siguiente paso' }));
const advanceSteps = (steps: number) => Array.from({ length: steps }, next);
const progress = (c: HTMLElement) => c.querySelector('.mlx-ova-progress')?.getAttribute('data-step');

describe('PcaOva', () => {
  it('parte hacia el eje principal y conserva 94.6 % al terminar el giro', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<PcaOva />);

    expect(PCA_BEST_ANGLE).toBe(34);
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('34°');
    expect(status(container)).toContain('Datos originales: aún sin proyectar.');

    next();
    expect(status(container)).toContain('Eje a 2°');
    advanceSteps(15);
    expect(status(container)).toContain('Eje a 34°: captura 94.6 % de la varianza');
    expect(status(container)).toContain('Se pierde: 5.4 %');
    expect(status(container)).toContain('Distancias trazadas: 0 de 20');

    fireEvent.change(screen.getByRole('slider'), { target: { value: '124' } });
    expect(progress(container)).toBe('0');
    advanceSteps(16);
    expect(status(container)).toContain('captura 5.4 %');
    fireEvent.click(screen.getByRole('button', { name: 'Ir al eje de máxima varianza' }));
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('34°');
    expect(progress(container)).toBe('0');
    expect(error).not.toHaveBeenCalled();
  });

  it('inicia el primer giro enseguida cuando la reproducción es automática', () => {
    vi.useFakeTimers();
    const { container } = render(<PcaOva autoPlay />);
    expect(progress(container)).toBe('0');

    act(() => vi.advanceTimersByTime(PCA_ROTATION_STEP_MS - 1));
    expect(progress(container)).toBe('0');
    act(() => vi.advanceTimersByTime(1));
    expect(progress(container)).toBe('1');
    expect(status(container)).toContain('Eje a 2°');
  });

  it('dibuja 20 puntos y añade sus proyecciones después del giro', () => {
    const { container } = render(<PcaOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('circle[r="6"]')).toHaveLength(20);
    expect(svg?.querySelectorAll('circle.mlx-pca-proj')).toHaveLength(0);
    advanceSteps(16);
    expect(svg?.querySelectorAll('circle.mlx-pca-proj')).toHaveLength(20);
    const hint = screen.getByText(/PCA reduce dimensiones; no crea grupos ni clases/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });

  it('recorta el eje al área del gráfico con un clipPath propio', () => {
    const { container } = render(<PcaOva />);
    const axis = container.querySelector('svg > line');
    const ref = /^url\(#(.+)\)$/.exec(axis?.getAttribute('clip-path') ?? '');
    expect(ref).not.toBeNull();
    const clip = Array.from(container.querySelectorAll('clipPath')).find((c) => c.id === ref![1]);
    expect(clip?.querySelector('rect')).not.toBeNull();
  });
});
