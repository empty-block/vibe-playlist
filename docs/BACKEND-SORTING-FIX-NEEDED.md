# Backend Sorting Fix Required for TASK-707

## Issue Summary

The sorting functionality for channel feeds and home feed is currently **broken**. The API endpoints are trying to pass sorting parameters to database functions, but the database functions don't accept these parameters yet.

## Current State

### Frontend (Working)
- ✅ New `SortDropdown` component created for one-click sort access
- ✅ Sort options: Recent, Popular 24h, Popular 7d, All Time
- ✅ Shuffle handled separately (client-side randomization)
- ✅ Engagement filter updated (All Posts, 3+ Likes, 10+ Likes)

### Backend API (Partially Working)
- ⚠️ API endpoints accept and parse parameters: `sort_by`, `min_likes`, `p_music_sources`, `p_genres`
- ⚠️ API tries to pass these to database functions
- ❌ **Database functions don't accept these parameters** (except in newer versions)

## Files That Need Updates

### 1. Database Functions (CRITICAL)

**File:** `/database/functions/get_channel_feed.sql`
**Current Signature:**
```sql
CREATE OR REPLACE FUNCTION get_channel_feed(
  p_channel_id TEXT,
  limit_count INTEGER DEFAULT 50,
  cursor_timestamp TIMESTAMP DEFAULT NULL,
  cursor_id TEXT DEFAULT NULL,
  music_only BOOLEAN DEFAULT FALSE
)
```

**Needs to Add:**
```sql
CREATE OR REPLACE FUNCTION get_channel_feed(
  p_channel_id TEXT,
  limit_count INTEGER DEFAULT 50,
  cursor_timestamp TIMESTAMP DEFAULT NULL,
  cursor_id TEXT DEFAULT NULL,
  music_only BOOLEAN DEFAULT FALSE,
  sort_by TEXT DEFAULT 'recent',           -- NEW
  min_likes INTEGER DEFAULT 0,              -- NEW
  p_music_sources TEXT[] DEFAULT NULL,      -- NEW
  p_genres TEXT[] DEFAULT NULL              -- NEW
)
```

**File:** `/database/functions/get_home_feed.sql`
**Similar updates needed** - add `sort_by`, `min_likes`, `p_music_sources`, `p_genres` parameters

### 2. Sorting Logic Implementation

The database functions need to implement sorting logic:

**Recent** (default):
```sql
ORDER BY cn.created_at DESC
```

**Popular 24h:**
```sql
WHERE cn.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY COALESCE(ts.likes, 0) DESC, cn.created_at DESC
```

**Popular 7d:**
```sql
WHERE cn.created_at >= NOW() - INTERVAL '7 days'
ORDER BY COALESCE(ts.likes, 0) DESC, cn.created_at DESC
```

**All Time:**
```sql
ORDER BY COALESCE(ts.likes, 0) DESC, cn.created_at DESC
```

### 3. Filtering Logic Implementation

**Min Likes Filter:**
```sql
WHERE ... AND COALESCE(ts.likes, 0) >= min_likes
```

**Music Sources Filter:**
```sql
WHERE ... AND (
  p_music_sources IS NULL OR
  EXISTS (
    SELECT 1 FROM cast_music_edges cme
    INNER JOIN music_library ml ON cme.music_platform_id = ml.platform_id
    WHERE cme.cast_id = cn.node_id
      AND ml.platform_name = ANY(p_music_sources)
  )
)
```

**Genres Filter:**
```sql
WHERE ... AND (
  p_genres IS NULL OR
  EXISTS (
    SELECT 1 FROM cast_music_edges cme
    INNER JOIN music_library ml ON cme.music_platform_id = ml.platform_id
    WHERE cme.cast_id = cn.node_id
      AND ml.genre = ANY(p_genres)
  )
)
```

## Testing Requirements

Once backend is fixed, test these scenarios:

1. **Sort by Recent**: Should show newest posts first
2. **Sort by Popular 24h**: Should show posts with most likes from last 24 hours
3. **Sort by Popular 7d**: Should show posts with most likes from last 7 days
4. **Sort by All Time**: Should show posts with most likes ever (across all database)
5. **Engagement Filter - All Posts**: No like filtering
6. **Engagement Filter - 3+ Likes**: Only posts with 3 or more likes
7. **Engagement Filter - 10+ Likes**: Only posts with 10 or more likes
8. **Music Sources Filter**: Filter by platform (Spotify, YouTube, etc.)
9. **Genres Filter**: Filter by genre tags
10. **Combined Filters**: Test multiple filters together

## API Endpoints Affected

- `GET /api/channels/:channelId/feed` (lines 278-419 in `/backend/api/channels.ts`)
- `GET /api/channels/home/feed` (lines 65-211 in `/backend/api/channels.ts`)

Both endpoints already parse and pass parameters correctly, they just need the database functions to accept them.

## Performance Considerations

- **Indexing**: Ensure `likes_count` has proper indexes for popular sorting
- **Time Windows**: The 24h and 7d sorts should use indexes on `created_at`
- **Pagination**: Cursor-based pagination should work with all sort types

## Migration Plan

1. Create new migration file: `20251103_add_sorting_filters_to_feed_functions.sql`
2. Update both `get_channel_feed` and `get_home_feed` functions
3. Test with various parameter combinations
4. Deploy to staging first, then production
5. Monitor query performance with `EXPLAIN ANALYZE`

## Notes

- The frontend is **ready** and waiting for backend support
- This is a high-priority fix as sorting is a core feature
- Users currently see "random" order when selecting popular sorts because the backend ignores the parameter
- The API logging already shows the parameters being sent (check backend logs)

## Contact

If you need help with the SQL implementation, coordinate with the xev agent or backend team.
