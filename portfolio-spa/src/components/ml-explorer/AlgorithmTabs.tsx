import { useCallback, useEffect, useRef, type KeyboardEvent } from 'react';
import { DeepDive } from './DeepDive';
import { InYourField } from './InYourField';
import { PythonRunner } from './PythonRunner';
import { ALGORITHMS, getMeta } from './registry';
import { TypeFigure } from './TypeFigure';
import { TAB_IDS, TAB_LABELS, type AlgorithmMeta, type AlgorithmModule, type TabId } from './types';

interface AlgorithmTabsProps {
  module: AlgorithmModule;
  meta: AlgorithmMeta;
  tab: TabId;
  onTab: (tab: TabId) => void;
  onAlg: (slug: string) => void;
  /** Abre otro algoritmo en su pestaña «Tipo» (botón del pie de Ejemplo real). */
  onGoAlg: (slug: string) => void;
  /** true si `slug` es el algoritmo pedido con «Siguiente algoritmo» (y gasta la petición). */
  consumeReveal: (slug: string) => boolean;
}

/** Las 8 columnas del cheatsheet como pestañas, y el cuerpo de la activa. */
export function AlgorithmTabs({ module, meta, tab, onTab, onAlg, onGoAlg, consumeReveal }: AlgorithmTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const content = module.tabs[tab];
  const { Ova } = module;
  const ovaTab = module.ovaTab ?? 'formula';
  const Demo = content.demo;

  // En móvil la barra de pestañas se desplaza: mantener visible la activa.
  // Solo se mueve la barra (scrollLeft); scrollIntoView movería también la
  // ventana y el lector perdería su sitio en el artículo.
  //
  // El borde izquierdo siempre cae al inicio de una pestaña: así no asoma un
  // trozo suelto («o») de la anterior. offsetLeft es relativo a la barra
  // (.mlx-tablist es position: relative).
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const tabs = [...list.querySelectorAll<HTMLElement>('[role="tab"]')];
    const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    if (i < 0) return;
    const active = tabs[i];
    const left = active.offsetLeft;
    const right = left + active.offsetWidth;
    const width = list.clientWidth;
    const max = Math.max(0, list.scrollWidth - width);
    let target: number | null = null;
    if (left < list.scrollLeft) {
      // Hacia la izquierda: si cabe, también la anterior entera (se ve que hay más).
      const prev = tabs[i - 1];
      target = prev && right - prev.offsetLeft <= width ? prev.offsetLeft : left;
    } else if (right > list.scrollLeft + width) {
      // Hacia la derecha: la primera pestaña que deja a la activa entera a la vista.
      target = tabs.find((t) => t.offsetLeft >= right - width)?.offsetLeft ?? left;
    }
    if (target !== null) list.scrollLeft = max > 0 ? Math.min(target, max) : target;
  }, [tab]);

  /** Lleva la vista al inicio de las pestañas y enfoca la pestaña indicada. */
  const reveal = useCallback((id: TabId) => {
    const list = listRef.current;
    const full = list?.closest('.mlx--full');
    if (full) {
      const main = full.querySelector<HTMLElement>('.mlx-main');
      if (main) main.scrollTop = 0;
    } else {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      list?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
    document.getElementById(`mlx-tab-${id}`)?.focus({ preventScroll: true });
  }, []);

  function goTab(id: TabId) {
    onTab(id);
    reveal(id);
  }

  // Tras «Siguiente algoritmo»: solo si este es el algoritmo que se pidió.
  useEffect(() => {
    if (consumeReveal(meta.slug)) reveal('type');
  }, [meta.slug, consumeReveal, reveal]);

  const idx = TAB_IDS.indexOf(tab);
  const prevTab = idx > 0 ? TAB_IDS[idx - 1] : null;
  const nextTab = idx < TAB_IDS.length - 1 ? TAB_IDS[idx + 1] : null;
  const available = ALGORITHMS.filter((a) => a.available);
  const at = available.findIndex((a) => a.slug === meta.slug);
  const wraps = at === available.length - 1;
  const nextAlg = available.length > 1 ? available[(at + 1) % available.length] : null;

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    // El índice sale de la pestaña que recibió la tecla, no del estado `tab`:
    // con dos flechas seguidas, la segunda llega antes de que React vuelva a
    // pintar y `tab` aún sería el de antes (se perdía una pulsación).
    const fromTarget = TAB_IDS.findIndex((id) => (e.target as HTMLElement).id === `mlx-tab-${id}`);
    const i = fromTarget >= 0 ? fromTarget : TAB_IDS.indexOf(tab);
    const n = TAB_IDS.length;
    const target: Record<string, number> = { ArrowRight: (i + 1) % n, ArrowLeft: (i + n - 1) % n, Home: 0, End: n - 1 };
    if (!(e.key in target)) return;
    e.preventDefault();
    const next = TAB_IDS[target[e.key]];
    onTab(next);
    // Todas las pestañas ya están en el DOM: el foco puede moverse ya.
    // preventScroll: el efecto de arriba se encarga del desplazamiento horizontal.
    document.getElementById(`mlx-tab-${next}`)?.focus({ preventScroll: true });
  }

  return (
    <div className="mlx-tabs">
      <div
        ref={listRef}
        className="mlx-tablist"
        role="tablist"
        aria-label={`Columnas del cheatsheet para ${meta.name}`}
        onKeyDown={onKeyDown}
      >
        {TAB_IDS.map((id) => (
          <button
            key={id}
            id={`mlx-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={id === tab}
            aria-controls="mlx-tabpanel"
            tabIndex={id === tab ? 0 : -1}
            className={`mlx-tab${id === tab ? ' is-active' : ''}`}
            onClick={() => onTab(id)}
          >
            {TAB_LABELS[id]}
          </button>
        ))}
      </div>

      <div className="mlx-tabpanel" role="tabpanel" id="mlx-tabpanel" aria-labelledby={`mlx-tab-${tab}`}>
        <blockquote className="mlx-cheat">
          <span>En el cheatsheet</span>
          {module.row[tab]}
        </blockquote>
        {tab === ovaTab && <Ova autoPlay={module.autoPlayOva} />}
        <div className="mlx-essential">{content.essential}</div>
        {tab === 'type' && <TypeFigure group={meta.group} />}
        {Demo && <Demo />}
        {tab === 'whenNot' && <Alternatives slugs={module.alternatives} onAlg={onAlg} />}
        {tab === 'realWorld' && (
          <>
            <PythonRunner key={module.slug} exercise={module.python} />
            <InYourField items={module.inYourField} />
          </>
        )}
        {content.deepDive && <DeepDive>{content.deepDive}</DeepDive>}
        <nav className="mlx-pager" aria-label="Navegación: pestañas y algoritmos">
          {prevTab && (
            <button type="button" className="mlx-pager-prev" onClick={() => goTab(prevTab)}>
              ← Anterior: {TAB_LABELS[prevTab]}
            </button>
          )}
          {nextTab && (
            <button type="button" className="mlx-pager-next" onClick={() => goTab(nextTab)}>
              Siguiente: {TAB_LABELS[nextTab]} →
            </button>
          )}
          {!nextTab && nextAlg && (
            <button
              type="button"
              className="mlx-pager-next"
              onClick={() => {
                onGoAlg(nextAlg.slug);
              }}
            >
              {wraps ? 'Volver al primer algoritmo' : 'Siguiente algoritmo'}: {nextAlg.name} →
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}

function Alternatives({ slugs, onAlg }: { slugs: string[]; onAlg: (slug: string) => void }) {
  return (
    <div className="mlx-alt">
      <h4>Mejor prueba con</h4>
      <ul>
        {slugs.map((slug) => {
          const meta = getMeta(slug);
          return (
            <li key={slug}>
              <button type="button" disabled={!meta.available} onClick={() => onAlg(slug)}>
                {meta.icon} {meta.name}
                {meta.available ? ' →' : ' (próximamente)'}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
