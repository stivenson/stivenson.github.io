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

  return (
    <nav className="mlx-menu" aria-label="Algoritmos">
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
