// Shared types for Library API

export interface LibraryQuery {
  // User filtering
  users?: string[]
  networks?: string[]
  
  // Content filtering
  search?: string
  tags?: string[]
  sources?: string[]
  minEngagement?: number
  
  // Time filtering
  dateRange?: 'all' | 'today' | 'week' | 'month'
  after?: string  // ISO date string
  before?: string // ISO date string
  
  // User interaction filtering (Profile Mode)
  interactionType?: 'all' | 'shared' | 'liked' | 'conversations' | 'recasts'
  
  // Sorting & Pagination
  sortBy?: 'timestamp' | 'likes' | 'replies' | 'recasts' | 'artist' | 'title'
  sortDirection?: 'asc' | 'desc'
  limit?: number
  cursor?: string
  
  // New: Global sorting and aggregations support
  globalSort?: boolean
  returnFullDataset?: boolean
}

export interface Track {
  id: string
  title: string
  artist: string
  source: 'youtube' | 'spotify' | 'soundcloud'
  sourceId: string        // Video ID for YouTube, track ID for Spotify, etc.
  sourceUrl: string       // Full URL from embeds_metadata
  thumbnailUrl?: string
  duration?: number
  
  // Social context
  user: {
    username: string
    displayName: string
    avatar?: string
  }
  
  // Interaction data
  userInteraction: {
    type: 'shared' | 'liked' | 'conversation' | 'recast'
    timestamp: string     // ISO date
    context?: string      // Optional context/comment
  }
  
  // Social stats
  socialStats: {
    likes: number
    replies: number
    recasts: number
  }
  
  // Metadata
  tags?: string[]         // Genres, moods, etc.
  createdAt: string      // ISO date
}

export interface LibraryResponse {
  tracks: Track[]
  pagination: {
    hasMore: boolean
    nextCursor?: string
    total?: number        // Optional: only for small result sets
  }
  appliedFilters: LibraryQuery
  meta?: {
    queryTime: number     // Response time in ms
    cached: boolean       // Whether response was cached
  }
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}

// New: Aggregation types for library statistics
export interface ArtistData {
  name: string
  count: number
}

export interface GenreData {
  name: string
  count: number
}

export interface LibraryAggregations {
  artists: ArtistData[]
  genres: GenreData[]
  totalTracks: number
  appliedFilters: LibraryQuery
  meta?: {
    queryTime: number
    cached: boolean
  }
}