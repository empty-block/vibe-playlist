# Activity Page - Cyberpunk Terminal Aesthetic - TASK-580

**Date:** 2025-10-01
**Designer:** Zen Master Designer (AI Agent)
**Iteration:** Terminal Redesign
**Target:** Activity Page with stronger cyberpunk/hacker terminal vibes
**Philosophy:** Data streams in the Matrix, command-line interface aesthetics, retro terminal nostalgia

---

## Executive Summary

This design plan reimagines the Activity Page as a **cyberpunk terminal interface** - transforming social music discovery into a retro hacker experience where music activity flows like data streams in a network monitoring system.

**Core Transformation:**
- From smooth modern UI → to raw terminal interface
- From rounded corners → to hard edges and ASCII borders
- From subtle glows → to aggressive neon scan lines
- From clean text → to monospace terminal output
- From cards → to terminal windows and data blocks

**Target Aesthetic References:**
- 1980s terminal interfaces (VT100, IBM mainframes)
- The Matrix digital rain and command prompts
- Blade Runner 2049 holographic interfaces
- Cyberpunk 2077 UI elements
- Retro BBS (Bulletin Board System) interfaces
- Unix/Linux terminal emulators with neon color schemes

---

## Design Philosophy: Terminal as Interface

### The Core Metaphor

The Activity Page is a **network activity monitor** - a terminal window showing real-time data streams of music events across your social graph. You're not browsing a feed; you're monitoring network traffic.

**Terminal Command Paradigm:**
```bash
user@jamzy:~/activity$ stream --live --filter=all
[NETWORK MONITOR v2.5.7 - ONLINE]
[STREAMING ACTIVITY FROM 147 NODES]
[PACKET LOSS: 0% | LATENCY: 12ms | UPTIME: 99.8%]

> Intercepting data packets...
> Decoding music transmission...
> Rendering social graph...
```

### Key Terminal Design Principles

1. **Monospace Everything**: All text uses monospace fonts (JetBrains Mono, SF Mono, Courier)
2. **ASCII Art Borders**: Box-drawing characters (─ │ ┌ ┐ └ ┘ ├ ┤ ╭ ╮ ╰ ╯)
3. **Terminal Colors**: Classic 16-color terminal palette with neon enhancements
4. **Scan Lines**: CRT screen effects with horizontal scan lines
5. **System Messages**: Everything reads like terminal output or log entries
6. **Glitch Effects**: Subtle digital artifacts and glitches
7. **Block Cursor**: Blinking block cursors for interactive elements
8. **Raw Data Display**: Show technical metadata (IDs, timestamps, packet info)

### What Makes This "More Cyberpunk Terminal"

**BEFORE (Current):**
- Rounded corners (4px border-radius)
- Subtle backgrounds (rgba)
- Modern font combinations
- Smooth gradients
- Soft glows
- Clean borders

**AFTER (Terminal Style):**
- Sharp corners (0px border-radius)
- ASCII box-drawing borders
- 100% monospace fonts
- Hard color transitions
- Aggressive neon glows with scan lines
- Terminal prompt formatting
- System status indicators
- Glitch/flicker effects
- Matrix-style data presentation

---

## Typography System: Terminal Text

### Font Stack

```css
/* Primary monospace font */
--font-terminal: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', 'Courier New', monospace;

/* Fallback for system info */
--font-system: 'Courier New', monospace;
```

**All text on the Activity Page uses monospace fonts.** No exceptions. This creates the terminal aesthetic.

### Text Sizes & Weights

```css
/* Terminal Text Hierarchy */
.terminal-header {
  font-family: var(--font-terminal);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--neon-cyan);
}

.terminal-prompt {
  font-family: var(--font-terminal);
  font-size: 13px;
  font-weight: 400;
  color: var(--neon-green);
  line-height: 1.6;
}

.terminal-data {
  font-family: var(--font-terminal);
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
}

.terminal-metadata {
  font-family: var(--font-terminal);
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.3px;
}

.terminal-timestamp {
  font-family: var(--font-terminal);
  font-size: 10px;
  font-weight: 400;
  color: var(--muted-text);
  text-transform: uppercase;
}
```

---

## Color System: Terminal Palette

### Base Terminal Colors

```css
/* Core terminal colors */
--terminal-black: #000000;
--terminal-bg: #0a0a0a;
--terminal-dark: #0f0f0f;
--terminal-panel: #121212;

/* Terminal text colors */
--terminal-white: #ffffff;
--terminal-text: #e0e0e0;
--terminal-dim: #808080;
--terminal-muted: #404040;

/* Neon accent colors (more aggressive) */
--neon-green: #00ff41;      /* Matrix green */
--neon-cyan: #00ffff;        /* Electric cyan */
--neon-blue: #0080ff;        /* Neon blue */
--neon-magenta: #ff00ff;     /* Hot magenta */
--neon-yellow: #ffff00;      /* Warning yellow */
--neon-red: #ff0040;         /* Error red */
--neon-orange: #ff8000;      /* Alert orange */

/* Activity type colors */
--activity-share: var(--neon-blue);
--activity-reply: var(--neon-cyan);
--activity-like: var(--neon-green);
--activity-error: var(--neon-red);
```

### Glow Effects (More Aggressive)

```css
/* Neon text glow */
.neon-text {
  text-shadow:
    0 0 4px currentColor,
    0 0 8px currentColor,
    0 0 12px currentColor;
}

/* Neon border glow */
.neon-border {
  box-shadow:
    0 0 4px currentColor,
    0 0 8px currentColor,
    inset 0 0 4px rgba(255, 255, 255, 0.1);
}

/* Multi-layer glow (for active elements) */
.neon-glow-active {
  box-shadow:
    0 0 4px var(--neon-cyan),
    0 0 8px var(--neon-cyan),
    0 0 16px var(--neon-cyan),
    0 0 32px rgba(0, 255, 255, 0.3),
    inset 0 0 8px rgba(0, 255, 255, 0.1);
}
```

