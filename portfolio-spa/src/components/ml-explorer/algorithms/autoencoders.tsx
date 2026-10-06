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
            no necesita etiquetas. La respuesta que aprende a dar es la propia entrada: el{' '}
            <G k="autoencoder">autoencoder</G> es una <G k="redNeuronal">red neuronal</G> que aprende a copiar sus
            datos.
          </p>
          <p>
            El truco es que la copia pasa por un <G k="cuelloBotella" after=":">cuello de botella</G> una capa con menos números
            que la entrada. Para copiar bien, la red tiene que aprender el patrón de los datos.
          </p>
          <p>
            <b>¿Cómo se evalúa sin etiquetas?</b> Con el <G k="reconstruccion">error de reconstrucción</G> en datos que
            no vio. Si se usa para detectar fraude, al final hay que revisar con casos conocidos cuántos atrapa.
          </p>
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
            Úsalo para <b>detectar lo raro</b> cuando casi todos tus datos son normales y hay pocos o ningún ejemplo de
            lo anormal.
          </p>
          <ul>
            <li>Fraude en compras con tarjeta.</li>
            <li>Fallas incipientes en máquinas, con las lecturas de sus sensores.</li>
            <li>Comprimir imágenes o señales en pocos números para usarlos en otro modelo.</li>
          </ul>
          <p className="mlx-rule">Entrénalo solo con datos normales y marca como sospechoso lo que reconstruye mal.</p>
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
            <b>Ejemplo:</b> cada compra del simulador tiene 6 medidas. El <G k="autoencoder">autoencoder</G> las
            comprime en k = 2 números y las vuelve a expandir a 6. Las compras normales siguen un patrón de 2 factores,
            así que se reconstruyen casi perfectas: error medio 0.012. Los fraudes no siguen el patrón: error medio
            2.44.
          </p>
          <p>
            Con un <G k="umbral">umbral</G> igual al mayor error entre las normales (0.035), los 3 fraudes quedan por
            encima. El ejercicio de Python usa un umbral algo más bajo, el percentil 99 de las normales, para no
            depender de una sola compra.
          </p>
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
            esa solución exacta; el ejercicio de Python llega a ella con{' '}
            <G k="descensoGradiente" after=".">descenso de gradiente</G>
          </p>
          <p>
            Lo que distingue al autoencoder de PCA son las <G k="capaOculta">capas ocultas</G> con{' '}
            <G k="funcionActivacion" after=":">funciones de activación</G> con ellas comprime estructuras curvas. Se entrena como
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
          de las demás. El ejercicio las <G k="escalado">estandariza</G> con la media y la desviación de las compras
          normales, y aplica lo mismo a los fraudes. Las del simulador no están estandarizadas, pero ya tienen escalas
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
            basta elegir un <G k="umbral" after=".">umbral</G>
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
            <b>El tamaño del cuello es delicado:</b> en el ejercicio, con k = 1 detecta 9 de 10 fraudes; con 2, los 10,
            y con 4 vuelve a 9. Si es tan ancho como la entrada, copia todo, también el fraude.
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
          En el simulador, con k = 5 se escapa un fraude y con k = 6 no detecta ninguno: el{' '}
          <G k="autoencoder">autoencoder</G> reconstruye todo sin error. En el ejercicio, con k = 4 el error medio de
          los fraudes baja de 20.06 a 0.70 y se escapa uno. Contra eso: elegir k con datos de validación que tengan
          algunas <G k="anomalia">anomalías</G> conocidas.
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
            Ejemplo: si tienes 50 000 fraudes confirmados, entrena un clasificador supervisado (Random Forest o Gradient
            Boosting): aprende directamente qué distingue al fraude. Y si los datos son pocos y el patrón es lineal, PCA
            da lo mismo sin entrenar una red.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Con pocas medidas y <G k="anomalia">anomalías</G> que son puntos aislados en el espacio, DBSCAN o Isolation
          Forest (un <G k="ensamble">ensamble</G> de árboles que aísla lo raro con pocos cortes) son más simples y
          fáciles de explicar.
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
            El ejercicio entrena un autoencoder lineal con 1 000 compras normales simuladas y lo prueba con 10 fraudes.
            Con un <G k="cuelloBotella">cuello de botella</G> de 1 número detecta 9 de 10; con 2, los 10, con un error
            medio de 0.17 en normales y 20.06 en fraudes. La alarma salta si el error supera al del 99 % de las compras
            normales.
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
            <G k="pytorch" after=",">PyTorch</G> con una <G k="capaOculta">capa oculta</G> antes y después del cuello.
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
