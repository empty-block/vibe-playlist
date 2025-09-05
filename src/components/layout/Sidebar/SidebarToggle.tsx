import { Component } from 'solid-js';
import { ExpandIcon, CollapseIcon } from './SidebarIcons';
import { isExpanded, setIsExpanded } from '../../../stores/sidebarStore';
import { toggleParticleBurst } from '../../../utils/animations';

interface SidebarToggleProps {
  class?: string;
}

const SidebarToggle: Component<SidebarToggleProps> = (props) => {
  let toggleRef: HTMLButtonElement;

  const handleToggle = () => {
    setIsExpanded(!isExpanded());
    
    // Add particle burst effect
    if (toggleRef!) {
      toggleParticleBurst(toggleRef);
    }
    
    // Announce state change for screen readers
    const message = isExpanded() ? 'Sidebar expanded' : 'Sidebar collapsed';
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  return (
    <button
      ref={toggleRef!}
      class={`
        absolute top-3 left-3 z-10
        w-8 h-8 p-1.5 rounded
        bg-gray-900/80 border border-gray-700/50
        text-gray-400 hover:text-neon-cyan
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-black
        ${props.class || ''}
      `}
      onClick={handleToggle}
      aria-expanded={isExpanded()}
      aria-label={isExpanded() ? 'Collapse sidebar' : 'Expand sidebar'}
      aria-controls="sidebar-navigation"
    >
      {isExpanded() ? (
        <CollapseIcon class="w-full h-full" aria-hidden={true} />
      ) : (
        <ExpandIcon class="w-full h-full" aria-hidden={true} />
      )}
    </button>
  );
};

export default SidebarToggle;