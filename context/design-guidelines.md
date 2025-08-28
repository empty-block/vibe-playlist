# Jamzy Design Guidelines

## 🎨 Core Design Principles
### Retro UI, Modern Style
Jamzy is designed by retro tech and design, especially from the 90s and 00s. Early digital music libraries like Grooveshark, iTunes, Napster, Limeware, etc. Classic Mac OS GUI's, Windows 95, iPods, portable CD Players, digital radio UI, etc.

But Jamzy also embraces modern tech and best practices, and aims for a fast, accessible, lightweight feel in both its UI and technical architecture. 

So Jamzy's retro UI is partnered with a futuristic cyberpunk style. This is highlighted by a neon color palette that evokes cyberpunk as well as 90s nostalgia.

#### Implementation Guidelines:
**Visual Elements to Include:**
- Sharp, angular borders (avoid rounded corners except for buttons)
- High contrast color transitions using the neon palette
- Monospace fonts for data-heavy sections (track lists, metadata)
- Grid-based layouts reminiscent of early music software
- Terminal-style input fields with cursor animations

**Modern UX Patterns to Apply:**
- Instant feedback on all interactions (<100ms response)
- Progressive disclosure of complex features
- Mobile-first responsive behavior
- Accessibility-compliant focus indicators (2px neon-cyan outline)

### Info Dense, Visually Engaging
Jamzy is built on top of a rich database, and Jamzy's UI should be relatively data dense. Screen real estate is valuable, and it's important to use screen space wisely in order to maximize the amount of useful info.

But at the same time, its key that the UI is visually pleasing and engaging. It should feature images (where applicable) and not be too text heavy. So it strikes a balance of being infomation dense, without being too overwhelming.

#### Implementation Guidelines:
**Information Density Rules:**
- Maximum 3 hierarchy levels per content block
- Use thumbnails/avatars to break up text (minimum 32px)
- Group related data with subtle borders or background changes
- Prioritize scannable layouts over paragraph text

**Visual Engagement Requirements:**
- Include imagery in 80%+ of content blocks
- Use color coding for different content types
- Apply hover animations to all interactive elements
- Balance white space - minimum 16px between major sections

### (Fun) Details Matter
Details are critical, and every part of the design is though through for both usability and visual style. 

Designs should contain subtle fun, small details (and sometimes even Easter eggs) that aim to delight the user.

#### Implementation Guidelines:
**Required Polish Elements:**
- Subtle glow effects on hover (2-4px blur radius)
- Custom loading animations (no generic spinners)
- Micro-animations for state changes (200-300ms duration)
- Personality in empty states and error messages
- Sound-reactive visual elements where appropriate 

## ⚡ Quick Reference for AI Agents

### Essential Variables
```css
/* Colors (copy-paste ready) */
--neon-blue: #3b00fd; --neon-green: #00f92a; --neon-cyan: #04caf4;
--neon-pink: #f906d6; --neon-orange: #ff9b00; --neon-yellow: #d1f60a;
--dark-bg: #1a1a1a; --darker-bg: #0f0f0f; --light-text: #ffffff; --muted-text: #cccccc;

/* Spacing (8px base) */
--space-1: 4px; --space-2: 8px; --space-4: 16px; --space-6: 24px; --space-8: 32px; --space-12: 48px;

/* Typography */
--text-2xl: 32px; --text-xl: 24px; --text-lg: 20px; --text-base: 16px; --text-sm: 14px; --text-xs: 12px;

/* Fonts */
--font-display: 'JetBrains Mono', monospace; --font-interface: -apple-system, sans-serif;
```

### Component Quick Decisions
- **Sequential content** → List View (56px rows, 48px thumbnails)
- **Visual content** → Grid View (1:1 aspect ratio, 44px targets)  
- **Social posts** → Card Layout (640px max width, user header)
- **Data tables** → Table Layout (sticky headers, alternating rows)

