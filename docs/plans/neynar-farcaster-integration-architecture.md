# Neynar Farcaster Integration Architecture for Jamzy Threads

**Date:** 2025-10-03
**Related Task:** TASK-600
**Author:** Research Summary

---

## Executive Summary

This document outlines the MVP architecture for integrating Jamzy threads with Farcaster using the Neynar API. Users create threads in the Jamzy UI, we post casts to a dedicated Jamzy Farcaster channel, then use **incremental processing** to efficiently extract music metadata from replies.

**Core Architecture (MVP):**
- Users create threads via Jamzy frontend (miniapp has built-in auth)
- Backend posts to Farcaster (Jamzy channel) using user's credentials
- When viewing threads: fetch replies from Neynar, **only process NEW replies** with Claude
- Processed music metadata stored permanently in DB (no time-based cache)

**Key Innovation:** Incremental processing saves costs by only using Claude API on new replies, not re-processing the same replies multiple times.

**Related Documentation:**
- API Endpoints: `jamzy-miniapp-api-endpoints.md`
- Database Schema: `jamzy-miniapp-database-schema.md`

---

## Architecture Overview

### User Flow

**Thread Creation:**
```
User creates thread in Jamzy UI
    ↓
Backend calls Neynar API
    ↓
Cast posted to Farcaster (Jamzy channel)
    ↓
Thread stored in Jamzy DB
```

**Viewing Thread with Replies:**
```
User views thread in Jamzy UI
    ↓
Fetch current replies from Neynar API
    ↓
Compare with DB: Which replies are NEW?
    ↓
Process ONLY new replies with Claude (extract music metadata)
    ↓
Store processed replies in DB
    ↓
Display ALL replies (existing + new)
```

---

## Core Components

**Implementation Note:** These functions live in the shared `/backend` API:
- Thread operations: `/backend/api/threads.ts`
- Neynar client: `/backend/lib/neynar.ts`
- Music extraction: `/backend/lib/music-extraction.ts`

See `jamzy-miniapp-api-endpoints.md` for full API specification.

### 1. Thread Creation

**Function:** `createThread(userId, trackData, threadText)`
**Location:** `/backend/api/threads.ts`

**Steps:**
1. Get user from database
2. Call `neynarClient.publishCast()` with:
   - User's signer credentials
   - Thread text
   - Jamzy embed URL (`jamzy.app/thread/{id}`)
   - Channel: "jamzy"
3. Store thread in database with:
   - Thread ID
   - Cast hash (for fetching replies later)
   - Author FID
   - Track ID
   - Text & timestamp

**Key Points:**
- ✅ Post to Jamzy channel
- ✅ Include Jamzy embed for filtering
- ✅ Store immediately in DB
- ✅ Save cast hash for conversation fetching

---

### 2. Fetching & Processing Replies (Incremental Processing)

**Function:** `getThread(threadId)`
**Location:** `/backend/api/threads.ts`

**Steps:**
1. Get thread from database
2. Get already-processed replies from DB → create set of processed hashes
3. Fetch current conversation from Neynar: `lookupCastConversation(cast_hash)`
4. Filter for NEW replies (not in processed hashes set)
5. For each new reply:
   - Extract music URLs: `extractMusicUrls(reply.text, reply.embeds)`
   - If URL found → Call Claude: `extractMusicMetadata(url)`
   - Store reply in DB with:
     - Cast hash, author, text, timestamp
     - Music metadata (artist, track, platform)
     - Engagement metrics
6. Return ALL replies (existing + newly processed)

