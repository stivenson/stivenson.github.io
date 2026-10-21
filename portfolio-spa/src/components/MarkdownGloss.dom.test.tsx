// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MarkdownRenderer } from './MarkdownRenderer';
import { GLOSSARY } from './ml-explorer/glossary';
import article from '../data/articles/algoritmos-ml-explorador.md?raw';

afterEach(cleanup);

describe('fichas compartidas entre el artículo y el explorador', () => {
  it('abre el concepto desde Markdown y devuelve el foco al cerrar', () => {
    render(<MarkdownRenderer content={'Un <span data-glossary="hiperparametro">hiperparámetro</span> configura el entrenamiento.'} />);
    const opener = screen.getByRole('button', { name: 'hiperparámetro' });
    fireEvent.click(opener);
    expect(screen.getByRole('dialog', { name: GLOSSARY.hiperparametro.term })).toBeTruthy();
    expect(screen.getByText(GLOSSARY.hiperparametro.what)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('conserva texto y formato si una clave es desconocida', () => {
    render(<MarkdownRenderer content={'<span data-glossary="no-existe"><b>Texto legible</b></span>'} />);
    expect(screen.getByText('Texto legible').tagName).toBe('B');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('todas las fichas del artículo tienen una entrada válida y se renderizan como botones', () => {
    const keys = [...article.matchAll(/data-glossary="([^"]+)"/g)].map((m) => m[1]);
    expect(keys).toEqual(expect.arrayContaining(['hiperparametro', 'parametroAprendido', 'controlDidactico', 'datosValidacion', 'validacionCruzada', 'fugaInformacion', 'validacionTemporal']));
    for (const key of keys) expect(Object.hasOwn(GLOSSARY, key), key).toBe(true);
    const { container } = render(<MarkdownRenderer content={article.replace('<ml-explorer>\n</ml-explorer>', '')} />);
    expect(container.querySelectorAll('button.mlx-gl')).toHaveLength(keys.length);
    expect(container.querySelector('[data-glossary]')).toBeNull();
    for (const block of container.querySelectorAll('p, li, blockquote')) {
      expect(block.querySelectorAll('button.mlx-gl').length, block.textContent ?? '').toBeLessThanOrEqual(3);
    }
    expect([...container.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toContain('#/articles/algoritmos-ml-explorador?alg=linear-regression&tab=bestUse');
    fireEvent.click(screen.getByRole('button', { name: 'Parámetro aprendido' }));
    expect(screen.getByRole('dialog', { name: 'Parámetro aprendido' })).toBeTruthy();
  });
});
