import { test, expect, describe } from 'bun:test'
import { LibraryAPI } from './library'
import type { LibraryResponse, ErrorResponse } from '../shared/types/library'

describe('Library API', () => {
  const api = new LibraryAPI()

  describe('GET /api/library', () => {
    test('should return valid response with default parameters', async () => {
      const request = new Request('http://localhost/api/library')
      const response = await api.handleRequest(request)
      
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toBe('application/json')
      
      const data: LibraryResponse = await response.json()
      expect(Array.isArray(data.tracks)).toBe(true)
      expect(typeof data.pagination.hasMore).toBe('boolean')
      expect(data.appliedFilters).toEqual({})
      expect(data.meta?.queryTime).toBeGreaterThanOrEqual(0)
      
      // If we have tracks, verify they have the right structure
      if (data.tracks.length > 0) {
        const track = data.tracks[0]
        expect(track.id).toBeDefined()
        expect(track.title).toBeDefined()
        expect(track.artist).toBeDefined()
        expect(track.source).toBeDefined()
        expect(track.user).toBeDefined()
        expect(track.socialStats).toBeDefined()
      }
    })

    test('should parse query parameters correctly', async () => {
      const url = 'http://localhost/api/library?search=nirvana&sources=youtube,spotify&limit=20&sortBy=likes'
      const request = new Request(url)
      const response = await api.handleRequest(request)
      
      expect(response.status).toBe(200)
      
      const data: LibraryResponse = await response.json()
      expect(data.appliedFilters.search).toBe('nirvana')
      expect(data.appliedFilters.sources).toEqual(['youtube', 'spotify'])
      expect(data.appliedFilters.limit).toBe(20)
      expect(data.appliedFilters.sortBy).toBe('likes')
    })

    test('should parse array parameters correctly', async () => {
      const url = 'http://localhost/api/library?users=user1,user2&tags=grunge,alternative'
      const request = new Request(url)
      const response = await api.handleRequest(request)
      
      const data: LibraryResponse = await response.json()
      expect(data.appliedFilters.users).toEqual(['user1', 'user2'])
      expect(data.appliedFilters.tags).toEqual(['grunge', 'alternative'])
    })

    test('should parse numeric parameters correctly', async () => {
      const url = 'http://localhost/api/library?minEngagement=5&limit=50'
      const request = new Request(url)
      const response = await api.handleRequest(request)
      
      const data: LibraryResponse = await response.json()
      expect(data.appliedFilters.minEngagement).toBe(5)
      expect(data.appliedFilters.limit).toBe(50)
    })

    test('should parse date filtering parameters', async () => {
      const url = 'http://localhost/api/library?dateRange=week&after=2024-01-01&before=2024-12-31'
      const request = new Request(url)
      const response = await api.handleRequest(request)
      
      const data: LibraryResponse = await response.json()
      expect(data.appliedFilters.dateRange).toBe('week')
      expect(data.appliedFilters.after).toBe('2024-01-01')
      expect(data.appliedFilters.before).toBe('2024-12-31')
    })
  })

  describe('POST /api/library', () => {
    test('should handle JSON body correctly', async () => {
      const body = {
        users: ['user1', 'user2'],
        search: 'test search',
        limit: 25
      }
      
      const request = new Request('http://localhost/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const response = await api.handleRequest(request)
      expect(response.status).toBe(200)
      
      const data: LibraryResponse = await response.json()
      expect(data.appliedFilters.users).toEqual(['user1', 'user2'])
      expect(data.appliedFilters.search).toBe('test search')
      expect(data.appliedFilters.limit).toBe(25)
    })

    test('should return error for invalid JSON', async () => {
      const request = new Request('http://localhost/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      })
      
      const response = await api.handleRequest(request)
      expect(response.status).toBe(400)
      
      const data: ErrorResponse = await response.json()
      expect(data.error.code).toBe('INVALID_JSON')
      expect(data.error.message).toBe('Invalid JSON in request body')
      expect(data.timestamp).toBeDefined()
    })
  })

  describe('Error handling', () => {
    test('should return 405 for unsupported methods', async () => {
      const request = new Request('http://localhost/api/library', {
        method: 'DELETE'
      })
      
      const response = await api.handleRequest(request)
      expect(response.status).toBe(405)
      
      const data: ErrorResponse = await response.json()
      expect(data.error.code).toBe('METHOD_NOT_ALLOWED')
    })
  })

  describe('Response format', () => {
    test('should include all required response fields', async () => {
      const request = new Request('http://localhost/api/library')
      const response = await api.handleRequest(request)
      
      const data: LibraryResponse = await response.json()
      
      // Check required fields
      expect(data.tracks).toBeDefined()
      expect(Array.isArray(data.tracks)).toBe(true)
      
      expect(data.pagination).toBeDefined()
      expect(typeof data.pagination.hasMore).toBe('boolean')
      
      expect(data.appliedFilters).toBeDefined()
      expect(typeof data.appliedFilters).toBe('object')
      
      // Check optional meta field
      if (data.meta) {
        expect(typeof data.meta.queryTime).toBe('number')
        expect(typeof data.meta.cached).toBe('boolean')
      }
    })
  })
})