# Jamzy Design Guidelines

## 🎨 Design Philosophy
Jamzy is a social music discovery app that is inspired by retro design, combined with a futuristic cyberpunk look.

### Core Design Principles
## Retro Inspired, Modern Tech
Jamzy is designed by retro tech and design, especially from the 90s and 00s. Retro computer UIs, digital radio interfaces, CDs, portable CD players, iPods, early music software like iTunes, Grooveshark, Limewire, etc.

But Jamzy also embraces modern tech and best practices, and aims for a fast, accessible, lightweight feel in both its UI and technical architecture. 

This leads to a futuristic, fast, cyberpunk inspired interface, with retro nods and touches. 

## Info Dense, Visually Engaging
Jamzy is built on top of a rich database, and Jamzy's UI should be relatively data dense. Screen real estate is valuable, and it's important to use screen space wisely in order to maximize the amount of useful info.

But at the same time, its key that the UI is visually pleasing and engaging. It should feature images (where applicable) and not be too text heavy. So it strikes a balance of being infomation dense, without being too overwhelming.

## (Fun) Details Matter
Details are critical, and every part of the design is though through for both usability and visual style. 

Designs should contain subtle fun, small details (and sometimes even Easter eggs) that aim to delight the user. 

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

**Page Transitions**: Staggered fade-ins, page entrance animations, floating elements

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

### Font Hierarchy
- **Display**: Retro digital fonts for headers and branding
- **Interface**: Clean, readable system fonts for UI text
- **Monospace**: Terminal-style fonts for AI interactions
- **Social Text**: Optimized for conversation readability

### Text Treatment
- **Neon Accents**: Selective use of color with glow effects
- **Readable Contrast**: WCAG AA compliance minimum
- **Clear Hierarchy**: Distinct sizes for navigation levels
- **Interactive Cues**: Hover states for clickable text

## 📐 Layout Principles

### Grid & Spacing
- **8px Base Unit**: Consistent spacing multiples
- **Content Zones**: Clear separation between social and player areas
- **Responsive Scaling**: Mobile-first with desktop enhancement
- **Thread Nesting**: Visual indent system for conversation depth

### Information Architecture
- **Discovery First**: Feed and collections prominent
- **Player Persistent**: Always accessible transport controls
- **Social Context**: User attribution visible at all times
- **AI Assistant**: Accessible but not intrusive

## ✨ Special Effects & Polish

### Neon Glow System
- Apply glows purposefully to highlight social interactions
- Use color-coded glows for different interaction types
- Animate glow intensity for state changes
- Reserve intense glows for special achievements

### Retro Polish
- **CRT Effects**: Subtle scan lines for nostalgic feel
- **Pixel Accents**: Dotted borders and pixelated icons
- **Terminal Styling**: Monospace fonts and cursor blinks for AI

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

## 🎯 Quality Standards

### Performance
- **60fps Animations**: Hardware acceleration required
- **Lazy Loading**: Progressive content loading
- **Optimized Images**: Responsive artwork delivery
- **Minimal Reflows**: Batch DOM updates

### Accessibility
- **Keyboard Navigation**: Full functionality without mouse
- **Screen Readers**: Semantic HTML and ARIA labels
- **Color Contrast**: WCAG AA minimum compliance
- **Focus Indicators**: Clear visual focus states

---

*These guidelines focus on Jamzy's unique identity as a social music discovery platform where every song starts a conversation and sharing builds your library. When implementing new features, prioritize human connection, conversation threading, and AI that enhances rather than replaces human creativity.*