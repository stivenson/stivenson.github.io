/**
 * Pyodide antepone a cada error los marcos de su propio runner. Al lector
 * solo le sirven las lineas de su codigo, que Pyodide marca como "<exec>".
 */
export function trimTraceback(message: string): string {
  const clean = message.replace(/^PythonError:\s*/, '').trim();
  const lines = clean.split('\n');
  const start = lines.findIndex((line) => line.includes('File "<exec>"'));
  if (start === -1) return clean;
  return ['Traceback (most recent call last):', ...lines.slice(start)].join('\n');
}
