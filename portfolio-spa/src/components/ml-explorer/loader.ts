import type { AlgorithmModule } from './types';

export type ModuleLoader = () => Promise<{ default: AlgorithmModule }>;

/**
 * Envuelve los import() dinamicos de los algoritmos.
 *
 * Guarda la promesa para que dos peticiones (hover que precarga + clic) no
 * descarguen el chunk dos veces. Si la descarga falla, la borra de la cache:
 * asi el boton «Reintentar» vuelve a intentarlo de verdad.
 */
export function createAlgorithmLoader(loaders: Readonly<Record<string, ModuleLoader>>) {
  const cache = new Map<string, Promise<AlgorithmModule>>();

  return function load(slug: string): Promise<AlgorithmModule> {
    const cached = cache.get(slug);
    if (cached) return cached;

    const loader = loaders[slug];
    if (!loader) return Promise.reject(new Error(`Algoritmo desconocido: ${slug}`));

    const promise = loader().then((m) => m.default);
    cache.set(slug, promise);
    promise.catch(() => cache.delete(slug));
    return promise;
  };
}