---

## Page Structure: Terminal Interface

### Header - Command Line Prompt

```
┌─[JAMZY::NETWORK_MONITOR]─────────────────────────────[v2.5.7]─┐
│ user@jamzy:~/activity$ stream --live --filter=all             │
│ [●] CONNECTED | 147 ACTIVE NODES | LATENCY: 12ms | ↑ 2.3MB/s  │
└────────────────────────────────────────────────────────────────┘
```

**Implementation:**

```tsx
<div class="terminal-header">
  {/* Top border with title */}
  <div class="terminal-title-bar">
    <span class="terminal-border-left">┌─[</span>
    <span class="terminal-title">JAMZY::NETWORK_MONITOR</span>
    <span class="terminal-border-fill">]─────────────────────────────[</span>
    <span class="terminal-version">v2.5.7</span>
    <span class="terminal-border-right">]─┐</span>
  </div>

  {/* Command prompt */}
  <div class="terminal-prompt-line">
    <span class="terminal-border">│</span>
    <span class="terminal-user">user@jamzy</span>
    <span class="terminal-colon">:</span>
    <span class="terminal-path">~/activity</span>
    <span class="terminal-dollar">$</span>
    <span class="terminal-command">stream --live --filter=all</span>
    <span class="terminal-cursor">█</span>
    <span class="terminal-border">│</span>
  </div>

  {/* Status line */}
  <div class="terminal-status-line">
    <span class="terminal-border">│</span>
    <span class="status-indicator">[●]</span>
    <span class="status-text">CONNECTED</span>
    <span class="status-separator">|</span>
    <span class="status-nodes">147 ACTIVE NODES</span>
    <span class="status-separator">|</span>
    <span class="status-latency">LATENCY: 12ms</span>
    <span class="status-separator">|</span>
    <span class="status-bandwidth">↑ 2.3MB/s</span>
    <span class="terminal-border">│</span>
  </div>

  {/* Bottom border */}
  <div class="terminal-border-bottom">
    <span>└────────────────────────────────────────────────────────────────┘</span>
  </div>
</div>
```

**CSS:**

```css
.terminal-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--terminal-bg);
  border-bottom: 1px solid var(--neon-cyan);
  font-family: var(--font-terminal);
  font-size: 12px;
  line-height: 1.6;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2);
}

.terminal-title-bar {
  color: var(--neon-cyan);
  text-shadow: 0 0 4px var(--neon-cyan);
}

.terminal-prompt-line {
  margin-top: 4px;
  color: var(--terminal-text);
}

.terminal-user {
  color: var(--neon-green);
  font-weight: 600;
}

.terminal-path {
  color: var(--neon-blue);
}

.terminal-command {
  color: var(--terminal-white);
  margin-left: 8px;
}

.terminal-cursor {
  animation: cursor-blink 1s step-end infinite;
  color: var(--terminal-white);
  background: var(--terminal-white);
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.terminal-status-line {
  margin-top: 4px;
  font-size: 11px;
  color: var(--terminal-dim);
}

.status-indicator {
  color: var(--neon-green);
  text-shadow: 0 0 6px var(--neon-green);
}

.status-text {
  color: var(--neon-green);
  font-weight: 600;
}

.status-separator {
  margin: 0 8px;
  color: var(--terminal-muted);
}
```

### Filter Tabs - Terminal Mode Switches

```
[ALL] [FOLLOWING] [NETWORKS] [TRENDING]
 ███   ─────────  ─────────   ─────────
```

**Implementation:**

```tsx
<div class="terminal-filters">
  <button class="terminal-filter terminal-filter--active">
    <span class="filter-bracket">[</span>
    <span class="filter-text">ALL</span>
    <span class="filter-bracket">]</span>
    <span class="filter-indicator">███</span>
  </button>

  <button class="terminal-filter">
    <span class="filter-bracket">[</span>
    <span class="filter-text">FOLLOWING</span>
    <span class="filter-bracket">]</span>
    <span class="filter-indicator">─────────</span>
  </button>

  {/* More filters... */}
</div>
```

**CSS:**

```css
.terminal-filters {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  background: var(--terminal-panel);
  border-bottom: 1px solid var(--terminal-muted);
  overflow-x: auto;
  font-family: var(--font-terminal);
}

.terminal-filter {
  background: transparent;
  border: none;
  color: var(--terminal-dim);
  font-family: var(--font-terminal);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: color 200ms ease;
}

.terminal-filter:active {
  transform: translateY(1px);
}

.terminal-filter--active {
  color: var(--neon-cyan);
  text-shadow: 0 0 6px var(--neon-cyan);
}

.filter-indicator {
  display: block;
  font-size: 8px;
  line-height: 1;
  letter-spacing: -1px;
}

.terminal-filter--active .filter-indicator {
  color: var(--neon-cyan);
  text-shadow: 0 0 4px var(--neon-cyan);
}
```

---

## Activity Components: Terminal Data Blocks

### 1. Track Share Activity - Data Packet

**Terminal Aesthetic:**
```
╭─[INCOMING_PACKET]──────────────────────────────[ID: 0xa4f9]─╮
│ >> TRACK_SHARE transmission from @vibes_master              │
│ >> Timestamp: 30m ago | Node: fid:12847 | Status: ✓ DECODED │
├─────────────────────────────────────────────────────────────┤
│ ┌────┐                                                       │
│ │ [■]│ "Fade Into You"                    [SRC: YOUTUBE]    │
│ │IMG │ by Mazzy Star                                        │
│ └────┘                                                       │
│                                                              │
│ >> COMMENT: "This song is pure dreamy bliss..."             │
│                                                              │
│ [❤ 3] [💬 0] [↻ 1]                            [▶ PLAY]      │
╰──────────────────────────────────────────────────────────────╯
```

