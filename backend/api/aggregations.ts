import type { LibraryQuery, LibraryAggregations, ArtistData, GenreData, Track, ErrorResponse } from '../../shared/types/library'
import { DatabaseService } from './database'

export class AggregationsAPI {
  private db: DatabaseService

  constructor() {
    this.db = new DatabaseService()
  }

  async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const method = request.method

    try {
      if (method === 'OPTIONS') {
        return this.handleOptions()
      } else if (method === 'GET') {
        return await this.handleGet(url)
      } else if (method === 'POST') {
        return await this.handlePost(request)
      } else {
        return this.errorResponse('METHOD_NOT_ALLOWED', 'Method not allowed', 405)
      }
    } catch (error) {
      console.error('Aggregations API error:', error)
      return this.errorResponse('INTERNAL_ERROR', 'Internal server error', 500)
    }
  }

  private handleOptions(): Response {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    })
  }

  private async handleGet(url: URL): Promise<Response> {
    const query = this.parseQueryParams(url.searchParams)
    return await this.generateAggregations(query)
  }

  private async handlePost(request: Request): Promise<Response> {
    try {
      const body = await request.json() as LibraryQuery
      return await this.generateAggregations(body)
    } catch (error) {
      return this.errorResponse('INVALID_JSON', 'Invalid JSON in request body', 400)
    }
  }

  private parseQueryParams(searchParams: URLSearchParams): LibraryQuery {
    const query: LibraryQuery = {}

    // User filtering
    const users = searchParams.get('users')
    if (users) query.users = users.split(',')
    
    const networks = searchParams.get('networks')
    if (networks) query.networks = networks.split(',')

    // Content filtering
    const search = searchParams.get('search')
    if (search) query.search = search

    const tags = searchParams.get('tags')
    if (tags) query.tags = tags.split(',')

    const sources = searchParams.get('sources')
    if (sources) query.sources = sources.split(',')

    const minEngagement = searchParams.get('minEngagement')
    if (minEngagement) query.minEngagement = parseInt(minEngagement, 10)

    // Time filtering
    const dateRange = searchParams.get('dateRange') as LibraryQuery['dateRange']
    if (dateRange) query.dateRange = dateRange

    const after = searchParams.get('after')
    if (after) query.after = after

    const before = searchParams.get('before')
    if (before) query.before = before

    // User interaction filtering
    const interactionType = searchParams.get('interactionType') as LibraryQuery['interactionType']
    if (interactionType) query.interactionType = interactionType

    return query
  }

  private async generateAggregations(query: LibraryQuery): Promise<Response> {
    const startTime = Date.now()

    try {
      // Check if we have complex filters that PostgreSQL functions don't support
      const hasComplexFilters = this.hasComplexFilters(query)
      
      let artists: ArtistData[]
      let genres: GenreData[]
      let totalTracks: number
      
      if (hasComplexFilters) {
        // Fallback to client-side aggregation for complex filters
        const { tracks } = await this.db.queryLibrary({
          ...query,
          limit: undefined,
          cursor: undefined,
          returnFullDataset: true
        })
        
        artists = this.extractArtistsFromTracks(tracks)
        genres = this.extractGenresFromTracks(tracks)
        totalTracks = tracks.length
      } else {
        // Use PostgreSQL functions for simple time-only filtering
        const timeFilter = this.convertQueryToTimeFilter(query)
        
        const [artistsResult, genresResult, totalTracksResult] = await Promise.all([
          this.db.getTopArtistsByTimeRange(timeFilter),
          this.db.getTopGenresByTimeRange(timeFilter),
          this.getTotalTracksCount(query)
        ])
        
        artists = artistsResult
        genres = genresResult
        totalTracks = totalTracksResult
      }

      const aggregations: LibraryAggregations = {
        artists,
        genres,
        totalTracks,
        appliedFilters: query,
        meta: {
          queryTime: Date.now() - startTime,
          cached: false
        }
      }

      return new Response(JSON.stringify(aggregations), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    } catch (error) {
      console.error('Aggregations generation error:', error)
      return this.errorResponse('AGGREGATION_ERROR', 'Failed to generate aggregations', 500)
    }
  }

  private hasComplexFilters(query: LibraryQuery): boolean {
    // Check for filters that PostgreSQL functions don't currently support
    return !!(
      query.users?.length ||
      query.networks?.length ||
      query.search ||
      query.tags?.length ||
      query.sources?.length ||
      query.minEngagement ||
      query.interactionType ||
      query.before  // before filters need special handling
    )
  }

  private convertQueryToTimeFilter(query: LibraryQuery): string | undefined {
    // Handle dateRange filters
    if (query.dateRange) {
      const now = new Date()
      let afterDate: Date
      
      switch (query.dateRange) {
        case 'today':
          afterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          afterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          afterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'all':
        default:
          return undefined // No time filter
      }
      
      return afterDate.toISOString()
    }
    
    // Handle explicit after/before filters
    if (query.after) {
      return query.after
    }
    
    // For before filters or no time constraints, return undefined
    return undefined
  }

  private async getTotalTracksCount(query: LibraryQuery): Promise<number> {
    try {
      // For now, get count by querying with the same filters
      // This could be optimized with a dedicated count function later
      const { tracks } = await this.db.queryLibrary({
        ...query,
        limit: undefined,
        cursor: undefined,
        returnFullDataset: true
      })
      
      return tracks.length
    } catch (error) {
      console.error('Error getting total tracks count:', error)
      return 0
    }
  }

  private extractArtistsFromTracks(tracks: Track[]): ArtistData[] {
    const artistCounts = new Map<string, number>()

    tracks.forEach(track => {
      const artist = track.artist
      if (artist) {
        artistCounts.set(artist, (artistCounts.get(artist) || 0) + 1)
      }
    })

    return Array.from(artistCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count) // Sort by count descending
  }

  private extractGenresFromTracks(tracks: Track[]): GenreData[] {
    const genreCounts = new Map<string, number>()

    tracks.forEach(track => {
      if (track.tags) {
        track.tags.forEach(tag => {
          genreCounts.set(tag, (genreCounts.get(tag) || 0) + 1)
        })
      }
    })

    return Array.from(genreCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count) // Sort by count descending
  }

  private errorResponse(code: string, message: string, status: number): Response {
    const error: ErrorResponse = {
      error: { code, message },
      timestamp: new Date().toISOString()
    }

    return new Response(JSON.stringify(error), {
      status,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }
}