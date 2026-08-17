import { useEffect, useState } from 'react';

/**
 * Sigue una media query desde JS.
 *
 * El layout responsive vive en CSS; esto es solo para las decisiones que el
 * CSS no puede tomar — gestionar foco, aria-hidden o el bloqueo de scroll
 * cuando un elemento cambia de rol segun el tamano de pantalla.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const list = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    setMatches(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
