import { Hono } from 'hono'
import { getSupabaseClient } from '../lib/api-utils'

const app = new Hono()

// Smart cache configuration
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface TrendingCache {
  users: any[] | null
  calculatedAt: number | null
}

const cache: TrendingCache = {
  users: null,
  calculatedAt: null
}

/**
 * GET /api/trending/users
 * Get trending contributors based on unique engagement
 */
app.get('/users', async (c) => {
  try {
    const limit = Math.min(parseInt(c.req.query('limit') || '10'), 50)

    // Check cache
    const now = Date.now()
    if (cache.users && cache.calculatedAt && (now - cache.calculatedAt) < CACHE_TTL) {
      return c.json({
        contributors: cache.users.slice(0, limit),
        updatedAt: new Date(cache.calculatedAt).toISOString(),
        cached: true
      })
    }

    const supabase = getSupabaseClient()

    // Call Postgres function to get trending users
    const { data: users, error } = await supabase.rpc('get_trending_users', {
      timeframe_days: 1,
      limit_count: limit
    })

    if (error) {
      console.error('Error fetching trending users:', error)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch trending users'
        }
      }, 500)
    }

    // Format response to match existing API structure
    const contributors = (users || []).map((user: any) => ({
      rank: user.rank,
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      avatar: user.avatar,
      trackCount: user.track_count,
      uniqueEngagers: user.unique_engagers,
      score: user.score
    }))

    // Update cache
    cache.users = contributors
    cache.calculatedAt = now

    return c.json({
      contributors,
      updatedAt: new Date(now).toISOString()
    })
  } catch (error) {
    console.error('Get trending users error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

export default app
