# Jamzy Home Page Design Plan
**Date:** 2025-09-02 15:30  
**Component:** Dual-Purpose Home Page (Splash + Personalized)  
**Target:** Seamless authentication transition with personalized content  

## Executive Summary

Design a dual-state home page that serves as both the primary landing page for unauthenticated users and a personalized dashboard for authenticated users. The design emphasizes seamless state transitions, retro cyberpunk aesthetics, and personalized music discovery while maintaining Jamzy's core philosophy of human-centered curation.

## Design Philosophy & Approach

### Core Principles
1. **Seamless State Transition**: Single component that morphs between splash and personalized states
2. **Simple Solutions First**: Avoid complex architecture - use straightforward state-based rendering
3. **Retro-Futuristic Harmony**: Balance 90s nostalgia with modern cyberpunk elements
4. **Natural Proportions**: Apply golden ratio (1:1.618) in major layout divisions
5. **Human-Centered Discovery**: Prioritize human curation over algorithmic recommendations

### Visual Hierarchy
- **Primary Focus**: Authentication CTAs (splash) / Recently Played (authenticated)
- **Secondary**: Feature highlights (splash) / Favorite Networks & Artists (authenticated)  
- **Tertiary**: Social proof (splash) / Discovery suggestions (authenticated)

## Technical Architecture

### Component Structure
```
HomePage.tsx (Single component with dual states)
├── SplashSection (when !isAuthenticated)
│   ├── HeroSection
│   ├── FeatureGrid
│   ├── LiveActivity
│   └── SocialProof
└── PersonalizedSection (when isAuthenticated)
    ├── WelcomeHeader
    ├── RecentlyPlayed
    ├── FavoriteNetworks
    ├── FavoriteArtists
    └── DiscoverySuggestions
```

### State Management
- Use existing `isAuthenticated()` signal from authStore
- Create consolidated `homePageData()` signal containing:
  - `recentlyPlayed: Track[]`
  - `favoriteNetworks: Network[]` 
  - `favoriteArtists: Artist[]`
  - `discoveryStats: { newConnections: number, newTracks: number }`
  - `suggestions: Suggestion[]`
- Additional loading states: `isLoading()` and `contentLoaded()`

### Animation Strategy
- **Entrance**: Gradual fade-in with staggered content blocks (no slow page animations)
- **State Transition**: Smooth morph animation between splash and personalized states
- **Micro-interactions**: Hover effects, button animations, floating elements
- **Loading States**: Custom neon pulse animations for data fetching

## Design Specifications

### Layout System (8px base unit)

#### Golden Ratio Application
- Main content area: 62% width (approaching 1/φ)
- Sidebar/secondary content: 38% width
- Vertical spacing follows Fibonacci sequence: 8px, 13px, 21px, 34px, 55px

#### Grid Structure
```css
.home-grid {
  display: grid;
  grid-template-columns: 1fr 640px 1fr; /* Center content at 640px */
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: var(--space-8); /* 32px */
}

@media (min-width: 1280px) {
  .home-grid {
    grid-template-columns: 1fr 800px 1fr; /* Wider on desktop */
  }
}
```

### Color Palette Implementation

#### Splash State Colors
- **Background**: `#0f0f0f` (--darker-bg) with subtle grid overlay
- **Primary CTAs**: `#3b00fd` (--neon-blue) with gradient treatment
- **Feature highlights**: `#04caf4` (--neon-cyan)
- **Activity indicators**: `#00f92a` (--neon-green)
- **Accent elements**: `#f906d6` (--neon-pink)

#### Authenticated State Colors  
- **Welcome text**: `#04caf4` (--neon-cyan) with glow effect
- **Recently played**: `#3b00fd` (--neon-blue) borders and highlights
- **Network badges**: `#00f92a` (--neon-green)
- **Artist cards**: `#ff9b00` (--neon-orange) accents
- **Discovery sections**: `#f906d6` (--neon-pink) highlights

### Typography Scale

#### Splash State Typography
```css
.hero-title {
  font-family: var(--font-display); /* JetBrains Mono */
  font-size: var(--text-2xl); /* 32px */
  font-weight: bold;
  letter-spacing: 0.1em;
  text-shadow: 0 0 20px currentColor;
}

.feature-title {
  font-family: var(--font-interface);
  font-size: var(--text-lg); /* 20px */
  font-weight: 600;
}

.body-text {
  font-family: var(--font-interface);
  font-size: var(--text-base); /* 16px */
  line-height: 1.6;
}
```

