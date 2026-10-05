import { G } from '../Gloss';
import { Tex } from '../Tex';
import { LogisticRegressionOva } from '../ovas/LogisticRegressionOva';
import type { AlgorithmModule } from '../types';
import code from './python/logistic-regression.py?raw';
import expectedOutput from './python/logistic-regression.out.txt?raw';

const logisticRegression: AlgorithmModule = {
  slug: 'logistic-regression',
  row: {
    type: 'Supervisado',
    bestUse: 'Clasificación binaria',
    formula: 'P = 1 / (1 + e^−(b₀ + b₁X + …))',
    assumptions: 'Linealidad del log-odds',
    pros: 'Probabilística, interpretable',
    cons: 'Débil con fronteras no lineales',
    whenNot: 'Datos muy no lineales',
    realWorld: 'Detección de spam',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>Supervisado:</b> aprende de correos que ya vienen marcados como «spam» o «normal» (la{' '}
            <G k="etiqueta" after=").">etiqueta</G>
          </p>
          <p>
            A pesar del nombre, <b>sirve para clasificar</b> (sí/no, spam/normal, paga/no paga), no para predecir
            cantidades. Entrega la probabilidad de «sí», y un <G k="umbral">umbral</G> la convierte en clase.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Es un modelo lineal generalizado: modela <Tex>{'P(y=1 \\mid x)'}</Tex> aplicando la función <G k="sigmoide">sigmoide</G> a una
          combinación lineal de las <G k="feature" after=".">features</G> Con más de dos clases se usa la versión multinomial <G before="(" k="softmax" after=").">softmax</G>
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsala para <b>clasificación binaria</b> cuando necesitas una <b>probabilidad</b> y poder explicar la
            decisión.
          </p>
          <ul>
            <li>¿Este correo es spam?</li>
            <li>¿Este cliente cancelará el servicio?</li>
            <li>¿Este paciente tiene riesgo alto?</li>
          </ul>
          <p className="mlx-rule">
            Si necesitas saber qué tan seguro está el modelo, no solo «sí» o «no», empieza por aquí.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Cuando el modelo está bien especificado y hay datos suficientes, sus probabilidades suelen estar bien{' '}
          <G k="calibracion" after=":">calibradas</G> de los casos a los que asigna 70 %, cerca de 7 de cada 10 son positivos. Entrena rápido incluso
          con millones de filas y miles de <G k="feature">features</G> dispersas, como las palabras de un texto.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> un correo dice «gratis» 4 veces. Con b₀ = −4 y b₁ = 1 se calcula primero un puntaje:
          </p>
          <Tex block>{'z = b_0 + b_1 x = -4 + 1 \\times 4 = 0'}</Tex>
          <p>Después, la <G k="sigmoide">sigmoide</G> convierte cualquier puntaje en una probabilidad entre 0 y 1:</p>
          <Tex block>{'P = \\frac{1}{1 + e^{-z}} = \\frac{1}{1 + e^{0}} = 0.5'}</Tex>
          <p>
            Con z = 0 el modelo duda (50 %). Si el correo dijera «gratis» 7 veces, z = 3 y P ≈ 0.95. Cuando P llega al{' '}
            <G k="umbral">umbral</G> (0.5 por defecto) o lo supera, el correo se marca como spam.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>Los pesos se eligen minimizando la <G k="entropia">entropía</G> cruzada (equivale a maximizar la verosimilitud):</p>
          <Tex block>{'\\begin{aligned} \\min_b\\ -\\frac{1}{n}\\sum_i \\Big[\\, & y_i \\log p_i \\\\ & + (1-y_i)\\log(1-p_i) \\,\\Big] \\end{aligned}'}</Tex>
          <p>
            No hay solución cerrada: se resuelve con <G k="descensoGradiente">descenso de gradiente</G> o con el método de Newton (scikit-learn
            usa por defecto L-BFGS, una variante de Newton que aproxima la curvatura, y le suma una penalización <G k="regularizacionL1L2" after=";">L2</G>
            ver Supuestos). El <G k="gradiente">gradiente</G> es simple: <Tex after=".">{'\\frac{1}{n}\\sum_i (p_i - y_i)\\,x_i'}</Tex> El botón
            «Mejor ajuste» del simulador usa Newton, que además aprovecha la curvatura: llega al óptimo en pocas
            iteraciones (unas 8 con estos datos).
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que el <G k="logOdds">log-odds</G> cambia en línea recta con cada <G k="feature" after=".">feature</G>
          </p>
          <p>
            En palabras simples: cada «gratis» adicional multiplica los <G k="odds">odds</G> del spam (probabilidad de spam ÷
            probabilidad de normal) por el mismo factor (con b₁ = 1, por e ≈ 2.7). La probabilidad no se multiplica:
            sube rápido en el medio y se frena cerca de 0 y de 1. Si en la realidad el efecto se dispara o se satura,
            el modelo lo representa mal.
          </p>
          <p>También supone observaciones independientes y features que no sean casi copias unas de otras.</p>
        </>
      ),
      deepDive: (
        <p>
          <Tex>{'e^{b_j}'}</Tex> es la razón de odds: subir <Tex>{'x_j'}</Tex> en una unidad, con las demás features
          fijas, multiplica los odds por <Tex after=".">{'e^{b_j}'}</Tex> Si las clases se separan perfectamente, los pesos
          crecen sin límite; por eso scikit-learn aplica por defecto <G k="regularizacionL1L2">regularización L2</G> con C = 1 (C es el inverso de
          la fuerza: C más pequeño, pesos más pequeños). Los pesos del ejercicio salen con esa regularización.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Probabilística:</b> no solo dice «spam», dice «94 % spam». Puedes elegir el <G k="umbral">umbral</G> según lo que cueste
            cada error.
          </li>
          <li>
            <b>
              <G k="interpretable" after=":">Interpretable</G>
            </b>{' '}
            cada peso dice si una señal empuja hacia «sí» o hacia «no», y cuánto, si las demás señales no cambian.
          </li>
          <li>
            <b>
              Rápida y difícil de <G k="overfitting" after=":">sobreajustar</G>
            </b> con pocas <G k="feature">features</G> entrena en segundos y rara vez memoriza los
            datos.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Su función de pérdida es convexa: no tiene mínimos locales que atrapen al optimizador y, con la{' '}
          <G k="regularizacion">regularización</G> por defecto, el óptimo es único sin importar el punto de partida. Es estándar en riesgo
          crediticio (scorecards) justamente porque se puede auditar.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>
              <G k="frontera">Frontera</G> recta:
            </b>{' '}
            separa las clases con una línea o un plano. Si los casos positivos forman islas o un anillo, no los puede
            encerrar.
          </li>
          <li>
            <b>Necesita <G k="feature">features</G> bien construidas:</b> las interacciones («gratis» y además remitente desconocido) hay
            que crearlas a mano.
          </li>
          <li>
            <b>Sensible a features correlacionadas:</b> con pequeños cambios en los datos los pesos cambian mucho
            (hasta de signo) y dejan de leerse uno por uno.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Se puede curvar la frontera con features polinómicas, a costa de interpretabilidad. Con clases muy
          desbalanceadas (1 fraude por cada 1 000 transacciones) hay que ajustar los pesos de clase o el <G k="umbral" after=".">umbral</G>
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No la uses cuando las clases se separan con formas muy no lineales.</p>
          <p>
            Ejemplo: en una foto, «hay un gato» no depende de sumar pixeles con pesos fijos. Tampoco conviene si el
            patrón depende de interacciones que no sabes construir a mano.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Señal de alarma: un árbol o un Random Forest acierta claramente más con los mismos datos. Eso sugiere que la
          frontera no es lineal o que faltan interacciones entre <G k="feature" after=".">features</G>
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Detección de spam.</b> Los filtros de spam suman evidencia de muchas señales: palabras, enlaces,
            remitente. La regresión logística hace esa suma y además permite ajustar el <G k="umbral" after=":">umbral</G> es mejor dejar pasar un
            spam que perder un correo importante.
          </p>
          <p>
            El ejercicio crea 400 correos de juguete con tres señales: cuántas veces dice «gratis», cuántos enlaces
            trae y si el remitente es conocido. Mira los pesos (¿qué señal aleja del spam?): el 1.84 de «gratis»
            significa que cada «gratis» extra multiplica los <G k="odds">odds</G> de spam por e^1.84 ≈ 6.3, con las otras señales
            fijas. Revisa también la <G k="matrizConfusion" after=".">matriz de confusión</G>
          </p>
        </>
      ),
      deepDive: (
        <p>
          En producción el texto se convierte en miles de <G k="feature">features</G> (bolsa de palabras o TF-IDF) con <G k="regularizacionL1L2" after=",">regularización L2</G>
          y el umbral se elige con la curva de precisión y exhaustividad, no con el 0.5 por defecto.
        </p>
      ),
    },
  },
  Ova: LogisticRegressionOva,
  python: { code, expectedOutput, colabNotebook: 'logistic-regression' },
  inYourField: [
    { area: 'Industrial', example: '¿saldrá defectuosa esta pieza según la temperatura y la presión del proceso?' },
    { area: 'Civil', example: 'probabilidad de deslizamiento de un talud según la lluvia acumulada y la pendiente.' },
    { area: 'Biomédica', example: 'riesgo de una enfermedad según edad, presión arterial y glucosa.' },
  ],
  alternatives: ['decision-tree', 'random-forest', 'svm'],
};

export default logisticRegression;
