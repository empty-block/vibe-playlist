import { Component, createSignal, onMount, onCleanup } from 'solid-js';
import './CompactHeader.css';

interface CompactHeaderProps {
  onTerminalClick: () => void;
}

const CompactHeader: Component<CompactHeaderProps> = (props) => {
  const [isMobile, setIsMobile] = createSignal(false);
  const [isTablet, setIsTablet] = createSignal(false);

  // Detect screen size for responsive title
  const checkScreenSize = () => {
    const width = window.innerWidth;
    setIsMobile(width < 480);
    setIsTablet(width >= 480 && width < 768);
  };

  onMount(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
  });

  onCleanup(() => {
    window.removeEventListener('resize', checkScreenSize);
  });

  const handleCloseClick = () => {
    // Add subtle pulse feedback before triggering terminal
    const closeBtn = document.querySelector('.compact-header-close-btn') as HTMLElement;
    if (closeBtn) {
      closeBtn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        closeBtn.style.transform = 'scale(1)';
        props.onTerminalClick();
      }, 100);
    } else {
      props.onTerminalClick();
    }
  };

  const getTitle = () => {
    if (isMobile()) {
      return 'JAMZY';
    } else if (isTablet()) {
      return 'JAMZY v2.0';
    } else {
      return 'JAMZY v2.0 - Social Music Discovery';
    }
  };

  return (
    <header class="compact-header">
      <div class="compact-header-content">
        {/* Title Section */}
        <div class="compact-header-title-section">
          <i class="fas fa-cassette-tape compact-header-icon"></i>
          <span class="compact-header-title">
            {getTitle()}
          </span>
        </div>

        {/* Close Button (Terminal Easter Egg) */}
        <button 
          class="compact-header-close-btn"
          onClick={handleCloseClick}
          aria-label="Open Terminal (Easter Egg)"
          title="Click to open terminal"
        >
          ×
        </button>
      </div>
    </header>
  );
};

export default CompactHeader;