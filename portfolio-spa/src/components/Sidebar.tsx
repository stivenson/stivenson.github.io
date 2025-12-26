import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/resume', label: 'Experiencia', icon: '💼' },
  { path: '/portfolio', label: 'Portafolio', icon: '📁' },
  { path: '/about', label: 'Sobre Mí', icon: '👤' },
];

export function Sidebar() {
  return (
    <aside className="rf-layout-sidebar">
      <div className="rf-sidebar">
        <div className="rf-sidebar-header electric">
          Navegación
        </div>
        <nav style={{ marginTop: '8px' }}>
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) => `rf-tree-item ${isActive ? 'active' : ''}`}
              >
                <span className="rf-tree-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            </motion.div>
          ))}
        </nav>
        
        <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(0, 102, 255, 0.05)', borderRadius: '4px', border: '1px solid var(--rf-border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--rf-text-muted)', marginBottom: '8px' }}>
            Mis Sitios
          </div>
          <a 
            href="https://github.com/stivenson" 
            target="_blank" 
            rel="noopener noreferrer"
            className="rf-tree-item"
            style={{ fontSize: '12px' }}
          >
            <span className="rf-tree-icon">🔗</span>
            GitHub Profile
          </a>
          <a 
            href="https://stivenson.github.io/toc_support.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="rf-tree-item"
            style={{ fontSize: '12px' }}
          >
            <span className="rf-tree-icon">🧠</span>
            Soporte TOC
          </a>
          <a 
            href="https://stivenson.github.io/llm-directory.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="rf-tree-item"
            style={{ fontSize: '12px' }}
          >
            <span className="rf-tree-icon">🤖</span>
            Directorio LLMs
          </a>
        </div>
      </div>
    </aside>
  );
}

