import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RetroIcon } from './RetroIcon';

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
                <span className="rf-tree-icon">
                  <RetroIcon emoji={item.icon} size={16} />
                </span>
                {item.label}
              </NavLink>
            </motion.div>
          ))}
        </nav>
        
        <motion.div 
          style={{ 
            marginTop: '24px', 
            padding: '12px', 
            borderRadius: '4px', 
            border: '1px solid var(--rf-border)',
            position: 'relative',
            overflow: 'hidden'
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.25) 0%, rgba(0, 229, 255, 0.18) 50%, rgba(0, 102, 255, 0.25) 100%)',
              zIndex: 0,
              pointerEvents: 'none'
            }}
            animate={{
              opacity: [0.6, 1.0, 0.6],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(225deg, rgba(0, 229, 255, 0.20) 0%, rgba(0, 102, 255, 0.28) 50%, rgba(0, 229, 255, 0.20) 100%)',
              zIndex: 0,
              pointerEvents: 'none'
            }}
            animate={{
              opacity: [0.4, 0.95, 0.4],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '11px', color: 'rgba(0, 0, 0, 0.65)', marginBottom: '8px', fontWeight: 500 }}>
              Mis Sitios
            </div>
          <a 
            href="https://github.com/stivenson" 
            target="_blank" 
            rel="noopener noreferrer"
            className="rf-tree-item"
            style={{ fontSize: '12px' }}
          >
            <span className="rf-tree-icon">
              <RetroIcon emoji="🔗" size={16} />
            </span>
            GitHub Profile
          </a>
          <a 
            href="https://stivenson.github.io/toc_support.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="rf-tree-item"
            style={{ fontSize: '12px' }}
          >
            <span className="rf-tree-icon">
              <RetroIcon emoji="🧠" size={16} />
            </span>
            Soporte TOC
          </a>
          <a 
            href="https://github.com/stivenson/job_search_agents" 
            target="_blank" 
            rel="noopener noreferrer"
            className="rf-tree-item"
            style={{ fontSize: '12px' }}
          >
            <span className="rf-tree-icon">
              <RetroIcon emoji="🔍" size={16} />
            </span>
            Job Search Agents
          </a>
          <a 
            href="https://stivenson.github.io/llm-directory.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="rf-tree-item"
            style={{ fontSize: '12px' }}
          >
            <span className="rf-tree-icon">
              <RetroIcon emoji="🤖" size={16} />
            </span>
            Directorio LLMs
          </a>
          </div>
        </motion.div>
      </div>
    </aside>
  );
}

