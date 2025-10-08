import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Shared Supabase client factory
 * Eliminates duplication across API files
 */
export function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_ENV === 'local'
    ? process.env.SUPABASE_LOCAL_URL!
    : process.env.SUPABASE_URL!

  const supabaseKey = process.env.SUPABASE_ENV === 'local'
    ? process.env.SUPABASE_LOCAL_KEY!
    : process.env.SUPABASE_KEY!

  return createClient(supabaseUrl, supabaseKey)
}

/**
 * Encode pagination cursor to base64
 */
export function encodeCursor(data: { created_at: string; id: string }): string {
  return btoa(JSON.stringify(data))
}

/**
 * Decode pagination cursor from base64
 * Returns null if cursor is invalid
 */
export function decodeCursor(cursor: string): { created_at: string; id: string } | null {
  try {
    return JSON.parse(atob(cursor))
  } catch (e) {
    console.warn('Invalid cursor:', cursor)
    return null
  }
}

/**
 * Fetch stats (likes, recasts) for multiple casts
 * Returns a Map of castId -> { likes: number, recasts: number }
 */
export async function fetchStats(
  supabase: SupabaseClient,
  castIds: string[]
): Promise<Map<string, { likes: number; recasts: number }>> {
  if (castIds.length === 0) {
    return new Map()
  }

  const { data: stats } = await supabase
    .from('interaction_edges')
    .select('cast_id, edge_type')
    .in('cast_id', castIds)

  const statsMap = new Map<string, { likes: number; recasts: number }>()

  stats?.forEach(s => {
    const current = statsMap.get(s.cast_id) || { likes: 0, recasts: 0 }
    if (s.edge_type === 'LIKED') current.likes++
    if (s.edge_type === 'RECASTED') current.recasts++
    statsMap.set(s.cast_id, current)
  })

  return statsMap
}

/**
 * Fetch authors/users for multiple FIDs
 * Returns a Map of fid -> user object
 */
export async function fetchAuthors(
  supabase: SupabaseClient,
  fids: string[]
): Promise<Map<string, any>> {
  if (fids.length === 0) {
    return new Map()
  }

  const uniqueFids = Array.from(new Set(fids))

  const { data: authors } = await supabase
    .from('user_nodes')
    .select('node_id, fname, display_name, avatar_url')
    .in('node_id', uniqueFids)

  return new Map(authors?.map(a => [a.node_id, a]) || [])
}

/**
 * Fetch reply counts for multiple casts
 * Returns a Map of castId -> reply count
 */
export async function fetchReplyCounts(
  supabase: SupabaseClient,
  castIds: string[]
): Promise<Map<string, number>> {
  if (castIds.length === 0) {
    return new Map()
  }

  const { data: repliesData } = await supabase
    .from('cast_nodes')
    .select('parent_cast_hash')
    .in('parent_cast_hash', castIds)
    .not('parent_cast_hash', 'is', null)

  const replyCounts = new Map<string, number>()
  repliesData?.forEach(reply => {
    const count = replyCounts.get(reply.parent_cast_hash!) || 0
    replyCounts.set(reply.parent_cast_hash!, count + 1)
  })

  return replyCounts
}

/**
 * Format author object for API responses
 */
export function formatAuthor(author: any, fid: string) {
  return {
    fid,
    username: author?.fname || 'unknown',
    displayName: author?.display_name || 'Unknown User',
    pfpUrl: author?.avatar_url
  }
}

/**
 * Format music data for API responses
 */
export function formatMusic(musicLibraryData: any) {
  return {
    id: `${musicLibraryData.platform}-${musicLibraryData.platform_id}`,
    title: musicLibraryData.title,
    artist: musicLibraryData.artist,
    platform: musicLibraryData.platform,
    platformId: musicLibraryData.platform_id,
    url: musicLibraryData.url,
    thumbnail: musicLibraryData.thumbnail_url
  }
}
