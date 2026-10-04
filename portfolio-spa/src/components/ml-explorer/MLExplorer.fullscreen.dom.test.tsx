// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MLExplorer } from './MLExplorer';

// Registry falso con un término 💡 en la pestaña «Tipo» de cada algoritmo,
// para comprobar dónde se monta la ficha en pantalla completa.
vi.mock('./registry', async () => {
  const base = await import('./testRegistry');
  const { G } = await import('./Gloss');
  return {
    ...base,
    loadAlgorithm: (slug: string) => {
      const mod = base.fakeModule(slug);
      mod.tabs.type = {
        essential: (
          <p>
            ESENCIAL-{slug} con <G k="feature" />
          </p>
        ),
      };
      return Promise.resolve(mod);
    },
  };
});

type FsDocument = Document & { fullscreenElement: Element | null };

function setFullscreenElement(el: Element | null) {
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: el });
  document.dispatchEvent(new Event('fullscreenchange'));
}

let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  window.matchMedia = vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: null });
  document.body.style.overflow = '';
  errorSpy = vi.spyOn(console, 'error');
});

afterEach(() => {
  cleanup();
  expect(errorSpy).not.toHaveBeenCalled();
  vi.restoreAllMocks();
  const proto = HTMLElement.prototype as Partial<HTMLElement>;
  delete proto.requestFullscreen;
  delete (document as Partial<Document>).exitFullscreen;
  delete (document as Partial<FsDocument>).fullscreenElement;
  const wproto = HTMLElement.prototype as unknown as Record<string, unknown>;
  delete wproto.webkitRequestFullscreen;
  const wdoc = document as unknown as Record<string, unknown>;
  delete wdoc.webkitExitFullscreen;
  delete wdoc.webkitFullscreenElement;
  document.body.innerHTML = '';
});

