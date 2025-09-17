-- Add indexes to optimize the new functions

-- Index for text search on title and artist
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_music_library_text_search 
ON music_library USING gin((
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(artist, '')), 'B')
));

-- Index for common filter combinations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_music_library_filters 
ON music_library (platform_name, author_fid, created_at DESC) 
WHERE title IS NOT NULL AND title != '';

-- Index for genre array operations  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_music_library_genre_gin 
ON music_library USING gin(genre);

-- Optimize cast_edges for engagement aggregation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cast_edges_engagement 
ON cast_edges (cast_id, edge_type);

-- Combined index for common sort operations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_music_library_sort_created_at 
ON music_library (created_at DESC, cast_id, embed_index) 
WHERE title IS NOT NULL AND title != '';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_music_library_sort_title 
ON music_library (title, created_at DESC) 
WHERE title IS NOT NULL AND title != '';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_music_library_sort_artist 
ON music_library (artist, created_at DESC) 
WHERE title IS NOT NULL AND title != '';