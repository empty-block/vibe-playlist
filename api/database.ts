import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { LibraryQuery, Track } from '../shared/types/library'

export class DatabaseService {
  private supabase: SupabaseClient

  constructor() {
    const supabaseUrl = process.env.SUPABASE_ENV === 'local' 
      ? process.env.SUPABASE_LOCAL_URL! 
      : process.env.SUPABASE_URL!
    
    const supabaseKey = process.env.SUPABASE_ENV === 'local'
      ? process.env.SUPABASE_LOCAL_KEY!
      : process.env.SUPABASE_KEY!

    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  async queryLibrary(query: LibraryQuery): Promise<{ tracks: Track[], hasMore: boolean, nextCursor?: string }> {
    // Start with simple query, we'll add joins later
    let supabaseQuery = this.supabase
      .from('music_library')
      .select('*')

    // Apply filters
    if (query.users && query.users.length > 0) {
      // Convert usernames to fids by looking up in user_nodes
      const { data: userNodes } = await this.supabase
        .from('user_nodes')
        .select('node_id')
        .in('fname', query.users)
      
      if (userNodes && userNodes.length > 0) {
        const fids = userNodes.map(user => user.node_id)
        supabaseQuery = supabaseQuery.in('author_fid', fids)
      } else {
        // No users found, return empty result
        return { tracks: [], hasMore: false }
      }
    }

    if (query.sources && query.sources.length > 0) {
      supabaseQuery = supabaseQuery.in('platform_name', query.sources)
    }

    if (query.search) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query.search}%,artist.ilike.%${query.search}%`)
    }

    if (query.tags && query.tags.length > 0) {
      supabaseQuery = supabaseQuery.overlaps('genre', query.tags)
    }

    // Time filtering
    if (query.dateRange) {
      const now = new Date()
      let afterDate: Date
      
      switch (query.dateRange) {
        case 'today':
          afterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          afterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          afterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          afterDate = new Date(0) // 'all' - no filter
      }
      
      if (query.dateRange !== 'all') {
        supabaseQuery = supabaseQuery.gte('created_at', afterDate.toISOString())
      }
    }

    if (query.after) {
      supabaseQuery = supabaseQuery.gte('created_at', query.after)
    }

    if (query.before) {
      supabaseQuery = supabaseQuery.lte('created_at', query.before)
    }

    // Sorting
    const sortBy = query.sortBy || 'timestamp'
    const sortDirection = query.sortDirection || 'desc'
    
    switch (sortBy) {
      case 'timestamp':
        supabaseQuery = supabaseQuery.order('created_at', { ascending: sortDirection === 'asc' })
        break
      case 'artist':
        supabaseQuery = supabaseQuery.order('artist', { ascending: sortDirection === 'asc' })
        break
      case 'title':
        supabaseQuery = supabaseQuery.order('title', { ascending: sortDirection === 'asc' })
        break
      // Note: likes, replies, recasts will need aggregation from cast_edges
      default:
        supabaseQuery = supabaseQuery.order('created_at', { ascending: sortDirection === 'asc' })
    }

    // Pagination
    const limit = Math.min(query.limit || 50, 250) // Max 250 as per spec
    supabaseQuery = supabaseQuery.limit(limit + 1) // +1 to check if there are more

    // Cursor-based pagination
    if (query.cursor) {
      try {
        const cursorData = JSON.parse(atob(query.cursor))
        supabaseQuery = supabaseQuery.gt('created_at', cursorData.created_at)
      } catch (error) {
        console.warn('Invalid cursor provided:', query.cursor)
      }
    }

    const { data, error } = await supabaseQuery

    if (error) {
      console.error('Database query error:', error)
      throw new Error('Database query failed')
    }

    if (!data) {
      return { tracks: [], hasMore: false }
    }

    // Check if there are more results
    const hasMore = data.length > limit
    const tracks = data.slice(0, limit) // Remove the extra record

    // Generate next cursor
    let nextCursor: string | undefined
    if (hasMore && tracks.length > 0) {
      const lastTrack = tracks[tracks.length - 1]
      nextCursor = btoa(JSON.stringify({ 
        created_at: lastTrack.created_at,
        cast_id: lastTrack.cast_id 
      }))
    }

    // Transform database records to Track objects
    const transformedTracks = await this.transformToTracks(tracks)

    return {
      tracks: transformedTracks,
      hasMore,
      nextCursor
    }
  }

  private async transformToTracks(dbRecords: any[]): Promise<Track[]> {
    // Get unique author_fids to fetch user info
    const authorFids = [...new Set(dbRecords.map(record => record.author_fid))]
    
    // Fetch user info for all authors
    const { data: users } = await this.supabase
      .from('user_nodes')
      .select('node_id, fname, display_name, avatar_url')
      .in('node_id', authorFids)
    
    const userMap = new Map()
    users?.forEach(user => {
      userMap.set(user.node_id, user)
    })

    return dbRecords.map(record => {
      const user = userMap.get(record.author_fid)
      
      // Generate source URL based on platform  
      let sourceUrl = ''
      // Note: source_id is not in our current schema, so using cast_id for now
      if (record.platform_name === 'youtube') {
        sourceUrl = `https://www.youtube.com/watch?v=${record.cast_id}`
      } else if (record.platform_name === 'spotify') {
        sourceUrl = `https://open.spotify.com/track/${record.cast_id}`
      }

      return {
        id: `${record.cast_id}-${record.embed_index}`,
        title: record.title,
        artist: record.artist || 'Unknown Artist',
        source: record.platform_name as 'youtube' | 'spotify' | 'soundcloud',
        sourceUrl,
        thumbnailUrl: undefined, // Not in current schema
        duration: undefined, // Not in current schema
        
        user: {
          username: user?.fname || 'unknown',
          displayName: user?.display_name || 'Unknown User',
          avatar: user?.avatar_url
        },
        
        userInteraction: {
          type: 'shared', // From Farcaster, everything is "shared"
          timestamp: record.created_at,
          context: undefined // Will fetch cast text later
        },
        
        // TODO: Aggregate social stats from cast_edges
        socialStats: {
          likes: 0,
          replies: 0, 
          recasts: 0
        },
        
        tags: record.genre || [],
        createdAt: record.created_at
      } as Track
    })
  }
}