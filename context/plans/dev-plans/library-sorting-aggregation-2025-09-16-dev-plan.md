# Library Sorting and Aggregation API - Development Plan
**Task:** TASK-509 - Update library sorting and aggregation API  
**Date:** 2025-09-16  
**Zen Principle:** The Middle Way - Balance efficiency with simplicity

## Problem Statement

The current library system operates on paginated data (~30-50 tracks) instead of the full library (~1000+ tracks), causing:

1. **Inaccurate browse statistics**: Artists/Genres sections show counts from limited dataset
2. **Limited sorting functionality**: Column sorting only operates on current page instead of global library

## Root Cause Analysis

Both issues stem from frontend-side data processing on `filteredTracks()` which contains only the current paginated results. The `extractArtistsFromTracks()` and `extractGenresFromTracks()` functions, plus the sorting logic in `sortedTracks()`, all operate on this limited dataset.

## Technical Architecture Overview

### Current Flow (Problematic)
```
Frontend → LibraryApiService → /api/library → Paginated Tracks
└─ Browse Sections Process Limited Data → Incorrect Counts
└─ Sorting Processes Limited Data → Limited Results
```

### Proposed Flow (Solution)
```
Frontend → Multiple Specialized Endpoints
├─ /api/library → Paginated Tracks (unchanged)
├─ /api/library/aggregations → Full Library Stats
└─ /api/library/sorted → Globally Sorted Tracks
```

## API Design - The Zen Approach

Following the principle of **single responsibility**, we'll create specialized endpoints rather than overloading the existing one.

### 1. New Aggregations Endpoint
```typescript
GET /api/library/aggregations
POST /api/library/aggregations (with filters)

Response: {
  artists: ArtistData[]     // { name: string, count: number }
  genres: GenreData[]       // { name: string, count: number }
  totalTracks: number
  appliedFilters: LibraryQuery
  meta: {
    queryTime: number
    cached: boolean
  }
}
```

### 2. Enhanced Library Endpoint with Global Sorting
```typescript
POST /api/library

// Extended LibraryQuery to support global sorting
interface LibraryQuery {
  // ... existing fields
  globalSort?: boolean      // NEW: Enable global sorting
  returnFullDataset?: boolean // NEW: For aggregations
}

// When globalSort=true, applies sorting to entire dataset before pagination
```

### 3. Shared Types Enhancement
```typescript
// Add to existing types
interface ArtistData {
  name: string
  count: number
}

interface GenreData {
  name: string
  count: number
}

interface LibraryAggregations {
  artists: ArtistData[]
  genres: GenreData[]
  totalTracks: number
  appliedFilters: LibraryQuery
  meta?: ResponseMeta
}
```

## Implementation Steps

### Phase 1: Backend API Extension (Critical Path)

#### Step 1.1: Extend Shared Types
**File:** `shared/types/library.ts`
```typescript
// Add new interfaces
export interface ArtistData {
  name: string
  count: number
}

export interface GenreData {
  name: string
  count: number
}

export interface LibraryAggregations {
  artists: ArtistData[]
  genres: GenreData[]
  totalTracks: number
  appliedFilters: LibraryQuery
  meta?: {
    queryTime: number
    cached: boolean
  }
}

// Extend existing LibraryQuery
export interface LibraryQuery {
  // ... existing fields
  globalSort?: boolean
  returnFullDataset?: boolean
}
```

#### Step 1.2: Create Aggregations Endpoint
**File:** `api/aggregations.ts` (new)
```typescript
import type { LibraryQuery, LibraryAggregations } from '../shared/types/library'

export default class AggregationsHandler {
  async handle(request: Request): Promise<Response> {
    const query = await this.parseQuery(request)
    const aggregations = await this.generateAggregations(query)
    return Response.json(aggregations)
  }

  private async generateAggregations(query: LibraryQuery): Promise<LibraryAggregations> {
    // Query full dataset with filters but no pagination
    const allTracks = await database.queryLibrary({
      ...query,
      limit: undefined,
      cursor: undefined,
      returnFullDataset: true
    })

    // Generate aggregations
    const artists = this.extractArtistsFromTracks(allTracks.tracks)
    const genres = this.extractGenresFromTracks(allTracks.tracks)

    return {
      artists,
      genres,
      totalTracks: allTracks.tracks.length,
      appliedFilters: query,
      meta: {
        queryTime: Date.now() - startTime,
        cached: false
      }
    }
  }
}
```

