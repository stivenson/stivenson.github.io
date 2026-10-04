import { useState } from 'react';
import { NB_REVIEWS, NB_START } from './datasets';
import { OvaFrame } from './OvaFrame';
import { explainNaiveBayes, trainNaiveBayes } from './ovaMath';

const MODEL = trainNaiveBayes(NB_REVIEWS);
const EXAMPLES = [NB_START, 'no funciona mala compra', 'llegó la batería nueva'];
const pct = (p: number) => `${(p * 100).toFixed(0)} %`;

export function NaiveBayesOva() {
  const [text, setText] = useState(NB_START);
  const result = explainNaiveBayes(MODEL, text);
  const odds = result.pPositive / (1 - result.pPositive);

  return (
    <OvaFrame
      title="Palabra por palabra"
      hint="Escribe una reseña corta (o elige un ejemplo). Cada palabra conocida multiplica los odds de «positiva» por su factor: más de 1 empuja a positiva, menos de 1 a negativa. Las palabras que el modelo nunca vio no cuentan. El modelo aprendió de las mismas 16 reseñas del ejercicio de Python."
      controls={
        <>
          <label className="mlx-nb-input">
            <span>Reseña</span>
            <input type="text" value={text} maxLength={120} onChange={(e) => setText(e.target.value)} />
          </label>
          <div role="group" aria-label="Ejemplos">
            {EXAMPLES.map((ex) => (
              <button key={ex} type="button" onClick={() => setText(ex)}>
                {ex}
              </button>
            ))}
          </div>
        </>
      }
      readout={
        <>
          <span>
            P(positiva) = <b>{pct(result.pPositive)}</b>
          </span>
          <span>
            Predicción: <b>{result.pPositive > 0.5 ? (
                <>
                  <span aria-hidden="true">🟠 </span>positiva
                </>
              ) : result.pPositive < 0.5 ? (
                <>
                  <span aria-hidden="true">🔵 </span>negativa
                </>
              ) : (
                'empate'
              )}</b>
          </span>
        </>
      }
    >
      <ol className="mlx-nb-words" aria-label="Evidencia de cada palabra">
        <li>
          Odds iniciales (prior): <b>{result.priorOdds.toFixed(2)}</b>
        </li>
        {result.words.map((w, i) => (
          <li key={`${w.word}-${i}`} className={w.known ? (w.factor >= 1 ? 'is-pos' : 'is-neg') : 'is-unknown'}>
            «{w.word}»: {w.known ? <b>×{w.factor.toFixed(2)}</b> : <i>no la conoce, se ignora</i>}
          </li>
        ))}
        <li>
          Odds finales: <b>{odds.toFixed(2)}</b> → probabilidad {pct(result.pPositive)}
        </li>
      </ol>
    </OvaFrame>
  );
}
