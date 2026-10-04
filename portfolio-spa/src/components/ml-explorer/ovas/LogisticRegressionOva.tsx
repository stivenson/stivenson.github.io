import { useState } from 'react';
import { LOGISTIC_B0 as B0, LOGISTIC_B1 as B1, LOGISTIC_XS as XS, LOGISTIC_YS as YS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { fitLogistic1D, logit, sigmoid, snap } from './ovaMath';
import { createPlot } from './plot';

const PLOT = createPlot(360, 260, 30, [0, 10], [-0.1, 1.1]);

const EXAMPLE_X = 4;

/** Formatea con el signo menos tipográfico «−» (U+2212), el mismo del operador. */
const signed = (v: number, digits: number) => v.toFixed(digits).replace('-', '−');

export function LogisticRegressionOva() {
  const [b0, setB0] = useState(-4);
  const [b1, setB1] = useState(1);
  const [threshold, setThreshold] = useState(0.5);

  const prob = (x: number) => sigmoid(b0 + b1 * x);
  const predicted = (x: number) => (prob(x) >= threshold ? 1 : 0);
  const hits = XS.filter((x, i) => predicted(x) === YS[i]).length;
  const boundary = b1 !== 0 ? (logit(threshold) - b0) / b1 : null;

  const curve = Array.from({ length: 101 }, (_, i) => {
    const x = i / 10;
    return `${i === 0 ? 'M' : 'L'}${PLOT.sx(x).toFixed(1)},${PLOT.sy(prob(x)).toFixed(1)}`;
  }).join(' ');

  function bestFit() {
    const fit = fitLogistic1D(XS, YS);
    setB0(snap(fit.b0, B0));
    setB1(snap(fit.b1, B1));
    setThreshold(0.5);
  }

  const z = b0 + b1 * EXAMPLE_X;

  return (
    <OvaFrame
      title="De un puntaje a una probabilidad"
      hint="Mueve b₀ y b₁ para deformar la curva y el umbral para decidir desde qué probabilidad se marca spam. Los círculos con borde rosa están mal clasificados; ningún ajuste los acierta todos."
      controls={
        <>
          <OvaSlider label="b₀ (desplaza)" value={b0} {...B0} onChange={setB0} format={(v) => v.toFixed(1)} />
          <OvaSlider label="b₁ (inclina)" value={b1} {...B1} onChange={setB1} format={(v) => v.toFixed(2)} />
          <OvaSlider
            label="Umbral"
            value={threshold}
            min={0.05}
            max={0.95}
            step={0.05}
            onChange={setThreshold}
            format={(v) => v.toFixed(2)}
          />
          <button type="button" onClick={bestFit}>
            Mejor ajuste (método de Newton)
          </button>
        </>
      }
      readout={
        <>
          <span>
            Con x = {EXAMPLE_X}: z = {signed(b0, 1)} {b1 < 0 ? '−' : '+'} {Math.abs(b1).toFixed(2)}·{EXAMPLE_X} ={' '}
            <b>{signed(z, 2)}</b> → P(spam) = <b>{(sigmoid(z) * 100).toFixed(1)} %</b>
          </span>
          <span>
            Aciertos: <b>{hits} de {XS.length}</b> correos
          </span>
        </>
      }
    >
      <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} role="img" aria-label="Curva sigmoide sobre correos normales y spam">
        {[0, 0.5, 1].map((y) => (
          <g key={y}>
            <line x1={PLOT.sx(0)} x2={PLOT.sx(10)} y1={PLOT.sy(y)} y2={PLOT.sy(y)} stroke={OVA_COLORS.grid} />
            <text x={PLOT.sx(0) - 6} y={PLOT.sy(y) + 4} textAnchor="end" fontSize={10} fill={OVA_COLORS.axis}>
              {y}
            </text>
          </g>
        ))}
        <text x={PLOT.sx(10)} y={PLOT.height - 6} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
          veces que dice «gratis» →
        </text>
        <line
          x1={PLOT.sx(0)}
          x2={PLOT.sx(10)}
          y1={PLOT.sy(threshold)}
          y2={PLOT.sy(threshold)}
          stroke={OVA_COLORS.axis}
          strokeDasharray="5 4"
        />
        {boundary !== null && boundary >= 0 && boundary <= 10 && (
          <g>
            <line
              x1={PLOT.sx(boundary)}
              x2={PLOT.sx(boundary)}
              y1={PLOT.sy(-0.1)}
              y2={PLOT.sy(1.1)}
              stroke={OVA_COLORS.accent}
              strokeDasharray="5 4"
            />
            <text
              x={PLOT.sx(boundary) + (boundary > 8 ? -4 : 4)}
              y={PLOT.sy(1.05)}
              textAnchor={boundary > 8 ? 'end' : 'start'}
              fontSize={10} fill={OVA_COLORS.accent}>
              frontera
            </text>
          </g>
        )}
        <path d={curve} fill="none" stroke={OVA_COLORS.accent} strokeWidth={2.5} />
        {XS.map((x, i) => {
          const y = YS[i] + (i % 2 ? 0.04 : -0.04);
          const wrong = predicted(x) !== YS[i];
          return (
            <circle
              key={i}
              cx={PLOT.sx(x)}
              cy={PLOT.sy(y)}
              r={6}
              fill={YS[i] ? OVA_COLORS.class1 : OVA_COLORS.class0}
              stroke={wrong ? OVA_COLORS.risk : '#040320'}
              strokeWidth={wrong ? 3 : 1.5}
            />
          );
        })}
      </svg>
    </OvaFrame>
  );
}
