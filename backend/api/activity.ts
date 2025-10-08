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
 * GET /api/activity
 * Get global activity feed (all interactions from all users)
 */
app.get('/', async (c) => {
  try {
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100)
    const cursor = c.req.query('cursor')

    const supabase = getSupabaseClient()

    let query = supabase
      .from('interaction_edges')
      .select('*')
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
      console.error('Error fetching global activity:', edgesError)
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

    // Fetch users who performed the activities
    const activityUserFids = Array.from(new Set(edgesToReturn.map(e => e.source_id)))

    // Fetch cast authors
    const castAuthorFids = Array.from(new Set(casts?.map(c => c.author_fid) || []))

    // Combine all user FIDs and fetch in one go
    const allUserFids = Array.from(new Set([...activityUserFids, ...castAuthorFids]))
    const authorMap = await fetchAuthors(supabase, allUserFids)

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

      const activityUser = authorMap.get(edge.source_id)
      const castAuthor = authorMap.get(cast.author_fid)
      const castMusic = musicMap.get(cast.node_id) || []
      const castStats = statsMap.get(cast.node_id) || { likes: 0, recasts: 0 }

      return {
        type: edge.edge_type,
        user: formatAuthor(activityUser, edge.source_id),
        cast: {
          castHash: cast.node_id,
          text: cast.cast_text,
          author: formatAuthor(castAuthor, cast.author_fid),
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
