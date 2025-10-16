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
  cursor_id TEXT DEFAULT NULL,
  music_only BOOLEAN DEFAULT FALSE
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
      AND (NOT music_only OR EXISTS (
        SELECT 1 FROM cast_music_edges
        WHERE cast_id = cn.node_id
      ))
    ORDER BY cn.created_at DESC
    LIMIT limit_count
  ),
  thread_music AS (
    SELECT
      cme.cast_id,
      jsonb_agg(
        jsonb_build_object(
          'id', ml.platform_name || '-' || ml.platform_id,
          -- Prefer AI-normalized title, fallback to OpenGraph title
          'title', COALESCE(ml.title, ml.og_title, 'Unknown Track'),
          -- Prefer AI-normalized artist, fallback to OpenGraph artist
          'artist', COALESCE(ml.artist, ml.og_artist, 'Unknown Artist'),
          'platform', ml.platform_name,
          'platformId', ml.platform_id,
          'url', ml.url,
          -- Use OpenGraph image for thumbnail
          'thumbnail', ml.og_image_url
        )
        ORDER BY cme.embed_index NULLS LAST
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
