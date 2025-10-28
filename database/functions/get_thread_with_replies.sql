-- Get a specific thread with all replies and related data
-- Returns both the main thread and all replies with authors, music, and stats
CREATE OR REPLACE FUNCTION get_thread_with_replies(
  thread_cast_hash TEXT
)
RETURNS TABLE(
  item_type TEXT, -- 'thread' or 'reply'
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
          'thumbnail', ml.og_image_url
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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_thread_with_replies TO authenticated;
GRANT EXECUTE ON FUNCTION get_thread_with_replies TO anon;
