# Thread Action Buttons - Design Plan

**Task**: TASK-597 - Add action buttons to thread view
**Date**: 2025-10-02 14:30
**Status**: Ready for Implementation
**Design Philosophy**: Simple, terminal-native interaction patterns that feel like natural extensions of the command-line aesthetic

---

## 1. Design Context & Analysis

### Current State
The ThreadViewPage displays:
- **Terminal header** with navigation and thread ID
- **Thread root post** using ThreadCard component
- **Replies section** with nested ThreadCard components
- **Bottom navigation** (MobileNavigation)

**Missing**: User action capabilities - users can view threads but cannot interact (like or reply)

### Existing Components to Leverage
1. **AddTrackModal** (`/web-app/src/components/library/AddTrackModal.tsx`)
   - Terminal-themed modal with boot sequence animation
   - Uses SongInputForm for URL + comment input
   - Perfect for "Add Reply" functionality (just needs title change)

2. **SongInputForm** (`/web-app/src/components/common/SongInputForm.tsx`)
   - Handles song URL + comment input
   - Already has validation and submission logic
   - Can be reused as-is for replies

3. **Terminal Aesthetic** (from ThreadViewPage)
   - ASCII borders (`├─`, `│`, `└─`)
   - Neon color palette (cyan, magenta, yellow)
   - Monospace JetBrains Mono font
   - Command-line interaction patterns

### Design Goals
1. **Simplicity First**: Two simple buttons that feel terminal-native
2. **Reuse Existing Patterns**: Leverage AddTrackModal and SongInputForm without modification
3. **Terminal Aesthetic**: Buttons should look like terminal commands or status indicators
4. **Mobile-Friendly**: Work beautifully on small screens
5. **Clear Affordances**: Users should immediately understand what each button does

---

## 2. Design Solution

### Conceptual Approach
**Philosophy**: "Command-line social actions" - Treat likes and replies as terminal commands that users can execute. Think of it like running `./like_thread` or `./add_reply` commands.

**Key Insight**: The simplest solution is often the best. Instead of creating complex new components, we adapt existing patterns (AddTrackModal) and create minimal, terminal-styled buttons.

### Layout Decision: Fixed Action Bar

**Selected Approach**: Add a fixed action bar between the thread content and bottom navigation, containing two terminal-style buttons.

```
┌────────────────────────────────────┐
│ Thread Header (existing)           │
├────────────────────────────────────┤
│                                    │
│ Thread Content (existing)          │
│ - Root post                        │
│ - Replies                          │
│                                    │
├────────────────────────────────────┤  ← NEW
│ [ ❤ LIKE THREAD ] [ + ADD REPLY ] │  ← NEW: Action Bar
├────────────────────────────────────┤
│ Bottom Navigation (existing)       │
└────────────────────────────────────┘
```

**Why this approach?**
- **Always accessible**: Buttons remain visible as user scrolls through replies
- **Clear separation**: Action bar is distinct from content
- **Mobile-optimized**: Thumb-accessible on all devices
- **Terminal-native**: Feels like a status/command bar
- **Non-intrusive**: Doesn't clutter the thread content

---

## 3. Visual Design Specifications

### 3.1 Action Bar Container

**Layout:**
- Position: `fixed` (stays in view during scroll)
- Bottom: `80px` (above bottom navigation - 64px nav + 16px spacing)
- Width: `100%`
- Background: `var(--terminal-bg)` with slight transparency
- Border: Terminal-style top border

**Visual Treatment:**
```css
.thread-actions-bar {
  position: fixed;
  bottom: 80px; /* Above MobileNavigation (64px) + spacing */
  left: 0;
  right: 0;
  z-index: 90; /* Below header (100), above content */
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(8px);
  border-top: 1px solid var(--neon-cyan);
  padding: 12px 16px;
  box-shadow: 0 -2px 8px rgba(4, 202, 244, 0.05);
}

/* Terminal status bar aesthetic */
.thread-actions-bar::before {
  content: '├─[ACTIONS]─────────────────────────┤';
  position: absolute;
  top: -12px;
  left: 0;
  right: 0;
  font-family: var(--font-terminal);
  font-size: 10px;
  color: var(--terminal-dim);
  text-align: center;
  pointer-events: none;
}
```

**Responsive Behavior:**
```css
/* Tablet - constrained width */
@media (min-width: 768px) {
  .thread-actions-bar {
    max-width: 640px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 4px 4px 0 0;
  }
}
```

### 3.2 Button Design: Terminal Command Style

**Philosophy**: Buttons should look like executable terminal commands with bracketed syntax.

#### Like Thread Button (Toggleable State)

**Default State (Not Liked):**
```
[ ❤ LIKE_THREAD ]
```

**Active State (Liked):**
```
[✓ LIKED ]
```

**Visual Specs:**
```css
.action-button-like {
  font-family: var(--font-terminal);
  font-size: 12px;
  font-weight: 600;
  padding: 10px 16px;
  border: 1px solid var(--terminal-dim);
  background: transparent;
  color: var(--terminal-text);
  cursor: pointer;
  transition: all 200ms ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.5px;
}

/* Hover state */
.action-button-like:hover {
  border-color: var(--neon-pink); /* #f906d6 */
  background: rgba(249, 6, 214, 0.05);
  box-shadow: 0 0 6px rgba(249, 6, 214, 0.2);
  transform: translateY(-1px);
}

/* Active/pressed state */
.action-button-like:active {
  transform: translateY(0);
  box-shadow: 0 0 4px rgba(249, 6, 214, 0.3);
}

/* Liked state */
.action-button-like.liked {
  border-color: var(--neon-pink);
  background: rgba(249, 6, 214, 0.1);
  color: var(--neon-pink);
  box-shadow: 0 0 4px rgba(249, 6, 214, 0.15);
}

.action-button-like.liked:hover {
  background: rgba(249, 6, 214, 0.15);
  box-shadow: 0 0 8px rgba(249, 6, 214, 0.3);
}
```

