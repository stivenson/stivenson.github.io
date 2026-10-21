# Claridad e integración del explorador de ML

Criterio acordado con Stivenson el 20 de octubre de 2026. Aplicar al actualizar cada uno de los 17 algoritmos, uno por uno, conservando su contenido y sus interacciones útiles.

## Qué debe entender el lector

- Qué problema resuelve el algoritmo, con qué entradas y qué salida produce.
- En qué condiciones conviene probarlo y con qué alternativa sencilla compararlo.
- Qué hiperparámetros puede ajustar, qué controla cada uno y qué efecto suele tener cambiarlo. Evitar prometer una mejora universal al subir o bajar un valor.
- Qué parámetros aprende el modelo; por ejemplo, coeficientes y pesos. No presentarlos como hiperparámetros.
- Qué controles de la OVA modifican datos, ajustes reales o únicamente la explicación visual. No inventar controles que no afecten al cálculo.
- Cómo comprobar la utilidad con datos nuevos, sin elegir ajustes sobre la prueba final.

## Texto y fichas de conceptos

- La explicación principal debe entenderse sin abrir fichas. Los hiperparámetros clave deben estar visibles, no solo en «Para profundizar».
- En cada pestaña, enlazar los conceptos necesarios mediante el componente `G` y una clave de `glossary.ts`. En Markdown usar `<span data-glossary="clave">texto visible</span>`: abre la misma ficha, no otro glosario.
- Cada ficha explica qué es y por qué importa. Evitar definiciones circulares y jerga nueva sin contexto.
- Mantener las explicaciones breves entre paréntesis cuando ayuden a seguir el texto sin interacción.
- No saturar: máximo tres fichas por párrafo o elemento de lista; separar ideas cuando sea necesario.
- Revisar supuestos, pros, contras y ejemplos si contradicen el caso de uso o las explicaciones nuevas.
- Distinguir algoritmo, variante y biblioteca: Ridge no es LinearRegression; GaussianNB y MultinomialNB no comparten todos los ajustes; MLPClassifier no expone dropout.
- Dar el nombre del ajuste en español y el identificador exacto de la biblioteca del ejercicio.
- Citar documentación oficial pertinente; los valores por defecto dependen de la versión instalada, no de una infografía.

## Verificación y cambios de la OVA

La autorización incluye ajustar la OVA cuando sea necesario para clarificar los hiperparámetros, además de modificar su texto.

1. Identificar cada control: datos, hiperparámetro real, parámetro aprendido mostrado o recurso didáctico. Indicarlo de forma comprensible junto a la OVA.
2. Relacionar el nombre en español y el identificador de Python con el cálculo real del simulador. Explicar qué está fijo, simplificado o fuera del alcance de la OVA.
3. Si un control promete cambiar un hiperparámetro, comprobar que modifica efectivamente el cálculo y los resultados. Corregir nombres, rangos, valores iniciales, interacción o lógica cuando haga falta; no agregar controles decorativos.
4. Mostrar qué observar al cambiarlo: frontera, vecindario, grupos, error, representación o complejidad. Evitar presentar mejoras en entrenamiento como garantía de generalización.
5. Mantener coherencia entre entrada del control, animación, leyenda, lectura de resultados y explicación principal. Los pasos de animación no son necesariamente iteraciones de entrenamiento.
6. Si cambia la lógica, añadir o ajustar pruebas significativas de los resultados. Si cambia Python, verificar ejercicios y notebooks.
7. Comprobar teclado, foco, reinicio, movimiento reducido y pantalla completa cuando el cambio afecte esas interacciones.
8. Tomar e inspeccionar capturas propias de la OVA antes y después de una interacción representativa, más sus fichas de conceptos, en escritorio y móvil. Corregir recortes y contradicciones antes de avanzar.

## Cierre por algoritmo

- Comparar guía inicial → Tipo → Mejor caso de uso → demás pestañas → OVA → Python → notebook.
- Revisar contenido principal, desplegables y fichas. Ejecutar las pruebas pertinentes de contenido, glosario y OVA.
- Abrir con `#/articles/algoritmos-ml-explorador?alg=<slug>&tab=<tab>&fullscreen=1`. Al entrar desde otra URL del mismo documento puede hacer falta recargar para inicializar la pantalla completa.
- Guardar capturas de las pestañas y OVA modificadas. Abrir fichas y revisar cierre, foco y visibilidad en pantalla completa.
- Conservar cambios locales previos. No publicar como parte de una revisión local.

## Estado

- Guía de elección: actualizada; fichas compartidas y distinción entre hiperparámetro, parámetro aprendido y control didáctico integradas.
- Pendiente de revisión individual: regresión lineal, Random Forest, Gradient Boosting, SVM, KNN, K-Means, agrupamiento jerárquico, DBSCAN, PCA, MLP, CNN, RNN, Transformer y autoencoders.

