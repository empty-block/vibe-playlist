# Thread Card Avatar Integration - Design Plan

**Task**: TASK-591 - Add avatar to thread card
**Date**: 2025-10-02
**Status**: Ready for Implementation
**Design Philosophy**: Enhance visual appeal while maintaining cyberpunk terminal aesthetic

---

## 1. Design Context & Analysis

### Current State
The thread cards on the homepage (ThreadsPage) feature a cyberpunk terminal aesthetic with:
- ASCII-style borders (`╭─`, `│`, `├─`, `╰─`)
- Monospace terminal font (JetBrains Mono)
- Neon magenta color scheme (`#e010e0`)
- Compact information density
- Text-first layout with optional track preview

**Current Thread Card Structure:**
```
╭─ Thread #xxxx ─────────────────────────╮
│>> @username: Thread text here...       │
├──────────────────────────────────────────┤
│[Track preview if present]               │
├──────────────────────────────────────────┤
│💬 replies • ❤ likes        timestamp    │
╰─────────────────────────────────────────╯
```

### Problem Statement
The current design lacks visual identity and human connection. Without avatars:
- Cards feel text-heavy and impersonal
- Harder to quickly identify content creators
- Misses opportunity for visual scanning and recognition
- Less engaging compared to standard social feeds

### Design Goals
1. **Add Visual Identity**: Include user avatars for immediate creator recognition
2. **Maintain Terminal Aesthetic**: Preserve cyberpunk terminal design language
3. **Improve Scannability**: Make cards easier to visually parse at a glance
4. **Keep Information Density**: Don't sacrifice content for decoration
5. **Responsive Design**: Work beautifully on mobile and desktop

---

## 2. Design Solution

### Conceptual Approach
**Philosophy**: "Terminal meets social" - We're adding a human element (avatar) to a technical interface (terminal) without breaking the immersion.

**Key Insight**: The avatar should feel like part of the terminal output, not a foreign element. Think of it as a user icon in a terminal prompt rather than a social media profile picture.

### Layout Decision: Integrated Header Line

**Selected Approach**: Move user information to its own dedicated line with avatar at the start, creating a clear visual hierarchy:

```
╭─ Thread #xxxx ─────────────────────────╮
│◉ @username · 2h                         │  ← NEW: Avatar + user info line
├──────────────────────────────────────────┤
│Thread text goes here, can be multi-line │  ← Thread content
│and includes expandable text...          │
├──────────────────────────────────────────┤
│[Track preview section if present]       │
├──────────────────────────────────────────┤
│💬 5 replies • ❤ 12 likes                │  ← Stats only
╰─────────────────────────────────────────╯
```

**Why this approach?**
- **Clear separation of concerns**: Author info → Content → Track → Stats
- **Better scannability**: Avatar + username create visual anchor
- **Terminal-native**: Feels like a `user@system` prompt line
- **Flexible**: Content can breathe on its own line(s)
- **Mobile-friendly**: Stacks naturally on small screens

---

## 3. Visual Design Specifications

### 3.1 Avatar Design

**Size & Shape:**
- Desktop: `28px × 28px` (compact, terminal-appropriate)
- Mobile: `24px × 24px` (scaled for smaller screens)
- Shape: `border-radius: 50%` (circle)

**Border & Glow:**
- Border: `1.5px solid var(--neon-magenta)` (`#e010e0`)
- Box shadow: `0 0 3px rgba(224, 16, 224, 0.25)` (subtle neon glow)
- Background: Terminal black if image fails to load

**Visual Treatment:**
```css
.thread-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid var(--neon-magenta);
  box-shadow: 0 0 3px rgba(224, 16, 224, 0.25);
  object-fit: cover;
  flex-shrink: 0;
  background: var(--terminal-bg);
}

/* Mobile optimization */
@media (max-width: 640px) {
  .thread-avatar {
    width: 24px;
    height: 24px;
  }
}
```

### 3.2 User Info Line Layout

**Structure:**
```
│[Avatar 28px] @username · timestamp    │
```

**Spacing:**
- Left padding: `12px` (from border)
- Avatar → Username gap: `8px`
- Username → Separator gap: `6px`
- Separator → Timestamp gap: `6px`
- Right padding: `12px` (to border)

**CSS Implementation:**
```css
.thread-user-line {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 11px;
  line-height: 1.4;
}

.thread-username {
  color: var(--neon-magenta);
  font-weight: 600;
  cursor: pointer;
  transition: text-shadow 200ms ease;
}

.thread-username:hover {
  text-shadow: 0 0 2px var(--neon-magenta);
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
```

### 3.3 Revised Content Section

