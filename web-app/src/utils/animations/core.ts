// Core animation utilities and constants

// Standard easing curves
export const EASING = {
  LINEAR: 'linear',
  EASE_IN_QUAD: 'easeInQuad',
  EASE_OUT_QUAD: 'easeOutQuad',
  EASE_IN_OUT_QUAD: 'easeInOutQuad',
  EASE_IN_CUBIC: 'easeInCubic',
  EASE_OUT_CUBIC: 'easeOutCubic',
  EASE_IN_OUT_CUBIC: 'easeInOutCubic',
  EASE_IN_QUART: 'easeInQuart',
  EASE_OUT_QUART: 'easeOutQuart',
  EASE_IN_OUT_SINE: 'easeInOutSine',
  EASE_OUT_ELASTIC: 'easeOutElastic'
} as const;

// Standard durations in milliseconds
export const DURATION = {
  FAST: 150,
  NORMAL: 200,
  MEDIUM: 300,
  SLOW: 400,
  VERY_SLOW: 600
} as const;

// Standard delays
export const DELAY = {
  NONE: 0,
  SHORT: 100,
  MEDIUM: 200,
  LONG: 400
} as const;

// Reset transform utility
export const resetTransform = (element: HTMLElement) => {
  element.style.transform = 'translateZ(0)';
};

// Platform colors for music services
export const PLATFORM_COLORS = {
  spotify: '#00f92a',
  youtube: '#ff0000',
  soundcloud: '#ff7700',
  default: '#04caf4'
} as const;

// Jamzy brand colors for effects
export const BRAND_COLORS = {
  primary: '#04caf4',
  secondary: '#3b00fd',
  accent: '#00f92a',
  highlight: '#f906d6'
} as const;