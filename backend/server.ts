import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { LibraryAPI } from './api/library'
import { AggregationsAPI } from './api/aggregations'
import threadsApp from './api/threads'
import musicApp from './api/music'
import musicAiApp from './api/music-ai'
import trendingApp from './api/trending'
import interactionsApp from './api/interactions'
import usersApp from './api/users'
import activityApp from './api/activity'
import channelsApp from './api/channels'
import syncApp from './api/sync'
import authApp from './api/auth'
import { getWorker } from './lib/ai-worker'
import { processBatch } from './lib/ai-queue-processor'

// Cloudflare Workers environment bindings type
type Bindings = {
  SUPABASE_URL: string
  SUPABASE_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  NEYNAR_API_KEY: string
  ANTHROPIC_API_KEY: string
  AI_WORKER_BATCH_SIZE: string
  NODE_ENV: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware to inject Cloudflare env into process.env for compatibility
app.use('/*', async (c, next) => {
  // In Cloudflare Workers, patch process.env with Worker bindings
  if (c.env) {
    Object.assign(process.env, c.env)
  }
  await next()
})

// Middleware
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

// Legacy API handlers (existing functionality)
const libraryAPI = new LibraryAPI()
const aggregationsAPI = new AggregationsAPI()

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'jamzy-backend-api'
  })
})

// Mount auth routes
app.route('/api/auth', authApp)

// Mount mini-app thread routes
app.route('/api/threads', threadsApp)

// Mount interaction routes (nested under /api/threads)
app.route('/api/threads', interactionsApp)

// Mount channels routes
app.route('/api/channels', channelsApp)

// Mount sync routes
app.route('/api/sync', syncApp)

// Mount mini-app music routes
app.route('/api/music', musicApp)

// Mount music AI processing routes
app.route('/api/music-ai', musicAiApp)

// Mount trending routes
app.route('/api/trending', trendingApp)

// Mount user routes
app.route('/api/users', usersApp)

// Mount activity routes
app.route('/api/activity', activityApp)

// Legacy library routes (existing web app)
app.all('/api/library/aggregations', async (c) => {
  return await aggregationsAPI.handleRequest(c.req.raw)
})

app.all('/api/library', async (c) => {
  return await libraryAPI.handleRequest(c.req.raw)
})

// Global error handler
app.onError((err, c) => {
  console.error('Server error:', err)
  return c.json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }
  }, 500)
})

// 404 handler
app.notFound((c) => {
  return c.json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  }, 404)
})

// =====================================================
// Local Development Server
// =====================================================
// Only run server and AI worker in local dev mode
// In Cloudflare Workers, the export handles everything
const isLocalDev = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'

if (isLocalDev) {
  const port = parseInt(process.env.PORT || '4201')

  console.log('🎵 JAMZY Backend API')
  console.log(`🚀 Running on http://localhost:${port}`)
  console.log('')
  console.log('📍 API Endpoints:')
  console.log('  GET    /api/health')
  console.log('  POST   /api/threads')
  console.log('  GET    /api/threads')
  console.log('  GET    /api/threads/:castHash')
  console.log('  POST   /api/threads/:castHash/reply')
  console.log('  POST   /api/threads/:castHash/like')
  console.log('  DELETE /api/threads/:castHash/like')
  console.log('  GET    /api/channels')
  console.log('  GET    /api/channels/:channelId')
  console.log('  GET    /api/channels/:channelId/feed')
  console.log('  GET    /api/sync/status/:channelId')
  console.log('  POST   /api/sync/trigger/:channelId')
  console.log('  POST   /api/sync/replies/:castHash')
  console.log('  GET    /api/users/:fid')
  console.log('  GET    /api/users/:fid/threads')
  console.log('  GET    /api/users/:fid/activity')
  console.log('  GET    /api/activity')
  console.log('  GET    /api/music/trending')
  console.log('  GET    /api/music/:musicId/casts')
  console.log('  GET    /api/trending/users')
  console.log('  POST   /api/music-ai/process')
  console.log('  GET    /api/music-ai/status')
  console.log('  GET    /api/music-ai/failed')
  console.log('  GET    /api/music-ai/health')
  console.log('  GET    /api/library (legacy)')
  console.log('  GET    /api/library/aggregations (legacy)')
  console.log('')

  // =====================================================
  // AI Worker - Background music metadata processing
  // =====================================================

  // Start AI worker if enabled (default: true)
  const workerEnabled = process.env.AI_WORKER_ENABLED !== 'false'

  if (workerEnabled) {
    const workerConfig = {
      intervalMs: parseInt(process.env.AI_WORKER_INTERVAL_MS || '30000'),
      batchSize: parseInt(process.env.AI_WORKER_BATCH_SIZE || '20'),
      runImmediately: true
    }

    const worker = getWorker(workerConfig)
    worker.start()

    console.log('🤖 AI Worker Status:')
    console.log(`   ✓ Enabled and running`)
    console.log(`   Interval: ${workerConfig.intervalMs}ms (${workerConfig.intervalMs / 1000}s)`)
    console.log(`   Batch size: ${workerConfig.batchSize} tracks`)
    console.log('')

    // Graceful shutdown handler
    const shutdown = () => {
      console.log('\n🛑 Shutting down gracefully...')
      worker.stop()
      console.log('✓ AI Worker stopped')
      process.exit(0)
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
  } else {
    console.log('🤖 AI Worker Status:')
    console.log('   ✗ Disabled (set AI_WORKER_ENABLED=true to enable)')
    console.log('')
  }
}

// =====================================================
// Cloudflare Workers Export
// =====================================================
// This export is used both for local dev (Bun) and Cloudflare Workers
export default {
  // HTTP request handler
  fetch: app.fetch,

  // Scheduled handler for Cron Triggers (Cloudflare Workers only)
  async scheduled(event: any, env: Bindings, ctx: any) {
    // Inject Cloudflare env into process.env for compatibility
    Object.assign(process.env, env)

    console.log('[Cron] AI Worker triggered at:', new Date().toISOString())

    try {
      const batchSize = parseInt(env.AI_WORKER_BATCH_SIZE || '20')
      const result = await processBatch({ batchSize })

      console.log(
        `[Cron] Batch complete: ${result.successful} successful, ${result.failed} failed, ` +
        `${result.totalProcessed} total processed`
      )

      if (result.errors.length > 0) {
        console.error('[Cron] Batch had errors:', result.errors)
      }
    } catch (error: any) {
      console.error('[Cron] Scheduled task failed:', error.message)
    }
  }
}
