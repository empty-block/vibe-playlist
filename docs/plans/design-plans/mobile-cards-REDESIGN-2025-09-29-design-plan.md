# Mobile Cards Complete Redesign - TASK-559

**Date:** 2025-09-29
**Task:** TASK-559 - Mobile Cards COMPLETE REDESIGN
**Branch:** mobile-cards-TASK-559
**Design Objective:** Create modern, polished, premium mobile card experience that actually looks good

---

## Executive Summary

The current mobile card implementation has fundamental UX and visual problems that make them feel cluttered, cramped, and unpolished on mobile devices. This redesign throws out the old approach and builds a fresh, modern card system from first principles.

### Core Problems with Current Design

1. **Visual Clutter**: Too many elements competing for attention simultaneously
2. **Poor Spacing**: Elements crammed together, no breathing room
3. **Weak Imagery**: Thumbnails don't dominate, platform badges obstruct images
4. **Generic Feel**: Cards look like basic Bootstrap/Material components
5. **Information Overload**: Trying to show everything at once
6. **Inconsistent Hierarchy**: Eye doesn't know where to look first

### New Design Philosophy

**SIMPLICITY FIRST**: If it doesn't serve an immediate purpose, remove it.

**IMAGERY DOMINANT**: Music is visual. The album art should be the hero, not an afterthought.

**GENEROUS SPACING**: White space is a design element, not wasted space.

**BOLD TYPOGRAPHY**: Make text readable and beautiful with confident sizing.

**PROGRESSIVE DISCLOSURE**: Show essentials first, reveal details on interaction.

---

## The New Mobile Card System

### Design Principles

1. **The 70-30 Rule**: 70% of card space for imagery, 30% for metadata
2. **One Thing at a Time**: Each section has one clear purpose
3. **Touch-First Everything**: Design for thumbs, not mice
4. **Neon with Purpose**: Use cyberpunk colors to guide attention, not decorate
5. **Motion Matters**: Every animation serves feedback or delight

---

## Redesigned Card Variants

### Variant 1: "Hero Card" (Feed/Discovery)

**Purpose**: Primary discovery card for home feed, social context, new tracks

**Visual Concept**: Large album art with clean overlay text, bold and modern

#### Layout Structure

```
┌─────────────────────────────────────┐
│                                     │
│         [LARGE ALBUM ART]           │
│              180x180                │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ [🟢] Track Title             │  │ ← Overlay gradient
│  │      Artist Name              │  │
│  │      @username • 2h           │  │
│  └──────────────────────────────┘  │
│                                     │
│  💬 12  ❤️ 45        [▶️]          │
└─────────────────────────────────────┘
    Card width: 100% (with 16px margin)
    Total height: ~280px
```

#### Exact Specifications

**Card Container**:
```css
width: calc(100vw - 32px);  /* 16px margin each side */
max-width: 400px;           /* Cap at 400px */
min-height: 280px;
border-radius: 12px;        /* More modern than 8px */
background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
border: 1px solid transparent;
position: relative;
overflow: hidden;
```

**Album Art Section**:
```css
width: 100%;
height: 180px;              /* Square-ish but not perfect square */
position: relative;
overflow: hidden;
```

**Album Image**:
```css
width: 100%;
height: 100%;
object-fit: cover;
filter: brightness(0.9) contrast(1.1);  /* Punchier colors */
```

**Bottom Gradient Overlay**:
```css
position: absolute;
bottom: 0;
left: 0;
right: 0;
height: 120px;              /* Tall gradient for readability */
background: linear-gradient(
  to top,
  rgba(0, 0, 0, 0.95) 0%,
  rgba(0, 0, 0, 0.8) 40%,
  transparent 100%
);
```

**Platform Badge** (NEW POSITION):
```css
position: absolute;
top: 8px;
right: 8px;
width: 24px;                /* Icon only, no text */
height: 24px;
border-radius: 6px;
background: rgba(0, 0, 0, 0.7);
backdrop-filter: blur(8px);
border: 1px solid rgba(255, 255, 255, 0.2);
display: flex;
align-items: center;
justify-content: center;
font-size: 14px;
```

**Text Overlay Section**:
```css
position: absolute;
bottom: 0;
left: 0;
right: 0;
padding: 16px;
z-index: 2;
```

