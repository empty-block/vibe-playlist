-- Migration: Create Channels Table
-- Creates metadata table for curated music channels

CREATE TABLE channels (
  id TEXT PRIMARY KEY,  -- Short channel ID (e.g., "hip-hop", "techno")
  name TEXT NOT NULL,   -- Display name (e.g., "Hip Hop Heads")
  description TEXT,     -- Channel description

  -- Curation metadata
  is_official BOOLEAN DEFAULT FALSE,  -- Official Jamzy channel
  is_curated BOOLEAN DEFAULT TRUE,   -- Manually curated vs. auto-discovered
  sort_order INTEGER DEFAULT 0,      -- Display order (lower = higher priority)

  -- Channel branding
  icon_url TEXT,        -- Channel icon/avatar
  banner_url TEXT,      -- Channel banner image
  color_hex TEXT,       -- Theme color (e.g., "#FF00FF")

  -- Visibility
  is_visible BOOLEAN DEFAULT TRUE,   -- Show in channels list
  is_archived BOOLEAN DEFAULT FALSE, -- Archived channels

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_channels_is_visible ON channels(is_visible) WHERE is_visible = TRUE;
CREATE INDEX idx_channels_sort_order ON channels(sort_order);
CREATE INDEX idx_channels_is_official ON channels(is_official) WHERE is_official = TRUE;

-- Add index to cast_nodes.channel for efficient filtering
CREATE INDEX IF NOT EXISTS idx_cast_nodes_channel ON cast_nodes(channel) WHERE channel IS NOT NULL;

-- Comments for documentation
COMMENT ON TABLE channels IS 'Curated music channels for browsing threads';
COMMENT ON COLUMN channels.id IS 'Short identifier matching cast_nodes.channel column';
COMMENT ON COLUMN channels.is_official IS 'True for official Jamzy channels';
COMMENT ON COLUMN channels.sort_order IS 'Manual ordering for channel list (lower = higher)';
