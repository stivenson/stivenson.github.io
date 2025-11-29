// Centralized data for all LLM services
// Order: 1) Chat open-source, 2) Chat non-open-source, 3) Other services
const llmServices = [
    // ===== CHAT OPEN-SOURCE =====
    {
        name: "Mistral Le Chat",
        provider: "Mistral AI",
        description: "Alternativa a ChatGPT desarrollada por la startup francesa Mistral AI. Ofrece rapidez, confidencialidad y una base de código abierto con procesamiento nativo en múltiples idiomas.",
        url: "https://chat.mistral.ai",
        badges: ["chat", "open-source", "codigo"],
        openInNewTab: true
    },
    {
        name: "HuggingChat",
        provider: "Hugging Face",
        description: "Plataforma de chat abierta que permite interactuar con diversos modelos de lenguaje alojados en Hugging Face. Ofrece acceso gratuito a múltiples modelos de código abierto.",
        url: "https://huggingface.co/chat",
        badges: ["chat", "open-source", "playground"],
        openInNewTab: true
    },
    // ===== CHAT NO OPEN-SOURCE =====
    {
        name: "ChatGPT",
        provider: "OpenAI",
        description: "Modelo de lenguaje desarrollado por OpenAI que permite mantener conversaciones coherentes y contextuales. Líder en el mercado de IA conversacional.",
        url: "https://chat.openai.com",
        badges: ["chat", "multimodal", "codigo"],
        openInNewTab: true
    },
    {
        name: "Claude",
        provider: "Anthropic",
        description: "Asistente de IA desarrollado por Anthropic, diseñado para ser útil, honesto e inofensivo. Destaca por su capacidad de razonamiento y manejo de contextos largos.",
        url: "https://claude.ai/new",
        badges: ["chat", "multimodal", "razonamiento"],
        openInNewTab: true
    },
    {
        name: "Google Gemini",
        provider: "Google",
        description: "Modelo de lenguaje multimodal de Google que se integra con herramientas como Google Docs y Gmail. Ofrece acceso a información en tiempo real y capacidades avanzadas.",
        url: "https://gemini.google.com",
        badges: ["chat", "multimodal", "texto"],
        openInNewTab: true
    },
    {
        name: "Perplexity AI",
        provider: "Perplexity",
        description: "Motor de búsqueda conversacional que combina modelos de lenguaje con la web actual. Proporciona respuestas precisas con citas de fuentes en tiempo real.",
        url: "https://www.perplexity.ai",
        badges: ["chat", "busqueda", "texto"],
        openInNewTab: true
    },
    {
        name: "Poe",
        provider: "Quora",
        description: "Plataforma de Quora que permite chatear con múltiples modelos de IA en una sola aplicación, incluyendo GPT-4, Claude, Mistral y otros modelos emergentes.",
        url: "https://poe.com",
        badges: ["chat", "multimodal"],
        openInNewTab: true
    },
    {
        name: "Microsoft Copilot",
        provider: "Microsoft",
        description: "Asistente de IA integrado en aplicaciones de Microsoft como Word, Excel y PowerPoint. Ayuda en la creación de contenidos y automatiza tareas repetitivas.",
        url: "https://copilot.microsoft.com",
        badges: ["chat", "productividad", "codigo"],
        openInNewTab: true
    },
    {
        name: "Grok",
        provider: "xAI",
        description: "Chatbot de inteligencia artificial desarrollado por xAI, la empresa de Elon Musk. Ofrece respuestas rápidas con humor y acceso a datos en tiempo real desde la plataforma X.",
        url: "https://x.ai",
        badges: ["chat", "texto"],
        openInNewTab: true
    },
    {
        name: "You.com",
        provider: "You.com",
        description: "Plataforma que combina un buscador con IA conversacional. Permite chatear con modelos como GPT-4 o Claude, generar código y crear imágenes con IA en una sola plataforma.",
        url: "https://you.com",
        badges: ["chat", "busqueda", "multimodal"],
        openInNewTab: true
    },
    {
        name: "DeepSeek Chat",
        provider: "DeepSeek",
        description: "Chat oficial del modelo DeepSeek, conocido por su excelente rendimiento en tareas de código y razonamiento.",
        url: "https://chat.deepseek.com",
        badges: ["chat", "codigo", "razonamiento"],
        openInNewTab: true
    },
    {
        name: "Kimi AI",
        provider: "Moonshot AI",
        description: "Asistente conversacional y generador de documentos y presentaciones (PPT) de China, conocido por su gran ventana de contexto.",
        url: "https://kimi.com/es",
        badges: ["chat", "documentos", "presentaciones"],
        openInNewTab: false
    },
    {
        name: "Qwen Chat",
        provider: "Alibaba",
        description: "Asistente conversacional multimodal de Alibaba con capacidades avanzadas de procesamiento de lenguaje natural.",
        url: "https://chat.qwen.ai",
        badges: ["chat", "multimodal"],
        openInNewTab: true
    },
    {
        name: "GLM-4",
        provider: "Zhipu AI",
        description: "Modelo de lenguaje avanzado con interfaz de chat pública. Ofrece capacidades de conversación y generación de texto de alta calidad.",
        url: "https://chat.z.ai/",
        badges: ["chat", "llm"],
        openInNewTab: true
    },
    {
        name: "Doubao Chat",
        provider: "ByteDance",
        description: "Asistente conversacional multimodal de ByteDance, líder en China con capacidades de texto, imagen y audio.",
        url: "https://www.doubao.com/chat/",
        badges: ["chat", "multimodal", "audio"],
        openInNewTab: false
    },
    {
        name: "SenseTime Chat",
        provider: "SenseTime",
        description: "Chatbot multimodal de SenseTime, enfocado en comprensión visual y lingüística con capacidades avanzadas de procesamiento.",
        url: "https://chat.sensetime.com/",
        badges: ["chat", "visual", "multimodal"],
        openInNewTab: false
    },
    {
        name: "Chatbot Arena",
        provider: "LMSYS",
        description: "Plataforma educativa para comparar y evaluar modelos de lenguaje. Permite chatear con múltiples modelos de forma ciega y votar por el mejor. Herramienta ideal para entender las diferencias entre LLMs.",
        url: "https://lmarena.ai/",
        badges: ["chat", "playground", "comparacion"],
        openInNewTab: true
    },
    {
        name: "Groq Chat",
        provider: "Groq",
        description: "Plataforma de chat con inferencia de alta velocidad y respuestas en tiempo real. Enfocada en baja latencia y rendimiento optimizado para modelos como Llama 3.1, Mixtral y Gemma.",
        url: "https://console.groq.com/playground",
        badges: ["chat", "velocidad", "texto"],
        openInNewTab: true
    },
    {
        name: "Abacus.AI ChatLLM",
        provider: "Abacus.AI",
        description: "Plataforma de chat con integración para equipos y Slack. Incluye agentes especializados para tareas de codificación y generales, ideal para entornos empresariales.",
        url: "https://chatllm.abacus.ai",
        badges: ["chat", "productividad", "agentes"],
        openInNewTab: true
    },
    {
        name: "Pi AI",
        provider: "Inflection",
        description: "Asistente personal de IA enfocado en conversaciones empáticas y apoyo emocional. Diseñado para ser un compañero conversacional comprensivo y útil.",
        url: "https://heypi.com/talk",
        badges: ["chat", "asistente", "texto"],
        openInNewTab: true
    },
    {
        name: "Character AI",
        provider: "Character.AI",
        description: "Plataforma para chatear con personajes personalizados y realizar role-playing. Permite crear y compartir personajes con la comunidad, ideal para storytelling y entretenimiento.",
        url: "https://beta.character.ai",
        badges: ["chat", "rol", "personajes"],
        openInNewTab: false
    },
    {
        name: "Replika",
        provider: "Replika",
        description: "IA compañera diseñada para construir relaciones a largo plazo. Enfocada en apoyo emocional y salud mental, con integración en aplicaciones móviles.",
        url: "https://replika.com",
        badges: ["chat", "compania", "salud"],
        openInNewTab: true
    },
    // ===== OTROS SERVICIOS (NO CHAT) =====
    {
        name: "RoboNeo",
        provider: "Creative AI Agent",
        description: "Agente creativo de IA que transforma instrucciones de lenguaje natural en diseño de imágenes y producción de vídeo profesional.",
        url: "https://www.roboneo.com/home",
        badges: ["imagenes", "video", "diseño"],
        openInNewTab: false
    },
    {
        name: "ERNIE Bot",
        provider: "Baidu",
        description: "Chatbot multimodal (texto, imagen, vídeo) que rivaliza con GPT. Es el núcleo del ecosistema de IA de Baidu.",
        url: "https://ernie.baidu.com",
        badges: ["multimodal", "texto", "imagen", "video"],
        openInNewTab: true
    },
    {
        name: "Hunyuan Image",
        provider: "Tencent",
        description: "Generador de imágenes a partir de texto o imágenes de Tencent. Destaca por su alta calidad y comprensión del idioma chino.",
        url: "https://hunyuan-image.com/image-to-image",
        badges: ["imagenes", "text-to-image", "image-to-image"],
        openInNewTab: false
    },
    {
        name: "Xinghuo",
        provider: "iFlytek",
        description: "Asistente cognitivo multimodal de iFlytek con capacidades avanzadas en reconocimiento de voz y tareas inteligentes.",
        url: "https://xinghuo.xfyun.cn/",
        badges: ["voz", "multimodal", "cognitivo"],
        openInNewTab: false
    },
    {
        name: "Baichuan AI",
        provider: "Baichuan",
        description: "Plataforma de IA de Baichuan con modelos de lenguaje para generación de texto y código. Playground interactivo para experimentación.",
        url: "https://platform.baichuan-ai.com/playground",
        badges: ["playground", "texto", "codigo"],
        openInNewTab: false
    },
    {
        name: "Flowise",
        provider: "Flowise",
        description: "Herramienta open-source con interfaz visual para crear agentes LLM, cadenas, RAG y flujos usando drag & drop. Incluye trazabilidad y monitoreo.",
        url: "https://flowiseai.com/",
        badges: ["workflow", "orquestacion", "open-source"],
        openInNewTab: false
    },
    {
        name: "n8n + LLM",
        provider: "n8n",
        description: "Plataforma low-code para crear workflows con nodos conectados. Permite integrar múltiples LLMs, usar OpenRouter y automatizar procesos con lógica y memoria.",
        url: "https://n8n.io",
        badges: ["automatizacion", "workflow", "productividad"],
        openInNewTab: true
    },
    {
        name: "Retorno",
        provider: "Retorno",
        description: "Herramienta independiente con asistencia de IA para construir workflows de n8n en minutos. Permite generar, editar, modificar y optimizar flujos, agregar manejo de errores e integrar nuevas APIs. No es un producto oficial de n8n.",
        url: "https://www.retorno.io/",
        badges: ["automatizacion", "workflow", "ia", "herramienta"],
        openInNewTab: true
    },
    {
        name: "LangWatch",
        provider: "LangWatch",
        description: "Plataforma para monitorear trazas, costos, sesiones, errores y evaluaciones de agentes LLM con panel completo de observabilidad y analítica.",
        url: "https://langwatch.ai/",
        badges: ["observabilidad", "monitoreo", "analitica"],
        openInNewTab: false
    },
    {
        name: "OpenLIT",
        provider: "OpenLIT",
        description: "Observabilidad para LLMs, agentes y vectores; maneja prompts, métricas y analítica de costos en dashboard unificado para GenAI engineering.",
        url: "https://openlit.io/",
        badges: ["observabilidad", "monitoreo", "analitica"],
        openInNewTab: true
    },
    {
        name: "Stitch",
        provider: "Google",
        description: "Herramienta de IA para diseñar interfaces de usuario y generar código HTML/CSS a partir de descripciones en lenguaje natural o imágenes. Utiliza modelos Gemini 2.5 Pro y Gemini 2.5 Flash.",
        url: "https://stitch.withgoogle.com",
        badges: ["diseño", "herramienta", "codigo", "ia"],
        openInNewTab: true
    },
    {
        name: "Relevance AI",
        provider: "Relevance AI",
        description: "Plataforma de IA que facilita la implementación de soluciones de inteligencia artificial para análisis de datos, automatización de procesos y construcción de agentes de IA. Ofrece herramientas para desarrollo y despliegue de aplicaciones con IA.",
        url: "https://app.relevanceai.com/",
        badges: ["herramienta", "agentes", "automatizacion", "analitica", "ia"],
        openInNewTab: true
    },
    {
        name: "NotebookLM",
        provider: "Google",
        description: "Herramienta de investigación y toma de notas con IA desarrollada por Google Labs. Utiliza Google Gemini para ayudar a interactuar con documentos, generar resúmenes, explicaciones y mapas conceptuales. Soporta documentos, sitios web y presentaciones.",
        url: "https://notebooklm.google.com",
        badges: ["herramienta", "productividad", "documentos", "asistente", "ia"],
        openInNewTab: true
    },
    {
        name: "Manus",
        provider: "Manus AI",
        description: "Herramienta de IA para productividad que permite construir sitios web, crear presentaciones y realizar investigación amplia. Enfoque en 'menos estructura, más inteligencia' con funciones como Mail Manus, Web app y Wide Research.",
        url: "https://manus.im/",
        badges: ["herramienta", "productividad", "diseño", "documentos", "presentaciones", "ia"],
        openInNewTab: true
    },
    {
        name: "Google AI Studio",
        provider: "Google",
        description: "Entorno de desarrollo integrado basado en web para crear prototipos con modelos de IA generativa Gemini. Permite crear prompts, comparar modelos, generar código para APIs, y analizar imágenes y videos. Disponible para desarrolladores y usuarios no técnicos.",
        url: "https://aistudio.google.com/prompts/new_chat",
        badges: ["playground", "herramienta", "codigo", "multimodal", "ia"],
        openInNewTab: true
    },
    {
        name: "LM Studio",
        provider: "LM Studio",
        description: "Aplicación para ejecutar modelos de lenguaje localmente en tu computadora de forma privada y gratuita. Soporta modelos como gpt-oss, Qwen3, Gemma3, DeepSeek y muchos más. Incluye SDKs para JavaScript y Python.",
        url: "https://lmstudio.ai/",
        badges: ["ia-local", "herramienta", "playground", "codigo", "open-source"],
        openInNewTab: true
    },
    {
        name: "Seika.ai",
        provider: "Seika AI",
        description: "Plataforma para crear agentes de IA empresariales que operan 24/7 basándose en el conocimiento unificado de tu organización. Construye infraestructura 'Agéntica' con CRMs, dashboards y APIs que centralizan conocimiento disperso para automatizar procesos empresariales.",
        url: "https://seika.ai",
        badges: ["agentes", "empresarial", "automatizacion", "ia"],
        openInNewTab: true
    },
    {
        name: "Zapier",
        provider: "Zapier",
        description: "Plataforma de automatización potenciada por IA con más de 6,000 integraciones. Crea workflows multi-paso, agentes de IA personalizados, chatbots sin código, y automatiza procesos usando lenguaje natural. Incluye Zapier Tables e Interfaces para construir soluciones completas.",
        url: "https://zapier.com",
        badges: ["automatizacion", "workflow", "agentes", "productividad", "ia"],
        openInNewTab: true
    },
    {
        name: "CapCut",
        provider: "ByteDance",
        description: "Editor de video potenciado por IA que automatiza tareas de edición. Genera videos completos desde ideas, crea avatares con lip-sync, auto-subtítulos, eliminación de fondos, traducción de videos, text-to-speech, y corrección automática de color. Ideal para creadores de contenido.",
        url: "https://www.capcut.com",
        badges: ["video", "ia", "herramienta", "automatizacion"],
        openInNewTab: true
    },
    {
        name: "Adobe Firefly",
        provider: "Adobe",
        description: "Generador de imágenes creativas integrado en el flujo de trabajo de Adobe. Seguro para uso comercial.",
        url: "https://firefly.adobe.com",
        badges: ["imagenes", "diseño", "text-to-image"],
        openInNewTab: true
    },
    {
        name: "Suno",
        provider: "Suno",
        description: "Herramienta de IA capaz de generar canciones completas con letra y voz a partir de simples descripciones de texto.",
        url: "https://suno.com",
        badges: ["audio", "multimodal", "ia"],
        openInNewTab: true
    },
    {
        name: "Runway",
        provider: "Runway AI",
        description: "Suite creativa avanzada para edición y generación de video con IA. Incluye herramientas como Gen-2 para text-to-video.",
        url: "https://runwayml.com",
        badges: ["video", "diseño", "herramienta"],
        openInNewTab: true
    },
    {
        name: "Gamma",
        provider: "Gamma",
        description: "Medio impulsado por IA para crear presentaciones, documentos y páginas web hermosas sin necesidad de diseño manual.",
        url: "https://gamma.app",
        badges: ["presentaciones", "documentos", "diseño", "productividad"],
        openInNewTab: true
    },
    {
        name: "v0.dev",
        provider: "Vercel Labs",
        description: "Sistema de IA generativa que crea interfaces de usuario (UI) en React y Tailwind CSS a partir de prompts de texto.",
        url: "https://v0.dev",
        badges: ["diseño", "codigo", "herramienta"],
        openInNewTab: true
    },
    {
        name: "Civitai",
        provider: "Civitai",
        description: "La plataforma más grande para compartir y descubrir modelos de generación de imágenes Stable Diffusion y LoRAs.",
        url: "https://civitai.com",
        badges: ["imagenes", "open-source", "comunidad", "modelos"],
        openInNewTab: true
    },
    {
        name: "OpenRouter",
        provider: "OpenRouter",
        description: "Interfaz unificada y API para acceder a los mejores modelos de LLM (GPT-4, Claude 3, Llama 3, etc.) al mejor precio.",
        url: "https://openrouter.ai",
        badges: ["playground", "llm", "comparacion", "api"],
        openInNewTab: true
    },
    {
        name: "Udio",
        provider: "Udio",
        description: "Plataforma de generación de música con IA que permite crear pistas de alta fidelidad con voces y estructuras musicales complejas.",
        url: "https://www.udio.com",
        badges: ["audio", "multimodal", "ia"],
        openInNewTab: true
    },
    {
        name: "Phind",
        provider: "Phind",
        description: "Motor de búsqueda inteligente optimizado para desarrolladores. Proporciona respuestas técnicas precisas con ejemplos de código.",
        url: "https://www.phind.com",
        badges: ["busqueda", "codigo", "asistente"],
        openInNewTab: true
    },
    {
        name: "Midjourney",
        provider: "Midjourney",
        description: "Laboratorio de investigación independiente que produce un programa de IA patentado para crear imágenes a partir de descripciones textuales.",
        url: "https://www.midjourney.com/explore",
        badges: ["imagenes", "text-to-image", "diseño"],
        openInNewTab: true
    },
    {
        name: "Abysmal.Ai",
        provider: "Abysmal.Ai",
        description: "Abysmal.Ai es un dashboard de generación de imágenes con IA y un escalador. Transforma tu imaginación en realidad, creando imágenes de alta calidad con velocidad inigualable.",
        url: "https://abysmal.ai/pages/dashboard",
        badges: ["imagenes", "diseño", "productividad"],
        openInNewTab: true
    },
    {
        name: "Mobirise AI Website Builder",
        provider: "Mobirise",
        description: "Constructor de sitios web con IA para descubrir herramientas y sitios web de IA.",
        url: "https://ai.mobirise.com/",
        badges: [],
        openInNewTab: true
    },
    {
        name: "Smart-2U",
        provider: "Smart-2U",
        description: "Plataforma ECP integral que combina marketing digital, automatización de ventas, gestión empresarial y herramientas de IA. Optimiza tu negocio con SIAP, Smart-Design, Store-2U y más.",
        url: "https://smart-2u.com/",
        badges: ["empresarial", "chat"],
        openInNewTab: true
    },
    {
        name: "Carson AI Agency",
        provider: "Carson Agency",
        description: "Potencia tu marca con IA para marketing y SEO experto en México. Somos tu agencia líder en estrategias digitales y resultados.",
        url: "https://carsonagency.com.mx/",
        badges: ["empresarial", "optimizacion"],
        openInNewTab: true
    },
    {
        name: "TopMediai Generador de Videos con IA",
        provider: "TopMediai",
        description: "Crea videos a partir de texto o imágenes con IA. Rápido, sencillo y creativo.",
        url: "https://es.topmediai.com/ai-video-generator/",
        badges: ["video", "texto", "imagenes", "imagen", "ia", "text-to-image", "image-to-image"],
        openInNewTab: true
    },
    {
        name: "Anima",
        provider: "Anima App",
        description: "Anima es una plataforma de IA centrada en el diseño que une la creatividad y el código. Genera aplicaciones reales, listas para producción, desde Figma, URLs o indicaciones.",
        url: "https://www.animaapp.com/",
        badges: ["diseño", "codigo", "automatizacion", "ia"],
        openInNewTab: true
    },
    {
        name: "Generador de Video con IA Gratis",
        provider: "YesChat.ai",
        description: "Explora el generador de video con IA gratuito de YesChat, con modelos como Grok Imagine, Veo 3.1 y Hailuo 2.3. Crea videos desde texto o imágenes y prueba una amplia gama de efectos de video con IA – todo en un solo lugar.",
        url: "https://www.yeschat.ai/es/features/video",
        badges: ["video", "texto", "imagenes", "text-to-image", "image-to-image"],
        openInNewTab: true
    },
    {
        name: "iStock",
        provider: "Getty Images",
        description: "Plataforma de vídeos e imágenes de stock. Incluye funcionalidades de IA generativa.",
        url: "https://www.istockphoto.com/es/vídeos/industria-aeroespacial",
        badges: ["imagenes", "video", "ia"],
        openInNewTab: true
    },
    {
        name: "1min.AI",
        provider: "Dang.ai",
        description: "Aplicación de IA todo en uno que ofrece una variedad de funciones de IA impulsadas por varios modelos de IA.",
        url: "https://app.1min.ai/?aff=m8eB5",
        badges: ["imagenes", "imagen", "ia"],
        openInNewTab: true
    },
    {
        name: "Stability AI",
        provider: "Vibe Coding",
        description: "Plataforma de IA generativa que ofrece modelos avanzados para la creación de imágenes, videos y audio.",
        url: "https://www.vibecodingherramientas.com/herramientas/stability-ai/",
        badges: ["imagenes", "imagen", "video", "audio", "ia"],
        openInNewTab: true
    },
    {
        name: "Agent AI",
        provider: "Agent AI",
        description: "Agent AI es una plataforma de IA generativa que ofrece modelos avanzados para la creación de imágenes, videos y audio.",
        url: "https://agent.ai/",
        badges: ["texto", "imagenes", "imagen", "multimodal"],
        openInNewTab: true
    },
    {
        name: "Code Wiki",
        provider: "Google",
        description: "Plataforma impulsada por IA de Google que genera y actualiza automáticamente la documentación de repositorios de código. Utiliza Gemini para mantener la documentación sincronizada con los cambios en el código.",
        url: "https://codewiki.google/",
        badges: ["documentos", "codigo", "ia", "automatizacion"],
        openInNewTab: true
    },
    {
        name: "Meku",
        provider: "Meku",
        description: "Constructor de aplicaciones web con IA para desarrolladores. Genera código React + Tailwind listo para producción a partir de prompts, con opción de exportación y despliegue.",
        url: "https://meku.dev/",
        badges: ["codigo", "herramienta", "ia", "web-builder"],
        openInNewTab: true
    },
    {
        name: "Bolt.new",
        provider: "StackBlitz",
        description: "Entorno de desarrollo en el navegador impulsado por IA. Genera y ejecuta aplicaciones full-stack directamente en el navegador sin configuración local.",
        url: "https://bolt.new/",
        badges: ["codigo", "herramienta", "ia", "web-builder", "playground"],
        openInNewTab: true
    },
    {
        name: "Replit",
        provider: "Replit",
        description: "IDE en la nube con agente de IA para construir, ejecutar y desplegar aplicaciones. Soporta múltiples lenguajes y colaboración en tiempo real.",
        url: "https://replit.com/",
        badges: ["codigo", "herramienta", "ia", "ide", "playground"],
        openInNewTab: true
    },
    {
        name: "GitHub Spark",
        provider: "GitHub",
        description: "Constructor de micro-aplicaciones impulsado por Copilot. Convierte prompts en 'Sparks' full-stack con vista previa en vivo y despliegue instantáneo.",
        url: "https://github.com/spark",
        badges: ["codigo", "herramienta", "ia", "web-builder"],
        openInNewTab: true
    },
    {
        name: "Trickle.so",
        provider: "Trickle",
        description: "Constructor con IA que combina generación por prompts con un editor visual 'Magic Canvas'. Ideal para crear herramientas y formularios rápidamente.",
        url: "https://trickle.so/",
        badges: ["codigo", "herramienta", "ia", "web-builder"],
        openInNewTab: true
    },
    {
        name: "Capacity.so",
        provider: "Capacity",
        description: "Genera aplicaciones Next.js + Tailwind + TypeScript a partir de prompts. Código limpio y listo para producción con autenticación y lógica API integrada.",
        url: "https://capacity.so/",
        badges: ["codigo", "herramienta", "ia", "web-builder"],
        openInNewTab: true
    },
    {
        name: "Rocket.new",
        provider: "Rocket",
        description: "Construye aplicaciones web y móviles a partir de prompts o diseños de Figma. Soporta dashboards y landing pages con exportación de código.",
        url: "https://www.rocket.new/",
        badges: ["codigo", "herramienta", "ia", "web-builder", "movil"],
        openInNewTab: true
    },
    {
        name: "Pythagora",
        provider: "Pythagora AI",
        description: "Plataforma de desarrollo con IA para aplicaciones full-stack. Genera frontend, backend, APIs y bases de datos, con herramientas de depuración.",
        url: "https://www.pythagora.ai/",
        badges: ["codigo", "herramienta", "ia", "web-builder"],
        openInNewTab: true
    },
    {
        name: "Softgen AI",
        provider: "Softgen",
        description: "Genera aplicaciones Next.js con autenticación, pagos y SEO integrados. Utiliza flujos de trabajo estructurados para la lógica de la aplicación.",
        url: "https://softgen.ai/",
        badges: ["codigo", "herramienta", "ia", "web-builder"],
        openInNewTab: true
    },
    {
        name: "FlexApp AI",
        provider: "FlexApp",
        description: "Genera aplicaciones móviles React Native para iOS y Android a partir de prompts. Vista previa en vivo y exportación de código.",
        url: "https://flexapp.ai/",
        badges: ["codigo", "herramienta", "ia", "movil"],
        openInNewTab: true
    }
];

