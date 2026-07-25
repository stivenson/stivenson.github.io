import { RichTabPanel, Icon, CommandLine } from '../components';
import { PageShell } from '../components';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import profileData from '../data/profile.json';

export function About() {
  const { about, personal } = profileData;

  const tabs = [
    {
      id: 'origins',
      label: 'Orígenes',
      icon: '🌱',
      content: (
        <div style={{ display: 'grid', gap: '16px' }}>
          <QuestionAnswer 
            question="Nací en:" 
            answer={about.origins.birthplace + " a finales del siglo XX."} 
          />
          <QuestionAnswer 
            question="Yo era un niño:" 
            answer={about.origins.childhood} 
          />
          <QuestionAnswer 
            question="El sueño de mi infancia era:" 
            answer={about.origins.childhoodDream} 
          />
          <QuestionAnswer 
            question="Mi primer recuerdo es:" 
            answer={about.origins.firstMemory} 
          />
          <QuestionAnswer 
            question="El pasatiempo de la infancia que más ha moldeado mi personalidad es:" 
            answer={about.origins.hobbies} 
          />
        </div>
      )
    },
    {
      id: 'philosophy',
      label: 'Filosofía',
      icon: '💭',
      content: (
        <div style={{ display: 'grid', gap: '16px' }}>
          <QuestionAnswer 
            question="Mi principal creencia en la vida es:" 
            answer={about.philosophy.mainBelief} 
          />
          <QuestionAnswer 
            question="Estoy impulsado por mi pasión de:" 
            answer={about.philosophy.passion} 
          />
          <QuestionAnswer 
            question="Mi lema en la vida es:" 
            answer={`"${personal.motto}"`} 
          />
          <div>
            <div style={{ 
              fontWeight: 600, 
              fontSize: '13px', 
              marginBottom: '8px',
              color: 'var(--electric-blue)'
            }}>
              ¿Cuáles son los valores más importantes en la vida?
            </div>
            <ul style={{ 
              fontSize: '13px', 
              color: 'var(--rf-text-muted)',
              paddingLeft: '20px',
              lineHeight: '1.8'
            }}>
              {about.philosophy.values.map((value, i) => (
                <li key={i}>{value}</li>
              ))}
            </ul>
          </div>
          <QuestionAnswer 
            question="Una frase que nunca olvidaré es:" 
            answer={about.philosophy.favoriteQuote} 
          />
          <QuestionAnswer 
            question="Mi libro/película/autor favorito es:" 
            answer={`${about.philosophy.favoriteAuthor}, y la película ${about.philosophy.favoriteMovie}.`} 
          />
        </div>
      )
    },
    {
      id: 'dreams',
      label: 'Sueños',
      icon: '🎯',
      content: (
        <div style={{ display: 'grid', gap: '16px' }}>
          <QuestionAnswer 
            question="El sueño de mi vida es:" 
            answer={about.dreams.lifeDream} 
          />
          <QuestionAnswer 
            question="Si tan sólo uno de mis sueños pudiera hacerse realidad, desearía que:" 
            answer={about.dreams.biggestWish} 
          />
          <div>
            <div style={{ 
              fontWeight: 600, 
              fontSize: '13px', 
              marginBottom: '8px',
              color: 'var(--electric-blue)'
            }}>
              ¿Qué lugares me gustaría visitar?
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {about.dreams.placesToVisit.map(place => (
                <span key={place} className="rf-tag electric">{place}</span>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'future',
      label: 'Futuro',
      icon: '🚀',
      content: (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <div style={{ 
              fontWeight: 600, 
              fontSize: '13px', 
              marginBottom: '8px',
              color: 'var(--electric-blue)'
            }}>
              ¿Cuáles son mis objetivos para el futuro?
            </div>
            <ul style={{ 
              fontSize: '13px', 
              color: 'var(--rf-text-muted)',
              paddingLeft: '20px',
              lineHeight: '1.8'
            }}>
              {about.future.goals.map((goal, i) => (
                <li key={i}>{goal}</li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ 
              fontWeight: 600, 
              fontSize: '13px', 
              marginBottom: '8px',
              color: 'var(--electric-blue)'
            }}>
              ¿Qué habilidades me gustaría desarrollar?
            </div>
            <ul style={{ 
              fontSize: '13px', 
              color: 'var(--rf-text-muted)',
              paddingLeft: '20px',
              lineHeight: '1.8'
            }}>
              {about.future.skillsToDevelope.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'personal',
      label: 'Personal',
      icon: '🎭',
      content: (
        <div style={{ display: 'grid', gap: '16px' }}>
          <QuestionAnswer 
            question="¿Cuáles adjetivos se pueden usar para describirme?" 
            answer={about.personality.adjectives} 
          />
          <QuestionAnswer 
            question="¿Quién ha influido en mi desarrollo personal?" 
            answer={about.personality.influences} 
          />
          <QuestionAnswer 
            question="Un evento que influyó en lo que soy hoy es:" 
            answer={about.personality.keyEvent} 
          />
        </div>
      )
    },
    {
      id: 'gratitude',
      label: 'Gratitud',
      icon: '🙏',
      content: (
        <div style={{ display: 'grid', gap: '16px' }}>
          <QuestionAnswer 
            question="Estoy agradecido a mis padres por:" 
            answer={about.gratitude.toParents} 
          />
          <QuestionAnswer 
            question="La lección principal que mis padres me enseñaron fue:" 
            answer={about.gratitude.mainLesson} 
          />
          <QuestionAnswer 
            question="Mi modelo a seguir es:" 
            answer={about.gratitude.roleModel} 
          />
        </div>
      )
    }
  ];

  return (
    <PageShell>
      <CommandLine command="whoami --about">
        <span style={{ display: 'block', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
          <strong style={{ color: 'var(--electric-cyan)' }}>{personal.name}</strong>
          {' — '}{personal.title}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)' }}>
          <Icon name="pin" size={14} />
          {personal.location}
        </span>
        <span style={{ display: 'block', marginTop: '10px' }}>
          Ingeniero de Sistemas apasionado por la tecnología con propósito social.
          Creo que el código debe servir a la gente y transformar realidades.
        </span>
      </CommandLine>

      <ScrollReveal>
        <RichTabPanel tabs={tabs} defaultTab="origins" />
      </ScrollReveal>
    </PageShell>
  );
}

function QuestionAnswer({ question, answer }: { question: string; answer: string }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: 'var(--card-accent-bg-light, rgba(76,89,211,0.06))',
      borderLeft: '2px solid var(--electric-blue)',
      borderRadius: '0 var(--border-radius-md) var(--border-radius-md) 0',
    }}>
      <p className="eyebrow" style={{ marginBottom: '6px' }}>{question}</p>
      <p className="editorial" style={{ color: 'var(--rf-text)' }}>{answer}</p>
    </div>
  );
}

