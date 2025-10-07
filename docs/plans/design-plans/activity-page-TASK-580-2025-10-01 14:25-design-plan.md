# Activity Page Design Plan - TASK-580

**Date:** 2025-10-01 14:25
**Designer:** Zen Master Designer (AI Agent)
**Target:** New Activity Page for Jamzy
**Priority:** Core social discovery feature

---

## Executive Summary

The Activity Page serves as the social heartbeat of Jamzy - a feed where users discover music through their network's activity. Unlike the Library (personal collection) or Stats (analytics), the Activity Page focuses on **social music discovery** by showing what friends, networks, and the broader community are sharing, liking, and discussing.

**Core Purpose:** Transform passive music consumption into active social discovery by surfacing the most relevant music activity from a user's social graph.

**Key Principles:**
- **Social First**: Every entry shows who did what, with clear social context
- **Discovery Oriented**: Prioritize new music and unexpected finds
- **Conversation Focused**: Make it easy to jump into threads and discussions
- **Clean & Scannable**: Easy to browse and find interesting content

**Note:** This is a UI/UX design plan. API implementation, state management, and backend details are out of scope for this design phase.

---

## Design Philosophy

### Simple Solutions for Social Discovery

The Activity Page addresses a straightforward need: "Show me what my friends are listening to right now." The solution should be equally clear:

- **Chronological + Smart**: Recent activity first, with subtle algorithmic weighting
- **Information Dense but Scannable**: Show many items, but make each one visually distinct
- **One-Click Actions**: Play track, like, reply without leaving the feed
- **Contextual Richness**: Never just "User X shared Track Y" - always include why it matters

**Avoid:**
- Over-filtering that hides interesting content
- Complex sorting/filtering UI that interrupts discovery flow
- Generic social feed patterns - this is music-specific
- Losing the human connection in pursuit of algorithmic perfection

---

## Page Structure & Layout

### Desktop Layout (1024px+)

