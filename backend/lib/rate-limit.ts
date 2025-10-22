import { Context } from 'hono'

/**
 * Add rate limit headers to response
 * This is a placeholder implementation - no enforcement, just headers
 * Can be enhanced later with actual rate limiting logic
 */
export function addRateLimitHeaders(c: Context) {
  // Set rate limit headers (placeholder values, no actual enforcement)
  c.header('X-RateLimit-Limit', '100')
  c.header('X-RateLimit-Remaining', '99')

  // Set reset time to 1 minute from now
  const resetTime = Math.floor(Date.now() / 1000) + 60
  c.header('X-RateLimit-Reset', resetTime.toString())
}
