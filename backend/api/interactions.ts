import { Hono } from 'hono'
import { getSupabaseClient } from '../lib/api-utils'
import { addRateLimitHeaders, rateLimitMiddleware } from '../lib/rate-limit'
import { verifyAuthMiddleware } from './auth'

const app = new Hono()

/**
 * POST /api/threads/:castHash/like
 * Like a thread or reply
 * REQUIRES AUTHENTICATION - userId is extracted from JWT
 * Rate limited to prevent vote manipulation
 */
app.post('/:castHash/like', verifyAuthMiddleware, rateLimitMiddleware, async (c) => {
  try {
    const castHash = c.req.param('castHash')

    // CRITICAL SECURITY FIX: Get userId from JWT, not request body
    // This prevents users from liking as other users
    const userId = c.get('fid')

    const supabase = getSupabaseClient()

    // Verify cast exists
    const { data: cast, error: castError } = await supabase
      .from('cast_nodes')
      .select('node_id')
      .eq('node_id', castHash)
      .single()

    if (castError || !cast) {
      return c.json({
        error: {
          code: 'NOT_FOUND',
          message: 'Cast not found'
        }
      }, 404)
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('interaction_edges')
      .select('*')
      .eq('source_id', userId)
      .eq('cast_id', castHash)
      .eq('edge_type', 'LIKED')
      .single()

    if (existingLike) {
      // Already liked, return success
      addRateLimitHeaders(c)
      return c.json({ success: true })
    }

    // Create LIKED edge
    const timestamp = new Date().toISOString()
    const { error: edgeError } = await supabase
      .from('interaction_edges')
      .insert({
        source_id: userId,
        cast_id: castHash,
        edge_type: 'LIKED',
        created_at: timestamp
      })

    if (edgeError) {
      console.error('Error creating LIKED edge:', edgeError)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to like cast'
        }
      }, 500)
    }

    addRateLimitHeaders(c)
    return c.json({ success: true })
  } catch (error) {
    console.error('Like cast error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

/**
 * DELETE /api/threads/:castHash/like
 * Unlike a thread or reply
 * REQUIRES AUTHENTICATION - userId is extracted from JWT
 * Rate limited to prevent abuse
 */
app.delete('/:castHash/like', verifyAuthMiddleware, rateLimitMiddleware, async (c) => {
  try {
    const castHash = c.req.param('castHash')

    // CRITICAL SECURITY FIX: Get userId from JWT, not request body
    // This prevents users from unliking as other users
    const userId = c.get('fid')

    const supabase = getSupabaseClient()

    // Delete LIKED edge
    const { error: deleteError } = await supabase
      .from('interaction_edges')
      .delete()
      .eq('source_id', userId)
      .eq('cast_id', castHash)
      .eq('edge_type', 'LIKED')

    if (deleteError) {
      console.error('Error deleting LIKED edge:', deleteError)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to unlike cast'
        }
      }, 500)
    }

    addRateLimitHeaders(c)
    return c.json({ success: true })
  } catch (error) {
    console.error('Unlike cast error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

export default app
