# Animation Architecture Refactoring Plan
*Component-Colocated Animation System for Git WorkTree Compatibility*

## Executive Summary

This plan refactors Jamzy's monolithic 837-line `animations.ts` file into a distributed, component-colocated animation system. The new architecture eliminates Git merge conflicts in WorkTree environments while maintaining clean APIs and improving maintainability.

### Current Problem Analysis
- **Single Point of Conflict**: All animations in one file causes frequent merge conflicts
- **Coupling Issues**: UI components, sidebar, player controls, and effects all mixed together  
- **Scaling Challenges**: Adding new animations requires editing a massive shared file
- **Discovery Problems**: Developers must search through 800+ lines to find relevant animations

## Proposed Architecture: Component-Colocated Animation System

### Core Philosophy
**"Animations Live Where They're Used"** - Each component directory contains its own animation utilities, following the same pattern as CSS modules and component-specific logic.

### File Structure Strategy

```
src/
├── utils/
│   └── animations/
│       ├── index.ts                    # Re-export hub + core utilities
│       ├── core.ts                     # Shared utilities (stagger, transitions)
│       └── types.ts                    # TypeScript interfaces
└── components/
    ├── layout/
    │   └── Sidebar/
    │       ├── Sidebar.tsx
    │       ├── sidebar.css
    │       └── sidebar.animations.ts   # Sidebar-specific animations
    ├── player/
    │   ├── Player.tsx
    │   ├── player.module.css
    │   └── player.animations.ts        # Player control animations
    ├── ui/
    │   └── animations/
    │       ├── buttons.animations.ts    # Button hover/click effects
    │       ├── transitions.animations.ts # Slide in/out effects
    │       └── effects.animations.ts    # Particles, glitches, etc.
    └── [other-components]/
        └── [component].animations.ts    # Component-specific animations
```

## Detailed Implementation Plan

### Phase 1: Core Animation System
**File**: `src/utils/animations/core.ts`
**Purpose**: Foundational utilities shared across all components

```typescript
import anime from 'animejs';

// Core animation utilities
export const createStaggerAnimation = (elements: Element[], options: anime.AnimeParams) => {
  return anime({
    targets: elements,
    delay: anime.stagger(100),
    ...options
  });
};

export const resetTransforms = (element: HTMLElement) => {
  element.style.transform = 'translateZ(0)';
  element.style.transition = '';
};

export const disableTransitions = (element: HTMLElement) => {
  element.style.transition = 'none';
};

// Common easing presets
export const EASING = {
  smooth: 'easeOutCubic',
  bounce: 'easeOutElastic',
  quick: 'easeOutQuad'
} as const;

// Standard durations
export const DURATION = {
  fast: 200,
  normal: 300,
  slow: 400
} as const;
```

### Phase 2: Button Animation Module
**File**: `src/components/ui/animations/buttons.animations.ts`
**Consolidates**: Button hover, click, and state animations

```typescript
import anime from 'animejs';
import { disableTransitions, resetTransforms, DURATION, EASING } from '../../../utils/animations/core';

export const buttonHover = {
  enter: (element: HTMLElement) => {
    disableTransitions(element);
    anime({
      targets: element,
      scale: 1.05,
      translateY: -2,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      duration: DURATION.fast,
      easing: EASING.quick
    });
  },
  
  leave: (element: HTMLElement) => {
    anime({
      targets: element,
      scale: 1,
      translateY: 0,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      duration: DURATION.fast,
      easing: EASING.quick,
      complete: () => resetTransforms(element)
    });
  }
};

export const playbackButtonHover = {
  enter: (element: HTMLElement) => {
    disableTransitions(element);
    anime({
      targets: element,
      scale: 1.05,
      translateY: -2,
      duration: DURATION.fast,
      easing: EASING.quick
    });
  },
  
  leave: (element: HTMLElement) => {
    anime({
      targets: element,
      scale: 1,
      translateY: 0,
      duration: DURATION.fast,
      easing: EASING.quick,
      complete: () => resetTransforms(element)
    });
  }
};

// Other button-specific animations...
export const socialButtonClick = (element: HTMLElement) => {
  anime({
    targets: element,
    scale: [1, 0.95, 1],
    duration: 150,
    easing: EASING.quick
  });
};
```

