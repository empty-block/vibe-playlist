-- Adjust engagement score weights
-- New weighting: Sharers (x10), Recastsers (x3), Repliers (x2), Likers (x1)

-- Drop existing functions first
DROP FUNCTION IF EXISTS get_top_artists_by_time_range(timestamptz);
DROP FUNCTION IF EXISTS get_top_songs_by_time_range(timestamptz);
DROP FUNCTION IF EXISTS get_top_genres_by_time_range(timestamptz);
DROP FUNCTION IF EXISTS get_platform_distribution_by_time_range(timestamptz);

-- Create get_top_artists_by_time_range function with new weights
CREATE OR REPLACE FUNCTION get_top_artists_by_time_range(time_filter timestamptz DEFAULT NULL)
RETURNS TABLE(
  artist text, 
  unique_sharers bigint,
  unique_likers bigint, 
  unique_recastsers bigint,
  unique_repliers bigint,
  engagement_score bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ml.artist,
    COUNT(DISTINCT CASE WHEN ce.edge_type = 'AUTHORED' THEN ce.source_user_id END) as unique_sharers,
    COUNT(DISTINCT CASE WHEN ce.edge_type = 'LIKED' THEN ce.source_user_id END) as unique_likers,
    COUNT(DISTINCT CASE WHEN ce.edge_type = 'RECASTED' THEN ce.source_user_id END) as unique_recastsers,
    COUNT(DISTINCT CASE WHEN ce.edge_type = 'REPLIED' THEN ce.source_user_id END) as unique_repliers,
    (COUNT(DISTINCT CASE WHEN ce.edge_type = 'AUTHORED' THEN ce.source_user_id END) * 10 +
     COUNT(DISTINCT CASE WHEN ce.edge_type = 'LIKED' THEN ce.source_user_id END) * 1 +
     COUNT(DISTINCT CASE WHEN ce.edge_type = 'RECASTED' THEN ce.source_user_id END) * 3 +
     COUNT(DISTINCT CASE WHEN ce.edge_type = 'REPLIED' THEN ce.source_user_id END) * 2) as engagement_score
  FROM music_library ml
  LEFT JOIN cast_edges ce ON ml.cast_id = ce.cast_id
  WHERE ml.artist IS NOT NULL 
    AND ml.artist != ''
    AND (time_filter IS NULL OR ml.created_at >= time_filter)
  GROUP BY ml.artist
  ORDER BY engagement_score DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Create get_top_songs_by_time_range function with new weights
CREATE OR REPLACE FUNCTION get_top_songs_by_time_range(time_filter timestamptz DEFAULT NULL)
RETURNS TABLE(
  song text, 
  unique_sharers bigint,
  unique_likers bigint, 
  unique_recastsers bigint,
  unique_repliers bigint,
  engagement_score bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CONCAT(ml.title, ' - ', ml.artist) as song,
    COUNT(DISTINCT CASE WHEN ce.edge_type = 'AUTHORED' THEN ce.source_user_id END) as unique_sharers,
    COUNT(DISTINCT CASE WHEN ce.edge_type = 'LIKED' THEN ce.source_user_id END) as unique_likers,
    COUNT(DISTINCT CASE WHEN ce.edge_type = 'RECASTED' THEN ce.source_user_id END) as unique_recastsers,
    COUNT(DISTINCT CASE WHEN ce.edge_type = 'REPLIED' THEN ce.source_user_id END) as unique_repliers,
    (COUNT(DISTINCT CASE WHEN ce.edge_type = 'AUTHORED' THEN ce.source_user_id END) * 10 +
     COUNT(DISTINCT CASE WHEN ce.edge_type = 'LIKED' THEN ce.source_user_id END) * 1 +
     COUNT(DISTINCT CASE WHEN ce.edge_type = 'RECASTED' THEN ce.source_user_id END) * 3 +
     COUNT(DISTINCT CASE WHEN ce.edge_type = 'REPLIED' THEN ce.source_user_id END) * 2) as engagement_score
  FROM music_library ml
  LEFT JOIN cast_edges ce ON ml.cast_id = ce.cast_id
  WHERE ml.title IS NOT NULL 
    AND ml.title != ''
    AND (time_filter IS NULL OR ml.created_at >= time_filter)
  GROUP BY ml.title, ml.artist
  ORDER BY engagement_score DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Create get_top_genres_by_time_range function with new weights
CREATE OR REPLACE FUNCTION get_top_genres_by_time_range(time_filter timestamptz DEFAULT NULL)
RETURNS TABLE(
  genre text, 
  unique_sharers bigint,
  unique_likers bigint, 
  unique_recastsers bigint,
  unique_repliers bigint,
  engagement_score bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    UNNEST(ml.genre) as genre,
    COUNT(DISTINCT CASE WHEN ce.edge_type = 'AUTHORED' THEN ce.source_user_id END) as unique_sharers,
    COUNT(DISTINCT CASE WHEN ce.edge_type = 'LIKED' THEN ce.source_user_id END) as unique_likers,
    COUNT(DISTINCT CASE WHEN ce.edge_type = 'RECASTED' THEN ce.source_user_id END) as unique_recastsers,
    COUNT(DISTINCT CASE WHEN ce.edge_type = 'REPLIED' THEN ce.source_user_id END) as unique_repliers,
    (COUNT(DISTINCT CASE WHEN ce.edge_type = 'AUTHORED' THEN ce.source_user_id END) * 10 +
     COUNT(DISTINCT CASE WHEN ce.edge_type = 'LIKED' THEN ce.source_user_id END) * 1 +
     COUNT(DISTINCT CASE WHEN ce.edge_type = 'RECASTED' THEN ce.source_user_id END) * 3 +
     COUNT(DISTINCT CASE WHEN ce.edge_type = 'REPLIED' THEN ce.source_user_id END) * 2) as engagement_score
  FROM music_library ml
  LEFT JOIN cast_edges ce ON ml.cast_id = ce.cast_id
  WHERE ml.genre IS NOT NULL 
    AND array_length(ml.genre, 1) > 0
    AND (time_filter IS NULL OR ml.created_at >= time_filter)
  GROUP BY UNNEST(ml.genre)
  ORDER BY engagement_score DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Create get_platform_distribution_by_time_range function with new weights
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
     COUNT(DISTINCT CASE WHEN ce.edge_type = 'LIKED' THEN ce.source_user_id END) * 1 +
     COUNT(DISTINCT CASE WHEN ce.edge_type = 'RECASTED' THEN ce.source_user_id END) * 3 +
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