**Implementation:**

```tsx
<div class="terminal-activity-block terminal-activity-block--share">
  {/* Top border with metadata */}
  <div class="terminal-block-header">
    <span class="border-tl">╭─[</span>
    <span class="packet-type">INCOMING_PACKET</span>
    <span class="border-fill">]──────────────────────────────[</span>
    <span class="packet-id">ID: 0x{activityId}</span>
    <span class="border-tr">]─╮</span>
  </div>

  {/* Metadata line */}
  <div class="terminal-block-meta">
    <span class="border-v">│</span>
    <span class="meta-arrow">&gt;&gt;</span>
    <span class="meta-type">TRACK_SHARE</span>
    <span class="meta-text">transmission from</span>
    <span class="meta-username">@{username}</span>
    <span class="border-v">│</span>
  </div>

  <div class="terminal-block-info">
    <span class="border-v">│</span>
    <span class="meta-arrow">&gt;&gt;</span>
    <span class="info-label">Timestamp:</span>
    <span class="info-value">{timestamp}</span>
    <span class="info-separator">|</span>
    <span class="info-label">Node:</span>
    <span class="info-value">fid:{fid}</span>
    <span class="info-separator">|</span>
    <span class="info-label">Status:</span>
    <span class="info-status">✓ DECODED</span>
    <span class="border-v">│</span>
  </div>

  {/* Divider */}
  <div class="terminal-block-divider">
    <span>├─────────────────────────────────────────────────────────────┤</span>
  </div>

  {/* Track content */}
  <div class="terminal-block-content">
    <span class="border-v">│</span>
    <div class="terminal-track-row">
      {/* Track thumbnail */}
      <div class="terminal-thumbnail">
        <div class="thumbnail-border-top">┌────┐</div>
        <div class="thumbnail-image-wrapper">
          <span class="border-v">│</span>
          <img src={thumbnail} alt="" class="thumbnail-image" />
          <span class="border-v">│</span>
        </div>
        <div class="thumbnail-border-bottom">└────┘</div>
      </div>

      {/* Track info */}
      <div class="terminal-track-info">
        <div class="track-title-line">
          <span class="track-title">"{trackTitle}"</span>
          <span class="track-source">[SRC: {source}]</span>
        </div>
        <div class="track-artist-line">
          <span class="track-label">by</span>
          <span class="track-artist">{artistName}</span>
        </div>
      </div>
    </div>
    <span class="border-v">│</span>
  </div>

  {/* Comment section */}
  {comment && (
    <>
      <div class="terminal-block-empty">
        <span class="border-v">│</span>
        <span class="border-v">│</span>
      </div>
      <div class="terminal-block-comment">
        <span class="border-v">│</span>
        <span class="comment-arrow">&gt;&gt;</span>
        <span class="comment-label">COMMENT:</span>
        <span class="comment-text">"{comment}"</span>
        <span class="border-v">│</span>
      </div>
    </>
  )}

  {/* Social actions */}
  <div class="terminal-block-empty">
    <span class="border-v">│</span>
    <span class="border-v">│</span>
  </div>

  <div class="terminal-block-actions">
    <span class="border-v">│</span>
    <div class="terminal-social-row">
      <button class="terminal-action-btn">
        <span class="action-bracket">[</span>
        <span class="action-icon">❤</span>
        <span class="action-count">{likes}</span>
        <span class="action-bracket">]</span>
      </button>

      <button class="terminal-action-btn">
        <span class="action-bracket">[</span>
        <span class="action-icon">💬</span>
        <span class="action-count">{replies}</span>
        <span class="action-bracket">]</span>
      </button>

      <button class="terminal-action-btn">
        <span class="action-bracket">[</span>
        <span class="action-icon">↻</span>
        <span class="action-count">{recasts}</span>
        <span class="action-bracket">]</span>
      </button>

      <button class="terminal-play-btn">
        <span class="action-bracket">[</span>
        <span class="play-icon">▶</span>
        <span class="play-text">PLAY</span>
        <span class="action-bracket">]</span>
      </button>
    </div>
    <span class="border-v">│</span>
  </div>

  {/* Bottom border */}
  <div class="terminal-block-footer">
    <span class="border-bl">╰──────────────────────────────────────────────────────────────╯</span>
  </div>
</div>
```

**CSS:**

