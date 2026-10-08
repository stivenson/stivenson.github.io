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
const KERNELS = [
  { id: 'linear', label: 'Lineal' },
  { id: 'rbf', label: 'RBF (curvo)' },
] as const;

export function SvmOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [kernelId, setKernelId] = useState<'linear' | 'rbf'>('linear');
  const [maxCIndex, setMaxCIndex] = useState(START_C);
  const [step, setStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  const last = maxCIndex + 1; // step 0 es neutral; los siguientes aplican cada C hasta el máximo.
  useAutoLoop(step, last, setStep, visible, reducedMotion, autoPlay, 1050, 5000);
  const cIndex = Math.max(0, step - 1);
  const C = SVM_CS[cIndex];

  const model = useMemo(() => {
    const kernel: Kernel = kernelId === 'linear' ? { kind: 'linear' } : { kind: 'rbf', gamma: SVM_GAMMA };
    return trainSvm(POINTS, C, kernel);
  }, [C, kernelId]);
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
    return out;
  }, [model]);

  return (
    <OvaFrame
      title="La calle más ancha posible"
      hint="Los puntos empiezan neutrales. La animación ajusta la frontera para C = 0.01, 0.1, 1 y hasta el máximo elegido: al subir C, el modelo castiga más los errores y estrecha el margen. El relleno de cada punto muestra la predicción y su borde conserva la clase real; los anillos blancos marcan los vectores de soporte que definen la frontera. También puedes comparar el kernel lineal con el RBF (γ = 0.3)."
      controls={
        <>
          <div role="group" aria-label="Kernel">
            <span>Kernel: </span>
            {KERNELS.map((k) => (
              <button
                key={k.id}
                type="button"
                aria-pressed={kernelId === k.id}
                onClick={() => {
                  setKernelId(k.id);
                  setStep(0);
                }}
              >
                {k.label}
              </button>
            ))}
          </div>
          <OvaSlider
            label="C máximo (castigo por error)"
            value={maxCIndex}
            min={0}
            max={SVM_CS.length - 1}
            step={1}
            onChange={(value) => {
              setMaxCIndex(value);
              setStep(0);
            }}
            format={(i) => String(SVM_CS[i])}
          />
        </>
      }
      readout={
        <>
          <span>
            {step === 0 ? (
              <>Puntos observados: <b>{POINTS.length}</b></>
            ) : (
              <>Vectores de soporte: <b>{sv.size} de {POINTS.length}</b></>
            )}
          </span>
          <span>
            {step === 0 ? (
              <>Esperando el primer ajuste · kernel <b>{kernelId === 'linear' ? 'lineal' : 'RBF'}</b></>
            ) : (
              <>C = <b>{C}</b> · acierta <b>{hits} de {POINTS.length}</b> puntos</>
            )}
          </span>
          {step > 0 && kernelId === 'linear' && (
            <span>
              Ancho del margen: <b>{marginWidth(model).toFixed(2)}</b>
            </span>
          )}
        </>
      }
    >
      <div ref={stageRef}>
        <svg
          viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
          role="img"
          aria-label={`Plano de SVM con kernel ${kernelId === 'linear' ? 'lineal' : 'RBF'}, etapa ${step} de ${last}`}
        >
          {cells.map((c, i) => (
            <rect
              key={i}
              className="mlx-svm-cell"
              x={PLOT.sx(c.x)}
              y={PLOT.sy(c.y + CELL)}
              width={PLOT.sx(CELL) - PLOT.sx(0)}
              height={PLOT.sy(0) - PLOT.sy(CELL)}
              fill={step === 0 ? OVA_COLORS.axis : c.f > 0 ? OVA_COLORS.class1 : OVA_COLORS.class0}
              fillOpacity={step === 0 ? 0.08 : Math.abs(c.f) < 1 ? 0.06 : 0.22}
            />
          ))}
          {POINTS.map((p, i) => {
            const predicted = svmDecision(model, p) > 0 ? 1 : 0;
            const wrong = step > 0 && predicted !== p.label;
            return (
              <g key={i}>
                {step > 0 && sv.has(i) && (
                  <circle cx={PLOT.sx(p.x)} cy={PLOT.sy(p.y)} r={10} fill="none" stroke="#ffffff" strokeWidth={1.5} />
                )}
                <circle
                  cx={PLOT.sx(p.x)}
                  cy={PLOT.sy(p.y)}
                  r={6}
                  className="mlx-svm-point"
                  fill={step === 0 ? OVA_COLORS.axis : predicted ? OVA_COLORS.class1 : OVA_COLORS.class0}
                  stroke={step === 0 ? '#040320' : p.label ? OVA_COLORS.class1 : OVA_COLORS.class0}
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
