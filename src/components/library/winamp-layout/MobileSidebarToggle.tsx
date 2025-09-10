import { Component } from 'solid-js';

interface MobileSidebarToggleProps {
  onToggle: () => void;
  isOpen: boolean;
}

const MobileSidebarToggle: Component<MobileSidebarToggleProps> = (props) => {
  return (
    <button
      class={`mobile-sidebar-toggle ${props.isOpen ? 'open' : ''}`}
      onClick={props.onToggle}
      aria-label="Toggle library navigation"
      aria-expanded={props.isOpen}
    >
      <div class="hamburger-icon">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </div>
    </button>
  );
};

export default MobileSidebarToggle;