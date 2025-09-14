import anime from 'animejs';

// ================================================================
// LEGACY ANIMATION FILE - REFACTORED INTO MODULAR STRUCTURE
// ================================================================
// This file is maintained for backward compatibility during migration.
// New animations should be added to component-specific files:
// - Player: src/components/player/player.animations.ts  
// - Buttons: src/components/ui/animations/buttons.animations.ts
// - Transitions: src/components/ui/animations/transitions.animations.ts
// - Effects: src/components/ui/animations/effects.animations.ts
// ================================================================

// Utility functions for common UI animations

export const buttonHover = {
  enter: (element: HTMLElement) => {
    anime({
      targets: element,
      scale: 1.05,
      translateY: -2,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      duration: 200,
      easing: 'easeOutQuad'
    });
  },
  
  leave: (element: HTMLElement) => {
    anime({
      targets: element,
      scale: 1,
      translateY: 0,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      duration: 200,
      easing: 'easeOutQuad'
    });
  }
};

export const playButtonPulse = (element: HTMLElement) => {
  anime({
    targets: element,
    scale: [1, 1.1, 1],
    duration: 600,
    easing: 'easeInOutQuad',
    loop: false
  });
};

export const slideIn = {
  fromTop: (element: HTMLElement) => {
    anime({
      targets: element,
      translateY: [-20, 0],
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOutCubic'
    });
  },
  
  fromBottom: (element: HTMLElement) => {
    anime({
      targets: element,
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOutCubic'
    });
  },
  
  fromLeft: (element: HTMLElement) => {
    anime({
      targets: element,
      translateX: [-30, 0],
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOutCubic',
      complete: () => {
        // Ensure transform is properly reset after animation
        element.style.transform = 'translateZ(0)';
      }
    });
  }
};

export const slideOut = {
  toTop: (element: HTMLElement) => {
    return anime({
      targets: element,
      translateY: [0, -20],
      opacity: [1, 0],
      duration: 300,
      easing: 'easeInCubic'
    });
  },
  
  toBottom: (element: HTMLElement) => {
    return anime({
      targets: element,
      translateY: [0, 20],
      opacity: [1, 0],
      duration: 300,
      easing: 'easeInCubic'
    });
  }
};

export const counterAnimation = (element: HTMLElement, from: number, to: number) => {
  const obj = { count: from };
  anime({
    targets: obj,
    count: to,
    round: 1,
    duration: 800,
    easing: 'easeOutQuad',
    update: () => {
      element.textContent = obj.count.toString();
    }
  });
};

export const socialButtonClick = (element: HTMLElement) => {
  anime({
    targets: element,
    scale: [1, 0.95, 1],
    duration: 150,
    easing: 'easeInOutQuad'
  });
};

export const replyBoxExpand = (element: HTMLElement) => {
  // Set initial state
  element.style.transform = 'scaleY(0)';
  element.style.transformOrigin = 'top';
  element.style.opacity = '0';
  
  anime({
    targets: element,
    scaleY: [0, 1],
    opacity: [0, 1],
    duration: 300,
    easing: 'easeOutQuart'
  });
};

export const replyBoxCollapse = (element: HTMLElement) => {
  return anime({
    targets: element,
    scaleY: [1, 0],
    opacity: [1, 0],
    duration: 250,
    easing: 'easeInQuart'
  });
};

