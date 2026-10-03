import { OVA_COLORS } from './ovas/OvaFrame';
import type { AlgorithmGroup } from './types';

const DOTS: [number, number, 0 | 1][] = [
  [30, 40, 0], [48, 28, 0], [40, 62, 0], [62, 48, 0], [26, 80, 0],
  [130, 70, 1], [150, 52, 1], [160, 88, 1], [138, 98, 1], [176, 66, 1],
];

const LAYERS: { x: number; ys: number[] }[] = [
  { x: 40, ys: [30, 60, 90] },
  { x: 105, ys: [20, 47, 74, 101] },
  { x: 170, ys: [45, 75] },
];

const CAPTIONS: Record<AlgorithmGroup, string> = {
  supervised: 'Cada dato trae su respuesta (color). El modelo aprende a predecirla para datos nuevos.',
  unsupervised: 'Los datos no traen respuesta. El modelo busca grupos por sí solo.',
  reduction: 'Muchas columnas se resumen en pocas, perdiendo la menor información posible.',
  neural: 'Capas de neuronas simples que, juntas, aprenden patrones complejos.',
};

/** Mini-figura de la pestaña «Tipo». */
export function TypeFigure({ group }: { group: AlgorithmGroup }) {
  return (
    <figure className="mlx-typefig">
      <svg viewBox="0 0 210 120" aria-hidden="true">
        {group === 'supervised' &&
          DOTS.map(([x, y, label], i) => (
            <circle key={i} cx={x} cy={y} r={6} fill={label ? OVA_COLORS.class1 : OVA_COLORS.class0} />
          ))}
        {group === 'unsupervised' && (
          <>
            {DOTS.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={6} fill="#9898b0" />
            ))}
            <ellipse cx={44} cy={54} rx={34} ry={40} fill="none" stroke={OVA_COLORS.accent} strokeDasharray="4 4" />
            <ellipse cx={152} cy={76} rx={36} ry={36} fill="none" stroke={OVA_COLORS.accent} strokeDasharray="4 4" />
          </>
        )}
        {group === 'reduction' && (
          <>
            {[20, 34, 48, 62, 76, 90].map((y) => (
              <rect key={y} x={20} y={y} width={70} height={8} rx={2} fill={OVA_COLORS.class0} opacity={0.7} />
            ))}
            <path d="M100 60 H130" stroke={OVA_COLORS.axis} strokeWidth={2} markerEnd="url(#mlx-arrow)" />
            {[48, 64].map((y) => (
              <rect key={y} x={140} y={y} width={50} height={8} rx={2} fill={OVA_COLORS.accent} />
            ))}
            <defs>
              <marker id="mlx-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill={OVA_COLORS.axis} />
              </marker>
            </defs>
          </>
        )}
        {group === 'neural' && (
          <>
            {LAYERS.slice(0, -1).flatMap((layer, i) =>
              layer.ys.flatMap((y) =>
                LAYERS[i + 1].ys.map((y2) => (
                  <line
                    key={`${i}-${y}-${y2}`}
                    x1={layer.x}
                    y1={y}
                    x2={LAYERS[i + 1].x}
                    y2={y2}
                    stroke={OVA_COLORS.axis}
                    strokeOpacity={0.35}
                  />
                )),
              ),
            )}
            {LAYERS.flatMap((layer) =>
              layer.ys.map((y) => <circle key={`${layer.x}-${y}`} cx={layer.x} cy={y} r={7} fill={OVA_COLORS.class0} />),
            )}
          </>
        )}
      </svg>
      <figcaption>{CAPTIONS[group]}</figcaption>
    </figure>
  );
}
