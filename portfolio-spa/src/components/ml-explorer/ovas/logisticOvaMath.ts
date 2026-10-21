import { sigmoid, type Line } from './ovaMath';

/** Newton para suma de pérdidas logísticas + b1²/(2C); b0 no se penaliza.
 * Equivale al objetivo L2 binario de LogisticRegression sin pesos de clase.
 * Los frames repetidos al final solo conservan el resultado durante la animación.
 */
export function logisticTrace(xs: number[], ys: number[], C: number, maxIterations = 12) {
  if (!Number.isInteger(maxIterations) || maxIterations < 1) throw new RangeError('El límite debe ser un entero positivo');
  if (!Number.isFinite(C) || C <= 0) throw new RangeError('C debe ser positivo');
  if (xs.length !== ys.length || xs.length < 2 || !ys.includes(0) || !ys.includes(1)) throw new RangeError('Se necesitan ambas clases y datos emparejados');
  const frames: Line[] = [{ b0: 0, b1: 0 }];
  let b0 = 0, b1 = 0;
  let convergedAt: number | null = null;
  for (let it = 1; it <= maxIterations; it++) {
    let g0 = 0, g1 = b1 / C, h00 = 0, h01 = 0, h11 = 1 / C;
    xs.forEach((x, i) => {
      const p = sigmoid(b0 + b1 * x), e = p - ys[i], w = p * (1 - p);
      g0 += e; g1 += e * x; h00 += w; h01 += w * x; h11 += w * x * x;
    });
    const det = h00 * h11 - h01 * h01;
    if (!(det > 1e-20)) break;
    const d0 = (h11 * g0 - h01 * g1) / det, d1 = (h00 * g1 - h01 * g0) / det;
    b0 -= d0; b1 -= d1;
    frames.push({ b0, b1 });
    if (Math.abs(d0) + Math.abs(d1) < 1e-9) { convergedAt = it; break; }
  }
  while (frames.length <= maxIterations) frames.push({ ...frames[frames.length - 1] });
  return { frames, convergedAt };
}

/** Mover el umbral no entrena: aplica la misma regla a probabilidades ya calculadas. */
export function logisticDecisions(probabilities: number[], ys: number[], threshold: number) {
  const predictions = probabilities.map((p) => p >= threshold ? 1 : 0);
  let fp = 0, fn = 0;
  predictions.forEach((p, i) => { if (p === 1 && ys[i] === 0) fp++; if (p === 0 && ys[i] === 1) fn++; });
  return { predictions, fp, fn, hits: ys.length - fp - fn };
}
