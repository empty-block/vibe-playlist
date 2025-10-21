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

    // Calculate date threshold based on timeframe
    let dateThreshold: Date
    let velocityThreshold: Date // For 3-day velocity window

    switch (timeframe) {
      case '7d':
        dateThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        velocityThreshold = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        dateThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        velocityThreshold = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        dateThreshold = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        velocityThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        dateThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        velocityThreshold = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }

    // Get all music shares with author info for DISTINCT counting
    const { data: musicShares, error: sharesError } = await supabase
      .from('cast_music_edges')
      .select(`
        music_platform_name,
        music_platform_id,
        created_at,
        cast_id,
        cast_nodes!cast_music_edges_cast_id_fkey!inner (
          author_fid,
          created_at
        )
      `)
      .gte('cast_nodes.created_at', dateThreshold.toISOString())

    if (sharesError) {
      console.error('Error fetching music shares:', sharesError)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch trending music'
        }
      }, 500)
    }

    // Count DISTINCT sharers per track and track timestamps
    const trackData = new Map<string, {
      platform: string,
      platformId: string,
      uniqueSharers: Set<string>,
      recentSharers: Set<string>,
      castIds: Set<string>
    }>()

    musicShares?.forEach((share: any) => {
      const key = `${share.music_platform_name}-${share.music_platform_id}`
      const authorFid = share.cast_nodes.author_fid
      const createdAt = new Date(share.created_at)

      if (!trackData.has(key)) {
        const [platform, ...platformIdParts] = key.split('-')
        trackData.set(key, {
          platform: share.music_platform_name,
          platformId: share.music_platform_id,
          uniqueSharers: new Set(),
          recentSharers: new Set(),
          castIds: new Set()
        })
      }

      const data = trackData.get(key)!
      data.uniqueSharers.add(authorFid)
      data.castIds.add(share.cast_id)

      // Track recent sharers for velocity
      if (createdAt >= velocityThreshold) {
        data.recentSharers.add(authorFid)
      }
    })

    if (trackData.size === 0) {
      return c.json({ tracks: [], updatedAt: new Date(now).toISOString() })
    }

    // Get DISTINCT likes and replies for each track
    const scoredTracks = await Promise.all(
      Array.from(trackData.entries()).map(async ([key, data]) => {
        const castIdsArray = Array.from(data.castIds)

        // Get unique likers and repliers for this track's casts
        const { data: interactions } = await supabase
          .from('interaction_edges')
          .select('source_id, edge_type, created_at')
          .in('cast_id', castIdsArray)
          .in('edge_type', ['LIKED', 'REPLIED'])
          .gte('created_at', dateThreshold.toISOString())

        const uniqueLikers = new Set<string>()
        const uniqueRepliers = new Set<string>()
        const recentEngagers = new Set<string>()

        interactions?.forEach((interaction: any) => {
          const createdAt = new Date(interaction.created_at)

          if (interaction.edge_type === 'LIKED') {
            uniqueLikers.add(interaction.source_id)
          } else if (interaction.edge_type === 'REPLIED') {
            uniqueRepliers.add(interaction.source_id)
          }

          // Track recent engagers for velocity
          if (createdAt >= velocityThreshold) {
            recentEngagers.add(interaction.source_id)
          }
        })

        // Calculate weighted engagement score
        // shares × 10 + likes × 3 + replies × 2
        const uniqueSharers = data.uniqueSharers.size
        const uniqueLikesCount = uniqueLikers.size
        const uniqueRepliesCount = uniqueRepliers.size

        const weightedScore = (uniqueSharers * 10) + (uniqueLikesCount * 3) + (uniqueRepliesCount * 2)

        // Calculate velocity multiplier
        // Total unique engagers = sharers + likers + repliers
        const totalUniqueEngagers = new Set([
          ...data.uniqueSharers,
          ...uniqueLikers,
          ...uniqueRepliers
        ]).size

        const recentUniqueEngagers = new Set([
          ...data.recentSharers,
          ...recentEngagers
        ]).size

        const velocityMultiplier = totalUniqueEngagers > 0
          ? (recentUniqueEngagers / totalUniqueEngagers) + 1
          : 1

        const finalScore = weightedScore * velocityMultiplier

        return {
          key,
          platform: data.platform,
          platformId: data.platformId,
          uniqueShares: uniqueSharers,
          uniqueLikes: uniqueLikesCount,
          uniqueReplies: uniqueRepliesCount,
          score: finalScore,
          castIds: castIdsArray
        }
      })
    )

    // Sort by score and take top tracks
    const topTracks = scoredTracks
      .filter(t => t.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    if (topTracks.length === 0) {
      return c.json({ tracks: [], updatedAt: new Date(now).toISOString() })
    }

    // Fetch music library data for top tracks
    const musicPromises = topTracks.map(async (track, index) => {
      const { data: musicData } = await supabase
        .from('music_library')
        .select('*')
        .eq('platform_name', track.platform)
        .eq('platform_id', track.platformId)
        .single()

      if (!musicData) return null

      // Fetch recent casts for this track (up to 3)
      const { data: recentCasts } = await supabase
        .from('cast_music_edges')
        .select(`
          cast_id,
          cast_nodes!cast_music_edges_cast_id_fkey!inner (
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
        .eq('music_platform_name', track.platform)
        .eq('music_platform_id', track.platformId)
        .gte('cast_nodes.created_at', dateThreshold.toISOString())
        .order('cast_nodes.created_at', { ascending: false })
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
        rank: index + 1,
        id: `${track.platform}-${track.platformId}`,
        title: musicData.title || musicData.og_title || 'Unknown Track',
        artist: musicData.artist || musicData.og_artist || 'Unknown Artist',
        platform: track.platform,
        platformId: track.platformId,
        url: musicData.url,
        thumbnail: musicData.og_image_url || musicData.thumbnail_url,
        shares: track.uniqueShares,
        uniqueLikes: track.uniqueLikes,
        uniqueReplies: track.uniqueReplies,
        score: Math.round(track.score * 100) / 100,
        recentCasts: formattedRecentCasts
      }
    })

    const tracks = (await Promise.all(musicPromises)).filter(t => t !== null)

    // Update cache
    tracksCache.tracks = tracks
    tracksCache.calculatedAt = now

    return c.json({
      tracks,
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
