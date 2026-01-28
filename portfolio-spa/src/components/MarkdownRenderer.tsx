import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import { InteractiveSVG } from './InteractiveSVG';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const components: Components = {
    // Encabezados con estilos eléctricos
    h1: ({ node, ...props }) => (
      <h1 
        style={{
          fontSize: 'clamp(24px, 5vw, 32px)',
          fontWeight: 700,
          color: 'var(--electric-blue)',
          marginTop: '32px',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '2px solid var(--electric-cyan)',
          lineHeight: 1.3
        }}
        {...props}
      />
    ),
    h2: ({ node, ...props }) => (
      <h2 
        style={{
          fontSize: 'clamp(20px, 4vw, 26px)',
          fontWeight: 600,
          color: 'var(--electric-blue)',
          marginTop: '28px',
          marginBottom: '14px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(0, 229, 255, 0.3)',
          lineHeight: 1.4
        }}
        {...props}
      />
    ),
    h3: ({ node, ...props }) => (
      <h3 
        style={{
          fontSize: 'clamp(18px, 3vw, 22px)',
          fontWeight: 600,
          color: 'var(--electric-cyan)',
          marginTop: '24px',
          marginBottom: '12px',
          lineHeight: 1.4
        }}
        {...props}
      />
    ),
    h4: ({ node, ...props }) => (
      <h4 
        style={{
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          fontWeight: 600,
          color: 'var(--electric-cyan)',
          marginTop: '20px',
          marginBottom: '10px',
          lineHeight: 1.4
        }}
        {...props}
      />
    ),
    
    // Párrafos
    p: ({ node, ...props }) => (
      <p 
        style={{
          fontSize: '15px',
          lineHeight: 1.8,
          color: 'var(--rf-text)',
          marginBottom: '16px',
          textAlign: 'justify'
        }}
        {...props}
      />
    ),
    
    // Listas
    ul: ({ node, ...props }) => (
      <ul 
        style={{
          marginLeft: '24px',
          marginBottom: '16px',
          fontSize: '15px',
          lineHeight: 1.8,
          color: 'var(--rf-text)'
        }}
        {...props}
      />
    ),
    ol: ({ node, ...props }) => (
      <ol 
        style={{
          marginLeft: '24px',
          marginBottom: '16px',
          fontSize: '15px',
          lineHeight: 1.8,
          color: 'var(--rf-text)'
        }}
        {...props}
      />
    ),
    li: ({ node, ...props }) => (
      <li 
        style={{
          marginBottom: '8px',
          lineHeight: 1.8
        }}
        {...props}
      />
    ),
    
    // Enlaces
    a: ({ node, ...props }) => (
      <a 
        style={{
          color: 'var(--electric-cyan)',
          textDecoration: 'underline',
          textDecorationColor: 'rgba(0, 229, 255, 0.5)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--electric-blue)';
          e.currentTarget.style.textDecorationColor = 'var(--electric-blue)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--electric-cyan)';
          e.currentTarget.style.textDecorationColor = 'rgba(0, 229, 255, 0.5)';
        }}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
    
    // Imágenes - detectar SVG interactivo
    img: ({ node, src, alt, ...props }: any) => {
      if (!src) return null;

      // Detectar SVG interactivo específico
      if (src.includes('Agent-Mcp-Skills.svg')) {
        // Resolver ruta: construir ruta completa desde src/data/articles/
        let resolvedSrc = src;
        if (src.startsWith('image/')) {
          // Ruta relativa: construir ruta absoluta desde la raíz del proyecto
          resolvedSrc = `/src/data/articles/${src}`;
        } else if (!src.startsWith('http') && !src.startsWith('/')) {
          // Si es relativa, asumir que está en articles/
          resolvedSrc = `/src/data/articles/${src}`;
        }
        return <InteractiveSVG src={resolvedSrc} alt={alt} />;
      }

      // Comportamiento normal para otras imágenes
      let resolvedSrc = src;
      if (src.startsWith('image/')) {
        resolvedSrc = `/src/data/articles/${src}`;
      } else if (!src.startsWith('http') && !src.startsWith('/')) {
        resolvedSrc = `/src/data/articles/${src}`;
      }

      return (
        <img
          src={resolvedSrc}
          alt={alt}
          style={{
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px',
            margin: '20px 0',
            border: '1px solid rgba(0, 229, 255, 0.2)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
          {...props}
        />
      );
    },
    
    // Código inline
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      if (inline) {
        return (
          <code 
            style={{
              background: 'rgba(0, 102, 255, 0.1)',
              color: 'var(--electric-cyan)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.9em',
              fontFamily: 'monospace',
              border: '1px solid rgba(0, 229, 255, 0.2)'
            }}
            {...props}
          >
            {children}
          </code>
        );
      }
      
      return (
        <SyntaxHighlighter
          language={language || 'text'}
          style={vscDarkPlus}
          customStyle={{
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            fontSize: '14px',
            border: '1px solid rgba(0, 229, 255, 0.2)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    },
    
    // Bloques de código (pre) - se maneja en el componente code
    pre: ({ node, children, ...props }: any) => (
      <div style={{ marginBottom: '20px' }} {...props}>
        {children}
      </div>
    ),
    
    // Citas
    blockquote: ({ node, ...props }) => (
      <blockquote 
        style={{
          borderLeft: '4px solid var(--electric-blue)',
          paddingLeft: '20px',
          marginLeft: '0',
          marginRight: '0',
          marginTop: '20px',
          marginBottom: '20px',
          paddingTop: '12px',
          paddingBottom: '12px',
          background: 'rgba(0, 102, 255, 0.05)',
          borderRadius: '0 6px 6px 0',
          fontStyle: 'italic',
          color: 'var(--rf-text-muted)'
        }}
        {...props}
      />
    ),
    
    // Tablas
    table: ({ node, ...props }) => (
      <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
        <table 
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            borderRadius: '6px',
            overflow: 'hidden'
          }}
          {...props}
        />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead 
        style={{
          background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.2) 0%, rgba(0, 229, 255, 0.15) 100%)',
          borderBottom: '2px solid var(--electric-cyan)'
        }}
        {...props}
      />
    ),
    tbody: ({ node, ...props }) => (
      <tbody {...props} />
    ),
    tr: ({ node, ...props }) => (
      <tr 
        style={{
          borderBottom: '1px solid rgba(0, 229, 255, 0.2)',
          transition: 'background 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 229, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
        {...props}
      />
    ),
    th: ({ node, ...props }) => (
      <th 
        style={{
          padding: '12px 16px',
          textAlign: 'left',
          fontWeight: 600,
          color: 'var(--electric-blue)',
          fontSize: '14px'
        }}
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td 
        style={{
          padding: '12px 16px',
          fontSize: '14px',
          color: 'var(--rf-text)',
          lineHeight: 1.6
        }}
        {...props}
      />
    ),
    
    // Línea horizontal
    hr: ({ node, ...props }) => (
      <hr 
        style={{
          border: 'none',
          borderTop: '2px solid var(--electric-cyan)',
          margin: '32px 0',
          opacity: 0.5
        }}
        {...props}
      />
    ),
    
    // Texto fuerte y énfasis
    strong: ({ node, ...props }) => (
      <strong 
        style={{
          fontWeight: 700,
          color: 'var(--rf-text)'
        }}
        {...props}
      />
    ),
    em: ({ node, ...props }) => (
      <em 
        style={{
          fontStyle: 'italic',
          color: 'var(--rf-text)'
        }}
        {...props}
      />
    )
  };

  return (
    <div className="markdown-content" style={{ maxWidth: '100%' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
