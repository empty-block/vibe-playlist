import { Component } from 'solid-js';
import { theme, toggleTheme } from '../../stores/themeStore';
import './ThemeToggle.css';

interface ThemeToggleProps {
  class?: string;
}

const ThemeToggle: Component<ThemeToggleProps> = (props) => {
  const handleToggle = (e: MouseEvent) => {
    e.stopPropagation();
    toggleTheme();
  };

  return (
    <button
      class={`theme-toggle ${props.class || ''}`}
      onClick={handleToggle}
      title={`Switch to ${theme() === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme() === 'light' ? 'dark' : 'light'} mode`}
      type="button"
    >
      <span class="theme-toggle-icon">
        {theme() === 'light' ? '🌙' : '☀️'}
      </span>
      <span class="theme-toggle-label">
        {theme() === 'light' ? 'DARK' : 'LIGHT'}
      </span>
    </button>
  );
};

export default ThemeToggle;
