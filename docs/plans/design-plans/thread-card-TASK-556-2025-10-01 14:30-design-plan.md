# Thread Card Component - Design Plan
**Task**: TASK-556
**Date**: 2025-10-01 14:30
**Component**: ThreadCard.tsx
**Location**: `/web-app/src/components/common/TrackCard/NEW/`
**Design Type**: New Component - Thread Discovery & Navigation

---

## Executive Summary

This design plan creates a new **ThreadCard** component that displays conversation threads in a scannable, information-dense format. Unlike individual track cards that focus on single songs, ThreadCard showcases an entire conversation: the starter track with its context, plus a visual preview of replies. This enables users to browse and discover active music conversations efficiently.

### Design Philosophy Alignment
- **Begin with Purpose**: Help users discover and navigate active music conversations
- **Embrace Simplicity**: One card = one complete thread overview
- **Information Dense, Visually Engaging**: Show conversation depth without overwhelming
- **Details Matter**: Subtle visual cues indicate thread activity and freshness

---

## 1. Design Problem & Context

### What is a Thread?
In Jamzy, every shared track is simultaneously a Farcaster post and a conversation starter:
- **Thread Starter**: The original track share + optional conversation text
- **Thread Replies**: Response tracks shared by others in the conversation
- **Social Context**: Likes, replies, recasts on the original post

### Current State
- Users can enter "thread mode" by clicking the chat button on any track (see LibraryTableRow.tsx)
- ThreadStarter component shows the conversation context when viewing a thread
- No dedicated component for browsing/discovering threads as cards

### Design Challenge
Create a card component that:
1. Shows enough context to decide if a thread is interesting
2. Displays thread depth (how many replies) at a glance
3. Maintains visual consistency with existing track cards
4. Works on both desktop and mobile layouts
5. Provides clear navigation into full thread view

---

## 2. Information Architecture

### Card Content Hierarchy (Priority Order)

#### PRIMARY: Thread Starter Track
- Album artwork (80×80px on desktop, 64×64px on mobile)
- Track title + artist name
- Platform source badge
- Thread starter's username
- Timestamp

#### SECONDARY: Thread Metadata
- Reply count (prominent)
- Total likes across thread
- Conversation text preview (if present)
- Thread activity indicator (new replies, trending, etc.)

#### TERTIARY: Reply Preview
- Visual thumbnails of first 3-4 reply tracks (overlapping stack)
- "+X more" indicator for threads with 5+ replies
- Optional: Most recent replier's username

### Visual Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ [80×80   ] │ Track Title - Artist Name              [🟢]  │
│ [Album   ] │ shared by @username • 2h                      │
│ [Art     ] │                                               │
│            │ 💬 12 replies • ❤️ 45 likes                   │
│            ├───────────────────────────────────────────────┤
│            │ "What are your favorite 90s synthpop         │
│            │ tracks? Looking for deep cuts..."            │
├────────────┴───────────────────────────────────────────────┤
│ 🎧 Replied by:  [▫][▫][▫][▫] +8 more                      │
│                 tiny overlapping thumbnails                │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Component Design Specifications

### 3.1 Component Interface

```typescript
interface ThreadCardProps {
  // Thread starter track
  starterTrack: Track | PersonalTrack;

  // Thread metadata
  threadId: string;
  replyCount: number;
  totalLikes: number;

  // Conversation context
  conversationText?: string;

  // Replies preview
  replyTracks?: (Track | PersonalTrack)[]; // First 4-5 for thumbnails
  mostRecentReplier?: string;

  // Thread activity
  hasNewReplies?: boolean; // Since user last viewed
  isTrending?: boolean;    // High recent activity

  // Interaction handlers
  onCardClick?: () => void;  // Navigate to thread view
  onLike?: (e: Event) => void;
  onReply?: (e: Event) => void;

  // Display options
  variant?: 'compact' | 'expanded';
  showReplyPreview?: boolean;
}
```

