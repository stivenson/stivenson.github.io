import { G } from '../Gloss';
import { Tex } from '../Tex';
import { KMeansOva } from '../ovas/KMeansOva';
import type { AlgorithmModule } from '../types';
import code from './python/k-means.py?raw';
import expectedOutput from './python/k-means.out.txt?raw';

const kMeans: AlgorithmModule = {
  slug: 'k-means',
  row: {
    type: 'No supervisado',
    bestUse: 'Segmentación de clientes',
    formula: 'Minimizar la varianza dentro de cada grupo',
    assumptions: 'Grupos esféricos y de tamaño parecido',
    pros: 'Simple y rápido',
    cons: 'Hay que elegir K; sensible a outliers',
    whenNot: 'Grupos con formas no esféricas',
    realWorld: 'Segmentación de mercado',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>
              <G k="noSupervisado" after=":">No supervisado</G>
            </b>{' '}
            los datos <b>no traen respuesta</b>. Nadie le dice al algoritmo a qué grupo pertenece cada cliente; tiene
            que descubrir los grupos <G before="(" k="cluster" after=")">clusters</G> solo, a partir de qué tan parecidos son.
          </p>
          <p>
            K-Means reparte los datos en <b>K grupos</b>, con K elegido por ti. Cada grupo queda representado por su{' '}
            <G k="centroide" after=",">centroide</G> el punto promedio de sus miembros.
          </p>
          <section className="mlx-hyperparameter-guide mlx-settings-guide" aria-label="Hiperparámetros de K-Means">
            <h4>Qué puedes ajustar</h4>
            <p>Los <G k="hiperparametro">hiperparámetros</G> deciden cuántos grupos buscar, cómo arrancar y cuándo detenerse. Los centroides se aprenden después.</p>
            <div className="mlx-settings-guide-grid">
              <section className="mlx-settings-guide-card">
                <h5>¿Cuántos grupos buscas?</h5>
                <code className="mlx-settings-guide-api">n_clusters</code>
                <p><G k="kmGrupos">K</G> es el número de centros. Aquí cuenta grupos; en KNN cuenta vecinos. No cuenta iteraciones.</p>
                <p>Compara varios K: más grupos pueden separar perfiles útiles o fragmentarlos demasiado.</p>
              </section>
              <section className="mlx-settings-guide-card">
                <h5>¿Dónde empiezan los centros?</h5>
                <code className="mlx-settings-guide-api">init</code>
                <p>La <G k="kmInicio">inicialización</G> ubica las primeras cruces. <code>random</code> sortea ejemplos; <G k="kmeansPP">k-means++</G> favorece puntos alejados de los centros ya elegidos.</p>
                <details><summary>La semilla permite repetir</summary><p><code>random_state</code> fija el azar en Python. No mejora por sí solo los grupos. En la OVA, A/B son semillas de su propio generador.</p></details>
              </section>
              <section className="mlx-settings-guide-card">
                <h5>¿Cuántos arranques pruebas?</h5>
                <code className="mlx-settings-guide-api">n_init</code>
                <p>Los <G k="kmArranques">arranques independientes</G> exploran distintos centros iniciales. Se conserva el de menor inercia final.</p>
                <p>Más arranques implican más trabajo; no garantizan el óptimo global.</p>
                <details><summary>Qué significa n_init="auto"</summary><p>En scikit-learn, auto usa 1 arranque con k-means++ o centros explícitos, y 10 con random o una función de inicio. El ejercicio fija 10 para hacer explícita la comparación.</p></details>
              </section>
              <section className="mlx-settings-guide-card">
                <h5>¿Cuándo termina cada arranque?</h5>
                <code className="mlx-settings-guide-api">max_iter · tol</code>
                <p><G k="kmParada">max_iter y tol</G> controlan la parada: límite de iteraciones y tolerancia al movimiento de los centros.</p>
                <p>Puede parar antes del límite. Agotar max_iter no demuestra convergencia.</p>
                <details><summary>Cómo interpretar la tolerancia</summary><p>Una tol mayor permite terminar con más movimiento residual. No mide acierto. Detenerse antes de estabilizarse puede dejar centros que aún no son el promedio de las asignaciones finales.</p></details>
              </section>
            </div>
            <section className="mlx-settings-guide-practice" aria-label="Comparación guiada en la OVA">
              <h5>Pruébalo en la OVA</h5>
              <p>Activa «Mostrar resultado final» y conserva los demás ajustes:</p>
              <ol>
                <li><b>Inicio:</b> con K=3, init aleatorio y n_init=1, compara las semillas A y B.</li>
                <li><b>Arranques:</b> conserva B y aumenta n_init. Mira la inercia de cada ejecución en el desplegable.</li>
                <li><b>Parada:</b> restablece A y un arranque. Compara max_iter=1 con 20; luego prueba tol=0.1 y lee el motivo de parada.</li>
              </ol>
              <p>Una iteración actualiza un arranque; n_init repite el entrenamiento desde otro inicio. La velocidad es un <G k="controlDidactico">control de visualización</G>.</p>
            </section>
            <p>El <G k="escalado">escalado</G> decide el peso de cada eje en la distancia. La OVA usa dos coordenadas 0–10; Python estandariza gasto y visitas antes de agrupar.</p>
            <details className="mlx-settings-guide-scope"><summary>Otros ajustes y diferencias con Python</summary>
              <p><code>algorithm="lloyd"</code> asigna y promedia; <code>elkan</code> busca acelerar con más memoria. La OVA fija Lloyd y pesos iguales. Su k-means++ clásico y su azar no reproducen exactamente los de scikit-learn.</p>
            </details>
          </section>
          <p>
            <b>¿Cómo se evalúa sin respuestas?</b> No hay «acierto» que medir. Se mira qué tan apretados quedan los
            grupos (la <G k="inercia" after=")">inercia</G> y qué tan separados están entre sí (la <G k="silueta" after=").">silueta</G>{' '}
            Ninguna de las dos dice si los grupos sirven para tu negocio: eso lo decide alguien que conozca los datos.
          </p>
        </>
      ),
      deepDive: (
        <p>
          El mínimo posible de inercia no aumenta al subir K; con un centro por punto distinto puede llegar a 0. Los arranques prácticos pueden atascarse. Por eso no sirve sola para
          elegir K: se busca el punto donde deja de bajar mucho, el <G k="codo" after=".">método del codo</G> La silueta sí
          puede empeorar con K de más. En el ejercicio, ambas apuntan a K = 3; con datos reales muchas veces no hay
          un codo claro. Y ojo: la <G k="silueta">silueta</G> también premia los grupos redondos, así que con formas
          alargadas puede preferir un reparto peor.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo para <b>dividir muchos datos en grupos compactos</b> cuando tienes una idea de cuántos grupos buscas.
          </p>
          <ul>
            <li>Segmentar clientes por gasto y frecuencia de compra.</li>
            <li>Agrupar documentos o productos parecidos para recomendarlos juntos.</li>
            <li>Reducir los colores de una imagen a K colores representativos.</li>
          </ul>
          <p className="mlx-rule">
            Si buscas grupos redondeados y puedes proponer un K, K-Means es un buen candidato inicial; mide costo y utilidad con tus datos.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Cada paso cuesta del orden de n × K × d operaciones (puntos × grupos × <G k="feature" after="),">features</G> por iteración y por arranque. El costo total crece también con n_init y las iteraciones; mide tiempo y memoria antes de escalar. Con muchos datos, <code>MiniBatchKMeans</code> actualiza los{' '}
          <G k="centroide">centroides</G> con lotes pequeños (y con <code>partial_fit</code> puede recibirlos por
          partes).
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> cuatro clientes con gasto 1, 2, 9 y 10, y K = 2. Los <G k="centroide">centroides</G>{' '}
            arrancan en 1 y en 2. Al arrancar, cada cliente va al centroide más cercano: el 1 queda solo y el 2, el 9 y
            el 10 van juntos. Paso 1: cada centroide se mueve al promedio de su grupo (1 y 7) y se reasigna; ahora el 2
            está más cerca del 1, y los grupos quedan {'{1, 2}'} y {'{9, 10}'}. Paso 2: los centroides se mueven a 1.5
            y 9.5, nadie cambia de grupo y el algoritmo para.
          </p>
          <p>
            Lo que minimiza es la <G k="inercia" after=":">inercia</G> la suma de las distancias al cuadrado de cada punto a su
            centroide. Al final del ejemplo vale 0.25 × 4 = 1.
          </p>
          <Tex block>{'J = \\sum_{i=1}^{n} \\lVert x_i - \\mu_{c(i)} \\rVert^2'}</Tex>
          <p>
            <Tex>{'x_i'}</Tex> es cada punto, <Tex>{'c(i)'}</Tex> el grupo al que lo asignaste y{' '}
            <Tex>{'\\mu_{c(i)}'}</Tex> el centroide de ese grupo. El simulador muestra los dos pasos que se repiten:
            asignar y mover.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Es el algoritmo de Lloyd. Cada paso no puede subir <Tex after=":">{'J'}</Tex> asignar al centroide más cercano lo
            baja o lo deja igual, y el promedio es el punto que minimiza la suma de distancias al cuadrado de un grupo.
            La implementación también impone un límite de iteraciones y una tolerancia. Detenerse por ese límite no demuestra que haya alcanzado un mínimo local.
          </p>
          <p>
            Cuando se estabiliza puede quedar en un <G k="minimoLocal" after=",">mínimo local</G> según el arranque. En el simulador, con K = 3
            el arranque A baja la inercia de 294.05 a 15.18 en 6 iteraciones con init aleatorio, n_init=1 y tol=0; el B se atasca en 123.31, 8 veces peor.
            El inicio por defecto de scikit-learn es <G k="kmeansPP" after=",">k-means++</G> que favorece centros separados sin garantizar el mejor resultado, y con <code>n_init=10</code> (como en el ejercicio) repite 10 arranques y se queda con la menor
            inercia. Ojo: desde la versión 1.4 el valor por defecto es <code>n_init="auto"</code>, que con k-means++
            hace un solo arranque.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone <b>grupos redondeados y de tamaño parecido</b>: cada punto va al <G k="centroide">centroide</G> más cercano, así que la
            frontera entre dos grupos es siempre una recta (un plano, con más features) a mitad de camino entre los
            dos centroides. Si los grupos son lunas, anillos o franjas
            largas, los corta mal (ver <G k="grupoGlobular" after=").">grupos globulares</G>
          </p>
          <p>
            También supone <b>que la distancia tiene sentido</b>: todas las <G k="feature">features</G> deben estar en
            escalas comparables. En el ejercicio el gasto está en cientos de miles de pesos y las visitas en unidades; sin{' '}
            <G k="escalado" after=",">escalarlas</G> el gasto taparía a las visitas.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Minimizar la <G k="inercia">inercia</G> es, en el fondo, suponer que cada grupo es una nube redonda con la misma dispersión en
          todas las direcciones. Con grupos elípticos, una mezcla gaussiana (<code>GaussianMixture</code>) con covarianzas adecuadas es otra candidata; compárala con los datos y el objetivo.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Simple:</b> dos pasos que se repiten (asignar y mover) y un resultado fácil de explicar: cada grupo es su
            promedio.
          </li>
          <li>
            <b>Costo controlable:</b> suele ser práctico con pocos grupos y columnas; más arranques e iteraciones aumentan el trabajo.
          </li>
          <li>
            <b>Grupos fáciles de describir:</b> en el ejercicio, cada <G k="centroide">centroide</G> se lee como un
            perfil de cliente (gasto 447 mil y 3.9 visitas al mes: compra poco pero caro).
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Los centroides sirven luego como resumen: para asignar un cliente nuevo basta calcular su distancia a K
          puntos. También se usa como paso previo de otros modelos, por ejemplo para crear una{' '}
          <G k="feature">feature</G> «segmento».
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Hay que elegir K:</b> el algoritmo da K grupos aunque los datos no los tengan. La{' '}
            <G k="inercia">inercia</G> y la <G k="silueta">silueta</G> ayudan, pero no deciden por ti.
          </li>
          <li>
            <b>Depende del arranque:</b> en el simulador, con K=3, init aleatorio y un solo arranque, B termina con una inercia unas 8 veces mayor que A.
          </li>
          <li>
            <b>Sensible a <G k="outlier" after=":">outliers</G></b> un punto muy lejano arrastra el promedio de su grupo y
            puede quedarse con un <G k="centroide">centroide</G> para él solo.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Contra el arranque: <G k="kmeansPP">k-means++</G> y varios arranques (<code>n_init</code>). Ante posibles
          outliers: revisa si son errores o casos válidos antes de excluirlos; compara K-Medoids (en la biblioteca scikit-learn-extra), que usa como centro un punto
          real del grupo, el que tiene menor distancia total a los demás, en vez del promedio. Para elegir K se comparan la <G k="silueta">silueta</G> y el{' '}
          <G k="codo">método del codo</G> con lo que tiene sentido para el negocio.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses si los grupos tienen formas alargadas, curvas o densidades muy distintas.</p>
          <p>
            Ejemplo: reportes de huecos concentrados a lo largo de una avenida. En el ejercicio de DBSCAN, K-Means con K
            = 3 manda 17 de los 60 reportes de la avenida al grupo de un barrio vecino y mete los 15 reportes aislados
            en alguna zona (el más lejano, a 2.2 km de su centro). DBSCAN sigue la forma de la franja y deja los
            aislados como ruido.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Tampoco conviene con <G k="feature">features</G> categóricas (el promedio de «Bogotá» y «Cali» no existe; para eso
          está K-Modes) ni cuando quieres ver grupos dentro de grupos: ahí el agrupamiento jerárquico muestra todos
          los niveles a la vez.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Segmentación de mercado.</b> Las empresas agrupan a sus clientes por gasto, frecuencia y antigüedad para
            diseñar una campaña por segmento en vez de una para todos.
          </p>
          <p>
            El ejercicio simula 300 clientes con dos <G k="feature">features</G> (gasto mensual y visitas al mes),
            las <G k="escalado">escala</G> y prueba K de 1 a 6. La <G k="inercia">inercia</G> cae de 600.0 a 250.0
            y a 39.5 hasta K = 3, y después apenas baja (33.8 con K = 4).
          </p>
          <p>
            La <G k="silueta">silueta</G> es máxima con K = 3 (0.79). Los tres segmentos: gasto bajo y pocas visitas
            (114 mil, 1.9 al mes), muchas visitas con gasto medio (301 mil, 11.5) y pocas visitas con gasto alto (447 mil, 3.9).
          </p>
          <p>Después fija K=3 y compara init y n_init. La última tabla conserva el mismo inicio explícito y cambia max_iter y tol: así puedes separar el efecto de la parada del efecto del azar. <code>n_iter_</code> cuenta iteraciones del arranque elegido, no el total de todos los arranques.</p>
        </>
      ),
      deepDive: (
        <p>
          En producción se suelen usar más features (antigüedad, categorías compradas, canal), escaladas, y se
          revisa que los segmentos sean estables: si al volver a entrenar el mes siguiente los grupos cambian mucho,
          no sirven para planear. Aquí los grupos salen tan limpios porque los datos se generaron con tres perfiles;
          con clientes reales la silueta suele ser bastante más baja.
        </p>
      ),
    },
  },
  Ova: KMeansOva,
  ovaTab: 'type',
  autoPlayOva: true,
  python: { code, expectedOutput, colabNotebook: 'k-means' },
  inYourField: [
    { area: 'Eléctrica', example: 'agrupar las curvas de consumo diario de los usuarios para diseñar tarifas por perfil.' },
    { area: 'Industrial', example: 'agrupar productos por volumen y frecuencia de pedido para organizar la bodega.' },
    { area: 'Civil', example: 'agrupar estaciones de medición de tráfico con patrones horarios parecidos.' },
  ],
  alternatives: ['dbscan', 'hierarchical-clustering'],
};

export default kMeans;
