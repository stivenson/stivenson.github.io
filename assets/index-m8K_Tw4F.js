const f=`---
title: "Agent Skills vs. MCP: ¿Competencia o Complemento? Una Mirada Profunda a la Arquitectura de Agentes IA"
date: "2026-01-27"
slug: "agent-skills-vs-mcp"
description: "Una mirada profunda a la arquitectura de agentes IA y la relación entre Model Context Protocol y Agent Skills"
tags: ["IA", "MCP", "Agent Skills", "Arquitectura"]
---

# **Agent Skills vs. MCP: ¿Competencia o Complemento? Una Mirada Profunda a la Arquitectura de Agentes IA**

## **📌 Introducción: La Nueva Frontera de los Agentes IA**

El ecosistema de la Inteligencia Artificial atraviesa una transformación fundamental. Ya no basta con modelos de lenguaje que simplemente "conversen"; la demanda actual es de **Agentes IA** que ejecuten tareas, tomen decisiones y operen de manera autónoma en el mundo real. Para lograr esto, dos tecnologías han emergido como pilares fundamentales:

*   **Model Context Protocol (MCP)**: Un protocolo estándar para conectar agentes a herramientas y datos externos.
*   **Agent Skills**: Un formato para empaquetar conocimiento y procedimientos expertos que guían al agente.

Una pregunta recurrente en la comunidad es: **¿Son tecnologías competentes o complementarias?** Este artículo argumenta que, lejos de ser una competencia "tipo VHS vs. Betamax", representan **capas arquitectónicas distintas pero sinérgicas**. La verdadera potencia de los agentes del futuro surgirá de su combinación inteligente, no de su elección mutuamente excluyente.

> **🤖 ¿Qué es un Agente IA?**
>
> **ChatGPT** es un modelo conversacional: responde preguntas y genera texto, pero es **reactivo** (espera input, procesa, responde). No ejecuta acciones ni se conecta a servicios externos.
>
> Un **Agente IA** combina un modelo de lenguaje con **herramientas y capacidades de ejecución**. Puede ejecutar código, acceder a APIs, crear archivos, actualizar bases de datos y seguir procedimientos autónomos de múltiples pasos.
>
> **Diferencia clave**: ChatGPT te aconseja; un Agente IA ejecuta tareas por ti. En este artículo exploramos cómo **MCP** y **Agent Skills** permiten construir estos agentes.

---

## **🧠 Entendiendo los Fundamentos: ¿Qué son MCP y Agent Skills?**

Para entender su relación, primero debemos definir claramente cada uno.

### **Model Context Protocol (MCP): El "Cable USB" de los Agentes**

**MCP** es un **protocolo de comunicación estándar y abierto**. Su función principal es **conectar** agentes IA (como Claude Desktop, Cursor o una aplicación personalizada) con herramientas, servicios y datos externos (bases de datos, APIs, sistemas de archivos, Slack, Notion) de una manera **consistente, segura y estandarizada**.

*   **Analogía**: Piensa en MCP como el **protocolo USB-C**. No importa qué dispositivo (impresora, disco duro, cámara) conectes, el puerto siempre funciona de la misma manera y está estandarizado. MCP hace lo mismo para los agentes: cualquier herramienta que "hable" MCP puede ser conectada y utilizada por cualquier agente que entienda el protocolo.
*   **Propósito**: Resolver el problema de la integración fragmentada. Sin MCP, conectar un agente a 10 servicios diferentes podría requerir 10 integraciones personalizadas. Con MCP, se convierte en una tarea mucho más sencilla y mantenible.
*   **Estructura**: Se basa en una arquitectura **cliente-servidor**. El servidor MCP expone herramientas (Tools), recursos (Resources) y plantillas de prompts (Prompts) que el cliente (el agente) puede descubrir y usar.

### **Agent Skills: El "Manual de Instrucciones" de los Agentes**

**Agent Skills** son **paquetes de conocimiento y procedimientos** diseñados para enseñar a un agente cómo realizar una tarea específica de manera experta y consistente. Un Skill es, en esencia, un archivo Markdown (*SKILL.md*) que puede incluir instrucciones, scripts, referencias y plantillas.

*   **Analogía**: Un Skill es como un **"manual de usuario" o un "libro de recetas"** especializado. No le da al agente una nueva capacidad per se, sino que le enseña **cómo usar sus capacidades existentes** (incluyendo las herramientas conectadas vía MCP) para lograr un objetivo específico de la mejor manera posible.
*   **Propósito**: Resolver el problema de la **falta de conocimiento experto y procedural** en los modelos base. Un LLM puede ser brillante, pero no sabe los procesos internos, las mejores prácticas o las convenciones de tu equipo. Un Skill inyecta ese conocimiento de forma estructurada y reusable.
*   **Estructura**: Su característica más potente es la **"divulgación progresiva" (Progressive Disclosure)**. Un Skill no se carga de golpe. Se hace en tres capas para ahorrar tokens y contexto:
    1.  **Capa de Metadatos**: Solo el nombre y la descripción del Skill. Se carga al inicio, permitiendo al agente saber qué habilidades tiene disponibles sin consumir muchos tokens.
    2.  **Capa de Instrucciones**: El contenido completo del *SKILL.md*. Solo se carga cuando el agente detecta que el Skill es relevante para la tarea actual.
    3.  **Capa de Recursos**: Scripts, documentos de referencia, plantillas. Se cargan solo si el *SKILL.md* los invoca explícitamente durante la ejecución.

![Arquitectura de Agentes IA: MCP y Agent Skills](image/Agent-Mcp-Skills.svg)

---

## **⚖️ Argumento Central: Complemento, no Competencia**

La evidencia y la experiencia de la comunidad demuestran que MCP y Agent Skills son **tecnologías complementarias que operan en capas arquitectónicas diferentes**. Confundirlos como competidores es un error conceptual que lleva a arquitecturas deficientes.

### **1. Resuelven Problemas Fundamentales Diferentes**

| **Problema** | **Solución con MCP** | **Solución con Agent Skills** |
| :--- | :--- | :--- |
| **"¿Cómo conecto mi agente a 10 servicios diferentes sin escribir 10 integraciones?"** | **MCP proporciona el estándar**. Implementas un servidor MCP por servicio y cualquier agente cliente puede usarlos. | No es la herramienta adecuada. Un Skill podría instruir al agente sobre *cómo* usar una API, pero no resuelve el problema de la conexión estándar. |
| **"¿Cómo hago que mi agente siga siempre el proceso de revisión de código de mi equipo y no alucine?"** | Un servidor MCP podría exporner una herramienta *run_linter()*, pero no sabría **cuándo** ni **cómo** usarla según tu proceso. | **Un Agent Skills es perfecto**. El *SKILL.md* puede detallar: "1. Ejecuta el linter. 2. Comprueba los warnings X, Y y Z. 3. Asegúrate de que el mensaje de commit sigue el formato *[JIRA-XXX] Descripción*". |
| **"¿Cómo optimizo el uso de tokens? Mi contexto se llena rápido."** | MCP puede contribuir al problema si conectas muchos servidores, ya que cada uno carga las descripciones de sus herramientas al inicio, consumiendo miles de tokens. | **Agent Skills está optimizado para esto**. Gracias a la divulgación progresiva, solo carga lo esencial en cada momento, minimizando el consumo de tokens. |
| **"¿Cómo puedo empaquetar y compartir el conocimiento experto de mi empresa?"** | MCP no está diseñado para esto. Es un protocolo de conexión, no un formato de almacenamiento de conocimiento. | **Agent Skills es ideal**. Puedes crear un repositorio de Skills que capturen el conocimiento de tus equipos (ej. "Skill de auditoría de seguridad", "Skill de redacción técnica") y compartirlo fácilmente. |

### **2. La Comunidad y los Líderes de Opinión Abogan por la Combinación**

La discusión en foros técnicos, blogs de expertos y comunidades como Reddit y Hacker News es abrumadoramente a favor de la visión complementaria:

*   **Simon Willison**, una de las voces más respetadas en el espacio, ha argumentado que Skills y MCP son complementarios: Skills proporcionan flujos de trabajo específicos de dominio, mientras que MCP facilita conexiones a servicios. Ambos son útiles, y lo más convincente es cuando se combinan.
*   Un artículo técnico en **tty4.dev** argumenta: **"En mi opinión, ambos pueden existir uno al lado del otro: Skills son buenos para uso local para mostrar a los modelos cómo pueden asistir con el trabajo diario, mientras que MCP es agradable para las empresas que desean proporcionar acceso a sus servicios y tienen más control sobre la ruta de ejecución"**.
*   Una analogía común en la comunidad resume esto perfectamente: **Skills = 'Cómo hacer X' (Conocimiento), MCP = 'Cómo conectar Y' (Conexión). Tu agente necesita ambos para ser verdaderamente útil**.

### **3. El Argumento de la "Sinergia" es Más Fuerte que el de "Competencia"**

Imaginemos un escenario real: **Quieres un agente que automatice el análisis de los informes de ventas de tu empresa**. ¿Qué usarías?

*   **Enfoque MCP-Only**: Creas un servidor MCP que exponga herramientas para leer los informes de la base de datos y generar gráficos. El agente puede conectar a los datos, pero **no sabe** qué métricas son importantes, qué tendencias buscar o cómo tu empresa presenta los informes. Podría generar un informe técnico correcto pero totalmente inútil para tus stakeholders.
*   **Enfoque Skills-Only**: Creas un Skill detallado que dice "Busca estas tendencias, usa este formato, incluye estos gráficos". Sin embargo, el agente **no tiene acceso** a los datos frescos de la base de datos o a la librería de gráficos. Tendría que pedirle al usuario que le suba el informe, lo cual rompe la automatización.
*   **Enfoque Combinado (La solución ideal)**:
    1.  **MCP** conecta el agente a la base de datos de ventas y a una herramienta de generación de gráficos.
    2.  Un **Agent Skill** ("Analista de Ventas") instruye al agente: "Para crear el informe semanal: 1. Usa la herramienta *query_database* del servidor MCP para obtener los datos de las últimas 4 semanas. 2. Calcula las métricas A, B y C. 3. Usa la herramienta *create_chart* para generar el gráfico de líneas. 4. Compila todo en un informe con la estructura definida en la plantilla *assets/weekly_report_template.md*".

**Este ejemplo demuestra que la combinación crea un agente que es a la vez poderoso (gracias a MCP) y experto (gracias a Skills)**, algo que ninguna de las tecnologías podría lograr por sí sola de manera efectiva.

---

## **🧪 Ejemplos de Uso en el Mundo Real**

Para solidificar el argumento, veamos cómo funcionan en diferentes contextos.

### **Ejemplo 1: Agente de Desarrollo de Software**

| **Tarea** | **Rol de MCP** | **Rol de Agent Skills** |
| :--- | :--- | :--- |
| **Crear una nueva función en una API** | Conecta el agente al repositorio de código (via GitHub MCP) y a la documentación de la API. | Un Skill "Desarrollador Backend" instruye: "1. Lee el patrón de diseño en *references/backend_patterns.md*. 2. Escribe la función siguiendo los estándares de la empresa (ver *SKILL.md*). 3. Escribe pruebas unitarias usando el framework definido. 4. Abre un Pull Request y usa la plantilla en *assets/pr_template.md*." |
| **Investigar un bug** | Conecta al sistema de issue tracking (Jira MCP) y a un servidor MCP que proporcione acceso a logs del sistema. | Un Skill "Cazador de Bugs" guía: "1. Reproduce el error localmente. 2. Busca en los logs usando *grep* con los patrones en *references/common_errors.txt*. 3. Identifica la causa raíz usando el flujo de decisión en *SKILL.md*. 4. Propón una solución y verifícala." |

### **Ejemplo 2: Agente de Marketing Digital**

| **Tarea** | **Rol de MCP** | **Rol de Agent Skills** |
| :--- | :--- | :--- |
| **Lanzar una campaña en redes sociales** | Conecta a las APIs de Twitter, LinkedIn, Facebook (via sus respectivos servidores MCP). | Un Skill "Community Manager" define: "1. Adapta el mensaje base a cada red siguiendo las guías de tono en *references/brand_voice.md*. 2. Programa las publicaciones para los horarios óptimos. 3. Incluye los hashtags relevantes de la lista en *assets/hashtag_library.csv*. 4. Monitoriza las menciones usando la herramienta *listen_to_mentions* del servidor MCP de Twitter." |
| **Analizar el rendimiento de una campaña** | Conecta a Google Analytics y a la herramienta de email marketing (via MCP). | Un Skill "Analista de Marketing" instruye: "1. Extrae las métricas clave (CTR, CPC, Conversión) usando las consultas definidas en *scripts/analytics_queries.sql*. 2. Compáralas con los benchmarks de la industria en *references/benchmarks.md*. 3. Genera un informe de insights usando la plantilla en *assets/performance_report.md*." |

---

## **🧭 Implicaciones para el Futuro de la Arquitectura de Agentes**

El reconocimiento de MCP y Agent Skills como capas complementarias tiene profundas implicaciones para cómo diseñamos y construimos sistemas de agentes:

1.  **Mayor Estándarización y Componibilidad**: La comunidad está moviéndose hacia un futuro donde los Agentes sean composiciones modulares de **Capas de Conexión (MCP)** y **Capas de Conocimiento (Skills)**. Esto hará que los agentes sean más fáciles de construir, mantener y compartir.
2.  **El Surgimiento de "Arquitectos de Agentes"**: Los desarrolladores y arquitectos de sistemas necesitarán pensador más en términos de "qué capas necesito" y "cómo las orquesto", en lugar de "qué modelo de lenguaje uso". La habilidad clave será diseñar Skills efectivos y conectar servicios via MCP de manera segura y eficiente.
3.  **Énfasis en la Seguridad y la Gobernanza**: Dado que ambas tecnologías introducen nuevas superficies de ataque (ej. el "tool poisoning" en MCP o la ejecución de scripts en Skills), la seguridad se volverá una parte fundamental del diseño de agentes desde el día uno. Las empresas necesitarán políticas claras sobre qué Skills se pueden usar y qué servidores MCP se pueden conectar.
4.  **Democratización de la Creación de Agentes**: Agent Skills, en particular, tiene el potencial de democratizar la creación de agentes. Un experto en dominio (ej. un abogado, un médico, un contador) podría crear un Skill que encapsule su conocimiento, permitiendo que un no-programador construya un agente poderoso en su área sin escribir código.

---

## **✅ Conclusión: Un Futuro de Integración**

La evidencia es clara: **Model Context Protocol y Agent Skills no son rivales, sino aliados naturales**. MCP es el sistema circulatorio y nervioso que conecta al agente con el mundo. Agent Skills es el cerebro experto y la memoria muscular que le permite actuar de forma inteligente y deliberada.

La pregunta no debería ser "¿MCP o Skills?", sino **"¿Cómo puedo combinar MCP y Skills para construir el agente más capaz y robusto para mi caso de uso?"**.

La arquitectura de agentes del futuro será una **capa de orquestación** (el cerebro que decide qué hacer) que coordina:
*   **Conocimiento experto** proveniente de una biblioteca bien curada de Agent Skills.
*   **Acciones y conexiones** provistas por un ecosistema de servidores MCP robustos y seguros.

Aquellos que entiendan y dominen esta arquitectura combinada estarán mejor posicionados para construir la próxima generación de aplicaciones de IA que no solo conversen, sino que **actúen, razonen y entreguen valor real en el mundo**.

---

## **🔗 Referencias y Recursos Adicionales**

*   **Especificación Oficial de Agent Skills**: [agentskills.io](https://agentskills.io/specification)
*   **Blog de Simon Willison sobre Skills**: [simonwillison.net/tags/skills](https://simonwillison.net/tags/skills)
*   **Sitio Oficial de MCP**: [modelcontextprotocol.io](https://modelcontextprotocol.io)
*   **Artículo "Agent Skills - a thin alternative to the Model Context Protocol?"**: [tty4.dev](https://tty4.dev/development/2025-12-13-skills-or-mcp)
*   **Artículo sobre seguridad en MCP**: [Model Context Protocol has prompt injection security problems](https://simonw.substack.com/p/model-context-protocol-has-prompt)
`,y=`---
title: "Probabilidad e integrales: del área bajo una curva a la incertidumbre"
date: "2026-08-17"
slug: "probabilidad-integrales-modelos"
description: "Una ruta visual para entender variables aleatorias, funciones de densidad, distribución normal, integrales y ecuaciones diferenciales separables."
tags: ["Matemáticas", "Probabilidad", "Cálculo", "IA"]
---

# **Probabilidad e integrales: del área bajo una curva a la incertidumbre**

## **📌 Introducción: la incertidumbre también se puede calcular**

Cuando hablamos de probabilidad no estamos abandonando las matemáticas exactas. Estamos construyendo un lenguaje para representar situaciones en las que no conocemos con certeza el resultado.

En inteligencia artificial, esta forma de pensar aparece constantemente: un modelo clasifica una imagen, estima un riesgo, predice una demanda o asigna una probabilidad a varias hipótesis. La pregunta central no es solamente *qué puede ocurrir*, sino también:

> **¿Qué tan plausible es cada resultado y cómo acumulamos esas posibilidades?**

La respuesta conecta tres ideas:

1. una **variable aleatoria**;
2. una **función de distribución o de densidad**;
3. una **integral**, que permite acumular probabilidad sobre un intervalo.

El capítulo 3 de [*Deep Learning*](https://www.deeplearningbook.org/contents/prob.html) presenta la probabilidad como un marco para representar incertidumbre y distingue entre variables aleatorias, distribuciones discretas y densidades continuas. Partiremos de esa base y la conectaremos con las herramientas de cálculo que hacen falta para usarla: antiderivadas, integrales definidas y ecuaciones diferenciales separables.

## **🗺️ OVA 1: anatomía de la notación**

Antes de entrar en las definiciones, conviene ver el mapa completo. Toda la ruta de este artículo cabe en una sola expresión:

$$
\\textcolor{#10b981}{P(\\textcolor{#f43f5e}{a}\\leq X\\leq \\textcolor{#06b6d4}{b})}
=
\\int_{\\textcolor{#f43f5e}{a}}^{\\textcolor{#06b6d4}{b}}
\\textcolor{#a855f7}{f(x)}\\,\\textcolor{#f59e0b}{dx}
$$

Pasa el cursor por cada símbolo —el signo integral, $\\textcolor{#a855f7}{f(x)}$, $\\textcolor{#f59e0b}{dx}$, los límites $\\textcolor{#f43f5e}{a}$ y $\\textcolor{#06b6d4}{b}$— y observa qué parte de la gráfica se ilumina. Mueve los límites para ver cómo cambia el área.

<iframe src="/ovas/plano-cartesiano-integral.html" title="OVA: anatomía de la integral en el plano cartesiano" loading="lazy"></iframe>

Cada símbolo tiene un significado geométrico concreto, y **cada uno conserva su color en todas las visualizaciones del artículo**:

| Símbolo | Color | Qué es en la gráfica |
|---|---|---|
| $\\textcolor{#a855f7}{f(x)}$ | violeta | la **curva**: la altura en cada punto |
| $\\textcolor{#f59e0b}{dx}$ | ámbar | la **base microscópica** de cada rectángulo |
| $\\int$ | — | la **suma** de infinitos rectángulos $\\textcolor{#a855f7}{f(x)}\\,\\textcolor{#f59e0b}{dx}$ |
| $\\textcolor{#f43f5e}{a}$ | rosa | la **pared izquierda**: dónde empieza |
| $\\textcolor{#06b6d4}{b}$ | cian | la **pared derecha**: dónde termina |
| $\\textcolor{#10b981}{P}$ | esmeralda | el **área sombreada**: el resultado |

Altura por base, sumado desde una pared hasta la otra, da el área. Y ese área **es** la probabilidad.

> **Sobre la notación:** la visualización escribe la densidad como $\\textcolor{#a855f7}{p(x)}$ y en el resto del artículo la llamaremos $\\textcolor{#a855f7}{f(x)}$. Son el mismo objeto —fíjate en que comparten color—; la letra cambia según el texto que consultes.

## **🎲 Variable aleatoria no significa “variable misteriosa”**

Una variable aleatoria es una variable cuyo valor depende del resultado de un fenómeno incierto.

Por ejemplo, si $X$ representa el tiempo que tarda una solicitud en responder, $X$ puede tomar distintos valores según la carga del sistema, la red y otros factores.

La variable aleatoria no es todavía una probabilidad. Es el objeto que puede tomar valores. Para describir qué tan posibles son esos valores necesitamos una distribución.

### **Variable discreta**

Si $X$ solo puede tomar valores separados, usamos una función de masa de probabilidad:

$$
P(X=x)
$$

Ejemplo: el número de caras al lanzar tres monedas.

### **Variable continua**

Si $X$ puede tomar cualquier valor dentro de un intervalo, usamos una **función de densidad**, que escribiremos $f(x)$ —o $f_X(x)$ cuando haga falta recordar de qué variable estamos hablando.

Aquí aparece la diferencia fundamental: **$\\textcolor{#a855f7}{f(x)}$ no es la probabilidad de que $X=x$**. La curva violeta es una *altura*, no una probabilidad. Para una variable continua, la probabilidad de un único punto es normalmente cero. La probabilidad —lo verde— se obtiene acumulando área:

$$
\\textcolor{#10b981}{P(\\textcolor{#f43f5e}{a}\\leq X\\leq \\textcolor{#06b6d4}{b})}
=
\\int_{\\textcolor{#f43f5e}{a}}^{\\textcolor{#06b6d4}{b}}
\\textcolor{#a855f7}{f(x)}\\,\\textcolor{#f59e0b}{dx}
$$

### **Qué hace que una función sea una densidad**

No cualquier función sirve. Una densidad debe cumplir tres condiciones:

1. $\\textcolor{#a855f7}{f(x)}\\geq 0$;
2. su dominio contiene los valores posibles de $X$;
3. el área total es uno:

$$
\\int_{-\\infty}^{\\infty}\\textcolor{#a855f7}{f(x)}\\,\\textcolor{#f59e0b}{dx}=\\textcolor{#10b981}{1}
$$

La tercera condición es la **normalización**. Si el área total fuera mayor que uno, estaríamos asignando más del cien por ciento de probabilidad.

Esto también explica por qué una densidad puede tener valores mayores que uno: **la altura violeta y el área verde son cosas distintas**. $\\textcolor{#a855f7}{f(x)}$ puede valer 3 en un punto sin que nada se rompa; lo que nunca puede pasar de uno es $\\textcolor{#10b981}{\\text{el área}}$ acumulada de un evento.

## **🧩 Antiderivada e integral indefinida**

Toda la sección anterior descansa sobre una integral, así que conviene detenerse en cómo funciona antes de aplicarla a un caso concreto.

> En esta sección y la siguiente, $f(x)$ es **una función cualquiera**, no necesariamente una densidad: las reglas del cálculo valen para todas por igual.

Para entender por qué la integral acumula área conviene recordar su relación con la derivada. Una función $F(x)$ es una antiderivada de $f(x)$ si:

$$
F'(x)=f(x)
$$

La integral indefinida representa la familia completa de antiderivadas:

$$
\\int f(x)\\,dx=F(x)+C
$$

Por ejemplo:

$$
\\int 2x\\,dx=x^2+C
$$

porque:

$$
\\frac{d}{dx}(x^2+C)=2x
$$

La constante $C$ aparece porque todas las funciones $x^2+C$ tienen la misma derivada.

En cambio, una integral definida produce un número: exactamente el área verde entre las dos paredes.

$$
\\int_{\\textcolor{#f43f5e}{a}}^{\\textcolor{#06b6d4}{b}} f(x)\\,\\textcolor{#f59e0b}{dx}
=
\\textcolor{#10b981}{F(\\textcolor{#06b6d4}{b})-F(\\textcolor{#f43f5e}{a})}
$$

Aquí la constante desaparece:

$$
[F(b)+C]-[F(a)+C]=F(b)-F(a)
$$

Por eso la constante importa al describir una familia de funciones, pero no al calcular un área concreta.

## **📊 OVA 2: la integral como acumulación**

Modifica el coeficiente, el exponente y el límite superior. Observa simultáneamente la curva, el área sombreada, la antiderivada y el valor acumulado.

<iframe src="/ovas/integral-area.html" title="OVA: integral como área y antiderivada" loading="lazy"></iframe>

Para una función potencia:

$$
f(x)=ax^n
$$

la regla es:

$$
\\int ax^n\\,dx
=
a\\frac{x^{n+1}}{n+1}+C
\\qquad n\\neq -1
$$

El caso $n=-1$ es especial, porque la regla anterior dividiría entre cero:

$$
\\int\\frac{1}{x}\\,dx=\\ln|x|+C
$$

Con esto ya tenemos las dos piezas: sabemos qué significa acumular área y sabemos calcularla. Volvamos a la probabilidad.

## **📐 OVA 3: la densidad normal y el área que sí representa probabilidad**

Explora la media, la desviación estándar y los límites del intervalo. La zona sombreada es la probabilidad $P(a\\leq X\\leq b)$.

<iframe src="/ovas/normal-probability.html" title="OVA: distribución normal y probabilidad como área" loading="lazy"></iframe>

La curva violeta que ves arriba es esta función —la densidad normal:

$$
\\textcolor{#a855f7}{f(x)}=\\frac{1}{\\sigma\\sqrt{2\\pi}}
\\exp\\left(-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2\\right)
$$

Sus parámetros son:

- $\\mu$: media o centro de la distribución;
- $\\sigma$: desviación estándar, que controla la dispersión.

Cuando $\\mu=0$ y $\\sigma=1$, hablamos de la **normal estándar**:

$$
Z\\sim N(0,1)
$$

Para convertir un valor $x$ a la escala estándar usamos el puntaje $z$:

$$
z=\\frac{x-\\mu}{\\sigma}
$$

La función $\\Phi(z)$ representa el área acumulada a la izquierda de $z$:

$$
\\Phi(z)=P(Z\\leq z)
$$

Por eso, para una variable normal:

$$
\\textcolor{#10b981}{P(\\textcolor{#f43f5e}{a}\\leq X\\leq \\textcolor{#06b6d4}{b})}
=
\\Phi\\left(\\frac{\\textcolor{#06b6d4}{b}-\\mu}{\\sigma}\\right)
-
\\Phi\\left(\\frac{\\textcolor{#f43f5e}{a}-\\mu}{\\sigma}\\right)
$$

La calculadora o Python pueden devolver el valor numérico, pero el significado sigue siendo geométrico: **una diferencia de áreas bajo la curva**. Es la misma resta $F(\\textcolor{#06b6d4}{b})-F(\\textcolor{#f43f5e}{a})$ de la sección anterior, con $\\Phi$ haciendo de antiderivada.

## **🧮 Python: calcular una probabilidad normal**

Una forma práctica de calcular $P(a\\leq X\\leq b)$ es usar la función de distribución acumulada de una normal:

~~~~python
from scipy.stats import norm

mu = 70
sigma = 10
a = 60
b = 85

probabilidad = norm.cdf(b, loc=mu, scale=sigma)
probabilidad -= norm.cdf(a, loc=mu, scale=sigma)

print(probabilidad)
~~~~

Las variables \`a\` y \`b\` del código son las mismas paredes $\\textcolor{#f43f5e}{a}$ y $\\textcolor{#06b6d4}{b}$ que mueves con los deslizadores, y \`norm.cdf\` es $\\Phi$. La operación implementada es exactamente:

$$
\\textcolor{#10b981}{
\\Phi\\left(\\frac{\\textcolor{#06b6d4}{b}-\\mu}{\\sigma}\\right)
-
\\Phi\\left(\\frac{\\textcolor{#f43f5e}{a}-\\mu}{\\sigma}\\right)}
$$

Cuatro formas de decir lo mismo: el **área verde** de la gráfica, la **integral** $\\int_{\\textcolor{#f43f5e}{a}}^{\\textcolor{#06b6d4}{b}}\\textcolor{#a855f7}{f(x)}\\,\\textcolor{#f59e0b}{dx}$, la **diferencia de acumuladas** de arriba, y las tres líneas de Python. La biblioteca evita hacer manualmente la aproximación numérica, pero no reemplaza la interpretación matemática.

## **🧠 Una conexión adicional: ecuaciones diferenciales separables**

Hasta aquí la integral ha servido para **acumular**: convertir una densidad en probabilidad. Pero la misma operación resuelve un problema distinto: **recuperar una función a partir de su tasa de cambio**. Ese es el terreno de las ecuaciones diferenciales, y vale la pena verlo porque ahí la constante de integración deja de ser un detalle y pasa a decidir cuál de todas las soluciones posibles es la nuestra.

Tomemos una ecuación diferencial separable como esta:

$$
\\frac{dy}{dx}=\\sqrt[3]{\\frac{x}{y}}
=\\frac{x^{1/3}}{y^{1/3}}
$$

Separando variables:

$$
y^{1/3}\\,dy=x^{1/3}\\,dx
$$

Integramos:

$$
\\frac34y^{4/3}=\\frac34x^{4/3}+C
$$

Multiplicando por $4$ y luego dividiendo entre $3$:

$$
y^{4/3}=x^{4/3}+C
$$

Finalmente:

$$
y=\\left(x^{4/3}+C\\right)^{3/4}
$$

Si imponemos $y(1)=8$:

$$
8=\\left(1+C\\right)^{3/4}
$$

$$
8^{4/3}=1+C
$$

$$
16=1+C
$$

$$
C=15
$$

Observa que aquí usamos una constante normalizada. En la forma anterior, sin normalizar:

$$
\\frac34y^{4/3}=\\frac34x^{4/3}+\\frac{45}{4}
$$

Las constantes $15$ y $45/4$ corresponden a dos formas equivalentes de escribir la misma solución.

## **📈 OVA 4: una familia de soluciones**

Mueve $C$ y observa cómo cambia la curva. El punto $(1,8)$ queda fijo como referencia; la solución que pasa exactamente por él usa $C=15$ en la forma normalizada.

<iframe src="/ovas/ode-separable.html" title="OVA: solución de una ecuación diferencial separable" loading="lazy"></iframe>

La derivada de la solución normalizada verifica la ecuación:

$$
y(x)=\\left(x^{4/3}+15\\right)^{3/4}
$$

$$
y'(x)
=
\\frac{x^{1/3}}{\\left(x^{4/3}+15\\right)^{1/4}}
=
\\frac{x^{1/3}}{y^{1/3}}
$$

La ecuación diferencial no solo produce una fórmula: produce una familia de curvas. La condición inicial selecciona una curva concreta.

## **⚠️ Errores frecuentes**

### Confundir variable aleatoria con distribución

La variable aleatoria es el objeto que puede tomar valores. La distribución indica cómo se reparte la probabilidad sobre esos valores.

### Confundir densidad con probabilidad

$$
f(x)\\neq P(X=x)
$$

En variables continuas, usamos:

$$
P(a\\leq X\\leq b)=\\int_a^b f(x)\\,dx
$$

### Distribuir una potencia sobre una suma

En general:

$$
(a+b)^r\\neq a^r+b^r
$$

Por eso:

$$
\\left(x^{4/3}+C\\right)^{3/4}
$$

debe conservarse con sus paréntesis.

### Perder la constante de integración

En una integral indefinida debe aparecer $+C$. En una integral definida, la constante se cancela al evaluar los límites.

## **✅ Conclusión**

La conexión central es esta:

$$
\\boxed{
\\textcolor{#a855f7}{\\text{densidad}}
\\xrightarrow{\\textcolor{#f59e0b}{\\text{integrar}}}
\\textcolor{#10b981}{\\text{probabilidad acumulada}}
}
$$

Violeta la altura, ámbar la operación que la acumula, verde el resultado. Los mismos tres colores que llevas viendo desde la primera gráfica.

La antiderivada ayuda a calcular integrales; la integral convierte una densidad en probabilidad; la normal estándar permite comparar valores con una escala común; y las ecuaciones diferenciales muestran cómo una tasa de cambio puede definir toda una familia de soluciones.

La probabilidad no es solo una tabla de porcentajes. Es una forma de razonar sobre incertidumbre usando funciones, áreas, integrales y modelos.

## **🔗 Referencias**

- [Goodfellow, Bengio y Courville — *Deep Learning*, capítulo 3: Probability and Information Theory](https://www.deeplearningbook.org/contents/prob.html)
- [SciPy — scipy.stats.norm](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.norm.html)
`,v=`---
title: "Construir modelos de ML con LLM: mapa del campo y qué funciona de verdad"
date: "2026-08-25"
slug: "llm-para-construir-modelos-ml"
description: "Estrategias, metodologías, técnicas y herramientas actuales para generar modelos de machine learning apoyándose en LLM — con la evidencia de dónde ayudan y dónde no."
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
.gl-t::after { content: "\\00a0💡"; font-size: 0.85em; }
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
2. Un LLM que **es una pieza dentro del pipeline** — propone features, ajusta hiperparámetros, convierte texto en vectores.
3. Un LLM que **fabrica los datos** con los que se entrena otro modelo más pequeño.

Confundirlas es el error caro. Cada una se monta distinto, cuesta distinto y —sobre todo— **se evalúa distinto**. Este artículo es el mapa de las tres, con las herramientas concretas de 2025-2026 y, en la sección que más me importa, la evidencia de dónde el LLM no aporta nada medible.

<em>Estado del campo a septiembre de 2026. Es una materia que se mueve rápido: entre que escribí la primera versión y la revisé, el Reglamento de IA de la UE cambió de calendario y uno de los repositorios que cito dejó de existir. Las fechas de cada cifra están en los enlaces.</em>

| | El LLM es… | Produce | La pregunta que responde la evaluación |
|---|---|---|---|
| **A. Constructor** | ingeniero de ML | código de pipeline | ¿la métrica final es mejor que mi baseline? |
| **B. Componente** | pieza del pipeline | features, hiperparámetros, embeddings | ¿el pipeline **con** el LLM gana al pipeline **sin** él? |
| **C. Profesor** | fábrica de datos | dataset etiquetado o sintético | ¿el modelo alumno gana al entrenado con los datos originales? |

Hay una constante que conviene fijar desde ahora, porque el marketing la difumina sin parar:

> **El LLM casi nunca es el modelo que predice.** Escribe el código que lo entrena, o le pasa features, o le fabrica <span style="color:#06b6d4">los datos</span>. Debajo casi siempre hay un <span class="gl"><input type="checkbox" id="gl-gbdt" class="gl-c"><label for="gl-gbdt" class="gl-t">gradient boosting</label><span class="gl-m"><label for="gl-gbdt" class="gl-bg"></label><span class="gl-b"><b>Gradient boosting (GBDT)</b><span>Las siglas son de <i>gradient boosted decision trees</i>. Es un modelo hecho de <b>muchos árboles pequeños encadenados</b>: cada árbol nuevo se entrena para corregir el error que dejaron los anteriores, y la predicción final es la suma de todos.</span><span>Es el caballo de batalla de los datos en tabla —filas y columnas— desde hace más de una década. Las implementaciones que verás nombradas aquí son <i>XGBoost</i>, <i>LightGBM</i> y <i>CatBoost</i>.</span><label for="gl-gbdt" class="gl-x">Entendido</label></span></span></span>, una red preentrenada o un encoder pequeño. Si no sabes distinguir esas dos capas, no puedes medir cuál de las dos te está fallando.

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

### **El bucle, paso a paso**

Lo genérico es lo de arriba: escribir → ejecutar → leer → reescribir. Lo que verás abajo es el ciclo concreto de **MLE-STAR**, que tomo como ejemplo por ser el más completo de los publicados: la búsqueda web, la ablación por bloque y los dos *checkers* son suyos, no del bucle genérico de AIDE.

<iframe src="/ovas/ml-agent-loop.html" title="El bucle de un agente que construye modelos, paso a paso" loading="lazy"></iframe>

Presta atención al contador <span style="color:#f59e0b">ámbar</span>: cada paso <span style="color:#10b981">esmeralda</span> entrena de verdad. Volveremos a ese número.

### **Las herramientas, y qué aporta cada una de distinto**

**[AIDE](https://github.com/WecoAI/aideml)** — el origen. Árbol de búsqueda sobre soluciones. Es el <span class="gl"><input type="checkbox" id="gl-scaffold" class="gl-c"><label for="gl-scaffold" class="gl-t">andamiaje</label><span class="gl-m"><label for="gl-scaffold" class="gl-bg"></label><span class="gl-b"><b>Andamiaje (<i>scaffold</i>)</b><span>Es todo lo que rodea al LLM para convertirlo en un agente: el bucle que lo llama, las instrucciones que recibe, las herramientas que puede usar, la memoria de lo que ya intentó y las reglas de cuándo parar.</span><span>Distinguirlo del modelo importa mucho en este artículo: cuando un sistema mejora, la pregunta siempre es si mejoró el andamiaje o si simplemente le pusieron debajo un modelo más nuevo.</span><label for="gl-scaffold" class="gl-x">Entendido</label></span></span></span> contra el que se compara todo lo demás.

**[MLE-STAR](https://research.google/blog/mle-star-a-state-of-the-art-machine-learning-engineering-agents/)** (Google Research, NeurIPS 2025) — aporta dos ideas propias que valen más que su ranking:

- **Búsqueda web para sembrar la solución inicial.** En vez de partir de lo que el modelo recuerda de su preentrenamiento —congelado en una fecha—, busca qué se está usando hoy para esa tarea. Es la diferencia entre un ingeniero que lleva dos años sin leer nada y uno que abre el navegador.
- **Refinamiento dirigido por <span class="gl"><input type="checkbox" id="gl-ablacion" class="gl-c"><label for="gl-ablacion" class="gl-t">ablación</label><span class="gl-m"><label for="gl-ablacion" class="gl-bg"></label><span class="gl-b"><b>Ablación</b><span>Quitar una pieza y volver a medir, para saber cuánto aportaba esa pieza. Si al retirarla el resultado no se mueve, no aportaba nada — por muy convincente que sonara.</span><span>Aparece en dos niveles a lo largo del artículo, y conviene no confundirlos: aquí se le quitan <b>bloques al pipeline</b> para ver cuál pesa más; más adelante se le quita <b>el LLM al pipeline entero</b> para ver si aportó algo. Es el mismo gesto aplicado a escalas distintas.</span><label for="gl-ablacion" class="gl-x">Entendido</label></span></span></span>.** En vez de reescribir el script entero cada vuelta, mide cuánto aporta cada bloque (preprocesado, features, modelo, ensamblado) y solo reescribe el que más pesa. Cambiar una pieza a la vez es lo que hace el resultado **atribuible**.

Trae además tres agentes de apoyo que valen su peso en oro y que casi nadie menciona: un **depurador** que insiste hasta que el script arranca, un **checker de fuga de datos** que revisa el preprocesado y genera una versión corregida si detecta contaminación entre train y test, y un **checker de uso de datos** que verifica que el script no esté ignorando ficheros que le entregaste. Se publicó como *sample* del ADK de Google, retirado del repositorio en julio de 2026 — el paper y su descripción de los tres módulos siguen siendo la referencia.

**[R&D-Agent](https://github.com/microsoft/RD-Agent)** (Microsoft) — encuadra el trabajo como un proceso de investigación iterativo, no como un modelado suelto: propone hipótesis, las implementa, mide y acumula lo aprendido entre rondas.

**[MLZero / AutoGluon Assistant](https://arxiv.org/abs/2505.13941)** (Amazon, NeurIPS 2025) — multiagente y multimodal, con memoria semántica y episódica. Describes la tarea en lenguaje natural y el sistema percibe los datos, escribe el código, lo ejecuta y se depura solo, sin configuración. En su propio benchmark multimodal de 25 tareas reporta una tasa de éxito de 0,92.

### **⚠️ Los números que casi nadie cita bien**

Aquí hay que frenar, porque este es el punto donde el 90 % del contenido sobre el tema miente sin querer.

**[MLE-bench](https://arxiv.org/abs/2410.07095)** (OpenAI) es el patrón de medida: **75 competiciones de Kaggle** anotadas por complejidad — 22 bajas, 38 medias, 15 altas. Pero existe también **MLE-bench Lite**: solo las **22 de baja complejidad** (158 GB de datos frente a 3,3 TB del conjunto completo). Los porcentajes de una variante y de la otra **no son comparables**.

| Sistema | Variante | Medalla | Nota |
|---|---|---|---|
| o1-preview + AIDE | completo (75) | **16,9 %** pass@1 | sube a 34,1 % con pass@8 |
| GPT-4o + AIDE | completo (75) | **8,7 %** | |
| AIDE (baseline de MLE-STAR) | **Lite (22)** | **25,8 ± 5,4 %** | |
| MLE-STAR + Gemini-2.0-Flash | **Lite (22)** | **43,9 ± 6,2 %** | 30,3 % oro |
| MLE-STAR + Gemini-2.5-Pro | **Lite (22)** | **63,6 ± 6,0 %** | 36,4 % oro |

Dos lecturas que solo aparecen al poner la tabla completa:

**Primera:** citar «64 % frente al 16,9 % de OpenAI» como prueba de progreso es comparar 22 competiciones fáciles contra 75 de dificultad mixta. No mide lo mismo.

**Segunda, y más incómoda:** el mismo andamiaje, MLE-STAR, pasa de **43,9 % a 63,6 %** solo por cambiar el modelo base de Gemini-2.0-Flash a Gemini-2.5-Pro. Casi 20 puntos que no vienen de la arquitectura del agente sino del LLM que hay debajo. **El andamiaje importa menos de lo que sugiere su nombre en el paper.** Es una advertencia práctica: antes de invertir en un scaffold sofisticado, prueba tu scaffold sencillo con un modelo mejor.

### **Antes de creer un porcentaje, pregunta cinco cosas**

Esta lista sirve para cualquier titular de agentes, no solo para los de aquí. Si el paper o el post no responde a las cinco, el número no es comparable con nada:

1. **¿Qué variante del benchmark?** 22 competiciones fáciles y 75 de dificultad mixta no son la misma prueba, aunque las dos se llamen MLE-bench.
2. **¿<span class="gl"><input type="checkbox" id="gl-passk" class="gl-c"><label for="gl-passk" class="gl-t">pass@1 o pass@8</label><span class="gl-m"><label for="gl-passk" class="gl-bg"></label><span class="gl-b"><b>pass@k</b><span>El porcentaje de tareas resueltas dando al sistema <b><i>k</i> intentos</b> y contando la tarea como acertada si <b>alguno</b> de ellos lo consigue. <i>pass@1</i> es un intento; <i>pass@8</i>, ocho.</span><span>Por eso <i>pass@8</i> siempre sale igual o mejor que <i>pass@1</i> — y por eso comparar el <i>pass@8</i> de uno con el <i>pass@1</i> de otro no dice nada. Además cuesta ocho veces más cómputo.</span><label for="gl-passk" class="gl-x">Entendido</label></span></span></span>?** Ocho intentos cuestan ocho veces más y suben la cifra por construcción.
3. **¿Cuántas semillas, y con qué margen?** Un porcentaje sin ± no permite saber si la diferencia con el rival cabe dentro del ruido.
4. **¿Qué modelo base?** Es la variable que más movió los resultados de esta tabla: casi 20 puntos sin tocar el agente.
5. **¿Qué presupuesto de cómputo por intento?** Un sistema que gana con el triple de horas no ganó — pagó.

Y una sexta, específica de Kaggle: cuando leas «<span class="gl"><input type="checkbox" id="gl-medalla" class="gl-c"><label for="gl-medalla" class="gl-t">consigue medalla</label><span class="gl-m"><label for="gl-medalla" class="gl-bg"></label><span class="gl-b"><b>Medalla en Kaggle</b><span>En cada competición de Kaggle, las posiciones altas de la clasificación reciben medalla de <b>bronce, plata u oro</b> según en qué percentil quedaron. «Consigue medalla» significa <b>bronce o mejor</b>: entrar en ese tramo, no ganar la competición.</span><span>Es una vara razonable —competir con humanos que dedicaron semanas— pero también generosa. Fíjate siempre en el porcentaje de <b>oro</b> aparte, que es el que mide algo cercano a ganar.</span><label for="gl-medalla" class="gl-x">Entendido</label></span></span></span>», recuerda que el umbral es bronce, y que el porcentaje de oro suele ser bastante menor.

### **La escala real del asunto**

Los benchmarks dan la cifra que el marketing omite. En MLE-bench cada intento dispone de:

> **36 vCPU · 440 GB de RAM · una Nvidia A10 de 24 GB · hasta 24 horas**, y todos los experimentos se repiten con 3 <span class="gl"><input type="checkbox" id="gl-semilla" class="gl-c"><label for="gl-semilla" class="gl-t">semillas</label><span class="gl-m"><label for="gl-semilla" class="gl-bg"></label><span class="gl-b"><b>Semilla (<i>seed</i>)</b><span>El número que fija el azar de un experimento: cómo se barajan los datos, cómo se inicializan los pesos, qué configuraciones prueba primero una búsqueda. Con la misma semilla, el experimento se repite idéntico.</span><span>Por eso se corre todo con varias semillas y se reporta la media con su margen: <b>un resultado con una sola semilla no distingue una mejora real de haber tenido suerte.</b> Cuando veas un porcentaje sin margen, pregunta cuántas semillas hubo detrás.</span><label for="gl-semilla" class="gl-x">Entendido</label></span></span></span>.

Ahora sí, **el número del contador**. Recorre la visualización de arriba hasta el final y se para en **16 entrenamientos**: uno de la primera ejecución, cuatro por vuelta para medir la ablación de cada bloque —tres vueltas—, y uno más al ensamblar. Dieciséis entrenamientos completos para **un** intento, en **una** competición. Multiplícalo por las 3 semillas del protocolo y por las competiciones del benchmark, y ya tienes la factura que el titular omite.

Eso <span style="color:#f59e0b">cuesta dinero por iteración</span>. Cuando compares un agente contra tu baseline, la comparación honesta incluye esa factura.

---

## **🧩 Estrategia B — el LLM como pieza del pipeline**

Aquí el LLM no escribe el pipeline: **vive dentro de él**. Y la evaluación cambia: ya no basta con «mi modelo saca 0,91». Hay que responder si el pipeline **con** el LLM gana al pipeline **sin** él. Es decir: **ablación**, o no sabes nada.

Y aquí la palabra cambia de escala, que es algo que casi nunca se dice. En MLE-STAR la ablación quitaba **bloques del pipeline** para ver cuál pesaba más. Ahora quitamos **el LLM entero** para ver si aportó algo. Mismo gesto —retirar una pieza y volver a medir— aplicado un nivel más arriba. Es la lección metodológica que sostiene todo lo que viene después.

### **Ingeniería de features**

Es donde el LLM aporta algo que ningún AutoML clásico puede: **conocimiento del mundo que no está en las columnas.** Que peso y talla dan un IMC. Que un código postal implica renta media. Que el 24 de diciembre no es un martes cualquiera para una serie de ventas.

**[CAAFE](https://github.com/noahho/CAAFE)** (NeurIPS 2023) — le describes el dataset en prosa y propone features nuevas de forma iterativa. El detalle que lo separa de pedirle ideas al chat: **verifica cada feature generada** contra validación y descarta las que no mejoran. La <span style="color:#a855f7">propuesta</span> es del LLM; el <span style="color:#10b981">veredicto</span> es de los datos.

**[FeatLLM](https://arxiv.org/abs/2404.09491)** — pensado para *few-shot*: le enseñas un puñado de ejemplos etiquetados y extrae **reglas** que separan las clases, que luego se materializan como features binarias.

**[LLM-FE](https://arxiv.org/abs/2503.14434)** — usa el LLM como operador de mutación dentro de un bucle evolutivo: cada generación propone variantes de features y la validación selecciona.

### **Hiperparámetros y arquitectura**

**[AgentHPO](https://arxiv.org/abs/2402.01881)** deja que un agente lea la tarea, lance experimentos y ajuste según el historial. **[LLAMBO](https://arxiv.org/abs/2402.03921)** va más lejos: sustituye el proceso gaussiano dentro de la optimización bayesiana por predicciones del LLM.

La promesa es seductora: menos ensayos, configuración más simple, y de regalo una explicación en prosa de por qué eligió lo que eligió. Guarda esta sección en la cabeza — **es donde la evidencia se pone fea**, y volvemos a ella en el contrapunto.

### **Embeddings como features**

El patrón más aburrido y probablemente el más rentable: serializar cada fila a texto, pasarla por un <span class="gl"><input type="checkbox" id="gl-emb" class="gl-c"><label for="gl-emb" class="gl-t">modelo de embeddings congelado</label><span class="gl-m"><label for="gl-emb" class="gl-bg"></label><span class="gl-b"><b>Embedding congelado</b><span>Un <b>embedding</b> es la traducción de un texto a una lista de números —un vector— colocada de forma que los textos parecidos caen cerca. <b>Congelado</b> significa que ese modelo no se reentrena: se usa tal cual, como si fuera una calculadora.</span><span>La ventaja práctica es que el resultado <b>se puede guardar en caché</b>: calculas el vector de cada fila una vez, lo almacenas, y a partir de ahí tu pipeline no vuelve a llamar a ningún LLM — ni en entrenamiento ni en producción.</span><label for="gl-emb" class="gl-x">Entendido</label></span></span></span>, y alimentar el vector resultante a un modelo aguas abajo. Sin fine-tuning, sin llamadas en producción si cacheas.

El [trabajo de Koloski et al. sobre embeddings de LLM para datos tabulares](https://arxiv.org/abs/2502.11596) deja dos hallazgos que hay que leer juntos, porque por separado engañan. El primero es el esperable: **de media, el modelo grande gana** — «elegir LLM mayores, como LLama3, suele mejorar el rendimiento». El segundo es el útil: **BGE, mucho más pequeño, «es una buena elección global»** y es el que muestra las mejoras más consistentes entre datasets.

Traducido a decisión: el tamaño mueve la **magnitud** del cambio, no su dirección. Empieza por el pequeño, porque es el que te da un número estable y barato, y sube solo si la ablación dice que compensa.

### **Modelos fundacionales tabulares: el primo que no es un LLM**

**[TabPFN v2](https://www.nature.com/articles/s41586-024-08328-6)** (Hollmann et al., *Nature*, enero de 2025) no es un LLM, pero pertenece al mapa porque usa **exactamente el mismo truco**: preentrenar sobre un prior masivo y luego inferir en contexto, sin entrenar.

Está preentrenado sobre **millones de datasets sintéticos** generados con modelos causales estructurales. En inferencia le pasas tu tabla entera como contexto y te devuelve predicciones — sin ajuste, sin búsqueda de hiperparámetros, sin bucle. Los autores reportan que supera a todos los métodos anteriores en datasets de **hasta 10.000 muestras**, con una fracción del tiempo.

Si tu problema es tabular y pequeño, este debería ser tu primer baseline. Cuesta tres líneas y pone el listón donde debe estar.

---

## **🎓 Estrategia C — el LLM como profesor**

El LLM no toca el modelo final. **Fabrica los datos** con los que se entrena, y luego desaparece del camino.

### **Destilación**

Se generan tripletas \`(entrada, traza de razonamiento, salida)\` desde un modelo frontera y se entrena a un modelo pequeño para reproducirlas. Es literalmente cómo se construyó la ola 2025-2026 de modelos pequeños sorprendentemente buenos: las destilaciones de DeepSeek-R1 sobre Qwen y sobre Llama — R1 es el profesor; Qwen y Llama, los alumnos.

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

Descontado eso, lo que las propuestas del LLM aportan de verdad:

| Métrica | Aporte real del LLM |
|---|---|
| Accuracy en validación cruzada (12 evaluaciones) | **+0,4 pp** |
| Accuracy en test | **−0,01 pp** (p = 0,92) |

Y cuando se le da a la búsqueda clásica **la misma semilla**:

- a las 2 evaluaciones, el asesor lidera por 0,20 pp
- a las 5, la ventaja ya no existe (−0,09 pp, no significativo)
- a las 12, el asesor **va por detrás** (−0,37 pp)

Sin semilla, <span class="gl"><input type="checkbox" id="gl-tpe" class="gl-c"><label for="gl-tpe" class="gl-t">TPE</label><span class="gl-m"><label for="gl-tpe" class="gl-bg"></label><span class="gl-b"><b>TPE y optimización bayesiana</b><span>Son los buscadores de hiperparámetros «clásicos», los que hay dentro de <i>Optuna</i> y compañía. En vez de probar combinaciones al azar, construyen un modelo de qué zonas del espacio han dado buenos resultados y prueban ahí.</span><span><i>TPE</i> son las siglas de <i>tree-structured Parzen estimator</i>. La <b>optimización bayesiana con proceso gaussiano</b> hace lo mismo con otra matemática. Para lo que aquí importa, ambas son la alternativa barata y sin API contra la que hay que comparar cualquier optimizador con LLM.</span><label for="gl-tpe" class="gl-x">Entendido</label></span></span></span> y la optimización bayesiana con proceso gaussiano lo empatan a las 12 evaluaciones y lo **superan por 0,6–0,8 pp a las 40** (p ≤ 10⁻⁴). En un dataset concreto (\`vehicle\`) el asesor se quedó clavado cerca de la configuración por defecto (73,3 %) mientras los clásicos alcanzaban 79,8–82,4 %: una brecha de 6 a 9 puntos **en contra** del LLM.

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

---

## **🧰 Recetario**

| Tu situación | Qué aporta el <span style="color:#a855f7">LLM</span> | Qué <span style="color:#10b981">predice</span> de verdad |
|---|---|---|
| Tabular < 10k filas | CAAFE, si las columnas significan algo | TabPFN v2 primero; AutoGluon de control |
| Tabular grande **con** semántica | CAAFE / LLM-FE para features de dominio | LightGBM o CatBoost + Optuna |
| Tabular grande **sin** semántica | nada demostrable | GBDT + búsqueda clásica sembrada con el defecto |
| Texto con pocas etiquetas | etiquetar y destilar | encoder pequeño afinado (DeBERTa, MiniLM) |
| Texto con muchas etiquetas | embeddings congelados | clasificador ligero sobre el vector |
| Imagen, pocas por clase | generación dirigida para las clases raras | transfer learning sobre una red preentrenada (timm) |
| Imagen, muchas y presupuesto normal | nada que compense | transfer learning, o AutoGluon multimodal si no quieres elegir arquitectura |
| Multimodal | AutoGluon Assistant / MLZero escribe todo | el pipeline que genere (AutoGluon debajo) |
| Problema abierto y presupuesto alto | MLE-STAR o R&D-Agent | la red o el ensamblado que el agente elija |

### **El caso especial: cuando el pipeline *es* un programa LLM**

Si lo que construyes no es un clasificador sino un sistema de varios pasos con LLM dentro, tu «entrenamiento» es la **optimización del programa** — y existe tooling serio para eso.

Queda fuera del mapa de las tres estrategias —aquí no se construye un clasificador— pero merece el apunte, porque mucha gente llega a este artículo buscando justo esto.

**[DSPy](https://dspy.ai)** te deja declarar el programa y optimizarlo contra una métrica, con optimizadores como \`MIPROv2\` o **[GEPA](https://github.com/gepa-ai/gepa)** (ICLR 2026). GEPA cambia el planteamiento: en vez de optimizar contra una recompensa escalar, **lee las trazas de ejecución completas** —errores, logs—, diagnostica el fallo en lenguaje natural y mantiene un frente de Pareto de candidatos. Sus cifras: supera a GRPO en **6 % de media** usando **hasta 35× menos <span class="gl"><input type="checkbox" id="gl-rollout" class="gl-c"><label for="gl-rollout" class="gl-t">rollouts</label><span class="gl-m"><label for="gl-rollout" class="gl-bg"></label><span class="gl-b"><b>Rollout</b><span>Una ejecución completa del programa de principio a fin sobre un ejemplo, para ver qué puntuación saca. Es la unidad de coste de estos métodos: cada rollout son llamadas al modelo, y se pagan.</span><span>Por eso «35× menos rollouts» es la mitad interesante de la cifra: no es solo que quede mejor, es que llega ahí gastando mucho menos.</span><label for="gl-rollout" class="gl-x">Entendido</label></span></span></span>**, y a MIPROv2 en **más de un 10 %**. Con el matiz que este artículo predica: ese +12 % de AIME-2025 es la fila de Qwen3 8B (MIPROv2 20,00 → GEPA 32,00), y **en esa misma fila GRPO saca 38,00** y les gana a las dos.

\`\`\`python
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
\`\`\`

> Hay datos de entrenamiento, hay una métrica, hay validación y **hay sobreajuste**. Optimizar un programa LLM *es* entrenar un modelo, con todas las trampas metodológicas del oficio incluidas — <span style="color:#f43f5e">la ablación también aplica aquí</span>.

### **La regla que cierra el recetario**

> **Si no puedes hacer la ablación, no sabes si el LLM aportó.**

Baseline sin LLM. Pipeline con LLM. Mismo presupuesto de cómputo, mismos <span class="gl"><input type="checkbox" id="gl-fold" class="gl-c"><label for="gl-fold" class="gl-t">folds</label><span class="gl-m"><label for="gl-fold" class="gl-bg"></label><span class="gl-b"><b>Fold (validación cruzada)</b><span>Partes tus datos en <i>k</i> trozos del mismo tamaño — cada trozo es un <b>fold</b>. Entrenas <i>k</i> veces, dejando fuera un fold distinto cada vez para medir, y promedias los <i>k</i> resultados.</span><span>Sirve para no fiarlo todo a una única partición afortunada. Y para comparar dos pipelines hay que usar <b>exactamente los mismos folds</b> en ambos: si cada uno se mide sobre particiones distintas, la diferencia que veas puede ser solo el corte.</span><label for="gl-fold" class="gl-x">Entendido</label></span></span></span>, misma semilla. La diferencia entre ambos, con su intervalo de confianza, es lo único que cuenta. Todo lo demás es anécdota bien contada.

---

## **🚨 Riesgos operativos**

**Fuga de datos en código generado.** Ya la viste dos veces —en el paso 7 de la visualización y en el checker de MLE-STAR— y aparece aquí por una sola razón, que es la regla operativa: **si tu agente no trae ese checker, el checker eres tú.** Revisa el preprocesado generado antes de creerte la métrica.

<span style="color:#f43f5e"><strong>Los datos no pueden salir de casa.</strong></span> Si trabajas con historia clínica, datos financieros o cualquier cosa bajo contrato de confidencialidad, esta restricción llega antes que cualquier decisión técnica y descarta de golpe los agentes y las API externas. Lo que queda sigue siendo mucho: AutoML local (**AutoGluon**, **MLJAR**), **TabPFN v2** en tu propia máquina —que es inferencia, no entrenamiento, y cabe en una GPU modesta— o un LLM autoalojado para la parte de features. Cuenta con que ese modelo autoalojado rendirá por debajo del modelo frontera con el que están hechas las cifras de los papers: la comparación válida deja de ser contra el paper y pasa a ser contra tu propio baseline.

**Reproducibilidad.** Versiona el prompt, el modelo, la temperatura y la fecha, igual que versionas el \`random_state\`. Un pipeline que depende de un modelo servido por API no es reproducible por defecto: es reproducible *mientras* esa versión siga en línea.

<span style="color:#f59e0b"><strong>Coste.</strong></span> Un intento de agente puede consumir 24 horas de cómputo. Multiplícalo por semillas y por competición. Si tu problema se resuelve con LightGBM y Optuna en veinte minutos, el agente no es una mejora: es una factura.

**Gobernanza.** El calendario del Reglamento de IA de la UE cambió mientras este artículo se escribía, y conviene tener la versión buena. La fecha general de aplicación era el **2 de agosto de 2026**, pero el [Reglamento (UE) 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng) —el «Omnibus digital sobre IA», en vigor desde el 27 de julio de 2026— **aplazó las obligaciones de alto riesgo**: al **2 de diciembre de 2027** las del Anexo III (biometría, educación, empleo, infraestructura crítica) y al **2 de agosto de 2028** las de los productos del Anexo I.

Lo que **sí es exigible ya**: las prohibiciones del artículo 5, las obligaciones de los modelos de propósito general, y la transparencia del [artículo 50](https://artificialintelligenceact.eu/article/50/) — que alcanza al etiquetado de contenido generado por IA. Las sanciones no se movieron: hasta **35 millones de euros o el 7 %** de la facturación mundial para las prohibiciones, 15 M€ / 3 % y 7,5 M€ / 1 % para el resto. Un dataset etiquetado por un LLM sin trazabilidad sigue siendo un problema de cumplimiento además de uno metodológico; solo que con más plazo del que parecía hace unos meses.

---

## **✅ Conclusión**

Vuelve a la tabla del principio, que es lo único que hay que llevarse:

- **A. Constructor** — real y útil, sobre todo en multimodal y en problemas abiertos donde el trabajo aburrido es el pegamento. Pero mide en la variante correcta del benchmark, y ten presente que **cambiar el modelo base movió a MLE-STAR casi 20 puntos** sin tocar el andamiaje.
- **B. Componente** — el mejor retorno está en **features con conocimiento de dominio** y en **embeddings congelados**. En hiperparámetros, la evidencia con presupuesto igualado dice que no.
- **C. Profesor** — la más madura de las tres, y la que da modelos que se sirven baratos. A cambio exige disciplina: test real, auditoría humana a ciegas, y comparar generadores.

Y la constante que atraviesa las tres: **el LLM casi nunca es el modelo.** Es el <span style="color:#a855f7">violeta</span> que propone. Lo <span style="color:#10b981">esmeralda</span> —lo que entrena, lo que mide, lo que se despliega— sigue siendo tuyo, y sigue siendo donde se gana o se pierde.

---

## **🔗 Referencias**

**Agentes constructores**
- Chan et al. — [MLE-bench: Evaluating Machine Learning Agents on Machine Learning Engineering](https://arxiv.org/abs/2410.07095) (OpenAI) · [repositorio](https://github.com/openai/mle-bench)
- Jiang et al. — [AIDE: AI-Driven Exploration in the Space of Code](https://arxiv.org/abs/2502.13138) (Weco AI)
- Nam et al. — [MLE-STAR: Machine Learning Engineering Agent via Search and Targeted Refinement](https://arxiv.org/abs/2506.15692) (Google Research, NeurIPS 2025) · [blog](https://research.google/blog/mle-star-a-state-of-the-art-machine-learning-engineering-agents/)
- [R&D-Agent](https://github.com/microsoft/RD-Agent) (Microsoft)
- Fang et al. — [MLZero: A Multi-Agent System for End-to-end Machine Learning Automation](https://arxiv.org/abs/2505.13941) (Amazon, NeurIPS 2025)

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

**Optimizar programas LLM**
- Agrawal et al. — [GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning](https://arxiv.org/abs/2507.19457) (ICLR 2026) · [repositorio](https://github.com/gepa-ai/gepa)
- [DSPy](https://dspy.ai)

**Panorámicas**
- [Large Language Model-based Data Science Agent: A Survey](https://arxiv.org/abs/2508.02744)
- [Open-source AutoML projects in 2026](https://mljar.com/blog/open-source-automl-projects-in-2026/)
`,q=`---
title: "Tu primera API con base de datos: la teoría antes que el framework"
date: "2026-09-02"
slug: "primera-api-con-base-de-datos"
description: "Qué es de verdad una API sobre una base de datos —HTTP, verbos, códigos de estado, recursos y restricciones— y luego los dos caminos para construirla: PostgREST, que la genera desde el esquema, y Flask, que la escribes a mano."
tags: ["API", "REST", "PostgreSQL", "PostgREST", "Flask", "Backend"]
---

# **Tu primera API con base de datos: la teoría antes que el framework**

## **📌 Introducción: una API es un contrato, no un montón de rutas**

Casi todos los tutoriales de «tu primera API» empiezan instalando algo. Este empieza un paso antes, porque el error que más caro sale no es de framework: es no haber entendido qué se está prometiendo.

Una API sobre una base de datos es **un contrato entre dos programas que no se conocen**. Dice qué se puede pedir, con qué palabras, qué llega de vuelta y qué pasa cuando algo va mal. El framework es la manera de cumplir ese contrato, no el contrato.

Y una vez lo ves así, aparece la decisión que estructura todo el artículo: hay **dos maneras honestas de cumplirlo**.

| | La API la genera… | Tú escribes… | Brilla cuando… |
|---|---|---|---|
| **PostgREST** | la base de datos, leyendo su propio esquema | SQL: tablas, restricciones, roles, políticas | el trabajo es exponer datos con filtros, orden y permisos |
| **Flask** | tu código, ruta por ruta | Python: rutas, validación, transacciones, errores | hay lógica, orquestación o efectos fuera de la base |

La trampa es la tercera opción, la que no está en la tabla y es la que más se ve: **escribir a mano un CRUD que solo repite el esquema**. Eso es PostgREST hecho peor, más lento de mantener y con más sitios donde equivocarse.

> Si tu endpoint hace \`SELECT\`, convierte a JSON y devuelve — y nada más — no has escrito una API: has escrito una traducción manual de tu esquema. Que sea buena idea o no depende de si algún día vas a añadir la parte que sí es tuya.

### **La lengua de color de este artículo**

Igual que en las visualizaciones, cada color significa lo mismo de principio a fin:

- <span style="color:#06b6d4"><strong>cian</strong></span> — la petición: lo que envía el cliente
- <span style="color:#10b981"><strong>esmeralda</strong></span> — la respuesta cuando sale bien
- <span style="color:#f43f5e"><strong>rosa</strong></span> — el error
- <span style="color:#a855f7"><strong>violeta</strong></span> — el esquema de la base de datos
- <span style="color:#f59e0b"><strong>ámbar</strong></span> — el código que escribes tú

Guarda las dos últimas: la segunda mitad del artículo es, literalmente, ver cuánto <span style="color:#a855f7">violeta</span> y cuánto <span style="color:#f59e0b">ámbar</span> hace falta para el mismo trabajo.

---

# **Parte I — La teoría**

## **🌐 Qué está pasando de verdad**

Un cliente —un navegador, una app móvil, un script de Python— abre una conexión a un servidor, envía un bloque de texto y recibe otro bloque de texto. Eso es todo. HTTP es un formato de mensajes, y los dos mensajes tienen la misma forma:

\`\`\`
línea inicial      ← qué quiero / cómo salió
cabeceras          ← metadatos sobre el mensaje
(línea en blanco)
cuerpo             ← los datos, si los hay
\`\`\`

Hay una propiedad de HTTP que conviene tener clara desde el primer día: **es sin estado**. El servidor no recuerda nada entre una petición y la siguiente. Cada mensaje llega solo y tiene que traer todo lo necesario para ser entendido — incluida la prueba de quién eres. Por eso el token de autenticación viaja en *cada* petición y no «se inicia sesión» en el sentido de una aplicación de escritorio.

De ahí sale casi todo lo demás. Que el servidor no recuerde nada es lo que permite poner cinco servidores detrás de un balanceador sin coordinarlos, cachear respuestas en un proxy y reintentar peticiones sin miedo.

### **Míralo en el cable**

Antes de seguir con la teoría, juega con ella. Arma peticiones distintas y mira exactamente qué viaja y qué vuelve:

<iframe src="/ovas/api-http-anatomia.html" title="Anatomía de una petición HTTP: arma la petición y mira la respuesta" loading="lazy"></iframe>

Fíjate especialmente en la tira de abajo, la **escalera de comprobaciones**. Cada respuesta se decide en un peldaño concreto y el orden no es decorativo — volveremos a él en dos secciones.

---

## **🔤 Los verbos: el idioma ya existe**

El error más común de una primera API es inventar un vocabulario que HTTP ya tenía:

\`\`\`
❌ POST /obtenerLibro
❌ POST /borrarLibro?id=7
❌ GET  /crearPrestamo?libro=42&socio=8
\`\`\`

Eso no es «REST simplificado», es RPC con URLs bonitas. Y el problema no es de estilo: **rompe garantías reales**. Ese último \`GET\` que crea un préstamo es una bomba, porque un \`GET\` promete no cambiar nada — y hay proxies, precargadores del navegador y rastreadores que llaman a los \`GET\` que encuentran, sin preguntar.

[RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html), que desde 2022 es *la* referencia de la semántica de HTTP, define dos propiedades que hay que memorizar:

- **Seguro** — «sus semánticas son esencialmente de solo lectura; los efectos secundarios no son esenciales al propósito del método».
- **Idempotente** — «N peticiones idénticas tienen el mismo efecto que una sola».

| Verbo | Seguro | Idempotente | Para qué es |
|---|---|---|---|
| \`GET\` | ✅ | ✅ | leer un recurso |
| \`HEAD\` | ✅ | ✅ | leer solo las cabeceras |
| \`OPTIONS\` | ✅ | ✅ | preguntar qué se puede hacer aquí |
| \`POST\` | ❌ | ❌ | crear dentro de una colección; **el servidor elige la URL** |
| \`PUT\` | ❌ | ✅ | reemplazar el recurso entero en una URL que **tú** eliges |
| \`PATCH\` | ❌ | ❌ | modificar algunos campos |
| \`DELETE\` | ❌ | ✅ | borrar |

Dos consecuencias prácticas que casi nadie explica:

**\`POST\` es el único que no es idempotente**, y por eso reintentar un \`POST\` tras un *timeout* es peligroso: puede que la primera llamada sí llegara y acabes con dos préstamos. Reintentar un \`PUT\` o un \`DELETE\` no tiene ese riesgo. Cuando necesites que un \`POST\` sea seguro de reintentar, la solución es una **clave de idempotencia** que el cliente genera y el servidor recuerda.

**\`PUT\` reemplaza, \`PATCH\` modifica.** Si mandas \`PUT /libros/7\` con solo \`{"ejemplares": 6}\`, la lectura literal del estándar es que el resto de campos desaparecen. Confundirlos es cómo se pierden datos sin que salte ninguna alarma.

---

## **🚦 Los códigos de estado, y la escalera que los ordena**

Esto es lo que devuelve una primera API mal hecha:

\`\`\`
HTTP/1.1 200 OK

{ "error": true, "mensaje": "no encontrado" }
\`\`\`

Un \`200\` diciendo que algo falló obliga a **todos** los clientes a leer el cuerpo para saber si hubo error. Rompe los reintentos automáticos, rompe el caché, rompe el panel de monitorización que cuenta respuestas por código y rompe a la persona que integre tu API el año que viene.

El código de estado es la primera línea de la respuesta por una razón: **es la parte que se lee sin entender nada del dominio**. Úsalo.

| Código | Significa | Cuándo |
|---|---|---|
| \`200 OK\` | salió bien y hay cuerpo | lecturas, y modificaciones que devuelven el recurso |
| \`201 Created\` | se creó algo nuevo | tras un \`POST\` — **y con cabecera \`Location\`** |
| \`204 No Content\` | salió bien y no hay nada que decir | tras un \`DELETE\` |
| \`206 Partial Content\` | te doy un tramo | respuestas paginadas con \`Content-Range\` |
| \`400 Bad Request\` | no pude leer lo que enviaste | JSON roto, sintaxis inválida |
| \`401 Unauthorized\` | **no sé quién eres** | falta el token o no es válido |
| \`403 Forbidden\` | sé quién eres y **no puedes** | el rol no tiene ese permiso |
| \`404 Not Found\` | no existe | id inexistente |
| \`409 Conflict\` | choca con lo que ya hay | \`unique\` violado, clave foránea, regla de negocio |
| \`422 Unprocessable Content\` | te leí bien, pero no tiene sentido | falta un campo obligatorio, tipo incorrecto |
| \`429 Too Many Requests\` | frena | límite de peticiones |
| \`500 Internal Server Error\` | se rompió algo **mío** | y nunca por culpa del cliente |

Cuatro distinciones que hay que tener afiladas:

**\`401\` frente a \`403\`.** El primero es sobre *identidad*: reintentar con credenciales tiene sentido, y por eso el \`401\` obliga a incluir la cabecera \`WWW-Authenticate\` diciendo cómo. El segundo es sobre *permisos*: reintentar con el mismo token no va a cambiar nada.

**\`400\` frente a \`422\`.** \`400\` es sintaxis — no pude abrir el sobre. \`422\` es semántica: el JSON estaba perfecto pero le falta el título. RFC 9110 lo define como *«el cuerpo enviado no se puede procesar porque el contenido tiene errores semánticos»*, y de paso lo renombró: hoy es **Unprocessable Content**, ya no *Unprocessable Entity*.

**\`422\` frente a \`409\`.** \`422\` es sobre la petición en sí misma; \`409\` es sobre el choque con **el estado actual del sistema**. Un ISBN duplicado es \`409\`, porque la petición sería perfectamente válida en una base de datos vacía.

**Una colección vacía es \`200 []\`, nunca \`404\`.** La colección existe; lo vacío es el resultado. Un \`404\` ahí obliga al cliente a distinguir entre «no hay libros de ese autor» y «me equivoqué de URL».

### **El orden de las comprobaciones**

Los códigos no se eligen sueltos: salen de una escalera, y cada peldaño supone que los anteriores ya pasaron.

\`\`\`
ruta → identidad → permiso → existe → sintaxis → reglas → estado → listo
405     401         403       404      400        422      409      2xx
\`\`\`

Ese orden tiene consecuencias que se ven en la visualización de arriba. \`POST /libros/7\` responde \`405\`, no \`404\`, aunque el libro 7 no existiera: el problema es la **forma** de la petición, y eso se decide antes de mirar la base de datos. Y la comprobación de identidad va antes que la de existencia, para no filtrar qué ids existen a quien no ha demostrado ser nadie.

Para los cuerpos de error, hay un formato estándar y casi nadie lo usa: **[RFC 9457, *Problem Details for HTTP APIs*](https://www.rfc-editor.org/rfc/rfc9457.html)** (agosto de 2023, sustituye al RFC 7807). Es un JSON con \`type\`, \`title\`, \`status\` y \`detail\`, servido como \`application/problem+json\`. No es obligatorio, pero adoptarlo te ahorra inventarte un formato de error propio — que es lo que acabarás haciendo.

---

## **🗂️ Recursos, no acciones**

La regla de diseño de URL cabe en una frase: **las rutas son sustantivos, los verbos ya los pone HTTP**.

\`\`\`
✅ GET    /libros              lista
✅ GET    /libros/7            uno
✅ POST   /libros              crear
✅ PATCH  /libros/7            modificar
✅ DELETE /libros/7            borrar
✅ GET    /socios/8/prestamos  los préstamos de un socio
\`\`\`

Un par de decisiones que conviene tomar una vez y no volver a pensar: plural para las colecciones (\`/libros\`, no \`/libro\`), minúsculas con guiones (\`/prestamos-vencidos\`), y **nada de extensiones** (\`.json\` en la URL es trabajo de la cabecera \`Accept\`).

Y lo que **no** va en la ruta: los filtros. \`/libros/disponibles\` parece cómodo hasta que necesitas disponibles *de un autor* ordenados *por título*. Los filtros son parámetros de consulta, que se combinan; las rutas no.

\`\`\`
✅ GET /libros?ejemplares=gt.0&autor_id=eq.3&order=titulo.asc
❌ GET /libros/disponibles/del-autor/3/ordenados-por-titulo
\`\`\`

### **El elefante: esto que estamos haciendo no es REST**

Conviene decirlo con todas las letras, porque la industria lleva veinte años usando mal la palabra.

REST lo definió **Roy Fielding** en su tesis doctoral de 2000, y una de sus restricciones es *HATEOAS*: las respuestas deben incluir los enlaces que dicen qué se puede hacer a continuación, de modo que un cliente pueda navegar la API **sin conocer de antemano ninguna URL salvo la inicial**. El **modelo de madurez de Richardson** lo ordena en niveles: 0 (un solo endpoint, todo por \`POST\`), 1 (recursos con URL propia), 2 (verbos y códigos de estado), 3 (hipermedia).

Prácticamente todo lo que se llama REST —incluido lo de este artículo— es **nivel 2**. Y Fielding fue explícito al respecto en [su entrada de 2008](https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven):

> *«Me está frustrando la cantidad de gente que llama API REST a cualquier interfaz basada en HTTP. […] si el motor del estado de la aplicación no está dirigido por hipertexto, entonces no puede ser RESTful ni puede ser una API REST. Punto.»*

No lo cuento para que persigas el nivel 3 — pocas APIs lo necesitan y el coste es real. Lo cuento porque **saber qué estás construyendo vale más que la etiqueta**. Estás haciendo una API HTTP orientada a recursos, que es exactamente lo que hace falta aquí. Llámalo REST si quieres; ahora ya sabes lo que estás diciendo.

---

## **🏛️ La base de datos es el contrato de verdad**

Llegamos a la idea que separa una API que aguanta de una que se cae al primer imprevisto.

**Validar en Python es experiencia de usuario. Validar en la base de datos es la verdad.**

La razón es simple: tu endpoint no es el único camino hacia los datos. También están el script de migración, la tarea nocturna, la consola de \`psql\` que alguien abre a las tres de la mañana, el segundo servicio que el equipo escribió el año pasado. Una regla que vive en \`views.py\` protege exactamente **un** camino.

Así que las reglas van en el esquema, y el endpoint las repite solo para dar mensajes bonitos:

\`\`\`sql
create schema api;

create table api.autor (
  id     int  primary key generated always as identity,
  nombre text not null check (length(trim(nombre)) > 0)
);

create table api.socio (
  id     int  primary key generated always as identity,
  nombre text not null,
  email  text not null unique
);

create table api.libro (
  id         int  primary key generated always as identity,
  autor_id   int  not null references api.autor(id) on delete restrict,
  titulo     text not null check (length(trim(titulo)) > 0),
  isbn       text not null unique check (isbn ~ '^\\d{13}$'),
  ejemplares int  not null default 1 check (ejemplares >= 0)
);

create table api.prestamo (
  id          int  primary key generated always as identity,
  libro_id    int  not null references api.libro(id) on delete restrict,
  socio_id    int  not null references api.socio(id) on delete restrict,
  prestado_el date not null default current_date,
  devuelto_el date,
  check (devuelto_el is null or devuelto_el >= prestado_el)
);

-- Índice parcial: solo indexa los préstamos abiertos, que es
-- lo único que consultamos para el límite por socio.
create index prestamo_activo_por_socio
  on api.prestamo (socio_id) where devuelto_el is null;
\`\`\`

Lee ese bloque otra vez pensando en HTTP. Cada línea es una respuesta de error que ya no tienes que programar:

| En el esquema | Lo que impide | El código que devuelve |
|---|---|---|
| \`not null\` | crear sin título | \`422\` |
| \`unique (isbn)\` | dos libros con el mismo ISBN | \`409\` |
| \`references … on delete restrict\` | borrar un libro con préstamos | \`409\` |
| \`check (ejemplares >= 0)\` | dejar el stock en negativo | \`422\` |
| \`check (devuelto_el >= prestado_el)\` | devolver antes de prestar | \`422\` |

Esa tabla es el puente entre las dos mitades del artículo. **La mitad de tu API ya está escrita** — en SQL, en el momento de crear las tablas. La pregunta que queda es cuánta de la otra mitad quieres escribir tú.

---

# **Parte II — Dos caminos**

## **🐘 PostgREST: la API que genera la base de datos**

[PostgREST](https://docs.postgrest.org/) es un servidor —escrito en Haskell, un único binario sin dependencias— que se conecta a PostgreSQL, **lee su catálogo** y publica una API HTTP: una ruta por tabla, por vista y por función. La versión actual es la **16.2** (agosto de 2026).

No hay generación de código ni ficheros que sincronizar. Cambias una tabla, recargas el esquema, la API cambió.

Arrancarlo son tres piezas. Los roles:

\`\`\`sql
-- Quien no se identifica.
create role web_anon nologin;
grant usage  on schema api to web_anon;
grant select on api.libro, api.autor to web_anon;

-- Un socio identificado.
create role socio nologin;
grant usage  on schema api to socio;
grant select on api.libro, api.autor, api.prestamo to socio;

-- El personal de la biblioteca.
create role bibliotecario nologin;
grant usage on schema api to bibliotecario;
grant select, insert, update, delete on all tables in schema api to bibliotecario;

-- El rol con el que PostgREST se conecta: no hereda nada,
-- solo tiene permiso para *convertirse* en los otros tres.
create role authenticator noinherit login password 'cámbiala';
grant web_anon, socio, bibliotecario to authenticator;
\`\`\`

Y la configuración:

\`\`\`ini
db-uri       = "postgres://authenticator:cámbiala@localhost:5432/biblioteca"
db-schemas   = "api"
db-anon-role = "web_anon"
jwt-secret   = "un secreto de al menos 32 caracteres"
db-max-rows  = 100
\`\`\`

### **El modelo de seguridad, que es la parte interesante**

Aquí está la idea que hace a PostgREST distinto de un generador de CRUD cualquiera: **toda la autorización ocurre dentro de PostgreSQL**.

PostgREST se conecta siempre con \`authenticator\`, un rol casi sin permisos. Cuando llega una petición con un JWT válido, lee el rol de la reclamación correspondiente y ejecuta **\`set local role\`** hacia ese rol, para esa transacción y solo para ella. Si no hay JWT, se convierte en \`db-anon-role\`.

Es decir: no hay una capa de permisos en el servidor HTTP que pueda tener un agujero distinto al de la base de datos. **Son la misma capa.**

Sobre eso se apoya *row level security*, que es donde se pone bueno:

\`\`\`sql
alter table api.prestamo enable row level security;

create policy prestamo_propio on api.prestamo
  for select to socio
  using (
    socio_id = (current_setting('request.jwt.claims', true)
                ::json ->> 'socio_id')::int
  );
\`\`\`

PostgREST publica las reclamaciones del JWT como un ajuste de transacción, \`request.jwt.claims\`, y la política lo lee. A partir de ahí, **da igual por dónde entre la consulta**: \`GET /prestamo\` devuelve solo los del socio, y un \`select * from api.prestamo\` ejecutado con ese rol también.

### **Lo que sale gratis**

Con las tablas y los roles creados, ya tienes:

\`\`\`bash
# Filtrar, ordenar, elegir columnas
GET /libro?ejemplares=gt.0&order=titulo.asc&select=titulo,isbn

# Seguir la clave foránea sin escribir el JOIN
GET /libro?select=titulo,autor(nombre)

# O y AND
GET /libro?or=(ejemplares.eq.0,autor_id.eq.3)

# Paginar, con el total en la respuesta
GET /libro
Range-Unit: items
Range: 0-19
Prefer: count=exact
#  --> 206 Partial Content
#  --> Content-Range: 0-19/348
\`\`\`

Los operadores son los de SQL con nombre corto: \`eq\`, \`neq\`, \`gt\`, \`gte\`, \`lt\`, \`lte\`, \`like\`, \`ilike\`, \`in\`, \`is\`, \`fts\` para búsqueda de texto completo. El \`select=titulo,autor(nombre)\` merece un momento: PostgREST **no adivina** la relación, la deduce de la clave foránea. Sin \`references\`, ese embebido no existe.

Para el conteo hay tres modos, porque \`count(*)\` exacto es caro: \`count=exact\`, \`count=planned\` (usa las estadísticas del planificador) y \`count=estimated\`, que mezcla los dos según el tamaño.

Y una cosa más, gratis: PostgREST **sirve su propia documentación** en la ruta raíz, generada desde el catálogo, y usa los \`COMMENT ON\` de tus tablas y columnas como descripciones. Un detalle a tener en cuenta: el formato que emite es **Swagger 2.0**, no OpenAPI 3.x — importa si tu generador de clientes solo entiende la versión moderna.

\`\`\`sql
comment on table api.libro is
  'Ejemplares del catálogo. El ISBN es único.';
\`\`\`

### **Lo que no hace**

PostgREST expone datos; no orquesta. En cuanto necesitas mandar un correo, llamar a una pasarela de pago, escribir en S3 o hablar con otro servicio, necesitas un proceso que lo haga. Y la lógica de negocio, si la pones en PostgREST, vive en **PL/pgSQL** — lo cual es perfectamente válido y también es una decisión de equipo con consecuencias: versionar, probar y depurar SQL es terreno menos cómodo que Python para casi todo el mundo.

---

## **🐍 Flask: la API que escribes tú**

[Flask](https://flask.palletsprojects.com/) va en la dirección contraria: no asume nada. La versión actual es la **3.1.3** (febrero de 2026) y requiere Python 3.9 o superior.

Para la base de datos uso **psycopg 3** directamente, sin ORM. Para una primera API es lo correcto: ves el SQL que se ejecuta, y eso es justo lo que quieres estar aprendiendo.

\`\`\`python
import os
from flask import Flask, request, jsonify, abort, g
from psycopg_pool import ConnectionPool
from psycopg.rows import dict_row
from psycopg.errors import UniqueViolation, ForeignKeyViolation, CheckViolation

# Un pool, no una conexión: abrir una conexión por petición
# es lento y agota los slots de PostgreSQL.
pool = ConnectionPool(
    os.environ["DATABASE_URL"],
    kwargs={"row_factory": dict_row},
    min_size=2, max_size=10,
)

app = Flask(__name__)
\`\`\`

Nada de credenciales en el código: \`DATABASE_URL\` viene del entorno. Es la primera regla y la que más se incumple.

### **Leer**

\`\`\`python
COLUMNAS_ORDENABLES = {"id", "titulo", "isbn", "ejemplares"}

@app.get("/libros")
def listar_libros():
    orden = request.args.get("orden", "id")
    # El nombre de columna NO se puede pasar como parámetro,
    # así que la lista blanca no es opcional.
    if orden not in COLUMNAS_ORDENABLES:
        abort(422, "columna de orden no permitida")

    limite = min(request.args.get("limit", type=int, default=20), 100)
    desde  = request.args.get("offset", type=int, default=0)

    with pool.connection() as con:
        filas = con.execute(
            f"select id, titulo, isbn, ejemplares from api.libro"
            f" order by {orden} limit %s offset %s",
            (limite, desde),
        ).fetchall()
        total = con.execute("select count(*) from api.libro").fetchone()["count"]

    resp = jsonify(filas)
    resp.headers["Content-Range"] = f"{desde}-{desde + len(filas) - 1}/{total}"
    resp.status_code = 206 if total > len(filas) else 200
    return resp
\`\`\`

Tres cosas aquí valen por todo el artículo:

Los **valores** van como parámetros (\`%s\`) y psycopg los escapa. Los **nombres de columna** no se pueden parametrizar, así que se validan contra una lista blanca. Interpolar \`request.args["orden"]\` directamente en el SQL es la inyección de manual, y funciona perfectamente hasta que deja de hacerlo.

El \`min(..., 100)\` no es cosmético. Sin él, \`?limit=999999999\` es una denegación de servicio de un carácter. (PostgREST tiene el mismo tope: \`db-max-rows\`.)

Y **siempre se pagina**. Una API que devuelve la tabla entera funciona en desarrollo y se cae el día que la tabla crece.

### **Crear**

\`\`\`python
@app.post("/libros")
def crear_libro():
    datos = request.get_json(silent=True)
    if datos is None:
        abort(400, "el cuerpo no es JSON válido")

    faltan = {"titulo", "autor_id", "isbn"} - datos.keys()
    if faltan:
        abort(422, f"faltan campos obligatorios: {sorted(faltan)}")

    try:
        with pool.connection() as con:
            fila = con.execute(
                "insert into api.libro (titulo, autor_id, isbn, ejemplares)"
                " values (%s, %s, %s, %s) returning *",
                (datos["titulo"], datos["autor_id"],
                 datos["isbn"], datos.get("ejemplares", 1)),
            ).fetchone()
    except UniqueViolation:
        abort(409, "ya existe un libro con ese ISBN")
    except ForeignKeyViolation:
        abort(422, "ese autor_id no existe")
    except CheckViolation:
        abort(422, "algún campo viola una restricción del esquema")

    resp = jsonify(fila)
    resp.status_code = 201
    resp.headers["Location"] = f"/libros/{fila['id']}"
    return resp
\`\`\`

Mira bien los tres \`except\`. **No comprueban antes; capturan después.** Es lo correcto, y es el punto donde más gente se equivoca.

La versión intuitiva —\`select\` para ver si el ISBN existe y luego \`insert\`— tiene una carrera: entre las dos consultas cabe otra petición haciendo lo mismo. El índice \`unique\` es el único árbitro que no se puede colar, así que el patrón sano es intentarlo y traducir el error. Cada \`except\` de ahí arriba es una restricción del <span style="color:#a855f7">esquema</span> convertida en un código HTTP.

### **Dónde Flask se gana el sueldo**

Todo lo anterior lo hacía PostgREST con cero líneas. Esto ya no:

\`\`\`python
@app.post("/prestamos")
def prestar():
    datos = request.get_json()

    # El bloque es una transacción: si algo lanza, se deshace entero.
    with pool.connection() as con:
        # Bloqueo obligatorio. Sin él, dos peticiones simultáneas
        # cuentan "2 activos" a la vez y ambas insertan el cuarto.
        con.execute("select 1 from api.socio where id = %s for update",
                    (datos["socio_id"],))

        activos = con.execute(
            "select count(*) from api.prestamo"
            " where socio_id = %s and devuelto_el is null",
            (datos["socio_id"],),
        ).fetchone()["count"]

        if activos >= 3:
            abort(409, "el socio ya tiene 3 préstamos sin devolver")

        fila = con.execute(
            "insert into api.prestamo (libro_id, socio_id)"
            " values (%s, %s) returning *",
            (datos["libro_id"], datos["socio_id"]),
        ).fetchone()

    # La transacción ya cerró y el préstamo está guardado:
    # solo ahora tiene sentido avisar al mundo exterior.
    cola.enqueue(enviar_correo_prestamo, fila["id"])
    return jsonify(fila), 201
\`\`\`

El \`for update\` es el corazón del ejemplo, y es el fallo clásico de la primera API: comprobar y luego escribir sin bloquear nada. Dos peticiones a la vez leen «2 activos», las dos deciden que caben, las dos insertan, y el socio acaba con cuatro préstamos. **Ningún framework arregla eso**; lo arregla entender la transacción.

Y fíjate en la última línea: el correo se manda **después** del commit, y por una cola. Meter una llamada HTTP dentro de la transacción es cómo se bloquea una base de datos entera esperando a que responda un servidor de correo.

---

## **⚖️ El mismo trabajo, lado a lado**

Ocho operaciones, resueltas por los dos caminos. Recórrelas en orden — el argumento está en el orden:

<iframe src="/ovas/api-postgrest-vs-flask.html" title="Comparador: la misma operación con PostgREST y con Flask" loading="lazy"></iframe>

Las primeras cinco son <span style="color:#a855f7">violeta</span> puro: PostgREST resuelve con cero líneas lo que en Flask cuesta entre 8 y 24. En la sexta empieza a equilibrarse. La séptima —la regla de los tres préstamos— es un empate honesto: los dos caminos cuestan lo mismo porque el trabajo de verdad es el mismo. Y la octava se cae del lado <span style="color:#f59e0b">ámbar</span>, porque PostgREST no orquesta.

### **Cómo elegir**

| Si tu caso es… | Empieza por |
|---|---|
| Panel interno, prototipo, app móvil que solo consulta y guarda | **PostgREST** |
| Muchas tablas, permisos por fila, poco código propio | **PostgREST** + RLS |
| Reglas de negocio, pagos, correos, integraciones | **Flask** |
| Las dos cosas | **Las dos**: PostgREST para los datos, Flask para lo demás |

Esa última fila no es un empate diplomático, es el diseño que más se ve funcionando: **PostgREST para el CRUD, un servicio propio para la lógica**, hablando los dos con la misma base de datos y compartiendo las mismas restricciones y las mismas políticas RLS. La base es la frontera común, no un detalle de implementación de uno de los dos.

Y si eliges Flask, aplica el criterio de la introducción: si un endpoint solo hace \`SELECT\` y \`jsonify\`, pregúntate si algún día tendrá algo más. Si la respuesta es no, ese endpoint sobra.

---

## **🩹 Los siete pecados de la primera API**

Todos los he cometido. Los pongo en el orden en que suelen doler:

1. **Interpolar SQL con f-strings.** \`f"... where id = {request.args['id']}"\` es una inyección. Los valores van como parámetros; los identificadores, contra lista blanca.
2. **Devolver \`200\` para todo.** Obliga a leer el cuerpo para saber si falló, y rompe reintentos, caché y monitorización.
3. **No paginar.** Funciona con 50 filas y se cae con 500 000.
4. **Validar solo en Python.** Hay otros caminos hacia los datos: el script, el \`psql\`, el otro servicio.
5. **Comprobar y luego escribir sin transacción.** El fallo de concurrencia clásico. Restricción en la base o \`for update\`; no hay tercera opción.
6. **El N+1.** Recorrer los libros y pedir \`libro.autor.nombre\` dentro del bucle son 1 + N consultas. Un \`JOIN\` es una.
7. **Credenciales en el repositorio.** Y una vez hecho el commit, ya no basta con borrarlas: hay que rotarlas, porque siguen en el historial.

---

## **🔒 Lo mínimo no negociable**

Antes de que nadie más pueda llamar a tu API:

- **HTTPS**, siempre. Un JWT en claro es un JWT de cualquiera.
- **Secretos por variables de entorno**, nunca en el código ni en el repositorio.
- **Un rol de base de datos por privilegio.** Tu API no se conecta como superusuario. En PostgREST esto viene impuesto; en Flask hay que acordarse.
- **Límite de peticiones** (\`429\`) en el proxy, delante de la aplicación.
- **CORS explícito.** \`Access-Control-Allow-Origin: *\` combinado con credenciales es un agujero, no una configuración.
- **Nunca devolver el \`traceback\` al cliente.** Un \`500\` lleva un mensaje genérico y un identificador; el detalle va a tus logs.
- **Y por defecto, denegar.** Las columnas y las tablas que no has expuesto a propósito no deberían estar expuestas.

---

## **🎯 Conclusión**

Si te quedas con tres cosas:

**El contrato es lo primero.** Verbos, códigos de estado y forma de las URLs son un vocabulario que ya existe, está escrito en RFC 9110 y lo entiende todo el mundo. Inventarte uno propio solo consigue que tu API haya que explicarla.

**Las reglas viven en el esquema.** \`not null\`, \`unique\`, \`references\`, \`check\` y las políticas de RLS se cumplen por todos los caminos, no solo por el tuyo. La validación en Python es para dar buenos mensajes, no para garantizar nada.

**Y la pregunta final no es «¿PostgREST o Flask?», es «¿cuánto de mi API es realmente mío?».** Si la respuesta es «casi nada, son consultas», PostgREST te ahorra un servicio entero que mantener. Si hay reglas, orquestación y efectos fuera de la base, escríbelo tú — y que PostgREST se encargue del resto.

Lo que no tiene sentido es la tercera vía por omisión: escribir a mano, endpoint a endpoint, una traducción literal de un esquema que ya sabía decirlo todo.

---

## **📚 Referencias**

**Los estándares**

- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) (junio de 2022, STD 97). Métodos, códigos de estado y cabeceras. Sustituye al RFC 7231 y a la mayor parte de la serie 723x.
- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html) (agosto de 2023). El formato estándar para cuerpos de error; sustituye al RFC 7807.
- [RFC 5789 — PATCH Method for HTTP](https://www.rfc-editor.org/rfc/rfc5789.html). Define \`PATCH\` y explica por qué no es idempotente.

**REST, el de verdad**

- Roy T. Fielding, [*Architectural Styles and the Design of Network-based Software Architectures*](https://roy.gbiv.com/pubs/dissertation/top.htm) (tesis doctoral, 2000). El capítulo 5 es donde se define REST.
- Roy T. Fielding, [*REST APIs must be hypertext-driven*](https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven) (2008).
- Martin Fowler, [*Richardson Maturity Model*](https://martinfowler.com/articles/richardsonMaturityModel.html).

**PostgREST**

- [Documentación de PostgREST 16](https://docs.postgrest.org/en/v16/)
- [Autenticación y roles](https://docs.postgrest.org/en/v16/references/auth.html)
- [Tablas y vistas: operadores, filtros y embebidos](https://docs.postgrest.org/en/v16/references/api/tables_views.html)
- [Paginación y conteo](https://docs.postgrest.org/en/v16/references/api/pagination_count.html)
- [Notas de la versión 16.0](https://github.com/PostgREST/postgrest/releases/tag/v16.0)

**Flask, psycopg y PostgreSQL**

- [Documentación de Flask 3.1](https://flask.palletsprojects.com/en/stable/)
- [psycopg 3 — pool de conexiones](https://www.psycopg.org/psycopg3/docs/advanced/pool.html)
- [PostgreSQL — Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [PostgreSQL — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
`,h=`---
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

   Sin esto, \`.markdown-content > *\` mandaria el notebook entero a la
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
.gl-t::after { content: "\\00a0💡"; font-size: 0.85em; }
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

/* Nombres cortos en celdas estrechas: sin esto el navegador parte
   \`caffe\` en dos lineas en cuanto la columna de al lado crece. */
.colab-nb td code, .colab-nb th code { white-space: nowrap; }

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

Casi todo el material sobre <span class="gl"><input type="checkbox" id="gl-cnn" class="gl-c"><label for="gl-cnn" class="gl-t">redes convolucionales</label><span class="gl-m"><label for="gl-cnn" class="gl-bg"></label><span class="gl-b"><b>Red convolucional (CNN)</b><span>Las siglas vienen del inglés <i>convolutional neural network</i>. Es el tipo de red pensado para imágenes: en vez de conectar cada píxel con todo, aprende <b>filtros pequeños</b> que recorren la imagen entera buscando el mismo patrón en cualquier posición.</span><span>Esa es toda la idea: un borde es un borde esté arriba o abajo, así que el mismo filtro sirve para toda la imagen. De ahí que use tan pocos parámetros comparada con una red densa, y de ahí que su entrada tenga que ser un tensor con una forma muy concreta.</span><label for="gl-cnn" class="gl-x">Entendido</label></span></span></span> empieza en la arquitectura: cuántas capas, cuántos filtros, qué activación. Y el preprocesado se despacha en dos líneas, como si fuera fontanería:

\`\`\`python
X_train, X_test = X_train / 255.0, X_test / 255.0
\`\`\`

Con <span class="gl"><input type="checkbox" id="gl-mnist" class="gl-c"><label for="gl-mnist" class="gl-t">MNIST</label><span class="gl-m"><label for="gl-mnist" class="gl-bg"></label><span class="gl-b"><b>MNIST</b><span>Es la colección de <b>dígitos manuscritos</b> —70.000 imágenes de 28×28 en escala de grises, del 0 al 9— con la que empieza prácticamente todo curso de redes neuronales. Se descarga en una línea desde Keras.</span><span>Es un buen primer ejercicio y un mal modelo mental: viene limpio, equilibrado, ya partido y con todas las imágenes del mismo tamaño. Cada una de esas cuatro comodidades es justo lo que un conjunto real no te da.</span><label for="gl-mnist" class="gl-x">Entendido</label></span></span></span> eso basta, porque MNIST viene resuelto: 70.000 imágenes, todas de 28×28, un solo canal, ya partidas en <span class="gl"><input type="checkbox" id="gl-conjuntos" class="gl-c"><label for="gl-conjuntos" class="gl-t">entrenamiento y prueba</label><span class="gl-m"><label for="gl-conjuntos" class="gl-bg"></label><span class="gl-b"><b>Entrenamiento, validación y prueba</b><span>Los datos se parten en tres montones con papeles distintos. <b>Entrenamiento</b> es lo único que el modelo mira para ajustar sus pesos. <b>Validación</b> es lo que miras tú mientras decides cuántas capas, qué tamaño de entrada o cuándo parar. <b>Prueba</b> se abre una sola vez, al final, para reportar la cifra.</span><span>Si eliges algo mirando el conjunto de prueba, deja de ser prueba: se convierte en validación, y tu cifra final ya no estima nada. Por eso MNIST solo trae dos montones y la validación la recortas tú del entrenamiento.</span><label for="gl-conjuntos" class="gl-x">Entendido</label></span></span></span>. Ese conjunto está *diseñado* para que el preprocesado no estorbe.

Un conjunto real no se parece a eso. Este artículo usa **ACRIMA**, 705 fotografías de <span class="gl"><input type="checkbox" id="gl-fondo" class="gl-c"><label for="gl-fondo" class="gl-t">fondo de ojo</label><span class="gl-m"><label for="gl-fondo" class="gl-bg"></label><span class="gl-b"><b>Fondo de ojo (retinografía)</b><span>Es la fotografía de la pared interna del ojo, tomada con una cámara que ilumina y enfoca a través de la pupila. Se ve la retina anaranjada, la malla de vasos, y una zona clara y redonda —el <b>disco óptico</b>— por donde sale el nervio hacia el cerebro.</span><span>Es la prueba más barata y extendida para cribar glaucoma, y por eso casi todos los conjuntos públicos son de este tipo. No mide presión ni campo visual: solo muestra la forma del nervio.</span><label for="gl-fondo" class="gl-x">Entendido</label></span></span></span> con **dos etiquetas y nada más**: **ojo con glaucoma** (396 imágenes) u **ojo sano** (309). Esa es toda la tarea — mirar una retina y decidir en cuál de los dos montones va. Y en ese conjunto vas a encontrar 258 tamaños distintos, la etiqueta escondida en el nombre del archivo, dos archivos que un \`glob\` mal escrito pierde en silencio, y —esto es lo importante— **pistas que permiten acertar el 86,8 % de los diagnósticos sin mirar un solo píxel de anatomía**.

La tesis del artículo es esa última parte:

> Una CNN no ve una imagen. Ve un **tensor**: forma fija, rango acotado, ejes en un orden concreto. Convertir un archivo en ese tensor no es fontanería — es donde decides **qué puede aprender el modelo y qué atajos le dejas tomar**.

Todo el código de aquí abajo vive también en un notebook ejecutable — **es el que se está socializando**, y se abre en Google Colab de un clic, sin instalar nada: [**\`glaucoma_preprocesado.ipynb\`**](https://colab.research.google.com/github/stivenson/stivenson.github.io/blob/main/notebooks/glaucoma_preprocesado.ipynb). Descarga los datos solo, corre entero con *Entorno de ejecución → Ejecutar todas*, y reproduce cada cifra de este artículo.

</div>

<div class="nb-cell nb-md">

<div class="flujo">
<div class="fp" style="--fc:#06b6d4"><b>1 · El archivo</b><code>Im318_g_ACRIMA.jpg</code><em>19.781 bytes · la <b>_g_</b> dice “glaucoma”</em></div>
<div class="fp" style="--fc:#06b6d4"><b>2 · Decodificar</b><code>np.asarray(img)</code><em>(379, 379, 3) uint8</em></div>
<div class="fp" style="--fc:#22c1c3"><b>3 · Redimensionar</b><code>img.resize((224, 224))</code><em>(224, 224, 3) uint8</em></div>
<div class="fp" style="--fc:#3ecf9a"><b>4 · A decimales</b><code>x.astype("float32") / 255</code><em>rango [0, 1]</em></div>
<div class="fp" style="--fc:#10b981"><b>5 · Normalizar</b><code>(x - MEAN) / STD</code><em>centrado en 0</em></div>
<div class="fp" style="--fc:#10b981"><b>6 · Apilar</b><code>np.stack(imagenes)</code><em>(32, 224, 224, 3)</em></div>
</div>

Seis pasos. Los tres primeros deciden **qué información sobrevive**; los tres últimos, **en qué escala llega**. Vamos uno por uno, y al final volvemos a mirar el diagrama con otros ojos.

Al final de esa cadena, cada retina llega convertida en números y con una sola cosa pegada a ella: su etiqueta, \`1\` si es un **ojo con glaucoma** y \`0\` si es un **ojo sano**. Todo lo que sigue existe para que esos números conserven lo que distingue un montón del otro — y para que no conserven, sin darte cuenta, algo que los distingue por accidente.

</div>

<div class="nb-cell nb-md">

## 1. El archivo no es la imagen

Un \`.jpg\` no contiene píxeles. Contiene **instrucciones para reconstruirlos**: coeficientes de una <span class="gl"><input type="checkbox" id="gl-dct" class="gl-c"><label for="gl-dct" class="gl-t">transformada del coseno</label><span class="gl-m"><label for="gl-dct" class="gl-bg"></label><span class="gl-b"><b>Transformada del coseno (DCT)</b><span>JPEG parte la imagen en bloques de 8×8 píxeles y describe cada bloque como una suma de ondas: primero el tono medio, después los detalles cada vez más finos. Guardar esos coeficientes en vez de los píxeles no ahorra nada por sí solo — lo que ahorra es <b>cuantizarlos</b>: redondear los coeficientes finos hasta que muchos quedan en cero.</span><span>Por eso JPEG pierde información y por eso el archivo pesa 20 KB mientras el tensor pesa 431 KB. Ese redondeo es también el origen de los bloques cuadrados que se ven en fotos muy comprimidas.</span><label for="gl-dct" class="gl-x">Entendido</label></span></span></span>, cuantizados y comprimidos. Es un formato de compresión, no un formato de datos.

Por eso \`Image.open()\` es tan rápido: no decodifica nada. Solo lee la cabecera y te devuelve un objeto perezoso. Los números aparecen cuando pides el array.

</div>

<div class="nb-cell nb-code" data-exec="1">

\`\`\`python
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
\`\`\`

<div class="nb-out">Objeto perezoso  : &lt;PIL.JpegImagePlugin.JpegImageFile image mode=RGB size=379x379&gt;
Bytes en disco   : 19,781
Bytes en memoria : 430,923
Factor           : <b>21.8x</b></div>

</div>

<div class="nb-cell nb-md">

Casi veintidós veces más grande al descomprimirse. Ese factor es la razón de que no puedas cargar el conjunto entero en memoria y ya: las 705 imágenes de ACRIMA ocupan **24 MB** en disco, **684 MB** como enteros y **2,7 GB** en cuanto las conviertes a \`float32\`.

De ahí salen los generadores y los \`tf.data.Dataset\`: no son una complicación gratuita, son la consecuencia de este número.

> 💡 **Lección clave:** el peso del archivo no te dice cuánta memoria necesitas. Lo que importa es \`alto × ancho × canales × bytes_por_valor\`.

</div>

<div class="nb-cell nb-md">

## 2. La imagen es un tensor

Lo que devuelve \`np.asarray\` es una <span class="gl"><input type="checkbox" id="gl-tensor" class="gl-c"><label for="gl-tensor" class="gl-t">matriz de tres dimensiones</label><span class="gl-m"><label for="gl-tensor" class="gl-bg"></label><span class="gl-b"><b>Tensor</b><span>Un <b>tensor</b> es simplemente un array de números con varias dimensiones. Un número suelto tiene 0; una lista, 1; una tabla, 2; una imagen en color, 3 (alto, ancho, canal), y un lote de imágenes, 4.</span><span>No hay nada más. Cuando alguien dice que “la red procesa tensores”, quiere decir que multiplica y suma bloques de números como este.</span><label for="gl-tensor" class="gl-x">Entendido</label></span></span></span>: alto, ancho y <span class="gl"><input type="checkbox" id="gl-canal" class="gl-c"><label for="gl-canal" class="gl-t">canal</label><span class="gl-m"><label for="gl-canal" class="gl-bg"></label><span class="gl-b"><b>Canal</b><span>Cada <b>canal</b> es una matriz completa de la imagen que mide una cosa distinta. En color hay tres —rojo, verde y azul— y apilarlas reconstruye la foto.</span><span>En escala de grises solo hay uno. Y después de una capa convolucional puede haber 32 o 64: ya no son colores, son mapas de “dónde aparece cada patrón que la red aprendió a buscar”.</span><label for="gl-canal" class="gl-x">Entendido</label></span></span></span>. Nada más. No hay “colores” ni “bordes” ni “disco óptico” — hay enteros entre 0 y 255 ordenados en una rejilla.

Merece la pena verlo de cerca una vez, porque después vas a pasar meses hablando de tensores sin volver a mirar uno. Acércate hasta que aparezcan los números, y prueba a aislar el canal verde:

</div>

<div class="nb-cell nb-md">

<iframe src="/ovas/retina-a-tensor.html" title="De la retina a los números: acércate hasta ver los valores de cada píxel" loading="lazy"></iframe>

Dos cosas que se ven ahí y que conviene retener.

La primera: **el canal verde es el que mejor contrasta la estructura vascular**. La hemoglobina absorbe fuertemente en esa banda, así que los vasos aparecen oscuros sobre un fondo claro y el contraste es el mayor de los tres. El rojo se satura —la retina *es* roja— y el azul apenas recibe luz. Por eso una parte de la literatura de fondo de ojo trabaja solo con \`G\`, y por eso pasar a escala de grises promediando los tres canales es peor que quedarse con el verde.

La segunda: entre \`uint8\` y \`float32\` normalizado no cambia el dibujo, cambia **la escala en la que la red recibe los números**. Y eso sí cambia el entrenamiento.

</div>

<div class="nb-cell nb-md">

## 3. El conjunto real: dónde está la etiqueta

Antes de tocar un píxel hay que resolver algo más aburrido y más peligroso: de dónde sale \`y\`.

En MNIST viene servido, \`(X_train, y_train), (X_test, y_test) = mnist.load_data()\`. En ACRIMA la etiqueta está **en el nombre del archivo**, y su documentación lo dice así: el nombre lleva \`_g_\` si la imagen es de un **ojo con glaucoma**, y solo \`_\` si es de un **ojo sano**.

| Nombre del archivo | Etiqueta | \`y\` |
|---|---|---|
| \`Im318_g_ACRIMA.jpg\` | ojo con glaucoma | \`1\` |
| \`Im013_ACRIMA.jpg\` | ojo sano | \`0\` |

Es decir: **la clase sana no se marca, se deduce de que no está marcada**. Esto, que parece un detalle tipográfico, es la primera trampa.

</div>

<div class="nb-cell nb-code" data-exec="2">

\`\`\`python
import glob

# --- Lo que casi todo el mundo escribe la primera vez -----------------
rutas_mal = glob.glob("acrima_mini/*.jpg")
normales_mal = [r for r in rutas_mal if "_n_" in r]     # buscando la marca de "normal"

print(f"Imágenes encontradas : {len(rutas_mal)}")
print(f"Etiquetadas normales : {len(normales_mal)}")
\`\`\`

<div class="nb-out">Imágenes encontradas : 58
Etiquetadas normales : <span class="err">0</span></div>

</div>

<div class="nb-cell nb-md">

Dos fallos a la vez, y ninguno lanza una excepción.

**Faltan dos imágenes.** El conjunto trae 60, pero dos archivos tienen la extensión en mayúsculas (\`.JPG\`). \`glob("*.jpg")\` distingue mayúsculas de minúsculas en Linux —el sistema donde corre Colab— y los descarta sin decir nada. En Windows los habría encontrado, lo que hace que el error aparezca solo al desplegar.

**No hay ni un ojo sano.** Como \`_n_\` no existe en ningún nombre, el filtro devuelve la lista vacía. Si a partir de ahí construyes \`y\`, te queda un vector de una sola clase y el modelo aprende a decir “glaucoma” siempre — con un <span class="gl"><input type="checkbox" id="gl-accuracy" class="gl-c"><label for="gl-accuracy" class="gl-t">accuracy</label><span class="gl-m"><label for="gl-accuracy" class="gl-bg"></label><span class="gl-b"><b>Accuracy (exactitud)</b><span>Es el porcentaje de aciertos sobre el total de imágenes. La métrica más fácil de leer, y la más fácil de inflar.</span><span>Con clases desbalanceadas basta con responder siempre la mayoritaria: en ACRIMA eso ya da <b>56,2 %</b> sin mirar nada. Por eso se acompaña de la <b>sensibilidad</b> (de los ojos enfermos, cuántos detecta) y la <b>especificidad</b> (de los sanos, cuántos no marca por error). En cribado clínico, dejar pasar un enfermo y molestar a un sano no cuestan lo mismo, y el accuracy los suma como si sí.</span><label for="gl-accuracy" class="gl-x">Entendido</label></span></span></span> excelente, que ya veremos por qué.

</div>

<div class="nb-cell nb-code" data-exec="3">

\`\`\`python
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
\`\`\`

<div class="nb-out">Imágenes encontradas    : <b>60</b>
Datos por cada etiqueta : [26 34]
Proporción de glaucoma  : <b>56.7%</b></div>

</div>

<div class="nb-cell nb-md">

> 💡 **Lección clave:** cuando la etiqueta vive en el nombre del archivo, el cargador de datos es código crítico. Cuenta siempre las clases justo después de construir \`y\`, y compáralo con lo que dice la documentación del conjunto. Un \`np.bincount\` de una línea te ahorra días.

Sobre el conjunto completo esa proporción es 396 ojos con glaucoma frente a 309 ojos sanos — **56,2 % contra 43,8 %**. Guárdate ese 56,2 %: va a volver.

</div>

<div class="nb-cell nb-md">

## 4. La forma fija: por qué hay que redimensionar

Las 705 imágenes de ACRIMA vienen en **258 tamaños distintos**, desde 178×178 hasta 1420×1420. Con esa arquitectura no puedes entrenar sobre ellas tal cual.

Y conviene entender por qué, porque casi siempre se explica mal. **Las <span class="gl"><input type="checkbox" id="gl-conv" class="gl-c"><label for="gl-conv" class="gl-t">capas convolucionales</label><span class="gl-m"><label for="gl-conv" class="gl-bg"></label><span class="gl-b"><b>Convolución</b><span>Una <b>convolución</b> desliza una ventanita de pesos —el <i>filtro</i> o <i>kernel</i>, típicamente de 3×3— por toda la imagen, y en cada posición multiplica y suma.</span><span>La gracia es que los mismos pesos se reutilizan en todas las posiciones: por eso una capa con 32 filtros de 3×3 sobre 3 canales necesita solo 896 parámetros, y por eso funciona igual sea cual sea el tamaño de la imagen.</span><label for="gl-conv" class="gl-x">Entendido</label></span></span></span> no necesitan un tamaño fijo**: un filtro de 3×3 se desliza igual sobre una imagen de 200 píxeles que sobre una de 1400. Lo que fija la entrada es lo que viene después: el <span class="gl"><input type="checkbox" id="gl-flatten" class="gl-c"><label for="gl-flatten" class="gl-t"><span class="gl-k">Flatten</span></label><span class="gl-m"><label for="gl-flatten" class="gl-bg"></label><span class="gl-b"><b>Flatten</b><span><b>Flatten</b> coge el bloque de activaciones que sale de las convoluciones —por ejemplo 28×28×32— y lo estira en un vector plano de 25.088 números, para poder enchufarlo a una capa densa.</span><span>Es el punto exacto donde el modelo deja de aceptar cualquier tamaño: ese 25.088 depende del tamaño de entrada, y la capa densa que viene después tiene un número de pesos fijo.</span><label for="gl-flatten" class="gl-x">Entendido</label></span></span></span> que aplana el mapa de activaciones antes de la capa densa. Esa capa densa tiene un número concreto de pesos, y ese número depende del tamaño de entrada.

Conviene ser preciso, porque hay dos exigencias distintas y solo una es negociable. Una red **totalmente convolucional** —la que sustituye el \`Flatten\` por un \`GlobalAveragePooling2D\`— sí admite imágenes de tamaños distintos, porque el promediado devuelve un vector cuya longitud es el número de filtros y no depende de la resolución. Lo que nunca es negociable es el **lote**: apilar 32 imágenes en un solo array obliga a que las 32 compartan forma. Así que redimensionar es inevitable para entrenar por lotes; que además lo exija la capa densa es cosa de esta arquitectura concreta.

Aquí es donde la decisión deja de ser fontanería. Esta es la arquitectura de un laboratorio típico de CNN, aplicada primero a MNIST y después, sin cambiar nada más que el tamaño de entrada, a fondo de ojo:

</div>

<div class="nb-cell nb-code" data-exec="4">

\`\`\`python
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
\`\`\`

<div class="nb-out">MNIST  (28, 28, 1)      Flatten=   288 Dense(100)=    28,900  total=    <b>34,710</b>
Retina (224, 224, 3)    Flatten= 25088 Dense(100)= 2,508,900  total= <b>2,514,190</b></div>

</div>

<div class="nb-cell nb-md">

**La misma arquitectura, letra por letra.** Solo cambia el tamaño de entrada, y los parámetros pasan de 34.710 a 2.514.190: **72 veces más**. Las capas convolucionales apenas notan el cambio —4.800 parámetros en MNIST y 5.088 en retina, y la diferencia son solo los dos canales de color extra del primer filtro—; los otros 2,5 millones están todos en una sola capa densa alimentada por el \`Flatten\`.

Ahora júntalo con la otra mitad del problema:

| | MNIST | ACRIMA a 224×224 |
|---|---|---|
| Imágenes de entrenamiento | 60.000 | 564 |
| Parámetros | 34.710 | 2.514.190 |
| **Parámetros por imagen** | **0,6** | **4.457** |

Siete mil veces peor. Eso no demuestra por sí solo que el modelo vaya a fallar, pero sí que tiene margen de sobra para <span class="gl"><input type="checkbox" id="gl-sobreajuste" class="gl-c"><label for="gl-sobreajuste" class="gl-t">memorizar</label><span class="gl-m"><label for="gl-sobreajuste" class="gl-bg"></label><span class="gl-b"><b>Sobreajuste</b><span>Hay <b>sobreajuste</b> cuando el modelo tiene tantos parámetros libres que puede almacenar las respuestas de las imágenes de entrenamiento en lugar de aprender la regla que las explica.</span><span>Se detecta mirando las dos curvas: el acierto en entrenamiento sigue subiendo mientras el de validación se estanca o empeora.</span><label for="gl-sobreajuste" class="gl-x">Entendido</label></span></span></span> las 564 imágenes en lugar de aprender la regla que las separa. El riesgo de sobreajuste es altísimo, y se confirma —o se descarta— de una sola manera: mirando las dos curvas de entrenamiento y validación y evaluando en una partición que el modelo no haya visto. Si el acierto de entrenamiento se acerca a 1 mientras el de validación se estanca, ya tienes la respuesta.

La salida no es entrenar más rato. Son tres decisiones, y las tres son de preprocesado o de arquitectura:

1. **Bajar el tamaño de entrada.** A 96×96, ese \`Dense\` cae a 460.900 parámetros.
2. **Cambiar \`Flatten\` por \`GlobalAveragePooling2D\`**, que promedia cada <span class="gl"><input type="checkbox" id="gl-activacion" class="gl-c"><label for="gl-activacion" class="gl-t">mapa de activación</label><span class="gl-m"><label for="gl-activacion" class="gl-bg"></label><span class="gl-b"><b>Mapa de activación</b><span>Cada filtro de una capa convolucional recorre la imagen entera y deja una rejilla de números: alto por ancho, un valor por posición, que dice cuánto se parece esa zona al patrón que el filtro busca. Esa rejilla es el <b>mapa de activación</b> de ese filtro.</span><span>Es la salida de la capa y la entrada de la siguiente. Una capa con 32 filtros produce 32 mapas apilados — el mismo formato que los tres canales de color, solo que ahora los canales ya no son rojo, verde y azul, sino patrones aprendidos.</span><label for="gl-activacion" class="gl-x">Entendido</label></span></span></span> y devuelve un vector de longitud igual al número de filtros — 32, independientemente del tamaño de entrada. El modelo entero pasa a **8.590 parámetros**: 293 veces menos que con \`Flatten\`, y sigue aceptando imágenes de 224×224.
3. <span class="gl"><input type="checkbox" id="gl-transfer" class="gl-c"><label for="gl-transfer" class="gl-t">Aprendizaje por transferencia</label><span class="gl-m"><label for="gl-transfer" class="gl-bg"></label><span class="gl-b"><b>Aprendizaje por transferencia</b><span>Consiste en partir de una red ya entrenada con millones de imágenes genéricas y reaprovechar lo que aprendió: bordes, texturas, formas. Se congelan esas capas y solo se entrena una cabeza nueva para tu problema.</span><span>Con 705 imágenes es casi siempre la opción correcta, porque las capas útiles ya vienen ajustadas y tú solo estimas unos pocos miles de parámetros.</span><label for="gl-transfer" class="gl-x">Entendido</label></span></span></span>, que es lo que se hace de verdad con 705 imágenes: congelar un extractor ya entrenado y ajustar solo la cabeza.

> 💡 **Lección clave:** el tamaño al que redimensionas no es un parámetro estético. Multiplica o divide la capacidad del modelo, y con conjuntos pequeños esa es la diferencia entre aprender y memorizar.

</div>

<div class="nb-cell nb-md">

### Cómo se reduce importa

Reducir de 1420×1420 a 224 significa tirar el **97,5 %** de los píxeles. La forma de tirarlos no da igual.

- **\`nearest\`** toma un píxel de cada 6 y descarta el resto sin mirarlos. Los vasos finos —de uno o dos píxeles de ancho— aparecen rotos o desaparecen. Es <span class="gl"><input type="checkbox" id="gl-aliasing" class="gl-c"><label for="gl-aliasing" class="gl-t">aliasing</label><span class="gl-m"><label for="gl-aliasing" class="gl-bg"></label><span class="gl-b"><b>Aliasing</b><span>El <b>aliasing</b> aparece al reducir una imagen tomando muestras sueltas en lugar de promediar: los detalles más finos que el nuevo espaciado no desaparecen sin más, se convierten en patrones falsos.</span><span>Es el mismo efecto por el que las ruedas de un coche parecen girar hacia atrás en el cine, o por el que una camisa de rayas finas vibra en la pantalla.</span><label for="gl-aliasing" class="gl-x">Entendido</label></span></span></span>: estructura real que se pierde o, peor, que se convierte en un patrón falso.
- **<span class="gl"><input type="checkbox" id="gl-bilinear" class="gl-c"><label for="gl-bilinear" class="gl-t"><span class="gl-k">bilinear</span></label><span class="gl-m"><label for="gl-bilinear" class="gl-bg"></label><span class="gl-b"><b>Interpolación bilineal</b><span>Al redimensionar, cada píxel de destino cae <i>entre</i> píxeles del original. <b>Interpolar</b> es decidir qué valor ponerle. La versión <b>bilineal</b> toma los cuatro vecinos más cercanos y los promedia, pesando cada uno por lo cerca que esté.</span><span>Es el término medio: más suave que quedarse con el vecino más próximo, más barato que promediar el bloque entero. Al ampliar va bien; al reducir mucho se queda corto, porque sigue mirando cuatro píxeles de los 36 que caben en cada celda de destino.</span><label for="gl-bilinear" class="gl-x">Entendido</label></span></span></span>** promedia los cuatro vecinos. Mejor, pero al reducir mucho sigue ignorando la mayoría de los píxeles del bloque de origen.
- **\`area\`** promedia *todos* los píxeles que caen en cada celda de destino. Es lo correcto al reducir mucho.

Y aquí hay una trampa que conviene no repetir. \`tf.image.resize\` usa **\`bilinear\` por defecto**, y <span class="gl"><input type="checkbox" id="gl-antialias" class="gl-c"><label for="gl-antialias" class="gl-t"><span class="gl-k">antialias=True</span></label><span class="gl-m"><label for="gl-antialias" class="gl-bg"></label><span class="gl-b"><b>Filtro antialias</b><span>Antes de tomar las muestras, difumina ligeramente la imagen para que el detalle demasiado fino para el nuevo tamaño se reparta entre píxeles vecinos en vez de convertirse en un patrón falso.</span><span>Es un argumento <b>aparte</b> del método: ensancha el filtro del método que elegiste, no lo sustituye por otro. Con <code>area</code> no hace nada, porque ese método ya promedia el bloque entero.</span><label for="gl-antialias" class="gl-x">Entendido</label></span></span></span> **no lo cambia a \`area\`**: lo que hace es ensanchar el filtro de muestreo del método que hayas elegido, para que tenga en cuenta los píxeles que de otro modo se saltaría. La documentación es explícita en que con \`area\` el argumento *no tiene ningún efecto*, porque ese método ya promedia todo. Así que hay dos formas correctas de reducir, y son distintas:

\`\`\`python
# Bilinear con filtro antialias: el metodo sigue siendo bilinear.
x = tf.image.resize(img, [224, 224], antialias=True)

# Promediado por area: hay que pedirlo por su nombre.
x = tf.image.resize(img, [224, 224], method="area")
\`\`\`

Hay algo más, y ACRIMA lo esquiva por suerte: sus imágenes son cuadradas. Un fondo de ojo completo no lo es. La imagen de HRF que verás abajo mide 3504×2336 —relación 3:2— y \`resize((224, 224))\` la **aplasta**. El disco óptico deja de ser redondo, y el <span class="gl"><input type="checkbox" id="gl-cd" class="gl-c"><label for="gl-cd" class="gl-t">cociente copa/disco</label><span class="gl-m"><label for="gl-cd" class="gl-bg"></label><span class="gl-b"><b>Cociente copa/disco</b><span>El <b>disco óptico</b> es la zona por donde el nervio óptico sale del ojo; se ve como un círculo claro. Dentro tiene una depresión central más pálida, la <b>copa</b>.</span><span>El glaucoma daña las fibras nerviosas, así que la copa tiende a agrandarse respecto al disco. La razón entre sus diámetros —el cociente copa/disco— es uno de los indicadores que mira un oftalmólogo, y por sí solo no diagnostica: depende del tamaño del disco (un disco grande y sano puede dar un cociente alto) y se interpreta junto al anillo neurorretiniano, la capa de fibras nerviosas, la presión intraocular y el campo visual.</span><label for="gl-cd" class="gl-x">Entendido</label></span></span></span>, que es *la* medida clínica del glaucoma, queda medido sobre una elipse deformada.

</div>

<div class="nb-cell nb-md">

<iframe src="/ovas/pipeline-imagen-cnn.html" title="El pipeline de preprocesado paso a paso, con la forma del tensor cambiando" loading="lazy"></iframe>

Prueba la retina de 3504×2336 con \`nearest\` y mira los vasos. Después cambia a \`area\`.

</div>

<div class="nb-cell nb-md">

## 5. El rango: normalizar, y dónde se calcula

Un <span class="gl"><input type="checkbox" id="gl-dtype" class="gl-c"><label for="gl-dtype" class="gl-t"><span class="gl-k">uint8</span></label><span class="gl-m"><label for="gl-dtype" class="gl-bg"></label><span class="gl-b"><b>uint8 y float32</b><span>El <b>tipo de dato</b> dice cuántos bits ocupa cada número y qué valores admite. <code>uint8</code> es un entero sin signo de 8 bits: exactamente 0 a 255, un byte por valor.</span><span><code>float32</code> es un decimal de 32 bits: ocupa cuatro veces más, pero admite negativos y fracciones. Por eso normalizar multiplica por cuatro la memoria que necesitas.</span><label for="gl-dtype" class="gl-x">Entendido</label></span></span></span> va de 0 a 255. Las redes no trabajan bien con eso: las activaciones se saturan, los gradientes se descompensan entre capas y el aprendizaje depende demasiado de la inicialización. Se pasa a decimales y <span class="gl"><input type="checkbox" id="gl-normalizar" class="gl-c"><label for="gl-normalizar" class="gl-t">se centra</label><span class="gl-m"><label for="gl-normalizar" class="gl-bg"></label><span class="gl-b"><b>Normalizar</b><span><b>Normalizar</b> es restar la media y dividir por la desviación típica, canal a canal, para que los valores queden repartidos alrededor de cero con una escala parecida.</span><span>Importa porque los gradientes que ajustan los pesos son proporcionales a la magnitud de las entradas: si un canal llega con valores 100 veces mayores que otro, domina el aprendizaje sin ninguna razón.</span><label for="gl-normalizar" class="gl-x">Entendido</label></span></span></span>.

Son dos operaciones distintas y conviene no confundirlas:

</div>

<div class="nb-cell nb-code" data-exec="5">

\`\`\`python
# Paso 1 — escalar a [0, 1]. Es una constante: 255 es el máximo de un uint8,
# no una estadística del conjunto. Se puede aplicar antes de partir sin riesgo.
x = x.astype("float32") / 255.0

# Paso 2 — centrar y tipificar. OJO: estas constantes son las de torchvision,
# la convención de PyTorch. NO son universales (ver la celda siguiente).
MEAN = np.array([0.485, 0.456, 0.406], dtype="float32")
STD  = np.array([0.229, 0.224, 0.225], dtype="float32")

x = (x - MEAN) / STD

print(f"rango: {x.min():.2f} … {x.max():.2f}   media: {x.mean():.3f}")
\`\`\`

<div class="nb-out">rango: -2.12 … 2.25   media: 0.617</div>

</div>

<div class="nb-cell nb-md">

La distinción importa mucho más de lo que parece. **Dividir entre 255 es seguro** porque 255 no se mide en tus datos: es el techo del tipo \`uint8\`. **Calcular la media y la desviación sobre el conjunto entero, en cambio, es medir tus datos** — y si lo haces antes de partir, las estadísticas de tus imágenes de prueba entran en el preprocesado del entrenamiento. Es una <span class="gl"><input type="checkbox" id="gl-fuga" class="gl-c"><label for="gl-fuga" class="gl-t">fuga</label><span class="gl-m"><label for="gl-fuga" class="gl-bg"></label><span class="gl-b"><b>Fuga de datos</b><span>Hay <b>fuga</b> cuando información del conjunto de prueba se cuela en el entrenamiento. El modelo aprovecha algo que en el mundo real no tendría, y su nota deja de predecir cómo se comportará.</span><span>Las dos formas típicas: calcular estadísticas de preprocesado sobre todos los datos antes de partir, y repartir imágenes del mismo paciente entre entrenamiento y prueba.</span><label for="gl-fuga" class="gl-x">Entendido</label></span></span></span> pequeña, pero es una fuga, y es gratis evitarla: calcula sobre entrenamiento, aplica a todo.

Si usas un modelo preentrenado, esa fuga desaparece: las constantes vienen del conjunto con el que se entrenó, no del tuyo. Pero aparece otro problema, y es más gordo de lo que parece.

**No hay un preprocesado estándar.** Las constantes de arriba son las de \`torchvision\`, la convención de PyTorch: escalar a \`[0,1]\` y tipificar por canal. Keras no hace eso por defecto. Cada familia de modelos trae su propia función <span class="gl"><input type="checkbox" id="gl-preprocess" class="gl-c"><label for="gl-preprocess" class="gl-t"><span class="gl-k">preprocess_input</span></label><span class="gl-m"><label for="gl-preprocess" class="gl-bg"></label><span class="gl-b"><b><code>preprocess_input</code></b><span>Es la función que deja la imagen exactamente en la escala en la que ese modelo concreto fue entrenado. No es una utilidad genérica: cada familia de <code>keras.applications</code> trae la suya, y hacen cosas distintas.</span><span>La de ResNet50 espera enteros de 0 a 255, invierte RGB a BGR y resta la media de ImageNet <b>sin dividir</b>; la de MobileNet lleva a <code>[-1, 1]</code>. Por eso importarla de la familia equivocada, o aplicarla sobre datos que ya dividiste entre 255, deja el tensor en un rango que el modelo nunca vio.</span><label for="gl-preprocess" class="gl-x">Entendido</label></span></span></span>, y en \`keras.applications\` conviven tres modos distintos:

| Modo | Qué hace | Rango de salida | Ejemplo |
|---|---|---|---|
| \`caffe\` | <span class="gl"><input type="checkbox" id="gl-bgr" class="gl-c"><label for="gl-bgr" class="gl-t"><span class="gl-k">RGB→BGR</span></label><span class="gl-m"><label for="gl-bgr" class="gl-bg"></label><span class="gl-b"><b>RGB y BGR</b><span>Son los tres mismos canales de color en distinto orden: <b>RGB</b> pone rojo, verde y azul; <b>BGR</b> los pone al revés. Nada más — no hay conversión de color, solo un intercambio de dos ejes.</span><span>Es herencia de <i>OpenCV</i> y de Caffe, que leían así los archivos, y los pesos de ResNet50 y VGG16 se entrenaron con ese orden. Si le pasas RGB a un modelo que espera BGR no salta ningún error: rojo y azul quedan cruzados y el modelo acierta menos sin que nada te avise.</span><label for="gl-bgr" class="gl-x">Entendido</label></span></span></span> y resta \`[103.939, 116.779, 123.68]\`. **No divide entre 255** | ≈ −124 … 151 | ResNet50, VGG16 |
| \`tf\` | Escala a \`[-1, 1]\` | −1 … 1 | MobileNet, Inception, EfficientNet |
| \`torch\` | Escala a \`[0,1]\` y tipifica con la media y desviación de arriba | ≈ −2,1 … 2,6 | DenseNet |

\`ResNet50\` usa **\`caffe\`**, que es el modo por defecto. O sea: si copias las constantes de un tutorial de PyTorch y se las das a un ResNet de Keras, el modelo recibe números en una escala que no ha visto nunca. Compruébalo siempre en la documentación de *tu* modelo:

</div>

<div class="nb-cell nb-code" data-exec="6">

\`\`\`python
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
\`\`\`

<div class="nb-out">bien :  -123.68 …   131.32   amplitud  255.00
mal  :  -123.68 …  <span class="err">-103.37   amplitud   20.31</span></div>

</div>

<div class="nb-cell nb-md">

Fíjate en la amplitud: pasa de **255 a 20**. Al haber dividido antes, toda la imagen entra en el rango \`[0, 1]\` y lo único que hace \`preprocess_input\` es restarle la media de <span class="gl"><input type="checkbox" id="gl-imagenet" class="gl-c"><label for="gl-imagenet" class="gl-t">ImageNet</label><span class="gl-m"><label for="gl-imagenet" class="gl-bg"></label><span class="gl-b"><b>ImageNet</b><span>Es el conjunto de imágenes con el que se entrenaron casi todas las redes preentrenadas que descargas: más de un millón de fotos cotidianas repartidas en mil categorías —perros, coches, setas, instrumentos—. Ninguna es médica.</span><span>Su media y su desviación por canal se publicaron con esas redes, y <code>preprocess_input</code> las aplica para que la entrada llegue en la misma escala en la que el modelo aprendió. Si vas a usar sus pesos, usa también sus constantes: no calcules las tuyas.</span><label for="gl-imagenet" class="gl-x">Entendido</label></span></span></span>, así que las tres bandas se apilan en una franja estrecha y negativa. Todas las imágenes acaban pareciéndose entre sí.

Keras no protesta. El entrenamiento arranca, la pérdida baja un poco y se estanca. Ese es el aspecto que tiene este error.

En la OVA de arriba tienes el interruptor **“romper algo a propósito”**: pruébalo con \`sin /255\` y con \`normalizar 2×\` y mira qué le pasa al rango.

> 💡 **Lección clave:** los errores de rango no lanzan excepciones. Imprime \`min\`, \`max\` y \`media\` de un lote justo antes de \`fit()\`. Si no están donde esperas, no entrenes.

</div>

<div class="nb-cell nb-md">

## 6. El eje de canal, y la cuarta dimensión

Keras trabaja en **<span class="gl"><input type="checkbox" id="gl-nhwc" class="gl-c"><label for="gl-nhwc" class="gl-t"><span class="gl-k">NHWC</span></label><span class="gl-m"><label for="gl-nhwc" class="gl-bg"></label><span class="gl-b"><b>NHWC y NCHW</b><span>Son las cuatro letras que nombran, en orden, los ejes del tensor: <b>N</b> = número de imágenes del lote, <b>H</b> = alto (<i>height</i>), <b>W</b> = ancho (<i>width</i>), <b>C</b> = canal. Así que <code>NHWC</code> es <code>(32, 224, 224, 3)</code> y <code>NCHW</code> es <code>(32, 3, 224, 224)</code>: los mismos números, otro orden.</span><span>Keras usa NHWC (<code>channels_last</code>) y PyTorch NCHW (<code>channels_first</code>). No es que uno sea mejor: cada biblioteca se optimizó sobre un hardware distinto y se quedó con su convención. Lo único que importa es no mezclarlas al mover código o pesos de una a otra.</span><label for="gl-nhwc" class="gl-x">Entendido</label></span></span></span>** (\`channels_last\`): <span class="gl"><input type="checkbox" id="gl-lote" class="gl-c"><label for="gl-lote" class="gl-t">lote</label><span class="gl-m"><label for="gl-lote" class="gl-bg"></label><span class="gl-b"><b>Lote (<i>batch</i>)</b><span>Una red no se entrena imagen a imagen ni con todo el conjunto de golpe: procesa <b>lotes</b> de 16, 32 o 64 imágenes, calcula el error medio del lote y actualiza los pesos una vez con él. Por eso la entrada tiene cuatro dimensiones y no tres.</span><span>El tamaño del lote afecta a dos cosas a la vez: cuánta memoria de GPU necesitas y cuánto ruido tiene cada actualización. Lotes grandes van más rápido y son más estables; lotes pequeños caben en menos memoria y a veces generalizan mejor.</span><label for="gl-lote" class="gl-x">Entendido</label></span></span></span>, alto, ancho, canal. PyTorch usa NCHW. No hay ninguno mejor; son convenciones distintas heredadas de cómo se optimizó cada biblioteca, y lo único que importa es no mezclarlas.

Este es el motivo de esa línea que aparece en todos los laboratorios de MNIST y que nadie explica:

\`\`\`python
# El resultado hay que guardarlo: reshape NO modifica el array original.
X_train = X_train.reshape((60000, 28, 28, 1))
\`\`\`

MNIST se distribuye en escala de grises, así que su array llega con forma \`(60000, 28, 28)\` — sin eje de canal. \`Conv2D\` exige uno, y añadir un eje de longitud 1 no cambia ni un valor: solo declara “esto tiene un canal”. Sobre un array contiguo como este, NumPy devuelve una <span class="gl"><input type="checkbox" id="gl-vista" class="gl-c"><label for="gl-vista" class="gl-t">vista</label><span class="gl-m"><label for="gl-vista" class="gl-bg"></label><span class="gl-b"><b>Vista y copia en NumPy</b><span>Una <b>vista</b> es un array sin datos propios: apunta a la misma memoria que el original, leída con otra forma o con otro recorte. Modificar la vista modifica el original, y al revés.</span><span>NumPy devuelve una vista siempre que pueda describir la nueva forma sobre la memoria que ya existe; si no puede, <b>copia</b> — y ahí el consumo se duplica. Por eso <code>reshape</code> unas veces es gratis y otras no, y por eso hay que guardar su resultado: no toca el array original.</span><label for="gl-vista" class="gl-x">Entendido</label></span></span></span> y no copia nada; en general \`reshape\` copia si no puede describir la nueva forma sobre la memoria existente.

Con imágenes en color no hace falta, porque el eje ya viene. Pero el error simétrico sí ocurre: convertir a escala de grises y perder el eje sin darte cuenta. A diferencia de los fallos de rango, **este sí revienta**, y hay que agradecerlo:

</div>

<div class="nb-cell nb-code" data-exec="7">

\`\`\`python
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
\`\`\`

<div class="nb-out">Tamaño del lote : <b>(32, 224, 224, 3)</b>
Tipo            : float32
Memoria         : <b>18.4 MiB</b></div>

</div>

<div class="nb-cell nb-md">

18,4 <span class="gl"><input type="checkbox" id="gl-mib" class="gl-c"><label for="gl-mib" class="gl-t"><span class="gl-k">MiB</span></label><span class="gl-m"><label for="gl-mib" class="gl-bg"></label><span class="gl-b"><b>MiB y MB</b><span>Un <b>MiB</b> (mebibyte) son 1024×1024 = 1.048.576 bytes. Un <b>MB</b> (megabyte) son 1.000.000 exactos. La misma cantidad de memoria da dos números distintos según cómo la cuentes: este lote son 18,4 MiB o 19,3 MB.</span><span>La memoria y las herramientas del sistema suelen contar en potencias de dos; los fabricantes de disco y muchas librerías, en potencias de diez. La diferencia es del 4,9 % aquí y va creciendo con las unidades: en GiB frente a GB ya son 7,4 %.</span><label for="gl-mib" class="gl-x">Entendido</label></span></span></span> para 32 imágenes —19,3 MB si cuentas en potencias de diez— y eso es solo **la entrada**. Cada capa convolucional guarda su mapa de activaciones para poder calcular gradientes en la <span class="gl"><input type="checkbox" id="gl-backprop" class="gl-c"><label for="gl-backprop" class="gl-t">retropropagación</label><span class="gl-m"><label for="gl-backprop" class="gl-bg"></label><span class="gl-b"><b>Retropropagación</b><span>Entrenar es repetir dos pasadas. En la de <b>ida</b> la imagen atraviesa las capas y sale una predicción, que se compara con la etiqueta y da un error. En la de <b>vuelta</b> ese error se reparte hacia atrás, capa por capa, calculando cuánto habría bajado el error si cada peso hubiera sido un poco distinto: eso es el <b>gradiente</b>. Después cada peso se mueve un paso en esa dirección.</span><span>No es magia ni nada nuevo: es la regla de la cadena de cálculo diferencial aplicada capa a capa. Y tiene un coste en memoria que sorprende: para repartir el error hacia atrás hay que recordar lo que salió de cada capa en la ida, así que todos los mapas de activación del lote siguen ocupando RAM hasta que la pasada de vuelta termina.</span><label for="gl-backprop" class="gl-x">Entendido</label></span></span></span>, así que la memoria real durante el entrenamiento es varias veces esa cifra.

Por eso lo primero que se baja cuando la GPU se queda sin memoria es el tamaño de lote. Y por eso el tamaño de lote no es solo un <span class="gl"><input type="checkbox" id="gl-hiper" class="gl-c"><label for="gl-hiper" class="gl-t">hiperparámetro</label><span class="gl-m"><label for="gl-hiper" class="gl-bg"></label><span class="gl-b"><b>Hiperparámetro</b><span>Los <b>parámetros</b> los aprende el modelo: son los 2.514.190 pesos que salen de entrenar. Los <b>hiperparámetros</b> los eliges tú antes de entrenar y el modelo no los toca: tamaño de lote, tasa de aprendizaje, número de capas, tamaño de entrada.</span><span>Se ajustan probando y midiendo en el conjunto de validación — nunca en el de prueba. El tamaño al que redimensionas es uno de ellos, aunque casi nadie lo trate como tal.</span><label for="gl-hiper" class="gl-x">Entendido</label></span></span></span> de optimización: es una restricción de hardware que acabas eligiendo por el tamaño al que decidiste redimensionar, tres pasos antes.

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

\`\`\`python
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

print(f"\\nRegla 'si es grande, glaucoma' : {mejor:.1%}")
print(f"Clasificador tonto             : {np.bincount(y).max() / len(y):.1%}")
\`\`\`

<div class="nb-out">ancho medio, glaucoma : 667.7 px
ancho medio, normal   : 352.9 px

Regla 'si es grande, glaucoma' : <b>86.8%</b>
Clasificador tonto             : 56.2%</div>

</div>

<div class="nb-cell nb-md">

**86,8 % con una sola comparación de números enteros.** \`if ancho >= 427: "glaucoma"\`. Sin abrir la imagen, sin ver un vaso, sin saber qué es un disco óptico.

Las imágenes de ojos con glaucoma de ACRIMA miden 668 píxeles de lado de media; las de ojos sanos, 353. Las dos clases se capturaron o se recortaron de maneras sistemáticamente distintas, y eso quedó grabado en las dimensiones del archivo. No es fraude ni descuido de los autores: es lo normal cuando un conjunto se compone reuniendo material clínico recogido en distintos momentos. Pero significa que **hay una vía para acertar que no pasa por la enfermedad**.

Ese umbral se elige mirando las mismas imágenes que luego se puntúan, así que sobreestima. La objeción es justa, y se responde midiendo: ajustando el umbral en el 70 % de las imágenes y evaluándolo en el 30 % restante, <span class="gl"><input type="checkbox" id="gl-estratificado" class="gl-c"><label for="gl-estratificado" class="gl-t">estratificado</label><span class="gl-m"><label for="gl-estratificado" class="gl-bg"></label><span class="gl-b"><b>Partición estratificada</b><span>Partir <b>estratificando</b> significa repartir cada clase por separado, de modo que la proporción glaucoma/normal sea la misma en entrenamiento y en prueba que en el conjunto entero.</span><span>Sin eso, con 705 imágenes y azar puro, una partición puede quedar con muchas más glaucomatosas que la otra, y entonces no sabes si la diferencia de acierto viene del método o del reparto. Es lo que hace <code>stratify=y</code> en <code>train_test_split</code>.</span><label for="gl-estratificado" class="gl-x">Entendido</label></span></span></span> y promediando 200 particiones, el atajo del ancho sigue acertando el **86,1 % ± 2,0**, el del peso el **81,0 % ± 2,4** y el del color el **64,4 % ± 2,3**. No era un artefacto de la búsqueda.

El script que produce estas cuatro cifras está en el repositorio, es de una página y corre en unos segundos: [\`datasets/medir_atajos.py\`](https://github.com/stivenson/stivenson.github.io/blob/main/datasets/medir_atajos.py). Se le pasa la carpeta de imágenes y devuelve la tabla completa, in-sample y held-out.

Y aquí es donde el preprocesado deja de ser fontanería para siempre:

</div>

<div class="nb-cell nb-md">

<iframe src="/ovas/atajos-y-fuga.html" title="Qué está mirando tu modelo: los atajos medidos y la fuga por partición" loading="lazy"></iframe>

Pulsa **“tras redimensionar a 224×224”** y mira qué pasa.

Redimensionar **le quita a la red el acceso directo** a los atajos del ancho y del peso: cuando todas las entradas miden 224×224 y llegan como tensor, esa información ya no está en lo que el modelo ve. El paso que parecía puro trámite resulta ser la defensa principal contra el atajo más fuerte del conjunto.

Conviene no exagerarlo: borra el acceso directo, no toda la huella. Una imagen que venía de 1420 píxeles y otra que venía de 300 no llegan iguales a 224 — se diferencian en nitidez, en el ruido de compresión del JPEG original y en los artefactos que deja el propio reescalado. Un modelo con capacidad suficiente puede reaprender el origen por ahí.

Y el color **sobrevive sin más**. Un umbral sobre la diferencia media entre el canal rojo y el azul acierta el 65,7 % <span class="gl"><input type="checkbox" id="gl-insample" class="gl-c"><label for="gl-insample" class="gl-t">in-sample</label><span class="gl-m"><label for="gl-insample" class="gl-bg"></label><span class="gl-b"><b>In-sample y partición independiente</b><span>Una cifra <b>in-sample</b> sale de evaluar sobre las mismas imágenes con las que se eligió el umbral o se ajustó el modelo. Siempre sobreestima: parte de lo que mide es memoria, no capacidad.</span><span>La cifra honesta se mide en <b>partición independiente</b> (<i>held-out</i>): se ajusta en un trozo y se evalúa en otro que no se tocó. Aquí, además, se repite sobre 200 particiones y se promedia, para que la nota no dependa de qué reparto tocó en suerte — ese es el <b>±</b> que acompaña a cada cifra.</span><label for="gl-insample" class="gl-x">Entendido</label></span></span></span> y el **64,4 %** en partición independiente — ocho puntos por encima del clasificador tonto, y redimensionar no lo toca. Las imágenes glaucomatosas de ACRIMA son sistemáticamente más anaranjadas.

> 💡 **Lección clave:** el preprocesado decide a qué atajos les quitas el acceso. Antes de creerte una métrica, mide qué acierta un modelo trivial que solo vea los metadatos: tamaño, peso, color medio. Si tu CNN no supera eso por un margen amplio, no has demostrado nada.

Un apunte sobre las cifras publicadas: los trabajos que usan ACRIMA reportan aciertos altos, pero para compararte con ellos hace falta saber **qué métrica** (\`accuracy\` y <span class="gl"><input type="checkbox" id="gl-auc" class="gl-c"><label for="gl-auc" class="gl-t"><span class="gl-k">AUC</span></label><span class="gl-m"><label for="gl-auc" class="gl-bg"></label><span class="gl-b"><b>AUC</b><span>El modelo no responde “sí” o “no”: da una puntuación, y tú eliges el umbral a partir del cual la llamas glaucoma. El <b>accuracy</b> depende de ese umbral. El <b>AUC</b> (<i>area under the ROC curve</i>) no: mide lo bien que el modelo <b>ordena</b> los casos, probando todos los umbrales a la vez.</span><span>Se interpreta directamente: es la probabilidad de que, tomando al azar un ojo enfermo y uno sano, el modelo puntúe más alto al enfermo. 0,5 es azar puro; 1,0 es perfecto. Un accuracy y un AUC del mismo modelo son números distintos y no se comparan entre sí.</span><label for="gl-auc" class="gl-x">Entendido</label></span></span></span> no son intercambiables) y **con qué protocolo** — validación cruzada, partición fija, o partición por paciente. Sin esos dos datos, una cifra suelta no dice si el modelo es bueno o si está leyendo el ancho del archivo.

</div>

<div class="nb-cell nb-md">

## Hallazgo 2 — La partición que infla la nota

Hay un segundo atajo, y este no vive en las imágenes sino en cómo las repartes.

ACRIMA distribuye imágenes anónimas sin identificador de paciente, así que aquí el problema no se puede medir. Pero es el fallo más caro en imagen médica, y conjuntos como **PAPILA** —que publica los dos ojos de cada uno de sus 244 pacientes— existen precisamente para poder evitarlo.

El razonamiento es simple. Si partes tu conjunto **por imagen**, el ojo izquierdo de una persona puede caer en entrenamiento y el derecho en prueba. Esos dos ojos se fotografiaron el mismo día, con la misma cámara, con la misma iluminación, y comparten pigmentación, calibre de vasos y buena parte de la anatomía. Reconocer el segundo después de haber visto el primero no es diagnosticar: es recordar.

En el segundo panel de la OVA de arriba puedes ver cuántos pacientes acaban partidos entre los dos lados. La cuenta es sencilla: si cada imagen va a entrenamiento con probabilidad $p$, un paciente de dos ojos queda partido cuando sus ojos caen a lados distintos, y eso ocurre con probabilidad $2p(1-p)$.

Esa expresión es máxima justo en el reparto mitad y mitad que usa la OVA: $2 \\cdot 0{,}5 \\cdot 0{,}5 = 0{,}5$, o sea **4 de cada 8 pacientes partidos**. Con el 80/20 habitual —el que da las 564 imágenes de entrenamiento de este artículo— baja a $2 \\cdot 0{,}8 \\cdot 0{,}2 = 0{,}32$: un 32 % de los pacientes.

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
| Escalar \`/255\` | Un trámite | Nada. Es seguro: 255 es una constante del tipo |
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

- [Módulo de imagen de Pillow](https://pillow.readthedocs.io/en/stable/reference/Image.html) — decodificación y \`resize\`.
- [\`tf.image.resize\`](https://www.tensorflow.org/api_docs/python/tf/image/resize) — el método por defecto es \`bilinear\`, \`antialias\` está en \`False\`, y la propia documentación avisa de que con \`area\` ese argumento no hace nada.
- [\`preprocess_input\` de ResNet en Keras](https://keras.io/api/applications/resnet/) — y, en general, el de *tu* familia de modelos, que no tiene por qué coincidir con el de otra.
- [Capas de preprocesado de Keras](https://keras.io/api/layers/preprocessing_layers/) — \`Rescaling\`, \`Normalization\` y las capas de aumentación, que solo actúan en entrenamiento.

**Reproducir las cifras**

- [\`datasets/medir_atajos.py\`](https://github.com/stivenson/stivenson.github.io/blob/main/datasets/medir_atajos.py) — mide los tres atajos, in-sample y en partición independiente. Se le pasa la carpeta de imágenes.
- [\`datasets/acrima_mini.zip\`](https://github.com/stivenson/stivenson.github.io/blob/main/datasets/acrima_mini.zip) — el subconjunto de 60 imágenes que usan las celdas de este artículo, con los tamaños originales intactos.
- [\`notebooks/glaucoma_preprocesado.ipynb\`](https://colab.research.google.com/github/stivenson/stivenson.github.io/blob/main/notebooks/glaucoma_preprocesado.ipynb) — el notebook completo, ejecutable en Colab de arriba a abajo.

<em>Las imágenes de fondo de ojo de este artículo se redistribuyen bajo CC BY 4.0. La atribución completa está en <a href="https://github.com/stivenson/stivenson.github.io/blob/main/datasets/README.md">datasets/README.md</a>.</em>

</div>

</div>
`;function x(e){const n=/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/,o=e.match(n);if(!o)throw new Error("Invalid frontmatter format");const u=o[1],b=o[2],s={},g=u.split(`
`);for(const i of g){const t=i.indexOf(":");if(t===-1)continue;const l=i.substring(0,t).trim();let a=i.substring(t+1).trim();if((a.startsWith('"')&&a.endsWith('"')||a.startsWith("'")&&a.endsWith("'"))&&(a=a.slice(1,-1)),l==="tags"){const p=a.match(/\[(.*?)\]/);p&&(s.tags=p[1].split(",").map(c=>c.trim().replace(/^["']|["']$/g,"")).filter(c=>c.length>0))}else l==="date"?s.date=a:l==="slug"?s.slug=a:l==="title"?s.title=a:l==="description"&&(s.description=a)}return{frontmatter:s,body:b}}function r(e){const{frontmatter:n,body:o}=x(e);return{metadata:n,content:o}}const m=[r(f),r(y),r(v),r(h),r(q)];function d(e){return new Date(`${e}T00:00:00`)}function E(e){return d(e).toLocaleDateString("es-ES",{year:"numeric",month:"long",day:"numeric"})}function L(e){return m.find(n=>n.metadata.slug===e)}function j(){return[...m].sort((e,n)=>{const o=d(e.metadata.date).getTime();return d(n.metadata.date).getTime()-o})}export{L as a,E as f,j as g};
