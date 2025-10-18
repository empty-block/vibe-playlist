import { Component } from 'solid-js';
import { For } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { setCurrentSection, currentSection } from '../../../stores/navigationStore';
import { navigationSections } from '../Sidebar/NavigationData';
import './mobileNavigationWin95.css';

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

  // Map section IDs to Win95 icon gradients
  const getIconClass = (sectionId: string) => {
    switch (sectionId) {
      case 'channels':
        return 'win95-nav-icon-channels';
      case 'activity':
        return 'win95-nav-icon-activity';
      case 'profile':
        return 'win95-nav-icon-profile';
      default:
        return 'win95-nav-icon-channels';
    }
  };

  return (
    <nav
      class={`win95-nav-bar ${props.class || ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <For each={navigationSections}>
        {(section) => (
          <A
            href={section.href}
            class="win95-nav-button"
            classList={{
              'win95-nav-button-active': currentSection() === section.id
            }}
            role="menuitem"
            aria-label={`Navigate to ${section.label} page`}
            aria-current={currentSection() === section.id ? 'page' : undefined}
            onClick={() => handleSectionClick(section.id)}
          >
            <div class={`win95-nav-icon ${getIconClass(section.id)}`}></div>
            <span class="win95-nav-label">{section.label}</span>
          </A>
        )}
      </For>
    </nav>
  );
};

export default MobileNavigation;