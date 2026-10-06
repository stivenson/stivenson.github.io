import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { portalTarget } from './fullscreen';
import { GLOSSARY, type GlossaryKey } from './glossary';

/**
 * Término con ficha 💡. La ficha se monta en document.body porque las
 * animaciones de Framer Motion de la página crean contenedores con
 * transform, y dentro de ellos `position: fixed` deja de cubrir la pantalla.
 * Con el explorador a pantalla completa se monta dentro de él (portalTarget):
 * fuera no se vería.
 */
export function G({
  k,
  children,
  before,
  after,
}: {
  k: GlossaryKey;
  children?: ReactNode;
  /** Puntuación pegada al término («(», «.»…): va con él en un nowrap. */
  before?: string;
  after?: string;
}) {
  const [open, setOpen] = useState(false);
  const entry = GLOSSARY[k];
  const opener = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => setOpen(false);

  // showModal() deja inerte el resto de la página: el foco no sale de la ficha
  // y los lectores de pantalla solo ven la ficha. Al cerrar, el foco vuelve al término.
  useEffect(() => {
    if (!open) return;
    const d = dialog.current;
    if (d && !d.open) {
      if (typeof d.showModal === 'function') d.showModal();
      else d.setAttribute('open', ''); // navegadores sin <dialog> modal (y jsdom)
    }
    d?.querySelector<HTMLButtonElement>('.mlx-gl-ok')?.focus();
    // Respaldo sin showModal(): ahí no hay «cancel» nativo, así que Escape se
    // escucha en document. Con showModal() lo maneja el <dialog> (onCancel abajo).
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const modal = typeof d?.showModal === 'function';
    if (!modal) document.addEventListener('keydown', onKey);
    const button = opener.current;
    return () => {
      if (!modal) document.removeEventListener('keydown', onKey);
      button?.focus();
    };
  }, [open]);

  function onKeyDown(e: KeyboardEvent<HTMLDialogElement>) {
    if (e.key !== 'Tab') return;
    // Respaldo del atrapado de foco donde showModal() no existe: Tab da la vuelta dentro de la ficha.
    const items = [...e.currentTarget.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')];
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey ? active === first || !e.currentTarget.contains(active) : active === last || !e.currentTarget.contains(active)) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  }

  const term = (
    <button ref={opener} type="button" className="mlx-gl" onClick={() => setOpen(true)} aria-haspopup="dialog">
      {children ?? entry.term}
    </button>
  );

  return (
    <>
      {before || after ? (
        <span className="mlx-nowrap">
          {before}
          {term}
          {after}
        </span>
      ) : (
        term
      )}
      {open &&
        createPortal(
          <dialog
            ref={dialog}
            className="mlx-gl-modal"
            aria-label={entry.term}
            // El clic en el fondo llega al propio <dialog>; en la ficha, a sus hijos.
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
            onCancel={(e) => {
              e.preventDefault();
              close();
            }}
            onKeyDown={onKeyDown}
          >
            <div className="mlx-gl-box">
              <strong>💡 {entry.term}</strong>
              <p>{entry.what}</p>
              <p className="mlx-gl-why">{entry.why}</p>
              <button type="button" className="mlx-gl-ok" onClick={close}>
                Entendido
              </button>
            </div>
          </dialog>,
          portalTarget(),
        )}
    </>
  );
}
