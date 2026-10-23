import { G } from '../Gloss';
import { useMemo, useRef, useState } from 'react';
import { DB_EPS, DB_MIN_PTS, DB_POINTS as POINTS, DB_START } from './datasets';
import { CLUSTER_COLORS, NOISE_COLOR, OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { dbscan, dbscanDistance, type DbscanMetric } from './ovaMath';
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
function buildTrace(labels: number[], core: boolean[], eps: number, clusters: number, metric: DbscanMetric): TraceFrame[] {
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
          if (labels[i] === cluster && dbscanDistance(POINTS[active], point, metric) <= eps + 1e-9) revealed[i] = true;
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
          if (labels[i] === cluster && core[i] && !visited.has(i) && dbscanDistance(POINTS[active], point, metric) <= eps + 1e-9) {
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
  const [metric, setMetric] = useState<DbscanMetric>('euclidean');
  const [showFinal, setShowFinal] = useState(false);
  const [observed, setObserved] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  const result = useMemo(() => dbscan(POINTS, eps, minPts, metric), [eps, minPts, metric]);
  const frames = useMemo(() => buildTrace(result.labels, result.core, eps, result.clusters, metric), [result, eps, metric]);
  const last = frames.length;
  const shownStep = showFinal ? last : Math.min(step, last);
  const frame = shownStep > 0 ? frames[shownStep - 1] : undefined;
  const revealed = frame?.revealed ?? POINTS.map(() => false);
  const revealedCores = POINTS.filter((_, i) => revealed[i] && result.core[i]).length;
  const revealedNoise = POINTS.filter((_, i) => revealed[i] && result.labels[i] < 0).length;
  const revealedBorders = POINTS.filter((_, i) => revealed[i] && result.labels[i] >= 0 && !result.core[i]).length;
  const visibleClusters = new Set(result.labels.filter((label, i) => revealed[i] && label >= 0)).size;
  const isComplete = last > 0 && shownStep === last;
  const playback = useAutoLoop(step, last, setStep, visible && !showFinal, reducedMotion, autoPlay && !showFinal, 240, 5000);

  const reset = (nextEps = eps, nextMinPts = minPts) => {
    setEps(nextEps);
    setMinPts(nextMinPts);
    setStep(0);
  };

  const neighborCount = POINTS.filter(p => dbscanDistance(POINTS[observed], p, metric) <= eps + 1e-9).length;
  const observedType = result.core[observed] ? 'núcleo' : result.labels[observed] < 0 ? 'ruido' : 'borde';
  const outline = (i: number) => `${PLOT.sx(POINTS[i].x)},${PLOT.sy(POINTS[i].y) - eps * UNIT} ${PLOT.sx(POINTS[i].x) + eps * UNIT},${PLOT.sy(POINTS[i].y)} ${PLOT.sx(POINTS[i].x)},${PLOT.sy(POINTS[i].y) + eps * UNIT} ${PLOT.sx(POINTS[i].x) - eps * UNIT},${PLOT.sy(POINTS[i].y)}`;
  return (
    <OvaFrame
      playback={showFinal ? undefined : playback}
      explanation={shownStep === 0 ? 'Buscamos puntos con suficientes vecinos dentro del radio ε. El mínimo cuenta también al propio punto.' : isComplete ? 'Los grupos están completos. El gris indica puntos que no pertenecen a ningún grupo; cambia el radio para comparar el resultado.' : frame?.message}
      title="Grupos por densidad: ε y minPts"
      hint="DBSCAN enlaza núcleos con suficientes vecinos y añade sus bordes; el resto queda como ruido. El mínimo incluye al propio punto. Los contornos son círculos con distancia euclidiana y rombos con Manhattan. Activa el resultado final para comparar ajustes y examinar un punto con el contorno blanco. El recorrido muestra expansión, no iteraciones para aprender centroides."
      controls={
        <>
          <div className="mlx-parameter-set" role="group" aria-label="Hiperparámetros de DBSCAN">
            <strong>Ajustes de densidad</strong>
            <div className="mlx-parameter-fields">
              <div className="mlx-parameter-field">
                <OvaSlider label="Radio (eps, ε)" value={eps} min={DB_EPS.min} max={DB_EPS.max} step={DB_EPS.step} onChange={v => reset(v, minPts)} format={v => v.toFixed(1)} />
                <p><G k="epsilon">eps</G> es la distancia máxima entre vecinos. El grupo completo puede ser mucho más largo por encadenamiento.</p>
              </div>
              <div className="mlx-parameter-field">
                <OvaSlider label="Mínimo local (min_samples, minPts)" value={minPts} min={DB_MIN_PTS.min} max={DB_MIN_PTS.max} step={DB_MIN_PTS.step} onChange={v => reset(eps, v)} />
                <p><G k="minPts">min_samples</G> cuenta al propio punto. Con {minPts} se necesita el propio punto y al menos {minPts-1} {minPts === 2 ? 'vecino adicional' : 'vecinos adicionales'} dentro de eps para ser núcleo.</p>
              </div>
              <div className="mlx-parameter-field mlx-parameter-field--wide">
                <label>Distancia (metric)<select aria-label="Distancia (metric)" value={metric} onChange={e => { setMetric(e.target.value as DbscanMetric); setStep(0); }}>
                  <option value="euclidean">Euclidiana: línea recta</option><option value="manhattan">Manhattan: suma por ejes</option>
                </select></label>
                <p>La <G k="dbMetrica">métrica</G> cambia quién entra al vecindario, incluso con el mismo eps. Aquí los ejes usan coordenadas sintéticas; no son metros.</p>
              </div>
            </div>
            <output aria-label="Configuración elegida">eps={eps.toFixed(1)} · min_samples={minPts} · metric={metric} · pesos iguales</output>
          </div>
          <label><input type="checkbox" checked={showFinal} onChange={e => { setShowFinal(e.target.checked); playback.restart(); }} /> Mostrar resultado final</label>
          <button type="button" onClick={() => { reset(DB_START.eps, DB_START.minPts); setMetric('euclidean'); setObserved(0); setShowFinal(false); playback.restart(); }}>Restablecer ajustes</button>
          <p>El recorrido y la velocidad son <G k="controlDidactico">controles de visualización</G>. DBSCAN no pide K, n_init ni una cantidad de iteraciones de entrenamiento.</p>
          <details className="mlx-parameter-notes mlx-db-notes"><summary>Examinar un punto del resultado final</summary>
            <label>Punto observado<select aria-label="Punto observado" value={observed} onChange={e => setObserved(Number(e.target.value))}>
              {POINTS.map((_, i) => <option key={i} value={i}>Punto {i+1}</option>)}
            </select></label>
            <p>Punto {observed+1}: ({POINTS[observed].x}, {POINTS[observed].y}). Tiene <b>{neighborCount} {neighborCount === 1 ? 'vecino' : 'vecinos'} contando al propio punto</b>; el mínimo es {minPts}. En el resultado final es <b>{observedType}</b>.</p>
            <p>{observedType === 'núcleo' ? 'Alcanza el mínimo local y puede expandir un grupo.' : observedType === 'borde' ? 'No alcanza el mínimo, pero está cerca de un núcleo y pertenece a su grupo.' : 'No es núcleo ni está en el vecindario de ningún núcleo. Ruido no significa error ni anomalía confirmada.'}</p>
            <p>Activa «Mostrar resultado final» para ver su contorno blanco y la cruz. Elegir este punto cambia la inspección, no el agrupamiento.</p>
          </details>
          <details className="mlx-parameter-notes mlx-db-notes"><summary>Escalas, búsqueda y puntos de borde compartidos</summary>
            <p>59 puntos fijos, pesos iguales y búsqueda exhaustiva. Se comparan distancias con eps y un margen numérico de 1e-9. No se aprende escalado aquí; cambiar las unidades exige revisar eps.</p>
            <p><G k="dbBusqueda">algorithm y leaf_size</G> organizan la búsqueda de vecinos en Python. No definen la densidad. Los núcleos fijan los grupos; un borde vecino de dos grupos se asigna al primero que lo alcanza, según el orden de los puntos.</p>
            <p>La OVA usa distancias en el plano. El ejercicio geográfico usa haversine con latitud, longitud y eps en radianes.</p>
          </details>
        </>
      }
      readoutLive={playback.playing && !showFinal ? 'off' : 'polite'}
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
          {showFinal && <span>Contorno blanco: punto {observed+1} · {neighborCount} {neighborCount === 1 ? 'vecino' : 'vecinos'} incluido él mismo · {observedType}.</span>}
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
          {!showFinal && frame?.active.map((i) => metric === 'manhattan' ? (
            <polygon key={`eps-${i}`} points={outline(i)} fill={CLUSTER_COLORS[frame.cluster % CLUSTER_COLORS.length]} fillOpacity={0.06} stroke={CLUSTER_COLORS[frame.cluster % CLUSTER_COLORS.length]} strokeOpacity={0.24} />
          ) : (
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
          {showFinal && <g className="mlx-db-observed" aria-hidden="true">
            {metric === 'euclidean'
              ? <circle className="mlx-db-neighborhood" cx={PLOT.sx(POINTS[observed].x)} cy={PLOT.sy(POINTS[observed].y)} r={eps*UNIT} fill="none" stroke="#fff" strokeDasharray="4 3" />
              : <polygon className="mlx-db-neighborhood" points={outline(observed)} fill="none" stroke="#fff" strokeDasharray="4 3" />}
          </g>}
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
          {showFinal && <path aria-hidden="true" d={`M${PLOT.sx(POINTS[observed].x)-3} ${PLOT.sy(POINTS[observed].y)}h6 M${PLOT.sx(POINTS[observed].x)} ${PLOT.sy(POINTS[observed].y)-3}v6`} stroke="#fff" strokeWidth={1.5} />}
        </svg>
      </div>
    </OvaFrame>
  );
}
