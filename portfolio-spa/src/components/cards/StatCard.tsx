import { motion, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';

interface StatCardProps {
  value: string;
  label: string;
  accent?: string;
  className?: string;
}

export function StatCard({ value, label, accent, className }: StatCardProps) {
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-40, 40], [3, -3]);
  const rotateY = useTransform(x, [-40, 40], [-3, 3]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotion) return;
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
      className={`stat-card ${className ?? ''}`}
      style={reducedMotion ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <span
        className="stat-number"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </span>
      <span className="stat-label">{label}</span>
    </motion.div>
  );
}
