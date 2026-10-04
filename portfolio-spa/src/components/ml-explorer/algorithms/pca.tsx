import { G } from '../Gloss';
import { Tex } from '../Tex';
import { PcaOva } from '../ovas/PcaOva';
import type { AlgorithmModule } from '../types';
import code from './python/pca.py?raw';
import expectedOutput from './python/pca.out.txt?raw';

const pca: AlgorithmModule = {
  slug: 'pca',
  row: {
    type: 'Reducción de dimensionalidad',
    bestUse: 'Reducir el número de features',
    formula: 'Autovectores de la matriz de covarianza',
    assumptions: 'Relaciones lineales entre features',
    pros: 'Menos features: entrenar más rápido y con menos sobreajuste',
    cons: 'Las nuevas features son difíciles de interpretar',
    whenNot: 'Cuando necesitas features interpretables',
    realWorld: 'Compresión de imágenes',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>Reducción de dimensionalidad:</b> no predice nada. Toma datos con muchas columnas (
            <G k="feature">features</G>) y los resume en <b>pocas columnas nuevas</b> que conservan casi toda la
            variación de los datos.
          </p>
          <p>
            Como el agrupamiento, es <G k="noSupervisado">no supervisado</G>: no usa ninguna respuesta, solo cómo
            varían los datos. Las columnas nuevas son los <G k="componentePrincipal">componentes principales</G>.
          </p>
          <p>
            <b>¿Cómo se evalúa sin respuestas?</b> Con la <G k="varianzaExplicada">varianza retenida</G> (qué
            fracción de la variación original conservan los componentes) y con el error al reconstruir los datos
            originales. Si después entrenas un modelo, la prueba final es cuánto acierta ese modelo.
          </p>
        </>
      ),
      deepDive: (
        <p>
          <G k="pca">PCA</G> viene de <i>Principal Component Analysis</i>, análisis de componentes principales. Se usa de tres formas:
          comprimir datos, quitar ruido (los últimos componentes suelen ser ruido) y dibujar en 2D datos de muchas
          dimensiones.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo cuando tienes <b>muchas <G k="feature">features</G> que se parecen entre sí</b>: medidas
            redundantes, píxeles vecinos, sensores que miden casi lo mismo.
          </p>
          <ul>
            <li>Comprimir imágenes o señales.</li>
            <li>Reducir cientos de columnas antes de entrenar un modelo lento.</li>
            <li>Dibujar en 2D un conjunto de datos de muchas dimensiones para explorarlo.</li>
          </ul>
          <p className="mlx-rule">
            Si tus features están muy correlacionadas, prueba <G k="pca">PCA</G> y mira cuántos componentes guardan el 90 % de la
            varianza.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Antes de PCA hay que <G k="escalado">estandarizar</G> las features si están en unidades distintas: si no,
          la que tiene números más grandes se queda con el primer componente solo por su escala. En el ejercicio no
          hace falta porque todos los píxeles van de 0 a 16.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> si todos los puntos están sobre la diagonal, como (0, 0), (1, 1), (2, 2) y (3, 3), un eje
            a 45° conserva el 100 % de su variación: basta un número por punto (su posición sobre la diagonal) en vez
            de dos. El eje horizontal conserva solo el 50 % y el perpendicular a la diagonal, el 0 %.
          </p>
          <p>
            En el simulador los puntos no están en una recta perfecta. El eje horizontal conserva el 66.5 % de la{' '}
            <G k="varianza">varianza</G>; girado a 34° llega al máximo, 94.6 %. Ese eje es el primer{' '}
            <G k="componentePrincipal">componente principal</G>.
          </p>
          <p>
            Esas direcciones son los <G k="autovector">autovectores</G> de la matriz de covarianza:
          </p>
          <Tex block>{'\\Sigma = \\frac{1}{n-1} X_c^\\top X_c, \\qquad \\Sigma\\, v_j = \\lambda_j\\, v_j'}</Tex>
          <p>
            <Tex>{'X_c'}</Tex> son los datos con la media restada. Cada <Tex>{'v_j'}</Tex> es una dirección y{' '}
            <Tex>{'\\lambda_j'}</Tex> la varianza que captura. El primer componente tiene el{' '}
            <Tex>{'\\lambda'}</Tex> más grande, y la fracción que conserva es <Tex>{'\\lambda_1 / \\sum_j \\lambda_j'}</Tex>.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Comprimir es proyectar: <Tex>{'z = V_k^\\top (x - \\bar{x})'}</Tex> da los k números de cada dato, y{' '}
            <Tex>{'\\hat{x} = \\bar{x} + V_k\\, z'}</Tex> lo reconstruye. Ninguna otra proyección lineal a k
            dimensiones deja un <G k="reconstruccion">error de reconstrucción</G> cuadrático menor.
          </p>
          <p>
            scikit-learn elige el método según la forma de los datos: con muchas más filas que columnas, como en el
            ejercicio, calcula <Tex>{'\\Sigma'}</Tex> y sus autovectores; si no, usa la descomposición en valores
            singulares (SVD) de <Tex>{'X_c'}</Tex>, sin formar <Tex>{'\\Sigma'}</Tex>. El signo de cada componente es
            arbitrario: dos programas pueden dar el mismo eje apuntando en sentidos opuestos.
          </p>
          <p>
            Con <code>whiten=True</code> cada componente se divide además por su desviación estándar, para que todos
            queden con varianza 1; útil antes de modelos sensibles a la escala. Por defecto es <code>False</code>.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone <b>relaciones lineales</b>: los componentes son rectas (o planos) a través de los datos. Si los
            datos forman una curva, como una espiral o una luna, <G k="pca">PCA</G> no la «desenrolla» y necesita más componentes de
            los que parece.
          </p>
          <p>
            También supone que <b>la información está donde hay más <G k="varianza">varianza</G></b>. Casi siempre es
            así, pero una dirección con poca varianza puede ser justo la que distingue dos clases.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Para estructuras curvas existen versiones no lineales: <code>KernelPCA</code>, los autoencoders (redes que
          aprenden a comprimir) y, solo para dibujar, <G k="tsneUmap">t-SNE y UMAP</G>. Los{' '}
          <G k="outlier">outliers</G> también afectan a PCA: como la varianza usa cuadrados, un punto muy lejano
          puede llevarse un componente entero.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Menos columnas, poca pérdida:</b> en el ejercicio, 21 de 64 componentes retienen el 90 % de la
            varianza de las imágenes.
          </li>
          <li>
            <b>Modelos más rápidos y estables:</b> con menos <G k="feature">features</G> se entrena más rápido y hay
            menos riesgo de <G k="overfitting">sobreajuste</G>.
          </li>
          <li>
            <b>Sin parámetros delicados:</b> el único es cuántos componentes guardar, y la{' '}
            <G k="varianzaExplicada">varianza retenida</G> ayuda a elegirlo.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Los componentes no están correlacionados entre sí, lo que ayuda a los modelos que sufren con features
          correlacionadas, como la regresión lineal. Es determinista (salvo el signo) y rápido: con miles de filas y
          cientos de columnas tarda una fracción de segundo.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Columnas difíciles de interpretar:</b> cada componente mezcla todas las{' '}
            <G k="feature">features</G> originales con distintos pesos. «Componente 1 = 0.4·edad + 0.3·ingreso − …»
            no se le explica fácil a nadie.
          </li>
          <li>
            <b>Solo ve relaciones lineales:</b> no capta curvas.
          </li>
          <li>
            <b>Se pierde algo:</b> en el ejercicio, con 10 componentes se retiene el 74 % y el error típico por
            píxel es 2.22 (en una escala de 0 a 16).
          </li>
          <li>
            <b>No ahorra mediciones:</b> cada componente se calcula con todas las <G k="feature">features</G>{' '}
            originales, así que para un dato nuevo hay que medirlas todas. Si quieres medir menos, elige features en
            vez de usar PCA.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          <G k="pca">PCA</G> no mira la respuesta, así que puede descartar justo la dirección que separa las clases. Si el objetivo
          es clasificar, compara el modelo con y sin PCA en datos de prueba. Además, el ajuste de PCA forma parte del
          entrenamiento: hay que calcularlo solo con los datos de entrenamiento.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses cuando necesitas explicar el modelo con las columnas originales.</p>
          <p>
            Ejemplo: un modelo de crédito que debe justificar cada rechazo («su deuda es alta»). Si entrenas con
            componentes, la explicación sería «su componente 3 es bajo», que no le sirve a nadie. Mejor elige un
            subconjunto de las <G k="feature">features</G> originales.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Tampoco sirve con pocas columnas poco correlacionadas (no hay nada que resumir) ni con estructura curva
          fuerte. Para elegir columnas originales, mira la importancia de cada feature en un modelo de árboles.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Compresión y reconocimiento de imágenes.</b> Una de las primeras técnicas de reconocimiento facial, las
            «eigenfaces» (1991), guardaba cada rostro como unos pocos{' '}
            <G k="componentePrincipal">componentes principales</G> en vez de miles de píxeles.
          </p>
          <p>
            El ejercicio usa los 1 797 dígitos de 8×8 píxeles (64 números por imagen) que trae scikit-learn. Con 2
            componentes se retiene el 29 % de la <G k="varianza">varianza</G>; con 10, el 74 %; con 20, el 89 %; y
            con 40, el 99 %. La figura muestra un dígito reconstruido con 2, 5, 10 y 20 números.
          </p>
        </>
      ),
      deepDive: (
        <p>
          El <G k="reconstruccion">error de reconstrucción</G> (error típico por píxel) baja de 4.00 (1 componente) a 0.47 (40). Los
          formatos de imagen como JPEG no usan PCA: usan una transformada fija (la del coseno), que no hay que
          calcular para cada imagen. <G k="pca">PCA</G> gana cuando todas las imágenes se parecen, como rostros o dígitos.
        </p>
      ),
    },
  },
  Ova: PcaOva,
  python: { code, expectedOutput, colabNotebook: 'pca' },
  inYourField: [
    { area: 'Industrial', example: 'resumir decenas de variables de un proceso en 2 o 3 componentes para vigilarlas en un solo gráfico de control.' },
    { area: 'Química', example: 'reducir un espectro de cientos de longitudes de onda a unos pocos componentes antes de calibrar.' },
    { area: 'Civil', example: 'resumir las mediciones de muchos sensores de una estructura para detectar cambios en su comportamiento.' },
  ],
  alternatives: ['autoencoders', 'random-forest'],
};

export default pca;
