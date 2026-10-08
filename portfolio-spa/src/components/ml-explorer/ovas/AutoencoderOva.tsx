import { useMemo, useRef, useState } from 'react';
import { AE_BOTTLENECK, AE_FRAUD, AE_NORMAL, AE_START_K } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { fitLinearAutoencoder, reconstruct, reconstructionError } from './ovaMath';
import { NetworkDiagram, type NetworkDiagramConnection, type NetworkDiagramLayer } from './NetworkDiagram';
import { useInViewport, usePrefersReducedMotion } from './useMotion';
import { useAutoLoop } from './useAutoLoop';

const W = 360;
const H = 220;
/** Margen izquierdo: cabe la etiqueta «0.0001» del eje. */
const LEFT = 44;
/** Hueco arriba para la etiqueta «la más rara» sobre una barra que llega al tope. */
const TOP = 24;
const BOTTOM = 196;
/** Escala logarítmica: de 0.0001 (abajo) a 10 (arriba). Un error de 0 se dibuja abajo del todo. */
const [LOG_LO, LOG_HI] = [-4, 1];
const yOf = (e: number) => BOTTOM - ((Math.min(LOG_HI, Math.max(LOG_LO, Math.log10(e))) - LOG_LO) / (LOG_HI - LOG_LO)) * (BOTTOM - TOP);
/** Por debajo de esto el error es redondeo de la máquina: cuenta como 0. */
const ZERO = 1e-9;
const AE_LAST_STEP = 3;
/** Contorno del color del panel: la etiqueta se lee aunque roce una barra o una línea. */
const HALO = { stroke: '#0a0a2e', strokeWidth: 3, paintOrder: 'stroke' } as const;
const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const fmt = (e: number) => (e < ZERO ? '0' : e < 0.1 ? e.toFixed(3) : e.toFixed(2));

