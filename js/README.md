# JavaScript Assets

Esta carpeta contiene los archivos JavaScript necesarios para el cliente web.

## Archivos

### `emotion_game.js`
Lógica principal del cliente web:
- Interfaz interactiva con Phaser.js
- Selector de emociones relacionadas con TOC
- Chat integrado con el asistente IA
- Integración con webhook n8n

**Configuración actual:**
- Base URL: `https://test-ai.bca-plugin.com`
- Webhook Path: `/webhook/webhook-test`
- Requiere que el workflow esté **ACTIVADO** en n8n

### `phaser.min.js`
Librería Phaser.js v3.70.0 (versión local como fallback)

**Uso:**
- El HTML carga primero desde CDN (unpkg)
- Si el CDN falla, automáticamente carga esta versión local
- Garantiza que el cliente funcione incluso sin conexión a CDN

## Despliegue en GitHub Pages

Sube **toda la carpeta `js/`** para que funcione correctamente:

```
tu-repo/
├── test_onestvision_client.html
└── js/
    ├── emotion_game.js
    ├── phaser.min.js
    └── README.md (este archivo, opcional)
```

## Actualización de Configuración

Para cambiar el endpoint del webhook, edita `emotion_game.js`:

```javascript
const API_CONFIG = {
    BASE_URL: 'https://test-ai.bca-plugin.com',
    WEBHOOK_PATH: '/webhook/webhook-test'  // ← Cambiar aquí
};
```

**Testing:** `/webhook/webhook-test` (workflow debe estar ACTIVADO)  
**Producción:** `/webhook/web-client` (cambiar path en workflow también)
