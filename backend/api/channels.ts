import { Hono } from 'hono'
import {
  getSupabaseClient,
  encodeCursor,
  decodeCursor
} from '../lib/api-utils'

const app = new Hono()

/**
 * GET /api/channels
 * List all visible channels with metadata and stats
 */
app.get('/', async (c) => {
  try {
    const includeArchived = c.req.query('includeArchived') === 'true'
    const supabase = getSupabaseClient()

    const { data: channels, error } = await supabase
      .rpc('get_channels_list', { include_archived: includeArchived })

    if (error) {
      console.error('Error fetching channels:', error)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch channels'
        }
      }, 500)
    }

    // Format response
    const formattedChannels = channels.map((ch: any) => ({
      id: ch.channel_id,
      name: ch.name,
      description: ch.description,
      isOfficial: ch.is_official,
      iconUrl: ch.icon_url,
      colorHex: ch.color_hex,
      stats: {
        threadCount: parseInt(ch.thread_count),
        lastActivity: ch.last_activity_at
      }
    }))

    return c.json({ channels: formattedChannels })
  } catch (error) {
    console.error('Get channels error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

/**
 * GET /api/channels/:channelId
 * Get detailed information about a specific channel
 */
app.get('/:channelId', async (c) => {
  try {
    const channelId = c.req.param('channelId')
    const supabase = getSupabaseClient()

    const { data: channelData, error } = await supabase
      .rpc('get_channel_details', { p_channel_id: channelId })

    if (error) {
      console.error('Error fetching channel details:', error)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch channel details'
        }
      }, 500)
    }

    if (!channelData || channelData.length === 0) {
      return c.json({
        error: {
          code: 'NOT_FOUND',
          message: 'Channel not found'
        }
      }, 404)
    }

    const channel = channelData[0]

    return c.json({
      id: channel.channel_id,
      name: channel.name,
      description: channel.description,
      isOfficial: channel.is_official,
      iconUrl: channel.icon_url,
      bannerUrl: channel.banner_url,
      colorHex: channel.color_hex,
      stats: {
        threadCount: parseInt(channel.thread_count),
        totalLikes: parseInt(channel.total_likes),
        totalReplies: parseInt(channel.total_replies),
        uniqueContributors: parseInt(channel.unique_contributors),
        lastActivity: channel.last_activity_at
      },
      createdAt: channel.created_at
    })
  } catch (error) {
    console.error('Get channel details error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

/**
 * GET /api/channels/:channelId/feed
 * Get paginated feed of threads for a channel
 */
app.get('/:channelId/feed', async (c) => {
  try {
    const channelId = c.req.param('channelId')
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100)
    const cursor = c.req.query('cursor')

    const supabase = getSupabaseClient()

    // Parse cursor
    let cursorTimestamp = null
    let cursorId = null
    if (cursor) {
      const cursorData = decodeCursor(cursor)
      if (cursorData) {
        cursorTimestamp = cursorData.created_at
        cursorId = cursorData.id
      }
    }

    // Fetch channel feed using postgres function
    const { data: threads, error: threadsError } = await supabase
      .rpc('get_channel_feed', {
        p_channel_id: channelId,
        limit_count: limit + 1,  // Fetch one extra to check hasMore
        cursor_timestamp: cursorTimestamp,
        cursor_id: cursorId
      })

    if (threadsError) {
      console.error('Error fetching channel feed:', threadsError)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch channel feed'
        }
      }, 500)
    }

    const hasMore = threads.length > limit
    const threadsToReturn = threads.slice(0, limit)

    // Format threads (same as /api/threads)
    const formattedThreads = threadsToReturn.map((thread: any) => ({
      castHash: thread.cast_hash,
      text: thread.cast_text,
      author: {
        fid: thread.author_fid,
        username: thread.author_username,
        displayName: thread.author_display_name,
        pfpUrl: thread.author_avatar_url
      },
      timestamp: thread.created_at,
      music: thread.music || [],
      stats: {
        replies: parseInt(thread.replies_count),
        likes: parseInt(thread.likes_count),
        recasts: parseInt(thread.recasts_count)
      }
    }))

    let nextCursor: string | undefined
    if (hasMore && threadsToReturn.length > 0) {
      const lastThread = threadsToReturn[threadsToReturn.length - 1]
      nextCursor = encodeCursor({
        created_at: lastThread.created_at,
        id: lastThread.cast_hash
      })
    }

    return c.json({
      threads: formattedThreads,
      nextCursor
    })
  } catch (error) {
    console.error('Get channel feed error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

export default app