```css
/* Terminal Activity Block Base */
.terminal-activity-block {
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-muted);
  margin-bottom: 16px;
  font-family: var(--font-terminal);
  font-size: 11px;
  line-height: 1.6;
  position: relative;
  overflow: hidden;
}

/* Scan line effect */
.terminal-activity-block::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 255, 255, 0.03) 0px,
    transparent 1px,
    transparent 2px,
    rgba(0, 255, 255, 0.03) 3px
  );
  pointer-events: none;
  z-index: 1;
}

/* CRT glow overlay */
.terminal-activity-block::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    rgba(0, 0, 0, 0.3) 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* Type-specific colors */
.terminal-activity-block--share {
  border-color: var(--activity-share);
  box-shadow: 0 0 4px rgba(0, 128, 255, 0.2);
}

.terminal-activity-block--reply {
  border-color: var(--activity-reply);
  box-shadow: 0 0 4px rgba(0, 255, 255, 0.2);
}

.terminal-activity-block--like {
  border-color: var(--activity-like);
  box-shadow: 0 0 4px rgba(0, 255, 65, 0.2);
}

/* Header */
.terminal-block-header {
  padding: 8px 12px;
  color: var(--neon-cyan);
  font-weight: 600;
  text-shadow: 0 0 4px var(--neon-cyan);
  letter-spacing: 0.5px;
  background: rgba(0, 255, 255, 0.03);
}

.packet-type {
  color: var(--neon-cyan);
  text-transform: uppercase;
}

.packet-id {
  color: var(--neon-yellow);
  font-size: 10px;
}

/* Metadata lines */
.terminal-block-meta,
.terminal-block-info {
  padding: 4px 12px;
  color: var(--terminal-text);
}

.meta-arrow {
  color: var(--neon-green);
  margin-right: 4px;
  text-shadow: 0 0 4px var(--neon-green);
}

.meta-type {
  color: var(--neon-cyan);
  font-weight: 600;
  text-transform: uppercase;
}

.meta-username {
  color: var(--neon-magenta);
  font-weight: 600;
  text-shadow: 0 0 4px var(--neon-magenta);
}

.info-label {
  color: var(--terminal-dim);
  margin-right: 4px;
}

.info-value {
  color: var(--terminal-white);
  font-weight: 600;
}

.info-status {
  color: var(--neon-green);
  font-weight: 600;
}

.info-separator {
  margin: 0 8px;
  color: var(--terminal-muted);
}

/* Divider */
.terminal-block-divider {
  padding: 0 12px;
  color: var(--terminal-muted);
  font-weight: 400;
}

/* Content area */
.terminal-block-content {
  padding: 12px;
  display: flex;
  gap: 8px;
  position: relative;
  z-index: 2;
}

.terminal-track-row {
  display: flex;
  gap: 12px;
  flex: 1;
  align-items: flex-start;
}

/* Terminal-style thumbnail */
.terminal-thumbnail {
  flex-shrink: 0;
  font-size: 8px;
  line-height: 1;
  color: var(--terminal-dim);
}

.thumbnail-border-top,
.thumbnail-border-bottom {
  letter-spacing: -1px;
}

.thumbnail-image-wrapper {
  display: flex;
  gap: 0;
  height: 56px;
}

.thumbnail-image {
  width: 56px;
  height: 56px;
  object-fit: cover;
  display: block;
  filter:
    brightness(0.9)
    contrast(1.1)
    saturate(1.2);
}

/* Track info */
.terminal-track-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding-top: 8px;
}

.track-title-line {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.track-title {
  color: var(--terminal-white);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-source {
  color: var(--terminal-dim);
  font-size: 9px;
  font-weight: 400;
  letter-spacing: 0.5px;
  margin-left: auto;
  flex-shrink: 0;
}

.track-artist-line {
  display: flex;
  gap: 4px;
  font-size: 12px;
}

.track-label {
  color: var(--terminal-dim);
}

.track-artist {
  color: var(--neon-cyan);
  font-weight: 600;
}

/* Empty spacer */
.terminal-block-empty {
  padding: 0 12px;
  color: var(--terminal-muted);
  font-size: 8px;
}

/* Comment */
.terminal-block-comment {
  padding: 4px 12px;
  display: flex;
  gap: 4px;
  align-items: flex-start;
}

.comment-arrow {
  color: var(--neon-blue);
  flex-shrink: 0;
}

.comment-label {
  color: var(--neon-blue);
  font-weight: 600;
  flex-shrink: 0;
}

.comment-text {
  color: var(--terminal-text);
  font-style: italic;
  opacity: 0.9;
  flex: 1;
}

/* Actions */
.terminal-block-actions {
  padding: 8px 12px;
  display: flex;
  gap: 8px;
  position: relative;
  z-index: 2;
}

.terminal-social-row {
  display: flex;
  gap: 12px;
  flex: 1;
  align-items: center;
}

.terminal-action-btn {
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

.terminal-action-btn:active {
  transform: scale(0.95);
  color: var(--neon-green);
  text-shadow: 0 0 6px var(--neon-green);
}

.action-icon {
  font-size: 12px;
}

.action-count {
  font-weight: 600;
  min-width: 12px;
  text-align: center;
}

/* Play button (right-aligned) */
.terminal-play-btn {
  background: transparent;
  border: 1px solid var(--neon-green);
  color: var(--neon-green);
  font-family: var(--font-terminal);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  padding: 6px 12px;
  margin-left: auto;
  transition: all 200ms ease;
  text-shadow: 0 0 4px var(--neon-green);
  box-shadow: 0 0 4px rgba(0, 255, 65, 0.2);
}

.terminal-play-btn:active {
  background: rgba(0, 255, 65, 0.1);
  box-shadow:
    0 0 4px rgba(0, 255, 65, 0.4),
    0 0 8px rgba(0, 255, 65, 0.3);
}

.play-icon {
  font-size: 10px;
}

.play-text {
  letter-spacing: 1px;
  margin: 0 4px;
}

/* Footer */
.terminal-block-footer {
  padding: 8px 12px;
  color: var(--terminal-muted);
  font-weight: 400;
}

/* Border characters */
.border-v {
  color: var(--terminal-muted);
  user-select: none;
}

.border-tl, .border-tr, .border-bl, .border-br {
  color: currentColor;
  user-select: none;
}
```

### 2. Reply Activity - Thread Trace

**Terminal Aesthetic:**
```
╭─[THREAD_TRACE]──────────────────────────────────[ID: 0xb721]─╮
│ >> REPLY detected from @synthwave_kid                         │
│ >> In response to: @vibes_master | Thread: 0xa4f9             │
├─────────────────────────────────────────────────────────────┤
│ ┌────┐                                                       │
│ │ [■]│ "Come As You Are"                [SRC: YOUTUBE]      │
│ │IMG │ by Nirvana                                           │
│ └────┘                                                       │
│ >> COMMENT: "If we're doing grunge, this is essential..."   │
│                                                              │
│ ╰─→ Tracing back to original transmission...                │
│     │                                                        │
│     └─→ [PARENT_TRACK] "Everlong" by Foo Fighters           │
│         Posted by @vibes_master • 2h ago                    │
│                                                              │
│ [VIEW THREAD] [❤ 8] [💬 0]                                   │
╰──────────────────────────────────────────────────────────────╯
```

