import { Component, JSX, Show, createSignal, For, onCleanup } from 'solid-js';
import './retro-chrome.css';

export interface RetroTitleBarProps {
  /** Title text to display */
  title: string;

  /** Optional icon element */
  icon?: JSX.Element;

  /** Show minimize button */
  showMinimize?: boolean;

  /** Show maximize button */
  showMaximize?: boolean;

  /** Show close button */
  showClose?: boolean;

  /** Show hamburger menu button */
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

  /** Additional CSS classes */
  class?: string;
}

/**
 * RetroTitleBar - Reusable title bar component for windows and panels
 *
 * Supports:
 * - Custom title and icon
 * - Optional control buttons (minimize, maximize, close)
 * - Theme-aware styling (light/dark mode)
 * - Fully accessible
 */
const RetroTitleBar: Component<RetroTitleBarProps> = (props) => {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  let menuRef: HTMLDivElement | undefined;

  const handleMinimize = (e: MouseEvent) => {
    e.stopPropagation();
    props.onMinimize?.();
  };

  const handleMaximize = (e: MouseEvent) => {
    e.stopPropagation();
    props.onMaximize?.();
  };

  const handleClose = (e: MouseEvent) => {
    e.stopPropagation();
    props.onClose?.();
  };

  const toggleMenu = (e: MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen());
  };

  const handleMenuItemClick = (onClick: () => void, e: MouseEvent) => {
    e.stopPropagation();
    onClick();
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef && !menuRef.contains(e.target as Node)) {
      setIsMenuOpen(false);
    }
  };

  // Setup and cleanup click listener
  if (props.showMenu) {
    document.addEventListener('click', handleClickOutside);
    onCleanup(() => {
      document.removeEventListener('click', handleClickOutside);
    });
  }

  return (
    <div class={`retro-titlebar ${props.class || ''}`}>
      <div class="retro-titlebar__text">
        <Show when={props.icon} fallback={<div class="retro-titlebar__icon" />}>
          {props.icon}
        </Show>
        <span class="retro-titlebar__title">{props.title}</span>
      </div>

      <Show when={props.showMinimize || props.showMaximize || props.showClose || props.showMenu}>
        <div class="retro-titlebar__controls">
          <Show when={props.showMenu}>
            <div class="retro-titlebar__menu-container" ref={menuRef}>
              <button
                class="retro-titlebar__button retro-titlebar__menu-button"
                onClick={toggleMenu}
                aria-label="Menu"
                aria-expanded={isMenuOpen()}
                type="button"
              >
                ☰
              </button>
              <Show when={isMenuOpen() && props.menuItems && props.menuItems.length > 0}>
                <div class="retro-titlebar__dropdown">
                  <For each={props.menuItems}>
                    {(item) => (
                      <button
                        class="retro-titlebar__dropdown-item"
                        onClick={(e) => handleMenuItemClick(item.onClick, e)}
                        type="button"
                      >
                        <Show when={item.icon}>
                          <span class="retro-titlebar__dropdown-icon">
                            {typeof item.icon === 'function' ? item.icon() : item.icon}
                          </span>
                        </Show>
                        <span>{typeof item.label === 'function' ? item.label() : item.label}</span>
                      </button>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </Show>

          <Show when={props.showMinimize}>
            <button
              class="retro-titlebar__button"
              onClick={handleMinimize}
              aria-label="Minimize"
              type="button"
            >
              _
            </button>
          </Show>

          <Show when={props.showMaximize}>
            <button
              class="retro-titlebar__button"
              onClick={handleMaximize}
              aria-label="Maximize"
              type="button"
            >
              □
            </button>
          </Show>

          <Show when={props.showClose}>
            <button
              class="retro-titlebar__button"
              onClick={handleClose}
              aria-label="Close"
              type="button"
            >
              ×
            </button>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default RetroTitleBar;
