# Collapsible Cyber Sidebar - Complete Design Plan
*TASK-362: Implementation-Ready Specification*

## 📋 Executive Summary

This plan replaces the current 64px top Navigation with a **Collapsible Cyber Sidebar** that embodies Jamzy's retro-cyberpunk aesthetic while providing superior UX and screen real estate efficiency. The sidebar leverages vertical space (240px expanded, 64px collapsed) with smooth anime.js transitions and terminal-inspired visual design.

### Key Design Principles Applied
- **Retro UI, Modern UX**: Terminal-inspired aesthetics with contemporary interaction patterns
- **Info Dense, Visually Engaging**: 4 navigation sections with rich visual hierarchy
- **Fun Details Matter**: Micro-animations, neon glows, and Easter eggs throughout

---

## 🎨 Visual Specifications

### Dimensions & Layout
```css
/* Sidebar States */
--sidebar-expanded-width: 240px;
--sidebar-collapsed-width: 64px;
--sidebar-height: 100vh;
--sidebar-border-width: 1px;

/* Section Heights */
--section-height-expanded: 56px;  /* Matches current nav item height */
--section-height-collapsed: 48px; /* Square icon area */
--section-spacing: 8px;           /* --space-2 between sections */

/* Toggle Button */
--toggle-button-size: 40px;       /* Square button */
--toggle-button-margin: 12px;     /* --space-3 from edges */
```

### Color Palette Implementation
```css
/* Sidebar Background */
--sidebar-bg: #0f0f0f;           /* --darker-bg */
--sidebar-border: #333333;       /* Subtle border */
--sidebar-divider: #1a1a1a;      /* --dark-bg for separators */

/* Section Colors (Following Design Guidelines) */
/* Home - Primary Blue */
--home-color: #3b00fd;           /* --neon-blue */
--home-bg-active: rgba(59, 0, 253, 0.15);
--home-border-active: rgba(59, 0, 253, 0.5);

/* Library - Cyan */
--library-color: #04caf4;        /* --neon-cyan */
--library-bg-active: rgba(4, 202, 244, 0.15);
--library-border-active: rgba(4, 202, 244, 0.5);

/* Stats - Cyan */
--stats-color: #04caf4;          /* --neon-cyan */
--stats-bg-active: rgba(4, 202, 244, 0.15);
--stats-border-active: rgba(4, 202, 244, 0.5);

/* Profile - Pink */
--profile-color: #f906d6;        /* --neon-pink */
--profile-bg-active: rgba(249, 6, 214, 0.15);
--profile-border-active: rgba(249, 6, 214, 0.5);

/* Inactive States */
--inactive-color: #cccccc;       /* --muted-text */
--inactive-hover-color: #ffffff; /* --light-text */
```

### Typography Specifications
```css
/* Following Design Guidelines */
--sidebar-font: 'JetBrains Mono', monospace; /* --font-display */
--label-font-size: 14px;                     /* --text-sm */
--label-font-weight: 500;                    /* Medium weight */
--label-letter-spacing: 0.025em;             /* Subtle tracking */
--label-text-transform: uppercase;           /* Terminal-style caps */
```

### Border & Shadow System
```css
/* Sharp, Angular Design */
--border-radius: 0px;                        /* No rounding - retro aesthetic */
--border-style: solid;
--active-border-width: 2px;                  /* Neon accent borders */
--inactive-border-width: 1px;

/* Neon Glow Effects */
--glow-blur: 8px;                           /* --space-2 blur radius */
--glow-spread: 0px;                         /* No spread for sharp effect */
--active-glow: 0 0 var(--glow-blur) currentColor;
--hover-glow: 0 0 4px currentColor;         /* Subtle hover glow */
```

---

## 🎯 Component Structure

### File Organization
```
src/components/layout/
├── Sidebar/
│   ├── Sidebar.tsx              # Main sidebar component
│   ├── SidebarSection.tsx       # Individual nav section
│   ├── SidebarToggle.tsx        # Expand/collapse button
│   └── SidebarIcons.tsx         # Icon definitions
└── Navigation.tsx              # TO BE REPLACED
```

