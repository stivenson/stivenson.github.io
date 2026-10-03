import { TAB_IDS, type TabId } from './types';

export interface ExplorerState {
  alg: string;
  tab: TabId;
}

function isTabId(value: string | null): value is TabId {
  return value !== null && (TAB_IDS as readonly string[]).includes(value);
}

/**
 * El algoritmo y la pestaña viven en la query (?alg=knn&tab=cons) para que
 * cada combinacion tenga su propio enlace y el boton «atras» funcione.
 * Valores invalidos se ignoran en vez de romper la pagina.
 */
export function parseExplorerState(params: URLSearchParams, availableSlugs: readonly string[]): ExplorerState {
  const rawAlg = params.get('alg');
  const rawTab = params.get('tab');
  return {
    alg: rawAlg !== null && availableSlugs.includes(rawAlg) ? rawAlg : availableSlugs[0],
    tab: isTabId(rawTab) ? rawTab : 'type',
  };
}

export function withExplorerState(params: URLSearchParams, state: ExplorerState): URLSearchParams {
  const next = new URLSearchParams(params);
  next.set('alg', state.alg);
  next.set('tab', state.tab);
  return next;
}
