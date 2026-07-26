import { motion } from 'framer-motion';
import { AIOrbitScene, TagList, GlowCard, TerminalHero } from '../components';
import type { TermLine } from '../components';
import { PageShell, Section } from '../components';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { staggerContainer, staggerItem } from '../components/motion/variants';
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

  const currentRole = experience[0];

  // Terminal transcript — grounded entirely in profile.json.
  const heroLines: TermLine[] = [
    { kind: 'cmd', text: 'whoami' },
    { kind: 'out', content: <span className="accent">{personal.name}</span> },
    { kind: 'out', content: personal.title },
    { kind: 'gap' },
    { kind: 'cmd', text: 'cat mision.txt' },
    { kind: 'out', content: `"${personal.motto}"` },
    { kind: 'gap' },
    { kind: 'cmd', text: './perfil --resumen' },
    { kind: 'kv', k: 'exp', v: `12 años · ${experience.length} empresas` },
    { kind: 'kv', k: 'foco', v: 'IA · agentes · full stack' },
    { kind: 'kv', k: 'actual', v: currentRole.company },
    { kind: 'kv', k: 'grado', v: 'MSc en IA · en curso' },
    { kind: 'kv', k: 'registro', v: 'CvLAC · Minciencias' },
    { kind: 'kv', k: 'base', v: personal.location },
  ];

  return (
    <PageShell>
      {/* Hero — signature terminal + professional AI orbit */}
      <Section className="portfolio-hero-section">
        <div className="portfolio-hero-grid">
          <TerminalHero
            path="stivenson@cucuta:~/perfil"
            shell="zsh"
            lines={heroLines}
          />
          <AIOrbitScene />
        </div>
      </Section>

      {/* Tech stack */}
      <ScrollReveal delay={0.05}>
        <Section title="Stack Tecnológico">
          <GlowCard>
            <TagList tags={allTechnologies} electric />
          </GlowCard>
        </Section>
      </ScrollReveal>

      {/* Achievements */}
      <ScrollReveal delay={0.05}>
        <Section title="Logros Destacados">
          <motion.div
            className="rf-cards-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.title}
                variants={staggerItem}
                className="glow-card"
                style={{ padding: 'var(--space-lg)' }}
                whileHover={{ y: -4 }}
              >
                <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '6px', color: 'var(--electric-cyan)' }}>
                  {achievement.title}
                </p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--rf-text-muted)', lineHeight: 1.55 }}>
                  {achievement.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </Section>
      </ScrollReveal>
    </PageShell>
  );
}
