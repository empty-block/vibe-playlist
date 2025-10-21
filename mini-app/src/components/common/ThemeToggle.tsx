import { Component } from 'solid-js';
import { theme, toggleTheme } from '../../stores/themeStore';
import './ThemeToggle.css';

interface ThemeToggleProps {
  class?: string;
}

const ThemeToggle: Component<ThemeToggleProps> = (props) => {
  return (
    <button
      class={`theme-toggle retro-button ${props.class || ''}`}
      onClick={toggleTheme}
      title={`Switch to ${theme() === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme() === 'light' ? 'dark' : 'light'} mode`}
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