#### Authenticated State Typography
```css
.welcome-header {
  font-family: var(--font-display);
  font-size: var(--text-xl); /* 24px */
  font-weight: bold;
  letter-spacing: 0.05em;
}

.section-title {
  font-family: var(--font-display);
  font-size: var(--text-lg); /* 20px */
  font-weight: 600;
  text-transform: uppercase;
}

.content-title {
  font-family: var(--font-interface);
  font-size: var(--text-base); /* 16px */
  font-weight: 500;
}
```

## Content Strategy

### Splash State Content

#### Hero Section
- **Primary headline**: "JAMZY::MUSIC_DISCOVERY_PROTOCOL"
- **Subheadline**: "Where every track starts a conversation"
- **Terminal-style tagline**: "> Connecting music lovers on Farcaster since 2024"

#### Authentication CTAs
```html
<!-- Primary CTA -->
<button class="cta-primary">
  <span class="terminal-prompt">></span>
  <span>CONNECT_FARCASTER</span>
  <span class="cursor-blink">_</span>
</button>

<!-- Secondary CTA -->
<button class="cta-secondary">
  <span class="terminal-prompt">></span>
  <span>DEMO_MODE</span>
</button>
```

#### Feature Highlights (3-column grid)
1. **[DISCOVER]** - "Human-curated playlists from trusted networks"
2. **[COLLECT]** - "Build your library through social sharing" 
3. **[CONNECT]** - "Every song becomes a conversation thread"

### Authenticated State Content

#### Welcome Section
```
[TERMINAL::SESSION_ACTIVE]
> Welcome back, @{username}
> Your music network has grown by {new_connections} connections
> {new_tracks_count} new tracks discovered since last visit
```

#### Recently Played Section (4-track horizontal scroll)
- Track thumbnails (48x48px)
- Title + Artist (truncated elegantly)
- Play/pause state indicators
- "View All" link to full history

#### Favorite Networks Section (badge grid)
- Network avatars with user counts
- Activity indicators (green = active, gray = quiet)
- Quick filter buttons for library
- "Discover Networks" expansion

#### Favorite Artists Section (3-column grid)
- Artist images (1:1 aspect ratio)
- Recent activity indicators
- Quick access to artist's shared tracks
- "Discover Similar" suggestions

#### Discovery Suggestions (2-column layout)
- "Trending in Your Network" (left column)
- "AI Curated for You" (right column)
- Each suggestion includes reasoning text

## Component Implementation Details

### HomePage.tsx Structure

```typescript
const HomePage: Component = () => {
  const [isLoading, setIsLoading] = createSignal(false);
  const [contentLoaded, setContentLoaded] = createSignal(false);
  let pageRef: HTMLDivElement;

  // Consolidated personalized content state
  const [homePageData, setHomePageData] = createSignal({
    recentlyPlayed: [],
    favoriteNetworks: [],
    favoriteArtists: [],
    discoveryStats: null,
    suggestions: []
  });

  onMount(() => {
    // Initialize page animations
    if (pageRef) {
      pageEnter(pageRef);
    }

    // Load personalized content if authenticated
    if (isAuthenticated()) {
      loadPersonalizedContent();
    }
  });

  const loadPersonalizedContent = async () => {
    setIsLoading(true);
    
    // Load all data in parallel and update single state
    const [recentlyPlayed, favoriteNetworks, favoriteArtists, suggestions] = 
      await Promise.all([
        loadRecentlyPlayed(),
        loadFavoriteNetworks(), 
        loadFavoriteArtists(),
        loadDiscoverySuggestions()
      ]);
    
    setHomePageData({
      recentlyPlayed,
      favoriteNetworks,
      favoriteArtists,
      discoveryStats: { 
        newConnections: favoriteNetworks.filter(n => n.isNew).length,
        newTracks: recentlyPlayed.filter(t => t.isNew).length 
      },
      suggestions
    });
    
    setContentLoaded(true);
    setIsLoading(false);
  };

  return (
    <div ref={pageRef} class="home-container">
      <Show 
        when={isAuthenticated()} 
        fallback={<SplashSection />}
      >
        <PersonalizedSection 
          isLoading={isLoading()}
          contentLoaded={contentLoaded()}
        />
      </Show>
    </div>
  );
};
```

### Animation Specifications

#### Page Entrance (Both States)
```typescript
const pageEnter = (element: HTMLElement) => {
  // Set initial state
  anime.set(element, {
    opacity: 0,
    translateY: 10
  });

  // Animate in
  anime({
    targets: element,
    opacity: 1,
    translateY: 0,
    duration: 400,
    easing: 'easeOutCubic',
    delay: 100
  });
};
```

