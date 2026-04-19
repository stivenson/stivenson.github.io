# CvLAC Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir el enlace al perfil CvLAC de Minciencias en el Header (todas las páginas) y en el Dashboard (panel de bienvenida), usando el sistema de diseño existente.

**Architecture:** Dos cambios de componentes aislados y sin dependencias entre sí — Header recibe un `<a>` con clase `rf-button`, Dashboard recibe una pill/badge debajo del location. No se crean componentes nuevos ni se modifica `profile.json`.

**Tech Stack:** React 19, TypeScript, CSS vars del tema dark retro-elegant (`var(--electric-cyan)`, `var(--card-accent-bg-light)`), Framer Motion (ya presente).

---

## Archivos a modificar

- Modify: `portfolio-spa/src/components/Header.tsx`
- Modify: `portfolio-spa/src/pages/Dashboard.tsx`

---

### Task 1: Añadir botón CvLAC en el Header

**Files:**
- Modify: `portfolio-spa/src/components/Header.tsx`

- [ ] **Step 1: Abrir el archivo y localizar el `<nav>`**

El archivo actual termina con el `<nav>` de NavLinks. El enlace CvLAC va **fuera** del `<nav>`, directamente dentro del `<header>`, después de `</nav>`.

- [ ] **Step 2: Reemplazar el contenido del `<header>` con la versión actualizada**

Reemplazar desde `<header className="rf-header-bar electric">` hasta `</header>` con:

```tsx
<header className="rf-header-bar electric">
  <div className="rf-header-title">
    <RetroIcon emoji="⚡" size={28} />
    <span className="electric-text">Stivenson Rincón</span>
    <span className="header-subtitle" style={{ fontSize: '14px', fontWeight: 400, opacity: 0.8 }}>
      | Systems Engineer & Full Stack Developer
    </span>
  </div>
  <nav className="rf-header-nav">
    <NavLink to="/" className="rf-button">
      Dashboard
    </NavLink>
    <NavLink to="/resume" className="rf-button">
      CV
    </NavLink>
    <NavLink to="/portfolio" className="rf-button">
      Portafolio
    </NavLink>
    <NavLink to="/about" className="rf-button">
      Sobre Mí
    </NavLink>
    <a
      href="https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001402041"
      target="_blank"
      rel="noopener noreferrer"
      className="rf-button"
      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
    >
      🔬 CvLAC
    </a>
  </nav>
</header>
```

- [ ] **Step 3: Verificar visualmente en dev server**

```bash
cd portfolio-spa && npm run dev
```

Abrir `http://localhost:5173`. Confirmar que aparece el botón "🔬 CvLAC" en el header, alineado con los demás botones de nav, y que al hacer clic abre una nueva pestaña con el perfil CvLAC.

- [ ] **Step 4: Commit**

```bash
git add portfolio-spa/src/components/Header.tsx
git commit -m "feat(header): add CvLAC link button"
```

---

### Task 2: Añadir badge CvLAC en el Dashboard

**Files:**
- Modify: `portfolio-spa/src/pages/Dashboard.tsx`

- [ ] **Step 1: Localizar la línea de location en el panel de bienvenida**

En `Dashboard.tsx`, buscar el bloque que contiene `{personal.location}` — luce así:

```tsx
<p style={{ fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
  <RetroIcon emoji="📍" size={14} />
  {personal.location}
</p>
```

- [ ] **Step 2: Añadir el badge CvLAC inmediatamente después de ese bloque**

Insertar después de la línea de location y antes del bloque del motto (`personal.motto`):

```tsx
<a
  href="https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001402041"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--electric-cyan)',
    border: '1px solid var(--electric-cyan)',
    borderRadius: '12px',
    padding: '3px 10px',
    marginBottom: '8px',
    textDecoration: 'none',
    background: 'rgba(85, 170, 255, 0.08)',
    transition: 'background 0.2s',
  }}
  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(85, 170, 255, 0.18)')}
  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(85, 170, 255, 0.08)')}
>
  🔬 Investigador registrado en CvLAC · Minciencias
</a>
```

- [ ] **Step 3: Verificar visualmente en dev server**

Con el dev server corriendo (`npm run dev`), ir a `http://localhost:5173`. En el panel de bienvenida, debajo de la ubicación, debe aparecer la pill cyan "🔬 Investigador registrado en CvLAC · Minciencias". Al hover debe aclararse levemente el fondo. Al clic debe abrir nueva pestaña con el perfil CvLAC.

- [ ] **Step 4: Commit**

```bash
git add portfolio-spa/src/pages/Dashboard.tsx
git commit -m "feat(dashboard): add CvLAC badge in welcome panel"
```

---

### Task 3: Deploy

- [ ] **Step 1: Invocar el skill de deploy**

Usar el skill `/portfolio-deploy` para ejecutar el workflow completo de build y deploy a GitHub Pages.
