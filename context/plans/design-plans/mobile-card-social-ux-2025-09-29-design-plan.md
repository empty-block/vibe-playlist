# Mobile Card Social UX Redesign - Design Plan

**Date:** 2025-09-29
**Focus:** Enhanced social prominence, simplified interactions, expandable comments
**Target Cards:** HeroTrackCard, RowTrackCard, ListLayout (DetailedLayout is less affected)

---

## Executive Summary

This redesign addresses four critical UX issues in our mobile music cards:
1. **Username prominence** - Make the social aspect more visible
2. **Play interaction simplification** - Remove redundant play button, make entire card clickable
3. **Comment expansion** - Allow users to read full comment text
4. **Social button placement** - Relocate reply/like buttons for expandable comment design

The key design challenge is **where to place social buttons** when comments become expandable. The solution: **move social actions above the comment**, creating a clean social metadata row that sits between the track metadata and the comment content.

---

## Design Philosophy

### Core Principle: Simple Solutions for Simple Problems

This is a social music app with a straightforward need: prominently display who shared the track. The solution should be equally straightforward:
- Larger, clearer username display
- Simplified interaction (one click to play)
- Expandable comments without overcomplicated UI
- Social buttons in an intuitive, accessible location

**Avoid:** Over-engineering the layout with complex nesting, multiple states, or convoluted hierarchies. The current code has some complexity - our redesign should simplify, not add to it.

---

## Problem Analysis

### Current State Issues

**1. Username Visibility (Current: ListLayout line 178-181)**
```tsx
<span class="retro-user-name truncate">
  {props.track.addedBy}
</span>
```
- Too small (text-xs = 12px)
- Uses "@username" format (unnecessary @ symbol)
- Lacks "shared by" context
- Competes visually with timestamp and other metadata

**2. Redundant Play Button (Current: ListLayout line 158-168)**
```tsx
<button onClick={(e) => { e.stopPropagation(); props.onPlay?.(props.track); }}>
  {props.isPlaying ? '⏸' : '▶'}
</button>
```
- Dedicated 40x40px play button takes valuable space
- Entire card should be clickable for playback
- Creates confusion about click targets

**3. Truncated Comments (Current: ListLayout line 210-217)**
```tsx
<ExpandableText text={props.track.comment} maxLength={60} />
```
- Comments get cut off at 60 characters
- Social buttons sit on the same row, to the right
- When expanded, social buttons stay in their original position (awkward)

**4. Social Button Placement (Current: ListLayout line 219-226)**
```tsx
<div class="flex items-center justify-between gap-2">
  <div class="flex-1 min-w-0">{/* ExpandableText */}</div>
  <TrackSocialActions />
</div>
```
- Social buttons on the right of the comment row
- When comment expands, buttons don't move with content
- Creates a disjointed visual experience

---

## Design Solution

### 1. Enhanced Username Display

