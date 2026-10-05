import { useMemo, useState } from 'react';
import { HC_CUT, HC_POINTS as POINTS, HC_START_CUT } from './datasets';
import { CLUSTER_COLORS, OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { averageLinkage, cutTree, dendrogramLayout } from './ovaMath';
import { createPlot } from './plot';

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

export function HierarchicalOva() {
  const [cut, setCut] = useState<number>(HC_START_CUT);
  const labels = useMemo(() => cutTree(MERGES, N, cut), [cut]);
  const groups = Math.max(...labels) + 1;
  const sizes = Array.from({ length: groups }, (_, g) => labels.filter((l) => l === g).length);
  /** Color de un nodo: el de su grupo si queda bajo el corte; gris si queda por encima. */
  const color = (node: number) =>
    node < N || MERGES[node - N].height <= cut ? CLUSTER_COLORS[labels[LEAVES[node][0]] % CLUSTER_COLORS.length] : OVA_COLORS.axis;

  return (
    <OvaFrame
      title="Cortar el árbol de parecidos"
      hint="A la derecha, el dendrograma: cada unión junta los dos grupos más parecidos, y su altura es la distancia promedio entre ellos. Mueve la línea de corte: todo lo que se unió por debajo queda en el mismo grupo. Entre 2.2 y 5.2 no pasa nada (hay un salto grande): por eso 3 grupos es un corte natural. El punto 12, entre dos grupos, se une al de la derecha a altura 2.15."
      controls={
        <OvaSlider
          label="Altura del corte"
          value={cut}
          min={HC_CUT.min}
          max={HC_CUT.max}
          step={HC_CUT.step}
          onChange={setCut}
          format={(v) => v.toFixed(1)}
        />
      }
      readout={
        <>
          <span>
            Corte en <b>{cut.toFixed(1)}</b>: <b>{groups}</b> {groups === 1 ? 'grupo' : 'grupos'}
          </span>
          <span>
            Tamaños: <b>{sizes.join(', ')}</b>
          </span>
        </>
      }
    >
      <div className="mlx-hc-stage">
        <svg viewBox={`0 0 ${SCATTER.width} ${SCATTER.height}`} role="img" aria-label="Doce puntos numerados, coloreados según el grupo que les toca con el corte actual">
          {POINTS.map((p, i) => {
            const fill = CLUSTER_COLORS[labels[i] % CLUSTER_COLORS.length];
            const [dx, dy] = LABEL_AT[i];
            return (
              <g key={i}>
                <circle cx={SCATTER.sx(p.x)} cy={SCATTER.sy(p.y)} r={5} fill={fill} stroke="#040320" strokeWidth={1.5} />
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
        <svg viewBox={`0 0 ${TREE.width} ${TREE.height}`} role="img" aria-label={`Dendrograma de los doce puntos con la línea de corte en ${cut.toFixed(1)}`}>
          {MERGES.map((m, k) => {
            const node = LAYOUT.nodes[N + k];
            const stroke = color(N + k);
            return (
              <g key={k} stroke={stroke} strokeWidth={2} fill="none">
                {[m.a, m.b].map((child) => (
                  <path
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
          {/* Eje de alturas: la distancia a la que se unieron los grupos. */}
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