### Phase 3: Sidebar Animation Module
**File**: `src/components/layout/Sidebar/sidebar.animations.ts`
**Consolidates**: All sidebar-related animations

```typescript
import anime from 'animejs';
import { createStaggerAnimation, DURATION, EASING } from '../../../utils/animations/core';

export const sidebarToggle = {
  expand: (element: HTMLElement) => {
    anime({
      targets: element,
      width: [64, 192],
      duration: 350,
      easing: EASING.smooth,
      complete: () => {
        const labels = element.querySelectorAll('.sidebar-section-label');
        createStaggerAnimation(Array.from(labels), {
          opacity: [0, 1],
          translateY: [15, 0],
          duration: DURATION.normal
        });
      }
    });
  },
  
  collapse: (element: HTMLElement) => {
    anime({
      targets: element.querySelectorAll('.sidebar-section-label'),
      opacity: [1, 0],
      duration: DURATION.fast,
      easing: 'easeInCubic',
      complete: () => {
        anime({
          targets: element,
          width: [192, 64],
          duration: DURATION.normal,
          easing: 'easeInCubic'
        });
      }
    });
  }
};

export const sidebarSectionHover = {
  enter: (element: HTMLElement, color: string) => {
    element.style.transition = 'none';
    anime({
      targets: element,
      translateX: [0, 4],
      boxShadow: [`0 0 0 transparent`, `0 0 8px ${color}`],
      duration: DURATION.fast,
      easing: EASING.quick
    });
  },
  
  leave: (element: HTMLElement) => {
    anime({
      targets: element,
      translateX: [4, 0],
      boxShadow: [`0 0 8px currentColor`, `0 0 0 transparent`],
      duration: DURATION.fast,
      easing: EASING.quick,
      complete: () => {
        element.style.transform = 'translateZ(0)';
      }
    });
  }
};

// Mobile-specific sidebar animations
export const sidebarMobileSlide = {
  slideIn: (element: HTMLElement) => {
    terminalBootSequence(element);
    anime({
      targets: element,
      translateX: [-192, 0],
      duration: DURATION.normal + 100,
      easing: EASING.smooth,
      complete: () => terminalScanEffect(element)
    });
  },
  
  slideOut: (element: HTMLElement) => {
    anime({
      targets: element,
      translateX: [0, -192],
      duration: DURATION.normal,
      easing: 'easeInCubic'
    });
  }
};

// Terminal-specific effects for mobile sidebar
const terminalBootSequence = (element: HTMLElement) => {
  // Implementation from original file...
};

const terminalScanEffect = (element: HTMLElement) => {
  // Implementation from original file...
};
```

### Phase 4: Player Animation Module
**File**: `src/components/player/player.animations.ts`
**Consolidates**: Player control and music-reactive animations

