# TASK-614: Mini-App Card Design Unification

## Design Plan: Terminal Aesthetic System for All Cards

**Status**: Ready for Implementation
**Created**: 2025-10-07
**Design Agent**: zan (zen-design-master)

---

## Executive Summary

The mini-app currently has visual inconsistency between card components. Activity cards (TrackShareActivity, ReplyActivity, LikesActivity) use a distinctive terminal/ASCII art aesthetic with box-drawing characters that creates a cohesive retro computing vibe. However, TrackCard variants (CompactTrackCard, HeroTrackCard, RowTrackCard) and ThreadCard use different modern design patterns, breaking the visual language.

**Goal**: Unify all card designs to follow the terminal-style aesthetic, creating a cohesive design system that feels like a retro computing interface with cyberpunk energy.

---

## Design Analysis

### Current State Assessment

#### Activity Cards (Reference Design) ✅
**Location**: `/mini-app/src/components/activity/`

**Strengths**:
- Strong terminal aesthetic with box-drawing characters (╭─, │, ├─, ╰─)
- Packet ID headers (0x{id}) establish cyberpunk data transmission metaphor
- Consistent metadata format with >> arrows and usernames
- Terminal-style content blocks with proper spacing
- Bracketed action buttons [▶ PLAY], [❤ N], [💬 N]
- ASCII thumbnail borders (┌─┐, └─┘)
- Color-coded by activity type (share: blue, reply: cyan, like: green)

**Pattern Elements**:
```
╭─────────────────────────────────────┬──[0x{id}]─╮
│ >> @username shared a track • 2h              │
├─────────────────────────────────────────────┤
│ ┌─┐                                          │
│ │IMG│ "Track Title" [SRC: YOUTUBE]           │
│ └─┘  by Artist Name                          │
├─────────────────────────────────────────────┤
│ [❤ 12] [💬 5] [↻ 3]          [▶ PLAY]        │
╰─────────────────────────────────────────────╯
```

#### ThreadCard (Partially Aligned) ⚠️
**Location**: `/mini-app/src/components/common/TrackCard/NEW/ThreadCard.tsx`

**Strengths**:
- Already uses box-drawing characters
- Terminal-style borders implemented
- Follows activity card structure

**Issues**:
- Missing packet ID header (uses generic "Thread #{id}" instead)
- Color scheme differs slightly
- Could better match activity card spacing

**Current Pattern**:
```
╭─ Thread #1234 ─────────────────────────────╮
│ @avatar @username · 2h                      │
├─────────────────────────────────────────────┤
│ Thread text content here...                 │
├─────────────────────────────────────────────┤
│ [Track preview section]                     │
├─────────────────────────────────────────────┤
│ 💬 5 • ❤ 12                                  │
╰─────────────────────────────────────────────╯
```

#### TrackCard Variants (Needs Redesign) ❌
**Location**: `/mini-app/src/components/common/TrackCard/NEW/`

**CompactTrackCard**:
- Modern rounded corners (8px border-radius)
- Gradient overlays and smooth shadows
- Standard button UI (rounded play button)
- No terminal aesthetic
- Dimensions: 156px × 200px (mobile)

**HeroTrackCard**:
- Modern overlay design
- Gradient text overlays
- Standard social stats row
- Platform badges (emoji-based)
- Focus on large album art

**RowTrackCard**:
- Modern list-style layout
- Horizontal thumbnail + info layout
- Standard button styles
- Clean, minimal aesthetic

---

## Unified Terminal Design System

### Core Design Principles

1. **Terminal Computing Metaphor**: Every card is a data packet being transmitted through a cyberpunk network
2. **Box-Drawing Consistency**: All cards use the same ASCII border characters
3. **Color-Coded by Type**: Different card types get different accent colors
4. **Data Density**: Embrace terminal-style information density while maintaining readability
5. **Retro-Futuristic Balance**: 90s terminal meets neon cyberpunk

### Design Token System