### State Quick Guide
- **Hover** → 8px glow + translateY(-1px)
- **Focus** → 2px neon-cyan outline
- **Loading** → Animated neon-blue gradient
- **Error** → neon-yellow border + 10% background
- **Success** → neon-green glow pulse (500ms)

## 🎯 Visual Identity

### Neon 90s Color Palette

```css
/* Primary Brand Colors */
--neon-blue: #3b00fd    /* Deep Blue/Violet - Primary brand, main CTAs */
--neon-green: #00f92a   /* Bright Green - Success states, play buttons */
--neon-cyan: #04caf4    /* Bright Cyan - Links, info, interactive elements */
--neon-pink: #f906d6    /* Bright Pink - Special emphasis, accents */
--neon-orange: #ff9b00  /* Orange - Text highlights, active states */
--neon-yellow: #d1f60a  /* Yellow - Warnings and alerts ONLY */

/* Supporting Colors */
--dark-bg: #1a1a1a      /* Primary background */
--darker-bg: #0f0f0f    /* Deeper background areas */
--light-text: #ffffff   /* Primary text */
--muted-text: #cccccc   /* Secondary text */
```

### Color Usage Guidelines

- **Primary Actions**: Neon blue gradients for main CTAs and branding
- **Success & Play States**: Neon green for confirmations, play buttons, positive feedback
- **Interactive Elements**: Neon cyan for links, hover states, navigation
- **Special Emphasis**: Neon pink sparingly for unique features, special callouts
- **Text Highlights**: Neon orange for readable emphasis, active states, current selections
- **Warnings Only**: Neon yellow exclusively for errors, warnings, urgent alerts

## ⚡ Animation & Interaction

### Animation System (anime.js v3.2.1)
The app uses **anime.js v3.2.1** for smooth, hardware-accelerated animations. All animation utilities are centralized in `src/utils/animations.ts`.

**Version Requirements**:
- **Use v3.2.1**: Stable version with reliable module imports
- **Avoid v4.x**: Has module export issues in our build setup
- **Installation**: `bun add animejs@3.2.1`

### Core Animation Patterns

**Player Controls**: Gradient hover effects with icon color changes
```typescript
// Player buttons get gradient backgrounds + white icons on hover
playbackButtonHover.enter(buttonElement);
```

**Track Interactions**:
- Hover scale effects with proper container padding
- Current track gets neon blue border with multi-layer glow
- Particle burst effects on play button clicks
- Magnetic effects on thumbnails

**Content Animations**: Individual element animations, hover effects, interactive feedback
- ❌ **AVOID**: Page-level fade-ins or entrance animations (makes app feel slow)
- ✅ **PREFER**: Content-specific animations that enhance interaction

### Animation Architecture
- **Centralized utilities**: All animations in `src/utils/animations.ts`
- **Ref-based**: Uses SolidJS refs for direct DOM manipulation
- **Hardware acceleration**: `transform: translateZ(0)` for smooth performance
- **CSS transition override**: `transition: 'none'` to prevent conflicts

### Implementation Patterns
```typescript
// Always disable CSS transitions for anime.js elements
element.style.transition = 'none';

// Reset transforms after animations complete
complete: () => {
  element.style.transform = 'translateZ(0)';
}

// Proper cleanup in leave animations
leave: (element) => {
  element.style.background = '';
  element.style.color = '';
}
```

### Critical Layout Considerations
- **Container padding**: Track containers need `px-2` for hover scale effects
- **Border visibility**: Current track uses `border-4` + multi-layer shadows
- **Stagger conflicts**: Don't mix individual item animations with container staggered animations

### Interaction Feedback
- **Click Response**: Immediate visual confirmation with particle bursts
- **Loading States**: Animated indicators with personality
- **Success Feedback**: Green glow pulse for completed actions
- **Error Handling**: Clear messaging with recovery suggestions

## 🔤 Typography

