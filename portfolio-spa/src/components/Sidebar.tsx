import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RetroIcon } from './RetroIcon';
import { staggerContainer, staggerItem } from './motion/variants';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/resume', label: 'Experiencia', icon: '💼' },
  { path: '/portfolio', label: 'Portafolio', icon: '📁' },
  { path: '/articles', label: 'Artículos', icon: '📝' },
  { path: '/about', label: 'Sobre Mí', icon: '👤' },
];

interface ExternalSite {
  href: string;
  icon: string;
  label: string;
  badge?: string;
}

const externalSites: ExternalSite[] = [
  { href: 'https://github.com/stivenson', icon: '🔗', label: 'GitHub Profile' },
  { href: 'https://stivenson.github.io/toc_support.html', icon: '🧠', label: 'Soporte TOC', badge: 'app web' },
  { href: 'https://github.com/stivenson/job_search_agents', icon: '🔍', label: 'Job Search Agents' },
  { href: 'https://project-mri-production.up.railway.app/', icon: '🔬', label: 'Project MRI', badge: 'app web' },
  { href: 'https://stivenson.github.io/llm-directory.html', icon: '🤖', label: 'Directorio LLMs', badge: 'app web' },
];

/** Rutas donde el sidebar se repliega en un panel al entrar desde movil. */
function isReadingRoute(pathname: string): boolean {
  return pathname === '/articles' || pathname.startsWith('/articles/');
}

export function Sidebar() {
  const { pathname } = useLocation();
  const isNarrow = useMediaQuery('(max-width: 768px)');
  const [open, setOpen] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // En las rutas de lectura el menu estorba: quien llega quiere el texto, no
  // la navegacion. Solo en pantallas estrechas — en escritorio sobra sitio.
  const isDrawer = isNarrow && isReadingRoute(pathname);

  // Al navegar (o al ensanchar la ventana) el panel debe cerrarse: si no,
  // queda abierto sobre la pagina nueva o convertido otra vez en columna fija.
  useEffect(() => {
    setOpen(false);
  }, [pathname, isDrawer]);

  useEffect(() => {
    if (!isDrawer || !open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    // Sin esto la pagina de detras sigue desplazandose bajo el panel.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    asideRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      // Devolver el foco al boton evita que el lector de pantalla (o el
      // tabulador) vuelva al principio del documento al cerrar.
      toggleRef.current?.focus();
    };
  }, [isDrawer, open]);

  return (
    <>
      {isDrawer && (
        <div className="sidebar-drawer-bar">
          <button
            ref={toggleRef}
            type="button"
            className="sidebar-drawer-toggle"
            aria-expanded={open}
            aria-controls="sidebar-nav-panel"
            aria-label={open ? 'Cerrar navegación' : 'Abrir navegación'}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sidebar-drawer-burger" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>Navegación</span>
          </button>
        </div>
      )}

      {isDrawer && open && (
        <div
          className="sidebar-drawer-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        ref={asideRef}
        id="sidebar-nav-panel"
        className={`rf-layout-sidebar${isDrawer ? ' rf-layout-sidebar--drawer' : ''}${
          isDrawer && open ? ' is-open' : ''
        }`}
        // Cerrado y fuera de pantalla, el panel no debe recibir foco ni ser
        // anunciado. Fuera del modo panel es un sidebar normal y visible.
        aria-hidden={isDrawer && !open}
        inert={isDrawer && !open}
        tabIndex={isDrawer ? -1 : undefined}
      >
      <div className="rf-sidebar">
        <div className="rf-sidebar-header electric">
          <span className="sidebar-header-mark" aria-hidden="true">✦</span>
          <span>Navegación</span>
          <span className="sidebar-header-status" aria-label="Sitio online" />
        </div>
        <motion.nav
          className="sidebar-nav"
          style={{ marginTop: '8px' }}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {navItems.map((item) => (
            <motion.div key={item.path} variants={staggerItem}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `rf-tree-item sidebar-nav-link ${isActive ? 'active' : ''}`}
                style={{ position: 'relative' }}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active-glow"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: 'var(--border-radius-sm)',
                          background: 'rgba(76, 89, 211, 0.15)',
                          boxShadow: 'inset 3px 0 0 var(--electric-blue)',
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                    <span className="rf-tree-icon" style={{ position: 'relative', zIndex: 1 }}>
                      <RetroIcon emoji={item.icon} size={16} />
                    </span>
                    <span style={{ position: 'relative', zIndex: 1 }}>{item.label}</span>
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </motion.nav>

        <motion.div
          className="sidebar-sites"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <motion.div
            className="sidebar-sites-glow"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(76,89,211,0.18) 0%, rgba(85,170,255,0.12) 100%)',
              pointerEvents: 'none',
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="sidebar-sites-heading">
              <p className="eyebrow">Mis Sitios</p>
              <span className="sidebar-sites-count">{externalSites.length} enlaces</span>
            </div>
            {externalSites.map((site) => (
              <a
                key={site.href}
                href={site.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rf-tree-item sidebar-site-link"
                title={`Abrir ${site.label}`}
              >
                <span className="rf-tree-icon sidebar-site-icon">
                  <RetroIcon emoji={site.icon} size={16} />
                </span>
                <span className="sidebar-site-label">{site.label}</span>
                {site.badge && (
                  <motion.span
                    className="sidebar-site-badge"
                    animate={{ opacity: [1, 0.45, 1] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {site.badge}
                  </motion.span>
                )}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
      </aside>
    </>
  );
}