#### Box-Drawing Characters
```
Corners:  ╭ ╮ ╰ ╯
Edges:    ─ │
T-joints: ├ ┤ ┬ ┴
Cross:    ┼
Arrows:   → ← ↑ ↓ ╰─→
Thumb:    ┌ ┐ └ ┘ (for nested elements like thumbnails)
```

#### Color System (from terminal.css)
```css
/* Base Colors */
--terminal-bg: #0a0a0a;
--terminal-text: #e0e0e0;
--terminal-dim: #808080;
--terminal-muted: #404040;
--terminal-white: #ffffff;

/* Neon Accents */
--neon-green: #00ff41;    /* Success, play states, likes */
--neon-cyan: #00ffff;     /* Links, interactive elements */
--neon-blue: #0080ff;     /* Shares, primary actions */
--neon-magenta: #ff00ff;  /* Users, highlights */
--neon-yellow: #ffff00;   /* Packet IDs, warnings */

/* Card Type Colors */
--activity-share: var(--neon-blue);
--activity-reply: var(--neon-cyan);
--activity-like: var(--neon-green);
--card-track: var(--neon-magenta);
--card-thread: var(--neon-cyan);
```

#### Typography System
```css
/* Font */
--font-terminal: 'JetBrains Mono', 'SF Mono', 'Monaco', monospace;

/* Sizes */
--text-header: 10px;    /* ASCII borders */
--text-meta: 11px;      /* Metadata lines */
--text-content: 13px;   /* Track titles */
--text-artist: 12px;    /* Artist names, usernames */
--text-label: 10px;     /* Labels, timestamps */
--text-button: 11px;    /* Action buttons */
```

#### Spacing System
```css
/* Padding/Margins */
--space-border: 6-8px 12px;      /* Border line padding */
--space-content: 10-12px 14px;   /* Content sections */
--space-actions: 8px 12px;       /* Action rows */
--space-gap-small: 4px;          /* Between elements */
--space-gap-medium: 8px;         /* Between sections */
--space-gap-large: 12px;         /* Between cards */
```

---

## Card-Specific Design Specifications

### 1. CompactTrackCard Redesign

**Purpose**: Grid view track display (library, search results)
**Current Size**: 156px × 200px (mobile), 180px × 220px (tablet), 200px × 240px (desktop)

**Terminal Aesthetic Transformation**:

```
╭─[0x{id}]──────╮
│ ┌──────────┐  │
│ │          │  │
│ │  ALBUM   │  │
│ │   ART    │  │
│ │          │  │
│ └──────────┘  │
├──────────────┤
│ "Track Title"│
│ by Artist    │
├──────────────┤
│[▶] [SRC: YT] │
╰──────────────╯
```

**Implementation Details**:

**Structure**:
1. **Header**: Packet ID with short ID (0x{last-4-digits})
2. **Image Container**: ASCII borders around album art
3. **Divider**: Box-drawing character line
4. **Info Section**: Track title (quoted) + artist (with "by" label)
5. **Divider**: Box-drawing character line
6. **Footer**: Play button + platform badge

**Dimensions** (maintain existing responsive breakpoints):
- Mobile: 156px × 220px (increased height for terminal UI)
- Tablet: 180px × 240px
- Desktop: 200px × 260px