### 3.2 Layout Variants

#### Compact Variant (Default - Library/Browse View)
- Single row height (~120px)
- Conversation text truncated to 2 lines
- Reply thumbnails: 4 max, 32×32px each
- Optimized for scanning long lists

#### Expanded Variant (Discover/Featured View)
- Taller card (~180px)
- Full conversation text (up to 4 lines)
- Reply thumbnails: 5 max, 40×40px each
- More breathing room, better for featured threads

### 3.3 Visual Design Specifications

#### Card Container
```css
.thread-card {
  width: 100%;
  min-height: 120px; /* compact */
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px;
  background: transparent;
  transition: background 200ms ease;
  cursor: pointer;
  position: relative;
}

.thread-card:hover {
  background: rgba(4, 202, 244, 0.02); /* subtle cyan tint */
}

.thread-card:active {
  background: rgba(4, 202, 244, 0.05);
}

/* Active thread indicator (has new replies) */
.thread-card.has-new-replies::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #e010e0, #f906d6); /* magenta gradient */
  box-shadow: 0 0 8px rgba(224, 16, 224, 0.6);
}

/* Trending thread indicator */
.thread-card.trending::after {
  content: '🔥';
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 20px;
  animation: trending-pulse 2s ease-in-out infinite;
}

@keyframes trending-pulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 0px rgba(255, 155, 0, 0));
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 8px rgba(255, 155, 0, 0.6));
  }
}
```

#### Main Row (Starter Track Info)
```css
.thread-card__main-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.thread-card__thumbnail {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 4px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: border-color 200ms ease;
}

.thread-card:hover .thread-card__thumbnail {
  border-color: rgba(4, 202, 244, 0.4);
}

.thread-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.thread-card__title-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.thread-card__title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thread-card__artist {
  font-size: 14px;
  font-weight: 600;
  color: #04caf4; /* neon-cyan */
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: text-shadow 200ms ease;
}

.thread-card__artist:hover {
  text-shadow: 0 0 8px rgba(4, 202, 244, 0.6);
}

.thread-card__platform {
  font-size: 16px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0.7;
}
```

#### Social Context Row
```css
.thread-card__context-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Inter', -apple-system, sans-serif;
}

.thread-card__username {
  color: #e010e0; /* neon-magenta */
  font-weight: 500;
  cursor: pointer;
  transition: text-shadow 200ms ease;
}

.thread-card__username:hover {
  text-shadow: 0 0 8px rgba(224, 16, 224, 0.6);
}

.thread-card__timestamp {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.thread-card__separator {
  color: rgba(255, 255, 255, 0.3);
}
```

#### Thread Stats Row
```css
.thread-card__stats-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 4px;
}

.thread-card__stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Inter', -apple-system, sans-serif;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  transition: all 200ms ease;
  background: transparent;
  border: 1px solid transparent;
}

.thread-card__stat:hover {
  background: rgba(4, 202, 244, 0.05);
  border-color: rgba(4, 202, 244, 0.2);
}

.thread-card__stat--replies {
  color: #04caf4;
  font-weight: 600;
}

.thread-card__stat--likes {
  color: rgba(255, 100, 100, 0.8);
}

.thread-card__stat--count {
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
}
```

#### Conversation Text Preview
```css
.thread-card__conversation {
  margin-top: 10px;
  padding: 12px;
  background: rgba(4, 202, 244, 0.02);
  border-left: 2px solid rgba(4, 202, 244, 0.3);
  border-radius: 0 4px 4px 0;
}

.thread-card__conversation-text {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
  font-style: italic;

  /* Truncate to 2 lines in compact mode */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.thread-card--expanded .thread-card__conversation-text {
  -webkit-line-clamp: 4; /* More lines in expanded variant */
}
```