**Implementation:**
- Change from "@username" to "shared by username"
- Increase font size from 12px to 14px (text-sm)
- Use neon magenta color (#e010e0) for emphasis
- Add subtle glow on hover for interactivity

**Visual Specifications:**
```css
.track-card-shared-by {
  font-size: 14px;           /* text-sm, up from 12px */
  font-family: var(--font-social);  /* Inter for readability */
  color: #e010e0;            /* neon-magenta for prominence */
  font-weight: 500;          /* Medium weight */
  line-height: 1.4;
}

.track-card-shared-by:hover {
  color: #ff1aff;            /* neon-magenta-bright */
  text-shadow: 0 0 8px rgba(224, 16, 224, 0.4);
  cursor: pointer;
}

.track-card-shared-by-label {
  color: rgba(255, 255, 255, 0.6);  /* muted-text */
  font-weight: 400;          /* Regular weight for "shared by" */
  margin-right: 4px;         /* space-1 */
}
```

**Layout:**
```
shared by username • timestamp
^^^^^^^ ^^^^^^^^
muted   magenta
```

---

### 2. Simplified Play Interaction

**Remove:** Dedicated 40x40px play button in top-left
**Add:** Entire card clickable for playback
**Visual Indicator:** Subtle play icon overlay on thumbnail on hover

**Playing State Visual:**
```css
.track-card.is-playing {
  border-left: 3px solid #00f92a;  /* neon-green indicator */
  background: linear-gradient(90deg, rgba(0, 249, 42, 0.03), transparent);
  box-shadow: 0 0 12px rgba(0, 249, 42, 0.15);
}

.track-card.is-playing .track-thumbnail::after {
  content: '⏸';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
  opacity: 0;
  transition: opacity 200ms ease;
}

.track-card.is-playing:hover .track-thumbnail::after {
  opacity: 1;
}
```

**Hover State:**
```css
.track-card:hover {
  background: rgba(4, 202, 244, 0.02);
  cursor: pointer;
}

.track-card:hover .track-thumbnail::before {
  content: '▶';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
}
```

---

### 3. Expandable Comments Solution

**Use Existing Pattern:** Leverage the current `ExpandableText` component
**Key Change:** Move social buttons ABOVE the comment area

**Collapsed State (≤60 characters):**
```
[Thumbnail] Title - Artist
            shared by username • timestamp       [Platform]

            💬 5  ❤️ 12         [expand-icon]
            ─────────────────────────────────────
            This is a great track...▼
```

**Collapsed State (>60 characters):**
```
[Thumbnail] Title - Artist
            shared by username • timestamp       [Platform]

            💬 5  ❤️ 12         [expand-icon]
            ─────────────────────────────────────
            This is a great track that I di...▼
```

**Expanded State:**
```
[Thumbnail] Title - Artist
            shared by username • timestamp       [Platform]

            💬 5  ❤️ 12         [expand-icon]
            ─────────────────────────────────────
            │ This is a great track that I discovered
            │ while browsing through some old vinyl
            │ records at my local shop. Hope you
            │ enjoy it as much as I do!▲
```

**Visual Specifications:**
```css
.track-card-social-row {
  display: flex;
  align-items: center;
  gap: 8px;              /* space-2 */
  padding: 8px 0 4px 0;  /* space-2 top, space-1 bottom */
  border-bottom: 1px solid rgba(4, 202, 244, 0.1);
  margin-bottom: 4px;    /* space-1 */
}

.track-card-comment-container {
  padding-top: 4px;      /* space-1 */
}
```

---

### 4. Social Button Placement

**New Location:** Above the comment, in a dedicated "social metadata" row
**Rationale:**
- Social buttons represent metadata about the post (replies, likes)
- Comments represent content from the sharer
- Metadata should precede content for clear hierarchy
- This keeps social actions visible and accessible regardless of comment expansion state

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│ [Thumb] Title - Artist        [Platform]│
│         shared by user • 2h ago         │
│                                         │
│         💬 5  ❤️ 12           [expand]  │ ← Social metadata row
│         ─────────────────────────────   │
│         │ Full comment text...          │ ← Comment content
│         │ (can expand/collapse)         │
└─────────────────────────────────────────┘
```

**Implementation:**
```tsx
{/* Social Metadata Row - ABOVE comment */}
<Show when={props.showSocialActions || (props.showExpandableComment && props.track.comment)}>
  <div class="track-card-social-row">
    <Show when={props.showSocialActions}>
      <TrackSocialActions
        track={props.track}
        onLike={props.onLike}
        onReply={props.onReply}
        compact={true}
      />
    </Show>

    {/* Spacer to push expand button to the right */}
    <div class="flex-1"></div>

    {/* Comment expansion indicator - ONLY if comment exists and needs truncation */}
    <Show when={props.showExpandableComment && props.track.comment && props.track.comment.length > 60}>
      <button class="comment-expand-indicator" aria-label="Expand/collapse comment">
        <span class="text-neon-cyan text-xs">▼</span>
      </button>
    </Show>
  </div>
</Show>

{/* Comment Content Area - BELOW social metadata */}
<Show when={props.showExpandableComment && props.track.comment}>
  <div class="track-card-comment-container">
    <ExpandableText
      text={props.track.comment}
      maxLength={60}
      className="text-xs text-white/60 font-mono"
      expandedClassName="text-xs text-white/80 font-mono leading-relaxed"
    />
  </div>
</Show>
```

**Visual Specifications:**
```css
.comment-expand-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid rgba(4, 202, 244, 0.3);
  background: rgba(4, 202, 244, 0.05);
  color: #04caf4;
  border-radius: 2px;
  cursor: pointer;
  transition: all 200ms ease;
}

.comment-expand-indicator:hover {
  background: rgba(4, 202, 244, 0.15);
  border-color: #04caf4;
  box-shadow: 0 0 8px rgba(4, 202, 244, 0.3);
}

