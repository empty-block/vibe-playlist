import { Component, createSignal, onMount, onCleanup, createEffect } from 'solid-js';
import { For } from 'solid-js';
import { useLocation } from '@solidjs/router';
import { isExpanded, setIsExpanded, setCurrentSection } from '../../../stores/sidebarStore';
import { sidebarToggle, sidebarMobileSlide } from '../../../utils/animations';
import SidebarSection from './SidebarSection';
import SidebarToggle from './SidebarToggle';
import { HomeIcon, LibraryIcon, StatsIcon, ProfileIcon } from './SidebarIcons';
import './sidebar.css';

interface SidebarSection {
  id: string;
  href: string;
  label: string;
  icon: Component;
  color: 'blue' | 'cyan' | 'pink';
  isPrimary?: boolean;
}

interface SidebarProps {
  class?: string;
}

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
        <div class="terminal-line">┌─ JAMZY TERMINAL v2.0 ─┐</div>
        <div class="terminal-line">│  ♫ NAVIGATION SYSTEM   │</div>
        <div class="terminal-line">└────────────────────────┘</div>
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
}
      )}
      
      {/* Main Sidebar */}
      <nav
        ref={sidebarRef!}
        class={`
          sidebar h-full transition-all duration-300 ease-out z-30
          bg-black/95 border-r border-gray-800 relative
          ${isExpanded() ? 'w-48 min-w-48 max-w-48' : 'w-16 min-w-16 max-w-16'}
          ${props.class || ''}
        `}
        classList={{
          'sidebar-collapsed': !isExpanded()
        }}
        role="navigation"
        aria-label="Main navigation"
        aria-expanded={isExpanded()}
      >
        {/* Toggle Button */}
        <SidebarToggle />
        

        {/* Navigation Sections */}
        <ul class="sidebar-sections pt-14 px-1 space-y-1" id="sidebar-navigation">
          <For each={sections}>
            {(section, index) => (
              <SidebarSection
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
    </>
  );
};

export default Sidebar;