import { RichTabPanel, Icon } from '../components';
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
    <PageShell className="lore-page">
      <header className="lore-heading">
        <div>
          <p className="journey-kicker">CÓDICE PERSONAL · HISTORIAS Y VALORES</p>
          <h1>Sobre mí</h1>
          <p>Una mirada a mis orígenes, ideas y aspiraciones, más allá de los cargos y la tecnología.</p>
        </div>
        <div className="lore-identity">
          <span className="lore-identity-mark" aria-hidden="true">✳</span>
          <span><strong>{personal.name}</strong><small>{personal.title}</small></span>
          <span className="lore-location"><Icon name="pin" size={13} />{personal.location}</span>
        </div>
      </header>

      <ScrollReveal>
        <div className="lore-panel-frame">
          <RichTabPanel tabs={tabs} defaultTab="origins" />
        </div>
      </ScrollReveal>
    </PageShell>
  );
}

function QuestionAnswer({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="lore-answer">
      <p className="eyebrow">{question}</p>
      <p className="editorial">{answer}</p>
    </div>
  );
}

