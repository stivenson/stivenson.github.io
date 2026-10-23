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
8. Distribuir cada ajuste con su nombre, valor y explicación en un bloque propio. Separar el título del grupo y los resultados de los controles. Usar columnas según el espacio real disponible en el panel, conservar una columna en móvil y evitar que los estilos de grupos de botones afecten estos bloques. Revisar escritorio amplio y mediano, tablet y móvil.
9. Tomar e inspeccionar capturas propias de la OVA antes y después de una interacción representativa, más sus fichas de conceptos, en escritorio y móvil. Corregir recortes y contradicciones antes de avanzar.

## Cierre por algoritmo

- Comparar guía inicial → Tipo → Mejor caso de uso → demás pestañas → OVA → Python → notebook.
- Revisar contenido principal, desplegables y fichas. Ejecutar las pruebas pertinentes de contenido, glosario y OVA.
- Abrir con `#/articles/algoritmos-ml-explorador?alg=<slug>&tab=<tab>&fullscreen=1`. Al entrar desde otra URL del mismo documento puede hacer falta recargar para inicializar la pantalla completa.
- Guardar capturas de las pestañas y OVA modificadas. Abrir fichas y revisar cierre, foco y visibilidad en pantalla completa.
- Conservar cambios locales previos. No publicar como parte de una revisión local.

## Estado

- Guía de elección: actualizada; fichas compartidas y distinción entre hiperparámetro, parámetro aprendido y control didáctico integradas.
- Pendiente de revisión individual: agrupamiento jerárquico, PCA, CNN, RNN, Transformer y autoencoders.

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

### Random Forest — revisión individual del 21 de octubre de 2026

- Ocho pestañas revisadas. n_estimators, max_depth, min_samples_leaf, max_features y bootstrap visibles en Tipo, separados de los cortes aprendidos, el recorrido y la velocidad.
- OVA: los cinco ajustes afectan al cálculo. El bosque se construye con el tamaño solicitado; la animación revela sus prefijos reproducibles. Bosque final fijo permite comparar sin esperar. Restauración y movimiento reducido conservan la coherencia.
- Mínimo por hoja: cuenta clientes distintos aunque el bootstrap repita filas; Gini pondera las apariciones. Con max_features=2 compara ambos ejes; con 1 usa el primer eje sorteado que permite una mejora. Se documenta esta simplificación frente a sklearn.
- El fondo muestra acuerdo entre votos duros; RandomForestClassifier promedia probabilidades de hojas y no siempre produce la misma clase. Ficha de acuerdo y ejemplo numérico en Fórmula.
- Resultados junto al gráfico: entrenamiento y 40 casos simulados de comparación. Se aclara que se reutilizan al ajustar y que algunas coordenadas coinciden con entrenamiento; no son una prueba independiente.
- Fichas de diversidad y acuerdo añadidas; bootstrap, OOB e importancia por permutación revisadas para evitar garantías y confusión con evaluación final.
- Python: 600 compras de entrenamiento, 200 de validación y 200 de prueba. Compara 17 configuraciones; calcula importancia por permutación con validación y consulta la prueba una vez. Salida y notebooks sincronizados.
- Verificación: siete casos deterministas sin bootstrap/todas las columnas comparados con la referencia CART de scikit-learn 1.6.1; no se afirma equivalencia de generadores aleatorios. Pruebas de mínimos con duplicados, profundidad, prefijos, controles, restauración, reproducción y fichas.
- Capturas propias de escritorio (1280 × 900), móvil (390 × 844), pantalla completa y modales. Revisión local sobre a04f019, sin despliegue.

### Revisión visual de controles — 21 de octubre de 2026

