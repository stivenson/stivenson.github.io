# Explorador de algoritmos de ML — Fase 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar la fase 3 del explorador de algoritmos de ML: K-Means, Hierarchical Clustering y DBSCAN (grupo «No supervisado») y PCA (grupo «Reducción de dimensionalidad»), cada uno con sus 8 pestañas (essential + deepDive), una OVA (la de K-Means, animada), el ejercicio de Python (idéntico en CPython y en Pyodide), 3 ejemplos «En tu área», y el artículo, los notebooks de Colab, el build y el deploy al día.

**Architecture:** Se sigue la arquitectura que dejó la fase 2 en el código: un módulo `algorithms/<slug>.tsx` por algoritmo, cargado con `import()` desde `registry.ts`; los ejercicios son `.py` + `.out.txt` que leen el explorador (`?raw`), el generador de notebooks y los dos verificadores; la matemática de las OVAs vive en `ovas/ovaMath.ts` (pura, determinista, con tests) y sus datos en `ovas/datasets.ts`, con las cifras citadas fijadas en `ovas/datasets.test.ts`. K-Means sortea sus centroides iniciales con `mulberry32` (semilla fija) y su animación usa un hook nuevo, `ovas/useMotion.ts`, que respeta `prefers-reduced-motion` y pausa fuera de pantalla con `IntersectionObserver`. El menú ya tiene los grupos «No supervisado» y «Reducción de dimensionalidad» (`types.ts`, `TypeFigure.tsx`): no hay que tocarlos.

**Tech Stack:** React 19 + TypeScript + Vite 7, KaTeX, Vitest 3 (+ jsdom en los `.dom.test.tsx`), Pyodide 0.27.7 (numpy 2.0.2, scikit-learn 1.6.1, scipy 1.14.1, matplotlib 3.8.4), Python de verificación en `~/.cache/mlx-venv`.

**Spec:** `docs/superpowers/specs/2026-10-03-ml-algoritmos-explorador-design.md` (sección «Fase 3: no supervisados y reducción»). **Plan de referencia (formato):** `docs/superpowers/plans/2026-10-04-ml-explorador-fase-2.md`.

> **Todo el código de este plan ya se ejecutó** en una copia del repo (`v3`, sacada con `git archive` de `b48cb78`): con él pasan los 40 archivos de test (492 tests; antes de la fase había 35 archivos y 388 tests), `tsc`, `vite build` (con salida a la carpeta de la copia, no a la raíz del repo real) y los dos verificadores de ejercicios (CPython y Pyodide real), y el notebook completo corre de punta a punta. Las cifras de los textos salen de esas ejecuciones; no las cambies a mano.

---

## Convenciones para quien ejecute el plan

- Todas las rutas relativas son desde `portfolio-spa/` salvo que digan `../` o `docs/`.
- **NTFS:** el repo vive en una partición NTFS sin bit de ejecución. Nunca uses `npx` ni `node_modules/.bin`. Prepara esbuild una vez por sesión:
  ```bash
  test -f /tmp/esbuild-bin || (cp node_modules/@esbuild/linux-x64/bin/esbuild /tmp/esbuild-bin && chmod +x /tmp/esbuild-bin)
  ```
  y ejecuta las herramientas así:
  - Tests: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run <archivo>`
  - Tipos: `node node_modules/typescript/bin/tsc --noEmit -p .`
  - Dev: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js`
- **Python de verificación:** `~/.cache/mlx-venv/bin/python` (mismas versiones que Pyodide 0.27.7). Verificadores:
  - `~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py` (CPython; con `--update` regenera los `.out.txt`; los de las fases 1 y 2 salen idénticos)
  - `node scripts/check-ml-exercises-pyodide.mjs` (Pyodide real; córrelo **después** del de CPython: no tiene timeout).
- **Git:** el árbol de trabajo tiene cambios ajenos sin commit (`extract_data.py`, `.claude/settings.local.json`, `calculo_diferencial/…`, etc.). **Haz `git add` solo de los archivos de cada task**, nunca `git add -A` ni `git add .`. Cada commit termina con la línea `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Redacción:** sigue `docs/redaccion/guia-facil-comprension.md` (conclusión primero, ejemplo con números antes de la fórmula, analogías de 1-2 frases o ninguna, jerga en el glosario 💡 con `<G k="…">`). Los textos de este plan ya la siguen y pasan los tests de redacción: cópialos tal cual.

## Reglas heredadas de las fases 1 y 2 (de obligado cumplimiento)

Salen de los errores que hubo que corregir en las fases 1 y 2 (enmiendas de revisión). Al revisar cada task, compruébalas una por una:

1. **Ninguna cifra sin test.** Toda cifra de un texto o de una OVA está fijada: la salida de Python en `algorithms/python/outputs.test.ts`; las de las OVAs y las de los ejemplos de la pestaña Fórmula en `ovas/datasets.test.ts` o en el `.dom.test.tsx` de la OVA. Si cambias un dato, el test te dice qué texto quedó viejo. (Ej.: «cada patrón queda unido por debajo de 0.07» y no «de 0.06», porque la altura real es 0.064 y la salida la imprime redondeada a 0.06.)
2. **Matemática de OVA determinista y contrastada.** Nada de `Math.random()`: K-Means sortea con `mulberry32`. Cada función nueva de `ovaMath.ts` se comparó con scikit-learn 1.6.1 / scipy 1.14.1 (ver «Cifras clave»). Si cambias un dato de DBSCAN, revisa que ninguna distancia entre puntos caiga justo en un valor de ε del slider (múltiplo de 0.1): con un empate exacto, `<=` en coma flotante puede dar distinto que scikit-learn (pasó con un par a 0.9000000000000006; se movió un punto 0.01).
3. **Matices de scikit-learn y nada de garantías absolutas.** Ej.: `KMeans` usa k-means++ por defecto, pero desde la 1.4 `n_init="auto"` hace **un solo** arranque con k-means++ (el ejercicio fija `n_init=10`); `PCA` con `svd_solver="auto"` calcula la matriz de covarianza cuando hay muchas más filas que columnas (`covariance_eigh` en los dígitos), así que no se dice «nunca calcula Σ»; K-Medoids no está en scikit-learn (está en scikit-learn-extra) y su centro es el medoide, no la mediana.
4. **No supervisado se explica de verdad.** La pestaña Tipo de K-Means, Hierarchical Clustering y DBSCAN dice qué significa no tener etiquetas y cómo se evalúa sin ellas (inercia, método del codo, silueta, saltos del dendrograma, correlación cofenética) y sus límites (ninguna dice si los grupos sirven; la silueta premia grupos redondos). PCA dice lo mismo para la reducción (varianza retenida, error de reconstrucción).
5. **OVAs accesibles.** Las 4 OVAs nuevas no tienen elementos enfocables dentro del `<svg>` (todo se controla con sliders y botones fuera), así que el `<svg>` lleva `role="img"`. Los textos fijos van en el `hint` o en `children`, **nunca** dentro del readout (`role="status"`). Los botones de opción llevan `aria-pressed`.
6. **Animación responsable (K-Means).** Avanza un paso cada 900 ms solo mientras la OVA se ve en pantalla (`IntersectionObserver`); con `prefers-reduced-motion: reduce`, «Reproducir» salta al resultado final sin animar y el CSS quita la transición de los centroides.
7. **Fichas 💡.** Todo término de `REQUIRED_TERMS` (la Task 3 añade 18) lleva su ficha en cada pestaña donde aparece (`glossaryTerms.test.ts`), como máximo 3 fichas por `<p>`/`<li>` (`glossaryDensity.test.ts`), y con `{' '}` en los bordes de línea JSX (`textSpacing.test.ts`). En los strings de KaTeX, doble barra (`\\;`, `\\,`): lo vigila `render.test.ts`.
8. **Ejercicios idénticos en CPython y Pyodide.** `KMeans` con `n_init=10` y `random_state=0`; datos generados con `np.random.default_rng(<semilla>)`; ordenamientos con `kind="stable"`; ninguna distancia empatada en el `linkage` (datos continuos con ruido). Solo datos generados o empaquetados (`load_digits`); nada de descargas. El dendrograma y la figura de PCA se generan sin error en Pyodide (1 PNG cada uno).
## Salida verificada de los 4 ejercicios

Cada `.out.txt` de abajo es byte a byte lo que imprimen `~/.cache/mlx-venv/bin/python` (CPython 3.12, numpy 2.0.2, scikit-learn 1.6.1, scipy 1.14.1) **y** Pyodide 0.27.7 en Node (cargando `pyodideSetup.py`, igual que el navegador): `✓` en los 12 ejercicios con `scripts/check-ml-exercises.py` y con `scripts/check-ml-exercises-pyodide.mjs`. Hierarchical Clustering y PCA generan una figura cada uno (en Pyodide: 1 PNG cada uno); K-Means y DBSCAN, ninguna. Tiempos en Pyodide/Node, cada uno en un proceso nuevo e incluido el primer import: 4.0 s (K-Means), 1.6 s (Hierarchical Clustering, no importa scikit-learn), 3.9 s (DBSCAN), 4.2 s (PCA); el límite del explorador es 15 s.

**K-Means** (`k-means.out.txt`):

```text
K | inercia | silueta
1 |   600.0 |   —
2 |   250.0 | 0.60
3 |    39.5 | 0.79
4 |    33.8 | 0.64
5 |    29.0 | 0.49
6 |    24.8 | 0.33

Segmentos con K = 3 (de menor a mayor gasto):
  100 clientes | gasto 114 mil |  1.9 visitas al mes
  100 clientes | gasto 301 mil | 11.5 visitas al mes
  100 clientes | gasto 447 mil |  3.9 visitas al mes
```

**Hierarchical Clustering** (`hierarchical-clustering.out.txt`):

```text
Últimas 4 uniones (altura = distancia a la que se unen):
  altura 0.05 → grupo de 4 genes
  altura 0.06 → grupo de 4 genes
  altura 0.96 → grupo de 8 genes
  altura 1.48 → grupo de 12 genes

Cortando en 2 grupos:
  grupo 1: sube-1, sube-2, sube-3, sube-4
  grupo 2: baja-1, baja-2, baja-3, baja-4, pico-1, pico-2, pico-3, pico-4

Cortando en 3 grupos:
  grupo 1: sube-1, sube-2, sube-3, sube-4
  grupo 2: pico-1, pico-2, pico-3, pico-4
  grupo 3: baja-1, baja-2, baja-3, baja-4

Correlación cofenética: 0.87 (1 = el árbol respeta todas las distancias)
```

**DBSCAN** (`dbscan.out.txt`):

```text
145 reportes (latitud, longitud)
eps = 150 m → 7 zonas [39, 28, 13, 12, 10, 6, 5], ruido: 32
eps = 300 m → 3 zonas [62, 40, 30], ruido: 13
eps = 800 m → 2 zonas [106, 31], ruido: 8

K-Means (K = 3) manda 17 de los 60 reportes de la avenida a otra zona
y mete los 15 aislados en alguna zona: el más lejano queda a 2.2 km de su centro
```

**PCA** (`pca.out.txt`):

```text
1797 imágenes de 64 píxeles

k números | varianza retenida | error medio por píxel
        1 |              15% |                 4.00
        2 |              29% |                 3.66
        5 |              54% |                 2.92
       10 |              74% |                 2.22
       20 |              89% |                 1.41
       40 |              99% |                 0.47

Para retener el 90 % bastan 21 de 64 componentes
```

## Cifras clave de las OVAs (calculadas con el código de este plan)

| OVA | Situación | Cifra que muestra |
|---|---|---|
| K-Means | Arranque A (semilla 11), K = 3 | 6 pasos; inercia 294.05 → 15.18; silueta 0.75 |
| K-Means | Arranque B (semilla 12), K = 3 | 2 pasos; se atasca en 123.31 (8 veces más); silueta 0.18 |
| K-Means | Arranque A, K = 1…6 | inercia 209.39 / 129.43 / 15.18 / 11.93 / 11.02 / 9.83; silueta (K ≥ 2) 0.43 / 0.75 / 0.64 / 0.63 / 0.46 |
| Hierarchical | 11 alturas de unión (enlace promedio) | 0.161, 0.197, 0.506, 0.532, 1.011, 1.075, 1.182, 1.362, 2.150, 5.269, 5.790 |
| Hierarchical | Corte en 3.0 (inicial) / 2.0 / 5.5 / ≥ 5.8 / 0 | 3 grupos de 4 / 4 grupos (4, 4, 3, 1) / 2 / 1 / 12; de 2.2 a 5.2 siempre 3 |
| Hierarchical | El punto 12 (entre dos grupos) | se une al grupo de la derecha a altura 2.15 |
| PCA | Eje a 0° / 90° / 34° (máximo) / 124° (perpendicular) | 66.5 % / 33.5 % / 94.6 % / 5.4 % de la varianza |
| DBSCAN | ε = 1.0, minPts = 4 (inicial) | 2 grupos (las lunas) y 4 de ruido (los 3 sueltos y la punta de una luna); 50 núcleos y 5 de borde |
| DBSCAN | ε = 0.8 / 0.4 / 1.1 (minPts = 4) | 4 grupos y 9 de ruido / 1 grupo y 55 de ruido / 1 grupo y 3 de ruido |
| DBSCAN | ε = 1.0, minPts = 6 | 4 grupos y 13 de ruido |

**Contraste con scikit-learn / scipy** (script de verificación sobre los mismos datos): `KMeans(init=<los centroides de randomInit>, n_init=1, algorithm="lloyd", tol=0)` da la misma inercia y las mismas etiquetas en los 12 casos (K = 1…6, arranques A y B), y `silhouette_score` la misma silueta; `KMeans(n_clusters=3, n_init=10, random_state=0)` da 15.18375, la inercia del arranque A. `scipy.cluster.hierarchy.linkage(HC_POINTS, "average")` da las mismas 11 uniones (diferencia máxima 8.9e-16) y `fcluster(Z, h, "distance")` los mismos grupos en los 61 cortes del slider (0.0 a 6.0). `PCA().fit(PCA_POINTS).explained_variance_ratio_[0]` = 0.946006 y su primer componente está a 34.14°. `DBSCAN(eps, min_samples)` da las mismas etiquetas y los mismos núcleos en las 171 combinaciones del simulador (ε de 0.2 a 2.0, minPts de 2 a 10). Las lunas de DBSCAN son `make_moons(56, noise=0.07, random_state=3)`; con ε = 1.0 y minPts = 4 los 2 grupos coinciden exactamente con las 2 lunas (salvo la punta que queda como ruido).

## Mapa de archivos

| Archivo | Acción | Task |
|---|---|---|
| `src/components/ml-explorer/ovas/ovaMath.ts` | Modificar: distancias, K-Means, enlace promedio, PCA 2D, DBSCAN | 1 |
| `src/components/ml-explorer/ovas/ovaMath.fase3.test.ts` | Crear: tests unitarios de la matemática nueva | 1 |
| `src/components/ml-explorer/ovas/datasets.ts` | Modificar: datos de las 4 OVAs | 2 |
| `src/components/ml-explorer/ovas/datasets.test.ts` | Modificar: cifras de las 4 OVAs y de los ejemplos de Fórmula | 2 |
| `src/components/ml-explorer/glossary.ts` | Modificar: 22 términos nuevos | 3 |
| `src/components/ml-explorer/glossaryTerms.ts` | Modificar: 18 términos obligatorios nuevos | 3 |
| `src/components/ml-explorer/ml-explorer.css` | Modificar: botón deshabilitado, transición de centroides, dos figuras lado a lado | 3 |
| `src/components/ml-explorer/ovas/OvaFrame.tsx` | Modificar: `CLUSTER_COLORS`, `NOISE_COLOR` | 3 |
| `src/components/ml-explorer/ovas/useMotion.ts` | Crear: `usePrefersReducedMotion`, `useInViewport` | 3 |
| `src/components/ml-explorer/algorithms/python/<slug>.py` + `.out.txt` | Crear (×4) | 4-7 |
| `src/components/ml-explorer/algorithms/python/outputs.test.ts` | Modificar (×4) | 4-7 |
| `src/components/ml-explorer/ovas/<Nombre>Ova.tsx` + `.dom.test.tsx` | Crear (×4) | 4-7 |
| `src/components/ml-explorer/algorithms/<slug>.tsx` | Crear (×4) | 4-7 |
| `src/components/ml-explorer/registry.ts` + `registry.test.ts` | Modificar (×4) | 4-7 |
| `src/components/ml-explorer/MLExplorer.real.dom.test.tsx` | Modificar (×4) | 4-7 |
| `scripts/build-ml-notebook.py` + `../notebooks/algoritmos-ml.ipynb` + `../notebooks/algoritmos-ml/<slug>.ipynb` | Modificar / regenerar (×4) | 4-7 |
| `src/data/articles/algoritmos-ml-explorador.md` | Modificar: description en cada task (nueve, diez, once, doce); enlaces en la 8 | 4-8 |
| `src/components/ml-explorer/render.test.ts` | Modificar: su alternativa «próximamente» deja de ser K-Means | 5 |
| `src/pages/ArticleDetail.ml.dom.test.tsx` | Modificar: 12 enlaces internos | 8 |

**Orden de las tasks:** DBSCAN (Task 4) va antes que K-Means (Task 5) porque la pestaña «Cuándo no usarlo» de K-Means cita cifras del ejercicio de DBSCAN (17 de 60 reportes de la avenida, 2.2 km), y esas cifras deben estar fijadas en `outputs.test.ts` antes de escribir el texto. El menú no depende de este orden: lo fija la lista `ENTRIES` de `registry.ts` (K-Means, Hierarchical Clustering, DBSCAN y luego PCA en su propio grupo).

**Por qué cambia la description en cada task:** `algoritmos-ml-explorador.links.test.ts` exige «Los primeros N ya están completos» con N = número de algoritmos disponibles en palabras: «nueve» (Task 4), «diez» (5), «once» (6) y «doce» (7).

**Alternativas que se activan solas:** las alternativas de las fases 1 y 2 no apuntan a algoritmos de esta fase, así que ningún botón «Mejor prueba con» viejo cambia. Las nuevas: K-Means → DBSCAN, Hierarchical Clustering; Hierarchical Clustering → K-Means, DBSCAN; DBSCAN → Hierarchical Clustering, K-Means; PCA → Autoencoders (queda «próximamente» hasta la fase 4), Random Forest (para saber qué columnas originales importan). `registry.test.ts` ya verifica que toda alternativa exista.

---
### Task 1: Matemática de las OVAs de la fase 3

**Files:**
- Modify: `src/components/ml-explorer/ovas/ovaMath.ts`
- Create: `src/components/ml-explorer/ovas/ovaMath.fase3.test.ts`

Todo es puro y determinista. K-Means reproduce el algoritmo de Lloyd de scikit-learn (para cuando ninguna asignación cambia); el enlace promedio reproduce `linkage(…, "average")` de scipy (numeración de grupos incluida); DBSCAN reproduce el recorrido de scikit-learn (vecinos a `≤ ε` contando el propio punto; un punto de borde se queda en el primer grupo que lo alcanza). Con 12, 24 y 59 puntos, los algoritmos directos (O(n³) en el jerárquico, O(n²) en DBSCAN) tardan milisegundos.

- [ ] **Step 1: Preparar esbuild**

```bash
test -f /tmp/esbuild-bin || (cp node_modules/@esbuild/linux-x64/bin/esbuild /tmp/esbuild-bin && chmod +x /tmp/esbuild-bin)
```

- [ ] **Step 2: Escribir los tests (fallan)**

Crea `src/components/ml-explorer/ovas/ovaMath.fase3.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  averageLinkage,
  capturedShare,
  covariance2,
  cutTree,
  dbscan,
  dendrogramLayout,
  dist,
  kmeansRun,
  mulberry32,
  nearestCentroid,
  principalAngle,
  projectOnAxis,
  randomInit,
  silhouette,
  sqDist,
  varianceAlong,
  type Pt,
} from './ovaMath';

const p = (x: number, y: number): Pt => ({ x, y });

describe('distancias', () => {
  it('sqDist y dist', () => {
    expect(sqDist(p(0, 0), p(3, 4))).toBe(25);
    expect(dist(p(0, 0), p(3, 4))).toBe(5);
  });
});

describe('K-Means', () => {
  const two = [p(0, 0), p(0, 1), p(10, 0), p(10, 1)];

  it('nearestCentroid: el más cercano; con empate, el de índice menor', () => {
    expect(nearestCentroid(p(1, 0), [p(0, 0), p(10, 0)])).toBe(0);
    expect(nearestCentroid(p(5, 0), [p(0, 0), p(10, 0)])).toBe(0);
    expect(nearestCentroid(p(6, 0), [p(0, 0), p(10, 0)])).toBe(1);
  });

  it('randomInit: k puntos distintos de los datos, siempre los mismos con la misma semilla', () => {
    const a = randomInit(two, 3, mulberry32(5));
    expect(a).toHaveLength(3);
    expect(new Set(a.map((c) => `${c.x},${c.y}`)).size).toBe(3);
    for (const c of a) expect(two).toContainEqual(c);
    expect(randomInit(two, 3, mulberry32(5))).toEqual(a);
  });

  it('kmeansRun: llega a los dos grupos y para cuando ninguna asignación cambia', () => {
    const run = kmeansRun(two, [p(0, 0), p(10, 0)]);
    expect(run[0].labels).toEqual([0, 0, 1, 1]);
    expect(run.at(-1)!.centroids).toEqual([p(0, 0.5), p(10, 0.5)]);
    expect(run.at(-1)!.inertia).toBeCloseTo(1, 12);
    const [a, b] = run.slice(-2);
    expect(b.labels).toEqual(a.labels);
  });

  it('kmeansRun: un mal arranque se atasca en una solución peor (mínimo local)', () => {
    // Centroides iniciales (0, 0) y (0, 1): cada uno se queda con un punto de cada lado.
    const run = kmeansRun(two, [p(0, 0), p(0, 1)]);
    expect(run[0].labels).toEqual([0, 1, 0, 1]);
    expect(run.at(-1)!.labels).toEqual([0, 1, 0, 1]);
    expect(run.at(-1)!.centroids).toEqual([p(5, 0), p(5, 1)]);
    expect(run.at(-1)!.inertia).toBe(100);
    for (let i = 1; i < run.length; i++) expect(run[i].inertia).toBeLessThanOrEqual(run[i - 1].inertia);
  });

  it('un grupo vacío conserva su centroide', () => {
    const run = kmeansRun([p(0, 0), p(1, 0)], [p(0, 0), p(100, 100)]);
    expect(run.at(-1)!.centroids[1]).toEqual(p(100, 100));
  });

  it('silhouette: grupos bien separados → cerca de 1; un solo grupo → 0; un punto solo vale 0', () => {
    expect(silhouette(two, [0, 0, 1, 1])).toBeCloseTo(1 - 1 / 10.0249, 3);
    expect(silhouette(two, [0, 0, 0, 0])).toBe(0);
    // El punto 3 solo en su grupo aporta 0; los otros tres sí cuentan.
    expect(silhouette(two, [0, 0, 1, 2])).toBeLessThan(silhouette(two, [0, 0, 1, 1]));
  });
});