### Component Architecture (SolidJS)
```typescript
// Sidebar.tsx - Main Component
interface SidebarProps {
  class?: string;
}

interface SidebarSection {
  id: string;
  href: string;
  label: string;
  icon: Component;
  color: 'blue' | 'cyan' | 'pink';
  isPrimary?: boolean;
}

const Sidebar: Component<SidebarProps> = (props) => {
  // State management
  const [isExpanded, setIsExpanded] = createSignal(true);
  const [focusedIndex, setFocusedIndex] = createSignal(-1);
  const [hoverIndex, setHoverIndex] = createSignal(-1);
  
  // Animation refs
  let sidebarRef: HTMLElement;
  let sectionsRef: HTMLElement[] = [];
  
  // Navigation data
  const sections: SidebarSection[] = [
    { id: 'home', href: '/', label: 'Home', icon: HomeIcon, color: 'blue', isPrimary: true },
    { id: 'library', href: '/library', label: 'Library', icon: LibraryIcon, color: 'cyan' },
    { id: 'stats', href: '/network', label: 'Stats', icon: StatsIcon, color: 'cyan' },
    { id: 'profile', href: '/me', label: 'Profile', icon: ProfileIcon, color: 'pink' }
  ];
  
  // ... implementation details
};
```

---

## 🎮 Interaction Design

### Toggle Behavior
**Expanded → Collapsed:**
1. Button click triggers `anime.js` width animation (240px → 64px, 300ms)
2. Section labels fade out simultaneously (opacity 1 → 0, 200ms)
3. Icons remain centered, slight scale animation (1 → 0.9 → 1, 400ms)
4. State persists in localStorage as `sidebarExpanded: boolean`

**Collapsed → Expanded:**
1. Width animation (64px → 240px, 350ms with easeOutCubic)
2. Labels fade in with stagger (delay: 100ms, stagger: 50ms)
3. Icons scale back to normal (0.9 → 1, 200ms)
4. Subtle particle burst effect on toggle button

### Section Interactions
**Hover States (Desktop):**
```typescript
const sectionHover = {
  enter: (element: HTMLElement, color: string) => {
    anime({
      targets: element,
      translateX: [0, 4],
      boxShadow: [`0 0 0 ${color}`, `0 0 8px ${color}`],
      duration: 200,
      easing: 'easeOutQuad'
    });
  },
  
  leave: (element: HTMLElement) => {
    anime({
      targets: element,
      translateX: [4, 0],
      boxShadow: ['0 0 8px currentColor', '0 0 0 currentColor'],
      duration: 200,
      easing: 'easeOutQuad'
    });
  }
};
```

**Active States:**
- 2px colored left border
- Background tint (15% opacity of section color)
- Subtle neon glow matching section color
- Icon color matches section theme
- Label remains white for contrast

**Click Feedback:**
- Immediate scale animation (1 → 0.95 → 1, 150ms)
- Brief intensified glow (20px blur → 8px blur, 300ms)
- Sound-reactive: particle burst on play-related actions

### Keyboard Navigation Flow
```typescript
// Arrow Key Navigation (Up/Down when sidebar focused)
const handleKeyNavigation = (e: KeyboardEvent) => {
  if (!isExpanded()) return; // Collapsed sidebar skips arrow nav
  
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      focusedIndex() > 0 ? setFocusedIndex(focusedIndex() - 1) : setFocusedIndex(sections.length - 1);
      break;
    case 'ArrowDown':
      e.preventDefault();
      focusedIndex() < sections.length - 1 ? setFocusedIndex(focusedIndex() + 1) : setFocusedIndex(0);
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      navigateToSection(focusedIndex());
      break;
    case 'Tab':
      // Natural tab order maintained
      break;
  }
};

// Tab Navigation Order:
// 1. Toggle Button
// 2. Home Section
// 3. Library Section  
// 4. Stats Section
// 5. Profile Section
// 6. [Exits sidebar to main content]
```

---

## 📱 Responsive Behavior

### Breakpoint Strategy
```css
/* Mobile: < 640px */
@media (max-width: 639px) {
  .sidebar {
    position: fixed;
    left: -240px; /* Hidden by default */
    z-index: 50;
    transform: translateX(0);
    transition: transform 300ms ease;
  }
  
  .sidebar.mobile-open {
    transform: translateX(240px); /* Slide in from left */
  }
  
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 40;
  }
}

/* Tablet: 640px - 768px */
@media (min-width: 640px) and (max-width: 767px) {
  .sidebar {
    width: 64px; /* Always collapsed */
    --sidebar-auto-collapse: true;
  }
  
  .sidebar-section-label {
    display: none; /* Hide labels, icons only */
  }
}

/* Desktop: > 768px */
@media (min-width: 768px) {
  .sidebar {
    position: relative;
    width: var(--sidebar-width, 240px);
  }
}
```

