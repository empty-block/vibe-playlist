# JAMZY - Technical Architecture

## Overview
JAMZY is a music discovery application that integrates YouTube, Spotify, and other music sources with AI-powered playlist creation. The application consists of two main environments:
- **Web App**: Full-featured browser application with embedded playback
- **Mini App**: Farcaster iframe-based application with external playback

## Frontend Stack
- **Bun** - Runtime and package manager (use `bun` not `npm`)
- **TypeScript** - Type-safe JavaScript
- **SolidJS** - Reactive UI framework (uses `createSignal()` not React hooks)
- **Vite** - Build tool and dev server
- **anime.js v3.2.1** - Animation library (avoid v4.x)
- **Farcaster Mini App SDK** - `@farcaster/miniapp-sdk` for iframe detection and OAuth

## Spotify Playback Architecture

### Dual-Mode Playback Strategy
JAMZY implements two different Spotify playback approaches depending on the environment:

#### Browser Mode (Web App)
**Uses Spotify Web Playback SDK** for embedded in-browser playback:
- Creates a virtual Spotify device called "JAMZY Player" in the user's Spotify Connect devices
- Plays audio directly in the browser tab
- Requires Spotify Premium account
- Seamless integration with player controls
- Full state management within the application

**Implementation**: `SpotifyMedia.tsx` (lines 125-287)
- SDK loaded on-demand via `window.loadSpotifySDK()`
- Player initialized with OAuth token
- Event listeners for playback state, errors, and track completion
- Direct API calls for play/pause/seek operations

#### Farcaster Mode (Mini App)
**Uses Spotify Connect API** for external device playback:
- Controls playback on user's existing Spotify devices (phone app, desktop app, web player)
- Opens tracks in Spotify app via deep links (`spotify://` or `https://open.spotify.com`)
- Polls Spotify API every 2 seconds for playback state
- No Premium requirement (uses user's native Spotify app)

**Why this approach?**
- Farcaster mini apps run in sandboxed iframes with strict limitations
- Web Playback SDK requires certain browser APIs not available in iframes
- External playback via Connect API bypasses these restrictions

**Implementation**: `SpotifyMedia.tsx` (lines 289-386) + `spotifyConnect.ts`

### Key Technical Challenges & Solutions

#### 1. Component Remounting Issue
**Problem**: `SpotifyMedia` component remounts on every track change (due to `MediaPlayer.tsx` creating new instances), resetting all state signals.

**Solution**: Module-level persistent signals for critical state:
```typescript
// Outside component - survives remounts
const [persistentDeviceName, setPersistentDeviceName] = createSignal<string>('');
const [persistentConnectReady, setPersistentConnectReady] = createSignal(false);
```

**Location**: `SpotifyMedia.tsx:10-11`

#### 2. Device Activation Flow
**Problem**: Spotify Connect API returns 404 "No active device" until user actually starts playback.

**Solution**: Hybrid device detection:
1. Try Connect API immediately (works if device already active from previous track)
2. If fails, open Spotify link in new tab
3. Poll `/me/player/devices` every 2s for up to 20s
4. Retry playback once device detected as active
5. Start polling for playback state updates

**Location**: `SpotifyMedia.tsx:47-115` and `spotifyConnect.ts:268-293`

#### 3. Auto-Play for Subsequent Tracks
**Problem**: First track requires manual "Play on Spotify" click, but subsequent tracks should auto-play.

**Solution**: Smart `createEffect` with conditions:
- Only triggers when track ID changes (not play/pause state)
- Only auto-plays if `deviceName` is set (device already connected)
- Uses `untrack()` to prevent re-triggering on `isPlaying()` changes
- Checks `isConnecting` flag to prevent double-play on first track

**Location**: `SpotifyMedia.tsx:347-379`

#### 4. OAuth in Farcaster Iframe
**Problem**: Standard OAuth redirect flow doesn't work in iframes (Farcaster blocks navigation).

**Solution**: Popup + postMessage flow:
1. Open OAuth URL in popup window via `window.open()`
2. Popup redirects to app with auth code
3. Popup sends code to parent via `postMessage()`
4. Parent window exchanges code for token
5. Popup closes automatically

**Location**: `authStore.ts:115-161` and `index.tsx:64-86`

### State Management

#### Browser Mode State
- `playerReady` - SDK initialized and device registered
- `deviceId` - Spotify Connect device ID for the browser player
- `sdkFailed` - SDK initialization failed, show fallback UI

#### Farcaster Mode State
- `connectReady` - Connect API initialized (persistent)
- `deviceName` - Name of connected Spotify device (persistent)
- `waitingForDevice` - Polling for device activation (local)
- `connectionFailed` - Device detection timeout (local)
- `isConnecting` - Prevent auto-play during initial connection (local)

**Persistent vs Local State**:
- **Persistent** (module-level): Survives component remounts, enables auto-play for subsequent tracks
- **Local** (component-level): Reset on each track change, used for UI state

### API Endpoints

#### Spotify Connect API (`spotifyConnect.ts`)
All endpoints require OAuth token with scopes: `user-modify-playback-state`, `user-read-playback-state`, `user-read-currently-playing`

**Playback Control**:
- `PUT /me/player/play` - Start playback with track URI
- `PUT /me/player/pause` - Pause playback
- `PUT /me/player/play` - Resume playback
- `POST /me/player/next` - Skip to next track
- `POST /me/player/previous` - Skip to previous track
- `PUT /me/player/seek` - Seek to position (ms)

**State & Devices**:
- `GET /me/player` - Get current playback state (returns 204 if no active playback)
- `GET /me/player/devices` - List available devices with `is_active` status

**Rate Limiting**: Spotify uses rolling 30-second window. Polling at 2-second intervals stays well within limits.

### Player Controls Integration

**Browser Mode**:
- Controls directly call SDK methods: `player.pause()`, `player.resume()`, `player.seek()`
- State updates via `player_state_changed` event listener

**Farcaster Mode**:
- Controls call Connect API functions: `togglePlaybackOnConnect()`, `seekOnConnect()`
- State updates via 2-second polling interval
- Polling started/stopped with playback lifecycle

**Location**: `Player.tsx:52-86` handles skip controls with environment detection