# URL Metadata Extraction Pipeline

A Prefect-based pipeline for extracting structured metadata from music platform URLs using web scraping with intelligent fallback strategies.

## 🎵 Overview

This module processes URLs found in Farcaster casts and extracts structured music metadata through web scraping. It follows a simple, resilient approach that minimizes external dependencies while maximizing extraction success rates.

## 🏗️ Architecture

**Core Data Flow:**
```
Cast URLs → Web Scraping → Metadata Extraction → Rate Limiting → Supabase Storage
```

**Key Components:**

### 📋 **Database Schema**
- `url_metadata_extractions` table for scraped metadata and success tracking
- Integration with existing `cast_nodes` table for URL sources

### 🔄 **Prefect Flows**
- `extract_url_metadata()` - Process individual URLs for metadata
- `extract_urls_from_casts()` - Extract and process URLs from cast embeds  
- `process_cast_urls_only()` - Process existing unprocessed URLs

### 🌐 **Web Scraping Integration**  
- Primary: `extruct` for Open Graph and structured data extraction
- Fallback: `requests-html` for JavaScript-heavy sites
- Rate limiting and request throttling for sustainable scraping
- User agent rotation and anti-blocking measures

### 📊 **Features**
- **Progress tracking**: Automatically tracks processed vs unprocessed URLs
- **Rate limiting**: Built-in throttling to avoid platform blocking
- **Error handling**: Robust retries and graceful failure handling
- **Dry run support**: Test workflows without database writes
- **Platform detection**: Identifies music platforms for targeted handling

## 🚀 Usage

### Quick Start

```python
from jamzy.backend.pipelines.url_metadata import (
    extract_url_metadata,
    extract_urls_from_casts,
    process_cast_urls_only
)

# Extract metadata from URLs in cast embeds
await extract_urls_from_casts()

# Process specific URLs only
await extract_url_metadata(["https://open.spotify.com/track/..."])

# Process existing unprocessed URLs
await process_cast_urls_only(batch_size=10)
```

### Environment Setup

Required environment variables:
```bash
# Supabase (automatically uses local or production based on SUPABASE_ENV)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# For local development
SUPABASE_ENV=local
SUPABASE_LOCAL_URL=http://127.0.0.1:54321
```

### Flow Parameters

#### `extract_urls_from_casts()`
- `dry_run: bool = False` - Skip database writes (testing only)
- `batch_size: int = 20` - URLs per processing batch
- `rate_limit_delay: float = 1.0` - Seconds between requests

#### `process_cast_urls_only()`
- `batch_size: int = 20` - URLs per processing batch  
- `dry_run: bool = False` - Skip database writes
- `rate_limit_delay: float = 1.0` - Seconds between requests

#### `extract_url_metadata()`
- `urls: List[str]` - List of URLs to process
- `dry_run: bool = False` - Skip database writes

## 📁 Module Structure

```
url_metadata/
├── __init__.py              # Module exports
├── README.md               # This file
├── flow.py                 # Prefect flows with inline tasks
├── lib/
│   ├── __init__.py
│   ├── metadata_extractor.py  # Core web scraping logic
│   ├── db.py                  # Database utilities  
│   └── rate_limiter.py        # Request throttling
└── docs/
    └── url-metadata-extraction-spec.md  # Detailed specification
```

## 🔧 Libraries Used

**Primary (MVP):**
- `extruct` - Open Graph and structured data extraction
- `requests-html` - JavaScript-rendered content fallback

**Built-in:**
- `urllib.parse` - URL parsing and validation
- `time` - Rate limiting delays

**Potential Additions:**
- `yt-dlp` - YouTube metadata if basic extraction insufficient
- `spotipy` - Spotify API for richer metadata (requires keys)

## 🔧 Database Schema

### `url_metadata_extractions` Table
```sql
CREATE TABLE url_metadata_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  url_domain TEXT, -- Domain extracted from URL (e.g., 'spotify.com', 'youtube.com')
  og_metadata TEXT, -- Complete Open Graph + structured metadata as JSON
  extraction_success BOOLEAN NOT NULL,
  extraction_error TEXT,
  processed_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## 📊 Monitoring & Stats

```python
from jamzy.backend.pipelines.url_metadata.lib.db import get_extraction_stats

# Get processing statistics
stats = await get_extraction_stats()
print(f"Success rate: {stats['success_rate']}%")
print(f"Platform breakdown: {stats['platforms']}")
print(f"Total processed: {stats['total_processed']}")
```

## 🛠️ Development

### Running Tests
```bash
# Dry run to test without database writes
await extract_urls_from_casts(dry_run=True)

# Process small batch for testing
await process_cast_urls_only(batch_size=5, dry_run=True)
```

### Local Development
Set `SUPABASE_ENV=local` to use local Supabase instance for development.

## 🚀 Rate Limiting Strategy

**Built-in Protection:**
- 1-2 second delays between requests
- Exponential backoff for failed requests  
- User agent rotation
- Request timeout handling (5-10 seconds)

**Platform-Specific Handling:**
- Different rate limits per platform based on observed behavior
- Special handling for known restrictive platforms
- Graceful degradation when blocked

## 📈 Future Enhancements

- **AI standardization**: Claude integration for metadata cleanup
- **Platform-specific APIs**: Spotify, YouTube APIs when scraping insufficient
- **Advanced caching**: Redis for duplicate URL handling
- **Real-time processing**: Webhook integration for live URL processing

## 🤝 Integration

This module integrates with:
- **Cast processing pipelines**: Extracts URLs from cast embeds
- **Music library generation**: Provides metadata for user libraries
- **Main Supabase schema**: Follows established patterns
- **Prefect infrastructure**: Standard task/flow structure 