# Explorador de algoritmos de ML — Fase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar la fase 2 del explorador de algoritmos de ML: Random Forest, Gradient Boosting, SVM y Naive Bayes, cada uno con sus 8 pestañas (essential + deepDive), una OVA con teclado, el ejercicio de Python (idéntico en CPython y en Pyodide), 3 ejemplos «En tu área», y el artículo, los notebooks de Colab, el build y el deploy al día.

**Architecture:** Se sigue exactamente la arquitectura de la fase 1 tal como quedó en el código (no como la describía el plan de la fase 1): un módulo `algorithms/<slug>.tsx` por algoritmo, cargado con `import()` desde `registry.ts`; los ejercicios son `.py` + `.out.txt` que leen el explorador (`?raw`), el generador de notebooks y los dos verificadores; la matemática de las OVAs vive en `ovas/ovaMath.ts` (pura, determinista, con tests) y sus datos en `ovas/datasets.ts`, con las cifras citadas fijadas en `ovas/datasets.test.ts`. El bosque aleatorio usa un PRNG con semilla (`mulberry32`) y la SVM se resuelve con SMO (el método de LIBSVM), cuyas cifras se compararon con scikit-learn.

**Tech Stack:** React 19 + TypeScript + Vite 7, KaTeX, Vitest 3 (+ jsdom en los `.dom.test.tsx`), Pyodide 0.27.7 (numpy 2.0.2, scikit-learn 1.6.1, matplotlib 3.8.4, scipy 1.14.1), Python de verificación en `~/.cache/mlx-venv`.

**Spec:** `docs/superpowers/specs/2026-10-03-ml-algoritmos-explorador-design.md` (sección «Fase 2: ensambles y márgenes»). **Plan de referencia (formato):** `docs/superpowers/plans/2026-10-03-ml-explorador-fase-1.md`.

> **Todo el código de este plan ya se ejecutó** en una copia del repo (commit `da74e6a`): con él pasan los 32 archivos de test (293 tests), `tsc`, `vite build` y los dos verificadores de ejercicios (CPython y Pyodide real). Las cifras de los textos salen de esas ejecuciones; no las cambies a mano.

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
  - `~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py` (CPython; con `--update` regenera los `.out.txt`)
  - `node scripts/check-ml-exercises-pyodide.mjs` (Pyodide real; córrelo **después** del de CPython: no tiene timeout).
- **Git:** el árbol de trabajo tiene cambios ajenos sin commit (`extract_data.py`, `.claude/settings.local.json`, `calculo_diferencial/…`, etc.). **Haz `git add` solo de los archivos de cada task**, nunca `git add -A` ni `git add .`. Cada commit termina con la línea `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Redacción:** sigue `docs/redaccion/guia-facil-comprension.md` (conclusión primero, ejemplo con números antes de la fórmula, analogías de 1-2 frases o ninguna, jerga en el glosario 💡 con `<G k="…">`). Los textos de este plan ya la siguen: cópialos tal cual.

## Reglas heredadas de la fase 1 (de obligado cumplimiento)

Salen de los errores que hubo que corregir en la fase 1 (ver las enmiendas de las Tasks 17-19). Al revisar cada task, compruébalas una por una:

1. **Ninguna cifra sin test.** Toda cifra que aparezca en un texto o en una OVA está fijada por un test: la salida de Python en `algorithms/python/outputs.test.ts`; las de las OVAs en `ovas/datasets.test.ts` o en el `.dom.test.tsx` de la OVA. Si cambias un dato, el test te dice qué texto quedó viejo.
2. **Odds no es probabilidad.** En Naive Bayes cada palabra multiplica los *odds* (P(pos) ÷ P(neg)), no la probabilidad. Así está escrito en el texto, en la OVA y en el ejercicio.
3. **Ceteris paribus y matices de scikit-learn.** Los valores por defecto se citan como «en scikit-learn» (100 árboles en el bosque; 100 árboles, tasa 0.1 y profundidad 3 en boosting; kernel RBF, C = 1 y `gamma="scale"` en SVC; `alpha = 1` en MultinomialNB), y lo que es tendencia se dice como tendencia («suele», «en datos tabulares»).
4. **Nada de garantías absolutas.** Por ejemplo: «más árboles no sobreajustan» es falso dicho así; el texto dice que promediar reduce el sobreajuste y la OVA muestra que el bosque de 100 sigue votando «impago» en un punto de ruido.
5. **Pestañas sin contradicciones.** Ej.: Random Forest dice en Pros que reduce el sobreajuste y en Contras que el 100 % de entrenamiento engaña (ambos con las cifras del ejercicio).
6. **OVAs accesibles.** El `<svg>` lleva `role="img"` si no contiene elementos enfocables (las 4 OVAs nuevas: sus controles son sliders, botones e inputs fuera del svg, que ya funcionan con teclado) y `role="group"` si los contiene. Los textos estáticos van en el `hint` o en `children`, **nunca** dentro del readout (`role="status"`, que se relee en cada cambio). Los botones de opción llevan `aria-pressed`.
7. **Determinismo.** La matemática de las OVAs no usa `Math.random()`: el bosque usa `mulberry32` con semilla fija. Los ejercicios usan `random_state` fijo, `np.random.default_rng(<semilla>)`, ordenamientos estables y redondeo al imprimir. El ejercicio de Gradient Boosting lleva `min_samples_leaf=20` justamente por esto: sin él, la pérdida en datos nuevos difería en el tercer decimal entre CPython y Pyodide (con 100, 200 y 300 árboles imprimía 0.540/0.587/0.656 en CPython y 0.541/0.588/0.657 en Pyodide), por empates en los cortes de hojas pequeñas.
8. **Datasets solo inline o generados.** El ejercicio de SVM usa `load_digits`, que viene empaquetado en scikit-learn y funciona en Pyodide (verificado). Nada de `fetch_*`.

## Salida verificada de los 4 ejercicios

Cada `.out.txt` de abajo es byte a byte lo que imprimen `~/.cache/mlx-venv/bin/python` (CPython 3.12, numpy 2.0.2, scikit-learn 1.6.1) **y** Pyodide 0.27.7 en Node (cargando `pyodideSetup.py`, igual que el navegador). Gradient Boosting y SVM además generan una figura cada uno (en Pyodide: 1 PNG cada uno). Tiempos en Pyodide/Node, incluido el primer import de scikit-learn: 2.8 s (Naive Bayes), 4.5 s (Random Forest), 5.4 s (Gradient Boosting), 5.1 s (SVM); el límite del explorador es 15 s.

**Random Forest** (`random-forest.out.txt`):

```text
Fraudes: 303 de 1000 compras (30%)
Un árbol solo   → entrenamiento 100.0% | datos nuevos 77.7%
Bosque de 100   → entrenamiento 100.0% | datos nuevos 82.3%

Importancia de cada señal      impureza  permutación
  monto                        0.44       0.139
  distancia                    0.25       0.066
  hora                         0.13       0.041
  intentos                     0.06       0.015
  antigüedad                   0.12       -0.006
```

**Gradient Boosting** (`gradient-boosting.out.txt`):

```text
Impagos: 271 de 800 clientes
Árboles | pérdida entrenamiento | pérdida datos nuevos
      1 |                 0.620 |                0.619
     10 |                 0.530 |                0.529
     50 |                 0.437 |                0.506
    100 |                 0.386 |                0.526
    200 |                 0.317 |                0.565
    300 |                 0.265 |                0.611

Menor pérdida en datos nuevos: 0.504 con 24 árboles
```

**SVM** (`svm.out.txt`):

```text
1257 imágenes para entrenar, 540 nuevas para probar

Kernel  C      acierto en nuevas  vectores de soporte
linear  0.01               93.3%                 1158
linear  1                  98.5%                  386
linear  100                98.1%                  371
rbf     0.01               18.3%                 1257
rbf     1                  98.7%                  593
rbf     100                99.4%                  528

Con RBF y C = 1 falla 7 de 540. Por ejemplo:
  era un 8, dijo 1
  era un 9, dijo 5
  era un 8, dijo 9
```

**Naive Bayes** (`naive-bayes.out.txt`):

```text
16 reseñas, 38 palabras distintas
Prior: P(positiva) = 0.50

Reseña nueva                     P(positiva)
  excelente calidad llegó rápido  93%
  no funciona mala compra         5%
  llegó la batería nueva          28%

Palabras que más empujan a positiva: buena, excelente, encantó
Palabras que más empujan a negativa: mala, no, pésimo
«llegó» multiplica los odds de positiva por 0.70
«batería» multiplica los odds de positiva por 1.05
«la» multiplica los odds de positiva por 0.53
«nueva» no estaba en el entrenamiento: se ignora
```

## Cifras clave de las OVAs (calculadas con el código de este plan)

| OVA | Situación | Cifra que muestra |
|---|---|---|
| Random Forest | 1 / 3 / 10 / 30 / 100 árboles (semilla 1, profundidad 8) | entrenamiento 24 / 26 / 27 / 28 / 28 de 28; clientes nuevos 35 / 37 / 38 / 39 / 39 de 40 |
| Random Forest | Un árbol CART profundo (sin azar) | 28 de 28 y 36 de 40 |
| Random Forest | Voto del bosque de 100 en el ruido (3, 1.5) y (8, 8) | 60 % «impago» y 40 % «impago» |
| Gradient Boosting | Punto de partida (promedio) | 4.87, MSE 2.41 |
| Gradient Boosting | Primer tocón | corte en x = 4.25: +1.07 a la izquierda, −0.80 a la derecha |
| Gradient Boosting | MSE tras 1 / 10 / 50 árboles | tasa 0.1: 2.25 / 1.49 / 0.48 · tasa 0.3: 1.97 / 0.73 / 0.06 · tasa 1: 1.56 / 0.15 / 0.03 |
| SVM lineal | C = 0.01 / 0.1 / 1 / 10 / 100 | vectores de soporte 17 / 8 / 5 / 4 / 4; margen 7.03 / 3.74 / 2.13 / 1.94 / 1.94; siempre 21 de 22 |
| SVM RBF (γ = 0.3) | C = 0.01 / 0.1 / 1 / 10 / 100 | vectores de soporte 22 / 22 / 19 / 14 / 14; aciertos 21 / 21 / 21 / 22 / 22 |
| Naive Bayes | «excelente calidad llegó rápido» | ×5.27 · ×1.05 · ×0.70 · ×3.16 → odds 12.34 → 93 % |
| Naive Bayes | «no funciona mala compra» / «llegó la batería nueva» | 5 % / 28 % («nueva» se ignora) |
| Naive Bayes | «no me encantó» / «no fue nada excelente» | 68 % / 53 % (no ve el orden ni las negaciones) |

Las cifras de la SVM coinciden con `SVC(kernel=..., C=..., gamma=0.3, tol=1e-6)` de scikit-learn 1.6.1 (número de vectores de soporte exacto en los 10 casos; margen a 2 decimales). Las de Naive Bayes coinciden con `MultinomialNB` del ejercicio (mismas 16 reseñas).

## Mapa de archivos

| Archivo | Acción | Task |
|---|---|---|
| `src/components/ml-explorer/ovas/ovaMath.ts` | Modificar: extraer `bestSplitOnAxis`; añadir PRNG, bosque, boosting, SVM, Naive Bayes | 1 |
| `src/components/ml-explorer/ovas/ovaMath.fase2.test.ts` | Crear: tests unitarios de la matemática nueva | 1 |
| `src/components/ml-explorer/ovas/datasets.ts` | Modificar: datos de las 4 OVAs | 2 |
| `src/components/ml-explorer/ovas/datasets.test.ts` | Modificar: cifras de las 4 OVAs | 2 |
| `src/components/ml-explorer/glossary.ts` | Modificar: 8 términos nuevos, «Ensamble» corregido | 3 |
| `src/components/ml-explorer/ml-explorer.css` | Modificar: botones `aria-pressed`, input y lista de Naive Bayes | 3 |
| `src/components/ml-explorer/algorithms/python/<slug>.py` + `.out.txt` | Crear (×4) | 4-7 |
| `src/components/ml-explorer/algorithms/python/outputs.test.ts` | Modificar (×4) | 4-7 |
| `src/components/ml-explorer/ovas/<Nombre>Ova.tsx` + `.dom.test.tsx` | Crear (×4) | 4-7 |
| `src/components/ml-explorer/algorithms/<slug>.tsx` | Crear (×4) | 4-7 |
| `src/components/ml-explorer/registry.ts` + `registry.test.ts` | Modificar (×4) | 4-7 |
| `src/components/ml-explorer/MLExplorer.real.dom.test.tsx` | Modificar (×4) | 4-7 |
| `scripts/build-ml-notebook.py` + `../notebooks/algoritmos-ml.ipynb` + `../notebooks/algoritmos-ml/<slug>.ipynb` | Modificar / regenerar (×4) | 4-7 |
| `src/data/articles/algoritmos-ml-explorador.md` | Modificar: description en cada task (exige `algoritmos-ml-explorador.links.test.ts`); enlaces en la 8 | 4-8 |
| `src/components/ml-explorer/render.test.ts` | Modificar: su alternativa «próximamente» deja de ser Naive Bayes | 7 |
| `src/pages/ArticleDetail.ml.dom.test.tsx` | Modificar: 8 enlaces internos | 8 |

**Por qué cambia la description en cada task:** `algoritmos-ml-explorador.links.test.ts` exige que diga «Los primeros N ya están completos» con N = número de algoritmos disponibles en palabras. Al registrar Random Forest pasa a «cinco», luego «seis», «siete» y «ocho».

**Alternativas que se activan solas:** al registrar estos 4 algoritmos, los botones «Mejor prueba con» de la fase 1 que apuntaban a ellos pasan de «(próximamente)» a enlace. Se revisaron y tienen sentido: Decision Tree → Random Forest, Gradient Boosting; KNN → Random Forest, SVM; Linear Regression → Random Forest, Gradient Boosting (sus pestañas «Tipo» dicen que también predicen números); Logistic Regression → Random Forest, SVM. `registry.test.ts` ya verifica que toda alternativa exista.

---

### Task 1: Matemática de las OVAs de la fase 2

**Files:**
- Modify: `src/components/ml-explorer/ovas/ovaMath.ts`
- Create: `src/components/ml-explorer/ovas/ovaMath.fase2.test.ts`

Todo es puro y determinista: mismo dato, mismo resultado. El bosque usa `mulberry32`; la SVM, SMO sin elecciones al azar (par de máxima violación, como LIBSVM); Naive Bayes reproduce `CountVectorizer` + `MultinomialNB(alpha=1)`.

- [ ] **Step 1: Preparar esbuild**

```bash
test -f /tmp/esbuild-bin || (cp node_modules/@esbuild/linux-x64/bin/esbuild /tmp/esbuild-bin && chmod +x /tmp/esbuild-bin)
```

- [ ] **Step 2: Escribir los tests (fallan)**

Crea `src/components/ml-explorer/ovas/ovaMath.fase2.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  bestSplitOnAxis,
  boost,
  boostMse,
  buildForest,
  buildRandomTree,
  explainNaiveBayes,
  fitStump,
  forestAccuracy,
  forestPredict,
  forestVote,
  kernelValue,
  marginWidth,
  mulberry32,
  predictBoost,
  predictTree,
  supportVectors,
  svmAccuracy,
  svmDecision,
  svmWeights,
  tokenize,
  trainNaiveBayes,
  trainSvm,
  type LabeledPt,
} from './ovaMath';

