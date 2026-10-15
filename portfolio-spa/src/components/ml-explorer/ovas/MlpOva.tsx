import { useRef, useState } from 'react';
import { MLP_BIAS, MLP_SOLUTION, MLP_WEIGHT, XOR_POINTS as POINTS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { mlpForward, mlpHits, type Mlp2, type Neuron2 } from './ovaMath';
import { createPlot } from './plot';
import { NetworkDiagram, type NetworkDiagramConnection, type NetworkDiagramLayer } from './NetworkDiagram';
import { useAutoLoop } from './useAutoLoop';
import { useInViewport, usePrefersReducedMotion } from './useMotion';

const PLOT = createPlot(320, 320, 20, [-0.25, 1.25], [-0.25, 1.25]);
const CELLS = 20;
const CELL = 1.5 / CELLS;
const LAST_STEP = 3;

const TRACE_CASES = [
  { pointIndex: 0, corner: '(0, 0)', description: 'ambas bajas' },
  { pointIndex: 10, corner: '(0, 1)', description: 'solo y alta' },
  { pointIndex: 15, corner: '(1, 0)', description: 'solo x alta' },
  { pointIndex: 5, corner: '(1, 1)', description: 'ambas altas' },
] as const;

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
  const [traceCase, setTraceCase] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  const playback = useAutoLoop(step, LAST_STEP, setStep, visible, reducedMotion, autoPlay, 1100, 5000);

  const hits = mlpHits(net, POINTS);
  const tracedCase = TRACE_CASES[traceCase];
  const networkPoint = POINTS[tracedCase.pointIndex];
  const networkTrace = mlpForward(net, networkPoint);
  const tracedPrediction = networkTrace.y >= 0.5 ? 1 : 0;
  const activation = (value: number) => value >= 0.5 ? 'activa' : 'inactiva';
  const networkLayers: NetworkDiagramLayer[] = [
    {
      label: 'Entradas', color: '#55aaff',
      nodes: [
        { label: 'x', value: networkPoint.x, valueText: networkPoint.x.toFixed(2), active: step >= 1 },
        { label: 'y', value: networkPoint.y, valueText: networkPoint.y.toFixed(2), active: step >= 1 },
      ],
    },
    {
      label: 'Capa oculta', color: '#c084fc',
      nodes: [
        { label: 'h₁', value: networkTrace.h[0], valueText: networkTrace.h[0].toFixed(2), active: step >= 1 },
        { label: 'h₂', value: networkTrace.h[1], valueText: networkTrace.h[1].toFixed(2), active: step >= 2 },
      ],
    },
    {
      label: 'Salida', color: '#ffb454',
      nodes: [{ label: 'ŷ', value: networkTrace.y, valueText: networkTrace.y.toFixed(2), active: step >= 3 }],
    },
  ];
  const networkConnections: NetworkDiagramConnection[] = [
    ...(['h1', 'h2'] as const).flatMap((layer, hiddenIndex) => [0, 1].map((inputIndex) => ({
      fromLayer: 0,
      fromNode: inputIndex,
      toLayer: 1,
      toNode: hiddenIndex,
      weight: net[layer][inputIndex],
      active: step >= hiddenIndex + 1,
    }))),
    ...[0, 1].map((hiddenIndex) => ({
      fromLayer: 1,
      fromNode: hiddenIndex,
      toLayer: 2,
      toNode: 0,
      weight: net.out[hiddenIndex],
      active: step >= 3,
    })),
  ];
  const set = (layer: Layer, i: number, v: number) => {
    setNet((prev) => ({ ...prev, [layer]: prev[layer].map((w, j) => (j === i ? v : w)) as Neuron2 }));
    setStep(0);
  };

  const phaseCopy = [
    `Seguiremos el caso ${tracedCase.corner}: x = ${networkPoint.x.toFixed(2)}, y = ${networkPoint.y.toFixed(2)} y clase real ${networkPoint.label}.`,
    `h₁ = ${networkTrace.h[0].toFixed(2)} (${activation(networkTrace.h[0])}). En esta solución, h₁ aproxima la pregunta «¿al menos una entrada es alta?».`,
    `h₂ = ${networkTrace.h[1].toFixed(2)} (${activation(networkTrace.h[1])}). h₂ aproxima «¿no están ambas entradas altas?». Cada neurona aporta un corte lineal distinto.`,
    `La salida combina h₁ y h₂: ŷ = ${networkTrace.y.toFixed(2)}. Con el umbral 0.50 predice la clase ${tracedPrediction}; así une dos cortes lineales en una frontera no lineal.`,
  ][step];

  const progressLabel = [
    'Entrada · elegir un caso',
    'h₁ · ¿al menos una?',
    'h₂ · ¿no ambas?',
    `Salida · clase ${tracedPrediction}`,
  ][step];

  return (
    <OvaFrame
      playback={playback}
      progressLabel={progressLabel}
      controlsCollapsed
      explanation={phaseCopy}
      title="Dos neuronas ocultas resuelven XOR"
      hint="Elige una esquina de XOR y sigue sus valores por la red. Cada neurona oculta aprende un corte lineal distinto; la salida combina ambos cortes para formar una frontera que ya no es una sola recta. En el plano, el relleno es la predicción, el borde conserva la clase real y el anillo blanco marca el caso seguido."
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
          <span>Caso seguido: <b>{tracedCase.corner}</b> · clase real <b>{networkPoint.label}</b></span>
          {step >= 1 && <span>h₁ «al menos una»: <b>{networkTrace.h[0].toFixed(2)}</b> · {activation(networkTrace.h[0])}</span>}
          {step >= 2 && <span>h₂ «no ambas»: <b>{networkTrace.h[1].toFixed(2)}</b> · {activation(networkTrace.h[1])}</span>}
          {step >= 3 && <span>ŷ = <b>{networkTrace.y.toFixed(2)}</b> · predicción <b>clase {tracedPrediction}</b></span>}
          {step === LAST_STEP && <span>Aciertos: <b>{hits} de {POINTS.length}</b></span>}
        </>
      }
    >
      <div ref={stageRef} className="mlx-mlp-viz">
        <div className="mlx-mlp-trace-picker" role="group" aria-label="Caso que sigue la red">
          <div>
            <strong>Elige un caso para seguirlo</strong>
            <span>La clase XOR vale 1 cuando solo una entrada está alta.</span>
          </div>
          <div className="mlx-mlp-trace-options">
            {TRACE_CASES.map((item, index) => (
              <button
                key={item.corner}
                type="button"
                aria-pressed={traceCase === index}
                onClick={() => setTraceCase(index)}
                aria-label={`Esquina ${item.corner}: ${item.description}, clase ${POINTS[item.pointIndex].label}`}
              >
                <b>{item.corner}</b>
                <small>→ clase {POINTS[item.pointIndex].label}</small>
              </button>
            ))}
          </div>
        </div>
        <NetworkDiagram
          layers={networkLayers}
          connections={networkConnections}
          label={`Red neuronal MLP de entradas x e y, dos neuronas ocultas y una de salida. Entrada x ${networkPoint.x.toFixed(2)}, y ${networkPoint.y.toFixed(2)}. Propagación: ${step} de ${LAST_STEP}.`}
          showWeightLegend
        />
        <div className="mlx-mlp-map">
          <div className="mlx-mlp-map-head">
            <strong>Cómo dos rectas construyen XOR</strong>
            <div className="mlx-mlp-boundary-key" aria-label="Cortes visibles en el plano">
              {step >= 1 && <span className="is-h1"><i />h₁: al menos una</span>}
              {step >= 2 && <span className="is-h2"><i />h₂: no ambas</span>}
              {step >= 3 && <span className="is-output"><i />salida combinada</span>}
            </div>
          </div>
          <svg
            viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
            role="img"
            aria-label={`Propagación por una red MLP para XOR, etapa ${step} de ${LAST_STEP}. Caso seguido ${tracedCase.corner}, clase real ${networkPoint.label}${step === LAST_STEP ? `, predicción ${tracedPrediction}, ${hits} aciertos de ${POINTS.length}` : ''}`}
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
          <circle
            className="mlx-mlp-traced-ring"
            cx={PLOT.sx(networkPoint.x)}
            cy={PLOT.sy(networkPoint.y)}
            r={10}
            fill="none"
            aria-label={`Caso seguido ${tracedCase.corner}`}
          />
          <text x={PLOT.sx(1.25)} y={PLOT.height - 4} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>x →</text>
          <text x={PLOT.sx(-0.25)} y={14} fontSize={11} fill={OVA_COLORS.axis}>↑ y</text>
          </svg>
        </div>
      </div>
    </OvaFrame>
  );
}
