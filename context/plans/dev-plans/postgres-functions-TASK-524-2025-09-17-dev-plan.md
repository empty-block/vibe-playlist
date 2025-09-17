# Postgres Functions for Full Library Sorting and Search - Development Plan
**Task:** TASK-524 - New postgres functions  
**Date:** 2025-09-17  
**Zen Principle:** Simplicity through Server-Side Wisdom

## Problem Statement

The music library table is currently limited to 1,000 results due to Supabase API query limits. When users sort columns (title, artist, likes, replies) or search, operations only work on this subset instead of the complete library data. This creates:

1. **Incomplete Sorting**: Column header sorting operates on limited dataset, missing potentially relevant results
2. **Partial Search Results**: Search functionality only finds matches within the 1,000 result limit
3. **Performance Issues**: Client-side sorting of large datasets is inefficient
4. **Data Integrity**: Users see inconsistent results depending on when they sort vs search

## Root Cause Analysis

The current implementation fetches data through Supabase client API which has inherent limits:
- Maximum 1,000 rows per query without pagination
- Client-side sorting and search on limited datasets
- Multiple round-trips required for engagement data aggregation
- No server-side optimization for common operations

## Technical Architecture Overview

### Current Flow (Problematic)
```
Frontend → Supabase Client API → Limited music_library (1,000 rows)
├─ Client-side sorting on partial data
├─ Client-side search on partial data  
└─ Separate queries for engagement stats → Incomplete aggregation
```

### Proposed Flow (Solution)
```
Frontend → Custom Postgres Functions → Full Dataset Operations
├─ search_music_library(query, filters, pagination) → Complete search results
├─ sort_music_library(sort_column, direction, filters, pagination) → Global sorting
└─ get_engagement_metrics(cast_ids[]) → Optimized stats aggregation
```

## Database Function Design - The Zen Approach

Following the **Middle Way** principle, we'll create focused, single-purpose functions that work harmoniously with the existing schema while providing powerful server-side capabilities.

### Function 1: `search_music_library`
```sql
-- Purpose: Full-text search across entire music library with pagination
-- Returns: Properly paginated results based on complete dataset search
CREATE OR REPLACE FUNCTION search_music_library(
  search_query TEXT DEFAULT NULL,
  sources TEXT[] DEFAULT NULL,
  users TEXT[] DEFAULT NULL,
  tags TEXT[] DEFAULT NULL,
  date_after TIMESTAMPTZ DEFAULT NULL,
  date_before TIMESTAMPTZ DEFAULT NULL,
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
  created_at TIMESTAMPTZ,
  genre TEXT[],
  total_count BIGINT
) AS $$
```

**Key Features:**
- Full-text search on title and artist fields using PostgreSQL's text search capabilities
- Supports all existing filter parameters (sources, users, tags, date ranges)
- Returns total count for accurate pagination
- Uses ILIKE with proper indexing for performance

### Function 2: `sort_music_library` 
```sql
-- Purpose: Global sorting across entire music library with engagement metrics
-- Returns: Sorted results with social stats aggregated server-side
CREATE OR REPLACE FUNCTION sort_music_library(
  sort_column TEXT DEFAULT 'created_at',
  sort_direction TEXT DEFAULT 'desc',
  search_query TEXT DEFAULT NULL,
  sources TEXT[] DEFAULT NULL,
  users TEXT[] DEFAULT NULL,
  tags TEXT[] DEFAULT NULL,
  date_after TIMESTAMPTZ DEFAULT NULL,
  date_before TIMESTAMPTZ DEFAULT NULL,
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
  created_at TIMESTAMPTZ,
  genre TEXT[],
  likes_count BIGINT,
  replies_count BIGINT,
  recasts_count BIGINT,
  total_count BIGINT
) AS $$
```

**Key Features:**
- Supports sorting by: title, artist, created_at, likes_count, replies_count, recasts_count
- Aggregates engagement metrics from cast_edges table via subqueries/CTEs
- Maintains filtering capabilities while operating on full dataset
- Optimized query execution with proper indexes

