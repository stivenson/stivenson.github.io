import { motion, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
}

export function GlowCard({ children, className, tilt = false }: GlowCardProps) {
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-60, 60], [4, -4]);
  const rotateY = useTransform(x, [-60, 60], [-4, 4]);

  const activeTilt = tilt && !reducedMotion;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!activeTilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className={`glow-card ${className ?? ''}`}
      style={activeTilt ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={reducedMotion ? undefined : { scale: activeTilt ? 1 : 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
