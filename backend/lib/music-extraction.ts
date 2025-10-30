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

