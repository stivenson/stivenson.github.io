import { motion, useReducedMotion } from 'framer-motion';

const orbitNodes = [
  { label: 'Agentes IA', className: 'ai-orbit-node--agents' },
  { label: 'Full Stack', className: 'ai-orbit-node--fullstack' },
  { label: 'Datos', className: 'ai-orbit-node--data' },
  { label: 'Investigación', className: 'ai-orbit-node--research' },
  { label: 'Educación', className: 'ai-orbit-node--education' },
  { label: 'Open Source', className: 'ai-orbit-node--opensource' },
];

export function AIOrbitScene() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className="ai-orbit-scene"
      role="img"
      aria-label="Sistema orbital que representa las áreas profesionales de Stivenson: agentes de inteligencia artificial, desarrollo full stack, datos, investigación, educación y open source."
      initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="ai-orbit-grid" aria-hidden="true" />
      <div className="ai-orbit-aurora" aria-hidden="true" />

      <svg className="ai-orbit-map" viewBox="0 0 440 340" aria-hidden="true">
        <defs>
          <linearGradient id="orbit-line-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#55AAFF" stopOpacity="0.14" />
            <stop offset="48%" stopColor="#7B68EE" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#55E0D8" stopOpacity="0.16" />
          </linearGradient>
        </defs>
        <ellipse className="ai-orbit-line" cx="220" cy="170" rx="184" ry="75" transform="rotate(-17 220 170)" />
        <ellipse className="ai-orbit-line ai-orbit-line--secondary" cx="220" cy="170" rx="146" ry="116" transform="rotate(37 220 170)" />
        <ellipse className="ai-orbit-line" cx="220" cy="170" rx="106" ry="158" transform="rotate(78 220 170)" />
        <path className="ai-signal-line" d="M76 104 L220 170 L365 86" />
        <path className="ai-signal-line ai-signal-line--delay" d="M70 236 L220 170 L374 232" />
      </svg>

      <div className="ai-core-planet" aria-hidden="true">
        <span className="ai-core-orbit"><i /></span>
        <span className="ai-core-spark">✦</span>
        <strong>IA</strong>
        <small>ecosistema</small>
      </div>

      {orbitNodes.map((node) => (
        <span key={node.label} className={`ai-orbit-node ${node.className}`} aria-hidden="true">
          <i />
          {node.label}
        </span>
      ))}

      <span className="ai-orbit-caption" aria-hidden="true">
        <i /> sistema profesional conectado
      </span>
    </motion.div>
  );
}
