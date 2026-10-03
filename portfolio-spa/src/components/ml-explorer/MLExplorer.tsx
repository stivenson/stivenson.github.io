import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlgorithmMenu } from './AlgorithmMenu';
import { AlgorithmPanel } from './AlgorithmPanel';
import { ALGORITHMS, AVAILABLE_SLUGS, getMeta, prefetchAlgorithm } from './registry';
import { parseExplorerState, withExplorerState } from './urlState';
import type { TabId } from './types';
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

  // Se lee desde el efecto de scroll sin ser dependencia: el primer clic en
  // una pestaña añade ?alg a la URL y eso no debe mover la página.
  const hasAlgParamRef = useRef(params.has('alg'));
  useEffect(() => {
    hasAlgParamRef.current = params.has('alg');
  });

  // Al cambiar de algoritmo (o al llegar con ?alg= desde un enlace de la
  // guía), traer el explorador a la vista si quedó fuera de pantalla.
  useEffect(() => {
    const root = rootRef.current;
    if (!hasAlgParamRef.current || !root) return;
    const top = root.getBoundingClientRect().top;
    if (top >= 0 && top <= window.innerHeight * 0.6) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, [alg]);

  // Un ?alg o ?tab inválido (enlace viejo, algoritmo aún no disponible) se
  // corrige en la URL sin añadir una entrada al historial.
  const rawAlg = params.get('alg');
  const rawTab = params.get('tab');
  useEffect(() => {
    if (alg === null) return;
    const badAlg = rawAlg !== null && rawAlg !== alg;
    const badTab = rawTab !== null && rawTab !== tab;
    if (badAlg || badTab) {
      setParams((prev) => withExplorerState(prev, { alg, tab }), { replace: true, preventScrollReset: true });
    }
  }, [alg, tab, rawAlg, rawTab, setParams]);

  if (alg === null) return <div className="mlx-boot">Pronto: los algoritmos están en camino.</div>;

  const select = (next: { alg?: string; tab?: TabId }) =>
    setParams(withExplorerState(params, { alg, tab, ...next }), { preventScrollReset: true });

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
