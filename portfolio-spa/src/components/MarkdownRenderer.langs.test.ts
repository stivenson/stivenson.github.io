import { describe, expect, it } from 'vitest';
import { REGISTERED_LANGUAGES } from './MarkdownRenderer';

const articles = import.meta.glob('../data/articles/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

describe('lenguajes de bloque de código', () => {
  it('todo lenguaje usado en los artículos está registrado en el resaltador', () => {
    const missing: string[] = [];
    for (const [file, src] of Object.entries(articles)) {
      let fence: string | null = null;
      for (const line of src.split(/\r?\n/)) {
        const m = /^\s*(`{3,}|~{3,})\s*([\w+#-]*)/.exec(line);
        if (!m) continue;
        if (fence === null) {
          fence = m[1];
          const lang = m[2].toLowerCase();
          if (lang && !(REGISTERED_LANGUAGES as readonly string[]).includes(lang)) missing.push(`${file}: ${lang}`);
        } else if (m[1][0] === fence[0] && m[1].length >= fence.length && !m[2]) {
          fence = null;
        }
      }
    }
    expect(missing).toEqual([]);
  });
});
