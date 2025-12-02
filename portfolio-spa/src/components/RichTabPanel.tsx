import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
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
          >
            {tab.icon && <span style={{ marginRight: '6px' }}>{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          className="rf-tabpanel-content"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeContent}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