export const staggeredFadeIn = (elements: NodeListOf<Element> | Element[]) => {
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

export const iconSpin = (element: HTMLElement) => {
  anime({
    targets: element,
    rotate: '1turn',
    duration: 500,
    easing: 'easeInOutQuad'
  });
};

export const heartBeat = (element: HTMLElement) => {
  anime({
    targets: element,
    scale: [1, 1.3, 1],
    duration: 400,
    easing: 'easeInOutQuad'
  });
};

// Simplified playback button animations - works with CSS module styles
export const playbackButtonHover = {
  enter: (element: HTMLElement) => {
    // Disable CSS transitions temporarily to prevent conflicts
    element.style.transition = 'none';
    
    anime({
      targets: element,
      scale: 1.05,
      translateY: -2,
      duration: 200,
      easing: 'easeOutQuad',
      complete: () => {
        // Re-enable CSS transitions after animation
        element.style.transition = '';
      }
    });
  },
  
  leave: (element: HTMLElement) => {
    // Disable CSS transitions temporarily
    element.style.transition = 'none';
    
    anime({
      targets: element,
      scale: 1,
      translateY: 0,
      duration: 200,
      easing: 'easeOutQuad',
      complete: () => {
        // Re-enable CSS transitions and reset transform
        element.style.transition = '';
        element.style.transform = 'translateZ(0)';
      }
    });
  }
};

// Floating animation for special elements
export const float = (element: HTMLElement) => {
  anime({
    targets: element,
    translateY: [0, -8, 0],
    duration: 3000,
    easing: 'easeInOutSine',
    loop: true
  });
};

// Page entrance animation
export const pageEnter = (element: HTMLElement) => {
  anime({
    targets: element,
    opacity: [0, 1],
    translateY: [30, 0],
    scale: [0.95, 1],
    duration: 600,
    easing: 'easeOutCubic',
    delay: 100
  });
};

// Shimmer loading effect
export const shimmer = (element: HTMLElement) => {
  element.style.background = 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)';
  element.style.backgroundSize = '200% 100%';
  
  anime({
    targets: element,
    backgroundPosition: ['-200% 0', '200% 0'],
    duration: 1500,
    easing: 'linear',
    loop: true
  });
};

// Typewriter effect
export const typewriter = (element: HTMLElement, text: string, speed: number = 50) => {
  element.textContent = '';
  const chars = text.split('');
  let i = 0;
  
  const timer = setInterval(() => {
    if (i < chars.length) {
      element.textContent += chars[i];
      i++;
    } else {
      clearInterval(timer);
    }
  }, speed);
};

// Particle burst effect
export const particleBurst = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('div');
    particle.className = 'absolute w-2 h-2 rounded-full pointer-events-none z-50';
    particle.style.backgroundColor = '#04caf4';
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    document.body.appendChild(particle);
    
    const angle = (i * 30) * Math.PI / 180;
    const distance = 80 + Math.random() * 40;
    
    anime({
      targets: particle,
      translateX: Math.cos(angle) * distance,
      translateY: Math.sin(angle) * distance,
      opacity: [1, 0],
      scale: [0.5, 0],
      duration: 800,
      easing: 'easeOutCubic',
      complete: () => {
        particle.remove();
      }
    });
  }
};

// Glitch effect
export const glitch = (element: HTMLElement) => {
  const originalText = element.textContent;
  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      element.textContent = originalText?.split('').map(char => 
        Math.random() < 0.3 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
      ).join('') || '';
      
      anime({
        targets: element,
        textShadow: [
          '2px 0 #ff0000, -2px 0 #00ffff',
          '0 0 transparent'
        ],
        duration: 150,
        complete: () => {
          if (i === 2) element.textContent = originalText;
        }
      });
    }, i * 100);
  }
};

// Magnetic button effect
export const magnetic = (element: HTMLElement, strength: number = 20) => {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * 0.1;
    const deltaY = (e.clientY - centerY) * 0.1;
    
    anime({
      targets: element,
      translateX: deltaX,
      translateY: deltaY,
      duration: 200,
      easing: 'easeOutQuad'
    });
  };
  
  const handleMouseLeave = () => {
    anime({
      targets: element,
      translateX: 0,
      translateY: 0,
      duration: 300,
      easing: 'easeOutElastic'
    });
  };
  
  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);
};

// Terminal cursor blink effect
export const cursorBlink = (element: HTMLElement) => {
  anime({
    targets: element,
    opacity: [1, 0],
    duration: 800,
    direction: 'alternate',
    loop: true,
    easing: 'linear'
  });
};

// Neon glow pulse for special elements
export const neonPulse = (element: HTMLElement, color: string = '#04caf4') => {
  anime({
    targets: element,
    boxShadow: [
      `0 0 5px ${color}`,
      `0 0 20px ${color}, 0 0 35px ${color}`,
      `0 0 5px ${color}`
    ],
    duration: 2000,
    loop: true,
    easing: 'easeInOutSine'
  });
};

