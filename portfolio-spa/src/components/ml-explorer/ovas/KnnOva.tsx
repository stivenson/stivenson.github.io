import { useState, type KeyboardEvent } from 'react';
import { KNN_POINTS as POINTS, KNN_START as START } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { knnVote, type Pt } from './ovaMath';
import { createPlot } from './plot';
import { useSvgDrag } from './useSvgDrag';

const PLOT = createPlot(320, 320, 30, [0, 10], [0, 10]);
const UNIT = PLOT.sx(1) - PLOT.sx(0);

const clamp = (v: number) => Math.min(10, Math.max(0, v));
// Redondeo a centésimas para que 0.1 + 0.2 no se vea como 0.30000000000000004.
const round2 = (v: number) => Math.round(v * 100) / 100;
const fmt = (v: number) => String(round2(v));
const LABELS = ['🔵 no le gustó', '🟠 le gustó'] as const;

export function KnnOva() {
  const [query, setQuery] = useState<Pt>(START);
  const [k, setK] = useState(1);
  const result = knnVote(POINTS, query, k);

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
      title="Dime con quién andas…"
      hint="Arrastra la persona nueva (el rombo) o muévela con las flechas del teclado, y cambia k. Con k = 1 decide un solo vecino, y en la posición inicial ese vecino es un dato raro. Sube k a 3 o 5 y el voto se vuelve estable."
      controls={
        <>
          <OvaSlider label="k (vecinos que votan)" value={k} min={1} max={15} step={2} onChange={setK} />
          <button
            type="button"
            onClick={() => {
              setQuery(START);
              setK(1);
            }}
          >
            Restablecer
          </button>
        </>
      }
      readout={
        <>
          <span>
            Votos: {LABELS[0]} <b>{result.votes[0]}</b> · {LABELS[1]} <b>{result.votes[1]}</b>
          </span>
          <span>
            Predicción: <b>{LABELS[result.winner]}</b>
          </span>
        </>
      }
    >
      <svg
        viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
        {...svgProps}
        role="group"
        aria-label="Puntos de dos clases y la persona nueva con sus k vecinos"
      >
        <text x={PLOT.sx(10)} y={PLOT.height - 8} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
          gusto por la acción →
        </text>
        <text x={8} y={PLOT.sy(10) - 10} fontSize={11} fill={OVA_COLORS.axis}>
          ↑ gusto por la ciencia ficción
        </text>
        <circle
          cx={PLOT.sx(query.x)}
          cy={PLOT.sy(query.y)}
          r={result.radius * UNIT}
          fill="none"
          stroke={OVA_COLORS.axis}
          strokeDasharray="4 4"
          pointerEvents="none"
        />
        {result.neighbors.map((i) => (
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
            fill={p.label ? OVA_COLORS.class1 : OVA_COLORS.class0}
            stroke={result.neighbors.includes(i) ? '#ffffff' : '#040320'}
            strokeWidth={result.neighbors.includes(i) ? 2 : 1.5}
          />
        ))}
        <rect
          className="is-draggable"
          x={PLOT.sx(query.x) - 9}
          y={PLOT.sy(query.y) - 9}
          width={18}
          height={18}
          transform={`rotate(45 ${PLOT.sx(query.x)} ${PLOT.sy(query.y)})`}
          fill={result.winner ? OVA_COLORS.class1 : OVA_COLORS.class0}
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
    </OvaFrame>
  );
}