### Function 3: `get_engagement_stats_batch`
```sql
-- Purpose: Efficiently batch-load engagement statistics for multiple casts
-- Returns: Engagement metrics optimized for the frontend's track transformation
CREATE OR REPLACE FUNCTION get_engagement_stats_batch(
  cast_ids TEXT[]
)
RETURNS TABLE(
  cast_id TEXT,
  likes_count BIGINT,
  replies_count BIGINT,
  recasts_count BIGINT
) AS $$
```

**Key Features:**
- Optimized batch processing for engagement data
- Reduces N+1 query problem in current implementation
- Uses efficient aggregation with proper indexing on cast_edges table

## Implementation Steps

### Phase 1: Database Function Development (Critical Path)

#### Step 1.1: Create Core Search Function
**File:** `/database/functions/search_music_library.sql`

```sql
-- Full implementation with proper error handling, indexing hints, and performance optimization
CREATE OR REPLACE FUNCTION search_music_library(
  search_query TEXT DEFAULT NULL,
  sources TEXT[] DEFAULT NULL,  
  users TEXT[] DEFAULT NULL,
  tags TEXT[] DEFAULT NULL,
  date_after TIMESTAMPTZ DEFAULT NULL,
  date_before TIMESTAMPTZ DEFAULT NULL,
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
  created_at TIMESTAMPTZ,
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
```

#### Step 1.2: Create Sort Function with Engagement Metrics
**File:** `/database/functions/sort_music_library.sql`

```sql
CREATE OR REPLACE FUNCTION sort_music_library(
  sort_column TEXT DEFAULT 'created_at',
  sort_direction TEXT DEFAULT 'desc',
  search_query TEXT DEFAULT NULL,
  sources TEXT[] DEFAULT NULL,
  users TEXT[] DEFAULT NULL,
  tags TEXT[] DEFAULT NULL,
  date_after TIMESTAMPTZ DEFAULT NULL,
  date_before TIMESTAMPTZ DEFAULT NULL,
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
  created_at TIMESTAMPTZ,
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
        WHERE edge_type = ''like''
        GROUP BY cast_id
      ) ce_likes ON fm.cast_id = ce_likes.cast_id
      LEFT JOIN (
        SELECT cast_id, COUNT(*) as replies_count  
        FROM cast_edges
        WHERE edge_type = ''reply''
        GROUP BY cast_id
      ) ce_replies ON fm.cast_id = ce_replies.cast_id
      LEFT JOIN (
        SELECT cast_id, COUNT(*) as recasts_count
        FROM cast_edges 
        WHERE edge_type = ''recast''
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION sort_music_library TO authenticated;
GRANT EXECUTE ON FUNCTION sort_music_library TO anon;
```

#### Step 1.3: Create Engagement Batch Function
**File:** `/database/functions/get_engagement_stats_batch.sql`

```sql
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
      COUNT(*) FILTER (WHERE ce.edge_type = 'like') as likes_count,
      COUNT(*) FILTER (WHERE ce.edge_type = 'reply') as replies_count,
      COUNT(*) FILTER (WHERE ce.edge_type = 'recast') as recasts_count
    FROM cast_edges ce
    WHERE ce.cast_id = ANY(cast_ids)
    GROUP BY ce.cast_id
  )
  SELECT 
    unnest(cast_ids) as cast_id,
    COALESCE(es.likes_count, 0) as likes_count,
    COALESCE(es.replies_count, 0) as replies_count,
    COALESCE(es.recasts_count, 0) as recasts_count
  FROM engagement_stats es
  RIGHT JOIN unnest(cast_ids) AS cast_id ON es.cast_id = cast_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions  
GRANT EXECUTE ON FUNCTION get_engagement_stats_batch TO authenticated;
GRANT EXECUTE ON FUNCTION get_engagement_stats_batch TO anon;
```

### Phase 2: Backend API Integration

#### Step 2.1: Enhance Database Service
**File:** `/backend/api/database.ts`