### Naive Bayes — revisión individual del 20 de octubre de 2026

- Revisadas las ocho pestañas: condiciones de uso, variantes, límites de las probabilidades y explicación visible de alpha, fit_prior, class_prior y ngram_range.
- OVA: alpha y class_prior recalculan el modelo; se mantiene fijo el entrenamiento con 16 reseñas. Resultado completo visible junto a los ajustes, opción de detener el recorrido para comparar y fichas de conceptos compartidas.
- Reparada la referencia inexistente a `word` en 3D. Conservadas las mejoras locales previas de las dos curvas y sus etiquetas.
- Resultados de la OVA contrastados con scikit-learn 1.6.1 en seis casos guardados en `naive-bayes-reference.json`. Pruebas de cambios de alpha, prior, desconocidas, 2D/3D, recorrido y modal.
- Python y notebooks individual y conjunto sincronizados. Las cifras de probabilidad son ilustrativas; no equivalen a acierto medido con datos independientes.
- Verificación visual en escritorio de 1280 × 900 y móvil de 390 × 844, con fichas en pantalla completa y retorno del foco al cerrarlas.
- Deuda de pruebas detectada: otras pruebas de `MLExplorer.real.dom.test.tsx` todavía buscan las OVAs en Fórmula aunque sus módulos las montan en Tipo. Revisar esas expectativas al trabajar en cada algoritmo; el caso de Naive Bayes ya comprueba la ubicación actual y las ocho pestañas.

### Regresión logística — revisión individual del 20 de octubre de 2026

- Revisadas las ocho pestañas: C, penalty, class_weight, solver, max_iter y tol en la explicación principal; separación entre entrenamiento, parámetros aprendidos y umbral posterior.
- OVA: C modifica el objetivo L2 y recalcula el ajuste; el umbral reutiliza exactamente la misma curva y los mismos coeficientes. El límite de entrenamiento y el recorrido explican convergencia y resultado incompleto.
- Resultados visibles: coeficientes aprendidos, probabilidad para x = 4 y falsas alarmas frente a spam que se escapan. Se identifican como medidas de entrenamiento con 18 ejemplos.
- La variable x del simulador es frecuencia por 100 palabras, compatible con sus valores fraccionarios. El ejercicio separado usa 400 correos y tres señales; se explica esa diferencia.
- Añadidas fichas de C, convergencia y TF-IDF; corregida calibración para distinguir frecuencia de positivos de exactitud global. La fórmula enlaza pérdida logarítmica, no entropía de una clase.
- Newton en la OVA contrastado con scikit-learn 1.6.1 en cinco valores de C. Python conserva la configuración inicial y muestra comparaciones con validación antes de una prueba separada. Notebooks sincronizados.
- Prueba de integración actualizada a la ubicación Tipo; recorre las ocho pestañas y comprueba que el umbral no modifica la curva. Las expectativas antiguas de los demás algoritmos se revisarán al trabajar cada uno.
- Capturas de escritorio y móvil: controles y curvas, cambio de umbral, regularización fuerte y ficha de C en pantalla completa. Sin publicación.

### Árbol de decisión — revisión individual del 20 de octubre de 2026

- Revisadas las ocho pestañas. max_depth, min_samples_split, min_samples_leaf, criterion y ccp_alpha visibles en Tipo; cortes y hojas aprendidos separados de los límites elegidos.
- OVA: profundidad y mínimo por hoja modifican el cálculo. Los cortes deben dejar el mínimo en ambos hijos. Conservados los controles de reproducción, las reglas y fronteras resaltadas; añadido árbol final fijo para comparar y profundidad realmente alcanzada.
- La advertencia se basa en hojas pequeñas, sin declarar sobreajuste por un nivel fijo ni por el acierto en entrenamiento. Se distingue el corte aprendido del umbral de probabilidad.
- Fichas compartidas de nodos/hojas/profundidad, mínimo por hoja y corte aprendido; poda corregida y enlazada desde Tipo. Referencias oficiales de scikit-learn.
- Cálculo contrastado con scikit-learn 1.6.1 en siete casos con un eje variable; evita comparar empates entre ejes resueltos de otra manera. Pruebas sobre las 28 observaciones verifican el mínimo de cada hoja y preservan los resultados anteriores con mínimo 1.
- Python: 300 ejemplos para entrenar, 100 para validación y 100 para prueba final. Comparación de 12 combinaciones; una sola configuración evaluada al final. Código, salida esperada y notebooks individual/conjunto sincronizados.
- Capturas de escritorio (1280 × 900) con mínimos 1 y 4, controles y fichas en móvil (390 × 844), pantalla completa, teclado, restauración, recorrido y movimiento reducido comprobados.
- Revisión local sobre el commit publicado 31aa800; no incluye despliegue. Las mejoras anteriores de guía, Naive Bayes y regresión logística sí se publicaron en ese commit.