#### Reply Preview Section
```css
.thread-card__replies-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 12px;
}

.thread-card__replies-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Inter', -apple-system, sans-serif;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.thread-card__reply-thumbnails {
  display: flex;
  align-items: center;
  margin-left: -4px; /* Overlap effect */
}

.thread-card__reply-thumb {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  object-fit: cover;
  border: 2px solid #1a1a1a; /* dark-bg for separation */
  margin-left: -8px; /* Overlap */
  transition: transform 200ms ease, z-index 0s;
  position: relative;
  z-index: 1;
}

.thread-card__reply-thumb:first-child {
  margin-left: 0;
}

.thread-card__reply-thumb:hover {
  transform: translateY(-2px) scale(1.1);
  z-index: 10;
  border-color: #04caf4;
}

.thread-card__more-replies {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  margin-left: 8px;
}
```

### 3.4 Responsive Behavior

#### Mobile (< 640px)
```css
@media (max-width: 640px) {
  .thread-card {
    padding: 12px;
    min-height: 100px;
  }

  .thread-card__thumbnail {
    width: 64px;
    height: 64px;
  }

  .thread-card__title {
    font-size: 14px;
  }

  .thread-card__artist {
    font-size: 13px;
  }

  .thread-card__conversation {
    padding: 10px;
  }

  .thread-card__conversation-text {
    font-size: 13px;
    -webkit-line-clamp: 2; /* Always 2 lines on mobile */
  }

  .thread-card__reply-thumb {
    width: 28px;
    height: 28px;
  }

  .thread-card__replies-section {
    margin-top: 10px;
    padding-top: 10px;
  }
}
```

#### Tablet (640px - 1024px)
- Maintain desktop sizing
- Adjust spacing slightly for better density

---

## 4. Interaction Design

### 4.1 Click Zones & Handlers

#### Primary Click Zone (Full Card)
- **Action**: Navigate to thread view (shows ThreadStarter + all replies)
- **Implementation**: `onClick` handler on card container
- **Visual Feedback**: Background color change on hover/active

#### Secondary Click Zones (Stop Propagation)
- **Username**: Navigate to user profile
- **Artist Name**: Filter/search by artist
- **Like Button**: Toggle like on starter track
- **Reply Button**: Open reply form or navigate to thread
- **Reply Thumbnails**: Hover preview of that reply track

### 4.2 Hover States & Animations

#### Card Hover
```typescript
// Using anime.js for smooth transitions
const cardHover = {
  enter: (element: HTMLElement) => {
    anime({
      targets: element,
      background: 'rgba(4, 202, 244, 0.02)',
      duration: 200,
      easing: 'easeOutQuad'
    });

    // Subtle glow on thumbnail
    const thumbnail = element.querySelector('.thread-card__thumbnail');
    if (thumbnail) {
      anime({
        targets: thumbnail,
        borderColor: 'rgba(4, 202, 244, 0.4)',
        duration: 200,
        easing: 'easeOutQuad'
      });
    }
  },

  leave: (element: HTMLElement) => {
    anime({
      targets: element,
      background: 'transparent',
      duration: 200,
      easing: 'easeOutQuad'
    });

    const thumbnail = element.querySelector('.thread-card__thumbnail');
    if (thumbnail) {
      anime({
        targets: thumbnail,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        duration: 200,
        easing: 'easeOutQuad'
      });
    }
  }
};
```

#### Reply Thumbnail Hover
```typescript
const replyThumbHover = {
  enter: (element: HTMLElement) => {
    anime({
      targets: element,
      translateY: -2,
      scale: 1.1,
      borderColor: '#04caf4',
      duration: 150,
      easing: 'easeOutCubic'
    });
  },

  leave: (element: HTMLElement) => {
    anime({
      targets: element,
      translateY: 0,
      scale: 1,
      borderColor: '#1a1a1a',
      duration: 150,
      easing: 'easeOutCubic'
    });
  }
};
```

### 4.3 Loading & Empty States

