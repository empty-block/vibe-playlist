-- Analytics Functions Migration
-- Created: 2025-07-10
-- Purpose: Create PostgreSQL functions for efficient community analytics queries

-- Function 1: Get top artists by unique users within time range
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

-- Function 2: Get platform distribution within time range  
CREATE OR REPLACE FUNCTION get_platform_distribution_by_time_range(time_filter timestamptz DEFAULT NULL)
RETURNS TABLE(platform_name text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ml.platform_name,
    COUNT(*) as count
  FROM music_library ml
  WHERE ml.platform_name IS NOT NULL 
    AND ml.platform_name != ''
    AND (time_filter IS NULL OR ml.processed_at >= time_filter)
  GROUP BY ml.platform_name
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Get top songs by unique users within time range
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

-- Function 4: Get top genres within time range
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_top_artists_by_time_range TO authenticated;
GRANT EXECUTE ON FUNCTION get_platform_distribution_by_time_range TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_songs_by_time_range TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_genres_by_time_range TO authenticated;

-- Grant execute permissions to anon users (for API access)
GRANT EXECUTE ON FUNCTION get_top_artists_by_time_range TO anon;
GRANT EXECUTE ON FUNCTION get_platform_distribution_by_time_range TO anon;
GRANT EXECUTE ON FUNCTION get_top_songs_by_time_range TO anon;
GRANT EXECUTE ON FUNCTION get_top_genres_by_time_range TO anon; 