function generatePanels() {
    const container = document.getElementById('masonryContainer');
    container.innerHTML = ''; // Clear container

    llmServices.forEach((service, index) => {
        // Create card element
        const card = document.createElement('div');
        card.className = 'card';

        // Generate badges HTML
        const badgesHTML = service.badges.map(badge => {
            // Map badge names to display text
            const badgeTextMap = {
                'chat': 'Chat',
                'open-source': 'Open Source',
                'codigo': 'Código',
                'documentos': 'Documentos',
                'presentaciones': 'Presentaciones',
                'imagenes': 'Imágenes',
                'imagen': 'Imagen',
                'video': 'Vídeo',
                'diseño': 'Diseño',
                'multimodal': 'Multimodal',
                'texto': 'Texto',
                'text-to-image': 'Text-to-Image',
                'image-to-image': 'Image-to-Image',
                'razonamiento': 'Razonamiento',
                'llm': 'LLM',
                'audio': 'Audio',
                'voz': 'Voz',
                'cognitivo': 'Cognitivo',
                'visual': 'Visual',
                'playground': 'Playground',
                'busqueda': 'Búsqueda',
                'productividad': 'Productividad',
                'comparacion': 'Comparación',
                'velocidad': 'Velocidad',
                'agentes': 'Agentes',
                'asistente': 'Asistente',
                'rol': 'Rol',
                'personajes': 'Personajes',
                'compania': 'Compañía',
                'salud': 'Salud',
                'workflow': 'Workflow',
                'orquestacion': 'Orquestación',
                'observabilidad': 'Observabilidad',
                'multiagente': 'Multiagente',
                'automatizacion': 'Automatización',
                'framework': 'Framework',
                'herramienta': 'Herramienta',
                'procesos': 'Procesos',
                'empresarial': 'Empresarial',
                'organizacional': 'Organizacional',
                'distribuido': 'Distribuido',
                'monitoreo': 'Monitoreo',
                'analitica': 'Analítica',
                'sistema': 'Sistema',
                'optimizacion': 'Optimización',
                'visualizacion': 'Visualización',
                'ia': 'IA',
                'ia-local': 'IA Local',
                'web-builder': 'Web Builder',
                'ide': 'IDE',
                'movil': 'Móvil'
            };

            const badgeText = badgeTextMap[badge] || badge;
            return `<span class="badge badge-${badge}">${badgeText}</span>`;
        }).join('\n                    ');

        // Set card HTML
        card.innerHTML = `
        <div class="card-header">
            <h2>${service.name}</h2>
            <div class="provider">${service.provider}</div>
        </div>
        <div class="card-body">
            <p>${service.description}</p>
            ${badgesHTML}
        </div>
        <div class="card-footer">
            <a href="#" data-service-id="${index}" data-url="${service.url}" data-open-in-new-tab="${service.openInNewTab}" class="card-link" aria-label="Visitar ${service.name}">
                <span class="normal-text">Visitar ${service.name} →</span>
                <span class="loading-text">Cargando...</span>
            </a>
            ${service.openInNewTab ? '<p class="new-tab-notice">* Se abrirá en una nueva pestaña</p>' : ''}
        </div>
        `;

        container.appendChild(card);
    });
}

