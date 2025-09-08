import { Component, createSignal, onMount, onCleanup, createEffect, Accessor, Setter } from 'solid-js';
import { For } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { setCurrentSection, currentSection } from '../../../stores/sidebarStore';
import { navigationSections, type SidebarSection, type SectionColor, type IconProps } from './NavigationData';
import './sidebar.css';

// Component interfaces
interface SidebarSectionProps {
  id: string;
  href: string;
  label: string;
  icon: Component<IconProps>;
  color: SectionColor;
  isPrimary?: boolean;
  index: number;
  focusedIndex: Accessor<number>;
  setFocusedIndex: Setter<number>;
  onSectionClick: () => void;
}

interface SidebarProps {
  class?: string;
  onNavigate?: (sectionId: string) => void;
}

// Sidebar Section Component
const SidebarSectionComponent: Component<SidebarSectionProps> = (props) => {
  const location = useLocation();
  
  const isActive = () => {
    return currentSection() === props.id;
  };

  return (
    <li role="none">
      <A
        href={props.href}
        class="sidebar-section"
        classList={{
          [`sidebar-section-${props.color}`]: true,
          'sidebar-section-active': isActive(),
          'sidebar-section-primary': props.isPrimary
        }}
        role="menuitem"
        aria-label={`Navigate to ${props.label} page`}
        aria-current={isActive() ? 'page' : undefined}
        data-section-index={props.index}
        tabindex={props.focusedIndex() === props.index ? 0 : -1}
        onFocus={() => props.setFocusedIndex(props.index)}
        onClick={props.onSectionClick}
      >
        <props.icon class="sidebar-section-icon" />
        <span class="sidebar-section-label">{props.label}</span>
        
        {/* Tooltip for collapsed state */}
        <div 
          class="sidebar-tooltip" 
          role="tooltip" 
          aria-hidden="true"
        >
          {props.label}
        </div>
      </A>
    </li>
  );
};

// Main Sidebar Component
const Sidebar: Component<SidebarProps> = (props) => {
  const location = useLocation();
  const [focusedIndex, setFocusedIndex] = createSignal(-1);

  let sidebarRef: HTMLElement;

  // Update current section based on location
  createEffect(() => {
    const path = location.pathname;
    if (path === '/') setCurrentSection('home');
    else if (path === '/library') setCurrentSection('library');
    else if (path === '/network') setCurrentSection('stats');
    else if (path === '/me' || path.startsWith('/profile')) setCurrentSection('profile');
  });

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    const focusedElement = document.activeElement;
    
    // Arrow navigation within sidebar
    if (focusedElement?.closest('.sidebar')) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          focusPreviousSection();
          break;
        case 'ArrowDown':
          e.preventDefault();
          focusNextSection();
          break;
        case 'Home':
          e.preventDefault();
          focusFirstSection();
          break;
        case 'End':
          e.preventDefault();
          focusLastSection();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          activateCurrentSection();
          break;
      }
    }
  };

  const focusNextSection = () => {
    const currentIndex = focusedIndex();
    const nextIndex = currentIndex >= navigationSections.length - 1 ? 0 : currentIndex + 1;
    setFocusedIndex(nextIndex);
    
    const nextElement = document.querySelector(`[data-section-index="${nextIndex}"]`);
    (nextElement as HTMLElement)?.focus();
  };

  const focusPreviousSection = () => {
    const currentIndex = focusedIndex();
    const prevIndex = currentIndex <= 0 ? navigationSections.length - 1 : currentIndex - 1;
    setFocusedIndex(prevIndex);
    
    const prevElement = document.querySelector(`[data-section-index="${prevIndex}"]`);
    (prevElement as HTMLElement)?.focus();
  };

  const focusFirstSection = () => {
    setFocusedIndex(0);
    const firstElement = document.querySelector(`[data-section-index="0"]`);
    (firstElement as HTMLElement)?.focus();
  };

  const focusLastSection = () => {
    const lastIndex = navigationSections.length - 1;
    setFocusedIndex(lastIndex);
    const lastElement = document.querySelector(`[data-section-index="${lastIndex}"]`);
    (lastElement as HTMLElement)?.focus();
  };

  const activateCurrentSection = () => {
    const currentElement = document.querySelector(`[data-section-index="${focusedIndex()}"]`);
    (currentElement as HTMLElement)?.click();
  };

  const handleSectionClick = () => {
    // Navigation callback
    if (props.onNavigate) {
      const section = navigationSections[focusedIndex()];
      props.onNavigate(section.id);
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <nav 
      ref={sidebarRef!}
      class={`sidebar ${props.class || ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Terminal Header */}
      <div class="terminal-header">
        <div class="terminal-line">┌─ JAMZY v2.0 ──┐</div>
        <div class="terminal-line">│ ♫ NAV SYSTEM  │</div>
        <div class="terminal-line">└───────────────┘</div>
      </div>

      {/* Navigation Sections */}
      <ul role="menubar" aria-orientation="vertical" class="sidebar-sections">
        <For each={navigationSections}>
          {(section, index) => (
            <SidebarSectionComponent
              id={section.id}
              href={section.href}
              label={section.label}
              icon={section.icon}
              color={section.color}
              isPrimary={section.isPrimary}
              index={index()}
              focusedIndex={focusedIndex}
              setFocusedIndex={setFocusedIndex}
              onSectionClick={handleSectionClick}
            />
          )}
        </For>
      </ul>
    </nav>
  );
};

export default Sidebar;