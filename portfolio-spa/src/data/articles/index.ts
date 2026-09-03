import agentSkillsVsMcp from './agent-skills-vs-mcp.md?raw';
import probabilidadIntegrales from './probabilidad-integrales-modelos.md?raw';
import llmParaConstruirModelosMl from './llm-para-construir-modelos-ml.md?raw';
import primeraApiConBaseDeDatos from './primera-api-con-base-de-datos.md?raw';
import imagenATensorCnnGlaucoma from './imagen-a-tensor-cnn-glaucoma.md?raw';

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
  processArticle(agentSkillsVsMcp),
  processArticle(probabilidadIntegrales),
  processArticle(llmParaConstruirModelosMl),
  // getAllArticles() ordena por fecha. Cuando dos comparten dia, el desempate
  // lo da este orden: el mas reciente va antes.
  processArticle(imagenATensorCnnGlaucoma),
  processArticle(primeraApiConBaseDeDatos)
];

/**
 * Convierte la fecha del frontmatter ("2026-09-02") en un Date local.
 *
 * `new Date("2026-09-02")` sigue la norma de ISO 8601 y lo interpreta como
 * medianoche UTC. Al formatearlo en una zona al oeste de Greenwich —Colombia
 * es UTC-5— el resultado retrocede un dia y el articulo aparece publicado la
 * vispera. Anadir la hora obliga a leerlo como fecha local, que es lo que
 * significa en el frontmatter.
 */
export function parseArticleDate(date: string): Date {
  return new Date(`${date}T00:00:00`);
}

/** Fecha lista para mostrar, en español y sin el desfase de zona horaria. */
export function formatArticleDate(date: string): string {
  return parseArticleDate(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper para obtener un artículo por slug
export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find(article => article.metadata.slug === slug);
}

// Helper para obtener todos los artículos ordenados por fecha (más reciente primero)
export function getAllArticles(): Article[] {
  return [...articles].sort((a, b) => {
    const dateA = parseArticleDate(a.metadata.date).getTime();
    const dateB = parseArticleDate(b.metadata.date).getTime();
    return dateB - dateA;
  });
}