### Font Implementation
```css
/* Font Stacks */
--font-display: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Courier New', monospace;
--font-interface: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', system-ui, sans-serif;
--font-monospace: 'Fira Code', 'JetBrains Mono', 'SF Mono', monospace;
--font-social: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Size Scale (8px base unit)
```css
/* Typography Scale */
--text-2xl: 32px;    /* 2rem - Page headers, hero text */
--text-xl: 24px;     /* 1.5rem - Section headers */
--text-lg: 20px;     /* 1.25rem - Subsection headers */
--text-base: 16px;   /* 1rem - Body text, buttons */
--text-sm: 14px;     /* 0.875rem - Labels, captions */
--text-xs: 12px;     /* 0.75rem - Metadata, timestamps */
--text-2xs: 10px;    /* 0.625rem - Fine print only */
```

### Font Usage Guidelines
- **Display (--font-display)**: Page titles, brand elements, data tables
- **Interface (--font-interface)**: Navigation, buttons, form labels
- **Monospace (--font-monospace)**: Code blocks, terminal UI, precise data
- **Social (--font-social)**: Comments, usernames, conversation text

### Text Treatment Implementation
- **Neon Accents**: `text-shadow: 0 0 8px currentColor` on hover
- **Readable Contrast**: Minimum 4.5:1 ratio (use `--light-text` on dark backgrounds)
- **Interactive Cues**: Underline on hover for links, color change for buttons
- **Hierarchy Enforcement**: Use size scale consistently, avoid custom sizes

## 📐 Layout Principles

### Spacing System (8px base unit)
```css
/* Spacing Scale */
--space-px: 1px;     /* Borders, dividers */
--space-0: 0px;      /* Reset spacing */
--space-1: 4px;      /* 0.25rem - Icon spacing, tight gaps */
--space-2: 8px;      /* 0.5rem - Element padding, small gaps */
--space-3: 12px;     /* 0.75rem - Form element spacing */
--space-4: 16px;     /* 1rem - Component spacing */
--space-5: 20px;     /* 1.25rem - Medium gaps */
--space-6: 24px;     /* 1.5rem - Section gaps */
--space-8: 32px;     /* 2rem - Major breaks */
--space-10: 40px;    /* 2.5rem - Large sections */
--space-12: 48px;    /* 3rem - Page sections */
--space-16: 64px;    /* 4rem - Major page breaks */
```

### Container System
```css
/* Container Widths */
--container-sm: 640px;   /* Mobile landscape */
--container-md: 768px;   /* Tablet */
--container-lg: 1024px;  /* Desktop */
--container-xl: 1280px;  /* Large desktop */
--container-2xl: 1536px; /* Ultra-wide */

/* Content Zones */
--sidebar-width: 280px;  /* Navigation sidebar */
--player-height: 80px;   /* Bottom player bar */
--header-height: 64px;   /* Top navigation */
```

### Grid & Spacing Implementation
- **8px Base Unit**: All spacing must be multiples of 8px (use spacing scale variables)
- **Content Zones**: Use CSS Grid with named areas for major layout sections
- **Responsive Scaling**: Mobile-first breakpoints at 640px, 768px, 1024px, 1280px
- **Thread Nesting**: 24px left indent per conversation level (max 3 levels)

### Information Architecture Requirements
- **Discovery First**: Feed takes 60% of main content width on desktop
- **Player Persistent**: Fixed bottom position, 80px height, full width
- **Social Context**: User avatar + name visible in all social content blocks
- **AI Assistant**: Slide-in panel, 320px width, right-aligned

## 🎯 Component Selection Guide

### Layout Pattern Decision Tree

**For Sequential Content (tracks, playlists, comments):**
- Use **List View** with consistent row height (56px minimum)
- Include thumbnail (48x48px), title, subtitle, actions
- Apply hover effects with `--space-2` padding for scale room

**For Visual Content (albums, artists, users):**
- Use **Grid View** with aspect ratios (1:1 for albums, 3:4 for artists)
- Minimum touch target 44px, grid gap `--space-4`
- Include overlay text with gradient background for readability

**For Mixed Content (social posts, activity feed):**
- Use **Card Layout** with `--space-4` padding, subtle border
- Header (user info) + content + actions structure
- Maximum width 640px for readability

**For Data Comparison (library management, stats):**
- Use **Table Layout** with sticky headers
- Alternating row colors using `--darker-bg`
- Sortable columns with arrow indicators

### Button Hierarchy Implementation
```css
/* Primary Actions (Play, Save, Share) */
.btn-primary {
  background: var(--neon-blue);
  color: var(--light-text);
  padding: var(--space-2) var(--space-4);
  border-radius: 4px;
}

