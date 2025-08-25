# JAMZY Development Guide

## 🚨 Critical Development Issues - READ FIRST

### YouTube vs Spotify Origin Conflict
**THE PROBLEM**: YouTube and Spotify have conflicting origin requirements that break each other:
- **YouTube IFrame API**: Only works with `localhost` origin (fails with `127.0.0.1`)
- **Spotify OAuth**: Only works with `127.0.0.1` or HTTPS (fails with `localhost`)

**THE SOLUTION**: Use Cloudflare Tunnel to get an HTTPS domain that works for both:
```bash
# Terminal 1: Start dev server
bun run dev

# Terminal 2: Start tunnel
cloudflared tunnel --url http://localhost:3001
# Use generated HTTPS URL for Spotify redirect URI
```

### Required Vite Configuration
```typescript
// vite.config.ts
server: {
  host: 'localhost', // MUST be localhost for YouTube
  port: 3001
}
```

## 🛠 Quick Start

### Commands
```bash
bun run dev          # Start dev server on localhost:3001
bun run build        # Production build
bun run preview      # Preview production build
bun run typecheck    # TypeScript validation
```

### Environment Variables
```bash
# .env file
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id

# Development with Cloudflare Tunnel (recommended)
VITE_SPOTIFY_REDIRECT_URI=https://your-tunnel-url.trycloudflare.com

# Development without YouTube
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:3001
```

### Spotify Dashboard Setup
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Your App → Settings → Redirect URIs
3. Add your redirect URI (must match `.env` exactly)
4. Required scopes: `streaming`, `user-read-email`, `user-read-private`, `user-read-playback-state`, `user-modify-playback-state`, `user-read-currently-playing`

## 🏗 Architecture Overview

### Component Organization
Components are organized by **feature domain** for intuitive navigation:

```
src/components/
├── auth/          - Authentication & user management
├── chat/          - AI chat & conversation features  
├── common/        - Shared/reusable components
├── layout/        - App structure & navigation
├── player/        - Music playback functionality
├── playlist/      - Playlist & track management
└── social/        - Social interactions & engagement
```

### Multi-Source Player Architecture
Both YouTube and Spotify players are **always mounted** in the DOM with visibility controlled by CSS classes. This prevents initialization issues from mounting/unmounting.

**Track Data Structure**:
```typescript
{
  source: 'youtube' | 'spotify' | 'soundcloud',
  sourceId: 'video_id_or_track_id',
  videoId: 'video_id' // Backward compatibility for YouTube
}
```

**Player Switching**:
- Both players mounted in `Layout.tsx`
- Visibility controlled by CSS classes based on `currentTrack()?.source`
- Each player manages its own initialization state

### Design Principles
1. **Component First**: Check for existing reusable components before creating new ones
2. **Variant Support**: Components support multiple visual variants for different contexts
3. **Flexible Props**: Optional handlers for different interaction patterns
4. **Consistent Naming**: Follow patterns like `onLikeClick`, `onReplyClick`
5. **Mobile-First**: All components are responsive by default

## 🔄 State Management

### Store Architecture
Domain-specific stores in `src/stores/`:

**playlistStore.ts**
- Multi-source tracks with backward compatibility
- Automatic migration from legacy `videoId` to `sourceId`
- Reactive updates with SolidJS signals

**authStore.ts**
- User authentication state
- Spotify OAuth token management
- Session persistence

**playerStore.ts**
- Playback state for each source
- Current track management
- Queue and shuffle logic

### Key Patterns
- **Signals**: SolidJS reactive state with `createSignal()` and `createStore()`
- **Memos**: Computed values with `createMemo()` for efficient derived state
- **Reactive Updates**: Real-time UI updates through signal subscriptions

### Search & Filter State
- **Efficient Filtering**: Chainable search + filter + sort operations
- **Performance**: Only recomputes when dependencies change
- **Multiple Criteria**: Combine text search, category filters, and sorting

## 🔧 API Integrations

### YouTube IFrame API
- **Initialization**: Async API loading with global callback
- **Container Requirements**: Stable DOM element reference required
- **Error 150**: Video blocked due to embedding restrictions or origin issues

### Spotify Web Playback SDK
- **Requirements**: Spotify Premium account for full playback
- **Device Registration**: Creates "JAMZY Player" in Spotify Connect
- **Script Loading**: Must load before component initialization
- **Error Handling**: Comprehensive listeners for auth/playback issues

## 🐛 Troubleshooting Guide

### YouTube Player Issues

**YouTube Player Container Reference**
- **Issue**: YouTube player fails to initialize if the DOM container isn't properly set
- **Symptom**: Console shows `hasContainer: false` endlessly
- **Root Cause**: Conditional rendering with Solid's `Show` component unmounts/remounts the player, breaking DOM refs
- **Solution**: Use CSS `hidden` class instead of conditional mounting
- **Code Location**: `Layout.tsx` - always mount both players, toggle visibility with CSS

### Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| YouTube not loading | Player won't initialize | Verify using `localhost` not `127.0.0.1` |
| Spotify auth failing | Redirect mismatch error | Ensure `.env` URI matches Spotify dashboard exactly |
| Videos unavailable | All videos blocked | Check origin (must be `localhost` for YouTube) |
| Player not switching | Wrong player shows | Verify track has correct `source` field |
| Animations not working | No visual effects | Check anime.js version (must be v3.x) |
| Layout clipping | Hover effects cut off | Ensure parent containers have adequate padding |

### Testing Scenarios

**YouTube Only**:
```bash
# vite.config.ts: host: 'localhost'
# Access: http://localhost:3001
```

**Spotify Only**:
```bash
# vite.config.ts: host: true
# .env: VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:3001
# Access: http://127.0.0.1:3001
```

**Both Services** (Recommended):
```bash
# Use Cloudflare Tunnel for HTTPS domain
# Update .env with tunnel URL
```

## 🚀 Deployment

### Production Configuration
- Use real HTTPS domain (resolves all localhost/127.0.0.1 conflicts)
- Update Spotify redirect URI to production domain
- YouTube embedding works normally with proper domain

### Hosting
- **Cloudflare Pages**: Static hosting
- **Environment Variables**: Managed through Cloudflare dashboard
- **API Security**: Consider rate limiting and key security