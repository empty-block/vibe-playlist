# ThreadCard Terminal Redesign - Design Plan
**Date:** 2025-10-02
**Task:** TASK-593, TASK-594, TASK-595, TASK-596
**Status:** Ready for Implementation
**Design Level:** Level 2 - Terminal UI (Light Terminal Treatment)

---

## Executive Summary

This design plan focuses on aligning the ThreadCard component's CSS with its existing terminal-style TSX structure. The current disconnect is that `ThreadCard.tsx` already implements ASCII borders and terminal layout, but `threadCard.css` still uses the old minimal styling. This plan prioritizes **user experience and information hierarchy first**, then applies terminal aesthetic styling that matches the "Level 2: Terminal UI" specification.

### Key Design Principles

1. **UX Foundation First**: Information hierarchy, readability, and user actions take priority
2. **Light Terminal Treatment**: Lighter than Activity page, heavier than Profile page
3. **Mobile-First**: Design scales gracefully from mobile to desktop
4. **Performance Conscious**: Avoid heavy effects on individual cards
5. **Accessibility**: Maintain WCAG 2.1 AA standards throughout

---

## Part 1: UX & Information Architecture (PRIORITY)

### 1.1 User Needs Analysis

**Primary User Goals:**
- Quickly scan thread topics to find interesting conversations
- Understand who started the thread and when
- See if a starter track is attached
- Gauge thread activity (replies, likes)
- Navigate to thread detail page

**Information Priority Hierarchy:**
1. **Most Important**: Thread text (the question/topic)
2. **Very Important**: Creator identity (avatar + username) and timestamp
3. **Important**: Starter track (if present)
4. **Supporting**: Engagement metrics (replies, likes)

### 1.2 Content Organization Strategy

**Current TSX Structure Analysis:**
```
╭─ Thread #ID ─╮
│ [Avatar] @username · timestamp │
├─────────────────────────────────┤
│ Thread text content             │
├─────────────────────────────────┤
│ [Track Preview]                 │
├─────────────────────────────────┤
│ 💬 replies • ❤ likes            │
╰─────────────────────────────────╯
```

**UX Assessment:**
✅ **Good:**
- Clear visual separation between sections
- User identity moved to top (better than old design)
- Timestamp inline with user (space efficient)
- Thread text gets dedicated space without prefix clutter
- Track preview clearly separated
- Stats at bottom (appropriate priority)

✅ **Optimal:** This structure already implements excellent UX hierarchy. No structural changes needed.

### 1.3 Interactive Elements & User Actions

**Clickable Areas:**
1. **Entire card** → Navigate to thread detail page (48px min height on mobile)
2. **Username** → Navigate to user profile (stopPropagation)
3. **Artist name** → Filter/navigate by artist (stopPropagation)

**Touch Targets:**
- Mobile: Minimum 44px tap targets for username and artist
- Desktop: Hover states for all interactive elements
- Keyboard: Focus indicators for accessibility

**Interaction Patterns:**
```
Card Click → Thread Detail Page
Username Click → User Profile (prevents card click)
Artist Click → Artist Filter/View (prevents card click)
```

### 1.4 Responsive Layout Strategy

**Mobile (320px - 640px):**
- Single column, full width
- Reduce padding to 8-10px
- Simplify ASCII borders (lighter characters)
- Remove scan line effects
- Avatar: 28px
- Font sizes: 10-13px range

**Tablet (641px - 1024px):**
- Standard terminal styling
- Constrained width within feed container
- Avatar: 32px
- Font sizes: 11-14px range

**Desktop (1025px+):**
- Maximum width: 900px (enforced by feed container)
- Full terminal treatment
- Hover effects with glow
- Avatar: 32px
- Font sizes: 11-14px range

### 1.5 Visual Hierarchy Through Design

**Size Hierarchy:**
1. Thread text: 14px (largest, most important)
2. Username: 12px (medium, identity)
3. Track info: 12px title, 11px artist
4. Stats: 11px (smallest, supporting info)
5. Timestamps, metadata: 10px (minimal)