**Icon States:**
- Not liked: `❤` (outline heart, or use `♡` if available)
- Liked: `✓` (checkmark to indicate completed action)

#### Add Reply Button

**Appearance:**
```
[ + ADD_REPLY ]
```

**Visual Specs:**
```css
.action-button-reply {
  font-family: var(--font-terminal);
  font-size: 12px;
  font-weight: 600;
  padding: 10px 16px;
  border: 1px solid var(--neon-cyan);
  background: rgba(4, 202, 244, 0.05);
  color: var(--neon-cyan);
  cursor: pointer;
  transition: all 200ms ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.5px;
  box-shadow: 0 0 4px rgba(4, 202, 244, 0.1);
}

/* Hover state - gradient fill */
.action-button-reply:hover {
  border-color: var(--neon-cyan);
  background: rgba(4, 202, 244, 0.1);
  box-shadow: 0 0 8px rgba(4, 202, 244, 0.25);
  transform: translateY(-1px);
}

/* Active/pressed state */
.action-button-reply:active {
  transform: translateY(0);
  box-shadow: 0 0 6px rgba(4, 202, 244, 0.3);
}
```

**Icon:**
- `+` symbol (simple, terminal-native)
- Alternative: `»` or `▸` for "execute command" feel

### 3.3 Button Layout

**Container:**
```css
.thread-actions-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
}

/* Mobile: Stack vertically on very small screens */
@media (max-width: 360px) {
  .thread-actions-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .action-button-like,
  .action-button-reply {
    width: 100%;
    justify-content: center;
  }
}
```

---

## 4. Component Architecture

### 4.1 New Component: ThreadActionsBar

**Location**: `/mini-app/src/components/thread/ThreadActionsBar.tsx`

**Props Interface:**
```typescript
interface ThreadActionsBarProps {
  threadId: string;
  isLiked: boolean;
  likeCount: number;
  onLike: () => void;
  onAddReply: () => void;
}
```

**Component Structure:**
```tsx
import { Component, createSignal } from 'solid-js';
import './threadActionsBar.css';

interface ThreadActionsBarProps {
  threadId: string;
  isLiked: boolean;
  likeCount: number;
  onLike: () => void;
  onAddReply: () => void;
}

const ThreadActionsBar: Component<ThreadActionsBarProps> = (props) => {
  const [isLiking, setIsLiking] = createSignal(false);

  const handleLike = async () => {
    if (isLiking()) return;

    setIsLiking(true);
    try {
      await props.onLike();
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div class="thread-actions-bar">
      <div class="thread-actions-buttons">
        {/* Like Button */}
        <button
          class="action-button-like"
          classList={{ liked: props.isLiked }}
          onClick={handleLike}
          disabled={isLiking()}
          aria-label={props.isLiked ? 'Unlike thread' : 'Like thread'}
        >
          <span class="action-bracket">[</span>
          <span class="action-icon">{props.isLiked ? '✓' : '❤'}</span>
          <span class="action-text">
            {props.isLiked ? 'LIKED' : 'LIKE_THREAD'}
          </span>
          <span class="action-bracket">]</span>
        </button>

        {/* Add Reply Button */}
        <button
          class="action-button-reply"
          onClick={props.onAddReply}
          aria-label="Add reply to thread"
        >
          <span class="action-bracket">[</span>
          <span class="action-icon">+</span>
          <span class="action-text">ADD_REPLY</span>
          <span class="action-bracket">]</span>
        </button>
      </div>
    </div>
  );
};

export default ThreadActionsBar;
```

### 4.2 Integration with ThreadViewPage

**Modifications to ThreadViewPage.tsx:**

```tsx
import { Component, createSignal, For, createMemo, Show } from 'solid-js';
import { useParams, A } from '@solidjs/router';
import { ThreadCard } from '../components/common/TrackCard/NEW';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import ThreadActionsBar from '../components/thread/ThreadActionsBar';
import AddTrackModal from '../components/library/AddTrackModal'; // REUSE from web-app
import { setCurrentTrack, setIsPlaying, Track } from '../stores/playerStore';
import { getThreadById, mockThreads } from '../data/mockThreads';
import './threadView.css';

const ThreadViewPage: Component = () => {
  const params = useParams();
  const thread = createMemo(() => getThreadById(params.id) || mockThreads[0]);

  // NEW: Modal state
  const [showAddReplyModal, setShowAddReplyModal] = createSignal(false);

  // NEW: Like state (would come from API in production)
  const [isLiked, setIsLiked] = createSignal(false);

  // NEW: Like handler
  const handleLike = async () => {
    setIsLiked(!isLiked());
    // TODO: Call API to persist like
    console.log('Like toggled:', isLiked());
  };

  // NEW: Reply handler
  const handleAddReply = () => {
    setShowAddReplyModal(true);
  };

  // NEW: Reply submission
  const handleReplySubmit = async (data: { songUrl: string; comment: string }) => {
    // TODO: Call API to create reply
    console.log('Reply submitted:', data);

    // Close modal
    setShowAddReplyModal(false);

    // TODO: Refresh thread to show new reply
  };

  return (
    <div class="thread-view-page">
      {/* ... existing header ... */}

      {/* ... existing thread content ... */}

      {/* NEW: Action Bar */}
      <ThreadActionsBar
        threadId={thread().id}
        isLiked={isLiked()}
        likeCount={thread().likeCount}
        onLike={handleLike}
        onAddReply={handleAddReply}
      />

      {/* Bottom Navigation (existing) */}
      <MobileNavigation class="pb-safe" />

      {/* NEW: Add Reply Modal (reuse AddTrackModal) */}
      <AddTrackModal
        isOpen={showAddReplyModal()}
        onClose={() => setShowAddReplyModal(false)}
        onSubmit={handleReplySubmit}
      />
    </div>
  );
};

export default ThreadViewPage;
```

