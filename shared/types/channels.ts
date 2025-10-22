/**
 * Shared type definitions for channels
 * Used by both frontend and backend
 */

export interface Channel {
  id: string
  name: string
  description: string
  isOfficial: boolean
  iconUrl?: string
  colorHex?: string
  stats: {
    threadCount: number
    lastActivity?: string
  }
}

export interface ChannelDetails extends Channel {
  bannerUrl?: string
  stats: {
    threadCount: number
    totalLikes: number
    totalReplies: number
    uniqueContributors: number
    lastActivity?: string
  }
  createdAt: string
}

export type ChannelSortOption = 'hot' | 'active' | 'a-z'

/**
 * Sort options for channel feed (threads within a channel)
 */
export type ChannelFeedSortOption = 'recent' | 'popular_24h' | 'popular_7d' | 'all_time' | 'shuffle'

/**
 * Music platforms available for filtering
 */
export type MusicPlatform = 'spotify' | 'youtube' | 'apple_music' | 'soundcloud' | 'songlink' | 'audius' | 'bandcamp'

/**
 * Filters for channel feed
 */
export interface ChannelFeedFilters {
  sort?: ChannelFeedSortOption
  minLikes?: number
  musicSources?: MusicPlatform[]
  genres?: string[]
}
