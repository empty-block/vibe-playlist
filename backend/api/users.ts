import { Hono } from 'hono'
import {
  getSupabaseClient,
  encodeCursor,
  decodeCursor,
  fetchStats,
  fetchAuthors,
  fetchReplyCounts,
  formatAuthor,
  formatMusic
} from '../lib/api-utils'
import { addRateLimitHeaders } from '../lib/rate-limit'

const app = new Hono()

/**
 * GET /api/users/:fid/threads
 * Get all threads created by a user
 */
app.get('/:fid/threads', async (c) => {
  try {
    const fid = c.req.param('fid')
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100)
    const cursor = c.req.query('cursor')

    const supabase = getSupabaseClient()

    let query = supabase
      .from('cast_nodes')
      .select('*')
      .eq('author_fid', fid)
      .is('parent_cast_hash', null) // Only top-level threads
      .order('created_at', { ascending: false })
      .limit(limit + 1)

    // Apply cursor if provided
    if (cursor) {
      const cursorData = decodeCursor(cursor)
      if (cursorData) {
        query = query.lt('created_at', cursorData.created_at)
      }
    }

    const { data: threads, error: threadsError } = await query

    if (threadsError) {
      console.error('Error fetching user threads:', threadsError)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch threads'
        }
      }, 500)
    }

    const hasMore = threads.length > limit
    const threadsToReturn = threads.slice(0, limit)

    // Fetch author info (just the single user in this case)
    const authorMap = await fetchAuthors(supabase, [fid])

    // Fetch music for all threads
    const castIds = threadsToReturn.map(t => t.node_id)
    const { data: music } = await supabase
      .from('cast_music_edges')
      .select(`
        cast_id,
        music_library!inner (
          platform,
          platform_id,
          artist,
          title,
          url,
          thumbnail_url
        )
      `)
      .in('cast_id', castIds)

    const musicMap = new Map<string, any[]>()
    music?.forEach(m => {
      const castMusic = musicMap.get(m.cast_id) || []
      castMusic.push(m.music_library)
      musicMap.set(m.cast_id, castMusic)
    })

    // Fetch stats for all threads
    const statsMap = await fetchStats(supabase, castIds)

    // Fetch reply counts
    const replyCountsMap = await fetchReplyCounts(supabase, castIds)

    const formattedThreads = threadsToReturn.map(thread => {
      const author = authorMap.get(thread.author_fid)
      const threadMusic = musicMap.get(thread.node_id) || []
      const threadStats = statsMap.get(thread.node_id) || { likes: 0, recasts: 0 }

      return {
        castHash: thread.node_id,
        text: thread.cast_text,
        author: formatAuthor(author, thread.author_fid),
        timestamp: thread.created_at,
        music: threadMusic.map(m => formatMusic(m)),
        stats: {
          replies: replyCountsMap.get(thread.node_id) || 0,
          likes: threadStats.likes,
          recasts: threadStats.recasts
        }
      }
    })

    let nextCursor: string | undefined
    if (hasMore && threadsToReturn.length > 0) {
      const lastThread = threadsToReturn[threadsToReturn.length - 1]
      nextCursor = encodeCursor({
        created_at: lastThread.created_at,
        id: lastThread.node_id
      })
    }

    addRateLimitHeaders(c)
    return c.json({
      threads: formattedThreads,
      nextCursor
    })
  } catch (error) {
    console.error('Get user threads error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

/**
 * GET /api/users/:fid/activity
 * Get all activity for a user (threads, replies, likes, recasts)
 */
app.get('/:fid/activity', async (c) => {
  try {
    const fid = c.req.param('fid')
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100)
    const cursor = c.req.query('cursor')

    const supabase = getSupabaseClient()

    let query = supabase
      .from('interaction_edges')
      .select('*')
      .eq('source_id', fid)
      .order('created_at', { ascending: false })
      .limit(limit + 1)

    // Apply cursor if provided
    if (cursor) {
      const cursorData = decodeCursor(cursor)
      if (cursorData) {
        query = query.lt('created_at', cursorData.created_at)
      }
    }

    const { data: edges, error: edgesError } = await query

    if (edgesError) {
      console.error('Error fetching user activity:', edgesError)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch activity'
        }
      }, 500)
    }

    const hasMore = edges.length > limit
    const edgesToReturn = edges.slice(0, limit)

    // Fetch all related casts
    const castIds = edgesToReturn.map(e => e.cast_id)
    const { data: casts } = await supabase
      .from('cast_nodes')
      .select('*')
      .in('node_id', castIds)

    const castMap = new Map(casts?.map(c => [c.node_id, c]) || [])

    // Fetch all cast authors
    const castAuthorFids = Array.from(new Set(casts?.map(c => c.author_fid) || []))
    const authorMap = await fetchAuthors(supabase, castAuthorFids)

    // Fetch music for all casts
    const { data: music } = await supabase
      .from('cast_music_edges')
      .select(`
        cast_id,
        music_library!inner (
          platform,
          platform_id,
          artist,
          title,
          url,
          thumbnail_url
        )
      `)
      .in('cast_id', castIds)

    const musicMap = new Map<string, any[]>()
    music?.forEach(m => {
      const castMusic = musicMap.get(m.cast_id) || []
      castMusic.push(m.music_library)
      musicMap.set(m.cast_id, castMusic)
    })

    // Fetch stats for all casts
    const statsMap = await fetchStats(supabase, castIds)

    // Fetch reply counts
    const replyCountsMap = await fetchReplyCounts(supabase, castIds)

    const formattedActivity = edgesToReturn.map(edge => {
      const cast = castMap.get(edge.cast_id)
      if (!cast) return null

      const author = authorMap.get(cast.author_fid)
      const castMusic = musicMap.get(cast.node_id) || []
      const castStats = statsMap.get(cast.node_id) || { likes: 0, recasts: 0 }

      return {
        type: edge.edge_type,
        cast: {
          castHash: cast.node_id,
          text: cast.cast_text,
          author: formatAuthor(author, cast.author_fid),
          timestamp: cast.created_at,
          music: castMusic.map(m => formatMusic(m)),
          stats: {
            replies: replyCountsMap.get(cast.node_id) || 0,
            likes: castStats.likes,
            recasts: castStats.recasts
          }
        },
        timestamp: edge.created_at
      }
    }).filter(a => a !== null)

    let nextCursor: string | undefined
    if (hasMore && edgesToReturn.length > 0) {
      const lastEdge = edgesToReturn[edgesToReturn.length - 1]
      nextCursor = encodeCursor({
        created_at: lastEdge.created_at,
        id: lastEdge.cast_id
      })
    }

    addRateLimitHeaders(c)
    return c.json({
      activity: formattedActivity,
      nextCursor
    })
  } catch (error) {
    console.error('Get user activity error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

export default app
