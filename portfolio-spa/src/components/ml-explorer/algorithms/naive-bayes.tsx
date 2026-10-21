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
    assumptions: 'Features independientes dada la clase',
    pros: 'Rápido y simple',
    cons: 'Supuesto de independencia muy fuerte',
    whenNot: 'El sentido depende del orden o del contexto',
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
            Es un clasificador <b>probabilístico</b>. En la variante de texto de este ejemplo, cuenta con qué frecuencia aparece cada palabra (sus <G k="feature" after=")">features</G> en
            cada clase y con esas cuentas calcula la probabilidad de cada clase para un texto nuevo.
          </p>
          <p>En este ejemplo usamos <code>MultinomialNB</code> con conteos de palabras. Las <G k="variantesNB">otras variantes de Naive Bayes</G> usan datos y ajustes distintos.</p>
          <h4>Qué puedes ajustar</h4>
          <p>Los <G k="hiperparametro">hiperparámetros</G> configuran el aprendizaje; el modelo calcula después las probabilidades de las palabras a partir de las reseñas.</p>
          <ul>
            <li><b>Suavizado — <code>alpha</code>:</b> el <G k="suavizadoAditivo">suavizado aditivo</G> suma una cantidad a cada conteo para evitar probabilidades cero. Un valor mayor reduce el peso relativo de las diferencias entre conteos; no garantiza mejores predicciones. La OVA permite comparar de 0.1 a 5.</li>
            <li><b>Probabilidad inicial — <code>fit_prior</code> y <code>class_prior</code>:</b> el <G k="priorVerosimilitud">prior</G> es el punto de partida antes de leer palabras. Con <code>fit_prior=True</code> se estima de la proporción de clases; con <code>False</code>, y sin un prior explícito, se reparte por igual. <code>class_prior</code> permite fijarlo y tiene prioridad sobre esa estimación.</li>
            <li><b>Cómo representas el texto — <code>ngram_range</code>:</b> es un ajuste de <code>CountVectorizer</code>, el paso que convierte texto en conteos. <code>(1, 1)</code> usa palabras individuales; <code>(1, 2)</code> añade <G k="ngrama" after=",">pares de palabras</G> como «no funciona». En la OVA se mantiene <code>(1, 1)</code>.</li>
          </ul>
          <p>Con las 8 reseñas positivas y 8 negativas, estimar el prior o repartirlo por igual da 50 % por clase. El control de la OVA fija otro prior explícito para que veas su efecto; no añade ni quita reseñas.</p>
          <p><G k="parametroAprendido">Lo aprendido</G> son las probabilidades de cada palabra por clase. Escribir otra reseña cambia el caso a predecir; la vista 2D/3D y el recorrido solo cambian la explicación visual.</p>
          <p className="mlx-rule">Primero compara <code>alpha</code> y la representación del texto con <G k="datosValidacion" after=".">datos de validación</G> Una probabilidad más alta para una frase no demuestra que el modelo sea mejor.</p>
        </>
      ),
      deepDive: (
        <p>
          Es un <G k="generativo" after=":">modelo generativo</G> modela cómo se generan los datos de cada clase, <Tex after=",">{'P(x \\mid y)'}</Tex> y
          usa el <G k="bayes">teorema de Bayes</G> para invertirlo. Hay <G k="variantesNB">variantes</G> según el tipo de feature: <code>MultinomialNB</code>{' '}
          (conteos de palabras), <code>BernoulliNB</code> (presencia sí/no) y <code>GaussianNB</code> (números
          continuos). <code>GaussianNB</code> usa <code>var_smoothing</code>, no <code>alpha</code>; <code>binarize</code> pertenece a <code>BernoulliNB</code>.
          Consulta la documentación de <a href="https://scikit-learn.org/1.6/modules/generated/sklearn.naive_bayes.MultinomialNB.html" target="_blank" rel="noopener noreferrer">MultinomialNB</a> y <a href="https://scikit-learn.org/1.6/modules/generated/sklearn.feature_extraction.text.CountVectorizer.html" target="_blank" rel="noopener noreferrer">CountVectorizer</a> para la versión 1.6 del ejercicio.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>Prueba <code>MultinomialNB</code> como <G k="lineaBase">línea base</G> para <b>clasificar textos representados con conteos de palabras</b>. Su entrenamiento es sencillo; el tiempo real depende del volumen y del equipo.</p>
          <ul>
            <li><b>Spam:</b> entra el texto de un correo; sale una categoría como spam o normal.</li>
            <li><b>Tickets de soporte:</b> entra la descripción; sale una categoría aprendida, como facturación o acceso. Necesita tickets ya clasificados para entrenar.</li>
            <li><b>Reseñas:</b> entra un comentario; sale positiva o negativa. Si la negación o la ironía deciden el sentido, contar palabras puede quedarse corto.</li>
          </ul>
          <p><b>Preparación:</b> aprende el <G k="vocabulario">vocabulario</G> solo con los textos de entrenamiento y usa esa misma transformación para evaluar. Los conteos deben ser no negativos; no los centres restándoles la media.</p>
          <p><b>Compara:</b> regresión logística y una SVM lineal usando la misma representación. Revisa los errores por clase: cuántos correos normales marcas como spam y cuántos spam se escapan. Con <G k="desbalance" after=",">clases desbalanceadas</G> incluye <code>ComplementNB</code> como candidato.</p>
          <p className="mlx-rule">Elige el modelo que cumpla tu objetivo con textos nuevos y un costo aceptable. Las 16 reseñas de la OVA ilustran el cálculo; no demuestran su rendimiento en un proyecto real.</p>
        </>
      ),
      deepDive: (
        <>
          <p>Admite <G k="incremental">entrenamiento por partes</G> mediante <code>partial_fit</code>, útil cuando llegan textos nuevos. Mantén fija la correspondencia entre columnas y palabras.</p>
          <p>Para elegir <G k="hiperparametro" after=",">hiperparámetros</G> combina el vectorizador y el clasificador dentro de cada partición de <G k="validacionCruzada" after=".">validación cruzada</G> Así el vocabulario de la evaluación no participa en el entrenamiento.</p>
        </>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo con <code>alpha=1</code> y prior positivo de 50 %:</b> llega la reseña «excelente calidad llegó rápido». Antes de leerla, positiva y negativa
            están empatadas <G before="(" k="odds">odds</G> 1, porque hay 8 reseñas de cada una). Cada palabra multiplica esos odds por un
            factor: «excelente» ×5.27, «calidad» ×1.05, «llegó» ×0.70, «rápido» ×3.16. Es decir,
            1 × 5.27 × 1.05 × 0.70 × 3.16 ≈ 12.3 (con más decimales, 12.34). Al final los odds son 12.34 a 1:
            el modelo estima 93 % de probabilidad positiva. Esa cifra no mide el porcentaje de aciertos del modelo.
          </p>
          <p>
            Ese es el <G k="bayes">teorema de Bayes</G> con el supuesto «ingenuo» de que cada palabra aporta su evidencia por
            separado:
          </p>
          <Tex block>{'\\begin{aligned} P(\\text{pos} \\mid \\text{texto}) \\;&\\propto\\; P(\\text{pos}) \\\\ &\\quad \\cdot \\prod_{w \\in \\text{texto}} P(w \\mid \\text{pos}) \\end{aligned}'}</Tex>
          <p>
            <Tex>{'P(\\text{pos})'}</Tex> es el <G k="priorVerosimilitud">prior</G> (qué fracción de reseñas es
            positiva) y <Tex>{'P(w \\mid \\text{pos})'}</Tex> la <G k="priorVerosimilitud">verosimilitud</G> de cada
            palabra: qué tan frecuente es dentro de las reseñas positivas. Escribe tus frases en la OVA de «Tipo». Allí puedes cambiar alpha y el prior; las cifras de este ejemplo corresponden a los ajustes iniciales.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Con <G k="suavizadoLaplace">suavizado de Laplace</G> (<Tex after=",">{'\\alpha = 1'}</Tex> en este ejercicio):
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
            evidencias separadas. Con palabras individuales tampoco ve el orden: con los ajustes iniciales, escribe «no me encantó» en el simulador y sale 68 % positiva,
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
            <b>Un punto de partida con pocos ejemplos:</b> permite construir una primera comparación sin una red grande. El ejercicio de 16 reseñas ilustra su funcionamiento; la utilidad se mide con más textos independientes.
          </li>
          <li>
            <b>Fácil de explicar:</b> cada palabra tiene un factor que dice hacia dónde empuja y cuánto.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Escala a vocabularios de cientos de miles de palabras porque solo guarda un conteo por palabra y clase.
          Los <G k="hiperparametro">hiperparámetros</G> del clasificador son pocos, pero la representación del texto también influye. Revisa alpha, el prior y qué palabras o pares de palabras se cuentan.
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
            <b>Probabilidades que pueden ser demasiado extremas:</b> como cuenta por separado palabras que van juntas (la misma evidencia, dos
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
          <G k="calibracion" after=";">evalúa su calibración</G> puedes comparar <code>CalibratedClassifierCV</code> y regresión logística. Ninguna alternativa garantiza probabilidades confiables sin evaluarlas. Con <G k="feature">features</G> continuas
          muy correlacionadas, <code>GaussianNB</code> cuenta la misma información varias veces.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">Si el orden o las combinaciones de palabras deciden el sentido, compara otras representaciones y modelos antes de elegirlo. Las <G k="feature">features</G> <G k="correlacion">correlacionadas</G> pueden repetir evidencia, pero no lo descartan por sí solas.</p>
          <p>
            Con los ajustes iniciales, «no fue nada excelente» sale 53 % positiva. El modelo ve «excelente», pero no entiende que «no…
            nada» la niega: el sentido depende de cómo se combinan las palabras. Con negaciones, ironía o sarcasmo
            falla seguido.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Compara regresión logística o una SVM lineal sobre las mismas palabras. Si necesitas más contexto, considera <G k="transformer" after=".">modelos de lenguaje (Transformer)</G> Evalúa también su costo y sus errores.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Filtros de spam y clasificación de reseñas.</b> El ejercicio convierte cada texto en conteos y entrena <code>MultinomialNB</code>. Los ejemplos permiten seguir qué palabras favorecen cada clase; no son una evaluación de un filtro de producción.
          </p>
          <p>
            El ejercicio entrena <code>MultinomialNB</code> con 16 reseñas cortas (8 y 8, <G k="priorVerosimilitud">prior</G> 0.50). «excelente
            calidad llegó rápido» sale 93 % positiva y «no funciona mala compra», 5 %. «llegó la batería nueva»
            sale 28 %: «llegó» y «la» aparecieron más en reseñas negativas, y «nueva» no estaba en el vocabulario,
            así que se ignora.
          </p>
          <p>Al final del código puedes comparar alpha y un prior explícito, igual que en la OVA. <code>ALPHA=1.0</code>, <code>CLASS_PRIOR=None</code> y <code>NGRAM_RANGE=(1, 1)</code> reproducen los ajustes iniciales. La probabilidad de una frase no es una medida de acierto; para evaluar necesitas textos separados.</p>
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
  ovaTab: 'type',
  autoPlayOva: true,
  python: { code, expectedOutput, colabNotebook: 'naive-bayes' },
  inYourField: [
    { area: 'Sistemas', example: 'clasificar los tickets de soporte por categoría a partir del texto que escribe el usuario.' },
    { area: 'Industrial', example: 'clasificar reportes de incidentes en tipos de riesgo ya definidos, usando su descripción y ejemplos etiquetados.' },
    { area: 'Civil', example: 'enviar cada queja ciudadana sobre vías, alumbrado o acueducto a la dependencia correcta.' },
  ],
  alternatives: ['logistic-regression', 'svm', 'transformer'],
};

export default naiveBayes;
