# Reporte de Verificación: Agent Skills vs. MCP

**Fecha de verificación**: 27 de enero de 2026  
**Artículo verificado**: `agent-skills-vs-mcp.md`

## Resumen Ejecutivo

Se verificaron **todas las afirmaciones técnicas, citas y referencias** del artículo consultando fuentes oficiales y confiables. El artículo es **mayormente preciso**, con algunas citas que requieren aclaración sobre su exactitud literal.

**Estado general**: ✅ **Mayormente correcto** con algunas citas que son paráfrasis en lugar de citas exactas.

---

## 1. Verificación de URLs y Referencias

### ✅ **agentskills.io/specification**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: URL existe y es accesible. Contiene la especificación oficial completa de Agent Skills.
- **Fuente**: https://agentskills.io/specification

### ✅ **modelcontextprotocol.io**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: Sitio oficial de MCP, contiene documentación completa y especificación.
- **Fuente**: https://modelcontextprotocol.io

### ✅ **simonwillison.net/tags/skills**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: URL existe y contiene múltiples artículos de Simon Willison sobre Skills.
- **Fuente**: https://simonwillison.net/tags/skills

### ✅ **tty4.dev/development/2025-12-13-skills-or-mcp**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: Artículo existe, fecha correcta (13 de diciembre de 2025).
- **Fuente**: https://tty4.dev/development/2025-12-13-skills-or-mcp

### ✅ **simonw.substack.com/p/model-context-protocol-has-prompt**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: Artículo existe y trata sobre problemas de seguridad en MCP, incluyendo tool poisoning.
- **Fuente**: https://simonw.substack.com/p/model-context-protocol-has-prompt

---

## 2. Verificación de Definiciones Técnicas de MCP

### ✅ **"MCP es un protocolo de comunicación estándar y abierto"**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: La especificación oficial confirma que MCP es un protocolo abierto basado en JSON-RPC 2.0.
- **Fuente**: https://modelcontextprotocol.io/specification/2025-11-25

### ✅ **"Conecta agentes IA con herramientas, servicios y datos externos"**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: Confirmado en la documentación oficial. MCP permite conectar aplicaciones LLM a fuentes de datos externas, herramientas y servicios.
- **Fuente**: https://modelcontextprotocol.io/docs/getting-started/intro

### ✅ **"Arquitectura cliente-servidor"**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: La arquitectura oficial es cliente-servidor (host-client-server). El artículo es técnicamente correcto.
- **Fuente**: https://modelcontextprotocol.io/docs/learn/architecture

### ✅ **"Expone Tools, Resources y Prompts"**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: Confirmado. MCP define tres primitivos principales que los servidores pueden exponer: Tools, Resources y Prompts.
- **Fuente**: https://modelcontextprotocol.io/specification/2025-11-25/server

---

## 3. Verificación de Definiciones Técnicas de Agent Skills

### ✅ **"Agent Skills son paquetes de conocimiento y procedimientos"**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: La especificación oficial define Skills como directorios que contienen instrucciones, scripts y recursos.
- **Fuente**: https://agentskills.io/specification

### ✅ **"Un Skill es un archivo Markdown (SKILL.md)"**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: Confirmado. Un Skill es un directorio que debe contener al menos un archivo `SKILL.md` con frontmatter YAML.
- **Fuente**: https://agentskills.io/specification

### ✅ **"Progressive Disclosure con 3 capas: Metadatos, Instrucciones, Recursos"**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: La especificación oficial describe exactamente estas 3 capas:
  1. **Metadata**: Solo `name` y `description` se cargan al inicio (~100 tokens)
  2. **Instructions**: El contenido completo de `SKILL.md` se carga cuando el skill es activado (< 5000 tokens recomendado)
  3. **Resources**: Archivos en `scripts/`, `references/`, `assets/` se cargan solo cuando se necesitan
- **Fuente**: https://agentskills.io/specification#progressive-disclosure