async function renderExplorer() {
  const utils = render(
    <MemoryRouter initialEntries={['/articles/x?alg=alpha&tab=type']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  await screen.findByText(/ESENCIAL-alpha/);
  const section = utils.container.querySelector('section.mlx') as HTMLElement;
  const button = screen.getByRole('button', { name: /pantalla completa/i });
  return { ...utils, section, button };
}

describe('MLExplorer: pantalla completa', () => {
  it('muestra el título «El explorador» y el botón, con icono y texto visible', async () => {
    const { section, button } = await renderExplorer();
    const heading = screen.getByRole('heading', { level: 2, name: 'El explorador' });
    expect(section.contains(heading)).toBe(true);
    expect(heading.classList.contains('mlx-title')).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.textContent).toContain('Pantalla completa');
    const svg = button.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(button.getAttribute('title')).toBeTruthy();
    // El botón va junto al título, en la misma barra.
    expect(heading.parentElement).toBe(button.parentElement);
  });

  it('usa la API nativa y se sincroniza con fullscreenchange', async () => {
    const request = vi.fn(function (this: Element) {
      setFullscreenElement(this);
      return Promise.resolve();
    });
    const exit = vi.fn(() => {
      setFullscreenElement(null);
      return Promise.resolve();
    });
    HTMLElement.prototype.requestFullscreen = request;
    document.exitFullscreen = exit;

    const { section, button } = await renderExplorer();
    await act(async () => {
      fireEvent.click(button);
    });
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.contexts[0]).toBe(section);
    expect(button.textContent).toContain('Salir de pantalla completa');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(section.classList.contains('mlx--full')).toBe(true);
    expect(section.classList.contains('mlx--overlay')).toBe(false);

    // Salir con Esc del navegador: solo llega el evento.
    act(() => setFullscreenElement(null));
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.textContent).toContain('Pantalla completa');
    expect(button.textContent).not.toContain('Salir');
    expect(section.classList.contains('mlx--full')).toBe(false);
    expect(document.activeElement).toBe(button);

    // Y con el propio botón.
    await act(async () => {
      fireEvent.click(button);
    });
    expect(button.getAttribute('aria-pressed')).toBe('true');
    await act(async () => {
      fireEvent.click(button);
    });
    expect(exit).toHaveBeenCalledTimes(1);
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('sin requestFullscreen usa el modo de respaldo y sale con Escape', async () => {
    const { section, button } = await renderExplorer();
    fireEvent.click(button);
    expect(section.classList.contains('mlx--overlay')).toBe(true);
    expect(section.classList.contains('mlx--full')).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(section.classList.contains('mlx--overlay')).toBe(false);
    expect(section.classList.contains('mlx--full')).toBe(false);
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(button);
  });

  it('si requestFullscreen rechaza, cae al modo de respaldo', async () => {
    HTMLElement.prototype.requestFullscreen = vi.fn(() => Promise.reject(new Error('denegado')));
    const { section, button } = await renderExplorer();
    await act(async () => {
      fireEvent.click(button);
    });
    await waitFor(() => expect(section.classList.contains('mlx--overlay')).toBe(true));
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('con el respaldo activo, la ficha 💡 se monta dentro del explorador', async () => {
    const { section, button } = await renderExplorer();
    fireEvent.click(button);
    fireEvent.click(screen.getByRole('button', { name: /feature/i }));
    const dialog = await screen.findByRole('dialog');
    expect(section.contains(dialog)).toBe(true);

    // Escape cierra primero la ficha, no la pantalla completa.
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(section.classList.contains('mlx--overlay')).toBe(true);
  });

  it('con pantalla completa nativa, la ficha 💡 se monta dentro del explorador', async () => {
    HTMLElement.prototype.requestFullscreen = vi.fn(function (this: Element) {
      setFullscreenElement(this);
      return Promise.resolve();
    });
    const { section, button } = await renderExplorer();
    await act(async () => {
      fireEvent.click(button);
    });
    fireEvent.click(screen.getByRole('button', { name: /feature/i }));
    const dialog = await screen.findByRole('dialog');
    expect(section.contains(dialog)).toBe(true);
  });

  it('en pantalla completa, cambiar de algoritmo no hace scroll', async () => {
    const { button } = await renderExplorer();
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      top: -500, bottom: -100, left: 0, right: 800, width: 800, height: 400, x: 0, y: -500, toJSON: () => ({}),
    } as DOMRect);
    fireEvent.click(button);
    const scroll = Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>;
    scroll.mockClear();
    fireEvent.click(screen.getByRole('button', { name: /Beta/ }));
    await screen.findByText(/ESENCIAL-beta/);
    expect(scroll).not.toHaveBeenCalled();
  });
  it('un doble clic mientras requestFullscreen está pendiente pide una sola vez', async () => {
    let resolve!: () => void;
    const request = vi.fn(function (this: Element) {
      return new Promise<void>((r) => {
        resolve = () => {
          setFullscreenElement(this);
          r();
        };
      });
    });
    HTMLElement.prototype.requestFullscreen = request;
    document.exitFullscreen = vi.fn(() => Promise.resolve());
    const { section, button } = await renderExplorer();
    fireEvent.click(button);
    fireEvent.click(button);
    expect(request).toHaveBeenCalledTimes(1);
    expect(document.exitFullscreen).not.toHaveBeenCalled();
    await act(async () => resolve());
    expect(section.classList.contains('mlx--full')).toBe(true);
    expect(section.classList.contains('mlx--overlay')).toBe(false);
  });

  it('si requestFullscreen rechaza tras haber entrado en nativo, no pasa a overlay', async () => {
    HTMLElement.prototype.requestFullscreen = vi.fn(function (this: Element) {
      setFullscreenElement(this);
      return Promise.reject(new Error('tarde'));
    });
    const { section, button } = await renderExplorer();
    await act(async () => {
      fireEvent.click(button);
    });
    expect(section.classList.contains('mlx--full')).toBe(true);
    expect(section.classList.contains('mlx--overlay')).toBe(false);
  });

  it('si exitFullscreen rechaza y seguimos en pantalla completa, el estado sigue en nativo', async () => {
    HTMLElement.prototype.requestFullscreen = vi.fn(function (this: Element) {
      setFullscreenElement(this);
      return Promise.resolve();
    });
    document.exitFullscreen = vi.fn(() => Promise.reject(new Error('no')));
    const { section, button } = await renderExplorer();
    await act(async () => {
      fireEvent.click(button);
    });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(section.classList.contains('mlx--full')).toBe(true);
  });

  it('usa los prefijos webkit (Safari de macOS < 16.4)', async () => {
    const wdoc = document as unknown as Record<string, unknown>;
    const setWebkit = (el: Element | null) => {
      Object.defineProperty(document, 'webkitFullscreenElement', { configurable: true, value: el });
      document.dispatchEvent(new Event('webkitfullscreenchange'));
    };
    const request = vi.fn(function (this: Element) {
      setWebkit(this);
    });
    const exit = vi.fn(() => setWebkit(null));
    (HTMLElement.prototype as unknown as Record<string, unknown>).webkitRequestFullscreen = request;
    wdoc.webkitExitFullscreen = exit;
    const { section, button } = await renderExplorer();
    await act(async () => {
      fireEvent.click(button);
    });
    expect(request).toHaveBeenCalledTimes(1);
    expect(section.classList.contains('mlx--full')).toBe(true);
    expect(section.classList.contains('mlx--overlay')).toBe(false);
    await act(async () => {
      fireEvent.click(button);
    });
    expect(exit).toHaveBeenCalledTimes(1);
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('en overlay, lo que queda fuera del explorador es inert; al salir se restaura', async () => {
    const outside = document.createElement('nav');
    document.body.prepend(outside);
    const { section, button } = await renderExplorer();
    fireEvent.click(button);
    expect(outside.hasAttribute('inert')).toBe(true);
    expect(section.hasAttribute('inert')).toBe(false);
    expect(section.closest('[inert]')).toBeNull();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(outside.hasAttribute('inert')).toBe(false);
  });

  it('desmontar en overlay restaura el overflow, quita inert y los listeners', async () => {
    const outside = document.createElement('nav');
    const alreadyInert = document.createElement('aside');
    alreadyInert.setAttribute('inert', '');
    document.body.prepend(outside, alreadyInert);
    document.body.style.overflow = 'auto';
    const remove = vi.spyOn(document, 'removeEventListener');
    const { button, unmount } = await renderExplorer();
    fireEvent.click(button);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('auto');
    expect(outside.hasAttribute('inert')).toBe(false);
    expect(alreadyInert.hasAttribute('inert')).toBe(true);
    expect(remove).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
