import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { RetroIcon } from './RetroIcon';

interface RichPanelProps {
  title: string;
  icon?: ReactNode | string; // Puede ser ReactNode o string (emoji)
  children: ReactNode;
  electric?: boolean;
  className?: string;
}

export function RichPanel({ title, icon, children, electric = false, className = '' }: RichPanelProps) {
  // Si icon es string, convertir a RetroIcon
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <RetroIcon emoji={icon} size={20} />;
    }
    return icon;
  };

  return (
    <motion.div 
      className={`rf-panel ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`rf-panel-header ${electric ? 'electric' : ''}`}>
        {icon && <span className="rf-panel-icon">{renderIcon()}</span>}
        {title}
      </div>
      <div className="rf-panel-body">
        {children}
      </div>
    </motion.div>
  );
}

