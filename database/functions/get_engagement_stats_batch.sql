CREATE OR REPLACE FUNCTION get_engagement_stats_batch(cast_ids TEXT[])
RETURNS TABLE(
  cast_id TEXT,
  likes_count BIGINT,
  replies_count BIGINT,
  recasts_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH engagement_stats AS (
    SELECT 
      ce.cast_id,
      COUNT(*) FILTER (WHERE ce.edge_type = 'LIKED') as likes_count,
      COUNT(*) FILTER (WHERE ce.edge_type = 'REPLIED') as replies_count,
      COUNT(*) FILTER (WHERE ce.edge_type = 'RECASTED') as recasts_count
    FROM cast_edges ce
    WHERE ce.cast_id = ANY(cast_ids)
    GROUP BY ce.cast_id
  )
  SELECT 
    cid.cast_id,
    COALESCE(es.likes_count, 0) as likes_count,
    COALESCE(es.replies_count, 0) as replies_count,
    COALESCE(es.recasts_count, 0) as recasts_count
  FROM unnest(cast_ids) AS cid(cast_id)
  LEFT JOIN engagement_stats es ON es.cast_id = cid.cast_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions  
GRANT EXECUTE ON FUNCTION get_engagement_stats_batch TO authenticated;
GRANT EXECUTE ON FUNCTION get_engagement_stats_batch TO anon;