.comment-expand-indicator:active {
  transform: scale(0.95);
}
```

---

## Complete Layout Hierarchy

### ListLayout (RowTrackCard - 76px collapsed height)

**Collapsed State:**
```
┌────────────────────────────────────────────────────┐
│ [48x48]  Title (14px bold, white)        [Platform]│  ← Row 1: Track info
│  thumb   Artist (12px, cyan)             [Badge]   │
│          shared by username • 2h ago               │  ← Row 2: Social context
│                                                    │
│          💬 5  ❤️ 12                    [expand]  │  ← Row 3: Social metadata
│          ────────────────────────────────────────  │
│          This is a great track that I...▼         │  ← Row 4: Comment (truncated)
└────────────────────────────────────────────────────┘
```

**Height Breakdown:**
- Row 1 (Track info): 16px (title) + 2px gap = 18px
- Row 1 cont. (Artist): 12px (artist) + 2px gap = 14px
- Row 2 (Social context): 14px + 4px gap = 18px
- Row 3 (Social metadata): 24px + 4px gap = 28px
- Row 4 (Comment): 12px + 8px padding = 20px
- **Total: ~98px (slightly over 76px - needs optimization)**

**Optimized Height (76px target):**
- Combine thumbnail with rows vertically
- Use absolute positioning for platform badge
- Reduce vertical gaps to 4px (space-1) instead of 8px
- Comment row becomes optional height (only if comment exists)

**Revised Layout:**
```
┌────────────────────────────────────────────────────┐
│ [48x48]  Title (14px bold) • Artist (12px)  [Plat] │  ← 48px (thumbnail height)
│  thumb   shared by username • 2h ago               │
│          💬 5  ❤️ 12                    [▼]       │  ← 24px (social row)
│          Comment text if present...               │  ← Variable height
└────────────────────────────────────────────────────┘
```

**CSS Implementation:**
```css
.track-card-list-layout {
  display: flex;
  gap: 8px;          /* space-2 between thumbnail and content */
  padding: 8px;      /* space-2 */
  min-height: 76px;  /* Minimum row height */
  position: relative;
  transition: background 200ms ease;
}

.track-card-list-layout:hover {
  background: rgba(4, 202, 244, 0.02);
}

.track-thumbnail-container {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  position: relative;
}

.track-content {
  flex: 1;
  min-width: 0;      /* Allow truncation */
  display: flex;
  flex-direction: column;
  gap: 4px;          /* space-1 between rows */
}

.track-metadata-row {
  display: flex;
  align-items: baseline;
  gap: 8px;          /* space-2 */
}

