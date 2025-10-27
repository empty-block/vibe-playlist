import { createClient } from '@supabase/supabase-js'
import { MOCK_MUSIC } from './test-data'

/**
 * Mock music metadata extraction
 * In production, this would call Claude API to parse URLs
 * For MVP, returns hardcoded metadata based on URL patterns
 */

interface MusicMetadata {
  platform: 'spotify' | 'youtube' | 'soundcloud' | 'apple_music'
  platform_id: string
  artist: string
  title: string
  album?: string
  duration?: number
  thumbnail_url?: string
  url: string
}

/**
 * Detects music platform from URL
 */
function detectPlatform(url: string): { platform: string; platformId: string } | null {
  // Spotify
  if (url.includes('spotify.com/track/')) {
    const match = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/)
    if (match) return { platform: 'spotify', platformId: match[1] }
  }

  // YouTube
  if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    if (match) return { platform: 'youtube', platformId: match[1] }
  }

  // SoundCloud
  if (url.includes('soundcloud.com/')) {
    const match = url.match(/soundcloud\.com\/([^/]+)\/([^/?]+)/)
    if (match) return { platform: 'soundcloud', platformId: `${match[1]}/${match[2]}` }
  }

  // Apple Music
  if (url.includes('music.apple.com/')) {
    const match = url.match(/music\.apple\.com\/[^/]+\/album\/[^/]+\/(\d+)\?i=(\d+)/)
    if (match) return { platform: 'apple_music', platformId: match[2] }
  }

  return null
}

/**
 * Mock extraction of music metadata from URL
 * Returns mock data based on detected platform
 */
export function extractMusicMetadataFromUrl(url: string): MusicMetadata | null {
  const detected = detectPlatform(url)
  if (!detected) return null

  const { platform, platformId } = detected
  const mockData = MOCK_MUSIC[platform as keyof typeof MOCK_MUSIC] || MOCK_MUSIC.spotify

  return {
    platform: platform as MusicMetadata['platform'],
    platform_id: platformId,
    artist: mockData.artist,
    title: mockData.title,
    album: 'album' in mockData ? mockData.album : undefined,
    duration: mockData.duration,
    thumbnail_url: mockData.thumbnail_url,
    url
  }
}

/**
 * Process and store music metadata for a cast
 * Fire-and-forget async function (doesn't block response)
 */
export async function extractAndStoreMusicMetadata(
  castId: string,
  trackUrls: string[]
): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_ENV === 'local'
    ? process.env.SUPABASE_LOCAL_URL!
    : process.env.SUPABASE_URL!

  const supabaseKey = process.env.SUPABASE_ENV === 'local'
    ? process.env.SUPABASE_LOCAL_KEY!
    : process.env.SUPABASE_KEY!

  const supabase = createClient(supabaseUrl, supabaseKey)

  for (const url of trackUrls) {
    const metadata = extractMusicMetadataFromUrl(url)
    if (!metadata) continue

    try {
      // Upsert to music_library (deduplicates by platform + platform_id)
      const { data: musicData, error: musicError } = await supabase
        .from('music_library')
        .upsert({
          platform: metadata.platform,
          platform_id: metadata.platform_id,
          artist: metadata.artist,
          title: metadata.title,
          album: metadata.album,
          duration: metadata.duration,
          thumbnail_url: metadata.thumbnail_url,
          url: metadata.url,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'platform,platform_id',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (musicError && musicError.code !== '23505') {
        // Ignore duplicate key errors, log others
        console.error('Error upserting music:', musicError)
        continue
      }

      // Create cast_music_edges linking cast to music
      const { error: edgeError } = await supabase
        .from('cast_music_edges')
        .insert({
          cast_id: castId,
          music_platform: metadata.platform,
          music_platform_id: metadata.platform_id,
          created_at: new Date().toISOString()
        })

      if (edgeError && edgeError.code !== '23505') {
        // Ignore duplicate key errors
        console.error('Error creating cast_music_edge:', edgeError)
      }
    } catch (error) {
      console.error('Error processing music metadata:', error)
    }
  }
}
