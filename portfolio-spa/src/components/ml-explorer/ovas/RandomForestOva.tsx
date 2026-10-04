import { useMemo, useState } from 'react';
import { FOREST_DEPTH, FOREST_SEED, FOREST_SIZES, FOREST_TEST, TREE_POINTS as POINTS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { buildForest, forestAccuracy, forestVote } from './ovaMath';
import { createPlot } from './plot';

const PLOT = createPlot(320, 320, 30, [0, 10], [0, 10]);
const CELLS = 25;
const CELL = 10 / CELLS;
// Los dos clientes de ruido de TREE_POINTS (ver datasets.ts); se marcan con un anillo.
const NOISE = [
  { x: 3, y: 1.5 },
  { x: 8, y: 8 },
];
const RING_R = 10;
const MAX_TREES = FOREST_SIZES[FOREST_SIZES.length - 1];

export function RandomForestOva() {
  const [sizeIndex, setSizeIndex] = useState(0);
  const n = FOREST_SIZES[sizeIndex];
  // Se construyen los 100 árboles una vez; el bosque de N son los primeros N.
  const all = useMemo(() => buildForest(POINTS, MAX_TREES, FOREST_DEPTH, FOREST_SEED), []);
  const trees = useMemo(() => all.slice(0, n), [all, n]);

  const cells = useMemo(() => {
    const out: { x: number; y: number; vote: number }[] = [];
    for (let i = 0; i < CELLS; i++) {
      for (let j = 0; j < CELLS; j++) {
        const x = i * CELL;
        const y = j * CELL;
        out.push({ x, y, vote: forestVote(trees, { x: x + CELL / 2, y: y + CELL / 2 }) });
      }
    }
    return out;
  }, [trees]);

  const train = Math.round(forestAccuracy(trees, POINTS) * POINTS.length);
  const test = Math.round(forestAccuracy(trees, FOREST_TEST) * FOREST_TEST.length);

  return (
    <OvaFrame
      title="Muchos árboles votan"
      hint="Sube el número de árboles. Cada árbol aprendió de una muestra distinta de los clientes; el color de cada zona es el voto del bosque (más intenso = más acuerdo). Con 1 árbol la frontera tiene picos y huecos; con muchos se suaviza. Los dos clientes con anillo son ruido: el de abajo a la izquierda no pagó aunque su deuda es baja, y el de arriba a la derecha pagó aunque su deuda es alta. Compara los aciertos en clientes nuevos, no los de entrenamiento. Ojo: con 30 árboles o más acierta los 28 de entrenamiento, incluidos los dos clientes de ruido; eso es memorizar. Lo que mejora de verdad son los aciertos en clientes nuevos (35 → 39 de 40)."
      controls={
        <OvaSlider
          label="Árboles en el bosque"
          value={sizeIndex}
          min={0}
          max={FOREST_SIZES.length - 1}
          step={1}
          onChange={setSizeIndex}
          format={(i) => String(FOREST_SIZES[i])}
        />
      }
      readout={
        <>
          <span>
            Clientes de entrenamiento: acierta <b>{train} de {POINTS.length}</b>
          </span>
          <span>
            Clientes nuevos: acierta <b>{test} de {FOREST_TEST.length}</b>
          </span>
        </>
      }
    >
      <svg
        viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
        role="img"
        aria-label={`Plano coloreado por el voto de ${n} árboles, con los 28 clientes de entrenamiento`}
      >
        {cells.map((c, i) => (
          <rect
            key={i}
            x={PLOT.sx(c.x)}
            y={PLOT.sy(c.y + CELL)}
            width={PLOT.sx(CELL) - PLOT.sx(0)}
            height={PLOT.sy(0) - PLOT.sy(CELL)}
            fill={c.vote > 0.5 ? OVA_COLORS.class1 : OVA_COLORS.class0}
            fillOpacity={0.06 + 0.5 * Math.abs(c.vote - 0.5)}
          />
        ))}
        <text x={PLOT.sx(10)} y={PLOT.height - 8} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
          ingreso →
        </text>
        <text x={8} y={PLOT.sy(10) - 10} fontSize={11} fill={OVA_COLORS.axis}>
          ↑ deuda (escala 0-10)
        </text>
        {POINTS.map((p, i) => (
          <circle
            key={i}
            cx={PLOT.sx(p.x)}
            cy={PLOT.sy(p.y)}
            r={6}
            fill={p.label ? OVA_COLORS.class1 : OVA_COLORS.class0}
            stroke="#040320"
            strokeWidth={1.5}
          />
        ))}
        {NOISE.map((p, i) => {
          const cx = PLOT.sx(p.x);
          const cy = PLOT.sy(p.y);
          // Anillo como path (no circle): los circle son solo los 28 clientes.
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
  );
}
