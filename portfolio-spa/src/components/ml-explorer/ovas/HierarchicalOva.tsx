import { useMemo, useRef, useState } from 'react';
import { HC_CUT, HC_POINTS as POINTS } from './datasets';
import { CLUSTER_COLORS, OVA_COLORS, OvaFrame } from './OvaFrame';
import { averageLinkage, dendrogramLayout } from './ovaMath';
import { createPlot } from './plot';
import { useInViewport, usePrefersReducedMotion } from './useMotion';
import { useAutoLoop } from './useAutoLoop';

const N = POINTS.length;
const MERGES = averageLinkage(POINTS);
const LAYOUT = dendrogramLayout(MERGES, N);
const SCATTER = createPlot(260, 260, 20, [0, 10], [0, 10]);
const TREE = createPlot(300, 260, 24, [-0.5, N - 0.5], [0, HC_CUT.max]);

/**
 * Dónde va el número de cada punto, respecto al punto (dx, dy en px del svg).
 * Varios puntos casi coinciden (1 y 4, 10 y 11): el número va fuera del
 * círculo, hacia el lado libre, para que ninguno tape a otro.
 */
const LABEL_AT: [number, number][] = [
  [0, 15], [11, 2], [-11, 2], [0, -9],
  [-11, 4], [11, 0], [11, 6], [-11, 0],
  [0, -9], [6, 15], [-4, -9],
  [0, 15],
];

/** Hojas que cuelgan de cada nodo (0…n−1 puntos, n + i uniones). */
const LEAVES: number[][] = [...POINTS.map((_, i) => [i])];
MERGES.forEach((m) => LEAVES.push([...LEAVES[m.a], ...LEAVES[m.b]]));

/** Grupos que existen después de las primeras `steps` uniones del algoritmo. */
function labelsAfter(steps: number): number[] {
  const active = new Set(POINTS.map((_, i) => i));
  MERGES.slice(0, steps).forEach((merge, i) => {
    active.delete(merge.a);
    active.delete(merge.b);
    active.add(N + i);
  });
  const roots = [...active].sort((a, b) => Math.min(...LEAVES[a]) - Math.min(...LEAVES[b]));
  return POINTS.map((_, i) => roots.findIndex((root) => LEAVES[root].includes(i)));
}

export function HierarchicalOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [progress, setProgress] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  const last = MERGES.length;
  const shownStep = Math.min(progress, last);
  const cut = shownStep === 0 ? 0 : MERGES[shownStep - 1].height;
  const labels = useMemo(() => labelsAfter(shownStep), [shownStep]);
  const groups = Math.max(...labels) + 1;
  const sizes = Array.from({ length: groups }, (_, g) => labels.filter((l) => l === g).length);

  useAutoLoop(progress, last, setProgress, visible, reducedMotion, autoPlay);

  const color = (node: number) => {
    const mergeIndex = node - N;
    return mergeIndex < shownStep
      ? CLUSTER_COLORS[labels[LEAVES[node][0]] % CLUSTER_COLORS.length]
      : OVA_COLORS.axis;
  };

  return (
    <OvaFrame
      title="Unir los puntos de abajo hacia arriba"
      hint="Cada paso une los dos grupos más parecidos; su altura es la distancia promedio entre ellos. Los puntos empiezan neutrales y toman el mismo color cuando quedan unidos. En el dendrograma, las uniones recorridas aparecen coloreadas y las que faltan se atenúan. El recorrido se repite automáticamente. Entre 2.2 y 5.2 hay un salto grande; por eso 3 grupos es un corte natural. El punto 12, entre dos grupos, se une al de la derecha a altura 2.15."
      readoutLive="off"
      readout={
        <>
          <span>
            Uniones: <b>{shownStep}</b> de <b>{last}</b> · <b>{groups}</b> {groups === 1 ? 'grupo' : 'grupos'}
          </span>
          <span>Tamaños: <b>{sizes.join(', ')}</b></span>
          {shownStep === 0 && <span>Todos los puntos parten separados y neutrales.</span>}
        </>
      }
    >
      <div ref={stageRef} className="mlx-hc-stage">
        <svg
          viewBox={`0 0 ${SCATTER.width} ${SCATTER.height}`}
          role="img"
          aria-label={`Doce puntos numerados${shownStep === 0 ? ', todavía sin uniones y todos neutrales' : `, en ${groups} grupos tras ${shownStep} uniones`}`}
        >
          {POINTS.map((p, i) => {
            const fill = shownStep === 0 ? OVA_COLORS.axis : CLUSTER_COLORS[labels[i] % CLUSTER_COLORS.length];
            const [dx, dy] = LABEL_AT[i];
            return (
              <g key={i}>
                <circle className="mlx-hc-point" cx={SCATTER.sx(p.x)} cy={SCATTER.sy(p.y)} r={5} fill={fill} stroke="#040320" strokeWidth={1.5} />
                <text
                  x={SCATTER.sx(p.x) + dx}
                  y={SCATTER.sy(p.y) + dy + 4}
                  textAnchor={dx > 0 ? 'start' : dx < 0 ? 'end' : 'middle'}
                  fontSize={12}
                  fontWeight={700}
                  fill={fill}
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>
        <svg
          viewBox={`0 0 ${TREE.width} ${TREE.height}`}
          role="img"
          aria-label={`Dendrograma de los doce puntos: ${shownStep} de ${last} uniones recorridas`}
        >
          {MERGES.map((m, k) => {
            const node = LAYOUT.nodes[N + k];
            const stroke = color(N + k);
            const pending = k >= shownStep;
            return (
              <g key={k} stroke={stroke} strokeWidth={2} fill="none" opacity={pending ? 0.28 : 1}>
                {[m.a, m.b].map((child) => (
                  <path
                    className="mlx-hc-link"
                    key={child}
                    d={`M${TREE.sx(LAYOUT.nodes[child].x)},${TREE.sy(LAYOUT.nodes[child].height)} V${TREE.sy(node.height)} H${TREE.sx(node.x)}`}
                  />
                ))}
              </g>
            );
          })}
          {LAYOUT.order.map((leaf, i) => (
            <text key={leaf} className="mlx-hc-leaf" x={TREE.sx(i)} y={TREE.height - 6} textAnchor="middle" fontSize={12} fill={OVA_COLORS.axis}>
              {leaf + 1}
            </text>
          ))}
          {[0, 2, 4, 6].map((h) => (
            <text key={h} x={TREE.sx(-0.5) - 4} y={TREE.sy(h) + 4} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
              {h}
            </text>
          ))}
          <text x={TREE.sx(-0.5) - 2} y={12} fontSize={11} fill={OVA_COLORS.axis}>
            altura
          </text>
          <line
            x1={TREE.sx(-0.5)}
            x2={TREE.sx(N - 0.5)}
            y1={TREE.sy(cut)}
            y2={TREE.sy(cut)}
            stroke={OVA_COLORS.risk}
            strokeDasharray="5 4"
            strokeWidth={1.5}
          />
        </svg>
      </div>
    </OvaFrame>
  );
}
