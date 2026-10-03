import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tex } from './Tex';
import { G } from './Gloss';
import { SummaryChips } from './SummaryChips';
import { TypeFigure } from './TypeFigure';
import { InYourField } from './InYourField';
import { DeepDive } from './DeepDive';
import { OvaFrame, OvaSlider } from './ovas/OvaFrame';
import type { AlgorithmGroup, TabId } from './types';

let errorSpy: ReturnType<typeof vi.spyOn>;
let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  // Keys duplicadas y props inválidas de React llegan por console.error/warn.
  expect(errorSpy).not.toHaveBeenCalled();
  expect(warnSpy).not.toHaveBeenCalled();
  vi.restoreAllMocks();
});

describe('render en servidor', () => {
  it('Tex en línea y en bloque lleva MathML', () => {
    expect(renderToStaticMarkup(h(Tex, null, 'x^2'))).toContain('<math');
    const block = renderToStaticMarkup(h(Tex, { block: true, children: '\\frac{a}{b}' }));
    expect(block).toContain('mlx-tex-block');
    expect(block).toContain('<math');
  });

  it('Tex con fórmula inválida no lanza y marca el error', () => {
    const html = renderToStaticMarkup(h(Tex, null, '\\frac{'));
    expect(html).toContain('katex-error');
  });

  it.each<AlgorithmGroup>(['supervised', 'unsupervised', 'reduction', 'neural'])('TypeFigure %s', (group) => {
    const html = renderToStaticMarkup(h(TypeFigure, { group }));
    expect(html).toContain('<svg');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('<figcaption>');
  });

  it('SummaryChips es un grupo con 4 botones', () => {
    const row = { type: 'a', bestUse: 'b', pros: 'c', cons: 'd' } as unknown as Record<TabId, string>;
    const html = renderToStaticMarkup(h(SummaryChips, { row, onPick: () => {} }));
    expect(html).toContain('role="group"');
    expect(html.match(/<button/g)).toHaveLength(4);
  });

  it('InYourField y DeepDive', () => {
    const html = renderToStaticMarkup(
      h(InYourField, { items: [{ area: 'Civil', example: 'x' }, { area: 'Eléctrica', example: 'y' }] }),
    );
    expect(html).toContain('Civil');
    expect(renderToStaticMarkup(h(DeepDive, null, 'más'))).toContain('Para profundizar');
  });

  it('OvaFrame con OvaSlider expone aria-valuetext', () => {
    const slider = h(OvaSlider, { label: 'k', value: 3, min: 1, max: 9, step: 1, onChange: () => {} });
    const html = renderToStaticMarkup(h(OvaFrame, { title: 'T', hint: 'H', controls: slider, readout: 'r', children: 'fig' }));
    expect(html).toContain('aria-valuetext="3"');
  });

  it('G cerrado es un solo botón y no necesita document', () => {
    const html = renderToStaticMarkup(h(G, { k: 'overfitting' }));
    expect(html.match(/<button/g)).toHaveLength(1);
    expect(html).not.toContain('role="dialog"');
  });
});