// Get modal elements
const modalOverlay = document.getElementById('modalOverlay');
const modalIframe = document.getElementById('modalIframe');
const modalClose = document.getElementById('modalClose');
const modalOpenTab = document.getElementById('modalOpenTab');
const modalLoading = document.getElementById('modalLoading');

// Store current modal URL
let currentModalUrl = '';
// Store the current link element that opened the modal
let currentLoadingLink = null;

// Focus Trap Logic
function handleTabKey(e) {
    if (e.key === 'Tab') {
        const focusableElements = modalOverlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else { // Tab
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
}

// Function to open modal
async function openModal(url, linkElement = null) {
    // Store the link element for later restoration
    currentLoadingLink = linkElement;

    // Store the current modal URL
    currentModalUrl = url;

    // Show loading indicator
    modalLoading.classList.remove('hidden');
    // Open modal
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    // Accessibility: Set focus to close button and trap focus
    modalClose.focus();
    document.addEventListener('keydown', handleTabKey);

    // Set iframe source
    modalIframe.src = url;

    // Track if we've already opened in new tab to prevent duplicate opens
    let openedInNewTab = false;
    let shouldOpenInNewTab = false;

    // Timeout: If modal is still loading after 7 seconds, open in new tab
    const loadingTimeout = setTimeout(() => {
        // Only act if modal is still open and we haven't already opened in new tab
        if (modalOverlay.classList.contains('active') && !openedInNewTab) {
            openedInNewTab = true;
            clearTimeout(immediateCheck);
            restoreButtonState(linkElement);
            // Open in new tab FIRST, then close modal
            const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
            // Only close modal if window.open succeeded
            if (newWindow) {
                closeModal();
            } else {
                // If popup was blocked, keep modal open and show alert
                openedInNewTab = false; // Reset flag so user can try again
                alert('No se pudo abrir la nueva pestaña. Por favor, permite las ventanas emergentes para este sitio.');
            }
        }
    }, 7000); // 7 seconds timeout

    // Check immediately if iframe is blocked (e.g., by X-Frame-Options)
    // This happens when the page loads but is blocked from displaying in iframe
    // GitHub and many sites block iframes for security
    const immediateCheck = setTimeout(() => {
        // Only check if modal is still open
        if (!modalOverlay.classList.contains('active')) {
            return;
        }

        let isBlocked = false;

        try {
            // Try to access iframe content
            const iframeWindow = modalIframe.contentWindow;

            if (!iframeWindow) {
                isBlocked = true;
            } else {
                // Try to access document - this will throw if blocked by X-Frame-Options
                try {
                    const iframeDoc = modalIframe.contentDocument || iframeWindow.document;

                    if (!iframeDoc) {
                        isBlocked = true;
                    } else {
                        // Try to access body or documentElement
                        try {
                            const testAccess = iframeDoc.body || iframeDoc.documentElement;
                            if (!testAccess) {
                                isBlocked = true;
                            }
                        } catch (e) {
                            // Can't access body - might be blocked, but could also be CORS
                            // Only mark as blocked if we can verify it's actually blocked
                            // For cross-origin sites, this is expected, so don't mark as blocked
                            try {
                                const urlObj = new URL(url);
                                if (urlObj.origin === window.location.origin) {
                                    // Same origin - should be accessible, so it's blocked
                                    isBlocked = true;
                                }
                                // Cross-origin - CORS is expected, not necessarily blocked
                            } catch (urlError) {
                                // Can't parse URL, assume blocked
                                isBlocked = true;
                            }
                        }
                    }
                } catch (docError) {
                    // Error accessing document - check if it's a SecurityError (blocked)
                    // or just CORS (normal for cross-origin)
                    try {
                        const urlObj = new URL(url);
                        if (urlObj.origin === window.location.origin) {
                            // Same origin - should be accessible, so it's blocked
                            isBlocked = true;
                        }
                        // Cross-origin - CORS is expected, not necessarily blocked
                    } catch (urlError) {
                        // Can't parse URL, assume blocked
                        isBlocked = true;
                    }
                }
            }
        } catch (error) {
            // Any error accessing iframe - check if it's SecurityError (blocked)
            // or just CORS (normal for cross-origin)
            try {
                const urlObj = new URL(url);
                if (urlObj.origin === window.location.origin) {
                    // Same origin - should be accessible, so it's blocked
                    isBlocked = true;
                }
                // Cross-origin - CORS is expected, not necessarily blocked
            } catch (urlError) {
                // Can't parse URL, assume blocked
                isBlocked = true;
            }
        }

        if (isBlocked && !openedInNewTab) {
            openedInNewTab = true;
            clearTimeout(loadingTimeout); // Clear the 7-second timeout
            restoreButtonState(linkElement);
            closeModal();
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }, 2000); // Increased to 2 seconds to give iframe more time to load

    // Monitor iframe for redirects and content loading failures
    const iframeLoadHandler = async () => {
        // Only check if modal is still open
        if (!modalOverlay.classList.contains('active')) {
            return;
        }

        // Clear the immediate check timeout since iframe loaded
        clearTimeout(immediateCheck);

        try {
            // Check if we can access the iframe location
            // This will throw for cross-origin iframes
            const iframeWindow = modalIframe.contentWindow;
            const currentUrl = iframeWindow.location.href;

            // If the iframe URL changed from what we set, it might be a redirect
            if (currentUrl !== url && currentUrl !== 'about:blank') {
                // Check the final URL with a fetch request
                try {
                    const response = await fetch(currentUrl, {
                        method: 'HEAD',
                        redirect: 'manual'
                    });

                    if (response.status >= 300 && response.status < 400) {
                        // Still redirecting, open in new tab
                        shouldOpenInNewTab = true;
                    }
                } catch (e) {
                    // Can't check due to CORS - this is normal for cross-origin
                }
            }

            // Try to access iframe content to verify it loaded successfully
            // Only check for same-origin or if we can actually verify blocking
            try {
                const urlObj = new URL(url);
                const isSameOrigin = urlObj.origin === window.location.origin;

                if (isSameOrigin) {
                    // For same-origin, we should be able to access content
                    const iframeDoc = modalIframe.contentDocument || modalIframe.contentWindow.document;

                    if (!iframeDoc || !iframeDoc.body || iframeDoc.body.innerHTML.trim() === '') {
                        // Same origin but no content - blocked or failed
                        shouldOpenInNewTab = true;
                    }
                }
                // For cross-origin, we can't verify due to CORS, so assume it's working
                // unless we get a specific error
            } catch (error) {
                // Error accessing iframe - check if it's same-origin (should be accessible)
                try {
                    const urlObj = new URL(url);
                    if (urlObj.origin === window.location.origin) {
                        // Same origin but can't access - blocked
                        shouldOpenInNewTab = true;
                    }
                    // Cross-origin - CORS is expected, assume it's working
                } catch (urlError) {
                    // Can't parse URL, but don't assume blocked for cross-origin
                }
            }
        } catch (error) {
            // CORS error is normal for external sites - can't access iframe content
            // For cross-origin sites, this doesn't mean it's blocked
            // Only check for redirects
            try {
                const response = await fetch(url, {
                    method: 'HEAD',
                    redirect: 'manual'
                });

                if (response.status >= 300 && response.status < 400) {
                    shouldOpenInNewTab = true;
                }
                // If status is OK, assume iframe is working (can't verify due to CORS)
            } catch (e) {
                // Can't verify, but for cross-origin assume it's working
            }
        }

        if (shouldOpenInNewTab && !openedInNewTab) {
            openedInNewTab = true;
            clearTimeout(loadingTimeout); // Clear the 7-second timeout
            restoreButtonState(linkElement);
            closeModal();
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            // Iframe loaded successfully, restore button state
            restoreButtonState(linkElement);
        }
    };

    // Handle iframe load event
    const loadHandler = () => {
        clearTimeout(immediateCheck);
        clearTimeout(loadingTimeout); // Clear the 7-second timeout since iframe loaded
        iframeLoadHandler();

        // Restore button state when iframe loads successfully
        // Small delay to ensure content is visible
        setTimeout(() => {
            restoreButtonState(linkElement);
        }, 500);
    };
    modalIframe.addEventListener('load', loadHandler, { once: true });

    // Handle iframe error event - if iframe fails to load, open in new tab
    const iframeErrorHandler = () => {
        if (!openedInNewTab && modalOverlay.classList.contains('active')) {
            openedInNewTab = true;
            clearTimeout(immediateCheck);
            clearTimeout(loadingTimeout); // Clear the 7-second timeout
            restoreButtonState(linkElement);
            closeModal();
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    modalIframe.addEventListener('error', iframeErrorHandler, { once: true });
}

// Function to close modal
function closeModal() {
    modalOverlay.classList.remove('active');
    modalIframe.src = ''; // Clear iframe source
    modalLoading.classList.remove('hidden'); // Show loading for next time
    document.body.style.overflow = ''; // Restore scrolling

    // Accessibility: Remove focus trap
    document.removeEventListener('keydown', handleTabKey);

    // Restore button state and focus
    if (currentLoadingLink) {
        restoreButtonState(currentLoadingLink);
        currentLoadingLink.focus(); // Return focus to the link that opened the modal
        currentLoadingLink = null;
    }
}

// Hide loading indicator when iframe loads
modalIframe.addEventListener('load', function () {
    modalLoading.classList.add('hidden');
});

// Function to handle card link clicks
function setupCardLinks() {
    const cardLinks = document.querySelectorAll('.card-link[data-url]');

    cardLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const url = this.getAttribute('data-url');
            const openInNewTab = this.getAttribute('data-open-in-new-tab') === 'true';

            if (url) {
                if (openInNewTab) {
                    // Open in new tab
                    window.open(url, '_blank', 'noopener,noreferrer');
                } else {
                    // Show loading state on button
                    this.classList.add('loading');

                    // Open in modal
                    openModal(url, this); // Pass the link element to restore state later
                }
            }
        });
    });
}

// Function to restore button loading state
function restoreButtonState(linkElement) {
    if (linkElement) {
        linkElement.classList.remove('loading');
    }
}

// Initialize: Generate panels, setup event listeners, and visitor counter
document.addEventListener('DOMContentLoaded', function () {
    // Get progress bars
    let progressBar = document.getElementById('pageLoadingProgress');
    const centerLoadingOverlay = document.getElementById('centerLoadingOverlay');

    if (!progressBar) {
        // Fallback: create if not exists
        progressBar = document.createElement('div');
        progressBar.className = 'page-loading-progress';
        progressBar.id = 'pageLoadingProgress';
        progressBar.innerHTML = '<div class="page-loading-progress-bar"></div>';
        document.body.insertBefore(progressBar, document.body.firstChild);
    }

    const progressBarInner = progressBar.querySelector('.page-loading-progress-bar');

    // Start with visible progress
    let currentWidth = parseFloat(progressBarInner.style.width) || 5;
    if (currentWidth < 10) {
        progressBarInner.style.width = '10%';
        currentWidth = 10;
    }

    // Simulate progress
    let progress = currentWidth;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 12 + 3;
        if (progress > 85) progress = 85; // Don't complete until panels are generated
        progressBarInner.style.width = progress + '%';
    }, 150);

    // Generate panels
    generatePanels();
    setupCardLinks();

    // Complete progress and hide after panels are generated and rendered
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            clearInterval(progressInterval);
            progressBarInner.style.width = '100%';

            // Hide center loading overlay first
            if (centerLoadingOverlay) {
                centerLoadingOverlay.classList.add('hidden');
            }

            // Show content
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');

            // Hide top progress bar after a short delay
            setTimeout(() => {
                progressBar.classList.add('hidden');
            }, 500);
        });
    });
});

