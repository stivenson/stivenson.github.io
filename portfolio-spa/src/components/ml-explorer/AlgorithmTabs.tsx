import { useEffect, useRef, type KeyboardEvent } from 'react';
import { DeepDive } from './DeepDive';
import { InYourField } from './InYourField';
import { PythonRunner } from './PythonRunner';
import { getMeta } from './registry';
import { TypeFigure } from './TypeFigure';
import { TAB_IDS, TAB_LABELS, type AlgorithmMeta, type AlgorithmModule, type TabId } from './types';

interface AlgorithmTabsProps {
  module: AlgorithmModule;
  meta: AlgorithmMeta;
  tab: TabId;
  onTab: (tab: TabId) => void;
  onAlg: (slug: string) => void;
}

/** Las 8 columnas del cheatsheet como pestañas, y el cuerpo de la activa. */
export function AlgorithmTabs({ module, meta, tab, onTab, onAlg }: AlgorithmTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const content = module.tabs[tab];
  const { Ova } = module;
  const Demo = content.demo;

  // En móvil la barra de pestañas se desplaza: mantener visible la activa.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [tab]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const i = TAB_IDS.indexOf(tab);
    const next = TAB_IDS[(i + (e.key === 'ArrowRight' ? 1 : TAB_IDS.length - 1)) % TAB_IDS.length];
    onTab(next);
    requestAnimationFrame(() => document.getElementById(`mlx-tab-${next}`)?.focus());
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
        <div className="mlx-essential">{content.essential}</div>
        {tab === 'type' && <TypeFigure group={meta.group} />}
        {tab === 'formula' && <Ova />}
        {Demo && <Demo />}
        {tab === 'whenNot' && <Alternatives slugs={module.alternatives} onAlg={onAlg} />}
        {tab === 'realWorld' && (
          <>
            <PythonRunner key={module.slug} exercise={module.python} />
            <InYourField items={module.inYourField} />
          </>
        )}
        {content.deepDive && <DeepDive>{content.deepDive}</DeepDive>}
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
