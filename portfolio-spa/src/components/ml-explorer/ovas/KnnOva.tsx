import { G } from '../Gloss';
import { useRef, useState, type KeyboardEvent } from 'react';
import { KNN_POINTS as POINTS, KNN_START as START } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { knnVote, type Pt } from './ovaMath';
import { createPlot } from './plot';
import { useSvgDrag } from './useSvgDrag';
import { useInViewport, usePrefersReducedMotion } from './useMotion';
import { useAutoLoop } from './useAutoLoop';

const PLOT = createPlot(320, 320, 30, [0, 10], [0, 10]);
const UNIT = PLOT.sx(1) - PLOT.sx(0);
const LABEL_COLOR = '#cbd5e1';

const clamp = (v: number) => Math.min(10, Math.max(0, v));
// Redondeo a centésimas para que 0.1 + 0.2 no se vea como 0.30000000000000004.
const round2 = (v: number) => Math.round(v * 100) / 100;
const fmt = (v: number) => String(round2(v));
const LABELS = ['🔵 no le gustó', '🟠 le gustó'] as const;

export function KnnOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [query, setQuery] = useState<Pt>(START);
  const [maxK, setMaxK] = useState(15);
  const [weights, setWeights] = useState<'uniform' | 'distance'>('uniform');
  const [p, setP] = useState<1 | 2>(2);
  const [showFinal, setShowFinal] = useState(false);
  const [step, setStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  const last = (maxK + 1) / 2;
  const playback = useAutoLoop(step, last, setStep, visible && !showFinal, reducedMotion, autoPlay && !showFinal, 450, 5000);
  const shown = showFinal ? last : Math.min(step, last);
  const k = shown === 0 ? 1 : Math.min(maxK, shown * 2 - 1);
  const active = shown > 0;
  const result = knnVote(POINTS, query, k, { weights, p });
  const total = result.scores[0] + result.scores[1];
  const exact = weights === 'distance' && result.distances.includes(0);

  const { begin, svgProps } = useSvgDrag<'query'>((_, p) => setQuery({ x: clamp(PLOT.ix(p.x)), y: clamp(PLOT.iy(p.y)) }));

  /** Flechas: ±0.25; con Shift, ±1. */
  function onKeyDown(e: KeyboardEvent<SVGRectElement>) {
    const step = e.shiftKey ? 1 : 0.25;
    const moves: Record<string, Pt> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: step },
      ArrowDown: { x: 0, y: -step },
    };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    setQuery((q) => ({ x: round2(clamp(q.x + m.x)), y: round2(clamp(q.y + m.y)) }));
  }

  return (
    <OvaFrame
      playback={showFinal ? undefined : playback}
      progressLabel={!active ? 'Consulta sin votar' : `Configuración ${shown} de ${last} · k = ${k}`}
      explanation={!active ? 'El rombo es el caso nuevo. Elegimos vecinos con la distancia indicada y luego combinamos sus respuestas.' : `Se seleccionan ${k} vecinos. ${weights === 'uniform' ? 'Cada uno aporta un voto.' : exact ? 'Hay distancia cero: solo las coincidencias exactas seleccionadas aportan peso.' : 'Cada aporte se multiplica por 1/distancia.'} El contorno discontinuo es ${p === 2 ? 'un círculo euclidiano' : 'un rombo Manhattan'} hasta el último vecino seleccionado.`}
      title="Dime con quién andas…"
      hint="El rombo relleno es la consulta y su color indica la predicción. El borde blanco marca vecinos seleccionados; las líneas unen los que aportan peso. El contorno discontinuo alcanza al último vecino: círculo con distancia euclidiana, rombo con Manhattan. Mueve la consulta con el mouse o las flechas; no cambia los ejemplos guardados."
      controls={
        <>
          <div className="mlx-parameter-set" role="group" aria-label="Hiperparámetros de KNN">
            <strong>Ajustes de la predicción</strong>
            <div className="mlx-parameter-fields">
              <div className="mlx-parameter-field">
                <OvaSlider label="Vecinos elegidos (n_neighbors)" value={maxK} min={1} max={15} step={2} onChange={(value) => { setMaxK(value); setStep(0); }} />
                <p><G k="knnVecinos">k</G> indica cuántos ejemplos se consultan. Más vecinos amplían el grupo y pueden perder detalles útiles; no garantizan una respuesta mejor. Activa el ajuste elegido para comparar directamente.</p>
              </div>
              <div className="mlx-parameter-field">
                <label>Aporte de vecinos (weights)<select aria-label="Aporte de vecinos (weights)" value={weights} onChange={(e) => { setWeights(e.target.value as 'uniform' | 'distance'); setStep(0); }}>
                  <option value="uniform">Uniforme: un voto por vecino</option><option value="distance">Por distancia: peso 1/d</option>
                </select></label>
                <p>Con <G k="knnPesos">pesos por distancia</G>, un vecino cercano puede superar a varios lejanos. Si la consulta coincide exactamente con vecinos seleccionados, solo esas coincidencias aportan.</p>
              </div>
              <div className="mlx-parameter-field mlx-parameter-field--wide">
                <label>Distancia (metric y p)<select aria-label="Distancia (metric y p)" value={p} onChange={(e) => { setP(Number(e.target.value) as 1 | 2); setStep(0); }}>
                  <option value={2}>Euclidiana — Minkowski p=2</option><option value={1}>Manhattan — Minkowski p=1</option>
                </select></label>
                <p>La <G k="knnMetrica">métrica</G> decide quién está cerca: línea recta con p=2, suma de diferencias por eje con p=1. Cambia también la forma del contorno. Aquí ambos gustos están en escala 0–10.</p>
              </div>
            </div>
            <output aria-label="Configuración elegida">Elegido: k={maxK} · weights={weights} · metric=minkowski, p={p}. {active ? `Mostrando k=${k}; predicción: ${LABELS[result.winner]}.` : 'El recorrido aún no muestra el voto.'}</output>
          </div>
          <label><input type="checkbox" checked={showFinal} onChange={(e) => { setShowFinal(e.target.checked); playback.restart(); }} /> Mostrar ajuste elegido</label>
          <p>El recorrido compara k=1, 3, 5… hasta el elegido. Son configuraciones distintas, no iteraciones de entrenamiento. La velocidad es un <G k="controlDidactico">control de visualización</G>; mover el rombo cambia solo el caso consultado.</p>
          <div role="group" aria-label="Consulta y restauración">
            <button type="button" onClick={() => { setQuery({ x: POINTS[12].x, y: POINTS[12].y }); }}>Probar coincidencia exacta</button>
            <button type="button" onClick={() => { setQuery(START); setMaxK(15); setWeights('uniform'); setP(2); setShowFinal(false); playback.restart(); }}>Restablecer ajustes y consulta</button>
          </div>
          <details className="mlx-parameter-notes"><summary>Escalas, búsqueda y empates</summary>
            <p>23 ejemplos simulados con dos gustos en 0–10. No se ajusta un escalado aquí. Con columnas de unidades distintas, aprende el <G k="escalado">escalado</G> solo con entrenamiento y aplícalo después a las consultas.</p>
            <p>La búsqueda es exhaustiva, equivalente a <G k="knnBusqueda">algorithm="brute"</G>. Cambiar el método de búsqueda exacta busca reducir costo; no cambia la regla de voto. Vecinos a igual distancia se ordenan por su posición original; si el empate cae en el límite k, la selección puede variar entre implementaciones. En empate de aportes por clase gana la clase 0. Usar k impar no evita todos los empates con pesos.</p>
            <p>No se conoce la respuesta real del rombo; la predicción y los aportes no miden acierto ni una probabilidad calibrada para personas nuevas.</p>
          </details>
        </>
      }
      readoutLive={playback.playing && !showFinal ? 'off' : 'polite'}
      readout={
        <>
          {active ? (
            <>
              <span>k = <b>{k}</b> · vecinos por clase: {LABELS[0]} <b>{result.votes[0]}</b> · {LABELS[1]} <b>{result.votes[1]}</b></span>
              <span>Aportes {weights === 'uniform' ? '(votos)' : '(suma de pesos)'}: 🔵 <b>{result.scores[0].toFixed(2)}</b> · 🟠 <b>{result.scores[1].toFixed(2)}</b>. Fracción naranja del aporte: <b>{total ? Math.round(100 * result.scores[1] / total) : 0} %</b>.</span>
              <span>Predicción: <b>{LABELS[result.winner]}</b>. Es el voto para esta consulta, no una medida de acierto.</span>
              {exact && <span>Distancia cero: solo aportan las coincidencias exactas seleccionadas.</span>}
            </>
          ) : <span>Los datos aún no tienen una clasificación visible.</span>}
        </>
      }
    >
      <div ref={stageRef} className="mlx-knn-stage">
        <svg
          viewBox={`-18 -18 ${PLOT.width + 36} ${PLOT.height + 36}`}
          {...svgProps}
          role="group"
          aria-label="Puntos de dos clases y la persona nueva con sus k vecinos"
        >
          <text x={PLOT.sx(10)} y={PLOT.height - 8} textAnchor="end" fontSize={13} fontWeight={600} fill={LABEL_COLOR}>
            gusto por la acción →
          </text>
          <text x={8} y={PLOT.sy(10) - 10} fontSize={13} fontWeight={600} fill={LABEL_COLOR}>
            ↑ gusto por la ciencia ficción
          </text>
          {active && (p === 2 ? <circle className="mlx-knn-radius" cx={PLOT.sx(query.x)} cy={PLOT.sy(query.y)} r={result.radius * UNIT} fill="none" stroke="#aeb8cc" strokeWidth={1.25} strokeDasharray="4 4" pointerEvents="none" /> :
            <polygon className="mlx-knn-radius" points={[[query.x, query.y + result.radius], [query.x + result.radius, query.y], [query.x, query.y - result.radius], [query.x - result.radius, query.y]].map(([x, y]) => `${PLOT.sx(x)},${PLOT.sy(y)}`).join(' ')} fill="none" stroke="#aeb8cc" strokeWidth={1.25} strokeDasharray="4 4" pointerEvents="none" />)}
          {active && result.neighbors.map((i, rank) => result.neighborWeights[rank] > 0 && (
            <line
              key={`n${i}`}
              x1={PLOT.sx(query.x)}
              y1={PLOT.sy(query.y)}
              x2={PLOT.sx(POINTS[i].x)}
              y2={PLOT.sy(POINTS[i].y)}
              stroke={POINTS[i].label ? OVA_COLORS.class1 : OVA_COLORS.class0}
              strokeWidth={1.5}
              pointerEvents="none"
            />
          ))}
          {POINTS.map((p, i) => (
            <circle
              key={i}
              cx={PLOT.sx(p.x)}
              cy={PLOT.sy(p.y)}
              r={6}
              className="mlx-knn-point"
              fill={!active ? OVA_COLORS.axis : p.label ? OVA_COLORS.class1 : OVA_COLORS.class0}
              stroke={!active ? '#d9d9e8' : result.neighbors.includes(i) ? '#ffffff' : '#040320'}
              strokeWidth={active && result.neighbors.includes(i) ? 2 : 1.5}
            />
          ))}
          <rect
            className="is-draggable mlx-knn-query"
            x={PLOT.sx(query.x) - 9}
            y={PLOT.sy(query.y) - 9}
            width={18}
            height={18}
            transform={`rotate(45 ${PLOT.sx(query.x)} ${PLOT.sy(query.y)})`}
            fill={!active ? OVA_COLORS.axis : result.winner ? OVA_COLORS.class1 : OVA_COLORS.class0}
            stroke="#ffffff"
            strokeWidth={2}
            tabIndex={0}
            role="button"
            aria-roledescription="punto movible"
            aria-label={`Persona nueva: acción ${fmt(query.x)}, ciencia ficción ${fmt(query.y)}. Muévela con las flechas.`}
            onPointerDown={begin('query')}
            onKeyDown={onKeyDown}
          />
        </svg>
      </div>
    </OvaFrame>
  );
}