describe('agrupamiento jerárquico (enlace promedio)', () => {
  const line = [p(0, 0), p(1, 0), p(5, 0), p(7, 0)];

  it('une primero lo más cercano; la altura es la distancia promedio entre grupos', () => {
    const m = averageLinkage(line);
    expect(m).toEqual([
      { a: 0, b: 1, height: 1, size: 2 },
      { a: 2, b: 3, height: 2, size: 2 },
      { a: 4, b: 5, height: (5 + 7 + 4 + 6) / 4, size: 4 },
    ]);
  });

  it('cutTree: cortar a una altura deja los grupos unidos por debajo', () => {
    const m = averageLinkage(line);
    expect(cutTree(m, 4, 0.5)).toEqual([0, 1, 2, 3]);
    expect(cutTree(m, 4, 1)).toEqual([0, 0, 1, 2]);
    expect(cutTree(m, 4, 3)).toEqual([0, 0, 1, 1]);
    expect(cutTree(m, 4, 10)).toEqual([0, 0, 0, 0]);
  });

  it('dendrogramLayout: hojas en orden y cada unión en el medio de sus hijos', () => {
    const { order, nodes } = dendrogramLayout(averageLinkage(line), 4);
    expect(order).toEqual([0, 1, 2, 3]);
    expect(nodes[4]).toEqual({ x: 0.5, height: 1 });
    expect(nodes[6]).toEqual({ x: 1.5, height: 5.5 });
  });
});

describe('PCA en 2D', () => {
  const diag = [p(0, 0), p(1, 1), p(2, 2), p(3, 3)];

  it('puntos sobre la diagonal: el eje de 45° captura el 100 %', () => {
    const cov = covariance2(diag);
    expect(cov.mean).toEqual(p(1.5, 1.5));
    expect(cov.sxx).toBeCloseTo(5 / 3, 12);
    expect(principalAngle(cov)).toBeCloseTo(45, 10);
    expect(capturedShare(cov, 45)).toBeCloseTo(1, 12);
    expect(capturedShare(cov, 135)).toBeCloseTo(0, 12);
    expect(capturedShare(cov, 0)).toBeCloseTo(0.5, 12);
  });

  it('varianceAlong a 0° y 90° son las varianzas de x y de y', () => {
    const cov = covariance2([p(0, 0), p(2, 0), p(0, 1), p(2, 1)]);
    expect(varianceAlong(cov, 0)).toBeCloseTo(cov.sxx, 12);
    expect(varianceAlong(cov, 90)).toBeCloseTo(cov.syy, 12);
    expect(principalAngle(cov)).toBeCloseTo(0, 10);
  });

  it('principalAngle devuelve un ángulo en [0, 180)', () => {
    const anti = covariance2([p(0, 3), p(1, 2), p(2, 1), p(3, 0)]);
    expect(principalAngle(anti)).toBeCloseTo(135, 10);
  });

  it('projectOnAxis deja el punto sobre la recta', () => {
    const q = projectOnAxis(p(2, 0), p(0, 0), 45);
    expect(q.x).toBeCloseTo(1, 12);
    expect(q.y).toBeCloseTo(1, 12);
  });
});

describe('DBSCAN', () => {
  const pts = [p(0, 0), p(0.5, 0), p(1, 0), p(5, 0), p(5.5, 0), p(9, 9)];

  it('núcleos, borde y ruido como en scikit-learn (vecinos a ≤ ε contando el propio punto)', () => {
    const r = dbscan(pts, 0.5, 3);
    expect(r.core).toEqual([false, true, false, false, false, false]);
    expect(r.labels).toEqual([0, 0, 0, -1, -1, -1]);
    expect(r.clusters).toBe(1);
    expect(r.noise).toBe(3);
  });

  it('con minPts = 2 los pares cercanos también forman grupo', () => {
    const r = dbscan(pts, 0.5, 2);
    expect(r.labels).toEqual([0, 0, 0, 1, 1, -1]);
  });

  it('con ε grande todo es un grupo; con minPts = 1 nada es ruido', () => {
    expect(dbscan(pts, 20, 3).clusters).toBe(1);
    expect(dbscan(pts, 0.1, 1).noise).toBe(0);
  });
});
```

- [ ] **Step 3: Verificar que fallan**

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/ovaMath.fase3.test.ts`
Expected: FAIL (`averageLinkage`, `dbscan`, etc. no existen en `./ovaMath`).

- [ ] **Step 4: Implementar**

Añade al **final** de `src/components/ml-explorer/ovas/ovaMath.ts` (después de `explainNaiveBayes`), dejando una línea en blanco antes:

```ts
// ---------- Distancias (fase 3) ----------

export function sqDist(a: Pt, b: Pt): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

export function dist(a: Pt, b: Pt): number {
  return Math.sqrt(sqDist(a, b));
}

// ---------- K-Means ----------

/** Índice del centroide más cercano; con empate gana el de índice menor. */
export function nearestCentroid(p: Pt, centroids: Pt[]): number {
  let best = 0;
  for (let c = 1; c < centroids.length; c++) if (sqDist(p, centroids[c]) < sqDist(p, centroids[best])) best = c;
  return best;
}

/**
 * Centroides iniciales: k puntos distintos de los datos, sorteados con `rng`
 * (el init="random" de scikit-learn). Con semilla fija, siempre los mismos.
 */
export function randomInit(points: Pt[], k: number, rng: () => number): Pt[] {
  const idx = points.map((_, i) => i);
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(rng() * (idx.length - i));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, k).map((i) => ({ x: points[i].x, y: points[i].y }));
}

export interface KMeansState {
  centroids: Pt[];
  labels: number[];
  /** Suma de distancias² de cada punto a su centroide. */
  inertia: number;
}

function assign(points: Pt[], centroids: Pt[]): KMeansState {
  const labels = points.map((p) => nearestCentroid(p, centroids));
  const inertia = points.reduce((s, p, i) => s + sqDist(p, centroids[labels[i]]), 0);
  return { centroids, labels, inertia };
}

/**
 * Algoritmo de Lloyd paso a paso. El estado 0 son los centroides iniciales
 * con su asignación; cada estado siguiente mueve cada centroide al promedio
 * de sus puntos y reasigna. Para cuando ninguna asignación cambia (igual que
 * KMeans(init=…, n_init=1, algorithm="lloyd") de scikit-learn). Un grupo que
 * se queda sin puntos conserva su centroide.
 */
export function kmeansRun(points: Pt[], init: Pt[], maxIterations = 100): KMeansState[] {
  const states = [assign(points, init)];
  for (let it = 0; it < maxIterations; it++) {
    const prev = states[states.length - 1];
    const centroids = prev.centroids.map((c, j) => {
      const mine = points.filter((_, i) => prev.labels[i] === j);
      if (mine.length === 0) return c;
      return { x: mine.reduce((s, p) => s + p.x, 0) / mine.length, y: mine.reduce((s, p) => s + p.y, 0) / mine.length };
    });
    const next = assign(points, centroids);
    states.push(next);
    if (next.labels.every((l, i) => l === prev.labels[i])) break;
  }
  return states;
}

/**
 * Silueta media: para cada punto, a = distancia media a los de su grupo y
 * b = distancia media al grupo vecino más cercano; s = (b − a) / max(a, b).
 * Un punto solo en su grupo vale 0 (como silhouette_score de scikit-learn).
 */
export function silhouette(points: Pt[], labels: number[]): number {
  const groups = [...new Set(labels)];
  if (groups.length < 2) return 0;
  let total = 0;
  points.forEach((p, i) => {
    const mean = (g: number) => {
      const others = points.filter((_, j) => labels[j] === g && j !== i);
      return others.reduce((s, q) => s + dist(p, q), 0) / others.length;
    };
    if (labels.filter((l) => l === labels[i]).length === 1) return;
    const a = mean(labels[i]);
    const b = Math.min(...groups.filter((g) => g !== labels[i]).map(mean));
    total += (b - a) / Math.max(a, b);
  });
  return total / points.length;
}

// ---------- Agrupamiento jerárquico (enlace promedio) ----------

export interface Merge {
  /** Grupos que se unen: 0…n−1 son los puntos; n + i es el grupo creado en la unión i (como scipy). */
  a: number;
  b: number;
  /** Distancia a la que se unen: promedio de las distancias entre sus puntos. */
  height: number;
  size: number;
}

/**
 * Agrupamiento aglomerativo con enlace promedio (UPGMA): empieza con cada
 * punto solo y en cada paso une los dos grupos más cercanos. Da las mismas
 * uniones que linkage(points, "average") de scipy.
 */
export function averageLinkage(points: Pt[]): Merge[] {
  const n = points.length;
  let clusters = points.map((_, i) => ({ id: i, members: [i] }));
  const merges: Merge[] = [];
  const avg = (A: number[], B: number[]) => {
    let s = 0;
    for (const i of A) for (const j of B) s += dist(points[i], points[j]);
    return s / (A.length * B.length);
  };
  while (clusters.length > 1) {
    let best = { i: 0, j: 1, d: Infinity };
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const d = avg(clusters[i].members, clusters[j].members);
        if (d < best.d) best = { i, j, d };
      }
    }
    const A = clusters[best.i];
    const B = clusters[best.j];
    const members = [...A.members, ...B.members];
    merges.push({ a: Math.min(A.id, B.id), b: Math.max(A.id, B.id), height: best.d, size: members.length });
    clusters = clusters.filter((_, k) => k !== best.i && k !== best.j);
    clusters.push({ id: n + merges.length - 1, members });
  }
  return merges;
}

/**
 * Corta el árbol a la altura h: se aplican solo las uniones con altura ≤ h.
 * Devuelve el grupo de cada punto, numerados 0, 1, 2… en el orden en que
 * aparece su primer punto.
 */
export function cutTree(merges: Merge[], n: number, h: number): number[] {
  const parent = Array.from({ length: n + merges.length }, (_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  merges.forEach((m, k) => {
    if (m.height <= h) {
      parent[find(m.a)] = n + k;
      parent[find(m.b)] = n + k;
    }
  });
  const ids = new Map<number, number>();
  return Array.from({ length: n }, (_, i) => {
    const root = find(i);
    if (!ids.has(root)) ids.set(root, ids.size);
    return ids.get(root)!;
  });
}

export interface DendrogramNode {
  x: number;
  height: number;
}

/**
 * Posiciones para dibujar el dendrograma: el orden de las hojas (recorriendo
 * el árbol desde la raíz, primero `a` y luego `b`) y, para cada grupo, su x
 * (hojas en 0, 1, 2…; una unión, en el medio de sus dos hijos) y su altura.
 */
export function dendrogramLayout(merges: Merge[], n: number): { order: number[]; nodes: DendrogramNode[] } {
  const order: number[] = [];
  const visit = (id: number) => {
    if (id < n) order.push(id);
    else {
      visit(merges[id - n].a);
      visit(merges[id - n].b);
    }
  };
  visit(n + merges.length - 1);
  const nodes: DendrogramNode[] = [];
  order.forEach((leaf, i) => (nodes[leaf] = { x: i, height: 0 }));
  merges.forEach((m, k) => (nodes[n + k] = { x: (nodes[m.a].x + nodes[m.b].x) / 2, height: m.height }));
  return { order, nodes };
}

// ---------- PCA en 2D ----------

export interface Covariance2 {
  mean: Pt;
  sxx: number;
  syy: number;
  sxy: number;
}

/** Media y covarianza (dividida entre n − 1, como numpy y scikit-learn). */
export function covariance2(points: Pt[]): Covariance2 {
  const n = points.length;
  const mean = { x: points.reduce((s, p) => s + p.x, 0) / n, y: points.reduce((s, p) => s + p.y, 0) / n };
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const p of points) {
    sxx += (p.x - mean.x) ** 2;
    syy += (p.y - mean.y) ** 2;
    sxy += (p.x - mean.x) * (p.y - mean.y);
  }
  return { mean, sxx: sxx / (n - 1), syy: syy / (n - 1), sxy: sxy / (n - 1) };
}

/** Varianza de los puntos proyectados sobre un eje que forma `deg` grados con el eje x. */
export function varianceAlong(cov: Covariance2, deg: number): number {
  const t = (deg * Math.PI) / 180;
  const c = Math.cos(t);
  const s = Math.sin(t);
  return cov.sxx * c * c + 2 * cov.sxy * c * s + cov.syy * s * s;
}

/** Fracción de la varianza total que captura ese eje (entre 0 y 1). */
export function capturedShare(cov: Covariance2, deg: number): number {
  return varianceAlong(cov, deg) / (cov.sxx + cov.syy);
}

/** Ángulo (0 a 180°) del primer componente principal: el eje de máxima varianza. */
export function principalAngle(cov: Covariance2): number {
  const deg = ((0.5 * Math.atan2(2 * cov.sxy, cov.sxx - cov.syy)) * 180) / Math.PI;
  return (deg + 180) % 180;
}

/** Proyección de p sobre la recta que pasa por `mean` con ángulo `deg`. */
export function projectOnAxis(p: Pt, mean: Pt, deg: number): Pt {
  const t = (deg * Math.PI) / 180;
  const u = { x: Math.cos(t), y: Math.sin(t) };
  const s = (p.x - mean.x) * u.x + (p.y - mean.y) * u.y;
  return { x: mean.x + s * u.x, y: mean.y + s * u.y };
}

// ---------- DBSCAN ----------

export interface DbscanResult {
  /** Grupo de cada punto (0, 1, 2…) o −1 si es ruido. */
  labels: number[];
  /** true si el punto es núcleo: tiene al menos minPts vecinos a distancia ≤ ε (contándose él mismo). */
  core: boolean[];
  clusters: number;
  noise: number;
}

/**
 * DBSCAN como en scikit-learn: vecinos a distancia ≤ ε contando el propio
 * punto; recorre los puntos en orden y, desde cada núcleo sin grupo, expande
 * un grupo nuevo por los núcleos alcanzables. Un punto de borde se queda en
 * el primer grupo que lo alcanza.
 */
export function dbscan(points: Pt[], eps: number, minPts: number): DbscanResult {
  const neighbors = points.map((p) => points.flatMap((q, j) => (dist(p, q) <= eps + 1e-9 ? [j] : [])));
  const core = neighbors.map((nb) => nb.length >= minPts);
  const labels = points.map(() => -1);
  let label = 0;
  points.forEach((_, start) => {
    if (labels[start] !== -1 || !core[start]) return;
    const stack = [start];
    while (stack.length) {
      const i = stack.pop()!;
      if (labels[i] !== -1) continue;
      labels[i] = label;
      if (core[i]) for (const v of neighbors[i]) if (labels[v] === -1) stack.push(v);
    }
    label++;
  });
  return { labels, core, clusters: label, noise: labels.filter((l) => l === -1).length };
}
```

`randomInit` sortea con un Fisher-Yates parcial (k índices distintos) y recibe el `rng` de `mulberry32`, que ya existe en el archivo (fase 2). No uses `Array.prototype.findLastIndex` ni otras funciones de ES2023: `tsconfig.json` tiene `lib: ES2022` y `tsc` fallaría.

- [ ] **Step 5: Verificar que pasan**

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/ovaMath.fase3.test.ts`
Expected: PASS (17 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/ml-explorer/ovas/ovaMath.ts src/components/ml-explorer/ovas/ovaMath.fase3.test.ts
git commit -m "feat(ml-explorer): math for the clustering and PCA simulators

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Datos de las OVAs y las cifras que citan los textos

**Files:**
- Modify: `src/components/ml-explorer/ovas/datasets.ts`
- Modify: `src/components/ml-explorer/ovas/datasets.test.ts`

Los datos: 24 clientes en tres nubes (K-Means), 12 puntos en tres grupos más uno intermedio (jerárquico), 20 puntos de dos medidas muy correlacionadas (PCA) y dos lunas de `make_moons` con 3 puntos sueltos (DBSCAN). Los tests fijan todas las cifras de la tabla «Cifras clave» y las de los ejemplos de la pestaña Fórmula de cada algoritmo.

- [ ] **Step 1: Escribir los tests (fallan)**

En `src/components/ml-explorer/ovas/datasets.test.ts`, justo después del cierre del import de `./ovaMath` que ya existe (la línea `} from './ovaMath';` que precede a `describe('OVA de regresión lineal', …)`), añade estos dos imports:

```ts
import { DB_POINTS, DB_START, HC_CUT, HC_POINTS, HC_START_CUT, KM_MAX_K, KM_POINTS, KM_START_K, KM_STARTS, PCA_POINTS } from './datasets';
import {
  averageLinkage,
  capturedShare,
  covariance2,
  cutTree,
  dbscan,
  kmeansRun,
  mulberry32,
  principalAngle,
  randomInit,
  silhouette,
} from './ovaMath';
```

y añade al **final** del archivo:

```ts
// ---------- Fase 3 ----------
// Cifras contrastadas con scikit-learn 1.6.1 / scipy 1.14.1 (ver el plan de la fase 3):
// KMeans(init=<los mismos centroides>, n_init=1, algorithm="lloyd") da la misma
// inercia y las mismas etiquetas en los 12 casos (K = 1…6, arranques A y B);
// linkage(HC_POINTS, "average") da las mismas 11 uniones y fcluster(…, "distance")
// los mismos grupos en los 61 cortes del slider; PCA().explained_variance_ratio_[0]
// = 0.946006; DBSCAN(eps, min_samples) da las mismas etiquetas y núcleos en las
// 171 combinaciones del simulador.

const kmeansFinal = (k: number, start: number) => {
  const run = kmeansRun(KM_POINTS, randomInit(KM_POINTS, k, mulberry32(KM_STARTS[start].seed)));
  const last = run.at(-1)!;
  return { steps: run.length - 1, first: run[0].inertia, inertia: last.inertia, sil: silhouette(KM_POINTS, last.labels) };
};

describe('OVA de K-Means', () => {
  it('24 puntos; K de 1 a 6, empieza en 3', () => {
    expect(KM_POINTS).toHaveLength(24);
    expect(KM_START_K).toBe(3);
    expect(KM_MAX_K).toBe(6);
  });

  it('arranque A con K = 3: 6 pasos, la inercia baja de 294.05 a 15.18 y la silueta es 0.75', () => {
    const a = kmeansFinal(3, 0);
    expect(a.steps).toBe(6);
    expect(a.first.toFixed(2)).toBe('294.05');
    expect(a.inertia.toFixed(2)).toBe('15.18');
    expect(a.sil.toFixed(2)).toBe('0.75');
  });

  it('arranque B con K = 3: se atasca en 123.31 (8 veces más), silueta 0.18', () => {
    const b = kmeansFinal(3, 1);
    expect(b.steps).toBe(2);
    expect(b.inertia.toFixed(2)).toBe('123.31');
    expect(b.sil.toFixed(2)).toBe('0.18');
    expect(Math.round(b.inertia / kmeansFinal(3, 0).inertia)).toBe(8);
  });

  it('arranque A: la inercia baja siempre al subir K, pero la silueta es máxima en K = 3', () => {
    const rows = [1, 2, 3, 4, 5, 6].map((k) => kmeansFinal(k, 0));
    expect(rows.map((r) => r.inertia.toFixed(2))).toEqual(['209.39', '129.43', '15.18', '11.93', '11.02', '9.83']);
    expect(rows.slice(1).map((r) => r.sil.toFixed(2))).toEqual(['0.43', '0.75', '0.64', '0.63', '0.46']);
  });

  it('15.18 es también la inercia de KMeans(n_clusters=3, n_init=10) de scikit-learn', () => {
    // Valor de scikit-learn: 15.183749999999995.
    expect(kmeansFinal(3, 0).inertia).toBeCloseTo(15.18375, 9);
  });
});

describe('OVA de agrupamiento jerárquico', () => {
  const merges = averageLinkage(HC_POINTS);
  const groupsAt = (h: number) => Math.max(...cutTree(merges, HC_POINTS.length, h)) + 1;

  it('las 11 alturas de unión coinciden con linkage(…, "average") de scipy', () => {
    expect(merges.map((m) => m.height.toFixed(3))).toEqual([
      '0.161', '0.197', '0.506', '0.532', '1.011', '1.075', '1.182', '1.362', '2.150', '5.269', '5.790',
    ]);
  });

  it('el punto 12 (índice 11) se une al grupo de la derecha a altura 2.15', () => {
    const m = merges[8];
    expect(m.a).toBe(11);
    expect(m.height.toFixed(2)).toBe('2.15');
  });

  it('corte inicial 3.0: 3 grupos de 4; entre 2.2 y 5.2 siempre 3; con 2.0, 4; con 5.5, 2; desde 5.8, 1', () => {
    expect(HC_START_CUT).toBe(3);
    expect(HC_CUT.max).toBe(6);
    const labels = cutTree(merges, HC_POINTS.length, 3);
    expect([0, 1, 2].map((g) => labels.filter((l) => l === g).length)).toEqual([4, 4, 4]);
    for (let h = 22; h <= 52; h++) expect(groupsAt(h / 10)).toBe(3);
    expect(groupsAt(2)).toBe(4);
    expect(groupsAt(5.5)).toBe(2);
    expect(groupsAt(5.8)).toBe(1);
    expect(groupsAt(0)).toBe(12);
  });
});

describe('OVA de PCA', () => {
  const cov = covariance2(PCA_POINTS);

  it('el primer componente está a 34° y captura 94.6 % (scikit-learn: 0.946006)', () => {
    expect(principalAngle(cov).toFixed(2)).toBe('34.14');
    expect(capturedShare(cov, principalAngle(cov))).toBeCloseTo(0.946006, 6);
    expect((capturedShare(cov, 34) * 100).toFixed(1)).toBe('94.6');
  });

  it('el eje horizontal (0°) captura 66.5 %, el vertical 33.5 % y el perpendicular al mejor (124°) solo 5.4 %', () => {
    expect((capturedShare(cov, 0) * 100).toFixed(1)).toBe('66.5');
    expect((capturedShare(cov, 90) * 100).toFixed(1)).toBe('33.5');
    expect((capturedShare(cov, 124) * 100).toFixed(1)).toBe('5.4');
  });
});

