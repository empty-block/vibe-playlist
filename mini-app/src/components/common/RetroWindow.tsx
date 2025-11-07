import { Component, JSX, Show } from 'solid-js';
import RetroTitleBar, { RetroTitleBarProps } from './RetroTitleBar';
import './retro-chrome.css';

export interface RetroWindowProps {
  /** Window content */
  children: JSX.Element;

  /** Window title */
  title: string;

  /**
   * Visual variant for window border
   * - '3d': Classic Win95 3D borders (default)
   * - 'neon': Cyberpunk neon glow borders
   */
  variant?: '3d' | 'neon';

  /** Show minimize button in title bar */
  showMinimize?: boolean;

  /** Show maximize button in title bar */
  showMaximize?: boolean;

  /** Show close button in title bar */
  showClose?: boolean;

  /** Show hamburger menu button in title bar */
  showMenu?: boolean;

  /** Menu items for hamburger dropdown */
  menuItems?: Array<{
    label: string | (() => string);
    icon?: string | (() => string);
    onClick: () => void;
  }>;

  /** Close button click handler */
  onClose?: () => void;

  /** Minimize button click handler */
  onMinimize?: () => void;

  /** Maximize button click handler */
  onMaximize?: () => void;

  /** Optional icon for title bar */
  icon?: JSX.Element;

  /** Optional footer content */
  footer?: JSX.Element;

  /** Additional CSS classes for window container */
  class?: string;

  /** Additional inline styles */
  style?: JSX.CSSProperties | string;

  /** Content area padding */
  contentPadding?: string;

  /** Accessibility role */
  role?: string;

  /** Accessibility label */
  'aria-label'?: string;
}

/**
 * RetroWindow - Complete window component with title bar and content
 *
 * Combines RetroTitleBar with a content area and optional footer.
 * Perfect for:
 * - Modal dialogs
 * - Main application windows
 * - Player interfaces
 * - Any windowed UI component
 */
const RetroWindow: Component<RetroWindowProps> = (props) => {
  const variant = props.variant || '3d';
  const contentPadding = props.contentPadding || '12px';

  const variantClass = () => {
    return variant === 'neon' ? 'retro-window--neon' : 'retro-window--3d';
  };

  const titleBarProps: RetroTitleBarProps = {
    title: props.title,
    icon: props.icon,
    showMinimize: props.showMinimize,
    showMaximize: props.showMaximize,
    showClose: props.showClose,
    showMenu: props.showMenu,
    menuItems: props.menuItems,
    onClose: props.onClose,
    onMinimize: props.onMinimize,
    onMaximize: props.onMaximize
  };

  return (
    <div
      class={`retro-window ${variantClass()} ${props.class || ''}`}
      style={props.style}
      role={props.role || 'region'}
      aria-label={props['aria-label'] || props.title}
    >
      <RetroTitleBar {...titleBarProps} />

      <div
        class="retro-window__content"
        style={{ padding: contentPadding }}
      >
        {props.children}
      </div>

      <Show when={props.footer}>
        <div class="retro-window__footer">
          {props.footer}
        </div>
      </Show>
    </div>
  );
};

export default RetroWindow;
