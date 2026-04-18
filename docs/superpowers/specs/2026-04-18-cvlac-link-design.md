# CvLAC Link — Diseño

**Fecha:** 2026-04-18  
**URL:** https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001402041

## Resumen

Añadir el enlace al perfil CvLAC (Minciencias) en dos lugares del portafolio SPA: el Header (visible en todas las páginas) y el Dashboard (panel de bienvenida).

## Cambios

### 1. Header (`portfolio-spa/src/components/Header.tsx`)

- Añadir un `<a>` con clase `rf-button` después del `<nav>` existente
- Atributos: `href` con la URL de CvLAC, `target="_blank"`, `rel="noopener noreferrer"`
- Contenido: ícono 🔬 + texto "CvLAC"
- Sin cambios al sistema de rutas ni al NavLink existente

### 2. Dashboard (`portfolio-spa/src/pages/Dashboard.tsx`)

- En el panel de bienvenida, debajo de la línea de location (`📍`), añadir una pill/badge clickeable
- Estilo: `var(--electric-cyan)` para color de texto y borde, fondo `var(--card-accent-bg-light)`
- Contenido: 🔬 + "Investigador registrado en CvLAC · Minciencias"
- Es un `<a>` con `target="_blank"` y `rel="noopener noreferrer"`
- Hover: leve `opacity` o `border-color` transition

## Decisiones

- URL hardcoded en componentes (no en `profile.json`) — es un link externo institucional, no dato de perfil dinámico
- Se usa el sistema de clases existente (`rf-button`, CSS vars del tema) para mantener coherencia visual
- No se crea ningún componente nuevo
