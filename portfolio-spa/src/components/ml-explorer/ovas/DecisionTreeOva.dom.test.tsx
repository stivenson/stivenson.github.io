// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DecisionTreeOva } from './DecisionTreeOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Siguiente paso' }));
const advanceTo = (depth: number) => {
  for (let i = 0; i < depth; i++) next();
};

describe('DecisionTreeOva', () => {
  it('con profundidad 1 muestra 2 reglas y 85.7 %; con 5, 9 reglas, 100 % y el aviso de sobreajuste', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<DecisionTreeOva />);
    next();
    expect(status(container)).toMatch(/^Nivel 1 de 5 · 2 reglas · acierta 85\.7 %/);
    expect(status(container)).not.toMatch(/overfitting/);

    advanceTo(4);
    expect(status(container)).toMatch(/^Nivel 5 de 5 · 9 reglas · acierta 100\.0 %/);
    expect(status(container)).toMatch(/empieza a encerrar puntos de ruido.*\(overfitting\)/);
    expect(error).not.toHaveBeenCalled();
  });

  it('el aviso de sobreajuste no aparece con profundidad 3 y sí con 4', () => {
    const { container } = render(<DecisionTreeOva />);
    advanceTo(3);
    expect(status(container)).not.toMatch(/overfitting/);
    next();
    expect(status(container)).toMatch(/empieza a encerrar puntos de ruido.*\(overfitting\)/);
  });

  it('con profundidad 2 explica por qué el acierto no cambia', () => {
    const { container } = render(<DecisionTreeOva />);
    advanceTo(2);
    expect(status(container)).toMatch(/^Nivel 2 de 5 · 4 reglas · acierta 85\.7 %/);
    expect(status(container)).toContain(
      'Hay 4 hojas pero el mismo acierto que con 1 nivel: los cortes nuevos dejan grupos más puros sin cambiar ninguna predicción.',
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
});
