# Explorador de algoritmos de ML — Fase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar el artículo «Algoritmos de machine learning» con el explorador interactivo (menú de 17 algoritmos × 8 pestañas, carga diferida por algoritmo, Python en el navegador con Pyodide) y los 4 primeros algoritmos completos: Linear Regression, Logistic Regression, Decision Tree y KNN.

**Architecture:** Un artículo `.md` incrusta el tag `<ml-explorer>`, que `MarkdownRenderer` mapea a un componente React cargado con `lazy()`. El explorador lee `?alg=&tab=` de la URL, muestra un menú construido desde un registry liviano y carga cada algoritmo con `import()` dinámico (un chunk por algoritmo). El Python corre en un Web Worker con Pyodide, que se descarga solo al primer «Ejecutar». Los ejercicios viven como archivos `.py` con su salida esperada (`.out.txt`): el mismo código lo usan el explorador (`?raw`), el notebook de Colab (generado por script) y la verificación en CPython.

**Tech Stack:** React 19 + TypeScript + Vite 7, react-router-dom 7 (HashRouter, `useSearchParams`), KaTeX, Pyodide 0.27.7 (numpy 2.0.2, scikit-learn 1.6.1, matplotlib 3.8.4), Vitest 3 para la lógica pura, Python 3.12 para los ejercicios.

**Spec:** `docs/superpowers/specs/2026-10-03-ml-algoritmos-explorador-design.md`

---

## Convenciones para quien ejecute el plan

- Todas las rutas relativas son desde `portfolio-spa/` salvo que digan `../` o `docs/`.
- **NTFS:** el repo vive en una partición NTFS sin bit de ejecución. Nunca uses `npx`/`node_modules/.bin`. Prepara esbuild una vez:
  ```bash
  test -f /tmp/esbuild-bin || (cp node_modules/@esbuild/linux-x64/bin/esbuild /tmp/esbuild-bin && chmod +x /tmp/esbuild-bin)
  ```
  y ejecuta las herramientas así:
  - Tests: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run <archivo>`
  - Tipos: `node node_modules/typescript/bin/tsc --noEmit -p .`
  - Dev: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js`
- **Python de verificación:** `~/.cache/mlx-venv/bin/python` (se crea en la Task 1). Tiene las mismas versiones que Pyodide 0.27.7, para que la salida esperada coincida con la del navegador.
- **Git:** el árbol de trabajo tiene cambios ajenos sin commit (`extract_data.py`, `.claude/settings.local.json`, `calculo_diferencial/…`). **Haz `git add` solo de los archivos de cada task**, nunca `git add -A` ni `git add .`.
- Cada commit termina con la línea:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- Redacción: sigue `docs/redaccion/guia-facil-comprension.md` (conclusión primero, ejemplo con números antes de la fórmula, analogías de 1-2 frases o ninguna, jerga en el glosario 💡).

## Mapa de archivos

| Archivo | Responsabilidad |
|---|---|
| `vitest.config.ts` | Config de tests (solo `src/**/*.test.ts`, entorno node) |
| `vite.config.ts` (modificar) | `worker.format: 'es'` para que el worker pueda hacer `import()` de Pyodide |
| `src/components/ml-explorer/types.ts` | Tipos compartidos: `TabId`, `AlgorithmModule`, `AlgorithmMeta`, etiquetas |
| `src/components/ml-explorer/loader.ts` | `createAlgorithmLoader`: caché de `import()` con reintento |
| `src/components/ml-explorer/registry.ts` | Las 17 filas del cheatsheet + loaders disponibles |
| `src/components/ml-explorer/urlState.ts` | Leer/escribir `alg` y `tab` en la query |
| `src/components/ml-explorer/useAlgorithm.ts` | Hook: estado loading/error/ready del módulo |
| `src/components/ml-explorer/traceback.ts` | Recortar tracebacks de Pyodide a lo útil |
| `src/components/ml-explorer/pyodideClient.ts` | Protocolo con el worker, timeout de 15 s, detener |
| `src/components/ml-explorer/pyodideWorker.ts` | Web Worker: carga Pyodide + paquetes, ejecuta, captura stdout y figuras |
| `src/components/ml-explorer/PythonRunner.tsx` | Editor, Ejecutar/Detener/Restaurar, salida, enlace a Colab |
| `src/components/ml-explorer/glossary.ts` + `Gloss.tsx` | Glosario 💡 central y su ventana emergente |
| `src/components/ml-explorer/Tex.tsx` | Fórmulas con KaTeX |
| `src/components/ml-explorer/DeepDive.tsx` | Bloque plegable «Para profundizar» |
| `src/components/ml-explorer/InYourField.tsx` | Chips «En tu área» |
| `src/components/ml-explorer/SummaryChips.tsx` | Barra-chuleta con la fila del cheatsheet |
| `src/components/ml-explorer/TypeFigure.tsx` | Mini-figura de la pestaña «Tipo» |
| `src/components/ml-explorer/AlgorithmMenu.tsx` | Menú izquierdo (lista en escritorio, `<select>` en móvil) |
| `src/components/ml-explorer/AlgorithmTabs.tsx` | Las 8 pestañas y el cuerpo de cada una |
| `src/components/ml-explorer/AlgorithmPanel.tsx` | Cabecera + loading/error/ready |
| `src/components/ml-explorer/MLExplorer.tsx` | Componente raíz: URL ↔ estado, layout |
| `src/components/ml-explorer/ml-explorer.css` | Estilos del explorador |
| `src/components/ml-explorer/ovas/plot.ts` | Escalas datos ↔ SVG |
| `src/components/ml-explorer/ovas/ovaMath.ts` | Matemática de las OVAs (recta, sigmoide, árbol, KNN) |
| `src/components/ml-explorer/ovas/useSvgDrag.ts` | Arrastrar puntos dentro de un SVG |
| `src/components/ml-explorer/ovas/OvaFrame.tsx` | Marco común de OVA + slider |
| `src/components/ml-explorer/ovas/*Ova.tsx` | Una OVA por algoritmo |
| `src/components/ml-explorer/algorithms/<slug>.tsx` | Contenido de cada algoritmo (un chunk cada uno) |
| `src/components/ml-explorer/algorithms/python/<slug>.py` / `.out.txt` | Ejercicio y su salida esperada |
| `scripts/check-ml-exercises.py` | Ejecuta los `.py` y compara con `.out.txt` |
| `scripts/build-ml-notebook.py` | Genera `../notebooks/algoritmos-ml.ipynb` |
| `src/components/MarkdownRenderer.tsx` (modificar) | Mapear `ml-explorer`; enlaces internos `#/` sin `target=_blank` |
| `src/styles/retro-modern.css` (modificar) | El explorador ocupa el ancho completo del artículo |
| `src/data/articles/algoritmos-ml-explorador.md` + `index.ts` (modificar) | El artículo y su registro |

---

### Task 1: Herramientas de prueba (Vitest y Python de verificación)

**Files:**
- Modify: `package.json` (devDependency `vitest`, script `test`)
- Create: `vitest.config.ts`
- Create: `src/components/ml-explorer/smoke.test.ts` (temporal, se borra en el paso 6)

- [ ] **Step 1: Instalar Vitest**

```bash
npm install -D vitest@^3.2.7
```
Expected: `package.json` gana `"vitest": "^3.2.7"` en `devDependencies`.

- [ ] **Step 2: Agregar el script y la config**

En `package.json`, dentro de `"scripts"`, agrega después de `"preview"`:
```json
    "test": "vitest run"
```
(recuerda la coma al final de la línea de `"preview"`).

Crea `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

// Solo la logica pura del explorador tiene tests (estado de URL, loader,
// cliente de Pyodide, matematica de las OVAs). Los componentes se verifican
// en el navegador.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 3: Test de humo**

Crea `src/components/ml-explorer/smoke.test.ts`:
```ts
import { describe, expect, it } from 'vitest';