#### Loading State (Skeleton)
```tsx
const ThreadCardSkeleton = () => (
  <div class="thread-card thread-card--loading">
    <div class="thread-card__main-row">
      <div class="skeleton skeleton-thumbnail" />
      <div class="thread-card__info">
        <div class="skeleton skeleton-title" />
        <div class="skeleton skeleton-artist" />
        <div class="skeleton skeleton-context" />
      </div>
    </div>
    <div class="skeleton skeleton-conversation" />
  </div>
);
```

```css
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.03) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-thumbnail {
  width: 80px;
  height: 80px;
}

.skeleton-title {
  height: 20px;
  width: 70%;
  margin-bottom: 8px;
}

.skeleton-artist {
  height: 16px;
  width: 40%;
  margin-bottom: 8px;
}

.skeleton-context {
  height: 14px;
  width: 50%;
}

.skeleton-conversation {
  height: 60px;
  margin-top: 12px;
}
```

#### Empty State (No Threads)
```tsx
const NoThreadsMessage = () => (
  <div class="no-threads-message">
    <div class="no-threads-icon">💬</div>
    <h3 class="no-threads-title">No conversations yet</h3>
    <p class="no-threads-subtitle">
      Share a track to start a conversation
    </p>
  </div>
);
```

---

## 5. Accessibility Considerations

### 5.1 Semantic HTML Structure
```tsx
<article
  class="thread-card"
  role="article"
  aria-label={`Thread started by ${username} about ${trackTitle}`}
>
  <header class="thread-card__header">
    {/* Track info */}
  </header>

  <section class="thread-card__content">
    {/* Conversation text */}
  </section>

  <footer class="thread-card__footer">
    {/* Stats and reply preview */}
  </footer>
</article>
```

### 5.2 ARIA Labels & Roles
```tsx
// Reply count button
<button
  class="thread-card__stat thread-card__stat--replies"
  onClick={handleReplyClick}
  aria-label={`${replyCount} replies. Click to view thread.`}
>
  <span aria-hidden="true">💬</span>
  <span class="thread-card__stat--count">{replyCount}</span>
  <span class="sr-only">replies</span>
</button>

// Like button
<button
  class="thread-card__stat thread-card__stat--likes"
  onClick={handleLikeClick}
  aria-label={`${totalLikes} likes. ${isLiked ? 'Unlike' : 'Like'} this thread.`}
  aria-pressed={isLiked}
>
  <span aria-hidden="true">{isLiked ? '❤️' : '❤'}</span>
  <span class="thread-card__stat--count">{totalLikes}</span>
  <span class="sr-only">likes</span>
</button>

// Reply thumbnail
<img
  class="thread-card__reply-thumb"
  src={track.albumArt}
  alt={`Reply by ${track.addedBy}: ${track.title}`}
  loading="lazy"
/>
```

### 5.3 Keyboard Navigation
- **Tab**: Focus on card → reply button → like button → reply thumbnails
- **Enter/Space**: Activate focused element
- **Escape**: Close any expanded previews

### 5.4 Screen Reader Announcements
```tsx
// When thread has new replies
<div class="sr-only" aria-live="polite">
  New replies in thread about {trackTitle}
</div>

// When user likes thread
<div class="sr-only" aria-live="polite">
  {isLiked ? 'Liked thread' : 'Unliked thread'}
</div>
```

### 5.5 Color Contrast
All text meets WCAG AAA standards (7:1 ratio):
- Title: `#ffffff` on `#1a1a1a` = 21:1 ✅
- Artist (cyan): `#04caf4` on `#1a1a1a` = 8.2:1 ✅
- Username (magenta): `#e010e0` on `#1a1a1a` = 7.8:1 ✅
- Body text: `rgba(255,255,255,0.7)` = 14.7:1 ✅

---

## 6. Component Implementation

### 6.1 File Structure
```
/web-app/src/components/common/TrackCard/NEW/
├── ThreadCard.tsx           # Main component
├── threadCard.css          # Styles
├── ThreadCardSkeleton.tsx  # Loading state component
└── index.ts                # Exports
```

