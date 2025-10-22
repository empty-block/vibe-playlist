# Jamzy Database Schema

## Overview

This document defines the database schema for Jamzy's backend API, designed to support the social music discovery platform built on Farcaster.

## Core Tables

### music_library
Main table containing extracted music data from Farcaster casts.

**Primary Key:** `(cast_id, embed_index)`

| Column | Type | Description |
|--------|------|-------------|
| cast_id | text | Reference to the Farcaster cast |
| embed_index | integer | Index of embed within the cast |
| author_fid | text | Farcaster ID of the user who posted |
| music_type | text | Type: 'song', 'album', 'playlist', 'artist' |
| title | text | Track/album/playlist title |
| artist | text | Artist name (nullable) |
| album | text | Album name (nullable) |
| confidence_score | numeric(3,2) | AI confidence (0.0-1.0) |
| ai_model_version | text | AI model used for extraction |
| processed_at | timestamp | When AI processed this |
| platform_name | text | Music platform (spotify, youtube, etc.) |
| release_date | date | Release date (nullable) |
| genre | text[] | Array of genre tags |
| created_at | timestamp | When cast was created |

### user_nodes
Farcaster user information.

**Primary Key:** `node_id`

| Column | Type | Description |
|--------|------|-------------|
| node_id | text | Farcaster user ID |
| fname | text | Farcaster username |
| display_name | text | User's display name |
| avatar_url | text | Profile picture URL |

### cast_nodes
Farcaster cast/post information.

**Primary Key:** `node_id`

| Column | Type | Description |
|--------|------|-------------|
| node_id | text | Cast ID |
| cast_text | text | Cast content/text |
| created_at | timestamp | When cast was posted |
| author_fid | text | User who posted (FK to user_nodes) |
| cast_channel | text | Farcaster channel (nullable) |

### cast_edges
Social interactions on casts (likes, replies, recasts).

**Primary Key:** `(source_user_id, cast_id, edge_type)`

| Column | Type | Description |
|--------|------|-------------|
| source_user_id | text | User performing action (FK to user_nodes) |
| target_user_id | text | Target user (nullable, FK to user_nodes) |
| cast_id | text | Cast being interacted with (FK to cast_nodes) |
| edge_type | enum | Type of interaction |
| created_at | timestamp | When interaction occurred |

### embeds_metadata
Metadata for links/embeds in casts.

**Primary Key:** `(cast_id, embed_index)`

| Column | Type | Description |
|--------|------|-------------|
| cast_id | text | Cast containing embed |
| embed_index | integer | Index of embed within cast |
| url | text | Original URL |
| url_domain | text | Domain of URL |
| og_metadata | text | Open Graph metadata (JSON) |
| processed_at | timestamp | When metadata was extracted |
| platform_name | text | Platform name |
| created_at | timestamp | When embed was created |

### music_sources
Configuration for supported music platforms.

**Primary Key:** `domain`

| Column | Type | Description |
|--------|------|-------------|
| domain | text | Platform domain (spotify.com, youtube.com) |
| platform_name | text | Internal platform identifier |
| display_name | text | Human-readable platform name |
| added_at | timestamp | When platform was added |
| is_active | boolean | Whether platform is currently supported |

## Key Indexes

- **music_library**: cast_id, author_fid, platform_name, release_date, genre (GIN), created_at
- **user_nodes**: fname
- **cast_nodes**: author_fid  
- **cast_edges**: source_user_id, target_user_id
- **embeds_metadata**: cast_id, platform_name, created_at
- **music_sources**: platform_name, display_name, is_active

## API Mapping Notes

For the `/api/library` endpoint, the main query will be against:
- **music_library** (primary data)
- **user_nodes** (user info) 
- **cast_edges** (social stats: likes, replies, recasts)
- **cast_nodes** (cast context)

The schema supports all parameters from the API spec:
- `users` → filter by `author_fid`
- `sources` → filter by `platform_name` 
- `tags` → filter by `genre` array
- `search` → search `title`, `artist`
- `dateRange`/`after`/`before` → filter by `created_at`
- Social stats → aggregate from `cast_edges`