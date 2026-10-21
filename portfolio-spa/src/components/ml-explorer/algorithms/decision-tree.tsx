import { G } from '../Gloss';
import { Tex } from '../Tex';
import { DecisionTreeOva } from '../ovas/DecisionTreeOva';
import type { AlgorithmModule } from '../types';
import code from './python/decision-tree.py?raw';
import expectedOutput from './python/decision-tree.out.txt?raw';

const decisionTree: AlgorithmModule = {
  slug: 'decision-tree',
  row: {
    type: 'Supervisado',
    bestUse: 'Clasificación y regresión',
    formula: 'División binaria recursiva',
    assumptions: 'Ninguno',
    pros: 'Fácil de interpretar',
    cons: 'Sobreajuste, inestable',
    whenNot: 'Datos ruidosos o complejos',
    realWorld: 'Predicción de impago de préstamos',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>Supervisado:</b> aprende de clientes pasados de los que ya se sabe si pagaron o no.
          </p>
          <p>
            Sirve para <b>clasificar</b> (paga / no paga) y también para <b>predecir números</b> (cuántos días tardará
            en pagar). En el segundo caso cada hoja devuelve un promedio en vez de una clase.
          </p>
          <h4>Qué ajustas y qué aprende el árbol</h4>
          <p>Los <G k="hiperparametro">hiperparámetros</G> fijan cómo puede crecer. El modelo aprende las preguntas, los <G k="corteArbol">valores de corte</G> y la respuesta de cada <G k="estructuraArbol">hoja</G> a partir de los ejemplos.</p>
          <ul>
            <li><b>Profundidad máxima — <code>max_depth</code>:</b> limita las preguntas que atraviesa un caso. Permitir más niveles puede captar detalles útiles y también ruido; no obliga al árbol a alcanzar el límite.</li>
            <li><b>Mínimo antes de dividir — <code>min_samples_split</code>:</b> exige suficientes ejemplos en el grupo que se quiere partir. Con 10, un grupo de 9 no se divide, pero uno de 10 podría quedar en 1 y 9 si ninguna otra restricción lo impide.</li>
            <li><b>Mínimo por hoja — <code>min_samples_leaf</code>:</b> exige un <G k="minimoHoja">mínimo en ambos grupos resultantes</G>. Con 4, un corte en 1 y 9 no se permite. Subirlo evita grupos diminutos, aunque puede simplificar demasiado el modelo.</li>
            <li><b>Criterio — <code>criterion</code>:</b> decide cómo comparar los cortes. En clasificación, <G k="gini">Gini</G> y <G k="entropia">entropía</G> miden la mezcla de clases. No son porcentajes de acierto; en regresión se usan criterios de error numérico.</li>
            <li><b>Poda posterior — <code>ccp_alpha</code>:</b> controla cuánto se simplifica el árbol después de crecer. Un valor mayor favorece recortar más ramas. Con 0 no se aplica esta <G k="poda">poda</G>.</li>
          </ul>
          <p>La OVA permite ajustar profundidad y mínimo por hoja. Los demás ajustes quedan fijos y se indican junto a los controles. Elige los valores con <G k="datosValidacion">datos de validación</G>; más acierto en entrenamiento no garantiza mejores predicciones nuevas.</p>
        </>
      ),
      deepDive: (
        <p>
          Algoritmo CART: parte el espacio de <G k="feature">features</G> en rectángulos alineados con los ejes y asigna a cada uno la
          clase mayoritaria (o la media, en regresión). Su estructura se adapta a los datos dentro de los límites elegidos. Consulta los <a href="https://scikit-learn.org/stable/modules/generated/sklearn.tree.DecisionTreeClassifier.html" target="_blank" rel="noreferrer">ajustes de DecisionTreeClassifier</a> y la <a href="https://scikit-learn.org/stable/modules/tree.html" target="_blank" rel="noreferrer">guía de árboles de scikit-learn</a>.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>Conviene probarlo con <G k="tabular">datos tabulares</G> cuando necesitas un conjunto pequeño de reglas que una persona pueda revisar. Compara su rendimiento con una <G k="lineaBase">línea base</G> y con regresión logística para clasificación o regresión lineal para cantidades.</p>
          <ul>
            <li>Clasificar solicitudes por área según campos conocidos al recibirlas.</li>
            <li>Detectar fallas con combinaciones de temperatura, vibración y horas de uso.</li>
            <li>Explorar reglas de riesgo con datos de ejemplo, revisando su estabilidad y sus errores antes de usarlas.</li>
          </ul>
          <p>Empieza limitando <code>max_depth</code> o aumentando <code>min_samples_leaf</code> para mantener las reglas manejables. Compara candidatos con las mismas particiones y una medida acorde con el costo de los errores.</p>
          <p className="mlx-rule">Un árbol pequeño puede ser fácil de leer. Sus reglas describen asociaciones aprendidas; no demuestran causas ni garantizan decisiones apropiadas.</p>
        </>
      ),
      deepDive: (
        <p>
          No necesita escalar las <G k="feature" after=".">features</G> scikit-learn exige representar las categorías con números. Para categorías sin orden, considera columnas indicadoras (OneHotEncoder); asignar números de orden puede imponer cortes artificiales. El árbol es también una pieza de Random Forest y Gradient Boosting, candidatos habituales para <G k="tabular" after=".">datos tabulares</G>
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            El árbol juega a las <b>veinte preguntas</b>: en cada paso elige la pregunta de sí o no que mejor separa
            las clases.
          </p>
          <p>
            <b>Ejemplo:</b> 10 clientes, 5 pagan y 5 no. Qué tan mezclado está el grupo se mide con la{' '}
            <G k="gini" after=":">impureza de Gini</G>
          </p>
          <Tex block>{'\\begin{aligned} G &= 1 - p_{\\text{paga}}^2 - p_{\\text{impago}}^2 \\\\ &= 1 - 0.5^2 - 0.5^2 = 0.5 \\end{aligned}'}</Tex>
          <p>
            Con la deuda en una escala de 0 a 10, como en el simulador, la pregunta «¿deuda ≤ 5?» deja a un lado 4
            que pagan y 1 que no (G = 1 − 0.8² − 0.2² = 0.32), y al otro 1 que paga y 4 que no (también 0.32). La impureza baja de 0.5 a 0.32. El árbol compara cortes entre valores observados que cumplan los mínimos de ejemplos, se queda con el que más la baja y repite en cada lado: eso es la{' '}
            <b>división binaria recursiva</b>.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>En cada nodo se elige la <G k="feature">feature</G> j y el <G k="corteArbol">valor de corte</G> t que minimizan la impureza ponderada de los hijos:</p>
          <Tex block>{'\\min_{j,\\,t}\\ \\frac{n_L}{n}\\,G(L) + \\frac{n_R}{n}\\,G(R)'}</Tex>
          <p>
            Es un algoritmo voraz: elige el mejor corte del momento sin mirar adelante, así que no garantiza el mejor
            árbol posible. En regresión, el criterio habitual compara errores cuadrados en vez de mezcla de clases. Los límites de crecimiento restringen qué cortes se permiten; <code>criterion</code> decide cómo compararlos.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            <b>Ninguno fuerte.</b> No supone rectas ni distribuciones, y no necesita que las <G k="feature">features</G> estén en la
            misma escala: solo pregunta «¿x ≤ <G k="corteArbol" after="?».">valor de corte</G>
          </p>
          <p>Aun así, necesita ejemplos representativos y variables disponibles al predecir. Si aprende atajos o casos excepcionales, puede fallar con datos nuevos.</p>
        </>
      ),
      deepDive: (
        <p>
          Implícitamente supone que la frontera se puede aproximar con cortes paralelos a los ejes. Una frontera
          diagonal (por ejemplo, x &gt; y) necesita muchos escalones para aproximarse.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Fácil de interpretar:</b> el modelo <em>es</em> la lista de reglas; se puede imprimir y discutir con el
            equipo.
          </li>
          <li>
            <b>Poca preparación de datos:</b> no hace falta escalar las <G k="feature">features</G> (en scikit-learn las categóricas sí
            hay que codificarlas como números).
          </li>
          <li>
            <b>Encuentra interacciones solo:</b> «deuda alta <em>y</em> ingreso bajo» aparece como dos preguntas
            seguidas.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Predice muy rápido (recorre unas pocas preguntas) y da una medida de importancia de cada feature: cuánta
          impureza quitó en total. Ojo: esa medida favorece a las features con muchos valores distintos; para
          decisiones importantes, compárala con la importancia por permutación.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>
              <G k="overfitting" after=":">Sobreajuste</G>
            </b>{' '}
            permitir muchas hojas puede ajustar excepciones del entrenamiento. Limitar profundidad, exigir más ejemplos por hoja o podar puede reducir ese riesgo; compruébalo con validación.
          </li>
          <li>
            <b>Inestable:</b> cambiar unos pocos datos puede cambiar la primera pregunta y, con ella, todo el árbol.
          </li>
          <li>
            <b>Fronteras en escalones:</b> le cuesta representar relaciones suaves o diagonales.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Esa inestabilidad (alta varianza) es justo lo que corrigen los <G k="ensamble" after=":">ensambles</G> Random Forest
          promedia muchos árboles (100 por defecto en scikit-learn), cada uno entrenado con una muestra distinta de los
          datos y con un subconjunto al azar de <G k="feature">features</G> en cada corte (en clasificación).
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo elijas solo por lo fáciles que parecen sus reglas. Si necesita cientos de hojas o falla con datos nuevos, compara otras opciones.</p>
          <p>Cuando las relaciones son suaves o diagonales, prueba un modelo lineal o una SVM según el problema. Para patrones <G k="tabular">tabulares</G> más complejos, compara Random Forest y Gradient Boosting. Evalúa el costo de perder legibilidad frente a la mejora observada.</p>
        </>
      ),
      deepDive: (
        <p>No hay una profundidad universal de 3 o 5 a partir de la cual debas abandonar un árbol. Compara límites y mínimos por hoja con <G k="validacionCruzada">validación cruzada</G>, y reserva la prueba final hasta terminar de elegir.</p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p><b>Ejemplo educativo de impago de préstamos.</b> Generamos 500 clientes simulados con ingreso, deuda y atrasos. Un 12 % de las etiquetas se invierte al azar para mostrar cómo los límites de crecimiento afectan al aprendizaje.</p>
          <p>El ejercicio separa entrenamiento, validación y prueba. Compara combinaciones de <code>max_depth</code> y <code>min_samples_leaf</code> con validación; evalúa una sola configuración elegida en la prueba final. <code>criterion='gini'</code>, <code>min_samples_split=2</code> y <code>ccp_alpha=0</code> quedan explícitos en Python.</p>
          <p>Lee las reglas y compara hojas y acierto: un corte puede reducir la mezcla de clases sin cambiar la predicción mayoritaria. Una hoja pequeña merece revisión; su tamaño por sí solo no demuestra que sea ruido.</p>
          <p>La OVA usa 28 clientes y dos variables en escala 0–10; Python usa 500 clientes y tres variables con otras unidades. Comparten los ajustes, pero sus árboles y porcentajes no tienen por qué coincidir.</p>
        </>
      ),
      deepDive: (
        <p>
          En una aplicación se limita la profundidad o se aumenta el mínimo de clientes por hoja, se valida con <G k="validacionCruzada">validación
          cruzada</G> y se revisan las reglas con expertos del negocio: a veces el árbol encuentra un atajo que no es
          legal usar, como una variable que delata el barrio o el género.
        </p>
      ),
    },
  },
  Ova: DecisionTreeOva,
  ovaTab: 'type',
  autoPlayOva: true,
  python: { code, expectedOutput, colabNotebook: 'decision-tree' },
  inYourField: [
    { area: 'Mecánica', example: 'reglas de falla inminente a partir de vibración, temperatura y horas de uso.' },
    { area: 'Ambiental', example: 'clasificar la calidad del agua según pH, turbidez y oxígeno disuelto.' },
    { area: 'Industrial', example: 'decidir si un lote pasa control de calidad según sus mediciones.' },
  ],
  alternatives: ['random-forest', 'gradient-boosting', 'logistic-regression'],
};

export default decisionTree;