```
┌─────────────────────────────────────────────────────────────┐
│ TERMINAL HEADER                                             │
│ [•••] [JAMZY::ACTIVITY] | Live Activity Feed | [FILTER ▼]  │
│ user@jamzy:~/activity$ show --live --network=all           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────┐            │
│  │ 🔴 LIVE • 147 active listeners             │            │
│  │ Last update: 2s ago                        │            │
│  └────────────────────────────────────────────┘            │
│                                                             │
│  [ALL] [FOLLOWING] [NETWORKS] [TRENDING]                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Activity Item (Track Card with Social Context)      │   │
│  │ ┌──────┐  shared by username • 2min ago            │   │
│  │ │ IMG  │  Track Title                               │   │
│  │ │ 48px │  Artist Name • Album                       │   │
│  │ └──────┘  "This is my comment about the track..."  │   │
│  │           ♥ 15  💬 3  ↻ 2         [PLAY ▶]         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Activity Item (Conversation)                        │   │
│  │ ┌──────┐  username replied to networkname          │   │
│  │ │ IMG  │  Re: Midnight Vibes                        │   │
│  │ │ 48px │  → Thread has 8 new replies                │   │
│  │ └──────┘  "Just discovered this gem..."            │   │
│  │           [VIEW THREAD]                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Activity Item (Network Event)                       │   │
│  │ 🌟 New Network: Synthwave Collective                │   │
│  │ 156 members • 847 tracks shared                     │   │
│  │ Active since: 3h ago                                │   │
│  │ [JOIN NETWORK]                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [...more activity items...]                               │
│                                                             │
│  [LOAD MORE ↓]                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)

- Full width cards with 16px horizontal padding
- Simplified metadata (fewer secondary details)
- Larger touch targets (56px minimum)
- Swipeable cards for quick actions (swipe right = like, swipe left = hide)
- Pull-to-refresh for new content
- Sticky filter tabs at top

---

## Component Architecture

### Activity Item Types

The feed displays 4 primary activity types, each with distinct visual treatment:

#### 1. Track Share (Most Common)
**When:** User posts a new track to their feed or network
**Priority:** HIGH - core content type

**Visual Structure:**
```
┌────────────────────────────────────────────┐
│ [Avatar] shared by username • timestamp    │
│ ┌──────┐                                   │
│ │ IMG  │ Track Title           [Playing]  │
│ │ 48px │ Artist • Album                    │
│ └──────┘ "User's comment text here..."    │
│          ♥ likes  💬 replies  ↻ recasts   │
│          [PLAY ▶]                          │
└────────────────────────────────────────────┘
```

**Specifications:**
- Background: `--darker-bg` (#0f0f0f)
- Border: 1px solid `--neon-cyan` at 20% opacity
- Padding: 16px
- Hover: Lift effect (translateY(-2px)) + neon-cyan glow
- Current playing: 2px border `--neon-blue` + multi-layer glow

#### 2. Social Interaction (Like/Reply/Recast)
**When:** Someone in user's network interacts with a track
**Priority:** MEDIUM - drives conversation

**Visual Structure:**
```
┌────────────────────────────────────────────┐
│ [Avatar] username liked track • timestamp  │
│ ┌──────┐                                   │
│ │ IMG  │ Track Title                       │
│ │ 40px │ Artist                            │
│ └──────┘ originally shared by origuser    │
│          ♥ likes  💬 replies               │
└────────────────────────────────────────────┘
```

**Specifications:**
- Slightly smaller thumbnail (40px vs 48px)
- More compact padding (12px)
- Muted border (no cyan highlight)
- Grouped interactions (if 3+ people liked same track, show "username and 2 others liked...")

#### 3. Conversation Activity
**When:** New replies in threads user is following
**Priority:** HIGH - maintains engagement

**Visual Structure:**
```
┌────────────────────────────────────────────┐
│ [Avatar] username replied in thread        │
│ 💬 Re: "Original track or topic"          │
│ "User's reply text preview..."            │
│ → 8 new replies • Last reply 5min ago     │
│ [VIEW THREAD]                              │
└────────────────────────────────────────────┘
```

**Specifications:**
- Background: `--dark-bg` with `--neon-magenta` accent (left border 3px)
- No thumbnail (conversation-focused)
- Emphasis on text content
- Thread icon (💬) in neon-magenta

#### 4. Network Events
**When:** New networks, milestones, community moments
**Priority:** LOW - ambient discovery

**Visual Structure:**
```
┌────────────────────────────────────────────┐
│ 🌟 Event Type: Event Title                 │
│ Brief description of the event             │
│ Relevant stats or metadata                 │
│ [CALL TO ACTION BUTTON]                    │
└────────────────────────────────────────────┘
```

**Specifications:**
- Background: gradient from `--neon-blue` to transparent (5% opacity)
- Centered text layout
- Prominent CTA button
- Reserved for significant events only (< 5% of feed)

---

## Information Hierarchy & Typography

### Text Sizes (Mobile-First)

```css
/* Primary Content */
.activity-username {
  font-size: 14px;           /* --text-sm */
  font-family: var(--font-social);
  color: var(--neon-magenta);
  font-weight: 600;
  line-height: 1.4;
}

.activity-action {
  font-size: 13px;
  color: var(--muted-text);
  font-weight: 400;
}

.track-title {
  font-size: 16px;           /* --text-base */
  font-family: var(--font-display);
  color: var(--light-text);
  font-weight: 600;
  line-height: 1.3;
}

.track-artist {
  font-size: 14px;           /* --text-sm */
  font-family: var(--font-interface);
  color: var(--neon-cyan);
  font-weight: 400;
}

.activity-comment {
  font-size: 14px;           /* --text-sm */
  font-family: var(--font-social);
  color: var(--light-text);
  line-height: 1.5;
  max-height: 3.0em;         /* ~2 lines */
  overflow: hidden;
}

.activity-comment.expanded {
  max-height: none;
}

.activity-timestamp {
  font-size: 12px;           /* --text-xs */
  color: var(--muted-text);
  opacity: 0.7;
}

