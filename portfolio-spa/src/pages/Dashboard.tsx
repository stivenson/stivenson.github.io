import { Link } from 'react-router-dom';
import { ProfessionalAtlas } from '../components/ProfessionalAtlas';
import { FeaturedProjects } from '../components/FeaturedProjects';
import { PageShell } from '../components/layout/PageShell';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import profile from '../data/profile.json';

const specialties = [
  { number: '01', title: 'IA y agentes', text: 'Modelos de lenguaje integrados a productos y flujos útiles.', tags: ['Python', 'LLMs', 'LangChain', 'FastMCP'] },
  { number: '02', title: 'Producto web', text: 'Experiencias completas, desde la interfaz hasta la API.', tags: ['React', 'TypeScript', 'Node.js', 'FastAPI'] },
  { number: '03', title: 'Cloud y operación', text: 'Infraestructura para desplegar, observar y evolucionar.', tags: ['AWS', 'GCP', 'Docker', 'CI/CD'] },
];

export function Dashboard() {
  return (
    <PageShell className="design-home metroidvania-home">
      <section className="atlas-hero-section" aria-labelledby="home-title">
        <div className="atlas-hero-grid">
          <div className="atlas-intro">
            <p className="atlas-eyebrow"><span /> INGENIERÍA DE SOFTWARE · IA APLICADA</p>
            <h1 id="home-title">De una idea a un producto <em>que puedes probar.</em></h1>
            <p className="atlas-intro-copy">
              Soy {profile.personal.name}. Desde <a href="https://contenido-ia.app/" target="_blank" rel="noopener noreferrer">Contenido IA</a>,
              construyo aplicaciones web y soluciones con inteligencia artificial, con experiencia en banca, educación y desarrollo full stack.
            </p>
            <div className="atlas-actions">
              <button type="button" className="atlas-primary-action" onClick={() => {
                document.getElementById('proyectos')?.scrollIntoView({
                  behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
                });
              }}>Explorar proyectos <span aria-hidden="true">↗</span></button>
              <a href="mailto:contact@contenido-ia.app" className="atlas-secondary-action">Hablemos de tu idea</a>
            </div>
            <div className="atlas-credentials">
              <span>{profile.personal.location}</span>
              <i aria-hidden="true" />
              <span>Trabajo remoto</span>
            </div>
          </div>
          <ProfessionalAtlas />
        </div>
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
          <div className="design-section-heading">
            <div><p className="design-kicker">CÓMO LO CONSTRUYO</p><h2 id="specialties-title">Del modelo al producto.</h2><p>Tres áreas que conecto en cada proyecto.</p></div>
            <Link className="design-text-link" to="/resume">Ver experiencia ↗</Link>
          </div>
          <div className="specialties-grid">
            {specialties.map((item) => (
              <article key={item.number}>
                <span className="specialty-number">{item.number} /</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <ul className="product-stack">{item.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="design-contact" aria-labelledby="contact-title">
          <div><p className="design-kicker">EL SIGUIENTE PASO</p><h2 id="contact-title">¿Qué quieres construir?</h2><p>Conversemos sobre tu idea y la primera versión que vale la pena probar.</p></div>
          <a className="atlas-primary-action" href="mailto:contact@contenido-ia.app">Hablemos <span aria-hidden="true">↗</span></a>
        </section>
      </ScrollReveal>

      <section className="design-footnote" aria-label="Distinción académica">
        <span aria-hidden="true">✦</span><p><strong>{profile.achievements[0].title}</strong> · {profile.achievements[0].description}</p>
      </section>
    </PageShell>
  );
}
