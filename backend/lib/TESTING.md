# Testing Guide for TASK-658: AI Extractor og_description Updates

## Running Automated Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test backend/lib/opengraph.test.ts
bun test backend/lib/ai-music-extractor.test.ts
bun test backend/lib/ai-queue-processor.test.ts

# Run tests in watch mode
bun test --watch
```

## Manual Testing Checklist

### 1. Database Verification

Verify the database schema was updated correctly:

```sql
-- Check og_description column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'music_library'
AND column_name = 'og_description';

-- Check index was created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'music_library'
AND indexname = 'idx_music_library_og_description';

-- Check get_next_ai_queue_batch function includes og_description
SELECT routine_name, data_type, ordinal_position, parameter_name
FROM information_schema.parameters
WHERE specific_name LIKE 'get_next_ai_queue_batch%'
ORDER BY ordinal_position;
```

### 2. OpenGraph Extraction Test

Test that og_description is extracted from real URLs:

```typescript
// backend/lib/test-opengraph.ts
import { fetchOpenGraph } from './opengraph'

const testUrls = [
  'https://open.spotify.com/track/6K4t31amVTZDgR3sKmwUJJ', // Kendrick Lamar - YAH.
  'https://www.youtube.com/watch?v=LDZX4ooRsWs', // Robot Koch - Stars As Eyes
  'https://open.spotify.com/track/3a1lNhkSLSkpJE4MSHpDu9' // Tyler, The Creator - See You Again
]

for (const url of testUrls) {
  console.log(`\n=== Testing: ${url} ===`)
  const result = await fetchOpenGraph(url)

  console.log('og_title:', result.og_title)
  console.log('og_artist:', result.og_artist)
  console.log('og_description:', result.og_description) // ← Should be populated!
  console.log('success:', result.success)
}
```

Run with:
```bash
bun run backend/lib/test-opengraph.ts
```

### 3. Database Upsert Test

Test that og_description is saved to the database:

```sql
-- Insert a test record
INSERT INTO music_library (
  platform_name,
  platform_id,
  url,
  og_title,
  og_artist,
  og_description,
  og_metadata,
  processing_status
) VALUES (
  'spotify',
  'test123',
  'https://open.spotify.com/track/test123',
  'Test Track',
  'Test Artist',
  'Test Artist · Test Track · Song · 2025',
  '{"site_name": "Spotify"}'::jsonb,
  'og_fetched'
)
ON CONFLICT (platform_name, platform_id)
DO UPDATE SET
  og_description = EXCLUDED.og_description,
  updated_at = NOW();

-- Verify it was saved
SELECT
  platform_name,
  platform_id,
  og_title,
  og_artist,
  og_description,
  processing_status
FROM music_library
WHERE platform_name = 'spotify' AND platform_id = 'test123';
```

### 4. AI Queue Processor Test

Test the full flow from queue to AI extraction:

```typescript
// backend/lib/test-queue-processor.ts
import { processBatch } from './ai-queue-processor'

async function testQueueProcessing() {
  console.log('Testing AI queue processing with og_description...')

  const result = await processBatch({
    batchSize: 5,
    model: 'claude-3-5-haiku-20241022'
  })

  console.log('\n=== Queue Processing Results ===')
  console.log('Total processed:', result.totalProcessed)
  console.log('Successful:', result.successful)
  console.log('Failed:', result.failed)
  console.log('Errors:', result.errors)

  // Check if extraction improved with og_description
  const successRate = result.totalProcessed > 0
    ? (result.successful / result.totalProcessed) * 100
    : 0

  console.log(`Success rate: ${successRate.toFixed(1)}%`)

  if (successRate < 80) {
    console.warn('⚠️  Success rate below 80% - check if og_description is being used')
  } else {
    console.log('✅ Success rate looks good!')
  }
}

testQueueProcessing()
```

Run with:
```bash
bun run backend/lib/test-queue-processor.ts
```

### 5. End-to-End Test with Real URLs

Test the complete flow with real music URLs:

```bash
# 1. Add test URLs to queue
curl -X POST http://localhost:3000/api/sync/manual \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://open.spotify.com/track/6K4t31amVTZDgR3sKmwUJJ",
      "https://www.youtube.com/watch?v=LDZX4ooRsWs"
    ]
  }'

# 2. Process queue
curl -X POST http://localhost:3000/api/process-queue

# 3. Check results
curl http://localhost:3000/api/library?search=YAH
curl http://localhost:3000/api/library?search=Stars%20As%20Eyes
```

### 6. Validation Queries

Check that og_description is improving extraction:

```sql
-- Check how many records have og_description populated
SELECT
  COUNT(*) as total_records,
  COUNT(og_description) as with_description,
  ROUND(COUNT(og_description)::numeric / COUNT(*)::numeric * 100, 2) as percentage
FROM music_library;

-- Check artist extraction improvement
-- Records with og_description should have better artist attribution
SELECT
  CASE
    WHEN og_description IS NOT NULL THEN 'With Description'
    ELSE 'Without Description'
  END as has_description,
  COUNT(*) as total,
  COUNT(artist) as with_artist,
  ROUND(COUNT(artist)::numeric / COUNT(*)::numeric * 100, 2) as artist_extraction_rate
FROM music_library
GROUP BY has_description;

-- Find records where og_description helped extract artist
SELECT
  platform_name,
  platform_id,
  og_title,
  og_artist,
  artist,
  og_description
FROM music_library
WHERE
  og_description IS NOT NULL
  AND artist IS NOT NULL
  AND (og_artist IS NULL OR og_artist != artist)
LIMIT 10;
```

## Expected Results

### Before og_description (TASK-658)
- Spotify artist field: Often null or incorrect
- YouTube artist field: Often shows channel name instead of artist
- AI extraction confidence: ~65-70%
- Unknown artists: ~30-35% of records

### After og_description (TASK-658)
- Spotify artist field: Extracted from description (Artist · Track · Song · Year)
- YouTube artist field: Parsed from "Provided to YouTube..." description
- AI extraction confidence: ~85-90%
- Unknown artists: <15% of records

## Troubleshooting

### Issue: og_description is null in database
**Check:**
1. Is the OpenGraph fetcher returning og_description?
2. Is upsertMusicLibrary including og_description in the record?
3. Run `fetchOpenGraph()` manually and check the result

### Issue: AI still producing "Unknown" artists
**Check:**
1. Is og_description being passed to the AI context?
2. Check the prompt being sent to Claude - does it include `description - ...`?
3. Verify the description contains artist info: `console.log(context.og_description)`

### Issue: Tests failing
**Check:**
1. Run `bun install` to ensure dependencies are up to date
2. Check TypeScript compilation: `bun run typecheck`
3. Verify database connection in tests

## Performance Monitoring

After deploying, monitor these metrics:

```sql
-- Daily extraction success rate
SELECT
  DATE(ai_processed_at) as date,
  COUNT(*) as processed,
  COUNT(CASE WHEN artist IS NOT NULL THEN 1 END) as with_artist,
  ROUND(AVG(confidence_score), 3) as avg_confidence
FROM music_library
WHERE ai_processed_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(ai_processed_at)
ORDER BY date DESC;

-- Platform-specific improvement
SELECT
  platform_name,
  COUNT(*) as total,
  COUNT(CASE WHEN og_description IS NOT NULL THEN 1 END) as with_description,
  ROUND(AVG(CASE WHEN artist IS NOT NULL THEN 1 ELSE 0 END), 3) as artist_rate
FROM music_library
GROUP BY platform_name;
```