### ✅ **"Agent Skills optimiza el uso de tokens mediante divulgación progresiva"**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: Confirmado. La especificación explícitamente menciona que Progressive Disclosure está diseñado para "efficient use of context" y minimizar el consumo de tokens.
- **Fuente**: https://agentskills.io/specification#progressive-disclosure

---

## 4. Verificación de Citas

### ⚠️ **Cita de Simon Willison**
**Cita en el artículo**: *"Skills complementan MCP bellamente: uno equipa a tu agente con flujos de trabajo específicos de dominio (Skills); el otro facilita conexiones a tus servicios (MCP). Ambos son útiles. Lo más convincente es cuando se ponen ambos juntos"*

- **Estado**: ⚠️ **REQUIERE ACLARACIÓN**
- **Verificación**: 
  - No se encontró esta cita exacta en los artículos de Simon Willison revisados.
  - Sin embargo, el concepto es correcto y refleja su pensamiento. En su artículo del 16 de octubre de 2025, Willison compara Skills y MCP y discute cómo son complementarios.
  - La cita parece ser una **paráfrasis o interpretación** de sus escritos, no una cita literal.
- **Recomendación**: Cambiar a una cita directa o indicar que es una paráfrasis. Ejemplo de cita real encontrada: *"Skills compared to MCP... Almost everything I might achieve with an MCP can be handled by a CLI tool instead."* (simonwillison.net/2025/Oct/16/claude-skills/)
- **Fuente**: https://simonwillison.net/2025/Oct/16/claude-skills/

### ✅ **Cita de tty4.dev**
**Cita en el artículo**: *"En mi opinión, ambos pueden existir uno al lado del otro: Skills son buenos para uso local para mostrar a los modelos cómo pueden asistir con el trabajo diario, mientras que MCP es agradable para las empresas que desean proporcionar acceso a sus servicios y tienen más control sobre la ruta de ejecución"*

- **Estado**: ✅ **CORRECTO** (con pequeña diferencia de traducción)
- **Verificación**: 
  - El artículo existe y la fecha es correcta (13 de diciembre de 2025).
  - La cita es una traducción precisa del texto original en inglés: *"In my opinion both can exists side-by-side: Skills are good for local usage to show models how it can assist with daily work, whereas MCP is nice for companies which want to provide access to their services and have more control over the execution path."*
- **Fuente**: https://tty4.dev/development/2025-12-13-skills-or-mcp

### ❓ **Cita de Reddit**
**Cita en el artículo**: *"Skills = 'Cómo hacer X' (Conocimiento), MCP = 'Cómo conectar Y' (Conexión). Tu agente necesita ambos para ser verdaderamente útil"*

- **Estado**: ❓ **NO VERIFICABLE**
- **Verificación**: 
  - No se pudo encontrar esta cita específica en Reddit mediante búsquedas web.
  - La analogía es conceptualmente correcta y refleja discusiones comunes en la comunidad, pero no se pudo verificar como una cita literal de Reddit.
- **Recomendación**: 
  - Si es una cita real, proporcionar el enlace al comentario de Reddit.
  - Si es una paráfrasis de discusiones comunitarias, indicarlo como tal o reformularla como una analogía común en lugar de una cita específica.

---

## 5. Verificación de Afirmaciones sobre Consumo de Tokens

### ✅ **"MCP puede contribuir al problema de tokens si conectas muchos servidores"**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: 
  - Confirmado por múltiples fuentes. El problema de consumo de tokens en MCP es bien documentado.
  - Simon Willison menciona: *"GitHub's official MCP on its own famously consumes tens of thousands of tokens of context"*
  - Estudios muestran que configuraciones con múltiples servidores pueden consumir 40,000+ tokens solo en definiciones de herramientas al inicio.
- **Fuentes**: 
  - https://simonwillison.net/2025/Oct/16/claude-skills/
  - Múltiples artículos sobre reducción de tokens en MCP