### 4.3 Reusing AddTrackModal for Replies

**Good News**: AddTrackModal is already perfect for this use case! It:
- Has terminal aesthetic with boot sequence animation
- Uses SongInputForm for URL + comment input
- Handles submission and validation
- Shows "JAMZY://" terminal header

**Minor Customization Needed**: Update the title prop

**Current**:
```tsx
<BaseModal
  title="Add Track to Library"
  ...
/>
```

**For Thread Reply**:
```tsx
<AddTrackModal
  isOpen={showAddReplyModal()}
  onClose={() => setShowAddReplyModal(false)}
  onSubmit={handleReplySubmit}
  // Could add optional title prop override
/>
```

**Enhancement (Optional)**: Make title customizable
```tsx
// In AddTrackModal.tsx
interface AddTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { songUrl: string; comment: string }) => void;
  initialData?: { songUrl?: string; comment?: string };
  title?: string; // NEW: optional title override
}

// In BaseModal usage
<BaseModal
  title={props.title || "Add Track to Library"}
  ...
/>

// In ThreadViewPage usage
<AddTrackModal
  title="Add Reply to Thread"
  ...
/>
```

---

## 5. Interaction Patterns

### 5.1 Like Thread Flow

**User Journey:**
1. User clicks `[ ❤ LIKE_THREAD ]` button
2. Button immediately updates to `[✓ LIKED ]` (optimistic UI)
3. API call executes in background
4. If API fails, revert to unliked state with error toast (future enhancement)

**States:**
- **Default**: `[ ❤ LIKE_THREAD ]` - dim border
- **Hover**: Pink glow, slight lift
- **Active/Clicking**: Slight press down
- **Liked**: `[✓ LIKED ]` - pink border, pink text, subtle glow

**Toggle Behavior:**
- Clicking when liked → Unlike
- Clicking when not liked → Like
- Button text changes to reflect state

### 5.2 Add Reply Flow

**User Journey:**
1. User clicks `[ + ADD_REPLY ]` button
2. AddTrackModal opens with terminal boot sequence animation
3. User enters:
   - Song URL (required)
   - Comment/thought (optional)
4. User clicks `[ EXECUTE ADD ]` submit button
5. Modal shows loading state
6. On success:
   - Modal closes
   - Thread refreshes to show new reply
   - User scrolls to their new reply (future enhancement)

**States:**
- **Default**: Cyan border with subtle background
- **Hover**: Brighter cyan glow, slight lift
- **Active/Clicking**: Slight press down
- **Modal Open**: Button remains in hover-like state

---

## 6. Layout & Positioning

### 6.1 Z-Index Hierarchy

```
┌─ Header (z-index: 100)
│
├─ Action Bar (z-index: 90)  ← NEW
│
├─ Modal (z-index: 1000)     ← When open
│
├─ Content (z-index: 2)
│
└─ Bottom Nav (z-index: 80)
```

### 6.2 Spacing & Padding

**Action Bar Internal Spacing:**
- Top/Bottom Padding: `12px`
- Left/Right Padding: `16px`
- Button Gap: `12px`

**Button Internal Spacing:**
- Padding: `10px 16px`
- Icon-Text Gap: `6px`

**Relationship to Other Elements:**
```
┌───────────────────────────────────┐
│ Thread Content                    │
│ (scrollable area)                 │
│                                   │
│ [Reply Card]                      │
│ [Reply Card]                      │
│ [Reply Card]                      │
│                                   │
│ ... padding-bottom: 120px ...    │  ← Prevents content from hiding under action bar
└───────────────────────────────────┘

↕ 16px gap

┌───────────────────────────────────┐
│ [ ❤ LIKE ] [ + ADD_REPLY ]       │  ← Action Bar (fixed, 80px from bottom)
└───────────────────────────────────┘

↕ 16px gap

┌───────────────────────────────────┐
│ Bottom Navigation (64px)          │
└───────────────────────────────────┘
```

**CSS for Content Padding:**
```css
.thread-view-content {
  /* Existing styles... */
  padding-bottom: 120px; /* INCREASE from current 120px to accommodate action bar */
}
```

### 6.3 Responsive Adjustments

**Desktop (≥768px):**
- Action bar max-width: `640px`
- Centered on page
- Rounded top corners

**Tablet (640px-768px):**
- Full width
- Buttons remain side-by-side

