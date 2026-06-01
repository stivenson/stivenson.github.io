import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RetroIcon } from './RetroIcon';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/resume', label: 'CV' },
  { to: '/portfolio', label: 'Portafolio' },
  { to: '/about', label: 'Sobre Mí' },
];

export function Header() {
  return (
    <header className="rf-header-bar electric">
      <div className="rf-header-title">
        <RetroIcon emoji="⚡" size={28} />
        <span className="electric-text">Stivenson Rincón</span>
        <span className="header-subtitle" style={{ fontSize: '14px', fontWeight: 400, opacity: 0.7 }}>
          | Systems Engineer & Full Stack Developer
        </span>
      </div>
      <nav className="rf-header-nav">
        {navItems.map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === '/'}>
            {({ isActive }) => (
              <motion.span
                className="rf-button"
                style={{
                  position: 'relative',
                  color: isActive ? 'var(--electric-cyan)' : undefined,
                  borderColor: isActive ? 'var(--electric-blue)' : undefined,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.span
                    layoutId="header-active-pill"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 'var(--border-radius-sm)',
                      background: 'rgba(76, 89, 211, 0.18)',
                      boxShadow: '0 0 8px rgba(85,170,255,0.2)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
              </motion.span>
            )}
          </NavLink>
        ))}
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
  );
}