// Close modal when clicking the close button
modalClose.addEventListener('click', closeModal);

// Open current modal URL in new tab
modalOpenTab.addEventListener('click', function () {
    if (currentModalUrl) {
        window.open(currentModalUrl, '_blank', 'noopener,noreferrer');
    }
});

// Close modal when clicking outside the modal container
modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

// Función para ocultar widgets de GeoContador fuera del contenedor
function hideExternalGeoContadorWidgets() {
    // Buscar todos los divs que puedan ser widgets de GeoContador
    const allDivs = document.querySelectorAll('body > div');
    const container = document.querySelector('.geocontador-container');

    allDivs.forEach(div => {
        // Verificar que no esté dentro del contenedor permitido
        const isInContainer = div.closest('.geocontador-container') ||
            div.closest('.visitor-counter-table') ||
            div.closest('footer') ||
            div === container ||
            container && container.contains(div);

        // Si NO está en el contenedor, verificar si es un widget de GeoContador
        if (!isInContainer) {
            // Buscar características de widget de GeoContador
            const hasGeoContadorId = div.id && (div.id.toLowerCase().includes('geocontador') || div.id.toLowerCase().includes('geo'));
            const hasGeoContadorClass = div.className && (div.className.toString().toLowerCase().includes('geocontador') || div.className.toString().toLowerCase().includes('geo'));
            const hasFixedPosition = div.getAttribute('style') && (div.getAttribute('style').includes('position: fixed') || div.getAttribute('style').includes('position:absolute') || div.getAttribute('style').includes('position:fixed'));
            const hasGeoContadorContent = div.innerHTML && (div.innerHTML.includes('Online') || div.innerHTML.includes('Total') || div.innerHTML.includes('Colombia'));

            // Si tiene alguna de estas características, ocultarlo
            if (hasGeoContadorId || hasGeoContadorClass || (hasFixedPosition && hasGeoContadorContent)) {
                div.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; width: 0 !important; overflow: hidden !important; pointer-events: none !important;';
                div.remove(); // Intentar remover del DOM también
            }
        }
    });
}

