import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import type { Pt } from './ovaMath';

/** Convierte la posición del puntero en coordenadas del viewBox del SVG. */
export function clientToSvg(svg: SVGSVGElement, clientX: number, clientY: number): Pt {
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}

/**
 * Arrastrar elementos dentro de un SVG con eventos de puntero (mouse, touch
 * y lápiz). `begin(target)` va en el onPointerDown del elemento; `svgProps`
 * se esparcen en el <svg>. El elemento captura el puntero, así que el
 * arrastre sigue aunque el dedo salga de él.
 */
export function useSvgDrag<T>(onDrag: (target: T, point: Pt) => void) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<T | null>(null);

  const begin = (target: T) => (e: ReactPointerEvent<SVGElement>) => {
    e.preventDefault();
    dragging.current = target;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const end = () => {
    dragging.current = null;
  };

  const svgProps = {
    ref: svgRef,
    onPointerMove: (e: ReactPointerEvent<SVGSVGElement>) => {
      if (dragging.current === null || !svgRef.current) return;
      onDrag(dragging.current, clientToSvg(svgRef.current, e.clientX, e.clientY));
    },
    onPointerUp: end,
    onPointerCancel: end,
  };

  return { svgRef, begin, svgProps };
}
