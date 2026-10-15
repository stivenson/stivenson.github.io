import { useMemo, useRef, useState } from 'react';
import { GB_MAX_STEPS, GB_RATES, GB_XS as XS, GB_YS as YS } from './datasets';
import { OVA_COLORS, OvaFrame } from './OvaFrame';
import { boost, boostMse, predictBoost } from './ovaMath';
import { createPlot } from './plot';
import { useInViewport, usePrefersReducedMotion } from './useMotion';
import { useAutoLoop } from './useAutoLoop';

const PLOT = createPlot(440, 360, 42, [0, 10], [0, 8]);
const START_RATE = 0.3;
const TREE_CHECKPOINTS = [0, 1, 2, 5, 10, 20, 35, GB_MAX_STEPS];
const STAGE_LABELS = [
  'Predicción inicial · promedio',
  'Árbol 1 · primera corrección',
  '2 árboles · corrige errores grandes',
  '5 árboles · aparece la forma general',
  '10 árboles · curva más precisa',
  '20 árboles · afina detalles',
  '35 árboles · ajustes pequeños',
  '50 árboles · error mínimo',
];
const RATE_LABELS: Record<number, string> = { 0.1: 'Suave', 0.3: 'Equilibrada', 1: 'Agresiva' };

function decimal(value: number, digits = 2) {
  return value.toFixed(digits).replace('.', ',');
}

function shortDecimal(value: number) {
  return String(value).replace('.', ',');
}

function signed(value: number) {
  return `${value >= 0 ? '+' : '−'} ${decimal(Math.abs(value))}`;
}