```typescript
// Add new methods to DatabaseService class

async searchLibraryWithPagination(query: LibraryQuery): Promise<{
  tracks: any[]
  totalCount: number
  hasMore: boolean
}> {
  // Convert username filters to FIDs if needed
  let userFids: string[] | null = null
  if (query.users && query.users.length > 0) {
    const { data: userNodes } = await this.supabase
      .from('user_nodes')
      .select('node_id')
      .in('fname', query.users)
    userFids = userNodes?.map(user => user.node_id) || []
  }

  const { data, error } = await this.supabase.rpc('search_music_library', {
    search_query: query.search || null,
    sources: query.sources || null,
    users: userFids,
    tags: query.tags || null,
    date_after: query.after || null,
    date_before: query.before || null,
    page_size: Math.min(query.limit || 50, 250),
    page_offset: this.calculateOffset(query.cursor, query.limit || 50)
  })

  if (error) {
    console.error('Search function error:', error)
    throw new Error('Database search failed')
  }

  const totalCount = data?.[0]?.total_count || 0
  const tracks = data || []
  const pageSize = query.limit || 50
  const currentOffset = this.calculateOffset(query.cursor, pageSize)
  const hasMore = (currentOffset + tracks.length) < totalCount

  return { tracks, totalCount, hasMore }
}

async sortLibraryWithPagination(query: LibraryQuery): Promise<{
  tracks: any[]
  totalCount: number
  hasMore: boolean
}> {
  // Convert username filters to FIDs if needed
  let userFids: string[] | null = null
  if (query.users && query.users.length > 0) {
    const { data: userNodes } = await this.supabase
      .from('user_nodes')
      .select('node_id')
      .in('fname', query.users)
    userFids = userNodes?.map(user => user.node_id) || []
  }

  const { data, error } = await this.supabase.rpc('sort_music_library', {
    sort_column: query.sortBy || 'created_at',
    sort_direction: query.sortDirection || 'desc',
    search_query: query.search || null,
    sources: query.sources || null,
    users: userFids,
    tags: query.tags || null,
    date_after: query.after || null,
    date_before: query.before || null,
    page_size: Math.min(query.limit || 50, 250),
    page_offset: this.calculateOffset(query.cursor, query.limit || 50)
  })

  if (error) {
    console.error('Sort function error:', error)
    throw new Error('Database sort failed')
  }

  const totalCount = data?.[0]?.total_count || 0
  const tracks = data || []
  const pageSize = query.limit || 50
  const currentOffset = this.calculateOffset(query.cursor, pageSize)
  const hasMore = (currentOffset + tracks.length) < totalCount

  return { tracks, totalCount, hasMore }
}

private calculateOffset(cursor?: string, pageSize: number = 50): number {
  if (!cursor) return 0
  
  try {
    const cursorData = JSON.parse(atob(cursor))
    return cursorData.offset || 0
  } catch (error) {
    console.warn('Invalid cursor provided:', cursor)
    return 0
  }
}

private generateNextCursor(currentOffset: number, pageSize: number, hasMore: boolean): string | undefined {
  if (!hasMore) return undefined
  
  const nextOffset = currentOffset + pageSize
  return btoa(JSON.stringify({ offset: nextOffset }))
}
```

#### Step 2.2: Update Library API
**File:** `/backend/api/library.ts`

