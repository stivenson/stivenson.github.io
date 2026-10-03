import { describe, expect, it } from 'vitest';
import { exceptionOnly, runInPyodide, type PyodideLike, type PyProxyLike } from './pyodideRun';

interface FakeOptions {
  /** Lo que hace el código del lector: puede escribir en stdout o lanzar. */
  user?: (print: (text: string) => void) => void;
  /** Resultado de `_collect_figs()`, o un Error para que lance. */
  figs?: string | Error;
}

function makeFake(opts: FakeOptions = {}) {
  const calls: string[] = [];
  const namespaces: { code: string; destroyed: boolean }[] = [];
  let stdout: (text: string) => void = () => {};

  const py: PyodideLike = {
    loadPackage: async () => undefined,
    setStdout: ({ batched }) => {
      stdout = batched;
    },
    setStderr: () => {},
    runPython(code: string) {
      calls.push(code);
      if (code.includes('_collect_figs()')) {
        if (opts.figs instanceof Error) throw opts.figs;
        return opts.figs ?? '';
      }
      if (code.includes("'__name__'")) {
        const ns = { code, destroyed: false };
        namespaces.push(ns);
        const proxy: PyProxyLike = {
          destroy: () => {
            ns.destroyed = true;
          },
        };
        return proxy;
      }
      return undefined;
    },
    async runPythonAsync() {
      opts.user?.((text) => stdout(text));
    },
  };
  return { py, calls, namespaces };
}

const READER_ERROR = `PythonError: Traceback (most recent call last):
  File "/lib/python312.zip/_pyodide/_base.py", line 597, in eval_code_async
    await CodeRunner(
  File "<exec>", line 2, in <module>
ZeroDivisionError: division by zero
`;

// Forma real (Pyodide 0.27.7) del error de mathtext: el mensaje del
// ValueError ocupa varias lineas.
const FIGS_ERROR = `PythonError: Traceback (most recent call last):
  File "/lib/python312.zip/_pyodide/_base.py", line 597, in eval_code
  File "<exec>", line 15, in _collect_figs
  File "/lib/python3.12/site-packages/matplotlib/_mathtext.py", line 2165, in parse
    raise ValueError("\\n" + ParseException.explain(err, 0)) from None
ValueError: 
\\frac{1}
     ^
ParseSyntaxException: Expected \\frac{num}{den}, found '{'  (at char 5), (line:1, col:6)
`;

describe('runInPyodide', () => {
  it('camino feliz: une el stdout con saltos de línea y separa las imágenes', async () => {
    const { py } = makeFake({
      user: (print) => {
        print('hola');
        print('mundo');
      },
      figs: 'AAA\nBBB',
    });
    expect(await runInPyodide(py, 'print(1)')).toEqual({ ok: true, stdout: 'hola\nmundo', images: ['AAA', 'BBB'] });
  });

  it('sin figuras devuelve una lista de imágenes vacía', async () => {
    const { py } = makeFake({ figs: '' });
    expect(await runInPyodide(py, 'x = 1')).toEqual({ ok: true, stdout: '', images: [] });
  });

  it('si el código del lector lanza, recorta el traceback y cierra las figuras', async () => {
    const { py, calls } = makeFake({
      user: (print) => {
        print('antes');
        throw new Error(READER_ERROR);
      },
    });
    const outcome = await runInPyodide(py, '1/0');
    expect(outcome).toEqual({
      ok: false,
      stdout: 'antes',
      images: [],
      error: 'Traceback (most recent call last):\n  File "<exec>", line 2, in <module>\nZeroDivisionError: division by zero',
    });
    expect(calls.some((c) => c.includes('plt.close("all")'))).toBe(true);
    expect(calls.some((c) => c.includes('_collect_figs()'))).toBe(false);
  });

  it('si _collect_figs lanza, avisa que no se pudo dibujar y conserva el stdout', async () => {
    const { py } = makeFake({
      user: (print) => print('entrenado'),
      figs: new Error(FIGS_ERROR),
    });
    expect(await runInPyodide(py, 'plt.plot()')).toEqual({
      ok: false,
      stdout: 'entrenado',
      images: [],
      error:
        "No se pudo dibujar la figura: ValueError: \\frac{1} ^ ParseSyntaxException: Expected \\frac{num}{den}, found '{'  (at char 5), (line:1, col:6)",
    });
  });

  it('crea el espacio de nombres con __name__ == "__main__"', async () => {
    const { py, namespaces } = makeFake();
    await runInPyodide(py, 'x = 1');
    expect(namespaces).toHaveLength(1);
    expect(namespaces[0].code).toMatch(/['"]__name__['"]\s*:\s*['"]__main__['"]/);
  });

  it('destruye el espacio de nombres siempre, con éxito o con error', async () => {
    const ok = makeFake();
    await runInPyodide(ok.py, 'x = 1');
    expect(ok.namespaces[0].destroyed).toBe(true);

    const bad = makeFake({
      user: () => {
        throw new Error(READER_ERROR);
      },
    });
    await runInPyodide(bad.py, '1/0');
    expect(bad.namespaces[0].destroyed).toBe(true);

    const figs = makeFake({ figs: new Error(FIGS_ERROR) });
    await runInPyodide(figs.py, 'plt.plot()');
    expect(figs.namespaces[0].destroyed).toBe(true);
  });

  it('nunca lanza: un fallo inesperado se devuelve como ok:false', async () => {
    const { py } = makeFake();
    py.setStdout = () => {
      throw new Error('boom');
    };
    expect(await runInPyodide(py, 'x = 1')).toEqual({ ok: false, stdout: '', images: [], error: 'Error: boom' });
  });
});

describe('exceptionOnly', () => {
  it('un mensaje sin marcos File se devuelve sin el prefijo PythonError', () => {
    expect(exceptionOnly('PythonError: algo raro')).toBe('algo raro');
  });

  it('en un SyntaxError descarta el código y el caret que siguen al marco', () => {
    const message =
      'Traceback (most recent call last):\n  File "<exec>", line 1\n    x = (\n        ^\nSyntaxError: \'(\' was never closed';
    expect(exceptionOnly(message)).toBe("SyntaxError: '(' was never closed");
  });

  it('une en una sola línea el mensaje multilínea tras el último marco', () => {
    const message =
      'Traceback (most recent call last):\n  File "<exec>", line 3, in <module>\n    plt.title(t)\nValueError: \n$x^{$\n^\nParseFatalException: Expected end of text';
    expect(exceptionOnly(message)).toBe('ValueError: $x^{$ ^ ParseFatalException: Expected end of text');
  });
});
