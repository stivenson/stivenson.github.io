import { motion } from 'framer-motion';
import { RichPanel, RichTable, TagList, PageShell, Icon } from '../components';
import type { IconName } from '../components';
import { FeaturedProjects } from '../components/FeaturedProjects';
import profileData from '../data/profile.json';

interface Repo {
  name: string;
  description: string;
  language: string;
  stars: number;
}

const featuredProjects = [
  {
    number: '01',
    region: 'Salud digital · IA',
    title: 'BrainWeb SBD',
    subtitle: 'Análisis de imágenes médicas con IA',
    description: 'Plataforma para explorar imágenes MRI simuladas de BrainWeb (McGill): visor multiplanar 2D, visualización 3D y selección de volúmenes mediante lenguaje natural.',
    detail: '108 volúmenes para cerebro normal y esclerosis múltiple, parametrizados por modalidad, ruido y RF.',
    tags: ['Python', 'React', 'Three.js', 'HuggingFace'],
    icon: 'activity' as IconName,
    href: 'https://project-mri-production.up.railway.app/',
    action: 'Abrir proyecto',
    art: 'mri',
  },
  {
    number: '02',
    region: 'Herramientas · IA',
    title: 'Directorio de interfaces LLM',
    subtitle: 'Explora herramientas de inteligencia artificial',
    description: 'Directorio organizado de chats, dashboards y herramientas para trabajar con modelos de lenguaje.',
    detail: 'Catálogo de interfaces conversacionales, herramientas y recursos de IA.',
    tags: ['Directorio', 'Interfaces IA', 'Herramientas'],
    icon: 'bot' as IconName,
    href: 'https://stivenson.github.io/llm-directory.html',
    action: 'Explorar directorio',
    art: 'llm',
  },
  {
    number: '03',
    region: 'Bienestar · Privacidad',
    title: 'Soporte en Crisis TOC',
    subtitle: 'Psicoeducación y autorregulación emocional',
    description: 'Recurso digital complementario para personas con TOC, basado en andamiaje cognitivo y navegación por estados internos.',
    detail: 'Almacenamiento local y enfoque de apoyo no clínico, complementario al tratamiento profesional.',
    tags: ['Psicoeducación', 'Privacidad local', 'Apoyo complementario'],
    icon: 'book' as IconName,
    href: 'https://stivenson.github.io/toc_support.html',
    action: 'Ver recurso',
    art: 'toc',
  },
  {
    number: '04',
    region: 'Agentes · Automatización',
    title: 'Job Search Agents',
    subtitle: 'Búsqueda de empleo asistida por agentes',
    description: 'Sistema con agentes LangGraph que busca vacantes en varias fuentes, extrae información de contacto y genera un reporte HTML interactivo.',
    detail: 'Incluye protección anti-bot, Agent Skills y matching de oportunidades.',
    tags: ['LangGraph', 'Agentes IA', 'Agent Skills'],
    icon: 'search' as IconName,
    href: 'https://github.com/stivenson/job_search_agents',
    action: 'Ver repositorio',
    art: 'agents',
  },
];

