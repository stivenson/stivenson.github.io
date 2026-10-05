import { useState } from 'react';
import { RNN_INPUTS, RNN_START, RNN_STEPS, RNN_U, RNN_W } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { rnnInfluence } from './ovaMath';

const W = 360;
const H = 220;
const TOP = 16;
const BOTTOM = 190;
/** Escala logarítmica del eje y: de 1e-8 (abajo) a 1 (arriba). */
const LOG_MIN = -8;
/** Altura del muñón con que se dibujan las barras que bajan del piso (para que no desaparezcan). */
const STUB = 4;
const yOf = (g: number) => TOP + (Math.max(LOG_MIN, Math.log10(g)) / LOG_MIN) * (BOTTOM - TOP);

/** «0.024» si es legible con 3 decimales; si no, notación científica: «6.2e-6». */
export function formatInfluence(g: number): string {
  return g >= 0.001 ? g.toFixed(3) : g.toExponential(1);
}

/** Por debajo de esto, «1 en N» sería una cadena gigante: se dice «prácticamente nula». */
export const ONE_IN_MIN = 1e-7;

/** «1 en 41», «1 en 4 900»: el inverso con 2 cifras significativas y espacio de miles. */
export function oneIn(g: number): string {
  if (g < ONE_IN_MIN) return 'prácticamente nula: menos de 1 en 10 millones';
  const n = Number((1 / g).toPrecision(2));
  return `1 en ${n.toLocaleString('en-US', { maximumFractionDigits: 0 }).replace(/,/g, ' ')}`;
}

export function RnnOva() {
  const [w, setW] = useState<number>(RNN_START.w);
  const [steps, setSteps] = useState<number>(RNN_START.steps);
  const g = rnnInfluence(RNN_INPUTS.slice(0, steps), w, RNN_U);
  const barW = (W - 40) / RNN_STEPS.max;
  const below = g.filter((v) => v < 10 ** LOG_MIN).length;

  return (
    <OvaFrame
      title="La memoria de una RNN se desvanece"
      hint="La red lee las mediciones una por una (x₁, x₂, …) y actualiza su memoria con h = tanh(w·h + 0.5·x). Cada barra dice cuánto cambiaría la salida final si cambiara esa medición: es el factor por el que se multiplica el gradiente que le llega en el entrenamiento. El eje es logarítmico: cada raya hacia abajo es 10 veces menos, y las barras que bajan de 1e-8 quedan cortadas en el piso. Alarga la secuencia y mira cómo se encoge la barra de x₁; baja w y se encoge más rápido. Aun con w = 1 se encoge, porque tanh′ es menor que 1."
      controls={
        <>
          <OvaSlider label="Pasos de la secuencia" value={steps} {...RNN_STEPS} onChange={setSteps} />
          <OvaSlider label="w (peso de la memoria)" value={w} {...RNN_W} onChange={(v) => setW(Math.round(v * 10) / 10)} format={(v) => v.toFixed(1)} />
          <button
            type="button"
            onClick={() => {
              setW(RNN_START.w);
              setSteps(RNN_START.steps);
            }}
          >
            Restablecer
          </button>
        </>
      }
      readout={
        <>
          <span>
            Influencia de x₁ en la salida: <b>{formatInfluence(g[0])}</b> ({oneIn(g[0])})
          </span>
          <span>
            Influencia de x<sub>{steps}</sub>, la última: <b>{formatInfluence(g[steps - 1])}</b>
          </span>
          {below > 0 && (
            <span>
              {below === 1
                ? '1 barra baja de 1e-8 y se dibuja cortada en el piso'
                : `${below} barras bajan de 1e-8 y se dibujan cortadas en el piso`}
            </span>
          )}
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Influencia de cada una de las ${steps} mediciones en la salida final, en escala logarítmica: x₁ influye ${formatInfluence(g[0])}, la última ${formatInfluence(g[steps - 1])}`}>
        {Array.from({ length: -LOG_MIN + 1 }, (_, i) => (
          <g key={i}>
            <line x1={34} x2={W} y1={yOf(10 ** -i)} y2={yOf(10 ** -i)} stroke={OVA_COLORS.grid} />
            <text x={30} y={yOf(10 ** -i) + 4} textAnchor="end" fontSize={10} fill={OVA_COLORS.axis}>
              {i === 0 ? '1' : `1e-${i}`}
            </text>
          </g>
        ))}
        <text x={30} y={BOTTOM + 14} textAnchor="end" fontSize={10} fill={OVA_COLORS.axis}>
          {'< 1e-8'}
        </text>
        {g.map((v, t) => {
          // Bajo el piso: un muñón corto y semitransparente que cuelga bajo la línea de 1e-8.
          const floor = v < 10 ** LOG_MIN;
          return (
            <rect
              key={t}
              className={floor ? 'mlx-rnn-bar is-floor' : 'mlx-rnn-bar'}
              x={36 + t * barW}
              y={floor ? BOTTOM : yOf(v)}
              width={barW - 2}
              height={floor ? STUB : BOTTOM - yOf(v)}
              fill={t === 0 ? OVA_COLORS.risk : OVA_COLORS.class0}
              opacity={floor ? 0.45 : 1}
            />
          );
        })}
        <text x={36} y={H - 8} fontSize={11} fill={OVA_COLORS.axis}>
          x₁
        </text>
        <text x={36 + steps * barW} y={H - 8} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
          x{steps} (la última) →
        </text>
      </svg>
    </OvaFrame>
  );
}
