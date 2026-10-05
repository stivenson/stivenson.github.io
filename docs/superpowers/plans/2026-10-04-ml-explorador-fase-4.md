# Explorador de algoritmos de ML — Fase 4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar la fase 4, la última, del explorador de algoritmos de ML: Neural Networks (MLP), CNN, RNN, Transformer (BERT, GPT) y Autoencoders (grupo «Redes neuronales»), cada uno con sus 8 pestañas (essential + deepDive), una OVA (la de la CNN, animada), el ejercicio de Python (NumPy puro o scikit-learn, idéntico en CPython y en Pyodide), una celda opcional de PyTorch en los notebooks de Colab, 3 ejemplos «En tu área», y el artículo, los notebooks, el build y el deploy al día. Al final, los 17 algoritmos del cheatsheet están disponibles.

**Architecture:** Se sigue la arquitectura que dejó la fase 3: un módulo `algorithms/<slug>.tsx` por algoritmo, cargado con `import()` desde `registry.ts`; los ejercicios son `.py` + `.out.txt` que leen el explorador (`?raw`), el generador de notebooks y los dos verificadores; la matemática de las OVAs vive en `ovas/ovaMath.ts` (pura, determinista, con tests) y sus datos en `ovas/datasets.ts`, con las cifras citadas fijadas en `ovas/datasets.test.ts`. Las OVAs de esta fase no sortean nada (todos sus datos son fijos), así que no necesitan `mulberry32`. La CNN anima el recorrido del filtro con `useInViewport` y `usePrefersReducedMotion` (`ovas/useMotion.ts`, de la fase 3). Las celdas de PyTorch viven en `scripts/ml-pytorch/<slug>.py`, fuera de `algorithms/python/`, para que los verificadores no las corran; el generador de notebooks las inserta después del ejercicio y atrapan el `ImportError`. El grupo «Redes neuronales» ya existe en `types.ts`, `TypeFigure.tsx` y `registry.ts` (`ENTRIES`): no hay que tocarlos.

**Tech Stack:** React 19 + TypeScript + Vite 7, KaTeX, Vitest 3 (+ jsdom en los `.dom.test.tsx`), Pyodide 0.27.7 (numpy 2.0.2, scikit-learn 1.6.1, scipy 1.14.1, matplotlib 3.8.4), Python de verificación en `~/.cache/mlx-venv`. PyTorch 2.11 (CPU) solo para verificar las celdas opcionales de Colab; no es dependencia del proyecto.

**Spec:** `docs/superpowers/specs/2026-10-03-ml-algoritmos-explorador-design.md` (sección «Fase 4: redes neuronales»). **Plan de referencia (formato):** `docs/superpowers/plans/2026-10-04-ml-explorador-fase-3.md`.

> **Todo el código de este plan ya se ejecutó** en una copia del repo (`v4`, sacada con `git archive` de `9eba571`): con él pasan los 47 archivos de test (643 tests; antes de la fase había 41 archivos y 507 tests), `tsc`, `vite build` (con salida a la carpeta de la copia, no a la raíz del repo real), los dos verificadores de ejercicios (CPython y Pyodide real) y el notebook completo de punta a punta, sin PyTorch y con PyTorch. Las cifras de los textos salen de esas ejecuciones; no las cambies a mano.

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
  - `~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py` (CPython; con `--update` regenera los `.out.txt`; los de las fases 1 a 3 salen idénticos)
  - `node scripts/check-ml-exercises-pyodide.mjs` (Pyodide real; córrelo **después** del de CPython: no tiene timeout).
- **PyTorch (solo para revisar las celdas opcionales):** el venv no lo trae. En esta máquina hay un PyTorch 2.11 de usuario en `~/.local/lib/python3.12/site-packages`; la verificación de la Task 9 lo agrega al final de `sys.path` del kernel (así numpy 2.0.2 del venv sigue ganando). Si no lo tienes, ese paso se salta: las celdas solo avisan «PyTorch no está instalado».
- **Git:** el árbol de trabajo tiene cambios ajenos sin commit (`extract_data.py`, `.claude/settings.local.json`, `calculo_diferencial/…`, etc.). **Haz `git add` solo de los archivos de cada task**, nunca `git add -A` ni `git add .`. Cada commit termina con la línea `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Redacción:** sigue `docs/redaccion/guia-facil-comprension.md` (conclusión primero, ejemplo con números antes de la fórmula, analogías de 1-2 frases o ninguna, jerga en el glosario 💡 con `<G k="…">`, títulos de papers traducidos, decir qué se midió y qué no). Los textos de este plan ya la siguen y pasan los tests de redacción: cópialos tal cual.

## Reglas heredadas de las fases 1 a 3 (de obligado cumplimiento)

Salen de los errores que hubo que corregir en las fases anteriores (enmiendas de revisión). Al revisar cada task, compruébalas una por una:

1. **Ninguna cifra sin test.** Toda cifra de un texto o de una OVA está fijada: la salida de Python en `algorithms/python/outputs.test.ts`; las de las OVAs y las de los ejemplos de la pestaña Fórmula en `ovas/datasets.test.ts` o en el `.dom.test.tsx` de la OVA. Si cambias un dato, el test te dice qué texto quedó viejo. Las pocas cifras históricas que citan los textos (AlexNet 2012, el Transformer de 2017, Baldi y Hornik 1989) no salen de una ejecución; no hay otras.
2. **Matemática de OVA determinista y contrastada.** Nada de `Math.random()`. Cada función nueva de `ovaMath.ts` se comparó con NumPy 2.0.2, scipy 1.14.1 o scikit-learn 1.6.1 sobre los mismos datos (ver «Contraste»). Los errores que en exacto valen 0 (el autoencoder con k = 6) se comparan con una tolerancia de `1e-9`: con `>` a secas, el redondeo de la máquina decidiría.
3. **Matices de scikit-learn y nada de garantías absolutas.** `MLPClassifier` usa por defecto ReLU, Adam, lotes de `min(200, n)` y `alpha=0.0001` (L2); sus pesos arrancan al azar (el ejercicio fija `random_state=0`). El teorema de aproximación universal no dice cuántas neuronas hacen falta. La «convolución» de las redes es una correlación (no voltea el filtro). La LSTM reduce el desvanecimiento, no lo elimina. El autoencoder lineal coincide con PCA en el subespacio, no en los ejes.
4. **El Transformer sin exagerar.** Se conecta con ChatGPT (un modelo tipo GPT que predice el siguiente token, ajustado para conversar) y con la traducción (el Transformer de 2017 nació para traducir), y se dice lo que no hace: no consulta una base de datos de hechos, puede alucinar, hereda sesgos, su contexto tiene un límite. El hint de su OVA no puede decir «entiende», «piensa» ni «comprende» (`ovaHints.test.ts`, Task 7), y la ficha `transformer` del glosario deja de decir que «entiende» (Task 3).
5. **OVAs accesibles.** Ninguna OVA de esta fase tiene elementos enfocables dentro del `<svg>` (todo se controla con sliders y botones fuera), así que el `<svg>` lleva `role="img"` con un `aria-label` que cambia con el estado. Los textos fijos van en el `hint` o en `children`, **nunca** dentro del readout (`role="status"`); en el readout solo hay cifras y frases que dependen del estado. Los botones de opción llevan `aria-pressed`; los sliders del MLP van en grupos con nombre (`role="group"`, «Neurona oculta 1»…).
6. **Animación responsable (CNN).** Avanza una posición cada 500 ms solo mientras la OVA se ve en pantalla (`useInViewport`); con `prefers-reduced-motion: reduce`, «Reproducir» salta al mapa completo y el CSS quita la transición del recuadro; el readout se silencia mientras reproduce (`readoutLive="off"`) y no quedan timers al desmontar.
7. **Fichas 💡.** Todo término de `REQUIRED_TERMS` (la Task 3 añade 29) lleva su ficha en cada pestaña donde aparece (`glossaryTerms.test.ts`), como máximo 3 fichas por `<p>`/`<li>` (`glossaryDensity.test.ts`), y con `{' '}` en los bordes de línea JSX (`textSpacing.test.ts`). En los strings de KaTeX, doble barra (`\\,`, `\\!`): lo vigila `render.test.ts`. Los `hint` de las OVAs los cubre `ovaHints.test.ts` (espacios y frases vetadas); aun así, léelos a mano.
8. **Ejercicios idénticos en CPython y Pyodide, en menos de 10 s.** Semillas fijas (`default_rng(<semilla>)`, `random_state=0`), cifras impresas con pocos decimales (los porcentajes del MLP con 1 decimal: BLAS distinto, misma salida; verificado), nada que dependa de la última cifra (por eso el autoencoder no imprime k = 6). Sin descargas. Ningún aviso a stderr: el navegador lo mostraría en «Tu salida» (el MLP silencia `ConvergenceWarning` a propósito y lo dice en un comentario).
9. **PyTorch solo en Colab, opcional y verificado.** PyTorch no corre en Pyodide. Cada red trae una celda `# Opcional…` con `try/except ImportError` (si no está, imprime «PyTorch no está instalado: esta celda es opcional.»). Lo que los textos dicen de esas celdas está comprobado con PyTorch 2.11: misma convolución, misma derivada (0.0242), mismos pesos de atención; el MLP de PyTorch da un acierto «parecido, no idéntico» y el texto lo dice así, sin cifra.

## Salida verificada de los 5 ejercicios

Cada `.out.txt` de abajo es byte a byte lo que imprimen `~/.cache/mlx-venv/bin/python` (CPython 3.12, numpy 2.0.2, scikit-learn 1.6.1) **y** Pyodide 0.27.7 en Node (cargando `pyodideSetup.py`, igual que el navegador): `✓` en los 17 ejercicios con `scripts/check-ml-exercises.py` y con `scripts/check-ml-exercises-pyodide.mjs`. Ninguno genera figuras. Tiempos en Pyodide/Node, cada uno en un proceso nuevo, después de cargar Pyodide y los paquetes e incluido el primer `import` de scikit-learn: 6.0 s (MLP), 0.01 s (CNN), 0.02 s (RNN), 0.01 s (Transformer), 0.85 s (Autoencoders); el límite del explorador es 15 s y el del encargo, 10 s.

**MLP** (`mlp.out.txt`):

```text
1257 imágenes para entrenar y 540 nuevas para medir

neuronas ocultas | pesos | entrenamiento | datos nuevos
               2 |   160 |         52.7% |        49.8%
               8 |   610 |         94.4% |        91.3%
              32 |  2410 |         98.8% |        97.6%

Primera imagen nueva (es un 1): 1 con 88%, 8 con 11%
```

**CNN** (`cnn.out.txt`):

```text
Filtro vertical: mapa de activación 6×6 (tras ReLU)
[[2 0 0 0 0 0]
 [2 0 1 1 0 0]
 [1 1 2 0 0 0]
 [0 2 3 0 0 0]
 [0 3 3 0 0 0]
 [0 2 2 0 0 0]]
Tras max pooling 2×2 (3×3):
[[2 1 0]
 [2 3 0]
 [3 3 0]]

Filtro horizontal: mapa de activación 6×6 (tras ReLU)
[[2 3 3 3 3 2]
 [0 0 0 0 0 0]
 [0 0 0 0 0 0]
 [0 1 1 0 0 0]
 [0 0 0 0 0 0]
 [0 0 0 0 0 0]]
Tras max pooling 2×2 (3×3):
[[3 3 3]
 [1 1 0]
 [0 0 0]]

Pesos de un filtro de 3×3: 9, los mismos en las 36 posiciones
Una capa densa de 64 píxeles a 36 salidas necesitaría 2304 pesos
```

**RNN** (`rnn.out.txt`):

```text
pasos T |  w = 0.5 |  w = 0.9 |  w = 1.0
      1 |  5.0e-01 |  5.0e-01 |  5.0e-01
      5 |  2.7e-02 |  2.7e-01 |  4.0e-01
     10 |  2.0e-04 |  2.4e-02 |  4.3e-02
     20 |  4.0e-09 |  6.2e-06 |  1.3e-05
     50 |  3.3e-22 |  5.8e-14 |  5.4e-13

Comprobación con T = 10, w = 0.9: regla de la cadena 0.0242, numérica 0.0242
```

**Transformer** (`transformer.out.txt`):

```text
«el banco del río»: cuánto atiende cada palabra (fila) a cada otra (columna)
                el    banco      del      río
       el     0.31     0.19     0.31     0.19
    banco     0.09     0.41     0.09     0.41
      del     0.31     0.19     0.31     0.19
      río     0.05     0.24     0.05     0.65
«banco» después de la atención: dinero 0.41, naturaleza 1.23

«el banco cobra interés»: cuánto atiende cada palabra (fila) a cada otra (columna)
                el    banco    cobra  interés
       el     0.35     0.22     0.22     0.22
    banco     0.08     0.35     0.21     0.35
    cobra     0.08     0.21     0.27     0.44
  interés     0.04     0.19     0.25     0.52
«banco» después de la atención: dinero 1.38, naturaleza 0.35

Con máscara causal (estilo GPT): «banco» aún no ve «río»
                el    banco      del      río
       el     1.00     0.00     0.00     0.00
    banco     0.18     0.82     0.00     0.00
      del     0.38     0.23     0.38     0.00
      río     0.05     0.24     0.05     0.65

sin codificación posicional: «banco» cambia 0.00 al invertir la frase

con codificación posicional: «banco» cambia 0.30 al invertir la frase
```

**Autoencoders** (`autoencoders.out.txt`):

```text
1000 compras normales para entrenar y 10 fraudes que el modelo nunca ve

cuello k | error normales | error fraudes | fraudes detectados
       1 |           0.32 |          2.13 |         5 de 10
       2 |           0.03 |          1.93 |        10 de 10
       4 |           0.01 |          0.89 |        10 de 10
```

Las celdas opcionales de PyTorch, ejecutadas con PyTorch 2.11 (CPU) en el notebook completo, a continuación de cada ejercicio: MLP «PyTorch, 32 neuronas ocultas: 97.0% en datos nuevos» (no se cita en ningún texto); CNN «¿PyTorch da el mismo mapa que la versión a mano? True» en los dos filtros; RNN «∂h_T/∂x_1 = 0.0242»; Transformer «¿Mismos pesos que NumPy? True» y «¿Misma salida con scaled_dot_product_attention? True»; Autoencoders «detecta 10 de 10 fraudes». Sin PyTorch, las cinco imprimen «PyTorch no está instalado: esta celda es opcional.» y el notebook termina sin error.

## Cifras clave de las OVAs (calculadas con el código de este plan)

| OVA | Situación | Cifra que muestra |
|---|---|---|
| MLP | Arranque (oculta 2 apagada) / «Ver una solución» | 15 de 20 / 20 de 20 |
| MLP | Mejor recta posible sobre los 20 puntos (búsqueda exhaustiva) | 15 de 20 |
| MLP | Peso «Salida · peso de oculta 1» en 0 desde el arranque | 10 de 20 (todo clase 0) |
| CNN | Posición 1 de 36 / posición 29 (fila 5, columna 5) | suma 2 → ReLU 2 / suma −3 → ReLU 0 |
| CNN | Filtro vertical, mapa completo | 13 de 36 casillas encendidas, máximo 3; pooling [[2 1 0] [2 3 0] [3 3 0]] |
| CNN | Filtro horizontal, mapa completo | 8 de 36; fila 1 = 2 3 3 3 3 2; pooling [[3 3 3] [1 1 0] [0 0 0]] |
| RNN | w = 0.9 con 1 / 10 / 20 / 30 pasos | x₁ influye 0.498 / 0.024 (1 en 41) / 6.2e-6 (1 en 160 000) / 2.5e-7 (1 en 4 100 000) |
| RNN | w = 0.5 con 10 pasos / w = 1.0 con 30 pasos | 2.0e-4 (1 en 4 900) / 1.5e-6 |
| RNN | Última medición, w = 0.9 y 10 pasos | 0.452 |
| Transformer | «el banco del río»: fila de «banco» y su salida | 0.09 · 0.41 · 0.09 · 0.41 → dinero 0.41, naturaleza 1.23 |
| Transformer | «el banco cobra interés» | 0.08 · 0.35 · 0.21 · 0.35 → dinero 1.38, naturaleza 0.35 |
| Transformer | Máscara causal / fila de «río» | banco 0.18 · 0.82 · 0 · 0 / río 0.05 · 0.24 · 0.05 · 0.65 |
| Transformer | Invertir la frase sin / con codificación posicional | «banco» cambia 0.00 / 0.30 |
| Autoencoder | k = 2 (inicial) | normales 0.012, fraudes 2.44, umbral 0.035, detecta 3 de 3; la más rara: el fraude 1 (error 6.39) |
| Autoencoder | k = 1 / 3 / 4 / 5 / 6 | detecta 1 / 3 / 3 / 2 / 0 de 3; con k = 1 las normales tienen error 0.37; con k = 5 los fraudes 0.08; con k = 6 todo 0 |

**Contraste con NumPy / scipy / scikit-learn** (script de verificación sobre los mismos datos): en NumPy, la mejor recta sobre `XOR_POINTS` (todas las rectas que pasan cerca de dos puntos, por los dos lados) acierta 15 de 20, y el paso hacia adelante de la red con `MLP_START` y `MLP_SOLUTION` da 15 y 20 aciertos; `scipy.signal.correlate2d(CNN_IMAGE, filtro, "valid")` con ReLU da los mismos dos mapas; la derivada por diferencias finitas de la RNN en NumPy sobre `RNN_INPUTS` da 2.433e-2 (w = 0.9, 10 pasos), 2.035e-4 (w = 0.5, 10), 6.217e-6 (0.9, 20) y 2.454e-7 (0.9, 30; la analítica da 2.462e-7, diferencia del 0.3 % por las diferencias finitas); la atención en NumPy da los mismos pesos y la misma salida (0.182, 0.818, 0.409, 1.226 para «banco»); `PCA(k).fit(AE_NORMAL)` de scikit-learn con `inverse_transform` da los mismos errores medios (0.372 / 2.575 con k = 1; 0.012 / 2.435 con k = 2…) y los mismos fraudes detectados (1, 3, 3, 3, 2, 0). `symmetricEigen` cumple A·v = λ·v con 10 decimales (test) y su autovalor mayor de [[2, 1], [1, 2]] es 3.

## Mapa de archivos

| Archivo | Acción | Task |
|---|---|---|
| `src/components/ml-explorer/ovas/ovaMath.ts` | Modificar: MLP 2-2-1, convolución/ReLU/pooling, RNN, atención, autoencoder lineal (Jacobi) | 1 |
| `src/components/ml-explorer/ovas/ovaMath.fase4.test.ts` | Crear: tests unitarios de la matemática nueva | 1 |
| `src/components/ml-explorer/ovas/datasets.ts` | Modificar: datos de las 5 OVAs | 2 |
| `src/components/ml-explorer/ovas/datasets.test.ts` | Modificar: cifras de las 5 OVAs y de los ejemplos de Fórmula | 2 |
| `src/components/ml-explorer/glossary.ts` | Modificar: 30 términos nuevos; `gradiente` y `transformer` reescritos | 3 |
| `src/components/ml-explorer/glossaryTerms.ts` | Modificar: 29 términos obligatorios nuevos; `kernel` y `gradiente` con `alsoBy` | 3 |
| `src/components/ml-explorer/algorithms/dbscan.tsx`, `pca.tsx` | Modificar: ficha en «anomalías» y «autoencoders» | 3 |
| `src/components/ml-explorer/ml-explorer.css` | Modificar: grupos de sliders del MLP, transición del filtro de la CNN | 3 |
| `src/components/ml-explorer/algorithms/python/<slug>.py` + `.out.txt` | Crear (×5) | 4-8 |
| `src/components/ml-explorer/algorithms/python/outputs.test.ts` | Modificar (×5) | 4-8 |
| `src/components/ml-explorer/ovas/<Nombre>Ova.tsx` + `.dom.test.tsx` | Crear (×5) | 4-8 |
| `src/components/ml-explorer/algorithms/<slug>.tsx` | Crear (×5) | 4-8 |
| `src/components/ml-explorer/registry.ts` + `registry.test.ts` | Modificar (×5) | 4-8 |
| `src/components/ml-explorer/MLExplorer.real.dom.test.tsx` | Modificar (×5; helper en la 4) | 4-8 |
| `scripts/ml-pytorch/<slug>.py` | Crear (×5): celda opcional de PyTorch | 4-8 |
| `scripts/build-ml-notebook.py` + `../notebooks/algoritmos-ml.ipynb` + `../notebooks/algoritmos-ml/<slug>.ipynb` | Modificar / regenerar (×5; celdas opcionales en la 4) | 4-8 |
| `src/components/ml-explorer/notebook.test.ts` | Modificar: celda opcional de PyTorch | 4 |
| `src/components/ml-explorer/render.test.ts`, `AlgorithmTabs.dom.test.tsx` | Modificar: «próximamente» pasa al registry falso | 4 |
| `src/components/ml-explorer/ovas/ovaHints.test.ts` | Modificar: frases vetadas del Transformer | 7 |
| `src/data/articles/algoritmos-ml-explorador.md` | Modificar: description en cada task (trece… diecisiete); guía y enlaces en la 9 | 4-9 |
| `src/data/articles/algoritmos-ml-explorador.links.test.ts` | Modificar: «Los diecisiete» cuando están todos | 8 |
| `src/pages/ArticleDetail.ml.dom.test.tsx` | Modificar: 17 enlaces internos | 9 |

**Orden de las tasks:** el del menú (MLP, CNN, RNN, Transformer, Autoencoders). Ningún texto cita cifras del ejercicio de otra task de esta fase, así que el orden solo importa para la description del artículo (`algoritmos-ml-explorador.links.test.ts` exige «Los primeros N ya están completos» con N en palabras: «trece» en la Task 4, «catorce», «quince», «dieciséis» y, en la 8, «Los diecisiete ya están completos») y para la lista de `registry.test.ts`.

**Los enlaces de la fase 3 no llegaron al artículo.** En `9eba571` el artículo todavía dice «K-Means, Hierarchical Clustering o DBSCAN *(próximamente)*» y «PCA … *(próximamente)*», y `ArticleDetail.ml.dom.test.tsx` espera 8 enlaces internos: el Step 2 de la Task 8 de la fase 3 no se aplicó. La Task 9 de este plan pone esos 4 enlaces junto con los 5 nuevos (17 en total).

**Alternativas que se activan solas:** Gradient Boosting → MLP (Task 4), Naive Bayes → Transformer (Task 7) y PCA → Autoencoders (Task 8) dejan de ser «(próximamente)». Las nuevas: MLP → Gradient Boosting, Logistic Regression; CNN → SVM, Transformer; RNN → Transformer, Gradient Boosting; Transformer → Naive Bayes, RNN; Autoencoders → PCA, DBSCAN. `registry.test.ts` ya verifica que toda alternativa exista.

---

### Task 1: Matemática de las OVAs de la fase 4

**Files:**
- Modify: `src/components/ml-explorer/ovas/ovaMath.ts`
- Create: `src/components/ml-explorer/ovas/ovaMath.fase4.test.ts`

Todo es puro y determinista. La red 2-2-1 usa la `sigmoid` que ya existe (fase 1). La convolución es «válida» con paso 1 y no voltea el filtro (como `F.conv2d` de PyTorch y `correlate2d` de scipy). La RNN calcula los estados y, hacia atrás, la influencia de cada entrada en la última salida (lo que retropropaga BPTT). La atención es de una cabeza con Q = K = V = X y máscara causal opcional; la codificación posicional es la sinusoidal del artículo original. El autoencoder lineal óptimo se calcula exacto: autovectores de la covarianza por el método de Jacobi (para 6×6, microsegundos) y proyección sobre los k primeros.

- [ ] **Step 1: Preparar esbuild**

```bash
test -f /tmp/esbuild-bin || (cp node_modules/@esbuild/linux-x64/bin/esbuild /tmp/esbuild-bin && chmod +x /tmp/esbuild-bin)
```

- [ ] **Step 2: Escribir los tests (fallan)**

Crea `src/components/ml-explorer/ovas/ovaMath.fase4.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  conv2d,
  fitLinearAutoencoder,
  maxPool2,
  mlpForward,
  mlpHits,
  positionalEncoding,
  reconstructionError,
  relu,
  rnnInfluence,
  rnnStates,
  selfAttention,
  softmax,
  symmetricEigen,
  type Mlp2,
} from './ovaMath';

describe('MLP 2-2-1', () => {
  it('con todos los pesos en 0, cada neurona vale 0.5', () => {
    const zero: Mlp2 = { h1: [0, 0, 0], h2: [0, 0, 0], out: [0, 0, 0] };
    expect(mlpForward(zero, { x: 3, y: -2 })).toEqual({ h: [0.5, 0.5], y: 0.5 });
  });

  it('«o» + «no-y» + «y» resuelve XOR en las cuatro esquinas', () => {
    const net: Mlp2 = { h1: [20, 20, -10], h2: [-20, -20, 30], out: [20, 20, -30] };
    const corners = [
      { x: 0, y: 0, label: 0 as const },
      { x: 0, y: 1, label: 1 as const },
      { x: 1, y: 0, label: 1 as const },
      { x: 1, y: 1, label: 0 as const },
    ];
    expect(corners.map((p) => Math.round(mlpForward(net, p).y))).toEqual([0, 1, 1, 0]);
    expect(mlpHits(net, corners)).toBe(4);
  });
});

describe('convolución, ReLU y max pooling', () => {
  it('conv2d suma los productos de la ventana, sin voltear el filtro', () => {
    const img = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    expect(conv2d(img, [[1, 0], [0, -1]])).toEqual([
      [-4, -4],
      [-4, -4],
    ]);
    expect(conv2d(img, [[0, 1], [0, 0]])).toEqual([
      [2, 3],
      [5, 6],
    ]);
  });

  it('relu deja los positivos y pone en 0 los negativos', () => {
    expect(relu([[-2, 0, 3]])).toEqual([[0, 0, 3]]);
  });

  it('maxPool2 se queda con el máximo de cada bloque de 2×2', () => {
    const m = Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => 4 * i + j + 1));
    expect(maxPool2(m)).toEqual([
      [6, 8],
      [14, 16],
    ]);
  });
});

describe('RNN de una neurona', () => {
  it('rnnStates empieza en h_0 = 0 y aplica tanh(w·h + u·x)', () => {
    const h = rnnStates([1, 0], 0.5, 2);
    expect(h[0]).toBe(0);
    expect(h[1]).toBeCloseTo(Math.tanh(2), 15);
    expect(h[2]).toBeCloseTo(Math.tanh(0.5 * Math.tanh(2)), 15);
  });

  it('rnnInfluence coincide con la derivada numérica', () => {
    const xs = [0.3, -0.8, 0.5, 0.1];
    const [w, u, eps] = [0.7, 0.9, 1e-6];
    const last = (seq: number[]) => rnnStates(seq, w, u).at(-1)!;
    const g = rnnInfluence(xs, w, u);
    xs.forEach((_, t) => {
      const moved = xs.map((v, i) => (i === t ? v + eps : v));
      expect(g[t]).toBeCloseTo((last(moved) - last(xs)) / eps, 6);
    });
  });

  it('con h = 0 todo el tiempo, cada paso hacia atrás multiplica por w', () => {
    expect(rnnInfluence([0, 0, 0], 0.5, 1)).toEqual([0.25, 0.5, 1]);
  });
});

describe('atención', () => {
  it('softmax suma 1 e ignora los −∞', () => {
    const p = softmax([0, Math.log(3)]);
    expect(p[0]).toBeCloseTo(0.25, 15);
    expect(p[1]).toBeCloseTo(0.75, 15);
    expect(softmax([1, -Infinity])).toEqual([1, 0]);
  });

  it('positionalEncoding: seno en columnas pares, coseno en impares', () => {
    const pe = positionalEncoding(2, 4);
    expect(pe[0]).toEqual([0, 1, 0, 1]);
    expect(pe[1][0]).toBeCloseTo(Math.sin(1), 15);
    expect(pe[1][1]).toBeCloseTo(Math.cos(1), 15);
    expect(pe[1][2]).toBeCloseTo(Math.sin(0.01), 15);
    expect(pe[1][3]).toBeCloseTo(Math.cos(0.01), 15);
  });

  it('selfAttention: tokens idénticos se reparten la atención; con máscara causal el primero solo se ve a sí mismo', () => {
    const X = [
      [1, 0],
      [1, 0],
    ];
    expect(selfAttention(X).weights).toEqual([
      [0.5, 0.5],
      [0.5, 0.5],
    ]);
    const causal = selfAttention([[1, 0], [0, 1], [1, 1]], true);
    expect(causal.weights[0]).toEqual([1, 0, 0]);
    expect(causal.weights[1][2]).toBe(0);
    expect(causal.out[0]).toEqual([1, 0]);
  });

  it('sin codificación posicional, cambiar el orden solo cambia el orden de la salida', () => {
    const X = [[1, 0, 0], [0, 1, 1], [0.5, 0, 2]];
    const a = selfAttention(X).out;
    const b = selfAttention([X[2], X[0], X[1]]).out;
    [0, 1, 2].forEach((c) => {
      expect(b[1][c]).toBeCloseTo(a[0][c], 14);
      expect(b[2][c]).toBeCloseTo(a[1][c], 14);
      expect(b[0][c]).toBeCloseTo(a[2][c], 14);
    });
  });
});

describe('autoencoder lineal', () => {
  it('symmetricEigen: autovalores de mayor a menor y A·v = λ·v', () => {
    const { values } = symmetricEigen([[2, 1], [1, 2]]);
    expect(values[0]).toBeCloseTo(3, 12);
    expect(values[1]).toBeCloseTo(1, 12);
    const S = [
      [4, 1, 0.5],
      [1, 3, 0.2],
      [0.5, 0.2, 1],
    ];
    const e = symmetricEigen(S);
    e.vectors.forEach((v, j) => {
      S.forEach((row, i) => expect(row.reduce((s, a, k) => s + a * v[k], 0)).toBeCloseTo(e.values[j] * v[i], 10));
    });
  });

  it('datos sobre una recta: con k = 1 se reconstruyen sin error; un punto fuera de la recta, no', () => {
    const X = [0, 1, 2, 3, 4].map((t) => [t, 2 * t, -t]);
    const ae = fitLinearAutoencoder(X, 1);
    for (const x of X) expect(reconstructionError(ae, x)).toBeCloseTo(0, 20);
    expect(reconstructionError(ae, [1, 0, 0])).toBeGreaterThan(0.1);
  });
});
```

- [ ] **Step 3: Verificar que fallan**

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/ovaMath.fase4.test.ts`
Expected: FAIL (`conv2d`, `selfAttention`, etc. no existen en `./ovaMath`).

- [ ] **Step 4: Implementar**

Añade al **final** de `src/components/ml-explorer/ovas/ovaMath.ts` (después de `dbscan`), dejando una línea en blanco antes:

```ts
// ---------- MLP de 2 capas (fase 4) ----------

/** Pesos de una neurona con dos entradas: [peso de x, peso de y, sesgo]. */
export type Neuron2 = [number, number, number];

/** Red 2-2-1: dos neuronas ocultas y una de salida, todas con sigmoide. */
export interface Mlp2 {
  h1: Neuron2;
  h2: Neuron2;
  out: Neuron2;
}

const neuron = ([w1, w2, b]: Neuron2, a: number, c: number) => sigmoid(w1 * a + w2 * c + b);

/** Paso hacia adelante: las salidas de las dos neuronas ocultas y la probabilidad final de la clase 1. */
export function mlpForward(net: Mlp2, p: Pt): { h: [number, number]; y: number } {
  const h: [number, number] = [neuron(net.h1, p.x, p.y), neuron(net.h2, p.x, p.y)];
  return { h, y: neuron(net.out, h[0], h[1]) };
}

