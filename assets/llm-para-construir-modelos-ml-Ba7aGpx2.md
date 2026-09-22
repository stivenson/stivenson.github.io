---
title: "Construir modelos de ML con LLM: mapa del campo y qué funciona de verdad"
date: "2026-08-25"
slug: "llm-para-construir-modelos-ml"
description: "Estrategias, metodologías, técnicas y herramientas actuales para generar modelos de machine learning apoyándose en LLM — con la evidencia de dónde ayudan, dónde no y cómo evitar que el agente se atasque."
tags: ["IA", "Machine Learning", "LLM", "AutoML", "Agentes"]
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
</style>

# **Construir modelos de ML con LLM: mapa del campo y qué funciona de verdad**

## **📌 Introducción: tres cosas distintas con el mismo nombre**

Cuando alguien dice *"uso IA para hacer modelos de machine learning"* puede estar hablando de tres cosas que no se parecen en nada:

1. Un agente que **escribe el pipeline** — carga los datos, entrena, evalúa, itera.
2. Un LLM que **es una pieza dentro del pipeline** — propone <span class="gl"><input type="checkbox" id="gl-feature" class="gl-c"><label for="gl-feature" class="gl-t">features</label><span class="gl-m"><label for="gl-feature" class="gl-bg"></label><span class="gl-b"><b>Feature (variable de entrada)</b><span>Cada una de las columnas que el modelo mira para predecir. Si predices el precio de un piso, sus features son los metros, el barrio, el año de construcción.</span><span><b>Ingeniería de features</b> es fabricar columnas nuevas a partir de las que ya tienes —dividir peso entre talla al cuadrado para obtener un IMC, marcar si una fecha cae en festivo—. Suele mover más la métrica que cambiar de algoritmo.</span><label for="gl-feature" class="gl-x">Entendido</label></span></span></span>, ajusta <span class="gl"><input type="checkbox" id="gl-hiper" class="gl-c"><label for="gl-hiper" class="gl-t">hiperparámetros</label><span class="gl-m"><label for="gl-hiper" class="gl-bg"></label><span class="gl-b"><b>Hiperparámetro</b><span>Los ajustes del modelo que <b>tú</b> eliges antes de entrenar: cuántos árboles, de qué profundidad, a qué ritmo aprende. No se aprenden de los datos, a diferencia de los parámetros internos.</span><span>Buscar la mejor combinación se llama <i>optimización de hiperparámetros</i>, y es un bucle de prueba y error caro: cada combinación exige entrenar el modelo entero otra vez.</span><label for="gl-hiper" class="gl-x">Entendido</label></span></span></span>, convierte texto en vectores.
3. Un LLM que **fabrica los datos** con los que se entrena otro modelo más pequeño.

Confundirlas es el error caro. Cada una se monta distinto, cuesta distinto y —sobre todo— **se evalúa distinto**. Este artículo es el mapa de las tres, con las herramientas concretas de 2025-2026 y, en la sección que más me importa, la evidencia de dónde el LLM no aporta nada medible.

<em>Estado del campo a septiembre de 2026. Es una materia que se mueve rápido: entre que escribí la primera versión y la revisé, el Reglamento de IA de la UE cambió de calendario y uno de los repositorios que cito dejó de existir. Las fechas de cada cifra están en los enlaces.</em>

| | El LLM es… | Produce | La pregunta que responde la evaluación |
|---|---|---|---|
| **A. Constructor** | ingeniero de ML | código de pipeline | ¿la métrica final es mejor que mi <span class="gl"><input type="checkbox" id="gl-baseline" class="gl-c"><label for="gl-baseline" class="gl-t">baseline</label><span class="gl-m"><label for="gl-baseline" class="gl-bg"></label><span class="gl-b"><b>Baseline (línea de partida)</b><span>El modelo sencillo y barato contra el que se compara todo lo demás: un GBDT con sus ajustes por defecto, o incluso «predecir siempre la clase mayoritaria».</span><span>Es la pieza más importante de cualquier evaluación honesta. Sin baseline, una cifra alta no dice nada: puede que el problema fuera fácil. <b>Toda la regla de la ablación de este artículo consiste en construir un buen baseline y ver si el LLM lo supera.</b></span><label for="gl-baseline" class="gl-x">Entendido</label></span></span></span>? |
| **B. Componente** | pieza del pipeline | features, hiperparámetros, embeddings | ¿el pipeline **con** el LLM gana al pipeline **sin** él? |
| **C. Profesor** | fábrica de datos | dataset etiquetado o sintético | ¿el modelo alumno gana al entrenado con los datos originales? |

Hay una constante que conviene fijar desde ahora, porque el marketing la difumina sin parar:

> **El LLM casi nunca es el modelo que predice.** Escribe el código que lo entrena, o le pasa features, o le fabrica <span style="color:#06b6d4">los datos</span>. Debajo casi siempre hay un <span class="gl"><input type="checkbox" id="gl-gbdt" class="gl-c"><label for="gl-gbdt" class="gl-t">gradient boosting</label><span class="gl-m"><label for="gl-gbdt" class="gl-bg"></label><span class="gl-b"><b>Gradient boosting (GBDT)</b><span>Las siglas son de <i>gradient boosted decision trees</i>. Es un modelo hecho de <b>muchos árboles pequeños encadenados</b>: cada árbol nuevo se entrena para corregir el error que dejaron los anteriores, y la predicción final es la suma de todos.</span><span>Es el caballo de batalla de los datos en tabla —filas y columnas— desde hace más de una década. Las implementaciones que verás nombradas aquí son <i>XGBoost</i>, <i>LightGBM</i> y <i>CatBoost</i>.</span><label for="gl-gbdt" class="gl-x">Entendido</label></span></span></span>, una red preentrenada o un encoder pequeño. Si no sabes distinguir esas dos capas, no puedes medir cuál de las dos te está fallando.

Hay además un eje transversal que afecta a las tres estrategias: la <span class="gl"><input type="checkbox" id="gl-doom-loop" class="gl-c"><label for="gl-doom-loop" class="gl-t">fiabilidad de la generación</label><span class="gl-m"><label for="gl-doom-loop" class="gl-bg"></label><span class="gl-b"><b>Doom loop (bucle degenerativo)</b><span>Una repetición que consume tokens, tiempo o ejecuciones sin producir progreso. Puede ser textual —el modelo repite una frase o un razonamiento— o conductual —el agente vuelve a ejecutar el mismo código, el mismo experimento o la misma corrección.</span><span>Liquid AI lo estudia como un fallo de inferencia: el contexto repetido hace cada vez más probable la misma continuación. En un agente de ML, la unidad que se repite puede ser una secuencia de herramientas completa.</span><label for="gl-doom-loop" class="gl-x">Entendido</label></span></span></span>. Un sistema puede acertar una vez y seguir siendo un mal agente si llega a la solución después de gastar la mayor parte del presupuesto en un bucle.

### **La lengua de color de este artículo**

Igual que en las visualizaciones, cada color significa lo mismo de principio a fin:

- <span style="color:#a855f7"><strong>violeta</strong></span> — lo que genera el LLM
- <span style="color:#10b981"><strong>esmeralda</strong></span> — lo que se entrena y se mide de verdad
- <span style="color:#06b6d4"><strong>cian</strong></span> — los datos
- <span style="color:#f59e0b"><strong>ámbar</strong></span> — el coste
- <span style="color:#f43f5e"><strong>rosa</strong></span> — la advertencia

Y una segunda ayuda: los términos subrayados con 💡 abren una ficha con su definición. Están puestos en el primer sitio donde el término aparece, así que si algo suena a jerga, probablemente lo tengas ahí a un clic.

---

## **🧭 Empieza por aquí: qué encaja en tu caso**

Antes de la teoría, el atajo. Describe tu problema y la visualización te dice qué estrategia aplica — y, cuando toca, por qué **ninguna**:

<iframe src="/ovas/llm-ml-decision.html" title="Decisor: qué papel juega el LLM en tu modelo" loading="lazy"></iframe>

Fíjate en que el panel siempre separa dos bloques: lo <span style="color:#a855f7">violeta</span> que aporta el LLM y lo <span style="color:#10b981">esmeralda</span> que realmente predice. Esa separación es el artículo entero en miniatura.

