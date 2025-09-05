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
  const [hoverIndex, setHoverIndex] = createSignal(-1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);

  let sidebarRef: HTMLElement;
  let sectionsRef: HTMLElement[] = [];

  // Navigation data
  const sections: SidebarSection[] = [
    { id: 'home', href: '/', label: 'Home', icon: HomeIcon, color: 'blue', isPrimary: true },
    { id: 'library', href: '/library', label: 'Library', icon: LibraryIcon, color: 'cyan' },
    { id: 'stats', href: '/network', label: 'Stats', icon: StatsIcon, color: 'cyan' },
    { id: 'profile', href: '/me', label: 'Profile', icon: ProfileIcon, color: 'pink' }
  ];

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
    
    // Sidebar-specific shortcuts
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      handleToggle();
      return;
    }
    
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
    const nextIndex = currentIndex >= sections.length - 1 ? 0 : currentIndex + 1;
    setFocusedIndex(nextIndex);
    
    const nextElement = document.querySelector(`[data-section-index="${nextIndex}"]`);
    (nextElement as HTMLElement)?.focus();
  };

  const focusPreviousSection = () => {
    const currentIndex = focusedIndex();
    const prevIndex = currentIndex <= 0 ? sections.length - 1 : currentIndex - 1;
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
    const lastIndex = sections.length - 1;
    setFocusedIndex(lastIndex);
    const lastElement = document.querySelector(`[data-section-index="${lastIndex}"]`);
    (lastElement as HTMLElement)?.focus();
  };

  const activateCurrentSection = () => {
    const currentElement = document.querySelector(`[data-section-index="${focusedIndex()}"]`);
    (currentElement as HTMLElement)?.click();
  };

  const handleToggle = () => {
    if (sidebarRef!) {
      if (isExpanded()) {
        sidebarToggle.collapse(sidebarRef);
      } else {
        sidebarToggle.expand(sidebarRef);
      }
    }
    setIsExpanded(!isExpanded());
  };

  // Mobile menu handling
  const handleMobileToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen());
    
    if (sidebarRef!) {
      if (isMobileMenuOpen()) {
        sidebarMobileSlide.slideIn(sidebarRef);
        document.body.style.overflow = 'hidden';
      } else {
        sidebarMobileSlide.slideOut(sidebarRef);
        document.body.style.overflow = '';
      }
    }
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (sidebarRef! && !sidebarRef.contains(e.target as Node)) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleSectionClick = () => {
    // Close mobile menu when section is clicked
    if (isMobileMenuOpen()) {
      setIsMobileMenuOpen(false);
      document.body.style.overflow = '';
    }
  };

  // Responsive behavior
  createEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 640px) and (max-width: 767px)');
    
    const handleTabletView = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        setIsExpanded(false); // Force collapse on tablet
      }
    };
    
    mediaQuery.addEventListener('change', handleTabletView);
    if (mediaQuery.matches) setIsExpanded(false);
    
    onCleanup(() => mediaQuery.removeEventListener('change', handleTabletView));
  });

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
    if (isMobileMenuOpen()) {
      document.addEventListener('click', handleBackdropClick);
    }
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('click', handleBackdropClick);
    document.body.style.overflow = '';
  });

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileMenuOpen() && (
        <div 
          class="md:hidden fixed inset-0 bg-black/60 z-25"
          onClick={handleBackdropClick}
        />
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