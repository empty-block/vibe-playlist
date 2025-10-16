import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { readFileSync } from 'fs'
import { LibraryAPI } from './api/library'
import { AggregationsAPI } from './api/aggregations'
import threadsApp from './api/threads'
import musicApp from './api/music'
import musicAiApp from './api/music-ai'
import interactionsApp from './api/interactions'
import usersApp from './api/users'
import activityApp from './api/activity'
import channelsApp from './api/channels'
import syncApp from './api/sync'

const app = new Hono()

// Middleware
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type']
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

// Legacy static file serving (for existing HTML demo)
app.get('/', (c) => {
  try {
    const html = readFileSync('./vibes-themes.html', 'utf8')
    return c.html(html)
  } catch (error) {
    return c.text('Static file not found', 404)
  }
})

app.get('/app.js', (c) => {
  try {
    const js = readFileSync('./app.js', 'utf8')
    return c.text(js, 200, {
      'Content-Type': 'application/javascript'
    })
  } catch (error) {
    return c.text('Static file not found', 404)
  }
})

app.get('/tailwind-config.js', (c) => {
  try {
    const js = readFileSync('./tailwind-config.js', 'utf8')
    return c.text(js, 200, {
      'Content-Type': 'application/javascript'
    })
  } catch (error) {
    return c.text('Static file not found', 404)
  }
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
console.log('  GET    /api/users/:fid/threads')
console.log('  GET    /api/users/:fid/activity')
console.log('  GET    /api/activity')
console.log('  GET    /api/music/trending')
console.log('  GET    /api/music/:musicId/casts')
console.log('  POST   /api/music-ai/process')
console.log('  GET    /api/music-ai/status')
console.log('  GET    /api/music-ai/failed')
console.log('  GET    /api/music-ai/health')
console.log('  GET    /api/library (legacy)')
console.log('  GET    /api/library/aggregations (legacy)')
console.log('')

export default {
  port,
  fetch: app.fetch
}
