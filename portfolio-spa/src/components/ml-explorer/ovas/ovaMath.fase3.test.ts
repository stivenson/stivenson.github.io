import { describe, expect, it } from 'vitest';
import {
  averageLinkage,
  capturedShare,
  covariance2,
  cutTree,
  dbscan,
  dendrogramLayout,
  dist,
  kmeansRun,
  mulberry32,
  nearestCentroid,
  principalAngle,
  projectOnAxis,
  randomInit,
  silhouette,
  sqDist,
  varianceAlong,
  type Pt,
} from './ovaMath';

const p = (x: number, y: number): Pt => ({ x, y });

describe('distancias', () => {
  it('sqDist y dist', () => {
    expect(sqDist(p(0, 0), p(3, 4))).toBe(25);
    expect(dist(p(0, 0), p(3, 4))).toBe(5);
  });
});

describe('K-Means', () => {
  const two = [p(0, 0), p(0, 1), p(10, 0), p(10, 1)];

  it('nearestCentroid: el más cercano; con empate, el de índice menor', () => {
    expect(nearestCentroid(p(1, 0), [p(0, 0), p(10, 0)])).toBe(0);
    expect(nearestCentroid(p(5, 0), [p(0, 0), p(10, 0)])).toBe(0);
    expect(nearestCentroid(p(6, 0), [p(0, 0), p(10, 0)])).toBe(1);
  });

  it('randomInit: k puntos distintos de los datos, siempre los mismos con la misma semilla', () => {
    const a = randomInit(two, 3, mulberry32(5));
    expect(a).toHaveLength(3);
    expect(new Set(a.map((c) => `${c.x},${c.y}`)).size).toBe(3);
    for (const c of a) expect(two).toContainEqual(c);
    expect(randomInit(two, 3, mulberry32(5))).toEqual(a);
  });

  it('kmeansRun: llega a los dos grupos y para cuando ninguna asignación cambia', () => {
    const run = kmeansRun(two, [p(0, 0), p(10, 0)]);
    expect(run[0].labels).toEqual([0, 0, 1, 1]);
    expect(run.at(-1)!.centroids).toEqual([p(0, 0.5), p(10, 0.5)]);
    expect(run.at(-1)!.inertia).toBeCloseTo(1, 12);
    const [a, b] = run.slice(-2);
    expect(b.labels).toEqual(a.labels);
  });

  it('kmeansRun: un mal arranque se atasca en una solución peor (mínimo local)', () => {
    // Centroides iniciales (0, 0) y (0, 1): cada uno se queda con un punto de cada lado.
    const run = kmeansRun(two, [p(0, 0), p(0, 1)]);
    expect(run[0].labels).toEqual([0, 1, 0, 1]);
    expect(run.at(-1)!.labels).toEqual([0, 1, 0, 1]);
    expect(run.at(-1)!.centroids).toEqual([p(5, 0), p(5, 1)]);
    expect(run.at(-1)!.inertia).toBe(100);
    for (let i = 1; i < run.length; i++) expect(run[i].inertia).toBeLessThanOrEqual(run[i - 1].inertia);
  });

  it('un grupo vacío conserva su centroide', () => {
    const run = kmeansRun([p(0, 0), p(1, 0)], [p(0, 0), p(100, 100)]);
    expect(run.at(-1)!.centroids[1]).toEqual(p(100, 100));
  });

  it('silhouette: grupos bien separados → cerca de 1; un solo grupo → 0; un punto solo vale 0', () => {
    expect(silhouette(two, [0, 0, 1, 1])).toBeCloseTo(1 - 1 / 10.0249, 3);
    expect(silhouette(two, [0, 0, 0, 0])).toBe(0);
    // El punto 3 solo en su grupo aporta 0; los otros tres sí cuentan.
    expect(silhouette(two, [0, 0, 1, 2])).toBeLessThan(silhouette(two, [0, 0, 1, 1]));
  });
});