Va a soltarte nombres que todavía no hemos presentado —CAAFE, TabPFN v2, «sembrada con la configuración por defecto»—. No pasa nada: sigue leyendo, cada uno tiene su sección más abajo, y **vuelve aquí al final**. La segunda pasada por el decisor es la que sirve para decidir de verdad.

---

## **🏗️ Estrategia A — el LLM escribe el pipeline**

### **La metodología: búsqueda en el espacio del código**

La idea que destrabó este campo es de [AIDE](https://arxiv.org/abs/2502.13138) (Weco AI): tratar la ingeniería de ML como **un problema de optimización de código**, y el ensayo y error como **una búsqueda en árbol** sobre el espacio de soluciones posibles.

El bucle es siempre el mismo:

<span style="color:#a855f7">escribir</span> → <span style="color:#10b981">ejecutar y medir</span> → leer el error o la métrica → <span style="color:#a855f7">reescribir</span>

Lo que lo separa de pedirle ideas a un chat es la segunda flecha: la **función de fitness es la ejecución real**. El agente no opina sobre si su código va a funcionar; lo corre y lee el número. Cuando falla, lee el traceback. Esa es toda la diferencia.

Pero el bucle tiene un fallo propio que conviene medir: puede continuar sin avanzar. El agente puede reescribir casi el mismo bloque, volver a producir el mismo error o repetir una secuencia de herramientas que ya demostró no funcionar. Es un <span class="gl"><input type="checkbox" id="gl-doom-loop-2" class="gl-c"><label for="gl-doom-loop-2" class="gl-t">doom loop de agente</label><span class="gl-m"><label for="gl-doom-loop-2" class="gl-bg"></label><span class="gl-b"><b>Doom loop de agente</b><span>Un ciclo de generación o de acciones que parece razonamiento, pero no cambia el estado del experimento. Ejemplos: el mismo traceback dos veces seguidas, la misma configuración de entrenamiento con distinto texto alrededor o el mismo parche que vuelve a fallar.</span><span>La prueba no es que haya texto repetido: es que no aparece una observación nueva ni una decisión atribuible. El detector debe mirar tanto la salida del modelo como las llamadas a herramientas y los resultados.</span><label for="gl-doom-loop-2" class="gl-x">Entendido</label></span></span></span>. El agente necesita una condición de progreso, no solo una condición de error.

La regla operativa es sencilla: cada iteración debe producir una observación nueva, una modificación identificable o una mejora medible. Si no produce ninguna de las tres, se cuenta como estancamiento y consume presupuesto sin aportar evidencia.

### **El bucle, paso a paso**

Lo genérico es lo de arriba: escribir → ejecutar → leer → reescribir. Lo que verás abajo es el ciclo concreto de **MLE-STAR**, que tomo como ejemplo por ser el más completo de los publicados: la búsqueda web, la <span class="gl"><input type="checkbox" id="gl-ablacion" class="gl-c"><label for="gl-ablacion" class="gl-t">ablación</label><span class="gl-m"><label for="gl-ablacion" class="gl-bg"></label><span class="gl-b"><b>Ablación</b><span>Quitar una pieza y volver a medir, para saber cuánto aportaba esa pieza. Si al retirarla el resultado no se mueve, no aportaba nada — por muy convincente que sonara.</span><span>Aparece en dos niveles a lo largo del artículo, y conviene no confundirlos: aquí se le quitan <b>bloques al pipeline</b> para ver cuál pesa más; más adelante se le quita <b>el LLM al pipeline entero</b> para ver si aportó algo. Es el mismo gesto aplicado a escalas distintas.</span><label for="gl-ablacion" class="gl-x">Entendido</label></span></span></span> por bloque y los dos *checkers* son suyos, no del bucle genérico de AIDE.

<iframe src="/ovas/ml-agent-loop.html" title="El bucle de un agente que construye modelos, paso a paso" loading="lazy"></iframe>

Presta atención al contador <span style="color:#f59e0b">ámbar</span>: cada paso <span style="color:#10b981">esmeralda</span> entrena de verdad. Volveremos a ese número.

Un agente robusto necesita un estado adicional junto a «ejecutando» y «falló»: <span class="gl"><input type="checkbox" id="gl-stagnation-checker" class="gl-c"><label for="gl-stagnation-checker" class="gl-t">checker de estancamiento</label><span class="gl-m"><label for="gl-stagnation-checker" class="gl-bg"></label><span class="gl-b"><b>Checker de estancamiento</b><span>Un verificador que compara iteraciones para detectar que el agente repite la misma acción sin progreso. Puede comparar el traceback, el hash normalizado del código, la configuración del experimento, la métrica y la secuencia de herramientas.</span><span>Al detectar el bucle, no debe limitarse a pedir «intenta otra vez»: debe resumir el historial, bloquear la estrategia repetida, volver a un checkpoint o detener el intento.</span><label for="gl-stagnation-checker" class="gl-x">Entendido</label></span></span></span>. Así se evita confundir más tokens con más investigación.

### **Las herramientas, y qué aporta cada una de distinto**

**[AIDE](https://github.com/WecoAI/aideml)** — el origen. Árbol de búsqueda sobre soluciones. Es el <span class="gl"><input type="checkbox" id="gl-scaffold" class="gl-c"><label for="gl-scaffold" class="gl-t">andamiaje</label><span class="gl-m"><label for="gl-scaffold" class="gl-bg"></label><span class="gl-b"><b>Andamiaje (<i>scaffold</i>)</b><span>Es todo lo que rodea al LLM para convertirlo en un agente: el bucle que lo llama, las instrucciones que recibe, las herramientas que puede usar, la memoria de lo que ya intentó y las reglas de cuándo parar.</span><span>Distinguirlo del modelo importa mucho en este artículo: cuando un sistema mejora, la pregunta siempre es si mejoró el andamiaje o si simplemente le pusieron debajo un modelo más nuevo.</span><label for="gl-scaffold" class="gl-x">Entendido</label></span></span></span> contra el que se compara todo lo demás.

**[MLE-STAR](https://research.google/blog/mle-star-a-state-of-the-art-machine-learning-engineering-agents/)** (Google Research, NeurIPS 2025) — aporta dos ideas propias que valen más que su ranking:

- **Búsqueda web para sembrar la solución inicial.** En vez de partir de lo que el modelo recuerda de su preentrenamiento —congelado en una fecha—, busca qué se está usando hoy para esa tarea. Es la diferencia entre un ingeniero que lleva dos años sin leer nada y uno que abre el navegador.
- **Refinamiento dirigido por ablación.** En vez de reescribir el script entero cada vuelta, mide cuánto aporta cada bloque (preprocesado, features, modelo, ensamblado) y solo reescribe el que más pesa. Cambiar una pieza a la vez es lo que hace el resultado **atribuible**.

Trae además tres agentes de apoyo que valen su peso en oro y que casi nadie menciona: un **depurador** que insiste hasta que el script arranca, un **checker de fuga de datos** que revisa el preprocesado y genera una versión corregida si detecta contaminación entre train y test, y un **checker de uso de datos** que verifica que el script no esté ignorando ficheros que le entregaste. Se publicó como *sample* del ADK de Google, retirado del repositorio en julio de 2026 — el paper y su descripción de los tres módulos siguen siendo la referencia.

En un agente que se use de verdad añadiría un cuarto módulo: un **checker de estancamiento**. El depurador responde a «el código falla»; este responde a «el agente sigue haciendo lo mismo». Debe marcar como repetida una acción aunque el LLM haya cambiado la explicación que la acompaña.

**[R&D-Agent](https://github.com/microsoft/RD-Agent)** (Microsoft) — encuadra el trabajo como un proceso de investigación iterativo, no como un modelado suelto: propone hipótesis, las implementa, mide y acumula lo aprendido entre rondas.

**[MLZero / AutoGluon Assistant](https://arxiv.org/abs/2505.13941)** (Amazon, NeurIPS 2025) — multiagente y multimodal, con memoria semántica y episódica. Describes la tarea en lenguaje natural y el sistema percibe los datos, escribe el código, lo ejecuta y se depura solo, sin configuración. En su propio benchmark multimodal de 25 tareas reporta una tasa de éxito de 0,92.

### **El bucle que no aparece en la métrica**

Los agentes de construcción no deberían evaluarse solo por la mejor métrica que alcanzan. También hay que medir cuánto presupuesto gastan antes de llegar allí y cuánto de ese presupuesto se consumió repitiendo acciones.

Una instrumentación mínima guarda, por iteración:

- el hash del código normalizado y de la configuración del experimento;
- el traceback y su firma, ignorando rutas y números de línea variables;
- las herramientas llamadas y sus argumentos;
- la métrica, el tiempo, los tokens y el coste acumulado;
- si apareció una observación nueva o una mejora atribuible.

Con eso pueden reportarse la **tasa de doom loops**, los **tokens desperdiciados**, las **iteraciones hasta la primera mejora**, el **coste hasta la mejor solución** y la **tasa de éxito sin reintentos**. Un agente que gana después de ocho intentos, pero repite seis veces el mismo fallo, no es equivalente a uno que llega al mismo resultado en dos.

La comparación honesta conserva el mismo modelo base, temperatura, semilla y presupuesto, pero añade una regla de parada por estancamiento. De lo contrario, el sistema puede parecer mejor simplemente porque se le permitió seguir gastando.

### **Una intervención especializada: Antidoom**

Liquid AI propone una corrección más localizada para el primer nivel del problema: el modelo de lenguaje. Su método, [Antidoom](https://www.liquid.ai/blog/antidoom), genera ejemplos de respuestas repetitivas, localiza el primer token que inicia el bucle y entrena al modelo para preferir varias alternativas plausibles en esa posición.

La técnica se llama <span class="gl"><input type="checkbox" id="gl-ftpo" class="gl-c"><label for="gl-ftpo" class="gl-t">Final Token Preference Optimization (FTPO)</label><span class="gl-m"><label for="gl-ftpo" class="gl-bg"></label><span class="gl-b"><b>FTPO</b><span>Una variante de optimización por preferencias que modifica el token final de un prefijo que ya está a mitad de generación. En lugar de reentrenar una respuesta completa, marca como rechazado el token que inicia la repetición y como elegidos varios tokens alternativos.</span><span>La pérdida mantiene el resto de la distribución cerca del modelo de referencia. La intención es retirar un fallo concreto sin convertir la corrección en un nuevo sesgo general del modelo.</span><label for="gl-ftpo" class="gl-x">Entendido</label></span></span></span>. Es una adaptación LoRA del modelo, no un cambio del algoritmo de ML que el agente acaba entrenando.

Hay que mantener separadas las capas:

| Capa | Qué corrige | Ejemplo de intervención |
|---|---|---|
| **Modelo** | repetición textual durante la generación | Antidoom / FTPO |
| **Agente** | repetición de código, errores o herramientas | checker de estancamiento, memoria de acciones y reglas de parada |
| **Protocolo** | presupuesto desperdiciado y métricas infladas | coste hasta la mejor solución, tasa de loops y comparación con igual presupuesto |

Para quien consume una API cerrada, FTPO no es una opción operativa: no controla los pesos del modelo. Para quien mantiene un modelo abierto, sí es una línea de ajuste especializada. Aun así, debe validarse con tareas nuevas y vigilar el sobreentrenamiento: el objetivo es reducir bucles, no suprimir palabras como «Wait» o «Alternatively» en cualquier contexto.

Hay otro confusor: la temperatura. Subirla puede ayudar a escapar de una continuación repetitiva, pero es un parche de inferencia, no una reparación del modelo. Si el contexto ya ha reforzado la secuencia, el agente puede seguir atrapado; y una temperatura mayor también puede seleccionar tokens menos preferidos y empeorar la solución. La comparación debe fijar la temperatura y reportar cuánto tiempo, cuántos tokens y cuántos experimentos se consumieron antes de escapar.

### **⚠️ Los números que casi nadie cita bien**

Aquí hay que frenar, porque este es el punto donde el 90 % del contenido sobre el tema miente sin querer.

Primero, qué se está midiendo. **[MLE-bench](https://arxiv.org/abs/2410.07095)** (OpenAI) funciona como un torneo: toma **75 competiciones reales de <span class="gl"><input type="checkbox" id="gl-kaggle" class="gl-c"><label for="gl-kaggle" class="gl-t">Kaggle</label><span class="gl-m"><label for="gl-kaggle" class="gl-bg"></label><span class="gl-b"><b>Kaggle</b><span>Una plataforma donde empresas e instituciones publican un problema real con sus datos, y miles de personas compiten durante semanas por el mejor modelo. Cada competición tiene una <b>tabla de clasificación</b> pública que ordena a los participantes por su puntuación.</span><span>Por eso sirve de vara de medir para agentes: permite comparar su solución con lo que consiguieron personas que se dedicaron a fondo al mismo problema.</span><label for="gl-kaggle" class="gl-x">Entendido</label></span></span></span>** y mira si la solución del agente habría quedado en el podio de las personas que compitieron. Quedar en el podio es ganar <span class="gl"><input type="checkbox" id="gl-medalla" class="gl-c"><label for="gl-medalla" class="gl-t">medalla</label><span class="gl-m"><label for="gl-medalla" class="gl-bg"></label><span class="gl-b"><b>Medalla en Kaggle</b><span>En cada competición de Kaggle, las posiciones altas de la clasificación reciben medalla de <b>bronce, plata u oro</b> según en qué percentil quedaron. «Consigue medalla» significa <b>bronce o mejor</b>: entrar en ese tramo, no ganar la competición.</span><span>Es una vara razonable —competir con humanos que dedicaron semanas— pero también generosa. Fíjate siempre en el porcentaje de <b>oro</b> aparte, que es el que mide algo cercano a ganar.</span><label for="gl-medalla" class="gl-x">Entendido</label></span></span></span>. De esas 75, las **22 más fáciles** forman una versión reducida, **MLE-bench Lite**, y muchos resultados solo se miden ahí.

| Sistema | Qué prueba | Medalla |
|---|---|---|
| o1-preview + AIDE | las 75 | **16,9 %** |
| AIDE | solo las 22 fáciles | **25,8 %** |
| MLE-STAR + Gemini-2.0-Flash | solo las 22 fáciles | **43,9 %** |
| MLE-STAR + Gemini-2.5-Pro | solo las 22 fáciles | **63,6 %** |

Dos lecturas que solo aparecen al poner la tabla completa:

**Primera:** citar «64 % frente al 16,9 % de OpenAI» como prueba de progreso es comparar 22 competiciones fáciles contra las 75 completas. No mide lo mismo.

**Segunda, y más incómoda:** el mismo andamiaje, MLE-STAR, pasa de **43,9 % a 63,6 %** solo por cambiar el modelo base de Gemini-2.0-Flash a Gemini-2.5-Pro. Casi 20 puntos que no vienen de la arquitectura del agente sino del LLM que hay debajo. **El andamiaje importa menos de lo que sugiere su nombre en el paper.** Es una advertencia práctica: antes de invertir en un scaffold sofisticado, prueba tu scaffold sencillo con un modelo mejor.

### **Antes de creer un porcentaje, pregunta cinco cosas**

Esta lista sirve para cualquier titular de agentes, no solo para los de aquí. Si el paper o el post no responde a las cinco, el número no es comparable con nada:

1. **¿Qué prueba, y qué cuenta como éxito?** 22 competiciones fáciles y 75 de dificultad mixta no son la misma prueba, aunque las dos se llamen MLE-bench. Y «medalla» es bronce o mejor: el oro, lo más parecido a ganar, suele ser bastante menor — en la mejor fila de la tabla, 36,4 % frente al 63,6 %.
2. **¿Cuántos intentos?** Es la diferencia entre <span class="gl"><input type="checkbox" id="gl-passk" class="gl-c"><label for="gl-passk" class="gl-t">pass@1 o pass@8</label><span class="gl-m"><label for="gl-passk" class="gl-bg"></label><span class="gl-b"><b>pass@k</b><span>El porcentaje de tareas resueltas dando al sistema <b><i>k</i> intentos</b> y contando la tarea como acertada si <b>alguno</b> de ellos lo consigue. <i>pass@1</i> es un intento; <i>pass@8</i>, ocho.</span><span>Por eso <i>pass@8</i> siempre sale igual o mejor que <i>pass@1</i> — y por eso comparar el <i>pass@8</i> de uno con el <i>pass@1</i> de otro no dice nada. Además cuesta ocho veces más cómputo.</span><label for="gl-passk" class="gl-x">Entendido</label></span></span></span>: el mismo o1-preview + AIDE pasa del 16,9 % al 34,1 % con ocho intentos, que cuestan ocho veces más.
3. **¿Cuántas <span class="gl"><input type="checkbox" id="gl-semilla" class="gl-c"><label for="gl-semilla" class="gl-t">semillas</label><span class="gl-m"><label for="gl-semilla" class="gl-bg"></label><span class="gl-b"><b>Semilla (<i>seed</i>)</b><span>El número que fija el azar de un experimento: cómo se barajan los datos, cómo se inicializan los pesos, qué configuraciones prueba primero una búsqueda. Con la misma semilla, el experimento se repite idéntico.</span><span>Por eso se corre todo con varias semillas y se reporta la media con su margen: <b>un resultado con una sola semilla no distingue una mejora real de haber tenido suerte.</b> Cuando veas un porcentaje sin margen, pregunta cuántas semillas hubo detrás.</span><label for="gl-semilla" class="gl-x">Entendido</label></span></span></span>, y con qué margen?** Un porcentaje sin ± no permite saber si la diferencia con el rival cabe dentro del ruido.
4. **¿Qué modelo base?** Es la variable que más movió los resultados de esta tabla: casi 20 puntos sin tocar el agente.
5. **¿Con qué presupuesto, y contra qué referencia?** Un sistema que gana con el triple de horas no ganó — pagó. Y un acierto medido contra las respuestas de otros LLM mide parecido, no acierto. Es el caso de Jev: su «193,6× más rápido y 444,6× más barato» sale de [cuatro flujos de trabajo](https://evals.typesafe.ai/) diseñados por su propio equipo y calificados con la media de GPT-6 Astra y Fable 5.1, algo que ellos mismos reconocen.

### **La escala real del asunto**

Los benchmarks dan la cifra que el marketing omite. En MLE-bench cada intento dispone de:

> **36 vCPU · 440 GB de RAM · una Nvidia A10 de 24 GB · hasta 24 horas**, y todos los experimentos se repiten con 3 semillas.

Ahora sí, **el número del contador**. Recorre la visualización de arriba hasta el final y se para en **16 entrenamientos**: uno de la primera ejecución, cuatro por vuelta para medir la ablación de cada bloque —tres vueltas—, y uno más al ensamblar. Dieciséis entrenamientos completos para **un** intento, en **una** competición. Multiplícalo por las 3 semillas del protocolo y por las competiciones del benchmark, y ya tienes la factura que el titular omite.

Eso <span style="color:#f59e0b">cuesta dinero por iteración</span>. Cuando compares un agente contra tu baseline, la comparación honesta incluye esa factura.

---

## **🧩 Estrategia B — el LLM como pieza del pipeline**

Aquí el LLM no escribe el pipeline: **vive dentro de él**. Y la evaluación cambia: ya no basta con «mi modelo saca 0,91». Hay que responder si el pipeline **con** el LLM gana al pipeline **sin** él. Es decir: **ablación**, o no sabes nada.

Y aquí la palabra cambia de escala, que es algo que casi nunca se dice. En MLE-STAR la ablación quitaba **bloques del pipeline** para ver cuál pesaba más. Ahora quitamos **el LLM entero** para ver si aportó algo. Mismo gesto —retirar una pieza y volver a medir— aplicado un nivel más arriba. Es la lección metodológica que sostiene todo lo que viene después.

### **Ingeniería de features**

Es donde el LLM aporta algo que ningún <span class="gl"><input type="checkbox" id="gl-automl" class="gl-c"><label for="gl-automl" class="gl-t">AutoML</label><span class="gl-m"><label for="gl-automl" class="gl-bg"></label><span class="gl-b"><b>AutoML</b><span>Herramientas que automatizan la parte mecánica de construir un modelo: prueban varios algoritmos, ajustan sus hiperparámetros y combinan los mejores, sin que escribas ese código. <i>AutoGluon</i>, <i>MLJAR</i> y <i>auto-sklearn</i> son ejemplos.</span><span>Llevan años haciéndolo bien y son el rival de verdad contra el que hay que medir a un agente con LLM — no contra un modelo hecho a mano en una tarde.</span><label for="gl-automl" class="gl-x">Entendido</label></span></span></span> clásico puede: **conocimiento del mundo que no está en las columnas.** Que peso y talla dan un IMC. Que un código postal implica renta media. Que el 24 de diciembre no es un martes cualquiera para una serie de ventas.

**[CAAFE](https://github.com/noahho/CAAFE)** (NeurIPS 2023) — le describes el dataset en prosa y propone features nuevas de forma iterativa. El detalle que lo separa de pedirle ideas al chat: **verifica cada feature generada** contra validación y descarta las que no mejoran. La <span style="color:#a855f7">propuesta</span> es del LLM; el <span style="color:#10b981">veredicto</span> es de los datos.

**[FeatLLM](https://arxiv.org/abs/2404.09491)** — pensado para *few-shot*: le enseñas un puñado de ejemplos etiquetados y extrae **reglas** que separan las clases, que luego se materializan como features binarias.

**[LLM-FE](https://arxiv.org/abs/2503.14434)** — usa el LLM como operador de mutación dentro de un bucle evolutivo: cada generación propone variantes de features y la validación selecciona.

**Texto libre convertido en columnas.** Cuando la información vive en una columna de texto —una nota, una queja, una descripción—, el mismo patrón se aplica a **preguntas** en vez de a fórmulas. El [cookbook de *autoresearch*](https://docs.typesafe.ai/cookbooks/autoresearch_feature_discovery) de TypeSafe AI lo muestra con 2.000 reseñas de vino: un LLM (Claude Sonnet 5) propone preguntas sobre cada nota; [Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) —un modelo lanzado en septiembre de 2026 que no genera texto, sino que responde preguntas cerradas con una probabilidad, y al que vuelvo en el etiquetado— las contesta fila a fila; y CatBoost aprende sobre esas respuestas. Error sobre 800 reseñas que el bucle nunca vio (RMSE en puntos del crítico; menos es mejor):

| Cómo se convierte la nota en predicción | RMSE |
|---|---|
| CatBoost leyendo la nota como conteo de palabras | 2,47 |
| Pedirle a Jev la puntuación directamente — Jev **como el modelo** | 2,15 |
| 18 preguntas de una sola ronda → CatBoost | 1,87 |
| 38 preguntas tras cinco rondas → CatBoost — Jev **como pieza** | **1,77** |

Dos lecturas. La primera confirma la tesis de este artículo con números: el mismo modelo rinde más como pieza que como predictor. La segunda repite la del estudio de hiperparámetros que verás en el contrapunto: la primera ronda hace casi todo el trabajo, y las cuatro siguientes solo bajan 0,10 puntos. Y pásale el checklist: un dataset, una corrida, cifras del propio fabricante — y **sin el baseline de embeddings**, que ellos mismos dejan como siguiente paso y que es justo la comparación de «Embeddings como features», un poco más abajo. <span style="color:#f59e0b">Un coste que la tabla no muestra:</span> cada fila nueva en producción es otra llamada a la API, no un vector calculado una vez en tu máquina.

### **Hiperparámetros y arquitectura**

**[AgentHPO](https://arxiv.org/abs/2402.01881)** deja que un agente lea la tarea, lance experimentos y ajuste según el historial. **[LLAMBO](https://arxiv.org/abs/2402.03921)** va más lejos: sustituye el proceso gaussiano dentro de la optimización bayesiana por predicciones del LLM.

La promesa es seductora: menos ensayos, configuración más simple, y de regalo una explicación en prosa de por qué eligió lo que eligió. Guarda esta sección en la cabeza — **es donde la evidencia se pone fea**, y volvemos a ella en el contrapunto.

### **Embeddings como features**

El patrón más aburrido y probablemente el más rentable: serializar cada fila a texto, pasarla por un <span class="gl"><input type="checkbox" id="gl-emb" class="gl-c"><label for="gl-emb" class="gl-t">modelo de embeddings congelado</label><span class="gl-m"><label for="gl-emb" class="gl-bg"></label><span class="gl-b"><b>Embedding congelado</b><span>Un <b>embedding</b> es la traducción de un texto a una lista de números —un vector— colocada de forma que los textos parecidos caen cerca. <b>Congelado</b> significa que ese modelo no se reentrena: se usa tal cual, como si fuera una calculadora.</span><span>La ventaja práctica es que el resultado <b>se puede guardar en caché</b>: calculas el vector de cada fila una vez, lo almacenas, y a partir de ahí tu pipeline no vuelve a llamar a ningún LLM — ni en entrenamiento ni en producción.</span><label for="gl-emb" class="gl-x">Entendido</label></span></span></span>, y alimentar el vector resultante a un modelo aguas abajo. Sin fine-tuning, sin llamadas en producción si cacheas.

El [trabajo de Koloski et al. sobre embeddings de LLM para datos tabulares](https://arxiv.org/abs/2502.11596) deja dos hallazgos que hay que leer juntos, porque por separado engañan. El primero es el esperable: **de media, el modelo grande gana** — «elegir LLM mayores, como LLama3, suele mejorar el rendimiento». El segundo es el útil: **BGE, mucho más pequeño, «es una buena elección global»** y es el que muestra las mejoras más consistentes entre datasets.

Traducido a decisión: el tamaño mueve la **magnitud** del cambio, no su dirección. Empieza por el pequeño, porque es el que te da un número estable y barato, y sube solo si la ablación dice que compensa.

### **Modelos fundacionales tabulares: el primo que no es un LLM**

**[TabPFN v2](https://www.nature.com/articles/s41586-024-08328-6)** (Hollmann et al., *Nature*, enero de 2025) no es un LLM, pero pertenece al mapa porque usa **exactamente el mismo truco**: preentrenar sobre un prior masivo y luego <span class="gl"><input type="checkbox" id="gl-incontext" class="gl-c"><label for="gl-incontext" class="gl-t">inferir en contexto</label><span class="gl-m"><label for="gl-incontext" class="gl-bg"></label><span class="gl-b"><b>Inferencia en contexto</b><span>El modelo no se entrena con tus datos: se los pasas <b>enteros como entrada</b>, igual que le pegarías un texto a un chat, y devuelve las predicciones en una sola pasada.</span><span>El «prior masivo» es lo que aprendió antes, durante su preentrenamiento, sobre millones de tablas artificiales generadas a propósito. Llega ya sabiendo cómo suelen comportarse los datos tabulares, así que le basta con ver los tuyos para responder.</span><label for="gl-incontext" class="gl-x">Entendido</label></span></span></span>, sin entrenar.

Está preentrenado sobre **millones de datasets sintéticos** generados con modelos causales estructurales. En inferencia le pasas tu tabla entera como contexto y te devuelve predicciones — sin ajuste, sin búsqueda de hiperparámetros, sin bucle. Los autores reportan que supera a todos los métodos anteriores en datasets de **hasta 10.000 muestras**, con una fracción del tiempo.

Si tu problema es tabular y pequeño, este debería ser tu primer baseline. Cuesta tres líneas y pone el listón donde debe estar.

---

## **🎓 Estrategia C — el LLM como profesor**

El LLM no toca el modelo final. **Fabrica los datos** con los que se entrena, y luego desaparece del camino.

### **Destilación**

Se generan tripletas `(entrada, traza de razonamiento, salida)` desde un modelo frontera y se entrena a un modelo pequeño para reproducirlas. Es literalmente cómo se construyó la ola 2025-2026 de modelos pequeños sorprendentemente buenos: las destilaciones de DeepSeek-R1 sobre Qwen y sobre Llama — R1 es el profesor; Qwen y Llama, los alumnos.

La ventaja no es la métrica: es que el resultado **se sirve barato, corre local y no depende de una API**.

### **Datos sintéticos y etiquetado**

Para clases raras, dominios de bajo recurso o corpus sin etiquetar, un LLM produce en horas lo que a un equipo de anotación le llevaría semanas. Con dos condiciones que no son negociables:

<span style="color:#f43f5e"><strong>Primera:</strong></span> **mide siempre sobre <span style="color:#06b6d4">un test real</span>**, nunca sintético. Los datos generados arrastran los sesgos del generador; evaluar sobre ellos es preguntarle al examinador que escribió el examen.

<span style="color:#f43f5e"><strong>Segunda:</strong></span> **el modelo más fuerte no siempre es el mejor profesor.** Hay evidencia —[PerSyn, «Find Your Optimal Teacher»](https://arxiv.org/abs/2510.10925), Zhang et al., ACL 2026— de que la elección del generador no sigue el ranking de capacidad — un modelo más potente puede producir trazas que el alumno no logra absorber. Compara al menos dos antes de fijar uno.

---

## **🛑 El contrapunto: lo que la evidencia dice de verdad**

Esta es la sección por la que escribí el artículo. Sin ella, lo anterior es un folleto.

### **1. Hiperparámetros: el resultado más incómodo del campo**

Rodrigues, Vas, DCosta y Prabhakaran fueron a comprobar si los optimizadores de hiperparámetros basados en LLM realmente ganan, con el presupuesto igualado y ocho datasets de OpenML. El título de su artículo ya trae la conclusión: [*When Is an LLM Worth It for Hyperparameter Optimization? A Budget-Matched Study on Tabular Data Finds the Warm-Start Is a Default Configuration, Not the Model*](https://arxiv.org/abs/2606.21641). El resultado desmonta la mecánica entera.

El asesor LLM parece arrancar muy por delante: **88,7 %** de accuracy en su primera evaluación, frente al **83,7 %** de random search. Salvo que —y aquí está el truco— **ese primer punto es la configuración por defecto, evaluada antes de la primera llamada al LLM.** No lo propuso el modelo. Venía en la caja.

Descontado eso, lo que las propuestas del LLM aportan de verdad, <span class="gl"><input type="checkbox" id="gl-pp" class="gl-c"><label for="gl-pp" class="gl-t">en puntos porcentuales y con su valor p</label><span class="gl-m"><label for="gl-pp" class="gl-bg"></label><span class="gl-b"><b>Puntos porcentuales (pp) y el valor p</b><span>Un <b>punto porcentual</b> es la diferencia entre dos porcentajes: pasar de 83 % a 84 % es +1 pp. Se usa para no confundirlo con «un 1 % más», que sería otra cosa.</span><span>El <b>valor p</b> responde a: si en realidad no hubiera ninguna diferencia, ¿cada cuánto el azar me daría una tan grande como la que veo? Un p de 0,92 significa «casi siempre» — o sea, <b>ningún indicio de mejora</b>. Por convención se habla de diferencia <i>significativa</i> cuando p baja de 0,05.</span><label for="gl-pp" class="gl-x">Entendido</label></span></span></span>:

| Métrica | Aporte real del LLM |
|---|---|
| Accuracy en validación cruzada (12 evaluaciones) | **+0,4 pp** |
| Accuracy en test | **−0,01 pp** (p = 0,92) |

Y cuando se le da a la búsqueda clásica **la misma semilla**:

- a las 2 evaluaciones, el asesor lidera por 0,20 pp
- a las 5, la ventaja ya no existe (−0,09 pp, no significativo)
- a las 12, el asesor **va por detrás** (−0,37 pp)

Sin semilla, <span class="gl"><input type="checkbox" id="gl-tpe" class="gl-c"><label for="gl-tpe" class="gl-t">TPE</label><span class="gl-m"><label for="gl-tpe" class="gl-bg"></label><span class="gl-b"><b>TPE y optimización bayesiana</b><span>Son los buscadores de hiperparámetros «clásicos», los que hay dentro de <i>Optuna</i> y compañía. En vez de probar combinaciones al azar, construyen un modelo de qué zonas del espacio han dado buenos resultados y prueban ahí.</span><span><i>TPE</i> son las siglas de <i>tree-structured Parzen estimator</i>. La <b>optimización bayesiana con proceso gaussiano</b> hace lo mismo con otra matemática. Para lo que aquí importa, ambas son la alternativa barata y sin API contra la que hay que comparar cualquier optimizador con LLM.</span><label for="gl-tpe" class="gl-x">Entendido</label></span></span></span> y la optimización bayesiana con proceso gaussiano lo empatan a las 12 evaluaciones y lo **superan por 0,6–0,8 pp a las 40** (p ≤ 10⁻⁴). En un dataset concreto (`vehicle`) el asesor se quedó clavado cerca de la configuración por defecto (73,3 %) mientras los clásicos alcanzaban 79,8–82,4 %: una brecha de 6 a 9 puntos **en contra** del LLM.

> **La recomendación de los autores, textual en su espíritu:** siembra la búsqueda clásica con una configuración por defecto sensata, en lugar de pagar un LLM dentro del bucle. Obtienes lo mismo, más barato y sin dependencia de una API.

Es el ejemplo perfecto de por qué la ablación no es opcional. Sin ella, alguien publica «nuestro optimizador LLM supera a random search en 5 puntos» — y es cierto, y no significa nada.

### **2. En tabular, el gradient boosting sigue ganando**

Ningún agente ha cambiado esto. XGBoost, LightGBM y CatBoost mantienen mejor sesgo inductivo que las redes neuronales **de unos miles a unas decenas de miles de filas**, que es el rango donde se midió: [Grinsztajn, Oyallon y Varoquaux](https://arxiv.org/abs/2207.08815) descartan los datasets de menos de 3.000 muestras y truncan sus comparaciones en 10.000 y 50.000.

Dos matices que suelen caerse al citarlo:

- Los propios autores avisan de que **la brecha se estrecha al crecer el conjunto**. El rango donde el GBDT gana cómodo no se extiende hasta el millón de filas por decreto; eso hay que medirlo en tus datos.
- [McElfresh et al.](https://arxiv.org/abs/2305.02997), con 19 algoritmos sobre 176 datasets, concluyen que el debate «redes contra GBDT» está sobredimensionado: el GBDT gana sobre todo cuando la distribución es **sesgada o irregular**, no siempre y en todas partes.

Añado una observación mía, que no es un hallazgo de benchmark y no debe leerse como tal: en las soluciones de agente que he leído, lo que acaba prediciendo es casi siempre un GBDT. El agente no lo sustituye — lo escribe mejor y más rápido de lo que lo escribirías tú a las tres de la mañana. Es un logro real, pero es un logro distinto del que se anuncia.

### **3. Contaminación: el matiz honesto**

La objeción evidente a MLE-bench es que los datasets son competiciones **públicas** de Kaggle: los modelos vieron enunciados, discusiones y soluciones ganadoras durante el preentrenamiento.

Los autores se la tomaron en serio y la midieron. **Reescribieron manualmente las 75 descripciones** para ofuscar de qué competición venía cada una, manteniendo la información esencial, y corrieron GPT-4o (AIDE) con 10 semillas sobre las versiones ofuscadas. Los resultados fueron similares a los originales. También pasaron el detector de plagio Dolos sobre todas las soluciones premiadas, sin encontrar nada. Y como Kaggle no libera los test sets, reconstruyeron particiones nuevas — lo que impide que un agente escriba las etiquetas de memoria.

Su conclusión, y la mía: **no hay evidencia de inflación sistemática por memorización**, aunque eso no descarta efectos más sutiles. Es un ejemplo de cómo se hace bien esta discusión, en contraste con el reflejo de gritar «contaminación» sin medirla.

### **4. Etiquetado: buen asistente, mal anotador**

Aquí hay un experimento que lo mide en vez de suponerlo. Schroeder, Roy y Kabbara lo [preregistraron](https://arxiv.org/abs/2507.15821), con 410 anotadores y más de 7.000 anotaciones sobre tareas subjetivas. Cuando se muestra la etiqueta sugerida por el LLM a un anotador humano, ocurren dos cosas: las sugerencias **no lo hicieron más rápido, pero sí subieron la confianza que declara en su propio juicio**. Y aparece anclaje — los anotadores «siguieron con fuerza las sugerencias del LLM, cambiando de forma significativa la distribución de etiquetas». Es decir: el corpus resultante se parece más al modelo que a las personas que supuestamente lo etiquetaron.

Súmale que las etiquetas de un LLM cambian con la versión del modelo, la temperatura y el contexto: dos corpus etiquetados con seis meses de diferencia no son el mismo corpus. Sin versionar prompt, modelo y parámetros, la reproducibilidad se evapora.

La forma que funciona no es sustituir: es **supervisión débil con auditoría** — el LLM propone a escala, y el humano revisa una muestra a ciegas y arbitra donde el modelo duda.

La última parte —«donde el modelo duda»— solo es operativa si la duda llega en un número fiable. Esa es la apuesta de [Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev), que TypeSafe AI lanzó el 15 de septiembre de 2026 en acceso anticipado: un modelo que **no genera texto**. Le declaras preguntas en código —elegir una de hasta 255 categorías, puntuar en una escala, sí o no— y devuelve cada respuesta con su probabilidad, entrenado para que esa probabilidad esté <span class="gl"><input type="checkbox" id="gl-calib" class="gl-c"><label for="gl-calib" class="gl-t">calibrada</label><span class="gl-m"><label for="gl-calib" class="gl-bg"></label><span class="gl-b"><b>Probabilidad calibrada</b><span>Un modelo está <b>calibrado</b> cuando sus probabilidades significan lo que dicen: de todas las respuestas que da con un 80 % de confianza, acierta más o menos el 80 %.</span><span>Sin calibración, un 0,95 es solo un número alto: no dice cuántas veces se equivoca. Con calibración puedes fijar un umbral y saber de antemano qué fracción de errores dejas pasar. Se comprueba agrupando las predicciones por confianza y comparando cada grupo con su acierto real sobre etiquetas humanas.</span><label for="gl-calib" class="gl-x">Entendido</label></span></span></span>. Con un etiquetador así, la auditoría se vuelve un umbral: lo que supera la confianza fijada entra al corpus, lo que queda por debajo va al humano. Y las probabilidades pueden servir de etiquetas blandas, con una cautela que va en los avisos.

<span style="color:#f43f5e"><strong>Cuatro avisos.</strong></span> La calibración aún no tiene verificación independiente. La prueba que publica el propio fabricante es pequeña, pero contra etiquetas que no puso otro LLM —el código que cada empresa declara—: [60 informes anuales de la SEC](https://docs.typesafe.ai/cookbooks/classification_using_confidence) clasificados en 75 sectores; el umbral de 0,9 los parte en dos mitades; en la segura acierta el 90 %, y en la otra, el 40 %. Repite esa prueba sobre una muestra tuya etiquetada a mano antes de fijar el umbral — y hazlo en tu idioma: el inglés es su idioma principal, y el fabricante avisa que los demás no rinden igual. Segundo: las probabilidades no son coherentes entre preguntas. En su propia [lista de puntos débiles](https://docs.typesafe.ai/model-jaggedness/jev-1.13), «¿pide un reembolso?» y «¿pide algo que no sea un reembolso?» dan 0,72 y 0,47 sobre el mismo mensaje, que suman 1,19; no lleves un umbral de un tipo de pregunta a otro. Tercero: el anclaje que midieron Schroeder, Roy y Kabbara no desaparece porque la sugerencia venga con porcentaje: si el anotador ve la etiqueta propuesta, la sigue — revisa a ciegas. Y cuarto: es un servicio por API, sin pesos ni paper; lo que eso implica para datos sensibles está en Riesgos operativos.

---

## **🧰 Recetario**

| Tu situación | Qué aporta el <span style="color:#a855f7">LLM</span> | Qué <span style="color:#10b981">predice</span> de verdad |
|---|---|---|
| Tabular < 10k filas | CAAFE, si las columnas significan algo | TabPFN v2 primero; AutoGluon de control |
| Tabular grande **con** semántica | CAAFE / LLM-FE para features de dominio | LightGBM o CatBoost + Optuna |
| Tabular grande **sin** semántica | nada demostrable | GBDT + búsqueda clásica sembrada con el defecto |
| Texto con pocas etiquetas | etiquetar y destilar; un modelo de decisión como Jev si quieres la confianza de cada etiqueta | encoder pequeño afinado (DeBERTa, MiniLM) |
| Texto con muchas etiquetas | embeddings congelados | clasificador ligero sobre el vector |
| Texto libre como columna de una tabla | proponer preguntas sobre el texto; un modelo tipo Jev las responde por fila | CatBoost sobre las respuestas, comparado contra embeddings |
| Imagen, pocas por clase | generación dirigida para las clases raras | transfer learning sobre una red preentrenada (timm) |
| Imagen, muchas y presupuesto normal | nada que compense | transfer learning, o AutoGluon multimodal si no quieres elegir arquitectura |
| Multimodal | AutoGluon Assistant / MLZero escribe todo | el pipeline que genere (AutoGluon debajo) |
| Agente que repite errores o experimentos | checker de estancamiento y memoria de acciones | la misma solución, alcanzada con menos coste |
| Problema abierto y presupuesto alto | MLE-STAR o R&D-Agent | la red o el ensamblado que el agente elija |

### **El caso especial: cuando el pipeline *es* un programa LLM**

Si lo que construyes no es un clasificador sino un sistema de varios pasos con LLM dentro, tu «entrenamiento» es la **optimización del programa** — y existe tooling serio para eso.

Queda fuera del mapa de las tres estrategias —aquí no se construye un clasificador— pero merece el apunte, porque mucha gente llega a este artículo buscando justo esto.

**[DSPy](https://dspy.ai)** te deja declarar el programa y optimizarlo contra una métrica, con optimizadores como `MIPROv2` o **[GEPA](https://github.com/gepa-ai/gepa)** (ICLR 2026). GEPA cambia el planteamiento: en vez de optimizar contra una recompensa escalar, **lee las trazas de ejecución completas** —errores, logs—, diagnostica el fallo en lenguaje natural y mantiene un frente de Pareto de candidatos. Sus cifras: supera a GRPO en **6 % de media** usando **hasta 35× menos <span class="gl"><input type="checkbox" id="gl-rollout" class="gl-c"><label for="gl-rollout" class="gl-t">rollouts</label><span class="gl-m"><label for="gl-rollout" class="gl-bg"></label><span class="gl-b"><b>Rollout</b><span>Una ejecución completa del programa de principio a fin sobre un ejemplo, para ver qué puntuación saca. Es la unidad de coste de estos métodos: cada rollout son llamadas al modelo, y se pagan.</span><span>Por eso «35× menos rollouts» es la mitad interesante de la cifra: no es solo que quede mejor, es que llega ahí gastando mucho menos.</span><label for="gl-rollout" class="gl-x">Entendido</label></span></span></span>**, y a MIPROv2 en **más de un 10 %**. Con el matiz que este artículo predica: ese +12 % de AIME-2025 es la fila de Qwen3 8B (MIPROv2 20,00 → GEPA 32,00), y **en esa misma fila GRPO saca 38,00** y les gana a las dos.

```python
import dspy

optimizer = dspy.GEPA(
    metric=mi_metrica,
    max_metric_calls=150,
    reflection_lm="openai/gpt-5",
)
programa_optimizado = optimizer.compile(
    student=MiPrograma(),
    trainset=trainset,
    valset=valset,
)
```

> Hay datos de entrenamiento, hay una métrica, hay validación y **hay sobreajuste**. Optimizar un programa LLM *es* entrenar un modelo, con todas las trampas metodológicas del oficio incluidas — <span style="color:#f43f5e">la ablación también aplica aquí</span>.

También hay que vigilar los loops del propio programa. Un optimizador puede mejorar la métrica mientras vuelve a intentar la misma llamada, genera la misma salida o consume rollouts en una rama que ya no tiene posibilidades. La traza de cada rollout debe conservar la acción, el resultado y el coste, para que el optimizador pueda distinguir exploración de repetición.

### **La regla que cierra el recetario**

> **Si no puedes hacer la ablación, no sabes si el LLM aportó.**

Baseline sin LLM. Pipeline con LLM. Mismo presupuesto de cómputo, mismos <span class="gl"><input type="checkbox" id="gl-fold" class="gl-c"><label for="gl-fold" class="gl-t">folds</label><span class="gl-m"><label for="gl-fold" class="gl-bg"></label><span class="gl-b"><b>Fold (validación cruzada)</b><span>Partes tus datos en <i>k</i> trozos del mismo tamaño — cada trozo es un <b>fold</b>. Entrenas <i>k</i> veces, dejando fuera un fold distinto cada vez para medir, y promedias los <i>k</i> resultados.</span><span>Sirve para no fiarlo todo a una única partición afortunada. Y para comparar dos pipelines hay que usar <b>exactamente los mismos folds</b> en ambos: si cada uno se mide sobre particiones distintas, la diferencia que veas puede ser solo el corte.</span><label for="gl-fold" class="gl-x">Entendido</label></span></span></span>, misma semilla. La diferencia entre ambos, con su intervalo de confianza, es lo único que cuenta. Todo lo demás es anécdota bien contada.

Con Jev, la ablación tiene atajo: TypeSafe publica un [adaptador](https://github.com/typesafe-ai/system-one-adapter-python) que responde las mismas preguntas con un LLM de OpenAI o de Anthropic, con la misma interfaz. Cambiar de motor es una línea; no hacer la comparación deja de tener excusa.

---

## **🚨 Riesgos operativos**

**Fuga de datos en código generado.** Ya la viste dos veces —en el paso 7 de la visualización y en el checker de MLE-STAR— y aparece aquí por una sola razón, que es la regla operativa: **si tu agente no trae ese checker, el checker eres tú.** Revisa el preprocesado generado antes de creerte la métrica.

<span style="color:#f43f5e"><strong>Los datos no pueden salir de casa.</strong></span> Si trabajas con historia clínica, datos financieros o cualquier cosa bajo contrato de confidencialidad, esta restricción llega antes que cualquier decisión técnica y descarta de golpe los agentes y las API externas. Lo que queda sigue siendo mucho: AutoML local (**AutoGluon**, **MLJAR**), **TabPFN v2** en tu propia máquina —que es inferencia, no entrenamiento, y cabe en una GPU modesta— o un LLM autoalojado para la parte de features. Cuenta con que ese modelo autoalojado rendirá por debajo del modelo frontera con el que están hechas las cifras de los papers: la comparación válida deja de ser contra el paper y pasa a ser contra tu propio baseline. Si la restricción es contractual y no técnica, algunos servicios por API ofrecen garantías: TypeSafe, por ejemplo, no entrena con los datos de sus clientes y ofrece retención cero, pero solo en su plan enterprise. Si eso basta lo decide tu contrato, no la ficha técnica.

**Reproducibilidad.** Versiona el prompt, el modelo, la temperatura y la fecha, igual que versionas el `random_state`. Un pipeline que depende de un modelo servido por API no es reproducible por defecto: es reproducible *mientras* esa versión siga en línea. Con los modelos de decisión hay un matiz más: ni la misma petición devuelve siempre lo mismo. En un [cookbook del propio TypeSafe](https://docs.typesafe.ai/cookbooks/consistency_choice_cookbook), 15 repeticiones sobre el mismo post —idéntico salvo un identificador irrelevante— coincidieron con la etiqueta mayoritaria el 90,8 % de las veces; exigiendo una probabilidad mínima de 0,60, la coincidencia sube al 99,2 %, a cambio de etiquetar en automático solo el 74,2 %. Y fija la versión (`jev-1.13.0`), no el alias `jev-latest`, que [se mueve sin aviso](https://docs.typesafe.ai/models) cuando sale una nueva.

**Loops y estancamiento.** El agente puede gastar el presupuesto repitiendo texto, código o herramientas sin producir una observación nueva. Registra una <span class="gl"><input type="checkbox" id="gl-action-signature" class="gl-c"><label for="gl-action-signature" class="gl-t">firma de acción</label><span class="gl-m"><label for="gl-action-signature" class="gl-bg"></label><span class="gl-b"><b>Firma de acción</b><span>Una representación comparable de una acción del agente: herramienta, argumentos relevantes, código normalizado, configuración del experimento y resultado.</span><span>Sirve para detectar que dos iteraciones son la misma aunque cambien comentarios, rutas temporales, números de línea o la explicación en lenguaje natural.</span><label for="gl-action-signature" class="gl-x">Entendido</label></span></span></span> de cada iteración y detén o redirige el proceso cuando se repita sin mejora. La temperatura puede ayudar a explorar otra salida, pero no sustituye esta regla de parada.

<span style="color:#f59e0b"><strong>Coste.</strong></span> Un intento de agente puede consumir 24 horas de cómputo. Multiplícalo por semillas y por competición. Si tu problema se resuelve con LightGBM y Optuna en veinte minutos, el agente no es una mejora: es una factura.

**Gobernanza.** El calendario del Reglamento de IA de la UE cambió mientras este artículo se escribía, y conviene tener la versión buena. La fecha general de aplicación era el **2 de agosto de 2026**, pero el [Reglamento (UE) 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng) —el «Omnibus digital sobre IA», en vigor desde el 27 de julio de 2026— **aplazó las obligaciones de alto riesgo**: al **2 de diciembre de 2027** las del Anexo III (biometría, educación, empleo, infraestructura crítica) y al **2 de agosto de 2028** las de los productos del Anexo I.

Lo que **sí es exigible ya**: las prohibiciones del artículo 5, las obligaciones de los modelos de propósito general, y la transparencia del [artículo 50](https://artificialintelligenceact.eu/article/50/) — que alcanza al etiquetado de contenido generado por IA. Las sanciones no se movieron: hasta **35 millones de euros o el 7 %** de la facturación mundial para las prohibiciones, 15 M€ / 3 % y 7,5 M€ / 1 % para el resto. Un dataset etiquetado por un LLM sin trazabilidad sigue siendo un problema de cumplimiento además de uno metodológico; solo que con más plazo del que parecía hace unos meses.

---

## **✅ Conclusión**

Vuelve a la tabla del principio, que es lo único que hay que llevarse:

- **A. Constructor** — real y útil, sobre todo en multimodal y en problemas abiertos donde el trabajo aburrido es el pegamento. Pero mide en la variante correcta del benchmark, y ten presente que **cambiar el modelo base movió a MLE-STAR casi 20 puntos** sin tocar el andamiaje.
- **B. Componente** — el mejor retorno está en **features con conocimiento de dominio** y en **embeddings congelados**. En hiperparámetros, la evidencia con presupuesto igualado dice que no.
- **C. Profesor** — la más madura de las tres, y la que da modelos que se sirven baratos. A cambio exige disciplina: test real, auditoría humana a ciegas, y comparar generadores.
- **Fiabilidad transversal** — mide y corta los *doom loops*. Un checker de estancamiento en el agente evita repetir código y herramientas; Antidoom/FTPO puede corregir el modelo abierto que genera la repetición textual. Ninguna de las dos cosas sustituye una evaluación con presupuesto igualado.

Y la constante que atraviesa las tres: **el LLM casi nunca es el modelo.** Es el <span style="color:#a855f7">violeta</span> que propone. Lo <span style="color:#10b981">esmeralda</span> —lo que entrena, lo que mide, lo que se despliega— sigue siendo tuyo, y sigue siendo donde se gana o se pierde.

---

## **🔗 Referencias**

**Agentes constructores**
- Chan et al. — [MLE-bench: Evaluating Machine Learning Agents on Machine Learning Engineering](https://arxiv.org/abs/2410.07095) (OpenAI) · [repositorio](https://github.com/openai/mle-bench)
- Jiang et al. — [AIDE: AI-Driven Exploration in the Space of Code](https://arxiv.org/abs/2502.13138) (Weco AI)
- Nam et al. — [MLE-STAR: Machine Learning Engineering Agent via Search and Targeted Refinement](https://arxiv.org/abs/2506.15692) (Google Research, NeurIPS 2025) · [blog](https://research.google/blog/mle-star-a-state-of-the-art-machine-learning-engineering-agents/)
- [R&D-Agent](https://github.com/microsoft/RD-Agent) (Microsoft)
- Fang et al. — [MLZero: A Multi-Agent System for End-to-end Machine Learning Automation](https://arxiv.org/abs/2505.13941) (Amazon, NeurIPS 2025)
- Liquid AI — [Reducing Doom Loops with Final Token Preference Optimization](https://www.liquid.ai/blog/antidoom) · [código y pipeline Antidoom](https://github.com/Liquid4All/antidoom)
- Pipis et al. — [Wait, Wait, Wait... Why Do Reasoning Models Loop?](https://arxiv.org/abs/2512.12895) (ICML 2026)

**El LLM como componente**
- Hollmann, Müller & Hutter — [CAAFE: Context-Aware Automated Feature Engineering](https://github.com/noahho/CAAFE) (NeurIPS 2023)
- Han et al. — [Large Language Models Can Automatically Engineer Features for Few-Shot Tabular Learning](https://arxiv.org/abs/2404.09491) (FeatLLM)
- Koloski et al. — [LLM Embeddings for Deep Learning on Tabular Data](https://arxiv.org/abs/2502.11596)
- Abhyankar, Shojaee & Reddy — [LLM-FE: Automated Feature Engineering for Tabular Data with LLMs as Evolutionary Optimizers](https://arxiv.org/abs/2503.14434) (Virginia Tech, TMLR)
- Liu et al. — [Large Language Model Agent for Hyper-Parameter Optimization](https://arxiv.org/abs/2402.01881) (AgentHPO)
- Liu, Astorga, Seedat & van der Schaar — [Large Language Models to Enhance Bayesian Optimization](https://arxiv.org/abs/2402.03921) (LLAMBO, ICLR 2024)
- Hollmann et al. — [Accurate predictions on small data with a tabular foundation model](https://www.nature.com/articles/s41586-024-08328-6) (TabPFN v2, *Nature*, 2025)

**El contrapunto**
- Rodrigues, Vas, DCosta & Prabhakaran — [When Is an LLM Worth It for Hyperparameter Optimization? A Budget-Matched Study on Tabular Data Finds the Warm-Start Is a Default Configuration, Not the Model](https://arxiv.org/abs/2606.21641)
- Grinsztajn, Oyallon & Varoquaux — [Why do tree-based models still outperform deep learning on typical tabular data?](https://arxiv.org/abs/2207.08815) (NeurIPS 2022, Datasets & Benchmarks)
- McElfresh et al. — [When Do Neural Nets Outperform Boosted Trees on Tabular Data?](https://arxiv.org/abs/2305.02997) (NeurIPS 2023, Datasets & Benchmarks)
- Shwartz-Ziv & Armon — [Tabular Data: Deep Learning is Not All You Need](https://arxiv.org/abs/2106.03253)
- Schroeder, Roy & Kabbara — [Just Put a Human in the Loop? Investigating LLM-Assisted Annotation for Subjective Tasks](https://arxiv.org/abs/2507.15821) (Findings of ACL 2025)
- TypeSafe AI — [Introducing System One Models & Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) (septiembre de 2026) · [workflow evals](https://evals.typesafe.ai/)
- TypeSafe AI — documentación de Jev: [autoresearch de features](https://docs.typesafe.ai/cookbooks/autoresearch_feature_discovery) · [clasificación con confianza](https://docs.typesafe.ai/cookbooks/classification_using_confidence) · [autoconsistencia](https://docs.typesafe.ai/cookbooks/consistency_choice_cookbook) · [puntos débiles de jev-1.13](https://docs.typesafe.ai/model-jaggedness/jev-1.13) · [modelos y versiones](https://docs.typesafe.ai/models) · [adaptador a LLM](https://github.com/typesafe-ai/system-one-adapter-python)

**Optimizar programas LLM**
- Agrawal et al. — [GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning](https://arxiv.org/abs/2507.19457) (ICLR 2026) · [repositorio](https://github.com/gepa-ai/gepa)
- [DSPy](https://dspy.ai)

**Panorámicas**
- [Large Language Model-based Data Science Agent: A Survey](https://arxiv.org/abs/2508.02744)
- [Open-source AutoML projects in 2026](https://mljar.com/blog/open-source-automl-projects-in-2026/)
