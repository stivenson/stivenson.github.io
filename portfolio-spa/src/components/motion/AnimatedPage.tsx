import { motion, useReducedMotion } from 'framer-motion';
import { pageVariants } from './variants';

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className }: AnimatedPageProps) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      variants={pageVariants}
      initial={reducedMotion ? false : "initial"}
      exit={reducedMotion ? { opacity: 1, y: 0 } : "exit"}
      animate={reducedMotion ? { opacity: 1, y: 0 } : "enter"}
      className={className}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
}
