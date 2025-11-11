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
import { getNeynarService } from '../lib/neynar'

const app = new Hono()

/**
 * GET /api/users/:fid
 * Get user profile with activity stats
 */
app.get('/:fid', async (c) => {
  try {
    const fid = c.req.param('fid')
    const supabase = getSupabaseClient()

    // Fetch user basic info
    const { data: user, error: userError } = await supabase
      .from('user_nodes')
      .select('node_id, fname, display_name, avatar_url')
      .eq('node_id', fid)
      .single()

    if (userError || !user) {
      return c.json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      }, 404)
    }

    // If profile data is missing or empty, fetch from Neynar and update database
    if (!user.fname || !user.display_name || user.fname.trim() === '' || user.display_name.trim() === '') {
      console.log(`[Users API] Profile data missing for FID ${fid}, fetching from Neynar...`)
      try {
        const neynar = getNeynarService()
        const userData = await neynar.fetchUserByFid(parseInt(fid))

        if (userData) {
          // Update database with fresh profile data
          const { error: updateError } = await supabase
            .from('user_nodes')
            .update({
              fname: userData.username,
              display_name: userData.display_name,
              avatar_url: userData.pfp_url
            })
            .eq('node_id', fid)

          if (updateError) {
            console.error(`[Users API] Failed to update profile for FID ${fid}:`, updateError.message)
          } else {
            console.log(`[Users API] ✓ Updated profile for FID ${fid} (@${userData.username})`)
            // Update local user object with fresh data
            user.fname = userData.username
            user.display_name = userData.display_name
            user.avatar_url = userData.pfp_url
          }
        }
      } catch (neynarError) {
        console.error(`[Users API] Failed to fetch profile from Neynar for FID ${fid}:`, neynarError)
        // Continue with existing (possibly empty) data
      }
    }

    // Fetch activity stats - only count interactions where cast has music
    const { data: statsData } = await supabase
      .from('interaction_edges')
      .select(`
        edge_type,
        cast_id
      `)
      .eq('source_id', fid)

    // Filter to only edges where the cast has music, then count by type
    const stats = {
      tracksShared: 0,
      tracksLiked: 0,
      tracksReplied: 0,
      tracksRecasted: 0
    }

    if (statsData && statsData.length > 0) {
      // Get unique cast IDs
      const castIds = [...new Set(statsData.map(e => e.cast_id))]

      // Find which casts have music - query cast_music_edges
      const { data: castsWithMusic } = await supabase
        .from('cast_music_edges')
        .select('cast_id')
        .in('cast_id', castIds)

      const castIdsWithMusic = new Set(castsWithMusic?.map(c => c.cast_id) || [])

      // Count only edges where cast has music
      statsData.forEach(edge => {
        if (castIdsWithMusic.has(edge.cast_id)) {
          switch (edge.edge_type) {
            case 'AUTHORED':
              stats.tracksShared++
              break
            case 'LIKED':
              stats.tracksLiked++
              break
            case 'REPLIED':
              stats.tracksReplied++
              break
            case 'RECASTED':
              stats.tracksRecasted++
              break
          }
        }
      })
    }

    addRateLimitHeaders(c)
    return c.json({
      user: {
        fid: user.node_id,
        username: user.fname || 'unknown',
        displayName: user.display_name || 'Unknown User',
        avatar: user.avatar_url
      },
      stats
    })
  } catch (error) {
    console.error('Get user profile error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

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

    // Use postgres function to get user threads with all data in one call
    const { data: threads, error: threadsError } = await supabase
      .rpc('get_user_threads', {
        user_fid: fid,
        limit_count: limit + 1,
        cursor_timestamp: cursorTimestamp,
        cursor_id: cursorId
      })

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

    // Format threads
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
        created_at: lastThread.timestamp,
        id: lastThread.castHash
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

    // Fetch music for all casts by joining cast_music_edges with music_library
    // First get the edges
    const { data: musicEdges } = await supabase
      .from('cast_music_edges')
      .select('cast_id, music_platform_name, music_platform_id, embed_index')
      .in('cast_id', castIds)
      .order('cast_id')
      .order('embed_index')

    const musicMap = new Map<string, any[]>()

    if (musicEdges && musicEdges.length > 0) {
      // Get unique platform combinations
      const platformPairs = Array.from(new Set(
        musicEdges.map(e => `${e.music_platform_name}|||${e.music_platform_id}`)
      )).map(pair => {
        const [platform, id] = pair.split('|||')
        return { platform_name: platform, platform_id: id }
      })

      // Fetch music details for these platforms
      // Since Supabase doesn't support OR filters easily, we'll fetch and filter in memory
      const { data: musicLibrary } = await supabase
        .from('music_library')
        .select('platform_name, platform_id, artist, title, url, thumbnail_url')

      // Create lookup map
      const musicLibraryMap = new Map<string, any>()
      musicLibrary?.forEach(m => {
        const key = `${m.platform_name}:${m.platform_id}`
        musicLibraryMap.set(key, m)
      })

      // Build music map by cast_id
      musicEdges.forEach(edge => {
        const key = `${edge.music_platform_name}:${edge.music_platform_id}`
        const musicDetails = musicLibraryMap.get(key)

        if (musicDetails) {
          const castMusic = musicMap.get(edge.cast_id) || []
          castMusic.push(formatMusic(musicDetails))
          musicMap.set(edge.cast_id, castMusic)
        }
      })
    }

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
