# Thread Card Component - Simplified Design Plan
**Task**: TASK-556
**Date**: 2025-10-01
**Component**: ThreadCard.tsx
**Location**: `/frontend/src/components/common/TrackCard/NEW/`
**Design Type**: New Component - Simple Thread Discovery Card

---

## Executive Summary

This design creates a **minimal, focused ThreadCard** that shows just enough information for users to decide if they want to click into a thread. No complex metadata, no reply previews, no trending indicators - just the essentials presented with clean, retro-cyberpunk style.

### Design Philosophy
- **Begin with Purpose**: Help users discover interesting music conversations
- **Embrace Simplicity**: Show only what matters - the question/title, the starter track, and basic engagement stats
- **Simple Problem, Simple Solution**: A clean card design doesn't need complex implementation

---

## 1. What to Show (Information Hierarchy)

### PRIMARY Content
1. **Thread Starter Text** (the question/title they posted)
   - Font: JetBrains Mono (retro feel)
   - Size: 16px
   - Color: white
   - **Expandable**: Uses ExpandableText component for graceful handling of long text
   - Default collapsed state shows ~80 characters with smart word-boundary truncation
   - Clickable expand/collapse with slidedown animation

2. **Starter Track** (if present)
   - Album art: 64x64px
   - Track title: 14px, white
   - Artist name: 13px, neon-cyan, clickable

3. **Creator Info**
   - Username: @username format, neon-magenta
   - Timestamp: compact format (2h, 3d, 1w)

### SECONDARY Content
4. **Basic Stats** (in a simple row)
   - Reply count: "12 replies"
   - Like count: "45 likes"
   - Simple icons, subtle colors

---

## 2. Visual Layout

### Card Structure (Clean & Simple)

**Collapsed State** (short or truncated text):
```
┌─────────────────────────────────────────────────┐
│ "What are your favorite 90s synthpop tracks?   │
│  Looking for deep cuts..." [▼]                  │
│                                                  │
│ ┌──────┐ Track Title                           │
│ │ 64x64│ Artist Name                            │
│ │ Art  │                                         │
│ └──────┘                                         │
│                                                  │
│ shared by @username • 2h                        │
│ 💬 12 replies • ❤️ 45 likes                     │
└─────────────────────────────────────────────────┘
```

**Expanded State** (full text visible):
```
┌─────────────────────────────────────────────────┐
│ │ "What are your favorite 90s synthpop tracks? │
│ │  Looking for deep cuts that aren't the usual │
│ │  suspects. I've been really into New Order   │
│ │  and Depeche Mode lately..." [▲]             │
│ └─ Cyan border accent                           │
│                                                  │
│ ┌──────┐ Track Title                           │
│ │ 64x64│ Artist Name                            │
│ │ Art  │                                         │
│ └──────┘                                         │
│                                                  │
│ shared by @username • 2h                        │
│ 💬 12 replies • ❤️ 45 likes                     │
└─────────────────────────────────────────────────┘
```

### Key Design Decisions
- **No nested sections** - everything flows naturally top to bottom
- **No reply previews** - click into the thread to see replies
- **No trending indicators** - simple, equal treatment for all threads
- **No conversation metadata** - just the essential stats
- **Consistent height** - around 180-200px per card

---

## 3. Component Interface (Simple Props)

```typescript
interface ThreadCardProps {
  // Required: The essentials
  threadId: string;
  threadText: string;          // The question/title
  creatorUsername: string;
  creatorAvatar?: string;
  timestamp: string;
  replyCount: number;
  likeCount: number;

  // Optional: Starter track
  starterTrack?: {
    id: string;
    title: string;
    artist: string;
    albumArt: string;
    source: 'youtube' | 'spotify' | 'soundcloud' | 'bandcamp';
  };

  // Handlers
  onCardClick?: () => void;
  onUsernameClick?: (e: Event) => void;
  onArtistClick?: (e: Event) => void;
}
```

---

## 4. CSS Specifications (Retro-Cyberpunk)

### Card Container
```css
.thread-card {
  width: 100%;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: transparent;
  cursor: pointer;
  transition: background 200ms ease;
}

.thread-card:hover {
  background: rgba(4, 202, 244, 0.02); /* subtle cyan tint */
}
```

### Thread Text (The Question/Title)
```css
/* Container for expandable text */
.thread-card__text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  line-height: 1.5;
  color: #ffffff;
  margin-bottom: 16px;
}

/* Expandable text inherits card styling */
.thread-card__text .expandable-text {
  /* ExpandableText component handles truncation and expansion */
  /* See: /web-app/src/components/ui/ExpandableText.tsx */
}
```

