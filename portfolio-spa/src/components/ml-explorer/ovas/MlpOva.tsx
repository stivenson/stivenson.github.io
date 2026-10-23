import { G } from '../Gloss';
import { useRef, useState } from 'react';
import { MLP_BIAS, MLP_SOLUTION, MLP_WEIGHT, XOR_POINTS as POINTS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { mlpForward, mlpHits, type Mlp2, type Neuron2, type MlpActivation } from './ovaMath';
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
  const [hiddenActivation, setHiddenActivation] = useState<MlpActivation>('logistic');
  const [showFinal, setShowFinal] = useState(false);
  const [step, setStep] = useState(0);
  const [traceCase, setTraceCase] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  const phase = showFinal ? LAST_STEP : step;
  const reference = hiddenActivation === 'logistic' && JSON.stringify(net) === JSON.stringify(MLP_SOLUTION);
  const h1Meaning = reference ? ' «al menos una»' : '';
  const h2Meaning = reference ? ' «no ambas»' : '';
  const playback = useAutoLoop(step, LAST_STEP, setStep, visible && !showFinal, reducedMotion, autoPlay && !showFinal, 1100, 5000);

  const hits = mlpHits(net, POINTS, hiddenActivation);
  const tracedCase = TRACE_CASES[traceCase];
  const networkPoint = POINTS[tracedCase.pointIndex];
  const networkTrace = mlpForward(net, networkPoint, hiddenActivation);
  const tracedPrediction = networkTrace.y >= 0.5 ? 1 : 0;
  const activation = (value: number) => hiddenActivation === 'logistic' ? value >= .5 ? 'activa' : 'inactiva' : value > 0 ? 'salida positiva' : value < 0 ? 'salida negativa' : 'salida cero';
  const brightness = (value: number) => .35 + .65 * Math.min(1, Math.abs(value));
  const networkLayers: NetworkDiagramLayer[] = [
    {
      label: 'Entradas', color: '#55aaff',
      nodes: [
        { label: 'x', value: networkPoint.x, valueText: networkPoint.x.toFixed(2), active: phase >= 1 },
        { label: 'y', value: networkPoint.y, valueText: networkPoint.y.toFixed(2), active: phase >= 1 },
      ],
    },
    {
      label: 'Capa oculta', color: '#c084fc',
      nodes: [
        { label: 'h₁', value: networkTrace.h[0], valueText: networkTrace.h[0].toFixed(2), active: phase >= 1 },
        { label: 'h₂', value: networkTrace.h[1], valueText: networkTrace.h[1].toFixed(2), active: phase >= 2 },
      ],
    },
    {
      label: 'Salida', color: '#ffb454',
      nodes: [{ label: 'ŷ', value: networkTrace.y, valueText: networkTrace.y.toFixed(2), active: phase >= 3 }],
    },
  ];
  const networkConnections: NetworkDiagramConnection[] = [
    ...(['h1', 'h2'] as const).flatMap((layer, hiddenIndex) => [0, 1].map((inputIndex) => ({
      fromLayer: 0,
      fromNode: inputIndex,
      toLayer: 1,
      toNode: hiddenIndex,
      weight: net[layer][inputIndex],
      active: phase >= hiddenIndex + 1,
    }))),
    ...[0, 1].map((hiddenIndex) => ({
      fromLayer: 1,
      fromNode: hiddenIndex,
      toLayer: 2,
      toNode: 0,
      weight: net.out[hiddenIndex],
      active: phase >= 3,
    })),
  ];
  const set = (layer: Layer, i: number, v: number) => {
    setNet((prev) => ({ ...prev, [layer]: prev[layer].map((w, j) => (j === i ? v : w)) as Neuron2 }));
    setStep(0);
  };

  const phaseCopy = [
    `Seguiremos el caso ${tracedCase.corner}: x = ${networkPoint.x.toFixed(2)}, y = ${networkPoint.y.toFixed(2)} y clase real ${networkPoint.label}.`,
    `h₁ = ${networkTrace.h[0].toFixed(2)} (${activation(networkTrace.h[0])}). ${reference ? 'En el ejemplo inicial, aproxima «¿al menos una entrada es alta?».' : 'La activación elegida transforma la suma de pesos y sesgo; este valor no es una probabilidad de clase.'}`,
    `h₂ = ${networkTrace.h[1].toFixed(2)} (${activation(networkTrace.h[1])}). ${reference ? 'En el ejemplo inicial, aproxima «¿no están ambas entradas altas?».' : 'Su valor depende de la activación y de los pesos elegidos.'}`,
    `La salida combina h₁ y h₂: ŷ = ${networkTrace.y.toFixed(2)}. Con el umbral 0.50 predice la clase ${tracedPrediction}. ${reference ? 'En el ejemplo inicial combina los dos cortes para resolver XOR.' : 'Cambiar la activación con pesos fijos no equivale a reentrenar la red.'}`,
  ][phase];

  const progressLabel = [
    'Entrada · elegir un caso',
    reference ? 'h₁ · ¿al menos una?' : `h₁ · ${hiddenActivation}`,
    reference ? 'h₂ · ¿no ambas?' : `h₂ · ${hiddenActivation}`,
    `Salida · clase ${tracedPrediction}`,
  ][phase];

  return (
    <OvaFrame
      playback={showFinal ? undefined : playback}
      progressLabel={progressLabel}
      explanation={phaseCopy}
      title="Una red de dos neuronas ocultas para XOR"
      hint="Esta red muestra una propagación con pesos de ejemplo; la OVA no los entrena. Sigue un caso, compara activaciones o explora los nueve pesos y sesgos manualmente. En el plano, el relleno es la predicción y el borde conserva la clase real. El recorrido revela entrada, neuronas ocultas y salida: no cuenta épocas ni actualizaciones de entrenamiento."
      controls={
        <>
          <div className="mlx-parameter-set" role="group" aria-label="Hiperparámetro de activación MLP">
            <strong>Qué transformación hace cada neurona oculta</strong>
            <div className="mlx-parameter-fields"><div className="mlx-parameter-field">
              <label>Activación oculta (activation)<select aria-label="Activación oculta (activation)" value={hiddenActivation} onChange={e => { setHiddenActivation(e.target.value as MlpActivation); setStep(0); }}>
                <option value="logistic">Logistic: sigmoide entre 0 y 1</option><option value="tanh">Tanh: entre −1 y 1</option><option value="relu">ReLU: cero o valor positivo</option><option value="identity">Identity: sin transformación</option>
              </select></label>
              <p>La <G k="funcionActivacion">función de activación</G> es un hiperparámetro real. Aquí cambia ambas neuronas ocultas; la salida sigue usando sigmoide.</p>
            </div></div>
            <output>Arquitectura fija 2 → 2 → 1 · activation={hiddenActivation} · salida logística · umbral 0.50</output>
          </div>
          <p>Se conservan los mismos pesos al cambiar la activación. Esto compara cálculos; no compara redes reentrenadas con cada activación.</p>
          <label><input type="checkbox" checked={showFinal} onChange={e => { setShowFinal(e.target.checked); playback.restart(); }} /> Mostrar salida completa</label>
          <button type="button" onClick={() => { setNet(MLP_SOLUTION); setHiddenActivation('logistic'); setTraceCase(0); setShowFinal(false); playback.restart(); }}>Restablecer ejemplo XOR</button>
          <details className="mlx-parameter-notes mlx-mlp-manual"><summary>Explorar pesos y sesgos manualmente</summary>
            <p>Los <G k="parametroAprendido">pesos y sesgos</G> se aprenden al entrenar. Aquí los editas como experimento para entender su efecto; estos deslizadores no son hiperparámetros ni ejecutan entrenamiento.</p>
            <div className="mlx-parameter-set" role="group" aria-label="Pesos manuales del ejemplo">
              <strong>Nueve valores de la red de ejemplo</strong>
              <div className="mlx-parameter-fields">{LAYERS.map(layer => (
                <div key={layer.id} role="group" aria-label={layer.label} className="mlx-parameter-field">
                  <strong>{layer.name}</strong>
                  {[0,1,2].map(i => <OvaSlider key={i} label={`${layer.name} · ${i < 2 ? layer.inputs[i] : 'sesgo'}`} value={net[layer.id][i]} {...(i < 2 ? MLP_WEIGHT : MLP_BIAS)} onChange={v => set(layer.id,i,v)} />)}
                </div>
              ))}</div>
            </div>
          </details>
          <details className="mlx-parameter-notes mlx-mlp-manual"><summary>Qué está fijo y qué significa el recorrido</summary>
            <p>Una capa oculta de dos neuronas, dos entradas, una salida y 20 puntos XOR simulados. No hay optimizador, tasa, lotes ni épocas en esta OVA: Python sí entrena y compara ajustes.</p>
            <p>Elegir un caso y cambiar velocidad son <G k="controlDidactico">controles de visualización</G>. Los aciertos son sobre estos mismos puntos de demostración; no evalúan datos nuevos ni calibran la salida.</p>
            <p>Las rectas indican dónde la suma previa a la activación vale cero. Las etiquetas «al menos una» y «no ambas» describen solo el ejemplo inicial con sigmoide. ReLU e identity no están limitadas a 0–1; el brillo se limita para dibujarlas y el número conserva su valor real.</p>
          </details>
        </>
      }
      readoutLive={playback.playing && !showFinal ? 'off' : 'polite'}
      readout={
        <>
          <span>Caso seguido: <b>{tracedCase.corner}</b> · clase real <b>{networkPoint.label}</b></span>
          {phase >= 1 && <span>h₁{h1Meaning}: <b>{networkTrace.h[0].toFixed(2)}</b> · {activation(networkTrace.h[0])}</span>}
          {phase >= 2 && <span>h₂{h2Meaning}: <b>{networkTrace.h[1].toFixed(2)}</b> · {activation(networkTrace.h[1])}</span>}
          {phase >= 3 && <span>ŷ = <b>{networkTrace.y.toFixed(2)}</b> · predicción <b>clase {tracedPrediction}</b></span>}
          {phase === LAST_STEP && <span>Aciertos en la demostración: <b>{hits} de {POINTS.length}</b></span>}
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
          label={`Red neuronal MLP de entradas x e y, dos neuronas ocultas y una de salida. Entrada x ${networkPoint.x.toFixed(2)}, y ${networkPoint.y.toFixed(2)}. Propagación: ${phase} de ${LAST_STEP}.`}
          showWeightLegend
        />
        <div className="mlx-mlp-map">
          <div className="mlx-mlp-map-head">
            <strong>{reference ? 'Cómo dos rectas construyen XOR' : 'Cómo cambia la respuesta de esta red'}</strong>
            <div className="mlx-mlp-boundary-key" aria-label="Cortes visibles en el plano">
              {phase >= 1 && <span className="is-h1"><i />h₁{h1Meaning}</span>}
              {phase >= 2 && <span className="is-h2"><i />h₂{h2Meaning}</span>}
              {phase >= 3 && <span className="is-output"><i />salida combinada</span>}
            </div>
          </div>
          <svg
            viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
            role="img"
            aria-label={`Propagación por una red MLP para XOR, etapa ${phase} de ${LAST_STEP}. Caso seguido ${tracedCase.corner}, clase real ${networkPoint.label}${phase === LAST_STEP ? `, predicción ${tracedPrediction}, ${hits} aciertos de ${POINTS.length}` : ''}`}
          >
          {phase >= LAST_STEP && Array.from({ length: CELLS * CELLS }, (_, c) => {
            const x = -0.25 + (c % CELLS) * CELL;
            const y = -0.25 + Math.floor(c / CELLS) * CELL;
            const prediction = mlpForward(net, { x: x + CELL / 2, y: y + CELL / 2 }, hiddenActivation).y;
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
            if (phase < index + 1) return null;
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
            const { h, y } = mlpForward(net, p, hiddenActivation);
            const predicted = y >= 0.5 ? 1 : 0;
            const wrong = predicted !== p.label;
            const fill = phase === 0
              ? OVA_COLORS.axis
              : phase === 1
                ? OVA_COLORS.accent
                : phase === 2
                  ? h[1] >= (hiddenActivation === 'logistic' ? .5 : 0) ? '#c084fc' : OVA_COLORS.accent
                  : predicted ? OVA_COLORS.class1 : OVA_COLORS.class0;
            const opacity = phase === 0 ? 0.72 : phase === 1 ? brightness(h[0]) : phase === 2 ? Math.max(brightness(h[0]), brightness(h[1])) : 1;
            return (
              <circle
                key={i}
                className="mlx-mlp-point"
                cx={PLOT.sx(p.x)}
                cy={PLOT.sy(p.y)}
                r={6}
                fill={fill}
                fillOpacity={opacity}
                stroke={phase === LAST_STEP ? wrong ? OVA_COLORS.risk : p.label ? OVA_COLORS.class1 : OVA_COLORS.class0 : '#d9d9e8'}
                strokeWidth={phase === LAST_STEP && wrong ? 3 : 1.5}
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