**Remove inline username, keep content pure:**
```css
.thread-card-content {
  padding: 8px 12px;
  color: var(--terminal-text);
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

/* Remove the >> @username: pattern */
/* Keep border and content text */
.thread-text {
  color: var(--terminal-white);
  font-size: 13px;
  line-height: 1.5;
  flex: 1;
}
```

### 3.4 Revised Footer (Stats Only)

**Remove timestamp from footer (now in header):**
```css
.thread-card-footer {
  padding: 6px 12px;
  color: var(--terminal-dim);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
}

/* No timestamp here anymore - it's in the user line */
.thread-stat {
  display: flex;
  align-items: center;
  gap: 4px;
}
```

---

## 4. Component Structure

### 4.1 Updated Component Props
```typescript
interface ThreadCardProps {
  threadId: string;
  threadText: string;
  creatorUsername: string;
  creatorAvatar?: string;  // Already exists! Just need to use it
  timestamp: string;
  replyCount: number;
  likeCount: number;
  starterTrack?: {
    id: string;
    title: string;
    artist: string;
    albumArt: string;
    source: string;
  };
  onCardClick?: () => void;
  onUsernameClick?: (e: Event) => void;
  onArtistClick?: (e: Event) => void;
}
```

### 4.2 Updated JSX Structure
```tsx
<article class="terminal-thread-card" onClick={handleCardClick}>
  {/* Top border */}
  <div class="thread-card-header">
    <span>╭─ Thread </span>
    <span class="thread-id">#{props.threadId.slice(-4)}</span>
    <span> ─────────────────────────╮</span>
  </div>

  {/* NEW: User info line with avatar */}
  <div class="thread-user-line">
    <span class="border-v">│</span>
    <img
      src={props.creatorAvatar}
      class="thread-avatar"
      alt={`${props.creatorUsername}'s avatar`}
      loading="lazy"
    />
    <span
      class="thread-username"
      onClick={handleUsernameClick}
      role="button"
      tabindex="0"
    >
      @{props.creatorUsername}
    </span>
    <span class="thread-separator">·</span>
    <span class="thread-timestamp-inline">
      {formatTimeAgo(props.timestamp)}
    </span>
    <span class="border-v" style={{ 'margin-left': 'auto' }}>│</span>
  </div>

  {/* Divider between user and content */}
  <div class="thread-card-divider">
    <span>├──────────────────────────────────────────┤</span>
  </div>

  {/* Content - simplified, no username prefix */}
  <div class="thread-card-content">
    <span class="border-v">│</span>
    <span class="thread-text">
      <ExpandableText
        text={props.threadText}
        maxLength={80}
        className="thread-text-content"
      />
    </span>
    <span class="border-v" style={{ 'margin-left': 'auto' }}>│</span>
  </div>

  {/* Track preview (unchanged) */}
  <Show when={props.starterTrack}>
    {/* ... existing track preview code ... */}
  </Show>

  {/* Footer - stats only, no timestamp */}
  <div class="thread-card-divider">
    <span>├──────────────────────────────────────────┤</span>
  </div>
  <div class="thread-card-footer">
    <span class="border-v">│</span>
    <span class="thread-stat">💬 {props.replyCount}</span>
    <span>•</span>
    <span class="thread-stat">❤ {props.likeCount}</span>
    <span class="border-v" style={{ 'margin-left': 'auto' }}>│</span>
  </div>

  {/* Bottom border */}
  <div class="thread-card-header">
    <span>╰─────────────────────────────────────────╯</span>
  </div>
</article>
```

---

## 5. Interactive States

### 5.1 Avatar States

**Default State:**
- Subtle magenta glow
- Crisp border

**Hover State (when username is hovered):**
```css
.thread-username:hover ~ .thread-avatar,
.thread-username:hover + .thread-avatar {
  border-color: var(--neon-magenta-bright);
  box-shadow: 0 0 6px rgba(224, 16, 224, 0.5);
}
```

**Focus State (keyboard navigation):**
```css
.thread-username:focus ~ .thread-avatar {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 2px;
}
```

### 5.2 Card Hover State (unchanged)
```css
.terminal-thread-card:hover {
  border-color: var(--neon-magenta);
  box-shadow: 0 0 4px rgba(224, 16, 224, 0.15);
}
```

---

## 6. Accessibility Considerations

### 6.1 Image Alt Text
- Always provide meaningful alt text: `{username}'s avatar`
- Use `loading="lazy"` for performance

