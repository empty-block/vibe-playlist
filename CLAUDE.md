# VIBES 95 - Development Documentation

## 🎵 Core Design Philosophy

### "Everything is a Playlist" Architecture
VIBES 95 treats **playlists as the fundamental organizational unit** for all music content:

- **User Profiles = Personal Playlists**: Every user's profile acts as their personal "Username's Jams" playlist
- **Social Sharing = Playlist Creation**: When users share songs, they're creating playlist entries/contributions
- **All Content Lives in Playlists**: No standalone tracks - everything belongs to some playlist context
- **Playlist Types**:
  - **Personal**: User's individual feed/profile (e.g., "My Jams")
  - **Collaborative**: Group playlists where multiple users contribute
  - **AI Curated**: Algorithm-generated playlists based on taste graphs/network theory

This unified model simplifies the mental model - users always think "where should this song go?" rather than complex sharing/posting concepts.

### Built on Farcaster Social Infrastructure
- **Backend**: Leverages existing Farcaster protocol for user profiles, social interactions, posting
- **Frontend Focus**: UI/UX layer that presents Farcaster content through playlist metaphor
- **No Custom Social Features**: Authentication, messaging, user management handled by Farcaster

## 🏗 Tech Stack Notes

- **Bun**: All commands use `bun` not `npm` (`bun run dev`, `bun add`, etc.)
- **SolidJS**: Uses `createSignal()`/`createEffect()` not React hooks - different ref/state patterns
- **Multi-player architecture**: Both YouTube + Spotify players always mounted, visibility controlled by CSS classes
- **Vite dev server**: Host configuration is critical for YouTube/Spotify API conflicts

## 🚨 Critical Development Quirks & Gotchas

### YouTube Player Issues

#### 1. **YouTube Embedding vs localhost/127.0.0.1**
- **Issue**: YouTube's IFrame API has strict embedding policies that can block videos based on the origin
- **Symptom**: All videos show "Video unavailable" with Error 150
- **Root Cause**: YouTube treats `127.0.0.1` differently than `localhost` for embedding permissions
- **Solution**: Use `localhost` in vite config for YouTube player to work
- **Code Location**: `vite.config.ts` - set `host: 'localhost'`

#### 2. **YouTube Player Container Reference**
- **Issue**: YouTube player fails to initialize if the DOM container isn't properly set
- **Symptom**: Console shows `hasContainer: false` endlessly
- **Root Cause**: Conditional rendering with Solid's `Show` component unmounts/remounts the player, breaking DOM refs
- **Solution**: Use CSS `hidden` class instead of conditional mounting
- **Code Location**: `Layout.tsx` - always mount both players, toggle visibility with CSS

### Spotify Authentication Issues

#### 3. **Spotify Redirect URI Restrictions**
- **Issue**: Spotify OAuth PKCE flow is extremely picky about redirect URIs
- **Restrictions**:
  - ❌ `http://localhost:*` - Not allowed by Spotify
  - ✅ `http://127.0.0.1:*` - Allowed for loopback
  - ✅ `https://domain.com` - Allowed for secure domains
