-- Migration: Create Threads API Functions
-- Creates PostgreSQL functions for threads and activity API endpoints
-- Replaces multiple client-side queries with single server-side function calls

-- Function 1: get_threads_feed
-- Get paginated feed of threads with all related data
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
          'thumbnail', ml.thumbnail_url
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

-- Function 2: get_thread_with_replies
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

-- Function 3: get_user_threads
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

-- Function 4: get_activity_feed
-- Get global activity feed with all interactions
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
          'thumbnail', ml.thumbnail_url
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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_threads_feed TO authenticated;
GRANT EXECUTE ON FUNCTION get_threads_feed TO anon;
GRANT EXECUTE ON FUNCTION get_thread_with_replies TO authenticated;
GRANT EXECUTE ON FUNCTION get_thread_with_replies TO anon;
GRANT EXECUTE ON FUNCTION get_user_threads TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_threads TO anon;
GRANT EXECUTE ON FUNCTION get_activity_feed TO authenticated;
GRANT EXECUTE ON FUNCTION get_activity_feed TO anon;
