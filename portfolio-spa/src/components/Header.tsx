import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="rf-header-bar electric design-header">
      <Link to="/" className="design-brand" aria-label="Stivenson Rincón, inicio"><span className="brand-mark" aria-hidden="true">$_</span><span>Stivenson Rincón<small>Ingeniería de software · IA aplicada</small></span></Link>
      <nav className="design-header-actions" aria-label="Enlaces profesionales">
        <Link to="/resume" className="design-header-cv">Ver CV <span aria-hidden="true">↗</span></Link>
        <a className="design-header-cv" href="https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001402041" target="_blank" rel="noopener noreferrer">CvLAC ↗</a>
        <a className="design-header-contact" href="mailto:contact@contenido-ia.app">Hablemos <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
  );
}
