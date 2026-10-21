---
title: "Algoritmos de Machine Learning: Explorador Interactivo"
date: "2026-10-03"
slug: "algoritmos-ml-explorador"
description: "Los 17 algoritmos del cheatsheet clásico de machine learning, explicados columna por columna —tipo, caso de uso, fórmula, supuestos, pros, contras y ejemplo real— con simuladores, Python que corre en tu navegador y una guía para elegir el que necesitas."
tags: ["Machine Learning", "Python", "Algoritmos", "OVA", "Ciencia de datos"]
---

> **En corto:** no existe «el mejor algoritmo». Cada uno funciona bien bajo ciertas condiciones y falla en otras. Este explorador recorre los 17 algoritmos del cheatsheet (hoja resumen) clásico de machine learning (aprendizaje automático: programas que aprenden patrones a partir de datos) y responde lo mismo para cada uno: qué problema resuelve, cómo funciona, qué supone, cuándo brilla, cuándo no usarlo y un ejemplo real que puedes ejecutar.

Está escrito para estudiantes de Datos y Sistemas y para profesionales de cualquier ingeniería que necesiten decidir si un modelo sirve para su problema. No hace falta saber machine learning: las fichas 💡 explican los conceptos técnicos de la guía y del explorador. Puedes abrirlas cuando lo necesites; la matemática está plegada en «Para profundizar».

## Cómo usar el explorador