describe('mulberry32', () => {
  it('con la misma semilla repite la secuencia; con otra, cambia', () => {
    const a = mulberry32(1);
    expect([a(), a(), a()]).toEqual([0.6270739405881613, 0.002735721180215478, 0.5274470399599522]);
    const b = mulberry32(1);
    expect(b()).toBe(0.6270739405881613);
    expect(mulberry32(2)()).not.toBe(0.6270739405881613);
  });

  it('da valores en [0, 1)', () => {
    const r = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

const fourCorners: LabeledPt[] = [
  { x: 1, y: 1, label: 0 },
  { x: 2, y: 1, label: 0 },
  { x: 1, y: 8, label: 1 },
  { x: 2, y: 9, label: 1 },
];

describe('bestSplitOnAxis', () => {
  it('encuentra el corte puro en y y ninguno útil en x', () => {
    expect(bestSplitOnAxis(fourCorners, 'y')).toEqual({ threshold: 4.5, score: 0 });
    expect(bestSplitOnAxis(fourCorners, 'x')?.score).toBe(0.5);
  });

  it('devuelve null si todos los valores del eje son iguales', () => {
    expect(bestSplitOnAxis([{ x: 1, y: 1, label: 0 }, { x: 1, y: 2, label: 1 }], 'x')).toBeNull();
  });
});

describe('buildRandomTree', () => {
  it('si el eje sorteado no sirve, prueba el otro', () => {
    // rng() = 0.1 < 0.5 → prueba x primero; x no mejora, así que corta en y.
    const tree = buildRandomTree(fourCorners, 3, () => 0.1);
    expect(tree.kind).toBe('split');
    if (tree.kind === 'split') {
      expect(tree.axis).toBe('y');
      expect(tree.threshold).toBe(4.5);
    }
  });

  it('respeta la profundidad 0 y los grupos puros', () => {
    expect(buildRandomTree(fourCorners, 0, () => 0.9).kind).toBe('leaf');
    expect(buildRandomTree(fourCorners.slice(0, 2), 5, () => 0.9).kind).toBe('leaf');
  });
});

describe('bosque', () => {
  it('es determinista y los primeros N árboles no dependen del total', () => {
    const big = buildForest(fourCorners, 10, 3, 7);
    expect(buildForest(fourCorners, 10, 3, 7)).toEqual(big);
    expect(buildForest(fourCorners, 4, 3, 7)).toEqual(big.slice(0, 4));
  });

  it('forestVote es la fracción de árboles que votan 1; con empate exacto gana la clase 0', () => {
    const leaf0 = { kind: 'leaf' as const, label: 0 as const, count: [1, 0] as [number, number] };
    const leaf1 = { kind: 'leaf' as const, label: 1 as const, count: [0, 1] as [number, number] };
    expect(forestVote([leaf0, leaf1, leaf1], { x: 0, y: 0 })).toBeCloseTo(2 / 3);
    expect(forestPredict([leaf0, leaf1], { x: 0, y: 0 })).toBe(0);
    expect(forestVote([], { x: 0, y: 0 })).toBe(0);
    expect(forestAccuracy([leaf1], fourCorners)).toBe(0.5);
  });

  it('cada árbol predice algo coherente con su muestra bootstrap', () => {
    for (const t of buildForest(fourCorners, 5, 3, 3)) expect([0, 1]).toContain(predictTree(t, { x: 1, y: 1 }));
  });
});

describe('gradient boosting', () => {
  it('fitStump elige el corte que separa los dos niveles', () => {
    expect(fitStump([0, 1, 2, 3], [1, 1, 5, 5])).toEqual({ threshold: 1.5, left: 1, right: 5 });
  });

  it('fitStump sin cortes posibles predice el promedio', () => {
    expect(fitStump([2, 2], [1, 3])).toEqual({ threshold: Infinity, left: 2, right: 2 });
  });

  it('con tasa 1 un solo tocón basta para un escalón; con tasa 0.5 queda a mitad de camino', () => {
    const xs = [0, 1, 2, 3];
    const ys = [1, 1, 5, 5];
    const full = boost(xs, ys, 1, 1);
    expect(full.base).toBe(3);
    expect(boostMse(full, xs, ys)).toBe(0);
    const half = boost(xs, ys, 1, 0.5);
    expect(predictBoost(half, 0)).toBe(2); // 3 + 0.5 · (−2)
    expect(boostMse(half, xs, ys)).toBe(1);
    // Cada paso nuevo corrige la mitad del residuo que queda.
    expect(boostMse(boost(xs, ys, 2, 0.5), xs, ys)).toBe(0.25);
  });

  it('predictBoost con steps = 0 es el promedio', () => {
    const m = boost([0, 1, 2, 3], [1, 1, 5, 5], 5, 0.3);
    expect(predictBoost(m, 0, 0)).toBe(3);
    expect(boostMse(m, [0, 1, 2, 3], [1, 1, 5, 5], 0)).toBe(4);
  });
});

describe('SVM', () => {
  const pair: LabeledPt[] = [
    { x: 0, y: 0, label: 0 },
    { x: 2, y: 0, label: 1 },
  ];

  it('kernelValue: producto punto y RBF', () => {
    expect(kernelValue({ kind: 'linear' }, { x: 1, y: 2 }, { x: 3, y: 4 })).toBe(11);
    expect(kernelValue({ kind: 'rbf', gamma: 0.5 }, { x: 0, y: 0 }, { x: 0, y: 2 })).toBeCloseTo(Math.exp(-2));
  });

  it('con dos puntos y C grande, la frontera pasa por el medio y el margen mide 2', () => {
    const m = trainSvm(pair, 100, { kind: 'linear' });
    expect(svmDecision(m, { x: 1, y: 5 })).toBeCloseTo(0, 6);
    expect(svmDecision(m, { x: 2, y: 0 })).toBeCloseTo(1, 6);
    expect(svmDecision(m, { x: 0, y: 0 })).toBeCloseTo(-1, 6);
    expect(svmWeights(m).x).toBeCloseTo(1, 6);
    expect(marginWidth(m)).toBeCloseTo(2, 6);
    expect(supportVectors(m)).toEqual([0, 1]);
    expect(svmAccuracy(m, pair)).toBe(1);
  });

  it('con C pequeño los α topan en C y el margen se ensancha', () => {
    const m = trainSvm(pair, 0.1, { kind: 'linear' });
    expect(m.alpha).toEqual([0.1, 0.1]);
    expect(marginWidth(m)).toBeCloseTo(10, 6);
  });

  it('respeta Σ αᵢ yᵢ = 0 y 0 ≤ αᵢ ≤ C', () => {
    const pts: LabeledPt[] = [
      { x: 1, y: 1, label: 0 },
      { x: 2, y: 2.5, label: 0 },
      { x: 3, y: 1, label: 0 },
      { x: 4, y: 4, label: 1 },
      { x: 5, y: 2, label: 1 },
      { x: 2.5, y: 2, label: 1 },
    ];
    for (const kernel of [{ kind: 'linear' } as const, { kind: 'rbf', gamma: 0.5 } as const]) {
      const m = trainSvm(pts, 1, kernel);
      const sum = m.alpha.reduce((s, a, i) => s + a * (pts[i].label ? 1 : -1), 0);
      expect(Math.abs(sum)).toBeLessThan(1e-9);
      for (const a of m.alpha) {
        expect(a).toBeGreaterThanOrEqual(0);
        expect(a).toBeLessThanOrEqual(1 + 1e-12);
      }
    }
  });
});

describe('Naive Bayes', () => {
  it('tokenize imita a CountVectorizer: minúsculas, sin signos, palabras de 2+ letras', () => {
    expect(tokenize('¡Excelente! Llegó a tiempo, 10/10 y')).toEqual(['excelente', 'llegó', 'tiempo', '10', '10']);
    expect(tokenize('')).toEqual([]);
  });

  it('con suavizado de Laplace, una palabra vista solo en una clase no anula la otra', () => {
    const model = trainNaiveBayes([
      { text: 'bueno bueno', label: 1 },
      { text: 'malo', label: 0 },
    ]);
    // Vocabulario de 2 palabras. P(bueno | pos) = (2 + 1) / (2 + 2); P(bueno | neg) = (0 + 1) / (1 + 2).
    expect(model.vocabulary).toEqual(['bueno', 'malo']);
    const e = explainNaiveBayes(model, 'bueno');
    expect(e.words[0].factor).toBeCloseTo((3 / 4) / (1 / 3));
    expect(e.priorOdds).toBe(1);
    expect(e.pPositive).toBeCloseTo(2.25 / 3.25);
  });

  it('una palabra desconocida no cambia nada; sin palabras queda el prior', () => {
    const model = trainNaiveBayes([
      { text: 'bueno', label: 1 },
      { text: 'malo', label: 0 },
      { text: 'malo malo', label: 0 },
    ]);
    const e = explainNaiveBayes(model, 'nuevo');
    expect(e.words).toEqual([{ word: 'nuevo', known: false, factor: 1 }]);
    expect(e.priorOdds).toBeCloseTo(0.5);
    expect(e.pPositive).toBeCloseTo(1 / 3);
  });
});
```

- [ ] **Step 3: Verificar que fallan**

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/ovaMath.fase2.test.ts`
Expected: FAIL; las funciones nuevas no existen (`… is not a function` / `does not provide an export named`).

- [ ] **Step 4: Extraer `bestSplitOnAxis` de `buildTree`**

En `ovaMath.ts`, reemplaza todo desde el comentario JSDoc que empieza «Árbol CART con impureza de Gini» hasta justo antes de `export function predictTree` por este bloque (el comportamiento de `buildTree` no cambia: sigue probando x y luego y, y solo cambia a y si mejora en más de 1e-12):

```ts
/**
 * El mejor corte sobre un eje: punto medio entre valores consecutivos con la
 * menor impureza de Gini ponderada. null si todos los valores son iguales.
 */
export function bestSplitOnAxis(points: LabeledPt[], axis: 'x' | 'y'): { threshold: number; score: number } | null {
  const values = [...new Set(points.map((p) => p[axis]))].sort((a, b) => a - b);
  let best: { threshold: number; score: number } | null = null;
  for (let i = 0; i < values.length - 1; i++) {
    const threshold = (values[i] + values[i + 1]) / 2;
    const left = points.filter((p) => p[axis] <= threshold);
    const right = points.filter((p) => p[axis] > threshold);
    const score = (left.length * gini(countLabels(left)) + right.length * gini(countLabels(right))) / points.length;
    if (best === null || score < best.score - 1e-12) best = { threshold, score };
  }
  return best;
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
    const split = bestSplitOnAxis(points, axis);
    if (split !== null && (best === null || split.score < best.score - 1e-12)) best = { axis, ...split };
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
```

- [ ] **Step 5: Añadir la matemática nueva al final de `ovaMath.ts`**

```ts

// ---------- Aleatoriedad reproducible ----------

/**
 * Generador pseudoaleatorio mulberry32: con la misma semilla da siempre la
 * misma secuencia de números en [0, 1). Las OVAs lo usan en lugar de
 * Math.random() para que el bosque (y las cifras que citan los textos) sea
 * el mismo en cada visita y en cada test.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Random Forest ----------

/**
 * Árbol del bosque: como buildTree, pero en cada nodo prueba primero un eje
 * elegido al azar (max_features = 1 con dos features) y solo si ese eje no
 * mejora la impureza prueba el otro. Así los árboles se parecen menos entre sí.
 */
export function buildRandomTree(points: LabeledPt[], maxDepth: number, rng: () => number): TreeNode {
  const count = countLabels(points);
  const leaf: TreeNode = { kind: 'leaf', label: count[1] > count[0] ? 1 : 0, count };
  if (maxDepth <= 0 || points.length < 2 || count[0] === 0 || count[1] === 0) return leaf;
  const axes: ('x' | 'y')[] = rng() < 0.5 ? ['x', 'y'] : ['y', 'x'];
  for (const axis of axes) {
    const split = bestSplitOnAxis(points, axis);
    if (split === null || split.score >= gini(count) - 1e-12) continue;
    const { threshold } = split;
    return {
      kind: 'split',
      axis,
      threshold,
      count,
      left: buildRandomTree(points.filter((p) => p[axis] <= threshold), maxDepth - 1, rng),
      right: buildRandomTree(points.filter((p) => p[axis] > threshold), maxDepth - 1, rng),
    };
  }
  return leaf;
}

/**
 * Bosque de `nTrees` árboles. Cada uno aprende de una muestra bootstrap
 * (n puntos sacados con reposición) y con ejes al azar. Todo sale de una sola
 * semilla: los primeros N árboles de un bosque de 100 son el bosque de N.
 */
export function buildForest(points: LabeledPt[], nTrees: number, maxDepth: number, seed: number): TreeNode[] {
  const rng = mulberry32(seed);
  const trees: TreeNode[] = [];
  for (let t = 0; t < nTrees; t++) {
    const sample = points.map(() => points[Math.floor(rng() * points.length)]);
    trees.push(buildRandomTree(sample, maxDepth, rng));
  }
  return trees;
}

/** Fracción de árboles que votan «clase 1» en el punto p. */
export function forestVote(trees: TreeNode[], p: Pt): number {
  if (trees.length === 0) return 0;
  return trees.reduce((s, t) => s + predictTree(t, p), 0) / trees.length;
}

/** Clase del bosque: mayoría; con empate exacto, clase 0. */
export function forestPredict(trees: TreeNode[], p: Pt): 0 | 1 {
  return forestVote(trees, p) > 0.5 ? 1 : 0;
}

export function forestAccuracy(trees: TreeNode[], points: LabeledPt[]): number {
  if (points.length === 0) return 0;
  return points.filter((p) => forestPredict(trees, p) === p.label).length / points.length;
}

// ---------- Gradient Boosting ----------

/** Un «tocón»: árbol de regresión de un solo corte. */
export interface Stump {
  threshold: number;
  left: number;
  right: number;
}

/** El corte que más reduce la suma de errores al cuadrado de `ys`. */
export function fitStump(xs: number[], ys: number[]): Stump {
  const mean = (v: number[]) => (v.length ? v.reduce((s, a) => s + a, 0) / v.length : 0);
  const values = [...new Set(xs)].sort((a, b) => a - b);
  let best: (Stump & { sse: number }) | null = null;
  for (let i = 0; i < values.length - 1; i++) {
    const threshold = (values[i] + values[i + 1]) / 2;
    const l = ys.filter((_, k) => xs[k] <= threshold);
    const r = ys.filter((_, k) => xs[k] > threshold);
    const left = mean(l);
    const right = mean(r);
    const sse = l.reduce((s, y) => s + (y - left) ** 2, 0) + r.reduce((s, y) => s + (y - right) ** 2, 0);
    if (best === null || sse < best.sse - 1e-12) best = { threshold, left, right, sse };
  }
  if (best === null) return { threshold: Infinity, left: mean(ys), right: mean(ys) };
  return { threshold: best.threshold, left: best.left, right: best.right };
}

export interface BoostModel {
  /** Predicción inicial: el promedio de y. */
  base: number;
  learningRate: number;
  stumps: Stump[];
}

/**
 * Gradient boosting para regresión con pérdida cuadrática: cada tocón se
 * ajusta a los residuos de la suma anterior y entra multiplicado por la
 * tasa de aprendizaje.
 */
export function boost(xs: number[], ys: number[], nSteps: number, learningRate: number): BoostModel {
  const base = ys.length ? ys.reduce((s, y) => s + y, 0) / ys.length : 0;
  const pred = xs.map(() => base);
  const stumps: Stump[] = [];
  for (let m = 0; m < nSteps; m++) {
    const residuals = ys.map((y, i) => y - pred[i]);
    const s = fitStump(xs, residuals);
    stumps.push(s);
    for (let i = 0; i < xs.length; i++) pred[i] += learningRate * (xs[i] <= s.threshold ? s.left : s.right);
  }
  return { base, learningRate, stumps };
}

/** Predicción usando solo los primeros `steps` tocones (por defecto, todos). */
export function predictBoost(model: BoostModel, x: number, steps = model.stumps.length): number {
  let y = model.base;
  for (const s of model.stumps.slice(0, steps)) y += model.learningRate * (x <= s.threshold ? s.left : s.right);
  return y;
}

export function boostMse(model: BoostModel, xs: number[], ys: number[], steps = model.stumps.length): number {
  if (xs.length === 0) return 0;
  return xs.reduce((s, x, i) => s + (ys[i] - predictBoost(model, x, steps)) ** 2, 0) / xs.length;
}

// ---------- SVM ----------

export type Kernel = { kind: 'linear' } | { kind: 'rbf'; gamma: number };

export function kernelValue(k: Kernel, a: Pt, b: Pt): number {
  if (k.kind === 'linear') return a.x * b.x + a.y * b.y;
  return Math.exp(-k.gamma * ((a.x - b.x) ** 2 + (a.y - b.y) ** 2));
}

export interface SvmModel {
  kernel: Kernel;
  points: LabeledPt[];
  /** Multiplicadores de Lagrange αᵢ (0 ≤ αᵢ ≤ C). αᵢ > 0 ⇔ vector de soporte. */
  alpha: number[];
  /** Sesgo: f(x) = Σ αᵢ yᵢ K(xᵢ, x) + b. */
  b: number;
}

const sign = (label: 0 | 1) => (label === 1 ? 1 : -1);

/**
 * SVM de margen suave resuelto con SMO (el método de LIBSVM, que es lo que
 * usa scikit-learn por dentro): en cada paso elige el par de αᵢ que más viola
 * las condiciones de óptimo y lo optimiza de forma exacta. Determinista: no
 * hay elecciones al azar.
 */
export function trainSvm(points: LabeledPt[], C: number, kernel: Kernel, tol = 1e-6, maxIterations = 1_000_000): SvmModel {
  const n = points.length;
  const y = points.map((p) => sign(p.label));
  const K = points.map((a) => points.map((b) => kernelValue(kernel, a, b)));
  const alpha = new Array<number>(n).fill(0);
  const G = new Array<number>(n).fill(-1); // gradiente del dual: (Qα)ᵢ − 1
  const isUp = (t: number) => (y[t] === 1 ? alpha[t] < C : alpha[t] > 0);
  const isLow = (t: number) => (y[t] === 1 ? alpha[t] > 0 : alpha[t] < C);

  for (let it = 0; it < maxIterations; it++) {
    let i = -1;
    let j = -1;
    let gMax = -Infinity;
    let gMin = Infinity;
    for (let t = 0; t < n; t++) {
      const v = -y[t] * G[t];
      if (isUp(t) && v > gMax) {
        gMax = v;
        i = t;
      }
      if (isLow(t) && v < gMin) {
        gMin = v;
        j = t;
      }
    }
    if (i < 0 || j < 0 || gMax - gMin < tol) break;

    const quad = Math.max(K[i][i] + K[j][j] - 2 * K[i][j], 1e-12);
    const oldI = alpha[i];
    const oldJ = alpha[j];
    // Paso exacto sobre la recta yᵢαᵢ + yⱼαⱼ = constante, recortado a la caja [0, C].
    let ai = oldI + (y[i] * (gMax - gMin)) / quad;
    const s = y[i] * oldI + y[j] * oldJ;
    ai = Math.min(C, Math.max(0, ai));
    let aj = y[j] * (s - y[i] * ai);
    if (aj < 0 || aj > C) {
      aj = Math.min(C, Math.max(0, aj));
      ai = y[i] * (s - y[j] * aj);
    }
    alpha[i] = ai;
    alpha[j] = aj;
    const di = ai - oldI;
    const dj = aj - oldJ;
    for (let t = 0; t < n; t++) G[t] += y[t] * (y[i] * K[t][i] * di + y[j] * K[t][j] * dj);
  }

  // Sesgo como en LIBSVM: promedio sobre los vectores libres (0 < α < C);
  // si no hay, el punto medio del intervalo permitido.
  let sum = 0;
  let free = 0;
  let ub = Infinity;
  let lb = -Infinity;
  for (let t = 0; t < n; t++) {
    const yG = y[t] * G[t];
    if (alpha[t] > 1e-9 && alpha[t] < C - 1e-9) {
      sum += yG;
      free++;
    } else if ((y[t] === 1 && alpha[t] <= 1e-9) || (y[t] === -1 && alpha[t] >= C - 1e-9)) {
      ub = Math.min(ub, yG);
    } else {
      lb = Math.max(lb, yG);
    }
  }
  const rho = free > 0 ? sum / free : (ub + lb) / 2;
  return { kernel, points, alpha, b: -rho };
}

/** f(x): positivo → clase 1; |f(x)| = 1 son los bordes del margen. */
export function svmDecision(m: SvmModel, p: Pt): number {
  let f = m.b;
  for (let i = 0; i < m.points.length; i++) {
    if (m.alpha[i] > 0) f += m.alpha[i] * sign(m.points[i].label) * kernelValue(m.kernel, m.points[i], p);
  }
  return f;
}

/** Índices de los vectores de soporte (α > 1e-8). */
export function supportVectors(m: SvmModel): number[] {
  return m.alpha.flatMap((a, i) => (a > 1e-8 ? [i] : []));
}

/** Solo kernel lineal: w = Σ αᵢ yᵢ xᵢ. */
export function svmWeights(m: SvmModel): Pt {
  let wx = 0;
  let wy = 0;
  m.alpha.forEach((a, i) => {
    wx += a * sign(m.points[i].label) * m.points[i].x;
    wy += a * sign(m.points[i].label) * m.points[i].y;
  });
  return { x: wx, y: wy };
}

/** Solo kernel lineal: ancho del margen, 2 / ‖w‖. */
export function marginWidth(m: SvmModel): number {
  const w = svmWeights(m);
  return 2 / Math.hypot(w.x, w.y);
}

export function svmAccuracy(m: SvmModel, points: LabeledPt[]): number {
  if (points.length === 0) return 0;
  return points.filter((p) => (svmDecision(m, p) > 0 ? 1 : 0) === p.label).length / points.length;
}

// ---------- Naive Bayes ----------

/** Como CountVectorizer de scikit-learn: minúsculas y palabras de 2+ letras. */
export function tokenize(text: string): string[] {
  return (text.normalize('NFC').toLowerCase().match(/[\p{L}\p{M}\p{N}_]+/gu) ?? []).filter(
    (w) => [...w].length >= 2,
  );
}

export interface NaiveBayesModel {
  vocabulary: string[];
  /** log P(clase), [negativa, positiva]. */
  logPrior: [number, number];
  /** log P(palabra | clase) por palabra, con suavizado de Laplace. */
  logLikelihood: Map<string, [number, number]>;
}

/** MultinomialNB con suavizado alpha (1 = Laplace), igual que scikit-learn. */
export function trainNaiveBayes(docs: { text: string; label: 0 | 1 }[], alpha = 1): NaiveBayesModel {
  const counts = new Map<string, [number, number]>();
  const docsPerClass: [number, number] = [0, 0];
  const wordsPerClass: [number, number] = [0, 0];
  for (const d of docs) {
    docsPerClass[d.label]++;
    for (const w of tokenize(d.text)) {
      const c = counts.get(w) ?? [0, 0];
      c[d.label]++;
      counts.set(w, c);
      wordsPerClass[d.label]++;
    }
  }
  const vocabulary = [...counts.keys()].sort();
  const V = vocabulary.length;
  const logLikelihood = new Map<string, [number, number]>();
  for (const w of vocabulary) {
    const c = counts.get(w)!;
    logLikelihood.set(w, [
      Math.log((c[0] + alpha) / (wordsPerClass[0] + alpha * V)),
      Math.log((c[1] + alpha) / (wordsPerClass[1] + alpha * V)),
    ]);
  }
  const n = docs.length;
  return { vocabulary, logPrior: [Math.log(docsPerClass[0] / n), Math.log(docsPerClass[1] / n)], logLikelihood };
}

export interface WordEvidence {
  word: string;
  /** false: la palabra no estaba en el entrenamiento y se ignora. */
  known: boolean;
  /** Por cuánto multiplica los odds de «positiva»: P(w | pos) / P(w | neg). */
  factor: number;
}

export interface NaiveBayesExplanation {
  words: WordEvidence[];
  /** Odds a priori: P(pos) / P(neg). */
  priorOdds: number;
  /** P(positiva | texto). */
  pPositive: number;
}

/** Explica la predicción palabra por palabra: odds finales = odds a priori × Π factores. */
export function explainNaiveBayes(model: NaiveBayesModel, text: string): NaiveBayesExplanation {
  let logOdds = model.logPrior[1] - model.logPrior[0];
  const priorOdds = Math.exp(logOdds);
  const words = tokenize(text).map((word) => {
    const ll = model.logLikelihood.get(word);
    if (!ll) return { word, known: false, factor: 1 };
    logOdds += ll[1] - ll[0];
    return { word, known: true, factor: Math.exp(ll[1] - ll[0]) };
  });
  return { words, priorOdds, pPositive: 1 / (1 + Math.exp(-logOdds)) };
}
```

- [ ] **Step 6: Verificar que pasan (y que el árbol de la fase 1 no cambió)**

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/`
Expected: PASS en todos, incluidos `ovaMath.test.ts`, `datasets.test.ts` y `DecisionTreeOva.dom.test.tsx` de la fase 1 (garantizan que el refactor de `buildTree` no alteró nada).

Run: `node node_modules/typescript/bin/tsc --noEmit -p .`
Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
git add src/components/ml-explorer/ovas/ovaMath.ts src/components/ml-explorer/ovas/ovaMath.fase2.test.ts
git commit -m "feat(ml-explorer): add the math for the phase 2 simulators

Seeded PRNG, random forest with bootstrap, gradient boosting with stumps,
SMO-based SVM and multinomial naive Bayes, all deterministic.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Datos de las OVAs y las cifras que citan los textos

**Files:**
- Modify: `src/components/ml-explorer/ovas/datasets.ts`
- Modify: `src/components/ml-explorer/ovas/datasets.test.ts`

- [ ] **Step 1: Escribir los tests (fallan)**

En `datasets.test.ts`, reemplaza los dos bloques `import { … } from './datasets';` y `import { … } from './ovaMath';` del inicio por estos (todo lo anterior a `describe('OVA de regresión lineal'`):

```ts
import { describe, expect, it } from 'vitest';
import {
  FOREST_DEPTH,
  FOREST_SEED,
  FOREST_SIZES,
  FOREST_TEST,
  GB_MAX_STEPS,
  GB_RATES,
  GB_XS,
  GB_YS,
  KNN_POINTS,
  KNN_START,
  LOGISTIC_B0,
  LOGISTIC_B1,
  LOGISTIC_XS,
  LOGISTIC_YS,
  LR_INITIAL,
  LR_OUTLIER,
  NB_REVIEWS,
  NB_START,
  SVM_CS,
  SVM_GAMMA,
  SVM_POINTS,
  TREE_POINTS,
} from './datasets';
import {
  accuracy,
  boost,
  boostMse,
  buildForest,
  buildTree,
  countLeaves,
  explainNaiveBayes,
  fitLine,
  fitLogistic1D,
  forestAccuracy,
  forestVote,
  knnVote,
  marginWidth,
  mse,
  predictTree,
  sigmoid,
  snap,
  supportVectors,
  svmAccuracy,
  svmDecision,
  trainNaiveBayes,
  trainSvm,
} from './ovaMath';
```

Y añade al final del archivo:

```ts
describe('OVA de Random Forest', () => {
  const forest = buildForest(TREE_POINTS, 100, FOREST_DEPTH, FOREST_SEED);

  it('los datos nuevos siguen la regla «impago si deuda > 5.25»: 20 y 20, sin puntos en la frontera', () => {
    expect(FOREST_TEST).toHaveLength(40);
    expect(FOREST_TEST.filter((p) => p.label === 1)).toHaveLength(20);
    for (const p of FOREST_TEST) expect(p.label).toBe(p.y > 5.25 ? 1 : 0);
    expect(new Set(FOREST_TEST.map((p) => `${p.x},${p.y}`)).size).toBe(40);
  });

  it.each([
    { n: 1, train: 24, test: 35 },
    { n: 3, train: 26, test: 37 },
    { n: 10, train: 27, test: 38 },
    { n: 30, train: 28, test: 39 },
    { n: 100, train: 28, test: 39 },
  ])('$n árboles → $train de 28 en entrenamiento y $test de 40 nuevos', ({ n, train, test }) => {
    expect(FOREST_SIZES).toContain(n);
    const trees = forest.slice(0, n);
    expect(forestAccuracy(trees, TREE_POINTS) * 28).toBeCloseTo(train, 9);
    expect(forestAccuracy(trees, FOREST_TEST) * 40).toBeCloseTo(test, 9);
  });

  it('un solo árbol profundo (sin azar) acierta 36 de 40 nuevos: el bosque de 100 lo supera (39)', () => {
    expect(accuracy(buildTree(TREE_POINTS, FOREST_DEPTH), TREE_POINTS)).toBe(1);
    expect(accuracy(buildTree(TREE_POINTS, FOREST_DEPTH), FOREST_TEST) * 40).toBeCloseTo(36, 9);
  });

  it('el bosque de 100 aún vota «impago» en el ruido de (3, 1.5) (60 de 100): el 100 % de entrenamiento no prueba nada', () => {
    expect(forestVote(forest, { x: 3, y: 1.5 })).toBeCloseTo(0.6, 9);
    expect(forestVote(forest, { x: 8, y: 8 })).toBeCloseTo(0.4, 9);
  });
});

describe('OVA de Gradient Boosting', () => {
  it('21 puntos de x = 0 a 10; el punto de partida es el promedio, 4.87, con MSE 2.41', () => {
    expect(GB_XS).toHaveLength(21);
    expect(GB_YS).toHaveLength(21);
    const m = boost(GB_XS, GB_YS, GB_MAX_STEPS, 0.3);
    expect(m.base).toBeCloseTo(4.867, 3);
    expect(boostMse(m, GB_XS, GB_YS, 0).toFixed(2)).toBe('2.41');
  });

  it('el primer tocón corta en x = 4.25: suma 1.07 a la izquierda y resta 0.80 a la derecha', () => {
    const [first] = boost(GB_XS, GB_YS, 1, 0.3).stumps;
    expect(first.threshold).toBe(4.25);
    expect(first.left.toFixed(2)).toBe('1.07');
    expect(first.right.toFixed(2)).toBe('-0.80');
  });

  it.each([
    { rate: 0.1, mse: ['2.25', '1.49', '0.48'] },
    { rate: 0.3, mse: ['1.97', '0.73', '0.06'] },
    { rate: 1, mse: ['1.56', '0.15', '0.03'] },
  ])('tasa $rate → MSE tras 1, 10 y 50 pasos: $mse', ({ rate, mse }) => {
    expect(GB_RATES).toContain(rate);
    const m = boost(GB_XS, GB_YS, GB_MAX_STEPS, rate);
    expect([1, 10, 50].map((k) => boostMse(m, GB_XS, GB_YS, k).toFixed(2))).toEqual(mse);
  });
});

describe('OVA de SVM', () => {
  const outlier = SVM_POINTS.findIndex((p) => p.x === 4.1 && p.y === 3.1);

  it('22 puntos; el punto raro (4.1, 3.1) es de la clase 1', () => {
    expect(SVM_POINTS).toHaveLength(22);
    expect(outlier).toBe(21);
    expect(SVM_POINTS[outlier].label).toBe(1);
  });

  // Cifras comparadas con scikit-learn 1.6.1: SVC(kernel=..., C=..., gamma=0.3, tol=1e-6).
  it.each([
    { C: 0.01, sv: 17, margin: '7.03' },
    { C: 0.1, sv: 8, margin: '3.74' },
    { C: 1, sv: 5, margin: '2.13' },
    { C: 10, sv: 4, margin: '1.94' },
    { C: 100, sv: 4, margin: '1.94' },
  ])('lineal, C = $C → $sv vectores de soporte, margen $margin; el punto raro siempre falla', ({ C, sv, margin }) => {
    expect(SVM_CS).toContain(C);
    const m = trainSvm(SVM_POINTS, C, { kind: 'linear' });
    expect(supportVectors(m)).toHaveLength(sv);
    expect(marginWidth(m).toFixed(2)).toBe(margin);
    expect(svmAccuracy(m, SVM_POINTS) * 22).toBeCloseTo(21, 9);
    expect(svmDecision(m, SVM_POINTS[outlier])).toBeLessThan(0);
  });

  it.each([
    { C: 0.01, sv: 22, hits: 21 },
    { C: 0.1, sv: 22, hits: 21 },
    { C: 1, sv: 19, hits: 21 },
    { C: 10, sv: 14, hits: 22 },
    { C: 100, sv: 14, hits: 22 },
  ])('RBF (γ = 0.3), C = $C → $sv vectores de soporte, acierta $hits de 22', ({ C, sv, hits }) => {
    const m = trainSvm(SVM_POINTS, C, { kind: 'rbf', gamma: SVM_GAMMA });
    expect(supportVectors(m)).toHaveLength(sv);
    expect(svmAccuracy(m, SVM_POINTS) * 22).toBeCloseTo(hits, 9);
    expect(svmDecision(m, SVM_POINTS[outlier]) > 0).toBe(hits === 22);
  });
});

describe('OVA de Naive Bayes', () => {
  const model = trainNaiveBayes(NB_REVIEWS);

  it('16 reseñas mitad y mitad, 38 palabras distintas (igual que el ejercicio de Python)', () => {
    expect(NB_REVIEWS).toHaveLength(16);
    expect(NB_REVIEWS.filter((r) => r.label === 1)).toHaveLength(8);
    expect(model.vocabulary).toHaveLength(38);
  });

  it.each([
    { text: NB_START, p: '93' },
    { text: 'no funciona mala compra', p: '5' },
    { text: 'llegó la batería nueva', p: '28' },
  ])('«$text» → P(positiva) = $p % (lo mismo que imprime MultinomialNB)', ({ text, p }) => {
    expect((explainNaiveBayes(model, text).pPositive * 100).toFixed(0)).toBe(p);
  });

  it('los factores de la frase inicial: excelente ×5.27, calidad ×1.05, llegó ×0.70, rápido ×3.16', () => {
    const e = explainNaiveBayes(model, NB_START);
    expect(e.words.map((w) => `${w.word} ×${w.factor.toFixed(2)}`)).toEqual([
      'excelente ×5.27',
      'calidad ×1.05',
      'llegó ×0.70',
      'rápido ×3.16',
    ]);
  });

  it('«nueva» no está en el vocabulario y se ignora; «la» multiplica por 0.53', () => {
    const e = explainNaiveBayes(model, 'llegó la batería nueva');
    expect(e.words[3]).toEqual({ word: 'nueva', known: false, factor: 1 });
    expect(e.words[1].factor.toFixed(2)).toBe('0.53');
  });

  it('«batería» (una vez en cada clase) multiplica por 78/74 ≈ 1.05: las positivas suman 36 palabras y las negativas 40', () => {
    const [b] = explainNaiveBayes(model, 'batería').words;
    expect(b.factor).toBeCloseTo((2 / (36 + 38)) / (2 / (40 + 38)), 12);
    expect(b.factor.toFixed(2)).toBe('1.05');
  });

  it('no ve el orden ni las negaciones: «no me encantó» sale 68 % y «no fue nada excelente», 53 %', () => {
    expect((explainNaiveBayes(model, 'no me encantó').pPositive * 100).toFixed(0)).toBe('68');
    expect((explainNaiveBayes(model, 'no fue nada excelente').pPositive * 100).toFixed(0)).toBe('53');
  });
});
```

- [ ] **Step 2: Verificar que fallan**

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/datasets.test.ts`
Expected: FAIL; `FOREST_TEST`, `GB_XS`, `SVM_POINTS`, `NB_REVIEWS`… no existen.

- [ ] **Step 3: Añadir los datos al final de `datasets.ts`**

`FOREST_TEST` se generó con `mulberry32(2024)` (coordenadas en pasos de 0.5, sin repetidos, fuera de la franja |deuda − 5.25| < 0.3) y se pegó aquí como literal. `GB_YS` = `4 + 2.5·sin(0.7x) + 0.15x` más ruido de `mulberry32(11)`, redondeado a 1 decimal y pegado como literal. `NB_REVIEWS` son exactamente las 16 reseñas de `naive-bayes.py` (Task 7): si cambias una, cambia la otra.

```ts

// ---------- Random Forest (mismos clientes del árbol; x = ingreso, y = deuda) ----------
// El bosque aprende de TREE_POINTS (con sus dos puntos de ruido) y se evalúa
// en FOREST_TEST: 40 clientes nuevos que siguen la regla limpia «impago si
// la deuda pasa de 5.25». Ningún punto nuevo cae justo en la frontera.

export const FOREST_TEST: LabeledPt[] = [
  ...labeled(
    [
      [3.5, 1.5], [5, 1], [4.5, 4.5], [9.5, 1.5], [0, 3.5], [3, 4], [2, 4.5], [3.5, 4.5], [9.5, 1], [8, 1],
      [9, 4], [7, 0], [3, 3.5], [8, 2], [2.5, 4], [9, 1], [3, 1], [8, 4.5], [5, 0.5], [8.5, 0.5],
    ],
    0,
  ),
  ...labeled(
    [
      [8, 7], [6.5, 7], [5, 6.5], [4.5, 7], [6.5, 8], [0, 6], [10, 9], [3, 9], [4, 7.5], [1, 6.5],
      [6.5, 7.5], [4.5, 8], [9, 9.5], [2, 7], [3.5, 7.5], [3.5, 6], [2, 6.5], [1.5, 6], [5.5, 9], [7.5, 7],
    ],
    1,
  ),
];

/** Semilla del bosque: con ella los textos citan cifras que no cambian. */
export const FOREST_SEED = 1;
/** Profundidad máxima de cada árbol: con 28 puntos, 8 equivale a «sin límite». */
export const FOREST_DEPTH = 8;
/** Tamaños del bosque que ofrece el slider. */
export const FOREST_SIZES = [1, 3, 10, 30, 100] as const;

// ---------- Gradient Boosting (regresión de una variable) ----------
// Una curva con forma de ola y algo de ruido: un solo corte no la explica,
// muchos cortes pequeños sumados sí.

export const GB_XS = Array.from({ length: 21 }, (_, i) => i / 2);
export const GB_YS = [4, 5, 5.9, 6.5, 7.2, 6.9, 6.1, 6.2, 5.6, 4.6, 3.8, 3.6, 2.6, 2.7, 2.8, 2.6, 3.2, 4.2, 5.3, 6.2, 7.2];
export const GB_RATES = [0.1, 0.3, 1] as const;
export const GB_MAX_STEPS = 50;

// ---------- SVM (dos grupos y un punto raro de la clase 1 dentro de la 0) ----------
// Coordenadas con decimales a propósito: con valores redondos varios puntos
// caen justo en el borde del margen y el número de vectores de soporte deja
// de estar bien definido.

export const SVM_POINTS: LabeledPt[] = [
  ...labeled(
    [
      [1.2, 2.1], [2.3, 0.9], [2.1, 3.6], [3.2, 2.2], [0.9, 5.1], [3.6, 4.3],
      [4.7, 1.4], [2.6, 6.2], [6.1, 2.3], [5.2, 3.4], [1.4, 7.3],
    ],
    0,
  ),
  ...labeled(
    [
      [6.2, 7.1], [7.6, 5.8], [7.1, 8.6], [8.4, 7.4], [5.1, 8.7], [8.9, 4.4],
      [6.6, 9.3], [9.2, 8.8], [6.7, 5.2], [4.6, 6.9],
      [4.1, 3.1], // el punto raro: clase 1 rodeada de clase 0
    ],
    1,
  ),
];
export const SVM_GAMMA = 0.3;
export const SVM_CS = [0.01, 0.1, 1, 10, 100] as const;

// ---------- Naive Bayes (las mismas 16 reseñas del ejercicio de Python) ----------

export const NB_REVIEWS: { text: string; label: 0 | 1 }[] = [
  { text: 'excelente producto llegó rápido y funciona perfecto', label: 1 },
  { text: 'muy buena calidad lo recomiendo', label: 1 },
  { text: 'me encantó excelente atención', label: 1 },
  { text: 'funciona perfecto buena compra', label: 1 },
  { text: 'rápido y buena calidad recomendado', label: 1 },
  { text: 'excelente precio muy contento', label: 1 },
  { text: 'buena batería y pantalla excelente', label: 1 },
  { text: 'lo recomiendo a todos me encantó', label: 1 },
  { text: 'pésimo producto llegó roto', label: 0 },
  { text: 'muy mala calidad no lo recomiendo', label: 0 },
  { text: 'llegó tarde y no funciona', label: 0 },
  { text: 'mala atención pésimo servicio', label: 0 },
  { text: 'se dañó en una semana mala compra', label: 0 },
  { text: 'no funciona devolví el producto', label: 0 },
  { text: 'la batería dura poco mala calidad', label: 0 },
  { text: 'pésimo no lo compren', label: 0 },
];

/** Frase inicial del simulador (la primera reseña nueva del ejercicio). */
export const NB_START = 'excelente calidad llegó rápido';
```

- [ ] **Step 4: Verificar que pasan**

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ml-explorer/ovas/datasets.ts src/components/ml-explorer/ovas/datasets.test.ts
git commit -m "feat(ml-explorer): add the phase 2 simulator data and pin their figures

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Glosario y estilos compartidos

**Files:**
- Modify: `src/components/ml-explorer/glossary.ts`
- Modify: `src/components/ml-explorer/ml-explorer.css`

`glossary.test.ts` ya exige que cada término tenga `what` y `why` de más de 20 caracteres; las claves nuevas quedan disponibles para `<G k="…">` gracias al tipo `GlossaryKey`, así que `tsc` detecta cualquier clave mal escrita en las Tasks 4-7.

- [ ] **Step 1: Corregir «Ensamble»**

En `glossary.ts`, en la entrada `ensamble`, reemplaza:

```ts
    what: 'Combinar muchos modelos (por ejemplo, cientos de árboles) y promediar o votar sus respuestas.',
    why: 'Reduce la inestabilidad de un modelo solo. Random Forest y Gradient Boosting son ensambles de árboles.',
```

por (el boosting no reduce sobre todo la inestabilidad, sino el sesgo):

```ts
    what: 'Combinar muchos modelos (por ejemplo, cientos de árboles) y promediar, votar o sumar sus respuestas.',
    why: 'Random Forest promedia árboles para reducir la inestabilidad de uno solo; Gradient Boosting los suma uno tras otro para corregir sus errores.',
```

- [ ] **Step 2: Añadir los términos nuevos**

Justo antes de `} satisfies Record<string, GlossaryEntry>;` (después de la entrada `interpretable`), añade:

```ts
  bootstrap: {
    term: 'Muestra bootstrap',
    what: 'Una muestra del mismo tamaño que los datos, sacada al azar con reposición: algunos ejemplos salen repetidos y otros (cerca de un tercio) no salen.',
    why: 'Random Forest entrena cada árbol con una muestra bootstrap distinta, y por eso los árboles se equivocan en sitios distintos.',
  },
  tasaAprendizaje: {
    term: 'Tasa de aprendizaje (learning rate)',
    what: 'Qué fracción de cada corrección se aplica: con 0.1, cada árbol nuevo corrige solo el 10 % del error que ve.',
    why: 'Más pequeña necesita más árboles pero suele generalizar mejor; más grande aprende rápido y sobreajusta antes.',
  },
  perdidaLog: {
    term: 'Pérdida logarítmica (log loss)',
    what: 'Castiga cada predicción según la probabilidad que le dio a la respuesta correcta: decir 99 % y fallar cuesta muchísimo; decir 60 % y fallar, poco.',
    why: 'Mide la calidad de las probabilidades, no solo los aciertos. Más baja es mejor.',
  },
  margen: {
    term: 'Margen',
    what: 'La franja vacía entre la frontera de decisión y los puntos más cercanos de cada clase.',
    why: 'Una SVM busca la frontera con el margen más ancho: deja la mayor distancia de seguridad posible a ambos lados.',
  },
  vectorSoporte: {
    term: 'Vector de soporte',
    what: 'Cada punto que queda sobre el borde del margen, dentro de él o del lado equivocado.',
    why: 'Solo ellos definen la frontera de la SVM: si borras cualquier otro punto, la frontera no cambia.',
  },
  kernel: {
    term: 'Kernel',
    what: 'Una función que mide el parecido entre dos puntos. Con ella la SVM traza fronteras curvas sin calcular nuevas features a mano.',
    why: 'El lineal da fronteras rectas; el RBF (gaussiano) da fronteras curvas que pueden rodear grupos.',
  },
  priorVerosimilitud: {
    term: 'Prior y verosimilitud',
    what: 'El prior es la probabilidad de cada clase antes de leer el dato (qué fracción de reseñas es positiva). La verosimilitud es qué tan probable es ver una palabra dentro de cada clase.',
    why: 'El teorema de Bayes combina ambas: probabilidad final ∝ prior × verosimilitud de cada palabra.',
  },
  suavizadoLaplace: {
    term: 'Suavizado de Laplace',
    what: 'Sumar 1 a todos los conteos de palabras antes de calcular probabilidades.',
    why: 'Sin él, una palabra que nunca apareció en una clase tendría probabilidad 0 y anularía toda la multiplicación.',
  },
```

- [ ] **Step 3: Añadir los estilos al final de `ml-explorer.css`**

```css

/* ---------- Fase 2: botones de opción, Naive Bayes ---------- */

.mlx-ova-controls [role='group'] {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.mlx-ova-controls button[aria-pressed='true'] {
  background: rgba(16, 185, 129, 0.3);
  border-color: #10b981;
}

.mlx-nb-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.mlx-nb-input input {
  padding: 6px 8px;
  font: inherit;
  color: var(--rf-text, #e8e8f0);
  background: rgba(4, 3, 32, 0.6);
  border: 1px solid rgba(85, 170, 255, 0.35);
  border-radius: 6px;
}

.mlx-nb-words {
  margin: 0;
  padding-left: 20px;
  font-family: 'Space Mono', Consolas, Monaco, monospace;
  font-size: 13px;
  line-height: 1.7;
}

.mlx-nb-words .is-pos b {
  color: #ffb454;
}

.mlx-nb-words .is-neg b {
  color: #55aaff;
}

.mlx-nb-words .is-unknown {
  opacity: 0.6;
}
```

- [ ] **Step 4: Verificar**

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/glossary.test.ts src/components/ml-explorer/render.test.ts`
Expected: PASS.

Run: `node node_modules/typescript/bin/tsc --noEmit -p .`
Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
git add src/components/ml-explorer/glossary.ts src/components/ml-explorer/ml-explorer.css
git commit -m "feat(ml-explorer): add phase 2 glossary terms and option button styles

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Random Forest

**Files:**
- Create: `src/components/ml-explorer/algorithms/python/random-forest.py`
- Create: `src/components/ml-explorer/algorithms/python/random-forest.out.txt` (generado)
- Modify: `src/components/ml-explorer/algorithms/python/outputs.test.ts`
- Create: `src/components/ml-explorer/ovas/RandomForestOva.tsx`
- Create: `src/components/ml-explorer/ovas/RandomForestOva.dom.test.tsx`
- Create: `src/components/ml-explorer/algorithms/random-forest.tsx`
- Modify: `src/components/ml-explorer/registry.ts`, `src/components/ml-explorer/registry.test.ts`
- Modify: `src/components/ml-explorer/MLExplorer.real.dom.test.tsx`
- Modify: `scripts/build-ml-notebook.py`; regenerar `../notebooks/algoritmos-ml.ipynb` y crear `../notebooks/algoritmos-ml/random-forest.ipynb`
- Modify: `src/data/articles/algoritmos-ml-explorador.md` (solo la description)

Historia del ejercicio: 1 000 compras con una regla oculta (monto, madrugada, distancia e intentos fallidos suben el fraude; la antigüedad de la tarjeta no influye). Árbol solo contra bosque de 100 en compras nuevas (77.7 % contra 82.3 %, con piso de 70 % por decir siempre «no es fraude»), y las dos importancias: la de impureza le da 0.12 a «antigüedad» y la de permutación, −0.006.

La OVA reutiliza los 28 clientes del árbol de decisión (con sus dos puntos de ruido) y colorea el plano por el voto del bosque. El slider recorre 1, 3, 10, 30 y 100 árboles; el readout da los aciertos en entrenamiento y en los 40 clientes nuevos de `FOREST_TEST`.

- [ ] **Step 1: Fijar las cifras del ejercicio en `outputs.test.ts` (falla)**

Añade el import junto a los otros:

```ts
import randomForest from './random-forest.out.txt?raw';
```

y dentro del `describe('cifras citadas en los textos', …)`, al final:

```ts
  it('Random Forest: 30 % de fraudes; el árbol solo 77.7 % y el bosque 82.3 % en compras nuevas, ambos 100 % en entrenamiento', () => {
    expect(randomForest).toContain('Fraudes: 303 de 1000 compras (30%)');
    expect(randomForest).toContain('Un árbol solo   → entrenamiento 100.0% | datos nuevos 77.7%');
    expect(randomForest).toContain('Bosque de 100   → entrenamiento 100.0% | datos nuevos 82.3%');
  });

  it('Random Forest: «antigüedad» saca 0.12 por impureza (más que «intentos») y −0.006 por permutación', () => {
    expect(randomForest).toMatch(/^\s+intentos\s+0\.06\s+0\.015$/m);
    expect(randomForest).toMatch(/^\s+antigüedad\s+0\.12\s+-0\.006$/m);
    expect(randomForest).toMatch(/^\s+monto\s+0\.44\s+0\.139$/m);
  });
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: FAIL (`random-forest.out.txt` no existe).

- [ ] **Step 2: Escribir el ejercicio**

Crea `src/components/ml-explorer/algorithms/python/random-forest.py`:

```python
# Detector de fraude: un árbol solo contra un bosque de 100 árboles, y qué señales pesan más
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

rng = np.random.default_rng(7)
n = 1000
monto = rng.exponential(80, n)            # monto de la compra (miles de pesos)
hora = rng.integers(0, 24, n)             # hora del día (0 a 23)
distancia = rng.exponential(10, n)        # km desde la ciudad habitual del cliente
intentos = rng.poisson(0.4, n)            # intentos fallidos de clave antes de la compra
antiguedad = rng.integers(1, 120, n)      # meses de la tarjeta: NO influye en el fraude
# Regla oculta: el fraude sube con monto alto, madrugada, lejos de casa e intentos fallidos
riesgo = 0.03 * monto + 2.5 * (hora < 6) + 0.12 * distancia + 1.5 * intentos - 6
fraude = (rng.random(n) < 1 / (1 + np.exp(-riesgo))).astype(int)

X = np.column_stack([monto, hora, distancia, intentos, antiguedad])
nombres = ["monto", "hora", "distancia", "intentos", "antigüedad"]
X_tr, X_te, y_tr, y_te = train_test_split(X, fraude, test_size=0.3, random_state=0, stratify=fraude)

arbol = DecisionTreeClassifier(random_state=0).fit(X_tr, y_tr)
bosque = RandomForestClassifier(n_estimators=100, random_state=0).fit(X_tr, y_tr)
print(f"Fraudes: {fraude.sum()} de {n} compras ({fraude.mean():.0%})")
print(f"Un árbol solo   → entrenamiento {arbol.score(X_tr, y_tr):.1%} | datos nuevos {arbol.score(X_te, y_te):.1%}")
print(f"Bosque de 100   → entrenamiento {bosque.score(X_tr, y_tr):.1%} | datos nuevos {bosque.score(X_te, y_te):.1%}")

perm = permutation_importance(bosque, X_te, y_te, n_repeats=5, random_state=0)
print("\nImportancia de cada señal      impureza  permutación")
for j in np.argsort(-perm.importances_mean, kind="stable"):
    print(f"  {nombres[j]:<11}                  {bosque.feature_importances_[j]:.2f}       {perm.importances_mean[j]:.3f}")
```

- [ ] **Step 3: Generar y verificar la salida en CPython y en Pyodide**

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py --update
git status --short src/components/ml-explorer/algorithms/python/
```
Expected: `↻` en todos los `.out.txt`, pero `git status` solo muestra `random-forest.py` y `random-forest.out.txt` como nuevos (los demás se regeneran idénticos). El `.out.txt` debe ser exactamente:

```text
Fraudes: 303 de 1000 compras (30%)
Un árbol solo   → entrenamiento 100.0% | datos nuevos 77.7%
Bosque de 100   → entrenamiento 100.0% | datos nuevos 82.3%

Importancia de cada señal      impureza  permutación
  monto                        0.44       0.139
  distancia                    0.25       0.066
  hora                         0.13       0.041
  intentos                     0.06       0.015
  antigüedad                   0.12       -0.006
```

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
node scripts/check-ml-exercises-pyodide.mjs
```
Expected: `✓ random-forest.py` y `✓ random-forest.py (Pyodide)`, y `✓` en todos los demás. Si Pyodide difiere, **no** ajustes el `.out.txt` a mano: busca la fuente de no determinismo (regla 7).

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: PASS.

- [ ] **Step 4: Test de la OVA (falla)**

Crea `src/components/ml-explorer/ovas/RandomForestOva.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RandomForestOva } from './RandomForestOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const setIndex = (v: number) => fireEvent.change(screen.getByRole('slider'), { target: { value: String(v) } });

describe('RandomForestOva', () => {
  it('con 1 árbol acierta 24 de 28 y 35 de 40 nuevos; con 100, 28 de 28 y 39 de 40', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<RandomForestOva />);
    expect(status(container)).toContain('Clientes de entrenamiento: acierta 24 de 28');
    expect(status(container)).toContain('Clientes nuevos: acierta 35 de 40');
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('1');

    setIndex(2);
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('10');
    expect(status(container)).toContain('acierta 27 de 28');
    expect(status(container)).toContain('acierta 38 de 40');

    setIndex(4);
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('100');
    expect(status(container)).toContain('acierta 28 de 28');
    expect(status(container)).toContain('acierta 39 de 40');
    expect(error).not.toHaveBeenCalled();
  });

  it('el svg es una imagen (sin elementos enfocables) con los 28 clientes y 625 celdas', () => {
    const { container } = render(<RandomForestOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('circle')).toHaveLength(28);
    expect(svg?.querySelectorAll('rect')).toHaveLength(625);
    expect(svg?.querySelector('[tabindex]')).toBeNull();
  });

  it('la explicación va en el hint, fuera del readout', () => {
    const { container } = render(<RandomForestOva />);
    const hint = screen.getByText(/Compara los aciertos en clientes nuevos/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });
});
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/RandomForestOva.dom.test.tsx`
Expected: FAIL (no existe `./RandomForestOva`).

- [ ] **Step 5: Escribir la OVA**

Crea `src/components/ml-explorer/ovas/RandomForestOva.tsx`:

```tsx
import { useMemo, useState } from 'react';
import { FOREST_DEPTH, FOREST_SEED, FOREST_SIZES, FOREST_TEST, TREE_POINTS as POINTS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { buildForest, forestAccuracy, forestVote } from './ovaMath';
import { createPlot } from './plot';

const PLOT = createPlot(320, 320, 30, [0, 10], [0, 10]);
const CELLS = 25;
const CELL = 10 / CELLS;
const MAX_TREES = FOREST_SIZES[FOREST_SIZES.length - 1];

export function RandomForestOva() {
  const [sizeIndex, setSizeIndex] = useState(0);
  const n = FOREST_SIZES[sizeIndex];
  // Se construyen los 100 árboles una vez; el bosque de N son los primeros N.
  const all = useMemo(() => buildForest(POINTS, MAX_TREES, FOREST_DEPTH, FOREST_SEED), []);
  const trees = useMemo(() => all.slice(0, n), [all, n]);

  const cells = useMemo(() => {
    const out: { x: number; y: number; vote: number }[] = [];
    for (let i = 0; i < CELLS; i++) {
      for (let j = 0; j < CELLS; j++) {
        const x = i * CELL;
        const y = j * CELL;
        out.push({ x, y, vote: forestVote(trees, { x: x + CELL / 2, y: y + CELL / 2 }) });
      }
    }
    return out;
  }, [trees]);

  const train = Math.round(forestAccuracy(trees, POINTS) * POINTS.length);
  const test = Math.round(forestAccuracy(trees, FOREST_TEST) * FOREST_TEST.length);

  return (
    <OvaFrame
      title="Muchos árboles votan"
      hint="Sube el número de árboles. Cada árbol aprendió de una muestra distinta de los clientes; el color de cada zona es el voto del bosque (más intenso = más acuerdo). Con 1 árbol la frontera tiene picos y huecos; con muchos se suaviza. Compara los aciertos en clientes nuevos, no los de entrenamiento."
      controls={
        <OvaSlider
          label="Árboles en el bosque"
          value={sizeIndex}
          min={0}
          max={FOREST_SIZES.length - 1}
          step={1}
          onChange={setSizeIndex}
          format={(i) => String(FOREST_SIZES[i])}
        />
      }
      readout={
        <>
          <span>
            Clientes de entrenamiento: acierta <b>{train} de {POINTS.length}</b>
          </span>
          <span>
            Clientes nuevos: acierta <b>{test} de {FOREST_TEST.length}</b>
          </span>
        </>
      }
    >
      <svg
        viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
        role="img"
        aria-label={`Plano coloreado por el voto de ${n} árboles, con los 28 clientes de entrenamiento`}
      >
        {cells.map((c, i) => (
          <rect
            key={i}
            x={PLOT.sx(c.x)}
            y={PLOT.sy(c.y + CELL)}
            width={PLOT.sx(CELL) - PLOT.sx(0)}
            height={PLOT.sy(0) - PLOT.sy(CELL)}
            fill={c.vote > 0.5 ? OVA_COLORS.class1 : OVA_COLORS.class0}
            fillOpacity={0.06 + 0.5 * Math.abs(c.vote - 0.5)}
          />
        ))}
        <text x={PLOT.sx(10)} y={PLOT.height - 8} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
          ingreso →
        </text>
        <text x={8} y={PLOT.sy(10) - 10} fontSize={11} fill={OVA_COLORS.axis}>
          ↑ deuda (escala 0-10)
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

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/RandomForestOva.dom.test.tsx`
Expected: PASS.

- [ ] **Step 6: Registrar el algoritmo en el test del registry (falla)**

En `registry.test.ts`, reemplaza

```ts
    expect(AVAILABLE_SLUGS).toEqual(['linear-regression', 'logistic-regression', 'decision-tree', 'knn']);
```

por

```ts
    expect(AVAILABLE_SLUGS).toEqual([
      'linear-regression',
      'logistic-regression',
      'decision-tree',
      'random-forest',
      'knn',
    ]);
```

y añade al final de `MLExplorer.real.dom.test.tsx`:

```tsx
it('Random Forest real (?alg=random-forest): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=random-forest']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Random Forest' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'formula') {
      const svg = container.querySelector('.mlx-tabpanel svg[role="img"]');
      expect(svg).not.toBeNull();
      expect(svg!.querySelectorAll('circle')).toHaveLength(28);
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('acierta 35 de 40');
      expect(container.querySelector('.katex')).not.toBeNull();
    }
  }

  expect(error).not.toHaveBeenCalled();
});
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/registry.test.ts src/components/ml-explorer/MLExplorer.real.dom.test.tsx`
Expected: FAIL (`random-forest` aún no está disponible).

- [ ] **Step 7: Escribir el módulo del algoritmo**

Crea `src/components/ml-explorer/algorithms/random-forest.tsx`. Las cifras de los textos son las que fijan `outputs.test.ts` (Step 1) y `datasets.test.ts` (Task 2):

```tsx
import { G } from '../Gloss';
import { Tex } from '../Tex';
import { RandomForestOva } from '../ovas/RandomForestOva';
import type { AlgorithmModule } from '../types';
import code from './python/random-forest.py?raw';
import expectedOutput from './python/random-forest.out.txt?raw';

const randomForest: AlgorithmModule = {
  slug: 'random-forest',
  row: {
    type: 'Supervisado',
    bestUse: 'Tareas donde importa la exactitud',
    formula: 'Bagging de árboles de decisión',
    assumptions: 'Poca correlación entre los árboles',
    pros: 'Reduce el sobreajuste',
    cons: 'Más lento, menos interpretable',
    whenNot: 'Predicciones en tiempo real muy exigentes',
    realWorld: 'Detección de fraude',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>Supervisado:</b> aprende de ejemplos que ya traen la respuesta (compras marcadas como fraude o no).
          </p>
          <p>
            Es un <G k="ensamble">ensamble</G>: <b>entrena muchos árboles de decisión distintos y los pone a votar</b>.
            Cada árbol solo se equivoca bastante; la mayoría se equivoca mucho menos.
          </p>
          <p>
            Sirve para clasificar (los árboles votan) y para predecir números (se promedian sus respuestas). El
            simulador y el ejercicio clasifican.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Combina dos fuentes de azar: <i>bagging</i> (cada árbol ve una <G k="bootstrap">muestra bootstrap</G>) y
          features al azar en cada corte. Fue propuesto por Leo Breiman en 2001.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo cuando tienes <b>datos en tabla</b> (filas y columnas) y lo que importa es <b>acertar</b> más que
            explicar cada decisión.
          </p>
          <ul>
            <li>Detectar fraude o compras sospechosas.</li>
            <li>Predecir qué clientes se van a ir (abandono).</li>
            <li>Mantenimiento predictivo: qué máquina fallará pronto según sus sensores.</li>
          </ul>
          <p className="mlx-rule">
            Si un árbol solo se queda corto, un bosque es el siguiente paso natural: pide poco ajuste y rara vez
            sale mal.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Funciona bien «de fábrica»: con los valores por defecto de scikit-learn (100 árboles, sin límite de
          profundidad) suele quedar cerca de su mejor resultado. No necesita escalar las features. Con{' '}
          <code>oob_score=True</code> estima su exactitud con los datos que cada árbol no vio, sin apartar un
          conjunto de prueba.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> un bosque de 5 árboles revisa una compra. Tres dicen «fraude» y dos dicen «normal».
            Gana «fraude», 3 votos contra 2, y la probabilidad estimada es 3/5 = 60 %.
          </p>
          <p>Para que los árboles no sean copias, cada uno se entrena distinto:</p>
          <ol>
            <li>
              Con una <G k="bootstrap">muestra bootstrap</G>: se sacan al azar tantas filas como hay, con
              reposición. Algunas se repiten y otras quedan fuera.
            </li>
            <li>En cada corte, el árbol solo puede elegir entre unas pocas features sorteadas.</li>
          </ol>
          <Tex block>{'\\hat{y}(x) = \\text{mayoría}\\{\\,h_1(x),\\ h_2(x),\\ \\dots,\\ h_B(x)\\,\\}'}</Tex>
          <p>
            <Tex>{'h_b'}</Tex> es el árbol número <Tex>{'b'}</Tex> y <Tex>{'B'}</Tex> el número de árboles. Mueve
            el simulador de 1 a 100 árboles: con los mismos datos del árbol de decisión, el acierto en 40 clientes
            nuevos sube de 35 a 39.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Por qué funciona: si cada árbol tiene varianza <Tex>{'\\sigma^2'}</Tex> y la correlación entre dos
            árboles es <Tex>{'\\rho'}</Tex>, el promedio de <Tex>{'B'}</Tex> árboles tiene varianza
          </p>
          <Tex block>{'\\rho\\,\\sigma^2 + \\frac{1-\\rho}{B}\\,\\sigma^2'}</Tex>
          <p>
            Más árboles borran el segundo término; el primero solo baja si los árboles se parecen menos (
            <Tex>{'\\rho'}</Tex> pequeño). Para eso sirve sortear features: en clasificación scikit-learn usa{' '}
            <Tex>{'\\sqrt{p}'}</Tex> features por corte (<code>max_features="sqrt"</code>). En realidad,
            scikit-learn no cuenta votos: promedia las probabilidades de los árboles, lo que casi siempre da la
            misma clase.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que <b>los árboles se equivocan en sitios distintos</b>. Si todos cometen el mismo error, votar
            no lo corrige.
          </p>
          <p>
            Ejemplo: si una sola feature delata casi todo el fraude, todos los árboles la usan primero y quedan
            parecidos. El sorteo de features en cada corte obliga a algunos árboles a buscar otras señales.
          </p>
          <p>Como cualquier modelo supervisado, también supone que los datos nuevos se parecen a los de entrenamiento.</p>
        </>
      ),
      deepDive: (
        <p>
          No supone relaciones lineales ni distribuciones particulares, y no le afecta la escala de las features.
          Lo que no puede hacer es extrapolar: en regresión, nunca predice un valor fuera del rango de las
          respuestas que vio al entrenar.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Reduce el <G k="overfitting">sobreajuste</G>:</b> un árbol profundo memoriza el{' '}
            <G k="ruido">ruido</G>; al promediar muchos, ese ruido se diluye. En el ejercicio, el árbol solo acierta
            77.7 % en compras nuevas y el bosque, 82.3 %.
          </li>
          <li>
            <b>Poca preparación:</b> no hay que escalar las features y funciona bien con los valores por defecto.
          </li>
          <li>
            <b>Dice qué features pesan:</b> trae una medida de importancia de cada señal.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Los árboles se entrenan de forma independiente, así que se reparten entre los núcleos del procesador (
          <code>n_jobs=-1</code>). Ojo con la importancia «de fábrica» (<code>feature_importances_</code>): mide
          cuánta impureza quitó cada feature y favorece a las que tienen muchos valores distintos. En el ejercicio,
          «antigüedad» (que no influye en el fraude) saca 0.12, más que «intentos»; la importancia por permutación
          la deja en cero.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Menos interpretable:</b> no puedes leer 100 árboles como lees uno. Sabes qué features pesan, pero no
            la regla exacta.
          </li>
          <li>
            <b>Más lento y pesado:</b> guarda y consulta todos los árboles en cada predicción.
          </li>
          <li>
            <b>El 100 % de entrenamiento engaña:</b> en el ejercicio, árbol y bosque aciertan el 100 % de los datos
            con los que aprendieron. Solo los datos nuevos dicen la verdad.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Cada árbol crece sin límite por defecto, así que el modelo ocupa memoria y el tiempo de predicción crece
          con el número de árboles y su profundidad. En el simulador, con 100 árboles el bosque todavía vota
          «impago» (60 de 100 árboles) en el punto de ruido de (3, 1.5): promediar reduce el sobreajuste, no lo
          elimina.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">
            No lo uses si debes explicar cada decisión regla por regla, o si cada predicción debe salir en
            microsegundos en un equipo pequeño.
          </p>
          <p>
            Ejemplo: un sensor embebido que decide en tiempo real con poca memoria. Un modelo lineal o un árbol corto
            ocupan mucho menos.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Si buscas la máxima exactitud en datos tabulares, Gradient Boosting suele superarlo, a cambio de más
          ajuste de <G k="hiperparametro">hiperparámetros</G>. Con imágenes, audio o texto largo, las redes
          neuronales sacan mejores features que las columnas crudas.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Detección de fraude.</b> Los bancos combinan señales como el monto, la hora, la distancia a la ciudad
            habitual y los intentos fallidos de clave, y los ensambles de árboles son una de sus herramientas
            habituales.
          </p>
          <p>
            El ejercicio genera 1 000 compras con una regla oculta: el fraude sube con el monto, la madrugada, la
            distancia y los intentos fallidos; la antigüedad de la tarjeta no influye. Hay 30 % de fraudes, así que
            decir siempre «no es fraude» ya acierta 70 %: ese es el piso. Un árbol solo acierta 77.7 % en compras
            nuevas; el bosque de 100 árboles, 82.3 %.
          </p>
          <p>
            Mira las dos columnas de importancia. La de impureza le da 0.12 a «antigüedad»; la de permutación (cuánto
            cae el acierto si se revuelve esa columna en los datos nuevos) la deja en −0.006, es decir, en nada.
          </p>
        </>
      ),
      deepDive: (
        <p>
          En la vida real el fraude es menos del 1 % de las compras: con tan pocos casos, la exactitud no sirve
          (99 % se logra sin detectar nada). Se miden la precisión y la sensibilidad con una{' '}
          <G k="matrizConfusion">matriz de confusión</G>, se ajusta el <G k="umbral">umbral</G> y se le da más peso
          a la clase rara (<code>class_weight="balanced"</code>).
        </p>
      ),
    },
  },
  Ova: RandomForestOva,
  python: { code, expectedOutput, colabNotebook: 'random-forest' },
  inYourField: [
    { area: 'Industrial', example: 'predecir qué máquina fallará en la próxima semana a partir de vibración, temperatura y horas de uso.' },
    { area: 'Ambiental', example: 'clasificar el uso del suelo (bosque, cultivo, ciudad, agua) a partir de las bandas de imágenes satelitales.' },
    { area: 'Civil', example: 'estimar el riesgo de falla de tramos de tubería según edad, material, presión y tipo de suelo.' },
  ],
  alternatives: ['gradient-boosting', 'decision-tree', 'logistic-regression'],
};

export default randomForest;
```

- [ ] **Step 8: Añadir el loader**

En `registry.ts`, dentro de `LOADERS`, justo después de

```ts
  'decision-tree': () => import('./algorithms/decision-tree'),
```

añade (el orden de `LOADERS` no afecta al menú, pero así sigue el orden del cheatsheet):

```ts
  'random-forest': () => import('./algorithms/random-forest'),
```

- [ ] **Step 9: Notebook de Colab**

En `scripts/build-ml-notebook.py`, dentro de `ALGORITHMS` (mismo orden que el menú), añade justo después de la tupla de `"decision-tree"`:

```python
    (
        "random-forest",
        "Random Forest (bosque aleatorio)",
        "Detector de fraude: un árbol solo contra un bosque de 100, y qué señales pesan de verdad.",
    ),
```

```bash
python3 scripts/build-ml-notebook.py
```
Expected: `Escrito notebooks/algoritmos-ml.ipynb y 5 notebooks individuales`.

- [ ] **Step 10: Description del artículo**

En `src/data/articles/algoritmos-ml-explorador.md`, en la línea `description:`, cambia «Los primeros cuatro ya están completos» por «Los primeros cinco ya están completos» (lo exige `algoritmos-ml-explorador.links.test.ts`).

- [ ] **Step 11: Verificación completa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
```
Expected: todos los tests pasan (incluidos `registry.test.ts`, que comprueba que las alternativas de `random-forest` existen; `notebook.test.ts`, que compara el notebook con el `.py`; y `algoritmos-ml-explorador.links.test.ts`); `tsc` sin errores.

Revisión manual con el servidor de desarrollo (`ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js`), en `#/articles/algoritmos-ml-explorador?alg=random-forest&tab=formula`: la OVA responde al teclado (Tab hasta los controles, flechas en el slider, Enter/Espacio en los botones), las fichas 💡 abren, y en «Ejemplo real» «▶ Ejecutar» da la misma salida que la esperada.

- [ ] **Step 12: Commit**

```bash
git add src/components/ml-explorer/algorithms/python/random-forest.py src/components/ml-explorer/algorithms/python/random-forest.out.txt \
  src/components/ml-explorer/algorithms/python/outputs.test.ts \
  src/components/ml-explorer/ovas/RandomForestOva.tsx src/components/ml-explorer/ovas/RandomForestOva.dom.test.tsx \
  src/components/ml-explorer/algorithms/random-forest.tsx src/components/ml-explorer/registry.ts src/components/ml-explorer/registry.test.ts \
  src/components/ml-explorer/MLExplorer.real.dom.test.tsx scripts/build-ml-notebook.py ../notebooks/algoritmos-ml.ipynb ../notebooks/algoritmos-ml/random-forest.ipynb \
  src/data/articles/algoritmos-ml-explorador.md
git commit -m "feat(ml-explorer): add Random Forest with its simulator and exercise

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Gradient Boosting

**Files:**
- Create: `src/components/ml-explorer/algorithms/python/gradient-boosting.py`
- Create: `src/components/ml-explorer/algorithms/python/gradient-boosting.out.txt` (generado)
- Modify: `src/components/ml-explorer/algorithms/python/outputs.test.ts`
- Create: `src/components/ml-explorer/ovas/GradientBoostingOva.tsx`
- Create: `src/components/ml-explorer/ovas/GradientBoostingOva.dom.test.tsx`
- Create: `src/components/ml-explorer/algorithms/gradient-boosting.tsx`
- Modify: `src/components/ml-explorer/registry.ts`, `src/components/ml-explorer/registry.test.ts`
- Modify: `src/components/ml-explorer/MLExplorer.real.dom.test.tsx`
- Modify: `scripts/build-ml-notebook.py`; regenerar `../notebooks/algoritmos-ml.ipynb` y crear `../notebooks/algoritmos-ml/gradient-boosting.ipynb`
- Modify: `src/data/articles/algoritmos-ml-explorador.md` (solo la description)

Historia del ejercicio: 800 clientes con una regla no lineal (la deuda pesa más con ingreso bajo). Se entrenan 300 árboles a propósito y se mide la pérdida logarítmica tras cada uno: en entrenamiento baja siempre (0.620 → 0.265); en datos nuevos toca fondo en 0.504 con 24 árboles y sube a 0.611. La gráfica marca el punto de parada. `min_samples_leaf=20` es necesario para que CPython y Pyodide impriman lo mismo (ver regla 7).

La OVA es de regresión (es más fácil ver el error): 21 puntos con forma de ola, el modelo arranca en el promedio y cada «árbol» es un tocón (un solo corte) ajustado a los residuos; se suma multiplicado por la tasa de aprendizaje (0.1, 0.3 o 1, con botones `aria-pressed`). Las líneas rosas son los residuos.

- [ ] **Step 1: Fijar las cifras del ejercicio en `outputs.test.ts` (falla)**

Añade el import junto a los otros:

```ts
import gradientBoosting from './gradient-boosting.out.txt?raw';
```

y dentro del `describe('cifras citadas en los textos', …)`, al final:

```ts
  it('Gradient Boosting: la pérdida en datos nuevos toca fondo (0.504) con 24 árboles y sube a 0.611 con 300', () => {
    expect(gradientBoosting).toContain('Impagos: 271 de 800 clientes');
    expect(gradientBoosting).toContain('Menor pérdida en datos nuevos: 0.504 con 24 árboles');
    expect(gradientBoosting).toMatch(/^\s+1 \|\s+0\.620 \|\s+0\.619$/m);
    expect(gradientBoosting).toMatch(/^\s+300 \|\s+0\.265 \|\s+0\.611$/m);
  });
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: FAIL (`gradient-boosting.out.txt` no existe).

- [ ] **Step 2: Escribir el ejercicio**

Crea `src/components/ml-explorer/algorithms/python/gradient-boosting.py`:

```python
# Scoring de crédito: cada árbol nuevo corrige los errores de los anteriores. ¿Cuándo parar?
import matplotlib.pyplot as plt
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import log_loss
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(3)
n = 800
ingreso = rng.normal(4, 1.5, n).clip(0.8)          # millones de pesos al mes
deuda = rng.uniform(0, 0.9, n)                      # deuda / ingreso
atrasos = rng.poisson(0.8, n)                       # pagos atrasados en el último año
edad = rng.integers(20, 70, n)
# Regla oculta (no lineal): la deuda pesa mucho más cuando el ingreso es bajo
riesgo = 3 * deuda * (ingreso < 3) + 1.2 * deuda + 0.7 * atrasos - 0.3 * ingreso + 0.6 * (edad < 25) - 1
impago = (rng.random(n) < 1 / (1 + np.exp(-riesgo))).astype(int)

X = np.column_stack([ingreso, deuda, atrasos, edad])
X_tr, X_te, y_tr, y_te = train_test_split(X, impago, test_size=0.3, random_state=0, stratify=impago)

# 300 árboles a propósito (el valor por defecto es 100), para ver qué pasa cuando sobran.
# min_samples_leaf=20: cada hoja debe tener al menos 20 clientes.
gb = GradientBoostingClassifier(
    n_estimators=300, learning_rate=0.1, max_depth=3, min_samples_leaf=20, random_state=0
)
gb.fit(X_tr, y_tr)

perdida_tr = [log_loss(y_tr, p[:, 1]) for p in gb.staged_predict_proba(X_tr)]
perdida_te = [log_loss(y_te, p[:, 1]) for p in gb.staged_predict_proba(X_te)]
mejor = int(np.argmin(perdida_te)) + 1

print(f"Impagos: {impago.sum()} de {n} clientes")
print("Árboles | pérdida entrenamiento | pérdida datos nuevos")
for m in [1, 10, 50, 100, 200, 300]:
    print(f"{m:>7} | {perdida_tr[m - 1]:>21.3f} | {perdida_te[m - 1]:>20.3f}")
print(f"\nMenor pérdida en datos nuevos: {perdida_te[mejor - 1]:.3f} con {mejor} árboles")

plt.figure(figsize=(4.5, 3.2))
plt.plot(range(1, 301), perdida_tr, label="entrenamiento")
plt.plot(range(1, 301), perdida_te, label="datos nuevos")
plt.axvline(mejor, ls="--", c="gray")
plt.xlabel("número de árboles")
plt.ylabel("pérdida logarítmica")
plt.title("Después de la línea gris, más árboles empeoran")
plt.legend()
plt.show()
```

- [ ] **Step 3: Generar y verificar la salida en CPython y en Pyodide**

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py --update
git status --short src/components/ml-explorer/algorithms/python/
```
Expected: `↻` en todos los `.out.txt`, pero `git status` solo muestra `gradient-boosting.py` y `gradient-boosting.out.txt` como nuevos (los demás se regeneran idénticos). El `.out.txt` debe ser exactamente:

```text
Impagos: 271 de 800 clientes
Árboles | pérdida entrenamiento | pérdida datos nuevos
      1 |                 0.620 |                0.619
     10 |                 0.530 |                0.529
     50 |                 0.437 |                0.506
    100 |                 0.386 |                0.526
    200 |                 0.317 |                0.565
    300 |                 0.265 |                0.611

Menor pérdida en datos nuevos: 0.504 con 24 árboles
```

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
node scripts/check-ml-exercises-pyodide.mjs
```
Expected: `✓ gradient-boosting.py` y `✓ gradient-boosting.py (Pyodide)`, y `✓` en todos los demás. Si Pyodide difiere, **no** ajustes el `.out.txt` a mano: busca la fuente de no determinismo (regla 7).

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: PASS.

- [ ] **Step 4: Test de la OVA (falla)**

Crea `src/components/ml-explorer/ovas/GradientBoostingOva.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GradientBoostingOva } from './GradientBoostingOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const setSteps = (v: number) => fireEvent.change(screen.getByRole('slider'), { target: { value: String(v) } });

describe('GradientBoostingOva', () => {
  it('parte del promedio (MSE 2.41) y cada árbol baja el error; la tasa cambia la velocidad', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<GradientBoostingOva />);
    expect(status(container)).toBe('Con 0 árboles y tasa 0.3: error cuadrático medio 2.41');

    setSteps(1);
    expect(status(container)).toBe('Con 1 árbol y tasa 0.3: error cuadrático medio 1.97');
    setSteps(10);
    expect(status(container)).toContain('0.73');

    fireEvent.click(screen.getByRole('button', { name: '1' }));
    expect(screen.getByRole('button', { name: '1' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: '0.3' }).getAttribute('aria-pressed')).toBe('false');
    expect(status(container)).toBe('Con 10 árboles y tasa 1: error cuadrático medio 0.15');

    fireEvent.click(screen.getByRole('button', { name: '0.1' }));
    setSteps(50);
    expect(status(container)).toBe('Con 50 árboles y tasa 0.1: error cuadrático medio 0.48');

    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }));
    expect(status(container)).toBe('Con 0 árboles y tasa 0.3: error cuadrático medio 2.41');
    expect(error).not.toHaveBeenCalled();
  });

  it('el svg es una imagen con los 21 puntos y una línea de error por punto', () => {
    const { container } = render(<GradientBoostingOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('circle')).toHaveLength(21);
    expect(svg?.querySelectorAll('line')).toHaveLength(21);
  });

  it('la explicación va en el hint, fuera del readout', () => {
    const { container } = render(<GradientBoostingOva />);
    const hint = screen.getByText(/Con 0 árboles el modelo predice el promedio/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });
});
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/GradientBoostingOva.dom.test.tsx`
Expected: FAIL (no existe `./GradientBoostingOva`).

- [ ] **Step 5: Escribir la OVA**

Crea `src/components/ml-explorer/ovas/GradientBoostingOva.tsx`:

```tsx
import { useMemo, useState } from 'react';
import { GB_MAX_STEPS, GB_RATES, GB_XS as XS, GB_YS as YS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { boost, boostMse, predictBoost } from './ovaMath';
import { createPlot } from './plot';

const PLOT = createPlot(360, 260, 30, [0, 10], [0, 8]);
const START_RATE = 0.3;

export function GradientBoostingOva() {
  const [steps, setSteps] = useState(0);
  const [rate, setRate] = useState<number>(START_RATE);
  const model = useMemo(() => boost(XS, YS, GB_MAX_STEPS, rate), [rate]);
  const mse = boostMse(model, XS, YS, steps);

  const curve = Array.from({ length: 201 }, (_, i) => {
    const x = i / 20;
    return `${i === 0 ? 'M' : 'L'}${PLOT.sx(x).toFixed(1)},${PLOT.sy(predictBoost(model, x, steps)).toFixed(1)}`;
  }).join(' ');

  return (
    <OvaFrame
      title="Cada árbol corrige al anterior"
      hint="Suma árboles uno por uno. Con 0 árboles el modelo predice el promedio; cada árbol nuevo es un solo corte que mira los errores que quedan (las líneas rosas) y corrige una fracción de ellos: la tasa de aprendizaje. Con tasa pequeña avanza despacio; con tasa 1, en pocos pasos ya persigue cada punto."
      controls={
        <>
          <OvaSlider label="Árboles sumados" value={steps} min={0} max={GB_MAX_STEPS} step={1} onChange={setSteps} />
          <div role="group" aria-label="Tasa de aprendizaje">
            <span>Tasa de aprendizaje: </span>
            {GB_RATES.map((r) => (
              <button key={r} type="button" aria-pressed={rate === r} onClick={() => setRate(r)}>
                {r}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setSteps(0);
              setRate(START_RATE);
            }}
          >
            Restablecer
          </button>
        </>
      }
      readout={
        <span>
          Con <b>{steps}</b> {steps === 1 ? 'árbol' : 'árboles'} y tasa <b>{rate}</b>: error cuadrático medio{' '}
          <b>{mse.toFixed(2)}</b>
        </span>
      }
    >
      <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} role="img" aria-label="Puntos, la predicción en escalones y los errores que quedan">
        <text x={PLOT.sx(10)} y={PLOT.height - 8} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
          x →
        </text>
        {XS.map((x, i) => (
          <line
            key={`r${i}`}
            x1={PLOT.sx(x)}
            y1={PLOT.sy(YS[i])}
            x2={PLOT.sx(x)}
            y2={PLOT.sy(predictBoost(model, x, steps))}
            stroke={OVA_COLORS.risk}
            strokeWidth={1.5}
          />
        ))}
        <path d={curve} fill="none" stroke={OVA_COLORS.accent} strokeWidth={2.5} />
        {XS.map((x, i) => (
          <circle key={i} cx={PLOT.sx(x)} cy={PLOT.sy(YS[i])} r={5} fill={OVA_COLORS.class0} stroke="#040320" strokeWidth={1.5} />
        ))}
      </svg>
    </OvaFrame>
  );
}
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/GradientBoostingOva.dom.test.tsx`
Expected: PASS.

- [ ] **Step 6: Registrar el algoritmo en el test del registry (falla)**

En `registry.test.ts`, reemplaza

```ts
    expect(AVAILABLE_SLUGS).toEqual([
      'linear-regression',
      'logistic-regression',
      'decision-tree',
      'random-forest',
      'knn',
    ]);
```

por

```ts
    expect(AVAILABLE_SLUGS).toEqual([
      'linear-regression',
      'logistic-regression',
      'decision-tree',
      'random-forest',
      'gradient-boosting',
      'knn',
    ]);
```

y añade al final de `MLExplorer.real.dom.test.tsx`:

```tsx
it('Gradient Boosting real (?alg=gradient-boosting): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=gradient-boosting']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Gradient Boosting' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'formula') {
      const svg = container.querySelector('.mlx-tabpanel svg[role="img"]');
      expect(svg).not.toBeNull();
      expect(svg!.querySelectorAll('circle')).toHaveLength(21);
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('2.41');
      expect(container.querySelector('.katex')).not.toBeNull();
    }
  }

  expect(error).not.toHaveBeenCalled();
});
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/registry.test.ts src/components/ml-explorer/MLExplorer.real.dom.test.tsx`
Expected: FAIL (`gradient-boosting` aún no está disponible).

- [ ] **Step 7: Escribir el módulo del algoritmo**

Crea `src/components/ml-explorer/algorithms/gradient-boosting.tsx`. Las cifras de los textos son las que fijan `outputs.test.ts` (Step 1) y `datasets.test.ts` (Task 2):

```tsx
import { G } from '../Gloss';
import { Tex } from '../Tex';
import { GradientBoostingOva } from '../ovas/GradientBoostingOva';
import type { AlgorithmModule } from '../types';
import code from './python/gradient-boosting.py?raw';
import expectedOutput from './python/gradient-boosting.out.txt?raw';

const gradientBoosting: AlgorithmModule = {
  slug: 'gradient-boosting',
  row: {
    type: 'Supervisado',
    bestUse: 'Datos estructurados (tablas)',
    formula: 'Árboles en secuencia que corrigen errores',
    assumptions: 'Sumar modelos débiles da uno fuerte',
    pros: 'Muy alto rendimiento',
    cons: 'Riesgo de sobreajuste, entrenamiento lento',
    whenNot: 'Datos muy ruidosos',
    realWorld: 'Scoring de crédito',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>Supervisado:</b> aprende de ejemplos con respuesta (clientes que pagaron o no).
          </p>
          <p>
            Es un <G k="ensamble">ensamble</G> de árboles, pero <b>en fila, no en paralelo</b>: cada árbol nuevo
            se entrena para corregir los errores que dejaron los anteriores.
          </p>
          <p>
            Sirve para predecir números y para clasificar. El simulador predice un número (es más fácil ver el
            error); el ejercicio clasifica.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Es <i>boosting</i>: suma modelos débiles (árboles pequeños, de 1 a 8 niveles) para formar uno fuerte.
          Las versiones más usadas en la práctica son XGBoost, LightGBM, CatBoost y{' '}
          <code>HistGradientBoostingClassifier</code> de scikit-learn, que agrupan los valores en intervalos para
          entrenar mucho más rápido.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo con <b>datos en tabla</b> cuando quieres <b>la mayor exactitud posible</b> y tienes tiempo para
            ajustarlo.
          </p>
          <ul>
            <li>Scoring de crédito: probabilidad de impago.</li>
            <li>Pronóstico de demanda (ventas, energía) con calendario y clima.</li>
            <li>Ordenar resultados de búsqueda o anuncios por relevancia.</li>
          </ul>
          <p className="mlx-rule">
            En datos tabulares suele ser de lo más preciso que existe. Pero empieza por una línea base simple:
            compáralo siempre con ella.
          </p>
        </>
      ),
      deepDive: (
        <p>
          En competencias de datos tabulares (Kaggle) XGBoost y LightGBM han sido protagonistas durante años, y
          estudios comparativos muestran que los ensambles de árboles siguen siendo muy competitivos frente a las
          redes neuronales en este tipo de datos. Es una tendencia, no una ley: depende del problema.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> hay que predecir un valor real de 7. El modelo arranca con el promedio, 5: el error
            (residuo) es 7 − 5 = 2. El primer árbol aprende a predecir ese 2, pero solo se suma una fracción, la{' '}
            <G k="tasaAprendizaje">tasa de aprendizaje</G>: con 0.3, la predicción pasa a 5 + 0.3 · 2 = 5.6. El
            siguiente árbol mira el error que queda (1.4) y repite.
          </p>
          <Tex block>{'F_m(x) = F_{m-1}(x) + \\eta \\cdot h_m(x)'}</Tex>
          <p>
            <Tex>{'F_m'}</Tex> es el modelo tras <Tex>{'m'}</Tex> árboles, <Tex>{'h_m'}</Tex> el árbol nuevo
            (entrenado con los errores de <Tex>{'F_{m-1}'}</Tex>) y <Tex>{'\\eta'}</Tex> la tasa de aprendizaje.
          </p>
          <p>
            En el simulador, con tasa 0.3, el error cuadrático medio baja de 2.41 (solo el promedio) a 0.73 con 10
            árboles y a 0.06 con 50.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Con pérdida cuadrática, cada árbol se ajusta a los residuos <Tex>{'y_i - F_{m-1}(x_i)'}</Tex>. En general
            se ajusta al gradiente negativo de la pérdida (de ahí el nombre):
          </p>
          <Tex block>{'r_{im} = -\\left[\\frac{\\partial L(y_i, F(x_i))}{\\partial F(x_i)}\\right]_{F = F_{m-1}}'}</Tex>
          <p>
            Para clasificar, <Tex>{'F'}</Tex> es un <G k="logOdds">log-odds</G> y la pérdida es la{' '}
            <G k="perdidaLog">pérdida logarítmica</G>. Valores por defecto en scikit-learn: 100 árboles, tasa 0.1,
            profundidad 3. Tasa más pequeña con más árboles suele generalizar mejor, a costa de tiempo.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que <b>sumar muchos modelos débiles da uno fuerte</b>: cada árbol pequeño acierta un poco más que
            adivinar, y juntos corrigen sus fallas.
          </p>
          <p>
            También supone que lo que queda por corregir es patrón, no <G k="ruido">ruido</G>. Si sigue sumando
            árboles cuando ya solo queda ruido, empieza a memorizarlo.
          </p>
        </>
      ),
      deepDive: (
        <p>
          No supone linealidad ni necesita escalar las features. Las etiquetas deben ser confiables: con la pérdida
          cuadrática, un valor atípico produce un residuo enorme que los árboles siguientes persiguen. Para regresión
          con <G k="outlier">outliers</G> existe la pérdida de Huber (<code>loss="huber"</code>).
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Muy preciso en tablas:</b> suele ganarles a los demás algoritmos de este explorador con datos
            estructurados.
          </li>
          <li>
            <b>Flexible:</b> sirve para clasificar, para predecir números y para ordenar, cambiando la pérdida.
          </li>
          <li>
            <b>Poca preparación:</b> como el bosque, no hay que escalar features. Las versiones modernas aceptan
            valores faltantes.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Al corregir errores paso a paso reduce sobre todo el sesgo, mientras que Random Forest reduce sobre todo
          la varianza. <code>HistGradientBoostingClassifier</code> maneja valores faltantes y features categóricas
          de forma nativa y escala a millones de filas.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Riesgo de <G k="overfitting">sobreajuste</G>:</b> en el ejercicio, la pérdida en clientes nuevos
            baja hasta 0.504 con 24 árboles y luego sube hasta 0.611 con 300, aunque en entrenamiento siga bajando.
          </li>
          <li>
            <b>Entrenamiento secuencial:</b> cada árbol espera al anterior, así que no se reparten los árboles entre
            procesadores (sí el trabajo dentro de cada árbol).
          </li>
          <li>
            <b>Muchos <G k="hiperparametro">hiperparámetros</G>:</b> número de árboles, tasa, profundidad… y
            dependen entre sí.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          La defensa estándar es la parada temprana: apartar una parte de los datos y detener el entrenamiento
          cuando la pérdida en ellos deja de bajar (<code>n_iter_no_change</code> y{' '}
          <code>validation_fraction</code> en scikit-learn). También ayudan árboles poco profundos, tasa pequeña y
          entrenar cada árbol con una fracción de las filas (<code>subsample</code>).
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses con etiquetas muy ruidosas o con muy pocos datos.</p>
          <p>
            Ejemplo: 200 clientes, con errores de digitación en quién pagó y quién no. Cada árbol nuevo persigue esos
            errores. Un Random Forest o una regresión logística son más estables.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Tampoco es la primera opción con imágenes, audio o texto largo (ahí ganan las redes neuronales), ni si
          debes explicar cada decisión regla por regla. Para explicarlo se usan herramientas aparte, como los valores
          SHAP, que estiman cuánto aportó cada feature a una predicción.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Scoring de crédito.</b> Bancos y fintechs estiman la probabilidad de impago con ingreso, nivel de
            deuda, pagos atrasados y edad. Los modelos de boosting son comunes en esta tarea, junto con la regresión
            logística, que se sigue usando porque es fácil de explicar al cliente y al regulador.
          </p>
          <p>
            El ejercicio genera 800 clientes con una regla no lineal (la deuda pesa mucho más cuando el ingreso es
            bajo), entrena 300 árboles a propósito y mide la <G k="perdidaLog">pérdida logarítmica</G> después de
            cada uno. En entrenamiento baja siempre (de 0.620 a 0.265). En clientes nuevos baja hasta 0.504 con 24
            árboles y desde ahí sube. La gráfica muestra el punto donde conviene parar.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Elegir el número de árboles mirando los datos de prueba, como hace el ejercicio para mostrar la curva,
          hace que esa medición quede optimista. En un proyecto real se elige con una parte de validación (o
          validación cruzada) y los datos de prueba se usan una sola vez, al final.
        </p>
      ),
    },
  },
  Ova: GradientBoostingOva,
  python: { code, expectedOutput, colabNotebook: 'gradient-boosting' },
  inYourField: [
    { area: 'Eléctrica', example: 'pronosticar la demanda de energía de cada hora a partir del clima, el día de la semana y los festivos.' },
    { area: 'Mecánica', example: 'estimar el desgaste de una herramienta de corte a partir de la velocidad, el avance y la vibración.' },
    { area: 'Industrial', example: 'predecir qué pedidos llegarán tarde según la ruta, el proveedor y la carga de la bodega.' },
  ],
  alternatives: ['random-forest', 'logistic-regression', 'mlp'],
};

export default gradientBoosting;
```

- [ ] **Step 8: Añadir el loader**

En `registry.ts`, dentro de `LOADERS`, justo después de

```ts
  'random-forest': () => import('./algorithms/random-forest'),
```

añade (el orden de `LOADERS` no afecta al menú, pero así sigue el orden del cheatsheet):

```ts
  'gradient-boosting': () => import('./algorithms/gradient-boosting'),
```

- [ ] **Step 9: Notebook de Colab**

En `scripts/build-ml-notebook.py`, dentro de `ALGORITHMS` (mismo orden que el menú), añade justo después de la tupla de `"random-forest"`:

```python
    (
        "gradient-boosting",
        "Gradient Boosting (potenciación por gradiente)",
        "Scoring de crédito: cada árbol corrige al anterior. La curva de pérdida dice cuándo parar.",
    ),
```

```bash
python3 scripts/build-ml-notebook.py
```
Expected: `Escrito notebooks/algoritmos-ml.ipynb y 6 notebooks individuales`.

- [ ] **Step 10: Description del artículo**

En `src/data/articles/algoritmos-ml-explorador.md`, en la línea `description:`, cambia «Los primeros cinco ya están completos» por «Los primeros seis ya están completos» (lo exige `algoritmos-ml-explorador.links.test.ts`).

- [ ] **Step 11: Verificación completa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
```
Expected: todos los tests pasan (incluidos `registry.test.ts`, que comprueba que las alternativas de `gradient-boosting` existen; `notebook.test.ts`, que compara el notebook con el `.py`; y `algoritmos-ml-explorador.links.test.ts`); `tsc` sin errores.

Revisión manual con el servidor de desarrollo (`ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js`), en `#/articles/algoritmos-ml-explorador?alg=gradient-boosting&tab=formula`: la OVA responde al teclado (Tab hasta los controles, flechas en el slider, Enter/Espacio en los botones), las fichas 💡 abren, y en «Ejemplo real» «▶ Ejecutar» da la misma salida que la esperada.

- [ ] **Step 12: Commit**

```bash
git add src/components/ml-explorer/algorithms/python/gradient-boosting.py src/components/ml-explorer/algorithms/python/gradient-boosting.out.txt \
  src/components/ml-explorer/algorithms/python/outputs.test.ts \
  src/components/ml-explorer/ovas/GradientBoostingOva.tsx src/components/ml-explorer/ovas/GradientBoostingOva.dom.test.tsx \
  src/components/ml-explorer/algorithms/gradient-boosting.tsx src/components/ml-explorer/registry.ts src/components/ml-explorer/registry.test.ts \
  src/components/ml-explorer/MLExplorer.real.dom.test.tsx scripts/build-ml-notebook.py ../notebooks/algoritmos-ml.ipynb ../notebooks/algoritmos-ml/gradient-boosting.ipynb \
  src/data/articles/algoritmos-ml-explorador.md
git commit -m "feat(ml-explorer): add Gradient Boosting with its simulator and exercise

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: SVM

**Files:**
- Create: `src/components/ml-explorer/algorithms/python/svm.py`
- Create: `src/components/ml-explorer/algorithms/python/svm.out.txt` (generado)
- Modify: `src/components/ml-explorer/algorithms/python/outputs.test.ts`
- Create: `src/components/ml-explorer/ovas/SvmOva.tsx`
- Create: `src/components/ml-explorer/ovas/SvmOva.dom.test.tsx`
- Create: `src/components/ml-explorer/algorithms/svm.tsx`
- Modify: `src/components/ml-explorer/registry.ts`, `src/components/ml-explorer/registry.test.ts`
- Modify: `src/components/ml-explorer/MLExplorer.real.dom.test.tsx`
- Modify: `scripts/build-ml-notebook.py`; regenerar `../notebooks/algoritmos-ml.ipynb` y crear `../notebooks/algoritmos-ml/svm.ipynb`
- Modify: `src/data/articles/algoritmos-ml-explorador.md` (solo la description)

Historia del ejercicio («reconocimiento facial simplificado» del spec, con los dígitos 8×8 de `load_digits`, empaquetados en scikit-learn y disponibles en Pyodide): kernel lineal contra RBF con C = 0.01, 1 y 100. RBF con C = 1 (los valores por defecto) acierta 98.7 %; C = 100, 99.4 %; con C = 0.01 casi no aprende (18.3 %, las 1 257 imágenes como vectores de soporte). El lineal ya da 98.5 %: en 64 dimensiones casi se separan con planos. Muestra 3 errores como imágenes.

La OVA tiene 22 puntos (uno «raro» de la clase 1 metido entre la clase 0), un slider de C (0.01 a 100) y botones de kernel (lineal / RBF). Colorea el plano por el signo de f(x), aclara la franja |f(x)| < 1 (el margen) y pone un anillo blanco a los vectores de soporte.

- [ ] **Step 1: Fijar las cifras del ejercicio en `outputs.test.ts` (falla)**

Añade el import junto a los otros:

```ts
import svm from './svm.out.txt?raw';
```

y dentro del `describe('cifras citadas en los textos', …)`, al final:

```ts
  it('SVM: RBF con C = 1 acierta 98.7 % (7 fallos de 540); C = 100, 99.4 %; C = 0.01, 18.3 % con 1257 vectores', () => {
    expect(svm).toContain('1257 imágenes para entrenar, 540 nuevas para probar');
    expect(svm).toMatch(/^rbf\s+1\s+98\.7%\s+593$/m);
    expect(svm).toMatch(/^rbf\s+100\s+99\.4%\s+528$/m);
    expect(svm).toMatch(/^rbf\s+0\.01\s+18\.3%\s+1257$/m);
    expect(svm).toMatch(/^linear\s+1\s+98\.5%\s+386$/m);
    expect(svm).toContain('Con RBF y C = 1 falla 7 de 540.');
  });
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: FAIL (`svm.out.txt` no existe).

- [ ] **Step 2: Escribir el ejercicio**

Crea `src/components/ml-explorer/algorithms/python/svm.py`:

```python
# Reconocer dígitos escritos a mano (imágenes de 8×8 píxeles): SVM lineal contra kernel RBF
import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC

digitos = load_digits()                  # 1797 imágenes, viene incluido en scikit-learn
X = digitos.data / 16                    # 64 píxeles por imagen, escalados a [0, 1]
y = digitos.target
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)
print(f"{len(X_tr)} imágenes para entrenar, {len(X_te)} nuevas para probar")

print("\nKernel  C      acierto en nuevas  vectores de soporte")
for kernel in ["linear", "rbf"]:
    for C in [0.01, 1, 100]:
        svm = SVC(kernel=kernel, C=C).fit(X_tr, y_tr)
        print(f"{kernel:<7} {C:<6} {svm.score(X_te, y_te):>17.1%}  {svm.n_support_.sum():>19}")

svm = SVC(kernel="rbf", C=1).fit(X_tr, y_tr)
errores = np.flatnonzero(svm.predict(X_te) != y_te)
print(f"\nCon RBF y C = 1 falla {len(errores)} de {len(y_te)}. Por ejemplo:")
for i in errores[:3]:
    print(f"  era un {y_te[i]}, dijo {svm.predict(X_te[i:i + 1])[0]}")

fig, ejes = plt.subplots(1, 3, figsize=(4.5, 1.8))
for eje, i in zip(ejes, errores[:3]):
    eje.imshow(X_te[i].reshape(8, 8), cmap="gray")
    eje.set_title(f"{y_te[i]} → {svm.predict(X_te[i:i + 1])[0]}")
    eje.axis("off")
plt.show()
```

- [ ] **Step 3: Generar y verificar la salida en CPython y en Pyodide**

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py --update
git status --short src/components/ml-explorer/algorithms/python/
```
Expected: `↻` en todos los `.out.txt`, pero `git status` solo muestra `svm.py` y `svm.out.txt` como nuevos (los demás se regeneran idénticos). El `.out.txt` debe ser exactamente:

```text
1257 imágenes para entrenar, 540 nuevas para probar

Kernel  C      acierto en nuevas  vectores de soporte
linear  0.01               93.3%                 1158
linear  1                  98.5%                  386
linear  100                98.1%                  371
rbf     0.01               18.3%                 1257
rbf     1                  98.7%                  593
rbf     100                99.4%                  528

Con RBF y C = 1 falla 7 de 540. Por ejemplo:
  era un 8, dijo 1
  era un 9, dijo 5
  era un 8, dijo 9
```

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
node scripts/check-ml-exercises-pyodide.mjs
```
Expected: `✓ svm.py` y `✓ svm.py (Pyodide)`, y `✓` en todos los demás. Si Pyodide difiere, **no** ajustes el `.out.txt` a mano: busca la fuente de no determinismo (regla 7).

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: PASS.

- [ ] **Step 4: Test de la OVA (falla)**

Crea `src/components/ml-explorer/ovas/SvmOva.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SvmOva } from './SvmOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const setC = (i: number) => fireEvent.change(screen.getByRole('slider'), { target: { value: String(i) } });
const rings = (c: HTMLElement) => c.querySelectorAll('svg circle[r="10"]').length;

describe('SvmOva', () => {
  it('lineal: C pequeño → margen ancho y muchos vectores de soporte; C grande → margen estrecho', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<SvmOva />);
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('1');
    expect(status(container)).toContain('Vectores de soporte: 5 de 22');
    expect(status(container)).toContain('Acierta 21 de 22 puntos');
    expect(status(container)).toContain('Ancho del margen: 2.13');
    expect(rings(container)).toBe(5);

    setC(0);
    expect(status(container)).toContain('Vectores de soporte: 17 de 22');
    expect(status(container)).toContain('Ancho del margen: 7.03');

    setC(4);
    expect(status(container)).toContain('Vectores de soporte: 4 de 22');
    expect(status(container)).toContain('Acierta 21 de 22 puntos');
    expect(status(container)).toContain('Ancho del margen: 1.94');
    expect(error).not.toHaveBeenCalled();
  });

  it('RBF con C = 10 rodea el punto raro y acierta los 22; con C = 1 lo deja pasar', () => {
    const { container } = render(<SvmOva />);
    fireEvent.click(screen.getByRole('button', { name: 'RBF (curvo)' }));
    expect(screen.getByRole('button', { name: 'RBF (curvo)' }).getAttribute('aria-pressed')).toBe('true');
    expect(status(container)).toContain('Vectores de soporte: 19 de 22');
    expect(status(container)).toContain('Acierta 21 de 22 puntos');
    expect(status(container)).not.toContain('margen');

    setC(3);
    expect(status(container)).toContain('Vectores de soporte: 14 de 22');
    expect(status(container)).toContain('Acierta 22 de 22 puntos');

    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }));
    expect(status(container)).toContain('Ancho del margen: 2.13');
  });

  it('el svg es una imagen con 22 puntos y 1024 celdas; el hint va fuera del readout', () => {
    const { container } = render(<SvmOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('circle[r="6"]')).toHaveLength(22);
    expect(svg?.querySelectorAll('rect')).toHaveLength(1024);
    const hint = screen.getByText(/solo ellos deciden dónde va la frontera/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });
});
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/SvmOva.dom.test.tsx`
Expected: FAIL (no existe `./SvmOva`).

- [ ] **Step 5: Escribir la OVA**

Crea `src/components/ml-explorer/ovas/SvmOva.tsx`:

```tsx
import { useMemo, useState } from 'react';
import { SVM_CS, SVM_GAMMA, SVM_POINTS as POINTS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { marginWidth, supportVectors, svmAccuracy, svmDecision, trainSvm, type Kernel } from './ovaMath';
import { createPlot } from './plot';

const PLOT = createPlot(320, 320, 30, [0, 10], [0, 10]);
const CELLS = 32;
const CELL = 10 / CELLS;
const START_C = 2; // índice de C = 1, el valor por defecto de scikit-learn
const KERNELS = [
  { id: 'linear', label: 'Lineal' },
  { id: 'rbf', label: 'RBF (curvo)' },
] as const;

export function SvmOva() {
  const [kernelId, setKernelId] = useState<'linear' | 'rbf'>('linear');
  const [cIndex, setCIndex] = useState(START_C);
  const C = SVM_CS[cIndex];

  const model = useMemo(() => {
    const kernel: Kernel = kernelId === 'linear' ? { kind: 'linear' } : { kind: 'rbf', gamma: SVM_GAMMA };
    return trainSvm(POINTS, C, kernel);
  }, [C, kernelId]);
  const sv = new Set(supportVectors(model));
  const hits = Math.round(svmAccuracy(model, POINTS) * POINTS.length);

  const cells = useMemo(() => {
    const out: { x: number; y: number; f: number }[] = [];
    for (let i = 0; i < CELLS; i++) {
      for (let j = 0; j < CELLS; j++) {
        const x = i * CELL;
        const y = j * CELL;
        out.push({ x, y, f: svmDecision(model, { x: x + CELL / 2, y: y + CELL / 2 }) });
      }
    }
    return out;
  }, [model]);

  return (
    <OvaFrame
      title="La calle más ancha posible"
      hint="La SVM busca la frontera con el margen más ancho (la franja clara). Los puntos con anillo blanco son los vectores de soporte: solo ellos deciden dónde va la frontera. Sube C para castigar más los errores y mira qué hace con el punto naranja metido entre los azules; luego cambia a kernel RBF."
      controls={
        <>
          <div role="group" aria-label="Kernel">
            <span>Kernel: </span>
            {KERNELS.map((k) => (
              <button key={k.id} type="button" aria-pressed={kernelId === k.id} onClick={() => setKernelId(k.id)}>
                {k.label}
              </button>
            ))}
          </div>
          <OvaSlider
            label="C (castigo por error)"
            value={cIndex}
            min={0}
            max={SVM_CS.length - 1}
            step={1}
            onChange={setCIndex}
            format={(i) => String(SVM_CS[i])}
          />
          <button
            type="button"
            onClick={() => {
              setKernelId('linear');
              setCIndex(START_C);
            }}
          >
            Restablecer
          </button>
        </>
      }
      readout={
        <>
          <span>
            Vectores de soporte: <b>{sv.size} de {POINTS.length}</b>
          </span>
          <span>
            Acierta <b>{hits} de {POINTS.length}</b> puntos
          </span>
          {kernelId === 'linear' && (
            <span>
              Ancho del margen: <b>{marginWidth(model).toFixed(2)}</b>
            </span>
          )}
        </>
      }
    >
      <svg
        viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
        role="img"
        aria-label="Plano dividido por la SVM, con su margen y los vectores de soporte marcados"
      >
        {cells.map((c, i) => (
          <rect
            key={i}
            x={PLOT.sx(c.x)}
            y={PLOT.sy(c.y + CELL)}
            width={PLOT.sx(CELL) - PLOT.sx(0)}
            height={PLOT.sy(0) - PLOT.sy(CELL)}
            fill={c.f > 0 ? OVA_COLORS.class1 : OVA_COLORS.class0}
            fillOpacity={Math.abs(c.f) < 1 ? 0.06 : 0.22}
          />
        ))}
        {POINTS.map((p, i) => (
          <g key={i}>
            {sv.has(i) && (
              <circle cx={PLOT.sx(p.x)} cy={PLOT.sy(p.y)} r={10} fill="none" stroke="#ffffff" strokeWidth={1.5} />
            )}
            <circle
              cx={PLOT.sx(p.x)}
              cy={PLOT.sy(p.y)}
              r={6}
              fill={p.label ? OVA_COLORS.class1 : OVA_COLORS.class0}
              stroke="#040320"
              strokeWidth={1.5}
            />
          </g>
        ))}
      </svg>
    </OvaFrame>
  );
}
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/SvmOva.dom.test.tsx`
Expected: PASS.

- [ ] **Step 6: Registrar el algoritmo en el test del registry (falla)**

En `registry.test.ts`, reemplaza

```ts
    expect(AVAILABLE_SLUGS).toEqual([
      'linear-regression',
      'logistic-regression',
      'decision-tree',
      'random-forest',
      'gradient-boosting',
      'knn',
    ]);
```

por

```ts
    expect(AVAILABLE_SLUGS).toEqual([
      'linear-regression',
      'logistic-regression',
      'decision-tree',
      'random-forest',
      'gradient-boosting',
      'svm',
      'knn',
    ]);
```

y añade al final de `MLExplorer.real.dom.test.tsx`:

```tsx
it('SVM real (?alg=svm): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=svm']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'SVM' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'formula') {
      const svg = container.querySelector('.mlx-tabpanel svg[role="img"]');
      expect(svg).not.toBeNull();
      expect(svg!.querySelectorAll('circle[r="6"]')).toHaveLength(22);
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('Ancho del margen: 2.13');
      expect(container.querySelector('.katex')).not.toBeNull();
    }
  }

  expect(error).not.toHaveBeenCalled();
});
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/registry.test.ts src/components/ml-explorer/MLExplorer.real.dom.test.tsx`
Expected: FAIL (`svm` aún no está disponible).

- [ ] **Step 7: Escribir el módulo del algoritmo**

Crea `src/components/ml-explorer/algorithms/svm.tsx`. Las cifras de los textos son las que fijan `outputs.test.ts` (Step 1) y `datasets.test.ts` (Task 2):

```tsx
import { G } from '../Gloss';
import { Tex } from '../Tex';
import { SvmOva } from '../ovas/SvmOva';
import type { AlgorithmModule } from '../types';
import code from './python/svm.py?raw';
import expectedOutput from './python/svm.out.txt?raw';

const svm: AlgorithmModule = {
  slug: 'svm',
  row: {
    type: 'Supervisado',
    bestUse: 'Datos de muchas dimensiones',
    formula: 'Maximizar el margen',
    assumptions: 'Clases separables (el kernel ayuda)',
    pros: 'Eficaz con muchas features',
    cons: 'Lento con muchos datos',
    whenNot: 'Conjuntos de datos muy grandes',
    realWorld: 'Reconocimiento de imágenes (rostros, dígitos)',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>Supervisado:</b> aprende de ejemplos con respuesta (imágenes de dígitos con el número que muestran).
          </p>
          <p>
            Busca la <G k="frontera">frontera</G> que <b>separa las clases dejando la franja vacía más ancha
            posible</b> a cada lado. Esa franja es el <G k="margen">margen</G>.
          </p>
          <p>
            Se usa sobre todo para clasificar. Existe una versión para predecir números (SVR), que no cubre este
            explorador.
          </p>
        </>
      ),
      deepDive: (
        <p>
          SVM viene de <i>Support Vector Machine</i>, máquina de vectores de soporte. Con más de dos clases,{' '}
          <code>SVC</code> de scikit-learn entrena un modelo por cada par de clases (uno contra uno) y los pone a
          votar: con los 10 dígitos son 45 modelos.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo con <b>conjuntos pequeños o medianos</b> (hasta decenas de miles de filas) y{' '}
            <b>muchas features</b>, cuando las clases están bien separadas.
          </p>
          <ul>
            <li>Reconocer dígitos o caracteres en imágenes pequeñas.</li>
            <li>Clasificar textos representados con miles de palabras.</li>
            <li>Clasificar señales (ECG, vibración) a partir de features ya calculadas.</li>
          </ul>
          <p className="mlx-rule">
            Si tienes más features que filas y las clases se separan bien, prueba una SVM lineal.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Con texto o datos dispersos suele bastar el kernel lineal (<code>LinearSVC</code>, mucho más rápido).
          Con pocas features y fronteras curvas, el kernel RBF. Antes de entrenar hay que escalar las features.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> en el simulador, con kernel lineal y C = 1, la franja vacía mide 2.13 de ancho y la
            definen solo 5 de los 22 puntos: los <G k="vectorSoporte">vectores de soporte</G>. Si borras cualquier
            otro punto, la frontera no se mueve.
          </p>
          <p>La frontera es una recta (o un plano) y el margen se mide así:</p>
          <Tex block>{'w \\cdot x + b = 0, \\qquad \\text{ancho del margen} = \\frac{2}{\\lVert w \\rVert}'}</Tex>
          <p>
            <Tex>{'w'}</Tex> es la dirección perpendicular a la frontera y <Tex>{'b'}</Tex> la desplaza. Maximizar
            el margen es lo mismo que hacer <Tex>{'\\lVert w \\rVert'}</Tex> lo más pequeño posible.
          </p>
          <p>
            C dice cuánto castigar los puntos que quedan dentro del margen o del lado equivocado. Con C = 0.01 el
            margen se abre a 7.03 y 17 puntos quedan sobre él o dentro; con C = 100 se estrecha a 1.94 y solo quedan
            4.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>Problema de margen suave:</p>
          <Tex block>
            {'\\min_{w,b,\\xi}\\ \\tfrac12\\lVert w\\rVert^2 + C\\sum_i \\xi_i \\quad \\text{sujeto a}\\quad y_i(w\\cdot x_i + b) \\ge 1 - \\xi_i,\\ \\ \\xi_i \\ge 0'}
          </Tex>
          <p>
            Su forma dual solo usa productos <Tex>{'x_i \\cdot x_j'}</Tex>. Cambiarlos por un{' '}
            <G k="kernel">kernel</G> <Tex>{'K(x_i, x_j)'}</Tex> da fronteras curvas sin calcular features nuevas:
          </p>
          <Tex block>{'K_{\\text{RBF}}(x, z) = e^{-\\gamma \\lVert x - z \\rVert^2}'}</Tex>
          <p>
            El simulador resuelve el dual con SMO, el mismo método de LIBSVM, la biblioteca que usa{' '}
            <code>SVC</code>; sus cifras coinciden a dos decimales con las de scikit-learn. Valores por defecto: kernel RBF, C = 1 y{' '}
            <Tex>{'\\gamma'}</Tex> = <code>"scale"</code>.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que <b>las clases se pueden separar</b> con una frontera, aunque sea con algunos errores. Si no
            se separan con una recta, el kernel RBF permite curvas.
          </p>
          <p>
            También supone <b>features en escalas comparables</b>: el margen se mide con distancias, así que una
            feature en millones aplasta a otra entre 0 y 1. Por eso se aplica <G k="escalado">escalado</G> antes.
          </p>
        </>
      ),
      deepDive: (
        <p>
          En el ejercicio los píxeles van de 0 a 16 y se dividen por 16 para dejarlos entre 0 y 1. Con kernel RBF,
          <Tex>{'\\gamma'}</Tex> también depende de la escala: el valor <code>"scale"</code> lo ajusta según la
          varianza de los datos.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Eficaz con muchas features:</b> en el ejercicio, con 64 píxeles por imagen, acierta 98.7 % de
            dígitos nuevos con los valores por defecto.
          </li>
          <li>
            <b>Fronteras flexibles:</b> con un kernel se adapta a formas curvas.
          </li>
          <li>
            <b>Modelo compacto:</b> para predecir solo guarda los vectores de soporte.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          El problema de optimización es convexo: no hay mínimos locales que atrapen al algoritmo, así que el óptimo
          que encuentra es el global. Maximizar el margen actúa como regularización, por eso
          resiste bien el sobreajuste con muchas features.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Lento con muchos datos:</b> el tiempo de entrenamiento crece al menos con el cuadrado del número de
            filas.
          </li>
          <li>
            <b>Sensible a C y <Tex>{'\\gamma'}</Tex>:</b> en el ejercicio, el kernel RBF con C = 0.01 acierta solo
            18.3 %; con C = 1, 98.7 %.
          </li>
          <li>
            <b>Sin probabilidades directas:</b> entrega una distancia a la frontera, no una probabilidad.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          scikit-learn advierte que <code>SVC</code> se vuelve poco práctico por encima de decenas de miles de filas.
          Con <code>probability=True</code> estima probabilidades con validación cruzada interna (escalado de Platt):
          entrena más lento y esas probabilidades pueden no coincidir con la clase que da <code>predict</code>. C y{' '}
          <Tex>{'\\gamma'}</Tex> se eligen juntos con validación cruzada.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses con cientos de miles de filas o más.</p>
          <p>
            Ejemplo: clasificar millones de transacciones. Entrenar una SVM con kernel RBF tardaría horas o días;
            un modelo lineal o un ensamble de árboles tarda minutos.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Tampoco es buena idea si necesitas probabilidades bien calibradas (mejor regresión logística) o si las
          clases se solapan mucho y hay mucho <G k="ruido">ruido</G>: el modelo termina con casi todos los puntos
          como vectores de soporte y pierde su ventaja.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Reconocimiento de imágenes.</b> A finales de los 90 y comienzos de los 2000 las SVM estaban entre los
            mejores métodos para reconocer dígitos escritos a mano y detectar rostros, antes de que las redes
            convolucionales las superaran.
          </p>
          <p>
            El ejercicio usa los 1 797 dígitos de 8×8 píxeles que trae scikit-learn. Compara kernel lineal y RBF con
            tres valores de C. Con RBF y C = 1 falla 7 de 540 imágenes nuevas (98.7 %); con C = 100 llega a 99.4 %.
            Con C = 0.01 el modelo casi no aprende: las 1 257 imágenes de entrenamiento quedan como vectores de
            soporte y acierta 18.3 %.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Aquí el kernel lineal ya acierta 98.5 % (C = 1): en 64 dimensiones los dígitos casi se separan con planos.
          La ventaja del RBF es pequeña. Esa es la regla con muchas features: prueba primero el lineal.
        </p>
      ),
    },
  },
  Ova: SvmOva,
  python: { code, expectedOutput, colabNotebook: 'svm' },
  inYourField: [
    { area: 'Biomédica', example: 'clasificar latidos de un electrocardiograma como normales o arrítmicos a partir de features de la señal.' },
    { area: 'Química', example: 'identificar el origen o la adulteración de una muestra a partir de su espectro infrarrojo.' },
    { area: 'Electrónica', example: 'detectar fallas en motores a partir de features de vibración, con pocos ejemplos de falla.' },
  ],
  alternatives: ['logistic-regression', 'random-forest', 'knn'],
};

export default svm;
```

- [ ] **Step 8: Añadir el loader**

En `registry.ts`, dentro de `LOADERS`, justo después de

```ts
  'gradient-boosting': () => import('./algorithms/gradient-boosting'),
```

añade (el orden de `LOADERS` no afecta al menú, pero así sigue el orden del cheatsheet):

```ts
  svm: () => import('./algorithms/svm'),
```

- [ ] **Step 9: Notebook de Colab**

En `scripts/build-ml-notebook.py`, dentro de `ALGORITHMS` (mismo orden que el menú), añade justo después de la tupla de `"gradient-boosting"`:

```python
    (
        "svm",
        "SVM (máquina de vectores de soporte)",
        "Dígitos escritos a mano (8×8 píxeles): kernel lineal contra RBF y el efecto de C.",
    ),
```

```bash
python3 scripts/build-ml-notebook.py
```
Expected: `Escrito notebooks/algoritmos-ml.ipynb y 7 notebooks individuales`.

- [ ] **Step 10: Description del artículo**

En `src/data/articles/algoritmos-ml-explorador.md`, en la línea `description:`, cambia «Los primeros seis ya están completos» por «Los primeros siete ya están completos» (lo exige `algoritmos-ml-explorador.links.test.ts`).

- [ ] **Step 11: Verificación completa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
```
Expected: todos los tests pasan (incluidos `registry.test.ts`, que comprueba que las alternativas de `svm` existen; `notebook.test.ts`, que compara el notebook con el `.py`; y `algoritmos-ml-explorador.links.test.ts`); `tsc` sin errores.

Revisión manual con el servidor de desarrollo (`ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js`), en `#/articles/algoritmos-ml-explorador?alg=svm&tab=formula`: la OVA responde al teclado (Tab hasta los controles, flechas en el slider, Enter/Espacio en los botones), las fichas 💡 abren, y en «Ejemplo real» «▶ Ejecutar» da la misma salida que la esperada.

- [ ] **Step 12: Commit**

```bash
git add src/components/ml-explorer/algorithms/python/svm.py src/components/ml-explorer/algorithms/python/svm.out.txt \
  src/components/ml-explorer/algorithms/python/outputs.test.ts \
  src/components/ml-explorer/ovas/SvmOva.tsx src/components/ml-explorer/ovas/SvmOva.dom.test.tsx \
  src/components/ml-explorer/algorithms/svm.tsx src/components/ml-explorer/registry.ts src/components/ml-explorer/registry.test.ts \
  src/components/ml-explorer/MLExplorer.real.dom.test.tsx scripts/build-ml-notebook.py ../notebooks/algoritmos-ml.ipynb ../notebooks/algoritmos-ml/svm.ipynb \
  src/data/articles/algoritmos-ml-explorador.md
git commit -m "feat(ml-explorer): add SVM with its simulator and exercise

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Naive Bayes

**Files:**
- Create: `src/components/ml-explorer/algorithms/python/naive-bayes.py`
- Create: `src/components/ml-explorer/algorithms/python/naive-bayes.out.txt` (generado)
- Modify: `src/components/ml-explorer/algorithms/python/outputs.test.ts`
- Create: `src/components/ml-explorer/ovas/NaiveBayesOva.tsx`
- Create: `src/components/ml-explorer/ovas/NaiveBayesOva.dom.test.tsx`
- Create: `src/components/ml-explorer/algorithms/naive-bayes.tsx`
- Modify: `src/components/ml-explorer/registry.ts`, `src/components/ml-explorer/registry.test.ts`
- Modify: `src/components/ml-explorer/MLExplorer.real.dom.test.tsx`
- Modify: `scripts/build-ml-notebook.py`; regenerar `../notebooks/algoritmos-ml.ipynb` y crear `../notebooks/algoritmos-ml/naive-bayes.ipynb`
- Modify: `src/data/articles/algoritmos-ml-explorador.md` (solo la description)
- Modify: `src/components/ml-explorer/render.test.ts`

Historia del ejercicio: 16 reseñas cortas (8 y 8), `CountVectorizer` + `MultinomialNB(alpha=1.0)`. Tres reseñas nuevas (93 %, 5 % y 28 %), las palabras que más empujan a cada lado y los factores de «llegó», «batería» y «la»; «nueva» no está en el vocabulario y se ignora.

La OVA es un campo de texto (más 3 botones con las reseñas del ejercicio): muestra los odds iniciales, el factor de cada palabra (o «no la conoce, se ignora») y los odds finales. El readout solo dice P(positiva) y la predicción; la lista va en `children`.

- [ ] **Step 1: Fijar las cifras del ejercicio en `outputs.test.ts` (falla)**

Añade el import junto a los otros:

```ts
import naiveBayes from './naive-bayes.out.txt?raw';
```

y dentro del `describe('cifras citadas en los textos', …)`, al final:

```ts
  it('Naive Bayes: 16 reseñas, 38 palabras; 93 %, 5 % y 28 %; «nueva» se ignora', () => {
    expect(naiveBayes).toContain('16 reseñas, 38 palabras distintas');
    expect(naiveBayes).toContain('Prior: P(positiva) = 0.50');
    expect(naiveBayes).toMatch(/excelente calidad llegó rápido\s+93%/);
    expect(naiveBayes).toMatch(/no funciona mala compra\s+5%/);
    expect(naiveBayes).toMatch(/llegó la batería nueva\s+28%/);
    expect(naiveBayes).toContain('«llegó» multiplica los odds de positiva por 0.70');
    expect(naiveBayes).toContain('«batería» multiplica los odds de positiva por 1.05');
    expect(naiveBayes).toContain('«la» multiplica los odds de positiva por 0.53');
    expect(naiveBayes).toContain('«nueva» no estaba en el entrenamiento: se ignora');
  });
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: FAIL (`naive-bayes.out.txt` no existe).

- [ ] **Step 2: Escribir el ejercicio**

Crea `src/components/ml-explorer/algorithms/python/naive-bayes.py`:

```python
# Sentimiento de reseñas: Naive Bayes cuenta palabras y multiplica sus evidencias
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

resenas = [
    ("excelente producto llegó rápido y funciona perfecto", 1),
    ("muy buena calidad lo recomiendo", 1),
    ("me encantó excelente atención", 1),
    ("funciona perfecto buena compra", 1),
    ("rápido y buena calidad recomendado", 1),
    ("excelente precio muy contento", 1),
    ("buena batería y pantalla excelente", 1),
    ("lo recomiendo a todos me encantó", 1),
    ("pésimo producto llegó roto", 0),
    ("muy mala calidad no lo recomiendo", 0),
    ("llegó tarde y no funciona", 0),
    ("mala atención pésimo servicio", 0),
    ("se dañó en una semana mala compra", 0),
    ("no funciona devolví el producto", 0),
    ("la batería dura poco mala calidad", 0),
    ("pésimo no lo compren", 0),
]
textos = [t for t, _ in resenas]
y = np.array([s for _, s in resenas])

vectorizador = CountVectorizer()
X = vectorizador.fit_transform(textos)
nb = MultinomialNB(alpha=1.0).fit(X, y)   # alpha = 1: suavizado de Laplace
print(f"{len(textos)} reseñas, {X.shape[1]} palabras distintas")
print(f"Prior: P(positiva) = {np.exp(nb.class_log_prior_[1]):.2f}")

nuevas = ["excelente calidad llegó rápido", "no funciona mala compra", "llegó la batería nueva"]
print("\nReseña nueva                     P(positiva)")
for texto, p in zip(nuevas, nb.predict_proba(vectorizador.transform(nuevas))[:, 1]):
    print(f"  {texto:<31} {p:.0%}")

palabras = vectorizador.get_feature_names_out()
razon = nb.feature_log_prob_[1] - nb.feature_log_prob_[0]   # log P(w|pos) - log P(w|neg)
print("\nPalabras que más empujan a positiva:", ", ".join(palabras[np.argsort(-razon, kind="stable")[:3]]))
print("Palabras que más empujan a negativa:", ", ".join(palabras[np.argsort(razon, kind="stable")[:3]]))
for w in ["llegó", "batería", "la"]:
    print(f"«{w}» multiplica los odds de positiva por {np.exp(razon[vectorizador.vocabulary_[w]]):.2f}")
print("«nueva» no estaba en el entrenamiento: se ignora")
```

- [ ] **Step 3: Generar y verificar la salida en CPython y en Pyodide**

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py --update
git status --short src/components/ml-explorer/algorithms/python/
```
Expected: `↻` en todos los `.out.txt`, pero `git status` solo muestra `naive-bayes.py` y `naive-bayes.out.txt` como nuevos (los demás se regeneran idénticos). El `.out.txt` debe ser exactamente:

```text
16 reseñas, 38 palabras distintas
Prior: P(positiva) = 0.50

Reseña nueva                     P(positiva)
  excelente calidad llegó rápido  93%
  no funciona mala compra         5%
  llegó la batería nueva          28%

Palabras que más empujan a positiva: buena, excelente, encantó
Palabras que más empujan a negativa: mala, no, pésimo
«llegó» multiplica los odds de positiva por 0.70
«batería» multiplica los odds de positiva por 1.05
«la» multiplica los odds de positiva por 0.53
«nueva» no estaba en el entrenamiento: se ignora
```

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
node scripts/check-ml-exercises-pyodide.mjs
```
Expected: `✓ naive-bayes.py` y `✓ naive-bayes.py (Pyodide)`, y `✓` en todos los demás. Si Pyodide difiere, **no** ajustes el `.out.txt` a mano: busca la fuente de no determinismo (regla 7).

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: PASS.

- [ ] **Step 4: Test de la OVA (falla)**

Crea `src/components/ml-explorer/ovas/NaiveBayesOva.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NaiveBayesOva } from './NaiveBayesOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const words = (c: HTMLElement) => Array.from(c.querySelectorAll('.mlx-nb-words li'), (li) => li.textContent);

describe('NaiveBayesOva', () => {
  it('la frase inicial da 93 %, con el factor de cada palabra', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<NaiveBayesOva />);
    expect(status(container)).toBe('P(positiva) = 93 %Predicción: 🟠 positiva');
    expect(words(container)).toEqual([
      'Odds iniciales (prior): ×1.00',
      '«excelente»: ×5.27',
      '«calidad»: ×1.05',
      '«llegó»: ×0.70',
      '«rápido»: ×3.16',
      'Odds finales: 12.34 → probabilidad 93 %',
    ]);
    expect(error).not.toHaveBeenCalled();
  });

  it('escribir cambia el resultado; las palabras desconocidas se ignoran', () => {
    const { container } = render(<NaiveBayesOva />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'no funciona mala compra' } });
    expect(status(container)).toContain('P(positiva) = 5 %');
    expect(status(container)).toContain('🔵 negativa');

    fireEvent.click(screen.getByRole('button', { name: 'llegó la batería nueva' }));
    expect(status(container)).toContain('P(positiva) = 28 %');
    expect(words(container)).toContain('«nueva»: no la conoce, se ignora');

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    expect(status(container)).toBe('P(positiva) = 50 %Predicción: empate');
  });

  it('la lista de palabras y el hint van fuera del readout', () => {
    const { container } = render(<NaiveBayesOva />);
    const live = container.querySelector('[role="status"]');
    expect(live?.contains(container.querySelector('.mlx-nb-words'))).toBe(false);
    expect(live?.contains(screen.getByText(/Las palabras que el modelo nunca vio no cuentan/))).toBe(false);
  });
});
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/NaiveBayesOva.dom.test.tsx`
Expected: FAIL (no existe `./NaiveBayesOva`).

- [ ] **Step 5: Escribir la OVA**

Crea `src/components/ml-explorer/ovas/NaiveBayesOva.tsx`:

```tsx
import { useState } from 'react';
import { NB_REVIEWS, NB_START } from './datasets';
import { OvaFrame } from './OvaFrame';
import { explainNaiveBayes, trainNaiveBayes } from './ovaMath';

const MODEL = trainNaiveBayes(NB_REVIEWS);
const EXAMPLES = [NB_START, 'no funciona mala compra', 'llegó la batería nueva'];
const pct = (p: number) => `${(p * 100).toFixed(0)} %`;

export function NaiveBayesOva() {
  const [text, setText] = useState(NB_START);
  const result = explainNaiveBayes(MODEL, text);
  const odds = result.pPositive / (1 - result.pPositive);

  return (
    <OvaFrame
      title="Palabra por palabra"
      hint="Escribe una reseña corta (o elige un ejemplo). Cada palabra conocida multiplica los odds de «positiva» por su factor: más de 1 empuja a positiva, menos de 1 a negativa. Las palabras que el modelo nunca vio no cuentan. El modelo aprendió de las mismas 16 reseñas del ejercicio de Python."
      controls={
        <>
          <label className="mlx-nb-input">
            <span>Reseña</span>
            <input type="text" value={text} maxLength={120} onChange={(e) => setText(e.target.value)} />
          </label>
          <div role="group" aria-label="Ejemplos">
            {EXAMPLES.map((ex) => (
              <button key={ex} type="button" onClick={() => setText(ex)}>
                {ex}
              </button>
            ))}
          </div>
        </>
      }
      readout={
        <>
          <span>
            P(positiva) = <b>{pct(result.pPositive)}</b>
          </span>
          <span>
            Predicción: <b>{result.pPositive > 0.5 ? '🟠 positiva' : result.pPositive < 0.5 ? '🔵 negativa' : 'empate'}</b>
          </span>
        </>
      }
    >
      <ol className="mlx-nb-words" aria-label="Evidencia de cada palabra">
        <li>
          Odds iniciales (prior): <b>×{result.priorOdds.toFixed(2)}</b>
        </li>
        {result.words.map((w, i) => (
          <li key={`${w.word}-${i}`} className={w.known ? (w.factor >= 1 ? 'is-pos' : 'is-neg') : 'is-unknown'}>
            «{w.word}»: {w.known ? <b>×{w.factor.toFixed(2)}</b> : <i>no la conoce, se ignora</i>}
          </li>
        ))}
        <li>
          Odds finales: <b>{odds.toFixed(2)}</b> → probabilidad {pct(result.pPositive)}
        </li>
      </ol>
    </OvaFrame>
  );
}
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/NaiveBayesOva.dom.test.tsx`
Expected: PASS.

- [ ] **Step 6: Registrar el algoritmo en el test del registry (falla)**

En `registry.test.ts`, reemplaza

```ts
    expect(AVAILABLE_SLUGS).toEqual([
      'linear-regression',
      'logistic-regression',
      'decision-tree',
      'random-forest',
      'gradient-boosting',
      'svm',
      'knn',
    ]);
```

por

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
    ]);
```

y añade al final de `MLExplorer.real.dom.test.tsx`:

```tsx
it('Naive Bayes real (?alg=naive-bayes): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=naive-bayes']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Naive Bayes' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'formula') {
      expect(container.querySelector('.mlx-tabpanel input[type="text"]')).not.toBeNull();
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('P(positiva) = 93 %');
      expect(container.querySelector('.katex')).not.toBeNull();
    }
  }

  expect(error).not.toHaveBeenCalled();
});
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/registry.test.ts src/components/ml-explorer/MLExplorer.real.dom.test.tsx`
Expected: FAIL (`naive-bayes` aún no está disponible).

- [ ] **Step 7: Escribir el módulo del algoritmo**

Crea `src/components/ml-explorer/algorithms/naive-bayes.tsx`. Las cifras de los textos son las que fijan `outputs.test.ts` (Step 1) y `datasets.test.ts` (Task 2):

```tsx
import { G } from '../Gloss';
import { Tex } from '../Tex';
import { NaiveBayesOva } from '../ovas/NaiveBayesOva';
import type { AlgorithmModule } from '../types';
import code from './python/naive-bayes.py?raw';
import expectedOutput from './python/naive-bayes.out.txt?raw';

