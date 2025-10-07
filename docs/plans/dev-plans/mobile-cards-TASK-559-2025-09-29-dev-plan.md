# Mobile Cards Enhancement - TASK-559 Development Plan

**Date:** 2025-09-29
**Task:** TASK-559 - Mobile Cards Enhancement
**Branch:** mobile-cards-TASK-559
**Objective:** Enhance mobile-first card display for music tracks across the Jamzy application

---

## Executive Summary

This task focuses on creating a cohesive, mobile-optimized card-based layout system for displaying music tracks throughout the Jamzy application. The current implementation has mixed patterns - the LibraryTableRow component already has a mobile card layout, but other areas like HomePage sections use inconsistent card patterns. This plan unifies the mobile experience with consistent, reusable card components that follow Jamzy's retro-cyberpunk design language.

## Context Analysis

### Current State

**Existing Mobile Implementations:**
1. **LibraryTableRow Component** (`frontend/src/components/library/LibraryTableRow.tsx`)
   - Has a well-implemented mobile card layout (lines 207-313)
   - Shows track thumbnail, title, artist, user, timestamp, platform badge, tags
   - Includes social actions (likes, replies) with proper animations
   - Uses expandable text for comments
   - Responsive design with proper border styling and neon color accents

2. **HomePage Components** (`frontend/src/components/home/`)
   - NewTracksSection uses basic card grid layout (lines 56-91)
   - Other sections (RecentlyPlayed, TopConnections, FavoriteNetworks) likely have similar patterns
   - Cards are simpler, focusing on visual discovery rather than detailed metadata

3. **Design System** (from `docs/design-guidelines.md`)
   - Retro-cyberpunk aesthetic with neon color palette
   - Mobile-first approach with 44px minimum touch targets
   - 8px spacing system with CSS custom properties
   - Emphasis on information density with visual engagement

### Key Architectural Patterns

**Component Organization:**
- Feature-based directory structure (`components/library/`, `components/home/`, etc.)
- Shared/reusable components in `components/common/` and `components/ui/`
- Mobile responsiveness handled through CSS media queries and conditional rendering

**State Management:**
- SolidJS signals and stores for reactive state
- PlayerStore for track playback state
- AuthStore for user authentication
- ThreadStore for conversation threading

**Styling Approach:**
- CSS modules with co-located stylesheets
- Design tokens via CSS custom properties
- anime.js v3.2.1 for animations
- Mobile-first media queries

---

## Problem Statement

The mobile user experience for browsing and interacting with music tracks lacks consistency across different pages and contexts. While the LibraryTableRow has a solid mobile card implementation, other areas use disparate patterns. We need to:

1. **Unify Mobile Card Patterns:** Create a consistent mobile card component that can be used across all track display contexts
2. **Optimize Information Hierarchy:** Ensure cards display the right information at the right size for mobile viewports
3. **Enhance Touch Interactions:** Provide fluid, delightful touch interactions that feel native on mobile devices
4. **Maintain Design Language:** Follow Jamzy's retro-cyberpunk aesthetic with neon accents and terminal-inspired elements

---

## Technical Requirements

### Core Functionality
- Display track metadata (title, artist, album, duration, platform)
- Show user context (who shared/liked, when, social stats)
- Provide quick actions (play, like, reply, share)
- Support different card variants (compact, detailed, grid, list)
- Handle expandable content (comments, descriptions)
- Integrate with player and social stores

### Design Requirements
- Follow 8px spacing system
- Use neon color palette (cyan, green, pink, magenta)
- Maintain 44px minimum touch targets
- Support dark theme with proper contrast (4.5:1 minimum)
- Include micro-animations for state changes
- Display platform badges with proper iconography

### Performance Requirements
- Lazy load images with proper fallbacks
- Hardware-accelerated animations
- Efficient re-renders with SolidJS
- < 100ms response time for interactions

---

## Implementation Plan

### Phase 1: Component Architecture

#### 1.1 Create BaseTrackCard Component

**File:** `/Users/nmadd/Dropbox/code/vibes/mobile-cards-TASK-559/frontend/src/components/common/TrackCard/BaseTrackCard.tsx`

**Purpose:** Core reusable track card component with variant support

**Props Interface:**
```typescript
interface BaseTrackCardProps {
  track: Track | PersonalTrack;
  variant?: 'compact' | 'detailed' | 'grid' | 'list';
  showSocialActions?: boolean;
  showUserContext?: boolean;
  showExpandableComment?: boolean;
  onPlay?: (track: Track) => void;
  onLike?: (track: Track) => void;
  onReply?: (track: Track) => void;
  className?: string;
}
```