### Mobile Overlay Interaction
```typescript
// Mobile-specific behavior
const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);

const handleMobileToggle = () => {
  setIsMobileMenuOpen(!isMobileMenuOpen());
  
  if (isMobileMenuOpen()) {
    // Slide in animation
    slideIn.fromLeft(sidebarRef);
    // Add backdrop
    document.body.style.overflow = 'hidden';
  } else {
    // Slide out animation
    slideOut.toLeft(sidebarRef);
    // Remove backdrop
    document.body.style.overflow = '';
  }
};

// Outside click to close (mobile only)
const handleBackdropClick = (e: MouseEvent) => {
  if (!sidebarRef.contains(e.target as Node)) {
    setIsMobileMenuOpen(false);
  }
};
```

### Tablet Auto-Collapse Logic
```typescript
// Smart responsive behavior
createEffect(() => {
  const mediaQuery = window.matchMedia('(min-width: 640px) and (max-width: 767px)');
  
  const handleTabletView = (e: MediaQueryListEvent) => {
    if (e.matches) {
      setIsExpanded(false); // Force collapse on tablet
    }
  };
  
  mediaQuery.addEventListener('change', handleTabletView);
  if (mediaQuery.matches) setIsExpanded(false);
  
  return () => mediaQuery.removeEventListener('change', handleTabletView);
});
```

---

## ⚡ Animation Specifications

### Core Animations (anime.js v3.2.1)
```typescript
// Sidebar expand/collapse
export const sidebarToggle = {
  expand: (element: HTMLElement) => {
    anime({
      targets: element,
      width: [64, 240],
      duration: 350,
      easing: 'easeOutCubic',
      complete: () => {
        // Trigger label fade-in
        staggeredFadeIn(element.querySelectorAll('.sidebar-section-label'));
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
          width: [240, 64],
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
```

### Performance Considerations
- All animations use `transform` and `opacity` for GPU acceleration
- `translateZ(0)` applied for hardware acceleration layer
- Animation duration under 400ms for snappy feel
- Stagger delays limited to 50ms increments
- CSS transitions disabled during anime.js animations

---

## 🛠 Technical Implementation

### State Management
```typescript
// Sidebar store (src/stores/sidebarStore.ts)
import { createSignal } from 'solid-js';

const [isExpanded, setIsExpanded] = createSignal(
  localStorage.getItem('sidebarExpanded') !== 'false'
);

const [currentSection, setCurrentSection] = createSignal('home');

// Persist state changes
createEffect(() => {
  localStorage.setItem('sidebarExpanded', isExpanded().toString());
});

export {
  isExpanded,
  setIsExpanded,
  currentSection,
  setCurrentSection
};
```

### CSS Architecture (Tailwind + Custom Properties)
```css
/* Component-specific utilities */
@layer components {
  .sidebar-section {
    @apply relative flex items-center h-14 px-4 transition-colors duration-200 cursor-pointer border-l-2 border-transparent;
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: 500;
    letter-spacing: 0.025em;
    text-transform: uppercase;
  }
  
  .sidebar-section-blue {
    @apply hover:border-neon-blue hover:bg-neon-blue/10 hover:text-neon-blue;
  }
  
  .sidebar-section-cyan {
    @apply hover:border-neon-cyan hover:bg-neon-cyan/10 hover:text-neon-cyan;
  }
  
  .sidebar-section-pink {
    @apply hover:border-neon-pink hover:bg-neon-pink/10 hover:text-neon-pink;
  }
  
  .sidebar-section-active {
    @apply border-current bg-current/15 text-current;
    box-shadow: 0 0 8px currentColor;
  }
  
  .sidebar-section-icon {
    @apply w-6 h-6 flex-shrink-0;
  }
  
  .sidebar-section-label {
    @apply ml-3 whitespace-nowrap overflow-hidden transition-opacity duration-200;
  }
  
  .sidebar-collapsed .sidebar-section-label {
    @apply opacity-0 pointer-events-none;
  }
}

/* Custom animations */
@keyframes neon-pulse {
  0%, 100% { box-shadow: 0 0 8px currentColor; }
  50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
}

.sidebar-section-active {
  animation: neon-pulse 2s ease-in-out infinite;
}
```