const naiveBayes: AlgorithmModule = {
  slug: 'naive-bayes',
  row: {
    type: 'Supervisado',
    bestUse: 'Clasificación de texto',
    formula: 'Teorema de Bayes',
    assumptions: 'Features independientes entre sí',
    pros: 'Rápido y simple',
    cons: 'Supuesto de independencia muy fuerte',
    whenNot: 'Features muy correlacionadas',
    realWorld: 'Filtros de spam y análisis de sentimiento',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>Supervisado:</b> aprende de ejemplos con respuesta (reseñas marcadas como positivas o negativas).
          </p>
          <p>
            Es un clasificador <b>probabilístico</b>: cuenta con qué frecuencia aparece cada palabra en cada clase
            y con esas cuentas calcula la probabilidad de cada clase para un texto nuevo.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Es un modelo generativo: modela cómo se generan los datos de cada clase, <Tex>{'P(x \\mid y)'}</Tex>, y
          usa el teorema de Bayes para invertirlo. Hay variantes según el tipo de feature: <code>MultinomialNB</code>{' '}
          (conteos de palabras), <code>BernoulliNB</code> (presencia sí/no) y <code>GaussianNB</code> (números
          continuos).
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo para <b>clasificar texto</b> con pocos datos o cuando necesitas un modelo que entrene en
            milisegundos.
          </p>
          <ul>
            <li>Filtrar spam.</li>
            <li>Clasificar el sentimiento de reseñas o comentarios.</li>
            <li>Enviar tickets de soporte o correos a la categoría correcta.</li>
          </ul>
          <p className="mlx-rule">
            Para texto, es la línea base que hay que superar: si un modelo complejo no le gana claramente, quédate
            con Naive Bayes.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Con clases desbalanceadas, <code>ComplementNB</code> suele funcionar mejor que <code>MultinomialNB</code>.
          Aprende en una sola pasada por los datos y admite entrenamiento por partes (<code>partial_fit</code>), útil
          cuando los textos llegan en flujo.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> llega la reseña «excelente calidad llegó rápido». Antes de leerla, positiva y negativa
            están empatadas (odds 1, porque hay 8 reseñas de cada una). Cada palabra multiplica esos odds por un
            factor: «excelente» ×5.27, «calidad» ×1.05, «llegó» ×0.70, «rápido» ×3.16. Al final los odds son 12.34
            a 1: probabilidad de 93 % de que sea positiva.
          </p>
          <p>
            Ese es el teorema de Bayes con el supuesto «ingenuo» de que cada palabra aporta su evidencia por
            separado:
          </p>
          <Tex block>{'P(\\text{pos} \\mid \\text{texto}) \;\\propto\; P(\\text{pos}) \\cdot \\prod_{w \\in \\text{texto}} P(w \\mid \\text{pos})'}</Tex>
          <p>
            <Tex>{'P(\\text{pos})'}</Tex> es el <G k="priorVerosimilitud">prior</G> (qué fracción de reseñas es
            positiva) y <Tex>{'P(w \\mid \\text{pos})'}</Tex> la <G k="priorVerosimilitud">verosimilitud</G> de cada
            palabra: qué tan frecuente es dentro de las reseñas positivas. Escribe tus frases en el simulador.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Con <G k="suavizadoLaplace">suavizado de Laplace</G> (<Tex>{'\\alpha = 1'}</Tex>, el valor por defecto):
          </p>
          <Tex block>{'P(w \\mid c) = \\frac{\\text{conteo}(w, c) + \\alpha}{\\text{palabras}(c) + \\alpha\\,V}'}</Tex>
          <p>
            <Tex>{'V'}</Tex> es el tamaño del vocabulario (38 palabras en el ejercicio). Para no multiplicar cientos
            de números pequeños, se suman logaritmos. El factor de cada palabra en el simulador es{' '}
            <Tex>{'P(w \\mid \\text{pos}) / P(w \\mid \\text{neg})'}</Tex>.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que <b>las palabras son independientes entre sí</b>, una vez se sabe la clase. Por eso es
            «ingenuo».
          </p>
          <p>
            Ejemplo: «no» y «funciona» suelen ir juntas en las reseñas negativas, pero el modelo las cuenta como dos
            evidencias separadas. Tampoco ve el orden: escribe «no me encantó» en el simulador y sale 68 % positiva,
            porque «me» y «encantó» solo aparecieron en reseñas positivas.
          </p>
        </>
      ),
      deepDive: (
        <p>
          El supuesto casi nunca se cumple, y aun así el modelo suele clasificar bien: para elegir la clase basta con
          que el orden de las probabilidades sea correcto, aunque sus valores estén exagerados. Usar pares de palabras
          (bigramas, <code>ngram_range=(1, 2)</code>) capta algo del orden, como «no funciona».
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Muy rápido:</b> entrenar es contar palabras.
          </li>
          <li>
            <b>Funciona con pocos datos:</b> el ejercicio aprende de solo 16 reseñas y clasifica bien frases
            nuevas.
          </li>
          <li>
            <b>Fácil de explicar:</b> cada palabra tiene un factor que dice hacia dónde empuja y cuánto.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Escala a vocabularios de cientos de miles de palabras porque solo guarda un conteo por palabra y clase.
          Tiene muy pocos <G k="hiperparametro">hiperparámetros</G> (básicamente <Tex>{'\\alpha'}</Tex>), así que
          es difícil equivocarse al configurarlo.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Supuesto de independencia muy fuerte:</b> no capta combinaciones de palabras ni el orden.
          </li>
          <li>
            <b>Probabilidades exageradas:</b> como cuenta varias veces la misma evidencia, tiende a dar
            probabilidades demasiado cerca de 0 o de 1.
          </li>
          <li>
            <b>Ignora lo desconocido:</b> una palabra que no vio al entrenar no cuenta, aunque sea clave.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Si necesitas probabilidades confiables (por ejemplo, para fijar un <G k="umbral">umbral</G> de riesgo),
          calíbralas con <code>CalibratedClassifierCV</code> o usa regresión logística. Con features continuas
          muy correlacionadas, <code>GaussianNB</code> cuenta la misma información varias veces.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses cuando las features están muy correlacionadas o el orden importa.</p>
          <p>
            Ejemplo: «no fue nada excelente» sale 53 % positiva. El modelo ve «excelente», pero no entiende que «no…
            nada» la niega: el sentido depende de cómo se combinan las palabras. Con negaciones, ironía o sarcasmo
            falla seguido.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Con datos abundantes, una regresión logística o una SVM lineal sobre las mismas palabras suelen acertar
          más. Para entender el significado de frases completas se usan modelos de lenguaje (Transformer).
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Filtros de spam y sentimiento.</b> Los filtros de spam que se popularizaron hacia 2002 calculaban,
            palabra por palabra, qué tan típica era de spam o de correo normal: la misma idea de este algoritmo.
          </p>
          <p>
            El ejercicio entrena <code>MultinomialNB</code> con 16 reseñas cortas (8 y 8, prior 0.50). «excelente
            calidad llegó rápido» sale 93 % positiva y «no funciona mala compra», 5 %. «llegó la batería nueva»
            sale 28 %: «llegó» y «la» aparecieron más en reseñas negativas, y «nueva» no estaba en el vocabulario,
            así que se ignora.
          </p>
        </>
      ),
      deepDive: (
        <p>
          «batería» apareció una vez en cada clase y aun así multiplica por 1.05, no por 1: las reseñas positivas
          tienen menos palabras en total (36 contra 40), así que una aparición pesa un poco más en ellas. Con 16
          reseñas estos detalles mueven mucho el resultado; en la práctica se entrena con miles.
        </p>
      ),
    },
  },
  Ova: NaiveBayesOva,
  python: { code, expectedOutput, colabNotebook: 'naive-bayes' },
  inYourField: [
    { area: 'Sistemas', example: 'clasificar los tickets de soporte por categoría a partir del texto que escribe el usuario.' },
    { area: 'Industrial', example: 'agrupar reportes de incidentes de seguridad por tipo de riesgo según su descripción.' },
    { area: 'Civil', example: 'enviar cada queja ciudadana sobre vías, alumbrado o acueducto a la dependencia correcta.' },
  ],
  alternatives: ['logistic-regression', 'svm', 'transformer'],
};

