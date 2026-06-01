import type { Variants, Transition } from 'framer-motion';

/* Page transitions */
export const pageTransition: Transition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1],
};

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: pageTransition },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
};

/* Scroll reveal — fade up */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

/* Stagger container */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

/* Stagger item (used inside staggerContainer) */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  },
};

/* Tab morph — for RichTabPanel layoutId indicator */
export const tabMorphTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 35,
};

/* Card hover scale (subtle) */
export const cardHover = {
  rest: { scale: 1 },
  hover: { scale: 1.015, transition: { duration: 0.2, ease: 'easeOut' } },
};

/* Sidebar entrance */
export const sidebarItem: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

/* Timeline line (pathLength 0→1 driven by scrollYProgress) */
export const timelineLineTransition: Transition = {
  duration: 0.8,
  ease: 'easeInOut',
};