**Key Features:**
- Variant-based layout switching (compact for grids, detailed for feeds)
- Optional social action buttons with animation support
- Expandable text integration for comments
- Platform badge display with proper icons
- Touch-optimized interaction areas
- Current track highlighting integration

**Layout Variants:**

1. **Compact Variant** (for grid views, home page sections)
   - Square thumbnail (104px x 104px on mobile)
   - Title + artist stacked below thumbnail
   - Platform badge overlay on thumbnail
   - Play button overlay on hover/tap
   - Minimal metadata

2. **Detailed Variant** (for feed views, discovery)
   - Horizontal layout with thumbnail left (64px x 64px)
   - Title, artist, user context stacked right
   - Social stats (likes, replies) inline
   - Expandable comment text
   - Platform and timestamp badges
   - Full touch area for entire card

3. **Grid Variant** (for browse sections)
   - Similar to compact but with hover effects
   - "NEW" badge for recently added tracks
   - Source indicator (from network, from friend, etc.)

4. **List Variant** (mobile version of table rows)
   - Full-width card with all metadata
   - Social actions prominently displayed
   - Tags/genres visible
   - Optimized for vertical scrolling

#### 1.2 Create Supporting Components

**TrackThumbnail Component**
- File: `frontend/src/components/common/TrackCard/TrackThumbnail.tsx`
- Handles image loading with fallback
- Play button overlay
- Platform badge overlay
- Lazy loading support

**TrackMetadata Component**
- File: `frontend/src/components/common/TrackCard/TrackMetadata.tsx`
- Title, artist, album display
- Truncation with tooltips
- Link to artist/album pages
- Responsive text sizing

**TrackSocialActions Component**
- File: `frontend/src/components/common/TrackCard/TrackSocialActions.tsx`
- Like button with animation
- Reply button with count
- Share button (optional)
- Recast button (optional)
- Integration with socialButtonClick, heartBeat, particleBurst animations

**PlatformBadge Component**
- File: `frontend/src/components/common/TrackCard/PlatformBadge.tsx`
- Platform-specific icons (YouTube, Spotify, SoundCloud, Bandcamp)
- Color-coded backgrounds matching platform branding
- Compact and full variants

#### 1.3 Component File Structure

```
frontend/src/components/common/TrackCard/
├── BaseTrackCard.tsx          # Main component
├── TrackCardVariants.tsx      # Layout variants
├── TrackThumbnail.tsx         # Thumbnail with overlays
├── TrackMetadata.tsx          # Title, artist, metadata
├── TrackSocialActions.tsx     # Social interaction buttons
├── PlatformBadge.tsx          # Platform indicator
├── trackCard.css              # Component styles
├── trackCardVariants.css      # Variant-specific styles
└── index.ts                   # Exports
```

### Phase 2: Styling Implementation

#### 2.1 Create Base Card Styles

**File:** `frontend/src/components/common/TrackCard/trackCard.css`

**Key Style Elements:**
- Card container with border and background
- Hover/focus states with neon glow
- Touch feedback animations
- Responsive spacing using CSS custom properties
- Current track highlighting

**CSS Structure:**
```css
/* Base card container */
.track-card {
  position: relative;
  border-radius: 8px;
  transition: all 200ms ease;
  cursor: pointer;
  /* Use design system tokens */
  padding: var(--space-3);
  background: var(--darker-bg);
  border: 1px solid rgba(4, 202, 244, 0.3);
}

.track-card:hover {
  border-color: rgba(4, 202, 244, 0.6);
  background: rgba(4, 202, 244, 0.05);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(4, 202, 244, 0.2);
}

.track-card.current-track {
  border-color: rgba(0, 249, 42, 0.6);
  background: rgba(0, 249, 42, 0.08);
  box-shadow: 0 0 16px rgba(0, 249, 42, 0.3);
}

/* Touch feedback for mobile */
.track-card:active {
  transform: scale(0.98);
  transition: transform 100ms ease;
}
```

#### 2.2 Variant-Specific Styles

**File:** `frontend/src/components/common/TrackCard/trackCardVariants.css`

Define styles for each variant:
- `.track-card--compact`: Grid layout for home sections
- `.track-card--detailed`: Horizontal layout for feeds
- `.track-card--grid`: Browse section layout
- `.track-card--list`: Mobile table replacement

#### 2.3 Mobile Responsive Breakpoints

Use existing design system breakpoints:
- Mobile base: 375px - 640px
- Large mobile: 480px - 640px
- Tablet: 640px - 1024px
- Desktop: 1024px+

