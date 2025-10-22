/**
 * URL Parser Service
 * Extracts platform name and platform ID from music URLs
 *
 * Supports: Spotify, YouTube, SoundCloud, Apple Music, Audius, and more
 */

export interface ParsedMusicUrl {
  platform_name: string
  platform_id: string
  url: string
}

/**
 * Parse a music URL to extract platform and track ID
 *
 * @param url - Music URL from any supported platform
 * @returns Parsed music URL with platform_name and platform_id, or null if not a music URL
 */
export function parseMusicUrl(url: string): ParsedMusicUrl | null {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase().replace('www.', '')
    const pathname = urlObj.pathname
    const searchParams = urlObj.searchParams

    // Spotify
    if (hostname.includes('spotify.com')) {
      // URL formats:
      // - https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp
      // - https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy
      // - https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
      const match = pathname.match(/\/(track|album|playlist)\/([a-zA-Z0-9]+)/)
      if (match) {
        return {
          platform_name: 'spotify',
          platform_id: match[2],
          url
        }
      }
    }

    // YouTube & YouTube Music
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      let videoId: string | null = null

      // youtu.be short links: https://youtu.be/dQw4w9WgXcQ
      if (hostname === 'youtu.be') {
        videoId = pathname.slice(1).split('?')[0]
      }
      // youtube.com watch: https://www.youtube.com/watch?v=dQw4w9WgXcQ
      else if (pathname.startsWith('/watch')) {
        videoId = searchParams.get('v')
      }
      // youtube.com embed: https://www.youtube.com/embed/dQw4w9WgXcQ
      else if (pathname.startsWith('/embed/')) {
        videoId = pathname.slice(7).split('?')[0]
      }
      // music.youtube.com: https://music.youtube.com/watch?v=dQw4w9WgXcQ
      else if (hostname.includes('music.youtube.com')) {
        videoId = searchParams.get('v') || pathname.match(/\/watch\/([^/?]+)/)?.[1]
      }

      if (videoId) {
        return {
          platform_name: 'youtube',
          platform_id: videoId,
          url
        }
      }
    }

    // SoundCloud
    if (hostname.includes('soundcloud.com')) {
      // URL formats:
      // - https://soundcloud.com/artist/track-name
      // - https://on.soundcloud.com/xyz (short links - use full path as ID)
      if (hostname === 'on.soundcloud.com') {
        return {
          platform_name: 'soundcloud',
          platform_id: pathname.slice(1), // Remove leading slash
          url
        }
      }

      // Regular SoundCloud URLs: use artist/track path as ID
      const pathParts = pathname.split('/').filter(p => p)
      if (pathParts.length >= 2) {
        return {
          platform_name: 'soundcloud',
          platform_id: pathParts.join('/'), // e.g., "artist/track-name"
          url
        }
      }
    }

    // Apple Music
    if (hostname.includes('music.apple.com') || hostname.includes('itunes.apple.com')) {
      // URL format: https://music.apple.com/us/album/track-name/123456789?i=987654321
      // Extract the track ID (i parameter) or album ID
      const trackId = searchParams.get('i')
      if (trackId) {
        return {
          platform_name: 'apple_music',
          platform_id: trackId,
          url
        }
      }

      // Album/Playlist ID from path
      const match = pathname.match(/\/(album|playlist)\/[^/]+\/(\d+)/)
      if (match) {
        return {
          platform_name: 'apple_music',
          platform_id: match[2],
          url
        }
      }
    }

    // Audius (decentralized music platform)
    if (hostname.includes('audius.co')) {
      // URL format: https://audius.co/artist/track-name-id
      const pathParts = pathname.split('/').filter(p => p)
      if (pathParts.length >= 2) {
        return {
          platform_name: 'audius',
          platform_id: pathParts.join('/'),
          url
        }
      }
    }

    // Song.link / Album.link (music aggregator)
    if (hostname.includes('song.link') || hostname.includes('album.link')) {
      // URL format: https://song.link/s/xyz or https://album.link/i/xyz
      // Use the path as the ID
      const pathId = pathname.slice(1)
      if (pathId) {
        return {
          platform_name: 'songlink',
          platform_id: pathId,
          url
        }
      }
    }

    // Beatport
    if (hostname.includes('beatport.com')) {
      // URL format: https://www.beatport.com/track/track-name/1234567
      const match = pathname.match(/\/track\/[^/]+\/(\d+)/)
      if (match) {
        return {
          platform_name: 'beatport',
          platform_id: match[1],
          url
        }
      }
    }

    // Hype Machine
    if (hostname.includes('hypem.com')) {
      // URL format: https://hypem.com/track/abc123
      const match = pathname.match(/\/track\/([a-zA-Z0-9]+)/)
      if (match) {
        return {
          platform_name: 'hypem',
          platform_id: match[1],
          url
        }
      }
    }

    // URL didn't match any known music platform
    return null
  } catch (error) {
    console.error('[URL Parser] Failed to parse URL:', url, error)
    return null
  }
}

/**
 * Check if a URL is from a known music platform
 * Uses the music_sources table domains for filtering
 *
 * NOTE: This is a fast client-side check. For more accurate filtering,
 * use isMusicUrlFromDatabase() which queries the music_sources table.
 */
export function isMusicUrl(url: string): boolean {
  const parsed = parseMusicUrl(url)
  return parsed !== null
}

/**
 * Check if URL domain exists in music_sources table
 * More accurate than isMusicUrl() but requires database query
 */
export async function isMusicUrlFromDatabase(url: string): Promise<boolean> {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase().replace('www.', '')

    // Dynamic import to avoid circular dependency
    const { getSupabaseClient } = await import('./api-utils')
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('music_sources')
      .select('domain')
      .eq('is_active', true)
      .or(`domain.eq.${hostname},domain.eq.www.${hostname}`)
      .limit(1)

    if (error) {
      console.warn('[URL Parser] Failed to query music_sources:', error)
      return false
    }

    return data && data.length > 0
  } catch (error) {
    console.error('[URL Parser] Error checking music_sources:', error)
    return false
  }
}

/**
 * Batch parse multiple URLs
 */
export function parseMusicUrls(urls: string[]): ParsedMusicUrl[] {
  return urls
    .map(url => parseMusicUrl(url))
    .filter((parsed): parsed is ParsedMusicUrl => parsed !== null)
}