- Aplicada a Random Forest, árbol de decisión, Naive Bayes, regresión logística y regresión lineal. Un estilo genérico de grupos de botones interfería con la distribución de los parámetros; se separaron ambos usos.
- Nombre, valor y ayuda de cada ajuste permanecen juntos en tarjetas; título y resultados ocupan filas independientes. Dos columnas cuando el contenedor tiene espacio y una cuando se estrecha. En tablet se apilan gráfico y controles para evitar paneles demasiado angostos.
- Notas técnicas extensas de árbol y bosque plegadas, con acceso visible. Las fichas de conceptos siguen disponibles mediante enlaces dentro de las explicaciones. El umbral logístico conserva un bloque separado del entrenamiento.
- Capturas propias inspeccionadas de las cinco OVAs a 1920 × 1080 y 390 × 844. Random Forest comprobado además a 1440 × 900 y 1024 × 900; paneles sin desbordamiento horizontal. Ficha de mínimo por hoja comprobada en pantalla completa.
- Verificación: compilación de producción, TypeScript, 62 pruebas de OVA/reproducción y 6 pruebas seleccionadas de integración aprobadas. Actualizada una expectativa antigua de regresión lineal: la OVA está en Tipo y la fórmula en su pestaña.
- Vista previa local en el puerto 5182; cambios pendientes de publicación, sobre a04f019. Este criterio visual se incorpora a la revisión de los siguientes algoritmos.

### Gradient Boosting — revisión individual del 21 de octubre de 2026

- Ocho pestañas revisadas. Tipo explica n_estimators, learning_rate, max_depth, min_samples_leaf, subsample y los ajustes de parada temprana. Se distingue regresión, clasificación binaria y cantidad de árboles por etapa multiclase. Los nombres se refieren al Gradient Boosting clásico de scikit-learn.
- OVA: tasa y cantidad de árboles modifican realmente el conjunto; vista final fija para comparar. Profundidad 1, mínimo por hoja 1, todas las filas y pérdida cuadrática explícitamente fijos. Recorrido y velocidad separados del entrenamiento. No se presenta el MSE de entrenamiento como validación ni como diagnóstico automático de sobreajuste.
- Se conserva la comparación de curvas, residuos y explicación numérica de una corrección. Título corregido: cada árbol corrige al conjunto anterior. Etiquetas de tasa sin sugerir un valor universalmente equilibrado.
- Fichas compartidas: tasa, modelo débil y parada temprana revisadas para evitar garantías. Ficha nueva de subsample distingue muestreo sin reposición del bootstrap de Random Forest.
- Python: 480 clientes simulados para entrenar, 160 para validación y 160 para prueba final. Compara tasas 0.03, 0.1 y 0.3 hasta 300 etapas; elige solo con validación y consulta la prueba una vez. Resultado reproducido en Pyodide 0.27.7 / scikit-learn 1.6.1: tasa 0.03, 129 etapas; pérdida de validación 0.575 y de prueba 0.509. Código y notebooks sincronizados.
- Referencia numérica: 15 combinaciones de tasa/cantidad, 41 consultas por combinación, contrastadas con GradientBoostingRegressor de scikit-learn 1.6.1 (árboles de profundidad 1); prefijos reproducibles verificados.
- Organización visual usa el patrón compartido de tarjetas de parámetros. Fichas comprobadas en pantalla completa, cierre y retorno del foco; controles, reinicio y movimiento reducido cubiertos por pruebas.
- Capturas inspeccionadas a 1920 × 1080, 1440 × 900 y 390 × 844; tarjetas sin desbordamiento horizontal y ficha de tasa legible en escritorio/móvil. Compilación, TypeScript, pruebas de OVA, referencia numérica, glosario, notebooks e integración aprobadas; ejercicio ejecutado en Pyodide.
- Revisión local sobre f110feb; sin publicación de esta revisión.

### SVM — revisión individual del 21 de octubre de 2026

