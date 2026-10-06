import { useRef, useState } from 'react';
import { NB_REVIEWS, NB_START } from './datasets';
import { OvaFrame } from './OvaFrame';
import { explainNaiveBayes, trainNaiveBayes } from './ovaMath';
import { useInViewport, usePrefersReducedMotion } from './useMotion';
import { useAutoLoop } from './useAutoLoop';

const MODEL = trainNaiveBayes(NB_REVIEWS);
const EXAMPLES = [NB_START, 'no funciona mala compra', 'llegó la batería nueva'];
const pct = (p: number) => `${(p * 100).toFixed(0)} %`;

export function NaiveBayesOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [text, setText] = useState(NB_START);
  const [step, setStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  const result = explainNaiveBayes(MODEL, text);
  const last = result.words.length;
  const shown = Math.min(step, last);
  const partialText = result.words.slice(0, shown).map((word) => word.word).join(' ');
  const partial = explainNaiveBayes(MODEL, partialText);
  const pPositive = shown === 0 ? 0.5 : partial.pPositive;
  const positiveWins = pPositive > 0.5;
  const negativeWins = pPositive < 0.5;
  const odds = partial.pPositive / (1 - partial.pPositive);

  useAutoLoop(step, last, setStep, visible, reducedMotion, autoPlay, 1050, 1400);

  const changeText = (next: string) => {
    setText(next);
    setStep(0);
  };

  return (
    <OvaFrame
      title="Cada palabra aporta evidencia"
      hint="La frase aparece palabra por palabra. Al principio ambas clases están neutrales; cada palabra conocida inclina la probabilidad hacia positiva o negativa. Las desconocidas se muestran, pero no cambian el cálculo. El recorrido se repite automáticamente."
      controls={
        <>
          <label className="mlx-nb-input">
            <span>Reseña</span>
            <input type="text" value={text} maxLength={120} onChange={(e) => changeText(e.target.value)} />
          </label>
          <div role="group" aria-label="Ejemplos">
            {EXAMPLES.map((ex) => (
              <button key={ex} type="button" onClick={() => changeText(ex)}>
                {ex}
              </button>
            ))}
          </div>
        </>
      }
      readoutLive="off"
      readout={
        <>
          <span>
            Palabras leídas: <b>{shown}</b> de <b>{last}</b>
          </span>
          <span>
            P(positiva) = <b>{pct(pPositive)}</b> · P(negativa) = <b>{pct(1 - pPositive)}</b>
          </span>
          <span>
            Predicción: <b>{shown === 0 ? 'aún sin evidencia' : positiveWins ? 'positiva' : negativeWins ? 'negativa' : 'empate'}</b>
          </span>
          {shown > 0 && <span>Odds positiva/negativa: <b>{odds.toFixed(2)}</b></span>}
        </>
      }
    >
      <div className="mlx-nb-viz" ref={stageRef}>
        <div className="mlx-nb-evidence" aria-label="Palabras de la reseña y evidencia acumulada">
          {result.words.length ? result.words.map((word, i) => {
            const active = i < shown;
            return (
              <span
                key={`${word.word}-${i}`}
                className={`mlx-nb-token${active ? (word.known ? (word.factor >= 1 ? ' is-pos' : ' is-neg') : ' is-unknown') : ''}`}
                aria-label={`${word.word}${active ? word.known ? `, factor ${word.factor.toFixed(2)}` : ', desconocida' : ', pendiente'}`}
              >
                {word.word}
                {active && word.known && <small>×{word.factor.toFixed(2)}</small>}
                {active && !word.known && <small>ignorada</small>}
              </span>
            );
          }) : <span className="mlx-nb-empty">Escribe una reseña para ver sus palabras.</span>}
        </div>

        <div className="mlx-nb-posterior" role="img" aria-label={`Probabilidades actuales: ${pct(1 - pPositive)} negativa y ${pct(pPositive)} positiva`}>
          <div className={`mlx-nb-class${shown > 0 && negativeWins ? ' is-winner' : ''}`}>
            <span>{shown === 0 ? 'Clase negativa' : '🔵 Negativa'}</span>
            <b>{pct(1 - pPositive)}</b>
            <div className="mlx-nb-track">
              <div className="mlx-nb-fill is-neg" style={{ width: `${(1 - pPositive) * 100}%`, opacity: shown === 0 ? 0.45 : 1, backgroundColor: shown === 0 ? 'rgba(232, 232, 240, 0.45)' : undefined }} />
            </div>
          </div>
          <div className={`mlx-nb-class${shown > 0 && positiveWins ? ' is-winner' : ''}`}>
            <span>{shown === 0 ? 'Clase positiva' : '🟠 Positiva'}</span>
            <b>{pct(pPositive)}</b>
            <div className="mlx-nb-track">
              <div className="mlx-nb-fill is-pos" style={{ width: `${pPositive * 100}%`, opacity: shown === 0 ? 0.45 : 1, backgroundColor: shown === 0 ? 'rgba(232, 232, 240, 0.45)' : undefined }} />
            </div>
          </div>
        </div>

        <ol className="mlx-nb-words" aria-label="Cómo se actualizan los odds">
          {shown === 0 ? (
            <li>Prior inicial: <b>1 a 1</b> · ambas clases parten empatadas.</li>
          ) : (
            <>
              <li>Odds iniciales (prior): <b>{partial.priorOdds.toFixed(2)}</b></li>
              {partial.words.map((word, i) => (
                <li key={`${word.word}-${i}`} className={word.known ? (word.factor >= 1 ? 'is-pos' : 'is-neg') : 'is-unknown'}>
                  «{word.word}»: {word.known ? <b>×{word.factor.toFixed(2)}</b> : <i>no la conoce, se ignora</i>}
                </li>
              ))}
              <li>Odds finales: <b>{odds.toFixed(2)}</b> → probabilidad {pct(partial.pPositive)}</li>
            </>
          )}
        </ol>
      </div>
    </OvaFrame>
  );
}
