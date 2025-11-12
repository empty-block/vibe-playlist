/**
 * Odesli (song.link) Resolver Service
 *
 * Resolves song.link and Apple Music URLs to playable platform links
 * using the Odesli API (api.song.link)
 *
 * Rate Limits:
 * - Without API key: 10 requests/minute
 * - With API key: 60 requests/minute
 *
 * Free API, no subscription required
 * Attribution required: "Powered by Songlink"
 */

export interface OdesliResolution {
  platform: 'youtube' | 'spotify' | 'soundcloud' | null
  platformId: string | null
  url: string | null
  title: string | null
  artist: string | null
  thumbnail: string | null
  error?: string
}

interface OdesliApiResponse {
  entityUniqueId: string
  entitiesByUniqueId: Record<string, {
    id: string
    type: string
    title?: string
    artistName?: string
    thumbnailUrl?: string
    thumbnailWidth?: number
    thumbnailHeight?: number
    apiProvider: string
    platforms: string[]
  }>
  linksByPlatform: {
    youtube?: {
      url: string
      nativeAppUriMobile?: string
      nativeAppUriDesktop?: string
      entityUniqueId: string
    }
    spotify?: {
      url: string
      nativeAppUriMobile?: string
      nativeAppUriDesktop?: string
      entityUniqueId: string
    }
    soundcloud?: {
      url: string
      nativeAppUriMobile?: string
      nativeAppUriDesktop?: string
      entityUniqueId: string
    }
    appleMusic?: {
      url: string
      nativeAppUriMobile?: string
      nativeAppUriDesktop?: string
      entityUniqueId: string
    }
    [key: string]: any
  }
  userCountry?: string
}

// In-memory cache to avoid repeated API calls
// Key: original URL, Value: resolution result
const resolutionCache = new Map<string, OdesliResolution>()

// Rate limiting tracking
let requestCount = 0
let requestWindowStart = Date.now()
const RATE_LIMIT = 10 // requests per minute (without API key)
const RATE_WINDOW = 60 * 1000 // 1 minute in milliseconds

/**
 * Check if we're within rate limit
 */
function checkRateLimit(): boolean {
  const now = Date.now()

  // Reset counter if window has passed
  if (now - requestWindowStart > RATE_WINDOW) {
    requestCount = 0
    requestWindowStart = now
  }

  return requestCount < RATE_LIMIT
}

/**
 * Extract YouTube video ID from YouTube URL
 */
function extractYouTubeId(url: string): string | null {
  try {
    const urlObj = new URL(url)

    // youtube.com/watch?v=VIDEO_ID
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v')
    }

    // youtu.be/VIDEO_ID
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1)
    }

    return null
  } catch {
    return null
  }
}

/**
 * Extract Spotify track ID from Spotify URL
 */
function extractSpotifyId(url: string): string | null {
  try {
    const urlObj = new URL(url)

    // open.spotify.com/track/TRACK_ID
    if (urlObj.hostname.includes('spotify.com')) {
      const match = urlObj.pathname.match(/\/track\/([a-zA-Z0-9]+)/)
      return match ? match[1] : null
    }

    return null
  } catch {
    return null
  }
}

/**
 * Extract SoundCloud track identifier from SoundCloud URL
 * Note: SoundCloud uses artist/track-name format, not simple IDs
 */
function extractSoundCloudId(url: string): string | null {
  try {
    const urlObj = new URL(url)

    // soundcloud.com/artist/track-name or on.soundcloud.com/...
    if (urlObj.hostname.includes('soundcloud.com')) {
      // Return full URL as "ID" since SoundCloud doesn't use simple IDs
      return url
    }

    return null
  } catch {
    return null
  }
}

/**
 * Resolve a song.link or Apple Music URL to a playable platform
 *
 * Priority order: YouTube > Spotify > SoundCloud
 *
 * @param url - Original song.link or Apple Music URL
 * @returns Resolution with platform, platformId, and metadata
 */
