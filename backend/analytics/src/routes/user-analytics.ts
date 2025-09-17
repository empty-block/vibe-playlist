import { Hono } from 'hono'
import { supabase } from '../lib/db'

const analytics = new Hono()

// User Profile Analytics Endpoint
analytics.get('/users/:id/profile', async (c) => {
  try {
    const userId = c.req.param('id')
    const includeLibrary = c.req.query('includeLibrary') === 'true'
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')

    // Validate user exists
    const { data: user, error: userError } = await supabase
      .from('user_nodes')
      .select('node_id, fname, display_name')
      .eq('node_id', userId)
      .single()

    if (userError || !user) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Get user's shared songs (songs from casts they authored)
    const { data: sharedSongs, error: sharedError } = await supabase
      .from('music_library')
      .select('cast_id, embed_index, title, artist, album, genre, platform_name, music_type')
      .eq('author_fid', userId)

    if (sharedError) {
      console.error('Error fetching shared songs:', sharedError)
      return c.json({ error: 'Failed to fetch user data' }, 500)
    }

    // Get cast IDs that the user liked
    const { data: likedCasts, error: likedCastsError } = await supabase
      .from('cast_edges')
      .select('cast_id')
      .eq('source_user_id', userId)
      .eq('edge_type', 'LIKED')

    let likedSongs: any[] = []
    let likedError = likedCastsError

    if (!likedCastsError && likedCasts && likedCasts.length > 0) {
      const likedCastIds = likedCasts.map(edge => edge.cast_id)
      const { data, error } = await supabase
        .from('music_library')
        .select('cast_id, embed_index, title, artist, album, genre, platform_name, music_type')
        .in('cast_id', likedCastIds)
      
      likedSongs = data || []
      likedError = error
    }

    if (likedError) {
      console.error('Error fetching liked songs:', likedError)
      return c.json({ error: 'Failed to fetch user data' }, 500)
    }

    // Calculate stats
    const totalShared = sharedSongs?.length || 0
    const totalLiked = likedSongs?.length || 0

    // Combine and deduplicate (shared songs take priority)
    const sharedSongKeys = new Set(sharedSongs?.map(s => `${s.cast_id}-${s.embed_index}`) || [])
    const uniqueLikedSongs = likedSongs?.filter(s => !sharedSongKeys.has(`${s.cast_id}-${s.embed_index}`)) || []
    const totalUniqueSongs = totalShared + uniqueLikedSongs.length

    // Calculate platform breakdown
    const allSongs = [...(sharedSongs || []), ...uniqueLikedSongs]
    const platformCounts = allSongs.reduce((acc, song) => {
      const platform = song.platform_name || 'unknown'
      acc[platform] = (acc[platform] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate top artists
    const artistCounts = allSongs.reduce((acc, song) => {
      const artist = song.artist || 'Unknown Artist'
      acc[artist] = (acc[artist] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topArtists = Object.entries(artistCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([artist, count]) => ({ artist, count }))

    // Calculate top genres (if available)
    const genreCounts = allSongs.reduce((acc, song) => {
      if (song.genre && Array.isArray(song.genre)) {
        song.genre.forEach((g: string) => {
          acc[g] = (acc[g] || 0) + 1
        })
      }
      return acc
    }, {} as Record<string, number>)

    const topGenres = Object.entries(genreCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }))

    // Prepare response
    const response: any = {
      user: {
        id: user.node_id,
        name: user.display_name || user.fname,
      },
      stats: {
        total_songs: totalUniqueSongs,
        songs_shared: totalShared,
        songs_liked: totalLiked,
        platforms_count: Object.keys(platformCounts).length,
        artists_count: Object.keys(artistCounts).length,
        genres_count: Object.keys(genreCounts).length
      },
      breakdown: {
        platforms: platformCounts,
        top_artists: topArtists,
        top_genres: topGenres
      }
    }

    // Include library if requested
    if (includeLibrary) {
      const libraryItems = allSongs
        .slice(offset, offset + limit)
        .map(song => ({
          id: song.id,
          title: song.title,
          artist: song.artist,
          album: song.album,
          genre: song.genre,
          platform: song.platform_name,
          type: song.music_type,
          interaction: sharedSongKeys.has(`${song.cast_id}-${song.embed_index}`) ? 'shared' : 'liked'
        }))

      response.library = {
        items: libraryItems,
        pagination: {
          limit,
          offset,
          total: totalUniqueSongs,
          has_more: offset + limit < totalUniqueSongs
        }
      }
    }

    return c.json(response)

  } catch (error) {
    console.error('Analytics API error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default analytics 