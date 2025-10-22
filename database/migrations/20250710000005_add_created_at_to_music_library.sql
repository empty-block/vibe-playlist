-- Add created_at column to music_library table for performance optimization
-- This eliminates the need for joins in analytics queries

-- Step 1: Add the column
ALTER TABLE music_library 
ADD COLUMN created_at timestamp without time zone;

-- Step 2: Populate the column with data from cast_nodes
UPDATE music_library 
SET created_at = cn.created_at
FROM cast_nodes cn
WHERE music_library.cast_id = cn.node_id;

-- Step 3: Make the column NOT NULL (since all records should have a creation date)
ALTER TABLE music_library 
ALTER COLUMN created_at SET NOT NULL;

-- Step 4: Add index for efficient time-based queries
CREATE INDEX idx_music_library_created_at ON music_library(created_at);

-- Step 5: Update all analytics functions to use the new column directly

-- Update get_community_basic_metrics function
CREATE OR REPLACE FUNCTION get_community_basic_metrics(time_filter timestamptz DEFAULT NULL)
RETURNS TABLE (
    total_songs_shared bigint,
    total_interactions bigint,
    active_users bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT ml.cast_id) as total_songs_shared,
        COUNT(DISTINCT (ce.source_user_id, ce.cast_id, ce.edge_type)) as total_interactions,
        COUNT(DISTINCT ml.author_fid) as active_users
    FROM music_library ml
    LEFT JOIN cast_edges ce ON ml.cast_id = ce.cast_id
    WHERE (time_filter IS NULL OR ml.created_at >= time_filter);
END;
$$ LANGUAGE plpgsql;

-- Update get_top_artists_by_time_range function
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
    AND (time_filter IS NULL OR ml.created_at >= time_filter)
  GROUP BY ml.artist
  ORDER BY unique_users DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Update get_top_songs_by_time_range function
CREATE OR REPLACE FUNCTION get_top_songs_by_time_range(time_filter timestamptz DEFAULT NULL)
RETURNS TABLE(song text, unique_users bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CONCAT(ml.title, ' - ', ml.artist) as song,
    COUNT(DISTINCT ml.author_fid) as unique_users
  FROM music_library ml
  WHERE ml.title IS NOT NULL 
    AND ml.title != ''
    AND (time_filter IS NULL OR ml.created_at >= time_filter)
  GROUP BY ml.title, ml.artist
  ORDER BY unique_users DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Update get_top_genres_by_time_range function  
CREATE OR REPLACE FUNCTION get_top_genres_by_time_range(time_filter timestamptz DEFAULT NULL)
RETURNS TABLE(genre text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    UNNEST(ml.genre) as genre,
    COUNT(DISTINCT ml.author_fid) as count
  FROM music_library ml
  WHERE ml.genre IS NOT NULL 
    AND array_length(ml.genre, 1) > 0
    AND (time_filter IS NULL OR ml.created_at >= time_filter)
  GROUP BY UNNEST(ml.genre)
  ORDER BY count DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Update get_platform_distribution_by_time_range function
CREATE OR REPLACE FUNCTION get_platform_distribution_by_time_range(time_filter timestamptz DEFAULT NULL)
RETURNS TABLE(platform_name text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ml.platform_name,
    COUNT(DISTINCT ml.author_fid) as count
  FROM music_library ml
  WHERE ml.platform_name IS NOT NULL 
    AND ml.platform_name != ''
    AND (time_filter IS NULL OR ml.created_at >= time_filter)
  GROUP BY ml.platform_name
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql; 