**Track Title**:
```css
font-size: 18px;            /* MUCH larger */
font-weight: 700;
line-height: 1.2;
color: #ffffff;
margin-bottom: 4px;
text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);  /* Crisp readability */
max-height: 44px;           /* 2 lines max */
overflow: hidden;
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
```

**Artist Name**:
```css
font-size: 14px;
font-weight: 500;
color: #04caf4;             /* Cyan for clickability */
margin-bottom: 6px;
text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
```

**User Context Line**:
```css
font-size: 12px;
font-family: 'Courier New', monospace;
color: rgba(255, 255, 255, 0.6);
display: flex;
align-items: center;
gap: 8px;
```

**Username**:
```css
color: #e010e0;             /* Magenta per design system */
font-weight: 600;
```

**Action Bar** (Below image):
```css
padding: 12px 16px;
display: flex;
align-items: center;
justify-content: space-between;
background: linear-gradient(to bottom, rgba(0,0,0,0.3), transparent);
```

**Social Stats**:
```css
display: flex;
gap: 16px;                  /* Generous spacing */
align-items: center;
```

**Individual Stat**:
```css
display: flex;
align-items: center;
gap: 6px;
font-size: 14px;
font-weight: 600;
font-family: 'Courier New', monospace;
color: rgba(255, 255, 255, 0.8);
padding: 6px 12px;
border-radius: 20px;        /* Pill shape */
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(4px);
transition: all 150ms ease;
min-width: 60px;            /* Touch target */
min-height: 36px;
```

**Play Button** (NEW DESIGN):
```css
width: 48px;
height: 48px;
border-radius: 24px;        /* Perfect circle */
background: linear-gradient(135deg, #04caf4 0%, #00f92a 100%);
border: none;
box-shadow: 0 4px 12px rgba(4, 202, 244, 0.4);
display: flex;
align-items: center;
justify-content: center;
font-size: 20px;
color: #000000;             /* Black icon on bright background */
transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);  /* Bounce */
```

**Play Button Hover/Press**:
```css
.play-button:active {
  transform: scale(0.92);
  box-shadow: 0 2px 8px rgba(4, 202, 244, 0.6);
}
```

**Card Hover State**:
```css
.hero-card:hover {
  border-color: rgba(4, 202, 244, 0.4);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(4, 202, 244, 0.2);
  transform: translateY(-2px);
}
```

**Current Track State**:
```css
.hero-card--playing {
  border-color: #00f92a;
  box-shadow:
    0 8px 32px rgba(0, 249, 42, 0.3),
    0 0 0 2px rgba(0, 249, 42, 0.3);
}

.hero-card--playing::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg,
    transparent,
    #00f92a,
    #04caf4,
    #00f92a,
    transparent
  );
  background-size: 200% 100%;
  animation: playing-bar 2s linear infinite;
}

@keyframes playing-bar {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

#### Why This Works

1. **Image Dominates**: 180px tall album art is the hero, not buried
2. **Text Readable**: Large, bold typography with proper shadows
3. **Clear Hierarchy**: Image → Title → Artist → Context → Actions
4. **Touch Friendly**: 48px play button, 36px+ social buttons
5. **Modern Polish**: Gradients, shadows, rounded corners feel premium
6. **Neon Purposeful**: Cyan for links, magenta for users, green for playing

---

### Variant 2: "Compact Card" (Grid Browsing)

**Purpose**: Dense grid views for browse sections, genre pages

**Visual Concept**: Square album art with minimal text overlay

#### Layout Structure

```
┌─────────────────┐
│                 │
│   [ALBUM ART]   │
│     140x140     │
│                 │
│  Track Title    │
│  Artist         │
└─────────────────┘
    Width: 156px
    Height: ~200px
