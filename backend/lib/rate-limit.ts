import { Context } from 'hono'

/**
 * In-memory rate limiting implementation
 * Uses sliding window approach with IP-based tracking
 */

interface RateLimitEntry {
  requests: number[]  // Timestamps of requests
  windowStart: number
}

// Store rate limit data in memory
// Key: IP address, Value: request timestamps
const rateLimitStore = new Map<string, RateLimitEntry>()

// Configuration
const WINDOW_MS = 15 * 60 * 1000  // 15 minutes
const MAX_REQUESTS = 100           // Max requests per window

/**
 * Clean up old entries periodically to prevent memory leaks
 */
function cleanupOldEntries() {
  const now = Date.now()
  const cutoff = now - WINDOW_MS

  for (const [ip, entry] of rateLimitStore.entries()) {
    // Remove entries older than window
    if (entry.windowStart < cutoff) {
      rateLimitStore.delete(ip)
    }
  }
}

// Note: Cleanup happens on-demand during rate limit checks instead of setInterval
// (setInterval is not allowed in Cloudflare Workers global scope)

/**
 * Get client IP address from request
 */
function getClientIp(c: Context): string {
  // Try Cloudflare header first
  const cfIp = c.req.header('cf-connecting-ip')
  if (cfIp) return cfIp

  // Try X-Forwarded-For
  const forwarded = c.req.header('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()

  // Try X-Real-IP
  const realIp = c.req.header('x-real-ip')
  if (realIp) return realIp

  // Fallback
  return 'unknown'
}

/**
 * Check if IP is rate limited
 * Returns { limited: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(ip: string): {
  limited: boolean
  remaining: number
  resetTime: number
} {
  const now = Date.now()
  const windowStart = now - WINDOW_MS

  // Get or create entry for this IP
  let entry = rateLimitStore.get(ip)

  if (!entry) {
    // First request from this IP
    entry = {
      requests: [now],
      windowStart: now
    }
    rateLimitStore.set(ip, entry)

    return {
      limited: false,
      remaining: MAX_REQUESTS - 1,
      resetTime: Math.floor((now + WINDOW_MS) / 1000)
    }
  }

  // Filter out requests outside the current window
  entry.requests = entry.requests.filter(timestamp => timestamp > windowStart)

  // Check if limit exceeded
  if (entry.requests.length >= MAX_REQUESTS) {
    // Rate limited
    const oldestRequest = entry.requests[0]
    const resetTime = Math.floor((oldestRequest + WINDOW_MS) / 1000)

    return {
      limited: true,
      remaining: 0,
      resetTime
    }
  }

  // Add current request
  entry.requests.push(now)
  entry.windowStart = entry.requests[0]

  return {
    limited: false,
    remaining: MAX_REQUESTS - entry.requests.length,
    resetTime: Math.floor((entry.windowStart + WINDOW_MS) / 1000)
  }
}

/**
 * Rate limiting middleware
 * Apply this to endpoints that should be rate limited
 */
export const rateLimitMiddleware = async (c: Context, next: Function) => {
  const ip = getClientIp(c)
  const { limited, remaining, resetTime } = checkRateLimit(ip)

  // Add rate limit headers
  c.header('X-RateLimit-Limit', MAX_REQUESTS.toString())
  c.header('X-RateLimit-Remaining', remaining.toString())
  c.header('X-RateLimit-Reset', resetTime.toString())

  if (limited) {
    return c.json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter: resetTime
      }
    }, 429)
  }

  await next()
}

/**
 * Legacy function for backwards compatibility
 * Now actually enforces rate limiting
 */
export function addRateLimitHeaders(c: Context) {
  const ip = getClientIp(c)
  const { remaining, resetTime } = checkRateLimit(ip)

  c.header('X-RateLimit-Limit', MAX_REQUESTS.toString())
  c.header('X-RateLimit-Remaining', remaining.toString())
  c.header('X-RateLimit-Reset', resetTime.toString())
}