```typescript
// Modify the executeQuery method to use new functions

private async executeQuery(query: LibraryQuery): Promise<Response> {
  const startTime = Date.now()

  try {
    let result: { tracks: any[], totalCount: number, hasMore: boolean }
    
    // Use appropriate function based on operation type
    if (query.search && query.search.trim() !== '') {
      // Use search function for text queries
      result = await this.db.searchLibraryWithPagination(query)
    } else if (query.sortBy && ['likes', 'replies', 'recasts'].includes(query.sortBy)) {
      // Use sort function for engagement-based sorting
      result = await this.db.sortLibraryWithPagination(query)
    } else if (query.globalSort) {
      // Use sort function for any global sorting
      result = await this.db.sortLibraryWithPagination(query)
    } else {
      // Fall back to existing implementation for simple queries
      const oldResult = await this.db.queryLibrary(query)
      result = {
        tracks: oldResult.tracks,
        totalCount: oldResult.tracks.length,
        hasMore: oldResult.hasMore
      }
    }

    // Transform to frontend format
    const transformedTracks = await this.transformTracksWithEngagement(result.tracks)
    
    // Generate cursor for pagination
    const currentOffset = this.calculateOffset(query.cursor, query.limit || 50)
    const nextCursor = result.hasMore 
      ? btoa(JSON.stringify({ offset: currentOffset + transformedTracks.length }))
      : undefined

    const response: LibraryResponse = {
      tracks: transformedTracks,
      pagination: {
        hasMore: result.hasMore,
        nextCursor,
        total: result.totalCount
      },
      appliedFilters: query,
      meta: {
        queryTime: Date.now() - startTime,
        cached: false
      }
    }

    return new Response(JSON.stringify(response), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  } catch (error) {
    console.error('Query execution error:', error)
    return this.errorResponse('QUERY_ERROR', 'Failed to execute query', 500)
  }
}

private async transformTracksWithEngagement(dbRecords: any[]): Promise<Track[]> {
  // Enhanced transformation that includes engagement data from function results
  
  if (!dbRecords || dbRecords.length === 0) {
    return []
  }

  // Get user and cast data (same as existing logic)
  const authorFids = [...new Set(dbRecords.map(record => record.author_fid))]
  const castIds = [...new Set(dbRecords.map(record => record.cast_id))]
  
  // Fetch user info in chunks
  const users = await this.fetchUsersInChunks(authorFids)
  const casts = await this.fetchCastsInChunks(castIds)  
  const embeds = await this.fetchEmbedsInChunks(castIds)
  
  // Create lookup maps
  const userMap = new Map(users.map(user => [user.node_id, user]))
  const castMap = new Map(casts.map(cast => [cast.node_id, cast]))
  const embedMap = new Map(embeds.map(embed => [`${embed.cast_id}-${embed.embed_index}`, embed]))

  return dbRecords.map(record => {
    const user = userMap.get(record.author_fid)
    const cast = castMap.get(record.cast_id)
    const embed = embedMap.get(`${record.cast_id}-${record.embed_index}`)
    
    const embedUrl = embed?.url || ''
    let sourceId = record.cast_id
    
    // Extract platform-specific IDs
    if (record.platform_name === 'youtube' && embedUrl) {
      const videoIdMatch = embedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
      if (videoIdMatch) sourceId = videoIdMatch[1]
    } else if (record.platform_name === 'spotify' && embedUrl) {
      const trackIdMatch = embedUrl.match(/spotify\.com\/track\/([^?]+)/)
      if (trackIdMatch) sourceId = trackIdMatch[1]
    }

    return {
      id: `${record.cast_id}-${record.embed_index}`,
      title: record.title,
      artist: record.artist || 'Unknown Artist',
      source: record.platform_name as 'youtube' | 'spotify' | 'soundcloud',
      sourceId: sourceId,
      sourceUrl: embedUrl,
      thumbnailUrl: undefined,
      duration: undefined,
      
      user: {
        username: user?.fname || 'unknown',
        displayName: user?.display_name || 'Unknown User',
        avatar: user?.avatar_url
      },
      
      userInteraction: {
        type: 'shared',
        timestamp: record.created_at,
        context: cast?.cast_text || undefined
      },
      
      // Use engagement data from function results
      socialStats: {
        likes: record.likes_count || 0,
        replies: record.replies_count || 0,
        recasts: record.recasts_count || 0
      },
      
      tags: record.genre || [],
      createdAt: record.created_at
    } as Track
  })
}
```

### Phase 3: Database Optimization

#### Step 3.1: Create Performance Indexes
**File:** `/database/migrations/20250917000000_add_library_performance_indexes.sql`

```sql
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
```

### Phase 4: Frontend Integration (Optional Enhancement)

#### Step 4.1: Add Server-Side Function Toggle
**File:** `/shared/types/library.ts`

```typescript
// Extend LibraryQuery interface
export interface LibraryQuery {
  // ... existing fields
  
  // New options for server-side functions
  useServerSideSearch?: boolean     // Use postgres search function
  useServerSideSort?: boolean       // Use postgres sort function
  includeEngagementMetrics?: boolean // Include likes/replies/recasts in results
}
```

#### Step 4.2: Update Frontend Service
**File:** `/frontend/src/services/libraryApiService.ts`

