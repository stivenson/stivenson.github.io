import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RetroIcon } from './RetroIcon';
import { tabMorphTransition } from './motion/variants';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode | string;
  content: ReactNode;
}

interface RichTabPanelProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function RichTabPanel({ tabs, defaultTab }: RichTabPanelProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className="rf-tabpanel">
      <div className="rf-tabpanel-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`rf-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ position: 'relative' }}
          >
            {activeTab === tab.id && (
              <motion.span
                layoutId="tab-active-indicator"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'var(--border-radius-sm) var(--border-radius-sm) 0 0',
                  background: 'rgba(76, 89, 211, 0.15)',
                  borderBottom: '2px solid var(--electric-blue)',
                }}
                transition={tabMorphTransition}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {tab.icon && (
                typeof tab.icon === 'string' ? (
                  <RetroIcon emoji={tab.icon} size={14} />
                ) : tab.icon
              )}
              {tab.label}
            </span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="rf-tabpanel-content"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {activeContent}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