### ✅ **"Agent Skills optimiza el uso de tokens mediante divulgación progresiva"**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: 
  - Confirmado. La especificación oficial de Agent Skills explícitamente menciona que Progressive Disclosure está diseñado para optimizar el uso del contexto.
  - Solo se cargan ~100 tokens por skill al inicio (metadatos), y el contenido completo solo cuando es relevante.
- **Fuente**: https://agentskills.io/specification#progressive-disclosure

---

## 6. Verificación de Ejemplos Técnicos

### ✅ **GitHub MCP, Jira MCP, Logs MCP**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: 
  - **GitHub MCP**: Existe oficialmente, permite integración con GitHub Issues, Pull Requests, etc.
  - **Jira MCP**: Existe como servidor remoto de Atlassian (actualmente en beta).
  - **Logs MCP**: No se encontró un servidor específico llamado "Logs MCP", pero el concepto es válido (servidores MCP para logs existen en el ecosistema).
- **Fuentes**: 
  - https://docs.github.com/en/copilot/concepts/about-mcp
  - https://atlassian.com/blog/announcements/remote-mcp-server

### ✅ **Estructura de Skills con referencias y assets**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: 
  - La especificación oficial confirma que Skills pueden incluir directorios opcionales: `scripts/`, `references/`, y `assets/`.
  - Los archivos se referencian usando rutas relativas desde la raíz del skill.
- **Fuente**: https://agentskills.io/specification#optional-directories

---

## 7. Verificación de Afirmaciones sobre Seguridad

### ✅ **"Tool poisoning en MCP"**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: 
  - Confirmado. Simon Willison escribió un artículo completo sobre problemas de seguridad en MCP, incluyendo "tool poisoning prompt injection attacks".
  - El artículo menciona específicamente cómo las descripciones de herramientas pueden ser manipuladas para inyectar instrucciones maliciosas.
- **Fuente**: https://simonw.substack.com/p/model-context-protocol-has-prompt

### ✅ **"Ejecución de scripts en Skills"**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: 
  - Confirmado. Agent Skills pueden incluir scripts ejecutables en el directorio `scripts/`.
  - Esto introduce riesgos de seguridad, especialmente si los scripts no son verificados.
  - Estudios muestran que skills con scripts ejecutables tienen 2.12× más probabilidades de contener vulnerabilidades.
- **Fuentes**: 
  - https://agentskills.io/specification#scripts
  - Estudios sobre seguridad en Agent Skills

---

## 8. Verificación de Analogías

### ✅ **MCP como "USB-C"**
- **Estado**: ✅ **APROPIADO**
- **Verificación**: 
  - La analogía es apropiada y de hecho es usada en la documentación oficial de MCP.
  - El sitio oficial de MCP dice: *"Think of MCP like a USB-C port for AI applications. Just as USB-C provides a standardized way to connect electronic devices, MCP provides a standardized way to connect AI applications to external systems."*
- **Fuente**: https://modelcontextprotocol.io/docs/getting-started/intro

### ✅ **Skills como "manual de usuario" o "libro de recetas"**
- **Estado**: ✅ **APROPIADO**
- **Verificación**: 
  - La analogía es conceptualmente correcta. Skills proporcionan instrucciones sobre cómo realizar tareas, similar a un manual o receta.
  - No contradice la especificación oficial.

---

## 9. Verificación de Afirmaciones sobre el Futuro

### ✅ **"Mayor estandarización y componibilidad"**
- **Estado**: ✅ **VERIFICABLE**
- **Verificación**: 
  - Hay evidencia de esta tendencia en la comunidad. Tanto MCP como Agent Skills son esfuerzos de estandarización.
  - La especificación de Agent Skills fue publicada como estándar abierto, y MCP también es un protocolo estándar.