#### State Transition Animation
```typescript
const transitionToPersonalized = (splashElement: HTMLElement, personalizedElement: HTMLElement) => {
  // Fade out splash
  anime({
    targets: splashElement,
    opacity: 0,
    translateY: -20,
    duration: 300,
    easing: 'easeOutQuad',
    complete: () => {
      splashElement.style.display = 'none';
      personalizedElement.style.display = 'block';
      
      // Fade in personalized
      anime({
        targets: personalizedElement,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 400,
        easing: 'easeOutCubic'
      });
    }
  });
};
```

#### Content Block Stagger
```typescript
const staggerContentBlocks = (elements: NodeList) => {
  anime({
    targets: elements,
    opacity: [0, 1],
    translateY: [15, 0],
    duration: 300,
    delay: anime.stagger(100), // 100ms between each block
    easing: 'easeOutQuad'
  });
};
```

#### Hover Effects
```typescript
const trackHover = {
  enter: (element: HTMLElement) => {
    anime({
      targets: element,
      scale: 1.02,
      translateY: -1,
      boxShadow: '0 4px 20px rgba(59, 0, 253, 0.3)',
      duration: 200,
      easing: 'easeOutQuad'
    });
  },
  
  leave: (element: HTMLElement) => {
    anime({
      targets: element,
      scale: 1,
      translateY: 0,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      duration: 200,
      easing: 'easeOutQuad'
    });
  }
};
```

### Interactive Elements

#### Authentication Buttons (Splash)
```css
.cta-primary {
  background: linear-gradient(45deg, var(--neon-blue), #5d1aff);
  border: 2px solid var(--neon-blue);
  padding: var(--space-4) var(--space-6);
  border-radius: 4px;
  font-family: var(--font-display);
  font-weight: bold;
  letter-spacing: 0.05em;
  transition: all 200ms ease;
}

.cta-primary:hover {
  box-shadow: 0 0 20px rgba(59, 0, 253, 0.5);
  transform: translateY(-1px);
}

.cta-secondary {
  background: transparent;
  border: 2px solid var(--neon-cyan);
  color: var(--neon-cyan);
  padding: var(--space-4) var(--space-6);
  border-radius: 4px;
  font-family: var(--font-display);
  letter-spacing: 0.05em;
  transition: all 200ms ease;
}

.cta-secondary:hover {
  background: rgba(4, 202, 244, 0.1);
  box-shadow: 0 0 15px rgba(4, 202, 244, 0.3);
}
```

#### Track Cards (Authenticated)
```css
.track-card {
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(59, 0, 253, 0.3);
  border-radius: 4px;
  padding: var(--space-3);
  transition: all 200ms ease;
  cursor: pointer;
}

.track-card:hover {
  border-color: var(--neon-blue);
  background: rgba(59, 0, 253, 0.1);
  transform: translateY(-1px);
}

.track-thumbnail {
  width: 48px;
  height: 48px;
  border-radius: 2px;
  object-fit: cover;
}

.track-info {
  margin-left: var(--space-3);
  flex: 1;
  min-width: 0; /* Allow text truncation */
}

.track-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--light-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: var(--text-xs);
  color: var(--neon-cyan);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}
```

### Responsive Behavior

#### Mobile (320px - 768px)
- Single column layout
- Stacked content sections
- Simplified navigation
- Touch-friendly buttons (44px minimum)
- Horizontal scroll for track lists

#### Tablet (768px - 1024px)
- Two-column grid for features/content
- Maintained visual hierarchy
- Larger touch targets
- Condensed spacing

#### Desktop (1024px+)
- Full multi-column layouts
- Enhanced hover interactions
- Keyboard navigation support
- Maximum content density

### Loading States

#### Splash Loading
- Typing animation for terminal text
- Pulsing connectivity indicators
- Staggered feature card reveals

#### Authenticated Loading
```css
.content-skeleton {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(59, 0, 253, 0.1),
    transparent
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Error States

#### Authentication Errors
```html
<div class="error-panel">
  <div class="error-icon">⚠️</div>
  <div class="error-message">
    <h4>CONNECTION_FAILED</h4>
    <p>Unable to connect to Farcaster. Please try again.</p>
  </div>
  <button class="retry-button">RETRY_CONNECTION</button>
</div>
```

#### Data Loading Errors
```html
<div class="data-error">
  <span class="terminal-prompt">></span>
  <span class="error-text">Failed to load {content_type}</span>
  <button class="inline-retry" onclick="retryLoad()">
    [RETRY]
  </button>