describe('OVA de DBSCAN', () => {
  it('59 puntos: dos lunas de 56 y 3 puntos sueltos', () => {
    expect(DB_POINTS).toHaveLength(59);
  });

  it('inicio ε = 1.0, minPts = 4: las 2 lunas y 4 puntos de ruido (los 3 sueltos y la punta de una luna)', () => {
    expect(DB_START).toEqual({ eps: 1, minPts: 4 });
    const r = dbscan(DB_POINTS, 1, 4);
    expect(r.clusters).toBe(2);
    expect(r.labels.flatMap((l, i) => (l < 0 ? [i] : []))).toEqual([16, 56, 57, 58]);
    expect(r.core.filter(Boolean)).toHaveLength(50);
  });

  it('ε = 0.8 parte las lunas en 4 grupos (9 de ruido); ε = 0.4 deja 55 de 59 como ruido; ε = 1.1 las funde en 1', () => {
    expect(dbscan(DB_POINTS, 0.8, 4)).toMatchObject({ clusters: 4, noise: 9 });
    expect(dbscan(DB_POINTS, 0.4, 4)).toMatchObject({ clusters: 1, noise: 55 });
    expect(dbscan(DB_POINTS, 1.1, 4)).toMatchObject({ clusters: 1, noise: 3 });
  });

  it('con ε = 1.0, subir minPts a 6 deja 4 grupos y 13 puntos de ruido', () => {
    expect(dbscan(DB_POINTS, 1, 6)).toMatchObject({ clusters: 4, noise: 13 });
  });
});

describe('cifras de los ejemplos de los textos (fase 3)', () => {
  it('K-Means › Fórmula: gastos 1, 2, 9 y 10 con centroides en 1 y 2 → grupos {1, 2} y {9, 10}, centroides 1.5 y 9.5, inercia 1, en 2 pasos', () => {
    const pts = [1, 2, 9, 10].map((x) => ({ x, y: 0 }));
    const run = kmeansRun(pts, [{ x: 1, y: 0 }, { x: 2, y: 0 }]);
    expect(run[0].labels).toEqual([0, 1, 1, 1]);
    expect(run[1].centroids[1].x).toBe(7);
    expect(run[1].labels).toEqual([0, 0, 1, 1]);
    expect(run.at(-1)!.centroids.map((c) => c.x)).toEqual([1.5, 9.5]);
    expect(run.at(-1)!.inertia).toBe(1);
    expect(run).toHaveLength(3); // arranque + 2 pasos (el 2.º ya no cambia nada)
  });

  it('Hierarchical › Fórmula: 0, 1, 5 y 7 se unen a 1, 2 y 5.5', () => {
    const m = averageLinkage([0, 1, 5, 7].map((x) => ({ x, y: 0 })));
    expect(m.map((u) => u.height)).toEqual([1, 2, 5.5]);
  });

  it('Hierarchical › Contras y Cuándo no usarlo: 10 000 datos → unos 50 millones de distancias (400 MB); 100 000 → 5 000 millones (40 GB)', () => {
    const pairs = (n: number) => (n * (n - 1)) / 2;
    expect(Math.round(pairs(10_000) / 1e6)).toBe(50);
    expect(Math.round((pairs(10_000) * 8) / 1e6)).toBe(400);
    expect(Math.round(pairs(100_000) / 1e9)).toBe(5);
    expect(Math.round((pairs(100_000) * 8) / 1e9)).toBe(40);
  });

  it('DBSCAN › Fórmula: 0, 0.5, 1, 5 y 5.5 con ε = 0.5 y minPts = 3 → 0.5 núcleo, 0 y 1 borde, 5 y 5.5 ruido', () => {
    const r = dbscan([0, 0.5, 1, 5, 5.5].map((x) => ({ x, y: 0 })), 0.5, 3);
    expect(r.core).toEqual([false, true, false, false, false]);
    expect(r.labels).toEqual([0, 0, 0, -1, -1]);
  });

  it('PCA › Fórmula: puntos sobre la diagonal → 45° captura 100 %, el eje horizontal 50 % y el perpendicular 0 %', () => {
    const cov = covariance2([0, 1, 2, 3].map((v) => ({ x: v, y: v })));
    expect(capturedShare(cov, 45)).toBeCloseTo(1, 12);
    expect(capturedShare(cov, 0)).toBeCloseTo(0.5, 12);
    expect(capturedShare(cov, 135)).toBeCloseTo(0, 12);
  });
});
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/datasets.test.ts`
Expected: FAIL (`KM_POINTS`, `HC_POINTS`… no existen en `./datasets`).

- [ ] **Step 2: Añadir los datos**

Añade al **final** de `src/components/ml-explorer/ovas/datasets.ts`, dejando una línea en blanco antes (el archivo ya importa `Pt` de `./ovaMath`):

```ts
// ---------- K-Means (24 clientes en tres nubes; sin etiquetas) ----------

const xy = (pairs: [number, number][]): Pt[] => pairs.map(([x, y]) => ({ x, y }));

export const KM_POINTS: Pt[] = xy([
  [2.5, 3.5], [3.4, 2.1], [2.3, 2.1], [2.9, 2.5], [3.0, 1.2], [3.6, 2.4], [3.0, 2.4], [2.2, 2.8],
  [7.8, 2.9], [7.1, 3.5], [6.6, 1.9], [7.5, 2.5], [5.9, 2.4], [6.9, 2.2], [6.2, 3.0], [7.8, 2.8],
  [4.3, 7.8], [5.3, 7.3], [5.2, 8.2], [4.7, 6.9], [5.0, 7.7], [5.6, 6.6], [4.3, 6.9], [3.6, 7.6],
]);
/**
 * Dos arranques (semillas de mulberry32 para sortear los centroides
 * iniciales): con K = 3, el A llega a la buena solución en 6 pasos y el B
 * se atasca en una peor. Fijos para que las cifras sean siempre las mismas.
 */
export const KM_STARTS = [
  { id: 'A', seed: 11 },
  { id: 'B', seed: 12 },
] as const;
export const KM_START_K = 3;
export const KM_MAX_K = 6;

// ---------- Agrupamiento jerárquico (12 puntos: tres grupos y uno intermedio) ----------

export const HC_POINTS: Pt[] = xy([
  [1.67, 1.91], [2.83, 2.33], [1.18, 2.0], [1.69, 2.07],
  [2.4, 7.62], [3.32, 8.29], [3.36, 7.76], [2.45, 8.63],
  [6.54, 5.55], [7.34, 4.56], [7.17, 4.66],
  [5.6, 3.4],
]);
export const HC_CUT = { min: 0, max: 6, step: 0.1 } as const;
export const HC_START_CUT = 3;

// ---------- PCA (20 puntos: dos medidas muy correlacionadas) ----------

export const PCA_POINTS: Pt[] = xy([
  [1.2, 3.2], [2.1, 3.6], [2.0, 2.2], [4.2, 4.8], [-0.1, 2.1], [4.6, 4.6], [2.9, 3.7], [7.0, 6.2], [7.1, 4.9], [8.1, 7.8],
  [6.7, 5.3], [4.9, 3.4], [6.9, 6.0], [8.3, 7.8], [3.6, 3.8], [6.3, 6.8], [4.9, 6.0], [8.2, 6.1], [3.2, 2.3], [4.3, 3.8],
]);

// ---------- DBSCAN (dos lunas entrelazadas y 3 puntos sueltos) ----------
// Las lunas son make_moons(56, noise=0.07, random_state=3) de scikit-learn,
// escaladas ×3, desplazadas y redondeadas a 2 decimales; un punto se movió
// 0.01 para que ninguna distancia caiga justo en un valor de ε del slider.
// Los 3 últimos puntos son ruido a propósito.

export const DB_POINTS: Pt[] = xy([
  [4.31, 5.67], [4.33, 1.99], [5.13, 5.7], [9.54, 3.37], [8.18, 1.78], [9.4, 4.55], [3.69, 5.77], [0.47, 3.88],
  [9.24, 2.48], [6.08, 4.69], [7.55, 1.33], [2.64, 5.23], [4.73, 2.17], [3.49, 3.44], [9.36, 4.16], [6.18, 4.06],
  [0.5, 2.7], [2.6, 5.75], [3.2, 5.93], [0.56, 4.4], [4.45, 5.21], [5.82, 4.92], [7.9, 1.58], [5.86, 1.58],
  [8.36, 1.94], [9.17, 3.47], [6.03, 4.66], [4.33, 2.25], [8.66, 2.49], [6.54, 2.45], [3.39, 4.12], [3.8, 3.2],
  [4.58, 2.68], [6.65, 3.15], [0.81, 4.25], [5.09, 1.65], [2.26, 5.6], [0.41, 3.78], [3.45, 5.69], [5.62, 1.17],
  [3.31, 4.22], [1.66, 5.16], [3.9, 3.02], [5.26, 1.44], [9.17, 2.68], [8.53, 1.94], [6.77, 1.42], [7.2, 1.24],
  [5.09, 5.55], [1.93, 5.52], [1.08, 4.92], [6.43, 2.68], [5.09, 5.37], [6.28, 3.96], [0.82, 4.01], [6.38, 1.42],
  [1.2, 1.2], [9.0, 6.2], [4.8, 7.1],
]);
export const DB_EPS = { min: 0.2, max: 2, step: 0.1 } as const;
export const DB_MIN_PTS = { min: 2, max: 10, step: 1 } as const;
export const DB_START = { eps: 1, minPts: 4 } as const;
```

- [ ] **Step 3: Verificar**

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/datasets.test.ts src/components/ml-explorer/ovas/ovaMath.fase3.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/ml-explorer/ovas/datasets.ts src/components/ml-explorer/ovas/datasets.test.ts
git commit -m "feat(ml-explorer): data and pinned figures for the phase 3 simulators

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Glosario, términos obligatorios, colores, estilos y el hook de animación

**Files:**
- Modify: `src/components/ml-explorer/glossary.ts`
- Modify: `src/components/ml-explorer/glossaryTerms.ts`
- Modify: `src/components/ml-explorer/ml-explorer.css`
- Modify: `src/components/ml-explorer/ovas/OvaFrame.tsx`
- Create: `src/components/ml-explorer/ovas/useMotion.ts`

Ningún texto de las fases 1 y 2 usa los términos nuevos (se verificó con `grep` y con la suite completa), así que añadir los términos obligatorios no rompe nada. `ruido`, `noSupervisado`, `pca`, `altaDimension` y `escalado` ya existen y se reutilizan.

- [ ] **Step 1: Glosario**

En `src/components/ml-explorer/glossary.ts`, justo antes de la línea `} satisfies Record<string, GlossaryEntry>;` (después de la entrada `svr`), añade:

```ts
  cluster: {
    term: 'Cluster (grupo)',
    what: 'Un grupo de datos parecidos entre sí y distintos de los de otros grupos. Lo forma el algoritmo; nadie lo etiquetó antes.',
    why: 'Agrupar es la tarea típica del aprendizaje no supervisado: segmentar clientes, zonas, genes.',
  },
  centroide: {
    term: 'Centroide',
    what: 'El punto promedio de un grupo: el promedio de cada feature de sus miembros.',
    why: 'K-Means representa cada grupo con su centroide y asigna cada dato al más cercano.',
  },
  inercia: {
    term: 'Inercia',
    what: 'La suma de las distancias al cuadrado de cada punto a su centroide. Cuanto más baja, más apretados los grupos.',
    why: 'Es lo que K-Means minimiza. Siempre baja al subir K, así que sola no sirve para elegir K.',
  },
  silueta: {
    term: 'Coeficiente de silueta',
    what: 'Para cada punto compara su distancia media a su grupo (a) con la del grupo vecino más cercano (b): (b − a) / máx(a, b). Va de −1 a 1.',
    why: 'Cerca de 1, grupos compactos y separados; cerca de 0, grupos que se tocan. Sirve para comparar valores de K sin etiquetas.',
  },
  codo: {
    term: 'Método del codo',
    what: 'Graficar la inercia contra K y buscar el punto donde deja de bajar mucho: el «codo» de la curva.',
    why: 'Es una pista para elegir K, no una regla: a veces la curva no tiene un codo claro.',
  },
  minimoLocal: {
    term: 'Mínimo local',
    what: 'Una solución mejor que todas las vecinas, pero peor que la mejor posible.',
    why: 'K-Means puede quedarse en uno según dónde arranquen los centroides; por eso se repite con varios arranques.',
  },
  kmeansPP: {
    term: 'k-means++',
    what: 'Una forma de elegir los centroides iniciales: el primero al azar y cada siguiente, preferiblemente lejos de los ya elegidos.',
    why: 'Arranca con centroides repartidos y reduce el riesgo de atascarse; es el valor por defecto de scikit-learn.',
  },
  dendrograma: {
    term: 'Dendrograma',
    what: 'El dibujo en forma de árbol de un agrupamiento jerárquico: cada unión es un tramo horizontal a la altura (distancia) en que se unieron dos grupos.',
    why: 'Cortarlo con una línea horizontal da los grupos; los saltos grandes de altura sugieren dónde cortar.',
  },
  enlace: {
    term: 'Enlace (linkage)',
    what: 'La regla para medir la distancia entre dos grupos: simple (los dos puntos más cercanos), completo (los más lejanos), promedio (el promedio de todos los pares) o Ward (cuánto crece la varianza al unirlos).',
    why: 'Cambia la forma de los grupos: el simple forma cadenas largas; Ward y el completo, grupos compactos.',
  },
  cofenetica: {
    term: 'Correlación cofenética',
    what: 'Qué tanto se parecen las distancias originales entre puntos a las alturas en que el dendrograma los une. Va de −1 a 1.',
    why: 'Cerca de 1, el árbol resume bien los datos; baja, el árbol los deforma.',
  },
  varianza: {
    term: 'Varianza',
    what: 'Qué tanto se esparcen los valores alrededor de su promedio: el promedio de las distancias al promedio, al cuadrado.',
    why: 'En PCA, una dirección con mucha varianza distingue bien los datos; una con poca casi no aporta.',
  },
  componentePrincipal: {
    term: 'Componente principal',
    what: 'Una dirección nueva en los datos, combinación de las features originales. El primero va por donde más se esparcen los datos; el segundo, perpendicular a él, por donde más se esparce lo que queda; y así sucesivamente.',
    why: 'Quedarse con los primeros componentes resume muchas columnas en pocas, perdiendo lo menos posible.',
  },
  varianzaExplicada: {
    term: 'Varianza explicada (retenida)',
    what: 'La fracción de la varianza total que conservan los componentes que te quedas: con 90 %, pierdes el 10 %.',
    why: 'Es la forma habitual de elegir cuántos componentes guardar.',
  },
  autovector: {
    term: 'Autovectores y autovalores',
    what: 'Un autovector de una matriz es una dirección que la matriz solo estira, sin girarla; su autovalor dice cuánto la estira.',
    why: 'Los componentes principales son los autovectores de la matriz de covarianza, y cada autovalor es la varianza que captura el suyo.',
  },
  reconstruccion: {
    term: 'Error de reconstrucción',
    what: 'La diferencia entre los datos originales y los que se recuperan desde su versión comprimida.',
    why: 'Mide cuánto se pierde al comprimir; también sirve para detectar anomalías, que se reconstruyen peor.',
  },
  epsilon: {
    term: 'ε (épsilon, en DBSCAN)',
    what: 'El radio del vecindario: dos puntos son vecinos si están a distancia ε o menos.',
    why: 'Es el parámetro más delicado: muy pequeño y todo es ruido; muy grande y todo se funde en un grupo.',
  },
  minPts: {
    term: 'minPts (min_samples)',
    what: 'Cuántos puntos debe haber en el vecindario de radio ε, contando el propio punto, para que sea un punto núcleo.',
    why: 'Más alto exige zonas más densas y deja más puntos como ruido. Una regla común: el doble del número de features.',
  },
  puntoNucleo: {
    term: 'Punto núcleo, de borde y ruido',
    what: 'Núcleo: tiene al menos minPts vecinos a distancia ε. Borde: no los tiene, pero es vecino de un núcleo. Ruido: ninguna de las dos cosas.',
    why: 'DBSCAN arma cada grupo con núcleos que se tocan y sus bordes; el ruido queda fuera de todo grupo.',
  },
  densidad: {
    term: 'Densidad',
    what: 'Cuántos puntos hay en una zona de cierto tamaño.',
    why: 'DBSCAN llama grupo a toda zona densa conectada, tenga la forma que tenga.',
  },
  haversine: {
    term: 'Distancia haversine',
    what: 'La distancia entre dos puntos sobre la superficie de una esfera, a partir de su latitud y longitud (en radianes).',
    why: 'Con coordenadas GPS, la distancia en línea recta entre grados no sirve: un grado de longitud mide menos lejos del ecuador.',
  },
  hdbscan: {
    term: 'HDBSCAN',
    what: 'Una versión de DBSCAN que prueba todos los valores de ε a la vez y se queda con los grupos más estables.',
    why: 'Encuentra grupos de densidades distintas, donde un solo ε no sirve. Viene en scikit-learn desde la versión 1.3.',
  },
  tsneUmap: {
    term: 't-SNE y UMAP',
    what: 'Técnicas no lineales para llevar datos de muchas dimensiones a 2D o 3D conservando quién está cerca de quién.',
    why: 'Dibujan mejor que PCA los grupos curvos, pero sus ejes no significan nada y las distancias grandes no son confiables.',
  },
  grupoGlobular: {
    term: 'Grupos globulares (convexos)',
    what: 'Grupos con forma de nube redondeada, sin entrantes: la recta entre dos de sus puntos queda dentro del grupo.',
    why: 'K-Means supone grupos así y de tamaño parecido; con lunas, anillos o franjas largas los corta mal.',
  },
```

- [ ] **Step 2: Términos obligatorios**

En `src/components/ml-explorer/glossaryTerms.ts`, al final de `REQUIRED_TERMS`, justo después de la línea

```ts
  { re: 'calibra\\p{L}*', key: 'calibracion' },
```

añade:

```ts
  { re: 'clusters?|clústeres?', key: 'cluster' },
  { re: 'centroides?', key: 'centroide' },
  { re: 'inercia', key: 'inercia' },
  { re: 'silueta', key: 'silueta' },
  { re: 'método del codo', key: 'codo' },
  { re: 'k-means\\+\\+', key: 'kmeansPP' },
  { re: 'dendrogramas?', key: 'dendrograma' },
  { re: 'linkage|enlace (simple|completo|promedio)|Ward', key: 'enlace' },
  { re: 'cofenética', key: 'cofenetica' },
  { re: 'componentes? principal(es)?', key: 'componentePrincipal', alsoBy: ['pca'] },
  { re: 'varianza (explicada|retenida)', key: 'varianzaExplicada' },
  { re: 'autovectores?|autovalores?', key: 'autovector' },
  { re: 'error de reconstrucción', key: 'reconstruccion' },
  { re: 'minPts|min_samples', key: 'minPts' },
  { re: 'puntos? (núcleo|de borde)', key: 'puntoNucleo' },
  { re: 'haversine', key: 'haversine' },
  { re: 'HDBSCAN', key: 'hdbscan' },
  { re: 't-SNE|UMAP', key: 'tsneUmap' },
```

(«método del codo» y no «codo» a secas, y «puntos núcleo / de borde» y no «núcleos», porque Gradient Boosting habla de los núcleos del procesador.)

- [ ] **Step 3: Colores de grupos**

Añade al final de `src/components/ml-explorer/ovas/OvaFrame.tsx`, después de `OVA_COLORS`:

```ts
/** Colores de los grupos en las OVAs de agrupamiento (hasta 6) y del ruido. */
export const CLUSTER_COLORS = ['#55AAFF', '#FFB454', '#10b981', '#c084fc', '#f472b6', '#facc15'] as const;
export const NOISE_COLOR = '#9898b0';
```

- [ ] **Step 4: Estilos**

Añade al final de `src/components/ml-explorer/ml-explorer.css`:

```css
/* ---------- Fase 3: agrupamiento y PCA ---------- */

.mlx-ova-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* K-Means: el centroide se desliza a su nueva posición en cada paso. */
.mlx-km-centroid {
  transition: transform 0.6s ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .mlx-km-centroid {
    transition: none;
  }
}

/* Agrupamiento jerárquico: puntos y dendrograma lado a lado (uno sobre otro en móvil). */
.mlx-hc-stage {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mlx-hc-stage svg {
  flex: 1 1 220px;
  min-width: 0;
}
```

- [ ] **Step 5: Hook de animación**

Crea `src/components/ml-explorer/ovas/useMotion.ts`:

```ts
import { useEffect, useState, type RefObject } from 'react';

const REDUCE = '(prefers-reduced-motion: reduce)';

const reduceQuery = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(REDUCE) : null;

/** true si el lector pidió menos movimiento en su sistema. Se actualiza si cambia. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => reduceQuery()?.matches ?? false);
  useEffect(() => {
    const query = reduceQuery();
    if (!query) return;
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/**
 * true mientras el elemento se ve en pantalla. Sin IntersectionObserver
 * (navegadores viejos, tests) se supone visible.
 */
export function useInViewport(ref: RefObject<Element | null>): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}
```

`useInViewport` supone «visible» si no hay `IntersectionObserver` (jsdom, navegadores viejos): la animación funciona igual, solo que sin pausa. `usePrefersReducedMotion` lee `matchMedia` una vez y escucha los cambios; sin `matchMedia` (jsdom) devuelve `false`. Los tests de la Task 5 los ejercitan con dobles de prueba.

- [ ] **Step 6: Verificar**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer
node node_modules/typescript/bin/tsc --noEmit -p .
```
Expected: todo PASS (incluidos `glossaryTerms.test.ts`, cuyo test «cada clave existe en el glosario» comprueba las 18 claves nuevas); `tsc` sin errores.

- [ ] **Step 7: Commit**

