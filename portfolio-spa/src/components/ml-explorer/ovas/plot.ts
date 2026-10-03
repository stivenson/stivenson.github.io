/** Escalas lineales entre coordenadas de datos y coordenadas del SVG. */
export interface Plot {
  width: number;
  height: number;
  pad: number;
  sx(x: number): number;
  sy(y: number): number;
  ix(px: number): number;
  iy(py: number): number;
}

export function createPlot(
  width: number,
  height: number,
  pad: number,
  [x0, x1]: [number, number],
  [y0, y1]: [number, number],
): Plot {
  if (x0 === x1 || y0 === y1) throw new Error('Dominio vacío en createPlot');
  const w = width - 2 * pad;
  const h = height - 2 * pad;
  return {
    width,
    height,
    pad,
    sx: (x) => pad + ((x - x0) / (x1 - x0)) * w,
    sy: (y) => height - pad - ((y - y0) / (y1 - y0)) * h,
    ix: (px) => x0 + ((px - pad) / w) * (x1 - x0),
    iy: (py) => y0 + ((height - pad - py) / h) * (y1 - y0),
  };
}
