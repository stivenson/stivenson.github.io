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
    pros: 'Simple, sin fase de entrenamiento',
    cons: 'Lento, sensible al ruido',
    whenNot: 'Datos ruidosos de alta dimensión',
    realWorld: 'Sistemas de recomendación',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>Supervisado:</b> necesita ejemplos con respuesta (a quién le gustó qué).
          </p>
          <p>
            Es el algoritmo más «perezoso»: <b>no aprende nada por adelantado</b>. Guarda todos los ejemplos y, cuando
            llega un caso nuevo, busca los k más parecidos y los pone a votar.
          </p>
          <p>
            Sirve para clasificar (los vecinos votan) y para predecir números (se promedian sus valores). El simulador
            usa el voto; el ejercicio de Python, el promedio.
          </p>
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
            «parecido» es natural en el problema. No necesita entrenar, pero sí ejemplos que cubran bien los casos
            posibles.
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
          Va bien con pocas features (menos de unas 20; por encima, los árboles KD dejan de acelerar la búsqueda) y
          miles de datos. Con millones de datos se usan índices espaciales (árboles KD, ball trees) o búsqueda
          aproximada de vecinos (algoritmos como HNSW, bibliotecas como FAISS).
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
            Prueba el simulador con k = 1: un solo vecino raro decide todo. Con k más grande el voto se vuelve
            estable.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>Predicción de clase:</p>
          <Tex block>{'\\hat{y} = \\arg\\max_c \\sum_{i \\in N_k(x)} \\mathbb{1}[y_i = c]'}</Tex>
          <p>
            Variantes: ponderar cada voto por <Tex after=",">{'1/d'}</Tex> o usar distancia Manhattan o coseno. Ojo: el coseno
            ignora el nivel de las notas; en el ejercicio, Caro (que calificó con 1 lo que Ana calificó con 4 y 5)
            saldría casi idéntica a ella. Entrenar es solo guardar los datos, pero cada predicción cuesta{' '}
            <Tex>{'O(n\\,p)'}</Tex> con búsqueda exhaustiva. k es el <G k="hiperparametro">hiperparámetro</G> clave:
            con k pequeño el modelo es nervioso (mucha varianza); con k grande, rígido (mucho sesgo). Se elige con{' '}
            <G k="validacionCruzada">validación cruzada</G> y, con dos clases, suele ser impar para evitar empates.
          </p>
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
          Escalados típicos: estandarización (media 0, desviación 1) o min-max a [0, 1]. Las features irrelevantes
          también estorban: suman distancia sin aportar información, así que conviene quitarlas.
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
            <b>Sin fase de entrenamiento:</b> agregar un ejemplo es solo guardarlo; el modelo queda actualizado al
            instante.
          </li>
          <li>
            <b>Fronteras flexibles:</b> se adapta a formas irregulares sin suponer rectas.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          En el límite de infinitos datos, el error de 1-NN es como mucho el doble del mínimo error posible, el error
          de Bayes (Cover y Hart, 1967). Es una garantía asintótica: con pocos datos no promete nada. Y su explicación
          es directa: «se predijo esto porque se parece a estos casos».
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Lento al predecir:</b> compara el caso nuevo con todos los ejemplos guardados.
          </li>
          <li>
            <b>Sensible al <G k="ruido" after=":">ruido</G></b> con k pequeño, un ejemplo mal etiquetado cambia la respuesta.
            Pruébalo en el simulador con k = 1.
          </li>
          <li>
            <b>Sufre con muchas <G k="feature" after=":">features</G></b> en <G k="altaDimension">alta dimensionalidad</G> todos los puntos
            quedan casi igual de lejos.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          La «maldición de la dimensionalidad»: a medida que crecen las features (sobre todo si muchas son ruido o
          irrelevantes), la distancia al vecino más cercano y al más lejano se vuelven casi iguales, y «el más
          parecido» deja de significar algo. Reducir dimensiones con <G k="pca">PCA</G> antes de KNN suele ayudar.
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
            signifique parecido, KNN vuelve a funcionar: ver Ejemplo real.)
          </p>
        </>
      ),
      deepDive: (
        <p>
          Si necesitas respuestas en milisegundos sobre millones de registros, o si las features tienen escalas y
          tipos muy distintos, un modelo que aprenda un resumen (logístico, árboles) es mejor opción.
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
            visto como el promedio de las notas de ellos. Interestelar sale primera (3.7 de 5); Alien y Matrix
            aparecen al final de la lista con 1.3: no vale la pena recomendárselas.
          </p>
        </>
      ),
      deepDive: (
        <p>
          En producción hay millones de usuarios y productos: se usan representaciones aprendidas <G before="(" k="embedding" after="),">embeddings</G>
          entrenadas para que «cerca» signifique «parecido» aunque tengan cientos de dimensiones, y búsqueda
          aproximada de vecinos. Otro reto es el «arranque en frío»: un usuario nuevo no tiene calificaciones con las
          que compararse.
        </p>
      ),
    },
  },
  Ova: KnnOva,
  python: { code, expectedOutput, colabNotebook: 'knn' },
  inYourField: [
    { area: 'Química', example: 'estimar una propiedad de una mezcla nueva a partir de las mezclas más parecidas ya medidas.' },
    { area: 'Telecomunicaciones', example: 'ubicar un celular en interiores comparando las señales wifi que recibe con un mapa de mediciones.' },
    { area: 'Agrícola', example: 'recomendar un cultivo según el suelo y el clima de las fincas más parecidas.' },
  ],
  alternatives: ['random-forest', 'svm', 'pca'],
};

export default knn;
