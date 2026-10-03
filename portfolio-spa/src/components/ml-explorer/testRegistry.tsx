/**
 * Registry falso para los tests de DOM (`vi.mock('./registry', ...)`).
 * No lo importa el código de la app: solo los *.dom.test.tsx.
 *
 * Tres filas: «alpha» y «beta» disponibles, «gamma» todavía «pronto».
 * `loadAlgorithm` resuelve sola (modo auto) o deja la promesa en `pending`
 * para que el test la resuelva o rechace a mano, en el orden que quiera.
 */
import { TAB_IDS, type AlgorithmMeta, type AlgorithmModule, type TabId } from './types';

export const ALGORITHMS: AlgorithmMeta[] = [
  { slug: 'alpha', name: 'Alpha', nameEs: 'Alfa', icon: 'A', group: 'supervised', available: true },
  { slug: 'beta', name: 'Beta', nameEs: 'Beta', icon: 'B', group: 'supervised', available: true },
  { slug: 'gamma', name: 'Gamma', nameEs: 'Gama', icon: 'G', group: 'unsupervised', available: false },
];

export const AVAILABLE_SLUGS: string[] = ALGORITHMS.filter((a) => a.available).map((a) => a.slug);

export function getMeta(slug: string): AlgorithmMeta {
  const meta = ALGORITHMS.find((a) => a.slug === slug);
  if (!meta) throw new Error(`Algoritmo sin fila en el registry: ${slug}`);
  return meta;
}

export function fakeModule(slug: string): AlgorithmModule {
  const row = {} as Record<TabId, string>;
  const tabs = {} as AlgorithmModule['tabs'];
  for (const id of TAB_IDS) {
    row[id] = `CHEAT-${slug}-${id}`;
    tabs[id] = { essential: <p>{`ESENCIAL-${slug}-${id}`}</p> };
  }
  return {
    slug,
    row,
    tabs,
    Ova: () => <div>OVA-{slug}</div>,
    python: { code: 'print(1)', expectedOutput: '1', colabAnchor: 'x' },
    inYourField: [],
    alternatives: [],
  };
}

export interface PendingLoad {
  slug: string;
  resolve: () => void;
  reject: () => void;
}

export const control = { auto: true, pending: [] as PendingLoad[] };

export function loadAlgorithm(slug: string): Promise<AlgorithmModule> {
  if (control.auto) return Promise.resolve(fakeModule(slug));
  return new Promise<AlgorithmModule>((resolve, reject) => {
    control.pending.push({
      slug,
      resolve: () => resolve(fakeModule(slug)),
      reject: () => reject(new Error(`falló ${slug}`)),
    });
  });
}

export function prefetchAlgorithm(): void {}
