import { useState, type MouseEvent } from 'react';
import { OVA_COLORS, OvaFrame } from './OvaFrame';
import { LR_INITIAL as INITIAL, LR_OUTLIER as OUTLIER } from './datasets';
import { fitLine, mse, type Pt } from './ovaMath';
import { createPlot } from './plot';
import { clientToSvg, useSvgDrag } from './useSvgDrag';

// 30 px por unidad en ambos ejes (300/10 y 240/8): así los cuadrados de
// error se ven cuadrados de verdad.
const PLOT = createPlot(360, 300, 30, [0, 10], [0, 8]);
const MAX_POINTS = 20;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const toData = (p: Pt): Pt => ({ x: clamp(PLOT.ix(p.x), 0, 10), y: clamp(PLOT.iy(p.y), 0, 8) });

export function LinearRegressionOva() {
  const [points, setPoints] = useState<Pt[]>(INITIAL);
  const [showSquares, setShowSquares] = useState(true);
  const line = fitLine(points);
  const error = mse(points, line);
  const predict = (x: number) => line.b0 + line.b1 * x;

  const { svgRef, begin, svgProps } = useSvgDrag<number>((i, p) =>
    setPoints((prev) => prev.map((pt, j) => (j === i ? toData(p) : pt))),
  );

  function addPoint(e: MouseEvent<SVGRectElement>) {
    if (!svgRef.current || points.length >= MAX_POINTS) return;
    const p = toData(clientToSvg(svgRef.current, e.clientX, e.clientY));
    setPoints((prev) => [...prev, p]);
  }

  const inner = { x: PLOT.pad, y: PLOT.pad, width: PLOT.width - 2 * PLOT.pad, height: PLOT.height - 2 * PLOT.pad };

  return (
    <OvaFrame
      title="La recta que menos se equivoca"
      hint="Arrastra los puntos o toca el fondo para añadir uno. La recta se recalcula sola."
      controls={
        <>
          <label>
            <input type="checkbox" checked={showSquares} onChange={(e) => setShowSquares(e.target.checked)} /> Mostrar
            los errores al cuadrado
          </label>
          <button
            type="button"
            onClick={() => setPoints((prev) => [...prev, OUTLIER])}
            disabled={points.length >= MAX_POINTS}
          >
            Añadir un outlier
          </button>
          <button type="button" onClick={() => setPoints(INITIAL)}>
            Restablecer
          </button>
        </>
      }
      readout={
        <>
          <span>
            Recta:{' '}
            <b>
              ŷ = {line.b0.toFixed(2)} + {line.b1.toFixed(2)}·x
            </b>
          </span>
          <span>
            MSE: <b>{error.toFixed(2)}</b>
          </span>
          <span>
            Cada cuadrado amarillo es un residuo al cuadrado. La recta de mínimos cuadrados es la que deja la menor
            área amarilla promedio. Añade un outlier y mira cuánto se inclina.
          </span>
        </>
      }
    >
      <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} {...svgProps} role="img" aria-label="Puntos y recta de mínimos cuadrados">
        <defs>
          <clipPath id="mlx-lr-clip">
            <rect {...inner} />
          </clipPath>
        </defs>
        <rect {...inner} fill="transparent" onClick={addPoint} />
        <g pointerEvents="none">
          {Array.from({ length: 11 }, (_, x) => (
            <line key={`gx${x}`} x1={PLOT.sx(x)} x2={PLOT.sx(x)} y1={PLOT.sy(0)} y2={PLOT.sy(8)} stroke={OVA_COLORS.grid} />
          ))}
          {Array.from({ length: 9 }, (_, y) => (
            <line key={`gy${y}`} x1={PLOT.sx(0)} x2={PLOT.sx(10)} y1={PLOT.sy(y)} y2={PLOT.sy(y)} stroke={OVA_COLORS.grid} />
          ))}
          <text x={PLOT.sx(10)} y={PLOT.height - 8} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
            área →
          </text>
          <text x={8} y={PLOT.sy(8) - 10} fontSize={11} fill={OVA_COLORS.axis}>
            ↑ precio
          </text>
          <g clipPath="url(#mlx-lr-clip)">
            {showSquares &&
              points.map((p, i) => {
                const r = Math.abs(p.y - predict(p.x));
                const side = r * (PLOT.sx(1) - PLOT.sx(0));
                return (
                  <rect
                    key={`sq${i}`}
                    x={PLOT.sx(p.x)}
                    y={PLOT.sy(Math.max(p.y, predict(p.x)))}
                    width={side}
                    height={side}
                    fill={OVA_COLORS.class1}
                    fillOpacity={0.18}
                    stroke={OVA_COLORS.class1}
                    strokeOpacity={0.5}
                  />
                );
              })}
            {points.map((p, i) => (
              <line
                key={`res${i}`}
                x1={PLOT.sx(p.x)}
                x2={PLOT.sx(p.x)}
                y1={PLOT.sy(p.y)}
                y2={PLOT.sy(predict(p.x))}
                stroke={OVA_COLORS.risk}
                strokeDasharray="3 3"
              />
            ))}
            <line
              x1={PLOT.sx(0)}
              y1={PLOT.sy(predict(0))}
              x2={PLOT.sx(10)}
              y2={PLOT.sy(predict(10))}
              stroke={OVA_COLORS.accent}
              strokeWidth={2.5}
            />
          </g>
        </g>
        {points.map((p, i) => (
          <circle
            key={`pt${i}`}
            className="is-draggable"
            cx={PLOT.sx(p.x)}
            cy={PLOT.sy(p.y)}
            r={7}
            fill={OVA_COLORS.class0}
            stroke="#040320"
            strokeWidth={1.5}
            onPointerDown={begin(i)}
          />
        ))}
      </svg>
    </OvaFrame>
  );
}