### Starter Track Row
```css
.thread-card__track {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.thread-card__album-art {
  width: 64px;
  height: 64px;
  border-radius: 4px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.thread-card__track-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-width: 0;
}

.thread-card__track-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thread-card__track-artist {
  font-size: 13px;
  font-weight: 500;
  color: #04caf4; /* neon-cyan */
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thread-card__track-artist:hover {
  text-shadow: 0 0 8px rgba(4, 202, 244, 0.6);
}
```

### Creator & Stats Row
```css
.thread-card__footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
}

.thread-card__creator {
  color: rgba(255, 255, 255, 0.6);
}

.thread-card__username {
  color: #e010e0; /* neon-magenta */
  font-weight: 500;
  cursor: pointer;
}

.thread-card__username:hover {
  text-shadow: 0 0 8px rgba(224, 16, 224, 0.6);
}

.thread-card__timestamp {
  color: rgba(255, 255, 255, 0.5);
}

.thread-card__stats {
  display: flex;
  gap: 16px;
  color: rgba(255, 255, 255, 0.6);
}

.thread-card__stat {
  display: flex;
  align-items: center;
  gap: 6px;
}
```

---

## 5. Component Implementation (Clean & Minimal)

```tsx
import { Component, Show } from 'solid-js';
import ExpandableText from '../ui/ExpandableText';
import './threadCard.css';

interface ThreadCardProps {
  threadId: string;
  threadText: string;
  creatorUsername: string;
  creatorAvatar?: string;
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

const ThreadCard: Component<ThreadCardProps> = (props) => {
  const handleCardClick = () => {
    if (props.onCardClick) {
      props.onCardClick();
    }
  };

  const handleUsernameClick = (e: Event) => {
    e.stopPropagation();
    if (props.onUsernameClick) {
      props.onUsernameClick(e);
    }
  };

  const handleArtistClick = (e: Event) => {
    e.stopPropagation();
    if (props.onArtistClick) {
      props.onArtistClick(e);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'now';
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
    return `${Math.floor(diffDays / 30)}m`;
  };

  return (
    <article
      class="thread-card"
      onClick={handleCardClick}
      role="article"
      aria-label={`Thread by ${props.creatorUsername}: ${props.threadText}`}
    >
      {/* Thread Text (The Question/Title) - Expandable */}
      <div class="thread-card__text">
        <ExpandableText
          text={props.threadText}
          maxLength={80}
          className="thread-card__text-content"
        />
      </div>

      {/* Starter Track (if present) */}
      <Show when={props.starterTrack}>
        {(track) => (
          <div class="thread-card__track">
            <img
              class="thread-card__album-art"
              src={track().albumArt}
              alt={`Album art for ${track().title}`}
              loading="lazy"
            />
            <div class="thread-card__track-info">
              <div class="thread-card__track-title">
                {track().title}
              </div>
              <div
                class="thread-card__track-artist"
                onClick={handleArtistClick}
              >
                {track().artist}
              </div>
            </div>
          </div>
        )}
      </Show>

      {/* Footer: Creator & Stats */}
      <div class="thread-card__footer">
        <div class="thread-card__creator">
          shared by{' '}
          <span
            class="thread-card__username"
            onClick={handleUsernameClick}
          >
            @{props.creatorUsername}
          </span>
          {' • '}
          <span class="thread-card__timestamp">
            {formatTimeAgo(props.timestamp)}
          </span>
        </div>

        <div class="thread-card__stats">
          <span class="thread-card__stat">
            <span>💬</span>
            <span>{props.replyCount} replies</span>
          </span>
          <span class="thread-card__stat">
            <span>❤️</span>
            <span>{props.likeCount} likes</span>
          </span>
        </div>
      </div>
    </article>
  );
};

export default ThreadCard;
```

---

## 6. Expandable Text Pattern

### Why ExpandableText?
Thread starter text is user-generated and can vary wildly in length - from short one-liners to multi-paragraph explanations. Rather than truncating with "..." and losing context, we use the existing ExpandableText component that provides:

1. **Smart Truncation**: Cuts at word boundaries (~80 chars default)
2. **Smooth Animation**: Slidedown expansion using anime.js
3. **Clean Interaction**: Icon-only expand/collapse buttons
4. **Accessibility**: Full keyboard support and ARIA labels
5. **Proven Pattern**: Already used successfully in TracklistCard and other components

### How It Works