```bash
git add src/components/ml-explorer/glossary.ts src/components/ml-explorer/glossaryTerms.ts src/components/ml-explorer/ml-explorer.css \
  src/components/ml-explorer/ovas/OvaFrame.tsx src/components/ml-explorer/ovas/useMotion.ts
git commit -m "feat(ml-explorer): glossary, cluster colors and motion hook for phase 3

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 4: DBSCAN

**Files:**
- Create: `src/components/ml-explorer/algorithms/python/dbscan.py`
- Create: `src/components/ml-explorer/algorithms/python/dbscan.out.txt` (generado)
- Modify: `src/components/ml-explorer/algorithms/python/outputs.test.ts`
- Create: `src/components/ml-explorer/ovas/DbscanOva.tsx`
- Create: `src/components/ml-explorer/ovas/DbscanOva.dom.test.tsx`
- Create: `src/components/ml-explorer/algorithms/dbscan.tsx`
- Modify: `src/components/ml-explorer/registry.ts`, `src/components/ml-explorer/registry.test.ts`
- Modify: `src/components/ml-explorer/MLExplorer.real.dom.test.tsx`
- Modify: `scripts/build-ml-notebook.py`; regenerar `../notebooks/algoritmos-ml.ipynb` y crear `../notebooks/algoritmos-ml/dbscan.ipynb`
- Modify: `src/data/articles/algoritmos-ml-explorador.md` (solo la description)

Historia del ejercicio: 145 reportes de huecos en la vía, generados en km alrededor de un punto de Barranquilla y convertidos a latitud y longitud: un barrio compacto (40), una avenida larga y angosta (60), un mercado (30) y 15 reportes aislados. DBSCAN con distancia haversine (en radianes) y `min_samples=5` prueba ε = 150, 300 y 800 m: con 300 m salen las 3 zonas y 13 reportes como ruido (los 13 son de los 15 aislados; los otros 2 quedan dentro de una zona). Para contrastar, K-Means con K = 3 manda 17 de los 60 reportes de la avenida a otra zona y mete los 15 aislados en algún grupo.

La OVA son dos lunas entrelazadas (`make_moons`) y 3 puntos sueltos, con sliders de ε y minPts: núcleos rellenos, bordes con anillo, ruido gris punteado y un círculo tenue de radio ε alrededor de cada núcleo. Empieza en ε = 1.0 y minPts = 4 (las 2 lunas).

- [ ] **Step 1: Fijar las cifras del ejercicio en `outputs.test.ts` (falla)**

Añade el import junto a los otros (después de `import naiveBayes from './naive-bayes.out.txt?raw';`):

```ts
import dbscan from './dbscan.out.txt?raw';
```

y dentro del `describe('cifras citadas en los textos', …)`, al final (antes del `});` que lo cierra):

```ts
  it('DBSCAN: 145 reportes; con 300 m, 3 zonas (62, 40, 30) y 13 de ruido; 150 m → 7 zonas y 32; 800 m → 2 zonas', () => {
    expect(dbscan).toContain('145 reportes');
    expect(dbscan).toContain('eps = 300 m → 3 zonas [62, 40, 30], ruido: 13');
    expect(dbscan).toContain('eps = 150 m → 7 zonas [39, 28, 13, 12, 10, 6, 5], ruido: 32');
    expect(dbscan).toContain('eps = 800 m → 2 zonas [106, 31], ruido: 8');
  });
  it('DBSCAN: K-Means con K = 3 manda 17 de 60 reportes de la avenida a otra zona; el aislado más lejano queda a 2.2 km', () => {
    expect(dbscan).toContain('K-Means (K = 3) manda 17 de los 60 reportes de la avenida a otra zona');
    expect(dbscan).toContain('mete los 15 aislados en alguna zona: el más lejano queda a 2.2 km de su centro');
  });
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: FAIL (`dbscan.out.txt` no existe).

- [ ] **Step 2: Escribir el ejercicio**

Crea `src/components/ml-explorer/algorithms/python/dbscan.py`:

```python
# Clustering geoespacial: ¿dónde se concentran los reportes de huecos en la vía?
import numpy as np
from sklearn.cluster import DBSCAN, KMeans

rng = np.random.default_rng(5)
R = 6371.0  # radio de la Tierra en km
lat0, lon0 = 10.98, -74.80  # un punto de referencia en la ciudad
km = lambda n, s: rng.normal(0, s, size=(n, 2))  # n puntos dispersos s km

# Coordenadas en km respecto al punto de referencia:
barrio = km(40, 0.15) + [1.0, 1.0]  # zona compacta
t = rng.uniform(0, 3, size=60)  # avenida: franja larga y angosta
avenida = np.c_[t - 2.0, 0.6 * t - 1.5] + km(60, 0.05)
mercado = km(30, 0.12) + [-1.5, 1.8]
sueltos = rng.uniform(-3, 3, size=(15, 2))  # reportes aislados
xy = np.vstack([barrio, avenida, mercado, sueltos])
grados = np.c_[lat0 + np.degrees(xy[:, 1] / R), lon0 + np.degrees(xy[:, 0] / (R * np.cos(np.radians(lat0))))]
print(f"{len(grados)} reportes (latitud, longitud)")

# La distancia haversine trabaja en radianes sobre la esfera: eps en metros ÷ 1000 ÷ R.
for metros in (150, 300, 800):
    db = DBSCAN(eps=metros / 1000 / R, min_samples=5, metric="haversine").fit(np.radians(grados))
    zonas = sorted(np.bincount(db.labels_[db.labels_ >= 0]).tolist(), reverse=True)
    print(f"eps = {metros:3d} m → {len(zonas)} zonas {zonas}, ruido: {np.sum(db.labels_ == -1)}")

km3 = KMeans(n_clusters=3, n_init=10, random_state=0).fit(xy)  # K-Means en km
en_avenida = km3.labels_[40:100]
partidos = np.sum(en_avenida != np.bincount(en_avenida).argmax())
lejos = np.linalg.norm(sueltos - km3.cluster_centers_[km3.labels_[-15:]], axis=1)
print(f"\nK-Means (K = 3) manda {partidos} de los 60 reportes de la avenida a otra zona")
print(f"y mete los 15 aislados en alguna zona: el más lejano queda a {lejos.max():.1f} km de su centro")
```

- [ ] **Step 3: Generar y verificar la salida**

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py --update
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
git status --short src/components/ml-explorer/algorithms/python/
```
Expected: `✓` en todos los ejercicios; `git status` muestra como nuevos solo `dbscan.py` y `dbscan.out.txt` (los `.out.txt` de las fases anteriores se regeneran idénticos). El contenido de `dbscan.out.txt` debe ser exactamente:

```text
145 reportes (latitud, longitud)
eps = 150 m → 7 zonas [39, 28, 13, 12, 10, 6, 5], ruido: 32
eps = 300 m → 3 zonas [62, 40, 30], ruido: 13
eps = 800 m → 2 zonas [106, 31], ruido: 8

K-Means (K = 3) manda 17 de los 60 reportes de la avenida a otra zona
y mete los 15 aislados en alguna zona: el más lejano queda a 2.2 km de su centro
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: PASS.

- [ ] **Step 4: Test de la OVA (falla)**

Crea `src/components/ml-explorer/ovas/DbscanOva.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DbscanOva } from './DbscanOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const sliders = () => screen.getAllByRole('slider');

describe('DbscanOva', () => {
  it('ε = 1.0 y minPts = 4: las 2 lunas y 4 puntos de ruido; ε cambia el resultado', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<DbscanOva />);
    expect(sliders()[0].getAttribute('aria-valuetext')).toBe('1.0');
    expect(status(container)).toContain('2 grupos y 4 puntos de ruido');
    expect(status(container)).toContain('Núcleos: 50 · borde: 5');
    fireEvent.change(sliders()[0], { target: { value: '0.8' } });
    expect(status(container)).toContain('4 grupos y 9 puntos de ruido');
    fireEvent.change(sliders()[0], { target: { value: '1.1' } });
    expect(status(container)).toContain('1 grupo y 3 puntos de ruido');
    fireEvent.change(sliders()[0], { target: { value: '1' } });
    fireEvent.change(sliders()[1], { target: { value: '6' } });
    expect(status(container)).toContain('4 grupos y 13 puntos de ruido');
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }));
    expect(status(container)).toContain('2 grupos y 4 puntos de ruido');
    expect(error).not.toHaveBeenCalled();
  });

  it('el svg es una imagen con 59 puntos: núcleos, borde y ruido se distinguen', () => {
    const { container } = render(<DbscanOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('.is-core')).toHaveLength(50);
    expect(svg?.querySelectorAll('.is-border')).toHaveLength(5);
    expect(svg?.querySelectorAll('.is-noise')).toHaveLength(4);
    const hint = screen.getByText(/Lo que no alcanza ningún núcleo es ruido/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });
});
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/DbscanOva.dom.test.tsx`
Expected: FAIL (`./DbscanOva` no existe).

- [ ] **Step 5: La OVA**

Crea `src/components/ml-explorer/ovas/DbscanOva.tsx`:

```tsx
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
      hint="Un punto es núcleo (relleno) si tiene al menos minPts puntos a distancia ε o menos, contándose él mismo; el círculo tenue alrededor de cada núcleo mide ε. Los núcleos que se tocan forman un grupo, y los puntos de borde (anillo) se pegan al grupo de un núcleo vecino. Lo que no alcanza ningún núcleo es ruido (gris). Con ε pequeño casi todo es ruido; con ε grande las dos lunas se funden en un solo grupo."
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
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/DbscanOva.dom.test.tsx`
Expected: PASS.

- [ ] **Step 6: El módulo del algoritmo**

Crea `src/components/ml-explorer/algorithms/dbscan.tsx`:

```tsx
import { G } from '../Gloss';
import { Tex } from '../Tex';
import { DbscanOva } from '../ovas/DbscanOva';
import type { AlgorithmModule } from '../types';
import code from './python/dbscan.py?raw';
import expectedOutput from './python/dbscan.out.txt?raw';

const dbscan: AlgorithmModule = {
  slug: 'dbscan',
  row: {
    type: 'No supervisado',
    bestUse: 'Grupos de forma arbitraria y datos con ruido',
    formula: 'Densidad: vecinos a distancia ε (mínimo minPts)',
    assumptions: 'Los grupos tienen densidad parecida',
    pros: 'Encuentra formas arbitrarias y marca el ruido',
    cons: 'Sensible a ε y minPts',
    whenNot: 'Grupos de densidades muy distintas',
    realWorld: 'Agrupamiento geoespacial, detección de anomalías',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>
              <G k="noSupervisado">No supervisado</G>:
            </b>{' '}
            los datos no traen respuesta. El algoritmo descubre los grupos (<G k="cluster">clusters</G>) solo.
          </p>
          <p>
            DBSCAN llama grupo a <b>toda zona con muchos puntos juntos</b>, tenga la forma que tenga, y deja fuera
            como <b>ruido</b> los puntos aislados. No hay que decirle cuántos grupos buscar: eso sale de la{' '}
            <G k="densidad">densidad</G> de los datos.
          </p>
          <p>
            <b>¿Cómo se evalúa sin respuestas?</b> Mirando cuántos grupos y cuánto ruido salen al mover sus dos
            parámetros, y revisando en un mapa o gráfico si tienen sentido. La <G k="silueta">silueta</G> sirve poco
            aquí: premia grupos redondos y DBSCAN existe justo para los que no lo son.
          </p>
        </>
      ),
      deepDive: (
        <p>
          DBSCAN viene de <i>Density-Based Spatial Clustering of Applications with Noise</i>: agrupamiento espacial
          basado en densidad para datos con ruido (Ester y otros, 1996). Su versión moderna,{' '}
          <G k="hdbscan">HDBSCAN</G>, prueba todas las densidades a la vez.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo cuando los grupos tienen <b>formas irregulares</b> (franjas, curvas, manchas) y hay{' '}
            <b>puntos sueltos</b> que no deberían pertenecer a ningún grupo.
          </p>
          <ul>
            <li>Encontrar zonas con muchos reportes, accidentes o pedidos en un mapa.</li>
            <li>Detectar lecturas anómalas: lo que DBSCAN marca como ruido.</li>
            <li>Separar objetos en nubes de puntos de un escáner láser (LiDAR).</li>
          </ul>
          <p className="mlx-rule">Si no sabes cuántos grupos hay y esperas ruido, prueba DBSCAN antes que K-Means.</p>
        </>
      ),
      deepDive: (
        <p>
          Con un índice espacial (árboles KD o Ball) cada búsqueda de vecinos es rápida, y DBSCAN escala a cientos
          de miles de puntos en pocas dimensiones. Con muchas <G k="feature">features</G> las distancias se
          parecen todas y la densidad pierde sentido (ver <G k="altaDimension">alta dimensionalidad</G>).
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> puntos en 0, 0.5, 1, 5 y 5.5 sobre una recta, con <G k="epsilon">ε</G> = 0.5 y{' '}
            <G k="minPts">minPts</G> = 3. El 0.5 tiene 3 vecinos a 0.5 o menos (el 0, el 1 y él mismo): es un punto
            núcleo. El 0 y el 1 tienen solo 2, pero son vecinos del 0.5: son borde y entran a su grupo. El 5 y el
            5.5 tienen 2 cada uno y ningún núcleo cerca: son ruido.
          </p>
          <p>Las reglas, para cada punto p:</p>
          <Tex block>{'N_\\varepsilon(p) = \\{\\, q : d(p, q) \\le \\varepsilon \\,\\}, \\qquad p \\text{ es núcleo si } |N_\\varepsilon(p)| \\ge \\text{minPts}'}</Tex>
          <p>
            Dos núcleos vecinos van al mismo grupo, y así se encadena todo el grupo. Un punto que no es núcleo pero
            está en el vecindario de uno es <G k="puntoNucleo">punto de borde</G>; el resto es ruido.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Cada grupo es un conjunto maximal de puntos conectados por densidad. Los núcleos y el ruido no dependen del
          orden de los datos; un punto de borde vecino de dos grupos se queda con el primero que lo alcanza. En
          scikit-learn, <code>min_samples</code> cuenta el propio punto, como en el ejemplo. El costo es de una
          búsqueda de vecinos por punto: en total, del orden de <Tex>{'n \\log n'}</Tex> con índice espacial y ε pequeño,
          y de <Tex>{'n^2'}</Tex> sin él.
        </p>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que <b>todos los grupos tienen una <G k="densidad">densidad</G> parecida</b>: un solo{' '}
            <G k="epsilon">ε</G> debe servir para todos. Si un grupo es muy apretado y otro muy disperso, el ε que
            encuentra al disperso funde a los apretados con sus vecinos.
          </p>
          <p>
            Como todo método de distancias, también supone <G k="feature">features</G> en escalas comparables y una
            distancia con sentido. En el ejercicio se usa la <G k="haversine">distancia haversine</G>, que mide
            sobre la Tierra a partir de latitud y longitud.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Para elegir ε se suele ordenar la distancia de cada punto a su k-ésimo vecino (k = minPts) y buscar el
          codo de esa curva. Para <G k="minPts">minPts</G>, una regla común es el doble del número de features
          (4 en un mapa).
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Formas libres:</b> en el simulador, con <G k="epsilon">ε</G> = 1.0 encuentra las dos lunas
            entrelazadas, que K-Means cortaría con una recta.
          </li>
          <li>
            <b>Marca el ruido:</b> en el ejercicio, con ε = 300 m deja 13 reportes como ruido en vez de meterlos a la
            fuerza en una zona.
          </li>
          <li>
            <b>No hay que elegir cuántos grupos:</b> salen de los datos.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Lo que marca como ruido sirve como detector de anomalías sin entrenar nada más. Los{' '}
          <G k="outlier">outliers</G> no deforman los grupos, como sí pasa con los promedios de K-Means.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Sensible a <G k="epsilon">ε</G>:</b> en el simulador, con ε = 0.8 las dos lunas salen partidas en 4
            grupos; con 1.1 se funden en 1.
          </li>
          <li>
            <b>Sensible a <G k="minPts">minPts</G>:</b> con ε = 1.0, subir minPts de 4 a 6 pasa de 2 grupos y 4
            puntos de ruido a 4 grupos y 13 de ruido.
          </li>
          <li>
            <b>Un solo ε para todo:</b> falla si los grupos tienen <G k="densidad">densidades</G> muy distintas.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          En el ejercicio pasa lo mismo a escala de ciudad: con 150 m salen 7 zonas y 32 reportes quedan como ruido;
          con 800 m quedan solo 2 zonas, porque dos de las tres se funden. <G k="hdbscan">HDBSCAN</G> evita elegir ε y
          maneja densidades distintas.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses si los grupos tienen densidades muy distintas.</p>
          <p>
            Ejemplo: tiendas en el centro de una ciudad (muy juntas) y en pueblos cercanos (dispersas). Un ε pequeño
            deja los pueblos como ruido; uno grande junta todo el centro en un solo grupo. Ningún valor encuentra
            ambos.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Tampoco conviene con muchas <G k="feature">features</G> (las distancias pierden contraste) ni cuando
          necesitas que cada punto quede en algún grupo: ahí sirve K-Means o el agrupamiento jerárquico. Para
          densidades distintas, <G k="hdbscan">HDBSCAN</G>.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Agrupamiento geoespacial.</b> Con coordenadas GPS se encuentran zonas de alta concentración (puntos
            críticos de accidentes, de pedidos, de reportes) sin fijar su número ni su forma.
          </p>
          <p>
            El ejercicio simula 145 reportes de huecos en la vía: un barrio, una avenida larga, un mercado y reportes
            aislados. Con la <G k="haversine">distancia haversine</G>, <G k="epsilon">ε</G> = 300 m y{' '}
            <G k="minPts">minPts</G> = 5, encuentra 3 zonas (62, 40 y 30 reportes) y deja 13 como ruido.
          </p>
          <p>
            K-Means con K = 3, en cambio, manda 17 de los 60 reportes de la avenida a otra zona y mete los 15
            aislados en algún grupo.
          </p>
        </>
      ),
      deepDive: (
        <p>
          La distancia haversine trabaja en radianes, así que ε también: 300 m son 0.3 / 6371 radianes (6371 km es el
          radio de la Tierra). Con millones de puntos se usa un índice espacial o se agrupa primero por cuadrículas.
        </p>
      ),
    },
  },
  Ova: DbscanOva,
  python: { code, expectedOutput, colabNotebook: 'dbscan' },
  inYourField: [
    { area: 'Civil', example: 'encontrar tramos de vía con muchos accidentes a partir de las coordenadas de cada reporte.' },
    { area: 'Eléctrica', example: 'separar lecturas anómalas de un medidor (ruido) de los patrones normales de consumo.' },
    { area: 'Topográfica', example: 'separar objetos (árboles, postes, edificios) en una nube de puntos de un escáner láser.' },
  ],
  alternatives: ['hierarchical-clustering', 'k-means'],
};

export default dbscan;
```

- [ ] **Step 7: Registrar el loader**

En `registry.ts`, dentro de `LOADERS`, justo después de

```ts
  'naive-bayes': () => import('./algorithms/naive-bayes'),
```

añade (el orden de `LOADERS` no afecta al menú, pero así sigue el orden del menú):

```ts
  dbscan: () => import('./algorithms/dbscan'),
```

y en `registry.test.ts`, el test «marca como disponibles solo los algoritmos implementados» pasa a esperar:

```ts
    expect(AVAILABLE_SLUGS).toEqual([
      'linear-regression',
      'logistic-regression',
      'decision-tree',
      'random-forest',
      'gradient-boosting',
      'svm',
      'knn',
      'naive-bayes',
      'dbscan',
    ]);
```

- [ ] **Step 8: Recorrido con el módulo real**

Añade al final de `src/components/ml-explorer/MLExplorer.real.dom.test.tsx`:

```tsx
it('DBSCAN real (?alg=dbscan): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=dbscan']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'DBSCAN' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'formula') {
      expect(container.querySelector('.mlx-tabpanel svg[role="img"]')).not.toBeNull();
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('2 grupos y 4 puntos de ruido');
      expect(container.querySelector('.katex')).not.toBeNull();
    }
  }

  expect(error).not.toHaveBeenCalled();
});
```

- [ ] **Step 9: Notebook de Colab**

En `scripts/build-ml-notebook.py`, dentro de `ALGORITHMS` (mismo orden que el menú), añade justo después de la tupla de `"naive-bayes"`:

```python
    (
        "dbscan",
        "DBSCAN (agrupamiento por densidad)",
        "Reportes de huecos en un mapa: zonas de forma libre y puntos aislados como ruido.",
    ),
```

```bash
python3 scripts/build-ml-notebook.py
```
Expected: `Escrito notebooks/algoritmos-ml.ipynb y 9 notebooks individuales`.

- [ ] **Step 10: Description del artículo**

En `src/data/articles/algoritmos-ml-explorador.md`, en la línea `description:`, cambia «Los primeros ocho ya están completos» por «Los primeros nueve ya están completos» (lo exige `algoritmos-ml-explorador.links.test.ts`).

- [ ] **Step 11: Verificación completa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
node scripts/check-ml-exercises-pyodide.mjs
```
Expected: todos los tests pasan (incluidos `registry.test.ts`, que comprueba que las alternativas de `dbscan` existen; `notebook.test.ts`, que compara los notebooks con el `.py`; `glossaryTerms.test.ts`, `glossaryDensity.test.ts`, `textSpacing.test.ts` y `render.test.ts` sobre los textos nuevos; y `algoritmos-ml-explorador.links.test.ts`); `tsc` sin errores; `✓ dbscan.py (Pyodide)` y los demás también.

Revisión manual con el servidor de desarrollo (`ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js`), en `#/articles/algoritmos-ml-explorador?alg=dbscan&tab=formula`: la OVA responde al teclado (Tab hasta los controles, flechas en los sliders, Enter/Espacio en los botones), las cifras iniciales coinciden con la tabla «Cifras clave», las fichas 💡 abren, y en «Ejemplo real» «▶ Ejecutar» da la misma salida que la esperada.

- [ ] **Step 12: Commit**

```bash
git add src/components/ml-explorer/algorithms/python/dbscan.py src/components/ml-explorer/algorithms/python/dbscan.out.txt \
  src/components/ml-explorer/algorithms/python/outputs.test.ts \
  src/components/ml-explorer/ovas/DbscanOva.tsx src/components/ml-explorer/ovas/DbscanOva.dom.test.tsx \
  src/components/ml-explorer/algorithms/dbscan.tsx src/components/ml-explorer/registry.ts src/components/ml-explorer/registry.test.ts \
  src/components/ml-explorer/MLExplorer.real.dom.test.tsx scripts/build-ml-notebook.py ../notebooks/algoritmos-ml.ipynb ../notebooks/algoritmos-ml/dbscan.ipynb \
  src/data/articles/algoritmos-ml-explorador.md
git commit -m "feat(ml-explorer): add DBSCAN with its simulator and exercise

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: K-Means

**Files:**
- Create: `src/components/ml-explorer/algorithms/python/k-means.py`
- Create: `src/components/ml-explorer/algorithms/python/k-means.out.txt` (generado)
- Modify: `src/components/ml-explorer/algorithms/python/outputs.test.ts`
- Create: `src/components/ml-explorer/ovas/KMeansOva.tsx`
- Create: `src/components/ml-explorer/ovas/KMeansOva.dom.test.tsx`
- Create: `src/components/ml-explorer/algorithms/k-means.tsx`
- Modify: `src/components/ml-explorer/registry.ts`, `src/components/ml-explorer/registry.test.ts`
- Modify: `src/components/ml-explorer/MLExplorer.real.dom.test.tsx`
- Modify: `scripts/build-ml-notebook.py`; regenerar `../notebooks/algoritmos-ml.ipynb` y crear `../notebooks/algoritmos-ml/k-means.ipynb`
- Modify: `src/data/articles/algoritmos-ml-explorador.md` (solo la description)
- Modify: `src/components/ml-explorer/render.test.ts`

Historia del ejercicio: 300 clientes simulados con dos features (gasto mensual en miles de pesos y visitas al mes) a partir de tres perfiles, sin etiquetas. Se escalan con `StandardScaler` y se prueba K de 1 a 6 con `KMeans(n_init=10, random_state=0)`: la inercia cae de 600.0 a 39.5 hasta K = 3 y luego apenas baja; la silueta es máxima en K = 3 (0.79). Con K = 3 se imprimen los tres segmentos ordenados por gasto (`np.argsort(…, kind="stable")`).

La OVA es la única animada de la fase: 24 puntos sin etiqueta, slider de K (1 a 6), dos arranques (A y B, semillas 11 y 12 de `mulberry32`) y los botones «Paso ▸», «▶ Reproducir / ⏸ Pausar» y «Restablecer». Cada paso mueve los centroides al promedio de sus puntos y reasigna; al converger muestra la silueta. Con el arranque B y K = 3 se atasca en un mínimo local (inercia 8 veces mayor). Reproducir avanza cada 900 ms solo si la OVA está en pantalla, y con «reducir movimiento» salta al final.

- [ ] **Step 1: Fijar las cifras del ejercicio en `outputs.test.ts` (falla)**

Añade el import junto a los otros (después de `import naiveBayes from './naive-bayes.out.txt?raw';`):

```ts
import kMeans from './k-means.out.txt?raw';
```

y dentro del `describe('cifras citadas en los textos', …)`, al final (antes del `});` que lo cierra):

```ts
  it('K-Means: la inercia cae de 600.0 a 250.0 y a 39.5 hasta K = 3 y luego apenas baja; la silueta es máxima en K = 3 (0.79)', () => {
    expect(kMeans).toMatch(/^1 \|\s+600\.0 \|\s+—$/m);
    expect(kMeans).toMatch(/^2 \|\s+250\.0 \| 0\.60$/m);
    expect(kMeans).toMatch(/^3 \|\s+39\.5 \| 0\.79$/m);
    expect(kMeans).toMatch(/^4 \|\s+33\.8 \| 0\.64$/m);
    const sil = [...kMeans.matchAll(/^\d \|\s+[\d.]+ \| (0\.\d\d)$/gm)].map((m) => Number(m[1]));
    expect(sil).toEqual([0.6, 0.79, 0.64, 0.49, 0.33]);
    expect(Math.max(...sil)).toBe(0.79);
  });
  it('K-Means: tres segmentos de 100 clientes (114 mil y 1.9 visitas, 301 mil y 11.5, 447 mil y 3.9)', () => {
    expect(kMeans).toContain('100 clientes | gasto 114 mil |  1.9 visitas al mes');
    expect(kMeans).toContain('100 clientes | gasto 301 mil | 11.5 visitas al mes');
    expect(kMeans).toContain('100 clientes | gasto 447 mil |  3.9 visitas al mes');
  });
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: FAIL (`k-means.out.txt` no existe).

