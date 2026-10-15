import { useId, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { OVA_COLORS, OvaFrame } from './OvaFrame';
import { LR_INITIAL as INITIAL, LR_OUTLIERS as OUTLIERS } from './datasets';
import { fitLine, mse, type Pt } from './ovaMath';
import { createPlot } from './plot';
import { clientToSvg, useSvgDrag } from './useSvgDrag';
import { useInViewport, usePrefersReducedMotion } from './useMotion';
import { useAutoLoop } from './useAutoLoop';

// 30 px por unidad en ambos ejes (300/10 y 240/8): así los cuadrados de
// error se ven cuadrados de verdad.
const PLOT = createPlot(360, 300, 30, [0, 10], [0, 8]);
const MAX_POINTS = 20;
const FIT_STEPS = 8;
const BASELINE_LINE = fitLine(INITIAL);
const BASELINE_MSE = mse(INITIAL, BASELINE_LINE);

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const toData = (p: Pt): Pt => ({ x: clamp(PLOT.ix(p.x), 0, 10), y: clamp(PLOT.iy(p.y), 0, 8) });
// Redondeo a centésimas para que 0.1 + 0.2 no se vea como 0.30000000000000004.
const round2 = (v: number) => Math.round(v * 100) / 100;
const fmt = (v: number) => String(round2(v));

/** Flechas: ±0.1; con Shift, ±0.5. Devuelve null si la tecla no mueve el punto. */
function nudge(p: Pt, key: string, shift: boolean): Pt | null {
  const step = shift ? 0.5 : 0.1;
  const delta: Record<string, [number, number]> = {
    ArrowUp: [0, step],
    ArrowDown: [0, -step],
    ArrowRight: [step, 0],
    ArrowLeft: [-step, 0],
  };
  const d = delta[key];
  if (!d) return null;
  return { x: round2(clamp(p.x + d[0], 0, 10)), y: round2(clamp(p.y + d[1], 0, 8)) };
}

export function LinearRegressionOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [points, setPoints] = useState<Pt[]>(INITIAL);
  const [showSquares, setShowSquares] = useState(true);
  const [step, setStep] = useState(0);
  const [outlierCount, setOutlierCount] = useState(0);
  const [lastOutlierIndex, setLastOutlierIndex] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  const playback = useAutoLoop(step, FIT_STEPS, setStep, visible, reducedMotion, autoPlay, 500, 5000);
  const clipId = useId();
  const full = points.length >= MAX_POINTS;
  const fitted = fitLine(points);
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const progress = step / FIT_STEPS;
  // OLS tiene solución cerrada: esta interpolación muestra el paso visual
  // desde la recta horizontal de referencia hasta la solución exacta.
  const line = step === 0
    ? { b0: meanY, b1: 0 }
    : { b0: meanY + (fitted.b0 - meanY) * progress, b1: fitted.b1 * progress };
  const error = mse(points, line);
  const predict = (x: number) => line.b0 + line.b1 * x;
  const updatePoints = (next: (prev: Pt[]) => Pt[]) => {
    setPoints(next);
    setStep(0);
  };

  const { svgRef, begin, svgProps } = useSvgDrag<number>((i, p) =>
    updatePoints((prev) => prev.map((pt, j) => (j === i ? toData(p) : pt))),
  );

  function addPoint(e: MouseEvent<SVGRectElement>) {
    if (!svgRef.current || full) return;
    const p = toData(clientToSvg(svgRef.current, e.clientX, e.clientY));
    setLastOutlierIndex(null);
    updatePoints((prev) => [...prev, p]);
  }

  function addOutlier() {
    if (full) return;
    const outlier = OUTLIERS[outlierCount % OUTLIERS.length];
    setLastOutlierIndex(points.length);
    setOutlierCount((count) => count + 1);
    updatePoints((prev) => [...prev, outlier]);
  }

  function resetPoints() {
    setPoints(INITIAL);
    setOutlierCount(0);
    setLastOutlierIndex(null);
    setStep(0);
  }

  function onPointKey(i: number, e: KeyboardEvent<SVGCircleElement>) {
    const moved = nudge(points[i], e.key, e.shiftKey);
    if (!moved) return;
    e.preventDefault();
    updatePoints((prev) => prev.map((pt, j) => (j === i ? moved : pt)));
  }

  const inner = { x: PLOT.pad, y: PLOT.pad, width: PLOT.width - 2 * PLOT.pad, height: PLOT.height - 2 * PLOT.pad };

  return (
    <OvaFrame
      playback={playback}
      explanation={step === 0 ? 'Partimos de una recta horizontal que predice el precio promedio.' : step === FIT_STEPS ? 'Esta es la solución de mínimos cuadrados: minimiza el promedio de los errores al cuadrado. Añade un valor atípico para ver cuánto cambia.' : 'La recta se acerca visualmente a la solución calculada. Cada segmento une un precio observado con el que predice la recta; su longitud es el error.'}
      title="La recta que menos se equivoca"
      hint={
        'En este simulador calculamos directamente la solución de mínimos cuadrados. La animación revela cómo la recta horizontal de referencia se transforma en esa solución y cómo quedan los residuos. Al terminar puedes revisar el resultado o reproducirlo de nuevo. Los puntos sobre la recta se colorean según el signo de su residuo, no son clases.'
      }
      controls={
        <>
          <label>
            <input type="checkbox" checked={showSquares} onChange={(e) => setShowSquares(e.target.checked)} /> Mostrar
            los errores al cuadrado
          </label>
          <button
            type="button"
            onClick={addOutlier}
            disabled={full}
          >
            {outlierCount === 0 ? 'Añadir un outlier' : 'Añadir otro outlier'}
          </button>
          {points.length > INITIAL.length && (
            <button type="button" onClick={resetPoints}>Restablecer puntos</button>
          )}
        </>
      }
      readout={
        <>
          <span>Visualización: <b>{step === 0 ? 'referencia' : step === FIT_STEPS ? 'ajuste óptimo' : `ajuste ${step} de ${FIT_STEPS}`}</b></span>
          <span>
            Recta:{' '}
            <b>
              ŷ = {line.b0.toFixed(2)} {line.b1 < 0 ? '−' : '+'} {Math.abs(line.b1).toFixed(2)}·x
            </b>
          </span>
          <span>
            MSE: <b>{error.toFixed(2)}</b>
          </span>
          {full && (
            <span>
              <b>Máximo 20 puntos.</b>
            </span>
          )}
          {outlierCount > 0 && (
            <div className="mlx-linear-impact">
              <strong>Impacto de los outliers</strong>
              <span>
                Pendiente óptima: <b>{BASELINE_LINE.b1.toFixed(2)}</b> → <b>{fitted.b1.toFixed(2)}</b>
              </span>
              <span>
                MSE óptimo: <b>{BASELINE_MSE.toFixed(2)}</b> → <b>{mse(points, fitted).toFixed(2)}</b>
              </span>
              {lastOutlierIndex !== null && (
                <span>
                  Último outlier: área <b>{fmt(points[lastOutlierIndex].x)}</b> · precio{' '}
                  <b>{fmt(points[lastOutlierIndex].y)}</b>
                </span>
              )}
            </div>
          )}
          <span>
            Los puntos naranjas quedan sobre la recta y los azules debajo; el color solo indica el signo del residuo. Cada cuadrado amarillo representa un residuo al cuadrado y la solución final minimiza su promedio. Añade varios outliers y compara cómo su posición cambia la recta.
          </span>
        </>
      }
    >
      <div ref={stageRef}>
      <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} {...svgProps} role="group" aria-label="Puntos y recta de mínimos cuadrados">
        <defs>
          <clipPath id={clipId}>
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
          <g clipPath={`url(#${clipId})`}>
            {showSquares && step > 0 &&
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
                    fillOpacity={i === lastOutlierIndex ? 0.22 : 0.1}
                    stroke={OVA_COLORS.class1}
                    strokeOpacity={i === lastOutlierIndex ? 0.75 : 0.32}
                  />
                );
              })}
            {step > 0 && points.map((p, i) => (
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
              className="mlx-linear-fit"
              x1={PLOT.sx(0)}
              y1={PLOT.sy(predict(0))}
              x2={PLOT.sx(10)}
              y2={PLOT.sy(predict(10))}
              stroke={OVA_COLORS.accent}
              strokeWidth={2.5}
              opacity={step === 0 ? 0 : 1}
            />
          </g>
        </g>
        {points.map((p, i) => (
          <g key={`pt${i}`}>
            {i === lastOutlierIndex && (
              <>
                <circle
                  className="mlx-linear-outlier-halo"
                  cx={PLOT.sx(p.x)}
                  cy={PLOT.sy(p.y)}
                  r={11}
                  fill="none"
                  stroke={OVA_COLORS.risk}
                  strokeWidth={2}
                  pointerEvents="none"
                />
                <text
                  className="mlx-linear-outlier-label"
                  x={PLOT.sx(p.x)}
                  y={PLOT.sy(p.y) - 14}
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  nuevo outlier
                </text>
              </>
            )}
            <circle
              className="mlx-linear-point is-draggable"
              cx={PLOT.sx(p.x)}
              cy={PLOT.sy(p.y)}
              r={7}
              fill={step === 0 ? OVA_COLORS.axis : p.y >= predict(p.x) ? OVA_COLORS.class1 : OVA_COLORS.class0}
              stroke={step === 0 ? '#d9d9e8' : OVA_COLORS.axis}
              strokeWidth={1.5}
              tabIndex={0}
              role="button"
              aria-roledescription="punto movible"
              aria-label={`Punto ${i + 1}: ${fmt(p.x)}, ${fmt(p.y)}`}
              onPointerDown={begin(i)}
              onKeyDown={(e) => onPointKey(i, e)}
            />
          </g>
        ))}
      </svg>
      </div>
    </OvaFrame>
  );
}
