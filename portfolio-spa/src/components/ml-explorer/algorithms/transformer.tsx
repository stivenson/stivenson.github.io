import { G } from '../Gloss';
import { Tex } from '../Tex';
import { TransformerOva } from '../ovas/TransformerOva';
import type { AlgorithmModule } from '../types';
import code from './python/transformer.py?raw';
import expectedOutput from './python/transformer.out.txt?raw';

const transformer: AlgorithmModule = {
  slug: 'transformer',
  row: {
    type: 'Supervisado y autosupervisado',
    bestUse: 'Texto y secuencias largas',
    formula: 'Self-attention: cada token pondera a todos los demás',
    assumptions: 'Muchísimos datos y mucho cómputo',
    pros: 'El estándar actual en lenguaje; se entrena en paralelo',
    cons: 'Muy costoso; puede inventar respuestas',
    whenNot: 'Pocos datos, poco cómputo o una tarea simple',
    realWorld: 'ChatGPT, traducción automática',
  },
  tabs: {
    type: {
      essential: (
        <>
          <p>
            <b>
              <G k="autosupervisado">Autosupervisado</G> y luego <G k="supervisado" after=":">supervisado</G>
            </b>{' '}
            primero aprende de enormes cantidades de texto sin etiquetar, adivinando palabras tapadas o la palabra
            siguiente; después se ajusta con pocos ejemplos etiquetados para una tarea concreta.
          </p>
          <p>
            Es la <G k="redNeuronal">red neuronal</G> detrás de los modelos de lenguaje actuales. Su pieza clave es la{' '}
            <G k="atencion" after=":">atención</G> para representar cada palabra, mira todas las demás de la frase a la vez, no
            una por una como una RNN.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Hay dos familias principales <G before="(" k="bertGpt" after=").">BERT y GPT</G> BERT lee la frase entera en ambas direcciones y
          sirve para clasificar y buscar. GPT lee de izquierda a derecha y aprende a predecir el siguiente{' '}
          <G k="token" after=";">token</G> con eso genera texto. El <G k="transformer">Transformer</G> original (2017) tenía las
          dos partes y se diseñó para traducir.
        </p>
      ),
    },
    bestUse: {
      essential: (
        <>
          <p>
            Úsalo con <b>texto</b> y con secuencias donde lo importante puede estar lejos: contratos, conversaciones,
            código, proteínas.
          </p>
          <ul>
            <li>Traducir, resumir o responder preguntas sobre documentos.</li>
            <li>Clasificar correos, reseñas o tickets de soporte por tema y urgencia.</li>
            <li>Buscar por significado y no por palabras exactas, comparando sus vectores.</li>
          </ul>
          <p className="mlx-rule">
            En la práctica no se entrena uno desde cero: se usa un modelo ya entrenado, por{' '}
            <G k="transferencia">ajuste fino</G> o con instrucciones.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            Entrenar un <G k="llm">modelo de lenguaje grande</G> cuesta millones de dólares en <G k="gpu" after=".">GPU</G>{' '}
            Ajustar uno pequeño de tipo <G k="bertGpt">BERT</G> a una clasificación de textos se hace con unos miles de
            ejemplos y una sola GPU.
          </p>
          <p>
            Los <G k="transformer">Transformers</G> también se usan con imágenes y audio, cortados en trozos que hacen
            de <G k="token" after=".">tokens</G>
          </p>
        </>
      ),
    },
    formula: {
      essential: (
        <>
          <p>
            <b>Ejemplo:</b> en «el banco del río», cada palabra tiene un <G k="embedding">embedding</G> de juguete con 4
            números: [función, cosa, dinero, naturaleza]. «Banco» es [0, 1, 1, 1] y «río» es [0, 1, 0, 2]. Su puntaje es
            el producto punto dividido por √4: (1 + 2) / 2 = 1.5. Con «el», 0.
          </p>
          <p>
            La <G k="softmax">softmax</G> convierte los puntajes de «banco» en pesos que suman 1: 0.09 para «el» y
            «del», 0.41 para «banco» y «río». La nueva versión de «banco» es el promedio de las cuatro palabras con esos
            pesos: queda con naturaleza 1.23 y dinero 0.41, inclinada hacia naturaleza.
          </p>
          <Tex block>
            {'\\text{Atención}(Q, K, V) = \\text{softmax}\\!\\left(\\frac{Q K^\\top}{\\sqrt{d}}\\right) V'}
          </Tex>
          <p>
            <Tex after=",">{'Q'}</Tex> <Tex>{'K'}</Tex> y <Tex>{'V'}</Tex> (consultas, claves y valores) salen de multiplicar los
            embeddings por tres matrices de pesos aprendidas; <Tex>{'d'}</Tex> es su número de columnas. En el ejemplo y
            en el simulador, las tres son los embeddings sin cambio.
          </p>
        </>
      ),
      deepDive: (
        <>
          <p>
            La <G k="atencion">atención</G> no ve el orden: si se invierte la frase, cada palabra sale igual. Por eso se
            suma a cada embedding una <G k="codificacionPosicional">codificación posicional</G> (senos y cosenos según
            la posición).
          </p>
          <p>
            Los modelos tipo <G k="bertGpt">GPT</G> añaden una <G k="mascaraCausal" after=":">máscara causal</G> cada token solo
            ve los anteriores, porque al generar texto el siguiente todavía no existe.
          </p>
          <p>
            Un bloque real tiene varias cabezas de atención en paralelo, cada una con sus matrices, seguidas de una capa
            densa. Los modelos apilan decenas de bloques. El costo de la atención crece con el cuadrado del número de{' '}
            <G k="token" after=":">tokens</G> el doble de texto cuesta cuatro veces más.
          </p>
        </>
      ),
    },
    assumptions: {
      essential: (
        <>
          <p>
            Supone <b>muchísimos datos y mucho cómputo</b>: no trae ideas previas sobre el orden ni sobre la vecindad,
            así que todo lo aprende de los ejemplos. Con pocos datos, modelos más simples le ganan.
          </p>
          <p>
            También supone que el texto cabe en su ventana: un número máximo de <G k="token">tokens</G> que lee de una
            vez. Lo que queda fuera no existe para el modelo.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Por eso casi nunca se entrena desde cero: se parte de un modelo preentrenado de forma{' '}
          <G k="autosupervisado">autosupervisada</G> con miles de millones de palabras, que ya captó patrones de
          gramática y muchas asociaciones, y se ajusta a la tarea.
        </p>
      ),
    },
    pros: {
      essential: (
        <ul>
          <li>
            <b>Contexto completo:</b> cada <G k="token">token</G> mira a todos los demás, estén a 2 o a 2 000 palabras,
            siempre que quepan en su ventana.
          </li>
          <li>
            <b>Se entrena en paralelo:</b> a diferencia de la RNN, procesa todos los tokens a la vez, y eso aprovecha
            bien la <G k="gpu" after=".">GPU</G>
          </li>
          <li>
            <b>Un modelo, muchas tareas:</b> el mismo modelo preentrenado sirve para traducir, resumir, clasificar o
            responder, con poco ajuste.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          El <G k="atencion">mapa de atención</G> se puede mirar, como en el simulador, pero con decenas de cabezas y
          capas no basta para explicar una decisión. En el ejercicio sí se lee: «banco» atiende 0.41 a «río» y sale con
          naturaleza 1.23; en «el banco cobra interés» sale con dinero 1.38.
        </p>
      ),
    },
    cons: {
      essential: (
        <ul>
          <li>
            <b>Muy costoso:</b> entrenar y servir modelos grandes exige <G k="gpu">GPU</G> y mucha energía.
          </li>
          <li>
            <b>Puede inventar:</b> genera texto probable, no verificado. Una cita o una cifra falsa dicha con seguridad
            es una <G k="alucinacion" after=".">alucinación</G>
          </li>
          <li>
            <b>Hereda los sesgos</b> del texto con que se entrenó, y es difícil saber por qué respondió lo que
            respondió.
          </li>
        </ul>
      ),
      deepDive: (
        <p>
          Para reducir las alucinaciones se le dan documentos de referencia junto con la pregunta y se le pide citar la
          fuente; aun así hay que comprobar lo importante. El costo cuadrático en la longitud limita cuántos{' '}
          <G k="token">tokens</G> lee de una vez.
        </p>
      ),
    },
    whenNot: {
      essential: (
        <>
          <p className="mlx-rule">
            No lo uses si la tarea es simple, hay pocos datos o necesitas una respuesta exacta y auditable.
          </p>
          <p>
            Ejemplo: separar spam con unos cientos de correos etiquetados. Naive Bayes o una regresión logística
            entrenan en un segundo y aciertan casi igual. Y para calcular una cifra, mejor una fórmula o una consulta a
            la base de datos que un <G k="llm" after=".">modelo de lenguaje</G>
          </p>
        </>
      ),
      deepDive: (
        <p>
          Con secuencias numéricas cortas, como sensores en un dispositivo pequeño, una RNN o un modelo de árboles es
          más barato. Con <G k="tabular" after=",">datos tabulares</G> los <G k="ensamble">ensambles</G> de árboles siguen siendo
          la primera opción.
        </p>
      ),
    },
    realWorld: {
      essential: (
        <>
          <p>
            <b>ChatGPT y la traducción automática.</b> El <G k="transformer">Transformer</G> nació en 2017 para
            traducir, en el artículo «Attention Is All You Need» («La atención es todo lo que necesitas»).
          </p>
          <p>
            <G k="llm">ChatGPT</G> es un modelo tipo <G k="bertGpt" after=":">GPT</G> predice el siguiente <G k="token">token</G>{' '}
            y fue ajustado para conversar.
          </p>
          <p>
            El ejercicio calcula a mano la <G k="atencion">atención</G> de 4 tokens. En «el banco del río», «banco»
            atiende 0.41 a «río» y sale con naturaleza 1.23; en «el banco cobra interés», con dinero 1.38. Con{' '}
            <G k="mascaraCausal" after=",">máscara causal</G> «banco» aún no ve «río». Al invertir la frase, «banco» cambia 0.00
            sin posición y 0.30 con ella.
          </p>
        </>
      ),
      deepDive: (
        <p>
          Un modelo de lenguaje, por sí solo, no consulta una base de datos de hechos: elige palabras probables. Por eso
          redacta y traduce con fluidez, pero puede <G k="alucinacion" after=".">alucinar</G> El notebook de Colab trae una celda
          opcional con la misma atención en <G k="pytorch" after=",">PyTorch</G> que da los mismos pesos.
        </p>
      ),
    },
  },
  Ova: TransformerOva,
  python: { code, expectedOutput, colabNotebook: 'transformer' },
  inYourField: [
    {
      area: 'Civil',
      example:
        'buscar en cientos de especificaciones técnicas el párrafo que responde una duda, por significado y no por palabra exacta.',
    },
    {
      area: 'Industrial',
      example: 'clasificar los reportes de fallas escritos por los operarios según el equipo y la causa probable.',
    },
    {
      area: 'Sistemas',
      example:
        'asistentes que sugieren código; el código que proponen hay que revisarlo y probarlo como cualquier otro.',
    },
  ],
  alternatives: ['naive-bayes', 'rnn'],
};

export default transformer;