**CSS Architecture**:
```css
.compact-card-terminal {
  width: 156px;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-muted);
  font-family: var(--font-terminal);
  transition: border-color 200ms ease;
}

.compact-card-terminal:hover {
  border-color: var(--neon-magenta);
  box-shadow: 0 0 4px rgba(255, 0, 255, 0.15);
}

.compact-card-terminal--playing {
  border-color: var(--neon-green);
  box-shadow: 0 0 8px rgba(0, 255, 65, 0.3);
}

/* Header with packet ID */
.compact-card-terminal__header {
  padding: 6px 8px;
  color: var(--neon-yellow);
  font-size: 10px;
  text-align: center;
  letter-spacing: 0.5px;
}

/* Image container with ASCII borders */
.compact-card-terminal__image-wrapper {
  padding: 8px;
}

.compact-card-terminal__image-border {
  border: 1px solid var(--terminal-dim);
  padding: 2px;
}

.compact-card-terminal__image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

/* Dividers */
.compact-card-terminal__divider {
  padding: 0 8px;
  color: var(--terminal-muted);
  font-size: 10px;
  line-height: 1;
}

/* Info section */
.compact-card-terminal__info {
  padding: 8px;
}

.compact-card-terminal__title {
  color: var(--terminal-white);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact-card-terminal__artist-line {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  font-size: 11px;
}

.compact-card-terminal__artist-label {
  color: var(--terminal-dim);
}

.compact-card-terminal__artist {
  color: var(--neon-cyan);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Footer actions */
.compact-card-terminal__footer {
  padding: 6px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.compact-card-terminal__play-btn {
  background: transparent;
  border: 1px solid var(--neon-green);
  color: var(--neon-green);
  padding: 4px 8px;
  font-family: var(--font-terminal);
  font-size: 10px;
  cursor: pointer;
  text-shadow: 0 0 2px var(--neon-green);
}

.compact-card-terminal__platform {
  color: var(--terminal-dim);
  font-size: 10px;
  letter-spacing: 0.5px;
}
```

**Interaction States**:
- **Hover**: Border changes to neon-magenta, subtle glow
- **Playing**: Border changes to neon-green with pulsing glow
- **Active/Touch**: Scale down to 0.98, no transform

---

### 2. HeroTrackCard Redesign

**Purpose**: Featured track display (top of feed, thread starters)
**Current Layout**: Large album art with text overlay

**Terminal Aesthetic Transformation**:

```
╭─────────────────────────────────────────────────────────┬──[0x{id}]─╮
│ >> @username shared a track • 2h                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────┐            │
│  │                                                     │            │
│  │                 ALBUM ART                           │            │
│  │               (LARGER SIZE)                         │            │
│  │                                                     │            │
│  └────────────────────────────────────────────────────┘            │
│                                                                     │
│  "Track Title" [SRC: SPOTIFY]                                       │
│  by Artist Name                                                     │
│                                                                     │
├──────────────────────────────────────────────────────────────────┤
│ >> COMMENT: "User's comment about the track..."                    │
├──────────────────────────────────────────────────────────────────┤
│ [❤ 42] [💬 15] [↻ 8]                             [▶ PLAY]          │
╰──────────────────────────────────────────────────────────────────╯
```

**Implementation Details**:

**Structure**:
1. **Header**: Packet ID + social context (who shared + timestamp)
2. **Divider**
3. **Content Section**: Large album art with ASCII borders + track info below
4. **Optional Comment Section**: If comment exists
5. **Divider**
6. **Actions Row**: Social stats + play button

**Dimensions**:
- Width: 100% (max-width: 640px on desktop)
- Height: Auto (based on content)
- Album Art: 100% width, 1:1 aspect ratio

**CSS Architecture**:
```css
.hero-card-terminal {
  width: 100%;
  background: var(--terminal-bg);
  border: 1px solid var(--neon-magenta);
  font-family: var(--font-terminal);
  margin-bottom: 16px;
  box-shadow: 0 0 4px rgba(255, 0, 255, 0.1);
}

.hero-card-terminal--playing {
  border-color: var(--neon-green);
  box-shadow: 0 0 8px rgba(0, 255, 65, 0.3);
  animation: playing-pulse 2s ease-in-out infinite;
}

/* Header (matches activity cards) */
.hero-card-terminal__header {
  padding: 8px 12px;
  color: var(--neon-magenta);
  font-size: 11px;
  background: rgba(255, 0, 255, 0.03);
}

/* Meta line (matches activity cards) */
.hero-card-terminal__meta {
  padding: 4px 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.hero-card-terminal__meta-arrow {
  color: var(--neon-green);
  margin-right: 4px;
}

.hero-card-terminal__username {
  color: var(--neon-magenta);
  font-weight: 600;
}

/* Content section with album art */
.hero-card-terminal__content {
  padding: 16px 12px;
}

.hero-card-terminal__image-container {
  border: 1px solid var(--terminal-dim);
  padding: 4px;
  margin-bottom: 12px;
}

.hero-card-terminal__image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
  cursor: pointer;
}

/* Track info below image */
.hero-card-terminal__track-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-card-terminal__title-line {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.hero-card-terminal__title {
  color: var(--terminal-white);
  font-size: 14px;
  font-weight: 700;
}

.hero-card-terminal__source {
  color: var(--terminal-dim);
  font-size: 9px;
  letter-spacing: 0.5px;
}

.hero-card-terminal__artist-line {
  display: flex;
  gap: 4px;
  font-size: 12px;
}

/* Comment section (matches activity cards) */
.hero-card-terminal__comment {
  padding: 4px 12px;
  display: flex;
  gap: 4px;
}

/* Actions (matches activity cards exactly) */
.hero-card-terminal__actions {
  padding: 8px 12px;
  display: flex;
  gap: 8px;
}

.hero-card-terminal__social-row {
  display: flex;
  gap: 12px;
  flex: 1;
  align-items: center;
}

/* Reuse terminal-action-btn and terminal-play-btn from terminal.css */
```