**Collapsed State** (default):
- Shows first ~80 characters of thread text
- Displays small cyan icon button (▼) if text is longer
- Entire text area is clickable to expand
- Gradient fade-out effect at the end

**Expanded State** (after click):
- Shows full thread text with proper wrapping
- Slidedown animation (200ms, easeOutQuart)
- Collapse icon (▲) to return to truncated view
- Cyan left border accent for visual distinction

### Visual Design

```css
/* The ExpandableText component provides these styles automatically */

/* Collapsed State */
.expandable-text-collapsed {
  line-height: 1.4;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px; /* Inherits from thread-card__text */
  color: #ffffff;
}

/* Gradient fade-out effect */
.expandable-text-collapsed::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 60px;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--dark-bg));
}

/* Expand/Collapse Icon Button */
.expand-icon-button {
  width: 32px;
  height: 32px;
  border: 1px solid #04caf4;
  background: rgba(4, 202, 244, 0.05);
  color: #04caf4;
  font-size: 12px;
  border-radius: 2px;
  cursor: pointer;
  transition: all 200ms ease;
}

.expand-icon-button:hover {
  background: rgba(4, 202, 244, 0.15);
  box-shadow: 0 0 8px rgba(4, 202, 244, 0.4);
  transform: translateY(-1px);
}

/* Expanded State */
.expandable-text-expanded {
  line-height: 1.5;
  padding: 12px 0 12px 12px;
  background: rgba(4, 202, 244, 0.02);
  border-left: 2px solid #04caf4;
  margin-left: -12px;
  border-radius: 0 4px 4px 0;
}
```

### Implementation Details

**Component Usage:**
```tsx
<ExpandableText
  text={props.threadText}
  maxLength={80}
  className="thread-card__text-content"
/>
```

**Props Explained:**
- `text`: The full thread starter text (any length)
- `maxLength`: Character limit before truncation (80 = ~2 lines)
- `className`: Custom styling for integration with card design

**Animation:**
- Uses `expandText.enter()` and `expandText.leave()` from animations.ts
- Slidedown effect: height animates from 0 to auto
- Icon rotation: 0deg → 90deg for visual feedback
- Duration: 200ms (quick but not jarring)

### User Experience Flow

1. **User sees thread card** → Thread text shows first 80 chars
2. **If text is longer** → Cyan icon (▼) appears inline
3. **User clicks anywhere on text** → Smooth slidedown reveals full content
4. **Full text visible** → Cyan left border accent, collapse icon (▲) shown
5. **User clicks to collapse** → Smooth slide-up back to truncated view

### Accessibility Features

- **Keyboard Navigation**: Tab to focus, Enter/Space to toggle, Escape to collapse
- **Screen Reader**: Announces "Expandable text - Press to expand full text"
- **Focus Indicators**: 2px cyan outline on keyboard focus
- **Touch Targets**: 44px minimum on mobile (icon + padding)
- **ARIA Attributes**: `aria-expanded`, `aria-label`, `role="button"`

### Edge Cases Handled

1. **Short Text** (< 80 chars): No truncation, no icon, no interaction needed
2. **Very Long Text**: Word-boundary truncation prevents mid-word cuts
3. **Long Words/URLs**: Component handles overflow-wrap properly
4. **Rapid Clicking**: Event handlers prevent double-firing
5. **Card Click Propagation**: Text expansion stops propagation to prevent navigating to thread detail

---

## 7. Responsive Behavior

### Mobile (< 640px)
```css
@media (max-width: 640px) {
  .thread-card {
    padding: 16px;
  }

  .thread-card__text {
    font-size: 15px;
  }

  .thread-card__album-art {
    width: 56px;
    height: 56px;
  }

  .thread-card__track-title {
    font-size: 13px;
  }

  .thread-card__track-artist {
    font-size: 12px;
  }

  .thread-card__footer {
    font-size: 12px;
  }
}
```

---

## 7. Interaction Design

### Click Zones
- **Full Card**: Navigate to thread detail view
- **Username**: Navigate to user profile (stops propagation)
- **Artist Name**: Filter/search by artist (stops propagation)

### Hover States
- **Card Hover**: Subtle cyan background tint (already in CSS above)
- **Username Hover**: Magenta text glow
- **Artist Hover**: Cyan text glow

### No Complex Animations
- Keep it simple: just basic transitions
- Focus on fast, responsive interactions
- Use CSS transitions, not anime.js (overkill for this simple card)

---

## 8. Accessibility

### Semantic HTML
```html
<article role="article" aria-label="Thread description">
  <p>Thread text</p>
  <div>Track info</div>
  <div>Creator & stats</div>
</article>
```