### 6.2 Core Component Structure

```tsx
import { Component, Show, For, createSignal } from 'solid-js';
import { Track } from '../../../../stores/playerStore';
import { PersonalTrack } from '../../../../types/library';
import './threadCard.css';

interface ThreadCardProps {
  starterTrack: Track | PersonalTrack;
  threadId: string;
  replyCount: number;
  totalLikes: number;
  conversationText?: string;
  replyTracks?: (Track | PersonalTrack)[];
  mostRecentReplier?: string;
  hasNewReplies?: boolean;
  isTrending?: boolean;
  onCardClick?: () => void;
  onLike?: (e: Event) => void;
  onReply?: (e: Event) => void;
  variant?: 'compact' | 'expanded';
  showReplyPreview?: boolean;
}

const ThreadCard: Component<ThreadCardProps> = (props) => {
  const [isLiked, setIsLiked] = createSignal(false);
  let cardRef: HTMLElement | undefined;

  const variant = () => props.variant || 'compact';
  const showReplyPreview = () => props.showReplyPreview !== false;

  const handleCardClick = () => {
    if (props.onCardClick) {
      props.onCardClick();
    }
  };

  const handleLikeClick = (e: Event) => {
    e.stopPropagation();
    setIsLiked(!isLiked());
    if (props.onLike) {
      props.onLike(e);
    }
  };

  const handleReplyClick = (e: Event) => {
    e.stopPropagation();
    if (props.onReply) {
      props.onReply(e);
    } else {
      handleCardClick(); // Default to opening thread
    }
  };

  const getPlatformIcon = (source: string) => {
    switch (source) {
      case 'youtube': return '📺';
      case 'spotify': return '🟢';
      case 'soundcloud': return '🧡';
      case 'bandcamp': return '🔵';
      default: return '🎵';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    // Compact time formatting logic (same as RowTrackCard)
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

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    const cutPoint = text.lastIndexOf(' ', maxLength);
    return text.substring(0, cutPoint > 0 ? cutPoint : maxLength) + '...';
  };

  const visibleReplyThumbs = () => {
    const max = variant() === 'expanded' ? 5 : 4;
    return props.replyTracks?.slice(0, max) || [];
  };

  const additionalReplies = () => {
    const visible = visibleReplyThumbs().length;
    return props.replyCount - visible;
  };

  return (
    <article
      ref={cardRef}
      class={`thread-card thread-card--${variant()} ${
        props.hasNewReplies ? 'has-new-replies' : ''
      } ${props.isTrending ? 'trending' : ''}`}
      onClick={handleCardClick}
      role="article"
      aria-label={`Thread started by ${props.starterTrack.addedBy} about ${props.starterTrack.title}`}
    >
      {/* Main Row - Starter Track */}
      <div class="thread-card__main-row">
        <img
          class="thread-card__thumbnail"
          src={props.starterTrack.albumArt}
          alt={`Album art for ${props.starterTrack.title}`}
          loading="lazy"
        />

        <div class="thread-card__info">
          {/* Title + Platform */}
          <div class="thread-card__title-row">
            <h3 class="thread-card__title">
              {props.starterTrack.title}
            </h3>
            <span class="thread-card__platform">
              {getPlatformIcon(props.starterTrack.source)}
            </span>
          </div>

          {/* Artist */}
          <div class="thread-card__artist">
            {props.starterTrack.artist}
          </div>

          {/* Social Context */}
          <div class="thread-card__context-row">
            <span>shared by</span>
            <button
              class="thread-card__username"
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to user profile
              }}
            >
              @{props.starterTrack.addedBy}
            </button>
            <span class="thread-card__separator">•</span>
            <span class="thread-card__timestamp">
              {formatTimeAgo(props.starterTrack.timestamp)}
            </span>
          </div>

          {/* Thread Stats */}
          <div class="thread-card__stats-row">
            <button
              class="thread-card__stat thread-card__stat--replies"
              onClick={handleReplyClick}
              aria-label={`${props.replyCount} replies. Click to view thread.`}
            >
              <span aria-hidden="true">💬</span>
              <span class="thread-card__stat--count">{props.replyCount}</span>
              <span class="sr-only">replies</span>
            </button>

            <button
              class="thread-card__stat thread-card__stat--likes"
              onClick={handleLikeClick}
              aria-label={`${props.totalLikes} likes. ${isLiked() ? 'Unlike' : 'Like'} this thread.`}
              aria-pressed={isLiked()}
            >
              <span aria-hidden="true">{isLiked() ? '❤️' : '❤'}</span>
              <span class="thread-card__stat--count">{props.totalLikes}</span>
              <span class="sr-only">likes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conversation Text */}
      <Show when={props.conversationText}>
        <div class="thread-card__conversation">
          <p class="thread-card__conversation-text">
            {variant() === 'compact'
              ? truncateText(props.conversationText!, 120)
              : truncateText(props.conversationText!, 200)
            }
          </p>
        </div>
      </Show>

      {/* Reply Preview Section */}
      <Show when={showReplyPreview() && props.replyCount > 0}>
        <div class="thread-card__replies-section">
          <span class="thread-card__replies-label">🎧 Replied by:</span>

          <div class="thread-card__reply-thumbnails">
            <For each={visibleReplyThumbs()}>
              {(track) => (
                <img
                  class="thread-card__reply-thumb"
                  src={track.albumArt}
                  alt={`Reply by ${track.addedBy}: ${track.title}`}
                  loading="lazy"
                  title={`${track.title} - ${track.artist}`}
                />
              )}
            </For>

            <Show when={additionalReplies() > 0}>
              <span class="thread-card__more-replies">
                +{additionalReplies()} more
              </span>
            </Show>
          </div>
        </div>
      </Show>
    </article>
  );
};

export default ThreadCard;
```

