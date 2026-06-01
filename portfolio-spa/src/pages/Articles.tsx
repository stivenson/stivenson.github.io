import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RichPanel, RetroIcon, Tag } from '../components';
import { PageShell, GlowCard } from '../components';
import { staggerContainer, staggerItem } from '../components/motion/variants';
import { getAllArticles } from '../data/articles';

export function Articles() {
  const articles = getAllArticles();

  return (
    <PageShell>
      <RichPanel title="Artículos" icon="📝" electric>
        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--rf-text-muted)' }}>
            <RetroIcon emoji="📭" size={48} />
            <p style={{ marginTop: '16px', fontSize: 'var(--font-size-base)' }}>
              No hay artículos disponibles aún.
            </p>
          </div>
        ) : (
          <motion.div
            style={{ display: 'grid', gap: '20px', marginTop: '16px' }}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {articles.map((article) => (
              <motion.div key={article.metadata.slug} variants={staggerItem}>
                <Link to={`/articles/${article.metadata.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <GlowCard>
                    <p className="eyebrow" style={{ marginBottom: '8px' }}>
                      {article.metadata.tags[0] ?? 'Artículo'}
                    </p>
                    <h2 style={{
                      fontSize: 'clamp(18px, 3vw, 22px)',
                      fontWeight: 600,
                      color: 'var(--electric-cyan)',
                      marginBottom: '10px',
                      lineHeight: 1.3,
                    }}>
                      {article.metadata.title}
                    </h2>
                    <p className="editorial" style={{ color: 'var(--rf-text-muted)', marginBottom: '12px' }}>
                      {article.metadata.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                      {article.metadata.tags.map((tag) => (
                        <Tag key={tag} electric>{tag}</Tag>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="date-mono" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <RetroIcon emoji="📅" size={13} />
                        {new Date(article.metadata.date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--electric-blue)', fontFamily: 'var(--font-mono)' }}>
                        Leer →
                      </span>
                    </div>
                  </GlowCard>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </RichPanel>
    </PageShell>
  );
}