export function AutoencoderOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [k, setK] = useState(AE_START_K);
  const [step, setStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  useAutoLoop(step, AE_LAST_STEP, setStep, visible, reducedMotion, autoPlay, 1050, 5000);
  const { normal, fraud, threshold, model } = useMemo(() => {
    const model = fitLinearAutoencoder(AE_NORMAL, k);
    const normal = AE_NORMAL.map((r) => reconstructionError(model, r));
    return { normal, fraud: AE_FRAUD.map((r) => reconstructionError(model, r)), threshold: Math.max(...normal), model };
  }, [k]);
  const detected = fraud.filter((e) => e > threshold + ZERO).length;
  const errors = [...normal, ...fraud];
  const worst = errors.indexOf(Math.max(...errors));
  const barW = (W - LEFT - 2) / errors.length;
  const networkSample = step >= 3 ? AE_FRAUD[0] : AE_NORMAL[0];
  const code = model.components.map((component) => component.reduce((sum, weight, i) => sum + weight * (networkSample[i] - model.mean[i]), 0));
  const reconstructed = reconstruct(model, networkSample);
  const networkLayers: NetworkDiagramLayer[] = [
    {
      label: 'Entrada · 6 medidas', color: '#55aaff',
      nodes: networkSample.map((value, i) => ({ label: `x${i + 1}`, value: Math.min(1, Math.abs(value) / 4), valueText: value.toFixed(1), active: step >= 1 })),
    },
    {
      label: `Cuello · k=${k}`, color: '#c084fc',
      nodes: code.map((value, i) => ({ label: `z${i + 1}`, value: Math.min(1, Math.abs(value) / 4), valueText: value.toFixed(1), active: step >= 1 })),
    },
    {
      label: 'Reconstrucción', color: '#ffb454',
      nodes: reconstructed.map((value, i) => ({ label: `x̂${i + 1}`, value: Math.min(1, Math.abs(value) / 4), valueText: value.toFixed(1), active: step >= 2 })),
    },
  ];
  const networkConnections: NetworkDiagramConnection[] = [
    ...model.components.flatMap((component, codeIndex) => component.map((weight, inputIndex) => ({
      fromLayer: 0, fromNode: inputIndex, toLayer: 1, toNode: codeIndex, weight, active: step >= 1,
    }))),
    ...model.components.flatMap((component, codeIndex) => component.map((weight, outputIndex) => ({
      fromLayer: 1, fromNode: codeIndex, toLayer: 2, toNode: outputIndex, weight, active: step >= 2,
    }))),
  ];
  // «la más rara ▼» va anclada por la derecha: el ▼ queda sobre la barra y el texto nunca sale del svg.
  const worstX = Math.min(W - 1, LEFT + worst * barW + barW / 2 + 4);

  return (
    <OvaFrame
      title="Un cuello de botella que delata el fraude"
      hint="Arriba, seis medidas se comprimen en k neuronas y el decodificador intenta reconstruirlas. Abajo, cada barra es una compra y su altura mide el error de reconstrucción; el modelo fija el umbral con compras normales y revela las raras que reconstruye peor. Ajusta k para ver cómo un cuello demasiado ancho también copia el fraude."
      controls={
        <OvaSlider label="Cuello de botella k (de 6 medidas)" value={k} {...AE_BOTTLENECK} onChange={(value) => { setK(value); setStep(0); }} />
      }
      readout={
        <>
          <span>
            {step === 0 ? 'Datos neutrales: el autoencoder aún no separa los patrones.' : <>Error medio: normales <b>{fmt(mean(normal))}</b> · fraudes <b>{fmt(mean(fraud))}</b></>}
          </span>
          <span>
            {step >= 2 ? <>Umbral: <b>{fmt(threshold)}</b></> : 'El umbral se calcula con las compras normales.'}
          </span>
          <span>
            {step >= 3 ? <>Fraudes detectados: <b>{detected} de {fraud.length}</b></> : 'Las compras raras aparecen al final del ciclo.'}
          </span>
          {k === AE_BOTTLENECK.max && <span>Sin cuello de botella: reconstruye todo sin error y no detecta nada.</span>}
        </>
      }
    >
      <div ref={stageRef}>
      <NetworkDiagram
        layers={networkLayers}
        connections={networkConnections}
        label={`Autoencoder: seis medidas pasan por un cuello de botella de ${k} neuronas y se reconstruyen. ${step >= 3 ? 'Se muestra un fraude.' : 'Se muestra una compra normal.'}`}
      />
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={step === 0 ? 'Compras neutrales antes de mostrar sus errores de reconstrucción' : `Errores de reconstrucción de 40 compras normales y 3 fraudes con un cuello de botella de ${k}; ${detected} fraudes por encima del umbral`}>
        {Array.from({ length: LOG_HI - LOG_LO + 1 }, (_, n) => {
          const v = 10 ** (LOG_HI - n);
          return (
            <g key={n}>
              <line x1={LEFT - 2} x2={W} y1={yOf(v)} y2={yOf(v)} stroke={OVA_COLORS.grid} />
              <text x={LEFT - 6} y={yOf(v) + 4} textAnchor="end" fontSize={10} fill={OVA_COLORS.axis}>
                {v >= 1 ? v : v.toFixed(n - LOG_HI)}
              </text>
            </g>
          );
        })}
        {errors.map((e, i) => {
          const isFraud = i >= normal.length;
          const revealed = isFraud ? step >= 3 : step >= 1;
          return (
            <rect
              key={i}
              className={`mlx-ae-bar${isFraud ? ' is-fraud' : ''}`}
              x={LEFT + i * barW}
              y={revealed ? yOf(e) : BOTTOM - 3}
              width={barW - 1.5}
              height={revealed ? BOTTOM - yOf(e) : 3}
              fill={revealed ? (isFraud ? OVA_COLORS.risk : OVA_COLORS.class0) : OVA_COLORS.axis}
              fillOpacity={revealed ? 1 : 0.55}
            />
          );
        })}
        {step >= 3 && errors[worst] > ZERO && (
          <text x={worstX} y={yOf(errors[worst]) - 5} textAnchor="end" fontSize={11} fill={OVA_COLORS.risk} {...HALO}>
            la más rara ▼
          </text>
        )}
        {step >= 2 && <line className="mlx-ae-threshold" x1={LEFT - 2} x2={W} y1={yOf(threshold)} y2={yOf(threshold)} stroke={OVA_COLORS.accent} strokeWidth={1.5} strokeDasharray="5 4" />}
        {/* A la izquierda: encima de la línea solo hay barras de fraude, y esas están a la derecha. */}
        {step >= 2 && <text x={LEFT + 2} y={yOf(threshold) - 5} fontSize={10} fill={OVA_COLORS.accent} {...HALO}>
          umbral
        </text>}
        <text x={LEFT} y={H - 4} fontSize={10} fill={OVA_COLORS.axis}>
          40 compras normales
        </text>
        <text x={W - 2} y={H - 4} textAnchor="end" fontSize={10} fill={OVA_COLORS.risk}>
          3 fraudes
        </text>
      </svg>
      </div>
    </OvaFrame>
  );
}
