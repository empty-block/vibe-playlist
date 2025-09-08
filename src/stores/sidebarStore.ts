import { createSignal } from 'solid-js';

// Simplified sidebar store - removed expand/collapse functionality
const [currentSection, setCurrentSection] = createSignal('home');

export {
  currentSection,
  setCurrentSection
};