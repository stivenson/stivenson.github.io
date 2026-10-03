import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPyodideClient, RUN_TIMEOUT_MS, type PyodideClient, type RunResult, type WorkerLike } from './pyodideClient';
import { indent, outdent } from './editorIndent';
import type { PythonExercise } from './types';

const COLAB_URL =
  'https://colab.research.google.com/github/stivenson/stivenson.github.io/blob/main/notebooks/algoritmos-ml.ipynb';

// Un solo worker para toda la página: Pyodide se descarga una vez y lo
// comparten los ejercicios de todos los algoritmos.
let sharedClient: PyodideClient | null = null;
function getClient(): PyodideClient {
  if (!sharedClient) {
    sharedClient = createPyodideClient(
      () => new Worker(new URL('./pyodideWorker.ts', import.meta.url), { type: 'module' }) as unknown as WorkerLike,
    );
  }
  return sharedClient;
}

type Phase = { kind: 'idle' } | { kind: 'running'; progress: string } | { kind: 'done'; result: RunResult };

export function PythonRunner({ exercise }: { exercise: PythonExercise }) {
  const [code, setCode] = useState(exercise.code);
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const mounted = useRef(false);
  const runIdRef = useRef(0);
  const escaped = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function run() {
    const id = ++runIdRef.current;
    const current = () => mounted.current && runIdRef.current === id;
    setPhase({ kind: 'running', progress: 'Preparando Python…' });
    const result = await getClient().run(code, (progress) => {
      if (current()) setPhase({ kind: 'running', progress });
    });
    if (current()) setPhase({ kind: 'done', result });
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') {
      // Tras Esc, el siguiente Tab sale del campo (así el teclado no queda atrapado).
      escaped.current = true;
      return;
    }
    const wasEscaped = escaped.current;
    escaped.current = false;
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (phase.kind !== 'running') void run();
    } else if (e.key === 'Tab' && !wasEscaped) {
      // Tab indenta (Shift+Tab desindenta) en vez de saltar de campo.
      e.preventDefault();
      const el = e.currentTarget;
      const edit = (e.shiftKey ? outdent : indent)(code, el.selectionStart, el.selectionEnd);
      setCode(edit.code);
      requestAnimationFrame(() => el.setSelectionRange(edit.selectionStart, edit.selectionEnd));
    }
  }

  const running = phase.kind === 'running';

  return (
    <div className="mlx-py">
      <div className="mlx-py-bar">
        <span className="mlx-py-title">🐍 Pruébalo en Python</span>
        <div className="mlx-py-actions">
          {running ? (
            <button
              type="button"
              onClick={(e) => {
                // «Ejecutar» y «Detener» son el mismo botón: el 2º clic de un doble clic
                // caería sobre «Detener» y mataría la carga de Pyodide recién iniciada.
                if (e.detail > 1) return;
                getClient().stop();
              }}
            >
              ■ Detener
            </button>
          ) : (
            <button type="button" className="is-primary" onClick={() => void run()}>
              ▶ Ejecutar
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setCode(exercise.code);
              setPhase({ kind: 'idle' });
            }}
            disabled={code === exercise.code || running}
          >
            ↺ Restaurar
          </button>
          <a href={`${COLAB_URL}#scrollTo=${exercise.colabAnchor}`} target="_blank" rel="noopener noreferrer">
            Abrir en Colab ↗
          </a>
        </div>
      </div>
      <textarea
        className="mlx-py-code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        rows={code.split('\n').length + 1}
        aria-label="Código Python editable"
      />
      <p className="mlx-py-hint">
        Edita el código y pulsa Ejecutar (Ctrl+Enter). La primera vez tu navegador descarga Python (unos 15 MB); después
        queda en caché. Tab indenta (Shift+Tab desindenta). Para salir del editor con el teclado: Esc y luego Tab.
      </p>
      <div aria-live="polite">
        <RunOutput phase={phase} expected={exercise.expectedOutput} code={code} original={exercise.code} />
      </div>
    </div>
  );
}

function Expected({ text, open }: { text: string; open: boolean }) {
  return (
    <details className="mlx-py-expected" open={open}>
      <summary>Salida esperada</summary>
      <pre>{text}</pre>
    </details>
  );
}

function RunOutput({
  phase,
  expected,
  code,
  original,
}: {
  phase: Phase;
  expected: string;
  code: string;
  original: string;
}) {
  if (phase.kind === 'idle') return <Expected text={expected} open />;
  if (phase.kind === 'running') {
    return (
      <p className="mlx-py-status" role="status">
        <span className="mlx-spinner" aria-hidden="true" /> {phase.progress}
      </p>
    );
  }

  const { result } = phase;
  switch (result.status) {
    case 'ok':
    case 'error':
      return (
        <div className="mlx-py-out">
          <h5>Tu salida</h5>
          {result.stdout && <pre>{result.stdout}</pre>}
          {!result.stdout && result.images.length === 0 && <p className="mlx-py-status">(sin salida)</p>}
          {result.images.map((png, i) => (
            <img key={i} src={`data:image/png;base64,${png}`} alt={`Gráfica ${i + 1} generada por el código`} />
          ))}
          {result.status === 'error' && (
            <>
              <pre className="mlx-py-error">{result.error}</pre>
              {code !== original && <p className="mlx-py-hint">Pulsa ↺ Restaurar para volver al código original.</p>}
            </>
          )}
          <Expected text={expected} open={false} />
        </div>
      );
    case 'timeout':
      return (
        <div className="mlx-py-out">
          <p className="mlx-py-error">
            {`Detenido: el código tardó más de ${RUN_TIMEOUT_MS / 1000} segundos. ¿Hay un bucle que nunca termina?`}
          </p>
          <Expected text={expected} open={false} />
        </div>
      );
    case 'stopped':
      return (
        <div className="mlx-py-out">
          <p className="mlx-py-status">Ejecución detenida.</p>
          <Expected text={expected} open={false} />
        </div>
      );
    case 'load-failed':
      return (
        <div className="mlx-py-out">
          <p className="mlx-py-error">
            Tu navegador no pudo cargar Python: {result.error} Puedes abrir el ejercicio en Colab con el botón de
            arriba.
          </p>
          <Expected text={expected} open />
        </div>
      );
  }
}
