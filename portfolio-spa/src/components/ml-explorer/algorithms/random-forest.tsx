import { G } from '../Gloss';
import { Tex } from '../Tex';
import { RandomForestOva } from '../ovas/RandomForestOva';
import type { AlgorithmModule } from '../types';
import code from './python/random-forest.py?raw';
import expectedOutput from './python/random-forest.out.txt?raw';

const randomForest: AlgorithmModule = {
  slug: 'random-forest',
  row: {
    type: 'Supervisado',
    bestUse: 'Tareas donde importa la exactitud',
    formula: 'Bagging de árboles de decisión',
    assumptions: 'Poca correlación entre los árboles',
    pros: 'Reduce el sobreajuste',
    cons: 'Más lento, menos interpretable',
    whenNot: 'Predicciones en tiempo real muy exigentes',
    realWorld: 'Detección de fraude',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b><G k="supervisado" after=":">Supervisado</G></b> aprende de ejemplos que ya traen la respuesta (compras marcadas como fraude o no).
          </p>
          <p>
            Es un <G k="ensamble" after=":">ensamble</G> <b>entrena muchos árboles de decisión distintos y los pone a votar</b>.
            Cada árbol por separado se equivoca bastante; la mayoría de votos, mucho menos, siempre que los árboles no se equivoquen en los mismos casos (ver Supuestos).
          </p>
          <p>
            Sirve para clasificar (los árboles votan) y para predecir números (se promedian sus respuestas). El
            simulador y el ejercicio clasifican.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Combina dos fuentes de azar: <G k="bagging">bagging</G> (cada árbol ve una <G k="bootstrap" after=")">muestra bootstrap</G> y <G k="feature">features</G> al azar en cada corte. Fue propuesto por Leo Breiman en 2001.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo cuando tienes <b>datos en tabla</b> (filas y columnas) y lo que importa es <b>acertar</b> más que
            explicar cada decisión.
          </p>
          <ul>
            <li>Detectar fraude o compras sospechosas.</li>
            <li>Predecir qué clientes se van a ir (abandono).</li>
            <li>Mantenimiento predictivo: qué máquina fallará pronto según sus sensores.</li>
          </ul>
          <p className="mlx-rule">
            Si un árbol solo se queda corto, un bosque es el siguiente paso natural: pide poco ajuste y rara vez
            sale mal.
          </p>
        </>
      ),
      deepDive: (
        <>
        <p>
          Funciona bien «de fábrica»: con los valores por defecto de scikit-learn (100 árboles, sin límite de
          profundidad) suele quedar cerca de su mejor resultado. No necesita <G k="escalado">escalar</G> las <G k="feature" after=".">features</G>
        </p>
        <p>
          Con{' '}
          <code>oob_score=True</code> <G before="(" k="oob" after=")">OOB</G> estima su <G k="exactitud">exactitud</G> con las filas que cada árbol no vio (las que quedaron fuera de su <G k="bootstrap" after=",">muestra bootstrap</G> cerca de un tercio), sin apartar un
          conjunto de prueba.
        </p>
        </>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> un bosque de 5 árboles revisa una compra. Tres dicen «fraude» y dos dicen «normal».
            Gana «fraude», 3 votos contra 2, y la probabilidad estimada es 3/5 = 60 % (scikit-learn promedia las probabilidades de los árboles; con árboles profundos da casi lo mismo, ver Fórmula › A fondo).
          </p>
          <p>Para que los árboles no sean copias, cada uno se entrena distinto:</p>
          <ol>
            <li>
              Con una <G k="bootstrap" after=":">muestra bootstrap</G> se sacan al azar tantas filas como hay, con
              reposición. Algunas se repiten y otras quedan fuera.
            </li>
            <li>En cada corte, el árbol solo puede elegir entre unas pocas <G k="feature">features</G> sorteadas.</li>
          </ol>
          <Tex block>{'\\hat{y}(x) = \\text{mayoría}\\{\\,h_1(x),\\ \\dots,\\ h_B(x)\\,\\}'}</Tex>
          <p>
            <Tex>{'h_b'}</Tex> es el árbol número <Tex>{'b'}</Tex> y <Tex>{'B'}</Tex> el número de árboles. Mueve
            el simulador de 1 a 100 árboles: con los mismos datos del árbol de decisión, el acierto en 40 clientes
            nuevos sube de 35 a 39.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Por qué funciona: si cada árbol tiene <G k="sesgoVarianza">varianza</G> <Tex>{'\\sigma^2'}</Tex> y la correlación entre dos
            árboles es <Tex after=",">{'\\rho'}</Tex> el promedio de <Tex>{'B'}</Tex> árboles tiene varianza
          </p>
          <Tex block>{'\\rho\\,\\sigma^2 + \\frac{1-\\rho}{B}\\,\\sigma^2'}</Tex>
          <p>
            Más árboles borran el segundo término; el primero solo baja si los árboles se parecen menos{' '}
            <Tex before="(">{'\\rho'}</Tex> pequeño). Para eso sirve sortear features: en clasificación scikit-learn usa{' '}
            <Tex>{'\\sqrt{p}'}</Tex> features por corte (<code>max_features="sqrt"</code>). En realidad,
            scikit-learn no cuenta votos: promedia las probabilidades de los árboles, lo que casi siempre da la
            misma clase.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que <b>los árboles se equivocan en sitios distintos</b>. Si todos cometen el mismo error, votar
            no lo corrige.
          </p>
          <p>
            Ejemplo: si una sola <G k="feature">feature</G> delata casi todo el fraude, todos los árboles la usan primero y quedan
            parecidos. El sorteo de features en cada corte obliga a algunos árboles a buscar otras señales.
          </p>
          <p>Como cualquier modelo supervisado, también supone que los datos nuevos se parecen a los de entrenamiento.</p>
        </>
      ),
      deepDive: (
        <p>
          No supone relaciones lineales ni distribuciones particulares, y no le afecta la escala de las features.
          Lo que no puede hacer es <G k="extrapolar" after=":">extrapolar</G> en <G k="regresion" after=",">regresión</G> nunca predice un valor fuera del rango de las
          respuestas que vio al entrenar.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Reduce el <G k="overfitting" after=":">sobreajuste</G></b> un árbol profundo memoriza el{' '}
            <G k="ruido" after=";">ruido</G> al promediar muchos, ese ruido se diluye. En el ejercicio, el árbol solo acierta
            77.7 % en compras nuevas y el bosque, 82.3 %.
          </li>
          <li>
            <b>Poca preparación:</b> no hay que <G k="escalado">escalar</G> las <G k="feature">features</G> y funciona bien con los valores por defecto. En scikit-learn 1.6 además acepta <G k="faltantes">valores faltantes</G> (NaN).
          </li>
          <li>
            <b>Dice qué features pesan:</b> trae una medida de importancia de cada señal.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Los árboles se entrenan de forma independiente, así que se reparten entre los núcleos del procesador (
          <code>n_jobs=-1</code>). Ojo con la importancia «de fábrica» (<code>feature_importances_</code>): mide cuánta <G k="gini">impureza</G> quitó cada feature y favorece a las que tienen muchos valores distintos. En el ejercicio,
          «antigüedad» (que no influye en el fraude) saca 0.12, más que «intentos»; la <G k="importanciaPermutacion">importancia por permutación</G> (medida en los datos nuevos) la deja en −0.006, es decir, en nada. Otra trampa: si dos features están muy <G k="correlacion" after=",">correlacionadas</G> ambas medidas se reparten la importancia entre ellas.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Menos interpretable:</b> no puedes leer 100 árboles como lees uno. Sabes qué <G k="feature">features</G> pesan, pero no
            la regla exacta.
          </li>
          <li>
            <b>Más lento y pesado:</b> guarda y consulta todos los árboles en cada predicción.
          </li>
          <li>
            <b>El 100 % de entrenamiento engaña:</b> en el ejercicio, árbol y bosque aciertan el 100 % de los datos
            con los que aprendieron. Solo los datos nuevos dicen la verdad.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Cada árbol crece sin límite por defecto, así que el modelo ocupa memoria y el tiempo de predicción crece
          con el número de árboles y su profundidad. En el simulador, con 100 árboles el bosque todavía vota
          «impago» (60 de 100 árboles) en el cliente de <G k="ruido">ruido</G> de abajo a la izquierda (ingreso 3, deuda 1.5), que no pagó aunque su deuda es baja: promediar reduce el <G k="overfitting" after=",">sobreajuste</G> no lo
          elimina.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">
            No lo uses si debes explicar cada decisión regla por regla, o si cada predicción debe salir en
            microsegundos en un equipo pequeño.
          </p>
          <p>
            Ejemplo: un sensor embebido que decide en tiempo real con poca memoria. Un modelo lineal o un árbol corto
            ocupan mucho menos.
          </p>
        </>
      ),
      deepDive: (
        <>
        <p>
          Si buscas la máxima <G k="exactitud">exactitud</G> en <G k="tabular" after=",">datos tabulares</G> Gradient Boosting suele superarlo, a cambio de más
          ajuste de <G k="hiperparametro" after=".">hiperparámetros</G>
        </p>
        <p>
          Con imágenes, audio o texto largo, las <G k="redNeuronal">redes
          neuronales</G> sacan mejores <G k="feature">features</G> que las columnas crudas.
        </p>
        </>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Detección de fraude.</b> Los bancos combinan señales como el monto, la hora, la distancia a la ciudad
            habitual y los intentos fallidos de clave, y los <G k="ensamble">ensambles</G> de árboles son una de sus herramientas
            habituales.
          </p>
          <p>
            El ejercicio genera 1 000 compras con una regla oculta: el fraude sube con el monto, la madrugada, la
            distancia y los intentos fallidos; la antigüedad de la tarjeta no influye. Hay 30 % de fraudes, así que
            decir siempre «no es fraude» ya acierta 70 %: ese es el piso. Un árbol solo acierta 77.7 % en compras
            nuevas; el bosque de 100 árboles, 82.3 %.
          </p>
          <p>
            Mira las dos columnas de importancia. La de impureza le da 0.12 a «antigüedad»; la de permutación (cuánto
            cae el acierto si se revuelve esa columna en los datos nuevos) la deja en −0.006, es decir, en nada.
          </p>
        </>
      ),
      deepDive: (
        <>
        <p>
          En la vida real el fraude es menos del 1 % de las compras: con tan pocos casos, la <G k="exactitud">exactitud</G> no sirve
          (99 % se logra sin detectar nada). Se miden la <G k="precisionSensibilidad">precisión y la sensibilidad</G> con una{' '}
          <G k="matrizConfusion" after=".">matriz de confusión</G>
        </p>
        <p>
          Además se ajusta el <G k="umbral">umbral</G> y se le da más peso
          a la <G k="desbalance">clase rara</G> (<code>class_weight="balanced"</code>).
        </p>
        </>
      ),
    },
  },
  Ova: RandomForestOva,
  ovaTab: 'type',
  autoPlayOva: true,
  python: { code, expectedOutput, colabNotebook: 'random-forest' },
  inYourField: [
    { area: 'Industrial', example: 'predecir qué máquina fallará en la próxima semana a partir de vibración, temperatura y horas de uso.' },
    { area: 'Ambiental', example: 'clasificar el uso del suelo (bosque, cultivo, ciudad, agua) a partir de las bandas de imágenes satelitales.' },
    { area: 'Civil', example: 'estimar el riesgo de falla de tramos de tubería según edad, material, presión y tipo de suelo.' },
  ],
  alternatives: ['gradient-boosting', 'decision-tree', 'logistic-regression'],
};

export default randomForest;
