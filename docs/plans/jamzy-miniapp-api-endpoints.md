# Jamzy Miniapp API Endpoints

**Date:** 2025-10-03
**Related Task:** TASK-600

---

## Overview

This document outlines the REST API endpoints for the Jamzy miniapp. All endpoints use cursor-based pagination and return JSON responses.

**Key Decisions:**
- Single backend API serves both mini-app and web app
- Domain-organized files (threads, music, users) instead of app-specific APIs
- Music extraction is async and runs in-process (fire-and-forget, no job queue for MVP)
- Cursor-based pagination throughout
- Threads don't require music (trackUrls is optional)
- No auth endpoints (handled by miniapp framework)
- No WebSockets (polling for updates)

---

## Backend Architecture

The mini-app API is part of a shared `/backend` monorepo that serves both the mini-app and web app:

```
/backend/
  /api/
    database.ts         # Supabase client (shared by all APIs)
    threads.ts          # Thread CRUD + replies
    interactions.ts     # Likes, recasts
    music.ts            # Music trending, track lookups
    users.ts            # User activity feeds
    library.ts          # Web app music library (existing)
    aggregations.ts     # Web app stats (existing)

  /lib/
    neynar.ts           # Neynar API client wrapper
    music-extraction.ts # Claude API for music metadata extraction

  server.ts             # Hono server (single deployment)
```

**Architecture Principles:**
- **Domain-based organization**: Files organized by domain (threads, music) not by app (mini-app, web)
- **Code reuse**: Both apps use the same domain APIs where functionality overlaps
- **Single deployment**: One API service, easier to maintain and scale
- **Shared types**: `/shared/types` used across frontend and backend
- **Simple async**: Music extraction runs fire-and-forget in-process (can add job queue later)

---

## API Endpoints Quick Reference

### Threads
- `POST /api/threads` - Create a new thread
- `GET /api/threads/:castHash` - Get a specific thread with all replies
- `GET /api/threads` - Get feed of threads
- `POST /api/threads/:castHash/reply` - Reply to a thread

### Interactions
- `POST /api/threads/:castHash/like` - Like a thread or reply
- `DELETE /api/threads/:castHash/like` - Unlike a thread or reply
- `POST /api/threads/:castHash/recast` - Recast/share a thread

### Users
- `GET /api/users/:fid/threads` - Get user's threads
- `GET /api/users/:fid/activity` - Get user's activity (threads, replies, likes, recasts)

### Music
- `GET /api/music/trending` - Get trending tracks
- `GET /api/music/:musicId/casts` - Get all casts that shared a specific track

### Global
- `GET /api/activity` - Get global activity feed
- `GET /api/search` - Search threads, music, and users

---

## Core Thread Operations

### `POST /api/threads`
**Create a new thread**

**Request Body:**
```json
{
  "text": "Check out this track!",
  "trackUrls": ["https://open.spotify.com/track/..."], // optional
  "userId": "12345"
}
```

