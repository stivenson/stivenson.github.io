import { G } from '../Gloss';
import { Tex } from '../Tex';
import { LinearRegressionOva } from '../ovas/LinearRegressionOva';
import type { AlgorithmModule } from '../types';
import code from './python/linear-regression.py?raw';
import expectedOutput from './python/linear-regression.out.txt?raw';

const linearRegression: AlgorithmModule = {
  slug: 'linear-regression',
  row: {
    type: 'Supervisado',
    bestUse: 'Predecir valores continuos',
    formula: 'Y = b₀ + b₁X₁ + b₂X₂ + …',
    assumptions: 'Linealidad, independencia',
    pros: 'Simple, interpretable, rápido',
    cons: 'Sensible a outliers y a relaciones no lineales',
    whenNot: 'Datos con fuerte no linealidad',
    realWorld: 'Predicción del precio de casas',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>Supervisado:</b> aprende de ejemplos que ya traen la respuesta. Le das casas con su{' '}
            <G k="feature">área y número de habitaciones</G> y su <G k="etiqueta" after=",">precio real</G> y aprende a
            estimar el precio de casas nuevas.
          </p>
          <p>
            Predice un <b>número</b> (precio, temperatura, consumo), no una categoría. A eso se le llama un problema de{' '}
            <i>regresión</i>.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Dados pares <Tex after=",">{'(x_i, y_i)'}</Tex> busca una función lineal en los parámetros:{' '}
            <Tex after=".">{'f(x) = b_0 + b_1 x_1 + \\dots + b_p x_p'}</Tex>
          </p>
          <p>
            «Lineal» se refiere a los pesos b, no a las x: <Tex>{'y = b_0 + b_1 x + b_2 x^2'}</Tex> también es
            regresión lineal, con x² como feature adicional.
          </p>
        </>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsala cuando quieres <b>predecir un valor continuo</b> y, sobre todo, <b>entender cuánto pesa cada
            factor</b>.
          </p>
          <ul>
            <li>Precio de una vivienda según área, habitaciones y estrato.</li>
            <li>Demanda de energía según la temperatura.</li>
            <li>Ventas según la inversión en publicidad.</li>
          </ul>
          <p className="mlx-rule">
            Es el punto de partida: si una recta ya explica bien tus datos, no necesitas nada más complejo.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Funciona con pocas decenas de filas y escala a millones: entrenarla cuesta <Tex>{'O(n p^2)'}</Tex> con n
          filas y p <G k="feature" after=",">features</G> más <Tex>{'O(p^3)'}</Tex> para resolver el sistema; si n ≥ p domina el primer término. Si
          hay más features que filas, existen infinitas soluciones y hace falta regularizar. <G k="regularizacionL1L2">Ridge</G> (penalización L2)
          siempre da una solución única. Lasso (L1) no siempre: con features repetidas o colineales puede haber varias
          soluciones igual de buenas.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> si el modelo aprendió b₀ = 80, b₁ = 2.5 por m² y b₂ = 15 por habitación, una casa de 120
            m² con 3 habitaciones cuesta:
          </p>
          <Tex block>{'80 + 2.5 \\times 120 + 15 \\times 3 = 425 \\text{ millones}'}</Tex>
          <p>
            La fórmula general es esa misma suma, con un peso por cada <G k="feature" after=":">feature</G>
          </p>
          <Tex block>{'\\hat{y} = b_0 + b_1 x_1 + b_2 x_2 + \\dots'}</Tex>
          <p>
            ¿Cómo elige los pesos? Busca la recta con el menor <G k="mse" after=":">error cuadrático medio</G> el promedio de
            los <G k="residuo">residuos</G> al cuadrado. En el simulador, cada cuadrado amarillo es un residuo al
            cuadrado.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>Mínimos cuadrados ordinarios:</p>
          <Tex block>{'\\min_{b}\\ \\frac{1}{n}\\sum_{i=1}^{n}\\left(y_i - \\hat{y}_i\\right)^2'}</Tex>
          <p>Tiene solución cerrada, la ecuación normal:</p>
          <Tex block>{'b = (X^\\top X)^{-1} X^\\top y'}</Tex>
          <p>
            Con una sola variable:{' '}
            <Tex after=".">{'b_1 = \\frac{\\sum (x_i-\\bar{x})(y_i-\\bar{y})}{\\sum (x_i-\\bar{x})^2},\\quad b_0 = \\bar{y} - b_1\\bar{x}'}</Tex> Es lo que calcula el simulador cada vez que mueves un punto.
          </p>
          <p>
            En la ecuación normal, X es la tabla de datos con una columna de unos al inicio: esa columna es la que
            multiplica a b₀. La fórmula exige que <Tex>{'X^\\top X'}</Tex> sea invertible, es decir, que ninguna
            feature sea redundante (copia o combinación lineal de otras) y que haya al menos tantas filas como
            columnas.
          </p>
          <p>
            En la práctica no se invierte <Tex after=":">{'X^\\top X'}</Tex> el sistema se resuelve con una descomposición (QR o
            SVD), que es numéricamente más estable. scikit-learn usa un <G k="solver">solver</G> de mínimos cuadrados. El costo crece
            sobre todo con p, el número de features (con su cuadrado), y no tanto con n, el de filas (solo en
            proporción): duplicar las filas duplica el tiempo; duplicar las features lo cuadruplica. El <G k="descensoGradiente">descenso de
            gradiente</G> (estocástico) se reserva para cuando hay muchísimas features o los datos no caben en memoria.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>Dos supuestos principales:</p>
          <ul>
            <li>
              <b>Linealidad:</b> cada <G k="feature">feature</G> suma o resta en línea recta. Si el precio sube cada vez más rápido con
              el área, una recta se queda corta.
            </li>
            <li>
              <b>Independencia:</b> el error de un dato no depende del de otro. Falla, por ejemplo, en series de
              tiempo: el consumo de hoy se parece al de ayer.
            </li>
          </ul>
          <p>Cómo revisarlos: grafica los <G k="residuo" after=".">residuos</G> Si forman una curva o un patrón, algún supuesto no se cumple.</p>
        </>
      ),
      deepDive: (
        <p>
          Para que los intervalos de confianza y los p-valores sean válidos se suman: varianza constante de los
          errores (homocedasticidad), errores aproximadamente normales y poca colinealidad entre features. Si solo
          quieres predecir, basta con que el error en datos de prueba sea bajo.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Simple:</b> se explica en una frase y se calcula en milisegundos.
          </li>
          <li>
            <b>
              <G k="interpretable" after=":">Interpretable</G>
            </b>{' '}
            cada peso se lee directo: «cada m² suma 2.5 millones, con el mismo número de habitaciones». Ideal cuando tienes que justificar la decisión.
          </li>
          <li>
            <b>Rápida:</b> entrena con millones de filas en un portátil y predice con una suma.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Tiene solución exacta (no depende de semillas ni de iteraciones) y teoría estadística completa para sus
          intervalos de confianza. Es la línea base contra la que se compara cualquier modelo más complejo.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>
              Sensible a <G k="outlier" after=":">outliers</G>
            </b>{' '}
            como el error se eleva al cuadrado, un solo punto lejano arrastra la recta. En el simulador de la pestaña
            Fórmula, «Añadir un outlier» sube el <G k="mse">MSE</G> de 0.10 a 2.57 (unas 25 veces) y baja la pendiente de 0.65 a
            0.40.
          </li>
          <li>
            <b>Solo ve rectas:</b> si la relación real es curva (rendimientos decrecientes, <G k="umbral" after="),">umbrales</G> se equivoca de
            forma sistemática.
          </li>
          <li>
            <b>No descubre interacciones sola:</b> si el efecto del área depende del barrio, tienes que crear esa{' '}
            <G k="feature">feature</G> a mano.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Contra los outliers: regresión robusta <G before="(" k="huber" after=",">Huber</G> RANSAC). Contra la no linealidad: features transformadas
          (x², log x) o árboles. Con features muy correlacionadas los pesos se vuelven inestables; <G k="regularizacionL1L2">Ridge</G> (penalización
          L2) lo corrige.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">
            No la uses si la respuesta cambia de golpe a partir de un <G k="umbral" after=",">umbral</G> o si el efecto de cada factor depende del
            contexto y no sabes de qué.
          </p>
          <p>
            Ejemplo: un motor casi no falla por debajo de 90 °C, y por encima sus fallas se disparan. Una recta reparte
            ese salto por todo el rango: se equivoca por debajo del umbral (predice fallas que no hay, o incluso
            cantidades negativas) y se queda corta a 100 °C. Elevar al cuadrado o sacar
            logaritmo no crea un salto, y si no sabes dónde está el umbral tampoco puedes construir esa <G k="feature">feature</G> a mano.
          </p>
          <p>Tampoco sirve para predecir categorías (sí/no): para eso está la regresión logística.</p>
        </>
      ),
      deepDive: (
        <p>
          Antes de descartarla, prueba features transformadas: x² para una curva que sube y baja (el rendimiento de un
          cultivo frente al fertilizante), log x para un crecimiento que se frena. Sigue siendo regresión lineal,
          porque es lineal en los pesos. Si los <G k="residuo">residuos</G> siguen con patrón, cambia de modelo: los
          árboles de decisión encuentran umbrales e interacciones por sí solos.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Predicción del precio de casas.</b> Inmobiliarias y bancos estiman el valor de una vivienda a partir de
            su área, habitaciones, ubicación y antigüedad. La regresión lineal da el precio y además explica cuánto
            aporta cada característica.
          </p>
          <p>
            El ejercicio genera 200 casas de juguete cuyo precio real es 80 + 2.5 por m² + 15 por habitación, más
            ruido. Mira si el modelo recupera esos números y qué tan bien predice casas que no vio (
            <G k="entrenamientoPrueba" after=",">datos de prueba</G> medido con <G k="r2" after=").">R²</G>
          </p>
        </>
      ),
      deepDive: (
        <p>
          En producción: separa por fecha (entrena con ventas antiguas y prueba con las recientes), modela el
          logaritmo del precio (los errores suelen ser proporcionales al precio) y vigila que la relación no cambie con
          el tiempo.
        </p>
      ),
    },
  },
  Ova: LinearRegressionOva,
  python: { code, expectedOutput, colabNotebook: 'linear-regression' },
  inYourField: [
    { area: 'Industrial', example: 'demanda de un producto según precio y temporada.' },
    { area: 'Civil', example: 'resistencia del concreto según días de curado y relación agua-cemento.' },
    { area: 'Eléctrica', example: 'consumo de energía de un edificio según la temperatura exterior.' },
  ],
  alternatives: ['decision-tree', 'random-forest', 'gradient-boosting'],
};

export default linearRegression;
