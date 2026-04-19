import { NavLink } from 'react-router-dom';
import { RetroIcon } from './RetroIcon';

export function Header() {
  return (
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
  );
}

