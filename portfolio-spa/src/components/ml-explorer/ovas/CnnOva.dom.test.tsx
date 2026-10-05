// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CNN_STEP_MS, CnnOva } from './CnnOva';

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

describe('CnnOva', () => {
  it('empieza en la posición 1 de 36 con suma 2; paso a paso llega al mapa completo (13 casillas)', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<CnnOva />);
    expect(status(container)).toContain('Posición 1 de 36 (fila 1, columna 1)');
    expect(status(container)).toContain('Suma de productos: 2 → tras ReLU: 2');
    for (let i = 0; i < 28; i++) fireEvent.click(button('Paso ▸'));
    expect(status(container)).toContain('Posición 29 de 36 (fila 5, columna 5)');
    expect(status(container)).toContain('Suma de productos: -3 → tras ReLU: 0');
    for (let i = 0; i < 7; i++) fireEvent.click(button('Paso ▸'));
    expect(status(container)).toContain('Mapa completo: 13 de 36 casillas se encienden');
    expect((button('Paso ▸') as HTMLButtonElement).disabled).toBe(true);
    expect(container.querySelectorAll('.mlx-cnn-pool')).toHaveLength(9);
    expect(error).not.toHaveBeenCalled();
  });

  it('el filtro horizontal reinicia el recorrido y enciende 8 casillas', () => {
    const { container } = render(<CnnOva />);
    fireEvent.click(button('Paso ▸'));
    fireEvent.click(button('Borde horizontal'));
    expect(button('Borde horizontal').getAttribute('aria-pressed')).toBe('true');
    expect(status(container)).toContain('Posición 1 de 36');
    for (let i = 0; i < 35; i++) fireEvent.click(button('Paso ▸'));
    expect(status(container)).toContain('Mapa completo: 8 de 36');
    const pooled = Array.from(container.querySelectorAll('.mlx-cnn-pool text'), (t) => t.textContent);
    expect(pooled).toEqual(['3', '3', '3', '1', '1', '0', '0', '0', '0']);
  });

  it('Reproducir avanza una posición cada CNN_STEP_MS y se detiene al final', () => {
    vi.useFakeTimers();
    const { container } = render(<CnnOva />);
    fireEvent.click(button('▶ Reproducir'));
    expect(button('⏸ Pausar').getAttribute('aria-pressed')).toBe('true');
    act(() => vi.advanceTimersByTime(CNN_STEP_MS));
    expect(status(container)).toContain('Posición 2 de 36');
    for (let i = 0; i < 40; i++) act(() => vi.advanceTimersByTime(CNN_STEP_MS));
    expect(status(container)).toContain('Posición 36 de 36');
    expect(button('▶ Reproducir').getAttribute('aria-pressed')).toBe('false');
  });

  it('fuera de la pantalla la animación se pausa y sigue al volver', () => {
    vi.useFakeTimers();
    const { container } = render(<CnnOva />);
    fireEvent.click(button('▶ Reproducir'));
    setVisible(false);
    act(() => vi.advanceTimersByTime(CNN_STEP_MS * 3));
    expect(status(container)).toContain('Posición 1 de 36');
    setVisible(true);
    act(() => vi.advanceTimersByTime(CNN_STEP_MS));
    expect(status(container)).toContain('Posición 2 de 36');
  });

  it('con «reducir movimiento», Reproducir salta al mapa completo sin animar', () => {
    mockReducedMotion(true);
    vi.useFakeTimers();
    const { container } = render(<CnnOva />);
    fireEvent.click(button('▶ Reproducir'));
    expect(status(container)).toContain('Posición 36 de 36');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('mientras reproduce, el readout no se anuncia; al desmontar no quedan timers', () => {
    vi.useFakeTimers();
    const { container, unmount } = render(<CnnOva />);
    const live = () => container.querySelector('[role="status"]')?.getAttribute('aria-live');
    expect(live()).toBe('polite');
    fireEvent.click(button('▶ Reproducir'));
    expect(live()).toBe('off');
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('el svg es una imagen con 64 píxeles y 36 casillas; el hint va fuera del readout', () => {
    const { container } = render(<CnnOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('.mlx-cnn-cell')).toHaveLength(36);
    expect(svg?.querySelectorAll('rect').length).toBeGreaterThanOrEqual(64 + 1 + 36);
    const hint = screen.getByText(/el horizontal al borde de arriba de la barra/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });
});
