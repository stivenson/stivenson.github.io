// Ejecuta los ejercicios del explorador en Pyodide real (la misma versión
// que carga el navegador) y compara su salida con <slug>.out.txt.
// Uso (desde portfolio-spa/): node scripts/check-ml-exercises-pyodide.mjs
// Necesita red la primera vez: descarga numpy, scikit-learn y matplotlib
// del CDN de Pyodide.
//
// Sin límite de tiempo: Pyodide corre en este mismo hilo y no se puede
// interrumpir sin un worker, así que un bucle infinito cuelga el script.
// Por eso se corre primero scripts/check-ml-exercises.py (CPython, con
// timeout de 120 s por ejercicio), y este solo después.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPyodide } from 'pyodide';

const spa = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const explorer = path.join(spa, 'src/components/ml-explorer');
const pyDir = path.join(explorer, 'algorithms/python');

const py = await loadPyodide({ packageBaseUrl: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/' });
await py.loadPackage(['numpy', 'scikit-learn', 'matplotlib'], { messageCallback: () => {} });
py.runPython(fs.readFileSync(path.join(explorer, 'pyodideSetup.py'), 'utf8'));

// Igual que el checker de CPython: sin los '\n' finales.
const trimEnd = (text) => text.replace(/\n+$/, '');

const scripts = fs.readdirSync(pyDir).filter((f) => f.endsWith('.py')).sort();
if (scripts.length === 0) console.log(`No hay ejercicios en ${pyDir}`);

let failed = 0;
for (const file of scripts) {
  const expectedFile = file.replace(/\.py$/, '.out.txt');
  const expectedPath = path.join(pyDir, expectedFile);
  if (!fs.existsSync(expectedPath)) {
    console.log(`✗ ${file}: falta ${expectedFile}`);
    failed++;
    continue;
  }
  const out = [];
  py.setStdout({ batched: (text) => out.push(text) });
  py.setStderr({ batched: () => {} });
  const namespace = py.globals.get('dict')();
  try {
    await py.runPythonAsync(fs.readFileSync(path.join(pyDir, file), 'utf8'), { globals: namespace });
    py.runPython('_collect_figs()');
  } catch (err) {
    console.log(`✗ ${file} falló en Pyodide:\n${err.message}`);
    failed++;
    continue;
  } finally {
    namespace.destroy();
    // Si el ejercicio falló antes de _collect_figs(), sus figuras no deben
    // pasar al siguiente.
    try {
      py.runPython('import matplotlib.pyplot as plt; plt.close("all")');
    } catch {
      // nada que cerrar
    }
  }
  const expected = trimEnd(fs.readFileSync(expectedPath, 'utf8'));
  const got = trimEnd(out.join('\n'));
  if (got === expected) {
    console.log(`✓ ${file} (Pyodide)`);
  } else {
    console.log(`✗ ${file}: en Pyodide imprime algo distinto de ${expectedFile}:\n${got}`);
    failed++;
  }
}
process.exit(failed ? 1 : 0);
