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
  useAutoLoop(step, last, setStep, visible, reducedMotion, autoPlay, CNN_STEP_MS, 900);

  const reset = (next: number) => {
    setKernelIndex(next);
    setStep(0);
  };

  const active = map.flat().filter((v) => v > 0).length;

  return (
    <OvaFrame
      title="Un filtro de 3×3 recorre la imagen"
      hint="El 7 comienza en tono neutro. El filtro recorre la imagen posición por posición y cada suma, tras ReLU, colorea una casilla del mapa de activación: el filtro vertical detecta bordes izquierdos y el horizontal el borde superior de la barra. Al completar la convolución, max pooling resume cada bloque de 2×2. El recorrido vuelve a empezar automáticamente."
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
            imagen 8×8
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
                fill={step > 0 ? (v ? '#e8e8f0' : 'rgba(85, 170, 255, 0.12)') : 'rgba(85, 170, 255, 0.12)'}
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
                    fillOpacity={shown && v > 0 ? 0.3 + v / 4.5 : 1}
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
                      fillOpacity={v > 0 ? 0.3 + v / 4.5 : 1}
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
        </svg>
      </div>
    </OvaFrame>
  );
}