/* Secondary Actions (Like, Comment) */
.btn-secondary {
  background: transparent;
  color: var(--neon-cyan);
  border: 1px solid var(--neon-cyan);
  padding: var(--space-2) var(--space-4);
}

/* Tertiary Actions (Edit, Delete) */
.btn-tertiary {
  background: transparent;
  color: var(--muted-text);
  padding: var(--space-1) var(--space-2);
}
```

## 🎛️ State Visualization Guide

### Interactive States Implementation
```css
/* Default State */
.interactive {
  transition: all 200ms ease;
  cursor: pointer;
}

/* Hover State */
.interactive:hover {
  box-shadow: 0 0 8px rgba(59, 0, 253, 0.3); /* neon-blue glow */
  transform: translateY(-1px);
}

/* Active/Pressed State */
.interactive:active {
  transform: translateY(0);
  filter: brightness(0.9);
}

/* Focus State (keyboard navigation) */
.interactive:focus {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 2px;
  box-shadow: 0 0 4px var(--neon-cyan);
}

/* Disabled State */
.interactive:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

### Content States
**Loading State:**
```css
.loading {
  background: linear-gradient(90deg, transparent, var(--neon-blue), transparent);
  background-size: 200% 100%;
  animation: pulse-loading 1.5s infinite;
}

@keyframes pulse-loading {
  0%, 100% { background-position: 200% 0; }
  50% { background-position: -200% 0; }
}
```

**Empty State:**
- Use muted text with helpful suggestions
- Include relevant icon (48px minimum)
- Provide clear next action with primary button

**Error State:**
```css
.error {
  border: 1px solid var(--neon-yellow);
  background: rgba(209, 246, 10, 0.1);
  padding: var(--space-4);
  border-radius: 4px;
}
```

**Success State:**
```css
.success {
  animation: success-glow 500ms ease-out;
}

@keyframes success-glow {
  0% { box-shadow: 0 0 0 rgba(0, 249, 42, 0.6); }
  50% { box-shadow: 0 0 20px rgba(0, 249, 42, 0.6); }
  100% { box-shadow: 0 0 0 rgba(0, 249, 42, 0); }
}
```

## 📋 Information Hierarchy Templates

### Music Track Display Template
```html
<div class="track-item">
  <img class="track-thumbnail" /> <!-- 48x48px -->
  <div class="track-info">
    <h3 class="track-title">{{ title }}</h3>     <!-- text-base, light-text -->
    <p class="track-artist">{{ artist }}</p>     <!-- text-sm, neon-cyan, clickable -->
    <span class="track-meta">{{ album }} • {{ duration }}</span> <!-- text-xs, muted-text -->
  </div>
  <div class="track-actions">
    <!-- Play, add, share buttons -->
  </div>
</div>
```

### Social Content Display Template
```html
<div class="social-item">
  <header class="social-header">
    <img class="user-avatar" />                  <!-- 32x32px -->
    <span class="username">{{ username }}</span> <!-- text-sm, neon-orange, clickable -->
    <time class="timestamp">{{ time }}</time>    <!-- text-xs, muted-text -->
  </header>
  <main class="social-content">
    <p class="user-action">{{ action }}</p>      <!-- text-base, light-text -->
    <div class="referenced-track">              <!-- Indented 24px -->
      <!-- Track template here -->
    </div>
  </main>
</div>
```

