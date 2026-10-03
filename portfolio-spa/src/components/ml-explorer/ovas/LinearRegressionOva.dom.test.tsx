// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LinearRegressionOva } from './LinearRegressionOva';

afterEach(cleanup);

const lineText = () => screen.getByText(/^ŷ = /).textContent;
const mseText = () => screen.getByText(/^MSE:/).querySelector('b')?.textContent;

describe('LinearRegressionOva', () => {
  it('mueve un punto con las flechas y la recta se recalcula', () => {
    render(<LinearRegressionOva />);
    const point = screen.getByRole('button', { name: 'Punto 1: 1, 1.6' });
    const before = { line: lineText(), cx: point.getAttribute('cx'), cy: point.getAttribute('cy') };

    point.focus();
    expect(document.activeElement).toBe(point);
    fireEvent.keyDown(point, { key: 'ArrowUp' });

    const moved = screen.getByRole('button', { name: 'Punto 1: 1, 1.7' });
    expect(lineText()).not.toBe(before.line);
    expect(moved.getAttribute('cy')).not.toBe(before.cy);
    expect(moved.getAttribute('cx')).toBe(before.cx);

    fireEvent.keyDown(moved, { key: 'ArrowRight', shiftKey: true });
    const shifted = screen.getByRole('button', { name: 'Punto 1: 1.5, 1.7' });
    expect(shifted.getAttribute('cx')).not.toBe(before.cx);
  });

  it('«Añadir un outlier» sube el MSE de 0.10 a 2.57 y Restablecer lo devuelve a 0.10', () => {
    render(<LinearRegressionOva />);
    expect(mseText()).toBe('0.10');
    fireEvent.click(screen.getByRole('button', { name: 'Añadir un outlier' }));
    expect(mseText()).toBe('2.57');
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }));
    expect(mseText()).toBe('0.10');
  });

  it('con 20 puntos desactiva el outlier y avisa del máximo', () => {
    render(<LinearRegressionOva />);
    const outlier = screen.getByRole('button', { name: 'Añadir un outlier' });
    // Empieza con 9 puntos: 11 outliers llegan a 20.
    for (let i = 0; i < 11; i++) fireEvent.click(outlier);
    expect(screen.getAllByRole('button', { name: /^Punto \d+:/ })).toHaveLength(20);
    expect((outlier as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getAllByText(/Máximo 20 puntos/).length).toBeGreaterThan(0);
  });
});