#### Step 1.3: Enhance Library Endpoint
**File:** `api/library.ts`
```typescript
// Modify existing executeQuery to handle global sorting
private async executeQuery(query: LibraryQuery): Promise<Response> {
  const startTime = Date.now()
  
  let dbQuery = query
  let tracks: Track[]
  
  if (query.globalSort) {
    // Get full dataset, sort, then paginate
    const fullResult = await this.database.queryLibrary({
      ...query,
      limit: undefined,
      cursor: undefined
    })
    
    // Apply sorting to full dataset
    const sortedTracks = this.applySorting(fullResult.tracks, query)
    
    // Apply pagination to sorted results
    const { paginatedTracks, hasMore, nextCursor } = this.applyPagination(
      sortedTracks, 
      query.limit || 50, 
      query.cursor
    )
    
    tracks = paginatedTracks
  } else {
    // Existing behavior - paginate then sort (limited)
    const result = await this.database.queryLibrary(query)
    tracks = result.tracks
  }

  const response: LibraryResponse = {
    tracks,
    pagination: {
      hasMore,
      nextCursor,
      total: query.globalSort ? sortedTracks.length : undefined
    },
    appliedFilters: query
  }

  return Response.json(response)
}
```

### Phase 2: Frontend Service Layer Enhancement

