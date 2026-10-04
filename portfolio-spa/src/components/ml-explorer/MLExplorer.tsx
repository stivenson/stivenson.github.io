import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlgorithmMenu } from './AlgorithmMenu';
import { AlgorithmPanel } from './AlgorithmPanel';
import { ALGORITHMS, AVAILABLE_SLUGS, getMeta, prefetchAlgorithm } from './registry';
import { parseExplorerState, withExplorerState } from './urlState';
import type { TabId } from './types';
import { useAlgorithm } from './useAlgorithm';
import { OVERLAY_CLASS, useFullscreen } from './fullscreen';
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
  const fsButtonRef = useRef<HTMLButtonElement>(null);
  const fullscreen = useFullscreen(rootRef, fsButtonRef);
  const fullscreenActiveRef = useRef(false);
  useEffect(() => {
    fullscreenActiveRef.current = fullscreen.active;
  });

  // Se lee desde el efecto de scroll sin ser dependencia: el primer clic en
  // una pestaña añade ?alg a la URL y eso no debe mover la página.
  const hasAlgParamRef = useRef(params.has('alg'));
  useEffect(() => {
    hasAlgParamRef.current = params.has('alg');
  });

  // «Siguiente algoritmo» desplaza a la barra de pestañas; el scroll al
  // explorador completo sobraría.
  const skipRootScrollRef = useRef(false);
  // Algoritmo al que «Siguiente algoritmo» quiere llevar el foco y el scroll.
  // Cualquier otro cambio de algoritmo lo anula; AlgorithmTabs lo gasta al montar.
  const revealSlugRef = useRef<string | null>(null);
  const consumeReveal = useCallback((slug: string) => {
    if (revealSlugRef.current !== slug) return false;
    revealSlugRef.current = null;
    return true;
  }, []);

  // Si el chunk pedido con «Siguiente algoritmo» falla, el foco va a «Reintentar».
  const status = state.status;
  useEffect(() => {
    if (status !== 'error' || alg === null || revealSlugRef.current !== alg) return;
    revealSlugRef.current = null;
    rootRef.current?.querySelector<HTMLElement>('.mlx-error button')?.focus({ preventScroll: true });
  }, [status, alg]);

  // Al cambiar de algoritmo (o al llegar con ?alg= desde un enlace de la
  // guía), traer el explorador a la vista si quedó fuera de pantalla.
  useEffect(() => {
    const root = rootRef.current;
    if (skipRootScrollRef.current) {
      skipRootScrollRef.current = false;
      return;
    }
    // En pantalla completa el explorador ya ocupa la vista: nada que mover.
    if (!hasAlgParamRef.current || !root || fullscreenActiveRef.current) return;
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

  const select = (next: { alg?: string; tab?: TabId }) => {
    revealSlugRef.current = null;
    setParams(withExplorerState(params, { alg, tab, ...next }), { preventScrollReset: true });
  };

  const classes = [
    'mlx',
    fullscreen.active ? 'mlx--full' : '',
    fullscreen.mode === 'overlay' ? OVERLAY_CLASS : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      ref={rootRef}
      className={classes}
      id="explorador"
      aria-label="Explorador de algoritmos de machine learning"
    >
      <div className="mlx-bar">
        <h2 className="mlx-title">El explorador</h2>
        <button
          ref={fsButtonRef}
          type="button"
          className="mlx-fs-btn"
          aria-pressed={fullscreen.active}
          title={fullscreen.active ? 'Salir de pantalla completa (Esc)' : 'Ver el explorador a pantalla completa'}
          onClick={fullscreen.toggle}
        >
          <FullscreenIcon exit={fullscreen.active} />
          <span>{fullscreen.active ? 'Salir de pantalla completa' : 'Pantalla completa'}</span>
        </button>
      </div>
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
          onGoAlg={(slug) => {
            select({ alg: slug, tab: 'type' }); // select anula la petición anterior...
            skipRootScrollRef.current = true;
            revealSlugRef.current = slug; // ...y esta se pone después
          }}
          consumeReveal={consumeReveal}
        />
      </div>
    </section>
  );
}

/** Cuatro esquinas hacia fuera (entrar) o hacia dentro (salir). */
function FullscreenIcon({ exit }: { exit: boolean }) {
  const d = exit
    ? 'M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4'
    : 'M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4';
  return (
    <svg
      className="mlx-fs-icon"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}
