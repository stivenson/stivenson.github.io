import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { featuredProjects } from '../data/featuredProjects';

export function FeaturedProjects({ showAllLink = true }: { showAllLink?: boolean }) {
  const reducedMotion = useReducedMotion();
  return (
    <section className="featured-projects" aria-labelledby="featured-projects-title">
      <div className="design-section-heading">
        <div><p className="design-kicker">DEL CÓDIGO A LA EXPERIENCIA</p>
          <h2 id="featured-projects-title">Proyectos que puedes probar.</h2>
          <p>Aplicaciones propias, desplegadas y abiertas para explorar.</p>
        </div>
        {showAllLink && <Link className="design-text-link" to="/portfolio">Todo el portafolio <span aria-hidden="true">↗</span></Link>}
      </div>
      <div className="product-grid">
        {featuredProjects.map((project, index) => (
          <motion.article className={`product-card product-card--${project.id}`} key={project.id}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: reducedMotion ? 0 : 0.45, delay: reducedMotion ? 0 : index * 0.07, ease: [0.22, 1, 0.36, 1] }}
            whileHover={reducedMotion ? undefined : { y: -4, transition: { duration: 0.2, delay: 0 } }}
          >
            <a href={project.url} target="_blank" rel="noopener noreferrer" className="product-preview" aria-label={`Abrir demo de ${project.title} (nueva pestaña)`}>
              <div className="preview-chrome" aria-hidden="true"><span /><span /><span /><small>{project.title}</small><b>↗</b></div>
              <img src={`${import.meta.env.BASE_URL}images/projects/${project.image}`} alt={project.alt} loading="lazy" width="1264" height="712" />
            </a>
            <div className="product-card-body">
              <div className="product-meta"><span>{project.category}</span><span className="product-status">{project.status}</span></div>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <p className="product-scope"><span>Mi trabajo</span>{project.scope}</p>
              <ul className="product-stack" aria-label={`Tecnologías de ${project.title}`}>{project.stack.map((tech) => <li key={tech}>{tech}</li>)}</ul>
              <a className="product-open" href={project.url} target="_blank" rel="noopener noreferrer">Explorar demo <span aria-hidden="true">↗</span></a>
              {project.note && <small className="product-note">{project.note}</small>}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
