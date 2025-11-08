import { Component } from 'solid-js';
import { For } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { setCurrentSection, currentSection } from '../../../stores/navigationStore';
import { navigationSections } from '../Sidebar/NavigationData';
import { safeAreaInsets } from '../../../stores/safeAreaStore';
import './mobileNavigation.css';

interface MobileNavigationProps {
  class?: string;
  onNavigate?: (sectionId: string) => void;
}

const MobileNavigation: Component<MobileNavigationProps> = (props) => {
  const location = useLocation();

  // Update current section based on location
  const handleSectionClick = (sectionId: string) => {
    setCurrentSection(sectionId);
    if (props.onNavigate) {
      props.onNavigate(sectionId);
    }
  };

  // Render SVG icons based on section - Grooveshark-style filled silhouettes
  const getIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'home':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="image-rendering: pixelated;">
            <path d="M12 2 L2 11 L4 11 L4 22 L10 22 L10 16 L14 16 L14 22 L20 22 L20 11 L22 11 Z" />
          </svg>
        );
      case 'channels':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="image-rendering: pixelated;">
            <path d="M3 5 L3 3 L10 3 L11 5 L21 5 L21 19 L3 19 Z" />
          </svg>
        );
      case 'trending':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="image-rendering: pixelated;">
            {/* Lightning bolt - classic zigzag shape */}
            <path d="M14 2 L6 13 L11 13 L10 22 L18 11 L13 11 Z" />
          </svg>
        );
      case 'profile':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="image-rendering: pixelated;">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20 C4 16 7.58 13 12 13 C16.42 13 20 16 20 20 L20 22 L4 22 Z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Calculate bottom margin using Farcaster SDK safe area insets
  // The navbar should sit ABOVE the safe area, not extend into it
  const navBarStyle = () => {
    const insets = safeAreaInsets();
    // Just use the safe area inset directly - no extra padding needed
    return {
      'margin-bottom': `${insets.bottom}px`
    };
  };

  return (
    <nav
      class={`nav-bar ${props.class || ''}`}
      style={navBarStyle()}
      role="navigation"
      aria-label="Main navigation"
    >
      <For each={navigationSections}>
        {(section) => (
          <A
            href={section.href}
            class="nav-button"
            classList={{
              'nav-button--active': currentSection() === section.id
            }}
            role="menuitem"
            aria-label={`Navigate to ${section.label} page`}
            aria-current={currentSection() === section.id ? 'page' : undefined}
            onClick={() => handleSectionClick(section.id)}
          >
            <div class="nav-icon">
              {getIcon(section.id)}
            </div>
            <span class="nav-label">{section.label}</span>
          </A>
        )}
      </For>
    </nav>
  );
};

export default MobileNavigation;