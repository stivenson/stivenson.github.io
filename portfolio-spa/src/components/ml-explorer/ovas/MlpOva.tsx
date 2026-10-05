import { useState } from 'react';
import { MLP_BIAS, MLP_SOLUTION, MLP_START, MLP_WEIGHT, XOR_POINTS as POINTS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { mlpForward, mlpHits, type Mlp2, type Neuron2 } from './ovaMath';
import { createPlot } from './plot';

const PLOT = createPlot(320, 320, 20, [-0.25, 1.25], [-0.25, 1.25]);
/** Cuadrícula de 20×20 celdas para pintar la región de cada clase. */
const CELLS = 20;
const CELL = 1.5 / CELLS;

type Layer = keyof Mlp2;

const LAYERS: { id: Layer; name: string; label: string; inputs: [string, string] }[] = [
  { id: 'h1', name: 'Oculta 1', label: 'Neurona oculta 1', inputs: ['peso de x', 'peso de y'] },
  { id: 'h2', name: 'Oculta 2', label: 'Neurona oculta 2', inputs: ['peso de x', 'peso de y'] },
  { id: 'out', name: 'Salida', label: 'Neurona de salida', inputs: ['peso de oculta 1', 'peso de oculta 2'] },
];

/** Extremos visibles de la recta w1·x + w2·y + b = 0 (null si la neurona no depende de x ni de y). */
function neuronLine([w1, w2, b]: Neuron2): [number, number, number, number] | null {
  if (w1 === 0 && w2 === 0) return null;
  const [lo, hi] = [-0.25, 1.25];
  if (Math.abs(w2) >= Math.abs(w1)) return [lo, -(w1 * lo + b) / w2, hi, -(w1 * hi + b) / w2];
  return [-(w2 * lo + b) / w1, lo, -(w2 * hi + b) / w1, hi];
}

export function MlpOva() {
  const [net, setNet] = useState<Mlp2>(MLP_START);
  const hits = mlpHits(net, POINTS);
  const set = (layer: Layer, i: number, v: number) =>
    setNet((prev) => ({ ...prev, [layer]: prev[layer].map((w, j) => (j === i ? v : w)) as Neuron2 }));

  return (
    <OvaFrame
      title="Dos neuronas ocultas resuelven XOR"
      hint="Los puntos naranjas (clase 1) están en dos esquinas opuestas y los azules (clase 0) en las otras dos: ninguna recta los separa. Cada neurona oculta traza una recta (las líneas punteadas) y la neurona de salida combina las dos. Los puntos con borde rosa están mal clasificados. Al empezar, la neurona oculta 2 está apagada y la red acierta 15 de 20, lo máximo con una sola recta. Mueve los pesos de la oculta 2 y de la salida hasta acertar los 20. Una receta: la oculta 2 en −20, −20 y 30, y la salida en 20, 20 y −30. O pulsa «Ver una solución»."
      controls={
        <>
          {LAYERS.map((layer) => (
            <div key={layer.id} role="group" aria-label={layer.label} className="mlx-mlp-neuron">
              <span>{layer.name}</span>
              {[0, 1, 2].map((i) => (
                <OvaSlider
                  key={i}
                  label={`${layer.name} · ${i < 2 ? layer.inputs[i] : 'sesgo'}`}
                  value={net[layer.id][i]}
                  {...(i < 2 ? MLP_WEIGHT : MLP_BIAS)}
                  onChange={(v) => set(layer.id, i, v)}
                />
              ))}
            </div>
          ))}
          <div role="group" aria-label="Pesos">
            <button type="button" onClick={() => setNet(MLP_SOLUTION)}>
              Ver una solución
            </button>
            <button type="button" onClick={() => setNet(MLP_START)}>
              Restablecer
            </button>
          </div>
        </>
      }
      readout={
        <>
          <span>
            Aciertos: <b>{hits} de {POINTS.length}</b>
          </span>
          {hits === POINTS.length && <span>La red separa XOR: cada esquina queda en su clase.</span>}
          {net.h2[0] === 0 && net.h2[1] === 0 && <span>La neurona oculta 2 no mira x ni y: vale lo mismo en todo el plano.</span>}
        </>
      }
    >
      <svg
        viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
        role="img"
        aria-label={`20 puntos de dos clases en las cuatro esquinas, la región que la red asigna a cada clase y las rectas de las neuronas ocultas; acierta ${hits} de 20`}
      >
        {Array.from({ length: CELLS * CELLS }, (_, c) => {
          const x = -0.25 + (c % CELLS) * CELL;
          const y = -0.25 + Math.floor(c / CELLS) * CELL;
          const p = mlpForward(net, { x: x + CELL / 2, y: y + CELL / 2 }).y;
          return (
            <rect
              key={c}
              className="mlx-mlp-cell"
              x={PLOT.sx(x)}
              y={PLOT.sy(y + CELL)}
              width={PLOT.sx(x + CELL) - PLOT.sx(x)}
              height={PLOT.sy(y) - PLOT.sy(y + CELL)}
              fill={p >= 0.5 ? OVA_COLORS.class1 : OVA_COLORS.class0}
              fillOpacity={0.08 + 0.22 * Math.abs(p - 0.5) * 2}
            />
          );
        })}
        {(['h1', 'h2'] as const).map((id) => {
          const l = neuronLine(net[id]);
          return (
            l && (
              <line
                key={id}
                x1={PLOT.sx(l[0])}
                y1={PLOT.sy(l[1])}
                x2={PLOT.sx(l[2])}
                y2={PLOT.sy(l[3])}
                stroke={OVA_COLORS.accent}
                strokeWidth={2}
                strokeDasharray={id === 'h1' ? '6 4' : '2 4'}
              />
            )
          );
        })}
        {POINTS.map((p, i) => {
          const wrong = (mlpForward(net, p).y >= 0.5 ? 1 : 0) !== p.label;
          return (
            <circle
              key={i}
              cx={PLOT.sx(p.x)}
              cy={PLOT.sy(p.y)}
              r={6}
              fill={p.label ? OVA_COLORS.class1 : OVA_COLORS.class0}
              stroke={wrong ? OVA_COLORS.risk : '#040320'}
              strokeWidth={wrong ? 3 : 1.5}
            />
          );
        })}
        <text x={PLOT.sx(1.25)} y={PLOT.height - 4} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
          x →
        </text>
        <text x={PLOT.sx(-0.25)} y={14} fontSize={11} fill={OVA_COLORS.axis}>
          ↑ y
        </text>
      </svg>
    </OvaFrame>
  );
}
