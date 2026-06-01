import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Header, Sidebar, RetroIcon, ParticlesBackground } from './components';
import { AnimatedPage } from './components/motion/AnimatedPage';
import { Dashboard, Resume, Portfolio, About, Articles, ArticleDetail } from './pages';
import './styles/tokens.css';
import './styles/typography.css';
import './styles/animations.css';
import './styles/richfaces.css';
import './styles/retro-modern.css';

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
        <Route path="/resume" element={<AnimatedPage><Resume /></AnimatedPage>} />
        <Route path="/portfolio" element={<AnimatedPage><Portfolio /></AnimatedPage>} />
        <Route path="/about" element={<AnimatedPage><About /></AnimatedPage>} />
        <Route path="/articles" element={<AnimatedPage><Articles /></AnimatedPage>} />
        <Route path="/articles/:slug" element={<AnimatedPage><ArticleDetail /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <HashRouter>
      <div className="dark-mountain-bg">
        <div className="bg-grid" />
        <ParticlesBackground />
      </div>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div className="rf-layout" style={{ flex: 1 }}>
          <Sidebar />
          <main className="rf-layout-main">
            <AppRoutes />
          </main>
        </div>
        <footer style={{
          padding: '12px 24px',
          background: 'linear-gradient(180deg, #060620 0%, #030315 100%)',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '12px',
          textAlign: 'center',
          borderTop: '1px solid var(--electric-blue)'
        }}>
          <RetroIcon emoji="⚡" size={14} style={{ color: 'var(--electric-cyan)' }} />
          {' '}Stivenson Rincón Mora © {new Date().getFullYear()} |
          <a
            href="https://github.com/stivenson"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: '8px' }}
          >
            GitHub
          </a>
        </footer>
      </div>
    </HashRouter>
  );
}

export default App;

