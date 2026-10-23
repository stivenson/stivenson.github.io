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
              <G k="noSupervisado" after=":">No supervisado</G>
            </b>{' '}
            los datos no traen respuesta. El algoritmo descubre los grupos <G before="(" k="cluster" after=")">clusters</G> solo.
          </p>
          <p>
            DBSCAN llama grupo a <b>toda zona con muchos puntos juntos</b>, tenga la forma que tenga, y deja fuera
            como <b>ruido</b> los puntos fuera de esas zonas con los ajustes elegidos. No hay que decirle cuántos grupos buscar: eso sale de la{' '}
            <G k="densidad">densidad</G> de los datos.
          </p>
          <section className="mlx-hyperparameter-guide mlx-settings-guide" aria-label="Hiperparámetros de DBSCAN">
            <h4>Qué puedes ajustar</h4>
            <p>Los <G k="hiperparametro">hiperparámetros</G> definen qué significa estar cerca y cuánta concentración hace falta. La cantidad de grupos es un resultado, no un K que eliges.</p>
            <div className="mlx-settings-guide-grid">
              <section className="mlx-settings-guide-card">
                <h5>¿Hasta dónde miras alrededor?</h5>
                <code className="mlx-settings-guide-api">eps · ε</code>
                <p><G k="epsilon">eps</G> es el radio del vecindario, no el diámetro máximo del grupo.</p>
                <p>Un radio pequeño puede dejar mucho ruido; uno grande puede unir zonas que querías separar.</p>
                <details><summary>El grupo puede ser más largo que eps</summary><p>Los núcleos se encadenan entre vecinos. Los extremos de una cadena pueden estar mucho más lejos que eps y pertenecer al mismo grupo.</p></details>
              </section>
              <section className="mlx-settings-guide-card">
                <h5>¿Cuántos ejemplos hacen un núcleo?</h5>
                <code className="mlx-settings-guide-api">min_samples · minPts</code>
                <p><G k="minPts">min_samples</G> cuenta al propio punto. Con 4 hacen falta él y otros 3 dentro del radio.</p>
                <p>Subirlo exige mayor concentración local; un punto puede pasar de núcleo a borde o ruido.</p>
                <details><summary>No todos los miembros son núcleos</summary><p>Un <G k="puntoNucleo">punto de borde</G> entra por estar cerca de un núcleo aunque no alcance el mínimo. Solo los núcleos continúan la expansión.</p></details>
              </section>
              <section className="mlx-settings-guide-card">
                <h5>¿Cómo mides la cercanía?</h5>
                <code className="mlx-settings-guide-api">metric · p</code>
                <p>La <G k="dbMetrica">métrica</G> define los vecinos: la OVA permite comparar línea recta y suma de diferencias por eje.</p>
                <p>El mismo eps puede dar grupos distintos si cambia la distancia o la escala.</p>
                <details><summary>Unidades y otras métricas</summary><p>Con <code>metric="minkowski"</code>, p=2 es euclidiana y p=1 es Manhattan. P no cambia haversine. En el ejercicio, <G k="haversine">haversine</G> usa coordenadas y eps en radianes, con conversión explícita desde metros.</p></details>
              </section>
              <section className="mlx-settings-guide-card">
                <h5>¿Cómo se consultan los vecinos?</h5>
                <code className="mlx-settings-guide-api">algorithm · leaf_size</code>
                <p>El <G k="dbBusqueda">método de búsqueda</G> organiza las consultas. La OVA compara todos los puntos.</p>
                <p>El tamaño de hoja afecta a los índices y su costo, no al mínimo de densidad.</p>
                <details><summary>Rendimiento y pesos en Python</summary><p><code>n_jobs</code> configura el paralelismo de la búsqueda; no pide más grupos. <code>sample_weight</code> se pasa a fit y cambia el conteo por una suma de pesos. Aquí cada punto pesa 1.</p></details>
              </section>
            </div>
            <section className="mlx-settings-guide-practice" aria-label="Comparación guiada en la OVA">
              <h5>Pruébalo en la OVA</h5>
              <p>Activa «Mostrar resultado final» y cambia una cosa a la vez:</p>
              <ol>
                <li><b>Radio:</b> conserva euclidiana y min_samples=4. Compara eps=0.8, 1.0 y 1.1.</li>
                <li><b>Mínimo:</b> vuelve a eps=1.0 y compara min_samples=4 con 6.</li>
                <li><b>Distancia:</b> restablece los ajustes y activa el resultado final. Cambia euclidiana por Manhattan; examina un punto y cuenta sus vecinos.</li>
              </ol>
              <p>El recorrido y la velocidad son <G k="controlDidactico">controles de visualización</G>. No son iteraciones para ajustar <G k="centroide">centroides</G> ni arranques como en K-Means.</p>
            </section>
            <p>Revisa el <G k="escalado">escalado</G> y las unidades antes de elegir eps. La OVA usa coordenadas sintéticas; eps=1 no significa un metro.</p>
          </section>
          <p>
            <b>¿Cómo se evalúa sin respuestas?</b> Mirando cuántos grupos y cuánto ruido salen al cambiar eps, min_samples y la distancia, y revisando en un mapa o gráfico si tienen sentido. La <G k="silueta">silueta</G> favorece grupos compactos y separados, por lo que puede penalizar formas curvas. Si la calculas, explica cómo tratas el ruido y qué puntos quedan fuera.
          </p>
        </>
      ),
      deepDive: (
        <p>
          DBSCAN viene de <i>Density-Based Spatial Clustering of Applications with Noise</i>: agrupamiento espacial
          basado en densidad para datos con ruido (Ester y otros, 1996). Como alternativa,{' '}
          <G k="hdbscan" after=",">HDBSCAN</G> explora una jerarquía de densidades y selecciona grupos persistentes; OPTICS, también en scikit-learn, es
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
            <li>Señalar lecturas fuera de grupos densos para investigarlas; el ruido no confirma una <G k="anomalia">anomalía</G>.</li>
            <li>Separar objetos en nubes de puntos de un escáner láser (LiDAR).</li>
          </ul>
          <p className="mlx-rule">Si buscas zonas densas conectadas sin fijar su cantidad y admites puntos fuera de grupos, DBSCAN es un candidato.</p>
        </>
      ),
      deepDive: (
        <p>
          Un índice compatible puede reducir el costo de las consultas, pero depende de la distancia y los datos. En scikit-learn se almacenan vecindarios: con eps grande, la memoria puede crecer hasta el orden de n². Mide tiempo y memoria antes de escalar. Con muchas <G k="feature">features</G> las distancias se
          parecen todas y la densidad pierde sentido (ver <G k="altaDimension" after=").">alta dimensionalidad</G>
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
          <Tex block>{'\\begin{gathered} N_\\varepsilon(p) = \\{\\, q : d(p, q) \\le \\varepsilon \\,\\} \\\\ p \\text{ es núcleo si } |N_\\varepsilon(p)| \\ge \\text{minPts} \\end{gathered}'}</Tex>
          <p>
            Dos núcleos vecinos van al mismo grupo, y así se encadena todo el grupo. Un punto que no es núcleo pero
            está en el vecindario de uno es <G k="puntoNucleo" after=";">punto de borde</G> el resto es ruido.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Cada grupo es un conjunto maximal de puntos conectados por densidad. Los núcleos y el ruido no dependen del
          orden de los datos; un punto de borde vecino de dos grupos se queda con el primero que lo alcanza. En
          scikit-learn, <code>min_samples</code> cuenta el propio punto, como en el ejemplo. El costo es de una
          búsqueda de vecinos por punto: en total, del orden de <Tex>{'n \\log n'}</Tex> con índice espacial cuando el índice y los vecindarios permiten ese comportamiento,
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
            distancia con sentido. En el ejercicio se usa la <G k="haversine" after=",">distancia haversine</G> que mide
            sobre la Tierra a partir de latitud y longitud.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Para elegir ε se suele ordenar la distancia de cada punto a su vecino número minPts, contándose él
          mismo como el primero, y buscar el codo de esa curva. Para <G k="minPts" after=",">minPts</G> valores relacionados con el número de columnas pueden servir como candidatos iniciales, no como receta. En el ejercicio se usa 5 y se compara con 3 y 8, manteniendo eps=300 m.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Formas libres:</b> en el simulador, con distancia euclidiana, <G k="minPts">min_samples</G>=4 y <G k="epsilon">ε</G> = 1.0 encuentra las dos lunas
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
          El ruido señala posibles <G k="anomalia">anomalías</G> que requieren revisión. No todo <G k="outlier">outlier</G> queda fuera: puntos intermedios pueden formar puentes y unir zonas si cumplen la condición de densidad.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Sensible a <G k="epsilon" after=":">ε</G></b> en el simulador, con euclidiana y min_samples=4, con ε = 0.8 las dos lunas salen partidas en 4
            grupos; con 1.1 se funden en 1.
          </li>
          <li>
            <b>Sensible a <G k="minPts" after=":">minPts</G></b> con euclidiana y ε = 1.0, subir minPts de 4 a 6 pasa de 2 grupos y 4
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
          con 800 m quedan solo 2 zonas, porque dos de las tres se funden. <G k="hdbscan">HDBSCAN</G> es otra candidata ante densidades distintas; también necesita elegir sus propios ajustes.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses si los grupos tienen densidades muy distintas.</p>
          <p>
            Ejemplo: tiendas en el centro de una ciudad (muy juntas) y en pueblos cercanos (dispersas). Un ε pequeño
            deja los pueblos como ruido; uno grande junta todo el centro en un solo grupo. Puede no haber un único valor que separe ambas zonas como necesitas.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Tampoco conviene con muchas <G k="feature">features</G> (las distancias pierden contraste) ni cuando
          necesitas que cada punto quede en algún grupo: ahí sirve K-Means o el agrupamiento jerárquico. Para
          densidades distintas, <G k="hdbscan">HDBSCAN</G> u OPTICS (ambos en scikit-learn). DBSCAN no incluye una regla predict para asignar automáticamente nuevos puntos; reentrenar o extender la asignación requiere una decisión explícita.
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
            aislados. Con la <G k="haversine" after=",">distancia haversine</G> <G k="epsilon">ε</G> = 300 m y{' '}
            <G k="minPts">minPts</G> = 5, encuentra 3 zonas (62, 40 y 30 reportes) y deja 13 como ruido.
          </p>
          <p>
            En estos datos sintéticos, K-Means con K = 3 manda 17 de los 60 reportes de la avenida a otra zona y mete los 15
            aislados en algún grupo.
          </p>
        </>
      ),
      deepDive: (
        <p>
          La distancia haversine trabaja en radianes, así que ε también: 300 m son 0.3 km / 6371 km ≈ 0.000047 radianes (6371 km es el
          radio medio aproximado de la Tierra). La tabla adicional fija eps=300 m y cambia min_samples; otra confirma la conversión entre metros y radianes. Agrupar por cuadrículas puede ahorrar recursos, pero cambia la representación y puede cambiar los grupos.
        </p>
      ),
    },
  },
  Ova: DbscanOva,
  ovaTab: 'type',
  autoPlayOva: true,
  python: { code, expectedOutput, colabNotebook: 'dbscan' },
  inYourField: [
    { area: 'Civil', example: 'encontrar tramos de vía con muchos accidentes a partir de las coordenadas de cada reporte.' },
    { area: 'Eléctrica', example: 'separar lecturas anómalas de un medidor (ruido) de los patrones normales de consumo.' },
    { area: 'Topográfica', example: 'separar objetos (árboles, postes, edificios) en una nube de puntos de un escáner láser.' },
  ],
  alternatives: ['hierarchical-clustering', 'k-means'],
};

export default dbscan;
