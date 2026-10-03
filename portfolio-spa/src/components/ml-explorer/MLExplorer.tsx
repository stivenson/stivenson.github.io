import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlgorithmMenu } from './AlgorithmMenu';
import { AlgorithmPanel } from './AlgorithmPanel';
import { ALGORITHMS, AVAILABLE_SLUGS, getMeta, prefetchAlgorithm } from './registry';
import { parseExplorerState, withExplorerState, type ExplorerState } from './urlState';
import { useAlgorithm } from './useAlgorithm';
import './ml-explorer.css';

/**
 * Explorador del cheatsheet: menú de algoritmos a la izquierda y las 8
 * columnas como pestañas. El estado vive en la URL (?alg=&tab=).
 */
export function MLExplorer() {
  const [params, setParams] = useSearchParams();
  const { alg, tab } = parseExplorerState(params, AVAILABLE_SLUGS);
  const state = useAlgorithm(alg);
  const rootRef = useRef<HTMLElement>(null);
  const hasAlgParam = params.has('alg');

  const select = (next: Partial<ExplorerState>) =>
    setParams(withExplorerState(params, { alg, tab, ...next }), { preventScrollReset: true });

  // Al cambiar de algoritmo (o al llegar con ?alg= desde un enlace de la
  // guía), traer el explorador a la vista si quedó fuera de pantalla.
  useEffect(() => {
    const root = rootRef.current;
    if (!hasAlgParam || !root) return;
    const top = root.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.6) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [alg, hasAlgParam]);

  return (
    <section ref={rootRef} className="mlx" id="explorador" aria-label="Explorador de algoritmos de machine learning">
      <AlgorithmMenu
        algorithms={ALGORITHMS}
        activeSlug={alg}
        onSelect={(slug) => select({ alg: slug })}
        onPrefetch={prefetchAlgorithm}
      />
      <div className="mlx-main">
        <AlgorithmPanel
          meta={getMeta(alg)}
          state={state}
          tab={tab}
          onTab={(t) => select({ tab: t })}
          onAlg={(slug) => select({ alg: slug })}
        />
      </div>
    </section>
  );
}
