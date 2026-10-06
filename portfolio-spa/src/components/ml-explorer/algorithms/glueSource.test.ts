import { describe, expect, it } from 'vitest';

// Escaneo estático: JSX descarta el salto de línea entre `</G>` (o `</Tex>`) con
// before/after y el texto contiguo, y se pierde un espacio visible.
const files = {
  ...import.meta.glob('./*.tsx', { query: '?raw', import: 'default', eager: true }),
  ...import.meta.glob('../ovas/*.tsx', { query: '?raw', import: 'default', eager: true }),
} as Record<string, string>;

describe('espacios perdidos en el borde de línea de <G>/<Tex> con before/after', () => {
  it('no hay ninguno en algorithms/ ni ovas/', () => {
    const problems: string[] = [];
    for (const [file, src] of Object.entries(files)) {
      const L = src.split(/\r?\n/);
      L.forEach((l, i) => {
        const t = l.trim();
        const nx = (L[i + 1] ?? '').trim();
        const pv = (L[i - 1] ?? '').trim();
        if (/<(G|Tex)\b[^>]*\b(after|before)=/.test(l) && /<\/(G|Tex)>$/.test(t) && /^[A-Za-zÁ-úñ¿«(0-9]/.test(nx)) {
          problems.push(`${file}:${i + 1} fin: ${t.slice(-50)} | ${nx.slice(0, 30)}`);
        }
        if (/^<(G|Tex)\b[^>]*\bbefore=/.test(t) && /[A-Za-zá-úñ0-9,:;.»]$/.test(pv)) {
          problems.push(`${file}:${i + 1} inicio: ${pv.slice(-30)} | ${t.slice(0, 50)}`);
        }
      });
    }
    expect(problems).toEqual([]);
  });
});
