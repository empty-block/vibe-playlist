import { createSignal, createEffect } from 'solid-js';

// Initialize from localStorage, default to collapsed for better UX
const [isExpanded, setIsExpanded] = createSignal(
  localStorage.getItem('sidebarExpanded') === 'true'
);

const [currentSection, setCurrentSection] = createSignal('home');

// Persist state changes
createEffect(() => {
  localStorage.setItem('sidebarExpanded', isExpanded().toString());
});

export {
  isExpanded,
  setIsExpanded,
  currentSection,
  setCurrentSection
};