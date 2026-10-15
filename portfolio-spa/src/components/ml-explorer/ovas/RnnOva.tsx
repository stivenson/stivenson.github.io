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

function formatRatio(value: number): string {
  return value < 1000 ? Math.round(value).toLocaleString('es-CO') : value.toExponential(1);
}

export function RnnOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [w, setW] = useState<number>(RNN_START.w);
  const [steps, setSteps] = useState<number>(RNN_START.steps);
  const [step, setStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  const playback = useAutoLoop(step, steps, setStep, visible, reducedMotion, autoPlay, 750, 5000);
  const inputs = RNN_INPUTS.slice(0, steps);
  const influence = rnnInfluence(inputs, w, RNN_U);
  const finalStates = rnnStates(inputs, w, RNN_U);
  const observed = RNN_INPUTS.slice(0, step);
  const currentStates = observed.length ? rnnStates(observed, w, RNN_U) : [0];
  const firstInfluence = influence[0];
  const lastInfluence = influence[influence.length - 1];
  const recentVsOld = lastInfluence / firstInfluence;
  const barW = (W - 44) / steps;
  const networkWidth = Math.max(W, steps * 22 + 40);
  const networkX = (t: number) => 20 + (t * (networkWidth - 40)) / steps;
  const below = influence.filter((value) => value < 10 ** LOG_MIN).length;

  const setParameter = (setter: (value: number) => void, value: number) => {
    setter(value);
    setStep(0);
  };
  const resetParameters = () => {
    setW(RNN_START.w);
    setSteps(RNN_START.steps);
    setStep(0);
  };
  const progressLabel = step === 0
    ? 'Antes de leer · resultado previsto'
    : <>Dato <b>{step}</b> de <b>{steps}</b> · x<sub>{step}</sub> → h<sub>{step}</sub></>;

  return (
    <OvaFrame
      playback={playback}
      progressLabel={progressLabel}
      explanation={step === 0
        ? `La gráfica anticipa qué recordará h${steps} al terminar. Reproduce para ver cómo cada dato actualiza la memoria.`
        : step === steps
          ? `La lectura terminó. x₁ atravesó ${Math.max(0, steps - 1)} enlaces recurrentes; x${steps} entró directamente al último estado.`
          : `x${step} actualiza h${step}. La memoria acumulada seguirá pasando por ${steps - step} enlaces antes de llegar a h${steps}.`}
      title="La memoria de una RNN se desvanece"
      hint="Arriba se muestra la lectura: xₜ actualiza la memoria hₜ y esta pasa al paso siguiente. Abajo se muestra el resultado final: cuánto cambiaría h final si cambiara cada entrada. Cada raya hacia abajo significa 10 veces menos influencia. Alarga la secuencia o baja w para acelerar el olvido. Aun con w = 1 se encoge porque la pendiente de tanh también es menor que 1."
      controls={
        <>
          <OvaSlider label="Pasos de la secuencia" value={steps} {...RNN_STEPS} onChange={(value) => setParameter(setSteps, value)} />
          <div className="mlx-rnn-presets" role="group" aria-label="Ejemplos de peso de memoria">
            <span>Comparar memoria:</span>
            {[
              { value: 0.5, label: 'Corta' },
              { value: 0.9, label: 'Media' },
              { value: 1, label: 'Mayor' },
            ].map((preset) => (
              <button key={preset.value} type="button" aria-pressed={w === preset.value} onClick={() => setParameter(setW, preset.value)}>
                {preset.label} <small>w={preset.value.toFixed(1)}</small>
              </button>
            ))}
          </div>
          <OvaSlider label="w (peso de la memoria)" value={w} {...RNN_W} onChange={(value) => setParameter(setW, Math.round(value * 10) / 10)} format={(value) => value.toFixed(1)} />
          <button type="button" onClick={resetParameters}>Restablecer</button>
        </>
      }
      readout={
        <>
          <div className="mlx-rnn-comparison">
            <span><i className="is-old" aria-hidden="true" />x₁, la más antigua</span>
            <b>{formatInfluence(firstInfluence)}</b>
            <small>{oneIn(firstInfluence)}</small>
            <span><i className="is-new" aria-hidden="true" />x<sub>{steps}</sub>, la más reciente</span>
            <b>{formatInfluence(lastInfluence)}</b>
            <small>influye {formatRatio(recentVsOld)}× más</small>
          </div>
          <span className="mlx-rnn-a11y-summary">
            Influencia de x₁ en la salida: <b>{formatInfluence(firstInfluence)}</b> ({oneIn(firstInfluence)}).{' '}
            Influencia de x<sub>{steps}</sub>, la última: <b>{formatInfluence(lastInfluence)}</b>.
          </span>
          <span>
            {step === 0
              ? <>Pulsa <b>Reproducir</b> para seguir la actualización de h₁ a h<sub>{steps}</sub>.</>
              : <>Lectura actual: x<sub>{step}</sub> = <b>{observed[step - 1].toFixed(2)}</b> → h<sub>{step}</sub> = <b>{currentStates[step].toFixed(3)}</b></>}
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
      <div ref={stageRef} className="mlx-rnn-viz">
        <div className="mlx-rnn-network">
          <div className="mlx-network-caption">
            <strong>1. La red lee la secuencia</strong>
            <span>hₜ = tanh({w.toFixed(1)}·hₜ₋₁ + 0.5·xₜ)</span>
          </div>
          <svg
            viewBox={`0 0 ${networkWidth} 158`}
            role="img"
            aria-label={`Red neuronal recurrente: ${step} de ${steps} entradas procesadas; el estado final previsto es ${finalStates[steps].toFixed(3)}.`}
          >
            <text className="mlx-rnn-axis-label" x={8} y={31}>Entrada</text>
            <text className="mlx-rnn-axis-label" x={8} y={112}>Memoria</text>
            {Array.from({ length: steps + 1 }, (_, t) => {
              const x = networkX(t);
              const processed = t > 0 && t <= step;
              const state = currentStates[t] ?? 0;
              return <g key={t}>
                {t > 0 && <>
                  <line className={`mlx-rnn-input-edge${processed ? ' is-active' : ''}`} x1={x} x2={x} y1={48} y2={91} />
                  <circle className={`mlx-rnn-input-node${processed ? ' is-active' : ''}`} cx={x} cy={37} r={8}>
                    <title>{`Entrada x${t}${processed ? ` = ${RNN_INPUTS[t - 1].toFixed(2)}` : ', pendiente'}`}</title>
                  </circle>
                  <text className="mlx-rnn-index" x={x} y={40} textAnchor="middle">x</text>
                </>}
                {t > 0 && <path
                  className={`mlx-rnn-recurrent-edge${processed ? ' is-active' : ''}`}
                  d={`M ${networkX(t - 1) + 9} 104 Q ${(networkX(t - 1) + x) / 2} 72 ${x - 9} 104`}
                />}
                <circle
                  className={`mlx-rnn-state-node${processed || (t === 0 && step > 0) ? ' is-active' : ''}`}
                  cx={x}
                  cy={107}
                  r={10}
                  style={{ opacity: processed || (t === 0 && step > 0) ? 0.4 + Math.abs(state) * 0.6 : 0.18 }}
                >
                  <title>{`Estado oculto h${t}${t <= step ? ` = ${state.toFixed(3)}` : ', pendiente'}`}</title>
                </circle>
                {t === 0 || t === step || t === steps ? <text className="mlx-rnn-index" x={x} y={133} textAnchor="middle">h{t}</text> : null}
              </g>;
            })}
            {step > 0 && <text className="mlx-rnn-weight-label" x={(networkX(0) + networkX(Math.min(1, steps))) / 2} y={79} textAnchor="middle">w={w.toFixed(1)}</text>}
          </svg>
        </div>

        <div className="mlx-rnn-chart">
          <div className="mlx-network-caption">
            <strong>2. Qué recuerda h<sub>{steps}</sub> al final</strong>
            <span>Influencia ∂h<sub>{steps}</sub>/∂xₜ · cada raya es 10× menos</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Influencia de cada una de las ${steps} mediciones en la salida final: x₁ influye ${formatInfluence(firstInfluence)} y x${steps}, la última, ${formatInfluence(lastInfluence)}`}>
            {Array.from({ length: -LOG_MIN + 1 }, (_, i) => (
              <g key={i}>
                <line x1={34} x2={W} y1={yOf(10 ** -i)} y2={yOf(10 ** -i)} stroke={OVA_COLORS.grid} />
                <text x={30} y={yOf(10 ** -i) + 4} textAnchor="end" fontSize={10} fill={OVA_COLORS.axis}>
                  {i === 0 ? '1' : `1e-${i}`}
                </text>
              </g>
            ))}
            <text x={30} y={BOTTOM + 14} textAnchor="end" fontSize={10} fill={OVA_COLORS.axis}>{'< 1e-8'}</text>
            {influence.map((value, t) => {
              const floor = value < 10 ** LOG_MIN;
              return (
                <rect
                  key={t}
                  className={floor ? 'mlx-rnn-bar is-floor' : 'mlx-rnn-bar'}
                  x={36 + t * barW}
                  y={floor ? BOTTOM : yOf(value)}
                  width={barW - 2}
                  height={floor ? STUB : BOTTOM - yOf(value)}
                  fill={t === 0 ? OVA_COLORS.risk : t === steps - 1 ? OVA_COLORS.accent : OVA_COLORS.class0}
                  opacity={floor ? 0.45 : t === 0 || t === steps - 1 ? 1 : 0.78}
                />
              );
            })}
            <text x={36} y={H - 8} fontSize={11} fill={OVA_COLORS.risk}>x₁ · antigua</text>
            <text x={W - 4} y={H - 8} textAnchor="end" fontSize={11} fill={OVA_COLORS.accent}>x{steps} · reciente</text>
          </svg>
        </div>
      </div>
    </OvaFrame>
  );
}
