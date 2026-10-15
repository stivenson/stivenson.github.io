// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LinearRegressionOva } from './LinearRegressionOva';

afterEach(cleanup);

const lineText = () => screen.getByText(/^ŷ = /).textContent;
const mseText = () => screen.getByText(/^MSE:/).querySelector('b')?.textContent;
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Siguiente paso' }));
const finishFit = () => {
  for (let i = 0; i < 8; i++) next();
};

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

  it('«Añadir un outlier» sube el MSE óptimo de 0.10 a 2.57 y permite restablecer los puntos', () => {
    const { container } = render(<LinearRegressionOva />);
    finishFit();
    expect(mseText()).toBe('0.10');
    fireEvent.click(screen.getByRole('button', { name: 'Añadir un outlier' }));
    finishFit();
    expect(mseText()).toBe('2.57');
    expect(container.querySelectorAll('.mlx-linear-outlier-halo')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer puntos' }));
    finishFit();
    expect(mseText()).toBe('0.10');
  });

  it('cada clic coloca el outlier en una posición distinta y resalta el más reciente', () => {
    const { container } = render(<LinearRegressionOva />);
    fireEvent.click(screen.getByRole('button', { name: 'Añadir un outlier' }));
    expect(screen.getByRole('button', { name: 'Punto 10: 8.5, 0.8' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Añadir otro outlier' }));
    expect(screen.getByRole('button', { name: 'Punto 11: 1.2, 7.2' })).toBeTruthy();
    expect(container.querySelectorAll('.mlx-linear-outlier-halo')).toHaveLength(1);
    expect(screen.getByText(/^Último outlier:/).textContent).toContain('1.2');
  });

  it('formatea una pendiente negativa sin mostrar «+ -»', () => {
    render(<LinearRegressionOva />);
    for (let i = 0; i < 6; i++) {
      fireEvent.click(screen.getByRole('button', { name: i === 0 ? 'Añadir un outlier' : 'Añadir otro outlier' }));
    }
    finishFit();
    expect(lineText()).not.toContain('+ -');
  });

  it('con 20 puntos desactiva el outlier y avisa del máximo', () => {
    render(<LinearRegressionOva />);
    // Empieza con 9 puntos: 11 outliers llegan a 20.
    for (let i = 0; i < 11; i++) {
      fireEvent.click(screen.getByRole('button', { name: i === 0 ? 'Añadir un outlier' : 'Añadir otro outlier' }));
    }
    expect(screen.getAllByRole('button', { name: /^Punto \d+:/ })).toHaveLength(20);
    const outlier = screen.getByRole('button', { name: 'Añadir otro outlier' });
    expect((outlier as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getAllByText(/Máximo 20 puntos/)).toHaveLength(1);
  });
});
