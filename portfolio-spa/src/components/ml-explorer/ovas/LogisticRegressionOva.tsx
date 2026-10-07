import { useMemo, useRef, useState } from 'react';
import { LOGISTIC_XS as XS, LOGISTIC_YS as YS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { sigmoid } from './ovaMath';
import { createPlot } from './plot';
import { useInViewport, usePrefersReducedMotion } from './useMotion';
import { useAutoLoop } from './useAutoLoop';

const PLOT = createPlot(360, 260, 30, [0, 10], [-0.1, 1.1]);
const MAX_ITERATIONS = 10;

function newtonTrace(xs: number[], ys: number[], maxIterations: number) {
  const frames = [{ b0: 0, b1: 0 }];
  let b0 = 0;
  let b1 = 0;
  const lambda = 1e-4;
  for (let it = 0; it < maxIterations; it++) {
    let g0 = 0;
    let g1 = lambda * b1;
    let h00 = 0;
    let h01 = 0;
    let h11 = lambda;
    for (let i = 0; i < xs.length; i++) {
      const p = sigmoid(b0 + b1 * xs[i]);
      const error = p - ys[i];
      const weight = p * (1 - p);
      g0 += error;
      g1 += error * xs[i];
      h00 += weight;
      h01 += weight * xs[i];
      h11 += weight * xs[i] * xs[i];
    }
    const determinant = h00 * h11 - h01 * h01;
    if (!(Math.abs(determinant) > 1e-300)) break;
    const d0 = (h11 * g0 - h01 * g1) / determinant;
    const d1 = (h00 * g1 - h01 * g0) / determinant;
    b0 -= d0;
    b1 -= d1;
    frames.push({ b0, b1 });
    if (Math.abs(d0) + Math.abs(d1) < 1e-12) break;
  }
  while (frames.length <= maxIterations) frames.push(frames[frames.length - 1]);
  return frames;
}

export function LogisticRegressionOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [maxIterations, setMaxIterations] = useState(MAX_ITERATIONS);
  const [threshold, setThreshold] = useState(0.5);
  const [iteration, setIteration] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  useAutoLoop(iteration, maxIterations, setIteration, visible, reducedMotion, autoPlay, 450, 1000);

  const frames = useMemo(() => newtonTrace(XS, YS, MAX_ITERATIONS), []);
  const { b0, b1 } = frames[Math.min(iteration, frames.length - 1)];
  const prob = (x: number) => sigmoid(b0 + b1 * x);
  const predicted = (x: number) => (prob(x) >= threshold ? 1 : 0);
  const hits = XS.filter((x, i) => predicted(x) === YS[i]).length;
  const boundary = b1 !== 0 ? (Math.log(threshold / (1 - threshold)) - b0) / b1 : null;
  const curve = Array.from({ length: 101 }, (_, i) => {
    const x = i / 10;
    return `${i === 0 ? 'M' : 'L'}${PLOT.sx(x).toFixed(1)},${PLOT.sy(prob(x)).toFixed(1)}`;
  }).join(' ');

  return (
    <OvaFrame
      title="La curva aprende y separa clases"
      hint="Cada paso aplica una actualización del método de Newton: la curva transforma el número de veces que aparece «gratis» en una probabilidad de spam. Al cruzar el umbral, cada correo recibe una clase. El relleno muestra la predicción y el borde la clase real; los bordes rosas señalan errores por el solapamiento entre correos normales y spam. El ajuste se reinicia y vuelve a aprender en bucle."
      controls={
        <>
          <OvaSlider
            label="Iteraciones máximas"
            value={maxIterations}
            min={1}
            max={MAX_ITERATIONS}
            step={1}
            onChange={(value) => {
              setMaxIterations(value);
              setIteration(0);
            }}
          />
          <OvaSlider
            label="Umbral de spam"
            value={threshold}
            min={0.2}
            max={0.8}
            step={0.05}
            onChange={setThreshold}
            format={(value) => value.toFixed(2)}
          />
        </>
      }
      readoutLive="off"
      readout={
        <>
          <span>Iteración <b>{iteration}</b> de <b>{maxIterations}</b> · b₀ = <b>{b0.toFixed(2)}</b> · b₁ = <b>{b1.toFixed(2)}</b></span>
          <span>Umbral: <b>{(threshold * 100).toFixed(0)} %</b> · acierta <b>{hits} de {XS.length}</b> correos</span>
          <span>Relleno: predicción · borde: clase real.</span>
        </>
      }
    >
      <div ref={stageRef}>
        <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} role="img" aria-label={`Curva logística en iteración ${iteration} de ${maxIterations}, con ${hits} aciertos de ${XS.length}`}>
          {[0, 0.5, 1].map((y) => (
            <g key={y}>
              <line x1={PLOT.sx(0)} x2={PLOT.sx(10)} y1={PLOT.sy(y)} y2={PLOT.sy(y)} stroke={OVA_COLORS.grid} />
              <text x={PLOT.sx(0) - 6} y={PLOT.sy(y) + 4} textAnchor="end" fontSize={10} fill={OVA_COLORS.axis}>{y}</text>
            </g>
          ))}
          <text x={PLOT.sx(10)} y={PLOT.height - 6} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>veces que dice «gratis» →</text>
          <line x1={PLOT.sx(0)} x2={PLOT.sx(10)} y1={PLOT.sy(threshold)} y2={PLOT.sy(threshold)} stroke={OVA_COLORS.axis} strokeDasharray="5 4" />
          {iteration > 0 && boundary !== null && boundary >= 0 && boundary <= 10 && (
            <g>
              <line className="mlx-logistic-boundary" x1={PLOT.sx(boundary)} x2={PLOT.sx(boundary)} y1={PLOT.sy(-0.1)} y2={PLOT.sy(1.1)} stroke={OVA_COLORS.accent} strokeDasharray="5 4" />
              <text x={PLOT.sx(boundary) + (boundary > 8 ? -4 : 4)} y={PLOT.sy(1.05)} textAnchor={boundary > 8 ? 'end' : 'start'} fontSize={10} fill={OVA_COLORS.accent}>frontera</text>
            </g>
          )}
          <path className="mlx-logistic-curve" d={curve} fill="none" stroke={OVA_COLORS.accent} strokeWidth={2.5} />
          {XS.map((x, i) => {
            const y = YS[i] + (i % 2 ? 0.04 : -0.04);
            const prediction = iteration === 0 ? null : predicted(x);
            const correct = prediction === YS[i];
            return (
              <circle
                className="mlx-logistic-point"
                key={i}
                cx={PLOT.sx(x)}
                cy={PLOT.sy(y)}
                r={6}
                fill={prediction === null ? OVA_COLORS.axis : prediction ? OVA_COLORS.class1 : OVA_COLORS.class0}
                stroke={prediction === null ? '#d9d9e8' : !correct ? OVA_COLORS.risk : YS[i] ? OVA_COLORS.class1 : OVA_COLORS.class0}
                strokeWidth={prediction !== null && !correct ? 3 : 1.5}
              />
            );
          })}
        </svg>
      </div>
    </OvaFrame>
  );
}
