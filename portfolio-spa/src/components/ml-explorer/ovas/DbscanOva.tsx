import { useMemo, useRef, useState } from 'react';
import { DB_EPS, DB_MIN_PTS, DB_POINTS as POINTS, DB_START } from './datasets';
import { CLUSTER_COLORS, NOISE_COLOR, OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { dbscan, dist } from './ovaMath';
import { createPlot } from './plot';
import { useInViewport, usePrefersReducedMotion } from './useMotion';
import { useAutoLoop } from './useAutoLoop';

// Misma escala en x y en y (30 px por unidad): los círculos de radio ε son círculos.
const PLOT = createPlot(340, 280, 20, [0, 10], [0, 8]);
const UNIT = PLOT.sx(1) - PLOT.sx(0);

interface TraceFrame {
  revealed: boolean[];
  active: number[];
  cluster: number;
  message: string;
}

/** Capas de expansión de los núcleos conectados, respetando los grupos DBSCAN. */
function buildTrace(labels: number[], core: boolean[], eps: number, clusters: number): TraceFrame[] {
  const frames: TraceFrame[] = [];
  const revealed = POINTS.map(() => false);
  const visited = new Set<number>();

  for (let cluster = 0; cluster < clusters; cluster++) {
    const seeds = labels.map((label, i) => (label === cluster && core[i] ? i : -1)).filter((i) => i >= 0);
    const first = seeds[0];
    if (first === undefined) continue;
    let wave = [first];
    visited.add(first);

    while (wave.length > 0) {
      for (const active of wave) {
        // El núcleo activo alcanza sus vecinos y los puntos de borde cercanos.
        POINTS.forEach((point, i) => {
          if (labels[i] === cluster && dist(POINTS[active], point) <= eps + 1e-9) revealed[i] = true;
        });
      }
      frames.push({
        revealed: [...revealed],
        active: [...wave],
        cluster,
        message: `El grupo ${cluster + 1} se expande: los núcleos de esta frontera alcanzan sus vecinos dentro de ε.`,
      });

      const next = new Set<number>();
      for (const active of wave) {
        POINTS.forEach((point, i) => {
          if (labels[i] === cluster && core[i] && !visited.has(i) && dist(POINTS[active], point) <= eps + 1e-9) {
            visited.add(i);
            next.add(i);
          }
        });
      }
      wave = [...next];
    }
  }

  // DBSCAN solo llama ruido al final a los puntos que ninguna expansión alcanzó.
  const noise = labels.map((label, i) => (label < 0 ? i : -1)).filter((i) => i >= 0);
  if (noise.length > 0) {
    noise.forEach((i) => (revealed[i] = true));
    frames.push({
      revealed: [...revealed],
      active: [],
      cluster: -1,
      message: 'Los puntos grises quedan como ruido: no alcanzan ningún núcleo.',
    });
  }
  return frames;
}

export function DbscanOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [eps, setEps] = useState<number>(DB_START.eps);
  const [minPts, setMinPts] = useState<number>(DB_START.minPts);
  const [step, setStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  const result = useMemo(() => dbscan(POINTS, eps, minPts), [eps, minPts]);
  const frames = useMemo(() => buildTrace(result.labels, result.core, eps, result.clusters), [result, eps]);
  const last = frames.length;
  const shownStep = Math.min(step, last);
  const frame = shownStep > 0 ? frames[shownStep - 1] : undefined;
  const revealed = frame?.revealed ?? POINTS.map(() => false);
  const revealedCores = POINTS.filter((_, i) => revealed[i] && result.core[i]).length;
  const revealedNoise = POINTS.filter((_, i) => revealed[i] && result.labels[i] < 0).length;
  const revealedBorders = POINTS.filter((_, i) => revealed[i] && result.labels[i] >= 0 && !result.core[i]).length;
  const visibleClusters = new Set(result.labels.filter((label, i) => revealed[i] && label >= 0)).size;
  const isComplete = last > 0 && shownStep === last;
  useAutoLoop(step, last, setStep, visible, reducedMotion, autoPlay, 240, 5000);

  const reset = (nextEps = eps, nextMinPts = minPts) => {
    setEps(nextEps);
    setMinPts(nextMinPts);
    setStep(0);
  };

  return (
    <OvaFrame
      title="Grupos por densidad: ε y minPts"
      hint="Todos los puntos empiezan iguales. DBSCAN explora los núcleos (minPts vecinos dentro de ε), expande cada grupo por los núcleos conectados, suma los puntos de borde y deja en gris lo que no alcanza ningún núcleo. El círculo muestra ε alrededor de la frontera activa. El recorrido se repite automáticamente; cambia ε o minPts para ver cómo cambia el resultado. Con ε pequeño casi todo es ruido y con ε grande las dos lunas se funden."
      controls={
        <>
          <OvaSlider
            label="ε (radio del vecindario)"
            value={eps}
            min={DB_EPS.min}
            max={DB_EPS.max}
            step={DB_EPS.step}
            onChange={(v) => reset(v, minPts)}
            format={(v) => v.toFixed(1)}
          />
          <OvaSlider
            label="minPts (vecinos mínimos)"
            value={minPts}
            min={DB_MIN_PTS.min}
            max={DB_MIN_PTS.max}
            step={DB_MIN_PTS.step}
            onChange={(v) => reset(eps, v)}
          />
        </>
      }
      readoutLive="off"
      readout={
        <>
          <span>
            Identificados hasta ahora: <b>{revealedCores}</b> núcleos · <b>{revealedBorders}</b> puntos de borde ·{' '}
            <b>{revealedNoise}</b> de ruido
          </span>
          <span>
            Grupos alcanzados: <b>{visibleClusters}</b> · Paso <b>{shownStep}</b> de <b>{last}</b>
          </span>
          <span>
            {frame?.message ?? 'La exploración todavía no ha comenzado; los puntos siguen sin clasificar.'}
          </span>
          {isComplete && (
            <div className="dbscan-final-summary">
              <b>Resultado final</b>: {result.clusters} {result.clusters === 1 ? 'grupo' : 'grupos'} y {result.noise}{' '}
              {result.noise === 1 ? 'punto' : 'puntos'} de ruido.
            </div>
          )}
        </>
      }
    >
      <div ref={stageRef}>
        <svg
          viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
          role="img"
          aria-label={`DBSCAN: paso ${shownStep} de ${last}. ${frame?.message ?? 'La exploración todavía no ha comenzado.'} Identificados hasta ahora: ${revealedCores} núcleos, ${revealedBorders} puntos de borde, ${revealedNoise} de ruido y ${visibleClusters} grupos alcanzados.${isComplete ? ` Resultado final: ${result.clusters} grupos y ${result.noise} puntos de ruido.` : ''}`}
        >
          {frame?.active.map((i) => (
            <circle
              key={`eps-${i}`}
              cx={PLOT.sx(POINTS[i].x)}
              cy={PLOT.sy(POINTS[i].y)}
              r={eps * UNIT}
              fill={CLUSTER_COLORS[frame.cluster % CLUSTER_COLORS.length]}
              fillOpacity={0.06}
              stroke={CLUSTER_COLORS[frame.cluster % CLUSTER_COLORS.length]}
              strokeOpacity={0.24}
            />
          ))}
          {POINTS.map((p, i) => {
            const pointRevealed = revealed[i];
            const noise = pointRevealed && result.labels[i] < 0;
            const core = pointRevealed && result.core[i];
            const color = noise
              ? NOISE_COLOR
              : pointRevealed
                ? CLUSTER_COLORS[result.labels[i] % CLUSTER_COLORS.length]
                : OVA_COLORS.axis;
            const active = frame?.active.includes(i) ?? false;
            return (
              <circle
                key={i}
                className={result.labels[i] < 0 ? 'is-noise' : result.core[i] ? 'is-core' : 'is-border'}
                cx={PLOT.sx(p.x)}
                cy={PLOT.sy(p.y)}
                r={active ? 6.5 : core ? 5.5 : 4.5}
                fill={pointRevealed && core ? color : pointRevealed && noise ? 'none' : pointRevealed ? 'none' : OVA_COLORS.axis}
                stroke={active ? '#ffffff' : noise ? NOISE_COLOR : pointRevealed ? color : '#040320'}
                strokeWidth={active || core ? 1.5 : 2}
                strokeDasharray={noise ? '2 2' : undefined}
              />
            );
          })}
        </svg>
      </div>
    </OvaFrame>
  );
}
