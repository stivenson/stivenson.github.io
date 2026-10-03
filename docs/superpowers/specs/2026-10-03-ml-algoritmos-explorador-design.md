# Explorador de algoritmos de ML — Design Spec

**Date:** 2026-10-03
**Status:** Approved (diseño); pendiente revisión del spec escrito

## Overview

Artículo nuevo del portafolio que convierte el cheatsheet «Machine Learning Algorithms» (17 algoritmos × 8 columnas) en un explorador interactivo:

- **Menú izquierdo** = las 17 filas del cheatsheet (un algoritmo por entrada).
- **Pestañas** = las 8 columnas: Tipo · Mejor caso de uso · Fórmula/lógica · Supuestos · Pros · Contras · Cuándo no usarlo · Ejemplo real.
- Cada algoritmo trae una **OVA** interactiva (pestaña Fórmula) y un **ejercicio breve de Python** ejecutable en el navegador con Pyodide (pestaña Ejemplo real), más un notebook de Colab.

### Audiencia

1. **Estudiantes de Datos y Sistemas**: quieren el porqué, la matemática y los hiperparámetros.
2. **Profesionales de ingenierías relacionadas o no** (civil, industrial, eléctrica, etc.): quieren saber cuándo y cómo aplicar cada algoritmo, sin prerrequisitos de ML.

Toda la redacción sigue `docs/redaccion/guia-facil-comprension.md`: conclusión primero, ejemplo numérico antes de la fórmula, analogías de 1-2 frases o ninguna, jerga en glosario 💡, cifras con sus condiciones.

## Decisiones confirmadas

| Dimensión | Decisión |
|---|---|
| Contenedor | Artículo `.md` normal que incrusta un componente React `<ml-explorer>` (no iframe, no página aparte) |
| Carga | Diferida por algoritmo: cada algoritmo es un chunk `import()` que baja solo al seleccionarlo |
| Python | Pyodide (numpy, scikit-learn, matplotlib) en Web Worker, cargado al primer «Ejecutar» + notebook Colab único |
| OVAs | Componentes React (SVG/canvas) dentro del chunk de cada algoritmo, no HTML en `/ovas/` |
| Ubicación OVA/Python | OVA en pestaña «Fórmula/lógica»; Python en «Ejemplo real»; mini-demos opcionales en «Supuestos» y «Contras» |
| Redes profundas | Ejercicios en NumPy puro (PyTorch no corre en Pyodide); PyTorch solo como celdas opcionales en Colab |
| Entrega | 4 fases, cada una con build + deploy revisable |
| Profundidad | Dos capas por pestaña: «Lo esencial» (visible) + «▸ Para profundizar» (plegado) |
| Idioma | Español; nombres de algoritmos en inglés con traducción entre paréntesis |

## Arquitectura

```
portfolio-spa/src/
  data/articles/algoritmos-ml-explorador.md   intro, guía «¿Qué algoritmo necesito?», <ml-explorer>, cierre
  data/articles/index.ts                      + registro del artículo
  components/MarkdownRenderer.tsx             + mapeo del tag `ml-explorer` → <MLExplorer/>
  components/ml-explorer/
    MLExplorer.tsx        layout menú + panel; estado ↔ query de la URL
    AlgorithmMenu.tsx     17 entradas agrupadas: Supervisado · No supervisado · Reducción de dimensionalidad · Redes neuronales
    AlgorithmTabs.tsx     8 pestañas (estilo coherente con RichTabPanel)
    SummaryChips.tsx      barra-chuleta con la fila completa del cheatsheet
    DeepDive.tsx          bloque plegable «▸ Para profundizar»
    Gloss.tsx             término de glosario 💡 (reutiliza las clases .gl-* existentes)
    InYourField.tsx       chips «En tu área»
    PythonRunner.tsx      editor, «Ejecutar», «Restaurar», salida, «Abrir en Colab»
    pyodideWorker.ts      Web Worker: carga Pyodide + paquetes, ejecuta, devuelve stdout/stderr/PNG
    registry.ts           metadatos livianos (slug, nombre, nombre ES, icono, grupo, tipo) + loader import()
    types.ts              AlgorithmModule y tipos de pestañas
    algorithms/
      <slug>.tsx          un módulo por algoritmo (= un chunk)
      ovas/<Nombre>Ova.tsx
notebooks/algoritmos-ml.ipynb                 crece fase a fase
scripts/check-ml-exercises.py                 corre los ejercicios en CPython y compara con la salida esperada
```