```typescript
import anime from 'animejs';
import { DURATION, EASING } from '../../utils/animations/core';

export const stateButtonHover = {
  enter: (element: HTMLElement) => {
    element.style.transition = 'none';
    anime({
      targets: element,
      scale: 1.1,
      translateY: -2,
      duration: DURATION.fast,
      easing: EASING.quick,
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
      duration: DURATION.fast,
      easing: EASING.quick,
      complete: () => {
        element.style.transition = '';
        element.style.transform = 'translateZ(0)';
      }
    });
  }
};

export const shuffleToggle = (element: HTMLElement, isActive: boolean) => {
  anime({
    targets: element,
    rotate: isActive ? 360 : 0,
    scale: [1, 1.2, 1],
    duration: DURATION.normal + 100,
    easing: EASING.smooth,
    complete: () => {
      element.style.filter = isActive 
        ? 'drop-shadow(0 0 6px currentColor)' 
        : 'none';
    }
  });
};

export const repeatToggle = (element: HTMLElement, isActive: boolean) => {
  anime({
    targets: element,
    scale: [1, 1.15, 1],
    rotate: isActive ? [0, 180] : [180, 0],
    duration: 350,
    easing: EASING.smooth,
    complete: () => {
      element.style.filter = isActive 
        ? 'drop-shadow(0 0 6px currentColor)' 
        : 'none';
    }
  });
};

// Music-reactive animations
export const musicReactiveElements = {
  tempoSync: (element: HTMLElement, bpm: number = 120) => {
    const beatDuration = (60 / bpm) * 1000;
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
        duration: DURATION.fast,
        easing: EASING.quick
      });
    });
  }
};

export const musicPlayerSync = {
  highlightActiveSection: (sectionElement: HTMLElement, platform: string) => {
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
      easing: EASING.smooth
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
```

### Phase 5: UI Transitions Module
**File**: `src/components/ui/animations/transitions.animations.ts`
**Consolidates**: General transition and slide effects

```typescript
import anime from 'animejs';
import { resetTransforms, DURATION, EASING } from '../../../utils/animations/core';

export const slideIn = {
  fromTop: (element: HTMLElement) => {
    anime({
      targets: element,
      translateY: [-20, 0],
      opacity: [0, 1],
      duration: DURATION.normal + 100,
      easing: EASING.smooth
    });
  },
  
  fromBottom: (element: HTMLElement) => {
    anime({
      targets: element,
      translateY: [20, 0],
      opacity: [0, 1],
      duration: DURATION.normal + 100,
      easing: EASING.smooth
    });
  },
  
  fromLeft: (element: HTMLElement) => {
    anime({
      targets: element,
      translateX: [-30, 0],
      opacity: [0, 1],
      duration: DURATION.normal + 100,
      easing: EASING.smooth,
      complete: () => resetTransforms(element)
    });
  }
};

export const slideOut = {
  toTop: (element: HTMLElement) => {
    return anime({
      targets: element,
      translateY: [0, -20],
      opacity: [1, 0],
      duration: DURATION.normal,
      easing: 'easeInCubic'
    });
  },
  
  toBottom: (element: HTMLElement) => {
    return anime({
      targets: element,
      translateY: [0, 20],
      opacity: [1, 0],
      duration: DURATION.normal,
      easing: 'easeInCubic'
    });
  }
};

export const morphTransition = (fromElement: HTMLElement, toElement: HTMLElement) => {
  anime({
    targets: fromElement,
    opacity: [1, 0],
    scale: [1, 0.95],
    duration: DURATION.normal,
    easing: 'easeInCubic',
    complete: () => {
      fromElement.style.display = 'none';
      toElement.style.display = 'block';
      
      anime({
        targets: toElement,
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: DURATION.normal + 100,
        easing: EASING.smooth
      });
    }
  });
};

export const replyBoxExpand = (element: HTMLElement) => {
  element.style.transform = 'scaleY(0)';
  element.style.transformOrigin = 'top';
  element.style.opacity = '0';
  
  anime({
    targets: element,
    scaleY: [0, 1],
    opacity: [0, 1],
    duration: DURATION.normal,
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
```

### Phase 6: Effects Module
**File**: `src/components/ui/animations/effects.animations.ts`
**Consolidates**: Special effects, particles, and visual polish

