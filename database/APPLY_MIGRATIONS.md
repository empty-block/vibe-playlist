# Applying Channels Migrations

## Overview

This document explains how to apply the new channels-related database migrations to your remote Supabase database.

## Created Migrations & Functions

### Migrations (run in order):
1. **20251014000000_create_missing_thread_functions.sql** - Adds missing thread functions
2. **20251014000001_create_channels_table.sql** - Creates channels metadata table
3. **20251014000002_seed_channels.sql** - Seeds initial channel data

### Functions (run after migrations):
1. **get_channels_list.sql** - List all channels with stats
2. **get_channel_feed.sql** - Get threads for a specific channel
3. **get_channel_details.sql** - Get detailed channel information

## Option 1: Apply via Supabase SQL Editor (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each file in order:

```sql
-- Step 1: Run migration 20251014000000
-- Copy/paste contents of database/migrations/20251014000000_create_missing_thread_functions.sql

-- Step 2: Run migration 20251014000001
-- Copy/paste contents of database/migrations/20251014000001_create_channels_table.sql

-- Step 3: Run migration 20251014000002
-- Copy/paste contents of database/migrations/20251014000002_seed_channels.sql

-- Step 4: Run function get_channels_list
-- Copy/paste contents of database/functions/get_channels_list.sql

-- Step 5: Run function get_channel_feed
-- Copy/paste contents of database/functions/get_channel_feed.sql

-- Step 6: Run function get_channel_details
-- Copy/paste contents of database/functions/get_channel_details.sql
```

4. After each SQL execution, check for errors in the output panel

## Option 2: Apply via Supabase CLI

If you have Supabase CLI configured with your remote project:

```bash
# Apply migrations
supabase db push

# Or apply individually
cat database/migrations/20251014000000_create_missing_thread_functions.sql | supabase db execute
cat database/migrations/20251014000001_create_channels_table.sql | supabase db execute
cat database/migrations/20251014000002_seed_channels.sql | supabase db execute

# Apply functions
cat database/functions/get_channels_list.sql | supabase db execute
cat database/functions/get_channel_feed.sql | supabase db execute
cat database/functions/get_channel_details.sql | supabase db execute
```

## Verification

After applying all migrations, verify everything works:

```sql
-- Check channels table exists and has data
SELECT * FROM channels;

-- Check channel functions work
SELECT * FROM get_channels_list();
SELECT * FROM get_channel_feed('hip-hop', 10);
SELECT * FROM get_channel_details('hip-hop');

-- Check thread functions work
SELECT * FROM get_thread_with_replies('0x...');  -- Use a real cast hash
SELECT * FROM get_user_threads('123', 10);  -- Use a real user FID
```

## What Gets Created

### Tables:
- `channels` - Metadata for curated music channels

### Indexes:
- `idx_channels_is_visible` - For filtering visible channels
- `idx_channels_sort_order` - For ordered channel lists
- `idx_channels_is_official` - For official channel queries
- `idx_cast_nodes_channel` - For efficient channel filtering on cast_nodes

### Functions:
- `get_thread_with_replies(cast_hash)` - Get thread with all replies
- `get_user_threads(fid, limit, cursor)` - Get user's threads
- `get_channels_list(include_archived)` - List all channels
- `get_channel_feed(channel_id, limit, cursor)` - Get channel threads
- `get_channel_details(channel_id)` - Get channel info with stats

### Seed Data:
- 9 channels (5 official, 4 community)
- Updates ~50 existing cast_nodes to assign them to channels for testing

## Troubleshooting

**Error: "relation already exists"**
- Some migrations may be partially applied. Check what exists and skip those steps.

**Error: "function already exists"**
- Use `CREATE OR REPLACE FUNCTION` (already in the SQL files)

**Error: "column already exists"**
- The `channel` column already exists in cast_nodes, so we didn't add it again

**No data in channels table**
- Make sure you ran migration 20251014000002_seed_channels.sql

## Next Steps

After migrations are applied:
1. Test the functions in Supabase SQL Editor
2. Move on to creating the backend API endpoints
3. Update the frontend to use the real API
