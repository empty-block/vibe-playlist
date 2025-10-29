import { Hono } from 'hono'
import {
  getSupabaseClient,
  encodeCursor,
  decodeCursor,
  fetchStats,
  fetchAuthors,
  formatAuthor,
  formatMusic
} from '../lib/api-utils'

const app = new Hono()

// Smart cache configuration
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface TrendingTracksCache {
  tracks: any[] | null
  calculatedAt: number | null
}

const tracksCache: TrendingTracksCache = {
  tracks: null,
  calculatedAt: null
}

/**
 * GET /api/music/trending
 * Get trending tracks within a timeframe with weighted engagement + velocity scoring
 */
app.get('/trending', async (c) => {
  try {
    const timeframe = c.req.query('timeframe') || '7d'
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100)

    // Check cache
    const now = Date.now()
    if (tracksCache.tracks && tracksCache.calculatedAt && (now - tracksCache.calculatedAt) < CACHE_TTL) {
      return c.json({
        tracks: tracksCache.tracks.slice(0, limit),
        updatedAt: new Date(tracksCache.calculatedAt).toISOString(),
        cached: true
      })
    }

    const supabase = getSupabaseClient()

    // Calculate timeframe parameters
    let timeframeDays: number
    let velocityDays: number

    switch (timeframe) {
      case '1d':
        timeframeDays = 1
        velocityDays = 1
        break
      case '2d':
        timeframeDays = 2
        velocityDays = 1  // Use 1 day for velocity to strongly favor recent engagement
        break
      case '7d':
        timeframeDays = 7
        velocityDays = 1
        break
      case '30d':
        timeframeDays = 30
        velocityDays = 10
        break
      case '90d':
        timeframeDays = 90
        velocityDays = 30
        break
      default:
        timeframeDays = 2
        velocityDays = 1
    }

    // Call Postgres function to get trending tracks
    const { data: tracks, error } = await supabase.rpc('get_trending_tracks', {
      timeframe_days: timeframeDays,
      limit_count: limit,
      velocity_days: velocityDays
    })

    if (error) {
      console.error('Error fetching trending tracks:', error)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch trending music'
        }
      }, 500)
    }

    // Format response to match existing API structure
    const formattedTracks = (tracks || []).map((track: any) => ({
      rank: track.rank,
      id: `${track.platform_name}-${track.platform_id}`,
      title: track.title,
      artist: track.artist,
      platform: track.platform_name,
      platformId: track.platform_id,
      url: track.url,
      thumbnail: track.thumbnail,
      shares: track.shares,
      uniqueLikes: track.unique_likes,
      uniqueReplies: track.unique_replies,
      score: track.score,
      submittedBy: track.submitted_by || []
    }))

    // Update cache
    tracksCache.tracks = formattedTracks
    tracksCache.calculatedAt = now

    return c.json({
      tracks: formattedTracks,
      updatedAt: new Date(now).toISOString()
    })
  } catch (error) {
    console.error('Get trending music error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

/**
 * GET /api/music/:musicId/casts
 * Get all casts that shared a specific track
 */
app.get('/:musicId/casts', async (c) => {
  try {
    const musicId = c.req.param('musicId')
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100)
    const cursor = c.req.query('cursor')

    // Parse musicId (format: platform-platformId)
    const [platform, ...platformIdParts] = musicId.split('-')
    const platformId = platformIdParts.join('-')

    if (!platform || !platformId) {
      return c.json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Invalid musicId format. Expected: platform-platformId'
        }
      }, 400)
    }

    const supabase = getSupabaseClient()

    // Fetch music data
    const { data: musicData, error: musicError } = await supabase
      .from('music_library')
      .select('*')
      .eq('platform', platform)
      .eq('platform_id', platformId)
      .single()

    if (musicError || !musicData) {
      return c.json({
        error: {
          code: 'NOT_FOUND',
          message: 'Music track not found'
        }
      }, 404)
    }

    // Build query for casts
    let query = supabase
      .from('cast_music_edges')
      .select(`
        cast_id,
        created_at,
        cast_nodes!inner (
          node_id,
          cast_text,
          author_fid,
          created_at
        )
      `)
      .eq('music_platform', platform)
      .eq('music_platform_id', platformId)
      .order('created_at', { ascending: false })
      .limit(limit + 1)

    // Apply cursor if provided
    if (cursor) {
      const cursorData = decodeCursor(cursor)
      if (cursorData) {
        query = query.lt('created_at', cursorData.created_at)
      }
    }

    const { data: castEdges, error: castsError } = await query

    if (castsError) {
      console.error('Error fetching casts:', castsError)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch casts'
        }
      }, 500)
    }

    const hasMore = castEdges.length > limit
    const edgesToReturn = castEdges.slice(0, limit)

    // Fetch authors for all casts
    const authorFids = Array.from(new Set(edgesToReturn.map((e: any) => e.cast_nodes.author_fid)))
    const { data: authors } = await supabase
      .from('user_nodes')
      .select('node_id, fname, display_name, avatar_url')
      .in('node_id', authorFids)

    const authorMap = new Map(authors?.map(a => [a.node_id, a]) || [])

    // Fetch stats for all casts
    const castIds = edgesToReturn.map((e: any) => e.cast_nodes.node_id)
    const { data: stats } = await supabase
      .from('interaction_edges')
      .select('cast_id, edge_type')
      .in('cast_id', castIds)

    const statsMap = new Map<string, { likes: number; recasts: number }>()
    stats?.forEach(s => {
      const current = statsMap.get(s.cast_id) || { likes: 0, recasts: 0 }
      if (s.edge_type === 'LIKED') current.likes++
      if (s.edge_type === 'RECASTED') current.recasts++
      statsMap.set(s.cast_id, current)
    })

    // Count replies for each cast
    const replyCounts = new Map<string, number>()
    for (const edge of edgesToReturn) {
      const castNode = (edge as any).cast_nodes
      const { count } = await supabase
        .from('cast_nodes')
        .select('*', { count: 'exact', head: true })
        .eq('parent_cast_hash', castNode.node_id)
      replyCounts.set(castNode.node_id, count || 0)
    }

    const formattedCasts = edgesToReturn.map((edge: any) => {
      const castNode = edge.cast_nodes
      const author = authorMap.get(castNode.author_fid)
      const castStats = statsMap.get(castNode.node_id) || { likes: 0, recasts: 0 }

      return {
        castHash: castNode.node_id,
        text: castNode.cast_text,
        author: {
          fid: castNode.author_fid,
          username: author?.fname || 'unknown',
          displayName: author?.display_name || 'Unknown User',
          pfpUrl: author?.avatar_url
        },
        timestamp: castNode.created_at,
        stats: {
          replies: replyCounts.get(castNode.node_id) || 0,
          likes: castStats.likes,
          recasts: castStats.recasts
        }
      }
    })

    let nextCursor: string | undefined
    if (hasMore && edgesToReturn.length > 0) {
      const lastEdge = edgesToReturn[edgesToReturn.length - 1]
      nextCursor = encodeCursor({
        created_at: lastEdge.created_at,
        id: lastEdge.cast_id
      })
    }

    return c.json({
      music: {
        id: `${musicData.platform}-${musicData.platform_id}`,
        title: musicData.title,
        artist: musicData.artist,
        platform: musicData.platform,
        platformId: musicData.platform_id,
        url: musicData.url,
        thumbnail: musicData.thumbnail_url
      },
      casts: formattedCasts,
      nextCursor
    })
  } catch (error) {
    console.error('Get music casts error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

export default app