/** Puntos bien clasificados (clase 1 si la probabilidad es ≥ 0.5). */
export function mlpHits(net: Mlp2, points: LabeledPt[]): number {
  return points.filter((p) => (mlpForward(net, p).y >= 0.5 ? 1 : 0) === p.label).length;
}

// ---------- Convolución (CNN) ----------

export type Grid = number[][];

/** Convolución «válida» con paso 1 (como en las CNN: sin voltear el filtro). Salida de (n − k + 1)². */
export function conv2d(img: Grid, kernel: Grid): Grid {
  const k = kernel.length;
  const rows = img.length - k + 1;
  const cols = img[0].length - k + 1;
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => {
      let s = 0;
      for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) s += img[i + a][j + b] * kernel[a][b];
      return s;
    }),
  );
}

/** ReLU: los negativos pasan a 0. */
export function relu(m: Grid): Grid {
  return m.map((row) => row.map((v) => Math.max(0, v)));
}

/** Max pooling de 2×2 con paso 2: el máximo de cada bloque. */
export function maxPool2(m: Grid): Grid {
  const rows = Math.floor(m.length / 2);
  const cols = Math.floor(m[0].length / 2);
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => Math.max(m[2 * i][2 * j], m[2 * i][2 * j + 1], m[2 * i + 1][2 * j], m[2 * i + 1][2 * j + 1])),
  );
}

// ---------- RNN ----------

/** Estados de una RNN de una neurona: h_0 = 0 y h_t = tanh(w·h_(t−1) + u·x_t). Devuelve h_0…h_T. */
export function rnnStates(xs: number[], w: number, u: number): number[] {
  const h = [0];
  for (const x of xs) h.push(Math.tanh(w * h[h.length - 1] + u * x));
  return h;
}

/**
 * Influencia de cada entrada en la última salida: g_t = ∂h_T/∂x_t
 * = u·(1 − h_t²) · ∏_(s = t+1…T) w·(1 − h_s²), para t = 1…T (índice 0 = x_1).
 * Es lo que la retropropagación en el tiempo lleva de vuelta a cada paso.
 */
export function rnnInfluence(xs: number[], w: number, u: number): number[] {
  const h = rnnStates(xs, w, u);
  const T = xs.length;
  const g = new Array<number>(T);
  let carry = 1;
  for (let t = T; t >= 1; t--) {
    g[t - 1] = carry * u * (1 - h[t] ** 2);
    carry *= w * (1 - h[t] ** 2);
  }
  return g;
}

// ---------- Self-attention (Transformer) ----------

export function softmax(xs: number[]): number[] {
  const m = Math.max(...xs);
  const e = xs.map((v) => (v === -Infinity ? 0 : Math.exp(v - m)));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
}

/** Codificación posicional sinusoidal: seno en las columnas pares y coseno en las impares. */
export function positionalEncoding(n: number, d: number): Grid {
  return Array.from({ length: n }, (_, pos) =>
    Array.from({ length: d }, (_, i) => {
      const angle = pos / 10000 ** ((2 * Math.floor(i / 2)) / d);
      return i % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
    }),
  );
}

export interface Attention {
  /** weights[i][j]: cuánto atiende la palabra i a la j (cada fila suma 1). */
  weights: Grid;
  /** Vector de cada palabra después de la atención: promedio de los vectores ponderado por su fila. */
  out: Grid;
}

/**
 * Self-attention de una cabeza con Q = K = V = X (sin matrices aprendidas):
 * puntajes = X·Xᵀ / √d, softmax por filas y salida = pesos · X. Con `causal`,
 * cada palabra solo ve las anteriores y a sí misma (como GPT).
 */
export function selfAttention(X: Grid, causal = false): Attention {
  const d = X[0].length;
  const weights = X.map((q, i) =>
    softmax(X.map((k, j) => (causal && j > i ? -Infinity : q.reduce((s, v, c) => s + v * k[c], 0) / Math.sqrt(d)))),
  );
  const out = weights.map((row) => X[0].map((_, c) => row.reduce((s, a, j) => s + a * X[j][c], 0)));
  return { weights, out };
}

// ---------- Autoencoder lineal (= PCA) ----------

/**
 * Autovalores y autovectores de una matriz simétrica por el método de Jacobi
 * (rotaciones hasta anular lo que está fuera de la diagonal). Devuelve los
 * autovalores de mayor a menor y, en `vectors[j]`, el autovector del j-ésimo.
 */
export function symmetricEigen(S: Grid): { values: number[]; vectors: Grid } {
  const n = S.length;
  const A = S.map((r) => [...r]);
  const V: Grid = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += A[p][q] ** 2;
    if (off < 1e-30) break;
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(A[p][q]) < 1e-300) continue;
        const theta = (A[q][q] - A[p][p]) / (2 * A[p][q]);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let k = 0; k < n; k++) {
          const akp = A[k][p];
          const akq = A[k][q];
          A[k][p] = c * akp - s * akq;
          A[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k++) {
          const apk = A[p][k];
          const aqk = A[q][k];
          A[p][k] = c * apk - s * aqk;
          A[q][k] = s * apk + c * aqk;
        }
        for (let k = 0; k < n; k++) {
          const vkp = V[k][p];
          const vkq = V[k][q];
          V[k][p] = c * vkp - s * vkq;
          V[k][q] = s * vkp + c * vkq;
        }
      }
    }
  }
  const order = A.map((_, i) => i).sort((a, b) => A[b][b] - A[a][a]);
  return { values: order.map((i) => A[i][i]), vectors: order.map((i) => V.map((r) => r[i])) };
}

export interface LinearAutoencoder {
  mean: number[];
  /** Las k direcciones del cuello de botella (filas). */
  components: Grid;
}

/**
 * Autoencoder lineal óptimo con cuello de botella k: con error cuadrático,
 * su mejor solución codifica sobre los k primeros componentes principales
 * de los datos de entrenamiento (Baldi y Hornik, 1989). Se calcula exacto,
 * sin descenso de gradiente.
 */
export function fitLinearAutoencoder(X: Grid, k: number): LinearAutoencoder {
  const n = X.length;
  const d = X[0].length;
  const mean = Array.from({ length: d }, (_, c) => X.reduce((s, r) => s + r[c], 0) / n);
  const S = Array.from({ length: d }, (_, a) =>
    Array.from({ length: d }, (_, b) => X.reduce((s, r) => s + (r[a] - mean[a]) * (r[b] - mean[b]), 0) / (n - 1)),
  );
  return { mean, components: symmetricEigen(S).vectors.slice(0, k) };
}

/** Reconstrucción de una fila: codificar (k números) y decodificar (d números). */
export function reconstruct(ae: LinearAutoencoder, x: number[]): number[] {
  const c = x.map((v, i) => v - ae.mean[i]);
  const code = ae.components.map((v) => v.reduce((s, vi, i) => s + vi * c[i], 0));
  return ae.mean.map((m, i) => m + ae.components.reduce((s, v, j) => s + code[j] * v[i], 0));
}

/** Error de reconstrucción de una fila: el promedio de las diferencias al cuadrado. */
export function reconstructionError(ae: LinearAutoencoder, x: number[]): number {
  const r = reconstruct(ae, x);
  return x.reduce((s, v, i) => s + (v - r[i]) ** 2, 0) / x.length;
}
```

`V` lleva el tipo `Grid` explícito: sin él, TypeScript infiere `(0 | 1)[][]` y `tsc` falla al asignarle senos y cosenos. No uses funciones de ES2023 (`findLastIndex`, `toSorted`…): `tsconfig.json` tiene `lib: ES2022`.

- [ ] **Step 5: Verificar que pasan**

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/ovaMath.fase4.test.ts && node node_modules/typescript/bin/tsc --noEmit -p .`
Expected: PASS (14 tests); `tsc` sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/components/ml-explorer/ovas/ovaMath.ts src/components/ml-explorer/ovas/ovaMath.fase4.test.ts
git commit -m "feat(ml-explorer): math for the neural network simulators

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Datos de las OVAs y las cifras que citan los textos

**Files:**
- Modify: `src/components/ml-explorer/ovas/datasets.ts`
- Modify: `src/components/ml-explorer/ovas/datasets.test.ts`

Los datos: 20 puntos de XOR (5 alrededor de cada esquina, con el mismo desplazamiento en las cuatro), los pesos de arranque y de la solución del MLP; el «7» de 8×8 y los dos filtros de la CNN (los mismos del ejercicio); 30 mediciones para la RNN (`np.random.default_rng(0).normal(size=30)` redondeadas a 2 decimales); los embeddings de juguete y las dos frases del Transformer (los mismos del ejercicio); 40 compras normales y 3 fraudes para el autoencoder (`default_rng(16)`, redondeados). Los tests fijan todas las cifras de la tabla «Cifras clave» y las de los ejemplos de la pestaña Fórmula.

- [ ] **Step 1: Escribir los tests (fallan)**

En `src/components/ml-explorer/ovas/datasets.test.ts`, justo después del **segundo** cierre `} from './ovaMath';` (el del import de la fase 3, que precede a las constantes de K-Means), añade estos dos imports:

```ts
import {
  AE_FRAUD,
  AE_NORMAL,
  AE_START_K,
  CNN_IMAGE,
  CNN_KERNELS,
  MLP_SOLUTION,
  MLP_START,
  RNN_INPUTS,
  RNN_START,
  RNN_U,
  TF_EMBEDDINGS,
  TF_SENTENCES,
  XOR_POINTS,
} from './datasets';
import {
  conv2d,
  fitLinearAutoencoder,
  maxPool2,
  mlpForward,
  mlpHits,
  positionalEncoding,
  reconstructionError,
  relu,
  rnnInfluence,
  selfAttention,
  sigmoid as sig,
} from './ovaMath';
```

y añade al **final** del archivo:

```ts
// ---------- Fase 4 ----------
// Cifras contrastadas con NumPy 2.0.2 / scipy 1.14.1 / scikit-learn 1.6.1 (ver el plan de la fase 4):
// la mejor recta sobre XOR_POINTS (búsqueda exhaustiva en Python) acierta 15 de 20;
// scipy.signal.correlate2d(CNN_IMAGE, filtro, "valid") da los mismos mapas; la derivada
// numérica de la RNN en NumPy da las mismas influencias (3 cifras); la atención con
// NumPy da los mismos pesos; PCA(k) de scikit-learn da los mismos errores de reconstrucción.

describe('OVA del MLP (XOR)', () => {
  it('20 puntos, 5 en cada esquina; el arranque acierta 15 y la solución 20', () => {
    expect(XOR_POINTS).toHaveLength(20);
    expect(mlpHits(MLP_START, XOR_POINTS)).toBe(15);
    expect(mlpHits(MLP_SOLUTION, XOR_POINTS)).toBe(20);
  });

  it('ninguna recta acierta más de 15 de 20 (búsqueda por todas las rectas que pasan cerca de dos puntos)', () => {
    let best = 0;
    for (const a of XOR_POINTS) {
      for (const b of XOR_POINTS) {
        if (a === b) continue;
        const n = { x: a.y - b.y, y: b.x - a.x };
        for (const off of [-1e-6, 1e-6]) {
          for (const sign of [1, -1]) {
            const hits = XOR_POINTS.filter((p) => (sign * ((p.x - a.x) * n.x + (p.y - a.y) * n.y + off) > 0 ? 1 : 0) === p.label).length;
            best = Math.max(best, hits);
          }
        }
      }
    }
    expect(best).toBe(15);
  });

  it('Fórmula: con la solución, (1, 0) da casi 1 (clase 1) y (1, 1) casi 0 (clase 0); σ(10) = 0.99995', () => {
    expect(mlpForward(MLP_SOLUTION, { x: 1, y: 0 }).y).toBeGreaterThan(0.9999);
    expect(mlpForward(MLP_SOLUTION, { x: 1, y: 1 }).y).toBeLessThan(0.0001);
    expect(sig(10).toFixed(5)).toBe('0.99995');
    expect(sig(-10).toFixed(5)).toBe('0.00005');
  });
});

describe('OVA de la CNN', () => {
  const maps = CNN_KERNELS.map((k) => relu(conv2d(CNN_IMAGE, k.kernel as unknown as number[][])));

  it('imagen 8×8 → mapa 6×6 → pooling 3×3', () => {
    expect(maps[0]).toHaveLength(6);
    expect(maps[0][0]).toHaveLength(6);
    expect(maxPool2(maps[0])).toHaveLength(3);
  });

  it('filtro vertical: los mismos números que el ejercicio de Python; 13 de 36 casillas activas, máximo 3', () => {
    expect(maps[0]).toEqual([
      [2, 0, 0, 0, 0, 0],
      [2, 0, 1, 1, 0, 0],
      [1, 1, 2, 0, 0, 0],
      [0, 2, 3, 0, 0, 0],
      [0, 3, 3, 0, 0, 0],
      [0, 2, 2, 0, 0, 0],
    ]);
    expect(maps[0].flat().filter((v) => v > 0)).toHaveLength(13);
    expect(maxPool2(maps[0])).toEqual([
      [2, 1, 0],
      [2, 3, 0],
      [3, 3, 0],
    ]);
  });

  it('filtro horizontal: se enciende en el borde de arriba de la barra (fila 1: 2 3 3 3 3 2); 8 casillas activas', () => {
    expect(maps[1][0]).toEqual([2, 3, 3, 3, 3, 2]);
    expect(maps[1].flat().filter((v) => v > 0)).toHaveLength(8);
    expect(maxPool2(maps[1])).toEqual([
      [3, 3, 3],
      [1, 1, 0],
      [0, 0, 0],
    ]);
  });

  it('Fórmula: en la primera posición el filtro vertical da 2; la casilla (fila 5, columna 4) suma −3 y ReLU la deja en 0', () => {
    const raw = conv2d(CNN_IMAGE, CNN_KERNELS[0].kernel as unknown as number[][]);
    expect(raw[0][0]).toBe(2);
    expect(raw[4][3]).toBe(-3);
    expect(maps[0][4][3]).toBe(0);
  });
});

describe('OVA de la RNN', () => {
  const first = (w: number, steps: number) => rnnInfluence(RNN_INPUTS.slice(0, steps), w, RNN_U)[0];

  it('30 mediciones; arranque w = 0.9 y 10 pasos', () => {
    expect(RNN_INPUTS).toHaveLength(30);
    expect(RNN_START).toEqual({ w: 0.9, steps: 10 });
  });

  it('w = 0.9: la influencia del primer dato cae de 0.498 (1 paso) a 0.024 (10), 6.2e-6 (20) y 2.5e-7 (30)', () => {
    expect(first(0.9, 1).toFixed(3)).toBe('0.498');
    expect(first(0.9, 10).toFixed(3)).toBe('0.024');
    expect(first(0.9, 20).toExponential(1)).toBe('6.2e-6');
    expect(first(0.9, 30).toExponential(1)).toBe('2.5e-7');
  });

  it('w = 0.5 con 10 pasos: 2.0e-4; w = 1.0 con 30 pasos: 1.5e-6 (aun con w = 1 se desvanece)', () => {
    expect(first(0.5, 10).toExponential(1)).toBe('2.0e-4');
    expect(first(1, 30).toExponential(1)).toBe('1.5e-6');
  });

  it('el último dato influye cerca de 0.5 (= u·tanh′); Fórmula: sin la pendiente de tanh quedaría 0.5 · 0.9^9 = 0.19', () => {
    const g = rnnInfluence(RNN_INPUTS.slice(0, 10), 0.9, RNN_U);
    expect(g[9].toFixed(2)).toBe('0.45');
    expect((RNN_U * 0.9 ** 9).toFixed(2)).toBe('0.19');
  });
});

describe('OVA del Transformer', () => {
  const att = (words: readonly string[], opts: { pe?: boolean; causal?: boolean } = {}) => {
    let X = words.map((w) => TF_EMBEDDINGS[w]);
    if (opts.pe) {
      const pe = positionalEncoding(X.length, X[0].length);
      X = X.map((r, i) => r.map((v, c) => v + pe[i][c]));
    }
    return selfAttention(X, opts.causal);
  };
  const row = (r: number[]) => r.map((v) => v.toFixed(2));

  it('«el banco del río»: banco atiende 0.41 a sí mismo y 0.41 a río; sale con dinero 0.41 y naturaleza 1.23', () => {
    const a = att(TF_SENTENCES[0]);
    expect(row(a.weights[1])).toEqual(['0.09', '0.41', '0.09', '0.41']);
    expect(row(a.out[1]).slice(2)).toEqual(['0.41', '1.23']);
  });

  it('«el banco cobra interés»: banco sale con dinero 1.38 y naturaleza 0.35', () => {
    const a = att(TF_SENTENCES[1]);
    expect(row(a.weights[1])).toEqual(['0.08', '0.35', '0.21', '0.35']);
    expect(row(a.out[1]).slice(2)).toEqual(['1.38', '0.35']);
  });

  it('con máscara causal, banco solo ve «el» y a sí mismo: 0.18 y 0.82', () => {
    expect(row(att(TF_SENTENCES[0], { causal: true }).weights[1])).toEqual(['0.18', '0.82', '0.00', '0.00']);
  });

  it('al invertir «el banco del río», banco cambia 0.00 sin codificación posicional y 0.30 con ella', () => {
    const rev = [...TF_SENTENCES[0]].reverse();
    const change = (pe: boolean) => {
      const a = att(TF_SENTENCES[0], { pe }).out[1];
      const b = att(rev, { pe }).out[rev.indexOf('banco')];
      return Math.max(...a.map((v, c) => Math.abs(v - b[c])));
    };
    expect(change(false).toFixed(2)).toBe('0.00');
    expect(change(true).toFixed(2)).toBe('0.30');
  });

  it('Fórmula: puntaje banco·río = 3/√4 = 1.5 y banco·el = 0', () => {
    const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0) / 2;
    expect(dot(TF_EMBEDDINGS.banco, TF_EMBEDDINGS['río'])).toBe(1.5);
    expect(dot(TF_EMBEDDINGS.banco, TF_EMBEDDINGS.el)).toBe(0);
  });
});

describe('OVA del autoencoder', () => {
  const run = (k: number) => {
    const ae = fitLinearAutoencoder(AE_NORMAL, k);
    const normal = AE_NORMAL.map((r) => reconstructionError(ae, r));
    const fraud = AE_FRAUD.map((r) => reconstructionError(ae, r));
    const threshold = Math.max(...normal);
    const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
    return { normal: mean(normal), fraud: mean(fraud), fraudErrors: fraud, threshold, detected: fraud.filter((e) => e > threshold + 1e-9).length };
  };

  it('40 normales y 3 fraudes con 6 medidas; arranca con k = 2', () => {
    expect(AE_NORMAL).toHaveLength(40);
    expect(AE_FRAUD).toHaveLength(3);
    expect(AE_NORMAL.every((r) => r.length === 6)).toBe(true);
    expect(AE_START_K).toBe(2);
  });

  it('k = 2: error medio 0.012 en normales y 2.44 en fraudes; umbral 0.035; detecta 3 de 3', () => {
    const r = run(2);
    expect(r.normal.toFixed(3)).toBe('0.012');
    expect(r.fraud.toFixed(2)).toBe('2.44');
    expect(r.threshold.toFixed(3)).toBe('0.035');
    expect(r.detected).toBe(3);
    expect(r.fraudErrors[0].toFixed(2)).toBe('6.39');
  });

  it('k = 1 detecta 1 de 3; k = 3 y 4, 3 de 3; k = 5, 2 de 3; k = 6 copia todo y no detecta ninguno', () => {
    expect([1, 2, 3, 4, 5, 6].map((k) => run(k).detected)).toEqual([1, 3, 3, 3, 2, 0]);
    expect(run(1).normal.toFixed(2)).toBe('0.37');
    expect(run(5).fraud.toFixed(2)).toBe('0.08');
    expect(run(6).fraud).toBeLessThan(1e-20);
  });
});
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/datasets.test.ts`
Expected: FAIL (`XOR_POINTS`, `CNN_IMAGE`… no existen en `./datasets`).

- [ ] **Step 2: Añadir los datos**

En `src/components/ml-explorer/ovas/datasets.ts`, la primera línea pasa a importar también `Grid` y `Mlp2`:

```ts
import type { Grid, LabeledPt, Mlp2, Pt, SliderRange } from './ovaMath';
```

y añade al **final** del archivo, dejando una línea en blanco antes:

```ts
// ---------- MLP: XOR (20 puntos, 5 alrededor de cada esquina) ----------

const XOR_JITTER: [number, number][] = [[0.05, 0.08], [-0.07, 0.03], [0.09, -0.06], [-0.04, -0.09], [0.02, -0.02]];
/** Esquinas (0, 0) y (1, 1) → clase 0; (0, 1) y (1, 0) → clase 1: ninguna recta las separa. */
export const XOR_POINTS: LabeledPt[] = ([[0, 0, 0], [1, 1, 0], [0, 1, 1], [1, 0, 1]] as const).flatMap(([cx, cy, label]) =>
  XOR_JITTER.map(([dx, dy]) => ({ x: Math.round((cx + dx) * 100) / 100, y: Math.round((cy + dy) * 100) / 100, label })),
);
export const MLP_WEIGHT: SliderRange = { min: -20, max: 20, step: 1 };
export const MLP_BIAS: SliderRange = { min: -30, max: 30, step: 1 };
/**
 * Arranque: la neurona oculta 1 traza una recta que separa (0, 0) de las demás
 * esquinas (un «o» lógico) y la salida solo la copia; la neurona 2 está apagada
 * (pesos 0, siempre vale 0.5). Acierta 15 de 20: lo máximo con una sola recta.
 */
export const MLP_START: Mlp2 = { h1: [10, 10, -5], h2: [0, 0, 0], out: [10, 0, -5] };
/** Una solución: «o» en la neurona 1, «no-y» en la 2 y «y» de las dos en la salida. */
export const MLP_SOLUTION: Mlp2 = { h1: [20, 20, -10], h2: [-20, -20, 30], out: [20, 20, -30] };

// ---------- CNN: un «7» de 8×8 y dos filtros de 3×3 ----------
// Los mismos datos que el ejercicio de Python (cnn.py).

export const CNN_IMAGE: Grid = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];
export const CNN_KERNELS = [
  { id: 'vertical', label: 'Borde vertical', kernel: [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]] },
  { id: 'horizontal', label: 'Borde horizontal', kernel: [[-1, -1, -1], [0, 0, 0], [1, 1, 1]] },
] as const satisfies readonly { id: string; label: string; kernel: Grid }[];

// ---------- RNN: 30 mediciones ----------
// np.random.default_rng(0).normal(size=30), redondeadas a 2 decimales.

export const RNN_INPUTS = [
  0.13, -0.13, 0.64, 0.1, -0.54, 0.36, 1.3, 0.95, -0.7, -1.27, -0.62, 0.04, -2.33, -0.22, -1.25,
  -0.73, -0.54, -0.32, 0.41, 1.04, -0.13, 1.37, -0.67, 0.35, 0.9, 0.09, -0.74, -0.92, -0.46, 0.22,
];
/** Peso de la entrada (fijo) y rangos de los sliders. */
export const RNN_U = 0.5;
export const RNN_W: SliderRange = { min: 0.1, max: 1, step: 0.1 };
export const RNN_STEPS: SliderRange = { min: 1, max: 30, step: 1 };
export const RNN_START = { w: 0.9, steps: 10 } as const;

// ---------- Transformer: embeddings de juguete ----------
// Los mismos que el ejercicio de Python (transformer.py): [función, cosa, dinero, naturaleza].

export const TF_DIMS = ['función', 'cosa', 'dinero', 'naturaleza'] as const;
export const TF_EMBEDDINGS: Record<string, number[]> = {
  el: [1, 0, 0, 0],
  banco: [0, 1, 1, 1],
  del: [1, 0, 0, 0],
  río: [0, 1, 0, 2],
  cobra: [0, 0.5, 1.5, 0],
  interés: [0, 1, 2, 0],
};
export const TF_SENTENCES = [
  ['el', 'banco', 'del', 'río'],
  ['el', 'banco', 'cobra', 'interés'],
] as const;

// ---------- Autoencoder: 40 compras normales y 3 fraudes, 6 medidas cada una ----------
// Las normales salen de 2 factores ocultos más ruido; los fraudes no siguen ese
// patrón. Generadas con np.random.default_rng(16) y redondeadas a 2 decimales.

export const AE_NORMAL: Grid = [
  [0.7, -0.24, -2.1, -0.94, -0.18, -1.33],
  [-0.12, -0.03, -0.43, 0.07, 0.94, -0.69],
  [-0.23, 0.32, 0.48, 0.41, 0.86, -0.02],
  [1.65, -1.63, -3.27, -2.49, -3.14, -0.12],
  [1.12, -1.06, -1.78, -1.85, -2.69, 0.51],
  [-0.01, 0, -0.26, -0.39, -0.43, -0.33],
  [-0.49, 0.33, 0.78, 0.68, 0.75, 0.14],
  [-1.54, 0.82, 2.46, 1.73, 1.38, 1.02],
  [-1.62, 1.08, 3.2, 1.99, 1.12, 1.56],
  [-1.01, 0.94, 2.06, 1.61, 2.35, -0.17],
  [0.57, -0.39, -1.77, -0.54, 0.79, -1.82],
  [1.12, -1.41, -1.71, -1.97, -3.66, 1.2],
  [0.02, 0.09, -0.53, -0.03, 1.16, -1.08],
  [-0.54, 0.5, 0.73, 1.03, 2.34, -0.92],
  [-0.24, 0.32, 0.41, 0.63, 0.62, -0.3],
  [-0.04, 0.12, -0.07, 0.03, 0.53, 0.05],
  [-0.79, 0.48, 0.85, 0.95, 1.91, -0.35],
  [0.6, -0.39, -1.65, -0.61, 1.44, -1.51],
  [-0.72, 1.22, 1.92, 1.62, 2.24, -0.23],
  [0.45, -0.24, -1.03, -0.52, -0.22, -0.78],
  [-0.78, 0.55, 1.93, 0.76, -1.42, 1.91],
  [0.87, -0.88, -1.8, -1.29, -1.95, -0.09],
  [-0.1, -0.06, 0.4, 0.28, -0.63, 0.44],
  [-0.85, 0.99, 2.04, 1.59, 1.16, 0.62],
  [-1.21, 1.27, 2.36, 2.45, 4.03, -1.04],
  [1.63, -1.09, -3.04, -1.86, -0.28, -1.81],
  [0.41, -0.48, -0.58, -0.79, -1.9, 0.76],
  [-0.8, 0.34, 1.15, 0.64, -0.35, 0.8],
  [0.48, -0.37, -1.13, -0.95, -0.74, -0.59],
  [0.05, 0.15, 0.11, 0.17, 0.5, -0.19],
  [0.37, 0.04, -1.55, -0.22, 1.91, -2.11],
  [-2.43, 1.69, 4.51, 2.99, 2.73, 1.28],
  [-0.43, 0.68, 0.58, 0.74, 2.7, -1.29],
  [-1.02, 0.53, 1.87, 1.07, 0.54, 0.74],
  [0.11, -0.25, -0.33, -0.23, -1.2, 0.39],
  [1.38, -1.22, -3.38, -2.66, -2.29, -0.44],
  [-0.82, 0.63, 0.98, 0.78, 1.71, -0.46],
  [1.44, -0.91, -2.97, -1.98, -1.53, -1.16],
  [0.1, 0.01, -0.52, 0.09, 1.35, -1.35],
  [1.61, -1.13, -4.05, -2.16, -0.64, -2.11],
];
export const AE_FRAUD: Grid = [
  [-4.93, 2.11, -0.81, -1.66, -1.01, -2.53],
  [-0.31, 1.97, 0.38, -0.6, -0.27, 0.1],
  [-0.64, -0.94, -0.03, 0.34, -0.88, 0.38],
];
export const AE_BOTTLENECK: SliderRange = { min: 1, max: 6, step: 1 };
export const AE_START_K = 2;
```

