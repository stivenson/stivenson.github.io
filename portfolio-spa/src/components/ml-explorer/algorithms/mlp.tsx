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
    bestUse: 'Relaciones no lineales entre columnas numéricas',
    formula: 'Capas de neuronas con pesos y funciones de activación',
    assumptions: 'Datos representativos y escalas comparables',
    pros: 'Modela relaciones complejas',
    cons: 'Sensible al ajuste; explicación menos directa',
    whenNot: 'Pocos datos o explicación directa prioritaria',
    realWorld: 'Reconocimiento de imágenes y de voz',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>
              <G k="supervisado" after=":">Supervisado</G>
            </b>{' '}
            aprende de ejemplos que ya traen la respuesta, como la regresión logística. La diferencia es que entre la
            entrada y la salida pone <b><G k="capaOculta">capas ocultas</G></b> que aprenden sus propias <G k="feature">features</G>{' '}
            intermedias.
          </p>
          <p>
            Es la <G k="redNeuronal">red neuronal</G> más básica: el perceptrón multicapa (MLP, por{' '}
            <i>Multi-Layer Perceptron</i>). Cada <G k="neurona">neurona</G> hace una suma con pesos y la dobla con una{' '}
            <G k="funcionActivacion" after=".">función de activación</G>
          </p>
          <section className="mlx-hyperparameter-guide mlx-settings-guide" aria-label="Hiperparámetros de MLP">
            <h4>Qué eliges y qué aprende la red</h4>
            <p>Los <G k="hiperparametro">hiperparámetros</G> configuran la red y el entrenamiento. Los <G k="parametroAprendido">pesos y sesgos</G> se calculan al entrenar; moverlos manualmente en la OVA sirve para explorar, no para elegir hiperparámetros.</p>
            <div className="mlx-settings-guide-grid">
              <section className="mlx-settings-guide-card">
                <h5>¿Cuántas capas y neuronas?</h5>
                <code className="mlx-settings-guide-api">hidden_layer_sizes · activation</code>
                <p>La <G k="mlpArquitectura">arquitectura</G> fija el tamaño: <code>(32,)</code> es una capa de 32 neuronas; <code>(32, 16)</code> son dos capas.</p>
                <p>La <G k="funcionActivacion">función de activación</G> transforma la suma de cada neurona. Más tamaño no garantiza más aciertos.</p>
                <details><summary>Ocultas y salida no son lo mismo</summary><p>En MLPClassifier, activation configura las capas ocultas. La salida binaria es logística; la multiclase usa <G k="softmax">softmax</G>. La OVA permite logistic, tanh, <G k="relu">ReLU</G> e identity con los mismos pesos.</p></details>
              </section>
              <section className="mlx-settings-guide-card">
                <h5>¿Cómo se actualizan los pesos?</h5>
                <code className="mlx-settings-guide-api">solver · learning_rate_init · batch_size</code>
                <p>El <G k="mlpOptimizador">optimizador</G> define la actualización. La <G k="tasaAprendizaje">tasa inicial</G> controla el tamaño del paso con Adam o SGD.</p>
                <p><G k="batch">batch_size</G> cuenta ejemplos por actualización; no es la cantidad de épocas ni de neuronas.</p>
                <details><summary>Qué ajustes dependen del optimizador</summary><p>L-BFGS no usa learning_rate_init ni minibatches. <code>learning_rate</code> configura el calendario de SGD; no el de Adam. Con batch_size="auto" se usan hasta 200 ejemplos.</p></details>
              </section>
              <section className="mlx-settings-guide-card">
                <h5>¿Cuánto penalizas los pesos?</h5>
                <code className="mlx-settings-guide-api">alpha</code>
                <p><G k="mlpRegularizacion">alpha</G> controla la <G k="regularizacionL1L2">penalización L2</G>. No es una tasa de aprendizaje ni un peso de una conexión.</p>
                <p>Puede limitar ajustes excesivos; si penaliza demasiado también puede perder relaciones útiles.</p>
                <details><summary>Dropout depende de la biblioteca</summary><p><G k="dropout">Dropout</G> se usa en otras implementaciones, como <G k="pytorch">PyTorch</G>, pero MLPClassifier no tiene ese parámetro. El ejercicio usa alpha explícitamente.</p></details>
              </section>
              <section className="mlx-settings-guide-card">
                <h5>¿Cuándo paras de entrenar?</h5>
                <code className="mlx-settings-guide-api">max_iter · tol · n_iter_no_change</code>
                <p>Con Adam o SGD, max_iter es un límite de <G k="epoca">épocas</G>: pasadas completas por el entrenamiento.</p>
                <p>La <G k="mlpParada">regla de parada</G> también puede terminar antes si no mejora lo suficiente.</p>
                <details><summary>Qué mira early_stopping</summary><p>Con <code>early_stopping=True</code>, reserva <code>validation_fraction</code> y vigila su acierto. Si es False, vigila la pérdida de entrenamiento. El ejercicio mantiene False y compara candidatos con validación externa; la prueba se consulta al final.</p></details>
              </section>
            </div>
            <section className="mlx-settings-guide-practice" aria-label="Comparación guiada en la OVA">
              <h5>Pruébalo en la OVA</h5>
              <p>Activa «Mostrar salida completa» y conserva los pesos iniciales:</p>
              <ol>
                <li><b>Activación:</b> cambia logistic por tanh, ReLU e identity. Observa los valores ocultos, la frontera y los aciertos de demostración.</li>
                <li><b>Pesos:</b> vuelve a logistic y abre la exploración manual. Lleva a cero un peso de la salida y observa qué cambia.</li>
                <li><b>Lectura:</b> restablece el ejemplo y recorre entrada, h₁, h₂ y salida. Son etapas de cálculo, no épocas.</li>
              </ol>
              <p>Los pesos se conservan al cambiar la activación: esta comparación no demuestra cuál activación entrenaría mejor. Python sí aprende los pesos.</p>
            </section>
            <p>El <G k="escalado">escalado</G> y la semilla también importan. <code>random_state</code> ayuda a reproducir la inicialización y el orden de los lotes; no mejora la red por sí solo. La velocidad de la OVA es un <G k="controlDidactico">control de visualización</G>.</p>
          </section>
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
            Es un candidato cuando necesitas modelar relaciones <b>no lineales entre columnas numéricas</b>, con datos representativos y presupuesto para comparar ajustes.
          </p>
          <ul>
            <li>Reconocer dígitos o letras escritas a mano.</li>
            <li>Predecir el consumo de una planta a partir de decenas de sensores.</li>
            <li>
              Como capa final de modelos más grandes, sobre <G k="feature">features</G> que ya extrajo otra red.
            </li>
          </ul>
          <p className="mlx-rule">
            Con datos en tabla, compara una referencia sencilla y un <G k="ensamble">ensamble</G> de árboles con las mismas particiones y la misma medida de evaluación.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Con <G k="tabular">datos tabulares</G>, el resultado depende de la representación y de los ajustes. Mide calidad, tiempo y memoria. Para imágenes o secuencias, compara arquitecturas que aprovechen su estructura en lugar de asumir que un MLP más grande será mejor.
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
            Una sola neurona traza una recta y no puede separar <G k="xor" after=".">XOR</G> Con dos neuronas en la{' '}
            <G k="capaOculta">capa oculta</G> sí: una se enciende en «al menos una entrada activa», otra en «no las
            dos», y la salida pide ambas. Así (1, 0) da casi 1 y (1, 1), casi 0.
          </p>
          <Tex block>{'\\begin{gathered} h = \\sigma(W_1 x + b_1) \\\\ \\hat{y} = \\sigma(W_2 h + b_2) \\end{gathered}'}</Tex>
          <p>
            <Tex>{'x'}</Tex> es la entrada, <Tex>{'h'}</Tex> la salida de la capa oculta y <Tex>{'\\hat{y}'}</Tex> la
            predicción. Las matrices <Tex>{'W'}</Tex> y los vectores <Tex>{'b'}</Tex> son pesos y sesgos que se aprenden;{' '}
            <Tex>{'\\sigma'}</Tex> es la <G k="funcionActivacion" after=".">función de activación</G>
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Se entrena con <G k="descensoGradiente" after=":">descenso de gradiente</G> la{' '}
            <G k="retropropagacion">retropropagación</G> calcula cuánto contribuyó cada peso al error (la{' '}
            <G k="perdidaLog" after=",">pérdida logarítmica</G> al clasificar) y cada peso se mueve un poco en contra.
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
            Necesita <b>datos representativos y capacidad adecuada</b>. Una capa de 32 <G k="neurona">neuronas</G> en este ejercicio tiene 2 410 pesos y sesgos. Esa cantidad no determina por sí sola cuántas imágenes hacen falta; compara entrenamiento y validación para revisar el <G k="overfitting">sobreajuste</G>.
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
            <G k="xor" after=",">XOR</G> que ningún modelo lineal resuelve.
          </li>
          <li>
            <b>
              Aprende sus propias <G k="feature" after=":">features</G>
            </b>{' '}
            el ejercicio aprende combinaciones de los 64 píxeles con una capa de <G k="neurona">neuronas</G> ocultas; la prueba final mide la red elegida con validación.
          </li>
          <li>
            <b>Capacidad ajustable:</b> puedes cambiar tamaño y entrenamiento; mide si el costo adicional produce una mejora útil.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          La misma maquinaria (capas, <G k="retropropagacion" after=",">retropropagación</G> descenso por <G k="batch" after=")">lotes</G>{' '}
          sirve para distintas tareas. Algunas bibliotecas aprovechan <G k="gpu">GPU</G>; MLPClassifier se ejecuta en CPU. Arquitectura, inicialización y presupuesto interactúan: el tamaño de una capa no basta para predecir el resultado.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Explicación menos directa:</b> miles de pesos no se interpretan como unas pocas reglas; revisar una decisión necesita herramientas y contexto adicionales.
          </li>
          <li>
            <b>Muchas perillas:</b> capas, <G k="neurona" after=",">neuronas</G> <G k="tasaAprendizaje" after=",">tasa de aprendizaje</G>{' '}
            <G k="epoca" after=",">épocas</G> regularización. Una mala elección y no aprende o memoriza.
          </li>
          <li>
            <b>Resultados que varían:</b> los pesos arrancan al azar. Cambiar la semilla puede cambiar la solución; conviene revisar la variación con varias semillas sin elegir la mejor mirando la prueba. El ejercicio fija{' '}
            <code>random_state=0</code>.
          </li>
        </ul>
      ),
      deepDive: (
        <>
          <p>
            Ante <G k="overfitting">sobreajuste</G>, compara capacidad, <G k="regularizacionL1L2">regularización L2</G> y parada con validación. <G k="dropout">Dropout</G> pertenece a otras implementaciones: no es un ajuste de MLPClassifier.
          </p>
          <p>
            Para explicar predicciones existen técnicas como <G k="shap" after=",">SHAP</G> pero son aproximadas.
          </p>
        </>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">Si necesitas una explicación directa o hay pocos datos representativos, empieza por referencias más sencillas.</p>
          <p>
            Con unas pocas columnas y pocos ejemplos, compara regresión logística o un árbol pequeño antes de aumentar la red. La evaluación con datos separados decide si la complejidad adicional ayuda; no hay una cantidad universal de filas que lo resuelva.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Tampoco es la mejor red para imágenes grandes (usa una <G k="redConvolucional" after=")">red convolucional</G> ni para
          texto o secuencias largas (usa un <G k="transformer" after="):">Transformer</G> el MLP trata cada entrada por separado
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
          <p>El ejercicio conserva los 1 797 dígitos de 8×8 y divide los píxeles entre 16. Separa 1 077 imágenes de entrenamiento, 360 de validación y 360 de prueba. Compara tamaño, activación y alpha con validación; después consulta la prueba una sola vez. En esta ejecución elige 32 <G k="neurona">neuronas</G>, <G k="relu">ReLU</G> y alpha=0.1: validación 96.4 % y prueba 97.2 %, con 10 errores de 360. Son resultados de este conjunto y esta semilla.</p>

        </>
      ),
      deepDive: (
        <>
          <p>
            En producción las redes se entrenan con <G k="pytorch" after=",">PyTorch o TensorFlow</G> en <G k="gpu">GPU</G> y por{' '}
            <G k="batch" after=".">lotes</G> El notebook de Colab trae, como celda opcional, una red de ejemplo en PyTorch que se compara solo con validación. No reproduce necesariamente el candidato elegido ni vuelve a consultar la prueba final.
          </p>
          <p>
            Cada candidato permite hasta 150 <G k="epoca">épocas</G> con Adam y puede parar antes por su tolerancia. El ejercicio muestra n_iter_ y si alcanzó el límite; no lo interpreta automáticamente como convergencia ni como <G k="overfitting">sobreajuste</G>.
          </p>
        </>
      ),
    },
  },
  ovaTab: 'type',
  autoPlayOva: true,
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