```typescript
import anime from 'animejs';
import { DURATION, EASING } from '../../../utils/animations/core';

export const particleBurst = (element: HTMLElement, options: { 
  color?: string;
  count?: number;
  distance?: number;
} = {}) => {
  const { color = '#04caf4', count = 12, distance = 80 } = options;
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'absolute w-2 h-2 rounded-full pointer-events-none z-50';
    particle.style.backgroundColor = color;
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    document.body.appendChild(particle);
    
    const angle = (i * (360 / count)) * Math.PI / 180;
    const finalDistance = distance + Math.random() * 40;
    
    anime({
      targets: particle,
      translateX: Math.cos(angle) * finalDistance,
      translateY: Math.sin(angle) * finalDistance,
      opacity: [1, 0],
      scale: [0.5, 0],
      duration: 800,
      easing: EASING.smooth,
      complete: () => particle.remove()
    });
  }
};

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
      easing: EASING.smooth,
      complete: () => particle.remove()
    });
  }
};

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
      duration: DURATION.fast,
      easing: EASING.quick
    });
  };
  
  const handleMouseLeave = () => {
    anime({
      targets: element,
      translateX: 0,
      translateY: 0,
      duration: DURATION.normal,
      easing: 'easeOutElastic'
    });
  };
  
  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);
};

// Loading and utility effects
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

export const loadingDots = (element: HTMLElement) => {
  let count = 0;
  
  const animate = () => {
    count = (count + 1) % 4;
    element.textContent = '.'.repeat(count);
  };
  
  const interval = setInterval(animate, 500);
  return () => clearInterval(interval);
};
```

### Phase 7: Central Re-export Hub
**File**: `src/utils/animations/index.ts`
**Purpose**: Maintain backward compatibility while providing organized imports

```typescript
// Core utilities
export * from './core';
export * from './types';

// Component-specific animations
export * from '../../components/ui/animations/buttons.animations';
export * from '../../components/ui/animations/transitions.animations';
export * from '../../components/ui/animations/effects.animations';
export * from '../../components/layout/Sidebar/sidebar.animations';
export * from '../../components/player/player.animations';

// Legacy compatibility exports (to be deprecated)
export {
  buttonHover,
  playbackButtonHover,
  socialButtonClick
} from '../../components/ui/animations/buttons.animations';

export {
  slideIn,
  slideOut,
  morphTransition,
  replyBoxExpand,
  replyBoxCollapse
} from '../../components/ui/animations/transitions.animations';

export {
  particleBurst,
  glitch,
  neonPulse,
  magnetic,
  shimmer,
  loadingDots
} from '../../components/ui/animations/effects.animations';

export {
  sidebarToggle,
  sidebarSectionHover,
  sidebarMobileSlide
} from '../../components/layout/Sidebar/sidebar.animations';

export {
  stateButtonHover,
  shuffleToggle,
  repeatToggle,
  musicReactiveElements,
  musicPlayerSync
} from '../../components/player/player.animations';

// Specific utility exports for backward compatibility
export const playButtonPulse = (element: HTMLElement) => {
  anime({
    targets: element,
    scale: [1, 1.1, 1],
    duration: 600,
    easing: 'easeInOutQuad',
    loop: false
  });
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

export const heartBeat = (element: HTMLElement) => {
  anime({
    targets: element,
    scale: [1, 1.3, 1],
    duration: 400,
    easing: 'easeInOutQuad'
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

export const float = (element: HTMLElement) => {
  anime({
    targets: element,
    translateY: [0, -8, 0],
    duration: 3000,
    easing: 'easeInOutSine',
    loop: true
  });
};

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

// Stagger utilities (commonly used)
export const staggeredFadeIn = (elements: NodeListOf<Element> | Element[]) => {
  anime({
    targets: elements,
    opacity: [0, 1],
    translateY: [15, 0],
    duration: 400,
    delay: anime.stagger(100),
    easing: 'easeOutCubic',
    complete: () => {
      Array.from(elements).forEach(el => {
        (el as HTMLElement).style.transform = 'translateZ(0)';
      });
    }
  });
};

// Icon-specific utilities
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
```

### Phase 8: TypeScript Interfaces
**File**: `src/utils/animations/types.ts`
**Purpose**: Shared TypeScript interfaces and types

