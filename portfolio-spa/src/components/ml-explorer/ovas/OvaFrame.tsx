import './OvaParameters.css';
import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import type { OvaPlayback } from './useAutoLoop';

interface OvaFrameProps {
  title: string;
  /** Qué hacer, en una frase: «Arrastra los puntos…». */
  hint: string;
  children: ReactNode;
  /** Lectura en vivo de lo que muestra la figura. */
  readout?: ReactNode;
  /** «off» silencia el readout (p. ej. mientras una animación lo cambia cada segundo). */
  readoutLive?: 'polite' | 'off';
  controls?: ReactNode;
  controlsCollapsed?: boolean;
  playback?: OvaPlayback;
  /** Nombre significativo de la etapa actual, cuando «Paso x de y» no basta. */
  progressLabel?: ReactNode;
  explanation?: ReactNode;
}

type LegendMark = 'dot' | 'ring' | 'line' | 'dash' | 'square' | 'cross' | 'gradient' | 'diamond' | 'selected-dot' | 'bicolor-line' | 'green-violet-line' | 'green-red-line' | 'dash-ring';
interface LegendItem {
  label: string;
  color: string;
  mark?: LegendMark;
}

interface OvaLegendSpec {
  context: string;
  items: LegendItem[];
}

const OVA_LEGENDS: Record<string, OvaLegendSpec> = {
  'Un cuello de botella que delata el fraude': { context: 'Compras simuladas; las variables y los errores ilustran el método.', items: [
    { label: 'Compra normal', color: '#55AAFF', mark: 'dot' },
    { label: 'Fraude conocido', color: '#FFB454', mark: 'dot' },
    { label: 'Error de reconstrucción alto', color: '#f43f5e', mark: 'ring' },
    { label: 'Conexiones: pesos aprendidos', color: '#10b981', mark: 'line' },
  ] },
  'Grupos por densidad: ε y minPts': { context: 'Coordenadas sintéticas; los grupos se descubren por densidad.', items: [
    { label: 'Color: grupo encontrado', color: '#55AAFF', mark: 'dot' },
    { label: 'Gris: ruido', color: '#9898b0', mark: 'dot' },
    { label: 'Círculo / rombo: vecindario ε; blanco: punto observado', color: '#10b981', mark: 'ring' },
    { label: 'Relleno: núcleo; punto hueco: borde', color: '#FFB454', mark: 'ring' },
  ] },
  'Un filtro de 3×3 recorre la imagen': { context: 'Dígito manuscrito real de 8×8 de scikit-learn; intensidades de píxel entre 0 y 16.', items: [
    { label: 'Brillo: intensidad del píxel', color: '#9898b0', mark: 'square' },
    { label: 'Marco verde: ventana actual 3×3', color: '#10b981', mark: 'ring' },
    { label: 'Activación: respuesta del filtro', color: '#10b981', mark: 'square' },
    { label: 'Línea verde / roja: peso positivo / negativo', color: '#10b981', mark: 'green-red-line' },
    { label: 'Marcos discontinuos: bloques 2×2 del pooling', color: '#e8e8f0', mark: 'dash' },
  ] },
  'El árbol divide el plano en reglas': { context: 'Clientes y etiquetas de ejemplo; coordenadas de ingreso y deuda simuladas.', items: [
    { label: 'Azul / naranja: clase 0 / clase 1', color: '#55AAFF', mark: 'dot' },
    { label: 'Relleno: predicción; borde: clase real', color: '#FFB454', mark: 'ring' },
    { label: 'Región: regla de predicción', color: '#9898b0', mark: 'square' },
    { label: 'Línea verde: regla nueva de este paso', color: '#10b981', mark: 'line' },
    { label: 'Borde discontinuo: error', color: '#f43f5e', mark: 'dash' },
  ] },
  'Cada palabra aporta evidencia': { context: 'Frases de ejemplo para ilustrar clasificación de sentimiento.', items: [
    { label: 'Naranja: favorece positivo / P(positivo) en 3D', color: '#FFB454', mark: 'line' },
    { label: 'Azul: favorece negativo / P(negativo) en 3D', color: '#55AAFF', mark: 'line' },
    { label: 'Unión en 3D: mismo paso, dos probabilidades', color: '#10b981', mark: 'dash' },
    { label: 'Gris: evidencia neutral o desconocida', color: '#9898b0', mark: 'dot' },
  ] },
  'Una red de dos neuronas ocultas para XOR': { context: 'Puntos sintéticos XOR; cada punto es una observación con dos entradas.', items: [
    { label: 'Azul / naranja: clase 0 / clase 1', color: '#55AAFF', mark: 'dot' },
    { label: 'Al final: relleno predicho; borde real', color: '#FFB454', mark: 'ring' },
    { label: 'Anillo blanco discontinuo: caso seguido', color: '#ffffff', mark: 'dash-ring' },
    { label: 'Verde / violeta en el plano: cortes de h₁ / h₂', color: '#10b981', mark: 'green-violet-line' },
    { label: 'Nodos: neuronas', color: '#10b981', mark: 'dot' },
    { label: 'Líneas: pesos entre neuronas', color: '#9898b0', mark: 'line' },
  ] },
  'La curva aprende y separa clases': { context: 'Correos de ejemplo; x es la frecuencia de «gratis» por 100 palabras y la etiqueta indica spam.', items: [
    { label: 'Correo normal', color: '#55AAFF', mark: 'dot' },
    { label: 'Correo spam', color: '#FFB454', mark: 'dot' },
    { label: 'Curva: probabilidad estimada', color: '#10b981', mark: 'line' },
    { label: 'Umbral: decisión de clase', color: '#f43f5e', mark: 'dash' },
  ] },
  'Unir los puntos de abajo hacia arriba': { context: 'Coordenadas sintéticas; la altura del dendrograma representa distancia de unión.', items: [
    { label: 'Punto: observación', color: '#55AAFF', mark: 'dot' },
    { label: 'Rama: fusión de grupos', color: '#10b981', mark: 'line' },
    { label: 'Corte: número de grupos elegido', color: '#FFB454', mark: 'dash' },
  ] },
  'La recta que menos se equivoca': { context: 'Observaciones sintéticas; x e y son variables numéricas de ejemplo.', items: [
    { label: 'Punto: valor observado', color: '#55AAFF', mark: 'dot' },
    { label: 'Anillo rosa: último outlier añadido', color: '#f43f5e', mark: 'ring' },
    { label: 'Recta: predicción del modelo', color: '#10b981', mark: 'line' },
    { label: 'Segmento: error (residuo)', color: '#f43f5e', mark: 'dash' },
  ] },
  'Dime con quién andas…': { context: 'Ejemplo de gustos de películas: acción y ciencia ficción; preferencias simuladas.', items: [
    { label: 'Azul: no le gustó', color: '#55AAFF', mark: 'dot' },
    { label: 'Naranja: le gustó', color: '#FFB454', mark: 'dot' },
    { label: 'Rombo: persona nueva; su color es la predicción', color: '#FFB454', mark: 'diamond' },
    { label: 'Borde blanco: vecino seleccionado', color: '#55AAFF', mark: 'selected-dot' },
    { label: 'Línea azul o naranja: voto de ese vecino', color: '#55AAFF', mark: 'bicolor-line' },
    { label: 'Contorno discontinuo: alcance según la métrica', color: '#aeb8cc', mark: 'dash-ring' },
  ] },
  'Centroides que se mueven solos': { context: 'Coordenadas sintéticas; K-means asigna cada observación al centro más próximo.', items: [
    { label: 'Color: grupo asignado', color: '#55AAFF', mark: 'dot' },
    { label: 'Cruz: centroide del grupo', color: '#FFB454', mark: 'cross' },
    { label: 'Línea: distancia al centroide', color: '#10b981', mark: 'line' },
  ] },
  'Gira el eje y mira cuánto captura': { context: 'Datos numéricos sintéticos; color indica proyección, no una clase.', items: [
    { label: 'Punto: observación original', color: '#9898b0', mark: 'dot' },
    { label: 'Color: valor proyectado, de negativo a positivo', color: '#55AAFF', mark: 'gradient' },
    { label: 'Eje: componente principal', color: '#10b981', mark: 'line' },
    { label: 'Segmento: distancia de proyección', color: '#f43f5e', mark: 'dash' },
  ] },
  'Mapa de atención de una frase': { context: 'Frase didáctica; los pesos de atención son una visualización simplificada.', items: [
    { label: 'Nodo: token de la frase', color: '#55AAFF', mark: 'dot' },
    { label: 'Línea: atención entre tokens', color: '#10b981', mark: 'line' },
    { label: 'Grosor / intensidad: peso de atención', color: '#FFB454', mark: 'dash' },
  ] },
  'La memoria de una RNN se desvanece': { context: 'Secuencia de mediciones simuladas para explicar memoria temporal.', items: [
    { label: 'Nodos verdes: entradas ya leídas', color: '#10b981', mark: 'dot' },
    { label: 'Arcos violetas: memoria que pasa entre estados', color: '#c084fc', mark: 'line' },
    { label: 'Barra rosa: dato más antiguo', color: '#f43f5e', mark: 'square' },
    { label: 'Barra verde: dato más reciente', color: '#10b981', mark: 'square' },
    { label: 'Barras azules: datos intermedios', color: '#55AAFF', mark: 'square' },
  ] },
  'Muchos árboles votan': { context: 'Clientes simulados según ingreso y deuda; el bosque predice si pagan.', items: [
    { label: 'Azul: paga', color: '#55AAFF', mark: 'dot' },
    { label: 'Naranja: no paga', color: '#FFB454', mark: 'dot' },
    { label: 'Relleno del punto: predicción; borde: respuesta real', color: '#FFB454', mark: 'ring' },
    { label: 'Fondo más intenso: mayor acuerdo entre árboles', color: '#55AAFF', mark: 'square' },
    { label: 'Anillo blanco: caso contradictorio (ruido)', color: '#e8e8f0', mark: 'ring' },
  ] },
  'La calle más ancha posible': { context: '22 puntos simulados para comparar kernel, C y gamma; cifras de entrenamiento.', items: [
    { label: 'Azul / naranja: clase 0 / clase 1', color: '#55AAFF', mark: 'dot' },
    { label: 'Relleno: predicción; borde: clase real', color: '#FFB454', mark: 'ring' },
    { label: 'Centro verde: frontera de decisión', color: '#10b981', mark: 'line' },
    { label: 'Franja tenue: zona de margen (RBF: espacio del kernel)', color: '#9898b0', mark: 'square' },
    { label: 'Anillo blanco: vector soporte', color: '#ffffff', mark: 'ring' },
  ] },
};