// Loading dots animation
export const loadingDots = (element: HTMLElement) => {
  const dots = element.textContent || '...';
  let count = 0;
  
  const animate = () => {
    count = (count + 1) % 4;
    element.textContent = '.'.repeat(count);
  };
  
  const interval = setInterval(animate, 500);
  
  // Return cleanup function
  return () => clearInterval(interval);
};

// Smooth state transition for dual-purpose components
export const morphTransition = (fromElement: HTMLElement, toElement: HTMLElement) => {
  // Fade out current content
  anime({
    targets: fromElement,
    opacity: [1, 0],
    scale: [1, 0.95],
    duration: 300,
    easing: 'easeInCubic',
    complete: () => {
      fromElement.style.display = 'none';
      toElement.style.display = 'block';
      
      // Fade in new content
      anime({
        targets: toElement,
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 400,
        easing: 'easeOutCubic'
      });
    }
  });
};

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

// Music-reactive elements (tempo sync, activity indicators)
export const musicReactiveElements = {
  tempoSync: (element: HTMLElement, bpm: number = 120) => {
    const beatDuration = (60 / bpm) * 1000; // Convert BPM to milliseconds
    
    anime({
      targets: element,
      scale: [1, 1.02, 1],
      duration: beatDuration / 2,
      loop: true,
      easing: 'easeInOutSine'
    });
  },
  
  activityIndicator: (element: HTMLElement, isActive: boolean = true) => {
    if (isActive) {
      anime({
        targets: element,
        opacity: [0.5, 1, 0.5],
        duration: 1500,
        loop: true,
        easing: 'easeInOutSine'
      });
    } else {
      anime.remove(element);
      element.style.opacity = '0.5';
    }
  },
  
  visualizerPulse: (elements: HTMLElement[], audioData?: number[]) => {
    elements.forEach((element, index) => {
      const intensity = audioData ? audioData[index] || 0.5 : Math.random();
      
      anime({
        targets: element,
        scaleY: [1, 1 + intensity],
        duration: 200,
        easing: 'easeOutQuad'
      });
    });
  }
};

// ====== PLAYER CONTROL ANIMATIONS ======

// State button animations (shuffle, repeat, etc.)
export const stateButtonHover = {
  enter: (element: HTMLElement) => {
    element.style.transition = 'none';
    
    anime({
      targets: element,
      scale: 1.1,
      translateY: -2,
      duration: 200,
      easing: 'easeOutQuad',
      complete: () => {
        element.style.transition = '';
      }
    });
  },
  
  leave: (element: HTMLElement) => {
    element.style.transition = 'none';
    
    anime({
      targets: element,
      scale: 1,
      translateY: 0,
      duration: 200,
      easing: 'easeOutQuad',
      complete: () => {
        element.style.transition = '';
        element.style.transform = 'translateZ(0)';
      }
    });
  }
};

// Shuffle button toggle animation
export const shuffleToggle = (element: HTMLElement, isActive: boolean) => {
  anime({
    targets: element,
    rotate: isActive ? 360 : 0,
    scale: [1, 1.2, 1],
    duration: 400,
    easing: 'easeOutCubic',
    complete: () => {
      // Add glow effect for active state
      if (isActive) {
        element.style.filter = 'drop-shadow(0 0 6px currentColor)';
      } else {
        element.style.filter = 'none';
      }
    }
  });
};

// Repeat button toggle animation
export const repeatToggle = (element: HTMLElement, isActive: boolean) => {
  anime({
    targets: element,
    scale: [1, 1.15, 1],
    rotate: isActive ? [0, 180] : [180, 0],
    duration: 350,
    easing: 'easeOutCubic',
    complete: () => {
      if (isActive) {
        element.style.filter = 'drop-shadow(0 0 6px currentColor)';
      } else {
        element.style.filter = 'none';
      }
    }
  });
};

// Status pulse for connection/loading states
export const statusPulse = (element: HTMLElement) => {
  anime({
    targets: element,
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.05, 1],
    duration: 1500,
    loop: true,
    easing: 'easeInOutSine'
  });
};

