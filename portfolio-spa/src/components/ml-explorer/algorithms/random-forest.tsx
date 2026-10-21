import { G } from '../Gloss';
import { Tex } from '../Tex';
import { RandomForestOva } from '../ovas/RandomForestOva';
import type { AlgorithmModule } from '../types';
import code from './python/random-forest.py?raw';
import expectedOutput from './python/random-forest.out.txt?raw';

const randomForest: AlgorithmModule = {
  slug: 'random-forest',
  row: {
    type: 'Supervisado', bestUse: 'Tareas donde importa la exactitud', formula: 'Bagging de árboles de decisión',
    assumptions: 'Poca correlación entre los árboles', pros: 'Reduce el sobreajuste',
    cons: 'Más lento, menos interpretable', whenNot: 'Predicciones en tiempo real muy exigentes', realWorld: 'Detección de fraude',
  },
  tabs: {
    type: {
      essential: <>
        <p><b><G k="supervisado">Supervisado</G>:</b> aprende de clientes con respuesta conocida. Es un <G k="ensamble">ensamble</G>: combina árboles que aprenden con distintas muestras y variables. Puede clasificar o predecir cantidades.</p>
        <p>En clasificación, esta OVA usa mayoría de votos. <b>RandomForestClassifier promedia las probabilidades que entregan las hojas</b> y elige la clase con mayor promedio. Ambas reglas pueden dar resultados distintos, especialmente con hojas que mezclan clases.</p>
        <h4>Qué ajustas y qué aprende el bosque</h4>
        <p>Los <G k="hiperparametro">hiperparámetros</G> configuran el entrenamiento; las preguntas, cortes y respuestas de las hojas son <G k="parametroAprendido">parámetros aprendidos</G>.</p>
        <ul>
          <li><b>Número de árboles — <code>n_estimators</code>:</b> cuántos se entrenan y combinan. Más árboles pueden estabilizar el resultado, con más tiempo y memoria; el acierto no tiene por qué subir en cada incremento.</li>
          <li><b>Profundidad — <code>max_depth</code>:</b> limita las preguntas en cada recorrido de cada árbol. <code>None</code> no fija ese límite, pero otras condiciones pueden detenerlo.</li>
          <li><b>Mínimo por hoja — <code>min_samples_leaf</code>:</b> exige suficientes ejemplos en ambos lados de cada corte. Subirlo evita <G k="minimoHoja">hojas pequeñas</G>, aunque puede perder patrones útiles.</li>
          <li><b>Variables por corte — <code>max_features</code>:</b> cuántas columnas se consideran inicialmente al buscar cada corte; no cuántas columnas acepta el bosque. En clasificación, <code>'sqrt'</code> usa la raíz cuadrada del número de columnas, redondeada hacia abajo y con mínimo 1. <code>None</code> considera todas.</li>
          <li><b>Muestreo — <code>bootstrap</code>:</b> con <code>True</code>, cada árbol recibe una muestra con reposición: puede repetir filas y dejar otras fuera. Con <code>False</code>, usa todas las filas. La selección aleatoria de variables todavía puede producir árboles distintos.</li>
        </ul>
        <p>La OVA permite experimentar con estos cinco ajustes sobre dos variables. El avance muestra bosques parciales: <b>mostrar 10 de 100 árboles no cambia los 100 solicitados</b>. La velocidad es un <G k="controlDidactico">control de visualización</G>.</p>
        <p>Compara ajustes con <G k="datosValidacion">validación</G>, y reserva una prueba final. La semilla (<code>random_state</code> en Python) facilita reproducir un resultado; no conviene buscar la semilla que más acierte.</p>
      </>,
      deepDive: <>
        <p><code>criterion</code>, <code>min_samples_split</code>, <code>max_samples</code> y <code>class_weight</code> son otros ajustes. La OVA mantiene <G k="gini">Gini</G> y mínimo 2 antes de dividir; con muestreo hace tantas extracciones como filas hay. Python deja sus valores explícitos.</p>
        <p>Consulta la <a href="https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html" target="_blank" rel="noreferrer">documentación de RandomForestClassifier</a> y la <a href="https://scikit-learn.org/stable/modules/ensemble.html#forest" target="_blank" rel="noreferrer">guía de bosques de scikit-learn</a>.</p>
      </>,
    },
    bestUse: {
      essential: <>
        <p>Es un candidato para <G k="tabular">datos tabulares</G> cuando hay combinaciones y relaciones que un modelo lineal o un árbol pequeño no recoge bien.</p>
        <ul><li>Clasificar compras para revisión por posible fraude.</li><li>Predecir abandono a partir de actividad y características de clientes.</li><li>Estimar fallas de máquinas según mediciones y uso.</li></ul>
        <p>Empieza con una <G k="lineaBase">línea base</G>, como regresión logística o un árbol pequeño. Compara el bosque con Gradient Boosting usando las mismas particiones y medidas. Mide también memoria y tiempo de respuesta.</p>
        <p className="mlx-rule">Prueba primero un tamaño manejable; ajusta el crecimiento de los árboles y las variables por corte. Aumenta el número de árboles si la mejora o estabilidad observada compensa el costo.</p>
      </>,
      deepDive: <>
        <p>No necesita <G k="escalado">escalar</G> las columnas numéricas para comparar cortes. Sí requiere representar las categorías de forma adecuada y revisar qué información estará disponible al predecir.</p>
        <p>Con <code>bootstrap=True</code>, <code>oob_score=True</code> puede estimar rendimiento usando, para cada fila, los árboles que no la incluyeron en su muestra (<G k="oob">OOB</G>). Si eliges ajustes mirando esa estimación, no la presentes también como una prueba final independiente.</p>
      </>,
    },
    formula: {
      essential: <>
        <p><b>Ejemplo de la OVA:</b> si tres de cinco árboles votan impago, gana impago. El <G k="acuerdoBosque">acuerdo</G> es 60 %; no significa 60 % de aciertos ni una <G k="calibracion">probabilidad calibrada</G> de impago.</p>
        <ol><li>Con <G k="bootstrap">muestreo con reposición</G>, se forman muestras que pueden repetir clientes.</li><li>En cada corte se sortean variables candidatas según <code>max_features</code>.</li><li>Se combinan las respuestas de los árboles.</li></ol>
        <Tex block>{'\\hat{y}_{\\mathrm{OVA}}(x) = \\text{mayoría}\\{h_1(x),\\ldots,h_B(x)\\}'}</Tex>
        <p>En Python, cada árbol entrega una probabilidad por clase. Por ejemplo, dos árboles dan 0,51 y uno 0: el promedio es 0,34 para esa clase, aunque dos de tres votos individuales la prefieran. Por eso promediar probabilidades no siempre equivale a contar votos.</p>
        <Tex block>{'\\hat{p}_c(x)=\\frac{1}{B}\\sum_{b=1}^{B} p_{b,c}(x),\\qquad \\hat{y}(x)=\\operatorname{argmax}_c\\hat{p}_c(x)'}</Tex>
        <p><Tex>{'B'}</Tex> es el número de árboles. En la OVA compara tamaños con los demás ajustes fijos; la comparación simulada puede subir, bajar o mantenerse.</p>
      </>,
      deepDive: <>
        <p>Un modelo ilustrativo con árboles de igual <G k="sesgoVarianza">varianza</G> y correlación común <Tex>{'\\rho'}</Tex> muestra por qué importa su diversidad:</p>
        <Tex block>{'\\operatorname{Var}(\\bar h)=\\rho\\sigma^2+\\frac{1-\\rho}{B}\\sigma^2'}</Tex>
        <p>Al crecer <Tex>{'B'}</Tex>, el segundo término baja; la parte compartida no desaparece. Es una explicación simplificada de la reducción de variabilidad, no una fórmula para predecir el acierto de cualquier bosque.</p>
      </>,
    },
    assumptions: {
      essential: <>
        <p>No exige relaciones lineales ni una distribución concreta. Para que combinar árboles ayude, conviene que <b>sus errores no sean idénticos</b>; <code>bootstrap</code> y <code>max_features</code> influyen en esa <G k="diversidadBosque">diversidad</G>.</p>
        <p>Necesita datos representativos, respuestas fiables y variables disponibles al predecir. Si todos los árboles aprenden la misma <G k="fugaInformacion">fuga de información</G>, combinarlos no la corrige.</p>
      </>,
      deepDive: <p>En <G k="regresion">regresión</G>, un bosque estándar promedia respuestas de sus hojas; no puede <G k="extrapolar">extrapolar</G> fuera del rango de los objetivos que aprendió.</p>,
    },
    pros: {
      essential: <ul>
        <li><b>Puede reducir la variabilidad:</b> combinar árboles distintos suele hacer el resultado menos sensible que un solo árbol; no elimina automáticamente el <G k="overfitting">sobreajuste</G>.</li>
        <li><b>Captura combinaciones:</b> encuentra interacciones entre columnas sin definirlas todas a mano. El <G k="escalado">escalado</G> numérico no es necesario para comparar sus cortes.</li>
        <li><b>Permite explorar señales:</b> compara importancia por impureza con <G k="importanciaPermutacion">importancia por permutación</G>; ninguna demuestra causalidad.</li>
      </ul>,
      deepDive: <p>Los árboles se pueden entrenar en paralelo con <code>n_jobs</code>. La importancia por impureza favorece columnas con muchos valores distintos; las variables <G k="correlacion">correlacionadas</G> complican la interpretación de ambas medidas.</p>,
    },
    cons: {
      essential: <ul>
        <li><b>Menor legibilidad:</b> revisar cientos de árboles es más difícil que leer uno pequeño.</li>
        <li><b>Costo de cálculo:</b> más árboles y más hojas consumen memoria y tiempo, incluso si el acierto ya se estabilizó.</li>
        <li><b>Puede aprender ruido:</b> el acierto sobre entrenamiento no mide el rendimiento con datos nuevos.</li>
        <li><b>Probabilidades que requieren revisión:</b> mucha coincidencia entre árboles no garantiza <G k="calibracion">calibración</G>.</li>
      </ul>,
      deepDive: <p>La OVA simplifica el método con votos de clase, dos variables y un generador de azar propio. Sus cifras no reproducen las de scikit-learn. Los 40 casos simulados son una comparación didáctica reutilizada, con algunas coordenadas coincidentes con entrenamiento; no una prueba independiente.</p>,
    },
    whenNot: {
      essential: <>
        <p className="mlx-rule">Si necesitas reglas breves o tienes límites estrictos de memoria y respuesta, compara primero un modelo lineal o un árbol pequeño.</p>
        <p>Para relaciones <G k="tabular">tabulares</G> complejas, compara Gradient Boosting; no hay un ganador universal. Con imágenes, audio o texto largo, suele ser más importante construir o aprender una buena representación que aumentar el bosque.</p>
      </>,
      deepDive: <p>Si la tarea necesita contexto de una secuencia o aprender desde píxeles, considera <G k="redNeuronal">redes neuronales</G> apropiadas y modelos ya entrenados. Un bosque todavía puede servir sobre medidas útiles extraídas de esas entradas.</p>,
    },
    realWorld: {
      essential: <>
        <p><b>Detector educativo de fraude:</b> genera 1 000 compras simuladas con monto, hora, distancia, intentos fallidos y antigüedad. Esta última no interviene en la regla generadora, pero puede adquirir importancia aparente por azar.</p>
        <p>Python separa entrenamiento, validación y prueba. Compara un árbol y varias configuraciones de bosque con validación; elige una configuración antes de evaluar la prueba final. Los ajustes quedan explícitos para modificarlos y observar el efecto.</p>
        <p>La OVA clasifica pago/impago con 28 clientes y dos variables; el ejercicio usa compras y cinco columnas. Comparten conceptos, pero sus cifras no son directamente comparables.</p>
      </>,
      deepDive: <>
        <p>Si hay pocas compras fraudulentas, acertar la clase mayoritaria puede ocultar muchos casos perdidos. Revisa <G k="precisionSensibilidad">precisión y sensibilidad</G> y la <G k="matrizConfusion">matriz de confusión</G> según el costo de cada error.</p>
        <p><code>class_weight</code> modifica el entrenamiento; el <G k="umbral">umbral</G> modifica la decisión posterior. Se eligen con validación. La importancia por permutación del ejercicio se calcula también con validación, antes de consultar la prueba final.</p>
      </>,
    },
  },
  Ova: RandomForestOva, ovaTab: 'type', autoPlayOva: true,
  python: { code, expectedOutput, colabNotebook: 'random-forest' },
  inYourField: [
    { area: 'Industrial', example: 'predecir qué máquina fallará en la próxima semana a partir de vibración, temperatura y horas de uso.' },
    { area: 'Ambiental', example: 'clasificar el uso del suelo a partir de medidas extraídas de imágenes satelitales.' },
    { area: 'Civil', example: 'estimar fallas de tuberías según edad, material, presión y tipo de suelo.' },
  ],
  alternatives: ['gradient-boosting', 'decision-tree', 'logistic-regression'],
};
export default randomForest;
