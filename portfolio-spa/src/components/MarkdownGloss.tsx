import type { ComponentPropsWithoutRef } from 'react';
import { G } from './ml-explorer/Gloss';
import { GLOSSARY, type GlossaryKey } from './ml-explorer/glossary';

type Props = ComponentPropsWithoutRef<'span'> & { 'data-glossary'?: string };

/** El Markdown usa el mismo glosario y el mismo diálogo que las OVAs. */
export function MarkdownGloss({ 'data-glossary': key, children, ...props }: Props) {
  if (key && Object.hasOwn(GLOSSARY, key)) {
    return <G k={key as GlossaryKey}>{children}</G>;
  }
  // Una clave desconocida conserva el texto legible, sin romper el artículo.
  return <span {...props}>{children}</span>;
}
