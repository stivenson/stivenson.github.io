import { motion } from 'framer-motion';
import { RichPanel, RichTable, TagList, PageShell, CommandLine, Icon } from '../components';
import type { IconName } from '../components';
import profileData from '../data/profile.json';

interface Repo {
  name: string;
  description: string;
  language: string;
  stars: number;
}

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
      <CommandLine command="ls ~/proyectos --all">
        Repositorios públicos y proyectos de código abierto de{' '}
        <a href={github.profileUrl} target="_blank" rel="noopener noreferrer">
          @{github.username}
        </a>{' '}
        — Systems Engineer, Full Stack Developer, open source enthusiast.
      </CommandLine>

      {/* BrainWeb SBD Panel */}
      <RichPanel title="BrainWeb SBD — Análisis de Imágenes Médicas con IA" icon={<Icon name="activity" size={16} />} electric>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div className="panel-icon">
            <Icon name="activity" size={28} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <p className="eyebrow" style={{ marginBottom: '6px' }}>Proyecto Académico · Semillero DSI · Universidad Simón Bolívar</p>
            <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--electric-cyan)', fontWeight: 600 }}>
              Plataforma web interactiva para ciencia de datos en salud
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--rf-text-muted)', marginBottom: '12px', lineHeight: '1.65' }}>
              Plataforma para explorar imágenes MRI simuladas del dataset BrainWeb (McGill). Incluye
              visor 2D multiplanar, visor 3D interactivo con Three.js, y asistente NLP que selecciona
              volúmenes mediante lenguaje natural vía LLMs en HuggingFace. Cubre cerebro normal y
              esclerosis múltiple con 108 volúmenes parametrizados por modalidad, ruido y RF.
            </p>
            <a
              href="https://project-mri-production.up.railway.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cmd"
            >
              Abrir BrainWeb SBD <span className="ext" aria-hidden="true">↗</span>
            </a>
            <div className="panel-note">
              <strong>Stack:</strong>
              <span style={{ fontFamily: 'var(--font-mono)', marginLeft: '6px' }}>
                Python · Flask · React · Vite · Three.js · LLM/NLP · HuggingFace · Railway
              </span>
            </div>
          </div>
        </div>
      </RichPanel>

      {/* LLM Directory Panel */}
      <RichPanel title="Directorio de Interfaces - LLMs" icon={<Icon name="bot" size={16} />} electric>
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          alignItems: 'flex-start',
          flexWrap: 'wrap'
        }}>
          <div className="panel-icon">
            <Icon name="bot" size={28} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              marginBottom: '8px',
              color: 'var(--electric-blue)',
              fontWeight: 600
            }}>
              Directorio de Interfaces de Inteligencia Artificial
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--rf-text-muted)', marginBottom: '12px', lineHeight: '1.6' }}>
              Tu guía completa de interfaces de inteligencia artificial: chats conversacionales, 
              dashboards y herramientas de modelos de lenguaje. Una recopilación cuidadosamente 
              organizada de las mejores herramientas y plataformas de IA disponibles.
            </p>
            <a
              href="https://stivenson.github.io/llm-directory.html"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cmd"
            >
              Visitar Directorio de LLMs <span className="ext" aria-hidden="true">↗</span>
            </a>
            <div className="panel-note">
              <strong>Características</strong>
              <ul>
                <li>Interfaces de chat conversacionales</li>
                <li>Dashboards de IA</li>
                <li>Herramientas de modelos de lenguaje</li>
                <li>Recursos organizados y actualizados</li>
              </ul>
            </div>
          </div>
        </div>
      </RichPanel>

      {/* TOC Support Panel */}
      <RichPanel title="Soporte en Crisis TOC" icon={<Icon name="book" size={16} />} electric>
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          alignItems: 'flex-start',
          flexWrap: 'wrap'
        }}>
          <div className="panel-icon">
            <Icon name="book" size={28} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              marginBottom: '8px',
              color: 'var(--electric-blue)',
              fontWeight: 600
            }}>
              Herramienta de Psicoeducación y Autorregulación Emocional
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--rf-text-muted)', marginBottom: '12px', lineHeight: '1.6' }}>
              Herramienta de psicoeducación y autorregulación emocional orientada al Trastorno Obsesivo-Compulsivo (TOC), 
              basada en andamiaje cognitivo y navegación por estados internos, implementada como interfaz digital no clínica 
              de apoyo personal, complementaria —no sustitutiva— al tratamiento profesional.
            </p>
            <a
              href="https://stivenson.github.io/toc_support.html"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cmd"
            >
              Acceder al Soporte TOC <span className="ext" aria-hidden="true">↗</span>
            </a>
            <div className="panel-note">
              <strong>Características</strong>
              <ul>
                <li>Interfaz de apoyo emocional con LLMs</li>
                <li>Almacenamiento local y privacidad garantizada</li>
                <li>Navegación por estados internos</li>
                <li>Herramienta complementaria no clínica</li>
              </ul>
            </div>
          </div>
        </div>
      </RichPanel>

      {/* Job Search Agents Panel */}
      <RichPanel title="Job Search Agents" icon={<Icon name="search" size={16} />} electric>
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          alignItems: 'flex-start',
          flexWrap: 'wrap'
        }}>
          <div className="panel-icon">
            <Icon name="search" size={28} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              marginBottom: '8px',
              color: 'var(--electric-blue)',
              fontWeight: 600
            }}>
              Sistema Inteligente de Búsqueda de Empleo con Agentes IA
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--rf-text-muted)', marginBottom: '12px', lineHeight: '1.6' }}>
              Sistema inteligente de búsqueda de empleo que utiliza agentes LangGraph para buscar trabajos en múltiples fuentes, 
              extraer información de contacto y generar un reporte HTML interactivo.
            </p>
            <a
              href="https://github.com/stivenson/job_search_agents"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cmd"
            >
              Visitar Job Search Agents <span className="ext" aria-hidden="true">↗</span>
            </a>
            <div className="panel-note">
              <strong>Características</strong>
              <ul>
                <li>Arquitectura multiagente con LangGraph</li>
                <li>Protección anti-bot avanzada</li>
                <li>Sistema de Agent Skills</li>
                <li>Matching inteligente y extracción de información</li>
              </ul>
            </div>
          </div>
        </div>
      </RichPanel>

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