**Mobile Optimizations:**
```css
@media (max-width: 640px) {
  .track-card--compact {
    width: 140px;
    min-height: 180px;
  }

  .track-card--detailed {
    width: 100%;
    min-height: 120px;
  }

  /* Ensure touch targets meet 44px minimum */
  .track-social-actions button {
    min-width: 44px;
    min-height: 44px;
    padding: var(--space-2);
  }
}
```

### Phase 3: Integration

#### 3.1 Refactor LibraryTableRow

**File:** `frontend/src/components/library/LibraryTableRow.tsx`

**Changes:**
1. Extract mobile card logic (lines 207-313) into BaseTrackCard usage
2. Keep desktop table layout as-is
3. Use `track-card--list` variant for mobile
4. Maintain all existing functionality (social actions, expandable text, etc.)

**Implementation:**
```typescript
// Mobile Card Layout
if (props.isMobile) {
  return (
    <BaseTrackCard
      track={props.track}
      variant="list"
      showSocialActions={true}
      showUserContext={true}
      showExpandableComment={true}
      onPlay={handlePlayTrack}
      onLike={handleLikeClick}
      onReply={handleChatClick}
    />
  );
}
```

#### 3.2 Update HomePage Sections

**Files to Update:**
- `frontend/src/components/home/components/NewTracksSection.tsx`
- `frontend/src/components/home/components/RecentlyPlayedSection.tsx`
- `frontend/src/components/home/components/FavoriteNetworksSection.tsx` (if applicable)

**Changes:**
1. Replace existing card implementation with BaseTrackCard
2. Use `grid` or `compact` variant depending on section
3. Maintain section-specific styling (neon green for new tracks, etc.)
4. Keep existing skeleton loading states

**Example for NewTracksSection:**
```typescript
<BaseTrackCard
  track={track}
  variant="grid"
  showSocialActions={false}
  showUserContext={false}
  onPlay={handleTrackClick}
  className="new-track-theme"
/>
```

#### 3.3 Create Mobile-Specific Views

**Potential New Components:**
- MobileTrackList: Vertical scrolling list of detailed cards
- MobileTrackGrid: Responsive grid of compact cards
- MobilePlaylistView: Optimized playlist display

### Phase 4: Animation & Interaction

#### 4.1 Integrate Existing Animations

**Reference:** `frontend/src/utils/animations.ts`

**Animations to Use:**
- `heartBeat`: For like button interactions
- `particleBurst`: For successful actions
- `socialButtonClick`: For generic social interactions
- Custom card entrance animations (optional)

**Implementation:**
```typescript
const handleLikeClick = (e: Event) => {
  e.stopPropagation();
  if (likeButtonRef) {
    if (isLiked()) {
      socialButtonClick(likeButtonRef);
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      heartBeat(likeButtonRef);
      particleBurst(likeButtonRef);
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
    }
  }
};
```

#### 4.2 Touch Gesture Support

**Considerations:**
- Tap: Play track or navigate to detail view
- Long press: Show context menu (future enhancement)
- Swipe: Navigate between tracks or dismiss (future enhancement)
- Pinch: Zoom (not typically needed for cards)

**Initial Implementation:**
- Focus on tap interactions
- Ensure proper touch feedback (visual state change)
- Avoid gesture conflicts with scrolling

### Phase 5: Performance Optimization

#### 5.1 Image Optimization

**Techniques:**
- Lazy loading with Intersection Observer
- Responsive image sizes using srcset
- WebP format with fallbacks
- Blur-up placeholder technique

**Implementation:**
```typescript
<img
  src={track.thumbnail}
  srcset={`${track.thumbnail}?w=104 104w, ${track.thumbnail}?w=208 208w`}
  sizes="(max-width: 640px) 104px, 128px"
  loading="lazy"
  alt={`${track.title} cover art`}
/>
```

#### 5.2 Virtual Scrolling

**When to Use:**
- Lists with > 100 items
- Infinite scroll scenarios
- Memory-constrained devices

**Library Recommendation:**
- `@solid-primitives/virtual` for SolidJS
- Implement for LibraryPage if needed

#### 5.3 Memoization

**Strategy:**
- Use `createMemo()` for expensive computations
- Memoize card rendering when props haven't changed
- Optimize social stats calculations

### Phase 6: Testing & Refinement

#### 6.1 Manual Testing Checklist

**Devices:**
- [ ] iPhone SE (375px width)
- [ ] iPhone 12/13/14 (390px width)
- [ ] iPhone 12/13/14 Pro Max (428px width)
- [ ] iPad Mini (768px width)
- [ ] Android phones (360px-414px width)

