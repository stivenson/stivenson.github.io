import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Header, Sidebar, RetroIcon } from './components';
import { AnimatedPage } from './components/motion/AnimatedPage';
import './styles/tokens.css';
import './styles/typography.css';
import './styles/animations.css';
import './styles/richfaces.css';
import './styles/retro-modern.css';

// Route-based code splitting: each page (and its heavy deps — markdown,
// syntax-highlighter, etc.) loads only when its route is visited.
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Resume = lazy(() => import('./pages/Resume').then((m) => ({ default: m.Resume })));
const Portfolio = lazy(() => import('./pages/Portfolio').then((m) => ({ default: m.Portfolio })));
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const Articles = lazy(() => import('./pages/Articles').then((m) => ({ default: m.Articles })));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail').then((m) => ({ default: m.ArticleDetail })));

// tsparticles is a decorative background — load it off the critical path.
const ParticlesBackground = lazy(() =>
  import('./components/ParticlesBackground').then((m) => ({ default: m.ParticlesBackground }))
);

function RouteFallback() {
  return (
    <div className="mono" style={{ padding: 'var(--space-2xl)', color: 'var(--rf-text-muted)' }}>
      <span className="term-prompt" style={{ color: 'var(--term-amber)' }}>$</span> cargando…
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <Suspense fallback={<RouteFallback />}>
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
    </Suspense>
  );
}

function App() {
  return (
    <HashRouter>
      <div className="dark-mountain-bg">
        <div className="cosmic-nebula" aria-hidden="true" />
        <div className="cosmic-planet cosmic-planet--violet" aria-hidden="true">
          <span className="cosmic-planet-ring" />
        </div>
        <div className="cosmic-planet cosmic-planet--cyan" aria-hidden="true" />
        <div className="cosmic-moon" aria-hidden="true" />
        <div className="bg-grid" />
        <Suspense fallback={null}>
          <ParticlesBackground />
        </Suspense>
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
