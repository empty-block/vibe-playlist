/**
 * Music AI Processing API
 * Endpoints for triggering and monitoring AI music metadata extraction
 *
 * TASK-650: API endpoints for manual AI processing and queue status
 * TASK-657: Worker control endpoints
 */

import { Hono } from 'hono'
import { processBatch, getQueueStats, getFailedItems } from '../lib/ai-queue-processor'
import { getWorker } from '../lib/ai-worker'

const app = new Hono()

/**
 * POST /api/music-ai/process
 * Trigger manual AI processing of queued items
 *
 * Query params:
 * - limit: number of items to process (default: 20)
 * - model: Claude model to use (default: claude-3-5-haiku-20241022)
 */
app.post('/process', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20')
    const model = c.req.query('model') || 'claude-3-5-haiku-20241022'

    console.log(`[Music AI API] Processing batch with limit=${limit}, model=${model}`)

    // Check if ANTHROPIC_API_KEY is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return c.json({
        error: 'ANTHROPIC_API_KEY not configured'
      }, 500)
    }

    // Process batch
    const result = await processBatch({
      batchSize: limit,
      model
    })

    // Return processing result
    return c.json({
      success: true,
      processed: result.totalProcessed,
      successful: result.successful,
      failed: result.failed,
      errors: result.errors.length > 0 ? result.errors : undefined
    })

  } catch (error: any) {
    console.error('[Music AI API] Processing failed:', error.message)
    return c.json({
      error: `Processing failed: ${error.message}`
    }, 500)
  }
})

/**
 * GET /api/music-ai/status
 * Get current queue status and statistics
 */
app.get('/status', async (c) => {
  try {
    const stats = await getQueueStats()

    return c.json({
      queue: {
        pending: stats.pending,
        processing: stats.processing,
        completed: stats.completed,
        failed: stats.failed,
        total: stats.totalQueued
      },
      percentages: {
        completed: stats.totalQueued > 0
          ? ((stats.completed / stats.totalQueued) * 100).toFixed(1)
          : '0.0',
        failed: stats.totalQueued > 0
          ? ((stats.failed / stats.totalQueued) * 100).toFixed(1)
          : '0.0'
      }
    })

  } catch (error: any) {
    console.error('[Music AI API] Failed to get status:', error.message)
    return c.json({
      error: `Failed to get status: ${error.message}`
    }, 500)
  }
})

/**
 * GET /api/music-ai/failed
 * Get list of failed items with error messages
 *
 * Query params:
 * - limit: number of items to return (default: 10, max: 100)
 */
app.get('/failed', async (c) => {
  try {
    const limit = Math.min(parseInt(c.req.query('limit') || '10'), 100)

    const failedItems = await getFailedItems(limit)

    return c.json({
      count: failedItems.length,
      items: failedItems
    })

  } catch (error: any) {
    console.error('[Music AI API] Failed to get failed items:', error.message)
    return c.json({
      error: `Failed to get failed items: ${error.message}`
    }, 500)
  }
})

/**
 * GET /api/music-ai/health
 * Health check endpoint
 */
app.get('/health', (c) => {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY

  return c.json({
    status: 'ok',
    anthropic_configured: hasApiKey,
    message: hasApiKey
      ? 'AI music extractor is ready'
      : 'ANTHROPIC_API_KEY not configured'
  })
})

/**
 * GET /api/music-ai/worker/status
 * Get background worker status
 */
app.get('/worker/status', (c) => {
  try {
    const worker = getWorker()
    const status = worker.getStatus()

    return c.json({
      worker: {
        enabled: process.env.AI_WORKER_ENABLED !== 'false',
        isRunning: status.isRunning,
        isPaused: status.isPaused,
        isProcessing: status.isProcessing,
        lastRunAt: status.lastRunAt,
        nextRunAt: status.nextRunAt
      },
      stats: {
        totalRuns: status.totalRuns,
        totalProcessed: status.totalProcessed,
        totalSuccessful: status.totalSuccessful,
        totalFailed: status.totalFailed,
        successRate: status.totalProcessed > 0
          ? ((status.totalSuccessful / status.totalProcessed) * 100).toFixed(1)
          : '0.0'
      },
      config: {
        intervalMs: parseInt(process.env.AI_WORKER_INTERVAL_MS || '30000'),
        batchSize: parseInt(process.env.AI_WORKER_BATCH_SIZE || '20')
      }
    })
  } catch (error: any) {
    console.error('[Music AI API] Failed to get worker status:', error.message)
    return c.json({
      error: `Failed to get worker status: ${error.message}`
    }, 500)
  }
})

/**
 * POST /api/music-ai/worker/pause
 * Pause the background worker
 */
app.post('/worker/pause', (c) => {
  try {
    const worker = getWorker()
    worker.pause()

    return c.json({
      success: true,
      message: 'Worker paused',
      status: worker.getStatus()
    })
  } catch (error: any) {
    console.error('[Music AI API] Failed to pause worker:', error.message)
    return c.json({
      error: `Failed to pause worker: ${error.message}`
    }, 400)
  }
})

/**
 * POST /api/music-ai/worker/resume
 * Resume the background worker
 */
app.post('/worker/resume', (c) => {
  try {
    const worker = getWorker()
    worker.resume()

    return c.json({
      success: true,
      message: 'Worker resumed',
      status: worker.getStatus()
    })
  } catch (error: any) {
    console.error('[Music AI API] Failed to resume worker:', error.message)
    return c.json({
      error: `Failed to resume worker: ${error.message}`
    }, 400)
  }
})

export default app