**Mobile (≤640px):**
- Full width
- Buttons remain side-by-side
- Slightly smaller padding

**Small Mobile (≤360px):**
- Buttons stack vertically
- Full width buttons
- Tighter spacing

---

## 7. Animation & Transitions

### 7.1 Button Hover Animations

**Lift Effect:**
```css
/* Default state includes transition */
transition: all 200ms ease;

/* Hover state */
:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 8px rgba(color, 0.25);
}

/* Active/click state */
:active {
  transform: translateY(0);
}
```

**Glow Pulse on Like:**
```css
/* When button becomes liked, add a brief pulse */
@keyframes like-pulse {
  0% { box-shadow: 0 0 4px rgba(249, 6, 214, 0.15); }
  50% { box-shadow: 0 0 16px rgba(249, 6, 214, 0.4); }
  100% { box-shadow: 0 0 4px rgba(249, 6, 214, 0.15); }
}

.action-button-like.liked {
  animation: like-pulse 600ms ease-out;
}
```

### 7.2 Action Bar Entry Animation

**On Page Load (subtle):**
```css
@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.thread-actions-bar {
  animation: slideUpFade 400ms ease-out 200ms backwards;
}
```

### 7.3 Modal Animations

**Reuse existing AddTrackModal animations:**
- Terminal boot sequence (already implemented)
- Backdrop fade-in (already implemented)
- Modal slide-up (already implemented)

**No new animations needed** - existing patterns work perfectly.

---

## 8. Accessibility Considerations

### 8.1 Keyboard Navigation

**Tab Order:**
1. Thread content (scrollable)
2. Like button
3. Add Reply button
4. Bottom navigation

**Keyboard Shortcuts:**
- `Tab` → Navigate between buttons
- `Enter` or `Space` → Activate button
- `Escape` → Close modal (when open)

### 8.2 Focus States

```css
/* Visible focus indicator */
.action-button-like:focus,
.action-button-reply:focus {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 2px;
  box-shadow: 0 0 4px var(--neon-cyan);
}

/* Remove default outline (we're providing custom) */
.action-button-like:focus-visible,
.action-button-reply:focus-visible {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 2px;
}
```

### 8.3 ARIA Labels

**Like Button:**
```tsx
<button
  aria-label={props.isLiked ? 'Unlike thread' : 'Like thread'}
  aria-pressed={props.isLiked}
  role="button"
>
```

**Add Reply Button:**
```tsx
<button
  aria-label="Add reply to thread"
  role="button"
>
```

**Action Bar:**
```tsx
<div
  class="thread-actions-bar"
  role="toolbar"
  aria-label="Thread actions"
>
```

### 8.4 Screen Reader Announcements

**On Like Toggle:**
```tsx
// Use live region for status updates
<div class="sr-only" role="status" aria-live="polite">
  {props.isLiked ? 'Thread liked' : 'Thread unliked'}
</div>
```

**Screen Reader Only Styles:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 9. Implementation Checklist

### Phase 1: Component Creation
- [ ] Create `/mini-app/src/components/thread/ThreadActionsBar.tsx`
- [ ] Create `/mini-app/src/components/thread/threadActionsBar.css`
- [ ] Define ThreadActionsBarProps interface
- [ ] Implement basic component structure (buttons + container)

### Phase 2: Styling
- [ ] Create `.thread-actions-bar` container styles
- [ ] Create `.action-button-like` styles (default, hover, active, liked states)
- [ ] Create `.action-button-reply` styles (default, hover, active states)
- [ ] Add button layout flexbox styles
- [ ] Add z-index and positioning
- [ ] Add entry animation

### Phase 3: Integration
- [ ] Copy AddTrackModal from web-app to mini-app (if not already shared)
- [ ] Copy SongInputForm from web-app to mini-app (if not already shared)
- [ ] Import ThreadActionsBar into ThreadViewPage
- [ ] Add modal state management (`showAddReplyModal`)
- [ ] Add like state management (`isLiked`)
- [ ] Wire up button handlers (`onLike`, `onAddReply`)
- [ ] Add modal to page (`<AddTrackModal>`)

### Phase 4: Responsive Design
- [ ] Test on desktop (≥768px)
- [ ] Test on tablet (640px-768px)
- [ ] Test on mobile (375px-640px)
- [ ] Test on small mobile (≤360px)
- [ ] Add mobile-specific styles (button stacking on very small screens)
- [ ] Adjust action bar positioning on desktop (centered, max-width)

### Phase 5: Interactions
- [ ] Implement like toggle logic
- [ ] Implement optimistic UI updates for like
- [ ] Implement modal open/close for reply
- [ ] Test keyboard navigation (tab order)
- [ ] Test focus indicators
- [ ] Test with keyboard only (no mouse)

### Phase 6: Accessibility
- [ ] Add ARIA labels to buttons
- [ ] Add role="toolbar" to action bar
- [ ] Add aria-pressed to like button
- [ ] Test with VoiceOver (Mac) or NVDA (Windows)
- [ ] Verify focus indicators meet contrast requirements
- [ ] Test keyboard navigation flow

### Phase 7: Polish
- [ ] Add like pulse animation
- [ ] Test button hover states
- [ ] Verify glow effects render correctly
- [ ] Test modal animations
- [ ] Ensure action bar doesn't obscure content
- [ ] Adjust content padding-bottom if needed

