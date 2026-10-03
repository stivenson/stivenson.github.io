import type { ReactNode } from 'react';

/** Segunda capa de cada pestaña: plegada, para quien quiera la matemática. */
export function DeepDive({ children }: { children: ReactNode }) {
  return (
    <details className="mlx-deep">
      <summary>Para profundizar</summary>
      <div className="mlx-deep-body">{children}</div>
    </details>
  );
}
