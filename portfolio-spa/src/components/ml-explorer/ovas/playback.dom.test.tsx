// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AVAILABLE_SLUGS, loadAlgorithm } from '../registry';
import { RandomForestOva } from './RandomForestOva';
import { NaiveBayesOva } from './NaiveBayesOva';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }));
const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });
const progress = (container: HTMLElement) => {
  const element = container.querySelector<HTMLElement>('.mlx-ova-progress');
  return element ? `Paso ${element.dataset.step} de ${element.dataset.last}` : undefined;
};

describe('reproducción de las animaciones', () => {
  it.each(AVAILABLE_SLUGS)('%s: pausa, navega en ambos sentidos y mantiene el paso elegido', async (slug) => {
    const { Ova } = await loadAlgorithm(slug);
    vi.useFakeTimers();
    const { container } = render(<Ova autoPlay />);
    expect(progress(container)).toMatch(/^Paso 0 de \d+$/);
    const initial = container.querySelector('.mlx-ova-stage')?.innerHTML;
    const explanation = container.querySelector('.mlx-ova-explanation')?.textContent;
    click('Pausar');
    advance(10000);
    expect(progress(container)).toMatch(/^Paso 0 de /);
    click('Siguiente paso');
    expect(progress(container)).toMatch(/^Paso 1 de /);
    expect(container.querySelector('.mlx-ova-stage')?.innerHTML).not.toBe(initial);
    expect(container.querySelector('.mlx-ova-explanation')?.textContent).not.toBe(explanation);
    expect(container.querySelector('[role="status"]')?.getAttribute('aria-live')).toBe('polite');
    advance(10000);
    expect(progress(container)).toMatch(/^Paso 1 de /);
    click('Paso anterior');
    expect(progress(container)).toMatch(/^Paso 0 de /);
    click('Reproducir');
    advance(2000);
    expect(progress(container)).toMatch(/^Paso 1 de /);
    click('Reiniciar');
    advance(10000);
    expect(progress(container)).toMatch(/^Paso 0 de /);
  });

  it('la velocidad cambia el tiempo de avance; al terminar conserva el resultado', () => {
    vi.useFakeTimers();
    const { container } = render(<RandomForestOva autoPlay />);
    click('Pausar');
    fireEvent.change(screen.getByRole('combobox', { name: 'Velocidad' }), { target: { value: '0.5' } });
    click('Reproducir');
    advance(2000);
    expect(progress(container)).toBe('Paso 0 de 5');
    advance(100);
    expect(progress(container)).toBe('Paso 1 de 5');
    expect(container.querySelector('[role="status"]')?.textContent).toContain('35 de 40');
    click('Pausar');
    fireEvent.change(screen.getByRole('combobox', { name: 'Velocidad' }), { target: { value: '2' } });
    click('Reproducir');
    for (let i = 0; i < 4; i++) advance(525);
    expect(progress(container)).toBe('Paso 5 de 5');
    expect(container.querySelector('[role="status"]')?.textContent).toContain('39 de 40');
    advance(10000);
    expect(progress(container)).toBe('Paso 5 de 5');
    expect(screen.getByRole('button', { name: 'Reproducir de nuevo' })).toBeTruthy();
    click('Reproducir de nuevo');
    expect(progress(container)).toBe('Paso 0 de 5');
  });

  it('repite solamente al activarlo y permite detenerse al final', () => {
    vi.useFakeTimers();
    const { container } = render(<RandomForestOva autoPlay />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Repetir' }));
    for (let i = 0; i < 5; i++) advance(1050);
    expect(progress(container)).toBe('Paso 5 de 5');
    advance(5000);
    expect(progress(container)).toBe('Paso 0 de 5');
    for (let i = 0; i < 5; i++) advance(1050);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Repetir' }));
    advance(10000);
    expect(progress(container)).toBe('Paso 5 de 5');
  });

  it('con movimiento reducido mantiene la navegación manual sin saltar al resultado otra vez', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    vi.useFakeTimers();
    const { container } = render(<RandomForestOva autoPlay />);
    expect(progress(container)).toBe('Paso 5 de 5');
    click('Paso anterior');
    advance(10000);
    expect(progress(container)).toBe('Paso 4 de 5');
    click('Reiniciar');
    expect(progress(container)).toBe('Paso 0 de 5');
    click('Siguiente paso');
    expect(progress(container)).toBe('Paso 1 de 5');
    expect((screen.getByRole('button', { name: 'Reproducir' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('suspende el avance cuando la pestaña está oculta', () => {
    vi.useFakeTimers();
    const { container } = render(<RandomForestOva autoPlay />);
    const hidden = vi.spyOn(document, 'hidden', 'get');
    hidden.mockReturnValue(true);
    fireEvent(document, new Event('visibilitychange'));
    advance(10000);
    expect(progress(container)).toBe('Paso 0 de 5');
    hidden.mockReturnValue(false);
    fireEvent(document, new Event('visibilitychange'));
    advance(1050);
    expect(progress(container)).toBe('Paso 1 de 5');
  });

  it('una frase vacía no crea un bucle ni permite avanzar fuera de la secuencia', () => {
    vi.useFakeTimers();
    const { container } = render(<NaiveBayesOva autoPlay />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    advance(10000);
    expect(progress(container)).toBe('Paso 0 de 0');
    expect((screen.getByRole('button', { name: 'Siguiente paso' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Reproducir' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('amplía el gráfico sin reiniciar la animación y deja la leyenda junto a la explicación', () => {
    const { container } = render(<RandomForestOva />);
    click('Siguiente paso');
    click('Ampliar gráfico');
    expect(container.querySelector('.mlx-ova--expanded')).toBeTruthy();
    expect(progress(container)).toBe('Paso 1 de 5');
    expect(container.querySelector('.mlx-ova-side .mlx-ova-legend')).toBeTruthy();
    expect(screen.getByText('Anillo blanco: caso contradictorio (ruido)')).toBeTruthy();
    click('Vista compacta');
    expect(container.querySelector('.mlx-ova--expanded')).toBeNull();
  });
});