### Phase 8: API Integration (Future)
- [ ] Connect like button to actual API endpoint
- [ ] Connect reply submission to actual API endpoint
- [ ] Add error handling for failed likes
- [ ] Add error handling for failed reply submissions
- [ ] Add success feedback (toast notifications)
- [ ] Implement thread refresh after reply

---

## 10. Design Rationale

### Why Fixed Action Bar Instead of Inline Buttons?

**Alternatives Considered:**
1. **Buttons at top of thread** (before content)
2. **Buttons at bottom of thread** (after all replies)
3. **Floating action buttons** (FAB style)

**Decision**: Fixed action bar wins because:
1. **Always accessible**: Users don't need to scroll to top/bottom
2. **Familiar pattern**: Similar to comment/share bars in social apps
3. **Clear separation**: Actions are distinct from content
4. **Mobile-optimized**: Easy thumb access on all screen sizes
5. **Terminal aesthetic**: Feels like a command/status bar

### Why Reuse AddTrackModal Instead of Creating New Reply Modal?

**Alternatives Considered:**
1. **Create dedicated ReplyModal component**
2. **Inline reply form** (expand in page)

**Decision**: Reuse AddTrackModal because:
1. **Simplicity**: No need to duplicate code
2. **Consistency**: Same UX for adding tracks vs replies
3. **Already perfect**: Terminal aesthetic, animations, form handling all match needs
4. **DRY principle**: Don't Repeat Yourself
5. **Faster implementation**: Just change the title prop

### Why Terminal Command Style Buttons?

**Alternatives Considered:**
1. **Icon-only buttons** (heart icon, reply icon)
2. **Rounded modern buttons** (like typical social apps)
3. **Text links** (simple underlined text)

**Decision**: Terminal command style because:
1. **Brand consistency**: Matches existing terminal aesthetic
2. **Clear affordance**: Bracketed text looks clickable
3. **Unique personality**: Differentiates from generic social UIs
4. **Information density**: Text labels make actions explicit
5. **Accessibility**: Text is more screen-reader friendly than icons alone

### Why Two Buttons Instead of More Actions?

**Alternatives Considered:**
1. **Add "Share Thread" button**
2. **Add "Bookmark Thread" button**
3. **Add "Report Thread" button**

**Decision**: Just Like and Reply because:
1. **Core actions**: These are the two most essential interactions
2. **Simplicity**: Less cognitive load, clearer choices
3. **Space constraints**: Mobile screens don't have room for many buttons
4. **Progressive disclosure**: Additional actions can be in overflow menu later
5. **Task requirements**: The task specifically asks for Like and Reply

---

## 11. Visual Mockups

### Desktop View (≥768px)

```
┌─────────────────────────────────────────────────────┐
│ ┌─[JAMZY::THREAD_VIEW]──[ID: #a1b2]─┐              │
│ │ [← BACK] user@jamzy:~/threads/a1b2$            │  │
│ └──────────────────────────────────────┘           │
│                                                     │
│ ┌─────────────────────────────────────┐            │
│ │ Thread Root Post                    │            │
│ │ "What's your favorite track..."     │            │
│ │ [Track Preview]                     │            │
│ └─────────────────────────────────────┘            │
│                                                     │
│ ├─ REPLIES [3] ─┤                                  │
│ │ Reply 1...                                       │
│ │ Reply 2...                                       │
│ │ Reply 3...                                       │
│                                                     │
│         ...padding-bottom: 120px...                │
│                                                     │
├─────────────────────────────────────────────────────┤
│          ┌───────────────────────────┐             │
│          │ [ ❤ LIKE_THREAD ]         │             │
│          │ [ + ADD_REPLY ]           │             │
│          └───────────────────────────┘             │
├─────────────────────────────────────────────────────┤
│ Bottom Navigation                                   │
└─────────────────────────────────────────────────────┘
```

### Mobile View (≤640px)

```
┌──────────────────────────┐
│ Terminal Header          │
├──────────────────────────┤
│ Thread Root Post         │
│ "What's your..."         │
│ [Track]                  │
│                          │
│ ├─ REPLIES [3] ─┤        │
│ │ Reply 1...              │
│ │ Reply 2...              │
│                          │
│ ...padding...            │
├──────────────────────────┤
│ [ ❤ LIKE_THREAD ]       │  ← Full width action bar
│ [ + ADD_REPLY ]         │
├──────────────────────────┤
│ Bottom Nav               │
└──────────────────────────┘
```

### Small Mobile View (≤360px)

```
┌─────────────────────┐
│ Terminal Header     │
├─────────────────────┤
│ Thread Root Post    │
│ "What's your..."    │
│ [Track]             │
│                     │
│ ├─ REPLIES [3] ─┤   │
│ │ Reply 1...        │
│                     │
│ ...padding...       │
├─────────────────────┤
│ [ ❤ LIKE_THREAD ]  │  ← Stacked buttons
│ [ + ADD_REPLY ]    │  ← on very small screens
├─────────────────────┤
│ Bottom Nav          │
└─────────────────────┘
```

### Button States Visualization

**Like Button States:**
```
Default:     [ ❤ LIKE_THREAD ]  (dim border, white text)
Hover:       [ ❤ LIKE_THREAD ]  (pink glow, lifted)
Active:      [ ❤ LIKE_THREAD ]  (pressed down)
Liked:       [✓ LIKED ]          (pink border, pink text, subtle glow)
Liked Hover: [✓ LIKED ]          (brighter pink glow, lifted)
```

