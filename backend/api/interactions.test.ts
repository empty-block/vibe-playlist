import { describe, it, expect } from 'bun:test'
import { Hono } from 'hono'
import interactionsApp from './interactions'

const app = new Hono()
app.route('/', interactionsApp)

describe('Interactions API', () => {
  describe('POST /:castHash/like', () => {
    it('should like a cast', async () => {
      const response = await app.request('/0x123456/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: '12345'
        })
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('success')
      expect(data.success).toBe(true)

      // Check rate limit headers
      expect(response.headers.get('X-RateLimit-Limit')).toBe('100')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('99')
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
    })

    it('should return 400 if userId is missing', async () => {
      const response = await app.request('/0x123456/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error.code).toBe('INVALID_REQUEST')
    })

    it('should return 404 if cast does not exist', async () => {
      const response = await app.request('/0xnonexistent/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: '12345'
        })
      })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error.code).toBe('NOT_FOUND')
    })
  })

  describe('DELETE /:castHash/like', () => {
    it('should unlike a cast', async () => {
      // First like it
      await app.request('/0x123456/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: '12345'
        })
      })

      // Then unlike it
      const response = await app.request('/0x123456/like', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: '12345'
        })
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('success')
      expect(data.success).toBe(true)

      // Check rate limit headers
      expect(response.headers.get('X-RateLimit-Limit')).toBe('100')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('99')
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
    })

    it('should return 400 if userId is missing', async () => {
      const response = await app.request('/0x123456/like', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error.code).toBe('INVALID_REQUEST')
    })
  })
})