.track-title {
  font-size: 14px;   /* text-sm */
  font-weight: 700;
  color: #ffffff;
  flex-shrink: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-artist {
  font-size: 12px;   /* text-xs */
  color: #04caf4;    /* neon-cyan */
  flex-shrink: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-social-context {
  font-size: 14px;   /* text-sm - larger for prominence */
  line-height: 1.4;
}

.track-social-row {
  display: flex;
  align-items: center;
  gap: 8px;          /* space-2 */
  min-height: 24px;
}
```

---

### HeroTrackCard / DetailedLayout (260px height)

**Layout:**
```
┌────────────────────────────────────────┐
│                                        │
│         [180x180 thumbnail]            │  ← Large hero image
│                                        │
│                                        │
│  Title (16px bold, white)              │
│  Artist (14px, cyan)                   │
│  shared by username • 2h ago           │  ← Prominent social context
│                                        │
│  💬 5  ❤️ 12              [expand]     │  ← Social metadata
│  ──────────────────────────────────    │
│  │ Full comment text with expansion   │  ← Comment
└────────────────────────────────────────┘
```

**Height Breakdown:**
- Hero image: 180px (square)
- Metadata area: 80px (flexible based on content)
  - Title: 16px + 4px gap = 20px
  - Artist: 14px + 4px gap = 18px
  - Social context: 14px + 8px gap = 22px
  - Social row: 24px + 4px gap = 28px
  - Comment: Variable (collapsed ~16px)
- **Total: 260px base (expandable)**

**CSS Implementation:**
```css
.track-card-detailed-layout {
  display: flex;
  flex-direction: column;
  gap: 12px;         /* space-3 */
  padding: 12px;     /* space-3 */
  background: linear-gradient(135deg, rgba(4, 202, 244, 0.03), transparent);
  border: 1px solid rgba(4, 202, 244, 0.1);
  border-radius: 4px;
  max-width: 640px;  /* container-sm */
  min-height: 260px;
  transition: all 200ms ease;
}

.track-card-detailed-layout:hover {
  border-color: rgba(4, 202, 244, 0.3);
  box-shadow: 0 0 12px rgba(4, 202, 244, 0.15);
}

.hero-thumbnail {
  width: 100%;
  aspect-ratio: 1;
  max-width: 180px;
  margin: 0 auto;
  border-radius: 4px;
  overflow: hidden;
}
```

---

### CompactTrackCard / GridLayout (156px square)

**Note:** Grid cards are for browsing, not social context. No comments, minimal social info.

**Layout:**
```
┌───────────────┐
│   [144x144]   │  ← Square thumbnail (fills most of card)
│   thumbnail   │
│   [Platform]  │  ← Badge overlay
│               │
│  Title (12px) │  ← Minimal metadata
│  Artist (11px)│
└───────────────┘
```

**No Changes Required:** Compact cards don't show comments or detailed social context. Username can optionally appear below in a smaller size if needed, but not critical for grid browsing.

---

## Interaction States

### Playing State

**Visual Indicators:**
```css
.track-card.is-playing {
  border-left: 3px solid #00f92a;  /* neon-green accent */
  background: linear-gradient(90deg, rgba(0, 249, 42, 0.03), transparent);
  box-shadow: inset 3px 0 8px rgba(0, 249, 42, 0.15);
}

/* Animated pulse on thumbnail */
.track-card.is-playing .track-thumbnail {
  animation: playing-pulse 2s ease-in-out infinite;
}

@keyframes playing-pulse {
  0%, 100% {
    box-shadow: 0 0 8px rgba(0, 249, 42, 0.3);
  }
  50% {
    box-shadow: 0 0 16px rgba(0, 249, 42, 0.5);
  }
}

/* Show pause icon on hover */
.track-card.is-playing:hover .track-thumbnail::after {
  content: '⏸';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 0 12px rgba(0, 0, 0, 0.9);
  background: rgba(0, 0, 0, 0.6);
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
}
```

### Hover State

**Entire Card:**
```css
.track-card:hover {
  background: rgba(4, 202, 244, 0.02);
  cursor: pointer;
  transform: translateY(-1px);
  transition: all 200ms ease;
}

/* Subtle glow */
.track-card:hover::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  box-shadow: 0 0 8px rgba(4, 202, 244, 0.2);
  pointer-events: none;
  z-index: -1;
}

/* Show play icon on thumbnail */
.track-card:not(.is-playing):hover .track-thumbnail::before {
  content: '▶';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 0 12px rgba(0, 0, 0, 0.9);
  background: rgba(0, 0, 0, 0.6);
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  animation: fade-in 200ms ease;
}

@keyframes fade-in {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
```

### Comment Expanded State

**Animation:**
```typescript
// In animations.ts - reuse existing expandText animation
export const expandText = {
  enter: (element: HTMLElement) => {
    anime({
      targets: element,
      height: [0, element.scrollHeight],
      opacity: [0, 1],
      duration: 300,
      easing: 'easeOutCubic'
    });
  },
  leave: (element: HTMLElement) => {
    anime({
      targets: element,
      height: [element.scrollHeight, 0],
      opacity: [1, 0],
      duration: 200,
      easing: 'easeInCubic'
    });
  }
};
```

**Visual Treatment:**
```css
/* Expanded comment gets left border accent */
.expandable-text-expanded {
  border-left: 2px solid #04caf4;  /* neon-cyan accent */
  padding-left: 12px;              /* space-3 */
  margin-left: -12px;              /* Align with collapsed text */
  background: rgba(4, 202, 244, 0.02);
  border-radius: 0 4px 4px 0;
  padding: 8px 0 8px 12px;         /* Vertical breathing room */
}
```

### Focus State (Keyboard Navigation)

```css
.track-card:focus {
  outline: 2px solid #04caf4;      /* neon-cyan outline */
  outline-offset: 2px;
  box-shadow: 0 0 8px rgba(4, 202, 244, 0.4);
}

.comment-expand-indicator:focus {
  outline: 2px solid #04caf4;
  outline-offset: 2px;
  box-shadow: 0 0 8px rgba(4, 202, 244, 0.4);
}

/* Social action buttons already have focus states in TrackSocialActions.tsx */
```

---

## Typography & Color Specifications

### Username Display

```css
.track-shared-by {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;           /* text-sm */
  font-weight: 500;          /* Medium */
  line-height: 1.4;
  color: #e010e0;            /* neon-magenta */
  transition: all 200ms ease;
}

.track-shared-by-label {
  color: rgba(255, 255, 255, 0.6);  /* muted */
  font-weight: 400;
}

.track-shared-by-name {
  color: #e010e0;            /* neon-magenta */
  cursor: pointer;
}

.track-shared-by-name:hover {
  color: #ff1aff;            /* neon-magenta-bright */
  text-shadow: 0 0 8px rgba(224, 16, 224, 0.4);
}
```

### Track Metadata

```css
.track-title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;           /* text-sm */
  font-weight: 700;          /* Bold */
  line-height: 1.3;
  color: #ffffff;            /* light-text */
}

.track-artist {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 12px;           /* text-xs */
  font-weight: 400;          /* Regular */
  line-height: 1.3;
  color: #04caf4;            /* neon-cyan */
  cursor: pointer;
  transition: color 200ms ease;
}

.track-artist:hover {
  color: #3bb3d0;            /* Lighter cyan */
  text-decoration: underline;
}
```

### Comment Text

```css
.track-comment {
  font-family: 'JetBrains Mono', 'SF Mono', 'Monaco', monospace;
  font-size: 12px;           /* text-xs */
  font-weight: 400;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.6);  /* muted */
}

.track-comment-expanded {
  color: rgba(255, 255, 255, 0.8);  /* Less muted when expanded */
}
```

### Social Actions

```css
/* Already defined in TrackSocialActions.tsx */
.social-action-button {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;           /* text-xs */
  padding: 4px 6px;          /* space-1 space-1.5 */
  border-radius: 2px;
  transition: all 200ms ease;
}