- [ ] **Step 3: Verificar**

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/datasets.test.ts src/components/ml-explorer/ovas/ovaMath.fase4.test.ts && node node_modules/typescript/bin/tsc --noEmit -p .`
Expected: PASS (los 19 tests nuevos de `datasets.test.ts` incluidos); `tsc` sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/components/ml-explorer/ovas/datasets.ts src/components/ml-explorer/ovas/datasets.test.ts
git commit -m "feat(ml-explorer): data and pinned figures for the phase 4 simulators

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Glosario, términos obligatorios, ajustes de redacción y estilos

**Files:**
- Modify: `src/components/ml-explorer/glossary.ts`
- Modify: `src/components/ml-explorer/glossaryTerms.ts`
- Modify: `src/components/ml-explorer/algorithms/dbscan.tsx`, `src/components/ml-explorer/algorithms/pca.tsx`
- Modify: `src/components/ml-explorer/ml-explorer.css`

Al añadir los términos obligatorios, dos textos de la fase 3 usan términos nuevos sin ficha: «anomalías» en DBSCAN › Pros y «autoencoders» en PCA › Supuestos (se verificó con la suite completa: son los dos únicos). `redNeuronal`, `redConvolucional`, `transformer`, `embedding`, `softmax`, `sigmoide`, `batch`, `tasaAprendizaje`, `descensoGradiente`, `gradiente`, `perdidaLog`, `pca` y `reconstruccion` ya existen y se reutilizan. Dos `alsoBy` nuevos: un `filtro` explica «kernel» (en la CNN el kernel es el filtro, no el de la SVM) y `desvanecimiento` o `retropropagacion` explican «gradiente».

- [ ] **Step 1: Glosario**

En `src/components/ml-explorer/glossary.ts`, justo antes de la línea `} satisfies Record<string, GlossaryEntry>;` (después de la entrada `grupoGlobular`), añade:

```ts
  neurona: {
    term: 'Neurona (artificial)',
    what: 'Una operación pequeña: multiplica cada entrada por un peso, suma todo más un sesgo y pasa el resultado por una función de activación.',
    why: 'Una sola neurona traza una recta (o un plano); muchas, en capas, trazan fronteras curvas.',
  },
  capaOculta: {
    term: 'Capa oculta',
    what: 'Un grupo de neuronas entre la entrada y la salida. Nadie le dice qué calcular: aprende sus propias features intermedias.',
    why: 'Sin capas ocultas, la red es un modelo lineal; con una ya puede aproximar fronteras curvas, si tiene neuronas suficientes.',
  },
  funcionActivacion: {
    term: 'Función de activación',
    what: 'La función que dobla la suma de cada neurona: sigmoide, tanh o ReLU, por ejemplo.',
    why: 'Sin ella, apilar capas daría otra vez una suma con pesos: una recta, por muchas capas que tenga la red.',
  },
  relu: {
    term: 'ReLU',
    what: 'La función de activación más usada: deja pasar los números positivos y convierte los negativos en 0.',
    why: 'Es barata de calcular y, a diferencia de la sigmoide, no aplana el gradiente cuando la suma es grande.',
  },
  retropropagacion: {
    term: 'Retropropagación (backpropagation)',
    what: 'La regla de la cadena aplicada capa por capa, de la salida hacia la entrada, para saber cuánto contribuyó cada peso al error.',
    why: 'Da el gradiente de todos los pesos en una sola pasada hacia atrás; con él, el descenso de gradiente ajusta la red.',
  },
  epoca: {
    term: 'Época',
    what: 'Una pasada completa por todos los datos de entrenamiento.',
    why: 'Las redes suelen necesitar decenas o cientos de épocas; demasiadas pueden llevar al sobreajuste.',
  },
  xor: {
    term: 'XOR (o exclusivo)',
    what: 'La regla «sí cuando una de las dos entradas está activa, pero no las dos». En un plano, sus dos clases quedan en esquinas opuestas.',
    why: 'Ninguna recta separa sus clases: es el ejemplo clásico de por qué hacen falta capas ocultas.',
  },
  convolucion: {
    term: 'Convolución',
    what: 'Deslizar un filtro pequeño (por ejemplo, de 3×3) por toda la imagen y, en cada posición, sumar los productos del filtro por los píxeles que cubre.',
    why: 'El mismo filtro detecta el mismo patrón (un borde, una esquina) en cualquier lugar de la imagen.',
  },
  filtro: {
    term: 'Filtro (kernel) de convolución',
    what: 'Una cuadrícula pequeña de pesos, como 3×3, que se desliza sobre la imagen. En una CNN sus pesos se aprenden.',
    why: 'Cada filtro se especializa en un patrón; una capa tiene decenas de filtros. No es el mismo «kernel» de la SVM.',
  },
  mapaActivacion: {
    term: 'Mapa de activación (feature map)',
    what: 'La cuadrícula de resultados de un filtro: un número por posición, alto donde la imagen se parece al patrón del filtro.',
    why: 'Las capas siguientes trabajan sobre estos mapas, no sobre los píxeles: así combinan bordes en formas y formas en objetos.',
  },
  pooling: {
    term: 'Pooling',
    what: 'Reducir un mapa resumiendo cada bloque (por ejemplo, de 2×2) con un solo número, casi siempre el máximo.',
    why: 'Achica el mapa a la mitad y hace que la red tolere que el patrón se mueva uno o dos píxeles.',
  },
  aumentoDatos: {
    term: 'Aumento de datos (data augmentation)',
    what: 'Crear ejemplos nuevos a partir de los que hay: girar, recortar, voltear o cambiar el brillo de cada imagen.',
    why: 'Con pocos datos ayuda a que la red no memorice; la etiqueta no cambia porque la foto esté un poco girada.',
  },
  transferencia: {
    term: 'Aprendizaje por transferencia (fine-tuning)',
    what: 'Partir de una red ya entrenada con millones de ejemplos y reentrenar solo un poco con tus datos.',
    why: 'Permite usar redes grandes con cientos de ejemplos en vez de millones.',
  },
  estadoOculto: {
    term: 'Estado oculto (memoria de la RNN)',
    what: 'Un vector que la RNN actualiza en cada paso de la secuencia, combinando lo que ya traía con el dato nuevo.',
    why: 'Es todo lo que la red recuerda del pasado: si una información no queda en él, se pierde.',
  },
  desvanecimiento: {
    term: 'Gradiente que se desvanece (o que explota)',
    what: 'Al retropropagar por muchos pasos, el gradiente se multiplica una y otra vez por factores: si son menores que 1 se encoge hacia 0; si son mayores, crece sin control.',
    why: 'Con un gradiente casi nulo, los primeros pasos de la secuencia no aprenden nada: la RNN olvida lo lejano.',
  },
  lstm: {
    term: 'LSTM y GRU',
    what: 'Versiones de la RNN con «compuertas» que deciden qué guardar, qué olvidar y qué dejar salir de la memoria.',
    why: 'Su memoria tiene un camino casi directo entre pasos, así que el gradiente se desvanece mucho menos.',
  },
  autosupervisado: {
    term: 'Aprendizaje autosupervisado',
    what: 'Aprender de datos sin etiquetar inventándose la tarea: tapar una palabra y adivinarla, o adivinar la palabra siguiente.',
    why: 'Permite aprovechar miles de millones de textos que nadie etiquetó; después basta ajustar con pocos ejemplos.',
  },
  token: {
    term: 'Token',
    what: 'La unidad en que se corta el texto antes de dárselo al modelo: una palabra, un trozo de palabra o un signo.',
    why: 'Los modelos de lenguaje leen y generan tokens, no letras ni palabras; su límite de texto se mide en tokens.',
  },
  atencion: {
    term: 'Atención (self-attention)',
    what: 'Para cada token, un promedio de todos los tokens de la frase, con pesos que dicen cuánto se relaciona con cada uno.',
    why: 'Así «banco» toma información de «río» o de «interés» según la frase, sin importar a cuántas palabras de distancia estén.',
  },
  codificacionPosicional: {
    term: 'Codificación posicional',
    what: 'Números que se suman al embedding de cada token según su posición en la frase (en el original, senos y cosenos).',
    why: 'La atención por sí sola no ve el orden: sin esto, «Ana llama a Luis» y «Luis llama a Ana» serían iguales para el modelo.',
  },
  mascaraCausal: {
    term: 'Máscara causal',
    what: 'Una regla que prohíbe a cada token mirar los tokens que vienen después de él.',
    why: 'Es lo que usan los modelos tipo GPT: generan texto de izquierda a derecha, así que al entrenar no pueden ver el futuro.',
  },
  bertGpt: {
    term: 'BERT y GPT',
    what: 'Dos familias de Transformer. BERT lee la frase completa en ambas direcciones y sirve para entender y clasificar texto; GPT lee de izquierda a derecha y genera texto.',
    why: 'Elegir entre ellas depende de si necesitas clasificar o buscar (BERT) o redactar y conversar (GPT).',
  },
  llm: {
    term: 'Modelo de lenguaje grande (LLM)',
    what: 'Un Transformer tipo GPT con miles de millones de pesos, entrenado para predecir el siguiente token en enormes cantidades de texto. ChatGPT es uno, ajustado además para conversar.',
    why: 'Redacta, resume y traduce con fluidez, pero no consulta una base de datos de hechos: puede inventar.',
  },
  alucinacion: {
    term: 'Alucinación',
    what: 'Una respuesta fluida y convincente que es falsa: una cita, una cifra o una referencia que no existe.',
    why: 'Pasa porque el modelo elige palabras probables, no verificadas. Hay que comprobar lo que importa.',
  },
  autoencoder: {
    term: 'Autoencoder',
    what: 'Una red que aprende a copiar su entrada pasando por un cuello de botella: un codificador comprime y un decodificador reconstruye.',
    why: 'Solo aprende a copiar bien lo que se parece a sus datos de entrenamiento y reconstruye mal lo raro: por eso sirve para detectar anomalías.',
  },
  cuelloBotella: {
    term: 'Cuello de botella (código latente)',
    what: 'La capa más estrecha del autoencoder: los pocos números con que resume cada dato.',
    why: 'Si es muy estrecho pierde información de los datos normales; si es tan ancho como la entrada, puede copiarlo todo, también lo raro.',
  },
  anomalia: {
    term: 'Detección de anomalías',
    what: 'Encontrar los datos que no se parecen a la mayoría: fraudes, fallas de una máquina, lecturas imposibles de un sensor.',
    why: 'Casi nunca hay ejemplos etiquetados de cada anomalía posible, así que se aprende cómo es lo normal y se marca lo que se aleja.',
  },
  gpu: {
    term: 'GPU',
    what: 'Una tarjeta gráfica: un procesador con miles de núcleos pequeños que hacen muchas multiplicaciones a la vez.',
    why: 'Entrenar redes grandes es sobre todo multiplicar matrices; en una GPU va decenas de veces más rápido que en el procesador.',
  },
  pytorch: {
    term: 'PyTorch y TensorFlow',
    what: 'Bibliotecas de Python para construir y entrenar redes neuronales: calculan los gradientes solas y usan la GPU.',
    why: 'Son lo que se usa en la práctica; aquí no corren en el navegador, por eso los ejercicios usan NumPy o scikit-learn.',
  },
  dropout: {
    term: 'Dropout',
    what: 'Durante el entrenamiento, apagar al azar una fracción de las neuronas en cada paso (por ejemplo, la mitad).',
    why: 'La red no puede depender de una sola neurona, y eso reduce el sobreajuste.',
  },
```

Reescribe dos entradas existentes. En `gradiente` (hoy habla solo de Gradient Boosting, y la RNN la cita para redes):

```ts
  gradiente: {
    term: 'Gradiente',
    what: 'La dirección en que más rápido sube el error si mueves la predicción (o los pesos de un modelo). Ir en sentido contrario lo baja.',
    why: 'Gradient Boosting entrena cada árbol para apuntar en esa dirección contraria (con error cuadrático, eso es el residuo); una red neuronal mueve cada peso un poco en ese sentido.',
  },
```

En `transformer` (hoy dice que «entiende»; ver Regla 4):

```ts
  transformer: {
    term: 'Transformer',
    what: 'La arquitectura de red neuronal detrás de los modelos de lenguaje actuales, como ChatGPT; procesa cada palabra en el contexto de las demás.',
    why: 'Capta negaciones y orden de las palabras mucho mejor que contar palabras, a cambio de mucho más cómputo y datos.',
  },
```

- [ ] **Step 2: Términos obligatorios**

En `src/components/ml-explorer/glossaryTerms.ts` cambia dos líneas:

```ts
  { re: 'kernels?', key: 'kernel', alsoBy: ['rbf', 'filtro'] },
```

```ts
  { re: '(?<!descenso (?:de|por) )gradientes?', key: 'gradiente', alsoBy: ['desvanecimiento', 'retropropagacion'] },
```

y al final de `REQUIRED_TERMS`, justo después de la línea

```ts
  { re: 't-SNE|UMAP', key: 'tsneUmap' },
```

añade:

```ts
  { re: 'neuronas?', key: 'neurona' },
  { re: 'capas? ocultas?', key: 'capaOculta' },
  { re: 'funci(ón|ones) de activación', key: 'funcionActivacion', alsoBy: ['relu'] },
  { re: 'ReLU', key: 'relu' },
  { re: 'retropropaga\\p{L}*|backpropagation', key: 'retropropagacion' },
  { re: 'épocas?', key: 'epoca' },
  { re: 'XOR', key: 'xor' },
  { re: 'convolución|convoluciones', key: 'convolucion' },
  { re: 'mapas? de activación|feature maps?', key: 'mapaActivacion' },
  { re: '(max )?pooling', key: 'pooling' },
  { re: 'aumento de datos|data augmentation', key: 'aumentoDatos' },
  { re: 'aprendizaje por transferencia|transfer learning|fine-tuning|ajuste fino', key: 'transferencia' },
  { re: 'estados? ocultos?', key: 'estadoOculto' },
  { re: 'desvanec\\p{L}*', key: 'desvanecimiento' },
  { re: 'LSTM|GRU', key: 'lstm' },
  { re: 'autosupervisad\\p{L}*', key: 'autosupervisado' },
  { re: 'tokens?', key: 'token' },
  { re: 'self-attention|autoatención|mapas? de atención|mecanismo de atención', key: 'atencion' },
  { re: 'codificación posicional', key: 'codificacionPosicional' },
  { re: 'máscara causal', key: 'mascaraCausal' },
  { re: 'BERT|GPT', key: 'bertGpt' },
  { re: 'LLMs?|ChatGPT|modelos? de lenguaje grandes?', key: 'llm' },
  { re: 'alucina\\p{L}*', key: 'alucinacion' },
  { re: 'autoencoders?', key: 'autoencoder' },
  { re: 'cuellos? de botella', key: 'cuelloBotella' },
  { re: 'anomalías?', key: 'anomalia' },
  { re: 'GPUs?', key: 'gpu' },
  { re: 'PyTorch|TensorFlow|Keras', key: 'pytorch' },
  { re: 'dropout', key: 'dropout' },
```

(«neuronas?» no choca con «red neuronal»: el límite de palabra lo impide. «tokens?» y «GPUs?» no aparecen en los textos de las fases 1 a 3. «filtro» no es obligatorio porque Naive Bayes habla de «filtros de spam»; el filtro de la CNN se explica con la ficha que da `alsoBy` a «kernel».)

- [ ] **Step 3: Los dos textos de la fase 3**

En `src/components/ml-explorer/algorithms/dbscan.tsx` (Pros › A fondo), reemplaza

```tsx
          Lo que marca como ruido sirve como detector de anomalías sin entrenar nada más. Los{' '}
```

por

```tsx
          Lo que marca como ruido sirve como detector de <G k="anomalia">anomalías</G> sin entrenar nada más. Los{' '}
```

y en `src/components/ml-explorer/algorithms/pca.tsx` (Supuestos › A fondo), reemplaza

```tsx
          Para estructuras curvas existen versiones no lineales: <code>KernelPCA</code>, los autoencoders (redes que
```

por

```tsx
          Para estructuras curvas existen versiones no lineales: <code>KernelPCA</code>, los <G k="autoencoder">autoencoders</G> (redes que
```

(El párrafo de PCA queda con 3 fichas: `autoencoder`, `tsneUmap` y `outlier`, el máximo.)

- [ ] **Step 4: Estilos**

Añade al final de `src/components/ml-explorer/ml-explorer.css`:

```css
/* ---------- Fase 4: redes neuronales ---------- */

/* MLP: los 3 sliders de cada neurona, juntos y con su nombre. */
.mlx-ova-controls .mlx-mlp-neuron[role='group'] {
  flex-direction: column;
  align-items: stretch;
  padding: 6px 8px;
  border: 1px solid rgba(85, 170, 255, 0.2);
  border-radius: 6px;
}

/* CNN: el filtro se desliza a la posición siguiente. */
.mlx-cnn-window {
  transition: transform 0.3s ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .mlx-cnn-window {
    transition: none;
  }
}
```

- [ ] **Step 5: Verificar**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer
node node_modules/typescript/bin/tsc --noEmit -p .
```
Expected: todo PASS (incluido `glossaryTerms.test.ts`, cuyo test «cada clave existe en el glosario» comprueba las 29 claves nuevas, y su recorrido por los 12 algoritmos disponibles); `tsc` sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/components/ml-explorer/glossary.ts src/components/ml-explorer/glossaryTerms.ts \
  src/components/ml-explorer/algorithms/dbscan.tsx src/components/ml-explorer/algorithms/pca.tsx \
  src/components/ml-explorer/ml-explorer.css
git commit -m "feat(ml-explorer): glossary and styles for the neural networks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: MLP (Neural Networks)

**Files:**
- Create: `src/components/ml-explorer/algorithms/python/mlp.py`
- Create: `src/components/ml-explorer/algorithms/python/mlp.out.txt` (generado)
- Modify: `src/components/ml-explorer/algorithms/python/outputs.test.ts`
- Create: `src/components/ml-explorer/ovas/MlpOva.tsx`
- Create: `src/components/ml-explorer/ovas/MlpOva.dom.test.tsx`
- Create: `src/components/ml-explorer/algorithms/mlp.tsx`
- Modify: `src/components/ml-explorer/registry.ts`, `src/components/ml-explorer/registry.test.ts`
- Modify: `src/components/ml-explorer/MLExplorer.real.dom.test.tsx`
- Create: `scripts/ml-pytorch/mlp.py` (celda opcional de PyTorch para Colab)
- Modify: `scripts/build-ml-notebook.py`; regenerar `../notebooks/algoritmos-ml.ipynb` y crear `../notebooks/algoritmos-ml/mlp.ipynb`
- Modify: `src/data/articles/algoritmos-ml-explorador.md` (solo la description)
- Modify: `src/components/ml-explorer/render.test.ts`, `src/components/ml-explorer/AlgorithmTabs.dom.test.tsx`, `src/components/ml-explorer/notebook.test.ts`

Historia del ejercicio: los 1 797 dígitos de 8×8 que trae scikit-learn (`load_digits`, empaquetado: funciona en Pyodide sin descargas), divididos en 1 257 para entrenar y 540 nuevos (estratificado, `random_state=0`). Entrena tres `MLPClassifier` con 2, 8 y 32 neuronas en una capa oculta, 150 épocas cada uno (`max_iter=150`, `random_state=0`), e imprime los pesos y el acierto en entrenamiento y en datos nuevos; luego, la probabilidad que la red de 32 da a la primera imagen nueva. Las redes no terminan de converger en 150 épocas: es a propósito (el tiempo en Pyodide), y el `ConvergenceWarning` se silencia en el propio código con un comentario, porque el navegador muestra stderr en «Tu salida». Los porcentajes salen con 1 decimal y coinciden byte a byte en CPython y Pyodide (BLAS distinto; verificado).

La OVA es la red 2-2-1 de XOR: 20 puntos (5 en cada esquina), 9 sliders (3 por neurona: peso de x, peso de y y sesgo; en la salida, pesos de las dos ocultas y sesgo), la región que la red asigna a cada clase pintada en una cuadrícula de 20×20 y las rectas de las dos neuronas ocultas. Arranca con la neurona oculta 2 apagada: 15 de 20, lo máximo con una sola recta. «Ver una solución» pone «o» + «no-y» + «y» (20 de 20).

Alternativas: Gradient Boosting (datos en tabla) y Logistic Regression (pocos datos, hay que explicar). Al registrar `mlp`, la alternativa «Neural Networks (MLP)» de Gradient Boosting pasa de «(próximamente)» a enlace, y `render.test.ts` (que usa `mlp` como alternativa de su módulo falso) cambia de expectativa: Step 11.

- [ ] **Step 1: Fijar las cifras del ejercicio en `outputs.test.ts` (falla)**

Añade el import junto a los otros (después de `import dbscan from './dbscan.out.txt?raw';`):

```ts
import mlp from './mlp.out.txt?raw';
```

y dentro del `describe('cifras citadas en los textos', …)`, al final (antes del `});` que lo cierra):

```ts
  it('MLP: 1257 imágenes para entrenar y 540 nuevas; 2, 8 y 32 neuronas → 49.8 %, 91.3 % y 97.6 % en datos nuevos; 2410 pesos; el 1 con 88 %', () => {
    expect(mlp).toContain('1257 imágenes para entrenar y 540 nuevas para medir');
    const rows = [...mlp.matchAll(/^\s+(\d+) \|\s+(\d+) \|\s+([\d.]+)% \|\s+([\d.]+)%$/gm)].map((m) => m.slice(1).map(Number));
    expect(rows).toEqual([
      [2, 160, 52.7, 49.8],
      [8, 610, 94.4, 91.3],
      [32, 2410, 98.8, 97.6],
    ]);
    expect(mlp).toContain('Primera imagen nueva (es un 1): 1 con 88%, 8 con 11%');
  });
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: FAIL (`mlp.out.txt` no existe).

- [ ] **Step 2: Escribir el ejercicio**

Crea `src/components/ml-explorer/algorithms/python/mlp.py`:

```python
# Dígitos escritos a mano: una red neuronal (MLP) con una capa oculta
import warnings

import numpy as np
from sklearn.datasets import load_digits
from sklearn.exceptions import ConvergenceWarning
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier

# Cada red entrena 150 épocas y para ahí, aunque podría mejorar un poco más: es a propósito.
warnings.filterwarnings("ignore", category=ConvergenceWarning)

X, y = load_digits(return_X_y=True)  # 1797 imágenes de 8×8 = 64 píxeles
X = X / 16  # cada píxel pasa de 0-16 a 0-1
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)
print(f"{len(X_tr)} imágenes para entrenar y {len(X_te)} nuevas para medir\n")

print("neuronas ocultas | pesos | entrenamiento | datos nuevos")
for n in (2, 8, 32):
    red = MLPClassifier(hidden_layer_sizes=(n,), max_iter=150, random_state=0).fit(X_tr, y_tr)
    pesos = sum(W.size + b.size for W, b in zip(red.coefs_, red.intercepts_))
    print(f"{n:16d} | {pesos:5d} | {red.score(X_tr, y_tr):13.1%} | {red.score(X_te, y_te):12.1%}")

# La red de 32 neuronas entrega una probabilidad por dígito (softmax) para cada imagen nueva
p = red.predict_proba(X_te[:1])[0]
top = np.argsort(p)[::-1][:2]
print(f"\nPrimera imagen nueva (es un {y_te[0]}): {top[0]} con {p[top[0]]:.0%}, {top[1]} con {p[top[1]]:.0%}")
```

- [ ] **Step 3: Generar y verificar la salida**

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py --update
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
git status --short src/components/ml-explorer/algorithms/python/
```
Expected: `✓` en todos los ejercicios; `git status` muestra como nuevos solo `mlp.py` y `mlp.out.txt` (los `.out.txt` anteriores se regeneran idénticos). El contenido de `mlp.out.txt` debe ser exactamente:

```text
1257 imágenes para entrenar y 540 nuevas para medir

neuronas ocultas | pesos | entrenamiento | datos nuevos
               2 |   160 |         52.7% |        49.8%
               8 |   610 |         94.4% |        91.3%
              32 |  2410 |         98.8% |        97.6%

Primera imagen nueva (es un 1): 1 con 88%, 8 con 11%
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: PASS.

- [ ] **Step 4: Test de la OVA (falla)**

Crea `src/components/ml-explorer/ovas/MlpOva.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MlpOva } from './MlpOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const slider = (name: string) => screen.getByRole('slider', { name: new RegExp(`^${name}`) });

describe('MlpOva', () => {
  it('arranca con 15 de 20 (una sola recta útil); la solución acierta 20; Restablecer vuelve a 15', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<MlpOva />);
    expect(status(container)).toContain('Aciertos: 15 de 20');
    expect(status(container)).toContain('La neurona oculta 2 no mira x ni y');
    fireEvent.click(screen.getByRole('button', { name: 'Ver una solución' }));
    expect(status(container)).toContain('Aciertos: 20 de 20');
    expect(status(container)).toContain('La red separa XOR');
    expect(slider('Oculta 2 · sesgo').getAttribute('aria-valuetext')).toBe('30');
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }));
    expect(status(container)).toContain('Aciertos: 15 de 20');
    expect(error).not.toHaveBeenCalled();
  });

  it('9 sliders, 3 por neurona; mover un peso cambia la predicción', () => {
    const { container } = render(<MlpOva />);
    expect(screen.getAllByRole('slider')).toHaveLength(9);
    expect(screen.getAllByRole('group', { name: /^Neurona/ })).toHaveLength(3);
    // Con el peso de la salida hacia la oculta 1 en 0, la salida es constante (σ(−5) < 0.5): todo es clase 0.
    fireEvent.change(slider('Salida · peso de oculta 1'), { target: { value: '0' } });
    expect(status(container)).toContain('Aciertos: 10 de 20');
  });

  it('el svg es una imagen con 20 puntos, 400 celdas y la recta de la oculta 1; el hint va fuera del readout', () => {
    const { container } = render(<MlpOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('circle')).toHaveLength(20);
    expect(svg?.querySelectorAll('rect.mlx-mlp-cell')).toHaveLength(400);
    expect(svg?.querySelectorAll('line')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Ver una solución' }));
    expect(svg?.querySelectorAll('line')).toHaveLength(2);
    const hint = screen.getByText(/ninguna recta los separa/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });
});
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/MlpOva.dom.test.tsx`
Expected: FAIL (`./MlpOva` no existe).

- [ ] **Step 5: La OVA**

Crea `src/components/ml-explorer/ovas/MlpOva.tsx`:

```tsx
import { useState } from 'react';
import { MLP_BIAS, MLP_SOLUTION, MLP_START, MLP_WEIGHT, XOR_POINTS as POINTS } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { mlpForward, mlpHits, type Mlp2, type Neuron2 } from './ovaMath';
import { createPlot } from './plot';

const PLOT = createPlot(320, 320, 20, [-0.25, 1.25], [-0.25, 1.25]);
/** Cuadrícula de 20×20 celdas para pintar la región de cada clase. */
const CELLS = 20;
const CELL = 1.5 / CELLS;

type Layer = keyof Mlp2;

const LAYERS: { id: Layer; name: string; inputs: [string, string] }[] = [
  { id: 'h1', name: 'Oculta 1', inputs: ['peso de x', 'peso de y'] },
  { id: 'h2', name: 'Oculta 2', inputs: ['peso de x', 'peso de y'] },
  { id: 'out', name: 'Salida', inputs: ['peso de oculta 1', 'peso de oculta 2'] },
];

/** Extremos visibles de la recta w1·x + w2·y + b = 0 (null si la neurona no depende de x ni de y). */
function neuronLine([w1, w2, b]: Neuron2): [number, number, number, number] | null {
  if (w1 === 0 && w2 === 0) return null;
  const [lo, hi] = [-0.25, 1.25];
  if (Math.abs(w2) >= Math.abs(w1)) return [lo, -(w1 * lo + b) / w2, hi, -(w1 * hi + b) / w2];
  return [-(w2 * lo + b) / w1, lo, -(w2 * hi + b) / w1, hi];
}

export function MlpOva() {
  const [net, setNet] = useState<Mlp2>(MLP_START);
  const hits = mlpHits(net, POINTS);
  const set = (layer: Layer, i: number, v: number) =>
    setNet((prev) => ({ ...prev, [layer]: prev[layer].map((w, j) => (j === i ? v : w)) as Neuron2 }));

  return (
    <OvaFrame
      title="Dos neuronas ocultas resuelven XOR"
      hint="Los puntos naranjas (clase 1) están en dos esquinas opuestas y los azules (clase 0) en las otras dos: ninguna recta los separa. Cada neurona oculta traza una recta (las líneas punteadas) y la neurona de salida combina las dos. Los puntos con borde rosa están mal clasificados. Al empezar, la neurona oculta 2 está apagada y la red acierta 15 de 20, lo máximo con una sola recta. Mueve los pesos de la oculta 2 y de la salida hasta acertar los 20, o pulsa «Ver una solución»."
      controls={
        <>
          {LAYERS.map((layer) => (
            <div key={layer.id} role="group" aria-label={`Neurona ${layer.name.toLowerCase()}`} className="mlx-mlp-neuron">
              <span>{layer.name}</span>
              {[0, 1, 2].map((i) => (
                <OvaSlider
                  key={i}
                  label={`${layer.name} · ${i < 2 ? layer.inputs[i] : 'sesgo'}`}
                  value={net[layer.id][i]}
                  {...(i < 2 ? MLP_WEIGHT : MLP_BIAS)}
                  onChange={(v) => set(layer.id, i, v)}
                />
              ))}
            </div>
          ))}
          <div role="group" aria-label="Pesos">
            <button type="button" onClick={() => setNet(MLP_SOLUTION)}>
              Ver una solución
            </button>
            <button type="button" onClick={() => setNet(MLP_START)}>
              Restablecer
            </button>
          </div>
        </>
      }
      readout={
        <>
          <span>
            Aciertos: <b>{hits} de {POINTS.length}</b>
          </span>
          {hits === POINTS.length && <span>La red separa XOR: cada esquina queda en su clase.</span>}
          {net.h2[0] === 0 && net.h2[1] === 0 && <span>La neurona oculta 2 no mira x ni y: vale lo mismo en todo el plano.</span>}
        </>
      }
    >
      <svg
        viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
        role="img"
        aria-label={`20 puntos de dos clases en las cuatro esquinas, la región que la red asigna a cada clase y las rectas de las neuronas ocultas; acierta ${hits} de 20`}
      >
        {Array.from({ length: CELLS * CELLS }, (_, c) => {
          const x = -0.25 + (c % CELLS) * CELL;
          const y = -0.25 + Math.floor(c / CELLS) * CELL;
          const p = mlpForward(net, { x: x + CELL / 2, y: y + CELL / 2 }).y;
          return (
            <rect
              key={c}
              className="mlx-mlp-cell"
              x={PLOT.sx(x)}
              y={PLOT.sy(y + CELL)}
              width={PLOT.sx(x + CELL) - PLOT.sx(x)}
              height={PLOT.sy(y) - PLOT.sy(y + CELL)}
              fill={p >= 0.5 ? OVA_COLORS.class1 : OVA_COLORS.class0}
              fillOpacity={0.08 + 0.22 * Math.abs(p - 0.5) * 2}
            />
          );
        })}
        {(['h1', 'h2'] as const).map((id) => {
          const l = neuronLine(net[id]);
          return (
            l && (
              <line
                key={id}
                x1={PLOT.sx(l[0])}
                y1={PLOT.sy(l[1])}
                x2={PLOT.sx(l[2])}
                y2={PLOT.sy(l[3])}
                stroke={OVA_COLORS.accent}
                strokeWidth={2}
                strokeDasharray={id === 'h1' ? '6 4' : '2 4'}
              />
            )
          );
        })}
        {POINTS.map((p, i) => {
          const wrong = (mlpForward(net, p).y >= 0.5 ? 1 : 0) !== p.label;
          return (
            <circle
              key={i}
              cx={PLOT.sx(p.x)}
              cy={PLOT.sy(p.y)}
              r={6}
              fill={p.label ? OVA_COLORS.class1 : OVA_COLORS.class0}
              stroke={wrong ? OVA_COLORS.risk : '#040320'}
              strokeWidth={wrong ? 3 : 1.5}
            />
          );
        })}
        <text x={PLOT.sx(1.25)} y={PLOT.height - 4} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
          x →
        </text>
        <text x={PLOT.sx(-0.25)} y={14} fontSize={11} fill={OVA_COLORS.axis}>
          ↑ y
        </text>
      </svg>
    </OvaFrame>
  );
}
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/MlpOva.dom.test.tsx`
Expected: PASS.

- [ ] **Step 6: El módulo del algoritmo**

Crea `src/components/ml-explorer/algorithms/mlp.tsx` (los textos ya pasan los tests de redacción: cópialos tal cual):

```tsx
import { G } from '../Gloss';
import { Tex } from '../Tex';
import { MlpOva } from '../ovas/MlpOva';
import type { AlgorithmModule } from '../types';
import code from './python/mlp.py?raw';
import expectedOutput from './python/mlp.out.txt?raw';