// Ejecutar inmediatamente
hideExternalGeoContadorWidgets();

// Observar cambios en el DOM para ocultar widgets que se inserten dinámicamente
const geoContadorObserver = new MutationObserver(function (mutations) {
    hideExternalGeoContadorWidgets();
});

// Iniciar observación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    if (document.body) {
        geoContadorObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Ejecutar también después de un delay para asegurar que el script de GeoContador haya cargado
    setTimeout(hideExternalGeoContadorWidgets, 1000);
    setTimeout(hideExternalGeoContadorWidgets, 2000);
    setTimeout(hideExternalGeoContadorWidgets, 3000);
});

// Función mejorada para eliminar widgets externos de forma más agresiva
function removeExternalGeoContadorWidgets() {
    const container = document.querySelector('.geocontador-container');
    const footer = document.querySelector('footer');

    // Buscar TODOS los elementos hijos directos del body (divs, imágenes, enlaces, etc.)
    const allBodyChildren = document.querySelectorAll('body > *');

    allBodyChildren.forEach(element => {
        // Verificar si está dentro del contenedor permitido
        const isInContainer = (container && container.contains(element)) ||
            (footer && footer.contains(element)) ||
            element.closest('.geocontador-container') ||
            element.closest('.visitor-counter-table') ||
            element.closest('footer') ||
            element.closest('.container') ||
            element === container ||
            element.id === 'modalOverlay';

        if (!isInContainer) {
            // Verificar contenido del widget
            const innerHTML = element.innerHTML || '';
            const hasGeoContent = innerHTML.includes('Online') ||
                innerHTML.includes('Total') ||
                innerHTML.includes('Colombia') ||
                innerHTML.includes('geocontador') ||
                innerHTML.includes('geo2') ||
                innerHTML.includes('statistic.ovh');

            // Verificar ID y clase
            const id = (element.id || '').toLowerCase();
            const className = (element.className || '').toString().toLowerCase();
            const hasGeoId = id.includes('geocontador') || id.includes('geo');
            const hasGeoClass = className.includes('geocontador') || className.includes('geo');

            // Verificar src o href para imágenes y enlaces (GeoContador inserta img y a directamente)
            const src = (element.src || element.getAttribute('src') || '').toLowerCase();
            const href = (element.href || element.getAttribute('href') || '').toLowerCase();
            const hasGeoUrl = src.includes('statistic.ovh') ||
                src.includes('geocontador') ||
                src.includes('geo2') ||
                src.includes('pointeur') ||
                href.includes('statistic.ovh') ||
                href.includes('geocontador') ||
                href.includes('geo2');

            // Verificar posición
            const style = element.getAttribute('style') || '';
            const computedStyle = window.getComputedStyle(element);
            const hasFixedPos = style.includes('position: fixed') ||
                style.includes('position:absolute') ||
                style.includes('position:fixed') ||
                computedStyle.position === 'fixed' ||
                computedStyle.position === 'absolute';

            // Verificar si está en la esquina inferior izquierda
            const rect = element.getBoundingClientRect();
            const isBottomLeft = rect.bottom > window.innerHeight - 200 && rect.left < 300;

            // Si cumple alguna condición, eliminarlo
            if (hasGeoUrl ||
                (hasGeoContent && (hasFixedPos || isBottomLeft)) ||
                (hasGeoId && !isInContainer) ||
                (hasGeoClass && !isInContainer && hasFixedPos)) {
                element.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; width: 0 !important; overflow: hidden !important; pointer-events: none !important; position: absolute !important; left: -9999px !important;';
                try {
                    element.remove();
                } catch (e) {
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                }
            }
        }
    });
}

