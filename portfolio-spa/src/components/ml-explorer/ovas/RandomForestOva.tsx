import { G } from '../Gloss';
import './RandomForestOva.css';
import { useMemo, useRef, useState } from 'react';
import { FOREST_DEPTH, FOREST_SEED, FOREST_SIZES, FOREST_TEST, TREE_NOISE as NOISE, TREE_POINTS as POINTS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { useAutoLoop } from './useAutoLoop';
import { useInViewport, usePrefersReducedMotion } from './useMotion';
import { buildForest, forestAccuracy, forestVote } from './ovaMath';
import { createPlot } from './plot';

const PLOT = createPlot(320, 320, 30, [0, 10], [0, 10]);
const CELLS = 25;
const CELL = 10 / CELLS;
const RING_R = 10;

function formatAccuracy(hits: number, total: number) {
  const percentage = (hits / total) * 100;
  const decimals = Number.isInteger(percentage) ? 0 : 1;
  return `${percentage.toFixed(decimals).replace('.', ',')} %`;
}

export function RandomForestOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [maxSizeIndex, setMaxSizeIndex] = useState(FOREST_SIZES.length - 1);
  const [step, setStep] = useState(0);
  const [maxDepth, setMaxDepth] = useState(FOREST_DEPTH);
  const [minSamplesLeaf, setMinSamplesLeaf] = useState(1);
  const [maxFeatures, setMaxFeatures] = useState<1 | 2>(1);
  const [bootstrap, setBootstrap] = useState(true);
  const [showFinal, setShowFinal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInViewport(ref);
  const reducedMotion = usePrefersReducedMotion();
  const last = maxSizeIndex + 1;
  const playback = useAutoLoop(step, last, setStep, visible && !showFinal, reducedMotion, autoPlay && !showFinal, 1050, 5000);
  const shown = showFinal ? last : Math.min(step, last);
  const resetStep = () => setStep(reducedMotion ? last : 0);

  // Frame 0 deliberately has no trees; later frames add a larger ensemble.
  const n = shown === 0 ? 0 : FOREST_SIZES[Math.min(shown - 1, maxSizeIndex)];
  const all = useMemo(() => buildForest(POINTS, FOREST_SIZES[maxSizeIndex], maxDepth, FOREST_SEED, { minSamplesLeaf, maxFeatures, bootstrap }), [maxSizeIndex, maxDepth, minSamplesLeaf, maxFeatures, bootstrap]);
  const trees = useMemo(() => all.slice(0, n), [all, n]);

  const cells = useMemo(() => {
    const out: { x: number; y: number; vote: number }[] = [];
    for (let i = 0; i < CELLS; i++) {
      for (let j = 0; j < CELLS; j++) {
        const x = i * CELL;
        const y = j * CELL;
        out.push({ x, y, vote: n === 0 ? 0.5 : forestVote(trees, { x: x + CELL / 2, y: y + CELL / 2 }) });
      }
    }
    return out;
  }, [trees, n]);

  const train = n === 0 ? null : Math.round(forestAccuracy(trees, POINTS) * POINTS.length);
  const test = n === 0 ? null : Math.round(forestAccuracy(trees, FOREST_TEST) * FOREST_TEST.length);
  const progressLabel = n === 0
    ? `Sin árboles · etapa 0 de ${last}`
    : `Bosque de ${n} ${n === 1 ? 'árbol' : 'árboles'} · etapa ${shown} de ${last}`;

  return (
    <div ref={ref}>
      <OvaFrame
        playback={showFinal ? undefined : playback}
        progressLabel={progressLabel}
        explanation={n === 0
          ? 'Aún no hay bosque: solo ves las respuestas reales. Azul significa «paga» y naranja «no paga».'
          : `Votan ${n} ${n === 1 ? 'árbol' : 'árboles'}. ${n === FOREST_SIZES[maxSizeIndex] ? 'Se muestran todos los árboles solicitados.' : `Es un subconjunto de los ${FOREST_SIZES[maxSizeIndex]} árboles solicitados.`} El fondo muestra la decisión de la mayoría: cuanto más intenso es el color, más árboles coinciden. El relleno del punto es la predicción y el borde conserva la respuesta real.`}
        title="Muchos árboles votan"
        hint="El bosque aprende de 28 clientes simulados. Los ajustes recalculan los árboles; el recorrido muestra prefijos del mismo bosque reproducible. Relleno: predicción; borde: clase real; anillo blanco: caso contradictorio. El fondo indica acuerdo entre votos, no una probabilidad calibrada. Los 40 casos de comparación ilustran el comportamiento, no sustituyen una evaluación independiente."
        controls={
          <>
            <div className="mlx-rf-settings mlx-parameter-set" role="group" aria-label="Hiperparámetros del bosque">
              <strong>Ajustes de entrenamiento</strong>
              <div className="mlx-parameter-fields">
                <div className="mlx-parameter-field">
                  <OvaSlider label="Árboles solicitados (n_estimators)" value={maxSizeIndex} min={0} max={FOREST_SIZES.length - 1} step={1}
                    onChange={(value) => { setMaxSizeIndex(value); setStep(reducedMotion ? value + 1 : 0); }} format={(i) => String(FOREST_SIZES[i])} />
                  <p>Más árboles pueden estabilizar el resultado, con más cálculo y memoria. No garantizan más aciertos. Activa el bosque final para comparar tamaños.</p>
                </div>
                <div className="mlx-parameter-field">
                  <OvaSlider label="Profundidad por árbol (max_depth)" value={maxDepth} min={1} max={FOREST_DEPTH} step={1}
                    onChange={(value) => { setMaxDepth(value); resetStep(); }} />
                  <p>Límite de preguntas por recorrido; cada árbol puede detenerse antes. Compara 2 y 8 para ver la complejidad de la frontera.</p>
                </div>
                <div className="mlx-parameter-field">
                  <OvaSlider label="Mínimo de clientes por hoja (min_samples_leaf)" value={minSamplesLeaf} min={1} max={5} step={1}
                    onChange={(value) => { setMinSamplesLeaf(value); resetStep(); }} />
                  <p>Exige un mínimo de clientes distintos en ambos hijos de un corte. Aumentarlo evita <G k="minimoHoja">hojas pequeñas</G>, pero puede perder detalles útiles.</p>
                </div>
                <div className="mlx-parameter-field">
                  <label>Variables por corte (max_features)
                    <select value={maxFeatures} onChange={(e) => { setMaxFeatures(Number(e.target.value) as 1 | 2); resetStep(); }}>
                      <option value={1}>1 de 2, sorteada</option><option value={2}>Las 2 disponibles</option>
                    </select>
                  </label>
                  <p>Con 1, cada corte empieza por una variable sorteada y prueba la otra si no encuentra mejora válida. Con 2, compara ambas. Cambia la <G k="diversidadBosque">diversidad entre árboles</G>.</p>
                </div>
                <div className="mlx-parameter-field mlx-parameter-field--wide">
                  <label className="mlx-rf-check"><input type="checkbox" checked={bootstrap} onChange={(e) => { setBootstrap(e.target.checked); resetStep(); }} /> Muestreo con reposición (bootstrap)</label>
                  <p>Activado: cada árbol usa 28 extracciones, que pueden repetir clientes. Desactivado: todos usan las 28 filas originales. <G k="bootstrap">Cómo funciona el muestreo</G>.</p>
                </div>
              </div>
              <output>Configuración: {FOREST_SIZES[maxSizeIndex]} árboles · profundidad ≤ {maxDepth} · mínimo por hoja {minSamplesLeaf} · variables por corte {maxFeatures} · bootstrap {bootstrap ? 'sí' : 'no'}.</output>
            </div>
            <label className="mlx-rf-check"><input type="checkbox" checked={showFinal} onChange={(e) => { setShowFinal(e.target.checked); resetStep(); }} /> Mostrar bosque final</label>
            <p>Mostrando <b>{n}</b> de <b>{FOREST_SIZES[maxSizeIndex]}</b> árboles solicitados. El avance y la velocidad son <G k="controlDidactico">controles de visualización</G>; no son iteraciones de un árbol.</p>
            <details className="mlx-parameter-notes"><summary>Alcance y ajustes fijos de esta simulación</summary>
              <p>Fijos: Gini, mínimo 2 antes de dividir, sin poda posterior ni pesos de clase, semilla {FOREST_SEED}. La OVA usa votos de clase y su propio generador de azar; no reproduce exactamente RandomForestClassifier.</p>
              <p>Los 40 casos simulados se reutilizan al comparar ajustes; algunas coordenadas coinciden con entrenamiento. Son una referencia didáctica, no una prueba independiente. El ejercicio de Python sí reserva una prueba final.</p>
            </details>
            <button type="button" onClick={() => { setMaxSizeIndex(FOREST_SIZES.length - 1); setMaxDepth(FOREST_DEPTH); setMinSamplesLeaf(1); setMaxFeatures(1); setBootstrap(true); setStep(reducedMotion ? FOREST_SIZES.length : 0); }}>Restablecer ajustes</button>
          </>
        }
        readout={
          train === null || test === null ? (
            <span className="mlx-rf-empty">Reproduce la animación para que los árboles empiecen a votar.</span>
          ) : (
            <div className="mlx-rf-metrics" aria-label="Exactitud del bosque">
              <div className="mlx-rf-metric">
                <span>Entrenamiento</span>
                <strong>{train} de {POINTS.length}</strong>
                <small>{formatAccuracy(train, POINTS.length)} de acierto</small>
              </div>
              <div className="mlx-rf-metric">
                <span>Comparación simulada</span>
                <strong>{test} de {FOREST_TEST.length}</strong>
                <small>{formatAccuracy(test, FOREST_TEST.length)} de acierto</small>
              </div>
            </div>
          )
        }
      >
        <div className="mlx-rf-viz">
          <div className="mlx-rf-summary"><strong>{n} de {FOREST_SIZES[maxSizeIndex]} {FOREST_SIZES[maxSizeIndex] === 1 ? 'árbol' : 'árboles'} · profundidad máxima {maxDepth}</strong><span>Mínimo por hoja {minSamplesLeaf} · variables por corte {maxFeatures} · bootstrap {bootstrap ? 'sí' : 'no'}</span><span>{train === null || test === null ? 'Sin predicciones todavía.' : `Entrenamiento: ${train} de ${POINTS.length} · comparación simulada: ${test} de ${FOREST_TEST.length}.`}</span><span>Color del fondo: <G k="acuerdoBosque">acuerdo entre votos</G>; no probabilidad calibrada.</span></div>
          <svg
            className="mlx-rf-plot"
            viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
            role="img"
            aria-label={n === 0
              ? 'Clientes de entrenamiento antes de que vote el bosque'
              : `Predicciones y acuerdo de un bosque de ${n} ${n === 1 ? 'árbol' : 'árboles'}`}
          >
            {cells.map((c, i) => (
              <rect
                className="mlx-rf-cell"
                key={i}
                x={PLOT.sx(c.x)}
                y={PLOT.sy(c.y + CELL)}
                width={PLOT.sx(CELL) - PLOT.sx(0)}
                height={PLOT.sy(0) - PLOT.sy(CELL)}
                fill={n === 0 ? OVA_COLORS.axis : c.vote > 0.5 ? OVA_COLORS.class1 : OVA_COLORS.class0}
                fillOpacity={n === 0 ? 0.13 : 0.08 + 0.84 * Math.abs(c.vote - 0.5)}
              />
            ))}
            <text className="mlx-rf-axis-label" x={PLOT.sx(10)} y={PLOT.height - 8} textAnchor="end">
              ingreso →
            </text>
            <text className="mlx-rf-axis-label" x={8} y={PLOT.sy(10) - 10}>
              ↑ deuda (escala 0-10)
            </text>
            {POINTS.map((p, i) => {
              const vote = n === 0 ? 0.5 : forestVote(trees, p);
              const prediction = n === 0 ? null : vote > 0.5;
              const correct = prediction === (p.label === 1);
              return (
                <circle
                  className="mlx-rf-point"
                  key={i}
                  cx={PLOT.sx(p.x)}
                  cy={PLOT.sy(p.y)}
                  r={6}
                  fill={prediction === null ? OVA_COLORS.axis : prediction ? OVA_COLORS.class1 : OVA_COLORS.class0}
                  stroke={n === 0 ? '#d9d9e8' : p.label ? OVA_COLORS.class1 : OVA_COLORS.class0}
                  strokeWidth={prediction !== null && !correct ? 3 : 1.5}
                  strokeDasharray={prediction !== null && !correct ? '2 2' : undefined}
                />
              );
            })}
            {NOISE.map((p, i) => {
              const cx = PLOT.sx(p.x);
              const cy = PLOT.sy(p.y);
              return (
                <path
                  key={`ring-${i}`}
                  d={`M ${cx - RING_R} ${cy} a ${RING_R} ${RING_R} 0 1 0 ${2 * RING_R} 0 a ${RING_R} ${RING_R} 0 1 0 ${-2 * RING_R} 0`}
                  fill="none"
                  stroke="#e8e8f0"
                  strokeWidth={2}
                />
              );
            })}
          </svg>
        </div>
      </OvaFrame>
    </div>
  );
}
