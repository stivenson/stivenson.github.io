// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ArticleDetail } from './ArticleDetail';

// Sustituto de la revisión en navegador: monta la ruta real del artículo
// (markdown + embed perezoso del explorador) y revisa la integración.

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
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
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('el artículo del explorador de ML se monta con su guía, sus enlaces y el explorador', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/algoritmos-ml-explorador']}>
      <Routes>
        <Route path="/articles/:slug" element={<ArticleDetail />} />
      </Routes>
    </MemoryRouter>,
  );

  expect(screen.getAllByText('Algoritmos de Machine Learning: Explorador Interactivo').length).toBeGreaterThan(0);
  expect(screen.getByRole('heading', { name: '¿Qué algoritmo necesito?' })).toBeTruthy();

  const links = Array.from(container.querySelectorAll<HTMLAnchorElement>('.markdown-content a'));
  const internal = links.filter((a) => a.getAttribute('href')?.startsWith('#/articles/algoritmos-ml-explorador?alg='));
  const external = links.filter((a) => a.getAttribute('href')?.startsWith('https://colab.research.google.com/'));
  expect(internal).toHaveLength(8);
  expect(external).toHaveLength(2);
  for (const a of internal) {
    expect(a.hasAttribute('target')).toBe(false);
    expect(a.hasAttribute('rel')).toBe(false);
  }
  for (const a of external) {
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
  }

  // El explorador llega en su propio chunk y queda como hijo directo del
  // contenido (para que la regla de ancho completo lo alcance).
  expect(await screen.findByRole('heading', { name: 'Linear Regression' }, { timeout: 10000 })).toBeTruthy();
  expect(container.querySelector('.markdown-content > .mlx')).not.toBeNull();
  expect(container.querySelector('.mlx-boot')).toBeNull();
  // El título «El explorador» lo pone el propio componente (con su botón de
  // pantalla completa), ya no el markdown: debe haber exactamente uno.
  const explorerHeadings = screen.getAllByRole('heading', { level: 2, name: 'El explorador' });
  expect(explorerHeadings).toHaveLength(1);
  expect(container.querySelector('.mlx')?.contains(explorerHeadings[0])).toBe(true);

  // La lista de comprobación (☐) es una lista aparte de la de consejos.
  const checkItems = Array.from(container.querySelectorAll('.markdown-content li')).filter((li) =>
    li.textContent?.includes('☐'),
  );
  expect(checkItems).toHaveLength(5);
  const checkList = checkItems[0].parentElement;
  expect(checkList?.tagName).toBe('OL');
  for (const li of checkItems) expect(li.parentElement).toBe(checkList);
  // Los consejos: la lista UL inmediatamente anterior al OL de ☐ (por estructura, no por texto).
  let tipsList = checkList?.previousElementSibling ?? null;
  while (tipsList && tipsList.tagName !== 'UL' && tipsList.tagName !== 'OL') tipsList = tipsList.previousElementSibling;
  expect(tipsList?.tagName).toBe('UL');
  expect(tipsList).not.toBe(checkList);
  expect(tipsList?.querySelectorAll(':scope > li').length).toBeGreaterThan(0);
  for (const li of Array.from(tipsList!.querySelectorAll(':scope > li'))) expect(li.textContent).not.toContain('☐');

  expect(error).not.toHaveBeenCalled();
});

it('cambiar de pestaña no remonta el explorador', async () => {
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/algoritmos-ml-explorador']}>
      <Routes>
        <Route path="/articles/:slug" element={<ArticleDetail />} />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByRole('heading', { name: 'Linear Regression' }, { timeout: 10000 });
  const before = container.querySelector('.mlx');
  expect(before).not.toBeNull();
  const tabs = await screen.findAllByRole('tab', {}, { timeout: 10000 });
  const target = tabs.find((t) => t.getAttribute('aria-selected') !== 'true')!;
  fireEvent.click(target);
  expect(target.getAttribute('aria-selected')).toBe('true');
  expect(container.querySelector('.mlx')).toBe(before);
});
