import { describe, it, expect } from 'bun:test'
import { Hono } from 'hono'
import trendingApp from './trending'

const app = new Hono()
app.route('/', trendingApp)

describe('Trending API', () => {
  describe('GET /users', () => {
    it('should fetch trending users/contributors', async () => {
      const response = await app.request('/users')

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data).toHaveProperty('contributors')
      expect(data).toHaveProperty('updatedAt')
      expect(Array.isArray(data.contributors)).toBe(true)
    })

    it('should support limit parameter', async () => {
      const response = await app.request('/users?limit=5')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.contributors.length).toBeLessThanOrEqual(5)
    })

    it('should return contributors with correct structure', async () => {
      const response = await app.request('/users?limit=10')

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.contributors.length > 0) {
        const contributor = data.contributors[0]

        // Check all required fields
        expect(contributor).toHaveProperty('rank')
        expect(contributor).toHaveProperty('fid')
        expect(contributor).toHaveProperty('username')
        expect(contributor).toHaveProperty('displayName')
        expect(contributor).toHaveProperty('avatar')
        expect(contributor).toHaveProperty('trackCount')
        expect(contributor).toHaveProperty('uniqueEngagers')
        expect(contributor).toHaveProperty('score')

        // Validate types
        expect(typeof contributor.rank).toBe('number')
        expect(typeof contributor.fid).toBe('string')
        expect(typeof contributor.username).toBe('string')
        expect(typeof contributor.trackCount).toBe('number')
        expect(typeof contributor.uniqueEngagers).toBe('number')
        expect(typeof contributor.score).toBe('number')

        // Validate data constraints
        expect(contributor.rank).toBeGreaterThan(0)
        expect(contributor.trackCount).toBeGreaterThan(0)
        expect(contributor.uniqueEngagers).toBeGreaterThanOrEqual(0)
      }
    })

    it('should return contributors in rank order', async () => {
      const response = await app.request('/users?limit=10')

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.contributors.length > 1) {
        for (let i = 0; i < data.contributors.length - 1; i++) {
          expect(data.contributors[i].rank).toBe(i + 1)
          // Scores should be in descending order
          expect(data.contributors[i].score).toBeGreaterThanOrEqual(
            data.contributors[i + 1].score
          )
        }
      }
    })

    it('should use quality-adjusted scoring (unique_engagers / sqrt(track_count))', async () => {
      const response = await app.request('/users?limit=10')

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.contributors.length > 0) {
        const contributor = data.contributors[0]

        // Manually calculate expected score
        const expectedScore = contributor.uniqueEngagers / Math.sqrt(contributor.trackCount)

        // Should be close (allowing for rounding)
        expect(Math.abs(contributor.score - expectedScore)).toBeLessThan(0.01)
      }
    })

    it('should use 5-minute cache', async () => {
      const response1 = await app.request('/users?limit=10')
      expect(response1.status).toBe(200)
      const data1 = await response1.json()

      // Second request should be cached
      const response2 = await app.request('/users?limit=10')
      expect(response2.status).toBe(200)
      const data2 = await response2.json()

      // Should have same updatedAt timestamp (from cache)
      expect(data1.updatedAt).toBe(data2.updatedAt)

      // May have cached flag
      if (data2.cached !== undefined) {
        expect(data2.cached).toBe(true)
      }
    })
  })
})
