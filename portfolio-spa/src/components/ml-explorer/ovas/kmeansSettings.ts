import { kmeansRun, mulberry32, randomInit, type Pt } from './ovaMath';

/** D² clásico: una extracción por centro; sklearn usa una variante greedy. */
export function kmeansPlusPlus(points: Pt[], k: number, rng: () => number): Pt[] {
  const centers = [points[Math.floor(rng() * points.length)]];
  while (centers.length < k) {
    const weights = points.map(p => Math.min(...centers.map(c => (p.x-c.x)**2 + (p.y-c.y)**2)));
    const total = weights.reduce((s, w) => s+w, 0);
    if (total === 0) { centers.push(points.find(p => !centers.includes(p)) ?? points[0]); continue; }
    let target = rng() * total;
    let index = weights.findIndex(w => { target -= w; return target < 0; });
    if (index < 0) index = weights.length - 1;
    centers.push(points[index]);
  }
  return centers.map(p => ({ ...p }));
}

export function kmeansExperiment(points: Pt[], k: number, seed: number, init: 'random' | 'k-means++', nInit: number, maxIter: number, tol: number) {
  const runs = Array.from({ length: nInit }, (_, i) => {
    const rng = mulberry32((seed + i * 104729) >>> 0);
    const centers = init === 'random' ? randomInit(points, k, rng) : kmeansPlusPlus(points, k, rng);
    return kmeansRun(points, centers, maxIter, tol);
  });
  const selected = runs.reduce((best, run, i) => run[run.length-1].inertia < runs[best][runs[best].length-1].inertia ? i : best, 0);
  return { runs, selected, run: runs[selected] };
}