**Process:**
1. Create cast via Neynar API (user's auth)
2. Store in `cast_nodes`
3. Create `interaction_edges` (AUTHORED)
4. If trackUrls present: Queue async job to extract music metadata

**Response:**
```json
{
  "castHash": "0x123...",
  "text": "Check out this track!",
  "author": {
    "fid": "12345",
    "username": "musiclover",
    "displayName": "Music Lover",
    "pfpUrl": "https://..."
  },
  "timestamp": "2025-10-03T12:00:00Z",
  "stats": {
    "likes": 0,
    "replies": 0,
    "recasts": 0
  },
  "musicProcessing": true // if trackUrls were provided
}
```

---

### `GET /api/threads/:castHash`
**Get a specific thread with all replies**

**Query Params:** None

**Process:**
1. Fetch thread from DB (`cast_nodes` + music info)
2. Fetch current replies from Neynar API
3. Compare with DB to find NEW replies
4. Queue async job to process new replies (extract music if present)
5. Return thread + all replies + music data

**Response:**
```json
{
  "cast": {
    "castHash": "0x123...",
    "text": "Check out this track!",
    "author": {
      "fid": "12345",
      "username": "alice",
      "displayName": "Alice",
      "pfpUrl": "https://..."
    },
    "timestamp": "2025-10-03T12:00:00Z",
    "music": [
      {
        "id": "uuid",
        "title": "Track Name",
        "artist": "Artist Name",
        "platform": "spotify",
        "platformId": "...",
        "url": "https://open.spotify.com/track/...",
        "thumbnail": "https://..."
      }
    ],
    "stats": {
      "replies": 5,
      "likes": 10,
      "recasts": 2
    }
  },
  "replies": [
    {
      "castHash": "0x456...",
      "text": "Great track!",
      "author": {
        "fid": "67890",
        "username": "bob",
        "displayName": "Bob",
        "pfpUrl": "https://..."
      },
      "timestamp": "2025-10-03T12:30:00Z",
      "music": [],
      "stats": {
        "replies": 0,
        "likes": 3,
        "recasts": 0
      }
    }
  ]
}
```

---

### `GET /api/threads`
**Get feed of threads**

**Query Params:**
- `limit` (default: 50, max: 100)
- `cursor` (pagination cursor)

**Process:**
1. Fetch threads from DB (where `parent_cast_hash IS NULL`)
2. Include music metadata for each thread
3. Include basic stats (reply count, like count, recast count)

**Response:**
```json
{
  "threads": [
    {
      "castHash": "0x123...",
      "text": "Check out this track!",
      "author": {
        "fid": "12345",
        "username": "alice",
        "displayName": "Alice",
        "pfpUrl": "https://..."
      },
      "timestamp": "2025-10-03T12:00:00Z",
      "music": [
        {
          "id": "uuid",
          "title": "Track Name",
          "artist": "Artist Name",
          "platform": "spotify",
          "platformId": "...",
          "url": "https://open.spotify.com/track/...",
          "thumbnail": "https://..."
        }
      ],
      "stats": {
        "replies": 5,
        "likes": 10,
        "recasts": 2
      }
    }
  ],
  "nextCursor": "cursor_string"
}
```

---

## Interaction Operations

### `POST /api/threads/:castHash/reply`
**Reply to a thread**

**Request Body:**
```json
{
  "text": "Love this track!",
  "trackUrls": ["https://..."], // optional
  "userId": "67890"
}
```

**Process:**
1. Create reply cast via Neynar API
2. Store in `cast_nodes` with `parent_cast_hash` and `root_parent_hash`
3. Create `interaction_edges` (REPLIED from cast to parent, AUTHORED from user to cast)
4. If trackUrls present: Queue async job for music extraction

**Response:**
```json
{
  "castHash": "0x456...",
  "text": "Love this track!",
  "parentCastHash": "0x123...",
  "author": {
    "fid": "67890",
    "username": "bob",
    "displayName": "Bob",
    "pfpUrl": "https://..."
  },
  "timestamp": "2025-10-03T12:30:00Z",
  "music": [
    {
      "id": "uuid",
      "title": "Track Name",
      "artist": "Artist Name",
      "platform": "youtube",
      "platformId": "...",
      "url": "https://youtube.com/watch?v=...",
      "thumbnail": "https://..."
    }
  ],
  "stats": {
    "replies": 0,
    "likes": 0,
    "recasts": 0
  },
  "musicProcessing": true
}
```

---

### `POST /api/threads/:castHash/like`
**Like a thread or reply**

**Request Body:**
```json
{
  "userId": "67890"
}
```

**Process:**
1. Create like via Neynar API
2. Store in `interaction_edges` (LIKED)

**Response:**
```json
{
  "success": true
}
```

---

### `DELETE /api/threads/:castHash/like`
**Unlike a thread or reply**

**Request Body:**
```json
{
  "userId": "67890"
}
```

**Process:**
1. Remove like via Neynar API
2. Delete from `interaction_edges`

**Response:**
```json
{
  "success": true
}
```

---

### `POST /api/threads/:castHash/recast`
**Recast/share a thread**

**Request Body:**
```json
{
  "userId": "67890"
}
```

**Process:**
1. Create recast via Neynar API
2. Store in `interaction_edges` (RECASTED)

**Response:**
```json
{
  "success": true
}
```

---

## User Operations

### `GET /api/users/:fid/threads`
**Get user's threads**

**Query Params:**
- `limit` (default: 50, max: 100)
- `cursor` (pagination cursor)

**Process:**
1. Fetch threads where `author_fid = :fid` and `parent_cast_hash IS NULL`
2. Include music metadata and stats

**Response:**
```json
{
  "threads": [
    {
      "castHash": "0x123...",
      "text": "Check out this track!",
      "author": {
        "fid": "12345",
        "username": "alice",
        "displayName": "Alice",
        "pfpUrl": "https://..."
      },
      "timestamp": "2025-10-03T12:00:00Z",
      "music": [
        {
          "id": "uuid",
          "title": "Track Name",
          "artist": "Artist Name",
          "platform": "spotify",
          "platformId": "...",
          "url": "https://open.spotify.com/track/...",
          "thumbnail": "https://..."
        }
      ],
      "stats": {
        "replies": 5,
        "likes": 10,
        "recasts": 2
      }
    }
  ],
  "nextCursor": "cursor_string"
}
```

---

### `GET /api/users/:fid/activity`
**Get user's activity (threads, replies, likes, recasts)**

**Query Params:**
- `limit` (default: 50, max: 100)
- `cursor` (pagination cursor)

**Process:**
1. Fetch from `interaction_edges` where `source_id = :fid`
2. Join with `cast_nodes` and `user_nodes`
3. Order by `created_at` DESC

**Response:**
```json
{
  "activity": [
    {
      "type": "AUTHORED",
      "cast": {
        "castHash": "0x123...",
        "text": "Check out this track!",
        "author": {
          "fid": "12345",
          "username": "alice",
          "displayName": "Alice",
          "pfpUrl": "https://..."
        },
        "timestamp": "2025-10-03T12:00:00Z",
        "music": [
          {
            "id": "uuid",
            "title": "Track Name",
            "artist": "Artist Name",
            "platform": "spotify",
            "platformId": "...",
            "url": "https://open.spotify.com/track/...",
            "thumbnail": "https://..."
          }
        ],
        "stats": {
          "replies": 5,
          "likes": 10,
          "recasts": 2
        }
      },
      "timestamp": "2025-10-03T12:00:00Z"
    },
    {
      "type": "LIKED",
      "cast": {
        "castHash": "0x456...",
        "text": "Great music!",
        "author": {
          "fid": "67890",
          "username": "bob",
          "displayName": "Bob",
          "pfpUrl": "https://..."
        },
        "timestamp": "2025-10-03T11:00:00Z",
        "music": [],
        "stats": {
          "replies": 2,
          "likes": 8,
          "recasts": 1
        }
      },
      "timestamp": "2025-10-03T11:30:00Z"
    }
  ],
  "nextCursor": "cursor_string"
}
```

---

## Music Operations

### `GET /api/music/trending`
**Get trending tracks**

**Query Params:**
- `timeframe` (7d, 30d, 90d - default: 7d)
- `limit` (default: 50, max: 100)

**Process:**
1. Query `cast_music_edges` within timeframe
2. Group by `music_id` and count
3. Join with `music_library`
4. Order by share count DESC

**Response:**
```json
{
  "tracks": [
    {
      "id": "uuid",
      "title": "Track Name",
      "artist": "Artist Name",
      "platform": "spotify",
      "platformId": "...",
      "url": "https://open.spotify.com/track/...",
      "thumbnail": "https://...",
      "shareCount": 42,
      "recentCasts": [
        {
          "castHash": "0x123...",
          "text": "Love this track!",
          "author": {
            "fid": "12345",
            "username": "alice",
            "displayName": "Alice",
            "pfpUrl": "https://..."
          },
          "timestamp": "2025-10-03T12:00:00Z"
        }
      ]
    }
  ]
}
```

---

### `GET /api/music/:musicId/casts`
**Get all casts that shared a specific track**

**Query Params:**
- `limit` (default: 50, max: 100)
- `cursor` (pagination cursor)

**Process:**
1. Join `cast_music_edges` → `cast_nodes` → `user_nodes`
2. Filter by `music_id = :musicId`
3. Order by `created_at` DESC

**Response:**
```json
{
  "music": {
    "id": "uuid",
    "title": "Track Name",
    "artist": "Artist Name",
    "platform": "spotify",
    "platformId": "...",
    "url": "https://open.spotify.com/track/...",
    "thumbnail": "https://..."
  },
  "casts": [
    {
      "castHash": "0x123...",
      "text": "Check out this track!",
      "author": {
        "fid": "12345",
        "username": "alice",
        "displayName": "Alice",
        "pfpUrl": "https://..."
      },
      "timestamp": "2025-10-03T12:00:00Z",
      "stats": {
        "replies": 5,
        "likes": 10,
        "recasts": 2
      }
    }
  ],
  "nextCursor": "cursor_string"
}
```

---

## Global Operations

### `GET /api/activity`
**Get global activity feed (MVP)**

**Query Params:**
- `limit` (default: 50, max: 100)
- `cursor` (pagination cursor)

**Process:**
1. Fetch all activity from `interaction_edges`
2. Join with `cast_nodes` and `user_nodes`
3. Order by `created_at` DESC

**Response:**
```json
{
  "activity": [
    {
      "type": "AUTHORED",
      "user": {
        "fid": "12345",
        "username": "alice",
        "displayName": "Alice",
        "pfpUrl": "https://..."
      },
      "cast": {
        "castHash": "0x123...",
        "text": "Check out this track!",
        "timestamp": "2025-10-03T12:00:00Z",
        "music": [
          {
            "id": "uuid",
            "title": "Track Name",
            "artist": "Artist Name",
            "platform": "spotify",
            "platformId": "...",
            "url": "https://open.spotify.com/track/...",
            "thumbnail": "https://..."
          }
        ],
        "stats": {
          "replies": 5,
          "likes": 10,
          "recasts": 2
        }
      },
      "timestamp": "2025-10-03T12:00:00Z"
    },
    {
      "type": "LIKED",
      "user": {
        "fid": "67890",
        "username": "bob",
        "displayName": "Bob",
        "pfpUrl": "https://..."
      },
      "cast": {
        "castHash": "0x456...",
        "text": "Great music!",
        "timestamp": "2025-10-03T11:30:00Z",
        "music": [],
        "stats": {
          "replies": 2,
          "likes": 8,
          "recasts": 1
        }
      },
      "timestamp": "2025-10-03T11:55:00Z"
    },
    {
      "type": "RECASTED",
      "user": {
        "fid": "11111",
        "username": "charlie",
        "displayName": "Charlie",
        "pfpUrl": "https://..."
      },
      "cast": {
        "castHash": "0x789...",
        "text": "Amazing track",
        "timestamp": "2025-10-03T11:00:00Z",
        "music": [],
        "stats": {
          "replies": 1,
          "likes": 5,
          "recasts": 3
        }
      },
      "timestamp": "2025-10-03T11:50:00Z"
    }
  ],
  "nextCursor": "cursor_string"
}
```

---

### `GET /api/search`
**Search threads, music, and users**

**Query Params:**
- `q` (search query, required)
- `type` (threads | music | users | all - default: all)
- `limit` (default: 50, max: 100)
- `cursor` (pagination cursor)

**Process:**
1. Full-text search on:
   - **threads**: `cast_text` in `cast_nodes`
   - **music**: `artist`, `track_title` in `music_library`
   - **users**: `fname`, `display_name` in `user_nodes`
2. Return combined or filtered results

**Response:**
```json
{
  "results": {
    "threads": [
      {
        "castHash": "0x123...",
        "text": "Check out this track!",
        "author": {
          "fid": "12345",
          "username": "alice",
          "displayName": "Alice",
          "pfpUrl": "https://..."
        },
        "timestamp": "2025-10-03T12:00:00Z",
        "music": [
          {
            "id": "uuid",
            "title": "Track Name",
            "artist": "Artist Name",
            "platform": "spotify",
            "platformId": "...",
            "url": "https://open.spotify.com/track/...",
            "thumbnail": "https://..."
          }
        ],
        "stats": {
          "replies": 5,
          "likes": 10,
          "recasts": 2
        }
      }
    ],
    "music": [
      {
        "id": "uuid",
        "title": "Track Name",
        "artist": "Artist Name",
        "platform": "spotify",
        "platformId": "...",
        "url": "https://open.spotify.com/track/...",
        "thumbnail": "https://...",
        "shareCount": 42
      }
    ],
    "users": [
      {
        "fid": "12345",
        "username": "alice",
        "displayName": "Alice",
        "pfpUrl": "https://..."
      }
    ]
  },
  "nextCursor": "cursor_string"
}
```

---

## Async Background Jobs

**Note:** For MVP, these run as fire-and-forget async functions within the API process. No separate job queue service. Can migrate to BullMQ/Inngest later if needed for retries or reliability.

### `processNewReplies(castHash)`
**Extracts music metadata from new replies**

**Triggered:** When `GET /api/threads/:castHash` detects new replies

**Execution:** Fire-and-forget async call (doesn't block response)

**Process:**
1. Get new replies that haven't been processed for music
2. For each reply with URLs in text:
   - Extract music URLs from text
   - Call `extractMusicMetadata(castHash, urls)`

---

### `extractMusicMetadata(castHash, urls)`
**Extracts music metadata from URLs using Claude API**

**Triggered:**
- When creating thread/reply with trackUrls
- When processing new replies with music URLs

**Execution:** Fire-and-forget async call (doesn't block thread/reply creation)

**Implementation Location:** `/backend/lib/music-extraction.ts`

**Process:**
1. For each URL:
   - Call Claude API to parse artist, track title, platform, platform_id
2. Upsert into `music_library` (match by platform + platform_id)
3. Create `cast_music_edges` linking cast to music

**Claude API Prompt:**
```
Extract music metadata from this URL: {url}

Return JSON:
{
  "artist": "...",
  "trackTitle": "...",
  "platform": "spotify|soundcloud|youtube|apple_music|...",
  "platformId": "..."
}
```

**Future Enhancement:** If reliability becomes critical, migrate to job queue (BullMQ, Inngest) for retry logic and failure handling.

---

## Error Responses

All endpoints follow consistent error format:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Human-readable error message",
    "details": { ... } // optional
  }
}
```

**Common Error Codes:**
- `INVALID_REQUEST` - Bad request (400)
- `NOT_FOUND` - Resource not found (404)
- `RATE_LIMITED` - Too many requests (429)
- `INTERNAL_ERROR` - Server error (500)
- `NEYNAR_ERROR` - Neynar API error (502)

---

## Rate Limiting

- **Default**: 100 requests per minute per user
- **Search**: 20 requests per minute per user
- **Write operations** (POST/DELETE): 30 requests per minute per user

Response headers include:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
