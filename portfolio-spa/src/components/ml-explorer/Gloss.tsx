import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { GLOSSARY, type GlossaryKey } from './glossary';

/**
 * Término con ficha 💡. La ficha se monta en document.body porque las
 * animaciones de Framer Motion de la página crean contenedores con
 * transform, y dentro de ellos `position: fixed` deja de cubrir la pantalla.
 */
export function G({ k, children }: { k: GlossaryKey; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const entry = GLOSSARY[k];
  const opener = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  // Escape cierra la ficha estés donde estés; al cerrar, el foco vuelve al término.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const button = opener.current;
    return () => {
      document.removeEventListener('keydown', onKey);
      button?.focus();
    };
  }, [open]);

  return (
    <>
      <button ref={opener} type="button" className="mlx-gl" onClick={() => setOpen(true)} aria-haspopup="dialog">
        {children ?? entry.term}
      </button>
      {open &&
        createPortal(
          <div
            className="mlx-gl-modal"
            role="dialog"
            aria-modal="true"
            aria-label={entry.term}
            onClick={close}
          >
            <div className="mlx-gl-box" onClick={(e) => e.stopPropagation()}>
              <strong>💡 {entry.term}</strong>
              <p>{entry.what}</p>
              <p className="mlx-gl-why">{entry.why}</p>
              <button type="button" onClick={close} autoFocus>
                Entendido
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
