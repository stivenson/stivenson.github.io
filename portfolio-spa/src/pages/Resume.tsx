import { motion } from 'framer-motion';
import { RichPanel, RichTabPanel, Timeline, TagList, RetroIcon } from '../components';
import profileData from '../data/profile.json';

export function Resume() {
  const { experience, education, courses, skills, references } = profileData;

  const experienceTimeline = experience.map(exp => ({
    date: exp.period,
    title: exp.company,
    subtitle: exp.role,
    content: (
      <div>
        <p style={{ marginBottom: '8px', fontSize: '12px' }}>
          <span style={{ 
            display: 'inline-block',
            padding: '2px 8px',
            background: 'rgba(0, 102, 255, 0.1)',
            borderRadius: '4px',
            fontSize: '11px',
            color: 'var(--electric-blue)'
          }}>
            {exp.modality}
          </span>
        </p>
        <ul style={{ fontSize: '12px', color: 'var(--rf-text-muted)', paddingLeft: '16px', marginBottom: '12px' }}>
          {exp.description.map((desc, i) => (
            <li key={i} style={{ marginBottom: '4px' }}>{desc}</li>
          ))}
        </ul>
        <TagList tags={exp.technologies} electric />
      </div>
    )
  }));

  const educationTimeline = education.map(edu => ({
    date: edu.period,
    title: edu.institution,
    subtitle: edu.degree,
    content: (
      <p style={{ fontSize: '12px', color: 'var(--rf-text-muted)' }}>
        {edu.description}
      </p>
    )
  }));

  const tabs = [
    {
      id: 'experience',
      label: 'Experiencia Laboral',
      icon: '💼',
      content: (
        <Timeline items={experienceTimeline} />
      )
    },
    {
      id: 'education',
      label: 'Educación',
      icon: '🎓',
      content: (
        <Timeline items={educationTimeline} />
      )
    },
    {
      id: 'courses',
      label: 'Cursos',
      icon: '📚',
      content: (
        <div>
          {courses.map((course, index) => (
            <div 
              key={index}
              style={{
                padding: '12px',
                marginBottom: '8px',
                background: index % 2 === 0 ? 'var(--rf-table-row-even)' : 'var(--rf-table-row-odd)',
                borderRadius: '4px',
                border: '1px solid var(--rf-border)',
                fontSize: '13px'
              }}
            >
              {course}
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'academic-projects',
      label: 'Proyectos Académicos',
      icon: '🤖',
      content: (
        <div>
          <p style={{ fontSize: '13px', color: 'var(--rf-text-muted)', marginBottom: '16px' }}>
            Proyectos académicos desarrollados y/o apoyados utilizando herramientas de IA generativa 
            (Cursor, AntiGravity, Google AI Studio) durante la Maestría en Inteligencia Artificial.
          </p>
          
          {[
            {
              title: 'Guía Proyecto Sostenible Data IA',
              url: 'https://stivenson.github.io/guia-proyecto-sostenible-data-ia.html',
              tool: 'AntiGravity',
              role: 'Desarrollo',
              technologies: ['HTML', 'CSS', 'JavaScript', 'AI-Assisted']
            },
            {
              title: 'Presentación ETL: Foros, Consentimientos y Mapas',
              url: 'https://stivenson.github.io/etl_presentation.html',
              tool: 'Cursor',
              role: 'Desarrollo',
              technologies: ['HTML', 'CSS', 'JavaScript', 'Python', 'DuckDB', 'AWS', 'ETL']
            },
            {
              title: 'Python Basic Questions',
              url: 'https://stivenson.github.io/python-basic-questions.html',
              tool: 'Cursor',
              role: 'Desarrollo',
              technologies: ['HTML', 'CSS', 'JavaScript', 'Python']
            },
            {
              title: 'Taller IA - Universidad Simón Bolívar',
              url: 'https://stivenson.github.io/unisimon_ai_taller.html',
              tool: 'Cursor',
              role: 'Desarrollo',
              technologies: ['HTML', 'CSS', 'JavaScript']
            },
            {
              title: 'Arrays y Matrices - Presentación',
              url: 'https://stivenson.github.io/arrays_matrices_presentation.html',
              tool: 'Cursor',
              role: 'Desarrollo',
              technologies: ['HTML', 'CSS', 'JavaScript']
            },
            {
              title: 'Generador de Ejercicios Básicos',
              url: 'https://stivenson.github.io/generator_basic_exercises.html',
              tool: 'Cursor',
              role: 'Desarrollo',
              technologies: ['HTML', 'CSS', 'JavaScript']
            }
          ].map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{
                padding: '16px',
                marginBottom: '16px',
                background: index % 2 === 0 ? 'var(--rf-table-row-even)' : 'var(--rf-table-row-odd)',
                borderRadius: '6px',
                border: '1px solid var(--rf-border)',
                transition: 'all 0.2s ease'
              }}
              whileHover={{ 
                boxShadow: '0 4px 12px rgba(0, 102, 255, 0.15)',
                borderColor: 'var(--electric-blue)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px',
                  minWidth: '35px',
                  minHeight: '35px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, var(--electric-blue) 0%, var(--electric-cyan) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0
                }}>
                  <RetroIcon 
                    emoji={project.tool === 'Cursor' ? '⚡' : project.tool === 'AntiGravity' ? '🚀' : '🌐'} 
                    size={20} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    fontSize: '14px', 
                    marginBottom: '4px',
                    color: 'var(--electric-blue)',
                    fontWeight: 600
                  }}>
                    {project.title}
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <span style={{ 
                      fontSize: '11px',
                      padding: '2px 8px',
                      background: '#ffffff',
                      borderRadius: '4px',
                      border: '1px solid #0066ff',
                      color: '#0066ff',
                      fontWeight: 500
                    }}>
                      {project.tool}
                    </span>
                    <span style={{ 
                      fontSize: '11px',
                      padding: '2px 8px',
                      background: '#0066ff',
                      borderRadius: '4px',
                      color: '#ffffff',
                      fontWeight: 500
                    }}>
                      {project.role}
                    </span>
                  </div>
                  <a 
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      fontSize: '12px',
                      color: 'var(--rf-link)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      wordBreak: 'break-all',
                      overflowWrap: 'break-word'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    <RetroIcon emoji="🔗" size={12} style={{ marginRight: '4px' }} />
                    <span style={{ fontSize: '11px' }}>{project.url.length > 50 ? project.url.substring(0, 50) + '...' : project.url}</span>
                  </a>
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <TagList tags={project.technologies} electric />
              </div>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'skills',
      label: 'Habilidades',
      icon: '🛠️',
      content: (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--electric-blue)' }}>
              Lenguajes de Programación
            </h4>
            <TagList tags={skills.languages} electric />
          </div>
          <div>
            <h4 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--electric-blue)' }}>
              Frontend
            </h4>
            <TagList tags={skills.frontend} electric />
          </div>
          <div>
            <h4 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--electric-blue)' }}>
              Backend
            </h4>
            <TagList tags={skills.backend} electric />
          </div>
          <div>
            <h4 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--electric-blue)' }}>
              Cloud & DevOps
            </h4>
            <TagList tags={[...skills.cloud, ...skills.devops]} electric />
          </div>
          <div>
            <h4 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--electric-blue)' }}>
              Bases de Datos
            </h4>
            <TagList tags={skills.databases} electric />
          </div>
          <div>
            <h4 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--electric-blue)' }}>
              Inteligencia Artificial
            </h4>
            <TagList tags={skills.ai} electric />
          </div>
          <div>
            <h4 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--electric-blue)' }}>
              Herramientas & Otros
            </h4>
            <TagList tags={skills.tools} electric />
          </div>
          <div>
            <h4 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--electric-blue)' }}>
              Metodologías
            </h4>
            <TagList tags={skills.methodologies} electric />
          </div>
        </div>
      )
    },
    {
      id: 'references',
      label: 'Referencias',
      icon: '👥',
      content: (
        <div style={{ display: 'grid', gap: '16px' }}>
          {references.map((ref, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                padding: '20px',
                background: index % 2 === 0 ? 'var(--rf-table-row-even)' : 'var(--rf-table-row-odd)',
                borderRadius: '8px',
                border: '1px solid var(--rf-border)',
                transition: 'all 0.2s ease'
              }}
              whileHover={{ 
                boxShadow: '0 4px 12px rgba(0, 102, 255, 0.15)',
                borderColor: 'var(--electric-blue)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--electric-blue) 0%, var(--electric-cyan) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: 'white',
                  flexShrink: 0
                }}>
                  {ref.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    fontSize: '15px', 
                    marginBottom: '4px',
                    color: 'var(--electric-blue)',
                    fontWeight: 600
                  }}>
                    {ref.name}
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: 'var(--rf-text-muted)',
                    marginBottom: '4px'
                  }}>
                    {ref.title}
                  </p>
                  <p style={{ 
                    fontSize: '12px', 
                    color: 'var(--rf-text-muted)',
                    marginBottom: '8px',
                    fontWeight: 500
                  }}>
                    {ref.company}
                  </p>
                  {'note' in ref && ref.note && (
                    <p style={{ 
                      fontSize: '11px', 
                      color: 'var(--electric-cyan)',
                      marginBottom: '8px',
                      fontStyle: 'italic'
                    }}>
                      {ref.note}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {ref.social && (
                      <a
                        href={ref.social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          fontSize: '12px',
                          padding: '4px 10px',
                          background: ref.social.platform === 'instagram' 
                            ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
                            : 'rgba(0, 136, 204, 0.15)',
                          borderRadius: '4px',
                          color: ref.social.platform === 'instagram' ? 'white' : 'var(--electric-blue)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          textDecoration: 'none',
                          fontWeight: 500,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {ref.social.platform === 'instagram' ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.018.432-.083 1.12-.22 1.882-.164.87-.39 1.72-.648 2.49-.31 1.15-.69 2.18-1.21 3.1-.5.88-1.1 1.62-1.8 2.2-.7.58-1.52 1-2.38 1.25-.85.25-1.75.38-2.65.38s-1.8-.13-2.65-.38c-.86-.25-1.68-.67-2.38-1.25-.7-.58-1.3-1.32-1.8-2.2-.52-.92-.9-1.95-1.21-3.1-.26-.77-.48-1.62-.65-2.49-.14-.76-.2-1.45-.22-1.88-.02-.17.003-.38.02-.47a.5.5 0 0 1 .17-.33c.14-.12.36-.14.46-.14h.01c.15.01.3.05.42.14.13.1.22.24.28.4.06.16.1.33.11.5.01.17 0 .34-.01.51-.01.34-.05.68-.11 1.01-.13.66-.3 1.31-.52 1.94-.22.63-.48 1.24-.78 1.82-.3.58-.65 1.12-1.05 1.61-.4.49-.84.93-1.33 1.3-.49.37-1.02.68-1.58.92-.56.24-1.15.41-1.76.51-.61.1-1.24.14-1.87.14s-1.26-.04-1.87-.14c-.61-.1-1.2-.27-1.76-.51-.56-.24-1.09-.55-1.58-.92-.49-.37-.93-.81-1.33-1.3-.4-.49-.75-1.03-1.05-1.61-.3-.58-.56-1.19-.78-1.82-.22-.63-.39-1.28-.52-1.94-.06-.33-.1-.67-.11-1.01-.01-.17-.02-.34-.01-.51.01-.17.05-.34.11-.5.06-.16.15-.3.28-.4.12-.09.27-.13.42-.14h.01zm-4.906 1.5c-.17 0-.34.02-.5.05-.16.03-.31.08-.45.14-.14.06-.27.14-.38.23-.11.09-.2.2-.27.32-.07.12-.12.25-.15.39-.03.14-.05.28-.05.42s.02.28.05.42c.03.14.08.27.15.39.07.12.16.23.27.32.11.09.24.17.38.23.14.06.29.11.45.14.16.03.33.05.5.05s.34-.02.5-.05c.16-.03.31-.08.45-.14.14-.06.27-.14.38-.23.11-.09.2-.2.27-.32.07-.12.12-.25.15-.39.03-.14.05-.28.05-.42s-.02-.28-.05-.42c-.03-.14-.08-.27-.15-.39-.07-.12-.16-.23-.27-.32-.11-.09-.24-.17-.38-.23-.14-.06-.29-.11-.45-.14-.16-.03-.33-.05-.5-.05zm-4.906 0c-.17 0-.34.02-.5.05-.16.03-.31.08-.45.14-.14.06-.27.14-.38.23-.11.09-.2.2-.27.32-.07.12-.12.25-.15.39-.03.14-.05.28-.05.42s.02.28.05.42c.03.14.08.27.15.39.07.12.16.23.27.32.11.09.24.17.38.23.14.06.29.11.45.14.16.03.33.05.5.05s.34-.02.5-.05c.16-.03.31-.08.45-.14.14-.06.27-.14.38-.23.11-.09.2-.2.27-.32.07-.12.12-.25.15-.39.03-.14.05-.28.05-.42s-.02-.28-.05-.42c-.03-.14-.08-.27-.15-.39-.07-.12-.16-.23-.27-.32-.11-.09-.24-.17-.38-.23-.14-.06-.29-.11-.45-.14-.16-.03-.33-.05-.5-.05z"/>
                          </svg>
                        )}
                        @{ref.social.username}
                      </a>
                    )}
                    <span style={{ 
                      fontSize: '12px',
                      padding: '4px 10px',
                      background: '#0066ff',
                      borderRadius: '4px',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 500
                    }}>
                      🌍 {ref.country}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in">
      <RichPanel title="Curriculum Vitae" icon="📄" electric>
        <p style={{ fontSize: '13px', color: 'var(--rf-text-muted)', marginBottom: '16px' }}>
          +12 años de experiencia como Full Stack Developer, especializado en arquitecturas cloud, 
          microservicios y desarrollo de productos bancarios. Actualmente cursando Maestría en 
          Inteligencia Artificial en la Universidad de los Andes.
        </p>
      </RichPanel>

      <RichTabPanel tabs={tabs} defaultTab="experience" />
    </div>
  );
}

