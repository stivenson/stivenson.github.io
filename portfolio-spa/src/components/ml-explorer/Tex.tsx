import katex from 'katex';
import 'katex/dist/katex.min.css';

/** Fórmula con KaTeX. `block` la centra en su propia línea. */
export function Tex({ children, block = false }: { children: string; block?: boolean }) {
  const html = katex.renderToString(children, { displayMode: block, throwOnError: false, output: 'html' });
  return block ? (
    <div className="mlx-tex-block" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}
