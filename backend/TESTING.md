# Testing Trending API Endpoints

## Quick Start

### 1. Run All Tests (Automated + Visual Inspection)

```bash
cd backend
bun test-trending.ts
```

This will:
- ✅ Run automated unit tests
- 📊 Display trending tracks with real data
- 👥 Display top contributors with real data
- 🧮 Validate scoring algorithms
- 💾 Test cache performance

### 2. Run Only Automated Tests

```bash
cd backend
bun test backend/api/trending.test.ts backend/api/music.test.ts
```

### 3. Manual API Testing

Start the server:
```bash
cd backend
bun run server.ts
```

Then test endpoints:

**Trending Tracks:**
```bash
# Get top 10 trending tracks (7 day window)
curl http://localhost:4201/api/music/trending?limit=10

# Different timeframes
curl http://localhost:4201/api/music/trending?timeframe=7d
curl http://localhost:4201/api/music/trending?timeframe=30d
curl http://localhost:4201/api/music/trending?timeframe=90d
```

**Trending Users:**
```bash
# Get top 10 contributors
curl http://localhost:4201/api/trending/users?limit=10
```

## What The Tests Validate

### Automated Tests (`trending.test.ts` & `music.test.ts`)

**Trending Tracks:**
- ✅ Returns correct data structure
- ✅ Supports limit and timeframe parameters
- ✅ Uses DISTINCT counting (shares, likes, replies)
- ✅ Calculates weighted engagement scores correctly
- ✅ Applies velocity multiplier
- ✅ Returns tracks in proper rank order
- ✅ Includes recent casts for context
- ✅ 5-minute cache works

**Trending Users:**
- ✅ Returns correct data structure
- ✅ Supports limit parameter
- ✅ Quality-adjusted scoring works (unique_engagers / sqrt(track_count))
- ✅ Returns users in proper rank order
- ✅ 5-minute cache works

### Visual Test Runner (`test-trending.ts`)

The test runner displays:
- 🔥 Top 10 trending tracks with engagement metrics
- 👥 Top 10 contributors with quality scores
- 🧮 Algorithm validation with step-by-step calculations
- 💾 Cache performance metrics
- 📊 Total statistics

## Algorithms

### Trending Tracks
```
weighted_score = (unique_shares × 10) + (unique_likes × 3) + (unique_replies × 2)
velocity_multiplier = (recent_3d_engagers / total_7d_engagers) + 1
final_score = weighted_score × velocity_multiplier
```

### Trending Users
```
score = unique_engagers / sqrt(track_count)
```

The square root penalty ensures quality over quantity - prevents users from gaming the system by spamming low-quality tracks.

## Expected Output Example

When you run `bun test-trending.ts`, you'll see:

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    🎵 JAMZY TRENDING API TEST SUITE 🎵                     ║
╚════════════════════════════════════════════════════════════════════════════╝

  API URL: http://localhost:4201

═══════════════════════════════════════════════════════════════════════════
  🧪 Running Automated Tests
═══════════════════════════════════════════════════════════════════════════

✅ All tests passed!

═══════════════════════════════════════════════════════════════════════════
  🔥 Trending Tracks (Last 7 Days)
═══════════════════════════════════════════════════════════════════════════

  Found 10 trending tracks
  Updated: 2025-10-20T19:30:00.000Z
  Cached: No

  🔥 #1 Song Title
      by Artist Name
      spotify:track123
      📊 Score: 45.67 | Shares: 3 | Likes: 8 | Replies: 2
      💬 Recent: "This track is fire! 🔥..."

  🔥 #2 Another Track
      by Another Artist
      ...
```

## Troubleshooting

### "Cannot find package 'hono'"
```bash
cd backend
bun install
```

### "supabaseUrl is required"
Create a `.env` file in the backend folder:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

### "No trending tracks found"
- Make sure you have activity data in the last 7 days
- Check that your database has cast_music_edges and interaction_edges data
- Try a longer timeframe: `?timeframe=30d` or `?timeframe=90d`

### Tests fail but API works
- This might indicate edge cases in your data
- Check the test output for specific failures
- The visual test runner will still show you the data

## CI/CD Integration

To run tests in CI:

```bash
# Run all tests
bun test backend/api/*.test.ts

# Run specific test files
bun test backend/api/trending.test.ts backend/api/music.test.ts

# Run with coverage (if configured)
bun test --coverage
```

## Performance Benchmarks

Expected performance (with ~500 tracks, ~3k interactions):

- **Initial calculation:** 100-300ms
- **Cached request:** <10ms
- **Cache TTL:** 5 minutes
- **API response size:** ~5-15KB for 10 results

As data grows, consider:
- Adding database indexes on created_at columns
- Implementing pagination for large result sets
- Adjusting cache TTL based on usage patterns
