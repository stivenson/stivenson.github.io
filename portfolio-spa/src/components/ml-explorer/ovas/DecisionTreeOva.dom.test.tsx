// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DecisionTreeOva } from './DecisionTreeOva';

const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock('./useMotion', () => ({ useInViewport: () => true, usePrefersReducedMotion: () => motion.reduced }));
afterEach(() => {
  motion.reduced = false; vi.useRealTimers();
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Siguiente paso' }));
const advanceTo = (depth: number) => {
  for (let i = 0; i < depth; i++) next();
};

describe('DecisionTreeOva', () => {
  it('con profundidad 1 muestra 2 hojas y 85.7 %; con 5, 9 hojas y 100 % en entrenamiento', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<DecisionTreeOva />);
    next();
    expect(status(container)).toMatch(/^Nivel 1 de 5 · 2 hojas · acierta 85\.7 %/);
    expect(status(container)).not.toMatch(/overfitting/);

    advanceTo(4);
    expect(status(container)).toMatch(/^Nivel 5 de 5 · 9 hojas · acierta 100\.0 %/);
    expect(status(container)).toMatch(/no demuestra sobreajuste por sí solo/);
    expect(error).not.toHaveBeenCalled();
  });

  it('el aviso depende del tamaño real de las hojas, no de un nivel fijo', () => {
    const { container } = render(<DecisionTreeOva />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar árbol final' }));
    expect(status(container)).toContain('no demuestra sobreajuste por sí solo');
    fireEvent.change(screen.getByRole('slider', { name: /Mínimo de clientes/ }), { target: { value: '4' } });
    expect(status(container)).not.toContain('no demuestra sobreajuste por sí solo');
  });

  it('con profundidad 2 explica por qué el acierto no cambia', () => {
    const { container } = render(<DecisionTreeOva />);
    advanceTo(2);
    expect(status(container)).toMatch(/^Nivel 2 de 5 · 4 hojas · acierta 85\.7 %/);
    expect(status(container)).toContain(
      'Las preguntas nuevas reducen la mezcla de clases, pero no cambian las predicciones frente al nivel anterior.',
    );
  });

  it('muestra el corte raíz real (5.75) con «sí →» y «no →»', () => {
    const { container } = render(<DecisionTreeOva />);
    next();
    const tree = container.querySelector('ul.mlx-tree')!;
    expect(tree.textContent).toContain('≤ 5.75?');
    expect(tree.textContent).toContain('sí →');
    expect(tree.textContent).toContain('no →');
  });

  it('el árbol de texto va fuera del readout (role="status")', () => {
    const { container } = render(<DecisionTreeOva />);
    advanceTo(3);
    expect(container.querySelector('ul.mlx-tree')).not.toBeNull();
    expect(container.querySelector('[role="status"] ul.mlx-tree')).toBeNull();
    expect(container.querySelector('[role="status"]')?.contains(container.querySelector('ul.mlx-tree'))).toBe(false);
  });

  it('sincroniza la regla nueva con la frontera resaltada del gráfico', () => {
    const { container } = render(<DecisionTreeOva />);
    next();
    expect(container.querySelectorAll('.mlx-tree-split.is-new')).toHaveLength(1);
    expect(container.querySelectorAll('.mlx-tree-rule.is-active')).toHaveLength(1);
    expect(container.querySelector('.mlx-tree-split-label')?.textContent).toContain('deuda ≤ 5.75');
    expect(status(container)).toContain('deuda ≤ 5.75 separa');
  });
  it('mínimo por hoja recalcula regiones y restaurar devuelve el árbol anterior', () => {
    const { container } = render(<DecisionTreeOva />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar árbol final' }));
    const original = container.querySelectorAll('.mlx-tree-region').length;
    fireEvent.change(screen.getByRole('slider', { name: /Mínimo de clientes/ }), { target: { value: '4' } });
    expect(container.querySelectorAll('.mlx-tree-region').length).toBeLessThan(original);
    const counts = Array.from(container.querySelectorAll('.mlx-tree-leaf small'), (el) => Number(el.textContent?.match(/\d+/)?.[0]));
    expect(Math.min(...counts)).toBeGreaterThanOrEqual(4);
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer ajustes' }));
    expect(container.querySelectorAll('.mlx-tree-region')).toHaveLength(original);
  });
  it('mantener el árbol final congela el recorrido y permite comparar profundidad', () => {
    vi.useFakeTimers();
    const { container } = render(<DecisionTreeOva autoPlay />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar árbol final' }));
    expect(status(container)).toContain('Nivel 5 de 5');
    fireEvent.change(screen.getByRole('slider', { name: /Profundidad máxima/ }), { target: { value: '1' } });
    expect(status(container)).toContain('Nivel 1 de 1 · 2 hojas');
    expect(vi.getTimerCount()).toBe(0);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar árbol final' }));
    expect(status(container)).toContain('Nivel 0 de 1');
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente paso' }));
    expect(status(container)).toContain('Nivel 1 de 1');
  });
  it('con movimiento reducido recalcula el resultado sin temporizadores', () => {
    vi.useFakeTimers(); motion.reduced = true;
    const { container } = render(<DecisionTreeOva autoPlay />);
    expect(status(container)).toContain('Nivel 5 de 5');
    fireEvent.change(screen.getByRole('slider', { name: /Mínimo de clientes/ }), { target: { value: '4' } });
    expect(status(container)).toContain('Nivel 5 de 5');
    expect(vi.getTimerCount()).toBe(0);
  });
  it('abre la ficha de hojas y devuelve el foco al control que la abrió', () => {
    render(<DecisionTreeOva />);
    const button = screen.getByRole('button', { name: 'hojas' });
    fireEvent.click(button);
    expect(screen.getByRole('dialog', { name: 'Mínimo de ejemplos por hoja' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
    expect(document.activeElement).toBe(button);
  });

});
