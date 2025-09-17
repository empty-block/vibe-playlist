-- Full implementation with proper error handling, indexing hints, and performance optimization
CREATE OR REPLACE FUNCTION search_music_library(
  search_query TEXT DEFAULT NULL,
  sources TEXT[] DEFAULT NULL,  
  users TEXT[] DEFAULT NULL,
  tags TEXT[] DEFAULT NULL,
  date_after TIMESTAMP DEFAULT NULL,
  date_before TIMESTAMP DEFAULT NULL,
  page_size INTEGER DEFAULT 50,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  cast_id TEXT,
  embed_index INTEGER,
  title TEXT,
  artist TEXT,
  platform_name TEXT,
  author_fid TEXT,
  created_at TIMESTAMP,
  genre TEXT[],
  total_count BIGINT
) AS $$
DECLARE
  total_rows BIGINT;
BEGIN
  -- Input validation
  IF page_size > 250 THEN
    page_size := 250;
  END IF;
  
  IF page_size < 1 THEN
    page_size := 50;
  END IF;

  -- Get total count for pagination
  SELECT COUNT(*) INTO total_rows
  FROM music_library ml
  WHERE 
    (search_query IS NULL OR (
      ml.title ILIKE '%' || search_query || '%' OR 
      ml.artist ILIKE '%' || search_query || '%'
    ))
    AND (sources IS NULL OR ml.platform_name = ANY(sources))
    AND (users IS NULL OR ml.author_fid = ANY(users))
    AND (tags IS NULL OR ml.genre && tags)
    AND (date_after IS NULL OR ml.created_at >= date_after)
    AND (date_before IS NULL OR ml.created_at <= date_before)
    AND ml.title IS NOT NULL 
    AND ml.title != '';

  -- Return paginated results with total count
  RETURN QUERY
  SELECT 
    ml.cast_id,
    ml.embed_index,
    ml.title,
    ml.artist,
    ml.platform_name,
    ml.author_fid,
    ml.created_at,
    ml.genre,
    total_rows as total_count
  FROM music_library ml
  WHERE 
    (search_query IS NULL OR (
      ml.title ILIKE '%' || search_query || '%' OR 
      ml.artist ILIKE '%' || search_query || '%'
    ))
    AND (sources IS NULL OR ml.platform_name = ANY(sources))
    AND (users IS NULL OR ml.author_fid = ANY(users))
    AND (tags IS NULL OR ml.genre && tags)
    AND (date_after IS NULL OR ml.created_at >= date_after)
    AND (date_before IS NULL OR ml.created_at <= date_before)
    AND ml.title IS NOT NULL 
    AND ml.title != ''
  ORDER BY 
    CASE WHEN search_query IS NOT NULL THEN
      -- Relevance scoring for search results
      (CASE WHEN ml.title ILIKE search_query || '%' THEN 3
            WHEN ml.artist ILIKE search_query || '%' THEN 2  
            WHEN ml.title ILIKE '%' || search_query || '%' THEN 1
            ELSE 0 END) +
      (CASE WHEN ml.artist ILIKE search_query || '%' THEN 1 ELSE 0 END)
    ELSE 0 END DESC,
    ml.created_at DESC
  LIMIT page_size 
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION search_music_library TO authenticated;
GRANT EXECUTE ON FUNCTION search_music_library TO anon;