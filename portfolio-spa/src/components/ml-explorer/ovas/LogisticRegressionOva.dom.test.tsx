// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LogisticRegressionOva } from './LogisticRegressionOva';

const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock('./useMotion', () => ({ useInViewport: () => true, usePrefersReducedMotion: () => motion.reduced }));
afterEach(() => { cleanup(); motion.reduced = false; vi.useRealTimers(); vi.restoreAllMocks(); });
const readout = (container: HTMLElement) => container.querySelector('[role="status"]')?.textContent ?? '';

describe('LogisticRegressionOva: entrenar y decidir', () => {
  it('muestra los coeficientes aprendidos y tipos de error sobre entrenamiento', () => {
    const { container } = render(<LogisticRegressionOva />);
    expect(readout(container)).toContain('C = 1');
    expect(readout(container)).toContain('Falsas alarmas:');
    expect(readout(container)).toContain('spam que se escapan:');
    expect(readout(container)).toContain('Convergencia en la actualización');
    expect(screen.queryByRole('slider', { name: /b₀|b₁/ })).toBeNull();
  });

  it('cambiar C modifica la curva y los coeficientes, y restaurar los recupera', () => {
    const { container } = render(<LogisticRegressionOva />);
    const original = container.querySelector('.mlx-logistic-curve')?.getAttribute('d');
    fireEvent.change(screen.getByRole('combobox', { name: /Regularización inversa/ }), { target: { value: '0.01' } });
    expect(container.querySelector('.mlx-logistic-curve')?.getAttribute('d')).not.toBe(original);
    expect(readout(container)).toContain('C = 0.01');
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer ajustes' }));
    expect(container.querySelector('.mlx-logistic-curve')?.getAttribute('d')).toBe(original);
  });

  it('mover el umbral conserva la curva y cambia la clasificación de los mismos puntos', () => {
    const { container } = render(<LogisticRegressionOva />);
    const curve = container.querySelector('.mlx-logistic-curve')?.getAttribute('d');
    const colors = [...container.querySelectorAll('.mlx-logistic-point')].map((p) => p.getAttribute('fill'));
    const before = readout(container);
    fireEvent.change(screen.getByRole('slider', { name: 'Umbral de spam' }), { target: { value: '0.8' } });
    expect(container.querySelector('.mlx-logistic-curve')?.getAttribute('d')).toBe(curve);
    expect([...container.querySelectorAll('.mlx-logistic-point')].map((p) => p.getAttribute('fill'))).not.toEqual(colors);
    expect(readout(container)).not.toBe(before);
  });

  it('un límite bajo deja claro que no se alcanzó convergencia', () => {
    const { container } = render(<LogisticRegressionOva />);
    fireEvent.change(screen.getByRole('slider', { name: /Límite de entrenamiento/ }), { target: { value: '1' } });
    expect(readout(container)).toContain('detenido antes de converger');
    expect(readout(container)).not.toContain('Convergencia en la actualización');
  });

  it('permite congelar el ajuste y modificar el umbral sin temporizadores', () => {
    vi.useFakeTimers();
    const { container } = render(<LogisticRegressionOva autoPlay />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar ajuste final' }));
    const curve = container.querySelector('.mlx-logistic-curve')?.getAttribute('d');
    fireEvent.change(screen.getByRole('slider', { name: 'Umbral de spam' }), { target: { value: '0.8' } });
    expect(container.querySelector('.mlx-logistic-curve')?.getAttribute('d')).toBe(curve);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('con movimiento reducido muestra el ajuste final sin animarlo', () => {
    vi.useFakeTimers(); motion.reduced = true;
    const { container } = render(<LogisticRegressionOva autoPlay />);
    expect(readout(container)).toContain('Convergencia en la actualización');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('la ficha de C se abre y devuelve el foco al cerrar', () => {
    render(<LogisticRegressionOva />);
    const button = screen.getByRole('button', { name: 'C pequeño' });
    fireEvent.click(button);
    expect(screen.getByRole('dialog', { name: 'C (inverso de la fuerza de regularización)' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
    expect(document.activeElement).toBe(button);
  });
});