export function GradientBoostingOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [stage, setStage] = useState(0);
  const [rate, setRate] = useState<number>(START_RATE);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  const last = TREE_CHECKPOINTS.length - 1;
  const playback = useAutoLoop(stage, last, setStage, visible, reducedMotion, autoPlay, 850, 5000);
  const steps = TREE_CHECKPOINTS[stage];
  const previousSteps = stage > 0 ? TREE_CHECKPOINTS[stage - 1] : 0;
  const model = useMemo(() => boost(XS, YS, GB_MAX_STEPS, rate), [rate]);
  const mse = boostMse(model, XS, YS, steps);
  const previousMse = boostMse(model, XS, YS, previousSteps);
  const improvement = stage === 0 || previousMse === 0 ? 0 : ((previousMse - mse) / previousMse) * 100;
  const predictions = XS.map((x) => predictBoost(model, x, steps));
  const previousPredictions = XS.map((x) => predictBoost(model, x, previousSteps));
  const residuals = XS.map((_, i) => YS[i] - predictions[i]);
  const previousResiduals = XS.map((_, i) => YS[i] - previousPredictions[i]);
  const under = residuals.filter((residual) => residual > 0).length;
  const over = residuals.length - under;
  const focusIndex = stage === 0
    ? null
    : previousResiduals.reduce((best, residual, index) => (
      Math.abs(residual) > Math.abs(previousResiduals[best]) ? index : best
    ), 0);
  const firstNewTree = stage === 0 ? null : model.stumps[previousSteps];
  const focusRawCorrection = focusIndex === null || !firstNewTree
    ? 0
    : XS[focusIndex] <= firstNewTree.threshold ? firstNewTree.left : firstNewTree.right;
  const focusContribution = rate * focusRawCorrection;
  const focusAfterFirstTree = focusIndex === null ? 0 : previousPredictions[focusIndex] + focusContribution;

  const buildCurve = (treeCount: number) => Array.from({ length: 201 }, (_, i) => {
    const x = i / 20;
    return `${i === 0 ? 'M' : 'L'}${PLOT.sx(x).toFixed(1)},${PLOT.sy(predictBoost(model, x, treeCount)).toFixed(1)}`;
  }).join(' ');
  const curve = buildCurve(steps);
  const previousCurve = buildCurve(previousSteps);

  return (
    <OvaFrame
      playback={playback}
      progressLabel={`${STAGE_LABELS[stage]} · etapa ${stage} de ${last}`}
      explanation={stage === 0
        ? 'El modelo empieza con una línea horizontal: predice el consumo promedio en todos los momentos del día.'
        : stage === last
          ? 'Las últimas correcciones son pequeñas. El error de entrenamiento es mínimo, pero seguir ajustando también puede memorizar ruido.'
          : `La línea discontinua es la predicción anterior. Los ${steps - previousSteps} árboles nuevos la acercan a los puntos y producen la curva verde.`}
      title="Cada árbol corrige al anterior"
      hint="Ejemplo de demanda eléctrica: cada punto es el consumo observado en un momento del día. La línea discontinua conserva la predicción anterior y la verde muestra el resultado después de sumar árboles. Las líneas verticales son residuos: naranja significa que el modelo predijo poco y azul que predijo demasiado. La tarjeta «Una corrección, con números» sigue el punto resaltado."
      controls={
        <div className="mlx-gb-rate-control" role="group" aria-label="Tasa de aprendizaje">
          <span>Tasa de aprendizaje</span>
          <div className="mlx-gb-rate-options">
            {GB_RATES.map((r) => (
              <button
                key={r}
                type="button"
                aria-label={`Tasa ${shortDecimal(r)}: ${RATE_LABELS[r]}`}
                aria-pressed={rate === r}
                onClick={() => {
                  setRate(r);
                  setStage(0);
                }}
              >
                <strong>{shortDecimal(r)}</strong>
                <small>{RATE_LABELS[r]}</small>
              </button>
            ))}
          </div>
        </div>
      }
      readoutLive="off"
      readout={
        <>
          <div className="mlx-gb-score" aria-label="Cambio del error cuadrático medio">
            {stage > 0 && (
              <div>
                <span>MSE anterior</span>
                <strong>{decimal(previousMse)}</strong>
              </div>
            )}
            <div className="is-current">
              <span>MSE actual</span>
              <strong>{decimal(mse)}</strong>
            </div>
            {stage > 0 && (
              <div className={improvement >= 0 ? 'is-improvement' : 'is-worse'}>
                <span>Este hito</span>
                <strong>{improvement >= 0 ? '−' : '+'}{decimal(Math.abs(improvement), 1)} %</strong>
              </div>
            )}
          </div>
          <span className="mlx-gb-residual-summary">
            {stage === 0
              ? 'Predicción base: el promedio de los 21 consumos.'
              : <>Errores restantes: <b>{under}</b> predicciones bajas · <b>{over}</b> altas.</>}
          </span>
          <div className="mlx-gb-checkpoint-explanation" aria-live="off">
            {stage === 0 || focusIndex === null ? (
              <>
                <b>1. Empezar por el promedio</b>
                <span>Todos los momentos reciben la misma predicción. La distancia vertical hasta cada punto es el error que aprenderá el primer árbol.</span>
              </>
            ) : (
              <>
                <b>Una corrección, con números</b>
                <span>Punto resaltado: consumo real <b>{decimal(YS[focusIndex])}</b>; predicción anterior <b>{decimal(previousPredictions[focusIndex])}</b>.</span>
                <span>Residuo: {decimal(YS[focusIndex])} − {decimal(previousPredictions[focusIndex])} = <b>{signed(previousResiduals[focusIndex])}</b>.</span>
                <span>Primer árbol del hito: {shortDecimal(rate)} × ({decimal(focusRawCorrection)}) = <b>{signed(focusContribution)}</b>.</span>
                <span>Nueva predicción: {decimal(previousPredictions[focusIndex])} {signed(focusContribution)} = <b>{decimal(focusAfterFirstTree)}</b>.</span>
              </>
            )}
          </div>
          {stage === last && (
            <div className="mlx-gb-overfit-note">
              <b>Ojo con el resultado final</b>
              <span>El MSE casi cero corresponde a estos datos de entrenamiento. En clientes o días nuevos puede empeorar si el bosque memoriza el ruido.</span>
            </div>
          )}
        </>
      }
    >
      <div className="mlx-gb-stage" ref={stageRef}>
        <div className="mlx-gb-inline-legend" role="group" aria-label="Leyenda del gráfico">
          <span><i className="is-orange" /> Predijo poco</span>
          <span><i className="is-blue" /> Predijo demasiado</span>
          <span><i className="is-dashed" /> Curva anterior</span>
          <span><i className="is-green" /> Curva nueva</span>
        </div>
        <svg className="mlx-gb-plot" viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} role="img" aria-label={`Demanda eléctrica estimada con ${steps} árboles; error cuadrático medio ${decimal(mse)}`}>
          <g className="mlx-gb-grid" aria-hidden="true">
            {[0, 2, 4, 6, 8].map((tick) => (
              <g key={tick}>
                <line x1={PLOT.sx(0)} y1={PLOT.sy(tick)} x2={PLOT.sx(10)} y2={PLOT.sy(tick)} />
                <text x={PLOT.sx(0) - 9} y={PLOT.sy(tick) + 4} textAnchor="end">{tick}</text>
              </g>
            ))}
          </g>
          <text className="mlx-gb-axis-label" x={PLOT.sx(10)} y={PLOT.height - 9} textAnchor="end">momento del día →</text>
          <text className="mlx-gb-axis-label" x={10} y={PLOT.sy(8) - 13}>↑ consumo eléctrico</text>
          {stage > 0 && <path className="mlx-gb-curve-previous" d={previousCurve} fill="none" />}
          {stage > 0 && focusIndex !== null && (
            <line
              className="mlx-gb-focus-before"
              x1={PLOT.sx(XS[focusIndex])}
              y1={PLOT.sy(YS[focusIndex])}
              x2={PLOT.sx(XS[focusIndex])}
              y2={PLOT.sy(previousPredictions[focusIndex])}
            />
          )}
          {stage > 0 && XS.map((x, i) => (
            <line
              className={`mlx-gb-residual${i === focusIndex ? ' is-focus' : ''}`}
              key={`r${i}`}
              x1={PLOT.sx(x)}
              y1={PLOT.sy(YS[i])}
              x2={PLOT.sx(x)}
              y2={PLOT.sy(predictions[i])}
              stroke={residuals[i] > 0 ? OVA_COLORS.class1 : OVA_COLORS.class0}
            />
          ))}
          <path className="mlx-gb-curve" d={curve} fill="none" stroke={OVA_COLORS.accent} />
          {XS.map((x, i) => (
            <circle
              className="mlx-gb-point"
              key={i}
              cx={PLOT.sx(x)}
              cy={PLOT.sy(YS[i])}
              r={5.5}
              fill={stage === 0 ? OVA_COLORS.axis : residuals[i] > 0 ? OVA_COLORS.class1 : OVA_COLORS.class0}
              stroke={stage === 0 ? '#d9d9e8' : '#040320'}
              strokeWidth={1.5}
            />
          ))}
          {focusIndex !== null && (
            <circle
              className="mlx-gb-focus-ring"
              cx={PLOT.sx(XS[focusIndex])}
              cy={PLOT.sy(YS[focusIndex])}
              r={10}
              fill="none"
            />
          )}
        </svg>
      </div>
    </OvaFrame>
  );
}
