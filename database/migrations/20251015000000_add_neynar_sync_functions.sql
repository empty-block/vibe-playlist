-- Migration: Add Neynar Sync Functions and Tables
-- Creates database functions and tables for syncing Farcaster casts from Neynar

-- =====================================================
-- Table: channel_sync_status
-- Tracks last sync time and status for each channel
-- =====================================================

CREATE TABLE IF NOT EXISTS channel_sync_status (
  channel_id TEXT PRIMARY KEY,
  last_sync_at TIMESTAMP,
  last_sync_cast_count INTEGER DEFAULT 0,
  last_sync_success BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE channel_sync_status IS 'Tracks sync status for Farcaster channels via Neynar API';
COMMENT ON COLUMN channel_sync_status.channel_id IS 'Channel identifier (e.g., hip-hop, jazz)';
COMMENT ON COLUMN channel_sync_status.last_sync_at IS 'Timestamp of last successful sync';
COMMENT ON COLUMN channel_sync_status.last_sync_cast_count IS 'Number of casts processed in last sync';

-- =====================================================
-- Function: upsert_cast_from_neynar
-- Upserts a cast and its author from Neynar data
-- =====================================================

CREATE OR REPLACE FUNCTION upsert_cast_from_neynar(cast_data JSONB)
RETURNS VOID AS $$
DECLARE
  v_cast_hash TEXT;
  v_author_fid TEXT;
BEGIN
  -- Extract key fields
  v_cast_hash := cast_data->>'cast_hash';
  v_author_fid := cast_data->'author'->>'fid';

  -- 1. Upsert user (author)
  INSERT INTO user_nodes (node_id, fname, display_name, avatar_url, created_at)
  VALUES (
    v_author_fid,
    cast_data->'author'->>'username',
    cast_data->'author'->>'display_name',
    cast_data->'author'->>'avatar_url',
    COALESCE((cast_data->>'created_at')::TIMESTAMP, NOW())
  )
  ON CONFLICT (node_id) DO UPDATE SET
    fname = EXCLUDED.fname,
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url;

  -- 2. Upsert cast
  INSERT INTO cast_nodes (
    node_id,
    cast_text,
    created_at,
    author_fid,
    channel,
    parent_cast_hash,
    root_parent_hash
  )
  VALUES (
    v_cast_hash,
    cast_data->>'cast_text',
    (cast_data->>'created_at')::TIMESTAMP,
    v_author_fid,
    cast_data->>'channel',
    cast_data->>'parent_cast_hash',
    cast_data->>'root_parent_hash'
  )
  ON CONFLICT (node_id) DO UPDATE SET
    cast_text = EXCLUDED.cast_text,
    channel = EXCLUDED.channel,
    parent_cast_hash = EXCLUDED.parent_cast_hash,
    root_parent_hash = EXCLUDED.root_parent_hash;

  -- 3. Create AUTHORED interaction edge (if not exists)
  -- For AUTHORED: source_id=author_fid, cast_id=cast_hash, target_id=NULL
  INSERT INTO interaction_edges (source_id, cast_id, edge_type, created_at)
  VALUES (
    v_author_fid,
    v_cast_hash,
    'AUTHORED',
    (cast_data->>'created_at')::TIMESTAMP
  )
  ON CONFLICT ON CONSTRAINT interaction_edges_pkey DO NOTHING;

  -- Note: Embeds and music extraction will be handled separately
  -- in the music metadata extraction pipeline (Phase 2.5)

END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION upsert_cast_from_neynar IS 'Upserts a Farcaster cast and its author from Neynar API data. Handles duplicates gracefully.';

-- =====================================================
-- Indexes for performance
-- =====================================================

-- Index on channel + created_at for efficient "latest cast" queries
CREATE INDEX IF NOT EXISTS idx_cast_nodes_channel_created_at
  ON cast_nodes(channel, created_at DESC)
  WHERE channel IS NOT NULL;

-- Index on cast hash for fast lookups
CREATE INDEX IF NOT EXISTS idx_cast_nodes_hash
  ON cast_nodes(node_id);

-- Index on sync status channel_id
CREATE INDEX IF NOT EXISTS idx_channel_sync_status_channel
  ON channel_sync_status(channel_id);

-- =====================================================
-- Grant permissions
-- =====================================================

-- Grant execute permission on function to authenticated users
GRANT EXECUTE ON FUNCTION upsert_cast_from_neynar TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_cast_from_neynar TO anon;

-- Grant access to sync status table
GRANT ALL ON channel_sync_status TO authenticated;
GRANT ALL ON channel_sync_status TO anon;
