# Jamzy API Architecture Specification

## Overview

This document defines the API architecture for transitioning Jamzy from mock data to real data. The design follows the **Flexible Monolith Pattern** - a single endpoint with intelligent parameter handling that provides maximum flexibility while maintaining simplicity for solo development.

## Core Philosophy

- **Single Endpoint**: One flexible `/api/library` endpoint handles all data queries
- **Parameter-Driven**: Infinite combinations via query parameters
- **Performance-First**: Server-side filtering and cursor-based pagination
- **Solo-Dev Friendly**: Simple to implement, deploy, and maintain

## API Endpoint

### Base Endpoint
```
GET /api/library
POST /api/library  (for large user sets)
```

### Query Parameters

#### User Filtering
```typescript
users?: string[]        // Individual usernames (small lists)
networks?: string[]     // Tagged user networks (large groups)
```

**Examples:**
```bash
# Individual users
GET /api/library?users=grunge_master_93,vinyl_collector

# User networks (backend-tagged groups)
GET /api/library?networks=my_following,seattle_grunge_scene
```

#### Content Filtering
```typescript
search?: string                    // Text search across track titles, artists
tags?: string[]                   // Music genres/tags (grunge, 90s, indie)
sources?: string[]                // Platforms (youtube, spotify, soundcloud)
minEngagement?: number            // Minimum interaction threshold
```

**Examples:**
```bash
# Content filters
GET /api/library?search=nirvana&tags=grunge,alternative
GET /api/library?sources=spotify&minEngagement=5
```

#### Time Filtering
```typescript
dateRange?: 'all' | 'today' | 'week' | 'month'  // Preset ranges
after?: string                                   // ISO date string
before?: string                                  // ISO date string
```

**Examples:**
```bash
# Time filters
GET /api/library?dateRange=week
GET /api/library?after=2024-01-01&before=2024-12-31
```

#### User Interaction Filtering (Profile Mode)
```typescript
interactionType?: 'all' | 'shared' | 'liked' | 'conversations' | 'recasts'
```

**Examples:**
```bash
# User's interaction history
GET /api/library?users=grunge_master_93&interactionType=shared
```

#### Sorting & Pagination
```typescript
sortBy?: 'timestamp' | 'likes' | 'replies' | 'recasts' | 'artist' | 'title'
sortDirection?: 'asc' | 'desc'
limit?: number          // Default: 50, Max: 250
cursor?: string         // Cursor-based pagination
```

**Examples:**
```bash
# Sorting and pagination
GET /api/library?sortBy=likes&sortDirection=desc&limit=20
GET /api/library?cursor=eyJpZCI6MTIzfQ&limit=50
```

## Response Format

### Successful Response
```typescript
interface LibraryResponse {
  tracks: Track[]
  pagination: {
    hasMore: boolean
    nextCursor?: string
    total?: number        // Optional: only for small result sets
  }
  appliedFilters: LibraryQuery
  meta?: {
    queryTime: number     // Response time in ms
    cached: boolean       // Whether response was cached
  }
}
```

### Track Object
```typescript
interface Track {
  id: string
  title: string
  artist: string
  source: 'youtube' | 'spotify' | 'soundcloud'
  sourceUrl: string
  thumbnailUrl?: string
  duration?: number
  
  // Social context
  user: {
    username: string
    displayName: string
    avatar?: string
  }
  
  // Interaction data
  userInteraction: {
    type: 'shared' | 'liked' | 'conversation' | 'recast'
    timestamp: string     // ISO date
    context?: string      // Optional context/comment
  }
  
  // Social stats
  socialStats: {
    likes: number
    replies: number
    recasts: number
  }
  
  // Metadata
  tags?: string[]         // Genres, moods, etc.
  createdAt: string      // ISO date
}
```

## Complex Query Examples

### Real-World Use Cases

```bash
# User's recent grunge discoveries
GET /api/library?users=grunge_master_93&tags=grunge&dateRange=week&sortBy=timestamp

# Popular tracks from music community
GET /api/library?networks=music_community&minEngagement=10&sortBy=likes&limit=20

# Search within specific network and time range
GET /api/library?networks=seattle_scene&search=pearl%20jam&after=2024-06-01

# Complex filtering with multiple networks
GET /api/library?networks=indie_collectors,vinyl_enthusiasts&sources=spotify&tags=90s,alternative&limit=50

# User interaction history (profile view)
GET /api/library?users=vinyl_collector&interactionType=shared&sortBy=timestamp&sortDirection=desc
```

### POST Method for Large User Sets

When user lists exceed URL length limits:

```bash
POST /api/library
Content-Type: application/json

{
  "users": ["user1", "user2", ..., "user100"],
  "tags": ["grunge", "90s"],
  "sortBy": "timestamp",
  "limit": 50
}
```

## Implementation Strategy

### Phase 1: Core Implementation (Minimum Viable API)
- Single endpoint with basic parameter parsing
- Direct Supabase queries (no caching)
- Support for existing UI filters: search, platform, dateRange, minEngagement
- Cursor-based pagination

### Phase 2: Performance Optimization
- Intelligent caching strategy with different TTLs
- Database query optimization and indexing
- Response compression and CDN integration

### Phase 3: Advanced Features
- Real-time subscriptions for live updates
- Advanced aggregations (trending tracks, personalized recommendations)
- Analytics and usage metrics
- Rate limiting and API authentication

## Caching Strategy

### Cache Keys
```typescript
const cacheKey = `library:${hashQuery(normalizedQuery)}`
```

### Cache TTL Strategy
- **User-specific queries**: 5 minutes (frequent updates)
- **Network queries**: 15 minutes (moderate updates)
- **General/popular queries**: 1 hour (less frequent updates)
- **Search results**: 30 minutes (balance freshness/performance)

### Cache Invalidation
- User posts new track → invalidate user-specific caches
- Network membership changes → invalidate network caches
- Manual cache busting via admin interface

## Error Handling

### Standard HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

### Error Response Format
```typescript
interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}
```

## Migration Strategy

### Transition from Mock Data
1. **Parallel Development**: Build API alongside existing mock service
2. **Feature Flags**: Toggle between mock and real API per environment
3. **Gradual Rollout**: Start with read-only operations
4. **Data Validation**: Compare mock vs real data responses
5. **Full Cutover**: Remove mock service after validation

### Backward Compatibility
- Maintain existing `LibraryFilters` interface
- Ensure response format matches current expectations
- Preserve existing component interaction patterns

## Future Considerations

### GraphQL Migration Path
If flexibility requirements exceed single endpoint capabilities:
- Consider GraphQL with Supabase PostgREST
- Maintain REST endpoint for simple queries
- Hybrid approach for different client needs

### Real-time Features
- WebSocket connections for live updates
- Server-sent events for notifications
- Optimistic UI updates with conflict resolution

### Analytics Integration
- Query performance monitoring
- Popular filter combination tracking
- Usage pattern analysis for optimization

---

*This specification serves as the blueprint for implementing Jamzy's API architecture. Implementation details will be refined during development while maintaining the core architectural principles outlined above.*