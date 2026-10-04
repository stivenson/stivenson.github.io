import { useEffect, useState, type RefObject } from 'react';

const REDUCE = '(prefers-reduced-motion: reduce)';

const reduceQuery = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(REDUCE) : null;

/** true si el lector pidió menos movimiento en su sistema. Se actualiza si cambia. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => reduceQuery()?.matches ?? false);
  useEffect(() => {
    const query = reduceQuery();
    if (!query) return;
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/**
 * true mientras el elemento se ve en pantalla. Sin IntersectionObserver
 * (navegadores viejos, tests) se supone visible.
 */
export function useInViewport(ref: RefObject<Element | null>): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}
