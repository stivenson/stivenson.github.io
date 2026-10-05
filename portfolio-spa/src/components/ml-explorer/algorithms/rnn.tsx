import { G } from '../Gloss';
import { Tex } from '../Tex';
import { RnnOva } from '../ovas/RnnOva';
import type { AlgorithmModule } from '../types';
import code from './python/rnn.py?raw';
import expectedOutput from './python/rnn.out.txt?raw';

const rnn: AlgorithmModule = {
  slug: 'rnn',
  row: {
    type: 'Supervisado',
    bestUse: 'Datos en secuencia: series de tiempo, texto, audio',
    formula: 'Un estado oculto que se actualiza en cada paso',
    assumptions: 'El orden importa y el pasado reciente explica el presente',
    pros: 'Lee secuencias de cualquier longitud',
    cons: 'El gradiente se desvanece: olvida lo lejano',
    whenNot: 'Secuencias muy largas (mejor un Transformer)',
    realWorld: 'Reconocimiento de voz y predicción de series',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>
              <G k="supervisado">Supervisado</G>:
            </b>{' '}
            aprende de secuencias que ya traen la respuesta: la demanda de mañana, la palabra siguiente, el texto de
            un audio. Es una <G k="redNeuronal">red neuronal</G> que lee los datos <b>uno por uno y en orden</b>.
          </p>
          <p>
            Mientras lee, guarda una memoria, el <G k="estadoOculto">estado oculto</G>, que mezcla lo que ya traía con
            el dato nuevo. Por eso se llama recurrente (<i>Recurrent Neural Network</i>): usa su propia salida anterior
            como entrada.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Puede dar una salida al final (clasificar una reseña completa), una por paso (etiquetar cada palabra) o
          generar otra secuencia (traducir). Las versiones que se usan en la práctica son la{' '}
          <G k="lstm">LSTM y la GRU</G>, que guardan mejor la memoria.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsala cuando <b>el orden de los datos importa</b> y cada dato depende de los anteriores.
          </p>
          <ul>
            <li>Predecir la demanda de energía de la próxima hora con las horas anteriores.</li>
            <li>Detectar fallas en la vibración de una máquina a medida que llega la señal.</li>
            <li>Dispositivos pequeños que procesan audio o sensores en tiempo real, paso a paso.</li>
          </ul>
          <p className="mlx-rule">
            Para texto largo, prefiere un <G k="transformer">Transformer</G>; para series cortas en tabla, prueba antes
            un modelo de árboles con valores rezagados como columnas (la demanda de ayer, la de anteayer…).
          </p>
        </>
      ),
      deepDive: (
        <p>
          Su ventaja actual es que procesa cada dato nuevo con una cuenta de tamaño fijo, sin volver a leer todo el
          pasado: útil en tiempo real y con poca memoria. Una <G k="lstm">LSTM</G> recuerda bien decenas o algunos
          cientos de pasos.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> una RNN de una sola <G k="neurona">neurona</G> con <Tex>{'w = 0.9'}</Tex> lee 10
            mediciones. La primera entra multiplicada por <Tex>{'u = 0.5'}</Tex>; luego, en cada uno de los 9 pasos
            siguientes, su efecto se multiplica por 0.9 y por la pendiente de tanh, que es como mucho 1. Sin la
            pendiente quedaría 0.5 · 0.9<sup>9</sup> = 0.19; con ella, el simulador da 0.024: 1 en 41. La fórmula de abajo mide de{' '}
            <Tex>{'h_1'}</Tex> a <Tex>{'h_T'}</Tex>; por <Tex>{'x_1'}</Tex> entra además el factor{' '}
            <Tex>{'u\\,(1 - h_1^2)'}</Tex>.
          </p>
          <Tex block>{'h_t = \\tanh(w\\, h_{t-1} + u\\, x_t), \\qquad \\frac{\\partial h_T}{\\partial h_1} = \\prod_{t=2}^{T} w\\, (1 - h_t^2)'}</Tex>
          <p>
            <Tex>{'h_t'}</Tex> es el <G k="estadoOculto">estado oculto</G> en el paso <Tex>{'t'}</Tex> y{' '}
            <Tex>{'x_t'}</Tex> el dato que entra. El producto de la derecha es lo que lleva hacia atrás la{' '}
            <G k="retropropagacion">retropropagación</G>: si cada factor es menor que 1, el{' '}
            <G k="desvanecimiento">gradiente se desvanece</G>.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Con vectores, <Tex>{'h_t = \\tanh(W h_{t-1} + U x_t + b)'}</Tex>, y los mismos <Tex>{'W'}</Tex> y{' '}
            <Tex>{'U'}</Tex> se usan en todos los pasos. Para entrenar se «desenrolla» la red en el tiempo, como una red
            de T capas que comparten pesos, y se aplica la <G k="retropropagacion">retropropagación</G> (BPTT, por sus
            siglas en inglés).
          </p>
          <p>
            El factor por paso depende de los pesos. Si los factores son mayores que 1 durante muchos pasos (pasa con
            matrices de pesos grandes, no en esta neurona con tanh, que se satura), el gradiente explota en vez de
            desvanecerse. Lo primero se frena recortando el gradiente; lo segundo pide otra arquitectura, como la{' '}
            <G k="lstm">LSTM</G>, cuya memoria pasa de un paso al siguiente casi sin multiplicarse.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que <b>el orden importa</b> y que lo reciente explica bastante del presente. Si barajas las
            mediciones, la RNN da otra cosa; un modelo de tabla ni lo notaría.
          </p>
          <p>
            También supone, sin decirlo, que <b>lo importante no está muy atrás</b>: en el ejercicio, con 20 pasos el
            primer dato influye 6.2e-06 en la salida (seis millonésimas). La red básica casi no puede aprender
            dependencias tan lejanas.
          </p>
        </>
      ),
      deepDive: (
        <p>
          La <G k="lstm">LSTM</G> relaja ese supuesto con compuertas que deciden qué guardar y qué olvidar. Aun así, la
          información viaja paso a paso: para relacionar la palabra 1 con la 500 tiene que sobrevivir 499
          actualizaciones. El <G k="transformer">Transformer</G> las conecta directamente.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Secuencias de cualquier longitud:</b> los mismos pesos sirven para 10 o para 10 000 pasos.
          </li>
          <li>
            <b>Memoria compacta:</b> todo el pasado se resume en el <G k="estadoOculto">estado oculto</G>, de tamaño
            fijo.
          </li>
          <li>
            <b>Barata al predecir:</b> cada dato nuevo cuesta lo mismo, sin releer la historia.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Un <G k="transformer">Transformer</G> compara cada <G k="token">token</G> con todos los anteriores, así que su costo crece con
          el cuadrado de la longitud. La RNN crece en línea recta. Por eso hay arquitecturas recientes que vuelven a
          ideas recurrentes para textos muy largos.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Olvida lo lejano:</b> el <G k="desvanecimiento">gradiente se desvanece</G>. En el ejercicio, con w = 0.9
            la influencia del primer dato pasa de 0.024 (10 pasos) a 5.8e-14 (50 pasos).
          </li>
          <li>
            <b>Lenta de entrenar:</b> el paso 2 necesita el resultado del paso 1, así que no se reparte bien en una{' '}
            <G k="gpu">GPU</G>.
          </li>
          <li>
            <b>Inestable:</b> con matrices de pesos grandes, el gradiente también puede explotar; hay que recortarlo.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          La <G k="lstm">LSTM</G> y la GRU reducen el desvanecimiento; recortar el{' '}
          <G k="gradiente">gradiente</G> evita la explosión. Para dependencias de cientos o miles de pasos, el{' '}
          <G k="transformer">Transformer</G> las reemplazó en casi todas las tareas de texto.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">
            No la uses con secuencias largas donde importa lo lejano: usa un <G k="transformer">Transformer</G>.
          </p>
          <p>
            Ejemplo: resumir un contrato de 20 páginas. Lo que dice la cláusula 1 puede cambiar el sentido de la
            cláusula 30, y una RNN ya lo habrá olvidado. Tampoco la uses si tus datos no tienen orden: es una tabla.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Para pronosticar series de una sola variable con poca historia, los métodos estadísticos clásicos (como
          ARIMA) o un modelo de árboles con valores rezagados suelen ganarle y son más fáciles de revisar.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Reconocimiento de voz y predicción de series.</b> Hacia 2015-2016 los dictados por voz y los traductores
            automáticos usaban <G k="lstm">LSTM</G>; luego llegaron los{' '}
            <G k="transformer">Transformers</G>.
          </p>
          <p>
            El ejercicio no entrena una red: mide su memoria. Con 50 mediciones y la regla de la cadena, calcula cuánto
            mueve la primera medición a la última salida. Con w = 0.9 baja de 5.0e-01 (1 paso) a 2.4e-02 (10) y a
            6.2e-06 (20). Con w = 0.5 cae aún más rápido; con w = 1.0 también cae. La comprobación numérica da lo mismo:
            0.0242.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Ese número multiplica el <G k="gradiente">gradiente</G> que recibiría el primer paso al entrenar: si es seis
          millonésimas, sus pesos casi no se corrigen. En la práctica se usa <code>torch.nn.LSTM</code> o{' '}
          <code>torch.nn.GRU</code> de <G k="pytorch">PyTorch</G>; el notebook de Colab trae una celda opcional que
          repite la medición con una RNN de PyTorch.
        </p>
      ),
    },
  },
  Ova: RnnOva,
  python: { code, expectedOutput, colabNotebook: 'rnn' },
  inYourField: [
    { area: 'Eléctrica', example: 'pronosticar la carga de un transformador hora a hora con su historia reciente.' },
    { area: 'Mecánica', example: 'detectar el inicio de una falla en un rodamiento leyendo la señal de vibración en tiempo real.' },
    { area: 'Ambiental', example: 'predecir el nivel de un río a partir de la lluvia y los caudales de las horas anteriores.' },
  ],
  alternatives: ['transformer', 'gradient-boosting'],
};

export default rnn;
