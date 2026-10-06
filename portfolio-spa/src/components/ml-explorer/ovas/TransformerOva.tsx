import { useRef, useState } from 'react';
import { TF_DIMS, TF_EMBEDDINGS, TF_SENTENCES } from './datasets';
import { OVA_COLORS, OvaFrame } from './OvaFrame';
import { positionalEncoding, selfAttention, type Grid } from './ovaMath';
import { useAutoLoop } from './useAutoLoop';
import { useInViewport, usePrefersReducedMotion } from './useMotion';

const C = 58; // lado de cada casilla del mapa de atención
const LEFT = 70;
const TOP = 28;

interface Options {
  positional: boolean;
  causal: boolean;
}

/** Embeddings de la frase (más la codificación posicional, si está activa) y su atención. */
function attend(words: readonly string[], { positional, causal }: Options) {
  let X: Grid = words.map((w) => TF_EMBEDDINGS[w]);
  if (positional) {
    const pe = positionalEncoding(X.length, X[0].length);
    X = X.map((r, i) => r.map((v, c) => v + pe[i][c]));
  }
  return selfAttention(X, causal);
}

export function TransformerOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [step, setStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  const [sentence, setSentence] = useState(0);
  const [reversed, setReversed] = useState(false);
  const [positional, setPositional] = useState(false);
  const [causal, setCausal] = useState(false);
  const [focus, setFocus] = useState('banco');

  const base: readonly string[] = TF_SENTENCES[sentence];
  const words = reversed ? [...base].reverse() : [...base];
  const other = reversed ? [...base] : [...base].reverse();
  const opts = { positional, causal };
  const { weights, out } = attend(words, opts);
  const i = words.indexOf(focus);
  const otherOut = attend(other, opts).out[other.indexOf(focus)];
  const change = Math.max(...out[i].map((v, c) => Math.abs(v - otherOut[c])));
  useAutoLoop(step, words.length, setStep, visible, reducedMotion, autoPlay, 1050, 1400);

  const pickSentence = (k: number) => {
    setSentence(k);
    // La palabra que se explica debe estar en la frase nueva.
    if (!(TF_SENTENCES[k] as readonly string[]).includes(focus)) setFocus('banco');
  };

  return (
    <OvaFrame
      title="Mapa de atención de una frase"
      hint="Las entradas empiezan neutrales. Luego se revela una fila por token: muestra cómo reparte su atención entre las palabras, y al final queda el mapa completo. «Banco» cambia de contexto entre río e interés. Invierte la frase para comparar el efecto de la codificación posicional; la máscara causal limita cada fila a su propia posición y las anteriores. Embeddings de juguete con 4 números escritos a mano."
      controls={
        <>
          <div role="group" aria-label="Frase">
            <span>Frase: </span>
            {TF_SENTENCES.map((s, k) => (
              <button key={s.join(' ')} type="button" aria-pressed={sentence === k} onClick={() => { pickSentence(k); setStep(0); }}>
                {s.join(' ')}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Opciones">
            <button type="button" aria-pressed={reversed} onClick={() => { setReversed((v) => !v); setStep(0); }}>
              Invertir el orden
            </button>
            <button type="button" aria-pressed={positional} onClick={() => { setPositional((v) => !v); setStep(0); }}>
              Codificación posicional
            </button>
            <button type="button" aria-pressed={causal} onClick={() => { setCausal((v) => !v); setStep(0); }}>
              Máscara causal (GPT)
            </button>
          </div>
          <div role="group" aria-label="Palabra que explica la lectura">
            <span>Mirar: </span>
            {base.map((w) => (
              <button key={w} type="button" aria-pressed={focus === w} onClick={() => { setFocus(w); setStep(0); }}>
                {w}
              </button>
            ))}
          </div>
        </>
      }
      readout={
        <>
          <span>Lectura del mapa: <b>{step === 0 ? 'preparando tokens' : `${Math.min(step, words.length)} de ${words.length} filas`}</b></span>
          <span>
            {step > i ? <>«{focus}» atiende a:{' '}
              {words.map((w, j) => (
                <span key={w}>
                  {j > 0 && ' · '}
                  {w} <b>{weights[i][j].toFixed(2)}</b>
                </span>
              ))}</> : <>La fila de «{focus}» aparecerá al avanzar la lectura de tokens.</>}
          </span>
          {step === words.length && <span>
            Después de la atención: {TF_DIMS[2]} <b>{out[i][2].toFixed(2)}</b> · {TF_DIMS[3]} <b>{out[i][3].toFixed(2)}</b>
          </span>}
          {step === words.length && <span>
            Si se invierte la frase, «{focus}» cambia <b>{change.toFixed(2)}</b>
          </span>}
        </>
      }
    >
      <div ref={stageRef}>
        <svg
        viewBox={`0 0 ${LEFT + words.length * C + 4} ${TOP + words.length * C + 4}`}
        role="img"
        aria-label={step === 0
          ? `Tokens neutrales de «${words.join(' ')}» antes de revelar la atención.`
          : `Mapa de atención de «${words.join(' ')}»: ${Math.min(step, words.length)} de ${words.length} filas reveladas.${step > i ? ` «${focus}» atiende a: ${words.map((w, j) => `${w} ${weights[i][j].toFixed(2)}`).join(', ')}` : ''}`}
      >
        {words.map((w, j) => (
          <text key={`c${w}`} x={LEFT + j * C + C / 2} y={TOP - 10} textAnchor="middle" fontSize={12} fill={OVA_COLORS.axis}>
            {w}
          </text>
        ))}
        {weights.map((row, r) => (
          <g key={words[r]} className="mlx-tf-row">
            <text x={LEFT - 8} y={TOP + r * C + C / 2 + 4} textAnchor="end" fontSize={12} fill={r === i ? OVA_COLORS.accent : OVA_COLORS.axis} fontWeight={r === i ? 700 : 400}>
              {words[r]}
            </text>
            {row.map((a, j) => (
              <g key={j}>
                <rect
                  className="mlx-tf-cell"
                  x={LEFT + j * C}
                  y={TOP + r * C}
                  width={C - 2}
                  height={C - 2}
                  fill={step > r ? OVA_COLORS.class1 : OVA_COLORS.axis}
                  fillOpacity={step > r ? 0.06 + 0.9 * a : 0.16}
                  stroke={r === i ? OVA_COLORS.accent : 'none'}
                  strokeWidth={2}
                />
                <text x={LEFT + j * C + C / 2 - 1} y={TOP + r * C + C / 2 + 4} textAnchor="middle" fontSize={12} fill="#e8e8f0">
                  {step > r ? a.toFixed(2) : '·'}
                </text>
              </g>
            ))}
          </g>
        ))}
        </svg>
      </div>
    </OvaFrame>
  );
}