describe('vitest', () => {
  it('corre en este repo', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Ejecutarlo**

```bash
test -f /tmp/esbuild-bin || (cp node_modules/@esbuild/linux-x64/bin/esbuild /tmp/esbuild-bin && chmod +x /tmp/esbuild-bin)
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
```
Expected: `1 passed`.

- [ ] **Step 5: Python con las versiones de Pyodide 0.27.7**

```bash
python3 -m venv ~/.cache/mlx-venv
~/.cache/mlx-venv/bin/pip install -q "numpy==2.0.2" "scikit-learn==1.6.1" "matplotlib==3.8.4" "scipy==1.14.1"
~/.cache/mlx-venv/bin/python -c "import numpy, sklearn, matplotlib; print(numpy.__version__, sklearn.__version__, matplotlib.__version__)"
```
Expected: `2.0.2 1.6.1 3.8.4`

- [ ] **Step 6: Borrar el test de humo y hacer commit**

```bash
rm src/components/ml-explorer/smoke.test.ts
git add package.json package-lock.json vitest.config.ts
git commit -m "build(spa): add vitest for the ML explorer's pure logic

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Tipos compartidos

**Files:**
- Create: `src/components/ml-explorer/types.ts`

- [ ] **Step 1: Escribir los tipos**

```ts
import type { ComponentType, ReactNode } from 'react';

/** Las 8 columnas del cheatsheet, en su orden original. */
export const TAB_IDS = [
  'type',
  'bestUse',
  'formula',
  'assumptions',
  'pros',
  'cons',
  'whenNot',
  'realWorld',
] as const;

export type TabId = (typeof TAB_IDS)[number];

export const TAB_LABELS: Record<TabId, string> = {
  type: 'Tipo',
  bestUse: 'Mejor caso de uso',
  formula: 'Fórmula / lógica',
  assumptions: 'Supuestos',
  pros: 'Pros',
  cons: 'Contras',
  whenNot: 'Cuándo no usarlo',
  realWorld: 'Ejemplo real',
};

export type AlgorithmGroup = 'supervised' | 'unsupervised' | 'reduction' | 'neural';

/** Orden de los grupos en el menú izquierdo. */
export const GROUP_ORDER: AlgorithmGroup[] = ['supervised', 'unsupervised', 'reduction', 'neural'];

export const GROUP_LABELS: Record<AlgorithmGroup, string> = {
  supervised: 'Supervisado',
  unsupervised: 'No supervisado',
  reduction: 'Reducción de dimensionalidad',
  neural: 'Redes neuronales',
};

/** Una fila del menú. Liviana: se descarga con el artículo. */
export interface AlgorithmMeta {
  slug: string;
  /** Nombre en inglés, como en el cheatsheet. */
  name: string;
  /** Traducción al español. */
  nameEs: string;
  icon: string;
  group: AlgorithmGroup;
  /** false = aún no implementado (fases siguientes): se muestra como «pronto». */
  available: boolean;
}

export interface TabContent {
  /** Siempre visible: lo entiende alguien sin formación en ML. */
  essential: ReactNode;
  /** Plegado en «Para profundizar»: derivación, complejidad, hiperparámetros. */
  deepDive?: ReactNode;
  /** Mini-demo opcional (solo si enseña algo). */
  demo?: ComponentType;
}

export interface PythonExercise {
  code: string;
  expectedOutput: string;
  /** Id de la celda de título en el notebook de Colab (`#scrollTo=`). */
  colabAnchor: string;
}

export interface FieldExample {
  area: string;
  example: string;
}

/** Contenido completo de un algoritmo. Cada módulo es un chunk aparte. */
export interface AlgorithmModule {
  slug: string;
  /** Texto de la fila del cheatsheet, traducido, una entrada por columna. */
  row: Record<TabId, string>;
  tabs: Record<TabId, TabContent>;
  /** OVA obligatoria; va en la pestaña «formula». */
  Ova: ComponentType;
  python: PythonExercise;
  /** 3 usos en otras ingenierías (pestaña «realWorld»). */
  inYourField: FieldExample[];
  /** Slugs sugeridos en «Cuándo no usarlo». */
  alternatives: string[];
}
```

- [ ] **Step 2: Verificar tipos**

```bash
node node_modules/typescript/bin/tsc --noEmit -p .
```
Expected: sin salida (exit 0).

- [ ] **Step 3: Commit**

```bash
git add src/components/ml-explorer/types.ts
git commit -m "feat(ml-explorer): define the explorer's shared types

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Loader con caché y reintento

**Files:**
- Create: `src/components/ml-explorer/loader.ts`
- Test: `src/components/ml-explorer/loader.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
import { describe, expect, it, vi } from 'vitest';
import { createAlgorithmLoader } from './loader';
import type { AlgorithmModule } from './types';

const fakeModule = { slug: 'knn' } as AlgorithmModule;

describe('createAlgorithmLoader', () => {
  it('llama al import() una sola vez aunque se pida dos veces', async () => {
    const importKnn = vi.fn(async () => ({ default: fakeModule }));
    const load = createAlgorithmLoader({ knn: importKnn });

    await expect(load('knn')).resolves.toBe(fakeModule);
    await expect(load('knn')).resolves.toBe(fakeModule);
    expect(importKnn).toHaveBeenCalledTimes(1);
  });

  it('tras un fallo de red, el siguiente intento vuelve a pedir el chunk', async () => {
    const importKnn = vi
      .fn<() => Promise<{ default: AlgorithmModule }>>()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ default: fakeModule });
    const load = createAlgorithmLoader({ knn: importKnn });

    await expect(load('knn')).rejects.toThrow('network');
    await expect(load('knn')).resolves.toBe(fakeModule);
    expect(importKnn).toHaveBeenCalledTimes(2);
  });

  it('rechaza un slug desconocido', async () => {
    const load = createAlgorithmLoader({});
    await expect(load('nope')).rejects.toThrow('Algoritmo desconocido: nope');
  });
});
```

- [ ] **Step 2: Ejecutarlo y ver que falla**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/loader.test.ts
```
Expected: FAIL — `Failed to resolve import "./loader"`.

- [ ] **Step 3: Implementación**

`src/components/ml-explorer/loader.ts`:
```ts
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
```

- [ ] **Step 4: Ejecutarlo y ver que pasa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/loader.test.ts
```
Expected: `3 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/components/ml-explorer/loader.ts src/components/ml-explorer/loader.test.ts
git commit -m "feat(ml-explorer): cache algorithm chunks and retry failed loads

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Registry de las 17 filas

**Files:**
- Create: `src/components/ml-explorer/registry.ts`
- Test: `src/components/ml-explorer/registry.test.ts`

En esta task `LOADERS` empieza vacío: cada algoritmo agrega su línea en su propia task (15-18). Vite resuelve los `import()` al transformar el archivo, así que no se puede apuntar a archivos que aún no existen.

- [ ] **Step 1: Escribir el test que falla**

```ts
import { describe, expect, it } from 'vitest';
import { ALGORITHMS, AVAILABLE_SLUGS, getMeta } from './registry';

describe('registry', () => {
  it('tiene las 17 filas del cheatsheet, sin slugs repetidos', () => {
    expect(ALGORITHMS).toHaveLength(17);
    expect(new Set(ALGORITHMS.map((a) => a.slug)).size).toBe(17);
  });

  it('marca como disponibles solo los algoritmos implementados', () => {
    expect(AVAILABLE_SLUGS).toEqual([]);
  });

  it('getMeta devuelve la fila o lanza si no existe', () => {
    expect(getMeta('knn').name).toBe('KNN');
    expect(() => getMeta('nope')).toThrow('nope');
  });
});
```

- [ ] **Step 2: Ejecutarlo y ver que falla**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/registry.test.ts
```
Expected: FAIL — `Failed to resolve import "./registry"`.

- [ ] **Step 3: Implementación**

`src/components/ml-explorer/registry.ts`:
```ts
import { createAlgorithmLoader, type ModuleLoader } from './loader';
import { GROUP_ORDER, type AlgorithmMeta } from './types';

/**
 * Un import() por algoritmo: Vite genera un chunk para cada uno y solo lo
 * descarga cuando el lector lo elige en el menu. Cada fase agrega aqui los
 * algoritmos que implementa.
 */
const LOADERS: Record<string, ModuleLoader> = {};

type Entry = Omit<AlgorithmMeta, 'available'>;

/** Las 17 filas del cheatsheet. El menú las agrupa según GROUP_ORDER. */
const ENTRIES: Entry[] = [
  { slug: 'linear-regression', name: 'Linear Regression', nameEs: 'Regresión lineal', icon: '📈', group: 'supervised' },
  { slug: 'logistic-regression', name: 'Logistic Regression', nameEs: 'Regresión logística', icon: '〰️', group: 'supervised' },
  { slug: 'decision-tree', name: 'Decision Tree', nameEs: 'Árbol de decisión', icon: '🌳', group: 'supervised' },
  { slug: 'random-forest', name: 'Random Forest', nameEs: 'Bosque aleatorio', icon: '🌲', group: 'supervised' },
  { slug: 'gradient-boosting', name: 'Gradient Boosting', nameEs: 'Potenciación por gradiente', icon: '🚀', group: 'supervised' },
  { slug: 'svm', name: 'SVM', nameEs: 'Máquina de vectores de soporte', icon: '↔️', group: 'supervised' },
  { slug: 'knn', name: 'KNN', nameEs: 'K vecinos más cercanos', icon: '🎯', group: 'supervised' },
  { slug: 'naive-bayes', name: 'Naive Bayes', nameEs: 'Bayes ingenuo', icon: '📄', group: 'supervised' },
  { slug: 'k-means', name: 'K-Means', nameEs: 'K-medias', icon: '⚪', group: 'unsupervised' },
  { slug: 'hierarchical-clustering', name: 'Hierarchical Clustering', nameEs: 'Agrupamiento jerárquico', icon: '🌿', group: 'unsupervised' },
  { slug: 'dbscan', name: 'DBSCAN', nameEs: 'Agrupamiento por densidad', icon: '🫧', group: 'unsupervised' },
  { slug: 'pca', name: 'PCA', nameEs: 'Análisis de componentes principales', icon: '🧭', group: 'reduction' },
  { slug: 'mlp', name: 'Neural Networks (MLP)', nameEs: 'Perceptrón multicapa', icon: '🕸️', group: 'neural' },
  { slug: 'cnn', name: 'CNN', nameEs: 'Red neuronal convolucional', icon: '🖼️', group: 'neural' },
  { slug: 'rnn', name: 'RNN', nameEs: 'Red neuronal recurrente', icon: '🔁', group: 'neural' },
  { slug: 'transformer', name: 'Transformer (BERT, GPT)', nameEs: 'Transformer', icon: '🤖', group: 'neural' },
  { slug: 'autoencoders', name: 'Autoencoders', nameEs: 'Autocodificadores', icon: '🗜️', group: 'neural' },
];

export const ALGORITHMS: AlgorithmMeta[] = GROUP_ORDER.flatMap((group) =>
  ENTRIES.filter((e) => e.group === group).map((e) => ({ ...e, available: e.slug in LOADERS })),
);

export const AVAILABLE_SLUGS: string[] = ALGORITHMS.filter((a) => a.available).map((a) => a.slug);

export function getMeta(slug: string): AlgorithmMeta {
  const meta = ALGORITHMS.find((a) => a.slug === slug);
  if (!meta) throw new Error(`Algoritmo sin fila en el registry: ${slug}`);
  return meta;
}

export const loadAlgorithm = createAlgorithmLoader(LOADERS);

/** Precarga al pasar el mouse: si falla, el clic lo reintentará. */
export function prefetchAlgorithm(slug: string): void {
  if (slug in LOADERS) loadAlgorithm(slug).catch(() => {});
}
```

- [ ] **Step 4: Ejecutarlo y ver que pasa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/registry.test.ts
```
Expected: `3 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/components/ml-explorer/registry.ts src/components/ml-explorer/registry.test.ts
git commit -m "feat(ml-explorer): list the cheatsheet's algorithms in a light registry

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Estado en la URL

**Files:**
- Create: `src/components/ml-explorer/urlState.ts`
- Test: `src/components/ml-explorer/urlState.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
import { describe, expect, it } from 'vitest';
import { parseExplorerState, withExplorerState } from './urlState';

const slugs = ['linear-regression', 'knn'];

describe('parseExplorerState', () => {
  it('lee alg y tab válidos', () => {
    const p = new URLSearchParams('alg=knn&tab=cons');
    expect(parseExplorerState(p, slugs)).toEqual({ alg: 'knn', tab: 'cons' });
  });

  it('ignora un alg desconocido o no disponible y abre el primero', () => {
    const p = new URLSearchParams('alg=svm&tab=pros');
    expect(parseExplorerState(p, slugs)).toEqual({ alg: 'linear-regression', tab: 'pros' });
  });

  it('ignora una pestaña desconocida y abre «type»', () => {
    const p = new URLSearchParams('alg=knn&tab=hack');
    expect(parseExplorerState(p, slugs)).toEqual({ alg: 'knn', tab: 'type' });
  });

  it('sin parámetros abre el primer algoritmo en «type»', () => {
    expect(parseExplorerState(new URLSearchParams(), slugs)).toEqual({ alg: 'linear-regression', tab: 'type' });
  });
});

describe('withExplorerState', () => {
  it('escribe alg y tab sin borrar otros parámetros', () => {
    const next = withExplorerState(new URLSearchParams('ref=x'), { alg: 'knn', tab: 'formula' });
    expect(next.toString()).toBe('ref=x&alg=knn&tab=formula');
  });
});
```

- [ ] **Step 2: Ejecutarlo y ver que falla**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/urlState.test.ts
```
Expected: FAIL — `Failed to resolve import "./urlState"`.

- [ ] **Step 3: Implementación**

`src/components/ml-explorer/urlState.ts`:
```ts
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
```

- [ ] **Step 4: Ejecutarlo y ver que pasa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/urlState.test.ts
```
Expected: `5 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/components/ml-explorer/urlState.ts src/components/ml-explorer/urlState.test.ts
git commit -m "feat(ml-explorer): keep the selected algorithm and tab in the URL

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Recortar tracebacks de Pyodide

**Files:**
- Create: `src/components/ml-explorer/traceback.ts`
- Test: `src/components/ml-explorer/traceback.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
import { describe, expect, it } from 'vitest';
import { trimTraceback } from './traceback';

const PYODIDE_ERROR = `PythonError: Traceback (most recent call last):
  File "/lib/python312.zip/_pyodide/_base.py", line 597, in eval_code_async
    await CodeRunner(
          ^^^^^^^^^^^
  File "/lib/python312.zip/_pyodide/_base.py", line 411, in run_async
    coroutine = eval(self.code, globals, locals)
                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<exec>", line 3, in <module>
ZeroDivisionError: division by zero
`;

describe('trimTraceback', () => {
  it('quita los marcos internos de Pyodide y deja los del código del lector', () => {
    expect(trimTraceback(PYODIDE_ERROR)).toBe(
      'Traceback (most recent call last):\n  File "<exec>", line 3, in <module>\nZeroDivisionError: division by zero',
    );
  });

  it('si no hay marcos del lector, devuelve el mensaje sin el prefijo PythonError', () => {
    expect(trimTraceback('PythonError: algo raro\n')).toBe('algo raro');
  });
});
```

- [ ] **Step 2: Ejecutarlo y ver que falla**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/traceback.test.ts
```
Expected: FAIL — `Failed to resolve import "./traceback"`.

- [ ] **Step 3: Implementación**

`src/components/ml-explorer/traceback.ts`:
```ts
/**
 * Pyodide antepone a cada error los marcos de su propio runner. Al lector
 * solo le sirven las lineas de su codigo, que Pyodide marca como "<exec>".
 */
export function trimTraceback(message: string): string {
  const clean = message.replace(/^PythonError:\s*/, '').trim();
  const lines = clean.split('\n');
  const start = lines.findIndex((line) => line.includes('File "<exec>"'));
  if (start === -1) return clean;
  return ['Traceback (most recent call last):', ...lines.slice(start)].join('\n');
}
```

- [ ] **Step 4: Ejecutarlo y ver que pasa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/traceback.test.ts
```
Expected: `2 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/components/ml-explorer/traceback.ts src/components/ml-explorer/traceback.test.ts
git commit -m "feat(ml-explorer): show only the reader's frames in Python errors

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Cliente de Pyodide (protocolo, timeout, detener)

**Files:**
- Create: `src/components/ml-explorer/pyodideClient.ts`
- Test: `src/components/ml-explorer/pyodideClient.test.ts`

El timeout de 15 s empieza cuando el worker avisa `started`, es decir, **después** de descargar Pyodide. Así la descarga inicial (lenta en redes móviles) no cuenta como «bucle infinito».

- [ ] **Step 1: Escribir el test que falla**

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createPyodideClient,
  type RunResult,
  type WorkerLike,
  type WorkerRequest,
  type WorkerResponse,
} from './pyodideClient';

class FakeWorker implements WorkerLike {
  onmessage: WorkerLike['onmessage'] = null;
  onerror: WorkerLike['onerror'] = null;
  sent: WorkerRequest[] = [];
  terminated = false;
  postMessage(message: WorkerRequest) {
    this.sent.push(message);
  }
  terminate() {
    this.terminated = true;
  }
  emit(data: WorkerResponse) {
    this.onmessage?.({ data });
  }
}

function setup(timeoutMs = 15_000) {
  const workers: FakeWorker[] = [];
  const client = createPyodideClient(() => {
    const w = new FakeWorker();
    workers.push(w);
    return w;
  }, timeoutMs);
  return { client, workers };
}

describe('createPyodideClient', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('envía el código y resuelve con la salida', async () => {
    const { client, workers } = setup();
    const run = client.run('print(1)');
    expect(workers[0].sent).toEqual([{ type: 'run', id: 1, code: 'print(1)' }]);
    workers[0].emit({ type: 'started', id: 1 });
    workers[0].emit({ type: 'result', id: 1, ok: true, stdout: '1', images: [] });
    await expect(run).resolves.toEqual({ status: 'ok', stdout: '1', images: [] });
  });

  it('reenvía los mensajes de progreso', async () => {
    const { client, workers } = setup();
    const progress: string[] = [];
    const run = client.run('x', (m) => progress.push(m));
    workers[0].emit({ type: 'progress', id: 1, message: 'Descargando…' });
    workers[0].emit({ type: 'result', id: 1, ok: true, stdout: '', images: [] });
    await run;
    expect(progress).toEqual(['Descargando…']);
  });

  it('la descarga de Pyodide no cuenta para el timeout', async () => {
    const { client, workers } = setup();
    let settled = false;
    const run = client.run('x').then((r) => {
      settled = true;
      return r;
    });
    await vi.advanceTimersByTimeAsync(60_000);
    expect(settled).toBe(false);
    workers[0].emit({ type: 'result', id: 1, ok: true, stdout: '', images: [] });
    await expect(run).resolves.toMatchObject({ status: 'ok' });
  });

  it('corta un bucle infinito a los 15 s y usa un worker nuevo en la siguiente ejecución', async () => {
    const { client, workers } = setup();
    const run = client.run('while True: pass');
    workers[0].emit({ type: 'started', id: 1 });
    await vi.advanceTimersByTimeAsync(15_000);
    await expect(run).resolves.toEqual({ status: 'timeout' });
    expect(workers[0].terminated).toBe(true);

    void client.run('print(2)');
    expect(workers).toHaveLength(2);
  });

  it('ignora mensajes tardíos del worker terminado', async () => {
    const { client, workers } = setup();
    const run = client.run('x');
    workers[0].emit({ type: 'started', id: 1 });
    await vi.advanceTimersByTimeAsync(15_000);
    await run;
    expect(() => workers[0].emit({ type: 'result', id: 1, ok: true, stdout: '', images: [] })).not.toThrow();
  });

  it('reporta load-failed si Pyodide no carga, y reinicia el worker', async () => {
    const { client, workers } = setup();
    const run = client.run('x');
    workers[0].emit({ type: 'result', id: 1, ok: false, stdout: '', images: [], error: 'CDN caído', loadFailed: true });
    await expect(run).resolves.toEqual({ status: 'load-failed', error: 'CDN caído' });
    expect(workers[0].terminated).toBe(true);
  });

  it('devuelve el error de Python sin reiniciar el worker', async () => {
    const { client, workers } = setup();
    const run = client.run('1/0');
    workers[0].emit({ type: 'started', id: 1 });
    workers[0].emit({ type: 'result', id: 1, ok: false, stdout: 'antes', images: [], error: 'ZeroDivisionError' });
    const result: RunResult = await run;
    expect(result).toEqual({ status: 'error', stdout: 'antes', images: [], error: 'ZeroDivisionError' });
    expect(workers[0].terminated).toBe(false);
  });

  it('stop() termina la ejecución en curso', async () => {
    const { client, workers } = setup();
    const run = client.run('x');
    workers[0].emit({ type: 'started', id: 1 });
    client.stop();
    await expect(run).resolves.toEqual({ status: 'stopped' });
    expect(workers[0].terminated).toBe(true);
  });
});
```

- [ ] **Step 2: Ejecutarlo y ver que falla**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/pyodideClient.test.ts
```
Expected: FAIL — `Failed to resolve import "./pyodideClient"`.

- [ ] **Step 3: Implementación**

`src/components/ml-explorer/pyodideClient.ts`:
```ts
export type WorkerRequest = { type: 'run'; id: number; code: string };

export type WorkerResponse =
  | { type: 'progress'; id: number; message: string }
  | { type: 'started'; id: number }
  | { type: 'result'; id: number; ok: true; stdout: string; images: string[] }
  | { type: 'result'; id: number; ok: false; stdout: string; images: string[]; error: string; loadFailed?: boolean };

export type RunResult =
  | { status: 'ok'; stdout: string; images: string[] }
  | { status: 'error'; stdout: string; images: string[]; error: string }
  | { status: 'timeout' }
  | { status: 'stopped' }
  | { status: 'load-failed'; error: string };

/** Lo mínimo de `Worker` que usa el cliente; los tests lo simulan. */
export interface WorkerLike {
  postMessage(message: WorkerRequest): void;
  terminate(): void;
  onmessage: ((event: { data: WorkerResponse }) => void) | null;
  onerror: ((event: unknown) => void) | null;
}

export interface PyodideClient {
  run(code: string, onProgress?: (message: string) => void): Promise<RunResult>;
  stop(): void;
}

interface CurrentRun {
  id: number;
  resolve: (result: RunResult) => void;
  onProgress?: (message: string) => void;
  timer?: ReturnType<typeof setTimeout>;
}

/**
 * Habla con el worker de Pyodide. Una ejecucion a la vez.
 *
 * Python no se puede interrumpir desde fuera: para cortar un bucle infinito
 * hay que terminar el worker. Por eso el timeout (y «Detener») matan el
 * worker y la siguiente ejecucion crea uno nuevo, que vuelve a cargar
 * Pyodide desde la cache del navegador.
 */
export function createPyodideClient(makeWorker: () => WorkerLike, timeoutMs = 15_000): PyodideClient {
  let worker: WorkerLike | null = null;
  let nextId = 1;
  let current: CurrentRun | null = null;

  function finish(result: RunResult) {
    if (!current) return;
    if (current.timer) clearTimeout(current.timer);
    const { resolve } = current;
    current = null;
    resolve(result);
  }

  function kill() {
    worker?.terminate();
    worker = null;
  }

  function ensureWorker(): WorkerLike {
    if (worker) return worker;
    const w = makeWorker();
    w.onmessage = ({ data }) => {
      // Un worker ya terminado puede alcanzar a enviar algo: se descarta.
      if (w !== worker || !current || data.id !== current.id) return;
      if (data.type === 'progress') {
        current.onProgress?.(data.message);
      } else if (data.type === 'started') {
        current.timer = setTimeout(() => {
          kill();
          finish({ status: 'timeout' });
        }, timeoutMs);
      } else if (data.ok) {
        finish({ status: 'ok', stdout: data.stdout, images: data.images });
      } else if (data.loadFailed) {
        kill();
        finish({ status: 'load-failed', error: data.error });
      } else {
        finish({ status: 'error', stdout: data.stdout, images: data.images, error: data.error });
      }
    };
    w.onerror = () => {
      if (w !== worker) return;
      kill();
      finish({ status: 'load-failed', error: 'El worker de Python no pudo iniciar.' });
    };
    worker = w;
    return w;
  }

  return {
    run(code, onProgress) {
      if (current) {
        kill();
        finish({ status: 'stopped' });
      }
      const id = nextId++;
      return new Promise<RunResult>((resolve) => {
        current = { id, resolve, onProgress };
        ensureWorker().postMessage({ type: 'run', id, code });
      });
    },
    stop() {
      if (!current) return;
      kill();
      finish({ status: 'stopped' });
    },
  };
}
```

- [ ] **Step 4: Ejecutarlo y ver que pasa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/pyodideClient.test.ts
```
Expected: `8 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/components/ml-explorer/pyodideClient.ts src/components/ml-explorer/pyodideClient.test.ts
git commit -m "feat(ml-explorer): run Python in a worker with a 15 s guard

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Worker de Pyodide

**Files:**
- Create: `src/components/ml-explorer/pyodideWorker.ts`
- Modify: `vite.config.ts` (agregar `worker.format`)

- [ ] **Step 1: Comprobar que la versión fijada existe en el CDN**

```bash
curl -sI https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs | head -1
```
Expected: `HTTP/2 200`.

- [ ] **Step 2: Escribir el worker**

`src/components/ml-explorer/pyodideWorker.ts`:
```ts
// Web Worker que ejecuta Python con Pyodide fuera del hilo principal, para
// que un calculo largo (o un bucle infinito) no congele la pagina.
import type { WorkerRequest, WorkerResponse } from './pyodideClient';
import { trimTraceback } from './traceback';

// Version fija: las salidas esperadas (.out.txt) se generan con estas mismas
// versiones de numpy 2.0.2, scikit-learn 1.6.1 y matplotlib 3.8.4.
const PYODIDE_VERSION = '0.27.7';
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const PACKAGES = ['numpy', 'scikit-learn', 'matplotlib'];

// plt.show() no tiene pantalla en el worker: se anula, y _collect_figs()
// convierte cada figura abierta en un PNG en base64 (separados por \n).
const SETUP = `
import io, base64
import matplotlib
matplotlib.use("AGG")
import matplotlib.pyplot as plt
plt.style.use("dark_background")
plt.show = lambda *args, **kwargs: None

def _collect_figs():
    images = []
    for num in plt.get_fignums():
        buf = io.BytesIO()
        plt.figure(num).savefig(buf, format="png", dpi=110, bbox_inches="tight")
        images.append(base64.b64encode(buf.getvalue()).decode("ascii"))
    plt.close("all")
    return "\\n".join(images)
`;

interface PyProxyLike {
  destroy(): void;
}

interface PyodideLike {
  loadPackage(names: string[]): Promise<unknown>;
  runPython(code: string, options?: { globals?: PyProxyLike }): unknown;
  runPythonAsync(code: string, options?: { globals?: PyProxyLike }): Promise<unknown>;
  setStdout(options: { batched: (text: string) => void }): void;
  setStderr(options: { batched: (text: string) => void }): void;
  globals: { get(name: string): () => PyProxyLike };
}

const ctx = self as unknown as {
  postMessage(message: WorkerResponse): void;
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
};

let runtime: Promise<PyodideLike> | null = null;

function loadRuntime(id: number): Promise<PyodideLike> {
  if (!runtime) {
    runtime = (async () => {
      ctx.postMessage({ type: 'progress', id, message: 'Descargando Python (solo la primera vez)…' });
      const mod = await import(/* @vite-ignore */ `${INDEX_URL}pyodide.mjs`);
      const py: PyodideLike = await mod.loadPyodide({ indexURL: INDEX_URL });
      ctx.postMessage({ type: 'progress', id, message: 'Instalando numpy, scikit-learn y matplotlib…' });
      await py.loadPackage(PACKAGES);
      py.runPython(SETUP);
      return py;
    })();
  }
  return runtime;
}

ctx.onmessage = async ({ data }) => {
  if (data.type !== 'run') return;
  const { id, code } = data;

  let py: PyodideLike;
  try {
    py = await loadRuntime(id);
  } catch (err) {
    ctx.postMessage({ type: 'result', id, ok: false, stdout: '', images: [], error: String(err), loadFailed: true });
    return;
  }

  const out: string[] = [];
  py.setStdout({ batched: (text) => out.push(text) });
  py.setStderr({ batched: (text) => out.push(text) });

  ctx.postMessage({ type: 'started', id });
  // Cada ejecucion con un espacio de nombres limpio: lo que definio una
  // ejecucion anterior no contamina la siguiente.
  const namespace = py.globals.get('dict')();
  try {
    await py.runPythonAsync(code, { globals: namespace });
    const joined = py.runPython('_collect_figs()') as string;
    ctx.postMessage({ type: 'result', id, ok: true, stdout: out.join('\n'), images: joined ? joined.split('\n') : [] });
  } catch (err) {
    py.runPython('_collect_figs()'); // descarta figuras a medio hacer
    const message = err instanceof Error ? err.message : String(err);
    ctx.postMessage({ type: 'result', id, ok: false, stdout: out.join('\n'), images: [], error: trimTraceback(message) });
  } finally {
    namespace.destroy();
  }
};
```

- [ ] **Step 3: Workers como módulos ES**

En `vite.config.ts`, dentro del objeto de `defineConfig({ ... })`, agrega después de `base: './',`:
```ts
  // El worker de Pyodide hace import() de una URL del CDN: necesita salir
  // como modulo ES (el formato iife por defecto no admite import dinamico).
  worker: {
    format: 'es',
  },
```

- [ ] **Step 4: Verificar tipos**

```bash
node node_modules/typescript/bin/tsc --noEmit -p .
```
Expected: sin salida (exit 0).

- [ ] **Step 5: Commit**

```bash
git add src/components/ml-explorer/pyodideWorker.ts vite.config.ts
git commit -m "feat(ml-explorer): load Pyodide with numpy and scikit-learn in a worker

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Matemática de las OVAs

**Files:**
- Create: `src/components/ml-explorer/ovas/plot.ts`
- Create: `src/components/ml-explorer/ovas/ovaMath.ts`
- Test: `src/components/ml-explorer/ovas/plot.test.ts`
- Test: `src/components/ml-explorer/ovas/ovaMath.test.ts`

- [ ] **Step 1: Escribir los tests que fallan**

`src/components/ml-explorer/ovas/plot.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { createPlot } from './plot';

describe('createPlot', () => {
  const plot = createPlot(360, 300, 30, [0, 10], [0, 8]);

  it('lleva los extremos del dominio a los bordes del área útil', () => {
    expect(plot.sx(0)).toBe(30);
    expect(plot.sx(10)).toBe(330);
    expect(plot.sy(0)).toBe(270); // el eje y del SVG crece hacia abajo
    expect(plot.sy(8)).toBe(30);
  });

  it('ix e iy invierten sx y sy', () => {
    expect(plot.ix(plot.sx(3.3))).toBeCloseTo(3.3);
    expect(plot.iy(plot.sy(6.1))).toBeCloseTo(6.1);
  });
});
```

`src/components/ml-explorer/ovas/ovaMath.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import {
  accuracy,
  buildTree,
  fitLine,
  fitLogistic1D,
  knnVote,
  logit,
  mse,
  sigmoid,
  treeRegions,
  type LabeledPt,
} from './ovaMath';

describe('regresión lineal', () => {
  it('fitLine recupera una recta exacta', () => {
    const line = fitLine([{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }]);
    expect(line.b0).toBeCloseTo(1);
    expect(line.b1).toBeCloseTo(2);
  });

  it('fitLine con todas las x iguales devuelve la media horizontal', () => {
    expect(fitLine([{ x: 2, y: 1 }, { x: 2, y: 3 }])).toEqual({ b0: 2, b1: 0 });
  });

  it('mse promedia los residuos al cuadrado', () => {
    const points = [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 5 }];
    expect(mse(points, { b0: 1, b1: 1 })).toBeCloseTo(4 / 3);
  });
});

describe('regresión logística', () => {
  it('sigmoid y logit son inversas', () => {
    expect(sigmoid(0)).toBe(0.5);
    expect(logit(sigmoid(1.3))).toBeCloseTo(1.3);
  });

  it('fitLogistic1D pone la frontera entre las dos clases', () => {
    const { b0, b1 } = fitLogistic1D([0, 1, 2, 3], [0, 0, 1, 1]);
    expect(b1).toBeGreaterThan(0);
    // Datos separables: la frontera debe quedar entre el último 0 (x=1) y el primer 1 (x=2).
    expect(-b0 / b1).toBeGreaterThan(1);
    expect(-b0 / b1).toBeLessThan(2);
  });
});

describe('KNN', () => {
  const points: LabeledPt[] = [
    { x: 0, y: 0, label: 0 },
    { x: 1, y: 0, label: 0 },
    { x: 0, y: 1, label: 1 },
    { x: 5, y: 5, label: 1 },
  ];

  it('elige los k más cercanos y cuenta los votos', () => {
    const r = knnVote(points, { x: 0.1, y: 0.1 }, 3);
    expect(r.neighbors).toEqual([0, 1, 2]);
    expect(r.votes).toEqual([2, 1]);
    expect(r.winner).toBe(0);
    expect(r.radius).toBeCloseTo(Math.hypot(0.9, 0.1));
  });

  it('en empate gana la clase del vecino más cercano', () => {
    const tie: LabeledPt[] = [
      { x: 0, y: 0, label: 1 },
      { x: 1, y: 0, label: 0 },
    ];
    expect(knnVote(tie, { x: 0.2, y: 0 }, 2).winner).toBe(1);
  });
});

describe('árbol de decisión', () => {
  const separable: LabeledPt[] = [
    { x: 1, y: 1, label: 0 },
    { x: 2, y: 1, label: 0 },
    { x: 8, y: 1, label: 1 },
    { x: 9, y: 1, label: 1 },
  ];

  it('con profundidad 0 es una hoja con la clase mayoritaria', () => {
    const tree = buildTree([...separable, { x: 3, y: 1, label: 0 }], 0);
    expect(tree).toEqual({ kind: 'leaf', label: 0, count: [3, 2] });
  });

  it('encuentra el corte que separa las clases', () => {
    const tree = buildTree(separable, 1);
    expect(tree.kind).toBe('split');
    if (tree.kind !== 'split') return;
    expect(tree.axis).toBe('x');
    expect(tree.threshold).toBe(5);
    expect(accuracy(tree, separable)).toBe(1);
  });

  it('no corta un grupo que ya es puro', () => {
    const pure = separable.filter((p) => p.label === 0);
    expect(buildTree(pure, 3).kind).toBe('leaf');
  });

  it('treeRegions convierte el árbol en rectángulos', () => {
    const regions = treeRegions(buildTree(separable, 1), { x0: 0, x1: 10, y0: 0, y1: 10 });
    expect(regions).toEqual([
      { x0: 0, x1: 5, y0: 0, y1: 10, label: 0 },
      { x0: 5, x1: 10, y0: 0, y1: 10, label: 1 },
    ]);
  });
});
```

- [ ] **Step 2: Ejecutarlos y ver que fallan**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas
```
Expected: FAIL — `Failed to resolve import "./plot"` y `"./ovaMath"`.

- [ ] **Step 3: Implementar `plot.ts`**

```ts
/** Escalas lineales entre coordenadas de datos y coordenadas del SVG. */
export interface Plot {
  width: number;
  height: number;
  pad: number;
  sx(x: number): number;
  sy(y: number): number;
  ix(px: number): number;
  iy(py: number): number;
}

export function createPlot(
  width: number,
  height: number,
  pad: number,
  [x0, x1]: [number, number],
  [y0, y1]: [number, number],
): Plot {
  const w = width - 2 * pad;
  const h = height - 2 * pad;
  return {
    width,
    height,
    pad,
    sx: (x) => pad + ((x - x0) / (x1 - x0)) * w,
    sy: (y) => height - pad - ((y - y0) / (y1 - y0)) * h,
    ix: (px) => x0 + ((px - pad) / w) * (x1 - x0),
    iy: (py) => y0 + ((height - pad - py) / h) * (y1 - y0),
  };
}
```

- [ ] **Step 4: Implementar `ovaMath.ts`**