```typescript
// Add method to determine when to use server-side functions
private shouldUseServerSideSearch(filters: LibraryFilters): boolean {
  // Use server-side search for:
  // 1. Any search query
  // 2. Large expected result sets
  // 3. When engagement sorting is requested
  return !!(
    filters.search?.trim() ||
    filters.sortBy === 'likes' ||
    filters.sortBy === 'replies' ||
    filters.sortBy === 'recasts'
  )
}

private shouldUseServerSideSort(filters: LibraryFilters): boolean {
  // Use server-side sort for:
  // 1. Engagement-based sorting
  // 2. When global sort is explicitly requested
  return !!(
    filters.sortBy === 'likes' ||
    filters.sortBy === 'replies' ||
    filters.sortBy === 'recasts' ||
    filters.globalSort
  )
}

async getFilteredTracks(filters: LibraryFilters): Promise<LibraryResponse> {
  const query: LibraryQuery = {
    ...this.convertFiltersToQuery(filters),
    useServerSideSearch: this.shouldUseServerSideSearch(filters),
    useServerSideSort: this.shouldUseServerSideSort(filters),
    includeEngagementMetrics: true
  }
  
  return await this.queryLibrary(query)
}
```

## Database Migration Strategy

### Migration 1: Create Functions
```sql
-- File: /database/migrations/20250917000001_create_library_functions.sql
-- Contains all three function definitions with proper error handling
```

### Migration 2: Add Performance Indexes  
```sql
-- File: /database/migrations/20250917000002_add_library_performance_indexes.sql
-- All necessary indexes for optimal function performance
```

### Migration 3: Grant Permissions
```sql
-- File: /database/migrations/20250917000003_grant_function_permissions.sql
-- Ensure proper RLS and permissions for new functions
```

## Performance Optimization Strategy

### Query Optimization
1. **Prepared Statements**: Functions compile once, execute many times
2. **Index Utilization**: Targeted indexes for common filter/sort combinations  
3. **Query Planning**: Use EXPLAIN ANALYZE to validate execution plans
4. **Connection Pooling**: Leverage Supabase's built-in connection pooling

### Caching Strategy
1. **Function Results**: Cache common search/sort patterns for 2-5 minutes
2. **Engagement Metrics**: Cache aggregated engagement data for 1 minute
3. **Filter Results**: Cache filter combination results for faster subsequent requests

### Memory Management
1. **Cursor Pagination**: Maintain cursor-based pagination for memory efficiency
2. **Batch Processing**: Process large datasets in chunks where needed
3. **Result Limits**: Enforce reasonable limits (250 max) to prevent memory issues

## Error Handling & Resilience

### Database Function Errors
```sql
-- Example error handling in functions
BEGIN
  -- Validation
  IF page_size > 250 THEN 
    RAISE EXCEPTION 'Page size cannot exceed 250';
  END IF;
  
  -- Main query with error handling
  RETURN QUERY ...
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Function error: %', SQLERRM;
    -- Return empty result set instead of failing
    RETURN;
END;
```

### API Fallback Strategy
```typescript
// Graceful degradation in DatabaseService
async searchLibraryWithPagination(query: LibraryQuery) {
  try {
    // Try new postgres function first
    return await this.callSearchFunction(query)
  } catch (error) {
    console.warn('Search function failed, falling back to client query:', error)
    // Fall back to existing Supabase client implementation
    return await this.queryLibrary(query)
  }
}
```

## Testing Strategy

### Unit Tests - Database Functions
```sql
-- Test file: /database/functions/test_search_music_library.sql
SELECT plan(10);

-- Test 1: Basic search functionality
SELECT results_eq(
  'SELECT cast_id FROM search_music_library(''test song'', NULL, NULL, NULL, NULL, NULL, 10, 0)',
  'SELECT cast_id FROM music_library WHERE title ILIKE ''%test song%'' LIMIT 10',
  'Search function returns correct results for title search'
);

-- Test 2: Pagination accuracy
SELECT results_eq(
  'SELECT total_count FROM search_music_library(NULL, NULL, NULL, NULL, NULL, NULL, 10, 0) LIMIT 1',
  'SELECT COUNT(*)::bigint FROM music_library WHERE title IS NOT NULL',
  'Total count matches actual library size'
);

-- More tests for edge cases, performance, etc.
SELECT finish();
```

