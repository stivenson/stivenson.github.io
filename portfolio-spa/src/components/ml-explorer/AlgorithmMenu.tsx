import { useEffect, useRef, useState } from 'react';
import { GROUP_LABELS, GROUP_ORDER, type AlgorithmMeta } from './types';

interface AlgorithmMenuProps {
  algorithms: AlgorithmMeta[];
  activeSlug: string;
  onSelect: (slug: string) => void;
  onPrefetch: (slug: string) => void;
}

/**
 * Menú izquierdo: una entrada por fila del cheatsheet. En pantallas
 * estrechas el CSS oculta la lista y muestra el <select>.
 */
export function AlgorithmMenu({ algorithms, activeSlug, onSelect, onPrefetch }: AlgorithmMenuProps) {
  const groups = GROUP_ORDER.map((group) => ({
    group,
    items: algorithms.filter((a) => a.group === group),
  }));

  const navRef = useRef<HTMLElement>(null);
  const [more, setMore] = useState({ up: false, down: false });

  // En escritorio la lista hace scroll dentro del menú: el ítem activo debe
  // verse. Se mueve solo el menú (scrollTop); scrollIntoView movería también
  // la ventana y el lector perdería su sitio en el artículo.
  useEffect(() => {
    const nav = navRef.current;
    const item = nav?.querySelector<HTMLElement>('.mlx-menu-item.is-active');
    if (!nav || !item || nav.scrollHeight <= nav.clientHeight) return;
    const box = nav.getBoundingClientRect();
    const r = item.getBoundingClientRect();
    const pad = 48; // fuera del difuminado de los bordes
    if (r.top < box.top + pad) nav.scrollTop -= box.top + pad - r.top;
    else if (r.bottom > box.bottom - pad) nav.scrollTop += r.bottom - (box.bottom - pad);
  }, [activeSlug]);

  // Difuminado arriba/abajo mientras queden ítems fuera de la vista.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const update = () => {
      const max = nav.scrollHeight - nav.clientHeight;
      const up = max > 1 && nav.scrollTop > 1;
      const down = max > 1 && nav.scrollTop < max - 1;
      setMore((prev) => (prev.up === up && prev.down === down ? prev : { up, down }));
    };
    update();
    nav.addEventListener('scroll', update, { passive: true });
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    ro?.observe(nav);
    return () => {
      nav.removeEventListener('scroll', update);
      ro?.disconnect();
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className={`mlx-menu${more.up ? ' is-more-up' : ''}${more.down ? ' is-more-down' : ''}`}
      aria-label="Algoritmos"
    >
      <label className="mlx-menu-select">
        <span>Algoritmo</span>
        <select value={activeSlug} onChange={(e) => onSelect(e.target.value)}>
          {groups.map(({ group, items }) => (
            <optgroup key={group} label={GROUP_LABELS[group]}>
              {items.map((a) => (
                <option key={a.slug} value={a.slug} disabled={!a.available}>
                  {a.name}
                  {a.available ? '' : ' (próximamente)'}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <div className="mlx-menu-list">
        {groups.map(({ group, items }) => (
          <div key={group} className="mlx-menu-group">
            <h4>{GROUP_LABELS[group]}</h4>
            <ul>
              {items.map((a) => {
                const active = a.slug === activeSlug;
                return (
                  <li key={a.slug}>
                    <button
                      type="button"
                      className={`mlx-menu-item${active ? ' is-active' : ''}`}
                      aria-current={active ? 'true' : undefined}
                      disabled={!a.available}
                      onClick={() => onSelect(a.slug)}
                      onMouseEnter={() => onPrefetch(a.slug)}
                      onFocus={() => onPrefetch(a.slug)}
                    >
                      <span className="mlx-menu-icon" aria-hidden="true">
                        {a.icon}
                      </span>
                      <span className="mlx-menu-name">
                        {a.name}
                        <small>{a.nameEs}</small>
                      </span>
                      {!a.available && <span className="mlx-soon">pronto</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
