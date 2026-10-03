// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigationType } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MLExplorer } from './MLExplorer';
import { control } from './testRegistry';

vi.mock('./registry', () => import('./testRegistry'));

const scrollIntoView = vi.fn();
let reduceMotion = false;

beforeEach(() => {
  control.auto = true;
  reduceMotion = false;
  scrollIntoView.mockClear();
  Element.prototype.scrollIntoView = scrollIntoView;
  window.matchMedia = vi.fn((query: string) => ({
    matches: reduceMotion && query.includes('prefers-reduced-motion: reduce'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  // El explorador quedó por encima de la ventana: si alguien pide scroll, se nota.
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    top: -500, bottom: -100, left: 0, right: 800, width: 800, height: 400, x: 0, y: -500, toJSON: () => ({}),
  } as DOMRect);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

let location = { search: '', navType: '' };
function Spy() {
  const loc = useLocation();
  const navType = useNavigationType();
  location = { search: loc.search, navType };
  return null;
}

function renderAt(search: string) {
  return render(
    <MemoryRouter initialEntries={[`/articles/x${search}`]}>
      <MLExplorer />
      <Spy />
    </MemoryRouter>,
  );
}

/** Llamadas a scrollIntoView sobre el propio explorador (no sobre otros nodos). */
const explorerScrolls = () =>
  scrollIntoView.mock.contexts
    .map((el, i) => ({ el: el as Element, args: scrollIntoView.mock.calls[i] }))
    .filter(({ el }) => el.classList.contains('mlx'));

describe('MLExplorer: scroll al explorador', () => {
  it('sin ?alg, un clic en una pestaña no mueve la página', async () => {
    renderAt('');
    fireEvent.click(await screen.findByRole('tab', { name: 'Pros' }));
    await waitFor(() => expect(location.search).toContain('tab=pros'));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Pros');
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('con el explorador fuera de vista, cambiar de algoritmo hace scroll una vez', async () => {
    renderAt('?alg=alpha&tab=type');
    await screen.findByRole('tab', { name: 'Pros' });
    scrollIntoView.mockClear();
    fireEvent.click(screen.getByRole('button', { name: /Beta/ }));
    await screen.findByText('ESENCIAL-beta-type');
    expect(explorerScrolls()).toHaveLength(1);
    expect(explorerScrolls()[0].args[0]).toMatchObject({ behavior: 'smooth', block: 'start' });
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('con prefers-reduced-motion el scroll es instantáneo', async () => {
    reduceMotion = true;
    renderAt('?alg=alpha&tab=type');
    await screen.findByRole('tab', { name: 'Pros' });
    scrollIntoView.mockClear();
    fireEvent.click(screen.getByRole('button', { name: /Beta/ }));
    await screen.findByText('ESENCIAL-beta-type');
    expect(explorerScrolls()).toHaveLength(1);
    expect(explorerScrolls()[0].args[0]).toMatchObject({ behavior: 'auto' });
  });
});

describe('MLExplorer: URL inválida', () => {
  it('normaliza ?alg y ?tab desconocidos reemplazando la entrada del historial', async () => {
    renderAt('?alg=zzz&tab=hack');
    await waitFor(() => expect(location.search).toBe('?alg=alpha&tab=type'));
    expect(location.navType).toBe('REPLACE');
    expect(await screen.findByText('ESENCIAL-alpha-type')).toBeTruthy();
  });

  it('una URL válida no se reescribe', async () => {
    renderAt('?alg=beta&tab=cons');
    await screen.findByText('ESENCIAL-beta-cons');
    expect(location.search).toBe('?alg=beta&tab=cons');
    expect(location.navType).toBe('POP');
  });
});
