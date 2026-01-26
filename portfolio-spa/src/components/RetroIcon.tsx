import { FEATURES } from '../config/features';
import { getIconMapping } from '../config/icons';

interface RetroIconProps {
  emoji: string; // Fallback emoji
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
  useRetro?: boolean; // Override feature flag
}

export function RetroIcon({
  emoji,
  size = 24,
  className = '',
  style = {},
  alt,
  useRetro,
}: RetroIconProps) {
  // Determinar si usar iconos retro
  const shouldUseRetro = useRetro !== undefined ? useRetro : FEATURES.USE_RETRO_ICONS;

  // Obtener mapeo del emoji
  const mapping = getIconMapping(emoji);
  const IconComponent = mapping?.icon;
  const iconAlt = alt || mapping?.alt || emoji;

  // Si no debemos usar retro o no hay componente, renderizar emoji
  if (!shouldUseRetro || !IconComponent) {
    return (
      <span
        className={className}
        style={{
          fontSize: typeof size === 'number' ? `${size}px` : size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
        role="img"
        aria-label={iconAlt}
      >
        {emoji}
      </span>
    );
  }

  // Renderizar icono retro
  return (
    <IconComponent
      size={size}
      className={className}
      style={style}
      alt={iconAlt}
    />
  );
}