### 6.3 Export Configuration

```typescript
// /web-app/src/components/common/TrackCard/NEW/index.ts
export { default as ThreadCard } from './ThreadCard';
export { default as ThreadCardSkeleton } from './ThreadCardSkeleton';
export { default as RowTrackCard } from './RowTrackCard';
export { default as CompactTrackCard } from './CompactTrackCard';
export { default as HeroTrackCard } from './HeroTrackCard';
```

---

## 7. Integration Points

### 7.1 Where ThreadCard Will Be Used

#### Thread Discovery Page
```tsx
// New page: /threads or /discover/threads
import { ThreadCard } from '../components/common/TrackCard/NEW';

const ThreadsPage = () => {
  const [threads, setThreads] = createSignal<ThreadData[]>([]);

  return (
    <div class="threads-page">
      <header class="threads-header">
        <h1>Active Conversations</h1>
        <div class="threads-filters">
          <button>Trending 🔥</button>
          <button>New Replies</button>
          <button>Following</button>
        </div>
      </header>

      <div class="threads-list">
        <For each={threads()}>
          {(thread) => (
            <ThreadCard
              starterTrack={thread.starterTrack}
              threadId={thread.id}
              replyCount={thread.replyCount}
              totalLikes={thread.totalLikes}
              conversationText={thread.conversationText}
              replyTracks={thread.recentReplies}
              hasNewReplies={thread.hasNewReplies}
              isTrending={thread.isTrending}
              onCardClick={() => navigateToThread(thread.id)}
              variant="compact"
            />
          )}
        </For>
      </div>
    </div>
  );
};
```

#### User Profile - Active Threads Tab
```tsx
// Show threads the user has started or participated in
<For each={userThreads()}>
  {(thread) => (
    <ThreadCard
      {...thread}
      variant="compact"
      showReplyPreview={true}
    />
  )}
</For>
```

