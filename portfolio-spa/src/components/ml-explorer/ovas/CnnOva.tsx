import { useMemo, useRef, useState } from 'react';
import { CNN_IMAGE as IMAGE, CNN_KERNELS as KERNELS } from './datasets';
import { OVA_COLORS, OvaFrame } from './OvaFrame';
import { conv2d, maxPool2, relu } from './ovaMath';
import { useInViewport, usePrefersReducedMotion } from './useMotion';
import { useAutoLoop } from './useAutoLoop';

/** Tiempo entre posiciones al reproducir. */
export const CNN_STEP_MS = 350;
const C = 22; // lado de cada casilla en px
const MAP = 6; // el mapa es de 6×6
const LAST = MAP * MAP - 1;
// Cada muestra resume varias ventanas recorridas y conserva el cierre de toda la convolución.
const SCAN_CHECKPOINTS = Array.from({ length: 12 }, (_, i) => i * 3).concat(LAST);
const MAP_X = 8 * C + 40; // el mapa va a la derecha de la imagen
const POOL_Y = MAP * C + 40; // y el pooling, debajo del mapa

function Matrix3({ label, values, kind }: { label: string; values: number[]; kind: 'pixels' | 'weights' | 'products' }) {
  return (
    <div className={`mlx-cnn-matrix is-${kind}`}>
      <span>{label}</span>
      <div>
        {values.map((value, index) => <b
          key={index}
          className={value > 0 ? 'is-positive' : value < 0 ? 'is-negative' : ''}
          style={kind === 'pixels' && value > 0 ? { background: `rgba(232, 232, 240, ${0.12 + 0.88 * value / 16})`, color: value >= 8 ? '#040320' : '#e8e8f0' } : undefined}
        >{value}</b>)}
      </div>
    </div>
  );
}

