import { G } from '../Gloss';
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
// Partición fija: los mismos ejemplos mantienen su función al mover los ajustes.
const TRAIN = AE_NORMAL.slice(0, 24);
const CALIBRATION = AE_NORMAL.slice(24, 32);
const CHECK = AE_NORMAL.slice(32);
export function aeExperiment(k: number, percentile: number) {
  const model = fitLinearAutoencoder(TRAIN, k);
  const calibration = CALIBRATION.map(r => reconstructionError(model, r)).sort((a, b) => a - b);
  const position = (calibration.length - 1) * percentile / 100;
  const lo = Math.floor(position), hi = Math.ceil(position);
  const threshold = calibration[lo] + (calibration[hi] - calibration[lo]) * (position - lo);
  return { model, threshold, normal: CHECK.map(r => reconstructionError(model, r)), fraud: AE_FRAUD.map(r => reconstructionError(model, r)) };
}
/** Contorno del color del panel: la etiqueta se lee aunque roce una barra o una línea. */
const HALO = { stroke: '#0a0a2e', strokeWidth: 3, paintOrder: 'stroke' } as const;
const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const fmt = (e: number) => (e < ZERO ? '0' : e < 0.1 ? e.toFixed(3) : e.toFixed(2));

export function AutoencoderOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [k, setK] = useState(AE_START_K);
  const [percentile, setPercentile] = useState(95);
  const [showFinal, setShowFinal] = useState(false);
  const [frame, setStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  const step = showFinal ? AE_LAST_STEP : frame;
  const playback = useAutoLoop(frame, AE_LAST_STEP, setStep, visible && !showFinal, reducedMotion, autoPlay && !showFinal, 1050, 5000);
  const { normal, fraud, threshold, model } = useMemo(() => aeExperiment(k, percentile), [k, percentile]);
  const falseAlarms = normal.filter(e => e > threshold + ZERO).length;
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
  // «mayor error ▼» va anclada por la derecha: el ▼ queda sobre la barra y el texto nunca sale del svg.
  const worstX = Math.min(W - 1, LEFT + worst * barW + barW / 2 + 4);

  return (
    <OvaFrame
      playback={showFinal ? undefined : playback}
      readoutLive={playback.playing && !showFinal ? 'off' : 'polite'}
      explanation={['Entrenamos con 24 compras normales; otras 8 calibran el umbral y 8 se reservan para comprobar alarmas.', `El codificador comprime las seis medidas en ${k} valores.`, 'El decodificador reconstruye la entrada. El umbral usa solo los errores de las 8 compras de calibración, que no entrenaron el modelo.', 'Comparamos compras normales y fraudes de ejemplo. Superar el umbral indica una anomalía; por sí solo no demuestra fraude.'][step]}
      title="Comprimir y decidir cuándo lanzar una alarma"
      hint="Activa «Mostrar resultado final». Compara k=1, 2 y 6 con percentil 95 fijo; luego conserva k=2 y cambia el percentil. El cuello cambia la reconstrucción; el percentil mueve la línea de alarma sin cambiar los pesos."
      controls={<>
        <div className="mlx-parameter-set" role="group" aria-label="Ajustes del autoencoder">
          <strong>Modelo y regla de alarma</strong>
          <div className="mlx-parameter-fields">
            <div className="mlx-parameter-field">
              <OvaSlider label="Tamaño del cuello (k)" value={k} {...AE_BOTTLENECK} onChange={value => { setK(value); playback.restart(); }} />
              <p>Un <G k="cuelloBotella">cuello</G> menor comprime más. Aquí k=6 permite copiar las seis medidas, incluso las anómalas.</p>
            </div>
            <div className="mlx-parameter-field">
              <OvaSlider label="Percentil de calibración" value={percentile} min={80} max={99} step={1} onChange={value => { setPercentile(value); playback.restart(); }} />
              <p>El <G k="aeCalibracion">percentil</G> elige el umbral. Subirlo nunca aumenta las alarmas con el modelo fijo, pero puede dejar pasar anomalías.</p>
            </div>
          </div>
          <output aria-label="Configuración elegida">6 → {k} → 6 · percentil {percentile} · umbral {fmt(threshold)}</output>
        </div>
        <label><input type="checkbox" checked={showFinal} onChange={e => { setShowFinal(e.target.checked); playback.restart(); }} /> Mostrar resultado final</label>
        <button type="button" onClick={() => { setK(AE_START_K); setPercentile(95); setShowFinal(false); playback.restart(); }}>Restablecer ejemplo</button>
        <details className="mlx-parameter-notes"><summary>Datos y límites de esta demostración</summary>
          <p>24 normales entrenan, 8 distintas calibran y 8 distintas comprueban falsas alarmas; se añaden 3 fraudes simulados conocidos. Las particiones no cambian al mover los controles.</p>
          <p>Solución lineal exacta mediante PCA, con centrado aprendido solo en entrenamiento. No simula épocas, tasa, regularización ni activaciones no lineales. La velocidad es un <G k="controlDidactico">control de visualización</G>.</p>
          <p>Con solo 8 casos de calibración, el percentil usa interpolación lineal; no garantiza esa proporción de normales sin alarma en datos nuevos. Explorar estos mismos ejemplos no mide generalización.</p>
        </details>
      </>}
      readout={
        <>
          <span>
            {step === 0 ? 'Datos neutrales: el autoencoder aún no separa los patrones.' : <>Error medio de comprobación: normales <b>{fmt(mean(normal))}</b> · fraudes <b>{fmt(mean(fraud))}</b></>}
          </span>
          <span>
            {step >= 2 ? <>Umbral: <b>{fmt(threshold)}</b></> : 'El umbral se calibra con 8 normales ajenas al entrenamiento.'}
          </span>
          <span>
            {step >= 3 ? <>Fraudes señalados: <b>{detected} de {fraud.length}</b></> : 'Las compras raras aparecen al final del ciclo.'}
          </span>
          {step >= 3 && <span>Falsas alarmas: <b>{falseAlarms} de {normal.length}</b> normales de comprobación.</span>}
          {k === AE_BOTTLENECK.max && <span>Sin cuello de botella: reconstruye todo sin error y no detecta nada.</span>}
        </>
      }
    >
      <div ref={stageRef} className="mlx-ae-viz">
      <NetworkDiagram
        layers={networkLayers}
        connections={networkConnections}
        label={`Autoencoder: seis medidas pasan por un cuello de botella de ${k} neuronas y se reconstruyen. ${step >= 3 ? 'Se muestra un fraude.' : 'Se muestra una compra normal.'}`}
      />
      <svg className="mlx-ae-error-plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={step === 0 ? 'Compras neutrales antes de mostrar sus errores de reconstrucción' : `Errores de reconstrucción de 8 compras normales de comprobación y 3 fraudes con un cuello de botella de ${k}; ${detected} fraudes por encima del umbral`}>
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
              stroke={revealed && e > threshold + ZERO && step >= 3 ? "white" : "none"}
              strokeWidth={1}
            />
          );
        })}
        {step >= 3 && errors[worst] > ZERO && (
          <text x={worstX} y={yOf(errors[worst]) - 5} textAnchor="end" fontSize={11} fill={OVA_COLORS.risk} {...HALO}>
            mayor error ▼
          </text>
        )}
        {step >= 2 && <line className="mlx-ae-threshold" x1={LEFT - 2} x2={W} y1={yOf(threshold)} y2={yOf(threshold)} stroke={OVA_COLORS.accent} strokeWidth={1.5} strokeDasharray="5 4" />}
        {step >= 2 && <text x={LEFT + 2} y={yOf(threshold) - 5} fontSize={10} fill={OVA_COLORS.accent} {...HALO}>
          umbral
        </text>}
        <text x={LEFT} y={H - 4} fontSize={10} fill={OVA_COLORS.axis}>
          8 normales de comprobación
        </text>
        <text x={W - 2} y={H - 4} textAnchor="end" fontSize={10} fill={OVA_COLORS.risk}>
          3 fraudes
        </text>
      </svg>
      <p className="mlx-ae-axis-note">Error MSE en escala logarítmica: cada marca multiplica por 10. Errores ≤ 0.0001 se dibujan en la base.</p>
      </div>
    </OvaFrame>
  );
}
