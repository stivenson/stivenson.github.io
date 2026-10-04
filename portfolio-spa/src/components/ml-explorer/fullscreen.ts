import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Pantalla completa del explorador.
 *
 * - «native»: Fullscreen API del navegador (escritorio, Android).
 * - «overlay»: respaldo cuando la API no existe (Safari de iPhone) o el
 *   navegador la rechaza: el explorador se fija sobre la página con CSS.
 */
export type FullscreenMode = 'none' | 'native' | 'overlay';

export const OVERLAY_CLASS = 'mlx--overlay';

/**
 * Dónde montar ventanas emergentes (fichas 💡). Fuera del elemento a
 * pantalla completa no se verían, y bajo el overlay quedarían tapadas.
 */
export function portalTarget(): Element {
  return document.fullscreenElement ?? document.querySelector(`.${OVERLAY_CLASS}`) ?? document.body;
}

export function canUseNativeFullscreen(el: Element): boolean {
  return typeof el.requestFullscreen === 'function';
}

export function useFullscreen(rootRef: RefObject<HTMLElement | null>, buttonRef: RefObject<HTMLElement | null>) {
  const [mode, setMode] = useState<FullscreenMode>('none');

  // La API nativa avisa de entradas y salidas (incluida la tecla Esc del
  // navegador) con `fullscreenchange`: el estado se sincroniza desde ahí.
  useEffect(() => {
    const onChange = () => {
      const root = rootRef.current;
      const isOurs = root !== null && document.fullscreenElement === root;
      setMode((prev) => (isOurs ? 'native' : prev === 'native' ? 'none' : prev));
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [rootRef]);

  // Respaldo: sin scroll de la página detrás y salida con Escape.
  useEffect(() => {
    if (mode !== 'overlay') return;
    const body = document.body;
    const previous = body.style.overflow;
    body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Con una ficha 💡 abierta, Escape solo cierra la ficha.
      if (rootRef.current?.querySelector('[role="dialog"]')) return;
      setMode('none');
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      body.style.overflow = previous;
    };
  }, [mode, rootRef]);

  // Al salir (por cualquier vía), el foco vuelve al botón.
  const prevMode = useRef(mode);
  useEffect(() => {
    if (prevMode.current !== 'none' && mode === 'none') buttonRef.current?.focus();
    prevMode.current = mode;
  }, [mode, buttonRef]);

  const toggle = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    if (mode === 'native') {
      if (typeof document.exitFullscreen === 'function') {
        document.exitFullscreen().catch(() => setMode('none'));
      } else {
        setMode('none');
      }
      return;
    }
    if (mode === 'overlay') {
      setMode('none');
      return;
    }
    if (!canUseNativeFullscreen(root)) {
      setMode('overlay');
      return;
    }
    try {
      root.requestFullscreen().catch(() => setMode('overlay'));
    } catch {
      setMode('overlay');
    }
  }, [mode, rootRef]);

  return { mode, active: mode !== 'none', toggle };
}