#### Step 2.1: Extend LibraryApiService
**File:** `src/services/libraryApiService.ts`
```typescript
// Add new method for aggregations
async getLibraryAggregations(filters: LibraryFilters): Promise<LibraryAggregations> {
  const query = this.convertFiltersToQuery(filters)
  
  try {
    const response = await fetch(`${this.baseUrl}/library/aggregations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    })

    if (!response.ok) {
      throw new Error(`Aggregations API request failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Library aggregations error:', error)
    throw error
  }
}

// Modify existing method to support global sorting
async getFilteredTracks(
  filters: LibraryFilters, 
  options: { globalSort?: boolean } = {}
): Promise<{
  tracks: FrontendTrack[]
  pagination: LibraryResponse['pagination']
  meta: LibraryResponse['meta']
}> {
  const query = {
    ...this.convertFiltersToQuery(filters),
    globalSort: options.globalSort
  }
  
  const response = await this.queryLibrary(query)
  return {
    tracks: response.tracks,
    pagination: response.pagination,
    meta: response.meta
  }
}
```

### Phase 3: Frontend Store Enhancement

#### Step 3.1: Create Aggregations Store
**File:** `src/stores/libraryAggregationsStore.ts` (new)
```typescript
import { createSignal, createMemo } from 'solid-js'
import type { LibraryAggregations, ArtistData, GenreData } from '../../shared/types/library'
import { libraryApiService } from '../services/libraryApiService'
import { filters } from './libraryStore'

// State signals
const [aggregations, setAggregations] = createSignal<LibraryAggregations | null>(null)
const [isLoadingAggregations, setIsLoadingAggregations] = createSignal(false)
const [aggregationsError, setAggregationsError] = createSignal<string>('')

// Computed values
const artistsData = createMemo(() => aggregations()?.artists || [])
const genresData = createMemo(() => aggregations()?.genres || [])
const totalLibraryTracks = createMemo(() => aggregations()?.totalTracks || 0)

// Actions
const loadAggregations = async (forceRefresh = false) => {
  if (isLoadingAggregations()) return
  if (aggregations() && !forceRefresh) return

  setIsLoadingAggregations(true)
  setAggregationsError('')

  try {
    const data = await libraryApiService.getLibraryAggregations(filters)
    setAggregations(data)
  } catch (error) {
    console.error('Failed to load aggregations:', error)
    setAggregationsError('Failed to load library statistics')
  } finally {
    setIsLoadingAggregations(false)
  }
}

export {
  // State
  aggregations,
  isLoadingAggregations,
  aggregationsError,
  
  // Computed
  artistsData,
  genresData,
  totalLibraryTracks,
  
  // Actions
  loadAggregations
}
```

#### Step 3.2: Enhance Library Store
**File:** `src/stores/libraryStore.ts`
```typescript
// Add global sorting support
const [globalSortEnabled, setGlobalSortEnabled] = createSignal(false)

// Modify existing functions
const updateSort = (column: SortColumn, direction: SortDirection) => {
  setSortState({ column, direction })
  
  if (globalSortEnabled()) {
    // Trigger API call with global sorting
    loadFilteredTracksWithGlobalSort()
  }
}

const loadFilteredTracksWithGlobalSort = async () => {
  setIsLoading(true)
  try {
    const response = await libraryApiService.getFilteredTracks(filters, { 
      globalSort: true 
    })
    
    // Update tracks with globally sorted results
    setAllTracks(response.tracks)
  } catch (error) {
    console.error('Failed to load globally sorted tracks:', error)
  } finally {
    setIsLoading(false)
  }
}

// Export new functions
export {
  // ... existing exports
  globalSortEnabled,
  setGlobalSortEnabled,
  loadFilteredTracksWithGlobalSort
}
```

### Phase 4: Frontend Component Updates

#### Step 4.1: Update Browse Sections Container
**File:** `src/components/library/BrowseSections/BrowseSectionsContainer.tsx`
```typescript
import { artistsData, genresData, loadAggregations, isLoadingAggregations } from '../../../stores/libraryAggregationsStore'

const BrowseSectionsContainer: Component<BrowseSectionsContainerProps> = (props) => {
  // Load aggregations on mount and when filters change
  createEffect(() => {
    loadAggregations()
  })

  // Use store data instead of extracting from limited tracks
  return (
    <Show when={props.showBrowseSections !== false}>
      <div class="browse-sections-container">
        <ArtistBrowseSection
          artists={artistsData()}
          selectedArtist={props.filters.selectedArtist}
          onArtistSelect={props.onFiltersChange}
          isLoading={isLoadingAggregations()}
        />
        
        <GenreBrowseSection
          genres={genresData()}
          selectedGenre={props.filters.selectedGenre}
          onGenreSelect={props.onFiltersChange}
          isLoading={isLoadingAggregations()}
        />
      </div>
    </Show>
  )
}
```

#### Step 4.2: Update Library Table Headers
**File:** `src/components/library/LibraryTable/LibraryTableHeader.tsx`
```typescript
// Add global sort toggle in table header
const LibraryTableHeader: Component<Props> = (props) => {
  return (
    <thead>
      <tr>
        <th>
          <div class="sort-options">
            <label class="global-sort-toggle">
              <input 
                type="checkbox" 
                checked={globalSortEnabled()}
                onChange={(e) => setGlobalSortEnabled(e.target.checked)}
              />
              Global Sort
            </label>
          </div>
        </th>
        {/* ... existing column headers */}
      </tr>
    </thead>
  )
}
```

## Data Flow & Performance Optimization

### Caching Strategy
1. **Aggregations**: Cache for 5 minutes with filter-based keys
2. **Global Sort**: Cache sorted results for common sort patterns
3. **Incremental Updates**: Invalidate cache when new tracks are added

### Loading States
- **Browse Sections**: Show skeleton loaders while aggregations load
- **Table Sorting**: Show loading indicator during global sort operations
- **Progressive Enhancement**: Fall back to client-side sorting if API fails

### Error Handling
- **Graceful Degradation**: If aggregations fail, fall back to client-side extraction
- **Retry Logic**: Automatic retry for transient network failures
- **User Feedback**: Clear error messages with actionable next steps

## Migration Strategy

### Phase 1: Backend (1-2 days)
1. Deploy new aggregations endpoint alongside existing API
2. Test with existing filters and edge cases
3. Add monitoring and performance metrics

### Phase 2: Frontend (2-3 days)
1. Create new stores and update services
2. Update browse sections to use aggregations API
3. Add global sorting controls with feature flag

### Phase 3: Integration & Testing (1 day)
1. End-to-end testing of new flows
2. Performance validation with large datasets
3. Rollback plan if performance degrades

### Phase 4: Cleanup (0.5 day)
1. Remove old client-side aggregation functions
2. Update documentation
3. Monitor metrics for 24 hours

## Success Metrics

- **Accuracy**: Browse sections show correct counts from full library
- **Performance**: Global sorting completes within 2 seconds for 1000+ tracks
- **UX**: No breaking changes to existing filter/pagination behavior
- **Reliability**: <1% error rate for new endpoints

## Potential Challenges & Solutions

### Challenge 1: Performance with Large Datasets
**Solution**: Implement database indexing on commonly sorted columns and add query optimization

### Challenge 2: Cache Invalidation Complexity
**Solution**: Use simple time-based expiration initially, optimize later if needed

### Challenge 3: Client-Server State Synchronization
**Solution**: Use consistent filter serialization and clear loading states

## Testing Strategy

### Unit Tests
- Aggregation calculation accuracy
- Sorting algorithm correctness
- Filter conversion logic

### Integration Tests
- End-to-end API flows
- Error handling scenarios
- Cache behavior validation

### Performance Tests
- Large dataset sorting (1000+ tracks)
- Concurrent user aggregation requests
- Memory usage monitoring

## Rollback Plan

If issues arise:
1. **Immediate**: Feature flag to disable global sorting
2. **Short-term**: Revert browse sections to client-side aggregation
3. **Long-term**: Remove new endpoints if fundamental issues found

---

## Philosophy Notes

This plan embodies **Wu Wei** (effortless action) by:
- **Working with existing patterns** rather than wholesale rewrites
- **Adding capabilities incrementally** instead of changing everything at once
- **Providing fallback paths** so the system remains robust
- **Optimizing for maintainability** over premature optimization

The approach follows **beginner's mind** by questioning the assumption that all processing must happen on the frontend, while respecting the existing architecture's strengths.

**Remember**: The goal is not just to fix the immediate problem, but to create a foundation that flows naturally with future growth. Like water finding its path, this solution should feel inevitable once implemented.