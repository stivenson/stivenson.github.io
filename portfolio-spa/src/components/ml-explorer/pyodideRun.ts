// Una ejecucion de Python sobre un Pyodide ya cargado, separada del worker
// para poder probarla con un Pyodide falso.
import { trimTraceback } from './traceback';

export interface PyProxyLike {
  destroy(): void;
}

export interface PyodideLike {
  loadPackage(names: string[]): Promise<unknown>;
  runPython(code: string, options?: { globals?: PyProxyLike }): unknown;
  runPythonAsync(code: string, options?: { globals?: PyProxyLike }): Promise<unknown>;
  setStdout(options: { batched: (text: string) => void }): void;
  setStderr(options: { batched: (text: string) => void }): void;
}

export type RunOutcome =
  | { ok: true; stdout: string; images: string[] }
  | { ok: false; stdout: string; images: []; error: string };

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * Solo la excepcion final de un traceback, en una linea: lo que sigue al
 * ultimo marco `File "..."` (sin sus lineas de codigo sangradas). Algunas
 * excepciones, como el ValueError de mathtext, ocupan varias lineas.
 */
export function exceptionOnly(message: string): string {
  const lines = message.replace(/^PythonError:\s*/, '').split('\n');
  let start = 0;
  lines.forEach((line, i) => {
    if (/^\s+File "/.test(line)) start = i + 1;
  });
  while (start < lines.length && /^\s/.test(lines[start])) start++;
  const text = lines
    .slice(start)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ');
  return text || message.trim();
}

/** Ejecuta Python ignorando cualquier error (limpiezas que no deben tapar el resultado). */
function quietly(py: PyodideLike, code: string): void {
  try {
    py.runPython(code);
  } catch {
    // nada que hacer: es solo limpieza
  }
}

/**
 * Ejecuta el codigo del lector y devuelve su salida y sus figuras. Nunca
 * lanza: cualquier fallo vuelve como `ok: false`, para que el worker siempre
 * responda.
 */
export async function runInPyodide(py: PyodideLike, code: string): Promise<RunOutcome> {
  const out: string[] = [];
  let namespace: PyProxyLike | undefined;
  try {
    py.setStdout({ batched: (text) => out.push(text) });
    py.setStderr({ batched: (text) => out.push(text) });

    // Espacio de nombres limpio en cada ejecucion (lo de la anterior no
    // contamina la siguiente), con __name__ para que funcione
    // `if __name__ == "__main__":`.
    namespace = py.runPython("{'__name__': '__main__'}") as PyProxyLike;

    try {
      await py.runPythonAsync(code, { globals: namespace });
    } catch (err) {
      quietly(py, 'import matplotlib.pyplot as plt; plt.close("all")'); // descarta figuras a medio hacer
      quietly(py, 'import sys; sys.stdout.flush(); sys.stderr.flush()');
      return { ok: false, stdout: out.join('\n'), images: [], error: trimTraceback(messageOf(err)) };
    }
    quietly(py, 'import sys; sys.stdout.flush(); sys.stderr.flush()');

    let joined: string;
    try {
      joined = py.runPython('_collect_figs()') as string;
    } catch (err) {
      // El traceback seria del SETUP, no del lector: basta con la causa.
      return {
        ok: false,
        stdout: out.join('\n'),
        images: [],
        error: 'No se pudo dibujar la figura: ' + exceptionOnly(messageOf(err)),
      };
    }
    return { ok: true, stdout: out.join('\n'), images: joined ? joined.split('\n') : [] };
  } catch (err) {
    return { ok: false, stdout: out.join('\n'), images: [], error: String(err) };
  } finally {
    try {
      namespace?.destroy();
    } catch {
      // ya destruido o Pyodide caido: no cambia el resultado
    }
  }
}