// Ejecutar continuamente con un intervalo
let cleanupInterval = null;

function startCleanup() {
    if (cleanupInterval) return;

    // Ejecutar inmediatamente
    removeExternalGeoContadorWidgets();

    // Ejecutar cada 500ms durante los primeros 10 segundos
    let count = 0;
    cleanupInterval = setInterval(function () {
        removeExternalGeoContadorWidgets();
        count++;
        if (count >= 20) { // 20 * 500ms = 10 segundos
            clearInterval(cleanupInterval);
            cleanupInterval = null;
        }
    }, 500);
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startCleanup);
} else {
    startCleanup();
}

// También iniciar cuando la página cargue completamente
window.addEventListener('load', function () {
    startCleanup();
    setTimeout(removeExternalGeoContadorWidgets, 100);
    setTimeout(removeExternalGeoContadorWidgets, 500);
    setTimeout(removeExternalGeoContadorWidgets, 1000);
    setTimeout(removeExternalGeoContadorWidgets, 2000);
});

// Observar cambios en el DOM (usar el observer existente si está disponible)
const geoContadorCleanupObserver = new MutationObserver(function () {
    removeExternalGeoContadorWidgets();
});

if (document.body) {
    geoContadorCleanupObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Update Check Script
(function () {
    const UPDATE_CHECK_KEY = 'llm_directory_last_update';
    const UPDATE_INTERVAL_DAYS = 2;
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    function checkContentFreshness() {
        const lastUpdate = localStorage.getItem(UPDATE_CHECK_KEY);
        const now = Date.now();

        if (!lastUpdate) {
            // First visit or key missing, set current time
            localStorage.setItem(UPDATE_CHECK_KEY, now);
            return;
        }

        const daysSinceUpdate = (now - parseInt(lastUpdate)) / MS_PER_DAY;

        if (daysSinceUpdate > UPDATE_INTERVAL_DAYS) {
            showUpdateNotification();
        }
    }

    function showUpdateNotification() {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-notification-header">
                <div class="update-notification-title">
                    <span>🔄</span> Actualización disponible
                </div>
                <button class="update-notification-close" aria-label="Cerrar notificación">&times;</button>
            </div>
            <div class="update-notification-body">
                Esta versión del directorio podría estar desactualizada (más de 2 días).
            </div>
            <button class="update-notification-action" id="updateBtn">
                Actualizar ahora
            </button>
        `;

        document.body.appendChild(notification);

        // Add event listeners
        const closeBtn = notification.querySelector('.update-notification-close');
        const updateBtn = notification.querySelector('#updateBtn');

        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        });

        updateBtn.addEventListener('click', () => {
            updateContent();
        });

        // Show with animation
        // Small delay to ensure DOM is ready and transition works
        setTimeout(() => {
            requestAnimationFrame(() => {
                notification.classList.add('show');
            });
        }, 1000);
    }

    function updateContent() {
        // Update timestamp
        localStorage.setItem(UPDATE_CHECK_KEY, Date.now());

        // Force reload from server (bypass cache if possible)
        window.location.reload(true);
    }

    // Run check on load
    window.addEventListener('load', checkContentFreshness);
})();

// FIX for dynamic script loading: Dispatch DOMContentLoaded if DOM is already ready
if (document.readyState !== 'loading') {
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
}
