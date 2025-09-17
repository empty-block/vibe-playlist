-- Update analytics functions to count likes instead of unique users
-- This provides better engagement metrics for smaller user bases

-- Drop existing functions first (required to change return type)
DROP FUNCTION IF EXISTS get_top_artists_by_time_range(timestamptz);
DROP FUNCTION IF EXISTS get_top_songs_by_time_range(timestamptz);
DROP FUNCTION IF EXISTS get_top_genres_by_time_range(timestamptz);
DROP FUNCTION IF EXISTS get_platform_distribution_by_time_range(timestamptz);

-- Create get_top_artists_by_time_range function to count total likes
CREATE OR REPLACE FUNCTION get_top_artists_by_time_range(time_filter timestamptz DEFAULT NULL)
RETURNS TABLE(artist text, total_likes bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ml.artist,
    COUNT(ce.source_user_id) as total_likes
  FROM music_library ml
  LEFT JOIN cast_edges ce ON ml.cast_id = ce.cast_id AND ce.edge_type = 'LIKED'
  WHERE ml.artist IS NOT NULL 
    AND ml.artist != ''
    AND (time_filter IS NULL OR ml.created_at >= time_filter)
  GROUP BY ml.artist
  ORDER BY total_likes DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Create get_top_songs_by_time_range function to count total likes  
CREATE OR REPLACE FUNCTION get_top_songs_by_time_range(time_filter timestamptz DEFAULT NULL)
RETURNS TABLE(song text, total_likes bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CONCAT(ml.title, ' - ', ml.artist) as song,
    COUNT(ce.source_user_id) as total_likes
  FROM music_library ml
  LEFT JOIN cast_edges ce ON ml.cast_id = ce.cast_id AND ce.edge_type = 'LIKED'
  WHERE ml.title IS NOT NULL 
    AND ml.title != ''
    AND (time_filter IS NULL OR ml.created_at >= time_filter)
  GROUP BY ml.title, ml.artist
  ORDER BY total_likes DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Create get_top_genres_by_time_range function to count total likes
CREATE OR REPLACE FUNCTION get_top_genres_by_time_range(time_filter timestamptz DEFAULT NULL)
RETURNS TABLE(genre text, total_likes bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    UNNEST(ml.genre) as genre,
    COUNT(ce.source_user_id) as total_likes
  FROM music_library ml
  LEFT JOIN cast_edges ce ON ml.cast_id = ce.cast_id AND ce.edge_type = 'LIKED'
  WHERE ml.genre IS NOT NULL 
    AND array_length(ml.genre, 1) > 0
    AND (time_filter IS NULL OR ml.created_at >= time_filter)
  GROUP BY UNNEST(ml.genre)
  ORDER BY total_likes DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Create get_platform_distribution_by_time_range function to count total likes
CREATE OR REPLACE FUNCTION get_platform_distribution_by_time_range(time_filter timestamptz DEFAULT NULL)
RETURNS TABLE(platform_name text, total_likes bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ml.platform_name,
    COUNT(ce.source_user_id) as total_likes
  FROM music_library ml
  LEFT JOIN cast_edges ce ON ml.cast_id = ce.cast_id AND ce.edge_type = 'LIKED'
  WHERE ml.platform_name IS NOT NULL 
    AND ml.platform_name != ''
    AND (time_filter IS NULL OR ml.created_at >= time_filter)
  GROUP BY ml.platform_name
  ORDER BY total_likes DESC;
END;
$$ LANGUAGE plpgsql; 