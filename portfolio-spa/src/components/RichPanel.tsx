import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface RichPanelProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  electric?: boolean;
  className?: string;
}

export function RichPanel({ title, icon, children, electric = false, className = '' }: RichPanelProps) {
  return (
    <motion.div 
      className={`rf-panel ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`rf-panel-header ${electric ? 'electric' : ''}`}>
        {icon && <span className="rf-panel-icon">{icon}</span>}
        {title}
      </div>
      <div className="rf-panel-body">
        {children}
      </div>
    </motion.div>
  );
}

