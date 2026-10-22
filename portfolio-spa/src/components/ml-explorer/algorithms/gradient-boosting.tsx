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
    assumptions: 'Los patrones deben mantenerse en datos nuevos',
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
            <b><G k="supervisado" after=":">Supervisado</G></b> aprende de ejemplos con respuesta (clientes que pagaron o no).
          </p>
          <p>
            Es un <G k="ensamble">ensamble</G> de árboles entrenados <b>en secuencia</b>: cada árbol nuevo
            se entrena para corregir los errores que dejaron los anteriores.
          </p>
          <p>
            Sirve para predecir números y para clasificar. El simulador predice el consumo eléctrico a lo largo
            del día (así es fácil ver cómo disminuye el error); el ejercicio clasifica.
          </p>
          <h4>Qué puedes ajustar</h4>
          <p>Los <G k="hiperparametro">hiperparámetros</G> configuran el entrenamiento; los cortes y las predicciones de las hojas se aprenden después.</p>
          <ul>
            <li><b>Cantidad — <code>n_estimators</code>:</b> etapas de corrección. En regresión y clasificación binaria hay un árbol por etapa; en multiclase, el clasificador clásico construye uno por clase en cada etapa. La OVA permite 10, 20, 35 o 50 árboles.</li>
            <li><b>Aporte — <code>learning_rate</code>:</b> multiplica lo que predice cada árbol. Ajusta la <G k="tasaAprendizaje">tasa</G> junto con la cantidad: menos aporte puede exigir más etapas, sin garantizar mejores resultados.</li>
            <li><b>Complejidad — <code>max_depth</code> y <code>min_samples_leaf</code>:</b> limitan la <G k="estructuraArbol">profundidad</G> y exigen un <G k="minimoHoja">mínimo por hoja</G>. Más profundidad permite correcciones más complejas; un mínimo mayor evita grupos pequeños y también puede perder patrones útiles.</li>
            <li><b>Filas por etapa — <code>subsample</code>:</b> la <G k="subsampleBoosting">fracción de filas</G> usada para entrenar cada árbol. Con 1 se usan todas; con menos de 1 se sortea sin reposición.</li>
            <li><b>Cuándo detenerse:</b> la <G k="paradaTemprana">parada temprana</G> compara mejoras en validación. En el clasificador clásico, <code>n_iter_no_change</code> fija la paciencia, <code>tol</code> la mejora mínima y <code>validation_fraction</code> la fracción reservada. No son los pasos de reproducción.</li>
          </ul>
          <p className="mlx-rule">Activa «Mostrar conjunto final» y compara primero tasa 0,1 frente a 0,3 con 10 árboles; luego compara 10 y 50 con la misma tasa. El <G k="mse">MSE</G> de la OVA es de entrenamiento. Python elige con validación y consulta la prueba al final.</p>
          <p>En la OVA se mantienen profundidad 1, mínimo por hoja 1, todas las filas y pérdida cuadrática. El ejercicio usa <code>GradientBoostingClassifier</code> con <G k="perdidaLog">pérdida logarítmica</G>. Otros modelos, como HistGradientBoosting, XGBoost o LightGBM, tienen ajustes propios; no se trasladan todos estos nombres automáticamente.</p>
        </>
      ),
      deepDive: (
        <p>
          Es <G k="boosting" after=":">boosting</G> suma <G k="modeloDebil">modelos débiles</G> (árboles pequeños, por lo
          general de 1 a 8 niveles; 3 por defecto en scikit-learn) para formar uno fuerte. Otras implementaciones son <G k="bibliotecasBoosting">XGBoost, LightGBM, CatBoost</G> y{' '}
          <code>HistGradientBoostingClassifier</code> de scikit-learn, que agrupan los valores en intervalos para
          entrenar mucho más rápido.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo con <b><G k="tabular">datos en tabla</G></b> cuando una línea base deja relaciones sin recoger y puedes comparar ajustes con <G k="datosValidacion">validación</G>.
          </p>
          <ul>
            <li>Scoring de crédito: probabilidad de impago.</li>
            <li>Pronóstico de demanda (ventas, energía) con calendario y clima.</li>
            <li>Ordenar resultados por relevancia con una implementación y una pérdida diseñadas para ranking; el clasificador del ejercicio no realiza esa tarea.</li>
          </ul>
          <p className="mlx-rule">
            Es un candidato para tablas, sin garantía de ganar. Empieza por una <G k="lineaBase">línea base</G> simple:
            compáralo siempre con ella.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Prueba una rejilla pequeña de tasa y número de etapas con las mismas particiones. Después compara profundidad, mínimo por hoja y fracción de filas. Para demanda futura, respeta el tiempo al separar los datos; no repartas horas al azar como si fueran independientes.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> hay que predecir un valor real de 7. El modelo arranca con el promedio, 5: el error{' '}
            <G before="(" k="residuo" after=")">residuo</G> es 7 − 5 = 2. Supón que el primer árbol aprende a predecir ese 2. No se
            suma entero, solo una fracción, la{' '}
            <G k="tasaAprendizaje" after=":">tasa de aprendizaje</G> con 0.3, la predicción pasa a 5 + 0.3 · 2 = 5.6. El
            siguiente árbol mira el error que queda (1.4) y repite.
          </p>
          <Tex block>{'F_m(x) = F_{m-1}(x) + \\eta \\cdot h_m(x)'}</Tex>
          <p>
            <Tex>{'F_m'}</Tex> es el modelo tras <Tex>{'m'}</Tex> árboles, <Tex>{'h_m'}</Tex> el árbol nuevo
            (entrenado con los errores de <Tex after=")">{'F_{m-1}'}</Tex> y <Tex>{'\\eta'}</Tex> la tasa de aprendizaje.
          </p>
          <p>
            En el simulador, con tasa 0.3, el <G k="mse">error cuadrático medio</G> sobre esos mismos puntos baja de
            2.41 (solo el promedio) a 0.73 con 10 árboles y a 0.06 con 50. Es error de entrenamiento: esa reducción no demuestra una mejora en días nuevos ni permite diagnosticar <G k="overfitting">sobreajuste</G> por sí sola.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Con pérdida cuadrática, cada árbol se ajusta a los residuos <Tex after=".">{'y_i - F_{m-1}(x_i)'}</Tex> En general
            se ajusta al <G k="gradiente">gradiente negativo</G> de la pérdida (de ahí el nombre):
          </p>
          <Tex block>{'r_{im} = -\\left[\\frac{\\partial L(y_i, F(x_i))}{\\partial F(x_i)}\\right]_{F = F_{m-1}}'}</Tex>
          <p>
            Para clasificar, <Tex>{'F'}</Tex> es un <G k="logOdds">log-odds</G> y la pérdida es la{' '}
            <G k="perdidaLog" after=".">pérdida logarítmica</G> Valores por defecto en scikit-learn: 100 árboles, tasa 0.1,
            profundidad 3. Una tasa menor cambia el aporte de cada árbol y puede exigir más etapas. La combinación se elige con validación.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Necesita ejemplos representativos y una separación de evaluación que refleje el uso previsto. Sumar <G k="modeloDebil">árboles pequeños</G> permite construir relaciones complejas, pero no garantiza una buena predicción fuera del entrenamiento.
          </p>
          <p>
            Los errores restantes pueden contener patrón y <G k="ruido">ruido</G>. Comprueba con validación si seguir añadiendo árboles ayuda; un error de entrenamiento menor no decide por sí solo.
          </p>
        </>
      ),
      deepDive: (
        <>
        <p>
          No supone linealidad ni necesita <G k="escalado">escalar</G> las <G k="feature" after=".">features</G>
        </p>
        <p>
          Las etiquetas
          deben ser confiables: con la pérdida
          cuadrática, un valor atípico produce un <G k="residuo">residuo</G> enorme que los árboles siguientes persiguen. Para regresión
          con <G k="outlier">outliers</G> existe la <G k="huber">pérdida de Huber</G> (<code>loss="huber"</code>).
        </p>
        </>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Muy preciso en tablas:</b> puede recoger relaciones no lineales e interacciones entre columnas. Compáralo con alternativas en tu problema.
          </li>
          <li>
            <b>Flexible:</b> sirve para clasificar, para predecir números y para ordenar, cambiando la pérdida.
          </li>
          <li>
            <b>Poca preparación:</b> como el bosque, no hay que escalar{' '}
            <G k="feature" after=".">features</G> <G k="bibliotecasBoosting" after=",">XGBoost</G> LightGBM y
            HistGradientBoosting aceptan <G k="faltantes" after=";">valores faltantes</G> el GradientBoostingClassifier
            clásico, no (da error con NaN).
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Al corregir errores paso a paso reduce sobre todo el <G k="sesgoVarianza" after=",">sesgo</G> mientras que Random
          Forest reduce sobre todo la varianza. <code>HistGradientBoostingClassifier</code>
          maneja valores faltantes y <G k="categorica">features categóricas</G>{' '}
          de forma nativa y escala a millones de filas.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Riesgo de <G k="overfitting" after=":">sobreajuste</G></b> el error de entrenamiento puede seguir bajando mientras el de validación empeora. El ejercicio muestra ambas curvas y reserva una prueba final.
          </li>
          <li>
            <b>Entrenamiento secuencial:</b> cada árbol espera al anterior, así que los árboles no se reparten entre
            procesadores. <G k="bibliotecasBoosting" after=",">XGBoost</G> LightGBM y HistGradientBoosting sí reparten el trabajo dentro de cada árbol; el
            GradientBoostingClassifier clásico del ejercicio usa un solo núcleo.
          </li>
          <li>
            <b>Muchos <G k="hiperparametro" after=":">hiperparámetros</G></b> número de árboles, tasa, profundidad… y
            dependen entre sí.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          La defensa estándar es la <G k="paradaTemprana" after=":">parada temprana</G> apartar una parte de los datos y detener el entrenamiento
          cuando la pérdida en ellos deja de bajar (<code>n_iter_no_change</code> y{' '}
          <code>validation_fraction</code> en scikit-learn). También ayudan árboles poco profundos, tasa pequeña y
          entrenar cada árbol con una fracción de las filas (<code>subsample</code>). En
          HistGradientBoostingClassifier la parada temprana se activa sola con más
          de 10 000 filas (<code>early_stopping="auto"</code>).
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">Si hay pocas observaciones o respuestas poco confiables, corrige y revisa los datos antes de aumentar la complejidad.</p>
          <p>
            Ejemplo: 200 clientes, con errores de digitación en quién pagó y quién no. Cada árbol nuevo persigue esos
            errores. Compara con Random Forest y regresión logística usando las mismas particiones; ninguno garantiza estabilidad con etiquetas incorrectas.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Tampoco es la primera opción con imágenes, audio o texto largo (puedes comparar representaciones aprendidas por <G k="redNeuronal" after="),">redes neuronales</G> ni si
          debes explicar cada decisión regla por regla. Para explicarlo se usan herramientas aparte, como los <G k="shap" after=",">valores
          SHAP</G> que estiman cuánto aportó cada <G k="feature">feature</G> a una predicción.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Scoring de crédito.</b> Bancos y fintechs estiman la probabilidad de impago con ingreso, nivel de
            deuda, pagos atrasados y edad. Los modelos de <G k="boosting">boosting</G> son comunes en esta tarea, junto con la regresión
            logística, que se sigue usando porque es fácil de explicar al cliente y al regulador.
          </p>
          <p>
            El ejercicio genera 800 clientes simulados: 480 para entrenar, 160 para elegir ajustes y 160 para la prueba final. Compara tres tasas hasta 300 árboles, elige la combinación con menor pérdida de validación y evalúa una sola vez la prueba. Las curvas muestran entrenamiento y validación, sin consultar la prueba para decidir. Es una demostración didáctica; no valida un sistema de decisiones crediticias.
          </p>
        </>
      ),
      deepDive: (
        <p>
          El ejercicio conserva los mismos límites de árbol para comparar tasa y cantidad. Puedes ampliar la búsqueda a profundidad, mínimo por hoja y subsample usando validación, manteniendo la prueba aparte. En datos reales de clientes, respeta las fechas y evita que una misma persona quede repartida entre conjuntos cuando evalúes personas nuevas.
          Referencias: <a href="https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.GradientBoostingClassifier.html" target="_blank" rel="noreferrer">ajustes del clasificador</a> y <a href="https://scikit-learn.org/stable/modules/ensemble.html#gradient-boosting" target="_blank" rel="noreferrer">guía de Gradient Boosting</a>.
        </p>
      ),
    },
  },
  Ova: GradientBoostingOva,
  ovaTab: 'type',
  autoPlayOva: true,
  python: { code, expectedOutput, colabNotebook: 'gradient-boosting' },
  inYourField: [
    {
      area: 'Eléctrica',
      example: 'pronosticar la demanda de energía de cada hora a partir del clima, el día de la semana y los festivos.',
    },
    {
      area: 'Mecánica',
      example: 'estimar el desgaste de una herramienta de corte a partir de la velocidad, el avance y la vibración.',
    },
    {
      area: 'Industrial',
      example: 'predecir qué pedidos llegarán tarde según la ruta, el proveedor y la carga de la bodega.',
    },
  ],
  alternatives: ['random-forest', 'logistic-regression', 'mlp'],
};

export default gradientBoosting;
