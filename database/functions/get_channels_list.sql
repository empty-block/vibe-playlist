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
