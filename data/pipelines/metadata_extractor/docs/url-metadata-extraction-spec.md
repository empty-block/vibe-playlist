# URL Metadata Extraction Specification

## Overview
A simplified two-phase approach that stores raw metadata as-is and uses AI for all parsing and standardization. This eliminates complex parsing logic while maintaining high accuracy and future-proofing against platform changes.

## Architecture

### Phase 1: Raw Metadata Storage
**Simple Extraction Method:**
- Use `extruct` library to extract raw Open Graph, JSON-LD, and microdata from URLs
- Store the complete raw metadata as JSON strings without any parsing
- Platform detection for routing but no platform-specific extraction logic
- Resilient to platform changes since we store everything raw

**No Parsing, No Problems:**
- Eliminate regex patterns, field mapping, and complex parsing logic
- Store whatever metadata we get exactly as extracted
- Let AI handle all variations and edge cases in Phase 2

### Phase 2: AI-Powered Parsing
**AI Handles Everything:**
- Parse artist, title, album from any raw metadata format
- Handle all platform variations and format inconsistencies  
- Manage edge cases, typos, and format standardization
- Process different metadata schemas (OpenGraph vs JSON-LD vs microdata)

**Benefits:**
- No maintenance of complex parsing rules
- Automatic support for new platforms and format changes
- Better handling of edge cases than regex patterns
- Flexible extraction based on context

## Implementation Structure

### File Organization
```
jamzy/backend/pipelines/url_metadata/
├── __init__.py              # Module exports
├── README.md               # Documentation  
├── flow.py                 # Main Prefect flows
└── lib/
    ├── __init__.py
    ├── metadata_extractor.py  # Simple extruct-based raw extraction
    ├── db.py                  # Database operations
    └── rate_limiter.py        # Request throttling & management
```

### Core Libraries Used
**Primary Extraction (Simplified):**
- `extruct` - Extract all structured data (JSON-LD, Open Graph, microdata) without parsing
- `requests` - Basic HTTP requests with user agent rotation

**Removed Dependencies:**
- No `requests-html` (unnecessary complexity)
- No `yt-dlp` (use raw extraction)
- No `spotipy` (use raw extraction)
- No platform-specific libraries

**Built-in Tools:**
- `urllib.parse` - Basic URL parsing for platform detection
- `json` - Store raw metadata as JSON strings

### Database Schema

**Simplified Storage:**
```sql
CREATE TABLE url_metadata_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  url_domain TEXT, -- Domain extracted from URL (e.g., 'spotify.com', 'youtube.com')
  og_metadata TEXT, -- Complete Open Graph + structured metadata as JSON string
  extraction_success BOOLEAN NOT NULL,
  extraction_error TEXT,
  processed_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**AI Processing Results (Separate Table):**
```sql
CREATE TABLE url_metadata_parsed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extraction_id UUID REFERENCES url_metadata_extractions(id),
  artist TEXT,
  title TEXT,
  album TEXT,
  confidence_score DECIMAL,
  ai_model_version TEXT,
  parsed_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Processing Logic:**
1. Extract raw metadata from URL and store as JSON string
2. Batch process raw metadata through AI for parsing
3. Store parsed results with confidence scores
4. Use parsed results for application features

## Data Flow Example

### Raw Metadata Storage:
```json
{
  "url": "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh",
  "url_domain": "open.spotify.com",
  "og_metadata": "{\"opengraph\": [{\"title\": \"Song Name - Artist Name\", \"description\": \"Listen to Song Name by Artist Name on Spotify\", \"type\": \"music.song\"}]}",
  "extraction_success": true
}
```

### AI Parsing Prompt:
```
Extract song information from this Open Graph metadata:
{og_metadata}

Return JSON with: {"title": "...", "artist": "...", "album": "...", "confidence": 0.95}
```

### Parsed Results:
```json
{
  "extraction_id": "uuid-ref",
  "artist": "Artist Name", 
  "title": "Song Name",
  "album": null,
  "confidence_score": 0.95,
  "ai_model_version": "claude-3-sonnet"
}
```

## Benefits of Simplified Approach

**Technical:**
- 90% reduction in code complexity
- No regex patterns or parsing logic to maintain
- Automatic support for new platforms
- No breaking when platforms change metadata formats
- Future-proof against any platform updates

**Maintenance:**
- Eliminate most parsing bugs and edge cases
- No need to update code for new metadata formats
- AI handles all variations and improvements automatically
- Simple debugging (just check raw metadata)

**Performance:**
- Faster extraction (no complex parsing)
- Batch AI processing for efficiency
- Better error handling (either got metadata or didn't)

## Rate Limiting & Request Management

### Simplified Approach
Since we're only doing basic HTTP requests with `extruct`, rate limiting becomes simpler:

**Request Throttling:**
- 1-2 second delays between requests
- Exponential backoff for failed requests
- Simple retry logic without complex parsing considerations

**Request Disguising:**
- Basic user agent rotation
- Standard request headers
- No need for complex anti-detection since we're doing simple metadata extraction

**Monitoring:**
- Track success/failure rates
- Monitor for rate limiting or blocking
- Simple alerting for extraction failures

## Success Criteria
- Extract raw metadata from 95%+ of music links (higher than before due to simplicity)
- Store complete metadata without loss of information
- Enable AI to parse any metadata format with high accuracy
- Maintain functionality regardless of platform metadata changes
- Process links with minimal code maintenance overhead