/* Social Stats */
.social-stat {
  font-size: 13px;
  font-family: var(--font-monospace);
  color: var(--muted-text);
}

.social-stat.active {
  color: var(--neon-green);  /* User has liked/replied */
}
```

### Desktop Adjustments (1024px+)

```css
@media (min-width: 1024px) {
  .activity-username { font-size: 15px; }
  .track-title { font-size: 18px; }
  .track-artist { font-size: 15px; }
  .activity-comment { font-size: 15px; }
}
```

---

## Color & Visual Design

### Activity Type Color Coding

Use subtle left border accent to distinguish activity types at a glance:

```css
/* Track Shares */
.activity-item[data-type="share"] {
  border-left: 3px solid var(--neon-cyan);
}

/* Likes/Interactions */
.activity-item[data-type="like"] {
  border-left: 3px solid var(--neon-green);
}

/* Conversations */
.activity-item[data-type="conversation"] {
  border-left: 3px solid var(--neon-magenta);
}

/* Recasts */
.activity-item[data-type="recast"] {
  border-left: 3px solid var(--neon-pink);
}

/* Network Events */
.activity-item[data-type="event"] {
  border-left: 3px solid var(--neon-blue);
}
```

### State Colors

```css
/* Interactive States */
.activity-item:hover {
  background: rgba(4, 202, 244, 0.03);
  box-shadow: 0 0 12px rgba(4, 202, 244, 0.2);
  transform: translateY(-2px);
  transition: all 200ms ease;
}

.activity-item.unread {
  border-left-color: var(--neon-yellow);
  border-left-width: 4px;
}

.activity-item.playing {
  border: 2px solid var(--neon-blue);
  box-shadow:
    0 0 10px rgba(59, 0, 253, 0.3),
    0 0 20px rgba(59, 0, 253, 0.2),
    inset 0 0 15px rgba(59, 0, 253, 0.1);
}
```

---

## Interaction Design

### Primary Actions

#### Play Track (Most Important)
- **Trigger:** Click anywhere on track card (except social buttons)
- **Visual Feedback:**
  - Instant: Card border changes to neon-blue
  - Animation: Particle burst from thumbnail (anime.js)
  - State: Play icon (▶) changes to pause (⏸)
- **Implementation:** Use existing `playbackButtonHover` animation from animations.ts

#### Like/Reply/Recast
- **Trigger:** Tap/click individual icon buttons
- **Visual Feedback:**
  - Instant color change (gray → neon-green for like)
  - Count increment with scale animation (100% → 120% → 100%)
  - Haptic feedback on mobile (if available)
- **Implementation:** Similar to existing TrackSocialActions component

#### View Thread
- **Trigger:** Tap/click conversation card or "View Thread" button
- **Behavior:** Navigate to thread detail view (similar to ProfilePage structure)
- **Visual Feedback:** Slide-in animation from right (mobile) or expand-in-place (desktop)

### Secondary Actions

#### Filter Activity
- **Trigger:** Tap filter tabs or dropdown
- **Options:**
  - ALL: Everything from user's network
  - FOLLOWING: Only people user follows
  - NETWORKS: Only specific networks user has joined
  - TRENDING: Algorithmically surfaced popular tracks
- **Visual Feedback:** Active tab has neon-cyan underline (3px)
- **Persistence:** Save filter preference to localStorage

#### Load More
- **Trigger:** Scroll to bottom (infinite scroll) or tap "Load More" button
- **Behavior:** Fetch next 20 activity items
- **Visual Feedback:**
  - Skeleton loading states (animated neon-blue gradient)
  - Smooth append animation (staggered fade-in)

#### Pull to Refresh (Mobile)
- **Trigger:** Pull down gesture at top of feed
- **Behavior:** Fetch latest activity items
- **Visual Feedback:**
  - Elastic pull animation
  - Spinning neon-cyan circle loader
  - Success: Brief green flash

---

## Animation Specifications

### Entry Animations

**Page Load:**
```typescript
// Staggered fade-in for initial activity items
anime({
  targets: '.activity-item',
  opacity: [0, 1],
  translateY: [20, 0],
  delay: anime.stagger(60),
  duration: 400,
  easing: 'easeOutCubic'
});
```

**New Item Insertion (Real-Time):**
```typescript
// Slide in from top with glow effect
anime({
  targets: newItem,
  opacity: [0, 1],
  translateY: [-30, 0],
  boxShadow: [
    '0 0 0px rgba(0, 249, 42, 0)',
    '0 0 20px rgba(0, 249, 42, 0.5)',
    '0 0 0px rgba(0, 249, 42, 0)'
  ],
  duration: 600,
  easing: 'easeOutExpo'
});
```

### Hover Animations

**Card Hover:**
```typescript
// Subtle lift + glow (from animations.ts pattern)
anime({
  targets: element,
  translateY: -2,
  boxShadow: '0 0 12px rgba(4, 202, 244, 0.3)',
  duration: 200,
  easing: 'easeOutQuad'
});
```

### Action Feedback

**Like Button:**
```typescript
// Scale pulse + color change
anime({
  targets: likeButton,
  scale: [1, 1.2, 1],
  color: ['#cccccc', '#00f92a', '#00f92a'],
  duration: 300,
  easing: 'easeInOutQuad'
});
```

**Play Button Click:**
```typescript
// Particle burst (reuse from existing track cards)
particleBurst(thumbnailElement, {
  particleCount: 15,
  colors: ['#3b00fd', '#04caf4', '#00f92a'],
  radius: 40
});
```

---

## Responsive Design

### Breakpoint Strategy

```css
/* Mobile First Base Styles (320px+) */
.activity-page {
  padding: 16px;
  max-width: 100%;
}

