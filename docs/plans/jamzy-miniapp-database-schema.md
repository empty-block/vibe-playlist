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

Stores music track metadata for both imported Farcaster data and mini-app shares.

**Columns:**
- `cast_id` TEXT (legacy: for imported data)
- `embed_index` INTEGER (legacy: for imported data)
- `platform` TEXT (e.g., 'spotify', 'youtube', 'soundcloud')
- `platform_id` TEXT (track ID on the platform, e.g., Spotify track ID)
- `artist` TEXT
- `title` TEXT (aliased as `track_title` for mini-app)
- `album` TEXT
- `duration` INTEGER (seconds)
- `release_date` DATE
- `thumbnail_url` TEXT
- `url` TEXT
- `created_at` TIMESTAMP
- `platform_name` TEXT (legacy: aliased as `platform`)
- PRIMARY KEY (`platform`, `platform_id`) WHERE `platform_id` IS NOT NULL
- UNIQUE (`cast_id`, `embed_index`) WHERE `cast_id` IS NOT NULL

**Key Points:**
- **Composite natural key**: Tracks are uniquely identified by `(platform, platform_id)`
- **Automatic deduplication**: Same Spotify track can't be added twice
- **Legacy compatibility**: Imported data uses `(cast_id, embed_index)`, new mini-app uses `(platform, platform_id)`
- One track can be shared by multiple casts (many-to-many via `cast_music_edges`)

---

### 5. `cast_music_edges`

Connects casts to the music tracks they share (mini-app only).

**Columns:**
- `cast_id` TEXT → cast_nodes(node_id)
- `music_platform` TEXT
- `music_platform_id` TEXT
- `created_at` TIMESTAMP
- PRIMARY KEY (`cast_id`, `music_platform`, `music_platform_id`)
- FOREIGN KEY (`music_platform`, `music_platform_id`) → music_library(platform, platform_id)

**Key Points:**
- A cast can share multiple tracks
- A track can be shared in multiple casts (many-to-many)
- Uses composite key to reference `music_library` by natural identifier
- Only used for mini-app casts (legacy imported data uses `cast_id` in `music_library` directly)

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
JOIN cast_music_edges cme ON (m.platform, m.platform_id) = (cme.music_platform, cme.music_platform_id)
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

## Database Unification Strategy

### Overview

The Jamzy project has **two data sources** that need to coexist:

1. **Existing Web App Data**: Thousands of music entries imported from broader Farcaster (stored in current `music_library`, `user_nodes`, `cast_nodes`, `cast_edges`)
2. **New Mini-App Data**: Threads and replies created in the Jamzy mini-app

**Key Decision**: Unified schema approach - both datasets live in the same tables, distinguished by the `channel` field.

### Schema Comparison

**Existing Web App Schema:**
```
music_library (cast_id, embed_index, artist, title, platform_name, ...)
user_nodes (node_id, fname, display_name, avatar_url)
cast_nodes (node_id, cast_text, author_fid, cast_channel, created_at)
cast_edges (source_user_id, cast_id, edge_type, ...)
embeds_metadata (cast_id, embed_index, url, ...)
```

**Mini-App Schema (This Document):**
```
music_library (platform, platform_id, artist, title, ...) ⚠️ Add fields to existing table
user_nodes (node_id, fname, display_name, avatar_url) ✅ Same
cast_nodes (node_id, cast_text, author_fid, channel, parent_cast_hash, root_parent_hash) ⚠️ Add fields
interaction_edges (source_id, target_id, edge_type, ...) ⚠️ Rename from cast_edges
cast_music_edges (cast_id, music_platform, music_platform_id, ...) ➕ New table
```

**Unified Schema:**
- **Evolve** existing `music_library` with new columns (non-breaking, backward compatible)
- Evolve `cast_nodes` with new columns (non-breaking)
- Rename `cast_edges` → `interaction_edges` (simple rename)
- Add `cast_music_edges` for mini-app music linking (new junction table)

**Data Preservation Guarantee**: ✅ **Zero data loss** - all existing thousands of entries remain intact.

---

## Migration Plan (Non-Destructive)

### Phase 1: Add Mini-App Columns (Safe - No Data Loss)

