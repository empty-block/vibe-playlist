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

    // Calculate date threshold (7 days)
    const dateThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // Get all tracks shared in last 7 days with their authors
    const { data: recentTracks, error: tracksError } = await supabase
      .from('cast_music_edges')
      .select(`
        music_platform_name,
        music_platform_id,
        cast_id,
        cast_nodes!cast_music_edges_cast_id_fkey!inner (
          node_id,
          author_fid,
          created_at
        )
      `)
      .gte('cast_nodes.created_at', dateThreshold.toISOString())

    if (tracksError) {
      console.error('Error fetching recent tracks:', tracksError)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch trending users'
        }
      }, 500)
    }

    // Group tracks by author
    const authorTracks = new Map<string, Set<string>>()
    recentTracks?.forEach((track: any) => {
      const authorFid = track.cast_nodes.author_fid
      const trackKey = `${track.music_platform_name}-${track.music_platform_id}`

      if (!authorTracks.has(authorFid)) {
        authorTracks.set(authorFid, new Set())
      }
      authorTracks.get(authorFid)!.add(trackKey)
    })

    // Get unique engagers for each author's tracks
    const authorScores = await Promise.all(
      Array.from(authorTracks.entries()).map(async ([authorFid, trackSet]) => {
        const tracks = Array.from(trackSet)

        // Get all casts for these tracks
        const trackPairs = tracks.map(t => {
          const [platform, ...idParts] = t.split('-')
          return { platform, platformId: idParts.join('-') }
        })

        const castIds = new Set<string>()
        for (const { platform, platformId } of trackPairs) {
          const { data: castEdges } = await supabase
            .from('cast_music_edges')
            .select(`
              cast_id,
              cast_nodes!cast_music_edges_cast_id_fkey!inner (
                created_at
              )
            `)
            .eq('music_platform_name', platform)
            .eq('music_platform_id', platformId)
            .gte('cast_nodes.created_at', dateThreshold.toISOString())

          castEdges?.forEach((edge: any) => castIds.add(edge.cast_id))
        }

        if (castIds.size === 0) {
          return { authorFid, trackCount: tracks.length, uniqueEngagers: 0, score: 0 }
        }

        // Get unique users who engaged (LIKED or REPLIED) with these casts
        const { data: interactions } = await supabase
          .from('interaction_edges')
          .select('source_id, edge_type')
          .in('cast_id', Array.from(castIds))
          .in('edge_type', ['LIKED', 'REPLIED'])

        const uniqueEngagers = new Set(
          interactions?.map((i: any) => i.source_id) || []
        ).size

        // Calculate score: unique_engagers / sqrt(track_count)
        const score = uniqueEngagers / Math.sqrt(tracks.length)

        return {
          authorFid,
          trackCount: tracks.length,
          uniqueEngagers,
          score
        }
      })
    )

    // Sort by score and get user data
    const sortedAuthors = authorScores
      .filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    // Fetch user data
    const authorFids = sortedAuthors.map(a => a.authorFid)
    const { data: users } = await supabase
      .from('user_nodes')
      .select('node_id, fname, display_name, avatar_url')
      .in('node_id', authorFids)

    const userMap = new Map(users?.map(u => [u.node_id, u]) || [])

    // Format response
    const contributors = sortedAuthors.map((author, index) => {
      const user = userMap.get(author.authorFid)
      return {
        rank: index + 1,
        fid: author.authorFid,
        username: user?.fname || 'unknown',
        displayName: user?.display_name || 'Unknown User',
        avatar: user?.avatar_url || '',
        trackCount: author.trackCount,
        uniqueEngagers: author.uniqueEngagers,
        score: Math.round(author.score * 100) / 100
      }
    })

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