**Scenarios:**
- [ ] Vertical scrolling performance (60fps target)
- [ ] Touch target sizes (44px minimum)
- [ ] Text readability (contrast ratios)
- [ ] Image loading states
- [ ] Social action animations
- [ ] Current track highlighting
- [ ] Platform badge visibility
- [ ] Expandable text behavior

#### 6.2 Accessibility Testing

**ARIA Labels:**
- Ensure all interactive elements have proper labels
- Card should describe track and context
- Buttons should describe their action

**Keyboard Navigation:**
- Tab order should be logical
- Enter/Space should trigger primary action
- Escape should close expandables

**Screen Reader:**
- Test with VoiceOver (iOS) / TalkBack (Android)
- Ensure semantic HTML structure
- Provide meaningful text alternatives

#### 6.3 Performance Metrics

**Targets:**
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

**Tools:**
- Chrome DevTools Performance tab
- Lighthouse mobile audit
- WebPageTest on real devices

---

## Implementation Sequence

### Step 1: Foundation (Day 1-2)
1. Create component directory structure
2. Implement BaseTrackCard with basic variants
3. Create supporting components (Thumbnail, Metadata, etc.)
4. Write base CSS with mobile-first approach

### Step 2: Integration (Day 2-3)
1. Refactor LibraryTableRow to use BaseTrackCard
2. Update NewTracksSection
3. Update other HomePage sections
4. Test across different viewport sizes

### Step 3: Polish (Day 3-4)
1. Integrate animations
2. Optimize image loading
3. Fine-tune spacing and typography
4. Add touch feedback
5. Implement accessibility features

### Step 4: Testing (Day 4-5)
1. Manual device testing
2. Performance profiling
3. Accessibility audit
4. Cross-browser testing
5. Bug fixes and refinements

---

## Code Examples

### BaseTrackCard Component Structure

```typescript
import { Component, Show, createSignal } from 'solid-js';
import { Track, PersonalTrack } from '../../types/track';
import TrackThumbnail from './TrackThumbnail';
import TrackMetadata from './TrackMetadata';
import TrackSocialActions from './TrackSocialActions';
import PlatformBadge from './PlatformBadge';
import ExpandableText from '../ui/ExpandableText';
import { isCurrentTrack, isTrackPlaying } from '../../stores/playerStore';
import './trackCard.css';
import './trackCardVariants.css';

interface BaseTrackCardProps {
  track: Track | PersonalTrack;
  variant?: 'compact' | 'detailed' | 'grid' | 'list';
  showSocialActions?: boolean;
  showUserContext?: boolean;
  showExpandableComment?: boolean;
  onPlay?: (track: Track) => void;
  onLike?: (track: Track) => void;
  onReply?: (track: Track) => void;
  className?: string;
}

const BaseTrackCard: Component<BaseTrackCardProps> = (props) => {
  const variant = () => props.variant || 'detailed';
  const [isHovered, setIsHovered] = createSignal(false);

  const handleCardClick = () => {
    if (props.onPlay) {
      props.onPlay(props.track);
    }
  };

  const cardClasses = () => {
    const classes = [
      'track-card',
      `track-card--${variant()}`,
      props.className
    ];

    if (isCurrentTrack(props.track.id)) {
      classes.push('track-card--current');
    }

    if (isHovered()) {
      classes.push('track-card--hovered');
    }

    return classes.filter(Boolean).join(' ');
  };

  return (
    <div
      class={cardClasses()}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`${props.track.title} by ${props.track.artist}`}
    >
      {/* Render different layouts based on variant */}
      <Show when={variant() === 'compact' || variant() === 'grid'}>
        <CompactLayout {...props} />
      </Show>

      <Show when={variant() === 'detailed'}>
        <DetailedLayout {...props} />
      </Show>

      <Show when={variant() === 'list'}>
        <ListLayout {...props} />
      </Show>
    </div>
  );
};

export default BaseTrackCard;
```

### Compact Layout Example

```typescript
const CompactLayout: Component<BaseTrackCardProps> = (props) => {
  return (
    <div class="track-card-compact-layout">
      <TrackThumbnail
        src={props.track.thumbnail}
        alt={`${props.track.title} cover`}
        size="large"
        showPlayButton={true}
        onPlay={() => props.onPlay?.(props.track)}
      >
        <PlatformBadge source={props.track.source} variant="overlay" />
      </TrackThumbnail>

      <div class="track-card-info">
        <TrackMetadata
          title={props.track.title}
          artist={props.track.artist}
          layout="stacked"
        />

        <Show when={props.showSocialActions}>
          <TrackSocialActions
            track={props.track}
            onLike={props.onLike}
            onReply={props.onReply}
            compact={true}
          />
        </Show>
      </div>
    </div>
  );
};
```

