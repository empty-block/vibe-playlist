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
    COUNT(DISTINCT cn.node_id)::BIGINT as thread_count,
    COALESCE(SUM(stats.likes), 0)::BIGINT as total_likes,
    COALESCE(SUM(stats.replies), 0)::BIGINT as total_replies,
    COUNT(DISTINCT cn.author_fid)::BIGINT as unique_contributors,
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
