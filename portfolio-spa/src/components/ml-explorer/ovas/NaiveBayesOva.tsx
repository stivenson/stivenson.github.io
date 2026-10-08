import { useRef, useState } from 'react';
import { NB_REVIEWS, NB_START } from './datasets';
import { OvaFrame } from './OvaFrame';
import { explainNaiveBayes, trainNaiveBayes } from './ovaMath';
import { createPlot } from './plot';
import { useInViewport, usePrefersReducedMotion } from './useMotion';
import { useAutoLoop } from './useAutoLoop';

const MODEL = trainNaiveBayes(NB_REVIEWS);
const EXAMPLES = [NB_START, 'no funciona mala compra', 'llegó la batería nueva'];
const CHART_WIDTH = 480;
const CHART_HEIGHT = 270;
const CHART_PAD = 42;
const pct = (p: number) => `${(p * 100).toFixed(0)} %`;

export function NaiveBayesOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [text, setText] = useState(NB_START);
  const [step, setStep] = useState(0);
  const [chartView, setChartView] = useState<'2d' | '3d'>('2d');
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  const result = explainNaiveBayes(MODEL, text);
  const last = result.words.length;
  const shown = Math.min(step, last);
  const partialText = result.words.slice(0, shown).map((word) => word.word).join(' ');
  const partial = explainNaiveBayes(MODEL, partialText);
  const currentWord = shown > 0 ? result.words[shown - 1] : undefined;
  const beforeText = result.words.slice(0, Math.max(0, shown - 1)).map((word) => word.word).join(' ');
  const beforePartial = explainNaiveBayes(MODEL, beforeText);
  const pBeforeWord = shown === 0 ? 0.5 : beforePartial.pPositive;
  const pPositive = shown === 0 ? 0.5 : partial.pPositive;
  const plot = createPlot(CHART_WIDTH, CHART_HEIGHT, CHART_PAD, [0, Math.max(1, last)], [0, 1]);
  let cumulativeLogOdds = MODEL.logPrior[1] - MODEL.logPrior[0];
  const probabilityPath = [1 / (1 + Math.exp(-cumulativeLogOdds))];
  result.words.forEach((word) => {
    if (word.known) cumulativeLogOdds += Math.log(word.factor);
    probabilityPath.push(1 / (1 + Math.exp(-cumulativeLogOdds)));
  });
  const visibleProbabilities = probabilityPath.slice(0, shown + 1);
  const xTicks = last <= 6
    ? Array.from({ length: last + 1 }, (_, i) => i)
    : [...new Set([0, Math.ceil(last / 4), Math.ceil(last / 2), Math.ceil((last * 3) / 4), last])];
  const project3d = (wordIndex: number, probability: number, positiveClass: boolean) => ({
    x: plot.sx(wordIndex) + (positiveClass ? 0 : 34),
    y: plot.sy(probability) - (positiveClass ? 0 : 20),
  });
  const factorIsNeutral = currentWord?.known && Math.abs(Math.log(currentWord.factor)) < 0.025;
  const positiveWins = pPositive > 0.5;
  const negativeWins = pPositive < 0.5;
  const odds = partial.pPositive / (1 - partial.pPositive);

  useAutoLoop(step, last, setStep, visible, reducedMotion, autoPlay, 1050, 5000);

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
          <div className={`mlx-nb-current-evidence${!currentWord ? '' : !currentWord.known ? ' is-unknown' : factorIsNeutral ? ' is-neutral' : currentWord.factor > 1 ? ' is-positive' : ' is-negative'}`}>
            <span className="mlx-nb-current-evidence__eyebrow">Palabra recién leída</span>
            {currentWord ? (
              <>
                <strong className="mlx-nb-current-evidence__word">«{currentWord.word}»</strong>
                <p>
                  {!currentWord.known
                    ? 'El modelo no conoce esta palabra; la ignora y no cambia su predicción.'
                    : factorIsNeutral
                      ? 'Esta palabra aporta casi la misma evidencia para ambas opciones; la probabilidad prácticamente no cambia.'
                      : currentWord.factor > 1
                        ? 'Esta palabra favorece una reseña positiva.'
                        : 'Esta palabra favorece una reseña negativa.'}
                </p>
                {currentWord.known && !factorIsNeutral ? (
                  <span>P(positiva): <b>{pct(pBeforeWord)}</b> → <b>{pct(pPositive)}</b></span>
                ) : (
                  <span>La probabilidad positiva se mantiene en <b>{pct(pPositive)}</b>.</span>
                )}
              </>
            ) : (
              <p>Lee la reseña palabra por palabra: cada palabra conocida puede cambiar la predicción.</p>
            )}
          </div>
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

        <div className="mlx-nb-chart-wrap">
          <div className="mlx-nb-chart-heading">
            <div>
              <strong>La evidencia mueve la probabilidad</strong>
              <span>{chartView === '2d' ? 'La curva muestra P(positiva) al leer cada palabra' : 'Cada línea muestra la probabilidad de una clase a medida que se leen palabras'}</span>
            </div>
            <div className="mlx-nb-chart-toggle" role="group" aria-label="Dimensión del gráfico">
              <button type="button" aria-pressed={chartView === '2d'} onClick={() => setChartView('2d')}>2D</button>
              <button type="button" aria-pressed={chartView === '3d'} onClick={() => setChartView('3d')}>3D</button>
            </div>
          </div>
          {chartView === '2d' ? <svg
            className="mlx-nb-chart"
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            role="img"
            aria-label={`Plano cartesiano: al leer ${shown} de ${last} palabras, la probabilidad positiva llegó a ${pct(pPositive)}. La línea parte de un empate en 50 por ciento.`}
          >
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
              <g key={tick}>
                <line className={tick === 0.5 ? 'mlx-nb-grid is-neutral' : 'mlx-nb-grid'} x1={plot.sx(0)} x2={plot.sx(Math.max(1, last))} y1={plot.sy(tick)} y2={plot.sy(tick)} />
                <text className="mlx-nb-axis-tick" x={plot.sx(0) - 8} y={plot.sy(tick) + 4} textAnchor="end">{pct(tick)}</text>
              </g>
            ))}
            <line className="mlx-nb-axis" x1={plot.sx(0)} x2={plot.sx(Math.max(1, last))} y1={plot.sy(0)} y2={plot.sy(0)} />
            <line className="mlx-nb-axis" x1={plot.sx(0)} x2={plot.sx(0)} y1={plot.sy(0)} y2={plot.sy(1)} />
            {xTicks.map((tick) => (
              <g key={tick}>
                <line className="mlx-nb-axis-mark" x1={plot.sx(tick)} x2={plot.sx(tick)} y1={plot.sy(0)} y2={plot.sy(0) + 4} />
                <text className="mlx-nb-axis-tick" x={plot.sx(tick)} y={plot.sy(0) + 17} textAnchor="middle">{tick}</text>
              </g>
            ))}
            <text className="mlx-nb-axis-label" x={(plot.sx(0) + plot.sx(Math.max(1, last))) / 2} y={CHART_HEIGHT - 3} textAnchor="middle">Palabras leídas</text>
            <text className="mlx-nb-axis-label" transform={`translate(12 ${(plot.sy(0) + plot.sy(1)) / 2}) rotate(-90)`} textAnchor="middle">P(positiva)</text>
            {visibleProbabilities.slice(1).map((probability, index) => {
              const word = result.words[index];
              const favorsPositive = word.known && word.factor > 1;
              const favorsNegative = word.known && word.factor < 1;
              const colorClass = !word.known ? 'is-unknown' : favorsPositive ? 'is-positive' : favorsNegative ? 'is-negative' : 'is-neutral';
              return (
                <line
                  key={`${word.word}-${index}`}
                  className={`mlx-nb-segment ${colorClass}`}
                  x1={plot.sx(index)}
                  y1={plot.sy(visibleProbabilities[index])}
                  x2={plot.sx(index + 1)}
                  y2={plot.sy(probability)}
                />
              );
            })}
            {visibleProbabilities.map((probability, index) => {
              const isCurrent = index === shown;
              const word = result.words[index - 1];
              const colorClass = index === 0 || !word?.known
                ? 'is-neutral'
                : word.factor > 1 ? 'is-positive' : word.factor < 1 ? 'is-negative' : 'is-neutral';
              return (
                <circle
                  key={index}
                  className={`mlx-nb-chart-point ${colorClass}${isCurrent ? ' is-current' : ''}`}
                  cx={plot.sx(index)}
                  cy={plot.sy(probability)}
                  r={isCurrent ? 5 : 3}
                />
              );
            })}
          </svg> : <svg
            className="mlx-nb-chart"
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            role="img"
            aria-label={`Plano cartesiano tridimensional: el eje horizontal cuenta palabras leídas, la altura muestra la probabilidad y la profundidad separa las clases. La clase positiva tiene ${pct(pPositive)} y la negativa ${pct(1 - pPositive)}.`}
          >
            {(() => {
              const frontStart = project3d(0, 0, true);
              const frontEnd = project3d(Math.max(1, last), 0, true);
              const backStart = project3d(0, 0, false);
              const backEnd = project3d(Math.max(1, last), 0, false);
              return <polygon className="mlx-nb-3d-floor" points={`${frontStart.x},${frontStart.y} ${frontEnd.x},${frontEnd.y} ${backEnd.x},${backEnd.y} ${backStart.x},${backStart.y}`} />;
            })()}
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
              const frontStart = project3d(0, tick, true);
              const frontEnd = project3d(Math.max(1, last), tick, true);
              const backStart = project3d(0, tick, false);
              const backEnd = project3d(Math.max(1, last), tick, false);
              return (
                <g key={tick}>
                  <line className={tick === 0.5 ? 'mlx-nb-grid is-neutral' : 'mlx-nb-grid'} x1={frontStart.x} x2={frontEnd.x} y1={frontStart.y} y2={frontEnd.y} />
                  <line className={tick === 0.5 ? 'mlx-nb-grid is-neutral' : 'mlx-nb-grid'} x1={backStart.x} x2={backEnd.x} y1={backStart.y} y2={backEnd.y} />
                  <line className="mlx-nb-grid-depth" x1={frontStart.x} x2={backStart.x} y1={frontStart.y} y2={backStart.y} />
                  <text className="mlx-nb-axis-tick" x={frontStart.x - 8} y={frontStart.y + 4} textAnchor="end">{pct(tick)}</text>
                </g>
              );
            })}
            {(() => {
              const frontTop = project3d(0, 1, true);
              const frontBottom = project3d(0, 0, true);
              const backTop = project3d(0, 1, false);
              const backBottom = project3d(0, 0, false);
              const frontEnd = project3d(Math.max(1, last), 0, true);
              const backEnd = project3d(Math.max(1, last), 0, false);
              return <>
                <line className="mlx-nb-axis" x1={frontTop.x} x2={frontBottom.x} y1={frontTop.y} y2={frontBottom.y} />
                <line className="mlx-nb-axis" x1={backTop.x} x2={backBottom.x} y1={backTop.y} y2={backBottom.y} />
                <line className="mlx-nb-axis" x1={frontBottom.x} x2={frontEnd.x} y1={frontBottom.y} y2={frontEnd.y} />
                <line className="mlx-nb-axis" x1={backBottom.x} x2={backEnd.x} y1={backBottom.y} y2={backEnd.y} />
                <line className="mlx-nb-axis" x1={frontBottom.x} x2={backBottom.x} y1={frontBottom.y} y2={backBottom.y} />
                <text className="mlx-nb-axis-label" x={frontTop.x + 4} y={frontTop.y - 8}>Positiva</text>
                <text className="mlx-nb-axis-label" x={backTop.x + 4} y={backTop.y - 8}>Negativa</text>
                <text className="mlx-nb-axis-label" x={(frontBottom.x + frontEnd.x) / 2} y={CHART_HEIGHT - 3} textAnchor="middle">Palabras leídas</text>
                <text className="mlx-nb-axis-label" transform={`translate(12 ${(frontTop.y + frontBottom.y) / 2}) rotate(-90)`} textAnchor="middle">Probabilidad</text>
              </>;
            })()}
            {xTicks.map((tick) => {
              const pos = project3d(tick, 0, true);
              return (
                <g key={tick}>
                  <line className="mlx-nb-axis-mark" x1={pos.x} x2={pos.x} y1={pos.y} y2={pos.y + 4} />
                  <text className="mlx-nb-axis-tick" x={pos.x} y={pos.y + 17} textAnchor="middle">{tick}</text>
                </g>
              );
            })}
            {visibleProbabilities.slice(1).map((probability, index) => {
              const word = result.words[index];
              const previous = visibleProbabilities[index];
              const positiveStart = project3d(index, previous, true);
              const positiveEnd = project3d(index + 1, probability, true);
              const negativeStart = project3d(index, 1 - previous, false);
              const negativeEnd = project3d(index + 1, 1 - probability, false);
              const evidence = !word.known ? 'is-unknown' : word.factor > 1 ? 'is-positive' : word.factor < 1 ? 'is-negative' : 'is-neutral';
              return <g key={`${word.word}-${index}`}>
                <line className="mlx-nb-segment is-positive" x1={positiveStart.x} y1={positiveStart.y} x2={positiveEnd.x} y2={positiveEnd.y} />
                <line className="mlx-nb-segment is-negative" x1={negativeStart.x} y1={negativeStart.y} x2={negativeEnd.x} y2={negativeEnd.y} />
                <line className={`mlx-nb-3d-evidence ${evidence}`} x1={positiveEnd.x} y1={positiveEnd.y} x2={negativeEnd.x} y2={negativeEnd.y} />
              </g>;
            })}
            {visibleProbabilities.map((probability, index) => {
              const isCurrent = index === shown;
              const positive = project3d(index, probability, true);
              const negative = project3d(index, 1 - probability, false);
              return <g key={index}>
                <circle className={`mlx-nb-chart-point is-positive${isCurrent ? ' is-current' : ''}`} cx={positive.x} cy={positive.y} r={isCurrent ? 5 : 3} />
                <circle className={`mlx-nb-chart-point is-negative${isCurrent ? ' is-current' : ''}`} cx={negative.x} cy={negative.y} r={isCurrent ? 5 : 3} />
              </g>;
            })}
          </svg>}
          <div className="mlx-nb-chart-legend" aria-hidden="true">
            {chartView === '2d' ? <>
              <span><i className="is-positive" /> Favorece positiva</span>
              <span><i className="is-negative" /> Favorece negativa</span>
              <span><i className="is-unknown" /> Sin evidencia</span>
            </> : <>
              <span><i className="is-positive" /> P(positiva)</span>
              <span><i className="is-negative" /> P(negativa)</span>
              <span><i className="is-unknown" /> Evidencia de cada palabra</span>
            </>}
          </div>
        </div>

        <details className="mlx-nb-words">
          <summary>Ver el cálculo de evidencia</summary>
          <ol aria-label="Detalle del cálculo de Naive Bayes">
            {shown === 0 ? (
              <li>Probabilidades iniciales: ambas clases parten empatadas.</li>
            ) : (
              <>
                <li>Odds iniciales: <b>{partial.priorOdds.toFixed(2)}</b></li>
                {partial.words.map((word, i) => (
                  <li key={`${word.word}-${i}`} className={word.known ? (word.factor >= 1 ? 'is-pos' : 'is-neg') : 'is-unknown'}>
                    «{word.word}»: {word.known ? <b>factor ×{word.factor.toFixed(2)}</b> : <i>no está en el vocabulario, se ignora</i>}
                  </li>
                ))}
                <li>Odds finales: <b>{odds.toFixed(2)}</b> · P(positiva): <b>{pct(partial.pPositive)}</b></li>
              </>
            )}
          </ol>
        </details>
      </div>
    </OvaFrame>
  );
}