.activity-item {
  padding: 12px;
  margin-bottom: 12px;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .activity-page {
    padding: 24px;
    max-width: 768px;
    margin: 0 auto;
  }

  .activity-item {
    padding: 16px;
    margin-bottom: 16px;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .activity-page {
    max-width: 900px;
  }

  .activity-item {
    padding: 20px;
  }

  /* Show more metadata on desktop */
  .activity-metadata-extended {
    display: block;
  }
}

/* Large Desktop (1280px+) */
@media (min-width: 1280px) {
  .activity-page {
    max-width: 1100px;
  }

  /* Two-column layout for certain views */
  .activity-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
  }
}
```

### Mobile-Specific Enhancements

**Touch Gestures:**
- Swipe right on card: Quick like
- Swipe left on card: Hide/dismiss
- Long press: Show context menu (share, add to playlist, etc.)

**Optimized Interactions:**
- Larger tap targets (minimum 48px height)
- Bottom-aligned action buttons (thumb zone)
- Simplified metadata (hide less critical info)
- Infinite scroll (no "Load More" button)

**Performance:**
- Virtual scrolling for feeds > 100 items
- Lazy load thumbnails (intersection observer)
- Debounced real-time updates (max 1 update per 5 seconds)

---

## Real-Time Features

### Live Activity Updates

**Implementation Strategy (MVP - Polling):**
- Simple polling every 60 seconds (or longer)
- New items appear at top with animation
- Unread indicator (yellow left border) until user scrolls past
- No WebSocket complexity for MVP - keep it simple

**Update Frequency:**
```typescript
// Simple polling strategy for MVP
const UPDATE_INTERVALS = {
  active: 60000,      // User actively viewing (60s)
  background: 180000, // Tab in background (3min)
  idle: 300000        // User idle (5min)
};
```

**Future Enhancement:** WebSocket connections can be added later if real-time updates become critical

**Batching Logic:**
```typescript
// Group updates to avoid feed chaos
if (newItems.length > 5) {
  showBanner("15 new items available - tap to refresh");
} else {
  insertItemsWithAnimation(newItems);
}
```

### Status Indicators

**Live Status Badge:**
```html
<div class="live-status">
  <div class="pulse-dot"></div>
  <span>LIVE • 147 active</span>
