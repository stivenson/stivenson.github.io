---
title: "De la retina al tensor: preparar imágenes para entrenar una CNN"
date: "2026-09-02"
slug: "imagen-a-tensor-cnn-glaucoma"
description: "Qué es de verdad el formato que necesita una red convolucional —forma, rango, eje de canal y lote— explicado sobre imágenes de fondo de ojo para detección de glaucoma, y por qué el preprocesado decide qué atajos puede tomar el modelo."
tags: ["CNN", "Deep Learning", "Visión por Computador", "Python", "Glaucoma", "Preprocesado"]
---

<style>
/* ─────────────────────────────────────────────────────────────
   Piel de notebook — solo para este articulo.

   Se replica la ESTRUCTURA de Colab (barra con el nombre del .ipynb,
   canaleta con el contador de ejecucion, celdas de texto y de codigo
   separadas, bloque de salida sin cromo) pero con la paleta del sitio.
   El gris de Colab sobre el navy del portafolio chirria; el ambar de
   Colab se conserva como unico acento, que es lo que da el aire.

   Sin esto, `.markdown-content > *` mandaria el notebook entero a la
   columna de texto de 68ch. Se pide el tramo ancho, y la medida de
   lectura se devuelve a la prosa celda por celda.
   ───────────────────────────────────────────────────────────── */

.markdown-content > .colab-nb { grid-column: wide; }

.colab-nb {
  --nb-amber: #f9ab00;
  --nb-line: rgba(85, 170, 255, 0.15);
  --nb-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;

  margin: 26px 0 30px;
  border: 1px solid var(--nb-line);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(4, 3, 32, 0.34);
}

/* Barra de herramientas */
.colab-nb .nb-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 15px;
  border-bottom: 1px solid var(--nb-line);
  background: rgba(255, 255, 255, 0.032);
  font-family: var(--nb-mono);
  font-size: 12.5px;
  color: #9a9ac0;
}
.colab-nb .nb-bar::before {
  content: "";
  flex: none;
  width: 15px;
  height: 15px;
  border-radius: 4px;
  background: var(--nb-amber);
  box-shadow: inset 0 0 0 3.5px rgba(4, 3, 32, 0.55);
}
.colab-nb .nb-bar em {
  margin-left: auto;
  font-style: normal;
  font-size: 11px;
  opacity: 0.75;
}

/* Celdas. El hueco de la izquierda es la canaleta del contador. */
.colab-nb .nb-cell {
  position: relative;
  padding: 3px 18px 3px 54px;
}
.colab-nb .nb-cell + .nb-cell { border-top: 1px solid rgba(85, 170, 255, 0.07); }

.colab-nb .nb-code { background: rgba(0, 0, 0, 0.19); }

/* El numero de ejecucion vive en el Markdown (data-exec), no en el CSS. */
.colab-nb .nb-code::before {
  content: "[" attr(data-exec) "]";
  position: absolute;
  left: 9px;
  top: 20px;
  font-family: var(--nb-mono);
  font-size: 11px;
  color: var(--nb-amber);
  opacity: 0.85;
}

/* La prosa recupera su medida de lectura: es un articulo teorico y
   perder los 68ch por hacerlo bonito seria un mal cambio. */
.colab-nb .nb-md > p,
.colab-nb .nb-md > ul,
.colab-nb .nb-md > ol,
.colab-nb .nb-md > blockquote { max-width: 68ch; }

.colab-nb .nb-cell > h2:first-child,
.colab-nb .nb-cell > h3:first-child { margin-top: 18px; }