**Add Reply Button States:**
```
Default:     [ + ADD_REPLY ]  (cyan border, cyan text, subtle bg)
Hover:       [ + ADD_REPLY ]  (cyan glow, lifted)
Active:      [ + ADD_REPLY ]  (pressed down)
```

---

## 12. Edge Cases & Error Handling

### Like Button Edge Cases

**Rapid Clicking:**
- **Solution**: Disable button while API call is in progress
- **Implementation**: `isLiking` state prevents multiple clicks

**API Failure:**
- **Solution**: Revert optimistic UI update, show error toast (future)
- **Implementation**: Try-catch in `handleLike` with state rollback

**Offline Mode:**
- **Solution**: Queue like action, sync when online (future enhancement)
- **Implementation**: Service worker with background sync

### Add Reply Edge Cases

**Empty Form Submission:**
- **Solution**: Already handled by SongInputForm validation
- **Implementation**: Submit button disabled when URL is empty

**Invalid URL:**
- **Solution**: Show validation error inline (future enhancement)
- **Current**: Backend will return error, caught in try-catch

**Network Timeout:**
- **Solution**: Show timeout message, allow retry
- **Implementation**: Add timeout to fetch calls with retry UI

**Modal Dismissed with Unsaved Data:**
- **Solution**: Show confirmation dialog (future enhancement)
- **Current**: Data is lost (acceptable for MVP)

### Action Bar Positioning Edge Cases

**Very Tall Phones (iPhone 14 Pro Max):**
- **Solution**: Ensure action bar doesn't overlap with content
- **Implementation**: Test on actual device, adjust padding-bottom if needed

**Landscape Mode:**
- **Solution**: Action bar may need to be inline on landscape mobile
- **Future Enhancement**: Detect orientation and adjust layout

**Notch/Safe Areas:**
- **Solution**: Use `padding-bottom: env(safe-area-inset-bottom)` on parent
- **Implementation**: Already handled by `pb-safe` class on MobileNavigation

---

## 13. Performance Considerations

### Image Loading (Modal)
- **Already optimized**: AddTrackModal uses lazy loading
- **No new concerns**: Modal content only loads when opened

### Animation Performance
- **Use GPU-accelerated properties**:
  - `transform: translateY()` ✓
  - `opacity` ✓
  - Avoid `height`, `width`, `top`, `left` ✗

**Implementation:**
```css
/* Good - GPU accelerated */
.action-button-like:hover {
  transform: translateY(-1px);
  box-shadow: ...;
}

/* Avoid - causes reflow */
.action-button-like:hover {
  margin-top: -1px; /* Don't do this */
}
```

### Re-renders
- **Optimize with `createMemo`**: Thread data doesn't change often
- **Use `createSignal` for like state**: Only re-renders button, not entire page
- **Modal render optimization**: Only renders when `showAddReplyModal()` is true

### Bundle Size
- **No new dependencies**: Reusing existing components
- **Minimal CSS**: ~150 lines total
- **Minimal JS**: ~80 lines for ThreadActionsBar component

---

## 14. Success Metrics

### Qualitative Goals
- [ ] Users can easily find and understand action buttons
- [ ] Like action feels immediate and responsive
- [ ] Reply modal opens smoothly with clear UX
- [ ] Terminal aesthetic is maintained throughout
- [ ] Buttons feel natural and unobtrusive

### Technical Goals
- [ ] Like action completes in <200ms (optimistic UI)
- [ ] Modal opens in <100ms after click
- [ ] No layout shift when action bar appears
- [ ] Maintains 60fps scrolling with action bar visible
- [ ] Accessibility score remains 100/100

### User Experience Goals
- [ ] New users understand how to like a thread without instruction
- [ ] New users understand how to reply to a thread without instruction
- [ ] Action bar doesn't feel cluttered or overwhelming
- [ ] Buttons are easy to tap on mobile (minimum 44px touch target)

---

## 15. Future Enhancements (Out of Scope)

### Possible Future Iterations
1. **Share Thread Button**: Copy link, share to social
2. **Bookmark Thread**: Save for later
3. **Like Count Display**: Show number of likes on button
4. **Reply Count Live Update**: Real-time updates as replies come in
5. **Keyboard Shortcuts**: `L` to like, `R` to reply
6. **Haptic Feedback**: Vibration on mobile when liking
7. **Undo Like**: Toast with "Undo" action
8. **Thread Notifications**: Subscribe to thread updates

### Not Recommended
- ❌ **Too many buttons**: Clutters interface, confuses users
- ❌ **Floating action buttons**: Doesn't match terminal aesthetic
- ❌ **Animated emojis**: Distracting, performance cost
- ❌ **Auto-like**: Removes user agency
- ❌ **Modal-less reply**: Inline form breaks flow

---

## 16. Implementation Files

### New Files to Create
1. **Component**: `/mini-app/src/components/thread/ThreadActionsBar.tsx`
   - Component logic
   - Props interface
   - Event handlers

2. **Styles**: `/mini-app/src/components/thread/threadActionsBar.css`
   - Container styles
   - Button styles (like, reply)
   - Responsive breakpoints
   - Animations

### Files to Modify
1. **Page**: `/mini-app/src/pages/ThreadViewPage.tsx`
   - Import ThreadActionsBar
   - Import AddTrackModal (reuse from web-app)
   - Add modal state management
   - Add like state management
   - Wire up handlers