### Form Layout Template
```html
<form class="form-layout">
  <div class="form-group">                      <!-- margin-bottom: space-4 -->
    <label class="form-label">{{ label }}</label> <!-- text-sm, light-text -->
    <input class="form-input" />                <!-- padding: space-2, border: neon-cyan -->
    <span class="form-help">{{ helpText }}</span> <!-- text-xs, muted-text -->
  </div>
</form>
```

## ✨ Special Effects & Polish

### Neon Glow System Implementation
```css
/* Social Interaction Glows */
.social-like:hover { box-shadow: 0 0 12px rgba(0, 249, 42, 0.4); }
.social-comment:hover { box-shadow: 0 0 12px rgba(4, 202, 244, 0.4); }
.social-share:hover { box-shadow: 0 0 12px rgba(249, 6, 214, 0.4); }

/* Achievement Glows (intense) */
.achievement {
  animation: achievement-glow 2s ease-in-out infinite alternate;
}

@keyframes achievement-glow {
  from { box-shadow: 0 0 20px var(--neon-pink); }
  to { box-shadow: 0 0 40px var(--neon-pink); }
}
```

### Retro Polish Implementation
- **CRT Effects**: `background-image: repeating-linear-gradient(0deg, transparent, rgba(0,0,0,0.03) 2px)`
- **Pixel Accents**: `border-style: dotted` for vintage borders
- **Terminal Styling**: Use `--font-monospace` with blinking cursor animation

## 📱 Responsive Considerations

### Mobile-First Social
- **Touch Targets**: Minimum 44px for all interactive elements
- **Swipe Gestures**: Navigate between collections and threads
- **Simplified Chrome**: Focus on content over decoration
- **Quick Actions**: Thumb-accessible sharing and reactions

### Desktop Enhancements
- **Multi-Panel Views**: Side-by-side discovery and player
- **Keyboard Navigation**: Full keyboard support for power users
- **Rich Previews**: Hover cards with song details
- **Drag & Drop**: Reorder collections and build playlists

## ✅ Pre-Implementation Checklist

### Before You Start
- [ ] Read Quick Reference section for essential variables
- [ ] Identify content type (sequential, visual, social, data)
- [ ] Choose appropriate layout pattern from Component Selection Guide
- [ ] Confirm color usage follows neon palette guidelines

### During Implementation
- [ ] Use spacing scale variables (never custom pixel values)
- [ ] Apply proper typography scale (--text-* variables)
- [ ] Include all interactive states (hover, focus, active, disabled)
- [ ] Add loading and error states for dynamic content
- [ ] Test with keyboard navigation

### After Implementation
- [ ] Verify 60fps animations (use browser dev tools)
- [ ] Check color contrast meets 4.5:1 ratio minimum
- [ ] Test responsive behavior at 640px, 768px, 1024px breakpoints
- [ ] Validate semantic HTML and ARIA labels
- [ ] Confirm focus indicators are visible and distinctive

### Performance Requirements
- **Animations**: Hardware accelerated (`transform`, `opacity` only)
- **Images**: WebP format with responsive sizes
- **Interactions**: <100ms response time for all user actions
- **Loading**: Progressive content loading, skeleton states

### Accessibility Requirements
- **Keyboard Navigation**: Tab order logical, no mouse-only functions
- **Screen Readers**: Meaningful `alt` text, `aria-label` where needed
- **Color Contrast**: 4.5:1 minimum, 7:1 preferred for small text
- **Focus States**: 2px neon-cyan outline, never `outline: none`

### Common Mistakes to Avoid
- ❌ Custom spacing values (use `--space-*` variables)
- ❌ Rounded corners (conflicts with retro aesthetic)
- ❌ Generic loading spinners (create custom animations)
- ❌ Yellow for non-warning content (reserved for alerts)
- ❌ Mixing animation libraries (stick to anime.js v3.2.1)
- ❌ Missing hover states on interactive elements

---

*These guidelines focus on Jamzy's unique identity as a social music discovery platform where every song starts a conversation and sharing builds your library. When implementing new features, prioritize human connection, conversation threading, and AI that enhances rather than replaces human creativity.*