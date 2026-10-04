import { G } from '../Gloss';
import { Tex } from '../Tex';
import { DbscanOva } from '../ovas/DbscanOva';
import type { AlgorithmModule } from '../types';
import code from './python/dbscan.py?raw';
import expectedOutput from './python/dbscan.out.txt?raw';

const dbscan: AlgorithmModule = {
  slug: 'dbscan',
  row: {
    type: 'No supervisado',
    bestUse: 'Grupos de forma arbitraria y datos con ruido',
    formula: 'Densidad: vecinos a distancia ε (mínimo minPts)',
    assumptions: 'Los grupos tienen densidad parecida',
    pros: 'Encuentra formas arbitrarias y marca el ruido',
    cons: 'Sensible a ε y minPts',
    whenNot: 'Grupos de densidades muy distintas',
    realWorld: 'Agrupamiento geoespacial, detección de anomalías',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>
              <G k="noSupervisado">No supervisado</G>:
            </b>{' '}
            los datos no traen respuesta. El algoritmo descubre los grupos (<G k="cluster">clusters</G>) solo.
          </p>
          <p>
            DBSCAN llama grupo a <b>toda zona con muchos puntos juntos</b>, tenga la forma que tenga, y deja fuera
            como <b>ruido</b> los puntos aislados. No hay que decirle cuántos grupos buscar: eso sale de la{' '}
            <G k="densidad">densidad</G> de los datos.
          </p>
          <p>
            <b>¿Cómo se evalúa sin respuestas?</b> Mirando cuántos grupos y cuánto ruido salen al mover sus dos
            parámetros, y revisando en un mapa o gráfico si tienen sentido. La <G k="silueta">silueta</G> sirve poco
            aquí: premia grupos redondos y DBSCAN existe justo para los que no lo son.
          </p>
        </>
      ),
      deepDive: (
        <p>
          DBSCAN viene de <i>Density-Based Spatial Clustering of Applications with Noise</i>: agrupamiento espacial
          basado en densidad para datos con ruido (Ester y otros, 1996). Su versión moderna,{' '}
          <G k="hdbscan">HDBSCAN</G>, prueba todas las densidades a la vez; OPTICS, también en scikit-learn, es
          otra opción para grupos de densidades distintas.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo cuando los grupos tienen <b>formas irregulares</b> (franjas, curvas, manchas) y hay{' '}
            <b>puntos sueltos</b> que no deberían pertenecer a ningún grupo.
          </p>
          <ul>
            <li>Encontrar zonas con muchos reportes, accidentes o pedidos en un mapa.</li>
            <li>Detectar lecturas anómalas: lo que DBSCAN marca como ruido.</li>
            <li>Separar objetos en nubes de puntos de un escáner láser (LiDAR).</li>
          </ul>
          <p className="mlx-rule">Si no sabes cuántos grupos hay y esperas ruido, prueba DBSCAN antes que K-Means.</p>
        </>
      ),
      deepDive: (
        <p>
          Con un índice espacial (árboles KD o Ball) cada búsqueda de vecinos es rápida, y DBSCAN escala a cientos
          de miles de puntos en pocas dimensiones. Con muchas <G k="feature">features</G> las distancias se
          parecen todas y la densidad pierde sentido (ver <G k="altaDimension">alta dimensionalidad</G>).
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> puntos en 0, 0.5, 1, 5 y 5.5 sobre una recta, con <G k="epsilon">ε</G> = 0.5 y{' '}
            <G k="minPts">minPts</G> = 3. El 0.5 tiene 3 vecinos a 0.5 o menos (el 0, el 1 y él mismo): es un punto
            núcleo. El 0 y el 1 tienen solo 2, pero son vecinos del 0.5: son borde y entran a su grupo. El 5 y el
            5.5 tienen 2 cada uno y ningún núcleo cerca: son ruido.
          </p>
          <p>Las reglas, para cada punto p:</p>
          <Tex block>{'N_\\varepsilon(p) = \\{\\, q : d(p, q) \\le \\varepsilon \\,\\}, \\qquad p \\text{ es núcleo si } |N_\\varepsilon(p)| \\ge \\text{minPts}'}</Tex>
          <p>
            Dos núcleos vecinos van al mismo grupo, y así se encadena todo el grupo. Un punto que no es núcleo pero
            está en el vecindario de uno es <G k="puntoNucleo">punto de borde</G>; el resto es ruido.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Cada grupo es un conjunto maximal de puntos conectados por densidad. Los núcleos y el ruido no dependen del
          orden de los datos; un punto de borde vecino de dos grupos se queda con el primero que lo alcanza. En
          scikit-learn, <code>min_samples</code> cuenta el propio punto, como en el ejemplo. El costo es de una
          búsqueda de vecinos por punto: en total, del orden de <Tex>{'n \\log n'}</Tex> con índice espacial y ε pequeño,
          y de <Tex>{'n^2'}</Tex> sin él.
        </p>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que <b>todos los grupos tienen una <G k="densidad">densidad</G> parecida</b>: un solo{' '}
            <G k="epsilon">ε</G> debe servir para todos. Si un grupo es muy apretado y otro muy disperso, el ε que
            encuentra al disperso funde a los apretados con sus vecinos.
          </p>
          <p>
            Como todo método de distancias, también supone <G k="feature">features</G> en escalas comparables y una
            distancia con sentido. En el ejercicio se usa la <G k="haversine">distancia haversine</G>, que mide
            sobre la Tierra a partir de latitud y longitud.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Para elegir ε se suele ordenar la distancia de cada punto a su vecino número minPts, contándose él
          mismo como el primero, y buscar el codo de esa curva. Para <G k="minPts">minPts</G>, una regla común es
          el doble del número de features (4 en un mapa); en el ejercicio se usa 5, un poco más exigente.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Formas libres:</b> en el simulador, con <G k="epsilon">ε</G> = 1.0 encuentra las dos lunas
            entrelazadas, que K-Means cortaría con una recta.
          </li>
          <li>
            <b>Marca el ruido:</b> en el ejercicio, con ε = 300 m deja 13 reportes como ruido en vez de meterlos a la
            fuerza en una zona.
          </li>
          <li>
            <b>No hay que elegir cuántos grupos:</b> salen de los datos.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Lo que marca como ruido sirve como detector de anomalías sin entrenar nada más. Los{' '}
          <G k="outlier">outliers</G> no deforman los grupos, como sí pasa con los promedios de K-Means.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Sensible a <G k="epsilon">ε</G>:</b> en el simulador, con ε = 0.8 las dos lunas salen partidas en 4
            grupos; con 1.1 se funden en 1.
          </li>
          <li>
            <b>Sensible a <G k="minPts">minPts</G>:</b> con ε = 1.0, subir minPts de 4 a 6 pasa de 2 grupos y 4
            puntos de ruido a 4 grupos y 13 de ruido.
          </li>
          <li>
            <b>Un solo ε para todo:</b> falla si los grupos tienen <G k="densidad">densidades</G> muy distintas.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          En el ejercicio pasa lo mismo a escala de ciudad: con 150 m salen 7 zonas y 32 reportes quedan como ruido;
          con 800 m quedan solo 2 zonas, porque dos de las tres se funden. <G k="hdbscan">HDBSCAN</G> evita elegir ε y
          maneja densidades distintas.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses si los grupos tienen densidades muy distintas.</p>
          <p>
            Ejemplo: tiendas en el centro de una ciudad (muy juntas) y en pueblos cercanos (dispersas). Un ε pequeño
            deja los pueblos como ruido; uno grande junta todo el centro en un solo grupo. Ningún valor encuentra
            ambos.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Tampoco conviene con muchas <G k="feature">features</G> (las distancias pierden contraste) ni cuando
          necesitas que cada punto quede en algún grupo: ahí sirve K-Means o el agrupamiento jerárquico. Para
          densidades distintas, <G k="hdbscan">HDBSCAN</G> u OPTICS (ambos en scikit-learn).
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Agrupamiento geoespacial.</b> Con coordenadas GPS se encuentran zonas de alta concentración (puntos
            críticos de accidentes, de pedidos, de reportes) sin fijar su número ni su forma.
          </p>
          <p>
            El ejercicio simula 145 reportes de huecos en la vía: un barrio, una avenida larga, un mercado y reportes
            aislados. Con la <G k="haversine">distancia haversine</G>, <G k="epsilon">ε</G> = 300 m y{' '}
            <G k="minPts">minPts</G> = 5, encuentra 3 zonas (62, 40 y 30 reportes) y deja 13 como ruido.
          </p>
          <p>
            K-Means con K = 3, en cambio, manda 17 de los 60 reportes de la avenida a otra zona y mete los 15
            aislados en algún grupo.
          </p>
        </>
      ),
      deepDive: (
        <p>
          La distancia haversine trabaja en radianes, así que ε también: 300 m son 0.3 km / 6371 km ≈ 0.000047 radianes (6371 km es el
          radio de la Tierra). Con millones de puntos se usa un índice espacial o se agrupa primero por cuadrículas.
        </p>
      ),
    },
  },
  Ova: DbscanOva,
  python: { code, expectedOutput, colabNotebook: 'dbscan' },
  inYourField: [
    { area: 'Civil', example: 'encontrar tramos de vía con muchos accidentes a partir de las coordenadas de cada reporte.' },
    { area: 'Eléctrica', example: 'separar lecturas anómalas de un medidor (ruido) de los patrones normales de consumo.' },
    { area: 'Topográfica', example: 'separar objetos (árboles, postes, edificios) en una nube de puntos de un escáner láser.' },
  ],
  alternatives: ['hierarchical-clustering', 'k-means'],
};

export default dbscan;
