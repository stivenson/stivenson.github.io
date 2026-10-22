import { G } from '../Gloss';
import { Tex } from '../Tex';
import { SvmOva } from '../ovas/SvmOva';
import type { AlgorithmModule } from '../types';
import code from './python/svm.py?raw';
import expectedOutput from './python/svm.out.txt?raw';

const svm: AlgorithmModule = {
  slug: 'svm',
  ovaTab: 'type',
  autoPlayOva: true,
  row: {
    type: 'Supervisado',
    bestUse: 'Datos de muchas dimensiones',
    formula: 'Maximizar el margen',
    assumptions: 'Escalas coherentes y datos representativos',
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
              <G k="supervisado" after=":">Supervisado</G>
            </b>{' '}
            aprende de ejemplos con respuesta (imágenes de dígitos con el número que muestran).
          </p>
          <p>
            Busca una <G k="frontera">frontera</G> combinando un <G k="margen">margen</G> amplio con una penalización para los ejemplos que invaden esa zona o quedan del lado equivocado. Es una SVM de <G k="margenBlando">margen blando</G>; no exige separar todos los puntos sin errores.
          </p>
          <p>
            Se usa sobre todo para clasificar. Existe una versión para predecir números <G before="(" k="svr" after="),">SVR</G> que no cubre este
            explorador.
          </p>
          <section className="mlx-hyperparameter-guide" aria-label="Hiperparámetros y escalas de SVM">
          <h4>Qué puedes ajustar</h4>
          <p>Los <G k="hiperparametro">hiperparámetros</G> configuran el entrenamiento. El modelo aprende los pesos de los <G k="vectorSoporte">vectores de soporte</G> y el desplazamiento de la frontera; los anillos blancos no son un número que eliges.</p>
          <ul>
            <li><b>Penalización — <code>C</code>:</b> <G k="parametroC">C</G> pondera las violaciones del margen, incluso en ejemplos bien clasificados dentro de él. Un C mayor da más peso a ese castigo; 1 es una referencia, no el mejor valor universal.</li>
            <li><b>Forma — <code>kernel</code>:</b> el <G k="kernel">kernel</G> lineal produce una frontera recta; <G k="rbf">RBF</G> permite curvas. Cambia la familia de fronteras que puedes aprender.</li>
            <li><b>Influencia — <code>gamma</code>:</b> en RBF, <G k="gamma">gamma</G> mayor hace más local la influencia de cada ejemplo. El kernel lineal lo ignora. En <code>SVC</code>, <code>gamma="scale"</code> se calcula con la varianza del entrenamiento que recibe el modelo; no equivale a 0.3 fijo ni sustituye el escalado.</li>
            <li><b>Clases — <code>class_weight</code>:</b> los <G k="svmPesosClase">pesos de clase</G> multiplican C por clase. <code>"balanced"</code> usa las frecuencias de entrenamiento; no garantiza mejor detección ni reemplaza elegir una métrica adecuada.</li>
            <li><b>Optimización — <code>tol</code> y <code>max_iter</code>:</b> controlan cuándo termina el cálculo, no la velocidad de reproducción. Una tolerancia menor puede exigir más trabajo; llegar al límite no demuestra que el ajuste haya convergido.</li>
          </ul>
          <p className="mlx-rule">Activa «Mostrar ajuste elegido». Compara C = 0.01, 1 y 100 con kernel lineal; luego pasa a RBF y compara gamma = 0.03, 0.3 y 3 manteniendo C. Observa frontera, anillos y acierto de entrenamiento. Elige la combinación con <G k="datosValidacion">validación</G>, no por acertar todos los puntos de la OVA.</p>
          <p>Antes de comparar, conserva el mismo <G k="escalado">escalado</G>. La OVA usa dos ejes en 0–10 y pesos iguales. Python aprende las escalas solo con entrenamiento mediante <code>StandardScaler</code> dentro de una <code>Pipeline</code> (una secuencia que transforma y después entrena). La misma transformación se aplica a los demás conjuntos.</p>
          </section>
        </>
      ),
      deepDive: (
        <p>
          SVM viene de <i>Support Vector Machine</i>, máquina de <G k="vectorSoporte" after=".">vectores de soporte</G> Con más de dos clases,{' '}
          <code>SVC</code> de scikit-learn entrena un modelo por cada par de clases (
          <G k="unoContraUno" after=")">uno contra uno</G> y los pone a votar: con los 10 dígitos son 45 modelos.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo con <b>conjuntos cuyo tamaño permita entrenar y comparar candidatos</b> y{' '}
            <b>
              muchas <G k="feature">features</G>
            </b>
            , cuando esa representación recoge información útil para distinguir las clases.
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
          Con texto o <G k="disperso">datos dispersos</G>, compara un modelo lineal como <code>LinearSVC</code>, diseñado para problemas grandes; no es el mismo <G k="solver">solver</G> ni la misma configuración que <code>SVC(kernel="linear")</code>. Para relaciones no lineales, prueba <G k="rbf">RBF</G> junto con C y gamma. Si escalas una matriz dispersa con StandardScaler, usa <code>with_mean=False</code> para evitar centrarla y volverla densa.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> en el simulador, activa el ajuste elegido con kernel lineal y C = 1: la franja mide 2.13 de ancho y la definen solo
            5 de los 22 puntos: los <G k="vectorSoporte" after=".">vectores de soporte</G> Sus pesos aprendidos intervienen en la función de decisión.
          </p>
          <p>
            La frontera es una recta (o un <G k="hiperplano" after=")">hiperplano</G> y el margen se mide así:
          </p>
          <Tex block>{'\\begin{gathered} w \\cdot x + b = 0 \\\\ \\text{ancho del margen} = \\frac{2}{\\lVert w \\rVert} \\end{gathered}'}</Tex>
          <p>
            <Tex>{'w'}</Tex> es la dirección perpendicular a la frontera y <Tex>{'b'}</Tex> la desplaza. El entrenamiento combina ampliar el margen con penalizar sus violaciones; C fija el peso relativo de ese castigo.
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
            Problema de <G k="margenBlando" after=":">margen blando</G>
          </p>
          <Tex block>
            {'\\begin{gathered} \\min_{w,b,\\xi}\\ \\tfrac12\\lVert w\\rVert^2 + C\\sum_i \\xi_i \\\\ \\text{sujeto a}\\quad y_i(w\\cdot x_i + b) \\ge 1 - \\xi_i \\\\ \\xi_i \\ge 0 \\end{gathered}'}
          </Tex>
          <p>
            Su <G k="dual">forma dual</G> solo usa productos <Tex after=".">{'x_i \\cdot x_j'}</Tex> Cambiarlos por un{' '}
            <G k="kernel">kernel</G> <Tex>{'K(x_i, x_j)'}</Tex> da fronteras curvas sin calcular <G k="feature">features</G> nuevas:
          </p>
          <Tex block>{'K_{\\text{RBF}}(x, z) = e^{-\\gamma \\lVert x - z \\rVert^2}'}</Tex>
          <p>
            El simulador resuelve el dual con <G k="smo" after=",">SMO</G> el mismo método de LIBSVM, la biblioteca que usa{' '}
            <code>SVC</code>; sus configuraciones se contrastan con scikit-learn con tolerancia <code>tol=1e-6</code>. Gamma solo se usa en RBF y puede cambiarse en la OVA. Valores por defecto en
            scikit-learn: <G k="rbf" after=",">kernel RBF</G> C = 1 y <Tex>{'\\gamma'}</Tex> = <code>"scale"</code>.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            No exige separación perfecta: el <G k="margenBlando">margen blando</G> permite violaciones. Necesita datos representativos y una comparación que refleje el uso futuro. <G k="rbf">RBF</G> amplía las formas posibles, pero no garantiza separar correctamente casos nuevos.
          </p>
          <p>
            También supone <b><G k="feature">features</G> en escalas comparables</b>: el margen se mide con distancias, así que una
            feature en millones aplasta a otra entre 0 y 1. Por eso se aplica <G k="escalado">escalado</G> antes.
          </p>
        </>
      ),
      deepDive: (
        <p>
          En el ejercicio, StandardScaler resta la media de cada píxel y divide por su desviación usando solo entrenamiento. El valor <code>gamma="scale"</code> depende de la varianza después de transformar: <code>1 / (n_features * X.var())</code>. Ajustar el escalado antes de separar los datos produce <G k="fugaInformacion">fuga de información</G>.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Eficaz con muchas <G k="feature" after=":">features</G></b> puede clasificar usando muchas columnas, como los 64 píxeles del ejercicio. Hay que comparar su resultado con una línea base y la misma evaluación.
          </li>
          <li>
            <b>Fronteras flexibles:</b> con un <G k="kernel">kernel</G> se adapta a formas curvas.
          </li>
          <li>
            <b>Solo importan unos puntos:</b> la frontera depende solo de los <G k="vectorSoporte" after=".">vectores de soporte</G> Si son pocos, se guardan menos ejemplos para predecir; su cantidad se obtiene al entrenar y puede ser grande.
          </li>
        </ul>
      ),
      deepDive: (
        <>
          <p>El problema de optimización es <G k="convexo">convexo</G>: no tiene mínimos locales peores que el global. El <G k="solver">solver</G> obtiene una aproximación según su tolerancia y su límite de trabajo.</p>
          <p>El término de margen actúa como <G k="regularizacion">regularización</G>. Compara C y gamma con validación para revisar el <G k="overfitting">sobreajuste</G>; una frontera muy local por sí sola no decide si el modelo generaliza.</p>
        </>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Lento con muchos datos:</b> el SVC con <G k="kernel">kernels</G> puede crecer rápidamente en tiempo y memoria al aumentar las filas. Mídelo en tu equipo; no hay un multiplicador exacto universal.
          </li>
          <li>
            <b>
              Sensible a C y <G k="gamma" after=":">γ</G>
            </b>{' '}
            la combinación modifica la frontera: prueba valores espaciados por órdenes de magnitud con validación. El acierto en entrenamiento por sí solo no decide.
          </li>
          <li>
            <b>Sin probabilidades directas:</b> entrega un puntaje con signo (con kernel lineal, proporcional a la
            distancia a la frontera), no una probabilidad.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          scikit-learn advierte que <code>SVC</code> se vuelve poco práctico por encima de decenas de miles de filas.
          Para probabilidades, usa una estrategia de <G k="calibracion">calibración</G> con datos adecuados, por ejemplo <code>CalibratedClassifierCV</code>. Ese ajuste añade entrenamiento y debe mantenerse separado de la prueba final. C y gamma se eligen juntos con <G k="validacionCruzada">validación cruzada</G> o con un conjunto de validación.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">Si entrenar SVC con kernel supera tu presupuesto de tiempo o memoria, compara primero una alternativa lineal.</p>
          <p>
            Ejemplo: clasificar millones de transacciones. Compara el costo de un <G k="rbf">SVC con RBF</G> con <code>LinearSVC</code>, un modelo entrenado por lotes o un <G k="ensamble">ensamble</G> de árboles; mide el costo y el resultado con tus datos.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Si necesitas probabilidades, evalúa su <G k="calibracion">calibración</G>, no solo el acierto. Con solapamiento y ruido puede aumentar la cantidad de <G k="vectorSoporte">vectores de soporte</G> y el costo de predecir. Elegir C y γ con{' '}
          <G k="validacionCruzada">validación cruzada</G> (ver Contras) multiplica el tiempo por pliegues ×
          combinaciones.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Reconocimiento de dígitos.</b> El ejercicio usa imágenes pequeñas ya convertidas en 64 valores numéricos. Ilustra una clasificación multiclase; la OVA usa dos clases y dos coordenadas para que la frontera pueda dibujarse.
          </p>
          <p>
            Separa las 1 797 imágenes en entrenamiento, validación y prueba final. Compara <G k="kernel">kernel</G> lineal y <G k="rbf">RBF</G>, tres valores de C y, solo en RBF, tres opciones de gamma. Elige usando validación y calcula el resultado final en prueba una sola vez. El <G k="escalado">escalado</G> con StandardScaler se ajusta dentro de cada modelo con entrenamiento; la prueba no decide los ajustes.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Puedes ampliar la búsqueda o usar <G k="validacionCruzada">validación cruzada</G> cuando una sola partición sea inestable. Una mejora pequeña en validación no garantiza repetirse con otras imágenes. Si hay varias imágenes de la misma persona, respeta ese grupo al evaluar personas nuevas.
          Referencias: <a href="https://scikit-learn.org/stable/modules/generated/sklearn.svm.SVC.html" target="_blank" rel="noreferrer">ajustes de SVC</a>, <a href="https://scikit-learn.org/stable/auto_examples/svm/plot_rbf_parameters.html" target="_blank" rel="noreferrer">efecto conjunto de C y gamma</a> y <a href="https://scikit-learn.org/stable/modules/svm.html#tips-on-practical-use" target="_blank" rel="noreferrer">escalado y uso práctico</a>.
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
