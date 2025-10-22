-- Migration 1: Create Functions
-- Contains all three function definitions with proper error handling

-- Function 1: search_music_library
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

-- Function 2: sort_music_library
CREATE OR REPLACE FUNCTION sort_music_library(
  sort_column TEXT DEFAULT 'created_at',
  sort_direction TEXT DEFAULT 'desc',
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
  likes_count BIGINT,
  replies_count BIGINT,
  recasts_count BIGINT,
  total_count BIGINT
) AS $$
DECLARE
  total_rows BIGINT;
  sort_order TEXT;
BEGIN
  -- Input validation
  IF page_size > 250 THEN page_size := 250; END IF;
  IF page_size < 1 THEN page_size := 50; END IF;
  
  -- Validate sort direction
  IF LOWER(sort_direction) = 'asc' THEN
    sort_order := 'ASC';
  ELSE
    sort_order := 'DESC';
  END IF;

  -- Get total count with same filters
  WITH filtered_music AS (
    SELECT ml.cast_id, ml.embed_index
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
  )
  SELECT COUNT(*) INTO total_rows FROM filtered_music;

  -- Return sorted results with engagement metrics
  RETURN QUERY
  EXECUTE format('
    WITH filtered_music AS (
      SELECT 
        ml.cast_id,
        ml.embed_index,
        ml.title,
        ml.artist,
        ml.platform_name,
        ml.author_fid,
        ml.created_at,
        ml.genre
      FROM music_library ml
      WHERE 
        ($3 IS NULL OR (
          ml.title ILIKE ''%%'' || $3 || ''%%'' OR 
          ml.artist ILIKE ''%%'' || $3 || ''%%''
        ))
        AND ($4 IS NULL OR ml.platform_name = ANY($4))
        AND ($5 IS NULL OR ml.author_fid = ANY($5))
        AND ($6 IS NULL OR ml.genre && $6)
        AND ($7 IS NULL OR ml.created_at >= $7)
        AND ($8 IS NULL OR ml.created_at <= $8)
        AND ml.title IS NOT NULL 
        AND ml.title != ''''
    ),
    music_with_engagement AS (
      SELECT 
        fm.*,
        COALESCE(ce_likes.likes_count, 0) as likes_count,
        COALESCE(ce_replies.replies_count, 0) as replies_count,
        COALESCE(ce_recasts.recasts_count, 0) as recasts_count
      FROM filtered_music fm
      LEFT JOIN (
        SELECT cast_id, COUNT(*) as likes_count
        FROM cast_edges 
        WHERE edge_type = ''LIKED''
        GROUP BY cast_id
      ) ce_likes ON fm.cast_id = ce_likes.cast_id
      LEFT JOIN (
        SELECT cast_id, COUNT(*) as replies_count  
        FROM cast_edges
        WHERE edge_type = ''REPLIED''
        GROUP BY cast_id
      ) ce_replies ON fm.cast_id = ce_replies.cast_id
      LEFT JOIN (
        SELECT cast_id, COUNT(*) as recasts_count
        FROM cast_edges 
        WHERE edge_type = ''RECASTED''
        GROUP BY cast_id
      ) ce_recasts ON fm.cast_id = ce_recasts.cast_id
    )
    SELECT 
      cast_id,
      embed_index,
      title,
      artist,
      platform_name,
      author_fid,
      created_at,
      genre,
      likes_count,
      replies_count,
      recasts_count,
      $2 as total_count
    FROM music_with_engagement
    ORDER BY %s %s, created_at DESC
    LIMIT $9 OFFSET $10
  ', 
  CASE 
    WHEN sort_column = 'title' THEN 'title'
    WHEN sort_column = 'artist' THEN 'artist'
    WHEN sort_column = 'likes' THEN 'likes_count'
    WHEN sort_column = 'replies' THEN 'replies_count'
    WHEN sort_column = 'recasts' THEN 'recasts_count'
    ELSE 'created_at'
  END,
  sort_order)
  USING 
    sort_column, total_rows, search_query, sources, users, tags, 
    date_after, date_before, page_size, page_offset;
    
END;
$$ LANGUAGE plpgsql;

-- Function 3: get_engagement_stats_batch
CREATE OR REPLACE FUNCTION get_engagement_stats_batch(cast_ids TEXT[])
RETURNS TABLE(
  cast_id TEXT,
  likes_count BIGINT,
  replies_count BIGINT,
  recasts_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH engagement_stats AS (
    SELECT 
      ce.cast_id,
      COUNT(*) FILTER (WHERE ce.edge_type = 'LIKED') as likes_count,
      COUNT(*) FILTER (WHERE ce.edge_type = 'REPLIED') as replies_count,
      COUNT(*) FILTER (WHERE ce.edge_type = 'RECASTED') as recasts_count
    FROM cast_edges ce
    WHERE ce.cast_id = ANY(cast_ids)
    GROUP BY ce.cast_id
  )
  SELECT 
    cid.cast_id,
    COALESCE(es.likes_count, 0) as likes_count,
    COALESCE(es.replies_count, 0) as replies_count,
    COALESCE(es.recasts_count, 0) as recasts_count
  FROM unnest(cast_ids) AS cid(cast_id)
  LEFT JOIN engagement_stats es ON es.cast_id = cid.cast_id;
END;
$$ LANGUAGE plpgsql;