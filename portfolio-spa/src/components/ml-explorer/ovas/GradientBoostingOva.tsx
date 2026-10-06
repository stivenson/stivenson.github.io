import { useMemo, useRef, useState } from 'react';
import { GB_MAX_STEPS, GB_RATES, GB_XS as XS, GB_YS as YS } from './datasets';
import { OVA_COLORS, OvaFrame } from './OvaFrame';
import { boost, boostMse, predictBoost } from './ovaMath';
import { createPlot } from './plot';
import { useInViewport, usePrefersReducedMotion } from './useMotion';
import { useAutoLoop } from './useAutoLoop';

const PLOT = createPlot(360, 260, 30, [0, 10], [0, 8]);
const START_RATE = 0.3;

export function GradientBoostingOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [steps, setSteps] = useState(0);
  const [rate, setRate] = useState<number>(START_RATE);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  useAutoLoop(steps, GB_MAX_STEPS, setSteps, visible, reducedMotion, autoPlay, 1100, 1400);
  const model = useMemo(() => boost(XS, YS, GB_MAX_STEPS, rate), [rate]);
  const mse = boostMse(model, XS, YS, steps);
  const residuals = XS.map((x, i) => YS[i] - predictBoost(model, x, steps));
  const under = residuals.filter((residual) => residual > 0).length;
  const over = residuals.length - under;

  const curve = Array.from({ length: 201 }, (_, i) => {
    const x = i / 20;
    return `${i === 0 ? 'M' : 'L'}${PLOT.sx(x).toFixed(1)},${PLOT.sy(predictBoost(model, x, steps)).toFixed(1)}`;
  }).join(' ');

  return (
    <OvaFrame
      title="Cada árbol corrige al anterior"
      hint="El modelo empieza prediciendo el promedio. Cada árbol pequeño aprende de los residuos y corrige una fracción del error anterior. Al colorearse, naranja indica que el modelo se quedó corto y azul que predijo de más; al reiniciar, los puntos vuelven a neutralizarse."
      controls={
        <div role="group" aria-label="Tasa de aprendizaje">
          <span>Tasa de aprendizaje: </span>
          {GB_RATES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={rate === r}
              onClick={() => {
                setRate(r);
                setSteps(0);
              }}
            >
              {r}
            </button>
          ))}
        </div>
      }
      readoutLive="off"
      readout={
        <>
          <span>Árboles sumados: <b>{steps}</b> de <b>{GB_MAX_STEPS}</b> · tasa: <b>{rate}</b></span>
          <span>Error cuadrático medio: <b>{mse.toFixed(2)}</b></span>
          <span>{steps === 0 ? 'Puntos neutrales · predicción base: el promedio' : <>Residuos: <b>{under}</b> predicciones cortas · <b>{over}</b> predicciones de más</>}</span>
        </>
      }
    >
      <div ref={stageRef}>
        <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} role="img" aria-label={`Gradient Boosting con ${steps} árboles, error cuadrático medio ${mse.toFixed(2)}`}>
          <text x={PLOT.sx(10)} y={PLOT.height - 8} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>x →</text>
          {steps > 0 && XS.map((x, i) => (
            <line
              className="mlx-gb-residual"
              key={`r${i}`}
              x1={PLOT.sx(x)}
              y1={PLOT.sy(YS[i])}
              x2={PLOT.sx(x)}
              y2={PLOT.sy(predictBoost(model, x, steps))}
              stroke={residuals[i] > 0 ? OVA_COLORS.class1 : OVA_COLORS.class0}
              strokeWidth={1.5}
            />
          ))}
          <path className="mlx-gb-curve" d={curve} fill="none" stroke={OVA_COLORS.accent} strokeWidth={2.5} />
          {XS.map((x, i) => (
            <circle
              className="mlx-gb-point"
              key={i}
              cx={PLOT.sx(x)}
              cy={PLOT.sy(YS[i])}
              r={5}
              fill={steps === 0 ? OVA_COLORS.axis : residuals[i] > 0 ? OVA_COLORS.class1 : OVA_COLORS.class0}
              stroke={steps === 0 ? '#d9d9e8' : '#040320'}
              strokeWidth={1.5}
            />
          ))}
        </svg>
      </div>
    </OvaFrame>
  );
}
