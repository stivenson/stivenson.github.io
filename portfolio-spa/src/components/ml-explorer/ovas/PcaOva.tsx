import { useId, useRef, useState } from 'react';
import { PCA_POINTS as POINTS } from './datasets';
import { NOISE_COLOR, OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { capturedShare, covariance2, principalAngle, projectOnAxis } from './ovaMath';
import { createPlot } from './plot';
import { useInViewport, usePrefersReducedMotion } from './useMotion';
import { useAutoLoop } from './useAutoLoop';

// Misma escala en x y en y: si no, los ángulos se verían deformados.
const PLOT = createPlot(320, 320, 20, [-1, 9], [0, 10]);
const COV = covariance2(POINTS);
/** Ángulo del primer componente principal, redondeado al paso del slider. */
export const PCA_BEST_ANGLE = Math.round(principalAngle(COV));
const pct = (v: number) => `${(v * 100).toFixed(1)} %`;
// Primero gira el eje; después cada residuo se dibuja en su propio paso.
const PCA_ROTATION_STEPS = 16;
const PCA_LAST_STEP = PCA_ROTATION_STEPS + POINTS.length;
const PCA_MID_COLOR = '#d9d9e8';

function mixHex(start: string, end: string, amount: number) {
  const ratio = Math.max(0, Math.min(1, amount));
  const channels = [16, 8, 0].map((shift) => {
    const from = (Number.parseInt(start.slice(1), 16) >> shift) & 255;
    const to = (Number.parseInt(end.slice(1), 16) >> shift) & 255;
    return Math.round(from + (to - from) * ratio).toString(16).padStart(2, '0');
  });
  return `#${channels.join('')}`;
}

export function PcaOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [angle, setAngle] = useState(0);
  const [step, setStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  useAutoLoop(step, PCA_LAST_STEP, setStep, visible, reducedMotion, autoPlay, 145, 5000);
  // La secuencia recorre desde el eje horizontal hasta el eje elegido. El paso
  // cero deja los datos neutrales para separar la referencia de la proyección.
  const progress = step === 0 ? 0 : Math.min(1, (step - 1) / (PCA_ROTATION_STEPS - 1));
  const currentAngle = angle * progress;
  const drawnCount = Math.max(0, Math.min(POINTS.length, step - PCA_ROTATION_STEPS));
  const share = capturedShare(COV, currentAngle);
  const t = (currentAngle * Math.PI) / 180;
  const far = 12;
  const m = COV.mean;
  const componentValues = POINTS.map((p) => (p.x - m.x) * Math.cos(t) + (p.y - m.y) * Math.sin(t));
  const maxAbsComponent = Math.max(...componentValues.map(Math.abs), 1e-9);
  const componentColor = (value: number) => value < 0
    ? mixHex(OVA_COLORS.class0, PCA_MID_COLOR, 1 - Math.abs(value) / maxAbsComponent)
    : mixHex(PCA_MID_COLOR, OVA_COLORS.class1, value / maxAbsComponent);

  /** El eje es más largo que el gráfico: se recorta al área de datos para que no invada los márgenes. */
  const clipId = useId();
  const scaleId = `${clipId}-component-scale`;

  return (
    <OvaFrame
      title="Gira el eje y mira cuánto captura"
      hint="PCA reduce dimensiones; no crea grupos ni clases. Los datos originales permanecen grises y el color de cada proyección indica su posición continua sobre el componente principal: azul hacia el extremo negativo, claro cerca de la media y naranja hacia el positivo. El ciclo gira el eje y luego dibuja una a una las distancias perpendiculares que se pierden al proyectar."
      controls={
        <>
          <OvaSlider
            label="Ángulo objetivo"
            value={angle}
            min={0}
            max={179}
            step={1}
            onChange={(value) => {
              setAngle(value);
              setStep(0);
            }}
            format={(v) => `${v}°`}
          />
          <button
            type="button"
            onClick={() => {
              setAngle(PCA_BEST_ANGLE);
              setStep(0);
            }}
          >
            Ir al eje de máxima varianza
          </button>
        </>
      }
      readout={
        <>
          <span>
            {step === 0 ? (
              'Datos originales: aún sin proyectar.'
            ) : (
              <>
                Eje a <b>{currentAngle.toFixed(0)}°</b>: captura <b>{pct(share)}</b> de la varianza
              </>
            )}
          </span>
          <span>
            {step === 0 ? 'La animación muestra cómo cambia la representación.' : <>Se pierde: <b>{pct(1 - share)}</b></>}
          </span>
          {step >= PCA_ROTATION_STEPS && <span>Distancias trazadas: <b>{drawnCount}</b> de <b>{POINTS.length}</b></span>}
        </>
      }
    >
      <div ref={stageRef}>
      <svg
        viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
        role="img"
        aria-label={
          step === 0
            ? 'Datos originales antes de proyectarlos'
            : `Proyección PCA sobre un eje a ${currentAngle.toFixed(0)} grados; conserva ${pct(share)} de la varianza. Los colores indican valores continuos del componente, no grupos. ${drawnCount} de ${POINTS.length} distancias trazadas.`
        }
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={PLOT.pad} y={PLOT.pad} width={PLOT.width - 2 * PLOT.pad} height={PLOT.height - 2 * PLOT.pad} />
          </clipPath>
          <linearGradient id={scaleId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={OVA_COLORS.class0} />
            <stop offset="50%" stopColor={PCA_MID_COLOR} />
            <stop offset="100%" stopColor={OVA_COLORS.class1} />
          </linearGradient>
        </defs>
        <line
          className="mlx-pca-axis"
          clipPath={`url(#${clipId})`}
          x1={PLOT.sx(m.x - far * Math.cos(t))}
          y1={PLOT.sy(m.y - far * Math.sin(t))}
          x2={PLOT.sx(m.x + far * Math.cos(t))}
          y2={PLOT.sy(m.y + far * Math.sin(t))}
          stroke={OVA_COLORS.accent}
          strokeWidth={2.5}
          opacity={step === 0 ? 0.3 : 1}
        />
        {POINTS.map((p, i) => {
          const q = projectOnAxis(p, m, currentAngle);
          const component = componentValues[i];
          const residualLength = Math.hypot(PLOT.sx(q.x) - PLOT.sx(p.x), PLOT.sy(q.y) - PLOT.sy(p.y));
          const projected = i < drawnCount;
          return (
            <g key={i}>
              {step >= PCA_ROTATION_STEPS && (
                <line
                  className="mlx-pca-residual"
                  x1={PLOT.sx(p.x)}
                  y1={PLOT.sy(p.y)}
                  x2={PLOT.sx(q.x)}
                  y2={PLOT.sy(q.y)}
                  stroke={OVA_COLORS.risk}
                  strokeWidth={1.6}
                  strokeDasharray={residualLength}
                  strokeDashoffset={projected ? 0 : residualLength}
                  opacity={projected ? 1 : 0}
                />
              )}
              {step >= PCA_ROTATION_STEPS && <circle className="mlx-pca-proj" cx={PLOT.sx(q.x)} cy={PLOT.sy(q.y)} r={4} fill={componentColor(component)} opacity={projected ? 1 : 0} />}
              <circle
                className="mlx-pca-point"
                cx={PLOT.sx(p.x)}
                cy={PLOT.sy(p.y)}
                r={6}
                fill={NOISE_COLOR}
                stroke="#040320"
                strokeWidth={1.5}
              />
            </g>
          );
        })}
        <g role="group" aria-label="Color continuo del componente principal: negativo, media y positivo">
          <rect x={94} y={299} width={132} height={6} rx={3} fill={`url(#${scaleId})`} />
          <text x={94} y={317} textAnchor="start" fontSize={9} fill={OVA_COLORS.axis}>negativo</text>
          <text x={160} y={317} textAnchor="middle" fontSize={9} fill={OVA_COLORS.axis}>media</text>
          <text x={226} y={317} textAnchor="end" fontSize={9} fill={OVA_COLORS.axis}>positivo</text>
        </g>
      </svg>
      </div>
    </OvaFrame>
  );
}