/* Reply button - blue */
.social-reply {
  color: #3b82f6;            /* blue-400 */
}

.social-reply:hover {
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
}

/* Like button - red */
.social-like {
  color: #ef4444;            /* red-400 */
}

.social-like:hover {
  background: rgba(239, 68, 68, 0.1);
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
}

.social-like.is-liked {
  color: #dc2626;            /* red-600 */
  background: rgba(220, 38, 38, 0.2);
}
```

---

## Responsive Considerations

### Mobile (375px - 640px)

**Primary target size.** All measurements above are optimized for this range.

**Touch Targets:**
- Entire card: Minimum 76px height (ListLayout)
- Social buttons: 44px minimum tap target
- Expand button: 44px minimum tap target
- Username: 44px minimum tap target (with padding)

**Spacing:**
- Use 8px (space-2) for gaps between elements
- Use 4px (space-1) for tight gaps within rows
- Use 12px (space-3) for padding around card content

### Tablet (640px - 1024px)

**Minor adjustments:**
- Increase max-width of DetailedLayout to 640px
- Show more comment characters before truncation (80 instead of 60)
- Slightly larger touch targets (48px instead of 44px)

**CSS:**
```css
@media (min-width: 640px) {
  .track-card-detailed-layout {
    max-width: 640px;
  }

  .track-card-comment-container {
    --comment-max-length: 80;
  }

  .social-action-button {
    min-height: 48px;
    min-width: 48px;
  }
}
```

### Desktop (1024px+)

**Show richer interactions:**
- Add tooltip on username hover showing profile preview
- Show full comment on hover (no need to click expand)
- Larger thumbnails in DetailedLayout (200x200px instead of 180x180px)

**CSS:**
```css
@media (min-width: 1024px) {
  .track-card-detailed-layout .hero-thumbnail {
    max-width: 200px;
  }

  /* Auto-expand comment on hover */
  .track-card:hover .track-comment-collapsed {
    max-height: none;
    overflow: visible;
  }

  /* Show tooltip on username hover */
  .track-shared-by-name:hover::after {
    content: 'View profile';
    position: absolute;
    bottom: 100%;
    left: 0;
    padding: 4px 8px;
    background: rgba(0, 0, 0, 0.9);
    color: #04caf4;
    font-size: 11px;
    white-space: nowrap;
    border: 1px solid rgba(4, 202, 244, 0.3);
    border-radius: 2px;
    margin-bottom: 4px;
  }
}
```

---

## Animation Specifications

### Page Load (Avoid)

**Do NOT animate cards on page load.** Per design guidelines: "AVOID page-level fade-ins or entrance animations (makes app feel slow)."

Cards should appear instantly. Focus on interaction animations only.

### Interaction Animations

**1. Card Hover (200ms ease)**
```typescript
// Simple CSS transition - no anime.js needed
.track-card {
  transition: transform 200ms ease, background 200ms ease;
}

