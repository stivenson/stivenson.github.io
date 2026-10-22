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
- Pendiente de revisión individual: K-Means, agrupamiento jerárquico, DBSCAN, PCA, MLP, CNN, RNN, Transformer y autoencoders.

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
