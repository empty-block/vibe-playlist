# Jamzy Discovery & UX Strategy

**Date:** November 21, 2025
**Status:** Strategic Planning
**Purpose:** Guide next phase of product development focusing on discovery, engagement, and curator-centric features

---

## Table of Contents

1. [Core Problem & Opportunity](#core-problem--opportunity)
2. [Strategic Options Analysis](#strategic-options-analysis)
3. [Data-Driven Features](#data-driven-features)
4. [Implementation Roadmap](#implementation-roadmap)
5. [Key Decisions & Trade-offs](#key-decisions--trade-offs)

---

## Core Problem & Opportunity

### Current State
- Homepage is chronological feed of newest tracks
- Quality is hit-or-miss (sometimes great, sometimes low-quality)
- Fresh content (new tracks every hour) but not optimized for first impressions
- Risk: New users bounce before seeing value

### The Insight
> "The most tried and true way to find good new music is still just to ask a friend who you trust has a good taste."

**Jamzy's unique value proposition:** Human curation by trusted people, not algorithmic black boxes.

### Strategic Question
**What is Jamzy fundamentally?**
1. Music discovery app (with social context), OR
2. People discovery app (that happens to be about music)

**Answer influences everything:** UX hierarchy, data priorities, feature roadmap.

---

## Strategic Options Analysis

### Option 1: Track-First (Current Approach)

**What it looks like:**
- Homepage shows music feed
- Curator info visible but secondary
- One tap to play music

**Pros:**
- ✅ Immediate gratification
- ✅ Low friction
- ✅ Works for cold start
- ✅ Proven pattern (Spotify, TikTok)

**Cons:**
- ❌ Loses differentiation
- ❌ Users might miss the curator layer
- ❌ Becomes "just another feed"

**Best for:** Quick wins, safe approach, new user onboarding

---

### Option 2: Curator-First

**What it looks like:**
- Homepage shows ranked curator list
- Click curator → see their library
- Discovery is people-centric

**Pros:**
- ✅ Directly solves core problem ("who to trust")
- ✅ Forces social graph building
- ✅ Highly differentiated
- ✅ Stickier long-term

**Cons:**
- ❌ High friction (find curator → THEN music)
- ❌ Cold start problem
- ❌ Feels like homework
- ❌ Risk of bounce

**Best for:** Bold differentiation, engaged users, long-term retention

---

### Option 3: Hybrid Approach (Recommended)

**What it looks like:**
- Curator cards with embedded track previews
- Can play music inline OR explore curator deeper
- Curators are primary focus, music is immediately visible

**Example Layout:**
```
┌──────────────────────────────────────┐
│ @user123 ⭐ Tastemaker               │
│ Hip-hop • 45 tracks • 12.3 avg likes │
│                                      │
│ Latest share:                        │
│ ┌────────────────────────────────┐   │
│ │ [Album Art] Track - Artist     │   │
│ │ ♥ 15  [▶ Play]                 │   │
│ └────────────────────────────────┘   │
│                                      │
│ [View Full Library]                  │
└──────────────────────────────────────┘
```

**Balances:**
- ✅ Curators are primary (main focus)
- ✅ Music immediately visible (low friction)
- ✅ Progressive disclosure (content → curator → community)
- ✅ Differentiated but accessible

**Model:** Pinterest (content-first but creator-prominent)

---

### The Pinterest Model

**Why Pinterest succeeded:**
- **Pins** (content) are the primary unit
- But **pinner** always visible at top
- One tap to see more from that pinner
- Discover great pinners through their pins

**Jamzy equivalent:**
- **Tracks** are the primary unit
- But **curator** always visible and prominent
- One tap to see curator's library
- Discover great curators through their tracks

**User journey:**
```
See track → "This slaps" →
Notice curator → "Who is this?" →
Tap curator profile → "Their whole library is fire" →
Filter to that curator →
Discover similar curators
```

**Music hooks them, curators keep them.**

---

## Data-Driven Features

### Graph Structure
**Current data model:**
- Nodes: Users, Casts (posts), Tracks
- Edges: LIKED, REPLIED, RECAST, SHARED, AUTHORED
- Graph database foundation enables sophisticated analysis

### Data Strengths
- ✅ Social graph (who engages with whom)
- ✅ Taste graph (who likes what)
- ✅ Curation patterns (who shares what)
- ✅ Engagement signals (likes, replies, recasts)
- ✅ Music metadata (title, artist, genre, AI confidence)

### Data Constraints
- 10K tracks, 1K users (smaller dataset)
- Limited music metadata (no audio features like Spotify)
- Multi-platform playback (YouTube, Spotify, SoundCloud, Apple Music)
- Mobile auto-play restrictions (can't auto-advance on YouTube)

---

## Tier 1: Simple Aggregations (High Impact, Low Effort)

### 1. Curator Quality Score

**What it is:**
Rank curators by quality of their shares, not just quantity.

**Key metrics:**
- Average likes on shared tracks
- Average replies (discussion quality)
- Consistency (standard deviation)
- Minimum threshold (5+ tracks to qualify)

**Advanced version:**
- Weight recent performance higher
- Penalize spam/low-quality shares
- Genre-specific scores

**UI/UX Integration:**

**Profile Pages:**
- Display score prominently (level, tier, percentile)
- "Top 5% Curator" or "Tastemaker" badge
- Stats breakdown: "Your tracks avg 8.3 likes"

**Track Cards:**
- Subtle indicator on curator avatar (gold ring, checkmark, flame icon)
- "Shared by Tastemaker" label
- Hover/tap shows curator stats

**Feed Ranking:**
- Boost tracks from high-score curators in "For You"
- Filter option: "Tastemaker picks only"

**Leaderboards:**
- Top curators this week/month/all-time
- Filterable by genre
- Gamification: "You're #47, 3 more quality shares to reach top 40"

**Onboarding:**
- New users see "Follow these tastemakers"
- Curated list of top 10-20 curators across genres

**Notifications:**
- "You reached Tastemaker status!"
- "Your curator score went up this week"

---

### 2. Track Momentum / Velocity

**What it is:**
Not just total likes - how FAST is a track gaining traction?

**Calculation:**
- Likes per hour since posting
- Acceleration (velocity increasing?)
- Relative to track's age

**UI/UX Integration:**

**"Rising" Feed:**
- Dedicated tab or filter: "Rising Now"
- Tracks gaining traction fast, not just popular overall

**Track Cards:**
- Momentum indicator (↑↑ or 🔥 icon)
- "Trending up" label
- Subtle animated glow for high momentum

**Real-time Feel:**
- "5 likes in the last hour"
- Creates urgency/FOMO

**Notifications:**
- "A track you shared is taking off"
- "This track is rising fast" (for tracks you liked)

---

### 3. Hidden Gems Score

**What it is:**
High quality + low discovery = opportunity for early fans.

**Formula:**
- High AI confidence (quality signal)
- Low engagement (undiscovered)
- Recent (not old and ignored)

**Quality vs. exposure ratio:**
```
hidden_gem_score = (ai_confidence * 100) / (like_count + 1)
```

**UI/UX Integration:**

**Dedicated Feed/Playlist:**
- "Hidden Gems" as top-level destination
- Refreshes daily/weekly

**Track Cards:**
- "Hidden Gem" badge/label
- Diamond or gem icon (💎)

**Gamification:**
- "You discovered 5 hidden gems this week"
- "Early Discoverer" credit if you like before it blows up

**Notifications:**
- "A hidden gem you liked is now trending"
- Validates user's taste

---

### 4. Genre Distribution Over Time

**What it is:**
Track what genres are trending in the community.

**Analysis:**
- Genre share by week/month
- Momentum (increasing vs. decreasing)
- Seasonal patterns

**UI/UX Integration:**

**Contextual Insights:**
- "Hip-hop is trending up 40% this week"
- Genre momentum indicators in navigation

**Discovery Prompts:**
- "Electronic is having a moment"
- "Jazz is surging in your community"

**Personalization:**
- Identify emerging genre interests
- Suggest genre expansion

---

## Tier 2: Graph Analysis (Medium Effort, High Differentiation)

### 5. Taste Similarity Between Users

**What it is:**
Users who like the same tracks = similar taste.

**Calculation:**
- Jaccard similarity on liked tracks
- Intersection / Union of liked tracks
- Require minimum threshold (5+ likes) for reliability

**Advanced:**
- Weight recent likes higher
- Genre overlap analysis
- Curator overlap (both follow same curators)

**UI/UX Integration:**

**Profile Pages:**
- "Similar taste to you: 73%" on other profiles
- "Users with similar taste" section
- Visual: overlapping circles showing taste overlap

**Track Cards:**
- "Liked by 3 users with similar taste"
- Show their avatars (social proof)

**"For You" Feed:**
- Tracks liked by taste-similar users ranked higher
- "Because @user liked this (89% taste match)"

**Discovery Prompts:**
- "@user has similar taste and just shared something"
- Push notification potential

**Social Features:**
- "Find your taste twin" - highest similarity match
- "Taste compatibility" score on any profile

---

### 6. Community Detection (Taste Tribes)

**What it is:**
Find organic clusters of users who engage with similar content or each other.

**Algorithm:**
- Louvain or similar community detection
- Based on shared likes, shared curators, genre patterns
- Multiple communities possible per user

**Result:**
- "Indie Explorers"
- "Hip-Hop Heads"
- "Electronic Enthusiasts"
- "Genre Crossovers"

**UI/UX Integration:**

**Onboarding:**
- After 5-10 interactions: "You're vibing with the Indie Explorers"
- Immediate sense of belonging

**Profile:**
- "Part of: Electronic Heads, Lo-fi Collective"
- Multiple communities possible

**Feed Filters:**
- "Popular in your communities"
- Toggle to see cross-community content

**Community Pages:**
- Browse all communities
- Each has: top tracks, top curators, recent activity
- Organic (not manually created like channels)

**Social Proof:**
- "Trending in Electronic Heads"
- "3 Indie Explorers liked this"

---

### 7. PageRank for Curators

**What it is:**
Who's influential based on who engages with them?

**Key insight:**
- Not just "who has most likes"
- But "who gets likes from OTHER high-quality curators"
- A like from a top curator = worth more than random like

**UI/UX Integration:**

**Curator Leaderboard:**
- Weighted by influence, not just raw numbers
- "Most Influential Curators"

**Track Cards:**
- "Recommended by top curators" badge
- More weight than normal likes

**Verification:**
- "Verified Tastemaker" status (top PageRank)

---

### 8. First Discoverer / Trendsetter Credit

**What it is:**
Track who shares tracks FIRST, before they get popular.

**Analysis:**
- Identify first sharer of each track
- Track how that track performs later
- Score curators on "discovered first" accuracy

**UI/UX Integration:**

**Track Cards:**
- "First shared by @user" (permanent credit)
- Original discoverer always acknowledged

**Profile Stats:**
- "Discovered first: 23 tracks"
- "Tracks you found first got 450 total likes"

**Achievements/Badges:**
- "Trendsetter" badge
- "Called it early" moments

**Notifications:**
- "A track you discovered first just hit 50 likes"
- Validates discovery skills

**Leaderboard:**
- "Top Trendsetters This Month"

---

### 9. Genre Affinity Per User (Taste Profile)

**What it is:**
What genres does each user actually engage with?

**Tracks:**
- Likes by genre
- Shares by genre
- Replies by genre (higher intent signal)

**UI/UX Integration:**

**Your Profile:**
- Visual breakdown of genre engagement
- "You're 45% hip-hop, 30% electronic, 25% other"
- Pie chart, bar chart, or creative visualization

**Taste Evolution:**
- "Your taste this month vs. last month"
- "You're exploring more jazz lately"

**Personalization Transparency:**
- Explain "For You" recommendations
- "Based on your hip-hop affinity..."

**Comparison:**
- "Your taste vs. @user's taste" visual overlap
- Discovery: find users with complementary taste

---

### 10. Shortest Path / Degrees of Separation

**What it is:**
How connected are any two users through shared music taste?

**Analysis:**
- User A liked Track X
- Track X also liked by User B
- User B liked Track Y
- Find shortest path through graph

**UI/UX Integration:**

**Profile Pages:**
- "You and @user are 2 degrees apart"
- "How you're connected" visualization

**Discovery:**
- "Bridge tracks" - songs connecting different taste communities
- "This track connects hip-hop heads and jazz lovers"

**Social Feature:**
- "Six degrees of music" - path between any two tracks
- Gamification: "Shortest path challenge"

---

## Tier 3: Advanced Features (Longer Term)

### 11. Curator Archetypes / Clusters

**What it is:**
Group curators by their curation patterns.

**Feature vectors:**
- Genre diversity (specialist vs. explorer)
- Quality focus (avg engagement)
- Discovery timing (early vs. mainstream)
- Platform preference (Spotify vs. YouTube)

**Archetypes examples:**
- "The Genre Explorer" - shares diverse genres
- "The Hip-Hop Purist" - deep in one lane
- "The Trendsetter" - discovers early
- "The Quality Curator" - high avg engagement
- "The Underground Digger" - low engagement, high confidence tracks

**UI/UX Integration:**

**Profiles:**
- Display archetype badge/title
- "You're a Genre Explorer"

**Onboarding:**
- "What kind of curator are you?" quiz
- Or auto-detected after sharing

**Discovery:**
- "Find curators like you"
- Filter/browse by archetype

**Gamification:**
- Work toward different archetypes
- "Share 3 more genres to become Genre Explorer"

---

### 12. Bridge Curators / Crossover Detection

**What it is:**
Which users/tracks connect different taste communities?

**Betweenness centrality:**
- Users who bridge different communities
- Tracks that resonate across communities

**UI/UX Integration:**

**Curator Badges:**
- "Bridge Curator" - connects different taste tribes
- "Genre Ambassador" - introduces one community to another

**Track Labels:**
- "Crossover Hit" badge
- "Hip-hop heads AND jazz lovers like this"

**Discovery Feature:**
- "Tracks that connect communities"
- Genre expansion recommendations

**Expansion Prompts:**
- "You like hip-hop - this jazz track is popular with hip-hop fans"
- Bridges feel natural, not random

---

### 13. Conversation Depth Score

**What it is:**
Which tracks generate real discussion vs. just likes?

**Metrics:**
- Reply count vs. like count
- Average reply length
- Discussion ratio

**UI/UX Integration:**

**Feed Sorting:**
- "Most Discussed" filter (not just most likes)

**Track Cards:**
- "Hot Discussion" indicator
- Reply count prominently shown

**Labels:**
- "Controversial" or "Polarizing" for split opinions
- Drives curiosity

**Thread Highlights:**
- "This track sparked a 47-reply conversation"

---

## Implementation Roadmap

### Phase 1: Multi-Feed Home (Week 1)

**Goal:** Fix new user experience with quality-gated feeds

**What to build:**

**Backend:**
- Define feed presets as query configurations
- Modify existing `/api/channels/home/feed` to accept preset param
- Three presets:
  - `curated`: 24h timeRange, top sort, minLikes=2, minConfidence=0.6
  - `trending`: 7d timeRange, trending sort
  - `fresh`: 48h timeRange, recent sort (current behavior)

**Frontend:**
- Add tab navigation to HomePage: [Curated] [Trending] [Fresh]
- Default to "Curated" tab
- Track tab usage in analytics

**No new infrastructure needed** - uses existing DB functions with different params

**Success metrics:**
- Session duration increases
- Bounce rate decreases
- Play-through rate on tracks

---

### Phase 2: Data Features Foundation (Week 2)

**Goal:** Implement core data features that power everything else

**What to build:**

**Curator Quality Score:**
- SQL query to calculate scores (run daily via cron)
- Store in `user_nodes` table (add `curator_score` column)
- Expose via API

**Taste Similarity:**
- Calculate user-user similarity (can be background job)
- Store in new `user_similarity` table
- Use for "For You" feed ranking

**Track Momentum:**
- Add velocity calculation to trending algorithm
- Create "Rising" feed endpoint

**Hidden Gems:**
- Query combining AI confidence + low engagement
- Create "Hidden Gems" feed/playlist

**Success metrics:**
- "For You" engagement vs. generic feed
- Hidden Gems discovery rate
- Curator profile click-through rate

---

### Phase 3: Curator Prominence (Week 3)

**Goal:** Make curator layer more visible and compelling

**What to build:**

**Enhanced Track Cards:**
- Larger curator avatar
- More prominent badges/trust signals
- Curator stats on hover/tap

**Curator Profiles:**
- Add curator score display
- Add badges (Tastemaker, Trendsetter, etc.)
- Show taste profile (genre distribution)
- Similar curators section

**Top Curators Section:**
- Add to homepage (above or within feed)
- 3-5 curator cards with track previews
- Horizontal scroll

**Leaderboards:**
- Top Curators page
- Filterable by genre, timeframe
- Stats and rankings

**Success metrics:**
- Curator profile visits
- Curator-based filtering usage
- Time spent on curator profiles

---

### Phase 4: Smart Playlists (Week 4) - CONDITIONAL

**Important constraint:** Mobile auto-play restrictions limit playlist value.

**Current reality:**
- YouTube embeds don't allow auto-play on mobile
- Mixed playlists (YouTube → Spotify) won't flow seamlessly
- Users must manually tap each track

**Given constraints, playlists become:**
- Curated collections (browse and tap through)
- Discovery tools (showcases, not lean-back listening)
- Social objects (shareable, discussable)

**Decision point:**
- IF you solve auto-play (Spotify-only playlists, native app, etc.)
  - THEN build full smart playlist system

- IF auto-play remains unsolved
  - THEN focus on enhanced feeds + social features instead
  - Playlists add minimal value over filtered feeds

**Alternative to playlists:**
- Saved filter combinations ("My Filters")
- Curator following/notifications
- Enhanced social features (comments, reputation)

---

### Phase 5: Community & Social (Week 5+)

**Goal:** Deepen engagement through social features

**What to build:**

**Community Detection:**
- Run clustering algorithm on taste graph
- Assign users to communities
- Create community pages

**First Discoverer:**
- Track and display on track cards
- Profile stats for trendsetter credit

**Notifications:**
- "Curator you like shared new track"
- "Track you discovered first is trending"
- "You reached new curator tier"

**Social Features:**
- Curator following (implicit or explicit)
- Taste compatibility on profiles
- "Users like you" recommendations

---

## Key Decisions & Trade-offs

### Decision 1: Track-First vs. Curator-First

**Current approach:** Track-first (music is primary, curator is context)

**Recommendation:** Hybrid approach
- Keep tracks primary for low friction
- But make curators MUCH more prominent
- Add dedicated curator discovery features
- Test curator engagement before pivoting

**Test before deciding:**
- Track curator profile click-through rate
- Track curator-based filtering usage
- Survey: "How do you decide what to play?"

**If curator engagement is HIGH:**
- Consider curator-first homepage
- Maybe for returning users (keep track-first for new)

**If curator engagement is LOW:**
- Double down on curator signals and trust indicators
- Better badges, better stats, better UX

---

### Decision 2: User-Created Smart Playlists

**The idea:** Natural language → AI-generated smart playlists
- User: "Chill electronic from this week"
- AI parses → creates auto-updating playlist

**Why it's compelling:**
- Infinite variety
- Simple UX (just text box)
- Shareable
- Differentiator
- Leverages AI strengths

**Why it might not work yet:**
- Mobile auto-play restrictions break the "lean-back listening" value prop
- Without auto-advance, playlists = filtered feeds with extra steps
- Development effort might not justify the value

**Recommendation:** Defer until:
- Auto-play is solved (Spotify-only playlists? Native app?), OR
- Reframe as "Showcases" (social curation, not playback), OR
- Focus on simpler alternatives (saved filters, curator following)

**Ship instead:**
- Jamzy-curated smart playlists (you create 5-7)
- Enhanced feed filtering
- Curator-based discovery

---

### Decision 3: Data Prioritization

**Ship first (highest ROI):**
1. Curator quality scores → powers everything
2. Taste similarity → enables personalization
3. Hidden gems detection → unique discovery angle
4. Track momentum → better trending

**Ship second (differentiation):**
5. Community detection → organic taste tribes
6. First discoverer credit → gamifies curation
7. Curator archetypes → interesting social layer

**Longer term (advanced):**
8. PageRank for curators
9. Bridge detection
10. Engagement prediction models

**Guideline:** Focus on features that leverage your unique data (social graph + music) that Spotify can't replicate.

---

### Decision 4: Mobile Constraints

**Constraint:** YouTube + mobile = no auto-play

**Implications:**
- Playlists are browse-collections, not listening-sessions
- Focus on discovery, not lean-back consumption
- Emphasize social/conversation over playback convenience

**Strategic response:**
- Lean into what you CAN do (human curation, social discovery)
- Don't try to be Spotify (seamless playback)
- Make discovery and conversation the killer features
- Consider Spotify-only playlists as workaround

---

## Progressive Disclosure: Three User Levels

### Level 1: Track Surface (Everyone)
**First-time users, casual browsers**

- Track is hero, curator is context
- Curator visible but not blocking
- One tap to play
- Quality-gated feed reduces bad experiences

**Goal:** Hook with music, show curator context

---

### Level 2: Curator Discovery (Engaged)
**Users who've liked 5+ tracks, spent 15+ minutes**

- Clicking curator profiles
- Filtering by curator
- Using taste similarity
- Following curators

**Goal:** Help them find trusted curators

---

### Level 3: Community Layer (Power Users)
**Active sharers, daily users**

- Curator leaderboards
- Taste tribes/communities
- Curator archetypes
- Social graph features
- First discoverer credits

**Goal:** Gamify curation, build status/reputation

**Users naturally progress through levels** - design supports each stage.

---

## Success Metrics

### North Star Metrics
- **Weekly Active Curators:** Users sharing quality tracks (indicator of health)
- **Curator Discovery Rate:** % of users who click into curator profiles
- **Taste Graph Density:** Average connections per user (engagement depth)

### Engagement Metrics
- **Session Duration:** Time spent per visit
- **Play-through Rate:** % of tracks played after clicking
- **Return Visit Rate:** % who come back within 7 days
- **Curator Filter Usage:** % using curator-based filtering

### Quality Metrics
- **Average Track Quality:** Mean AI confidence + engagement of played tracks
- **Discovery Rate:** % of tracks played that user hadn't seen before
- **Satisfaction Proxy:** Likes per session, shares per week

### Social Metrics
- **Curator Profile Views:** Clicks to curator profiles
- **Similar Taste Clicks:** Users exploring taste-similar profiles
- **Community Engagement:** Activity within detected communities

---

## Open Questions

1. **What's current curator engagement?**
   - Are users clicking curator profiles now?
   - Are they engaging with curator context?
   - Survey: What drives their play decisions?

2. **What's the data say about quality variance?**
   - % of tracks with <2 likes in current feed
   - % with low AI confidence
   - Time-of-day patterns?

3. **What's the platform mix?**
   - % YouTube vs. Spotify vs. others
   - Could Spotify-only playlists work?

4. **What's the session pattern?**
   - Average session length
   - Plays per session
   - Quick browse or longer listening?

5. **What are users asking for?**
   - Feature requests from beta
   - Pain points mentioned
   - What feels broken?

---

## Next Steps

1. **Validate current curator engagement**
   - Add analytics tracking to curator clicks
   - Run for 1-2 weeks
   - Decide track-first vs. curator-first based on data

2. **Ship Phase 1: Multi-Feed Home**
   - Immediate quality improvement
   - Low risk, high impact
   - Test which feed types users prefer

3. **Ship Phase 2: Data Foundation**
   - Curator scores
   - Taste similarity
   - Hidden gems
   - Powers everything else

4. **Test curator prominence**
   - Enhanced track cards with better curator signals
   - Top curators section on homepage
   - Track engagement with curator features

5. **Reassess based on data**
   - If curator engagement is high → double down
   - If low → improve curator UX and trust signals
   - Adjust roadmap based on what users respond to

---

## Appendix: Technical Notes

### Database Additions Needed

**For curator scores:**
```sql
ALTER TABLE user_nodes ADD COLUMN curator_score FLOAT;
ALTER TABLE user_nodes ADD COLUMN curator_rank INT;
ALTER TABLE user_nodes ADD COLUMN curator_tier TEXT; -- 'tastemaker', 'trendsetter', etc.
```

**For taste similarity:**
```sql
CREATE TABLE user_similarity (
  user_a_fid TEXT,
  user_b_fid TEXT,
  similarity_score FLOAT,
  common_likes INT,
  updated_at TIMESTAMPTZ,
  PRIMARY KEY (user_a_fid, user_b_fid)
);
CREATE INDEX idx_user_similarity_score ON user_similarity(similarity_score DESC);
```

**For communities:**
```sql
CREATE TABLE communities (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  member_count INT,
  created_at TIMESTAMPTZ
);

CREATE TABLE community_members (
  community_id UUID REFERENCES communities(id),
  user_fid TEXT,
  affinity_score FLOAT,
  joined_at TIMESTAMPTZ,
  PRIMARY KEY (community_id, user_fid)
);
```

**For first discoverer:**
```sql
ALTER TABLE cast_nodes ADD COLUMN first_sharer_fid TEXT;
ALTER TABLE cast_nodes ADD COLUMN discovery_timestamp TIMESTAMPTZ;
```

### Cron Jobs Needed

**Daily jobs:**
- Calculate curator scores (runs on all users)
- Update hidden gems playlist
- Refresh trending calculations

**Weekly jobs:**
- Calculate user similarity (expensive, run less frequently)
- Run community detection algorithm
- Update curator leaderboards

**Hourly jobs:**
- Update track momentum/velocity scores
- Refresh "Rising" feed

### API Endpoints to Add

```
GET  /api/curators/top              # Leaderboard
GET  /api/curators/:fid/stats       # Detailed curator stats
GET  /api/curators/:fid/similar     # Similar curators

GET  /api/users/:fid/taste-profile  # Genre affinity
GET  /api/users/:fid/similar        # Taste-similar users

GET  /api/feeds/curated             # Quality-gated feed
GET  /api/feeds/rising              # Momentum-based feed
GET  /api/feeds/hidden-gems         # Hidden gems feed

GET  /api/communities               # All communities
GET  /api/communities/:id           # Community details
GET  /api/communities/:id/feed      # Community-specific feed
```

---

**Document Version:** 1.0
**Last Updated:** November 21, 2025
**Owner:** Jamzy Product Team
**Status:** Living document - update as we learn and iterate