**Implementation Details:**

The Reply Activity block follows the same structure as Track Share but adds:

1. **Different header**: `THREAD_TRACE` instead of `INCOMING_PACKET`
2. **Reply metadata**: Shows original user and thread ID
3. **Thread connector**: ASCII art showing the connection to parent
4. **Simplified parent track**: Compact one-line representation

**Additional CSS:**

```css
.terminal-activity-block--reply {
  border-color: var(--activity-reply);
  box-shadow: 0 0 4px rgba(0, 255, 255, 0.2);
}

.terminal-activity-block--reply .terminal-block-header {
  color: var(--activity-reply);
  text-shadow: 0 0 4px var(--activity-reply);
  background: rgba(0, 255, 255, 0.03);
}

/* Thread trace connector */
.terminal-thread-trace {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--terminal-dim);
  font-size: 11px;
  position: relative;
  z-index: 2;
}

.trace-arrow {
  color: var(--neon-cyan);
  font-weight: 600;
}

.trace-indent {
  padding-left: 32px;
}

.trace-parent-track {
  color: var(--terminal-white);
  font-weight: 600;
}

.trace-label {
  color: var(--neon-cyan);
  font-weight: 600;
  text-transform: uppercase;
}

.trace-metadata {
  color: var(--terminal-dim);
  font-size: 10px;
}
```

### 3. Likes Activity - Engagement Metrics

**Terminal Aesthetic:**
```
╭─[ENGAGEMENT_SPIKE]──────────────────────────────[ID: 0xc893]─╮
│ >> LIKES_AGGREGATED: 12 nodes registered engagement          │
│ >> Target: "Everlong" by Foo Fighters | Peak: 1h ago         │
├─────────────────────────────────────────────────────────────┤
│ ┌────┐                                                       │
│ │ [■]│ "Everlong"                         [SRC: YOUTUBE]    │
│ │IMG │ by Foo Fighters                                      │
│ └────┘                                                       │
│                                                              │
│ >> ENGAGEMENT_GRAPH:                                         │
│    ████████████░░░░░░░░░░ 12 likes (62% of followers)       │
│                                                              │
│ >> MOST_ACTIVE_NODES:                                        │
│    [●] @user1  [●] @user2  [●] @user3  [●] @user4  +8 more  │
│                                                              │
│ [❤ 12] [💬 3] [VIEW THREAD]                                  │
╰──────────────────────────────────────────────────────────────╯
```

**Additional CSS:**

```css
.terminal-activity-block--like {
  border-color: var(--activity-like);
  box-shadow: 0 0 4px rgba(0, 255, 65, 0.2);
}

.terminal-activity-block--like .terminal-block-header {
  color: var(--activity-like);
  text-shadow: 0 0 4px var(--activity-like);
  background: rgba(0, 255, 65, 0.03);
}

/* Engagement bar */
.terminal-engagement-graph {
  padding: 4px 12px;
  color: var(--terminal-text);
  font-size: 11px;
  position: relative;
  z-index: 2;
}

.engagement-label {
  color: var(--neon-green);
  font-weight: 600;
}

.engagement-bar {
  display: flex;
  gap: 0;
  margin-top: 4px;
}

.engagement-bar-filled {
  color: var(--neon-green);
  text-shadow: 0 0 4px var(--neon-green);
}

.engagement-bar-empty {
  color: var(--terminal-muted);
}

.engagement-stats {
  margin-left: 8px;
  color: var(--terminal-text);
}

/* Active nodes list */
.terminal-active-nodes {
  padding: 4px 12px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  align-items: center;
  position: relative;
  z-index: 2;
}

.node-indicator {
  color: var(--neon-green);
  font-size: 8px;
  text-shadow: 0 0 4px var(--neon-green);
}

.node-username {
  color: var(--neon-magenta);
  font-size: 10px;
  font-weight: 600;
}

.node-more {
  color: var(--terminal-dim);
  font-size: 10px;
}
```

---

## Visual Effects: CRT Terminal Enhancements

### 1. Scan Lines

```css
/* Global scan line overlay */
.activity-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 255, 255, 0.02) 0px,
    transparent 1px,
    transparent 2px,
    rgba(0, 255, 255, 0.02) 3px
  );
  pointer-events: none;
  z-index: 9999;
}
```

### 2. CRT Screen Curvature Effect

```css
.activity-page {
  position: relative;
  overflow: hidden;
}

.activity-page::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    transparent 70%,
    rgba(0, 0, 0, 0.2) 90%,
    rgba(0, 0, 0, 0.5) 100%
  );
  pointer-events: none;
  z-index: 9998;
}
```

### 3. Glitch Effect (On Action)

```css
@keyframes glitch {
  0% {
    transform: translate(0);
    opacity: 1;
  }
  20% {
    transform: translate(-2px, 2px);
    opacity: 0.8;
  }
  40% {
    transform: translate(2px, -2px);
    opacity: 0.9;
  }
  60% {
    transform: translate(-1px, 1px);
    opacity: 0.85;
  }
  80% {
    transform: translate(1px, -1px);
    opacity: 0.95;
  }
  100% {
    transform: translate(0);
    opacity: 1;
  }
}

.terminal-activity-block.glitch-effect {
  animation: glitch 200ms ease-out;
}
```

