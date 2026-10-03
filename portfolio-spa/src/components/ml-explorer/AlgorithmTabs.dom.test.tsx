// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AlgorithmTabs } from './AlgorithmTabs';
import { fakeModule, getMeta } from './testRegistry';
import type { TabId } from './types';

vi.mock('./registry', () => import('./testRegistry'));

const scrollIntoView = vi.fn();

beforeEach(() => {
  scrollIntoView.mockClear();
  Element.prototype.scrollIntoView = scrollIntoView;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Harness({ initial = 'type' as TabId }) {
  const [tab, setTab] = useState<TabId>(initial);
  return <AlgorithmTabs module={fakeModule('alpha')} meta={getMeta('alpha')} tab={tab} onTab={setTab} onAlg={() => {}} />;
}

const activeTab = () => screen.getByRole('tab', { selected: true });

describe('AlgorithmTabs: la página no se mueve', () => {
  it('ni al montar ni al cambiar de pestaña llama a scrollIntoView', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('tab', { name: 'Pros' }));
    expect(activeTab().textContent).toBe('Pros');
    fireEvent.keyDown(activeTab(), { key: 'ArrowRight' });
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('desplaza solo la barra en horizontal para mostrar la pestaña activa', () => {
    render(<Harness />);
    const list = screen.getByRole('tablist');
    let scrollLeft = 0;
    Object.defineProperty(list, 'clientWidth', { configurable: true, value: 200 });
    Object.defineProperty(list, 'scrollLeft', {
      configurable: true,
      get: () => scrollLeft,
      set: (v: number) => {
        scrollLeft = v;
      },
    });
    const last = screen.getByRole('tab', { name: 'Ejemplo real' });
    Object.defineProperty(last, 'offsetLeft', { configurable: true, value: 700 });
    Object.defineProperty(last, 'offsetWidth', { configurable: true, value: 100 });
    fireEvent.click(last);
    expect(scrollLeft).toBe(600); // 700 + 100 - 200: el borde derecho queda a la vista

    const first = screen.getByRole('tab', { name: 'Tipo' });
    Object.defineProperty(first, 'offsetLeft', { configurable: true, value: 0 });
    Object.defineProperty(first, 'offsetWidth', { configurable: true, value: 60 });
    fireEvent.click(first);
    expect(scrollLeft).toBe(0);
  });
});

describe('AlgorithmTabs: teclado (roving tabindex)', () => {
  it('flechas con vuelta, Home y End, con el foco en la pestaña activa', async () => {
    render(<Harness />);
    const press = async (key: string) => {
      await act(async () => {
        fireEvent.keyDown(document.activeElement ?? activeTab(), { key });
        // Por si el foco se mueve en el siguiente frame.
        await new Promise((r) => setTimeout(r, 20));
      });
    };
    const expectActive = (label: string) => {
      const tab = activeTab();
      expect(tab.textContent).toBe(label);
      expect(document.activeElement).toBe(tab);
      expect(tab.tabIndex).toBe(0);
      expect(screen.getAllByRole('tab').filter((t) => t.tabIndex === 0)).toHaveLength(1);
    };

    activeTab().focus();
    await press('ArrowRight');
    expectActive('Mejor caso de uso');
    await press('ArrowLeft');
    expectActive('Tipo');
    await press('ArrowLeft');
    expectActive('Ejemplo real');
    await press('ArrowRight');
    expectActive('Tipo');
    await press('End');
    expectActive('Ejemplo real');
    await press('Home');
    expectActive('Tipo');
  });
});