---

### 3. RowTrackCard Redesign

**Purpose**: List view track display (feeds, library lists)
**Current Layout**: Horizontal row with thumbnail, info, and social actions

**Terminal Aesthetic Transformation**:

```
╭─────────────────────────────────────────────────────────┬──[0x{id}]─╮
│ ┌─┐ "Track Title" [SRC: YT]                                        │
│ │█│ by Artist Name                                                 │
│ └─┘ shared by @username • 2h                                       │
│     [❤ 12] [💬 5]                                   [▶ PLAY]        │
├──────────────────────────────────────────────────────────────────┤
│ >> COMMENT: "Optional comment text..."                             │
╰──────────────────────────────────────────────────────────────────╯
```

**Alternative Compact Layout** (when space is tight):
```
╭────────────────────────────────────────┬──[0x{id}]─╮
│ ┌┐ "Track Title" by Artist             │
│ └┘ @user • 2h  [❤12] [💬5]    [▶PLAY]  │
╰────────────────────────────────────────────────────╯
```

**Implementation Details**:

**Structure**:
1. **Header + Content Combined**: Packet ID in top-right corner
2. **Main Row**: Thumbnail (with ASCII borders) + multi-line track info + actions
3. **Optional Comment Section**: If comment exists (collapsible)

**Dimensions**:
- Width: 100%
- Min Height: 80px (without comment)
- Thumbnail: 48px × 48px

**CSS Architecture**:
```css
.row-card-terminal {
  width: 100%;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-muted);
  font-family: var(--font-terminal);
  margin-bottom: 12px;
  transition: border-color 200ms ease;
}

.row-card-terminal:hover {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 4px rgba(0, 255, 255, 0.15);
}

.row-card-terminal--playing {
  border-color: var(--neon-green);
  box-shadow: 0 0 8px rgba(0, 255, 65, 0.3);
}

/* Main content area */
.row-card-terminal__main {
  padding: 10px 12px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: start;
  position: relative;
}

/* Packet ID in corner */
.row-card-terminal__packet-id {
  position: absolute;
  top: 6px;
  right: 12px;
  color: var(--neon-yellow);
  font-size: 9px;
  pointer-events: none;
}

/* Thumbnail with ASCII borders */
.row-card-terminal__thumbnail-wrapper {
  font-size: 8px;
  line-height: 1;
  color: var(--terminal-dim);
}

.row-card-terminal__thumbnail-border-top {
  letter-spacing: -1px;
}

.row-card-terminal__thumbnail {
  width: 48px;
  height: 48px;
  object-fit: cover;
  display: block;
}

/* Info column */
.row-card-terminal__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding-right: 60px; /* Space for packet ID */
}

.row-card-terminal__title-line {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}

.row-card-terminal__title {
  color: var(--terminal-white);
  font-size: 13px;
  font-weight: 600;
}

.row-card-terminal__source {
  color: var(--terminal-dim);
  font-size: 9px;
}

.row-card-terminal__artist-line {
  display: flex;
  gap: 4px;
  font-size: 11px;
}

.row-card-terminal__context-line {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 10px;
  color: var(--terminal-dim);
}

.row-card-terminal__username {
  color: var(--neon-magenta);
  font-weight: 600;
}

/* Social actions inline */
.row-card-terminal__social-inline {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

/* Actions column (play button) */
.row-card-terminal__actions {
  display: flex;
  align-items: center;
}

/* Comment section (expandable) */
.row-card-terminal__comment {
  border-top: 1px solid var(--terminal-muted);
  padding: 8px 12px;
  display: flex;
  gap: 4px;
}

.row-card-terminal__comment-collapsed {
  max-height: 40px;
  overflow: hidden;
}
```

