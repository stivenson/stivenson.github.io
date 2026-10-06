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
        </>
      ),
      deepDive: (
        <p>
          Algoritmo CART: parte el espacio de <G k="feature">features</G> en rectángulos alineados con los ejes y asigna a cada uno la
          clase mayoritaria (o la media, en regresión). Es no paramétrico: su tamaño crece con los datos.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo cuando necesitas <b>reglas que una persona pueda leer y auditar</b>, tanto para clasificar como para
            predecir números.
          </p>
          <ul>
            <li>Aprobación de créditos con reglas explicables.</li>
            <li>Triaje: ¿a qué área se envía una solicitud?</li>
            <li>Diagnóstico de fallas: «si la vibración supera X y la temperatura supera Y…».</li>
          </ul>
          <p className="mlx-rule">Un árbol pequeño es el modelo más fácil de explicar a alguien que no sabe de ML.</p>
        </>
      ),
      deepDive: (
        <p>
          No necesita escalar las <G k="feature" after=".">features</G> CART admite categóricas en teoría, pero scikit-learn exige convertirlas
          antes a números (por ejemplo, con OrdinalEncoder). Además es la pieza básica de Random Forest y Gradient
          Boosting, los modelos que suelen ganar en <G k="tabular" after=".">datos tabulares</G>
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
            que pagan y 1 que no (G = 1 − 0.8² − 0.2² = 0.32), y al otro 1 que paga y 4 que no (también 0.32). La impureza baja de 0.5 a 0.32. El árbol prueba todas las preguntas
            posibles, se queda con la que más la baja y repite en cada lado: eso es la{' '}
            <b>división binaria recursiva</b>.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>En cada nodo se elige la <G k="feature">feature</G> j y el <G k="umbral">umbral</G> t que minimizan la impureza ponderada de los hijos:</p>
          <Tex block>{'\\min_{j,\\,t}\\ \\frac{n_L}{n}\\,G(L) + \\frac{n_R}{n}\\,G(R)'}</Tex>
          <p>
            Es un algoritmo voraz: elige el mejor corte del momento sin mirar adelante, así que no garantiza el mejor
            árbol posible. Entrenar cuesta del orden de <Tex>{'O(p\\, n \\log n)'}</Tex> por nivel. En regresión se usa
            la varianza en lugar de Gini. <G k="hiperparametro">Hiperparámetros</G> clave: <code>max_depth</code>,{' '}
            <code>min_samples_leaf</code> y la poda por costo-complejidad (<code>ccp_alpha</code>).
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            <b>Ninguno fuerte.</b> No supone rectas ni distribuciones, y no necesita que las <G k="feature">features</G> estén en la
            misma escala: solo pregunta «¿x ≤ <G k="umbral" after="?».">umbral</G>
          </p>
          <p>Eso lo hace muy flexible, y también fácil de engañar: si lo dejas crecer, inventa una regla para cada dato raro.</p>
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
            un árbol profundo memoriza. En el ejercicio, con profundidad 15 acierta 99.7 % en entrenamiento pero solo
            70 % con datos nuevos.
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
          <p className="mlx-rule">
            No uses un árbol solo (sin <G k="ensamble" after=")">ensamble</G> cuando los datos son ruidosos o el patrón es complejo y lo que importa
            es acertar.
          </p>
          <p>
            Ahí, o <G k="overfitting" after=",">sobreajusta</G> o queda tan podado que no capta el patrón. Úsalo para explicar y deja la
            predicción a un ensamble.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Regla práctica: si un árbol de profundidad 3 a 5 no da la <G k="exactitud">exactitud</G> que necesitas, no lo hagas más
          profundo; pasa a Random Forest o Gradient Boosting.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Predicción de impago de préstamos.</b> Los bancos deciden rápido y, a menudo por regulación, tienen que
            explicar por qué rechazaron una solicitud. Un árbol entrega esa explicación como reglas.
          </p>
          <p>
            El ejercicio crea 500 clientes de juguete con ingreso, deuda y atrasos, y un 12 % de probabilidad de que
            cada etiqueta se voltee al azar <G before="(" k="ruido" after=").">ruido</G> Lee las reglas del árbol y la tabla final: ¿qué
            pasa con la <G k="exactitud">exactitud</G> en datos nuevos cuando el árbol crece? Fíjate también en dos detalles: «ingreso ≤
            2.50» lleva a «paga» por ambos lados (el corte solo dejó grupos más puros), y la hoja «deuda &gt; 0.88 →
            paga» se apoya en muy pocos clientes: es ruido, no una regla. Para evitarlo se fija{' '}
            <code>min_samples_leaf</code>.
          </p>
        </>
      ),
      deepDive: (
        <p>
          En producción se limita la profundidad o el número mínimo de clientes por hoja, se valida con <G k="validacionCruzada">validación
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
