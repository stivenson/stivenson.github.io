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

function Harness({ initial = 'type' as TabId, slug = 'alpha', onGoAlg = () => {}, consumeReveal = () => false }: { initial?: TabId; slug?: string; onGoAlg?: (s: string) => void; consumeReveal?: (s: string) => boolean }) {
  const [tab, setTab] = useState<TabId>(initial);
  return <AlgorithmTabs module={fakeModule(slug)} meta={getMeta(slug)} tab={tab} onTab={setTab} onAlg={() => {}} onGoAlg={onGoAlg} consumeReveal={consumeReveal} />;
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
    expect(scrollLeft).toBe(624); // 700 + 100 + 24 - 200: el borde derecho queda a la vista, fuera del difuminado

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

describe('AlgorithmTabs: navegación al pie', () => {
  const nav = () => screen.getByRole('navigation', { name: 'Navegación: pestañas y algoritmos' });

  it('en la primera pestaña hay Siguiente y no Anterior; el clic avanza, enfoca y desplaza', () => {
    const error = vi.spyOn(console, 'error');
    render(<Harness />);
    expect(screen.getByRole('button', { name: 'Siguiente: Mejor caso de uso →' })).toBeTruthy();
    expect(screen.queryByText(/Anterior/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente: Mejor caso de uso →' }));
    expect(activeTab().textContent).toBe('Mejor caso de uso');
    expect(document.activeElement).toBe(activeTab());
    expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: 'start' }));
    expect(error).not.toHaveBeenCalled();
  });

  it('en una intermedia aparecen ambos y Anterior retrocede', () => {
    render(<Harness initial="formula" />);
    expect(screen.getByRole('button', { name: 'Siguiente: Supuestos →' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '← Anterior: Mejor caso de uso' }));
    expect(activeTab().textContent).toBe('Mejor caso de uso');
    expect(nav()).toBeTruthy();
  });

  it('en Ejemplo real ofrece el siguiente algoritmo disponible', () => {
    const go = vi.fn();
    render(<Harness initial="realWorld" onGoAlg={go} />);
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente algoritmo: Beta →' }));
    expect(go).toHaveBeenCalledWith('beta');
    expect(scrollIntoView).not.toHaveBeenCalled(); // se desplaza al montar el nuevo algoritmo
  });

  it('en el último disponible vuelve al primero', () => {
    const go = vi.fn();
    render(<Harness initial="realWorld" slug="beta" onGoAlg={go} />);
    fireEvent.click(screen.getByRole('button', { name: 'Volver al primer algoritmo: Alpha →' }));
    expect(go).toHaveBeenCalledWith('alpha');
  });

  it('en pantalla completa reinicia el scroll del panel en vez de la ventana', () => {
    const { container } = render(
      <div className="mlx--full">
        <div className="mlx-main">
          <Harness />
        </div>
      </div>,
    );
    const main = container.querySelector<HTMLElement>('.mlx-main')!;
    main.scrollTop = 300;
    fireEvent.click(screen.getByRole('button', { name: /^Siguiente: / }));
    expect(main.scrollTop).toBe(0);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});

describe('AlgorithmTabs: un «Siguiente algoritmo» que no llegó a montar no deja rastro', () => {
  it('si el siguiente algoritmo no carga, otro explorador no hereda el scroll ni el foco', () => {
    const first = render(<Harness initial="realWorld" />);
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente algoritmo: Beta →' }));
    first.unmount(); // el chunk falla: nunca monta el siguiente
    scrollIntoView.mockClear();
    render(<Harness initial="bestUse" slug="beta" />);
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(document.body);
  });
});

describe('AlgorithmTabs: alternativas aún no disponibles', () => {
  // Desde la fase 4 los 17 algoritmos reales están disponibles: «próximamente» se prueba con el registry falso.
  it('una alternativa «pronto» sale deshabilitada y con «(próximamente)»; una disponible lleva «→»', () => {
    const onAlg = vi.fn();
    const mod = { ...fakeModule('alpha'), alternatives: ['beta', 'gamma'] };
    render(<AlgorithmTabs module={mod} meta={getMeta('alpha')} tab="whenNot" onTab={() => {}} onAlg={onAlg} onGoAlg={() => {}} consumeReveal={() => false} />);
    const soon = screen.getByRole('button', { name: 'G Gamma (próximamente)' }) as HTMLButtonElement;
    expect(soon.disabled).toBe(true);
    const ready = screen.getByRole('button', { name: 'B Beta →' }) as HTMLButtonElement;
    expect(ready.disabled).toBe(false);
    fireEvent.click(ready);
    expect(onAlg).toHaveBeenCalledWith('beta');
  });
});
