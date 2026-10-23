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
    what: 'Un ajuste que fijas antes de entrenar, como el número de vecinos en KNN o la profundidad máxima de un árbol. Puedes elegirlo a mano o con una búsqueda automática.',
    why: 'Se compara con datos de validación. Es distinto de los parámetros aprendidos, como la pendiente de una recta, y de los controles de una animación.',
  },
  parametroAprendido: {
    term: 'Parámetro aprendido',
    what: 'Un valor que el modelo calcula al entrenar con los datos, como la pendiente y el intercepto de una recta o los pesos de una red neuronal.',
    why: 'Cambiar los ejemplos puede cambiar estos valores. Se distinguen de los hiperparámetros, que configuran cómo se aprende.',
  },
  controlDidactico: {
    term: 'Control didáctico',
    what: 'Una opción para explorar una explicación: mover un punto, girar un eje o cambiar la velocidad de una animación.',
    why: 'No todo control de una OVA es un hiperparámetro. Girar el eje de PCA ilustra su lógica; el algoritmo calcula la orientación a partir de los datos.',
  },
  datosValidacion: {
    term: 'Datos de validación',
    what: 'Ejemplos que no se usan para ajustar los parámetros en un entrenamiento y sirven para comparar modelos o elegir hiperparámetros.',
    why: 'Como participan en la elección, se necesita una prueba final aparte para estimar el resultado del modelo elegido.',
  },
  fugaInformacion: {
    term: 'Fuga de información',
    what: 'Ocurre cuando el entrenamiento o la elección del modelo aprovechan información que no estaría disponible al predecir casos nuevos.',
    why: 'Puede inflar el resultado de la evaluación. Por ejemplo, calcula el escalado solo con entrenamiento y aplica esa transformación a los demás datos.',
  },
  validacionTemporal: {
    term: 'Validación temporal',
    what: 'Evaluar un pronóstico entrenando con periodos anteriores y midiendo con periodos posteriores, respetando el orden del tiempo.',
    why: 'Mezclar pasado y futuro al azar puede dar una impresión engañosa de lo que el modelo podrá predecir.',
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
  estructuraArbol: {
    term: 'Nodos, hojas y profundidad',
    what: 'Un nodo agrupa ejemplos. Un nodo de decisión hace una pregunta y tiene dos ramas; una hoja termina el recorrido y devuelve una predicción. La raíz tiene profundidad 0.',
    why: 'max_depth limita cuántas preguntas puede atravesar un caso. El árbol puede detenerse antes; las hojas no son iteraciones de entrenamiento.',
  },
  minimoHoja: {
    term: 'Mínimo de ejemplos por hoja',
    what: 'min_samples_leaf exige que un corte deje al menos esa cantidad de ejemplos de entrenamiento en cada una de sus dos ramas. En esta OVA se elige un número entero.',
    why: 'Impide crear grupos demasiado pequeños. No equivale a min_samples_split, que solo exige un mínimo en el grupo antes de dividirlo; más restricciones pueden simplificar demasiado el árbol.',
  },
  corteArbol: {
    term: 'Corte aprendido del árbol',
    what: 'Una pregunta como «deuda ≤ 5,75». El entrenamiento elige la columna y el valor del corte buscando separar mejor las respuestas conocidas.',
    why: 'Ese valor se aprende de los datos. Es distinto del umbral de probabilidad de un clasificador y de los hiperparámetros que limitan el crecimiento del árbol.',
  },
  gini: {
    term: 'Impureza de Gini',
    what: 'Mide qué tan mezcladas están las clases en un grupo: 0 si todos son de la misma clase. Con dos clases llega a 0,5 cuando están mitad y mitad.',
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
    why: 'Equivale a Minkowski con p=2, la configuración inicial de KNN en scikit-learn. Cambiar unidades o escalas modifica estas distancias y puede cambiar los vecinos.',
  },
  knnVecinos: {
    term: 'Cantidad de vecinos (n_neighbors, k)',
    what: 'Cuántos ejemplos cercanos se seleccionan para responder una consulta. La clasificación combina sus clases; la regresión combina sus valores numéricos.',
    why: 'Pocos vecinos conservan variaciones locales y pueden seguir ruido; muchos amplían el grupo y pueden mezclar regiones. Se elige con validación y no puede superar los ejemplos disponibles.',
  },
  knnPesos: {
    term: 'Aportes de vecinos (weights)',
    what: 'Uniform asigna el mismo peso a cada vecino. Distance usa el inverso de la distancia: cerca pesa más. Si hay distancias cero entre los vecinos seleccionados, solo esas coincidencias exactas aportan, con el mismo peso entre ellas.',
    why: 'Los pesos cambian la combinación de respuestas, aunque los vecinos sean los mismos. La fracción del aporte por clase no es una garantía de acierto ni una probabilidad calibrada para casos nuevos.',
  },
  knnMetrica: {
    term: 'Métrica de cercanía (metric y p)',
    what: 'La regla para medir distancia. En Minkowski, p=1 suma las diferencias absolutas por coordenada (Manhattan) y p=2 usa la distancia en línea recta (euclidiana). P no redefine todas las métricas.',
    why: 'La métrica y las escalas deciden quién es vecino. En dos ejes con la misma escala, el alcance es un rombo para Manhattan y un círculo para euclidiana. No hay una métrica universalmente mejor.',
  },
  knnBusqueda: {
    term: 'Método de búsqueda de vecinos (algorithm)',
    what: 'Brute compara con todos los ejemplos; kd_tree y ball_tree construyen índices para buscar vecinos exactos; auto elige una opción compatible. Leaf_size cambia el tamaño de las hojas de esos índices.',
    why: 'Se comparan por costo y memoria, conservando k, métrica y voto. Los empates de distancia en el límite de k pueden seleccionar ejemplos distintos. Una búsqueda aproximada sí puede cambiar qué vecinos devuelve.',
  },
  ensamble: {
    term: 'Ensamble',
    what: 'Combinar muchos modelos (por ejemplo, 100 árboles) y promediar, votar o sumar sus respuestas.',
    why: 'Random Forest promedia árboles para reducir la inestabilidad de uno solo; Gradient Boosting los suma uno tras otro para corregir sus errores.',
  },
  interpretable: {
    term: 'Modelo interpretable',
    what: 'Un modelo cuyas reglas puedes leer y explicar, como «cada m² suma 2.5 millones».',
    why: 'En crédito, salud o decisiones públicas a menudo es obligatorio explicar por qué se decidió algo.',
  },
  diversidadBosque: {
    term: 'Diversidad entre árboles (max_features)',
    what: 'Los árboles pueden aprender reglas distintas si usan otras muestras o consideran otras variables al buscar cada corte. max_features limita cuántas variables se consideran inicialmente.',
    why: 'Promediar ayuda más cuando los errores no son idénticos. Menos variables puede diversificar los árboles, pero también debilitar cada uno; se compara con validación.',
  },
  acuerdoBosque: {
    term: 'Acuerdo entre votos',
    what: 'La fracción de árboles que eligen una clase. Si 60 de 100 votan impago, el acuerdo por esa clase es 60 %. Eso es lo que representa el fondo de esta OVA.',
    why: 'No equivale a 60 % de acierto ni garantiza una probabilidad calibrada de impago. RandomForestClassifier promedia probabilidades de hojas, que pueden diferir del voto mayoritario.',
  },
  bootstrap: {
    term: 'Muestra bootstrap',
    what: 'Una muestra del mismo tamaño que los datos, sacada al azar con reposición: algunos ejemplos salen repetidos y otros (cerca de un tercio) no salen.',
    why: 'Con bootstrap activado, el bosque usa muestras distintas para favorecer la diversidad. No garantiza que los árboles cometan errores distintos ni que aumente el acierto.',
  },
  tasaAprendizaje: {
    term: 'Tasa de aprendizaje (learning rate)',
    what: 'En Gradient Boosting, multiplica la corrección predicha por cada árbol antes de sumarla al conjunto. Con 0.1 se incorpora el 10 % del aporte del árbol, que no tiene por qué corregir todo el residuo de cada ejemplo.',
    why: 'Se elige junto con el número de árboles usando validación. Reducirla puede exigir más árboles; ningún valor garantiza una mejor predicción en datos nuevos.',
  },
  perdidaLog: {
    term: 'Pérdida logarítmica (log loss)',
    what: 'Castiga cada predicción según la probabilidad que le dio a la respuesta correcta: decir 99 % y fallar cuesta muchísimo; decir 60 % y fallar, poco.',
    why: 'Mide la calidad de las probabilidades, no solo los aciertos. Más baja es mejor.',
  },
  margen: {
    term: 'Margen',
    what: 'Zona alrededor de la frontera de una SVM, delimitada por los puntajes −1 y +1. Con kernel lineal, el ancho entre esos límites es 2 / ||w||. En margen blando pueden entrar ejemplos o quedar del lado equivocado.',
    why: 'El entrenamiento combina un margen amplio con penalizar sus violaciones según C. Con RBF se define en el espacio del kernel: la franja dibujada no tiene un ancho físico uniforme en los ejes originales.',
  },
  vectorSoporte: {
    term: 'Vector de soporte',
    what: 'Un ejemplo de entrenamiento con peso no nulo en la función de decisión de la SVM. Suele estar sobre el margen, dentro de él o del lado equivocado; estar justo sobre un borde no basta por sí solo para identificarlo.',
    why: 'La predicción combina estos ejemplos con sus pesos aprendidos y un desplazamiento. Su número es un resultado del entrenamiento, no un hiperparámetro; puede incluir gran parte del conjunto.',
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
  suavizadoAditivo: {
    term: 'Suavizado aditivo (alpha)',
    what: 'Sumar una cantidad alpha a los conteos de todas las palabras de cada clase antes de calcular sus probabilidades. Con alpha = 1 se llama suavizado de Laplace.',
    why: 'Evita que un conteo cero anule la evidencia. Un alpha mayor aproxima la distribución de palabras de cada clase a una distribución uniforme; se elige con validación, no por la seguridad aparente de la predicción.',
  },
  suavizadoLaplace: {
    term: 'Suavizado de Laplace',
    what: 'Sumar 1 a todos los conteos de palabras antes de calcular probabilidades.',
    why: 'Sin él, una palabra que nunca apareció en una clase tendría probabilidad 0 y anularía toda la multiplicación.',
  },
  bagging: {
    term: 'Bagging',
    what: 'Entrenar muchos modelos, cada uno con una muestra bootstrap distinta de los datos, y promediar o votar sus respuestas.',
    why: 'Promediar modelos que se equivocan en sitios distintos reduce la inestabilidad de cada uno.',
  },
  oob: {
    term: 'Puntaje OOB (fuera de la bolsa)',
    what: 'El acierto del bosque medido fila por fila, usando solo los árboles que no vieron esa fila en su muestra bootstrap (cerca de un tercio de los árboles).',
    why: 'Aprovecha filas omitidas al entrenar cada árbol. Si usas OOB para elegir ajustes, reserva otra evaluación final; no reemplaza una separación temporal o por grupos cuando la tarea la requiere.',
  },
  importanciaPermutacion: {
    term: 'Importancia por permutación',
    what: 'Cuánto cae el acierto del modelo en datos nuevos si revuelves al azar una columna.',
    why: 'Mide dependencia para ese modelo, conjunto de evaluación y métrica. Una caída pequeña puede deberse a redundancia con otras columnas; una importancia negativa puede aparecer por variación. No demuestra causalidad.',
  },
  sesgoVarianza: {
    term: 'Sesgo y varianza',
    what: 'Sesgo: error por un modelo demasiado simple, que falla igual siempre. Varianza: error por un modelo inestable, que cambia mucho si cambian un poco los datos.',
    why: 'Random Forest baja sobre todo la varianza (promedia); Gradient Boosting, sobre todo el sesgo (corrige).',
  },
  precisionSensibilidad: {
    term: 'Precisión y sensibilidad',
    what: 'Precisión: de lo que el modelo marcó como fraude, qué fracción lo era. Sensibilidad (recall): de los fraudes reales, qué fracción detectó.',
    why: 'Con clases raras la exactitud engaña; estas dos dicen cuántas falsas alarmas y cuántos casos perdidos hay.',
  },
  desbalance: {
    term: 'Clases desbalanceadas',
    what: 'Cuando una clase es mucho más rara que la otra, como 1 fraude por cada 100 compras.',
    why: 'El modelo puede acertar 99 % sin detectar nada; hay que dar más peso a la clase rara o mirar otras métricas.',
  },
  extrapolar: {
    term: 'Extrapolar',
    what: 'Predecir fuera del rango de los datos con que se entrenó.',
    why: 'Los árboles no extrapolan: más allá de lo visto repiten el último valor.',
  },
  boosting: {
    term: 'Boosting',
    what: 'Entrenar modelos uno tras otro, cada uno enfocado en los errores que dejaron los anteriores, y sumarlos.',
    why: 'Corrige paso a paso, pero si se pasa de pasos empieza a corregir ruido.',
  },
  subsampleBoosting: {
    term: 'Fracción de filas por árbol (subsample)',
    what: 'En el Gradient Boosting clásico de scikit-learn, indica la fracción de filas de entrenamiento que se elige sin reposición para ajustar cada árbol. Con 1 se usan todas; con 0.8 se sortea un 80 % por etapa.',
    why: 'Introduce variación entre etapas y puede regularizar. Se compara junto con la tasa y la cantidad de árboles; no es el bootstrap con reposición de Random Forest.',
  },
  modeloDebil: {
    term: 'Modelo débil',
    what: 'Un modelo muy simple que por sí solo apenas mejora la predicción, como un árbol de uno o dos cortes.',
    why: 'Su complejidad limita qué correcciones puede representar cada árbol. Sumar muchos modelos simples también puede sobreajustar; se evalúa el conjunto con validación.',
  },
  gradiente: {
    term: 'Gradiente',
    what: 'La dirección en que más rápido sube el error si mueves la predicción (o los pesos de un modelo). Ir en sentido contrario lo baja.',
    why: 'Gradient Boosting entrena cada árbol para apuntar en esa dirección contraria (con error cuadrático, eso es el residuo); una red neuronal mueve cada peso un poco en ese sentido.',
  },
  paradaTemprana: {
    term: 'Parada temprana (early stopping)',
    what: 'Detener el entrenamiento cuando el error en datos de validación deja de bajar.',
    why: 'Es una regla de selección con validación y una tolerancia de mejora. No demuestra por sí sola que el modelo haya empezado a memorizar ruido; la prueba final sigue aparte.',
  },
  validacionCruzada: {
    term: 'Validación cruzada',
    what: 'Repetir el entrenamiento y la evaluación con distintas particiones de los datos disponibles para elegir el modelo. En la variante de k partes, cada parte sirve una vez para evaluar.',
    why: 'Permite comparar hiperparámetros sin usar la prueba final. Las particiones deben respetar el tiempo o los grupos de personas y máquinas cuando el problema lo exige.',
  },
  shap: {
    term: 'Valores SHAP',
    what: 'Para una predicción concreta, cuánto sumó o restó cada feature respecto al promedio.',
    why: 'Sirven para explicar modelos de caja negra caso por caso, por ejemplo a quién se le negó un crédito.',
  },
  faltantes: {
    term: 'Valores faltantes',
    what: 'Celdas vacías en la tabla (NaN): un sensor que no midió, un campo que nadie llenó.',
    why: 'Muchos modelos fallan con ellos y hay que rellenarlos antes; algunos los manejan solos.',
  },
  tabular: {
    term: 'Datos tabulares',
    what: 'Datos en forma de tabla: cada fila es un caso y cada columna una feature (edad, monto, ciudad).',
    why: 'Es donde los ensambles de árboles suelen ganar; en imágenes o texto suelen ganar las redes neuronales.',
  },
  categorica: {
    term: 'Feature categórica',
    what: 'Una feature cuyos valores son categorías sin orden numérico: ciudad, color, tipo de cliente.',
    why: 'Muchos modelos solo aceptan números y hay que codificarlas antes.',
  },
  lineaBase: {
    term: 'Línea base',
    what: 'El resultado de un modelo muy simple (o de predecir siempre la clase más común) contra el que se compara.',
    why: 'Si el modelo complejo no la supera con claridad, no vale su costo.',
  },
  bibliotecasBoosting: {
    term: 'XGBoost, LightGBM y CatBoost',
    what: 'Bibliotecas de Gradient Boosting optimizadas: agrupan valores, usan varios núcleos y manejan datos faltantes.',
    why: 'Son las que se usan en producción y en competencias; el GradientBoostingClassifier clásico es más lento.',
  },
  huber: {
    term: 'Pérdida de Huber',
    what: 'Una medida de error cuadrática para errores pequeños y lineal para los grandes.',
    why: 'Un outlier pesa mucho menos que con el error cuadrático puro.',
  },
  parametroC: {
    term: 'C (en SVM)',
    what: 'Cuánto se castiga cada punto que queda dentro del margen o del lado equivocado.',
    why: 'Aumentarlo da más peso a esas violaciones frente a mantener un margen amplio. Un C pequeño regulariza más. Se elige con validación, junto con el kernel, gamma y el escalado; C=1 no es un equilibrio universal.',
  },
  svmPesosClase: {
    term: 'Pesos de clase en SVM (class_weight)',
    what: 'Multiplican C para los ejemplos de cada clase: un peso mayor penaliza más sus violaciones del margen. Con balanced se calculan a partir de las frecuencias de las clases de entrenamiento.',
    why: 'Permiten comparar cómo se reparten los errores cuando hay clases poco frecuentes o costos distintos. No equivalen a probabilidades y no garantizan mejorar la métrica que te interesa.',
  },
  gamma: {
    term: 'γ (gamma, en el kernel RBF)',
    what: 'Qué tan lejos llega la influencia de cada punto: con γ grande, solo a sus vecinos inmediatos.',
    why: 'Se compara junto con C y las escalas. Grande permite influencias locales; pequeño extiende la influencia. No determina por sí solo el sobreajuste. SVC con kernel lineal ignora gamma; scale lo calcula a partir de la varianza que recibe el modelo.',
  },
  margenBlando: {
    term: 'Margen duro y margen blando',
    what: 'Duro: ningún punto puede quedar dentro del margen. Blando: se permite, pagando un castigo controlado por C.',
    why: 'Con datos reales casi siempre hay solapamiento, así que se usa el blando (es el de scikit-learn).',
  },
  dual: {
    term: 'Forma dual',
    what: 'Una manera equivalente de plantear el problema de la SVM en la que los datos solo aparecen como productos entre pares de puntos.',
    why: 'Es lo que permite cambiar esos productos por un kernel y obtener fronteras curvas.',
  },
  convexo: {
    term: 'Problema convexo',
    what: 'Un problema de optimización con forma de tazón: un solo fondo, sin hoyos falsos.',
    why: 'El algoritmo siempre llega al mejor resultado posible, sin depender del punto de partida.',
  },
  regularizacion: {
    term: 'Regularización',
    what: 'Penalizar los modelos demasiado complejos (pesos grandes, fronteras retorcidas) durante el entrenamiento.',
    why: 'Es la defensa principal contra el sobreajuste; en SVM, maximizar el margen cumple ese papel.',
  },
  hiperplano: {
    term: 'Hiperplano',
    what: 'La versión de una recta en más dimensiones: una recta en 2D, un plano en 3D y su equivalente con 64 features.',
    why: 'La SVM lineal separa las clases con uno; no se puede dibujar, pero se calcula igual.',
  },
  unoContraUno: {
    term: 'Uno contra uno',
    what: 'Para k clases, entrenar un clasificador por cada par de clases (k·(k−1)/2) y que voten.',
    why: 'Así una SVM, que separa dos clases, clasifica 10 dígitos con 45 modelos.',
  },
  disperso: {
    term: 'Datos dispersos',
    what: 'Tablas casi llenas de ceros, como el conteo de palabras: cada texto usa pocas de las miles posibles.',
    why: 'Hay algoritmos que aprovechan los ceros y entrenan mucho más rápido.',
  },
  calibracion: {
    term: 'Calibración de probabilidades',
    what: 'Comprobar o ajustar que, entre los casos a los que el modelo asigna 80 % de probabilidad positiva, cerca de 8 de cada 10 sean realmente positivos.',
    why: 'Clasificar bien no garantiza estimar bien las probabilidades. Evalúalo con datos separados; si hace falta, aplica una calibración y vuelve a medir.',
  },
  redConvolucional: {
    term: 'Red convolucional',
    what: 'Una red neuronal que recorre la imagen con pequeños filtros para detectar bordes, formas y objetos.',
    why: 'Desde 2012 domina el reconocimiento de imágenes, donde antes destacaban las SVM.',
  },
  odds: {
    term: 'Odds (momios)',
    what: 'Probabilidad de sí ÷ probabilidad de no. Si P = 0.8, los odds son 0.8/0.2 = 4 (4 a 1).',
    why: 'Naive Bayes y la regresión logística los multiplican factor por factor; al final se convierten de vuelta en probabilidad.',
  },
  bayes: {
    term: 'Teorema de Bayes',
    what: 'Regla para actualizar una probabilidad con evidencia nueva: probabilidad final ∝ probabilidad previa × qué tan probable es la evidencia.',
    why: 'Es la base de Naive Bayes: empieza con el prior y cada palabra lo actualiza.',
  },
  independenciaCondicional: {
    term: 'Independencia condicional',
    what: 'Suponer que, sabiendo la clase, ver una palabra no cambia la probabilidad de ver otra.',
    why: 'Es el supuesto «ingenuo»: casi nunca es cierto, pero simplifica tanto que permite entrenar contando.',
  },
  generativo: {
    term: 'Modelo generativo',
    what: 'Un modelo que aprende cómo son los datos de cada clase (qué palabras usa una reseña positiva) y de ahí deduce la clase.',
    why: 'Aprende con pocos datos; los discriminativos, como la regresión logística, suelen ganar cuando hay muchos.',
  },
  variantesNB: {
    term: 'Multinomial, Bernoulli y gaussiano',
    what: 'Variantes de Naive Bayes: multinomial cuenta cuántas veces aparece cada palabra; Bernoulli solo si aparece o no; gaussiano supone números continuos con forma de campana.',
    why: 'Se elige según el tipo de feature: conteos, sí/no o mediciones.',
  },
  ngrama: {
    term: 'N-grama (bigrama)',
    what: 'Una secuencia de n palabras seguidas tratada como una sola feature: «no funciona» es un bigrama.',
    why: 'Le da al modelo algo del orden de las palabras, que por sí solo no ve.',
  },
  incremental: {
    term: 'Aprendizaje incremental',
    what: 'Actualizar el modelo con datos nuevos sin volver a entrenar desde cero.',
    why: 'Útil cuando los textos llegan en flujo continuo (partial_fit en scikit-learn).',
  },
  tfidf: {
    term: 'TF-IDF (conteos de palabras ponderados)',
    what: 'Representar un texto con pesos que combinan cuántas veces aparece una palabra en él y qué tan común es en la colección de textos.',
    why: 'Reduce el peso de palabras muy comunes y destaca las más específicas. El vocabulario y sus pesos se aprenden solo con entrenamiento.',
  },
  vocabulario: {
    term: 'Vocabulario (bolsa de palabras)',
    what: 'La lista de palabras distintas vistas al entrenar; cada texto se convierte en el conteo de cada una, sin importar el orden.',
    why: 'Las palabras fuera del vocabulario se ignoran al predecir.',
  },
  transformer: {
    term: 'Transformer',
    what: 'La arquitectura de red neuronal detrás de los modelos de lenguaje actuales, como ChatGPT; procesa cada palabra en el contexto de las demás.',
    why: 'Capta negaciones y orden de las palabras mucho mejor que contar palabras, a cambio de mucho más cómputo y datos.',
  },
  correlacion: {
    term: 'Correlación',
    what: 'Qué tanto dos variables suben o bajan juntas: de −1 a 1.',
    why: 'Features muy correlacionadas cuentan casi la misma información; algunos modelos la cuentan doble.',
  },
  convergencia: {
    term: 'Convergencia del entrenamiento',
    what: 'El método llega a un ajuste en el que las actualizaciones ya son suficientemente pequeñas según su criterio de parada.',
    why: 'Converger no significa acertar todos los casos ni funcionar bien con datos nuevos. Si el límite de iteraciones se agota antes, el ajuste puede quedar incompleto.',
  },
  fuerzaRegularizacion: {
    term: 'C (inverso de la fuerza de regularización)',
    what: 'En regresión logística, un C pequeño penaliza más los coeficientes grandes; un C mayor permite ajustarse más a los datos de entrenamiento.',
    why: 'C cambia cómo se aprende y puede cambiar las probabilidades. Se elige con validación; es distinto del umbral, que convierte esas probabilidades en decisiones.',
  },
  regularizacionL1L2: {
    term: 'Regularización L1 (Lasso) y L2 (Ridge)',
    what: 'Dos formas de castigar pesos grandes: L1 (Lasso) suma sus valores absolutos y puede dejar algunos en 0 exacto; L2 (Ridge) suma sus cuadrados y los encoge a todos sin anularlos.',
    why: 'L1 sirve además para descartar features inútiles; L2 es la opción por defecto y más estable cuando hay features parecidas.',
  },
  dataset: {
    term: 'Dataset (conjunto de datos)',
    what: 'La tabla completa de ejemplos con que se trabaja: cada fila un caso, cada columna una feature o la etiqueta.',
    why: 'Su calidad y tamaño suelen limitar el resultado más que la elección del algoritmo.',
  },
  embedding: {
    term: 'Embedding',
    what: 'Una lista de números que representa algo complejo (una palabra, una imagen, un cliente) de modo que cosas parecidas quedan cerca.',
    why: 'Convierte texto o imágenes en features numéricas que los algoritmos clásicos sí pueden usar.',
  },
  solver: {
    term: 'Solver',
    what: 'El método numérico que busca los mejores pesos del modelo, como lbfgs o liblinear en scikit-learn.',
    why: 'Cambia la velocidad y qué regularización se permite; si no converge, scikit-learn avisa y conviene escalar o subir max_iter.',
  },
  batch: {
    term: 'Batch (lote)',
    what: 'Un grupo de ejemplos que se procesa de una vez en cada paso del entrenamiento, en lugar de todo el dataset.',
    why: 'Permite entrenar con datos que no caben en memoria y acelera el descenso de gradiente.',
  },
  descensoGradiente: {
    term: 'Descenso de gradiente',
    what: 'Ajustar los pesos a pasitos, cada vez en la dirección en que más baja el error, hasta que deja de bajar.',
    why: 'Es como se entrenan la regresión logística, las redes neuronales y muchos otros modelos.',
  },
  sigmoide: {
    term: 'Sigmoide',
    what: 'La curva en forma de S que convierte cualquier número en una probabilidad entre 0 y 1: 0 da 0.5, números grandes dan casi 1.',
    why: 'Es la que usa la regresión logística para pasar del puntaje a la probabilidad.',
  },
  softmax: {
    term: 'Softmax',
    what: 'La versión de la sigmoide para varias clases: convierte un puntaje por clase en probabilidades que suman 1.',
    why: 'Permite que la regresión logística y las redes neuronales elijan entre más de dos clases.',
  },
  pca: {
    term: 'PCA (análisis de componentes principales)',
    what: 'Una técnica que resume muchas features en unas pocas direcciones nuevas que conservan la mayor parte de la variación.',
    why: 'Reduce la dimensión antes de entrenar o para dibujar los datos en 2D.',
  },
  poda: {
    term: 'Poda (de un árbol)',
    what: 'Recortar ramas de un árbol ya construido para reducir su complejidad. En scikit-learn, ccp_alpha controla la poda por costo-complejidad; un valor mayor favorece árboles más pequeños.',
    why: 'La poda puede reducir el sobreajuste, pero también quitar patrones útiles. Se elige con validación. Limitar la profundidad o el mínimo por hoja restringe el crecimiento desde antes.',
  },
  entropia: {
    term: 'Entropía',
    what: 'Una medida de desorden: 0 si todos los ejemplos de un grupo son de la misma clase, máxima si están mezclados por igual.',
    why: 'Es una alternativa al Gini para elegir los cortes de un árbol; en la práctica suelen dar árboles parecidos.',
  },
  rocAuc: {
    term: 'Curva ROC y AUC',
    what: 'La curva ROC muestra, para cada umbral, cuántos positivos detecta el modelo contra cuántas falsas alarmas da. El AUC es el área bajo esa curva: 0.5 es azar y 1 es perfecto.',
    why: 'Compara modelos sin tener que elegir un umbral primero.',
  },
  exactitud: {
    term: 'Exactitud (accuracy)',
    what: 'La fracción de predicciones correctas: 90 aciertos de 100 son 90 %.',
    why: 'Es fácil de entender, pero engaña con clases desbalanceadas: acertar 99 % puede ser no detectar nada.',
  },
  redNeuronal: {
    term: 'Red neuronal',
    what: 'Un modelo hecho de muchas capas de operaciones simples (sumas con pesos y una función que dobla el resultado) que se ajustan con los datos.',
    why: 'Brillan con imágenes, audio y texto; con tablas pequeñas suelen perder contra los árboles y piden muchos más datos.',
  },
  regresion: {
    term: 'Regresión',
    what: 'Predecir un número: el precio de una casa, la demanda de mañana. Clasificar, en cambio, es elegir una categoría.',
    why: 'Muchos algoritmos tienen las dos versiones; saber cuál necesitas decide la métrica y la salida del modelo.',
  },
  rbf: {
    term: 'Kernel RBF (gaussiano)',
    what: 'Un kernel que mide qué tan cerca están dos puntos: vale 1 si son iguales y baja hacia 0 al alejarse.',
    why: 'Es el kernel por defecto de SVC: permite fronteras curvas, pero hay que elegir bien γ y escalar las features.',
  },
  smo: {
    term: 'SMO y LIBSVM',
    what: 'SMO es el método que entrena una SVM ajustando los pesos de dos puntos a la vez; LIBSVM es la biblioteca en C que lo implementa.',
    why: 'scikit-learn usa LIBSVM por dentro en SVC, así que su velocidad y sus resultados vienen de ahí.',
  },
  svr: {
    term: 'SVR (regresión con SVM)',
    what: 'La versión de SVM que predice números: busca una franja que contenga la mayoría de los puntos y solo castiga los que quedan fuera.',
    why: 'Sirve si te gusta la idea de SVM pero tu problema es estimar una cantidad, no una clase.',
  },
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
    why: 'Es lo que K-Means minimiza. El mínimo posible no aumenta al subir K; los arranques prácticos pueden dar resultados distintos. Compárala con la misma escala y los mismos datos, no como acierto.',
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
  kmGrupos: {
    term: 'Cantidad de grupos (n_clusters, K)',
    what: 'El número de centroides que K-Means busca. Se elige antes de entrenar; no es la cantidad de iteraciones.',
    why: 'Un K mayor puede dividir grupos y reducir la inercia sin producir segmentos más útiles. Compara silueta, estabilidad e interpretación.'
  },
  kmInicio: {
    term: 'Inicialización de centroides (init)',
    what: 'La regla para ubicar los centros antes de aprender: puntos aleatorios, k-means++ o coordenadas indicadas por ti.',
    why: 'Puede llevar a resultados diferentes con el mismo K. Los centros iniciales son un punto de partida, no el resultado entrenado.'
  },
  kmArranques: {
    term: 'Arranques independientes (n_init)',
    what: 'Cuántas veces se ejecuta K-Means desde centros iniciales diferentes. Se conserva la ejecución con menor inercia final.',
    why: 'Cada arranque contiene sus propias iteraciones. Más arranques cuestan más y pueden evitar soluciones peores; no garantizan el óptimo global ni descubren K.'
  },
  kmParada: {
    term: 'Parada de K-Means (max_iter y tol)',
    what: 'max_iter limita las iteraciones por arranque. tol permite detenerse cuando los centros se mueven suficientemente poco; también puede parar por asignaciones estables.',
    why: 'Llegar al límite no demuestra convergencia. Una tolerancia mayor permite parar antes y puede cambiar el resultado; no es un porcentaje de acierto.'
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
    what: 'Qué tanto se esparcen los valores alrededor de su promedio: el promedio de los cuadrados de las distancias al promedio.',
    why: 'En PCA, la dirección con más varianza es la que más diferencia a unos datos de otros; las de poca varianza suelen aportar poco, aunque no siempre.',
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
    what: 'Un autovector de una matriz es una dirección que la matriz solo estira o encoge (sin girarla); su autovalor dice cuánto la estira.',
    why: 'Los componentes principales son los autovectores de la matriz de covarianza, y cada autovalor es la varianza que captura el suyo.',
  },
  reconstruccion: {
    term: 'Error de reconstrucción',
    what: 'La diferencia entre los datos originales y los que se recuperan desde su versión comprimida.',
    why: 'Mide cuánto se pierde al comprimir; también sirve para detectar anomalías, que se reconstruyen peor.',
  },
  epsilon: {
    term: 'Radio de vecindario (eps, ε)',
    what: 'La distancia máxima para considerar vecinos a dos puntos en DBSCAN. Incluye la frontera: distancia menor o igual a eps.',
    why: 'El grupo puede medir mucho más que eps porque se encadenan núcleos. Su unidad depende de la distancia: no son siempre metros. Cambiar escala o métrica exige revisar eps.'
  },
  minPts: {
    term: 'Mínimo local (min_samples, minPts)',
    what: 'El mínimo de ejemplos dentro del vecindario para que un punto sea núcleo. Con pesos iguales, cuenta al propio punto: min_samples=4 requiere él y otros tres.',
    why: 'No solicita una cantidad de grupos. Aumentarlo hace más exigente la condición de núcleo. Si se usan pesos en fit, se compara su suma, no solo la cantidad de filas.'
  },
  puntoNucleo: {
    term: 'Núcleo, borde y ruido',
    what: 'Núcleo: alcanza el mínimo en su vecindario. Borde: no lo alcanza, pero es vecino de un núcleo. Ruido: ninguna de esas condiciones.',
    why: 'Solo los núcleos expanden el grupo; el borde se incorpora sin conectar grupos a través de sí mismo. Ruido significa fuera de los grupos con estos ajustes, no error ni anomalía confirmada.'
  },
  densidad: {
    term: 'Densidad local',
    what: 'Cuántos ejemplos hay cerca de un punto, según el vecindario y la distancia elegidos.',
    why: 'DBSCAN conecta núcleos con suficiente densidad y añade sus bordes. eps y min_samples fijan juntos la exigencia; no existe un único umbral adecuado para todos los conjuntos.'
  },
  dbMetrica: {
    term: 'Distancia en DBSCAN (metric y p)',
    what: 'La regla que decide qué puntos están dentro de eps. Euclidiana mide línea recta; Manhattan suma diferencias por eje. Con Minkowski, p=2 y p=1 dan esas distancias.',
    why: 'La métrica y las escalas cambian los vecinos, los núcleos y los grupos. p solo configura Minkowski: no transforma haversine ni convierte automáticamente grados a metros.'
  },
  dbBusqueda: {
    term: 'Búsqueda de vecinos (algorithm y leaf_size)',
    what: 'La forma de encontrar los vecindarios: brute compara todos; kd_tree y ball_tree usan índices. auto selecciona una opción compatible. leaf_size configura las hojas de esos índices.',
    why: 'Estos ajustes buscan cambiar tiempo y memoria, no la regla de densidad. Su conveniencia depende de la métrica y los datos. Los bordes compartidos también pueden depender del orden de exploración.'
  },
  haversine: {
    term: 'Distancia haversine',
    what: 'La distancia entre dos puntos sobre la superficie de una esfera, a partir de su latitud y longitud (en radianes).',
    why: 'Con coordenadas GPS, la distancia en línea recta entre grados no sirve: un grado de longitud mide menos lejos del ecuador.',
  },
  hdbscan: {
    term: 'HDBSCAN',
    what: 'Un método que construye una jerarquía de agrupamientos por densidad y selecciona grupos persistentes según sus criterios.',
    why: 'Es un candidato cuando un solo eps no describe todos los grupos. También tiene ajustes, como min_cluster_size y min_samples; no garantiza descubrir los grupos útiles para tu tarea.',
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
  neurona: {
    term: 'Neurona (artificial)',
    what: 'Una operación pequeña: multiplica cada entrada por un peso, suma todo más un sesgo y pasa el resultado por una función de activación.',
    why: 'Una sola neurona traza una recta (o un plano); muchas, en capas, trazan fronteras curvas.',
  },
  mlpArquitectura: {
    term: 'Arquitectura MLP (hidden_layer_sizes)',
    what: 'La cantidad de capas ocultas y de neuronas por capa. (32,) indica una capa de 32; (32, 16), dos capas con 32 y 16.',
    why: 'La arquitectura se elige antes de entrenar; los pesos y sesgos se aprenden después. Más neuronas aumentan capacidad y costo, sin garantizar mejor desempeño con datos nuevos.'
  },
  mlpOptimizador: {
    term: 'Optimizador y paso inicial (solver, learning_rate_init)',
    what: 'El optimizador decide cómo actualizar pesos. En MLPClassifier, Adam y SGD usan learning_rate_init; L-BFGS no usa ese ajuste ni minibatches.',
    why: 'Una tasa mayor puede acelerar o desestabilizar el entrenamiento. learning_rate configura un calendario solo para SGD; no cambia el calendario de Adam.'
  },
  mlpRegularizacion: {
    term: 'Penalización de pesos (alpha en MLPClassifier)',
    what: 'La fuerza de la penalización L2 sobre los pesos. Se divide por la cantidad de ejemplos al agregarse a la pérdida; no es la tasa de aprendizaje.',
    why: 'Puede limitar ajustes excesivos, pero una penalización alta también puede impedir aprender relaciones útiles. Se elige con validación, no mirando la prueba final.'
  },
  mlpParada: {
    term: 'Parada de MLP (max_iter, tol, early_stopping)',
    what: 'Con Adam o SGD, max_iter limita épocas. tol y n_iter_no_change definen cuánto tiempo esperar mejoras. early_stopping usa una fracción interna de validación para decidir la parada.',
    why: 'Sin early_stopping se vigila la pérdida de entrenamiento; con él se vigila el acierto en validación. Alcanzar el límite no demuestra convergencia ni sobreajuste. Con L-BFGS, max_iter cuenta iteraciones del optimizador.'
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
    why: 'Achica el mapa a la mitad y hace que la red tolere que el patrón se mueva un píxel, más o menos. La convolución es equivariante: si el patrón se mueve, el mapa se mueve igual; el pooling añade un poco de invariancia: el resumen casi no cambia.',
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
    what: 'Al retropropagar por muchos pasos, el gradiente se multiplica una y otra vez por factores: si son menores que 1 se encoge hacia 0; si son mayores que 1 de forma sostenida (pasa con matrices de pesos grandes, no en una sola neurona con tanh, que se satura), crece sin control.',
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
    what: 'Dos familias de Transformer. BERT lee la frase completa en ambas direcciones y sirve para clasificar y buscar texto; GPT lee de izquierda a derecha y genera texto.',
    why: 'Elegir entre ellas depende de si necesitas clasificar o buscar (BERT) o redactar y conversar (GPT).',
  },
  llm: {
    term: 'Modelo de lenguaje grande (LLM)',
    what: 'Un Transformer tipo GPT con miles de millones de pesos, entrenado para predecir el siguiente token en enormes cantidades de texto. ChatGPT es uno, ajustado además para conversar.',
    why: 'Redacta, resume y traduce con fluidez, pero, por sí solo, no consulta una base de datos de hechos: puede inventar.',
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
} satisfies Record<string, GlossaryEntry>;

export type GlossaryKey = keyof typeof GLOSSARY;
