# Network Analysis Architecture

## Network Graphs
Functions that create different types of graphs with standardized return formats.

### Local User Graph
- Graph centered on a specific user with configurable depth
- Parameters: user_id, depth, timeframe
- Includes: Direct interactions, replies, mentions

### Global Network Graph
- Complete graph of all users and their interactions
- Parameters: timeframe, sampling_rate
- Supports: Incremental updates and persistent storage

### Engagement Similarity Graph
- Connects users who interact with similar content
- Parameters: similarity_threshold, timeframe
- Applications: Content recommendation, user clustering

### Channel and User Follows Similarity Graph
- Models relationships based on follow patterns
- Parameters: channel_weight, user_weight
- Applications: Interest-based communities, social clustering

### Temporal Evolution Graph
- Captures network changes over time
- Parameters: time_windows, resolution
- Applications: Growth analysis, trend spotting

## Graph Analysis
Functions that take in a graph and produce analysis of that graph.

### PageRank
- Identifies influential nodes based on connection patterns
- Parameters: damping_factor, iterations
- Return: Ranked list of nodes with scores

### Eigenvector Centrality
- Measures node importance based on connection quality
- Parameters: max_iterations, tolerance
- Applications: Identifying key influencers

### Betweenness Centrality
- Identifies bridge nodes connecting different communities
- Parameters: sampling (for large graphs)
- Applications: Finding connector users, information brokers

### Community Detection
- Identifies clusters of densely connected nodes
- Methods: Louvain, Label Propagation, Infomap
- Applications: User segmentation, community analysis

### Trending Analysis
- For casts: Engagement velocity, spread patterns
- For users: Growth in influence, interaction diversity
- Parameters: time_window, velocity_metrics

## Content Filtering Options
For a social music sharing app, the ability to filter graphs based on content characteristics is essential:

### Embed/URL Filtering
- Filter casts that contain embeds (URLs to music content)
- Parameters: has_embed (boolean), embed_type (music, video, etc.)
- Applications: Music-specific recommendations, filtering for shareable content

### Content Type Filtering
- Filter by content attributes (replies, original posts, reposts)
- Filter by engagement types (likes, recasts, quotes)
- Applications: Identifying original content creators vs. curators

### Recency and Popularity Filters
- Time-based filtering for recent content
- Engagement threshold filtering for popular content
- Applications: Trending music discovery, quality filtering

## Implementation Strategy

### Core Data Structures
- Standard Graph object based on NetworkX
- Pydantic models for request/response schemas
- Consistent data formats between functions

### Function-Based Architecture
- Graph builder functions: `build_local_graph()`, `build_global_graph()`, etc.
- Analysis functions: `calculate_pagerank()`, `detect_communities()`, etc.
- Helper utilities for database operations, caching, and visualization

### Using Pydantic Models
- Input parameter validation: `class LocalGraphParams(BaseModel)`
- Structured output results: `class PageRankResults(BaseModel)`
- Benefits:
  - Runtime validation
  - Self-documenting code
  - Automatic JSON serialization
  - Schema generation
  - Integration with Prefect parameters

### Prefect Integration
- Task-based approach with clear function boundaries
- Validation using Pydantic models
- Proper error handling and retry mechanisms
- Flow orchestration with parameter passing

### Testing Approach
- Unit tests for individual functions
- Integration tests for full flows
- Mock data generation for testing
