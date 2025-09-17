import { createSignal } from 'solid-js';

// Simplified sidebar store - removed expand/collapse functionality
// Default to 'library' since it's now the main route
const [currentSection, setCurrentSection] = createSignal('library');

export {
  currentSection,
  setCurrentSection
};