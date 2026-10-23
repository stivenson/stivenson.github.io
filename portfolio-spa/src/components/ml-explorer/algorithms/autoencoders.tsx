import { G } from '../Gloss';
import { Tex } from '../Tex';
import { AutoencoderOva } from '../ovas/AutoencoderOva';
import type { AlgorithmModule } from '../types';
import code from './python/autoencoders.py?raw';
import expectedOutput from './python/autoencoders.out.txt?raw';

const autoencoders: AlgorithmModule = {
  slug: 'autoencoders',
  row: {
    type: 'No supervisado',
    bestUse: 'Comprimir datos y detectar anomalías',
    formula: 'Codificador + decodificador que minimizan el error de reconstrucción',
    assumptions: 'Los datos normales tienen una estructura que se puede comprimir',
    pros: 'Aprende compresiones no lineales',
    cons: 'Difícil de ajustar y de interpretar',
    whenNot: 'Cuando PCA basta o hay etiquetas de sobra',
    realWorld: 'Detección de fraude',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>
              <G k="noSupervisado" after=":">No supervisado</G>
            </b>{' '}
            entrena los pesos sin etiquetas. La respuesta que aprende a dar es la propia entrada: el{' '}
            <G k="autoencoder">autoencoder</G> es una <G k="redNeuronal">red neuronal</G> que aprende a copiar sus
            datos.
          </p>
          <p>
            El truco es que la copia pasa por un <G k="cuelloBotella" after=":">cuello de botella</G> una capa con menos números
            que la entrada. Para copiar bien, la red tiene que aprender el patrón de los datos.
          </p>
          <p>
            <b>¿Cómo se evalúa sin etiquetas?</b> Con el <G k="reconstruccion">error de reconstrucción</G> en datos que
            no vio. Para medir detección de fraude hacen falta casos conocidos. El Python usa sus etiquetas de validación para escoger k; esas etiquetas no entrenan los pesos.
          </p>
          <section className="mlx-hyperparameter-guide mlx-settings-guide" aria-label="Hiperparámetros de Autoencoders">
            <h4>Qué eliges antes de entrenar</h4>
            <p>Los <G k="hiperparametro">hiperparámetros</G> configuran la compresión y el entrenamiento. Los <G k="parametroAprendido">pesos y sesgos</G> se aprenden. El umbral es una regla de alarma que se calibra después.</p>
            <div className="mlx-settings-guide-grid">
              <section className="mlx-settings-guide-card">
                <h5>¿Cuánto comprimes?</h5>
                <code className="mlx-settings-guide-api">Tamaño del código · k</code>
                <p>El <G k="cuelloBotella">cuello de botella</G> guarda cada entrada en k números. Con 6 medidas y k=2, el recorrido es 6 → 2 → 6.</p>
                <p>Muy pequeño puede perder patrones normales; más ancho también puede copiar <G k="anomalia">anomalías</G>.</p>
                <details><summary>Capas y activaciones</summary><p>Las <G k="capaOculta">capas ocultas</G> y su <G k="funcionActivacion">activación</G> permiten relaciones no lineales. La OVA y Python son lineales; la celda opcional de <G k="pytorch">PyTorch</G> añade tanh. No todos los autoencoders necesitan un código más pequeño: otras variantes imponen restricciones diferentes.</p></details>
              </section>
              <section className="mlx-settings-guide-card">
                <h5>¿Cómo y cuánto entrenas?</h5>
                <code className="mlx-settings-guide-api">Optimizador · tasa · épocas · lote</code>
                <p>La <G k="tasaAprendizaje">tasa</G> controla el tamaño del paso; las <G k="epoca">épocas</G> cuentan pasadas completas y el <G k="batch">lote</G> indica ejemplos por actualización.</p>
                <p>Una tasa grande puede volver inestable el ajuste; más épocas no garantizan mejor detección.</p>
                <details><summary>Qué usa este ejercicio</summary><p>Python usa <G k="descensoGradiente">descenso de gradiente</G> con el lote completo: cada paso es una época. Mantiene tasa=0.05 y pasos=6000 al comparar k. La OVA calcula la solución lineal mediante <G k="pca">PCA</G>: no entrena por épocas ni ofrece una tasa ficticia.</p></details>
              </section>
              <section className="mlx-settings-guide-card">
                <h5>¿Cómo limitas que copie todo?</h5>
                <code className="mlx-settings-guide-api">Penalización L2 · arquitectura</code>
                <p>La <G k="regularizacionL1L2">penalización L2</G> limita pesos grandes. La capacidad de la red y la regularización deben comprobarse con datos independientes.</p>
                <details><summary>Dropout no es un ajuste universal</summary><p><G k="dropout">Dropout</G> puede añadirse según la biblioteca y la arquitectura; no es obligatorio. Python expone l2=0.0, sin penalización, y mantiene ese valor fijo. No compara regularizadores.</p></details>
              </section>
              <section className="mlx-settings-guide-card">
                <h5>¿Qué error dispara una alarma?</h5>
                <code className="mlx-settings-guide-api">Percentil · umbral</code>
                <p>La <G k="aeCalibracion">calibración</G> usa normales que no entrenaron el modelo. El <G k="umbral">umbral</G> decide qué errores se señalan; no modifica la reconstrucción.</p>
                <p>Subir el percentil reduce o conserva las alarmas. Puede evitar revisiones innecesarias y dejar pasar casos anómalos.</p>
                <details><summary>95 no significa 95 % de acierto</summary><p>El percentil 95 ubica una línea entre los errores de calibración. No promete una tasa futura de falsas alarmas, sensibilidad ni probabilidad de fraude. Con pocos ejemplos, además, depende de la interpolación.</p></details>
              </section>
            </div>
            <section className="mlx-settings-guide-practice" aria-label="Comparación guiada en la OVA">
              <h5>Pruébalo sin cambiar todo a la vez</h5>
              <ol>
                <li>Activa «Mostrar resultado final». Conserva percentil 95 y compara k=1, k=2 y k=6: mira errores, falsas alarmas y fraudes señalados.</li>
                <li>Vuelve a k=2 y compara percentil 80 con 99. La línea cambia; las barras y los pesos permanecen iguales.</li>
                <li>Restablece el ejemplo y recorre las etapas: son pasos de lectura de la figura, no épocas.</li>
              </ol>
              <p>Las 40 normales se reparten en 24 para entrenar, 8 para calibrar y 8 para comprobar; los 3 fraudes simulados solo ilustran las alarmas. Explorar estos casos no valida un detector real.</p>
            </section>
            <p>Los nombres dependen de la implementación: <code>k</code>, <code>tasa</code>, <code>pasos</code> y <code>l2</code> pertenecen al Python de este artículo. El <G k="escalado">escalado</G> se aprende solo en entrenamiento.</p>
          </section>
        </>
      ),
      deepDive: (
        <p>
          Tiene dos mitades: el codificador comprime cada dato en unos pocos números (el código) y el decodificador lo
          reconstruye. Variantes: el que quita ruido (aprende a limpiar datos ensuciados a propósito) y el variacional,
          que aprende a generar datos nuevos parecidos a los de entrenamiento.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Compáralo como candidato para <b>detectar lo raro</b> cuando casi todos tus datos son normales y hay pocos o ningún ejemplo de
            lo anormal.
          </p>
          <ul>
            <li>Fraude en compras con tarjeta.</li>
            <li>Fallas incipientes en máquinas, con las lecturas de sus sensores.</li>
            <li>Comprimir imágenes o señales en pocos números para usarlos en otro modelo.</li>
          </ul>
          <p className="mlx-rule">Entrena con normales representativas, <G k="aeCalibracion">calibra</G> una regla de alarma y comprueba qué <G k="anomalia">anomalías</G> deja pasar y cuántos normales señala.</p>
        </>
      ),
      deepDive: (
        <p>
          Con <G k="desbalance">clases desbalanceadas</G> extremas (1 fraude cada 10 000 compras), un clasificador
          supervisado apenas ve ejemplos de fraude; el <G k="autoencoder">autoencoder</G> no los necesita para entrenar.
          Si los datos son imágenes, el codificador y el decodificador suelen ser{' '}
          <G k="redConvolucional" after=".">redes convolucionales</G>
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> el <G k="autoencoder">autoencoder</G> de la OVA comprime 6 medidas en k números y reconstruye las 6. Aprende con 24 compras normales y calcula el error de otras compras sin volver a ajustar sus pesos.
          </p>
          <p>El <G k="umbral">umbral</G> es el percentil elegido de los errores de 8 normales de <G k="aeCalibracion">calibración</G>. Una compra se señala si su error lo supera. Otras 8 normales permiten contar falsas alarmas; los 3 fraudes simulados permiten ver cuántos se señalan.</p>
          <Tex block>
            {
              '\\begin{gathered} z = f(x), \\qquad \\hat{x} = g(z) \\\\ \\text{error}(x) = \\frac{1}{d}\\sum_{j=1}^{d} (x_j - \\hat{x}_j)^2 \\end{gathered}'
            }
          </Tex>
          <p>
            <Tex>{'f'}</Tex> es el codificador, <Tex>{'z'}</Tex> el código (k números), <Tex>{'g'}</Tex> el
            decodificador y <Tex>{'d'}</Tex> el número de medidas. Se entrena para que el{' '}
            <G k="reconstruccion">error de reconstrucción</G> sea pequeño en los datos normales.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Si <Tex>{'f'}</Tex> y <Tex>{'g'}</Tex> son lineales y el error es cuadrático, la mejor solución reconstruye
            igual que <G k="pca">PCA</G> (Baldi y Hornik, 1989): su código ocupa el mismo subespacio que los k primeros{' '}
            <G k="componentePrincipal" after=",">componentes principales</G> con los ejes posiblemente girados. El simulador usa
            esa solución exacta; el ejercicio de Python busca un ajuste lineal con{' '}
            <G k="descensoGradiente" after=".">descenso de gradiente</G> y un presupuesto finito: no se garantiza alcanzar el óptimo.
          </p>
          <p>
            Un autoencoder no lineal añade <G k="capaOculta">capas ocultas</G> con{' '}
            <G k="funcionActivacion" after=":">funciones de activación</G> con ellas puede comprimir estructuras curvas. Se entrena como
            cualquier red, con <G k="retropropagacion" after=".">retropropagación</G>
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que <b>lo normal tiene un patrón que se puede comprimir</b> y que lo raro no lo sigue. Si las compras
            normales fueran puro azar, no habría nada que aprender y todo se reconstruiría igual de mal.
          </p>
          <p>
            También supone que los datos de entrenamiento son normales. Si están llenos de fraudes, el{' '}
            <G k="autoencoder">autoencoder</G> aprende a reconstruirlos y deja de detectarlos.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Las <G k="feature">features</G> deben estar en escalas parecidas: si no, el error de una medida grande tapa el
          de las demás. El ejercicio las <G k="escalado">estandariza</G> con la media y la desviación de las 600 normales de entrenamiento, y aplica esa misma transformación a validación, <G k="aeCalibracion">calibración</G> y prueba. Las del simulador no están estandarizadas, pero ya tienen escalas
          parecidas (desviaciones entre 0.8 y 1.9).
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>No necesita ejemplos de fraude:</b> aprende solo con compras normales. En el ejercicio, ninguno de los 10
            fraudes se usó para entrenar.
          </li>
          <li>
            <b>Compresión no lineal:</b> con <G k="capaOculta">capas ocultas</G> capta curvas que <G k="pca">PCA</G> no
            ve.
          </li>
          <li>
            <b>Una señal fácil de usar:</b> el <G k="reconstruccion">error de reconstrucción</G> es un número por dato;
            se contrasta con un <G k="umbral" after=".">umbral</G>
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          El error de cada medida también orienta la revisión: si una compra se reconstruye mal sobre todo en «distancia
          a casa», esa es la medida que se salió del patrón. El código del <G k="cuelloBotella">cuello de botella</G>{' '}
          sirve además como <G k="feature">features</G> compactas para otro modelo.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>El tamaño del cuello es delicado:</b> reducir el error normal no garantiza detectar más anomalías. Un modelo con demasiada capacidad puede reconstruirlas bien también.
          </li>
          <li>
            <b>Difícil de ajustar:</b> capas, <G k="neurona" after=",">neuronas</G> <G k="epoca">épocas</G> y{' '}
            <G k="umbral" after=",">umbral</G> sin etiquetas que digan cuál es mejor.
          </li>
          <li>
            <b>Falsas alarmas:</b> lo raro no siempre es fraude; un cliente que viaja por primera vez también
            reconstruye mal.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          La OVA lineal con k=6 copia las seis medidas sin error útil para distinguir casos. Eso no implica que toda red con seis neuronas aprenda una identidad exacta. Compara arquitectura y entrenamiento con validación; reserva la prueba para la evaluación final. Si no tienes <G k="anomalia">anomalías</G> etiquetadas representativas, no puedes estimar cuántas detectaría.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">
            No lo uses si un <G k="pca">PCA</G> ya resuelve el problema o si tienes muchos ejemplos etiquetados.
          </p>
          <p>
            Ejemplo: si tienes fraudes confirmados representativos, compara un clasificador supervisado (Random Forest o Gradient Boosting): puede aprender directamente qué distingue al fraude. Y si los datos son pocos y el patrón es lineal, PCA
            da lo mismo sin entrenar una red.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Con pocas medidas y <G k="anomalia">anomalías</G> que son puntos aislados en el espacio, DBSCAN o Isolation
          Forest (un <G k="ensamble">ensamble</G> de árboles que aísla lo raro con pocos cortes) son alternativas que conviene comparar por calidad, costo y facilidad de revisión.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Detección de fraude.</b> Los bancos marcan compras sospechosas comparándolas con el patrón normal de cada
            cliente; un <G k="autoencoder">autoencoder</G> es una de las herramientas para aprender ese patrón.
          </p>
          <p>
            El ejercicio separa 600 normales de entrenamiento, 200 de validación, 100 de <G k="aeCalibracion">calibración</G> y 100 de prueba. Compara k=1, 2 y 4 con 20 fraudes de validación; fija el umbral con calibración y consulta al final los 100 normales y 10 fraudes de prueba. Ningún fraude entrena los pesos.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            En producción el <G k="umbral">umbral</G> se fija según el costo de revisar una alarma contra el de dejar
            pasar un fraude, y se vigila que el patrón normal no cambie con el tiempo.
          </p>
          <p>
            El notebook de Colab trae, como celda opcional, un <G k="autoencoder">autoencoder</G> no lineal en{' '}
            <G k="pytorch" after=",">PyTorch</G> con una <G k="capaOculta">capa oculta</G> antes y después del cuello. Es un ejemplo independiente: informa validación y no vuelve a consultar la prueba final.
          </p>
        </>
      ),
    },
  },
  Ova: AutoencoderOva,
  ovaTab: 'type',
  autoPlayOva: true,
  python: { code, expectedOutput, colabNotebook: 'autoencoders' },
  inYourField: [
    {
      area: 'Mecánica',
      example: 'avisar cuando las vibraciones de una bomba dejan de parecerse a las de su funcionamiento normal.',
    },
    {
      area: 'Eléctrica',
      example: 'detectar medidores con consumos que no siguen el patrón de su zona (posibles fraudes o fallas).',
    },
    {
      area: 'Industrial',
      example: 'marcar lotes de producción cuyas mediciones de calidad se salen del patrón habitual.',
    },
  ],
  alternatives: ['pca', 'dbscan'],
};

export default autoencoders;
