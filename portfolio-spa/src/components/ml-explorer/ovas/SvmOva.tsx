import { useMemo, useState } from 'react';
import { SVM_CS, SVM_GAMMA, SVM_POINTS as POINTS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { marginWidth, supportVectors, svmAccuracy, svmDecision, trainSvm, type Kernel } from './ovaMath';
import { createPlot } from './plot';

const PLOT = createPlot(320, 320, 30, [0, 10], [0, 10]);
const CELLS = 32;
const CELL = 10 / CELLS;
const START_C = 2; // índice de C = 1, el valor por defecto de scikit-learn
const KERNELS = [
  { id: 'linear', label: 'Lineal' },
  { id: 'rbf', label: 'RBF (curvo)' },
] as const;

export function SvmOva() {
  const [kernelId, setKernelId] = useState<'linear' | 'rbf'>('linear');
  const [cIndex, setCIndex] = useState(START_C);
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
      hint="La SVM busca la frontera con el margen más ancho (la franja clara). Los puntos con anillo blanco son los vectores de soporte: solo ellos deciden dónde va la frontera. Sube C para castigar más los errores y mira qué hace con el punto naranja metido entre los azules; luego cambia a kernel RBF. En el modo RBF, γ está fijo en 0.3. Con RBF y C = 10 o más acierta los 22, incluido el punto raro: la frontera hace un rodeo solo para él. Eso es memorizar un punto, no aprender una regla."
      controls={
        <>
          <div role="group" aria-label="Kernel">
            <span>Kernel: </span>
            {KERNELS.map((k) => (
              <button key={k.id} type="button" aria-pressed={kernelId === k.id} onClick={() => setKernelId(k.id)}>
                {k.label}
              </button>
            ))}
          </div>
          <OvaSlider
            label="C (castigo por error)"
            value={cIndex}
            min={0}
            max={SVM_CS.length - 1}
            step={1}
            onChange={setCIndex}
            format={(i) => String(SVM_CS[i])}
          />
          <button
            type="button"
            onClick={() => {
              setKernelId('linear');
              setCIndex(START_C);
            }}
          >
            Restablecer
          </button>
        </>
      }
      readout={
        <>
          <span>
            Vectores de soporte: <b>{sv.size} de {POINTS.length}</b>
          </span>
          <span>
            Acierta <b>{hits} de {POINTS.length}</b> puntos
          </span>
          {kernelId === 'linear' && (
            <span>
              Ancho del margen: <b>{marginWidth(model).toFixed(2)}</b>
            </span>
          )}
        </>
      }
    >
      <svg
        viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
        role="img"
        aria-label="Plano dividido por la SVM, con su margen y los vectores de soporte marcados"
      >
        {cells.map((c, i) => (
          <rect
            key={i}
            x={PLOT.sx(c.x)}
            y={PLOT.sy(c.y + CELL)}
            width={PLOT.sx(CELL) - PLOT.sx(0)}
            height={PLOT.sy(0) - PLOT.sy(CELL)}
            fill={c.f > 0 ? OVA_COLORS.class1 : OVA_COLORS.class0}
            fillOpacity={Math.abs(c.f) < 1 ? 0.06 : 0.22}
          />
        ))}
        {POINTS.map((p, i) => (
          <g key={i}>
            {sv.has(i) && (
              <circle cx={PLOT.sx(p.x)} cy={PLOT.sy(p.y)} r={10} fill="none" stroke="#ffffff" strokeWidth={1.5} />
            )}
            <circle
              cx={PLOT.sx(p.x)}
              cy={PLOT.sy(p.y)}
              r={6}
              fill={p.label ? OVA_COLORS.class1 : OVA_COLORS.class0}
              stroke="#040320"
              strokeWidth={1.5}
            />
          </g>
        ))}
      </svg>
    </OvaFrame>
  );
}
