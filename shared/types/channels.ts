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
