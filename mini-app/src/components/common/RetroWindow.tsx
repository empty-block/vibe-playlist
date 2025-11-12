import { Component, JSX, Show, createEffect, on, onMount, onCleanup } from 'solid-js';
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

  /** Hide header when scrolling down (default: true) */
  hideHeaderOnScroll?: boolean;

  /** Hide footer when scrolling down (default: true) */
  hideFooterOnScroll?: boolean;

  /** Scroll threshold in pixels (default: 75px) */
  scrollThreshold?: number;
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
  const hideHeaderOnScroll = props.hideHeaderOnScroll ?? true; // Default enabled
  const hideFooterOnScroll = props.hideFooterOnScroll ?? true; // Default enabled
  const scrollThreshold = props.scrollThreshold ?? 75; // Moderate threshold

  // Refs for animation targets
  let headerRef: HTMLDivElement | undefined;
  let footerRef: HTMLDivElement | undefined;
  let contentRef: HTMLDivElement | undefined;

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
    onMaximize: props.onMaximize,
    ref: (el: HTMLDivElement) => { headerRef = el; }
  };

  // Simple scroll direction detection - use queueMicrotask to ensure ref is assigned
  onMount(() => {
    queueMicrotask(() => {
      if (!contentRef) return;

      let lastScrollY = 0;
      let ticking = false;

      const handleScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            if (!contentRef) return;

            const currentScrollY = contentRef.scrollTop;
            const delta = currentScrollY - lastScrollY;
            const isAtTop = currentScrollY <= 10;

            // Simple threshold check - only trigger if scrolled more than 5px
            if (Math.abs(delta) > 5) {
              if (delta > 0 && !isAtTop) {
                // Scrolling down
                if (hideHeaderOnScroll && headerRef) hideHeader();
                if (hideFooterOnScroll && footerRef) hideFooter();
              } else if (delta < 0) {
                // Scrolling up
                if (hideHeaderOnScroll && headerRef) showHeader();
                if (hideFooterOnScroll && footerRef) showFooter();
              }
            }

            // Always show at top
            if (isAtTop) {
              if (headerRef) showHeader();
              if (footerRef) showFooter();
            }

            lastScrollY = currentScrollY;
            ticking = false;
          });
          ticking = true;
        }
      };

      contentRef.addEventListener('scroll', handleScroll, { passive: true });

      onCleanup(() => {
        contentRef?.removeEventListener('scroll', handleScroll);
      });
    });
  });

  const hideHeader = () => {
    headerRef?.classList.add('retro-titlebar--hidden');
  };

  const showHeader = () => {
    headerRef?.classList.remove('retro-titlebar--hidden');
  };

  const hideFooter = () => {
    footerRef?.classList.add('retro-window__footer--hidden');
  };

  const showFooter = () => {
    footerRef?.classList.remove('retro-window__footer--hidden');
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
        ref={(el) => { contentRef = el; }}
      >
        {props.children}
      </div>

      <Show when={props.footer}>
        <div
          class="retro-window__footer"
          ref={(el) => { footerRef = el; }}
        >
          {props.footer}
        </div>
      </Show>
    </div>
  );
};

export default RetroWindow;
