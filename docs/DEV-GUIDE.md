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

⚠️ **IMPORTANT**: When deploying to new Cloudflare branches/aliases:
- Each unique deployment URL needs to be added to Spotify's allowed redirect URIs
- Example: If deploying to `dev.jamzy-miniapp.pages.dev`, add `https://dev.jamzy-miniapp.pages.dev` to Spotify dashboard
- The `.env` file's `VITE_SPOTIFY_REDIRECT_URI` must match exactly
- The `mini-app/vite.config.ts` must include Spotify env vars in the `define` section
- The `deploy-miniapp.sh` script must load `.env` variables before building

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

### Spotify Playback Integration

JAMZY uses **two different Spotify playback strategies** depending on the environment:

#### Web App (Browser): Web Playback SDK
- **What**: Embedded in-browser playback
- **Requirements**: Spotify Premium account
- **Device**: Creates virtual "JAMZY Player" in user's Spotify Connect devices
- **SDK Loading**: On-demand via `window.loadSpotifySDK()` in `index.html`
- **Error Handling**: Listeners for initialization, authentication, account, and playback errors
- **Use Case**: Full control within browser, seamless integration with UI

#### Mini App (Farcaster): Spotify Connect API
- **What**: Controls external Spotify devices via REST API
- **Requirements**: Any Spotify account (Free or Premium)
- **Device**: Uses user's existing devices (phone app, desktop, web player)
- **Mechanism**: Opens tracks in Spotify app, then controls via API
- **Polling**: Checks playback state every 2 seconds
- **Use Case**: Works in sandboxed iframes where Web Playback SDK cannot function

**Why two approaches?**
- Farcaster mini apps run in strict sandboxed iframes
- Web Playback SDK requires browser APIs not available in iframes
- Connect API bypasses restrictions by controlling external devices

## 🐛 Troubleshooting Guide

### Spotify Playback Issues

**Spotify Connect API: "No active device found" (404)**
- **Issue**: Connect API calls fail with 404 error
- **Symptom**: First track shows "Play on Spotify" button, clicking doesn't start playback
- **Root Cause**: Spotify requires a device to be actively playing before Connect API works
- **Solution**: Hybrid device detection flow
  1. Try API immediately (works for subsequent tracks)
  2. Open Spotify link if no device
  3. Poll `/me/player/devices` for up to 20 seconds
  4. Retry playback once device becomes active
- **Code Location**: `SpotifyMedia.tsx:47-115`, `spotifyConnect.ts:268-293`

**Second Track Not Auto-Playing**
- **Issue**: First track works, but subsequent tracks show "Play on Spotify" instead of auto-playing
- **Symptom**: Console shows `[Auto-play Effect] hasDevice: false` or `deviceName: ""`
- **Root Cause**: Component remounting on track changes resets state signals
- **Solution**: Module-level persistent signals for `deviceName` and `connectReady`
- **Code Location**: `SpotifyMedia.tsx:10-11` and `:42-45`
- **Verification**: Check console for `[Auto-play Effect]` logs showing `hasDevice: true`

**Track Playing Twice / Restarting on Pause**
- **Issue**: Track restarts from beginning when playing or pausing
- **Symptom**: Audio starts, stops, then starts again from 0:00
- **Root Cause**: `createEffect` triggering on `isPlaying()` changes and calling `playTrackConnect()`
- **Solution**: Use `untrack()` and `isConnecting` flag to prevent effect during state changes
- **Code Location**: `SpotifyMedia.tsx:347-379`
- **Key**: Effect only triggers on track ID changes, not play/pause state

**OAuth Popup Blocked in Farcaster**
- **Issue**: Spotify login doesn't work in mini app
- **Symptom**: Popup window doesn't open or closes immediately
- **Root Cause**: Farcaster blocks standard OAuth redirect in iframe
- **Solution**: Popup + postMessage flow
  1. Open OAuth in popup via `window.open()`
  2. Popup posts auth code to parent via `postMessage()`
  3. Parent exchanges code for token
  4. Popup closes automatically
- **Code Location**: `authStore.ts:115-161`, `index.tsx:64-86`
- **Security**: Origin verification prevents untrusted messages

**Spotify Premium Required (Browser Mode)**
- **Issue**: "Spotify Premium required" error in browser
- **Symptom**: Web Playback SDK initialization fails with account error
- **Root Cause**: Web Playback SDK requires Premium subscription
- **Solution**:
  - Browser mode: User must have Premium
  - Farcaster mode: No Premium needed (uses Connect API)
- **Fallback**: Shows "Play on Spotify" button if SDK fails

**State Not Persisting Across Sessions**
- **Issue**: User has to login again after page refresh
- **Symptom**: `spotifyAccessToken()` returns null on reload
- **Root Cause**: Token not saved to localStorage
- **Solution**: `initializeAuth()` loads token from localStorage on startup
- **Code Location**: `authStore.ts:168-184`, `index.tsx:89-117`
- **Expiry**: Tokens expire after 1 hour, require re-authentication

### YouTube Player Issues

