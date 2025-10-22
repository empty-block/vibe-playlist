// Centralized neon color palette and theme constants

export const NEON_COLORS = {
  blue: '#3b00fd',    // Deep Blue/Violet - Primary brand color
  green: '#00f92a',   // Bright Neon Green - Success, play states  
  cyan: '#04caf4',    // Bright Cyan/Aqua - Links, info, highlights
  pink: '#f906d6',    // Bright Neon Pink - Accent, warnings
  yellow: '#d1f60a'   // Bright Neon Yellow - Attention, notifications
} as const;

// Opacity variants for consistent transparency levels
export const OPACITY = {
  subtle: '1A',      // 10% opacity
  light: '33',       // 20% opacity  
  medium: '66',      // 40% opacity
  strong: '99',      // 60% opacity
  intense: 'CC'      // 80% opacity
} as const;

// Common gradient combinations
export const NEON_GRADIENTS = {
  primary: `linear-gradient(135deg, ${NEON_COLORS.blue} 0%, ${NEON_COLORS.cyan} 100%)`,
  success: `linear-gradient(135deg, ${NEON_COLORS.green} 0%, ${NEON_COLORS.cyan} 100%)`,
  accent: `linear-gradient(135deg, ${NEON_COLORS.pink} 0%, ${NEON_COLORS.yellow} 100%)`,
  playButton: `linear-gradient(145deg, #1a4a1a, #2a5a2a)`, // Special green gradient for playing state
  container: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
  compactContainer: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)'
} as const;

// Consistent shadow patterns
export const NEON_SHADOWS = {
  subtle: (color: string) => `0 0 6px ${color}${OPACITY.medium}`,
  medium: (color: string) => `0 0 15px ${color}${OPACITY.strong}`,
  intense: (color: string) => `0 0 25px ${color}${OPACITY.strong}`,
  inset: 'inset 0 0 10px rgba(0, 0, 0, 0.8)',
  panel: `
    inset 0 0 20px rgba(0, 0, 0, 0.8),
    inset 0 2px 0 rgba(255, 255, 255, 0.08),
    inset 0 -2px 0 rgba(0, 0, 0, 0.4),
    0 0 15px rgba(4, 202, 244, 0.15)
  `
} as const;

// Typography scales
export const TYPOGRAPHY = {
  fontFamily: 'Courier New, monospace',
  sizes: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px  
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem'     // 24px
  },
  weights: {
    normal: '400',
    medium: '500', 
    bold: '700'
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0em',
    wide: '0.05em',
    wider: '0.1em',
    widest: '0.2em'
  }
} as const;

// Spacing scale (matches Tailwind for consistency)
export const SPACING = {
  px: '1px',
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem'      // 80px
} as const;

// Component-specific constants
export const PLAYER_CONSTANTS = {
  minButtonHeight: '44px',          // Touch-friendly minimum
  borderRadius: '8px',              // Consistent corner radius
  transitionDuration: '300ms',      // Standard transition timing
  scanLineOpacity: 0.08,            // Retro scan line effect
  modalZIndex: 50,                  // Modal stacking order
  particleCount: 12,                // Animation particle count
  animationStagger: 100,            // Staggered animation delay
  progressBarHeight: '8px'          // Progress bar thickness
} as const;

// Breakpoint system (matches Tailwind for consistency)
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px'
} as const;

// State-based color mappings
export const STATE_COLORS = {
  loading: NEON_COLORS.yellow,
  playing: NEON_COLORS.green,
  paused: NEON_COLORS.cyan,
  error: NEON_COLORS.pink,
  inactive: '#666666'
} as const;

// Component theme variants
export const COMPONENT_THEMES = {
  header: {
    color: NEON_COLORS.cyan,
    borderColor: `${NEON_COLORS.cyan}${OPACITY.medium}`
  },
  trackInfo: {
    titleColor: NEON_COLORS.cyan,
    artistColor: NEON_COLORS.green,
    metaColor: NEON_COLORS.pink
  },
  controls: {
    defaultBorder: `${NEON_COLORS.cyan}${OPACITY.medium}`,
    playButton: {
      default: `${NEON_COLORS.green}${OPACITY.medium}`,
      playing: NEON_COLORS.green
    }
  },
  social: {
    stats: NEON_COLORS.pink,
    actions: NEON_COLORS.yellow,
    discussion: NEON_COLORS.cyan
  }
} as const;

export type NeonColorKey = keyof typeof NEON_COLORS;
export type NeonGradientKey = keyof typeof NEON_GRADIENTS;
export type StateColorKey = keyof typeof STATE_COLORS;