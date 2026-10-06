import { useId, useRef, useState } from 'react';
import { PCA_POINTS as POINTS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
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
const PCA_STEPS = 8;

export function PcaOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [angle, setAngle] = useState(0);
  const [step, setStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  useAutoLoop(step, PCA_STEPS, setStep, visible, reducedMotion, autoPlay, 800, 1300);
  // La secuencia recorre desde el eje horizontal hasta el eje elegido. El paso
  // cero deja los datos neutrales para separar la referencia de la proyección.
  const progress = step === 0 ? 0 : (step - 1) / (PCA_STEPS - 1);
  const currentAngle = angle * progress;
  const share = capturedShare(COV, currentAngle);
  const t = (currentAngle * Math.PI) / 180;
  const far = 12;
  const m = COV.mean;

  /** El eje es más largo que el gráfico: se recorta al área de datos para que no invada los márgenes. */
  const clipId = useId();

  return (
    <OvaFrame
      title="Gira el eje y mira cuánto captura"
      hint="Los datos no tienen clases: sus colores solo separan las posiciones a cada lado de la media sobre el primer componente. El ciclo gira el eje desde la referencia horizontal hasta el ángulo elegido y revela las proyecciones; PCA elige el eje que conserva más varianza. Las líneas rosas muestran la distancia que se pierde al reducir a una dimensión."
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
            : `Proyección PCA sobre un eje a ${currentAngle.toFixed(0)} grados; conserva ${pct(share)} de la varianza`
        }
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={PLOT.pad} y={PLOT.pad} width={PLOT.width - 2 * PLOT.pad} height={PLOT.height - 2 * PLOT.pad} />
          </clipPath>
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
          const component = (p.x - m.x) * Math.cos(t) + (p.y - m.y) * Math.sin(t);
          return (
            <g key={i}>
              {step > 0 && (
                <line
                  className="mlx-pca-residual"
                  x1={PLOT.sx(p.x)}
                  y1={PLOT.sy(p.y)}
                  x2={PLOT.sx(q.x)}
                  y2={PLOT.sy(q.y)}
                  stroke={OVA_COLORS.risk}
                  strokeWidth={1.2}
                />
              )}
              {step > 0 && <circle className="mlx-pca-proj" cx={PLOT.sx(q.x)} cy={PLOT.sy(q.y)} r={3} fill={OVA_COLORS.accent} />}
              <circle
                className="mlx-pca-point"
                cx={PLOT.sx(p.x)}
                cy={PLOT.sy(p.y)}
                r={6}
                fill={step === 0 ? OVA_COLORS.axis : component < 0 ? OVA_COLORS.class0 : OVA_COLORS.class1}
                stroke="#040320"
                strokeWidth={1.5}
              />
            </g>
          );
        })}
      </svg>
      </div>
    </OvaFrame>
  );
}
