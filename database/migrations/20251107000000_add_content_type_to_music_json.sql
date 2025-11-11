-- Migration: Add musicType field to all feed function music JSON objects
-- This enables proper Spotify album/playlist and SoundCloud set playback
-- by exposing the music_type field from music_library table
--
-- TASK-721: Fix setlist playback for Spotify albums/playlists and SoundCloud sets
--
-- Changes:
-- - Updates 6 postgres functions to include 'musicType' in music JSON objects
-- - The music_type field already exists in music_library table with correct data
-- - This migration makes that data available to the frontend via API responses

-- 1. get_home_feed
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
          'thumbnail', ml.og_image_url,
          'musicType', ml.music_type
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

GRANT EXECUTE ON FUNCTION get_home_feed TO authenticated;
GRANT EXECUTE ON FUNCTION get_home_feed TO anon;
COMMENT ON FUNCTION get_home_feed IS 'Returns paginated feed of threads from all channels combined with all related data (music, stats, replies). Used for the Home feed.';

-- 2. get_channel_feed
CREATE OR REPLACE FUNCTION get_channel_feed(
  p_channel_id TEXT,
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
          'thumbnail', ml.og_image_url,
          'musicType', ml.music_type
        )
        ORDER BY cme.embed_index NULLS LAST
      ) as music_data
    FROM cast_music_edges cme
    INNER JOIN music_library ml ON cme.music_platform_id = ml.platform_id
      AND cme.music_platform_name = ml.platform_name
    WHERE cme.cast_id IN (SELECT node_id FROM channel_threads)
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
  ),
  threads_with_stats AS (
    SELECT
      t.node_id,
      t.cast_text,
      t.created_at,
      t.author_fid,
      COALESCE(ts.likes, 0) as likes_count,
      COALESCE(ts.recasts, 0) as recasts_count,
      COALESCE(tr.reply_count, 0) as replies_count,
      -- Calculate engagement score for sorting
      (COALESCE(ts.likes, 0) + COALESCE(tr.reply_count, 0) * 2) as engagement_score
    FROM channel_threads t
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
    COALESCE(tm.music_data, '[]'::jsonb) as music,
    tws.likes_count,
    tws.recasts_count,
    tws.replies_count
  FROM threads_with_stats tws
  LEFT JOIN user_nodes u ON tws.author_fid = u.node_id
  LEFT JOIN thread_music tm ON tws.node_id = tm.cast_id
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

GRANT EXECUTE ON FUNCTION get_channel_feed TO authenticated;
GRANT EXECUTE ON FUNCTION get_channel_feed TO anon;
COMMENT ON FUNCTION get_channel_feed IS 'Returns paginated feed of threads for a specific channel with all related data (music, stats, replies). Supports sorting (recent, popular_24h, popular_7d, all_time) and filtering (min_likes, music_sources, genres).';

-- 3. get_threads_feed
CREATE OR REPLACE FUNCTION get_threads_feed(
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
  WITH threads AS (
    SELECT
      cn.node_id,
      cn.cast_text,
      cn.created_at,
      cn.author_fid
    FROM cast_nodes cn
    WHERE cn.parent_cast_hash IS NULL
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
          'thumbnail', ml.og_image_url,
          'musicType', ml.music_type
        )
      ) as music_data
    FROM cast_music_edges cme
    INNER JOIN music_library ml ON cme.music_platform_id = ml.platform_id
      AND cme.music_platform_name = ml.platform_name
    WHERE cme.cast_id IN (SELECT node_id FROM threads)
    GROUP BY cme.cast_id
  ),
  thread_stats AS (
    SELECT
      ie.cast_id,
      COUNT(*) FILTER (WHERE ie.edge_type = 'LIKED') as likes,
      COUNT(*) FILTER (WHERE ie.edge_type = 'RECASTED') as recasts
    FROM interaction_edges ie
    WHERE ie.cast_id IN (SELECT node_id FROM threads)
    GROUP BY ie.cast_id
  ),
  thread_replies AS (
    SELECT
      cn.parent_cast_hash,
      COUNT(*) as reply_count
    FROM cast_nodes cn
    WHERE cn.parent_cast_hash IN (SELECT node_id FROM threads)
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
  FROM threads t
  LEFT JOIN user_nodes u ON t.author_fid = u.node_id
  LEFT JOIN thread_music tm ON t.node_id = tm.cast_id
  LEFT JOIN thread_stats ts ON t.node_id = ts.cast_id
  LEFT JOIN thread_replies tr ON t.node_id = tr.parent_cast_hash
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_threads_feed TO authenticated;
GRANT EXECUTE ON FUNCTION get_threads_feed TO anon;

-- 4. get_thread_with_replies
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
          'thumbnail', ml.og_image_url,
          'musicType', ml.music_type
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

GRANT EXECUTE ON FUNCTION get_thread_with_replies TO authenticated;
GRANT EXECUTE ON FUNCTION get_thread_with_replies TO anon;

-- 5. get_user_threads
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
          'thumbnail', ml.og_image_url,
          'musicType', ml.music_type
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

GRANT EXECUTE ON FUNCTION get_user_threads TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_threads TO anon;

-- 6. get_activity_feed
CREATE OR REPLACE FUNCTION get_activity_feed(
  limit_count INTEGER DEFAULT 50,
  cursor_timestamp TIMESTAMP DEFAULT NULL,
  cursor_id TEXT DEFAULT NULL
)
RETURNS TABLE(
  interaction_type TEXT,
  interaction_timestamp TIMESTAMP,
  actor_fid TEXT,
  actor_username TEXT,
  actor_display_name TEXT,
  actor_avatar_url TEXT,
  cast_hash TEXT,
  cast_text TEXT,
  cast_created_at TIMESTAMP,
  cast_author_fid TEXT,
  cast_author_username TEXT,
  cast_author_display_name TEXT,
  cast_author_avatar_url TEXT,
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
  WITH activity_edges AS (
    SELECT
      ie.edge_type,
      ie.created_at,
      ie.source_id,
      ie.cast_id
    FROM interaction_edges ie
    WHERE (cursor_timestamp IS NULL OR ie.created_at < cursor_timestamp)
    ORDER BY ie.created_at DESC
    LIMIT limit_count
  ),
  activity_casts AS (
    SELECT DISTINCT
      cn.node_id,
      cn.cast_text,
      cn.created_at,
      cn.author_fid
    FROM cast_nodes cn
    WHERE cn.node_id IN (SELECT cast_id FROM activity_edges)
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
          'thumbnail', ml.og_image_url,
          'musicType', ml.music_type
        )
      ) as music_data
    FROM cast_music_edges cme
    INNER JOIN music_library ml ON cme.music_platform_id = ml.platform_id
      AND cme.music_platform_name = ml.platform_name
    WHERE cme.cast_id IN (SELECT node_id FROM activity_casts)
    GROUP BY cme.cast_id
  ),
  cast_stats AS (
    SELECT
      ie.cast_id,
      COUNT(*) FILTER (WHERE ie.edge_type = 'LIKED') as likes,
      COUNT(*) FILTER (WHERE ie.edge_type = 'RECASTED') as recasts
    FROM interaction_edges ie
    WHERE ie.cast_id IN (SELECT node_id FROM activity_casts)
    GROUP BY ie.cast_id
  ),
  cast_replies AS (
    SELECT
      cn.parent_cast_hash,
      COUNT(*) as reply_count
    FROM cast_nodes cn
    WHERE cn.parent_cast_hash IN (SELECT node_id FROM activity_casts)
      AND cn.parent_cast_hash IS NOT NULL
    GROUP BY cn.parent_cast_hash
  )
  SELECT
    ae.edge_type::TEXT as interaction_type,
    ae.created_at as interaction_timestamp,
    ae.source_id::TEXT as actor_fid,
    COALESCE(actor.fname, 'unknown')::TEXT as actor_username,
    COALESCE(actor.display_name, 'Unknown User')::TEXT as actor_display_name,
    actor.avatar_url::TEXT as actor_avatar_url,
    ac.node_id::TEXT as cast_hash,
    ac.cast_text::TEXT,
    ac.created_at as cast_created_at,
    ac.author_fid::TEXT as cast_author_fid,
    COALESCE(author.fname, 'unknown')::TEXT as cast_author_username,
    COALESCE(author.display_name, 'Unknown User')::TEXT as cast_author_display_name,
    author.avatar_url::TEXT as cast_author_avatar_url,
    COALESCE(cm.music_data, '[]'::jsonb) as music,
    COALESCE(cs.likes, 0) as likes_count,
    COALESCE(cs.recasts, 0) as recasts_count,
    COALESCE(cr.reply_count, 0) as replies_count
  FROM activity_edges ae
  INNER JOIN activity_casts ac ON ae.cast_id = ac.node_id
  LEFT JOIN user_nodes actor ON ae.source_id = actor.node_id
  LEFT JOIN user_nodes author ON ac.author_fid = author.node_id
  LEFT JOIN cast_music cm ON ac.node_id = cm.cast_id
  LEFT JOIN cast_stats cs ON ac.node_id = cs.cast_id
  LEFT JOIN cast_replies cr ON ac.node_id = cr.parent_cast_hash
  ORDER BY ae.created_at DESC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_activity_feed TO authenticated;
GRANT EXECUTE ON FUNCTION get_activity_feed TO anon;
