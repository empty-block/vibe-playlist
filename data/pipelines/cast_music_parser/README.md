# Cast Music Parser

A Prefect-based pipeline for extracting structured music information from Farcaster casts using Claude API.

## 🎵 Overview

This module processes Farcaster casts from the "No Skip Albums" thread and extracts structured music information using Claude AI. It follows a simple, efficient data flow that balances cost optimization with processing quality.

## 🏗️ Architecture

**Core Data Flow:**
```
Dune API → Raw Casts → Supabase Storage → Claude API Processing → Structured Music Data → Supabase Storage
```

**Key Components:**

### 📋 **Database Schema**
- `no_skip_albums` table for raw cast data from Dune
- `music_extractions` table for processed music information
- Foreign key relationships and proper indexing for performance

### 🔄 **Prefect Flows**
- `process_no_skip_albums_music()` - Complete end-to-end processing
- `import_no_skip_albums_data_only()` - Import data from Dune only  
- `process_existing_casts_only()` - Process existing unprocessed casts

### 🤖 **Claude Integration**  
- Batch processing (15 casts per API call) for cost efficiency
- JSON-structured output with validation
- Confidence scoring for quality control
- Smart prompt engineering for music extraction

### 📊 **Features**
- **Progress tracking**: Automatically tracks processed vs unprocessed casts
- **Statistics**: Processing progress, confidence scores, music type breakdowns
- **Error handling**: Robust retries and graceful failure handling
- **Dry run support**: Test workflows without database writes

## 🚀 Usage

### Quick Start

```python
from app.cast_music_parser import (
    process_no_skip_albums_music,
    import_no_skip_albums_data_only,
    process_existing_casts_only
)

# Complete processing (import + extract)
await process_no_skip_albums_music()

# Just import data first
await import_no_skip_albums_data_only()

# Process existing backlog
await process_existing_casts_only(batch_size=10)
```

### Environment Setup

Required environment variables:
```bash
# Dune API
DUNE_API_KEY=your_dune_api_key

# Claude API  
ANTHROPIC_API_KEY=your_anthropic_api_key

# Supabase (automatically uses local or production based on SUPABASE_ENV)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# For local development
SUPABASE_ENV=local
SUPABASE_LOCAL_URL=http://127.0.0.1:54321
```

### Flow Parameters

#### `process_no_skip_albums_music()`
- `dry_run: bool = False` - Skip database writes (testing only)
- `skip_import: bool = False` - Skip data import, only process existing
- `batch_size: int = 15` - Casts per Claude API batch

#### `process_existing_casts_only()`
- `batch_size: int = 15` - Casts per Claude API batch  
- `dry_run: bool = False` - Skip database writes

#### `import_no_skip_albums_data_only()`
- `dry_run: bool = False` - Skip database writes

## 📁 Module Structure

```
cast_music_parser/
├── __init__.py              # Module exports
├── README.md               # This file
├── flow.py                 # Prefect flows with inline tasks
├── lib/
│   ├── claude.py          # Claude API integration
│   ├── db.py              # Database utilities  
│   └── dune.py            # Dune API utilities
└── docs/
    └── spec.md            # Detailed specification
```

## 💰 Cost Management

### Claude API Costs (Estimated)

**Claude 3 Haiku (Recommended):**
- **100K casts**: ~$150-300 total
- **Processing time**: 6-12 hours with batching
- **Quality**: Good for straightforward music references

**Claude 3.7 Sonnet (Higher Quality):**
- **100K casts**: ~$430-870 total  
- **Processing time**: 8-15 hours with batching
- **Quality**: Superior for complex/indie music references

### Optimization Features
- **Batch processing**: 15 casts per API call for cost efficiency
- **Smart retries**: Avoid reprocessing on failures
- **Progress tracking**: Resume processing from where it left off
- **Confidence scoring**: Quality metrics for manual review

## 🔧 Database Schema

### `no_skip_albums` Table
```sql
CREATE TABLE public.no_skip_albums (
  node_id TEXT PRIMARY KEY,
  cast_text TEXT NOT NULL,
  cast_created_at TIMESTAMP NOT NULL,
  embeds JSONB,
  author_fid BIGINT NOT NULL,
  author_fname TEXT,
  author_display_name TEXT,
  author_avatar_url TEXT,
  author_bio TEXT,
  cast_channel TEXT NOT NULL DEFAULT 'no_skip_albums'
);
```

### `music_extractions` Table
```sql
CREATE TABLE public.music_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id TEXT NOT NULL REFERENCES public.no_skip_albums(node_id),
  author_fid BIGINT NOT NULL,
  cast_created_at TIMESTAMP NOT NULL,
  cast_channel TEXT NOT NULL DEFAULT 'no_skip_albums',
  music_type TEXT NOT NULL CHECK (music_type IN ('song', 'album', 'playlist', 'artist')),
  title TEXT NOT NULL,
  artist TEXT,
  album TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  processed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  claude_model TEXT NOT NULL DEFAULT 'claude-3-haiku-20240307'
);
```

## 📊 Monitoring & Stats

```python
from app.cast_music_parser import get_processing_stats

# Get processing statistics
stats = await get_processing_stats()
print(f"Progress: {stats['processing_percentage']}%")
print(f"Avg confidence: {stats['avg_confidence']}")
print(f"Music types: {stats['music_types']}")
```

## 🛠️ Development

### Running Tests
```bash
# Dry run to test without database writes
await process_no_skip_albums_music(dry_run=True)

# Import only for testing
await import_no_skip_albums_data_only(dry_run=True)
```

### Local Development
Set `SUPABASE_ENV=local` to use local Supabase instance for development.

## 🔄 Migration Commands

```bash
# Apply database migrations
supabase migration up

# Or reset completely
supabase db reset
```

## 📈 Future Enhancements

- **Multimodal processing**: Album cover image analysis
- **External API enrichment**: Spotify/Apple Music metadata  
- **Advanced filtering**: Genre classification, release year extraction
- **Real-time processing**: Live cast processing as they're posted

## 🤝 Integration

This module integrates seamlessly with:
- **Jamzy data import pipelines**: Uses existing user/cast data
- **Main Supabase schema**: Follows established patterns
- **Prefect infrastructure**: Standard task/flow structure
- **Cost monitoring**: Built-in usage tracking 