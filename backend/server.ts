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
import { resolveUrl } from './api/odesli'
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

// CORS Middleware - Security-first with local dev support
app.use('/*', cors({
  origin: (origin) => {
    // Allowed production domains
    const allowedOrigins = [
      'https://jamzy-miniapp.pages.dev',
      'https://*.jamzy-miniapp.pages.dev',  // Preview deployments
    ]

    // Local dev: allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return origin || '*'
    }

    // Production: check against whitelist
    if (!origin) return null

    for (const allowed of allowedOrigins) {
      if (allowed.includes('*')) {
        // Handle wildcard subdomains
        const regex = new RegExp('^' + allowed.replace('*', '.*') + '$')
        if (regex.test(origin)) return origin
      } else if (allowed === origin) {
        return origin
      }
    }

    // Log rejected origins for debugging
    console.warn('[CORS] Rejected origin:', origin)
    return null
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 86400,  // 24 hours
  credentials: false,
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

// Mount Odesli API proxy
app.get('/api/odesli/resolve', resolveUrl)

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
  // AI Worker - Runs ONLY on Cloudflare Workers (via scheduled() handler)
  // Local dev server is HTTP-only - no background processing
  // Use POST /api/music-ai/process endpoint for manual testing
  // =====================================================
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

    console.log('[Cron] Triggered at:', new Date().toISOString())

    try {
      // Run AI Worker (music metadata processing)
      const batchSize = parseInt(env.AI_WORKER_BATCH_SIZE || '20')
      const aiResult = await processBatch({ batchSize })

      console.log(
        `[Cron] AI Worker: ${aiResult.successful} successful, ${aiResult.failed} failed, ` +
        `${aiResult.totalProcessed} total processed`
      )

      if (aiResult.errors.length > 0) {
        console.error('[Cron] AI Worker errors:', aiResult.errors)
      }

      // Run Channel Sync (sync all 9 channels with interval checking)
      // Music channel: every 5 min, Others: every 30 min (interval logic in worker)
      const { syncAllChannels } = await import('./lib/channel-sync-worker')
      const syncResult = await syncAllChannels()

      console.log(
        `[Cron] Channel Sync: ${syncResult.channelsSynced} channels synced, ` +
        `${syncResult.totalNewCasts} new casts`
      )

      if (syncResult.errors.length > 0) {
        console.error('[Cron] Channel sync errors:', syncResult.errors)
      }

      // OPTIMIZED TIERED LIKES SYNC (TASK-718)
      // New approach with delta fetching and tiered time windows:
      // - Tier 1 (recent, 48hr): Hourly - ~132K CU/month
      // - Tier 2 (medium, 7day): Daily at 2am - ~14K CU/month
      // - Tier 3 (old, >7day): Weekly on Sunday at 3am - ~11K CU/month
      // Total: ~157K CU/month (1.57% of 10M budget)

      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const dayOfWeek = now.getDay() // 0 = Sunday, 6 = Saturday

      // Tier 1: Recent casts (last 48 hours) - run every hour
      if (currentMinute === 0) {
        console.log('[Cron] Starting Tier 1 (recent) likes sync...')
        try {
          const { syncReactionsForTier } = await import('./lib/likes-sync-worker')
          const tier1Result = await syncReactionsForTier('recent')

          console.log(
            `[Cron] Tier 1 Likes Sync: ${tier1Result.castsChecked} casts checked, ` +
            `${tier1Result.castsChanged} changed, ${tier1Result.reactionsAdded} reactions added, ` +
            `${tier1Result.apiCalls} API calls, ${tier1Result.duration}ms`
          )

          if (tier1Result.errors.length > 0) {
            console.error('[Cron] Tier 1 sync errors:', tier1Result.errors)
          }
        } catch (error: any) {
          console.error('[CRON] TIER 1 LIKES SYNC FAILED:', error.message, error.stack)
        }
      }

      // Tier 2: Medium casts (48hr - 7 days) - run daily at 2am
      if (currentHour === 2 && currentMinute === 0) {
        console.log('[Cron] Starting Tier 2 (medium) likes sync...')
        try {
          const { syncReactionsForTier } = await import('./lib/likes-sync-worker')
          const tier2Result = await syncReactionsForTier('medium')

          console.log(
            `[Cron] Tier 2 Likes Sync: ${tier2Result.castsChecked} casts checked, ` +
            `${tier2Result.castsChanged} changed, ${tier2Result.reactionsAdded} reactions added, ` +
            `${tier2Result.apiCalls} API calls, ${tier2Result.duration}ms`
          )

          if (tier2Result.errors.length > 0) {
            console.error('[Cron] Tier 2 sync errors:', tier2Result.errors)
          }
        } catch (error: any) {
          console.error('[CRON] TIER 2 LIKES SYNC FAILED:', error.message, error.stack)
        }
      }

      // Tier 3: Old casts (older than 7 days) - run weekly on Sunday at 3am
      if (dayOfWeek === 0 && currentHour === 3 && currentMinute === 0) {
        console.log('[Cron] Starting Tier 3 (old) likes sync...')
        try {
          const { syncReactionsForTier } = await import('./lib/likes-sync-worker')
          const tier3Result = await syncReactionsForTier('old')

          console.log(
            `[Cron] Tier 3 Likes Sync: ${tier3Result.castsChecked} casts checked, ` +
            `${tier3Result.castsChanged} changed, ${tier3Result.reactionsAdded} reactions added, ` +
            `${tier3Result.apiCalls} API calls, ${tier3Result.duration}ms`
          )

          if (tier3Result.errors.length > 0) {
            console.error('[Cron] Tier 3 sync errors:', tier3Result.errors)
          }
        } catch (error: any) {
          console.error('[CRON] TIER 3 LIKES SYNC FAILED:', error.message, error.stack)
        }
      }
    } catch (error: any) {
      console.error('[Cron] Scheduled task failed:', error.message, error.stack)
    }
  }
}
