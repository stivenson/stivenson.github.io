import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { fadeUp } from './variants';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
}

export function ScrollReveal({ children, delay = 0, className, once = true }: ScrollRevealProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: '-60px' });

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const variant = delay
    ? {
        ...fadeUp,
        visible: {
          ...fadeUp.visible,
          transition: {
            ...(fadeUp.visible as { transition?: object }).transition,
            delay,
          },
        },
      }
    : fadeUp;

  return (
    <motion.div
      ref={ref}
      variants={variant}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}
