-- Function: get_home_feed
-- Get paginated feed of threads from ALL channels combined
-- Similar to get_channel_feed but without channel filter
--
-- Usage:
--   SELECT * FROM get_home_feed();
--   SELECT * FROM get_home_feed(25, NULL, NULL, FALSE, 'recent', 3);

CREATE OR REPLACE FUNCTION get_home_feed(
  limit_count INTEGER DEFAULT 50,
  cursor_timestamp TIMESTAMP DEFAULT NULL,
  cursor_id TEXT DEFAULT NULL,
  music_only BOOLEAN DEFAULT FALSE,
  sort_by TEXT DEFAULT 'recent',
  min_likes INTEGER DEFAULT 0,
  p_music_sources TEXT[] DEFAULT NULL,
  p_genres TEXT[] DEFAULT NULL
)
RETURNS TABLE(
  cast_hash TEXT,
  cast_text TEXT,
  created_at TIMESTAMP,
  author_fid TEXT,
  author_username TEXT,
  author_display_name TEXT,
  author_avatar_url TEXT,
  channel_id TEXT,
  channel_name TEXT,
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

  -- Validate sort_by parameter
  IF sort_by NOT IN ('recent', 'popular_24h', 'popular_7d', 'all_time') THEN
    sort_by := 'recent';
  END IF;

  RETURN QUERY
  WITH home_threads AS (
    SELECT
      cn.node_id,
      cn.cast_text,
      cn.created_at,
      cn.author_fid,
      cn.channel
    FROM cast_nodes cn
    INNER JOIN channels ch ON cn.channel = ch.id  -- ONLY from curated channels
    WHERE cn.parent_cast_hash IS NULL  -- Only root threads
      AND cn.channel IS NOT NULL  -- Must be in a channel
      AND (cursor_timestamp IS NULL OR cn.created_at < cursor_timestamp)
      AND (NOT music_only OR EXISTS (
        SELECT 1 FROM cast_music_edges
        WHERE cast_id = cn.node_id
      ))
      -- Time-based filter for popular sorts
      AND (sort_by != 'popular_24h' OR cn.created_at > NOW() - INTERVAL '24 hours')
      AND (sort_by != 'popular_7d' OR cn.created_at > NOW() - INTERVAL '7 days')
  ),
  thread_music AS (
    SELECT
      cme.cast_id,
      jsonb_agg(
        jsonb_build_object(
          'id', ml.platform_name || '-' || ml.platform_id,
          'title', COALESCE(ml.title, ml.og_title, 'Unknown Track'),
          'artist', COALESCE(ml.artist, ml.og_artist, 'Unknown Artist'),
          'platform', ml.platform_name,
          'platformId', ml.platform_id,
          'url', ml.url,
          'thumbnail', ml.og_image_url
        )
        ORDER BY cme.embed_index NULLS LAST
      ) as music_data
    FROM cast_music_edges cme
    INNER JOIN music_library ml ON cme.music_platform_id = ml.platform_id
      AND cme.music_platform_name = ml.platform_name
    WHERE cme.cast_id IN (SELECT node_id FROM home_threads)
      -- Filter by music source if specified
      AND (p_music_sources IS NULL OR ml.platform_name = ANY(p_music_sources))
      -- Filter by genres if specified (array overlap operator)
      AND (p_genres IS NULL OR ml.genres && p_genres)
    GROUP BY cme.cast_id
  ),
  thread_stats AS (
    SELECT
      ie.cast_id,
      COUNT(*) FILTER (WHERE ie.edge_type = 'LIKED') as likes,
      COUNT(*) FILTER (WHERE ie.edge_type = 'RECASTED') as recasts
    FROM interaction_edges ie
    WHERE ie.cast_id IN (SELECT node_id FROM home_threads)
    GROUP BY ie.cast_id
  ),
  thread_replies AS (
    SELECT
      cn.parent_cast_hash,
      COUNT(*) as reply_count
    FROM cast_nodes cn
    WHERE cn.parent_cast_hash IN (SELECT node_id FROM home_threads)
      AND cn.parent_cast_hash IS NOT NULL
    GROUP BY cn.parent_cast_hash
  ),
  threads_with_stats AS (
    SELECT
      t.node_id,
      t.cast_text,
      t.created_at,
      t.author_fid,
      t.channel,
      COALESCE(ts.likes, 0) as likes_count,
      COALESCE(ts.recasts, 0) as recasts_count,
      COALESCE(tr.reply_count, 0) as replies_count,
      -- Calculate engagement score for sorting
      (COALESCE(ts.likes, 0) + COALESCE(tr.reply_count, 0) * 2) as engagement_score
    FROM home_threads t
    LEFT JOIN thread_stats ts ON t.node_id = ts.cast_id
    LEFT JOIN thread_replies tr ON t.node_id = tr.parent_cast_hash
    -- Apply quality filter (min likes)
    WHERE (COALESCE(ts.likes, 0) + COALESCE(ts.recasts, 0)) >= min_likes
    -- Only include threads that have music if music_sources or genres filters are applied
    AND (
      (p_music_sources IS NULL AND p_genres IS NULL)
      OR t.node_id IN (SELECT cast_id FROM thread_music)
    )
  )
  SELECT
    tws.node_id::TEXT as cast_hash,
    tws.cast_text::TEXT,
    tws.created_at,
    tws.author_fid::TEXT,
    COALESCE(u.fname, 'unknown')::TEXT as author_username,
    COALESCE(u.display_name, 'Unknown User')::TEXT as author_display_name,
    u.avatar_url::TEXT as author_avatar_url,
    tws.channel::TEXT as channel_id,
    COALESCE(ch.name, tws.channel)::TEXT as channel_name,
    COALESCE(tm.music_data, '[]'::jsonb) as music,
    tws.likes_count,
    tws.recasts_count,
    tws.replies_count
  FROM threads_with_stats tws
  LEFT JOIN user_nodes u ON tws.author_fid = u.node_id
  LEFT JOIN thread_music tm ON tws.node_id = tm.cast_id
  LEFT JOIN channels ch ON tws.channel = ch.id
  ORDER BY
    CASE
      WHEN sort_by = 'recent' THEN tws.created_at
    END DESC,
    CASE
      WHEN sort_by IN ('popular_24h', 'popular_7d', 'all_time') THEN tws.engagement_score
    END DESC NULLS LAST,
    tws.created_at DESC  -- Secondary sort by time for consistency
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_home_feed TO authenticated;
GRANT EXECUTE ON FUNCTION get_home_feed TO anon;

-- Add helpful comment
COMMENT ON FUNCTION get_home_feed IS 'Returns paginated feed of threads from all channels combined with all related data (music, stats, replies). Used for the Home feed.';
