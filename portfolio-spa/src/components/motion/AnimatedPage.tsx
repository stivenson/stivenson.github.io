import { motion } from 'framer-motion';
import { pageVariants } from './variants';

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className={className}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
}