- Ocho pestañas revisadas. Tipo expone C, kernel, gamma, class_weight, tol y max_iter. Se distinguen pesos aprendidos, selección de ejemplos de soporte, ajustes de optimización y reproducción. C=1 deja de presentarse como un equilibrio universal. Gamma numérico de la OVA y gamma="scale" de SVC se diferencian; el escalado se aprende solo con entrenamiento.
- OVA: comparación directa del ajuste elegido, además del recorrido original por valores de C hasta el elegido. Cada paso compara un modelo, no una iteración del optimizador. Gamma funciona con RBF y queda deshabilitado con kernel lineal. Restauración y movimiento reducido comprobados. Pesos iguales, escalas 0–10 y tolerancia se identifican como fijos.
- Aciertos identificados como entrenamiento. El ancho geométrico solo se muestra para kernel lineal; la zona de margen de RBF se define en el espacio del kernel. Fichas de margen, soporte, C y gamma aclaradas; ficha nueva de pesos de clase.
- La revisión visual con gamma=3 detectó que una banda de puntajes cercanos a cero pintaba regiones enteras de verde. Ahora la frontera aproximada marca cambios de signo entre celdas vecinas de la cuadrícula 32 × 32. Prueba de regresión para zonas lejanas con puntaje casi cero.
- Referencia: 20 combinaciones (5 C lineales y 5 × 3 C/gamma en RBF), 47 consultas cada una, contrastadas con SVC de scikit-learn 1.6.1 en Pyodide. Mismas clases y conjuntos de soporte; puntajes y anchos con tolerancia absoluta de 0.005. No se promete igualdad exacta entre solvers.
- Python: 1077 imágenes para entrenar, 360 para validación, 360 para prueba. Pipeline con StandardScaler y SVC; 12 configuraciones comparadas solo con validación. Elegido RBF, C=100, gamma=0.001; prueba 97.8 %, 8 errores, 413 soportes. Prueba consultada una vez. Código, salida y ambos notebooks sincronizados y ejecutados con Pyodide 0.27.7.
- Capturas inspeccionadas de controles y fichas a 1920 × 1080 y 390 × 844, más distribución a 1440 × 900. Sin desbordamientos horizontales. Bloque principal de hiperparámetros limitado en ancho para evitar líneas excesivamente largas. Ficha nueva de pesos de clase comprobada desde Tipo.
- Compilación, TypeScript y pruebas pertinentes de referencia, OVA, glosario, espaciado, notebooks, salida esperada y navegación por ocho pestañas aprobadas.
- Revisión local sobre f392ec4, pendiente de publicación.

### KNN — revisión individual del 22 de octubre de 2026

- Ocho pestañas revisadas. Tipo aclara n_neighbors, weights, metric/p y algorithm/leaf_size; el método de búsqueda exacta se distingue de la regla de voto, con salvedad de empates en el límite de k. Se explica fit (guardar ejemplos/construir índices) y el aprendizaje de las estadísticas de escalado fuera del estimador.
- OVA: cantidad de vecinos, pesos uniformes o 1/distancia y Minkowski p=1/2 afectan al cálculo. Vista fija del ajuste elegido y recorrido original por k impares; mover el rombo cambia la consulta, no los ejemplos. Contorno circular euclidiano y rombo Manhattan. Vecinos seleccionados, aportes y predicción separados; fracción de aporte no presentada como acierto o calibración.
- Distancia cero: solo aportan coincidencias exactas seleccionadas; botón de consulta para experimentar, sin infinitos. Empates de distancia por orden original y empates de aportes por clase a favor de 0, alineado con sklearn para etiquetas [0,1]. Actualizada la prueba antigua que resolvía estos últimos por el vecino más cercano. Se aclara que k impar no elimina todos los empates ponderados.
- Fichas nuevas: cantidad de vecinos, pesos, métrica y búsqueda. Integradas en Tipo y OVA; controles en tarjetas y explicación principal con ancho de lectura limitado.
- Python conserva el recomendador de seis usuarios como ilustración. Con pesos uniformes mantiene las recomendaciones originales; con distance, Beto coincide exactamente con Ana y sus notas dominan. Se añade una evaluación de clasificación independiente (vino): 106 ejemplos para entrenamiento, 36 de validación y 36 de prueba, Pipeline con StandardScaler y KNeighborsClassifier, 12 combinaciones de k/weights/p elegidas con validación y una prueba final. No se presenta esta evaluación como validación del recomendador. Notebooks sincronizados; Pyodide 0.27.7 / sklearn 1.6.1 ejecutados correctamente.
- Referencia numérica: 16 combinaciones × 6 consultas, incluida una coincidencia exacta, frente a KNeighborsClassifier; clases, distancias y fracción de aporte coinciden dentro de tolerancia numérica. Pruebas de duplicados, empates, límite de k, contornos, teclado, restauración, fichas/foco y movimiento reducido. Navegación por las ocho pestañas, glosario, densidad, espaciado, notebooks y salida esperada aprobados; TypeScript y compilación aprobados.
- Capturas inspeccionadas a 1920 × 1080, 1440 × 900 y 390 × 844. Sin desbordes en controles; fichas legibles en escritorio y móvil. Comparaciones de pesos, métrica y coincidencia exacta comprobadas en el navegador.
- Lectura de Tipo reorganizada en cuatro paneles con preguntas, nombres de parámetros y explicaciones breves. Detalles técnicos desplegables y práctica en tres pasos. Capturas nuevas a 1920 × 1080 y 390 × 844; sin desbordamiento en los cuatro paneles, desplegables y modal de k comprobados. Las 55 pruebas de glosario, densidad y espaciado, TypeScript y compilación aprobadas tras este ajuste visual.
- Publicación autorizada el 22 de octubre de 2026, preparada sobre 41c84a8. Incluye la reorganización de lectura en paneles.


