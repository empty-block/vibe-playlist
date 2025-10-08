import { describe, it, expect } from 'bun:test'
import { Hono } from 'hono'
import usersApp from './users'

const app = new Hono()
app.route('/', usersApp)

describe('Users API', () => {
  describe('GET /:fid/threads', () => {
    it('should fetch threads for a user', async () => {
      const response = await app.request('/12345/threads')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('threads')
      expect(Array.isArray(data.threads)).toBe(true)

      // Check rate limit headers
      expect(response.headers.get('X-RateLimit-Limit')).toBe('100')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('99')
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
    })

    it('should support pagination with limit', async () => {
      const response = await app.request('/12345/threads?limit=10')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.threads.length).toBeLessThanOrEqual(10)
    })

    it('should include music and stats for each thread', async () => {
      const response = await app.request('/12345/threads')

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.threads.length > 0) {
        const thread = data.threads[0]
        expect(thread).toHaveProperty('castHash')
        expect(thread).toHaveProperty('text')
        expect(thread).toHaveProperty('author')
        expect(thread).toHaveProperty('timestamp')
        expect(thread).toHaveProperty('music')
        expect(thread).toHaveProperty('stats')
        expect(thread.stats).toHaveProperty('likes')
        expect(thread.stats).toHaveProperty('replies')
        expect(thread.stats).toHaveProperty('recasts')
      }
    })
  })

  describe('GET /:fid/activity', () => {
    it('should fetch activity for a user', async () => {
      const response = await app.request('/12345/activity')

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
      const response = await app.request('/12345/activity?limit=20')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.activity.length).toBeLessThanOrEqual(20)
    })

    it('should include activity type, cast, and timestamp', async () => {
      const response = await app.request('/12345/activity')

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.activity.length > 0) {
        const activity = data.activity[0]
        expect(activity).toHaveProperty('type')
        expect(activity).toHaveProperty('cast')
        expect(activity).toHaveProperty('timestamp')
        expect(activity.cast).toHaveProperty('castHash')
        expect(activity.cast).toHaveProperty('text')
        expect(activity.cast).toHaveProperty('author')
        expect(activity.cast).toHaveProperty('music')
        expect(activity.cast).toHaveProperty('stats')
      }
    })
  })
})
