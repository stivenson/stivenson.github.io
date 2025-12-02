import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header, Sidebar } from './components';
import { Dashboard, Resume, Portfolio, About } from './pages';
import './styles/richfaces.css';

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div className="rf-layout" style={{ flex: 1 }}>
          <Sidebar />
          <main className="rf-layout-main">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/resume" element={<Resume />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
        </div>
        <footer style={{ 
          padding: '12px 24px',
          background: 'linear-gradient(180deg, #1a3050 0%, #0d1a28 100%)',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '12px',
          textAlign: 'center',
          borderTop: '1px solid var(--electric-blue)'
        }}>
          <span style={{ color: 'var(--electric-cyan)' }}>⚡</span>
          {' '}Stivenson Rincón Mora © {new Date().getFullYear()} | 
          <a 
            href="https://github.com/stivenson" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: 'var(--electric-cyan)', marginLeft: '8px' }}
          >
            GitHub
          </a>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;

