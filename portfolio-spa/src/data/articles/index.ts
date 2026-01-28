import agentSkillsVsMcp from './agent-skills-vs-mcp.md?raw';

export interface ArticleMetadata {
  title: string;
  date: string;
  slug: string;
  description: string;
  tags: string[];
}

export interface Article {
  metadata: ArticleMetadata;
  content: string;
}

// Función para parsear frontmatter YAML
function parseFrontmatter(content: string): { frontmatter: ArticleMetadata; body: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    throw new Error('Invalid frontmatter format');
  }
  
  const frontmatterText = match[1];
  const body = match[2];
  
  // Parsear YAML básico (solo para nuestros casos de uso simples)
  const metadata: Partial<ArticleMetadata> = {};
  const lines = frontmatterText.split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();
    
    // Remover comillas si existen
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    if (key === 'tags') {
      // Parsear array de tags
      const tagsMatch = value.match(/\[(.*?)\]/);
      if (tagsMatch) {
        metadata.tags = tagsMatch[1]
          .split(',')
          .map(tag => tag.trim().replace(/^["']|["']$/g, ''))
          .filter(tag => tag.length > 0);
      }
    } else if (key === 'date') {
      metadata.date = value;
    } else if (key === 'slug') {
      metadata.slug = value;
    } else if (key === 'title') {
      metadata.title = value;
    } else if (key === 'description') {
      metadata.description = value;
    }
  }
  
  return {
    frontmatter: metadata as ArticleMetadata,
    body
  };
}

// Procesar artículos
function processArticle(content: string): Article {
  const { frontmatter, body } = parseFrontmatter(content);
  return {
    metadata: frontmatter,
    content: body
  };
}

// Exportar artículos procesados
export const articles: Article[] = [
  processArticle(agentSkillsVsMcp)
];

// Helper para obtener un artículo por slug
export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find(article => article.metadata.slug === slug);
}

// Helper para obtener todos los artículos ordenados por fecha (más reciente primero)
export function getAllArticles(): Article[] {
  return [...articles].sort((a, b) => {
    const dateA = new Date(a.metadata.date).getTime();
    const dateB = new Date(b.metadata.date).getTime();
    return dateB - dateA;
  });
}
