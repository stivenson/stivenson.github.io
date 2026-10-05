import katex from 'katex';
import { useEffect, useRef, useState } from 'react';
import 'katex/dist/katex.min.css';

/**
 * Fórmula con KaTeX. `block` la centra en su propia línea.
 * `before`/`after` pegan a la fórmula en línea la puntuación que la rodea
 * («($h$», «$h$.»): así un signo nunca queda solo al cambiar de línea.
 */
export function Tex({
  children,
  block = false,
  before,
  after,
}: {
  children: string;
  block?: boolean;
  before?: string;
  after?: string;
}) {
  const html = katex.renderToString(children, { displayMode: block, throwOnError: false, output: 'htmlAndMathml' });
  if (block) return <TexBlock html={html} />;
  const tex = <span dangerouslySetInnerHTML={{ __html: html }} />;
  return before || after ? (
    <span className="mlx-nowrap">
      {before}
      {tex}
      {after}
    </span>
  ) : (
    tex
  );
}

/**
 * Fórmula en bloque. Si no cabe, hace scroll horizontal y el borde por el que
 * sigue se difumina (máscara): así se ve que hay más. La sombra de fondo no
 * basta, porque el texto de la fórmula la tapa.
 */
function TexBlock({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      const left = max > 1 && el.scrollLeft > 1;
      const right = max > 1 && el.scrollLeft < max - 1;
      setEdges((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    // Cambia de ancho al girar el teléfono y al terminar de cargar las fuentes de KaTeX.
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    ro?.observe(el);
    if (el.firstElementChild) ro?.observe(el.firstElementChild);
    return () => {
      el.removeEventListener('scroll', update);
      ro?.disconnect();
    };
  }, [html]);

  const scrolls = edges.left || edges.right;
  return (
    <div
      ref={ref}
      className={`mlx-tex-block${edges.left ? ' is-more-left' : ''}${edges.right ? ' is-more-right' : ''}`}
      // Una región con scroll debe poder recorrerse con el teclado.
      tabIndex={scrolls ? 0 : undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
