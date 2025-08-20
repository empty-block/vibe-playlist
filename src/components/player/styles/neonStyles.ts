// Centralized neon styling system for player components
import { NEON_COLORS } from './neonTheme';

export interface NeonButtonStyle {
  background: string;
  border: string;
  color: string;
  fontFamily: string;
  letterSpacing: string;
  minHeight: string;
  borderRadius?: string;
  padding?: string;
}

export interface NeonHoverEffect {
  borderColor: string;
  boxShadow: string;
  color: string;
  textShadow: string;
}

export const createNeonButton = (color: keyof typeof NEON_COLORS): {
  base: NeonButtonStyle;
  hover: NeonHoverEffect;
} => ({
  base: {
    background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
    border: `2px solid ${NEON_COLORS[color]}66`, // 40% opacity
    color: '#ffffff',
    fontFamily: 'Courier New, monospace',
    letterSpacing: '0.05em',
    minHeight: '44px',
    borderRadius: '8px',
    padding: '0.75rem 1rem'
  },
  hover: {
    borderColor: NEON_COLORS[color],
    boxShadow: `0 0 15px ${NEON_COLORS[color]}99`, // 60% opacity
    color: NEON_COLORS[color],
    textShadow: `0 0 8px ${NEON_COLORS[color]}CC` // 80% opacity
  }
});

export const createNeonPanel = (borderColor: keyof typeof NEON_COLORS = 'cyan') => ({
  background: 'rgba(0, 0, 0, 0.9)',
  border: `1px solid ${NEON_COLORS[borderColor]}4D`, // 30% opacity
  boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.8)',
  borderRadius: '8px'
});

export const PLAYER_STYLES = {
  // Main container styles
  sidebarContainer: {
    background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
    border: '2px solid rgba(4, 202, 244, 0.25)',
    boxShadow: `
      inset 0 0 20px rgba(0, 0, 0, 0.8),
      inset 0 2px 0 rgba(255, 255, 255, 0.08),
      inset 0 -2px 0 rgba(0, 0, 0, 0.4),
      0 0 15px rgba(4, 202, 244, 0.15)
    `
  },
  
  compactContainer: {
    background: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)'
  },
  
  // Scan line effect
  scanLines: {
    background: `repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 3px,
      rgba(4, 202, 244, 0.06) 4px,
      rgba(4, 202, 244, 0.06) 5px
    )`
  },
  
  // Typography styles
  headerText: {
    color: NEON_COLORS.cyan,
    textShadow: `0 0 3px ${NEON_COLORS.cyan}80`, // 50% opacity
    fontFamily: 'Courier New, monospace',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.2em'
  },
  
  trackTitle: (isCompact: boolean) => ({
    color: isCompact ? '#ffffff' : NEON_COLORS.cyan,
    textShadow: isCompact ? 'none' : `0 0 8px ${NEON_COLORS.cyan}99`,
    fontFamily: 'Courier New, monospace',
    fontSize: isCompact ? '0.875rem' : '1.25rem'
  }),
  
  artistName: (isCompact: boolean) => ({
    color: isCompact ? 'rgba(255, 255, 255, 0.7)' : NEON_COLORS.green,
    textShadow: isCompact ? 'none' : `0 0 6px ${NEON_COLORS.green}80`,
    fontFamily: 'Courier New, monospace'
  }),
  
  // Progress bar styles
  progressContainer: {
    background: 'rgba(0, 0, 0, 0.8)',
    border: `1px solid ${NEON_COLORS.cyan}4D`,
    borderRadius: '9999px',
    overflow: 'hidden' as const
  },
  
  progressBar: {
    background: `linear-gradient(90deg, ${NEON_COLORS.cyan}, ${NEON_COLORS.green})`,
    boxShadow: `0 0 8px ${NEON_COLORS.cyan}99`,
    height: '100%',
    transition: 'width 200ms ease-in-out'
  }
};

// Utility functions for applying styles
export const applyNeonButtonStyles = (element: HTMLElement, colorKey: keyof typeof NEON_COLORS) => {
  const styles = createNeonButton(colorKey);
  Object.assign(element.style, styles.base);
  
  return {
    onMouseEnter: () => Object.assign(element.style, styles.hover),
    onMouseLeave: () => Object.assign(element.style, styles.base)
  };
};

// CSS custom properties for runtime theme switching
export const setCSSCustomProperties = () => {
  const root = document.documentElement;
  Object.entries(NEON_COLORS).forEach(([key, value]) => {
    root.style.setProperty(`--neon-${key}`, value);
  });
};