describe('agrupamiento jerárquico (enlace promedio)', () => {
  const line = [p(0, 0), p(1, 0), p(5, 0), p(7, 0)];

  it('une primero lo más cercano; la altura es la distancia promedio entre grupos', () => {
    const m = averageLinkage(line);
    expect(m).toEqual([
      { a: 0, b: 1, height: 1, size: 2 },
      { a: 2, b: 3, height: 2, size: 2 },
      { a: 4, b: 5, height: (5 + 7 + 4 + 6) / 4, size: 4 },
    ]);
  });

  it('cutTree: cortar a una altura deja los grupos unidos por debajo', () => {
    const m = averageLinkage(line);
    expect(cutTree(m, 4, 0.5)).toEqual([0, 1, 2, 3]);
    expect(cutTree(m, 4, 1)).toEqual([0, 0, 1, 2]);
    expect(cutTree(m, 4, 3)).toEqual([0, 0, 1, 1]);
    expect(cutTree(m, 4, 10)).toEqual([0, 0, 0, 0]);
  });

  it('dendrogramLayout: hojas en orden y cada unión en el medio de sus hijos', () => {
    const { order, nodes } = dendrogramLayout(averageLinkage(line), 4);
    expect(order).toEqual([0, 1, 2, 3]);
    expect(nodes[4]).toEqual({ x: 0.5, height: 1 });
    expect(nodes[6]).toEqual({ x: 1.5, height: 5.5 });
  });
});

describe('PCA en 2D', () => {
  const diag = [p(0, 0), p(1, 1), p(2, 2), p(3, 3)];

  it('puntos sobre la diagonal: el eje de 45° captura el 100 %', () => {
    const cov = covariance2(diag);
    expect(cov.mean).toEqual(p(1.5, 1.5));
    expect(cov.sxx).toBeCloseTo(5 / 3, 12);
    expect(principalAngle(cov)).toBeCloseTo(45, 10);
    expect(capturedShare(cov, 45)).toBeCloseTo(1, 12);
    expect(capturedShare(cov, 135)).toBeCloseTo(0, 12);
    expect(capturedShare(cov, 0)).toBeCloseTo(0.5, 12);
  });

  it('varianceAlong a 0° y 90° son las varianzas de x y de y', () => {
    const cov = covariance2([p(0, 0), p(2, 0), p(0, 1), p(2, 1)]);
    expect(varianceAlong(cov, 0)).toBeCloseTo(cov.sxx, 12);
    expect(varianceAlong(cov, 90)).toBeCloseTo(cov.syy, 12);
    expect(principalAngle(cov)).toBeCloseTo(0, 10);
  });

  it('principalAngle devuelve un ángulo en [0, 180)', () => {
    const anti = covariance2([p(0, 3), p(1, 2), p(2, 1), p(3, 0)]);
    expect(principalAngle(anti)).toBeCloseTo(135, 10);
  });

  it('projectOnAxis deja el punto sobre la recta', () => {
    const q = projectOnAxis(p(2, 0), p(0, 0), 45);
    expect(q.x).toBeCloseTo(1, 12);
    expect(q.y).toBeCloseTo(1, 12);
  });
});

describe('DBSCAN', () => {
  const pts = [p(0, 0), p(0.5, 0), p(1, 0), p(5, 0), p(5.5, 0), p(9, 9)];

  it('núcleos, borde y ruido como en scikit-learn (vecinos a ≤ ε contando el propio punto)', () => {
    const r = dbscan(pts, 0.5, 3);
    expect(r.core).toEqual([false, true, false, false, false, false]);
    expect(r.labels).toEqual([0, 0, 0, -1, -1, -1]);
    expect(r.clusters).toBe(1);
    expect(r.noise).toBe(3);
  });

  it('con minPts = 2 los pares cercanos también forman grupo', () => {
    const r = dbscan(pts, 0.5, 2);
    expect(r.labels).toEqual([0, 0, 0, 1, 1, -1]);
  });

  it('con ε grande todo es un grupo; con minPts = 1 nada es ruido', () => {
    expect(dbscan(pts, 20, 3).clusters).toBe(1);
    expect(dbscan(pts, 0.1, 1).noise).toBe(0);
  });
});
