import { useId, type CSSProperties, type ReactNode } from 'react';

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
}

type LegendMark = 'dot' | 'ring' | 'line' | 'dash' | 'square' | 'cross' | 'gradient';
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
  'Cada árbol corrige al anterior': { context: 'Puntos sintéticos: x es una variable de entrada e y su valor observado.', items: [
    { label: 'Observación: real − predicción > 0', color: '#FFB454', mark: 'dot' },
    { label: 'Observación: real − predicción < 0', color: '#55AAFF', mark: 'dot' },
    { label: 'Predicción del ensamble', color: '#10b981', mark: 'line' },
    { label: 'Residuo (real a predicho)', color: '#9898b0', mark: 'dash' },
  ] },
  'Un cuello de botella que delata el fraude': { context: 'Compras simuladas; las variables y los errores ilustran el método.', items: [
    { label: 'Compra normal', color: '#55AAFF', mark: 'dot' },
    { label: 'Fraude conocido', color: '#FFB454', mark: 'dot' },
    { label: 'Error de reconstrucción alto', color: '#f43f5e', mark: 'ring' },
    { label: 'Conexiones: pesos aprendidos', color: '#10b981', mark: 'line' },
  ] },
  'Grupos por densidad: ε y minPts': { context: 'Coordenadas sintéticas; los grupos se descubren por densidad.', items: [
    { label: 'Color: grupo encontrado', color: '#55AAFF', mark: 'dot' },
    { label: 'Gris: ruido', color: '#9898b0', mark: 'dot' },
    { label: 'Anillo: vecindario ε', color: '#10b981', mark: 'ring' },
    { label: 'Relleno: núcleo; punto hueco: borde', color: '#FFB454', mark: 'ring' },
  ] },
  'Un filtro de 3×3 recorre la imagen': { context: 'Imagen didáctica de un dígito; los valores de píxel son ilustrativos.', items: [
    { label: 'Brillo: intensidad del píxel', color: '#9898b0', mark: 'square' },
    { label: 'Ventana: filtro 3×3', color: '#FFB454', mark: 'ring' },
    { label: 'Activación: respuesta del filtro', color: '#10b981', mark: 'square' },
    { label: 'Conexiones: flujo entre capas', color: '#55AAFF', mark: 'line' },
  ] },
  'El árbol divide el plano en reglas': { context: 'Clientes y etiquetas de ejemplo; coordenadas de ingreso y deuda simuladas.', items: [
    { label: 'Azul / naranja: clase 0 / clase 1', color: '#55AAFF', mark: 'dot' },
    { label: 'Relleno: predicción; borde: clase real', color: '#FFB454', mark: 'ring' },
    { label: 'Región: regla de predicción', color: '#9898b0', mark: 'square' },
    { label: 'Borde discontinuo: error', color: '#f43f5e', mark: 'dash' },
  ] },
  'Cada palabra aporta evidencia': { context: 'Frases de ejemplo para ilustrar clasificación de sentimiento.', items: [
    { label: 'Naranja: favorece positivo / P(positivo) en 3D', color: '#FFB454', mark: 'line' },
    { label: 'Azul: favorece negativo / P(negativo) en 3D', color: '#55AAFF', mark: 'line' },
    { label: 'Segmento punteado en 3D: evidencia de la palabra', color: '#10b981', mark: 'dash' },
    { label: 'Gris: evidencia neutral o desconocida', color: '#9898b0', mark: 'dot' },
  ] },
  'Dos neuronas ocultas resuelven XOR': { context: 'Puntos sintéticos XOR; cada punto es una observación con dos entradas.', items: [
    { label: 'Azul / naranja: clase 0 / clase 1', color: '#55AAFF', mark: 'dot' },
    { label: 'Al final: relleno predicho; borde real', color: '#FFB454', mark: 'ring' },
    { label: 'Nodos: neuronas', color: '#10b981', mark: 'dot' },
    { label: 'Líneas: pesos entre neuronas', color: '#9898b0', mark: 'line' },
  ] },
  'La curva aprende y separa clases': { context: 'Correos de ejemplo; x cuenta menciones de «gratis» y la etiqueta indica spam.', items: [
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
    { label: 'Recta: predicción del modelo', color: '#10b981', mark: 'line' },
    { label: 'Segmento: error (residuo)', color: '#f43f5e', mark: 'dash' },
  ] },
  'Dime con quién andas…': { context: 'Ejemplo de gustos de películas: acción y ciencia ficción; preferencias simuladas.', items: [
    { label: 'Clase: género preferido', color: '#55AAFF', mark: 'dot' },
    { label: 'Punto resaltado: nuevo caso', color: '#FFB454', mark: 'ring' },
    { label: 'Línea: vecinos más cercanos', color: '#10b981', mark: 'line' },
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
    { label: 'Punto / barra: medición de entrada', color: '#55AAFF', mark: 'dot' },
    { label: 'Línea: estado oculto en el tiempo', color: '#10b981', mark: 'line' },
    { label: 'Intensidad: influencia del gradiente', color: '#FFB454', mark: 'square' },
  ] },
  'Muchos árboles votan': { context: 'Clientes simulados; cada árbol emite un voto de clase.', items: [
    { label: 'Azul / naranja: clase 0 / clase 1', color: '#55AAFF', mark: 'dot' },
    { label: 'Relleno / región: clase predicha por mayoría', color: '#FFB454', mark: 'square' },
    { label: 'Borde del punto: clase real', color: '#FFB454', mark: 'ring' },
    { label: 'Anillo: caso de prueba', color: '#10b981', mark: 'ring' },
  ] },
  'La calle más ancha posible': { context: 'Puntos sintéticos con dos clases para visualizar el margen máximo.', items: [
    { label: 'Azul / naranja: clase 0 / clase 1', color: '#55AAFF', mark: 'dot' },
    { label: 'Relleno: predicción; borde: clase real', color: '#FFB454', mark: 'ring' },
    { label: 'Línea central: frontera de decisión', color: '#10b981', mark: 'line' },
    { label: 'Líneas paralelas: margen', color: '#FFB454', mark: 'dash' },
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
export function OvaFrame({ title, hint, children, readout, controls, readoutLive = 'polite' }: OvaFrameProps) {
  const titleId = useId();
  return (
    <figure className="mlx-ova" aria-labelledby={titleId}>
      <figcaption className="mlx-ova-head">
        <strong id={titleId}>
          <span aria-hidden="true">🎮</span> {title}
        </strong>
        <span>{hint}</span>
      </figcaption>
      <div className="mlx-ova-body">
        <div className="mlx-ova-stage">{children}</div>
        {(controls || readout) && (
          <div className="mlx-ova-side">
            {controls && <div className="mlx-ova-controls">{controls}</div>}
            {readout && (
              <div className="mlx-ova-readout" role="status" aria-live={readoutLive} aria-atomic="true">
                {readout}
              </div>
            )}
          </div>
        )}
      </div>
      {OVA_LEGENDS[title] && <OvaLegend spec={OVA_LEGENDS[title]} />}
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