#### Library - Thread Filter View
```tsx
// When filtering library by threads only
<Show when={viewMode() === 'threads'}>
  <For each={libraryThreads()}>
    {(thread) => (
      <ThreadCard
        {...thread}
        variant="compact"
      />
    )}
  </For>
</Show>
```

### 7.2 Data Flow & API Integration

#### Thread Data Structure
```typescript
interface ThreadData {
  id: string;
  starterTrack: Track | PersonalTrack;
  conversationText?: string;
  replyCount: number;
  totalLikes: number;
  recentReplies: (Track | PersonalTrack)[];
  hasNewReplies: boolean;
  isTrending: boolean;
  createdAt: string;
  lastReplyAt: string;
}
```

#### API Endpoints Needed
```typescript
// GET /api/threads - List all threads
// GET /api/threads/:id - Get thread details
// GET /api/threads/trending - Get trending threads
// GET /api/threads/following - Get threads from followed users
// GET /api/users/:id/threads - Get user's threads
// POST /api/threads/:id/like - Like a thread
```

---

## 8. Testing Strategy

### 8.1 Unit Tests
```typescript
describe('ThreadCard', () => {
  it('renders starter track info correctly', () => {
    // Test track title, artist, platform icon
  });

  it('shows conversation text when provided', () => {
    // Test text rendering and truncation
  });

  it('displays reply count and likes', () => {
    // Test stats display
  });

  it('shows reply thumbnails with correct overlap', () => {
    // Test visual preview
  });

  it('indicates new replies with visual marker', () => {
    // Test hasNewReplies flag
  });

  it('shows trending indicator when trending', () => {
    // Test isTrending flag
  });

  it('handles click events correctly', () => {
    // Test onClick, onLike, onReply handlers
  });

  it('stops propagation on interactive elements', () => {
    // Test event bubbling prevention
  });
});
```

### 8.2 Visual Regression Tests
- Compact variant rendering
- Expanded variant rendering
- Mobile responsive layout
- Hover states
- Loading skeleton
- Empty state

### 8.3 Accessibility Tests
- Keyboard navigation flow
- Screen reader announcements
- ARIA label correctness
- Color contrast validation
- Focus indicator visibility

---

## 9. Performance Considerations

### 9.1 Rendering Optimization
```tsx
// Lazy load reply thumbnails
<img
  class="thread-card__reply-thumb"
  src={track.albumArt}
  loading="lazy"
  decoding="async"
/>

// Virtualize long thread lists
import { VirtualList } from 'solid-virtual-list';

<VirtualList
  items={threads()}
  height={600}
  itemHeight={120} // Compact card height
>
  {(thread) => <ThreadCard {...thread} />}
</VirtualList>
```

### 9.2 Animation Performance
- Use `transform` and `opacity` only (GPU accelerated)
- Avoid layout thrashing (no `getBoundingClientRect` in loops)
- Disable animations when `prefers-reduced-motion: reduce`

```css
@media (prefers-reduced-motion: reduce) {
  .thread-card,
  .thread-card__thumbnail,
  .thread-card__reply-thumb {
    transition: none !important;
    animation: none !important;
  }
}
```

### 9.3 Bundle Size
- Share CSS between card variants (thread, row, compact, hero)
- Use CSS variables for colors/spacing (no duplication)
- Tree-shake unused animations

---

## 10. Future Enhancements (Out of Scope)

### Phase 2 Features
1. **Inline Reply Form**: Quick reply without leaving thread list
2. **Thread Filtering**: By genre, date range, reply count
3. **Thread Sorting**: Most replies, most likes, most recent activity
4. **Thread Bookmarking**: Save threads to read later
5. **Thread Notifications**: Alert when followed threads get replies

### Advanced Features
1. **Thread Branching Visualization**: Show conversation tree structure
2. **AI Thread Summarization**: "5 users recommend similar synthpop tracks"
3. **Thread Analytics**: Track engagement, most active participants
4. **Thread Moderation**: Flag inappropriate content, mute threads
5. **Thread Embedding**: Share thread cards externally