2. **Styles**: `/mini-app/src/pages/threadView.css`
   - Increase `.thread-view-content` padding-bottom to accommodate action bar
   - Possibly: Adjust for landscape mode (future)

### Files to Copy/Share (if needed)
1. **Modal**: `/web-app/src/components/library/AddTrackModal.tsx`
   - Copy to `/mini-app/src/components/library/` OR
   - Move to `/shared/components/` for reuse

2. **Form**: `/web-app/src/components/common/SongInputForm.tsx`
   - Copy to `/mini-app/src/components/common/` OR
   - Move to `/shared/components/` for reuse

3. **Dependencies**: Ensure shared components are available in mini-app

---

## 17. API Integration (Future Work)

### Like Thread Endpoint

**Request:**
```typescript
POST /api/threads/:threadId/like

Headers:
  Authorization: Bearer {token}

Body: (empty)
```

**Response:**
```typescript
{
  success: true,
  likeCount: 13,
  isLiked: true
}
```

### Unlike Thread Endpoint

**Request:**
```typescript
DELETE /api/threads/:threadId/like

Headers:
  Authorization: Bearer {token}
```

**Response:**
```typescript
{
  success: true,
  likeCount: 12,
  isLiked: false
}
```

### Create Reply Endpoint

**Request:**
```typescript
POST /api/threads/:threadId/replies

Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  songUrl: "https://youtube.com/watch?v=...",
  comment: "Great track! Here's another one..."
}
```

**Response:**
```typescript
{
  success: true,
  reply: {
    id: "reply-uuid",
    threadId: "thread-uuid",
    text: "Great track! Here's another one...",
    author: { username: "...", pfpUrl: "..." },
    track: { title: "...", artist: "...", ... },
    timestamp: "2025-10-02T14:30:00Z",
    likes: 0
  }
}
```

---

## 18. Design Principles Summary

This design follows Jamzy's core principles:

1. **Retro UI, Modern Style**: Terminal command-style buttons with smooth modern interactions
2. **Info Dense, Visually Engaging**: Compact action bar doesn't sacrifice content space
3. **Details Matter**: Subtle glows, precise spacing, thoughtful hover states
4. **Simple Solutions**: Reuse existing components (AddTrackModal) instead of building new ones
5. **Natural Proportions**: Button sizing follows 8px spacing system (10px padding = 1.25 × 8)

**The Zen Approach**: We're not adding complexity—we're revealing natural interaction points that were always meant to be there. The action bar feels like it's part of the terminal interface, not bolted on. Like adding simple commands to a shell script: elegant, purposeful, minimal.

---

**Design Status**: ✅ Ready for Implementation
**Estimated Complexity**: Low-Medium
**Estimated Time**: 2-3 hours
**Risk Level**: Low (reusing proven components, additive changes)

**Next Steps**:
1. Create ThreadActionsBar component
2. Copy/share AddTrackModal and SongInputForm from web-app
3. Integrate into ThreadViewPage
4. Test on multiple screen sizes
5. Add API integration when backend endpoints are ready

---

## Appendix: Code Snippets

### A. Complete ThreadActionsBar Component

```tsx
// /mini-app/src/components/thread/ThreadActionsBar.tsx
import { Component, createSignal } from 'solid-js';
import './threadActionsBar.css';

interface ThreadActionsBarProps {
  threadId: string;
  isLiked: boolean;
  likeCount: number;
  onLike: () => void;
  onAddReply: () => void;
}

const ThreadActionsBar: Component<ThreadActionsBarProps> = (props) => {
  const [isLiking, setIsLiking] = createSignal(false);

  const handleLike = async () => {
    if (isLiking()) return;

    setIsLiking(true);
    try {
      await props.onLike();
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div
      class="thread-actions-bar"
      role="toolbar"
      aria-label="Thread actions"
    >
      <div class="thread-actions-buttons">
        {/* Like Button */}
        <button
          class="action-button-like"
          classList={{ liked: props.isLiked }}
          onClick={handleLike}
          disabled={isLiking()}
          aria-label={props.isLiked ? 'Unlike thread' : 'Like thread'}
          aria-pressed={props.isLiked}
        >
          <span class="action-bracket">[</span>
          <span class="action-icon">{props.isLiked ? '✓' : '❤'}</span>
          <span class="action-text">
            {props.isLiked ? 'LIKED' : 'LIKE_THREAD'}
          </span>
          <span class="action-bracket">]</span>
        </button>

        {/* Add Reply Button */}
        <button
          class="action-button-reply"
          onClick={props.onAddReply}
          aria-label="Add reply to thread"
        >
          <span class="action-bracket">[</span>
          <span class="action-icon">+</span>
          <span class="action-text">ADD_REPLY</span>
          <span class="action-bracket">]</span>
        </button>
      </div>

      {/* Screen reader status announcements */}
      <div class="sr-only" role="status" aria-live="polite">
        {props.isLiked ? 'Thread liked' : ''}
      </div>
    </div>
  );
};

export default ThreadActionsBar;
```

### B. Complete ThreadActionsBar Styles

