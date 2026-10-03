// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MLExplorer } from './MLExplorer';
import { TAB_IDS, TAB_LABELS } from './types';

// Sin mock del registry: monta el explorador con los algoritmos reales y
// descarga sus chunks de verdad (KaTeX, OVA, ejercicio).

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
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('Linear Regression real: carga su chunk y recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Linear Regression' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'formula') {
      const svg = container.querySelector('.mlx-tabpanel svg[role="img"]');
      expect(svg).not.toBeNull();
      expect(svg!.querySelectorAll('circle.is-draggable')).toHaveLength(9);
      expect(container.querySelector('.katex')).not.toBeNull();
    }
  }

  expect(error).not.toHaveBeenCalled();
});