// Music player state synchronization
export const musicPlayerSync = {
  highlightActiveSection: (sectionElement: HTMLElement, platform: string) => {
    // Platform-specific colors
    const platformColors: Record<string, string> = {
      'spotify': '#00f92a',
      'youtube': '#ff0000',
      'soundcloud': '#ff7700',
      'default': '#04caf4'
    };
    
    const color = platformColors[platform] || platformColors.default;
    
    anime({
      targets: sectionElement,
      boxShadow: [
        '0 0 0 transparent',
        `0 0 15px ${color}`,
        `0 0 8px ${color}`
      ],
      duration: 1000,
      easing: 'easeOutCubic'
    });
  },
  
  nowPlayingPulse: (element: HTMLElement, isPlaying: boolean) => {
    if (isPlaying) {
      anime({
        targets: element,
        scale: [1, 1.05, 1],
        duration: 2000,
        loop: true,
        easing: 'easeInOutSine'
      });
    } else {
      anime.remove(element);
      element.style.transform = 'scale(1)';
    }
  }
};

// ====== MODAL ANIMATIONS ======

// Modal animation system for AddTrackModal
export const modalAnimations = {
  enter: (modalElement: HTMLElement, backdropElement: HTMLElement) => {
    // Backdrop fade in
    anime({
      targets: backdropElement,
      opacity: [0, 1],
      duration: 300,
      easing: 'easeOutQuad'
    });
    
    // Modal slide and scale in
    anime({
      targets: modalElement,
      translateY: [-50, 0],
      scale: [0.9, 1],
      opacity: [0, 1],
      duration: 400,
      delay: 200,
      easing: 'easeOutCubic'
    });
  },
  
  exit: (modalElement: HTMLElement, backdropElement: HTMLElement) => {
    return Promise.all([
      anime({
        targets: modalElement,
        translateY: [0, -30],
        scale: [1, 0.95],
        opacity: [1, 0],
        duration: 300,
        easing: 'easeInCubic'
      }).finished,
      
      anime({
        targets: backdropElement,
        opacity: [1, 0],
        duration: 400,
        delay: 100,
        easing: 'easeInQuad'
      }).finished
    ]);
  },
  
  // Terminal boot sequence for modal
  terminalBootSequence: (headerElement: HTMLElement, formElement: HTMLElement) => {
    // Terminal header typewriter effect
    const pathElement = headerElement.querySelector('.terminal-path');
    if (pathElement) {
      typewriter(pathElement as HTMLElement, 'library/add-track/', 30);
    }
    
    // Form inputs staggered fade-in
    const formChildren = formElement.querySelectorAll('.text-input, .animated-button');
    if (formChildren.length > 0) {
      anime({
        targets: formChildren,
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 300,
        delay: anime.stagger(100, {start: 500}),
        easing: 'easeOutQuad'
      });
    }
  },
  
  // Input focus effects
  inputFocus: (element: HTMLElement) => {
    anime({
      targets: element,
      boxShadow: [
        '0 0 0 rgba(4, 202, 244, 0)',
        '0 0 12px rgba(4, 202, 244, 0.4)'
      ],
      borderColor: ['rgba(4, 202, 244, 0.3)', 'rgba(4, 202, 244, 1)'],
      duration: 200,
      easing: 'easeOutQuad'
    });
  },
  
  inputBlur: (element: HTMLElement) => {
    anime({
      targets: element,
      boxShadow: [
        '0 0 12px rgba(4, 202, 244, 0.4)',
        '0 0 0 rgba(4, 202, 244, 0)'
      ],
      borderColor: ['rgba(4, 202, 244, 1)', 'rgba(4, 202, 244, 0.3)'],
      duration: 200,
      easing: 'easeOutQuad'
    });
  },
  
  // Submit button success state
  submitSuccess: (element: HTMLElement) => {
    anime({
      targets: element,
      scale: [1, 1.05, 1],
      boxShadow: [
        '0 0 16px rgba(4, 202, 244, 0.4)',
        '0 0 24px rgba(0, 249, 42, 0.6)',
        '0 0 16px rgba(4, 202, 244, 0.4)'
      ],
      duration: 600,
      easing: 'easeOutCubic'
    });
  }
};