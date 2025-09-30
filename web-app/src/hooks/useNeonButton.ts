import { onMount, onCleanup } from 'solid-js';
import { NeonColorKey, NEON_COLORS, NEON_SHADOWS, PLAYER_CONSTANTS } from '../components/player/styles/neonTheme';

export interface UseNeonButtonOptions {
  colorKey: NeonColorKey;
  disabled?: () => boolean;
  variant?: 'default' | 'compact' | 'play';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Optimized hook for neon button hover effects
 * Uses CSS custom properties for performance and proper cleanup
 */
export const useNeonButton = (
  element: () => HTMLElement | undefined,
  options: UseNeonButtonOptions
) => {
  let isHovered = false;
  let animationFrame: number | null = null;
  
  const { colorKey, disabled, variant = 'default', size = 'md' } = options;
  const color = NEON_COLORS[colorKey];

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { width: '2.5rem', height: '2.5rem', fontSize: '0.875rem' };
      case 'lg':
        return { width: '4rem', height: '4rem', fontSize: '1.5rem' };
      default:
        return { width: '3rem', height: '3rem', fontSize: '1rem' };
    }
  };

  const getVariantStyles = () => {
    const base = {
      background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
      border: `2px solid ${color}66`,
      color: '#ffffff',
      fontFamily: PLAYER_CONSTANTS.fontFamily,
      letterSpacing: '0.05em',
      minHeight: PLAYER_CONSTANTS.minButtonHeight,
      borderRadius: variant === 'play' ? '50%' : PLAYER_CONSTANTS.borderRadius,
      transition: `all ${PLAYER_CONSTANTS.transitionDuration} ease`,
      cursor: disabled?.() ? 'not-allowed' : 'pointer',
      opacity: disabled?.() ? '0.5' : '1',
      ...getSizeStyles()
    };

    return base;
  };

  const applyHoverStyles = (el: HTMLElement, enter: boolean) => {
    if (disabled?.() || !el) return;

    if (enter) {
      el.style.borderColor = color;
      el.style.boxShadow = NEON_SHADOWS.medium(color);
      el.style.color = color;
      el.style.textShadow = NEON_SHADOWS.subtle(color);
      el.style.transform = 'scale(1.05)';
    } else {
      // Reset to base styles
      const baseStyles = getVariantStyles();
      Object.assign(el.style, baseStyles);
      el.style.transform = 'scale(1)';
    }
  };

  const handleMouseEnter = (e: MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    isHovered = true;
    
    // Cancel any pending animation frame
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    
    // Use RAF for smooth animation
    animationFrame = requestAnimationFrame(() => {
      if (isHovered) {
        applyHoverStyles(el, true);
      }
    });
  };

  const handleMouseLeave = (e: MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    isHovered = false;
    
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    
    animationFrame = requestAnimationFrame(() => {
      if (!isHovered) {
        applyHoverStyles(el, false);
      }
    });
  };

  const handleFocus = (e: FocusEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.outline = `2px solid ${color}`;
    el.style.outlineOffset = '2px';
  };

  const handleBlur = (e: FocusEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.outline = 'none';
    el.style.outlineOffset = '0';
  };

  onMount(() => {
    const el = element();
    if (!el) return;

    // Apply initial styles
    Object.assign(el.style, getVariantStyles());

    // Add event listeners
    el.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    el.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    el.addEventListener('focus', handleFocus, { passive: true });
    el.addEventListener('blur', handleBlur, { passive: true });

    onCleanup(() => {
      // Cleanup event listeners
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('focus', handleFocus);
      el.removeEventListener('blur', handleBlur);
      
      // Cancel pending animation frames
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    });
  });

  return {
    // Expose methods for external control if needed
    applyHover: () => {
      const el = element();
      if (el) applyHoverStyles(el, true);
    },
    removeHover: () => {
      const el = element();
      if (el) applyHoverStyles(el, false);
    }
  };
};