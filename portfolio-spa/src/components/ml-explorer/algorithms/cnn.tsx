import { G } from '../Gloss';
import { Tex } from '../Tex';
import { CnnOva } from '../ovas/CnnOva';
import type { AlgorithmModule } from '../types';
import code from './python/cnn.py?raw';
import expectedOutput from './python/cnn.out.txt?raw';

const cnn: AlgorithmModule = {
  slug: 'cnn',
  row: {
    type: 'Supervisado',
    bestUse: 'Imágenes y otros datos en cuadrícula',
    formula: 'Convoluciones + pooling',
    assumptions: 'Los valores vecinos están relacionados (estructura espacial)',
    pros: 'Muy buena con imágenes',
    cons: 'Costosa de entrenar; necesita muchas imágenes etiquetadas',
    whenNot: 'Datos sin estructura espacial, como una tabla',
    realWorld: 'Reconocimiento facial e imágenes médicas',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>
              <G k="supervisado">Supervisado</G>:
            </b>{' '}
            aprende de imágenes que ya traen su etiqueta («gato», «tumor», «7»). Es una{' '}
            <G k="redNeuronal">red neuronal</G> pensada para datos en cuadrícula, como los píxeles de una foto.
          </p>
          <p>
            En vez de mirar cada píxel por separado, recorre la imagen con <b>filtros pequeños</b> (por ejemplo, de
            3×3) que detectan patrones locales: bordes, esquinas, texturas. Esa operación es la{' '}
            <G k="convolucion">convolución</G>, y de ahí el nombre: <i>Convolutional Neural Network</i>.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Las primeras capas aprenden bordes; las siguientes combinan bordes en formas y las últimas, formas en
          objetos. Al final suele ir un MLP pequeño que clasifica. Además de clasificar, las{' '}
          <G k="redConvolucional">redes convolucionales</G> localizan objetos en la imagen y la segmentan píxel a píxel.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsala con <b>imágenes</b> y con cualquier dato donde los valores vecinos se relacionan: espectrogramas de
            audio, mapas, señales de sensores en el tiempo.
          </p>
          <ul>
            <li>Clasificar radiografías o fotos de piezas defectuosas.</li>
            <li>Leer placas de vehículos o texto en documentos escaneados.</li>
            <li>Detectar fisuras en fotos de una estructura.</li>
          </ul>
          <p className="mlx-rule">
            Si tus datos son imágenes, empieza por una <G k="redConvolucional">red convolucional</G> ya entrenada y
            ajústala a tu problema.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Partir de una red entrenada con millones de fotos (<G k="transferencia">aprendizaje por transferencia</G>)
          permite buenos resultados con cientos de imágenes por clase. Desde 2020 los Vision{' '}
          <G k="transformer">Transformers</G> compiten con ellas cuando hay muchísimos datos.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> un filtro de 3×3 para bordes verticales tiene −1 en la columna izquierda, 0 en el centro y
            1 a la derecha. Sobre la esquina de arriba a la izquierda del «7» del simulador, la fila de arriba es fondo y
            en las otras dos hay tinta en el centro y a la derecha: fila por fila da 0 + 1 + 1 = 2. Donde el trazo termina a la derecha, la
            suma da −3 y la <G k="relu">ReLU</G> la deja en 0.
          </p>
          <p>
            Repetir la cuenta en las 36 posiciones da un <G k="mapaActivacion">mapa de activación</G> de 6×6: alto donde
            hay un borde izquierdo de un trazo. Después, el <G k="pooling">max pooling</G> de 2×2 resume cada bloque con
            su máximo y deja un mapa de 3×3.
          </p>
          <Tex block>{'S_{i,j} = \\sum_{a=0}^{2} \\sum_{b=0}^{2} I_{i+a,\\, j+b}\\, K_{a,b}, \\qquad A = \\max(0, S)'}</Tex>
          <p>
            <Tex>{'I'}</Tex> es la imagen, <Tex>{'K'}</Tex> el filtro (sus 9 pesos se aprenden) y <Tex>{'A'}</Tex> el
            mapa tras la ReLU. Una capa tiene muchos filtros y cada uno produce su propio mapa.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            En las redes se llama <G k="convolucion">convolución</G> aunque, en rigor, es una correlación: el filtro no
            se voltea. Da igual, porque sus pesos se aprenden. El <i>stride</i> (salto entre posiciones) y el{' '}
            <i>padding</i> (borde de ceros) controlan el tamaño del mapa: con paso 1 y sin borde, de 8×8 se pasa a 6×6.
          </p>
          <p>
            Con una imagen en color, cada filtro tiene 3×3×3 pesos (uno por canal rojo, verde y azul). El entrenamiento
            es el de cualquier red: <G k="retropropagacion">retropropagación</G> y{' '}
            <G k="descensoGradiente">descenso de gradiente</G>.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que <b>lo que importa está en los vecinos</b>: un borde es un cambio entre píxeles contiguos. Si
            barajas las columnas de una tabla, nada cambia; si barajas los píxeles de una foto, se pierde la imagen.
            La <G k="convolucion">convolución</G> aprovecha justo ese orden.
          </p>
          <p>
            También supone que <b>un patrón significa lo mismo en cualquier lugar</b>: un borde arriba a la izquierda es
            el mismo borde abajo a la derecha. Por eso usa el mismo filtro en todas las posiciones.
          </p>
        </>
      ),
      deepDive: (
        <p>
          La <G k="convolucion">convolución</G> es equivariante: si el 7 se mueve, el mapa se mueve igual. El{' '}
          <G k="pooling">pooling</G> añade un poco de invariancia: el resumen casi no cambia ante desplazamientos de un
          píxel, pero no ante giros ni cambios de escala: si todas las fotos de entrenamiento están derechas, una foto girada puede fallar. Para eso se usa el{' '}
          <G k="aumentoDatos">aumento de datos</G>.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Pocos pesos:</b> en el ejercicio, un filtro de 3×3 usa 9 pesos en las 36 posiciones; una capa densa de
            64 píxeles a 36 salidas necesitaría 2 304.
          </li>
          <li>
            <b>Aprende qué mirar:</b> los filtros se ajustan solos; nadie le dice que busque bordes.
          </li>
          <li>
            <b>Muy buena con imágenes:</b> desde 2012 las <G k="redConvolucional">redes convolucionales</G> dominan el
            reconocimiento de imágenes.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          En 2012, AlexNet, una <G k="redConvolucional">red convolucional</G> entrenada en <G k="gpu">GPU</G>, ganó el
          concurso ImageNet con un error top-5 de 15 % (falla si la clase correcta no está entre sus 5 primeras
          opciones), contra 26 % del segundo. Compartir pesos también hace que el modelo resista mejor el{' '}
          <G k="overfitting">sobreajuste</G> que una red densa con las mismas salidas, porque tiene muchos menos pesos.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Necesita muchas imágenes etiquetadas:</b> miles por clase si se entrena desde cero.
          </li>
          <li>
            <b>Costosa:</b> entrenar una red grande toma horas o días en <G k="gpu">GPU</G>.
          </li>
          <li>
            <b>Caja negra:</b> se pueden dibujar los <G k="mapaActivacion">mapas de activación</G>, pero no explican del
            todo por qué decide.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Puede aprender atajos: si todas las fotos de una clase tienen la misma marca de agua, aprende a detectar la
          marca. Contra eso: datos variados, <G k="aumentoDatos">aumento de datos</G> y revisar en qué se fija la red
          con mapas de calor (Grad-CAM, por ejemplo).
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No la uses con datos sin estructura espacial, como una tabla de clientes.</p>
          <p>
            Ejemplo: predecir la rotación de clientes con edad, plan y consumo. El orden de las columnas no significa
            nada, así que la <G k="convolucion">convolución</G> no tiene vecinos que aprovechar. Un <G k="ensamble">ensamble</G> de
            árboles o una SVM funcionan mejor y con muchos menos datos.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Con imágenes pocas y simples, como los dígitos de 8×8 del ejercicio de SVM, una SVM sobre los píxeles ya
          acierta casi todo. Y con imágenes muy grandes y muchísimos datos, los Vision{' '}
          <G k="transformer">Transformers</G> pueden superarla.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Reconocimiento facial e imágenes médicas.</b> Desbloquear el teléfono con la cara o señalar zonas
            sospechosas en una radiografía son tareas de <G k="redConvolucional">redes convolucionales</G>.
          </p>
          <p>
            El ejercicio hace a mano lo que hace la primera capa: pasa dos filtros de 3×3 sobre un «7» de 8×8 píxeles.
            El vertical se enciende en el borde izquierdo de cada trazo, con un máximo de 3 en el palo del 7; el
            horizontal, en el borde de arriba de la barra (2 3 3 3 3 2). El <G k="pooling">max pooling</G> deja cada
            mapa en 3×3.
          </p>
        </>
      ),
      deepDive: (
        <p>
          En la práctica no se programan los filtros: se define la red con <G k="pytorch">PyTorch o TensorFlow</G> y
          se parte de una red ya entrenada (<G k="transferencia">ajuste fino</G>). El notebook de Colab trae, como celda
          opcional, la misma <G k="convolucion">convolución</G> hecha con PyTorch, que da el mismo mapa.
        </p>
      ),
    },
  },
  Ova: CnnOva,
  python: { code, expectedOutput, colabNotebook: 'cnn' },
  inYourField: [
    { area: 'Civil', example: 'detectar fisuras y desprendimientos en fotos de puentes tomadas con dron.' },
    { area: 'Industrial', example: 'inspección visual de piezas en una línea de producción: aceptar o rechazar cada una.' },
    { area: 'Agronómica', example: 'reconocer plagas o enfermedades en fotos de hojas tomadas con el celular.' },
  ],
  alternatives: ['svm', 'transformer'],
};

export default cnn;