</div>
```

**CSS:**
```css
.live-status {
  background: rgba(0, 249, 42, 0.1);
  border: 1px solid var(--neon-green);
  padding: 8px 16px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: var(--neon-green);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

---

## Accessibility Considerations

### Keyboard Navigation

**Required Keyboard Shortcuts:**
- `Tab` / `Shift+Tab`: Navigate between activity items
- `Enter` / `Space`: Play track or open thread
- `L`: Like current item
- `R`: Reply to current item
- `N`: Jump to next unread item
- `F`: Open filter menu
- `Esc`: Close any open modals/menus

### Screen Reader Support

**Semantic HTML:**
```html
<article
  class="activity-item"
  aria-label="username shared Track Title by Artist, 5 minutes ago"
  tabindex="0"
  role="button"
>
  <div class="activity-header">
    <img src="..." alt="username's avatar" />
    <span class="visually-hidden">shared by</span>
    <a href="/profile/username" aria-label="View username's profile">username</a>
  </div>

  <div class="track-info">
    <h3 class="track-title">Track Title</h3>
    <p class="track-artist">
      <a href="/artist/123" aria-label="View Artist's profile">Artist</a>
    </p>
  </div>

  <button
    aria-label="Play Track Title by Artist"
    aria-pressed="false"
  >
    Play
  </button>

  <div class="social-actions" role="group" aria-label="Social actions">
    <button aria-label="Like (15 likes)">♥ 15</button>
    <button aria-label="Reply (3 replies)">💬 3</button>
    <button aria-label="Recast (2 recasts)">↻ 2</button>
  </div>
</article>
```

### Focus States

```css
.activity-item:focus-visible {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 2px;
  box-shadow: 0 0 8px rgba(4, 202, 244, 0.4);
}

button:focus-visible {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 2px;
}
```

### Color Contrast

All text must meet WCAG AA standards:
- Primary text (#ffffff on #0f0f0f): 15.8:1 ✓
- Secondary text (#cccccc on #0f0f0f): 12.6:1 ✓
- Neon cyan links (#04caf4 on #0f0f0f): 7.2:1 ✓
- Neon magenta (#e010e0 on #0f0f0f): 4.8:1 ✓

---

## Performance Considerations

### Design Choices for Performance

**Virtual Scrolling:**
- For long feeds (100+ items), consider virtual scrolling
- Only render visible items + small buffer
- Average item height: ~140px

**Image Loading:**
- Lazy load all track thumbnails
- Use browser native `loading="lazy"`
- Start loading slightly before visible (50px margin)
- Show skeleton placeholder while loading

**Smooth Scrolling:**
- Avoid layout shifts by reserving space for images
- Use fixed or minimum heights for cards
- Debounce scroll events if tracking position

---

## Edge Cases & Error States

### Empty States

**No Activity (New User):**
```html
<div class="empty-state">
  <div class="empty-icon">🎵</div>
  <h2>Your activity feed is empty</h2>
  <p>Follow friends and join networks to see their music activity here.</p>
  <button class="btn-primary">Discover Networks</button>
</div>
```

**No Results (Filtered):**
```html
<div class="empty-state">
  <div class="empty-icon">🔍</div>
  <h2>No activity found</h2>
  <p>Try adjusting your filters or following more users.</p>
  <button class="btn-secondary" onclick={resetFilters}>Clear Filters</button>
</div>
```

### Error States

**Failed to Load:**
```html
<div class="error-state">
  <div class="error-icon">⚠️</div>
  <h2>Failed to load activity feed</h2>
  <p>Check your connection and try again.</p>
  <button class="btn-primary" onclick={retry}>Retry</button>
</div>
```

**Partial Load Failure:**
```html
<div class="error-banner">
  <span>⚠️ Some items couldn't be loaded.</span>
  <button onclick={retry}>Retry</button>
</div>
```

### Loading States

**Initial Load:**
```typescript
// Show skeleton cards
<For each={Array(10)}>
  {() => <ActivityCardSkeleton />}
</For>
```

**Load More:**
```html
<div class="loading-more">
  <div class="spinner"></div>
  <span>Loading more activity...</span>
</div>
```

---

## Design Phases

### Phase 1: Core Feed Design
**Focus:**
- Main feed layout and structure
- Track share card design (primary card type)
- Basic filtering UI
- Play/like/reply actions
- Loading and empty states

### Phase 2: Additional Card Types
**Focus:**
- Conversation card design
- Interaction card design (likes/recasts)
- Network event card design
- Enhanced filtering UI
- Status indicators

### Phase 3: Polish & Details
**Focus:**
- Refined animations and transitions
- Mobile optimizations and gestures
- Keyboard navigation
- Accessibility improvements
- Edge case handling

---

## Testing Checklist

### Functional Testing
- [ ] Activity feed loads correctly
- [ ] Filters work (all, following, networks, trending)
- [ ] Play track from feed
- [ ] Like/reply/recast actions update correctly
- [ ] Infinite scroll loads more items
- [ ] Real-time updates appear
- [ ] Links to profiles/threads work
- [ ] Empty states display properly
- [ ] Error states display properly

### Visual/UX Testing
- [ ] Layout matches design specs
- [ ] Typography sizes correct
- [ ] Colors match design system
- [ ] Animations smooth (60fps)
- [ ] Hover states work
- [ ] Focus states visible
- [ ] Playing state highlights correctly
- [ ] Unread indicators visible

### Responsive Testing
- [ ] Mobile (375px): Layout adapts
- [ ] Tablet (768px): Optimal spacing
- [ ] Desktop (1024px): Full features
- [ ] Large desktop (1440px): Not too wide
- [ ] Touch targets adequate (mobile)
- [ ] Swipe gestures work (mobile)

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announcements correct
- [ ] Focus visible on all interactive elements
- [ ] Color contrast meets WCAG AA
- [ ] Alt text on all images
- [ ] ARIA labels on interactive elements

### Performance Testing
- [ ] Initial load < 2s
- [ ] Smooth scrolling (no jank)
- [ ] Images lazy load
- [ ] Virtual scrolling works (100+ items)
- [ ] No memory leaks
- [ ] Real-time updates don't block UI

---

## Design System Integration

### Reusable Components from Existing Codebase

The Activity Page should leverage existing Jamzy components for consistency:

**Track Display:**
- Reuse track card patterns from Library
- Same thumbnail size and layout conventions
- Consistent play button styling

**Social Actions:**
- Like/reply/recast buttons (existing patterns)
- Engagement metrics display
- User avatars and profile links

**Common Elements:**
- Button styles
- Loading skeletons
- Typography scales
- Color system

### New Patterns This Page Introduces

**Activity Stream Layout:**
- First use of chronological feed in Jamzy
- Establishes pattern for future social features
- Card-based list with varied content types

**Status Indicators:**
- Live/active status badges
- Unread indicators
- Update timestamps

---

## Design Principles Summary

### Critical Success Factors

1. **Scannable**: Users should quickly understand what's happening
2. **Social Context**: Always clear who did what and why
3. **Discoverable**: Easy to find new music and jump into conversations
4. **Consistent**: Matches existing Jamzy aesthetic and patterns

### Things to Avoid

- Over-complex filtering UI
- Too many animation effects
- Losing mobile experience focus
- Generic social feed patterns (make it music-specific)

### Core Principles

✓ **Simple solutions** - Chronological feed, clear actions
✓ **Information dense** - Show relevant context without clutter
✓ **Retro aesthetic** - Cyberpunk terminal vibes
✓ **Social first** - Human connection over algorithms

---

**End of Design Plan**

This plan provides comprehensive guidance for implementing the Activity Page while maintaining Jamzy's unique aesthetic and social-first philosophy. All specifications are agent-ready and can be implemented directly by following the detailed component structures, CSS specifications, and code examples provided.
