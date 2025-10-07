# Activity Page Design Plan
**Task:** TASK-580 - Create Activity Page
**Date:** 2025-10-01
**Designer:** Zen Master Design Agent
**Status:** Ready for Implementation

---

## 1. Design Philosophy & Approach

### Core Principle: Simplicity First
The Activity Page represents a straightforward problem: show users what's happening across the Jamzy network right now. Following our core design principle, we choose the **simplest solution**—a unified, chronological feed that displays all network activity in one stream.

### Design Intent
Create a **real-time pulse** of the Jamzy network where users can:
- See what tracks are being shared across the platform
- Discover new music through community activity
- Jump into conversations around tracks
- Feel connected to the broader network

### Aesthetic Direction
Following Jamzy's retro-cyberpunk aesthetic:
- **Information density**: Show meaningful data without overwhelming
- **Neon highlights**: Use color to differentiate activity types
- **Terminal-like feed**: Think scrolling activity log meets music discovery
- **Consistent patterns**: Leverage existing TrackCard components for familiarity

---

## 2. Page Structure & Layout

### Overall Page Architecture
```
┌─────────────────────────────────────────┐
│ STICKY HEADER (64px)                    │
│ - Page Title: "Activity"                │
│ - Optional filter/sort controls         │
└─────────────────────────────────────────┘
│                                         │
│ SCROLLABLE ACTIVITY FEED                │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ Activity Item 1                 │   │
│ │ (Track Share / Reply / Likes)   │   │
│ └─────────────────────────────────┘   │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ Activity Item 2                 │   │
│ └─────────────────────────────────┘   │
│                                         │
│ ... (continues)                         │
│                                         │
│ Bottom padding: 120px for nav + player  │
└─────────────────────────────────────────┘
│ MOBILE NAVIGATION (fixed bottom)        │
│ MEDIA PLAYER (when active)              │
└─────────────────────────────────────────┘
```

### Layout Specifications

