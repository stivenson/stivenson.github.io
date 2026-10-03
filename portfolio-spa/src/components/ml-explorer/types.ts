import type { ComponentType, ReactNode } from 'react';

/** Las 8 columnas del cheatsheet, en su orden original. */
export const TAB_IDS = [
  'type',
  'bestUse',
  'formula',
  'assumptions',
  'pros',
  'cons',
  'whenNot',
  'realWorld',
] as const;

export type TabId = (typeof TAB_IDS)[number];

export const TAB_LABELS: Record<TabId, string> = {
  type: 'Tipo',
  bestUse: 'Mejor caso de uso',
  formula: 'Fórmula / lógica',
  assumptions: 'Supuestos',
  pros: 'Pros',
  cons: 'Contras',
  whenNot: 'Cuándo no usarlo',
  realWorld: 'Ejemplo real',
};

export type AlgorithmGroup = 'supervised' | 'unsupervised' | 'reduction' | 'neural';

/** Orden de los grupos en el menú izquierdo. */
export const GROUP_ORDER: AlgorithmGroup[] = ['supervised', 'unsupervised', 'reduction', 'neural'];

export const GROUP_LABELS: Record<AlgorithmGroup, string> = {
  supervised: 'Supervisado',
  unsupervised: 'No supervisado',
  reduction: 'Reducción de dimensionalidad',
  neural: 'Redes neuronales',
};

/** Una fila del menú. Liviana: se descarga con el artículo. */
export interface AlgorithmMeta {
  slug: string;
  /** Nombre en inglés, como en el cheatsheet. */
  name: string;
  /** Traducción al español. */
  nameEs: string;
  icon: string;
  group: AlgorithmGroup;
  /** false = aún no implementado (fases siguientes): se muestra como «pronto». */
  available: boolean;
}

export interface TabContent {
  /** Siempre visible: lo entiende alguien sin formación en ML. */
  essential: ReactNode;
  /** Plegado en «Para profundizar»: derivación, complejidad, hiperparámetros. */
  deepDive?: ReactNode;
  /** Mini-demo opcional (solo si enseña algo). */
  demo?: ComponentType;
}

export interface PythonExercise {
  code: string;
  expectedOutput: string;
  /** Id de la celda de título en el notebook de Colab (`#scrollTo=`). */
  colabAnchor: string;
}

export interface FieldExample {
  area: string;
  example: string;
}

/** Contenido completo de un algoritmo. Cada módulo es un chunk aparte. */
export interface AlgorithmModule {
  slug: string;
  /** Texto de la fila del cheatsheet, traducido, una entrada por columna. */
  row: Record<TabId, string>;
  tabs: Record<TabId, TabContent>;
  /** OVA obligatoria; va en la pestaña «formula». */
  Ova: ComponentType;
  python: PythonExercise;
  /** 3 usos en otras ingenierías (pestaña «realWorld»). */
  inYourField: FieldExample[];
  /** Slugs sugeridos en «Cuándo no usarlo». */
  alternatives: string[];
}
