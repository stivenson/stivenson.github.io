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
            <G k="feature">área y número de habitaciones</G> y su <G k="etiqueta">precio real</G>, y aprende a
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
            Dados pares <Tex>{'(x_i, y_i)'}</Tex>, busca una función lineal en los parámetros:{' '}
            <Tex>{'f(x) = b_0 + b_1 x_1 + \\dots + b_p x_p'}</Tex>.
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
          filas y p features. Si hay más features que filas, existen infinitas soluciones y hace falta regularización
          (Ridge o Lasso).
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
            La fórmula general es esa misma suma, con un peso por cada <G k="feature">feature</G>:
          </p>
          <Tex block>{'\\hat{y} = b_0 + b_1 x_1 + b_2 x_2 + \\dots'}</Tex>
          <p>
            ¿Cómo elige los pesos? Busca la recta con el menor <G k="mse">error cuadrático medio</G>: el promedio de
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
            <Tex>{'b_1 = \\frac{\\sum (x_i-\\bar{x})(y_i-\\bar{y})}{\\sum (x_i-\\bar{x})^2},\\quad b_0 = \\bar{y} - b_1\\bar{x}'}</Tex>
            . Es lo que calcula el simulador cada vez que mueves un punto. Con millones de filas se usa descenso de
            gradiente en lugar de invertir la matriz.
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
              <b>Linealidad:</b> cada feature suma o resta en línea recta. Si el precio sube cada vez más rápido con
              el área, una recta se queda corta.
            </li>
            <li>
              <b>Independencia:</b> el error de un dato no depende del de otro. Falla, por ejemplo, en series de
              tiempo: el consumo de hoy se parece al de ayer.
            </li>
          </ul>
          <p>Cómo revisarlos: grafica los residuos. Si forman una curva o un patrón, algún supuesto no se cumple.</p>
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
              <G k="interpretable">Interpretable</G>:
            </b>{' '}
            cada peso se lee directo: «cada m² suma 2.5 millones». Ideal cuando tienes que justificar la decisión.
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
              Sensible a <G k="outlier">outliers</G>:
            </b>{' '}
            como el error se eleva al cuadrado, un solo punto lejano arrastra la recta. Pruébalo con «Añadir un
            outlier» en el simulador de la pestaña Fórmula.
          </li>
          <li>
            <b>Solo ve rectas:</b> si la relación real es curva (rendimientos decrecientes, umbrales), se equivoca de
            forma sistemática.
          </li>
          <li>
            <b>No descubre interacciones sola:</b> si el efecto del área depende del barrio, tienes que crear esa
            feature a mano.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Contra los outliers: regresión robusta (Huber, RANSAC). Contra la no linealidad: features transformadas
          (x², log x) o árboles. Con features muy correlacionadas los pesos se vuelven inestables; Ridge (penalización
          L2) lo corrige.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No la uses si la relación entre las features y la respuesta es claramente no lineal.</p>
          <p>
            Ejemplo: el rendimiento de un cultivo sube con el fertilizante hasta cierto punto, y después baja. Una
            recta no puede subir y bajar. Tampoco sirve para predecir categorías (sí/no): para eso está la regresión
            logística.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Antes de descartarla, prueba transformar las features: muchas relaciones curvas se vuelven rectas con un
          logaritmo. Si los residuos siguen mostrando patrones, cambia de modelo.
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
            <G k="entrenamientoPrueba">datos de prueba</G>, medido con <G k="r2">R²</G>).
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
  python: { code, expectedOutput, colabAnchor: 'linear-regression' },
  inYourField: [
    { area: 'Industrial', example: 'demanda de un producto según precio y temporada.' },
    { area: 'Civil', example: 'resistencia del concreto según días de curado y relación agua-cemento.' },
    { area: 'Eléctrica', example: 'consumo de energía de un edificio según la temperatura exterior.' },
  ],
  alternatives: ['decision-tree', 'random-forest', 'gradient-boosting'],
};

export default linearRegression;
