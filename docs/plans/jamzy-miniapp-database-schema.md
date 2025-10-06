# Jamzy Miniapp Database Schema

**Date:** 2025-10-03
**Related Task:** TASK-602

---

## Overview

The Jamzy miniapp uses a graph-based schema to store Farcaster social data and music sharing activity. The core design treats threads and replies as the same entity (casts) and uses edges to represent relationships.

**Related Documentation:**
- API Endpoints: `jamzy-miniapp-api-endpoints.md`
- Neynar Integration: `neynar-farcaster-integration-architecture.md`

---

## Tables

### 1. `user_nodes`

Stores Farcaster user information.

**Columns:**
- `node_id` TEXT PRIMARY KEY (Farcaster FID)
- `fname` TEXT (username)
- `display_name` TEXT
- `avatar_url` TEXT
- `created_at` TIMESTAMP

---

### 2. `cast_nodes`

Stores all Farcaster casts (both thread starters and replies).

**Columns:**
- `node_id` TEXT PRIMARY KEY (cast hash)
- `cast_text` TEXT
- `created_at` TIMESTAMP
- `author_fid` TEXT → user_nodes
- `parent_cast_hash` TEXT (null for threads, populated for replies)
- `root_parent_hash` TEXT (points to original thread for nested replies)
- `channel` TEXT (e.g., "jamzy")

**Key Points:**
- Thread starters have `parent_cast_hash = null`
- Replies have `parent_cast_hash` pointing to the cast they're replying to
- `root_parent_hash` always points to the original thread for easy querying

---

### 3. `interaction_edges`

Stores relationships between users and casts, or between casts.

**Columns:**
- `source_id` TEXT (user_id or cast_id)
- `target_id` TEXT (cast_id or user_id)
- `edge_type` ENUM ('AUTHORED', 'LIKED', 'RECASTED', 'REPLIED')
- `created_at` TIMESTAMP
- PRIMARY KEY (`source_id`, `target_id`, `edge_type`)

**Edge Types:**
- `AUTHORED`: user → cast (user created a cast)
- `LIKED`: user → cast (user liked a cast)
- `RECASTED`: user → cast (user recasted a cast)
- `REPLIED`: cast → cast (cast replied to another cast)

---

### 4. `music_library`

Stores normalized music track metadata.

**Columns:**
- `id` UUID PRIMARY KEY
- `platform` TEXT (spotify, soundcloud, youtube, etc.)
- `platform_id` TEXT (track ID on the platform)
- `artist` TEXT
- `track_title` TEXT
- `album` TEXT
- `duration` INTEGER (seconds)
- `release_date` DATE
- `created_at` TIMESTAMP

**Key Points:**
- One track can be shared by multiple casts
- Tracks are identified by `platform` + `platform_id` combination

---

### 5. `cast_music_edges`

Connects casts to the music tracks they share.

**Columns:**
- `cast_id` TEXT → cast_nodes
- `music_id` UUID → music_library
- `created_at` TIMESTAMP
- PRIMARY KEY (`cast_id`, `music_id`)

**Key Points:**
- A cast can share multiple tracks
- A track can be shared in multiple casts

---

## Design Decisions

### Why threads and replies are in the same table?
- They're the same Farcaster data structure (casts)
- Simpler querying and data model
- Mirrors Farcaster's native model
- Flexible for future features (threads on threads, quote casts, etc.)

### Why use edges instead of foreign keys?
- Graph structure is more flexible
- Supports multiple relationship types
- Easier to query social graphs
- Scales better for complex social features

### Why normalize music tracks?
- Avoid duplication when multiple users share the same track
- Easier to aggregate stats (e.g., "most shared track")
- Cleaner data model

---

## Example Queries

### Get a thread with all replies
```sql
-- Get thread starter
SELECT * FROM cast_nodes WHERE node_id = 'thread_hash';

-- Get direct replies
SELECT c.*
FROM cast_nodes c
WHERE c.parent_cast_hash = 'thread_hash'
ORDER BY c.created_at;
```

### Get all music shared in a thread
```sql
SELECT m.*
FROM music_library m
JOIN cast_music_edges cme ON cme.music_id = m.id
JOIN cast_nodes c ON c.node_id = cme.cast_id
WHERE c.root_parent_hash = 'thread_hash'
   OR c.node_id = 'thread_hash';
```

### Get user's threads
```sql
SELECT c.*
FROM cast_nodes c
WHERE c.author_fid = 'user_fid'
  AND c.parent_cast_hash IS NULL;
```

---

## Future Considerations

- **Genres table**: For music genre taxonomy (optional)
- **Analytics tables**: Pre-aggregated stats for performance
- **Moderation**: Flags/reports on casts or users
- **Notifications**: Track mentions, replies to user's casts
