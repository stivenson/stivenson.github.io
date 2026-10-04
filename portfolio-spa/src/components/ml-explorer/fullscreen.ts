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
  return fullscreenElement() ?? document.querySelector(`.${OVERLAY_CLASS}`) ?? document.body;
}

// Safari de macOS < 16.4 solo trae la API con prefijo webkit (sin promesas).
type WebkitElement = Element & { webkitRequestFullscreen?: () => void };
type WebkitDocument = Document & { webkitExitFullscreen?: () => void; webkitFullscreenElement?: Element | null };
const CHANGE_EVENTS = ['fullscreenchange', 'webkitfullscreenchange'] as const;

function fullscreenElement(): Element | null {
  return document.fullscreenElement ?? (document as WebkitDocument).webkitFullscreenElement ?? null;
}

export function canUseNativeFullscreen(el: Element): boolean {
  return typeof el.requestFullscreen === 'function' || typeof (el as WebkitElement).webkitRequestFullscreen === 'function';
}

/** Pide pantalla completa; siempre devuelve una promesa (la versión webkit no la da). */
function requestNative(el: Element): Promise<void> {
  try {
    if (typeof el.requestFullscreen === 'function') return Promise.resolve(el.requestFullscreen());
    (el as WebkitElement).webkitRequestFullscreen!();
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

/** Sale de pantalla completa; `null` si el navegador no sabe salir. */
function exitNative(): Promise<void> | null {
  const doc = document as WebkitDocument;
  try {
    if (typeof doc.exitFullscreen === 'function') return Promise.resolve(doc.exitFullscreen());
    if (typeof doc.webkitExitFullscreen === 'function') {
      doc.webkitExitFullscreen();
      return Promise.resolve();
    }
  } catch (err) {
    return Promise.reject(err);
  }
  return null;
}

/**
 * Vuelve `inert` todo lo que está fuera de `root` (los hermanos de cada
 * ancestro hasta <body>) y devuelve cómo deshacerlo. Respeta los que ya lo eran.
 */
function inertOutside(root: Element): () => void {
  const touched: Element[] = [];
  for (let node: Element | null = root; node && node !== document.body; node = node.parentElement) {
    const parent: Element | null = node.parentElement;
    if (!parent) break;
    for (const sibling of Array.from(parent.children)) {
      if (sibling === node || sibling.hasAttribute('inert')) continue;
      if (sibling.tagName === 'SCRIPT' || sibling.tagName === 'STYLE') continue;
      sibling.setAttribute('inert', '');
      touched.push(sibling);
    }
  }
  return () => touched.forEach((el) => el.removeAttribute('inert'));
}

export function useFullscreen(rootRef: RefObject<HTMLElement | null>, buttonRef: RefObject<HTMLElement | null>) {
  const [mode, setMode] = useState<FullscreenMode>('none');

  // La API nativa avisa de entradas y salidas (incluida la tecla Esc del
  // navegador) con `fullscreenchange`: el estado se sincroniza desde ahí.
  useEffect(() => {
    const onChange = () => {
      const root = rootRef.current;
      const isOurs = root !== null && fullscreenElement() === root;
      setMode((prev) => (isOurs ? 'native' : prev === 'native' ? 'none' : prev));
    };
    CHANGE_EVENTS.forEach((type) => document.addEventListener(type, onChange));
    return () => CHANGE_EVENTS.forEach((type) => document.removeEventListener(type, onChange));
  }, [rootRef]);

  // Respaldo: sin scroll de la página detrás y salida con Escape.
  useEffect(() => {
    if (mode !== 'overlay') return;
    const body = document.body;
    const previous = body.style.overflow;
    body.style.overflow = 'hidden';
    // El foco (Tab) y los lectores de pantalla no deben escaparse a la página de detrás.
    const restoreInert = rootRef.current ? inertOutside(rootRef.current) : () => {};
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
      restoreInert();
    };
  }, [mode, rootRef]);

  // Al salir (por cualquier vía), el foco vuelve al botón.
  const prevMode = useRef(mode);
  useEffect(() => {
    if (prevMode.current !== 'none' && mode === 'none') buttonRef.current?.focus();
    prevMode.current = mode;
  }, [mode, buttonRef]);

  // Mientras el navegador decide (requestFullscreen pendiente), los clics se ignoran.
  const pendingRef = useRef(false);

  const toggle = useCallback(() => {
    const root = rootRef.current;
    if (!root || pendingRef.current) return;
    if (mode === 'native') {
      const exiting = exitNative();
      if (exiting === null) {
        setMode('none');
      } else {
        // Si la salida falla pero seguimos a pantalla completa, el estado no cambia.
        exiting.catch(() => {
          if (fullscreenElement() !== root) setMode('none');
        });
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
    pendingRef.current = true;
    requestNative(root)
      // Si `fullscreenchange` ya nos puso en nativo, el rechazo tardío no lo deshace.
      .catch(() => setMode((prev) => (prev === 'native' ? prev : 'overlay')))
      .finally(() => {
        pendingRef.current = false;
      });
  }, [mode, rootRef]);

  return { mode, active: mode !== 'none', toggle };
}