export function Portfolio() {
  const { github } = profileData;

  const repoColumns = [
    {
      key: 'name',
      header: 'Repositorio',
      render: (repo: Repo) => (
        <a 
          href={`https://github.com/stivenson/${repo.name}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontWeight: 500 }}
        >
          {repo.name}
        </a>
      )
    },
    {
      key: 'description',
      header: 'Descripción',
      render: (repo: Repo) => (
        <span style={{ fontSize: '12px', color: 'var(--rf-text-muted)' }}>
          {repo.description}
        </span>
      )
    },
    {
      key: 'language',
      header: 'Lenguaje',
      width: '100px',
      render: (repo: Repo) => (
        <span className="rf-tag electric">{repo.language}</span>
      )
    },
    {
      key: 'stars',
      header: '⭐',
      width: '60px',
      render: (repo: Repo) => (
        <span style={{ fontWeight: 500, color: 'var(--electric-blue)' }}>
          {repo.stars}
        </span>
      )
    }
  ];

  const projectCategories: { title: string; icon: IconName; projects: { name: string; desc: string; tech: string[] }[] }[] = [
    {
      title: 'Backend & APIs',
      icon: 'cpu',
      projects: [
        { name: 'Hapi-Study', desc: 'Servicios RESTful con Hapi.js', tech: ['Node.js', 'Hapi.js', 'REST'] },
        { name: 'example-typescript-grpc-api', desc: 'API con TypeScript y gRPC', tech: ['TypeScript', 'gRPC', 'Protocol Buffers'] },
      ]
    },
    {
      title: 'Lenguajes & Aprendizaje',
      icon: 'book',
      projects: [
        { name: 'Rust-Study', desc: 'Ejercicios de aprendizaje de Rust', tech: ['Rust', 'Systems Programming'] },
      ]
    },
    {
      title: 'Frontend',
      icon: 'code',
      projects: [
        { name: 'Mithril-1-with-ES6-Classes-Example', desc: 'Ejemplo de Mithril con ES6', tech: ['JavaScript', 'Mithril', 'ES6'] },
      ]
    }
  ];

  return (
    <PageShell>
      <FeaturedProjects showAllLink={false} />
      <header className="portfolio-heading">
        <div>
          <p className="eyebrow">ATLAS DE PROYECTOS · CÓDIGO, IA Y PRODUCTO</p>
          <h1>Proyectos destacados</h1>
          <p>Una selección de herramientas, investigación aplicada y recursos abiertos.</p>
        </div>
        <a className="portfolio-github-link" href={github.profileUrl} target="_blank" rel="noopener noreferrer">
          Explorar GitHub <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="quest-board" aria-labelledby="quest-board-title">
        <div className="quest-board-heading">
          <div>
            <span className="quest-board-kicker">REGISTRO DE EXPEDICIÓN</span>
            <h2 id="quest-board-title">Proyectos principales</h2>
          </div>
          <span className="quest-board-count">04 EN EL MAPA</span>
        </div>
        <div className="quest-grid">
          {featuredProjects.map((project, index) => (
            <article
              className={`quest-card quest-card--${project.art}${index === 0 ? ' quest-card--lead' : ''}`}
              key={project.number}
            >
              <div className={`quest-art quest-art--${project.art}`} aria-hidden="true">
                <span className="quest-art-coordinate">REGIÓN {project.number}</span>
                <div className="quest-art-emblem"><Icon name={project.icon} size={30} /></div>
                <span className="quest-art-mark">✳</span>
              </div>
              <div className="quest-card-body">
                <div className="quest-card-meta">
                  <span>{project.region}</span>
                  <span className="quest-card-number">{project.number}</span>
                </div>
                <h3>{project.title}</h3>
                <p className="quest-card-subtitle">{project.subtitle}</p>
                <p className="quest-card-description">{project.description}</p>
                <p className="quest-card-detail">{project.detail}</p>
                <TagList tags={project.tags} electric />
                <a className="quest-card-action" href={project.href} target="_blank" rel="noopener noreferrer">
                  {project.action} <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Academic Guides Panel */}
      <RichPanel title="Guías Académicas — Unisimón" icon={<Icon name="cap" size={16} />} electric>
        <p style={{ fontSize: '13px', color: 'var(--rf-text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
          Material académico desarrollado para la Universidad Simón Bolívar: guías, talleres y objetos virtuales de aprendizaje.
        </p>
        <div style={{ display: 'grid', gap: '16px' }}>
          {[
            {
              category: 'Programación',
              icon: 'code' as IconName,
              items: [
                {
                  title: 'Guías y Ejercicios — Python Básico',
                  desc: 'Guía práctica de Python básico para estudiantes de la USB Cúcuta.',
                  url: 'https://stivenson.github.io/guia_python_basico_usb.html',
                },
                {
                  title: 'Taller de Práctica — Programación 2',
                  desc: 'Taller del primer corte de Programación 2 con ejercicios aplicados.',
                  url: 'https://stivenson.github.io/taller_prog2_corte1_usb.html',
                },
              ],
            },
            {
              category: 'Matemáticas',
              icon: 'cpu' as IconName,
              items: [
                {
                  title: 'OVA — Cálculo Diferencial',
                  desc: 'Objeto Virtual de Aprendizaje para el curso de Cálculo Diferencial.',
                  url: 'https://stivenson.github.io/OVA_Calculo_Diferencial.html',
                },
              ],
            },
          ].map((group) => (
            <div key={group.category}>
              <h4 style={{
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--electric-cyan)',
              }}>
                <Icon name={group.icon} size={14} />
                {group.category}
              </h4>
              <div className="rf-cards-grid">
                {group.items.map((item) => (
                  <motion.a
                    key={item.url}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rf-card"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(76, 89, 211, 0.3)' }}
                  >
                    <div className="rf-card-header" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon name="book" size={14} />
                      {item.title}
                    </div>
                    <div className="rf-card-body">
                      <p style={{ fontSize: '12px', color: 'var(--rf-text-muted)', lineHeight: '1.6' }}>
                        {item.desc}
                      </p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </RichPanel>

      {/* Pinned Repos Table */}
      <RichPanel title="Repositorios Destacados" icon={<Icon name="folder" size={16} />}>
        <RichTable 
          columns={repoColumns}
          data={github.pinnedRepos}
          keyField="name"
        />
      </RichPanel>

      {/* Project Categories */}
      <RichPanel title="Proyectos por Categoría" icon={<Icon name="folder" size={16} />}>
        <div style={{ display: 'grid', gap: '16px' }}>
          {projectCategories.map((category, catIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <h4 style={{ 
                fontSize: '14px', 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--electric-blue)'
              }}>
                <Icon name={category.icon} size={16} />
                {category.title}
              </h4>
              <div className="rf-cards-grid">
                {category.projects.map((project, projIndex) => (
                  <motion.a
                    key={project.name}
                    href={`https://github.com/stivenson/${project.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rf-card"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: catIndex * 0.1 + projIndex * 0.05 }}
                    whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(76, 89, 211, 0.3)' }}
                  >
                    <div className="rf-card-header" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon name="folder" size={16} />
                      {project.name}
                    </div>
                    <div className="rf-card-body">
                      <p style={{ fontSize: '12px', color: 'var(--rf-text-muted)', marginBottom: '12px' }}>
                        {project.desc}
                      </p>
                      <TagList tags={project.tech} electric />
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </RichPanel>

      {/* GitHub Stats */}
      <RichPanel title="Contribuciones Open Source" icon={<Icon name="star" size={16} />}>
        <div className="term-stats">
          <div className="prompt-row"><span className="term-prompt">$</span> gh api /users/{github.username} --achievements</div>
          <div className="row"><span className="k">repos_públicos</span><span className="v">72+</span></div>
          <div className="row"><span className="k">Pull Shark</span><span className="v">×3</span></div>
          <div className="row"><span className="k">Arctic Code Vault</span><span className="v">unlocked</span></div>
          <div className="row"><span className="k">Public Sponsor</span><span className="v">active</span></div>
        </div>
      </RichPanel>
    </PageShell>
  );
}

