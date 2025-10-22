import anime from 'animejs';

// ====== PLAYER CONTROL ANIMATIONS ======

// Play button pulse
export const playButtonPulse = (element: HTMLElement) => {
  anime({
    targets: element,
    scale: [1, 1.1, 1],
    duration: 600,
    easing: 'easeInOutQuad',
    loop: false
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