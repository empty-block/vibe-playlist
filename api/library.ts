import type { LibraryQuery, LibraryResponse, ErrorResponse } from '../shared/types/library'
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
      const { tracks, hasMore, nextCursor } = await this.db.queryLibrary(query)

      const response: LibraryResponse = {
        tracks,
        pagination: {
          hasMore,
          nextCursor,
          // Only include total for small result sets to avoid expensive counts
          total: tracks.length < 50 ? tracks.length : undefined
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