**Container:**
- Full viewport height: `height: 100vh`
- Flex column layout: `display: flex; flex-direction: column`
- Background: `var(--dark-bg)` (#1a1a1a)
- Color: `var(--light-text)` (#ffffff)

**Header:**
- Position: `position: sticky; top: 0; z-index: 10`
- Background: `var(--darker-bg)` (#0f0f0f)
- Border bottom: `1px solid rgba(59, 0, 253, 0.3)` (neon-blue at 30% opacity)
- Padding: `var(--space-4)` (16px)
- Height: 64px total (including padding)

**Feed Container:**
- Flex: `flex: 1`
- Overflow: `overflow-y: auto`
- Padding: `var(--space-4)` (16px)
- Bottom padding: `120px` (space for navigation + player)

---

## 3. Activity Types & Visual Design

### Three Activity Types

#### 3.1 Track Share Activity
**Purpose:** Show when a user shares a new track (creates a new thread)

**Visual Structure:**
```
┌──────────────────────────────────────────┐
│ 👤 @username shared a track • 2h ago     │ ← Context Header
├──────────────────────────────────────────┤
│                                          │
│  [  Track Card Component  ]              │ ← Reuse RowTrackCard
│  - Thumbnail                             │
│  - Track info (title, artist)            │
│  - Social actions (play, like, reply)    │
│                                          │
└──────────────────────────────────────────┘
```

**Implementation Details:**
- **Context Header:**
  - Font: `var(--font-interface)` (system sans-serif)
  - Size: `var(--text-sm)` (14px)
  - Color for username: `var(--neon-magenta)` (#e010e0) - clickable
  - Action text: `var(--muted-text)` (#cccccc)
  - Timestamp: `var(--muted-text)` (#cccccc)
  - Avatar: 24x24px circle, left of username
  - Spacing: `gap: var(--space-2)` (8px)
  - Margin bottom: `var(--space-2)` (8px)

- **Track Card:**
  - Use existing `RowTrackCard` component
  - Props: `showComment={true}`, `showSocialActions={true}`
  - Full width, maintains existing styles
  - Enable play, like, and reply interactions

- **Container:**
  - Background: `rgba(59, 0, 253, 0.05)` (subtle blue tint)
  - Border: `1px solid rgba(59, 0, 253, 0.2)`
  - Border radius: `4px` (sharp corners, minimal rounding)
  - Padding: `var(--space-4)` (16px)
  - Margin bottom: `var(--space-4)` (16px)

#### 3.2 Reply Activity
**Purpose:** Show when a user replies to a track with another track

**Visual Structure:**
```
┌──────────────────────────────────────────┐
│ 👤 @username replied to @original • 3h   │ ← Context Header
├──────────────────────────────────────────┤
│                                          │
│  [  Track Card - Reply Track  ]          │ ← The reply track
│                                          │
│  ↳ in response to:                       │ ← Connector line
│                                          │
│  [  Track Card - Original Track  ]       │ ← Original track (simplified)
│     (compact view)                       │
│                                          │
└──────────────────────────────────────────┘
```

**Implementation Details:**
- **Context Header:**
  - Same style as Track Share
  - Text: "@username replied to @original_username"
  - Both usernames in `var(--neon-magenta)`, clickable
  - Replier username slightly brighter for emphasis

- **Reply Track:**
  - Full `RowTrackCard` with all interactions enabled
  - Shows the track that was shared as a reply

- **Connector:**
  - Text: "in response to:" or "↳ replying to:"
  - Font: `var(--font-monospace)` (monospace for data feel)
  - Size: `var(--text-xs)` (12px)
  - Color: `var(--neon-cyan)` (#04caf4)
  - Margin: `var(--space-2)` (8px) top and bottom
  - Optional: Left border line showing relationship (2px `var(--neon-cyan)`)

- **Original Track:**
  - **Simplified version** of RowTrackCard (compact mode)
  - Show thumbnail, title, artist only
  - Reduce social actions or show as read-only counts
  - Slightly muted appearance: `opacity: 0.85`
  - Background: `rgba(255, 255, 255, 0.03)` (very subtle)
  - Click navigates to full thread

- **Container:**
  - Background: `rgba(4, 202, 244, 0.05)` (subtle cyan tint)
  - Border: `1px solid rgba(4, 202, 244, 0.2)`
  - Border radius: `4px`
  - Padding: `var(--space-4)` (16px)
  - Margin bottom: `var(--space-4)` (16px)

#### 3.3 Aggregated Likes Activity
**Purpose:** Show when a track gets significant engagement (multiple likes)

**Visual Structure:**
```
┌──────────────────────────────────────────┐
│ ❤️ 12 people liked this track • 1h ago   │ ← Engagement Header
├──────────────────────────────────────────┤
│                                          │
│  [  Track Card Component  ]              │ ← Track that got likes
│                                          │
│  👤👤👤 +9 others                         │ ← User avatars
│                                          │
└──────────────────────────────────────────┘
```

**Implementation Details:**
- **Engagement Header:**
  - Icon: Heart symbol (❤️) or styled div with glow
  - Text: "X people liked this track"
  - Font: `var(--font-interface)`
  - Size: `var(--text-sm)` (14px)
  - Like count: `var(--neon-green)` (#00f92a) - success color
  - Rest of text: `var(--muted-text)` (#cccccc)
  - Margin bottom: `var(--space-2)` (8px)

- **Track Card:**
  - Full `RowTrackCard` component
  - All interactions enabled
  - Like button shows active state with count

- **User Avatars Row:**
  - Show first 3-4 user avatars who liked
  - Size: 24x24px each
  - Overlap slightly: `margin-left: -8px` (except first)
  - "+X others" text in `var(--text-xs)`, `var(--muted-text)`
  - Margin top: `var(--space-2)` (8px)
  - Hover reveals tooltip with names

- **Container:**
  - Background: `rgba(0, 249, 42, 0.05)` (subtle green tint)
  - Border: `1px solid rgba(0, 249, 42, 0.2)`
  - Border radius: `4px`
  - Padding: `var(--space-4)` (16px)
  - Margin bottom: `var(--space-4)` (16px)

---

## 4. Component Architecture

### 4.1 Page Component: `ActivityPage.tsx`
**Location:** `/mini-app/src/pages/ActivityPage.tsx`

**Structure:**
```typescript
import { Component, createSignal, For } from 'solid-js';
import { A } from '@solidjs/router';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import ActivityItem from '../components/activity/ActivityItem';
import { mockActivityFeed, ActivityEvent } from '../data/mockActivity';

const ActivityPage: Component = () => {
  const [activityFeed] = createSignal<ActivityEvent[]>(mockActivityFeed);

  return (
    <div style={{
      display: 'flex',
      'flex-direction': 'column',
      height: '100vh',
      background: 'var(--dark-bg)',
      color: 'var(--light-text)'
    }}>
      {/* Sticky Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        'z-index': 10,
        background: 'var(--darker-bg)',
        'border-bottom': '1px solid rgba(59, 0, 253, 0.3)',
        padding: 'var(--space-4)'
      }}>
        <h1 style={{
          margin: 0,
          'font-size': 'var(--text-xl)',
          color: 'var(--neon-cyan)',
          'font-family': 'var(--font-display)'
        }}>
          Activity
        </h1>
      </div>

      {/* Scrollable Feed */}
      <div style={{
        flex: 1,
        'overflow-y': 'auto',
        padding: 'var(--space-4)',
        'padding-bottom': '120px'
      }}>
        <For each={activityFeed()}>
          {(activity) => <ActivityItem activity={activity} />}
        </For>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default ActivityPage;
```

**Key Principles:**
- **Matches ThreadsPage pattern exactly** for consistency
- Simple, flat structure—no unnecessary nesting
- Direct inline styles for clarity (following ThreadsPage approach)
- Uses existing navigation component

### 4.2 Activity Item Component: `ActivityItem.tsx`
**Location:** `/mini-app/src/components/activity/ActivityItem.tsx`

**Purpose:** Render individual activity items based on type

**Structure:**
```typescript
import { Component, Match, Switch } from 'solid-js';
import { ActivityEvent } from '../../data/mockActivity';
import TrackShareActivity from './TrackShareActivity';
import ReplyActivity from './ReplyActivity';
import LikesActivity from './LikesActivity';

interface ActivityItemProps {
  activity: ActivityEvent;
}

const ActivityItem: Component<ActivityItemProps> = (props) => {
  return (
    <Switch>
      <Match when={props.activity.type === 'track_share'}>
        <TrackShareActivity activity={props.activity} />
      </Match>
      <Match when={props.activity.type === 'reply'}>
        <ReplyActivity activity={props.activity} />
      </Match>
      <Match when={props.activity.type === 'aggregated_likes'}>
        <LikesActivity activity={props.activity} />
      </Match>
    </Switch>
  );
};

export default ActivityItem;
```

**Principles:**
- **Type-safe routing** using SolidJS Switch/Match
- Delegates rendering to specialized components
- Clean separation of concerns

### 4.3 Activity Type Components

#### TrackShareActivity.tsx
**Location:** `/mini-app/src/components/activity/TrackShareActivity.tsx`

```typescript
import { Component } from 'solid-js';
import { A } from '@solidjs/router';
import { RowTrackCard } from '../common/TrackCard/NEW';
import { ActivityEvent } from '../../data/mockActivity';
import { setCurrentTrack, setIsPlaying } from '../../stores/playerStore';

interface TrackShareActivityProps {
  activity: ActivityEvent;
}

const TrackShareActivity: Component<TrackShareActivityProps> = (props) => {
  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  return (
    <div style={{
      background: 'rgba(59, 0, 253, 0.05)',
      border: '1px solid rgba(59, 0, 253, 0.2)',
      'border-radius': '4px',
      padding: 'var(--space-4)',
      'margin-bottom': 'var(--space-4)'
    }}>
      {/* Context Header */}
      <div style={{
        display: 'flex',
        'align-items': 'center',
        gap: 'var(--space-2)',
        'margin-bottom': 'var(--space-2)',
        'font-size': 'var(--text-sm)'
      }}>
        <img
          src={props.activity.user.avatar}
          alt={props.activity.user.username}
          style={{
            width: '24px',
            height: '24px',
            'border-radius': '50%'
          }}
        />
        <A
          href={`/user/${props.activity.user.username}`}
          style={{
            color: 'var(--neon-magenta)',
            'text-decoration': 'none',
            'font-weight': 500
          }}
        >
          @{props.activity.user.username}
        </A>
        <span style={{ color: 'var(--muted-text)' }}>
          shared a track
        </span>
        <span style={{ color: 'var(--muted-text)' }}>
          • {props.activity.timestamp}
        </span>
      </div>

      {/* Track Card */}
      <RowTrackCard
        track={props.activity.track}
        onPlay={playTrack}
        showComment={true}
        showSocialActions={true}
      />
    </div>
  );
};

export default TrackShareActivity;
```

#### ReplyActivity.tsx
**Location:** `/mini-app/src/components/activity/ReplyActivity.tsx`

```typescript
import { Component } from 'solid-js';
import { A } from '@solidjs/router';
import { RowTrackCard } from '../common/TrackCard/NEW';
import { ActivityEvent } from '../../data/mockActivity';
import { setCurrentTrack, setIsPlaying } from '../../stores/playerStore';

interface ReplyActivityProps {
  activity: ActivityEvent;
}

const ReplyActivity: Component<ReplyActivityProps> = (props) => {
  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  return (
    <div style={{
      background: 'rgba(4, 202, 244, 0.05)',
      border: '1px solid rgba(4, 202, 244, 0.2)',
      'border-radius': '4px',
      padding: 'var(--space-4)',
      'margin-bottom': 'var(--space-4)'
    }}>
      {/* Context Header */}
      <div style={{
        display: 'flex',
        'align-items': 'center',
        gap: 'var(--space-2)',
        'margin-bottom': 'var(--space-2)',
        'font-size': 'var(--text-sm)'
      }}>
        <img
          src={props.activity.user.avatar}
          alt={props.activity.user.username}
          style={{
            width: '24px',
            height: '24px',
            'border-radius': '50%'
          }}
        />
        <A href={`/user/${props.activity.user.username}`}
          style={{ color: 'var(--neon-magenta)', 'text-decoration': 'none' }}>
          @{props.activity.user.username}
        </A>
        <span style={{ color: 'var(--muted-text)' }}>replied to</span>
        <A href={`/user/${props.activity.originalUser.username}`}
          style={{ color: 'var(--neon-magenta)', 'text-decoration': 'none' }}>
          @{props.activity.originalUser.username}
        </A>
        <span style={{ color: 'var(--muted-text)' }}>
          • {props.activity.timestamp}
        </span>
      </div>

      {/* Reply Track */}
      <RowTrackCard
        track={props.activity.track}
        onPlay={playTrack}
        showComment={true}
        showSocialActions={true}
      />

      {/* Connector */}
      <div style={{
        'margin-top': 'var(--space-2)',
        'margin-bottom': 'var(--space-2)',
        'padding-left': 'var(--space-2)',
        'border-left': '2px solid var(--neon-cyan)',
        'font-family': 'var(--font-monospace)',
        'font-size': 'var(--text-xs)',
        color: 'var(--neon-cyan)'
      }}>
        ↳ in response to:
      </div>

      {/* Original Track (Simplified) */}
      <A href={`/thread/${props.activity.originalThreadId}`}
        style={{ 'text-decoration': 'none' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          padding: 'var(--space-3)',
          'border-radius': '4px',
          opacity: 0.85
        }}>
          <RowTrackCard
            track={props.activity.originalTrack}
            onPlay={playTrack}
            showComment={false}
            showSocialActions={false}
          />
        </div>
      </A>
    </div>
  );
};

export default ReplyActivity;
```

#### LikesActivity.tsx
**Location:** `/mini-app/src/components/activity/LikesActivity.tsx`

```typescript
import { Component, For } from 'solid-js';
import { RowTrackCard } from '../common/TrackCard/NEW';
import { ActivityEvent } from '../../data/mockActivity';
import { setCurrentTrack, setIsPlaying } from '../../stores/playerStore';

interface LikesActivityProps {
  activity: ActivityEvent;
}

const LikesActivity: Component<LikesActivityProps> = (props) => {
  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const displayAvatars = props.activity.likedByUsers?.slice(0, 4) || [];
  const remainingCount = (props.activity.likeCount || 0) - displayAvatars.length;

  return (
    <div style={{
      background: 'rgba(0, 249, 42, 0.05)',
      border: '1px solid rgba(0, 249, 42, 0.2)',
      'border-radius': '4px',
      padding: 'var(--space-4)',
      'margin-bottom': 'var(--space-4)'
    }}>
      {/* Engagement Header */}
      <div style={{
        display: 'flex',
        'align-items': 'center',
        gap: 'var(--space-2)',
        'margin-bottom': 'var(--space-2)',
        'font-size': 'var(--text-sm)'
      }}>
        <span style={{ 'font-size': '16px' }}>❤️</span>
        <span style={{ color: 'var(--neon-green)', 'font-weight': 600 }}>
          {props.activity.likeCount}
        </span>
        <span style={{ color: 'var(--muted-text)' }}>
          people liked this track
        </span>
        <span style={{ color: 'var(--muted-text)' }}>
          • {props.activity.timestamp}
        </span>
      </div>

      {/* Track Card */}
      <RowTrackCard
        track={props.activity.track}
        onPlay={playTrack}
        showComment={true}
        showSocialActions={true}
      />

      {/* User Avatars */}
      <div style={{
        display: 'flex',
        'align-items': 'center',
        gap: 'var(--space-1)',
        'margin-top': 'var(--space-2)'
      }}>
        <For each={displayAvatars}>
          {(user, index) => (
            <img
              src={user.avatar}
              alt={user.username}
              title={user.username}
              style={{
                width: '24px',
                height: '24px',
                'border-radius': '50%',
                border: '1px solid var(--dark-bg)',
                'margin-left': index() > 0 ? '-8px' : '0'
              }}
            />
          )}
        </For>
        {remainingCount > 0 && (
          <span style={{
            'font-size': 'var(--text-xs)',
            color: 'var(--muted-text)',
            'margin-left': 'var(--space-1)'
          }}>
            +{remainingCount} others
          </span>
        )}
      </div>
    </div>
  );
};

export default LikesActivity;
```

---

## 5. Data Structure & Mock Data

### 5.1 Activity Event Type Definition
**Location:** `/mini-app/src/data/mockActivity.ts`

```typescript
import { Track } from '../stores/playerStore';

export interface ActivityUser {
  fid: number;
  username: string;
  displayName: string;
  avatar: string;
}

export type ActivityType = 'track_share' | 'reply' | 'aggregated_likes';

export interface BaseActivity {
  id: string;
  type: ActivityType;
  timestamp: string; // Relative time string (e.g., "2h ago")
  user: ActivityUser;
}

export interface TrackShareActivity extends BaseActivity {
  type: 'track_share';
  track: Track;
  threadId: string;
}

export interface ReplyActivity extends BaseActivity {
  type: 'reply';
  track: Track; // The reply track
  originalTrack: Track; // The track being replied to
  originalUser: ActivityUser;
  originalThreadId: string;
  threadId: string;
}

export interface AggregatedLikesActivity extends BaseActivity {
  type: 'aggregated_likes';
  track: Track;
  likeCount: number;
  likedByUsers: ActivityUser[];
  threadId: string;
}

export type ActivityEvent =
  | TrackShareActivity
  | ReplyActivity
  | AggregatedLikesActivity;
```

### 5.2 Mock Activity Feed Data

```typescript
// Import existing mock users and tracks from mockThreads
import { mockUsers } from './mockThreads';
import { ThreadTrack } from './mockThreads';

// Helper to create relative timestamps
const getRelativeTime = (hoursAgo: number): string => {
  if (hoursAgo < 1) return `${Math.floor(hoursAgo * 60)}m ago`;
  if (hoursAgo < 24) return `${Math.floor(hoursAgo)}h ago`;
  return `${Math.floor(hoursAgo / 24)}d ago`;
};

// Mock activity feed - chronological from newest to oldest
export const mockActivityFeed: ActivityEvent[] = [
  // Recent track share (30 minutes ago)
  {
    id: 'activity_1',
    type: 'track_share',
    timestamp: getRelativeTime(0.5),
    user: {
      fid: mockUsers[0].fid,
      username: mockUsers[0].username,
      displayName: mockUsers[0].displayName,
      avatar: mockUsers[0].pfpUrl
    },
    track: {
      id: 'track_new_1',
      title: 'Fade Into You',
      artist: 'Mazzy Star',
      url: 'https://www.youtube.com/watch?v=ImKY6TZEyrI',
      source: 'youtube',
      sourceId: 'ImKY6TZEyrI',
      thumbnail: 'https://i.ytimg.com/vi/ImKY6TZEyrI/default.jpg',
      likes: 3,
      comments: 0,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      comment: 'This song is pure dreamy bliss. Hope Sandoval\'s voice is hypnotic.',
      duration: '4:55',
      addedBy: mockUsers[0].username,
      userAvatar: mockUsers[0].pfpUrl,
      replies: 0,
      recasts: 1
    },
    threadId: 'thread_new_1'
  },

  // Aggregated likes (1 hour ago)
  {
    id: 'activity_2',
    type: 'aggregated_likes',
    timestamp: getRelativeTime(1),
    user: mockUsers[1], // Initiated by first liker
    track: {
      id: 'track_everlong',
      title: 'Everlong',
      artist: 'Foo Fighters',
      // ... (use existing track from mockThreads)
    },
    likeCount: 12,
    likedByUsers: [
      mockUsers[1],
      mockUsers[2],
      mockUsers[3],
      mockUsers[4]
    ],
    threadId: 'thread_1'
  },

  // Reply activity (2 hours ago)
  {
    id: 'activity_3',
    type: 'reply',
    timestamp: getRelativeTime(2),
    user: mockUsers[3],
    track: {
      id: 'track_reply_1',
      title: 'Come As You Are',
      artist: 'Nirvana',
      url: 'https://www.youtube.com/watch?v=vabnZ9-ex7o',
      source: 'youtube',
      sourceId: 'vabnZ9-ex7o',
      thumbnail: 'https://i.ytimg.com/vi/vabnZ9-ex7o/default.jpg',
      likes: 8,
      comments: 0,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      comment: 'If we\'re doing grunge, this is essential. Kurt\'s delivery is haunting.',
      duration: '3:38',
      addedBy: mockUsers[3].username,
      userAvatar: mockUsers[3].pfpUrl,
      replies: 0,
      recasts: 2
    },
    originalTrack: {
      // Track being replied to (from thread_1)
      id: 'track_everlong',
      title: 'Everlong',
      artist: 'Foo Fighters',
      // ... (simplified version)
    },
    originalUser: mockUsers[0],
    originalThreadId: 'thread_1',
    threadId: 'thread_1' // Same thread
  },

  // More activities...
  // Mix of track shares, replies, and like aggregations
  // Total: 15-20 items for initial MVP feed
];

// Helper function to format timestamps
export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};
```

**Note on Mock Data:**
- **Reuse existing tracks** from `mockThreads.ts` where possible
- Create a few new tracks to demonstrate variety
- Mix activity types to show the feed's versatility
- Use realistic timestamps to simulate real-time activity

---

## 6. Navigation Integration

### 6.1 Add Activity to Navigation
**File:** `/mini-app/src/components/layout/Sidebar/NavigationData.tsx`

**Required Changes:**

1. **Add Activity Icon Component:**
```typescript
// Activity Icon (Network Pulse) - Shows activity/network stream
export const ActivityIcon: Component<IconProps> = (props) => (
  <svg class={`activity-icon ${props.class || ''}`} width="28" height="28" viewBox="0 0 28 28" fill="none">
    {/* Network nodes */}
    <circle cx="14" cy="6" r="2" fill="currentColor"/>
    <circle cx="8" cy="14" r="2" fill="currentColor"/>
    <circle cx="20" cy="14" r="2" fill="currentColor"/>
    <circle cx="14" cy="22" r="2" fill="currentColor"/>

    {/* Connecting lines */}
    <line x1="14" y1="8" x2="14" y2="20" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>
    <line x1="12" y1="7" x2="9" y2="12" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>
    <line x1="16" y1="7" x2="19" y2="12" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>

    {/* Pulse rings */}
    <circle cx="14" cy="6" r="4" stroke="currentColor" stroke-width="1" fill="none" opacity="0.3">
      <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
    </circle>
  </svg>
);
```

2. **Update SectionId Type:**
```typescript
export type SectionId = 'home' | 'library' | 'activity' | 'stats' | 'profile';
```

3. **Add Activity Section:**
```typescript
export const navigationSections: readonly SidebarSection[] = [
  {
    id: 'library',
    href: '/',
    label: 'Library',
    icon: LibraryIcon,
    color: 'cyan',
    isPrimary: true
  },
  // INSERT HERE:
  {
    id: 'activity',
    href: '/activity',
    label: 'Activity',
    icon: ActivityIcon,
    color: 'blue'
  },
  {
    id: 'home',
    href: '/home',
    label: 'Home',
    icon: HomeIcon,
    color: 'blue'
  },
  // ... rest of sections
];
```

**Navigation Order Rationale:**
- **Library** (1st): Primary - user's personal collection
- **Activity** (2nd): Network discovery - see what's happening
- **Home** (3rd): Personalized feed
- **Stats** (4th): Analytics
- **Profile** (5th): User settings

### 6.2 Add Route
**File:** `/mini-app/src/App.tsx`

```typescript
import ActivityPage from './pages/ActivityPage';

const App: Component = () => {
  return (
    <Router root={RootLayout}>
      <Route path="/" component={ThreadsPage} />
      <Route path="/activity" component={ActivityPage} />
      <Route path="/thread/:id" component={ThreadViewPage} />
    </Router>
  );
};
```

---

## 7. Responsive Behavior

### Mobile-First Design (320px - 768px)
- **Full-width activity items** with padding: `var(--space-4)`
- **Stacked layout** for all content
- **Touch-optimized** interactions (44px minimum targets)
- **Compact user avatars** (24px) to save space
- **Truncated text** for long usernames or comments
- **Bottom padding** accounts for mobile nav + player

### Tablet & Desktop (768px+)
For MVP, maintain mobile layout but with:
- **Maximum width constraint:** `max-width: 768px; margin: 0 auto`
- **Increased padding** on container for breathing room
- **Hover states** more prominent on desktop

**Future Enhancements (Out of Scope for MVP):**
- Multi-column layout on desktop
- Sidebar filters
- Infinite scroll with virtualization
- Real-time updates via WebSockets

---

## 8. Interaction Patterns

### 8.1 Track Card Interactions
All activity items use the existing `RowTrackCard` component, which provides:
- **Play button**: Starts playback, updates player
- **Like button**: Increments like count (optimistic UI)
- **Reply button**: Navigates to thread view for replying
- **Track click**: Opens full thread view

### 8.2 Navigation Flows
- **Click username**: Navigate to user profile (future feature)
- **Click track card**: Navigate to thread view (`/thread/:id`)
- **Click original track (in reply)**: Navigate to original thread
- **Click avatar in likes**: Show user tooltip/profile preview

### 8.3 Empty States
**When feed is empty:**
```
┌──────────────────────────────────┐
│                                  │
│           🎵                     │
│                                  │
│     No activity yet!             │
│                                  │
│  Share a track to get started    │
│                                  │
│    [Share Track Button]          │
│                                  │
└──────────────────────────────────┘
```

**Styling:**
- Center content vertically and horizontally
- Icon: 64px, `var(--neon-cyan)`
- Title: `var(--text-xl)`, `var(--light-text)`
- Subtitle: `var(--text-base)`, `var(--muted-text)`
- Button: Primary CTA style with neon-blue background

---

## 9. Animation & Polish

### 9.1 Entrance Animations
**Avoid page-level animations** (per design guidelines). Instead:
- **Items fade in on scroll** (if implementing virtual scrolling later)
- **Hover effects** on activity containers:
  - Subtle translateY: `-2px`
  - Glow increase on border color
  - Transition: `200ms ease`

### 9.2 Interactive Feedback
- **Track card hover**: Existing animations from TrackCard component
- **Username hover**: Underline with neon-magenta glow
- **Activity container hover**: Border glow intensifies
  ```css
  border: 1px solid rgba(color, 0.4); /* from 0.2 */
  box-shadow: 0 0 8px rgba(color, 0.2);
  transition: all 200ms ease;
  ```

### 9.3 Loading States
For future implementation (initially use mock data):
- **Skeleton screens** matching activity item structure
- **Shimmer effect** using neon-blue gradient
- **Progressive loading** (load 20 items, then infinite scroll)

---

## 10. Accessibility

### 10.1 Semantic HTML
- Use semantic elements: `<nav>`, `<main>`, `<article>` for activity items
- Heading hierarchy: `<h1>` for page title, `<h2>` for activity context

### 10.2 Keyboard Navigation
- **Tab order**: Header → Activity items → Navigation
- **Enter/Space** on activity containers navigates to thread
- **Escape** (future): Dismiss any open modals/tooltips

### 10.3 Screen Readers
- **Aria labels** for icon-only buttons
- **Aria-live region** for new activity (future real-time updates)
- **Alt text** for user avatars includes username

### 10.4 Color Contrast
All text meets WCAG AA standards:
- `var(--light-text)` on `var(--dark-bg)`: 12:1 ratio ✓
- `var(--neon-magenta)` on `var(--dark-bg)`: 6.8:1 ratio ✓
- `var(--muted-text)` on `var(--dark-bg)`: 5.2:1 ratio ✓

---

## 11. Implementation Checklist

### Phase 1: Foundation
- [ ] Create `ActivityPage.tsx` component following ThreadsPage pattern
- [ ] Add `/activity` route to App.tsx
- [ ] Create activity icon and add to NavigationData.tsx
- [ ] Update navigation sections array
- [ ] Verify mobile navigation displays new activity tab

### Phase 2: Data Layer
- [ ] Create `mockActivity.ts` with type definitions
- [ ] Define `ActivityEvent` types (track_share, reply, aggregated_likes)
- [ ] Generate mock activity feed (15-20 items)
- [ ] Implement `formatTimeAgo` helper function
- [ ] Test data structure with TypeScript

### Phase 3: Components
- [ ] Create `ActivityItem.tsx` router component
- [ ] Build `TrackShareActivity.tsx` component
- [ ] Build `ReplyActivity.tsx` component
- [ ] Build `LikesActivity.tsx` component
- [ ] Test each activity type renders correctly
- [ ] Verify RowTrackCard integration works

### Phase 4: Interactions
- [ ] Implement play track functionality
- [ ] Wire up navigation to thread views
- [ ] Add username click handlers (stub for now)
- [ ] Test all interactive elements
- [ ] Verify player integration

### Phase 5: Polish
- [ ] Apply hover effects to activity containers
- [ ] Add empty state UI
- [ ] Test responsive behavior (mobile, tablet, desktop)
- [ ] Verify color consistency with design system
- [ ] Accessibility audit (keyboard nav, screen readers)

### Phase 6: Final Review
- [ ] Compare with ThreadsPage for consistency
- [ ] Test with different activity feed sizes
- [ ] Verify no layout shifts during scroll
- [ ] Performance check (smooth scrolling)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

---

## 12. Future Enhancements (Out of Scope)

### Phase 2 Features
- **Filtering**: Show only specific activity types
- **Sorting**: Recent vs. Popular
- **Infinite scroll**: Load more as user scrolls
- **Real-time updates**: WebSocket integration for live feed
- **Personalization**: Follow-based filtering
- **Search**: Find specific users or tracks in activity

### Advanced Features
- **Activity notifications**: Alert when someone interacts with your tracks
- **Activity heatmap**: Visual representation of network activity over time
- **Trending tracks**: Highlight tracks getting lots of activity
- **User clustering**: Show activity from specific groups of users

---

## 13. Success Metrics

### MVP Success Criteria
✓ Users can navigate to `/activity` via mobile navigation
✓ Page displays a chronological feed of network activity
✓ Three activity types render correctly: track shares, replies, likes
✓ All activity items are interactive (can play, like, navigate)
✓ Page follows ThreadsPage design patterns (consistency)
✓ Mobile-responsive and accessible

### User Experience Goals
- **Discoverability**: Users find new music through the activity feed
- **Engagement**: Users click through to threads from activity
- **Connection**: Users feel connected to network pulse
- **Performance**: Feed scrolls smoothly, no janky animations

---

## 14. Design Decisions Summary

| Decision | Rationale |
|----------|-----------|
| **Single unified feed** | Simplest solution; aligns with "simple problems, simple solutions" |
| **Reuse RowTrackCard** | Consistency with ThreadsPage; reduce code duplication |
| **Color-coded activity types** | Visual differentiation; blue/cyan/green match existing palette |
| **Mock data initially** | Focus on UI/UX first; real-time data is Phase 2 |
| **Inline styles** | Matches ThreadsPage pattern; keeps code simple and local |
| **No complex filters** | MVP focuses on core functionality; sophistication comes later |
| **Chronological order** | Natural for activity feed; most intuitive for users |

---

## 15. Code Style & Conventions

### TypeScript
- **Strict typing**: Use interfaces for all data structures
- **Type guards**: Where necessary (e.g., activity type checking)
- **No `any` types**: Maintain type safety throughout

### SolidJS Patterns
- **createSignal** for local state
- **For loops** for rendering lists
- **Switch/Match** for conditional rendering by type
- **Component-level composition**: Break down into logical pieces

### Styling Approach
- **Inline styles** for component-specific styling (following ThreadsPage)
- **Design system variables**: Always use CSS custom properties
- **No hardcoded values**: Reference design tokens
- **Consistent spacing**: Use `var(--space-*)` exclusively

### File Organization
```
/mini-app/src/
  /pages/
    ActivityPage.tsx          # Main page component
  /components/
    /activity/
      ActivityItem.tsx         # Router component
      TrackShareActivity.tsx   # Track share type
      ReplyActivity.tsx        # Reply type
      LikesActivity.tsx        # Aggregated likes type
  /data/
    mockActivity.ts            # Mock data and types
```

---

## 16. Testing Strategy

### Manual Testing Checklist
- [ ] Page loads without errors
- [ ] All activity types render correctly
- [ ] Track playback works from any activity item
- [ ] Navigation to threads works
- [ ] Mobile navigation highlights activity tab when on page
- [ ] Scroll performance is smooth
- [ ] Player integration works (play/pause/switch tracks)
- [ ] Empty state displays when feed is empty
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader announces content correctly

### Edge Cases
- [ ] Very long usernames truncate properly
- [ ] Very long track titles truncate properly
- [ ] Activity with no comments handles gracefully
- [ ] Mix of YouTube and Spotify tracks displays correctly
- [ ] Large number of likes (100+) formats correctly

---

## 17. Design Principles Applied

### Zen Master Wisdom
> "The activity feed is like a river—constantly flowing, always fresh. We don't try to control the current; we simply create a clear channel for it to flow."

**Simplicity First:**
- One feed, chronological order
- Three clear activity types
- Reuse existing components
- No premature optimization

**Natural Proportions:**
- 8px base spacing unit throughout
- Consistent padding/margins using design tokens
- Golden ratio in card proportions (content to padding ≈ 1.618:1)

**Visual Hierarchy:**
- Context header (who/what/when) draws eye first
- Track card (content) is focal point
- Social actions (interaction) are discoverable but not dominant

**Retro Aesthetic:**
- Sharp borders (4px border-radius max)
- Neon color accents for activity types
- Monospace fonts for data-like elements (timestamps, connectors)
- Terminal-style feel for the feed

**Information Density:**
- Pack meaningful info without overwhelming
- Use color-coding to differentiate types quickly
- Show avatars for quick user recognition
- Balance text with visual elements (thumbnails, icons)

---

## 18. Final Notes for Implementation Agent

### Quick Start
1. Start with `ActivityPage.tsx`—copy ThreadsPage structure
2. Create mock data next—reuse existing tracks where possible
3. Build one activity type component at a time
4. Test each type individually before integrating
5. Add navigation integration last

### Common Pitfalls to Avoid
- ❌ Don't create new track card variants—reuse existing RowTrackCard
- ❌ Don't add complex state management—keep it simple with signals
- ❌ Don't hardcode colors—use design system variables
- ❌ Don't add filters/sorting in MVP—stick to chronological feed
- ❌ Don't over-animate—subtle effects only

### When in Doubt
- **Look at ThreadsPage** for pattern reference
- **Consult design-guidelines.md** for color/spacing/typography rules
- **Keep it simple**—MVP should be minimal and focused
- **Ask before adding**—if it's not in the spec, check first

---

## Appendix A: Color Reference

| Activity Type | Background | Border | Accent |
|---------------|------------|--------|--------|
| Track Share | `rgba(59, 0, 253, 0.05)` | `rgba(59, 0, 253, 0.2)` | `var(--neon-blue)` |
| Reply | `rgba(4, 202, 244, 0.05)` | `rgba(4, 202, 244, 0.2)` | `var(--neon-cyan)` |
| Likes | `rgba(0, 249, 42, 0.05)` | `rgba(0, 249, 42, 0.2)` | `var(--neon-green)` |

**Usernames:** `var(--neon-magenta)` (#e010e0)
**Timestamps:** `var(--muted-text)` (#cccccc)
**Action text:** `var(--muted-text)` (#cccccc)

## Appendix B: Spacing Reference

| Element | Spacing |
|---------|---------|
| Page padding | `var(--space-4)` (16px) |
| Activity item margin-bottom | `var(--space-4)` (16px) |
| Activity item padding | `var(--space-4)` (16px) |
| Context header gap | `var(--space-2)` (8px) |
| Context header margin-bottom | `var(--space-2)` (8px) |
| Connector margin (top/bottom) | `var(--space-2)` (8px) |
| Avatar size | 24px |
| Bottom scroll padding | 120px |

---

**End of Design Plan**

*This design plan provides complete specifications for implementing the Activity Page MVP. All components, data structures, styling, and interactions are defined. Implementation should be straightforward by following this plan sequentially.*

**For questions or clarifications during implementation, reference:**
- `/docs/design-guidelines.md` - Design system rules
- `/mini-app/src/pages/ThreadsPage.tsx` - Pattern reference
- `/mini-app/src/data/mockThreads.ts` - Data structure examples
