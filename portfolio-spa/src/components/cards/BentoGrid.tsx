import type { ReactNode } from 'react';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={`bento-grid ${className ?? ''}`}>
      {children}
    </div>
  );
}