### 6.2 Keyboard Navigation
- Username remains focusable and clickable
- Avatar is decorative (doesn't need separate focus)
- Maintain logical tab order: card → username → artist (if present)

### 6.3 Screen Reader Support
```tsx
<img
  src={props.creatorAvatar}
  class="thread-avatar"
  alt={`${props.creatorUsername}'s avatar`}
  role="img"
  loading="lazy"
/>
```

### 6.4 Fallback for Missing Avatars
```tsx
<Show
  when={props.creatorAvatar}
  fallback={
    <div class="thread-avatar-fallback" aria-hidden="true">
      <span>@</span>
    </div>
  }
>
  <img src={props.creatorAvatar!} class="thread-avatar" alt={...} />
</Show>
```

**Fallback Styling:**
```css
.thread-avatar-fallback {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid var(--neon-magenta);
  background: var(--terminal-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neon-magenta);
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}
```

---

## 7. Responsive Behavior

### 7.1 Desktop (≥768px)
- Avatar: 28px
- Full layout with all elements visible
- Generous spacing for comfortable scanning

### 7.2 Tablet (640px-768px)
- Avatar: 28px (maintain for readability)
- Slightly tighter spacing if needed

### 7.3 Mobile (<640px)
- Avatar: 24px (scaled down)
- Font sizes reduce appropriately
- Maintain single-line user info
- Timestamp may abbreviate ("2h" vs "2 hours ago")

**Mobile-specific CSS:**
```css
@media (max-width: 640px) {
  .thread-user-line {
    padding: 6px 8px;
    font-size: 10px;
    gap: 6px;
  }

  .thread-avatar {
    width: 24px;
    height: 24px;
  }

  .thread-timestamp-inline {
    font-size: 9px;
  }
}
```

---

## 8. Performance Considerations

### 8.1 Image Loading
- Use `loading="lazy"` on all avatars
- Implement proper image caching
- Consider WebP format if backend supports

### 8.2 Animation Performance
- Hover transitions use GPU-accelerated properties only
- Avoid layout thrashing with `will-change: transform` on hover elements

### 8.3 Layout Optimization
- Use flexbox for user line (efficient, well-supported)
- Minimize repaints by keeping borders as pseudo-elements where possible

---

## 9. Implementation Checklist

### Phase 1: Component Structure
- [ ] Add new `thread-user-line` div after top border
- [ ] Add avatar image with fallback
- [ ] Move username to user line
- [ ] Add timestamp to user line
- [ ] Remove `meta-arrow` and inline username from content section
- [ ] Remove timestamp from footer

### Phase 2: Styling
- [ ] Create `.thread-user-line` styles
- [ ] Create `.thread-avatar` styles
- [ ] Create `.thread-avatar-fallback` styles
- [ ] Create `.thread-username` styles (adjust from current)
- [ ] Create `.thread-separator` styles
- [ ] Create `.thread-timestamp-inline` styles
- [ ] Update `.thread-card-content` (remove username styling)
- [ ] Update `.thread-card-footer` (remove timestamp styling)

### Phase 3: Responsive
- [ ] Add mobile breakpoint styles for avatar (24px)
- [ ] Test layout on 320px width (smallest phones)
- [ ] Test layout on 768px width (tablets)
- [ ] Test layout on 1024px+ (desktop)

### Phase 4: Accessibility
- [ ] Add proper alt text to avatars
- [ ] Test keyboard navigation flow
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Verify focus indicators are visible
- [ ] Test fallback avatar appearance

### Phase 5: Polish
- [ ] Test hover states on all interactive elements
- [ ] Verify neon glow effects work correctly
- [ ] Test with long usernames (truncation needed?)
- [ ] Test with missing avatar URLs
- [ ] Verify loading="lazy" works correctly

---

## 10. Design Rationale

### Why a Separate User Line?
**Alternative considered**: Keep username inline with content like `│>> @username: Thread text...`

**Decision**: Separate line wins because:
1. **Visual hierarchy**: Clear separation between "who" and "what"
2. **Avatar integration**: Natural place for avatar without cramping content
3. **Scannability**: Eyes can quickly scan left edge for avatars and usernames
4. **Flexibility**: Content can span multiple lines without awkward username wrapping
5. **Terminal authenticity**: Mimics common terminal output patterns like `user@host:~$`

### Why Small Avatars (28px)?
**Alternative considered**: Larger avatars (40px-48px) like traditional social feeds

**Decision**: 28px wins because:
1. **Information density**: Maintains compact, terminal-like feel
2. **Not the hero**: Thread text is the star, avatar is supporting cast
3. **Mobile-friendly**: Scales well to 24px without losing clarity
4. **Proportional**: Matches the 11px font size of the user line
5. **Terminal aesthetic**: Small, efficient, data-dense

### Why Magenta Glow?
**Alternative considered**: Cyan glow (like track artists) or no glow

**Decision**: Magenta wins because:
1. **Consistency**: Usernames throughout the app use neon-magenta
2. **Visual language**: Magenta = user content, Cyan = music content
3. **Brand alignment**: Magenta is a primary brand color
4. **Hierarchy**: Differentiates user elements from system elements

### Why Move Timestamp?
**Alternative considered**: Keep timestamp in footer with stats

**Decision**: Move to user line because:
1. **Context**: Timestamp relates to the post creation, not the stats
2. **Grouping**: User info (avatar, username, timestamp) naturally cluster
3. **Footer simplification**: Footer becomes purely about engagement metrics
4. **Visual balance**: Prevents footer from being too crowded

---

## 11. Visual Examples

### Before (Current):
```
╭─ Thread #a1b2 ─────────────────────────╮
│>> @musiclover: What's your favorite...  │
├──────────────────────────────────────────┤
│💬 5 • ❤ 12                        2h    │
╰─────────────────────────────────────────╯
```

### After (Proposed):
```
╭─ Thread #a1b2 ─────────────────────────╮
│◉ @musiclover · 2h                       │
├──────────────────────────────────────────┤
│What's your favorite song right now?     │
├──────────────────────────────────────────┤
│💬 5 • ❤ 12                              │
╰─────────────────────────────────────────╯
```

**Visual improvements:**
- ✅ Avatar adds immediate visual recognition
- ✅ Content is cleaner without inline metadata
- ✅ Clear visual hierarchy: User → Content → Stats
- ✅ More scannable for quick browsing
- ✅ Maintains terminal aesthetic with integrated design

---

## 12. Edge Cases

### Missing Avatar URL
- **Solution**: Show fallback with "@" symbol in magenta
- **Styling**: Same size, border, and position as real avatar

### Very Long Usernames
- **Solution**: Truncate with ellipsis after ~15 characters
- **CSS**: `max-width: 120px; overflow: hidden; text-overflow: ellipsis;`

### No Track Preview
- **Behavior**: Layout remains clean, just skips track section
- **Visual**: Content divider connects directly to footer divider

### RTL Languages
- **Consideration**: Avatar should flip to right side
- **CSS**: Use logical properties: `margin-inline-start` instead of `margin-left`

---

## 13. Success Metrics

### Qualitative Goals
- [ ] Cards feel more personal and engaging
- [ ] User recognition improves (can spot creators at a glance)
- [ ] Terminal aesthetic remains intact
- [ ] Layout feels balanced and uncluttered

### Technical Goals
- [ ] No performance degradation (maintain 60fps scrolling)
- [ ] Images lazy-load correctly
- [ ] Accessibility score maintains 100/100
- [ ] No layout shift when avatars load

---

## 14. Future Enhancements (Out of Scope)

### Possible Future Iterations
1. **Avatar hover cards**: Show user profile preview on avatar hover
2. **Online indicators**: Small dot for active users
3. **Verified badges**: Special border style for verified users
4. **Avatar animations**: Subtle pulse on new posts
5. **Customization**: Users can choose avatar border color

### Not Recommended
- ❌ Larger avatars (breaks terminal density)
- ❌ Avatar-only view (loses context)
- ❌ Animated avatars (distracting, performance cost)
- ❌ Square avatars (less friendly, harder to spot)

---

## 15. Implementation Files

### Files to Modify
1. **Component**: `/mini-app/src/components/common/TrackCard/NEW/ThreadCard.tsx`
   - Add user line JSX structure
   - Add avatar img element
   - Remove inline username from content
   - Move timestamp to user line

2. **Styles**: `/mini-app/src/pages/threads.css`
   - Add `.thread-user-line` styles
   - Add `.thread-avatar` styles
   - Add `.thread-avatar-fallback` styles
   - Add `.thread-timestamp-inline` styles
   - Update `.thread-card-content` styles
   - Update `.thread-card-footer` styles
   - Add mobile responsive styles

### Files to Test
- `/mini-app/src/pages/ThreadsPage.tsx` (main usage)
- `/mini-app/src/pages/ThreadViewPage.tsx` (also uses ThreadCard)

---

## 16. Final Design Principles Summary

This design follows Jamzy's core principles:

1. **Retro UI, Modern Style**: Terminal borders meet modern social patterns
2. **Info Dense, Visually Engaging**: Avatar adds visual interest without sacrificing content
3. **Details Matter**: Subtle neon glow, careful spacing, perfect alignment
4. **Simple Solutions**: Direct, minimal changes to existing structure
5. **Natural Proportions**: 28px avatar aligns with 8px spacing system (3.5 × 8)

**The Zen Approach**: We're not redesigning the card—we're evolving it. The avatar feels like it was always meant to be there, integrated naturally into the terminal aesthetic. Like adding a profile picture to a command prompt: technical yet human.

---

**Design Status**: ✅ Ready for Implementation
**Estimated Complexity**: Low-Medium
**Estimated Time**: 1-2 hours
**Risk Level**: Low (non-breaking, additive changes)

**Next Steps**: Implement Phase 1 (Component Structure) and test basic layout before proceeding to styling phases.