```

#### Exact Specifications

**Card Container**:
```css
width: 156px;
height: 200px;
border-radius: 8px;
background: #1a1a1a;
border: 1px solid rgba(255, 255, 255, 0.05);
transition: all 200ms ease;
```

**Album Art**:
```css
width: 100%;
height: 140px;
border-radius: 8px 8px 0 0;
object-fit: cover;
filter: brightness(0.95);
```

**Play Button Overlay** (ONLY ON HOVER):
```css
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
width: 40px;
height: 40px;
border-radius: 20px;
background: rgba(4, 202, 244, 0.95);
backdrop-filter: blur(8px);
border: 2px solid #ffffff;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
opacity: 0;
transition: opacity 200ms ease;
```

**Text Section**:
```css
padding: 8px;
display: flex;
flex-direction: column;
gap: 2px;
```

**Track Title**:
```css
font-size: 13px;
font-weight: 700;
line-height: 1.2;
color: #ffffff;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
```

**Artist Name**:
```css
font-size: 11px;
font-weight: 500;
color: rgba(255, 255, 255, 0.6);
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
```

**Platform Badge** (Top-right corner):
```css
position: absolute;
top: 6px;
right: 6px;
width: 20px;
height: 20px;
border-radius: 4px;
background: rgba(0, 0, 0, 0.8);
backdrop-filter: blur(4px);
font-size: 11px;
```

**Hover State**:
```css
.compact-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  border-color: rgba(4, 202, 244, 0.3);
}

.compact-card:hover .play-overlay {
  opacity: 1;
}
```

---

### Variant 3: "Row Card" (List View)

**Purpose**: Library view, search results, full track listings

**Visual Concept**: Horizontal layout with square thumbnail, optimized for scrolling

#### Layout Structure

```
┌──────────────────────────────────────────────┐
│ [IMG]  Track Title          [🟢] 2h    [▶️] │
│  64px  Artist Name                            │
│        @username                              │
├──────────────────────────────────────────────┤
│ "Great track! Love this vibe..."   💬 2  ❤️ 5│
└──────────────────────────────────────────────┘
     Width: 100%
     Height: ~110px
```

#### Exact Specifications

**Card Container**:
```css
width: 100%;
min-height: 110px;
border-radius: 0;           /* No rounding for stacked rows */
border-bottom: 1px solid rgba(255, 255, 255, 0.05);
padding: 12px 16px;
background: transparent;
transition: background 150ms ease;
display: flex;
flex-direction: column;
gap: 10px;
```

**Top Row** (Main info):
```css
display: flex;
gap: 12px;
align-items: flex-start;
```

**Album Thumbnail**:
```css
width: 64px;
height: 64px;
border-radius: 6px;
object-fit: cover;
flex-shrink: 0;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
```

**Metadata Column**:
```css
flex: 1;
min-width: 0;               /* Allow text truncation */
display: flex;
flex-direction: column;
gap: 4px;
```

**Track Title**:
```css
font-size: 15px;
font-weight: 700;
line-height: 1.3;
color: #ffffff;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
```

**Artist Name**:
```css
font-size: 13px;
font-weight: 500;
color: #04caf4;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
```

**Username**:
```css
font-size: 12px;
font-family: 'Courier New', monospace;
color: #e010e0;
font-weight: 600;
```

**Right Column** (Time, platform, play):
```css
display: flex;
flex-direction: column;
align-items: flex-end;
gap: 6px;
flex-shrink: 0;
```

**Timestamp**:
```css
font-size: 11px;
font-family: 'Courier New', monospace;
color: rgba(255, 255, 255, 0.5);
```

**Platform Badge**:
```css
width: 24px;
height: 24px;
/* Same as compact card */
```

**Play Button** (Small):
```css
width: 36px;
height: 36px;
border-radius: 18px;
background: rgba(4, 202, 244, 0.2);
border: 2px solid #04caf4;
color: #04caf4;
font-size: 14px;
```

**Bottom Row** (Comment & social):
```css
display: flex;
align-items: center;
justify-content: space-between;
gap: 12px;
padding-left: 76px;         /* Align with text above */
```

**Comment Text**:
```css
font-size: 13px;
line-height: 1.4;
color: rgba(255, 255, 255, 0.7);
flex: 1;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
font-style: italic;
```

**Social Actions**:
```css
display: flex;
gap: 12px;
flex-shrink: 0;
```

**Hover State**:
```css
.row-card:hover {
  background: rgba(4, 202, 244, 0.05);
}
```

**Active/Playing State**:
```css
.row-card--playing {
  background: rgba(0, 249, 42, 0.08);
  border-left: 3px solid #00f92a;
  padding-left: 13px;         /* Compensate for border */
}
```

---

## Typography System (Revised)

### Mobile-Optimized Scale

```css
/* Card typography - optimized for mobile readability */
--text-card-title: 18px;        /* Hero card titles */
--text-card-artist: 14px;       /* Artist names */
--text-card-meta: 12px;         /* Usernames, timestamps */
--text-compact-title: 13px;     /* Compact card titles */
--text-compact-artist: 11px;    /* Compact card artists */
--text-row-title: 15px;         /* Row card titles */
--text-row-artist: 13px;        /* Row card artists */
--text-row-comment: 13px;       /* Comments */