### K-Means — revisión individual del 22 de octubre de 2026

- Tipo incorpora cuatro paneles sobre n_clusters, init, n_init y max_iter/tol; diferencia grupos, vecinos de KNN, arranques e iteraciones. Semilla, algorithm y escalado aclarados. Fichas nuevas de cantidad de grupos, inicialización, arranques y parada, compartidas con la OVA. Se reutiliza el estilo de paneles de KNN mediante clases generales, conservando su apariencia.
- OVA: conserva A/B con inicio aleatorio y n_init=1. Añade k-means++ clásico D², 1–10 arranques, límite de 1–20 iteraciones y tolerancia relativa al movimiento de centros. Muestra el arranque de menor inercia sin promediar ejecuciones y enumera los resultados de todos. Los candidatos anteriores se conservan al aumentar n_init. Vista final fija y restauración; velocidad/repetición identificadas como visualización.
- Motivo de parada explícito: asignaciones estables, tolerancia o límite. Agotar el límite no se llama convergencia. Asignaciones finales se recalculan con los centros; si se para pronto, estos pueden no ser el promedio de las asignaciones finales. Vacíos conservan su centro en la OVA; sklearn puede reubicarlos.
- Se explicitan generador propio, k-means++ clásico frente al greedy de sklearn, Lloyd, pesos iguales, distancia euclidiana y coordenadas sintéticas 0–10. No se promete equivalencia de las semillas A/B con random_state.
- Revisión de las ocho pestañas: inercia mínima teórica frente a mínimos locales prácticos, costo de arranques/iteraciones, escalas y utilidad de los segmentos. Se retiran garantías de velocidad o de superioridad de otro modelo. Inercia y silueta no se presentan como acierto ni utilidad comercial.
- Python conserva los 300 clientes y resultados originales; hace explícitos init, n_init, max_iter, tol y Lloyd. Añade comparación con K=3 fijo y una tabla de parada con centros explícitos idénticos. n_iter_ es del arranque elegido y no informa por sí solo el motivo exacto de parada. Notebooks individual y agregado sincronizados. Ejecutado con Pyodide 0.27.7 / sklearn 1.6.1.
- Referencia independiente: 72 casos (K=1…6, random/k-means++, semillas A/B, tres combinaciones de límite/tolerancia), con centros iniciales explícitos iguales frente a KMeans de sklearn 1.6.1. Coinciden inercia, centros y asignaciones con tolerancia 1e-8. Pruebas de rescate del mal arranque B, reproducibilidad y motivos de parada.
- 273 pruebas de referencia, datos, matemáticas, OVA, glosario y notebooks aprobadas; 55 de glosario/densidad/espaciado y 18 de encabezados aprobadas. Integración por las ocho pestañas aprobada; corregidas las expectativas antiguas que buscaban la OVA en Fórmula aunque está en Tipo y los nombres de reproducción anteriores. TypeScript y compilación aprobados.
- Capturas inspeccionadas a 1920 × 1080, 1440 × 900 y 390 × 844. Tarjetas de lectura y controles sin desbordamiento horizontal. Modal de parada en escritorio, modal de arranques en móvil y retorno del foco comprobados; valores de límite, tolerancia y arranques comprobados en el navegador.
- Fuentes: https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html y https://scikit-learn.org/stable/modules/clustering.html#k-means
- Publicación autorizada el 22 de octubre de 2026, preparada sobre d2aac5a. Incluye paneles, controles de arranques y parada, fichas y notebooks sincronizados.


