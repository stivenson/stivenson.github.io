import { RichPanel, RichTabPanel, Timeline, TagList } from '../components';
import profileData from '../data/profile.json';

export function Resume() {
  const { experience, education, courses, skills } = profileData;

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
              Metodologías
            </h4>
            <TagList tags={skills.methodologies} electric />
          </div>
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

