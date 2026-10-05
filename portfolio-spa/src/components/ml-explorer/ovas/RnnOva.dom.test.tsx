// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatInfluence, oneIn, RnnOva } from './RnnOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const slider = (name: RegExp) => screen.getByRole('slider', { name });

describe('formatInfluence y oneIn', () => {
  it('3 decimales si se lee; si no, notación científica; el inverso con 2 cifras y espacio de miles', () => {
    expect(formatInfluence(0.02433)).toBe('0.024');
    expect(formatInfluence(6.217e-6)).toBe('6.2e-6');
    expect(oneIn(0.02433)).toBe('1 en 41');
    expect(oneIn(2.035e-4)).toBe('1 en 4 900');
    expect(oneIn(2.462e-7)).toBe('1 en 4 100 000');
    expect(oneIn(1e-7)).toBe('1 en 10 000 000');
    expect(oneIn(9.9e-8)).toBe('prácticamente nula: menos de 1 en 10 millones');
  });
});

describe('RnnOva', () => {
  it('w = 0.9 y 10 pasos: x₁ influye 0.024 (1 en 41); con 20 pasos, 6.2e-6; con 30, 2.5e-7', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<RnnOva />);
    expect(status(container)).toContain('Influencia de x₁ en la salida: 0.024 (1 en 41)');
    expect(status(container)).toContain('Influencia de x10, la última: 0.452');
    fireEvent.change(slider(/^Pasos/), { target: { value: '20' } });
    expect(status(container)).toContain('6.2e-6 (1 en 160 000)');
    fireEvent.change(slider(/^Pasos/), { target: { value: '30' } });
    expect(status(container)).toContain('2.5e-7 (1 en 4 100 000)');
    expect(error).not.toHaveBeenCalled();
  });

  it('bajar w a 0.5 encoge más rápido: 2.0e-4 con 10 pasos; Restablecer vuelve a 0.024', () => {
    const { container } = render(<RnnOva />);
    fireEvent.change(slider(/^w/), { target: { value: '0.5' } });
    expect(slider(/^w/).getAttribute('aria-valuetext')).toBe('0.5');
    expect(status(container)).toContain('2.0e-4 (1 en 4 900)');
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }));
    expect(status(container)).toContain('0.024 (1 en 41)');
  });

  it('el svg es una imagen con una barra por paso; el hint va fuera del readout', () => {
    const { container } = render(<RnnOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('.mlx-rnn-bar')).toHaveLength(10);
    fireEvent.change(slider(/^Pasos/), { target: { value: '25' } });
    expect(svg?.querySelectorAll('.mlx-rnn-bar')).toHaveLength(25);
    const hint = screen.getByText(/Aun con w = 1 se encoge/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });

  it('w = 0.1 y 30 pasos: readout corto y legible (sin «1 en» gigante) y aviso de barras bajo el piso', () => {
    const { container } = render(<RnnOva />);
    fireEvent.change(slider(/^w/), { target: { value: '0.1' } });
    fireEvent.change(slider(/^Pasos/), { target: { value: '30' } });
    const text = status(container);
    expect(text).toContain('Influencia de x₁ en la salida: 3.8e-32 (prácticamente nula: menos de 1 en 10 millones)');
    expect(text).not.toMatch(/\d{3} \d{3} \d{3}/);
    expect(text).toMatch(/\d+ barras bajan de 1e-8/);
    expect(Math.max(...text.split(/\s+/).map((w) => w.length))).toBeLessThan(20);
    expect(container.querySelector('svg')?.getAttribute('aria-label')).toContain('x₁ influye 3.8e-32');
    expect(container.querySelector('svg')?.textContent).toContain('< 1e-8');
  });

  it('con w = 0.9 y 10 pasos no hay barras bajo el piso ni aviso', () => {
    const { container } = render(<RnnOva />);
    expect(status(container)).not.toContain('bajan de 1e-8');
    expect(status(container)).not.toContain('baja de 1e-8');
  });
});