const mlp: AlgorithmModule = {
  slug: 'mlp',
  row: {
    type: 'Supervisado',
    bestUse: 'Problemas complejos y no lineales',
    formula: 'Capas de neuronas con pesos y funciones de activación',
    assumptions: 'Muchos datos de entrenamiento',
    pros: 'Modela relaciones complejas',
    cons: 'Necesita muchos datos y es una caja negra',
    whenNot: 'Con pocos datos o si hay que explicar cada decisión',
    realWorld: 'Reconocimiento de imágenes y de voz',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>
              <G k="supervisado">Supervisado</G>:
            </b>{' '}
            aprende de ejemplos que ya traen la respuesta, como la regresión logística. La diferencia es que entre la
            entrada y la salida pone <b>capas de neuronas</b> que aprenden sus propias{' '}
            <G k="feature">features</G> intermedias.
          </p>
          <p>
            Es la <G k="redNeuronal">red neuronal</G> más básica: el perceptrón multicapa (MLP, por{' '}
            <i>Multi-Layer Perceptron</i>). Cada <G k="neurona">neurona</G> hace una suma con pesos y la dobla con una{' '}
            <G k="funcionActivacion">función de activación</G>.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Sirve para clasificar (con <G k="softmax">softmax</G> en la salida da una probabilidad por clase) y para
          predecir números (con una salida sin función de activación). Las CNN, las RNN y los{' '}
          <G k="transformer">Transformers</G> son variantes que cambian cómo se conectan las neuronas, no la idea.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo cuando la relación entre la entrada y la respuesta es <b>curva y enredada</b>, hay muchos ejemplos y
            no necesitas explicar cada decisión.
          </p>
          <ul>
            <li>Reconocer dígitos o letras escritas a mano.</li>
            <li>Predecir el consumo de una planta a partir de decenas de sensores.</li>
            <li>
              Como capa final de modelos más grandes, sobre <G k="feature">features</G> que ya extrajo otra red.
            </li>
          </ul>
          <p className="mlx-rule">
            Con datos en tabla, compáralo siempre con un <G k="ensamble">ensamble</G> de árboles: muchas veces el
            ensamble gana.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Con <G k="tabular">datos tabulares</G> de miles de filas, Gradient Boosting suele igualar o superar a un MLP con mucho menos ajuste. El MLP brilla cuando las features son señales crudas y numerosas
          (píxeles, audio) o cuando se combina con otras redes.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> una <G k="neurona">neurona</G> con pesos 20 y 20 y sesgo −10 recibe el punto (1, 0). Suma
            20·1 + 20·0 − 10 = 10, y la <G k="sigmoide">sigmoide</G> convierte ese 10 en 0.99995: casi 1. En (0, 0)
            sumaría −10 y daría 0.00005: casi 0.
          </p>
          <p>
            Una sola neurona traza una recta y no puede separar <G k="xor">XOR</G>. Con dos neuronas en la{' '}
            <G k="capaOculta">capa oculta</G> sí: una se enciende en «al menos una entrada activa», otra en «no las dos»,
            y la salida pide ambas. Así (1, 0) da casi 1 y (1, 1), casi 0.
          </p>
          <Tex block>{'h = \\sigma(W_1 x + b_1), \\qquad \\hat{y} = \\sigma(W_2 h + b_2)'}</Tex>
          <p>
            <Tex>{'x'}</Tex> es la entrada, <Tex>{'h'}</Tex> la salida de la capa oculta y <Tex>{'\\hat{y}'}</Tex> la
            predicción. Las matrices <Tex>{'W'}</Tex> y los vectores <Tex>{'b'}</Tex> son los pesos que se aprenden;{' '}
            <Tex>{'\\sigma'}</Tex> es la <G k="funcionActivacion">función de activación</G>.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Se entrena con <G k="descensoGradiente">descenso de gradiente</G>: la{' '}
            <G k="retropropagacion">retropropagación</G> calcula cuánto contribuyó cada peso al error (la{' '}
            <G k="perdidaLog">pérdida logarítmica</G>, al clasificar) y cada peso se mueve un poco en contra.
          </p>
          <p>
            scikit-learn usa por defecto <G k="relu">ReLU</G> en las capas ocultas, el optimizador Adam,{' '}
            <G k="batch">lotes</G> de 200 filas y una penalización <G k="regularizacionL1L2">L2</G> pequeña (
            <code>alpha=0.0001</code>).
          </p>
          <p>
            Los <G k="hiperparametro">hiperparámetros</G> que más importan son el número de capas y de neuronas, la{' '}
            <G k="tasaAprendizaje">tasa de aprendizaje</G> y cuántas <G k="epoca">épocas</G> entrenar.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que hay <b>muchos datos</b>: tiene muchos pesos que ajustar. En el ejercicio, la red de 32{' '}
            <G k="neurona">neuronas</G> tiene 2 410 pesos para 1 257 imágenes de entrenamiento. Con pocos datos,
            memoriza (<G k="overfitting">sobreajuste</G>).
          </p>
          <p>
            También supone <b><G k="feature">features</G> en escalas parecidas</b>: con una feature de 0 a 1 y otra de 0 a 100 000, el
            entrenamiento avanza a saltos. Por eso el ejercicio divide los píxeles entre 16.
          </p>
        </>
      ),
      deepDive: (
        <p>
          El teorema de aproximación universal dice que una <G k="capaOculta">capa oculta</G> con neuronas suficientes
          puede aproximar cualquier función continua. No dice cuántas neuronas hacen falta ni que el entrenamiento las
          encuentre. Para <G k="escalado">estandarizar</G> se usa <code>StandardScaler</code>, ajustado solo con los
          datos de entrenamiento.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Fronteras de cualquier forma:</b> con <G k="capaOculta">capas ocultas</G> resuelve problemas como{' '}
            <G k="xor">XOR</G>, que ningún modelo lineal resuelve.
          </li>
          <li>
            <b>
              Aprende sus propias <G k="feature">features</G>:
            </b> en el ejercicio, la red de 32 <G k="neurona">neuronas</G> acierta el 97.6 % de los
            dígitos nuevos a partir de los píxeles crudos.
          </li>
          <li>
            <b>Escala con los datos:</b> con más ejemplos y más neuronas sigue mejorando, donde otros modelos se
            estancan.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          La misma maquinaria (capas, <G k="retropropagacion">retropropagación</G>, descenso por{' '}
          <G k="batch">lotes</G>) sirve para
          imágenes, texto y audio, y corre rápido en una <G k="gpu">GPU</G>. Con 2 neuronas ocultas la red del ejercicio
          solo acierta el 49.8 % en datos nuevos; con 8, el 91.3 %: el tamaño de la capa importa mucho.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Caja negra:</b> 2 410 pesos no se leen uno por uno. No sabes por qué decidió lo que decidió.
          </li>
          <li>
            <b>Muchas perillas:</b> capas, <G k="neurona">neuronas</G>,{' '}
            <G k="tasaAprendizaje">tasa de aprendizaje</G>, <G k="epoca">épocas</G>, regularización. Una mala elección y no aprende o memoriza.
          </li>
          <li>
            <b>Resultados que varían:</b> los pesos arrancan al azar; con otra semilla, el acierto cambia un poco.
            El ejercicio fija <code>random_state=0</code>.
          </li>
        </ul>
      ),
      deepDive: (
        <>
          <p>
            Contra el <G k="overfitting">sobreajuste</G>: más datos, <G k="regularizacionL1L2">regularización L2</G>,{' '}
            <G k="dropout">dropout</G> o parar cuando el error en validación deja de bajar (
            <code>early_stopping=True</code>).
          </p>
          <p>
            Para explicar predicciones existen técnicas como <G k="shap">SHAP</G>, pero son aproximadas.
          </p>
        </>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses con pocos datos ni cuando cada decisión se debe justificar.</p>
          <p>
            Ejemplo: aprobar créditos con 500 clientes y 10 columnas. Una regresión logística o un árbol poco profundo
            aciertan parecido, entrenan en segundos y explican cada rechazo. Con miles de filas en tabla, prueba antes
            Gradient Boosting.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Tampoco es la mejor red para imágenes grandes (usa una <G k="redConvolucional">red convolucional</G>) ni para
          texto o secuencias largas (usa un <G k="transformer">Transformer</G>): el MLP trata cada entrada por separado y
          no aprovecha qué píxeles son vecinos ni el orden de las palabras.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Reconocimiento de dígitos.</b> Una de las primeras aplicaciones comerciales de las{' '}
            <G k="redNeuronal">redes neuronales</G> fue leer códigos postales y cheques escritos a mano, en los años 90.
            Aquellas redes ya eran convolucionales, pero la idea de capas que aprenden es la misma.
          </p>
          <p>
            El ejercicio entrena un MLP con 1 257 de los 1 797 dígitos de 8×8 que trae scikit-learn y lo prueba con los
            540 restantes. Con 2 <G k="neurona">neuronas</G> ocultas acierta el 49.8 %; con 8, el 91.3 %; con 32, el
            97.6 %. La red de 32 da una probabilidad por dígito: a la primera imagen nueva, un 1, le da 88 %.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            En producción las redes se entrenan con <G k="pytorch">PyTorch o TensorFlow</G>, en{' '}
            <G k="gpu">GPU</G> y por <G k="batch">lotes</G>. El notebook de Colab trae, como celda opcional, una red
            equivalente en PyTorch: su acierto es parecido, no idéntico, porque cambia el sorteo de los pesos.
          </p>
          <p>
            El ejercicio entrena 150 <G k="epoca">épocas</G> y para ahí a propósito, para que corra en segundos en el
            navegador. Con más épocas las tres redes mejoran algo, pero el orden no cambia.
          </p>
        </>
      ),
    },
  },
  Ova: MlpOva,
  python: { code, expectedOutput, colabNotebook: 'mlp' },
  inYourField: [
    { area: 'Eléctrica', example: 'estimar la demanda de la próxima hora a partir de decenas de lecturas de la red y del clima.' },
    { area: 'Mecánica', example: 'predecir el desgaste de una herramienta de corte con las señales de vibración y corriente del motor.' },
    { area: 'Química', example: 'predecir una propiedad de una mezcla a partir de su composición y las condiciones del proceso.' },
  ],
  alternatives: ['gradient-boosting', 'logistic-regression'],
};

export default mlp;
```

- [ ] **Step 7: Registrar el loader**

En `registry.ts`, dentro de `LOADERS`, justo después de

```ts
  pca: () => import('./algorithms/pca'),
```

añade:

```ts
  mlp: () => import('./algorithms/mlp'),
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
      'mlp',
    ]);
```

- [ ] **Step 8: Recorrido con el módulo real**

Añade al final de `src/components/ml-explorer/MLExplorer.real.dom.test.tsx` un helper que las cinco tasks de esta fase reutilizan, y el test del MLP:

```tsx
/** Recorre las 8 pestañas de un algoritmo real; en Fórmula comprueba la OVA (svg role="img"), su lectura y KaTeX. */
async function tourRealAlgorithm(slug: string, heading: string, readout: string) {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={[`/articles/x?alg=${slug}`]}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: heading })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'formula') {
      expect(container.querySelector('.mlx-tabpanel svg[role="img"]')).not.toBeNull();
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent?.replace(/\s+/g, ' ')).toContain(readout);
      expect(container.querySelector('.katex')).not.toBeNull();
    }
  }

  expect(error).not.toHaveBeenCalled();
}

it('MLP real (?alg=mlp): recorre las 8 pestañas sin errores', async () => {
  await tourRealAlgorithm('mlp', 'Neural Networks (MLP)', 'Aciertos: 15 de 20');
});
```

- [ ] **Step 9: Notebook de Colab y su celda opcional de PyTorch**

Primero, la infraestructura de las celdas opcionales en `scripts/build-ml-notebook.py`. En el docstring, después del párrafo que termina en «No borra notebooks de algoritmos que no estén en la lista.», añade:

```python
Las redes neuronales (fase 4) llevan además una celda opcional con PyTorch
(scripts/ml-pytorch/<slug>.py), justo después del ejercicio. Esa celda no
falla si PyTorch no está instalado: lo atrapa con try/except ImportError.
```

Después de `OUT_DIR = SPA.parent / "notebooks/algoritmos-ml"` añade:

```python
PYTORCH_DIR = SPA / "scripts/ml-pytorch"
```

Justo después del cierre de la lista `ALGORITHMS` (la línea `]`), añade:

```python
PYTORCH_NOTE = (
    "**Opcional: con PyTorch.** La celda siguiente hace lo mismo con PyTorch, la biblioteca que se usa en la práctica. "
    "Colab ya lo trae instalado; si no está, la celda solo avisa y no falla. Ejecuta antes la celda del ejercicio."
)
```

Antes de `def wrap(cells: list[dict]) -> dict:` añade:

```python
def pytorch_cells(slug: str) -> list[dict]:
    """Nota y celda opcional de PyTorch, si el algoritmo la tiene."""
    path = PYTORCH_DIR / f"{slug}.py"
    if not path.exists():
        return []
    return [
        markdown(PYTORCH_NOTE, f"{slug}-pytorch-nota"),
        code(path.read_text(encoding="utf-8").rstrip("\n"), f"{slug}-pytorch"),
    ]
```

En `main()`, después de la línea que agrega la celda del ejercicio al notebook completo (`cells.append(code((PY_DIR / f"{slug}.py")…, f"{slug}-codigo"))`), añade:

```python
        cells.extend(pytorch_cells(slug))
```

y en la lista `single` del notebook individual, después de `code(source, f"{slug}-codigo"),`, añade:

```python
            *pytorch_cells(slug),
```

Luego, en `ALGORITHMS`, después de la tupla de `"pca"`:

```python
    (
        "mlp",
        "Neural Networks, MLP (perceptrón multicapa)",
        "Dígitos escritos a mano: cuánto acierta una red según el número de neuronas ocultas.",
    ),
```

Crea `scripts/ml-pytorch/mlp.py` (no lo leen los verificadores: no está en `algorithms/python/`):

```python
# Opcional: una red equivalente en PyTorch (Colab ya lo trae instalado; en el navegador no corre).
# El acierto será parecido al de scikit-learn, no idéntico: cambian el sorteo de los pesos y el orden de los lotes.
try:
    import torch
    from torch import nn
except ImportError:
    print("PyTorch no está instalado: esta celda es opcional.")
else:
    torch.manual_seed(0)
    Xt, Xv = torch.tensor(X_tr, dtype=torch.float32), torch.tensor(X_te, dtype=torch.float32)
    yt, yv = torch.tensor(y_tr), torch.tensor(y_te)
    red_pt = nn.Sequential(nn.Linear(64, 32), nn.ReLU(), nn.Linear(32, 10))
    opt = torch.optim.Adam(red_pt.parameters(), lr=0.001)
    for epoca in range(150):
        orden = torch.randperm(len(Xt))
        for i in range(0, len(Xt), 200):  # lotes de 200 filas, como scikit-learn
            lote = orden[i:i + 200]
            opt.zero_grad()
            perdida = nn.functional.cross_entropy(red_pt(Xt[lote]), yt[lote])
            perdida.backward()
            opt.step()
    acierto = (red_pt(Xv).argmax(dim=1) == yv).float().mean().item()
    print(f"PyTorch, 32 neuronas ocultas: {acierto:.1%} en datos nuevos")
```

```bash
python3 scripts/build-ml-notebook.py
```
Expected: `Escrito notebooks/algoritmos-ml.ipynb y 13 notebooks individuales`.

En `src/components/ml-explorer/notebook.test.ts`, el test de los notebooks individuales admite la celda opcional. Reemplaza

```ts
    const codeCells = nb.cells.filter((c) => c.cell_type === 'code');
    expect(codeCells).toHaveLength(1);
```
por

```ts
    // Una sola celda del ejercicio; las redes neuronales llevan además una opcional de PyTorch.
    const codeCells = nb.cells.filter((c) => c.cell_type === 'code' && c.id !== `${slug}-pytorch`);
    expect(codeCells).toHaveLength(1);
```

y justo antes de `describe('notebooks individuales de Colab', () => {` añade:

```ts
/** Las redes neuronales ya disponibles: cada una lleva una celda opcional de PyTorch. */
const NEURAL = ['mlp', 'cnn', 'rnn', 'transformer', 'autoencoders'].filter((s) => AVAILABLE_SLUGS.includes(s));

describe('celdas opcionales de PyTorch (fase 4)', () => {
  it.each(NEURAL)('%s: va justo después del ejercicio, en ambos notebooks, y no falla sin PyTorch', (slug) => {
    const raw = singleFiles[`../../../../notebooks/algoritmos-ml/${slug}.ipynb`];
    const single = (JSON.parse(raw) as { cells: Cell[] }).cells;
    for (const list of [cells, single]) {
      const i = list.findIndex((c) => c.id === `${slug}-codigo`);
      expect(list[i + 1]?.id).toBe(`${slug}-pytorch-nota`);
      const opt = list[i + 2];
      expect(opt?.id).toBe(`${slug}-pytorch`);
      expect(opt.cell_type).toBe('code');
      const src = opt.source.join('');
      expect(src.startsWith('# Opcional')).toBe(true);
      expect(src).toContain('except ImportError:');
    }
  });

  it('solo las redes neuronales tienen celda de PyTorch', () => {
    const withTorch = cells.filter((c) => c.id.endsWith('-pytorch')).map((c) => c.id.replace(/-pytorch$/, ''));
    expect(withTorch).toEqual(NEURAL);
  });
});
```

`NEURAL` se filtra por `AVAILABLE_SLUGS`: cada task de esta fase agrega su red sin tocar el test.

- [ ] **Step 10: Description del artículo**

En `src/data/articles/algoritmos-ml-explorador.md`, en la línea `description:`, cambia «Los primeros doce ya están completos» por «Los primeros trece ya están completos» (lo exige `algoritmos-ml-explorador.links.test.ts`).

- [ ] **Step 11: «Próximamente» se prueba con el registry falso**

`render.test.ts` usa `['knn', 'mlp']` como alternativas de su módulo falso y esperaba «Neural Networks (MLP) (próximamente)». Ahora el MLP está disponible. En `src/components/ml-explorer/render.test.ts` reemplaza

```ts
      expect(html).toContain('Neural Networks (MLP) (próximamente)');
```
por

```ts
      expect(html).toContain('Neural Networks (MLP) →');
```

Al terminar la fase no quedará ningún algoritmo real «pronto», así que el caso deshabilitado pasa al registry falso (`testRegistry.tsx`, donde «gamma» sigue «pronto»). Añade al final de `src/components/ml-explorer/AlgorithmTabs.dom.test.tsx`:

```tsx
describe('AlgorithmTabs: alternativas aún no disponibles', () => {
  // Desde la fase 4 los 17 algoritmos reales están disponibles: «próximamente» se prueba con el registry falso.
  it('una alternativa «pronto» sale deshabilitada y con «(próximamente)»; una disponible lleva «→»', () => {
    const onAlg = vi.fn();
    const mod = { ...fakeModule('alpha'), alternatives: ['beta', 'gamma'] };
    render(<AlgorithmTabs module={mod} meta={getMeta('alpha')} tab="whenNot" onTab={() => {}} onAlg={onAlg} onGoAlg={() => {}} consumeReveal={() => false} />);
    const soon = screen.getByRole('button', { name: 'G Gamma (próximamente)' }) as HTMLButtonElement;
    expect(soon.disabled).toBe(true);
    const ready = screen.getByRole('button', { name: 'B Beta →' }) as HTMLButtonElement;
    expect(ready.disabled).toBe(false);
    fireEvent.click(ready);
    expect(onAlg).toHaveBeenCalledWith('beta');
  });
});
```

(El archivo ya importa `fakeModule` y `getMeta` de `./testRegistry`, `vi`, `fireEvent` y `screen`.)

- [ ] **Step 12: Verificación completa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
node scripts/check-ml-exercises-pyodide.mjs
```
Expected: todos los tests pasan (incluidos `registry.test.ts`, que comprueba que las alternativas de `mlp` existen; `notebook.test.ts`, que compara los notebooks con el `.py` y revisa la celda opcional de PyTorch; `glossaryTerms.test.ts`, `glossaryDensity.test.ts`, `textSpacing.test.ts`, `render.test.ts` y `ovaHints.test.ts` sobre los textos nuevos; y `algoritmos-ml-explorador.links.test.ts`); `tsc` sin errores; `✓ mlp.py (Pyodide)` y los demás también.

Revisión manual con el servidor de desarrollo (`ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js`), en `#/articles/algoritmos-ml-explorador?alg=mlp&tab=formula`: la OVA responde al teclado (Tab hasta los controles, flechas en los sliders, Enter/Espacio en los botones), las cifras iniciales coinciden con la tabla «Cifras clave», las fichas 💡 abren, y en «Ejemplo real» «▶ Ejecutar» da la misma salida que la esperada.

- [ ] **Step 13: Commit**

```bash
git add src/components/ml-explorer/algorithms/python/mlp.py \
  src/components/ml-explorer/algorithms/python/mlp.out.txt \
  src/components/ml-explorer/algorithms/python/outputs.test.ts \
  src/components/ml-explorer/ovas/MlpOva.tsx \
  src/components/ml-explorer/ovas/MlpOva.dom.test.tsx \
  src/components/ml-explorer/algorithms/mlp.tsx \
  src/components/ml-explorer/registry.ts \
  src/components/ml-explorer/registry.test.ts \
  src/components/ml-explorer/MLExplorer.real.dom.test.tsx \
  scripts/build-ml-notebook.py \
  scripts/ml-pytorch/mlp.py \
  ../notebooks/algoritmos-ml.ipynb \
  ../notebooks/algoritmos-ml/mlp.ipynb \
  src/data/articles/algoritmos-ml-explorador.md \
  src/components/ml-explorer/render.test.ts \
  src/components/ml-explorer/AlgorithmTabs.dom.test.tsx \
  src/components/ml-explorer/notebook.test.ts
git commit -m "feat(ml-explorer): add the MLP with its XOR simulator and exercise

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: CNN

**Files:**
- Create: `src/components/ml-explorer/algorithms/python/cnn.py`
- Create: `src/components/ml-explorer/algorithms/python/cnn.out.txt` (generado)
- Modify: `src/components/ml-explorer/algorithms/python/outputs.test.ts`
- Create: `src/components/ml-explorer/ovas/CnnOva.tsx`
- Create: `src/components/ml-explorer/ovas/CnnOva.dom.test.tsx`
- Create: `src/components/ml-explorer/algorithms/cnn.tsx`
- Modify: `src/components/ml-explorer/registry.ts`, `src/components/ml-explorer/registry.test.ts`
- Modify: `src/components/ml-explorer/MLExplorer.real.dom.test.tsx`
- Create: `scripts/ml-pytorch/cnn.py` (celda opcional de PyTorch para Colab)
- Modify: `scripts/build-ml-notebook.py`; regenerar `../notebooks/algoritmos-ml.ipynb` y crear `../notebooks/algoritmos-ml/cnn.ipynb`
- Modify: `src/data/articles/algoritmos-ml-explorador.md` (solo la description)

Historia del ejercicio: NumPy puro. Un «7» de 8×8 (1 = tinta) y dos filtros de 3×3 (borde vertical y borde horizontal). La convolución «válida» con paso 1 está escrita con dos bucles; luego ReLU y un max pooling de 2×2 con `reshape`. Imprime los dos mapas de 6×6 y los dos de 3×3, y compara 9 pesos de un filtro contra los 2 304 de una capa densa de 64 a 36. Todo es aritmética entera: idéntico en cualquier entorno.

La OVA usa la misma imagen y los mismos filtros: el recuadro del filtro recorre las 36 posiciones (botones «Paso ▸», «▶ Reproducir»/«⏸ Pausar», «Restablecer»; un paso cada 500 ms) y llena el mapa de activación; al final muestra el pooling de 3×3. La animación usa `useInViewport` y `usePrefersReducedMotion` (fase 3): se pausa fuera de pantalla y, con «reducir movimiento», «Reproducir» salta al mapa completo. El readout se silencia (`aria-live="off"`) mientras reproduce.

Alternativas: SVM (imágenes pequeñas y simples, como los dígitos de 8×8) y Transformer (Vision Transformers con muchísimos datos).

- [ ] **Step 1: Fijar las cifras del ejercicio en `outputs.test.ts` (falla)**

Añade el import junto a los otros (después de `import mlp from './mlp.out.txt?raw';`):

```ts
import cnn from './cnn.out.txt?raw';
```

y dentro del `describe('cifras citadas en los textos', …)`, al final (antes del `});` que lo cierra):

```ts
  it('CNN: el vertical se enciende en el borde izquierdo (máximo 3); el horizontal, arriba de la barra (2 3 3 3 3 2); 9 pesos contra 2304', () => {
    expect(cnn).toContain('[[2 0 0 0 0 0]\n [2 0 1 1 0 0]\n [1 1 2 0 0 0]\n [0 2 3 0 0 0]\n [0 3 3 0 0 0]\n [0 2 2 0 0 0]]');
    expect(cnn).toContain('[[2 3 3 3 3 2]');
    expect(cnn).toContain('[[3 3 3]\n [1 1 0]\n [0 0 0]]');
    expect(cnn.match(/Tras max pooling 2×2 \(3×3\)/g)).toHaveLength(2);
    expect(cnn).toContain('Pesos de un filtro de 3×3: 9, los mismos en las 36 posiciones');
    expect(cnn).toContain('Una capa densa de 64 píxeles a 36 salidas necesitaría 2304 pesos');
  });
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: FAIL (`cnn.out.txt` no existe).

- [ ] **Step 2: Escribir el ejercicio**

Crea `src/components/ml-explorer/algorithms/python/cnn.py`:

```python
# Detector de bordes: una convolución y un pooling hechos a mano con NumPy
import numpy as np

# Un «7» de 8×8 píxeles: 1 = tinta, 0 = fondo
imagen = np.array([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
])

# Dos filtros (kernels) de 3×3: uno busca bordes verticales y otro horizontales
filtros = {
    "vertical": np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]]),
    "horizontal": np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]]),
}


def convolucion(img, k):
    """Desliza el filtro por la imagen y suma los productos en cada posición."""
    alto, ancho = img.shape[0] - 2, img.shape[1] - 2
    salida = np.zeros((alto, ancho), dtype=int)
    for i in range(alto):
        for j in range(ancho):
            salida[i, j] = np.sum(img[i:i + 3, j:j + 3] * k)
    return salida


def max_pooling(mapa):
    """Se queda con el máximo de cada bloque de 2×2: el mapa se reduce a la mitad."""
    alto, ancho = mapa.shape[0] // 2, mapa.shape[1] // 2
    return mapa[:alto * 2, :ancho * 2].reshape(alto, 2, ancho, 2).max(axis=(1, 3))


for nombre, k in filtros.items():
    mapa = np.maximum(convolucion(imagen, k), 0)  # ReLU: los negativos pasan a 0
    print(f"Filtro {nombre}: mapa de activación {mapa.shape[0]}×{mapa.shape[1]} (tras ReLU)")
    print(mapa)
    print(f"Tras max pooling 2×2 ({max_pooling(mapa).shape[0]}×{max_pooling(mapa).shape[1]}):")
    print(max_pooling(mapa))
    print()

print("Pesos de un filtro de 3×3: 9, los mismos en las 36 posiciones")
print(f"Una capa densa de 64 píxeles a 36 salidas necesitaría {64 * 36} pesos")
```

- [ ] **Step 3: Generar y verificar la salida**

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py --update
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
git status --short src/components/ml-explorer/algorithms/python/
```
Expected: `✓` en todos los ejercicios; `git status` muestra como nuevos solo `cnn.py` y `cnn.out.txt` (los `.out.txt` anteriores se regeneran idénticos). El contenido de `cnn.out.txt` debe ser exactamente:

```text
Filtro vertical: mapa de activación 6×6 (tras ReLU)
[[2 0 0 0 0 0]
 [2 0 1 1 0 0]
 [1 1 2 0 0 0]
 [0 2 3 0 0 0]
 [0 3 3 0 0 0]
 [0 2 2 0 0 0]]
Tras max pooling 2×2 (3×3):
[[2 1 0]
 [2 3 0]
 [3 3 0]]

Filtro horizontal: mapa de activación 6×6 (tras ReLU)
[[2 3 3 3 3 2]
 [0 0 0 0 0 0]
 [0 0 0 0 0 0]
 [0 1 1 0 0 0]
 [0 0 0 0 0 0]
 [0 0 0 0 0 0]]
Tras max pooling 2×2 (3×3):
[[3 3 3]
 [1 1 0]
 [0 0 0]]

Pesos de un filtro de 3×3: 9, los mismos en las 36 posiciones
Una capa densa de 64 píxeles a 36 salidas necesitaría 2304 pesos
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: PASS.

- [ ] **Step 4: Test de la OVA (falla)**

Crea `src/components/ml-explorer/ovas/CnnOva.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CNN_STEP_MS, CnnOva } from './CnnOva';

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

describe('CnnOva', () => {
  it('empieza en la posición 1 de 36 con suma 2; paso a paso llega al mapa completo (13 casillas)', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<CnnOva />);
    expect(status(container)).toContain('Posición 1 de 36 (fila 1, columna 1)');
    expect(status(container)).toContain('Suma de productos: 2 → tras ReLU: 2');
    for (let i = 0; i < 28; i++) fireEvent.click(button('Paso ▸'));
    expect(status(container)).toContain('Posición 29 de 36 (fila 5, columna 5)');
    expect(status(container)).toContain('Suma de productos: -3 → tras ReLU: 0');
    for (let i = 0; i < 7; i++) fireEvent.click(button('Paso ▸'));
    expect(status(container)).toContain('Mapa completo: 13 de 36 casillas se encienden');
    expect((button('Paso ▸') as HTMLButtonElement).disabled).toBe(true);
    expect(container.querySelectorAll('.mlx-cnn-pool')).toHaveLength(9);
    expect(error).not.toHaveBeenCalled();
  });

  it('el filtro horizontal reinicia el recorrido y enciende 8 casillas', () => {
    const { container } = render(<CnnOva />);
    fireEvent.click(button('Paso ▸'));
    fireEvent.click(button('Borde horizontal'));
    expect(button('Borde horizontal').getAttribute('aria-pressed')).toBe('true');
    expect(status(container)).toContain('Posición 1 de 36');
    for (let i = 0; i < 35; i++) fireEvent.click(button('Paso ▸'));
    expect(status(container)).toContain('Mapa completo: 8 de 36');
    const pooled = Array.from(container.querySelectorAll('.mlx-cnn-pool text'), (t) => t.textContent);
    expect(pooled).toEqual(['3', '3', '3', '1', '1', '0', '0', '0', '0']);
  });

  it('Reproducir avanza una posición cada CNN_STEP_MS y se detiene al final', () => {
    vi.useFakeTimers();
    const { container } = render(<CnnOva />);
    fireEvent.click(button('▶ Reproducir'));
    expect(button('⏸ Pausar').getAttribute('aria-pressed')).toBe('true');
    act(() => vi.advanceTimersByTime(CNN_STEP_MS));
    expect(status(container)).toContain('Posición 2 de 36');
    for (let i = 0; i < 40; i++) act(() => vi.advanceTimersByTime(CNN_STEP_MS));
    expect(status(container)).toContain('Posición 36 de 36');
    expect(button('▶ Reproducir').getAttribute('aria-pressed')).toBe('false');
  });

  it('fuera de la pantalla la animación se pausa y sigue al volver', () => {
    vi.useFakeTimers();
    const { container } = render(<CnnOva />);
    fireEvent.click(button('▶ Reproducir'));
    setVisible(false);
    act(() => vi.advanceTimersByTime(CNN_STEP_MS * 3));
    expect(status(container)).toContain('Posición 1 de 36');
    setVisible(true);
    act(() => vi.advanceTimersByTime(CNN_STEP_MS));
    expect(status(container)).toContain('Posición 2 de 36');
  });

  it('con «reducir movimiento», Reproducir salta al mapa completo sin animar', () => {
    mockReducedMotion(true);
    vi.useFakeTimers();
    const { container } = render(<CnnOva />);
    fireEvent.click(button('▶ Reproducir'));
    expect(status(container)).toContain('Posición 36 de 36');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('mientras reproduce, el readout no se anuncia; al desmontar no quedan timers', () => {
    vi.useFakeTimers();
    const { container, unmount } = render(<CnnOva />);
    const live = () => container.querySelector('[role="status"]')?.getAttribute('aria-live');
    expect(live()).toBe('polite');
    fireEvent.click(button('▶ Reproducir'));
    expect(live()).toBe('off');
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('el svg es una imagen con 64 píxeles y 36 casillas; el hint va fuera del readout', () => {
    const { container } = render(<CnnOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('.mlx-cnn-cell')).toHaveLength(36);
    expect(svg?.querySelectorAll('rect').length).toBeGreaterThanOrEqual(64 + 1 + 36);
    const hint = screen.getByText(/el horizontal al borde de arriba de la barra/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });
});
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/CnnOva.dom.test.tsx`
Expected: FAIL (`./CnnOva` no existe).

- [ ] **Step 5: La OVA**

Crea `src/components/ml-explorer/ovas/CnnOva.tsx`:

```tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { CNN_IMAGE as IMAGE, CNN_KERNELS as KERNELS } from './datasets';
import { OVA_COLORS, OvaFrame } from './OvaFrame';
import { conv2d, maxPool2, relu, type Grid } from './ovaMath';
import { useInViewport, usePrefersReducedMotion } from './useMotion';

/** Tiempo entre posiciones al reproducir. */
export const CNN_STEP_MS = 500;
const C = 22; // lado de cada casilla en px
const MAP = 6; // el mapa es de 6×6
const LAST = MAP * MAP - 1;
const MAP_X = 8 * C + 40; // el mapa va a la derecha de la imagen
const POOL_Y = MAP * C + 40; // y el pooling, debajo del mapa

export function CnnOva() {
  const [kernelIndex, setKernelIndex] = useState(0);
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stageRef);
  const reducedMotion = usePrefersReducedMotion();

  const kernel = KERNELS[kernelIndex].kernel as unknown as Grid;
  const raw = useMemo(() => conv2d(IMAGE, kernel), [kernel]);
  const map = useMemo(() => relu(raw), [raw]);
  const pooled = useMemo(() => maxPool2(map), [map]);
  const row = Math.floor(pos / MAP);
  const col = pos % MAP;
  const done = pos >= LAST;

  // Avanza una posición cada CNN_STEP_MS, solo mientras la OVA está en pantalla.
  useEffect(() => {
    if (!playing || !visible) return;
    if (done) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setPos((p) => p + 1), CNN_STEP_MS);
    return () => window.clearTimeout(id);
  }, [playing, visible, done, pos]);

  const reset = (next = kernelIndex) => {
    setKernelIndex(next);
    setPos(0);
    setPlaying(false);
  };

  const togglePlay = () => {
    if (playing) return setPlaying(false);
    // Con «reducir movimiento», nada de animación: salta al mapa completo.
    if (reducedMotion) return setPos(LAST);
    if (done) setPos(0);
    setPlaying(true);
  };

  const active = map.flat().filter((v) => v > 0).length;

  return (
    <OvaFrame
      title="Un filtro de 3×3 recorre la imagen"
      hint="La imagen es un «7» de 8×8 píxeles (1 = tinta). El recuadro verde es el filtro: en cada posición multiplica sus 9 pesos por los 9 píxeles que cubre y suma. Ese número, con los negativos llevados a 0 (ReLU), llena una casilla del mapa de activación de 6×6. Pulsa «Paso» o «Reproducir» y fíjate dónde se enciende el mapa: el filtro vertical responde al borde izquierdo de cada trazo y el horizontal al borde de arriba de la barra. Al final, el max pooling resume cada bloque de 2×2 del mapa con su máximo."
      controls={
        <>
          <div role="group" aria-label="Filtro">
            <span>Filtro: </span>
            {KERNELS.map((k, i) => (
              <button key={k.id} type="button" aria-pressed={kernelIndex === i} onClick={() => reset(i)}>
                {k.label}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Recorrido">
            <button type="button" disabled={done} onClick={() => setPos((p) => p + 1)}>
              Paso ▸
            </button>
            <button type="button" aria-pressed={playing} onClick={togglePlay}>
              {playing ? '⏸ Pausar' : '▶ Reproducir'}
            </button>
            <button type="button" onClick={() => reset(0)}>
              Restablecer
            </button>
          </div>
        </>
      }
      readoutLive={playing ? 'off' : 'polite'}
      readout={
        <>
          <span>
            Posición <b>{pos + 1}</b> de <b>{LAST + 1}</b> (fila {row + 1}, columna {col + 1})
          </span>
          <span>
            Suma de productos: <b>{raw[row][col]}</b> → tras ReLU: <b>{map[row][col]}</b>
          </span>
          {done && (
            <span>
              Mapa completo: <b>{active}</b> de 36 casillas se encienden. Tras el pooling queda de 3×3.
            </span>
          )}
        </>
      }
    >
      <div ref={stageRef}>
        <svg
          viewBox={`0 0 ${MAP_X + MAP * C + 4} ${POOL_Y + 3 * C + 24}`}
          role="img"
          aria-label={`Imagen de 8×8 con el filtro de 3×3 en la fila ${row + 1}, columna ${col + 1}, y el mapa de activación de 6×6 con ${pos + 1} casillas calculadas`}
        >
          <text x={0} y={12} fontSize={11} fill={OVA_COLORS.axis}>
            imagen 8×8
          </text>
          {IMAGE.flatMap((r, i) =>
            r.map((v, j) => (
              <rect
                key={`i${i}-${j}`}
                x={j * C}
                y={20 + i * C}
                width={C - 1}
                height={C - 1}
                fill={v ? '#e8e8f0' : 'rgba(85, 170, 255, 0.12)'}
              />
            )),
          )}
          <rect
            className="mlx-cnn-window"
            style={{ transform: `translate(${col * C - 1}px, ${20 + row * C - 1}px)` }}
            width={3 * C + 1}
            height={3 * C + 1}
            fill="none"
            stroke={OVA_COLORS.accent}
            strokeWidth={3}
          />
          <text x={MAP_X} y={12} fontSize={11} fill={OVA_COLORS.axis}>
            mapa de activación 6×6
          </text>
          {map.flatMap((r, i) =>
            r.map((v, j) => {
              const k = i * MAP + j;
              const shown = k <= pos;
              return (
                <g key={`m${i}-${j}`} className="mlx-cnn-cell">
                  <rect
                    x={MAP_X + j * C}
                    y={20 + i * C}
                    width={C - 1}
                    height={C - 1}
                    fill={shown && v > 0 ? OVA_COLORS.class1 : 'rgba(85, 170, 255, 0.12)'}
                    fillOpacity={shown && v > 0 ? 0.3 + v / 4.5 : 1}
                    stroke={k === pos ? OVA_COLORS.accent : 'none'}
                    strokeWidth={2}
                  />
                  {shown && (
                    <text x={MAP_X + j * C + C / 2} y={20 + i * C + C / 2 + 4} textAnchor="middle" fontSize={11} fill="#e8e8f0">
                      {v}
                    </text>
                  )}
                </g>
              );
            }),
          )}
          {done && (
            <>
              <text x={MAP_X} y={POOL_Y + 8} fontSize={11} fill={OVA_COLORS.axis}>
                max pooling 2×2 → 3×3
              </text>
              {pooled.flatMap((r, i) =>
                r.map((v, j) => (
                  <g key={`p${i}-${j}`} className="mlx-cnn-pool">
                    <rect
                      x={MAP_X + j * C}
                      y={POOL_Y + 14 + i * C}
                      width={C - 1}
                      height={C - 1}
                      fill={v > 0 ? OVA_COLORS.class1 : 'rgba(85, 170, 255, 0.12)'}
                      fillOpacity={v > 0 ? 0.3 + v / 4.5 : 1}
                    />
                    <text x={MAP_X + j * C + C / 2} y={POOL_Y + 14 + i * C + C / 2 + 4} textAnchor="middle" fontSize={11} fill="#e8e8f0">
                      {v}
                    </text>
                  </g>
                )),
              )}
            </>
          )}
          <text x={0} y={20 + 8 * C + 16} fontSize={11} fill={OVA_COLORS.axis}>
            filtro: {kernel.map((r) => `[${r.join(' ')}]`).join(' ')}
          </text>
        </svg>
      </div>
    </OvaFrame>
  );
}
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/CnnOva.dom.test.tsx`
Expected: PASS.

- [ ] **Step 6: El módulo del algoritmo**

Crea `src/components/ml-explorer/algorithms/cnn.tsx` (los textos ya pasan los tests de redacción: cópialos tal cual):

```tsx
import { G } from '../Gloss';
import { Tex } from '../Tex';
import { CnnOva } from '../ovas/CnnOva';
import type { AlgorithmModule } from '../types';
import code from './python/cnn.py?raw';
import expectedOutput from './python/cnn.out.txt?raw';

const cnn: AlgorithmModule = {
  slug: 'cnn',
  row: {
    type: 'Supervisado',
    bestUse: 'Imágenes y otros datos en cuadrícula',
    formula: 'Convoluciones + pooling',
    assumptions: 'Los valores vecinos están relacionados (estructura espacial)',
    pros: 'Muy buena con imágenes',
    cons: 'Costosa de entrenar; necesita muchas imágenes etiquetadas',
    whenNot: 'Datos sin estructura espacial, como una tabla',
    realWorld: 'Reconocimiento facial e imágenes médicas',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>
              <G k="supervisado">Supervisado</G>:
            </b>{' '}
            aprende de imágenes que ya traen su etiqueta («gato», «tumor», «7»). Es una{' '}
            <G k="redNeuronal">red neuronal</G> pensada para datos en cuadrícula, como los píxeles de una foto.
          </p>
          <p>
            En vez de mirar cada píxel por separado, recorre la imagen con <b>filtros pequeños</b> (por ejemplo, de
            3×3) que detectan patrones locales: bordes, esquinas, texturas. Esa operación es la{' '}
            <G k="convolucion">convolución</G>, y de ahí el nombre: <i>Convolutional Neural Network</i>.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Las primeras capas aprenden bordes; las siguientes combinan bordes en formas y las últimas, formas en
          objetos. Al final suele ir un MLP pequeño que clasifica. Además de clasificar, las{' '}
          <G k="redConvolucional">redes convolucionales</G> localizan objetos en la imagen y la segmentan píxel a píxel.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsala con <b>imágenes</b> y con cualquier dato donde los valores vecinos se relacionan: espectrogramas de
            audio, mapas, señales de sensores en el tiempo.
          </p>
          <ul>
            <li>Clasificar radiografías o fotos de piezas defectuosas.</li>
            <li>Leer placas de vehículos o texto en documentos escaneados.</li>
            <li>Detectar fisuras en fotos de una estructura.</li>
          </ul>
          <p className="mlx-rule">
            Si tus datos son imágenes, empieza por una <G k="redConvolucional">red convolucional</G> ya entrenada y
            ajústala a tu problema.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Partir de una red entrenada con millones de fotos (<G k="transferencia">aprendizaje por transferencia</G>)
          permite buenos resultados con cientos de imágenes por clase. Desde 2020 los Vision{' '}
          <G k="transformer">Transformers</G> compiten con ellas cuando hay muchísimos datos.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> un filtro de 3×3 para bordes verticales tiene −1 en la columna izquierda, 0 en el centro y
            1 a la derecha. Sobre la esquina de arriba a la izquierda del «7» del simulador, la fila de arriba es fondo y
            en las otras dos hay tinta en el centro y a la derecha: fila por fila da 0 + 1 + 1 = 2. Donde el trazo termina a la derecha, la
            suma da −3 y la <G k="relu">ReLU</G> la deja en 0.
          </p>
          <p>
            Repetir la cuenta en las 36 posiciones da un <G k="mapaActivacion">mapa de activación</G> de 6×6: alto donde
            hay un borde izquierdo de un trazo. Después, el <G k="pooling">max pooling</G> de 2×2 resume cada bloque con
            su máximo y deja un mapa de 3×3.
          </p>
          <Tex block>{'S_{i,j} = \\sum_{a=0}^{2} \\sum_{b=0}^{2} I_{i+a,\\, j+b}\\, K_{a,b}, \\qquad A = \\max(0, S)'}</Tex>
          <p>
            <Tex>{'I'}</Tex> es la imagen, <Tex>{'K'}</Tex> el filtro (sus 9 pesos se aprenden) y <Tex>{'A'}</Tex> el
            mapa tras la ReLU. Una capa tiene muchos filtros y cada uno produce su propio mapa.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            En las redes se llama <G k="convolucion">convolución</G> aunque, en rigor, es una correlación: el filtro no
            se voltea. Da igual, porque sus pesos se aprenden. El <i>stride</i> (salto entre posiciones) y el{' '}
            <i>padding</i> (borde de ceros) controlan el tamaño del mapa: con paso 1 y sin borde, de 8×8 se pasa a 6×6.
          </p>
          <p>
            Con una imagen en color, cada filtro tiene 3×3×3 pesos (uno por canal rojo, verde y azul). El entrenamiento
            es el de cualquier red: <G k="retropropagacion">retropropagación</G> y{' '}
            <G k="descensoGradiente">descenso de gradiente</G>.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que <b>lo que importa está en los vecinos</b>: un borde es un cambio entre píxeles contiguos. Si
            barajas las columnas de una tabla, nada cambia; si barajas los píxeles de una foto, se pierde la imagen.
            La <G k="convolucion">convolución</G> aprovecha justo ese orden.
          </p>
          <p>
            También supone que <b>un patrón significa lo mismo en cualquier lugar</b>: un borde arriba a la izquierda es
            el mismo borde abajo a la derecha. Por eso usa el mismo filtro en todas las posiciones.
          </p>
        </>
      ),
      deepDive: (
        <p>
          El <G k="pooling">pooling</G> añade tolerancia a desplazamientos pequeños, no a giros ni a cambios de
          escala: si todas las fotos de entrenamiento están derechas, una foto girada puede fallar. Para eso se usa el{' '}
          <G k="aumentoDatos">aumento de datos</G>.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Pocos pesos:</b> en el ejercicio, un filtro de 3×3 usa 9 pesos en las 36 posiciones; una capa densa de
            64 píxeles a 36 salidas necesitaría 2 304.
          </li>
          <li>
            <b>Aprende qué mirar:</b> los filtros se ajustan solos; nadie le dice que busque bordes.
          </li>
          <li>
            <b>Muy buena con imágenes:</b> desde 2012 las <G k="redConvolucional">redes convolucionales</G> dominan el
            reconocimiento de imágenes.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          En 2012, AlexNet, una <G k="redConvolucional">red convolucional</G> entrenada en <G k="gpu">GPU</G>, ganó el
          concurso ImageNet con un error top-5 de 15 % (falla si la clase correcta no está entre sus 5 primeras
          opciones), contra 26 % del segundo. Compartir pesos también hace que el modelo resista mejor el{' '}
          <G k="overfitting">sobreajuste</G> que una red densa del mismo tamaño.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Necesita muchas imágenes etiquetadas:</b> miles por clase si se entrena desde cero.
          </li>
          <li>
            <b>Costosa:</b> entrenar una red grande toma horas o días en <G k="gpu">GPU</G>.
          </li>
          <li>
            <b>Caja negra:</b> se pueden dibujar los <G k="mapaActivacion">mapas de activación</G>, pero no explican del
            todo por qué decide.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Puede aprender atajos: si todas las fotos de una clase tienen la misma marca de agua, aprende a detectar la
          marca. Contra eso: datos variados, <G k="aumentoDatos">aumento de datos</G> y revisar en qué se fija la red
          con mapas de calor (Grad-CAM, por ejemplo).
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No la uses con datos sin estructura espacial, como una tabla de clientes.</p>
          <p>
            Ejemplo: predecir la rotación de clientes con edad, plan y consumo. El orden de las columnas no significa
            nada, así que la <G k="convolucion">convolución</G> no tiene vecinos que aprovechar. Un <G k="ensamble">ensamble</G> de
            árboles o una SVM funcionan mejor y con muchos menos datos.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Con imágenes pocas y simples, como los dígitos de 8×8 del ejercicio de SVM, una SVM sobre los píxeles ya
          acierta casi todo. Y con imágenes muy grandes y muchísimos datos, los Vision{' '}
          <G k="transformer">Transformers</G> pueden superarla.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Reconocimiento facial e imágenes médicas.</b> Desbloquear el teléfono con la cara o señalar zonas
            sospechosas en una radiografía son tareas de <G k="redConvolucional">redes convolucionales</G>.
          </p>
          <p>
            El ejercicio hace a mano lo que hace la primera capa: pasa dos filtros de 3×3 sobre un «7» de 8×8 píxeles.
            El vertical se enciende en el borde izquierdo de cada trazo, con un máximo de 3 en el palo del 7; el
            horizontal, en el borde de arriba de la barra (2 3 3 3 3 2). El <G k="pooling">max pooling</G> deja cada
            mapa en 3×3.
          </p>
        </>
      ),
      deepDive: (
        <p>
          En la práctica no se programan los filtros: se define la red con <G k="pytorch">PyTorch o TensorFlow</G> y
          se parte de una red ya entrenada (<G k="transferencia">ajuste fino</G>). El notebook de Colab trae, como celda
          opcional, la misma <G k="convolucion">convolución</G> hecha con PyTorch, que da el mismo mapa.
        </p>
      ),
    },
  },
  Ova: CnnOva,
  python: { code, expectedOutput, colabNotebook: 'cnn' },
  inYourField: [
    { area: 'Civil', example: 'detectar fisuras y desprendimientos en fotos de puentes tomadas con dron.' },
    { area: 'Industrial', example: 'inspección visual de piezas en una línea de producción: aceptar o rechazar cada una.' },
    { area: 'Agronómica', example: 'reconocer plagas o enfermedades en fotos de hojas tomadas con el celular.' },
  ],
  alternatives: ['svm', 'transformer'],
};

export default cnn;
```

- [ ] **Step 7: Registrar el loader**

En `registry.ts`, dentro de `LOADERS`, justo después de

```ts
  mlp: () => import('./algorithms/mlp'),
```

añade:

```ts
  cnn: () => import('./algorithms/cnn'),
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
      'mlp',
      'cnn',
    ]);
```

- [ ] **Step 8: Recorrido con el módulo real**

Añade al final de `src/components/ml-explorer/MLExplorer.real.dom.test.tsx` (el helper `tourRealAlgorithm` lo creó la Task 4):

```tsx
it('CNN real (?alg=cnn): recorre las 8 pestañas sin errores', async () => {
  await tourRealAlgorithm('cnn', 'CNN', 'Suma de productos: 2 → tras ReLU: 2');
});
```

- [ ] **Step 9: Notebook de Colab y su celda opcional de PyTorch**

En `scripts/build-ml-notebook.py`, dentro de `ALGORITHMS`, justo después de la tupla de "mlp":

```python
    (
        "cnn",
        "CNN (red neuronal convolucional)",
        "Detector de bordes: una convolución, ReLU y max pooling hechos a mano con NumPy.",
    ),
```

Crea `scripts/ml-pytorch/cnn.py` (no lo leen los verificadores: no está en `algorithms/python/`):

```python
# Opcional: la misma convolución con PyTorch (Colab ya lo trae instalado; en el navegador no corre).
# Usa `imagen`, `filtros` y `convolucion` de la celda anterior.
try:
    import torch
    import torch.nn.functional as F
except ImportError:
    print("PyTorch no está instalado: esta celda es opcional.")
else:
    entrada = torch.tensor(imagen, dtype=torch.float32)[None, None]  # forma (lote, canal, alto, ancho)
    for nombre, k in filtros.items():
        filtro = torch.tensor(k, dtype=torch.float32)[None, None]
        mapa_pt = F.relu(F.conv2d(entrada, filtro))[0, 0].int().numpy()
        igual = (mapa_pt == np.maximum(convolucion(imagen, k), 0)).all()
        print(f"Filtro {nombre}: ¿PyTorch da el mismo mapa que la versión a mano? {igual}")
```

```bash
python3 scripts/build-ml-notebook.py
```
Expected: `Escrito notebooks/algoritmos-ml.ipynb y 14 notebooks individuales`.

- [ ] **Step 10: Description del artículo**

En `src/data/articles/algoritmos-ml-explorador.md`, en la línea `description:`, cambia «Los primeros trece ya están completos» por «Los primeros catorce ya están completos» (lo exige `algoritmos-ml-explorador.links.test.ts`).

- [ ] **Step 11: Verificación completa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
node scripts/check-ml-exercises-pyodide.mjs
```
Expected: todos los tests pasan (incluidos `registry.test.ts`, que comprueba que las alternativas de `cnn` existen; `notebook.test.ts`, que compara los notebooks con el `.py` y revisa la celda opcional de PyTorch; `glossaryTerms.test.ts`, `glossaryDensity.test.ts`, `textSpacing.test.ts`, `render.test.ts` y `ovaHints.test.ts` sobre los textos nuevos; y `algoritmos-ml-explorador.links.test.ts`); `tsc` sin errores; `✓ cnn.py (Pyodide)` y los demás también.

Revisión manual con el servidor de desarrollo (`ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js`), en `#/articles/algoritmos-ml-explorador?alg=cnn&tab=formula`: la OVA responde al teclado (Tab hasta los controles, flechas en los sliders, Enter/Espacio en los botones), las cifras iniciales coinciden con la tabla «Cifras clave», las fichas 💡 abren, y en «Ejemplo real» «▶ Ejecutar» da la misma salida que la esperada.

- [ ] **Step 12: Commit**

```bash
git add src/components/ml-explorer/algorithms/python/cnn.py \
  src/components/ml-explorer/algorithms/python/cnn.out.txt \
  src/components/ml-explorer/algorithms/python/outputs.test.ts \
  src/components/ml-explorer/ovas/CnnOva.tsx \
  src/components/ml-explorer/ovas/CnnOva.dom.test.tsx \
  src/components/ml-explorer/algorithms/cnn.tsx \
  src/components/ml-explorer/registry.ts \
  src/components/ml-explorer/registry.test.ts \
  src/components/ml-explorer/MLExplorer.real.dom.test.tsx \
  scripts/build-ml-notebook.py \
  scripts/ml-pytorch/cnn.py \
  ../notebooks/algoritmos-ml.ipynb \
  ../notebooks/algoritmos-ml/cnn.ipynb \
  src/data/articles/algoritmos-ml-explorador.md
git commit -m "feat(ml-explorer): add the CNN with its sliding-filter simulator and exercise

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: RNN

**Files:**
- Create: `src/components/ml-explorer/algorithms/python/rnn.py`
- Create: `src/components/ml-explorer/algorithms/python/rnn.out.txt` (generado)
- Modify: `src/components/ml-explorer/algorithms/python/outputs.test.ts`
- Create: `src/components/ml-explorer/ovas/RnnOva.tsx`
- Create: `src/components/ml-explorer/ovas/RnnOva.dom.test.tsx`
- Create: `src/components/ml-explorer/algorithms/rnn.tsx`
- Modify: `src/components/ml-explorer/registry.ts`, `src/components/ml-explorer/registry.test.ts`
- Modify: `src/components/ml-explorer/MLExplorer.real.dom.test.tsx`
- Create: `scripts/ml-pytorch/rnn.py` (celda opcional de PyTorch para Colab)
- Modify: `scripts/build-ml-notebook.py`; regenerar `../notebooks/algoritmos-ml.ipynb` y crear `../notebooks/algoritmos-ml/rnn.ipynb`
- Modify: `src/data/articles/algoritmos-ml-explorador.md` (solo la description)

Historia del ejercicio: NumPy puro. 50 mediciones (`default_rng(0).normal`) entran a una RNN de una neurona, `h_t = tanh(w·h_(t−1) + u·x_t)` con `u = 0.5`. La función `influencia_del_primero` aplica la regla de la cadena hacia atrás (retropropagación en el tiempo) y da ∂h_T/∂x_1; la tabla la imprime para T = 1, 5, 10, 20 y 50 y w = 0.5, 0.9 y 1.0 en notación científica con 2 cifras. Cierra con una comprobación por diferencias finitas (0.0242 en ambos). Es la RNN mínima con un gradiente que se desvanece que pide el encargo; el spec decía «predicción de una serie»: ver «Riesgos y decisiones».

La OVA usa las 30 primeras mediciones redondeadas a 2 decimales (`RNN_INPUTS`) y dibuja, en escala logarítmica, una barra por paso con la influencia de cada medición en la salida final. Sliders: pasos (1 a 30) y w (0.1 a 1.0). Arranca en w = 0.9 y 10 pasos: x₁ influye 0.024 (1 en 41).

Alternativas: Transformer (secuencias largas) y Gradient Boosting (series cortas con valores rezagados como columnas).

- [ ] **Step 1: Fijar las cifras del ejercicio en `outputs.test.ts` (falla)**

Añade el import junto a los otros (después de `import cnn from './cnn.out.txt?raw';`):

```ts
import rnn from './rnn.out.txt?raw';
```

y dentro del `describe('cifras citadas en los textos', …)`, al final (antes del `});` que lo cierra):

```ts
  it('RNN: con w = 0.9 la influencia del primer dato baja de 5.0e-01 a 2.4e-02 (10), 6.2e-06 (20) y 5.8e-14 (50); w = 0.5 → 2.0e-04 con 10; comprobación 0.0242', () => {
    const row = (T: number) => rnn.match(new RegExp(`^\\s+${T} \\|\\s+(\\S+) \\|\\s+(\\S+) \\|\\s+(\\S+)$`, 'm'))!.slice(1);
    expect(row(1)).toEqual(['5.0e-01', '5.0e-01', '5.0e-01']);
    expect(row(10)).toEqual(['2.0e-04', '2.4e-02', '4.3e-02']);
    expect(row(20)[1]).toBe('6.2e-06');
    expect(row(50)[1]).toBe('5.8e-14');
    expect(Number(row(50)[2])).toBeLessThan(1e-12); // aun con w = 1.0 se desvanece
    expect(rnn).toContain('regla de la cadena 0.0242, numérica 0.0242');
  });
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: FAIL (`rnn.out.txt` no existe).

- [ ] **Step 2: Escribir el ejercicio**

Crea `src/components/ml-explorer/algorithms/python/rnn.py`:

```python
# Una RNN mínima: ¿cuánto influye la primera medición en la salida final?
import numpy as np

rng = np.random.default_rng(0)
x = rng.normal(size=50)  # 50 mediciones seguidas (por ejemplo, consumo de energía hora a hora)


def rnn(x, w, u):
    """h_t = tanh(w·h_(t−1) + u·x_t): la memoria h se actualiza con cada medición."""
    h = np.zeros(len(x) + 1)
    for t, xt in enumerate(x, start=1):
        h[t] = np.tanh(w * h[t - 1] + u * xt)
    return h


def influencia_del_primero(x, w, u):
    """∂h_T/∂x_1 por la regla de la cadena hacia atrás (retropropagación en el tiempo)."""
    h = rnn(x, w, u)
    grad = u * (1 - h[1] ** 2)  # cuánto mueve x_1 a h_1
    for t in range(2, len(x) + 1):
        grad *= w * (1 - h[t] ** 2)  # cada paso multiplica por w·tanh'(…), que es menor que 1
    return grad


u = 0.5
print("pasos T |  w = 0.5 |  w = 0.9 |  w = 1.0")
for T in (1, 5, 10, 20, 50):
    fila = [influencia_del_primero(x[:T], w, u) for w in (0.5, 0.9, 1.0)]
    print(f"{T:7d} | " + " | ".join(f"{g:8.1e}" for g in fila))

# Comprobación sin regla de la cadena: mover x_1 un poquito y ver cuánto se mueve h_T
T, w, eps = 10, 0.9, 1e-6
x2 = x[:T].copy()
x2[0] += eps
numerico = (rnn(x2, w, u)[-1] - rnn(x[:T], w, u)[-1]) / eps
print(f"\nComprobación con T = {T}, w = {w}: regla de la cadena {influencia_del_primero(x[:T], w, u):.4f}, numérica {numerico:.4f}")
```

- [ ] **Step 3: Generar y verificar la salida**

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py --update
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
git status --short src/components/ml-explorer/algorithms/python/
```
Expected: `✓` en todos los ejercicios; `git status` muestra como nuevos solo `rnn.py` y `rnn.out.txt` (los `.out.txt` anteriores se regeneran idénticos). El contenido de `rnn.out.txt` debe ser exactamente:

```text
pasos T |  w = 0.5 |  w = 0.9 |  w = 1.0
      1 |  5.0e-01 |  5.0e-01 |  5.0e-01
      5 |  2.7e-02 |  2.7e-01 |  4.0e-01
     10 |  2.0e-04 |  2.4e-02 |  4.3e-02
     20 |  4.0e-09 |  6.2e-06 |  1.3e-05
     50 |  3.3e-22 |  5.8e-14 |  5.4e-13

Comprobación con T = 10, w = 0.9: regla de la cadena 0.0242, numérica 0.0242
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: PASS.

- [ ] **Step 4: Test de la OVA (falla)**

Crea `src/components/ml-explorer/ovas/RnnOva.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatInfluence, oneIn, RnnOva } from './RnnOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const slider = (name: RegExp) => screen.getByRole('slider', { name });

describe('formatInfluence y oneIn', () => {
  it('3 decimales si se lee; si no, notación científica; el inverso con 2 cifras y espacio de miles', () => {
    expect(formatInfluence(0.02433)).toBe('0.024');
    expect(formatInfluence(6.217e-6)).toBe('6.2e-6');
    expect(oneIn(0.02433)).toBe('1 en 41');
    expect(oneIn(2.035e-4)).toBe('1 en 4 900');
    expect(oneIn(2.462e-7)).toBe('1 en 4 100 000');
  });
});

describe('RnnOva', () => {
  it('w = 0.9 y 10 pasos: x₁ influye 0.024 (1 en 41); con 20 pasos, 6.2e-6; con 30, 2.5e-7', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<RnnOva />);
    expect(status(container)).toContain('Influencia de x₁ en la salida: 0.024 (1 en 41)');
    expect(status(container)).toContain('Influencia de x10, la última: 0.452');
    fireEvent.change(slider(/^Pasos/), { target: { value: '20' } });
    expect(status(container)).toContain('6.2e-6 (1 en 160 000)');
    fireEvent.change(slider(/^Pasos/), { target: { value: '30' } });
    expect(status(container)).toContain('2.5e-7 (1 en 4 100 000)');
    expect(error).not.toHaveBeenCalled();
  });

  it('bajar w a 0.5 encoge más rápido: 2.0e-4 con 10 pasos; Restablecer vuelve a 0.024', () => {
    const { container } = render(<RnnOva />);
    fireEvent.change(slider(/^w/), { target: { value: '0.5' } });
    expect(slider(/^w/).getAttribute('aria-valuetext')).toBe('0.5');
    expect(status(container)).toContain('2.0e-4 (1 en 4 900)');
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }));
    expect(status(container)).toContain('0.024 (1 en 41)');
  });

  it('el svg es una imagen con una barra por paso; el hint va fuera del readout', () => {
    const { container } = render(<RnnOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('.mlx-rnn-bar')).toHaveLength(10);
    fireEvent.change(slider(/^Pasos/), { target: { value: '25' } });
    expect(svg?.querySelectorAll('.mlx-rnn-bar')).toHaveLength(25);
    const hint = screen.getByText(/Aun con w = 1 se encoge/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });
});
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/RnnOva.dom.test.tsx`
Expected: FAIL (`./RnnOva` no existe).

- [ ] **Step 5: La OVA**

Crea `src/components/ml-explorer/ovas/RnnOva.tsx`:

```tsx
import { useState } from 'react';
import { RNN_INPUTS, RNN_START, RNN_STEPS, RNN_U, RNN_W } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { rnnInfluence } from './ovaMath';

const W = 360;
const H = 220;
const TOP = 16;
const BOTTOM = 190;
/** Escala logarítmica del eje y: de 1e-8 (abajo) a 1 (arriba). */
const LOG_MIN = -8;
const yOf = (g: number) => TOP + (Math.max(LOG_MIN, Math.log10(g)) / LOG_MIN) * (BOTTOM - TOP);

/** «0.024» si es legible con 3 decimales; si no, notación científica: «6.2e-6». */
export function formatInfluence(g: number): string {
  return g >= 0.001 ? g.toFixed(3) : g.toExponential(1);
}

/** «1 en 41», «1 en 4 900»: el inverso con 2 cifras significativas y espacio de miles. */
export function oneIn(g: number): string {
  const n = Number((1 / g).toPrecision(2));
  return `1 en ${n.toLocaleString('en-US', { maximumFractionDigits: 0 }).replace(/,/g, ' ')}`;
}

export function RnnOva() {
  const [w, setW] = useState<number>(RNN_START.w);
  const [steps, setSteps] = useState<number>(RNN_START.steps);
  const g = rnnInfluence(RNN_INPUTS.slice(0, steps), w, RNN_U);
  const barW = (W - 40) / RNN_STEPS.max;

  return (
    <OvaFrame
      title="La memoria de una RNN se desvanece"
      hint="La red lee las mediciones una por una (x₁, x₂, …) y actualiza su memoria con h = tanh(w·h + 0.5·x). Cada barra dice cuánto cambiaría la salida final si cambiara esa medición: es el gradiente que le llega en el entrenamiento. El eje es logarítmico: cada raya hacia abajo es 10 veces menos. Alarga la secuencia y mira cómo se encoge la barra de x₁; baja w y se encoge más rápido. Aun con w = 1 se encoge, porque tanh′ es menor que 1."
      controls={
        <>
          <OvaSlider label="Pasos de la secuencia" value={steps} {...RNN_STEPS} onChange={setSteps} />
          <OvaSlider label="w (peso de la memoria)" value={w} {...RNN_W} onChange={(v) => setW(Math.round(v * 10) / 10)} format={(v) => v.toFixed(1)} />
          <button
            type="button"
            onClick={() => {
              setW(RNN_START.w);
              setSteps(RNN_START.steps);
            }}
          >
            Restablecer
          </button>
        </>
      }
      readout={
        <>
          <span>
            Influencia de x₁ en la salida: <b>{formatInfluence(g[0])}</b> ({oneIn(g[0])})
          </span>
          <span>
            Influencia de x<sub>{steps}</sub>, la última: <b>{formatInfluence(g[steps - 1])}</b>
          </span>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Influencia de cada una de las ${steps} mediciones en la salida final, en escala logarítmica`}>
        {Array.from({ length: -LOG_MIN + 1 }, (_, i) => (
          <g key={i}>
            <line x1={34} x2={W} y1={yOf(10 ** -i)} y2={yOf(10 ** -i)} stroke={OVA_COLORS.grid} />
            <text x={30} y={yOf(10 ** -i) + 4} textAnchor="end" fontSize={10} fill={OVA_COLORS.axis}>
              {i === 0 ? '1' : `1e-${i}`}
            </text>
          </g>
        ))}
        {g.map((v, t) => (
          <rect
            key={t}
            className="mlx-rnn-bar"
            x={36 + t * barW}
            y={yOf(v)}
            width={barW - 2}
            height={BOTTOM - yOf(v)}
            fill={t === 0 ? OVA_COLORS.risk : OVA_COLORS.class0}
          />
        ))}
        <text x={36} y={H - 8} fontSize={11} fill={OVA_COLORS.axis}>
          x₁
        </text>
        <text x={36 + steps * barW} y={H - 8} textAnchor="end" fontSize={11} fill={OVA_COLORS.axis}>
          x{steps} (la última) →
        </text>
      </svg>
    </OvaFrame>
  );
}
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/RnnOva.dom.test.tsx`
Expected: PASS.

- [ ] **Step 6: El módulo del algoritmo**

Crea `src/components/ml-explorer/algorithms/rnn.tsx` (los textos ya pasan los tests de redacción: cópialos tal cual):

```tsx
import { G } from '../Gloss';
import { Tex } from '../Tex';
import { RnnOva } from '../ovas/RnnOva';
import type { AlgorithmModule } from '../types';
import code from './python/rnn.py?raw';
import expectedOutput from './python/rnn.out.txt?raw';