export default naiveBayes;
```

- [ ] **Step 8: Añadir el loader**

En `registry.ts`, dentro de `LOADERS`, justo después de

```ts
  knn: () => import('./algorithms/knn'),
```

añade (el orden de `LOADERS` no afecta al menú, pero así sigue el orden del cheatsheet):

```ts
  'naive-bayes': () => import('./algorithms/naive-bayes'),
```

- [ ] **Step 9: Notebook de Colab**

En `scripts/build-ml-notebook.py`, dentro de `ALGORITHMS` (mismo orden que el menú), añade justo después de la tupla de `"knn"`:

```python
    (
        "naive-bayes",
        "Naive Bayes (Bayes ingenuo)",
        "Sentimiento de reseñas: cada palabra multiplica la evidencia a favor de positiva o negativa.",
    ),
```

```bash
python3 scripts/build-ml-notebook.py
```
Expected: `Escrito notebooks/algoritmos-ml.ipynb y 8 notebooks individuales`.

- [ ] **Step 10: Description del artículo**

En `src/data/articles/algoritmos-ml-explorador.md`, en la línea `description:`, cambia «Los primeros siete ya están completos» por «Los primeros ocho ya están completos» (lo exige `algoritmos-ml-explorador.links.test.ts`).

- [ ] **Step 10b: La alternativa de prueba de `render.test.ts`**

`render.test.ts` usa un módulo falso con `alternatives: ['knn', 'naive-bayes']` y espera ver `'Naive Bayes (próximamente)'`. Naive Bayes ya está disponible, así que se cambia por otro algoritmo pendiente. Reemplaza:

```ts
    alternatives: ['knn', 'naive-bayes'],
