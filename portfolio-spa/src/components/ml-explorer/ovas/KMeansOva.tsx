import { useMemo, useRef, useState } from 'react';
import { KM_MAX_K, KM_POINTS as POINTS, KM_START_K, KM_STARTS } from './datasets';
import { CLUSTER_COLORS, OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { kmeansRun, mulberry32, randomInit, silhouette } from './ovaMath';
import { createPlot } from './plot';
import { useInViewport, usePrefersReducedMotion } from './useMotion';
import { useAutoLoop } from './useAutoLoop';

const PLOT = createPlot(320, 320, 24, [0, 10], [0, 10]);
export const KM_STEP_MS = 900;

export function KMeansOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [k, setK] = useState(KM_START_K);
  const [start, setStart] = useState(0);
  const [step, setStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();

  const run = useMemo(() => kmeansRun(POINTS, randomInit(POINTS, k, mulberry32(KM_STARTS[start].seed))), [k, start]);
  const last = run.length - 1;
  const shownStep = Math.min(step, last);
  const state = run[shownStep];
  const done = shownStep >= last;

  useAutoLoop(step, last, setStep, visible, reducedMotion, autoPlay, KM_STEP_MS, 5000);

  const reset = (nextK = k, nextStart = start) => {
    setK(nextK);
    setStart(nextStart);
    setStep(0);
  };

  return (
    <OvaFrame
      title="Centroides que se mueven solos"
      hint="Los puntos empiezan del mismo color porque todavía no tienen grupo. K-Means asigna cada punto al centroide más cercano y luego mueve cada cruz al promedio de sus puntos; las asignaciones y los colores cambian en cada iteración. El recorrido vuelve a empezar automáticamente. Cambia K o el arranque para comparar resultados: con K = 3, el arranque B se atasca en una solución peor, con mucha más inercia."
      controls={
        <>
          <OvaSlider label="K (número de grupos)" value={k} min={1} max={KM_MAX_K} step={1} onChange={(v) => reset(v)} />
          <div role="group" aria-label="Arranque">
            <span>Arranque: </span>
            {KM_STARTS.map((s, i) => (
              <button key={s.id} type="button" aria-pressed={start === i} onClick={() => reset(k, i)}>
                {s.id}
              </button>
            ))}
          </div>
        </>
      }
      readoutLive="off"
      readout={
        <>
          <span>
            Iteración <b>{shownStep}</b> de <b>{last}</b>
          </span>
          <span>
            Inercia: <b>{state.inertia.toFixed(2)}</b>
          </span>
          {done && <span>Convergió: ningún punto cambió de grupo.</span>}
          {done && k > 1 && (
            <span>
              Silueta: <b>{silhouette(POINTS, state.labels).toFixed(2)}</b>
            </span>
          )}
        </>
      }
    >
      <div ref={stageRef}>
        <svg
          viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
          role="img"
          aria-label={`24 puntos: iteración ${shownStep} de ${last}${shownStep === 0 ? ', todos neutrales antes de asignar grupos' : `, agrupados en ${k} ${k === 1 ? 'grupo' : 'grupos'} según el centroide más cercano`}; los centroides se marcan con una cruz`}
        >
          {shownStep > 0 &&
            POINTS.map((p, i) => {
              const c = state.centroids[state.labels[i]];
              return (
                <line
                  key={`l${i}-${k}-${start}-${shownStep}`}
                  className="mlx-km-link"
                  x1={PLOT.sx(p.x)}
                  y1={PLOT.sy(p.y)}
                  x2={PLOT.sx(c.x)}
                  y2={PLOT.sy(c.y)}
                  stroke={CLUSTER_COLORS[state.labels[i]]}
                  strokeOpacity={0.3}
                />
              );
            })}
          {POINTS.map((p, i) => (
            <circle
              key={i}
              className="mlx-km-point"
              cx={PLOT.sx(p.x)}
              cy={PLOT.sy(p.y)}
              r={6}
              fill={shownStep === 0 ? OVA_COLORS.axis : CLUSTER_COLORS[state.labels[i]]}
              stroke="#040320"
              strokeWidth={1.5}
            />
          ))}
          {state.centroids.map((c, j) => (
            <g key={`c${j}`} className="mlx-km-centroid" style={{ transform: `translate(${PLOT.sx(c.x)}px, ${PLOT.sy(c.y)}px)` }}>
              <path d="M-8 -8 L8 8 M-8 8 L8 -8" stroke="#040320" strokeWidth={6} />
              <path d="M-8 -8 L8 8 M-8 8 L8 -8" stroke={CLUSTER_COLORS[j]} strokeWidth={3} />
            </g>
          ))}
          <text x={PLOT.sx(10)} y={PLOT.height - 6} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
            gasto →
          </text>
          <text x={PLOT.sx(0)} y={14} fontSize={11} fill={OVA_COLORS.axis}>
            ↑ visitas
          </text>
        </svg>
      </div>
    </OvaFrame>
  );
}
