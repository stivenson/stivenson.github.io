import { describe, expect, it } from 'vitest';
import { buildForest, buildRandomTree, countLeaves, forestPredict, mulberry32, type TreeNode, type LabeledPt } from './ovaMath';
import { TREE_POINTS } from './datasets';
import reference from './decision-tree-reference.json';
const depth = (t: TreeNode): number => t.kind === 'leaf' ? 0 : 1 + Math.max(depth(t.left), depth(t.right));

describe('Ajustes reales del bosque', () => {
  it.each(reference.cases)('sin bootstrap y con ambas variables: caso sklearn $maxDepth / $minSamplesLeaf', (c) => {
    // Con un solo eje variable, sin muestreo ni selección de columnas,
    // cada árbol equivale al CART de referencia; no compara RNG distintos.
    const forest = buildForest(reference.points as LabeledPt[], 3, c.maxDepth, 1, { bootstrap: false, maxFeatures: 2, minSamplesLeaf: c.minSamplesLeaf });
    for (const t of forest) expect(countLeaves(t)).toBe(c.leaves);
    expect(reference.queries.map((p) => forestPredict(forest, p))).toEqual(c.predictions);
  });
  it('respeta profundidad, semilla y prefijos bajo la misma configuración', () => {
    const options = { bootstrap: true, maxFeatures: 2 as const, minSamplesLeaf: 3 };
    const big = buildForest(TREE_POINTS, 10, 2, 7, options);
    expect(big.every((t) => depth(t) <= 2)).toBe(true);
    expect(buildForest(TREE_POINTS, 4, 2, 7, options)).toEqual(big.slice(0, 4));
    expect(buildForest(TREE_POINTS, 10, 2, 7, options)).toEqual(big);
  });
  it('repetir un cliente en bootstrap no satisface el mínimo de clientes distintos', () => {
    const a: LabeledPt = { x: 0, y: 0, label: 0 }, b: LabeledPt = { x: 1, y: 1, label: 1 };
    const sample = [...Array(20).fill(a), ...Array(20).fill(b)];
    expect(buildRandomTree(sample, 8, mulberry32(1), { minSamplesLeaf: 2 }).kind).toBe('leaf');
    expect(countLeaves(buildRandomTree(sample, 8, mulberry32(1), { minSamplesLeaf: 1 }))).toBe(2);
  });
  it('las hojas respetan mínimos distintos en muestras con duplicados', () => {
    const points: LabeledPt[] = Array.from({ length: 12 }, (_, x) => ({ x, y: x % 3, label: (x % 2) as 0 | 1 }));
    const sample = [...points, ...Array(20).fill(points[0])];
    const tree = buildRandomTree(sample, 8, mulberry32(2), { minSamplesLeaf: 3 });
    const visit = (t: TreeNode, rows: LabeledPt[]) => {
      if (t.kind === 'leaf') { expect(new Set(rows).size).toBeGreaterThanOrEqual(3); return; }
      visit(t.left, rows.filter((p) => p[t.axis] <= t.threshold));
      visit(t.right, rows.filter((p) => p[t.axis] > t.threshold));
    };
    visit(tree, sample);
  });
  it('bootstrap y variables por corte cambian la estructura, sin alterar los datos', () => {
    const copy = JSON.stringify(TREE_POINTS);
    const original = buildForest(TREE_POINTS, 10, 8, 1);
    expect(buildForest(TREE_POINTS, 10, 8, 1, { bootstrap: false })).not.toEqual(original);
    expect(buildForest(TREE_POINTS, 10, 8, 1, { maxFeatures: 2 })).not.toEqual(original);
    expect(JSON.stringify(TREE_POINTS)).toBe(copy);
  });
  it('rechaza configuraciones inválidas', () => {
    expect(() => buildForest(TREE_POINTS, -1, 8, 1)).toThrow(RangeError);
    expect(() => buildForest(TREE_POINTS, 5, 8, 1, { minSamplesLeaf: 0 })).toThrow(RangeError);
  });
});