function OvaLegend({ spec }: { spec: OvaLegendSpec }) {
  return (
    <div className="mlx-ova-legend" role="group" aria-label="Leyenda de la animación">
      <span className="mlx-ova-legend-context">{spec.context}</span>
      <ul>
        {spec.items.map((item) => (
          <li key={item.label}>
            <span className={`mlx-ova-legend-mark is-${item.mark ?? 'dot'}`} style={{ '--legend-color': item.color } as CSSProperties} aria-hidden="true" />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Marco común de todas las OVAs del explorador. */
export function OvaFrame({ title, hint, children, readout, controls, controlsCollapsed = false, playback, progressLabel, explanation, readoutLive = 'polite' }: OvaFrameProps) {
  const titleId = useId();
  const [expanded, setExpanded] = useState(false);
  return (
    <figure className={`mlx-ova${expanded ? ' mlx-ova--expanded' : ''}`} aria-labelledby={titleId}>
      <figcaption className="mlx-ova-head">
        <strong id={titleId}>
          <span aria-hidden="true">🎮</span> {title}
        </strong>
        <details className="mlx-ova-help">
          <summary>Cómo leer esta animación</summary>
          <span>{hint}</span>
        </details>
      </figcaption>
      {playback && <OvaPlaybackControls playback={playback} progressLabel={progressLabel} />}
      <button type="button" className="mlx-ova-size" aria-pressed={expanded} onClick={() => setExpanded((value) => !value)}>
        {expanded ? 'Vista compacta' : 'Ampliar gráfico'}
      </button>
      <div className="mlx-ova-body">
        <div className="mlx-ova-stage">{children}</div>
        {(controls || readout || explanation || OVA_LEGENDS[title]) && (
          <div className="mlx-ova-side">
            {explanation && <div className="mlx-ova-explanation" aria-live={playback?.playing ? 'off' : 'polite'} aria-atomic="true">
              <strong>Qué está pasando</strong>
              <span>{explanation}</span>
            </div>}
            {controls && (controlsCollapsed ? (
              <details className="mlx-ova-parameters">
                <summary>Ajustar pesos y sesgos</summary>
                <div className="mlx-ova-controls">{controls}</div>
              </details>
            ) : <div className="mlx-ova-controls">{controls}</div>)}
            {readout && (
              <div className="mlx-ova-readout" role="status" aria-live={playback ? playback.playing ? 'off' : 'polite' : readoutLive} aria-atomic="true">
                {readout}
              </div>
            )}
            {OVA_LEGENDS[title] && <OvaLegend spec={OVA_LEGENDS[title]} />}
          </div>
        )}
      </div>
    </figure>
  );
}

function OvaPlaybackControls({ playback: p, progressLabel }: { playback: OvaPlayback; progressLabel?: ReactNode }) {
  return (
    <div className="mlx-ova-playback" role="group" aria-label="Reproducción de la animación">
      <div className="mlx-ova-playback-buttons">
        <button className="mlx-ova-toggle" type="button" onClick={p.toggle} disabled={p.reducedMotion || p.last === 0}>
          <span className={`mlx-ova-toggle-icon ${p.playing ? 'is-pause' : 'is-play'}`} aria-hidden="true" />
          <span>{p.playing ? 'Pausar' : p.step === p.last && p.last > 0 ? 'Reproducir de nuevo' : 'Reproducir'}</span>
        </button>
        <button type="button" onClick={p.previous} disabled={p.step === 0}>Paso anterior</button>
        <button type="button" onClick={p.next} disabled={p.step >= p.last}>Siguiente paso</button>
        <button type="button" onClick={p.restart} disabled={p.step === 0 && !p.playing}>Reiniciar</button>
      </div>
      <span className="mlx-ova-progress" data-step={p.step} data-last={p.last}>
        {progressLabel ?? <>Paso {p.step} de {p.last}</>}
      </span>
      <label>Velocidad{' '}
        <select value={p.speed} onChange={(e) => p.setSpeed(Number(e.target.value))} disabled={p.reducedMotion}>
          <option value={0.5}>Lenta (0,5×)</option>
          <option value={1}>Normal (1×)</option>
          <option value={2}>Rápida (2×)</option>
        </select>
      </label>
      <label><input type="checkbox" checked={p.repeat} onChange={(e) => p.setRepeat(e.target.checked)} /> Repetir</label>
      {p.reducedMotion && <small>Movimiento reducido: recorre la animación con los botones de paso.</small>}
    </div>
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
        {label} <b aria-hidden="true">{format ? format(value) : value}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={format ? format(value) : String(value)}
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

/** Colores de los grupos en las OVAs de agrupamiento (hasta 6) y del ruido. */
export const CLUSTER_COLORS = ['#55AAFF', '#FFB454', '#10b981', '#c084fc', '#f472b6', '#facc15'] as const;
export const NOISE_COLOR = '#9898b0';