export async function resolveOdesliUrl(url: string): Promise<OdesliResolution> {
  // Check cache first
  const cached = resolutionCache.get(url)
  if (cached) {
    console.log('[OdesliResolver] Cache hit:', url)
    return cached
  }

  // Check rate limit
  if (!checkRateLimit()) {
    const error = 'Rate limit exceeded (10 requests/minute). Please wait a moment.'
    console.warn('[OdesliResolver]', error)
    return {
      platform: null,
      platformId: null,
      url: null,
      title: null,
      artist: null,
      thumbnail: null,
      error
    }
  }

  try {
    // Increment request counter
    requestCount++

    // Call backend API proxy (avoids CORS issues)
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const apiUrl = `${backendUrl}/api/odesli/resolve?url=${encodeURIComponent(url)}`
    console.log('[OdesliResolver] Fetching via backend proxy:', apiUrl)

    const response = await fetch(apiUrl)

    if (!response.ok) {
      const error = `Odesli API returned ${response.status}`
      console.error('[OdesliResolver]', error)
      return {
        platform: null,
        platformId: null,
        url: null,
        title: null,
        artist: null,
        thumbnail: null,
        error
      }
    }

    const data: OdesliApiResponse = await response.json()
    console.log('[OdesliResolver] API response:', data)

    // Extract metadata from entity
    const entityId = data.entityUniqueId
    const entity = data.entitiesByUniqueId?.[entityId]

    const metadata = {
      title: entity?.title || null,
      artist: entity?.artistName || null,
      thumbnail: entity?.thumbnailUrl || null
    }

    // Try to resolve to supported platforms in priority order
    const links = data.linksByPlatform

    // Priority 1: YouTube (most universal, no auth required)
    if (links.youtube?.url) {
      const youtubeId = extractYouTubeId(links.youtube.url)
      if (youtubeId) {
        const resolution: OdesliResolution = {
          platform: 'youtube',
          platformId: youtubeId,
          url: links.youtube.url,
          ...metadata
        }
        resolutionCache.set(url, resolution)
        console.log('[OdesliResolver] Resolved to YouTube:', youtubeId)
        return resolution
      }
    }

    // Priority 2: Spotify (requires Premium + auth)
    if (links.spotify?.url) {
      const spotifyId = extractSpotifyId(links.spotify.url)
      if (spotifyId) {
        const resolution: OdesliResolution = {
          platform: 'spotify',
          platformId: spotifyId,
          url: links.spotify.url,
          ...metadata
        }
        resolutionCache.set(url, resolution)
        console.log('[OdesliResolver] Resolved to Spotify:', spotifyId)
        return resolution
      }
    }

    // Priority 3: SoundCloud (no auth required)
    if (links.soundcloud?.url) {
      const soundcloudId = extractSoundCloudId(links.soundcloud.url)
      if (soundcloudId) {
        const resolution: OdesliResolution = {
          platform: 'soundcloud',
          platformId: soundcloudId,
          url: links.soundcloud.url,
          ...metadata
        }
        resolutionCache.set(url, resolution)
        console.log('[OdesliResolver] Resolved to SoundCloud:', soundcloudId)
        return resolution
      }
    }

    // No supported platforms found
    const error = 'No supported platforms found (YouTube, Spotify, or SoundCloud)'
    console.warn('[OdesliResolver]', error)
    const resolution: OdesliResolution = {
      platform: null,
      platformId: null,
      url: null,
      ...metadata,
      error
    }
    resolutionCache.set(url, resolution)
    return resolution

  } catch (error: any) {
    const errorMsg = `Failed to resolve: ${error.message}`
    console.error('[OdesliResolver]', errorMsg)
    return {
      platform: null,
      platformId: null,
      url: null,
      title: null,
      artist: null,
      thumbnail: null,
      error: errorMsg
    }
  }
}

/**
 * Clear resolution cache (useful for testing)
 */
export function clearResolutionCache(): void {
  resolutionCache.clear()
  console.log('[OdesliResolver] Cache cleared')
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: resolutionCache.size,
    requestCount,
    requestWindowStart,
    rateLimit: RATE_LIMIT
  }
}
