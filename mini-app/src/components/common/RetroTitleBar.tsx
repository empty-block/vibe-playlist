import { Component, JSX, Show } from 'solid-js';
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

  return (
    <div class={`retro-titlebar ${props.class || ''}`}>
      <div class="retro-titlebar__text">
        <Show when={props.icon} fallback={<div class="retro-titlebar__icon" />}>
          {props.icon}
        </Show>
        <span class="retro-titlebar__title">{props.title}</span>
      </div>

      <Show when={props.showMinimize || props.showMaximize || props.showClose}>
        <div class="retro-titlebar__controls">
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
