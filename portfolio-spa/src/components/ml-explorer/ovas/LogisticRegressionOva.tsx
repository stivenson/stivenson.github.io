import { useMemo, useRef, useState } from 'react';
import { LOGISTIC_XS as XS, LOGISTIC_YS as YS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { G } from '../Gloss';
import { logisticTrace, logisticDecisions } from './logisticOvaMath';
import './LogisticRegressionOva.css';
import { sigmoid } from './ovaMath';
import { createPlot } from './plot';
import { useInViewport, usePrefersReducedMotion } from './useMotion';
import { useAutoLoop } from './useAutoLoop';

const PLOT = createPlot(360, 260, 30, [0, 10], [-0.1, 1.1]);
const MAX_ITERATIONS = 12;

function curveFor({ b0, b1 }: { b0: number; b1: number }) {
  return Array.from({ length: 101 }, (_, i) => {
    const x = i / 10;
    const probability = sigmoid(b0 + b1 * x);
    return `${i === 0 ? 'M' : 'L'}${PLOT.sx(x).toFixed(1)},${PLOT.sy(probability).toFixed(1)}`;
  }).join(' ');
}

export function LogisticRegressionOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [C, setC] = useState(1);
  const [showResult, setShowResult] = useState(!autoPlay);
  const [maxIterations, setMaxIterations] = useState(MAX_ITERATIONS);
  const [threshold, setThreshold] = useState(0.5);
  const [iteration, setIteration] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();

  const trace = useMemo(() => logisticTrace(XS, YS, C, maxIterations), [C, maxIterations]);
  const last = trace.convergedAt ?? maxIterations;
  const playback = useAutoLoop(iteration, last, setIteration, visible && !showResult, reducedMotion, autoPlay && !showResult, 850, 5000);
  const shown = showResult ? last : Math.min(iteration, last);
  const effectiveIteration = Math.min(shown, trace.convergedAt ?? shown);
  const frame = trace.frames[shown];
  const { b0, b1 } = frame;
  const converged = trace.convergedAt !== null && shown >= trace.convergedAt;
  const prob = (x: number) => sigmoid(b0 + b1 * x);
  const probabilities = XS.map(prob);
  const { predictions, fp, fn, hits } = logisticDecisions(probabilities, YS, threshold);
  const boundary = b1 !== 0 ? (Math.log(threshold / (1 - threshold)) - b0) / b1 : null;
  const curve = curveFor(frame);
  const previousCurve = shown > 0 ? curveFor(trace.frames[Math.max(0, shown - 1)]) : null;

  return (
    <OvaFrame
      playback={showResult ? undefined : playback}
      explanation={shown === 0
        ? 'Vamos a convertir la cantidad de menciones de «gratis» en una probabilidad de spam.'
        : converged
          ? 'La curva convergió: el cambio de los parámetros ya es menor a 0,000000001. Seguir iterando no alteraría de forma visible la frontera ni la predicción.'
          : `La curva verde es el ajuste de la actualización ${effectiveIteration}; la línea gris discontinua conserva la iteración anterior para que puedas comparar el cambio. El umbral ${threshold.toFixed(2)} convierte la probabilidad en una clase.`}
      title="La curva aprende y separa clases"
      hint="La curva convierte la frecuencia de «gratis» en una probabilidad de spam. C cambia la fuerza de la regularización y vuelve a entrenar; el umbral cambia las decisiones sin volver a entrenar. La animación muestra actualizaciones de Newton sobre 18 correos simulados; sus aciertos no miden el rendimiento con correos nuevos."
      controls={
        <>
          <label className="mlx-logistic-static"><input type="checkbox" checked={showResult} onChange={(e) => { setShowResult(e.target.checked); setIteration(0); }} /> Mostrar ajuste final</label>
          <div className="mlx-logistic-settings" role="group" aria-label="Ajustes de entrenamiento">
            <strong>1. Entrenamiento</strong>
            <label className="mlx-logistic-select">Regularización inversa (C)
              <select value={C} onChange={(e) => { setC(Number(e.target.value)); setIteration(0); }}>
                {[0.01, 0.1, 1, 10, 100].map((value) => <option key={value} value={value}>C = {value}</option>)}
              </select>
            </label>
            <p><G k="fuerzaRegularizacion">C pequeño</G> penaliza más los coeficientes grandes. Observa cómo cambia la curva; no garantiza más aciertos.</p>
          <OvaSlider
            label="Límite de entrenamiento (max_iter)"
            value={maxIterations}
            min={1}
            max={MAX_ITERATIONS}
            step={1}
            onChange={(value) => {
              setMaxIterations(value);
              setIteration(0);
            }}
          />
            <p>El límite permite detener el entrenamiento antes de <G k="convergencia" after=".">converger</G> Subirlo después de la convergencia no obliga a cambiar la curva.</p>
            <output>Coeficientes aprendidos: b₀ = {b0.toFixed(2)} · b₁ = {b1.toFixed(2)}. Para x = 4: {(prob(4) * 100).toFixed(1)} % de spam.</output>
          </div>
          <div className="mlx-logistic-settings" role="group" aria-label="Regla de decisión">
            <strong>2. Decisión sin reentrenar</strong>
          <OvaSlider
            label="Umbral de spam"
            value={threshold}
            min={0.2}
            max={0.8}
            step={0.05}
            onChange={setThreshold}
            format={(value) => value.toFixed(2)}
          />
            <p>El <G k="umbral">umbral</G> decide qué probabilidades se marcan como spam. Activa «Mostrar ajuste final» para comparar con la curva quieta. Los coeficientes no cambian al mover el umbral; aquí se marca spam si P ≥ umbral.</p>
            <output>Falsas alarmas: {fp} · spam que se escapan: {fn}. Sobre los 18 ejemplos de entrenamiento.</output>
          </div>

          <p className="mlx-logistic-note">Fijos: penalización L2, intercepto libre y <code>class_weight=None</code>. El recorrido es un <G k="controlDidactico">control didáctico</G>; no es una tasa de aprendizaje.</p>
          <button type="button" onClick={() => { setC(1); setMaxIterations(MAX_ITERATIONS); setThreshold(0.5); setIteration(0); }}>Restablecer ajustes</button>
        </>
      }
      readoutLive="off"
      readout={
        <>
          <span>C = <b>{C}</b> · Actualización efectiva <b>{effectiveIteration}</b> · límite <b>{maxIterations}</b> · b₀ = <b>{b0.toFixed(2)}</b> · b₁ = <b>{b1.toFixed(2)}</b></span>
          <span>Entrenamiento: acierta <b>{hits} de {XS.length}</b> · umbral <b>{(threshold * 100).toFixed(0)} %</b></span>
          <span>Falsas alarmas: <b>{fp}</b> · spam que se escapan: <b>{fn}</b></span>
          <span>Para x = 4: P(spam) = <b>{(prob(4) * 100).toFixed(1)} %</b>. Es probabilidad, no porcentaje de aciertos.</span>
          <span>{trace.convergedAt !== null && shown >= trace.convergedAt ? `Convergencia en la actualización ${trace.convergedAt}; la animación se detiene en ese resultado.` : 'Ajuste aún en curso o detenido antes de converger.'}</span>
          <span>Relleno: predicción · borde: clase real.</span>
        </>
      }
    >
      <div className="mlx-logistic-viz" ref={stageRef}>
        <div className="mlx-logistic-summary"><b>C = {C} · umbral {(threshold * 100).toFixed(0)} %</b><span>Para x = 4: {(prob(4) * 100).toFixed(1)} % de spam · b₀ = {b0.toFixed(2)} · b₁ = {b1.toFixed(2)}</span><span>Falsas alarmas: {fp} · spam que se escapan: {fn}. Medidos sobre el entrenamiento.</span></div>
        <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} role="img" aria-label={`Curva logística en actualización ${effectiveIteration}, con límite ${maxIterations}, con ${hits} aciertos de ${XS.length}`}>
          {[0, 0.5, 1].map((y) => (
            <g key={y}>
              <line x1={PLOT.sx(0)} x2={PLOT.sx(10)} y1={PLOT.sy(y)} y2={PLOT.sy(y)} stroke={OVA_COLORS.grid} />
              <text x={PLOT.sx(0) - 6} y={PLOT.sy(y) + 4} textAnchor="end" fontSize={10} fill={OVA_COLORS.axis}>{y}</text>
            </g>
          ))}
          <text x={PLOT.sx(10)} y={PLOT.height - 6} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>menciones de «gratis» por 100 palabras →</text>
          <line x1={PLOT.sx(0)} x2={PLOT.sx(10)} y1={PLOT.sy(threshold)} y2={PLOT.sy(threshold)} stroke={OVA_COLORS.axis} strokeDasharray="5 4" />
          {shown > 0 && boundary !== null && boundary >= 0 && boundary <= 10 && (
            <g>
              <line className="mlx-logistic-boundary" x1={PLOT.sx(boundary)} x2={PLOT.sx(boundary)} y1={PLOT.sy(-0.1)} y2={PLOT.sy(1.1)} stroke={OVA_COLORS.accent} strokeDasharray="5 4" />
              <text x={PLOT.sx(boundary) + (boundary > 8 ? -4 : 4)} y={PLOT.sy(1.05)} textAnchor={boundary > 8 ? 'end' : 'start'} fontSize={10} fill={OVA_COLORS.accent}>frontera</text>
            </g>
          )}
          {previousCurve && <path className="mlx-logistic-curve-previous" d={previousCurve} fill="none" stroke={OVA_COLORS.axis} strokeWidth={1.5} strokeDasharray="5 4" />}
          <path className="mlx-logistic-curve" d={curve} fill="none" stroke={OVA_COLORS.accent} strokeWidth={2.5} />
          {converged && (
            <g className="mlx-logistic-converged" aria-hidden="true">
              <rect x={36} y={4} width={105} height={23} rx={11.5} fill="rgba(16, 185, 129, 0.18)" stroke={OVA_COLORS.accent} />
              <text x={88.5} y={19.5} textAnchor="middle" fontSize={11} fontWeight={700} fill="#75e5be">✓ Convergió</text>
            </g>
          )}
          {XS.map((x, i) => {
            const y = YS[i] + (i % 2 ? 0.04 : -0.04);
            const prediction = shown === 0 ? null : predictions[i];
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