</div>
```

## Development Implementation Steps

### Phase 1: Core Structure
1. Create `HomePage.tsx` component with dual state logic
2. Implement basic layout grid and spacing system
3. Set up authentication state detection
4. Create placeholder content for both states

### Phase 2: Splash State
1. Build hero section with terminal aesthetics
2. Implement authentication CTAs with proper styling
3. Create feature highlight grid
4. Add live activity ticker and social proof
5. Implement splash-specific animations

### Phase 3: Authenticated State  
1. Design welcome header with user context
2. Build recently played section with track cards
3. Create favorite networks badge system
4. Implement favorite artists grid
5. Add discovery suggestions layout

### Phase 4: Interactions & Animations
1. Implement state transition animations
2. Add hover effects and micro-interactions
3. Create loading state animations
4. Test and refine responsive behavior
5. Add keyboard navigation support

### Phase 5: Data Integration
1. Connect to existing authStore
2. Implement personalized data loading
3. Add error handling and retry logic
4. Integrate with existing routing system
5. Performance optimization

### Phase 6: Polish & Testing
1. Refine animation timing and easing
2. Test accessibility compliance
3. Cross-browser compatibility testing
4. Mobile device testing
5. Performance auditing

## Success Metrics

### User Experience Goals
- **Authentication Conversion**: >40% of splash visitors authenticate
- **Engagement Depth**: Authenticated users interact with 3+ personalized sections
- **Return Behavior**: Users return to home page (not just library) for discovery
- **Time to Value**: <2 seconds from authentication to personalized content

### Technical Performance Goals  
- **Initial Paint**: <500ms for splash state
- **Personalized Load**: <1.5s for authenticated content
- **Animation Performance**: 60fps for all interactions
- **Mobile Performance**: Lighthouse score >90

### Accessibility Goals
- **Keyboard Navigation**: Full functionality without mouse
- **Screen Reader**: Proper ARIA labels and semantic HTML
- **Color Contrast**: WCAG 2.1 AA compliance (4.5:1 minimum)
- **Focus Indicators**: Visible 2px neon-cyan outlines

## Future Enhancements

### Phase 2 Features
- **Smart Notifications**: "New tracks from your favorite networks"
- **Listening Parties**: Real-time shared listening experiences
- **Curator Spotlights**: Featured network curators
- **Mood-Based Discovery**: Emotional context for recommendations

### Advanced Personalizations
- **Learning Algorithm**: Improve suggestions based on engagement
- **Social Context**: Show what friends are currently playing
- **Seasonal Themes**: Visual themes that change with time/weather
- **Achievement System**: Gamify music discovery and sharing

## Design System Integration

### New Components Created
- `HomePage.tsx` - Main dual-state component
- `SplashSection.tsx` - Unauthenticated state
- `PersonalizedSection.tsx` - Authenticated state  
- `TrackCard.tsx` - Reusable track display component
- `NetworkBadge.tsx` - Network activity indicators
- `TerminalText.tsx` - Animated typing terminal text

### Design Tokens Extended
```css
/* Animation timings */
--transition-quick: 200ms;
--transition-medium: 300ms;
--transition-slow: 400ms;

/* Home page specific spacing */
--home-section-gap: var(--space-8); /* 32px */
--home-content-max-width: 800px;
--home-grid-gap: var(--space-6); /* 24px */

/* Glow effects */
--glow-small: 0 0 8px currentColor;
--glow-medium: 0 0 15px currentColor;
--glow-large: 0 0 20px currentColor;
```

### CSS Architecture
```
src/components/home/
├── HomePage.tsx
├── components/
│   ├── SplashSection.tsx
│   ├── PersonalizedSection.tsx
│   ├── TrackCard.tsx
│   ├── NetworkBadge.tsx
│   └── TerminalText.tsx
├── styles/
│   ├── home.module.css
│   ├── splash.module.css
│   ├── personalized.module.css
│   └── animations.css
└── hooks/
    ├── usePersonalizedData.ts
    └── useHomeAnimations.ts
```

## Conclusion

This design plan creates a sophisticated yet maintainable dual-purpose home page that serves both unauthenticated and authenticated users effectively. By following Jamzy's design principles of simplicity, human-centered curation, and retro-cyberpunk aesthetics, the home page will provide an engaging entry point while delivering personalized value to returning users.

The implementation prioritizes simple solutions over complex architectures, uses the existing design system effectively, and creates a foundation for future enhancements while maintaining optimal performance and accessibility standards.

---
*Generated for Jamzy AI Agent Implementation - 2025-09-02*