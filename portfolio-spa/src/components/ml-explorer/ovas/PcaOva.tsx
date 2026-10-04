import { useId, useState } from 'react';
import { PCA_POINTS as POINTS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { capturedShare, covariance2, principalAngle, projectOnAxis } from './ovaMath';
import { createPlot } from './plot';

// Misma escala en x y en y: si no, los ángulos se verían deformados.
const PLOT = createPlot(320, 320, 20, [-1, 9], [0, 10]);
const COV = covariance2(POINTS);
/** Ángulo del primer componente principal, redondeado al paso del slider. */
export const PCA_BEST_ANGLE = Math.round(principalAngle(COV));
const pct = (v: number) => `${(v * 100).toFixed(1)} %`;

export function PcaOva() {
  const [angle, setAngle] = useState(0);
  const share = capturedShare(COV, angle);
  const t = (angle * Math.PI) / 180;
  const far = 12;
  const m = COV.mean;

  /** El eje es más largo que el gráfico: se recorta al área de datos para que no invada los márgenes. */
  const clipId = useId();

  return (
    <OvaFrame
      title="Gira el eje y mira cuánto captura"
      hint="Cada punto se proyecta sobre el eje (las líneas rosas). PCA busca el ángulo en el que los puntos proyectados quedan más esparcidos, es decir, con más varianza: así una sola columna conserva casi toda la variación de las dos. Gira el eje hasta el máximo; las líneas rosas son lo que se pierde. El eje perpendicular al mejor es el segundo componente: captura solo lo que falta."
      controls={
        <>
          <OvaSlider label="Ángulo del eje" value={angle} min={0} max={179} step={1} onChange={setAngle} format={(v) => `${v}°`} />
          <button type="button" onClick={() => setAngle(PCA_BEST_ANGLE)}>
            Ir al eje de máxima varianza
          </button>
          <button type="button" onClick={() => setAngle(0)}>
            Restablecer
          </button>
        </>
      }
      readout={
        <>
          <span>
            Eje a <b>{angle}°</b>: captura <b>{pct(share)}</b> de la varianza
          </span>
          <span>
            Se pierde: <b>{pct(1 - share)}</b>
          </span>
        </>
      }
    >
      <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} role="img" aria-label="Puntos, el eje que se gira y la proyección de cada punto sobre él">
        <defs>
          <clipPath id={clipId}>
            <rect x={PLOT.pad} y={PLOT.pad} width={PLOT.width - 2 * PLOT.pad} height={PLOT.height - 2 * PLOT.pad} />
          </clipPath>
        </defs>
        <line
          clipPath={`url(#${clipId})`}
          x1={PLOT.sx(m.x - far * Math.cos(t))}
          y1={PLOT.sy(m.y - far * Math.sin(t))}
          x2={PLOT.sx(m.x + far * Math.cos(t))}
          y2={PLOT.sy(m.y + far * Math.sin(t))}
          stroke={OVA_COLORS.accent}
          strokeWidth={2.5}
        />
        {POINTS.map((p, i) => {
          const q = projectOnAxis(p, m, angle);
          return (
            <g key={i}>
              <line x1={PLOT.sx(p.x)} y1={PLOT.sy(p.y)} x2={PLOT.sx(q.x)} y2={PLOT.sy(q.y)} stroke={OVA_COLORS.risk} strokeWidth={1.2} />
              <circle className="mlx-pca-proj" cx={PLOT.sx(q.x)} cy={PLOT.sy(q.y)} r={3} fill={OVA_COLORS.accent} />
              <circle cx={PLOT.sx(p.x)} cy={PLOT.sy(p.y)} r={6} fill={OVA_COLORS.class0} stroke="#040320" strokeWidth={1.5} />
            </g>
          );
        })}
      </svg>
    </OvaFrame>
  );
}
