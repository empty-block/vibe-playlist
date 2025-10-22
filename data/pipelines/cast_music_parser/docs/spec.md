# Jamzy Cast Music Parser

## Project Overview

This module performs the final stage of music extraction from Farcaster casts for the Jamzy social music sharing app. It takes casts that have already had their URL metadata extracted and performs comprehensive AI analysis to produce standardized music data.

## Architecture Overview

```
Raw Casts → URL Metadata Extraction → Cast + Metadata Analysis → Standardized Music Data
     ↓              ↓                        ↓                         ↓
cast_nodes → embeds_metadata → Claude AI Processing → extracted_music_details
```

The pipeline operates as **Stage 2** of a two-stage process:
1. **Stage 1 (Complete)**: URL metadata extraction pipeline processes embed URLs → `embeds_metadata`
2. **Stage 2 (This Pipeline)**: Complete cast analysis using text + structured metadata → `extracted_music_details`

## New Two-Stage Architecture Benefits

### Enhanced Context for AI Analysis
- **Rich URL metadata**: AI receives structured metadata from Spotify, YouTube, SoundCloud, etc. instead of raw URLs
- **Complete cast context**: Analyzes cast text + all extracted metadata together
- **Higher accuracy**: Pre-extracted metadata provides much richer context than raw URLs
- **Cost efficiency**: No need to re-extract URL metadata during AI processing

### Input Data Enhancement
**Before**: Cast text + raw URLs + images
```
"loving this track! https://open.spotify.com/track/xyz"
```

**After**: Cast text + structured metadata
```
Cast text: "loving this track!"
URL metadata: "title - Stars As Eyes | artist - Robot Koch, Viktor Orri Árnason, Nordic Pulse | album - The Next Billion Years | year - 2020 | type - song | image - https://i.scdn.co/..."
```

## Database Schema Integration

### Input Tables
```sql
-- Cast content (unchanged)
cast_nodes (
  node_id text PRIMARY KEY,
  cast_text text NOT NULL,
  created_at timestamp NOT NULL,
  author_fid text NOT NULL,
  cast_channel text NULL
)

-- Pre-extracted URL metadata with direct cast relationship (optimized)
embeds_metadata (
  id uuid PRIMARY KEY,
  embed_id uuid NOT NULL,
  cast_id text NOT NULL, -- Direct reference for efficient queries
  url_domain text,
  og_metadata text, -- Structured metadata or JSON
  extraction_success boolean NOT NULL,
  processed_at timestamp NOT NULL
)

-- Links embeds to casts (still used for metadata extraction workflow)
embeds (
  id uuid PRIMARY KEY,
  cast_id text NOT NULL,
  embed_url text NOT NULL,
  embed_type text NOT NULL,
  created_at timestamp NOT NULL
)
```

### Output Table
```sql
-- Final structured music data (target output)
extracted_music_details (
  id uuid PRIMARY KEY,
  cast_id text NOT NULL,
  author_fid text NOT NULL,
  music_type text NOT NULL, -- 'song'|'album'|'playlist'|'artist'
  title text NOT NULL,
  artist text,
  album text,
  confidence_score decimal(3,2),
  ai_model_version text NOT NULL DEFAULT 'claude-3-sonnet',
  processed_at timestamp NOT NULL
)
```

## Processing Flow

### Flow Requirements
The pipeline must support:
- **Time-based filtering**: Process casts from specific date ranges using `start_time`/`end_time` parameters
- **Flexible model selection**: Choose Claude model based on quality/cost requirements
- **Batch processing**: Configurable batch sizes optimized for different models
- **Testing mode**: Small batch processing for development and validation

### Processing Strategy
1. **Cast Selection**: Identify unprocessed casts with music content potential
   - Casts with text content that might reference music
   - Casts with URLs that have extracted metadata
   - Apply time filters when specified
   
2. **Context Assembly**: Gather complete context for each cast
   - Original cast text
   - All extracted URL metadata for embedded links
   - User and temporal metadata for attribution

3. **AI Analysis**: Process complete context with configurable Claude model
   - Use both text and structured metadata together
   - Extract multiple music entries per cast when applicable
   - Generate confidence scores for quality assessment

4. **Data Storage**: Insert results into `extracted_music_details` table
   - Preserve cast attribution and timestamps
   - Track processing metadata for monitoring

## Model Selection Strategy

### Selection Guidelines
- **Development/Testing**: Use faster, cost-effective models for iteration
- **Production**: Use balanced accuracy/cost models for standard processing
- **High-Value Data**: Use highest accuracy models for complex/ambiguous references
- **Batch Size**: Adjust based on model complexity (larger batches for simpler models)

## Content Analysis Examples

### Text + URL Metadata Processing
- **Input**: Cast text expressing sentiment + structured metadata from embedded URLs
- **Output**: High-confidence music extraction combining both context sources
- **Benefit**: URL metadata provides definitive music details, text provides user sentiment/context

### Text-Only Processing  
- **Input**: Cast text mentioning artists, songs, or albums without URLs
- **Output**: Music extraction based solely on natural language processing
- **Consideration**: Lower confidence scores due to potential ambiguity

### Multiple URL Processing
- **Input**: Cast with multiple embedded music URLs + descriptive text
- **Output**: Multiple music entries extracted from comprehensive context
- **Advantage**: Single cast can contribute multiple items to user's music library

## Implementation Benefits

### Accuracy Improvements
- **Structured metadata context**: AI receives clean, parsed data instead of raw URLs
- **Complete cast analysis**: Text + all URL metadata analyzed together  
- **Platform-specific insights**: Spotify content types, YouTube durations, SoundCloud engagement

### Cost Optimization
- **Reduced token usage**: No URL parsing overhead in AI processing
- **Better batching efficiency**: More casts per batch due to cleaner input context
- **Higher success rates**: Better structured input reduces retry requirements

### Processing Efficiency  
- **Parallel pipeline architecture**: URL extraction and cast analysis operate independently
- **Incremental processing**: Only analyze casts with new or updated metadata
- **Scalable design**: Each pipeline stage optimized for its specific responsibilities

## Next Steps

### Usage Patterns
- **Recent cast processing**: Use time filters for incremental updates
- **Historical analysis**: Process specific date ranges with appropriate model selection
- **Testing and validation**: Small batch processing during development
- **Production deployment**: Balanced model selection for ongoing processing

### Implementation Priorities
1. Database integration with new schema
2. Context assembly and AI processing logic  
3. Testing with real cast and metadata data
4. Performance monitoring and optimization