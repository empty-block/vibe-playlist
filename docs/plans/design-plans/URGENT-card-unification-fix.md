# URGENT: Card Design Unification - Implementation Fix

## Problem Analysis

The previous implementation added superficial ASCII decorations but FAILED to actually unify the card designs. The cards still use custom CSS classes and don't follow the same structure as the existing activity cards.

## Root Cause

We created new CSS classes and custom layouts instead of using the EXISTING, PROVEN structure from the activity cards (TrackShareActivity, ReplyActivity, LikesActivity).

## Solution: Copy Activity Card Structure EXACTLY

### Core Structure Pattern (from activity cards)

All cards must follow this EXACT pattern:

```tsx
<div class="terminal-activity-block terminal-activity-block--[type]">
  {/* Top border */}
  <div class="terminal-block-header">
    <span>╭─────────────────────────────────────────────────────────────┬──[0x{id}]─╮</span>
  </div>

  {/* Metadata line */}
  <div class="terminal-block-meta">
    <span class="border-v">│</span>
    {/* Content with vertical borders on both sides */}
    <span class="border-v">│</span>
  </div>

  {/* Divider */}
  <div class="terminal-block-divider">
    <span>├─────────────────────────────────────────────────────────────┤</span>
  </div>

  {/* Content */}
  <div class="terminal-block-content">
    <span class="border-v">│</span>
    <div class="terminal-track-row">
      {/* Track thumbnail */}
      <div class="terminal-thumbnail">
        <div class="thumbnail-border-top">┌─┐</div>
        <img src="..." class="thumbnail-image" />
        <div class="thumbnail-border-bottom">└─┘</div>
      </div>

      {/* Track info */}
      <div class="terminal-track-info">
        <div class="track-title-line">
          <span class="track-title">"{title}"</span>
          <span class="track-source">[SRC: {source}]</span>
        </div>
        <div class="track-artist-line">
          <span class="track-label">by</span>
          <span class="track-artist">{artist}</span>
        </div>
      </div>
    </div>
    <span class="border-v">│</span>
  </div>

  {/* Actions */}
  <div class="terminal-block-actions">
    <span class="border-v">│</span>
    <div class="terminal-social-row">
      <button class="terminal-action-btn">...</button>
      <button class="terminal-play-btn">...</button>
    </div>
    <span class="border-v">│</span>
  </div>

  {/* Bottom border */}
  <div class="terminal-block-footer">
    <span>╰──────────────────────────────────────────────────────────────╯</span>
  </div>
</div>
```

### Key CSS Classes to Reuse

From `terminal.css`:
- `.terminal-activity-block` - Base card container
- `.terminal-activity-block--track` - Track card variant (magenta accent)
- `.terminal-activity-block--thread` - Thread card variant (cyan accent)
- `.terminal-block-header` - Top border
- `.terminal-block-meta` - Metadata line
- `.terminal-block-divider` - Horizontal dividers
- `.terminal-block-content` - Content area
- `.terminal-block-actions` - Actions row
- `.terminal-block-footer` - Bottom border
- `.terminal-track-row` - Track display flex container
- `.terminal-thumbnail` - Thumbnail wrapper
- `.thumbnail-image` - Album art image
- `.terminal-track-info` - Track info container
- `.track-title`, `.track-artist`, `.track-source` - Text styles
- `.terminal-social-row` - Social buttons container
- `.terminal-action-btn` - Action buttons
- `.terminal-play-btn` - Play button
- `.border-v` - Vertical border character

### Type-Specific Colors

Add to terminal.css if not present:
```css
.terminal-activity-block--track {
  border-color: var(--neon-magenta);
  box-shadow: 0 0 4px rgba(255, 0, 255, 0.1);
}

.terminal-activity-block--track .terminal-block-header {
  color: var(--neon-magenta);
  text-shadow: 0 0 2px var(--neon-magenta);
  background: rgba(255, 0, 255, 0.03);
}

.terminal-activity-block--thread {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 4px rgba(0, 255, 255, 0.1);
}

.terminal-activity-block--thread .terminal-block-header {
  color: var(--neon-cyan);
  text-shadow: 0 0 2px var(--neon-cyan);
  background: rgba(0, 255, 255, 0.03);
}
```

## Implementation Steps

### 1. CompactTrackCard.tsx
- Replace entire component structure to match activity cards
- Use `.terminal-activity-block--track` variant
- Keep it compact by showing image prominently
- Reuse ALL classes from terminal.css
- Remove custom CSS file (compactCard.css)

### 2. HeroTrackCard.tsx
- Replace entire component structure to match activity cards
- Use `.terminal-activity-block--track` variant
- Include metadata line for social context
- Add comment section when present
- Reuse ALL classes from terminal.css
- Remove custom CSS file (heroCard.css)

### 3. RowTrackCard.tsx
- Replace entire component structure to match activity cards
- Use `.terminal-activity-block--track` variant
- Horizontal layout for track info
- Reuse ALL classes from terminal.css
- Remove custom CSS file (rowCard.css if exists)

### 4. ThreadCard.tsx
- Replace entire component structure to match activity cards
- Use `.terminal-activity-block--thread` variant (cyan accent)
- Include user info in metadata line
- Show thread text in content area
- Optional track preview using same terminal-thumbnail structure
- Reuse ALL classes from terminal.css
- Remove custom CSS file (threadCard.css)

### 5. Clean Up
- Delete all custom card CSS files (compactCard.css, heroCard.css, threadCard.css, rowCard.css)
- Delete terminal-cards.css if it exists
- All styling comes from terminal.css only

## Design Specifications

### Color Accents
- **Track cards**: Magenta (`--neon-magenta: #ff00ff`)
- **Thread cards**: Cyan (`--neon-cyan: #00ffff`)
- **Activity cards**: Blue for share, cyan for reply, green for likes

### Border Pattern
- All cards: Same width ASCII borders
- Top: `╭─...─┬──[0x{ID}]─╮`
- Dividers: `├─...─┤`
- Bottom: `╰─...─╯`
- Vertical: `│` with class="border-v"

### Typography
- Font: JetBrains Mono (terminal font)
- Track titles: 13px, bold, white
- Artists: 12px, cyan
- Metadata: 11px, dim gray
- Source labels: 9px, uppercase

### Spacing
- Padding: 12px horizontal, 8px vertical (from terminal.css)
- Gap between elements: 8px-12px
- Track row gap: 12px

### Interactive States
- Hover: Cyan glow
- Active: Green pulse
- Playing: Green border with pulsing shadow

## Testing Checklist

After implementation, verify:
- [ ] All cards use terminal-activity-block base class
- [ ] Track cards have magenta accent
- [ ] Thread cards have cyan accent
- [ ] Vertical borders on every content line
- [ ] Same thumbnail structure (with ASCII borders)
- [ ] Same button styles
- [ ] Same spacing and padding
- [ ] No custom CSS files (only terminal.css)
- [ ] Cards look visually identical in structure to activity cards
- [ ] Only content differs (track vs activity info)

## Success Criteria

When complete:
1. All cards look like they're part of the same terminal interface
2. Visual structure is IDENTICAL across all card types
3. Only differences are content and accent colors
4. No custom CSS classes, only terminal.css classes
5. User sees a unified, cohesive design system
