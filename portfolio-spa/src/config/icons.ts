// Mapeo de emojis a iconos retro de react-old-icons
// Si un icono no existe, se usará el emoji como fallback

// Importar iconos de react-old-icons (solo los que realmente existen)
import {
  Windows95MyComputer,
  WindowsFolder,
  Windows95Notepad,
  WindowsExplorer,
  Windows2000MyDocuments,
} from 'react-old-icons';

// Tipo para el mapeo
export type IconMapping = {
  emoji: string;
  icon?: React.ComponentType<any>;
  alt?: string;
};

// Mapeo de emojis a iconos retro
export const ICON_MAPPING: Record<string, IconMapping> = {
  '🏠': {
    emoji: '🏠',
    icon: Windows95MyComputer,
    alt: 'Home',
  },
  '💼': {
    emoji: '💼',
    // No hay equivalente directo, mantener emoji
    alt: 'Briefcase',
  },
  '📁': {
    emoji: '📁',
    icon: WindowsFolder,
    alt: 'Folder',
  },
  '👤': {
    emoji: '👤',
    // No hay equivalente directo, mantener emoji
    alt: 'User',
  },
  '⚡': {
    emoji: '⚡',
    // No hay equivalente directo, mantener emoji
    alt: 'Lightning',
  },
  '📄': {
    emoji: '📄',
    icon: Windows95Notepad,
    alt: 'Document',
  },
  '🎓': {
    emoji: '🎓',
    // No hay equivalente directo, mantener emoji
    alt: 'Graduation',
  },
  '📚': {
    emoji: '📚',
    icon: Windows2000MyDocuments,
    alt: 'Book',
  },
  '🤖': {
    emoji: '🤖',
    // No hay equivalente directo, mantener emoji
    alt: 'Robot',
  },
  '🛠️': {
    emoji: '🛠️',
    // No hay equivalente directo, mantener emoji
    alt: 'Tools',
  },
  '🧠': {
    emoji: '🧠',
    // No hay equivalente directo, mantener emoji
    alt: 'Brain',
  },
  '🔍': {
    emoji: '🔍',
    icon: WindowsExplorer,
    alt: 'Search',
  },
  '📊': {
    emoji: '📊',
    // No hay equivalente directo, mantener emoji
    alt: 'Chart',
  },
  '🏆': {
    emoji: '🏆',
    // No hay equivalente directo, mantener emoji
    alt: 'Trophy',
  },
  '📌': {
    emoji: '📌',
    // No hay equivalente directo, mantener emoji
    alt: 'Pin',
  },
  '🗂️': {
    emoji: '🗂️',
    icon: WindowsFolder,
    alt: 'Folder',
  },
  '🌟': {
    emoji: '🌟',
    // No hay equivalente directo, mantener emoji
    alt: 'Star',
  },
  '🌱': {
    emoji: '🌱',
    // No hay equivalente directo, mantener emoji
    alt: 'Seedling',
  },
  '💭': {
    emoji: '💭',
    // No hay equivalente directo, mantener emoji
    alt: 'Thought',
  },
  '🎯': {
    emoji: '🎯',
    // No hay equivalente directo, mantener emoji
    alt: 'Target',
  },
  '🚀': {
    emoji: '🚀',
    // No hay equivalente directo, mantener emoji
    alt: 'Rocket',
  },
  '🎭': {
    emoji: '🎭',
    // No hay equivalente directo, mantener emoji
    alt: 'Theater',
  },
  '🙏': {
    emoji: '🙏',
    // No hay equivalente directo, mantener emoji
    alt: 'Prayer',
  },
  '📍': {
    emoji: '📍',
    // No hay equivalente directo, mantener emoji
    alt: 'Location',
  },
  '🔗': {
    emoji: '🔗',
    // No hay equivalente directo, mantener emoji
    alt: 'Link',
  },
  '📦': {
    emoji: '📦',
    // No hay equivalente directo, mantener emoji
    alt: 'Package',
  },
  '🦈': {
    emoji: '🦈',
    // No hay equivalente directo, mantener emoji
    alt: 'Shark',
  },
  '❄️': {
    emoji: '❄️',
    // No hay equivalente directo, mantener emoji
    alt: 'Snowflake',
  },
  '💖': {
    emoji: '💖',
    // No hay equivalente directo, mantener emoji
    alt: 'Heart',
  },
};

// Función helper para obtener el mapeo de un emoji
export function getIconMapping(emoji: string): IconMapping | undefined {
  return ICON_MAPPING[emoji];
}
