import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import userAnalytics from './routes/user-analytics'
import communityAnalytics from './routes/community-analytics'
import artistAnalytics from './routes/artist-analytics'

// Create the main Hono app
const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Frontend dev servers
  credentials: true
}))

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    service: 'jamzy-analytics-api',
    timestamp: new Date().toISOString()
  })
})

// Mount analytics routes
app.route('/api/v1/analytics', userAnalytics)
app.route('/api/v1/analytics', communityAnalytics)
app.route('/api/v1/analytics', artistAnalytics)

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Application error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

// Start the server
const port = process.env.PORT || 3001
console.log(`🎵 Jamzy Analytics API starting on port ${port}`)

export default {
  port,
  fetch: app.fetch,
} 