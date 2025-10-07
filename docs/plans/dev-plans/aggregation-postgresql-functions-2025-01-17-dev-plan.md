# Artist/Genre Aggregation API Fix - PostgreSQL Functions Implementation

**Issue:** TASK-523 - Fix artist/genre aggregation API calls - Replace client-side aggregation with PostgreSQL functions

**Date:** 2025-01-17

## Problem Analysis

### Current Issue
The aggregations API is incomplete due to Supabase's 1000-row limit, causing:
- Partial artist/genre statistics in library browse sections
- Client-side aggregation on incomplete datasets
- Missing tracks for users with large music libraries

### Current Implementation Flow
1. `AggregationsAPI.generateAggregations()` calls `DatabaseService.queryLibrary()` with `returnFullDataset: true`
2. `DatabaseService` queries Supabase but still hits 1000-row limit even with `skipPagination`
3. Client-side aggregation in `extractArtistsFromTracks()` and `extractGenresFromTracks()` 
4. Returns partial results to frontend

### Available Solution
PostgreSQL functions bypass Supabase limits:
- `get_top_artists_by_time_range(time_filter)` - Returns top 10 artists by unique users
- `get_top_genres_by_time_range(time_filter)` - Returns top 10 genres by frequency

## Development Plan

### Phase 1: Add PostgreSQL Function Support to DatabaseService

**File:** `/backend/api/database.ts`

**Implementation:**
1. Add new methods to `DatabaseService` class:
   ```typescript
   async getTopArtistsByTimeRange(timeFilter?: string): Promise<ArtistData[]>
   async getTopGenresByTimeRange(timeFilter?: string): Promise<GenreData[]>
   ```

2. Use Supabase RPC to call PostgreSQL functions:
   ```typescript
   const { data, error } = await this.supabase.rpc('get_top_artists_by_time_range', {
     time_filter: timeFilter
   })
   ```

3. Map database results to `ArtistData[]` and `GenreData[]` types
4. Handle errors gracefully and maintain existing error patterns

**Key Technical Details:**
- Functions accept optional `timestamptz` parameter for time filtering
- Artists ranked by `unique_users` (distinct author_fid count)
- Genres ranked by `count` (total occurrences)
- Both limited to top 10 results
- Handle null/empty results appropriately

### Phase 2: Update AggregationsAPI to Use PostgreSQL Functions

**File:** `/backend/api/aggregations.ts`

**Changes to `generateAggregations()` method:**

1. **Replace current flow** from:
   ```typescript
   const { tracks } = await this.db.queryLibrary({...})
   const artists = this.extractArtistsFromTracks(tracks)
   const genres = this.extractGenresFromTracks(tracks)
   ```

2. **To new PostgreSQL function calls:**
   ```typescript
   const timeFilter = this.convertQueryToTimeFilter(query)
   const [artists, genres] = await Promise.all([
     this.db.getTopArtistsByTimeRange(timeFilter),
     this.db.getTopGenresByTimeRange(timeFilter)
   ])
   ```

3. **Add time filter conversion logic:**
   - Convert `LibraryQuery` date filters to PostgreSQL timestamp format
   - Map `dateRange` ('today', 'week', 'month') to appropriate timestamps
   - Handle `after`/`before` date strings
   - Pass `null` for 'all' or no time filters

4. **Get accurate total count:**
   - Use separate PostgreSQL function or optimized count query
   - Ensure count respects same filters as aggregations
   - Consider caching strategy for performance

**Method Signature Updates:**
```typescript
private convertQueryToTimeFilter(query: LibraryQuery): string | null
private async getTotalTracksCount(query: LibraryQuery): Promise<number>
```

### Phase 3: Maintain Response Format Compatibility

**Ensure Backward Compatibility:**
1. Keep exact same `LibraryAggregations` response structure
2. Maintain CORS headers and error handling patterns
3. Preserve query timing and metadata
4. Support all existing query parameters (users, sources, search, etc.)

