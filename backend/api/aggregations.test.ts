import { test, expect, describe } from 'bun:test'
import { AggregationsAPI } from './aggregations'
import type { LibraryAggregations, ErrorResponse } from '../../shared/types/library'

describe('Aggregations API', () => {
  const api = new AggregationsAPI()

  describe('GET /api/aggregations', () => {
    test('should return valid response with default parameters', async () => {
      const request = new Request('http://localhost/api/aggregations')
      const response = await api.handleRequest(request)
      
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toBe('application/json')
      
      const data: LibraryAggregations = await response.json()
      expect(Array.isArray(data.artists)).toBe(true)
      expect(Array.isArray(data.genres)).toBe(true)
      expect(typeof data.totalTracks).toBe('number')
      expect(data.appliedFilters).toEqual({})
      expect(data.meta?.queryTime).toBeGreaterThanOrEqual(0)
      
      // Validate artist structure
      if (data.artists.length > 0) {
        const artist = data.artists[0]
        expect(artist.name).toBeDefined()
        expect(typeof artist.count).toBe('number')
      }
      
      // Validate genre structure  
      if (data.genres.length > 0) {
        const genre = data.genres[0]
        expect(genre.name).toBeDefined()
        expect(typeof genre.count).toBe('number')
      }
    })

    test('should parse query parameters correctly', async () => {
      const url = 'http://localhost/api/aggregations?dateRange=week&sources=youtube,spotify'
      const request = new Request(url)
      const response = await api.handleRequest(request)
      
      expect(response.status).toBe(200)
      
      const data: LibraryAggregations = await response.json()
      expect(data.appliedFilters.dateRange).toBe('week')
      expect(data.appliedFilters.sources).toEqual(['youtube', 'spotify'])
    })

    test('should handle time filtering parameters', async () => {
      const url = 'http://localhost/api/aggregations?dateRange=month&after=2024-01-01'
      const request = new Request(url)
      const response = await api.handleRequest(request)
      
      const data: LibraryAggregations = await response.json()
      expect(data.appliedFilters.dateRange).toBe('month')
      expect(data.appliedFilters.after).toBe('2024-01-01')
    })
  })

  describe('POST /api/aggregations', () => {
    test('should handle JSON body correctly', async () => {
      const body = {
        users: ['user1', 'user2'],
        dateRange: 'week' as const,
        sources: ['youtube', 'spotify']
      }
      
      const request = new Request('http://localhost/api/aggregations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const response = await api.handleRequest(request)
      expect(response.status).toBe(200)
      
      const data: LibraryAggregations = await response.json()
      expect(data.appliedFilters.users).toEqual(['user1', 'user2'])
      expect(data.appliedFilters.dateRange).toBe('week')
      expect(data.appliedFilters.sources).toEqual(['youtube', 'spotify'])
    })

    test('should return error for invalid JSON', async () => {
      const request = new Request('http://localhost/api/aggregations', {
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

  describe('Complex filtering logic', () => {
    test('should detect complex filters correctly', async () => {
      const body = {
        users: ['user1'],
        search: 'test'
      }
      
      const request = new Request('http://localhost/api/aggregations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const response = await api.handleRequest(request)
      expect(response.status).toBe(200)
      
      const data: LibraryAggregations = await response.json()
      expect(data.appliedFilters.users).toEqual(['user1'])
      expect(data.appliedFilters.search).toBe('test')
    })

    test('should handle simple time-only filters correctly', async () => {
      const body = {
        dateRange: 'week' as const
      }
      
      const request = new Request('http://localhost/api/aggregations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const response = await api.handleRequest(request)
      expect(response.status).toBe(200)
      
      const data: LibraryAggregations = await response.json()
      expect(data.appliedFilters.dateRange).toBe('week')
    })
  })

  describe('Error handling', () => {
    test('should return 405 for unsupported methods', async () => {
      const request = new Request('http://localhost/api/aggregations', {
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
      const request = new Request('http://localhost/api/aggregations')
      const response = await api.handleRequest(request)
      
      const data: LibraryAggregations = await response.json()
      
      // Check required fields
      expect(data.artists).toBeDefined()
      expect(Array.isArray(data.artists)).toBe(true)
      
      expect(data.genres).toBeDefined()
      expect(Array.isArray(data.genres)).toBe(true)
      
      expect(data.totalTracks).toBeDefined()
      expect(typeof data.totalTracks).toBe('number')
      
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