- **Documentation**: [Spotify App Settings Guide](https://developer.spotify.com/documentation/web-api/concepts/apps)
- **Code Location**: `.env` file `VITE_SPOTIFY_REDIRECT_URI`

#### 4. **The localhost vs 127.0.0.1 Conflict**
- **The Problem**: We have conflicting requirements:
  - YouTube embedding: Works with `localhost`, fails with `127.0.0.1`
  - Spotify redirect: Works with `127.0.0.1`, fails with `localhost`
- **Dev Environment Solution**: Use Cloudflare Tunnel to get real HTTPS domain
- **Production**: No issue - real domain works for both

### Multi-Source Player Architecture

#### 5. **Track Data Structure**
- **New Format**: All tracks must have `source` and `sourceId` fields
- **Legacy Support**: Backward compatibility with `videoId` field for YouTube tracks
- **Migration**: Automatic migration function in `playlistStore.ts`
- **Example**:
```typescript
// New format
{
  source: 'youtube' | 'spotify' | 'soundcloud',
  sourceId: 'video_id_or_track_id',
  videoId: 'video_id' // For backward compatibility
}
```

#### 6. **Player Switching Logic**
- **Layout**: Both YouTube and Spotify players are always mounted
- **Visibility**: Controlled by CSS classes based on `currentTrack()?.source`
- **State Management**: Each player manages its own initialization and playback state

### API Integration Details

#### 7. **Spotify Web Playback SDK**
- **Requires**: Spotify Premium account for full playback
- **Device Registration**: Creates "VIBES 95 Player" device in user's Spotify Connect
- **Script Loading**: Must be loaded before component initialization
- **Error Handling**: Comprehensive error listeners for auth, playback, and account issues

#### 8. **YouTube IFrame API**
- **Initialization**: Async API loading with global callback
- **Container Requirements**: Must have stable DOM element reference
- **Error 150**: Usually indicates embedding restrictions or origin issues

## 🛠 Development Commands

### Standard Development
```bash
bun run dev  # Runs on localhost:3001 (YouTube-friendly)
```

### With Cloudflare Tunnel (for Spotify testing)
```bash
# Terminal 1: Start dev server
bun run dev

# Terminal 2: Start Cloudflare tunnel
cloudflared tunnel --url http://localhost:3001
# Use the generated HTTPS URL for Spotify redirect URI
```

### Build & Test
```bash
bun run build
bun run preview
```

## 🔧 Environment Variables

```bash
# .env file
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=https://your-tunnel-url.trycloudflare.com  # For dev with tunnel
# OR
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:3001  # For dev without YouTube
```

## 📝 Spotify Dashboard Configuration

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Your App → Settings → Redirect URIs
3. Add your redirect URI (must match `.env` exactly)
4. Required scopes: `streaming`, `user-read-email`, `user-read-private`, `user-read-playback-state`, `user-modify-playback-state`, `user-read-currently-playing`

## 🎯 Testing Different Scenarios

### Test YouTube Only
- Use `host: 'localhost'` in vite.config.ts
- Access via `http://localhost:3001`
- YouTube videos should play normally

### Test Spotify Only  
- Use `host: true` in vite.config.ts
- Set redirect URI to `http://127.0.0.1:3001`
- Access via `http://127.0.0.1:3001`
- Spotify auth should work

### Test Both (Recommended)
- Use Cloudflare Tunnel for HTTPS domain
- Set redirect URI to tunnel URL
- Both YouTube and Spotify should work

## 🐛 Common Debug Steps

1. **YouTube not loading**: Check console for container ref errors, verify localhost usage
2. **Spotify auth failing**: Verify redirect URI exact match between .env and Spotify dashboard
3. **Videos show unavailable**: Check if using correct origin (localhost vs 127.0.0.1)
4. **Player not switching**: Verify track has correct `source` field set

## 🚀 Production Deployment Notes

- Use real HTTPS domain - resolves all localhost/127.0.0.1 conflicts
- Update Spotify redirect URI to production domain
- YouTube embedding should work normally with proper domain
- Consider rate limiting and API key security for production Spotify integration

## 🎨 Animation System (anime.js)

### Overview
The app uses **anime.js v3.2.1** for smooth, hardware-accelerated animations throughout the UI. All animation utilities are centralized in `src/utils/animations.ts`.

### Key Implementation Details

#### Version Notes
- **anime.js v3.2.1**: Stable version with reliable module imports
- **Avoid v4.x**: Has module export issues in our build setup
- **Installation**: `bun add animejs@3.2.1`

#### Core Animation Patterns

**Player Controls**: Gradient hover effects with icon color changes
```typescript
// Player buttons get gradient backgrounds + white icons on hover
playbackButtonHover.enter(buttonElement);
```

**Track Interactions**: 
- Hover scale effects with proper container padding
- Current track gets neon blue border with multi-layer glow
- Particle burst effects on play button clicks
- Magnetic effects on thumbnails

**Page Transitions**: Staggered fade-ins, page entrance animations, floating elements

#### Animation Architecture
- **Centralized utilities**: All animations in `src/utils/animations.ts`
- **Ref-based**: Uses SolidJS refs for direct DOM manipulation
- **Hardware acceleration**: `transform: translateZ(0)` for smooth performance
- **CSS transition override**: `transition: 'none'` to prevent conflicts

#### Common Patterns
```typescript
// Always disable CSS transitions for anime.js elements
element.style.transition = 'none';

// Reset transforms after animations complete
complete: () => {
  element.style.transform = 'translateZ(0)';
}

// Proper cleanup in leave animations
leave: (element) => {
  element.style.background = '';
  element.style.color = '';
}
```

#### Critical Layout Considerations
- **Container padding**: Track containers need `px-2` for hover scale effects
- **Border visibility**: Current track uses `border-4` + multi-layer shadows
- **Stagger conflicts**: Don't mix individual item animations with container staggered animations

### Troubleshooting
1. **Animations not working**: Check anime.js version (must be v3.x)
2. **Layout clipping**: Ensure parent containers have adequate padding
3. **Performance issues**: Verify hardware acceleration with `translateZ(0)`
4. **Import errors**: Use `import anime from 'animejs'` (default import)

## 🧩 Component Architecture & DRY Principles

### Reusable Social Components

The app follows a **DRY (Don't Repeat Yourself) principle** to eliminate duplicate code and ensure consistency. When building UI, always check if a reusable component exists before creating new ones.

#### Social Component Library (`src/components/social/`)

**`SocialStats.tsx`** - Unified display for likes/recasts/replies
```typescript
// Consistent stats display across all contexts
<SocialStats
  likes={track.likes}
  recasts={track.recasts} 
  replies={track.replies}
  size="sm|md|lg"
  showLabels={true|false}
  interactive={true}  // Makes buttons clickable
  onLikeClick={() => handleLike()}
  onRepliesClick={() => showReplies()}
/>
```

**`SocialActions.tsx`** - Reusable action buttons
```typescript
// Flexible button component with multiple variants
<SocialActions
  onLike={() => likeTrack()}
  onAdd={() => addToPlaylist()}
  onShare={() => shareTrack()}
  size="sm|md|lg"
  variant="buttons|links"  // Win95 buttons or simple links
/>
```

**`ReplyItem.tsx`** - Standardized reply formatting
```typescript
// Consistent reply display everywhere
<ReplyItem
  reply={replyData}
  variant="default|compact|modal"  // Different contexts
  onLike={(id) => likeReply(id)}
  onReply={(id) => replyTo(id)}
/>
```

#### Design Principles

1. **Component First**: Before creating duplicate UI, check if a reusable component exists
2. **Variant Support**: Components support multiple visual variants for different contexts
3. **Flexible Props**: Components accept optional handlers for different interaction patterns
4. **Consistent Naming**: All social interactions follow same prop patterns (`onLikeClick`, `onReplyClick`, etc.)
5. **Mobile-First**: All components are responsive and touch-friendly by default

#### Usage Guidelines

- **DO**: Use existing social components for likes, replies, shares across the app
- **DO**: Add variant props when the same component needs different styling
- **DO**: Make components flexible with optional click handlers
- **DON'T**: Duplicate social UI patterns - extend existing components instead
- **DON'T**: Create component variants unless there's a clear use case difference

#### When to Create New Components

Create new reusable components when:
- The same UI pattern appears 3+ times
- The pattern has clear variants (desktop vs mobile, large vs small)
- The component encapsulates complex logic that shouldn't be duplicated

Keep components straightforward - prefer simple, focused components over complex ones with many responsibilities.

## 🎨 UI/UX Features & Design Patterns

### HomePage (Main Feed)
- **Playlist Selection**: Dropdown to switch between different playlist feeds
- **Search & Sort**: Users can search tracks and sort by Recent/Likes/Comments
- **Sort Implementation**: 
  - Recent: Parses "X min ago" timestamps 
  - Likes: Sorts by `track.likes` descending
  - Comments: Sorts by `track.replies` descending
- **ChatBot Integration**: Collapsible AI assistant sidebar

### Create Page (Song Addition)
**Core Concept**: Users "create" playlist entries rather than "share" content

**Scalable Playlist Selection**:
- **Quick Access**: Buttons for frequently used playlists (default + popular)
- **Search**: Find playlists by name/description
- **Filter by Type**: Personal/Collaborative/AI Curated
- **Sort Options**: Recent, Popular (by member count), Alphabetical
- **Results Counter**: "X of Y playlists" with clear filters button
- **Scrollable List**: Handles large playlist collections gracefully

**Form Design**:
- **Song URL Input**: Accepts any platform (YouTube, Spotify, SoundCloud, etc.)
- **Optional Comment**: User's take/reaction to the song
- **Playlist Creation**: Inline creation without navigation

**Visual Hierarchy**:
- **Input Fields**: White background with gray borders for clear interactivity
- **Containers**: Gray `win95-panel` backgrounds for structure
- **Consistency**: All panels use same styling system

### Win95 Design System
- **Panels**: `win95-panel` class for consistent container styling
- **Buttons**: `win95-button` class with hover states
- **Navigation**: Tab-style navigation with active state indicators
- **Typography**: Bold, high-contrast text optimized for retro aesthetic

### Responsive Considerations
- **Grid Layouts**: Mobile-first approach with `grid-cols-1 md:grid-cols-3`
- **Flexible Containers**: `flex-wrap` for adaptive button groups
- **Scrollable Areas**: `overflow-y-auto` with `max-height` for contained scrolling

## 🔄 State Management Patterns

### Playlist Store (`playlistStore.ts`)
- **Track Interface**: Multi-source support with backward compatibility
- **Migration Logic**: Automatic conversion of legacy `videoId` to `sourceId`
- **Reactive Updates**: SolidJS signals for real-time UI updates

### Search & Filter State
- **Computed Memos**: Efficient filtering/sorting with `createMemo()`
- **Multiple Criteria**: Chainable search + filter + sort operations
- **Performance**: Only recomputes when dependencies change

### Player State Management
- **Multi-source**: Separate state for YouTube and Spotify players
- **Visibility Control**: CSS-based switching rather than mounting/unmounting
- **Track Continuity**: Seamless transitions between different audio sources

---

*Last updated: December 2024*
*This file should be updated whenever new development quirks or features are discovered.*