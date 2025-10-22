# Jamzy Analytics API

High-performance analytics API for the Jamzy music discovery platform, built with Bun and Hono.

## Quick Start

### Installation

```bash
bun install
```

### Development

```bash
bun run dev
```

### Production

```bash
bun start
```

This project was created using `bun init` in bun v1.2.18. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## API Endpoints

All endpoints return JSON responses and support CORS for frontend integration.

### Health Check

**GET** `/health`

Returns API health status.

```json
{
  "status": "healthy",
  "service": "jamzy-analytics-api", 
  "timestamp": "2025-07-14T18:30:00.000Z"
}
```

---

### User Analytics

**GET** `/api/v1/analytics/users/{id}/profile`

Get comprehensive user music profile with library statistics and taste breakdown.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `id` | string | required | User node ID (FID) |
| `includeLibrary` | boolean | `true` | Include paginated music library |
| `limit` | number | `20` | Items per page for library |
| `offset` | number | `0` | Pagination offset |
| `interactionType` | string | `'all'` | Filter by interaction: `'all'`, `'shared'`, `'liked'` |

#### Response

```json
{
  "user": {
    "id": "850275",
    "name": "Saint"
  },
  "stats": {
    "total_songs": 1247,
    "songs_shared": 847,
    "songs_liked": 523,
    "platforms_count": 4,
    "artists_count": 445,
    "genres_count": 18
  },
  "breakdown": {
    "platforms": {
      "spotify": 508,
      "youtube": 254,
      "apple_music": 85
    },
    "top_artists": [
      { "artist": "Kendrick Lamar", "count": 12 },
      { "artist": "Daft Punk", "count": 8 }
    ],
    "top_genres": [
      { "genre": "Hip-Hop", "count": 234 },
      { "genre": "Electronic", "count": 187 }
    ]
  },
  "library": {
    "items": [
      {
        "title": "Good Kid",
        "artist": "Kendrick Lamar",
        "album": "good kid, m.A.A.d city",
        "platform": "spotify",
        "interaction": "shared"
      }
    ],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total": 1247,
      "has_more": true
    }
  }
}
```

---

### Artist Analytics

**GET** `/api/v1/analytics/artists/{name}`

Get comprehensive artist analytics including fan community, weighted activity scoring, and complete song library.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | string | required | Artist name (URL encoded) |
| `timeRange` | string | `'all'` | Time filter: `'7d'`, `'30d'`, `'90d'`, `'1y'`, `'all'` |
| `limit` | number | `20` | Items per page for fans and library |
| `offset` | number | `0` | Pagination offset |
| `interactionType` | string | `'all'` | Filter by interaction: `'all'`, `'shared'`, `'liked'` |
| `includeLibrary` | boolean | `true` | Include artist's song library |

#### Weighted Fan Scoring

- **Shared song** = 10 points
- **Recasted song** = 3 points  
- **Replied to song** = 2 points
- **Liked song** = 1 point

#### Response

```json
{
  "stats": {
    "community_reach": {
      "total_users": 47,
      "shared_by": 12,
      "liked_by": 35
    },
    "platform_distribution": {
      "spotify": 23,
      "youtube": 15,
      "apple_music": 9
    }
  },
  "fans": {
    "top_fans": [
      {
        "user": "Saint",
        "fan_score": 32,
        "total_activity": 5,
        "shares": 3,
        "likes": 2,
        "recasts": 0,
        "replies": 0,
        "rank": 1
      }
    ],
    "total_fans": 47,
    "has_more": true,
    "current_limit": 20,
    "current_offset": 0
  },
  "library": {
    "songs": [
      {
        "song_title": "Good Kid",
        "album": "good kid, m.A.A.d city",
        "cast_id": "0xabc123",
        "embed_index": 0,
        "shared_by": "Saint",
        "shared_at": "2025-01-15T10:30:00Z",
        "platform": "spotify",
        "engagement": {
          "likes": 5,
          "recasts": 2,
          "replies": 1
        }
      }
    ],
    "total_count": 47,
    "has_more": true,
    "current_limit": 20,
    "current_offset": 0,
    "sort_options": ["by_engagement", "by_date", "by_platform"]
  }
}
```

---

### Community Analytics

**GET** `/api/v1/analytics/community/overview`

Get overall platform community analytics with trending content and engagement metrics.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `timeRange` | string | `'30d'` | Time filter: `'1d'`, `'7d'`, `'30d'`, `'90d'`, `'all'` |

#### Response

```json
{
  "community": {
    "time_range": "30d",
    "total_active_users": 1247,
    "total_songs_shared": 8934,
    "total_interactions": 15672,
    "unique_sharers": 892
  },
  "engagement": {
    "interactions_per_user": 12.56,
    "sharing_rate": 71.5
  },
  "platforms": {
    "distribution": {
      "spotify": 3401,
      "youtube": 2847,
      "apple_music": 1689,
      "soundcloud": 897
    },
    "total_platforms": 4
  },
  "trends": {
    "top_genres": [
      {
        "genre": "Hip-Hop",
        "unique_sharers": 89,
        "unique_likers": 156,
        "unique_recasters": 34,
        "unique_repliers": 12,
        "engagement_score": 1247
      }
    ],
    "top_artists": [
      {
        "artist": "Kendrick Lamar",
        "unique_sharers": 47,
        "unique_likers": 89,
        "unique_recasters": 23,
        "unique_repliers": 8,
        "engagement_score": 892
      }
    ],
    "top_songs": [
      {
        "song": "Good Kid by Kendrick Lamar",
        "unique_sharers": 23,
        "unique_likers": 67,
        "unique_recasters": 12,
        "unique_repliers": 4,
        "engagement_score": 445
      }
    ]
  }
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `404` - Resource not found (e.g., user or artist)
- `500` - Internal server error

Error responses include descriptive messages:

```json
{
  "error": "User not found"
}
```

## Development Notes

### Architecture

- **Runtime**: Bun (fast JavaScript runtime)
- **Framework**: Hono (lightweight web framework) 
- **Database**: Supabase PostgreSQL
- **CORS**: Enabled for frontend integration

### Scripts

```json
{
  "dev": "bun --hot src/main.ts",
  "start": "bun src/main.ts"
}
```

### Environment Variables

- `PORT` - Server port (default: 3001)
- Supabase credentials configured in `src/lib/db.ts`

### Performance Features

- Efficient SQL queries with proper indexing
- Weighted scoring algorithms for fan rankings
- Pagination support for large datasets
- Platform distribution analytics with caching potential

## Examples

### Get User Profile

```bash
curl "http://localhost:3001/api/v1/analytics/users/850275/profile?includeLibrary=true&limit=10"
```

### Get Artist Fans

```bash
curl "http://localhost:3001/api/v1/analytics/artists/Kendrick%20Lamar?timeRange=30d&limit=20"
```

### Get Community Overview

```bash
curl "http://localhost:3001/api/v1/analytics/community/overview?timeRange=7d"
```

### Filter by Interaction Type

```bash
curl "http://localhost:3001/api/v1/analytics/artists/Daft%20Punk?interactionType=liked&limit=10"
```