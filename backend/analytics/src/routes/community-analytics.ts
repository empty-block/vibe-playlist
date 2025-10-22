import { Hono } from 'hono'
import { supabase } from '../lib/db'

const communityAnalytics = new Hono()

// Helper function to convert time range to date filter
function getTimeRangeFilter(timeRange: string) {
  const now = new Date()
  switch (timeRange) {
    case '1d':
      const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      return oneDayAgo.toISOString()
    case '7d':
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return sevenDaysAgo.toISOString()
    case '30d':
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      return thirtyDaysAgo.toISOString()
    case '90d':
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      return ninetyDaysAgo.toISOString()
    default:
      return null // 'all' - no date filter
  }
}

// Community Overview Analytics Endpoint
communityAnalytics.get('/community/overview', async (c) => {
  try {
    const timeRange = c.req.query('timeRange') || '30d'
    const dateFilter = getTimeRangeFilter(timeRange)
    
    // Debug logging
    console.log(`[DEBUG] Time range: ${timeRange}, Date filter: ${dateFilter}`)
    
    // Get basic community metrics using PostgreSQL function
    const { data: basicMetrics, error: basicMetricsError } = await supabase
      .rpc('get_community_basic_metrics', { time_filter: dateFilter })
    
    if (basicMetricsError) {
      console.error('Error executing basic metrics query:', basicMetricsError)
      return c.json({ error: 'Failed to fetch community data' }, 500)
    }

    const metrics = basicMetrics?.[0] || { total_songs_shared: 0, total_interactions: 0, active_users: 0 }
    const totalSongsShared = parseInt(metrics.total_songs_shared)
    const totalInteractions = parseInt(metrics.total_interactions)
    const uniqueActiveUsers = parseInt(metrics.active_users)
    
    console.log(`[DEBUG] Basic metrics for ${timeRange}: songs=${totalSongsShared}, interactions=${totalInteractions}, users=${uniqueActiveUsers}`)
    
    // For sharing rate calculation, we'll use active users as the denominator
    const uniqueSharers = uniqueActiveUsers // Since active users are those who shared music

    // Get platform distribution using PostgreSQL function
    const { data: platformData, error: platformError } = await supabase
      .rpc('get_platform_distribution_by_time_range', { time_filter: dateFilter })
    
    if (platformError) {
      console.error('Error executing platform query:', platformError)
      return c.json({ error: 'Failed to fetch platform data' }, 500)
    }
    
    const platformCounts = (platformData || []).reduce((acc: Record<string, number>, row: any) => {
      acc[row.platform_name] = parseInt(row.engagement_score)
      return acc
    }, {})

    // Get top artists using PostgreSQL function
    console.log(`[DEBUG] Calling get_top_artists_by_time_range with time_filter: ${dateFilter}`)
    const { data: artistData, error: artistError } = await supabase
      .rpc('get_top_artists_by_time_range', { time_filter: dateFilter })
    
    let topArtists: Array<{
      artist: string, 
      unique_sharers: number,
      unique_likers: number,
      unique_recasters: number,
      unique_repliers: number,
      engagement_score: number
    }> = []
    if (artistError) {
      console.error('Error executing artist query:', artistError)
      topArtists = [{ artist: 'Data unavailable', unique_sharers: 0, unique_likers: 0, unique_recasters: 0, unique_repliers: 0, engagement_score: 0 }]
    } else {
      topArtists = (artistData || []).map((row: any) => ({
        artist: row.artist,
        unique_sharers: parseInt(row.unique_sharers),
        unique_likers: parseInt(row.unique_likers),
        unique_recasters: parseInt(row.unique_recasters),
        unique_repliers: parseInt(row.unique_repliers),
        engagement_score: parseInt(row.engagement_score)
      }))
    }

    // Get top songs using PostgreSQL function
    const { data: songData, error: songError } = await supabase
      .rpc('get_top_songs_by_time_range', { time_filter: dateFilter })
    
    let topSongs: Array<{
      song: string, 
      unique_sharers: number,
      unique_likers: number,
      unique_recasters: number,
      unique_repliers: number,
      engagement_score: number
    }> = []
    if (songError) {
      console.error('Error executing song query:', songError)
      topSongs = [{ song: 'Data unavailable', unique_sharers: 0, unique_likers: 0, unique_recasters: 0, unique_repliers: 0, engagement_score: 0 }]
    } else {
      topSongs = (songData || []).map((row: any) => ({
        song: row.song,
        unique_sharers: parseInt(row.unique_sharers),
        unique_likers: parseInt(row.unique_likers),
        unique_recasters: parseInt(row.unique_recasters),
        unique_repliers: parseInt(row.unique_repliers),
        engagement_score: parseInt(row.engagement_score)
      }))
    }

    // Get top genres using PostgreSQL function
    const { data: genreData, error: genreError } = await supabase
      .rpc('get_top_genres_by_time_range', { time_filter: dateFilter })
    
    let topGenres: Array<{
      genre: string, 
      unique_sharers: number,
      unique_likers: number,
      unique_recasters: number,
      unique_repliers: number,
      engagement_score: number
    }> = []
    if (genreError) {
      console.error('Error executing genre query:', genreError)
      topGenres = [{ genre: 'Data unavailable', unique_sharers: 0, unique_likers: 0, unique_recasters: 0, unique_repliers: 0, engagement_score: 0 }]
    } else {
      topGenres = (genreData || []).map((row: any) => ({
        genre: row.genre,
        unique_sharers: parseInt(row.unique_sharers),
        unique_likers: parseInt(row.unique_likers),
        unique_recasters: parseInt(row.unique_recasters),
        unique_repliers: parseInt(row.unique_repliers),
        engagement_score: parseInt(row.engagement_score)
      }))
    }

    // Calculate engagement rate (interactions per active user)
    const engagementRate = uniqueActiveUsers > 0 ? 
      Number((totalInteractions / uniqueActiveUsers).toFixed(2)) : 0

    // Build response
    const response = {
      community: {
        time_range: timeRange,
        total_active_users: uniqueActiveUsers,
        total_songs_shared: totalSongsShared,
        total_interactions: totalInteractions,
        unique_sharers: uniqueSharers
      },
      engagement: {
        interactions_per_user: engagementRate,
        sharing_rate: uniqueActiveUsers > 0 ? 
          Number((uniqueSharers / uniqueActiveUsers * 100).toFixed(1)) : 0
      },
      platforms: {
        distribution: platformCounts,
        total_platforms: Object.keys(platformCounts).length
      },
      trends: {
        top_genres: topGenres,
        top_artists: topArtists,
        top_songs: topSongs
      }
    }

    return c.json(response)

  } catch (error) {
    console.error('Community analytics error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default communityAnalytics 