**Helper:** `extractMusicMetadata(url)`
**Location:** `/backend/lib/music-extraction.ts`
- Calls Claude API to parse artist/track/platform from URL
- Returns structured metadata
- Runs as fire-and-forget async (doesn't block thread/reply creation)

**Why Incremental Processing:**
- ✅ **Avoid re-processing**: Only new replies are sent to Claude API
- ✅ **Cost savings**: Don't pay for Claude to re-process same reply multiple times
- ✅ **Performance**: Most views are fast (no Claude calls if no new replies)
- ✅ **Always fresh**: Still fetch from Neynar every time to detect new replies
- ✅ **Permanent storage**: Processed metadata stored in DB

**Performance Breakdown:**
- **0 new replies** (~10 views/day): ~300ms (just Neynar fetch + DB lookup)
- **1 new reply**: ~800ms (Neynar + 1 Claude call)
- **5 new replies**: ~2.8s (Neynar + 5 Claude calls)

**Note:** There is NO time-based cache TTL. The DB stores permanently processed replies, and we only process new ones by comparing cast hashes.

---

## Why No Time-Based Cache?

**The Question:** Should we cache replies with a TTL (e.g., 60 seconds)?

**The Answer:** No - we use **incremental processing** instead.

### The Problem with Time-Based Caching

If we cached with a 60-second TTL:
```javascript
// ❌ Time-based cache approach (NOT recommended)
const cacheAge = Date.now() - thread.replies_cached_at;
if (cacheAge < 60_000) {
  return cachedReplies;  // Use cache
}

// Cache expired - re-fetch AND re-process ALL replies
const conversation = await neynarClient.lookupCastConversation(...);
await processAllRepliesWithClaude(conversation.cast.direct_replies);  // Expensive!
```

**Problems:**
- Re-processes ALL replies when cache expires (wastes Claude API calls)
- Pays for processing the same reply multiple times
- Unnecessary cost with low traffic (10 views/day = cache rarely reused)

### The Incremental Processing Solution

Instead, we **always fetch from Neynar** but **only process NEW replies**:

**Pseudocode:**
```
processedHashes = Set(existing replies' cast hashes)
conversation = neynarClient.lookupCastConversation(...)

newReplies = conversation.replies.filter(not in processedHashes)

for each newReply:
  processReplyWithClaude(newReply)
```

**Benefits:**
- ✅ Each reply processed exactly once (stored permanently)
- ✅ No wasted Claude API calls
- ✅ Always get fresh reply list from Neynar
- ✅ Simple logic - no TTL management

### Performance Comparison

**Time-Based Cache (60s TTL):**
- View 1 at 12:00 PM: Process 5 replies (~2.8s)
- View 2 at 12:00:30 PM: Use cache (~50ms)
- View 3 at 12:01:30 PM: Cache expired, re-process same 5 replies (~2.8s) ❌

**Incremental Processing:**
- View 1 at 12:00 PM: Process 5 new replies (~2.8s)
- View 2 at 12:00:30 PM: 0 new replies (~300ms)
- View 3 at 12:01:30 PM: 0 new replies (~300ms) ✅
- View 10 at 2:00 PM: 1 new reply (~800ms) ✅

**Result:** Incremental processing is faster AND cheaper for low-traffic threads.

---

## Handling External Posts to Jamzy Channel

**Challenge:** Farcaster is permissionless - anyone can post to the Jamzy channel.

**Open Question:** Should we filter by Jamzy embeds or allow all posts to the channel?

### Option A: Strict Embed Filtering (MVP Starting Point)
- Only process casts with `jamzy.app/thread/{id}` embeds
- Ensures you control what appears in Jamzy
- **Drawback:** Misses organic community posts with music URLs

### Option B: Open Channel (Community-Friendly)
- Process all posts to Jamzy channel
- Allows organic community engagement
- Direct music URL posts work without Jamzy embed
- **Drawback:** Needs moderation for spam/off-topic posts

### Considerations:
- **Replies to threads:** Should work either way (they won't have embeds but have parent_hash)
- **Text-only replies:** Valid engagement, shouldn't be filtered out
- **Direct music posts:** Could be valuable community content
- **Long-term vision:** Community music discovery channel vs. curated Jamzy threads

**Recommendation:** Start with Option A for MVP simplicity, evaluate moving to Option B based on usage patterns and moderation capacity.

---

## Implementation Checklist

### Phase 1: MVP Setup

- [ ] **Create Jamzy Farcaster Channel**
  - Create `/jamzy` channel in Warpcast
  - Note `parent_url` and `channel_id`
  - Add channel description and branding

- [ ] **Set Up Neynar Account & API Key**
  - Sign up at [neynar.com](https://neynar.com)
  - Get API key from dashboard
  - Review rate limits and pricing

- [ ] **Build Thread Creation** (`/backend/api/threads.ts`)
  - Implement `createThread()` function
  - Call `neynarClient.publishCast()` with:
    - Jamzy channel
    - Jamzy embed URL
    - User's auth (built into miniapp)
  - Store thread in DB with cast hash

- [ ] **Build Neynar Client** (`/backend/lib/neynar.ts`)
  - Wrapper around `@neynar/nodejs-sdk`
  - Handle auth and API calls
  - Export reusable client for all endpoints

- [ ] **Build Music Extraction** (`/backend/lib/music-extraction.ts`)
  - Implement `extractMusicMetadata()` function
  - Call Claude API to parse music URLs
  - Fire-and-forget async execution

- [ ] **Implement Reply Fetching & Processing** (`/backend/api/threads.ts`)
  - Build `getThread()` function
  - Call `lookupCastConversation()` to fetch replies
  - Implement incremental processing:
    - Compare with DB to find NEW replies
    - Extract music URLs
    - Call `extractMusicMetadata()` for new replies
    - Store processed replies permanently
  - Handle pagination for large threads

### Phase 2: Enhancements

- [ ] **Engagement Features**
  - Allow users to like/recast from Jamzy UI
  - Implement `publishReaction()` calls

- [ ] **Community Posts**
  - Allow external posts to Jamzy channel
  - Build moderation tools
  - Create "Community" tab in UI

- [ ] **Analytics & Insights**
  - Track thread engagement metrics
  - Popular threads, top contributors

### Phase 3: Advanced

- [ ] **Auto-Reply Bot**
  - Jamzy bot that welcomes new threads
  - Provides context/links

- [ ] **Frames Integration**
  - Build Farcaster Frames for rich playback
  - Direct music playback in Farcaster clients

---

## API Reference Summary

### Key Neynar SDK Methods

**`publishCast()`** - Post a cast
- signerUuid (user auth)
- text
- embeds (URLs)
- channel_id
- parent (optional, for replies)

**`lookupCastConversation()`** - Fetch thread replies
- identifier (cast hash/URL)
- type ("hash" or "url")
- reply_depth (max 5)
- sort_type ("chronological")
- viewer_fid (optional)

**`publishReaction()`** - Like/recast
- signerUuid
- reactionType ("like" or "recast")
- target (cast hash)

**`fetchFeed()`** - Get channel feed
- feedType, filterType
- channelId
- limit, cursor (pagination)

---

## Security Considerations

### Rate Limiting
- Implement rate limits on thread creation endpoint
- Prevent spam/abuse
- Monitor Neynar API rate limits (varies by tier)

### Content Moderation
- Store `reported` flag on threads/replies
- Implement user blocking/muting
- Respect Farcaster's native mutes/blocks (use `viewer_fid` in API calls)

---

## Testing Strategy

### Unit Tests
- Thread creation logic
- Reply fetching and incremental processing
- Music metadata extraction

### Integration Tests
- Full flow: create thread → store in DB
- Reply fetching with various nesting levels
- Claude API integration for metadata

### Manual Testing
- Create threads from Jamzy UI
- View threads in Warpcast
- Reply from external clients, verify sync to Jamzy
- Test external posts to channel (verify filtering)

---

## Monitoring & Alerts

### Key Metrics
- Thread creation success rate
- API error rates (Neynar, Claude)
- Reply fetch performance
- Incremental processing efficiency

### Alerts
- Neynar API errors (rate limits, auth issues)
- Claude API errors
- Database failures
- Unusual spike in thread creation (potential spam)

---

## Cost Estimation

### Neynar API Pricing (Check latest pricing)
- **Free Tier**: Limited requests, good for testing
- **Starter**: ~$99/mo - suitable for MVP
- **Pro/Enterprise**: Scale based on usage

### Claude API Pricing
- **Claude 3.5 Sonnet**: ~$3 per million input tokens, ~$15 per million output tokens
- **Estimated cost per music URL extraction**: ~$0.001 (assuming ~100 tokens in/out)

### Cost Analysis (Expected Traffic: ~10 views/day per thread)

**Per Thread Per Day:**
- Neynar API calls: ~10 (one per view) = ~$0.10
- Claude API calls: ~1-2 (only for new replies) = ~$0.002
- **Total**: ~$0.10/day/thread

**With Incremental Processing (Recommended):**
- Neynar API calls: ~10 (one per view) = ~$0.10
- Claude API calls: ~0.5 avg (only new replies, not every view) = ~$0.001
- **Total**: ~$0.10/day/thread

**Monthly Cost (100 active threads):**
- ~$300/mo in Neynar costs
- ~$5-10/mo in Claude costs
- **Total**: ~$310/mo

**Key Cost Drivers:**
- ✅ Neynar conversation API calls (per thread view)
- ✅ Number of casts published (thread creation)
- ✅ Claude API calls for music metadata extraction

**Cost Optimization:**
- ✅ **Incremental processing**: Only process NEW replies (saves 90%+ on Claude costs)
- ✅ **Permanent storage**: Never re-process same reply twice
- ⚠️ Consider caching Neynar conversation results if traffic increases significantly

---

## Alternative Architectures Considered

### ❌ Recast-Based Approach
**Concept:** Create `jamzy_threads` account, recast user threads, fetch recasts

**Issues:**
- Manual recasting required
- Extra intermediary step
- More API calls
- No clear advantage

### ❌ Polling-Based Sync
**Concept:** Periodically poll Jamzy channel feed for new casts

**Issues:**
- Increased latency (not real-time)
- More API calls (constant polling)
- Harder to track deltas

### ✅ Recommended: Direct Posting + On-Demand Fetching (This Document)
- Direct thread posting to Jamzy channel
- On-demand reply fetching when viewing
- Incremental processing for efficiency
- Clean filtering with channel + embed
- Scales naturally

---

## Future Enhancements

### Frames Integration
Build Farcaster Frames for rich in-feed playback:
- Play music directly in Farcaster clients
- Vote on tracks, create collaborative playlists
- Gamification (leaderboards, achievements)

### AI-Powered Recommendations
- Analyze Farcaster engagement to recommend music
- Cross-reference with social graph
- "Your Farcaster friends are listening to..."

### Cross-Platform Discovery
- Surface Jamzy threads in other Farcaster apps
- Partner with music-focused Farcaster clients
- Build mini-apps within Warpcast

---

## Resources

### Documentation
- [Neynar Docs](https://docs.neynar.com)
- [Neynar API Reference](https://docs.neynar.com/reference)
- [Farcaster Protocol Docs](https://docs.farcaster.xyz)
- [Sign in with Neynar Guide](https://docs.neynar.com/docs/sign-in-with-neynar)

### SDKs
- [@neynar/nodejs-sdk](https://www.npmjs.com/package/@neynar/nodejs-sdk)
- [@neynar/react](https://www.npmjs.com/package/@neynar/react) (for frontend components)

### Community
- [Neynar Discord](https://discord.gg/neynar)
- [Farcaster Dev Chat](https://warpcast.com/~/channel/fc-devs)

---

## Decision Log

**2025-10-03:** MVP architecture defined
- ✅ Channel-based approach (not recast-based)
- ✅ Embed filtering to handle external posts
- ✅ Auth built into miniapp (no separate Neynar auth flow needed)
- ✅ On-demand reply fetching (no webhooks for MVP)
- ✅ **Incremental processing**: Only process NEW replies with Claude
- ✅ **No time-based cache**: Permanent storage, compare by hash
- ✅ **Backend structure**: Domain-based `/backend/api/` with shared utilities in `/backend/lib/`
- ✅ **Single API**: Serves both mini-app and web app
- ✅ **Fire-and-forget async**: Music extraction doesn't block thread creation (no job queue for MVP)
- ⏳ Next: Implementation phase

---

## Questions / Open Items

- [ ] What's the exact Jamzy channel URL once created?
- [ ] Neynar API tier selection based on expected volume
- [ ] **Channel filtering strategy:** Strict embed filtering (Option A) vs. open channel (Option B)?
  - Consider: text-only replies, direct music URL posts, moderation capacity
  - MVP: Start with Option A, evaluate community demand for Option B
- [ ] How to handle thread deletions (if user deletes cast)?
- [ ] Moderation workflow for reported threads/replies

---

## Conclusion

The MVP architecture provides a clean, efficient integration between Jamzy threads and Farcaster. By posting threads to a dedicated Jamzy channel and using incremental processing for replies, we maintain control while benefiting from Farcaster's open social graph.

**Next Steps:**
1. Create Jamzy Farcaster channel
2. Set up Neynar account and API key
3. Build thread creation function
4. Implement reply fetching with incremental processing
5. Test end-to-end flow

This architecture positions Jamzy for future growth while maintaining simplicity for the MVP.
