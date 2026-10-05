// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AlgorithmMenu } from './AlgorithmMenu';
import { ALGORITHMS } from './registry';

// Geometría falsa: menú de 800 px de alto con 1000 px de lista; cada ítem
// mide 48 px y su posición depende del scrollTop del menú.
const scrollTops = new WeakMap<Element, number>();
const rect = (top: number, height: number) =>
  ({ top, bottom: top + height, left: 0, right: 200, width: 200, height, x: 0, y: top, toJSON: () => ({}) }) as DOMRect;

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn() as never;
  Object.defineProperty(HTMLElement.prototype, 'scrollTop', {
    configurable: true,
    get(this: Element) {
      return scrollTops.get(this) ?? 0;
    },
    set(this: Element, v: number) {
      scrollTops.set(this, Math.max(0, Math.min(200, v)));
    },
  });
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(1000);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(800);
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const nav = this.closest('.mlx-menu');
    if (this === nav) return rect(100, 800);
    const items = [...(nav?.querySelectorAll('.mlx-menu-item') ?? [])];
    const i = items.indexOf(this);
    return rect(100 + i * 55 - (nav ? (scrollTops.get(nav) ?? 0) : 0), 48);
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  delete (HTMLElement.prototype as { scrollTop?: number }).scrollTop;
});

function renderMenu(slug: string) {
  return render(<AlgorithmMenu algorithms={ALGORITHMS} activeSlug={slug} onSelect={() => {}} onPrefetch={() => {}} />);
}

describe('AlgorithmMenu en escritorio', () => {
  it('lleva el ítem activo a la vista moviendo solo el menú', () => {
    const { container } = renderMenu('transformer');
    const nav = container.querySelector<HTMLElement>('.mlx-menu')!;
    const active = nav.querySelector('.is-active')!;
    const r = active.getBoundingClientRect();
    expect(nav.scrollTop).toBeGreaterThan(0);
    expect(r.bottom).toBeLessThanOrEqual(100 + 800);
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('con el primer ítem activo no desplaza el menú', () => {
    const { container } = renderMenu('linear-regression');
    expect(container.querySelector<HTMLElement>('.mlx-menu')!.scrollTop).toBe(0);
  });

  it('difumina abajo si quedan ítems debajo, y arriba al desplazarse', () => {
    const { container } = renderMenu('linear-regression');
    const nav = container.querySelector<HTMLElement>('.mlx-menu')!;
    expect(nav.classList.contains('is-more-down')).toBe(true);
    expect(nav.classList.contains('is-more-up')).toBe(false);
    nav.scrollTop = 200;
    fireEvent.scroll(nav);
    expect(nav.classList.contains('is-more-up')).toBe(true);
    expect(nav.classList.contains('is-more-down')).toBe(false);
  });
});