```sql
-- Migration: 001_add_miniapp_columns.sql

-- Add thread/reply support to existing cast_nodes
ALTER TABLE cast_nodes
  ADD COLUMN IF NOT EXISTS parent_cast_hash TEXT,
  ADD COLUMN IF NOT EXISTS root_parent_hash TEXT;
-- Note: channel already exists in cast_nodes

-- Add mini-app fields to existing music_library
ALTER TABLE music_library
  ADD COLUMN IF NOT EXISTS platform_id TEXT,
  ADD COLUMN IF NOT EXISTS platform TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cast_nodes_parent ON cast_nodes(parent_cast_hash);
CREATE INDEX IF NOT EXISTS idx_cast_nodes_root_parent ON cast_nodes(root_parent_hash);
CREATE INDEX IF NOT EXISTS idx_music_library_platform ON music_library(platform, platform_id)
  WHERE platform_id IS NOT NULL;

-- Add unique constraint for mini-app entries
ALTER TABLE music_library
  ADD CONSTRAINT unique_platform_track UNIQUE (platform, platform_id)
  DEFERRABLE INITIALLY DEFERRED;
```

**Result**:
- Existing rows stay unchanged, new columns are `NULL` until populated
- Legacy data continues using `(cast_id, embed_index)`
- New mini-app data will use `(platform, platform_id)`

---

### Phase 2: Create Junction Table (Safe - No Data Loss)

```sql
-- Migration: 002_create_cast_music_edges.sql

-- Create junction table linking casts to music
CREATE TABLE IF NOT EXISTS cast_music_edges (
  cast_id TEXT REFERENCES cast_nodes(node_id) ON DELETE CASCADE,
  music_platform TEXT NOT NULL,
  music_platform_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (cast_id, music_platform, music_platform_id),
  FOREIGN KEY (music_platform, music_platform_id)
    REFERENCES music_library(platform, platform_id)
    ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cast_music_edges_cast ON cast_music_edges(cast_id);
CREATE INDEX IF NOT EXISTS idx_cast_music_edges_music ON cast_music_edges(music_platform, music_platform_id);
```

**Result**:
- New empty junction table created
- Uses composite foreign key to reference `music_library`
- Existing tables untouched

---

### Phase 3: Rename Interaction Table (Safe - No Data Loss)

```sql
-- Migration: 003_rename_cast_edges.sql

-- Rename table (preserves all data)
ALTER TABLE IF EXISTS cast_edges
  RENAME TO interaction_edges;

-- Update edge types if needed (optional, can keep existing)
-- No data is deleted, just metadata changes
```

**Result**: Same data, new table name. Existing edge types remain valid.

---

### Why One Music Table (Not Two)?

**Decision: Evolve existing `music_library` table instead of creating a v2**

The initial plan suggested creating `music_library_v2`, but this creates unnecessary complexity:

**Problems with separate tables:**
- ❌ Confusing naming ("v2" suggests iteration, not purpose)
- ❌ Duplicate functionality (two music tables doing similar things)
- ❌ Query complexity (which table for "all music"?)
- ❌ Tech debt ("consolidate later" often means "never")
- ❌ Maintenance burden (two tables to manage)

**Benefits of evolving single table:**
- ✅ Single source of truth for all music
- ✅ Zero data loss (legacy fields remain)
- ✅ Both systems coexist naturally
- ✅ Simpler queries (one table, filter by cast channel if needed)
- ✅ Natural deduplication via composite key `(platform, platform_id)`
- ✅ No "consolidate later" migration needed

**How it works:**
- Legacy imported data: Uses `(cast_id, embed_index)` (remains untouched)
- New mini-app data: Uses `(platform, platform_id)` (composite primary key)
- Both coexist via nullable columns and conditional unique constraints
- Music source is determined by `channel` on associated `cast_nodes`, not on the music table itself

---

## Data Organization via Channel

### Using `channel` to Distinguish Data Sources

The `channel` field naturally separates Jamzy app data from imported Farcaster data:

```sql
cast_nodes (
  channel TEXT  -- Key field for data source
)
```

