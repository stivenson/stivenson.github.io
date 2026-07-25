import type { ReactNode } from 'react';

interface CommandLineProps {
  /** The command after the $ prompt, e.g. "cat cv.md". */
  command: string;
  /** Output rendered below the command line. */
  children?: ReactNode;
}

/**
 * Lightweight terminal-prompt page header. Echoes the hero's terminal language
 * without the full window chrome — keeps the hero as the one orchestrated moment.
 */
export function CommandLine({ command, children }: CommandLineProps) {
  return (
    <div className="cmd-header animate-fade-in">
      <div className="cmd-header-line">
        <span className="term-prompt">$</span>
        <span className="term-cmd">{command}</span>
      </div>
      {children != null && <div className="cmd-header-out">{children}</div>}
    </div>
  );
}
