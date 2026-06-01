import { motion } from 'framer-motion';
import { TagList, RetroIcon } from '../components';
import { PageShell, Section, StatCard, GlowCard, BentoGrid } from '../components';
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

  return (
    <PageShell>
      {/* Hero — bento row */}
      <Section>
        <BentoGrid>
          {/* Welcome hero — 8 cols */}
          <GlowCard className="bento-col-8">
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Avatar with glow ring */}
              <motion.div
                className="avatar-glow"
                style={{
                  width: '96px',
                  height: '96px',
                  minWidth: '96px',
                  borderRadius: '16px',
                  background: 'var(--electric-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '42px',
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <div style={{
                  width: '70%',
                  height: '70%',
                  borderRadius: '10px',
                  background: '#0a0a2e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{
                    width: '50%',
                    height: '60%',
                    borderRadius: '6px',
                    background: 'var(--electric-blue)',
                  }} />
                </div>
              </motion.div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <p className="eyebrow" style={{ marginBottom: '6px' }}>Perfil</p>
                <motion.h1
                  style={{
                    fontSize: 'clamp(20px, 4vw, 28px)',
                    fontWeight: 700,
                    marginBottom: '6px',
                    background: 'linear-gradient(90deg, var(--electric-blue), var(--electric-cyan))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {personal.name}
                </motion.h1>
                <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--rf-text-muted)', marginBottom: '12px' }}>
                  {personal.title}
                </p>
                <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--electric-cyan)',
                    border: '1px solid rgba(85,170,255,0.35)',
                    borderRadius: '12px',
                    padding: '3px 10px',
                    marginBottom: '12px',
                    textDecoration: 'none',
                    background: 'rgba(85,170,255,0.08)',
                    transition: 'background var(--transition-base)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  🔬 Investigador CvLAC · Minciencias
                </a>
                <blockquote style={{
                  fontSize: 'var(--font-size-sm)',
                  fontStyle: 'italic',
                  color: 'rgba(232,232,240,0.85)',
                  padding: '8px 12px',
                  background: 'var(--card-accent-bg)',
                  borderRadius: 'var(--border-radius-sm)',
                  borderLeft: '3px solid var(--electric-blue)',
                  margin: 0,
                }}>
                  "{personal.motto}"
                </blockquote>
              </div>
            </div>
          </GlowCard>

          {/* Current role — 4 cols */}
          <GlowCard className="bento-col-4">
            <p className="eyebrow" style={{ marginBottom: '10px' }}>Posición Actual</p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--electric-blue), var(--electric-cyan))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <RetroIcon emoji="🤖" size={20} />
              </div>
              <div>
                <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--electric-cyan)', marginBottom: '2px' }}>
                  {currentRole.company}
                </p>
                <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: '4px' }}>
                  {currentRole.role}
                </p>
                <p className="date-mono">{currentRole.period}</p>
              </div>
            </div>
            <TagList tags={currentRole.technologies.slice(0, 6)} electric />
          </GlowCard>
        </BentoGrid>
      </Section>

      {/* Stats row */}
      <ScrollReveal>
        <Section title="Resumen">
          <BentoGrid>
            <StatCard
              className="bento-col-3"
              value="12+"
              label="Años Exp."
            />
            <StatCard
              className="bento-col-3"
              value={`${experience.length}+`}
              label="Empresas"
            />
            <StatCard
              className="bento-col-3"
              value={`${allTechnologies.length}+`}
              label="Tecnologías"
            />
            <StatCard
              className="bento-col-3"
              value="MSc"
              label="IA en curso"
            />
          </BentoGrid>
        </Section>
      </ScrollReveal>

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
