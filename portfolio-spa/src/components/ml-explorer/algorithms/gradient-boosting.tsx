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
    assumptions: 'Sumar modelos débiles da uno fuerte',
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
            Es un <G k="ensamble">ensamble</G> de árboles, pero <b>en fila, no en paralelo</b>: cada árbol nuevo
            se entrena para corregir los errores que dejaron los anteriores.
          </p>
          <p>
            Sirve para predecir números y para clasificar. El simulador predice un número (es más fácil ver el
            error); el ejercicio clasifica.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Es <G k="boosting" after=":">boosting</G> suma <G k="modeloDebil">modelos débiles</G> (árboles pequeños, por lo
          general de 1 a 8 niveles; 3 por defecto en scikit-learn) para formar uno fuerte. Las versiones más usadas
          en la práctica son <G k="bibliotecasBoosting">XGBoost, LightGBM, CatBoost</G> y{' '}
          <code>HistGradientBoostingClassifier</code> de scikit-learn, que agrupan los valores en intervalos para
          entrenar mucho más rápido.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo con <b><G k="tabular">datos en tabla</G></b> cuando quieres <b>la mayor <G k="exactitud">exactitud</G> posible</b> y tienes tiempo para
            ajustarlo.
          </p>
          <ul>
            <li>Scoring de crédito: probabilidad de impago.</li>
            <li>Pronóstico de demanda (ventas, energía) con calendario y clima.</li>
            <li>Ordenar resultados de búsqueda o anuncios por relevancia.</li>
          </ul>
          <p className="mlx-rule">
            En datos tabulares suele ser de lo más preciso que existe. Pero empieza por una <G k="lineaBase">línea base</G> simple:
            compáralo siempre con ella.
          </p>
        </>
      ),
      deepDive: (
        <p>
          En competencias de datos tabulares (Kaggle) <G k="bibliotecasBoosting">XGBoost</G> y LightGBM han sido protagonistas durante años, y
          estudios comparativos muestran que los <G k="ensamble">ensambles</G> de árboles siguen siendo muy competitivos frente a las{' '}
          <G k="redNeuronal">redes neuronales</G> en este tipo de datos. Es una tendencia, no una ley: depende del problema.
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
            2.41 (solo el promedio) a 0.73 con 10 árboles y a 0.06 con 50. Ojo: es error de entrenamiento; casi 0
            significa que ya persigue cada punto, ruido incluido (en el ejercicio de Python se ve qué pasa con datos
            nuevos).
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
            profundidad 3. Tasa más pequeña con más árboles suele generalizar mejor, a costa de tiempo.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que <b>sumar muchos modelos débiles da uno fuerte</b>: cada árbol pequeño, por sí solo, apenas
            mejora la predicción, y juntos corrigen sus fallas.
          </p>
          <p>
            También supone que lo que queda por corregir es patrón, no <G k="ruido" after=".">ruido</G> Si sigue sumando
            árboles cuando ya solo queda ruido, empieza a memorizarlo.
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
            <b>Muy preciso en tablas:</b> suele ganarles a los demás algoritmos de este explorador con datos
            estructurados.
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
            <b>Riesgo de <G k="overfitting" after=":">sobreajuste</G></b> en el ejercicio, la pérdida en clientes nuevos
            baja hasta 0.504 con 24 árboles y luego sube hasta 0.611 con 300, aunque en entrenamiento siga bajando.
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
          <p className="mlx-rule">No lo uses con etiquetas muy ruidosas o con muy pocos datos.</p>
          <p>
            Ejemplo: 200 clientes, con errores de digitación en quién pagó y quién no. Cada árbol nuevo persigue esos
            errores. Un Random Forest o una regresión logística son más estables.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Tampoco es la primera opción con imágenes, audio o texto largo (ahí ganan las <G k="redNeuronal" after="),">redes neuronales</G> ni si
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
            El ejercicio genera 800 clientes con una regla no lineal (la deuda pesa mucho más cuando el ingreso es
            bajo), entrena 300 árboles a propósito y mide la <G k="perdidaLog">pérdida logarítmica</G> después de
            cada uno. En entrenamiento baja en cada fila de la tabla (de 0.620 a 0.265). En clientes nuevos baja hasta 0.504 con 24
            árboles y desde ahí sube. La gráfica muestra el punto donde conviene parar.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Elegir el número de árboles mirando los datos de prueba, como hace el ejercicio para mostrar la curva,
          hace que esa medición quede optimista. En un proyecto real se elige con una parte de validación (o{' '}
          <G k="validacionCruzada" after=")">validación cruzada</G> y los datos de prueba se usan una sola vez, al final.
        </p>
      ),
    },
  },
  Ova: GradientBoostingOva,
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
