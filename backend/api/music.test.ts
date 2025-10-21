import { describe, it, expect } from 'bun:test'
import { Hono } from 'hono'
import musicApp from './music'

const app = new Hono()
app.route('/', musicApp)

describe('Music API', () => {
  describe('GET /trending', () => {
    it('should fetch trending tracks', async () => {
      const response = await app.request('/trending')

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data).toHaveProperty('tracks')
      expect(data).toHaveProperty('updatedAt')
      expect(Array.isArray(data.tracks)).toBe(true)
    })

    it('should support limit parameter', async () => {
      const response = await app.request('/trending?limit=5')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.tracks.length).toBeLessThanOrEqual(5)
    })

    it('should support timeframe parameter', async () => {
      const timeframes = ['7d', '30d', '90d']

      for (const timeframe of timeframes) {
        const response = await app.request(`/trending?timeframe=${timeframe}`)
        expect(response.status).toBe(200)
        const data = await response.json()
        expect(Array.isArray(data.tracks)).toBe(true)
      }
    })

    it('should return tracks with correct structure and DISTINCT counts', async () => {
      const response = await app.request('/trending?limit=10')

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.tracks.length > 0) {
        const track = data.tracks[0]

        // Check all required fields
        expect(track).toHaveProperty('rank')
        expect(track).toHaveProperty('id')
        expect(track).toHaveProperty('title')
        expect(track).toHaveProperty('artist')
        expect(track).toHaveProperty('platform')
        expect(track).toHaveProperty('platformId')
        expect(track).toHaveProperty('shares') // DISTINCT unique sharers
        expect(track).toHaveProperty('uniqueLikes') // DISTINCT unique likers
        expect(track).toHaveProperty('uniqueReplies') // DISTINCT unique repliers
        expect(track).toHaveProperty('score')

        // Validate types
        expect(typeof track.rank).toBe('number')
        expect(typeof track.title).toBe('string')
        expect(typeof track.artist).toBe('string')
        expect(typeof track.shares).toBe('number')
        expect(typeof track.uniqueLikes).toBe('number')
        expect(typeof track.uniqueReplies).toBe('number')
        expect(typeof track.score).toBe('number')

        // Validate data constraints
        expect(track.rank).toBeGreaterThan(0)
        expect(track.shares).toBeGreaterThanOrEqual(0)
        expect(track.uniqueLikes).toBeGreaterThanOrEqual(0)
        expect(track.uniqueReplies).toBeGreaterThanOrEqual(0)
      }
    })

    it('should return tracks in rank order by score', async () => {
      const response = await app.request('/trending?limit=10')

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.tracks.length > 1) {
        for (let i = 0; i < data.tracks.length - 1; i++) {
          expect(data.tracks[i].rank).toBe(i + 1)
          // Scores should be in descending order
          expect(data.tracks[i].score).toBeGreaterThanOrEqual(
            data.tracks[i + 1].score
          )
        }
      }
    })

    it('should calculate weighted engagement score correctly', async () => {
      const response = await app.request('/trending?limit=10')

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.tracks.length > 0) {
        const track = data.tracks[0]

        // Base weighted score (before velocity multiplier)
        const baseScore = (track.shares * 10) + (track.uniqueLikes * 3) + (track.uniqueReplies * 2)

        // Score should be >= base score (velocity multiplier is always >= 1)
        expect(track.score).toBeGreaterThanOrEqual(baseScore)
      }
    })

    it('should include recent casts for context', async () => {
      const response = await app.request('/trending?limit=10')

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.tracks.length > 0) {
        const track = data.tracks[0]
        expect(track).toHaveProperty('recentCasts')
        expect(Array.isArray(track.recentCasts)).toBe(true)

        if (track.recentCasts.length > 0) {
          const cast = track.recentCasts[0]
          expect(cast).toHaveProperty('castHash')
          expect(cast).toHaveProperty('text')
          expect(cast).toHaveProperty('author')
          expect(cast.author).toHaveProperty('fid')
          expect(cast.author).toHaveProperty('username')
        }
      }
    })

    it('should use 5-minute cache', async () => {
      const response1 = await app.request('/trending?limit=10')
      expect(response1.status).toBe(200)
      const data1 = await response1.json()

      // Second request should be cached
      const response2 = await app.request('/trending?limit=10')
      expect(response2.status).toBe(200)
      const data2 = await response2.json()

      // Should have same updatedAt timestamp (from cache)
      expect(data1.updatedAt).toBe(data2.updatedAt)

      // May have cached flag
      if (data2.cached !== undefined) {
        expect(data2.cached).toBe(true)
      }
    })

    it('should handle empty results gracefully', async () => {
      // Use a very long timeframe that might have no data
      const response = await app.request('/trending?timeframe=90d&limit=100')

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(Array.isArray(data.tracks)).toBe(true)
      expect(data).toHaveProperty('updatedAt')
    })
  })

  describe('GET /:musicId/casts', () => {
    it('should fetch casts for a specific track', async () => {
      // First get a trending track to get a valid musicId
      const trendingResponse = await app.request('/trending?limit=1')
      expect(trendingResponse.status).toBe(200)
      const trendingData = await trendingResponse.json()

      if (trendingData.tracks.length > 0) {
        const musicId = trendingData.tracks[0].id

        const response = await app.request(`/${musicId}/casts`)
        expect(response.status).toBe(200)

        const data = await response.json()
        expect(data).toHaveProperty('music')
        expect(data).toHaveProperty('casts')
        expect(Array.isArray(data.casts)).toBe(true)
      }
    })

    it('should return 400 for invalid musicId format', async () => {
      const response = await app.request('/invalid-id/casts')
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data.error.code).toBe('INVALID_REQUEST')
    })
  })
})
