import { describe, expect, it } from 'vitest';
import reference from './knn-reference.json';
import { KNN_POINTS } from './datasets';
import { knnVote, type LabeledPt } from './ovaMath';

describe('KNN: k, pesos y métrica', () => {
  it.each(reference.cases)('referencia sklearn: k=$k, weights=$weights, p=$p', item => {
    reference.queries.forEach(([x, y], i) => {
      const result = knnVote(KNN_POINTS, { x, y }, item.k, { weights: item.weights as 'uniform' | 'distance', p: item.p as 1 | 2 });
      expect(result.winner).toBe(item.predictions[i]);
      result.distances.forEach((d, j) => expect(d).toBeCloseTo(item.distances[i][j], 9));
      const total = result.scores[0] + result.scores[1];
      expect(result.scores[1] / total).toBeCloseTo(item.probabilities[i][1], 9);
    });
  });
  it('distancia cero: solo votan las coincidencias exactas seleccionadas, sin infinitos', () => {
    const points: LabeledPt[] = [{ x: 1, y: 1, label: 1 }, { x: 1, y: 1, label: 0 }, { x: 2, y: 1, label: 1 }];
    const result = knnVote(points, { x: 1, y: 1 }, 3, { weights: 'distance' });
    expect(result.neighborWeights).toEqual([1, 1, 0]);
    expect(result.scores).toEqual([1, 1]);
    expect(result.winner).toBe(0);
    expect(result.scores.every(Number.isFinite)).toBe(true);
  });
  it('en empates de distancia conserva el orden original y limita k a los datos', () => {
    const points: LabeledPt[] = [{ x: -1, y: 0, label: 1 }, { x: 1, y: 0, label: 0 }];
    expect(knnVote(points, { x: 0, y: 0 }, 1).neighbors).toEqual([0]);
    expect(knnVote(points, { x: 0, y: 0 }, 100).neighbors).toEqual([0, 1]);
  });
});