---

### 4. ThreadCard Refinement

**Purpose**: Thread/conversation display
**Current Status**: Already uses terminal aesthetic, needs minor alignment

**Refinements Needed**:

1. **Update Header to Match Activity Cards**:
   - Change from `╭─ Thread #{id}` to `╭─────────┬──[0x{id}]─╮`
   - Match the packet ID format exactly

2. **Align Color Scheme**:
   - Use `--neon-cyan` as primary accent (thread type)
   - Match hover states with other cards

3. **Standardize Spacing**:
   - Ensure padding matches activity cards (6-8px for borders, 10-12px for content)

**Updated Header Pattern**:
```
╭───────────────────────────────────────┬──[0x{id}]─╮
│ @avatar @username • 2h                            │
├────────────────────────────────────────────────┤
│ Thread text content...                            │
├────────────────────────────────────────────────┤
│ [Track preview if present]                        │
├────────────────────────────────────────────────┤
│ 💬 5 • ❤ 12                                        │
╰────────────────────────────────────────────────╯
```

**CSS Updates**:
```css
/* Update header to match activity cards */
.thread-card-header {
  padding: 8px 12px;  /* Match activity card padding */
  color: var(--neon-cyan);  /* Thread type color */
  background: rgba(0, 255, 255, 0.03);
  font-size: 11px;
  text-shadow: 0 0 2px var(--neon-cyan);
}

/* Ensure packet ID matches activity pattern */
.thread-card-packet-id {
  color: var(--neon-yellow);
  font-size: 10px;
}

/* Align hover state */
.terminal-thread-card:hover {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 4px rgba(0, 255, 255, 0.15);
}
```

---

## Implementation Strategy

### Phase 1: Establish Shared Styles
**Goal**: Create reusable terminal card styles

**Tasks**:
1. Create `/mini-app/src/styles/terminal-cards.css` with shared components
2. Define card base class (`.terminal-card-base`)
3. Define reusable elements:
   - Header patterns
   - Border patterns
   - Dividers
   - Action buttons
   - Thumbnail wrappers
   - Social stats

