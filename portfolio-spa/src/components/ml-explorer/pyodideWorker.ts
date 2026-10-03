// Web Worker que ejecuta Python con Pyodide fuera del hilo principal, para
// que un calculo largo (o un bucle infinito) no congele la pagina.
import type { WorkerRequest, WorkerResponse } from './pyodideClient';
import { trimTraceback } from './traceback';

// Version fija: las salidas esperadas (.out.txt) se generan con estas mismas
// versiones de numpy 2.0.2, scikit-learn 1.6.1 y matplotlib 3.8.4.
const PYODIDE_VERSION = '0.27.7';
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const PACKAGES = ['numpy', 'scikit-learn', 'matplotlib'];

// plt.show() no tiene pantalla en el worker: se anula, y _collect_figs()
// convierte cada figura abierta en un PNG en base64 (separados por \n).
const SETUP = `
import io, base64
import matplotlib
matplotlib.use("AGG")
import matplotlib.pyplot as plt
plt.style.use("dark_background")
plt.show = lambda *args, **kwargs: None

def _collect_figs():
    images = []
    for num in plt.get_fignums():
        buf = io.BytesIO()
        plt.figure(num).savefig(buf, format="png", dpi=110, bbox_inches="tight")
        images.append(base64.b64encode(buf.getvalue()).decode("ascii"))
    plt.close("all")
    return "\\n".join(images)
`;

interface PyProxyLike {
  destroy(): void;
}

interface PyodideLike {
  loadPackage(names: string[]): Promise<unknown>;
  runPython(code: string, options?: { globals?: PyProxyLike }): unknown;
  runPythonAsync(code: string, options?: { globals?: PyProxyLike }): Promise<unknown>;
  setStdout(options: { batched: (text: string) => void }): void;
  setStderr(options: { batched: (text: string) => void }): void;
  globals: { get(name: string): () => PyProxyLike };
}

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

  const out: string[] = [];
  py.setStdout({ batched: (text) => out.push(text) });
  py.setStderr({ batched: (text) => out.push(text) });

  ctx.postMessage({ type: 'started', id });
  // Cada ejecucion con un espacio de nombres limpio: lo que definio una
  // ejecucion anterior no contamina la siguiente.
  const namespace = py.globals.get('dict')();
  try {
    await py.runPythonAsync(code, { globals: namespace });
    const joined = py.runPython('_collect_figs()') as string;
    ctx.postMessage({ type: 'result', id, ok: true, stdout: out.join('\n'), images: joined ? joined.split('\n') : [] });
  } catch (err) {
    py.runPython('_collect_figs()'); // descarta figuras a medio hacer
    const message = err instanceof Error ? err.message : String(err);
    ctx.postMessage({ type: 'result', id, ok: false, stdout: out.join('\n'), images: [], error: trimTraceback(message) });
  } finally {
    namespace.destroy();
  }
};
