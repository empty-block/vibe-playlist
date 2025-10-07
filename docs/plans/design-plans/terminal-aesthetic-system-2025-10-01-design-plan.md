# Terminal/Cyberpunk Design System Extension
## Design Plan for Jamzy Mini-App

**Date:** 2025-10-01
**Status:** Ready for Implementation
**Scope:** Extend Activity Page terminal aesthetic to Home, Thread View, and Profile pages

---

## Executive Summary

This design plan extends the beloved terminal/cyberpunk aesthetic from the Activity page across the entire Jamzy mini-app while maintaining balance, usability, and performance. The core principle is **selective intensity** - using terminal styling strategically to create hierarchy and context rather than overwhelming every surface.

### Key Design Philosophy

1. **Context-Appropriate Intensity**: Activity page is most intense (live stream feed), other pages use lighter terminal treatment
2. **Hierarchy Through Style**: Different card types use varying levels of terminal decoration
3. **Mobile-First Balance**: Terminal ASCII borders simplified on small screens
4. **Performance Conscious**: CRT effects and scan lines used sparingly
5. **Usability First**: Readability and tap targets never compromised for aesthetics

---

## Design System Overview

### Terminal Styling Spectrum (Light → Heavy)

**Level 1: Terminal Accent** (Profile Page)
- Terminal font for headers only
- Minimal ASCII borders (simple lines)
- Colored text accents
- No scan lines or CRT effects
- Focus: Clean data display

**Level 2: Terminal UI** (Home/Threads Page)
- Terminal headers with command prompts
- Thread cards with light ASCII decoration
- Selective border colors by content type
- Light scan lines on page background only
- Focus: Browsing and discovery

**Level 3: Terminal Immersion** (Activity Page - Current)
- Full terminal styling on all elements
- Heavy ASCII borders with packet IDs
- Activity-type colored borders with glows
- Scan lines + CRT vignette on cards
- Focus: Live monitoring experience

**Level 4: Terminal Deep Dive** (Thread View Page)
- Thread conversation styling
- Nested reply indentation with terminal tree lines
- Depth-based color coding
- Terminal conversation threading
- Focus: Conversation depth

---

## Page-by-Page Design Specifications

### 1. HOME/THREADS PAGE (Level 2: Terminal UI)

**Conceptual Approach:**
Home is a feed browser - users scan for interesting threads. Design should feel like browsing a file system or BBS board. Terminal treatment is present but not overwhelming.

#### Page Structure

```
┌─[JAMZY::THREAD_BROWSER]─────[FILTER: HOT]─┐
│ user@jamzy : ~/threads $ list --sort=hot   │
└────────────────────────────────────────────┘
```

**Header Implementation:**
```css
/* Lighter terminal header than Activity */
.threads-terminal-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--terminal-bg);
  border-bottom: 1px solid var(--neon-magenta);  /* Magenta for threads */
  font-family: var(--font-terminal);
  font-size: 12px;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(224, 16, 224, 0.1);
}

.terminal-title-bar {
  color: var(--neon-magenta);
  text-shadow: 0 0 2px var(--neon-magenta);
}

.terminal-prompt-line {
  margin-top: 4px;
  color: var(--terminal-text);
}

.terminal-path {
  color: var(--neon-cyan);
}

.terminal-command {
  color: var(--terminal-white);
  margin-left: 8px;
}
```

**ThreadCard Terminal Styling:**

Cards should be lighter than Activity cards - just enough terminal flavor without full packet header treatment.

```
╭─ Thread #a4f2 ────────────────────────────╮
│ >> @username: What's your favorite...     │
├──────────────────────────────────────────┤
│  🎵 [Track Preview if present]            │
│     "Song Title" - Artist Name             │
├──────────────────────────────────────────┤
│  💬 24 replies • ❤ 12 likes • 2h          │
╰────────────────────────────────────────────╯
```

**CSS Implementation:**
```css
.terminal-thread-card {
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-muted);
  margin-bottom: 12px;
  font-family: var(--font-terminal);
  font-size: 11px;
  line-height: 1.6;
  position: relative;
  transition: border-color 200ms ease;
}

.terminal-thread-card:hover {
  border-color: var(--neon-magenta);
  box-shadow: 0 0 4px rgba(224, 16, 224, 0.15);
}

/* Top border - simpler than activity cards */
.thread-card-header {
  padding: 6px 12px;
  color: var(--terminal-dim);
  font-size: 10px;
  letter-spacing: 0.5px;
}

.thread-id {
  color: var(--neon-yellow);
  margin-left: 4px;
}

/* Thread text content */
.thread-card-content {
  padding: 8px 12px;
  color: var(--terminal-text);
  position: relative;
  z-index: 2;
}

.thread-text {
  color: var(--terminal-white);
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.thread-author {
  color: var(--neon-magenta);
  font-weight: 600;
}

/* Track preview (if present) */
.thread-track-preview {
  padding: 8px 12px;
  background: rgba(224, 16, 224, 0.03);
  border-top: 1px solid var(--terminal-muted);
  border-bottom: 1px solid var(--terminal-muted);
  display: flex;
  gap: 8px;
  align-items: center;
}

.thread-track-thumbnail {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
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
}

/* Footer stats */
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

.thread-timestamp {
  margin-left: auto;
  color: var(--terminal-muted);
  font-size: 10px;
}
```

**Background Effects:**
```css
/* Light scan lines on page background only (not on cards) */
.threads-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(224, 16, 224, 0.015) 0px,
    transparent 1px,
    transparent 2px,
    rgba(224, 16, 224, 0.015) 3px
  );
  pointer-events: none;
  z-index: 1;
}

/* Subtle vignette */
.threads-page::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    transparent 80%,
    rgba(0, 0, 0, 0.15) 100%
  );
  pointer-events: none;
  z-index: 1;
}
```

