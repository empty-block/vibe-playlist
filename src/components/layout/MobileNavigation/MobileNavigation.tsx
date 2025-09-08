import { Component } from 'solid-js';
import { For } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { setCurrentSection, currentSection } from '../../../stores/sidebarStore';
import { navigationSections } from '../Sidebar/NavigationData';
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

  return (
    <nav 
      class={`mobile-nav ${props.class || ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div class="mobile-nav-container">
        <For each={navigationSections}>
          {(section) => (
            <A
              href={section.href}
              class="mobile-nav-item"
              classList={{
                [`mobile-nav-item-${section.color}`]: true,
                'mobile-nav-item-active': currentSection() === section.id
              }}
              role="menuitem"
              aria-label={`Navigate to ${section.label} page`}
              aria-current={currentSection() === section.id ? 'page' : undefined}
              onClick={() => handleSectionClick(section.id)}
            >
              <div class="mobile-nav-icon">
                <section.icon class="mobile-nav-icon-svg" />
              </div>
              <span class="mobile-nav-label">{section.label}</span>
            </A>
          )}
        </For>
      </div>
    </nav>
  );
};

export default MobileNavigation;