### Contrato de un módulo de algoritmo

```ts
interface AlgorithmModule {
  slug: string;
  row: Record<TabId, string>;               // texto literal de la fila del cheatsheet (en español)
  tabs: Record<TabId, { essential: ReactNode; deepDive?: ReactNode; demo?: ComponentType }>;
  Ova: ComponentType;                       // obligatoria, va en la pestaña «formula»
  python: { code: string; expectedOutput: string; colabAnchor: string };
  inYourField: { area: string; example: string }[];  // 3 entradas
  alternatives: string[];                   // slugs sugeridos en «Cuándo no usarlo»
}
```

`registry.ts` expone `loadAlgorithm(slug): Promise<AlgorithmModule>` con `import()` dinámico por slug. Al entrar al artículo solo baja el registry y el layout.

### Estado y URL

El algoritmo y la pestaña activos viven en la query del hash: `#/articles/algoritmos-ml-explorador?alg=knn&tab=cons`. Así se puede compartir el enlace a una pestaña concreta y el botón «atrás» funciona. Si `alg` o `tab` no son válidos, se ignoran y se abre el primer algoritmo con la pestaña «tipo».

### Responsive

- Escritorio: menú fijo a la izquierda (sticky) y panel a la derecha.
- Móvil (≤ 768 px): el menú se vuelve un selector desplegable arriba y las pestañas un carrusel con scroll horizontal. Se valida a 375 px.

## Contenido por pestaña

Cada pestaña muestra arriba la frase original de la columna del cheatsheet, luego «Lo esencial» y, plegado, «▸ Para profundizar».

| # | Pestaña (`TabId`) | Lo esencial | Para profundizar |
|---|---|---|---|
| 1 | Tipo (`type`) | Qué significa supervisado/no supervisado/reducción, en 2 frases + mini-figura | Formulación del problema de aprendizaje |
| 2 | Mejor caso de uso (`bestUse`) | Por qué encaja + 2-3 casos concretos | Tamaño de datos y dimensionalidad típicos |
| 3 | Fórmula / lógica (`formula`) | Ejemplo numérico paso a paso → fórmula en KaTeX → **OVA** | Derivación, función de costo, complejidad, hiperparámetros clave |
| 4 | Supuestos (`assumptions`) | Qué pasa si no se cumple; mini-demo opcional | Justificación formal del supuesto |
| 5 | Pros (`pros`) | 3 bullets, cada uno con su «por qué» | Comparación cuantitativa cuando aplique |
| 6 | Contras (`cons`) | 3 bullets; mini-demo del fallo opcional | Causas técnicas y mitigaciones |
| 7 | Cuándo no usarlo (`whenNot`) | Regla práctica + **qué usar en su lugar** (enlace a otra fila del menú) | Casos límite |
| 8 | Ejemplo real (`realWorld`) | El caso de la imagen + **ejercicio Python** + «En tu área» (3 chips de otras ingenierías) | Cómo escalarlo a producción |

Reglas:
- OVA obligatoria en los 17 algoritmos. Mini-demos de «Supuestos» y «Contras» solo si enseñan algo.
- Cada OVA tiene un solo control principal y un solo «aha». Pausa su animación fuera del viewport y respeta `prefers-reduced-motion`.
- Ejercicio Python: 10-25 líneas, datos inline o generados con semilla fija, salida legible (métricas, predicciones o tabla). Los gráficos se hacen con matplotlib y llegan como PNG.
- Glosario 💡 ampliado con la jerga base: feature, etiqueta, overfitting, hiperparámetro, frontera de decisión, etc.

### Artículo `.md` alrededor del explorador

1. Intro corta: qué es el cheatsheet y cómo usar el explorador.
2. Guía «¿Qué algoritmo necesito?»: árbol de decisión corto (¿tienes etiquetas? → ¿número o clase? → ¿cuántos datos? → ¿necesitas interpretar?) que termina en enlaces a filas del menú.
3. `<ml-explorer></ml-explorer>`.
4. Cierre: cómo seguir y enlace al notebook de Colab.

## Catálogo de OVAs y ejercicios

