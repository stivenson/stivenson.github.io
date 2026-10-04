import { useMemo, useState } from 'react';
import { TREE_POINTS as POINTS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { accuracy, buildTree, countLeaves, treeRegions, type TreeNode } from './ovaMath';
import { createPlot } from './plot';

const PLOT = createPlot(320, 320, 30, [0, 10], [0, 10]);
const AXIS_NAMES = { x: 'ingreso', y: 'deuda' } as const;

function TreeView({ node, prefix }: { node: TreeNode; prefix?: string }) {
  const tag = prefix ? <b>{prefix} </b> : null;
  if (node.kind === 'leaf') {
    return (
      <li>
        {tag}
        {node.label ? '🟠 impago' : '🔵 paga'} <small>({node.count[0] + node.count[1]} clientes)</small>
      </li>
    );
  }
  return (
    <li>
      {tag}¿{AXIS_NAMES[node.axis]} ≤ {Number(node.threshold.toFixed(2))}?
      <ul className="mlx-tree">
        <TreeView node={node.left} prefix="sí →" />
        <TreeView node={node.right} prefix="no →" />
      </ul>
    </li>
  );
}

export function DecisionTreeOva() {
  const [depth, setDepth] = useState(1);
  const tree = useMemo(() => buildTree(POINTS, depth), [depth]);
  const regions = treeRegions(tree, { x0: 0, x1: 10, y0: 0, y1: 10 });
  const acc = accuracy(tree, POINTS);

  return (
    <OvaFrame
      title="Veinte preguntas para decidir"
      hint="Sube la profundidad: cada nivel agrega preguntas y parte el plano en más rectángulos."
      controls={<OvaSlider label="Profundidad máxima" value={depth} min={0} max={5} step={1} onChange={setDepth} />}
      readout={
        <>
          <span>
            <b>{countLeaves(tree)}</b> reglas (hojas) · acierta <b>{(acc * 100).toFixed(1)} %</b> de estos clientes
          </span>
          {depth === 2 && (
            <span>
              Hay 4 hojas pero el mismo acierto que con 1 nivel: los cortes nuevos dejan grupos más puros sin cambiar
              ninguna predicción.
            </span>
          )}
          {depth >= 4 && (
            <span>
              ⚠️ Desde aquí el árbol empieza a encerrar puntos de ruido en cajitas propias: ya está memorizando el ruido
              (overfitting). Este porcentaje es sobre los mismos datos con los que aprendió.
            </span>
          )}
        </>
      }
    >
      <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} role="img" aria-label="Plano dividido en rectángulos por el árbol">
        {regions.map((r, i) => (
          <rect
            key={i}
            x={PLOT.sx(r.x0)}
            y={PLOT.sy(r.y1)}
            width={PLOT.sx(r.x1) - PLOT.sx(r.x0)}
            height={PLOT.sy(r.y0) - PLOT.sy(r.y1)}
            fill={r.label ? OVA_COLORS.class1 : OVA_COLORS.class0}
            fillOpacity={0.14}
            stroke={OVA_COLORS.axis}
            strokeOpacity={0.5}
          />
        ))}
        <text x={PLOT.sx(10)} y={PLOT.height - 8} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
          ingreso →
        </text>
        <text x={8} y={PLOT.sy(10) - 10} fontSize={11} fill={OVA_COLORS.axis}>
          ↑ deuda
        </text>
        {POINTS.map((p, i) => (
          <circle
            key={i}
            cx={PLOT.sx(p.x)}
            cy={PLOT.sy(p.y)}
            r={6}
            fill={p.label ? OVA_COLORS.class1 : OVA_COLORS.class0}
            stroke="#040320"
            strokeWidth={1.5}
          />
        ))}
      </svg>
      <ul className="mlx-tree">
        <TreeView node={tree} />
      </ul>
    </OvaFrame>
  );
}