**Shared CSS Structure**:
```css
/* terminal-cards.css */

/* Base card styling */
.terminal-card-base {
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-muted);
  font-family: var(--font-terminal);
  font-size: 11px;
  line-height: 1.6;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

/* Card type variations */
.terminal-card--share {
  border-color: var(--activity-share);
  box-shadow: 0 0 4px rgba(0, 128, 255, 0.1);
}

.terminal-card--track {
  border-color: var(--terminal-muted);
}

.terminal-card--track:hover {
  border-color: var(--neon-magenta);
  box-shadow: 0 0 4px rgba(255, 0, 255, 0.15);
}

.terminal-card--thread {
  border-color: var(--terminal-muted);
}

.terminal-card--thread:hover {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 4px rgba(0, 255, 255, 0.15);
}

/* Playing state (universal) */
.terminal-card--playing {
  border-color: var(--neon-green) !important;
  box-shadow: 0 0 8px rgba(0, 255, 65, 0.3) !important;
  animation: terminal-card-playing-pulse 2s ease-in-out infinite;
}

@keyframes terminal-card-playing-pulse {
  0%, 100% {
    box-shadow: 0 0 4px var(--neon-green);
  }
  50% {
    box-shadow: 0 0 12px rgba(0, 255, 65, 0.5);
  }
}

/* Shared header pattern */
.terminal-card__header {
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  position: relative;
}

/* Packet ID (consistent across all cards) */
.terminal-card__packet-id {
  color: var(--neon-yellow);
  font-size: 10px;
  text-shadow: 0 0 2px var(--neon-yellow);
}

/* Divider (universal) */
.terminal-card__divider {
  padding: 0 12px;
  color: var(--terminal-muted);
  font-size: 10px;
  font-weight: 400;
  line-height: 1;
}

/* Border character (universal) */
.terminal-card__border-v {
  color: var(--terminal-muted);
  user-select: none;
}

/* Thumbnail ASCII wrapper (reusable) */
.terminal-card__thumbnail-wrapper {
  font-size: 8px;
  line-height: 1;
  color: var(--terminal-dim);
  flex-shrink: 0;
}

.terminal-card__thumbnail-border {
  letter-spacing: -1px;
}

/* Action buttons (universal style) */
.terminal-card__action-btn {
  background: transparent;
  border: none;
  color: var(--terminal-dim);
  font-family: var(--font-terminal);
  font-size: 11px;
  cursor: pointer;
  padding: 4px 0;
  transition: all 200ms ease;
  display: flex;
  align-items: center;
  gap: 2px;
}

.terminal-card__action-btn:hover {
  color: var(--neon-cyan);
  text-shadow: 0 0 2px var(--neon-cyan);
}

/* Play button (universal style) */
.terminal-card__play-btn {
  background: transparent;
  border: 1px solid var(--neon-green);
  color: var(--neon-green);
  font-family: var(--font-terminal);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  padding: 6px 12px;
  transition: all 200ms ease;
  text-shadow: 0 0 2px var(--neon-green);
  box-shadow: 0 0 4px rgba(0, 255, 65, 0.1);
}

.terminal-card__play-btn:hover {
  background: rgba(0, 255, 65, 0.05);
  box-shadow: 0 0 6px rgba(0, 255, 65, 0.15);
}

/* Username style (universal) */
.terminal-card__username {
  color: var(--neon-magenta);
  font-weight: 600;
  text-shadow: 0 0 2px var(--neon-magenta);
}

/* Artist style (universal) */
.terminal-card__artist {
  color: var(--neon-cyan);
  font-weight: 600;
}

/* Source badge (universal) */
.terminal-card__source {
  color: var(--terminal-dim);
  font-size: 9px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
```

### Phase 2: Refactor CompactTrackCard
**Goal**: Transform compact card to terminal aesthetic

**Tasks**:
1. Replace `compactCard.css` structure with terminal design
2. Update JSX to use box-drawing characters
3. Add packet ID header
4. Convert modern UI elements to terminal style
5. Test responsive breakpoints
6. Verify animations work with terminal aesthetic

**Implementation Notes**:
- Keep existing props interface
- Maintain responsive dimensions (just adjust for terminal UI height)
- Replace modern hover effects with terminal glow
- Convert play button to bracketed terminal style

### Phase 3: Refactor HeroTrackCard
**Goal**: Transform hero card to terminal aesthetic

**Tasks**:
1. Replace `heroCard.css` structure with terminal design
2. Update JSX to match activity card pattern
3. Add full header with social context
4. Add ASCII borders around album art
5. Convert overlay UI to terminal sections
6. Add optional comment section
7. Test with and without comments

**Implementation Notes**:
- Most significant visual change
- Loses gradient overlay aesthetic in favor of structured terminal sections
- Album art remains large but gets ASCII frame
- Info moves below image instead of overlay

### Phase 4: Refactor RowTrackCard
**Goal**: Transform row card to terminal aesthetic

**Tasks**:
1. Replace `rowCard.css` structure with terminal design
2. Update JSX to use box-drawing characters
3. Add packet ID in corner
4. Convert horizontal layout to terminal grid
5. Add ASCII thumbnail borders
6. Restructure comment section as separate terminal row
7. Test with and without comments

**Implementation Notes**:
- Maintains horizontal layout but adds terminal framing
- Comment section becomes bordered sub-section
- Social actions move inline with context

### Phase 5: Refine ThreadCard
**Goal**: Align ThreadCard with unified system

