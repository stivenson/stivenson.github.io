import { motion } from 'framer-motion';
import { RichPanel, RichTabPanel, Timeline, TagList } from '../components';
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
            },
            {
              title: 'Dashboard - Simulación de Rendimiento',
              url: 'https://dashboard-1-simulaci-n-de-rendimiento-instant-neo-952576018707.us-west1.run.app/',
              tool: 'Google AI Studio',
              role: 'Acompañamiento',
              technologies: ['Python', 'Streamlit', 'Google Cloud', 'AI Studio', 'Machine Learning']
            },
            {
              title: 'Dashboard - Predicción de Irradiancia Solar',
              url: 'https://dashboard-2-predicci-n-de-irradiancia-solar-regre-952576018707.us-west1.run.app/',
              tool: 'Google AI Studio',
              role: 'Acompañamiento',
              technologies: ['Python', 'Streamlit', 'Google Cloud', 'AI Studio', 'Regression', 'ML']
            },
            {
              title: 'Dashboard - Clasificación de Potencial Solar',
              url: 'https://dashboard-3-clasificaci-n-de-potencial-solar-clas-952576018707.us-west1.run.app/',
              tool: 'Google AI Studio',
              role: 'Acompañamiento',
              technologies: ['Python', 'Streamlit', 'Google Cloud', 'AI Studio', 'Classification', 'ML']
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
                  {project.tool === 'Cursor' ? '⚡' : project.tool === 'AntiGravity' ? '🚀' : '🌐'}
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
                      background: 'rgba(0, 102, 255, 0.1)',
                      borderRadius: '4px',
                      color: 'var(--electric-blue)',
                      fontWeight: 500
                    }}>
                      {project.tool}
                    </span>
                    <span style={{ 
                      fontSize: '11px',
                      padding: '2px 8px',
                      background: 'rgba(0, 229, 255, 0.1)',
                      borderRadius: '4px',
                      color: 'var(--electric-cyan)',
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
                    🔗 <span style={{ fontSize: '11px' }}>{project.url.length > 50 ? project.url.substring(0, 50) + '...' : project.url}</span>
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
                    <span style={{ 
                      fontSize: '12px',
                      padding: '4px 10px',
                      background: 'rgba(0, 102, 255, 0.1)',
                      borderRadius: '4px',
                      color: 'var(--electric-blue)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      📞 {ref.phone}
                    </span>
                    <span style={{ 
                      fontSize: '12px',
                      padding: '4px 10px',
                      background: 'rgba(0, 229, 255, 0.1)',
                      borderRadius: '4px',
                      color: 'var(--electric-cyan)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
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
          +8 años de experiencia como Full Stack Developer, especializado en arquitecturas cloud, 
          microservicios y desarrollo de productos bancarios. Actualmente cursando Maestría en 
          Inteligencia Artificial en la Universidad de los Andes.
        </p>
      </RichPanel>

      <RichTabPanel tabs={tabs} defaultTab="experience" />
    </div>
  );
}

