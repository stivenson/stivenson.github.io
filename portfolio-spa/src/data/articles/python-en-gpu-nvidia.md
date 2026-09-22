---
title: "Python en GPU NVIDIA: Activar Full Aceleración"
date: "2026-09-22"
slug: "python-en-gpu-nvidia"
description: "Activa cudf.pandas y cuml.accel sin tocar tu código, comprueba con el perfilador qué corrió de verdad en la GPU y aprende a reconocer cuándo no vale la pena — con notebook en Colab, dos simuladores interactivos y fuentes científicas."
tags: ["Python", "GPU", "NVIDIA", "Rendimiento", "Ciencia de datos"]
---

<style>
/* ─────────────────────────────────────────────────────────────
   Glosario emergente — mismo mecanismo que el articulo de imagen
   a tensor. Un termino subrayado abre una ficha con su definicion.

   Todo con CSS: un checkbox oculto y su etiqueta. Sin JavaScript,
   porque el Markdown se renderiza con React y un <script> incrustado
   no llegaria a ejecutarse; y sin anclas #, porque el sitio usa
   HashRouter y cambiar el hash sacaria al lector del articulo.
   ───────────────────────────────────────────────────────────── */

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
.gl-b i {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-style: normal;
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

/* ─────────────────────────────────────────────────────────────
   Diagrama de flujo del fallback. Sustituye al dibujo en ASCII:
   aquel quedaba en gris —una valla de codigo sin lenguaje no la
   colorea el resaltador— y se desalineaba en pantallas estrechas.
   Aqui el color dice de quien es cada paso: esmeralda la GPU,
   ambar la CPU, cian los datos que viajan.
   ───────────────────────────────────────────────────────────── */

.flow {
  margin: 22px 0;
  display: grid;
  gap: 10px;
}
.flow-step {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: start;
  padding: 12px 14px;
  border: 1px solid rgba(85, 170, 255, 0.16);
  border-left: 3px solid var(--fc, #55AAFF);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.03);
}
.flow-step > b {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  color: var(--fc, #55AAFF);
  white-space: nowrap;
}
.flow-step > span { font-size: 14.5px; line-height: 1.6; color: #d8d8e8; }
.flow-step em {
  display: block;
  margin-top: 3px;
  font-size: 13px;
  font-style: normal;
  color: #9a9ac0;
}
.flow-arrow {
  margin: -4px 0 -4px 16px;
  font-size: 13px;
  color: #6f6f95;
}
@media (max-width: 520px) {
  .flow-step { grid-template-columns: 1fr; gap: 5px; }
}
</style>

# **Python en GPU NVIDIA: Activar Full Aceleración**

Puedes acelerar pandas y scikit-learn en una GPU NVIDIA **sin cambiar una línea de tu código**. Se activa con un comando. Este artículo te enseña a activarlo, a comprobar que de verdad se activó, y a reconocer los casos en los que la GPU no te va a servir de nada.

Lo escribí después de ver **«Introducción a la ciencia de datos en GPUs»**, la charla de [Naty Clementi](https://www.linkedin.com/in/ncclementi/) —Senior Software Engineer de NVIDIA— en [Platzi Conf Bogotá 2026](https://platzi.com/conf/), el 29 de agosto en Ágora. La charla tenía dos mensajes, y aquí desarrollo los dos: el que se comparte en redes (*una línea y listo*) y el que ahorra disgustos (*primero mide*).

> **🚀 Todo el código de este artículo está en un notebook ejecutable:** [**`python-gpu-nvidia.ipynb`**](https://colab.research.google.com/github/stivenson/stivenson.github.io/blob/main/notebooks/python-gpu-nvidia.ipynb) — se abre en Google Colab de un clic, con GPU gratuita y sin instalar nada. Cada sección de aquí abajo tiene su celda allá.

**Cómo leer esto según tu caso:**

- **Si estás estudiando**, ve en orden. Los conceptos (Amdahl, costo de mover datos, modelo roofline) están explicados desde cero, con dos simuladores interactivos para jugar con ellos.
- **Si ya trabajas con datos y quieres resultados hoy**, las secciones 1 a 3 te dejan acelerando y midiendo en 15 minutos. La 4 es la que te evita presentar un número inflado en una reunión.

<em>Estado a septiembre de 2026. Las versiones de las librerías cambian rápido; los principios de fondo llevan décadas sin moverse.</em>

### **CPU y GPU, en dos frases**

La **CPU** tiene pocos núcleos muy capaces: buena para tareas paso a paso. La **GPU** tiene miles de núcleos simples: buena para hacer la misma operación sobre millones de datos a la vez.

Y un detalle que casi nadie menciona: antes de trabajar, **los datos tienen que viajar hasta la GPU**. Ese viaje pasa por el <span class="gl"><input type="checkbox" id="gl-pcie" class="gl-c"><label for="gl-pcie" class="gl-t">PCIe</label><span class="gl-m"><label for="gl-pcie" class="gl-bg"></label><span class="gl-b"><b>PCIe (el bus que une CPU y GPU)</b><span>Es el «cable» por el que viajan los datos entre la memoria del computador (RAM) y la memoria de la tarjeta gráfica (VRAM). Es rápido, pero mucho más lento que la memoria propia de la GPU.</span><span>Una ranura <i>PCIe 4.0 x16</i> mueve en teoría unos 32 GB/s en cada sentido; una <i>PCIe 5.0 x16</i>, unos 64 GB/s. La memoria interna de una GPU moderna mueve entre 300 y 3.000 GB/s.</span><label for="gl-pcie" class="gl-x">Entendido</label></span></span></span>, y cuesta tiempo. Media sección de este artículo trata de ese viaje.

Los términos subrayados con 💡 abren una ficha con su definición. Si algo suena a jerga, la explicación está a un clic.

---

## **⚡ 1. Activarlo: tres comandos**

Lo que necesitas: una GPU NVIDIA con Linux (o <span class="gl"><input type="checkbox" id="gl-wsl" class="gl-c"><label for="gl-wsl" class="gl-t">WSL2</label><span class="gl-m"><label for="gl-wsl" class="gl-bg"></label><span class="gl-b"><b>WSL2 (Linux dentro de Windows)</b><span>El subsistema de Windows para Linux. Permite ejecutar una distribución Linux real sobre Windows, con acceso a la GPU NVIDIA de la máquina.</span><span>Importa aquí porque varias de estas librerías —y la memoria unificada de cuDF— solo funcionan en Linux. Con WSL2 las puedes usar sin cambiar de sistema operativo.</span><label for="gl-wsl" class="gl-x">Entendido</label></span></span></span>), o simplemente **Colab con entorno GPU**, que es gratis y no instala nada en tu máquina.

### **pandas → GPU**

Tu script sigue diciendo `import pandas as pd`. Solo cambia **cómo lo ejecutas**:

```bash
python -m cudf.pandas mi_script.py
```

```python
# En un notebook, en la PRIMERA celda, antes de importar pandas
%load_ext cudf.pandas
import pandas as pd
```

### **scikit-learn → GPU**

```bash
python -m cuml.accel mi_script.py
```

```python
# En un notebook, antes de importar scikit-learn
%load_ext cuml.accel
```

### **Y lo que nunca debe faltar: comprobar qué se aceleró**

```bash
python -m cudf.pandas --line-profile mi_script.py
python -m cuml.accel   --line-profile mi_script.py
```

Estos dos últimos comandos son los que separan «creo que está usando la GPU» de saberlo. La sección 3 los lee en detalle.

### **Qué acelera cada cosa**

| Librería | Sustituye a | <span class="gl"><input type="checkbox" id="gl-zcc" class="gl-c"><label for="gl-zcc" class="gl-t">Zero-code-change</label><span class="gl-m"><label for="gl-zcc" class="gl-bg"></label><span class="gl-b"><b>Zero-code-change (sin cambiar el código)</b><span>La librería se hace pasar por la que ya usabas, así que tu script sigue diciendo <i>import pandas</i> o <i>from sklearn…</i> y no cambia una línea. Lo único distinto es cómo lanzas el programa.</span><span>La contrapartida es que la aceleración deja de ser visible en el código: solo el perfilador te dice qué acabó en la GPU.</span><label for="gl-zcc" class="gl-x">Entendido</label></span></span></span> | Qué cubre |
|---|---|---|---|
| **cuDF** (`cudf.pandas`) | pandas | ✅ | Tablas: filtros, cruces, agrupaciones, texto |
| **cuML** (`cuml.accel`) | scikit-learn, <span class="gl"><input type="checkbox" id="gl-umap" class="gl-c"><label for="gl-umap" class="gl-t">UMAP</label><span class="gl-m"><label for="gl-umap" class="gl-bg"></label><span class="gl-b"><b>UMAP y HDBSCAN</b><span>Dos técnicas muy usadas para explorar datos sin etiquetas. <b>UMAP</b> reduce muchas columnas a dos o tres para poder dibujarlas; <b>HDBSCAN</b> agrupa los puntos en grupos naturales, sin decirle cuántos hay.</span><span>Ambas son caras en CPU y están entre las que más aceleran en GPU, por eso aparecen siempre en los anuncios de cuML.</span><label for="gl-umap" class="gl-x">Entendido</label></span></span></span>, HDBSCAN | ✅ | Bosques aleatorios, regresiones, k-means, DBSCAN, PCA, kNN, SVM, t-SNE, preprocesadores |
| **CuPy** | NumPy, SciPy | ❌ (cambias `np` por `cp`) | Arreglos y álgebra lineal |
| **cuGraph** | NetworkX | parcial | Grafos y redes |
| **cuVS** | FAISS | ❌ | Búsqueda de vectores (<span class="gl"><input type="checkbox" id="gl-embed" class="gl-c"><label for="gl-embed" class="gl-t">embeddings</label><span class="gl-m"><label for="gl-embed" class="gl-bg"></label><span class="gl-b"><b>Embedding (vector de significado)</b><span>Una lista de números que representa un texto, una imagen o un producto, de modo que las cosas parecidas quedan cerca unas de otras.</span><span>Buscar entre millones de embeddings es comparar vectores una y otra vez: mucha operación repetida sobre los mismos datos, justo la forma que le gusta a una GPU.</span><label for="gl-embed" class="gl-x">Entendido</label></span></span></span>) |
| **cuOpt** | solvers clásicos | ❌ | Rutas y optimización de decisiones |

Todo esto es el bloque de ciencia de datos de **<span class="gl"><input type="checkbox" id="gl-cudax" class="gl-c"><label for="gl-cudax" class="gl-t">CUDA-X</label><span class="gl-m"><label for="gl-cudax" class="gl-bg"></label><span class="gl-b"><b>CUDA-X y RAPIDS</b><span><b>CUDA</b> es la plataforma con la que se programan las GPU de NVIDIA. <b>CUDA-X</b> es el conjunto de librerías construidas encima, ya optimizadas, para matemáticas, física, deep learning o datos.</span><span>La parte de ciencia de datos —cuDF, cuML, cuGraph, cuVS— es además un proyecto de código abierto llamado <b>RAPIDS</b>. Lo que instalas con <i>pip</i> o <i>conda</i> lleva ese nombre.</span><label for="gl-cudax" class="gl-x">Entendido</label></span></span></span>**, el conjunto de librerías aceleradas de NVIDIA. Como resumió la charla: *«kernels que no tienes que escribir»*.

Un <span class="gl"><input type="checkbox" id="gl-kernel" class="gl-c"><label for="gl-kernel" class="gl-t">kernel</label><span class="gl-m"><label for="gl-kernel" class="gl-bg"></label><span class="gl-b"><b>Kernel (en GPU)</b><span>Una función que se ejecuta en la GPU, lanzada en miles de copias a la vez, cada una trabajando sobre un pedacito de los datos.</span><span>Escribir kernels rápidos es difícil: hay que pensar en memoria compartida, en cómo se agrupan los hilos, en evitar conflictos. Por eso casi siempre conviene usar librerías que ya los traen escritos y afinados.</span><label for="gl-kernel" class="gl-x">Entendido</label></span></span></span> es una función que corre en la GPU en miles de copias simultáneas. Estas librerías ya los traen escritos y afinados; tú solo llamas a la API de siempre.

---

## **🔧 2. Qué acaba de pasar por dentro**

Merece dos minutos, porque explica todo lo que puede salir mal después.

Cuando activas `cudf.pandas`, `import pandas` ya no te da el pandas de siempre: te da un <span class="gl"><input type="checkbox" id="gl-proxy" class="gl-c"><label for="gl-proxy" class="gl-t">proxy</label><span class="gl-m"><label for="gl-proxy" class="gl-bg"></label><span class="gl-b"><b>Proxy (objeto intermediario)</b><span>Un objeto que se hace pasar por otro. Tu código cree que habla con pandas, pero habla con un intermediario que decide, en cada operación, si la hace cuDF en la GPU o pandas en la CPU.</span><span>Por eso funciona sin cambiar código: la interfaz es idéntica, lo que cambia es quién hace el trabajo.</span><label for="gl-proxy" class="gl-x">Entendido</label></span></span></span> idéntico por fuera. Cada operación sigue este camino:

<div class="flow">
  <div class="flow-step" style="--fc:#55AAFF"><b>1 · Tu código</b><span>Llama a una función de pandas, exactamente igual que siempre.</span></div>
  <div class="flow-arrow">▼</div>
  <div class="flow-step" style="--fc:#a855f7"><b>2 · El proxy decide</b><span>¿Sabe cuDF hacer esta operación en la GPU?</span></div>
  <div class="flow-arrow">▼</div>
  <div class="flow-step" style="--fc:#10b981"><b>3a · Sí</b><span>Se ejecuta en la GPU.<em>El camino rápido: los datos ya están allí y no se mueven.</em></span></div>
  <div class="flow-step" style="--fc:#f59e0b"><b>3b · No</b><span>Los datos se copian a la CPU, los procesa pandas normal y el resultado vuelve a la GPU.<em>Es el <b>fallback</b>: no falla nada, pero se pagan dos viajes por el bus.</em></span></div>
  <div class="flow-arrow">▼</div>
  <div class="flow-step" style="--fc:#06b6d4"><b>4 · Resultado</b><span>Tu código recibe lo que esperaba, venga de donde venga.</span></div>
</div>

Ese plan B se llama <span class="gl"><input type="checkbox" id="gl-fallback" class="gl-c"><label for="gl-fallback" class="gl-t">fallback</label><span class="gl-m"><label for="gl-fallback" class="gl-bg"></label><span class="gl-b"><b>Fallback (plan B automático)</b><span>Cuando la GPU no sabe hacer una operación, la librería la manda a la CPU en silencio. Tu programa no falla: simplemente esa parte va a velocidad normal.</span><span>Es cómodo, pero tiene truco: cada fallback puede implicar copiar datos por el PCIe de ida y vuelta. Muchos fallbacks seguidos pueden hacer que el script vaya <b>más lento</b> que con pandas puro.</span><label for="gl-fallback" class="gl-x">Entendido</label></span></span></span>, y es la razón de que «funcione siempre»… y también de que a veces no acelere nada. `cuml.accel` hace lo mismo con los modelos de scikit-learn.

**¿Y si mis datos no caben en la VRAM?** Por defecto, `cudf.pandas` usa <span class="gl"><input type="checkbox" id="gl-um" class="gl-c"><label for="gl-um" class="gl-t">memoria unificada</label><span class="gl-m"><label for="gl-um" class="gl-bg"></label><span class="gl-b"><b>Memoria unificada (managed memory)</b><span>Un mecanismo de CUDA que hace ver la RAM y la VRAM como una sola memoria grande. Si los datos no caben en la GPU, parte se queda en la RAM y se va trayendo según se necesita.</span><span>Evita el error de «memoria agotada», pero no es gratis: cada vez que la GPU necesita un dato que no tiene, lo trae por el PCIe. NVIDIA misma recomienda que, para el máximo rendimiento, los datos quepan enteros en la GPU.</span><label for="gl-um" class="gl-x">Entendido</label></span></span></span> con un pool y precarga (se controla con la variable de entorno `CUDF_PANDAS_RMM_MODE`). Tu programa no se cae, pero rinde menos: <span class="gl"><input type="checkbox" id="gl-vram" class="gl-c"><label for="gl-vram" class="gl-t">la VRAM</label><span class="gl-m"><label for="gl-vram" class="gl-bg"></label><span class="gl-b"><b>VRAM (memoria de la GPU)</b><span>La memoria propia de la tarjeta gráfica. La GPU solo trabaja rápido con datos que estén ahí.</span><span>Suele ser mucho más pequeña que la RAM —8, 16, 24 u 80 GB según la tarjeta— pero muchísimo más rápida. Si tus datos no caben, hay que partirlos o ir y venir por el PCIe, y eso cuesta.</span><label for="gl-vram" class="gl-x">Entendido</label></span></span></span> que le falta la pide prestada por el bus, una y otra vez.

---

## **🔍 3. Comprobar que la GPU está haciendo el trabajo**

Clementi insistió en este paso, y es el que más gente se salta. «Fue más rápido» no basta: quieres saber **qué parte** fue a la GPU y cuál se quedó en el plan B.

```bash
# Resumen por función: llamadas y tiempo en GPU frente a CPU
python -m cudf.pandas --profile mi_script.py

# Línea por línea
python -m cudf.pandas --line-profile mi_script.py
```

```python
# En Jupyter, al inicio de la celda
%%cudf.pandas.profile

%%cudf.pandas.line_profile
```

Con `cuml.accel` los comandos son iguales (`--profile`, `--line-profile`, `%%cuml.accel.profile`) y además puedes subir el detalle del registro con `-v` o `-vv` para ver **por qué** un modelo no se aceleró.

### **Cómo se lee un perfil: el ejemplo de la charla**

La diapositiva mostraba este script —un <span class="gl"><input type="checkbox" id="gl-rf" class="gl-c"><label for="gl-rf" class="gl-t">bosque aleatorio</label><span class="gl-m"><label for="gl-rf" class="gl-bg"></label><span class="gl-b"><b>Bosque aleatorio (random forest)</b><span>Un modelo hecho de muchos árboles de decisión entrenados sobre trozos distintos de los datos. La predicción final es el voto o el promedio de todos.</span><span>Lo formuló Leo Breiman en 2001. Se entrena rápido, funciona bien en datos de tabla y cada árbol es independiente de los demás: por eso se reparte tan bien entre núcleos de CPU o entre los miles de hilos de una GPU.</span><label for="gl-rf" class="gl-x">Entendido</label></span></span></span> de 25 árboles sobre 100.000 filas— <span class="gl"><input type="checkbox" id="gl-perfilar" class="gl-c"><label for="gl-perfilar" class="gl-t">perfilado línea a línea</label><span class="gl-m"><label for="gl-perfilar" class="gl-bg"></label><span class="gl-b"><b>Perfilar (profiling)</b><span>Una herramienta que mide tu programa por dentro: cuánto tarda cada función o cada línea, cuántas veces se ejecuta y —en este caso— si corrió en la GPU o en la CPU.</span><span>En Python tienes <i>cProfile</i> y <i>line_profiler</i> para la CPU. cuDF y cuML traen los suyos, que añaden la columna que aquí importa: <b>GPU %</b>.</span><label for="gl-perfilar" class="gl-x">Entendido</label></span></span></span>:

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

X, y = make_classification(n_classes=2, n_features=10, n_samples=100_000)
X_train, X_test, y_train, y_test = train_test_split(X, y)

model = RandomForestClassifier(max_depth=10, n_estimators=25)
trained_RF = model.fit(X_train, y_train)      # 285 ms  · 99 % en GPU
predictions = model.predict(X_test)           # 38,2 ms · 99 % en GPU
score = accuracy_score(y_test, predictions)
```

Las columnas del perfil: **N** = veces que se ejecutó la línea, **Time** = tiempo total de esa línea, **GPU %** = qué parte de ese tiempo corrió en la GPU.

Sumando los tiempos visibles en la diapositiva (los leí de una foto, así que son aproximados), el script tardó ≈ 546 ms. De eso, **solo ≈ 320 ms fueron GPU** (entrenar y predecir). El resto: importar librerías (≈ 159 ms) y generar y partir los datos (≈ 62 ms), todo en CPU.

Dicho de otro modo: **el 59 % del script está acelerado**. Aunque la GPU entrenara en cero segundos, el script no bajaría de ≈ 225 ms. Guarda ese número, que reaparece en la sección 4.

### **El mismo script, en mi portátil sin GPU**

Ejecuté ese workflow en un AMD Ryzen 7 5700U, de dos formas distintas:

| Paso | CPU, por defecto (1 núcleo) | CPU, `n_jobs=-1` (16 hilos) | GPU de la charla |
|---|---|---|---|
| Entrenar (`fit`) | 4.040 ms | 828 ms | 285 ms |
| Predecir | 32 ms | 17 ms | 38 ms |
| **Ventaja de la GPU al entrenar** | **≈ 14×** | **≈ 2,9×** | — |

*scikit-learn 1.9.1, mediana de 5 ejecuciones, exactitud 0,908 en todas. La GPU de la charla no se indicó en la diapositiva.*

Tres lecturas, y las tres son prácticas:

1. **El mismo resultado se puede vender como 14× o como 2,9×.** Lo único que cambió fue <span class="gl"><input type="checkbox" id="gl-njobs" class="gl-c"><label for="gl-njobs" class="gl-t">n_jobs</label><span class="gl-m"><label for="gl-njobs" class="gl-bg"></label><span class="gl-b"><b>n_jobs (cuántos núcleos usa scikit-learn)</b><span>El parámetro que dice en cuántos procesos se reparte el trabajo. <i>n_jobs=-1</i> significa «usa todos los núcleos disponibles».</span><span>Su valor por defecto es <b>uno solo</b>. Ahí nace la mitad de los <i>speedups</i> exagerados que se publican: si comparas una GPU contra un núcleo de CPU, la comparación ya venía torcida.</span><label for="gl-njobs" class="gl-x">Entendido</label></span></span></span>. scikit-learn usa **un solo núcleo por defecto** en los bosques aleatorios: comparar contra eso infla la ventaja.
2. **Predecir fue más rápido en CPU.** Con 25.000 filas hay tan poco trabajo que no compensa mandar los datos a la GPU.
3. **Aun así, la GPU ganó al entrenar.** Contra un servidor de 64 núcleos ganaría menos; con un millón de filas, más. Por eso se mide con tus datos.

### **Cuando el modelo se va a la CPU sin avisar**

`cuml.accel` devuelve el trabajo a scikit-learn cuando encuentra algo que no sabe acelerar. En `RandomForestClassifier`, por ejemplo: `criterion="log_loss"`, `warm_start`, pesos por muestra (`sample_weight`), <span class="gl"><input type="checkbox" id="gl-sparse" class="gl-c"><label for="gl-sparse" class="gl-t">datos dispersos</label><span class="gl-m"><label for="gl-sparse" class="gl-bg"></label><span class="gl-b"><b>Datos dispersos (sparse) y NaN</b><span>Una matriz <b>dispersa</b> es la que está casi toda a cero —típico al convertir texto en columnas— y se guarda en un formato comprimido que solo anota los valores distintos de cero.</span><span><b>NaN</b> es el marcador de «valor faltante». Muchas implementaciones en GPU aún no cubren estos dos casos, así que el trabajo se devuelve a scikit-learn en la CPU.</span><label for="gl-sparse" class="gl-x">Entendido</label></span></span></span>, valores faltantes (NaN) o varias salidas a la vez.

En el notebook hay una celda que lo provoca a propósito y muestra el mensaje con `-v`. Si tu «aceleración» fue de 1,0×, esta es la primera sospecha.

### **Y otra letra pequeña: los resultados pueden no ser idénticos**

NVIDIA avisa de que los resultados son «numéricamente equivalentes», no siempre iguales: cambia el orden de las operaciones. Además, cuML busca los cortes de los árboles con un <span class="gl"><input type="checkbox" id="gl-hist" class="gl-c"><label for="gl-hist" class="gl-t">método aproximado por histogramas</label><span class="gl-m"><label for="gl-hist" class="gl-bg"></label><span class="gl-b"><b>Cortes por histograma</b><span>Para decidir dónde parte un árbol, el método clásico prueba todos los valores posibles de cada columna. El método por histogramas agrupa antes los valores en unas decenas de tramos y solo prueba esos.</span><span>Es mucho más rápido y casi siempre igual de preciso, pero el árbol resultante no es idéntico. Por eso la exactitud del modelo en GPU puede diferir en algunos decimales.</span><label for="gl-hist" class="gl-x">Entendido</label></span></span></span>. **Compara siempre la métrica del modelo, no solo el tiempo.**

---

## **🧠 4. Cuándo la GPU no te va a servir (la parte que evita sustos)**

Ya sabes activarla y comprobarla. Toca la pregunta anterior a todo esto, que es la que hacía la mejor diapositiva de la charla: **¿mi problema tiene la forma adecuada para una GPU?** Son dos condiciones, cada una con casi sesenta años de literatura detrás.

### **Condición 1: que haya bastante trabajo acelerable (ley de Amdahl)**

En 1967, Gene Amdahl observó algo que no ha caducado: **si solo una parte de tu programa se acelera, la parte que no se acelera pone el techo.**

Con números: tu programa tarda 10 minutos y 9 son paralelizables. Aunque la GPU hiciera esos 9 minutos en cero segundos, queda 1 minuto intocable. Nunca bajarás de ahí. Techo: 10×.

Juega con las dos barras del simulador. Fíjate en lo que pasa cuando bajas la fracción acelerable al 50 %:

<iframe src="/ovas/gpu-amdahl.html" title="Simulador: hasta dónde puede acelerar tu script, según la ley de Amdahl" loading="lazy"></iframe>

En fórmula, para quien la quiera:

$$
S_{\text{total}} \;=\; \frac{1}{\,(1 - p) \;+\; \dfrac{p}{s}\,}
$$

donde **p** es la fracción del tiempo que se puede acelerar (entre 0 y 1) y **s**, cuántas veces más rápida es la GPU en esa parte.

| Fracción acelerable | Con una GPU 50× más rápida | Con una GPU infinitamente rápida |
|---|---|---|
| 50 % | 1,96× | 2× |
| 90 % | 8,5× | 10× |
| 95 % | 14,5× | 20× |
| 99 % | 33,6× | 100× |

**Con la mitad del programa en la GPU no pasas de 2×**, por muy cara que sea la tarjeta. El script de la charla estaba al 59 %: su techo eran 2,4×, aunque el `fit` volara.

Un matiz justo: John Gustafson (1988) respondió que en la práctica, cuando tenemos más potencia, **no repetimos el mismo trabajo más rápido: procesamos más datos**. Si con GPU entrenas sobre 10 millones de filas en vez de 100.000, la parte paralela crece y la secuencial pesa menos. Las dos miradas son ciertas: responden a «¿cuánto antes termino?» y a «¿cuánto más puedo hacer?».

### **Condición 2: que el cálculo pague el viaje de los datos**

En 2011, Chris Gregg y Kim Hazelwood publicaron un artículo cuyo título es media lección: *«¿Dónde están los datos? Por qué no puedes debatir el rendimiento de CPU contra GPU sin esa respuesta»*. Muchas comparaciones publicadas **no contaban el tiempo de transferencia**; al contarlo, varios ganadores dejaban de serlo.

Mueve el tamaño de los datos y, sobre todo, **el número de operaciones que haces sobre ellos**. Ahí está toda la historia:

<iframe src="/ovas/gpu-transferencia.html" title="Simulador: cuándo compensa mover los datos a la GPU, contando el viaje por el PCIe" loading="lazy"></iframe>

El caso extremo, con 8 GB y **una sola** operación ligera (sumar una columna):

| Paso | Velocidad aproximada | Tiempo |
|---|---|---|
| Llevar 8 GB a la GPU por el bus PCIe 4.0 | ~32 GB/s | **~250 ms** |
| La GPU lee 8 GB de su VRAM (RTX 4090) | ~1.000 GB/s | **~8 ms** |
| La CPU lee 8 GB de la RAM (DDR4 doble canal) | ~50 GB/s | **~160 ms** |

La GPU calcula en 8 ms, pero el viaje cuesta 250. **Total GPU ≈ 258 ms; total CPU ≈ 160 ms.** Gana la CPU.

Cambia el escenario a 30 operaciones encadenadas sobre esos mismos datos y la GPU paga el viaje una sola vez. Ahí arrasa.

> **La regla que resume las dos condiciones:** la GPU gana cuando los datos **se quedan en ella** y hacen mucho trabajo antes de volver. Ir y venir por el <span class="gl"><input type="checkbox" id="gl-pcie2" class="gl-c"><label for="gl-pcie2" class="gl-t">PCIe</label><span class="gl-m"><label for="gl-pcie2" class="gl-bg"></label><span class="gl-b"><b>PCIe (el bus que une CPU y GPU)</b><span>El «cable» por el que viajan los datos entre la memoria del computador (RAM) y la de la tarjeta gráfica (VRAM). Rápido, pero mucho más lento que la memoria interna de la GPU.</span><span>Una ranura <i>PCIe 4.0 x16</i> mueve unos 32 GB/s por sentido; una <i>PCIe 5.0 x16</i>, unos 64. La memoria de la propia tarjeta va entre 300 y 3.000 GB/s. Esa diferencia es la que hace que mover los datos cueste más que calcularlos.</span><label for="gl-pcie2" class="gl-x">Entendido</label></span></span></span> es el enemigo número uno.

En el notebook, la sección 2 **mide esto en tu sesión de Colab**: cuántos GB/s da realmente tu PCIe y cuántos da la memoria de la tarjeta.

### **La herramienta que une las dos condiciones: el modelo roofline**

Williams, Waterman y Patterson (Berkeley, 2009) lo formularon así: tu código solo puede ir tan rápido como el **más lento** de dos límites — cuántas <span class="gl"><input type="checkbox" id="gl-flop" class="gl-c"><label for="gl-flop" class="gl-t">operaciones por segundo</label><span class="gl-m"><label for="gl-flop" class="gl-bg"></label><span class="gl-b"><b>FLOP, TFLOP/s y GB/s</b><span>Un <b>FLOP</b> es una operación con números decimales: una suma o una multiplicación. Un <b>TFLOP/s</b> es un billón de ellas por segundo, y mide la capacidad de cálculo.</span><span>Los <b>GB/s</b> miden otra cosa: cuántos datos por segundo se mueven. Un chip puede tener cálculo de sobra y quedarse quieto esperando datos; de eso trata todo el modelo roofline.</span><label for="gl-flop" class="gl-x">Entendido</label></span></span></span> puede hacer el chip, y cuántos datos por segundo le pueden llegar. La bisagra entre ambos es la <span class="gl"><input type="checkbox" id="gl-ia" class="gl-c"><label for="gl-ia" class="gl-t">intensidad aritmética</label><span class="gl-m"><label for="gl-ia" class="gl-bg"></label><span class="gl-b"><b>Intensidad aritmética</b><span>Cuántas operaciones matemáticas haces por cada byte que lees de memoria. Se mide en FLOP/byte.</span><span>Sumar dos vectores: 1 operación por cada 12 bytes → intensidad muy baja. Multiplicar matrices grandes: cada número se reutiliza cientos de veces → intensidad muy alta. <b>A más intensidad, más aprovechas la GPU.</b></span><label for="gl-ia" class="gl-x">Entendido</label></span></span></span>.

En una RTX 4090 hacen falta unas **82 operaciones por byte leído** para exprimir su cálculo.

- **Sumar dos vectores**: ≈ 0,08 operaciones por byte. Mil veces por debajo: la GPU se pasa el rato esperando datos.
- **Multiplicar matrices de 4096 × 4096**: ≈ 680 operaciones por byte. Aquí trabaja a tope.

Por eso el deep learning —que en el fondo es multiplicar matrices— aprovecha tanto las GPU, y una operación simple sobre una columna, no. La sección 2 del notebook mide las dos y te enseña la diferencia en TFLOP/s.

### **Esto no es nuevo: veinte años de literatura**

Usar la tarjeta gráfica para cálculo general tiene nombre propio desde hace casi dos décadas —**GPGPU**— y su primera gran revisión es de Owens et al. (2007), anterior incluso a que CUDA se popularizara con el artículo de Nickolls et al. (2008). Repartir trabajo entre CPU y GPU es un campo entero: Mittal y Vetter (2015) catalogan decenas de técnicas en una revisión de *ACM Computing Surveys*.

Y hay una razón de fondo para que todo esto importe justo ahora. Hennessy y Patterson —premio Turing— lo llaman [una nueva edad de oro de la arquitectura de computadores](https://doi.org/10.1145/3282307): como los procesadores de propósito general ya no se aceleran solos cada año, el rendimiento pasa a venir de chips especializados como las GPU. Saber cuándo usarlos deja de ser un truco y pasa a ser parte del oficio.

### **De dónde salen los «100× más rápido»**

En 2010, un equipo de Intel (Lee et al., congreso ISCA) revisó afirmaciones de ese calibre. Con 14 tareas y **ambas versiones bien optimizadas** (GTX 280 contra Core i7-960), la diferencia media fue de **2,5×**. Los 100× salían de comparar código GPU pulido contra código CPU sin optimizar, a veces ni paralelo. Es un artículo firmado por un fabricante de CPU, con su interés; aun así la lección metodológica aguantó, y en 2023 entró en la selección de retrospectivas por los 50 años del congreso.

Ya lo viste en tu propia tabla de la sección 3: 14× o 2,9× según el rival.

### **Y antes de culpar al hardware: quizá el problema es el código**

Leiserson y colegas (*Science*, 2020) optimizaron una multiplicación de matrices de 4096 × 4096 **sin cambiar de máquina**:

| Versión | Tiempo | Frente a Python |
|---|---|---|
| Python puro | 25.552 s (≈ 7 h) | 1× |
| C | 543 s | 47× |
| Bucles en paralelo | 69,8 s | 366× |
| Divide y vencerás (usa <span class="gl"><input type="checkbox" id="gl-cache" class="gl-c"><label for="gl-cache" class="gl-t">la caché</label><span class="gl-m"><label for="gl-cache" class="gl-bg"></label><span class="gl-b"><b>Caché</b><span>Una memoria diminuta y muy rápida que vive dentro del procesador. Leer de ahí es decenas de veces más rápido que leer de la RAM.</span><span>Reordenar un algoritmo para que trabaje por bloques que quepan en la caché puede multiplicar su velocidad sin cambiar ni una operación matemática. Es el salto de 366× a 6.727× de la tabla.</span><label for="gl-cache" class="gl-x">Entendido</label></span></span></span>) | 3,8 s | 6.727× |
| + vectorización + instrucciones AVX | 0,41 s | **62.806×** |

El Python original usaba el **0,0006 %** de lo que esa máquina podía dar. Lo repetí en pequeño en mi portátil (256 × 256): tres bucles `for` tardan 2,48 s; `a @ b` con NumPy, 2,9 ms. **845× de diferencia, misma CPU.**

**Traducción práctica:** si tu código hace bucles de Python sobre los datos, el primer escalón no es la GPU, es <span class="gl"><input type="checkbox" id="gl-vect" class="gl-c"><label for="gl-vect" class="gl-t">vectorizar</label><span class="gl-m"><label for="gl-vect" class="gl-bg"></label><span class="gl-b"><b>Vectorizar</b><span>Sustituir los bucles de Python por operaciones sobre arreglos completos: en vez de recorrer un millón de filas una a una, pedirle a NumPy o pandas que opere sobre la columna entera.</span><span>El bucle lo acaba haciendo código compilado (C o Fortran) en vez del intérprete de Python. Es casi siempre la optimización más rentable, y deja el código listo para cambiarlo por su versión de GPU.</span><label for="gl-vect" class="gl-x">Entendido</label></span></span></span>. Y hay premio doble: cuDF, cuML y CuPy copian las interfaces de pandas, scikit-learn y NumPy, así que el código vectorizado ya está listo para la GPU.

---

## **🛠️ 5. Receta para tu propio caso**

El orden que yo seguiría, de menos a más esfuerzo:

1. **Perfila primero, en CPU.** `cProfile`, `line_profiler` o `%%time`. Anota qué porcentaje del tiempo se va en la parte que la GPU podría acelerar. Ese número es tu techo (sección 4).
2. **Quita los bucles de Python.** Vectoriza con pandas/NumPy. A veces aquí se acaba el problema.
3. **Prueba la alternativa CPU bien hecha.** `n_jobs=-1`, <span class="gl"><input type="checkbox" id="gl-polars" class="gl-c"><label for="gl-polars" class="gl-t">Polars</label><span class="gl-m"><label for="gl-polars" class="gl-bg"></label><span class="gl-b"><b>Polars</b><span>Una librería de dataframes escrita en Rust, con una API parecida a la de pandas pero mucho más rápida: aprovecha todos los núcleos y organiza el trabajo antes de ejecutarlo.</span><span>Es el rival justo de una GPU en muchos casos. El estudio independiente que se cita más abajo la encontró a menudo la más rápida en análisis exploratorio.</span><label for="gl-polars" class="gl-x">Entendido</label></span></span></span> en lugar de pandas, versiones actualizadas. Es tu verdadero punto de comparación.
4. **Activa `cudf.pandas` o `cuml.accel`** y mide con `--line-profile`.
5. **Ataca los fallbacks** que aparezcan en el perfil: cambia la operación, o acepta que ese paso vive en CPU.
6. **Si sigues corto, baja de nivel** con CuPy o Numba.

### **Cuando toca escribir algo propio: CuPy y Numba**

**CuPy** es NumPy en la GPU (Okuta et al., 2017):

```python
import cupy as cp

x = cp.random.random((10_000, 10_000), dtype=cp.float32)
y = x @ x.T                            # se ejecuta en la GPU
resultado = cp.asnumpy(y.sum(axis=0))  # traer a la CPU SOLO lo necesario
```

**Numba** compila funciones de Python a código de GPU (Lam, Pitrou y Seibert, 2015), para cuando necesitas tu propio kernel:

```python
from numba import cuda

@cuda.jit
def sumar_uno(arr):
    i = cuda.grid(1)          # cada hilo sabe qué posición le toca
    if i < arr.size:
        arr[i] += 1

# 1 millón de elementos → ~4.000 bloques de 256 hilos cada uno
sumar_uno[(arr.size + 255) // 256, 256](arr_en_gpu)
```

*El soporte de GPU de Numba se instala hoy como paquete aparte (`numba-cuda`), mantenido por NVIDIA.* Un escalón más allá está **Triton** (Tillet, Kung y Cox, 2019), el lenguaje con el que se escriben hoy muchos kernels de deep learning.

### **Tres trampas que arruinan una medición**

| Trampa | Qué pasa | Cómo evitarla |
|---|---|---|
| **Medir sin sincronizar** | La GPU trabaja <span class="gl"><input type="checkbox" id="gl-async" class="gl-c"><label for="gl-async" class="gl-t">de forma asíncrona</label><span class="gl-m"><label for="gl-async" class="gl-bg"></label><span class="gl-b"><b>Ejecución asíncrona y sincronizar</b><span>Cuando llamas a una operación de GPU, Python no espera: encola el trabajo y sigue con la línea siguiente. La GPU va por detrás, a su ritmo.</span><span>Por eso hay que <b>sincronizar</b> —esperar explícitamente a que termine— antes de parar un cronómetro. Si no, mides lo que tarda en encolarse, no lo que tarda en calcularse.</span><label for="gl-async" class="gl-x">Entendido</label></span></span></span>: tu línea de Python «termina» antes que ella y ves tiempos irreales | `cp.cuda.Device().synchronize()` antes de parar el reloj, o `cupyx.profiler.benchmark` |
| **Contar la primera ejecución** | Incluye compilación, reserva de memoria y arranque | Haz un calentamiento y descártalo; reporta la mediana de varias |
| **Usar <span class="gl"><input type="checkbox" id="gl-f32" class="gl-c"><label for="gl-f32" class="gl-t">float64</label><span class="gl-m"><label for="gl-f32" class="gl-bg"></label><span class="gl-b"><b>float32 y float64 (precisión)</b><span>Dos formas de guardar un número decimal: con 32 bits (unos 7 dígitos significativos) o con 64 (unos 16). Más bits, más exactitud y más memoria ocupada.</span><span>Las GPU de centro de datos manejan bien ambos. Las de consumo están diseñadas para <i>float32</i> y pueden ser decenas de veces más lentas en <i>float64</i>, que es justo el que usan NumPy y pandas por defecto.</span><label for="gl-f32" class="gl-x">Entendido</label></span></span></span> en tarjeta de consumo** | Las GeForce/RTX son hasta 64 veces más lentas en `float64`, y NumPy y pandas lo usan por defecto | `float32` cuando tu problema lo tolere. La sección 2 del notebook mide la diferencia |

### **Checklist para reportar un resultado honesto**

No me lo inventé: Hoefler y Belli (SC15) revisaron 120 artículos de los tres congresos más importantes de computación de alto rendimiento y encontraron que la mayoría reportaba mal sus mediciones. De ahí salieron sus **doce reglas**, que este checklist resume para nuestro caso.

1. ☐ Digo **qué CPU y qué GPU** usé.
2. ☐ La versión CPU está **igual de optimizada** (todos los núcleos, librerías al día).
3. ☐ El tiempo **incluye** mover los datos a la GPU y de vuelta.
4. ☐ Descarté la primera ejecución y **sincronicé** antes de medir.
5. ☐ Comparé también la **métrica del modelo**, no solo el tiempo.
6. ☐ Reporto la **mediana** de varias ejecuciones, no el mejor caso.

> Un 3× contra un rival bien optimizado vale más que un 100× contra uno mal configurado: el primero es el que se sostiene cuando alguien lo repite.

---

## **📊 6. Qué esperar de verdad: las cifras publicadas y sus condiciones**

Para calibrar expectativas antes de invertir tiempo o dinero:

| Fuente | Resultado | Condiciones |
|---|---|---|
| NVIDIA, GTC 2024 | **~150×** con `cudf.pandas` | 5 GB, cruces y agrupaciones (<span class="gl"><input type="checkbox" id="gl-bench" class="gl-c"><label for="gl-bench" class="gl-t">benchmark de DuckDB</label><span class="gl-m"><label for="gl-bench" class="gl-bg"></label><span class="gl-b"><b>Benchmark</b><span>Un conjunto de pruebas estándar que todos ejecutan igual, para poder comparar herramientas con las mismas reglas. El que se cita aquí mide cruces y agrupaciones sobre tablas grandes.</span><span>Un benchmark solo representa el trabajo que mide. Que una librería gane en cruces y agrupaciones no dice nada sobre cómo se comportará con tus cadenas de texto o tus fechas.</span><label for="gl-bench" class="gl-x">Entendido</label></span></span></span>); Grace Hopper contra Xeon Platinum 8480C |
| NVIDIA, memoria unificada (2024) | **hasta 30×** en cruces, **~5×** en agrupaciones | 10 GB en una T4 de 16 GB (datos más grandes que la VRAM) contra Xeon Gold 6130 |
| NVIDIA, `cuml.accel` (2025) | **25×** bosque aleatorio, **52×** regresión lineal, **60×** UMAP, **175×** HDBSCAN | H100 contra Xeon Platinum 8480CL |
| Mozzillo et al., EDBT 2025 *(independiente)* | cuDF suele ganar en transformación de datos **cuando hay GPU**; Polars gana a menudo en análisis exploratorio | pandas, Polars, cuDF y PySpark en una sola máquina |
| Lee et al., ISCA 2010 *(independiente)* | **2,5×** de media | 14 tareas, ambas versiones optimizadas |
| Mi medición (sección 3) | **14×** o **2,9×** | El mismo `fit`, según con qué CPU se compare |

La cifra baja conforme sube la honestidad de la comparación. Ninguna de ellas es la tuya: la tuya la da tu perfilador.

---

## **🔬 Para seguir investigando**

Este artículo se apoya en publicaciones revisadas por pares y en documentación oficial. Para ir más allá, estas herramientas de mi [directorio de IA](https://stivenson.github.io/llm-directory.html) (filtro **Investigación**) sirven en momentos distintos:

| Quiero… | Herramienta | Ejemplo con este tema |
|---|---|---|
| Una respuesta rápida basada en papers | **Consensus** | «¿Las GPU aceleran el entrenamiento de random forest?» |
| Saber si un resultado fue confirmado o discutido | **Scite** | Ver quién cita a Lee et al. (2010) para apoyarlo y quién para rebatirlo |
| Una búsqueda bibliográfica profunda | **Undermind** | «Evaluaciones independientes de dataframes en GPU frente a CPU» |
| Descubrir artículos relacionados | **ResearchRabbit**, **Litmaps**, **Keenious** | Partir de Gregg & Hazelwood (2011) y explorar el mapa de citas |
| Leer y resumir un paper difícil | **SciSpace**, **Scholarcy** | Entender el modelo roofline sección por sección |
| Preguntarle a un conjunto de fuentes | **NotebookLM** | Cargar la documentación de cuDF y cuML y preguntar por los fallbacks |

Método, en una línea: las cifras de fabricante dicen **qué es posible**; los estudios independientes, **qué es típico**; tu perfilador, **qué es tuyo**.

---

## **🔗 Referencias**

**Fundamentos (revisados por pares)**
- Amdahl, G. M. (1967). [Validity of the single processor approach to achieving large scale computing capabilities](https://doi.org/10.1145/1465482.1465560). *AFIPS Spring Joint Computer Conference*, 483–485.
- Gustafson, J. L. (1988). [Reevaluating Amdahl's law](https://doi.org/10.1145/42411.42415). *Communications of the ACM*, 31(5), 532–533.
- Williams, S., Waterman, A. & Patterson, D. (2009). [Roofline: an insightful visual performance model for multicore architectures](https://doi.org/10.1145/1498765.1498785). *Communications of the ACM*, 52(4), 65–76.
- Leiserson, C. E., Thompson, N. C., Emer, J. S., Kuszmaul, B. C., Lampson, B. W., Sanchez, D. & Schardl, T. B. (2020). [There's plenty of room at the Top: What will drive computer performance after Moore's law?](https://doi.org/10.1126/science.aam9744) *Science*, 368(6495). · [PDF](https://www.microsoft.com/en-us/research/wp-content/uploads/2020/11/Leiserson-et-al-Theres-plenty-of-room-at-the-top.pdf)

**Cómo comparar CPU y GPU sin engañarse**
- Gregg, C. & Hazelwood, K. (2011). [Where is the data? Why you cannot debate CPU vs. GPU performance without the answer](https://doi.org/10.1109/ISPASS.2011.5762730). *IEEE ISPASS 2011*. · [PDF](https://web.stanford.edu/~cgregg/chris-gregg/pubs/WhereIsTheData.pdf)
- Lee, V. W. et al. (2010). [Debunking the 100X GPU vs. CPU myth: an evaluation of throughput computing on CPU and GPU](https://doi.org/10.1145/1815961.1816021). *ISCA 2010*. · [Retrospectiva ISCA@50 (2023)](https://sites.coecis.cornell.edu/isca50retrospective/files/2023/06/Lee_2010_Debunking.pdf)
- Hoefler, T. & Belli, R. (2015). [Scientific benchmarking of parallel computing systems: twelve ways to tell the masses when reporting performance results](https://doi.org/10.1145/2807591.2807644). *SC15*.
- Mozzillo, A., Zecchini, L., Gagliardelli, L., Aslam, A., Bergamaschi, S. & Simonini, G. (2025). [Evaluation of Dataframe Libraries for Data Preparation on a Single Machine](https://arxiv.org/abs/2312.11122). *EDBT 2025*.

**Panorámicas y arquitectura**
- Owens, J. D., Luebke, D., Govindaraju, N., Harris, M., Krüger, J., Lefohn, A. E. & Purcell, T. J. (2007). [A Survey of General-Purpose Computation on Graphics Hardware](https://doi.org/10.1111/j.1467-8659.2007.01012.x). *Computer Graphics Forum*, 26(1), 80–113.
- Nickolls, J., Buck, I., Garland, M. & Skadron, K. (2008). [Scalable Parallel Programming with CUDA](https://doi.org/10.1145/1365490.1365500). *ACM Queue*, 6(2).
- Mittal, S. & Vetter, J. S. (2015). [A Survey of CPU-GPU Heterogeneous Computing Techniques](https://doi.org/10.1145/2788396). *ACM Computing Surveys*, 47(4).
- Hennessy, J. L. & Patterson, D. A. (2019). [A new golden age for computer architecture](https://doi.org/10.1145/3282307). *Communications of the ACM*, 62(2), 48–60.

**Las librerías que estas imitan**
- Harris, C. R., Millman, K. J., van der Walt, S. J. et al. (2020). [Array programming with NumPy](https://doi.org/10.1038/s41586-020-2649-2). *Nature*, 585, 357–362.
- McKinney, W. (2010). [Data Structures for Statistical Computing in Python](https://doi.org/10.25080/Majora-92bf1922-00a). *Proceedings of the 9th Python in Science Conference* (pandas).
- Pedregosa, F. et al. (2011). [Scikit-learn: Machine Learning in Python](https://www.jmlr.org/papers/v12/pedregosa11a.html). *Journal of Machine Learning Research*, 12, 2825–2830.
- Breiman, L. (2001). [Random Forests](https://doi.org/10.1023/A:1010933404324). *Machine Learning*, 45(1), 5–32.

**Herramientas de Python para GPU**
- Okuta, R., Unno, Y., Nishino, D., Hido, S. & Loomis, C. (2017). [CuPy: A NumPy-compatible library for NVIDIA GPU calculations](http://learningsys.org/nips17/assets/papers/paper_16.pdf). *Workshop LearningSys, NeurIPS 2017*.
- Lam, S. K., Pitrou, A. & Seibert, S. (2015). [Numba: a LLVM-based Python JIT compiler](https://doi.org/10.1145/2833157.2833162). *LLVM-HPC 2015*.
- Tillet, P., Kung, H. T. & Cox, D. (2019). [Triton: an intermediate language and compiler for tiled neural network computations](https://doi.org/10.1145/3315508.3329973). *MAPL 2019*.
- Raschka, S., Patterson, J. & Nolet, C. (2020). [Machine Learning in Python: Main developments and technology trends in data science, machine learning, and artificial intelligence](https://doi.org/10.3390/info11040193). *Information*, 11(4), 193.

**Documentación y anuncios de NVIDIA** (origen de las cifras de fabricante)
- [cudf.pandas: cómo funciona](https://docs.nvidia.com/cudf/latest/cudf_pandas/how-it-works/) · [uso y perfilado](https://docs.nvidia.com/cudf/latest/cudf_pandas/usage/)
- [RAPIDS cuDF Accelerates pandas Nearly 150x with Zero Code Changes](https://developer.nvidia.com/blog/rapids-cudf-accelerates-pandas-nearly-150x-with-zero-code-changes) (2024)
- [RAPIDS cuDF Unified Memory Accelerates pandas up to 30x on Large Datasets](https://developer.nvidia.com/blog/rapids-cudf-unified-memory-accelerates-pandas-up-to-30x-on-large-datasets/) (2024)
- [cuml.accel: visión general](https://docs.nvidia.com/cuml/latest/cuml-accel/) · [estimadores soportados](https://docs.nvidia.com/cuml/latest/cuml-accel/compatibility/) · [registro y perfilado](https://docs.nvidia.com/cuml/latest/cuml-accel/logging-and-profiling/)
- [NVIDIA cuML Brings Zero Code Change Acceleration to scikit-learn](https://developer.nvidia.com/blog/nvidia-cuml-brings-zero-code-change-acceleration-to-scikit-learn/) (2025)
- [Ficha técnica de la NVIDIA H100](https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306)

**Material propio**
- [`notebooks/python-gpu-nvidia.ipynb`](https://colab.research.google.com/github/stivenson/stivenson.github.io/blob/main/notebooks/python-gpu-nvidia.ipynb) — todo el código del artículo, ejecutable en Colab de arriba a abajo.
- Clementi, N. (2026). «Introducción a la ciencia de datos en GPUs», [Platzi Conf Bogotá 2026](https://platzi.com/conf/), 29 de agosto, Ágora, Bogotá. Una charla suya sobre el mismo tema, en inglés y con más detalle técnico: [RAPIDS: GPU-Accelerated Data Science for PyData Users](https://www.youtube.com/watch?v=IJ8rjVD4-yE), con Mike McCarty. Diapositivas usadas aquí: «Aceleración con cudf.pandas sin cambio de código», «Entender qué se ejecuta en la GPU y qué no», el perfil línea a línea de `cuml.accel`, «¿Mi problema tiene la forma adecuada para la GPU?» y «Ciencia de datos con CUDA-X».