- [ ] **Step 2: Escribir el ejercicio**

Crea `src/components/ml-explorer/algorithms/python/k-means.py`:

```python
# Segmentación de clientes: K-Means arma grupos sin que nadie le diga cuáles
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(7)
# 300 clientes: gasto mensual (miles de pesos) y visitas al mes. Sin etiquetas:
# los datos no dicen a qué grupo pertenece cada cliente.
perfiles = [(120, 2), (450, 4), (300, 12)]
X = np.vstack([rng.normal(p, (40, 1.2), size=(100, 2)) for p in perfiles])
Xs = StandardScaler().fit_transform(X)  # sin escalar, el gasto taparía las visitas

print("K | inercia | silueta")
for k in range(1, 7):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(Xs)
    silueta = f"{silhouette_score(Xs, km.labels_):.2f}" if k > 1 else "  —"
    print(f"{k} | {km.inertia_:7.1f} | {silueta}")

km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(Xs)
print("\nSegmentos con K = 3 (de menor a mayor gasto):")
for c in np.argsort([X[km.labels_ == c, 0].mean() for c in range(3)], kind="stable"):
    grupo = X[km.labels_ == c]
    gasto, visitas = grupo.mean(axis=0)
    print(f"  {len(grupo):3d} clientes | gasto {gasto:3.0f} mil | {visitas:4.1f} visitas al mes")
```

- [ ] **Step 3: Generar y verificar la salida**

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py --update
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
git status --short src/components/ml-explorer/algorithms/python/
```
Expected: `✓` en todos los ejercicios; `git status` muestra como nuevos solo `k-means.py` y `k-means.out.txt` (los `.out.txt` de las fases anteriores se regeneran idénticos). El contenido de `k-means.out.txt` debe ser exactamente:

```text
K | inercia | silueta
1 |   600.0 |   —
2 |   250.0 | 0.60
3 |    39.5 | 0.79
4 |    33.8 | 0.64
5 |    29.0 | 0.49
6 |    24.8 | 0.33

Segmentos con K = 3 (de menor a mayor gasto):
  100 clientes | gasto 114 mil |  1.9 visitas al mes
  100 clientes | gasto 301 mil | 11.5 visitas al mes
  100 clientes | gasto 447 mil |  3.9 visitas al mes
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: PASS.

- [ ] **Step 4: Test de la OVA (falla)**

Crea `src/components/ml-explorer/ovas/KMeansOva.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KM_STEP_MS, KMeansOva } from './KMeansOva';

/** IntersectionObserver falso: `setVisible` simula que la OVA entra o sale de la pantalla. */
let observerCallback: ((entries: { isIntersecting: boolean }[]) => void) | null = null;
const setVisible = (isIntersecting: boolean) => act(() => observerCallback?.([{ isIntersecting }]));

function mockReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: query.includes('reduce') && matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  observerCallback = null;
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
        observerCallback = cb;
      }
      observe() {}
      disconnect() {}
    },
  );
  mockReducedMotion(false);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const button = (name: string | RegExp) => screen.getByRole('button', { name });

describe('KMeansOva', () => {
  it('arranque A con K = 3: paso a paso, la inercia baja de 294.05 a 15.18 en 6 pasos', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<KMeansOva />);
    expect(status(container)).toContain('Paso 0 de 6');
    expect(status(container)).toContain('Inercia: 294.05');
    expect(status(container)).not.toContain('Convergió');
    for (let i = 0; i < 6; i++) fireEvent.click(button('Paso ▸'));
    expect(status(container)).toContain('Paso 6 de 6');
    expect(status(container)).toContain('Inercia: 15.18');
    expect(status(container)).toContain('Convergió: ningún punto cambió de grupo.');
    expect(status(container)).toContain('Silueta: 0.75');
    expect((button('Paso ▸') as HTMLButtonElement).disabled).toBe(true);
    expect(error).not.toHaveBeenCalled();
  });

  it('arranque B se atasca en 123.31 con silueta 0.18', () => {
    const { container } = render(<KMeansOva />);
    fireEvent.click(button('B'));
    expect(button('B').getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(button('Paso ▸'));
    fireEvent.click(button('Paso ▸'));
    expect(status(container)).toContain('Paso 2 de 2');
    expect(status(container)).toContain('Inercia: 123.31');
    expect(status(container)).toContain('Silueta: 0.18');
  });

  it('el slider de K reinicia; con K = 1 no muestra silueta', () => {
    const { container } = render(<KMeansOva />);
    fireEvent.click(button('Paso ▸'));
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1' } });
    expect(status(container)).toContain('Paso 0 de 1');
    fireEvent.click(button('Paso ▸'));
    expect(status(container)).toContain('Inercia: 209.39');
    expect(status(container)).not.toContain('Silueta');
    expect(container.querySelectorAll('.mlx-km-centroid')).toHaveLength(1);
  });

  it('Reproducir avanza un paso cada KM_STEP_MS y se detiene al converger', () => {
    vi.useFakeTimers();
    const { container } = render(<KMeansOva />);
    fireEvent.click(button('▶ Reproducir'));
    expect(button('⏸ Pausar').getAttribute('aria-pressed')).toBe('true');
    act(() => vi.advanceTimersByTime(KM_STEP_MS));
    expect(status(container)).toContain('Paso 1 de 6');
    for (let i = 0; i < 6; i++) act(() => vi.advanceTimersByTime(KM_STEP_MS));
    expect(status(container)).toContain('Paso 6 de 6');
    expect(button('▶ Reproducir').getAttribute('aria-pressed')).toBe('false');
  });

  it('fuera de la pantalla la animación se pausa y sigue al volver', () => {
    vi.useFakeTimers();
    const { container } = render(<KMeansOva />);
    fireEvent.click(button('▶ Reproducir'));
    setVisible(false);
    act(() => vi.advanceTimersByTime(KM_STEP_MS * 3));
    expect(status(container)).toContain('Paso 0 de 6');
    setVisible(true);
    act(() => vi.advanceTimersByTime(KM_STEP_MS));
    expect(status(container)).toContain('Paso 1 de 6');
  });

  it('con «reducir movimiento», Reproducir salta al resultado final sin animar', () => {
    mockReducedMotion(true);
    vi.useFakeTimers();
    const { container } = render(<KMeansOva />);
    fireEvent.click(button('▶ Reproducir'));
    expect(status(container)).toContain('Paso 6 de 6');
    expect(status(container)).toContain('Inercia: 15.18');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('el svg es una imagen con 24 puntos y 3 centroides; el hint va fuera del readout', () => {
    const { container } = render(<KMeansOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('circle')).toHaveLength(24);
    expect(svg?.querySelectorAll('.mlx-km-centroid')).toHaveLength(3);
    const hint = screen.getByText(/se atasca en una solución peor/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });
});
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/KMeansOva.dom.test.tsx`
Expected: FAIL (`./KMeansOva` no existe).

- [ ] **Step 5: La OVA**

Crea `src/components/ml-explorer/ovas/KMeansOva.tsx`:

```tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { KM_MAX_K, KM_POINTS as POINTS, KM_START_K, KM_STARTS } from './datasets';
import { CLUSTER_COLORS, OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { kmeansRun, mulberry32, randomInit, silhouette } from './ovaMath';
import { createPlot } from './plot';
import { useInViewport, usePrefersReducedMotion } from './useMotion';

const PLOT = createPlot(320, 320, 24, [0, 10], [0, 10]);
/** Tiempo entre pasos al reproducir. */
export const KM_STEP_MS = 900;

export function KMeansOva() {
  const [k, setK] = useState(KM_START_K);
  const [start, setStart] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();

  const run = useMemo(() => kmeansRun(POINTS, randomInit(POINTS, k, mulberry32(KM_STARTS[start].seed))), [k, start]);
  const last = run.length - 1;
  const state = run[Math.min(step, last)];
  const done = step >= last;

  // Avanza un paso cada KM_STEP_MS, solo mientras la OVA está en pantalla.
  useEffect(() => {
    if (!playing || !visible) return;
    if (done) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setStep((s) => s + 1), KM_STEP_MS);
    return () => window.clearTimeout(id);
  }, [playing, visible, done, step]);

  const reset = (nextK = k, nextStart = start) => {
    setK(nextK);
    setStart(nextStart);
    setStep(0);
    setPlaying(false);
  };

  const togglePlay = () => {
    if (playing) return setPlaying(false);
    // Con «reducir movimiento», nada de animación: salta al resultado final.
    if (reducedMotion) return setStep(last);
    if (done) setStep(0);
    setPlaying(true);
  };

  return (
    <OvaFrame
      title="Centroides que se mueven solos"
      hint="Los puntos no traen etiqueta: K-Means los reparte en K grupos. Cada paso hace dos cosas: asigna cada punto al centroide (la cruz) más cercano y mueve cada centroide al promedio de sus puntos. Pulsa «Paso» o «Reproducir» hasta que ningún punto cambie de grupo. Luego prueba el arranque B con K = 3: los centroides empiezan en otros puntos y el algoritmo se atasca en una solución peor (inercia mucho más alta). Por eso conviene repetir el arranque varias veces (n_init en scikit-learn) y quedarse con el de menor inercia."
      controls={
        <>
          <OvaSlider label="K (número de grupos)" value={k} min={1} max={KM_MAX_K} step={1} onChange={(v) => reset(v)} />
          <div role="group" aria-label="Arranque">
            <span>Arranque: </span>
            {KM_STARTS.map((s, i) => (
              <button key={s.id} type="button" aria-pressed={start === i} onClick={() => reset(k, i)}>
                {s.id}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Iteraciones">
            <button type="button" disabled={done} onClick={() => setStep((s) => s + 1)}>
              Paso ▸
            </button>
            <button type="button" aria-pressed={playing} onClick={togglePlay}>
              {playing ? '⏸ Pausar' : '▶ Reproducir'}
            </button>
            <button type="button" onClick={() => reset(KM_START_K, 0)}>
              Restablecer
            </button>
          </div>
        </>
      }
      readout={
        <>
          <span>
            Paso <b>{Math.min(step, last)}</b> de <b>{last}</b>
          </span>
          <span>
            Inercia: <b>{state.inertia.toFixed(2)}</b>
          </span>
          {done && <span>Convergió: ningún punto cambió de grupo.</span>}
          {done && k > 1 && (
            <span>
              Silueta: <b>{silhouette(POINTS, state.labels).toFixed(2)}</b>
            </span>
          )}
        </>
      }
    >
      <div ref={stageRef}>
        <svg
          viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
          role="img"
          aria-label="Puntos sin etiqueta coloreados según el centroide más cercano, y los centroides marcados con una cruz"
        >
          {POINTS.map((p, i) => {
            const c = state.centroids[state.labels[i]];
            return (
              <line
                key={`l${i}`}
                className="mlx-km-link"
                x1={PLOT.sx(p.x)}
                y1={PLOT.sy(p.y)}
                x2={PLOT.sx(c.x)}
                y2={PLOT.sy(c.y)}
                stroke={CLUSTER_COLORS[state.labels[i]]}
                strokeOpacity={0.3}
              />
            );
          })}
          {POINTS.map((p, i) => (
            <circle
              key={i}
              cx={PLOT.sx(p.x)}
              cy={PLOT.sy(p.y)}
              r={6}
              fill={CLUSTER_COLORS[state.labels[i]]}
              stroke="#040320"
              strokeWidth={1.5}
            />
          ))}
          {state.centroids.map((c, j) => (
            <g key={`c${j}`} className="mlx-km-centroid" style={{ transform: `translate(${PLOT.sx(c.x)}px, ${PLOT.sy(c.y)}px)` }}>
              <path d="M-8 -8 L8 8 M-8 8 L8 -8" stroke="#040320" strokeWidth={6} />
              <path d="M-8 -8 L8 8 M-8 8 L8 -8" stroke={CLUSTER_COLORS[j]} strokeWidth={3} />
            </g>
          ))}
          <text x={PLOT.sx(10)} y={PLOT.height - 6} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
            gasto →
          </text>
          <text x={PLOT.sx(0)} y={14} fontSize={11} fill={OVA_COLORS.axis}>
            ↑ visitas
          </text>
        </svg>
      </div>
    </OvaFrame>
  );
}
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/KMeansOva.dom.test.tsx`
Expected: PASS.

- [ ] **Step 6: El módulo del algoritmo**

Crea `src/components/ml-explorer/algorithms/k-means.tsx`:

```tsx
import { G } from '../Gloss';
import { Tex } from '../Tex';
import { KMeansOva } from '../ovas/KMeansOva';
import type { AlgorithmModule } from '../types';
import code from './python/k-means.py?raw';
import expectedOutput from './python/k-means.out.txt?raw';

const kMeans: AlgorithmModule = {
  slug: 'k-means',
  row: {
    type: 'No supervisado',
    bestUse: 'Segmentación de clientes',
    formula: 'Minimizar la varianza dentro de cada grupo',
    assumptions: 'Grupos esféricos y de tamaño parecido',
    pros: 'Simple y rápido',
    cons: 'Hay que elegir K; sensible a outliers',
    whenNot: 'Grupos con formas no esféricas',
    realWorld: 'Segmentación de mercado',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>
              <G k="noSupervisado">No supervisado</G>:
            </b>{' '}
            los datos <b>no traen respuesta</b>. Nadie le dice al algoritmo a qué grupo pertenece cada cliente; tiene
            que descubrir los grupos (<G k="cluster">clusters</G>) solo, a partir de qué tan parecidos son.
          </p>
          <p>
            K-Means reparte los datos en <b>K grupos</b>, con K elegido por ti. Cada grupo queda representado por su{' '}
            <G k="centroide">centroide</G>, el punto promedio de sus miembros.
          </p>
          <p>
            <b>¿Cómo se evalúa sin respuestas?</b> No hay «acierto» que medir. Se mira qué tan apretados quedan los
            grupos (la <G k="inercia">inercia</G>) y qué tan separados están entre sí (la <G k="silueta">silueta</G>).
            Ninguna de las dos dice si los grupos sirven para tu negocio: eso lo decide alguien que conozca los datos.
          </p>
        </>
      ),
      deepDive: (
        <p>
          La inercia siempre baja al subir K (con K igual al número de puntos vale 0), así que no sirve sola para
          elegir K: se busca el punto donde deja de bajar mucho, el <G k="codo">método del codo</G>. La silueta sí
          puede empeorar con K de más. En el ejercicio, ambas apuntan a K = 3; con datos reales muchas veces no hay
          un codo claro.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo para <b>dividir muchos datos en grupos compactos</b> cuando tienes una idea de cuántos grupos buscas.
          </p>
          <ul>
            <li>Segmentar clientes por gasto y frecuencia de compra.</li>
            <li>Agrupar documentos o productos parecidos para recomendarlos juntos.</li>
            <li>Reducir los colores de una imagen a K colores representativos.</li>
          </ul>
          <p className="mlx-rule">
            Si buscas grupos redondeados y puedes proponer un K, empieza por K-Means: es el más rápido.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Cada paso cuesta del orden de n × K × d operaciones (puntos × grupos × <G k="feature">features</G>), así que
          escala a millones de filas. Con datos que no caben en memoria, <code>MiniBatchKMeans</code> actualiza los{' '}
          <G k="centroide">centroides</G> con lotes pequeños.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> cuatro clientes con gasto 1, 2, 9 y 10, y K = 2. Los <G k="centroide">centroides</G>{' '}
            arrancan en 1 y en 2. Al arrancar, cada cliente va al centroide más cercano: el 1 queda solo y el 2, el 9 y
            el 10 van juntos. Paso 1: cada centroide se mueve al promedio de su grupo (1 y 7) y se reasigna; ahora el 2
            está más cerca del 1, y los grupos quedan {'{1, 2}'} y {'{9, 10}'}. Paso 2: los centroides se mueven a 1.5
            y 9.5, nadie cambia de grupo y el algoritmo para.
          </p>
          <p>
            Lo que minimiza es la <G k="inercia">inercia</G>: la suma de las distancias al cuadrado de cada punto a su
            centroide. Al final del ejemplo vale 0.25 × 4 = 1.
          </p>
          <Tex block>{'J = \\sum_{i=1}^{n} \\lVert x_i - \\mu_{c(i)} \\rVert^2'}</Tex>
          <p>
            <Tex>{'x_i'}</Tex> es cada punto, <Tex>{'c(i)'}</Tex> el grupo al que lo asignaste y{' '}
            <Tex>{'\\mu_{c(i)}'}</Tex> el centroide de ese grupo. El simulador muestra los dos pasos que se repiten:
            asignar y mover.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Es el algoritmo de Lloyd. Cada paso no puede subir <Tex>{'J'}</Tex>: asignar al centroide más cercano lo
            baja o lo deja igual, y el promedio es el punto que minimiza la suma de distancias al cuadrado de un grupo.
            Como hay un número finito de formas de repartir los puntos, siempre termina.
          </p>
          <p>
            Pero termina en un <G k="minimoLocal">mínimo local</G>, que depende del arranque. En el simulador, con K = 3
            el arranque A baja la inercia de 294.05 a 15.18 en 6 pasos; el B se atasca en 123.31, 8 veces peor.
            scikit-learn elige los centroides iniciales con <G k="kmeansPP">k-means++</G>, que los reparte lejos
            entre sí, y con <code>n_init=10</code> (como en el ejercicio) repite 10 arranques y se queda con la menor
            inercia. Ojo: desde la versión 1.4 el valor por defecto es <code>n_init="auto"</code>, que con k-means++
            hace un solo arranque.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone <b>grupos redondeados y de tamaño parecido</b>: cada punto va al <G k="centroide">centroide</G> más cercano, así que la
            frontera entre dos grupos es siempre una recta a mitad de camino. Si los grupos son lunas, anillos o franjas
            largas, los corta mal (ver <G k="grupoGlobular">grupos globulares</G>).
          </p>
          <p>
            También supone <b>que la distancia tiene sentido</b>: todas las <G k="feature">features</G> deben estar en
            escalas comparables. En el ejercicio el gasto está en cientos de miles de pesos y las visitas en unidades; sin{' '}
            <G k="escalado">escalarlas</G>, el gasto taparía a las visitas.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Minimizar la <G k="inercia">inercia</G> es, en el fondo, suponer que cada grupo es una nube redonda con la misma dispersión en
          todas las direcciones. Si los grupos son elipses alargadas o de tamaños muy distintos, un modelo de
          mezcla gaussiana (<code>GaussianMixture</code>) los describe mejor.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Simple:</b> dos pasos que se repiten (asignar y mover) y un resultado fácil de explicar: cada grupo es su
            promedio.
          </li>
          <li>
            <b>Rápido:</b> escala a millones de puntos.
          </li>
          <li>
            <b>Grupos fáciles de describir:</b> en el ejercicio, cada <G k="centroide">centroide</G> se lee como un
            perfil de cliente (gasto 447 mil y 3.9 visitas al mes: compra poco pero caro).
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Los centroides sirven luego como resumen: para asignar un cliente nuevo basta calcular su distancia a K
          puntos. También se usa como paso previo de otros modelos, por ejemplo para crear una{' '}
          <G k="feature">feature</G> «segmento».
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Hay que elegir K:</b> el algoritmo da K grupos aunque los datos no los tengan. La{' '}
            <G k="inercia">inercia</G> y la <G k="silueta">silueta</G> ayudan, pero no deciden por ti.
          </li>
          <li>
            <b>Depende del arranque:</b> en el simulador, el arranque B termina con una inercia 8 veces mayor que el A.
          </li>
          <li>
            <b>Sensible a <G k="outlier">outliers</G>:</b> un punto muy lejano arrastra el promedio de su grupo y
            puede quedarse con un <G k="centroide">centroide</G> para él solo.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Contra el arranque: <G k="kmeansPP">k-means++</G> y varios arranques (<code>n_init</code>). Contra los
          outliers: quitarlos antes o usar K-Medoids (en la biblioteca scikit-learn-extra), que usa como centro un punto
          real del grupo, el que tiene menor distancia total a los demás, en vez del promedio. Para elegir K se comparan la <G k="silueta">silueta</G> y el{' '}
          <G k="codo">método del codo</G> con lo que tiene sentido para el negocio.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses si los grupos tienen formas alargadas, curvas o densidades muy distintas.</p>
          <p>
            Ejemplo: reportes de huecos concentrados a lo largo de una avenida. En el ejercicio de DBSCAN, K-Means con K
            = 3 manda 17 de los 60 reportes de la avenida al grupo de un barrio vecino y mete los 15 reportes aislados
            en alguna zona (el más lejano, a 2.2 km de su centro). DBSCAN sigue la forma de la franja y deja los
            aislados como ruido.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Tampoco conviene con <G k="feature">features</G> categóricas (el promedio de «Bogotá» y «Cali» no existe; para eso
          está K-Modes) ni cuando quieres ver grupos dentro de grupos: ahí el agrupamiento jerárquico muestra todos
          los niveles a la vez.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Segmentación de mercado.</b> Las empresas agrupan a sus clientes por gasto, frecuencia y antigüedad para
            diseñar una campaña por segmento en vez de una para todos.
          </p>
          <p>
            El ejercicio simula 300 clientes con dos <G k="feature">features</G> (gasto mensual y visitas al mes),
            las <G k="escalado">escala</G> y prueba K de 1 a 6. La <G k="inercia">inercia</G> cae de 600.0 a 250.0
            y a 39.5 hasta K = 3, y después apenas baja (33.8 con K = 4).
          </p>
          <p>
            La <G k="silueta">silueta</G> es máxima con K = 3 (0.79). Los tres segmentos: gasto bajo y pocas visitas
            (114 mil, 1.9 al mes), muchas visitas con gasto medio (301 mil, 11.5) y pocas visitas con gasto alto (447 mil, 3.9).
          </p>
        </>
      ),
      deepDive: (
        <p>
          En producción se suelen usar más features (antigüedad, categorías compradas, canal), escaladas, y se
          revisa que los segmentos sean estables: si al volver a entrenar el mes siguiente los grupos cambian mucho,
          no sirven para planear. Aquí los grupos salen tan limpios porque los datos se generaron con tres perfiles;
          con clientes reales la silueta suele ser bastante más baja.
        </p>
      ),
    },
  },
  Ova: KMeansOva,
  python: { code, expectedOutput, colabNotebook: 'k-means' },
  inYourField: [
    { area: 'Eléctrica', example: 'agrupar las curvas de consumo diario de los usuarios para diseñar tarifas por perfil.' },
    { area: 'Industrial', example: 'agrupar productos por volumen y frecuencia de pedido para organizar la bodega.' },
    { area: 'Civil', example: 'agrupar estaciones de medición de tráfico con patrones horarios parecidos.' },
  ],
  alternatives: ['dbscan', 'hierarchical-clustering'],
};

export default kMeans;
```

