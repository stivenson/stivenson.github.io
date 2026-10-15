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

interface TreeSplit {
  axis: 'x' | 'y';
  threshold: number;
  count: [number, number];
  leftCount: number;
  rightCount: number;
  depth: number;
  bounds: { x0: number; x1: number; y0: number; y1: number };
}

function collectTreeSplits(
  node: TreeNode,
  bounds: TreeSplit['bounds'],
  depth = 0,
  splits: TreeSplit[] = [],
): TreeSplit[] {
  if (node.kind === 'leaf') return splits;
  splits.push({
    axis: node.axis,
    threshold: node.threshold,
    count: node.count,
    leftCount: node.left.count[0] + node.left.count[1],
    rightCount: node.right.count[0] + node.right.count[1],
    depth,
    bounds,
  });
  if (node.axis === 'x') {
    collectTreeSplits(node.left, { ...bounds, x1: node.threshold }, depth + 1, splits);
    collectTreeSplits(node.right, { ...bounds, x0: node.threshold }, depth + 1, splits);
  } else {
    collectTreeSplits(node.left, { ...bounds, y1: node.threshold }, depth + 1, splits);
    collectTreeSplits(node.right, { ...bounds, y0: node.threshold }, depth + 1, splits);
  }
  return splits;
}

function TreeView({ node, prefix, depth, activeDepth }: { node: TreeNode; prefix?: string; depth: number; activeDepth: number }) {
  const tag = prefix ? <b>{prefix} </b> : null;
  if (node.kind === 'leaf') {
    return (
      <li className={depth === activeDepth + 1 ? 'mlx-tree-leaf is-new' : 'mlx-tree-leaf'}>
        {tag}
        {node.label ? '🟠 impago' : '🔵 paga'} <small>({node.count[0] + node.count[1]} clientes)</small>
      </li>
    );
  }
  const active = depth === activeDepth;
  return (
    <li>
      <span className={`mlx-tree-rule${active ? ' is-active' : ''}`}>
        <span className="mlx-tree-rule-level">{active ? 'Nueva regla' : `Nivel ${depth + 1}`}</span>
        {tag}¿{AXIS_NAMES[node.axis]} ≤ {Number(node.threshold.toFixed(2))}?
        {active && (
          <small>
            sí: {node.left.count[0] + node.left.count[1]} · no: {node.right.count[0] + node.right.count[1]}
          </small>
        )}
      </span>
      <ul className="mlx-tree">
        <TreeView node={node.left} prefix="sí →" depth={depth + 1} activeDepth={activeDepth} />
        <TreeView node={node.right} prefix="no →" depth={depth + 1} activeDepth={activeDepth} />
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
  const splits = collectTreeSplits(tree, { x0: 0, x1: 10, y0: 0, y1: 10 });
  const activeDepth = shownDepth - 1;
  const activeSplits = splits.filter((split) => split.depth === activeDepth);
  const acc = accuracy(tree, POINTS);

  const playback = useAutoLoop(depth, maxDepth, setDepth, visible, reducedMotion, autoPlay, 1000, 5000, pauseForTreeWarning);

  return (
    <OvaFrame
      playback={playback}
      explanation={shownDepth === 0 ? 'El árbol todavía no divide los clientes: todos reciben la misma predicción inicial.' : shownDepth >= 4 ? 'Las líneas verdes son las reglas nuevas. En estos niveles el árbol crea regiones pequeñas para acertar incluso en el ruido: memorizar el entrenamiento no garantiza acertar con clientes nuevos.' : activeSplits.length === 1 ? 'La línea verde es la regla nueva de este nivel. La pregunta separa un grupo de clientes en dos regiones.' : `Las líneas verdes son las ${activeSplits.length} reglas nuevas de este nivel. Cada pregunta separa un grupo de clientes en dos regiones.`}
      title="El árbol divide el plano en reglas"
      hint="Los puntos empiezan neutrales. En cada ciclo, el árbol agrega un nivel de preguntas sobre ingreso o deuda y pinta las regiones según la clase que predice. El relleno de cada punto muestra esa predicción; su borde conserva la clase real para que se vean los errores. Puedes pausar o avanzar paso a paso. La profundidad máxima es un parámetro del modelo: al subirla, el árbol puede memorizar el ruido."
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
          {activeSplits.length > 0 && (
            <span className="mlx-tree-new-summary">
              <b>Nuevo en este paso:</b>{' '}
              {activeSplits.length === 1
                ? `${AXIS_NAMES[activeSplits[0].axis]} ≤ ${Number(activeSplits[0].threshold.toFixed(2))} separa ${activeSplits[0].leftCount} clientes en «sí» y ${activeSplits[0].rightCount} en «no».`
                : `${activeSplits.length} grupos reciben una pregunta nueva. Las líneas y reglas verdes muestran exactamente cuáles son.`}
            </span>
          )}
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
              strokeOpacity={0.28}
            />
          ))}
          {splits.map((split, i) => {
            const active = split.depth === activeDepth;
            const x1 = PLOT.sx(split.axis === 'x' ? split.threshold : split.bounds.x0);
            const x2 = PLOT.sx(split.axis === 'x' ? split.threshold : split.bounds.x1);
            const y1 = PLOT.sy(split.axis === 'y' ? split.threshold : split.bounds.y0);
            const y2 = PLOT.sy(split.axis === 'y' ? split.threshold : split.bounds.y1);
            const labelX = split.axis === 'x' ? x1 + 5 : (x1 + x2) / 2;
            const labelY = split.axis === 'y' ? y1 - 6 : (y1 + y2) / 2;
            return (
              <g key={`${split.axis}-${split.threshold}-${i}`}>
                <line
                  className={`mlx-tree-split${active ? ' is-new' : ''}`}
                  x1={x1}
                  x2={x2}
                  y1={y1}
                  y2={y2}
                />
                {active && (
                  <text className="mlx-tree-split-label" x={labelX} y={labelY} textAnchor={split.axis === 'y' ? 'middle' : 'start'}>
                    {AXIS_NAMES[split.axis]} ≤ {Number(split.threshold.toFixed(2))}
                  </text>
                )}
              </g>
            );
          })}
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
        <section className="mlx-tree-panel" aria-label="Reglas construidas por el árbol">
          <div className="mlx-tree-panel-head">
            <strong>Reglas construidas</strong>
            {shownDepth > 0 && <span>Verde = regla de este paso</span>}
          </div>
          <div className="mlx-tree-scroll">
            <ul className="mlx-tree">
              <TreeView node={tree} depth={0} activeDepth={activeDepth} />
            </ul>
          </div>
        </section>
      </div>
    </OvaFrame>
  );
}
