import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface TimelineItemData {
  date: string;
  title: string;
  subtitle?: string;
  content: ReactNode;
}

interface TimelineProps {
  items: TimelineItemData[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="rf-timeline">
      {items.map((item, index) => (
        <motion.div
          key={index}
          className="rf-timeline-item"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="rf-timeline-date">{item.date}</div>
          <div className="rf-timeline-title">{item.title}</div>
          {item.subtitle && (
            <div className="rf-timeline-subtitle">{item.subtitle}</div>
          )}
          <div className="rf-timeline-content">{item.content}</div>
        </motion.div>
      ))}
    </div>
  );
}

