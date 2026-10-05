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
const singleFiles = import.meta.glob('../../../../notebooks/algoritmos-ml/*.ipynb', {
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

  it.each(AVAILABLE_SLUGS)('%s: python.colabNotebook coincide con el slug', async (slug) => {
    const mod = await loadAlgorithm(slug);
    expect(mod.python.colabNotebook).toBe(slug);
  });
});

/** Las redes neuronales ya disponibles: cada una lleva una celda opcional de PyTorch. */
const NEURAL = ['mlp', 'cnn', 'rnn', 'transformer', 'autoencoders'].filter((s) => AVAILABLE_SLUGS.includes(s));

describe('celdas opcionales de PyTorch (fase 4)', () => {
  it.each(NEURAL)('%s: va justo después del ejercicio, en ambos notebooks, y no falla sin PyTorch', (slug) => {
    const raw = singleFiles[`../../../../notebooks/algoritmos-ml/${slug}.ipynb`];
    const single = (JSON.parse(raw) as { cells: Cell[] }).cells;
    for (const list of [cells, single]) {
      const i = list.findIndex((c) => c.id === `${slug}-codigo`);
      expect(list[i + 1]?.id).toBe(`${slug}-pytorch-nota`);
      const opt = list[i + 2];
      expect(opt?.id).toBe(`${slug}-pytorch`);
      expect(opt.cell_type).toBe('code');
      const src = opt.source.join('');
      expect(src.startsWith('# Opcional')).toBe(true);
      // Un PyTorch ausente lanza ImportError; uno instalado pero roto, OSError.
      expect(src).toContain('except (ImportError, OSError):');
    }
  });

  it('solo las redes neuronales tienen celda de PyTorch', () => {
    const withTorch = cells.filter((c) => c.id.endsWith('-pytorch')).map((c) => c.id.replace(/-pytorch$/, ''));
    expect(withTorch).toEqual(NEURAL);
  });
});

describe('notebooks individuales de Colab', () => {
  it.each(AVAILABLE_SLUGS)('%s: un notebook con una sola celda de codigo identica al .py', (slug) => {
    const raw = singleFiles[`../../../../notebooks/algoritmos-ml/${slug}.ipynb`];
    expect(raw, `falta notebooks/algoritmos-ml/${slug}.ipynb`).toBeDefined();
    const nb = JSON.parse(raw) as { nbformat: number; cells: Cell[] };
    expect(nb.nbformat).toBe(4);
    const ids = nb.cells.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    // Una sola celda del ejercicio; las redes neuronales llevan además una opcional de PyTorch.
    const codeCells = nb.cells.filter((c) => c.cell_type === 'code' && c.id !== `${slug}-pytorch`);
    expect(codeCells).toHaveLength(1);
    expect(codeCells[0].source.join('')).toBe(pyFiles[`./algorithms/python/${slug}.py`].replace(/\n+$/, ''));
    const md = nb.cells.filter((c) => c.cell_type === 'markdown').map((c) => c.source.join('')).join('\n');
    expect(md).toContain(`?alg=${slug}&tab=realWorld`);
  });
});