const rnn: AlgorithmModule = {
  slug: 'rnn',
  row: {
    type: 'Supervisado',
    bestUse: 'Datos en secuencia: series de tiempo, texto, audio',
    formula: 'Un estado oculto que se actualiza en cada paso',
    assumptions: 'El orden importa y el pasado reciente explica el presente',
    pros: 'Lee secuencias de cualquier longitud',
    cons: 'El gradiente se desvanece: olvida lo lejano',
    whenNot: 'Secuencias muy largas (mejor un Transformer)',
    realWorld: 'Reconocimiento de voz y predicción de series',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>
              <G k="supervisado">Supervisado</G>:
            </b>{' '}
            aprende de secuencias que ya traen la respuesta: la demanda de mañana, la palabra siguiente, el texto de
            un audio. Es una <G k="redNeuronal">red neuronal</G> que lee los datos <b>uno por uno y en orden</b>.
          </p>
          <p>
            Mientras lee, guarda una memoria, el <G k="estadoOculto">estado oculto</G>, que mezcla lo que ya traía con
            el dato nuevo. Por eso se llama recurrente (<i>Recurrent Neural Network</i>): usa su propia salida anterior
            como entrada.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Puede dar una salida al final (clasificar una reseña completa), una por paso (etiquetar cada palabra) o
          generar otra secuencia (traducir). Las versiones que se usan en la práctica son la{' '}
          <G k="lstm">LSTM y la GRU</G>, que guardan mejor la memoria.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsala cuando <b>el orden de los datos importa</b> y cada dato depende de los anteriores.
          </p>
          <ul>
            <li>Predecir la demanda de energía de la próxima hora con las horas anteriores.</li>
            <li>Detectar fallas en la vibración de una máquina a medida que llega la señal.</li>
            <li>Dispositivos pequeños que procesan audio o sensores en tiempo real, paso a paso.</li>
          </ul>
          <p className="mlx-rule">
            Para texto largo, prefiere un <G k="transformer">Transformer</G>; para series cortas en tabla, prueba antes
            un modelo de árboles con valores rezagados como columnas (la demanda de ayer, la de anteayer…).
          </p>
        </>
      ),
      deepDive: (
        <p>
          Su ventaja actual es que procesa cada dato nuevo con una cuenta de tamaño fijo, sin volver a leer todo el
          pasado: útil en tiempo real y con poca memoria. Una <G k="lstm">LSTM</G> recuerda bien decenas o algunos
          cientos de pasos.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> una RNN de una sola <G k="neurona">neurona</G> con <Tex>{'w = 0.9'}</Tex> lee 10
            mediciones. La primera entra multiplicada por <Tex>{'u = 0.5'}</Tex>; luego, en cada uno de los 9 pasos
            siguientes, su efecto se multiplica por 0.9 y por la pendiente de tanh, que es como mucho 1. Sin la
            pendiente quedaría 0.5 · 0.9<sup>9</sup> = 0.19; con ella, el simulador da 0.024: 1 en 41.
          </p>
          <Tex block>{'h_t = \\tanh(w\\, h_{t-1} + u\\, x_t), \\qquad \\frac{\\partial h_T}{\\partial h_1} = \\prod_{t=2}^{T} w\\, (1 - h_t^2)'}</Tex>
          <p>
            <Tex>{'h_t'}</Tex> es el <G k="estadoOculto">estado oculto</G> en el paso <Tex>{'t'}</Tex> y{' '}
            <Tex>{'x_t'}</Tex> el dato que entra. El producto de la derecha es lo que lleva hacia atrás la{' '}
            <G k="retropropagacion">retropropagación</G>: si cada factor es menor que 1, el{' '}
            <G k="desvanecimiento">gradiente se desvanece</G>.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Con vectores, <Tex>{'h_t = \\tanh(W h_{t-1} + U x_t + b)'}</Tex>, y los mismos <Tex>{'W'}</Tex> y{' '}
            <Tex>{'U'}</Tex> se usan en todos los pasos. Para entrenar se «desenrolla» la red en el tiempo, como una red
            de T capas que comparten pesos, y se aplica la <G k="retropropagacion">retropropagación</G> (BPTT, por sus
            siglas en inglés).
          </p>
          <p>
            El factor por paso depende de los pesos: si es mayor que 1, el gradiente explota en vez de desvanecerse. Lo
            primero se frena recortando el gradiente; lo segundo pide otra arquitectura, como la{' '}
            <G k="lstm">LSTM</G>, cuya memoria pasa de un paso al siguiente casi sin multiplicarse.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que <b>el orden importa</b> y que lo reciente explica bastante del presente. Si barajas las
            mediciones, la RNN da otra cosa; un modelo de tabla ni lo notaría.
          </p>
          <p>
            También supone, sin decirlo, que <b>lo importante no está muy atrás</b>: en el ejercicio, con 20 pasos el
            primer dato influye 6.2e-06 en la salida (seis millonésimas). La red básica casi no puede aprender
            dependencias tan lejanas.
          </p>
        </>
      ),
      deepDive: (
        <p>
          La <G k="lstm">LSTM</G> relaja ese supuesto con compuertas que deciden qué guardar y qué olvidar. Aun así, la
          información viaja paso a paso: para relacionar la palabra 1 con la 500 tiene que sobrevivir 499
          actualizaciones. El <G k="transformer">Transformer</G> las conecta directamente.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Secuencias de cualquier longitud:</b> los mismos pesos sirven para 10 o para 10 000 pasos.
          </li>
          <li>
            <b>Memoria compacta:</b> todo el pasado se resume en el <G k="estadoOculto">estado oculto</G>, de tamaño
            fijo.
          </li>
          <li>
            <b>Barata al predecir:</b> cada dato nuevo cuesta lo mismo, sin releer la historia.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Un <G k="transformer">Transformer</G> compara cada <G k="token">token</G> con todos los anteriores, así que su costo crece con
          el cuadrado de la longitud. La RNN crece en línea recta. Por eso hay arquitecturas recientes que vuelven a
          ideas recurrentes para textos muy largos.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Olvida lo lejano:</b> el <G k="desvanecimiento">gradiente se desvanece</G>. En el ejercicio, con w = 0.9
            la influencia del primer dato pasa de 0.024 (10 pasos) a 5.8e-14 (50 pasos).
          </li>
          <li>
            <b>Lenta de entrenar:</b> el paso 2 necesita el resultado del paso 1, así que no se reparte bien en una{' '}
            <G k="gpu">GPU</G>.
          </li>
          <li>
            <b>Inestable:</b> el gradiente también puede explotar; hay que recortarlo.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          La <G k="lstm">LSTM</G> y la GRU reducen el desvanecimiento; recortar el{' '}
          <G k="gradiente">gradiente</G> evita la explosión. Para dependencias de cientos o miles de pasos, el{' '}
          <G k="transformer">Transformer</G> las reemplazó en casi todas las tareas de texto.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">
            No la uses con secuencias largas donde importa lo lejano: usa un <G k="transformer">Transformer</G>.
          </p>
          <p>
            Ejemplo: resumir un contrato de 20 páginas. Lo que dice la cláusula 1 puede cambiar el sentido de la
            cláusula 30, y una RNN ya lo habrá olvidado. Tampoco la uses si tus datos no tienen orden: es una tabla.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Para pronosticar series de una sola variable con poca historia, los métodos estadísticos clásicos (como
          ARIMA) o un modelo de árboles con valores rezagados suelen ganarle y son más fáciles de revisar.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Reconocimiento de voz y predicción de series.</b> Hacia 2015-2016 los dictados por voz y los traductores
            automáticos usaban <G k="lstm">LSTM</G>; luego llegaron los{' '}
            <G k="transformer">Transformers</G>.
          </p>
          <p>
            El ejercicio no entrena una red: mide su memoria. Con 50 mediciones y la regla de la cadena, calcula cuánto
            mueve la primera medición a la última salida. Con w = 0.9 baja de 5.0e-01 (1 paso) a 2.4e-02 (10) y a
            6.2e-06 (20). Con w = 0.5 cae aún más rápido; con w = 1.0 también cae. La comprobación numérica da lo mismo:
            0.0242.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Ese número es el <G k="gradiente">gradiente</G> que recibiría el primer paso al entrenar: si es seis
          millonésimas, sus pesos casi no se corrigen. En la práctica se usa <code>torch.nn.LSTM</code> o{' '}
          <code>torch.nn.GRU</code> de <G k="pytorch">PyTorch</G>; el notebook de Colab trae una celda opcional que
          repite la medición con una RNN de PyTorch.
        </p>
      ),
    },
  },
  Ova: RnnOva,
  python: { code, expectedOutput, colabNotebook: 'rnn' },
  inYourField: [
    { area: 'Eléctrica', example: 'pronosticar la carga de un transformador hora a hora con su historia reciente.' },
    { area: 'Mecánica', example: 'detectar el inicio de una falla en un rodamiento leyendo la señal de vibración en tiempo real.' },
    { area: 'Ambiental', example: 'predecir el nivel de un río a partir de la lluvia y los caudales de las horas anteriores.' },
  ],
  alternatives: ['transformer', 'gradient-boosting'],
};

export default rnn;
```

- [ ] **Step 7: Registrar el loader**

En `registry.ts`, dentro de `LOADERS`, justo después de

```ts
  cnn: () => import('./algorithms/cnn'),
```

añade:

```ts
  rnn: () => import('./algorithms/rnn'),
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
      'mlp',
      'cnn',
      'rnn',
    ]);
```

- [ ] **Step 8: Recorrido con el módulo real**

Añade al final de `src/components/ml-explorer/MLExplorer.real.dom.test.tsx` (el helper `tourRealAlgorithm` lo creó la Task 4):

```tsx
it('RNN real (?alg=rnn): recorre las 8 pestañas sin errores', async () => {
  await tourRealAlgorithm('rnn', 'RNN', 'Influencia de x₁ en la salida: 0.024 (1 en 41)');
});
```

- [ ] **Step 9: Notebook de Colab y su celda opcional de PyTorch**

En `scripts/build-ml-notebook.py`, dentro de `ALGORITHMS`, justo después de la tupla de "cnn":

```python
    (
        "rnn",
        "RNN (red neuronal recurrente)",
        "La memoria de una RNN mínima: cuánto influye la primera medición en la salida final.",
    ),
```

Crea `scripts/ml-pytorch/rnn.py` (no lo leen los verificadores: no está en `algorithms/python/`):

```python
# Opcional: la misma medición con una RNN de PyTorch y su derivada automática (autograd).
# Colab ya trae PyTorch; en el navegador no corre. Usa `x` y `u` de la celda anterior.
try:
    import torch
except ImportError:
    print("PyTorch no está instalado: esta celda es opcional.")
else:
    red_pt = torch.nn.RNN(1, 1, bias=False, dtype=torch.float64)  # h_t = tanh(u·x_t + w·h_(t−1))
    with torch.no_grad():
        red_pt.weight_ih_l0.fill_(u)
        red_pt.weight_hh_l0.fill_(0.9)
    entrada = torch.tensor(x[:10]).reshape(10, 1, 1).requires_grad_()
    salidas, _ = red_pt(entrada)
    salidas[-1].sum().backward()  # retropropagación en el tiempo, hecha por PyTorch
    print(f"PyTorch con T = 10, w = 0.9: ∂h_T/∂x_1 = {entrada.grad[0].item():.4f}")
```

```bash
python3 scripts/build-ml-notebook.py
```
Expected: `Escrito notebooks/algoritmos-ml.ipynb y 15 notebooks individuales`.

- [ ] **Step 10: Description del artículo**

En `src/data/articles/algoritmos-ml-explorador.md`, en la línea `description:`, cambia «Los primeros catorce ya están completos» por «Los primeros quince ya están completos» (lo exige `algoritmos-ml-explorador.links.test.ts`).

- [ ] **Step 11: Verificación completa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
node scripts/check-ml-exercises-pyodide.mjs
```
Expected: todos los tests pasan (incluidos `registry.test.ts`, que comprueba que las alternativas de `rnn` existen; `notebook.test.ts`, que compara los notebooks con el `.py` y revisa la celda opcional de PyTorch; `glossaryTerms.test.ts`, `glossaryDensity.test.ts`, `textSpacing.test.ts`, `render.test.ts` y `ovaHints.test.ts` sobre los textos nuevos; y `algoritmos-ml-explorador.links.test.ts`); `tsc` sin errores; `✓ rnn.py (Pyodide)` y los demás también.

Revisión manual con el servidor de desarrollo (`ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js`), en `#/articles/algoritmos-ml-explorador?alg=rnn&tab=formula`: la OVA responde al teclado (Tab hasta los controles, flechas en los sliders, Enter/Espacio en los botones), las cifras iniciales coinciden con la tabla «Cifras clave», las fichas 💡 abren, y en «Ejemplo real» «▶ Ejecutar» da la misma salida que la esperada.

- [ ] **Step 12: Commit**

```bash
git add src/components/ml-explorer/algorithms/python/rnn.py \
  src/components/ml-explorer/algorithms/python/rnn.out.txt \
  src/components/ml-explorer/algorithms/python/outputs.test.ts \
  src/components/ml-explorer/ovas/RnnOva.tsx \
  src/components/ml-explorer/ovas/RnnOva.dom.test.tsx \
  src/components/ml-explorer/algorithms/rnn.tsx \
  src/components/ml-explorer/registry.ts \
  src/components/ml-explorer/registry.test.ts \
  src/components/ml-explorer/MLExplorer.real.dom.test.tsx \
  scripts/build-ml-notebook.py \
  scripts/ml-pytorch/rnn.py \
  ../notebooks/algoritmos-ml.ipynb \
  ../notebooks/algoritmos-ml/rnn.ipynb \
  src/data/articles/algoritmos-ml-explorador.md
git commit -m "feat(ml-explorer): add the RNN with its vanishing-gradient simulator and exercise

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Transformer (BERT, GPT)

**Files:**
- Create: `src/components/ml-explorer/algorithms/python/transformer.py`
- Create: `src/components/ml-explorer/algorithms/python/transformer.out.txt` (generado)
- Modify: `src/components/ml-explorer/algorithms/python/outputs.test.ts`
- Create: `src/components/ml-explorer/ovas/TransformerOva.tsx`
- Create: `src/components/ml-explorer/ovas/TransformerOva.dom.test.tsx`
- Create: `src/components/ml-explorer/algorithms/transformer.tsx`
- Modify: `src/components/ml-explorer/registry.ts`, `src/components/ml-explorer/registry.test.ts`
- Modify: `src/components/ml-explorer/MLExplorer.real.dom.test.tsx`
- Create: `scripts/ml-pytorch/transformer.py` (celda opcional de PyTorch para Colab)
- Modify: `scripts/build-ml-notebook.py`; regenerar `../notebooks/algoritmos-ml.ipynb` y crear `../notebooks/algoritmos-ml/transformer.ipynb`
- Modify: `src/data/articles/algoritmos-ml-explorador.md` (solo la description)
- Modify: `src/components/ml-explorer/ovas/ovaHints.test.ts`

Historia del ejercicio: NumPy puro. Embeddings de juguete de 4 números escritos a mano ([función, cosa, dinero, naturaleza]) para «el», «banco», «del», «río», «cobra» e «interés»; self-attention de una cabeza con Q = K = V = X (sin matrices aprendidas, para que se pueda leer), softmax por filas y salida ponderada. Imprime el mapa de atención de «el banco del río» y de «el banco cobra interés» (banco sale hacia naturaleza o hacia dinero), el de la máscara causal (estilo GPT) y cuánto cambia «banco» al invertir la frase sin y con codificación posicional sinusoidal (0.00 y 0.30).

La OVA usa los mismos embeddings: mapa de atención de 4×4 con los números, botones para elegir la frase, invertir el orden, activar la codificación posicional y la máscara causal, y elegir qué palabra explica el readout. No hay un campo de texto libre: un modelo de juguete solo conoce 6 palabras (ver «Riesgos y decisiones»).

Alternativas: Naive Bayes (texto corto y pocos datos) y RNN (secuencias numéricas en un dispositivo pequeño). Al registrar `transformer`, la alternativa «Transformer (BERT, GPT)» de Naive Bayes pasa a enlace.

- [ ] **Step 1: Fijar las cifras del ejercicio en `outputs.test.ts` (falla)**

Añade el import junto a los otros (después de `import rnn from './rnn.out.txt?raw';`):

```ts
import transformer from './transformer.out.txt?raw';
```

y dentro del `describe('cifras citadas en los textos', …)`, al final (antes del `});` que lo cierra):

```ts
  it('Transformer: banco atiende 0.41 a río y sale con naturaleza 1.23; con interés, dinero 1.38; causal 0.18 / 0.82; invertir: 0.00 sin posición y 0.30 con ella', () => {
    expect(transformer).toMatch(/^\s+banco\s+0\.09\s+0\.41\s+0\.09\s+0\.41$/m);
    expect(transformer).toContain('«banco» después de la atención: dinero 0.41, naturaleza 1.23');
    expect(transformer).toContain('«banco» después de la atención: dinero 1.38, naturaleza 0.35');
    expect(transformer).toMatch(/^\s+banco\s+0\.18\s+0\.82\s+0\.00\s+0\.00$/m);
    expect(transformer).toContain('sin codificación posicional: «banco» cambia 0.00 al invertir la frase');
    expect(transformer).toContain('con codificación posicional: «banco» cambia 0.30 al invertir la frase');
  });
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: FAIL (`transformer.out.txt` no existe).

- [ ] **Step 2: Escribir el ejercicio**

Crea `src/components/ml-explorer/algorithms/python/transformer.py`:

```python
# Self-attention a mano: cómo «banco» mira a las otras palabras de la frase
import numpy as np

# Embeddings de juguete con 4 números: [función, cosa, dinero, naturaleza]
emb = {
    "el": [1.0, 0.0, 0.0, 0.0],
    "banco": [0.0, 1.0, 1.0, 1.0],  # ambiguo: dinero y naturaleza por igual
    "del": [1.0, 0.0, 0.0, 0.0],
    "río": [0.0, 1.0, 0.0, 2.0],
    "cobra": [0.0, 0.5, 1.5, 0.0],
    "interés": [0.0, 1.0, 2.0, 0.0],
}


def softmax(s):
    e = np.exp(s - s.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)


def posicion(n, d=4):
    """Codificación posicional sinusoidal (la del artículo original del Transformer)."""
    pos = np.arange(n)[:, None]
    i = np.arange(d)[None, :]
    angulo = pos / 10000 ** (2 * (i // 2) / d)
    return np.where(i % 2 == 0, np.sin(angulo), np.cos(angulo))


def atencion(palabras, con_posicion=False, causal=False):
    X = np.array([emb[p] for p in palabras])
    if con_posicion:
        X = X + posicion(len(palabras))
    Q, K, V = X, X, X  # en un modelo real: X @ W_Q, X @ W_K, X @ W_V, con pesos aprendidos
    puntajes = Q @ K.T / np.sqrt(X.shape[1])
    if causal:  # estilo GPT: cada palabra solo ve las anteriores
        puntajes = np.where(np.tril(np.ones_like(puntajes)) == 1, puntajes, -np.inf)
    A = softmax(puntajes)
    return A, A @ V


def mostrar(palabras, A):
    print("         " + "".join(f"{p:>9}" for p in palabras))
    for p, fila in zip(palabras, A):
        print(f"{p:>9}" + "".join(f"{a:9.2f}" for a in fila))


for frase in (["el", "banco", "del", "río"], ["el", "banco", "cobra", "interés"]):
    A, salida = atencion(frase)
    print(f"«{' '.join(frase)}»: cuánto atiende cada palabra (fila) a cada otra (columna)")
    mostrar(frase, A)
    b = salida[1]
    print(f"«banco» después de la atención: dinero {b[2]:.2f}, naturaleza {b[3]:.2f}\n")

frase = ["el", "banco", "del", "río"]
A, _ = atencion(frase, causal=True)
print("Con máscara causal (estilo GPT): «banco» aún no ve «río»")
mostrar(frase, A)

al_reves = frase[::-1]
for con in (False, True):
    b1 = atencion(frase, con_posicion=con)[1][1]
    b2 = atencion(al_reves, con_posicion=con)[1][al_reves.index("banco")]
    nombre = "con" if con else "sin"
    print(f"\n{nombre} codificación posicional: «banco» cambia {np.abs(b1 - b2).max():.2f} al invertir la frase")
```

- [ ] **Step 3: Generar y verificar la salida**

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py --update
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
git status --short src/components/ml-explorer/algorithms/python/
```
Expected: `✓` en todos los ejercicios; `git status` muestra como nuevos solo `transformer.py` y `transformer.out.txt` (los `.out.txt` anteriores se regeneran idénticos). El contenido de `transformer.out.txt` debe ser exactamente:

```text
«el banco del río»: cuánto atiende cada palabra (fila) a cada otra (columna)
                el    banco      del      río
       el     0.31     0.19     0.31     0.19
    banco     0.09     0.41     0.09     0.41
      del     0.31     0.19     0.31     0.19
      río     0.05     0.24     0.05     0.65
«banco» después de la atención: dinero 0.41, naturaleza 1.23

«el banco cobra interés»: cuánto atiende cada palabra (fila) a cada otra (columna)
                el    banco    cobra  interés
       el     0.35     0.22     0.22     0.22
    banco     0.08     0.35     0.21     0.35
    cobra     0.08     0.21     0.27     0.44
  interés     0.04     0.19     0.25     0.52
«banco» después de la atención: dinero 1.38, naturaleza 0.35

Con máscara causal (estilo GPT): «banco» aún no ve «río»
                el    banco      del      río
       el     1.00     0.00     0.00     0.00
    banco     0.18     0.82     0.00     0.00
      del     0.38     0.23     0.38     0.00
      río     0.05     0.24     0.05     0.65

sin codificación posicional: «banco» cambia 0.00 al invertir la frase

con codificación posicional: «banco» cambia 0.30 al invertir la frase
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: PASS.

- [ ] **Step 4: Test de la OVA (falla)**

Crea `src/components/ml-explorer/ovas/TransformerOva.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TransformerOva } from './TransformerOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => (c.querySelector('[role="status"]')?.textContent ?? '').replace(/\s+/g, ' ');
const button = (name: string) => screen.getByRole('button', { name });

describe('TransformerOva', () => {
  it('«el banco del río»: banco atiende 0.41 a río y sale con naturaleza 1.23; con «interés», dinero 1.38', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<TransformerOva />);
    expect(status(container)).toContain('«banco» atiende a: el 0.09 · banco 0.41 · del 0.09 · río 0.41');
    expect(status(container)).toContain('Después de la atención: dinero 0.41 · naturaleza 1.23');
    fireEvent.click(button('el banco cobra interés'));
    expect(button('el banco cobra interés').getAttribute('aria-pressed')).toBe('true');
    expect(status(container)).toContain('dinero 1.38 · naturaleza 0.35');
    expect(error).not.toHaveBeenCalled();
  });

  it('sin codificación posicional, invertir no cambia a banco (0.00); con ella cambia 0.30', () => {
    const { container } = render(<TransformerOva />);
    expect(status(container)).toContain('Si se invierte la frase, «banco» cambia 0.00');
    fireEvent.click(button('Invertir el orden'));
    expect(status(container)).toContain('«banco» atiende a: río 0.41 · del 0.09 · banco 0.41 · el 0.09');
    expect(status(container)).toContain('naturaleza 1.23');
    fireEvent.click(button('Codificación posicional'));
    expect(status(container)).toContain('cambia 0.30');
  });

  it('la máscara causal deja a banco ver solo «el» y a sí mismo (0.18 y 0.82)', () => {
    const { container } = render(<TransformerOva />);
    fireEvent.click(button('Máscara causal (GPT)'));
    expect(status(container)).toContain('el 0.18 · banco 0.82 · del 0.00 · río 0.00');
  });

  it('elegir otra palabra cambia la fila que se lee; al cambiar de frase vuelve a «banco» si la palabra no está', () => {
    const { container } = render(<TransformerOva />);
    fireEvent.click(button('río'));
    expect(status(container)).toContain('«río» atiende a: el 0.05 · banco 0.24 · del 0.05 · río 0.65');
    fireEvent.click(button('el banco cobra interés'));
    expect(status(container)).toContain('«banco» atiende a:');
    fireEvent.click(button('Restablecer'));
    expect(button('el banco del río').getAttribute('aria-pressed')).toBe('true');
  });

  it('el svg es una imagen con 16 casillas; el hint va fuera del readout', () => {
    const { container } = render(<TransformerOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('rect')).toHaveLength(16);
    const hint = screen.getByText(/la atención no ve el orden/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });
});
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/TransformerOva.dom.test.tsx`
Expected: FAIL (`./TransformerOva` no existe).

- [ ] **Step 5: La OVA**

Crea `src/components/ml-explorer/ovas/TransformerOva.tsx`:

```tsx
import { useState } from 'react';
import { TF_DIMS, TF_EMBEDDINGS, TF_SENTENCES } from './datasets';
import { OVA_COLORS, OvaFrame } from './OvaFrame';
import { positionalEncoding, selfAttention, type Grid } from './ovaMath';

const C = 58; // lado de cada casilla del mapa de atención
const LEFT = 70;
const TOP = 28;

interface Options {
  positional: boolean;
  causal: boolean;
}

/** Embeddings de la frase (más la codificación posicional, si está activa) y su atención. */
function attend(words: readonly string[], { positional, causal }: Options) {
  let X: Grid = words.map((w) => TF_EMBEDDINGS[w]);
  if (positional) {
    const pe = positionalEncoding(X.length, X[0].length);
    X = X.map((r, i) => r.map((v, c) => v + pe[i][c]));
  }
  return selfAttention(X, causal);
}

export function TransformerOva() {
  const [sentence, setSentence] = useState(0);
  const [reversed, setReversed] = useState(false);
  const [positional, setPositional] = useState(false);
  const [causal, setCausal] = useState(false);
  const [focus, setFocus] = useState('banco');

  const base: readonly string[] = TF_SENTENCES[sentence];
  const words = reversed ? [...base].reverse() : [...base];
  const other = reversed ? [...base] : [...base].reverse();
  const opts = { positional, causal };
  const { weights, out } = attend(words, opts);
  const i = words.indexOf(focus);
  const otherOut = attend(other, opts).out[other.indexOf(focus)];
  const change = Math.max(...out[i].map((v, c) => Math.abs(v - otherOut[c])));

  const pickSentence = (k: number) => {
    setSentence(k);
    // La palabra que se explica debe estar en la frase nueva.
    if (!(TF_SENTENCES[k] as readonly string[]).includes(focus)) setFocus('banco');
  };

  const reset = () => {
    setSentence(0);
    setReversed(false);
    setPositional(false);
    setCausal(false);
    setFocus('banco');
  };

  return (
    <OvaFrame
      title="Mapa de atención de una frase"
      hint="Cada fila es una palabra y dice cuánto atiende a cada palabra de la frase (las filas suman 1). «Banco» es ambiguo: con «río» toma su lado de naturaleza y con «interés», el de dinero. Invierte la frase sin codificación posicional: los números solo cambian de lugar y cada palabra sale igual, porque la atención no ve el orden. Con la codificación posicional, sí cambia. La máscara causal (como en GPT) no deja a ninguna palabra mirar las que vienen después. Los embeddings son de juguete, con 4 números escritos a mano."
      controls={
        <>
          <div role="group" aria-label="Frase">
            <span>Frase: </span>
            {TF_SENTENCES.map((s, k) => (
              <button key={s.join(' ')} type="button" aria-pressed={sentence === k} onClick={() => pickSentence(k)}>
                {s.join(' ')}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Opciones">
            <button type="button" aria-pressed={reversed} onClick={() => setReversed((v) => !v)}>
              Invertir el orden
            </button>
            <button type="button" aria-pressed={positional} onClick={() => setPositional((v) => !v)}>
              Codificación posicional
            </button>
            <button type="button" aria-pressed={causal} onClick={() => setCausal((v) => !v)}>
              Máscara causal (GPT)
            </button>
          </div>
          <div role="group" aria-label="Palabra que explica la lectura">
            <span>Mirar: </span>
            {base.map((w) => (
              <button key={w} type="button" aria-pressed={focus === w} onClick={() => setFocus(w)}>
                {w}
              </button>
            ))}
          </div>
          <button type="button" onClick={reset}>
            Restablecer
          </button>
        </>
      }
      readout={
        <>
          <span>
            «{focus}» atiende a:{' '}
            {words.map((w, j) => (
              <span key={w}>
                {j > 0 && ' · '}
                {w} <b>{weights[i][j].toFixed(2)}</b>
              </span>
            ))}
          </span>
          <span>
            Después de la atención: {TF_DIMS[2]} <b>{out[i][2].toFixed(2)}</b> · {TF_DIMS[3]} <b>{out[i][3].toFixed(2)}</b>
          </span>
          <span>
            Si se invierte la frase, «{focus}» cambia <b>{change.toFixed(2)}</b>
          </span>
        </>
      }
    >
      <svg
        viewBox={`0 0 ${LEFT + words.length * C + 4} ${TOP + words.length * C + 4}`}
        role="img"
        aria-label={`Mapa de atención de «${words.join(' ')}»: una fila por palabra con el peso que da a cada palabra`}
      >
        {words.map((w, j) => (
          <text key={`c${w}`} x={LEFT + j * C + C / 2} y={TOP - 10} textAnchor="middle" fontSize={12} fill={OVA_COLORS.axis}>
            {w}
          </text>
        ))}
        {weights.map((row, r) => (
          <g key={words[r]} className="mlx-tf-row">
            <text x={LEFT - 8} y={TOP + r * C + C / 2 + 4} textAnchor="end" fontSize={12} fill={r === i ? OVA_COLORS.accent : OVA_COLORS.axis} fontWeight={r === i ? 700 : 400}>
              {words[r]}
            </text>
            {row.map((a, j) => (
              <g key={j}>
                <rect
                  x={LEFT + j * C}
                  y={TOP + r * C}
                  width={C - 2}
                  height={C - 2}
                  fill={OVA_COLORS.class1}
                  fillOpacity={0.06 + 0.9 * a}
                  stroke={r === i ? OVA_COLORS.accent : 'none'}
                  strokeWidth={2}
                />
                <text x={LEFT + j * C + C / 2 - 1} y={TOP + r * C + C / 2 + 4} textAnchor="middle" fontSize={12} fill="#e8e8f0">
                  {a.toFixed(2)}
                </text>
              </g>
            ))}
          </g>
        ))}
      </svg>
    </OvaFrame>
  );
}
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/TransformerOva.dom.test.tsx`
Expected: PASS.

