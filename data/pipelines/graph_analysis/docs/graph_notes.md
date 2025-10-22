# Graph Analysis Plan

## Core Algorithms

### PageRank on Music Shares
How it works:
- Iteratively calculates importance scores for each node
- Score based on number and quality of incoming edges
- Higher weight for engagement from important nodes
- Damping factor prevents isolated clusters dominating

Why useful: Identifies influential nodes in our music sharing network. Helps find both tastemaker users and highly significant music shares. Users who consistently share music that gets high engagement will rank higher, as will music that's shared/engaged with by influential users.

### Shortest Paths
How it works:
- Finds minimal distance between nodes
- Weights edges by engagement strength
- Considers all possible paths up to max depth
- Can use Dijkstra's or A* algorithm

Why useful: Maps how music spreads through the network. Useful for understanding music discovery patterns - how did user X discover song Y? Could help build "music discovery stories" and identify key users who bridge different music communities.

### Local Clustering Coefficient
How it works:
- For each node, check connections between neighbors
- Calculate ratio of actual vs possible connections
- Higher score = more interconnected neighborhood
- Can be weighted by engagement strength

Why useful: Measures how interconnected a user's neighborhood is. High coefficients suggest users who are part of tight-knit music sharing communities. Could help identify genre-specific communities even without explicit genre data.

### Betweenness Centrality
How it works:
- Counts how often a node appears in shortest paths
- Considers paths between all pairs of nodes
- Higher score = more important bridge node
- Can be normalized by graph size

Why useful: Identifies nodes that act as bridges between different parts of the network. These users might be "cross-genre" tastemakers who connect different music communities. Valuable for finding users who drive music discovery across community boundaries.

### HITS (Hubs and Authorities)
How it works:
- Iteratively computes two scores per node
- Hub score: based on outgoing edges
- Authority score: based on incoming edges
- Converges to stable scores

Why useful: Distinguishes between users who are good at sharing music (hubs) and music that's consistently valued by good sharers (authorities). Different from PageRank as it separates these two types of influence.

### Community Detection (Louvain)
How it works:
- Optimizes modularity score
- Iteratively merges nodes into communities
- Hierarchical structure possible
- Considers edge weights for engagement strength

Why useful: Finds clusters of users with similar music sharing/engagement patterns. Could reveal natural music communities without needing genre labels. Useful for recommendations within taste groups.

### Time-Weighted Engagement
How it works:
- Applies decay function to edge weights
- Recent actions worth more
- Rolling window of activity
- Can adjust decay rate based on patterns

Why useful: Incorporates recency into our analysis. Recent shares/engagements count more than older ones. Helps surface currently active users and trending music while still considering historical patterns.

### Similarity Propagation
How it works:
- Starts with direct similarity scores
- Propagates through network connections
- Dampens with distance
- Converges after N iterations

Why useful: Instead of just direct similarity, propagate taste similarity through the network. If A is similar to B, and B to C, then A and C might have some similarity even if they never interacted with the same music.

## Future Possibilities

### Temporal Graph Analysis
How it works:
- Creates time-sliced graph snapshots
- Tracks metric changes over time
- Identifies trend patterns
- Can predict future changes

Why useful: Track how communities evolve over time, identify emerging tastemakers, spot shifting music trends.

### Multi-Graph Approach
How it works:
- Separate graphs per interaction type
- Cross-graph metric computation
- Weighted combination of scores
- Can prioritize certain interaction types

Why useful: Compare influence across different engagement types, weight recommendations based on interaction patterns, understand different types of music sharing behavior.

### Random Walk Recommendations
How it works:
- Starts from target user node
- Randomly traverses edges
- Records nodes visited
- Weights by visit frequency

Why useful: Generate personalized recommendations, find non-obvious connections, balance between popular and niche content.

### Influence Cascades
How it works:
- Tracks chains of engagement
- Measures cascade depth/breadth
- Identifies catalyst patterns
- Time-based spread analysis

Why useful: Understand how music shares create engagement chains, identify patterns in successful sharing, predict potential viral shares.

# User-Centric Recommendation Approach

## Core Concept
Instead of recommending music content directly, focus on recommending users to follow. This creates a more social, community-driven music discovery experience where content flows naturally through user connections.

## Advantages of User-Based Recommendations
- Creates a more social, community-driven experience that aligns with natural music discovery patterns
- Simplifies the recommendation problem (matching users vs. thousands of songs)
- Builds stronger network effects and encourages user engagement
- Enables "radio" feeds based on curated users rather than algorithmic playlists
- More intuitive to explain why recommendations are made ("You might like this user because...")

## Implementation Strategy

### 1. Basic Graph Construction
- **Nodes**: Individual users
- **Edges**: User interactions (likes, replies, recasts)
- **Direction**: User A → User B when A engages with B's content
- **Edge Weights**: Based on interaction type and recency
  - Likes: Base weight (1.0)
  - Replies: Higher weight (2.0)
  - Recent interactions weighted higher than older ones

### 2. User Influence Analysis using PageRank
- Apply standard PageRank algorithm to the user interaction graph
- Identify influential music curators (users whose shares receive engagement from well-connected users)
- Higher PageRank = more influential in the music sharing community
- Apply time decay to favor recent interactions (older interactions gradually lose importance)

### 3. Personalized User Recommendations
- **Starting Point**: Select a target user to generate recommendations for
- **Filter Criteria**:
  - Exclude users the target already follows/interacts with
  - Prioritize users with some connection to target's network
- **Ranking Factors**:
  - Global influence (PageRank score)
  - Relevance to target user (similarity scores)

### 4. Similarity Metrics for Personalization
- **Shared Interests**: Overlap in music content both users have engaged with
- **Network Overlap**: Common connections between users
- **Content Similarity**: Patterns in music sharing/engagement behavior

