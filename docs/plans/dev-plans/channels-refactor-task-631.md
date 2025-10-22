# Channels Refactor Development Plan (TASK-631)

**Date:** 2025-10-14
**Task:** TASK-631 - Channels Refactor
**Status:** Ready for Implementation

---

## Executive Summary

Jamzy is transitioning from displaying individual threads to a channel-based browsing system using Farcaster's native channel primitive (FIP-2). This refactor introduces curated music channels where users can browse threads organized by music genres and communities.

**Core Philosophy:** Follow the zen path - build simple, elegant solutions that handle complexity gracefully. Every architectural decision should serve maintainability and clarity.

**Key Innovation:** Channels act as filtered views over existing thread data, requiring minimal schema changes while enabling powerful discovery patterns.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Layer](#database-layer)
3. [Backend API Layer](#backend-api-layer)
4. [Data Sync Layer](#data-sync-layer)
5. [Frontend Layer](#frontend-layer)
6. [Implementation Roadmap](#implementation-roadmap)
7. [Testing Strategy](#testing-strategy)
8. [Deployment & Rollout](#deployment--rollout)

---

## Architecture Overview

### Current State Analysis

**Existing Infrastructure:**
- **Database:** `cast_nodes`, `interaction_edges`, `cast_music_edges`, `music_library`, `user_nodes`
- **API Functions:** `get_threads_feed()`, `get_thread_with_replies()`, `get_user_threads()`, `get_activity_feed()`
- **Backend:** `/backend/api/threads.ts` handles thread operations
- **Frontend:** Both web-app and mini-app have basic channels UI (ChannelsPage, ChannelViewPage)
- **Data Pipelines:** Python pipelines in `/data/pipelines/` for importing cast data from Dune

**Current Thread Model:**
```
Thread (cast_nodes where parent_cast_hash IS NULL)
  ├─ Replies (cast_nodes where parent_cast_hash = thread.node_id)
  ├─ Music (cast_music_edges → music_library)
  └─ Stats (interaction_edges: likes, recasts)
```

### Target Architecture

**New Channel Model:**
```
Channel (curated music community)
  ├─ Channel Metadata (channels table)
  ├─ Channel Threads (cast_nodes filtered by channel_id)
  │   ├─ Thread with replies
  │   ├─ Music attachments
  │   └─ Engagement stats
  └─ Channel Stats (aggregated metrics)
```

**Key Architectural Principles:**

1. **Channels as Filters:** Channels are not a new data type, they're filtered views over existing threads
2. **Backward Compatibility:** All existing thread functionality must continue working
3. **Minimal Schema Changes:** Add channel metadata table, update cast_nodes to support channel_id
4. **Progressive Enhancement:** Build channel features without breaking existing features
5. **Data Flow:** Neynar API → Python sync script → PostgreSQL → Backend API → Frontend

---

## Database Layer

### Phase 1: Add Channel Support to Existing Schema

**Goal:** Enable cast_nodes to be associated with channels without breaking existing functionality.

#### Migration 1: Add Channel ID to Cast Nodes

**File:** `/database/migrations/20251014000000_add_channel_support.sql`

```sql
-- Add channel_id to cast_nodes to support Farcaster channels
-- This is backward compatible - existing threads have NULL channel_id

ALTER TABLE cast_nodes
  ADD COLUMN channel_id TEXT,
  ADD COLUMN parent_url TEXT;

-- Index for channel queries
CREATE INDEX idx_cast_nodes_channel_id ON cast_nodes(channel_id)
  WHERE channel_id IS NOT NULL;

-- Index for parent_url (Farcaster channel URL)
CREATE INDEX idx_cast_nodes_parent_url ON cast_nodes(parent_url)
  WHERE parent_url IS NOT NULL;

-- Add comments
COMMENT ON COLUMN cast_nodes.channel_id IS 'Farcaster channel ID (e.g., "hiphop", "music")';
COMMENT ON COLUMN cast_nodes.parent_url IS 'Farcaster channel parent URL (e.g., "https://farcaster.xyz/~/channel/hiphop")';
```

**Rationale:**
- `channel_id`: Short identifier for filtering (e.g., "hiphop", "techno")
- `parent_url`: Full Farcaster channel URL from cast data (matches FIP-2 spec)
- Both nullable for backward compatibility with existing threads
- Indexes only on non-null values for efficiency

#### Migration 2: Create Channels Metadata Table

**File:** `/database/migrations/20251014000001_create_channels_table.sql`

```sql
-- Channels metadata table for curated music communities
-- This stores channel information and curation data

CREATE TABLE channels (
  id TEXT PRIMARY KEY,  -- Short channel ID (e.g., "hiphop")
  name TEXT NOT NULL,   -- Display name (e.g., "Hip Hop Heads")
  description TEXT,     -- Channel description
  parent_url TEXT NOT NULL UNIQUE,  -- Farcaster channel URL

  -- Curation metadata
  is_official BOOLEAN DEFAULT FALSE,  -- Official Jamzy channel
  is_curated BOOLEAN DEFAULT TRUE,   -- Manually curated vs. auto-discovered
  sort_order INTEGER DEFAULT 0,      -- Display order (lower = higher priority)

  -- Channel branding
  icon_url TEXT,        -- Channel icon/avatar
  banner_url TEXT,      -- Channel banner image
  color_hex TEXT,       -- Theme color (e.g., "#FF00FF")

  -- Visibility
  is_visible BOOLEAN DEFAULT TRUE,   -- Show in channels list
  is_archived BOOLEAN DEFAULT FALSE, -- Archived channels

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_channels_is_visible ON channels(is_visible) WHERE is_visible = TRUE;
CREATE INDEX idx_channels_sort_order ON channels(sort_order);
CREATE INDEX idx_channels_is_official ON channels(is_official) WHERE is_official = TRUE;

-- Comments
COMMENT ON TABLE channels IS 'Curated music channels for browsing threads';
COMMENT ON COLUMN channels.parent_url IS 'Must match cast_nodes.parent_url for filtering';
```

**Rationale:**
- `id` as short identifier for URLs and API responses
- `parent_url` links to Farcaster channel (matches cast data)
- `is_official` distinguishes Jamzy-created channels from community channels
- `is_curated` vs. auto-discovered (future: auto-create channels from popular parent_urls)
- `sort_order` for manual curation of channel list order
- Flexible branding fields for future customization

#### Migration 3: Seed Official Jamzy Channels

**File:** `/database/migrations/20251014000002_seed_jamzy_channels.sql`

```sql
-- Seed official Jamzy music channels
-- These are the initial curated channels for launch

INSERT INTO channels (id, name, description, parent_url, is_official, is_curated, sort_order, color_hex) VALUES
  ('hip-hop', 'Hip Hop Heads', 'Golden era hip-hop and modern classics', 'https://farcaster.xyz/~/channel/hiphop', TRUE, TRUE, 1, '#FF6B35'),
  ('techno', 'Techno Basement', '4/4 forever - minimal and deep techno', 'https://farcaster.xyz/~/channel/techno', TRUE, TRUE, 2, '#00D9FF'),
  ('indie', 'Indie Bedroom', 'Lo-fi bedroom pop and indie gems', 'https://farcaster.xyz/~/channel/indie', TRUE, TRUE, 3, '#FFB800'),
  ('jazz', 'Jazz After Midnight', 'Standards, bebop, and beyond', 'https://farcaster.xyz/~/channel/jazz', TRUE, TRUE, 4, '#9B51E0'),
  ('electronic', 'Electronic Dreams', 'IDM, ambient, and experimental sounds', 'https://farcaster.xyz/~/channel/electronic', TRUE, TRUE, 5, '#00FFA3');

-- Add mock channels for existing thread IDs (for development/testing)
-- These map to real thread IDs in the current database
INSERT INTO channels (id, name, description, parent_url, is_official, is_curated, sort_order) VALUES
  ('vaporwave', 'Vaporwave Sanctuary', 'A E S T H E T I C vibes only', 'https://farcaster.xyz/~/channel/vaporwave', FALSE, TRUE, 10),
  ('punk', 'Punk Basement', 'Hardcore and punk rock', 'https://farcaster.xyz/~/channel/punk', FALSE, TRUE, 11),
  ('metal', 'Metal Mosh Pit', 'From doom to death metal', 'https://farcaster.xyz/~/channel/metal', FALSE, TRUE, 12);
```

**Rationale:**
- Start with 3-5 official channels (can be created with 10k Warps each on Farcaster)
- Additional channels for development/testing
- Colors for visual distinction in UI
- `sort_order` allows manual curation of prominence

### Phase 2: Channel Query Functions

#### Function 1: Get Channels List

**File:** `/database/functions/get_channels_list.sql`

```sql
-- Get list of channels with metadata and thread counts
CREATE OR REPLACE FUNCTION get_channels_list(
  include_archived BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  channel_id TEXT,
  name TEXT,
  description TEXT,
  parent_url TEXT,
  is_official BOOLEAN,
  icon_url TEXT,
  color_hex TEXT,
  thread_count BIGINT,
  last_activity_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as channel_id,
    c.name,
    c.description,
    c.parent_url,
    c.is_official,
    c.icon_url,
    c.color_hex,
    COUNT(DISTINCT cn.node_id) as thread_count,
    MAX(cn.created_at) as last_activity_at
  FROM channels c
  LEFT JOIN cast_nodes cn ON cn.channel_id = c.id
    AND cn.parent_cast_hash IS NULL  -- Only count root threads
  WHERE c.is_visible = TRUE
    AND (include_archived OR c.is_archived = FALSE)
  GROUP BY c.id, c.name, c.description, c.parent_url, c.is_official, c.icon_url, c.color_hex, c.sort_order
  ORDER BY c.sort_order ASC, thread_count DESC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_channels_list TO authenticated;
GRANT EXECUTE ON FUNCTION get_channels_list TO anon;
```

**Rationale:**
- Returns channels with thread counts and last activity
- Respects visibility and archived flags
- Ordered by manual sort_order, then by activity
- Efficient JOIN with LEFT JOIN to handle channels with no threads yet

#### Function 2: Get Channel Feed

**File:** `/database/functions/get_channel_feed.sql`

```sql
-- Get paginated feed of threads for a specific channel
-- This is similar to get_threads_feed but filtered by channel
CREATE OR REPLACE FUNCTION get_channel_feed(
  p_channel_id TEXT,
  limit_count INTEGER DEFAULT 50,
  cursor_timestamp TIMESTAMP DEFAULT NULL,
  cursor_id TEXT DEFAULT NULL
)
RETURNS TABLE(
  cast_hash TEXT,
  cast_text TEXT,
  created_at TIMESTAMP,
  author_fid TEXT,
  author_username TEXT,
  author_display_name TEXT,
  author_avatar_url TEXT,
  music JSONB,
  likes_count BIGINT,
  recasts_count BIGINT,
  replies_count BIGINT
) AS $$
BEGIN
  -- Validate limit
  IF limit_count > 100 THEN
    limit_count := 100;
  END IF;

  IF limit_count < 1 THEN
    limit_count := 50;
  END IF;

  RETURN QUERY
  WITH channel_threads AS (
    SELECT
      cn.node_id,
      cn.cast_text,
      cn.created_at,
      cn.author_fid
    FROM cast_nodes cn
    WHERE cn.channel_id = p_channel_id
      AND cn.parent_cast_hash IS NULL  -- Only root threads
      AND (cursor_timestamp IS NULL OR cn.created_at < cursor_timestamp)
    ORDER BY cn.created_at DESC
    LIMIT limit_count
  ),
  thread_music AS (
    SELECT
      cme.cast_id,
      jsonb_agg(
        jsonb_build_object(
          'id', ml.platform_name || '-' || ml.platform_id,
          'title', ml.title,
          'artist', ml.artist,
          'platform', ml.platform_name,
          'platformId', ml.platform_id,
          'url', ml.url,
          'thumbnail', ml.thumbnail_url
        )
      ) as music_data
    FROM cast_music_edges cme
    INNER JOIN music_library ml ON cme.music_platform_id = ml.platform_id
      AND cme.music_platform_name = ml.platform_name
    WHERE cme.cast_id IN (SELECT node_id FROM channel_threads)
    GROUP BY cme.cast_id
  ),
  thread_stats AS (
    SELECT
      ie.cast_id,
      COUNT(*) FILTER (WHERE ie.edge_type = 'LIKED') as likes,
      COUNT(*) FILTER (WHERE ie.edge_type = 'RECASTED') as recasts
    FROM interaction_edges ie
    WHERE ie.cast_id IN (SELECT node_id FROM channel_threads)
    GROUP BY ie.cast_id
  ),
  thread_replies AS (
    SELECT
      cn.parent_cast_hash,
      COUNT(*) as reply_count
    FROM cast_nodes cn
    WHERE cn.parent_cast_hash IN (SELECT node_id FROM channel_threads)
      AND cn.parent_cast_hash IS NOT NULL
    GROUP BY cn.parent_cast_hash
  )
  SELECT
    t.node_id::TEXT as cast_hash,
    t.cast_text::TEXT,
    t.created_at,
    t.author_fid::TEXT,
    COALESCE(u.fname, 'unknown')::TEXT as author_username,
    COALESCE(u.display_name, 'Unknown User')::TEXT as author_display_name,
    u.avatar_url::TEXT as author_avatar_url,
    COALESCE(tm.music_data, '[]'::jsonb) as music,
    COALESCE(ts.likes, 0) as likes_count,
    COALESCE(ts.recasts, 0) as recasts_count,
    COALESCE(tr.reply_count, 0) as replies_count
  FROM channel_threads t
  LEFT JOIN user_nodes u ON t.author_fid = u.node_id
  LEFT JOIN thread_music tm ON t.node_id = tm.cast_id
  LEFT JOIN thread_stats ts ON t.node_id = ts.cast_id
  LEFT JOIN thread_replies tr ON t.node_id = tr.parent_cast_hash
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_channel_feed TO authenticated;
GRANT EXECUTE ON FUNCTION get_channel_feed TO anon;
```

**Rationale:**
- Mirrors `get_threads_feed()` structure but filtered by channel_id
- Reuses existing music, stats, and replies aggregation logic
- Cursor-based pagination for infinite scroll
- Same return signature as threads feed for easy frontend integration

#### Function 3: Get Channel Details

**File:** `/database/functions/get_channel_details.sql`

```sql
-- Get detailed channel information with aggregated stats
CREATE OR REPLACE FUNCTION get_channel_details(
  p_channel_id TEXT
)
RETURNS TABLE(
  channel_id TEXT,
  name TEXT,
  description TEXT,
  parent_url TEXT,
  is_official BOOLEAN,
  icon_url TEXT,
  banner_url TEXT,
  color_hex TEXT,
  thread_count BIGINT,
  total_likes BIGINT,
  total_replies BIGINT,
  unique_contributors BIGINT,
  last_activity_at TIMESTAMP,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as channel_id,
    c.name,
    c.description,
    c.parent_url,
    c.is_official,
    c.icon_url,
    c.banner_url,
    c.color_hex,
    COUNT(DISTINCT cn.node_id) as thread_count,
    COALESCE(SUM(stats.likes), 0) as total_likes,
    COALESCE(SUM(stats.replies), 0) as total_replies,
    COUNT(DISTINCT cn.author_fid) as unique_contributors,
    MAX(cn.created_at) as last_activity_at,
    c.created_at
  FROM channels c
  LEFT JOIN cast_nodes cn ON cn.channel_id = c.id
    AND cn.parent_cast_hash IS NULL
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) FILTER (WHERE ie.edge_type = 'LIKED') as likes,
      (SELECT COUNT(*) FROM cast_nodes replies WHERE replies.parent_cast_hash = cn.node_id) as replies
    FROM interaction_edges ie
    WHERE ie.cast_id = cn.node_id
  ) stats ON TRUE
  WHERE c.id = p_channel_id
  GROUP BY c.id, c.name, c.description, c.parent_url, c.is_official,
           c.icon_url, c.banner_url, c.color_hex, c.created_at;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_channel_details TO authenticated;
GRANT EXECUTE ON FUNCTION get_channel_details TO anon;
```

**Rationale:**
- Rich channel metadata for detail pages
- Aggregated statistics for engagement metrics
- Single query avoids N+1 problems
- Can be used for channel header/hero sections

---

## Backend API Layer

### Phase 3: Channels API Endpoints

**Goal:** Create RESTful API endpoints for channel operations in `/backend/api/channels.ts`

#### Endpoint Design

**File:** `/backend/api/channels.ts`

```typescript
import { Hono } from 'hono'
import {
  getSupabaseClient,
  encodeCursor,
  decodeCursor
} from '../lib/api-utils'

const app = new Hono()

/**
 * GET /api/channels
 * List all visible channels with metadata and stats
 */
app.get('/', async (c) => {
  try {
    const includeArchived = c.req.query('includeArchived') === 'true'
    const supabase = getSupabaseClient()

    const { data: channels, error } = await supabase
      .rpc('get_channels_list', { include_archived: includeArchived })

    if (error) {
      console.error('Error fetching channels:', error)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch channels'
        }
      }, 500)
    }

    // Format response
    const formattedChannels = channels.map((ch: any) => ({
      id: ch.channel_id,
      name: ch.name,
      description: ch.description,
      parentUrl: ch.parent_url,
      isOfficial: ch.is_official,
      iconUrl: ch.icon_url,
      colorHex: ch.color_hex,
      stats: {
        threadCount: parseInt(ch.thread_count),
        lastActivity: ch.last_activity_at
      }
    }))

    return c.json({ channels: formattedChannels })
  } catch (error) {
    console.error('Get channels error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

/**
 * GET /api/channels/:channelId
 * Get detailed information about a specific channel
 */
app.get('/:channelId', async (c) => {
  try {
    const channelId = c.req.param('channelId')
    const supabase = getSupabaseClient()

    const { data: channelData, error } = await supabase
      .rpc('get_channel_details', { p_channel_id: channelId })

    if (error) {
      console.error('Error fetching channel details:', error)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch channel details'
        }
      }, 500)
    }

    if (!channelData || channelData.length === 0) {
      return c.json({
        error: {
          code: 'NOT_FOUND',
          message: 'Channel not found'
        }
      }, 404)
    }

    const channel = channelData[0]

    return c.json({
      id: channel.channel_id,
      name: channel.name,
      description: channel.description,
      parentUrl: channel.parent_url,
      isOfficial: channel.is_official,
      iconUrl: channel.icon_url,
      bannerUrl: channel.banner_url,
      colorHex: channel.color_hex,
      stats: {
        threadCount: parseInt(channel.thread_count),
        totalLikes: parseInt(channel.total_likes),
        totalReplies: parseInt(channel.total_replies),
        uniqueContributors: parseInt(channel.unique_contributors),
        lastActivity: channel.last_activity_at
      },
      createdAt: channel.created_at
    })
  } catch (error) {
    console.error('Get channel details error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

/**
 * GET /api/channels/:channelId/feed
 * Get paginated feed of threads for a channel
 */
app.get('/:channelId/feed', async (c) => {
  try {
    const channelId = c.req.param('channelId')
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100)
    const cursor = c.req.query('cursor')

    const supabase = getSupabaseClient()

    // Parse cursor
    let cursorTimestamp = null
    let cursorId = null
    if (cursor) {
      const cursorData = decodeCursor(cursor)
      if (cursorData) {
        cursorTimestamp = cursorData.created_at
        cursorId = cursorData.id
      }
    }

    // Fetch channel feed
    const { data: threads, error: threadsError } = await supabase
      .rpc('get_channel_feed', {
        p_channel_id: channelId,
        limit_count: limit + 1,  // Fetch one extra to check hasMore
        cursor_timestamp: cursorTimestamp,
        cursor_id: cursorId
      })

    if (threadsError) {
      console.error('Error fetching channel feed:', threadsError)
      return c.json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch channel feed'
        }
      }, 500)
    }

    const hasMore = threads.length > limit
    const threadsToReturn = threads.slice(0, limit)

    // Format threads (same as /api/threads)
    const formattedThreads = threadsToReturn.map((thread: any) => ({
      castHash: thread.cast_hash,
      text: thread.cast_text,
      author: {
        fid: thread.author_fid,
        username: thread.author_username,
        displayName: thread.author_display_name,
        pfpUrl: thread.author_avatar_url
      },
      timestamp: thread.created_at,
      music: thread.music || [],
      stats: {
        replies: parseInt(thread.replies_count),
        likes: parseInt(thread.likes_count),
        recasts: parseInt(thread.recasts_count)
      }
    }))

    let nextCursor: string | undefined
    if (hasMore && threadsToReturn.length > 0) {
      const lastThread = threadsToReturn[threadsToReturn.length - 1]
      nextCursor = encodeCursor({
        created_at: lastThread.created_at,
        id: lastThread.cast_hash
      })
    }

    return c.json({
      threads: formattedThreads,
      nextCursor
    })
  } catch (error) {
    console.error('Get channel feed error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500)
  }
})

export default app
```

**Rationale:**
- RESTful design: `/api/channels`, `/api/channels/:id`, `/api/channels/:id/feed`
- Consistent error handling and response formatting
- Cursor-based pagination for feeds (matches `/api/threads`)
- Same thread format as existing API for frontend compatibility

#### Update Server Router

**File:** `/backend/server.ts`

```typescript
// Add to existing imports
import channelsApp from './api/channels'

// Add to existing routes
app.route('/api/channels', channelsApp)
```

---

## Data Sync Layer

### Phase 4: Neynar Integration for Channel Casts

**Goal:** Create a background sync service to fetch casts from Farcaster channels using Neynar API.

#### Step 1: Install Neynar SDK

```bash
cd /Users/nmadd/Dropbox/code/vibes/channels-page-TASK-627
bun add @neynar/nodejs-sdk
```

#### Step 2: Neynar Client Wrapper

**File:** `/backend/lib/neynar.ts`

```typescript
import { NeynarAPIClient } from '@neynar/nodejs-sdk'

// Initialize Neynar client
const neynarApiKey = process.env.NEYNAR_API_KEY
if (!neynarApiKey) {
  throw new Error('NEYNAR_API_KEY environment variable is required')
}

export const neynarClient = new NeynarAPIClient(neynarApiKey)

/**
 * Fetch feed for a specific Farcaster channel
 * @param channelId - Channel ID (e.g., "hiphop", "techno")
 * @param limit - Number of casts to fetch (max 100)
 * @param cursor - Pagination cursor for subsequent pages
 */
export async function fetchChannelFeed(
  channelId: string,
  limit: number = 50,
  cursor?: string
) {
  try {
    const response = await neynarClient.fetchFeed({
      feedType: 'filter',
      filterType: 'channel_id',
      channelId: channelId,
      limit: limit,
      cursor: cursor
    })

    return {
      casts: response.casts,
      nextCursor: response.next?.cursor
    }
  } catch (error) {
    console.error(`Error fetching channel feed for ${channelId}:`, error)
    throw error
  }
}

/**
 * Look up cast conversation (thread with replies)
 * Reused from existing neynar integration architecture
 */
export async function fetchCastConversation(castHash: string) {
  try {
    const response = await neynarClient.lookupCastConversation({
      identifier: castHash,
      type: 'hash',
      replyDepth: 5,
      includeChronologicalParentCasts: false
    })

    return response.conversation
  } catch (error) {
    console.error(`Error fetching conversation for ${castHash}:`, error)
    throw error
  }
}
```

**Rationale:**
- Thin wrapper around Neynar SDK for easy mocking in tests
- Reuses existing patterns from neynar-farcaster-integration-architecture.md
- Centralized error handling
- Environment variable configuration

#### Step 3: Channel Sync Service

**File:** `/backend/lib/channel-sync.ts`

```typescript
import { fetchChannelFeed } from './neynar'
import { getSupabaseClient } from './api-utils'
import { extractAndStoreMusicMetadata } from './music-extraction'

interface SyncResult {
  channelId: string
  newThreads: number
  newReplies: number
  errors: string[]
}

/**
 * Sync casts from a Farcaster channel to database
 * This is the core incremental sync logic
 */
export async function syncChannelCasts(
  channelId: string,
  maxPages: number = 5
): Promise<SyncResult> {
  const supabase = getSupabaseClient()
  const result: SyncResult = {
    channelId,
    newThreads: 0,
    newReplies: 0,
    errors: []
  }

  try {
    let cursor: string | undefined = undefined
    let pagesProcessed = 0

    while (pagesProcessed < maxPages) {
      // Fetch page of casts from Neynar
      const { casts, nextCursor } = await fetchChannelFeed(channelId, 50, cursor)

      if (!casts || casts.length === 0) {
        break
      }

      for (const cast of casts) {
        try {
          // Check if cast already exists
          const { data: existingCast } = await supabase
            .from('cast_nodes')
            .select('node_id')
            .eq('node_id', cast.hash)
            .single()

          if (existingCast) {
            // Cast already exists, skip
            continue
          }

          // Determine if this is a thread (root) or reply
          const isReply = !!cast.parent_hash
          const isThread = !isReply

          // Extract music URLs from embeds
          const musicUrls = extractMusicUrlsFromEmbeds(cast.embeds)

          // Insert cast_node
          const { error: castError } = await supabase
            .from('cast_nodes')
            .insert({
              node_id: cast.hash,
              cast_text: cast.text,
              author_fid: cast.author.fid.toString(),
              parent_cast_hash: cast.parent_hash || null,
              root_parent_hash: cast.root_parent_url ? extractHashFromUrl(cast.root_parent_url) : null,
              channel_id: channelId,
              parent_url: cast.parent_url,
              created_at: new Date(cast.timestamp)
            })

          if (castError) {
            result.errors.push(`Failed to insert cast ${cast.hash}: ${castError.message}`)
            continue
          }

          // Store user data (upsert to handle updates)
          await supabase
            .from('user_nodes')
            .upsert({
              node_id: cast.author.fid.toString(),
              fname: cast.author.username,
              display_name: cast.author.display_name,
              avatar_url: cast.author.pfp_url
            }, {
              onConflict: 'node_id',
              ignoreDuplicates: false
            })

          // Create AUTHORED interaction edge
          await supabase
            .from('interaction_edges')
            .insert({
              source_id: cast.author.fid.toString(),
              cast_id: cast.hash,
              edge_type: 'AUTHORED',
              created_at: new Date(cast.timestamp)
            })

          // If music URLs found, extract metadata (fire-and-forget)
          if (musicUrls.length > 0) {
            extractAndStoreMusicMetadata(cast.hash, musicUrls).catch(err =>
              console.error('Background music extraction error:', err)
            )
          }

          // Increment counters
          if (isThread) {
            result.newThreads++
          } else {
            result.newReplies++
          }

        } catch (error: any) {
          result.errors.push(`Error processing cast ${cast.hash}: ${error.message}`)
        }
      }

      // Check for next page
      if (!nextCursor) {
        break
      }

      cursor = nextCursor
      pagesProcessed++
    }

  } catch (error: any) {
    result.errors.push(`Channel sync failed: ${error.message}`)
  }

  return result
}

/**
 * Sync all channels in database
 * This runs periodically to keep channel feeds fresh
 */
export async function syncAllChannels(maxPagesPerChannel: number = 3): Promise<SyncResult[]> {
  const supabase = getSupabaseClient()

  // Get list of active channels
  const { data: channels, error } = await supabase
    .from('channels')
    .select('id')
    .eq('is_visible', true)
    .eq('is_archived', false)

  if (error || !channels) {
    console.error('Error fetching channels for sync:', error)
    return []
  }

  // Sync each channel
  const results: SyncResult[] = []
  for (const channel of channels) {
    console.log(`Syncing channel: ${channel.id}`)
    const result = await syncChannelCasts(channel.id, maxPagesPerChannel)
    results.push(result)
    console.log(`Synced ${channel.id}: ${result.newThreads} threads, ${result.newReplies} replies`)
  }

  return results
}

/**
 * Helper: Extract music URLs from Neynar cast embeds
 */
function extractMusicUrlsFromEmbeds(embeds: any[]): string[] {
  if (!embeds) return []

  const musicUrls: string[] = []
  const musicPlatforms = ['youtube.com', 'youtu.be', 'spotify.com', 'soundcloud.com']

  for (const embed of embeds) {
    if (embed.url) {
      const url = embed.url.toLowerCase()
      if (musicPlatforms.some(platform => url.includes(platform))) {
        musicUrls.push(embed.url)
      }
    }
  }

  return musicUrls
}

/**
 * Helper: Extract cast hash from Farcaster URL
 */
function extractHashFromUrl(url: string): string | null {
  const match = url.match(/\/0x[a-f0-9]+$/i)
  return match ? match[0].substring(1) : null
}
```

**Rationale:**
- Incremental sync: Only processes new casts (checks for existing by hash)
- Respects Neynar rate limits with pagination limits
- Fire-and-forget music extraction (doesn't block sync)
- Comprehensive error handling and reporting
- Can sync single channel or all channels
- Returns detailed results for monitoring

#### Step 4: Sync API Endpoint (Admin/Cron)

**File:** `/backend/api/channels.ts` (add to existing file)

```typescript
/**
 * POST /api/channels/sync
 * Trigger background sync for all channels (admin/cron only)
 *
 * In production, this should be:
 * 1. Protected by admin auth
 * 2. Called by a cron job (every 15-30 minutes)
 * 3. Or triggered by webhook from Neynar
 */
app.post('/sync', async (c) => {
  try {
    // TODO: Add admin authentication check here
    // const apiKey = c.req.header('X-Admin-API-Key')
    // if (apiKey !== process.env.ADMIN_API_KEY) {
    //   return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } }, 401)
    // }

    const { syncAllChannels } = await import('../lib/channel-sync')

    // Run sync (async, returns immediately)
    syncAllChannels(3).then(results => {
      console.log('Channel sync completed:', results)
    }).catch(error => {
      console.error('Channel sync failed:', error)
    })

    return c.json({
      status: 'sync_started',
      message: 'Channel sync initiated in background'
    })
  } catch (error) {
    console.error('Sync trigger error:', error)
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to start sync'
      }
    }, 500)
  }
})
```

**Rationale:**
- Manual sync trigger for development
- Foundation for cron-based sync in production
- Async execution doesn't block API response
- Should be protected by admin auth in production

#### Step 5: Python Pipeline for Historical Data (Optional)

For backfilling historical channel data, we can extend the existing Python pipelines:

**File:** `/data/pipelines/channel_importer/flow.py` (new pipeline)

```python
"""
Channel Importer Pipeline
Backfills historical channel data from Neynar API
"""

import asyncio
from datetime import datetime
from prefect import flow, task

@task(name="Import Channel Casts", log_prints=True)
async def import_channel_casts(channel_id: str, days_back: int = 30):
    """Import historical casts from a Farcaster channel"""
    # Implementation similar to existing data_importer
    # Calls Neynar API with time-based filtering
    # Stores in same cast_nodes table
    pass

@flow(name="Channel Import Flow")
async def channel_import_flow(channel_ids: list[str], days_back: int = 30):
    """Import historical data for multiple channels"""
    for channel_id in channel_ids:
        await import_channel_casts(channel_id, days_back)
```

**Note:** This is optional for MVP. The TypeScript sync service handles ongoing sync. Python pipeline is useful for:
- Initial backfill when launching a new channel
- Re-syncing historical data after schema changes
- Batch processing large amounts of historical data

---

## Frontend Layer

### Phase 5: Update Existing Frontend Components

**Goal:** Update the already-created ChannelsPage and ChannelViewPage to use real API data instead of mocks.

#### Step 1: API Service Functions

**File:** `/web-app/src/services/api.ts` (add to existing file)

```typescript
// Add to existing API service

/**
 * Fetch list of channels
 */
export async function fetchChannels(): Promise<Channel[]> {
  const response = await fetch(`${API_BASE_URL}/api/channels`)
  if (!response.ok) {
    throw new Error('Failed to fetch channels')
  }
  const data = await response.json()
  return data.channels
}

/**
 * Fetch channel details
 */
export async function fetchChannelDetails(channelId: string): Promise<ChannelDetails> {
  const response = await fetch(`${API_BASE_URL}/api/channels/${channelId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch channel details')
  }
  return await response.json()
}

/**
 * Fetch channel feed (threads for a channel)
 */
export async function fetchChannelFeed(
  channelId: string,
  cursor?: string
): Promise<{ threads: Thread[]; nextCursor?: string }> {
  const params = new URLSearchParams()
  if (cursor) params.set('cursor', cursor)

  const response = await fetch(
    `${API_BASE_URL}/api/channels/${channelId}/feed?${params.toString()}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch channel feed')
  }

  return await response.json()
}
```

**Rationale:**
- Consistent API interface with existing thread functions
- Type-safe with TypeScript
- Handles pagination with cursors
- Works for both web-app and mini-app (same backend)

#### Step 2: Update Type Definitions

**File:** `/shared/types/channels.ts` (new file)

```typescript
/**
 * Shared type definitions for channels
 * Used by both frontend and backend
 */

export interface Channel {
  id: string
  name: string
  description: string
  parentUrl: string
  isOfficial: boolean
  iconUrl?: string
  colorHex?: string
  stats: {
    threadCount: number
    lastActivity?: string
  }
}

export interface ChannelDetails extends Channel {
  bannerUrl?: string
  stats: {
    threadCount: number
    totalLikes: number
    totalReplies: number
    uniqueContributors: number
    lastActivity?: string
  }
  createdAt: string
}

export interface ChannelSortOption {
  value: 'hot' | 'active' | 'a-z'
  label: string
}
```

#### Step 3: Update ChannelsPage (Web App)

**File:** `/web-app/src/pages/ChannelsPage.tsx`

Replace mock data with real API calls:

```typescript
import { Component, onMount, createSignal, createMemo, createResource } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import ChannelList from '../components/channels/ChannelList';
import ChannelSortBar, { ChannelSortOption } from '../components/channels/ChannelSortBar';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import TerminalHeader from '../components/layout/Header/TerminalHeader';
import { fetchChannels } from '../services/api';
import anime from 'animejs';
import './channelsPage.css';

const ChannelsPage: Component = () => {
  const navigate = useNavigate();
  const [currentSort, setCurrentSort] = createSignal<ChannelSortOption>('hot');

  // Fetch channels from API
  const [channelsData] = createResource(fetchChannels);

  // Sort channels based on current sort option
  const sortedChannels = createMemo(() => {
    const channels = channelsData();
    if (!channels) return [];

    const sorted = [...channels];

    switch (currentSort()) {
      case 'hot':
        // Sort by thread count (most active first)
        return sorted.sort((a, b) => b.stats.threadCount - a.stats.threadCount);

      case 'active':
        // Sort by last activity
        return sorted.sort((a, b) => {
          const aTime = a.stats.lastActivity ? new Date(a.stats.lastActivity).getTime() : 0;
          const bTime = b.stats.lastActivity ? new Date(b.stats.lastActivity).getTime() : 0;
          return bTime - aTime;
        });

      case 'a-z':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));

      default:
        return sorted;
    }
  });

  // Handle channel click - navigate to channel feed
  const handleChannelClick = (channelId: string) => {
    navigate(`/channels/${channelId}`);
  };

  // Handle sort change with fade animation
  const handleSortChange = (newSort: ChannelSortOption) => {
    const content = document.querySelector('.channel-list-content');
    if (!content) return;

    // Fade out
    anime({
      targets: content,
      opacity: [1, 0],
      duration: 150,
      easing: 'easeOutQuad',
      complete: () => {
        setCurrentSort(newSort);

        // Fade in
        anime({
          targets: content,
          opacity: [0, 1],
          duration: 200,
          easing: 'easeInQuad'
        });
      }
    });
  };

  // Entrance animation on mount
  onMount(() => {
    const rows = document.querySelectorAll('.channel-row-group');
    anime({
      targets: rows,
      opacity: [0, 1],
      translateX: [-20, 0],
      delay: anime.stagger(30),
      duration: 400,
      easing: 'easeOutQuad'
    });
  });

  return (
    <div class="channels-page">
      <TerminalHeader
        title="JAMZY::CHANNEL_BROWSER"
        path="~/channels"
        command="list --all"
        statusInfo={`CHANNELS: ${sortedChannels().length}`}
        borderColor="magenta"
        class="channels-terminal-header"
      >
        <h1 class="channels-title">Channels</h1>
      </TerminalHeader>

      <main class="channels-main" role="main">
        <ChannelSortBar
          currentSort={currentSort()}
          onSortChange={handleSortChange}
        />

        <Show when={channelsData.loading}>
          <div class="loading-state">Loading channels...</div>
        </Show>

        <Show when={channelsData.error}>
          <div class="error-state">Failed to load channels</div>
        </Show>

        <Show when={!channelsData.loading && !channelsData.error}>
          <ChannelList
            channels={sortedChannels()}
            onChannelClick={handleChannelClick}
          />
        </Show>
      </main>

      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default ChannelsPage;
```

**Changes:**
- Replace mock data with `createResource(fetchChannels)`
- Update navigation to use channel ID (not thread ID)
- Add loading and error states
- Remove hardcoded thread IDs

#### Step 4: Update ChannelViewPage (Mini App)

**File:** `/mini-app/src/pages/ChannelViewPage.tsx`

Replace thread data with channel feed:

```typescript
import { Component, createSignal, For, createMemo, Show, createResource } from 'solid-js';
import { useParams, A } from '@solidjs/router';
import ChannelCard from '../components/channels/ChannelCard';
import { ThreadCard } from '../components/common/TrackCard/NEW';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import TerminalHeader from '../components/layout/Header/TerminalHeader';
import ThreadActionsBar from '../components/thread/ThreadActionsBar';
import AddTrackModal from '../components/library/AddTrackModal';
import { setCurrentTrack, setIsPlaying, Track } from '../stores/playerStore';
import { fetchChannelDetails, fetchChannelFeed } from '../services/api';
import './channelView.css';

const ChannelViewPage: Component = () => {
  const params = useParams();
  const channelId = () => params.id;

  // Fetch channel details
  const [channelData] = createResource(channelId, fetchChannelDetails);

  // Fetch channel feed (threads)
  const [feedData] = createResource(channelId, (id) => fetchChannelFeed(id));

  // Modal state
  const [showAddTrackModal, setShowAddTrackModal] = createSignal(false);

  const handleAddTrack = () => {
    setShowAddTrackModal(true);
  };

  const handleTrackSubmit = async (data: { songUrl: string; comment: string }) => {
    // TODO: Call API to create thread in channel
    console.log('Track submitted to channel:', data);
    setShowAddTrackModal(false);
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  return (
    <div class="channel-view-page">
      <TerminalHeader
        title="JAMZY::CHANNEL_VIEW"
        path={`~/channels/${channelId()}`}
        command="cat channel"
        statusInfo={channelData()?.stats.threadCount ? `THREADS: ${channelData()!.stats.threadCount}` : ''}
        borderColor="magenta"
        class="channel-view-header"
        additionalContent={
          <A href="/channels" class="channel-view-back-btn">
            <span>[</span>
            <span>← BACK</span>
            <span>]</span>
          </A>
        }
      />

      <div class="channel-view-content">
        <Show when={channelData.loading || feedData.loading}>
          <div class="loading-state">Loading channel...</div>
        </Show>

        <Show when={channelData.error || feedData.error}>
          <div class="error-state">Error loading channel</div>
        </Show>

        <Show when={!channelData.loading && !feedData.loading && channelData() && feedData()}>
          {/* Channel Header */}
          <div class="channel-header-wrapper">
            <ChannelCard
              channelId={channelData()!.id}
              channelName={channelData()!.name}
              channelDescription={channelData()!.description}
              stats={channelData()!.stats}
              colorHex={channelData()!.colorHex}
            />
          </div>

          {/* Add Track Button */}
          <div class="channel-actions">
            <button onClick={handleAddTrack} class="add-track-button">
              [+ ADD TRACK]
            </button>
          </div>

          {/* Threads Feed */}
          <Show when={feedData()!.threads.length > 0}>
            <div class="threads-section-header">
              <span>├─</span>
              <span style={{ color: 'var(--neon-magenta)' }}>TRACKS</span>
              <span> [</span>
              <span class="thread-count">{feedData()!.threads.length}</span>
              <span>]</span>
              <span style={{ 'margin-left': 'auto' }}>─┤</span>
            </div>

            <div class="threads-list">
              <For each={feedData()!.threads}>
                {(thread) => (
                  <div class="thread-wrapper">
                    <ThreadCard
                      threadId={thread.castHash}
                      threadText={thread.text}
                      creatorUsername={thread.author.username}
                      creatorAvatar={thread.author.pfpUrl}
                      timestamp={thread.timestamp}
                      replyCount={thread.stats.replies}
                      likeCount={thread.stats.likes}
                      starterTrack={thread.music[0] ? {
                        id: thread.music[0].id,
                        title: thread.music[0].title,
                        artist: thread.music[0].artist,
                        albumArt: thread.music[0].thumbnail,
                        source: thread.music[0].platform,
                        url: thread.music[0].url,
                        sourceId: thread.music[0].platformId
                      } : undefined}
                      onTrackPlay={playTrack}
                    />
                  </div>
                )}
              </For>
            </div>
          </Show>

          <Show when={feedData()!.threads.length === 0}>
            <div class="empty-state">
              <p>No tracks in this channel yet.</p>
              <p>Be the first to add one!</p>
            </div>
          </Show>
        </Show>
      </div>

      <MobileNavigation class="pb-safe" />

      <AddTrackModal
        isOpen={showAddTrackModal()}
        onClose={() => setShowAddTrackModal(false)}
        onSubmit={handleTrackSubmit}
        title="Add Track to Channel"
      />
    </div>
  );
};

export default ChannelViewPage;
```

**Changes:**
- Fetch channel details and feed separately
- Display channel metadata in header
- Show feed of threads (not single thread with replies)
- Add "Add Track" functionality (posts new thread to channel)
- Empty state for channels with no threads yet

#### Step 5: Update Routing

**File:** `/web-app/src/App.tsx` and `/mini-app/src/App.tsx`

```typescript
// Update routes to use channel ID instead of thread ID

// Replace:
// <Route path="/channel/:id" component={ChannelViewPage} />

// With:
<Route path="/channels" component={ChannelsPage} />
<Route path="/channels/:id" component={ChannelViewPage} />
```

### Phase 6: Thread Creation with Channel Support

**Goal:** Allow users to create threads and associate them with channels.

#### Update Thread Creation UI

**File:** `/mini-app/src/components/library/AddTrackModal.tsx` (update existing)

```typescript
// Add channel selection dropdown

const [selectedChannel, setSelectedChannel] = createSignal<string | null>(null);
const [channelsData] = createResource(fetchChannels);

// In form:
<div class="form-field">
  <label>Channel (optional)</label>
  <select
    value={selectedChannel() || ''}
    onChange={(e) => setSelectedChannel(e.target.value || null)}
  >
    <option value="">No channel</option>
    <For each={channelsData()}>
      {(channel) => (
        <option value={channel.id}>{channel.name}</option>
      )}
    </For>
  </select>
</div>
```

#### Update Thread Creation API

**File:** `/backend/api/threads.ts` (update existing endpoint)

```typescript
app.post('/', async (c) => {
  const body = await c.req.json()
  const { text, trackUrls, userId, channelId } = body  // Add channelId

  // ... existing validation ...

  // If channelId provided, validate it exists
  if (channelId) {
    const { data: channel } = await supabase
      .from('channels')
      .select('id, parent_url')
      .eq('id', channelId)
      .single()

    if (!channel) {
      return c.json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Invalid channel ID'
        }
      }, 400)
    }

    // Add channel info to cast_node insert
    // Insert cast_node with channel
    await supabase
      .from('cast_nodes')
      .insert({
        node_id: castHash,
        cast_text: text,
        author_fid: userId,
        parent_cast_hash: null,
        root_parent_hash: null,
        channel_id: channelId,  // NEW
        parent_url: channel.parent_url,  // NEW
        created_at: timestamp
      })
  }

  // ... rest of existing logic ...
})
```

**Rationale:**
- Optional channel selection (maintains backward compatibility)
- Validates channel exists before inserting
- Stores both channel_id and parent_url for filtering

---

## Implementation Roadmap

### Week 1: Database & Backend Foundation

**Day 1-2: Database Layer**
- [ ] Create and run migration: `20251014000000_add_channel_support.sql`
- [ ] Create and run migration: `20251014000001_create_channels_table.sql`
- [ ] Create and run migration: `20251014000002_seed_jamzy_channels.sql`
- [ ] Test migrations on local database
- [ ] Verify indexes are created properly

**Day 3-4: PostgreSQL Functions**
- [ ] Create `get_channels_list.sql` function
- [ ] Create `get_channel_feed.sql` function
- [ ] Create `get_channel_details.sql` function
- [ ] Test functions with sample queries
- [ ] Grant appropriate permissions

**Day 5-7: Backend API**
- [ ] Install Neynar SDK: `bun add @neynar/nodejs-sdk`
- [ ] Create `/backend/lib/neynar.ts` client wrapper
- [ ] Create `/backend/api/channels.ts` with all endpoints
- [ ] Update `/backend/server.ts` to mount channels routes
- [ ] Create `/backend/lib/channel-sync.ts` sync service
- [ ] Test all endpoints with Postman/curl
- [ ] Add error handling and logging

### Week 2: Frontend Integration & Data Sync

**Day 8-10: Frontend API Integration**
- [ ] Create `/shared/types/channels.ts` type definitions
- [ ] Update `/web-app/src/services/api.ts` with channel functions
- [ ] Update `/web-app/src/pages/ChannelsPage.tsx` to use real API
- [ ] Update `/mini-app/src/pages/ChannelViewPage.tsx` to use real API
- [ ] Test loading states and error handling
- [ ] Add pagination support (infinite scroll)

**Day 11-12: Thread Creation Updates**
- [ ] Update `AddTrackModal` with channel selection
- [ ] Update `/backend/api/threads.ts` POST endpoint for channels
- [ ] Test creating threads in channels
- [ ] Verify threads appear in channel feeds

**Day 13-14: Data Sync & Testing**
- [ ] Set up Neynar API account and get API key
- [ ] Test manual channel sync: `POST /api/channels/sync`
- [ ] Verify synced data appears in database and frontend
- [ ] Test full user flow: browse channels → view channel → see threads
- [ ] Test backward compatibility: existing threads still work

### Week 3: Polish & Production Readiness

**Day 15-16: Official Channels Setup**
- [ ] Create 3-5 official Farcaster channels on Warpcast
- [ ] Update channel seeds with real parent URLs
- [ ] Run initial historical sync for each channel
- [ ] Verify all channels populate with real data

**Day 17-18: Cron Job & Monitoring**
- [ ] Set up cron job to call `/api/channels/sync` every 30 minutes
- [ ] Add admin authentication to sync endpoint
- [ ] Implement logging and error monitoring
- [ ] Create alerts for sync failures

**Day 19-20: Testing & Bug Fixes**
- [ ] End-to-end testing of all features
- [ ] Performance testing (channel feed load times)
- [ ] Fix any bugs discovered
- [ ] Code review and refactoring

**Day 21: Deployment**
- [ ] Deploy database migrations to production
- [ ] Deploy backend updates to production
- [ ] Deploy frontend updates to production
- [ ] Monitor for errors and performance issues
- [ ] Announce channels feature to users

---

## Testing Strategy

### Unit Tests

**Database Functions:**
```sql
-- Test get_channels_list
SELECT * FROM get_channels_list(FALSE);

-- Test get_channel_feed
SELECT * FROM get_channel_feed('hip-hop', 10);

-- Test get_channel_details
SELECT * FROM get_channel_details('hip-hop');
```

**Backend Services:**
```typescript
// Test Neynar client
import { fetchChannelFeed } from './lib/neynar'
const result = await fetchChannelFeed('hiphop', 10)
console.log(result)

// Test channel sync
import { syncChannelCasts } from './lib/channel-sync'
const syncResult = await syncChannelCasts('hiphop', 2)
console.log(syncResult)
```

### Integration Tests

**API Endpoints:**
```bash
# Test channels list
curl http://localhost:3000/api/channels

# Test channel details
curl http://localhost:3000/api/channels/hip-hop

# Test channel feed
curl http://localhost:3000/api/channels/hip-hop/feed?limit=10

# Test sync (with auth)
curl -X POST http://localhost:3000/api/channels/sync \
  -H "X-Admin-API-Key: your-key"
```

### Manual Testing Checklist

**Frontend Flow:**
- [ ] Navigate to /channels page
- [ ] See list of channels with stats
- [ ] Sort channels by hot/active/a-z
- [ ] Click channel to view feed
- [ ] See channel header with description
- [ ] Scroll through threads in channel
- [ ] Click thread to view details and replies
- [ ] Create new thread in channel
- [ ] Verify thread appears in channel feed

**Backward Compatibility:**
- [ ] Navigate to /threads (existing threads feed)
- [ ] Verify existing threads without channels still work
- [ ] Create thread without channel selection
- [ ] Verify it appears in main feed but not channel feeds

**Edge Cases:**
- [ ] Empty channel (no threads yet)
- [ ] Channel with 1000+ threads (pagination)
- [ ] Very long channel descriptions
- [ ] Channels with no icon/banner
- [ ] Network errors during sync
- [ ] Duplicate casts from sync

---

## Deployment & Rollout

### Environment Variables

Add to `.env`:
```bash
# Neynar API
NEYNAR_API_KEY=your_neynar_api_key

# Admin API (for sync endpoint)
ADMIN_API_KEY=your_admin_api_key
```

### Database Migrations

```bash
# Run migrations in order
psql $DATABASE_URL < database/migrations/20251014000000_add_channel_support.sql
psql $DATABASE_URL < database/migrations/20251014000001_create_channels_table.sql
psql $DATABASE_URL < database/migrations/20251014000002_seed_jamzy_channels.sql
psql $DATABASE_URL < database/functions/get_channels_list.sql
psql $DATABASE_URL < database/functions/get_channel_feed.sql
psql $DATABASE_URL < database/functions/get_channel_details.sql
```

### Cron Job Setup (Production)

**Option 1: GitHub Actions (Recommended for Cloudflare Pages)**
```yaml
# .github/workflows/sync-channels.yml
name: Sync Channels

on:
  schedule:
    - cron: '*/30 * * * *'  # Every 30 minutes
  workflow_dispatch:  # Allow manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Sync
        run: |
          curl -X POST https://your-api.com/api/channels/sync \
            -H "X-Admin-API-Key: ${{ secrets.ADMIN_API_KEY }}"
```

**Option 2: Vercel Cron Jobs**
```typescript
// api/cron/sync-channels.ts
export const config = {
  schedule: '0 */30 * * * *'  // Every 30 minutes
}

export default async function handler(req, res) {
  // Verify cron secret
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Trigger sync
  const response = await fetch(`${process.env.API_URL}/api/channels/sync`, {
    method: 'POST',
    headers: { 'X-Admin-API-Key': process.env.ADMIN_API_KEY }
  })

  const result = await response.json()
  res.status(200).json(result)
}
```

### Monitoring & Alerts

**Key Metrics to Track:**
- Channel sync success rate
- Number of new threads/replies per sync
- API response times (channel list, feed, details)
- Neynar API error rates
- Database query performance

**Recommended Tools:**
- Sentry for error tracking
- LogRocket for session replay
- Grafana for metrics dashboards
- PagerDuty for critical alerts

### Rollback Plan

If issues arise after deployment:

1. **Frontend Rollback:**
   - Revert frontend deployment
   - Channels page will return to mock data (still functional)

2. **Backend Rollback:**
   - Revert `/backend/api/channels.ts` changes
   - Existing threads API continues working

3. **Database Rollback:**
   ```sql
   -- Remove channel columns (if needed)
   ALTER TABLE cast_nodes
     DROP COLUMN channel_id,
     DROP COLUMN parent_url;

   -- Drop channels table
   DROP TABLE channels CASCADE;

   -- Drop functions
   DROP FUNCTION get_channels_list;
   DROP FUNCTION get_channel_feed;
   DROP FUNCTION get_channel_details;
   ```

**Note:** Channel columns are nullable, so rollback doesn't break existing threads.

---

## Success Criteria

**MVP Launch Criteria:**
- [ ] Users can browse list of 3-5 curated music channels
- [ ] Channel feeds display threads from Farcaster channels
- [ ] Clicking a thread shows full details with replies
- [ ] Users can create threads and assign them to channels
- [ ] Data syncs from Farcaster every 30 minutes
- [ ] Existing threads functionality remains fully intact
- [ ] Both web-app and mini-app support channels

**Performance Targets:**
- Channels list loads in < 500ms
- Channel feed loads in < 1s (50 threads)
- Thread detail loads in < 800ms (thread + replies)
- Channel sync processes 50 casts in < 5s

**Quality Metrics:**
- Zero critical bugs in production after 1 week
- < 1% error rate on channel API endpoints
- 95%+ sync success rate
- Page load metrics within targets

---

## Future Enhancements (Post-MVP)

### Phase 2 Features

**Community Channels:**
- Allow users to create their own channels
- Community moderation tools
- Channel discovery page

**Advanced Filtering:**
- Filter channel feed by engagement (most liked, most replied)
- Time-based filters (today, this week, this month)
- User filters (following only)

**Channel Analytics:**
- Top contributors to each channel
- Trending threads within channels
- Channel growth metrics

**Notifications:**
- Subscribe to channels for new thread alerts
- Mention notifications within channel threads
- Daily/weekly channel digests

### Phase 3 Features

**Frames Integration:**
- Build Farcaster Frames for in-feed music playback
- Collaborative playlists within channels
- Voting and curation features

**AI Recommendations:**
- Suggest channels based on user's music taste
- Auto-tag threads with relevant channels
- "Related channels" suggestions

**Cross-Platform:**
- Export channel playlists to Spotify
- Share channels on other social platforms
- Embed channel feeds on external websites

---

## Appendix

### Database Schema Diagram

```
┌─────────────────┐
│    channels     │
├─────────────────┤
│ id (PK)         │
│ name            │
│ description     │
│ parent_url      │◄─────┐
│ is_official     │      │
│ is_curated      │      │
│ sort_order      │      │
│ color_hex       │      │
└─────────────────┘      │
                         │
                         │
┌─────────────────┐      │
│   cast_nodes    │      │
├─────────────────┤      │
│ node_id (PK)    │      │
│ cast_text       │      │
│ author_fid      │      │
│ parent_cast_hash│      │
│ channel_id      │──────┘
│ parent_url      │
│ created_at      │
└─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐
│ cast_music_edges│
├─────────────────┤
│ cast_id (FK)    │
│ music_*         │
└─────────────────┘
```

### API Response Examples

**GET /api/channels**
```json
{
  "channels": [
    {
      "id": "hip-hop",
      "name": "Hip Hop Heads",
      "description": "Golden era hip-hop and modern classics",
      "parentUrl": "https://farcaster.xyz/~/channel/hiphop",
      "isOfficial": true,
      "colorHex": "#FF6B35",
      "stats": {
        "threadCount": 127,
        "lastActivity": "2025-10-14T10:30:00Z"
      }
    }
  ]
}
```

**GET /api/channels/:id/feed**
```json
{
  "threads": [
    {
      "castHash": "0x123...",
      "text": "Check out this classic Nas track",
      "author": {
        "fid": "123",
        "username": "hiphophead",
        "displayName": "Hip Hop Head",
        "pfpUrl": "https://..."
      },
      "timestamp": "2025-10-14T10:00:00Z",
      "music": [
        {
          "id": "spotify-abc123",
          "title": "N.Y. State of Mind",
          "artist": "Nas",
          "platform": "spotify",
          "platformId": "abc123",
          "url": "https://open.spotify.com/track/abc123",
          "thumbnail": "https://..."
        }
      ],
      "stats": {
        "replies": 5,
        "likes": 12,
        "recasts": 3
      }
    }
  ],
  "nextCursor": "eyJjcmVhdGVkX2F0IjoiMjAyNS0xMC0xNFQxMDowMDowMFoiLCJpZCI6IjB4MTIzIn0="
}
```

### Glossary

- **Channel**: A curated music community on Farcaster (FIP-2 primitive)
- **Thread**: A root-level cast (parent_cast_hash IS NULL) that can have replies
- **Cast**: A Farcaster post (can be thread or reply)
- **Parent URL**: Farcaster channel URL (e.g., "https://farcaster.xyz/~/channel/hiphop")
- **Channel ID**: Short identifier for channel (e.g., "hip-hop")
- **Sync**: Process of fetching casts from Neynar API and storing in database
- **Incremental Sync**: Only processing new casts, not re-processing existing ones

---

## Questions & Decisions

### Resolved

**Q: Should we store channel_id or parent_url in cast_nodes?**
A: Both. channel_id for filtering (indexed), parent_url for Farcaster compatibility.

**Q: How do we handle casts posted directly to Farcaster channels (not via Jamzy)?**
A: Sync service imports all casts from channel, regardless of origin. Filter by parent_url.

**Q: Should existing threads be migrated to channels?**
A: No. Existing threads remain without channels (NULL channel_id). Backward compatible.

**Q: How often should we sync channels?**
A: Start with every 30 minutes. Optimize based on activity levels and Neynar rate limits.

### Open Questions

**Q: Should we support user-created channels?**
A: Not in MVP. Plan for Phase 2. Focus on curated channels first.

**Q: How do we handle channel moderation?**
A: MVP: Manual (admin flags casts). Phase 2: Community moderation tools.

**Q: Should we show threads in multiple channels?**
A: No. One thread = one channel. Keeps data model simple.

---

## Conclusion

This development plan provides a comprehensive, step-by-step guide to refactoring Jamzy from a thread-based system to a channel-based browsing experience. By following the zen principles of simplicity and maintainability, we've designed a solution that:

1. **Builds on existing infrastructure** - Minimal schema changes, reuses existing functions
2. **Maintains backward compatibility** - Existing threads continue working unchanged
3. **Enables powerful discovery** - Channels provide natural organization for music communities
4. **Scales gracefully** - Incremental sync and efficient queries handle growth
5. **Provides clear implementation path** - 3-week roadmap with concrete tasks

The architecture embraces the middle way: not over-engineered with complex abstractions, not under-engineered with quick hacks. Each component has a single, clear purpose. Each decision serves simplicity and maintainability.

Like water flowing naturally downhill, this implementation follows the path of least resistance while achieving all requirements. The result will be elegant, maintainable code that future developers can understand and extend with ease.

**Next Steps:**
1. Review this plan with the team
2. Set up project tracking (Linear, GitHub Projects, etc.)
3. Begin Week 1: Database & Backend Foundation
4. Iterate based on learnings and user feedback

May your code be simple, your bugs be few, and your music always be discovered.

---

*Generated by Claude Code (Zen Master Fullstack Developer) on 2025-10-14*