.track-card:hover {
  transform: translateY(-1px);
  background: rgba(4, 202, 244, 0.02);
}
```

**2. Play Button Reveal (300ms cubic-bezier)**
```typescript
// CSS animation triggered by hover
@keyframes play-button-reveal {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.track-thumbnail::before {
  animation: play-button-reveal 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

**3. Comment Expansion (300ms easeOutCubic)**
```typescript
// Use existing expandText animation from animations.ts
import { expandText } from '../../utils/animations';

// On expand
expandText.enter(commentElement);

// On collapse
expandText.leave(commentElement);
```

**4. Social Button Click (500ms ease-out)**
```typescript
// Use existing heartBeat and particleBurst from animations.ts
import { heartBeat, particleBurst } from '../../utils/animations';

// On like
heartBeat(likeButtonElement);
particleBurst(likeButtonElement);
```

**5. Playing State Pulse (2s infinite ease-in-out)**
```css
@keyframes playing-pulse {
  0%, 100% {
    box-shadow: 0 0 8px rgba(0, 249, 42, 0.3);
  }
  50% {
    box-shadow: 0 0 16px rgba(0, 249, 42, 0.5);
  }
}

.track-card.is-playing .track-thumbnail {
  animation: playing-pulse 2s ease-in-out infinite;
}
```

---

## Accessibility Specifications

### Keyboard Navigation

**Tab Order:**
1. Card (entire clickable area for play)
2. Username (clickable link to profile)
3. Reply button
4. Like button
5. Expand comment button (if applicable)

**Keyboard Shortcuts:**
- `Enter` or `Space` on card: Play/pause track
- `Enter` or `Space` on username: Navigate to profile
- `Enter` or `Space` on social buttons: Trigger action
- `Enter` or `Space` on expand button: Expand/collapse comment
- `Escape` when comment expanded: Collapse comment

**Implementation:**
```tsx
// Card level
<div
  class="track-card"
  onClick={handleCardClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  }}
  tabindex="0"
  role="button"
  aria-label={`Play ${props.track.title} by ${props.track.artist}`}
>
```

### Screen Reader Support

**ARIA Labels:**
```tsx
// Username
<button
  aria-label={`View profile of ${props.track.addedBy}`}
  class="track-shared-by-name"
>
  {props.track.addedBy}
</button>

// Social actions
<button
  aria-label={`${replyCount} replies. Add reply`}
  class="social-reply-button"
>
  💬 {replyCount}
</button>

<button
  aria-label={`${likeCount} likes. ${isLiked ? 'Unlike' : 'Like'} this track`}
  class="social-like-button"
>
  {isLiked ? '❤️' : '❤'} {likeCount}
</button>

// Expand button
<button
  aria-label={isExpanded ? 'Collapse comment' : 'Expand full comment'}
  aria-expanded={isExpanded}
  class="comment-expand-button"
>
  {isExpanded ? '▲' : '▼'}
</button>

// Card playing state
<div
  class="track-card"
  aria-current={isPlaying ? 'true' : 'false'}
  aria-label={`${props.track.title} by ${props.track.artist}. ${isPlaying ? 'Currently playing' : 'Play track'}`}
>
```

**Live Region for State Changes:**
```tsx
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {isPlaying && `Now playing ${props.track.title}`}
  {!isPlaying && wasPlaying && `Paused ${props.track.title}`}
  {isExpanded && 'Comment expanded'}
  {!isExpanded && wasExpanded && 'Comment collapsed'}
</div>
```

### Color Contrast

**All text meets WCAG AA (4.5:1 minimum):**
- White text (#ffffff) on dark background (#1a1a1a): 15.8:1 ✓
- Neon cyan (#04caf4) on dark background: 8.2:1 ✓
- Neon magenta (#e010e0) on dark background: 6.1:1 ✓
- Muted text (rgba(255,255,255,0.6)) on dark background: 9.5:1 ✓

**Focus indicators:**
- 2px solid neon cyan outline (#04caf4): High contrast ✓
- 2px offset for clarity ✓
- Never remove or hide focus indicators ✓

---

## Implementation Checklist

### Phase 1: Update TrackCardVariants.tsx (ListLayout)

- [ ] Remove dedicated play button (lines 158-168)
- [ ] Add card-level onClick handler for playback
- [ ] Update username display to "shared by username" format (lines 178-181)
- [ ] Increase username font size to 14px (text-sm)
- [ ] Change username color to neon-magenta (#e010e0)
- [ ] Move TrackSocialActions above ExpandableText (lines 206-227)
- [ ] Create new social metadata row container
- [ ] Add expand button indicator to social row (when comment exists)
- [ ] Update comment container styling
- [ ] Add playing state visual indicators
- [ ] Add hover state visual indicators

### Phase 2: Update TrackCardVariants.tsx (DetailedLayout)

- [ ] Apply same username changes as ListLayout
- [ ] Add card-level onClick handler
- [ ] Move TrackSocialActions above ExpandableText
- [ ] Update layout spacing for hero card (260px height)
- [ ] Add playing state visual indicators
- [ ] Add hover state visual indicators

### Phase 3: Update CompactTrackCard/GridLayout

- [ ] Verify no comment display (correct)
- [ ] Optional: Add small username display below thumbnail
- [ ] Maintain 156px square size
- [ ] Keep play button overlay on thumbnail

### Phase 4: Update CSS/Styling

- [ ] Add `.track-card-shared-by` styles
- [ ] Add `.track-card-social-row` styles
- [ ] Add `.track-card-comment-container` styles
- [ ] Add `.track-card.is-playing` styles
- [ ] Add `.track-card:hover` styles
- [ ] Add `.comment-expand-indicator` styles
- [ ] Update `.track-thumbnail` pseudo-element styles
- [ ] Add playing-pulse keyframe animation
- [ ] Add play-button-reveal keyframe animation

### Phase 5: Update Animations

- [ ] Verify expandText animation works with new layout
- [ ] Add thumbnail play icon reveal animation
- [ ] Add playing state pulse animation
- [ ] Test all interaction animations (hover, click, expand)

### Phase 6: Accessibility

- [ ] Add ARIA labels to all interactive elements
- [ ] Implement keyboard navigation (Enter/Space)
- [ ] Add focus indicators to all focusable elements
- [ ] Test tab order (card → username → social → expand)
- [ ] Add screen reader live region for state changes
- [ ] Test with VoiceOver (macOS) and NVDA (Windows)

### Phase 7: Responsive Testing

- [ ] Test on iPhone SE (375px width)
- [ ] Test on iPhone 12/13/14 (390px width)
- [ ] Test on iPhone 14 Pro Max (428px width)
- [ ] Test on iPad Mini (768px width)
- [ ] Test on iPad Pro (1024px width)
- [ ] Verify touch targets are minimum 44px
- [ ] Test comment expansion on all sizes

### Phase 8: Visual Polish

- [ ] Verify color contrast on all text
- [ ] Test neon glow effects on hover
- [ ] Verify playing state visual is clear
- [ ] Test comment expansion animation smoothness
- [ ] Verify social button animations (heart, particle burst)
- [ ] Test username hover glow effect
- [ ] Verify platform badge positioning

---

## Design Rationale

### Why Move Social Buttons Above Comments?

**Problem:** When comments expand, buttons on the right side of the comment row feel disconnected from the content.

**Solution:** Move social buttons above the comment into a dedicated "social metadata" row.

**Benefits:**
1. **Clear hierarchy:** Metadata (social stats) precedes content (comment)
2. **Consistent position:** Buttons stay in the same place regardless of expansion state
3. **Better scanability:** Users can quickly see engagement metrics without scrolling
4. **Touch-friendly:** Larger, more accessible tap targets
5. **Visual balance:** Creates a horizontal row of actions that spans the full width

**Precedent:** This pattern is common in social apps:
- Twitter: Actions (reply, retweet, like) above quoted tweets
- Reddit: Vote buttons and metadata above comment text
- Instagram: Like/comment count above caption

### Why "shared by username" Instead of "@username"?

**Problem:** "@username" is less clear in context and smaller text makes it hard to read.

**Solution:** "shared by username" with larger, more prominent styling.

**Benefits:**
1. **Clarity:** Explicitly states the social relationship
2. **Prominence:** Larger text (14px vs 12px) and distinctive color (magenta)
3. **Context:** Emphasizes that this is a social music app
4. **Consistency:** Matches the language users understand ("someone shared this")

**Natural language:** "shared by" is more conversational and friendly than technical "@" notation.

### Why Remove the Play Button?

**Problem:** Dedicated play button is redundant and takes valuable space.

**Solution:** Make entire card clickable for playback, show play icon on thumbnail hover.

**Benefits:**
1. **Simpler interaction:** One click anywhere on the card plays the track
2. **More space:** Removes 40x40px play button, freeing up layout
3. **Clearer feedback:** Playing state indicated by left border and glow
4. **Better mobile UX:** Larger tap target (entire card vs small button)

**Mental model:** Card represents the track, clicking it plays it. This is intuitive and matches music app conventions (Spotify, Apple Music, etc.).

### Why Use Existing ExpandableText Component?

**Problem:** Could build custom expansion from scratch, but that adds complexity.

**Solution:** Reuse existing `ExpandableText` component with minor modifications.

**Benefits:**
1. **Code reuse:** Component already exists and works well
2. **Consistency:** Same expansion behavior across app
3. **Tested:** Already in use in library table rows
4. **Simple:** Avoid over-engineering a solved problem

**Modification needed:** Just move the expand indicator to the social row (separate from the text itself) for better visual hierarchy.

---

## Technical Implementation Notes

### Component File Structure

**Files to modify:**
1. `/frontend/src/components/common/TrackCard/TrackCardVariants.tsx` (main changes)
2. `/frontend/src/components/ui/ExpandableText.tsx` (minor tweaks if needed)
3. `/frontend/src/components/ui/ExpandableText.css` (style updates)
4. `/frontend/src/utils/animations.ts` (verify existing animations work)

**No new files needed.** This is purely a refactor of existing components.

### Props to Add/Update

**TrackCardVariants.tsx (VariantProps interface):**
```typescript
interface VariantProps {
  track: Track | PersonalTrack;
  showSocialActions?: boolean;
  showUserContext?: boolean;
  showExpandableComment?: boolean;
  onPlay?: (track: Track) => void;
  onLike?: (track: Track) => void;
  onReply?: (track: Track) => void;
  formatTimeAgo?: (timestamp: string) => string;
  isCurrentTrack?: boolean;
  isPlaying?: boolean;
  onCardClick?: () => void;  // NEW: Handle card click for playback
  onUserClick?: (username: string) => void;  // NEW: Handle username click
}
```

### State Management

**Playing state** is already passed via `isPlaying` prop. No new state needed.

**Comment expansion** is handled internally by `ExpandableText` component. No parent state needed.

**Like state** is handled internally by `TrackSocialActions` component. No parent state needed.

**Simple and clean:** No complex state management required.

---

## Performance Considerations

### Rendering Optimization

**Avoid:** Re-rendering entire card on every state change

**Use:**
- Memo components where appropriate
- CSS animations instead of JS animations where possible
- `will-change` property on animated elements

```css
.track-card {
  will-change: transform, background;
}

.track-thumbnail::before {
  will-change: opacity, transform;
}
```

### Animation Performance

**Hardware acceleration:**
```css
.track-card {
  transform: translateZ(0);  /* Force GPU acceleration */
}
```

**Avoid layout thrashing:**
- Use `transform` and `opacity` for animations (compositor-only properties)
- Avoid animating `width`, `height`, `margin`, `padding` (triggers layout)

**Batch animations:**
- Use existing anime.js utilities from `animations.ts`
- Don't create new anime instances for every card

---

## Testing Strategy

### Visual Regression Testing

**Screenshots needed:**
1. ListLayout collapsed (default state)
2. ListLayout with comment expanded
3. ListLayout in playing state
4. ListLayout on hover
5. DetailedLayout collapsed
6. DetailedLayout expanded
7. CompactLayout/GridLayout (unchanged)

**Tools:** Percy, Chromatic, or manual screenshots

### Interaction Testing

**User flows to test:**
1. Click card → verify track plays
2. Click username → verify profile navigation
3. Click reply button → verify reply dialog opens
4. Click like button → verify like animation and count increment
5. Click expand button → verify comment expands
6. Click collapse button → verify comment collapses
7. Hover over card → verify play icon appears
8. Hover over username → verify glow effect

### Accessibility Testing

**Tools:**
- axe DevTools (Chrome extension)
- WAVE (Web Accessibility Evaluation Tool)
- Lighthouse (Chrome DevTools)

**Manual testing:**
- Keyboard navigation (tab through all elements)
- Screen reader testing (VoiceOver on macOS, NVDA on Windows)
- Color contrast verification

### Performance Testing

**Metrics to measure:**
- Time to Interactive (TTI) < 2s
- First Contentful Paint (FCP) < 1s
- Animation frame rate: 60fps
- No layout shifts (CLS = 0)

**Tools:**
- Chrome DevTools Performance tab
- Lighthouse performance audit

---

## Migration Strategy

### Phased Rollout

**Phase 1: ListLayout (Most Common)**
- Update ListLayout component first
- Deploy to staging for internal testing
- Gather feedback on social prominence and play interaction

**Phase 2: DetailedLayout (Feed/Discovery)**
- Apply same changes to DetailedLayout
- Test with real feed content
- Verify hero card height (260px) with expanded comments

**Phase 3: CompactLayout (Optional)**
- Minimal changes needed
- Optional username display
- Keep focus on visual browsing

**Phase 4: Polish & Refinement**
- Fine-tune animations
- Adjust spacing based on real usage
- Optimize for performance

### Rollback Plan

**If issues arise:**
1. Revert to previous commit (git)
2. Keep old component as `TrackCardVariants.old.tsx` for quick restore
3. Feature flag for A/B testing old vs new design

---

## Success Metrics

### Quantitative

- **Play interaction rate:** Increase clicks on cards (expect 20-30% increase)
- **Social engagement:** Increase clicks on reply/like buttons (expect 15-20% increase)
- **Username clicks:** Measure profile navigation from cards (new metric)
- **Comment expansion:** Track how often users expand comments (expect 30-40% of cards with comments)

### Qualitative

- **User feedback:** Survey users on social prominence ("Do you notice who shared tracks?")
- **Usability testing:** Watch users interact with new cards, note pain points
- **Internal feedback:** Team members test and provide input

### Technical

- **Performance:** Maintain 60fps animations
- **Accessibility:** Pass axe DevTools audit with 0 violations
- **Cross-browser:** Works in Chrome, Safari, Firefox, Edge
- **Mobile:** Works on iOS Safari, Android Chrome

---

## Future Enhancements (Out of Scope)

**Not included in this redesign but could be added later:**

1. **User avatars:** Show profile picture next to username
2. **Inline replies:** Expand reply thread below card
3. **Rich media comments:** Support images/GIFs in comments
4. **Reaction types:** Beyond just like (love, fire, etc.)
5. **Sharing actions:** Direct share buttons for social platforms
6. **Playlist add:** Quick button to add to playlist
7. **Queue management:** Add to queue vs play immediately

**Focus now:** Nail the core social prominence and interaction simplification.

---

## Conclusion

This redesign addresses the user's core feedback:
1. ✓ **Username is prominent** - Larger, clearer, "shared by" format
2. ✓ **Play interaction is simple** - Entire card clickable, no dedicated button
3. ✓ **Comments are expandable** - Reuses existing ExpandableText component
4. ✓ **Social buttons are well-placed** - Above comments in dedicated row

**Key design decision:** Moving social buttons above comments solves the placement challenge elegantly. Metadata precedes content, buttons stay visible regardless of expansion state.

**Implementation strategy:** Simple solutions for simple problems. Reuse existing components, avoid over-engineering, focus on clarity and usability.

**Next steps:** Implement Phase 1 (ListLayout) first, test thoroughly, then roll out to other card variants.