### Fase 1: infraestructura y supervisados clásicos
| Algoritmo | OVA | Python |
|---|---|---|
| Linear Regression | Arrastrar puntos; la recta se reajusta; residuos como cuadrados (MSE) | Precio de casas: `LinearRegression`, coeficientes y R² |
| Logistic Regression | Sliders b₀/b₁ deforman la sigmoide; umbral movible | Spam por conteo de palabras: probabilidades y matriz de confusión |
| Decision Tree | Al subir la profundidad, el plano se parte en rectángulos; árbol dibujado al lado | Impago de préstamo: `export_text` |
| KNN | Arrastrar el punto de consulta + slider de *k*; vecinos y voto | Recomendador: vecinos más cercanos de un usuario |

### Fase 2: ensambles y márgenes
| Random Forest | N árboles votan; la frontera se suaviza al subir N | Fraude: importancia de features |
| Gradient Boosting | Paso a paso, cada árbol corrige el residuo anterior | Scoring de crédito: curva de pérdida por iteración |
| SVM | Margen y vectores soporte; slider de C; kernel lineal/RBF | Reconocimiento facial simplificado (dígitos 8×8) |
| Naive Bayes | Escribir una frase y ver la probabilidad palabra por palabra | Sentimiento de reseñas: `MultinomialNB` |

### Fase 3: no supervisados y reducción
| K-Means | Iteraciones animadas de centroides; slider de K | Segmentación de clientes |
| Hierarchical Clustering | Slider que corta el dendrograma; los clusters cambian | Genes simulados: `linkage` + dendrograma |
| PCA | Rotar un eje y ver la varianza capturada | Compresión de imagen con k componentes |
| DBSCAN | Sliders de ε y minPts sobre datos en forma de luna; ruido vs. clusters | Clustering geoespacial |

### Fase 4: redes neuronales (NumPy puro en Pyodide)
| MLP | Red de 2 capas con pesos en sliders; frontera XOR | Dígitos 8×8 con `MLPClassifier` |
| CNN | Kernel 3×3 deslizándose sobre una imagen 8×8 → mapa de activación | Convolución + pooling a mano |
| RNN | Desenrollado en el tiempo; el gradiente se desvanece con la longitud | Predicción de una serie con una RNN mínima |
| Transformer (BERT, GPT) | Escribir una frase → mapa de atención; efecto del encoding de posición | Self-attention con 4 tokens |
| Autoencoders | Slider del tamaño del cuello de botella → error de reconstrucción; anomalía resaltada | Fraude por error de reconstrucción |

**Colab:** `notebooks/algoritmos-ml.ipynb`, una sección por algoritmo con el mismo código que corre en Pyodide (y celdas PyTorch opcionales en la fase 4). Cada `colabAnchor` apunta a su sección.

## Manejo de errores

| Situación | Comportamiento |
|---|---|
| El chunk del algoritmo no carga (red, hash viejo tras un deploy) | Panel «No se pudo cargar · Reintentar»; el menú sigue funcionando |
| Pyodide falla o tarda | Barra de progreso con los MB descargados; si falla, «Ábrelo en Colab →». El código y la `expectedOutput` siempre son visibles |
| Bucle infinito en el código editado | Timeout de 15 s: se termina el worker y aparece «Detenido»; la página nunca se congela |
| Error de Python | Traceback en rojo recortado a lo útil + «Restaurar código original» |
| `alg`/`tab` inválidos en la URL | Se ignoran; se abre el primer algoritmo |

## Rendimiento

- Bundle inicial del artículo: registry (~3 KB) + layout. Cada chunk de algoritmo pesa unos 15-40 KB.
- Al pasar el mouse por una entrada del menú se precarga su chunk.
- Pyodide se carga desde jsdelivr con versión fija y queda en caché del navegador. No se agrega al repo.

## Verificación (por fase)

1. `/portfolio-build` sin errores de TypeScript.
2. `scripts/check-ml-exercises.py`: ejecuta en CPython local los ejercicios de la fase y compara con `expectedOutput`.
3. Revisión manual con `npm run dev`: cada algoritmo × 8 pestañas, ejecutar Python, comprobar en Network que el chunk baja solo al hacer clic, y móvil a 375 px.
4. El notebook corre de punta a punta en Colab.
5. `/portfolio-deploy` con confirmación del usuario.

## Fuera de alcance

Progreso guardado del lector, quizzes con puntaje, comparador lado a lado de algoritmos y versión en inglés.
