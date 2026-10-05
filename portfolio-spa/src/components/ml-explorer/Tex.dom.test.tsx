// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tex } from './Tex';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function fakeWidths(scroll: number, client: number) {
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(scroll);
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(client);
}

describe('Tex en bloque', () => {
  it('si no cabe, difumina el borde derecho y se puede enfocar para hacer scroll', () => {
    fakeWidths(400, 250);
    const { container } = render(<Tex block>{'a + b'}</Tex>);
    const block = container.querySelector('.mlx-tex-block')!;
    expect(block.classList.contains('is-more-right')).toBe(true);
    expect(block.classList.contains('is-more-left')).toBe(false);
    expect(block.getAttribute('tabindex')).toBe('0');
  });

  it('si cabe, ni difuminado ni tabindex', () => {
    fakeWidths(200, 250);
    const { container } = render(<Tex block>{'a + b'}</Tex>);
    const block = container.querySelector('.mlx-tex-block')!;
    expect(block.className).toBe('mlx-tex-block');
    expect(block.hasAttribute('tabindex')).toBe(false);
  });
});

describe('Tex en línea', () => {
  it('before/after van con la fórmula en un nowrap', () => {
    const { container } = render(
      <p>
        <Tex before="(" after=").">{'h'}</Tex>
      </p>,
    );
    const wrap = container.querySelector('.mlx-nowrap')!;
    expect(wrap.firstChild?.textContent).toBe('(');
    expect(wrap.lastChild?.textContent).toBe(').');
    expect(wrap.querySelector('.katex')).not.toBeNull();
  });
});
