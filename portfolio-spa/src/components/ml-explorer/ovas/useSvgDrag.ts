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
  const dragging = useRef<{ target: T; pointerId: number } | null>(null);

  const begin = (target: T) => (e: ReactPointerEvent<SVGElement>) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Sin captura el arrastre se perdería al salir del elemento: no arrastrar.
      return;
    }
    dragging.current = { target, pointerId: e.pointerId };
  };

  // Solo el puntero que arrastra puede terminar el arrastre (un segundo dedo no).
  const endIfSame = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (dragging.current?.pointerId === e.pointerId) dragging.current = null;
  };

  const svgProps = {
    ref: svgRef,
    onPointerMove: (e: ReactPointerEvent<SVGSVGElement>) => {
      const drag = dragging.current;
      if (drag === null || drag.pointerId !== e.pointerId || !svgRef.current) return;
      onDrag(drag.target, clientToSvg(svgRef.current, e.clientX, e.clientY));
    },
    onPointerUp: endIfSame,
    onPointerCancel: endIfSame,
    onLostPointerCapture: endIfSame,
  };

  return { svgRef, begin, svgProps };
}
