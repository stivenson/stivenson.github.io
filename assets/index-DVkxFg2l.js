const b=`---
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
`,f=`---
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

# **Construir modelos de ML con LLM: mapa del campo y qué funciona de verdad**

## **📌 Introducción: tres cosas distintas con el mismo nombre**

Cuando alguien dice *"uso IA para hacer modelos de machine learning"* puede estar hablando de tres cosas que no se parecen en nada:

1. Un agente que **escribe el pipeline** — carga los datos, entrena, evalúa, itera.
2. Un LLM que **es una pieza dentro del pipeline** — propone features, ajusta hiperparámetros, convierte texto en vectores.
3. Un LLM que **fabrica los datos** con los que se entrena otro modelo más pequeño.

Confundirlas es el error caro. Cada una se monta distinto, cuesta distinto y —sobre todo— **se evalúa distinto**. Este artículo es el mapa de las tres, con las herramientas concretas de 2025-2026 y, en la sección que más me importa, la evidencia de dónde el LLM no aporta nada medible.

| | El LLM es… | Produce | La pregunta que responde la evaluación |
|---|---|---|---|
| **A. Constructor** | ingeniero de ML | código de pipeline | ¿la métrica final es mejor que mi baseline? |
| **B. Componente** | pieza del pipeline | features, hiperparámetros, embeddings | ¿el pipeline **con** el LLM gana al pipeline **sin** él? |
| **C. Profesor** | fábrica de datos | dataset etiquetado o sintético | ¿el modelo alumno gana al entrenado con los datos originales? |

Hay una constante que conviene fijar desde ahora, porque el marketing la difumina sin parar:

> **El LLM casi nunca es el modelo que predice.** Escribe el código que lo entrena, o le pasa features, o le fabrica los datos. Debajo casi siempre hay un gradient boosting, una red preentrenada o un encoder pequeño. Si no sabes distinguir esas dos capas, no puedes medir cuál de las dos te está fallando.

### **La lengua de color de este artículo**

Igual que en las visualizaciones, cada color significa lo mismo de principio a fin:

- <span style="color:#a855f7"><strong>violeta</strong></span> — lo que genera el LLM
- <span style="color:#10b981"><strong>esmeralda</strong></span> — lo que se entrena y se mide de verdad
- <span style="color:#06b6d4"><strong>cian</strong></span> — los datos
- <span style="color:#f59e0b"><strong>ámbar</strong></span> — el coste
- <span style="color:#f43f5e"><strong>rosa</strong></span> — la advertencia

---

## **🧭 Empieza por aquí: qué encaja en tu caso**

Antes de la teoría, el atajo. Describe tu problema y la visualización te dice qué estrategia aplica — y, cuando toca, por qué **ninguna**:

<iframe src="/ovas/llm-ml-decision.html" title="Decisor: qué papel juega el LLM en tu modelo" loading="lazy"></iframe>

Fíjate en que el panel siempre separa dos bloques: lo <span style="color:#a855f7">violeta</span> que aporta el LLM y lo <span style="color:#10b981">esmeralda</span> que realmente predice. Esa separación es el artículo entero en miniatura.

---

## **🏗️ Estrategia A — el LLM escribe el pipeline**

### **La metodología: búsqueda en el espacio del código**

La idea que destrabó este campo es de [AIDE](https://arxiv.org/abs/2502.13138) (Weco AI): tratar la ingeniería de ML como **un problema de optimización de código**, y el ensayo y error como **una búsqueda en árbol** sobre el espacio de soluciones posibles.

El bucle es siempre el mismo:

<span style="color:#a855f7">escribir</span> → <span style="color:#10b981">ejecutar y medir</span> → leer el error o la métrica → <span style="color:#a855f7">reescribir</span>

Lo que lo separa de pedirle ideas a un chat es la segunda flecha: la **función de fitness es la ejecución real**. El agente no opina sobre si su código va a funcionar; lo corre y lee el número. Cuando falla, lee el traceback. Esa es toda la diferencia.

### **El bucle, paso a paso**

<iframe src="/ovas/ml-agent-loop.html" title="El bucle de un agente que construye modelos, paso a paso" loading="lazy"></iframe>

Presta atención al contador <span style="color:#f59e0b">ámbar</span>: cada paso <span style="color:#10b981">esmeralda</span> entrena de verdad. Volveremos a ese número.

### **Las herramientas, y qué aporta cada una de distinto**

**[AIDE](https://github.com/WecoAI/aideml)** — el origen. Árbol de búsqueda sobre soluciones. Es el andamiaje contra el que se compara todo lo demás.

**[MLE-STAR](https://research.google/blog/mle-star-a-state-of-the-art-machine-learning-engineering-agents/)** (Google Research, NeurIPS 2025) — aporta dos ideas propias que valen más que su ranking:

- **Búsqueda web para sembrar la solución inicial.** En vez de partir de lo que el modelo recuerda de su preentrenamiento —congelado en una fecha—, busca qué se está usando hoy para esa tarea. Es la diferencia entre un ingeniero que lleva dos años sin leer nada y uno que abre el navegador.
- **Refinamiento dirigido por ablación.** En vez de reescribir el script entero cada vuelta, mide cuánto aporta cada bloque (preprocesado, features, modelo, ensamblado) y solo reescribe el que más pesa. Cambiar una pieza a la vez es lo que hace el resultado **atribuible**.

Trae además tres agentes de apoyo que valen su peso en oro y que casi nadie menciona: un **depurador** que insiste hasta que el script arranca, un **checker de fuga de datos** que revisa el preprocesado y genera una versión corregida si detecta contaminación entre train y test, y un **checker de uso de datos** que verifica que el script no esté ignorando ficheros que le entregaste. Está publicado sobre el ADK de Google.

**[R&D-Agent](https://github.com/microsoft/RD-Agent)** (Microsoft) — encuadra el trabajo como un proceso de investigación iterativo, no como un modelado suelto: propone hipótesis, las implementa, mide y acumula lo aprendido entre rondas.

**[MLZero / AutoGluon Assistant](https://arxiv.org/abs/2505.13941)** (Amazon, NeurIPS 2025) — multiagente y multimodal, con memoria semántica y episódica. Describes la tarea en lenguaje natural y el sistema percibe los datos, escribe el código, lo ejecuta y se depura solo, sin configuración. En su propio benchmark multimodal de 25 tareas reporta una tasa de éxito de 0.92.

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

### **La escala real del asunto**

Los benchmarks dan la cifra que el marketing omite. En MLE-bench cada intento dispone de:

> **36 vCPU · 440 GB de RAM · una Nvidia A10 de 24 GB · hasta 24 horas**, y todos los experimentos se repiten con 3 semillas.

Eso <span style="color:#f59e0b">cuesta dinero por iteración</span>. Cuando compares un agente contra tu baseline, la comparación honesta incluye esa factura.

---

## **🧩 Estrategia B — el LLM como pieza del pipeline**

Aquí el LLM no escribe el pipeline: **vive dentro de él**. Y la evaluación cambia: ya no basta con «mi modelo saca 0,91». Hay que responder si el pipeline **con** el LLM gana al pipeline **sin** él. Es decir: **ablación**, o no sabes nada.

### **Ingeniería de features**

Es donde el LLM aporta algo que ningún AutoML clásico puede: **conocimiento del mundo que no está en las columnas.** Que peso y talla dan un IMC. Que un código postal implica renta media. Que el 24 de diciembre no es un martes cualquiera para una serie de ventas.

**[CAAFE](https://github.com/noahho/CAAFE)** (NeurIPS 2023) — le describes el dataset en prosa y propone features nuevas de forma iterativa. El detalle que lo separa de pedirle ideas al chat: **verifica cada feature generada** contra validación y descarta las que no mejoran. La <span style="color:#a855f7">propuesta</span> es del LLM; el <span style="color:#10b981">veredicto</span> es de los datos.

**[FeatLLM](https://arxiv.org/abs/2404.09491)** — pensado para *few-shot*: le enseñas un puñado de ejemplos etiquetados y extrae **reglas** que separan las clases, que luego se materializan como features binarias.

**LLM-FE** — usa el LLM como operador de mutación dentro de un bucle evolutivo: cada generación propone variantes de features y la validación selecciona.

### **Hiperparámetros y arquitectura**

**[AgentHPO](https://arxiv.org/abs/2402.01881)** deja que un agente lea la tarea, lance experimentos y ajuste según el historial. **LLAMBO** va más lejos: sustituye el proceso gaussiano dentro de la optimización bayesiana por predicciones del LLM.

La promesa es seductora: menos ensayos, configuración más simple, y de regalo una explicación en prosa de por qué eligió lo que eligió. Guarda esta sección en la cabeza — **es donde la evidencia se pone fea**, y volvemos a ella en el contrapunto.

### **Embeddings como features**

El patrón más aburrido y probablemente el más rentable: serializar cada fila a texto, pasarla por un modelo de embeddings **congelado**, y alimentar el vector resultante a un modelo aguas abajo. Sin fine-tuning, sin llamadas en producción si cacheas.

El [trabajo sobre embeddings de LLM para datos tabulares](https://arxiv.org/abs/2502.11596) deja un hallazgo que conviene tatuarse: **MiniLM, con unos 22 millones de parámetros, supera a modelos mucho mayores** en varios escenarios. En embeddings, el tamaño no ordena la calidad. Prueba el pequeño primero.

### **Modelos fundacionales tabulares: el primo que no es un LLM**

**[TabPFN v2](https://www.nature.com/articles/s41586-024-08328-6)** (Hollmann et al., *Nature*, enero de 2025) no es un LLM, pero pertenece al mapa porque usa **exactamente el mismo truco**: preentrenar sobre un prior masivo y luego inferir en contexto, sin entrenar.

Está preentrenado sobre **millones de datasets sintéticos** generados con modelos causales estructurales. En inferencia le pasas tu tabla entera como contexto y te devuelve predicciones — sin ajuste, sin búsqueda de hiperparámetros, sin bucle. Los autores reportan que supera a todos los métodos anteriores en datasets de **hasta 10.000 muestras**, con una fracción del tiempo.

Si tu problema es tabular y pequeño, este debería ser tu primer baseline. Cuesta tres líneas y pone el listón donde debe estar.

---

## **🎓 Estrategia C — el LLM como profesor**

El LLM no toca el modelo final. **Fabrica los datos** con los que se entrena, y luego desaparece del camino.

### **Destilación**

Se generan tripletas \`(entrada, traza de razonamiento, salida)\` desde un modelo frontera y se entrena a un modelo pequeño para reproducirlas. Es literalmente cómo se construyó la ola 2025-2026 de modelos pequeños sorprendentemente buenos: las destilaciones de DeepSeek-R1, de Qwen, de Llama.

La ventaja no es la métrica: es que el resultado **se sirve barato, corre local y no depende de una API**.

### **Datos sintéticos y etiquetado**

Para clases raras, dominios de bajo recurso o corpus sin etiquetar, un LLM produce en horas lo que a un equipo de anotación le llevaría semanas. Con dos condiciones que no son negociables:

<span style="color:#f43f5e"><strong>Primera:</strong></span> **mide siempre sobre un test real**, nunca sintético. Los datos generados arrastran los sesgos del generador; evaluar sobre ellos es preguntarle al examinador que escribió el examen.

<span style="color:#f43f5e"><strong>Segunda:</strong></span> **el modelo más fuerte no siempre es el mejor profesor.** Hay [evidencia](https://arxiv.org/abs/2510.10925) de que la elección del generador no sigue el ranking de capacidad — un modelo más potente puede producir trazas que el alumno no logra absorber. Compara al menos dos antes de fijar uno.

---

## **🛑 El contrapunto: dónde el LLM no aporta**

Esta es la sección por la que escribí el artículo. Sin ella, lo anterior es un folleto.

### **1. Hiperparámetros: el resultado más incómodo del campo**

Un [estudio con presupuesto igualado sobre datos tabulares](https://arxiv.org/abs/2606.21641) fue a comprobar si los optimizadores de hiperparámetros basados en LLM realmente ganan. El resultado desmonta la mecánica entera.

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

Sin semilla, TPE y la optimización bayesiana con proceso gaussiano lo empatan a las 12 evaluaciones y lo **superan por 0,6–0,8 pp a las 40** (p ≤ 10⁻⁴). En un dataset concreto (\`vehicle\`) el asesor se quedó clavado cerca de la configuración por defecto (73,3 %) mientras los clásicos alcanzaban 79,8–82,4 %: una brecha de 6 a 9 puntos **en contra** del LLM.

> **La recomendación de los autores, textual en su espíritu:** siembra la búsqueda clásica con una configuración por defecto sensata, en lugar de pagar un LLM dentro del bucle. Obtienes lo mismo, más barato y sin dependencia de una API.

Es el ejemplo perfecto de por qué la ablación no es opcional. Sin ella, alguien publica «nuestro optimizador LLM supera a random search en 5 puntos» — y es cierto, y no significa nada.

### **2. En tabular, el gradient boosting sigue ganando**

Ningún agente ha cambiado esto. XGBoost, LightGBM y CatBoost mantienen mejor sesgo inductivo que las redes neuronales en el rango de 3.000 a 1.000.000 de filas, y los benchmarks comparativos siguen encontrando que el deep learning empata o pierde en datos estructurados.

El dato revelador: **los agentes que ganan medallas usan GBDT.** No lo sustituyen — lo escriben mejor y más rápido de lo que lo escribirías tú a las tres de la mañana. Que es un logro real, pero es un logro distinto del que se anuncia.

### **3. Contaminación: el matiz honesto**

La objeción evidente a MLE-bench es que los datasets son competiciones **públicas** de Kaggle: los modelos vieron enunciados, discusiones y soluciones ganadoras durante el preentrenamiento.

Los autores se la tomaron en serio y la midieron. **Reescribieron manualmente las 75 descripciones** para ofuscar de qué competición venía cada una, manteniendo la información esencial, y corrieron GPT-4o (AIDE) con 10 semillas sobre las versiones ofuscadas. Los resultados fueron similares a los originales. También pasaron el detector de plagio Dolos sobre todas las soluciones premiadas, sin encontrar nada. Y como Kaggle no libera los test sets, reconstruyeron particiones nuevas — lo que impide que un agente escriba las etiquetas de memoria.

Su conclusión, y la mía: **no hay evidencia de inflación sistemática por memorización**, aunque eso no descarta efectos más sutiles. Es un ejemplo de cómo se hace bien esta discusión, en contraste con el reflejo de gritar «contaminación» sin medirla.

### **4. Etiquetado: buen asistente, mal anotador**

Cuando se muestra la etiqueta sugerida por el LLM a un anotador humano, ocurren dos cosas: **su confianza sube y su velocidad no.** Y aparece anclaje — la persona tiende a ratificar lo que el modelo propuso en lugar de juzgar de cero.

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
| Multimodal | AutoGluon Assistant / MLZero escribe todo | el pipeline que genere (AutoGluon debajo) |
| Problema abierto y presupuesto alto | MLE-STAR o R&D-Agent | la red o el ensamblado que el agente elija |

### **El caso especial: cuando el pipeline *es* un programa LLM**

Si lo que construyes no es un clasificador sino un sistema de varios pasos con LLM dentro, tu «entrenamiento» es la **optimización del programa** — y existe tooling serio para eso.

**[DSPy](https://dspy.ai)** te deja declarar el programa y optimizarlo contra una métrica. Sus optimizadores actuales: \`BootstrapFewShot\` (bootstrapea demostraciones), \`MIPROv2\` (busca conjuntamente instrucciones y demos), \`COPRO\` y **[GEPA](https://github.com/gepa-ai/gepa)** (ICLR 2026).

GEPA es el que cambia el planteamiento: en vez de optimizar contra una recompensa escalar, **lee las trazas de ejecución completas** —errores, logs— diagnostica el fallo en lenguaje natural y mantiene un frente de Pareto de candidatos diversos. Sus cifras publicadas: supera a GRPO en **6 % de media y hasta 20 %**, usando **hasta 35× menos rollouts**; y supera a MIPROv2 **en más de un 10 %** (+12 puntos en AIME-2025).

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

Vale la pena verlo por lo que es: hay datos de entrenamiento, hay una métrica, hay un conjunto de validación y **hay sobreajuste**. Optimizar un programa LLM *es* entrenar un modelo, con todas las trampas metodológicas del oficio incluidas.

### **La regla que cierra el recetario**

> **Si no puedes hacer la ablación, no sabes si el LLM aportó.**

Baseline sin LLM. Pipeline con LLM. Mismo presupuesto de cómputo, mismos folds, misma semilla. La diferencia entre ambos, con su intervalo de confianza, es lo único que cuenta. Todo lo demás es anécdota bien contada.

---

## **🚨 Riesgos operativos**

**Fuga de datos en código generado.** Un LLM escribe con gusto un \`StandardScaler\` ajustado sobre train y test juntos. No rompe nada — esa es la trampa: da una métrica preciosa en validación y un modelo inservible en producción. Que MLE-STAR incorpore un checker dedicado a esto dice todo sobre la frecuencia del fallo. Si usas un agente sin ese checker, el checker eres tú.

**Reproducibilidad.** Versiona el prompt, el modelo, la temperatura y la fecha, igual que versionas el \`random_state\`. Un pipeline que depende de un modelo servido por API no es reproducible por defecto: es reproducible *mientras* esa versión siga en línea.

<span style="color:#f59e0b"><strong>Coste.</strong></span> Un intento de agente puede consumir 24 horas de cómputo. Multiplícalo por semillas y por competición. Si tu problema se resuelve con LightGBM y Optuna en veinte minutos, el agente no es una mejora: es una factura.

**Gobernanza.** El Reglamento de IA de la UE es exigible desde **agosto de 2026**, con sanciones de hasta **35 millones de euros**, y trae obligaciones de transparencia y gobierno del dato que alcanzan a cómo se generaron tus datasets de entrenamiento. Un dataset etiquetado por un LLM sin trazabilidad es, hoy, un problema de cumplimiento además de uno metodológico. Encuestas del sector apuntan a una brecha grande entre los equipos que ya tienen agentes en pruebas o producción y los que lo hicieron con aprobación formal de seguridad.

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
- Liu et al. — [Large Language Model Agent for Hyper-Parameter Optimization](https://arxiv.org/abs/2402.01881) (AgentHPO)
- Hollmann et al. — [Accurate predictions on small data with a tabular foundation model](https://www.nature.com/articles/s41586-024-08328-6) (TabPFN v2, *Nature*, 2025)

**El contrapunto**
- [When Is an LLM Worth It for Hyperparameter Optimization? A Budget-Matched Study on Tabular Data](https://arxiv.org/abs/2606.21641)
- Shwartz-Ziv & Armon — [Tabular Data: Deep Learning is Not All You Need](https://arxiv.org/abs/2106.03253)

**Optimizar programas LLM**
- Agrawal et al. — [GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning](https://arxiv.org/abs/2507.19457) (ICLR 2026) · [repositorio](https://github.com/gepa-ai/gepa)
- [DSPy](https://dspy.ai)

**Panorámicas**
- [Large Language Model-based Data Science Agent: A Survey](https://arxiv.org/abs/2508.02744)
- [Open-source AutoML projects in 2026](https://mljar.com/blog/open-source-automl-projects-in-2026/)
`;function y(a){const n=/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/,o=a.match(n);if(!o)throw new Error("Invalid frontmatter format");const d=o[1],p=o[2],s={},g=d.split(`
`);for(const i of g){const t=i.indexOf(":");if(t===-1)continue;const r=i.substring(0,t).trim();let e=i.substring(t+1).trim();if((e.startsWith('"')&&e.endsWith('"')||e.startsWith("'")&&e.endsWith("'"))&&(e=e.slice(1,-1)),r==="tags"){const u=e.match(/\[(.*?)\]/);u&&(s.tags=u[1].split(",").map(l=>l.trim().replace(/^["']|["']$/g,"")).filter(l=>l.length>0))}else r==="date"?s.date=e:r==="slug"?s.slug=e:r==="title"?s.title=e:r==="description"&&(s.description=e)}return{frontmatter:s,body:p}}function c(a){const{frontmatter:n,body:o}=y(a);return{metadata:n,content:o}}const m=[c(b),c(f),c(v)];function q(a){return m.find(n=>n.metadata.slug===a)}function h(){return[...m].sort((a,n)=>{const o=new Date(a.metadata.date).getTime();return new Date(n.metadata.date).getTime()-o})}export{q as a,h as g};