**Tasks**:
1. Update header pattern to match activity cards
2. Adjust packet ID format
3. Align color scheme
4. Verify spacing consistency
5. Test hover states

**Implementation Notes**:
- Minimal changes needed
- Already 80% aligned with target aesthetic
- Focus on consistency details

### Phase 6: Testing & Polish
**Goal**: Ensure cohesive system across all contexts

**Tasks**:
1. Visual regression testing across all card types
2. Test responsive behavior at all breakpoints
3. Verify accessibility (keyboard navigation, screen readers)
4. Test dark mode only (terminal aesthetic is dark-first)
5. Performance testing (animations, rendering)
6. Cross-browser testing
7. Test with real data (long titles, missing images, etc.)

---

## Technical Implementation Guide

### File Structure
```
/mini-app/src/
  /styles/
    terminal.css                    (existing - activity page styles)
    terminal-cards.css              (NEW - shared card components)
  /components/
    /activity/                      (existing - reference implementation)
      TrackShareActivity.tsx
      ReplyActivity.tsx
      LikesActivity.tsx
    /common/TrackCard/
      /NEW/
        CompactTrackCard.tsx        (REFACTOR)
        compactCard.css             (REFACTOR)
        HeroTrackCard.tsx           (REFACTOR)
        heroCard.css                (REFACTOR)
        RowTrackCard.tsx            (REFACTOR)
        rowCard.css                 (REFACTOR)
        ThreadCard.tsx              (REFINE)
        threadCard.css              (REFINE)
```

### Import Strategy
Each card component should import:
```typescript
import '../../../../styles/terminal.css';        // Global terminal styles
import '../../../../styles/terminal-cards.css';  // Shared card components
import './[cardType].css';                       // Card-specific overrides
```

### Component Prop Interfaces
**Keep existing interfaces unchanged** - Only update JSX and CSS

CompactTrackCard, HeroTrackCard, RowTrackCard all maintain their current prop signatures. This is a purely visual redesign with no API changes.

### Responsive Breakpoints
Follow existing pattern from terminal.css:
```css
/* Mobile first (default) */
@media (max-width: 640px) {
  /* Optimized for mobile */
}

/* Tablet and up */
@media (min-width: 768px) {
  /* Wider layouts, more breathing room */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Max widths, optimal readability */
}
```

### Animation Guidelines
Use existing terminal animations:
- Playing state: `playing-pulse` animation (from terminal.css)
- Hover: Border color transition (200ms ease)
- Active/Touch: Scale down slightly (0.98-0.99)
- Loading: Use terminal-style shimmer (no spinners)

### Accessibility Checklist
- [ ] All interactive elements have min 44px touch targets
- [ ] Border characters marked with `user-select: none`
- [ ] Proper ARIA labels on all buttons
- [ ] Focus states use neon-cyan outline
- [ ] Keyboard navigation works for all actions
- [ ] Screen reader announces card type and content
- [ ] Reduced motion support (disable animations)

---

## Design Rationale

### Why Terminal Aesthetic?

**1. Cohesive Brand Identity**
The activity page's terminal aesthetic has proven successful and distinctive. It immediately communicates Jamzy's retro-futuristic positioning. Extending this to all cards creates a unified visual language.

**2. Information Density with Character**
Terminal interfaces excel at displaying dense information in structured, scannable ways. The box-drawing characters provide visual hierarchy without relying on excessive spacing or decorative elements.

**3. Retro Computing Meets Music Discovery**
The terminal metaphor (data packets, network nodes, transmissions) pairs perfectly with Jamzy's social music discovery concept - music as data flowing through a social network.

**4. Technical Authenticity**
Using actual ASCII box-drawing characters rather than CSS borders creates authentic terminal aesthetics that resonate with developers and tech-savvy users.

**5. Performance Benefits**
Terminal UI uses simple borders and minimal effects, resulting in excellent performance. No heavy gradients, shadows, or complex animations.

### Design Trade-offs