### Integration Tests - API Layer
```typescript
// Test file: /backend/api/library.test.ts
describe('Library API with Postgres Functions', () => {
  test('search returns complete results from entire library', async () => {
    const response = await request(app)
      .post('/api/library')
      .send({
        search: 'Beatles',
        limit: 50
      })
    
    expect(response.status).toBe(200)
    expect(response.body.pagination.total).toBeGreaterThan(50) // Should find more than pagination limit
    expect(response.body.tracks.every(track => 
      track.title.includes('Beatles') || track.artist.includes('Beatles')
    )).toBe(true)
  })

  test('engagement-based sorting works across full library', async () => {
    const response = await request(app)
      .post('/api/library')
      .send({
        sortBy: 'likes',
        sortDirection: 'desc',
        limit: 10
      })
    
    expect(response.status).toBe(200)
    expect(response.body.tracks).toHaveLength(10)
    
    // Verify sorting order
    for (let i = 1; i < response.body.tracks.length; i++) {
      expect(response.body.tracks[i-1].socialStats.likes)
        .toBeGreaterThanOrEqual(response.body.tracks[i].socialStats.likes)
    }
  })
})
```

### Performance Tests
```typescript
// Test file: /backend/api/library.performance.test.ts
describe('Library API Performance', () => {
  test('search completes within 2 seconds for large datasets', async () => {
    const startTime = Date.now()
    
    const response = await request(app)
      .post('/api/library')
      .send({
        search: 'music',
        limit: 100
      })
    
    const queryTime = Date.now() - startTime
    expect(queryTime).toBeLessThan(2000)
    expect(response.body.meta.queryTime).toBeLessThan(2000)
  })
})
```

## Deployment & Rollback Plan

### Phase 1: Database Functions (Low Risk)
1. **Deploy functions** during low-traffic window
2. **Run validation tests** against production data (read-only)
3. **Monitor function performance** for 24 hours before API integration

### Phase 2: Backend Integration (Medium Risk)  
1. **Feature flag** new function usage
2. **A/B test** 10% of traffic initially
3. **Monitor metrics**: response time, error rate, user satisfaction
4. **Gradually increase** to 100% over 1 week

### Phase 3: Optimization (Low Risk)
1. **Add indexes** during low-traffic window
2. **Monitor query plans** and performance improvements
3. **Fine-tune** based on production usage patterns

### Rollback Strategy
1. **Immediate**: Disable feature flags to revert to old implementation
2. **Short-term**: Remove function calls from API, keep functions for debugging
3. **Long-term**: Drop functions if fundamental issues found

## Success Metrics

### Functional Success
- **Search Accuracy**: Search finds all relevant tracks across entire library (>99% recall)
- **Sort Accuracy**: Column sorting operates on complete dataset, not just current page
- **Pagination Integrity**: Total counts and pagination work correctly with large datasets

### Performance Success  
- **Response Time**: <2 seconds for search and sort operations on 1000+ track libraries
- **Engagement Loading**: Social stats load with tracks instead of separate API calls
- **Memory Usage**: No increase in backend memory usage despite larger result processing

### User Experience Success
- **No Breaking Changes**: Existing frontend functionality works unchanged
- **Improved Results**: Users see more complete and relevant search/sort results
- **Faster Loading**: Perceived performance improvement due to server-side optimization

## Monitoring & Observability

### Database Metrics
- Function execution time and frequency
- Index usage and query plan efficiency
- Connection pool utilization
- Cache hit rates for repeated queries

### API Metrics
- Response time distribution for new vs old implementation
- Error rates and types (function errors vs client errors)
- Feature flag usage and adoption rates

### User Metrics
- Search usage patterns and success rates
- Sort operation frequency by column type
- Library browse session length and engagement

---

## Philosophy Notes

This solution embodies **Wu Wei** (effortless action) by:
- **Working with PostgreSQL's strengths** rather than fighting against database limitations
- **Maintaining backward compatibility** while adding powerful new capabilities
- **Following the path of least resistance** - using existing schema and adding focused functions
- **Optimizing for long-term maintainability** over short-term convenience

The approach follows **beginner's mind** by questioning the assumption that all data processing must happen in the frontend, while respecting the existing architecture's proven patterns.

**Remember**: The database is not just a storage layer - it's a powerful computation engine. By moving the right operations server-side, we create a foundation that flows naturally with the data while providing the user experience they deserve.

Like water flowing downhill, this solution should feel inevitable once implemented - simple, powerful, and perfectly suited to its environment.