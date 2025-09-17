import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { LibraryQuery, Track } from '../../shared/types/library'

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
    // Start with simple query - no joins
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

    // Pagination - skip if we want the full dataset for aggregations
    let limit = 50
    let skipPagination = query.returnFullDataset
    
    if (!skipPagination) {
      limit = Math.min(query.limit || 50, 250) // Max 250 as per spec
      supabaseQuery = supabaseQuery.limit(limit + 1) // +1 to check if there are more
    }

    // Cursor-based pagination (skip for full dataset)
    if (query.cursor && !skipPagination) {
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

    // Check if there are more results and handle pagination
    let hasMore = false
    let tracks = data
    
    if (!skipPagination) {
      hasMore = data.length > limit
      tracks = data.slice(0, limit) // Remove the extra record
    }

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
    const castIds = [...new Set(dbRecords.map(record => record.cast_id))]
    const CHUNK_SIZE = 100 // Limit to avoid URI too large error
    
    // Fetch user info for all authors in chunks
    let users: any[] = []
    for (let i = 0; i < authorFids.length; i += CHUNK_SIZE) {
      const chunk = authorFids.slice(i, i + CHUNK_SIZE)
      const { data: chunkUsers } = await this.supabase
        .from('user_nodes')
        .select('node_id, fname, display_name, avatar_url')
        .in('node_id', chunk)
      if (chunkUsers) {
        users.push(...chunkUsers)
      }
    }
    
    // Fetch cast text for all casts in chunks to avoid 414 error
    let casts: any[] = []
    
    for (let i = 0; i < castIds.length; i += CHUNK_SIZE) {
      const chunk = castIds.slice(i, i + CHUNK_SIZE)
      const { data: chunkCasts, error: castError } = await this.supabase
        .from('cast_nodes')
        .select('node_id, cast_text')
        .in('node_id', chunk)
      
      if (castError) {
        console.error('Cast query error for chunk:', castError)
      } else if (chunkCasts) {
        casts.push(...chunkCasts)
      }
    }
    
    // Fetch embeds_metadata in chunks
    let embeds: any[] = []
    for (let i = 0; i < castIds.length; i += CHUNK_SIZE) {
      const chunk = castIds.slice(i, i + CHUNK_SIZE)
      const { data: chunkEmbeds } = await this.supabase
        .from('embeds_metadata')
        .select('cast_id, embed_index, url')
        .in('cast_id', chunk)
      if (chunkEmbeds) {
        embeds.push(...chunkEmbeds)
      }
    }
    
    const userMap = new Map()
    users.forEach(user => {
      userMap.set(user.node_id, user)
    })
    
    const castMap = new Map()
    casts.forEach(cast => {
      castMap.set(cast.node_id, cast)
    })
    
    const embedMap = new Map()
    embeds.forEach(embed => {
      embedMap.set(`${embed.cast_id}-${embed.embed_index}`, embed)
    })

    return dbRecords.map(record => {
      const user = userMap.get(record.author_fid)
      const cast = castMap.get(record.cast_id)
      const embed = embedMap.get(`${record.cast_id}-${record.embed_index}`)
      
      // Get actual URL from embeds_metadata
      const embedUrl = embed?.url || ''
      
      // Extract video ID from YouTube URL for sourceId
      let sourceId = record.cast_id // fallback
      if (record.platform_name === 'youtube' && embedUrl) {
        const videoIdMatch = embedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
        if (videoIdMatch) {
          sourceId = videoIdMatch[1]
        }
      } else if (record.platform_name === 'spotify' && embedUrl) {
        const trackIdMatch = embedUrl.match(/spotify\.com\/track\/([^?]+)/)
        if (trackIdMatch) {
          sourceId = trackIdMatch[1]
        }
      }

      return {
        id: `${record.cast_id}-${record.embed_index}`,
        title: record.title,
        artist: record.artist || 'Unknown Artist',
        source: record.platform_name as 'youtube' | 'spotify' | 'soundcloud',
        sourceId: sourceId,
        sourceUrl: embedUrl,
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
          context: cast?.cast_text || undefined
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