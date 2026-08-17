import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

interface LazyIframeProps {
  src: string;
  title?: string;
  style?: CSSProperties;
}

/**
 * Iframe que solo pide su documento cuando esta cerca del viewport.
 *
 * El atributo nativo loading="lazy" deja la decision al heuristico del
 * navegador, que en Chrome precarga con un margen muy amplio. Aqui el `src`
 * no se asigna hasta que IntersectionObserver confirma la cercania, asi que
 * las OVAs se descargan a medida que el lector baja por el articulo.
 *
 * El contenedor reserva la altura final desde el primer render para que la
 * aparicion del iframe no desplace el texto.
 */
export function LazyIframe({ src, title, style }: LazyIframeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    // Sin IntersectionObserver (navegadores viejos) se carga de inmediato:
    // es preferible a que la OVA nunca aparezca.
    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      // Empieza la descarga ~300px antes de entrar en pantalla para que la
      // OVA este lista cuando el lector llega, sin cargarlas todas de golpe.
      { rootMargin: '300px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const frameStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: 'inherit',
    border: 0,
    display: 'block',
    opacity: loaded ? 1 : 0,
    transition: 'opacity 400ms ease',
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '520px',
        margin: '24px 0',
        border: '1px solid rgba(85, 170, 255, 0.15)',
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'var(--rf-panel-bg, #0a0a2e)',
        ...style,
      }}
    >
      {shouldLoad && (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          style={frameStyle}
        />
      )}

      {!loaded && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            pointerEvents: 'none',
            color: 'var(--rf-text-muted, #8a8ab0)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-xs)',
          }}
        >
          <span
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: '2px solid rgba(85, 170, 255, 0.2)',
              borderTopColor: 'var(--electric-cyan, #55AAFF)',
              animation: 'lazyframe-spin 900ms linear infinite',
            }}
          />
          {title ?? 'Cargando OVA…'}
        </div>
      )}

      <style>{`
        @keyframes lazyframe-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          @keyframes lazyframe-spin { to { transform: none; } }
        }
      `}</style>
    </div>
  );
}
