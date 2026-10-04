import { G } from '../Gloss';
import { Tex } from '../Tex';
import { SvmOva } from '../ovas/SvmOva';
import type { AlgorithmModule } from '../types';
import code from './python/svm.py?raw';
import expectedOutput from './python/svm.out.txt?raw';

const svm: AlgorithmModule = {
  slug: 'svm',
  row: {
    type: 'Supervisado',
    bestUse: 'Datos de muchas dimensiones',
    formula: 'Maximizar el margen',
    assumptions: 'Clases separables (el kernel ayuda)',
    pros: 'Eficaz con muchas features',
    cons: 'Lento con muchos datos',
    whenNot: 'Conjuntos de datos muy grandes',
    realWorld: 'Reconocimiento de imágenes (rostros, dígitos)',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>
              <G k="supervisado">Supervisado</G>:
            </b>{' '}
            aprende de ejemplos con respuesta (imágenes de dígitos con el número que muestran).
          </p>
          <p>
            Busca la <G k="frontera">frontera</G> que <b>separa las clases dejando la franja más ancha posible</b> a
            cada lado, con pocos puntos dentro. Esa franja es el <G k="margen">margen</G>.
          </p>
          <p>
            Se usa sobre todo para clasificar. Existe una versión para predecir números (SVR), que no cubre este
            explorador.
          </p>
        </>
      ),
      deepDive: (
        <p>
          SVM viene de <i>Support Vector Machine</i>, máquina de vectores de soporte. Con más de dos clases,{' '}
          <code>SVC</code> de scikit-learn entrena un modelo por cada par de clases (
          <G k="unoContraUno">uno contra uno</G>) y los pone a votar: con los 10 dígitos son 45 modelos.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo con <b>conjuntos pequeños o medianos</b> (hasta decenas de miles de filas) y{' '}
            <b>
              muchas <G k="feature">features</G>
            </b>
            , cuando las clases están bien separadas.
          </p>
          <ul>
            <li>Reconocer dígitos o caracteres en imágenes pequeñas.</li>
            <li>Clasificar textos representados con miles de palabras.</li>
            <li>Clasificar señales (ECG, vibración) a partir de features ya calculadas.</li>
          </ul>
          <p className="mlx-rule">
            Si tienes más features que filas y las clases se separan bien, prueba una SVM lineal.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Con texto o <G k="disperso">datos dispersos</G> suele bastar el kernel lineal (<code>LinearSVC</code>, mucho
          más rápido). Con pocas features y fronteras curvas, el kernel RBF. Antes de entrenar hay que escalar las
          features.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> en el simulador, con kernel lineal y C = 1, la franja mide 2.13 de ancho y la definen solo
            5 de los 22 puntos: los <G k="vectorSoporte">vectores de soporte</G>. Si borras cualquier otro punto, la
            frontera no se mueve.
          </p>
          <p>
            La frontera es una recta (o un <G k="hiperplano">hiperplano</G>) y el margen se mide así:
          </p>
          <Tex block>{'w \\cdot x + b = 0, \\qquad \\text{ancho del margen} = \\frac{2}{\\lVert w \\rVert}'}</Tex>
          <p>
            <Tex>{'w'}</Tex> es la dirección perpendicular a la frontera y <Tex>{'b'}</Tex> la desplaza. Maximizar
            el margen es lo mismo que hacer <Tex>{'\\lVert w \\rVert'}</Tex> lo más pequeño posible.
          </p>
          <p>
            <G k="parametroC">C</G> dice cuánto castigar los puntos que quedan dentro del margen o del lado
            equivocado. Con C = 0.01 el margen se abre a 7.03 y 17 puntos quedan sobre él o dentro; con C = 100 se
            estrecha a 1.94 y solo quedan 4.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Problema de <G k="margenBlando">margen blando</G>:
          </p>
          <Tex block>
            {'\\min_{w,b,\\xi}\\ \\tfrac12\\lVert w\\rVert^2 + C\\sum_i \\xi_i \\quad \\text{sujeto a}\\quad y_i(w\\cdot x_i + b) \\ge 1 - \\xi_i,\\ \\ \\xi_i \\ge 0'}
          </Tex>
          <p>
            Su <G k="dual">forma dual</G> solo usa productos <Tex>{'x_i \\cdot x_j'}</Tex>. Cambiarlos por un{' '}
            <G k="kernel">kernel</G> <Tex>{'K(x_i, x_j)'}</Tex> da fronteras curvas sin calcular features nuevas:
          </p>
          <Tex block>{'K_{\\text{RBF}}(x, z) = e^{-\\gamma \\lVert x - z \\rVert^2}'}</Tex>
          <p>
            El simulador resuelve el dual con SMO, el mismo método de LIBSVM, la biblioteca que usa{' '}
            <code>SVC</code>; sus cifras coinciden a dos decimales con las de scikit-learn (con{' '}
            <Tex>{'\\gamma'}</Tex> = 0.3 fijo y tolerancia fina, <code>tol=1e-6</code>). Valores por defecto en
            scikit-learn: kernel RBF, C = 1 y <Tex>{'\\gamma'}</Tex> = <code>"scale"</code>.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que <b>las clases se pueden separar</b> con una frontera, aunque sea con algunos errores. Si no
            se separan con una recta, el <G k="kernel">kernel RBF</G> permite curvas.
          </p>
          <p>
            También supone <b>features en escalas comparables</b>: el margen se mide con distancias, así que una
            feature en millones aplasta a otra entre 0 y 1. Por eso se aplica <G k="escalado">escalado</G> antes.
          </p>
        </>
      ),
      deepDive: (
        <p>
          En el ejercicio los píxeles van de 0 a 16 y se dividen por 16 para dejarlos entre 0 y 1. Con kernel RBF,{' '}
          <G k="gamma">γ</G> también depende de la escala: el valor <code>"scale"</code> lo ajusta según la varianza
          de los datos.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Eficaz con muchas features:</b> en el ejercicio, con 64 features (los píxeles de cada imagen),
            acierta 98.7 % de dígitos nuevos con los valores por defecto.
          </li>
          <li>
            <b>Fronteras flexibles:</b> con un kernel se adapta a formas curvas.
          </li>
          <li>
            <b>Solo importan unos puntos:</b> la frontera depende solo de los vectores de soporte. Si son pocos el
            modelo es pequeño; en el ejercicio, con RBF y C = 1, guarda 593 de 1 257 imágenes.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          El problema de optimización es <G k="convexo">convexo</G>: no hay mínimos locales que atrapen al
          algoritmo, así que el óptimo que encuentra es el global. Maximizar el margen actúa como{' '}
          <G k="regularizacion">regularización</G>, por eso suele resistir bien el{' '}
          <G k="overfitting">sobreajuste</G> con muchas features, si C y γ están bien elegidos (con γ muy grande el
          RBF rodea cada punto y memoriza).
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Lento con muchos datos:</b> el tiempo de entrenamiento crece al menos con el cuadrado del número de
            filas (y puede llegar al cubo): con el doble de filas tarda al menos 4 veces más.
          </li>
          <li>
            <b>
              Sensible a C y <G k="gamma">γ</G>:
            </b>{' '}
            en el ejercicio, el kernel RBF con C = 0.01 acierta solo 18.3 %; con C = 1, 98.7 %.
          </li>
          <li>
            <b>Sin probabilidades directas:</b> entrega un puntaje con signo (proporcional a la distancia a la
            frontera), no una probabilidad.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          scikit-learn advierte que <code>SVC</code> se vuelve poco práctico por encima de decenas de miles de filas.
          Con <code>probability=True</code> estima probabilidades con{' '}
          <G k="validacionCruzada">validación cruzada</G> interna (<G k="calibracion">escalado de Platt</G>): entrena
          más lento y esas probabilidades pueden no coincidir con la clase que da <code>predict</code>. C y{' '}
          <Tex>{'\\gamma'}</Tex> son <G k="hiperparametro">hiperparámetros</G>: se eligen juntos con validación
          cruzada.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses con cientos de miles de filas o más.</p>
          <p>
            Ejemplo: clasificar millones de transacciones. Entrenar una SVM con kernel RBF tardaría horas o días;
            un modelo lineal o un ensamble de árboles tarda minutos.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Tampoco es buena idea si necesitas probabilidades bien calibradas (mejor regresión logística) o si las
          clases se solapan mucho y hay mucho <G k="ruido">ruido</G>: el modelo termina con casi todos los puntos
          como vectores de soporte y pierde su ventaja. Para elegir C y γ se usa{' '}
          <G k="validacionCruzada">validación cruzada</G>, que multiplica el tiempo de entrenamiento.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Reconocimiento de imágenes.</b> A finales de los 90 y comienzos de los 2000 las SVM estaban entre los
            mejores métodos para reconocer dígitos escritos a mano y detectar rostros, antes de que las{' '}
            <G k="redConvolucional">redes convolucionales</G> las superaran.
          </p>
          <p>
            El ejercicio usa los 1 797 dígitos de 8×8 píxeles que trae scikit-learn. Compara kernel lineal y RBF con
            tres valores de C. Con RBF y C = 1 falla 7 de 540 imágenes nuevas (98.7 %); con C = 100 llega a 99.4 %.
            Con C = 0.01 el modelo casi no aprende: las 1 257 imágenes de entrenamiento quedan como vectores de
            soporte y acierta 18.3 %.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Aquí el kernel lineal ya acierta 98.5 % (C = 1): en 64 dimensiones los dígitos casi se separan con planos.
          La ventaja del RBF es pequeña. Esa es la regla con muchas features: prueba primero el lineal.
        </p>
      ),
    },
  },
  Ova: SvmOva,
  python: { code, expectedOutput, colabNotebook: 'svm' },
  inYourField: [
    { area: 'Biomédica', example: 'clasificar latidos de un electrocardiograma como normales o arrítmicos a partir de features de la señal.' },
    { area: 'Química', example: 'identificar el origen o la adulteración de una muestra a partir de su espectro infrarrojo.' },
    { area: 'Electrónica', example: 'detectar fallas en motores a partir de features de vibración, con pocos ejemplos de falla.' },
  ],
  alternatives: ['logistic-regression', 'random-forest', 'knn'],
};

export default svm;
