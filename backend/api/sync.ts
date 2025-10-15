import { Hono } from 'hono'
import { getSyncEngine } from '../lib/sync-engine'

const app = new Hono()

/**
 * GET /api/sync/status/:channelId
 * Get sync status for a specific channel
 */
app.get('/status/:channelId', async (c) => {
  try {
    const channelId = c.req.param('channelId')
    const syncEngine = getSyncEngine()

    const status = await syncEngine.getSyncStatus(channelId)

    if (!status) {
      return c.json({
        channelId,
        synced: false,
        message: 'Channel has never been synced'
      })
    }

    return c.json({
      channelId,
      synced: true,
      lastSyncAt: status.lastSyncAt,
      lastSyncCastCount: status.lastSyncCastCount,
      lastSyncSuccess: status.lastSyncSuccess
    })
  } catch (error) {
    console.error('Get sync status error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get sync status'
      }
    }, 500)
  }
})

/**
 * POST /api/sync/trigger/:channelId
 * Manually trigger a sync for a specific channel
 */
app.post('/trigger/:channelId', async (c) => {
  try {
    const channelId = c.req.param('channelId')
    const forceFullSync = c.req.query('forceFullSync') === 'true'
    const limit = parseInt(c.req.query('limit') || '50')

    const syncEngine = getSyncEngine()

    console.log(`[Sync API] Manually triggering sync for channel: ${channelId}`)

    const result = await syncEngine.syncChannel(channelId, {
      limit,
      forceFullSync
    })

    return c.json({
      channelId,
      success: result.success,
      castsProcessed: result.castsProcessed,
      newCasts: result.newCasts,
      errors: result.errors
    })
  } catch (error) {
    console.error('Trigger sync error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to trigger sync'
      }
    }, 500)
  }
})

/**
 * POST /api/sync/replies/:castHash
 * Manually trigger reply sync for a specific cast
 */
app.post('/replies/:castHash', async (c) => {
  try {
    const castHash = c.req.param('castHash')
    const channelId = c.req.query('channelId') || 'unknown'

    const syncEngine = getSyncEngine()

    console.log(`[Sync API] Manually triggering reply sync for cast: ${castHash}`)

    const repliesProcessed = await syncEngine.syncReplies(castHash, channelId)

    return c.json({
      castHash,
      channelId,
      repliesProcessed,
      success: true
    })
  } catch (error) {
    console.error('Trigger reply sync error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to trigger reply sync'
      }
    }, 500)
  }
})

export default app
