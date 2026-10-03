// Web Worker que ejecuta Python con Pyodide fuera del hilo principal, para
// que un calculo largo (o un bucle infinito) no congele la pagina.
import type { WorkerRequest, WorkerResponse } from './pyodideClient';
import { runInPyodide, type PyodideLike } from './pyodideRun';
// ?raw: Vite incrusta el contenido del .py como string en el bundle.
import SETUP from './pyodideSetup.py?raw';

// Version fija: las salidas esperadas (.out.txt) se generan con estas mismas
// versiones de numpy 2.0.2, scikit-learn 1.6.1 y matplotlib 3.8.4.
const PYODIDE_VERSION = '0.27.7';
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const PACKAGES = ['numpy', 'scikit-learn', 'matplotlib'];

const ctx = self as unknown as {
  postMessage(message: WorkerResponse): void;
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
};

let runtime: Promise<PyodideLike> | null = null;

function loadRuntime(id: number): Promise<PyodideLike> {
  if (!runtime) {
    runtime = (async () => {
      ctx.postMessage({ type: 'progress', id, message: 'Descargando Python (solo la primera vez)…' });
      const mod = await import(/* @vite-ignore */ `${INDEX_URL}pyodide.mjs`);
      const py: PyodideLike = await mod.loadPyodide({ indexURL: INDEX_URL });
      ctx.postMessage({ type: 'progress', id, message: 'Instalando numpy, scikit-learn y matplotlib…' });
      await py.loadPackage(PACKAGES);
      py.runPython(SETUP);
      return py;
    })();
  }
  return runtime;
}

ctx.onmessage = async ({ data }) => {
  if (data.type !== 'run') return;
  const { id, code } = data;

  let py: PyodideLike;
  try {
    py = await loadRuntime(id);
  } catch (err) {
    ctx.postMessage({ type: 'result', id, ok: false, stdout: '', images: [], error: String(err), loadFailed: true });
    return;
  }

  ctx.postMessage({ type: 'started', id });
  // Despues de `started` siempre sale exactamente un `result`, pase lo que pase.
  try {
    const outcome = await runInPyodide(py, code);
    ctx.postMessage({ type: 'result', id, ...outcome });
  } catch (err) {
    ctx.postMessage({ type: 'result', id, ok: false, stdout: '', images: [], error: String(err) });
  }
};