**What We Gain**:
- ✅ Unified visual identity across all card types
- ✅ Distinctive retro-futuristic aesthetic
- ✅ Better information hierarchy
- ✅ Stronger brand recognition
- ✅ Performance optimization
- ✅ Accessibility improvements (higher contrast)

**What We Adjust**:
- ⚠️ HeroTrackCard loses gradient overlay for structured sections
- ⚠️ CompactTrackCard slightly taller (need space for terminal UI)
- ⚠️ RowTrackCard loses some horizontal compactness
- ⚠️ Modern rounded corners replaced with sharp angles

**Mitigation Strategies**:
- Responsive adjustments ensure cards work at all sizes
- Terminal aesthetics are kept lightweight and performant
- Color coding maintains visual variety within the system
- Animation and glow effects add polish without breaking the aesthetic

### Color Strategy

**Activity Types** (existing):
- Share: Blue (`--neon-blue`)
- Reply: Cyan (`--neon-cyan`)
- Like: Green (`--neon-green`)

**New Card Types**:
- Track Cards: Magenta (`--neon-magenta`) - primary track color
- Thread Cards: Cyan (`--neon-cyan`) - conversation color

**Universal Elements**:
- Packet IDs: Yellow (`--neon-yellow`) - always consistent
- Play Buttons: Green (`--neon-green`) - active/playing state
- Usernames: Magenta (`--neon-magenta`) - social identity
- Artists: Cyan (`--neon-cyan`) - metadata/links

This creates a coherent color language where users can quickly identify card types and element meanings.

---

## Success Metrics

### Visual Consistency
- [ ] All cards use same box-drawing character set
- [ ] All cards follow same header pattern
- [ ] All cards use consistent spacing system
- [ ] All cards share action button styles
- [ ] Playing state looks identical across all cards

### User Experience
- [ ] Cards load without layout shift
- [ ] Hover states feel responsive (<100ms)
- [ ] All interactive elements have clear affordances
- [ ] Text remains readable at all sizes
- [ ] No content overflow or truncation issues

### Technical Quality
- [ ] CSS follows existing patterns from terminal.css
- [ ] No duplicate styles across components
- [ ] Shared styles properly extracted to terminal-cards.css
- [ ] Responsive breakpoints work smoothly
- [ ] Animations perform at 60fps
- [ ] Component props remain unchanged

### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation works perfectly
- [ ] Screen reader testing passes
- [ ] Color contrast ratios meet standards
- [ ] Touch targets meet 44px minimum
- [ ] Reduced motion preferences respected

---

## Future Considerations

### Expandability
This design system should accommodate:
- New card types (playlist cards, artist cards, etc.)
- Different sizes (mini, compact, standard, expanded)
- Additional interactive states (loading, error, success)
- Theme variations (if needed beyond dark terminal)

### Component Library Extraction
Consider extracting terminal UI primitives:
- `<TerminalCard>` wrapper component
- `<TerminalHeader>` with packet ID
- `<TerminalDivider>` component
- `<TerminalThumbnail>` with ASCII borders
- `<TerminalActionButton>` and `<TerminalPlayButton>`

This would make future card creation faster and more consistent.

### Animation Enhancements
Potential additions that maintain terminal aesthetic:
- "Transmission" effect when cards appear (scan-line reveal)
- "Data corruption" glitch effect on errors
- "Signal strength" indicator for playback quality
- Typing animation for text content

---

## Conclusion

This design plan transforms Jamzy's mini-app cards into a unified terminal aesthetic system that builds on the successful activity page design. By applying consistent box-drawing characters, color coding, and terminal UI patterns across all card types, we create a cohesive retro-futuristic experience that distinguishes Jamzy from standard music apps.

The implementation is straightforward: establish shared styles, refactor each card component systematically, and test thoroughly. The result will be a visually striking, highly performant, and deeply cohesive design system that users will immediately recognize as "Jamzy."

**Ready for Implementation**: This plan provides exact specifications, CSS architecture, and step-by-step guidance for developers to execute the redesign confidently and consistently.

---

**Document Version**: 1.0
**Last Updated**: 2025-10-07
**Agent**: zan (zen-design-master)
**Status**: ✅ Ready for Development
