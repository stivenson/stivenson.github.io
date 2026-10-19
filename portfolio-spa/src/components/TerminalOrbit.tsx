import { useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

/** One quiet orbital accent, paused whenever it leaves the viewport. */
export function TerminalOrbit() {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  const reducedMotion = useReducedMotion();
  return (
    <span ref={ref} className={`terminal-orbit${inView && !reducedMotion ? ' is-moving' : ''}`} aria-hidden="true">
      <span className="terminal-orbit-ring terminal-orbit-ring--outer" />
      <span className="terminal-orbit-ring terminal-orbit-ring--inner" />
      <span className="terminal-orbit-track"><span /></span>
      <span className="terminal-orbit-core" />
    </span>
  );
}