export function CnnOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [kernelIndex, setKernelIndex] = useState(0);
  // 0 is neutral; representative windows reveal the scanned prefix; the last stage shows pooling.
  const [step, setStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();

  const kernel = KERNELS[kernelIndex].kernel;
  const raw = useMemo(() => conv2d(IMAGE, kernel), [kernel]);
  const map = useMemo(() => relu(raw), [raw]);
  const pooled = useMemo(() => maxPool2(map), [map]);
  const last = SCAN_CHECKPOINTS.length + 1;
  const done = step === last;
  const scanning = step > 0 && step <= SCAN_CHECKPOINTS.length;
  const pos = SCAN_CHECKPOINTS[Math.min(Math.max(step - 1, 0), SCAN_CHECKPOINTS.length - 1)];
  const row = Math.floor(pos / MAP);
  const col = pos % MAP;
  const windowPixels = kernel.flatMap((kernelRow, kernelRowIndex) => kernelRow.map((_, kernelColIndex) => IMAGE[row + kernelRowIndex][col + kernelColIndex]));
  const kernelWeights = kernel.flat();
  const products = windowPixels.map((pixel, index) => pixel * kernelWeights[index]);
  const playback = useAutoLoop(step, last, setStep, visible, reducedMotion, autoPlay, CNN_STEP_MS, 5000);

  const reset = (next: number) => {
    setKernelIndex(next);
    setStep(0);
  };

  const active = map.flat().filter((v) => v > 0).length;
  const maxPixel = Math.max(...IMAGE.flat(), 1);
  const maxActivation = Math.max(...map.flat(), 1);
  const filterMeaning = kernelIndex === 0
    ? 'Compara la columna derecha con la izquierda; responde cuando el brillo cambia de lado.'
    : 'Compara la fila inferior con la superior; responde cuando el brillo cambia de arriba abajo.';
  const progressLabel = step === 0
    ? 'Imagen original'
    : done
      ? 'Max pooling · 6×6 → 3×3'
      : <>Ventana <b>{pos + 1}</b> de <b>{LAST + 1}</b> · salida ({row + 1}, {col + 1})</>;

  return (
    <OvaFrame
      playback={playback}
      progressLabel={progressLabel}
      explanation={step === 0 ? 'La imagen tiene 8×8 píxeles. Un filtro de 3×3 producirá una salida de 6×6 porque solo se coloca donde caben sus nueve pesos.' : done ? 'El mapa está completo. Cada marco reúne un bloque 2×2; max pooling conserva su valor mayor y reduce 6×6 a 3×3.' : `Esta ventana produce la casilla (${row + 1}, ${col + 1}) del mapa. La suma es ${raw[row][col]} y ReLU aplica max(0, ${raw[row][col]}), por eso la salida es ${map[row][col]}.`}
      title="Un filtro de 3×3 recorre la imagen"
      hint="Lee de izquierda a derecha: la ventana toma nueve píxeles, los multiplica por los nueve pesos del filtro y guarda una suma en la casilla señalada del mapa. ReLU convierte las sumas negativas en cero. Al final, max pooling conserva el máximo de cada bloque 2×2."
      controls={
        <>
          <div role="group" aria-label="Filtro">
            <span>Filtro: </span>
            {KERNELS.map((k, i) => (
              <button key={k.id} type="button" aria-pressed={kernelIndex === i} onClick={() => reset(i)}>
                {k.label}
              </button>
            ))}
          </div>
          <p className="mlx-cnn-filter-help"><b>{KERNELS[kernelIndex].label}:</b> {filterMeaning}</p>
        </>
      }
      readoutLive="off"
      readout={
        <>
          <span>
            {step === 0 ? <>Entrada: <b>neutra</b></> : done ? <>Convolución: <b>completa</b></> : <>Muestra <b>{step}</b> de <b>{SCAN_CHECKPOINTS.length}</b> · ventana {pos + 1} de {LAST + 1} (fila {row + 1}, columna {col + 1})</>}
          </span>
          {step > 0 && <span>
            {done ? 'Última suma de productos' : 'Suma de productos'}: <b>{raw[row][col]}</b> → tras ReLU: <b>{map[row][col]}</b>
          </span>}
          {scanning && (
            <div className="mlx-cnn-equation" aria-label={`Cálculo de la salida ${row + 1}, ${col + 1}: suma ${raw[row][col]}, tras ReLU ${map[row][col]}`}>
              <strong>Por qué esta casilla vale {map[row][col]}</strong>
              <div className="mlx-cnn-equation-row">
                <Matrix3 label="Píxeles" values={windowPixels} kind="pixels" />
                <span aria-hidden="true">×</span>
                <Matrix3 label="Pesos" values={kernelWeights} kind="weights" />
                <span aria-hidden="true">=</span>
                <Matrix3 label="Productos" values={products} kind="products" />
              </div>
              <span className="mlx-cnn-equation-result">Σ productos = <b>{raw[row][col]}</b> · ReLU = max(0, {raw[row][col]}) = <b>{map[row][col]}</b></span>
            </div>
          )}
          {done && (
            <span>
              Mapa completo: <b>{active}</b> de 36 casillas se encienden. Tras el pooling queda de 3×3.
            </span>
          )}
        </>
      }
    >
      <div ref={stageRef}>
        <svg
          viewBox={`0 0 ${MAP_X + MAP * C + 4} ${POOL_Y + 3 * C + 24}`}
          role="img"
          aria-label={`Imagen 8×8${scanning ? ` con el filtro en la fila ${row + 1}, columna ${col + 1}` : ''}; mapa de activación de 6×6 con ${done ? LAST + 1 : scanning ? pos + 1 : 0} posiciones recorridas`}
        >
          <text x={0} y={12} fontSize={11} fill={OVA_COLORS.axis}>
            dígito manuscrito 8×8
          </text>
          {IMAGE.flatMap((r, i) =>
            r.map((v, j) => (
              <rect
                key={`i${i}-${j}`}
                x={j * C}
                y={20 + i * C}
                width={C - 1}
                height={C - 1}
                className="mlx-cnn-input"
                fill={v > 0 ? '#e8e8f0' : 'rgba(85, 170, 255, 0.12)'}
                fillOpacity={v > 0 ? 0.12 + 0.88 * v / maxPixel : 1}
              />
            )),
          )}
          {scanning && <rect
            className="mlx-cnn-window"
            style={{ transform: `translate(${col * C - 1}px, ${20 + row * C - 1}px)` }}
            width={3 * C + 1}
            height={3 * C + 1}
            fill="none"
            stroke={OVA_COLORS.accent}
            strokeWidth={3}
          />}
          <text x={MAP_X} y={12} fontSize={11} fill={OVA_COLORS.axis}>
            mapa de activación 6×6
          </text>
          {map.flatMap((r, i) =>
            r.map((v, j) => {
              const k = i * MAP + j;
              const shown = done || (scanning && k <= pos);
              return (
                <g key={`m${i}-${j}`} className="mlx-cnn-cell">
                  <rect
                    x={MAP_X + j * C}
                    y={20 + i * C}
                    width={C - 1}
                    height={C - 1}
                    fill={shown && v > 0 ? OVA_COLORS.class1 : 'rgba(85, 170, 255, 0.12)'}
                    fillOpacity={shown && v > 0 ? 0.22 + 0.78 * v / maxActivation : 1}
                    stroke={scanning && k === pos ? OVA_COLORS.accent : 'none'}
                    strokeWidth={2}
                  />
                  {shown && (
                    <text x={MAP_X + j * C + C / 2} y={20 + i * C + C / 2 + 4} textAnchor="middle" fontSize={11} fill="#e8e8f0">
                      {v}
                    </text>
                  )}
                </g>
              );
            }),
          )}
          {done && Array.from({ length: 9 }, (_, index) => {
            const poolRow = Math.floor(index / 3);
            const poolCol = index % 3;
            return <rect
              key={`pool-block-${index}`}
              className="mlx-cnn-pool-block"
              x={MAP_X + poolCol * 2 * C - 1}
              y={20 + poolRow * 2 * C - 1}
              width={2 * C}
              height={2 * C}
              fill="none"
            />;
          })}
          {done && (
            <>
              <text x={MAP_X} y={POOL_Y + 8} fontSize={11} fill={OVA_COLORS.axis}>
                max pooling 2×2 → 3×3
              </text>
              {pooled.flatMap((r, i) =>
                r.map((v, j) => (
                  <g key={`p${i}-${j}`} className="mlx-cnn-pool">
                    <rect
                      x={MAP_X + j * C}
                      y={POOL_Y + 14 + i * C}
                      width={C - 1}
                      height={C - 1}
                      fill={v > 0 ? OVA_COLORS.class1 : 'rgba(85, 170, 255, 0.12)'}
                      fillOpacity={v > 0 ? 0.22 + 0.78 * v / maxActivation : 1}
                    />
                    <text x={MAP_X + j * C + C / 2} y={POOL_Y + 14 + i * C + C / 2 + 4} textAnchor="middle" fontSize={11} fill="#e8e8f0">
                      {v}
                    </text>
                  </g>
                )),
              )}
            </>
          )}
          <text x={0} y={20 + 8 * C + 16} fontSize={11} fill={OVA_COLORS.axis}>
            filtro: {kernel.map((r) => `[${r.join(' ')}]`).join(' ')}
          </text>
          {scanning && kernel.flatMap((kernelRow, kernelRowIndex) => kernelRow.map((weight, kernelColIndex) => {
            const inputRow = row + kernelRowIndex;
            const inputCol = col + kernelColIndex;
            return <line
              key={`connection-${inputRow}-${inputCol}`}
              className={`mlx-cnn-connection${weight > 0 ? ' is-positive' : weight < 0 ? ' is-negative' : ' is-neutral'}`}
              x1={inputCol * C + C / 2}
              y1={20 + inputRow * C + C / 2}
              x2={MAP_X + col * C + C / 2}
              y2={20 + row * C + C / 2}
              opacity={weight === 0 ? 0.25 : 0.72}
            />;
          }))}
          {scanning && <circle
            className="mlx-cnn-neuron-target"
            cx={MAP_X + col * C + C / 2}
            cy={20 + row * C + C / 2}
            r={9}
          />}
        </svg>
      </div>
    </OvaFrame>
  );
}
