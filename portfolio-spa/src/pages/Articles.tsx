import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RichPanel, RetroIcon, Tag } from '../components';
import { getAllArticles } from '../data/articles';

export function Articles() {
  const articles = getAllArticles();

  return (
    <div className="animate-fade-in">
      <RichPanel title="Artículos" icon="📝" electric>
        <div style={{ 
          display: 'grid', 
          gap: '20px',
          marginTop: '16px'
        }}>
          {articles.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: 'var(--rf-text-muted)'
            }}>
              <RetroIcon emoji="📭" size={48} />
              <p style={{ marginTop: '16px', fontSize: '14px' }}>
                No hay artículos disponibles aún.
              </p>
            </div>
          ) : (
            articles.map((article, index) => (
              <motion.div
                key={article.metadata.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/articles/${article.metadata.slug}`}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  <div
                    style={{
                      padding: '20px',
                      background: 'var(--card-accent-bg-lighter)',
                      border: '1px solid var(--border-glow)',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--card-accent-bg)';
                      e.currentTarget.style.borderColor = 'var(--electric-cyan)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px var(--border-glow)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--card-accent-bg-lighter)';
                      e.currentTarget.style.borderColor = 'var(--border-glow)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(76, 89, 211, 0.12) 0%, rgba(85, 170, 255, 0.05) 100%)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none'
                    }}
                    className="article-hover-gradient"
                    />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <h2 style={{
                        fontSize: 'clamp(18px, 3vw, 22px)',
                        fontWeight: 600,
                        color: 'var(--electric-blue)',
                        marginBottom: '12px',
                        lineHeight: 1.3
                      }}>
                        {article.metadata.title}
                      </h2>
                      
                      <p style={{
                        fontSize: '14px',
                        color: 'var(--rf-text-muted)',
                        marginBottom: '12px',
                        lineHeight: 1.6
                      }}>
                        {article.metadata.description}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        {article.metadata.tags.map((tag) => (
                          <Tag key={tag} electric>{tag}</Tag>
                        ))}
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '12px',
                        color: 'var(--rf-text-muted)'
                      }}>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <RetroIcon emoji="📅" size={14} />
                          {new Date(article.metadata.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#7878a0'
                        }}>
                          Leer más
                          <RetroIcon emoji="→" size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </RichPanel>
    </div>
  );
}
