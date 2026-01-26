import { motion } from 'framer-motion';
import { RichPanel, RichTabPanel, RetroIcon } from '../components';
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
    <div className="animate-fade-in">
      <RichPanel title="Sobre Mí" icon="👤" electric>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              width: '100px',
              height: '100px',
              minWidth: '70px',
              minHeight: '70px',
              borderRadius: '16px',
              background: 'var(--electric-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--electric-shadow)',
              flexShrink: 0
            }}
          >
            <div style={{
              width: '70%',
              height: '70%',
              borderRadius: '8px',
              background: '#ffffff',
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
          </motion.div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ 
              fontSize: 'clamp(18px, 4vw, 22px)', 
              marginBottom: '8px',
              color: 'var(--electric-blue)'
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
            <p style={{ 
              fontSize: '13px', 
              fontStyle: 'italic', 
              color: 'var(--rf-text-muted)',
              padding: '12px',
              background: 'rgba(0, 102, 255, 0.05)',
              borderRadius: '6px',
              borderLeft: '3px solid var(--electric-blue)'
            }}>
              Ingeniero de Sistemas apasionado por la tecnología con propósito social. 
              Creo que el código debe servir a la gente y transformar realidades.
            </p>
          </div>
        </div>
      </RichPanel>

      <RichTabPanel tabs={tabs} defaultTab="origins" />
    </div>
  );
}

function QuestionAnswer({ question, answer }: { question: string; answer: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        padding: '12px 16px',
        background: 'rgba(0, 102, 255, 0.03)',
        borderLeft: '3px solid var(--electric-blue)',
        borderRadius: '0 6px 6px 0'
      }}
    >
      <div style={{ 
        fontWeight: 600, 
        fontSize: '13px', 
        marginBottom: '6px',
        color: 'var(--electric-blue)'
      }}>
        {question}
      </div>
      <div style={{ 
        fontSize: '13px', 
        color: 'var(--rf-text-muted)',
        lineHeight: '1.6'
      }}>
        {answer}
      </div>
    </motion.div>
  );
}

