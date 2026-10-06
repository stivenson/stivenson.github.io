import { useRef, useState } from 'react';
import { MLP_BIAS, MLP_SOLUTION, MLP_WEIGHT, XOR_POINTS as POINTS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { mlpForward, mlpHits, type Mlp2, type Neuron2 } from './ovaMath';
import { createPlot } from './plot';
import { useAutoLoop } from './useAutoLoop';
import { useInViewport, usePrefersReducedMotion } from './useMotion';

const PLOT = createPlot(320, 320, 20, [-0.25, 1.25], [-0.25, 1.25]);
const CELLS = 20;
const CELL = 1.5 / CELLS;
const LAST_STEP = 3;

type Layer = keyof Mlp2;

const LAYERS: { id: Layer; name: string; label: string; inputs: [string, string] }[] = [
  { id: 'h1', name: 'Oculta 1', label: 'Neurona oculta 1', inputs: ['peso de x', 'peso de y'] },
  { id: 'h2', name: 'Oculta 2', label: 'Neurona oculta 2', inputs: ['peso de x', 'peso de y'] },
  { id: 'out', name: 'Salida', label: 'Neurona de salida', inputs: ['peso de oculta 1', 'peso de oculta 2'] },
];

/** Extremos visibles de la recta w1·x + w2·y + b = 0. */
function neuronLine([w1, w2, b]: Neuron2): [number, number, number, number] | null {
  if (w1 === 0 && w2 === 0) return null;
  const [lo, hi] = [-0.25, 1.25];
  if (Math.abs(w2) >= Math.abs(w1)) return [lo, -(w1 * lo + b) / w2, hi, -(w1 * hi + b) / w2];
  return [-(w2 * lo + b) / w1, lo, -(w2 * hi + b) / w1, hi];
}

export function MlpOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [net, setNet] = useState<Mlp2>(MLP_SOLUTION);
  const [step, setStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  useAutoLoop(step, LAST_STEP, setStep, visible, reducedMotion, autoPlay, 1100, 1400);

  const hits = mlpHits(net, POINTS);
  const set = (layer: Layer, i: number, v: number) => {
    setNet((prev) => ({ ...prev, [layer]: prev[layer].map((w, j) => (j === i ? v : w)) as Neuron2 }));
    setStep(0);
  };

  const phaseCopy = [
    'Las entradas x e y empiezan neutrales: todavía no se muestra ninguna salida de la red.',
    'La primera neurona oculta combina x e y y aplica su activación sigmoide.',
    'La segunda neurona oculta calcula otra activación; juntas construyen una representación útil para XOR.',
    'La neurona de salida combina ambas activaciones y asigna una clase a cada punto.',
  ][step];

  return (
    <OvaFrame
      title="Dos neuronas ocultas resuelven XOR"
      hint="Sigue el paso de las entradas por las dos neuronas ocultas hasta la salida. Al final, el relleno muestra la predicción y el borde conserva la clase real; el ciclo vuelve a empezar desde puntos neutrales. Ajusta pesos y sesgos para ver cómo cambia la red."
      controls={LAYERS.map((layer) => (
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
      readoutLive="off"
      readout={
        <>
          <span>Propagación: <b>{step} de {LAST_STEP}</b></span>
          <span>{phaseCopy}</span>
          {step === LAST_STEP && <span>Aciertos: <b>{hits} de {POINTS.length}</b></span>}
        </>
      }
    >
      <div ref={stageRef}>
        <svg
          viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
          role="img"
          aria-label={`Propagación por una red MLP para XOR, etapa ${step} de ${LAST_STEP}${step === LAST_STEP ? `, ${hits} aciertos de ${POINTS.length}` : ''}`}
        >
          {step >= LAST_STEP && Array.from({ length: CELLS * CELLS }, (_, c) => {
            const x = -0.25 + (c % CELLS) * CELL;
            const y = -0.25 + Math.floor(c / CELLS) * CELL;
            const prediction = mlpForward(net, { x: x + CELL / 2, y: y + CELL / 2 }).y;
            return (
              <rect
                key={c}
                className="mlx-mlp-cell"
                x={PLOT.sx(x)}
                y={PLOT.sy(y + CELL)}
                width={PLOT.sx(x + CELL) - PLOT.sx(x)}
                height={PLOT.sy(y) - PLOT.sy(y + CELL)}
                fill={prediction >= 0.5 ? OVA_COLORS.class1 : OVA_COLORS.class0}
                fillOpacity={0.08 + 0.22 * Math.abs(prediction - 0.5) * 2}
              />
            );
          })}
          {(['h1', 'h2'] as const).map((id, index) => {
            if (step < index + 1) return null;
            const line = neuronLine(net[id]);
            return line && (
              <line
                key={id}
                className="mlx-mlp-neuron-line"
                x1={PLOT.sx(line[0])}
                y1={PLOT.sy(line[1])}
                x2={PLOT.sx(line[2])}
                y2={PLOT.sy(line[3])}
                stroke={index === 0 ? OVA_COLORS.accent : '#c084fc'}
                strokeWidth={2}
                strokeDasharray={index === 0 ? '6 4' : '2 4'}
              />
            );
          })}
          {POINTS.map((p, i) => {
            const { h, y } = mlpForward(net, p);
            const predicted = y >= 0.5 ? 1 : 0;
            const wrong = predicted !== p.label;
            const fill = step === 0
              ? OVA_COLORS.axis
              : step === 1
                ? OVA_COLORS.accent
                : step === 2
                  ? h[1] >= 0.5 ? '#c084fc' : OVA_COLORS.accent
                  : predicted ? OVA_COLORS.class1 : OVA_COLORS.class0;
            const opacity = step === 0 ? 0.72 : step === 1 ? 0.35 + h[0] * 0.65 : step === 2 ? 0.35 + Math.max(h[0], h[1]) * 0.65 : 1;
            return (
              <circle
                key={i}
                className="mlx-mlp-point"
                cx={PLOT.sx(p.x)}
                cy={PLOT.sy(p.y)}
                r={6}
                fill={fill}
                fillOpacity={opacity}
                stroke={step === LAST_STEP ? wrong ? OVA_COLORS.risk : p.label ? OVA_COLORS.class1 : OVA_COLORS.class0 : '#d9d9e8'}
                strokeWidth={step === LAST_STEP && wrong ? 3 : 1.5}
              />
            );
          })}
          <text x={PLOT.sx(1.25)} y={PLOT.height - 4} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>x →</text>
          <text x={PLOT.sx(-0.25)} y={14} fontSize={11} fill={OVA_COLORS.axis}>↑ y</text>
        </svg>
      </div>
    </OvaFrame>
  );
}
