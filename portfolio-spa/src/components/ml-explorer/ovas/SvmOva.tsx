import { G } from '../Gloss';
import { useMemo, useRef, useState } from 'react';
import { SVM_CS, SVM_GAMMA, SVM_POINTS as POINTS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { marginWidth, supportVectors, svmAccuracy, svmDecision, trainSvm, type Kernel } from './ovaMath';
import { createPlot } from './plot';
import { useInViewport, usePrefersReducedMotion } from './useMotion';
import { useAutoLoop } from './useAutoLoop';

const PLOT = createPlot(320, 320, 30, [0, 10], [0, 10]);
const CELLS = 32;
const CELL = 10 / CELLS;
const START_C = 2; // índice de C = 1, el valor por defecto de scikit-learn
const GAMMAS = [0.03, SVM_GAMMA, 3];
const KERNELS = [
  { id: 'linear', label: 'Lineal' },
  { id: 'rbf', label: 'RBF (curvo)' },
] as const;

export function SvmOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [kernelId, setKernelId] = useState<'linear' | 'rbf'>('linear');
  const [maxCIndex, setMaxCIndex] = useState(START_C);
  const [gamma, setGamma] = useState(SVM_GAMMA);
  const [showFinal, setShowFinal] = useState(false);
  const [step, setStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  const last = maxCIndex + 1; // step 0 es neutral; los siguientes aplican cada C hasta el máximo.
  const playback = useAutoLoop(step, last, setStep, visible && !showFinal, reducedMotion, autoPlay && !showFinal, 1050, 5000);
  const shown = showFinal ? last : Math.min(step, last);
  const cIndex = Math.max(0, shown - 1);
  const C = SVM_CS[cIndex];

  const model = useMemo(() => {
    const kernel: Kernel = kernelId === 'linear' ? { kind: 'linear' } : { kind: 'rbf', gamma };
    return trainSvm(POINTS, C, kernel);
  }, [C, kernelId, gamma]);
  const sv = new Set(supportVectors(model));
  const hits = Math.round(svmAccuracy(model, POINTS) * POINTS.length);

  const cells = useMemo(() => {
    const out: { x: number; y: number; f: number }[] = [];
    for (let i = 0; i < CELLS; i++) {
      for (let j = 0; j < CELLS; j++) {
        const x = i * CELL;
        const y = j * CELL;
        out.push({ x, y, f: svmDecision(model, { x: x + CELL / 2, y: y + CELL / 2 }) });
      }
    }
    // Una banda |f| pequeña no es un contorno: con RBF local puede cubrir
    // regiones enteras lejos de los puntos. Marcar cambios de signo vecinos.
    return out.map((cell, index) => {
      const i = Math.floor(index / CELLS);
      const j = index % CELLS;
      const neighbors = [i + 1 < CELLS ? out[index + CELLS] : null, j + 1 < CELLS ? out[index + 1] : null];
      return { ...cell, boundary: neighbors.some((other) => other !== null && (other.f > 0) !== (cell.f > 0)) };
    });
  }, [model]);

  return (
    <OvaFrame
      playback={showFinal ? undefined : playback}
      progressLabel={shown === 0 ? 'Sin ajustar' : <>Configuración {shown} de {last} · C = {C}</>}
      explanation={shown === 0
        ? 'El ajuste combina un margen amplio con penalizar sus violaciones según C. El recorrido compara configuraciones; no muestra las iteraciones del solver.'
        : kernelId === 'linear'
          ? `Con C = ${C}, la línea verde separa las clases y la franja oscura muestra el margen. Los anillos blancos marcan los vectores de soporte; las cifras son de entrenamiento.`
          : `Con C = ${C}, gamma = ${gamma} y kernel RBF: la frontera verde puede curvarse para adaptarse a los datos. La franja oscura representa la zona de margen en el espacio del kernel, no una distancia uniforme en este plano.`}
      title="La calle más ancha posible"
      hint="La franja oscura es la zona de margen; en RBF no mide una distancia uniforme en este plano. El verde aproxima la frontera, los anillos marcan vectores de soporte, el relleno indica la predicción y el borde la clase real. Compara ajustes con la vista final."
      controls={
        <>
          <div className="mlx-parameter-set" role="group" aria-label="Hiperparámetros de SVM">
            <strong>Ajustes de entrenamiento</strong>
            <div className="mlx-parameter-fields">
              <div className="mlx-parameter-field">
                <strong>Forma de separación (kernel)</strong>
                <div role="group" aria-label="Kernel">
                  {KERNELS.map((k) => <button key={k.id} type="button" aria-pressed={kernelId === k.id} onClick={() => { setKernelId(k.id); setStep(0); }}>{k.label}</button>)}
                </div>
                <p>El <G k="kernel">kernel</G> define cómo compara ejemplos. Lineal produce una recta; <G k="rbf">RBF</G> permite curvas. Más flexibilidad no garantiza mayor acierto en casos nuevos.</p>
              </div>
              <div className="mlx-parameter-field">
                <OvaSlider label="C elegido (penalización)" value={maxCIndex} min={0} max={SVM_CS.length - 1} step={1} onChange={(value) => { setMaxCIndex(value); setStep(0); }} format={(i) => String(SVM_CS[i])} />
                <p><G k="parametroC">C</G> pondera las violaciones del margen, incluso en puntos bien clasificados dentro de la franja. Aumentarlo da más peso a ese castigo; 1 no es un equilibrio universal. Activa el ajuste elegido para comparar directamente.</p>
              </div>
              <div className="mlx-parameter-field mlx-parameter-field--wide">
                <label>Influencia local en RBF (gamma)
                  <select aria-label="Influencia local en RBF (gamma)" disabled={kernelId === 'linear'} value={gamma} onChange={(e) => { setGamma(Number(e.target.value)); setStep(0); }}>
                    {GAMMAS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </label>
                <p>{kernelId === 'linear' ? <>El kernel lineal ignora <G k="gamma">gamma</G>. Selecciona RBF para habilitar este control.</> : <>Un <G k="gamma">gamma mayor</G> hace más local la influencia de los ejemplos. Compara 0.03, 0.3 y 3 manteniendo C; después cambia C. No es una probabilidad ni el número de iteraciones.</>}</p>
              </div>
            </div>
            <output aria-label="Configuración elegida">Elegido: kernel {kernelId === 'linear' ? 'lineal' : 'RBF'} · C = {SVM_CS[maxCIndex]} · gamma {kernelId === 'linear' ? 'no aplica' : `= ${gamma}`}. {shown === 0 ? 'El recorrido aún no muestra una frontera.' : `Mostrando C = ${C}: ${hits} de ${POINTS.length} aciertos de entrenamiento.`}</output>
          </div>
          <label><input type="checkbox" checked={showFinal} onChange={(e) => { setShowFinal(e.target.checked); playback.restart(); }} /> Mostrar ajuste elegido</label>
          <p>Sin esa vista fija, el recorrido compara C desde 0.01 hasta el valor elegido. Cada paso es un modelo recalculado con otro C; los pasos y la velocidad son <G k="controlDidactico">controles de visualización</G>, no iteraciones del optimizador.</p>
          <details className="mlx-parameter-notes"><summary>Escalas y alcance de esta simulación</summary>
            <p>22 puntos simulados, dos clases y dos variables en la misma escala 0–10. No se aprende un escalado aquí; en Python se usa <G k="escalado">StandardScaler</G> ajustado solo con entrenamiento. Cambiar las unidades altera las distancias y exige revisar C y gamma.</p>
            <p>Fijos: pesos de clase iguales, tolerancia 1e-6 y hasta un millón de actualizaciones del solver didáctico. La frontera se dibuja sobre una cuadrícula de 32 × 32; su grosor verde es aproximado. El puntaje decide la clase, no es una probabilidad. Las cifras de acierto no son una evaluación independiente.</p>
          </details>
          <button type="button" onClick={() => { setKernelId('linear'); setMaxCIndex(START_C); setGamma(SVM_GAMMA); setShowFinal(false); playback.restart(); }}>Restablecer ajustes</button>
        </>
      }
      readout={
        <>
          <span>
            {shown === 0 ? (
              <>Puntos observados: <b>{POINTS.length}</b></>
            ) : (
              <>Vectores de soporte: <b>{sv.size} de {POINTS.length}</b></>
            )}
          </span>
          <span>
            {shown === 0 ? (
              <>Esperando el primer ajuste · kernel <b>{kernelId === 'linear' ? 'lineal' : 'RBF'}</b></>
            ) : (
              <>C = <b>{C}</b> · acierta <b>{hits} de {POINTS.length}</b> puntos de entrenamiento</>
            )}
          </span>
          {shown > 0 && kernelId === 'linear' && (
            <span>
              Ancho del margen: <b>{marginWidth(model).toFixed(2)}</b>
            </span>
          )}
          {shown > 0 && (
            <span className="mlx-svm-reading">
              <b>Lectura:</b>{' '}
              {kernelId === 'rbf'
                ? C >= 10
                  ? 'C y gamma actúan juntos: el ajuste puede seguir casos aislados con más detalle, sin garantizar generalización.'
                  : 'La frontera curva conserva tolerancia ante puntos difíciles.'
                : C < 1
                  ? 'C bajo tolera más errores para conservar un margen ancho.'
                  : C > 1
                    ? 'C alto da más peso a las violaciones del margen; compara el ancho y los aciertos, sin inferir mejora fuera del entrenamiento.'
                    : 'C = 1 es un punto de comparación; no garantiza el mejor equilibrio para estos datos.'}
            </span>
          )}
        </>
      }
    >
      <div ref={stageRef}>
        <svg
          viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
          role="img"
          aria-label={`Plano de SVM con kernel ${kernelId === 'linear' ? 'lineal' : 'RBF'}, configuración ${shown} de ${last}`}
        >
          <text x={PLOT.sx(10)} y={PLOT.height - 8} textAnchor="end" fill={OVA_COLORS.axis} fontSize={10}>variable 1 (0–10) →</text>
          <text x={PLOT.sx(0)} y={16} fill={OVA_COLORS.axis} fontSize={10}>↑ variable 2 (0–10)</text>
          {cells.map((c, i) => {
            const boundary = shown > 0 && c.boundary;
            return (
              <rect
                key={i}
                className={`mlx-svm-cell${boundary ? ' is-boundary' : ''}`}
                x={PLOT.sx(c.x)}
                y={PLOT.sy(c.y + CELL)}
                width={PLOT.sx(CELL) - PLOT.sx(0)}
                height={PLOT.sy(0) - PLOT.sy(CELL)}
                fill={shown === 0 ? OVA_COLORS.axis : boundary ? OVA_COLORS.accent : c.f > 0 ? OVA_COLORS.class1 : OVA_COLORS.class0}
                fillOpacity={shown === 0 ? 0.08 : boundary ? 0.78 : Math.abs(c.f) < 1 ? 0.06 : 0.22}
              />
            );
          })}
          {POINTS.map((p, i) => {
            const predicted = svmDecision(model, p) > 0 ? 1 : 0;
            const wrong = shown > 0 && predicted !== p.label;
            return (
              <g key={i}>
                {shown > 0 && sv.has(i) && (
                  <circle cx={PLOT.sx(p.x)} cy={PLOT.sy(p.y)} r={10} fill="none" stroke="#ffffff" strokeWidth={1.5} />
                )}
                <circle
                  cx={PLOT.sx(p.x)}
                  cy={PLOT.sy(p.y)}
                  r={6}
                  className="mlx-svm-point"
                  fill={shown === 0 ? OVA_COLORS.axis : predicted ? OVA_COLORS.class1 : OVA_COLORS.class0}
                  stroke={shown === 0 ? '#040320' : p.label ? OVA_COLORS.class1 : OVA_COLORS.class0}
                  strokeWidth={wrong ? 3 : 1.5}
                  strokeDasharray={wrong ? '2 2' : undefined}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </OvaFrame>
  );
}