```ts
export interface Pt {
  x: number;
  y: number;
}

export interface LabeledPt extends Pt {
  label: 0 | 1;
}

export interface Line {
  b0: number;
  b1: number;
}

// ---------- Regresión lineal ----------

/** Mínimos cuadrados con una sola variable. */
export function fitLine(points: Pt[]): Line {
  const n = points.length;
  if (n === 0) return { b0: 0, b1: 0 };
  const mx = points.reduce((s, p) => s + p.x, 0) / n;
  const my = points.reduce((s, p) => s + p.y, 0) / n;
  let sxy = 0;
  let sxx = 0;
  for (const p of points) {
    sxy += (p.x - mx) * (p.y - my);
    sxx += (p.x - mx) ** 2;
  }
  const b1 = sxx === 0 ? 0 : sxy / sxx;
  return { b0: my - b1 * mx, b1 };
}

export function mse(points: Pt[], line: Line): number {
  if (points.length === 0) return 0;
  return points.reduce((s, p) => s + (p.y - (line.b0 + line.b1 * p.x)) ** 2, 0) / points.length;
}

// ---------- Regresión logística ----------

export function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

export function logit(p: number): number {
  return Math.log(p / (1 - p));
}

/** Descenso de gradiente sobre la pérdida logística (una variable). */
export function fitLogistic1D(xs: number[], ys: number[], iterations = 5000, lr = 0.05): Line {
  let b0 = 0;
  let b1 = 0;
  const n = xs.length;
  for (let it = 0; it < iterations; it++) {
    let g0 = 0;
    let g1 = 0;
    for (let i = 0; i < n; i++) {
      const e = sigmoid(b0 + b1 * xs[i]) - ys[i];
      g0 += e;
      g1 += e * xs[i];
    }
    b0 -= (lr * g0) / n;
    b1 -= (lr * g1) / n;
  }
  return { b0, b1 };
}

// ---------- KNN ----------

export interface KnnResult {
  /** Índices de los k vecinos, del más cercano al más lejano. */
  neighbors: number[];
  /** Votos por clase: [clase 0, clase 1]. */
  votes: [number, number];
  winner: 0 | 1;
  /** Distancia al k-ésimo vecino (radio del círculo que los contiene). */
  radius: number;
}

export function knnVote(points: LabeledPt[], query: Pt, k: number): KnnResult {
  const order = points
    .map((p, i) => ({ i, d: Math.hypot(p.x - query.x, p.y - query.y) }))
    .sort((a, b) => a.d - b.d || a.i - b.i);
  const top = order.slice(0, Math.min(k, points.length));
  const votes: [number, number] = [0, 0];
  for (const t of top) votes[points[t.i].label]++;
  const winner: 0 | 1 = votes[0] === votes[1] ? points[top[0].i].label : votes[1] > votes[0] ? 1 : 0;
  return { neighbors: top.map((t) => t.i), votes, winner, radius: top.length ? top[top.length - 1].d : 0 };
}

// ---------- Árbol de decisión ----------

export type TreeNode =
  | { kind: 'leaf'; label: 0 | 1; count: [number, number] }
  | { kind: 'split'; axis: 'x' | 'y'; threshold: number; count: [number, number]; left: TreeNode; right: TreeNode };

export interface Bounds {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface Region extends Bounds {
  label: 0 | 1;
}

function countLabels(points: LabeledPt[]): [number, number] {
  const c: [number, number] = [0, 0];
  for (const p of points) c[p.label]++;
  return c;
}

function gini([a, b]: [number, number]): number {
  const n = a + b;
  if (n === 0) return 0;
  const p = b / n;
  return 1 - p * p - (1 - p) * (1 - p);
}

/**
 * Árbol CART con impureza de Gini, cortes en el punto medio entre valores
 * consecutivos. Se detiene si llega a la profundidad, si el grupo es puro o
 * si ningún corte mejora la impureza.
 */
export function buildTree(points: LabeledPt[], maxDepth: number): TreeNode {
  const count = countLabels(points);
  const leaf: TreeNode = { kind: 'leaf', label: count[1] > count[0] ? 1 : 0, count };
  if (maxDepth <= 0 || points.length < 2 || count[0] === 0 || count[1] === 0) return leaf;

  let best: { axis: 'x' | 'y'; threshold: number; score: number } | null = null;
  for (const axis of ['x', 'y'] as const) {
    const values = [...new Set(points.map((p) => p[axis]))].sort((a, b) => a - b);
    for (let i = 0; i < values.length - 1; i++) {
      const threshold = (values[i] + values[i + 1]) / 2;
      const left = points.filter((p) => p[axis] <= threshold);
      const right = points.filter((p) => p[axis] > threshold);
      const score = (left.length * gini(countLabels(left)) + right.length * gini(countLabels(right))) / points.length;
      if (best === null || score < best.score - 1e-12) best = { axis, threshold, score };
    }
  }
  if (best === null || best.score >= gini(count) - 1e-12) return leaf;

  const { axis, threshold } = best;
  return {
    kind: 'split',
    axis,
    threshold,
    count,
    left: buildTree(points.filter((p) => p[axis] <= threshold), maxDepth - 1),
    right: buildTree(points.filter((p) => p[axis] > threshold), maxDepth - 1),
  };
}

export function predictTree(node: TreeNode, p: Pt): 0 | 1 {
  if (node.kind === 'leaf') return node.label;
  return predictTree(p[node.axis] <= node.threshold ? node.left : node.right, p);
}

export function accuracy(node: TreeNode, points: LabeledPt[]): number {
  if (points.length === 0) return 0;
  return points.filter((p) => predictTree(node, p) === p.label).length / points.length;
}

export function countLeaves(node: TreeNode): number {
  return node.kind === 'leaf' ? 1 : countLeaves(node.left) + countLeaves(node.right);
}

export function treeRegions(node: TreeNode, b: Bounds): Region[] {
  if (node.kind === 'leaf') return [{ ...b, label: node.label }];
  if (node.axis === 'x') {
    return [
      ...treeRegions(node.left, { ...b, x1: node.threshold }),
      ...treeRegions(node.right, { ...b, x0: node.threshold }),
    ];
  }
  return [
    ...treeRegions(node.left, { ...b, y1: node.threshold }),
    ...treeRegions(node.right, { ...b, y0: node.threshold }),
  ];
}
```

- [ ] **Step 5: Ejecutarlos y ver que pasan**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas
```
Expected: `13 passed` (2 de plot + 11 de ovaMath).

- [ ] **Step 6: Commit**

```bash
git add src/components/ml-explorer/ovas/plot.ts src/components/ml-explorer/ovas/plot.test.ts src/components/ml-explorer/ovas/ovaMath.ts src/components/ml-explorer/ovas/ovaMath.test.ts
git commit -m "feat(ml-explorer): add the math behind the first four OVAs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Piezas comunes de las OVAs (arrastre, marco, slider)

**Files:**
- Create: `src/components/ml-explorer/ovas/useSvgDrag.ts`
- Create: `src/components/ml-explorer/ovas/OvaFrame.tsx`

Son piezas de interacción del DOM: se verifican en el navegador al usarlas en las OVAs (Tasks 15-18), no con tests unitarios.

- [ ] **Step 1: Escribir `useSvgDrag.ts`**

```ts
import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import type { Pt } from './ovaMath';

/** Convierte la posición del puntero en coordenadas del viewBox del SVG. */
export function clientToSvg(svg: SVGSVGElement, clientX: number, clientY: number): Pt {
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}

/**
 * Arrastrar elementos dentro de un SVG con eventos de puntero (mouse, touch
 * y lápiz). `begin(target)` va en el onPointerDown del elemento; `svgProps`
 * se esparcen en el <svg>. El elemento captura el puntero, así que el
 * arrastre sigue aunque el dedo salga de él.
 */
export function useSvgDrag<T>(onDrag: (target: T, point: Pt) => void) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<T | null>(null);

  const begin = (target: T) => (e: ReactPointerEvent<SVGElement>) => {
    e.preventDefault();
    dragging.current = target;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const end = () => {
    dragging.current = null;
  };

  const svgProps = {
    ref: svgRef,
    onPointerMove: (e: ReactPointerEvent<SVGSVGElement>) => {
      if (dragging.current === null || !svgRef.current) return;
      onDrag(dragging.current, clientToSvg(svgRef.current, e.clientX, e.clientY));
    },
    onPointerUp: end,
    onPointerCancel: end,
  };

  return { svgRef, begin, svgProps };
}
```

- [ ] **Step 2: Escribir `OvaFrame.tsx`**

```tsx
import type { ReactNode } from 'react';

interface OvaFrameProps {
  title: string;
  /** Qué hacer, en una frase: «Arrastra los puntos…». */
  hint: string;
  children: ReactNode;
  /** Lectura en vivo de lo que muestra la figura. */
  readout?: ReactNode;
  controls?: ReactNode;
}

/** Marco común de todas las OVAs del explorador. */
export function OvaFrame({ title, hint, children, readout, controls }: OvaFrameProps) {
  return (
    <figure className="mlx-ova">
      <figcaption className="mlx-ova-head">
        <strong>🎮 {title}</strong>
        <span>{hint}</span>
      </figcaption>
      <div className="mlx-ova-body">
        <div className="mlx-ova-stage">{children}</div>
        {(controls || readout) && (
          <div className="mlx-ova-side">
            {controls && <div className="mlx-ova-controls">{controls}</div>}
            {readout && (
              <div className="mlx-ova-readout" aria-live="polite">
                {readout}
              </div>
            )}
          </div>
        )}
      </div>
    </figure>
  );
}

interface OvaSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}

export function OvaSlider({ label, value, min, max, step, onChange, format }: OvaSliderProps) {
  return (
    <label className="mlx-slider">
      <span>
        {label} <b>{format ? format(value) : value}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

/** Colores compartidos por las OVAs (clase 0 / clase 1 / acento / error). */
export const OVA_COLORS = {
  class0: '#55AAFF',
  class1: '#FFB454',
  accent: '#10b981',
  risk: '#f43f5e',
  grid: 'rgba(85, 170, 255, 0.12)',
  axis: 'rgba(232, 232, 240, 0.45)',
} as const;
```

- [ ] **Step 3: Verificar tipos**

```bash
node node_modules/typescript/bin/tsc --noEmit -p .
```
Expected: sin salida (exit 0).

- [ ] **Step 4: Commit**

```bash
git add src/components/ml-explorer/ovas/useSvgDrag.ts src/components/ml-explorer/ovas/OvaFrame.tsx
git commit -m "feat(ml-explorer): share drag, frame and slider pieces across OVAs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Piezas de contenido (glosario, fórmulas, profundizar, chips, figura de tipo)

**Files:**
- Create: `src/components/ml-explorer/glossary.ts`
- Create: `src/components/ml-explorer/Gloss.tsx`
- Create: `src/components/ml-explorer/Tex.tsx`
- Create: `src/components/ml-explorer/DeepDive.tsx`
- Create: `src/components/ml-explorer/InYourField.tsx`
- Create: `src/components/ml-explorer/SummaryChips.tsx`
- Create: `src/components/ml-explorer/TypeFigure.tsx`
- Test: `src/components/ml-explorer/glossary.test.ts`

- [ ] **Step 1: Test del glosario (que toda entrada esté completa)**

`src/components/ml-explorer/glossary.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { GLOSSARY } from './glossary';

describe('GLOSSARY', () => {
  it('cada término trae qué es y por qué importa', () => {
    for (const [key, entry] of Object.entries(GLOSSARY)) {
      expect(entry.term, key).not.toBe('');
      expect(entry.what.length, key).toBeGreaterThan(20);
      expect(entry.why.length, key).toBeGreaterThan(20);
    }
  });
});
```

Ejecútalo: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/glossary.test.ts` → FAIL (`Failed to resolve import "./glossary"`).

- [ ] **Step 2: Escribir `glossary.ts`**

```ts
export interface GlossaryEntry {
  term: string;
  /** Qué es, en una frase. */
  what: string;
  /** Por qué importa aquí, en otra. */
  why: string;
}

/**
 * Glosario 💡 del explorador. Un solo lugar para toda la jerga: los
 * algoritmos lo citan con <G k="clave">. El texto principal se debe
 * entender sin abrir ninguna ficha.
 */
export const GLOSSARY = {
  feature: {
    term: 'Feature (variable de entrada)',
    what: 'Cada dato que el modelo usa para decidir: los m², el número de habitaciones. En una tabla, cada columna de entrada.',
    why: 'Elegir buenas features suele pesar más que elegir el algoritmo.',
  },
  etiqueta: {
    term: 'Etiqueta (variable objetivo)',
    what: 'La respuesta que queremos predecir: el precio de la casa, «spam» o «no spam».',
    why: 'Si tus datos traen la etiqueta, el problema es supervisado.',
  },
  supervisado: {
    term: 'Aprendizaje supervisado',
    what: 'El modelo aprende de ejemplos que ya traen la respuesta correcta.',
    why: 'Es estudiar con el solucionario: funciona muy bien, pero necesitas datos etiquetados, que a veces cuestan.',
  },
  noSupervisado: {
    term: 'Aprendizaje no supervisado',
    what: 'El modelo busca estructura (grupos, patrones) en datos que no traen respuesta.',
    why: 'Sirve cuando no tienes etiquetas, pero nadie te confirma si los grupos «están bien».',
  },
  entrenamientoPrueba: {
    term: 'Datos de entrenamiento y de prueba',
    what: 'Los datos se separan: con unos el modelo aprende y con otros, que nunca vio, se mide.',
    why: 'Medir con los datos de entrenamiento es calificar un examen con preguntas que ya conocías.',
  },
  residuo: {
    term: 'Residuo',
    what: 'La diferencia entre el valor real de un punto y el que predice el modelo.',
    why: 'Los residuos grandes señalan dónde y cuánto se equivoca el modelo.',
  },
  mse: {
    term: 'MSE (error cuadrático medio)',
    what: 'El promedio de los residuos elevados al cuadrado.',
    why: 'El cuadrado castiga mucho los errores grandes: por eso un solo outlier mueve tanto la recta.',
  },
  r2: {
    term: 'R² (coeficiente de determinación)',
    what: 'Qué fracción de la variación de los datos explica el modelo: 1 es perfecto; 0 es lo mismo que predecir siempre el promedio.',
    why: 'Permite comparar modelos sin depender de las unidades (pesos, metros, grados).',
  },
  outlier: {
    term: 'Outlier (valor atípico)',
    what: 'Un dato muy alejado del resto, por un error de medición o por un caso raro de verdad.',
    why: 'Algunos algoritmos, como la regresión lineal, se dejan arrastrar mucho por ellos.',
  },
  overfitting: {
    term: 'Overfitting (sobreajuste)',
    what: 'El modelo memoriza los datos de entrenamiento, ruido incluido, y falla con datos nuevos.',
    why: 'Se detecta cuando acierta mucho en entrenamiento y bastante menos en prueba.',
  },
  hiperparametro: {
    term: 'Hiperparámetro',
    what: 'Un ajuste que eliges tú antes de entrenar (k en KNN, la profundidad de un árbol); el modelo no lo aprende.',
    why: 'Elegirlo bien suele decidir entre un modelo útil y uno que memoriza o que no aprende nada.',
  },
  frontera: {
    term: 'Frontera de decisión',
    what: 'La línea o superficie que separa las zonas donde el modelo predice una clase u otra.',
    why: 'Su forma (recta, escalones, curva) dice qué patrones puede captar el modelo.',
  },
  logOdds: {
    term: 'Log-odds',
    what: 'El logaritmo de «probabilidad de sí ÷ probabilidad de no». Si P = 0.8, los odds son 0.8/0.2 = 4 y el log-odds ≈ 1.39.',
    why: 'La regresión logística supone que el log-odds sube o baja en línea recta con cada feature.',
  },
  umbral: {
    term: 'Umbral de decisión',
    what: 'La probabilidad a partir de la cual decides «sí». Por defecto, 0.5.',
    why: 'Moverlo cambia el balance entre falsas alarmas y casos que se escapan.',
  },
  matrizConfusion: {
    term: 'Matriz de confusión',
    what: 'Tabla que cuenta aciertos y errores por clase: lo real en las filas, lo predicho en las columnas.',
    why: 'Muestra qué tipo de error comete el modelo, no solo cuántos.',
  },
  gini: {
    term: 'Impureza de Gini',
    what: 'Mide qué tan mezcladas están las clases en un grupo: 0 si todos son de la misma clase, 0.5 si están mitad y mitad.',
    why: 'El árbol elige en cada paso la pregunta que más baja la impureza.',
  },
  ruido: {
    term: 'Ruido',
    what: 'Variación de los datos que ningún patrón explica: errores de medición, casos excepcionales.',
    why: 'Un modelo que intenta explicar el ruido está sobreajustando.',
  },
  escalado: {
    term: 'Escalado de features',
    what: 'Llevar todas las features a rangos comparables, por ejemplo media 0 y desviación 1.',
    why: 'Sin escalar, la feature con números grandes (salario en pesos) aplasta a la de números pequeños (edad).',
  },
  altaDimension: {
    term: 'Alta dimensionalidad',
    what: 'Tener muchas features: decenas, cientos o miles de columnas.',
    why: 'Con muchas dimensiones todos los puntos quedan casi igual de lejos entre sí, y las distancias pierden sentido.',
  },
  distancia: {
    term: 'Distancia euclidiana',
    what: 'La distancia en línea recta entre dos puntos: √((x₁−x₂)² + (y₁−y₂)²).',
    why: 'Es la medida de parecido que usa KNN por defecto.',
  },
  ensamble: {
    term: 'Ensamble',
    what: 'Combinar muchos modelos (por ejemplo, cientos de árboles) y promediar o votar sus respuestas.',
    why: 'Reduce la inestabilidad de un modelo solo. Random Forest y Gradient Boosting son ensambles de árboles.',
  },
  interpretable: {
    term: 'Modelo interpretable',
    what: 'Un modelo cuyo razonamiento puedes leer y explicar, como «cada m² suma 2.5 millones».',
    why: 'En crédito, salud o decisiones públicas a menudo es obligatorio explicar por qué se decidió algo.',
  },
} satisfies Record<string, GlossaryEntry>;

export type GlossaryKey = keyof typeof GLOSSARY;
```

Ejecuta el test de nuevo → `1 passed`.

- [ ] **Step 3: Escribir `Gloss.tsx`**

```tsx
import { useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { GLOSSARY, type GlossaryKey } from './glossary';

/**
 * Término con ficha 💡. La ficha se monta en document.body porque las
 * animaciones de Framer Motion de la página crean contenedores con
 * transform, y dentro de ellos `position: fixed` deja de cubrir la pantalla.
 */
export function G({ k, children }: { k: GlossaryKey; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const entry = GLOSSARY[k];
  const close = () => setOpen(false);

  return (
    <>
      <button type="button" className="mlx-gl" onClick={() => setOpen(true)} aria-haspopup="dialog">
        {children ?? entry.term}
      </button>
      {open &&
        createPortal(
          <div
            className="mlx-gl-modal"
            role="dialog"
            aria-modal="true"
            aria-label={entry.term}
            onClick={close}
            onKeyDown={(e) => e.key === 'Escape' && close()}
          >
            <div className="mlx-gl-box" onClick={(e) => e.stopPropagation()}>
              <strong>💡 {entry.term}</strong>
              <p>{entry.what}</p>
              <p className="mlx-gl-why">{entry.why}</p>
              <button type="button" onClick={close} autoFocus>
                Entendido
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
```

- [ ] **Step 4: Escribir `Tex.tsx`, `DeepDive.tsx` e `InYourField.tsx`**

`src/components/ml-explorer/Tex.tsx`:
```tsx
import katex from 'katex';
import 'katex/dist/katex.min.css';

/** Fórmula con KaTeX. `block` la centra en su propia línea. */
export function Tex({ children, block = false }: { children: string; block?: boolean }) {
  const html = katex.renderToString(children, { displayMode: block, throwOnError: false, output: 'html' });
  return block ? (
    <div className="mlx-tex-block" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}
```

`src/components/ml-explorer/DeepDive.tsx`:
```tsx
import type { ReactNode } from 'react';

/** Segunda capa de cada pestaña: plegada, para quien quiera la matemática. */
export function DeepDive({ children }: { children: ReactNode }) {
  return (
    <details className="mlx-deep">
      <summary>Para profundizar</summary>
      <div className="mlx-deep-body">{children}</div>
    </details>
  );
}
```

`src/components/ml-explorer/InYourField.tsx`:
```tsx
import type { FieldExample } from './types';

/** Usos del algoritmo en otras ingenierías (pestaña «Ejemplo real»). */
export function InYourField({ items }: { items: FieldExample[] }) {
  return (
    <section className="mlx-field" aria-label="En tu área">
      <h4>En tu área</h4>
      <ul>
        {items.map((item) => (
          <li key={item.area}>
            <b>{item.area}:</b> {item.example}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 5: Escribir `SummaryChips.tsx`**

```tsx
import { TAB_LABELS, type TabId } from './types';

const CHIP_TABS: TabId[] = ['type', 'bestUse', 'pros', 'cons'];