### 5. "Radio" Feed Implementation
- Start with a seed user (either the target user or a recommended user)
- Create a chronological feed of their music shares
- Optionally intersperse with content from similar users
- Adjust the mix based on engagement feedback

## Future Enhancements

### Personalized PageRank
- Customize the "random jump" behavior to focus on users similar to the target
- Create a personalization vector weighted toward the target user
- Find users who are both influential and relevant to the target's position in the network

### Damping Factor Optimization
- The damping factor (typically ~0.85) controls how far influence propagates
- Higher values emphasize network structure
- Lower values focus more on direct connections
- Experiment to find optimal settings for music discovery

### User Community Visualization
- Visualize the network of recommended users
- Highlight taste overlap and uniqueness factors
- Allow users to explore the "user graph" directly

### Similarity-Based Edges
- Replace or complement interaction edges with explicit similarity metrics
- Calculate pairwise user similarity based on music taste overlap
- Edge weights represent strength of taste compatibility
- Enables recommendations based on taste similarity even without direct interaction

### Temporal Analysis
- Track how user influence evolves over time
- Identify emerging tastemakers
- Capture seasonal and trending patterns in music sharing

## Implementation Priority
1. Basic interaction graph with standard PageRank
2. Simple personalization based on user relevance
3. "Radio" feeds from recommended users
4. Enhanced visualization and exploration features
5. Advanced personalized PageRank implementation

# Finding Music Friends

## Direct Neighbor Analysis
How it works:
- Start with target user
- Find all direct interactions (both directions)
- Weight connections by:
  - Number of shared interactions
  - Types of interactions (authored → liked/recasted)
  - Recency of interactions
- Sort by combined weight score

## Local Similarity Score
How it works:
- Look at user's immediate network (1-hop)
- Calculate similarity based on:
  - Mutual music interactions
  - Similar sharing patterns
  - Temporal overlap in activity
- Can use Local Clustering Coefficient to find tight-knit groups

## Practical Implementation Priority
1. Start with simple direct interactions
2. Weight by engagement type:
   - Both liked same music: medium weight
   - One shared, other engaged: high weight
   - Reciprocal engagement: highest weight
3. Apply time decay to favor recent connections
4. Rank and return top N "music friends"

This gives us a good starting point for:
- Music recommendation sources
- Community visualization
- Understanding user's music network

# Music Feed Recommendations

## Simple First Pass
How it works:
- Get user's direct music friends (from previous algorithm)
- Pull their recent music shares
- Weight by:
  - Friend similarity score
  - Post recency
  - Engagement count
- Filter out already seen/engaged content

## Expanded Second Layer
How it works:
- Include second-degree connections (friends of friends)
- Lower weight for more distant connections
- Look for common patterns in user's liked/recasted music
- Boost content that's similar to their high-engagement posts

## Time-Sensitive Scoring
How it works:
- Higher weights for:
  - Active times (when user typically engages)
  - Fresh content (posted in last 24h)
  - Currently trending in their network
- Decay older content gradually

## Diversity Injection
How it works:
- Avoid echo chamber of same friends
- Occasionally inject popular music from:
  - Distant but influential users
  - Different communities user sometimes engages with
  - High-engagement content from their broader network

## Scoring Formula (v1)
Score = (friend_weight * 0.4) +
        (recency_score * 0.3) +
        (engagement_score * 0.2) +
        (diversity_bonus * 0.1)

Priority Implementation:
1. Basic friend-based feed
2. Add time weighting
3. Include engagement signals
4. Add diversity mechanisms

This gives us:
- Personalized recommendations
- Fresh content
- Mix of familiar and discovery
- Natural growth of music network

# Future Music Feed Recommendation Ideas

## Contextual Recommendations
How it works:
- Analyze cast text for context clues
- Look for patterns like:
  - Time of day mentions ("morning vibes")
  - Mood indicators ("perfect for coding")
  - Activity context ("workout playlist")
- Match recommendations to user's current context

## Taste Evolution Tracking
How it works:
- Track user's music engagement over time
- Identify shifting preferences
- Surface content that matches their "music journey"
- Help users discover new directions based on evolution patterns

## Collaborative Sessions
How it works:
- Find pairs/groups of users who often share music together
- Detect "conversation" patterns in music sharing
- Build recommendation chains that follow natural discovery flows
- "User X shared this, then User Y responded with this..."

## Anti-Recommendations
How it works:
- Learn what user explicitly doesn't engage with
- Identify patterns in skipped/ignored content
- Use as negative signal in recommendations
- Helps avoid repeatedly suggesting unwanted content

## Cross-Platform Identity
How it works:
- If we get platform APIs access:
  - Match Spotify/YouTube URLs to actual tracks
  - Build proper song identity across platforms
  - Enable "same song, different platform" matching
  - Better understand user's true music preferences

## Micro-Communities
How it works:
- Find tiny but active music sharing groups
- Identify specialized taste patterns
- Use as source for niche recommendations
- Help users find their specific "music tribes"

## Temporal Patterns
How it works:
- Build time-based recommendation models
- Consider:
  - Day of week patterns
  - Time of day preferences
  - Seasonal trends
  - Music sharing "conversations"

## Engagement Chain Analysis
How it works:
- Track successful music sharing patterns
- Learn what makes certain shares spread
- Understand timing of engagement
- Optimize recommendation timing

## Experimental
- AI-powered cast text analysis for deeper context
- Audio feature analysis if we get platform data
- Geographic patterns in music sharing
- Event-based recommendations (festivals, releases)
- Collaborative playlist generation
- "Music story" reconstruction

The key is keeping recommendations:
- Personal
- Timely
- Discoverable
- Contextual
- Social