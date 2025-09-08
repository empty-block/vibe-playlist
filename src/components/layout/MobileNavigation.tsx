import { Component, createEffect } from 'solid-js';
import { For } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { setCurrentSection, currentSection } from '../../stores/sidebarStore';
import { navigationSections } from './Sidebar/NavigationData';
import './Sidebar/sidebar.css';

const MobileNavigation: Component = () => {
  const location = useLocation();
  
  // Update current section based on location
  createEffect(() => {
    const path = location.pathname;
    if (path === '/') setCurrentSection('home');
    else if (path === '/library') setCurrentSection('library');
    else if (path === '/network') setCurrentSection('stats');
    else if (path === '/me' || path.startsWith('/profile')) setCurrentSection('profile');
  });
  
  const isActive = (sectionId: string) => {
    return currentSection() === sectionId;
  };

  const handleSectionClick = (sectionId: string) => {
    setCurrentSection(sectionId);
  };

  return (
    <nav class="mobile-nav">
      <div class="mobile-nav-container">
        <For each={navigationSections}>
          {(section) => (
            <A
              href={section.href}
              class="mobile-nav-item"
              classList={{
                [`mobile-nav-item-${section.color}`]: true,
                'mobile-nav-item-active': isActive(section.id)
              }}
              onClick={() => handleSectionClick(section.id)}
            >
              <section.icon class="mobile-nav-icon" />
              <span class="mobile-nav-label">{section.label}</span>
            </A>
          )}
        </For>
      </div>
    </nav>
  );
};

export default MobileNavigation;