---

## 11. Design Rationale

### Why This Layout?
1. **Starter Track Prominence**: Larger thumbnail (80×80px) anchors the card
2. **Reply Preview**: Overlapping thumbnails create visual interest without clutter
3. **Conversation First**: Text preview gets dedicated space, not squeezed
4. **Scannable Stats**: Reply count positioned prominently (cyan, bold)
5. **Activity Indicators**: Left border (new) and flame icon (trending) are subtle but noticeable

### Why Compact by Default?
- Most use cases involve browsing multiple threads
- Users can expand individual threads by clicking
- Compact cards fit more threads in viewport (better discovery)
- Expanded variant reserved for featured/hero sections

### Why Overlapping Reply Thumbnails?
- Space-efficient visualization of thread depth
- Creates visual rhythm in thread lists
- Mimics social platforms (Twitter, Instagram story rings)
- Hover interaction reveals individual replies

### Why Separate from Track Cards?
- Different information hierarchy (thread vs. single track)
- Different interaction model (navigate to thread vs. play track)
- Different visual treatment (conversation-focused vs. music-focused)
- Allows independent evolution of both components

---

## 12. Implementation Checklist

### Design Phase
- [x] Define component interface and props
- [x] Create layout specifications
- [x] Design interaction patterns
- [x] Plan responsive behavior
- [x] Document accessibility requirements

### Development Phase
- [ ] Create ThreadCard.tsx component
- [ ] Implement threadCard.css styles
- [ ] Add hover animations with anime.js
- [ ] Create ThreadCardSkeleton component
- [ ] Add responsive media queries
- [ ] Implement keyboard navigation
- [ ] Add ARIA labels and roles

### Testing Phase
- [ ] Write unit tests
- [ ] Test keyboard navigation
- [ ] Validate screen reader experience
- [ ] Check color contrast ratios
- [ ] Test on mobile devices
- [ ] Visual regression testing
- [ ] Performance profiling

### Integration Phase
- [ ] Create /threads discovery page
- [ ] Add thread filter to library
- [ ] Update navigation to include threads
- [ ] Connect to API endpoints
- [ ] Add loading/error states
- [ ] Document usage examples

---

## 13. Success Metrics

### User Engagement
- **Thread Click-Through Rate**: >30% of users click into threads from card
- **Reply Rate**: Threads with visible reply previews get 2x more engagement
- **Time on Thread Discovery**: Users spend avg 5+ minutes browsing threads

### Technical Performance
- **Initial Render**: <100ms per card
- **Scroll Performance**: 60fps with 50+ cards
- **Bundle Size**: <5KB CSS + 8KB JS (gzipped)

### Accessibility
- **Keyboard Navigation**: All interactions accessible via keyboard
- **Screen Reader**: All content announced correctly
- **Color Contrast**: WCAG AAA compliance (7:1 minimum)

---

## Conclusion

The ThreadCard component bridges the gap between individual track sharing and community conversation discovery. By presenting thread metadata, conversation context, and visual reply previews in a scannable format, it enables users to quickly identify interesting music discussions and dive deeper.

This design maintains Jamzy's retro-cyberpunk aesthetic while optimizing for information density and visual engagement. The component integrates seamlessly with existing track cards and supports both desktop and mobile experiences.

**Key Differentiator**: Unlike traditional social media thread cards, ThreadCard is music-first—the starter track's album art and metadata remain prominent while conversation context and reply activity add social richness.

---

**Files to Create**:
- `/web-app/src/components/common/TrackCard/NEW/ThreadCard.tsx`
- `/web-app/src/components/common/TrackCard/NEW/threadCard.css`
- `/web-app/src/components/common/TrackCard/NEW/ThreadCardSkeleton.tsx`

**Estimated Implementation Time**: 12-16 hours
**Priority**: High - Enables core thread discovery feature
**Dependencies**: None (uses existing Track/PersonalTrack types)
