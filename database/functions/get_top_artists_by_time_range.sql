-- Get top artists by unique users within time range
-- Purpose: Returns the top 10 artists ranked by number of unique users who shared their music
-- Parameters: time_filter (optional) - only include records after this timestamp
-- Returns: artist name and unique user count
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
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_top_artists_by_time_range TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_artists_by_time_range TO anon; 