**YouTube Player Container Reference**
- **Issue**: YouTube player fails to initialize if the DOM container isn't properly set
- **Symptom**: Console shows `hasContainer: false` endlessly
- **Root Cause**: Conditional rendering with Solid's `Show` component unmounts/remounts the player, breaking DOM refs
- **Solution**: Use CSS `hidden` class instead of conditional mounting
- **Code Location**: `Layout.tsx` - always mount both players, toggle visibility with CSS

**Illegal Redirect URI Error**
- **Issue**: "Illegal redirect_uri" or "Missing required parameter: client_id" when logging in with Spotify
- **Symptom**: Spotify authorization fails immediately after clicking login
- **Root Causes**:
  1. New deployment URL not added to Spotify dashboard
  2. Environment variables not loaded during build
  3. Vite config missing Spotify env var definitions
- **Solution**:
  1. Add deployment URL to [Spotify Dashboard](https://developer.spotify.com/dashboard) → Settings → Redirect URIs
  2. Update `.env` file with correct `VITE_SPOTIFY_REDIRECT_URI`
  3. Ensure `mini-app/vite.config.ts` includes Spotify vars in `define` section:
     ```typescript
     define: {
       'import.meta.env.VITE_SPOTIFY_CLIENT_ID': JSON.stringify(process.env.VITE_SPOTIFY_CLIENT_ID || ''),
       'import.meta.env.VITE_SPOTIFY_REDIRECT_URI': JSON.stringify(process.env.VITE_SPOTIFY_REDIRECT_URI || 'https://dev.jamzy-miniapp.pages.dev')
     }
     ```
  4. Verify `deploy-miniapp.sh` loads `.env` before building:
     ```bash
     if [ -f ../.env ]; then
       export $(cat ../.env | grep -v '^#' | xargs)
     fi
     ```
- **Code Location**: `mini-app/vite.config.ts`, `deploy-miniapp.sh`, `.env`
- **Common Mistake**: Deploying to new branch without updating redirect URI everywhere

**Spotify Keeps Playing When Switching to YouTube**
- **Issue**: Spotify playback continues when switching to YouTube track
- **Symptom**: Both Spotify and YouTube audio playing simultaneously
- **Root Cause**: SpotifyMedia component doesn't pause on track source change
- **Solution**: Added reactive effect to pause Spotify when `currentTrack().source !== 'spotify'`
- **Code Location**: `mini-app/src/components/player/SpotifyMedia.tsx:381-392` (Farcaster mode), `:306-313` (Browser mode)

### Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| YouTube not loading | Player won't initialize | Verify using `localhost` not `127.0.0.1` |
| Spotify auth failing | Redirect mismatch error | Ensure `.env` URI matches Spotify dashboard exactly |
| Videos unavailable | All videos blocked | Check origin (must be `localhost` for YouTube) |
| Player not switching | Wrong player shows | Verify track has correct `source` field |
| Animations not working | No visual effects | Check anime.js version (must be v3.x) |
| Layout clipping | Hover effects cut off | Ensure parent containers have adequate padding |
| Spotify 404 error | "No active device" | Open Spotify app first, or wait for device detection |
| Second track not auto-playing | Manual click required | Check console for `hasDevice: false`, verify persistent signals |
| Track plays twice | Audio restarts | Remove reactive effects that trigger on `isPlaying()` |
| Mini app OAuth blocked | Login popup fails | Use popup + postMessage flow, not redirect |
| Spotify Premium error | SDK fails in browser | User needs Premium for browser, or use mini app (no Premium needed) |
| Illegal redirect_uri | Spotify login fails | Add deployment URL to Spotify dashboard, update .env, check vite.config.ts |
| Both players playing | Audio overlap | Check SpotifyMedia pause logic on track source change |

### Testing Scenarios

**YouTube Only**:
```bash
# vite.config.ts: host: 'localhost'
# Access: http://localhost:3001
```

**Spotify Browser Mode (Web Playback SDK)**:
```bash
# vite.config.ts: host: true
# .env: VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:3001
# Access: http://127.0.0.1:3001
# Requires: Spotify Premium account
```

**Spotify Farcaster Mode (Connect API)**:
```bash
# Build and deploy mini-app
cd mini-app
bun --bun vite build
wrangler pages deploy dist --project-name jamzy-miniapp

# Test in Farcaster frame or local iframe:
# <iframe src="https://your-miniapp.pages.dev" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>
# Requires: Spotify app open on any device (no Premium needed)
```

**Testing Spotify Connect Flow**:
1. **First Track**:
   - Click "Play on Spotify" button
   - Spotify opens in new tab
   - Wait for device detection (max 20s)
   - Track should start playing
   - Console shows: `Device is now active - retrying playback`
   - UI shows: "✓ Connected to Spotify"

2. **Second Track**:
   - Click new track in feed
   - Should auto-play immediately (no button click)
   - Console shows: `[Auto-play Effect] ✅ All conditions met`
   - UI still shows: "✓ Connected to Spotify"

3. **Verify No Double-Play**:
   - First track should only play once
   - Console should NOT show multiple `Playing track via Spotify Connect` logs
   - Pause/play should not restart from beginning

**Both Services** (Recommended):
```bash
# Use Cloudflare Tunnel for HTTPS domain
# Update .env with tunnel URL
# Works for both YouTube and Spotify in browser mode
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