/* Salida de celda: sin cromo, como en Colab. */
.colab-nb .nb-out {
  margin: -6px 0 20px;
  padding: 10px 13px;
  border-left: 2px solid rgba(85, 170, 255, 0.28);
  border-radius: 0 5px 5px 0;
  background: rgba(0, 0, 0, 0.24);
  font-family: var(--nb-mono);
  font-size: 12.5px;
  line-height: 1.62;
  color: #a8b6cc;
  white-space: pre-wrap;
  overflow-x: auto;
}
.colab-nb .nb-out b { color: #e8e8f0; font-weight: 600; }
.colab-nb .nb-out .err { color: #f43f5e; }

/* Diagrama del flujo */
.flujo {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 4px 0 22px;
}
.flujo .fp {
  flex: 1 1 128px;
  padding: 9px 11px;
  border: 1px solid var(--nb-line);
  border-left: 3px solid var(--fc, #06b6d4);
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.028);
}
.flujo .fp b {
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  color: #e8e8f0;
}
.flujo .fp code {
  display: block;
  margin-top: 3px;
  font-family: var(--nb-mono);
  font-size: 10.5px;
  line-height: 1.5;
  color: #9a9ac0;
  background: none;
  border: 0;
  padding: 0;
}
.flujo .fp em {
  display: block;
  margin-top: 2px;
  font-style: normal;
  font-family: var(--nb-mono);
  font-size: 10px;
  color: var(--fc, #06b6d4);
}

/* Colores del articulo, usados tambien dentro de las OVAs. */
.c-px  { color: #06b6d4; }
.c-ok  { color: #10b981; }
.c-err { color: #f43f5e; }
.c-lbl { color: #a855f7; }
.c-cod { color: #f59e0b; }

/* ── Glosario emergente ──────────────────────────────────────
   Los terminos nuevos abren una ficha. Todo con CSS: un checkbox
   oculto y su etiqueta. Sin JavaScript, porque el Markdown se
   renderiza con React y un <script> incrustado no se ejecutaria;
   y sin anclas #, porque el sitio usa HashRouter y cambiar el
   hash lo sacaria del articulo. */

.gl { display: inline; }

.gl-c {
  position: absolute;
  width: 1px; height: 1px;
  opacity: 0;
  pointer-events: none;
}

.gl-t {
  color: var(--electric-cyan, #55AAFF);
  border-bottom: 1px dashed rgba(85, 170, 255, 0.5);
  cursor: pointer;
  transition: color 140ms ease, border-color 140ms ease;
}
.gl-t::after { content: "\00a0💡"; font-size: 0.85em; }
/* Termino que es un identificador de codigo. Se pinta aqui en vez de usar
   <code>, porque el renderer intercepta esa etiqueta y la trataria como
   bloque resaltado dentro de la propia etiqueta. */
.gl-t .gl-k { font-family: var(--nb-mono, monospace); font-size: 0.92em; }

/* Un identificador largo dentro de un parrafo no puede empujar la columna:
   se le permite partir aunque quede feo, antes que desbordar la pantalla. */
.colab-nb code { overflow-wrap: anywhere; }
.gl-t:hover { color: #8cc6ff; border-bottom-color: #8cc6ff; }
.gl-c:focus-visible + .gl-t { outline: 2px solid var(--electric-cyan, #55AAFF); outline-offset: 2px; }

.gl-m { display: none; }
.gl-c:checked ~ .gl-m {
  display: block;
  position: fixed;
  inset: 0;
  z-index: 90;
}

.gl-bg {
  position: absolute;
  inset: 0;
  background: rgba(2, 1, 14, 0.74);
  cursor: pointer;
}

.gl-b {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: min(430px, calc(100vw - 34px));
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 21px 23px 17px;
  border: 1px solid rgba(85, 170, 255, 0.3);
  border-radius: 12px;
  background: #0a0a2e;
  box-shadow: 0 18px 55px rgba(0, 0, 0, 0.62);
  text-align: left;
}
.gl-b > b {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  color: var(--electric-cyan, #55AAFF);
}
.gl-b > span {
  display: block;
  font-size: 14.5px;
  line-height: 1.62;
  color: #d8d8e8;
}
.gl-b > span + span { margin-top: 9px; }
.gl-b code {
  font-family: var(--nb-mono, monospace);
  font-size: 0.88em;
  color: #f59e0b;
}
.gl-x {
  display: inline-block;
  margin-top: 15px;
  padding: 6px 15px;
  border: 1px solid rgba(85, 170, 255, 0.35);
  border-radius: 999px;
  font-size: 12.5px;
  color: #9a9ac0;
  cursor: pointer;
  transition: color 140ms ease, border-color 140ms ease;
}
.gl-x:hover { color: #e8e8f0; border-color: var(--electric-cyan, #55AAFF); }

/* En movil el notebook sale a sangre. No basta con descontar
   --shell-pad-x: entre .rf-layout-main (8px), .page-shell (12px) y el
   contenedor del articulo (32px) hay 52px por lado, y ese ultimo no
   tiene token propio. Se usa el truco de 100vw, que da el ancho exacto
   de la pantalla sea cual sea el anidamiento. Como el notebook ya va a
   sangre, las OVAs de dentro no necesitan su propia regla. */
@media (max-width: 768px) {
  .markdown-content > .colab-nb {
    width: 100vw;
    max-width: none;
    margin-inline: calc(50% - 50vw);
    border-radius: 0;
    border-left: 0;
    border-right: 0;
  }
  .colab-nb .nb-cell { padding-left: 38px; padding-right: 14px; }
  .colab-nb .nb-bar { padding-inline: 14px; }
  .colab-nb .nb-code::before { left: 8px; }
  .gl-b { padding: 18px 19px 15px; }
}
</style>

<div class="colab-nb">

<div class="nb-bar">glaucoma_preprocesado.ipynb <em>Python 3 · GPU T4</em></div>

<div class="nb-cell nb-md">

## Antes de empezar

Casi todo el material sobre redes convolucionales empieza en la arquitectura: cuántas capas, cuántos filtros, qué activación. Y el preprocesado se despacha en dos líneas, como si fuera fontanería:

```python
X_train, X_test = X_train / 255.0, X_test / 255.0
```

Con MNIST eso basta, porque MNIST viene resuelto: 70.000 imágenes, todas de 28×28, un solo canal, ya partidas en entrenamiento y prueba. Ese conjunto está *diseñado* para que el preprocesado no estorbe.

Un conjunto real no se parece a eso. Este artículo usa **ACRIMA**, 705 fotografías de fondo de ojo etiquetadas como glaucomatosas o normales, y en él vas a encontrar 258 tamaños distintos, la etiqueta escondida en el nombre del archivo, dos archivos que un `glob` mal escrito pierde en silencio, y —esto es lo importante— **pistas que permiten acertar el 86,8 % de los diagnósticos sin mirar un solo píxel de anatomía**.

La tesis del artículo es esa última parte:

> Una CNN no ve una imagen. Ve un **tensor**: forma fija, rango acotado, ejes en un orden concreto. Convertir un archivo en ese tensor no es fontanería — es donde decides **qué puede aprender el modelo y qué atajos le dejas tomar**.

Todo el código de aquí abajo vive también en un notebook ejecutable — **es el que se está socializando**, y se abre en Google Colab de un clic, sin instalar nada: [**`glaucoma_preprocesado.ipynb`**](https://colab.research.google.com/github/stivenson/stivenson.github.io/blob/main/notebooks/glaucoma_preprocesado.ipynb). Descarga los datos solo, corre entero con *Entorno de ejecución → Ejecutar todas*, y reproduce cada cifra de este artículo.

</div>

<div class="nb-cell nb-md">

<div class="flujo">
<div class="fp" style="--fc:#06b6d4"><b>1 · El archivo</b><code>Im318_g_ACRIMA.jpg</code><em>19.781 bytes comprimidos</em></div>
<div class="fp" style="--fc:#06b6d4"><b>2 · Decodificar</b><code>np.asarray(img)</code><em>(379, 379, 3) uint8</em></div>
<div class="fp" style="--fc:#22c1c3"><b>3 · Redimensionar</b><code>img.resize((224, 224))</code><em>(224, 224, 3) uint8</em></div>
<div class="fp" style="--fc:#3ecf9a"><b>4 · A decimales</b><code>x.astype("float32") / 255</code><em>rango [0, 1]</em></div>
<div class="fp" style="--fc:#10b981"><b>5 · Normalizar</b><code>(x - MEAN) / STD</code><em>centrado en 0</em></div>
<div class="fp" style="--fc:#10b981"><b>6 · Apilar</b><code>np.stack(imagenes)</code><em>(32, 224, 224, 3)</em></div>
</div>

Seis pasos. Los tres primeros deciden **qué información sobrevive**; los tres últimos, **en qué escala llega**. Vamos uno por uno, y al final volvemos a mirar el diagrama con otros ojos.

</div>

<div class="nb-cell nb-md">

## 1. El archivo no es la imagen

Un `.jpg` no contiene píxeles. Contiene **instrucciones para reconstruirlos**: coeficientes de una transformada del coseno, cuantizados y comprimidos. Es un formato de compresión, no un formato de datos.

Por eso `Image.open()` es tan rápido: no decodifica nada. Solo lee la cabecera y te devuelve un objeto perezoso. Los números aparecen cuando pides el array.

</div>

<div class="nb-cell nb-code" data-exec="1">

```python
# Celda con la importación de librerías

import numpy as np              # Librería para trabajar con datos matriciales
from PIL import Image           # Decodificación de imágenes

import os                       # Tamaño de los archivos en disco

# La imagen de ejemplo: una retina glaucomatosa del conjunto ACRIMA
ruta = "acrima_mini/Im318_g_ACRIMA.jpg"

img = Image.open(ruta)          # Todavía NO hay píxeles: solo la cabecera
print(f"Objeto perezoso  : {img}")
print(f"Bytes en disco   : {os.path.getsize(ruta):,}")

x = np.asarray(img)             # Aquí sí: se decodifica a una matriz de enteros
print(f"Bytes en memoria : {x.nbytes:,}")
print(f"Factor           : {x.nbytes / os.path.getsize(ruta):.1f}x")
```

<div class="nb-out">Objeto perezoso  : &lt;PIL.JpegImagePlugin.JpegImageFile image mode=RGB size=379x379&gt;
Bytes en disco   : 19,781
Bytes en memoria : 430,923
Factor           : <b>21.8x</b></div>

</div>

<div class="nb-cell nb-md">

Casi veintidós veces más grande al descomprimirse. Ese factor es la razón de que no puedas cargar el conjunto entero en memoria y ya: las 705 imágenes de ACRIMA ocupan **24 MB** en disco, **684 MB** como enteros y **2,7 GB** en cuanto las conviertes a `float32`.

De ahí salen los generadores y los `tf.data.Dataset`: no son una complicación gratuita, son la consecuencia de este número.

> 💡 **Lección clave:** el peso del archivo no te dice cuánta memoria necesitas. Lo que importa es `alto × ancho × canales × bytes_por_valor`.

</div>

<div class="nb-cell nb-md">

## 2. La imagen es un tensor

Lo que devuelve `np.asarray` es una <span class="gl"><input type="checkbox" id="gl-tensor" class="gl-c"><label for="gl-tensor" class="gl-t">matriz de tres dimensiones</label><span class="gl-m"><label for="gl-tensor" class="gl-bg"></label><span class="gl-b"><b>Tensor</b><span>Un <b>tensor</b> es simplemente un array de números con varias dimensiones. Un número suelto tiene 0; una lista, 1; una tabla, 2; una imagen en color, 3 (alto, ancho, canal), y un lote de imágenes, 4.</span><span>No hay nada más. Cuando alguien dice que “la red procesa tensores”, quiere decir que multiplica y suma bloques de números como este.</span><label for="gl-tensor" class="gl-x">Entendido</label></span></span></span>: alto, ancho y <span class="gl"><input type="checkbox" id="gl-canal" class="gl-c"><label for="gl-canal" class="gl-t">canal</label><span class="gl-m"><label for="gl-canal" class="gl-bg"></label><span class="gl-b"><b>Canal</b><span>Cada <b>canal</b> es una matriz completa de la imagen que mide una cosa distinta. En color hay tres —rojo, verde y azul— y apilarlas reconstruye la foto.</span><span>En escala de grises solo hay uno. Y después de una capa convolucional puede haber 32 o 64: ya no son colores, son mapas de “dónde aparece cada patrón que la red aprendió a buscar”.</span><label for="gl-canal" class="gl-x">Entendido</label></span></span></span>. Nada más. No hay “colores” ni “bordes” ni “disco óptico” — hay enteros entre 0 y 255 ordenados en una rejilla.

Merece la pena verlo de cerca una vez, porque después vas a pasar meses hablando de tensores sin volver a mirar uno. Acércate hasta que aparezcan los números, y prueba a aislar el canal verde:

</div>

<div class="nb-cell nb-md">

<iframe src="/ovas/retina-a-tensor.html" title="De la retina a los números: acércate hasta ver los valores de cada píxel" loading="lazy"></iframe>

Dos cosas que se ven ahí y que conviene retener.

La primera: **el canal verde es el que mejor contrasta la estructura vascular**. La hemoglobina absorbe fuertemente en esa banda, así que los vasos aparecen oscuros sobre un fondo claro y el contraste es el mayor de los tres. El rojo se satura —la retina *es* roja— y el azul apenas recibe luz. Por eso una parte de la literatura de fondo de ojo trabaja solo con `G`, y por eso pasar a escala de grises promediando los tres canales es peor que quedarse con el verde.

La segunda: entre `uint8` y `float32` normalizado no cambia el dibujo, cambia **la escala en la que la red recibe los números**. Y eso sí cambia el entrenamiento.

</div>

<div class="nb-cell nb-md">

## 3. El conjunto real: dónde está la etiqueta

Antes de tocar un píxel hay que resolver algo más aburrido y más peligroso: de dónde sale `y`.

En MNIST viene servido, `(X_train, y_train), (X_test, y_test) = mnist.load_data()`. En ACRIMA la etiqueta está **en el nombre del archivo**, y su documentación lo dice así: el nombre lleva `_g_` si la imagen es patológica y solo `_` si es normal.

Es decir: **la clase sana se identifica por ausencia**. Esto, que parece un detalle, es la primera trampa.

</div>

<div class="nb-cell nb-code" data-exec="2">

```python
import glob

# --- Lo que casi todo el mundo escribe la primera vez -----------------
rutas_mal = glob.glob("acrima_mini/*.jpg")
normales_mal = [r for r in rutas_mal if "_n_" in r]     # buscando la marca de "normal"

print(f"Imágenes encontradas : {len(rutas_mal)}")
print(f"Etiquetadas normales : {len(normales_mal)}")
```

<div class="nb-out">Imágenes encontradas : 58
Etiquetadas normales : <span class="err">0</span></div>

</div>

<div class="nb-cell nb-md">

Dos fallos a la vez, y ninguno lanza una excepción.

**Faltan dos imágenes.** El conjunto trae 60, pero dos archivos tienen la extensión en mayúsculas (`.JPG`). `glob("*.jpg")` distingue mayúsculas de minúsculas en Linux —el sistema donde corre Colab— y los descarta sin decir nada. En Windows los habría encontrado, lo que hace que el error aparezca solo al desplegar.

**No hay ni una imagen normal.** Como `_n_` no existe en ningún nombre, el filtro devuelve la lista vacía. Si a partir de ahí construyes `y`, te queda un vector de una sola clase y el modelo aprende a decir “glaucoma” siempre — con un *accuracy* excelente, que ya veremos por qué.

</div>

<div class="nb-cell nb-code" data-exec="3">

```python
from pathlib import Path

def cargar_rutas(carpeta):
    """
    Recoge las rutas de las imágenes y deduce la etiqueta del nombre del archivo.

    Parámetros de entrada:
    carpeta = ruta a la carpeta con las imágenes de ACRIMA

    Parámetros de salida:
    rutas = lista de rutas a las imágenes
    y     = np.array de enteros, 1 = glaucoma, 0 = normal
    """
    # Se recorre la carpeta entera y se filtra por sufijo en minúsculas:
    # así entran tanto .jpg como .JPG.
    rutas = sorted(p for p in Path(carpeta).iterdir()
                   if p.suffix.lower() in {".jpg", ".jpeg", ".png"})

    # La etiqueta es la PRESENCIA de "_g_"; lo normal se marca por ausencia.
    y = np.array([1 if "_g_" in p.name else 0 for p in rutas], dtype="int32")

    print(f"Imágenes encontradas    : {len(rutas)}")
    print(f"Datos por cada etiqueta : {np.bincount(y)}")
    print(f"Proporción de glaucoma  : {y.mean():.1%}")
    return rutas, y

rutas, y = cargar_rutas("acrima_mini")
```

<div class="nb-out">Imágenes encontradas    : <b>60</b>
Datos por cada etiqueta : [26 34]
Proporción de glaucoma  : <b>56.7%</b></div>

</div>

<div class="nb-cell nb-md">

> 💡 **Lección clave:** cuando la etiqueta vive en el nombre del archivo, el cargador de datos es código crítico. Cuenta siempre las clases justo después de construir `y`, y compáralo con lo que dice la documentación del conjunto. Un `np.bincount` de una línea te ahorra días.

Sobre el conjunto completo esa proporción es 396 glaucomatosas frente a 309 normales — **56,2 % contra 43,8 %**. Guárdate ese 56,2 %: va a volver.

</div>

<div class="nb-cell nb-md">

## 4. La forma fija: por qué hay que redimensionar

Las 705 imágenes de ACRIMA vienen en **258 tamaños distintos**, desde 178×178 hasta 1420×1420. Con esa arquitectura no puedes entrenar sobre ellas tal cual.

Y conviene entender por qué, porque casi siempre se explica mal. **Las <span class="gl"><input type="checkbox" id="gl-conv" class="gl-c"><label for="gl-conv" class="gl-t">capas convolucionales</label><span class="gl-m"><label for="gl-conv" class="gl-bg"></label><span class="gl-b"><b>Convolución</b><span>Una <b>convolución</b> desliza una ventanita de pesos —el <i>filtro</i> o <i>kernel</i>, típicamente de 3×3— por toda la imagen, y en cada posición multiplica y suma.</span><span>La gracia es que los mismos pesos se reutilizan en todas las posiciones: por eso una capa con 32 filtros de 3×3 sobre 3 canales necesita solo 896 parámetros, y por eso funciona igual sea cual sea el tamaño de la imagen.</span><label for="gl-conv" class="gl-x">Entendido</label></span></span></span> no necesitan un tamaño fijo**: un filtro de 3×3 se desliza igual sobre una imagen de 200 píxeles que sobre una de 1400. Lo que fija la entrada es lo que viene después: el <span class="gl"><input type="checkbox" id="gl-flatten" class="gl-c"><label for="gl-flatten" class="gl-t"><span class="gl-k">Flatten</span></label><span class="gl-m"><label for="gl-flatten" class="gl-bg"></label><span class="gl-b"><b>Flatten</b><span><b>Flatten</b> coge el bloque de activaciones que sale de las convoluciones —por ejemplo 28×28×32— y lo estira en un vector plano de 25.088 números, para poder enchufarlo a una capa densa.</span><span>Es el punto exacto donde el modelo deja de aceptar cualquier tamaño: ese 25.088 depende del tamaño de entrada, y la capa densa que viene después tiene un número de pesos fijo.</span><label for="gl-flatten" class="gl-x">Entendido</label></span></span></span> que aplana el mapa de activaciones antes de la capa densa. Esa capa densa tiene un número concreto de pesos, y ese número depende del tamaño de entrada.

Conviene ser preciso, porque hay dos exigencias distintas y solo una es negociable. Una red **totalmente convolucional** —la que sustituye el `Flatten` por un `GlobalAveragePooling2D`— sí admite imágenes de tamaños distintos, porque el promediado devuelve un vector cuya longitud es el número de filtros y no depende de la resolución. Lo que nunca es negociable es el **lote**: apilar 32 imágenes en un solo array obliga a que las 32 compartan forma. Así que redimensionar es inevitable para entrenar por lotes; que además lo exija la capa densa es cosa de esta arquitectura concreta.

Aquí es donde la decisión deja de ser fontanería. Esta es la arquitectura de un laboratorio típico de CNN, aplicada primero a MNIST y después, sin cambiar nada más que el tamaño de entrada, a fondo de ojo:

</div>

<div class="nb-cell nb-code" data-exec="4">

```python
import tensorflow as tf         # Importar TensorFlow
from tensorflow import keras    # Importar la API Keras de TensorFlow

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Input, Conv2D, MaxPooling2D, Flatten, Dense

# Establecer la semilla
np.random.seed(42)

# Establecer la semilla para el generador de TensorFlow
tf.random.set_seed(42)

def create_model(name, entrada, n_clases):
    """
    Construye la misma arquitectura convolucional para dos tamaños de entrada
    distintos, para poder comparar el número de parámetros.

    Parámetros:
    name     = nombre del modelo
    entrada  = tupla (alto, ancho, canales)
    n_clases = número de neuronas de salida

    Salida:
    model = modelo neuronal convolucional en tensorflow.keras
    """
    model = Sequential(name=name)
    model.add(Input(shape=entrada))

    # Primera capa convolucional: 16 filtros con kernel de 3x3.
    # Parámetros = 3*3*canales_entrada*16 + 16 (un sesgo por filtro).
    model.add(Conv2D(16, (3, 3), activation='relu', padding='same'))
    model.add(MaxPooling2D(pool_size=(2, 2)))

    # Segunda capa convolucional: 32 filtros de 3x3 sobre los 16 canales
    # anteriores. Parámetros = 3*3*16*32 + 32 = 4640, sea cual sea el tamaño.
    model.add(Conv2D(32, (3, 3), activation='relu', padding='same'))
    model.add(MaxPooling2D(pool_size=(4, 4)))

    # Aquí se rompe la independencia del tamaño: Flatten convierte el mapa
    # en un vector cuya longitud SÍ depende de las dimensiones de entrada.
    model.add(Flatten())
    model.add(Dense(100, activation='relu'))
    model.add(Dense(n_clases, activation='softmax'))
    return model

for etiqueta, entrada, n in [("MNIST ", (28, 28, 1), 10),
                             ("Retina", (224, 224, 3), 2)]:
    m = create_model(etiqueta.strip(), entrada, n)
    denso = m.get_layer(index=5).count_params()   # la capa Dense(100)
    print(f"{etiqueta} {str(entrada):16s} Flatten={m.get_layer(index=4).output.shape[1]:>6} "
          f"Dense(100)={denso:>10,}  total={m.count_params():>10,}")
```

<div class="nb-out">MNIST  (28, 28, 1)      Flatten=   288 Dense(100)=    28,900  total=    <b>34,710</b>
Retina (224, 224, 3)    Flatten= 25088 Dense(100)= 2,508,900  total= <b>2,514,190</b></div>

</div>

<div class="nb-cell nb-md">

**La misma arquitectura, letra por letra.** Solo cambia el tamaño de entrada, y los parámetros pasan de 34.710 a 2.514.190: **72 veces más**. Las capas convolucionales apenas notan el cambio —4.800 parámetros en MNIST y 5.088 en retina, y la diferencia son solo los dos canales de color extra del primer filtro—; los otros 2,5 millones están todos en una sola capa densa alimentada por el `Flatten`.

Ahora júntalo con la otra mitad del problema:

| | MNIST | ACRIMA a 224×224 |
|---|---|---|
| Imágenes de entrenamiento | 60.000 | 564 |
| Parámetros | 34.710 | 2.514.190 |
| **Parámetros por imagen** | **0,6** | **4.457** |

Siete mil veces peor. Eso no demuestra por sí solo que el modelo vaya a fallar, pero sí que tiene margen de sobra para <span class="gl"><input type="checkbox" id="gl-sobreajuste" class="gl-c"><label for="gl-sobreajuste" class="gl-t">memorizar</label><span class="gl-m"><label for="gl-sobreajuste" class="gl-bg"></label><span class="gl-b"><b>Sobreajuste</b><span>Hay <b>sobreajuste</b> cuando el modelo tiene tantos parámetros libres que puede almacenar las respuestas de las imágenes de entrenamiento en lugar de aprender la regla que las explica.</span><span>Se detecta mirando las dos curvas: el acierto en entrenamiento sigue subiendo mientras el de validación se estanca o empeora.</span><label for="gl-sobreajuste" class="gl-x">Entendido</label></span></span></span> las 564 imágenes en lugar de aprender la regla que las separa. El riesgo de sobreajuste es altísimo, y se confirma —o se descarta— de una sola manera: mirando las dos curvas de entrenamiento y validación y evaluando en una partición que el modelo no haya visto. Si el acierto de entrenamiento se acerca a 1 mientras el de validación se estanca, ya tienes la respuesta.

La salida no es entrenar más rato. Son tres decisiones, y las tres son de preprocesado o de arquitectura:

1. **Bajar el tamaño de entrada.** A 96×96, ese `Dense` cae a 460.900 parámetros.
2. **Cambiar `Flatten` por `GlobalAveragePooling2D`**, que promedia cada mapa de activación y devuelve un vector de longitud igual al número de filtros — 32, independientemente del tamaño de entrada. El modelo entero pasa a **8.590 parámetros**: 293 veces menos que con `Flatten`, y sigue aceptando imágenes de 224×224.
3. <span class="gl"><input type="checkbox" id="gl-transfer" class="gl-c"><label for="gl-transfer" class="gl-t">Aprendizaje por transferencia</label><span class="gl-m"><label for="gl-transfer" class="gl-bg"></label><span class="gl-b"><b>Aprendizaje por transferencia</b><span>Consiste en partir de una red ya entrenada con millones de imágenes genéricas y reaprovechar lo que aprendió: bordes, texturas, formas. Se congelan esas capas y solo se entrena una cabeza nueva para tu problema.</span><span>Con 705 imágenes es casi siempre la opción correcta, porque las capas útiles ya vienen ajustadas y tú solo estimas unos pocos miles de parámetros.</span><label for="gl-transfer" class="gl-x">Entendido</label></span></span></span>, que es lo que se hace de verdad con 705 imágenes: congelar un extractor ya entrenado y ajustar solo la cabeza.

> 💡 **Lección clave:** el tamaño al que redimensionas no es un parámetro estético. Multiplica o divide la capacidad del modelo, y con conjuntos pequeños esa es la diferencia entre aprender y memorizar.

</div>

<div class="nb-cell nb-md">

### Cómo se reduce importa

Reducir de 1420×1420 a 224 significa tirar el **97,5 %** de los píxeles. La forma de tirarlos no da igual.

- **`nearest`** toma un píxel de cada 6 y descarta el resto sin mirarlos. Los vasos finos —de uno o dos píxeles de ancho— aparecen rotos o desaparecen. Es <span class="gl"><input type="checkbox" id="gl-aliasing" class="gl-c"><label for="gl-aliasing" class="gl-t">aliasing</label><span class="gl-m"><label for="gl-aliasing" class="gl-bg"></label><span class="gl-b"><b>Aliasing</b><span>El <b>aliasing</b> aparece al reducir una imagen tomando muestras sueltas en lugar de promediar: los detalles más finos que el nuevo espaciado no desaparecen sin más, se convierten en patrones falsos.</span><span>Es el mismo efecto por el que las ruedas de un coche parecen girar hacia atrás en el cine, o por el que una camisa de rayas finas vibra en la pantalla.</span><label for="gl-aliasing" class="gl-x">Entendido</label></span></span></span>: estructura real que se pierde o, peor, que se convierte en un patrón falso.
- **`bilinear`** promedia los cuatro vecinos. Mejor, pero al reducir mucho sigue ignorando la mayoría de los píxeles del bloque de origen.
- **`area`** promedia *todos* los píxeles que caen en cada celda de destino. Es lo correcto al reducir mucho.

Y aquí hay una trampa que conviene no repetir. `tf.image.resize` usa **`bilinear` por defecto**, y `antialias=True` **no lo cambia a `area`**: lo que hace es ensanchar el filtro de muestreo del método que hayas elegido, para que tenga en cuenta los píxeles que de otro modo se saltaría. La documentación es explícita en que con `area` el argumento *no tiene ningún efecto*, porque ese método ya promedia todo. Así que hay dos formas correctas de reducir, y son distintas:

```python
# Bilinear con filtro antialias: el metodo sigue siendo bilinear.
x = tf.image.resize(img, [224, 224], antialias=True)

# Promediado por area: hay que pedirlo por su nombre.
x = tf.image.resize(img, [224, 224], method="area")
```

Hay algo más, y ACRIMA lo esquiva por suerte: sus imágenes son cuadradas. Un fondo de ojo completo no lo es. La imagen de HRF que verás abajo mide 3504×2336 —relación 3:2— y `resize((224, 224))` la **aplasta**. El disco óptico deja de ser redondo, y el <span class="gl"><input type="checkbox" id="gl-cd" class="gl-c"><label for="gl-cd" class="gl-t">cociente copa/disco</label><span class="gl-m"><label for="gl-cd" class="gl-bg"></label><span class="gl-b"><b>Cociente copa/disco</b><span>El <b>disco óptico</b> es la zona por donde el nervio óptico sale del ojo; se ve como un círculo claro. Dentro tiene una depresión central más pálida, la <b>copa</b>.</span><span>El glaucoma daña las fibras nerviosas, así que la copa tiende a agrandarse respecto al disco. La razón entre sus diámetros —el cociente copa/disco— es uno de los indicadores que mira un oftalmólogo, y por sí solo no diagnostica: depende del tamaño del disco (un disco grande y sano puede dar un cociente alto) y se interpreta junto al anillo neurorretiniano, la capa de fibras nerviosas, la presión intraocular y el campo visual.</span><label for="gl-cd" class="gl-x">Entendido</label></span></span></span>, que es *la* medida clínica del glaucoma, queda medido sobre una elipse deformada.

</div>

<div class="nb-cell nb-md">

<iframe src="/ovas/pipeline-imagen-cnn.html" title="El pipeline de preprocesado paso a paso, con la forma del tensor cambiando" loading="lazy"></iframe>

Prueba la retina de 3504×2336 con `nearest` y mira los vasos. Después cambia a `area`.

</div>

<div class="nb-cell nb-md">

## 5. El rango: normalizar, y dónde se calcula

Un <span class="gl"><input type="checkbox" id="gl-dtype" class="gl-c"><label for="gl-dtype" class="gl-t"><span class="gl-k">uint8</span></label><span class="gl-m"><label for="gl-dtype" class="gl-bg"></label><span class="gl-b"><b>uint8 y float32</b><span>El <b>tipo de dato</b> dice cuántos bits ocupa cada número y qué valores admite. <code>uint8</code> es un entero sin signo de 8 bits: exactamente 0 a 255, un byte por valor.</span><span><code>float32</code> es un decimal de 32 bits: ocupa cuatro veces más, pero admite negativos y fracciones. Por eso normalizar multiplica por cuatro la memoria que necesitas.</span><label for="gl-dtype" class="gl-x">Entendido</label></span></span></span> va de 0 a 255. Las redes no trabajan bien con eso: las activaciones se saturan, los gradientes se descompensan entre capas y el aprendizaje depende demasiado de la inicialización. Se pasa a decimales y <span class="gl"><input type="checkbox" id="gl-normalizar" class="gl-c"><label for="gl-normalizar" class="gl-t">se centra</label><span class="gl-m"><label for="gl-normalizar" class="gl-bg"></label><span class="gl-b"><b>Normalizar</b><span><b>Normalizar</b> es restar la media y dividir por la desviación típica, canal a canal, para que los valores queden repartidos alrededor de cero con una escala parecida.</span><span>Importa porque los gradientes que ajustan los pesos son proporcionales a la magnitud de las entradas: si un canal llega con valores 100 veces mayores que otro, domina el aprendizaje sin ninguna razón.</span><label for="gl-normalizar" class="gl-x">Entendido</label></span></span></span>.

Son dos operaciones distintas y conviene no confundirlas:

</div>

<div class="nb-cell nb-code" data-exec="5">

```python
# Paso 1 — escalar a [0, 1]. Es una constante: 255 es el máximo de un uint8,
# no una estadística del conjunto. Se puede aplicar antes de partir sin riesgo.
x = x.astype("float32") / 255.0

# Paso 2 — centrar y tipificar. OJO: estas constantes son las de torchvision,
# la convención de PyTorch. NO son universales (ver la celda siguiente).
MEAN = np.array([0.485, 0.456, 0.406], dtype="float32")
STD  = np.array([0.229, 0.224, 0.225], dtype="float32")

x = (x - MEAN) / STD

print(f"rango: {x.min():.2f} … {x.max():.2f}   media: {x.mean():.3f}")
```

<div class="nb-out">rango: -2.12 … 2.25   media: 0.617</div>

</div>

<div class="nb-cell nb-md">

La distinción importa mucho más de lo que parece. **Dividir entre 255 es seguro** porque 255 no se mide en tus datos: es el techo del tipo `uint8`. **Calcular la media y la desviación sobre el conjunto entero, en cambio, es medir tus datos** — y si lo haces antes de partir, las estadísticas de tus imágenes de prueba entran en el preprocesado del entrenamiento. Es una <span class="gl"><input type="checkbox" id="gl-fuga" class="gl-c"><label for="gl-fuga" class="gl-t">fuga</label><span class="gl-m"><label for="gl-fuga" class="gl-bg"></label><span class="gl-b"><b>Fuga de datos</b><span>Hay <b>fuga</b> cuando información del conjunto de prueba se cuela en el entrenamiento. El modelo aprovecha algo que en el mundo real no tendría, y su nota deja de predecir cómo se comportará.</span><span>Las dos formas típicas: calcular estadísticas de preprocesado sobre todos los datos antes de partir, y repartir imágenes del mismo paciente entre entrenamiento y prueba.</span><label for="gl-fuga" class="gl-x">Entendido</label></span></span></span> pequeña, pero es una fuga, y es gratis evitarla: calcula sobre entrenamiento, aplica a todo.

Si usas un modelo preentrenado, esa fuga desaparece: las constantes vienen del conjunto con el que se entrenó, no del tuyo. Pero aparece otro problema, y es más gordo de lo que parece.

**No hay un preprocesado estándar.** Las constantes de arriba son las de `torchvision`, la convención de PyTorch: escalar a `[0,1]` y tipificar por canal. Keras no hace eso por defecto. Cada familia de modelos trae su propia función `preprocess_input`, y en `keras.applications` conviven tres modos distintos:

| Modo | Qué hace | Rango de salida | Ejemplo |
|---|---|---|---|
| `caffe` | RGB→BGR y resta `[103.939, 116.779, 123.68]`. **No divide entre 255** | ≈ −124 … 151 | ResNet50, VGG16 |
| `tf` | Escala a `[-1, 1]` | −1 … 1 | MobileNet, Inception, EfficientNet |
| `torch` | Escala a `[0,1]` y tipifica con la media y desviación de arriba | ≈ −2,1 … 2,6 | DenseNet |

`ResNet50` usa **`caffe`**, que es el modo por defecto. O sea: si copias las constantes de un tutorial de PyTorch y se las das a un ResNet de Keras, el modelo recibe números en una escala que no ha visto nunca. Compruébalo siempre en la documentación de *tu* modelo:

</div>

<div class="nb-cell nb-code" data-exec="6">

```python
# El fallo más común de todos, y el más silencioso.
# preprocess_input de ResNet50 espera la imagen CRUDA en [0, 255]:
# ya se encarga él de pasar a BGR y restar la media. No hay que dividir antes.
from tensorflow.keras.applications.resnet50 import preprocess_input

# Se parte de la imagen sin tocar, ya redimensionada a 224x224.
cruda = np.asarray(Image.open(ruta).resize((224, 224)), dtype="float32")

x_bien = preprocess_input(cruda.copy())           # como se espera
x_mal  = preprocess_input(cruda.copy() / 255.0)   # ya dividida: preprocesada dos veces

for nombre, v in [("bien", x_bien), ("mal ", x_mal)]:
    print(f"{nombre} : {v.min():8.2f} … {v.max():8.2f}   amplitud {v.max() - v.min():7.2f}")
```

<div class="nb-out">bien :  -123.68 …   131.32   amplitud  255.00
mal  :  -123.68 …  <span class="err">-103.37   amplitud   20.31</span></div>

</div>

<div class="nb-cell nb-md">

Fíjate en la amplitud: pasa de **255 a 20**. Al haber dividido antes, toda la imagen entra en el rango `[0, 1]` y lo único que hace `preprocess_input` es restarle la media de ImageNet, así que las tres bandas se apilan en una franja estrecha y negativa. Todas las imágenes acaban pareciéndose entre sí.

Keras no protesta. El entrenamiento arranca, la pérdida baja un poco y se estanca. Ese es el aspecto que tiene este error.

En la OVA de arriba tienes el interruptor **“romper algo a propósito”**: pruébalo con `sin /255` y con `normalizar 2×` y mira qué le pasa al rango.

> 💡 **Lección clave:** los errores de rango no lanzan excepciones. Imprime `min`, `max` y `media` de un lote justo antes de `fit()`. Si no están donde esperas, no entrenes.

</div>

<div class="nb-cell nb-md">

## 6. El eje de canal, y la cuarta dimensión

Keras trabaja en **NHWC** (`channels_last`): lote, alto, ancho, canal. PyTorch usa NCHW. No hay ninguno mejor; son convenciones distintas heredadas de cómo se optimizó cada biblioteca, y lo único que importa es no mezclarlas.

Este es el motivo de esa línea que aparece en todos los laboratorios de MNIST y que nadie explica:

```python
# El resultado hay que guardarlo: reshape NO modifica el array original.
X_train = X_train.reshape((60000, 28, 28, 1))
```

MNIST se distribuye en escala de grises, así que su array llega con forma `(60000, 28, 28)` — sin eje de canal. `Conv2D` exige uno, y añadir un eje de longitud 1 no cambia ni un valor: solo declara “esto tiene un canal”. Sobre un array contiguo como este, NumPy devuelve una vista y no copia nada; en general `reshape` copia si no puede describir la nueva forma sobre la memoria existente.

Con imágenes en color no hace falta, porque el eje ya viene. Pero el error simétrico sí ocurre: convertir a escala de grises y perder el eje sin darte cuenta. A diferencia de los fallos de rango, **este sí revienta**, y hay que agradecerlo:

</div>

<div class="nb-cell nb-code" data-exec="7">

```python
def preparar(ruta, lado=224):
    """
    Aplica el pipeline completo a una imagen y devuelve su tensor.

    Parámetros de entrada:
    ruta = ruta a la imagen
    lado = tamaño de salida, en píxeles

    Parámetros de salida:
    x = np.ndarray (lado, lado, 3) float32, escalado y tipificado
    """
    img = Image.open(ruta).convert("RGB").resize((lado, lado))
    x = np.asarray(img, dtype="float32") / 255.0
    return (x - MEAN) / STD

lote = np.stack([preparar(r) for r in rutas[:32]])   # 32 imágenes ya preparadas

print(f"Tamaño del lote : {lote.shape}")
print(f"Tipo            : {lote.dtype}")
print(f"Memoria         : {lote.nbytes / 1024**2:.1f} MiB")
```

<div class="nb-out">Tamaño del lote : <b>(32, 224, 224, 3)</b>
Tipo            : float32
Memoria         : <b>18.4 MiB</b></div>

</div>

<div class="nb-cell nb-md">

18,4 MiB para 32 imágenes —19,3 MB si cuentas en potencias de diez— y eso es solo **la entrada**. Cada capa convolucional guarda su mapa de activaciones para poder calcular gradientes en la retropropagación, así que la memoria real durante el entrenamiento es varias veces esa cifra.

Por eso lo primero que se baja cuando la GPU se queda sin memoria es el tamaño de lote. Y por eso el tamaño de lote no es solo un hiperparámetro de optimización: es una restricción de hardware que acabas eligiendo por el tamaño al que decidiste redimensionar, tres pasos antes.

</div>

<div class="nb-cell nb-md">

## 7. Aumentación: solo en entrenamiento, y con criterio clínico

La <span class="gl"><input type="checkbox" id="gl-aug" class="gl-c"><label for="gl-aug" class="gl-t">aumentación</label><span class="gl-m"><label for="gl-aug" class="gl-bg"></label><span class="gl-b"><b>Aumentación de datos</b><span>Consiste en crear variantes artificiales de cada imagen de entrenamiento —voltearla, rotarla un poco, cambiar el brillo— para que el modelo vea más ejemplos distintos y le cueste más memorizar.</span><span>La transformación se aplica al vuelo y cambia en cada época, así que el modelo casi nunca ve dos veces exactamente la misma imagen.</span><label for="gl-aug" class="gl-x">Entendido</label></span></span></span> genera variantes de cada imagen para que el modelo no memorice. Con 564 imágenes de entrenamiento y 2,5 millones de parámetros no es opcional.

Dos reglas. La primera es absoluta: **la aumentación se aplica solo al conjunto de entrenamiento**. Validación y prueba se preprocesan igual que se preprocesará en producción, sin transformaciones aleatorias. Si aumentas la validación, tu métrica deja de medir nada reproducible.

La segunda es de dominio, y aquí es donde la mayoría de los tutoriales copian recetas de gatos y perros sin pensar:

| Transformación | En fondo de ojo | Por qué |
|---|---|---|
| Volteo horizontal | <span class="c-ok">**válida si la etiqueta no depende de la lateralidad**</span> | Convierte un ojo derecho en algo parecido a un izquierdo, y ambos existen en el conjunto. Deja de valer si tu variable objetivo distingue ojo izquierdo de derecho |
| Rotación suave (±10°) | <span class="c-ok">**segura**</span> | La cámara no siempre queda perfectamente alineada |
| Brillo y contraste leves | <span class="c-ok">**segura**</span> | La iluminación varía de verdad entre capturas |
| Volteo vertical | <span class="c-err">**dudosa**</span> | Invierte arriba y abajo. Los haces de fibras nerviosas tienen una orientación anatómica fija |
| Recorte agresivo | <span class="c-err">**peligrosa**</span> | Puede dejar fuera el borde del disco y el anillo neurorretiniano, donde está buena parte de la señal |
| Deformación de la relación de aspecto | <span class="c-err">**peligrosa**</span> | El cociente copa/disco es una razón geométrica. Estirar la imagen lo falsea |

El color merece un párrafo aparte, porque tiene dos caras. Un *color jitter* fuerte destruye señal: el aspecto del anillo neurorretiniano y la palidez del disco son parte de lo que mira el especialista, y eso es información cromática. Pero, como vas a ver ahora mismo, **en ACRIMA el color también es un atajo** — y una perturbación moderada es justo lo que impide que el modelo se agarre a él.

</div>

<div class="nb-cell nb-md">

## Hallazgo 1 — Por qué un accuracy alto no basta

Antes de celebrar cualquier cifra, la comparación obligatoria: <span class="gl"><input type="checkbox" id="gl-baseline" class="gl-c"><label for="gl-baseline" class="gl-t">el clasificador tonto</label><span class="gl-m"><label for="gl-baseline" class="gl-bg"></label><span class="gl-b"><b>Línea base</b><span>Una <b>línea base</b> es el modelo más tonto que se puede escribir, y sirve para saber qué significa una cifra. El clásico responde siempre la clase más frecuente sin mirar los datos.</span><span>En scikit-learn es <code>DummyClassifier</code>. Si tu red no le saca una ventaja clara, no ha aprendido nada aunque su acierto suene bien.</span><label for="gl-baseline" class="gl-x">Entendido</label></span></span></span>, el que ignora la imagen y responde siempre la clase mayoritaria.

Como el 56,2 % de ACRIMA es glaucoma, ese clasificador acierta el **56,2 %** sin mirar nada. Ese es el suelo real, no el 50 % que uno supone por costumbre.

Pero el suelo verdadero está mucho más arriba, y esto es lo que encontré al medir el conjunto entero:

</div>

<div class="nb-cell nb-code" data-exec="8">

```python
# ¿Cuánto se puede acertar SIN mirar la anatomía? Solo con el ancho del archivo.
# Se recargan las rutas y las etiquetas juntas, para que y corresponda
# siempre a las imágenes que se están midiendo.
rutas, y = cargar_rutas("acrima")          # ACRIMA completa, 705 imágenes

anchos = np.array([Image.open(r).size[0] for r in rutas])

print(f"ancho medio, glaucoma : {anchos[y == 1].mean():.1f} px")
print(f"ancho medio, normal   : {anchos[y == 0].mean():.1f} px")

# Mejor umbral posible sobre esa única variable, buscado sobre estas mismas
# imágenes. Es una cota superior optimista: ver la nota de abajo.
mejor = max(((anchos >= t) == (y == 1)).mean() for t in np.unique(anchos))

print(f"\nRegla 'si es grande, glaucoma' : {mejor:.1%}")
print(f"Clasificador tonto             : {np.bincount(y).max() / len(y):.1%}")
```

<div class="nb-out">ancho medio, glaucoma : 667.7 px
ancho medio, normal   : 352.9 px

Regla 'si es grande, glaucoma' : <b>86.8%</b>
Clasificador tonto             : 56.2%</div>

</div>

<div class="nb-cell nb-md">

**86,8 % con una sola comparación de números enteros.** `if ancho >= 427: "glaucoma"`. Sin abrir la imagen, sin ver un vaso, sin saber qué es un disco óptico.

Las imágenes glaucomatosas de ACRIMA miden 668 píxeles de lado de media; las normales, 353. Las dos clases se capturaron o se recortaron de maneras sistemáticamente distintas, y eso quedó grabado en las dimensiones del archivo. No es fraude ni descuido de los autores: es lo normal cuando un conjunto se compone reuniendo material clínico recogido en distintos momentos. Pero significa que **hay una vía para acertar que no pasa por la enfermedad**.

Ese umbral se elige mirando las mismas imágenes que luego se puntúan, así que sobreestima. La objeción es justa, y se responde midiendo: ajustando el umbral en el 70 % de las imágenes y evaluándolo en el 30 % restante, estratificado y promediando 200 particiones, el atajo del ancho sigue acertando el **86,1 % ± 2,0**, el del peso el **81,0 % ± 2,4** y el del color el **64,4 % ± 2,3**. No era un artefacto de la búsqueda.

El script que produce estas cuatro cifras está en el repositorio, es de una página y corre en unos segundos: [`datasets/medir_atajos.py`](https://github.com/stivenson/stivenson.github.io/blob/main/datasets/medir_atajos.py). Se le pasa la carpeta de imágenes y devuelve la tabla completa, in-sample y held-out.

Y aquí es donde el preprocesado deja de ser fontanería para siempre:

</div>

<div class="nb-cell nb-md">

<iframe src="/ovas/atajos-y-fuga.html" title="Qué está mirando tu modelo: los atajos medidos y la fuga por partición" loading="lazy"></iframe>

Pulsa **“tras redimensionar a 224×224”** y mira qué pasa.

Redimensionar **le quita a la red el acceso directo** a los atajos del ancho y del peso: cuando todas las entradas miden 224×224 y llegan como tensor, esa información ya no está en lo que el modelo ve. El paso que parecía puro trámite resulta ser la defensa principal contra el atajo más fuerte del conjunto.

Conviene no exagerarlo: borra el acceso directo, no toda la huella. Una imagen que venía de 1420 píxeles y otra que venía de 300 no llegan iguales a 224 — se diferencian en nitidez, en el ruido de compresión del JPEG original y en los artefactos que deja el propio reescalado. Un modelo con capacidad suficiente puede reaprender el origen por ahí.

Y el color **sobrevive sin más**. Un umbral sobre la diferencia media entre el canal rojo y el azul acierta el 65,7 % in-sample y el **64,4 %** en partición independiente — ocho puntos por encima del clasificador tonto, y redimensionar no lo toca. Las imágenes glaucomatosas de ACRIMA son sistemáticamente más anaranjadas.

> 💡 **Lección clave:** el preprocesado decide a qué atajos les quitas el acceso. Antes de creerte una métrica, mide qué acierta un modelo trivial que solo vea los metadatos: tamaño, peso, color medio. Si tu CNN no supera eso por un margen amplio, no has demostrado nada.

Un apunte sobre las cifras publicadas: los trabajos que usan ACRIMA reportan aciertos altos, pero para compararte con ellos hace falta saber **qué métrica** (`accuracy` y AUC no son intercambiables) y **con qué protocolo** — validación cruzada, partición fija, o partición por paciente. Sin esos dos datos, una cifra suelta no dice si el modelo es bueno o si está leyendo el ancho del archivo.

</div>

<div class="nb-cell nb-md">

## Hallazgo 2 — La partición que infla la nota

Hay un segundo atajo, y este no vive en las imágenes sino en cómo las repartes.

ACRIMA distribuye imágenes anónimas sin identificador de paciente, así que aquí el problema no se puede medir. Pero es el fallo más caro en imagen médica, y conjuntos como **PAPILA** —que publica los dos ojos de cada uno de sus 244 pacientes— existen precisamente para poder evitarlo.

El razonamiento es simple. Si partes tu conjunto **por imagen**, el ojo izquierdo de una persona puede caer en entrenamiento y el derecho en prueba. Esos dos ojos se fotografiaron el mismo día, con la misma cámara, con la misma iluminación, y comparten pigmentación, calibre de vasos y buena parte de la anatomía. Reconocer el segundo después de haber visto el primero no es diagnosticar: es recordar.

En el segundo panel de la OVA de arriba puedes ver cuántos pacientes acaban partidos entre los dos lados. La cuenta es sencilla: si cada imagen va a entrenamiento con probabilidad $p$, un paciente de dos ojos queda partido cuando sus ojos caen a lados distintos, y eso ocurre con probabilidad $2p(1-p)$.

Esa expresión es máxima justo en el reparto mitad y mitad que usa la OVA: $2 \cdot 0{,}5 \cdot 0{,}5 = 0{,}5$, o sea **4 de cada 8 pacientes partidos**. Con el 80/20 habitual —el que da las 564 imágenes de entrenamiento de este artículo— baja a $2 \cdot 0{,}8 \cdot 0{,}2 = 0{,}32$: un 32 % de los pacientes.

Pero el porcentaje de pacientes partidos no es lo que duele. Lo que duele es esto: para una imagen cualquiera del conjunto de prueba, la probabilidad de que el otro ojo del mismo paciente esté en entrenamiento es directamente $p$. Con un 80/20, **el 80 % de tus imágenes de prueba tiene a su gemela dentro del entrenamiento**. Al partir por paciente, cero.

La regla, sin excepciones: **agrupa por la unidad que quieres que el modelo generalice**. Si vas a diagnosticar personas, parte por persona. Nunca por imagen, nunca por ojo.

</div>

<div class="nb-cell nb-md">

## Resumen

Vuelve al diagrama del principio y míralo otra vez, ahora sabiendo qué hace cada paso:

| Paso | Lo que parece | Lo que de verdad decide |
|---|---|---|
| Decodificar | Abrir el archivo | El factor ×22 de memoria que define tu tamaño de lote |
| Redimensionar | Ajustar el tamaño | La capacidad del modelo (72×) y **qué atajos borras** |
| Interpolar | Un detalle | Si los vasos finos sobreviven o se convierten en ruido |
| Escalar `/255` | Un trámite | Nada. Es seguro: 255 es una constante del tipo |
| Normalizar | Un trámite | Una fuga, si calculas las estadísticas antes de partir |
| Eje de canal | Ceremonia de Keras | Lo único de esta lista que falla ruidosamente |
| Apilar el lote | Eficiencia | Tu límite de memoria en GPU |
| Partir | Lo de siempre | Si tu métrica significa algo |

Y la conclusión que da título al artículo: **una CNN no ve una imagen, ve un tensor**. Todo lo que hay entre el archivo y ese tensor es donde eliges qué información llega al modelo, y qué caminos fáciles le dejas para acertar sin aprender.

Si te llevas una sola cosa, que sea esta: antes de entrenar nada, comprueba qué acierta un clasificador trivial que solo vea el tamaño, el peso y el color medio de tus archivos. Es media hora de trabajo y te dice si tu problema es el que crees que es.

</div>

<div class="nb-cell nb-md">

## Referencias

**Los conjuntos de datos**

- Diaz-Pinto, A., Morales, S., Naranjo, V., Köhler, T., Mossi, J. M., & Navea, A. (2019). [CNNs for automatic glaucoma assessment using fundus images: an extensive validation](https://doi.org/10.1186/s12938-019-0649-y). *BioMedical Engineering OnLine*, 18(1), 29. — El conjunto ACRIMA, [publicado en figshare](https://doi.org/10.6084/m9.figshare.7613135) bajo CC BY 4.0.
- Budai, A., Bock, R., Maier, A., Hornegger, J., & Michelson, G. (2013). [Robust Vessel Segmentation in Fundus Images](https://doi.org/10.1155/2013/154860). *International Journal of Biomedical Imaging*. — La base [HRF](https://www5.cs.fau.de/research/data/fundus-images/), de donde sale la retina completa de 3504×2336.
- Kovalyk, O., Morales-Sánchez, J., Verdú-Monedero, R., Sellés-Navarro, I., Palazón-Cabanes, A., & Sancho-Gómez, J.-L. (2022). [PAPILA: Dataset with fundus images and clinical data of both eyes of the same patient for glaucoma assessment](https://doi.org/10.1038/s41597-022-01388-1). *Scientific Data*, 9, 291. — La referencia para partir por paciente.

**Preprocesado y fugas**

- LeCun, Y., Bottou, L., Bengio, Y., & Haffner (1998). [Gradient-based learning applied to document recognition](https://doi.org/10.1109/5.726791). *Proceedings of the IEEE*, 86(11). — El origen de MNIST y de la comparación de todo el artículo.
- Geirhos, R., Jacobsen, J.-H., Michaelis, C., Zemel, R., Brendel, W., Bethge, M., & Wichmann, F. A. (2020). [Shortcut Learning in Deep Neural Networks](https://doi.org/10.1038/s42256-020-00257-z). *Nature Machine Intelligence*, 2. — El marco teórico de lo que aquí llamo “atajos”.
- Kaufman, S., Rosset, S., Perlich, C., & Stitelman, O. (2012). [Leakage in Data Mining: Formulation, Detection, and Avoidance](https://doi.org/10.1145/2382577.2382579). *ACM TKDD*, 6(4).

**Documentación**

- [Módulo de imagen de Pillow](https://pillow.readthedocs.io/en/stable/reference/Image.html) — decodificación y `resize`.
- [`tf.image.resize`](https://www.tensorflow.org/api_docs/python/tf/image/resize) — el método por defecto es `bilinear`, `antialias` está en `False`, y la propia documentación avisa de que con `area` ese argumento no hace nada.
- [`preprocess_input` de ResNet en Keras](https://keras.io/api/applications/resnet/) — y, en general, el de *tu* familia de modelos, que no tiene por qué coincidir con el de otra.
- [Capas de preprocesado de Keras](https://keras.io/api/layers/preprocessing_layers/) — `Rescaling`, `Normalization` y las capas de aumentación, que solo actúan en entrenamiento.

**Reproducir las cifras**

- [`datasets/medir_atajos.py`](https://github.com/stivenson/stivenson.github.io/blob/main/datasets/medir_atajos.py) — mide los tres atajos, in-sample y en partición independiente. Se le pasa la carpeta de imágenes.
- [`datasets/acrima_mini.zip`](https://github.com/stivenson/stivenson.github.io/blob/main/datasets/acrima_mini.zip) — el subconjunto de 60 imágenes que usan las celdas de este artículo, con los tamaños originales intactos.
- [`notebooks/glaucoma_preprocesado.ipynb`](https://colab.research.google.com/github/stivenson/stivenson.github.io/blob/main/notebooks/glaucoma_preprocesado.ipynb) — el notebook completo, ejecutable en Colab de arriba a abajo.

<em>Las imágenes de fondo de ojo de este artículo se redistribuyen bajo CC BY 4.0. La atribución completa está en <a href="https://github.com/stivenson/stivenson.github.io/blob/main/datasets/README.md">datasets/README.md</a>.</em>

</div>

</div>
