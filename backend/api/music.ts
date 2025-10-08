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

/**
 * GET /api/music/trending
 * Get trending tracks within a timeframe
 */
app.get('/trending', async (c) => {
  try {
    const timeframe = c.req.query('timeframe') || '7d'
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100)

    const supabase = getSupabaseClient()

    // Calculate date threshold based on timeframe
    const now = new Date()
    let dateThreshold: Date

    switch (timeframe) {
      case '7d':
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        dateThreshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Get music share counts within timeframe
    const { data: musicShares, error: sharesError } = await supabase
      .from('cast_music_edges')
      .select('music_platform, music_platform_id, created_at')
      .gte('created_at', dateThreshold.toISOString())

    if (sharesError) {
      console.error('Error fetching music shares:', sharesError)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch trending music'
        }
      }, 500)
    }

    // Count shares per track
    const shareCounts = new Map<string, number>()
    musicShares?.forEach(share => {
      const key = `${share.music_platform}-${share.music_platform_id}`
      shareCounts.set(key, (shareCounts.get(key) || 0) + 1)
    })

    // Get top tracks by share count
    const topTracks = Array.from(shareCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key, count]) => {
        const [platform, platformId] = key.split('-', 2)
        return { platform, platformId, shareCount: count }
      })

    if (topTracks.length === 0) {
      return c.json({ tracks: [] })
    }

    // Fetch music library data for top tracks
    const musicPromises = topTracks.map(async ({ platform, platformId, shareCount }) => {
      const { data: musicData } = await supabase
        .from('music_library')
        .select('*')
        .eq('platform', platform)
        .eq('platform_id', platformId)
        .single()

      if (!musicData) return null

      // Fetch recent casts for this track
      const { data: recentCasts } = await supabase
        .from('cast_music_edges')
        .select(`
          cast_id,
          cast_nodes!inner (
            node_id,
            cast_text,
            author_fid,
            created_at,
            user_nodes!inner (
              node_id,
              fname,
              display_name,
              avatar_url
            )
          )
        `)
        .eq('music_platform', platform)
        .eq('music_platform_id', platformId)
        .gte('created_at', dateThreshold.toISOString())
        .order('created_at', { ascending: false })
        .limit(3)

      const formattedRecentCasts = (recentCasts || []).map((rc: any) => ({
        castHash: rc.cast_nodes.node_id,
        text: rc.cast_nodes.cast_text,
        author: {
          fid: rc.cast_nodes.author_fid,
          username: rc.cast_nodes.user_nodes.fname || 'unknown',
          displayName: rc.cast_nodes.user_nodes.display_name || 'Unknown User',
          pfpUrl: rc.cast_nodes.user_nodes.avatar_url
        },
        timestamp: rc.cast_nodes.created_at
      }))

      return {
        id: `${musicData.platform}-${musicData.platform_id}`,
        title: musicData.title,
        artist: musicData.artist,
        platform: musicData.platform,
        platformId: musicData.platform_id,
        url: musicData.url,
        thumbnail: musicData.thumbnail_url,
        shareCount,
        recentCasts: formattedRecentCasts
      }
    })

    const tracks = (await Promise.all(musicPromises)).filter(t => t !== null)

    return c.json({ tracks })
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
