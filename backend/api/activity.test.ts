import { describe, it, expect } from 'bun:test'
import { Hono } from 'hono'
import activityApp from './activity'

const app = new Hono()
app.route('/', activityApp)

describe('Activity API', () => {
  describe('GET /', () => {
    it('should fetch global activity feed', async () => {
      const response = await app.request('/')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('activity')
      expect(Array.isArray(data.activity)).toBe(true)

      // Check rate limit headers
      expect(response.headers.get('X-RateLimit-Limit')).toBe('100')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('99')
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
    })

    it('should support pagination with limit', async () => {
      const response = await app.request('/?limit=25')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.activity.length).toBeLessThanOrEqual(25)
    })

    it('should include activity type, user, cast, and timestamp', async () => {
      const response = await app.request('/')

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.activity.length > 0) {
        const activity = data.activity[0]
        expect(activity).toHaveProperty('type')
        expect(activity).toHaveProperty('user')
        expect(activity).toHaveProperty('cast')
        expect(activity).toHaveProperty('timestamp')

        // Check user object
        expect(activity.user).toHaveProperty('fid')
        expect(activity.user).toHaveProperty('username')
        expect(activity.user).toHaveProperty('displayName')

        // Check cast object
        expect(activity.cast).toHaveProperty('castHash')
        expect(activity.cast).toHaveProperty('text')
        expect(activity.cast).toHaveProperty('author')
        expect(activity.cast).toHaveProperty('music')
        expect(activity.cast).toHaveProperty('stats')

        // Check stats
        expect(activity.cast.stats).toHaveProperty('likes')
        expect(activity.cast.stats).toHaveProperty('replies')
        expect(activity.cast.stats).toHaveProperty('recasts')
      }
    })

    it('should support cursor-based pagination', async () => {
      const response = await app.request('/?limit=10')
      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.nextCursor) {
        const nextResponse = await app.request(`/?cursor=${data.nextCursor}`)
        expect(nextResponse.status).toBe(200)
        const nextData = await nextResponse.json()
        expect(Array.isArray(nextData.activity)).toBe(true)
      }
    })
  })
})