**Data Source Logic:**
- **Jamzy App Threads**: `channel = 'jamzy'` (posted to /jamzy Farcaster channel)
- **Imported Farcaster Data**: `channel = 'music'`, `'hip-hop'`, etc. OR `NULL`

### Query Patterns

**Get Jamzy app threads only:**
```sql
SELECT * FROM cast_nodes
WHERE channel = 'jamzy'
  AND parent_cast_hash IS NULL  -- Top-level threads
ORDER BY created_at DESC;
```

**Get imported Farcaster music:**
```sql
SELECT * FROM music_library ml
JOIN cast_nodes cn ON ml.cast_id = cn.node_id
WHERE cn.channel != 'jamzy' OR cn.channel IS NULL
ORDER BY cn.created_at DESC;
```

**Get all music (both sources):**
```sql
SELECT * FROM music_library ml
JOIN cast_nodes cn ON ml.cast_id = cn.node_id
-- No channel filter - shows everything
ORDER BY cn.created_at DESC;
```

**Jamzy vs broader Farcaster comparison:**
```sql
SELECT
  CASE
    WHEN channel = 'jamzy' THEN 'Jamzy Community'
    ELSE 'Broader Farcaster'
  END as source,
  COUNT(*) as tracks_shared
FROM cast_nodes
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY 1;
```

### Benefits of Channel-Based Approach

- ✅ No extra field needed (already in mini-app schema)
- ✅ Follows Farcaster's native model
- ✅ Permissionless - external posts to /jamzy show up naturally
- ✅ Can choose to include/exclude external posts in UI
- ✅ Easy analytics across both datasets
- ✅ Future: Enable "trending outside Jamzy" discovery features

---

## Environment Setup

### Three-Tier Database Strategy

**1. Production (Main Supabase Project)**
- All existing data preserved (thousands of entries)
- Real user threads from mini-app
- Production-only migrations
- ENV: `SUPABASE_URL`, `SUPABASE_KEY`

**2. Staging (Separate Supabase Project)**
- Copy of production data OR large representative subset
- Pre-production testing and validation
- Refresh periodically (monthly/quarterly)
- ENV: `SUPABASE_STAGING_URL`, `SUPABASE_STAGING_KEY`

**3. Local Development (Supabase CLI + Docker)**
- Local Postgres instance via `supabase start`
- Small curated seed data (50-200 entries)
- Fast iteration, no cloud costs
- Auto-applies migrations from `/database/migrations/`
- ENV: `SUPABASE_ENV=local`, uses `http://localhost:54321`

### Environment Configuration

Your backend already supports this pattern:

```typescript
// backend/api/database.ts (already exists)
const supabaseUrl =
  process.env.SUPABASE_ENV === 'local' ? 'http://localhost:54321' :
  process.env.SUPABASE_ENV === 'staging' ? process.env.SUPABASE_STAGING_URL :
  process.env.SUPABASE_URL;

const supabaseKey =
  process.env.SUPABASE_ENV === 'local' ? process.env.SUPABASE_LOCAL_KEY :
  process.env.SUPABASE_ENV === 'staging' ? process.env.SUPABASE_STAGING_KEY :
  process.env.SUPABASE_KEY;
```

---

## Seed Data Strategy

### Production Data
- **Size**: Thousands of existing music entries
- **Action**: Keep all data (no deletion)
- **Use**: Real production data + imported Farcaster music for trends/discovery

### Staging Data
- **Size**: Hundreds of entries (production copy or large subset)
- **Action**: Periodic refresh from production
- **Use**: Pre-production validation with production-like data

### Local Development Data
- **Size**: 50-200 curated entries
- **Source**: Extracted subset from production
- **Use**: Fast local development and testing

### Creating Local Seed Data

**Option 1: Supabase CLI Dump**
```bash
# Dump a subset of production data
supabase db dump --data-only \
  --table user_nodes \
  --table cast_nodes \
  --table music_library \
  --limit 100 \
  > database/seeds/dev_seed.sql
```