---

## File Manifest

### New Files to Create

1. **Component Files:**
   - `/frontend/src/components/common/TrackCard/BaseTrackCard.tsx`
   - `/frontend/src/components/common/TrackCard/TrackCardVariants.tsx`
   - `/frontend/src/components/common/TrackCard/TrackThumbnail.tsx`
   - `/frontend/src/components/common/TrackCard/TrackMetadata.tsx`
   - `/frontend/src/components/common/TrackCard/TrackSocialActions.tsx`
   - `/frontend/src/components/common/TrackCard/PlatformBadge.tsx`
   - `/frontend/src/components/common/TrackCard/index.ts`

2. **Style Files:**
   - `/frontend/src/components/common/TrackCard/trackCard.css`
   - `/frontend/src/components/common/TrackCard/trackCardVariants.css`

3. **Type Definitions** (if needed):
   - `/frontend/src/types/trackCard.ts`

### Files to Modify

1. **Component Updates:**
   - `/frontend/src/components/library/LibraryTableRow.tsx` - Use BaseTrackCard for mobile
   - `/frontend/src/components/home/components/NewTracksSection.tsx` - Replace card implementation
   - `/frontend/src/components/home/components/RecentlyPlayedSection.tsx` - Use BaseTrackCard
   - `/frontend/src/components/home/components/TopConnectionsSection.tsx` - If applicable

2. **Style Updates:**
   - `/frontend/src/components/home/HomePage.css` - Update mobile card queries if needed
   - `/frontend/src/components/library/retro-table.css` - Ensure compatibility

3. **Type Definitions:**
   - `/frontend/src/stores/playerStore.ts` - Verify Track interface
   - `/shared/types.ts` - Update shared types if needed

---

## Design Decisions & Rationale

### Component Composition Strategy

**Decision:** Create a single BaseTrackCard component with variant support rather than separate components for each context.

