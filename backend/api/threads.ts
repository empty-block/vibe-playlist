import { Hono } from 'hono'
import { generateMockCastHash } from '../lib/test-data'
import { processMusicUrl, linkMusicToCast } from '../lib/music-metadata-extractor'
import {
  getSupabaseClient,
  encodeCursor,
  decodeCursor
} from '../lib/api-utils'
import { getNeynarService } from '../lib/neynar'

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

    // If trackUrls provided, process through modern pipeline (same as sync engine)
    const musicProcessing = !!(trackUrls && trackUrls.length > 0)
    if (musicProcessing) {
      // Process each track URL through OpenGraph → music_library → AI queue
      for (let i = 0; i < trackUrls.length; i++) {
        processMusicUrl(trackUrls[i]).then(result => {
          if (result.success) {
            linkMusicToCast(castHash, result.platform_name, result.platform_id, i)
              .catch(err => console.error('Error linking music to cast:', err))
          }
        }).catch(err => console.error('Music processing error:', err))
      }
    }

    // Post to Farcaster via Neynar (if configured)
    let farcasterCastHash: string | null = null
    const signerUuid = process.env.NEYNAR_SIGNER_UUID

    if (signerUuid && signerUuid !== 'CHANGEME') {
      try {
        const neynarService = getNeynarService()
        const farcasterResponse = await neynarService.publishCast({
          signerUuid,
          text,
          channelId: 'jamzy', // Post to jamzy channel (may not exist yet)
          embeds: trackUrls || undefined
        })
        farcasterCastHash = farcasterResponse.hash
        console.log('Successfully posted to Farcaster:', farcasterCastHash)
      } catch (farcasterError) {
        // Don't fail the request if Farcaster posting fails
        console.error('Failed to post to Farcaster (non-blocking):', farcasterError)
      }
    } else {
      console.log('Neynar signer not configured, skipping Farcaster posting')
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
      musicProcessing,
      farcasterCastHash // Include Farcaster hash if successfully posted
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

    // Use postgres function to get thread with all replies in one call
    const { data, error } = await supabase
      .rpc('get_thread_with_replies', { thread_cast_hash: castHash })

    if (error) {
      console.error('Error fetching thread with replies:', error)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch thread'
        }
      }, 500)
    }

    if (!data || data.length === 0) {
      return c.json({
        error: {
          code: 'NOT_FOUND',
          message: 'Thread not found'
        }
      }, 404)
    }

    // Separate thread from replies
    const threadData = data.find((item: any) => item.item_type === 'thread')
    const repliesData = data.filter((item: any) => item.item_type === 'reply')

    if (!threadData) {
      return c.json({
        error: {
          code: 'NOT_FOUND',
          message: 'Thread not found'
        }
      }, 404)
    }

    // Format thread
    const thread = {
      castHash: threadData.cast_hash,
      text: threadData.cast_text,
      author: {
        fid: threadData.author_fid,
        username: threadData.author_username,
        displayName: threadData.author_display_name,
        pfpUrl: threadData.author_avatar_url
      },
      timestamp: threadData.created_at,
      music: threadData.music || [],
      stats: {
        replies: repliesData.length,
        likes: parseInt(threadData.likes_count),
        recasts: parseInt(threadData.recasts_count)
      }
    }

    // Format replies
    const formattedReplies = repliesData.map((reply: any) => ({
      castHash: reply.cast_hash,
      text: reply.cast_text,
      author: {
        fid: reply.author_fid,
        username: reply.author_username,
        displayName: reply.author_display_name,
        pfpUrl: reply.author_avatar_url
      },
      timestamp: reply.created_at,
      music: reply.music || [],
      stats: {
        replies: parseInt(reply.replies_count),
        likes: parseInt(reply.likes_count),
        recasts: parseInt(reply.recasts_count)
      }
    }))

    return c.json({
      cast: thread,
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

    // Use postgres function to get threads feed with all data in one call
    const { data: threads, error: threadsError } = await supabase
      .rpc('get_threads_feed', {
        limit_count: limit + 1,
        cursor_timestamp: cursorTimestamp,
        cursor_id: cursorId
      })

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

    // If trackUrls provided, process through modern pipeline (same as sync engine)
    const musicProcessing = !!(trackUrls && trackUrls.length > 0)
    if (musicProcessing) {
      // Process each track URL through OpenGraph → music_library → AI queue
      for (let i = 0; i < trackUrls.length; i++) {
        processMusicUrl(trackUrls[i]).then(result => {
          if (result.success) {
            linkMusicToCast(replyCastHash, result.platform_name, result.platform_id, i)
              .catch(err => console.error('Error linking music to cast:', err))
          }
        }).catch(err => console.error('Music processing error:', err))
      }
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