```css
/* /mini-app/src/components/thread/threadActionsBar.css */

/* ===== ACTION BAR CONTAINER ===== */

.thread-actions-bar {
  position: fixed;
  bottom: 80px; /* Above MobileNavigation (64px) + 16px spacing */
  left: 0;
  right: 0;
  z-index: 90;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(8px);
  border-top: 1px solid var(--neon-cyan);
  padding: 12px 16px;
  box-shadow: 0 -2px 8px rgba(4, 202, 244, 0.05);
  animation: slideUpFade 400ms ease-out 200ms backwards;
}

/* Entry animation */
@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Button container */
.thread-actions-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
}

/* ===== LIKE BUTTON ===== */

.action-button-like {
  font-family: var(--font-terminal);
  font-size: 12px;
  font-weight: 600;
  padding: 10px 16px;
  border: 1px solid var(--terminal-dim);
  background: transparent;
  color: var(--terminal-text);
  cursor: pointer;
  transition: all 200ms ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.5px;
  min-height: 44px; /* Touch target */
}

/* Like button hover */
.action-button-like:hover:not(:disabled) {
  border-color: var(--neon-pink);
  background: rgba(249, 6, 214, 0.05);
  box-shadow: 0 0 6px rgba(249, 6, 214, 0.2);
  transform: translateY(-1px);
}

/* Like button active/pressed */
.action-button-like:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 0 4px rgba(249, 6, 214, 0.3);
}

/* Liked state */
.action-button-like.liked {
  border-color: var(--neon-pink);
  background: rgba(249, 6, 214, 0.1);
  color: var(--neon-pink);
  box-shadow: 0 0 4px rgba(249, 6, 214, 0.15);
  animation: like-pulse 600ms ease-out;
}

.action-button-like.liked:hover:not(:disabled) {
  background: rgba(249, 6, 214, 0.15);
  box-shadow: 0 0 8px rgba(249, 6, 214, 0.3);
  transform: translateY(-1px);
}

/* Like pulse animation */
@keyframes like-pulse {
  0% { box-shadow: 0 0 4px rgba(249, 6, 214, 0.15); }
  50% { box-shadow: 0 0 16px rgba(249, 6, 214, 0.4); }
  100% { box-shadow: 0 0 4px rgba(249, 6, 214, 0.15); }
}

/* Disabled state */
.action-button-like:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== ADD REPLY BUTTON ===== */

.action-button-reply {
  font-family: var(--font-terminal);
  font-size: 12px;
  font-weight: 600;
  padding: 10px 16px;
  border: 1px solid var(--neon-cyan);
  background: rgba(4, 202, 244, 0.05);
  color: var(--neon-cyan);
  cursor: pointer;
  transition: all 200ms ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.5px;
  box-shadow: 0 0 4px rgba(4, 202, 244, 0.1);
  min-height: 44px; /* Touch target */
}

/* Reply button hover */
.action-button-reply:hover {
  border-color: var(--neon-cyan);
  background: rgba(4, 202, 244, 0.1);
  box-shadow: 0 0 8px rgba(4, 202, 244, 0.25);
  transform: translateY(-1px);
}

/* Reply button active/pressed */
.action-button-reply:active {
  transform: translateY(0);
  box-shadow: 0 0 6px rgba(4, 202, 244, 0.3);
}

/* ===== FOCUS STATES ===== */

.action-button-like:focus-visible,
.action-button-reply:focus-visible {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 2px;
  box-shadow: 0 0 4px var(--neon-cyan);
}

/* ===== ACCESSIBILITY ===== */

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* ===== RESPONSIVE ===== */

/* Tablet - constrained width, centered */
@media (min-width: 768px) {
  .thread-actions-bar {
    max-width: 640px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 4px 4px 0 0;
  }
}

/* Mobile - slightly tighter spacing */
@media (max-width: 640px) {
  .thread-actions-bar {
    padding: 10px 12px;
  }

  .action-button-like,
  .action-button-reply {
    font-size: 11px;
    padding: 9px 14px;
  }
}

/* Small mobile - stack buttons vertically */
@media (max-width: 360px) {
  .thread-actions-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .action-button-like,
  .action-button-reply {
    width: 100%;
    justify-content: center;
  }
}

/* ===== REDUCED MOTION ===== */

@media (prefers-reduced-motion: reduce) {
  .thread-actions-bar {
    animation: none;
  }

  .action-button-like,
  .action-button-reply {
    transition: none;
  }

  .action-button-like.liked {
    animation: none;
  }
}
```

### C. Updated ThreadViewPage Integration

```tsx
// Add to imports
import ThreadActionsBar from '../components/thread/ThreadActionsBar';
import AddTrackModal from '../components/library/AddTrackModal';

// Add state management
const [showAddReplyModal, setShowAddReplyModal] = createSignal(false);
const [isLiked, setIsLiked] = createSignal(false);

// Add handlers
const handleLike = async () => {
  setIsLiked(!isLiked());
  // TODO: Call API
  console.log('Like toggled:', isLiked());
};

const handleAddReply = () => {
  setShowAddReplyModal(true);
};

const handleReplySubmit = async (data: { songUrl: string; comment: string }) => {
  console.log('Reply submitted:', data);
  setShowAddReplyModal(false);
  // TODO: Call API and refresh thread
};

// Add to JSX (before MobileNavigation)
<ThreadActionsBar
  threadId={thread().id}
  isLiked={isLiked()}
  likeCount={thread().likeCount}
  onLike={handleLike}
  onAddReply={handleAddReply}
/>

<MobileNavigation class="pb-safe" />

<AddTrackModal
  isOpen={showAddReplyModal()}
  onClose={() => setShowAddReplyModal(false)}
  onSubmit={handleReplySubmit}
/>
```

---

**End of Design Plan**
