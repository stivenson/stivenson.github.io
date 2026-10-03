// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
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
  expect(internal).toHaveLength(4);
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

  expect(error).not.toHaveBeenCalled();
});
