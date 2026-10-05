import { useEffect, useMemo, useRef, useState } from 'react';
import { CNN_IMAGE as IMAGE, CNN_KERNELS as KERNELS } from './datasets';
import { OVA_COLORS, OvaFrame } from './OvaFrame';
import { conv2d, maxPool2, relu } from './ovaMath';
import { useInViewport, usePrefersReducedMotion } from './useMotion';

/** Tiempo entre posiciones al reproducir. */
export const CNN_STEP_MS = 500;
const C = 22; // lado de cada casilla en px
const MAP = 6; // el mapa es de 6×6
const LAST = MAP * MAP - 1;
const MAP_X = 8 * C + 40; // el mapa va a la derecha de la imagen
const POOL_Y = MAP * C + 40; // y el pooling, debajo del mapa

export function CnnOva() {
  const [kernelIndex, setKernelIndex] = useState(0);
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();

  const kernel = KERNELS[kernelIndex].kernel;
  const raw = useMemo(() => conv2d(IMAGE, kernel), [kernel]);
  const map = useMemo(() => relu(raw), [raw]);
  const pooled = useMemo(() => maxPool2(map), [map]);
  const row = Math.floor(pos / MAP);
  const col = pos % MAP;
  const done = pos >= LAST;

  // Avanza una posición cada CNN_STEP_MS, solo mientras la OVA está en pantalla.
  useEffect(() => {
    if (!playing || !visible) return;
    if (done) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setPos((p) => p + 1), CNN_STEP_MS);
    return () => window.clearTimeout(id);
  }, [playing, visible, done, pos]);

  const reset = (next = kernelIndex) => {
    setKernelIndex(next);
    setPos(0);
    setPlaying(false);
  };

  const togglePlay = () => {
    if (playing) return setPlaying(false);
    // Con «reducir movimiento», nada de animación: salta al mapa completo.
    if (reducedMotion) return setPos(LAST);
    if (done) setPos(0);
    setPlaying(true);
  };

  const active = map.flat().filter((v) => v > 0).length;

  return (
    <OvaFrame
      title="Un filtro de 3×3 recorre la imagen"
      hint="La imagen es un «7» de 8×8 píxeles (1 = tinta). El recuadro verde de borde grueso es el filtro: en cada posición multiplica sus 9 pesos por los 9 píxeles que cubre y suma. Ese número, con los negativos llevados a 0 (ReLU), llena una casilla del mapa de activación de 6×6. Pulsa «Paso» o «Reproducir» y fíjate dónde se enciende el mapa: el filtro vertical responde al borde izquierdo de cada trazo y el horizontal al borde de arriba de la barra. Al final, el max pooling resume cada bloque de 2×2 del mapa con su máximo."
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
          <div role="group" aria-label="Recorrido">
            <button type="button" disabled={done} onClick={() => setPos((p) => p + 1)}>
              Paso ▸
            </button>
            <button type="button" aria-pressed={playing} onClick={togglePlay}>
              {playing ? '⏸ Pausar' : '▶ Reproducir'}
            </button>
            <button type="button" onClick={() => reset(0)}>
              Restablecer
            </button>
          </div>
        </>
      }
      readoutLive={playing ? 'off' : 'polite'}
      readout={
        <>
          <span>
            Posición <b>{pos + 1}</b> de <b>{LAST + 1}</b> (fila {row + 1}, columna {col + 1})
          </span>
          <span>
            Suma de productos: <b>{raw[row][col]}</b> → tras ReLU: <b>{map[row][col]}</b>
          </span>
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
          aria-label={`Imagen de 8×8 con el filtro de 3×3 en la fila ${row + 1}, columna ${col + 1}, y el mapa de activación de 6×6 con ${pos + 1} casillas calculadas`}
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
                fill={v ? '#e8e8f0' : 'rgba(85, 170, 255, 0.12)'}
              />
            )),
          )}
          <rect
            className="mlx-cnn-window"
            style={{ transform: `translate(${col * C - 1}px, ${20 + row * C - 1}px)` }}
            width={3 * C + 1}
            height={3 * C + 1}
            fill="none"
            stroke={OVA_COLORS.accent}
            strokeWidth={3}
          />
          <text x={MAP_X} y={12} fontSize={11} fill={OVA_COLORS.axis}>
            mapa de activación 6×6
          </text>
          {map.flatMap((r, i) =>
            r.map((v, j) => {
              const k = i * MAP + j;
              const shown = k <= pos;
              return (
                <g key={`m${i}-${j}`} className="mlx-cnn-cell">
                  <rect
                    x={MAP_X + j * C}
                    y={20 + i * C}
                    width={C - 1}
                    height={C - 1}
                    fill={shown && v > 0 ? OVA_COLORS.class1 : 'rgba(85, 170, 255, 0.12)'}
                    fillOpacity={shown && v > 0 ? 0.3 + v / 4.5 : 1}
                    stroke={k === pos ? OVA_COLORS.accent : 'none'}
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
