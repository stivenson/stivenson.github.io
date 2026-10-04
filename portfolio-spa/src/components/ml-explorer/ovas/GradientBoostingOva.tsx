import { useMemo, useState } from 'react';
import { GB_MAX_STEPS, GB_RATES, GB_XS as XS, GB_YS as YS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { boost, boostMse, predictBoost } from './ovaMath';
import { createPlot } from './plot';

const PLOT = createPlot(360, 260, 30, [0, 10], [0, 8]);
const START_RATE = 0.3;

export function GradientBoostingOva() {
  const [steps, setSteps] = useState(0);
  const [rate, setRate] = useState<number>(START_RATE);
  const model = useMemo(() => boost(XS, YS, GB_MAX_STEPS, rate), [rate]);
  const mse = boostMse(model, XS, YS, steps);

  const curve = Array.from({ length: 201 }, (_, i) => {
    const x = i / 20;
    return `${i === 0 ? 'M' : 'L'}${PLOT.sx(x).toFixed(1)},${PLOT.sy(predictBoost(model, x, steps)).toFixed(1)}`;
  }).join(' ');

  return (
    <OvaFrame
      title="Cada árbol corrige al anterior"
      hint="Suma árboles uno por uno. Con 0 árboles el modelo predice el promedio; cada árbol nuevo es un solo corte que mira los errores que quedan (las líneas rosas) y corrige una fracción de ellos: la tasa de aprendizaje. Con tasa pequeña avanza despacio; con tasa 1, en pocos pasos ya persigue cada punto. El error que ves es sobre estos mismos puntos: llevarlo a casi 0 no es mérito, es memorizar."
      controls={
        <>
          <OvaSlider label="Árboles sumados" value={steps} min={0} max={GB_MAX_STEPS} step={1} onChange={setSteps} />
          <div role="group" aria-label="Tasa de aprendizaje">
            <span>Tasa de aprendizaje: </span>
            {GB_RATES.map((r) => (
              <button key={r} type="button" aria-pressed={rate === r} onClick={() => setRate(r)}>
                {r}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setSteps(0);
              setRate(START_RATE);
            }}
          >
            Restablecer
          </button>
        </>
      }
      readout={
        <span>
          Con <b>{steps}</b> {steps === 1 ? 'árbol' : 'árboles'} y tasa <b>{rate}</b>: error cuadrático medio{' '}
          <b>{mse.toFixed(2)}</b>
        </span>
      }
    >
      <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} role="img" aria-label="Puntos, la predicción en escalones y los errores que quedan">
        <text x={PLOT.sx(10)} y={PLOT.height - 8} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
          x →
        </text>
        {XS.map((x, i) => (
          <line
            key={`r${i}`}
            x1={PLOT.sx(x)}
            y1={PLOT.sy(YS[i])}
            x2={PLOT.sx(x)}
            y2={PLOT.sy(predictBoost(model, x, steps))}
            stroke={OVA_COLORS.risk}
            strokeWidth={1.5}
          />
        ))}
        <path d={curve} fill="none" stroke={OVA_COLORS.accent} strokeWidth={2.5} />
        {XS.map((x, i) => (
          <circle key={i} cx={PLOT.sx(x)} cy={PLOT.sy(YS[i])} r={5} fill={OVA_COLORS.class0} stroke="#040320" strokeWidth={1.5} />
        ))}
      </svg>
    </OvaFrame>
  );
}