**Response Structure (unchanged):**
```typescript
const aggregations: LibraryAggregations = {
  artists,           // ArtistData[] from PostgreSQL function
  genres,            // GenreData[] from PostgreSQL function  
  totalTracks,       // Accurate count from database
  appliedFilters: query,
  meta: {
    queryTime: Date.now() - startTime,
    cached: false
  }
}
```

### Phase 4: Handle Complex Filtering

**Challenge:** PostgreSQL functions may not support all `LibraryQuery` filters

**Solutions:**
1. **Simple time filters:** Pass directly to PostgreSQL functions
2. **Complex filters (users, sources, search, tags):**
   - Option A: Extend PostgreSQL functions to accept additional parameters
   - Option B: Apply filters in post-processing (if result set is small enough)
   - Option C: Create filter-specific aggregation functions

**Recommended Approach:** 
Start with time-only filtering, then extend PostgreSQL functions as needed for the most common filter combinations.

### Phase 5: Performance Optimization

**Immediate Benefits:**
- Eliminate 1000-row Supabase limit
- Remove client-side processing overhead
- Leverage PostgreSQL's optimized aggregation functions

**Additional Optimizations:**
1. Add result caching for frequently accessed aggregations
2. Consider database indexing for common filter combinations
3. Monitor query performance and optimize as needed

**Caching Strategy:**
- Cache results by query hash for 5-10 minutes
- Invalidate cache on new track additions
- Use in-memory caching or Redis for scalability

## Implementation Steps

### Step 1: Extend DatabaseService
1. Add PostgreSQL function calling methods
2. Test with direct API calls to verify functions work
3. Handle error cases and edge conditions

### Step 2: Update AggregationsAPI Logic  
1. Replace client-side aggregation with database function calls
2. Add time filter conversion logic
3. Maintain response format exactly

### Step 3: Add Total Count Support
1. Create efficient count query that respects filters
2. Ensure accuracy across all query types
3. Optimize for performance

### Step 4: Testing & Validation
1. Test all existing query parameter combinations
2. Verify response format matches exactly
3. Performance test with large datasets
4. Edge case testing (empty results, invalid filters, etc.)

### Step 5: Frontend Verification
1. Ensure existing browse sections continue working
2. Verify no breaking changes in response format
3. Test with real user data if possible

## File Changes Summary

**Modified Files:**
- `/backend/api/database.ts` - Add PostgreSQL function calling methods
- `/backend/api/aggregations.ts` - Replace client-side aggregation logic

**No Changes Required:**
- `/shared/types/library.ts` - Response types remain the same
- Frontend browse sections - No API contract changes
- PostgreSQL functions - Already exist and tested

## Success Criteria

1. **Completeness:** Aggregations reflect entire music library dataset
2. **Performance:** Response times remain reasonable (< 2 seconds)
3. **Compatibility:** Existing API structure and frontend continue working
4. **Accuracy:** Artist counts by unique users, genre counts by frequency
5. **Reliability:** Proper error handling and graceful degradation

## Risk Mitigation

**Potential Issues:**
1. PostgreSQL functions may not handle all filter combinations
2. Response times could increase with very large datasets
3. Different aggregation logic might change displayed statistics

**Mitigation Strategies:**
1. Implement fallback to current logic if PostgreSQL functions fail
2. Add performance monitoring and alerting
3. Test extensively with production data before deployment
4. Gradual rollout with feature flags if possible

## Technical Notes

- Use Supabase `.rpc()` method to call PostgreSQL functions
- Functions return `TABLE(...)` format, map to TypeScript types
- Both functions accept optional `timestamptz` parameter
- Error handling should match existing database service patterns
- Consider connection pooling for high-traffic scenarios

This plan provides a clear path to replace client-side aggregation with server-side PostgreSQL functions while maintaining full API compatibility and improving accuracy for large music libraries.