```
por
```ts
    alternatives: ['knn', 'k-means'],
```
y
```ts
      expect(html).toContain('Naive Bayes (próximamente)');
```
por
```ts
      expect(html).toContain('K-Means (próximamente)');
```

- [ ] **Step 11: Verificación completa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
```
Expected: todos los tests pasan (incluidos `registry.test.ts`, que comprueba que las alternativas de `naive-bayes` existen; `notebook.test.ts`, que compara el notebook con el `.py`; y `algoritmos-ml-explorador.links.test.ts`); `tsc` sin errores.

Revisión manual con el servidor de desarrollo (`ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js`), en `#/articles/algoritmos-ml-explorador?alg=naive-bayes&tab=formula`: la OVA responde al teclado (Tab hasta los controles, flechas en el slider, Enter/Espacio en los botones), las fichas 💡 abren, y en «Ejemplo real» «▶ Ejecutar» da la misma salida que la esperada.

- [ ] **Step 12: Commit**

```bash
git add src/components/ml-explorer/algorithms/python/naive-bayes.py src/components/ml-explorer/algorithms/python/naive-bayes.out.txt \
  src/components/ml-explorer/algorithms/python/outputs.test.ts \
  src/components/ml-explorer/ovas/NaiveBayesOva.tsx src/components/ml-explorer/ovas/NaiveBayesOva.dom.test.tsx \
  src/components/ml-explorer/algorithms/naive-bayes.tsx src/components/ml-explorer/registry.ts src/components/ml-explorer/registry.test.ts \
  src/components/ml-explorer/MLExplorer.real.dom.test.tsx src/components/ml-explorer/render.test.ts scripts/build-ml-notebook.py ../notebooks/algoritmos-ml.ipynb ../notebooks/algoritmos-ml/naive-bayes.ipynb \
  src/data/articles/algoritmos-ml-explorador.md
git commit -m "feat(ml-explorer): add Naive Bayes with its simulator and exercise

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Artículo, verificación final, build y deploy

**Files:**
- Modify: `src/data/articles/algoritmos-ml-explorador.md`
- Modify: `src/pages/ArticleDetail.ml.dom.test.tsx`
- Build outputs en la raíz del repo (`../index.html`, `../assets/*`)

- [ ] **Step 1: El test de integración del artículo espera 8 enlaces (falla)**

En `src/pages/ArticleDetail.ml.dom.test.tsx`, cambia `expect(internal).toHaveLength(4);` por `expect(internal).toHaveLength(8);`.

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/pages/ArticleDetail.ml.dom.test.tsx`
Expected: FAIL (`expected … to have a length of 8 but got 4`).

- [ ] **Step 2: Enlaces en la guía «¿Qué algoritmo necesito?»**

En `algoritmos-ml-explorador.md`, en la pregunta 3, reemplaza la frase

```markdown
Para texto corto, como detectar spam, Naive Bayes es una alternativa clásica *(próximamente)*.
```

por

```markdown
Para texto corto, como detectar spam o el sentimiento de una reseña, [Naive Bayes](#/articles/algoritmos-ml-explorador?alg=naive-bayes&tab=type) es una alternativa clásica.
```

y en la pregunta 4 reemplaza la línea

```markdown
   - **No, lo que importa es acertar:** Random Forest, Gradient Boosting o SVM *(próximamente)*.
```

por

```markdown
   - **No, lo que importa es acertar:** [Random Forest](#/articles/algoritmos-ml-explorador?alg=random-forest&tab=type) o [Gradient Boosting](#/articles/algoritmos-ml-explorador?alg=gradient-boosting&tab=type) con datos en tabla; [SVM](#/articles/algoritmos-ml-explorador?alg=svm&tab=type) con muchas columnas y pocos miles de filas.
```

Los demás «(próximamente)» del artículo (redes neuronales, K-Means, Hierarchical Clustering, DBSCAN, PCA) se quedan: son de fases siguientes. La description ya dice «Los primeros ocho» desde la Task 7.

- [ ] **Step 3: Verificar**

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/pages/ArticleDetail.ml.dom.test.tsx src/data/articles/algoritmos-ml-explorador.links.test.ts`
Expected: PASS (los 8 enlaces apuntan a algoritmos disponibles y a pestañas válidas).

- [ ] **Step 4: Commit**

```bash
git add src/data/articles/algoritmos-ml-explorador.md src/pages/ArticleDetail.ml.dom.test.tsx
git commit -m "docs(article): link the phase 2 algorithms from the ML explorer guide

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Verificación completa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
node scripts/check-ml-exercises-pyodide.mjs
```
Expected: 32 archivos de test y 293 tests en verde; `tsc` sin errores; `✓` en los 8 ejercicios en CPython y en Pyodide.

Ejecuta el notebook completo de punta a punta con el Python de verificación (si `nbclient` y el kernel `mlx-venv` no están, instálalos como en la Task 20 de la fase 1):

```bash
~/.cache/mlx-venv/bin/python -c "import nbformat, nbclient; nb = nbformat.read('../notebooks/algoritmos-ml.ipynb', 4); nbclient.NotebookClient(nb, kernel_name='mlx-venv', timeout=180).execute(); print('notebook OK')"
```
Expected: `notebook OK`.

- [ ] **Step 6: Build**

Usa el skill `/portfolio-build` (tsc + vite build + actualización de hashes, con el arreglo de NTFS). Expected: build exitoso, con chunks separados `random-forest-*.js`, `gradient-boosting-*.js`, `svm-*.js` y `naive-bayes-*.js` (unos 13-15 kB cada uno). El aviso `Unexpected "-" [css-syntax-error]` del minificador de CSS ya existía antes de esta fase (viene de un comentario en otro CSS) y no lo causa este plan.

- [ ] **Step 7: Revisión en el navegador (build de producción)**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js preview
```
En `#/articles/algoritmos-ml-explorador`:
1. El menú muestra los 8 algoritmos disponibles; los 9 restantes siguen como «pronto».
2. Al pasar el mouse por «Random Forest» se descarga solo `random-forest-*.js`.
3. En las 4 OVAs nuevas, las cifras iniciales coinciden con la tabla «Cifras clave de las OVAs» de este plan.
4. Ejecuta los 4 ejercicios nuevos: cada «Tu salida» coincide con la «Salida esperada»; Gradient Boosting y SVM muestran su figura.
5. En Decision Tree › Cuándo no usarlo, «Random Forest →» y «Gradient Boosting →» ya son enlaces y llevan al algoritmo.
6. Repite a 375 px de ancho: los botones de kernel / tasa y el campo de texto de Naive Bayes caben sin desbordar.

- [ ] **Step 8: Deploy**

Usa el skill `/portfolio-deploy`. Pide confirmación al usuario antes del commit y push, como indica el skill. Sube solo `index.html`, los assets nuevos y los cambios de esta fase; no subas los cambios ajenos que ya estaban sin commit en el árbol.

Tras el push, comprueba en `https://stivenson.github.io/#/articles/algoritmos-ml-explorador?alg=svm&tab=realWorld` que el explorador carga y que «Abrir en Colab» abre `notebooks/algoritmos-ml/svm.ipynb`.

---

## Riesgos y decisiones

- **SMO lento con C grande y kernel lineal.** Con C = 100 la SVM necesita unas 100 000 iteraciones de SMO (par de máxima violación); el tope es 1 000 000 y las 10 combinaciones de la OVA tardan en total unos 60 ms en Node. El slider recalcula con `useMemo`, solo al cambiar C o el kernel.
- **Celdas del fondo.** Random Forest pinta 625 rectángulos y SVM 1 024; se recalculan solo al cambiar el modelo. Si en un móvil lento se notara, se puede bajar `CELLS` sin tocar ninguna cifra (las cifras no dependen de la cuadrícula).
- **Ejercicios algo más largos que lo que pide el spec (10-25 líneas):** 30-43 líneas, igual que los de la fase 1 (31-35). Se priorizó que cuenten la historia completa (comparar árbol y bosque con dos importancias; la curva de pérdida con figura).
- **La SVM de la OVA tiene dos controles (C y kernel)**, aunque el spec pide «un solo control principal» por OVA: el propio spec pide «slider de C; kernel lineal/RBF». Lo mismo con la tasa de aprendizaje de Gradient Boosting, que es lo que hace visible la idea de corregir «una fracción» del error.
- **Fraude con 30 % de casos.** En la vida real es menos del 1 %; el texto lo dice y explica por qué la exactitud no sirve en ese caso.