### Integration Points
```typescript
// Layout.tsx modifications
const Layout: Component<LayoutProps> = (props) => {
  const [showTerminal, setShowTerminal] = createSignal(false);

  return (
    <div class="h-screen relative overflow-hidden" style="background: linear-gradient(135deg, #04caf4 0%, #00f92a 100%);">
      <div class="tv-static fixed inset-0 pointer-events-none opacity-5"></div>
      
      <WindowsFrame onCloseClick={() => setShowTerminal(true)}>
        <div class="flex h-full">
          {/* NEW: Sidebar replaces Navigation */}
          <Sidebar />
          
          {/* Main Content - Adjusted for sidebar */}
          <div class="flex-1 flex flex-col min-w-0">
            <div class="flex-1 overflow-y-auto">
              {props.children}
            </div>
            
            {/* Player - Always bottom */}
            <Show when={currentTrack()}>
              <MediaPlayer />
            </Show>
          </div>
        </div>
      </WindowsFrame>
      
      <Show when={showTerminal()}>
        <Terminal onClose={() => setShowTerminal(false)} />
      </Show>
    </div>
  );
};
```

---

## ♿ Accessibility Implementation

### ARIA Attributes
```html
<!-- Sidebar Container -->
<nav 
  class="sidebar"
  role="navigation" 
  aria-label="Main navigation"
  aria-expanded={isExpanded()}
>
  <!-- Toggle Button -->
  <button 
    class="sidebar-toggle"
    onClick={handleToggle}
    aria-expanded={isExpanded()}
    aria-label={isExpanded() ? 'Collapse sidebar' : 'Expand sidebar'}
    aria-controls="sidebar-navigation"
  >
    <ToggleIcon />
  </button>
  
  <!-- Navigation Sections -->
  <ul class="sidebar-sections" id="sidebar-navigation">
    <For each={sections}>
      {(section, index) => (
        <li>
          <A 
            href={section.href}
            class={`sidebar-section sidebar-section-${section.color}`}
            classList={{
              'sidebar-section-active': isActive(section.href)
            }}
            aria-current={isActive(section.href) ? 'page' : undefined}
            aria-describedby={isExpanded() ? undefined : `${section.id}-tooltip`}
            data-section-index={index()}
            onFocus={() => setFocusedIndex(index())}
          >
            <section.icon class="sidebar-section-icon" aria-hidden="true" />
            <span class="sidebar-section-label">
              {section.label}
            </span>
          </A>
          
          <!-- Tooltip for collapsed state -->
          <Show when={!isExpanded()}>
            <div 
              id={`${section.id}-tooltip`}
              class="sidebar-tooltip"
              role="tooltip"
              aria-hidden="true"
            >
              {section.label}
            </div>
          </Show>
        </li>
      )}
    </For>
  </ul>
</nav>
```

### Keyboard Navigation
```typescript
// Enhanced keyboard support
const handleKeyDown = (e: KeyboardEvent) => {
  const focusedElement = document.activeElement;
  
  // Sidebar-specific shortcuts
  if (e.ctrlKey && e.key === 'b') {
    e.preventDefault();
    toggleSidebar();
    return;
  }
  
  // Arrow navigation within sidebar
  if (focusedElement?.closest('.sidebar')) {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        focusPreviousSection();
        break;
      case 'ArrowDown':
        e.preventDefault();
        focusNextSection();
        break;
      case 'Home':
        e.preventDefault();
        focusFirstSection();
        break;
      case 'End':
        e.preventDefault();
        focusLastSection();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        activateCurrentSection();
        break;
    }
  }
};
```

### Focus Management
```typescript
// Focus indicators and management
const focusNextSection = () => {
  const currentIndex = focusedIndex();
  const nextIndex = currentIndex >= sections.length - 1 ? 0 : currentIndex + 1;
  setFocusedIndex(nextIndex);
  
  const nextElement = document.querySelector(`[data-section-index="${nextIndex}"]`);
  (nextElement as HTMLElement)?.focus();
};

// Focus trapping for mobile overlay
const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  });
};
```

### Screen Reader Support
```typescript
// Live region announcements
const announceStateChange = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Usage examples
const handleToggle = () => {
  setIsExpanded(!isExpanded());
  announceStateChange(
    isExpanded() ? 'Sidebar expanded' : 'Sidebar collapsed'
  );
};
```

