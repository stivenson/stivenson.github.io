import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

interface LazyIframeProps {
  src: string;
  title?: string;
  style?: CSSProperties;
}

/** Altura reservada antes de medir, para no desplazar el texto al cargar. */
const PLACEHOLDER_HEIGHT = 520;

/**
 * Iframe que (a) solo pide su documento cuando esta cerca del viewport y
 * (b) se ajusta a la altura real de su contenido.
 *
 * El atributo nativo loading="lazy" deja la decision al heuristico del
 * navegador, que en Chrome precarga con un margen muy amplio. Aqui el `src`
 * no se asigna hasta que IntersectionObserver confirma la cercania, asi que
 * las OVAs se descargan a medida que el lector baja por el articulo.
 *
 * La altura se mide del documento incrustado en vez de fijarse a ojo: las
 * OVAs se sirven desde el mismo origen, asi que podemos leer su alto y
 * seguirlo con un ResizeObserver. Resultado: nunca aparece scroll vertical
 * dentro del iframe, y tampoco sobra hueco por debajo. Si el documento
 * fuera de otro origen, el acceso lanza y se conserva la altura reservada.
 */
export function LazyIframe({ src, title, style }: LazyIframeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [height, setHeight] = useState<number | null>(null);
  // Estado de la red de seguridad contra el bucle de medicion (ver measure).
  const lockedRef = useRef(false);
  const rafagaRef = useRef({ desde: 0, cambios: 0, maximo: 0 });

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

  const measure = useCallback(() => {
    const doc = frameRef.current?.contentDocument;
    const body = doc?.body;
    const win = frameRef.current?.contentWindow;
    if (!body || !win) return;
    if (lockedRef.current) return;

    // Se mide el <body>, nunca documentElement.scrollHeight: ese devuelve
    // max(viewport, contenido), y como el viewport del iframe es la altura
    // que acabamos de fijar, la medida se realimenta y crece sin parar.
    // La altura del body si depende solo de su contenido.
    const style = win.getComputedStyle(body);
    const next = Math.ceil(
      body.getBoundingClientRect().height +
        parseFloat(style.marginTop || '0') +
        parseFloat(style.marginBottom || '0')
    );
    if (next <= 0) return;

    // Ademas se ignoran las variaciones de 1px: bastan para encadenar otra
    // notificacion del ResizeObserver y dejar la altura oscilando.
    setHeight((prev) => {
      if (prev !== null && Math.abs(prev - next) <= 1) return prev;

      // Red de seguridad contra el bucle de realimentacion: si una OVA hace
      // que su alto dependa del alto que acabamos de fijarle, las medidas se
      // encadenan sin parar y el panel late a ojos del lector. Cuando se
      // acumulan demasiados cambios en una misma rafaga, se fija el mayor
      // visto y se deja de medir: es preferible un poco de hueco sobrante a
      // un panel que no para quieto.
      const ahora = Date.now();
      if (ahora - rafagaRef.current.desde > 1000) {
        rafagaRef.current = { desde: ahora, cambios: 0, maximo: next };
      }
      rafagaRef.current.cambios += 1;
      rafagaRef.current.maximo = Math.max(rafagaRef.current.maximo, next);

      if (rafagaRef.current.cambios > 40) {
        lockedRef.current = true;
        return rafagaRef.current.maximo;
      }
      return next;
    });
  }, []);

  // El contenido se reacomoda al mover los sliders o al cambiar el ancho, asi
  // que la altura se sigue en vivo en lugar de medirse una sola vez. Va en un
  // efecto y no en onLoad porque React ignora lo que devuelve un manejador de
  // eventos, y el observer quedaria sin desconectar al desmontar.
  useEffect(() => {
    if (!loaded) return;
    measure();

    const doc = frameRef.current?.contentDocument;
    const win = frameRef.current?.contentWindow;
    if (!doc?.body) return;

    // Un cambio de tamano de la ventana es intencion del lector, no el bucle:
    // se levanta el bloqueo para que la OVA vuelva a ajustarse al ancho nuevo.
    const alRedimensionar = () => {
      lockedRef.current = false;
      rafagaRef.current = { desde: 0, cambios: 0, maximo: 0 };
      measure();
    };

    win?.addEventListener('resize', alRedimensionar);

    if (typeof ResizeObserver === 'undefined') {
      return () => win?.removeEventListener('resize', alRedimensionar);
    }

    // Solo el body: observar documentElement lo despertaria en cada cambio
    // de altura del propio iframe, realimentando el ciclo sin aportar nada.
    const observer = new ResizeObserver(measure);
    observer.observe(doc.body);

    return () => {
      observer.disconnect();
      win?.removeEventListener('resize', alRedimensionar);
    };
  }, [loaded, measure]);

  return (
    <div
      ref={containerRef}
      className="markdown-breakout lazy-frame"
      // Marco, margenes y radio viven en CSS (.lazy-frame) para que la regla
      // de pantalla estrecha pueda sacar la OVA a sangre: un estilo inline
      // ganaria siempre a la media query. Aqui solo lo que es dinamico.
      style={{
        ...style,
        // Tras medir, la altura real manda sobre cualquier min-height que
        // venga del Markdown: sin hueco sobrante y sin scroll interno.
        height: height ?? undefined,
        minHeight: height ?? style?.minHeight ?? PLACEHOLDER_HEIGHT,
      }}
    >
      {shouldLoad && (
        <iframe
          ref={frameRef}
          src={src}
          title={title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          // Solo se desactiva el scroll una vez conocemos la altura real.
          // Hacerlo antes recortaria el contenido si la medicion fallara.
          scrolling={height ? 'no' : undefined}
          style={{
            width: '100%',
            height: height ? `${height}px` : '100%',
            border: 0,
            display: 'block',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 400ms ease',
          }}
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
