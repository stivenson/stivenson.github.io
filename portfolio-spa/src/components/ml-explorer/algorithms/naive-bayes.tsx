import { G } from '../Gloss';
import { Tex } from '../Tex';
import { NaiveBayesOva } from '../ovas/NaiveBayesOva';
import type { AlgorithmModule } from '../types';
import code from './python/naive-bayes.py?raw';
import expectedOutput from './python/naive-bayes.out.txt?raw';

const naiveBayes: AlgorithmModule = {
  slug: 'naive-bayes',
  row: {
    type: 'Supervisado',
    bestUse: 'Clasificación de texto',
    formula: 'Teorema de Bayes',
    assumptions: 'Features independientes entre sí',
    pros: 'Rápido y simple',
    cons: 'Supuesto de independencia muy fuerte',
    whenNot: 'Features muy correlacionadas',
    realWorld: 'Filtros de spam y análisis de sentimiento',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>
              <G k="supervisado" after=":">Supervisado</G>
            </b>{' '}
            aprende de ejemplos con respuesta (reseñas marcadas como positivas o negativas).
          </p>
          <p>
            Es un clasificador <b>probabilístico</b>: cuenta con qué frecuencia aparece cada palabra (sus <G k="feature" after=")">features</G> en
            cada clase y con esas cuentas calcula la probabilidad de cada clase para un texto nuevo.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Es un <G k="generativo" after=":">modelo generativo</G> modela cómo se generan los datos de cada clase, <Tex after=",">{'P(x \\mid y)'}</Tex> y
          usa el <G k="bayes">teorema de Bayes</G> para invertirlo. Hay <G k="variantesNB">variantes</G> según el tipo de feature: <code>MultinomialNB</code>{' '}
          (conteos de palabras), <code>BernoulliNB</code> (presencia sí/no) y <code>GaussianNB</code> (números
          continuos).
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo para <b>clasificar texto</b> con pocos datos o cuando necesitas un modelo que entrene en
            milisegundos.
          </p>
          <ul>
            <li>Filtrar spam.</li>
            <li>Clasificar el sentimiento de reseñas o comentarios.</li>
            <li>Enviar tickets de soporte o correos a la categoría correcta.</li>
          </ul>
          <p className="mlx-rule">
            Para texto, es la línea base que hay que superar: si un modelo complejo no le gana claramente, quédate
            con Naive Bayes.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Con <G k="desbalance" after=",">clases desbalanceadas</G> <code>ComplementNB</code> suele funcionar mejor que <code>MultinomialNB</code>.
          Aprende en una sola pasada por los datos y admite <G k="incremental">entrenamiento por partes</G> (<code>partial_fit</code>), útil
          cuando los textos llegan en flujo.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> llega la reseña «excelente calidad llegó rápido». Antes de leerla, positiva y negativa
            están empatadas <G before="(" k="odds">odds</G> 1, porque hay 8 reseñas de cada una). Cada palabra multiplica esos odds por un
            factor: «excelente» ×5.27, «calidad» ×1.05, «llegó» ×0.70, «rápido» ×3.16. Es decir,
            1 × 5.27 × 1.05 × 0.70 × 3.16 ≈ 12.3 (con más decimales, 12.34). Al final los odds son 12.34 a 1:
            probabilidad de 93 % de que sea positiva.
          </p>
          <p>
            Ese es el <G k="bayes">teorema de Bayes</G> con el supuesto «ingenuo» de que cada palabra aporta su evidencia por
            separado:
          </p>
          <Tex block>{'\\begin{aligned} P(\\text{pos} \\mid \\text{texto}) \\;&\\propto\\; P(\\text{pos}) \\\\ &\\quad \\cdot \\prod_{w \\in \\text{texto}} P(w \\mid \\text{pos}) \\end{aligned}'}</Tex>
          <p>
            <Tex>{'P(\\text{pos})'}</Tex> es el <G k="priorVerosimilitud">prior</G> (qué fracción de reseñas es
            positiva) y <Tex>{'P(w \\mid \\text{pos})'}</Tex> la <G k="priorVerosimilitud">verosimilitud</G> de cada
            palabra: qué tan frecuente es dentro de las reseñas positivas. Escribe tus frases en el simulador.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Con <G k="suavizadoLaplace">suavizado de Laplace</G> (<Tex after=",">{'\\alpha = 1'}</Tex> el valor por defecto):
          </p>
          <Tex block>{'P(w \\mid c) = \\frac{\\text{conteo}(w, c) + \\alpha}{\\text{palabras}(c) + \\alpha\\,V}'}</Tex>
          <p>
            <Tex>{'V'}</Tex> es el tamaño del <G k="vocabulario">vocabulario</G> (38 palabras en el ejercicio). Para no multiplicar cientos
            de números pequeños, se suman logaritmos. El factor de cada palabra en el simulador es{' '}
            <Tex after=".">{'P(w \\mid \\text{pos}) / P(w \\mid \\text{neg})'}</Tex>
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que{' '}
            <b>
              <G k="independenciaCondicional" after=".">
                las palabras son independientes entre sí, una vez se sabe la clase
              </G>
            </b>{' '}
            Por eso es «ingenuo».
          </p>
          <p>
            Ejemplo: «no» y «funciona» suelen ir juntas en las reseñas negativas, pero el modelo las cuenta como dos
            evidencias separadas. Tampoco ve el orden: escribe «no me encantó» en el simulador y sale 68 % positiva,
            porque «me» y «encantó» solo aparecieron en reseñas positivas.
          </p>
        </>
      ),
      deepDive: (
        <p>
          El supuesto casi nunca se cumple, y aun así el modelo suele clasificar bien: para elegir la clase basta con
          que el orden de las probabilidades sea correcto, aunque sus valores estén exagerados. Usar pares de palabras{' '}
          <G before="(" k="ngrama" after=",">bigramas</G> <code>ngram_range=(1, 2)</code>) capta algo del orden, como «no funciona».
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Muy rápido:</b> entrenar es contar palabras.
          </li>
          <li>
            <b>Funciona con pocos datos:</b> el ejercicio aprende de solo 16 reseñas y clasifica bien frases
            nuevas.
          </li>
          <li>
            <b>Fácil de explicar:</b> cada palabra tiene un factor que dice hacia dónde empuja y cuánto.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Escala a vocabularios de cientos de miles de palabras porque solo guarda un conteo por palabra y clase.
          Tiene muy pocos <G k="hiperparametro">hiperparámetros</G> (básicamente <Tex after="),">{'\\alpha'}</Tex> así que
          es difícil equivocarse al configurarlo.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Supuesto de independencia muy fuerte:</b> no capta combinaciones de palabras ni el orden.
          </li>
          <li>
            <b>Probabilidades exageradas:</b> como cuenta por separado palabras que van juntas (la misma evidencia, dos
            veces), tiende a dar
            probabilidades demasiado cerca de 0 o de 1.
          </li>
          <li>
            <b>Ignora lo desconocido:</b> una palabra que no vio al entrenar no cuenta, aunque sea clave.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Si necesitas probabilidades confiables (por ejemplo, para fijar un <G k="umbral">umbral</G> de riesgo),{' '}
          <G k="calibracion">calíbralas</G> con <code>CalibratedClassifierCV</code> o usa regresión logística. Con <G k="feature">features</G> continuas
          muy correlacionadas, <code>GaussianNB</code> cuenta la misma información varias veces.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses cuando las <G k="feature">features</G> están <G k="correlacion">muy correlacionadas</G> o el orden
            importa.</p>
          <p>
            Ejemplo: «no fue nada excelente» sale 53 % positiva. El modelo ve «excelente», pero no entiende que «no…
            nada» la niega: el sentido depende de cómo se combinan las palabras. Con negaciones, ironía o sarcasmo
            falla seguido.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Con datos abundantes, una regresión logística o una SVM lineal sobre las mismas palabras suelen acertar
          más. Para captar el sentido de frases completas se usan <G k="transformer" after=".">modelos de lenguaje (Transformer)</G>
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Filtros de spam y sentimiento.</b> Los filtros bayesianos de spam, que se popularizaron hacia 2002 (Paul Graham, «Un plan contra el
            spam»), calculaban,
            palabra por palabra, qué tan típica era de spam o de correo normal: la misma idea de este algoritmo.
          </p>
          <p>
            El ejercicio entrena <code>MultinomialNB</code> con 16 reseñas cortas (8 y 8, <G k="priorVerosimilitud">prior</G> 0.50). «excelente
            calidad llegó rápido» sale 93 % positiva y «no funciona mala compra», 5 %. «llegó la batería nueva»
            sale 28 %: «llegó» y «la» aparecieron más en reseñas negativas, y «nueva» no estaba en el vocabulario,
            así que se ignora.
          </p>
        </>
      ),
      deepDive: (
        <p>
          «batería» apareció una vez en cada clase y aun así multiplica por 1.05, no por 1: las reseñas positivas
          tienen menos palabras en total (36 contra 40), así que una aparición pesa un poco más en ellas. Con 16
          reseñas estos detalles mueven mucho el resultado; en la práctica se entrena con miles.
        </p>
      ),
    },
  },
  Ova: NaiveBayesOva,
  python: { code, expectedOutput, colabNotebook: 'naive-bayes' },
  inYourField: [
    { area: 'Sistemas', example: 'clasificar los tickets de soporte por categoría a partir del texto que escribe el usuario.' },
    { area: 'Industrial', example: 'agrupar reportes de incidentes de seguridad por tipo de riesgo según su descripción.' },
    { area: 'Civil', example: 'enviar cada queja ciudadana sobre vías, alumbrado o acueducto a la dependencia correcta.' },
  ],
  alternatives: ['logistic-regression', 'svm', 'transformer'],
};

export default naiveBayes;
