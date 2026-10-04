// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DecisionTreeOva } from './DecisionTreeOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const setDepth = (v: number) => fireEvent.change(screen.getByRole('slider'), { target: { value: String(v) } });

describe('DecisionTreeOva', () => {
  it('con profundidad 1 muestra 2 reglas y 85.7 %; con 5, 9 reglas, 100 % y el aviso de sobreajuste', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<DecisionTreeOva />);
    expect(status(container)).toMatch(/^2 reglas \(hojas\) · acierta 85\.7 %/);
    expect(status(container)).not.toMatch(/overfitting/);

    setDepth(5);
    expect(status(container)).toMatch(/^9 reglas \(hojas\) · acierta 100\.0 %/);
    expect(status(container)).toMatch(/empieza a encerrar puntos de ruido.*\(overfitting\)/);
    expect(error).not.toHaveBeenCalled();
  });

  it('con profundidad 2 explica por qué el acierto no cambia', () => {
    const { container } = render(<DecisionTreeOva />);
    setDepth(2);
    expect(status(container)).toMatch(/^4 reglas \(hojas\) · acierta 85\.7 %/);
    expect(status(container)).toContain(
      'Hay 4 hojas pero el mismo acierto que con 1 nivel: los cortes nuevos dejan grupos más puros sin cambiar ninguna predicción.',
    );
  });

  it('muestra el corte raíz real (5.75) con «sí →» y «no →»', () => {
    const { container } = render(<DecisionTreeOva />);
    const tree = container.querySelector('ul.mlx-tree')!;
    expect(tree.textContent).toContain('≤ 5.75?');
    expect(tree.textContent).toContain('sí →');
    expect(tree.textContent).toContain('no →');
  });

  it('el árbol de texto va fuera del readout (role="status")', () => {
    const { container } = render(<DecisionTreeOva />);
    setDepth(3);
    expect(container.querySelector('ul.mlx-tree')).not.toBeNull();
    expect(container.querySelector('[role="status"] ul.mlx-tree')).toBeNull();
    expect(container.querySelector('[role="status"]')?.contains(container.querySelector('ul.mlx-tree'))).toBe(false);
  });
});
