import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RichPanel, RetroIcon, MarkdownRenderer } from '../components';
import { getArticleBySlug, getAllArticles } from '../data/articles';

export function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;
  const allArticles = getAllArticles();
  
  if (!article) {
    return (
      <div className="animate-fade-in">
        <RichPanel title="Artículo no encontrado" icon="❌" electric>
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: 'var(--rf-text-muted)'
          }}>
            <p style={{ marginBottom: '20px', fontSize: '14px' }}>
              El artículo que buscas no existe.
            </p>
            <Link
              to="/articles"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'var(--electric-blue)',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--electric-cyan)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--electric-blue)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <RetroIcon emoji="←" size={16} />
              Volver a Artículos
            </Link>
          </div>
        </RichPanel>
      </div>
    );
  }

  const currentIndex = allArticles.findIndex(a => a.metadata.slug === slug);
  const previousArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;

  return (
    <div className="animate-fade-in">
      {/* Botón volver */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ marginBottom: '20px' }}
      >
        <Link
          to="/articles"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(0, 102, 255, 0.1)',
            color: '#6b7280',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 600,
            border: '1px solid rgba(0, 229, 255, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 102, 255, 0.2)';
            e.currentTarget.style.borderColor = 'var(--electric-cyan)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 102, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.3)';
          }}
        >
          <RetroIcon emoji="←" size={14} />
          Volver a Artículos
        </Link>
      </motion.div>

      {/* Encabezado del artículo */}
      <RichPanel title={article.metadata.title} icon="📝" electric>
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            marginBottom: '16px',
            fontSize: '13px',
            color: 'var(--rf-text-muted)'
          }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <RetroIcon emoji="📅" size={14} />
              {new Date(article.metadata.date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span style={{ color: 'rgba(0, 229, 255, 0.6)' }}>•</span>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              {article.metadata.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '4px 10px',
                    background: 'rgba(0, 102, 255, 0.1)',
                    color: 'var(--electric-cyan)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 500,
                    border: '1px solid rgba(0, 229, 255, 0.2)'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <p style={{
            fontSize: '15px',
            color: 'var(--rf-text-muted)',
            lineHeight: 1.6,
            fontStyle: 'italic',
            padding: '12px',
            background: 'rgba(0, 102, 255, 0.05)',
            borderRadius: '6px',
            borderLeft: '3px solid var(--electric-blue)'
          }}>
            {article.metadata.description}
          </p>
        </div>
      </RichPanel>

      {/* Contenido del artículo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'rgba(0, 102, 255, 0.02)',
          padding: '32px',
          borderRadius: '8px',
          border: '1px solid rgba(0, 229, 255, 0.1)',
          marginTop: '20px'
        }}
      >
        <MarkdownRenderer content={article.content} />
      </motion.div>

      {/* Navegación entre artículos */}
      {(previousArticle || nextArticle) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'grid',
            gridTemplateColumns: previousArticle && nextArticle ? '1fr 1fr' : '1fr',
            gap: '16px',
            marginTop: '32px'
          }}
        >
          {previousArticle && (
            <Link
              to={`/articles/${previousArticle.metadata.slug}`}
              style={{
                display: 'block',
                padding: '16px',
                background: 'rgba(0, 102, 255, 0.05)',
                border: '1px solid rgba(0, 229, 255, 0.2)',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 102, 255, 0.1)';
                e.currentTarget.style.borderColor = 'var(--electric-cyan)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 102, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.2)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                fontSize: '12px',
                color: 'var(--rf-text-muted)'
              }}>
                <RetroIcon emoji="←" size={14} />
                Artículo anterior
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--electric-blue)'
              }}>
                {previousArticle.metadata.title}
              </div>
            </Link>
          )}
          
          {nextArticle && (
            <Link
              to={`/articles/${nextArticle.metadata.slug}`}
              style={{
                display: 'block',
                padding: '16px',
                background: 'rgba(0, 102, 255, 0.05)',
                border: '1px solid rgba(0, 229, 255, 0.2)',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                textAlign: previousArticle ? 'right' : 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 102, 255, 0.1)';
                e.currentTarget.style.borderColor = 'var(--electric-cyan)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 102, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.2)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                fontSize: '12px',
                color: 'var(--rf-text-muted)',
                justifyContent: previousArticle ? 'flex-end' : 'flex-start'
              }}>
                Artículo siguiente
                <RetroIcon emoji="→" size={14} />
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--electric-blue)'
              }}>
                {nextArticle.metadata.title}
              </div>
            </Link>
          )}
        </motion.div>
      )}
    </div>
  );
}