/** La fila del cheatsheet en chips. Cada chip abre su pestaña. */
export function SummaryChips({ row, onPick }: { row: Record<TabId, string>; onPick: (tab: TabId) => void }) {
  return (
    <div className="mlx-chips" aria-label="Resumen del cheatsheet">
      {CHIP_TABS.map((tab) => (
        <button key={tab} type="button" className={`mlx-chip mlx-chip--${tab}`} onClick={() => onPick(tab)}>
          <span>{TAB_LABELS[tab]}</span>
          {row[tab]}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Escribir `TypeFigure.tsx`**

```tsx
import { OVA_COLORS } from './ovas/OvaFrame';
import type { AlgorithmGroup } from './types';

const DOTS: [number, number, 0 | 1][] = [
  [30, 40, 0], [48, 28, 0], [40, 62, 0], [62, 48, 0], [26, 80, 0],
  [130, 70, 1], [150, 52, 1], [160, 88, 1], [138, 98, 1], [176, 66, 1],
];

const LAYERS: { x: number; ys: number[] }[] = [
  { x: 40, ys: [30, 60, 90] },
  { x: 105, ys: [20, 47, 74, 101] },
  { x: 170, ys: [45, 75] },
];

const CAPTIONS: Record<AlgorithmGroup, string> = {
  supervised: 'Cada dato trae su respuesta (color). El modelo aprende a predecirla para datos nuevos.',
  unsupervised: 'Los datos no traen respuesta. El modelo busca grupos por sí solo.',
  reduction: 'Muchas columnas se resumen en pocas, perdiendo la menor información posible.',
  neural: 'Capas de neuronas simples que, juntas, aprenden patrones complejos.',
};

/** Mini-figura de la pestaña «Tipo». */
export function TypeFigure({ group }: { group: AlgorithmGroup }) {
  return (
    <figure className="mlx-typefig">
      <svg viewBox="0 0 210 120" role="img" aria-label={CAPTIONS[group]}>
        {group === 'supervised' &&
          DOTS.map(([x, y, label], i) => (
            <circle key={i} cx={x} cy={y} r={6} fill={label ? OVA_COLORS.class1 : OVA_COLORS.class0} />
          ))}
        {group === 'unsupervised' && (
          <>
            {DOTS.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={6} fill="#9898b0" />
            ))}
            <ellipse cx={44} cy={54} rx={34} ry={40} fill="none" stroke={OVA_COLORS.accent} strokeDasharray="4 4" />
            <ellipse cx={152} cy={76} rx={36} ry={36} fill="none" stroke={OVA_COLORS.accent} strokeDasharray="4 4" />
          </>
        )}
        {group === 'reduction' && (
          <>
            {[20, 34, 48, 62, 76, 90].map((y) => (
              <rect key={y} x={20} y={y} width={70} height={8} rx={2} fill={OVA_COLORS.class0} opacity={0.7} />
            ))}
            <path d="M100 60 H130" stroke={OVA_COLORS.axis} strokeWidth={2} markerEnd="url(#mlx-arrow)" />
            {[48, 64].map((y) => (
              <rect key={y} x={140} y={y} width={50} height={8} rx={2} fill={OVA_COLORS.accent} />
            ))}
            <defs>
              <marker id="mlx-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill={OVA_COLORS.axis} />
              </marker>
            </defs>
          </>
        )}
        {group === 'neural' && (
          <>
            {LAYERS.slice(0, -1).flatMap((layer, i) =>
              layer.ys.flatMap((y) =>
                LAYERS[i + 1].ys.map((y2) => (
                  <line
                    key={`${i}-${y}-${y2}`}
                    x1={layer.x}
                    y1={y}
                    x2={LAYERS[i + 1].x}
                    y2={y2}
                    stroke={OVA_COLORS.axis}
                    strokeOpacity={0.35}
                  />
                )),
              ),
            )}
            {LAYERS.flatMap((layer) =>
              layer.ys.map((y) => <circle key={`${layer.x}-${y}`} cx={layer.x} cy={y} r={7} fill={OVA_COLORS.class0} />),
            )}
          </>
        )}
      </svg>
      <figcaption>{CAPTIONS[group]}</figcaption>
    </figure>
  );
}
```

- [ ] **Step 7: Verificar tipos y tests**

```bash
node node_modules/typescript/bin/tsc --noEmit -p .
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
```
Expected: tsc sin salida; todos los tests pasan.

- [ ] **Step 8: Commit**

```bash
git add src/components/ml-explorer/glossary.ts src/components/ml-explorer/glossary.test.ts src/components/ml-explorer/Gloss.tsx src/components/ml-explorer/Tex.tsx src/components/ml-explorer/DeepDive.tsx src/components/ml-explorer/InYourField.tsx src/components/ml-explorer/SummaryChips.tsx src/components/ml-explorer/TypeFigure.tsx
git commit -m "feat(ml-explorer): add glossary, formulas and the shared content pieces

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Ejecutor de Python (PythonRunner)

**Files:**
- Create: `src/components/ml-explorer/PythonRunner.tsx`

- [ ] **Step 1: Escribir el componente**

```tsx
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPyodideClient, type PyodideClient, type RunResult, type WorkerLike } from './pyodideClient';
import type { PythonExercise } from './types';

const COLAB_URL =
  'https://colab.research.google.com/github/stivenson/stivenson.github.io/blob/main/notebooks/algoritmos-ml.ipynb';

// Un solo worker para toda la página: Pyodide se descarga una vez y lo
// comparten los ejercicios de todos los algoritmos.
let sharedClient: PyodideClient | null = null;
function getClient(): PyodideClient {
  if (!sharedClient) {
    sharedClient = createPyodideClient(
      () => new Worker(new URL('./pyodideWorker.ts', import.meta.url), { type: 'module' }) as unknown as WorkerLike,
    );
  }
  return sharedClient;
}

type Phase = { kind: 'idle' } | { kind: 'running'; progress: string } | { kind: 'done'; result: RunResult };

export function PythonRunner({ exercise }: { exercise: PythonExercise }) {
  const [code, setCode] = useState(exercise.code);
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function run() {
    setPhase({ kind: 'running', progress: 'Preparando Python…' });
    const result = await getClient().run(code, (progress) => {
      if (mounted.current) setPhase({ kind: 'running', progress });
    });
    if (mounted.current) setPhase({ kind: 'done', result });
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (phase.kind !== 'running') void run();
    } else if (e.key === 'Tab' && !e.shiftKey) {
      // Tab escribe 4 espacios (indentación de Python) en vez de saltar de campo.
      e.preventDefault();
      const el = e.currentTarget;
      const { selectionStart: start, selectionEnd: end } = el;
      setCode(code.slice(0, start) + '    ' + code.slice(end));
      requestAnimationFrame(() => el.setSelectionRange(start + 4, start + 4));
    }
  }

  const running = phase.kind === 'running';

  return (
    <div className="mlx-py">
      <div className="mlx-py-bar">
        <span className="mlx-py-title">🐍 Pruébalo en Python</span>
        <div className="mlx-py-actions">
          {running ? (
            <button type="button" onClick={() => getClient().stop()}>
              ■ Detener
            </button>
          ) : (
            <button type="button" className="is-primary" onClick={() => void run()}>
              ▶ Ejecutar
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setCode(exercise.code);
              setPhase({ kind: 'idle' });
            }}
            disabled={code === exercise.code || running}
          >
            ↺ Restaurar
          </button>
          <a href={`${COLAB_URL}#scrollTo=${exercise.colabAnchor}`} target="_blank" rel="noopener noreferrer">
            Abrir en Colab ↗
          </a>
        </div>
      </div>
      <textarea
        className="mlx-py-code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        rows={code.split('\n').length + 1}
        aria-label="Código Python editable"
      />
      <p className="mlx-py-hint">
        Edita el código y pulsa Ejecutar (Ctrl+Enter). La primera vez tu navegador descarga Python (unos 15 MB); después
        queda en caché.
      </p>
      <RunOutput phase={phase} expected={exercise.expectedOutput} />
    </div>
  );
}

function Expected({ text, open }: { text: string; open: boolean }) {
  return (
    <details className="mlx-py-expected" open={open}>
      <summary>Salida esperada</summary>
      <pre>{text}</pre>
    </details>
  );
}

function RunOutput({ phase, expected }: { phase: Phase; expected: string }) {
  if (phase.kind === 'idle') return <Expected text={expected} open />;
  if (phase.kind === 'running') {
    return (
      <p className="mlx-py-status" role="status">
        <span className="mlx-spinner" aria-hidden="true" /> {phase.progress}
      </p>
    );
  }

  const { result } = phase;
  switch (result.status) {
    case 'ok':
    case 'error':
      return (
        <div className="mlx-py-out">
          <h5>Tu salida</h5>
          {result.stdout && <pre>{result.stdout}</pre>}
          {result.images.map((png, i) => (
            <img key={i} src={`data:image/png;base64,${png}`} alt={`Gráfica ${i + 1} generada por el código`} />
          ))}
          {result.status === 'error' && (
            <>
              <pre className="mlx-py-error">{result.error}</pre>
              <p className="mlx-py-hint">Pulsa ↺ Restaurar para volver al código original.</p>
            </>
          )}
          <Expected text={expected} open={false} />
        </div>
      );
    case 'timeout':
      return (
        <div className="mlx-py-out">
          <p className="mlx-py-error">Detenido: el código tardó más de 15 segundos. ¿Hay un bucle que nunca termina?</p>
          <Expected text={expected} open={false} />
        </div>
      );
    case 'stopped':
      return (
        <div className="mlx-py-out">
          <p className="mlx-py-status">Ejecución detenida.</p>
          <Expected text={expected} open={false} />
        </div>
      );
    case 'load-failed':
      return (
        <div className="mlx-py-out">
          <p className="mlx-py-error">
            Tu navegador no pudo cargar Python ({result.error}). Puedes abrir el ejercicio en Colab con el botón de
            arriba.
          </p>
          <Expected text={expected} open />
        </div>
      );
  }
}
```

- [ ] **Step 2: Verificar tipos**

```bash
node node_modules/typescript/bin/tsc --noEmit -p .
```
Expected: sin salida (exit 0).

- [ ] **Step 3: Commit**

```bash
git add src/components/ml-explorer/PythonRunner.tsx
git commit -m "feat(ml-explorer): edit and run each exercise in the browser

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Armazón del explorador (menú, pestañas, panel, raíz y estilos)

**Files:**
- Create: `src/components/ml-explorer/useAlgorithm.ts`
- Create: `src/components/ml-explorer/AlgorithmMenu.tsx`
- Create: `src/components/ml-explorer/AlgorithmTabs.tsx`
- Create: `src/components/ml-explorer/AlgorithmPanel.tsx`
- Create: `src/components/ml-explorer/MLExplorer.tsx`
- Create: `src/components/ml-explorer/ml-explorer.css`

- [ ] **Step 1: `useAlgorithm.ts`**

```ts
import { useEffect, useState } from 'react';
import { loadAlgorithm } from './registry';
import type { AlgorithmModule } from './types';

export type AlgorithmState =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready'; module: AlgorithmModule };

/** Descarga el chunk del algoritmo elegido y expone loading/error/ready. */
export function useAlgorithm(slug: string): AlgorithmState {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ slug: string; module?: AlgorithmModule } | null>(null);

  useEffect(() => {
    let alive = true;
    loadAlgorithm(slug).then(
      (module) => alive && setResult({ slug, module }),
      () => alive && setResult({ slug }),
    );
    return () => {
      alive = false;
    };
  }, [slug, attempt]);

  // Mientras llega el nuevo chunk, el resultado anterior es de otro slug.
  if (!result || result.slug !== slug) return { status: 'loading' };
  if (result.module) return { status: 'ready', module: result.module };
  return {
    status: 'error',
    retry: () => {
      setResult(null);
      setAttempt((a) => a + 1);
    },
  };
}
```

- [ ] **Step 2: `AlgorithmMenu.tsx`**

```tsx
import { GROUP_LABELS, GROUP_ORDER, type AlgorithmMeta } from './types';

interface AlgorithmMenuProps {
  algorithms: AlgorithmMeta[];
  activeSlug: string;
  onSelect: (slug: string) => void;
  onPrefetch: (slug: string) => void;
}

/**
 * Menú izquierdo: una entrada por fila del cheatsheet. En pantallas
 * estrechas el CSS oculta la lista y muestra el <select>.
 */
export function AlgorithmMenu({ algorithms, activeSlug, onSelect, onPrefetch }: AlgorithmMenuProps) {
  const groups = GROUP_ORDER.map((group) => ({
    group,
    items: algorithms.filter((a) => a.group === group),
  }));

  return (
    <nav className="mlx-menu" aria-label="Algoritmos">
      <label className="mlx-menu-select">
        <span>Algoritmo</span>
        <select value={activeSlug} onChange={(e) => onSelect(e.target.value)}>
          {groups.map(({ group, items }) => (
            <optgroup key={group} label={GROUP_LABELS[group]}>
              {items.map((a) => (
                <option key={a.slug} value={a.slug} disabled={!a.available}>
                  {a.name}
                  {a.available ? '' : ' (próximamente)'}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <div className="mlx-menu-list">
        {groups.map(({ group, items }) => (
          <div key={group} className="mlx-menu-group">
            <h4>{GROUP_LABELS[group]}</h4>
            <ul>
              {items.map((a) => {
                const active = a.slug === activeSlug;
                return (
                  <li key={a.slug}>
                    <button
                      type="button"
                      className={`mlx-menu-item${active ? ' is-active' : ''}`}
                      aria-current={active ? 'true' : undefined}
                      disabled={!a.available}
                      onClick={() => onSelect(a.slug)}
                      onMouseEnter={() => onPrefetch(a.slug)}
                      onFocus={() => onPrefetch(a.slug)}
                    >
                      <span className="mlx-menu-icon" aria-hidden="true">
                        {a.icon}
                      </span>
                      <span className="mlx-menu-name">
                        {a.name}
                        <small>{a.nameEs}</small>
                      </span>
                      {!a.available && <span className="mlx-soon">pronto</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: `AlgorithmTabs.tsx`**

```tsx
import { useEffect, useRef, type KeyboardEvent } from 'react';
import { DeepDive } from './DeepDive';
import { InYourField } from './InYourField';
import { PythonRunner } from './PythonRunner';
import { getMeta } from './registry';
import { TypeFigure } from './TypeFigure';
import { TAB_IDS, TAB_LABELS, type AlgorithmMeta, type AlgorithmModule, type TabId } from './types';

interface AlgorithmTabsProps {
  module: AlgorithmModule;
  meta: AlgorithmMeta;
  tab: TabId;
  onTab: (tab: TabId) => void;
  onAlg: (slug: string) => void;
}

/** Las 8 columnas del cheatsheet como pestañas, y el cuerpo de la activa. */
export function AlgorithmTabs({ module, meta, tab, onTab, onAlg }: AlgorithmTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const content = module.tabs[tab];
  const { Ova } = module;
  const Demo = content.demo;

  // En móvil la barra de pestañas se desplaza: mantener visible la activa.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [tab]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const i = TAB_IDS.indexOf(tab);
    const next = TAB_IDS[(i + (e.key === 'ArrowRight' ? 1 : TAB_IDS.length - 1)) % TAB_IDS.length];
    onTab(next);
    requestAnimationFrame(() => document.getElementById(`mlx-tab-${next}`)?.focus());
  }

  return (
    <div className="mlx-tabs">
      <div
        ref={listRef}
        className="mlx-tablist"
        role="tablist"
        aria-label={`Columnas del cheatsheet para ${meta.name}`}
        onKeyDown={onKeyDown}
      >
        {TAB_IDS.map((id) => (
          <button
            key={id}
            id={`mlx-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={id === tab}
            aria-controls="mlx-tabpanel"
            tabIndex={id === tab ? 0 : -1}
            className={`mlx-tab${id === tab ? ' is-active' : ''}`}
            onClick={() => onTab(id)}
          >
            {TAB_LABELS[id]}
          </button>
        ))}
      </div>

      <div className="mlx-tabpanel" role="tabpanel" id="mlx-tabpanel" aria-labelledby={`mlx-tab-${tab}`}>
        <blockquote className="mlx-cheat">
          <span>En el cheatsheet</span>
          {module.row[tab]}
        </blockquote>
        <div className="mlx-essential">{content.essential}</div>
        {tab === 'type' && <TypeFigure group={meta.group} />}
        {tab === 'formula' && <Ova />}
        {Demo && <Demo />}
        {tab === 'whenNot' && <Alternatives slugs={module.alternatives} onAlg={onAlg} />}
        {tab === 'realWorld' && (
          <>
            <PythonRunner key={module.slug} exercise={module.python} />
            <InYourField items={module.inYourField} />
          </>
        )}
        {content.deepDive && <DeepDive>{content.deepDive}</DeepDive>}
      </div>
    </div>
  );
}

function Alternatives({ slugs, onAlg }: { slugs: string[]; onAlg: (slug: string) => void }) {
  return (
    <div className="mlx-alt">
      <h4>Mejor prueba con</h4>
      <ul>
        {slugs.map((slug) => {
          const meta = getMeta(slug);
          return (
            <li key={slug}>
              <button type="button" disabled={!meta.available} onClick={() => onAlg(slug)}>
                {meta.icon} {meta.name}
                {meta.available ? ' →' : ' (próximamente)'}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: `AlgorithmPanel.tsx`**

```tsx
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
}

export function AlgorithmPanel({ meta, state, tab, onTab, onAlg }: AlgorithmPanelProps) {
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
          <AlgorithmTabs module={state.module} meta={meta} tab={tab} onTab={onTab} onAlg={onAlg} />
        </>
      )}
    </article>
  );
}
```

- [ ] **Step 5: `MLExplorer.tsx`**

```tsx
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
```

- [ ] **Step 6: `ml-explorer.css`**

```css
/* Explorador de algoritmos de ML.
   Paleta del sitio: indigo #4C59D3, cian #55AAFF, ambar #FFB454,
   esmeralda #10b981, rosa #f43f5e. Todo va prefijado con .mlx para no
   chocar con los estilos de .markdown-content que lo rodean. */

.mlx {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 16px;
  margin: 28px 0;
  color: var(--rf-text, #e8e8f0);
  font-size: 15px;
  line-height: 1.6;
  scroll-margin-top: 80px;
}

.mlx h3,
.mlx h4,
.mlx h5,
.mlx p,
.mlx ul,
.mlx figure,
.mlx blockquote {
  margin: 0;
}

.mlx button {
  font: inherit;
  color: inherit;
}

.mlx-boot,
.mlx-skeleton {
  padding: 32px;
  border: 1px dashed rgba(85, 170, 255, 0.25);
  border-radius: 10px;
  color: var(--rf-text-muted, #9898b0);
  text-align: center;
}

/* ---------- Menú ---------- */

.mlx-menu {
  position: sticky;
  top: 72px;
  align-self: start;
  max-height: calc(100vh - 96px);
  overflow-y: auto;
  padding: 10px;
  background: rgba(10, 10, 46, 0.85);
  border: 1px solid rgba(85, 170, 255, 0.15);
  border-radius: 10px;
}

.mlx-menu-select {
  display: none;
}

.mlx-menu-group + .mlx-menu-group {
  margin-top: 12px;
}

.mlx-menu-group h4 {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--rf-text-muted, #9898b0);
}

.mlx-menu-group ul {
  list-style: none;
  padding: 0;
}

.mlx-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 7px 8px;
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.mlx-menu-item:hover:not(:disabled) {
  background: rgba(76, 89, 211, 0.15);
}

.mlx-menu-item.is-active {
  background: rgba(76, 89, 211, 0.25);
  border-color: rgba(85, 170, 255, 0.45);
}

.mlx-menu-item:disabled {
  cursor: default;
  opacity: 0.5;
}

.mlx-menu-icon {
  font-size: 18px;
  width: 22px;
  text-align: center;
}

.mlx-menu-name {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.25;
}

.mlx-menu-name small {
  font-size: 11.5px;
  font-weight: 400;
  color: var(--rf-text-muted, #9898b0);
}

.mlx-soon {
  margin-left: auto;
  padding: 1px 6px;
  font-size: 10px;
  border: 1px solid rgba(152, 152, 176, 0.4);
  border-radius: 999px;
}

/* ---------- Panel ---------- */

.mlx-panel {
  padding: 18px;
  background: rgba(10, 10, 46, 0.85);
  border: 1px solid rgba(85, 170, 255, 0.15);
  border-radius: 10px;
}

.mlx-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.mlx-head-icon {
  font-size: 30px;
}

.mlx-head h3 {
  font-size: 22px;
  color: var(--electric-cyan, #55aaff);
}

.mlx-head p {
  font-size: 13px;
  color: var(--rf-text-muted, #9898b0);
}

.mlx-error {
  padding: 16px;
  border: 1px solid rgba(244, 63, 94, 0.5);
  border-radius: 8px;
  background: rgba(244, 63, 94, 0.08);
}

.mlx-error button,
.mlx-alt button,
.mlx-py-actions button,
.mlx-py-actions a,
.mlx-ova-controls button {
  padding: 5px 12px;
  font-size: 13px;
  background: rgba(76, 89, 211, 0.18);
  border: 1px solid rgba(85, 170, 255, 0.35);
  border-radius: 6px;
  color: var(--rf-text, #e8e8f0);
  text-decoration: none;
  cursor: pointer;
}

.mlx-error button:hover,
.mlx-alt button:hover:not(:disabled),
.mlx-py-actions button:hover:not(:disabled),
.mlx-py-actions a:hover,
.mlx-ova-controls button:hover {
  background: rgba(76, 89, 211, 0.35);
}

.mlx button:disabled {
  opacity: 0.45;
  cursor: default;
}

/* ---------- Chips ---------- */

.mlx-chips {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 14px;
}

.mlx-chip {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  font-size: 13px;
  text-align: left;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(85, 170, 255, 0.15);
  border-left: 3px solid var(--electric-blue, #4c59d3);
  border-radius: 6px;
  cursor: pointer;
}

.mlx-chip span {
  font-size: 10.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--rf-text-muted, #9898b0);
}

.mlx-chip--pros {
  border-left-color: #10b981;
}

.mlx-chip--cons {
  border-left-color: #f43f5e;
}

/* ---------- Pestañas ---------- */

.mlx-tablist {
  display: flex;
  gap: 2px;
  overflow-x: auto;
  scrollbar-width: thin;
  border-bottom: 1px solid rgba(85, 170, 255, 0.2);
}

.mlx-tab {
  flex: 0 0 auto;
  padding: 8px 12px;
  font-size: 13.5px;
  white-space: nowrap;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  color: var(--rf-text-muted, #9898b0) !important;
}

.mlx-tab:hover {
  color: var(--rf-text, #e8e8f0) !important;
}

.mlx-tab.is-active {
  color: var(--electric-cyan, #55aaff) !important;
  border-bottom-color: var(--electric-cyan, #55aaff);
  font-weight: 600;
}

.mlx-tabpanel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
}

.mlx-cheat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 14px;
  font-size: 17px;
  font-weight: 600;
  background: rgba(76, 89, 211, 0.1);
  border-left: 3px solid var(--electric-cyan, #55aaff);
  border-radius: 0 6px 6px 0;
}

.mlx-cheat span {
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--rf-text-muted, #9898b0);
}

.mlx-essential {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mlx-essential ul,
.mlx-deep-body ul {
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mlx-essential .mlx-rule {
  padding: 8px 12px;
  border-left: 3px solid #10b981;
  background: rgba(16, 185, 129, 0.08);
  border-radius: 0 6px 6px 0;
  font-weight: 600;
}

.mlx-tex-block {
  overflow-x: auto;
  padding: 4px 0;
}

.mlx-deep {
  border: 1px solid rgba(85, 170, 255, 0.18);
  border-radius: 8px;
  padding: 0 14px;
}

.mlx-deep summary {
  padding: 10px 0;
  font-weight: 600;
  color: var(--electric-cyan, #55aaff);
  cursor: pointer;
}

.mlx-deep-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 14px;
}

.mlx-field h4,
.mlx-alt h4 {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--electric-cyan, #55aaff);
}

.mlx-field ul,
.mlx-alt ul {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  padding: 0;
}

.mlx-field li {
  padding: 6px 10px;
  font-size: 13.5px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(85, 170, 255, 0.15);
  border-radius: 6px;
}

.mlx-typefig {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mlx-typefig svg {
  width: 210px;
  flex: 0 0 auto;
}

.mlx-typefig figcaption {
  font-size: 14px;
  color: var(--rf-text-muted, #9898b0);
}

/* ---------- Glosario ---------- */

.mlx-gl {
  display: inline;
  padding: 0;
  background: none;
  border: none;
  border-bottom: 1px dashed rgba(85, 170, 255, 0.5);
  color: var(--electric-cyan, #55aaff) !important;
  cursor: pointer;
}

.mlx-gl::after {
  content: '\00a0💡';
  font-size: 0.85em;
}

.mlx-gl-modal {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(2, 1, 14, 0.74);
}

.mlx-gl-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(430px, 100%);
  padding: 18px;
  background: #0d0d38;
  border: 1px solid rgba(85, 170, 255, 0.35);
  border-radius: 10px;
  color: #e8e8f0;
  font-size: 15px;
  line-height: 1.55;
}

.mlx-gl-box p {
  margin: 0;
}

.mlx-gl-why {
  color: #9898b0;
}

.mlx-gl-box button {
  align-self: flex-end;
  padding: 5px 14px;
  background: #4c59d3;
  border: none;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
}

/* ---------- Python ---------- */

.mlx-py {
  border: 1px solid rgba(85, 170, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.mlx-py-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(76, 89, 211, 0.12);
}

.mlx-py-title {
  font-weight: 600;
}

.mlx-py-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mlx-py-actions .is-primary {
  background: #4c59d3;
  border-color: #4c59d3;
  color: #fff;
}

.mlx-py-code {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  font-family: 'Space Mono', Consolas, Monaco, monospace;
  font-size: 13px;
  line-height: 1.55;
  color: #e8e8f0;
  background: #070622;
  border: none;
  resize: vertical;
  tab-size: 4;
  white-space: pre;
  overflow-x: auto;
}

.mlx-py-code:focus {
  outline: 2px solid rgba(85, 170, 255, 0.5);
  outline-offset: -2px;
}

.mlx-py-hint {
  padding: 6px 12px;
  font-size: 12.5px;
  color: var(--rf-text-muted, #9898b0);
}

.mlx-py-out,
.mlx-py-expected,
.mlx-py-status {
  padding: 8px 12px 12px;
}

.mlx-py-out {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mlx-py-out h5,
.mlx-py-expected summary {
  font-size: 13px;
  font-weight: 600;
  color: var(--electric-cyan, #55aaff);
  cursor: default;
}

.mlx-py-expected summary {
  cursor: pointer;
}

.mlx pre {
  margin: 6px 0 0;
  padding: 10px 12px;
  font-family: 'Space Mono', Consolas, Monaco, monospace;
  font-size: 12.5px;
  line-height: 1.5;
  background: #040320;
  border-radius: 6px;
  overflow-x: auto;
  white-space: pre;
}

.mlx-py-out img {
  max-width: 100%;
  border-radius: 6px;
}

.mlx-py-error {
  color: #fda4af;
  border: 1px solid rgba(244, 63, 94, 0.4);
}

p.mlx-py-error {
  padding: 8px 10px;
  border-radius: 6px;
}

.mlx-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  vertical-align: -1px;
  border: 2px solid rgba(85, 170, 255, 0.3);
  border-top-color: #55aaff;
  border-radius: 50%;
  animation: mlx-spin 0.8s linear infinite;
}

@keyframes mlx-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ---------- OVAs ---------- */

.mlx-ova {
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.04);
  overflow: hidden;
}

.mlx-ova-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  background: rgba(16, 185, 129, 0.1);
}

.mlx-ova-head span {
  font-size: 13px;
  color: var(--rf-text-muted, #9898b0);
}

.mlx-ova-body {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 12px;
  padding: 12px;
}

.mlx-ova-stage svg {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
}

.mlx-ova-stage .is-draggable {
  cursor: grab;
  touch-action: none;
}

.mlx-ova-stage .is-draggable:focus-visible {
  outline: 2px solid #55aaff;
}

.mlx-ova-side {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 14px;
}

.mlx-ova-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mlx-ova-readout {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: rgba(4, 3, 32, 0.6);
  border-radius: 6px;
}

.mlx-slider {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mlx-slider input {
  width: 100%;
  accent-color: #10b981;
}

.mlx-tree {
  font-family: 'Space Mono', Consolas, Monaco, monospace;
  font-size: 12px;
  line-height: 1.5;
  list-style: none;
  padding-left: 0;
}

.mlx-tree .mlx-tree {
  padding-left: 14px;
  border-left: 1px dashed rgba(85, 170, 255, 0.25);
}

/* ---------- Móvil ---------- */

@media (max-width: 768px) {
  .mlx {
    grid-template-columns: minmax(0, 1fr);
  }

  .mlx-menu {
    position: static;
    max-height: none;
    padding: 10px;
  }

  .mlx-menu-list {
    display: none;
  }

  .mlx-menu-select {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    color: var(--rf-text-muted, #9898b0);
  }

  .mlx-menu-select select {
    padding: 8px;
    font-size: 15px;
    color: #e8e8f0;
    background: #070622;
    border: 1px solid rgba(85, 170, 255, 0.35);
    border-radius: 6px;
  }

  .mlx-panel {
    padding: 12px;
  }

  .mlx-chips {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .mlx-ova-body {
    grid-template-columns: minmax(0, 1fr);
  }

  .mlx-typefig {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mlx-spinner {
    animation: none;
  }
}
```

- [ ] **Step 7: Verificar tipos y tests**

```bash
node node_modules/typescript/bin/tsc --noEmit -p .
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
```
Expected: tsc sin salida; todos los tests pasan.

- [ ] **Step 8: Commit**

```bash
git add src/components/ml-explorer/useAlgorithm.ts src/components/ml-explorer/AlgorithmMenu.tsx src/components/ml-explorer/AlgorithmTabs.tsx src/components/ml-explorer/AlgorithmPanel.tsx src/components/ml-explorer/MLExplorer.tsx src/components/ml-explorer/ml-explorer.css
git commit -m "feat(ml-explorer): build the menu, tabs and panel of the explorer

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: Scripts de ejercicios (verificación y notebook)

**Files:**
- Create: `scripts/check-ml-exercises.py`
- Create: `scripts/build-ml-notebook.py`
- Create: `src/components/ml-explorer/algorithms/python/.gitkeep`

- [ ] **Step 1: `scripts/check-ml-exercises.py`**

```python
"""Ejecuta los ejercicios del explorador de ML y compara su salida.

Cada ejercicio vive en src/components/ml-explorer/algorithms/python/<slug>.py
y su salida esperada en <slug>.out.txt. El explorador muestra esa salida
esperada aunque Python no cargue en el navegador, así que debe coincidir con
lo que imprime el código de verdad.

Uso (desde portfolio-spa/), con un Python que tenga las mismas versiones que
Pyodide 0.27.7 (numpy 2.0.2, scikit-learn 1.6.1, matplotlib 3.8.4, scipy 1.14.1):

    ~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py           # verifica
    ~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py --update  # regenera
"""
import os
import subprocess
import sys
from pathlib import Path

PY_DIR = Path(__file__).resolve().parent.parent / "src/components/ml-explorer/algorithms/python"


def main() -> None:
    update = "--update" in sys.argv
    env = {**os.environ, "MPLBACKEND": "Agg", "PYTHONIOENCODING": "utf-8", "PYTHONWARNINGS": "ignore"}
    failed = []
    scripts = sorted(PY_DIR.glob("*.py"))
    if not scripts:
        print(f"No hay ejercicios en {PY_DIR}")
    for script in scripts:
        run = subprocess.run(
            [sys.executable, str(script)],
            capture_output=True,
            text=True,
            encoding="utf-8",
            env=env,
            timeout=120,
        )
        if run.returncode != 0:
            print(f"✗ {script.name} falló:\n{run.stderr}")
            failed.append(script.name)
            continue
        out = run.stdout.rstrip("\n")
        expected_path = script.with_suffix(".out.txt")
        if update:
            expected_path.write_text(out + "\n", encoding="utf-8")
            print(f"↻ {expected_path.name}")
            continue
        expected = expected_path.read_text(encoding="utf-8").rstrip("\n") if expected_path.exists() else None
        if out == expected:
            print(f"✓ {script.name}")
        else:
            print(f"✗ {script.name}: la salida no coincide con {expected_path.name}")
            failed.append(script.name)
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: `scripts/build-ml-notebook.py`**

```python
"""Genera notebooks/algoritmos-ml.ipynb con los ejercicios del explorador.

El notebook es el mismo código que corre en el navegador con Pyodide. Cada
sección tiene una celda de título con id = slug: el botón «Abrir en Colab»
del explorador salta a ella con #scrollTo=<slug>.

Uso (desde portfolio-spa/):  python3 scripts/build-ml-notebook.py
"""
import json
from pathlib import Path

SPA = Path(__file__).resolve().parent.parent
PY_DIR = SPA / "src/components/ml-explorer/algorithms/python"
OUT = SPA.parent / "notebooks/algoritmos-ml.ipynb"
ARTICLE = "https://stivenson.github.io/#/articles/algoritmos-ml-explorador"

# Mismo orden que el menú del explorador. Cada fase agrega sus algoritmos.
ALGORITHMS: list[tuple[str, str, str]] = []


def lines(text: str) -> list[str]:
    return text.splitlines(keepends=True)


def markdown(text: str, cell_id: str) -> dict:
    return {"cell_type": "markdown", "id": cell_id, "metadata": {}, "source": lines(text)}


def code(text: str, cell_id: str) -> dict:
    return {
        "cell_type": "code",
        "id": cell_id,
        "metadata": {},
        "execution_count": None,
        "outputs": [],
        "source": lines(text),
    }


def main() -> None:
    cells = [
        markdown(
            "# Algoritmos de machine learning: ejercicios\n\n"
            "Un ejercicio breve por algoritmo, con datos de juguete y semilla fija para que el resultado se pueda repetir.\n\n"
            f"Explicación, fórmulas y simuladores en el artículo: {ARTICLE}\n\n"
            "Ejecuta las celdas en orden con **Entorno de ejecución → Ejecutar todas**. No hace falta GPU.",
            "intro",
        )
    ]
    for slug, title, summary in ALGORITHMS:
        cells.append(
            markdown(
                f"## {title}\n\n{summary}\n\n[Abrir en el explorador]({ARTICLE}?alg={slug}&tab=realWorld)",
                slug,
            )
        )
        cells.append(code((PY_DIR / f"{slug}.py").read_text(encoding="utf-8").rstrip("\n"), f"{slug}-codigo"))

    notebook = {
        "cells": cells,
        "metadata": {
            "colab": {"provenance": []},
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python"},
        },
        "nbformat": 4,
        "nbformat_minor": 5,
    }
    OUT.write_text(json.dumps(notebook, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Escrito {OUT.relative_to(SPA.parent)} con {len(ALGORITHMS)} ejercicios")


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Probar ambos scripts vacíos**

```bash
mkdir -p src/components/ml-explorer/algorithms/python && touch src/components/ml-explorer/algorithms/python/.gitkeep
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
python3 scripts/build-ml-notebook.py
```
Expected: `No hay ejercicios en …` y `Escrito notebooks/algoritmos-ml.ipynb con 0 ejercicios`.

- [ ] **Step 4: Commit (sin el notebook todavía: se genera completo en la Task 20)**

```bash
rm ../notebooks/algoritmos-ml.ipynb
git add scripts/check-ml-exercises.py scripts/build-ml-notebook.py src/components/ml-explorer/algorithms/python/.gitkeep
git commit -m "build(ml-explorer): check exercises in CPython and generate the notebook

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: Linear Regression completo

**Files:**
- Create: `src/components/ml-explorer/algorithms/python/linear-regression.py`
- Create: `src/components/ml-explorer/algorithms/python/linear-regression.out.txt` (generado)
- Create: `src/components/ml-explorer/ovas/LinearRegressionOva.tsx`
- Create: `src/components/ml-explorer/algorithms/linear-regression.tsx`
- Modify: `src/components/ml-explorer/registry.ts` (LOADERS)
- Modify: `src/components/ml-explorer/registry.test.ts` (disponibles)
- Modify: `scripts/build-ml-notebook.py` (ALGORITHMS)

- [ ] **Step 1: El ejercicio**

`src/components/ml-explorer/algorithms/python/linear-regression.py`:
```python
# Precio de casas: ¿cuánto suma cada m² y cada habitación?
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error

rng = np.random.default_rng(42)
n = 200
area = rng.uniform(40, 200, n)          # m²
habitaciones = rng.integers(1, 6, n)    # de 1 a 5
# Precio "real" en millones: base + 2.5 por m² + 15 por habitación + ruido
precio = 80 + 2.5 * area + 15 * habitaciones + rng.normal(0, 25, n)

X = np.column_stack([area, habitaciones])
X_train, X_test, y_train, y_test = train_test_split(X, precio, test_size=0.25, random_state=0)

modelo = LinearRegression().fit(X_train, y_train)
pred = modelo.predict(X_test)

print(f"Intercepto b0: {modelo.intercept_:.1f}")
print(f"Por cada m² (b1): {modelo.coef_[0]:.2f}")
print(f"Por cada habitación (b2): {modelo.coef_[1]:.1f}")
print(f"R² con casas que no vio: {r2_score(y_test, pred):.3f}")
print(f"Error medio: {mean_absolute_error(y_test, pred):.1f} millones")
print(f"Casa de 120 m² y 3 habitaciones: {modelo.predict([[120, 3]])[0]:.0f} millones")

plt.figure(figsize=(4.5, 3.2))
plt.scatter(y_test, pred, s=14)
lims = [y_test.min(), y_test.max()]
plt.plot(lims, lims, "--", color="gray")
plt.xlabel("Precio real")
plt.ylabel("Precio predicho")
plt.title("Más cerca de la diagonal = mejor")
plt.show()
```

- [ ] **Step 2: Generar y revisar la salida esperada**

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py --update
cat src/components/ml-explorer/algorithms/python/linear-regression.out.txt
```
Expected (exacto; si cambia, revisa las versiones del venv):
```
Intercepto b0: 80.2
Por cada m² (b1): 2.47
Por cada habitación (b2): 16.0
R² con casas que no vio: 0.942
Error medio: 20.4 millones
Casa de 120 m² y 3 habitaciones: 425 millones
```
Los números deben contar la historia del texto: el modelo recupera aproximadamente 80, 2.5 y 15, y la casa de 120 m² con 3 habitaciones vale 425 (el mismo cálculo de la pestaña Fórmula).

- [ ] **Step 3: La OVA**

`src/components/ml-explorer/ovas/LinearRegressionOva.tsx`:
```tsx
import { useState, type MouseEvent } from 'react';
import { OVA_COLORS, OvaFrame } from './OvaFrame';
import { fitLine, mse, type Pt } from './ovaMath';
import { createPlot } from './plot';
import { clientToSvg, useSvgDrag } from './useSvgDrag';

// 30 px por unidad en ambos ejes (300/10 y 240/8): así los cuadrados de
// error se ven cuadrados de verdad.
const PLOT = createPlot(360, 300, 30, [0, 10], [0, 8]);
const MAX_POINTS = 20;

const INITIAL: Pt[] = [
  { x: 1, y: 1.6 },
  { x: 2, y: 2.1 },
  { x: 3, y: 3.4 },
  { x: 4, y: 3.2 },
  { x: 5, y: 4.6 },
  { x: 6, y: 4.4 },
  { x: 7, y: 5.9 },
  { x: 8, y: 6.1 },
  { x: 9, y: 6.8 },
];

const OUTLIER: Pt = { x: 8.5, y: 0.8 };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const toData = (p: Pt): Pt => ({ x: clamp(PLOT.ix(p.x), 0, 10), y: clamp(PLOT.iy(p.y), 0, 8) });

export function LinearRegressionOva() {
  const [points, setPoints] = useState<Pt[]>(INITIAL);
  const [showSquares, setShowSquares] = useState(true);
  const line = fitLine(points);
  const error = mse(points, line);
  const predict = (x: number) => line.b0 + line.b1 * x;

  const { svgRef, begin, svgProps } = useSvgDrag<number>((i, p) =>
    setPoints((prev) => prev.map((pt, j) => (j === i ? toData(p) : pt))),
  );

  function addPoint(e: MouseEvent<SVGRectElement>) {
    if (!svgRef.current || points.length >= MAX_POINTS) return;
    const p = toData(clientToSvg(svgRef.current, e.clientX, e.clientY));
    setPoints((prev) => [...prev, p]);
  }

  const inner = { x: PLOT.pad, y: PLOT.pad, width: PLOT.width - 2 * PLOT.pad, height: PLOT.height - 2 * PLOT.pad };

  return (
    <OvaFrame
      title="La recta que menos se equivoca"
      hint="Arrastra los puntos o toca el fondo para añadir uno. La recta se recalcula sola."
      controls={
        <>
          <label>
            <input type="checkbox" checked={showSquares} onChange={(e) => setShowSquares(e.target.checked)} /> Mostrar
            los errores al cuadrado
          </label>
          <button
            type="button"
            onClick={() => setPoints((prev) => [...prev, OUTLIER])}
            disabled={points.length >= MAX_POINTS}
          >
            Añadir un outlier
          </button>
          <button type="button" onClick={() => setPoints(INITIAL)}>
            Restablecer
          </button>
        </>
      }
      readout={
        <>
          <span>
            Recta:{' '}
            <b>
              ŷ = {line.b0.toFixed(2)} + {line.b1.toFixed(2)}·x
            </b>
          </span>
          <span>
            MSE: <b>{error.toFixed(2)}</b>
          </span>
          <span>
            Cada cuadrado amarillo es un residuo al cuadrado. La recta de mínimos cuadrados es la que deja la menor
            área amarilla promedio. Añade un outlier y mira cuánto se inclina.
          </span>
        </>
      }
    >
      <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} {...svgProps} role="img" aria-label="Puntos y recta de mínimos cuadrados">
        <defs>
          <clipPath id="mlx-lr-clip">
            <rect {...inner} />
          </clipPath>
        </defs>
        <rect {...inner} fill="transparent" onClick={addPoint} />
        <g pointerEvents="none">
          {Array.from({ length: 11 }, (_, x) => (
            <line key={`gx${x}`} x1={PLOT.sx(x)} x2={PLOT.sx(x)} y1={PLOT.sy(0)} y2={PLOT.sy(8)} stroke={OVA_COLORS.grid} />
          ))}
          {Array.from({ length: 9 }, (_, y) => (
            <line key={`gy${y}`} x1={PLOT.sx(0)} x2={PLOT.sx(10)} y1={PLOT.sy(y)} y2={PLOT.sy(y)} stroke={OVA_COLORS.grid} />
          ))}
          <text x={PLOT.sx(10)} y={PLOT.height - 8} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
            área →
          </text>
          <text x={8} y={PLOT.sy(8) - 10} fontSize={11} fill={OVA_COLORS.axis}>
            ↑ precio
          </text>
          <g clipPath="url(#mlx-lr-clip)">
            {showSquares &&
              points.map((p, i) => {
                const r = Math.abs(p.y - predict(p.x));
                const side = r * (PLOT.sx(1) - PLOT.sx(0));
                return (
                  <rect
                    key={`sq${i}`}
                    x={PLOT.sx(p.x)}
                    y={PLOT.sy(Math.max(p.y, predict(p.x)))}
                    width={side}
                    height={side}
                    fill={OVA_COLORS.class1}
                    fillOpacity={0.18}
                    stroke={OVA_COLORS.class1}
                    strokeOpacity={0.5}
                  />
                );
              })}
            {points.map((p, i) => (
              <line
                key={`res${i}`}
                x1={PLOT.sx(p.x)}
                x2={PLOT.sx(p.x)}
                y1={PLOT.sy(p.y)}
                y2={PLOT.sy(predict(p.x))}
                stroke={OVA_COLORS.risk}
                strokeDasharray="3 3"
              />
            ))}
            <line
              x1={PLOT.sx(0)}
              y1={PLOT.sy(predict(0))}
              x2={PLOT.sx(10)}
              y2={PLOT.sy(predict(10))}
              stroke={OVA_COLORS.accent}
              strokeWidth={2.5}
            />
          </g>
        </g>
        {points.map((p, i) => (
          <circle
            key={`pt${i}`}
            className="is-draggable"
            cx={PLOT.sx(p.x)}
            cy={PLOT.sy(p.y)}
            r={7}
            fill={OVA_COLORS.class0}
            stroke="#040320"
            strokeWidth={1.5}
            onPointerDown={begin(i)}
          />
        ))}
      </svg>
    </OvaFrame>
  );
}
```

- [ ] **Step 4: El contenido del algoritmo**

`src/components/ml-explorer/algorithms/linear-regression.tsx`:
```tsx
import { G } from '../Gloss';
import { Tex } from '../Tex';
import { LinearRegressionOva } from '../ovas/LinearRegressionOva';
import type { AlgorithmModule } from '../types';
import code from './python/linear-regression.py?raw';
import expectedOutput from './python/linear-regression.out.txt?raw';

const linearRegression: AlgorithmModule = {
  slug: 'linear-regression',
  row: {
    type: 'Supervisado',
    bestUse: 'Predecir valores continuos',
    formula: 'Y = b₀ + b₁X₁ + b₂X₂ + …',
    assumptions: 'Linealidad, independencia',
    pros: 'Simple, interpretable, rápido',
    cons: 'Sensible a outliers y a relaciones no lineales',
    whenNot: 'Datos con fuerte no linealidad',
    realWorld: 'Predicción del precio de casas',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>Supervisado:</b> aprende de ejemplos que ya traen la respuesta. Le das casas con su{' '}
            <G k="feature">área y número de habitaciones</G> y su <G k="etiqueta">precio real</G>, y aprende a
            estimar el precio de casas nuevas.
          </p>
          <p>
            Predice un <b>número</b> (precio, temperatura, consumo), no una categoría. A eso se le llama un problema de{' '}
            <i>regresión</i>.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Dados pares <Tex>{'(x_i, y_i)'}</Tex>, busca una función lineal en los parámetros:{' '}
            <Tex>{'f(x) = b_0 + b_1 x_1 + \\dots + b_p x_p'}</Tex>.
          </p>
          <p>
            «Lineal» se refiere a los pesos b, no a las x: <Tex>{'y = b_0 + b_1 x + b_2 x^2'}</Tex> también es
            regresión lineal, con x² como feature adicional.
          </p>
        </>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsala cuando quieres <b>predecir un valor continuo</b> y, sobre todo, <b>entender cuánto pesa cada
            factor</b>.
          </p>
          <ul>
            <li>Precio de una vivienda según área, habitaciones y estrato.</li>
            <li>Demanda de energía según la temperatura.</li>
            <li>Ventas según la inversión en publicidad.</li>
          </ul>
          <p className="mlx-rule">
            Es el punto de partida: si una recta ya explica bien tus datos, no necesitas nada más complejo.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Funciona con pocas decenas de filas y escala a millones: entrenarla cuesta <Tex>{'O(n p^2)'}</Tex> con n
          filas y p features. Si hay más features que filas, existen infinitas soluciones y hace falta regularización
          (Ridge o Lasso).
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> si el modelo aprendió b₀ = 80, b₁ = 2.5 por m² y b₂ = 15 por habitación, una casa de 120
            m² con 3 habitaciones cuesta:
          </p>
          <Tex block>{'80 + 2.5 \\times 120 + 15 \\times 3 = 425 \\text{ millones}'}</Tex>
          <p>
            La fórmula general es esa misma suma, con un peso por cada <G k="feature">feature</G>:
          </p>
          <Tex block>{'\\hat{y} = b_0 + b_1 x_1 + b_2 x_2 + \\dots'}</Tex>
          <p>
            ¿Cómo elige los pesos? Busca la recta con el menor <G k="mse">error cuadrático medio</G>: el promedio de
            los <G k="residuo">residuos</G> al cuadrado. En el simulador, cada cuadrado amarillo es un residuo al
            cuadrado.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>Mínimos cuadrados ordinarios:</p>
          <Tex block>{'\\min_{b}\\ \\frac{1}{n}\\sum_{i=1}^{n}\\left(y_i - \\hat{y}_i\\right)^2'}</Tex>
          <p>Tiene solución cerrada, la ecuación normal:</p>
          <Tex block>{'b = (X^\\top X)^{-1} X^\\top y'}</Tex>
          <p>
            Con una sola variable:{' '}
            <Tex>{'b_1 = \\frac{\\sum (x_i-\\bar{x})(y_i-\\bar{y})}{\\sum (x_i-\\bar{x})^2},\\quad b_0 = \\bar{y} - b_1\\bar{x}'}</Tex>
            . Es lo que calcula el simulador cada vez que mueves un punto. Con millones de filas se usa descenso de
            gradiente en lugar de invertir la matriz.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>Dos supuestos principales:</p>
          <ul>
            <li>
              <b>Linealidad:</b> cada feature suma o resta en línea recta. Si el precio sube cada vez más rápido con
              el área, una recta se queda corta.
            </li>
            <li>
              <b>Independencia:</b> el error de un dato no depende del de otro. Falla, por ejemplo, en series de
              tiempo: el consumo de hoy se parece al de ayer.
            </li>
          </ul>
          <p>Cómo revisarlos: grafica los residuos. Si forman una curva o un patrón, algún supuesto no se cumple.</p>
        </>
      ),
      deepDive: (
        <p>
          Para que los intervalos de confianza y los p-valores sean válidos se suman: varianza constante de los
          errores (homocedasticidad), errores aproximadamente normales y poca colinealidad entre features. Si solo
          quieres predecir, basta con que el error en datos de prueba sea bajo.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Simple:</b> se explica en una frase y se calcula en milisegundos.
          </li>
          <li>
            <b>
              <G k="interpretable">Interpretable</G>:
            </b>{' '}
            cada peso se lee directo: «cada m² suma 2.5 millones». Ideal cuando tienes que justificar la decisión.
          </li>
          <li>
            <b>Rápida:</b> entrena con millones de filas en un portátil y predice con una suma.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Tiene solución exacta (no depende de semillas ni de iteraciones) y teoría estadística completa para sus
          intervalos de confianza. Es la línea base contra la que se compara cualquier modelo más complejo.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>
              Sensible a <G k="outlier">outliers</G>:
            </b>{' '}
            como el error se eleva al cuadrado, un solo punto lejano arrastra la recta. Pruébalo con «Añadir un
            outlier» en el simulador de la pestaña Fórmula.
          </li>
          <li>
            <b>Solo ve rectas:</b> si la relación real es curva (rendimientos decrecientes, umbrales), se equivoca de
            forma sistemática.
          </li>
          <li>
            <b>No descubre interacciones sola:</b> si el efecto del área depende del barrio, tienes que crear esa
            feature a mano.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Contra los outliers: regresión robusta (Huber, RANSAC). Contra la no linealidad: features transformadas
          (x², log x) o árboles. Con features muy correlacionadas los pesos se vuelven inestables; Ridge (penalización
          L2) lo corrige.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No la uses si la relación entre las features y la respuesta es claramente no lineal.</p>
          <p>
            Ejemplo: el rendimiento de un cultivo sube con el fertilizante hasta cierto punto, y después baja. Una
            recta no puede subir y bajar. Tampoco sirve para predecir categorías (sí/no): para eso está la regresión
            logística.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Antes de descartarla, prueba transformar las features: muchas relaciones curvas se vuelven rectas con un
          logaritmo. Si los residuos siguen mostrando patrones, cambia de modelo.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Predicción del precio de casas.</b> Inmobiliarias y bancos estiman el valor de una vivienda a partir de
            su área, habitaciones, ubicación y antigüedad. La regresión lineal da el precio y además explica cuánto
            aporta cada característica.
          </p>
          <p>
            El ejercicio genera 200 casas de juguete cuyo precio real es 80 + 2.5 por m² + 15 por habitación, más
            ruido. Mira si el modelo recupera esos números y qué tan bien predice casas que no vio (
            <G k="entrenamientoPrueba">datos de prueba</G>, medido con <G k="r2">R²</G>).
          </p>
        </>
      ),
      deepDive: (
        <p>
          En producción: separa por fecha (entrena con ventas antiguas y prueba con las recientes), modela el
          logaritmo del precio (los errores suelen ser proporcionales al precio) y vigila que la relación no cambie con
          el tiempo.
        </p>
      ),
    },
  },
  Ova: LinearRegressionOva,
  python: { code, expectedOutput, colabAnchor: 'linear-regression' },
  inYourField: [
    { area: 'Industrial', example: 'demanda de un producto según precio y temporada.' },
    { area: 'Civil', example: 'resistencia del concreto según días de curado y relación agua-cemento.' },
    { area: 'Eléctrica', example: 'consumo de energía de un edificio según la temperatura exterior.' },
  ],
  alternatives: ['decision-tree', 'random-forest', 'gradient-boosting'],
};

export default linearRegression;
```

- [ ] **Step 5: Registrar el algoritmo**

En `src/components/ml-explorer/registry.ts`, reemplaza `const LOADERS: Record<string, ModuleLoader> = {};` por:
```ts
const LOADERS: Record<string, ModuleLoader> = {
  'linear-regression': () => import('./algorithms/linear-regression'),
};
```

En `src/components/ml-explorer/registry.test.ts`, cambia la expectativa de disponibles:
```ts
    expect(AVAILABLE_SLUGS).toEqual(['linear-regression']);
```

En `scripts/build-ml-notebook.py`, reemplaza `ALGORITHMS: list[tuple[str, str, str]] = []` por:
```python
ALGORITHMS: list[tuple[str, str, str]] = [
    (
        "linear-regression",
        "Linear Regression (regresión lineal)",
        "Precio de casas: ¿cuánto suma cada m² y cada habitación?",
    ),
]
```

- [ ] **Step 6: Verificar**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
```
Expected: todos los tests pasan; tsc sin salida; `✓ linear-regression.py`.

- [ ] **Step 7: Commit**

```bash
git add src/components/ml-explorer/algorithms/python/linear-regression.py src/components/ml-explorer/algorithms/python/linear-regression.out.txt src/components/ml-explorer/ovas/LinearRegressionOva.tsx src/components/ml-explorer/algorithms/linear-regression.tsx src/components/ml-explorer/registry.ts src/components/ml-explorer/registry.test.ts scripts/build-ml-notebook.py
git commit -m "feat(ml-explorer): explain linear regression with an OVA and an exercise

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 16: El artículo y su integración en la SPA

**Files:**
- Modify: `src/components/MarkdownRenderer.tsx` (imports, embed del explorador, enlaces internos)
- Modify: `src/styles/retro-modern.css` (ancho completo para el explorador)
- Create: `src/data/articles/algoritmos-ml-explorador.md`
- Modify: `src/data/articles/index.ts` (registrar el artículo)

- [ ] **Step 1: Embed del explorador en `MarkdownRenderer.tsx`**

Agrega al inicio del archivo, junto a los otros imports:
```tsx
import { lazy, Suspense } from 'react';
```

Justo después de la línea `import 'katex/dist/katex.min.css';` agrega:
```tsx
// El explorador de ML solo lo usa un artículo: se descarga aparte cuando el
// markdown lo pide con <ml-explorer></ml-explorer>.
const MLExplorer = lazy(() => import('./ml-explorer/MLExplorer').then((m) => ({ default: m.MLExplorer })));

// Definido a nivel de módulo a propósito: si se creara dentro del render,
// React lo vería como un componente nuevo en cada render y remontaría el
// explorador, perdiendo la ejecución de Python en curso.
function MLExplorerEmbed() {
  return (
    <Suspense fallback={<div className="mlx-boot">Cargando el explorador…</div>}>
      <MLExplorer />
    </Suspense>
  );
}
```

Dentro del objeto `components`, justo después de la entrada `iframe: ...`, agrega:
```tsx
    // Explorador de algoritmos de ML (artículo algoritmos-ml-explorador).
    ...({ 'ml-explorer': MLExplorerEmbed } as Components),
```

- [ ] **Step 2: Enlaces internos sin pestaña nueva**

Hoy todos los enlaces del markdown abren pestaña nueva. Los de la guía «¿Qué algoritmo necesito?» apuntan al explorador del mismo artículo (`#/articles/…?alg=…`) y deben navegar en la misma pestaña. Reemplaza la entrada `a:` completa (desde `a: ({ node, ...props }) => (` hasta su `),`) por:
```tsx
    a: ({ node, href, ...props }) => {
      // Los enlaces internos (#/...) navegan dentro de la SPA; el resto abre
      // pestaña nueva, como siempre.
      const internal = typeof href === 'string' && href.startsWith('#/');
      return (
        <a
          href={href}
          style={{
            color: 'var(--electric-cyan)',
            textDecoration: 'underline',
            textDecorationColor: 'rgba(85, 170, 255, 0.4)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--electric-blue)';
            e.currentTarget.style.textDecorationColor = 'var(--electric-blue)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--electric-cyan)';
            e.currentTarget.style.textDecorationColor = 'rgba(85, 170, 255, 0.4)';
          }}
          {...(internal ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
          {...props}
        />
      );
    },
```

- [ ] **Step 3: Ancho completo para el explorador**

En `src/styles/retro-modern.css`, justo después de la regla `.markdown-content > .markdown-breakout, .markdown-content > iframe, .markdown-content > pre { grid-column: wide; }`, agrega:
```css
/* Explorador de algoritmos de ML: menu + panel necesitan el ancho completo.
   .mlx-boot es el marcador mientras se descarga su chunk (sus estilos no
   pueden vivir en ml-explorer.css, que llega con ese mismo chunk). */
.markdown-content > .mlx,
.markdown-content > .mlx-boot {
  grid-column: full;
}

.markdown-content > .mlx-boot {
  padding: 32px;
  text-align: center;
  color: var(--rf-text-muted);
  border: 1px dashed rgba(85, 170, 255, 0.25);
  border-radius: 10px;
}
```

- [ ] **Step 4: El artículo**

`src/data/articles/algoritmos-ml-explorador.md`:
```markdown
---
title: "Algoritmos de Machine Learning: Explorador Interactivo"
date: "2026-10-03"
slug: "algoritmos-ml-explorador"
description: "Los 17 algoritmos del cheatsheet clásico de machine learning, explicados columna por columna —tipo, caso de uso, fórmula, supuestos, pros, contras y ejemplo real— con simuladores y Python que corre en tu navegador."
tags: ["Machine Learning", "Python", "Algoritmos", "OVA", "Ciencia de datos"]
---

> **En corto:** no existe «el mejor algoritmo». Cada uno funciona bien bajo ciertas condiciones y falla en otras. Este explorador recorre los 17 algoritmos del cheatsheet clásico de machine learning y responde lo mismo para cada uno: qué problema resuelve, cómo funciona, qué supone, cuándo brilla, cuándo no usarlo y un ejemplo real que puedes ejecutar.

Está escrito para estudiantes de Datos y Sistemas y para profesionales de cualquier ingeniería que necesiten decidir si un modelo sirve para su problema. No hace falta saber machine learning: cada término técnico tiene una ficha 💡, y la matemática está plegada en «Para profundizar».

## Cómo usar el explorador

- **Menú izquierdo:** un algoritmo por fila del cheatsheet. Los marcados «pronto» llegan en las próximas entregas.
- **Pestañas:** las 8 columnas del cheatsheet. Al cambiar de algoritmo la pestaña se mantiene: así puedes comparar, por ejemplo, los *Contras* de todos.
- **Fórmula / lógica:** un ejemplo con números, la fórmula y un simulador para tocar.
- **Ejemplo real:** un ejercicio breve de Python que corre en tu navegador y puedes editar. También está en un [notebook de Colab](https://colab.research.google.com/github/stivenson/stivenson.github.io/blob/main/notebooks/algoritmos-ml.ipynb).
- Cada combinación tiene su propio enlace: copia la URL para compartir, por ejemplo, «KNN › Contras».

## ¿Qué algoritmo necesito?

Responde de arriba abajo:

1. **¿Tus datos traen la respuesta que quieres predecir?** (el precio, «spam / no spam», «paga / no paga»)
   - **Sí → aprendizaje supervisado.** Sigue con la pregunta 2.
   - **No → aprendizaje no supervisado.** ¿Buscas grupos? K-Means, Hierarchical Clustering o DBSCAN *(próximamente)*. ¿Quieres resumir muchas columnas en pocas? PCA *(próximamente)*.
2. **¿Predices un número o una categoría?**
   - **Un número** (precio, consumo, tiempo): empieza por [Linear Regression](#/articles/algoritmos-ml-explorador?alg=linear-regression&tab=type).
   - **Una categoría** (sí/no, tipo A/B/C): empieza por [Logistic Regression](#/articles/algoritmos-ml-explorador?alg=logistic-regression&tab=type).
3. **¿Tienes que explicar cada decisión a otra persona?**
   - **Sí:** un [Decision Tree](#/articles/algoritmos-ml-explorador?alg=decision-tree&tab=type) poco profundo, o los modelos lineales de la pregunta 2.
   - **No, lo que importa es acertar:** Random Forest o Gradient Boosting *(próximamente)*.
4. **¿Pocos datos, y la idea de «se parece a…» es natural en tu problema?** Prueba [KNN](#/articles/algoritmos-ml-explorador?alg=knn&tab=type).
5. **¿Imágenes, texto, audio o series largas?** Redes neuronales: CNN, RNN o Transformer *(próximamente)*.

> **Regla práctica:** empieza por el modelo más simple que pueda funcionar y úsalo como línea base. Pasa a uno más complejo solo si mejora claramente con datos que el modelo no vio.

## El explorador

<ml-explorer></ml-explorer>

## Cómo seguir

- Ejecuta todos los ejercicios juntos en el [notebook de Colab](https://colab.research.google.com/github/stivenson/stivenson.github.io/blob/main/notebooks/algoritmos-ml.ipynb). No necesita GPU.
- Cambia los datos de un ejercicio por los de tu trabajo: todos usan solo numpy, scikit-learn y matplotlib.
- Antes de elegir un algoritmo para un proyecto real, repasa esta lista:

- ☐ ¿Separé datos de entrenamiento y de prueba?
- ☐ ¿Tengo una línea base simple con la cual comparar?
- ☐ ¿Revisé los supuestos del algoritmo (pestaña *Supuestos*)?
- ☐ ¿Sé qué error es más caro en mi problema: la falsa alarma o el caso que se escapa?
- ☐ ¿Puedo explicar la decisión del modelo si me lo piden?
```

- [ ] **Step 5: Registrar el artículo**

En `src/data/articles/index.ts`, agrega junto a los otros imports:
```ts
import algoritmosMlExplorador from './algoritmos-ml-explorador.md?raw';
```
y en el arreglo `articles`, como primer elemento (es el más reciente):
```ts
  processArticle(algoritmosMlExplorador),
```

- [ ] **Step 6: Verificar tipos y tests**

```bash
node node_modules/typescript/bin/tsc --noEmit -p .
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
```
Expected: tsc sin salida; todos los tests pasan.

- [ ] **Step 7: Revisar en el navegador**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js
```
Abre `http://localhost:5173/#/articles/algoritmos-ml-explorador` (con el skill `claude-in-chrome` si está disponible; si no, pide al usuario que lo revise) y comprueba:

1. El artículo aparece en `#/articles` como el más reciente.
2. El explorador ocupa el ancho completo: menú a la izquierda con 4 grupos y 17 entradas; solo Linear Regression está activa y las demás dicen «pronto».
3. Las 8 pestañas cambian el contenido y la URL (`?alg=linear-regression&tab=…`); el botón atrás del navegador regresa a la pestaña anterior; las flechas ← → del teclado mueven entre pestañas.
4. Los chips de resumen abren su pestaña.
5. Las fichas 💡 abren y cierran (clic fuera, botón «Entendido» y Escape).
6. Fórmula: KaTeX se ve bien; en la OVA se pueden arrastrar puntos (también con el dedo, en el emulador móvil), tocar el fondo añade puntos, «Añadir un outlier» inclina la recta y cambia el MSE.
7. Ejemplo real: «Salida esperada» visible. «▶ Ejecutar» muestra el progreso de descarga y luego «Tu salida» idéntica a la esperada, más la gráfica PNG. Cambia `n = 200` por `n = 20` y ejecuta: los números cambian. Escribe `while True: pass` y ejecuta: a los 15 s aparece «Detenido». «↺ Restaurar» vuelve al código original. Escribe `1/0`: aparece el traceback recortado (solo `File "<exec>"`).
8. Los enlaces de la guía (por ejemplo [Linear Regression]) navegan en la misma pestaña y llevan al explorador.
9. A 375 px de ancho: el menú pasa a ser un `<select>`, las pestañas se desplazan en horizontal, la OVA queda arriba de sus controles y no hay scroll horizontal de página.

Si algo falla, corrígelo antes del commit.

- [ ] **Step 8: Commit**

```bash
git add src/components/MarkdownRenderer.tsx src/styles/retro-modern.css src/data/articles/algoritmos-ml-explorador.md src/data/articles/index.ts
git commit -m "feat(article): publish the ML algorithms explorer article

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 17: Logistic Regression completo

**Files:**
- Create: `src/components/ml-explorer/algorithms/python/logistic-regression.py`
- Create: `src/components/ml-explorer/algorithms/python/logistic-regression.out.txt` (generado)
- Create: `src/components/ml-explorer/ovas/LogisticRegressionOva.tsx`
- Create: `src/components/ml-explorer/algorithms/logistic-regression.tsx`
- Modify: `src/components/ml-explorer/registry.ts`, `src/components/ml-explorer/registry.test.ts`, `scripts/build-ml-notebook.py`

- [ ] **Step 1: El ejercicio**

`src/components/ml-explorer/algorithms/python/logistic-regression.py`:
```python
# Detector de spam: probabilidad de que un correo sea spam según 3 señales
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix

rng = np.random.default_rng(7)
n = 400
es_spam = rng.random(n) < 0.4
gratis = np.where(es_spam, rng.poisson(3, n), rng.poisson(0.3, n))     # veces que dice "gratis"
enlaces = np.where(es_spam, rng.poisson(5, n), rng.poisson(1.5, n))    # número de enlaces
conocido = np.where(es_spam, rng.random(n) < 0.1, rng.random(n) < 0.7).astype(int)  # remitente conocido

X = np.column_stack([gratis, enlaces, conocido])
y = es_spam.astype(int)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)

modelo = LogisticRegression().fit(X_train, y_train)
pred = modelo.predict(X_test)

print("Pesos [gratis, enlaces, conocido]:", np.round(modelo.coef_[0], 2))
print(f"Intercepto b0: {modelo.intercept_[0]:.2f}")
print(f"Exactitud con correos nuevos: {accuracy_score(y_test, pred):.1%}")
print("Matriz de confusión (filas = real, columnas = predicho; 0 = normal, 1 = spam):")
print(confusion_matrix(y_test, pred))

correos = np.array([[0, 1, 1], [2, 4, 0], [5, 8, 0]])
for c, p in zip(correos, modelo.predict_proba(correos)[:, 1]):
    print(f"gratis={c[0]} enlaces={c[1]} conocido={c[2]} -> P(spam) = {p:.1%}")
```

- [ ] **Step 2: Generar y revisar la salida esperada**

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py --update
cat src/components/ml-explorer/algorithms/python/logistic-regression.out.txt
```
Expected (exacto):
```
Pesos [gratis, enlaces, conocido]: [ 1.84  0.99 -1.75]
Intercepto b0: -4.83
Exactitud con correos nuevos: 97.0%
Matriz de confusión (filas = real, columnas = predicho; 0 = normal, 1 = spam):
[[59  1]
 [ 2 38]]
gratis=0 enlaces=1 conocido=1 -> P(spam) = 0.4%
gratis=2 enlaces=4 conocido=0 -> P(spam) = 94.4%
gratis=5 enlaces=8 conocido=0 -> P(spam) = 100.0%
```
Historia que deben contar los números: «gratis» y los enlaces empujan hacia spam (pesos positivos) y el remitente conocido aleja del spam (peso negativo).

- [ ] **Step 3: La OVA**

`src/components/ml-explorer/ovas/LogisticRegressionOva.tsx`:
```tsx
import { useState } from 'react';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { fitLogistic1D, logit, sigmoid } from './ovaMath';
import { createPlot } from './plot';

const PLOT = createPlot(360, 260, 30, [0, 10], [-0.1, 1.1]);

// x = veces que el correo dice «gratis». Las clases se solapan entre 3 y 4.5:
// ningún umbral acierta todo, como en los datos reales.
const NORMAL = [0, 0.5, 1, 1, 1.5, 2, 2.5, 3, 4];
const SPAM = [3, 3.5, 4.5, 5, 5.5, 6, 7, 8, 9];
const XS = [...NORMAL, ...SPAM];
const YS = [...NORMAL.map(() => 0), ...SPAM.map(() => 1)];

const B0 = { min: -10, max: 4, step: 0.1 };
const B1 = { min: -1, max: 3, step: 0.05 };
const snap = (v: number, { min, max, step }: typeof B0) => Math.min(max, Math.max(min, Math.round(v / step) * step));

const EXAMPLE_X = 4;

export function LogisticRegressionOva() {
  const [b0, setB0] = useState(-4);
  const [b1, setB1] = useState(1);
  const [threshold, setThreshold] = useState(0.5);

  const prob = (x: number) => sigmoid(b0 + b1 * x);
  const predicted = (x: number) => (prob(x) >= threshold ? 1 : 0);
  const hits = XS.filter((x, i) => predicted(x) === YS[i]).length;
  const boundary = b1 !== 0 ? (logit(threshold) - b0) / b1 : null;

  const curve = Array.from({ length: 101 }, (_, i) => {
    const x = i / 10;
    return `${i === 0 ? 'M' : 'L'}${PLOT.sx(x).toFixed(1)},${PLOT.sy(prob(x)).toFixed(1)}`;
  }).join(' ');

  function bestFit() {
    const fit = fitLogistic1D(XS, YS);
    setB0(snap(fit.b0, B0));
    setB1(snap(fit.b1, B1));
    setThreshold(0.5);
  }

  const z = b0 + b1 * EXAMPLE_X;

  return (
    <OvaFrame
      title="De un puntaje a una probabilidad"
      hint="Mueve b₀ y b₁ para deformar la curva y el umbral para decidir desde qué probabilidad se marca spam."
      controls={
        <>
          <OvaSlider label="b₀ (desplaza)" value={b0} {...B0} onChange={setB0} format={(v) => v.toFixed(1)} />
          <OvaSlider label="b₁ (inclina)" value={b1} {...B1} onChange={setB1} format={(v) => v.toFixed(2)} />
          <OvaSlider
            label="Umbral"
            value={threshold}
            min={0.05}
            max={0.95}
            step={0.05}
            onChange={setThreshold}
            format={(v) => v.toFixed(2)}
          />
          <button type="button" onClick={bestFit}>
            Mejor ajuste (descenso de gradiente)
          </button>
        </>
      }
      readout={
        <>
          <span>
            Con x = {EXAMPLE_X}: z = {b0.toFixed(1)} + {b1.toFixed(2)}·{EXAMPLE_X} = <b>{z.toFixed(2)}</b> → P(spam) ={' '}
            <b>{(sigmoid(z) * 100).toFixed(1)} %</b>
          </span>
          <span>
            Aciertos: <b>{hits} de {XS.length}</b> correos
          </span>
          <span>
            Los círculos con borde rosa están mal clasificados. Ningún ajuste los acierta todos: entre 3 y 4.5 «gratis»
            hay correos de las dos clases.
          </span>
        </>
      }
    >
      <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} role="img" aria-label="Curva sigmoide sobre correos normales y spam">
        {[0, 0.5, 1].map((y) => (
          <g key={y}>
            <line x1={PLOT.sx(0)} x2={PLOT.sx(10)} y1={PLOT.sy(y)} y2={PLOT.sy(y)} stroke={OVA_COLORS.grid} />
            <text x={PLOT.sx(0) - 6} y={PLOT.sy(y) + 4} textAnchor="end" fontSize={10} fill={OVA_COLORS.axis}>
              {y}
            </text>
          </g>
        ))}
        <text x={PLOT.sx(10)} y={PLOT.height - 6} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
          veces que dice «gratis» →
        </text>
        <line
          x1={PLOT.sx(0)}
          x2={PLOT.sx(10)}
          y1={PLOT.sy(threshold)}
          y2={PLOT.sy(threshold)}
          stroke={OVA_COLORS.axis}
          strokeDasharray="5 4"
        />
        {boundary !== null && boundary >= 0 && boundary <= 10 && (
          <g>
            <line
              x1={PLOT.sx(boundary)}
              x2={PLOT.sx(boundary)}
              y1={PLOT.sy(-0.1)}
              y2={PLOT.sy(1.1)}
              stroke={OVA_COLORS.accent}
              strokeDasharray="5 4"
            />
            <text x={PLOT.sx(boundary) + 4} y={PLOT.sy(1.05)} fontSize={10} fill={OVA_COLORS.accent}>
              frontera
            </text>
          </g>
        )}
        <path d={curve} fill="none" stroke={OVA_COLORS.accent} strokeWidth={2.5} />
        {XS.map((x, i) => {
          const y = YS[i] + (i % 2 ? 0.04 : -0.04);
          const wrong = predicted(x) !== YS[i];
          return (
            <circle
              key={i}
              cx={PLOT.sx(x)}
              cy={PLOT.sy(y)}
              r={6}
              fill={YS[i] ? OVA_COLORS.class1 : OVA_COLORS.class0}
              stroke={wrong ? OVA_COLORS.risk : '#040320'}
              strokeWidth={wrong ? 3 : 1.5}
            />
          );
        })}
      </svg>
    </OvaFrame>
  );
}
```

- [ ] **Step 4: El contenido del algoritmo**

`src/components/ml-explorer/algorithms/logistic-regression.tsx`:
```tsx
import { G } from '../Gloss';
import { Tex } from '../Tex';
import { LogisticRegressionOva } from '../ovas/LogisticRegressionOva';
import type { AlgorithmModule } from '../types';
import code from './python/logistic-regression.py?raw';
import expectedOutput from './python/logistic-regression.out.txt?raw';

const logisticRegression: AlgorithmModule = {
  slug: 'logistic-regression',
  row: {
    type: 'Supervisado',
    bestUse: 'Clasificación binaria',
    formula: 'P = 1 / (1 + e^−(b₀ + b₁X + …))',
    assumptions: 'Linealidad del log-odds',
    pros: 'Probabilística, interpretable',
    cons: 'Débil con fronteras no lineales',
    whenNot: 'Datos muy no lineales',
    realWorld: 'Detección de spam',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>Supervisado:</b> aprende de correos que ya vienen marcados como «spam» o «normal» (la{' '}
            <G k="etiqueta">etiqueta</G>).
          </p>
          <p>
            A pesar del nombre, <b>no predice un número sino una clase</b>: sí/no, spam/normal, paga/no paga. Lo que
            entrega es la probabilidad de «sí».
          </p>
        </>
      ),
      deepDive: (
        <p>
          Es un modelo lineal generalizado: modela <Tex>{'P(y=1 \\mid x)'}</Tex> aplicando la función sigmoide a una
          combinación lineal de las features. Con más de dos clases se usa la versión multinomial (softmax).
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsala para <b>clasificación binaria</b> cuando necesitas una <b>probabilidad</b> y poder explicar la
            decisión.
          </p>
          <ul>
            <li>¿Este correo es spam?</li>
            <li>¿Este cliente cancelará el servicio?</li>
            <li>¿Este paciente tiene riesgo alto?</li>
          </ul>
          <p className="mlx-rule">
            Si necesitas saber qué tan seguro está el modelo, no solo «sí» o «no», empieza por aquí.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Cuando el modelo está bien especificado, sus probabilidades están calibradas: de los casos a los que asigna
          70 %, cerca de 7 de cada 10 son positivos. Entrena rápido incluso con millones de filas y miles de features
          dispersas, como las palabras de un texto.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> un correo dice «gratis» 4 veces. Con b₀ = −4 y b₁ = 1 se calcula primero un puntaje:
          </p>
          <Tex block>{'z = b_0 + b_1 x = -4 + 1 \\times 4 = 0'}</Tex>
          <p>Después, la sigmoide convierte cualquier puntaje en una probabilidad entre 0 y 1:</p>
          <Tex block>{'P = \\frac{1}{1 + e^{-z}} = \\frac{1}{1 + e^{0}} = 0.5'}</Tex>
          <p>
            Con z = 0 el modelo duda (50 %). Si el correo dijera «gratis» 7 veces, z = 3 y P ≈ 0.95. Cuando P supera el{' '}
            <G k="umbral">umbral</G> (0.5 por defecto), el correo se marca como spam.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>Los pesos se eligen minimizando la entropía cruzada (equivale a maximizar la verosimilitud):</p>
          <Tex block>{'\\min_b\\ -\\frac{1}{n}\\sum_i \\left[y_i \\log p_i + (1-y_i)\\log(1-p_i)\\right]'}</Tex>
          <p>
            No hay solución cerrada: se resuelve con descenso de gradiente o métodos de Newton (scikit-learn usa
            L-BFGS). El gradiente es simple: <Tex>{'\\sum_i (p_i - y_i)\\,x_i'}</Tex>. Es lo que hace el botón «Mejor
            ajuste» del simulador.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que el <G k="logOdds">log-odds</G> cambia en línea recta con cada feature.
          </p>
          <p>
            En palabras simples: cada «gratis» adicional multiplica las probabilidades a favor del spam por el mismo
            factor (con b₁ = 1, por e ≈ 2.7). Si en la realidad el efecto se dispara o se satura, el modelo lo
            representa mal.
          </p>
          <p>También supone observaciones independientes y features que no sean casi copias unas de otras.</p>
        </>
      ),
      deepDive: (
        <p>
          <Tex>{'e^{b_j}'}</Tex> es la razón de odds: subir <Tex>{'x_j'}</Tex> en una unidad multiplica los odds por{' '}
          <Tex>{'e^{b_j}'}</Tex>. Si las clases se separan perfectamente, los pesos crecen sin límite; por eso
          scikit-learn aplica regularización por defecto (C = 1).
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Probabilística:</b> no solo dice «spam», dice «94 % spam». Puedes elegir el umbral según lo que cueste
            cada error.
          </li>
          <li>
            <b>
              <G k="interpretable">Interpretable</G>:
            </b>{' '}
            cada peso dice si una señal empuja hacia «sí» o hacia «no», y cuánto.
          </li>
          <li>
            <b>Rápida y estable:</b> entrena en segundos y con pocas features es difícil que sobreajuste.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Su función de pérdida es convexa: siempre llega al mismo óptimo, sin importar el punto de partida. Es
          estándar en riesgo crediticio (scorecards) justamente porque se puede auditar.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>
              <G k="frontera">Frontera</G> recta:
            </b>{' '}
            separa las clases con una línea o un plano. Si los casos positivos forman islas o un anillo, no los puede
            encerrar.
          </li>
          <li>
            <b>Necesita features bien construidas:</b> las interacciones («gratis» y además remitente desconocido) hay
            que crearlas a mano.
          </li>
          <li>
            <b>Sensible a features correlacionadas:</b> los pesos cambian mucho entre entrenamientos y pierden su
            interpretación.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Se puede curvar la frontera con features polinómicas, a costa de interpretabilidad. Con clases muy
          desbalanceadas (1 fraude por cada 1 000 transacciones) hay que ajustar los pesos de clase o el umbral.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No la uses cuando las clases se separan con formas muy no lineales.</p>
          <p>
            Ejemplo: en una foto, «hay un gato» no depende de sumar pixeles con pesos fijos. Tampoco conviene si el
            patrón depende de interacciones que no sabes construir a mano.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Señal de alarma: un árbol o un Random Forest acierta claramente más con los mismos datos. Eso indica que la
          frontera no es lineal.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Detección de spam.</b> Los filtros de spam suman evidencia de muchas señales: palabras, enlaces,
            remitente. La regresión logística hace esa suma y además permite ajustar el umbral: es mejor dejar pasar un
            spam que perder un correo importante.
          </p>
          <p>
            El ejercicio crea 400 correos de juguete con tres señales: cuántas veces dice «gratis», cuántos enlaces
            trae y si el remitente es conocido. Mira los pesos (¿qué señal aleja del spam?) y la{' '}
            <G k="matrizConfusion">matriz de confusión</G>.
          </p>
        </>
      ),
      deepDive: (
        <p>
          En producción el texto se convierte en miles de features (bolsa de palabras o TF-IDF) con regularización L2,
          y el umbral se elige con la curva de precisión y exhaustividad, no con el 0.5 por defecto.
        </p>
      ),
    },
  },
  Ova: LogisticRegressionOva,
  python: { code, expectedOutput, colabAnchor: 'logistic-regression' },
  inYourField: [
    { area: 'Industrial', example: '¿saldrá defectuosa esta pieza según la temperatura y la presión del proceso?' },
    { area: 'Civil', example: 'probabilidad de deslizamiento de un talud según la lluvia acumulada y la pendiente.' },
    { area: 'Biomédica', example: 'riesgo de una enfermedad según edad, presión arterial y glucosa.' },
  ],
  alternatives: ['decision-tree', 'random-forest', 'svm'],
};

export default logisticRegression;
```

- [ ] **Step 5: Registrar el algoritmo**

En `registry.ts`, agrega en `LOADERS`:
```ts
  'logistic-regression': () => import('./algorithms/logistic-regression'),
```
En `registry.test.ts`:
```ts
    expect(AVAILABLE_SLUGS).toEqual(['linear-regression', 'logistic-regression']);
```
En `scripts/build-ml-notebook.py`, agrega a `ALGORITHMS`:
```python
    (
        "logistic-regression",
        "Logistic Regression (regresión logística)",
        "Detector de spam: probabilidad de que un correo sea spam según tres señales.",
    ),
```

- [ ] **Step 6: Verificar**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
```
Expected: tests pasan; tsc sin salida; `✓` para los dos ejercicios.

En el navegador (`#/articles/algoritmos-ml-explorador?alg=logistic-regression&tab=formula`): los sliders deforman la curva; «Mejor ajuste» deja 16 de 18 aciertos (b₀ ≈ −5.7, b₁ ≈ 1.70, frontera ≈ 3.4); mover el umbral desplaza la línea «frontera»; el ejercicio de Ejemplo real da la misma salida que la esperada.

- [ ] **Step 7: Commit**

```bash
git add src/components/ml-explorer/algorithms/python/logistic-regression.py src/components/ml-explorer/algorithms/python/logistic-regression.out.txt src/components/ml-explorer/ovas/LogisticRegressionOva.tsx src/components/ml-explorer/algorithms/logistic-regression.tsx src/components/ml-explorer/registry.ts src/components/ml-explorer/registry.test.ts scripts/build-ml-notebook.py
git commit -m "feat(ml-explorer): explain logistic regression with an OVA and an exercise

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 18: Decision Tree completo

**Files:**
- Create: `src/components/ml-explorer/algorithms/python/decision-tree.py`
- Create: `src/components/ml-explorer/algorithms/python/decision-tree.out.txt` (generado)
- Create: `src/components/ml-explorer/ovas/DecisionTreeOva.tsx`
- Create: `src/components/ml-explorer/algorithms/decision-tree.tsx`
- Modify: `src/components/ml-explorer/registry.ts`, `src/components/ml-explorer/registry.test.ts`, `scripts/build-ml-notebook.py`

- [ ] **Step 1: El ejercicio**

`src/components/ml-explorer/algorithms/python/decision-tree.py`:
```python
# ¿Pagará el préstamo? Un árbol que se lee como reglas "si... entonces..."
import numpy as np
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(3)
n = 500
ingreso = rng.uniform(1, 12, n).round(1)   # millones al mes
deuda = rng.uniform(0, 0.9, n).round(2)    # fracción del ingreso ya comprometida
atrasos = rng.poisson(0.8, n)              # pagos atrasados el último año
riesgo = 0.6 * deuda + 0.15 * atrasos - 0.04 * ingreso + rng.normal(0, 0.08, n)
impago = (riesgo > 0.25).astype(int)
# 12 % de etiquetas al azar: en la vida real hay casos que ninguna regla explica
ruido = rng.random(n) < 0.12
impago[ruido] = 1 - impago[ruido]

X = np.column_stack([ingreso, deuda, atrasos])
X_train, X_test, y_train, y_test = train_test_split(X, impago, test_size=0.3, random_state=0)

arbol = DecisionTreeClassifier(max_depth=3, random_state=0).fit(X_train, y_train)
print(export_text(arbol, feature_names=["ingreso", "deuda", "atrasos"], class_names=["paga", "impago"]))

print("Profundidad | exactitud entrenamiento | exactitud datos nuevos")
for prof in [1, 3, 5, 15]:
    a = DecisionTreeClassifier(max_depth=prof, random_state=0).fit(X_train, y_train)
    print(f"{prof:>11} | {a.score(X_train, y_train):>23.1%} | {a.score(X_test, y_test):>22.1%}")
```

- [ ] **Step 2: Generar y revisar la salida esperada**

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py --update
cat src/components/ml-explorer/algorithms/python/decision-tree.out.txt
```
Expected (exacto):
```
|--- deuda <= 0.38
|   |--- atrasos <= 2.50
|   |   |--- ingreso <= 2.50
|   |   |   |--- class: paga
|   |   |--- ingreso >  2.50
|   |   |   |--- class: paga
|   |--- atrasos >  2.50
|   |   |--- class: impago
|--- deuda >  0.38
|   |--- atrasos <= 1.50
|   |   |--- ingreso <= 4.95
|   |   |   |--- class: impago
|   |   |--- ingreso >  4.95
|   |   |   |--- class: paga
|   |--- atrasos >  1.50
|   |   |--- deuda <= 0.88
|   |   |   |--- class: impago
|   |   |--- deuda >  0.88
|   |   |   |--- class: paga

Profundidad | exactitud entrenamiento | exactitud datos nuevos
          1 |                   64.3% |                  62.0%
          3 |                   78.0% |                  73.3%
          5 |                   81.1% |                  69.3%
         15 |                   99.7% |                  70.0%
```
La historia: con profundidad 15 el árbol acierta 99.7 % en entrenamiento pero solo 70 % con datos nuevos (sobreajuste); profundidad 3 es el mejor equilibrio. Las pestañas Contras y Ejemplo real citan estas cifras.

- [ ] **Step 3: La OVA**

Con estos 28 puntos, la profundidad da (verificado con `buildTree`): 0 → 1 hoja, 53.6 %; 1 → 2 hojas, 85.7 %; 2 → 4, 85.7 %; 3 → 6, 92.9 %; 4 → 8, 96.4 %; 5 → 9 hojas, 100 %. A partir de 4 el árbol encierra los dos puntos de ruido en cajitas propias.

`src/components/ml-explorer/ovas/DecisionTreeOva.tsx`:
```tsx
import { useMemo, useState } from 'react';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { accuracy, buildTree, countLeaves, treeRegions, type LabeledPt, type TreeNode } from './ovaMath';
import { createPlot } from './plot';

const PLOT = createPlot(320, 320, 30, [0, 10], [0, 10]);
const AXIS_NAMES = { x: 'ingreso', y: 'deuda' } as const;

const PAGA: [number, number][] = [
  [2, 1], [4, 2], [6, 1.5], [8, 3], [9, 1], [7, 5], [8.5, 5.5], [5, 3.5],
  [3, 2.5], [6.5, 4.5], [9, 4], [1, 3], [4.5, 5], [7.5, 2],
  [8, 8], // ruido: paga aunque su deuda es alta
];
const IMPAGO: [number, number][] = [
  [1, 5], [2, 6.5], [1.5, 8], [3, 9], [5, 7.5], [6, 8.5], [8, 7], [9, 9],
  [2.5, 5.5], [4, 8], [7, 9.5], [0.8, 6],
  [3, 1.5], // ruido: no paga aunque su deuda es baja
];

const POINTS: LabeledPt[] = [
  ...PAGA.map(([x, y]) => ({ x, y, label: 0 as const })),
  ...IMPAGO.map(([x, y]) => ({ x, y, label: 1 as const })),
];

function TreeView({ node, prefix }: { node: TreeNode; prefix?: string }) {
  const tag = prefix ? <b>{prefix} </b> : null;
  if (node.kind === 'leaf') {
    return (
      <li>
        {tag}
        {node.label ? '🟠 impago' : '🔵 paga'} <small>({node.count[0] + node.count[1]} clientes)</small>
      </li>
    );
  }
  return (
    <li>
      {tag}¿{AXIS_NAMES[node.axis]} ≤ {node.threshold.toFixed(1)}?
      <ul className="mlx-tree">
        <TreeView node={node.left} prefix="sí →" />
        <TreeView node={node.right} prefix="no →" />
      </ul>
    </li>
  );
}

export function DecisionTreeOva() {
  const [depth, setDepth] = useState(1);
  const tree = useMemo(() => buildTree(POINTS, depth), [depth]);
  const regions = treeRegions(tree, { x0: 0, x1: 10, y0: 0, y1: 10 });
  const acc = accuracy(tree, POINTS);

  return (
    <OvaFrame
      title="Veinte preguntas para decidir"
      hint="Sube la profundidad: cada nivel agrega preguntas y parte el plano en más rectángulos."
      controls={<OvaSlider label="Profundidad máxima" value={depth} min={0} max={5} step={1} onChange={setDepth} />}
      readout={
        <>
          <span>
            <b>{countLeaves(tree)}</b> reglas (hojas) · acierta <b>{(acc * 100).toFixed(1)} %</b> de estos clientes
          </span>
          {depth >= 4 && (
            <span>
              ⚠️ Mira las cajitas alrededor de puntos sueltos: el árbol ya está memorizando el ruido (overfitting).
              Este porcentaje es sobre los mismos datos con los que aprendió.
            </span>
          )}
          <ul className="mlx-tree">
            <TreeView node={tree} />
          </ul>
        </>
      }
    >
      <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} role="img" aria-label="Plano dividido en rectángulos por el árbol">
        {regions.map((r, i) => (
          <rect
            key={i}
            x={PLOT.sx(r.x0)}
            y={PLOT.sy(r.y1)}
            width={PLOT.sx(r.x1) - PLOT.sx(r.x0)}
            height={PLOT.sy(r.y0) - PLOT.sy(r.y1)}
            fill={r.label ? OVA_COLORS.class1 : OVA_COLORS.class0}
            fillOpacity={0.14}
            stroke={OVA_COLORS.axis}
            strokeOpacity={0.5}
          />
        ))}
        <text x={PLOT.sx(10)} y={PLOT.height - 8} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
          ingreso →
        </text>
        <text x={8} y={PLOT.sy(10) - 10} fontSize={11} fill={OVA_COLORS.axis}>
          ↑ deuda
        </text>
        {POINTS.map((p, i) => (
          <circle
            key={i}
            cx={PLOT.sx(p.x)}
            cy={PLOT.sy(p.y)}
            r={6}
            fill={p.label ? OVA_COLORS.class1 : OVA_COLORS.class0}
            stroke="#040320"
            strokeWidth={1.5}
          />
        ))}
      </svg>
    </OvaFrame>
  );
}
```

- [ ] **Step 4: El contenido del algoritmo**

`src/components/ml-explorer/algorithms/decision-tree.tsx`:
```tsx
import { G } from '../Gloss';
import { Tex } from '../Tex';
import { DecisionTreeOva } from '../ovas/DecisionTreeOva';
import type { AlgorithmModule } from '../types';
import code from './python/decision-tree.py?raw';
import expectedOutput from './python/decision-tree.out.txt?raw';

const decisionTree: AlgorithmModule = {
  slug: 'decision-tree',
  row: {
    type: 'Supervisado',
    bestUse: 'Clasificación y regresión',
    formula: 'División binaria recursiva',
    assumptions: 'Ninguno',
    pros: 'Fácil de interpretar',
    cons: 'Sobreajuste, inestable',
    whenNot: 'Datos ruidosos o complejos',
    realWorld: 'Predicción de impago de préstamos',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>Supervisado:</b> aprende de clientes pasados de los que ya se sabe si pagaron o no.
          </p>
          <p>
            Sirve para <b>clasificar</b> (paga / no paga) y también para <b>predecir números</b> (cuántos días tardará
            en pagar). En el segundo caso cada hoja devuelve un promedio en vez de una clase.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Algoritmo CART: parte el espacio de features en rectángulos alineados con los ejes y asigna a cada uno la
          clase mayoritaria (o la media, en regresión). Es no paramétrico: su tamaño crece con los datos.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo cuando necesitas <b>reglas que una persona pueda leer y auditar</b>, tanto para clasificar como para
            predecir números.
          </p>
          <ul>
            <li>Aprobación de créditos con reglas explicables.</li>
            <li>Triaje: ¿a qué área se envía una solicitud?</li>
            <li>Diagnóstico de fallas: «si la vibración supera X y la temperatura supera Y…».</li>
          </ul>
          <p className="mlx-rule">Un árbol pequeño es el modelo más fácil de explicar a alguien que no sabe de ML.</p>
        </>
      ),
      deepDive: (
        <p>
          Acepta features numéricas y categóricas sin escalarlas. Además es la pieza básica de Random Forest y
          Gradient Boosting, los modelos que suelen ganar en datos tabulares.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            El árbol juega a las <b>veinte preguntas</b>: en cada paso elige la pregunta de sí o no que mejor separa
            las clases.
          </p>
          <p>
            <b>Ejemplo:</b> 10 clientes, 5 pagan y 5 no. Qué tan mezclado está el grupo se mide con la{' '}
            <G k="gini">impureza de Gini</G>:
          </p>
          <Tex block>{'G = 1 - p_{\\text{paga}}^2 - p_{\\text{impago}}^2 = 1 - 0.5^2 - 0.5^2 = 0.5'}</Tex>
          <p>
            La pregunta «¿deuda ≤ 4?» deja a un lado 4 que pagan y 1 que no (G = 1 − 0.8² − 0.2² = 0.32), y al otro 1
            que paga y 4 que no (también 0.32). La impureza baja de 0.5 a 0.32. El árbol prueba todas las preguntas
            posibles, se queda con la que más la baja y repite en cada lado: eso es la{' '}
            <b>división binaria recursiva</b>.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>En cada nodo se elige la feature j y el umbral t que minimizan la impureza ponderada de los hijos:</p>
          <Tex block>{'\\min_{j,\\,t}\\ \\frac{n_L}{n}\\,G(L) + \\frac{n_R}{n}\\,G(R)'}</Tex>
          <p>
            Es un algoritmo voraz: elige el mejor corte del momento sin mirar adelante, así que no garantiza el mejor
            árbol posible. Entrenar cuesta del orden de <Tex>{'O(p\\, n \\log n)'}</Tex> por nivel. En regresión se usa
            la varianza en lugar de Gini. <G k="hiperparametro">Hiperparámetros</G> clave: <code>max_depth</code>,{' '}
            <code>min_samples_leaf</code> y la poda por costo-complejidad (<code>ccp_alpha</code>).
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            <b>Ninguno fuerte.</b> No supone rectas ni distribuciones, y no necesita que las features estén en la
            misma escala: solo pregunta «¿x ≤ umbral?».
          </p>
          <p>Eso lo hace muy flexible, y también fácil de engañar: si lo dejas crecer, inventa una regla para cada dato raro.</p>
        </>
      ),
      deepDive: (
        <p>
          Implícitamente supone que la frontera se puede aproximar con cortes paralelos a los ejes. Una frontera
          diagonal (por ejemplo, x &gt; y) necesita muchos escalones para aproximarse.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Fácil de interpretar:</b> el modelo <em>es</em> la lista de reglas; se puede imprimir y discutir con el
            equipo.
          </li>
          <li>
            <b>Sin preparación de datos:</b> no hace falta escalar ni transformar las features.
          </li>
          <li>
            <b>Encuentra interacciones solo:</b> «deuda alta <em>y</em> ingreso bajo» aparece como dos preguntas
            seguidas.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Predice muy rápido (recorre unas pocas preguntas) y da una medida de importancia de cada feature: cuánta
          impureza quitó en total.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>
              <G k="overfitting">Sobreajuste</G>:
            </b>{' '}
            un árbol profundo memoriza. En el ejercicio, con profundidad 15 acierta 99.7 % en entrenamiento pero solo
            70 % con datos nuevos.
          </li>
          <li>
            <b>Inestable:</b> cambiar unos pocos datos puede cambiar la primera pregunta y, con ella, todo el árbol.
          </li>
          <li>
            <b>Fronteras en escalones:</b> le cuesta representar relaciones suaves o diagonales.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Esa inestabilidad (alta varianza) es justo lo que corrigen los <G k="ensamble">ensambles</G>: Random Forest
          promedia cientos de árboles entrenados con muestras distintas de los datos.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">
            No lo uses solo cuando los datos son ruidosos o el patrón es complejo y lo que importa es acertar.
          </p>
          <p>
            Ahí un árbol solo, o sobreajusta, o queda tan podado que no capta el patrón. Úsalo para explicar y deja la
            predicción a un ensamble.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Regla práctica: si un árbol de profundidad 3 a 5 no da la precisión que necesitas, no lo hagas más
          profundo; pasa a Random Forest o Gradient Boosting.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Predicción de impago de préstamos.</b> Los bancos deciden rápido y, a menudo por regulación, tienen que
            explicar por qué rechazaron una solicitud. Un árbol entrega esa explicación como reglas.
          </p>
          <p>
            El ejercicio crea 500 clientes de juguete con ingreso, deuda y atrasos, y un 12 % de casos que ninguna
            regla explica (<G k="ruido">ruido</G>). Lee las reglas del árbol y la tabla final: ¿qué pasa con la
            exactitud en datos nuevos cuando el árbol crece?
          </p>
        </>
      ),
      deepDive: (
        <p>
          En producción se limita la profundidad o el número mínimo de clientes por hoja, se valida con validación
          cruzada y se revisan las reglas con expertos del negocio: a veces el árbol encuentra un atajo que no es
          legal usar, como una variable que delata el barrio o el género.
        </p>
      ),
    },
  },
  Ova: DecisionTreeOva,
  python: { code, expectedOutput, colabAnchor: 'decision-tree' },
  inYourField: [
    { area: 'Mecánica', example: 'reglas de falla inminente a partir de vibración, temperatura y horas de uso.' },
    { area: 'Ambiental', example: 'clasificar la calidad del agua según pH, turbidez y oxígeno disuelto.' },
    { area: 'Industrial', example: 'decidir si un lote pasa control de calidad según sus mediciones.' },
  ],
  alternatives: ['random-forest', 'gradient-boosting', 'logistic-regression'],
};

export default decisionTree;
```

- [ ] **Step 5: Registrar el algoritmo**

En `registry.ts`, agrega en `LOADERS`:
```ts
  'decision-tree': () => import('./algorithms/decision-tree'),
```
En `registry.test.ts`:
```ts
    expect(AVAILABLE_SLUGS).toEqual(['linear-regression', 'logistic-regression', 'decision-tree']);
```
En `scripts/build-ml-notebook.py`, agrega a `ALGORITHMS`:
```python
    (
        "decision-tree",
        "Decision Tree (árbol de decisión)",
        "¿Pagará el préstamo? Un árbol que se lee como reglas, y qué le pasa cuando crece demasiado.",
    ),
```

- [ ] **Step 6: Verificar**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
```
Expected: tests pasan; tsc sin salida; `✓` para los tres ejercicios.

En el navegador (`?alg=decision-tree&tab=formula`): con el slider de 0 a 5 las hojas y los aciertos coinciden con la tabla del Step 3; desde 4 aparece el aviso de sobreajuste; el árbol de texto muestra «sí →» y «no →».

- [ ] **Step 7: Commit**

```bash
git add src/components/ml-explorer/algorithms/python/decision-tree.py src/components/ml-explorer/algorithms/python/decision-tree.out.txt src/components/ml-explorer/ovas/DecisionTreeOva.tsx src/components/ml-explorer/algorithms/decision-tree.tsx src/components/ml-explorer/registry.ts src/components/ml-explorer/registry.test.ts scripts/build-ml-notebook.py
git commit -m "feat(ml-explorer): explain decision trees with an OVA and an exercise

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 19: KNN completo

**Files:**
- Create: `src/components/ml-explorer/algorithms/python/knn.py`
- Create: `src/components/ml-explorer/algorithms/python/knn.out.txt` (generado)
- Create: `src/components/ml-explorer/ovas/KnnOva.tsx`
- Create: `src/components/ml-explorer/algorithms/knn.tsx`
- Modify: `src/components/ml-explorer/registry.ts`, `src/components/ml-explorer/registry.test.ts`, `scripts/build-ml-notebook.py`

- [ ] **Step 1: El ejercicio**

`src/components/ml-explorer/algorithms/python/knn.py`:
```python
# Recomendador: ¿qué película ver? Lo que les gustó a los usuarios más parecidos a Ana
import numpy as np
from sklearn.neighbors import NearestNeighbors

peliculas = ["Toy Story", "Alien", "Titanic", "Matrix", "Coco", "Interestelar"]
# Calificaciones de 1 a 5 (0 = no la ha visto)
usuarios = {
    "Ana":  [5, 0, 4, 0, 5, 0],
    "Beto": [5, 1, 4, 2, 5, 2],
    "Caro": [1, 5, 1, 5, 1, 5],
    "Dani": [4, 1, 5, 1, 4, 4],
    "Eva":  [2, 5, 1, 5, 2, 4],
    "Fer":  [5, 2, 5, 1, 4, 5],
}
nombres = list(usuarios)
R = np.array(list(usuarios.values()), dtype=float)
vistas = R[0] > 0  # comparamos solo con las películas que Ana ya calificó

knn = NearestNeighbors(n_neighbors=3, metric="euclidean").fit(R[1:][:, vistas])
dist, idx = knn.kneighbors(R[0:1, vistas])
vecinos = idx[0] + 1  # +1 porque Ana (fila 0) quedó fuera del ajuste

for i, d in zip(vecinos, dist[0]):
    print(f"Vecino: {nombres[i]:<5} distancia = {d:.2f}")

puntaje = R[vecinos].mean(axis=0)
print("\nRecomendaciones para Ana (promedio de sus 3 vecinos):")
for j in np.argsort(-puntaje):
    if not vistas[j]:
        print(f"  {peliculas[j]:<13} {puntaje[j]:.1f} / 5")
```

- [ ] **Step 2: Generar y revisar la salida esperada**

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py --update
cat src/components/ml-explorer/algorithms/python/knn.out.txt
```
Expected (exacto):
```
Vecino: Beto  distancia = 0.00
Vecino: Fer   distancia = 1.41
Vecino: Dani  distancia = 1.73

Recomendaciones para Ana (promedio de sus 3 vecinos):
  Interestelar  3.7 / 5
  Matrix        1.3 / 5
  Alien         1.3 / 5
```
Beto queda a distancia 0 porque calificó igual que Ana todas las películas que ella vio. Se usa distancia euclidiana a propósito: con la distancia coseno, Caro (que odia lo que a Ana le gusta) salía «parecida», porque coseno solo mira la proporción entre calificaciones y no su nivel.

- [ ] **Step 3: La OVA**

Con el punto de consulta en su posición inicial (6.4, 7) los votos son (verificado): k = 1 → 1 contra 0 a favor de «no le gustó» (el vecino más cercano es un punto de ruido); k = 3 → 2 contra 1 a favor de «le gustó»; k = 5 → 4 contra 1; k = 7 → 6 contra 1.

`src/components/ml-explorer/ovas/KnnOva.tsx`:
```tsx
import { useState, type KeyboardEvent } from 'react';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { knnVote, type LabeledPt, type Pt } from './ovaMath';
import { createPlot } from './plot';
import { useSvgDrag } from './useSvgDrag';

const PLOT = createPlot(320, 320, 30, [0, 10], [0, 10]);
const UNIT = PLOT.sx(1) - PLOT.sx(0);

const NO_LE_GUSTO: [number, number][] = [
  [1, 2], [2, 1], [1.5, 3.5], [3, 2.5], [2.5, 4.5], [4, 1.5], [3.5, 3.5],
  [0.8, 5], [5, 3], [4.5, 5.2], [6, 1],
  [6.5, 7.2], // ruido: rodeado de personas a las que sí les gustó
];
const LE_GUSTO: [number, number][] = [
  [6, 7], [7, 8], [8, 6.5], [7.5, 9], [9, 8], [5.5, 8.5], [8.5, 5], [6.5, 6], [9, 9.2], [4, 7.5], [3, 6.5],
];

const POINTS: LabeledPt[] = [
  ...NO_LE_GUSTO.map(([x, y]) => ({ x, y, label: 0 as const })),
  ...LE_GUSTO.map(([x, y]) => ({ x, y, label: 1 as const })),
];

const START: Pt = { x: 6.4, y: 7 };
const clamp = (v: number) => Math.min(10, Math.max(0, v));
const LABELS = ['🔵 no le gustó', '🟠 le gustó'] as const;

export function KnnOva() {
  const [query, setQuery] = useState<Pt>(START);
  const [k, setK] = useState(1);
  const result = knnVote(POINTS, query, k);

  const { begin, svgProps } = useSvgDrag<'query'>((_, p) => setQuery({ x: clamp(PLOT.ix(p.x)), y: clamp(PLOT.iy(p.y)) }));

  function onKeyDown(e: KeyboardEvent<SVGRectElement>) {
    const step = 0.25;
    const moves: Record<string, Pt> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: step },
      ArrowDown: { x: 0, y: -step },
    };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    setQuery((q) => ({ x: clamp(q.x + m.x), y: clamp(q.y + m.y) }));
  }

  return (
    <OvaFrame
      title="Dime con quién andas…"
      hint="Arrastra la persona nueva (el rombo) o muévela con las flechas del teclado, y cambia k."
      controls={
        <>
          <OvaSlider label="k (vecinos que votan)" value={k} min={1} max={15} step={2} onChange={setK} />
          <button
            type="button"
            onClick={() => {
              setQuery(START);
              setK(1);
            }}
          >
            Restablecer
          </button>
        </>
      }
      readout={
        <>
          <span>
            Votos: {LABELS[0]} <b>{result.votes[0]}</b> · {LABELS[1]} <b>{result.votes[1]}</b>
          </span>
          <span>
            Predicción: <b>{LABELS[result.winner]}</b>
          </span>
          <span>
            Con k = 1 decide un solo vecino, y en la posición inicial ese vecino es un dato raro. Sube k a 3 o 5 y el
            voto se vuelve estable.
          </span>
        </>
      }
    >
      <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} {...svgProps} role="img" aria-label="Puntos de dos clases y la persona nueva con sus k vecinos">
        <text x={PLOT.sx(10)} y={PLOT.height - 8} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
          gusto por la acción →
        </text>
        <text x={8} y={PLOT.sy(10) - 10} fontSize={11} fill={OVA_COLORS.axis}>
          ↑ gusto por la ciencia ficción
        </text>
        <circle
          cx={PLOT.sx(query.x)}
          cy={PLOT.sy(query.y)}
          r={result.radius * UNIT}
          fill="none"
          stroke={OVA_COLORS.axis}
          strokeDasharray="4 4"
          pointerEvents="none"
        />
        {result.neighbors.map((i) => (
          <line
            key={`n${i}`}
            x1={PLOT.sx(query.x)}
            y1={PLOT.sy(query.y)}
            x2={PLOT.sx(POINTS[i].x)}
            y2={PLOT.sy(POINTS[i].y)}
            stroke={POINTS[i].label ? OVA_COLORS.class1 : OVA_COLORS.class0}
            strokeWidth={1.5}
            pointerEvents="none"
          />
        ))}
        {POINTS.map((p, i) => (
          <circle
            key={i}
            cx={PLOT.sx(p.x)}
            cy={PLOT.sy(p.y)}
            r={6}
            fill={p.label ? OVA_COLORS.class1 : OVA_COLORS.class0}
            stroke={result.neighbors.includes(i) ? '#ffffff' : '#040320'}
            strokeWidth={result.neighbors.includes(i) ? 2 : 1.5}
          />
        ))}
        <rect
          className="is-draggable"
          x={PLOT.sx(query.x) - 9}
          y={PLOT.sy(query.y) - 9}
          width={18}
          height={18}
          transform={`rotate(45 ${PLOT.sx(query.x)} ${PLOT.sy(query.y)})`}
          fill={result.winner ? OVA_COLORS.class1 : OVA_COLORS.class0}
          stroke="#ffffff"
          strokeWidth={2}
          tabIndex={0}
          aria-label={`Persona nueva: acción ${query.x.toFixed(1)}, ciencia ficción ${query.y.toFixed(1)}. Muévela con las flechas.`}
          onPointerDown={begin('query')}
          onKeyDown={onKeyDown}
        />
      </svg>
    </OvaFrame>
  );
}
```

- [ ] **Step 4: El contenido del algoritmo**

`src/components/ml-explorer/algorithms/knn.tsx`:
```tsx
import { G } from '../Gloss';
import { Tex } from '../Tex';
import { KnnOva } from '../ovas/KnnOva';
import type { AlgorithmModule } from '../types';
import code from './python/knn.py?raw';
import expectedOutput from './python/knn.out.txt?raw';

const knn: AlgorithmModule = {
  slug: 'knn',
  row: {
    type: 'Supervisado',
    bestUse: 'Clasificación con pocos ejemplos',
    formula: 'Voto mayoritario según distancia',
    assumptions: 'Features en la misma escala',
    pros: 'Simple, sin fase de entrenamiento',
    cons: 'Lento, sensible al ruido',
    whenNot: 'Datos ruidosos de alta dimensión',
    realWorld: 'Sistemas de recomendación',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>Supervisado:</b> necesita ejemplos con respuesta (a quién le gustó qué).
          </p>
          <p>
            Es el algoritmo más «perezoso»: <b>no aprende nada por adelantado</b>. Guarda todos los ejemplos y, cuando
            llega un caso nuevo, busca los k más parecidos y los pone a votar.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Es un método no paramétrico basado en instancias (<i>lazy learning</i>). Sirve para clasificación (voto) y
          para regresión (promedio de los vecinos).
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo para <b>clasificar con pocos ejemplos</b> o cuando la idea de «parecido» es natural en el problema.
          </p>
          <ul>
            <li>Recomendaciones: «a usuarios parecidos a ti les gustó…».</li>
            <li>Clasificar una muestra nueva comparándola con un catálogo de muestras conocidas.</li>
            <li>Rellenar datos faltantes con los valores de los registros más parecidos.</li>
          </ul>
          <p className="mlx-rule">
            Si puedes describir el problema como «se parece a estos casos», KNN es un buen primer intento.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Va bien con pocas features (menos de unas 20) y miles de datos. Con millones de datos se usan índices
          espaciales (árboles KD, ball trees) o búsqueda aproximada de vecinos (FAISS, HNSW).
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> llega una persona nueva. Medimos su <G k="distancia">distancia</G> a cada persona
            conocida; por ejemplo, con dos gustos de 0 a 10, entre (6, 7) y (7, 8):
          </p>
          <Tex block>{'d = \\sqrt{(6-7)^2 + (7-8)^2} = \\sqrt{2} \\approx 1.41'}</Tex>
          <p>
            Con <b>k = 5</b> se toman las 5 personas más cercanas. Si a 4 les gustó la película y a 1 no, la
            predicción es «le gustará»: 4 votos contra 1.
          </p>
          <p>
            Prueba el simulador con k = 1: un solo vecino raro decide todo. Con k más grande el voto se vuelve
            estable.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>Predicción de clase:</p>
          <Tex block>{'\\hat{y} = \\arg\\max_c \\sum_{i \\in N_k(x)} \\mathbb{1}[y_i = c]'}</Tex>
          <p>
            Variantes: ponderar cada voto por <Tex>{'1/d'}</Tex>, o usar distancia Manhattan o coseno. Entrenar es
            solo guardar los datos, pero cada predicción cuesta <Tex>{'O(n\\,p)'}</Tex> con búsqueda exhaustiva. k es
            el <G k="hiperparametro">hiperparámetro</G> clave: con k pequeño el modelo es nervioso (mucha varianza);
            con k grande, rígido (mucho sesgo). Se elige con validación cruzada y suele ser impar para evitar empates.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que <b>las features están en escalas comparables</b>.
          </p>
          <p>
            Ejemplo: si comparas personas por edad (20 a 60) y por salario (1 000 000 a 10 000 000), la diferencia de
            salario domina la distancia y la edad no cuenta. Por eso casi siempre se aplica{' '}
            <G k="escalado">escalado</G> antes.
          </p>
          <p>También supone que «estar cerca» significa «parecerse» en lo que importa.</p>
        </>
      ),
      deepDive: (
        <p>
          Escalados típicos: estandarización (media 0, desviación 1) o min-max a [0, 1]. Las features irrelevantes
          también estorban: suman distancia sin aportar información, así que conviene quitarlas.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Simple:</b> se explica con un dibujo y se programa en pocas líneas.
          </li>
          <li>
            <b>Sin fase de entrenamiento:</b> agregar un ejemplo es solo guardarlo; el modelo queda actualizado al
            instante.
          </li>
          <li>
            <b>Fronteras flexibles:</b> se adapta a formas irregulares sin suponer rectas.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Con suficientes datos, el error de 1-NN es como mucho el doble del mínimo error posible (Cover y Hart,
          1967). Y su explicación es directa: «se predijo esto porque se parece a estos casos».
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Lento al predecir:</b> compara el caso nuevo con todos los ejemplos guardados.
          </li>
          <li>
            <b>Sensible al <G k="ruido">ruido</G>:</b> con k pequeño, un ejemplo mal etiquetado cambia la respuesta.
            Pruébalo en el simulador con k = 1.
          </li>
          <li>
            <b>Sufre con muchas features:</b> en <G k="altaDimension">alta dimensionalidad</G> todos los puntos
            quedan casi igual de lejos.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          La «maldición de la dimensionalidad»: a medida que crecen las features, la distancia al vecino más cercano
          y al más lejano se vuelven casi iguales, y «el más parecido» deja de significar algo. Reducir dimensiones con
          PCA antes de KNN suele ayudar.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses con datos ruidosos de muchas dimensiones.</p>
          <p>
            Ejemplo: clasificar textos usando miles de palabras como features. Las distancias pierden sentido y,
            además, cada predicción es lenta.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Si necesitas respuestas en milisegundos sobre millones de registros, o si las features tienen escalas y
          tipos muy distintos, un modelo que aprenda un resumen (logístico, árboles) es mejor opción.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Sistemas de recomendación.</b> La idea «a usuarios parecidos les gustan cosas parecidas» se llama
            filtrado colaborativo, y fue la base de los primeros recomendadores de tiendas en línea y plataformas de
            video.
          </p>
          <p>
            El ejercicio tiene 6 usuarios y 6 películas. Busca los 3 usuarios más parecidos a Ana, según las películas
            que ella ya calificó, y le recomienda lo que a ellos les gustó.
          </p>
        </>
      ),
      deepDive: (
        <p>
          En producción hay millones de usuarios y productos: se usan representaciones aprendidas (embeddings) y
          búsqueda aproximada de vecinos. Otro reto es el «arranque en frío»: un usuario nuevo no tiene calificaciones
          con las que compararse.
        </p>
      ),
    },
  },
  Ova: KnnOva,
  python: { code, expectedOutput, colabAnchor: 'knn' },
  inYourField: [
    { area: 'Química', example: 'estimar una propiedad de una mezcla nueva a partir de las mezclas más parecidas ya medidas.' },
    { area: 'Telecomunicaciones', example: 'ubicar un celular en interiores comparando las señales wifi que recibe con un mapa de mediciones.' },
    { area: 'Agrícola', example: 'recomendar un cultivo según el suelo y el clima de las fincas más parecidas.' },
  ],
  alternatives: ['random-forest', 'svm', 'pca'],
};

export default knn;
```

- [ ] **Step 5: Registrar el algoritmo**

En `registry.ts`, agrega en `LOADERS`:
```ts
  knn: () => import('./algorithms/knn'),
```
En `registry.test.ts`:
```ts
    expect(AVAILABLE_SLUGS).toEqual(['linear-regression', 'logistic-regression', 'decision-tree', 'knn']);
```
En `scripts/build-ml-notebook.py`, agrega a `ALGORITHMS`:
```python
    (
        "knn",
        "KNN (k vecinos más cercanos)",
        "Recomendador: qué película ver según lo que les gustó a los usuarios más parecidos.",
    ),
```

- [ ] **Step 6: Verificar**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
```
Expected: tests pasan; tsc sin salida; `✓` para los cuatro ejercicios.

En el navegador (`?alg=knn&tab=formula`): los votos con k = 1, 3, 5 y 7 coinciden con el Step 3; el rombo se arrastra con el mouse y con el dedo, y con Tab + flechas; el círculo punteado encierra justo a los k vecinos.

- [ ] **Step 7: Commit**

```bash
git add src/components/ml-explorer/algorithms/python/knn.py src/components/ml-explorer/algorithms/python/knn.out.txt src/components/ml-explorer/ovas/KnnOva.tsx src/components/ml-explorer/algorithms/knn.tsx src/components/ml-explorer/registry.ts src/components/ml-explorer/registry.test.ts scripts/build-ml-notebook.py
git commit -m "feat(ml-explorer): explain KNN with an OVA and an exercise

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 20: Notebook, build y deploy

**Files:**
- Create: `../notebooks/algoritmos-ml.ipynb` (generado)
- Build outputs en la raíz del repo (`../index.html`, `../assets/*`)

- [ ] **Step 1: Generar el notebook**

```bash
python3 scripts/build-ml-notebook.py
```
Expected: `Escrito notebooks/algoritmos-ml.ipynb con 4 ejercicios`.

Ejecútalo de punta a punta con el Python de verificación:
```bash
~/.cache/mlx-venv/bin/pip install -q nbclient ipykernel
~/.cache/mlx-venv/bin/python -m ipykernel install --user --name mlx-venv
~/.cache/mlx-venv/bin/python -c "import nbformat, nbclient; nb = nbformat.read('../notebooks/algoritmos-ml.ipynb', 4); nbclient.NotebookClient(nb, kernel_name='mlx-venv', timeout=120).execute(); print('notebook OK')"
```
Expected: `notebook OK` (el archivo en disco no se modifica: se ejecuta una copia en memoria).

- [ ] **Step 2: Verificación completa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
```
Expected: todos los tests pasan; `✓` en los 4 ejercicios.

- [ ] **Step 3: Build**

Usa el skill `/portfolio-build` (tsc + vite build + actualización de hashes, con el arreglo de NTFS). Expected: build exitoso; entre los assets nuevos aparecen chunks separados `linear-regression-*.js`, `logistic-regression-*.js`, `decision-tree-*.js`, `knn-*.js`, `MLExplorer-*.js` y `pyodideWorker-*.js`.

- [ ] **Step 4: Revisión final en el navegador (build de producción)**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js preview
```
En `#/articles/algoritmos-ml-explorador`, con DevTools → Network:
1. Al abrir el artículo **no** se descarga ningún chunk de algoritmo salvo el primero (`linear-regression-*.js`).
2. Al pasar el mouse por «KNN» se descarga `knn-*.js`; al hacer clic no se vuelve a descargar.
3. Pyodide (`pyodide.mjs`, `*.whl`) solo se descarga al primer «▶ Ejecutar», y el worker es `pyodideWorker-*.js`.
4. Con Network en «Offline», elegir un algoritmo no visitado muestra «No se pudo cargar · Reintentar»; volviendo a «Online», «Reintentar» lo carga.
5. Repite en móvil a 375 px los puntos del Step 7 de la Task 16.
6. Ejecuta los 4 ejercicios en el navegador: cada «Tu salida» coincide con su «Salida esperada».

- [ ] **Step 5: Commit del notebook**

```bash
git add ../notebooks/algoritmos-ml.ipynb
git commit -m "feat(notebook): add the ML explorer's exercises for Colab

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 6: Deploy**

Usa el skill `/portfolio-deploy`. Pide confirmación al usuario antes del commit y push, como indica el skill. Sube solo `index.html`, los assets nuevos y los cambios de esta fase; no subas los cambios ajenos que ya estaban sin commit en el árbol.

Tras el push, comprueba en `https://stivenson.github.io/#/articles/algoritmos-ml-explorador` que el explorador carga y que «Abrir en Colab» abre el notebook en la sección del algoritmo.
