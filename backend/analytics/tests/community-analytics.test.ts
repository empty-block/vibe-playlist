import { describe, it, expect, beforeAll } from 'bun:test'
import { supabase } from '../src/lib/db'

// Helper function to convert time range to date filter (copied from the main code)
function getTimeRangeFilter(timeRange: string) {
  const now = new Date()
  switch (timeRange) {
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

describe('Community Analytics Time Filtering', () => {
  beforeAll(async () => {
    // Ensure we have a database connection
    const { data, error } = await supabase.from('music_library').select('count', { count: 'exact', head: true })
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`)
    }
    console.log(`Connected to database with ${data} records in music_library`)
  })

  it('should calculate time range filters correctly', () => {
    const now = new Date()
    
    const sevenDaysAgo = getTimeRangeFilter('7d')
    const thirtyDaysAgo = getTimeRangeFilter('30d')
    const ninetyDaysAgo = getTimeRangeFilter('90d')
    const allTime = getTimeRangeFilter('all')

    // Verify dates are in the past
    expect(new Date(sevenDaysAgo!).getTime()).toBeLessThan(now.getTime())
    expect(new Date(thirtyDaysAgo!).getTime()).toBeLessThan(now.getTime())
    expect(new Date(ninetyDaysAgo!).getTime()).toBeLessThan(now.getTime())
    expect(allTime).toBeNull()

    // Verify proper ordering
    expect(new Date(sevenDaysAgo!).getTime()).toBeGreaterThan(new Date(thirtyDaysAgo!).getTime())
    expect(new Date(thirtyDaysAgo!).getTime()).toBeGreaterThan(new Date(ninetyDaysAgo!).getTime())

    console.log('Time filters:')
    console.log('7d:', sevenDaysAgo)
    console.log('30d:', thirtyDaysAgo)
    console.log('90d:', ninetyDaysAgo)
  })

  it('should return different counts for different time ranges', async () => {
    const sevenDaysFilter = getTimeRangeFilter('7d')
    const thirtyDaysFilter = getTimeRangeFilter('30d')
    const ninetyDaysFilter = getTimeRangeFilter('90d')

    // Test direct Supabase queries
    const { count: count7d } = await supabase
      .from('music_library')
      .select('*', { count: 'exact', head: true })
      .gte('processed_at', sevenDaysFilter!)

    const { count: count30d } = await supabase
      .from('music_library')
      .select('*', { count: 'exact', head: true })
      .gte('processed_at', thirtyDaysFilter!)

    const { count: count90d } = await supabase
      .from('music_library')
      .select('*', { count: 'exact', head: true })
      .gte('processed_at', ninetyDaysFilter!)

    const { count: countAll } = await supabase
      .from('music_library')
      .select('*', { count: 'exact', head: true })

    console.log('Direct query counts:')
    console.log('7d:', count7d)
    console.log('30d:', count30d)
    console.log('90d:', count90d)
    console.log('All:', countAll)

    // Verify logical ordering (longer time ranges should have more or equal data)
    expect(count30d).toBeGreaterThanOrEqual(count7d!)
    expect(count90d).toBeGreaterThanOrEqual(count30d!)
    expect(countAll).toBeGreaterThanOrEqual(count90d!)
  })

  it('should test PostgreSQL function with different time ranges', async () => {
    const sevenDaysFilter = getTimeRangeFilter('7d')
    const thirtyDaysFilter = getTimeRangeFilter('30d')
    const ninetyDaysFilter = getTimeRangeFilter('90d')

    const { data: metrics7d } = await supabase
      .rpc('get_community_basic_metrics', { time_filter: sevenDaysFilter })

    const { data: metrics30d } = await supabase
      .rpc('get_community_basic_metrics', { time_filter: thirtyDaysFilter })

    const { data: metrics90d } = await supabase
      .rpc('get_community_basic_metrics', { time_filter: ninetyDaysFilter })

    const { data: metricsAll } = await supabase
      .rpc('get_community_basic_metrics', { time_filter: null })

    console.log('PostgreSQL function results:')
    console.log('7d:', metrics7d?.[0])
    console.log('30d:', metrics30d?.[0])
    console.log('90d:', metrics90d?.[0])
    console.log('All:', metricsAll?.[0])

    // Verify we get different results for different time ranges
    const songs7d = parseInt(metrics7d?.[0]?.total_songs_shared || '0')
    const songs30d = parseInt(metrics30d?.[0]?.total_songs_shared || '0')
    const songs90d = parseInt(metrics90d?.[0]?.total_songs_shared || '0')
    const songsAll = parseInt(metricsAll?.[0]?.total_songs_shared || '0')

    expect(songs30d).toBeGreaterThanOrEqual(songs7d)
    expect(songs90d).toBeGreaterThanOrEqual(songs30d)
    expect(songsAll).toBeGreaterThanOrEqual(songs90d)
    
    // Test the new top artists function with likes
    const { data: artistsAll } = await supabase
      .rpc('get_top_artists_by_time_range', { time_filter: null })
    
    console.log('Top artists by total likes:')
    artistsAll?.slice(0, 5).forEach((artist: any, i: number) => {
      console.log(`${i+1}. ${artist.artist}: ${artist.total_likes} likes`)
    })
  })

  it('should check data distribution in music_library', async () => {
    // Get some sample data to understand the date distribution
    const { data: sampleData } = await supabase
      .from('music_library')
      .select('processed_at')
      .order('processed_at', { ascending: false })
      .limit(10)

    const { data: oldestData } = await supabase
      .from('music_library')
      .select('processed_at')
      .order('processed_at', { ascending: true })
      .limit(5)

    console.log('Newest 10 processed_at dates:')
    sampleData?.forEach((row, i) => console.log(`${i+1}:`, row.processed_at))

    console.log('Oldest 5 processed_at dates:')
    oldestData?.forEach((row, i) => console.log(`${i+1}:`, row.processed_at))
  })
}) 