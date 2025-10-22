import { Hono } from 'hono'
import {
  getSupabaseClient,
  encodeCursor,
  decodeCursor
} from '../lib/api-utils'
import { addRateLimitHeaders } from '../lib/rate-limit'

const app = new Hono()

/**
 * GET /api/activity
 * Get global activity feed (all interactions from all users)
 */
app.get('/', async (c) => {
  try {
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100)
    const cursor = c.req.query('cursor')

    const supabase = getSupabaseClient()

    // Parse cursor for timestamp
    let cursorTimestamp = null
    let cursorId = null
    if (cursor) {
      const cursorData = decodeCursor(cursor)
      if (cursorData) {
        cursorTimestamp = cursorData.created_at
        cursorId = cursorData.id
      }
    }

    // Use postgres function to get activity feed with all data in one call
    const { data: activities, error: activitiesError } = await supabase
      .rpc('get_activity_feed', {
        limit_count: limit + 1,
        cursor_timestamp: cursorTimestamp,
        cursor_id: cursorId
      })

    if (activitiesError) {
      console.error('Error fetching global activity:', activitiesError)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch activity'
        }
      }, 500)
    }

    const hasMore = activities.length > limit
    const activitiesToReturn = activities.slice(0, limit)

    // Format activity items
    const formattedActivity = activitiesToReturn.map((activity: any) => ({
      type: activity.interaction_type,
      user: {
        fid: activity.actor_fid,
        username: activity.actor_username,
        displayName: activity.actor_display_name,
        pfpUrl: activity.actor_avatar_url
      },
      cast: {
        castHash: activity.cast_hash,
        text: activity.cast_text,
        author: {
          fid: activity.cast_author_fid,
          username: activity.cast_author_username,
          displayName: activity.cast_author_display_name,
          pfpUrl: activity.cast_author_avatar_url
        },
        timestamp: activity.cast_created_at,
        music: activity.music || [],
        stats: {
          replies: parseInt(activity.replies_count),
          likes: parseInt(activity.likes_count),
          recasts: parseInt(activity.recasts_count)
        }
      },
      timestamp: activity.interaction_timestamp
    }))

    let nextCursor: string | undefined
    if (hasMore && activitiesToReturn.length > 0) {
      const lastActivity = activitiesToReturn[activitiesToReturn.length - 1]
      nextCursor = encodeCursor({
        created_at: lastActivity.interaction_timestamp,
        id: lastActivity.cast_hash
      })
    }

    addRateLimitHeaders(c)
    return c.json({
      activity: formattedActivity,
      nextCursor
    })
  } catch (error) {
    console.error('Get global activity error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

export default app
