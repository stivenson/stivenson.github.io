import { AlgorithmTabs } from './AlgorithmTabs';
import { SummaryChips } from './SummaryChips';
import { GROUP_LABELS, type AlgorithmMeta, type TabId } from './types';
import type { AlgorithmState } from './useAlgorithm';

interface AlgorithmPanelProps {
  meta: AlgorithmMeta;
  state: AlgorithmState;
  tab: TabId;
  onTab: (tab: TabId) => void;
  onAlg: (slug: string) => void;
  onGoAlg: (slug: string) => void;
  /** true si `slug` es el algoritmo pedido con «Siguiente algoritmo» (y gasta la petición). */
  consumeReveal: (slug: string) => boolean;
}

export function AlgorithmPanel({ meta, state, tab, onTab, onAlg, onGoAlg, consumeReveal }: AlgorithmPanelProps) {
  return (
    <article className="mlx-panel">
      <header className="mlx-head">
        <span className="mlx-head-icon" aria-hidden="true">
          {meta.icon}
        </span>
        <div>
          <h3>{meta.name}</h3>
          <p>
            {meta.nameEs} · {GROUP_LABELS[meta.group]}
          </p>
        </div>
      </header>

      {state.status === 'loading' && (
        <div className="mlx-skeleton" aria-busy="true">
          Cargando {meta.name}…
        </div>
      )}
      {state.status === 'error' && (
        <div className="mlx-error" role="alert">
          No se pudo cargar {meta.name}. Revisa tu conexión.{' '}
          <button type="button" onClick={state.retry}>
            Reintentar
          </button>
        </div>
      )}
      {state.status === 'ready' && (
        <>
          <SummaryChips row={state.module.row} onPick={onTab} />
          <AlgorithmTabs
            module={state.module} meta={meta} tab={tab} onTab={onTab} onAlg={onAlg}
            onGoAlg={onGoAlg}
            consumeReveal={consumeReveal}
          />
        </>
      )}
    </article>
  );
}
