const easing = [0.6, -0.05, 0.01, 0.99];

export const parentVariant = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.6,
    },
  },
};

export const cardVariant = {
  initial: {
    y: 20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: easing,
    },
  },
};

export const layoutVariant = {
  offscreen: {
    y: 60,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: easing,
    },
  },
};
