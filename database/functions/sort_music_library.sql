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
  engagement_total BIGINT,
  shared_by TEXT,
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
        COALESCE(ce_recasts.recasts_count, 0) as recasts_count,
        (COALESCE(ce_likes.likes_count, 0) + COALESCE(ce_replies.replies_count, 0) + COALESCE(ce_recasts.recasts_count, 0)) as engagement_total,
        COALESCE(un.fname, un.display_name, ''Unknown'') as shared_by
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
      LEFT JOIN user_nodes un ON fm.author_fid = un.node_id
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
      engagement_total,
      shared_by,
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
    WHEN sort_column = 'engagement' THEN 'engagement_total'
    WHEN sort_column = 'platform' THEN 'platform_name'
    WHEN sort_column = 'sharedBy' THEN 'shared_by'
    WHEN sort_column = 'timestamp' THEN 'created_at'
    ELSE 'created_at'
  END,
  sort_order)
  USING 
    sort_column, total_rows, search_query, sources, users, tags, 
    date_after, date_before, page_size, page_offset;
    
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION sort_music_library TO authenticated;
GRANT EXECUTE ON FUNCTION sort_music_library TO anon;