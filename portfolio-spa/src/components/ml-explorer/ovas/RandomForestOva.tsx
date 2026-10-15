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
const MAX_TREES = FOREST_SIZES[FOREST_SIZES.length - 1];

function formatAccuracy(hits: number, total: number) {
  const percentage = (hits / total) * 100;
  const decimals = Number.isInteger(percentage) ? 0 : 1;
  return `${percentage.toFixed(decimals).replace('.', ',')} %`;
}

export function RandomForestOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [maxSizeIndex, setMaxSizeIndex] = useState(FOREST_SIZES.length - 1);
  const [step, setStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInViewport(ref);
  const reducedMotion = usePrefersReducedMotion();
  const last = maxSizeIndex + 1;
  const playback = useAutoLoop(step, last, setStep, visible, reducedMotion, autoPlay, 1050, 5000);

  // Frame 0 deliberately has no trees; later frames add a larger ensemble.
  const n = step === 0 ? 0 : FOREST_SIZES[Math.min(step - 1, maxSizeIndex)];
  const all = useMemo(() => buildForest(POINTS, MAX_TREES, FOREST_DEPTH, FOREST_SEED), []);
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
    : `Bosque de ${n} ${n === 1 ? 'árbol' : 'árboles'} · etapa ${step} de ${last}`;

  return (
    <div ref={ref}>
      <OvaFrame
        playback={playback}
        progressLabel={progressLabel}
        explanation={n === 0
          ? 'Aún no hay bosque: solo ves las respuestas reales. Azul significa «paga» y naranja «no paga».'
          : `Votan ${n} ${n === 1 ? 'árbol' : 'árboles'}. El fondo muestra la decisión de la mayoría: cuanto más intenso es el color, más árboles coinciden. El relleno del punto es la predicción y el borde conserva la respuesta real.`}
        title="Muchos árboles votan"
        hint="El ciclo empieza con los clientes neutrales y va sumando árboles. Azul significa «paga» y naranja «no paga». El relleno de cada punto es la predicción del bosque; su borde conserva la respuesta real. El fondo se intensifica cuando más árboles coinciden. Los dos puntos con anillo blanco son casos contradictorios: uno no pagó aun con deuda baja y otro pagó aun con deuda alta. Compara entrenamiento con clientes nuevos para comprobar si el bosque generaliza."
        controls={
          <OvaSlider
            label="Tamaño máximo del bosque"
            value={maxSizeIndex}
            min={0}
            max={FOREST_SIZES.length - 1}
            step={1}
            onChange={(value) => {
              setMaxSizeIndex(value);
              setStep(0);
            }}
            format={(i) => String(FOREST_SIZES[i])}
          />
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
                <span>Clientes nuevos</span>
                <strong>{test} de {FOREST_TEST.length}</strong>
                <small>{formatAccuracy(test, FOREST_TEST.length)} de acierto</small>
              </div>
            </div>
          )
        }
      >
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
      </OvaFrame>
    </div>
  );
}