- [ ] **Step 6: El módulo del algoritmo**

Crea `src/components/ml-explorer/algorithms/transformer.tsx` (los textos ya pasan los tests de redacción: cópialos tal cual):

```tsx
import { G } from '../Gloss';
import { Tex } from '../Tex';
import { TransformerOva } from '../ovas/TransformerOva';
import type { AlgorithmModule } from '../types';
import code from './python/transformer.py?raw';
import expectedOutput from './python/transformer.out.txt?raw';

const transformer: AlgorithmModule = {
  slug: 'transformer',
  row: {
    type: 'Supervisado y autosupervisado',
    bestUse: 'Texto y secuencias largas',
    formula: 'Self-attention: cada token pondera a todos los demás',
    assumptions: 'Muchísimos datos y mucho cómputo',
    pros: 'El mejor en lenguaje; se entrena en paralelo',
    cons: 'Muy costoso; puede inventar respuestas',
    whenNot: 'Pocos datos, poco cómputo o una tarea simple',
    realWorld: 'ChatGPT, traducción automática',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>
              <G k="autosupervisado">Autosupervisado</G> y luego <G k="supervisado">supervisado</G>:
            </b>{' '}
            primero aprende de enormes cantidades de texto sin etiquetar, adivinando palabras tapadas o la palabra
            siguiente; después se ajusta con pocos ejemplos etiquetados para una tarea concreta.
          </p>
          <p>
            Es la <G k="redNeuronal">red neuronal</G> detrás de los modelos de lenguaje actuales. Su pieza clave es la{' '}
            <G k="atencion">atención</G>: para representar cada palabra, mira todas las demás de la frase a la vez, no una
            por una como una RNN.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Hay dos familias principales (<G k="bertGpt">BERT y GPT</G>). BERT lee la frase entera en ambas direcciones y
          sirve para clasificar y buscar. GPT lee de izquierda a derecha y aprende a predecir el siguiente{' '}
          <G k="token">token</G>; con eso genera texto. El <G k="transformer">Transformer</G> original (2017) tenía las dos partes y se diseñó
          para traducir.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo con <b>texto</b> y con secuencias donde lo importante puede estar lejos: contratos, conversaciones,
            código, proteínas.
          </p>
          <ul>
            <li>Traducir, resumir o responder preguntas sobre documentos.</li>
            <li>Clasificar correos, reseñas o tickets de soporte por tema y urgencia.</li>
            <li>Buscar por significado y no por palabras exactas, comparando sus vectores.</li>
          </ul>
          <p className="mlx-rule">
            En la práctica no se entrena uno desde cero: se usa un modelo ya entrenado, por{' '}
            <G k="transferencia">ajuste fino</G> o con instrucciones.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Entrenar un <G k="llm">modelo de lenguaje grande</G> cuesta millones de dólares en <G k="gpu">GPU</G>.
            Ajustar uno pequeño de tipo <G k="bertGpt">BERT</G> a una clasificación de textos se hace con unos miles de
            ejemplos y una sola GPU.
          </p>
          <p>
            Los <G k="transformer">Transformers</G> también se usan con imágenes y audio, cortados en trozos que hacen de{' '}
            <G k="token">tokens</G>.
          </p>
        </>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> en «el banco del río», cada palabra tiene un <G k="embedding">embedding</G> de juguete
            con 4 números: [función, cosa, dinero, naturaleza]. «Banco» es [0, 1, 1, 1] y «río» es [0, 1, 0, 2].
            Su puntaje es el producto punto dividido por √4: (1 + 2) / 2 = 1.5. Con «el», 0.
          </p>
          <p>
            La <G k="softmax">softmax</G> convierte los puntajes de «banco» en pesos que suman 1: 0.09 para «el» y
            «del», 0.41 para «banco» y «río». La nueva versión de «banco» es el promedio de las cuatro palabras con
            esos pesos: queda con naturaleza 1.23 y dinero 0.41. Ya no es ambigua.
          </p>
          <Tex block>{'\\text{Atención}(Q, K, V) = \\text{softmax}\\!\\left(\\frac{Q K^\\top}{\\sqrt{d}}\\right) V'}</Tex>
          <p>
            <Tex>{'Q'}</Tex>, <Tex>{'K'}</Tex> y <Tex>{'V'}</Tex> (consultas, claves y valores) salen de multiplicar
            los embeddings por tres matrices de pesos aprendidas; <Tex>{'d'}</Tex> es su número de columnas. En el
            ejemplo y en el simulador, las tres son los embeddings sin cambio.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            La <G k="atencion">atención</G> no ve el orden: si se invierte la frase, cada palabra sale igual. Por eso se
            suma a cada embedding una <G k="codificacionPosicional">codificación posicional</G> (senos y cosenos según
            la posición).
          </p>
          <p>
            Los modelos tipo <G k="bertGpt">GPT</G> añaden una <G k="mascaraCausal">máscara causal</G>: cada token solo
            ve los anteriores, porque al generar texto el siguiente todavía no existe.
          </p>
          <p>
            Un bloque real tiene varias cabezas de atención en paralelo, cada una con sus matrices, seguidas de una
            capa densa. Los modelos apilan decenas de bloques. El costo de la atención crece con el cuadrado del
            número de <G k="token">tokens</G>: el doble de texto cuesta cuatro veces más.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone <b>muchísimos datos y mucho cómputo</b>: no trae ideas previas sobre el orden ni sobre la vecindad,
            así que todo lo aprende de los ejemplos. Con pocos datos, modelos más simples le ganan.
          </p>
          <p>
            También supone que el texto cabe en su ventana: un número máximo de <G k="token">tokens</G> que lee de una
            vez. Lo que queda fuera no existe para el modelo.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Por eso casi nunca se entrena desde cero: se parte de un modelo preentrenado de forma{' '}
          <G k="autosupervisado">autosupervisada</G> con miles de millones de palabras, que ya aprendió gramática y
          muchas asociaciones, y se ajusta a la tarea.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Contexto completo:</b> cada <G k="token">token</G> mira a todos los demás, estén a 2 o a 2 000 palabras,
            siempre que quepan en su ventana.
          </li>
          <li>
            <b>Se entrena en paralelo:</b> a diferencia de la RNN, procesa todos los tokens a la vez, y eso aprovecha
            bien la <G k="gpu">GPU</G>.
          </li>
          <li>
            <b>Un modelo, muchas tareas:</b> el mismo modelo preentrenado sirve para traducir, resumir, clasificar o
            responder, con poco ajuste.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          El <G k="atencion">mapa de atención</G> se puede mirar, como en el simulador, pero con decenas de cabezas y
          capas no basta para explicar una decisión. En el ejercicio sí se lee: «banco» atiende 0.41 a «río» y sale con
          naturaleza 1.23; en «el banco cobra interés» sale con dinero 1.38.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Muy costoso:</b> entrenar y servir modelos grandes exige <G k="gpu">GPU</G> y mucha energía.
          </li>
          <li>
            <b>Puede inventar:</b> genera texto probable, no verificado. Una cita o una cifra falsa dicha con seguridad
            es una <G k="alucinacion">alucinación</G>.
          </li>
          <li>
            <b>Hereda los sesgos</b> del texto con que se entrenó, y es difícil saber por qué respondió lo que respondió.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Para reducir las alucinaciones se le dan documentos de referencia junto con la pregunta y se le pide citar
          la fuente; aun así hay que comprobar lo importante. El costo cuadrático en la longitud limita cuántos{' '}
          <G k="token">tokens</G> lee de una vez.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses si la tarea es simple, hay pocos datos o necesitas una respuesta exacta y auditable.</p>
          <p>
            Ejemplo: separar spam con unos cientos de correos etiquetados. Naive Bayes o una regresión logística
            entrenan en un segundo y aciertan casi igual. Y para calcular una cifra, mejor una fórmula o una consulta a
            la base de datos que un <G k="llm">modelo de lenguaje</G>.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Con secuencias numéricas cortas, como sensores en un dispositivo pequeño, una RNN o un modelo de árboles es
          más barato. Con <G k="tabular">datos tabulares</G>, los <G k="ensamble">ensambles</G> de árboles siguen siendo la primera opción.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>ChatGPT y la traducción automática.</b> El <G k="transformer">Transformer</G> nació en 2017 para
            traducir, en el artículo «Attention Is All You Need» («La atención es todo lo que necesitas»).
          </p>
          <p>
            <G k="llm">ChatGPT</G> es un modelo tipo <G k="bertGpt">GPT</G>: predice el siguiente{' '}
            <G k="token">token</G> y fue ajustado para conversar.
          </p>
          <p>
            El ejercicio calcula a mano la <G k="atencion">atención</G> de 4 tokens. En «el banco del río», «banco»
            atiende 0.41 a «río» y sale con naturaleza 1.23; en «el banco cobra interés», con dinero 1.38. Con{' '}
            <G k="mascaraCausal">máscara causal</G>, «banco» aún no ve «río». Al invertir la frase, «banco» cambia 0.00 sin posición y 0.30 con ella.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Un modelo de lenguaje no consulta una base de datos de hechos: elige palabras probables. Por eso redacta y
          traduce con fluidez, pero puede <G k="alucinacion">alucinar</G>. El notebook de Colab trae una celda opcional
          con la misma atención en <G k="pytorch">PyTorch</G>, que da los mismos pesos.
        </p>
      ),
    },
  },
  Ova: TransformerOva,
  python: { code, expectedOutput, colabNotebook: 'transformer' },
  inYourField: [
    { area: 'Civil', example: 'buscar en cientos de especificaciones técnicas el párrafo que responde una duda, por significado y no por palabra exacta.' },
    { area: 'Industrial', example: 'clasificar los reportes de fallas escritos por los operarios según el equipo y la causa probable.' },
    { area: 'Sistemas', example: 'asistentes que sugieren código; el código que proponen hay que revisarlo y probarlo como cualquier otro.' },
  ],
  alternatives: ['naive-bayes', 'rnn'],
};

export default transformer;
```

- [ ] **Step 7: Registrar el loader**

En `registry.ts`, dentro de `LOADERS`, justo después de

```ts
  rnn: () => import('./algorithms/rnn'),
```

añade:

```ts
  transformer: () => import('./algorithms/transformer'),
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
      'mlp',
      'cnn',
      'rnn',
      'transformer',
    ]);
```

- [ ] **Step 8: Recorrido con el módulo real**

Añade al final de `src/components/ml-explorer/MLExplorer.real.dom.test.tsx` (el helper `tourRealAlgorithm` lo creó la Task 4):

```tsx
it('Transformer real (?alg=transformer): recorre las 8 pestañas sin errores', async () => {
  await tourRealAlgorithm('transformer', 'Transformer (BERT, GPT)', 'dinero 0.41 · naturaleza 1.23');
});
```

- [ ] **Step 9: Notebook de Colab y su celda opcional de PyTorch**

En `scripts/build-ml-notebook.py`, dentro de `ALGORITHMS`, justo después de la tupla de "rnn":

```python
    (
        "transformer",
        "Transformer (BERT, GPT)",
        "Self-attention a mano con 4 palabras: cómo «banco» toma su sentido de la frase.",
    ),
```

Crea `scripts/ml-pytorch/transformer.py` (no lo leen los verificadores: no está en `algorithms/python/`):

```python
# Opcional: la misma atención con PyTorch (Colab ya lo trae instalado; en el navegador no corre).
# Usa `emb` y `atencion` de la celda anterior.
try:
    import torch
except ImportError:
    print("PyTorch no está instalado: esta celda es opcional.")
else:
    frase = ["el", "banco", "del", "río"]
    X_pt = torch.tensor([emb[p] for p in frase], dtype=torch.float64)
    pesos_pt = torch.softmax(X_pt @ X_pt.T / X_pt.shape[1] ** 0.5, dim=-1)
    salida_pt = torch.nn.functional.scaled_dot_product_attention(X_pt[None], X_pt[None], X_pt[None])[0]
    A, salida = atencion(frase)
    print(f"¿Mismos pesos que NumPy? {np.allclose(pesos_pt.numpy(), A)}")
    print(f"¿Misma salida con scaled_dot_product_attention? {np.allclose(salida_pt.numpy(), salida)}")
```

```bash
python3 scripts/build-ml-notebook.py
```
Expected: `Escrito notebooks/algoritmos-ml.ipynb y 16 notebooks individuales`.

- [ ] **Step 10: Description del artículo**

En `src/data/articles/algoritmos-ml-explorador.md`, en la línea `description:`, cambia «Los primeros quince ya están completos» por «Los primeros dieciséis ya están completos» (lo exige `algoritmos-ml-explorador.links.test.ts`).

- [ ] **Step 11: Frases vetadas en el hint de la OVA**

En `src/components/ml-explorer/ovas/ovaHints.test.ts`, dentro de `BANNED`, después de `dbscan: [/núcleos que se tocan/i],` añade:

```ts
  // Sin exagerar: el simulador calcula pesos, no «entiende» ni «piensa».
  transformer: [/\bentiende\b/i, /\bpiensa\b/i, /comprende/i],
```

- [ ] **Step 12: Verificación completa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
node scripts/check-ml-exercises-pyodide.mjs
```
Expected: todos los tests pasan (incluidos `registry.test.ts`, que comprueba que las alternativas de `transformer` existen; `notebook.test.ts`, que compara los notebooks con el `.py` y revisa la celda opcional de PyTorch; `glossaryTerms.test.ts`, `glossaryDensity.test.ts`, `textSpacing.test.ts`, `render.test.ts` y `ovaHints.test.ts` sobre los textos nuevos; y `algoritmos-ml-explorador.links.test.ts`); `tsc` sin errores; `✓ transformer.py (Pyodide)` y los demás también.

Revisión manual con el servidor de desarrollo (`ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js`), en `#/articles/algoritmos-ml-explorador?alg=transformer&tab=formula`: la OVA responde al teclado (Tab hasta los controles, flechas en los sliders, Enter/Espacio en los botones), las cifras iniciales coinciden con la tabla «Cifras clave», las fichas 💡 abren, y en «Ejemplo real» «▶ Ejecutar» da la misma salida que la esperada.

- [ ] **Step 13: Commit**

```bash
git add src/components/ml-explorer/algorithms/python/transformer.py \
  src/components/ml-explorer/algorithms/python/transformer.out.txt \
  src/components/ml-explorer/algorithms/python/outputs.test.ts \
  src/components/ml-explorer/ovas/TransformerOva.tsx \
  src/components/ml-explorer/ovas/TransformerOva.dom.test.tsx \
  src/components/ml-explorer/algorithms/transformer.tsx \
  src/components/ml-explorer/registry.ts \
  src/components/ml-explorer/registry.test.ts \
  src/components/ml-explorer/MLExplorer.real.dom.test.tsx \
  scripts/build-ml-notebook.py \
  scripts/ml-pytorch/transformer.py \
  ../notebooks/algoritmos-ml.ipynb \
  ../notebooks/algoritmos-ml/transformer.ipynb \
  src/data/articles/algoritmos-ml-explorador.md \
  src/components/ml-explorer/ovas/ovaHints.test.ts
git commit -m "feat(ml-explorer): add the Transformer with its attention-map simulator and exercise

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Autoencoders

**Files:**
- Create: `src/components/ml-explorer/algorithms/python/autoencoders.py`
- Create: `src/components/ml-explorer/algorithms/python/autoencoders.out.txt` (generado)
- Modify: `src/components/ml-explorer/algorithms/python/outputs.test.ts`
- Create: `src/components/ml-explorer/ovas/AutoencoderOva.tsx`
- Create: `src/components/ml-explorer/ovas/AutoencoderOva.dom.test.tsx`
- Create: `src/components/ml-explorer/algorithms/autoencoders.tsx`
- Modify: `src/components/ml-explorer/registry.ts`, `src/components/ml-explorer/registry.test.ts`
- Modify: `src/components/ml-explorer/MLExplorer.real.dom.test.tsx`
- Create: `scripts/ml-pytorch/autoencoders.py` (celda opcional de PyTorch para Colab)
- Modify: `scripts/build-ml-notebook.py`; regenerar `../notebooks/algoritmos-ml.ipynb` y crear `../notebooks/algoritmos-ml/autoencoders.ipynb`
- Modify: `src/data/articles/algoritmos-ml-explorador.md` (solo la description)
- Modify: `src/data/articles/algoritmos-ml-explorador.links.test.ts`

Historia del ejercicio: NumPy puro. 1 000 compras normales simuladas con 6 medidas estandarizadas que salen de 2 factores ocultos más ruido (`default_rng(7)`), y 10 fraudes que no siguen el patrón. Un autoencoder lineal (codificador 6 → k, decodificador k → 6) se entrena con descenso de gradiente (3 000 pasos, tasa 0.05) solo con las normales. Para k = 1, 2 y 4 imprime el error medio de reconstrucción de normales y fraudes y cuántos fraudes superan el umbral (el error del percentil 99 de las normales). No se imprime k = 6: con descenso de gradiente el error de las normales queda en 1e-4 y la comparación con el umbral dependería de la última cifra (frágil entre CPython y Pyodide); la OVA, que usa la solución exacta, muestra ese caso.

La OVA son 40 compras normales y 3 fraudes fijos (`AE_NORMAL`, `AE_FRAUD`, de `default_rng(16)` redondeados a 2 decimales) con un slider del cuello de botella k = 1…6: una barra por compra con su error de reconstrucción (escala logarítmica), el umbral (el mayor error entre las normales) y la compra más rara marcada. El autoencoder lineal óptimo se calcula exacto: sus k direcciones son los k primeros componentes principales (Baldi y Hornik, 1989), con autovectores por el método de Jacobi.

Alternativas: PCA (si la estructura es lineal) y DBSCAN (anomalías como puntos aislados con pocas medidas). Al registrar `autoencoders`, la alternativa de PCA pasa a enlace y ya no queda ningún algoritmo «pronto».

- [ ] **Step 1: Fijar las cifras del ejercicio en `outputs.test.ts` (falla)**

Añade el import junto a los otros (después de `import transformer from './transformer.out.txt?raw';`):

```ts
import autoencoders from './autoencoders.out.txt?raw';
```

y dentro del `describe('cifras citadas en los textos', …)`, al final (antes del `});` que lo cierra):

```ts
  it('Autoencoders: 1000 normales y 10 fraudes; k = 1 detecta 5, k = 2 los 10 (0.03 contra 1.93); con k = 4 el error de los fraudes baja a 0.89', () => {
    expect(autoencoders).toContain('1000 compras normales para entrenar y 10 fraudes que el modelo nunca ve');
    const rows = [...autoencoders.matchAll(/^\s+(\d) \|\s+([\d.]+) \|\s+([\d.]+) \|\s+(\d+) de 10$/gm)].map((m) => m.slice(1).map(Number));
    expect(rows).toEqual([
      [1, 0.32, 2.13, 5],
      [2, 0.03, 1.93, 10],
      [4, 0.01, 0.89, 10],
    ]);
  });
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: FAIL (`autoencoders.out.txt` no existe).

- [ ] **Step 2: Escribir el ejercicio**

Crea `src/components/ml-explorer/algorithms/python/autoencoders.py`:

```python
# Detector de fraude sin etiquetas: un autoencoder que aprende cómo es una compra normal
import numpy as np

rng = np.random.default_rng(7)
# 6 medidas por compra (ya estandarizadas). En las compras normales salen de 2 factores ocultos
# (cuánto se gasta y cuán lejos de casa se compra), más un poco de ruido.
mezcla = rng.normal(size=(2, 6))
normales = rng.normal(size=(1000, 2)) @ mezcla + 0.2 * rng.normal(size=(1000, 6))
fraudes = rng.normal(size=(10, 6)) * 1.5  # no siguen el patrón de las normales
print(f"{len(normales)} compras normales para entrenar y {len(fraudes)} fraudes que el modelo nunca ve")


def entrenar(X, k, pasos=3000, tasa=0.05):
    """Autoencoder lineal: codifica 6 números en k (cuello de botella) y los decodifica de vuelta."""
    r = np.random.default_rng(0)
    W_cod = 0.1 * r.normal(size=(6, k))
    W_dec = 0.1 * r.normal(size=(k, 6))
    for _ in range(pasos):  # descenso de gradiente sobre el error cuadrático de reconstrucción
        Z = X @ W_cod
        dif = Z @ W_dec - X
        grad_dec = Z.T @ dif / len(X)
        grad_cod = X.T @ (dif @ W_dec.T) / len(X)
        W_dec -= tasa * grad_dec
        W_cod -= tasa * grad_cod
    return W_cod, W_dec


def error(X, W_cod, W_dec):
    return np.mean((X @ W_cod @ W_dec - X) ** 2, axis=1)  # error de reconstrucción de cada compra


print("\ncuello k | error normales | error fraudes | fraudes detectados")
for k in (1, 2, 4):
    W_cod, W_dec = entrenar(normales, k)
    e_norm, e_fraude = error(normales, W_cod, W_dec), error(fraudes, W_cod, W_dec)
    umbral = np.quantile(e_norm, 0.99)  # alarma si el error supera al del 99 % de las normales
    print(f"{k:8d} | {e_norm.mean():14.2f} | {e_fraude.mean():13.2f} | {np.sum(e_fraude > umbral):9d} de {len(fraudes)}")
```

- [ ] **Step 3: Generar y verificar la salida**

```bash
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py --update
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
git status --short src/components/ml-explorer/algorithms/python/
```
Expected: `✓` en todos los ejercicios; `git status` muestra como nuevos solo `autoencoders.py` y `autoencoders.out.txt` (los `.out.txt` anteriores se regeneran idénticos). El contenido de `autoencoders.out.txt` debe ser exactamente:

```text
1000 compras normales para entrenar y 10 fraudes que el modelo nunca ve

cuello k | error normales | error fraudes | fraudes detectados
       1 |           0.32 |          2.13 |         5 de 10
       2 |           0.03 |          1.93 |        10 de 10
       4 |           0.01 |          0.89 |        10 de 10
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/algorithms/python/outputs.test.ts`
Expected: PASS.

- [ ] **Step 4: Test de la OVA (falla)**

Crea `src/components/ml-explorer/ovas/AutoencoderOva.dom.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AutoencoderOva } from './AutoencoderOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const setK = (k: number) => fireEvent.change(screen.getByRole('slider'), { target: { value: String(k) } });

describe('AutoencoderOva', () => {
  it('k = 2: normales 0.012, fraudes 2.44, umbral 0.035 y los 3 fraudes detectados', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<AutoencoderOva />);
    expect(status(container)).toContain('Error medio: normales 0.012 · fraudes 2.44');
    expect(status(container)).toContain('Umbral: 0.035');
    expect(status(container)).toContain('Fraudes detectados: 3 de 3');
    expect(error).not.toHaveBeenCalled();
  });

  it('k = 1 detecta 1; k = 5 detecta 2; k = 6 copia todo y no detecta ninguno; Restablecer vuelve a k = 2', () => {
    const { container } = render(<AutoencoderOva />);
    setK(1);
    expect(status(container)).toContain('Fraudes detectados: 1 de 3');
    setK(5);
    expect(status(container)).toContain('Fraudes detectados: 2 de 3');
    setK(6);
    expect(status(container)).toContain('Error medio: normales 0 · fraudes 0');
    expect(status(container)).toContain('Fraudes detectados: 0 de 3');
    expect(status(container)).toContain('Sin cuello de botella');
    expect(container.querySelector('svg')?.textContent).not.toContain('la más rara');
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }));
    expect(status(container)).toContain('Fraudes detectados: 3 de 3');
  });

  it('el svg es una imagen con 43 barras (3 de fraude) y marca la compra más rara; el hint va fuera del readout', () => {
    const { container } = render(<AutoencoderOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('.mlx-ae-bar')).toHaveLength(43);
    expect(svg?.querySelectorAll('.mlx-ae-bar.is-fraud')).toHaveLength(3);
    expect(svg?.textContent).toContain('la más rara');
    const hint = screen.getByText(/copia todo, también el fraude/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
  });
});
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/AutoencoderOva.dom.test.tsx`
Expected: FAIL (`./AutoencoderOva` no existe).

- [ ] **Step 5: La OVA**

Crea `src/components/ml-explorer/ovas/AutoencoderOva.tsx`:

```tsx
import { useMemo, useState } from 'react';
import { AE_BOTTLENECK, AE_FRAUD, AE_NORMAL, AE_START_K } from './datasets';
import { OVA_COLORS, OvaFrame, OvaSlider } from './OvaFrame';
import { fitLinearAutoencoder, reconstructionError } from './ovaMath';

const W = 360;
const H = 220;
const TOP = 14;
const BOTTOM = 196;
/** Escala logarítmica: de 0.0001 (abajo) a 10 (arriba). Un error de 0 se dibuja abajo del todo. */
const [LOG_LO, LOG_HI] = [-4, 1];
const yOf = (e: number) => BOTTOM - ((Math.min(LOG_HI, Math.max(LOG_LO, Math.log10(e))) - LOG_LO) / (LOG_HI - LOG_LO)) * (BOTTOM - TOP);
/** Por debajo de esto el error es redondeo de la máquina: cuenta como 0. */
const ZERO = 1e-9;
const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const fmt = (e: number) => (e < ZERO ? '0' : e < 0.1 ? e.toFixed(3) : e.toFixed(2));

export function AutoencoderOva() {
  const [k, setK] = useState(AE_START_K);
  const { normal, fraud, threshold } = useMemo(() => {
    const ae = fitLinearAutoencoder(AE_NORMAL, k);
    const normal = AE_NORMAL.map((r) => reconstructionError(ae, r));
    return { normal, fraud: AE_FRAUD.map((r) => reconstructionError(ae, r)), threshold: Math.max(...normal) };
  }, [k]);
  const detected = fraud.filter((e) => e > threshold + ZERO).length;
  const errors = [...normal, ...fraud];
  const worst = errors.indexOf(Math.max(...errors));
  const barW = (W - 40) / errors.length;

  return (
    <OvaFrame
      title="Un cuello de botella que delata el fraude"
      hint="Cada barra es una compra y su altura es el error de reconstrucción: cuánto difiere la compra de su copia tras pasar por el cuello de botella. Las 40 azules son compras normales; las 3 rosas, fraudes que el autoencoder nunca vio. La línea punteada es el umbral: el mayor error entre las normales. El eje es logarítmico. Con k = 2 el autoencoder aprende el patrón de las normales y los fraudes quedan muy por encima. Si el cuello es tan ancho como la entrada (k = 6), copia todo, también el fraude. Este autoencoder es lineal: su mejor solución es la misma que da PCA."
      controls={
        <>
          <OvaSlider label="Cuello de botella k (de 6 medidas)" value={k} {...AE_BOTTLENECK} onChange={setK} />
          <button type="button" onClick={() => setK(AE_START_K)}>
            Restablecer
          </button>
        </>
      }
      readout={
        <>
          <span>
            Error medio: normales <b>{fmt(mean(normal))}</b> · fraudes <b>{fmt(mean(fraud))}</b>
          </span>
          <span>
            Umbral: <b>{fmt(threshold)}</b>
          </span>
          <span>
            Fraudes detectados: <b>{detected} de {fraud.length}</b>
          </span>
          {k === AE_BOTTLENECK.max && <span>Sin cuello de botella: reconstruye todo sin error y no detecta nada.</span>}
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Error de reconstrucción de 40 compras normales y 3 fraudes con un cuello de botella de ${k}; ${detected} fraudes por encima del umbral`}>
        {Array.from({ length: LOG_HI - LOG_LO + 1 }, (_, n) => {
          const v = 10 ** (LOG_HI - n);
          return (
            <g key={n}>
              <line x1={34} x2={W} y1={yOf(v)} y2={yOf(v)} stroke={OVA_COLORS.grid} />
              <text x={30} y={yOf(v) + 4} textAnchor="end" fontSize={10} fill={OVA_COLORS.axis}>
                {v >= 1 ? v : v.toFixed(n - LOG_HI)}
              </text>
            </g>
          );
        })}
        {errors.map((e, i) => {
          const isFraud = i >= normal.length;
          return (
            <rect
              key={i}
              className={isFraud ? 'mlx-ae-bar is-fraud' : 'mlx-ae-bar'}
              x={36 + i * barW}
              y={yOf(e)}
              width={barW - 1.5}
              height={BOTTOM - yOf(e)}
              fill={isFraud ? OVA_COLORS.risk : OVA_COLORS.class0}
            />
          );
        })}
        {errors[worst] > ZERO && (
          <text x={36 + worst * barW + barW / 2} y={Math.max(TOP + 8, yOf(errors[worst]) - 4)} textAnchor="middle" fontSize={11} fill={OVA_COLORS.risk}>
            ▼ la más rara
          </text>
        )}
        <line x1={34} x2={W} y1={yOf(threshold)} y2={yOf(threshold)} stroke={OVA_COLORS.accent} strokeWidth={1.5} strokeDasharray="5 4" />
        <text x={W - 2} y={yOf(threshold) - 4} textAnchor="end" fontSize={10} fill={OVA_COLORS.accent}>
          umbral
        </text>
        <text x={36} y={H - 4} fontSize={10} fill={OVA_COLORS.axis}>
          40 compras normales
        </text>
        <text x={W - 2} y={H - 4} textAnchor="end" fontSize={10} fill={OVA_COLORS.risk}>
          3 fraudes
        </text>
      </svg>
    </OvaFrame>
  );
}
```

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/components/ml-explorer/ovas/AutoencoderOva.dom.test.tsx`
Expected: PASS.

- [ ] **Step 6: El módulo del algoritmo**

Crea `src/components/ml-explorer/algorithms/autoencoders.tsx` (los textos ya pasan los tests de redacción: cópialos tal cual):

