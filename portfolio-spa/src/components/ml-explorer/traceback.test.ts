import { describe, expect, it } from 'vitest';
import { trimTraceback } from './traceback';

const PYODIDE_ERROR = `PythonError: Traceback (most recent call last):
  File "/lib/python312.zip/_pyodide/_base.py", line 597, in eval_code_async
    await CodeRunner(
          ^^^^^^^^^^^
  File "/lib/python312.zip/_pyodide/_base.py", line 411, in run_async
    coroutine = eval(self.code, globals, locals)
                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<exec>", line 3, in <module>
ZeroDivisionError: division by zero
`;

describe('trimTraceback', () => {
  it('quita los marcos internos de Pyodide y deja los del código del lector', () => {
    expect(trimTraceback(PYODIDE_ERROR)).toBe(
      'Traceback (most recent call last):\n  File "<exec>", line 3, in <module>\nZeroDivisionError: division by zero',
    );
  });

  it('si no hay marcos del lector, devuelve el mensaje sin el prefijo PythonError', () => {
    expect(trimTraceback('PythonError: algo raro\n')).toBe('algo raro');
  });
});
