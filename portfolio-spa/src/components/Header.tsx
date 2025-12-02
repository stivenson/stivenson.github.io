import { NavLink } from 'react-router-dom';

export function Header() {
  return (
    <header className="rf-header-bar electric">
      <div className="rf-header-title">
        <span style={{ fontSize: '28px' }}>⚡</span>
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
      </nav>
    </header>
  );
}

