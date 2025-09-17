-- Update platform function to match weighted engagement format

DROP FUNCTION IF EXISTS get_platform_distribution_by_time_range(timestamptz);

CREATE OR REPLACE FUNCTION get_platform_distribution_by_time_range(time_filter timestamptz DEFAULT NULL)
RETURNS TABLE(
  platform_name text, 
  unique_sharers bigint,
  unique_likers bigint, 
  unique_recastsers bigint,
  unique_repliers bigint,
  engagement_score bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ml.platform_name,
    COUNT(DISTINCT CASE WHEN ce.edge_type = 'AUTHORED' THEN ce.source_user_id END) as unique_sharers,
    COUNT(DISTINCT CASE WHEN ce.edge_type = 'LIKED' THEN ce.source_user_id END) as unique_likers,
    COUNT(DISTINCT CASE WHEN ce.edge_type = 'RECASTED' THEN ce.source_user_id END) as unique_recastsers,
    COUNT(DISTINCT CASE WHEN ce.edge_type = 'REPLIED' THEN ce.source_user_id END) as unique_repliers,
    (COUNT(DISTINCT CASE WHEN ce.edge_type = 'AUTHORED' THEN ce.source_user_id END) * 10 +
     COUNT(DISTINCT CASE WHEN ce.edge_type = 'LIKED' THEN ce.source_user_id END) * 3 +
     COUNT(DISTINCT CASE WHEN ce.edge_type = 'RECASTED' THEN ce.source_user_id END) * 5 +
     COUNT(DISTINCT CASE WHEN ce.edge_type = 'REPLIED' THEN ce.source_user_id END) * 2) as engagement_score
  FROM music_library ml
  LEFT JOIN cast_edges ce ON ml.cast_id = ce.cast_id
  WHERE ml.platform_name IS NOT NULL 
    AND ml.platform_name != ''
    AND (time_filter IS NULL OR ml.created_at >= time_filter)
  GROUP BY ml.platform_name
  ORDER BY engagement_score DESC;
END;
$$ LANGUAGE plpgsql; 