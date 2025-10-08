import { Hono } from 'hono'
import { generateMockCastHash } from '../lib/test-data'
import { extractAndStoreMusicMetadata } from '../lib/music-extraction'
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

const app = new Hono()

/**
 * POST /api/threads
 * Create a new thread with test data
 */
app.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const { text, trackUrls, userId } = body

    if (!text || !userId) {
      return c.json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Missing required fields: text and userId'
        }
      }, 400)
    }

    const supabase = getSupabaseClient()
    const castHash = generateMockCastHash()
    const timestamp = new Date().toISOString()

    // Insert cast_node
    const { error: castError } = await supabase
      .from('cast_nodes')
      .insert({
        node_id: castHash,
        cast_text: text,
        author_fid: userId,
        parent_cast_hash: null,
        root_parent_hash: null,
        channel: 'jamzy',
        created_at: timestamp
      })

    if (castError) {
      console.error('Error creating cast:', castError)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create thread'
        }
      }, 500)
    }

    // Create AUTHORED edge
    const { error: edgeError } = await supabase
      .from('interaction_edges')
      .insert({
        source_id: userId,
        cast_id: castHash,
        edge_type: 'AUTHORED',
        created_at: timestamp
      })

    if (edgeError) {
      console.error('Error creating interaction edge:', edgeError)
    }

    // If trackUrls provided, extract music metadata (fire-and-forget)
    const musicProcessing = !!(trackUrls && trackUrls.length > 0)
    if (musicProcessing) {
      extractAndStoreMusicMetadata(castHash, trackUrls).catch(err =>
        console.error('Background music extraction error:', err)
      )
    }

    // Fetch user info for response
    const { data: user } = await supabase
      .from('user_nodes')
      .select('node_id, fname, display_name, avatar_url')
      .eq('node_id', userId)
      .single()

    return c.json({
      castHash,
      text,
      author: {
        fid: userId,
        username: user?.fname || 'unknown',
        displayName: user?.display_name || 'Unknown User',
        pfpUrl: user?.avatar_url
      },
      timestamp,
      stats: {
        likes: 0,
        replies: 0,
        recasts: 0
      },
      musicProcessing
    })
  } catch (error) {
    console.error('Create thread error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

/**
 * GET /api/threads/:castHash
 * Get a specific thread with all replies
 */
app.get('/:castHash', async (c) => {
  try {
    const castHash = c.req.param('castHash')
    const supabase = getSupabaseClient()

    // Fetch the thread
    const { data: thread, error: threadError } = await supabase
      .from('cast_nodes')
      .select('*')
      .eq('node_id', castHash)
      .single()

    if (threadError || !thread) {
      return c.json({
        error: {
          code: 'NOT_FOUND',
          message: 'Thread not found'
        }
      }, 404)
    }

    // Fetch thread author
    const { data: author } = await supabase
      .from('user_nodes')
      .select('node_id, fname, display_name, avatar_url')
      .eq('node_id', thread.author_fid)
      .single()

    // Fetch thread music
    const { data: threadMusic } = await supabase
      .from('cast_music_edges')
      .select(`
        music_platform,
        music_platform_id,
        music_library!inner (
          platform,
          platform_id,
          artist,
          title,
          url,
          thumbnail_url
        )
      `)
      .eq('cast_id', castHash)

    // Fetch thread stats
    const { data: stats } = await supabase
      .from('interaction_edges')
      .select('edge_type')
      .eq('cast_id', castHash)

    const likes = stats?.filter(s => s.edge_type === 'LIKED').length || 0
    const recasts = stats?.filter(s => s.edge_type === 'RECASTED').length || 0

    // Fetch replies
    const { data: replies, error: repliesError } = await supabase
      .from('cast_nodes')
      .select('*')
      .eq('parent_cast_hash', castHash)
      .order('created_at', { ascending: true })

    if (repliesError) {
      console.error('Error fetching replies:', repliesError)
    }

    // Fetch reply authors
    const replyAuthorFids = Array.from(new Set(replies?.map(r => r.author_fid) || []))
    const { data: replyAuthors } = await supabase
      .from('user_nodes')
      .select('node_id, fname, display_name, avatar_url')
      .in('node_id', replyAuthorFids)

    const authorMap = new Map(replyAuthors?.map(a => [a.node_id, a]) || [])

    // Fetch music for all replies
    const replyCastIds = replies?.map(r => r.node_id) || []
    const { data: replyMusic } = await supabase
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
      .in('cast_id', replyCastIds)

    // Group music by cast_id
    const musicMap = new Map<string, any[]>()
    replyMusic?.forEach(m => {
      const castMusic = musicMap.get(m.cast_id) || []
      castMusic.push(m.music_library)
      musicMap.set(m.cast_id, castMusic)
    })

    // Fetch stats for all replies
    const { data: replyStats } = await supabase
      .from('interaction_edges')
      .select('cast_id, edge_type')
      .in('cast_id', replyCastIds)

    const statsMap = new Map<string, { likes: number; recasts: number }>()
    replyStats?.forEach(s => {
      const current = statsMap.get(s.cast_id) || { likes: 0, recasts: 0 }
      if (s.edge_type === 'LIKED') current.likes++
      if (s.edge_type === 'RECASTED') current.recasts++
      statsMap.set(s.cast_id, current)
    })

    // Count replies for all replies in a single query (nested replies)
    const { data: nestedRepliesData } = await supabase
      .from('cast_nodes')
      .select('parent_cast_hash')
      .in('parent_cast_hash', replyCastIds)
      .not('parent_cast_hash', 'is', null)

    // Build reply counts map
    const replyCounts = new Map<string, number>()
    nestedRepliesData?.forEach(nested => {
      const count = replyCounts.get(nested.parent_cast_hash!) || 0
      replyCounts.set(nested.parent_cast_hash!, count + 1)
    })

    const formattedReplies = (replies || []).map(reply => {
      const replyAuthor = authorMap.get(reply.author_fid)
      const replyMusicData = musicMap.get(reply.node_id) || []
      const replyStatsData = statsMap.get(reply.node_id) || { likes: 0, recasts: 0 }

      return {
        castHash: reply.node_id,
        text: reply.cast_text,
        author: {
          fid: reply.author_fid,
          username: replyAuthor?.fname || 'unknown',
          displayName: replyAuthor?.display_name || 'Unknown User',
          pfpUrl: replyAuthor?.avatar_url
        },
        timestamp: reply.created_at,
        music: replyMusicData.map(m => ({
          id: `${m.platform}-${m.platform_id}`,
          title: m.title,
          artist: m.artist,
          platform: m.platform,
          platformId: m.platform_id,
          url: m.url,
          thumbnail: m.thumbnail_url
        })),
        stats: {
          replies: replyCounts.get(reply.node_id) || 0,
          likes: replyStatsData.likes,
          recasts: replyStatsData.recasts
        }
      }
    })

    return c.json({
      cast: {
        castHash: thread.node_id,
        text: thread.cast_text,
        author: {
          fid: thread.author_fid,
          username: author?.fname || 'unknown',
          displayName: author?.display_name || 'Unknown User',
          pfpUrl: author?.avatar_url
        },
        timestamp: thread.created_at,
        music: (threadMusic || []).map((m: any) => ({
          id: `${m.music_library.platform}-${m.music_library.platform_id}`,
          title: m.music_library.title,
          artist: m.music_library.artist,
          platform: m.music_library.platform,
          platformId: m.music_library.platform_id,
          url: m.music_library.url,
          thumbnail: m.music_library.thumbnail_url
        })),
        stats: {
          replies: formattedReplies.length,
          likes,
          recasts
        }
      },
      replies: formattedReplies
    })
  } catch (error) {
    console.error('Get thread error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

/**
 * GET /api/threads
 * Get feed of threads with cursor-based pagination
 */
app.get('/', async (c) => {
  try {
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100)
    const cursor = c.req.query('cursor')

    const supabase = getSupabaseClient()

    let query = supabase
      .from('cast_nodes')
      .select('*')
      .is('parent_cast_hash', null)
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
      console.error('Error fetching threads:', threadsError)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch threads'
        }
      }, 500)
    }

    const hasMore = threads.length > limit
    const threadsToReturn = threads.slice(0, limit)

    // Fetch authors
    const authorFids = Array.from(new Set(threadsToReturn.map(t => t.author_fid)))
    const { data: authors } = await supabase
      .from('user_nodes')
      .select('node_id, fname, display_name, avatar_url')
      .in('node_id', authorFids)

    const authorMap = new Map(authors?.map(a => [a.node_id, a]) || [])

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

    // Count replies for all threads in a single query
    const { data: repliesData } = await supabase
      .from('cast_nodes')
      .select('parent_cast_hash')
      .in('parent_cast_hash', castIds)
      .not('parent_cast_hash', 'is', null)

    // Build reply counts map
    const replyCounts = new Map<string, number>()
    repliesData?.forEach(reply => {
      const count = replyCounts.get(reply.parent_cast_hash!) || 0
      replyCounts.set(reply.parent_cast_hash!, count + 1)
    })

    const formattedThreads = threadsToReturn.map(thread => {
      const author = authorMap.get(thread.author_fid)
      const threadMusic = musicMap.get(thread.node_id) || []
      const threadStats = statsMap.get(thread.node_id) || { likes: 0, recasts: 0 }

      return {
        castHash: thread.node_id,
        text: thread.cast_text,
        author: {
          fid: thread.author_fid,
          username: author?.fname || 'unknown',
          displayName: author?.display_name || 'Unknown User',
          pfpUrl: author?.avatar_url
        },
        timestamp: thread.created_at,
        music: threadMusic.map(m => ({
          id: `${m.platform}-${m.platform_id}`,
          title: m.title,
          artist: m.artist,
          platform: m.platform,
          platformId: m.platform_id,
          url: m.url,
          thumbnail: m.thumbnail_url
        })),
        stats: {
          replies: replyCounts.get(thread.node_id) || 0,
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

    return c.json({
      threads: formattedThreads,
      nextCursor
    })
  } catch (error) {
    console.error('Get threads error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

/**
 * POST /api/threads/:castHash/reply
 * Reply to a thread
 */
app.post('/:castHash/reply', async (c) => {
  try {
    const parentCastHash = c.req.param('castHash')
    const body = await c.req.json()
    const { text, trackUrls, userId } = body

    if (!text || !userId) {
      return c.json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Missing required fields: text and userId'
        }
      }, 400)
    }

    const supabase = getSupabaseClient()

    // Verify parent thread exists
    const { data: parentThread, error: parentError } = await supabase
      .from('cast_nodes')
      .select('node_id, root_parent_hash')
      .eq('node_id', parentCastHash)
      .single()

    if (parentError || !parentThread) {
      return c.json({
        error: {
          code: 'NOT_FOUND',
          message: 'Parent thread not found'
        }
      }, 404)
    }

    const replyCastHash = generateMockCastHash()
    const timestamp = new Date().toISOString()
    const rootParentHash = parentThread.root_parent_hash || parentCastHash

    // Insert reply cast_node
    const { error: castError } = await supabase
      .from('cast_nodes')
      .insert({
        node_id: replyCastHash,
        cast_text: text,
        author_fid: userId,
        parent_cast_hash: parentCastHash,
        root_parent_hash: rootParentHash,
        channel: 'jamzy',
        created_at: timestamp
      })

    if (castError) {
      console.error('Error creating reply:', castError)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create reply'
        }
      }, 500)
    }

    // Create AUTHORED edge for the reply
    const { error: authoredEdgeError } = await supabase
      .from('interaction_edges')
      .insert({
        source_id: userId,
        cast_id: replyCastHash,
        edge_type: 'AUTHORED',
        created_at: timestamp
      })

    if (authoredEdgeError) {
      console.error('Error creating AUTHORED edge:', authoredEdgeError)
    }

    // If trackUrls provided, extract music metadata (fire-and-forget)
    const musicProcessing = !!(trackUrls && trackUrls.length > 0)
    if (musicProcessing) {
      extractAndStoreMusicMetadata(replyCastHash, trackUrls).catch(err =>
        console.error('Background music extraction error:', err)
      )
    }

    // Fetch user info for response
    const { data: user } = await supabase
      .from('user_nodes')
      .select('node_id, fname, display_name, avatar_url')
      .eq('node_id', userId)
      .single()

    return c.json({
      castHash: replyCastHash,
      text,
      parentCastHash,
      author: {
        fid: userId,
        username: user?.fname || 'unknown',
        displayName: user?.display_name || 'Unknown User',
        pfpUrl: user?.avatar_url
      },
      timestamp,
      music: [],
      stats: {
        replies: 0,
        likes: 0,
        recasts: 0
      },
      musicProcessing
    })
  } catch (error) {
    console.error('Create reply error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

export default app
