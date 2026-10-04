import { useMemo, useState } from 'react';
import { DB_EPS, DB_MIN_PTS, DB_POINTS as POINTS, DB_START } from './datasets';
import { CLUSTER_COLORS, NOISE_COLOR, OvaFrame, OvaSlider } from './OvaFrame';
import { dbscan } from './ovaMath';
import { createPlot } from './plot';

// Misma escala en x y en y (30 px por unidad): los círculos de radio ε son círculos.
const PLOT = createPlot(340, 280, 20, [0, 10], [0, 8]);
const UNIT = PLOT.sx(1) - PLOT.sx(0);

export function DbscanOva() {
  const [eps, setEps] = useState<number>(DB_START.eps);
  const [minPts, setMinPts] = useState<number>(DB_START.minPts);
  const result = useMemo(() => dbscan(POINTS, eps, minPts), [eps, minPts]);
  const cores = result.core.filter(Boolean).length;
  const colorOf = (i: number) => (result.labels[i] < 0 ? NOISE_COLOR : CLUSTER_COLORS[result.labels[i] % CLUSTER_COLORS.length]);

  return (
    <OvaFrame
      title="Grupos por densidad: ε y minPts"
      hint="Un punto es núcleo (relleno) si tiene al menos minPts puntos a distancia ε o menos, contándose él mismo; el círculo tenue alrededor de cada núcleo mide ε. Dos núcleos a distancia ε o menos quedan en el mismo grupo, y así se encadena todo el grupo; los puntos de borde (anillo) se pegan al grupo de un núcleo vecino. Lo que no alcanza ningún núcleo es ruido (gris). Con ε pequeño casi todo es ruido; con ε grande las dos lunas se funden en un solo grupo."
      controls={
        <>
          <OvaSlider label="ε (radio del vecindario)" value={eps} min={DB_EPS.min} max={DB_EPS.max} step={DB_EPS.step} onChange={setEps} format={(v) => v.toFixed(1)} />
          <OvaSlider label="minPts (vecinos mínimos)" value={minPts} min={DB_MIN_PTS.min} max={DB_MIN_PTS.max} step={DB_MIN_PTS.step} onChange={setMinPts} />
          <button
            type="button"
            onClick={() => {
              setEps(DB_START.eps);
              setMinPts(DB_START.minPts);
            }}
          >
            Restablecer
          </button>
        </>
      }
      readout={
        <>
          <span>
            <b>{result.clusters}</b> {result.clusters === 1 ? 'grupo' : 'grupos'} y <b>{result.noise}</b> {result.noise === 1 ? 'punto' : 'puntos'} de ruido
          </span>
          <span>
            Núcleos: <b>{cores}</b> · borde: <b>{POINTS.length - cores - result.noise}</b>
          </span>
        </>
      }
    >
      <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} role="img" aria-label="Dos lunas de puntos y unos puntos sueltos, coloreados según el grupo que les asigna DBSCAN; el ruido en gris">
        {POINTS.map((p, i) =>
          result.core[i] ? (
            <circle key={`e${i}`} cx={PLOT.sx(p.x)} cy={PLOT.sy(p.y)} r={eps * UNIT} fill={colorOf(i)} fillOpacity={0.05} />
          ) : null,
        )}
        {POINTS.map((p, i) => {
          const noise = result.labels[i] < 0;
          const core = result.core[i];
          return (
            <circle
              key={i}
              className={noise ? 'is-noise' : core ? 'is-core' : 'is-border'}
              cx={PLOT.sx(p.x)}
              cy={PLOT.sy(p.y)}
              r={core ? 5.5 : 4.5}
              fill={core ? colorOf(i) : 'none'}
              stroke={noise ? NOISE_COLOR : core ? '#040320' : colorOf(i)}
              strokeWidth={core ? 1.2 : 2}
              strokeDasharray={noise ? '2 2' : undefined}
            />
          );
        })}
      </svg>
    </OvaFrame>
  );
}
