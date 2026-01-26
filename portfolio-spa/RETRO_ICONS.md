# Guía de Iconos Retro

Esta documentación describe la integración de iconos retro de `react-old-icons` en el portafolio personal.

## Mapeo de Iconos

El mapeo de emojis a iconos retro se encuentra en `src/config/icons.ts`. Actualmente se utilizan los siguientes iconos:

### Iconos Retro Disponibles

| Emoji | Icono Retro | Componente | Estado |
|-------|-------------|-----------|--------|
| 🏠 | Mi PC | `Windows95MyComputer` | ✅ Activo |
| 📁 | Carpeta | `WindowsFolder` | ✅ Activo |
| 📄 | Bloc de Notas | `Windows95Notepad` | ✅ Activo |
| 📚 | Documentos | `Windows2000MyDocuments` | ✅ Activo |
| 🔍 | Explorador | `WindowsExplorer` | ✅ Activo |
| 🗂️ | Carpeta | `WindowsFolder` | ✅ Activo |

### Emojis sin Equivalente Retro

Los siguientes emojis no tienen equivalentes retro directos y se mantienen como emojis:

- ⚡ (Rayo)
- 💼 (Maletín)
- 👤 (Usuario)
- 🎓 (Graduación)
- 🤖 (Robot)
- 🛠️ (Herramientas)
- 🧠 (Cerebro)
- 📊 (Gráfico)
- 🏆 (Trofeo)
- 📌 (Pin)
- 🌟 (Estrella)
- 🌱 (Planta)
- 💭 (Pensamiento)
- 🎯 (Objetivo)
- 🚀 (Cohete)
- 🎭 (Teatro)
- 🙏 (Oración)
- 📍 (Ubicación)
- 🔗 (Enlace)
- 📦 (Paquete)
- 🦈 (Tiburón)
- ❄️ (Nieve)
- 💖 (Corazón)

## Cómo Agregar Nuevos Iconos

1. **Verificar disponibilidad del icono**:
   - Revisa `node_modules/react-old-icons/dist/index.d.ts` para ver iconos disponibles
   - O visita el [Icon Browser](https://gsnoopy.github.io/react-old-icons/)

2. **Importar el icono**:
   ```typescript
   import { Windows95MyComputer } from 'react-old-icons';
   ```

3. **Agregar al mapeo** en `src/config/icons.ts`:
   ```typescript
   '🏠': {
     emoji: '🏠',
     icon: Windows95MyComputer,
     alt: 'Home',
   },
   ```

4. **Usar en componentes**:
   ```tsx
   <RetroIcon emoji="🏠" size={24} />
   ```

## Feature Flag

El sistema de iconos retro puede deshabilitarse fácilmente mediante el feature flag en `src/config/features.ts`:

```typescript
export const FEATURES = {
  USE_RETRO_ICONS: true, // Cambiar a false para rollback
} as const;
```

## Rollback

Para hacer rollback completo a emojis:

1. **Opción 1 - Feature Flag** (Recomendado):
   - Cambiar `USE_RETRO_ICONS: false` en `src/config/features.ts`
   - Todos los iconos retro se reemplazarán automáticamente por emojis

2. **Opción 2 - Comentar imports**:
   - Comentar los imports en `src/config/icons.ts`
   - El sistema automáticamente usará emojis como fallback

3. **Opción 3 - Desinstalar paquete**:
   ```bash
   npm uninstall react-old-icons
   ```
   - Los emojis se mostrarán automáticamente

## Componente RetroIcon

El componente `RetroIcon` es un wrapper que:

- Acepta un emoji como prop requerido (fallback)
- Busca automáticamente el icono retro correspondiente en el mapeo
- Renderiza el icono retro si está disponible y el feature flag está activo
- Renderiza el emoji si no hay icono retro o el feature flag está desactivado
- Mantiene consistencia de tamaño y estilo

### Uso

```tsx
import { RetroIcon } from '../components';

// Uso básico
<RetroIcon emoji="🏠" size={24} />

// Con estilos personalizados
<RetroIcon 
  emoji="📁" 
  size={32} 
  className="my-icon"
  style={{ color: 'blue' }}
/>

// Forzar emoji (ignorar feature flag)
<RetroIcon emoji="⚡" size={20} useRetro={false} />
```

## Responsividad

Los iconos retro están diseñados para funcionar en todos los tamaños de pantalla:

- **Desktop**: Tamaños normales (16px - 32px)
- **Tablet**: Se ajustan automáticamente
- **Mobile**: Tamaños reducidos (< 480px) con media queries

Los estilos responsivos se encuentran en `src/styles/retro-modern.css`.

## Compatibilidad Cross-Browser

Los iconos retro funcionan en:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

El fallback a emojis garantiza compatibilidad en navegadores antiguos.

## Accesibilidad

Todos los iconos incluyen:
- Atributo `alt` para screen readers
- Atributo `role="img"` cuando se renderiza como emoji
- Soporte para aria-labels

## Performance

- **Tree-shaking**: Solo se importan los iconos utilizados
- **Lazy loading**: Los iconos se cargan bajo demanda
- **Tamaño del bundle**: ~170KB gzipped (incluye toda la aplicación)

## Troubleshooting

### El icono no se muestra
1. Verifica que el icono existe en `react-old-icons`
2. Verifica que está importado en `icons.ts`
3. Verifica que el feature flag está activo
4. Revisa la consola del navegador para errores

### El icono se ve pixelado
- Ajusta el tamaño con CSS
- Verifica que no estás usando `image-rendering: pixelated` en pantallas de alta densidad

### El emoji no se muestra
- Verifica que el emoji es válido
- Algunos navegadores antiguos pueden no soportar emojis nuevos

## Referencias

- [react-old-icons GitHub](https://github.com/gsnoopy/react-old-icons)
- [Icon Browser](https://gsnoopy.github.io/react-old-icons/)
- [Documentación NPM](https://www.npmjs.com/package/react-old-icons)
