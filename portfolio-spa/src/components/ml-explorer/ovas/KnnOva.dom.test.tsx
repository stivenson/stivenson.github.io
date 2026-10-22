// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { KnnOva } from './KnnOva';

const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock('./useMotion', () => ({ useInViewport: () => true, usePrefersReducedMotion: () => motion.reduced }));
afterEach(() => { motion.reduced = false; cleanup(); vi.restoreAllMocks(); });
const status = (c: HTMLElement) => c.querySelector('.mlx-ova-readout')?.textContent ?? '';
const setK = (k: number) => fireEvent.change(screen.getByRole('slider'), { target: { value: String(k) } });
const final = () => fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar ajuste elegido' }));

describe('KnnOva', () => {
  it('conserva el recorrido: k=1 decide el vecino de ruido y k=3 cambia la mayoría', () => {
    const { container } = render(<KnnOva />);
    expect(status(container)).toContain('aún no tienen');
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente paso' }));
    expect(status(container)).toContain('Predicción: 🔵 no le gustó');
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente paso' }));
    expect(status(container)).toContain('k = 3');
    expect(status(container)).toContain('Predicción: 🟠 le gustó');
  });
  it('compara pesos con el mismo k y muestra aportes separados de cantidades', () => {
    const { container } = render(<KnnOva />);
    setK(3); final();
    expect(status(container)).toContain('vecinos por clase: 🔵 no le gustó 1 · 🟠 le gustó 2');
    expect(status(container)).toContain('Predicción: 🟠 le gustó');
    expect(screen.queryByRole('button', { name: 'Siguiente paso' })).toBeNull();
    fireEvent.change(screen.getByRole('combobox', { name: 'Aporte de vecinos (weights)' }), { target: { value: 'distance' } });
    expect(status(container)).toContain('Predicción: 🔵 no le gustó');
    expect(status(container)).toContain('suma de pesos');
    expect(screen.getByLabelText('Configuración elegida').textContent).toContain('Mostrando k=3');
  });
  it('la métrica cambia los vecinos y su contorno; distancia cero deja solo aportes exactos', () => {
    const { container } = render(<KnnOva />);
    setK(3); final();
    expect(container.querySelector('circle.mlx-knn-radius')).not.toBeNull();
    fireEvent.change(screen.getByRole('combobox', { name: 'Distancia (metric y p)' }), { target: { value: '1' } });
    expect(container.querySelector('polygon.mlx-knn-radius')).not.toBeNull();
    expect(container.querySelector('circle.mlx-knn-radius')).toBeNull();
    fireEvent.change(screen.getByRole('combobox', { name: 'Aporte de vecinos (weights)' }), { target: { value: 'distance' } });
    fireEvent.click(screen.getByRole('button', { name: 'Probar coincidencia exacta' }));
    expect(status(container)).toContain('Distancia cero');
    expect(status(container)).toContain('Predicción: 🟠 le gustó');
    expect(container.querySelectorAll('svg line')).toHaveLength(1);
    expect(status(container)).not.toMatch(/NaN|Infinity/);
  });
  it('conserva movimiento por teclado y restaura consulta y configuración', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<KnnOva />);
    const diamond = screen.getByRole('button', { name: /^Persona nueva: acción 6.4, ciencia ficción 7\. Muévela/ });
    expect(container.querySelector('svg')?.getAttribute('role')).toBe('group');
    diamond.focus();
    fireEvent.keyDown(diamond, { key: 'ArrowRight' });
    const moved = screen.getByRole('button', { name: /^Persona nueva: acción 6.65, ciencia ficción 7\. Muévela/ });
    for (let i=0; i<3; i++) fireEvent.keyDown(moved, { key: 'ArrowRight' });
    screen.getByRole('button', { name: /^Persona nueva: acción 7.4, ciencia ficción 7\. Muévela/ });
    fireEvent.keyDown(moved, { key: 'ArrowDown', shiftKey: true });
    screen.getByRole('button', { name: /^Persona nueva: acción 7.4, ciencia ficción 6\. Muévela/ });
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer ajustes y consulta' }));
    screen.getByRole('button', { name: /^Persona nueva: acción 6.4, ciencia ficción 7\. Muévela/ });
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('15');
    expect(error).not.toHaveBeenCalled();
  });
  it('abre la ficha de pesos y devuelve el foco', () => {
    render(<KnnOva />);
    const trigger = screen.getByRole('button', { name: /^pesos por distancia/ });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Aportes de vecinos (weights)' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
    expect(document.activeElement).toBe(trigger);
  });
  it('con movimiento reducido muestra el k elegido sin reproducción automática', () => {
    motion.reduced = true;
    const { container } = render(<KnnOva autoPlay />);
    expect(status(container)).toContain('k = 15');
    expect(screen.queryByRole('button', { name: /Pausar/ })).toBeNull();
    setK(3);
    expect(status(container)).toContain('k = 3');
  });
});
