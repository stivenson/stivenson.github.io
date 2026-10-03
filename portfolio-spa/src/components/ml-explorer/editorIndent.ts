const INDENT = '    ';

export interface EditResult {
  code: string;
  selectionStart: number;
  selectionEnd: number;
}

/** Inicios de las líneas tocadas por la selección [start, end]. */
function touchedLineStarts(code: string, start: number, end: number): number[] {
  const first = code.lastIndexOf('\n', start - 1) + 1;
  // Si la selección termina justo tras un '\n', esa última línea no se toca.
  const last = end > start && code[end - 1] === '\n' ? end - 1 : end;
  const starts = [first];
  for (let i = first; i < last; i++) {
    if (code[i] === '\n') starts.push(i + 1);
  }
  return starts;
}

/** Tab: 4 espacios en el cursor, o en cada línea tocada si la selección abarca varias. */
export function indent(code: string, start: number, end: number): EditResult {
  if (!code.slice(start, end).includes('\n')) {
    const pos = start + INDENT.length;
    return { code: code.slice(0, start) + INDENT + code.slice(end), selectionStart: pos, selectionEnd: pos };
  }
  const starts = touchedLineStarts(code, start, end);
  let out = code;
  for (let i = starts.length - 1; i >= 0; i--) {
    out = out.slice(0, starts[i]) + INDENT + out.slice(starts[i]);
  }
  return {
    code: out,
    selectionStart: start + INDENT.length,
    selectionEnd: end + INDENT.length * starts.length,
  };
}

/** Shift+Tab: quita hasta 4 espacios iniciales de cada línea tocada. */
export function outdent(code: string, start: number, end: number): EditResult {
  const starts = touchedLineStarts(code, start, end);
  const removed = starts.map((s) => {
    let n = 0;
    while (n < INDENT.length && code[s + n] === ' ') n++;
    return n;
  });
  let out = code;
  for (let i = starts.length - 1; i >= 0; i--) {
    out = out.slice(0, starts[i]) + out.slice(starts[i] + removed[i]);
  }
  const adjust = (pos: number) =>
    pos - starts.reduce((sum, s, i) => sum + Math.min(removed[i], Math.max(0, pos - s)), 0);
  return { code: out, selectionStart: adjust(start), selectionEnd: adjust(end) };
}