### Keyboard Navigation
- Tab through interactive elements: card → username → artist
- Enter/Space activates focused element

### Screen Reader Support
- Meaningful aria-labels on card
- Proper alt text on images
- Clear text content for stats

---

## 9. Integration Points

### Where to Use ThreadCard

**Thread Discovery Page** (`/threads`)
```tsx
<For each={threads()}>
  {(thread) => (
    <ThreadCard
      threadId={thread.id}
      threadText={thread.text}
      creatorUsername={thread.username}
      timestamp={thread.timestamp}
      replyCount={thread.replyCount}
      likeCount={thread.likeCount}
      starterTrack={thread.starterTrack}
      onCardClick={() => navigateToThread(thread.id)}
    />
  )}
</For>
```

**User Profile - Threads Tab**
```tsx
<For each={userThreads()}>
  {(thread) => (
    <ThreadCard {...thread} />
  )}
</For>
```

---

## 10. Data Structure

### Thread Data
```typescript
interface ThreadData {
  id: string;
  text: string;
  username: string;
  userAvatar?: string;
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
}
```

### API Endpoints
```typescript
// GET /api/threads - List all threads
// GET /api/threads/:id - Get single thread detail
// GET /api/users/:username/threads - Get user's threads
```

---

## 11. Implementation Checklist

### Design Phase
- [x] Define simple component interface
- [x] Create clean layout specification
- [x] Design basic interaction patterns
- [x] Plan responsive behavior

### Development Phase
- [ ] Create ThreadCard.tsx component
- [ ] Write threadCard.css styles
- [ ] Add basic hover transitions
- [ ] Implement responsive breakpoints
- [ ] Add keyboard navigation
- [ ] Test accessibility

### Integration Phase
- [ ] Create /threads discovery page
- [ ] Add to user profile
- [ ] Connect to API endpoints
- [ ] Add loading states
- [ ] Test on mobile devices

---

## 12. Why This Design Works

### Simplicity First
- **No visual clutter**: Each element has clear purpose
- **Easy to scan**: Eye flows naturally from text → track → stats
- **Fast to implement**: Reuses existing ExpandableText component, no custom logic needed
- **Easy to maintain**: Simple code is maintainable code

### Focus on Content
- **Thread text is hero**: The question/title gets prominent placement and can expand naturally
- **Graceful text handling**: User-generated content of any length is handled elegantly
- **Track is supporting**: Album art + basic info, nothing more
- **Stats are subtle**: Informative but not distracting

### Consistent with Jamzy Style
- **Retro typography**: JetBrains Mono for thread text
- **Neon accents**: Cyan for artists, magenta for usernames
- **Dark aesthetic**: Subtle backgrounds, glowing hovers
- **Clean spacing**: 8px-based spacing system throughout

---

## Conclusion

This simplified ThreadCard design solves the core problem: helping users discover interesting music conversations quickly. By stripping away complexity and focusing on essentials, we create a component that's:

1. **Easy to understand** at a glance
2. **Fast to implement** with minimal code (reuses ExpandableText)
3. **Simple to maintain** over time
4. **Pleasant to use** with clean, retro styling
5. **Handles any text length** gracefully without breaking layout

The card provides just enough information to make a decision without overwhelming the user. The expandable text pattern ensures that whether users write short questions or lengthy explanations, the card stays clean and scannable. Click into the thread to see the full conversation - that's where the complexity lives, not in the card.

### Key Innovation: Expandable Text Pattern

By leveraging the existing ExpandableText component, we:
- **Solve a real problem**: User-generated text varies wildly in length
- **Maintain simplicity**: No custom truncation logic needed
- **Provide better UX**: Users can read full context without leaving the feed
- **Stay consistent**: Same pattern used across Jamzy (TracklistCard, etc.)
- **Keep it accessible**: Built-in keyboard navigation and screen reader support

---

**Files to Create**:
- `/frontend/src/components/common/TrackCard/NEW/ThreadCard.tsx`
- `/frontend/src/components/common/TrackCard/NEW/threadCard.css`

**Files to Reference**:
- `/web-app/src/components/ui/ExpandableText.tsx` (existing component)
- `/web-app/src/components/ui/ExpandableText.css` (existing styles)
- `/web-app/src/utils/animations.ts` (expandText animations)

**Estimated Implementation Time**: 3-4 hours
**Priority**: High - Enables thread discovery feature
**Dependencies**:
- ✅ ExpandableText component (already exists)
- ✅ expandText animations (already exists in animations.ts)
- Basic Track type