**Filter Bar Styling:**
```css
.thread-filter-bar {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 12px;
  font-family: var(--font-terminal);
}

.filter-btn {
  background: transparent;
  border: 1px solid var(--terminal-muted);
  color: var(--terminal-text);
  padding: 6px 12px;
  font-size: 11px;
  font-family: var(--font-terminal);
  cursor: pointer;
  transition: all 200ms ease;
}

.filter-btn:hover {
  border-color: var(--neon-magenta);
  color: var(--neon-magenta);
  text-shadow: 0 0 2px var(--neon-magenta);
}

.filter-btn--active {
  background: rgba(224, 16, 224, 0.1);
  border-color: var(--neon-magenta);
  color: var(--neon-magenta);
  box-shadow: 0 0 4px rgba(224, 16, 224, 0.2);
}

.filter-btn::before {
  content: '[';
  margin-right: 4px;
}

.filter-btn::after {
  content: ']';
  margin-left: 4px;
}
```

**Animation:**
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

.terminal-thread-card {
  animation: thread-stream-in 300ms ease-out;
}

/* Stagger delays */
.terminal-thread-card:nth-child(1) { animation-delay: 0ms; }
.terminal-thread-card:nth-child(2) { animation-delay: 60ms; }
.terminal-thread-card:nth-child(3) { animation-delay: 120ms; }
.terminal-thread-card:nth-child(4) { animation-delay: 180ms; }
.terminal-thread-card:nth-child(5) { animation-delay: 240ms; }
```

---

### 2. THREAD VIEW PAGE (Level 4: Terminal Deep Dive)

**Conceptual Approach:**
Thread view is conversation depth - showing parent thread and nested replies. Design should feel like traversing a conversation tree with clear depth indicators.

#### Page Structure

```
┌─[JAMZY::THREAD_VIEW]───────[ID: #a4f2]────┐
│ user@jamzy : ~/threads/a4f2 $ cat thread  │
└─────────────────────────────────────────────┘
```

**Header Implementation:**
```css
.thread-view-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--terminal-bg);
  border-bottom: 1px solid var(--neon-cyan);
  font-family: var(--font-terminal);
  font-size: 12px;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(4, 202, 244, 0.1);
}

.thread-view-back-btn {
  background: transparent;
  border: 1px solid var(--neon-cyan);
  color: var(--neon-cyan);
  padding: 4px 12px;
  font-family: var(--font-terminal);
  font-size: 11px;
  cursor: pointer;
  margin-bottom: 8px;
}

.thread-view-back-btn:hover {
  background: rgba(4, 202, 244, 0.05);
  box-shadow: 0 0 4px rgba(4, 202, 244, 0.15);
}
```

**Original Thread Post Styling:**

The starter post should be prominent - full terminal treatment similar to Activity cards but with thread context.

```
╭─[THREAD_ROOT]──────────────────────┬──[#a4f2]─╮
│ >> @creator asked:                              │
│    "What's your favorite late night jazz?"      │
├──────────────────────────────────────────────────┤
│  [Track preview with full details]              │
├──────────────────────────────────────────────────┤
│  💬 24 replies • ❤ 12 likes • 2h • [REPLY]      │
╰──────────────────────────────────────────────────╯
```

**Reply Card Styling with Threading:**

Replies use tree-style indentation with terminal line characters to show conversation structure.

```
│
├─[REPLY]─────────────────────────┬──[@user1]─┐
│ >> @user1 replied:                           │
│    "Check this out!"                         │
├──────────────────────────────────────────────┤
│  [Track: "Song Title" - Artist]              │
├──────────────────────────────────────────────┤
│  ❤ 5 • 1h                                    │
╰──────────────────────────────────────────────╯
│
├─[REPLY]─────────────────────────┬──[@user2]─┐
│ >> @user2 replied:                           │
│    "Love this suggestion!"                   │
├──────────────────────────────────────────────┤
│  ❤ 3 • 45m                                   │
╰──────────────────────────────────────────────╯
```

**CSS Implementation:**
```css
/* Original post - prominent */
.thread-root-post {
  background: var(--terminal-bg);
  border: 1px solid var(--neon-cyan);
  box-shadow: 0 0 6px rgba(4, 202, 244, 0.15);
  margin-bottom: 24px;
  font-family: var(--font-terminal);
  font-size: 11px;
  position: relative;
}

/* Scan lines on root post only */
.thread-root-post::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(4, 202, 244, 0.03) 0px,
    transparent 1px,
    transparent 2px,
    rgba(4, 202, 244, 0.03) 3px
  );
  pointer-events: none;
  z-index: 1;
}

.thread-root-header {
  padding: 8px 12px;
  color: var(--neon-cyan);
  font-weight: 600;
  text-shadow: 0 0 2px var(--neon-cyan);
  background: rgba(4, 202, 244, 0.03);
  position: relative;
  z-index: 2;
}

/* Reply cards - lighter treatment */
.thread-reply-card {
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-muted);
  margin-bottom: 12px;
  margin-left: 24px;  /* Indent for threading */
  font-family: var(--font-terminal);
  font-size: 11px;
  position: relative;
  border-left-width: 2px;
  border-left-color: var(--terminal-dim);
}

/* Thread connection line */
.thread-reply-card::before {
  content: '';
  position: absolute;
  left: -24px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--terminal-muted);
}

/* Horizontal connection */
.thread-reply-card::after {
  content: '';
  position: absolute;
  left: -24px;
  top: 16px;
  width: 24px;
  height: 1px;
  background: var(--terminal-muted);
}

