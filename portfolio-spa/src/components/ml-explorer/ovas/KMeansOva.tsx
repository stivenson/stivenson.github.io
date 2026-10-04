import { useEffect, useMemo, useRef, useState } from 'react';
import { KM_MAX_K, KM_POINTS as POINTS, KM_START_K, KM_STARTS } from './datasets';
import { CLUSTER_COLORS, OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { kmeansRun, mulberry32, randomInit, silhouette } from './ovaMath';
import { createPlot } from './plot';
import { useInViewport, usePrefersReducedMotion } from './useMotion';

const PLOT = createPlot(320, 320, 24, [0, 10], [0, 10]);
/** Tiempo entre pasos al reproducir. */
export const KM_STEP_MS = 900;

export function KMeansOva() {
  const [k, setK] = useState(KM_START_K);
  const [start, setStart] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();

  const run = useMemo(() => kmeansRun(POINTS, randomInit(POINTS, k, mulberry32(KM_STARTS[start].seed))), [k, start]);
  const last = run.length - 1;
  const state = run[Math.min(step, last)];
  const done = step >= last;

  // Avanza un paso cada KM_STEP_MS, solo mientras la OVA está en pantalla.
  useEffect(() => {
    if (!playing || !visible) return;
    if (done) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setStep((s) => s + 1), KM_STEP_MS);
    return () => window.clearTimeout(id);
  }, [playing, visible, done, step]);

  const reset = (nextK = k, nextStart = start) => {
    setK(nextK);
    setStart(nextStart);
    setStep(0);
    setPlaying(false);
  };

  const togglePlay = () => {
    if (playing) return setPlaying(false);
    // Con «reducir movimiento», nada de animación: salta al resultado final.
    if (reducedMotion) return setStep(last);
    if (done) setStep(0);
    setPlaying(true);
  };

  return (
    <OvaFrame
      title="Centroides que se mueven solos"
      hint="Los puntos no traen etiqueta: K-Means los reparte en K grupos. Cada paso hace dos cosas: asigna cada punto al centroide (la cruz) más cercano y mueve cada centroide al promedio de sus puntos. Pulsa «Paso» o «Reproducir» hasta que ningún punto cambie de grupo. Luego prueba el arranque B con K = 3: los centroides empiezan en otros puntos y el algoritmo se atasca en una solución peor (inercia mucho más alta). Por eso conviene repetir el arranque varias veces (n_init en scikit-learn) y quedarse con el de menor inercia."
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
          <div role="group" aria-label="Iteraciones">
            <button type="button" disabled={done} onClick={() => setStep((s) => s + 1)}>
              Paso ▸
            </button>
            <button type="button" aria-pressed={playing} onClick={togglePlay}>
              {playing ? '⏸ Pausar' : '▶ Reproducir'}
            </button>
            <button type="button" onClick={() => reset(KM_START_K, 0)}>
              Restablecer
            </button>
          </div>
        </>
      }
      readoutLive={playing ? 'off' : 'polite'}
      readout={
        <>
          <span>
            Paso <b>{Math.min(step, last)}</b> de <b>{last}</b>
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
          aria-label={`24 puntos sin etiqueta repartidos en ${k} ${k === 1 ? 'grupo' : 'grupos'}, coloreados según el centroide más cercano; los centroides van marcados con una cruz`}
        >
          {POINTS.map((p, i) => {
            const c = state.centroids[state.labels[i]];
            return (
              <line
                key={`l${i}-${k}-${start}-${step}`}
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
              cx={PLOT.sx(p.x)}
              cy={PLOT.sy(p.y)}
              r={6}
              fill={CLUSTER_COLORS[state.labels[i]]}
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
