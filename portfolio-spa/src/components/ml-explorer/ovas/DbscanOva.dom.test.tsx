// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DbscanOva } from './DbscanOva';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const final = () => fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar resultado final' }));
const eps = () => screen.getByRole('slider', { name: 'Radio (eps, ε)' });
const minimum = () => screen.getByRole('slider', { name: 'Mínimo local (min_samples, minPts)' });

describe('DbscanOva', () => {
  it('conserva la expansión original y permite comparar el resultado fijo', () => {
    const { container } = render(<DbscanOva />);
    expect(status(container)).toContain('La exploración todavía no ha comenzado');
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente paso' }));
    expect(status(container)).toContain('El grupo 1 se expande');
    final();
    expect(status(container)).toContain('2 grupos y 4 puntos de ruido');
    expect(status(container)).toContain('50 núcleos');
    fireEvent.change(eps(), { target: { value: '0.8' } });
    expect(status(container)).toContain('4 grupos y 9 puntos de ruido');
    fireEvent.change(eps(), { target: { value: '1.1' } });
    expect(status(container)).toContain('1 grupo y 3 puntos de ruido');
    fireEvent.change(eps(), { target: { value: '1' } });
    fireEvent.change(minimum(), { target: { value: '6' } });
    expect(status(container)).toContain('4 grupos y 13 puntos de ruido');
  });
  it('la métrica cambia grupos y el contorno; inspeccionar no reentrena', () => {
    const { container } = render(<DbscanOva />); final();
    expect(container.querySelector('.mlx-db-neighborhood')?.tagName).toBe('circle');
    fireEvent.change(screen.getByRole('combobox', { name: 'Distancia (metric)' }), { target: { value: 'manhattan' } });
    expect(status(container)).toContain('5 grupos y 7 puntos de ruido');
    expect(container.querySelectorAll('circle.is-core')).toHaveLength(41);
    expect(container.querySelector('.mlx-db-neighborhood')?.tagName).toBe('polygon');
    const previous=container.querySelector('.dbscan-final-summary')?.textContent;
    fireEvent.change(screen.getByRole('combobox', { name: 'Punto observado' }), { target: { value: '58' } });
    expect(screen.getByRole('combobox', { name: 'Punto observado' }).closest('details')?.textContent).toContain('Punto 59:');
    expect(container.querySelector('.dbscan-final-summary')?.textContent).toBe(previous);
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer ajustes' }));
    expect((eps() as HTMLInputElement).value).toBe('1');
    expect((minimum() as HTMLInputElement).value).toBe('4');
    expect((screen.getByRole('combobox', { name: 'Distancia (metric)' }) as HTMLSelectElement).value).toBe('euclidean');
    expect((screen.getByRole('checkbox', { name: 'Mostrar resultado final' }) as HTMLInputElement).checked).toBe(false);
  });
  it('distingue todos ruido de un único grupo sin errores', () => {
    const { container } = render(<DbscanOva />); final();
    fireEvent.change(eps(), { target: { value: '0.2' } });
    fireEvent.change(minimum(), { target: { value: '10' } });
    expect(status(container)).toContain('0 grupos y 59 puntos de ruido');
    fireEvent.change(eps(), { target: { value: '2' } });
    fireEvent.change(minimum(), { target: { value: '2' } });
    expect(status(container)).toContain('1 grupo');
    expect(container.querySelectorAll('.is-core, .is-border, .is-noise')).toHaveLength(59);
  });
  it('con movimiento reducido permite leer el final sin anuncios de reproducción', () => {
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query.includes('reduce'), media: query, addEventListener() {}, removeEventListener() {} })));
    const {container}=render(<DbscanOva autoPlay />);
    expect(status(container)).toContain('Resultado final');
    expect(container.querySelector('[role="status"]')?.getAttribute('aria-live')).toBe('polite');
  });
});
