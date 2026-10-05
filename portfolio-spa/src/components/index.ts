export { RichPanel } from './RichPanel';
export { RichTabPanel } from './RichTabPanel';
export { RichTable } from './RichTable';
export { Sidebar } from './Sidebar';
export { Header } from './Header';
export { Timeline } from './Timeline';
export { Tag, TagList } from './Tag';
export { RetroIcon } from './RetroIcon';
// MarkdownRenderer no se exporta aquí: impórtalo de './MarkdownRenderer' para
// que sus dependencias pesadas queden en el chunk diferido de los artículos.
export { InteractiveSVG } from './InteractiveSVG';
export { LazyIframe } from './LazyIframe';
export { TerminalHero } from './TerminalHero';
export type { TermLine } from './TerminalHero';
export { AIOrbitScene } from './AIOrbitScene';
export { CommandLine } from './CommandLine';
export { Icon } from './Icon';
export type { IconName } from './Icon';

/* Layout primitives */
export { PageShell } from './layout/PageShell';
export { Section } from './layout/Section';

/* Card primitives */
export { GlowCard } from './cards/GlowCard';
export { StatCard } from './cards/StatCard';
export { BentoGrid } from './cards/BentoGrid';

/* Motion */
export { AnimatedPage } from './motion/AnimatedPage';
export { ScrollReveal } from './motion/ScrollReveal';
export { ParticlesBackground } from './ParticlesBackground';
