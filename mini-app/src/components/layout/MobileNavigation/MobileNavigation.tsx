import { Component } from 'solid-js';
import { For } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { setCurrentSection, currentSection } from '../../../stores/navigationStore';
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

  // Render SVG icons based on section
  const getIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'home':
        return (
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" style="image-rendering: pixelated;">
            <path
              d="M4 12L14 3L24 12V23C24 23.5523 23.5523 24 23 24H5C4.44772 24 4 23.5523 4 23V12Z"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M10 24V15H18V24"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        );
      case 'channels':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" style="image-rendering: pixelated;">
            <path d="M2 6 L2 21 L22 21 L22 6 Z" fill="#F9D849" stroke="#000" stroke-width="0.5"/>
            <path d="M2 6 L2 3 L9 3 L10 6 Z" fill="#FBE671" stroke="#000" stroke-width="0.5"/>
            <path d="M3 20 L21 20 L21 7 L20 7 L20 19 L3 19 Z" fill="#D4A817"/>
            <ellipse cx="15" cy="17" rx="2" ry="1.5" fill="#000"/>
            <rect x="17" y="11" width="1.5" height="6" fill="#000"/>
            <path d="M18.5 11 L18.5 12 L21 11.5 L21 10 Z" fill="#000"/>
          </svg>
        );
      case 'trending':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" style="image-rendering: pixelated;">
            {/* Flame icon */}
            <path d="M12 3 L10 8 L8 12 C8 14 9 16 11 17 C11 15 12 13 13 13 L14 15 C15 15 17 14 17 12 L15 8 Z"
                  fill="#FF6B35" stroke="#000" stroke-width="0.5" stroke-linejoin="miter"/>
            <path d="M12 7 L11 10 C11 11 11.5 12 12.5 12.5 C12.5 11.5 13 10.5 13 10.5 L13.5 11.5 C14 11.5 15 11 15 10 L13.5 7.5 Z"
                  fill="#FFD700" stroke="#000" stroke-width="0.5"/>
            <ellipse cx="12" cy="18" rx="5" ry="1.5" fill="#FF6B35" opacity="0.3"/>
          </svg>
        );
      case 'profile':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" style="image-rendering: pixelated;">
            <circle cx="12" cy="8" r="4.5" fill="#A8C8E8" stroke="#000" stroke-width="0.5"/>
            <circle cx="10.5" cy="6.5" r="1.5" fill="#C8E0F8" opacity="0.6"/>
            <path d="M5 21 Q5 15 12 15 Q19 15 19 21 L16 21 Q16 17 12 17 Q8 17 8 21 Z"
                  fill="#7FA8D8" stroke="#000" stroke-width="0.5"/>
            <path d="M8 17 Q10 16 12 16 L12 17 Q10 17 9 17.5 Z" fill="#98B8E8" opacity="0.5"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <nav
      class={`nav-bar ${props.class || ''}`}
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