---

## 📐 Z-Index & Layering

### Layering Strategy
```css
/* Z-index scale */
:root {
  --z-sidebar: 30;
  --z-sidebar-overlay: 25;
  --z-toggle-button: 35;
  --z-tooltips: 40;
  --z-dropdown: 45;
  --z-modal: 50;          /* Terminal, existing modals */
  --z-toast: 60;          /* Notifications */
}

/* Implementation */
.sidebar {
  z-index: var(--z-sidebar);
}

.sidebar-overlay {
  z-index: var(--z-sidebar-overlay);
}

.sidebar-toggle {
  z-index: var(--z-toggle-button);
}

.sidebar-tooltip {
  z-index: var(--z-tooltips);
}
```

### Content Layout Adjustments
```css
/* Main content adapts to sidebar width */
.main-content {
  margin-left: var(--sidebar-width, 240px);
  transition: margin-left 300ms ease;
}

.sidebar-collapsed + .main-content {
  margin-left: 64px;
}

/* Mobile: no margin adjustment (overlay mode) */
@media (max-width: 639px) {
  .main-content {
    margin-left: 0;
  }
}
```

---

## 🎨 Icon System

### Icon Components (SolidJS)
```typescript
// SidebarIcons.tsx
import { Component } from 'solid-js';

interface IconProps {
  class?: string;
  'aria-hidden'?: boolean;
}

export const HomeIcon: Component<IconProps> = (props) => (
  <svg 
    class={props.class} 
    aria-hidden={props['aria-hidden']}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2"
    stroke-linecap="square"    // Sharp, retro styling
    stroke-linejoin="miter"    // Angular joints
  >
    <path d="M3 9L12 2L21 9V20A2 2 0 0 1 19 22H5A2 2 0 0 1 3 20V9Z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

export const LibraryIcon: Component<IconProps> = (props) => (
  <svg class={props.class} aria-hidden={props['aria-hidden']} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z" />
    <circle cx="10" cy="8" r="1" />
    <path d="M15 7V13" />
    <path d="M13 9.5A1.5 1.5 0 0 0 14.5 11A1.5 1.5 0 0 0 16 9.5" />
  </svg>
);

export const StatsIcon: Component<IconProps> = (props) => (
  <svg class={props.class} aria-hidden={props['aria-hidden']} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
  </svg>
);

export const ProfileIcon: Component<IconProps> = (props) => (
  <svg class={props.class} aria-hidden={props['aria-hidden']} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
    <path d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 0 4 19V21" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const ToggleIcon: Component<IconProps> = (props) => (
  <svg class={props.class} aria-hidden={props['aria-hidden']} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <path d="M9 9L15 15" />
    <path d="M15 9L9 15" />
  </svg>
);
```

### Icon Animation States
```typescript
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
```

---

## 🔧 Configuration & Customization

### Theme Integration
```typescript
// Sidebar theme configuration
interface SidebarTheme {
  background: string;
  border: string;
  sections: {
    [key: string]: {
      color: string;
      hoverBg: string;
      activeBg: string;
      activeBorder: string;
    };
  };
}

const defaultTheme: SidebarTheme = {
  background: '#0f0f0f',
  border: '#333333',
  sections: {
    blue: {
      color: '#3b00fd',
      hoverBg: 'rgba(59, 0, 253, 0.1)',
      activeBg: 'rgba(59, 0, 253, 0.15)',
      activeBorder: 'rgba(59, 0, 253, 0.5)'
    },
    cyan: {
      color: '#04caf4',
      hoverBg: 'rgba(4, 202, 244, 0.1)',
      activeBg: 'rgba(4, 202, 244, 0.15)',
      activeBorder: 'rgba(4, 202, 244, 0.5)'
    },
    pink: {
      color: '#f906d6',
      hoverBg: 'rgba(249, 6, 214, 0.1)',
      activeBg: 'rgba(249, 6, 214, 0.15)',
      activeBorder: 'rgba(249, 6, 214, 0.5)'
    }
  }
};
```