### DBSCAN — revisión individual del 22 de octubre de 2026

- Cuatro paneles en Tipo: eps, min_samples/minPts, metric/p y algorithm/leaf_size. Vecindario frente a diámetro del grupo, conteo del propio punto, unidades y distancia explícitos. Detalles sobre n_jobs como rendimiento y sample_weight como entrada a fit; la OVA conserva pesos iguales.
- OVA: conserva expansión por núcleos y añade distancia Manhattan, contorno acorde (círculo/rombo), resultado final fijo, restauración y examen de un punto. Contorno blanco y cruz muestran el punto observado; se informa cantidad de vecinos y condición de núcleo/borde/ruido. La inspección no cambia el agrupamiento. Controles organizados en tarjetas, con mínimo local explicado con el valor elegido. Repetición y velocidad identificadas como didácticas; no se inventan iteraciones ni arranques de DBSCAN.
- Nuevas fichas de distancia y búsqueda. Revisadas eps, minPts, núcleo/borde/ruido, densidad y HDBSCAN. Se aclara que p solo configura Minkowski, que un borde compartido no conecta grupos por sí mismo y que ruido no confirma error o anomalía. Retiradas garantías de escalabilidad y de superioridad de HDBSCAN; memoria de sklearn puede ser cuadrática con vecindarios grandes. Limitación de predict para nuevos puntos explicitada.
- Python conserva los 145 reportes y cifras originales. Haversine y eps en radianes, BallTree explícito; compara min_samples=3/5/8 con eps=300 m fijo. Compara una matriz pequeña de distancias en metros con haversine en radianes: mismas etiquetas. Pyodide 0.27.7 / sklearn 1.6.1 ejecutados. Notebooks individual y agregado sincronizados.
- Referencia independiente: 342 combinaciones (19 eps × 9 mínimos × dos métricas), con tolerancia de frontera eps+1e-9 igual a la OVA. Etiquetas y núcleos coinciden con sklearn. Tres pruebas adicionales de conteo propio/frontera inclusiva, grupo de diámetro mayor que eps y borde compartido que no une núcleos de grupos distintos.
- Cuatro pruebas DOM de expansión/vista final, cambios de métrica/forma, inspección/restauración, extremos de cero/un grupo y movimiento reducido. Pasan las pruebas de contenido/glosario/espaciado, 93 de datasets y 17 de matemáticas de fase 3, 58 de notebooks y 18 de encabezados. Dos pruebas de cifras específicas de DBSCAN y navegación por ocho pestañas aprobadas. Corregida expectativa antigua que buscaba la OVA en Fórmula en vez de Tipo. TypeScript y compilación aprobados.
- La ejecución completa de outputs.test.ts detecta cuatro expectativas antiguas de Decision Tree y Random Forest que ya no corresponden a sus salidas publicadas. Esos tests y archivos de salida no se modificaron en esta revisión; las dos pruebas de DBSCAN pasan. Deuda registrada, fuera del cambio de DBSCAN.
- Capturas inspeccionadas a 1920 × 1080, 1440 × 900 y 390 × 844. Sin desbordamiento horizontal en controles ni paneles de lectura. Modal de min_samples en escritorio y de distancia en móvil, cierre y retorno del foco comprobados. En navegador se verificó la comparación euclidiana (2 grupos/4 ruido) frente a Manhattan (5/7), un borde con dos vecinos frente al mínimo 4 y ruido con solo el propio punto.
- Fuentes: https://scikit-learn.org/stable/modules/generated/sklearn.cluster.DBSCAN.html y https://scikit-learn.org/stable/modules/clustering.html#dbscan
- Publicación autorizada el 22 de octubre de 2026, preparada sobre 2f0369a. Incluye paneles, comparación de métricas, inspección de vecindarios y notebooks sincronizados.


### MLP — revisión individual del 23 de octubre de 2026