/* Weight scale */
--weight-bold: 700;             /* Titles */
--weight-semibold: 600;         /* Usernames, emphasis */
--weight-medium: 500;           /* Artists, secondary info */
--weight-regular: 400;          /* Body text */

/* Line height */
--line-tight: 1.2;              /* Titles */
--line-normal: 1.4;             /* Body text */
--line-relaxed: 1.6;            /* Comments, paragraphs */
```

---

## Color System (Refined for Cards)

### Card-Specific Palette

```css
/* Backgrounds */
--card-bg: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
--card-hover-bg: rgba(4, 202, 244, 0.05);
--card-playing-bg: rgba(0, 249, 42, 0.08);

/* Borders */
--card-border: rgba(255, 255, 255, 0.05);
--card-border-hover: rgba(4, 202, 244, 0.3);
--card-border-playing: #00f92a;

/* Text */
--text-primary: #ffffff;
--text-artist: #04caf4;         /* Clickable cyan */
--text-username: #e010e0;       /* Magenta */
--text-meta: rgba(255, 255, 255, 0.6);
--text-comment: rgba(255, 255, 255, 0.7);

/* Action buttons */
--btn-play-bg: linear-gradient(135deg, #04caf4 0%, #00f92a 100%);
--btn-play-fg: #000000;
--btn-social-bg: rgba(255, 255, 255, 0.1);
--btn-social-fg: rgba(255, 255, 255, 0.8);

/* Overlays */
--overlay-dark: rgba(0, 0, 0, 0.95);
--overlay-medium: rgba(0, 0, 0, 0.7);
--overlay-light: rgba(0, 0, 0, 0.5);

/* Glows */
--glow-cyan: rgba(4, 202, 244, 0.4);
--glow-green: rgba(0, 249, 42, 0.3);
--glow-magenta: rgba(224, 16, 224, 0.3);
```

---

## Spacing System (Card-Specific)

```css
/* Card spacing - more generous for mobile */
--card-padding: 16px;           /* Standard card padding */
--card-padding-compact: 8px;    /* Compact cards */
--card-gap: 16px;               /* Gap between cards in grid */
--card-gap-row: 0;              /* No gap for stacked rows */

/* Internal spacing */
--content-gap-large: 12px;      /* Between major sections */
--content-gap-medium: 8px;      /* Between related elements */
--content-gap-small: 4px;       /* Between tight elements */
--content-gap-tiny: 2px;        /* Minimal spacing */

/* Touch targets */
--touch-min: 44px;              /* iOS minimum */
--touch-comfortable: 48px;      /* Preferred size */
--touch-small: 36px;            /* Acceptable for secondary actions */
```

---

## Animation Specifications

### Card Entrance (Staggered)

```css
@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.card {
  animation: card-enter 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Stagger delays */
.card:nth-child(1) { animation-delay: 0ms; }
.card:nth-child(2) { animation-delay: 60ms; }
.card:nth-child(3) { animation-delay: 120ms; }
.card:nth-child(4) { animation-delay: 180ms; }
.card:nth-child(5) { animation-delay: 240ms; }
/* Stop staggering after 5 */
```

### Play Button Press (Anime.js)

```javascript
anime({
  targets: playButton,
  scale: [1, 0.85, 1.1, 1],
  duration: 400,
  easing: 'easeInOutBack',
  complete: () => {
    // Trigger particle burst
    createParticleBurst(playButton, {
      count: 8,
      colors: ['#04caf4', '#00f92a'],
      distance: 60,
      duration: 600
    });
  }
});
```

### Like Animation (Heartbeat)

```javascript
anime({
  targets: likeButton,
  scale: [1, 1.4, 1],
  rotate: [0, -12, 12, -8, 8, 0],
  duration: 500,
  easing: 'easeInOutQuad'
});
```

### Card Hover Lift

```css
.card {
  transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card:hover {
  transform: translateY(-2px);
}

.compact-card:hover {
  transform: translateY(-4px);  /* More dramatic for grid */
}
```

### Playing State Pulse

```css
@keyframes playing-glow {
  0%, 100% {
    box-shadow:
      0 8px 32px rgba(0, 249, 42, 0.2),
      0 0 0 2px rgba(0, 249, 42, 0.2);
  }
  50% {
    box-shadow:
      0 8px 32px rgba(0, 249, 42, 0.4),
      0 0 0 2px rgba(0, 249, 42, 0.4);
  }
}

.card--playing {
  animation: playing-glow 2s ease-in-out infinite;
}
```

---

## Responsive Breakpoints

### Mobile (375px - 640px)

**Hero Card**:
- Width: `calc(100vw - 32px)`
- Max width: 400px
- Margin: 16px horizontal

**Compact Card**:
- Width: 156px
- Grid: 2 columns with 16px gap

**Row Card**:
- Full width
- Stack naturally

### Tablet (640px - 1024px)

**Hero Card**:
- Width: `calc(50vw - 24px)` (2 columns)
- Max width: 480px

**Compact Card**:
- Width: 180px
- Grid: 3-4 columns

**Row Card**:
- Same as mobile

### Desktop (1024px+)

**Hero Card**:
- Width: `calc(33.33vw - 24px)` (3 columns)
- Max width: 400px

**Compact Card**:
- Width: 200px
- Grid: 4-6 columns

**Row Card**:
- Switch to table layout (existing design)
- Hide row card variant

---

## Implementation Strategy

### Phase 1: Core Components (DO THIS FIRST)

1. **Create new component files** (don't modify existing yet):
   - `HeroTrackCard.tsx`
   - `CompactTrackCard.tsx`
   - `RowTrackCard.tsx`
   - `heroCard.css`
   - `compactCard.css`
   - `rowCard.css`

2. **Build in isolation**:
   - Create a `/dev` page to view all variants
   - Test each variant independently
   - Get user approval before replacing old cards

3. **Implement animations**:
   - Card entrance stagger
   - Play button press
   - Like heartbeat
   - Playing state pulse

### Phase 2: Integration

1. **Replace usage gradually**:
   - Start with home page (NewTracksSection)
   - Then recently played
   - Then library mobile view
   - Keep old components as fallback

2. **Test on real devices**:
   - iPhone SE (smallest)
   - iPhone 14 Pro (standard)
   - iPad (tablet)
   - Verify touch targets

### Phase 3: Polish

1. **Add loading states**:
   - Skeleton loaders for images
   - Shimmer animation
   - Graceful error states

2. **Optimize performance**:
   - Lazy load images
   - Virtualize long lists
   - Debounce animations

3. **Accessibility audit**:
   - ARIA labels
   - Keyboard navigation
   - Screen reader testing
   - Focus indicators

---

## Component Props API

### HeroTrackCard

```typescript
interface HeroTrackCardProps {
  track: {
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    source: 'youtube' | 'spotify' | 'soundcloud' | 'bandcamp';
    addedBy: string;
    timestamp: string;
    likes: number;
    replies: number;
    comment?: string;
  };
  onPlay: (track: Track) => void;
  onLike: (track: Track) => void;
  onReply: (track: Track) => void;
  isPlaying?: boolean;
  showSocialContext?: boolean;  // Show user/timestamp
  showComment?: boolean;
  className?: string;
}
```

### CompactTrackCard

```typescript
interface CompactTrackCardProps {
  track: {
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    source: 'youtube' | 'spotify' | 'soundcloud' | 'bandcamp';
  };
  onPlay: (track: Track) => void;
  isPlaying?: boolean;
  className?: string;
}
```

### RowTrackCard

```typescript
interface RowTrackCardProps {
  track: {
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    source: 'youtube' | 'spotify' | 'soundcloud' | 'bandcamp';
    addedBy: string;
    timestamp: string;
    likes: number;
    replies: number;
    comment?: string;
  };
  onPlay: (track: Track) => void;
  onLike: (track: Track) => void;
  onReply: (track: Track) => void;
  isPlaying?: boolean;
  showComment?: boolean;
  className?: string;
}
```

---

## Why This Redesign Works

### Problem: Visual Clutter
**Solution**: One hero element per card (the image). Everything else supports it.

### Problem: Poor Spacing
**Solution**: Generous 16px padding, 12px gaps, no cramming.

### Problem: Weak Imagery
**Solution**: 180px tall hero images, full-width in card, no obstructions.

### Problem: Generic Feel
**Solution**: Bold gradients, neon glows, confident typography, modern borders.

### Problem: Information Overload
**Solution**: Progressive disclosure - essentials on card, details on interaction.

### Problem: Inconsistent Hierarchy
**Solution**: Clear visual order: Image → Title → Artist → Context → Actions.

---

## Key Differences from Old Design

| Aspect | Old Design | New Design |
|--------|-----------|------------|
| **Image Size** | 80px square | 180px tall (hero) |
| **Title Size** | 14px | 18px (hero), 15px (row) |
| **Spacing** | 8-12px | 16px standard |
| **Play Button** | 40px overlay | 48px gradient circle |
| **Platform Badge** | Obstructs image | Small corner icon |
| **Borders** | 8px radius | 12px radius (more modern) |
| **Hover Effect** | -1px translate | -2px to -4px with shadow |
| **Playing State** | Border color change | Animated gradient bar + glow |
| **Social Buttons** | Inline text | Pill buttons with backdrop |

---

## Visual Examples (Text-Based Mockups)

### Hero Card - Normal State

```
╔═══════════════════════════════════════╗
║                                       ║
║          🎵 ALBUM ARTWORK             ║
║            (large image)              ║
║          ─────────────────            ║
║                                       ║
║  ┌────────────────────────────────┐  ║
║  │ [🟢] Blinding Lights         │  ║ ← Gradient overlay
║  │      The Weeknd               │  ║   (black to transparent)
║  │      @musiclover • 2h         │  ║
║  └────────────────────────────────┘  ║
║                                       ║
║  💬 12  ❤️ 45            [▶️]        ║
╚═══════════════════════════════════════╝
```

### Hero Card - Playing State

```
╔═══════════════════════════════════════╗
║ ▓▓░░▓▓░░▓▓░░▓▓░░▓▓░░▓▓░░▓▓ ← animated ║
║                                       ║
║          🎵 ALBUM ARTWORK             ║
║            (large image)              ║
║          ─────────────────            ║
║            🎵 🎵 🎵  ← pulsing        ║
║  ┌────────────────────────────────┐  ║
║  │ [🟢] Blinding Lights         │  ║ ← Green glow
║  │      The Weeknd               │  ║
║  │      @musiclover • 2h         │  ║
║  └────────────────────────────────┘  ║
║                                       ║
║  💬 12  ❤️ 45            [⏸️]        ║
╚═══════════════════════════════════════╝
```

### Compact Card - Grid View

```
┌─────────────────┐  ┌─────────────────┐
│                 │  │                 │
│   [IMG] [🟢]   │  │   [IMG] [🔵]   │
│     140x140     │  │     140x140     │
│                 │  │                 │
│  Track Title    │  │  Another Track  │
│  Artist Name    │  │  Other Artist   │
└─────────────────┘  └─────────────────┘
```

### Row Card - List View

```
╔══════════════════════════════════════════════╗
║ [IMG]  Blinding Lights        [🟢] 2h  [▶️] ║
║  64px  The Weeknd                            ║
║        @musiclover                           ║
╟──────────────────────────────────────────────╢
║ "This song never gets old!"      💬 2  ❤️ 5 ║
╚══════════════════════════════════════════════╝
```

---

## CSS Variable Reference

```css
/* Hero Card */
:root {
  --hero-width: min(calc(100vw - 32px), 400px);
  --hero-height: 280px;
  --hero-image-height: 180px;
  --hero-title: 18px;
  --hero-artist: 14px;
  --hero-meta: 12px;
  --hero-play-size: 48px;
  --hero-border-radius: 12px;
  --hero-padding: 16px;
}

/* Compact Card */
:root {
  --compact-width: 156px;
  --compact-height: 200px;
  --compact-image-height: 140px;
  --compact-title: 13px;
  --compact-artist: 11px;
  --compact-play-size: 40px;
  --compact-border-radius: 8px;
  --compact-padding: 8px;
}

/* Row Card */
:root {
  --row-height: 110px;
  --row-image-size: 64px;
  --row-title: 15px;
  --row-artist: 13px;
  --row-meta: 12px;
  --row-comment: 13px;
  --row-play-size: 36px;
  --row-padding: 12px 16px;
}

/* Colors */
:root {
  --card-bg-gradient: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
  --card-overlay: linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%);
  --card-border: rgba(255, 255, 255, 0.05);
  --card-border-hover: rgba(4, 202, 244, 0.3);
  --card-border-playing: #00f92a;

  --text-title: #ffffff;
  --text-artist: #04caf4;
  --text-username: #e010e0;
  --text-meta: rgba(255, 255, 255, 0.6);

  --btn-play-gradient: linear-gradient(135deg, #04caf4 0%, #00f92a 100%);
  --btn-social-bg: rgba(255, 255, 255, 0.1);
}

/* Spacing */
:root {
  --gap-large: 16px;
  --gap-medium: 12px;
  --gap-small: 8px;
  --gap-tiny: 4px;
}

/* Shadows */
:root {
  --shadow-card: 0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-card-hover: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-playing: 0 8px 32px rgba(0, 249, 42, 0.3);
  --shadow-image: 0 2px 8px rgba(0, 0, 0, 0.3);
}
```

---

## Migration Checklist

### Before Starting

- [ ] Get user approval on text-based mockups above
- [ ] Create `/dev/cards` test page for isolated development
- [ ] Set up side-by-side comparison with old design
- [ ] Take screenshots of current implementation for reference

### Development

- [ ] Create new component files (don't modify existing)
- [ ] Implement HeroTrackCard component
- [ ] Implement CompactTrackCard component
- [ ] Implement RowTrackCard component
- [ ] Add all CSS animations
- [ ] Test on real mobile devices (iPhone, Android)
- [ ] Verify touch targets (44px minimum)
- [ ] Add loading/error states
- [ ] Implement accessibility features

### Integration

- [ ] Replace home page cards
- [ ] Replace library mobile view
- [ ] Replace browse sections
- [ ] Remove old BaseTrackCard (after all replaced)
- [ ] Update all imports
- [ ] Clean up unused CSS

### Testing

- [ ] Visual regression testing
- [ ] Performance testing (FPS, load time)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Cross-browser testing
- [ ] Real device testing (iOS, Android)
- [ ] User acceptance testing

---

## Success Metrics

### Visual Quality
- Cards look modern and premium
- Clear visual hierarchy
- Images are prominent
- Typography is bold and readable

### Usability
- Touch targets ≥ 44px
- Easy to scan quickly
- Clear action buttons
- Smooth animations

### Performance
- 60 FPS animations
- Images load quickly
- No jank on scroll
- Smooth transitions

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigable
- Screen reader friendly
- High contrast support

---

## File Structure

```
frontend/src/components/common/TrackCard/
  ├── NEW/
  │   ├── HeroTrackCard.tsx
  │   ├── CompactTrackCard.tsx
  │   ├── RowTrackCard.tsx
  │   ├── heroCard.css
  │   ├── compactCard.css
  │   ├── rowCard.css
  │   └── index.ts
  ├── OLD/ (move old files here temporarily)
  │   ├── BaseTrackCard.tsx
  │   ├── TrackCardVariants.tsx
  │   └── ...
  └── shared/
      ├── PlatformBadge.tsx (keep this)
      ├── SocialActions.tsx (refactor this)
      └── PlayButton.tsx (new component)
```

---

## Conclusion

This redesign completely rethinks mobile cards from first principles:

1. **Imagery First**: Album art is the hero, not a thumbnail
2. **Bold Typography**: 18px titles, readable from arm's length
3. **Generous Spacing**: 16px padding, no cramming
4. **Modern Polish**: Gradients, glows, smooth animations
5. **Touch Optimized**: 48px play buttons, 36px+ social actions
6. **Clear Hierarchy**: Image → Title → Artist → Context → Actions

The result is a card system that feels premium, modern, and truly mobile-first. Each card variant serves a specific purpose with appropriate information density. The design honors Jamzy's retro-cyberpunk aesthetic while feeling contemporary and polished.

**This is a complete break from the old design. Build the new components in isolation, test thoroughly, then replace the old system entirely.**

---

**Design Plan:** `/Users/nmadd/Dropbox/code/vibes/mobile-cards-TASK-559/context/plans/design-plans/mobile-cards-REDESIGN-2025-09-29-design-plan.md`

**Next Steps:**
1. Review this plan with user
2. Get approval on visual direction
3. Build HeroTrackCard first (most important)
4. Test on real devices
5. Iterate based on feedback
6. Roll out gradually

**Designer:** Claude (Zen Master Designer)
**Date:** 2025-09-29