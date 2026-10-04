// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KM_STEP_MS, KMeansOva } from './KMeansOva';

/** IntersectionObserver falso: `setVisible` simula que la OVA entra o sale de la pantalla. */
let observerCallback: ((entries: { isIntersecting: boolean }[]) => void) | null = null;
const setVisible = (isIntersecting: boolean) => act(() => observerCallback?.([{ isIntersecting }]));

function mockReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: query.includes('reduce') && matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  observerCallback = null;
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
        observerCallback = cb;
      }
      observe() {}
      disconnect() {}
    },
  );
  mockReducedMotion(false);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const button = (name: string | RegExp) => screen.getByRole('button', { name });

describe('KMeansOva', () => {
  it('arranque A con K = 3: paso a paso, la inercia baja de 294.05 a 15.18 en 6 pasos', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<KMeansOva />);
    expect(status(container)).toContain('Paso 0 de 6');
    expect(status(container)).toContain('Inercia: 294.05');
    expect(status(container)).not.toContain('Convergió');
    for (let i = 0; i < 6; i++) fireEvent.click(button('Paso ▸'));
    expect(status(container)).toContain('Paso 6 de 6');
    expect(status(container)).toContain('Inercia: 15.18');
    expect(status(container)).toContain('Convergió: ningún punto cambió de grupo.');
    expect(status(container)).toContain('Silueta: 0.75');
    expect((button('Paso ▸') as HTMLButtonElement).disabled).toBe(true);
    expect(error).not.toHaveBeenCalled();
  });

  it('arranque B se atasca en 123.31 con silueta 0.18', () => {
    const { container } = render(<KMeansOva />);
    fireEvent.click(button('B'));
    expect(button('B').getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(button('Paso ▸'));
    fireEvent.click(button('Paso ▸'));
    expect(status(container)).toContain('Paso 2 de 2');
    expect(status(container)).toContain('Inercia: 123.31');
    expect(status(container)).toContain('Silueta: 0.18');
  });

  it('el slider de K reinicia; con K = 1 no muestra silueta', () => {
    const { container } = render(<KMeansOva />);
    fireEvent.click(button('Paso ▸'));
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1' } });
    expect(status(container)).toContain('Paso 0 de 1');
    fireEvent.click(button('Paso ▸'));
    expect(status(container)).toContain('Inercia: 209.39');
    expect(status(container)).not.toContain('Silueta');
    expect(container.querySelectorAll('.mlx-km-centroid')).toHaveLength(1);
  });

  it('Reproducir avanza un paso cada KM_STEP_MS y se detiene al converger', () => {
    vi.useFakeTimers();
    const { container } = render(<KMeansOva />);
    fireEvent.click(button('▶ Reproducir'));
    expect(button('⏸ Pausar').getAttribute('aria-pressed')).toBe('true');
    act(() => vi.advanceTimersByTime(KM_STEP_MS));
    expect(status(container)).toContain('Paso 1 de 6');
    for (let i = 0; i < 6; i++) act(() => vi.advanceTimersByTime(KM_STEP_MS));
    expect(status(container)).toContain('Paso 6 de 6');
    expect(button('▶ Reproducir').getAttribute('aria-pressed')).toBe('false');
  });

  it('fuera de la pantalla la animación se pausa y sigue al volver', () => {
    vi.useFakeTimers();
    const { container } = render(<KMeansOva />);
    fireEvent.click(button('▶ Reproducir'));
    setVisible(false);
    act(() => vi.advanceTimersByTime(KM_STEP_MS * 3));
    expect(status(container)).toContain('Paso 0 de 6');
    setVisible(true);
    act(() => vi.advanceTimersByTime(KM_STEP_MS));
    expect(status(container)).toContain('Paso 1 de 6');
  });

  it('con «reducir movimiento», Reproducir salta al resultado final sin animar', () => {
    mockReducedMotion(true);
    vi.useFakeTimers();
    const { container } = render(<KMeansOva />);
    fireEvent.click(button('▶ Reproducir'));
    expect(status(container)).toContain('Paso 6 de 6');
    expect(status(container)).toContain('Inercia: 15.18');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('el svg es una imagen con 24 puntos y 3 centroides; el hint va fuera del readout', () => {
    const { container } = render(<KMeansOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('circle')).toHaveLength(24);
    expect(svg?.querySelectorAll('.mlx-km-centroid')).toHaveLength(3);
    const hint = screen.getByText(/se atasca en una solución peor/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });

  it('al desmontar durante la reproducción no quedan timers colgados', () => {
    vi.useFakeTimers();
    const { unmount } = render(<KMeansOva />);
    fireEvent.click(button('▶ Reproducir'));
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('el aria-label del svg dice cuántos grupos hay', () => {
    const { container } = render(<KMeansOva />);
    expect(container.querySelector('svg')?.getAttribute('aria-label')).toContain('en 3 grupos');
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1' } });
    expect(container.querySelector('svg')?.getAttribute('aria-label')).toContain('en 1 grupo,');
  });
});
