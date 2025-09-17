import { createClient } from '@supabase/supabase-js'

// Database configuration
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required environment variables: SUPABASE_URL and SUPABASE_KEY')
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Type definitions for our database tables
export interface UserNode {
  node_id: string
  fname: string | null
  display_name: string | null
  avatar_url: string | null
}

export interface CastNode {
  node_id: string
  cast_text: string
  created_at: string
  author_fid: string
  cast_channel: string | null
}

export interface CastEdge {
  source_user_id: string
  target_user_id: string | null
  cast_id: string
  edge_type: string
  created_at: string
}

export interface MusicLibrary {
  id: number
  title: string
  artist: string
  album: string | null
  genre: string[] | null
  release_date: string | null
  platform_name: string
  platform_id: string
  confidence_score: number
  music_type: string
} 