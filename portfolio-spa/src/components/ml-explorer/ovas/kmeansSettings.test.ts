import { describe, expect, it } from 'vitest';
import reference from './kmeans-reference.json';
import { KM_POINTS } from './datasets';
import { kmeansExperiment, kmeansPlusPlus } from './kmeansSettings';
import { kmeansRun, mulberry32 } from './ovaMath';

describe('K-Means: referencia independiente con centros explícitos', () => {
  for (const c of reference.cases) it(`K=${c.k}, ${c.init}, seed=${c.seed}, max_iter=${c.maxIter}, tol=${c.tol}`, () => {
    const run = kmeansRun(KM_POINTS, c.centers, c.maxIter, c.tol);
    const last = run.at(-1)!;
    expect(last.inertia).toBeCloseTo(c.expectedInertia, 8);
    expect(last.labels).toEqual(c.expectedLabels);
    last.centroids.forEach((p, i) => { expect(p.x).toBeCloseTo(c.expectedCenters[i][0],8); expect(p.y).toBeCloseTo(c.expectedCenters[i][1],8); });
  });
});

it('más arranques conserva candidatos previos y rescata el mal inicio B', () => {
  const one = kmeansExperiment(KM_POINTS,3,12,'random',1,20,0);
  const many = kmeansExperiment(KM_POINTS,3,12,'random',10,20,0);
  expect(many.runs[0]).toEqual(one.run);
  expect(one.run.at(-1)!.inertia).toBeCloseTo(123.3133333,6);
  expect(many.run.at(-1)!.inertia).toBeCloseTo(15.18375,8);
  expect(many.run).toEqual(many.runs[many.selected]);
});
it('distingue límite, tolerancia y asignaciones estables', () => {
  const run = (max: number,tol: number) => kmeansExperiment(KM_POINTS,3,11,'random',1,max,tol).run;
  expect(run(1,0).at(-1)!.stopReason).toBe('limit');
  expect(run(20,0).at(-1)!.stopReason).toBe('stable');
  expect(run(20,.1).at(-1)!.stopReason).toBe('tolerance');
  expect(run(20,.1).length).toBeLessThan(run(20,0).length);
});
it('k-means++ es reproducible y toma centros distintos del conjunto', () => {
  const a=kmeansPlusPlus(KM_POINTS,6,mulberry32(11));
  expect(a).toEqual(kmeansPlusPlus(KM_POINTS,6,mulberry32(11)));
  expect(new Set(a.map(p=>JSON.stringify(p))).size).toBe(6);
  a.forEach(p=>expect(KM_POINTS).toContainEqual(p));
});
