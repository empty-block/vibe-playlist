import type { LibraryQuery, LibraryResponse, ErrorResponse, Track } from '../../shared/types/library'
import { DatabaseService } from './database'

export class LibraryAPI {
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
      console.error('Library API error:', error)
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
    return await this.executeQuery(query)
  }

  private async handlePost(request: Request): Promise<Response> {
    try {
      const body = await request.json() as LibraryQuery
      return await this.executeQuery(body)
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

    // Sorting & Pagination
    const sortBy = searchParams.get('sortBy') as LibraryQuery['sortBy']
    if (sortBy) query.sortBy = sortBy

    const sortDirection = searchParams.get('sortDirection') as LibraryQuery['sortDirection']
    if (sortDirection) query.sortDirection = sortDirection

    const limit = searchParams.get('limit')
    if (limit) query.limit = parseInt(limit, 10)

    const cursor = searchParams.get('cursor')
    if (cursor) query.cursor = cursor

    return query
  }

  private async executeQuery(query: LibraryQuery): Promise<Response> {
    const startTime = Date.now()

    try {
      let tracks: any[]
      let hasMore: boolean
      let nextCursor: string | undefined
      let totalTracks: number | undefined

      if (query.globalSort) {
        // Get full dataset, sort, then paginate
        const fullResult = await this.db.queryLibrary({
          ...query,
          limit: undefined,
          cursor: undefined,
          returnFullDataset: true
        })
        
        // Apply sorting to full dataset
        const sortedTracks = this.applySorting(fullResult.tracks, query)
        
        // Apply pagination to sorted results
        const paginationResult = this.applyPagination(
          sortedTracks, 
          query.limit || 50, 
          query.cursor
        )
        
        tracks = paginationResult.paginatedTracks
        hasMore = paginationResult.hasMore
        nextCursor = paginationResult.nextCursor
        totalTracks = sortedTracks.length
      } else {
        // Existing behavior - paginate then sort (limited)
        const result = await this.db.queryLibrary(query)
        tracks = result.tracks
        hasMore = result.hasMore
        nextCursor = result.nextCursor
        totalTracks = tracks.length < 50 ? tracks.length : undefined
      }

      const response: LibraryResponse = {
        tracks,
        pagination: {
          hasMore,
          nextCursor,
          total: totalTracks
        },
        appliedFilters: query,
        meta: {
          queryTime: Date.now() - startTime,
          cached: false
        }
      }

      return new Response(JSON.stringify(response), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    } catch (error) {
      console.error('Query execution error:', error)
      return this.errorResponse('QUERY_ERROR', 'Failed to execute query', 500)
    }
  }

  private applySorting(tracks: Track[], query: LibraryQuery): Track[] {
    const sortBy = query.sortBy || 'timestamp'
    const sortDirection = query.sortDirection || 'desc'
    
    const sortedTracks = [...tracks].sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'timestamp':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'artist':
          comparison = (a.artist || '').localeCompare(b.artist || '')
          break
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '')
          break
        case 'likes':
          comparison = a.socialStats.likes - b.socialStats.likes
          break
        case 'replies':
          comparison = a.socialStats.replies - b.socialStats.replies
          break
        case 'recasts':
          comparison = a.socialStats.recasts - b.socialStats.recasts
          break
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })
    
    return sortedTracks
  }

  private applyPagination(tracks: Track[], limit: number, cursor?: string): {
    paginatedTracks: Track[]
    hasMore: boolean
    nextCursor?: string
  } {
    let startIndex = 0
    
    // Handle cursor-based pagination for globally sorted results
    if (cursor) {
      try {
        const cursorData = JSON.parse(atob(cursor))
        // Find the index of the track with this ID
        startIndex = tracks.findIndex(track => track.id === cursorData.trackId)
        if (startIndex >= 0) {
          startIndex += 1 // Start from the next track
        } else {
          startIndex = 0 // Fallback if cursor track not found
        }
      } catch (error) {
        console.warn('Invalid cursor provided:', cursor)
        startIndex = 0
      }
    }
    
    const endIndex = startIndex + limit
    const paginatedTracks = tracks.slice(startIndex, endIndex)
    const hasMore = endIndex < tracks.length
    
    let nextCursor: string | undefined
    if (hasMore && paginatedTracks.length > 0) {
      const lastTrack = paginatedTracks[paginatedTracks.length - 1]
      nextCursor = btoa(JSON.stringify({ 
        trackId: lastTrack.id,
        createdAt: lastTrack.createdAt
      }))
    }
    
    return {
      paginatedTracks,
      hasMore,
      nextCursor
    }
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