```tsx
import { G } from '../Gloss';
import { Tex } from '../Tex';
import { AutoencoderOva } from '../ovas/AutoencoderOva';
import type { AlgorithmModule } from '../types';
import code from './python/autoencoders.py?raw';
import expectedOutput from './python/autoencoders.out.txt?raw';

const autoencoders: AlgorithmModule = {
  slug: 'autoencoders',
  row: {
    type: 'No supervisado',
    bestUse: 'Comprimir datos y detectar anomalías',
    formula: 'Codificador + decodificador que minimizan el error de reconstrucción',
    assumptions: 'Los datos normales tienen una estructura que se puede comprimir',
    pros: 'Aprende compresiones no lineales',
    cons: 'Difícil de ajustar y de interpretar',
    whenNot: 'Cuando PCA basta o hay etiquetas de sobra',
    realWorld: 'Detección de fraude',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>
              <G k="noSupervisado">No supervisado</G>:
            </b>{' '}
            no necesita etiquetas. La respuesta que aprende a dar es la propia entrada: el{' '}
            <G k="autoencoder">autoencoder</G> es una <G k="redNeuronal">red neuronal</G> que aprende a copiar sus datos.
          </p>
          <p>
            El truco es que la copia pasa por un <G k="cuelloBotella">cuello de botella</G>: una capa con menos números
            que la entrada. Para copiar bien, la red tiene que aprender el patrón de los datos.
          </p>
          <p>
            <b>¿Cómo se evalúa sin etiquetas?</b> Con el <G k="reconstruccion">error de reconstrucción</G> en datos que
            no vio. Si se usa para detectar fraude, al final hay que revisar con casos conocidos cuántos atrapa.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Tiene dos mitades: el codificador comprime cada dato en unos pocos números (el código) y el decodificador lo
          reconstruye. Variantes: el que quita ruido (aprende a limpiar datos ensuciados a propósito) y el variacional,
          que aprende a generar datos nuevos parecidos a los de entrenamiento.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo para <b>detectar lo raro</b> cuando casi todos tus datos son normales y hay pocos o ningún ejemplo de
            lo anormal.
          </p>
          <ul>
            <li>Fraude en compras con tarjeta.</li>
            <li>Fallas incipientes en máquinas, con las lecturas de sus sensores.</li>
            <li>Comprimir imágenes o señales en pocos números para usarlos en otro modelo.</li>
          </ul>
          <p className="mlx-rule">
            Entrénalo solo con datos normales y marca como sospechoso lo que reconstruye mal.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Con <G k="desbalance">clases desbalanceadas</G> extremas (1 fraude cada 10 000 compras), un clasificador
          supervisado apenas ve ejemplos de fraude; el <G k="autoencoder">autoencoder</G> no los necesita para
          entrenar. Si los datos son imágenes, el codificador y el decodificador suelen ser{' '}
          <G k="redConvolucional">redes convolucionales</G>.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> cada compra del simulador tiene 6 medidas. El <G k="autoencoder">autoencoder</G> las
            comprime en k = 2 números y las vuelve a expandir a 6. Las compras normales siguen un patrón de 2 factores,
            así que se reconstruyen casi perfectas: error medio 0.012. Los fraudes no siguen el patrón: error medio 2.44.
          </p>
          <p>
            Con un <G k="umbral">umbral</G> igual al mayor error entre las normales (0.035), los 3 fraudes quedan por
            encima.
          </p>
          <Tex block>{'z = f(x), \\qquad \\hat{x} = g(z), \\qquad \\text{error}(x) = \\frac{1}{d}\\sum_{j=1}^{d} (x_j - \\hat{x}_j)^2'}</Tex>
          <p>
            <Tex>{'f'}</Tex> es el codificador, <Tex>{'z'}</Tex> el código (k números), <Tex>{'g'}</Tex> el
            decodificador y <Tex>{'d'}</Tex> el número de medidas. Se entrena para que el{' '}
            <G k="reconstruccion">error de reconstrucción</G> sea pequeño en los datos normales.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Si <Tex>{'f'}</Tex> y <Tex>{'g'}</Tex> son lineales y el error es cuadrático, la mejor solución codifica sobre
            los mismos k primeros <G k="componentePrincipal">componentes principales</G> que da{' '}
            <G k="pca">PCA</G> (Baldi y Hornik, 1989). El simulador usa esa solución exacta; el ejercicio de Python llega
            a ella con <G k="descensoGradiente">descenso de gradiente</G>.
          </p>
          <p>
            Lo que distingue al autoencoder de PCA son las <G k="capaOculta">capas ocultas</G> con{' '}
            <G k="funcionActivacion">funciones de activación</G>: con ellas comprime estructuras curvas. Se entrena como cualquier red, con{' '}
            <G k="retropropagacion">retropropagación</G>.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que <b>lo normal tiene un patrón que se puede comprimir</b> y que lo raro no lo sigue. Si las compras
            normales fueran puro azar, no habría nada que aprender y todo se reconstruiría igual de mal.
          </p>
          <p>
            También supone que los datos de entrenamiento son normales. Si están llenos de fraudes, el{' '}
            <G k="autoencoder">autoencoder</G> aprende a reconstruirlos y deja de detectarlos.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Las <G k="feature">features</G> deben estar en escalas parecidas (
          <G k="escalado">estandarizadas</G>): si no, el error de una medida grande tapa el de las demás. En el
          ejercicio ya están estandarizadas.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>No necesita ejemplos de fraude:</b> aprende solo con compras normales. En el ejercicio, ninguno de los 10
            fraudes se usó para entrenar.
          </li>
          <li>
            <b>Compresión no lineal:</b> con <G k="capaOculta">capas ocultas</G> capta curvas que <G k="pca">PCA</G> no
            ve.
          </li>
          <li>
            <b>Una señal fácil de usar:</b> el <G k="reconstruccion">error de reconstrucción</G> es un número por dato;
            basta elegir un <G k="umbral">umbral</G>.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          El error de cada medida también orienta la revisión: si una compra se reconstruye mal sobre todo en «distancia
          a casa», esa es la medida que se salió del patrón. El código del{' '}
          <G k="cuelloBotella">cuello de botella</G> sirve además como <G k="feature">features</G> compactas para otro
          modelo.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>El tamaño del cuello es delicado:</b> en el ejercicio, con k = 1 solo detecta 5 de 10 fraudes; con 2,
            los 10. Si es tan ancho como la entrada, copia todo, también el fraude.
          </li>
          <li>
            <b>Difícil de ajustar:</b> capas, <G k="neurona">neuronas</G>, <G k="epoca">épocas</G> y{' '}
            <G k="umbral">umbral</G>, sin etiquetas que digan cuál es mejor.
          </li>
          <li>
            <b>Falsas alarmas:</b> lo raro no siempre es fraude; un cliente que viaja por primera vez también
            reconstruye mal.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          En el simulador, con k = 5 se escapa un fraude y con k = 6 no detecta ninguno: el{' '}
          <G k="autoencoder">autoencoder</G> reconstruye todo sin error. En el ejercicio, con k = 4 el error medio de los
          fraudes ya baja de 1.93 a 0.89. Contra eso: elegir k con datos de validación que tengan algunas{' '}
          <G k="anomalia">anomalías</G> conocidas.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses si un <G k="pca">PCA</G> ya resuelve el problema o si tienes muchos ejemplos etiquetados.</p>
          <p>
            Ejemplo: si tienes 50 000 fraudes confirmados, entrena un clasificador supervisado (Random Forest o
            Gradient Boosting): aprende directamente qué distingue al fraude. Y si los datos son pocos y el patrón es
            lineal, PCA da lo mismo sin entrenar una red.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Con pocas medidas y <G k="anomalia">anomalías</G> que son puntos aislados en el espacio, DBSCAN o Isolation
          Forest (un <G k="ensamble">ensamble</G> de árboles que aísla lo raro con pocos cortes) son más simples y fáciles de explicar.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Detección de fraude.</b> Los bancos marcan compras sospechosas comparándolas con el patrón normal de
            cada cliente; un <G k="autoencoder">autoencoder</G> es una de las herramientas para aprender ese patrón.
          </p>
          <p>
            El ejercicio entrena un autoencoder lineal con 1 000 compras normales simuladas y lo prueba con 10 fraudes.
            Con un <G k="cuelloBotella">cuello de botella</G> de 1 número detecta 5 de 10; con 2, los 10, con un error
            medio de 0.03 en normales y 1.93 en fraudes. La alarma salta si el error supera al del 99 % de las compras
            normales.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            En producción el <G k="umbral">umbral</G> se fija según el costo de revisar una alarma contra el de dejar
            pasar un fraude, y se vigila que el patrón normal no cambie con el tiempo.
          </p>
          <p>
            El notebook de Colab trae, como celda opcional, un <G k="autoencoder">autoencoder</G> no lineal en{' '}
            <G k="pytorch">PyTorch</G>, con una <G k="capaOculta">capa oculta</G> antes y después del cuello.
          </p>
        </>
      ),
    },
  },
  Ova: AutoencoderOva,
  python: { code, expectedOutput, colabNotebook: 'autoencoders' },
  inYourField: [
    { area: 'Mecánica', example: 'avisar cuando las vibraciones de una bomba dejan de parecerse a las de su funcionamiento normal.' },
    { area: 'Eléctrica', example: 'detectar medidores con consumos que no siguen el patrón de su zona (posibles fraudes o fallas).' },
    { area: 'Industrial', example: 'marcar lotes de producción cuyas mediciones de calidad se salen del patrón habitual.' },
  ],
  alternatives: ['pca', 'dbscan'],
};

export default autoencoders;
```

- [ ] **Step 7: Registrar el loader**

En `registry.ts`, dentro de `LOADERS`, justo después de

```ts
  transformer: () => import('./algorithms/transformer'),
```

añade:

```ts
  autoencoders: () => import('./algorithms/autoencoders'),
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
      'mlp',
      'cnn',
      'rnn',
      'transformer',
      'autoencoders',
    ]);
    expect(AVAILABLE_SLUGS).toHaveLength(ALGORITHMS.length);
```

(La última línea es nueva: con esta task los 17 algoritmos del cheatsheet quedan disponibles.)

- [ ] **Step 8: Recorrido con el módulo real**

Añade al final de `src/components/ml-explorer/MLExplorer.real.dom.test.tsx` (el helper `tourRealAlgorithm` lo creó la Task 4):

```tsx
it('Autoencoders real (?alg=autoencoders): recorre las 8 pestañas sin errores', async () => {
  await tourRealAlgorithm('autoencoders', 'Autoencoders', 'Fraudes detectados: 3 de 3');
});
```

- [ ] **Step 9: Notebook de Colab y su celda opcional de PyTorch**

En `scripts/build-ml-notebook.py`, dentro de `ALGORITHMS`, justo después de la tupla de "transformer":

```python
    (
        "autoencoders",
        "Autoencoders (autocodificadores)",
        "Detector de fraude sin etiquetas: el error de reconstrucción delata las compras raras.",
    ),
```

Crea `scripts/ml-pytorch/autoencoders.py` (no lo leen los verificadores: no está en `algorithms/python/`):

```python
# Opcional: un autoencoder no lineal en PyTorch (Colab ya lo trae instalado; en el navegador no corre).
# Usa `normales` y `fraudes` de la celda anterior. Sus cifras no tienen por qué coincidir con las del lineal.
try:
    import torch
    from torch import nn
except ImportError:
    print("PyTorch no está instalado: esta celda es opcional.")
else:
    torch.manual_seed(0)
    N_pt = torch.tensor(normales, dtype=torch.float32)
    F_pt = torch.tensor(fraudes, dtype=torch.float32)
    modelo = nn.Sequential(  # 6 → 4 → 2 (cuello de botella) → 4 → 6
        nn.Linear(6, 4), nn.Tanh(), nn.Linear(4, 2),
        nn.Linear(2, 4), nn.Tanh(), nn.Linear(4, 6),
    )
    opt = torch.optim.Adam(modelo.parameters(), lr=0.01)
    for _ in range(2000):
        opt.zero_grad()
        perdida = ((modelo(N_pt) - N_pt) ** 2).mean()
        perdida.backward()
        opt.step()
    with torch.no_grad():
        e_norm = ((modelo(N_pt) - N_pt) ** 2).mean(dim=1)
        e_fraude = ((modelo(F_pt) - F_pt) ** 2).mean(dim=1)
    umbral = torch.quantile(e_norm, 0.99)
    print(f"PyTorch, cuello de 2: detecta {(e_fraude > umbral).sum().item()} de {len(F_pt)} fraudes")
```

```bash
python3 scripts/build-ml-notebook.py
```
Expected: `Escrito notebooks/algoritmos-ml.ipynb y 17 notebooks individuales`.

- [ ] **Step 10: Description del artículo**

En `src/data/articles/algoritmos-ml-explorador.md`, en la línea `description:`, cambia «Los primeros dieciséis ya están completos; el resto llega por entregas.» por «Los diecisiete ya están completos.».

Con todos disponibles ya no son «los primeros». En `src/data/articles/algoritmos-ml-explorador.links.test.ts` reemplaza

```ts
    expect(description).toContain(`Los primeros ${NUMBER_WORDS[AVAILABLE_SLUGS.length]} ya están completos`);
```
por

```ts
    const n = NUMBER_WORDS[AVAILABLE_SLUGS.length];
    // Con todos disponibles ya no son «los primeros»: son todos.
    const phrase = AVAILABLE_SLUGS.length === ALGORITHMS.length ? `Los ${n} ya están completos` : `Los primeros ${n} ya están completos`;
    expect(description).toContain(phrase);
```

- [ ] **Step 11: Verificación completa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
node scripts/check-ml-exercises-pyodide.mjs
```
Expected: todos los tests pasan (incluidos `registry.test.ts`, que comprueba que las alternativas de `autoencoders` existen; `notebook.test.ts`, que compara los notebooks con el `.py` y revisa la celda opcional de PyTorch; `glossaryTerms.test.ts`, `glossaryDensity.test.ts`, `textSpacing.test.ts`, `render.test.ts` y `ovaHints.test.ts` sobre los textos nuevos; y `algoritmos-ml-explorador.links.test.ts`); `tsc` sin errores; `✓ autoencoders.py (Pyodide)` y los demás también.

Revisión manual con el servidor de desarrollo (`ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js`), en `#/articles/algoritmos-ml-explorador?alg=autoencoders&tab=formula`: la OVA responde al teclado (Tab hasta los controles, flechas en los sliders, Enter/Espacio en los botones), las cifras iniciales coinciden con la tabla «Cifras clave», las fichas 💡 abren, y en «Ejemplo real» «▶ Ejecutar» da la misma salida que la esperada.

- [ ] **Step 12: Commit**

```bash
git add src/components/ml-explorer/algorithms/python/autoencoders.py \
  src/components/ml-explorer/algorithms/python/autoencoders.out.txt \
  src/components/ml-explorer/algorithms/python/outputs.test.ts \
  src/components/ml-explorer/ovas/AutoencoderOva.tsx \
  src/components/ml-explorer/ovas/AutoencoderOva.dom.test.tsx \
  src/components/ml-explorer/algorithms/autoencoders.tsx \
  src/components/ml-explorer/registry.ts \
  src/components/ml-explorer/registry.test.ts \
  src/components/ml-explorer/MLExplorer.real.dom.test.tsx \
  scripts/build-ml-notebook.py \
  scripts/ml-pytorch/autoencoders.py \
  ../notebooks/algoritmos-ml.ipynb \
  ../notebooks/algoritmos-ml/autoencoders.ipynb \
  src/data/articles/algoritmos-ml-explorador.md \
  src/data/articles/algoritmos-ml-explorador.links.test.ts
git commit -m "feat(ml-explorer): add Autoencoders with their bottleneck simulator and exercise

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Artículo, verificación final, build y deploy

**Files:**
- Modify: `src/data/articles/algoritmos-ml-explorador.md`
- Modify: `src/pages/ArticleDetail.ml.dom.test.tsx`
- Build outputs en la raíz del repo (`../index.html`, `../assets/*`)

- [ ] **Step 1: El test de integración del artículo espera 17 enlaces (falla)**

En `src/pages/ArticleDetail.ml.dom.test.tsx`, cambia `expect(internal).toHaveLength(8);` por `expect(internal).toHaveLength(17);` (los 8 de las fases 1 y 2, los 4 de la fase 3 que faltaban y los 5 de esta fase).

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/pages/ArticleDetail.ml.dom.test.tsx`
Expected: FAIL (`expected … to have a length of 17 but got 8`).

- [ ] **Step 2: Enlaces en la guía «¿Qué algoritmo necesito?» y en el resto del artículo**

En `src/data/articles/algoritmos-ml-explorador.md` reemplaza cinco líneas. La del menú:

```markdown
- **Menú izquierdo:** un algoritmo por fila del cheatsheet. Los marcados «pronto» llegan en las próximas entregas.
```

por

```markdown
- **Menú izquierdo:** un algoritmo por fila del cheatsheet, agrupados por familia.
```

(ya no hay algoritmos «pronto»; el artículo todavía no ha explicado «redes neuronales», así que la línea no las nombra). La pregunta 1:

```markdown
1. **Antes de todo: ¿tus datos son imágenes, texto, audio o series largas?** Entonces mira las redes neuronales (modelos de muchas capas que aprenden por sí solos qué mirar en los datos): CNN (para imágenes), RNN (para secuencias) o Transformer (para texto) *(próximamente)*. Si no, sigue con la pregunta 2.
```

por

```markdown
1. **Antes de todo: ¿tus datos son imágenes, texto, audio o series largas?** Entonces mira las redes neuronales (modelos de muchas capas que aprenden por sí solos qué mirar en los datos): [CNN](#/articles/algoritmos-ml-explorador?alg=cnn&tab=type) (red convolucional, para imágenes), [RNN](#/articles/algoritmos-ml-explorador?alg=rnn&tab=type) (red recurrente, para secuencias) o [Transformer](#/articles/algoritmos-ml-explorador?alg=transformer&tab=type) (la red de ChatGPT, para texto). Si no, sigue con la pregunta 2.
```

La rama «No» de la pregunta 2 (con los 4 enlaces de la fase 3 que no se aplicaron y el de Autoencoders):

```markdown
   - **No → aprendizaje no supervisado** (el modelo busca grupos o patrones sin respuesta). ¿Buscas grupos? K-Means, Hierarchical Clustering o DBSCAN *(próximamente)*. ¿Quieres resumir muchas columnas en pocas? PCA (análisis de componentes principales) *(próximamente)*.
```

por

```markdown
   - **No → aprendizaje no supervisado** (el modelo busca grupos o patrones sin respuesta). ¿Buscas grupos? Si esperas grupos compactos y tienes una idea de cuántos, [K-Means](#/articles/algoritmos-ml-explorador?alg=k-means&tab=type); si quieres ver grupos dentro de grupos y tienes pocos miles de datos, [Hierarchical Clustering](#/articles/algoritmos-ml-explorador?alg=hierarchical-clustering&tab=type); si los grupos tienen formas irregulares o hay puntos sueltos, [DBSCAN](#/articles/algoritmos-ml-explorador?alg=dbscan&tab=type). ¿Quieres resumir muchas columnas en pocas? [PCA](#/articles/algoritmos-ml-explorador?alg=pca&tab=type) (análisis de componentes principales). ¿Quieres detectar casos raros, como fraudes o fallas, sin ejemplos etiquetados? [Autoencoders](#/articles/algoritmos-ml-explorador?alg=autoencoders&tab=type).
```

La rama «No, lo que importa es acertar» de la pregunta 4:

```markdown
   - **No, lo que importa es acertar:** [Random Forest](#/articles/algoritmos-ml-explorador?alg=random-forest&tab=type), [Gradient Boosting](#/articles/algoritmos-ml-explorador?alg=gradient-boosting&tab=type) o [SVM](#/articles/algoritmos-ml-explorador?alg=svm&tab=type).
```

por

```markdown
   - **No, lo que importa es acertar:** [Random Forest](#/articles/algoritmos-ml-explorador?alg=random-forest&tab=type), [Gradient Boosting](#/articles/algoritmos-ml-explorador?alg=gradient-boosting&tab=type) o [SVM](#/articles/algoritmos-ml-explorador?alg=svm&tab=type). Con muchos datos y relaciones muy enredadas, también una red neuronal [MLP](#/articles/algoritmos-ml-explorador?alg=mlp&tab=type) (perceptrón multicapa).
```

Y en «Cómo seguir»:

```markdown
- Cambia los datos de un ejercicio por los de tu trabajo: todos usan solo numpy, scikit-learn y matplotlib (bibliotecas de Python para cálculo, machine learning y gráficas).
```

por

```markdown
- Cambia los datos de un ejercicio por los de tu trabajo: todos usan solo numpy, scikit-learn y matplotlib (bibliotecas de Python para cálculo, machine learning y gráficas). En Colab, las cinco redes neuronales traen además una celda opcional con PyTorch, la biblioteca de redes que se usa en la práctica.
```

`CNN`, `RNN` y `Transformer` siguen explicados entre paréntesis la primera vez que aparecen, y `PCA` también (lo comprueba `algoritmos-ml-explorador.links.test.ts`: acepta el paréntesis después del cierre del enlace, con 8 caracteres o más y sin «próximamente»). En el artículo ya no queda ningún «(próximamente)».

- [ ] **Step 3: Verificar**

Run: `ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run src/pages/ArticleDetail.ml.dom.test.tsx src/data/articles/algoritmos-ml-explorador.links.test.ts`
Expected: PASS (los 17 enlaces apuntan a algoritmos disponibles y a pestañas válidas).

- [ ] **Step 4: Commit**

```bash
git add src/data/articles/algoritmos-ml-explorador.md src/pages/ArticleDetail.ml.dom.test.tsx
git commit -m "docs(article): link all 17 algorithms from the ML explorer guide

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Verificación completa**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit -p .
~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py
node scripts/check-ml-exercises-pyodide.mjs
```

Salida verificada en la copia `v4` (con este mismo código):

```text
 Test Files  47 passed (47)
      Tests  643 passed (643)
```

`tsc` sin salida (sin errores), y los dos verificadores:

```text
✓ autoencoders.py
✓ cnn.py
✓ dbscan.py
✓ decision-tree.py
✓ gradient-boosting.py
✓ hierarchical-clustering.py
✓ k-means.py
✓ knn.py
✓ linear-regression.py
✓ logistic-regression.py
✓ mlp.py
✓ naive-bayes.py
✓ pca.py
✓ random-forest.py
✓ rnn.py
✓ svm.py
✓ transformer.py
```

```text
✓ autoencoders.py (Pyodide)
✓ cnn.py (Pyodide)
✓ dbscan.py (Pyodide)
✓ decision-tree.py (Pyodide)
✓ gradient-boosting.py (Pyodide)
✓ hierarchical-clustering.py (Pyodide)
✓ k-means.py (Pyodide)
✓ knn.py (Pyodide)
✓ linear-regression.py (Pyodide)
✓ logistic-regression.py (Pyodide)
✓ mlp.py (Pyodide)
✓ naive-bayes.py (Pyodide)
✓ pca.py (Pyodide)
✓ random-forest.py (Pyodide)
✓ rnn.py (Pyodide)
✓ svm.py (Pyodide)
✓ transformer.py (Pyodide)
```

(Si se añadieron tests después de `9eba571`, el número de tests será mayor; ninguno debe fallar.)

Ejecuta el notebook completo de punta a punta con el Python de verificación (sin PyTorch: las 5 celdas opcionales solo avisan):

```bash
~/.cache/mlx-venv/bin/python -c "import nbformat, nbclient; nb = nbformat.read('../notebooks/algoritmos-ml.ipynb', 4); nbclient.NotebookClient(nb, kernel_name='mlx-venv', timeout=180).execute(); print('notebook OK')"
```
Expected: `notebook OK` (verificado en `v4`; el aviso `Kernel is running over TCP without encryption` es normal).

Si tienes PyTorch de usuario (ver Convenciones), repite con él para comprobar las celdas opcionales:

```bash
~/.cache/mlx-venv/bin/python - <<'EOF'
import nbformat, nbclient
nb = nbformat.read('../notebooks/algoritmos-ml.ipynb', 4)
nb.cells.insert(0, nbformat.v4.new_code_cell("import sys; sys.path.append('/home/stivenson/.local/lib/python3.12/site-packages')"))
nbclient.NotebookClient(nb, kernel_name='mlx-venv', timeout=600).execute()
for c in nb.cells:
    if c.get('id', '').endswith('-pytorch'):
        print(c.id, '→', ''.join(o.get('text', '') for o in c.outputs).strip().replace('\n', ' | '))
EOF
```
Expected (verificado en `v4` con PyTorch 2.11 CPU; la cifra del MLP puede variar con otra versión de PyTorch y ningún texto la cita):

```text
mlp-pytorch → PyTorch, 32 neuronas ocultas: 97.0% en datos nuevos
cnn-pytorch → Filtro vertical: ¿PyTorch da el mismo mapa que la versión a mano? True | Filtro horizontal: ¿PyTorch da el mismo mapa que la versión a mano? True
rnn-pytorch → PyTorch con T = 10, w = 0.9: ∂h_T/∂x_1 = 0.0242
transformer-pytorch → ¿Mismos pesos que NumPy? True | ¿Misma salida con scaled_dot_product_attention? True
autoencoders-pytorch → PyTorch, cuello de 2: detecta 10 de 10 fraudes
```

- [ ] **Step 6: Build**

Usa el skill `/portfolio-build` (tsc + vite build + actualización de hashes, con el arreglo de NTFS). Expected: build exitoso, con chunks separados (tamaños medidos en `v4`; los hashes cambiarán):

```text
../assets/rnn-<hash>.js            13.75 kB │ gzip: 5.40 kB
../assets/autoencoders-<hash>.js   15.49 kB │ gzip: 5.54 kB
../assets/mlp-<hash>.js            16.19 kB │ gzip: 6.16 kB
../assets/cnn-<hash>.js            16.30 kB │ gzip: 5.93 kB
../assets/transformer-<hash>.js    17.67 kB │ gzip: 6.25 kB
✓ built in 17.79s
✅ index.html OK — todos los assets referenciados existen (generado por vite).
```

El aviso `Unexpected "-" [css-syntax-error]` del minificador de CSS ya existía antes de esta fase y no lo causa este plan.

- [ ] **Step 7: Revisión en el navegador (build de producción)**

```bash
ESBUILD_BINARY_PATH=/tmp/esbuild-bin node node_modules/vite/bin/vite.js preview
```
En `#/articles/algoritmos-ml-explorador`:
1. El menú muestra los 17 algoritmos disponibles, ninguno «pronto»: los 5 nuevos bajo «Redes neuronales».
2. Al pasar el mouse por «CNN» se descarga solo `cnn-*.js`.
3. En las 5 OVAs nuevas, las cifras iniciales coinciden con la tabla «Cifras clave de las OVAs» de este plan. En la CNN, «▶ Reproducir» lleva el recuadro hasta «Posición 36 de 36» (el recuadro se desliza) y se pausa si la OVA sale de la pantalla; con «reducir movimiento» activado en el sistema, salta al final.
4. Ejecuta los 5 ejercicios nuevos: cada «Tu salida» coincide con la «Salida esperada» y no aparece ningún aviso en rojo (el del MLP está silenciado). El MLP tarda unos segundos.
5. En la pestaña «Tipo» de las 5 redes aparece la mini-figura de «Redes neuronales».
6. Los enlaces nuevos de la guía «¿Qué algoritmo necesito?» llevan a cada algoritmo, en la pestaña «Tipo», incluidos K-Means, Hierarchical Clustering, DBSCAN y PCA.
7. En «Cuándo no usarlo» de Gradient Boosting, Naive Bayes y PCA, «Neural Networks (MLP)», «Transformer (BERT, GPT)» y «Autoencoders» ya son botones activos (con «→»).
8. «Abrir en Colab» de la CNN abre `notebooks/algoritmos-ml/cnn.ipynb` con la celda del ejercicio y, debajo, la nota y la celda opcional de PyTorch.
9. Repite a 375 px de ancho: los 9 sliders del MLP (en tres grupos), los botones de la CNN y los cuatro grupos de botones del Transformer caben sin desbordar; el mapa de la CNN se lee.

- [ ] **Step 8: Deploy**

Usa el skill `/portfolio-deploy`. Pide confirmación al usuario antes del commit y push, como indica el skill. Sube solo `index.html`, los assets nuevos y los cambios de esta fase; no subas los cambios ajenos que ya estaban sin commit en el árbol.

Tras el push, comprueba en `https://stivenson.github.io/#/articles/algoritmos-ml-explorador?alg=transformer&tab=realWorld` que el explorador carga y que «Abrir en Colab» abre `notebooks/algoritmos-ml/transformer.ipynb`.

---

## Riesgos y decisiones

- **MLP con 9 sliders.** El spec pide «un solo control principal», pero también «pesos en sliders»; la red 2-2-1 tiene 9 pesos. Se agruparon por neurona (`role="group"` con nombre) y hay un botón «Ver una solución». El «aha» es uno: con la oculta 2 apagada no se pasa de 15 de 20 (lo máximo de una recta, fijado por test), y al encenderla se llega a 20.
- **El MLP del ejercicio no converge del todo.** Con `max_iter=150` las tres redes paran antes (en CPython, con 500 épocas, dan 67.4 %, 95.7 % y 97.8 %: el orden no cambia y el texto lo dice sin cifras). Se eligió por el tiempo en Pyodide: con 500 épocas o con 128 neuronas pasaba de 10 s. El `ConvergenceWarning` se silencia en el código, con un comentario, porque el navegador muestra stderr. Si una versión futura de scikit-learn cambia los defaults, `outputs.test.ts` lo detecta.
- **BLAS distinto, misma salida.** CPython usa scipy-openblas y Pyodide su propio BLAS; el MLP entrena con productos de matrices en ambos. Con porcentajes de 1 decimal y probabilidades sin decimales la salida es idéntica (verificado byte a byte); si alguna vez difiere, la salida a cambiar es la del MLP (menos decimales o menos épocas), no el texto.
- **RNN: medición de memoria y no predicción de una serie.** El spec decía «predicción de una serie con una RNN mínima»; el encargo de esta fase pide «una RNN mínima con un gradiente que se desvanece». Entrenar una RNN para predecir en 25 líneas de NumPy no mostraría el desvanecimiento con claridad; el ejercicio mide la influencia del primer dato (lo que retropropaga BPTT), con comprobación numérica y con PyTorch (0.0242 los tres). La historia se cuenta como consumo de energía hora a hora.
- **La OVA de la RNN usa 30 mediciones redondeadas a 2 decimales; el ejercicio, 50 sin redondear.** Con las cifras que se muestran coinciden (0.024 y 2.4e-02 con 10 pasos; 6.2e-6 y 6.2e-06 con 20), pero no tienen por qué coincidir en general: cada texto cita la cifra de su fuente (la OVA o el ejercicio) y ambas están fijadas en su test.
- **Transformer sin texto libre.** El spec dice «escribir una frase»; un modelo de juguete con embeddings escritos a mano solo conoce 6 palabras, y un campo libre mostraría casi siempre «palabra desconocida». Se ofrecen 2 frases con botones, más invertir el orden, la codificación posicional y la máscara causal. Q = K = V = X (sin matrices aprendidas) para que los números se puedan seguir a mano; el texto lo dice.
- **Autoencoder de la OVA calculado exacto (PCA).** Entrenar con descenso de gradiente en el navegador sería lento y daría cifras que dependen del número de pasos. Con error cuadrático, el autoencoder lineal óptimo codifica sobre los mismos componentes que PCA (Baldi y Hornik, 1989); el hint y la pestaña Fórmula lo dicen. El ejercicio de Python sí entrena con descenso de gradiente, y por eso no imprime k = 6 (ver Regla 8).
- **Celdas de PyTorch como celdas de código, no como markdown.** En Colab se ejecutan con un clic; fuera de Colab, `try/except ImportError` evita el fallo. `notebook.test.ts` admite la celda `<slug>-pytorch` en el notebook individual (sigue exigiendo una sola celda del ejercicio, idéntica al `.py`) y comprueba que va justo después del ejercicio y que atrapa el `ImportError`. Usan variables de la celda anterior (`X_tr`, `imagen`, `x`, `emb`, `normales`…); en el notebook completo cada una va inmediatamente después de su ejercicio, así que no hay choques de nombres (verificado ejecutándolo entero con PyTorch).
- **«Próximamente» deja de existir en el registry real.** El caso deshabilitado se prueba ahora con el registry falso (`testRegistry.tsx`, «gamma»); el test del menú en `render.test.ts` sigue pasando con 0 elementos «pronto», y `registry.test.ts` exige que los 17 estén disponibles.
- **Ejercicios de 27 a 63 líneas** (el spec pide 10-25). Como en las fases anteriores, se priorizó que cuenten la historia completa; el del Transformer es el más largo porque imprime tres mapas y el efecto de la posición.
- **Cifras históricas sin test.** AlexNet (2012, error top-5 de 15 % contra 26 %), el Transformer (2017) y Baldi y Hornik (1989) no salen de una ejecución; son las únicas cifras de los textos que no están fijadas en un test.
