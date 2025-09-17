import type { LibraryQuery, LibraryResponse, LibraryAggregations, Track as ApiTrack } from '../../../shared/types/library'
import type { Track as FrontendTrack } from '../stores/playerStore'
import type { LibraryFilters } from '../stores/libraryStore'

export class LibraryApiService {
  private baseUrl = 'http://localhost:4201/api'

  async getAllTracks(): Promise<FrontendTrack[]> {
    // Use PostgreSQL sort function with default timestamp sorting to get complete data
    const response = await this.queryLibrary({
      sortBy: 'timestamp',
      sortDirection: 'desc',
      globalSort: true
    })
    return response.tracks
  }

  async getFilteredTracks(
    filters: LibraryFilters, 
    options: { globalSort?: boolean } = {}
  ): Promise<{
    tracks: FrontendTrack[]
    pagination: LibraryResponse['pagination']
    meta: LibraryResponse['meta']
  }> {
    const query: LibraryQuery = {
      ...this.convertFiltersToQuery(filters),
      globalSort: options.globalSort,
      useServerSideSearch: this.shouldUseServerSideSearch(filters),
      useServerSideSort: this.shouldUseServerSideSort(filters),
      includeEngagementMetrics: true
    }
    const response = await this.queryLibrary(query)
    
    return {
      tracks: response.tracks,
      pagination: response.pagination,
      meta: response.meta
    }
  }

  async getLibraryAggregations(filters: LibraryFilters): Promise<LibraryAggregations> {
    const query = this.convertFiltersToQuery(filters)
    
    try {
      const response = await fetch(`${this.baseUrl}/library/aggregations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
      })

      if (!response.ok) {
        throw new Error(`Aggregations API request failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Library aggregations error:', error)
      throw error
    }
  }

  async queryLibrary(query: LibraryQuery): Promise<{
    tracks: FrontendTrack[]
    pagination: LibraryResponse['pagination']
    meta: LibraryResponse['meta']
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/library`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query)
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data: LibraryResponse = await response.json()
      
      console.log('Raw API response first track:', data.tracks[0])
      
      const transformedTracks = data.tracks.map(track => {
        const transformed = this.convertApiTrackToFrontendTrack(track)
        console.log('Transformed track:', transformed)
        return transformed
      })
      
      return {
        tracks: transformedTracks,
        pagination: data.pagination,
        meta: data.meta
      }
    } catch (error) {
      console.error('Library API error:', error)
      throw error
    }
  }

  // Add method to determine when to use server-side functions
  private shouldUseServerSideSearch(filters: LibraryFilters): boolean {
    // Use server-side search for:
    // 1. Any search query
    // 2. Artist filtering
    // 3. Genre filtering
    return !!(
      filters.search?.trim() ||
      filters.selectedArtist ||  // NEW: Artist filtering
      filters.selectedGenre     // NEW: Genre filtering
    )
  }

  private shouldUseServerSideSort(filters: LibraryFilters): boolean {
    // Use server-side sort for:
    // 1. Engagement-based sorting (determined elsewhere)
    // 2. When global sort is explicitly requested (passed via options)
    return false // Default to false, will be overridden by globalSort option
  }

  private convertFiltersToQuery(filters: LibraryFilters): LibraryQuery {
    const query: LibraryQuery = {}

    // Existing filters
    if (filters.search.trim()) {
      query.search = filters.search.trim()
    }

    if (filters.platform !== 'all') {
      query.sources = [filters.platform]
    }

    if (filters.dateRange !== 'all') {
      query.dateRange = filters.dateRange
    }

    if (filters.minEngagement > 0) {
      query.minEngagement = filters.minEngagement
    }

    // NEW: Browse filters
    if (filters.selectedArtist) {
      // Use search field for artist filtering to leverage PostgreSQL search
      const artistSearch = filters.selectedArtist.trim()
      if (query.search) {
        // Combine with existing search
        query.search = `${query.search} ${artistSearch}`
      } else {
        query.search = artistSearch
      }
    }

    if (filters.selectedGenre) {
      // Use tags field for genre filtering
      query.tags = [filters.selectedGenre]
    }

    return query
  }

  private convertApiTrackToFrontendTrack(apiTrack: ApiTrack): FrontendTrack {
    // Map the new API Track format to the existing frontend Track interface
    return {
      id: apiTrack.id,
      title: apiTrack.title,
      artist: apiTrack.artist,
      duration: apiTrack.duration || '0:00', // Frontend expects string format
      source: this.mapSourceToTrackSource(apiTrack.source),
      sourceId: this.extractSourceId(apiTrack.sourceUrl, apiTrack.source),
      thumbnail: apiTrack.thumbnailUrl || '/placeholder-album.png',
      addedBy: apiTrack.user.username,
      userAvatar: apiTrack.user.avatar || '🎵',
      timestamp: this.formatTimestamp(apiTrack.userInteraction.timestamp),
      comment: apiTrack.userInteraction.context || '',
      likes: apiTrack.socialStats.likes,
      replies: apiTrack.socialStats.replies,
      recasts: apiTrack.socialStats.recasts,
      tags: apiTrack.tags,
      
      // Legacy compatibility
      videoId: apiTrack.source === 'youtube' ? this.extractSourceId(apiTrack.sourceUrl, 'youtube') : undefined
    }
  }

  private mapSourceToTrackSource(source: ApiTrack['source']): FrontendTrack['source'] {
    // Map API sources to frontend TrackSource enum
    switch (source) {
      case 'youtube':
        return 'youtube'
      case 'spotify':
        return 'spotify'
      case 'soundcloud':
        return 'soundcloud'
      default:
        return 'youtube' // Default fallback
    }
  }

  private extractSourceId(sourceUrl: string, source: string): string {
    if (!sourceUrl) return ''
    
    try {
      if (source === 'youtube') {
        // Extract YouTube video ID from URL
        const match = sourceUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
        return match?.[1] || ''
      } else if (source === 'spotify') {
        // Extract Spotify track ID from URL
        const match = sourceUrl.match(/spotify\.com\/track\/([^?\n#]+)/)
        return match?.[1] || ''
      }
      return sourceUrl
    } catch {
      return ''
    }
  }

  private formatTimestamp(isoTimestamp: string): string {
    // Convert ISO timestamp to relative time format expected by frontend
    try {
      const date = new Date(isoTimestamp)
      const now = new Date()
      const diffInMs = now.getTime() - date.getTime()
      
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

      if (diffInMinutes < 60) {
        return diffInMinutes <= 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`
      } else if (diffInHours < 24) {
        return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`
      } else if (diffInDays < 7) {
        return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`
      } else {
        return date.toLocaleDateString()
      }
    } catch {
      return 'unknown'
    }
  }
}

// Export singleton instance
export const libraryApiService = new LibraryApiService()