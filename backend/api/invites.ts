import { Hono } from 'hono'
import { customAlphabet } from 'nanoid'
import { getSupabaseClient } from '../lib/api-utils'
import { addRateLimitHeaders, rateLimitMiddleware } from '../lib/rate-limit'
import { verifyAdminMiddleware } from '../lib/auth-helpers'

const app = new Hono()

// Generate invite codes without confusing characters (0, O, I, 1, l)
const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8)

/**
 * POST /api/invites/verify
 * Verify if an invite code is valid without redeeming it
 * Rate limited to prevent brute force attacks
 */
app.post('/verify', rateLimitMiddleware, async (c) => {
  try {
    const body = await c.req.json()
    const { code } = body

    if (!code) {
      return c.json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Missing invite code'
        }
      }, 400)
    }

    const supabase = getSupabaseClient()

    // Check if code exists and is valid
    const { data: codeData, error: codeError } = await supabase
      .from('invite_codes')
      .select('code, current_uses, max_uses, is_active, expires_at')
      .eq('code', code)
      .single()

    if (codeError || !codeData) {
      return c.json({
        valid: false,
        error: {
          code: 'INVALID_CODE',
          message: 'Invalid invite code'
        }
      }, 200) // Return 200 with valid:false instead of 400
    }

    // Check if code is still active
    if (!codeData.is_active) {
      return c.json({
        valid: false,
        error: {
          code: 'INACTIVE_CODE',
          message: 'This invite code is no longer active'
        }
      }, 200)
    }

    // Check if code has expired
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return c.json({
        valid: false,
        error: {
          code: 'EXPIRED_CODE',
          message: 'This invite code has expired'
        }
      }, 200)
    }

    // Check if code has uses remaining
    if (codeData.current_uses >= codeData.max_uses) {
      return c.json({
        valid: false,
        error: {
          code: 'CODE_EXHAUSTED',
          message: 'This invite code has already been used'
        }
      }, 200)
    }

    addRateLimitHeaders(c)
    return c.json({
      valid: true
    })
  } catch (error) {
    console.error('Error verifying invite code:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

/**
 * POST /api/invites/redeem
 * Redeem an invite code for a Farcaster ID
 * Rate limited to prevent abuse
 */
app.post('/redeem', rateLimitMiddleware, async (c) => {
  try {
    const body = await c.req.json()
    const { code, fid } = body

    if (!code || !fid) {
      return c.json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Missing invite code or Farcaster ID'
        }
      }, 400)
    }

    // Get IP address for rate limiting tracking
    const ipAddress = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'

    const supabase = getSupabaseClient()

    // Call the atomic redemption function
    const { data, error } = await supabase.rpc('redeem_invite_code', {
      p_code: code,
      p_fid: fid,
      p_ip_address: ipAddress
    })

    if (error) {
      console.error('Error redeeming invite code:', error)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error'
        }
      }, 500)
    }

    const result = data[0]

    if (!result.success) {
      return c.json({
        success: false,
        error: {
          code: result.error_code,
          message: result.error_message
        }
      }, 200) // Return 200 with success:false for client-side error handling
    }

    addRateLimitHeaders(c)
    return c.json({
      success: true
    })
  } catch (error) {
    console.error('Error redeeming invite code:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

/**
 * POST /api/invites/check-status
 * Check if a FID has already redeemed an invite code
 */
app.post('/check-status', async (c) => {
  try {
    // Check for dev mode bypass
    if (process.env.BYPASS_INVITE_CHECK === 'true') {
      return c.json({
        hasAccess: true,
        devMode: true
      })
    }

    const body = await c.req.json()
    const { fid } = body

    if (!fid) {
      return c.json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Missing Farcaster ID'
        }
      }, 400)
    }

    const supabase = getSupabaseClient()

    // Check if FID has a redemption
    const { data, error } = await supabase
      .from('invite_redemptions')
      .select('id, redeemed_at, invite_code')
      .eq('redeemed_by_fid', fid)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking invite status:', error)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error'
        }
      }, 500)
    }

    addRateLimitHeaders(c)
    return c.json({
      hasAccess: !!data,
      redemption: data || null
    })
  } catch (error) {
    console.error('Error checking invite status:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

/**
 * POST /api/invites/create
 * Admin only: Generate new invite codes
 * REQUIRES ADMIN AUTHENTICATION - only FID 326181
 */
app.post('/create', verifyAdminMiddleware, async (c) => {
  try {
    const body = await c.req.json()
    const { count = 1, isTest = false } = body

    // SECURITY: Get adminFid from JWT (verified by middleware), not from request body
    const adminFid = c.get('fid')

    if (!count || count < 1 || count > 1000) {
      return c.json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Count must be between 1 and 1000'
        }
      }, 400)
    }

    const supabase = getSupabaseClient()
    const codes = []

    // Generate codes
    for (let i = 0; i < count; i++) {
      const code = `JAMZY-${nanoid()}`
      codes.push({
        code,
        created_by_fid: adminFid,
        max_uses: isTest ? 999999 : 1,
        is_test_code: isTest
      })
    }

    // Insert all codes
    const { error } = await supabase
      .from('invite_codes')
      .insert(codes)

    if (error) {
      console.error('Error creating invite codes:', error)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create invite codes'
        }
      }, 500)
    }

    addRateLimitHeaders(c)
    return c.json({
      success: true,
      count: codes.length,
      codes: codes.map(c => c.code),
      isTest
    })
  } catch (error) {
    console.error('Error creating invite codes:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

/**
 * GET /api/invites/stats
 * Admin only: Get invite code statistics
 * REQUIRES ADMIN AUTHENTICATION - only FID 326181
 */
app.get('/stats', verifyAdminMiddleware, async (c) => {
  try {
    // SECURITY: Admin already verified by middleware, no need to check FID from query

    const supabase = getSupabaseClient()

    // Get total codes
    const { count: totalCodes } = await supabase
      .from('invite_codes')
      .select('*', { count: 'exact', head: true })

    // Get total redemptions
    const { count: totalRedemptions } = await supabase
      .from('invite_redemptions')
      .select('*', { count: 'exact', head: true })

    // Get test vs regular codes
    const { count: testCodes } = await supabase
      .from('invite_codes')
      .select('*', { count: 'exact', head: true })
      .eq('is_test_code', true)

    // Get unused codes
    const { count: unusedCodes } = await supabase
      .from('invite_codes')
      .select('*', { count: 'exact', head: true })
      .eq('current_uses', 0)
      .eq('is_active', true)

    // Get recent redemptions
    const { data: recentRedemptions } = await supabase
      .from('invite_redemptions')
      .select('redeemed_by_fid, redeemed_at, invite_code')
      .order('redeemed_at', { ascending: false })
      .limit(10)

    addRateLimitHeaders(c)
    return c.json({
      totalCodes: totalCodes || 0,
      totalRedemptions: totalRedemptions || 0,
      testCodes: testCodes || 0,
      regularCodes: (totalCodes || 0) - (testCodes || 0),
      unusedCodes: unusedCodes || 0,
      redemptionRate: totalCodes ? ((totalRedemptions || 0) / totalCodes * 100).toFixed(1) + '%' : '0%',
      recentRedemptions: recentRedemptions || []
    })
  } catch (error) {
    console.error('Error fetching invite stats:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

export default app
