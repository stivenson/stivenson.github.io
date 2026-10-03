import { describe, expect, it } from 'vitest';
import { GLOSSARY } from './glossary';

describe('GLOSSARY', () => {
  it('cada término trae qué es y por qué importa', () => {
    for (const [key, entry] of Object.entries(GLOSSARY)) {
      expect(entry.term, key).not.toBe('');
      expect(entry.what.length, key).toBeGreaterThan(20);
      expect(entry.why.length, key).toBeGreaterThan(20);
    }
  });
});
