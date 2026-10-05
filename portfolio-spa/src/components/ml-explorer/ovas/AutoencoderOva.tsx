import { useMemo, useState } from 'react';
import { AE_BOTTLENECK, AE_FRAUD, AE_NORMAL, AE_START_K } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { fitLinearAutoencoder, reconstructionError } from './ovaMath';

const W = 360;
const H = 220;
const TOP = 14;
const BOTTOM = 196;
/** Escala logarítmica: de 0.0001 (abajo) a 10 (arriba). Un error de 0 se dibuja abajo del todo. */
const [LOG_LO, LOG_HI] = [-4, 1];
const yOf = (e: number) => BOTTOM - ((Math.min(LOG_HI, Math.max(LOG_LO, Math.log10(e))) - LOG_LO) / (LOG_HI - LOG_LO)) * (BOTTOM - TOP);
/** Por debajo de esto el error es redondeo de la máquina: cuenta como 0. */
const ZERO = 1e-9;
const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const fmt = (e: number) => (e < ZERO ? '0' : e < 0.1 ? e.toFixed(3) : e.toFixed(2));

export function AutoencoderOva() {
  const [k, setK] = useState(AE_START_K);
  const { normal, fraud, threshold } = useMemo(() => {
    const ae = fitLinearAutoencoder(AE_NORMAL, k);
    const normal = AE_NORMAL.map((r) => reconstructionError(ae, r));
    return { normal, fraud: AE_FRAUD.map((r) => reconstructionError(ae, r)), threshold: Math.max(...normal) };
  }, [k]);
  const detected = fraud.filter((e) => e > threshold + ZERO).length;
  const errors = [...normal, ...fraud];
  const worst = errors.indexOf(Math.max(...errors));
  const barW = (W - 40) / errors.length;

  return (
    <OvaFrame
      title="Un cuello de botella que delata el fraude"
      hint="Cada barra es una compra y su altura es el error de reconstrucción: cuánto difiere la compra de su copia tras pasar por el cuello de botella. Las 40 azules son compras normales; las 3 rosas, fraudes que el autoencoder nunca vio. La línea punteada es el umbral: el mayor error entre las normales. El eje es logarítmico. Con k = 2 el autoencoder aprende el patrón de las normales y los fraudes quedan muy por encima. Si el cuello es tan ancho como la entrada (k = 6), copia todo, también el fraude. Este autoencoder es lineal: reconstruye igual que PCA con k componentes, en el mismo subespacio, con los ejes posiblemente girados."
      controls={
        <>
          <OvaSlider label="Cuello de botella k (de 6 medidas)" value={k} {...AE_BOTTLENECK} onChange={setK} />
          <button type="button" onClick={() => setK(AE_START_K)}>
            Restablecer
          </button>
        </>
      }
      readout={
        <>
          <span>
            Error medio: normales <b>{fmt(mean(normal))}</b> · fraudes <b>{fmt(mean(fraud))}</b>
          </span>
          <span>
            Umbral: <b>{fmt(threshold)}</b>
          </span>
          <span>
            Fraudes detectados: <b>{detected} de {fraud.length}</b>
          </span>
          {k === AE_BOTTLENECK.max && <span>Sin cuello de botella: reconstruye todo sin error y no detecta nada.</span>}
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Error de reconstrucción de 40 compras normales y 3 fraudes con un cuello de botella de ${k}; ${detected} fraudes por encima del umbral`}>
        {Array.from({ length: LOG_HI - LOG_LO + 1 }, (_, n) => {
          const v = 10 ** (LOG_HI - n);
          return (
            <g key={n}>
              <line x1={34} x2={W} y1={yOf(v)} y2={yOf(v)} stroke={OVA_COLORS.grid} />
              <text x={30} y={yOf(v) + 4} textAnchor="end" fontSize={10} fill={OVA_COLORS.axis}>
                {v >= 1 ? v : v.toFixed(n - LOG_HI)}
              </text>
            </g>
          );
        })}
        {errors.map((e, i) => {
          const isFraud = i >= normal.length;
          return (
            <rect
              key={i}
              className={isFraud ? 'mlx-ae-bar is-fraud' : 'mlx-ae-bar'}
              x={36 + i * barW}
              y={yOf(e)}
              width={barW - 1.5}
              height={BOTTOM - yOf(e)}
              fill={isFraud ? OVA_COLORS.risk : OVA_COLORS.class0}
            />
          );
        })}
        {errors[worst] > ZERO && (
          <text x={36 + worst * barW + barW / 2} y={Math.max(TOP + 8, yOf(errors[worst]) - 4)} textAnchor="middle" fontSize={11} fill={OVA_COLORS.risk}>
            ▼ la más rara
          </text>
        )}
        <line x1={34} x2={W} y1={yOf(threshold)} y2={yOf(threshold)} stroke={OVA_COLORS.accent} strokeWidth={1.5} strokeDasharray="5 4" />
        <text x={W - 2} y={yOf(threshold) - 4} textAnchor="end" fontSize={10} fill={OVA_COLORS.accent}>
          umbral
        </text>
        <text x={36} y={H - 4} fontSize={10} fill={OVA_COLORS.axis}>
          40 compras normales
        </text>
        <text x={W - 2} y={H - 4} textAnchor="end" fontSize={10} fill={OVA_COLORS.risk}>
          3 fraudes
        </text>
      </svg>
    </OvaFrame>
  );
}
