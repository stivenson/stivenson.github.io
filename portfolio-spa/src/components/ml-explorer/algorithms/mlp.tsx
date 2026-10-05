import { G } from '../Gloss';
import { Tex } from '../Tex';
import { MlpOva } from '../ovas/MlpOva';
import type { AlgorithmModule } from '../types';
import code from './python/mlp.py?raw';
import expectedOutput from './python/mlp.out.txt?raw';

const mlp: AlgorithmModule = {
  slug: 'mlp',
  row: {
    type: 'Supervisado',
    bestUse: 'Problemas complejos y no lineales',
    formula: 'Capas de neuronas con pesos y funciones de activación',
    assumptions: 'Muchos datos de entrenamiento',
    pros: 'Modela relaciones complejas',
    cons: 'Necesita muchos datos y es una caja negra',
    whenNot: 'Con pocos datos o si hay que explicar cada decisión',
    realWorld: 'Reconocimiento de imágenes y de voz',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>
              <G k="supervisado">Supervisado</G>:
            </b>{' '}
            aprende de ejemplos que ya traen la respuesta, como la regresión logística. La diferencia es que entre la
            entrada y la salida pone <b>capas de neuronas</b> que aprenden sus propias <G k="feature">features</G>{' '}
            intermedias.
          </p>
          <p>
            Es la <G k="redNeuronal">red neuronal</G> más básica: el perceptrón multicapa (MLP, por{' '}
            <i>Multi-Layer Perceptron</i>). Cada <G k="neurona">neurona</G> hace una suma con pesos y la dobla con una{' '}
            <G k="funcionActivacion">función de activación</G>.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Sirve para clasificar (con <G k="softmax">softmax</G> en la salida da una probabilidad por clase) y para
          predecir números (con una salida sin función de activación). Las CNN, las RNN y los{' '}
          <G k="transformer">Transformers</G> son variantes que cambian cómo se conectan las neuronas, no la idea.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo cuando la relación entre la entrada y la respuesta es <b>curva y enredada</b>, hay muchos ejemplos y
            no necesitas explicar cada decisión.
          </p>
          <ul>
            <li>Reconocer dígitos o letras escritas a mano.</li>
            <li>Predecir el consumo de una planta a partir de decenas de sensores.</li>
            <li>
              Como capa final de modelos más grandes, sobre <G k="feature">features</G> que ya extrajo otra red.
            </li>
          </ul>
          <p className="mlx-rule">
            Con datos en tabla, compáralo siempre con un <G k="ensamble">ensamble</G> de árboles: muchas veces el
            ensamble gana.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Con <G k="tabular">datos tabulares</G> de miles de filas, Gradient Boosting suele igualar o superar a un MLP
          con mucho menos ajuste. El MLP brilla cuando las features son señales crudas y numerosas (píxeles, audio) o
          cuando se combina con otras redes.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> una <G k="neurona">neurona</G> con pesos 20 y 20 y sesgo −10 recibe el punto (1, 0). Suma
            20·1 + 20·0 − 10 = 10, y la <G k="sigmoide">sigmoide</G> convierte ese 10 en 0.99995: casi 1. En (0, 0)
            sumaría −10 y daría 0.00005: casi 0.
          </p>
          <p>
            Una sola neurona traza una recta y no puede separar <G k="xor">XOR</G>. Con dos neuronas en la{' '}
            <G k="capaOculta">capa oculta</G> sí: una se enciende en «al menos una entrada activa», otra en «no las
            dos», y la salida pide ambas. Así (1, 0) da casi 1 y (1, 1), casi 0.
          </p>
          <Tex block>{'h = \\sigma(W_1 x + b_1), \\qquad \\hat{y} = \\sigma(W_2 h + b_2)'}</Tex>
          <p>
            <Tex>{'x'}</Tex> es la entrada, <Tex>{'h'}</Tex> la salida de la capa oculta y <Tex>{'\\hat{y}'}</Tex> la
            predicción. Las matrices <Tex>{'W'}</Tex> y los vectores <Tex>{'b'}</Tex> son los pesos que se aprenden;{' '}
            <Tex>{'\\sigma'}</Tex> es la <G k="funcionActivacion">función de activación</G>.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Se entrena con <G k="descensoGradiente">descenso de gradiente</G>: la{' '}
            <G k="retropropagacion">retropropagación</G> calcula cuánto contribuyó cada peso al error (la{' '}
            <G k="perdidaLog">pérdida logarítmica</G>, al clasificar) y cada peso se mueve un poco en contra.
          </p>
          <p>
            scikit-learn usa por defecto <G k="relu">ReLU</G> en las capas ocultas, el optimizador Adam,{' '}
            <G k="batch">lotes</G> de hasta 200 filas y una penalización <G k="regularizacionL1L2">L2</G> pequeña (
            <code>alpha=0.0001</code>).
          </p>
          <p>
            Los <G k="hiperparametro">hiperparámetros</G> que más importan son el número de capas y de neuronas, la{' '}
            <G k="tasaAprendizaje">tasa de aprendizaje</G> y cuántas <G k="epoca">épocas</G> entrenar.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que hay <b>muchos datos</b>: tiene muchos pesos que ajustar. En el ejercicio, la red de 32{' '}
            <G k="neurona">neuronas</G> tiene 2 410 parámetros (pesos y sesgos) para 1 257 imágenes de entrenamiento, y
            aun así acierta en datos nuevos porque los dígitos se parecen mucho entre sí. Con muchos menos datos,
            memoriza (<G k="overfitting">sobreajuste</G>).
          </p>
          <p>
            También supone{' '}
            <b>
              <G k="feature">features</G> en escalas parecidas
            </b>
            : con una feature de 0 a 1 y otra de 0 a 100 000, el entrenamiento avanza a saltos. Por eso el ejercicio
            divide los píxeles entre 16.
          </p>
        </>
      ),
      deepDive: (
        <p>
          El teorema de aproximación universal dice que una <G k="capaOculta">capa oculta</G> con neuronas suficientes
          puede aproximar cualquier función continua. No dice cuántas neuronas hacen falta ni que el entrenamiento las
          encuentre. Para <G k="escalado">estandarizar</G> se usa <code>StandardScaler</code>, ajustado solo con los
          datos de entrenamiento.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Fronteras curvas y complejas:</b> con <G k="capaOculta">capas ocultas</G> resuelve problemas como{' '}
            <G k="xor">XOR</G>, que ningún modelo lineal resuelve.
          </li>
          <li>
            <b>
              Aprende sus propias <G k="feature">features</G>:
            </b>{' '}
            en el ejercicio, la red de 32 <G k="neurona">neuronas</G> acierta el 97.6 % de los dígitos nuevos a partir
            de los píxeles crudos.
          </li>
          <li>
            <b>Escala con los datos:</b> con más ejemplos y más neuronas suele seguir mejorando, cuando un modelo lineal
            ya no mejora.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          La misma maquinaria (capas, <G k="retropropagacion">retropropagación</G>, descenso por <G k="batch">lotes</G>)
          sirve para imágenes, texto y audio, y corre rápido en una <G k="gpu">GPU</G>. Con 2 neuronas ocultas la red
          del ejercicio solo acierta el 49.8 % en datos nuevos; con 8, el 91.3 %: con un entrenamiento corto, el tamaño
          de la capa importa mucho.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Caja negra:</b> 2 410 pesos no se leen uno por uno. No sabes por qué decidió lo que decidió.
          </li>
          <li>
            <b>Muchas perillas:</b> capas, <G k="neurona">neuronas</G>, <G k="tasaAprendizaje">tasa de aprendizaje</G>,{' '}
            <G k="epoca">épocas</G>, regularización. Una mala elección y no aprende o memoriza.
          </li>
          <li>
            <b>Resultados que varían:</b> los pesos arrancan al azar. Con otra semilla, la red de 32 apenas cambia, pero
            la de 2 cambia mucho: las redes pequeñas son las más inestables. El ejercicio fija{' '}
            <code>random_state=0</code>.
          </li>
        </ul>
      ),
      deepDive: (
        <>
          <p>
            Contra el <G k="overfitting">sobreajuste</G>: más datos, <G k="regularizacionL1L2">regularización L2</G>,{' '}
            <G k="dropout">dropout</G> o parar cuando el acierto en validación deja de mejorar (
            <code>early_stopping=True</code>).
          </p>
          <p>
            Para explicar predicciones existen técnicas como <G k="shap">SHAP</G>, pero son aproximadas.
          </p>
        </>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses con pocos datos ni cuando cada decisión se debe justificar.</p>
          <p>
            Ejemplo: aprobar créditos con 500 clientes y 10 columnas. Una regresión logística o un árbol poco profundo
            aciertan parecido, entrenan en segundos y explican cada rechazo. Con miles de filas en tabla, prueba antes
            Gradient Boosting.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Tampoco es la mejor red para imágenes grandes (usa una <G k="redConvolucional">red convolucional</G>) ni para
          texto o secuencias largas (usa un <G k="transformer">Transformer</G>): el MLP trata cada entrada por separado
          y no aprovecha qué píxeles son vecinos ni el orden de las palabras.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Reconocimiento de dígitos.</b> Una de las primeras aplicaciones comerciales de las{' '}
            <G k="redNeuronal">redes neuronales</G> fue leer códigos postales y cheques escritos a mano, en los años 90.
            Aquellas redes ya eran convolucionales, pero la idea de capas que aprenden es la misma.
          </p>
          <p>
            El ejercicio entrena un MLP con 1 257 de los 1 797 dígitos de 8×8 que trae scikit-learn y lo prueba con los
            540 restantes. Con 2 <G k="neurona">neuronas</G> ocultas acierta el 49.8 %; con 8, el 91.3 %; con 32, el
            97.6 %. La red de 32 da una probabilidad por dígito: a la primera imagen nueva, un 1, le da 88 %.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            En producción las redes se entrenan con <G k="pytorch">PyTorch o TensorFlow</G>, en <G k="gpu">GPU</G> y por{' '}
            <G k="batch">lotes</G>. El notebook de Colab trae, como celda opcional, una red equivalente en PyTorch: su
            acierto es parecido, no idéntico, porque cambian el sorteo de los pesos y otros detalles del entrenamiento.
          </p>
          <p>
            El ejercicio entrena 150 <G k="epoca">épocas</G> y para ahí a propósito, para que corra en segundos en el
            navegador. Con más épocas la red de 2 sube bastante, pero sigue lejos de las otras dos.
          </p>
        </>
      ),
    },
  },
  Ova: MlpOva,
  python: { code, expectedOutput, colabNotebook: 'mlp' },
  inYourField: [
    {
      area: 'Eléctrica',
      example: 'estimar la demanda de la próxima hora a partir de decenas de lecturas de la red y del clima.',
    },
    {
      area: 'Mecánica',
      example: 'predecir el desgaste de una herramienta de corte con las señales de vibración y corriente del motor.',
    },
    {
      area: 'Química',
      example: 'predecir una propiedad de una mezcla a partir de su composición y las condiciones del proceso.',
    },
  ],
  alternatives: ['gradient-boosting', 'logistic-regression'],
};

export default mlp;
