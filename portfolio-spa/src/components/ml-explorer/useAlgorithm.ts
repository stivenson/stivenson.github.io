import { useEffect, useState } from 'react';
import { loadAlgorithm } from './registry';
import type { AlgorithmModule } from './types';

export type AlgorithmState =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready'; module: AlgorithmModule };

/** Descarga el chunk del algoritmo elegido y expone loading/error/ready. */
export function useAlgorithm(slug: string): AlgorithmState {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ slug: string; module?: AlgorithmModule } | null>(null);

  useEffect(() => {
    let alive = true;
    loadAlgorithm(slug).then(
      (module) => alive && setResult({ slug, module }),
      () => alive && setResult({ slug }),
    );
    return () => {
      alive = false;
    };
  }, [slug, attempt]);

  // Mientras llega el nuevo chunk, el resultado anterior es de otro slug.
  if (!result || result.slug !== slug) return { status: 'loading' };
  if (result.module) return { status: 'ready', module: result.module };
  return {
    status: 'error',
    retry: () => {
      setResult(null);
      setAttempt((a) => a + 1);
    },
  };
}
