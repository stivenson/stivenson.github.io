import { useRef, useState } from 'react';
import { RNN_INPUTS, RNN_START, RNN_STEPS, RNN_U, RNN_W } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { rnnInfluence, rnnStates } from './ovaMath';
import { useInViewport, usePrefersReducedMotion } from './useMotion';
import { useAutoLoop } from './useAutoLoop';

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

export function RnnOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [w, setW] = useState<number>(RNN_START.w);
  const [steps, setSteps] = useState<number>(RNN_START.steps);
  const [step, setStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  useAutoLoop(step, steps, setStep, visible, reducedMotion, autoPlay, 750, 5000);
  const observed = RNN_INPUTS.slice(0, step);
  const g = observed.length ? rnnInfluence(observed, w, RNN_U) : [];
  const states = observed.length ? rnnStates(observed, w, RNN_U) : [0];
  const lastInfluence = g.length ? g[g.length - 1] : 0;
  const barW = (W - 40) / RNN_STEPS.max;
  const below = g.filter((v) => v < 10 ** LOG_MIN).length;
  const setParameter = (setter: (value: number) => void, value: number) => {
    setter(value);
    setStep(0);
  };

  return (
    <OvaFrame
      title="La memoria de una RNN se desvanece"
      hint="La animación lee las mediciones una por una y actualiza la memoria h = tanh(w·h + 0.5·x). Al inicio los datos están neutrales; cada barra aparece cuando llega su medición y luego se acorta al pasar por nuevas actualizaciones. Su altura muestra cuánto influye ese dato en el estado actual: los datos lejanos pierden fuerza porque el gradiente se multiplica paso a paso. El eje es logarítmico y las barras menores que 1e-8 se cortan en el piso. Alarga la secuencia o baja w para ver cómo se olvida más rápido."
      controls={
        <>
          <OvaSlider label="Pasos de la secuencia" value={steps} {...RNN_STEPS} onChange={(v) => setParameter(setSteps, v)} />
          <OvaSlider label="w (peso de la memoria)" value={w} {...RNN_W} onChange={(v) => setParameter(setW, Math.round(v * 10) / 10)} format={(v) => v.toFixed(1)} />
        </>
      }
      readout={
        <>
          <span>
            {step === 0 ? 'La secuencia todavía no ha comenzado.' : <>Paso leído: <b>{step}</b> de <b>{steps}</b> · entrada x<sub>{step}</sub> = <b>{observed[step - 1].toFixed(2)}</b></>}
          </span>
          {step > 0 && <span>Estado oculto h<sub>{step}</sub>: <b>{states[step].toFixed(3)}</b> · influencia de x<sub>{step}</sub>: <b>{formatInfluence(lastInfluence)}</b> ({oneIn(lastInfluence)})</span>}
          {below > 0 && step > 0 && (
            <span>
              {below === 1
                ? '1 barra baja de 1e-8 y se dibuja cortada en el piso'
                : `${below} barras bajan de 1e-8 y se dibujan cortadas en el piso`}
            </span>
          )}
        </>
      }
    >
      <div ref={stageRef}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={step === 0 ? `Secuencia RNN en espera: ${steps} mediciones neutrales` : `RNN leyó ${step} de ${steps} mediciones. Estado actual ${states[step].toFixed(3)}; la entrada más reciente influye ${formatInfluence(lastInfluence)}`}>
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
        {Array.from({ length: steps }, (_, t) => {
          const v = g[t] ?? 0;
          const processed = t < step;
          // Bajo el piso: un muñón corto y semitransparente que cuelga bajo la línea de 1e-8.
          const floor = processed && v < 10 ** LOG_MIN;
          const neutralHeight = 7;
          return (
            <rect
              key={t}
              className={floor ? 'mlx-rnn-bar is-floor' : 'mlx-rnn-bar'}
              x={36 + t * barW}
              y={!processed ? BOTTOM - neutralHeight : floor ? BOTTOM : yOf(v)}
              width={barW - 2}
              height={!processed ? neutralHeight : floor ? STUB : BOTTOM - yOf(v)}
              fill={!processed ? OVA_COLORS.axis : t === step - 1 ? OVA_COLORS.accent : t === 0 ? OVA_COLORS.risk : OVA_COLORS.class0}
              opacity={!processed ? 0.28 : floor ? 0.45 : t === step - 1 ? 1 : 0.75}
            />
          );
        })}
        <text x={36} y={H - 8} fontSize={11} fill={OVA_COLORS.axis}>
          {step > 0 ? 'x₁ (la más antigua)' : 'La secuencia aún no empieza'}
        </text>
        <text x={36 + steps * barW} y={H - 8} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
          x{steps} →
        </text>
      </svg>
      </div>
    </OvaFrame>
  );
}
