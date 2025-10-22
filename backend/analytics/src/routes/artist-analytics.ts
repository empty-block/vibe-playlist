import { Hono } from 'hono'
import { supabase } from '../lib/db'

const artistAnalytics = new Hono()

// Helper function to convert time range to date filter
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
    case '1y':
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      return oneYearAgo.toISOString()
    default:
      return null // 'all' - no date filter
  }
}

// Artist Fan Analytics Endpoint
artistAnalytics.get('/artists/:name', async (c) => {
  try {
    let artistName: string
    try {
      artistName = decodeURIComponent(c.req.param('name'))
    } catch (error) {
      // Fallback for malformed URI encoding
      artistName = c.req.param('name').replace(/%25/g, '%')
      try {
        artistName = decodeURIComponent(artistName)
      } catch {
        // If still fails, use the raw parameter
        artistName = c.req.param('name')
      }
    }
    const timeRange = c.req.query('timeRange') || 'all'
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    const interactionType = c.req.query('interactionType') || 'all'
    const includeLibrary = c.req.query('includeLibrary') !== 'false'
    
    const dateFilter = getTimeRangeFilter(timeRange)
    
    // Validate artist exists in our database
    const { data: artistExists, error: artistError } = await supabase
      .from('music_library')
      .select('artist')
      .ilike('artist', artistName)
      .limit(1)
    
    if (artistError) {
      console.error('Error checking artist existence:', artistError)
      return c.json({ error: 'Failed to query artist data' }, 500)
    }
    
    if (!artistExists || artistExists.length === 0) {
      return c.json({ error: 'Artist not found' }, 404)
    }

    // Get community reach stats
    let communityQuery = supabase
      .from('music_library')
      .select(`
        cast_id,
        author_fid,
        created_at
      `)
      .ilike('artist', artistName)
    
    if (dateFilter) {
      communityQuery = communityQuery.gte('created_at', dateFilter)
    }
    
    const { data: artistSongs, error: songsError } = await communityQuery
    
    if (songsError) {
      console.error('Error fetching artist songs:', songsError)
      return c.json({ error: 'Failed to fetch artist data' }, 500)
    }

    // Get all users who shared this artist
    const uniqueSharers = new Set(artistSongs?.map(song => song.author_fid) || [])
    
    // Get cast edges for these songs to find likers, recasters, repliers
    const castIds = artistSongs?.map(song => song.cast_id) || []
    
    let interactions: any[] = []
    let interactionsError = null
    
    if (castIds.length > 0) {
      const { data, error } = await supabase
        .from('cast_edges')
        .select('source_user_id, cast_id, edge_type')
        .in('cast_id', castIds)
        .in('edge_type', ['LIKED', 'RECASTED', 'REPLIED'])
      
      interactions = data || []
      interactionsError = error
    }
    
    if (interactionsError) {
      console.error('Error fetching interactions:', interactionsError)
      return c.json({ error: 'Failed to fetch interaction data' }, 500)
    }
    
    // Calculate weighted fan scores
    const fanScores = new Map<string, {
      shares: number,
      likes: number,
      recasts: number,
      replies: number,
      fan_score: number,
      total_activity: number
    }>()
    
    // Initialize with sharers (10 points each)
    for (const sharer of uniqueSharers) {
      const shareCount = artistSongs?.filter(song => song.author_fid === sharer).length || 0
      fanScores.set(sharer, {
        shares: shareCount,
        likes: 0,
        recasts: 0,
        replies: 0,
        fan_score: shareCount * 10,
        total_activity: shareCount
      })
    }
    
    // Add interaction scores
    for (const interaction of interactions || []) {
      const userId = interaction.source_user_id
      
      // Get existing scores or initialize with default
      if (!fanScores.has(userId)) {
        fanScores.set(userId, {
          shares: 0,
          likes: 0,
          recasts: 0,
          replies: 0,
          fan_score: 0,
          total_activity: 0
        })
      }
      
      const current = fanScores.get(userId)!
      
      switch (interaction.edge_type) {
        case 'LIKED':
          current.likes += 1
          current.fan_score += 1
          current.total_activity += 1
          break
        case 'RECASTED':
          current.recasts += 1
          current.fan_score += 3
          current.total_activity += 1
          break
        case 'REPLIED':
          current.replies += 1
          current.fan_score += 2
          current.total_activity += 1
          break
      }
    }
    
    // Filter by interaction type if specified
    let filteredFans = Array.from(fanScores.entries())
    if (interactionType === 'shared') {
      filteredFans = filteredFans.filter(([, scores]) => scores.shares > 0)
    } else if (interactionType === 'liked') {
      filteredFans = filteredFans.filter(([, scores]) => scores.likes > 0)
    }
    
    // Sort by fan score and paginate
    const sortedFans = filteredFans
      .sort(([, a], [, b]) => b.fan_score - a.fan_score)
    
    const paginatedFans = sortedFans.slice(offset, offset + limit)
    
    // Get user details for top fans
    const fanUserIds = paginatedFans.map(([userId]) => userId)
    const { data: fanUsers, error: fanUsersError } = await supabase
      .from('user_nodes')
      .select('node_id, fname, display_name')
      .in('node_id', fanUserIds)
    
    if (fanUsersError) {
      console.error('Error fetching fan user details:', fanUsersError)
      return c.json({ error: 'Failed to fetch fan details' }, 500)
    }
    
    // Build fan list with user details
    const topFans = paginatedFans.map(([userId, scores], index) => {
      const user = fanUsers?.find(u => u.node_id === userId)
      return {
        user: user?.display_name || user?.fname || userId,
        fan_score: scores.fan_score,
        total_activity: scores.total_activity,
        shares: scores.shares,
        likes: scores.likes,
        recasts: scores.recasts,
        replies: scores.replies,
        rank: offset + index + 1
      }
    })
    
    // Calculate platform distribution
    let platformQuery = supabase
      .from('music_library')
      .select('platform_name')
      .ilike('artist', artistName)
    
    if (dateFilter) {
      platformQuery = platformQuery.gte('created_at', dateFilter)
    }
    
    const { data: platformData, error: platformError } = await platformQuery
    
    const platformDistribution = (platformData || []).reduce((acc, song) => {
      const platform = song.platform_name || 'unknown'
      acc[platform] = (acc[platform] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Get library with pagination if requested
    let library = null
    if (includeLibrary) {
      let libraryQuery = supabase
        .from('music_library')
        .select(`
          cast_id,
          embed_index,
          title,
          album,
          platform_name,
          author_fid,
          created_at
        `)
        .ilike('artist', artistName)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (dateFilter) {
        libraryQuery = libraryQuery.gte('created_at', dateFilter)
      }
      
      const { data: librarySongs, error: libraryError } = await libraryQuery
      
      if (libraryError) {
        console.error('Error fetching library:', libraryError)
      } else {
        // Get user details for library songs
        const authorIds = [...new Set(librarySongs?.map(song => song.author_fid) || [])]
        const { data: authorUsers } = await supabase
          .from('user_nodes')
          .select('node_id, fname, display_name')
          .in('node_id', authorIds)
        
        // Get engagement data for each song
        const libraryCastIds = librarySongs?.map(song => song.cast_id) || []
        const { data: libraryEngagement } = await supabase
          .from('cast_edges')
          .select('cast_id, edge_type')
          .in('cast_id', libraryCastIds)
        
        const engagementCounts = (libraryEngagement || []).reduce((acc, edge) => {
          const castId = edge.cast_id
          if (!acc[castId]) {
            acc[castId] = { likes: 0, recasts: 0, replies: 0 }
          }
          switch (edge.edge_type) {
            case 'LIKED': acc[castId].likes += 1; break
            case 'RECASTED': acc[castId].recasts += 1; break
            case 'REPLIED': acc[castId].replies += 1; break
          }
          return acc
        }, {} as Record<string, { likes: number, recasts: number, replies: number }>)
        
        library = {
          songs: librarySongs?.map(song => {
            const author = authorUsers?.find(u => u.node_id === song.author_fid)
            const engagement = engagementCounts[song.cast_id] || { likes: 0, recasts: 0, replies: 0 }
            
            return {
              song_title: song.title,
              album: song.album,
              cast_id: song.cast_id,
              embed_index: song.embed_index,
              shared_by: author?.display_name || author?.fname || song.author_fid,
              shared_at: song.created_at,
              platform: song.platform_name,
              engagement
            }
          }) || [],
          total_count: artistSongs?.length || 0,
          has_more: offset + limit < (artistSongs?.length || 0),
          current_limit: limit,
          current_offset: offset,
          sort_options: ['by_engagement', 'by_date', 'by_platform']
        }
      }
    }
    
    // Build response
    const response = {
      stats: {
        community_reach: {
          total_users: fanScores.size,
          shared_by: uniqueSharers.size,
          liked_by: new Set(interactions?.filter(i => i.edge_type === 'LIKED').map(i => i.source_user_id)).size
        },
        platform_distribution: platformDistribution
      },
      fans: {
        top_fans: topFans,
        total_fans: filteredFans.length,
        has_more: offset + limit < filteredFans.length,
        current_limit: limit,
        current_offset: offset
      },
      ...(library && { library })
    }
    
    return c.json(response)
    
  } catch (error) {
    console.error('Artist analytics error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default artistAnalytics