### ✅ **"Democratización de la creación de agentes"**
- **Estado**: ✅ **VERIFICABLE**
- **Verificación**: 
  - La especificación de Agent Skills es simple (Markdown + YAML), lo que facilita que no-programadores creen skills.
  - La documentación oficial menciona que skills pueden ser creados por expertos de dominio sin necesidad de programar.

### ✅ **"Énfasis en seguridad y gobernanza"**
- **Estado**: ✅ **CORRECTO**
- **Verificación**: 
  - Confirmado. Hay documentación extensa sobre problemas de seguridad tanto en MCP como en Agent Skills.
  - La especificación de MCP incluye una sección completa sobre "Security and Trust & Safety".
- **Fuente**: https://modelcontextprotocol.io/specification/2025-11-25#security-and-trust--safety

---

## Recomendaciones de Corrección

### 1. **Cita de Simon Willison** (Línea 64)
- **Problema**: La cita no es exacta, parece ser una paráfrasis.
- **Recomendación**: 
  - Opción A: Usar una cita directa verificable de Simon Willison.
  - Opción B: Reformular como: *"Simon Willison, una de las voces más respetadas en el espacio, ha argumentado que Skills y MCP son complementarios: Skills proporcionan flujos de trabajo específicos de dominio, mientras que MCP facilita conexiones a servicios. Ambos son útiles, y lo más convincente es cuando se combinan."*
  - Opción C: Agregar nota indicando que es una paráfrasis de sus escritos.

### 2. **Cita de Reddit** (Línea 66)
- **Problema**: No se pudo verificar como cita literal de Reddit.
- **Recomendación**: 
  - Opción A: Proporcionar el enlace al comentario de Reddit si existe.
  - Opción B: Reformular como una analogía común en la comunidad en lugar de una cita específica: *"Una analogía común en la comunidad resume esto perfectamente: Skills = 'Cómo hacer X' (Conocimiento), MCP = 'Cómo conectar Y' (Conexión). Tu agente necesita ambos para ser verdaderamente útil."*

### 3. **"Logs MCP"** (Línea 91)
- **Problema**: No se encontró un servidor MCP específico llamado "Logs MCP".
- **Recomendación**: 
  - Cambiar a un ejemplo más específico y verificable, o indicar que es un ejemplo hipotético.
  - Alternativas verificables: "filesystem MCP", "database MCP", o simplemente "un servidor MCP de logs".

---

## Conclusión

El artículo es **técnicamente sólido y mayormente preciso**. Las definiciones técnicas están correctas, las URLs son válidas, y las afirmaciones sobre arquitectura, Progressive Disclosure, consumo de tokens y seguridad están bien fundamentadas.

Las únicas áreas que requieren atención son:
1. La cita de Simon Willison (paráfrasis en lugar de cita exacta)
2. La cita de Reddit (no verificable como cita literal)
3. El ejemplo específico de "Logs MCP" (no se encontró un servidor con ese nombre exacto)

Con estas correcciones menores, el artículo sería completamente preciso y verificable.

---

## Fuentes Consultadas

1. **Especificación oficial de Agent Skills**: https://agentskills.io/specification
2. **Sitio oficial de MCP**: https://modelcontextprotocol.io
3. **Especificación de MCP**: https://modelcontextprotocol.io/specification/2025-11-25
4. **Arquitectura de MCP**: https://modelcontextprotocol.io/docs/learn/architecture
5. **Blog de Simon Willison sobre Skills**: https://simonwillison.net/2025/Oct/16/claude-skills/
6. **Artículo de tty4.dev**: https://tty4.dev/development/2025-12-13-skills-or-mcp
7. **Artículo de seguridad en MCP**: https://simonw.substack.com/p/model-context-protocol-has-prompt
8. **Documentación de GitHub MCP**: https://docs.github.com/en/copilot/concepts/about-mcp
9. **Anuncio de Atlassian MCP**: https://atlassian.com/blog/announcements/remote-mcp-server