- [ ] **Step 7: Registrar el loader**

En `registry.ts`, dentro de `LOADERS`, justo después de

```ts
  'naive-bayes': () => import('./algorithms/naive-bayes'),
```

añade (el orden de `LOADERS` no afecta al menú, pero así sigue el orden del menú):

```ts
  'k-means': () => import('./algorithms/k-means'),
```

y en `registry.test.ts`, el test «marca como disponibles solo los algoritmos implementados» pasa a esperar:

```ts
    expect(AVAILABLE_SLUGS).toEqual([
      'linear-regression',
      'logistic-regression',
      'decision-tree',
      'random-forest',
      'gradient-boosting',
      'svm',
      'knn',
      'naive-bayes',
      'k-means',
      'dbscan',
    ]);
```

- [ ] **Step 8: Recorrido con el módulo real**

Añade al final de `src/components/ml-explorer/MLExplorer.real.dom.test.tsx`:

```tsx
it('K-Means real (?alg=k-means): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=k-means']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'K-Means' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'formula') {
      const svg = container.querySelector('.mlx-tabpanel svg[role="img"]');
      expect(svg).not.toBeNull();
      expect(svg!.querySelectorAll('circle')).toHaveLength(24);
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('Inercia: 294.05');
      expect(container.querySelector('.katex')).not.toBeNull();
    }
  }

  expect(error).not.toHaveBeenCalled();
});
```

- [ ] **Step 9: Notebook de Colab**

En `scripts/build-ml-notebook.py`, dentro de `ALGORITHMS` (mismo orden que el menú), añade justo después de la tupla de `"naive-bayes"`:

```python
    (
        "k-means",
        "K-Means (K-medias)",
        "Segmentación de clientes sin etiquetas: inercia y silueta para elegir K.",
    ),
```

```bash
python3 scripts/build-ml-notebook.py
```
Expected: `Escrito notebooks/algoritmos-ml.ipynb y 10 notebooks individuales`.

- [ ] **Step 10: Description del artículo**

En `src/data/articles/algoritmos-ml-explorador.md`, en la línea `description:`, cambia «Los primeros nueve ya están completos» por «Los primeros diez ya están completos» (lo exige `algoritmos-ml-explorador.links.test.ts`).

- [ ] **Step 10b: La alternativa de prueba de `render.test.ts`**

`render.test.ts` usa un módulo falso con `alternatives: ['knn', 'k-means']` y espera ver `'K-Means (próximamente)'`. K-Means ya está disponible, así que se cambia por un algoritmo de la fase 4. Reemplaza:

```ts
    alternatives: ['knn', 'k-means'],
```
por
```ts
    alternatives: ['knn', 'mlp'],
```
y
```ts
      expect(html).toContain('K-Means (próximamente)');
```
por
```ts
      expect(html).toContain('Neural Networks (MLP) (próximamente)');
```

- [ ] **Step 11: Verificación completa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
node scripts/check-ml-exercises-pyodide.mjs
```
Expected: todos los tests pasan (incluidos `registry.test.ts`, que comprueba que las alternativas de `k-means` existen; `notebook.test.ts`, que compara los notebooks con el `.py`; `glossaryTerms.test.ts`, `glossaryDensity.test.ts`, `textSpacing.test.ts` y `render.test.ts` sobre los textos nuevos; y `algoritmos-ml-explorador.links.test.ts`); `tsc` sin errores; `✓ k-means.py (Pyodide)` y los demás también.

Revisión manual con el servidor de desarrollo (`ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js`), en `#/articles/algoritmos-ml-explorador?alg=k-means&tab=formula`: la OVA responde al teclado (Tab hasta los controles, flechas en los sliders, Enter/Espacio en los botones), las cifras iniciales coinciden con la tabla «Cifras clave», las fichas 💡 abren, y en «Ejemplo real» «▶ Ejecutar» da la misma salida que la esperada.

Además, para la animación: pulsa «▶ Reproducir» y desplázate hasta que la OVA salga de la pantalla; al volver, sigue desde el mismo paso. Con la preferencia del sistema «reducir movimiento» activada (en Chrome: DevTools › Rendering › Emulate CSS media feature `prefers-reduced-motion: reduce`), «Reproducir» salta directamente al paso final y los centroides no se deslizan.

- [ ] **Step 12: Commit**

```bash
git add src/components/ml-explorer/algorithms/python/k-means.py src/components/ml-explorer/algorithms/python/k-means.out.txt \
  src/components/ml-explorer/algorithms/python/outputs.test.ts \
  src/components/ml-explorer/ovas/KMeansOva.tsx src/components/ml-explorer/ovas/KMeansOva.dom.test.tsx \
  src/components/ml-explorer/algorithms/k-means.tsx src/components/ml-explorer/registry.ts src/components/ml-explorer/registry.test.ts \
  src/components/ml-explorer/MLExplorer.real.dom.test.tsx src/components/ml-explorer/render.test.ts scripts/build-ml-notebook.py ../notebooks/algoritmos-ml.ipynb ../notebooks/algoritmos-ml/k-means.ipynb \
  src/data/articles/algoritmos-ml-explorador.md
git commit -m "feat(ml-explorer): add K-Means with its simulator and exercise

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Hierarchical Clustering

**Files:**
- Create: `src/components/ml-explorer/algorithms/python/hierarchical-clustering.py`
- Create: `src/components/ml-explorer/algorithms/python/hierarchical-clustering.out.txt` (generado)
- Modify: `src/components/ml-explorer/algorithms/python/outputs.test.ts`
- Create: `src/components/ml-explorer/ovas/HierarchicalOva.tsx`
- Create: `src/components/ml-explorer/ovas/HierarchicalOva.dom.test.tsx`
- Create: `src/components/ml-explorer/algorithms/hierarchical-clustering.tsx`
- Modify: `src/components/ml-explorer/registry.ts`, `src/components/ml-explorer/registry.test.ts`
- Modify: `src/components/ml-explorer/MLExplorer.real.dom.test.tsx`
- Modify: `scripts/build-ml-notebook.py`; regenerar `../notebooks/algoritmos-ml.ipynb` y crear `../notebooks/algoritmos-ml/hierarchical-clustering.ipynb`
- Modify: `src/data/articles/algoritmos-ml-explorador.md` (solo la description)

Historia del ejercicio: 12 genes simulados, medidos en 8 momentos, con tres patrones (suben, bajan, pico) y amplitudes distintas. `linkage(X, method="average", metric="correlation")` (distancia = 1 − correlación) une cada patrón muy abajo y los patrones arriba; cortando en 3 grupos con `fcluster(…, criterion="maxclust")` salen exactamente los tres patrones, y en 2, «baja» y «pico» quedan juntos. Imprime también la correlación cofenética (0.87) y dibuja el dendrograma con la línea de corte en 0.5.

La OVA son dos figuras lado a lado: 12 puntos numerados y su dendrograma (enlace promedio), con un slider de la altura del corte (0 a 6, paso 0.1, empieza en 3.0). Los puntos y las ramas por debajo del corte toman el color de su grupo; lo que queda por encima, gris.

- [ ] **Step 1: Fijar las cifras del ejercicio en `outputs.test.ts` (falla)**

Añade el import junto a los otros (después de `import naiveBayes from './naive-bayes.out.txt?raw';`):

```ts
import hierarchical from './hierarchical-clustering.out.txt?raw';
```

y dentro del `describe('cifras citadas en los textos', …)`, al final (antes del `});` que lo cierra):

```ts
  it('Hierarchical Clustering: cada patrón se une por debajo de 0.06 y los patrones a 0.96 y 1.48; con 3 grupos salen los 3 patrones', () => {
    const heights = [...hierarchical.matchAll(/altura ([\d.]+) → grupo de (\d+) genes/g)].map((m) => [Number(m[1]), Number(m[2])]);
    expect(heights).toEqual([
      [0.05, 4],
      [0.06, 4],
      [0.96, 8],
      [1.48, 12],
    ]);
    // «cada patrón queda unido por debajo de 0.07»: las uniones de 4 genes se imprimen como 0.05 y 0.06 (< 0.065).
    expect(heights[1][0]).toBeLessThan(0.07);
    expect(hierarchical).toContain('grupo 1: sube-1, sube-2, sube-3, sube-4\n  grupo 2: pico-1, pico-2, pico-3, pico-4\n  grupo 3: baja-1, baja-2, baja-3, baja-4');
    expect(hierarchical).toContain('grupo 2: baja-1, baja-2, baja-3, baja-4, pico-1, pico-2, pico-3, pico-4');
    expect(hierarchical).toContain('Correlación cofenética: 0.87');
  });
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: FAIL (`hierarchical-clustering.out.txt` no existe).

- [ ] **Step 2: Escribir el ejercicio**

Crea `src/components/ml-explorer/algorithms/python/hierarchical-clustering.py`:

```python
# Genes simulados: el agrupamiento jerárquico arma un árbol de parecidos
import matplotlib.pyplot as plt
import numpy as np
from scipy.cluster.hierarchy import cophenet, dendrogram, fcluster, linkage
from scipy.spatial.distance import pdist

rng = np.random.default_rng(3)
t = np.linspace(0, 1, 8)  # 8 mediciones en el tiempo
patrones = {"sube": t, "baja": 1 - t, "pico": np.exp(-((t - 0.5) ** 2) / 0.03)}
nombres, filas = [], []
for patron, curva in patrones.items():
    for i in range(4):  # 4 genes por patrón, con ruido
        nombres.append(f"{patron}-{i + 1}")
        filas.append(rng.uniform(1, 3) * curva + rng.normal(0, 0.15, size=8))
X = np.array(filas)

# Distancia = 1 − correlación: dos genes se parecen si suben y bajan juntos,
# aunque uno se exprese el triple que el otro.
Z = linkage(X, method="average", metric="correlation")
print("Últimas 4 uniones (altura = distancia a la que se unen):")
for a, b, altura, n in Z[-4:]:
    print(f"  altura {altura:.2f} → grupo de {int(n)} genes")

for k in (2, 3):
    grupos = fcluster(Z, t=k, criterion="maxclust")
    print(f"\nCortando en {k} grupos:")
    for g in range(1, k + 1):
        print(f"  grupo {g}: " + ", ".join(n for n, x in zip(nombres, grupos) if x == g))

c, _ = cophenet(Z, pdist(X, metric="correlation"))
print(f"\nCorrelación cofenética: {c:.2f} (1 = el árbol respeta todas las distancias)")

plt.figure(figsize=(5, 3.2))
dendrogram(Z, labels=nombres, color_threshold=0.5)
plt.axhline(0.5, color="gray", linestyle="--")  # cortar aquí deja 3 grupos
plt.ylabel("distancia (1 − correlación)")
plt.title("Dendrograma de 12 genes")
plt.show()
```

- [ ] **Step 3: Generar y verificar la salida**

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py --update
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
git status --short src/components/ml-explorer/algorithms/python/
```
Expected: `✓` en todos los ejercicios; `git status` muestra como nuevos solo `hierarchical-clustering.py` y `hierarchical-clustering.out.txt` (los `.out.txt` de las fases anteriores se regeneran idénticos). El contenido de `hierarchical-clustering.out.txt` debe ser exactamente:

```text
Últimas 4 uniones (altura = distancia a la que se unen):
  altura 0.05 → grupo de 4 genes
  altura 0.06 → grupo de 4 genes
  altura 0.96 → grupo de 8 genes
  altura 1.48 → grupo de 12 genes

Cortando en 2 grupos:
  grupo 1: sube-1, sube-2, sube-3, sube-4
  grupo 2: baja-1, baja-2, baja-3, baja-4, pico-1, pico-2, pico-3, pico-4

Cortando en 3 grupos:
  grupo 1: sube-1, sube-2, sube-3, sube-4
  grupo 2: pico-1, pico-2, pico-3, pico-4
  grupo 3: baja-1, baja-2, baja-3, baja-4

Correlación cofenética: 0.87 (1 = el árbol respeta todas las distancias)
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: PASS.

- [ ] **Step 4: Test de la OVA (falla)**

Crea `src/components/ml-explorer/ovas/HierarchicalOva.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HierarchicalOva } from './HierarchicalOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const cut = (v: string) => fireEvent.change(screen.getByRole('slider'), { target: { value: v } });

describe('HierarchicalOva', () => {
  it('corte inicial en 3.0: 3 grupos de 4; al bajar o subir el corte cambian los grupos', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<HierarchicalOva />);
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('3.0');
    expect(status(container)).toContain('Corte en 3.0: 3 grupos');
    expect(status(container)).toContain('Tamaños: 4, 4, 4');
    cut('2');
    expect(status(container)).toContain('Corte en 2.0: 4 grupos');
    expect(status(container)).toContain('Tamaños: 4, 4, 3, 1');
    cut('5.5');
    expect(status(container)).toContain('2 grupos');
    cut('6');
    expect(status(container)).toContain('Corte en 6.0: 1 grupo');
    cut('0');
    expect(status(container)).toContain('12 grupos');
    expect(error).not.toHaveBeenCalled();
  });

  it('dos imágenes: 12 puntos numerados y un dendrograma con 11 uniones y la línea de corte', () => {
    const { container } = render(<HierarchicalOva />);
    const [scatter, tree] = container.querySelectorAll('svg');
    expect(scatter.getAttribute('role')).toBe('img');
    expect(tree.getAttribute('role')).toBe('img');
    expect(scatter.querySelectorAll('circle')).toHaveLength(12);
    expect(tree.querySelectorAll('g path')).toHaveLength(22);
    expect(tree.querySelectorAll('line')).toHaveLength(1);
    // Hojas en el orden del dendrograma.
    expect(Array.from(tree.querySelectorAll('text'), (t) => t.textContent).join(' ')).toBe('2 3 1 4 6 7 5 8 12 9 10 11');
  });

  it('el hint (fuera del readout) cita el salto entre 2.2 y 5.2 y la unión del punto 12 a 2.15', () => {
    const { container } = render(<HierarchicalOva />);
    const hint = screen.getByText(/Mueve la línea de corte/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
    expect(hint.textContent).toContain('Entre 2.2 y 5.2');
    expect(hint.textContent).toContain('a altura 2.15');
  });
});
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/HierarchicalOva.dom.test.tsx`
Expected: FAIL (`./HierarchicalOva` no existe).

- [ ] **Step 5: La OVA**

Crea `src/components/ml-explorer/ovas/HierarchicalOva.tsx`:

```tsx
import { useMemo, useState } from 'react';
import { HC_CUT, HC_POINTS as POINTS, HC_START_CUT } from './datasets';
import { CLUSTER_COLORS, OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { averageLinkage, cutTree, dendrogramLayout } from './ovaMath';
import { createPlot } from './plot';

const N = POINTS.length;
const MERGES = averageLinkage(POINTS);
const LAYOUT = dendrogramLayout(MERGES, N);
const SCATTER = createPlot(260, 260, 20, [0, 10], [0, 10]);
const TREE = createPlot(300, 260, 24, [-0.5, N - 0.5], [0, HC_CUT.max]);

/** Hojas que cuelgan de cada nodo (0…n−1 puntos, n + i uniones). */
const LEAVES: number[][] = [...POINTS.map((_, i) => [i])];
MERGES.forEach((m) => LEAVES.push([...LEAVES[m.a], ...LEAVES[m.b]]));

export function HierarchicalOva() {
  const [cut, setCut] = useState<number>(HC_START_CUT);
  const labels = useMemo(() => cutTree(MERGES, N, cut), [cut]);
  const groups = Math.max(...labels) + 1;
  const sizes = Array.from({ length: groups }, (_, g) => labels.filter((l) => l === g).length);
  /** Color de un nodo: el de su grupo si queda bajo el corte; gris si queda por encima. */
  const color = (node: number) =>
    node < N || MERGES[node - N].height <= cut ? CLUSTER_COLORS[labels[LEAVES[node][0]] % CLUSTER_COLORS.length] : OVA_COLORS.axis;

  return (
    <OvaFrame
      title="Cortar el árbol de parecidos"
      hint="A la derecha, el dendrograma: cada unión junta los dos grupos más parecidos, y su altura es la distancia promedio entre ellos. Mueve la línea de corte: todo lo que se unió por debajo queda en el mismo grupo. Entre 2.2 y 5.2 no pasa nada (hay un salto grande): por eso 3 grupos es un corte natural. El punto 12, entre dos grupos, se une al de la derecha a altura 2.15."
      controls={
        <OvaSlider
          label="Altura del corte"
          value={cut}
          min={HC_CUT.min}
          max={HC_CUT.max}
          step={HC_CUT.step}
          onChange={setCut}
          format={(v) => v.toFixed(1)}
        />
      }
      readout={
        <>
          <span>
            Corte en <b>{cut.toFixed(1)}</b>: <b>{groups}</b> {groups === 1 ? 'grupo' : 'grupos'}
          </span>
          <span>
            Tamaños: <b>{sizes.join(', ')}</b>
          </span>
        </>
      }
    >
      <div className="mlx-hc-stage">
        <svg viewBox={`0 0 ${SCATTER.width} ${SCATTER.height}`} role="img" aria-label="Doce puntos numerados, coloreados según el grupo que les toca con el corte actual">
          {POINTS.map((p, i) => (
            <g key={i}>
              <circle cx={SCATTER.sx(p.x)} cy={SCATTER.sy(p.y)} r={9} fill={CLUSTER_COLORS[labels[i] % CLUSTER_COLORS.length]} stroke="#040320" strokeWidth={1.5} />
              <text x={SCATTER.sx(p.x)} y={SCATTER.sy(p.y) + 3.5} textAnchor="middle" fontSize={10} fill="#040320">
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
        <svg viewBox={`0 0 ${TREE.width} ${TREE.height}`} role="img" aria-label="Dendrograma de los doce puntos con la línea de corte">
          {MERGES.map((m, k) => {
            const node = LAYOUT.nodes[N + k];
            const stroke = color(N + k);
            return (
              <g key={k} stroke={stroke} strokeWidth={2} fill="none">
                {[m.a, m.b].map((child) => (
                  <path
                    key={child}
                    d={`M${TREE.sx(LAYOUT.nodes[child].x)},${TREE.sy(LAYOUT.nodes[child].height)} V${TREE.sy(node.height)} H${TREE.sx(node.x)}`}
                  />
                ))}
              </g>
            );
          })}
          {LAYOUT.order.map((leaf, i) => (
            <text key={leaf} x={TREE.sx(i)} y={TREE.height - 8} textAnchor="middle" fontSize={10} fill={OVA_COLORS.axis}>
              {leaf + 1}
            </text>
          ))}
          <line
            x1={TREE.sx(-0.5)}
            x2={TREE.sx(N - 0.5)}
            y1={TREE.sy(cut)}
            y2={TREE.sy(cut)}
            stroke={OVA_COLORS.risk}
            strokeDasharray="5 4"
            strokeWidth={1.5}
          />
        </svg>
      </div>
    </OvaFrame>
  );
}
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/HierarchicalOva.dom.test.tsx`
Expected: PASS.

- [ ] **Step 6: El módulo del algoritmo**

Crea `src/components/ml-explorer/algorithms/hierarchical-clustering.tsx`:

```tsx
import { G } from '../Gloss';
import { Tex } from '../Tex';
import { HierarchicalOva } from '../ovas/HierarchicalOva';
import type { AlgorithmModule } from '../types';
import code from './python/hierarchical-clustering.py?raw';
import expectedOutput from './python/hierarchical-clustering.out.txt?raw';

const hierarchicalClustering: AlgorithmModule = {
  slug: 'hierarchical-clustering',
  row: {
    type: 'No supervisado',
    bestUse: 'Conjuntos pequeños; ver la jerarquía de grupos',
    formula: 'Unir (o dividir) grupos paso a paso',
    assumptions: 'La medida de distancia tiene sentido',
    pros: 'No hay que fijar K de antemano; dendrograma',
    cons: 'Costoso en cálculo y memoria',
    whenNot: 'Conjuntos de datos grandes',
    realWorld: 'Análisis de genes, taxonomías',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>
              <G k="noSupervisado">No supervisado</G>:
            </b>{' '}
            los datos no traen respuesta. El algoritmo agrupa lo parecido sin que nadie le diga qué grupos existen.
          </p>
          <p>
            En vez de dar un solo reparto, arma un <b>árbol de parecidos</b>: empieza con cada dato solo y une, paso a
            paso, los dos grupos más cercanos hasta tener uno. Ese árbol se dibuja como un{' '}
            <G k="dendrograma">dendrograma</G>, y cortarlo a una altura da los grupos.
          </p>
          <p>
            <b>¿Cómo se evalúa sin respuestas?</b> Con pistas, no con un acierto: un salto grande de altura entre dos
            uniones sugiere un corte natural, y la <G k="cofenetica">correlación cofenética</G> dice qué tan fiel es el
            árbol a las distancias originales. Si los grupos tienen sentido, lo decide quien conoce los datos.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Esta es la versión aglomerativa (de abajo hacia arriba), la de scipy y de <code>AgglomerativeClustering</code>{' '}
          en scikit-learn. Existe la divisiva (de arriba hacia abajo, partiendo el grupo total), mucho menos usada
          porque cada partición es costosa.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo con <b>conjuntos pequeños o medianos</b> (hasta unos miles de datos) cuando quieres ver{' '}
            <b>grupos dentro de grupos</b> o no sabes cuántos grupos buscar.
          </p>
          <ul>
            <li>Agrupar genes con patrones de expresión parecidos.</li>
            <li>Armar taxonomías: especies, productos, documentos.</li>
            <li>Explorar unos cientos de clientes o máquinas antes de decidir cuántos segmentos crear.</li>
          </ul>
          <p className="mlx-rule">Si necesitas ver toda la jerarquía y tienes pocos miles de datos o menos, este es el algoritmo.</p>
        </>
      ),
      deepDive: (
        <p>
          Acepta cualquier medida de distancia, no solo la euclidiana: en el ejercicio se usa 1 − correlación, que
          junta genes que suben y bajan a la vez aunque uno se exprese el triple que otro. K-Means no permite eso,
          porque necesita promediar.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> cuatro puntos sobre una recta, en 0, 1, 5 y 7. Primero se unen 0 y 1 (distancia 1).
            Luego 5 y 7 (distancia 2). Al final se unen los dos grupos: la distancia entre ellos es el promedio de las
            4 distancias entre sus puntos, (5 + 7 + 4 + 6) / 4 = 5.5. Esas tres alturas (1, 2 y 5.5) son las del{' '}
            <G k="dendrograma">dendrograma</G>.
          </p>
          <p>
            Esa regla para medir la distancia entre grupos se llama <G k="enlace">enlace</G>. Con enlace promedio:
          </p>
          <Tex block>{'d(A, B) = \\frac{1}{|A|\\,|B|} \\sum_{a \\in A} \\sum_{b \\in B} d(a, b)'}</Tex>
          <p>
            <Tex>{'|A|'}</Tex> y <Tex>{'|B|'}</Tex> son los tamaños de los grupos. En cada paso se unen los dos grupos
            con menor <Tex>{'d(A, B)'}</Tex>. Cortar el árbol a la altura <Tex>{'h'}</Tex> deja juntos los grupos que
            se unieron por debajo de <Tex>{'h'}</Tex>.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Otros enlaces: simple (la distancia entre los dos puntos más cercanos), completo (entre los más lejanos) y
            Ward (cuánto crece la varianza dentro del grupo al unirlos). El simple tiende a formar cadenas largas; Ward
            y el completo, grupos compactos. Ward solo tiene sentido con distancia euclidiana.
          </p>
          <p>
            Hay que guardar la distancia entre todos los pares: con n puntos, <Tex>{'n(n-1)/2'}</Tex> distancias.
            Con 10 000 puntos son unos 50 millones (unos 400 MB). El tiempo crece como <Tex>{'n^2'}</Tex> en los
            mejores algoritmos y como <Tex>{'n^3'}</Tex> en la versión directa.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que <b>la medida de distancia refleja el parecido que te importa</b>. Todo el árbol sale de esa
            medida: si está mal elegida, los grupos no significan nada.
          </p>
          <p>
            En el ejercicio, dos genes se parecen si suben y bajan juntos en el tiempo, aunque uno se exprese mucho
            más que otro. Por eso se usa 1 − correlación y no la distancia en línea recta, que separaría un gen de
            otro solo por su nivel.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Con distancia euclidiana valen las mismas precauciones que en K-Means: <G k="escalado">escalar</G> las{' '}
          <G k="feature">features</G> y vigilar los <G k="outlier">outliers</G>. También supone que una jerarquía tiene
          sentido: el árbol siempre anida los grupos (un grupo de 3 vive dentro de uno de 8), aunque los datos no lo
          hagan.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>No hay que fijar K antes:</b> se arma el árbol una vez y se corta donde convenga. En el simulador,
            cortar en cualquier altura entre 2.2 y 5.2 da los mismos 3 grupos.
          </li>
          <li>
            <b>Muestra la estructura completa:</b> el <G k="dendrograma">dendrograma</G> enseña qué grupos están cerca
            de cuáles y a qué distancia se unen.
          </li>
          <li>
            <b>Funciona con cualquier distancia:</b> correlación, distancia entre textos, entre secuencias de ADN.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Es determinista: con los mismos datos da siempre el mismo árbol (salvo empates exactos de distancia), sin
          arranques al azar como K-Means. La <G k="cofenetica">correlación cofenética</G> del ejercicio, 0.87, dice
          que el árbol respeta bien las distancias entre los 12 genes.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Costoso:</b> necesita la distancia entre todos los pares de datos. Con 10 000 datos son unos 50
            millones de distancias.
          </li>
          <li>
            <b>Las uniones no se deshacen:</b> si al principio une dos puntos que no debía, ese error queda en todo el
            árbol.
          </li>
          <li>
            <b>El resultado depende del <G k="enlace">enlace</G>:</b> simple, completo, promedio o Ward pueden dar
            árboles muy distintos con los mismos datos.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          En el simulador, el punto 12 queda entre dos grupos y termina unido al de la derecha a altura 2.15: un
          punto ambiguo se asigna igual que uno claro, sin aviso. Con datos grandes se agrupa primero con K-Means en
          unos cientos de grupos pequeños y luego se aplica el jerárquico a sus <G k="centroide">centroides</G>.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses con decenas de miles de datos o más.</p>
          <p>
            Ejemplo: agrupar 100 000 clientes. Solo la tabla de distancias tendría unos 5 000 millones de valores
            (unos 40 GB), y un <G k="dendrograma">dendrograma</G> con 100 000 hojas no se puede leer. K-Means hace ese trabajo en segundos.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Tampoco es buena idea si los grupos tienen forma irregular y hay mucho ruido: el <G k="enlace">enlace simple</G> encadena
          grupos a través de los puntos de ruido y los demás enlaces cortan las formas largas. Ahí DBSCAN funciona
          mejor.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Análisis de genes.</b> Los mapas de calor de expresión génica que se publican en biología suelen llevar
            un <G k="dendrograma">dendrograma</G> al lado: agrupa genes que se activan juntos, que suelen participar en el
            mismo proceso.
          </p>
          <p>
            El ejercicio simula 12 genes medidos en 8 momentos, con tres patrones: suben, bajan o tienen un pico. Con{' '}
            <G k="enlace">enlace promedio</G> y distancia 1 − correlación, cada patrón queda unido por debajo de 0.07
            de altura, y los patrones se unen mucho más arriba (0.96 y 1.48). Cortando en 3 grupos aparecen
            exactamente los tres patrones.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Cortando en 2 grupos, «baja» y «pico» quedan juntos: ambos terminan bajos, así que se parecen más entre sí
          que con «sube». Con datos reales se miden miles de genes y se agrupan primero los más variables; el árbol
          completo de miles de hojas se revisa por ramas.
        </p>
      ),
    },
  },
  Ova: HierarchicalOva,
  python: { code, expectedOutput, colabNotebook: 'hierarchical-clustering' },
  inYourField: [
    { area: 'Biomédica', example: 'agrupar pacientes por sus perfiles de laboratorio para encontrar subtipos de una enfermedad.' },
    { area: 'Industrial', example: 'armar familias de piezas parecidas para planear celdas de manufactura.' },
    { area: 'Ambiental', example: 'agrupar estaciones de calidad del aire según cómo varían sus mediciones durante el día.' },
  ],
  alternatives: ['k-means', 'dbscan'],
};

export default hierarchicalClustering;
```

- [ ] **Step 7: Registrar el loader**

En `registry.ts`, dentro de `LOADERS`, justo después de

```ts
  'k-means': () => import('./algorithms/k-means'),
```

añade (el orden de `LOADERS` no afecta al menú, pero así sigue el orden del menú):

```ts
  'hierarchical-clustering': () => import('./algorithms/hierarchical-clustering'),
```

y en `registry.test.ts`, el test «marca como disponibles solo los algoritmos implementados» pasa a esperar:

```ts
    expect(AVAILABLE_SLUGS).toEqual([
      'linear-regression',
      'logistic-regression',
      'decision-tree',
      'random-forest',
      'gradient-boosting',
      'svm',
      'knn',
      'naive-bayes',
      'k-means',
      'hierarchical-clustering',
      'dbscan',
    ]);
```

- [ ] **Step 8: Recorrido con el módulo real**

Añade al final de `src/components/ml-explorer/MLExplorer.real.dom.test.tsx`:

```tsx
it('Hierarchical Clustering real (?alg=hierarchical-clustering): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=hierarchical-clustering']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Hierarchical Clustering' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'formula') {
      expect(container.querySelectorAll('.mlx-tabpanel svg[role="img"]')).toHaveLength(2);
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('Corte en 3.0: 3 grupos');
      expect(container.querySelector('.katex')).not.toBeNull();
    }
  }

  expect(error).not.toHaveBeenCalled();
});
```

- [ ] **Step 9: Notebook de Colab**

En `scripts/build-ml-notebook.py`, dentro de `ALGORITHMS` (mismo orden que el menú), añade justo después de la tupla de `"k-means"`:

```python
    (
        "hierarchical-clustering",
        "Hierarchical Clustering (agrupamiento jerárquico)",
        "Genes simulados: un árbol de parecidos (dendrograma) que se corta a la altura que convenga.",
    ),
```

```bash
python3 scripts/build-ml-notebook.py
```
Expected: `Escrito notebooks/algoritmos-ml.ipynb y 11 notebooks individuales`.

- [ ] **Step 10: Description del artículo**

En `src/data/articles/algoritmos-ml-explorador.md`, en la línea `description:`, cambia «Los primeros diez ya están completos» por «Los primeros once ya están completos» (lo exige `algoritmos-ml-explorador.links.test.ts`).

- [ ] **Step 11: Verificación completa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
node scripts/check-ml-exercises-pyodide.mjs
```
Expected: todos los tests pasan (incluidos `registry.test.ts`, que comprueba que las alternativas de `hierarchical-clustering` existen; `notebook.test.ts`, que compara los notebooks con el `.py`; `glossaryTerms.test.ts`, `glossaryDensity.test.ts`, `textSpacing.test.ts` y `render.test.ts` sobre los textos nuevos; y `algoritmos-ml-explorador.links.test.ts`); `tsc` sin errores; `✓ hierarchical-clustering.py (Pyodide)` y los demás también.

Revisión manual con el servidor de desarrollo (`ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js`), en `#/articles/algoritmos-ml-explorador?alg=hierarchical-clustering&tab=formula`: la OVA responde al teclado (Tab hasta los controles, flechas en los sliders, Enter/Espacio en los botones), las cifras iniciales coinciden con la tabla «Cifras clave», las fichas 💡 abren, y en «Ejemplo real» «▶ Ejecutar» da la misma salida que la esperada (y la figura).

- [ ] **Step 12: Commit**

```bash
git add src/components/ml-explorer/algorithms/python/hierarchical-clustering.py src/components/ml-explorer/algorithms/python/hierarchical-clustering.out.txt \
  src/components/ml-explorer/algorithms/python/outputs.test.ts \
  src/components/ml-explorer/ovas/HierarchicalOva.tsx src/components/ml-explorer/ovas/HierarchicalOva.dom.test.tsx \
  src/components/ml-explorer/algorithms/hierarchical-clustering.tsx src/components/ml-explorer/registry.ts src/components/ml-explorer/registry.test.ts \
  src/components/ml-explorer/MLExplorer.real.dom.test.tsx scripts/build-ml-notebook.py ../notebooks/algoritmos-ml.ipynb ../notebooks/algoritmos-ml/hierarchical-clustering.ipynb \
  src/data/articles/algoritmos-ml-explorador.md
git commit -m "feat(ml-explorer): add Hierarchical Clustering with its simulator and exercise

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: PCA

**Files:**
- Create: `src/components/ml-explorer/algorithms/python/pca.py`
- Create: `src/components/ml-explorer/algorithms/python/pca.out.txt` (generado)
- Modify: `src/components/ml-explorer/algorithms/python/outputs.test.ts`
- Create: `src/components/ml-explorer/ovas/PcaOva.tsx`
- Create: `src/components/ml-explorer/ovas/PcaOva.dom.test.tsx`
- Create: `src/components/ml-explorer/algorithms/pca.tsx`
- Modify: `src/components/ml-explorer/registry.ts`, `src/components/ml-explorer/registry.test.ts`
- Modify: `src/components/ml-explorer/MLExplorer.real.dom.test.tsx`
- Modify: `scripts/build-ml-notebook.py`; regenerar `../notebooks/algoritmos-ml.ipynb` y crear `../notebooks/algoritmos-ml/pca.ipynb`
- Modify: `src/data/articles/algoritmos-ml-explorador.md` (solo la description)

Historia del ejercicio: los 1 797 dígitos de 8×8 píxeles que trae scikit-learn (`load_digits`, empaquetado: funciona en Pyodide sin descargas). Ajusta `PCA()` una vez y comprime cada imagen a k números (`(X − media) @ V[:k].T`) y la reconstruye: imprime la varianza retenida y el error medio por píxel con k = 1, 2, 5, 10, 20 y 40, y cuántos componentes hacen falta para el 90 % (21 de 64). La figura muestra el primer dígito original y reconstruido con 2, 5, 10 y 20 componentes.

La OVA es una nube de 20 puntos de dos medidas muy correlacionadas y un eje que se gira con un slider (0° a 179°): cada punto se proyecta sobre el eje (líneas rosas) y el readout dice qué porcentaje de la varianza captura. Un botón lleva al eje de máxima varianza (34°, 94.6 %). El PCA es el único algoritmo del grupo «Reducción de dimensionalidad».

- [ ] **Step 1: Fijar las cifras del ejercicio en `outputs.test.ts` (falla)**

Añade el import junto a los otros (después de `import naiveBayes from './naive-bayes.out.txt?raw';`):

```ts
import pca from './pca.out.txt?raw';
```

y dentro del `describe('cifras citadas en los textos', …)`, al final (antes del `});` que lo cierra):

```ts
  it('PCA: 1797 imágenes de 64 píxeles; varianza retenida y error por píxel; 21 componentes para el 90 %', () => {
    expect(pca).toContain('1797 imágenes de 64 píxeles');
    const rows = [...pca.matchAll(/^\s+(\d+) \|\s+(\d+)% \|\s+([\d.]+)$/gm)].map((m) => [Number(m[1]), Number(m[2]), Number(m[3])]);
    expect(rows).toEqual([
      [1, 15, 4.0],
      [2, 29, 3.66],
      [5, 54, 2.92],
      [10, 74, 2.22],
      [20, 89, 1.41],
      [40, 99, 0.47],
    ]);
    expect(pca).toContain('Para retener el 90 % bastan 21 de 64 componentes');
  });
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: FAIL (`pca.out.txt` no existe).

- [ ] **Step 2: Escribir el ejercicio**

Crea `src/components/ml-explorer/algorithms/python/pca.py`:

```python
# Compresión de imágenes: PCA guarda cada dígito con k números en vez de 64
import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import load_digits
from sklearn.decomposition import PCA

X = load_digits().data  # 1797 imágenes de 8×8 píxeles; cada píxel va de 0 a 16
print(f"{X.shape[0]} imágenes de {X.shape[1]} píxeles")

pca = PCA().fit(X)
V, media = pca.components_, pca.mean_
retenida = np.cumsum(pca.explained_variance_ratio_)


def comprimir(k):
    codigo = (X - media) @ V[:k].T  # k números por imagen
    return media + codigo @ V[:k]  # imagen reconstruida desde esos k números


print("\nk números | varianza retenida | error medio por píxel")
for k in (1, 2, 5, 10, 20, 40):
    error = np.sqrt(np.mean((X - comprimir(k)) ** 2))
    print(f"{k:9d} | {retenida[k - 1]:16.0%} | {error:20.2f}")
print(f"\nPara retener el 90 % bastan {np.searchsorted(retenida, 0.90) + 1} de 64 componentes")

fig, ejes = plt.subplots(1, 5, figsize=(7, 1.8))
for eje, k in zip(ejes, (64, 2, 5, 10, 20)):
    eje.imshow((X if k == 64 else comprimir(k))[0].reshape(8, 8), cmap="gray_r")
    eje.set_title("original" if k == 64 else f"k = {k}")
    eje.axis("off")
plt.show()
```

- [ ] **Step 3: Generar y verificar la salida**

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py --update
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
git status --short src/components/ml-explorer/algorithms/python/
```
Expected: `✓` en todos los ejercicios; `git status` muestra como nuevos solo `pca.py` y `pca.out.txt` (los `.out.txt` de las fases anteriores se regeneran idénticos). El contenido de `pca.out.txt` debe ser exactamente:

```text
1797 imágenes de 64 píxeles

k números | varianza retenida | error medio por píxel
        1 |              15% |                 4.00
        2 |              29% |                 3.66
        5 |              54% |                 2.92
       10 |              74% |                 2.22
       20 |              89% |                 1.41
       40 |              99% |                 0.47

Para retener el 90 % bastan 21 de 64 componentes
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: PASS.

- [ ] **Step 4: Test de la OVA (falla)**

Crea `src/components/ml-explorer/ovas/PcaOva.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PCA_BEST_ANGLE, PcaOva } from './PcaOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';

describe('PcaOva', () => {
  it('a 0° captura 66.5 %; en el eje principal (34°), 94.6 %; en el perpendicular, 5.4 %', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<PcaOva />);
    expect(status(container)).toContain('Eje a 0°: captura 66.5 % de la varianza');
    expect(status(container)).toContain('Se pierde: 33.5 %');
    expect(PCA_BEST_ANGLE).toBe(34);
    fireEvent.click(screen.getByRole('button', { name: 'Ir al eje de máxima varianza' }));
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('34°');
    expect(status(container)).toContain('captura 94.6 %');
    fireEvent.change(screen.getByRole('slider'), { target: { value: '124' } });
    expect(status(container)).toContain('captura 5.4 %');
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }));
    expect(status(container)).toContain('Eje a 0°');
    expect(error).not.toHaveBeenCalled();
  });

  it('el svg es una imagen con 20 puntos y sus 20 proyecciones; el hint va fuera del readout', () => {
    const { container } = render(<PcaOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('circle[r="6"]')).toHaveLength(20);
    expect(svg?.querySelectorAll('circle.mlx-pca-proj')).toHaveLength(20);
    const hint = screen.getByText(/las líneas rosas son lo que se pierde/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });
});
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/PcaOva.dom.test.tsx`
Expected: FAIL (`./PcaOva` no existe).

- [ ] **Step 5: La OVA**

Crea `src/components/ml-explorer/ovas/PcaOva.tsx`:

```tsx
import { useState } from 'react';
import { PCA_POINTS as POINTS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { capturedShare, covariance2, principalAngle, projectOnAxis } from './ovaMath';
import { createPlot } from './plot';

// Misma escala en x y en y: si no, los ángulos se verían deformados.
const PLOT = createPlot(320, 320, 20, [-1, 9], [0, 10]);
const COV = covariance2(POINTS);
/** Ángulo del primer componente principal, redondeado al paso del slider. */
export const PCA_BEST_ANGLE = Math.round(principalAngle(COV));
const pct = (v: number) => `${(v * 100).toFixed(1)} %`;

export function PcaOva() {
  const [angle, setAngle] = useState(0);
  const share = capturedShare(COV, angle);
  const t = (angle * Math.PI) / 180;
  const far = 12;
  const m = COV.mean;

  return (
    <OvaFrame
      title="Gira el eje y mira cuánto captura"
      hint="Cada punto se proyecta sobre el eje (las líneas rosas). PCA busca el ángulo en el que los puntos proyectados quedan más esparcidos, es decir, con más varianza: así una sola columna conserva casi toda la información de las dos. Gira el eje hasta el máximo; las líneas rosas son lo que se pierde. El eje perpendicular al mejor es el segundo componente: captura solo lo que falta."
      controls={
        <>
          <OvaSlider label="Ángulo del eje" value={angle} min={0} max={179} step={1} onChange={setAngle} format={(v) => `${v}°`} />
          <button type="button" onClick={() => setAngle(PCA_BEST_ANGLE)}>
            Ir al eje de máxima varianza
          </button>
          <button type="button" onClick={() => setAngle(0)}>
            Restablecer
          </button>
        </>
      }
      readout={
        <>
          <span>
            Eje a <b>{angle}°</b>: captura <b>{pct(share)}</b> de la varianza
          </span>
          <span>
            Se pierde: <b>{pct(1 - share)}</b>
          </span>
        </>
      }
    >
      <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} role="img" aria-label="Puntos, el eje que se gira y la proyección de cada punto sobre él">
        <line
          x1={PLOT.sx(m.x - far * Math.cos(t))}
          y1={PLOT.sy(m.y - far * Math.sin(t))}
          x2={PLOT.sx(m.x + far * Math.cos(t))}
          y2={PLOT.sy(m.y + far * Math.sin(t))}
          stroke={OVA_COLORS.accent}
          strokeWidth={2.5}
        />
        {POINTS.map((p, i) => {
          const q = projectOnAxis(p, m, angle);
          return (
            <g key={i}>
              <line x1={PLOT.sx(p.x)} y1={PLOT.sy(p.y)} x2={PLOT.sx(q.x)} y2={PLOT.sy(q.y)} stroke={OVA_COLORS.risk} strokeWidth={1.2} />
              <circle className="mlx-pca-proj" cx={PLOT.sx(q.x)} cy={PLOT.sy(q.y)} r={3} fill={OVA_COLORS.accent} />
              <circle cx={PLOT.sx(p.x)} cy={PLOT.sy(p.y)} r={6} fill={OVA_COLORS.class0} stroke="#040320" strokeWidth={1.5} />
            </g>
          );
        })}
      </svg>
    </OvaFrame>
  );
}
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/PcaOva.dom.test.tsx`
Expected: PASS.

- [ ] **Step 6: El módulo del algoritmo**

Crea `src/components/ml-explorer/algorithms/pca.tsx`:

```tsx
import { G } from '../Gloss';
import { Tex } from '../Tex';
import { PcaOva } from '../ovas/PcaOva';
import type { AlgorithmModule } from '../types';
import code from './python/pca.py?raw';
import expectedOutput from './python/pca.out.txt?raw';

const pca: AlgorithmModule = {
  slug: 'pca',
  row: {
    type: 'Reducción de dimensionalidad',
    bestUse: 'Reducir el número de features',
    formula: 'Autovectores de la matriz de covarianza',
    assumptions: 'Relaciones lineales entre features',
    pros: 'Menos features: entrenar más rápido y con menos sobreajuste',
    cons: 'Las nuevas features son difíciles de interpretar',
    whenNot: 'Cuando necesitas features interpretables',
    realWorld: 'Compresión de imágenes',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>Reducción de dimensionalidad:</b> no predice nada. Toma datos con muchas columnas (
            <G k="feature">features</G>) y los resume en <b>pocas columnas nuevas</b> que conservan casi toda la
            información.
          </p>
          <p>
            Como el agrupamiento, es <G k="noSupervisado">no supervisado</G>: no usa ninguna respuesta, solo cómo
            varían los datos. Las columnas nuevas son los <G k="componentePrincipal">componentes principales</G>.
          </p>
          <p>
            <b>¿Cómo se evalúa sin respuestas?</b> Con la <G k="varianzaExplicada">varianza retenida</G> (qué
            fracción de la variación original conservan los componentes) y con el error al reconstruir los datos
            originales. Si después entrenas un modelo, la prueba final es cuánto acierta ese modelo.
          </p>
        </>
      ),
      deepDive: (
        <p>
          <G k="pca">PCA</G> viene de <i>Principal Component Analysis</i>, análisis de componentes principales. Se usa de tres formas:
          comprimir datos, quitar ruido (los últimos componentes suelen ser ruido) y dibujar en 2D datos de muchas
          dimensiones.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo cuando tienes <b>muchas <G k="feature">features</G> que se parecen entre sí</b>: medidas
            redundantes, píxeles vecinos, sensores que miden casi lo mismo.
          </p>
          <ul>
            <li>Comprimir imágenes o señales.</li>
            <li>Reducir cientos de columnas antes de entrenar un modelo lento.</li>
            <li>Dibujar en 2D un conjunto de datos de muchas dimensiones para explorarlo.</li>
          </ul>
          <p className="mlx-rule">
            Si tus features están muy correlacionadas, prueba <G k="pca">PCA</G> y mira cuántos componentes guardan el 90 % de la
            varianza.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Antes de PCA hay que <G k="escalado">estandarizar</G> las features si están en unidades distintas: si no,
          la que tiene números más grandes se queda con el primer componente solo por su escala. En el ejercicio no
          hace falta porque todos los píxeles van de 0 a 16.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> si todos los puntos están sobre la diagonal, como (0, 0), (1, 1), (2, 2) y (3, 3), un eje
            a 45° conserva el 100 % de su variación: basta un número por punto (su posición sobre la diagonal) en vez
            de dos. El eje horizontal conserva solo el 50 % y el perpendicular a la diagonal, el 0 %.
          </p>
          <p>
            En el simulador los puntos no están en una recta perfecta. El eje horizontal conserva el 66.5 % de la{' '}
            <G k="varianza">varianza</G>; girado a 34° llega al máximo, 94.6 %. Ese eje es el primer{' '}
            <G k="componentePrincipal">componente principal</G>.
          </p>
          <p>
            Esas direcciones son los <G k="autovector">autovectores</G> de la matriz de covarianza:
          </p>
          <Tex block>{'\\Sigma = \\frac{1}{n-1} X_c^\\top X_c, \\qquad \\Sigma\\, v_j = \\lambda_j\\, v_j'}</Tex>
          <p>
            <Tex>{'X_c'}</Tex> son los datos con la media restada. Cada <Tex>{'v_j'}</Tex> es una dirección y{' '}
            <Tex>{'\\lambda_j'}</Tex> la varianza que captura. El primer componente tiene el{' '}
            <Tex>{'\\lambda'}</Tex> más grande, y la fracción que conserva es <Tex>{'\\lambda_1 / \\sum_j \\lambda_j'}</Tex>.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Comprimir es proyectar: <Tex>{'z = V_k^\\top (x - \\bar{x})'}</Tex> da los k números de cada dato, y{' '}
            <Tex>{'\\hat{x} = \\bar{x} + V_k\\, z'}</Tex> lo reconstruye. Ninguna otra proyección lineal a k
            dimensiones deja un <G k="reconstruccion">error de reconstrucción</G> cuadrático menor.
          </p>
          <p>
            scikit-learn elige el método según la forma de los datos: con muchas más filas que columnas, como en el
            ejercicio, calcula <Tex>{'\\Sigma'}</Tex> y sus autovectores; si no, usa la descomposición en valores
            singulares (SVD) de <Tex>{'X_c'}</Tex>, sin formar <Tex>{'\\Sigma'}</Tex>. El signo de cada componente es
            arbitrario: dos programas pueden dar el mismo eje apuntando en sentidos opuestos.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone <b>relaciones lineales</b>: los componentes son rectas (o planos) a través de los datos. Si los
            datos forman una curva, como una espiral o una luna, <G k="pca">PCA</G> no la «desenrolla» y necesita más componentes de
            los que parece.
          </p>
          <p>
            También supone que <b>la información está donde hay más <G k="varianza">varianza</G></b>. Casi siempre es
            así, pero una dirección con poca varianza puede ser justo la que distingue dos clases.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Para estructuras curvas existen versiones no lineales: <code>KernelPCA</code>, los autoencoders (redes que
          aprenden a comprimir) y, solo para dibujar, <G k="tsneUmap">t-SNE y UMAP</G>. Los{' '}
          <G k="outlier">outliers</G> también afectan a PCA: como la varianza usa cuadrados, un punto muy lejano
          puede llevarse un componente entero.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Menos columnas, poca pérdida:</b> en el ejercicio, 21 de 64 componentes retienen el 90 % de la
            varianza de las imágenes.
          </li>
          <li>
            <b>Modelos más rápidos y estables:</b> con menos <G k="feature">features</G> se entrena más rápido y hay
            menos riesgo de <G k="overfitting">sobreajuste</G>.
          </li>
          <li>
            <b>Sin parámetros delicados:</b> el único es cuántos componentes guardar, y la{' '}
            <G k="varianzaExplicada">varianza retenida</G> ayuda a elegirlo.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Los componentes no están correlacionados entre sí, lo que ayuda a los modelos que sufren con features
          correlacionadas, como la regresión lineal. Es determinista (salvo el signo) y rápido: con miles de filas y
          cientos de columnas tarda una fracción de segundo.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Columnas difíciles de interpretar:</b> cada componente mezcla todas las{' '}
            <G k="feature">features</G> originales con distintos pesos. «Componente 1 = 0.4·edad + 0.3·ingreso − …»
            no se le explica fácil a nadie.
          </li>
          <li>
            <b>Solo ve relaciones lineales:</b> no capta curvas.
          </li>
          <li>
            <b>Se pierde algo:</b> en el ejercicio, con 10 componentes se retiene el 74 % y el error medio por píxel
            es 2.22 (en una escala de 0 a 16).
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          <G k="pca">PCA</G> no mira la respuesta, así que puede descartar justo la dirección que separa las clases. Si el objetivo
          es clasificar, compara el modelo con y sin PCA en datos de prueba. Además, el ajuste de PCA forma parte del
          entrenamiento: hay que calcularlo solo con los datos de entrenamiento.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses cuando necesitas explicar el modelo con las columnas originales.</p>
          <p>
            Ejemplo: un modelo de crédito que debe justificar cada rechazo («su deuda es alta»). Si entrenas con
            componentes, la explicación sería «su componente 3 es bajo», que no le sirve a nadie. Mejor elige un
            subconjunto de las <G k="feature">features</G> originales.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Tampoco sirve con pocas columnas poco correlacionadas (no hay nada que resumir) ni con estructura curva
          fuerte. Para elegir columnas originales, mira la importancia de cada feature en un modelo de árboles.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Compresión de imágenes.</b> Una de las primeras técnicas de reconocimiento facial, las
            «eigenfaces» (1991), guardaba cada rostro como unos pocos{' '}
            <G k="componentePrincipal">componentes principales</G> en vez de miles de píxeles.
          </p>
          <p>
            El ejercicio usa los 1 797 dígitos de 8×8 píxeles (64 números por imagen) que trae scikit-learn. Con 2
            componentes se retiene el 29 % de la <G k="varianza">varianza</G>; con 10, el 74 %; con 20, el 89 %; y
            con 40, el 99 %. La figura muestra un dígito reconstruido con 2, 5, 10 y 20 números.
          </p>
        </>
      ),
      deepDive: (
        <p>
          El <G k="reconstruccion">error de reconstrucción</G> baja de 4.00 por píxel (1 componente) a 0.47 (40). Los
          formatos de imagen como JPEG no usan PCA: usan una transformada fija (la del coseno), que no hay que
          calcular para cada imagen. <G k="pca">PCA</G> gana cuando todas las imágenes se parecen, como rostros o dígitos.
        </p>
      ),
    },
  },
  Ova: PcaOva,
  python: { code, expectedOutput, colabNotebook: 'pca' },
  inYourField: [
    { area: 'Industrial', example: 'resumir decenas de variables de un proceso en 2 o 3 componentes para vigilarlas en un solo gráfico de control.' },
    { area: 'Química', example: 'reducir un espectro de cientos de longitudes de onda a unos pocos componentes antes de calibrar.' },
    { area: 'Civil', example: 'resumir las mediciones de muchos sensores de una estructura para detectar cambios en su comportamiento.' },
  ],
  alternatives: ['autoencoders', 'random-forest'],
};

export default pca;
```

- [ ] **Step 7: Registrar el loader**

En `registry.ts`, dentro de `LOADERS`, justo después de

```ts
  dbscan: () => import('./algorithms/dbscan'),
```

añade (el orden de `LOADERS` no afecta al menú, pero así sigue el orden del menú):

```ts
  pca: () => import('./algorithms/pca'),
```

y en `registry.test.ts`, el test «marca como disponibles solo los algoritmos implementados» pasa a esperar:

```ts
    expect(AVAILABLE_SLUGS).toEqual([
      'linear-regression',
      'logistic-regression',
      'decision-tree',
      'random-forest',
      'gradient-boosting',
      'svm',
      'knn',
      'naive-bayes',
      'k-means',
      'hierarchical-clustering',
      'dbscan',
      'pca',
    ]);
```

- [ ] **Step 8: Recorrido con el módulo real**

Añade al final de `src/components/ml-explorer/MLExplorer.real.dom.test.tsx`:

```tsx
it('PCA real (?alg=pca): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=pca']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'PCA' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'formula') {
      expect(container.querySelector('.mlx-tabpanel svg[role="img"]')).not.toBeNull();
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('captura 66.5 %');
      expect(container.querySelector('.katex')).not.toBeNull();
    }
  }

  expect(error).not.toHaveBeenCalled();
});
```

- [ ] **Step 9: Notebook de Colab**

En `scripts/build-ml-notebook.py`, dentro de `ALGORITHMS` (mismo orden que el menú), añade justo después de la tupla de `"dbscan"`:

```python
    (
        "pca",
        "PCA (análisis de componentes principales)",
        "Compresión de imágenes: cada dígito de 64 píxeles guardado con k números.",
    ),
```

```bash
python3 scripts/build-ml-notebook.py
```
Expected: `Escrito notebooks/algoritmos-ml.ipynb y 12 notebooks individuales`.

- [ ] **Step 10: Description del artículo**

En `src/data/articles/algoritmos-ml-explorador.md`, en la línea `description:`, cambia «Los primeros once ya están completos» por «Los primeros doce ya están completos» (lo exige `algoritmos-ml-explorador.links.test.ts`).

- [ ] **Step 11: Verificación completa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
node scripts/check-ml-exercises-pyodide.mjs
```
Expected: todos los tests pasan (incluidos `registry.test.ts`, que comprueba que las alternativas de `pca` existen; `notebook.test.ts`, que compara los notebooks con el `.py`; `glossaryTerms.test.ts`, `glossaryDensity.test.ts`, `textSpacing.test.ts` y `render.test.ts` sobre los textos nuevos; y `algoritmos-ml-explorador.links.test.ts`); `tsc` sin errores; `✓ pca.py (Pyodide)` y los demás también.

Revisión manual con el servidor de desarrollo (`ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js`), en `#/articles/algoritmos-ml-explorador?alg=pca&tab=formula`: la OVA responde al teclado (Tab hasta los controles, flechas en los sliders, Enter/Espacio en los botones), las cifras iniciales coinciden con la tabla «Cifras clave», las fichas 💡 abren, y en «Ejemplo real» «▶ Ejecutar» da la misma salida que la esperada (y la figura).

- [ ] **Step 12: Commit**

```bash
git add src/components/ml-explorer/algorithms/python/pca.py src/components/ml-explorer/algorithms/python/pca.out.txt \
  src/components/ml-explorer/algorithms/python/outputs.test.ts \
  src/components/ml-explorer/ovas/PcaOva.tsx src/components/ml-explorer/ovas/PcaOva.dom.test.tsx \
  src/components/ml-explorer/algorithms/pca.tsx src/components/ml-explorer/registry.ts src/components/ml-explorer/registry.test.ts \
  src/components/ml-explorer/MLExplorer.real.dom.test.tsx scripts/build-ml-notebook.py ../notebooks/algoritmos-ml.ipynb ../notebooks/algoritmos-ml/pca.ipynb \
  src/data/articles/algoritmos-ml-explorador.md
git commit -m "feat(ml-explorer): add PCA with its simulator and exercise

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Artículo, verificación final, build y deploy

**Files:**
- Modify: `src/data/articles/algoritmos-ml-explorador.md`
- Modify: `src/pages/ArticleDetail.ml.dom.test.tsx`
- Build outputs en la raíz del repo (`../index.html`, `../assets/*`)

- [ ] **Step 1: El test de integración del artículo espera 12 enlaces (falla)**

En `src/pages/ArticleDetail.ml.dom.test.tsx`, cambia `expect(internal).toHaveLength(8);` por `expect(internal).toHaveLength(12);`.

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/pages/ArticleDetail.ml.dom.test.tsx`
Expected: FAIL (`expected … to have a length of 12 but got 8`).

- [ ] **Step 2: Enlaces en la guía «¿Qué algoritmo necesito?»**

En `algoritmos-ml-explorador.md`, en la pregunta 2, reemplaza la línea

```markdown
   - **No → aprendizaje no supervisado** (el modelo busca grupos o patrones sin respuesta). ¿Buscas grupos? K-Means, Hierarchical Clustering o DBSCAN *(próximamente)*. ¿Quieres resumir muchas columnas en pocas? PCA (análisis de componentes principales) *(próximamente)*.
```

por

```markdown
   - **No → aprendizaje no supervisado** (el modelo busca grupos o patrones sin respuesta). ¿Buscas grupos? Si esperas grupos compactos y tienes una idea de cuántos, [K-Means](#/articles/algoritmos-ml-explorador?alg=k-means&tab=type); si quieres ver grupos dentro de grupos y tienes pocos miles de datos, [Hierarchical Clustering](#/articles/algoritmos-ml-explorador?alg=hierarchical-clustering&tab=type); si los grupos tienen formas irregulares o hay puntos sueltos, [DBSCAN](#/articles/algoritmos-ml-explorador?alg=dbscan&tab=type). ¿Quieres resumir muchas columnas en pocas? [PCA](#/articles/algoritmos-ml-explorador?alg=pca&tab=type) (análisis de componentes principales).
```

`PCA` sigue explicado entre paréntesis la primera vez que aparece (lo comprueba `algoritmos-ml-explorador.links.test.ts`: acepta el paréntesis después del cierre del enlace). El único «(próximamente)» que queda en el artículo es el de las redes neuronales (fase 4). La description ya dice «Los primeros doce» desde la Task 7.

- [ ] **Step 3: Verificar**

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/pages/ArticleDetail.ml.dom.test.tsx src/data/articles/algoritmos-ml-explorador.links.test.ts`
Expected: PASS (los 12 enlaces apuntan a algoritmos disponibles y a pestañas válidas).

- [ ] **Step 4: Commit**

```bash
git add src/data/articles/algoritmos-ml-explorador.md src/pages/ArticleDetail.ml.dom.test.tsx
git commit -m "docs(article): link the phase 3 algorithms from the ML explorer guide

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Verificación completa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
node scripts/check-ml-exercises-pyodide.mjs
```

Salida verificada en la copia `v3` (con este mismo código):

```text
 Test Files  40 passed (40)
      Tests  492 passed (492)
```

`tsc` sin salida (sin errores), y los dos verificadores:

```text
✓ dbscan.py
✓ decision-tree.py
✓ gradient-boosting.py
✓ hierarchical-clustering.py
✓ k-means.py
✓ knn.py
✓ linear-regression.py
✓ logistic-regression.py
✓ naive-bayes.py
✓ pca.py
✓ random-forest.py
✓ svm.py
```

```text
✓ dbscan.py (Pyodide)
✓ decision-tree.py (Pyodide)
✓ gradient-boosting.py (Pyodide)
✓ hierarchical-clustering.py (Pyodide)
✓ k-means.py (Pyodide)
✓ knn.py (Pyodide)
✓ linear-regression.py (Pyodide)
✓ logistic-regression.py (Pyodide)
✓ naive-bayes.py (Pyodide)
✓ pca.py (Pyodide)
✓ random-forest.py (Pyodide)
✓ svm.py (Pyodide)
```

(Si se añadieron tests después de `b48cb78`, el número de tests será mayor; ninguno debe fallar.)

Ejecuta el notebook completo de punta a punta con el Python de verificación (el kernel `mlx-venv` ya está instalado desde la fase 1):

```bash
~/.cache/mlx-venv/bin/python -c "import nbformat, nbclient; nb = nbformat.read('../notebooks/algoritmos-ml.ipynb', 4); nbclient.NotebookClient(nb, kernel_name='mlx-venv', timeout=180).execute(); print('notebook OK')"
```
Expected: `notebook OK` (verificado en `v3`; el aviso `Kernel is running over TCP without encryption` es normal).

- [ ] **Step 6: Build**

Usa el skill `/portfolio-build` (tsc + vite build + actualización de hashes, con el arreglo de NTFS). Expected: build exitoso, con chunks separados (tamaños medidos en `v3`; los hashes cambiarán):

```text
../assets/dbscan-<hash>.js                    13.71 kB │ gzip: 5.34 kB
../assets/pca-<hash>.js                       14.15 kB │ gzip: 5.34 kB
../assets/hierarchical-clustering-<hash>.js   14.37 kB │ gzip: 5.62 kB
../assets/k-means-<hash>.js                   16.56 kB │ gzip: 6.35 kB
✓ built in 18.23s
✅ index.html OK — todos los assets referenciados existen (generado por vite).
```

El aviso `Unexpected "-" [css-syntax-error]` del minificador de CSS ya existía antes de esta fase y no lo causa este plan.

- [ ] **Step 7: Revisión en el navegador (build de producción)**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js preview
```
En `#/articles/algoritmos-ml-explorador`:
1. El menú muestra 12 algoritmos disponibles: los 8 supervisados, K-Means, Hierarchical Clustering y DBSCAN bajo «No supervisado» y PCA bajo «Reducción de dimensionalidad»; las 5 redes neuronales siguen como «pronto».
2. Al pasar el mouse por «K-Means» se descarga solo `k-means-*.js`.
3. En las 4 OVAs nuevas, las cifras iniciales coinciden con la tabla «Cifras clave de las OVAs» de este plan. En K-Means, «▶ Reproducir» anima los centroides hasta «Paso 6 de 6» y se pausa si la OVA sale de la pantalla.
4. Ejecuta los 4 ejercicios nuevos: cada «Tu salida» coincide con la «Salida esperada»; Hierarchical Clustering muestra el dendrograma y PCA la fila de dígitos reconstruidos.
5. En la pestaña «Tipo» de K-Means aparece la mini-figura de «No supervisado» (puntos grises con elipses) y en la de PCA la de «Reducción de dimensionalidad».
6. Los enlaces nuevos de la guía «¿Qué algoritmo necesito?» llevan a cada algoritmo, en la pestaña «Tipo».
7. Repite a 375 px de ancho: los botones de K-Means (arranque, paso, reproducir) y los dos sliders de DBSCAN caben sin desbordar, y en Hierarchical Clustering el dendrograma pasa debajo de los puntos.

- [ ] **Step 8: Deploy**

Usa el skill `/portfolio-deploy`. Pide confirmación al usuario antes del commit y push, como indica el skill. Sube solo `index.html`, los assets nuevos y los cambios de esta fase; no subas los cambios ajenos que ya estaban sin commit en el árbol.

Tras el push, comprueba en `https://stivenson.github.io/#/articles/algoritmos-ml-explorador?alg=pca&tab=realWorld` que el explorador carga y que «Abrir en Colab» abre `notebooks/algoritmos-ml/pca.ipynb`.

---

## Riesgos y decisiones

- **K-Means tiene más de un control** (K, arranque A/B y los botones de paso), aunque el spec pide «un solo control principal»: el control principal es K, y el spec mismo pide «iteraciones animadas»; el arranque B es lo que hace visible el mínimo local (la contra más importante de K-Means). Lo mismo con ε y minPts en DBSCAN, que el spec pide explícitamente.
- **Arranques aleatorios (Forgy), no k-means++, en la OVA.** Con k-means++ y estos datos, K-Means converge en 1 paso y no hay nada que animar. El texto explica que scikit-learn usa k-means++ por defecto. Los arranques A y B (semillas 11 y 12) se eligieron entre 30 semillas: A tarda 6 pasos y llega al óptimo (el mismo 15.18 de `KMeans(n_init=10)`); B se atasca.
- **Animación:** el paso se hace con `setTimeout` (900 ms) dentro de un efecto, que se cancela si la OVA sale de pantalla o se pausa; la transición de los centroides es CSS (`transform` en `style`, no el atributo `transform` del SVG, que no se puede animar con CSS). Las líneas punto→centroide saltan sin transición; se aceptó por simplicidad.
- **DBSCAN y empates de distancia.** El simulador usa `dist <= eps + 1e-9`; el dataset se revisó para que ninguna distancia caiga a menos de 1e-6 de un múltiplo de 0.1 (un punto se movió 0.01). Con eso, las 171 combinaciones coinciden con scikit-learn. Si se cambian los datos, hay que repetir la revisión (ver Regla 2).
- **Hierarchical Clustering O(n³).** La implementación directa recalcula el enlace promedio de todos los pares en cada unión; con 12 puntos son milisegundos y se calcula una vez al cargar el módulo (constantes `MERGES`, `LAYOUT`). No sirve para datos grandes, ni lo pretende.
- **Escala igual en x e y.** Las OVAs de PCA (ángulos) y DBSCAN (círculos de radio ε) usan `createPlot` con la misma cantidad de píxeles por unidad en ambos ejes; si se cambia el tamaño del SVG hay que conservar la proporción.
- **Ejercicios de 25 a 38 líneas** (el spec pide 10-25). Igual que en las fases 1 y 2, se priorizó que cuenten la historia completa: elegir K con dos métricas, el dendrograma con su corte, la compresión con la figura, y el contraste DBSCAN contra K-Means.
- **Datos simulados que salen «demasiado limpios».** En K-Means la silueta es 0.79 porque los datos se generaron con tres perfiles; el texto de Ejemplo real › A fondo lo advierte («con clientes reales la silueta suele ser bastante más baja»).
- **Alternativa «Autoencoders» de PCA** queda como «(próximamente)» hasta la fase 4; `registry.test.ts` solo exige que el slug exista en el registry.
