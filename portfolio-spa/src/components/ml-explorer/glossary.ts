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
    what: 'Combinar muchos modelos (por ejemplo, 100 árboles) y promediar, votar o sumar sus respuestas.',
    why: 'Random Forest promedia árboles para reducir la inestabilidad de uno solo; Gradient Boosting los suma uno tras otro para corregir sus errores.',
  },
  interpretable: {
    term: 'Modelo interpretable',
    what: 'Un modelo cuyo razonamiento puedes leer y explicar, como «cada m² suma 2.5 millones».',
    why: 'En crédito, salud o decisiones públicas a menudo es obligatorio explicar por qué se decidió algo.',
  },
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
    what: 'La franja entre la frontera de decisión y los puntos más cercanos de cada clase. Con margen duro queda vacía; con margen blando (el de scikit-learn) se deja que algunos puntos entren, a cambio de un castigo C.',
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
  bagging: {
    term: 'Bagging',
    what: 'Entrenar muchos modelos, cada uno con una muestra bootstrap distinta de los datos, y promediar o votar sus respuestas.',
    why: 'Promediar modelos que se equivocan en sitios distintos reduce la inestabilidad de cada uno.',
  },
  oob: {
    term: 'Puntaje OOB (fuera de la bolsa)',
    what: 'El acierto del bosque medido fila por fila, usando solo los árboles que no vieron esa fila en su muestra bootstrap (cerca de un tercio de los árboles).',
    why: 'Da una estimación de cómo le irá con datos nuevos sin apartar un conjunto de prueba.',
  },
  importanciaPermutacion: {
    term: 'Importancia por permutación',
    what: 'Cuánto cae el acierto del modelo en datos nuevos si revuelves al azar una columna.',
    why: 'Si revolverla no cambia nada, el modelo no depende de esa feature; es más confiable que la importancia por impureza.',
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
  modeloDebil: {
    term: 'Modelo débil',
    what: 'Un modelo muy simple que por sí solo apenas mejora la predicción, como un árbol de uno o dos cortes.',
    why: 'Boosting suma cientos de ellos; al ser simples, cada uno corrige poco y es difícil que memorice.',
  },
  gradiente: {
    term: 'Gradiente',
    what: 'La dirección en que más rápido sube el error si mueves la predicción. Ir en sentido contrario lo baja.',
    why: 'Gradient Boosting entrena cada árbol para apuntar en esa dirección contraria; con error cuadrático, eso es el residuo.',
  },
  paradaTemprana: {
    term: 'Parada temprana (early stopping)',
    what: 'Detener el entrenamiento cuando el error en datos de validación deja de bajar.',
    why: 'Evita seguir sumando árboles que solo memorizan ruido, sin adivinar el número de antemano.',
  },
  validacionCruzada: {
    term: 'Validación cruzada',
    what: 'Dividir los datos de entrenamiento en k partes y entrenar k veces, midiendo cada vez en la parte que quedó fuera.',
    why: 'Permite elegir hiperparámetros sin gastar los datos de prueba, que se reservan para la medición final.',
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
    why: 'C pequeño: margen ancho y tolerante. C grande: margen estrecho que intenta acertar cada punto y puede memorizar.',
  },
  gamma: {
    term: 'γ (gamma, en el kernel RBF)',
    what: 'Qué tan lejos llega la influencia de cada punto: con γ grande, solo a sus vecinos inmediatos.',
    why: 'γ muy grande da fronteras que rodean cada punto (sobreajuste); muy pequeño, fronteras casi rectas.',
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
    what: 'Ajustar las probabilidades para que «80 %» signifique que acierta 8 de cada 10 veces. El escalado de Platt ajusta una curva logística sobre las salidas del modelo.',
    why: 'SVM y Naive Bayes clasifican bien pero sus probabilidades no son confiables sin calibrar.',
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
  vocabulario: {
    term: 'Vocabulario (bolsa de palabras)',
    what: 'La lista de palabras distintas vistas al entrenar; cada texto se convierte en el conteo de cada una, sin importar el orden.',
    why: 'Las palabras fuera del vocabulario se ignoran al predecir.',
  },
  transformer: {
    term: 'Transformer',
    what: 'La arquitectura de red neuronal detrás de los modelos de lenguaje actuales; lee cada palabra en el contexto de las demás.',
    why: 'Entiende negaciones y orden, a cambio de mucho más cómputo y datos.',
  },
  correlacion: {
    term: 'Correlación',
    what: 'Qué tanto dos variables suben o bajan juntas: de −1 a 1.',
    why: 'Features muy correlacionadas cuentan casi la misma información; algunos modelos la cuentan doble.',
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
    what: 'Recortar las ramas de un árbol de decisión que aportan poco, o impedir que crezca más allá de cierta profundidad.',
    why: 'Un árbol sin podar memoriza los datos; podarlo es la forma básica de evitar el sobreajuste.',
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
    what: 'Núcleo: hay al menos minPts puntos (contándose él) a distancia ε o menos. Borde: no los tiene, pero es vecino de un núcleo. Ruido: ninguna de las dos cosas.',
    why: 'DBSCAN arma cada grupo con núcleos vecinos entre sí y sus bordes; el ruido queda fuera de todo grupo.',
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
} satisfies Record<string, GlossaryEntry>;

export type GlossaryKey = keyof typeof GLOSSARY;