**Rationale:**
- Reduces code duplication
- Ensures consistency across the application
- Makes it easier to maintain and update
- Follows DRY (Don't Repeat Yourself) principle
- Allows for flexible composition through props

**Trade-offs:**
- Component might become complex with many variants
- Props interface could grow large
- Performance overhead of variant switching (minimal with SolidJS)

**Mitigation:**
- Use variant-specific sub-components (CompactLayout, DetailedLayout, etc.)
- Keep variant logic separate from base component
- Document each variant clearly

### Mobile-First Approach

**Decision:** Design and implement mobile layouts first, then enhance for larger screens.

**Rationale:**
- Aligns with Jamzy's mobile-first philosophy
- Forces prioritization of essential information
- Progressive enhancement is easier than graceful degradation
- Most users will access on mobile devices
- Simplifies responsive CSS (mobile base, then media queries for larger screens)

### Animation Performance

**Decision:** Use anime.js v3.2.1 with hardware-accelerated properties (transform, opacity) only.

**Rationale:**
- anime.js already integrated into project
- Hardware acceleration ensures 60fps on mobile
- Existing animation utilities can be reused
- CSS transforms are more performant than layout properties
- Avoids janky animations on lower-end devices

### State Management

**Decision:** Leverage existing SolidJS stores (playerStore, authStore) rather than component-local state where possible.

**Rationale:**
- Maintains single source of truth
- Enables cross-component synchronization (e.g., current track highlighting)
- Follows existing architecture patterns
- Better testability
- Enables future features (e.g., play history tracking)

---

## Edge Cases & Error Handling

### Missing Track Data

**Scenario:** Track missing thumbnail, title, or artist

**Handling:**
- Provide fallback thumbnail (platform logo or generic music icon)
- Display "Unknown Artist" / "Unknown Title" placeholders
- Prevent layout shift with fixed dimensions
- Log warning for debugging

### Image Loading Failures

**Scenario:** Thumbnail fails to load (404, CORS, network error)

**Handling:**
- Use `onerror` handler to swap to fallback image
- Show skeleton loader during initial load
- Cache fallback state to prevent repeated load attempts
- Provide retry mechanism on user interaction

### Social Action Failures

**Scenario:** Like/reply action fails (network error, auth issue)

**Handling:**
- Show error toast notification
- Revert optimistic UI update
- Provide retry button
- Log error for analytics

### Performance Degradation

**Scenario:** Too many cards rendering at once, causing frame drops

**Handling:**
- Implement virtual scrolling for long lists (>100 items)
- Use Intersection Observer for lazy rendering
- Debounce expensive operations (search, filter)
- Consider pagination for very large datasets

### Accessibility Edge Cases

**Scenario:** Screen reader user navigating card grid

**Handling:**
- Provide clear ARIA labels for each card
- Use semantic HTML (`<article>` for cards)
- Ensure keyboard navigation is logical
- Announce dynamic content changes (like counts, etc.)

---

## Testing Strategy

### Unit Tests

**Components to Test:**
- BaseTrackCard: Variant rendering, prop handling
- TrackThumbnail: Image loading, fallbacks, play button
- TrackMetadata: Text truncation, tooltips
- TrackSocialActions: Click handlers, state updates
- PlatformBadge: Icon/color mapping

**Test Framework:**
- Vitest (fast, Vite-compatible)
- @solidjs/testing-library
- Mock data factories for tracks

### Integration Tests

**Scenarios:**
- Card interaction updates playerStore
- Social actions update like/reply counts
- Current track highlighting syncs with playerStore
- Mobile/desktop layout switching

### Visual Regression Tests

**Tools:**
- Percy.io or Chromatic
- Capture screenshots of each variant
- Compare against baseline
- Test across viewport sizes

### Performance Tests

**Metrics:**
- Render time for 100 cards
- Scroll performance (fps)
- Memory usage over time
- Animation frame rate

---

## Migration Strategy

### Gradual Rollout

**Phase 1:** LibraryTableRow mobile view
- Lowest risk (mobile-only change)
- Already has well-defined layout
- Can test in isolation

**Phase 2:** HomePage sections
- Higher visibility
- Multiple sections to update
- Coordinated deployment

**Phase 3:** Other contexts
- Profile pages
- Discovery feeds
- Search results

### Feature Flags

**Recommendation:** Use feature flag for BaseTrackCard adoption

**Benefits:**
- A/B test new vs. old cards
- Quick rollback if issues arise
- Gradual user migration
- Collect performance metrics

**Implementation:**
```typescript
// In config or store
const useNewTrackCards = () => {
  return import.meta.env.VITE_USE_NEW_TRACK_CARDS === 'true';
};

// In component
<Show when={useNewTrackCards()} fallback={<OldCardImplementation />}>
  <BaseTrackCard {...props} />
</Show>
```

### Data Migration

**Not Applicable:** No data structure changes required. All existing track data is compatible.

---

## Success Metrics

### User Experience Metrics

- **Engagement:** Track clicks on mobile cards (target: +20% from baseline)
- **Time on Page:** Increased browsing time (target: +15%)
- **Bounce Rate:** Reduced bounce rate on mobile (target: -10%)
- **Social Interactions:** More likes/replies on mobile (target: +25%)

### Performance Metrics

- **Load Time:** First Contentful Paint < 1.5s on 4G
- **Scroll Performance:** Maintain 60fps during scrolling
- **Memory Usage:** < 50MB increase with 100 cards rendered
- **Bundle Size:** < 20KB added to main bundle (gzipped)

### Quality Metrics

- **Accessibility:** 100% WCAG AA compliance
- **Browser Support:** Works on iOS 12+, Android 8+
- **Test Coverage:** > 80% code coverage
- **Bug Rate:** < 5 bugs per 1000 users in first week

---

## Risks & Mitigations

### Risk 1: Breaking Existing Functionality

**Probability:** Medium
**Impact:** High

**Mitigation:**
- Comprehensive testing before deployment
- Gradual rollout with feature flags
- Keep old implementation as fallback
- Thorough QA on production-like environment

### Risk 2: Performance Regression

**Probability:** Low
**Impact:** High

**Mitigation:**
- Performance benchmarks before/after
- Virtual scrolling for large lists
- Image lazy loading
- Bundle size monitoring
- Real device testing

### Risk 3: Design Inconsistencies

**Probability:** Medium
**Impact:** Medium

**Mitigation:**
- Detailed design review before implementation
- Design QA pass before deployment
- Variant documentation
- Screenshot-based regression testing

### Risk 4: Scope Creep

**Probability:** Medium
**Impact:** Medium

**Mitigation:**
- Clear acceptance criteria
- Phased implementation plan
- Regular check-ins with stakeholder
- "Future enhancements" backlog for nice-to-haves

---

## Future Enhancements

### Post-MVP Features

1. **Swipe Gestures**
   - Swipe right to like
   - Swipe left to queue
   - Swipe up to view details

2. **Context Menus**
   - Long-press to show actions
   - Add to playlist
   - Share externally
   - View artist profile

3. **Card Customization**
   - User preference for card size
   - Show/hide certain metadata
   - Custom color themes

4. **Advanced Interactions**
   - Drag to reorder (playlists)
   - Pinch to zoom (album art)
   - 3D Touch / Force Touch support

5. **Offline Support**
   - Cache thumbnails for offline viewing
   - Queue offline playback
   - Sync local changes when online

6. **Performance Optimizations**
   - Virtual scrolling by default
   - Preload next page of cards
   - WebP with AVIF fallback
   - Adaptive image quality based on network

---

## Documentation Requirements

### Component Documentation

**For Each Component:**
- Purpose and use cases
- Props interface with descriptions
- Variants and when to use them
- Code examples
- Accessibility notes

**Storybook Stories:**
- Default state
- Each variant
- With/without social actions
- Loading state
- Error state
- Current track state

### Style Guide Updates

**docs/design-guidelines.md:**
- Add TrackCard to component selection guide
- Document card variants
- Update mobile patterns section
- Add card animation guidelines

### API Documentation

**If API changes needed:**
- Update endpoint documentation
- Document new fields
- Update OpenAPI/Swagger specs

---

## Acceptance Criteria

### Functional Requirements

- [ ] BaseTrackCard component supports all 4 variants (compact, detailed, grid, list)
- [ ] Cards display all required metadata (title, artist, platform, timestamp, etc.)
- [ ] Social actions (like, reply) work with proper animations
- [ ] Current track highlighting syncs with playerStore
- [ ] Expandable text works for long comments
- [ ] Platform badges display correct icons and colors
- [ ] Play button triggers track playback

### Design Requirements

- [ ] Cards follow retro-cyberpunk design language
- [ ] Neon color accents used correctly (cyan borders, green for current, etc.)
- [ ] 8px spacing system followed throughout
- [ ] Typography sizes match design system
- [ ] Hover/focus states have proper glow effects
- [ ] Mobile cards meet 44px touch target minimum

### Performance Requirements

- [ ] Cards render in < 16ms (60fps)
- [ ] Scroll performance maintains 60fps with 50+ cards
- [ ] Image lazy loading implemented
- [ ] Bundle size increase < 20KB (gzipped)
- [ ] No memory leaks during extended use

### Accessibility Requirements

- [ ] All cards have proper ARIA labels
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Screen reader announces card content correctly
- [ ] Focus indicators visible and distinctive

### Browser/Device Requirements

- [ ] Works on iOS Safari 12+
- [ ] Works on Chrome Android 80+
- [ ] Works on Samsung Internet
- [ ] Tested on iPhone SE (375px)
- [ ] Tested on iPhone 14 Pro Max (428px)
- [ ] Tested on iPad Mini (768px)

### Integration Requirements

- [ ] LibraryTableRow uses BaseTrackCard for mobile
- [ ] HomePage sections use appropriate card variants
- [ ] No regressions in existing functionality
- [ ] All animations work on mobile devices
- [ ] Social stats update correctly

---

## Implementation Checklist

### Pre-Implementation
- [ ] Review this dev plan with team
- [ ] Clarify any ambiguous requirements
- [ ] Set up feature flag for gradual rollout
- [ ] Create tracking branch from main

### Component Development
- [ ] Create component directory structure
- [ ] Implement BaseTrackCard with props interface
- [ ] Create TrackThumbnail component
- [ ] Create TrackMetadata component
- [ ] Create TrackSocialActions component
- [ ] Create PlatformBadge component
- [ ] Implement CompactLayout variant
- [ ] Implement DetailedLayout variant
- [ ] Implement GridLayout variant
- [ ] Implement ListLayout variant
- [ ] Add prop validation/TypeScript types
- [ ] Create component index exports

### Styling
- [ ] Create trackCard.css with base styles
- [ ] Create trackCardVariants.css for variants
- [ ] Implement hover/focus states
- [ ] Add mobile-first media queries
- [ ] Style current track highlighting
- [ ] Implement touch feedback animations
- [ ] Ensure 44px touch targets on mobile
- [ ] Test on various viewport sizes

### Integration
- [ ] Refactor LibraryTableRow mobile view
- [ ] Update NewTracksSection
- [ ] Update RecentlyPlayedSection
- [ ] Update other HomePage sections
- [ ] Verify no regressions in desktop views
- [ ] Test social action integrations
- [ ] Test player store integration
- [ ] Test thread store integration

### Animations
- [ ] Integrate heartBeat animation for likes
- [ ] Integrate particleBurst for actions
- [ ] Add card entrance animations (if applicable)
- [ ] Optimize animation performance
- [ ] Test animations on real mobile devices

### Performance
- [ ] Implement image lazy loading
- [ ] Add intersection observer for cards
- [ ] Optimize re-render performance
- [ ] Test scroll performance with 100+ cards
- [ ] Measure bundle size impact
- [ ] Profile memory usage

### Accessibility
- [ ] Add ARIA labels to all interactive elements
- [ ] Test keyboard navigation
- [ ] Verify focus indicators
- [ ] Test with VoiceOver (iOS)
- [ ] Test with TalkBack (Android)
- [ ] Check color contrast ratios
- [ ] Verify semantic HTML structure

### Testing
- [ ] Write unit tests for BaseTrackCard
- [ ] Write unit tests for sub-components
- [ ] Write integration tests
- [ ] Manual testing on iPhone SE
- [ ] Manual testing on iPhone 14 Pro Max
- [ ] Manual testing on Android devices
- [ ] Manual testing on iPad
- [ ] Cross-browser testing
- [ ] Visual regression testing
- [ ] Performance benchmarking

### Documentation
- [ ] Add component JSDoc comments
- [ ] Create Storybook stories
- [ ] Update design-guidelines.md
- [ ] Add README to TrackCard directory
- [ ] Document variants and use cases
- [ ] Add code examples

### Deployment
- [ ] Code review
- [ ] QA pass
- [ ] Deploy to staging
- [ ] Smoke test on staging
- [ ] Enable feature flag for 10% of users
- [ ] Monitor metrics and error rates
- [ ] Gradual rollout to 50%, then 100%
- [ ] Collect user feedback

### Post-Deployment
- [ ] Monitor performance metrics
- [ ] Track user engagement
- [ ] Collect bug reports
- [ ] Plan iteration based on feedback
- [ ] Document lessons learned
- [ ] Add future enhancements to backlog

---

## Conclusion

This development plan provides a comprehensive roadmap for implementing mobile-optimized track cards in Jamzy. The modular component architecture ensures consistency and reusability, while the phased implementation approach minimizes risk. By following Jamzy's design principles and leveraging existing patterns, we can create a polished mobile experience that enhances music discovery and social interaction.

The key to success will be:
1. **Consistency:** Using BaseTrackCard everywhere tracks are displayed
2. **Performance:** Ensuring smooth 60fps scrolling and interactions
3. **Accessibility:** Making cards usable for all users
4. **Iteration:** Starting simple and refining based on user feedback

With this plan as a guide, the implementation can proceed methodically through each phase, with clear milestones and success criteria at every step.

---

**Absolute File Paths for Implementation:**

Core Component Files:
- `/Users/nmadd/Dropbox/code/vibes/mobile-cards-TASK-559/frontend/src/components/common/TrackCard/BaseTrackCard.tsx`
- `/Users/nmadd/Dropbox/code/vibes/mobile-cards-TASK-559/frontend/src/components/common/TrackCard/TrackCardVariants.tsx`
- `/Users/nmadd/Dropbox/code/vibes/mobile-cards-TASK-559/frontend/src/components/common/TrackCard/TrackThumbnail.tsx`
- `/Users/nmadd/Dropbox/code/vibes/mobile-cards-TASK-559/frontend/src/components/common/TrackCard/TrackMetadata.tsx`
- `/Users/nmadd/Dropbox/code/vibes/mobile-cards-TASK-559/frontend/src/components/common/TrackCard/TrackSocialActions.tsx`
- `/Users/nmadd/Dropbox/code/vibes/mobile-cards-TASK-559/frontend/src/components/common/TrackCard/PlatformBadge.tsx`
- `/Users/nmadd/Dropbox/code/vibes/mobile-cards-TASK-559/frontend/src/components/common/TrackCard/index.ts`

Style Files:
- `/Users/nmadd/Dropbox/code/vibes/mobile-cards-TASK-559/frontend/src/components/common/TrackCard/trackCard.css`
- `/Users/nmadd/Dropbox/code/vibes/mobile-cards-TASK-559/frontend/src/components/common/TrackCard/trackCardVariants.css`

Files to Modify:
- `/Users/nmadd/Dropbox/code/vibes/mobile-cards-TASK-559/frontend/src/components/library/LibraryTableRow.tsx`
- `/Users/nmadd/Dropbox/code/vibes/mobile-cards-TASK-559/frontend/src/components/home/components/NewTracksSection.tsx`
- `/Users/nmadd/Dropbox/code/vibes/mobile-cards-TASK-559/frontend/src/components/home/components/RecentlyPlayedSection.tsx`