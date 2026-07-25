import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/* A line in the terminal transcript. */
export type TermLine =
  | { kind: 'cmd'; text: string }
  | { kind: 'out'; content: ReactNode }
  | { kind: 'kv'; k: string; v: string }
  | { kind: 'gap' };

interface TerminalHeroProps {
  path: string;
  shell: string;
  lines: TermLine[];
}

const CHAR_MS = 34;   // typewriter speed per character
const CMD_PAUSE = 200; // pause after a command finishes typing
const LINE_MS = 130;  // delay before revealing an output/kv/gap line

export function TerminalHero({ path, shell, lines }: TerminalHeroProps) {
  const reduced = useReducedMotion();
  // When reduced motion: reveal everything at once.
  const [pos, setPos] = useState(() => (reduced ? { line: lines.length, char: 0 } : { line: 0, char: 0 }));
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Reduced motion: skip typing and show the full transcript at once.
  // (useReducedMotion resolves asynchronously, so the useState initializer
  // above can miss it on first render — this effect corrects it.)
  useEffect(() => {
    if (reduced) setPos({ line: lines.length, char: 0 });
  }, [reduced, lines.length]);

  useEffect(() => {
    if (reduced) return;
    const { line, char } = pos;
    if (line >= lines.length) return;

    const current = lines[line];
    if (current.kind === 'cmd') {
      if (char < current.text.length) {
        timer.current = setTimeout(() => setPos({ line, char: char + 1 }), CHAR_MS);
      } else {
        timer.current = setTimeout(() => setPos({ line: line + 1, char: 0 }), CMD_PAUSE);
      }
    } else {
      timer.current = setTimeout(() => setPos({ line: line + 1, char: 0 }), LINE_MS);
    }
    return () => clearTimeout(timer.current);
  }, [pos, lines, reduced]);

  const done = pos.line >= lines.length;

  function renderLine(l: TermLine, i: number) {
    const isActive = i === pos.line;
    const typing = isActive && l.kind === 'cmd' && pos.char < l.text.length;

    switch (l.kind) {
      case 'cmd': {
        const text = isActive ? l.text.slice(0, pos.char) : l.text;
        return (
          <div className="term-line" key={i}>
            <span className="term-prompt">$</span>
            <span className="term-cmd">{text}</span>
            {typing && <span className="term-cursor" aria-hidden="true" />}
          </div>
        );
      }
      case 'out':
        return <div className="term-line term-out" key={i}>{l.content}</div>;
      case 'kv':
        return (
          <div className="term-line term-kv" key={i}>
            <span className="k">{l.k}</span>
            <span className="v">{l.v}</span>
          </div>
        );
      case 'gap':
        return <div className="term-line gap" key={i} aria-hidden="true" />;
    }
  }

  // Reveal fully-processed lines, plus the active line (which may be mid-type).
  const shown = lines.slice(0, Math.min(pos.line + 1, lines.length));

  return (
    <motion.div
      className="terminal"
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="terminal-titlebar">
        <span className="terminal-dot a live" aria-hidden="true" />
        <span className="terminal-path">{path}</span>
        <span className="terminal-shell">{shell}</span>
      </div>
      <div className="terminal-body" role="img" aria-label="Terminal de presentación de Stivenson Rincón Mora">
        {shown.map(renderLine)}
        {/* Final blinking prompt once the transcript finishes. */}
        {done && (
          <div className="term-line">
            <span className="term-prompt">$</span>
            <span className="term-cursor" aria-hidden="true" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
