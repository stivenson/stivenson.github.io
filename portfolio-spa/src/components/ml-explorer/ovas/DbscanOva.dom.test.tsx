// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DbscanOva } from './DbscanOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const sliders = () => screen.getAllByRole('slider');

describe('DbscanOva', () => {
  it('ε = 1.0 y minPts = 4: las 2 lunas y 4 puntos de ruido; ε cambia el resultado', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<DbscanOva />);
    expect(sliders()[0].getAttribute('aria-valuetext')).toBe('1.0');
    expect(status(container)).toContain('2 grupos y 4 puntos de ruido');
    expect(status(container)).toContain('Núcleos: 50 · borde: 5');
    fireEvent.change(sliders()[0], { target: { value: '0.8' } });
    expect(status(container)).toContain('4 grupos y 9 puntos de ruido');
    fireEvent.change(sliders()[0], { target: { value: '1.1' } });
    expect(status(container)).toContain('1 grupo y 3 puntos de ruido');
    fireEvent.change(sliders()[0], { target: { value: '1' } });
    fireEvent.change(sliders()[1], { target: { value: '6' } });
    expect(status(container)).toContain('4 grupos y 13 puntos de ruido');
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }));
    expect(status(container)).toContain('2 grupos y 4 puntos de ruido');
    expect(error).not.toHaveBeenCalled();
  });

  it('el svg es una imagen con 59 puntos: núcleos, borde y ruido se distinguen', () => {
    const { container } = render(<DbscanOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('.is-core')).toHaveLength(50);
    expect(svg?.querySelectorAll('.is-border')).toHaveLength(5);
    expect(svg?.querySelectorAll('.is-noise')).toHaveLength(4);
    const hint = screen.getByText(/Lo que no alcanza ningún núcleo es ruido/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });
});
