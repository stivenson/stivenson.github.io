// Ejecuta los ejercicios del explorador en Pyodide real (la misma versión
// que carga el navegador) y compara su salida con <slug>.out.txt.
// Uso (desde portfolio-spa/): node scripts/check-ml-exercises-pyodide.mjs
// Necesita red la primera vez: descarga numpy, scikit-learn y matplotlib
// del CDN de Pyodide.
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

const scripts = fs.readdirSync(pyDir).filter((f) => f.endsWith('.py')).sort();
if (scripts.length === 0) console.log(`No hay ejercicios en ${pyDir}`);

let failed = 0;
for (const file of scripts) {
  const expectedFile = file.replace(/\.py$/, '.out.txt');
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
  }
  const expected = fs.readFileSync(path.join(pyDir, expectedFile), 'utf8').replace(/\n$/, '');
  if (out.join('\n') === expected) {
    console.log(`✓ ${file} (Pyodide)`);
  } else {
    console.log(`✗ ${file}: en Pyodide imprime algo distinto de ${expectedFile}:\n${out.join('\n')}`);
    failed++;
  }
}
process.exit(failed ? 1 : 0);
