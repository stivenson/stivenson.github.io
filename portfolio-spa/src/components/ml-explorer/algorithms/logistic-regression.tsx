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
    formula: 'P = 1 / (1 + e⁻ᶻ), con z = b₀ + b₁X + …',
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
          <h4>Qué ajustas y qué aprende el modelo</h4>
          <p>Los <G k="hiperparametro">hiperparámetros</G> configuran el entrenamiento. Los coeficientes y el intercepto son <G k="parametroAprendido" after=":">parámetros aprendidos</G> el modelo los calcula a partir de los ejemplos.</p>
          <ul>
            <li><b>Fuerza de la penalización — <code>C</code>:</b> <G k="fuerzaRegularizacion">C pequeño</G> significa más penalización de coeficientes grandes. Un C mayor deja ajustar más los datos. No hay una dirección que siempre mejore el resultado con casos nuevos.</li>
            <li><b>Tipo de penalización — <code>penalty</code>:</b> <G k="regularizacionL1L2" after=".">L2 encoge los coeficientes; L1 puede dejar algunos en cero</G> La OVA mantiene L2 fija para comparar C sin cambiar el método.</li>
            <li><b>Costo durante el entrenamiento — <code>class_weight</code>:</b> da más peso a los errores de una clase. <code>'balanced'</code> usa pesos inversos a su frecuencia; no añade ejemplos. Puede cambiar tanto los coeficientes como las probabilidades. Aquí se mantiene <code>None</code>.</li>
            <li><b>Método y límite — <code>solver</code>, <code>max_iter</code>, <code>tol</code>:</b> el <G k="solver">solver</G> busca los coeficientes; el límite y la tolerancia controlan cuándo se detiene y si alcanza la <G k="convergencia" after=".">convergencia</G> No todas las penalizaciones son compatibles con todos los métodos. Más iteraciones no garantizan más aciertos.</li>
          </ul>
          <p><b>Después de entrenar:</b> el <G k="umbral">umbral de decisión</G> convierte una probabilidad en «spam» o «normal». Al moverlo no cambian los coeficientes ni las probabilidades. En cambio, modificar C o los pesos de clase requiere volver a entrenar.</p>
          <p className="mlx-rule">En la OVA, cambia C y observa la curva. Luego mantén el ajuste final y mueve el umbral: cambian las decisiones y los tipos de error. Elige ambos con <G k="datosValidacion" after=".">datos de validación</G> Los aciertos del simulador son sobre entrenamiento.</p>
        </>
      ),
      deepDive: (
        <p>
          Es un modelo lineal generalizado: modela <Tex>{'P(y=1 \\mid x)'}</Tex> aplicando la función <G k="sigmoide">sigmoide</G> a una
          combinación lineal de las <G k="feature" after=".">features</G> Con más de dos clases se usa la versión multinomial <G before="(" k="softmax" after=").">softmax</G> En scikit-learn 1.6, L2 con <code>lbfgs</code> es el ajuste inicial; L1 requiere un método compatible como <code>saga</code>. Consulta la <a href="https://scikit-learn.org/1.6/modules/generated/sklearn.linear_model.LogisticRegression.html" target="_blank" rel="noopener noreferrer">API de LogisticRegression</a>. La OVA usa Newton con una variable y el mismo objetivo L2; el ejercicio usa L-BFGS con tres señales.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>Prueba regresión logística como <G k="lineaBase">línea base</G> para <b>clasificar ejemplos con respuesta conocida</b>, cuando una suma de señales puede separar razonablemente las clases. Permite inspeccionar los coeficientes y trabajar con probabilidades estimadas.</p>
          <ul>
            <li><b>Spam:</b> entran señales del texto, enlaces y remitente; sale la probabilidad de spam y una decisión según el umbral elegido.</li>
            <li><b>Abandono:</b> entran datos de uso conocidos antes de la fecha de predicción; sale una probabilidad de cancelación.</li>
            <li><b>Calidad industrial:</b> entran medidas del proceso; sale la probabilidad de que una pieza sea defectuosa.</li>
          </ul>
          <p><b>Preparación:</b> transforma las categorías en columnas numéricas y trata los valores que falten. Revisa el <G k="escalado">escalado</G> de las variables: sus unidades influyen en la penalización. Aprende esas transformaciones solo con entrenamiento.</p>
          <p><b>Compara:</b> para texto, Naive Bayes y SVM lineal; para tablas con relaciones más complejas, árboles y sus <G k="ensamble" after=".">ensambles</G> Usa las mismas particiones y mide los errores que importan en tu tarea.</p>
          <p><b>Verifica:</b> cuántos positivos detectas, cuántas falsas alarmas produces y qué tan bien <G k="calibracion">calibradas</G> están las probabilidades. Un 90 % estimado para un caso no significa 90 % de aciertos del modelo.</p>
          <p className="mlx-rule">Es un buen candidato inicial cuando necesitas clasificar y examinar las señales. Elige C y el umbral con validación; reserva una prueba final para medir la solución elegida.</p>
        </>
      ),
      deepDive: (
        <>
          <p>Con <G k="desbalance" after=",">clases desbalanceadas</G> compara el entrenamiento habitual con <code>class_weight='balanced'</code> o pesos justificados por tu objetivo. Ponderar clases no sustituye evaluar la <G k="calibracion" after=".">calibración</G></p>
          <p>La <a href="https://scikit-learn.org/stable/modules/classification_threshold.html" target="_blank" rel="noopener noreferrer">guía de umbrales</a> distingue estimar probabilidades de tomar decisiones. El <G k="umbral">umbral</G> debe elegirse con datos separados del ajuste de coeficientes; consulta también la <a href="https://scikit-learn.org/stable/modules/calibration.html" target="_blank" rel="noopener noreferrer">guía de calibración</a>.</p>
        </>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo con coeficientes ilustrativos:</b> un correo tiene 4 menciones de «gratis» por 100 palabras. Con b₀ = −4 y b₁ = 1 se calcula primero un puntaje. Estos valores no son los coeficientes iniciales del ajuste de la OVA:
          </p>
          <Tex block>{'z = b_0 + b_1 x = -4 + 1 \\times 4 = 0'}</Tex>
          <p>Después, la <G k="sigmoide">sigmoide</G> convierte cualquier puntaje en una probabilidad entre 0 y 1:</p>
          <Tex block>{'P = \\frac{1}{1 + e^{-z}} = \\frac{1}{1 + e^{0}} = 0.5'}</Tex>
          <p>
            Con z = 0 estima 50 %. Con una frecuencia de 7, z = 3 y P ≈ 0.95. En la regla de la OVA, cuando P llega al{' '}
            <G k="umbral">umbral</G> (0.5 por defecto) o lo supera, el correo se marca como spam.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>Sin escribir aquí el término de penalización, los pesos se eligen minimizando la <G k="perdidaLog">pérdida logarítmica</G> (equivale a maximizar la verosimilitud):</p>
          <Tex block>{'\\begin{aligned} \\min_b\\ -\\frac{1}{n}\\sum_i \\Big[\\, & y_i \\log p_i \\\\ & + (1-y_i)\\log(1-p_i) \\,\\Big] \\end{aligned}'}</Tex>
          <p>
            No hay solución cerrada: se resuelve con <G k="descensoGradiente">descenso de gradiente</G> o con el método de Newton (scikit-learn
            usa por defecto L-BFGS, una variante de Newton que aproxima la curvatura, y le suma una penalización <G k="regularizacionL1L2" after=";">L2</G>{' '}
            ver Supuestos). El <G k="gradiente">gradiente</G> es simple: <Tex after=".">{'\\frac{1}{n}\\sum_i (p_i - y_i)\\,x_i'}</Tex> La OVA de «Tipo» usa Newton y penaliza el coeficiente con <code>1/C</code>. El intercepto no se penaliza. El número de actualizaciones necesario depende del ajuste; los pasos posteriores a la convergencia solo conservan el resultado.
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
            sube rápido en el medio y se frena cerca de 0 y de 1. La forma en S ya permite esa saturación de la probabilidad. El supuesto lineal corresponde al log-odds, no a la probabilidad.
          </p>
          <p>Para evaluar con casos independientes, evita repartir correos de una misma conversación entre entrenamiento y prueba. Las variables casi duplicadas pueden volver inestable la interpretación de los coeficientes.</p>
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
            <b>Ajuste relativamente sencillo:</b> suele ser una comparación práctica antes de modelos más complejos. También puede <G k="overfitting" after=";">sobreajustar</G> revisa la penalización y los resultados con casos nuevos.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Su función de pérdida es convexa: no tiene mínimos locales que atrapen al optimizador y, con la{' '}
          <G k="regularizacionL1L2">regularización L2</G> y ambas clases presentes, el ajuste tiene un óptimo único en esta OVA. Un coeficiente describe una asociación condicionada a las demás variables; no demuestra una causa.
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
          Se puede curvar la frontera creando nuevas columnas, como productos entre variables. Con clases muy desbalanceadas, compara los pesos de clase y el <G k="umbral" after=".">umbral</G> Son decisiones distintas: una modifica el ajuste y la otra las decisiones posteriores.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">Si una suma de las señales disponibles no separa las clases, compara transformaciones y otros modelos.</p>
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
            remitente. La regresión logística hace esa suma y además permite ajustar el <G k="umbral" after=":">umbral</G> el costo de perder un correo importante puede ser distinto del costo de dejar pasar spam; decide según el uso real.
          </p>
          <p>
            El ejercicio crea 400 correos de juguete con tres señales: cuántas veces dice «gratis», cuántos enlaces
            trae y si el remitente es conocido. Mira los pesos (¿qué señal aleja del spam?): un coeficiente b de «gratis» significa que cada mención extra multiplica los <G k="odds">odds</G> de spam por <Tex after=",">{'e^b'}</Tex> manteniendo las otras señales fijas. Revisa también la <G k="matrizConfusion" after=".">matriz de confusión</G>
          </p>
          <p>La OVA usa 18 correos y una frecuencia por 100 palabras; Python usa 400 correos y tres señales. No son los mismos datos ni los mismos coeficientes. El código compara C y umbrales en validación; la prueba final queda aparte.</p>
        </>
      ),
      deepDive: (
        <p>
          En producción el texto se convierte en miles de <G k="feature">features</G> (conteos de palabras o <G k="tfidf" after=")">TF-IDF</G> con <G k="regularizacionL1L2" after=",">regularización L2</G>{' '}
          y el umbral se contrasta con validación según el costo de falsas alarmas y casos que se escapan. 0.5 es una referencia inicial, no una elección universal.
        </p>
      ),
    },
  },
  Ova: LogisticRegressionOva,
  ovaTab: 'type',
  autoPlayOva: true,
  python: { code, expectedOutput, colabNotebook: 'logistic-regression' },
  inYourField: [
    { area: 'Industrial', example: '¿saldrá defectuosa esta pieza según la temperatura y la presión del proceso?' },
    { area: 'Civil', example: 'probabilidad de deslizamiento de un talud según la lluvia acumulada y la pendiente.' },
    { area: 'Biomédica', example: 'riesgo de una enfermedad según edad, presión arterial y glucosa.' },
  ],
  alternatives: ['decision-tree', 'random-forest', 'svm'],
};

export default logisticRegression;
