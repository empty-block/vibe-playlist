-- Get top genres within time range
-- Purpose: Returns the top 10 genres ranked by frequency across all songs
-- Parameters: time_filter (optional) - only include records after this timestamp
-- Returns: genre name and occurrence count
-- Note: Handles PostgreSQL array fields by unnesting genre arrays
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
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_top_genres_by_time_range TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_genres_by_time_range TO anon; 