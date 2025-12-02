import { motion } from 'framer-motion';
import { RichPanel, RichTable, TagList } from '../components';
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

  const projectCategories = [
    {
      title: 'Backend & APIs',
      icon: '🔧',
      projects: [
        { name: 'Hapi-Study', desc: 'Servicios RESTful con Hapi.js', tech: ['Node.js', 'Hapi.js', 'REST'] },
        { name: 'example-typescript-grpc-api', desc: 'API con TypeScript y gRPC', tech: ['TypeScript', 'gRPC', 'Protocol Buffers'] },
      ]
    },
    {
      title: 'Lenguajes & Aprendizaje',
      icon: '📚',
      projects: [
        { name: 'Rust-Study', desc: 'Ejercicios de aprendizaje de Rust', tech: ['Rust', 'Systems Programming'] },
      ]
    },
    {
      title: 'Frontend',
      icon: '🎨',
      projects: [
        { name: 'Mithril-1-with-ES6-Classes-Example', desc: 'Ejemplo de Mithril con ES6', tech: ['JavaScript', 'Mithril', 'ES6'] },
      ]
    }
  ];

  return (
    <div className="animate-fade-in">
      <RichPanel title="Portafolio de Proyectos" icon="📁" electric>
        <p style={{ fontSize: '13px', color: 'var(--rf-text-muted)', marginBottom: '16px' }}>
          Repositorios públicos y proyectos de código abierto. Explora mi trabajo en 
          <a 
            href={github.profileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ marginLeft: '4px' }}
          >
            GitHub (@{github.username})
          </a>
        </p>
        
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          padding: '12px',
          background: 'rgba(0, 102, 255, 0.05)',
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          <span style={{ fontSize: '20px' }}>👤</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>@{github.username}</div>
            <div style={{ fontSize: '12px', color: 'var(--rf-text-muted)' }}>
              Systems Engineer, Developer Full Stack, Open source enthusiast
            </div>
          </div>
        </div>
      </RichPanel>

      {/* LLM Directory Panel */}
      <RichPanel title="Directorio de Interfaces - LLMs" icon="🤖" electric>
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          alignItems: 'flex-start',
          flexWrap: 'wrap'
        }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--electric-blue) 0%, var(--electric-cyan) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              boxShadow: 'var(--electric-shadow)',
              flexShrink: 0
            }}
          >
            🤖
          </motion.div>
          <div style={{ flex: 1, minWidth: '280px' }}>
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
            <motion.a
              href="https://stivenson.github.io/llm-directory.html"
              target="_blank"
              rel="noopener noreferrer"
              className="rf-button primary"
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>🔗</span>
              <span>Visitar Directorio de LLMs</span>
            </motion.a>
            <div style={{ 
              marginTop: '12px',
              padding: '10px',
              background: 'rgba(0, 102, 255, 0.05)',
              borderRadius: '6px',
              borderLeft: '3px solid var(--electric-blue)'
            }}>
              <div style={{ fontSize: '12px', color: 'var(--rf-text-muted)' }}>
                <strong style={{ color: 'var(--electric-blue)' }}>✨ Características:</strong>
                <ul style={{ marginTop: '6px', paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li>Interfaces de chat conversacionales</li>
                  <li>Dashboards de IA</li>
                  <li>Herramientas de modelos de lenguaje</li>
                  <li>Recursos organizados y actualizados</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </RichPanel>

      {/* Pinned Repos Table */}
      <RichPanel title="Repositorios Destacados" icon="📌">
        <RichTable 
          columns={repoColumns}
          data={github.pinnedRepos}
          keyField="name"
        />
      </RichPanel>

      {/* Project Categories */}
      <RichPanel title="Proyectos por Categoría" icon="🗂️">
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
                <span>{category.icon}</span>
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
                    whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0, 102, 255, 0.2)' }}
                  >
                    <div className="rf-card-header">
                      📦 {project.name}
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
      <RichPanel title="Contribuciones Open Source" icon="🌟">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '16px',
          textAlign: 'center'
        }}>
          <div style={{ 
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.1) 0%, rgba(0, 229, 255, 0.1) 100%)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>72+</div>
            <div style={{ fontSize: '12px', color: 'var(--rf-text-muted)' }}>Repositorios</div>
          </div>
          <div style={{ 
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.1) 0%, rgba(0, 229, 255, 0.1) 100%)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🦈</div>
            <div style={{ fontSize: '12px', color: 'var(--rf-text-muted)' }}>Pull Shark x3</div>
          </div>
          <div style={{ 
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.1) 0%, rgba(0, 229, 255, 0.1) 100%)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>❄️</div>
            <div style={{ fontSize: '12px', color: 'var(--rf-text-muted)' }}>Arctic Code Vault</div>
          </div>
          <div style={{ 
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.1) 0%, rgba(0, 229, 255, 0.1) 100%)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💖</div>
            <div style={{ fontSize: '12px', color: 'var(--rf-text-muted)' }}>Public Sponsor</div>
          </div>
        </div>
      </RichPanel>
    </div>
  );
}

