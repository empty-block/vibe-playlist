# VIBES 95 - Development Documentation

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

---

*Last updated: $(date)*
*This file should be updated whenever new development quirks are discovered.*