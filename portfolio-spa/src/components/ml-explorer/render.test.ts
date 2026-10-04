import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tex } from './Tex';
import { G } from './Gloss';
import { SummaryChips } from './SummaryChips';
import { TypeFigure } from './TypeFigure';
import { InYourField } from './InYourField';
import { DeepDive } from './DeepDive';
import { PythonRunner } from './PythonRunner';
import { OvaFrame, OvaSlider } from './ovas/OvaFrame';
import { AlgorithmMenu } from './AlgorithmMenu';
import { AlgorithmTabs } from './AlgorithmTabs';
import { AlgorithmPanel } from './AlgorithmPanel';
import { ALGORITHMS, getMeta } from './registry';
import { TAB_IDS, type AlgorithmGroup, type AlgorithmModule, type TabId } from './types';

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

  it('PythonRunner en estado inicial no crea Worker', () => {
    const exercise = { code: 'print(1 + 1)', expectedOutput: 'SALIDA-2', colabAnchor: 'abc123' };
    const html = renderToStaticMarkup(h(PythonRunner, { exercise }));
    // Renderizar no ejecuta efectos ni handlers: el worker solo se crea al pulsar Ejecutar.
    expect(typeof Worker).toBe('undefined');
    expect(html).toContain('<textarea');
    expect(html).toContain('print(1 + 1)');
    expect(html).toContain('▶ Ejecutar');
    expect(html).toContain('#scrollTo=abc123');
    expect(html).toContain('Salida esperada');
    expect(html).toContain('SALIDA-2');
    expect(html).toContain('Para salir del editor con el teclado: Esc y luego Tab.');
  });

  it('PythonRunner colorea el código en un pre oculto bajo el textarea', () => {
    const exercise = { code: 'import math\nprint(1)', expectedOutput: 'OUT-PLANO', colabAnchor: 'x' };
    const html = renderToStaticMarkup(h(PythonRunner, { exercise }));
    expect(html).toMatch(/<pre[^>]*aria-hidden="true"/);
    // Prism con estilos en línea: `import` es un token con el color de keyword de vscDarkPlus.
    expect(html).toContain('<span class="token" style="color:#569CD6">import</span>');
    expect(html).toContain('aria-label="Código Python editable"');
    // La salida esperada sigue siendo texto plano.
    expect(html).toContain('<pre>OUT-PLANO</pre>');
  });
});

const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;

describe('AlgorithmMenu', () => {
  it('lista 17 algoritmos en 4 grupos, todos «pronto» mientras no haya disponibles', () => {
    const html = renderToStaticMarkup(
      h(AlgorithmMenu, { algorithms: ALGORITHMS, activeSlug: 'knn', onSelect: () => {}, onPrefetch: () => {} }),
    );
    expect(count(html, /<button/g)).toBe(17);
    expect(count(html, /<option/g)).toBe(17);
    expect(count(html, /<optgroup/g)).toBe(4);
    expect(count(html, /mlx-soon/g)).toBe(ALGORITHMS.filter((a) => !a.available).length);
    expect(count(html, /<button[^>]*disabled/g)).toBe(ALGORITHMS.filter((a) => !a.available).length);
    expect(count(html, /<option[^>]*disabled/g)).toBe(ALGORITHMS.filter((a) => !a.available).length);
    expect(count(html, /aria-current="true"/g)).toBe(1);
    expect(html).toMatch(/<button[^>]*aria-current="true"[^>]*>[^]*?KNN/);
  });
});

function fakeModule(): AlgorithmModule {
  const row = {} as Record<TabId, string>;
  const tabs = {} as AlgorithmModule['tabs'];
  TAB_IDS.forEach((id, i) => {
    row[id] = `CHEAT-${id}`;
    tabs[id] = {
      essential: h('p', null, `ESENCIAL-${id}`),
      deepDive: i % 3 === 0 ? h('p', null, `PROFUNDO-${id}`) : undefined,
    };
  });
  return {
    slug: 'fake',
    row,
    tabs,
    Ova: () => h('div', null, 'OVA-FALSA'),
    python: { code: 'print(2 + 2)', expectedOutput: '4', colabAnchor: 'xyz' },
    inYourField: [
      { area: 'Civil', example: 'a' },
      { area: 'Eléctrica', example: 'b' },
      { area: 'Industrial', example: 'c' },
    ],
    alternatives: ['knn', 'naive-bayes'],
  };
}

describe('AlgorithmTabs', () => {
  it.each(TAB_IDS)('pestaña %s', (tab) => {
    const html = renderToStaticMarkup(
      h(AlgorithmTabs, { module: fakeModule(), meta: getMeta('linear-regression'), tab, onTab: () => {}, onAlg: () => {} }),
    );
    expect(html).toContain('role="tablist"');
    expect(count(html, /role="tab"/g)).toBe(8);
    expect(count(html, /aria-selected="true"/g)).toBe(1);
    expect(html).toMatch(new RegExp(`id="mlx-tab-${tab}"[^>]*aria-selected="true"|aria-selected="true"[^>]*id="mlx-tab-${tab}"`));
    expect(html).toContain(`CHEAT-${tab}`);
    expect(html).toContain(`ESENCIAL-${tab}`);
    expect(html.includes('OVA-FALSA')).toBe(tab === 'formula');
    expect(html.includes('<textarea')).toBe(tab === 'realWorld');
    expect(html.includes('En tu área')).toBe(tab === 'realWorld');
    expect(html.includes('Mejor prueba con')).toBe(tab === 'whenNot');
    expect(html.includes('<figure')).toBe(tab === 'type');
    if (tab === 'whenNot') {
      expect(html).toContain('KNN →');
      expect(html).toContain('Naive Bayes (próximamente)');
    }
  });
});

describe('AlgorithmPanel', () => {
  const base = { meta: getMeta('knn'), tab: 'type' as TabId, onTab: () => {}, onAlg: () => {} };

  it('cargando', () => {
    const html = renderToStaticMarkup(h(AlgorithmPanel, { ...base, state: { status: 'loading' } }));
    expect(html).toContain('Cargando KNN…');
    expect(html).toContain('aria-busy="true"');
  });

  it('error con Reintentar', () => {
    const html = renderToStaticMarkup(h(AlgorithmPanel, { ...base, state: { status: 'error', retry: () => {} } }));
    expect(html).toContain('role="alert"');
    expect(html).toContain('Reintentar');
  });
});
