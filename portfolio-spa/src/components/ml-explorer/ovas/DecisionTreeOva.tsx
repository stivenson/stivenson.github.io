import { useMemo, useRef, useState } from 'react';
import { TREE_POINTS as POINTS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { accuracy, buildTree, countLeaves, predictTree, treeRegions, type TreeNode } from './ovaMath';
import { createPlot } from './plot';
import { useInViewport, usePrefersReducedMotion } from './useMotion';
import { useAutoLoop } from './useAutoLoop';

const PLOT = createPlot(320, 320, 30, [0, 10], [0, 10]);
const AXIS_NAMES = { x: 'ingreso', y: 'deuda' } as const;
const WARNING_PAUSE_MS = 2600;
const pauseForTreeWarning = (step: number, last: number) => step >= 4 && step < last ? WARNING_PAUSE_MS : undefined;

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

export function DecisionTreeOva({ autoPlay = false }: { autoPlay?: boolean }) {
  const [maxDepth, setMaxDepth] = useState(5);
  const [depth, setDepth] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();
  const shownDepth = Math.min(depth, maxDepth);
  const tree = useMemo(() => buildTree(POINTS, shownDepth), [shownDepth]);
  const regions = treeRegions(tree, { x0: 0, x1: 10, y0: 0, y1: 10 });
  const acc = accuracy(tree, POINTS);

  useAutoLoop(depth, maxDepth, setDepth, visible, reducedMotion, autoPlay, 1000, 5000, pauseForTreeWarning);

  return (
    <OvaFrame
      title="El árbol divide el plano en reglas"
      hint="Los puntos empiezan neutrales. En cada ciclo, el árbol agrega un nivel de preguntas sobre ingreso o deuda y pinta las regiones según la clase que predice. El relleno de cada punto muestra esa predicción; su borde conserva la clase real para que se vean los errores. El recorrido se repite automáticamente. La profundidad máxima es un parámetro del modelo: al subirla, el árbol puede memorizar el ruido."
      controls={
        <OvaSlider
          label="Profundidad máxima"
          value={maxDepth}
          min={1}
          max={5}
          step={1}
          onChange={(value) => {
            setMaxDepth(value);
            setDepth(0);
          }}
        />
      }
      readoutLive="off"
      readout={
        <>
          <span>
            Nivel <b>{shownDepth}</b> de <b>{maxDepth}</b> · <b>{countLeaves(tree)}</b> reglas · acierta{' '}
            <b>{(acc * 100).toFixed(1)} %</b> de estos clientes
          </span>
          <span>Relleno: predicción del árbol · borde: clase real del cliente.</span>
          {shownDepth === 2 && (
            <span>
              Hay 4 hojas pero el mismo acierto que con 1 nivel: los cortes nuevos dejan grupos más puros sin cambiar
              ninguna predicción.
            </span>
          )}
          {shownDepth >= 4 && (
            <div className="mlx-tree-overfit">
              <strong><span aria-hidden="true">⚠️</span> Sobreajuste: el árbol memoriza el ruido</strong>
              <p>
                Desde aquí el árbol empieza a encerrar puntos de ruido en cajitas propias: ya está memorizando el ruido
                (overfitting). Este porcentaje se calcula sobre los mismos datos con los que aprendió.
              </p>
            </div>
          )}
        </>
      }
    >
      <div ref={stageRef}>
        <svg
          viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
          role="img"
          aria-label={`Árbol de decisión en el nivel ${shownDepth} de ${maxDepth}: ${regions.length} regiones predichas y ${POINTS.length} clientes; el relleno indica la predicción y el borde su clase real`}
        >
          {regions.map((r, i) => (
            <rect
              key={i}
              className="mlx-tree-region"
              x={PLOT.sx(r.x0)}
              y={PLOT.sy(r.y1)}
              width={PLOT.sx(r.x1) - PLOT.sx(r.x0)}
              height={PLOT.sy(r.y0) - PLOT.sy(r.y1)}
              fill={shownDepth === 0 ? OVA_COLORS.axis : r.label ? OVA_COLORS.class1 : OVA_COLORS.class0}
              fillOpacity={shownDepth === 0 ? 0.08 : 0.14}
              stroke={OVA_COLORS.axis}
              strokeOpacity={0.5}
            />
          ))}
          <text x={PLOT.sx(10)} y={PLOT.height - 8} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
            ingreso →
          </text>
          <text x={8} y={PLOT.sy(10) - 10} fontSize={11} fill={OVA_COLORS.axis}>
            ↑ deuda (escala 0-10)
          </text>
          {POINTS.map((p, i) => {
            const predicted = predictTree(tree, p);
            const wrong = predicted !== p.label;
            return (
              <circle
                key={i}
                className="mlx-tree-point"
                cx={PLOT.sx(p.x)}
                cy={PLOT.sy(p.y)}
                r={6}
                fill={shownDepth === 0 ? OVA_COLORS.axis : predicted ? OVA_COLORS.class1 : OVA_COLORS.class0}
                stroke={shownDepth === 0 ? '#040320' : p.label ? OVA_COLORS.class1 : OVA_COLORS.class0}
                strokeWidth={wrong ? 3 : 1.5}
                strokeDasharray={wrong ? '2 2' : undefined}
              />
            );
          })}
        </svg>
        <ul className="mlx-tree">
          <TreeView node={tree} />
        </ul>
      </div>
    </OvaFrame>
  );
}
