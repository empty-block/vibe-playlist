-- Update aggregation functions to return top 50 instead of top 10
-- Migration: 20250917000000_update_aggregation_functions_limit_50
-- Purpose: Fix TASK-523 aggregation API to show more results (50 instead of 10)

-- Update get_top_artists_by_time_range function to return top 50
CREATE OR REPLACE FUNCTION get_top_artists_by_time_range(time_filter timestamptz DEFAULT NULL)
RETURNS TABLE(artist text, unique_users bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ml.artist,
    COUNT(DISTINCT ml.author_fid) as unique_users
  FROM music_library ml
  WHERE ml.artist IS NOT NULL 
    AND ml.artist != ''
    AND (time_filter IS NULL OR ml.processed_at >= time_filter)
  GROUP BY ml.artist
  ORDER BY unique_users DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Update get_top_genres_by_time_range function to return top 50
CREATE OR REPLACE FUNCTION get_top_genres_by_time_range(time_filter timestamptz DEFAULT NULL)
RETURNS TABLE(genre text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    genre_unnested as genre,
    COUNT(*) as count
  FROM (
    SELECT UNNEST(ml.genre) as genre_unnested
    FROM music_library ml
    WHERE ml.genre IS NOT NULL 
      AND array_length(ml.genre, 1) > 0
      AND (time_filter IS NULL OR ml.processed_at >= time_filter)
  ) genres
  WHERE genre_unnested IS NOT NULL 
    AND genre_unnested != ''
  GROUP BY genre_unnested
  ORDER BY count DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Ensure proper permissions are granted
GRANT EXECUTE ON FUNCTION get_top_artists_by_time_range TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_artists_by_time_range TO anon;
GRANT EXECUTE ON FUNCTION get_top_genres_by_time_range TO authenticated; 
GRANT EXECUTE ON FUNCTION get_top_genres_by_time_range TO anon;