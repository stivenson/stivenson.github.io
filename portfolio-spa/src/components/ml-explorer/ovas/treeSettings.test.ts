import { describe, expect, it } from 'vitest';
import { buildTree, countLeaves, predictTree, type TreeNode, type LabeledPt } from './ovaMath';
import { TREE_POINTS } from './datasets';
import reference from './decision-tree-reference.json';
const sizes = (t: TreeNode): number[] => t.kind === 'leaf' ? [t.count[0] + t.count[1]] : [...sizes(t.left), ...sizes(t.right)];

describe('CART: mínimo por hoja', () => {
  it.each(reference.cases)('coincide con sklearn: profundidad $maxDepth, mínimo $minSamplesLeaf', (c) => {
    const tree = buildTree(reference.points as LabeledPt[], c.maxDepth, c.minSamplesLeaf);
    expect(countLeaves(tree)).toBe(c.leaves);
    expect(reference.queries.map((p) => predictTree(tree, p))).toEqual(c.predictions);
    expect(reference.points.map((p) => predictTree(tree, p))).toEqual(c.trainingPredictions);
  });
  it.each([1, 2, 3, 4, 5, 6, 7])('ninguna hoja del ejemplo tiene menos de %i clientes', (min) => {
    expect(Math.min(...sizes(buildTree(TREE_POINTS, 5, min)))).toBeGreaterThanOrEqual(min);
  });
  it('rechaza mínimos inválidos y conserva el comportamiento con mínimo 1', () => {
    for (const value of [0, -1, 1.5, NaN]) expect(() => buildTree(TREE_POINTS, 5, value)).toThrow(RangeError);
    expect(buildTree(TREE_POINTS, 5)).toEqual(buildTree(TREE_POINTS, 5, 1));
  });
  it('descarta cortes que dejan un hijo pequeño, aunque el padre tenga suficientes ejemplos', () => {
    const points: LabeledPt[] = Array.from({ length: 10 }, (_, x) => ({ x, y: 0, label: x === 0 ? 1 : 0 }));
    expect(countLeaves(buildTree(points, 1, 1))).toBe(2);
    expect(Math.min(...sizes(buildTree(points, 1, 4)))).toBeGreaterThanOrEqual(4);
  });
});