**Option 2: Manual SQL Export**
```sql
-- database/seeds/dev_seed.sql
-- Extract diverse subset from production

-- 20 recent users
INSERT INTO user_nodes (node_id, fname, display_name, avatar_url)
SELECT node_id, fname, display_name, avatar_url
FROM user_nodes
ORDER BY created_at DESC
LIMIT 20;

-- 50 recent casts from those users
INSERT INTO cast_nodes (node_id, cast_text, author_fid, channel, created_at)
SELECT cn.node_id, cn.cast_text, cn.author_fid, cn.channel, cn.created_at
FROM cast_nodes cn
WHERE cn.author_fid IN (SELECT node_id FROM user_nodes LIMIT 20)
ORDER BY cn.created_at DESC
LIMIT 50;

-- 100 music entries across different platforms
INSERT INTO music_library (cast_id, embed_index, artist, title, platform_name, created_at)
SELECT cast_id, embed_index, artist, title, platform_name, created_at
FROM music_library
WHERE platform_name IN ('spotify', 'youtube', 'soundcloud')
ORDER BY created_at DESC
LIMIT 100;
```

### Why Small Seed Data for Local Dev?

- ✅ Fast database resets (`supabase db reset` takes seconds)
- ✅ Predictable test state
- ✅ Easy to understand and debug
- ✅ Version control friendly (hundreds of lines, not millions)
- ✅ Covers edge cases (threads with/without music, various platforms)

### Local Development Workflow

```bash
# Start local Supabase (first time)
supabase start

# Reset DB and apply migrations
supabase db reset

# Seed with test data
psql postgresql://postgres:postgres@localhost:54322/postgres < database/seeds/dev_seed.sql

# Run backend
SUPABASE_ENV=local bun run dev
```

---

## Migration Rollout Strategy

### Step 1: Test Locally
```bash
# Apply migrations to local DB
supabase db reset

# Seed with test data
psql ... < database/seeds/dev_seed.sql

# Verify both web app AND mini-app work
SUPABASE_ENV=local bun run dev
```

### Step 2: Deploy to Staging
```bash
# Apply migrations to staging
supabase db push --db-url $SUPABASE_STAGING_URL

# Copy production data or use existing staging data
# Test thoroughly with production-like data
SUPABASE_ENV=staging bun run dev
```

### Step 3: Deploy to Production
```bash
# Apply migrations to production (after validation)
supabase db push --db-url $SUPABASE_URL

# Existing data preserved ✅
# New tables created ✅
# Web app continues working ✅
# Mini-app ready to use ✅
```

### Step 4: Gradual Data Population

```typescript
// As users create Jamzy threads, data populates naturally:

// 1. Thread creation
await supabase.from('cast_nodes').insert({
  node_id: castHash,
  cast_text: threadText,
  author_fid: userId,
  channel: 'jamzy',  // Marks as Jamzy app data
  parent_cast_hash: null,
  root_parent_hash: null,
  created_at: new Date()
});

// 2. Music extraction and storage (async)
const { platform, platform_id } = extractPlatformInfo(trackUrl);

// Upsert to music_library (deduplicates automatically)
await supabase.from('music_library').upsert({
  platform,
  platform_id,
  artist: metadata.artist,
  title: metadata.title,
  album: metadata.album,
  duration: metadata.duration,
  thumbnail_url: metadata.thumbnail,
  url: trackUrl
}, { onConflict: 'platform,platform_id' });

// Link cast to music track
await supabase.from('cast_music_edges').insert({
  cast_id: castHash,
  music_platform: platform,
  music_platform_id: platform_id
});
```

---

## Future Considerations

### Schema Optimization
- **Backfill platform IDs**: Extract platform IDs from URLs for legacy `music_library` entries (optional cleanup)
- **Genres table**: For music genre taxonomy (optional)
- **Analytics tables**: Pre-aggregated stats for performance (trending, top artists, etc.)

### Features
- **Moderation**: Flags/reports on casts or users
- **Notifications**: Track mentions, replies to user's casts
- **Discovery**: "Trending outside Jamzy" tab using imported Farcaster data
- **Cross-promotion**: Surface high-engagement Farcaster music into Jamzy

### Data Management
- **Archive old imported data**: Retention policies for broad Farcaster data (keep recent, archive old)
- **Data refresh**: Periodic imports of new trending Farcaster music
- **Platform ID backfill**: When needed, extract platform IDs from legacy entry URLs for better deduplication
