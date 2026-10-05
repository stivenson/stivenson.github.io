// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TransformerOva } from './TransformerOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => (c.querySelector('[role="status"]')?.textContent ?? '').replace(/\s+/g, ' ');
const button = (name: string) => screen.getByRole('button', { name });

describe('TransformerOva', () => {
  it('«el banco del río»: banco atiende 0.41 a río y sale con naturaleza 1.23; con «interés», dinero 1.38', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<TransformerOva />);
    expect(status(container)).toContain('«banco» atiende a: el 0.09 · banco 0.41 · del 0.09 · río 0.41');
    expect(status(container)).toContain('Después de la atención: dinero 0.41 · naturaleza 1.23');
    fireEvent.click(button('el banco cobra interés'));
    expect(button('el banco cobra interés').getAttribute('aria-pressed')).toBe('true');
    expect(status(container)).toContain('dinero 1.38 · naturaleza 0.35');
    expect(error).not.toHaveBeenCalled();
  });

  it('sin codificación posicional, invertir no cambia a banco (0.00); con ella cambia 0.30', () => {
    const { container } = render(<TransformerOva />);
    expect(status(container)).toContain('Si se invierte la frase, «banco» cambia 0.00');
    fireEvent.click(button('Invertir el orden'));
    expect(status(container)).toContain('«banco» atiende a: río 0.41 · del 0.09 · banco 0.41 · el 0.09');
    expect(status(container)).toContain('naturaleza 1.23');
    fireEvent.click(button('Codificación posicional'));
    expect(status(container)).toContain('cambia 0.30');
  });

  it('la máscara causal deja a banco ver solo «el» y a sí mismo (0.18 y 0.82)', () => {
    const { container } = render(<TransformerOva />);
    fireEvent.click(button('Máscara causal (GPT)'));
    expect(status(container)).toContain('el 0.18 · banco 0.82 · del 0.00 · río 0.00');
  });

  it('elegir otra palabra cambia la fila que se lee; al cambiar de frase vuelve a «banco» si la palabra no está', () => {
    const { container } = render(<TransformerOva />);
    fireEvent.click(button('río'));
    expect(status(container)).toContain('«río» atiende a: el 0.05 · banco 0.24 · del 0.05 · río 0.65');
    fireEvent.click(button('el banco cobra interés'));
    expect(status(container)).toContain('«banco» atiende a:');
    fireEvent.click(button('Restablecer'));
    expect(button('el banco del río').getAttribute('aria-pressed')).toBe('true');
  });

  it('el aria-label del svg lee la fila enfocada con sus pesos', () => {
    const { container } = render(<TransformerOva />);
    const label = () => container.querySelector('svg')?.getAttribute('aria-label') ?? '';
    expect(label()).toContain('«banco» atiende a: el 0.09, banco 0.41, del 0.09, río 0.41');
    fireEvent.click(button('río'));
    expect(label()).toContain('«río» atiende a:');
  });

  it('el svg es una imagen con 16 casillas; el hint va fuera del readout', () => {
    const { container } = render(<TransformerOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('rect')).toHaveLength(16);
    const hint = screen.getByText(/la atención no ve el orden/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });
});
