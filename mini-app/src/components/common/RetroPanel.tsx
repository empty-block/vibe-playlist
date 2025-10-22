import { Component, JSX } from 'solid-js';
import './retro-chrome.css';

export interface RetroPanelProps {
  /** Panel content */
  children: JSX.Element;

  /**
   * Visual variant
   * - '3d': Classic Win95 3D raised borders (default)
   * - 'neon': Cyberpunk neon glow borders
   * - 'minimal': Simple border
   * - 'sunken': Inset 3D look (for displays/inputs)
   */
  variant?: '3d' | 'neon' | 'minimal' | 'sunken';

  /** Additional padding */
  padding?: string;

  /** Additional CSS classes */
  class?: string;

  /** Additional inline styles */
  style?: JSX.CSSProperties | string;

  /** Accessibility role */
  role?: string;

  /** Accessibility label */
  'aria-label'?: string;
}

/**
 * RetroPanel - Simple container component with retro styling
 *
 * Use for:
 * - Form containers
 * - Content cards
 * - Sectioned content
 * - Display panels
 *
 * Does NOT include a title bar. For windows with title bars, use RetroWindow.
 */
const RetroPanel: Component<RetroPanelProps> = (props) => {
  const variant = props.variant || '3d';
  const padding = props.padding || '16px';

  const variantClass = () => {
    switch (variant) {
      case 'neon':
        return 'retro-panel--neon';
      case 'minimal':
        return 'retro-panel--minimal';
      case 'sunken':
        return 'retro-panel--sunken';
      case '3d':
      default:
        return 'retro-panel--3d';
    }
  };

  return (
    <div
      class={`retro-panel ${variantClass()} ${props.class || ''}`}
      style={{
        padding,
        ...(typeof props.style === 'object' ? props.style : {})
      }}
      role={props.role}
      aria-label={props['aria-label']}
    >
      {props.children}
    </div>
  );
};

export default RetroPanel;
