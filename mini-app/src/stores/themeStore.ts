import { createSignal, createEffect } from 'solid-js';

export type Theme = 'light' | 'dark';

// Get initial theme from localStorage or default to light
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';

  const stored = localStorage.getItem('jamzy-theme');
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  // Optional: Check system preference
  // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  // return prefersDark ? 'dark' : 'light';

  return 'light';
};

const [theme, setThemeSignal] = createSignal<Theme>(getInitialTheme());

// Wrapped setter that also updates localStorage and applies class to body
export const setTheme = (newTheme: Theme) => {
  setThemeSignal(newTheme);

  if (typeof window !== 'undefined') {
    localStorage.setItem('jamzy-theme', newTheme);

    // Apply theme class to body for CSS variables
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${newTheme}`);
  }
};

// Toggle between light and dark
export const toggleTheme = () => {
  setTheme(theme() === 'light' ? 'dark' : 'light');
};

// Initialize theme class on body
if (typeof window !== 'undefined') {
  document.body.classList.add(`theme-${theme()}`);
}

export { theme };