### Performance Settings
```typescript
// Animation performance configuration
interface SidebarAnimationConfig {
  enableAnimations: boolean;
  reducedMotion: boolean;
  animationDuration: {
    toggle: number;
    hover: number;
    focus: number;
  };
  enableParticleEffects: boolean;
  enableGlowEffects: boolean;
}

const getAnimationConfig = (): SidebarAnimationConfig => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return {
    enableAnimations: !reducedMotion,
    reducedMotion,
    animationDuration: {
      toggle: reducedMotion ? 150 : 300,
      hover: reducedMotion ? 100 : 200,
      focus: reducedMotion ? 0 : 150
    },
    enableParticleEffects: !reducedMotion,
    enableGlowEffects: !reducedMotion
  };
};
```

---

## 📋 Implementation Checklist

### Phase 1: Core Structure
- [ ] Create Sidebar component directory
- [ ] Implement basic expanded/collapsed states
- [ ] Add toggle button functionality
- [ ] Set up section routing with SolidJS Router
- [ ] Implement responsive breakpoint behavior

### Phase 2: Visual Polish
- [ ] Apply neon color palette system
- [ ] Add JetBrains Mono typography
- [ ] Implement sharp border styling
- [ ] Create icon components with proper styling
- [ ] Add active state indicators

### Phase 3: Interactions & Animations
- [ ] Integrate anime.js animations for toggle
- [ ] Add hover effects with glow system
- [ ] Implement keyboard navigation flow
- [ ] Add particle burst effects
- [ ] Create staggered label animations

### Phase 4: Accessibility
- [ ] Add comprehensive ARIA attributes
- [ ] Implement focus management
- [ ] Create keyboard shortcuts (Ctrl+B for toggle)
- [ ] Add screen reader announcements
- [ ] Test with keyboard-only navigation

### Phase 5: Responsive & Mobile
- [ ] Implement mobile overlay behavior
- [ ] Add backdrop click handling
- [ ] Create tablet auto-collapse logic
- [ ] Test touch interactions
- [ ] Optimize for various screen sizes

### Phase 6: Integration & Testing
- [ ] Replace Navigation component in Layout
- [ ] Adjust main content margins
- [ ] Test z-index layering
- [ ] Performance testing (60fps requirement)
- [ ] Cross-browser compatibility testing

### Phase 7: Polish & Easter Eggs
- [ ] Add terminal cursor effects
- [ ] Implement sound-reactive features
- [ ] Create achievement glow animations
- [ ] Add loading state transitions
- [ ] Hide subtle retro Easter eggs

---

## 🎯 Success Metrics

### Performance Targets
- **Animation Performance**: Consistent 60fps during all transitions
- **Memory Usage**: <5MB additional memory overhead
- **Load Time**: <100ms initial render
- **Interaction Response**: <100ms feedback for all user actions

### UX Validation
- **Navigation Efficiency**: 50% reduction in clicks for multi-page workflows
- **Screen Space**: 25% more content visible with collapsed sidebar
- **Accessibility**: 100% keyboard navigable, screen reader compatible
- **Mobile Usability**: Thumb-friendly touch targets (44px minimum)

### Technical Quality
- **Code Coverage**: >90% component test coverage
- **Bundle Size**: <25KB gzipped additional size
- **Performance Budget**: No impact on Core Web Vitals
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+

---

## 🔮 Future Enhancements

### Phase 2 Features
- **Smart Badges**: Notification counts on Library/Stats sections
- **Quick Actions**: Right-click context menus on sections
- **Customizable Shortcuts**: User-defined keyboard shortcuts
- **Theme Variants**: Light mode and custom color schemes
- **Micro-Interactions**: Sound effects for interactions

### Advanced Features
- **AI Integration**: Contextual suggestions based on listening history
- **Social Indicators**: Friends online status in Profile section
- **Progressive Enhancement**: Graceful degradation without JavaScript
- **Gesture Support**: Swipe gestures for mobile sidebar
- **Voice Control**: "Hey Jamzy, open Library" commands

---

*This design plan represents a pixel-perfect specification for implementing the Collapsible Cyber Sidebar. Each section provides exact implementation details following Jamzy's design principles while ensuring modern UX standards and accessibility requirements.*

**Next Steps:**
1. Review and approve this design specification
2. Begin Phase 1 implementation with core structure
3. Iterate through phases while maintaining design consistency
4. Conduct user testing at Phase 4 completion
5. Launch with full polish and Easter eggs

**File References:**
- Implementation: `src/components/layout/Sidebar/`
- Animations: `src/utils/animations.ts` (extend existing)
- State Management: `src/stores/sidebarStore.ts` (new)
- Styles: Tailwind classes + custom CSS properties