.thread-reply-header {
  padding: 6px 12px;
  color: var(--terminal-dim);
  font-size: 10px;
  position: relative;
  z-index: 2;
}

.thread-reply-content {
  padding: 8px 12px;
  position: relative;
  z-index: 2;
}

.reply-author {
  color: var(--neon-magenta);
  font-weight: 600;
}

.reply-text {
  color: var(--terminal-text);
  margin-top: 4px;
  line-height: 1.5;
}

/* Track in reply */
.reply-track {
  padding: 8px 12px;
  border-top: 1px solid var(--terminal-muted);
  display: flex;
  gap: 8px;
  align-items: center;
  position: relative;
  z-index: 2;
}

.reply-track-thumbnail {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: 1px solid var(--terminal-dim);
}

.reply-track-info {
  flex: 1;
  min-width: 0;
}

.reply-track-title {
  color: var(--terminal-white);
  font-weight: 600;
  font-size: 11px;
}

.reply-track-artist {
  color: var(--neon-cyan);
  font-size: 10px;
}

/* Reply footer */
.thread-reply-footer {
  padding: 6px 12px;
  color: var(--terminal-dim);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 10px;
  position: relative;
  z-index: 2;
}

.reply-play-btn {
  background: transparent;
  border: 1px solid var(--neon-green);
  color: var(--neon-green);
  padding: 4px 8px;
  font-size: 10px;
  font-family: var(--font-terminal);
  cursor: pointer;
  margin-left: auto;
  transition: all 200ms ease;
}

.reply-play-btn:hover {
  background: rgba(0, 255, 65, 0.05);
  box-shadow: 0 0 4px rgba(0, 255, 65, 0.15);
}
```

**Reply Section Header:**
```css
.replies-section-header {
  margin: 24px 0 16px 0;
  padding: 8px 12px;
  border-top: 1px solid var(--terminal-muted);
  border-bottom: 1px solid var(--terminal-muted);
  font-family: var(--font-terminal);
  color: var(--neon-cyan);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.replies-section-header::before {
  content: '├─';
  color: var(--terminal-muted);
}

.replies-section-header::after {
  content: '─┤';
  color: var(--terminal-muted);
  margin-left: auto;
}

.reply-count {
  color: var(--neon-yellow);
  font-weight: 600;
}
```

**Page Background:**
```css
.thread-view-page {
  background: var(--terminal-bg);
  position: relative;
}

/* Light scan lines */
.thread-view-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(4, 202, 244, 0.015) 0px,
    transparent 1px,
    transparent 2px,
    rgba(4, 202, 244, 0.015) 3px
  );
  pointer-events: none;
  z-index: 1;
}
```

---

### 3. PROFILE PAGE (Level 1: Terminal Accent)

**Conceptual Approach:**
Profile is user data display - clean, organized, data-focused. Terminal treatment is minimal - just accents and typography. Focus on clarity and readability.

#### Page Structure

```
┌─[JAMZY::USER_PROFILE]──────[@username]────┐
│ user@jamzy : ~/users/username $ ls -la    │
└─────────────────────────────────────────────┘
```

**Header Implementation:**
```css
.profile-terminal-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--terminal-bg);
  border-bottom: 1px solid var(--neon-green);
  font-family: var(--font-terminal);
  font-size: 12px;
  padding: 8px 12px;
}

.profile-title-bar {
  color: var(--neon-green);
  text-shadow: 0 0 2px var(--neon-green);
}

.profile-username-display {
  color: var(--neon-yellow);
  font-weight: 600;
}
```

**User Identity Section:**

Minimal terminal styling - clean card with subtle accents.

```css
.profile-identity-card {
  background: var(--terminal-panel);
  border: 1px solid var(--terminal-muted);
  padding: 16px;
  margin: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: var(--font-terminal);
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid var(--neon-green);
  box-shadow: 0 0 4px rgba(0, 255, 65, 0.2);
}

.profile-info {
  flex: 1;
}

