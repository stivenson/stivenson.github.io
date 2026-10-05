// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { G } from './Gloss';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
});

function openCard() {
  render(
    <p>
      Antes <G k="feature">feature</G> y <button type="button">Otro</button>
    </p>,
  );
  const term = screen.getByRole('button', { name: 'feature' });
  fireEvent.click(term);
  return { term, dialog: screen.getByRole('dialog'), ok: screen.getByRole('button', { name: 'Entendido' }) };
}

describe('ficha 💡', () => {
  it('es un <dialog> modal (showModal) y enfoca «Entendido»', () => {
    const showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    HTMLDialogElement.prototype.showModal = showModal;
    const { dialog, ok } = openCard();
    expect(dialog.tagName).toBe('DIALOG');
    expect(showModal).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(ok);
  });

  it('Tab y Shift+Tab no sacan el foco de la ficha', () => {
    const { dialog, ok } = openCard();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(document.activeElement).toBe(ok);
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(ok);
    // Aunque el foco se hubiera escapado, Tab lo devuelve a la ficha.
    screen.getByRole('button', { name: 'Otro', hidden: true }).focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(document.activeElement).toBe(ok);
  });

  it('Escape cierra y devuelve el foco al término', () => {
    const { term, dialog } = openCard();
    fireEvent.keyDown(dialog, { key: 'Escape' }); // burbujea hasta document
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(term);
  });

  it('el evento cancel del navegador (Escape nativo) también cierra', () => {
    const { term, dialog } = openCard();
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(term);
  });

  it('el clic en el fondo cierra; el clic dentro de la ficha no', () => {
    const { dialog } = openCard();
    fireEvent.click(screen.getByText(/💡/));
    expect(screen.getByRole('dialog')).toBe(dialog);
    fireEvent.click(dialog);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('«Entendido» cierra y devuelve el foco', () => {
    const { term, ok } = openCard();
    fireEvent.click(ok);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(term);
  });

  it('before/after envuelven la puntuación con el término en un nowrap', () => {
    const { container } = render(
      <p>
        <G k="feature" before="(" after=").">
          feature
        </G>
      </p>,
    );
    const wrap = container.querySelector('.mlx-nowrap');
    expect(wrap?.textContent).toBe('(feature).');
    expect(wrap?.querySelector('button.mlx-gl')).not.toBeNull();
  });
});
