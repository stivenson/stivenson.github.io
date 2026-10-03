import type { ReactNode } from 'react';

interface OvaFrameProps {
  title: string;
  /** Qué hacer, en una frase: «Arrastra los puntos…». */
  hint: string;
  children: ReactNode;
  /** Lectura en vivo de lo que muestra la figura. */
  readout?: ReactNode;
  controls?: ReactNode;
}

/** Marco común de todas las OVAs del explorador. */
export function OvaFrame({ title, hint, children, readout, controls }: OvaFrameProps) {
  return (
    <figure className="mlx-ova">
      <figcaption className="mlx-ova-head">
        <strong>🎮 {title}</strong>
        <span>{hint}</span>
      </figcaption>
      <div className="mlx-ova-body">
        <div className="mlx-ova-stage">{children}</div>
        {(controls || readout) && (
          <div className="mlx-ova-side">
            {controls && <div className="mlx-ova-controls">{controls}</div>}
            {readout && (
              <div className="mlx-ova-readout" aria-live="polite">
                {readout}
              </div>
            )}
          </div>
        )}
      </div>
    </figure>
  );
}

interface OvaSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}

export function OvaSlider({ label, value, min, max, step, onChange, format }: OvaSliderProps) {
  return (
    <label className="mlx-slider">
      <span>
        {label} <b>{format ? format(value) : value}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

/** Colores compartidos por las OVAs (clase 0 / clase 1 / acento / error). */
export const OVA_COLORS = {
  class0: '#55AAFF',
  class1: '#FFB454',
  accent: '#10b981',
  risk: '#f43f5e',
  grid: 'rgba(85, 170, 255, 0.12)',
  axis: 'rgba(232, 232, 240, 0.45)',
} as const;
