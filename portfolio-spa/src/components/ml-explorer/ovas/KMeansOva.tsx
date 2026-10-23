import { G } from '../Gloss';
import { kmeansExperiment } from './kmeansSettings';
import { useMemo, useRef, useState } from 'react';
import { KM_MAX_K, KM_POINTS as POINTS, KM_START_K, KM_STARTS } from './datasets';
import { CLUSTER_COLORS, OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { silhouette } from './ovaMath';
import { createPlot } from './plot';
import { useInViewport, usePrefersReducedMotion } from './useMotion';
import { useAutoLoop } from './useAutoLoop';

const PLOT = createPlot(320, 320, 24, [0, 10], [0, 10]);
export const KM_STEP_MS = 900;

export function KMeansOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [k, setK] = useState(KM_START_K);
  const [start, setStart] = useState(0);
  const [step, setStep] = useState(0);
  const [init, setInit] = useState<'random' | 'k-means++'>('random');
  const [nInit, setNInit] = useState(1);
  const [maxIter, setMaxIter] = useState(20);
  const [tol, setTol] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();

  const experiment = useMemo(() => kmeansExperiment(POINTS, k, KM_STARTS[start].seed, init, nInit, maxIter, tol), [k, start, init, nInit, maxIter, tol]);
  const run = experiment.run;
  const last = run.length - 1;
  const shownStep = showFinal ? last : Math.min(step, last);
  const state = run[shownStep];
  const done = shownStep >= last;

  const playback = useAutoLoop(step, last, setStep, visible && !showFinal, reducedMotion, autoPlay && !showFinal, KM_STEP_MS, 5000);

  const reset = (nextK = k, nextStart = start) => {
    setK(nextK);
    setStart(nextStart);
    setStep(0);
  };

  return (
    <OvaFrame
      playback={showFinal ? undefined : playback}
      progressLabel={`Iteración ${shownStep} de ${last} · arranque ${experiment.selected + 1} de ${nInit}`}
      explanation={shownStep === 0 ? 'Las cruces son los centros iniciales. Los puntos aún se muestran sin grupo.' : done ? `Terminó por ${state.stopReason === 'stable' ? 'asignaciones estables' : state.stopReason === 'tolerance' ? 'tolerancia de movimiento' : 'límite de iteraciones'}. La inercia no demuestra utilidad de los grupos.` : 'Cada punto se asigna al centro más cercano y cada centro se mueve al promedio de su grupo. Mira qué puntos cambian de color.'}
      title="Centroides que se mueven solos"
      hint="Los puntos empiezan del mismo color porque todavía no tienen grupo. K-Means asigna cada punto al centroide más cercano y luego mueve cada cruz al promedio de sus puntos; las asignaciones y los colores cambian en cada iteración. Activa «Repetir» si quieres volver a recorrer los pasos. Cambia K o el arranque para comparar resultados: con K = 3, inicio aleatorio, n_init=1 y tol=0, el arranque B se atasca en una solución peor, con mucha más inercia."
      controls={
        <>
          <div className="mlx-parameter-set" role="group" aria-label="Hiperparámetros de K-Means">
            <strong>Ajustes del agrupamiento</strong>
            <div className="mlx-parameter-fields">
              <div className="mlx-parameter-field">
                <OvaSlider label="Grupos (n_clusters)" value={k} min={1} max={KM_MAX_K} step={1} onChange={(v) => reset(v)} />
                <p><G k="kmGrupos">K</G> indica cuántos centros se buscan. Aumentarlo puede dividir grupos que ya eran útiles.</p>
              </div>
              <div className="mlx-parameter-field">
                <label>Inicio (init)<select aria-label="Inicio (init)" value={init} onChange={e => { setInit(e.target.value as typeof init); setStep(0); }}>
                  <option value="random">Aleatorio: puntos sorteados</option><option value="k-means++">k-means++: muestreo D²</option>
                </select></label>
                <p>La <G k="kmInicio">inicialización</G> elige las primeras cruces; no son los centros aprendidos.</p>
              </div>
              <div className="mlx-parameter-field">
                <OvaSlider label="Arranques (n_init)" value={nInit} min={1} max={10} step={1} onChange={v => { setNInit(v); setStep(0); }} />
                <p>Los <G k="kmArranques">arranques</G> son ejecuciones independientes. Se muestra la de menor inercia final, sin mezclar sus centroides.</p>
              </div>
              <div className="mlx-parameter-field">
                <OvaSlider label="Límite por arranque (max_iter)" value={maxIter} min={1} max={20} step={1} onChange={v => { setMaxIter(v); setStep(0); }} />
                <p>Es el máximo de iteraciones de cada arranque; puede detenerse antes.</p>
              </div>
              <div className="mlx-parameter-field mlx-parameter-field--wide">
                <label>Tolerancia (tol)<select aria-label="Tolerancia (tol)" value={tol} onChange={e => { setTol(Number(e.target.value)); setStep(0); }}>
                  <option value={0}>0: esperar asignaciones estables</option><option value={0.0001}>0.0001: movimiento muy pequeño</option><option value={0.01}>0.01: parada menos exigente</option><option value={0.1}>0.1: parada más temprana</option>
                </select></label>
                <p>La <G k="kmParada">tolerancia de parada</G> permite terminar por poco movimiento. Un valor mayor no garantiza mejores grupos.</p>
              </div>
            </div>
            <output aria-label="Configuración elegida">K={k} · init={init} · n_init={nInit} · max_iter={maxIter} · tol={tol}</output>
          </div>
          <div role="group" aria-label="Semilla de inicio">
            <span>Semilla: </span>
            {KM_STARTS.map((s, i) => (
              <button key={s.id} type="button" aria-pressed={start === i} onClick={() => reset(k, i)}>{s.id}</button>
            ))}
          </div>
          <p>Con init aleatorio y un arranque se conserva la comparación A/B. Con más arranques, cada semilla inicia una secuencia reproducible distinta.</p>
          <label><input type="checkbox" checked={showFinal} onChange={e => { setShowFinal(e.target.checked); playback.restart(); }} /> Mostrar resultado final</label>
          <button type="button" onClick={() => { reset(KM_START_K, 0); setInit('random'); setNInit(1); setMaxIter(20); setTol(0); setShowFinal(false); playback.restart(); }}>Restablecer ajustes</button>
          <p>Una iteración asigna puntos y mueve centros. La velocidad y «Repetir» son <G k="controlDidactico">controles de visualización</G>; repetir la animación no aumenta n_init.</p>
          <details className="mlx-parameter-notes mlx-km-run-notes"><summary>Resultados de los arranques y alcance de la OVA</summary>
            <ol>{experiment.runs.map((r, i) => <li key={i}>Arranque {i+1}: inercia {r[r.length-1].inertia.toFixed(2)} · {r.length-1} {r.length === 2 ? 'iteración' : 'iteraciones'}{i === experiment.selected ? ' · elegido' : ''}</li>)}</ol>
            <p><b>Datos y reglas fijas.</b> 24 puntos simulados en dos ejes 0–10; distancia euclidiana, pesos iguales y Lloyd fijos. No se aprende escalado aquí. Los colores identifican grupos, no respuestas verdaderas.</p>
            <p><b>Inicio y azar.</b> Se usa k-means++ clásico con una extracción por centro; scikit-learn usa una variante greedy. El generador de azar también es distinto: las mismas letras no equivalen a random_state de Python.</p>
            <p><b>Parada y grupos vacíos.</b> La OVA compara la suma del movimiento al cuadrado con tol multiplicado por la varianza media de los ejes. Si un grupo queda vacío, conserva su centro; scikit-learn puede reubicarlo. Al parar pronto, los centros pueden no ser el promedio de los grupos mostrados.</p>
          </details>
        </>
      }
      readoutLive={playback.playing && !showFinal ? 'off' : 'polite'}
      readout={
        <>
          <span>
            Iteración <b>{shownStep}</b> de <b>{last}</b> · arranque <b>{experiment.selected + 1}</b> de <b>{nInit}</b>
          </span>
          <span>
            Inercia: <b>{state.inertia.toFixed(2)}</b>
          </span>
          {done && <span>{state.stopReason === 'stable' ? 'Convergió: asignaciones estables.' : state.stopReason === 'tolerance' ? 'Paró por tolerancia; aún podrían cambiar asignaciones.' : 'Paró por max_iter; no implica convergencia.'}</span>}
          {done && new Set(state.labels).size > 1 && (
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