### 4. Flicker Effect (On New Item)

```css
@keyframes flicker {
  0%, 100% {
    opacity: 1;
  }
  10% {
    opacity: 0.8;
  }
  20% {
    opacity: 1;
  }
  30% {
    opacity: 0.9;
  }
  40% {
    opacity: 1;
  }
}

.terminal-activity-block--new {
  animation: flicker 400ms ease-out;
}
```

### 5. Terminal Boot Sequence (Page Load)

```css
@keyframes terminal-boot {
  0% {
    opacity: 0;
    transform: scaleY(0);
    transform-origin: top;
  }
  50% {
    opacity: 0.5;
    transform: scaleY(0.5);
  }
  100% {
    opacity: 1;
    transform: scaleY(1);
  }
}

.activity-page {
  animation: terminal-boot 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

### 6. Data Stream Entry Animation

```css
@keyframes stream-in {
  0% {
    opacity: 0;
    transform: translateX(-100%);
    filter: blur(4px);
  }
  50% {
    opacity: 0.5;
    filter: blur(2px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
    filter: blur(0);
  }
}

.terminal-activity-block {
  animation: stream-in 400ms ease-out;
}

/* Stagger delays */
.terminal-activity-block:nth-child(1) { animation-delay: 0ms; }
.terminal-activity-block:nth-child(2) { animation-delay: 80ms; }
.terminal-activity-block:nth-child(3) { animation-delay: 160ms; }
.terminal-activity-block:nth-child(4) { animation-delay: 240ms; }
.terminal-activity-block:nth-child(5) { animation-delay: 320ms; }
```

---

## Interaction Design: Terminal Commands

### Playing a Track

**Visual Feedback:**

1. **Click/tap activity block** → Glitch effect
2. **Play button glow** → Neon green pulse
3. **Status change** → Border color shifts to green
4. **System message** → Brief notification

```css
.terminal-activity-block--playing {
  border-color: var(--neon-green);
  box-shadow:
    0 0 4px var(--neon-green),
    0 0 8px rgba(0, 255, 65, 0.3);
  animation: playing-pulse 2s ease-in-out infinite;
}

@keyframes playing-pulse {
  0%, 100% {
    box-shadow:
      0 0 4px var(--neon-green),
      0 0 8px rgba(0, 255, 65, 0.3);
  }
  50% {
    box-shadow:
      0 0 8px var(--neon-green),
      0 0 16px rgba(0, 255, 65, 0.4),
      0 0 24px rgba(0, 255, 65, 0.2);
  }
}
```

### Social Actions (Like/Reply)

**Visual Feedback:**

1. **Click button** → Scale down + glitch
2. **Count increments** → Number flickers
3. **Color change** → Gray → Neon color
4. **Brief flash** → Terminal message

```css
.terminal-action-btn--active {
  color: var(--neon-green);
  text-shadow: 0 0 6px var(--neon-green);
}

@keyframes count-update {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.5;
    color: var(--neon-yellow);
    text-shadow: 0 0 8px var(--neon-yellow);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.action-count.updating {
  animation: count-update 300ms ease-out;
}
```

### Loading States

**Terminal-style loading indicator:**

```
[████████████░░░░░░░░] Loading... 60%

or

> Fetching activity stream... [▓▓▓▓▓░░░░░]

or

>> DECODING TRANSMISSIONS [●●●○○○○] 3/7
```

**Implementation:**

```tsx
<div class="terminal-loading">
  <div class="loading-bracket">[</div>
  <div class="loading-bar">
    <span class="loading-filled">████████████</span>
    <span class="loading-empty">░░░░░░░░</span>
  </div>
  <div class="loading-bracket">]</div>
  <div class="loading-text">Loading... 60%</div>
</div>
```

```css
.terminal-loading {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family: var(--font-terminal);
  font-size: 12px;
  color: var(--neon-cyan);
}

.loading-filled {
  color: var(--neon-cyan);
  text-shadow: 0 0 4px var(--neon-cyan);
}

.loading-empty {
  color: var(--terminal-muted);
}

.loading-text {
  color: var(--terminal-text);
  margin-left: 8px;
  animation: loading-pulse 1s ease-in-out infinite;
}

@keyframes loading-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## Empty States: Terminal Messages

### No Activity

```
╭─[NETWORK_STATUS]──────────────────────────────────────────╮
│                                                            │
│                      [!] NO SIGNAL                         │
│                                                            │
│  >> No activity detected on your network                  │
│  >> Suggestion: Follow users or join networks to start    │
│     receiving transmissions                               │
│                                                            │
│  [DISCOVER NETWORKS] [FIND USERS]                         │
│                                                            │
╰────────────────────────────────────────────────────────────╯
```

### Loading Error

```
╭─[ERROR]────────────────────────────────────────────────────╮
│                                                            │
│  ⚠ CONNECTION FAILED                                       │
│                                                            │
│  >> Error code: 0xE_NETWORK                               │
│  >> Failed to establish connection to activity stream     │
│  >> Check your network connection and retry               │
│                                                            │
│  [RETRY] [DIAGNOSTICS]                                    │
│                                                            │
╰────────────────────────────────────────────────────────────╯
```

**CSS for Empty States:**

```css
.terminal-empty-state {
  background: var(--terminal-bg);
  border: 1px solid var(--neon-red);
  padding: 24px;
  margin: 24px 16px;
  font-family: var(--font-terminal);
  text-align: center;
  box-shadow: 0 0 8px rgba(255, 0, 64, 0.2);
}

.empty-state-icon {
  font-size: 32px;
  color: var(--neon-yellow);
  text-shadow: 0 0 8px var(--neon-yellow);
  margin-bottom: 16px;
}

.empty-state-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--neon-red);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
  text-shadow: 0 0 6px var(--neon-red);
}

.empty-state-message {
  font-size: 12px;
  color: var(--terminal-text);
  line-height: 1.6;
  margin-bottom: 24px;
}

.empty-state-arrow {
  color: var(--neon-cyan);
  margin-right: 4px;
}

.empty-state-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.empty-state-btn {
  background: transparent;
  border: 1px solid var(--neon-cyan);
  color: var(--neon-cyan);
  font-family: var(--font-terminal);
  font-size: 11px;
  font-weight: 700;
  padding: 8px 16px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 200ms ease;
  text-shadow: 0 0 4px var(--neon-cyan);
  box-shadow: 0 0 4px rgba(0, 255, 255, 0.2);
}

.empty-state-btn:active {
  background: rgba(0, 255, 255, 0.1);
  transform: scale(0.98);
  box-shadow:
    0 0 8px rgba(0, 255, 255, 0.4),
    inset 0 0 8px rgba(0, 255, 255, 0.1);
}
```

---

## Responsive Behavior

### Mobile Optimizations

**Key Adjustments:**

1. **Smaller ASCII borders**: Use lighter box-drawing characters
2. **Compact metadata**: Hide non-essential info
3. **Larger tap targets**: Ensure buttons are at least 44px
4. **Horizontal scrolling**: Allow command line to scroll
5. **Simplified headers**: Fewer details, more focus

**Mobile-specific CSS:**

```css
@media (max-width: 640px) {
  /* Smaller terminal blocks */
  .terminal-activity-block {
    font-size: 10px;
    margin-bottom: 12px;
  }

  /* Compact header */
  .terminal-header {
    font-size: 10px;
    padding: 6px 8px;
  }

  /* Hide less critical metadata */
  .info-separator:last-of-type,
  .info-label:last-of-type,
  .info-value:last-of-type {
    display: none;
  }

  /* Larger touch targets */
  .terminal-action-btn,
  .terminal-play-btn {
    min-height: 44px;
    padding: 8px 12px;
  }

  /* Simplified borders */
  .terminal-block-header,
  .terminal-block-footer,
  .terminal-block-divider {
    font-size: 8px;
  }

  /* Smaller thumbnails */
  .thumbnail-image-wrapper {
    height: 48px;
  }

  .thumbnail-image {
    width: 48px;
    height: 48px;
  }
}
```

---

## Implementation Priority

### Phase 1: Core Terminal Structure (MVP)

**Focus:** Get the terminal aesthetic foundation in place

1. **Terminal header** with command prompt
2. **Terminal activity blocks** with ASCII borders
3. **Monospace typography** throughout
4. **Basic neon colors** and glows
5. **Scan line overlays**

**Deliverables:**
- Terminal header component
- Base terminal activity block component
- Terminal CSS utilities
- Updated TrackShareActivity component
- Updated ReplyActivity component
- Updated LikesActivity component

### Phase 2: Visual Effects

**Focus:** Add CRT/terminal visual effects

1. **Scan lines** (horizontal lines)
2. **CRT vignette** (screen edge darkness)
3. **Glitch effects** on interactions
4. **Flicker animations** for new items
5. **Terminal boot sequence**
6. **Data stream animations**

**Deliverables:**
- CSS animation utilities
- Effect overlay components
- Interaction animation handlers

### Phase 3: Terminal Interactions

**Focus:** Make interactions feel like terminal commands

1. **Enhanced button interactions** (glitch + glow)
2. **Terminal loading states** (progress bars)
3. **System notifications** (terminal messages)
4. **Error states** (terminal error format)
5. **Empty states** (no signal messages)

**Deliverables:**
- Terminal button components
- Loading indicator component
- Notification system
- Error boundary with terminal styling

### Phase 4: Polish & Optimization

**Focus:** Performance and mobile refinements

1. **Mobile-optimized layouts**
2. **Performance optimization** (reduce effects on low-end devices)
3. **Accessibility improvements**
4. **Dark mode refinements**
5. **Edge case handling**

---

## Technical Implementation Notes

### Component Structure

```tsx
// New components to create:

// Terminal header with command prompt
<TerminalHeader
  activeNodes={147}
  latency={12}
  bandwidth="2.3MB/s"
  filter="all"
/>

// Terminal activity block wrapper
<TerminalActivityBlock
  type="share" | "reply" | "like"
  packetId={generateId()}
  timestamp={timestamp}
  className={additionalClasses}
>
  {children}
</TerminalActivityBlock>

// Terminal button component
<TerminalButton
  variant="action" | "play" | "primary"
  icon={icon}
  count={count}
  onClick={handler}
>
  {label}
</TerminalButton>
```

### CSS Variables to Add

```css
:root {
  /* Terminal colors */
  --terminal-black: #000000;
  --terminal-bg: #0a0a0a;
  --terminal-dark: #0f0f0f;
  --terminal-panel: #121212;
  --terminal-white: #ffffff;
  --terminal-text: #e0e0e0;
  --terminal-dim: #808080;
  --terminal-muted: #404040;

  /* Neon colors (more aggressive) */
  --neon-green: #00ff41;
  --neon-cyan: #00ffff;
  --neon-blue: #0080ff;
  --neon-magenta: #ff00ff;
  --neon-yellow: #ffff00;
  --neon-red: #ff0040;
  --neon-orange: #ff8000;

  /* Activity type colors */
  --activity-share: var(--neon-blue);
  --activity-reply: var(--neon-cyan);
  --activity-like: var(--neon-green);
  --activity-error: var(--neon-red);

  /* Terminal font */
  --font-terminal: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', 'Courier New', monospace;
}
```

### Animation Utilities

```tsx
// Animation helper functions
export const terminalAnimations = {
  glitch: (element: HTMLElement) => {
    element.classList.add('glitch-effect');
    setTimeout(() => element.classList.remove('glitch-effect'), 200);
  },

  flicker: (element: HTMLElement) => {
    element.classList.add('terminal-activity-block--new');
    setTimeout(() => element.classList.remove('terminal-activity-block--new'), 400);
  },

  countUpdate: (element: HTMLElement) => {
    element.classList.add('updating');
    setTimeout(() => element.classList.remove('updating'), 300);
  },

  playingPulse: (element: HTMLElement, playing: boolean) => {
    if (playing) {
      element.classList.add('terminal-activity-block--playing');
    } else {
      element.classList.remove('terminal-activity-block--playing');
    }
  }
};
```

---

## Accessibility Considerations

### Terminal Accessibility

Even with the terminal aesthetic, maintain accessibility:

**Screen Reader Announcements:**
```html
<div aria-live="polite" aria-atomic="true" class="sr-only">
  New activity: {username} shared {trackTitle}
</div>
```

**Semantic HTML:**
```html
<article
  class="terminal-activity-block"
  aria-label="{username} shared {track} {timestamp}"
  role="article"
>
  {/* Terminal-styled content */}
</article>
```

**Keyboard Navigation:**
- All interactive elements remain keyboard accessible
- Focus states use neon glows instead of standard outlines
- Tab order follows logical terminal flow

**Focus States:**
```css
.terminal-action-btn:focus-visible,
.terminal-play-btn:focus-visible {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 2px;
  box-shadow:
    0 0 4px var(--neon-cyan),
    0 0 8px rgba(0, 255, 255, 0.4);
}
```

**Color Contrast:**
- Terminal text on dark background: High contrast maintained
- Neon colors bright enough for readability
- Dim text still meets WCAG AA standards

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Remove scan lines */
  .terminal-activity-block::before,
  .activity-page::before {
    display: none;
  }
}
```

---

## Testing Checklist

### Visual Testing

- [ ] ASCII borders render correctly
- [ ] Monospace fonts load and display properly
- [ ] Neon glows appear with correct intensity
- [ ] Scan lines overlay without performance issues
- [ ] CRT vignette effect visible but not distracting
- [ ] Animations smooth at 60fps
- [ ] Colors vibrant and cyberpunk-appropriate

### Interaction Testing

- [ ] Play button triggers glitch effect
- [ ] Social actions update with flicker
- [ ] Count updates animate properly
- [ ] Playing state shows pulsing border
- [ ] Hover states work (desktop)
- [ ] Active states work (mobile touch)
- [ ] Loading states display terminal-style

### Responsive Testing

- [ ] Mobile: Compact layout works
- [ ] Mobile: Touch targets adequate (44px+)
- [ ] Mobile: Horizontal scroll for long command lines
- [ ] Tablet: Optimal spacing maintained
- [ ] Desktop: Full terminal aesthetic
- [ ] ASCII borders adapt to screen size

### Accessibility Testing

- [ ] Screen reader announces activity correctly
- [ ] Keyboard navigation works
- [ ] Focus states visible (neon glow)
- [ ] Color contrast meets WCAG AA
- [ ] Reduced motion preference respected
- [ ] Semantic HTML structure maintained

### Performance Testing

- [ ] Scan lines don't cause jank
- [ ] CRT effects don't impact scroll performance
- [ ] Animations run at 60fps
- [ ] Large activity lists remain smooth
- [ ] Effects can be disabled on low-end devices

---

## Design Principles Recap

### What Makes This Cyberpunk Terminal

1. **All Monospace Fonts** - Creates consistent terminal text aesthetic
2. **ASCII Box Borders** - Classic terminal window framing
3. **Aggressive Neon Glows** - Cyberpunk color intensity
4. **Scan Lines & CRT Effects** - Retro screen authenticity
5. **Terminal Command Metaphor** - System messages and prompts
6. **Data Stream Presentation** - Activity as network packets
7. **System Status Indicators** - Live monitoring dashboard feel
8. **Glitch & Flicker Effects** - Digital artifact authenticity
9. **Hard Edges (No Rounding)** - Sharp, technical aesthetic
10. **Metadata Visibility** - Show the technical details

### Avoid These Pitfalls

- [ ] Don't make ASCII borders too heavy (they should enhance, not dominate)
- [ ] Don't overuse glitch effects (subtle is better)
- [ ] Don't sacrifice readability for aesthetics
- [ ] Don't make neon glows too bright (eye strain)
- [ ] Don't forget mobile optimization (terminal should work on all devices)
- [ ] Don't lose the music focus (terminal is the wrapper, music is the content)

---

## Summary: Key Differences from Previous Design

| Aspect | Previous Design | Terminal Style |
|--------|----------------|----------------|
| **Typography** | Mixed fonts (Display, Interface, Mono for comments) | 100% monospace everywhere |
| **Borders** | 1px solid lines, rounded corners | ASCII box-drawing characters, hard edges |
| **Colors** | Subtle rgba backgrounds | Aggressive neon with strong glows |
| **Metadata** | Minimal, clean presentation | Verbose, system-style data display |
| **Headers** | Simple title | Full command prompt with system info |
| **Effects** | Smooth gradients, soft glows | Scan lines, CRT vignette, glitch effects |
| **Interactions** | Modern UI patterns | Terminal command aesthetic |
| **Loading** | Skeleton cards | Terminal progress bars |
| **Empty States** | Friendly messages | System error/status messages |

---

**End of Terminal-Style Design Plan**

This design transforms the Activity Page into an authentic cyberpunk terminal experience while maintaining usability, accessibility, and the core social music discovery functionality. All specifications are implementation-ready for AI agents to execute directly.
