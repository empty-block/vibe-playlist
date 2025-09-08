import anime from 'animejs';

// ====== SIDEBAR ANIMATIONS ======

// Sidebar expand/collapse
export const sidebarToggle = {
  expand: (element: HTMLElement) => {
    anime({
      targets: element,
      width: [64, 192],
      duration: 350,
      easing: 'easeOutCubic',
      complete: () => {
        // Trigger label fade-in
        const labels = element.querySelectorAll('.sidebar-section-label');
        staggeredFadeIn(labels);
      }
    });
  },
  
  collapse: (element: HTMLElement) => {
    // Hide labels first
    anime({
      targets: element.querySelectorAll('.sidebar-section-label'),
      opacity: [1, 0],
      duration: 200,
      easing: 'easeInCubic',
      complete: () => {
        // Then collapse width
        anime({
          targets: element,
          width: [192, 64],
          duration: 300,
          easing: 'easeInCubic'
        });
      }
    });
  }
};

// Section hover effects
export const sidebarSectionHover = {
  enter: (element: HTMLElement, color: string) => {
    element.style.transition = 'none';
    
    anime({
      targets: element,
      translateX: [0, 4],
      boxShadow: [`0 0 0 transparent`, `0 0 8px ${color}`],
      duration: 200,
      easing: 'easeOutQuad'
    });
  },
  
  leave: (element: HTMLElement) => {
    anime({
      targets: element,
      translateX: [4, 0],
      boxShadow: [`0 0 8px currentColor`, `0 0 0 transparent`],
      duration: 200,
      easing: 'easeOutQuad',
      complete: () => {
        element.style.transform = 'translateZ(0)';
      }
    });
  }
};

// Active section pulse
export const sidebarActivePulse = (element: HTMLElement, color: string) => {
  anime({
    targets: element,
    boxShadow: [
      `0 0 8px ${color}`,
      `0 0 20px ${color}`,
      `0 0 8px ${color}`
    ],
    duration: 1500,
    easing: 'easeInOutSine',
    direction: 'alternate',
    loop: 3
  });
};

// Toggle button particle burst
export const toggleParticleBurst = (element: HTMLElement) => {
  const colors = ['#3b00fd', '#04caf4', '#00f92a', '#f906d6'];
  
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.className = 'absolute w-1 h-1 rounded-full pointer-events-none';
    particle.style.backgroundColor = colors[i % colors.length];
    
    const rect = element.getBoundingClientRect();
    particle.style.left = `${rect.left + rect.width / 2}px`;
    particle.style.top = `${rect.top + rect.height / 2}px`;
    
    document.body.appendChild(particle);
    
    const angle = (i * 45) * Math.PI / 180;
    anime({
      targets: particle,
      translateX: Math.cos(angle) * 30,
      translateY: Math.sin(angle) * 30,
      opacity: [1, 0],
      scale: [0.5, 0],
      duration: 600,
      easing: 'easeOutCubic',
      complete: () => particle.remove()
    });
  }
};

// Icon hover animations
export const iconHover = {
  enter: (element: HTMLElement) => {
    anime({
      targets: element,
      scale: [1, 1.1],
      rotate: [0, 5],
      duration: 200,
      easing: 'easeOutQuad'
    });
  },
  
  leave: (element: HTMLElement) => {
    anime({
      targets: element,
      scale: [1.1, 1],
      rotate: [5, 0],
      duration: 200,
      easing: 'easeOutQuad'
    });
  }
};

// Active section icon glow
export const iconActiveGlow = (element: HTMLElement) => {
  anime({
    targets: element,
    filter: [
      'drop-shadow(0 0 4px currentColor)',
      'drop-shadow(0 0 8px currentColor)',
      'drop-shadow(0 0 4px currentColor)'
    ],
    duration: 2000,
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutSine'
  });
};

// Enhanced mobile sidebar slide with terminal boot sequence
export const sidebarMobileSlide = {
  slideIn: (element: HTMLElement) => {
    // Add terminal boot sequence first
    terminalBootSequence(element);
    
    anime({
      targets: element,
      translateX: [-192, 0],
      duration: 400,
      easing: 'easeOutCubic',
      complete: () => {
        // Add scanning effect after slide-in
        terminalScanEffect(element);
      }
    });
  },
  
  slideOut: (element: HTMLElement) => {
    anime({
      targets: element,
      translateX: [0, -192],
      duration: 300,
      easing: 'easeInCubic'
    });
  }
};

// Terminal boot sequence for mobile
export const terminalBootSequence = (element: HTMLElement) => {
  // Create boot overlay
  const bootOverlay = document.createElement('div');
  bootOverlay.className = 'absolute inset-0 bg-black/95 z-50 flex flex-col justify-center items-start px-4 font-mono text-xs text-library-color';
  bootOverlay.innerHTML = `
    <div class="boot-line opacity-0">JAMZY TERMINAL v2.0</div>
    <div class="boot-line opacity-0">Initializing navigation system...</div>
    <div class="boot-line opacity-0">Loading user preferences...</div>
    <div class="boot-line opacity-0">Connecting to music services...</div>
    <div class="boot-line opacity-0">System ready ●</div>
  `;
  
  element.appendChild(bootOverlay);
  
  // Animate boot lines
  const bootLines = bootOverlay.querySelectorAll('.boot-line');
  
  anime({
    targets: bootLines,
    opacity: [0, 1],
    translateX: [-20, 0],
    duration: 300,
    delay: anime.stagger(400),
    easing: 'easeOutQuad',
    complete: () => {
      // Fade out boot overlay
      anime({
        targets: bootOverlay,
        opacity: [1, 0],
        duration: 500,
        delay: 800,
        easing: 'easeInQuad',
        complete: () => {
          bootOverlay.remove();
        }
      });
    }
  });
};

// Terminal scanning effect
export const terminalScanEffect = (element: HTMLElement) => {
  const scanLine = document.createElement('div');
  scanLine.className = 'absolute top-0 left-0 w-full h-0.5 bg-library-color/60 z-40';
  scanLine.style.boxShadow = '0 0 10px var(--library-color)';
  
  element.appendChild(scanLine);
  
  anime({
    targets: scanLine,
    translateY: [0, element.offsetHeight],
    opacity: [0, 1, 0],
    duration: 2000,
    easing: 'easeInOutQuad',
    complete: () => {
      scanLine.remove();
    }
  });
};

// Utility function used by sidebar animations
const staggeredFadeIn = (elements: NodeListOf<Element> | Element[]) => {
  anime({
    targets: elements,
    opacity: [0, 1],
    translateY: [15, 0],
    duration: 400,
    delay: anime.stagger(100),
    easing: 'easeOutCubic',
    complete: () => {
      // Ensure transforms are properly reset after stagger animation
      Array.from(elements).forEach(el => {
        (el as HTMLElement).style.transform = 'translateZ(0)';
      });
    }
  });
};