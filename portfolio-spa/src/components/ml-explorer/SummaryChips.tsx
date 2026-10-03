import { TAB_LABELS, type TabId } from './types';

const CHIP_TABS: TabId[] = ['type', 'bestUse', 'pros', 'cons'];

/** La fila del cheatsheet en chips. Cada chip abre su pestaña. */
export function SummaryChips({ row, onPick }: { row: Record<TabId, string>; onPick: (tab: TabId) => void }) {
  return (
    <div className="mlx-chips" role="group" aria-label="Resumen del cheatsheet">
      {CHIP_TABS.map((tab) => (
        <button key={tab} type="button" className={`mlx-chip mlx-chip--${tab}`} onClick={() => onPick(tab)}>
          <span>{TAB_LABELS[tab]}</span>
          {row[tab]}
        </button>
      ))}
    </div>
  );
}