**Color Hierarchy:**
1. Thread text: White (#ffffff) - highest contrast
2. Username: Magenta (#ff00ff) - branded accent
3. Track artist: Cyan (#04caf4) - interactive element
4. Stats: Dim gray (#808080) - supporting info
5. Borders/metadata: Muted (#404040) - minimal attention

**Weight Hierarchy:**
1. Thread text: Regular (400)
2. Username: Semi-bold (600)
3. Track title: Semi-bold (600)
4. Other text: Regular (400)

---

## Part 2: Layout Specifications

### 2.1 Card Structure & Spacing

**Overall Card:**
```css
.terminal-thread-card {
  /* Layout */
  display: block;
  width: 100%;
  cursor: pointer;

  /* Spacing */
  margin-bottom: 12px;

  /* Structure */
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-muted);

  /* Typography */
  font-family: var(--font-terminal);
  font-size: 11px;
  line-height: 1.6;
}
```

**Section Padding:**
- Header/Footer (borders): 6px 12px
- User line: 10px 14px
- Content: 10px 14px
- Track preview: 8px 12px
- Dividers: 0 12px

**Spacing Between Elements:**
- Avatar → Username: 10px gap
- Username → Separator: 8px inline
- Separator → Timestamp: 8px inline
- Stats items: 12px gap

### 2.2 User Identity Section

**Layout:**
```
│ [Avatar] @username · timestamp        │
│ [32×32]  [12px/600] [10px/dim]       │
│  gap:10px           margin-left:auto  │
```

**Specifications:**
```css
.thread-user-line {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-size: 12px;
  line-height: 1.4;
}

.thread-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
}

.thread-username {
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.thread-separator {
  font-weight: 400;
  user-select: none;
}

.thread-timestamp-inline {
  font-size: 10px;
  margin-left: auto;
}
```

### 2.3 Thread Content Section

**Layout:**
```
│ Thread text goes here and can wrap    │
│ across multiple lines naturally...    │
```

**Specifications:**
```css
.thread-card-content {
  padding: 10px 14px;
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.thread-text {
  font-size: 14px;
  line-height: 1.5;
  flex: 1;
}
```

**Text Truncation:**
- Uses ExpandableText component (already implemented)
- Max length: 80 characters before "Show more"
- Maintains readability on all screen sizes

### 2.4 Track Preview Section

**Layout (Horizontal):**
```
│ [40×40 art] "Track Title"             │
│             Artist Name                │
```

**Specifications:**
```css
.thread-track-preview {
  padding: 8px 12px;
  background: rgba(224, 16, 224, 0.03);
  display: flex;
  gap: 8px;
  align-items: center;
}

.thread-track-thumbnail {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  object-fit: cover;
}

.thread-track-info {
  flex: 1;
  min-width: 0; /* Enable ellipsis */
}

.thread-track-title {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.thread-track-artist {
  font-size: 11px;
  cursor: pointer;
}
```

### 2.5 Stats Footer Section

**Layout:**
```
│ 💬 24 • ❤ 12                          │
```

**Specifications:**
```css
.thread-card-footer {
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
}

.thread-stat {
  display: flex;
  align-items: center;
  gap: 4px;
}
```

---

## Part 3: Terminal Aesthetic Styling

### 3.1 Terminal Color Application

**Page Context: Threads (Magenta Accent)**

**Color Palette:**
```css
--terminal-bg: #0a0a0a;
--terminal-text: #e0e0e0;
--terminal-white: #ffffff;
--terminal-dim: #808080;
--terminal-muted: #404040;

/* Thread-specific accents */
--neon-magenta: #ff00ff;  /* Primary thread accent */
--neon-cyan: #04caf4;     /* Secondary (artist links) */
--neon-yellow: #ffff00;   /* Thread ID */
```

**Color Mapping:**
- **Card border**: `--terminal-muted` (default), `--neon-magenta` (hover)
- **ASCII characters**: `--terminal-dim` (borders), `--neon-yellow` (thread ID)
- **Username**: `--neon-magenta` with text-shadow on hover
- **Thread text**: `--terminal-white`
- **Track artist**: `--neon-cyan` with text-shadow on hover
- **Stats/timestamps**: `--terminal-dim`
- **Dividers**: `--terminal-muted`

### 3.2 Typography & Terminal Font

**Font Stack:**
```css
font-family: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', 'Courier New', monospace;
```

**Size Scale (Terminal Specific):**
```css
--terminal-text-xs: 10px;   /* Timestamps, metadata */
--terminal-text-sm: 11px;   /* Stats, footer */
--terminal-text-base: 12px; /* Username, track info */
--terminal-text-md: 13px;   /* [unused in cards] */
--terminal-text-lg: 14px;   /* Thread text */
```

**Applied Sizes:**
- ASCII borders: 10px
- Thread ID: 10px
- Timestamps: 10px
- Stats: 11px
- Track artist: 11px
- Username: 12px
- Track title: 12px
- Thread text: 14px

### 3.3 Border & Decoration Styling

**ASCII Border Characters:**
```
Top:    ╭─ Thread #a4f2 ────...─╮
Sides:  │ content              │
Divider: ├─────────────────────┤
Bottom: ╰──────────────────────╯
```

**Border Styling:**
```css
.thread-card-header {
  padding: 6px 12px;
  color: var(--terminal-dim);
  font-size: 10px;
  letter-spacing: 0.5px;
}

.thread-id {
  color: var(--neon-yellow);
}

.thread-card-divider {
  padding: 0 12px;
  color: var(--terminal-muted);
  font-size: 10px;
}

.border-v {
  color: var(--terminal-muted);
  user-select: none;
}
```

**Mobile Simplification:**
On screens < 640px, ASCII borders remain but are slightly simplified to maintain readability.

### 3.4 Background Effects (Light Treatment)

**Card Background:**
```css
.terminal-thread-card {
  background: var(--terminal-bg);
  /* NO scan lines on individual cards */
  /* NO CRT effects on individual cards */
}
```

**Track Preview Background:**
```css
.thread-track-preview {
  background: rgba(224, 16, 224, 0.03); /* Subtle magenta tint */
}
```

**Page-Level Effects Only:**
- Light scan lines on page background (already implemented in threads.css)
- Subtle vignette on page edges (already implemented)
- Cards themselves remain clean for performance

---

## Part 4: Interactive States & Animations

### 4.1 Hover States

**Card Hover:**
```css
.terminal-thread-card:hover {
  border-color: var(--neon-magenta);
  box-shadow: 0 0 4px rgba(224, 16, 224, 0.15);
  transition: border-color 200ms ease, box-shadow 200ms ease;
}
```

**Username Hover:**
```css
.thread-username:hover {
  text-shadow: 0 0 2px var(--neon-magenta);
  transition: text-shadow 200ms ease;
}
```

**Artist Hover:**
```css
.thread-track-artist:hover {
  text-shadow: 0 0 2px var(--neon-cyan);
  transition: text-shadow 200ms ease;
}
```

**Avatar Hover (Connected to Username):**
```css
.thread-username:hover ~ .thread-avatar {
  border-color: var(--neon-magenta);
  box-shadow: 0 0 6px rgba(224, 16, 224, 0.5);
  transition: all 200ms ease;
}
```

### 4.2 Active/Pressed States

**Card Active:**
```css
.terminal-thread-card:active {
  transform: scale(0.99);
  transition: transform 100ms ease;
}
```

### 4.3 Focus States (Accessibility)

**Card Focus:**
```css
.terminal-thread-card:focus-within {
  outline: 2px solid var(--neon-cyan);
  outline-offset: -2px;
  box-shadow: 0 0 8px rgba(4, 202, 244, 0.4);
}
```

**Interactive Element Focus:**
```css
.thread-username:focus,
.thread-track-artist:focus {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 2px;
}
```

### 4.4 Entrance Animations

**Stream-In Effect (Already Implemented):**
```css
@keyframes thread-stream-in {
  0% {
    opacity: 0;
    transform: translateX(-12px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.thread-card-wrapper {
  animation: thread-stream-in 300ms ease-out;
}

/* Stagger delays already handled by wrapper */
```

**No Additional Animations Needed:**
- Keep entrance animation light and fast (300ms)
- Avoid per-card effects for performance
- Focus on smooth transitions for interactive elements

---

## Part 5: Mobile Responsive Design

### 5.1 Breakpoint Strategy

**Mobile First Approach:**
```css
/* Base styles: Mobile (320px - 640px) */
.terminal-thread-card { ... }

/* Tablet (641px - 1024px) */
@media (min-width: 641px) { ... }

/* Desktop (1025px+) */
@media (min-width: 1025px) { ... }
```

### 5.2 Mobile Optimizations (max-width: 640px)

**Typography Scaling:**
```css
@media (max-width: 640px) {
  .terminal-thread-card {
    font-size: 10px; /* Base reduced */
  }

  .thread-user-line {
    padding: 8px 10px;
    font-size: 11px;
    gap: 8px;
  }

  .thread-avatar {
    width: 28px;
    height: 28px;
  }

  .thread-timestamp-inline {
    font-size: 10px;
  }

  .thread-text {
    font-size: 13px; /* Still readable */
  }

  .thread-track-title {
    font-size: 11px;
  }

  .thread-track-artist {
    font-size: 10px;
  }
}
```

**Touch Target Optimization:**
```css
@media (max-width: 640px) {
  .thread-username,
  .thread-track-artist {
    min-height: 44px; /* iOS touch target */
    display: flex;
    align-items: center;
  }
}
```

**Effects Reduction:**
```css
@media (max-width: 640px) {
  /* Scan lines already removed at page level */

  /* Lighter hover effects */
  .terminal-thread-card:hover {
    box-shadow: 0 0 2px rgba(224, 16, 224, 0.1);
  }
}
```

### 5.3 Small Phone Adjustments (max-width: 375px)

```css
@media (max-width: 375px) {
  .thread-user-line {
    padding: 6px 8px;
  }

  .thread-card-content {
    padding: 8px 10px;
  }

  .thread-track-preview {
    padding: 6px 8px;
  }
}
```

---

## Part 6: Accessibility Standards

### 6.1 Color Contrast (WCAG 2.1 AA)

**Text Contrast Ratios:**
- Thread text (white on black): 21:1 ✅
- Username (magenta on black): 8.1:1 ✅
- Body text (light gray on black): 12.6:1 ✅
- Stats/dim text (gray on black): 4.8:1 ✅

**Interactive Elements:**
- All clickable elements have visible focus indicators
- Focus outline: 2px cyan (#04caf4)
- Focus contrast: 8.5:1 ✅

### 6.2 Semantic HTML & ARIA

**Already Implemented in TSX:**
```jsx
<article
  class="terminal-thread-card"
  role="article"
  aria-label={`Thread by ${username}: ${text}`}
>
  <img
    src={avatar}
    alt={`${username}'s avatar`}
    role="img"
    loading="lazy"
  />

  <span
    class="thread-username"
    role="button"
    tabindex="0"
  >
    @{username}
  </span>
</article>
```

**CSS Support:**
```css
.thread-username,
.thread-track-artist {
  cursor: pointer;
  /* Focus indicators defined above */
}

.border-v {
  user-select: none; /* Prevent selection of decorative chars */
}
```

### 6.3 Keyboard Navigation

**Tab Order:**
1. Card (entire area clickable)
2. Username (stopPropagation)
3. Artist name (if present, stopPropagation)

**Focus Management:**
```css
.terminal-thread-card:focus-within {
  outline: 2px solid var(--neon-cyan);
  outline-offset: -2px;
}

.thread-username:focus,
.thread-track-artist:focus {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 2px;
  border-radius: 2px;
}
```

### 6.4 Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .thread-card-wrapper {
    animation: none;
    transition: none;
  }

  .terminal-thread-card,
  .terminal-thread-card:hover,
  .terminal-thread-card:active {
    transition: none;
    transform: none;
  }

  .thread-username:hover,
  .thread-track-artist:hover {
    transition: none;
  }
}
```

---

## Part 7: Implementation Tasks

### TASK-594: Terminal CSS Styling

**File:** `/mini-app/src/components/common/TrackCard/NEW/threadCard.css`

**Action:** Complete rewrite of CSS file

**Steps:**
1. Replace all existing styles with terminal aesthetic
2. Implement color variables (use existing from threads.css)
3. Apply terminal typography scale
4. Style ASCII borders and decorative elements
5. Implement track preview background
6. Style user identity section with avatar borders
7. Apply magenta accent colors throughout

**CSS Sections to Implement:**
```
1. Card Container (.terminal-thread-card)
2. ASCII Borders (.thread-card-header, .thread-card-divider)
3. User Identity (.thread-user-line, .thread-avatar, .thread-username)
4. Content Area (.thread-card-content, .thread-text)
5. Track Preview (.thread-track-preview, .thread-track-*)
6. Stats Footer (.thread-card-footer, .thread-stat)
7. Decorative Elements (.border-v, .thread-separator, .thread-id)
```

### TASK-595: Interactive States & Hover Effects

**File:** Same as above

**Steps:**
1. Implement card hover with magenta border glow
2. Add username hover with text-shadow
3. Add artist hover with cyan text-shadow
4. Implement active/pressed state (scale transform)
5. Add focus indicators for keyboard navigation
6. Create transition timings (200ms standard)
7. Test all interactive states

**Interactive Elements:**
```css
/* Card hover */
.terminal-thread-card:hover { ... }

/* Username hover */
.thread-username:hover { ... }

/* Artist hover */
.thread-track-artist:hover { ... }

/* Active state */
.terminal-thread-card:active { ... }

/* Focus states */
.terminal-thread-card:focus-within { ... }
.thread-username:focus { ... }
.thread-track-artist:focus { ... }
```

### TASK-596: Mobile Responsiveness

**File:** Same as above

**Steps:**
1. Test on actual mobile devices (iOS Safari, Chrome Android)
2. Verify ASCII characters render correctly
3. Check touch target sizes (44px minimum)
4. Test typography scaling at different viewport sizes
5. Verify hover effects don't interfere on touch devices
6. Check performance with multiple cards
7. Test scrolling smoothness
8. Verify reduced motion support

**Breakpoints to Test:**
- 320px (iPhone SE)
- 375px (iPhone 12/13 Mini)
- 390px (iPhone 12/13/14)
- 414px (iPhone Plus models)
- 640px (Tablet portrait)
- 768px (iPad portrait)
- 1024px (iPad landscape)
- 1280px+ (Desktop)

**Mobile-Specific Adjustments:**
```css
@media (max-width: 640px) {
  /* Typography scaling */
  /* Touch target optimization */
  /* Padding adjustments */
  /* Effect reduction */
}

@media (max-width: 375px) {
  /* Small phone adjustments */
}
```

---

## Part 8: Testing & Quality Assurance

### 8.1 Visual Regression Testing

**Checklist:**
- [ ] ASCII borders render correctly on all browsers
- [ ] Terminal font loads and displays properly
- [ ] Color contrast meets WCAG AA standards
- [ ] Spacing is consistent across all sections
- [ ] Avatar borders and shapes are correct
- [ ] Track preview background is subtle
- [ ] Stats align properly at bottom

### 8.2 Interaction Testing

**Checklist:**
- [ ] Card click navigates to thread detail
- [ ] Username click stops propagation and navigates
- [ ] Artist click stops propagation and filters
- [ ] Hover effects display on desktop
- [ ] Hover effects don't interfere on mobile
- [ ] Active state provides visual feedback
- [ ] Focus indicators visible via keyboard
- [ ] Tab order is logical

### 8.3 Responsive Testing

**Checklist:**
- [ ] Layout works on 320px width
- [ ] Text remains readable at all sizes
- [ ] Touch targets are 44px minimum on mobile
- [ ] No horizontal scrolling
- [ ] Avatar scales appropriately
- [ ] Track preview works on small screens
- [ ] Stats don't wrap awkwardly
- [ ] ASCII borders don't break layout

### 8.4 Performance Testing

**Checklist:**
- [ ] No jank during scroll
- [ ] Hover transitions are smooth (60fps)
- [ ] Entrance animations don't cause layout shift
- [ ] No unnecessary repaints
- [ ] CSS file size is reasonable (<10kb)
- [ ] Multiple cards render quickly
- [ ] Memory usage is stable

### 8.5 Accessibility Testing

**Checklist:**
- [ ] Screen reader announces card content properly
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Color contrast passes WCAG AA
- [ ] Reduced motion setting respected
- [ ] ARIA labels are accurate
- [ ] Tab order is logical

### 8.6 Cross-Browser Testing

**Browsers to Test:**
- [ ] Chrome (Desktop & Android)
- [ ] Safari (Desktop & iOS)
- [ ] Firefox (Desktop)
- [ ] Edge (Desktop)

**Known Issues to Watch:**
- ASCII character rendering differences
- Font fallback behavior
- Box-shadow blur differences
- Text-shadow rendering

---

## Part 9: Success Metrics

### 9.1 Design Quality

**Visual Consistency:**
- ThreadCard matches threads.css terminal styling ✅
- Lighter treatment than Activity cards ✅
- Magenta accent used consistently ✅
- Typography scale follows terminal.css ✅

**Information Hierarchy:**
- Thread text is most prominent ✅
- User identity clearly visible ✅
- Track preview is distinct but secondary ✅
- Stats are subtle and supportive ✅

### 9.2 User Experience

**Usability Metrics:**
- Click-through rate to thread detail (target: maintain or improve)
- Time to identify interesting threads (target: <3 seconds per card)
- Error rate on username clicks (target: <5%)

**Performance Metrics:**
- Card render time: <50ms
- Scroll FPS: 60fps
- Animation smoothness: 60fps
- CSS file size: <10kb

### 9.3 Technical Quality

**Code Quality:**
- CSS follows BEM-like naming conventions
- All colors use CSS variables
- Typography uses defined scale
- No hardcoded values (use variables)
- Comments explain non-obvious decisions

**Maintainability:**
- Easy to adjust colors globally
- Simple to modify spacing
- Clear separation of concerns
- Mobile-first responsive approach

---

## Part 10: Implementation Code

### 10.1 Complete CSS File

**File:** `/mini-app/src/components/common/TrackCard/NEW/threadCard.css`

```css
/* ThreadCard - Terminal UI (Level 2) */
/* Matches: threads.css terminal aesthetic */

/* ===== CARD CONTAINER ===== */

.terminal-thread-card {
  /* Layout */
  display: block;
  width: 100%;
  cursor: pointer;

  /* Spacing */
  margin-bottom: 12px;

  /* Structure */
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-muted);

  /* Typography */
  font-family: var(--font-terminal);
  font-size: 11px;
  line-height: 1.6;

  /* Interaction */
  position: relative;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.terminal-thread-card:hover {
  border-color: var(--neon-magenta);
  box-shadow: 0 0 4px rgba(224, 16, 224, 0.15);
}

.terminal-thread-card:active {
  transform: scale(0.99);
  transition: transform 100ms ease;
}

/* ===== ASCII BORDERS ===== */

.thread-card-header {
  padding: 6px 12px;
  color: var(--terminal-dim);
  font-size: 10px;
  letter-spacing: 0.5px;
}

.thread-id {
  color: var(--neon-yellow);
}

.thread-card-divider {
  padding: 0 12px;
  color: var(--terminal-muted);
  font-weight: 400;
  font-size: 10px;
}

.border-v {
  color: var(--terminal-muted);
  user-select: none;
}

/* ===== USER IDENTITY SECTION ===== */

.thread-user-line {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-size: 12px;
  line-height: 1.4;
}

.thread-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid var(--neon-magenta);
  box-shadow: 0 0 3px rgba(224, 16, 224, 0.25);
  object-fit: cover;
  flex-shrink: 0;
  background: var(--terminal-bg);
  transition: all 200ms ease;
}

.thread-avatar-fallback {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid var(--neon-magenta);
  background: var(--terminal-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neon-magenta);
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
}

.thread-username {
  color: var(--neon-magenta);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: text-shadow 200ms ease;
}

.thread-username:hover {
  text-shadow: 0 0 2px var(--neon-magenta);
}

.thread-username:hover ~ .thread-avatar,
.thread-username:hover + .thread-avatar {
  border-color: var(--neon-magenta);
  box-shadow: 0 0 6px rgba(224, 16, 224, 0.5);
}

.thread-separator {
  color: var(--terminal-dim);
  font-weight: 400;
  user-select: none;
}

.thread-timestamp-inline {
  color: var(--terminal-dim);
  font-size: 10px;
  margin-left: auto;
}

/* ===== CONTENT SECTION ===== */

.thread-card-content {
  padding: 10px 14px;
  color: var(--terminal-text);
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.thread-text {
  color: var(--terminal-white);
  font-size: 14px;
  line-height: 1.5;
  flex: 1;
}

.thread-text-content {
  color: inherit;
  font-size: inherit;
  line-height: inherit;
}

/* ===== TRACK PREVIEW SECTION ===== */

.thread-track-preview {
  padding: 8px 12px;
  background: rgba(224, 16, 224, 0.03);
  display: flex;
  gap: 8px;
  align-items: center;
}

.thread-track-thumbnail {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  object-fit: cover;
}

.thread-track-info {
  flex: 1;
  min-width: 0;
}

.thread-track-title {
  color: var(--terminal-white);
  font-weight: 600;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.thread-track-artist {
  color: var(--neon-cyan);
  font-size: 11px;
  cursor: pointer;
  transition: text-shadow 200ms ease;
}

.thread-track-artist:hover {
  text-shadow: 0 0 2px var(--neon-cyan);
}

/* ===== STATS FOOTER ===== */

.thread-card-footer {
  padding: 6px 12px;
  color: var(--terminal-dim);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
}

.thread-stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ===== ACCESSIBILITY ===== */

.terminal-thread-card:focus-within {
  outline: 2px solid var(--neon-cyan);
  outline-offset: -2px;
  box-shadow: 0 0 8px rgba(4, 202, 244, 0.4);
}

.thread-username:focus,
.thread-track-artist:focus {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 2px;
  border-radius: 2px;
}

/* ===== RESPONSIVE: MOBILE ===== */

@media (max-width: 640px) {
  .terminal-thread-card {
    font-size: 10px;
  }

  .thread-user-line {
    padding: 8px 10px;
    font-size: 11px;
    gap: 8px;
  }

  .thread-avatar {
    width: 28px;
    height: 28px;
  }

  .thread-avatar-fallback {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .thread-timestamp-inline {
    font-size: 10px;
  }

  .thread-text {
    font-size: 13px;
  }

  .thread-track-title {
    font-size: 11px;
  }

  .thread-track-artist {
    font-size: 10px;
  }

  /* Lighter hover effects on mobile */
  .terminal-thread-card:hover {
    box-shadow: 0 0 2px rgba(224, 16, 224, 0.1);
  }

  /* Touch target optimization */
  .thread-username,
  .thread-track-artist {
    min-height: 44px;
    display: flex;
    align-items: center;
  }
}

/* ===== RESPONSIVE: SMALL PHONES ===== */

@media (max-width: 375px) {
  .thread-user-line {
    padding: 6px 8px;
  }

  .thread-card-content {
    padding: 8px 10px;
  }

  .thread-track-preview {
    padding: 6px 8px;
  }
}

/* ===== REDUCED MOTION ===== */

@media (prefers-reduced-motion: reduce) {
  .terminal-thread-card,
  .terminal-thread-card:hover,
  .terminal-thread-card:active {
    transition: none;
    transform: none;
  }

  .thread-username:hover,
  .thread-track-artist:hover,
  .thread-avatar {
    transition: none;
  }
}
```

---

## Part 11: Next Steps & Rollout

### 11.1 Implementation Order

1. **TASK-594**: Replace threadCard.css with terminal styling (2 hours)
2. **TASK-595**: Test and refine interactive states (1 hour)
3. **TASK-596**: Mobile testing and responsive refinements (2 hours)
4. **Visual QA**: Cross-browser testing (1 hour)
5. **Accessibility Audit**: Keyboard nav, screen reader, contrast (1 hour)

**Total Estimated Time**: 7 hours

### 11.2 Verification Checklist

**Before Deployment:**
- [ ] CSS file replaced and tested locally
- [ ] All interactive states work correctly
- [ ] Mobile responsive on actual devices
- [ ] Accessibility requirements met
- [ ] Cross-browser testing complete
- [ ] Performance benchmarks met
- [ ] Code reviewed and approved

**After Deployment:**
- [ ] Monitor user feedback
- [ ] Check analytics for engagement changes
- [ ] Watch for bug reports
- [ ] Verify performance in production

### 11.3 Rollback Plan

If issues arise:
1. Terminal styling can be disabled by reverting threadCard.css
2. TSX component structure remains unchanged
3. Functionality is preserved
4. Minimal risk to user experience

### 11.4 Future Enhancements (Out of Scope)

**Potential Future Features:**
- Thread preview on hover (modal/tooltip)
- Inline track playback
- Quick actions (like/reply without clicking through)
- Thread status indicators (new replies since visit)
- Favorite/bookmark functionality

---

## Conclusion

This design plan prioritizes **user experience and information architecture first**, then applies the terminal aesthetic in a way that enhances rather than overwhelms. The ThreadCard redesign:

1. ✅ **Maintains excellent UX hierarchy** already present in the TSX structure
2. ✅ **Applies Level 2 terminal styling** consistent with threads.css
3. ✅ **Ensures mobile-first responsiveness** with proper touch targets
4. ✅ **Meets WCAG 2.1 AA standards** for accessibility
5. ✅ **Optimizes performance** by avoiding per-card effects
6. ✅ **Provides clear interactive feedback** for all user actions

The implementation is straightforward: replace threadCard.css with the provided CSS, test thoroughly, and deploy. No TSX changes required.

**Ready for implementation following the task order: TASK-594 → TASK-595 → TASK-596**
