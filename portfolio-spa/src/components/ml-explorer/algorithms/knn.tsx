import { G } from '../Gloss';
import { Tex } from '../Tex';
import { KnnOva } from '../ovas/KnnOva';
import type { AlgorithmModule } from '../types';
import code from './python/knn.py?raw';
import expectedOutput from './python/knn.out.txt?raw';

const knn: AlgorithmModule = {
  slug: 'knn',
  row: {
    type: 'Supervisado',
    bestUse: 'Clasificación con pocos ejemplos',
    formula: 'Voto mayoritario según distancia',
    assumptions: 'Features en la misma escala',
    pros: 'Simple, basado en ejemplos guardados',
    cons: 'Lento, sensible al ruido',
    whenNot: 'Datos ruidosos de alta dimensión',
    realWorld: 'Sistemas de recomendación',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b><G k="supervisado" after=":">Supervisado</G></b> necesita ejemplos con respuesta (a quién le gustó qué).
          </p>
          <p>
            Guarda los ejemplos y sus respuestas. Cuando llega una consulta, busca los k vecinos más cercanos con la distancia elegida y combina sus respuestas. No aprende una frontera mediante optimización; <code>fit</code> sí puede construir un índice de búsqueda, y el escalado de una secuencia de preparación puede aprender estadísticas.
          </p>
          <p>
            Sirve para clasificar (los vecinos votan) y para predecir números (se promedian sus valores). El simulador
            usa el voto. Python conserva un recomendador pequeño por promedio y añade una clasificación evaluada aparte.
          </p>
          <section className="mlx-hyperparameter-guide mlx-knn-guide" aria-label="Hiperparámetros y distancias de KNN">
            <h4>Qué puedes ajustar</h4>
            <p>Los <G k="hiperparametro">hiperparámetros</G> deciden qué vecinos participan y cómo se combina su respuesta.</p>
            <div className="mlx-knn-guide-grid">
              <section className="mlx-knn-guide-card">
                <h5>¿Cuántos vecinos participan?</h5>
                <code className="mlx-knn-guide-api">n_neighbors</code>
                <p><G k="knnVecinos">k</G> es la cantidad de vecinos consultados.</p><p><b>Un k pequeño</b> conserva detalles y puede seguir ruido. <b>Uno mayor</b> amplía el grupo y puede mezclar regiones distintas.</p>
                <details><summary>Cómo elegir la cantidad</summary><p>Elige k con validación. Solo pueden participar tantos vecinos como ejemplos disponibles.</p></details>
              </section>
              <section className="mlx-knn-guide-card">
                <h5>¿Cuánto aporta cada vecino?</h5>
                <code className="mlx-knn-guide-api">weights</code>
                <p><code>uniform</code>: todos pesan igual.</p><p><code>distance</code>: los más cercanos aportan más mediante <G k="knnPesos">pesos por distancia</G>.</p>
                <details><summary>Cómo se calcula el aporte</summary><p>Con distance, el peso es inversamente proporcional a la distancia. Si hay coincidencias exactas entre los vecinos seleccionados, solo esas coincidencias aportan.</p></details>
              </section>
              <section className="mlx-knn-guide-card">
                <h5>¿Qué significa estar cerca?</h5>
                <code className="mlx-knn-guide-api">metric · p</code>
                <p>La <G k="knnMetrica">métrica</G> define cómo medimos el parecido.</p><p>En la OVA: <b>p=2</b> mide en línea recta (euclidiana); <b>p=1</b> suma las diferencias por eje (Manhattan).</p>
                <details><summary>Cuándo se usa p</summary><p>Estas equivalencias usan <code>metric="minkowski"</code>. P no modifica todas las métricas: por ejemplo, no redefine el coseno.</p></details>
              </section>
              <section className="mlx-knn-guide-card">
                <h5>¿Cómo se encuentran los vecinos?</h5>
                <code className="mlx-knn-guide-api">algorithm · leaf_size</code>
                <p>El <G k="knnBusqueda">método de búsqueda</G> organiza la consulta. La OVA compara todos los ejemplos.</p><p>El tamaño de hoja afecta el costo de los índices, no la regla de voto.</p>
                <details><summary>Opciones de búsqueda en Python</summary><p><code>brute</code> compara todos; <code>kd_tree</code> y <code>ball_tree</code> usan índices. <code>auto</code> elige una opción compatible.</p></details>
              </section>
            </div>
            <section className="mlx-knn-guide-practice" aria-label="Comparación guiada en la OVA">
              <h5>Pruébalo en la OVA</h5>
              <p>Activa «Mostrar ajuste elegido» y cambia un ajuste a la vez:</p>
              <ol>
                <li><b>Cantidad:</b> compara k=1 con k=3.</li>
                <li><b>Aporte:</b> conserva k=3 y cambia uniform por distance. Un vecino muy cercano puede cambiar el ganador.</li>
                <li><b>Cercanía:</b> compara p=2 con p=1 y observa qué vecinos entran.</li>
              </ol>
              <p>No conocemos la respuesta real del rombo: su voto no mide acierto en personas nuevas.</p>
            </section>
            <p>El <G k="escalado">escalado</G> también influye en el parecido. En esta OVA, ambos gustos usan la escala 0–10.</p>
            <details className="mlx-knn-guide-scope">
              <summary>Qué cambia en la OVA y cómo se resuelven los empates</summary>
              <p>Mover el rombo cambia solo la consulta. El recorrido y su velocidad son <G k="controlDidactico">controles de visualización</G>.</p>
              <p>Los empates de distancias se resuelven por el orden original; los de aportes por clase favorecen la clase 0. Un k impar no evita todos los empates con pesos.</p>
              <p>La predicción se calcula para cada consulta; no hay pesos de una recta que aprender.</p>
            </details>
          </section>
        </>
      ),
      deepDive: (
        <p>
          Es un método no paramétrico basado en instancias (<i>lazy learning</i>). Sirve para clasificación (voto) y
          para regresión (promedio de los vecinos).
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo con <b>conjuntos de datos pequeños o medianos y pocas <G k="feature">features</G></b>, sobre todo cuando la idea de
            «parecido» tiene sentido para la respuesta que quieres predecir. Necesita ejemplos representativos, aunque no ajuste coeficientes mediante una optimización.
          </p>
          <ul>
            <li>Recomendaciones: «a usuarios parecidos a ti les gustó…».</li>
            <li>Clasificar una muestra nueva comparándola con un catálogo de muestras conocidas.</li>
            <li>Rellenar datos faltantes con los valores de los registros más parecidos.</li>
          </ul>
          <p className="mlx-rule">
            Si puedes describir el problema como «se parece a estos casos», KNN es un buen primer intento.
          </p>
        </>
      ),
      deepDive: (
        <p>
          La ventaja de un índice depende de las dimensiones, la cantidad de filas, la métrica y las consultas; no hay un límite universal de columnas. Mide tiempo y memoria. La búsqueda aproximada puede reducir costo en grandes colecciones, pero puede devolver vecinos distintos y cambiar la predicción.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> llega una persona nueva. Medimos su <G k="distancia">distancia</G> a cada persona
            conocida; por ejemplo, con dos gustos de 0 a 10, entre (6, 7) y (7, 8):
          </p>
          <Tex block>{'d = \\sqrt{(6-7)^2 + (7-8)^2} = \\sqrt{2} \\approx 1.41'}</Tex>
          <p>
            Con <b>k = 5</b> se toman las 5 personas más cercanas. Si a 4 les gustó la película y a 1 no, la
            predicción es «le gustará»: 4 votos contra 1.
          </p>
          <p>
            Prueba el simulador con k = 1: un solo vecino raro decide todo. Al aumentar k cambia el grupo; no se garantiza una respuesta mejor ni una clase constante.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>Predicción de clase:</p>
          <Tex block>{'\\hat{y} = \\arg\\max_c \\sum_{i \\in N_k(x)} \\mathbb{1}[y_i = c]'}</Tex>
          <p>
            Con <G k="knnPesos">pesos por distancia</G> se suman aportes <Tex>{'1/d_i'}</Tex> por clase; con voto uniforme, cada aporte vale 1. La fracción del aporte ganador puede calcularse dividiendo por el aporte total. No demuestra que esa sea la frecuencia de aciertos en casos nuevos. Si hay distancia cero, se evita dividir por cero usando solo las coincidencias exactas seleccionadas.
          </p>
          <p>La <G k="knnMetrica">distancia</G> puede ser euclidiana, Manhattan u otra compatible con la representación. El coseno compara dirección y puede ignorar diferencias de nivel en las calificaciones. K se elige con <G k="validacionCruzada">validación cruzada</G> o con una validación separada; los empates cerca del límite k pueden depender del orden de los ejemplos.</p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que <b>las <G k="feature">features</G> están en escalas comparables</b>.
          </p>
          <p>
            Ejemplo: si comparas personas por edad (20 a 60) y por salario (1 000 000 a 10 000 000), la diferencia de
            salario domina la distancia y la edad no cuenta. Por eso casi siempre se aplica{' '}
            <G k="escalado">escalado</G> antes.
          </p>
          <p>También supone que «estar cerca» significa «parecerse» en lo que importa.</p>
        </>
      ),
      deepDive: (
        <p>
          Aprende las estadísticas del escalado solo con entrenamiento y aplica la misma transformación a validación y prueba. Hacerlo antes de separar produce <G k="fugaInformacion">fuga de información</G>. Las columnas irrelevantes pueden sumar distancia sin ayudar; compara su selección con validación. En las calificaciones de 1 a 5 del ejemplo se conserva la escala común; un 0 es un dato ausente, no una nota.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Simple:</b> se explica con un dibujo y se programa en pocas líneas.
          </li>
          <li>
            <b>Ajuste sencillo:</b> no estima una ecuación global por optimización. Guardar más ejemplos puede exigir reconstruir el índice y revisar el costo de las consultas.
          </li>
          <li>
            <b>Fronteras flexibles:</b> se adapta a formas irregulares sin suponer rectas.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          La explicación local es directa: «estos vecinos participaron con estos aportes». Eso permite revisar ejemplos atípicos y la métrica elegida. No demuestra una relación causal ni garantiza que otros casos cercanos deban tener la misma respuesta.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Lento al predecir:</b> con búsqueda exhaustiva compara con todos los ejemplos guardados; los índices pueden acelerar casos compatibles, pero también tienen costo de construcción y memoria.
          </li>
          <li>
            <b>Sensible al <G k="ruido" after=":">ruido</G></b> con k pequeño, un ejemplo mal etiquetado cambia la respuesta.
            Pruébalo en el simulador con k = 1.
          </li>
          <li>
            <b>Sufre con muchas <G k="feature" after=":">features</G></b> en <G k="altaDimension">alta dimensionalidad</G> las distancias pueden volverse menos informativas, sobre todo cuando muchas columnas son irrelevantes.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          La «maldición de la dimensionalidad»: a medida que crecen las features (sobre todo si muchas son ruido o
          irrelevantes), la distancia al vecino más cercano y al más lejano se vuelven casi iguales, y «el más
          parecido» deja de significar algo. Compara selección de columnas o <G k="pca">PCA</G> ajustada solo con entrenamiento; reducir dimensiones también puede eliminar diferencias útiles.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses con datos ruidosos de muchas dimensiones.</p>
          <p>
            Ejemplo: clasificar textos usando como <G k="feature">features</G> el conteo crudo de miles de palabras. Las distancias se
            llenan de ruido y, además, cada predicción es lenta. (Con <G k="embedding" after=",">embeddings</G> entrenados para que la distancia sí
            signifique parecido, la búsqueda por vecinos es otro candidato; necesita su propia evaluación.)
          </p>
        </>
      ),
      deepDive: (
        <p>
          Si necesitas respuestas en milisegundos sobre millones de registros, o si las features tienen escalas y
          tipos muy distintos, compara modelos que aprendan un resumen y alternativas de búsqueda, midiendo costo y resultado con tus consultas.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Sistemas de recomendación.</b> La idea «a usuarios parecidos les gustan cosas parecidas» se llama
            filtrado colaborativo, y fue la base de los primeros recomendadores de tiendas en línea y plataformas de
            video.
          </p>
          <p>
            El ejercicio tiene 6 usuarios y 6 películas. Es KNN para regresión: compara a Ana con los demás solo en
            las 3 películas que ella ya calificó, toma a los 3 más parecidos y predice su nota para las que no ha
            visto como el promedio de las notas de ellos. Con promedio uniforme, Interestelar sale primera (3.7 de 5). Con pesos por distancia cambia la predicción: Beto coincide exactamente con Ana en esas tres notas, así que solo aporta él. Esto ilustra el cálculo; seis usuarios no validan un recomendador.
          </p>
          <p>Para mostrar cómo elegir ajustes, Python incluye otra tarea independiente: clasificar 178 muestras de vino con 13 mediciones. Separa entrenamiento, validación y prueba; compara k, weights y p con <G k="escalado">escalado</G> aprendido solo en entrenamiento. La prueba se consulta una vez al final. Esa evaluación no mide la calidad del recomendador de películas.</p>
        </>
      ),
      deepDive: (
        <p>
          En colecciones grandes se pueden buscar vecinos sobre <G k="embedding">embeddings</G> con significado apropiado para la tarea. Evalúa también usuarios sin historial, tiempos de respuesta y exposición de las recomendaciones.
          Referencias: <a href="https://scikit-learn.org/stable/modules/generated/sklearn.neighbors.KNeighborsClassifier.html" target="_blank" rel="noreferrer">ajustes de clasificación</a>, <a href="https://scikit-learn.org/stable/modules/generated/sklearn.neighbors.KNeighborsRegressor.html" target="_blank" rel="noreferrer">promedios en regresión</a> y <a href="https://scikit-learn.org/stable/modules/neighbors.html" target="_blank" rel="noreferrer">guía de vecinos</a>.
        </p>
      ),
    },
  },
  Ova: KnnOva,
  ovaTab: 'type',
  autoPlayOva: true,
  python: { code, expectedOutput, colabNotebook: 'knn' },
  inYourField: [
    { area: 'Química', example: 'estimar una propiedad de una mezcla nueva a partir de las mezclas más parecidas ya medidas.' },
    { area: 'Telecomunicaciones', example: 'ubicar un celular en interiores comparando las señales wifi que recibe con un mapa de mediciones.' },
    { area: 'Agrícola', example: 'recomendar un cultivo según el suelo y el clima de las fincas más parecidas.' },
  ],
  alternatives: ['random-forest', 'svm', 'pca'],
};

export default knn;
