-- Migration: Create Missing Thread Functions
-- Adds get_thread_with_replies and get_user_threads functions that were referenced but missing

-- Function: get_thread_with_replies
-- Get a specific thread with all replies and related data
CREATE OR REPLACE FUNCTION get_thread_with_replies(
  thread_cast_hash TEXT
)
RETURNS TABLE(
  item_type TEXT,
  cast_hash TEXT,
  cast_text TEXT,
  created_at TIMESTAMP,
  author_fid TEXT,
  author_username TEXT,
  author_display_name TEXT,
  author_avatar_url TEXT,
  music JSONB,
  likes_count BIGINT,
  recasts_count BIGINT,
  replies_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH thread_cast AS (
    SELECT
      cn.node_id,
      cn.cast_text,
      cn.created_at,
      cn.author_fid
    FROM cast_nodes cn
    WHERE cn.node_id = thread_cast_hash
  ),
  reply_casts AS (
    SELECT
      cn.node_id,
      cn.cast_text,
      cn.created_at,
      cn.author_fid
    FROM cast_nodes cn
    WHERE cn.parent_cast_hash = thread_cast_hash
    ORDER BY cn.created_at ASC
  ),
  all_casts AS (
    SELECT 'thread' as item_type, * FROM thread_cast
    UNION ALL
    SELECT 'reply' as item_type, * FROM reply_casts
  ),
  cast_music AS (
    SELECT
      cme.cast_id,
      jsonb_agg(
        jsonb_build_object(
          'id', ml.platform_name || '-' || ml.platform_id,
          'title', ml.title,
          'artist', ml.artist,
          'platform', ml.platform_name,
          'platformId', ml.platform_id,
          'url', ml.url,
          'thumbnail', ml.thumbnail_url
        )
      ) as music_data
    FROM cast_music_edges cme
    INNER JOIN music_library ml ON cme.music_platform_id = ml.platform_id
      AND cme.music_platform_name = ml.platform_name
    WHERE cme.cast_id IN (SELECT node_id FROM all_casts)
    GROUP BY cme.cast_id
  ),
  cast_stats AS (
    SELECT
      ie.cast_id,
      COUNT(*) FILTER (WHERE ie.edge_type = 'LIKED') as likes,
      COUNT(*) FILTER (WHERE ie.edge_type = 'RECASTED') as recasts
    FROM interaction_edges ie
    WHERE ie.cast_id IN (SELECT node_id FROM all_casts)
    GROUP BY ie.cast_id
  ),
  cast_replies AS (
    SELECT
      cn.parent_cast_hash,
      COUNT(*) as reply_count
    FROM cast_nodes cn
    WHERE cn.parent_cast_hash IN (SELECT node_id FROM all_casts)
      AND cn.parent_cast_hash IS NOT NULL
    GROUP BY cn.parent_cast_hash
  )
  SELECT
    ac.item_type::TEXT,
    ac.node_id::TEXT as cast_hash,
    ac.cast_text::TEXT,
    ac.created_at,
    ac.author_fid::TEXT,
    COALESCE(u.fname, 'unknown')::TEXT as author_username,
    COALESCE(u.display_name, 'Unknown User')::TEXT as author_display_name,
    u.avatar_url::TEXT as author_avatar_url,
    COALESCE(cm.music_data, '[]'::jsonb) as music,
    COALESCE(cs.likes, 0) as likes_count,
    COALESCE(cs.recasts, 0) as recasts_count,
    COALESCE(cr.reply_count, 0) as replies_count
  FROM all_casts ac
  LEFT JOIN user_nodes u ON ac.author_fid = u.node_id
  LEFT JOIN cast_music cm ON ac.node_id = cm.cast_id
  LEFT JOIN cast_stats cs ON ac.node_id = cs.cast_id
  LEFT JOIN cast_replies cr ON ac.node_id = cr.parent_cast_hash
  ORDER BY
    CASE WHEN ac.item_type = 'thread' THEN 0 ELSE 1 END,
    ac.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function: get_user_threads
-- Get paginated threads created by a specific user
CREATE OR REPLACE FUNCTION get_user_threads(
  user_fid TEXT,
  limit_count INTEGER DEFAULT 50,
  cursor_timestamp TIMESTAMP DEFAULT NULL,
  cursor_id TEXT DEFAULT NULL
)
RETURNS TABLE(
  cast_hash TEXT,
  cast_text TEXT,
  created_at TIMESTAMP,
  author_fid TEXT,
  author_username TEXT,
  author_display_name TEXT,
  author_avatar_url TEXT,
  music JSONB,
  likes_count BIGINT,
  recasts_count BIGINT,
  replies_count BIGINT
) AS $$
BEGIN
  -- Validate limit
  IF limit_count > 100 THEN
    limit_count := 100;
  END IF;

  IF limit_count < 1 THEN
    limit_count := 50;
  END IF;

  RETURN QUERY
  WITH user_threads AS (
    SELECT
      cn.node_id,
      cn.cast_text,
      cn.created_at,
      cn.author_fid
    FROM cast_nodes cn
    WHERE cn.author_fid = user_fid
      AND cn.parent_cast_hash IS NULL
      AND (cursor_timestamp IS NULL OR cn.created_at < cursor_timestamp)
    ORDER BY cn.created_at DESC
    LIMIT limit_count
  ),
  thread_music AS (
    SELECT
      cme.cast_id,
      jsonb_agg(
        jsonb_build_object(
          'id', ml.platform_name || '-' || ml.platform_id,
          'title', ml.title,
          'artist', ml.artist,
          'platform', ml.platform_name,
          'platformId', ml.platform_id,
          'url', ml.url,
          'thumbnail', ml.thumbnail_url
        )
      ) as music_data
    FROM cast_music_edges cme
    INNER JOIN music_library ml ON cme.music_platform_id = ml.platform_id
      AND cme.music_platform_name = ml.platform_name
    WHERE cme.cast_id IN (SELECT node_id FROM user_threads)
    GROUP BY cme.cast_id
  ),
  thread_stats AS (
    SELECT
      ie.cast_id,
      COUNT(*) FILTER (WHERE ie.edge_type = 'LIKED') as likes,
      COUNT(*) FILTER (WHERE ie.edge_type = 'RECASTED') as recasts
    FROM interaction_edges ie
    WHERE ie.cast_id IN (SELECT node_id FROM user_threads)
    GROUP BY ie.cast_id
  ),
  thread_replies AS (
    SELECT
      cn.parent_cast_hash,
      COUNT(*) as reply_count
    FROM cast_nodes cn
    WHERE cn.parent_cast_hash IN (SELECT node_id FROM user_threads)
      AND cn.parent_cast_hash IS NOT NULL
    GROUP BY cn.parent_cast_hash
  )
  SELECT
    t.node_id::TEXT as cast_hash,
    t.cast_text::TEXT,
    t.created_at,
    t.author_fid::TEXT,
    COALESCE(u.fname, 'unknown')::TEXT as author_username,
    COALESCE(u.display_name, 'Unknown User')::TEXT as author_display_name,
    u.avatar_url::TEXT as author_avatar_url,
    COALESCE(tm.music_data, '[]'::jsonb) as music,
    COALESCE(ts.likes, 0) as likes_count,
    COALESCE(ts.recasts, 0) as recasts_count,
    COALESCE(tr.reply_count, 0) as replies_count
  FROM user_threads t
  LEFT JOIN user_nodes u ON t.author_fid = u.node_id
  LEFT JOIN thread_music tm ON t.node_id = tm.cast_id
  LEFT JOIN thread_stats ts ON t.node_id = ts.cast_id
  LEFT JOIN thread_replies tr ON t.node_id = tr.parent_cast_hash
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_thread_with_replies TO authenticated;
GRANT EXECUTE ON FUNCTION get_thread_with_replies TO anon;
GRANT EXECUTE ON FUNCTION get_user_threads TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_threads TO anon;
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
-- Migration: Seed Channels
-- Seeds initial set of curated music channels for testing and development

INSERT INTO channels (id, name, description, is_official, is_curated, sort_order, color_hex) VALUES
  -- Official Jamzy channels
  ('hip-hop', 'Hip Hop Heads', 'Golden era hip-hop, underground classics, and modern bangers', TRUE, TRUE, 1, '#FF6B35'),
  ('techno', 'Techno Basement', '4/4 forever - minimal, deep, and industrial techno', TRUE, TRUE, 2, '#00D9FF'),
  ('indie', 'Indie Bedroom', 'Lo-fi bedroom pop, dream pop, and indie gems', TRUE, TRUE, 3, '#FFB800'),
  ('jazz', 'Jazz After Midnight', 'Standards, bebop, fusion, and beyond', TRUE, TRUE, 4, '#9B51E0'),
  ('electronic', 'Electronic Dreams', 'IDM, ambient, experimental sounds and glitch', TRUE, TRUE, 5, '#00FFA3'),

  -- Community channels (for testing)
  ('vaporwave', 'Vaporwave Sanctuary', 'A E S T H E T I C vibes only', FALSE, TRUE, 10, '#FF71CE'),
  ('punk', 'Punk Basement', 'Hardcore, post-punk, and garage rock', FALSE, TRUE, 11, '#FF3864'),
  ('metal', 'Metal Mosh Pit', 'From doom to death metal and everything heavy', FALSE, TRUE, 12, '#8B0000'),

  -- General music channel (maps to existing data)
  ('music', 'Music General', 'All genres welcome - general music discussion', FALSE, TRUE, 20, '#9D4EDD')
ON CONFLICT (id) DO NOTHING;

-- Update some existing cast_nodes to use the new channels for testing
-- This gives us test data without needing to create new casts
-- Note: Only updates casts that already have channel='music'
UPDATE cast_nodes
SET channel = (
  CASE
    -- Randomly assign to different channels based on node_id
    WHEN substring(node_id from 1 for 1) IN ('0', '1', '2') THEN 'hip-hop'
    WHEN substring(node_id from 1 for 1) IN ('3', '4') THEN 'techno'
    WHEN substring(node_id from 1 for 1) IN ('5', '6') THEN 'indie'
    WHEN substring(node_id from 1 for 1) IN ('7', '8') THEN 'electronic'
    WHEN substring(node_id from 1 for 1) IN ('9', 'a', 'b') THEN 'jazz'
    ELSE 'music'
  END
)
WHERE node_id IN (
  SELECT node_id
  FROM cast_nodes
  WHERE channel = 'music'
    AND parent_cast_hash IS NULL  -- Only update root threads
  LIMIT 50
);

-- Add comment explaining the data
COMMENT ON TABLE channels IS 'Curated music channels. Initial seed includes 5 official Jamzy channels and 4 community channels for testing.';
-- Function: get_channels_list
-- Get list of channels with metadata and thread counts
--
-- Usage:
--   SELECT * FROM get_channels_list();
--   SELECT * FROM get_channels_list(TRUE);  -- Include archived

CREATE OR REPLACE FUNCTION get_channels_list(
  include_archived BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  channel_id TEXT,
  name TEXT,
  description TEXT,
  is_official BOOLEAN,
  icon_url TEXT,
  color_hex TEXT,
  thread_count BIGINT,
  last_activity_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as channel_id,
    c.name,
    c.description,
    c.is_official,
    c.icon_url,
    c.color_hex,
    COUNT(DISTINCT cn.node_id) as thread_count,
    MAX(cn.created_at) as last_activity_at
  FROM channels c
  LEFT JOIN cast_nodes cn ON cn.channel = c.id
    AND cn.parent_cast_hash IS NULL  -- Only count root threads
  WHERE c.is_visible = TRUE
    AND (include_archived OR c.is_archived = FALSE)
  GROUP BY c.id, c.name, c.description, c.is_official, c.icon_url, c.color_hex, c.sort_order
  ORDER BY c.sort_order ASC, thread_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_channels_list TO authenticated;
GRANT EXECUTE ON FUNCTION get_channels_list TO anon;

-- Add helpful comment
COMMENT ON FUNCTION get_channels_list IS 'Returns list of visible channels with thread counts and last activity. Set include_archived=TRUE to include archived channels.';
-- Function: get_channel_feed
-- Get paginated feed of threads for a specific channel
-- Similar to get_threads_feed but filtered by channel
--
-- Usage:
--   SELECT * FROM get_channel_feed('hip-hop');
--   SELECT * FROM get_channel_feed('hip-hop', 25);
--   SELECT * FROM get_channel_feed('hip-hop', 25, '2025-10-13 10:00:00'::timestamp);

CREATE OR REPLACE FUNCTION get_channel_feed(
  p_channel_id TEXT,
  limit_count INTEGER DEFAULT 50,
  cursor_timestamp TIMESTAMP DEFAULT NULL,
  cursor_id TEXT DEFAULT NULL
)
RETURNS TABLE(
  cast_hash TEXT,
  cast_text TEXT,
  created_at TIMESTAMP,
  author_fid TEXT,
  author_username TEXT,
  author_display_name TEXT,
  author_avatar_url TEXT,
  music JSONB,
  likes_count BIGINT,
  recasts_count BIGINT,
  replies_count BIGINT
) AS $$
BEGIN
  -- Validate limit
  IF limit_count > 100 THEN
    limit_count := 100;
  END IF;

  IF limit_count < 1 THEN
    limit_count := 50;
  END IF;

  RETURN QUERY
  WITH channel_threads AS (
    SELECT
      cn.node_id,
      cn.cast_text,
      cn.created_at,
      cn.author_fid
    FROM cast_nodes cn
    WHERE cn.channel = p_channel_id
      AND cn.parent_cast_hash IS NULL  -- Only root threads
      AND (cursor_timestamp IS NULL OR cn.created_at < cursor_timestamp)
    ORDER BY cn.created_at DESC
    LIMIT limit_count
  ),
  thread_music AS (
    SELECT
      cme.cast_id,
      jsonb_agg(
        jsonb_build_object(
          'id', ml.platform_name || '-' || ml.platform_id,
          'title', ml.title,
          'artist', ml.artist,
          'platform', ml.platform_name,
          'platformId', ml.platform_id,
          'url', ml.url,
          'thumbnail', ml.thumbnail_url
        )
      ) as music_data
    FROM cast_music_edges cme
    INNER JOIN music_library ml ON cme.music_platform_id = ml.platform_id
      AND cme.music_platform_name = ml.platform_name
    WHERE cme.cast_id IN (SELECT node_id FROM channel_threads)
    GROUP BY cme.cast_id
  ),
  thread_stats AS (
    SELECT
      ie.cast_id,
      COUNT(*) FILTER (WHERE ie.edge_type = 'LIKED') as likes,
      COUNT(*) FILTER (WHERE ie.edge_type = 'RECASTED') as recasts
    FROM interaction_edges ie
    WHERE ie.cast_id IN (SELECT node_id FROM channel_threads)
    GROUP BY ie.cast_id
  ),
  thread_replies AS (
    SELECT
      cn.parent_cast_hash,
      COUNT(*) as reply_count
    FROM cast_nodes cn
    WHERE cn.parent_cast_hash IN (SELECT node_id FROM channel_threads)
      AND cn.parent_cast_hash IS NOT NULL
    GROUP BY cn.parent_cast_hash
  )
  SELECT
    t.node_id::TEXT as cast_hash,
    t.cast_text::TEXT,
    t.created_at,
    t.author_fid::TEXT,
    COALESCE(u.fname, 'unknown')::TEXT as author_username,
    COALESCE(u.display_name, 'Unknown User')::TEXT as author_display_name,
    u.avatar_url::TEXT as author_avatar_url,
    COALESCE(tm.music_data, '[]'::jsonb) as music,
    COALESCE(ts.likes, 0) as likes_count,
    COALESCE(ts.recasts, 0) as recasts_count,
    COALESCE(tr.reply_count, 0) as replies_count
  FROM channel_threads t
  LEFT JOIN user_nodes u ON t.author_fid = u.node_id
  LEFT JOIN thread_music tm ON t.node_id = tm.cast_id
  LEFT JOIN thread_stats ts ON t.node_id = ts.cast_id
  LEFT JOIN thread_replies tr ON t.node_id = tr.parent_cast_hash
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_channel_feed TO authenticated;
GRANT EXECUTE ON FUNCTION get_channel_feed TO anon;

-- Add helpful comment
COMMENT ON FUNCTION get_channel_feed IS 'Returns paginated feed of threads for a specific channel with all related data (music, stats, replies).';
-- Function: get_channel_details
-- Get detailed channel information with aggregated stats
--
-- Usage:
--   SELECT * FROM get_channel_details('hip-hop');

CREATE OR REPLACE FUNCTION get_channel_details(
  p_channel_id TEXT
)
RETURNS TABLE(
  channel_id TEXT,
  name TEXT,
  description TEXT,
  is_official BOOLEAN,
  icon_url TEXT,
  banner_url TEXT,
  color_hex TEXT,
  thread_count BIGINT,
  total_likes BIGINT,
  total_replies BIGINT,
  unique_contributors BIGINT,
  last_activity_at TIMESTAMP,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as channel_id,
    c.name,
    c.description,
    c.is_official,
    c.icon_url,
    c.banner_url,
    c.color_hex,
    COUNT(DISTINCT cn.node_id) as thread_count,
    COALESCE(SUM(stats.likes), 0) as total_likes,
    COALESCE(SUM(stats.replies), 0) as total_replies,
    COUNT(DISTINCT cn.author_fid) as unique_contributors,
    MAX(cn.created_at) as last_activity_at,
    c.created_at
  FROM channels c
  LEFT JOIN cast_nodes cn ON cn.channel = c.id
    AND cn.parent_cast_hash IS NULL
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) FILTER (WHERE ie.edge_type = 'LIKED') as likes,
      (SELECT COUNT(*) FROM cast_nodes replies WHERE replies.parent_cast_hash = cn.node_id) as replies
    FROM interaction_edges ie
    WHERE ie.cast_id = cn.node_id
  ) stats ON TRUE
  WHERE c.id = p_channel_id
  GROUP BY c.id, c.name, c.description, c.is_official,
           c.icon_url, c.banner_url, c.color_hex, c.created_at;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_channel_details TO authenticated;
GRANT EXECUTE ON FUNCTION get_channel_details TO anon;

-- Add helpful comment
COMMENT ON FUNCTION get_channel_details IS 'Returns detailed channel information with aggregated statistics (threads, likes, replies, contributors).';
