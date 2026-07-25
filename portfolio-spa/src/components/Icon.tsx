import type { CSSProperties } from 'react';

/* Monoline icon set — coherent with the terminal aesthetic.
   All 24×24, stroke = currentColor, so color comes from the parent. */
export type IconName =
  | 'external' | 'pin' | 'bot' | 'search' | 'cap' | 'folder'
  | 'code' | 'book' | 'link' | 'star' | 'briefcase' | 'cpu'
  | 'activity' | 'sparkle' | 'user';

const PATHS: Record<IconName, string> = {
  external: 'M8 16 16 8 M9 8h7v7',
  pin: 'M12 21s-6-5.7-6-10a6 6 0 1 1 12 0c0 4.3-6 10-6 10z M12 11a2 2 0 1 0 0-.01',
  bot: 'M5 9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z M12 7V4 M9.5 13h.01 M14.5 13h.01',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M21 21l-4.3-4.3',
  cap: 'M22 10 12 5 2 10l10 5 10-5z M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  code: 'M8 9l-3 3 3 3 M16 9l3 3-3 3 M13 7l-2 10',
  book: 'M5 4a2 2 0 0 1 2-2h12v16H7a2 2 0 0 0-2 2z M5 20a2 2 0 0 1 2-2h12',
  link: 'M9 15l6-6 M10.5 7 12 5.5a4 4 0 0 1 6 6L16.5 13 M13.5 17 12 18.5a4 4 0 0 1-6-6L7.5 11',
  star: 'M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 17l-5.3 2.6 1.1-6L4.4 9.4l6-.8z',
  briefcase: 'M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1',
  cpu: 'M6 6h12v12H6z M10 10h4v4h-4z M12 2v2 M12 20v2 M2 12h2 M20 12h2',
  activity: 'M3 12h4l2-7 4 14 2-7h4',
  sparkle: 'M12 4l1.6 4.9L18 10l-4.4 1.1L12 16l-1.6-4.9L6 10l4.4-1.1z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M5 20a7 7 0 0 1 14 0',
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
  title?: string;
}

export function Icon({ name, size = 20, className, style, strokeWidth = 1.75, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path d={PATHS[name]} />
    </svg>
  );
}
