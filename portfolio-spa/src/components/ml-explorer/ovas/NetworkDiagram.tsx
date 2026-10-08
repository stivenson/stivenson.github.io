import type { CSSProperties } from 'react';

export interface NetworkDiagramNode {
  label?: string;
  value?: number;
  valueText?: string;
  active: boolean;
}

export interface NetworkDiagramLayer {
  label: string;
  color: string;
  nodes: NetworkDiagramNode[];
}

export interface NetworkDiagramConnection {
  fromLayer: number;
  fromNode: number;
  toLayer: number;
  toNode: number;
  weight: number;
  active: boolean;
}

const WIDTH = 480;
const HEIGHT = 184;
const CENTER_Y = 83;
const VERTICAL_SPAN = 100;

/** Dibuja capas densas con sus conexiones y activa cada neurona según el paso de la OVA. */
export function NetworkDiagram({
  layers,
  connections,
  label,
  showWeightLegend = false,
}: {
  layers: NetworkDiagramLayer[];
  connections: NetworkDiagramConnection[];
  label: string;
  showWeightLegend?: boolean;
}) {
  const xOf = (layer: number) => 54 + (layer * (WIDTH - 108)) / Math.max(1, layers.length - 1);
  const yOf = (node: number, count: number) => CENTER_Y + (node - (count - 1) / 2) * Math.min(22, VERTICAL_SPAN / Math.max(1, count));
  const position = (layer: number, node: number) => ({
    x: xOf(layer),
    y: yOf(node, layers[layer].nodes.length),
  });

  return (
    <div className="mlx-network-visual">
      <div className="mlx-network-caption">
        <strong>La red por dentro</strong>
        <span>Los nodos se activan al avanzar la señal</span>
      </div>
      <svg className="mlx-network-diagram" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={label}>
        {layers.map((layer, i) => (
          <text key={`layer-${i}`} className="mlx-network-layer-label" x={xOf(i)} y={18} textAnchor="middle">{layer.label}</text>
        ))}
        {connections.map((connection, i) => {
          const from = position(connection.fromLayer, connection.fromNode);
          const to = position(connection.toLayer, connection.toNode);
          const color = connection.weight < 0 ? '#c084fc' : '#55aaff';
          const style = { '--mlx-network-color': color } as CSSProperties;
          return (
            <line
              key={`edge-${i}`}
              className={`mlx-network-edge${connection.active ? ' is-active' : ''}`}
              style={style}
              x1={from.x + 12}
              y1={from.y}
              x2={to.x - 12}
              y2={to.y}
              strokeWidth={0.8 + Math.min(2.2, Math.abs(connection.weight) * 0.11)}
            />
          );
        })}
        {layers.flatMap((layer, layerIndex) => layer.nodes.map((node, nodeIndex) => {
          const { x, y } = position(layerIndex, nodeIndex);
          const opacity = node.active ? 0.35 + Math.min(0.65, Math.abs(node.value ?? 0.5) * 0.65) : 0.13;
          const style = { '--mlx-network-node-color': layer.color, '--mlx-network-node-opacity': opacity } as CSSProperties;
          return (
            <g key={`node-${layerIndex}-${nodeIndex}`} className={`mlx-network-node${node.active ? ' is-active' : ''}`} style={style}>
              <circle cx={x} cy={y} r={12} />
              {node.label && <text x={x} y={y + 3} textAnchor="middle">{node.label}</text>}
              <title>{`${layer.label}${node.label ? ` ${node.label}` : ` ${nodeIndex + 1}`}${node.valueText ? `: ${node.valueText}` : ''}${node.active ? ', activa' : ', pendiente'}`}</title>
            </g>
          );
        }))}
        {layers.map((layer, layerIndex) => layer.nodes.map((node, nodeIndex) => {
          const { x, y } = position(layerIndex, nodeIndex);
          return node.valueText ? (
            <text key={`value-${layerIndex}-${nodeIndex}`} className="mlx-network-value" x={x} y={y + 25} textAnchor="middle">{node.active ? node.valueText : '·'}</text>
          ) : null;
        }))}
        {showWeightLegend && (
          <g className="mlx-network-weight-legend" aria-hidden="true">
            <line x1={177} x2={195} y1={158} y2={158} stroke="#55aaff" />
            <text x={200} y={162}>peso +</text>
            <line x1={266} x2={284} y1={158} y2={158} stroke="#c084fc" />
            <text x={289} y={162}>peso −</text>
          </g>
        )}
      </svg>
    </div>
  );
}
