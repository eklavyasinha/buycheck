import { Variants, Transition } from 'framer-motion';

export const springTransition: Transition = {
  type: 'spring',
  damping: 24,
  stiffness: 280,
  mass: 0.8,
};

export const gentleTransition: Transition = {
  duration: 0.45,
  ease: [0.16, 1, 0.3, 1],
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: gentleTransition,
  },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
};

export const cardHoverVariants: Variants = {
  initial: { y: 0, borderColor: 'rgba(255, 255, 255, 0.08)' },
  hover: {
    y: -3,
    borderColor: 'rgba(212, 255, 0, 0.35)',
    transition: { duration: 0.2 },
  },
};
