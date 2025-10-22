import { Component, createSignal, onMount, onCleanup } from 'solid-js';

interface HeaderBarProps {
  onTerminalClick: () => void;
}

const HeaderBar: Component<HeaderBarProps> = (props) => {
  const [isMobile, setIsMobile] = createSignal(false);

  // Detect mobile screen size
  const checkIsMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  onMount(() => {
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
  });

  onCleanup(() => {
    window.removeEventListener('resize', checkIsMobile);
  });

  const handleButtonHover = (e: MouseEvent) => {
    const button = e.currentTarget as HTMLElement;
    button.style.transition = 'all 200ms ease';
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = '0 0 12px rgba(4, 202, 244, 0.6)';
  };

  const handleButtonLeave = (e: MouseEvent) => {
    const button = e.currentTarget as HTMLElement;
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 0 0px rgba(4, 202, 244, 0)';
  };

  const handleCloseClick = () => {
    // Add subtle pulse feedback before triggering terminal
    const closeBtn = document.querySelector('.header-close-btn') as HTMLElement;
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

  return (
    <header class="header-bar">
      <div class="header-content">
        {/* Title Section */}
        <div class="header-title-section">
          <i class="fas fa-cassette-tape header-icon"></i>
          <span class="header-title">
            {isMobile() ? 'JAMZY v2.0' : 'JAMZY - Social Music Discovery v2.0'}
          </span>
        </div>

        {/* Window Controls */}
        <div class="header-controls">
          {/* Show all buttons on desktop, only close on mobile */}
          {!isMobile() && (
            <>
              <button 
                class="header-button header-minimize-btn"
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
                aria-label="Minimize (disabled)"
                disabled
              >
                _
              </button>
              <button 
                class="header-button header-maximize-btn"
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
                aria-label="Maximize (disabled)"
                disabled
              >
                □
              </button>
            </>
          )}
          <button 
            class="header-button header-close-btn"
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            onClick={handleCloseClick}
            aria-label="Open Terminal (Easter Egg)"
          >
            ×
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;