```typescript
import type { AnimeParams } from 'animejs';

export interface HoverAnimation {
  enter: (element: HTMLElement) => void;
  leave: (element: HTMLElement) => void;
}

export interface StateAnimation {
  expand: (element: HTMLElement) => void;
  collapse: (element: HTMLElement) => void;
}

export interface MusicSyncOptions {
  bpm?: number;
  intensity?: number;
  platform?: 'spotify' | 'youtube' | 'soundcloud';
}

export interface ParticleOptions {
  color?: string;
  count?: number;
  distance?: number;
}

export interface TransitionOptions extends Partial<AnimeParams> {
  duration?: number;
  easing?: string;
  delay?: number;
}

export type AnimationDirection = 'enter' | 'leave';
export type SlideDirection = 'fromTop' | 'fromBottom' | 'fromLeft' | 'fromRight';
```

## Migration Strategy

### Step 1: Create New Structure (No Breaking Changes)
1. Create new directory structure under `src/utils/animations/`
2. Create component-specific animation files
3. Maintain original `animations.ts` file temporarily for backward compatibility

### Step 2: Gradual Component Migration
1. **Start with Sidebar**: Migrate `Sidebar.tsx` to use `sidebar.animations.ts`
2. **Player Components**: Migrate player controls to use `player.animations.ts`  
3. **UI Components**: Migrate button components to use `buttons.animations.ts`
4. **Effects**: Migrate special effects to use `effects.animations.ts`

### Step 3: Update Central Hub
1. Update `src/utils/animations/index.ts` to re-export from new modules
2. Ensure all existing imports continue to work
3. Add deprecation notices for direct animations.ts imports

### Step 4: Clean Up Legacy File
1. Remove original `animations.ts` file once all components migrated
2. Update import statements to use specific animation modules
3. Remove re-export compatibility layer from central hub

## Benefits Analysis

### Merge Conflict Resolution
- **Before**: Single 837-line file = guaranteed conflicts
- **After**: Component-specific files = isolated changes, zero conflicts

### Developer Experience Improvements
- **Discovery**: Find animations co-located with components
- **Context**: Animation files live next to the UI they affect  
- **Maintenance**: Smaller, focused files easier to understand and modify

### Code Organization Benefits
- **Separation of Concerns**: UI, player, sidebar, and effects properly separated
- **Reusability**: Core utilities shared, specific animations isolated
- **Extensibility**: New components can add their own animation files without touching shared code

### Performance Benefits
- **Tree Shaking**: Unused animation modules won't be bundled
- **Code Splitting**: Component-specific animations load with their components
- **Bundle Size**: No more loading entire animation library when only using buttons

## Implementation Risks & Mitigation

### Risk 1: Import Path Changes
**Mitigation**: Central re-export hub maintains backward compatibility during migration

### Risk 2: Animation Dependencies
**Mitigation**: Core utilities module provides shared functionality

### Risk 3: Developer Adoption
**Mitigation**: Clear documentation and gradual migration strategy

### Risk 4: Bundle Size Increase
**Mitigation**: Tree shaking eliminates unused code, actual bundle size should decrease

## Success Metrics

### Immediate Benefits (Phase 1-4)
- Zero merge conflicts in animation code after component migration
- Reduced PR review time (smaller, focused changes)
- Faster development iteration (no need to edit large files)

### Long-term Benefits (Phase 5+)
- Improved code discoverability and maintainability
- Better component isolation and reusability
- Enhanced bundle optimization through tree shaking

## Conclusion

This refactoring transforms Jamzy's animation system from a merge-conflict-prone monolith into a distributed, component-colocated architecture. The migration strategy ensures zero breaking changes while providing immediate benefits for Git WorkTree workflows.

The new system follows established patterns in the codebase (CSS modules, component organization) and provides a scalable foundation for future animation development. Developers can now work on component-specific animations without fear of conflicts, significantly improving the development experience in multi-developer WorkTree environments.