import { createSignal, createEffect } from 'solid-js';
import { useLocation } from '@solidjs/router';

export type NavigationTab = 'library' | 'listen' | 'curate' | 'me';

// Main navigation state
const [activeTab, setActiveTab] = createSignal<NavigationTab>('library');
const [navigationHistory, setNavigationHistory] = createSignal<NavigationTab[]>(['library']);

// Sub-navigation states for each section
const [libraryView, setLibraryView] = createSignal<'all' | 'trending' | 'recent' | 'personal'>('all');
const [listenMode, setListenMode] = createSignal<'queue' | 'social' | 'history'>('queue');
const [curateMode, setCurateMode] = createSignal<'contribute' | 'create' | 'quality'>('contribute');

// Navigation helper functions
export const getTabFromPath = (path: string): NavigationTab => {
  // Handle legacy routes
  if (path === '/' || path.startsWith('/library')) return 'library';
  if (path.startsWith('/listen') || path.startsWith('/player')) return 'listen';
  if (path.startsWith('/curate') || path.startsWith('/create')) return 'curate';
  if (path.startsWith('/me') || path.startsWith('/profile')) return 'me';
  
  // Default to library as home
  return 'library';
};

export const getPathFromTab = (tab: NavigationTab): string => {
  switch (tab) {
    case 'library': return '/library';
    case 'listen': return '/listen';
    case 'curate': return '/curate';
    case 'me': return '/me';
    default: return '/library';
  }
};

// Navigation actions
export const navigateToTab = (tab: NavigationTab) => {
  const current = activeTab();
  if (current !== tab) {
    setActiveTab(tab);
    
    // Update history
    const history = navigationHistory();
    const newHistory = [...history, tab].slice(-10); // Keep last 10 navigations
    setNavigationHistory(newHistory);
    
    // Persist to localStorage for session continuity
    localStorage.setItem('nav_history', JSON.stringify(newHistory));
  }
};

export const goBack = () => {
  const history = navigationHistory();
  if (history.length > 1) {
    const newHistory = history.slice(0, -1);
    setNavigationHistory(newHistory);
    const previousTab = newHistory[newHistory.length - 1];
    setActiveTab(previousTab);
    return getPathFromTab(previousTab);
  }
  return '/library'; // Default to library
};

// Exports
export const navigationStore = {
  // State getters
  activeTab,
  navigationHistory,
  libraryView,
  listenMode,
  curateMode,
  
  // State setters
  setActiveTab,
  setLibraryView,
  setListenMode,
  setCurateMode,
  
  // Actions
  navigateToTab,
  goBack,
  getTabFromPath,
  getPathFromTab,
  
  // Computed helpers
  isTabActive: (tab: NavigationTab) => activeTab() === tab,
  isLibraryView: (view: string) => libraryView() === view,
  isListenMode: (mode: string) => listenMode() === mode,
  isCurateMode: (mode: string) => curateMode() === mode,
};

// Initialize from localStorage on load
const savedHistory = localStorage.getItem('nav_history');
if (savedHistory) {
  try {
    const parsed = JSON.parse(savedHistory);
    if (Array.isArray(parsed) && parsed.length > 0) {
      setNavigationHistory(parsed);
      setActiveTab(parsed[parsed.length - 1]);
    }
  } catch (e) {
    console.error('Failed to parse navigation history:', e);
  }
}