- **Menú izquierdo:** un algoritmo por fila del cheatsheet, agrupados por familia.
- **Pestañas:** las 8 columnas del cheatsheet. Al cambiar de algoritmo la pestaña se mantiene: así puedes comparar, por ejemplo, los *Contras* de todos.
- **Fórmula / lógica:** un ejemplo con números, la fórmula y un simulador para tocar.
- **Ejemplo real:** un ejercicio breve de Python que corre en tu navegador y puedes editar. También está en un [notebook de Colab](https://colab.research.google.com/github/stivenson/stivenson.github.io/blob/main/notebooks/algoritmos-ml.ipynb) (un cuaderno de Python que corre gratis en la nube de Google).
- Cada combinación tiene su propio enlace: copia la URL para compartir, por ejemplo, «KNN › Contras».

## ¿Qué algoritmo necesito?

**Primero define qué quieres obtener; después elige candidatos según tus datos.** Esta guía propone puntos de partida. La comparación con datos nuevos decide cuál te sirve.

### 1. ¿Qué quieres obtener?

<section class="ml-selection-guide" aria-label="Puntos de partida según tu objetivo">

| Tu objetivo | Por dónde empezar | Qué comprobar |
| --- | --- | --- |
| Predecir un número: precio, consumo o tiempo. | [Linear Regression](#/articles/algoritmos-ml-explorador?alg=linear-regression&tab=bestUse). | Si la relación se aproxima bien con una recta y cuánto se equivoca en las unidades del problema. |
| Predecir una categoría: spam, abandono o tipo de falla. | [Logistic Regression](#/articles/algoritmos-ml-explorador?alg=logistic-regression&tab=bestUse). | Qué errores cuesta más cometer: falsas alarmas o casos que se escapan. También admite más de dos categorías. |
| Encontrar grupos sin categorías conocidas. | [K-Means](#/articles/algoritmos-ml-explorador?alg=k-means&tab=bestUse) para grupos compactos y un número de grupos propuesto; [Hierarchical Clustering](#/articles/algoritmos-ml-explorador?alg=hierarchical-clustering&tab=bestUse) para explorar grupos dentro de grupos; [DBSCAN](#/articles/algoritmos-ml-explorador?alg=dbscan&tab=bestUse) para formas irregulares y puntos sueltos. | Si la distancia elegida representa bien el parecido. DBSCAN puede tener dificultades si las densidades de los grupos son muy distintas. |
| Resumir muchas columnas en pocas. | [PCA](#/articles/algoritmos-ml-explorador?alg=pca&tab=bestUse) (<span data-glossary="pca">análisis de componentes principales</span>). | Cuánta variación conserva y si la reducción ayuda a la tarea posterior. Conservar mucha variación no garantiza predecir mejor. |
| Detectar casos raros sin ejemplos suficientes de las anomalías. | Empieza por límites sencillos sobre las medidas conocidas; compara con [Autoencoders](#/articles/algoritmos-ml-explorador?alg=autoencoders&tab=bestUse) si necesitas aprender patrones más complejos. | Que los datos normales representen la operación real. Un <span data-glossary="reconstruccion">error de reconstrucción</span> alto es una señal para investigar, no una confirmación de fraude o falla. |

</section>

Si los ejemplos ya incluyen la respuesta, hablamos de **<span data-glossary="supervisado">aprendizaje supervisado</span>** (aprender con respuestas conocidas). Si buscas estructura sin esa respuesta, de **<span data-glossary="noSupervisado">aprendizaje no supervisado</span>** (encontrar patrones sin etiquetas).

### 2. ¿Cómo son tus datos?

- **Tablas de filas y columnas:** compara el modelo inicial con [Random Forest](#/articles/algoritmos-ml-explorador?alg=random-forest&tab=bestUse) y [Gradient Boosting](#/articles/algoritmos-ml-explorador?alg=gradient-boosting&tab=bestUse) si hay relaciones que una recta no recoge bien. Una red neuronal [MLP](#/articles/algoritmos-ml-explorador?alg=mlp&tab=bestUse) (perceptrón multicapa) es otro candidato; no es el siguiente paso obligatorio.
- **Texto para clasificar:** convierte primero las palabras en números, por ejemplo contando palabras y ponderando las más informativas. Compara [Naive Bayes](#/articles/algoritmos-ml-explorador?alg=naive-bayes&tab=bestUse), regresión logística y [SVM](#/articles/algoritmos-ml-explorador?alg=svm&tab=bestUse) (máquina de vectores de soporte) lineal. Para tareas que necesitan más contexto, como responder preguntas o resumir, considera un [Transformer](#/articles/algoritmos-ml-explorador?alg=transformer&tab=bestUse) (arquitectura que relaciona partes de una secuencia) ya entrenado.
- **Imágenes:** si ya tienes medidas útiles, como área, color o textura, puedes probar modelos sobre esas columnas. Para aprender directamente de los píxeles, considera <span data-glossary="redNeuronal">redes neuronales</span> (modelos de capas que aprenden representaciones de los datos), como una [CNN](#/articles/algoritmos-ml-explorador?alg=cnn&tab=bestUse) (red convolucional) ya entrenada y adaptada a tu tarea.
- **Series de tiempo o audio:** para pronosticar una serie, compara primero con una referencia sencilla, como repetir el último valor o el de la misma hora de la semana pasada. Puedes usar árboles con valores anteriores como columnas, o medidas calculadas sobre ventanas de audio. Una [RNN](#/articles/algoritmos-ml-explorador?alg=rnn&tab=bestUse) (red recurrente, para secuencias), una CNN o un Transformer son candidatos cuando necesitas modelar la secuencia con más detalle. Evalúa siempre respetando el orden temporal.

### 3. ¿Qué restricciones tienes?

- **Necesitas explicar las decisiones:** compara modelos lineales y un [Decision Tree](#/articles/algoritmos-ml-explorador?alg=decision-tree&tab=bestUse) poco profundo. Que un modelo sea legible no convierte sus relaciones en causas.
- **Tienes pocos ejemplos y el parecido entre casos tiene sentido:** prueba [KNN](#/articles/algoritmos-ml-explorador?alg=knn&tab=bestUse) (vecinos más cercanos). Ajusta las <span data-glossary="escalado">escalas de las columnas</span> y comprueba el tiempo que tarda en responder a cada consulta.
- **Tienes muchas columnas de texto:** incluye una SVM lineal o regresión logística entre los candidatos. La representación y la cantidad de datos importan más que una regla fija de tamaño.
- **Tienes poco tiempo o memoria:** empieza con una referencia sencilla. Mide cuánto tarda el candidato en entrenar y responder; un pequeño aumento del acierto puede no compensar su costo.

### 4. ¿Cómo decides entre los candidatos?

Usa el modelo sencillo como **<span data-glossary="lineaBase">línea base</span>** (el punto de comparación mínimo). Compara los candidatos con las mismas particiones y una medida que responda a tu objetivo: error en pesos o kilovatios para números; falsas alarmas y casos detectados para categorías. En grupos, revisa además si los segmentos tienen sentido para su uso.

Separa datos para entrenar, para elegir ajustes y para una prueba final. Los **<span data-glossary="hiperparametro">hiperparámetros</span>** (ajustes que eliges antes de entrenar, como la profundidad de un árbol) se seleccionan con los <span data-glossary="datosValidacion">datos de validación</span> o mediante <span data-glossary="validacionCruzada">validación cruzada</span> (repetir la evaluación con distintas particiones del entrenamiento). Reserva la prueba final hasta terminar de elegir.

Para evitar la <span data-glossary="fugaInformacion">fuga de información</span> (usar información que no estaría disponible al predecir), calcula el escalado y la reducción de columnas solo con entrenamiento. Aplica después esas mismas transformaciones a validación y prueba.

Si predices el futuro, usa <span data-glossary="validacionTemporal">validación temporal</span>: entrena con el pasado y valida con periodos posteriores. Si tienes varias filas de una misma persona o máquina, evita repartirlas entre entrenamiento y evaluación cuando quieras medir el comportamiento con personas o máquinas nuevas.

> **Regla práctica:** elige el modelo más sencillo que cumpla tu objetivo con datos nuevos, dentro del tiempo y los recursos disponibles. Cambia a uno más complejo cuando la mejora justifique su costo.

Esta guía adapta criterios del [mapa de selección de scikit-learn](https://scikit-learn.org/stable/machine_learning_map.html), sus guías de [agrupamiento](https://scikit-learn.org/stable/modules/clustering.html), [validación](https://scikit-learn.org/stable/modules/cross_validation.html) y [prevención de fugas de información](https://scikit-learn.org/stable/common_pitfalls.html), y la guía de [aprendizaje por transferencia de Keras](https://keras.io/guides/transfer_learning/). Son referencias para elegir candidatos y evaluarlos; no una clasificación universal de algoritmos.

<ml-explorer>
</ml-explorer>

## Qué cambias en el modelo y qué cambias en la OVA

Una OVA (actividad interactiva para aprender) permite experimentar con una explicación. Sus controles no siempre son ajustes del algoritmo. Distingue estos tres casos:

- **<span data-glossary="hiperparametro">Hiperparámetro</span>:** lo eliges antes de entrenar. Por ejemplo, si KNN consulta a 3 o a 9 vecinos. Cambiarlo puede modificar las predicciones.
- **<span data-glossary="parametroAprendido">Parámetro aprendido</span>:** el modelo lo calcula usando los ejemplos. En regresión lineal, la pendiente y el intercepto (donde la recta corta el eje vertical) se aprenden de los datos.
- **<span data-glossary="controlDidactico">Control didáctico</span>:** cambia cómo exploras la explicación. Girar el eje en la OVA de PCA deja ver cuánta variación conserva cada dirección; en el modelo real, PCA calcula esa dirección. La velocidad de reproducción tampoco configura el entrenamiento.

> **Regla práctica:** antes de mover un control, identifica si cambia los datos, un ajuste del modelo o solo la visualización. Observa el efecto y comprueba si también ocurre con datos nuevos; una animación no sustituye esa evaluación.

## Cómo seguir

- Ejecuta todos los ejercicios juntos en el [notebook de Colab](https://colab.research.google.com/github/stivenson/stivenson.github.io/blob/main/notebooks/algoritmos-ml.ipynb). No necesita GPU (tarjeta gráfica para cálculos pesados).
- Cambia los datos de un ejercicio por los de tu trabajo: todos usan solo numpy, scikit-learn y matplotlib (bibliotecas de Python para cálculo, machine learning y gráficas). En Colab, las cinco redes neuronales traen además una celda opcional con PyTorch, la biblioteca de redes que se usa en la práctica.
- Antes de elegir un algoritmo para un proyecto real, repasa esta lista:

1. ☐ ¿Separé datos de entrenamiento y de prueba (unos para aprender y otros, que el modelo nunca vio, para medir)?
2. ☐ ¿Tengo una línea base simple con la cual comparar?
3. ☐ ¿Revisé los supuestos del algoritmo (pestaña *Supuestos*)?
4. ☐ ¿Sé qué error es más caro en mi problema: la falsa alarma o el caso que se escapa?
5. ☐ ¿Puedo explicar la decisión del modelo si me lo piden?
