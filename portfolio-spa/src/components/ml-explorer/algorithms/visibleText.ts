/**
 * Texto visible del HTML de una pestaña, para los tests de redacción.
 * OPEN/CLOSE marcan cada término del glosario y cada fórmula en línea.
 */
export const OPEN = '\uE000';
export const CLOSE = '\uE001';

/** Reemplaza cada <span class="katex"> (con su <span> envolvente) por marcadores, contando spans. */
export function markTex(html: string): string {
  const start = '<span><span class="katex">';
  let out = '';
  let i = 0;
  for (;;) {
    const at = html.indexOf(start, i);
    if (at < 0) return out + html.slice(i);
    out += html.slice(i, at);
    let depth = 0;
    let j = at;
    const tag = /<(\/?)span\b[^>]*>/g;
    tag.lastIndex = at;
    for (let m = tag.exec(html); m; m = tag.exec(html)) {
      depth += m[1] ? -1 : 1;
      j = tag.lastIndex;
      if (depth === 0) break;
    }
    out += OPEN + CLOSE;
    i = j;
  }
}

/** Texto visible con marcadores alrededor de cada término del glosario y cada fórmula en línea. */
export function toMarkedText(html: string): string {
  const withGloss = html.replace(
    /<button[^>]*class="mlx-gl"[^>]*>[\s\S]*?<\/button>/g,
    (b) => OPEN + b.replace(/<[^>]*>/g, '') + CLOSE,
  );
  return markTex(withGloss)
    // Los bloques (párrafos, ítems, fórmulas en bloque) separan el texto como un salto de línea.
    .replace(/<\/?(p|li|ul|ol|div|h\d|tr|td|th|table|figure|figcaption)\b[^>]*>|<br\s*\/?>/g, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&(amp|lt|gt|quot|#x27);/g, (_, e: string) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#x27': "'" })[e]!);
}


/** Texto visible sin fórmulas ni código: lo que se lee como prosa. */
export function proseText(html: string): string {
  const withoutCode = html
    .replace(/<code\b[^>]*>[\s\S]*?<\/code>/g, ' ')
    .replace(/<div class="mlx-tex-block">[\s\S]*?<\/div>/g, '\n');
  return toMarkedText(withoutCode)
    .replace(new RegExp(`${OPEN}${CLOSE}`, 'g'), ' ')
    .replaceAll(OPEN, '')
    .replaceAll(CLOSE, '');
}

const WORDY = /[\p{L}\p{N}]/u;
/** Puntuación que cierra y pide espacio después: «riesgo),[[término]]» está pegado. */
const CLOSING_PUNCT = /[,;:.)»!?]/u;
/** Lo que no puede seguir a un término sin espacio: letra, dígito o una apertura. */
const OPENING = /[(«]/u;


export function findGlued(text: string): string[] {
  const bad: string[] = [];
  const re = new RegExp(`${OPEN}([^${CLOSE}]*)${CLOSE}`, 'gu');
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const before = [...text.slice(0, m.index)].pop() ?? '';
    const after = [...text.slice(m.index + m[0].length)][0] ?? '';
    // Una puntuación pegada (before/after de <G>/<Tex>) cuenta como pegada si toca una letra sin espacio.
    const beforeBefore = [...text.slice(0, m.index)].slice(-2)[0] ?? '';
    const afterAfter = [...text.slice(m.index + m[0].length)][1] ?? '';
    const gluedBefore =
      WORDY.test(before) || CLOSING_PUNCT.test(before) || (OPENING.test(before) && WORDY.test(beforeBefore));
    const gluedAfter =
      WORDY.test(after) || OPENING.test(after) || (CLOSING_PUNCT.test(after) && WORDY.test(afterAfter));
    if (gluedBefore || gluedAfter) {
      const from = Math.max(0, m.index - 25);
      bad.push(text.slice(from, m.index + m[0].length + 25).replaceAll(OPEN, '[[').replaceAll(CLOSE, ']]'));
    }
  }
  return bad;
}
