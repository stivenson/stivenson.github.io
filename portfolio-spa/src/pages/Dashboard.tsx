import { Link } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { FeaturedProjects } from '../components/FeaturedProjects';
import { TerminalOrbit } from '../components/TerminalOrbit';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import profile from '../data/profile.json';

const specialties = [
  { number: '01', title: 'IA y agentes', text: 'Modelos de lenguaje integrados a productos y flujos útiles.', tags: ['Python', 'LLMs', 'LangChain', 'FastMCP'] },
  { number: '02', title: 'Producto web', text: 'Experiencias completas, desde la interfaz hasta la API.', tags: ['React', 'TypeScript', 'Node.js', 'FastAPI'] },
  { number: '03', title: 'Cloud y operación', text: 'Infraestructura para desplegar, observar y evolucionar.', tags: ['AWS', 'GCP', 'Docker', 'CI/CD'] },
];

export function Dashboard() {
  return (
    <PageShell className="design-home">
      <section className="design-hero" aria-labelledby="home-title">
        <div className="design-hero-copy">
          <p className="design-kicker"><span className="design-status-dot" /> INGENIERÍA DE SOFTWARE · IA APLICADA</p>
          <h1 id="home-title">De una idea a un producto <em>que puedes probar.</em></h1>
          <p className="design-lead">Soy Stivenson Rincón. Desde mi empresa, <a href="https://contenido-ia.app/" target="_blank" rel="noopener noreferrer">Contenido IA</a>, construyo aplicaciones web y soluciones con inteligencia artificial. Cuento con experiencia en banca, educación y desarrollo full stack.</p>
          <div className="design-actions">
            <button type="button" className="design-button design-button-primary" onClick={() => { document.getElementById('proyectos')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }}>Probar mis proyectos <span aria-hidden="true">↗</span></button>
            <a className="design-button design-button-secondary" href="mailto:contact@contenido-ia.app">Hablemos de tu idea <span aria-hidden="true">→</span></a>
          </div>
          <p className="design-location">Cúcuta, Colombia <span aria-hidden="true">/</span> Trabajo remoto</p>
        </div>
        <aside className="profile-terminal" aria-label="Perfil profesional de Stivenson">
          <div className="profile-terminal-bar"><span className="terminal-window-dots" aria-hidden="true">● ● ●</span><span>stivenson / perfil</span><span aria-hidden="true">_</span></div>
          <TerminalOrbit />
          <div className="profile-terminal-body">
            <p className="terminal-command"><span>$</span> whoami</p>
            <p className="terminal-person">Stivenson Rincón<span className="terminal-person-role">Systems Engineer · Full Stack Developer</span></p>
            <p className="terminal-command"><span>$</span> cat enfoque.txt</p>
            <ul className="terminal-focus"><li>Productos web de principio a fin</li><li>IA conectada a problemas reales</li><li>Cloud, integraciones y despliegue</li></ul>
            <div className="terminal-bottom"><span className="design-status-dot" /> Construir. Probar. Evolucionar.<span className="terminal-idle-cursor" aria-hidden="true">▍</span></div>
          </div>
        </aside>
      </section>
      <ScrollReveal>
      <section className="experience-ribbon" aria-label="Experiencia y formación">
        <p>Experiencia en<br /><strong>sistemas que importan.</strong></p>
        <span><strong>Mo Technologies</strong><small>Productos bancarios</small></span>
        <span><strong>DXC · Davivienda</strong><small>Microservicios y cloud</small></span>
        <span><strong>U. de los Andes</strong><small>Maestría en IA · en curso</small></span>
      </section>
      </ScrollReveal>
      <div id="proyectos" className="project-anchor"><FeaturedProjects /></div>
      <ScrollReveal>
      <section className="design-specialties" aria-labelledby="specialties-title">
        <div className="design-section-heading"><div><p className="design-kicker">CÓMO LO CONSTRUYO</p><h2 id="specialties-title">Del modelo al producto.</h2><p>Tres áreas que conecto en cada proyecto.</p></div><Link className="design-text-link" to="/resume">Ver experiencia ↗</Link></div>
        <div className="specialties-grid">{specialties.map((item) => <article key={item.number}><span className="specialty-number">{item.number} /</span><h3>{item.title}</h3><p>{item.text}</p><ul className="product-stack">{item.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul></article>)}</div>
      </section>
      </ScrollReveal>
      <ScrollReveal>
      <section className="design-contact" aria-labelledby="contact-title"><div><p className="design-kicker">EL SIGUIENTE PASO</p><h2 id="contact-title">¿Qué quieres construir?</h2><p>Conversemos sobre tu idea y la primera versión que vale la pena probar.</p></div><a className="design-button design-button-primary" href="mailto:contact@contenido-ia.app">Hablemos <span aria-hidden="true">↗</span></a></section>
      </ScrollReveal>
      <section className="design-footnote" aria-label="Distinción académica"><span aria-hidden="true">✦</span><p><strong>{profile.achievements[0].title}</strong> · {profile.achievements[0].description}</p></section>
    </PageShell>
  );
}
