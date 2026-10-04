import { describe, expect, it } from 'vitest';
import { AVAILABLE_SLUGS, loadAlgorithm } from './registry';

interface Cell {
  id: string;
  cell_type: string;
  source: string[];
}

// Sin @types/node: se leen como texto con la sintaxis ?raw de Vite.
const notebookFiles = import.meta.glob('../../../../notebooks/algoritmos-ml.ipynb', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const pyFiles = import.meta.glob('./algorithms/python/*.py', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const notebook = JSON.parse(Object.values(notebookFiles)[0]) as { cells: Cell[] };
const cells = notebook.cells;

describe('notebook de Colab', () => {
  it('cada cell tiene un id unico', () => {
    const ids = cells.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(AVAILABLE_SLUGS)('%s: seccion con ancla y codigo identico al .py', (slug) => {
    const i = cells.findIndex((c) => c.id === slug);
    expect(i, `falta la celda markdown con id ${slug}`).toBeGreaterThanOrEqual(0);
    expect(cells[i].cell_type).toBe('markdown');
    const next = cells[i + 1];
    expect(next?.id).toBe(`${slug}-codigo`);
    expect(next.cell_type).toBe('code');
    const py = pyFiles[`./algorithms/python/${slug}.py`].replace(/\n+$/, '');
    expect(next.source.join('')).toBe(py);
  });

  it.each(AVAILABLE_SLUGS)('%s: python.colabAnchor coincide con el slug', async (slug) => {
    const mod = await loadAlgorithm(slug);
    expect(mod.python.colabAnchor).toBe(slug);
  });
});