.profile-display-name {
  color: var(--terminal-white);
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.profile-username {
  color: var(--neon-green);
  font-size: 13px;
  font-weight: 600;
}

.profile-username::before {
  content: '@';
}
```

**Filter Tabs:**
```css
.profile-filter-tabs {
  display: flex;
  border-bottom: 1px solid var(--terminal-muted);
  padding: 0 12px;
  font-family: var(--font-terminal);
  font-size: 11px;
}

.filter-tab {
  background: transparent;
  border: none;
  color: var(--terminal-dim);
  padding: 8px 16px;
  font-family: var(--font-terminal);
  font-size: 11px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 200ms ease;
}

.filter-tab:hover {
  color: var(--neon-green);
}

.filter-tab--active {
  color: var(--neon-green);
  border-bottom-color: var(--neon-green);
  text-shadow: 0 0 2px var(--neon-green);
}

.filter-tab::before {
  content: '[';
  margin-right: 4px;
  opacity: 0;
  transition: opacity 200ms ease;
}

.filter-tab::after {
  content: ']';
  margin-left: 4px;
  opacity: 0;
  transition: opacity 200ms ease;
}

.filter-tab--active::before,
.filter-tab--active::after {
  opacity: 1;
}
```

**Track List Styling:**

RowTrackCard gets minimal terminal touches - mainly typography and subtle borders.

```css
.profile-track-list {
  padding: 12px;
}

.profile-row-card {
  background: var(--terminal-panel);
  border: 1px solid var(--terminal-muted);
  border-left-width: 2px;
  border-left-color: var(--neon-green);
  padding: 12px;
  margin-bottom: 8px;
  font-family: var(--font-terminal);
  transition: all 200ms ease;
}

.profile-row-card:hover {
  border-left-color: var(--neon-green);
  box-shadow: 0 0 4px rgba(0, 255, 65, 0.1);
}

/* Track info with terminal typography */
.profile-track-title {
  color: var(--terminal-white);
  font-size: 12px;
  font-weight: 600;
}

.profile-track-artist {
  color: var(--neon-cyan);
  font-size: 11px;
}

.profile-track-meta {
  color: var(--terminal-dim);
  font-size: 10px;
  margin-top: 4px;
}

.profile-track-meta .username {
  color: var(--neon-green);
}

.profile-track-meta .timestamp {
  color: var(--terminal-muted);
}
```

**Empty State:**
```css
.profile-empty-state {
  padding: 48px 24px;
  text-align: center;
  font-family: var(--font-terminal);
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
  filter: grayscale(1) brightness(0.8);
}

.empty-message {
  color: var(--terminal-dim);
  font-size: 12px;
  line-height: 1.6;
  max-width: 300px;
  margin: 0 auto;
}
```

**Page Background:**

No scan lines or CRT effects - clean terminal background only.

```css
.profile-page {
  background: var(--terminal-bg);
  min-height: 100vh;
}

/* No scan lines on profile - keep it clean */
```

---

## Color System

### Terminal Color Palette

Already defined in `terminal.css` - use these consistently:

```css
--terminal-black: #000000;
--terminal-bg: #0a0a0a;
--terminal-dark: #0f0f0f;
--terminal-panel: #121212;
--terminal-white: #ffffff;
--terminal-text: #e0e0e0;
--terminal-dim: #808080;
--terminal-muted: #404040;
```

### Page-Specific Accent Colors

```css
/* Activity Page (Current) */
--activity-accent: var(--neon-cyan);      /* #00ffff */
--activity-share: var(--neon-blue);       /* #0080ff */
--activity-reply: var(--neon-cyan);       /* #00ffff */
--activity-like: var(--neon-green);       /* #00ff41 */

/* Threads Page (Home) */
--threads-accent: var(--neon-magenta);    /* #ff00ff */
--threads-border: var(--neon-magenta);
--threads-glow: rgba(224, 16, 224, 0.15);

/* Thread View Page */
--thread-accent: var(--neon-cyan);        /* #04caf4 */
--thread-root: var(--neon-cyan);
--thread-reply: var(--terminal-dim);

/* Profile Page */
--profile-accent: var(--neon-green);      /* #00f92a */
--profile-border: var(--neon-green);
--profile-glow: rgba(0, 255, 65, 0.15);
```

### Context-Based Color Rules

1. **Headers**: Use page accent color for top border and title
2. **Interactive Elements**: Hover states use page accent color
3. **Active States**: Always use accent color with glow
4. **Links/Usernames**: Vary by context (magenta for threads, cyan for activity, green for profile)
5. **Metadata**: Always use `--terminal-dim` or `--terminal-muted`

---

## Typography & Spacing

### Terminal Typography Scale

```css
/* Terminal-specific sizes */
--terminal-text-xs: 10px;   /* Metadata, packet IDs */
--terminal-text-sm: 11px;   /* Body text in cards */
--terminal-text-base: 12px; /* Headers, commands */
--terminal-text-md: 13px;   /* Track titles, emphasis */
--terminal-text-lg: 14px;   /* Page titles */
```

### Font Usage by Context

```css
/* Page headers */
.terminal-header {
  font-family: var(--font-terminal);
  font-size: var(--terminal-text-base);
}

/* Card content */
.terminal-card-body {
  font-family: var(--font-terminal);
  font-size: var(--terminal-text-sm);
}

/* Emphasis text (track titles, usernames) */
.terminal-emphasis {
  font-family: var(--font-terminal);
  font-size: var(--terminal-text-md);
  font-weight: 600;
}

/* Metadata */
.terminal-meta {
  font-family: var(--font-terminal);
  font-size: var(--terminal-text-xs);
}
```

### Spacing Guidelines

**Card Padding:**
```css
--card-padding-xs: 6px 12px;   /* Compact elements */
--card-padding-sm: 8px 12px;   /* Standard rows */
--card-padding-base: 12px;     /* Content areas */
```

**Card Margins:**
```css
--card-margin-sm: 8px;         /* Tight lists */
--card-margin-base: 12px;      /* Standard spacing */
--card-margin-lg: 16px;        /* Section breaks */
```

**Thread Indentation:**
```css
--thread-indent: 24px;         /* Reply nesting */
--thread-line-width: 1px;      /* Connection lines */
```

---

## Effects & Animation

### Scan Line Effects - Usage Guidelines

**Full Scan Lines** (Activity Page only):
```css
.activity-page::before {
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 255, 255, 0.02) 0px,
    transparent 1px,
    transparent 2px,
    rgba(0, 255, 255, 0.02) 3px
  );
}
```

**Light Scan Lines** (Threads, Thread View):
```css
.page::before {
  background: repeating-linear-gradient(
    0deg,
    rgba(color, 0.015) 0px,    /* Half intensity */
    transparent 1px,
    transparent 2px,
    rgba(color, 0.015) 3px
  );
}
```

**No Scan Lines** (Profile):
- Keep background clean for data readability

### CRT Vignette - Usage Guidelines

**Full Vignette** (Activity Page only):
```css
.activity-page::after {
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    transparent 70%,
    rgba(0, 0, 0, 0.2) 90%,
    rgba(0, 0, 0, 0.5) 100%
  );
}
```

**Light Vignette** (Threads, Thread View):
```css
.page::after {
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    transparent 80%,
    rgba(0, 0, 0, 0.15) 100%
  );
}
```

**No Vignette** (Profile):
- Clean edges for better readability

### Card Glow Effects

**Hover Glow:**
```css
.terminal-card:hover {
  box-shadow: 0 0 4px rgba(accent-color, 0.15);
  border-color: var(--accent-color);
}
```

**Active/Playing Glow:**
```css
.terminal-card--active {
  border-color: var(--neon-green);
  box-shadow: 0 0 8px rgba(0, 255, 65, 0.3);
}
```

### Animation Patterns

**Stream-In Animation** (All pages):
```css
@keyframes stream-in {
  0% {
    opacity: 0;
    transform: translateX(-12px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Lighter, faster than Activity page */
.card {
  animation: stream-in 300ms ease-out;
}
```

**Stagger Delays:**
```css
/* Lighter stagger than Activity (60ms vs 80ms) */
.card:nth-child(1) { animation-delay: 0ms; }
.card:nth-child(2) { animation-delay: 60ms; }
.card:nth-child(3) { animation-delay: 120ms; }
.card:nth-child(4) { animation-delay: 180ms; }
.card:nth-child(5) { animation-delay: 240ms; }
```

**Filter Transition:**
```css
/* When changing filters */
@keyframes fade-out-up {
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}

@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## Mobile Considerations

### Responsive Breakpoints

```css
/* Mobile (default) */
@media (max-width: 640px) {
  /* Simplify ASCII borders */
  /* Reduce font sizes */
  /* Increase touch targets */
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  /* Standard terminal styling */
}

/* Desktop */
@media (min-width: 1025px) {
  /* Full terminal effects */
  /* Constrained max-width */
}
```

### Mobile-Specific Simplifications

**Simplified Borders:**
```css
@media (max-width: 640px) {
  /* Replace complex ASCII with simple lines */
  .terminal-card-header {
    border-top: 1px solid var(--accent-color);
    padding: 6px 8px;
  }

  .terminal-card-header span {
    /* Hide decorative characters, keep content */
  }

  /* Simple top border instead of ╭─── */
  .terminal-card-header::before {
    content: '─';
    color: var(--accent-color);
  }
}
```

**Typography Scaling:**
```css
@media (max-width: 640px) {
  .terminal-header {
    font-size: 10px;
    padding: 6px 8px;
  }

  .terminal-card-body {
    font-size: 10px;
  }

  .terminal-emphasis {
    font-size: 12px;
  }
}
```

**Touch Targets:**
```css
@media (max-width: 640px) {
  /* Ensure all interactive elements are 44px minimum */
  .terminal-action-btn,
  .terminal-play-btn,
  .filter-tab {
    min-height: 44px;
    padding: 8px 12px;
  }
}
```

**Effects Reduction:**
```css
@media (max-width: 640px) {
  /* Remove scan lines on mobile */
  .page::before {
    display: none;
  }

  /* Lighter vignette */
  .page::after {
    background: radial-gradient(
      ellipse at center,
      transparent 0%,
      transparent 85%,
      rgba(0, 0, 0, 0.1) 100%
    );
  }
}
```

---

## Component Variations

### ThreadCard vs ActivityCard

**ActivityCard (Full Terminal):**
- Heavy ASCII borders: `╭─────┬──[0xID]─╮`
- Packet ID in header
- Activity type label
- Full CRT effects on card
- Colored border by activity type
- More padding and spacing

**ThreadCard (Light Terminal):**
- Light ASCII borders: `╭─ Thread #ID ─╮`
- Thread ID in header
- Question/text content
- No CRT effects on card
- Magenta border/accents
- Compact spacing

### Comparison Table

| Feature | Activity | Thread | Reply | Profile Row |
|---------|----------|--------|-------|-------------|
| Border Style | Heavy ASCII | Light ASCII | Minimal + line | Simple left accent |
| Header | Packet format | Thread format | Reply marker | None |
| Effects | Full scan + CRT | Light scan | None | None |
| Font Size | 11px | 11px | 11px | 12px |
| Padding | 12px | 8-12px | 8px | 12px |
| Glow | Yes (colored) | Yes (magenta) | Subtle | On hover only |
| Metadata | Full details | Stats summary | Minimal | Timestamp only |

### ReplyCard Specifics

**Threading Visualization:**
```
Parent
│
├─ Reply 1
│  └─ Sub-reply 1.1
│
├─ Reply 2
│
└─ Reply 3
```

**CSS Structure:**
```css
/* First-level reply */
.thread-reply-card {
  margin-left: 24px;
  border-left: 2px solid var(--terminal-dim);
}

/* Second-level reply (nested) */
.thread-reply-card .thread-reply-card {
  margin-left: 24px;  /* Additional indent */
}

/* Max nesting depth: 2 levels */
.thread-reply-card .thread-reply-card .thread-reply-card {
  margin-left: 0;  /* Don't nest further */
  border-left-color: var(--neon-yellow);  /* Visual indicator of depth limit */
}
```

---

## Performance Considerations

### Critical Performance Rules

1. **Limit Scan Lines**: Only on page background, never per-card
2. **Optimize Animations**: Use transform and opacity only
3. **Reduce Shadow Calculations**: Max 2 box-shadows per element
4. **Lazy Load Effects**: CRT effects only when in viewport
5. **Debounce Interactions**: Hover effects with 50ms debounce

### CSS Performance Optimizations

```css
/* Use will-change sparingly */
.terminal-card:hover {
  will-change: box-shadow, border-color;
}

/* Remove after animation */
.terminal-card {
  animation: stream-in 300ms ease-out;
  animation-fill-mode: forwards;
}

/* Hardware acceleration */
.terminal-card {
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Contain layout calculations */
.terminal-card {
  contain: layout style paint;
}
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all animations */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Remove scan lines */
  .page::before {
    display: none;
  }

  /* Disable transform animations */
  .terminal-card:hover {
    transform: none;
  }
}
```

---

## Implementation Priority & Phases

### Phase 1: Core Terminal Styles (Week 1)

**File:** `mini-app/src/styles/terminal-core.css`

1. ✅ **Terminal variables** (already exists in terminal.css)
2. **Page accent colors** for each page type
3. **Terminal typography scale**
4. **Base card styles** (shared across all pages)
5. **Terminal header component** (reusable)

**Tasks:**
- Extract shared styles from terminal.css
- Create terminal-core.css with common patterns
- Define CSS custom properties for page accents

### Phase 2: Threads Page Terminal UI (Week 1-2)

**Files:**
- `mini-app/src/styles/threads-terminal.css`
- Update `mini-app/src/pages/ThreadsPage.tsx`
- Update `mini-app/src/components/common/TrackCard/NEW/ThreadCard.tsx`

**Tasks:**
1. Create threads terminal header
2. Redesign ThreadCard with light terminal styling
3. Style filter bar with terminal aesthetics
4. Add light scan lines to page background
5. Implement stream-in animations
6. Test mobile responsiveness

### Phase 3: Thread View Terminal Deep Dive (Week 2)

**Files:**
- `mini-app/src/styles/thread-view-terminal.css`
- Update `mini-app/src/pages/ThreadViewPage.tsx`
- Create `mini-app/src/components/threads/ReplyCard.tsx`

**Tasks:**
1. Create thread view terminal header
2. Style root post with full terminal treatment
3. Implement reply cards with threading lines
4. Add connection line pseudo-elements
5. Create replies section header
6. Test nested reply rendering
7. Mobile simplification

### Phase 4: Profile Page Terminal Accent (Week 2-3)

**Files:**
- `mini-app/src/styles/profile-terminal.css`
- Update `mini-app/src/pages/ProfilePage.tsx`
- Update `mini-app/src/components/common/TrackCard/NEW/RowTrackCard.tsx` (light variant)

**Tasks:**
1. Create profile terminal header
2. Style identity card with subtle terminal accent
3. Terminal-style filter tabs
4. Light terminal treatment for RowTrackCard
5. Style empty state
6. Keep background clean (no effects)

### Phase 5: Polish & Optimization (Week 3)

**Tasks:**
1. Performance audit of scan line effects
2. Mobile experience testing and refinement
3. Reduced motion support
4. Cross-browser testing
5. Accessibility audit (contrast, focus states)
6. Animation timing refinement
7. Documentation updates

---

## Testing Checklist

### Visual Testing

- [ ] Activity page terminal aesthetics preserved
- [ ] Threads page has lighter terminal treatment
- [ ] Thread view shows proper conversation threading
- [ ] Profile page has minimal terminal accents
- [ ] All pages use consistent terminal typography
- [ ] Color accents match page context
- [ ] Scan lines visible but not overwhelming
- [ ] CRT effects only where specified

### Interaction Testing

- [ ] Hover states work on all interactive elements
- [ ] Filter transitions smooth on threads page
- [ ] Thread cards clickable with visual feedback
- [ ] Reply cards show proper nesting
- [ ] Play buttons have terminal styling
- [ ] Touch targets 44px minimum on mobile
- [ ] Keyboard navigation works throughout

### Responsive Testing

- [ ] Mobile: ASCII borders simplified
- [ ] Mobile: Font sizes readable
- [ ] Mobile: Touch targets adequate
- [ ] Mobile: Scan lines removed or lightened
- [ ] Tablet: Standard terminal styling
- [ ] Desktop: Full effects within constraints
- [ ] All breakpoints: Content max-width enforced

### Performance Testing

- [ ] Page load <2s on 3G
- [ ] Animations run at 60fps
- [ ] Scroll performance smooth
- [ ] No layout shifts during load
- [ ] Images lazy load properly
- [ ] CSS file size <50kb total
- [ ] No unnecessary repaints

### Accessibility Testing

- [ ] Color contrast 4.5:1 minimum
- [ ] Focus indicators visible (2px cyan)
- [ ] Screen reader: Proper heading structure
- [ ] Screen reader: All images have alt text
- [ ] Keyboard: Can navigate entire interface
- [ ] Reduced motion: Effects disabled
- [ ] Text scalable to 200% without breaking

---

## File Structure

### New/Modified Files

```
mini-app/src/styles/
├── terminal.css                 # Existing (Activity page)
├── terminal-core.css            # NEW - Shared terminal styles
├── threads-terminal.css         # NEW - Threads page terminal
├── thread-view-terminal.css     # NEW - Thread view terminal
└── profile-terminal.css         # NEW - Profile page terminal

mini-app/src/pages/
├── ActivityPage.tsx             # Existing (no changes)
├── ThreadsPage.tsx              # Modified - Add terminal styles
├── ThreadViewPage.tsx           # Modified - Add terminal styles
└── ProfilePage.tsx              # Modified - Add terminal styles

mini-app/src/components/
├── threads/
│   └── ReplyCard.tsx            # NEW - Terminal reply component
├── common/TrackCard/NEW/
│   ├── ThreadCard.tsx           # Modified - Terminal styling
│   └── RowTrackCard.tsx         # Modified - Profile variant
```

### Import Structure

```typescript
// ActivityPage.tsx (existing)
import '../styles/terminal.css';

// ThreadsPage.tsx
import '../styles/terminal-core.css';
import '../styles/threads-terminal.css';

// ThreadViewPage.tsx
import '../styles/terminal-core.css';
import '../styles/thread-view-terminal.css';

// ProfilePage.tsx
import '../styles/terminal-core.css';
import '../styles/profile-terminal.css';
```

---

## Code Examples

### Threads Page Header Component

```typescript
// ThreadsPage.tsx header section
<div class="threads-terminal-header">
  {/* Title bar */}
  <div class="terminal-title-bar">
    <span>┌─[</span>
    <span style={{ 'font-weight': 700 }}>JAMZY::THREAD_BROWSER</span>
    <span>]─────────────[</span>
    <span style={{ color: 'var(--neon-magenta)' }}>
      FILTER: {sortBy().toUpperCase()}
    </span>
    <span>]─┐</span>
  </div>

  {/* Command prompt */}
  <div class="terminal-prompt-line">
    <span class="border-v">│</span>
    <span class="terminal-user">user@jamzy</span>
    <span class="terminal-colon">:</span>
    <span class="terminal-path">~/threads</span>
    <span class="terminal-dollar">$</span>
    <span class="terminal-command">list --sort={sortBy()}</span>
    <span style={{ 'margin-left': 'auto' }}></span>
    <span class="border-v">│</span>
  </div>

  {/* Bottom border */}
  <div style={{ color: 'var(--terminal-muted)' }}>
    <span>└────────────────────────────────────────────┘</span>
  </div>
</div>
```

### ThreadCard Terminal Component

```typescript
// ThreadCard.tsx with terminal styling
const ThreadCard: Component<ThreadCardProps> = (props) => {
  return (
    <article class="terminal-thread-card" onClick={handleCardClick}>
      {/* Top border */}
      <div class="thread-card-header">
        <span>╭─ Thread </span>
        <span class="thread-id">#{props.threadId.slice(-4)}</span>
        <span> ─────────────────────────╮</span>
      </div>

      {/* Content */}
      <div class="thread-card-content">
        <span class="border-v">│</span>
        <span class="meta-arrow">&gt;&gt; </span>
        <span class="thread-author">@{props.creatorUsername}</span>
        <span style={{ color: 'var(--terminal-text)' }}>: </span>
        <span class="thread-text">{props.threadText}</span>
        <span class="border-v" style={{ 'margin-left': 'auto' }}>│</span>
      </div>

      {/* Track preview if present */}
      <Show when={props.starterTrack}>
        {(track) => (
          <div class="thread-track-preview">
            <span class="border-v">│</span>
            <img
              src={track().albumArt}
              class="thread-track-thumbnail"
              alt=""
            />
            <div class="thread-track-info">
              <div class="thread-track-title">"{track().title}"</div>
              <div class="thread-track-artist">{track().artist}</div>
            </div>
            <span class="border-v">│</span>
          </div>
        )}
      </Show>

      {/* Footer */}
      <div class="thread-card-footer">
        <span class="border-v">│</span>
        <span class="thread-stat">💬 {props.replyCount}</span>
        <span>•</span>
        <span class="thread-stat">❤ {props.likeCount}</span>
        <span class="thread-timestamp">{formatTimeAgo(props.timestamp)}</span>
        <span class="border-v" style={{ 'margin-left': 'auto' }}>│</span>
      </div>

      {/* Bottom border */}
      <div class="thread-card-header">
        <span>╰─────────────────────────────────────────╯</span>
      </div>
    </article>
  );
};
```

### ReplyCard Component

```typescript
// ReplyCard.tsx - New component
interface ReplyCardProps {
  reply: Reply;
  depth?: number;  // Nesting level (0, 1, or 2)
}

const ReplyCard: Component<ReplyCardProps> = (props) => {
  const depth = props.depth || 0;
  const maxDepth = depth >= 2;

  return (
    <div
      class={`thread-reply-card ${maxDepth ? 'thread-reply-card--max-depth' : ''}`}
      style={{ 'margin-left': depth > 0 ? '24px' : '0' }}
    >
      {/* Header */}
      <div class="thread-reply-header">
        <span>├─[REPLY]─────────────┬──[</span>
        <span class="reply-author">@{props.reply.author.username}</span>
        <span>]─┐</span>
      </div>

      {/* Content */}
      <div class="thread-reply-content">
        <span class="border-v">│</span>
        <span class="meta-arrow">&gt;&gt; </span>
        <span class="reply-text">{props.reply.text}</span>
        <span class="border-v" style={{ 'margin-left': 'auto' }}>│</span>
      </div>

      {/* Track */}
      <Show when={props.reply.track}>
        {(track) => (
          <div class="reply-track">
            <span class="border-v">│</span>
            <img
              src={track().thumbnail}
              class="reply-track-thumbnail"
              alt=""
            />
            <div class="reply-track-info">
              <div class="reply-track-title">{track().title}</div>
              <div class="reply-track-artist">{track().artist}</div>
            </div>
            <button class="reply-play-btn">
              <span>[▶ PLAY]</span>
            </button>
            <span class="border-v">│</span>
          </div>
        )}
      </Show>

      {/* Footer */}
      <div class="thread-reply-footer">
        <span class="border-v">│</span>
        <span>❤ {props.reply.likes}</span>
        <span>•</span>
        <span>{formatTimeAgo(props.reply.timestamp)}</span>
        <span class="border-v" style={{ 'margin-left': 'auto' }}>│</span>
      </div>

      {/* Bottom border */}
      <div class="thread-reply-header">
        <span>╰──────────────────────────────────────╯</span>
      </div>
    </div>
  );
};
```

### Profile Page Header

```typescript
// ProfilePage.tsx header
<div class="profile-terminal-header">
  {/* Title bar */}
  <div class="terminal-title-bar">
    <span>┌─[</span>
    <span style={{ 'font-weight': 700 }}>JAMZY::USER_PROFILE</span>
    <span>]───────────[</span>
    <span class="profile-username-display">@{user.username}</span>
    <span>]─┐</span>
  </div>

  {/* Command prompt */}
  <div class="terminal-prompt-line">
    <span class="border-v">│</span>
    <span class="terminal-user">user@jamzy</span>
    <span class="terminal-colon">:</span>
    <span class="terminal-path">~/users/{user.username}</span>
    <span class="terminal-dollar">$</span>
    <span class="terminal-command">ls -la</span>
    <span style={{ 'margin-left': 'auto' }}></span>
    <span class="border-v">│</span>
  </div>

  {/* Bottom border */}
  <div style={{ color: 'var(--terminal-muted)' }}>
    <span>└────────────────────────────────────────────┘</span>
  </div>
</div>
```

---

## Common Patterns & Utilities

### Reusable Terminal Components

**Terminal Border Line:**
```typescript
const TerminalBorderLine: Component<{
  char?: string;
  color?: string;
  width?: string;
}> = (props) => (
  <div style={{
    color: props.color || 'var(--terminal-muted)',
    'font-family': 'var(--font-terminal)',
    'font-size': '11px'
  }}>
    <span>{props.char || '─'}.repeat(width || 60)</span>
  </div>
);
```

**Terminal Header Template:**
```typescript
interface TerminalHeaderProps {
  title: string;
  subtitle?: string;
  path: string;
  command: string;
  accentColor: string;
}

const TerminalHeader: Component<TerminalHeaderProps> = (props) => (
  <div class="terminal-header-base" style={{
    'border-bottom-color': props.accentColor
  }}>
    {/* Implementation */}
  </div>
);
```

### CSS Utility Classes

```css
/* Terminal text utilities */
.terminal-text-primary { color: var(--terminal-white); }
.terminal-text-secondary { color: var(--terminal-text); }
.terminal-text-muted { color: var(--terminal-dim); }
.terminal-text-subtle { color: var(--terminal-muted); }

/* Terminal border utilities */
.terminal-border-primary { border-color: var(--accent-color); }
.terminal-border-muted { border-color: var(--terminal-muted); }
.terminal-border-left-accent {
  border-left: 2px solid var(--accent-color);
}

/* Terminal glow utilities */
.terminal-glow-sm {
  box-shadow: 0 0 4px rgba(var(--accent-color-rgb), 0.15);
}
.terminal-glow-md {
  box-shadow: 0 0 8px rgba(var(--accent-color-rgb), 0.3);
}
.terminal-glow-lg {
  box-shadow: 0 0 12px rgba(var(--accent-color-rgb), 0.4);
}

/* Terminal spacing utilities */
.terminal-padding-xs { padding: 6px 12px; }
.terminal-padding-sm { padding: 8px 12px; }
.terminal-padding-base { padding: 12px; }

.terminal-margin-xs { margin-bottom: 8px; }
.terminal-margin-sm { margin-bottom: 12px; }
.terminal-margin-base { margin-bottom: 16px; }
```

---

## Migration Strategy

### Backwards Compatibility

1. **Activity Page**: No changes - current implementation is reference
2. **Existing Components**: Create terminal variants, keep originals
3. **CSS Isolation**: New terminal styles in separate files
4. **Feature Flags**: Optional - can toggle terminal mode per page

### Rollout Approach

**Option A: Big Bang (Recommended)**
- Deploy all pages at once
- Consistent experience immediately
- Shorter timeline

**Option B: Gradual**
1. Week 1: Threads page
2. Week 2: Thread view
3. Week 3: Profile
- User feedback between phases
- More testing time

### Rollback Plan

If terminal aesthetic doesn't test well:
1. Keep Activity page (users love it)
2. Revert other pages to current styling
3. Terminal mode as opt-in user preference

---

## Success Metrics

### User Experience Metrics

- **Engagement**: Time on page, interactions per session
- **Usability**: Click-through rates, bounce rates
- **Feedback**: User comments, support tickets
- **Performance**: Page load times, animation smoothness

### Technical Metrics

- **CSS Size**: <50kb total for all terminal styles
- **Load Time**: <2s on 3G connection
- **Frame Rate**: 60fps during animations
- **Accessibility**: 0 WCAG violations

### Design Quality Metrics

- **Consistency**: Same terminal treatment across similar elements
- **Balance**: No overwhelming ASCII decoration
- **Readability**: 4.5:1 color contrast maintained
- **Mobile**: Touch targets 44px minimum

---

## Conclusion

This design system extends the terminal/cyberpunk aesthetic strategically across Jamzy:

- **Activity Page** (Level 3): Full immersion - current implementation
- **Threads Page** (Level 2): Terminal UI - browsing experience
- **Thread View** (Level 4): Terminal deep dive - conversation threading
- **Profile Page** (Level 1): Terminal accent - clean data display

Key principles:
1. Context-appropriate intensity
2. Mobile-first responsiveness
3. Performance-conscious effects
4. Usability never compromised
5. Consistent terminal typography and color system

Ready for implementation following the phased approach outlined above.

---

**Next Steps for Implementation:**
1. Create `terminal-core.css` with shared utilities
2. Start with Threads page (highest impact)
3. Test mobile experience early and often
4. Gather user feedback after each phase
5. Iterate based on performance metrics

**Questions for Product/Design Review:**
- Should terminal mode be toggleable per user preference?
- Any specific ASCII art or Easter eggs to include?
- Preferred rollout: big bang or gradual?
- Budget for custom terminal font if needed?
