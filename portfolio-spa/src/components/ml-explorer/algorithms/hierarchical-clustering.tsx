import { G } from '../Gloss';
import { Tex } from '../Tex';
import { HierarchicalOva } from '../ovas/HierarchicalOva';
import type { AlgorithmModule } from '../types';
import code from './python/hierarchical-clustering.py?raw';
import expectedOutput from './python/hierarchical-clustering.out.txt?raw';

const hierarchicalClustering: AlgorithmModule = {
  slug: 'hierarchical-clustering',
  row: {
    type: 'No supervisado',
    bestUse: 'Conjuntos pequeños; ver la jerarquía de grupos',
    formula: 'Unir (o dividir) grupos paso a paso',
    assumptions: 'La medida de distancia tiene sentido',
    pros: 'No hay que fijar K de antemano; dendrograma',
    cons: 'Costoso en cálculo y memoria',
    whenNot: 'Conjuntos de datos grandes',
    realWorld: 'Análisis de genes, taxonomías',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>
              <G k="noSupervisado" after=":">No supervisado</G>
            </b>{' '}
            los datos no traen respuesta. El algoritmo agrupa lo parecido sin que nadie le diga qué grupos existen.
          </p>
          <p>
            En vez de dar un solo reparto, arma un <b>árbol de parecidos</b>: empieza con cada dato solo y une, paso a
            paso, los dos grupos más cercanos hasta tener uno. Ese árbol se dibuja como un{' '}
            <G k="dendrograma" after=",">dendrograma</G> y cortarlo a una altura da los grupos.
          </p>
          <p>
            <b>¿Cómo se evalúa sin respuestas?</b> Con pistas, no con un acierto: un salto grande de altura entre dos
            uniones sugiere un corte natural, y la <G k="cofenetica">correlación cofenética</G> dice qué tan fiel es el
            árbol a las distancias originales. Si los grupos tienen sentido, lo decide quien conoce los datos.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Esta es la versión aglomerativa (de abajo hacia arriba), la de scipy y de <code>AgglomerativeClustering</code>{' '}
          en scikit-learn. Existe la divisiva (de arriba hacia abajo, partiendo el grupo total), mucho menos usada
          porque cada partición es costosa.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo con <b>conjuntos pequeños o medianos</b> (hasta unos miles de datos) cuando quieres ver{' '}
            <b>grupos dentro de grupos</b> o no sabes cuántos grupos buscar.
          </p>
          <ul>
            <li>Agrupar genes con patrones de expresión parecidos.</li>
            <li>Armar taxonomías: especies, productos, documentos.</li>
            <li>Explorar unos cientos de clientes o máquinas antes de decidir cuántos segmentos crear.</li>
          </ul>
          <p className="mlx-rule">Si necesitas ver toda la jerarquía y tienes pocos miles de datos o menos, este es el algoritmo.</p>
        </>
      ),
      deepDive: (
        <p>
          Acepta cualquier medida de distancia, no solo la euclidiana: en el ejercicio se usa 1 − correlación, que
          junta genes que suben y bajan a la vez aunque uno se exprese el triple que otro. K-Means no permite eso,
          porque necesita promediar.
        </p>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> cuatro puntos sobre una recta, en 0, 1, 5 y 7. Primero se unen 0 y 1 (distancia 1).
            Luego 5 y 7 (distancia 2). Al final se unen los dos grupos: la distancia entre ellos es el promedio de las
            4 distancias entre sus puntos, (5 + 7 + 4 + 6) / 4 = 5.5. Esas tres alturas (1, 2 y 5.5) son las del{' '}
            <G k="dendrograma" after=".">dendrograma</G>
          </p>
          <p>
            Esa regla para medir la distancia entre grupos se llama <G k="enlace" after=".">enlace</G> Con enlace promedio:
          </p>
          <Tex block>{'d(A, B) = \\frac{1}{|A|\\,|B|} \\sum_{a \\in A} \\sum_{b \\in B} d(a, b)'}</Tex>
          <p>
            <Tex>{'|A|'}</Tex> y <Tex>{'|B|'}</Tex> son los tamaños de los grupos. En cada paso se unen los dos grupos
            con menor <Tex after=".">{'d(A, B)'}</Tex> Cortar el árbol a la altura <Tex>{'h'}</Tex> deja juntos los grupos que
            se unieron por debajo de <Tex after=".">{'h'}</Tex>
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Otros enlaces: simple (la distancia entre los dos puntos más cercanos), completo (entre los más lejanos) y
            Ward (cuánto crece la varianza dentro del grupo al unirlos). El simple tiende a formar cadenas largas; Ward
            y el completo, grupos compactos. Ward solo tiene sentido con distancia euclidiana.
          </p>
          <p>
            Hay que guardar la distancia entre todos los pares: con n puntos, <Tex>{'n(n-1)/2'}</Tex> distancias.
            Con 10 000 puntos son unos 50 millones (unos 400 MB). El tiempo crece como <Tex>{'n^2'}</Tex> en los
            mejores algoritmos y como <Tex>{'n^3'}</Tex> en la versión directa.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone que <b>la medida de distancia refleja el parecido que te importa</b>. Todo el árbol sale de esa
            medida: si está mal elegida, los grupos no significan nada.
          </p>
          <p>
            En el ejercicio, dos genes se parecen si suben y bajan juntos en el tiempo, aunque uno se exprese mucho
            más que otro. Por eso se usa 1 − correlación y no la distancia en línea recta, que separaría un gen de
            otro solo por su nivel.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Con distancia euclidiana valen las mismas precauciones que en K-Means: <G k="escalado">escalar</G> las{' '}
          <G k="feature">features</G> y vigilar los <G k="outlier" after=".">outliers</G> También supone que una jerarquía tiene
          sentido: el árbol siempre anida los grupos (un grupo de 3 vive dentro de uno de 8), aunque los datos no lo
          hagan.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>No hay que fijar K antes:</b> se arma el árbol una vez y se corta donde convenga. En el simulador,
            cortar en cualquier altura entre 2.2 y 5.2 da los mismos 3 grupos.
          </li>
          <li>
            <b>Muestra la estructura completa:</b> el <G k="dendrograma">dendrograma</G> enseña qué grupos están cerca
            de cuáles y a qué distancia se unen.
          </li>
          <li>
            <b>Funciona con cualquier distancia:</b> correlación, distancia entre textos, entre secuencias de ADN.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Es determinista: con los mismos datos da siempre el mismo árbol (salvo empates exactos de distancia), sin
          arranques al azar como K-Means. La <G k="cofenetica">correlación cofenética</G> del ejercicio, 0.87, dice
          que el árbol respeta bien las distancias entre los 12 genes.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Costoso:</b> necesita la distancia entre todos los pares de datos. Con 10 000 datos son unos 50
            millones de distancias.
          </li>
          <li>
            <b>Las uniones no se deshacen:</b> si al principio une dos puntos que no debía, ese error queda en todo el
            árbol.
          </li>
          <li>
            <b>El resultado depende del <G k="enlace" after=":">enlace</G></b> simple, completo, promedio o Ward pueden dar
            árboles muy distintos con los mismos datos.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          En el simulador, el punto 12 queda entre dos grupos y termina unido al de la derecha a altura 2.15: un
          punto ambiguo se asigna igual que uno claro, sin aviso. Con datos grandes se agrupa primero con K-Means en
          unos cientos de grupos pequeños y luego se aplica el jerárquico a sus <G k="centroide" after=".">centroides</G>
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">No lo uses con decenas de miles de datos o más.</p>
          <p>
            Ejemplo: agrupar 100 000 clientes. Solo la tabla de distancias tendría unos 5 000 millones de valores
            (unos 40 GB), y un <G k="dendrograma">dendrograma</G> con 100 000 hojas no se puede leer. K-Means hace ese trabajo en segundos.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Tampoco es buena idea si los grupos tienen forma irregular y hay mucho ruido: el <G k="enlace">enlace simple</G> encadena
          grupos a través de los puntos de ruido y los demás enlaces cortan las formas largas. Ahí DBSCAN funciona
          mejor.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>Análisis de genes.</b> Los mapas de calor de expresión génica que se publican en biología suelen llevar
            un <G k="dendrograma">dendrograma</G> al lado: agrupa genes que se activan juntos, que suelen participar en el
            mismo proceso.
          </p>
          <p>
            El ejercicio simula 12 genes medidos en 8 momentos, con tres patrones: suben, bajan o tienen un pico. Con{' '}
            <G k="enlace">enlace promedio</G> y distancia 1 − correlación, cada patrón queda unido por debajo de 0.07
            de altura, y los patrones se unen mucho más arriba (0.96 y 1.48). Cortando en 3 grupos aparecen
            exactamente los tres patrones.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Cortando en 2 grupos, «pico» queda con «baja», pero casi por azar: el pico no se parece ni a «sube» ni a
          «baja» (distancia cercana a 1 con ambos), y el ruido lo inclina hacia «baja». «Sube» y «baja» son opuestos
          (distancia cercana a 2), por eso se unen de último. Con datos reales se miden miles de genes y se agrupan primero los más variables; el árbol
          completo de miles de hojas se revisa por ramas.
        </p>
      ),
    },
  },
  Ova: HierarchicalOva,
  python: { code, expectedOutput, colabNotebook: 'hierarchical-clustering' },
  inYourField: [
    { area: 'Biomédica', example: 'agrupar pacientes por sus perfiles de laboratorio para encontrar subtipos de una enfermedad.' },
    { area: 'Industrial', example: 'armar familias de piezas parecidas para planear celdas de manufactura.' },
    { area: 'Ambiental', example: 'agrupar estaciones de calidad del aire según cómo varían sus mediciones durante el día.' },
  ],
  alternatives: ['k-means', 'dbscan'],
};

export default hierarchicalClustering;
