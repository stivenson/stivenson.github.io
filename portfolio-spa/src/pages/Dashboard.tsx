import { motion } from 'framer-motion';
import { RichPanel, TagList, RetroIcon } from '../components';
import profileData from '../data/profile.json';

export function Dashboard() {
  const { personal, skills, achievements, experience } = profileData;
  
  const allTechnologies = [
    ...skills.languages,
    ...skills.frontend,
    ...(skills.ai || []),
    ...skills.cloud.slice(0, 5),
    ...skills.devops.slice(0, 3),
  ];

  return (
    <div className="animate-fade-in">
      {/* Welcome Panel */}
      <RichPanel title="Bienvenido" icon="⚡" electric>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{
            width: '120px',
            height: '120px',
            minWidth: '80px',
            minHeight: '80px',
            borderRadius: '16px',
            background: 'var(--electric-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--electric-shadow)',
            flexShrink: 0
          }}>
            <div style={{
              width: '70%',
              height: '70%',
              borderRadius: '8px',
              background: '#0a0a2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '50%',
                height: '60%',
                borderRadius: '6px',
                background: 'var(--electric-blue)'
              }} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ 
              fontSize: 'clamp(18px, 4vw, 24px)', 
              marginBottom: '8px',
              background: 'linear-gradient(90deg, var(--electric-blue), var(--electric-cyan))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {personal.name}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--rf-text-muted)', marginBottom: '12px' }}>
              {personal.title}
            </p>
            <p style={{ fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RetroIcon emoji="📍" size={14} />
              {personal.location}
            </p>
            <a
              href="https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001402041"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: 'var(--electric-cyan)',
                border: '1px solid var(--electric-cyan)',
                borderRadius: '12px',
                padding: '3px 10px',
                marginBottom: '8px',
                textDecoration: 'none',
                background: 'rgba(85, 170, 255, 0.08)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(85, 170, 255, 0.18)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(85, 170, 255, 0.08)')}
            >
              🔬 Investigador registrado en CvLAC · Minciencias
            </a>
            <p style={{
              fontSize: '12px',
              fontStyle: 'italic',
              color: 'rgba(255, 255, 255, 0.85)',
              padding: '8px 12px',
              background: 'var(--card-accent-bg)',
              borderRadius: '4px',
              borderLeft: '3px solid var(--electric-blue)'
            }}>
              "{personal.motto}"
            </p>
          </div>
        </div>
      </RichPanel>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {/* Quick Stats */}
        <RichPanel title="Resumen Rápido" icon="📊">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              style={{ 
                padding: '16px', 
                background: 'var(--card-accent-bg)',
                borderRadius: '6px',
                textAlign: 'center',
                border: '1px solid var(--rf-border)'
              }}
            >
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--electric-blue)' }}>
                {experience.length}+
              </div>
              <div style={{ fontSize: '11px', color: 'var(--rf-text-muted)' }}>
                Empresas
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              style={{ 
                padding: '16px', 
                background: 'var(--card-accent-bg)',
                borderRadius: '6px',
                textAlign: 'center',
                border: '1px solid var(--rf-border)'
              }}
            >
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--electric-blue)' }}>
                12+
              </div>
              <div style={{ fontSize: '11px', color: 'var(--rf-text-muted)' }}>
                Años Exp.
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              style={{ 
                padding: '16px', 
                background: 'var(--card-accent-bg)',
                borderRadius: '6px',
                textAlign: 'center',
                border: '1px solid var(--rf-border)'
              }}
            >
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--electric-blue)' }}>
                {allTechnologies.length}+
              </div>
              <div style={{ fontSize: '11px', color: 'var(--rf-text-muted)' }}>
                Tecnologías
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              style={{ 
                padding: '16px', 
                background: 'var(--card-accent-bg)',
                borderRadius: '6px',
                textAlign: 'center',
                border: '1px solid var(--rf-border)'
              }}
            >
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--electric-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RetroIcon emoji="🎓" size={28} />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--rf-text-muted)' }}>
                MSc IA (en curso)
              </div>
            </motion.div>
          </div>
        </RichPanel>

        {/* Technologies */}
        <RichPanel title="Stack Tecnológico" icon="🛠️">
          <TagList tags={allTechnologies} electric />
        </RichPanel>
      </div>

      {/* Achievements */}
      <RichPanel title="Logros Destacados" icon="🏆">
        <div className="rf-cards-grid">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              className="rf-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="rf-card-header">
                {achievement.title}
              </div>
              <div className="rf-card-body">
                <p style={{ fontSize: '12px', color: 'var(--rf-text-muted)' }}>
                  {achievement.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </RichPanel>

      {/* Current Position */}
      <RichPanel title="Posición Actual" icon="💼" electric>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--electric-blue) 0%, var(--electric-cyan) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: 'var(--electric-shadow)'
          }}>
            <RetroIcon emoji="🤖" size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', marginBottom: '4px', color: 'var(--electric-blue)' }}>
              {experience[0].company}
            </h3>
            <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
              {experience[0].role}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--rf-text-muted)', marginBottom: '12px' }}>
              {experience[0].period} • {experience[0].modality}
            </p>
            <TagList tags={experience[0].technologies} electric />
          </div>
        </div>
      </RichPanel>
    </div>
  );
}