- Tipo incorpora cuatro paneles: hidden_layer_sizes/activation, solver/learning_rate_init/batch_size, alpha y parada (max_iter/tol/n_iter_no_change, con early_stopping/validation_fraction). Se distingue arquitectura de pesos/sesgos aprendidos, actualización de época y entrenamiento de propagación. Fichas nuevas de arquitectura, optimizador, penalización y parada. Dropout se identifica como ajuste de otras bibliotecas, no de MLPClassifier. Ajustes dependientes del solver explicitados: L-BFGS no usa tasa inicial ni minibatches; learning_rate solo configura el calendario de SGD.
- Ocho pestañas revisadas; retiradas garantías de rendimiento, cantidad universal de datos o superioridad automática de más neuronas. Cheatsheet armonizado. Se aclara CPU para MLPClassifier y GPU en otras bibliotecas; escala fija de píxeles 0–16 dividida por 16. Valores anteriores de prueba reemplazados por la evaluación con partición explícita.
- OVA: preserva la red 2→2→1, selección de casos y nueve deslizadores de pesos/sesgos, ahora en paneles dentro de un desplegable de exploración manual. La OVA no entrena: esos valores no se llaman hiperparámetros. Añade activación oculta logistic/tanh/relu/identity que modifica realmente el cálculo, con salida logística fija. Los pesos se conservan al cambiar activación; no se presenta como comparación de redes reentrenadas. Vista de salida completa y restauración.
- Lectura de h₁/h₂ y explicaciones «al menos una/no ambas» solo se conservan para el ejemplo inicial sigmoidal; se retiran cuando cambian pesos/activación. Números ocultos pueden salir de 0–1; brillo acotado sin alterar el valor mostrado. Plano XOR ampliado para legibilidad. Aciertos explícitamente de demostración, sin equivaler a generalización ni calibración. Pasos de propagación y velocidad separados de épocas y entrenamiento.
- Python: 1 077 imágenes de entrenamiento, 360 de validación y 360 de prueba. Cinco candidatos (2/8/32 ReLU, 32 tanh y 32 ReLU con alpha=0.1); Adam, tasa 0.003, lote 64 y hasta 150 épocas explícitos. Selección solo con validación; la prueba se consulta al final. Elegido candidato 5, validación 96.4 %, prueba 97.2 % (10 errores/360), 2 410 pesos/sesgos. Advertencias de convergencia visibles; llegar a max_iter no se interpreta como convergencia ni diagnóstico de sobreajuste.
- Ejecutado con Pyodide 0.27.7 / sklearn 1.6.1. Notebooks sincronizados. Celda opcional PyTorch armonizada como ejemplo independiente de 32 ReLU que usa validación, sin volver a consultar prueba; sintaxis verificada, entrenamiento PyTorch no ejecutado en esta revisión.
- Referencia: 240 propagaciones (tres configuraciones de pesos × cuatro activaciones × veinte puntos), frente a implementaciones de activación de sklearn y expit de scipy; activaciones ocultas y salida coinciden con tolerancia 1e-10. Prueba adicional de composición afín con identity. Pruebas DOM preservan recorrido, cuatro esquinas, edición de pesos, cambio de activación, saturación visual y restauración.
- Pruebas pertinentes de contenido/glosario/densidad/espaciado, notebooks, encabezados, matemáticas, referencia, OVA, integración por ocho pestañas y salida MLP aprobadas; TypeScript y compilación aprobados. Integración MLP actualizada al emplazamiento actual de la OVA en Tipo. La deuda previamente registrada de cuatro expectativas antiguas de salida de Decision Tree/Random Forest queda fuera de esta revisión.
- Capturas inspeccionadas a 1920 × 1080, 1440 × 900 y 390 × 844; sin desbordamiento en paneles y campos, incluyendo los nueve pesos manuales. Ficha de arquitectura en escritorio y de parada en móvil; retorno del foco comprobado. Cambiar a identity con pesos fijos muestra 10/20 frente a 20/20 del ejemplo; anular un peso de salida también cambia la respuesta.
- Fuente: https://scikit-learn.org/stable/modules/generated/sklearn.neural_network.MLPClassifier.html
- Publicación autorizada por el usuario el 23 de octubre de 2026, preparada sobre 73921bd.
