-- Get top songs by unique users within time range
-- Purpose: Returns the top 10 songs ranked by number of unique users who shared them
-- Parameters: time_filter (optional) - only include records after this timestamp
-- Returns: song title (artist - title format) and unique user count
CREATE OR REPLACE FUNCTION get_top_songs_by_time_range(time_filter timestamptz DEFAULT NULL)
RETURNS TABLE(song text, unique_users bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CONCAT(
      COALESCE(ml.artist, 'Unknown Artist'), 
      ' - ', 
      COALESCE(ml.title, 'Unknown Track')
    ) as song,
    COUNT(DISTINCT ml.author_fid) as unique_users
  FROM music_library ml
  WHERE ml.title IS NOT NULL 
    AND ml.title != ''
    AND (time_filter IS NULL OR ml.processed_at >= time_filter)
  GROUP BY ml.artist, ml.title
  ORDER BY unique_users DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_top_songs_by_time_range TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_songs_by_time_range TO anon; 