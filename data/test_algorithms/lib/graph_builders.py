"""
Graph construction functions for building different types of music social graphs.

Creates NetworkX graphs from database edge data for analysis.
"""

import logging
from typing import List, Dict, Any, Set, Tuple
from collections import defaultdict
import networkx as nx
from .database import get_edge_weights, get_trust_edge_weights

logger = logging.getLogger(__name__)


def build_quality_adjusted_social_graph(edges: List[Dict[str, Any]], users: List[Dict[str, Any]], 
                                       user_cast_counts: Dict[int, int]) -> nx.DiGraph:
    """
    Build a quality-adjusted User Interaction Graph that normalizes for post count.
    
    Nodes: Users
    Edges: Interactions weighted by quality metrics (engagement rate, post count normalization)
    Used for: Quality-based PageRank, Centrality metrics that reward engagement over volume
    
    Args:
        edges: List of cast edge dictionaries from database
        users: List of user node dictionaries from database  
        user_cast_counts: Dictionary mapping user_id to total post count
        
    Returns:
        NetworkX directed graph with quality-adjusted weighted edges
    """
    G = nx.DiGraph()
    edge_weights = get_edge_weights()
    
    # Add all users as nodes with their post counts
    for user in users:
        user_id = user['node_id']
        post_count = user_cast_counts.get(user_id, 1)  # Avoid division by zero
        G.add_node(user_id, post_count=post_count, **user)
    
    # Calculate engagement rates for quality adjustment
    user_engagement = defaultdict(lambda: {'total_interactions': 0, 'post_count': 1})
    
    # First pass: calculate total incoming interactions per user
    for edge in edges:
        target_id = edge['target_user_id']
        edge_type = edge['edge_type']
        
        # Skip AUTHORED edges for engagement calculation (self-generated)
        if edge_type != 'AUTHORED':
            weight = edge_weights.get(edge_type, 0.0)
            user_engagement[target_id]['total_interactions'] += weight
            user_engagement[target_id]['post_count'] = user_cast_counts.get(target_id, 1)
    
    # Calculate engagement rates (interactions per post)
    engagement_rates = {}
    for user_id, data in user_engagement.items():
        post_count = max(1, data['post_count'])  # Ensure no division by zero
        engagement_rates[user_id] = data['total_interactions'] / post_count
    
    # Add quality-adjusted weighted edges
    edge_counts = defaultdict(lambda: defaultdict(float))
    
    for edge in edges:
        source_id = edge['source_user_id']
        target_id = edge['target_user_id']  
        edge_type = edge['edge_type']
        
        # Skip self-loops
        if source_id == target_id:
            continue
            
        # Base weight from interaction type
        base_weight = edge_weights.get(edge_type, 0.0)
        
        # Quality adjustments
        target_post_count = user_cast_counts.get(target_id, 1)
        target_engagement_rate = engagement_rates.get(target_id, 0.0)
        
        # Post count normalization: reduce weight for high-volume posters
        # Use logarithmic scaling to avoid over-penalizing
        import math
        safe_post_count = max(1, target_post_count)  # Ensure at least 1
        post_penalty = 1.0 / (1.0 + math.log10(max(1, safe_post_count / 10)))
        
        # Engagement bonus: reward users who get good engagement per post
        # Scale engagement rate and cap the bonus
        if engagement_rates:
            max_engagement = max(engagement_rates.values())
            if max_engagement > 0:
                normalized_engagement = target_engagement_rate / max_engagement
                engagement_bonus = 1.0 + min(0.5, normalized_engagement * 0.5)  # 1.0 to 1.5x bonus
            else:
                engagement_bonus = 1.0
        else:
            engagement_bonus = 1.0
        
        # Final quality-adjusted weight
        quality_weight = base_weight * post_penalty * engagement_bonus
        
        edge_counts[source_id][target_id] += quality_weight
    
    # Add edges to graph
    for source_id, targets in edge_counts.items():
        for target_id, total_weight in targets.items():
            if total_weight > 0:
                G.add_edge(source_id, target_id, weight=total_weight)
    
    logger.info(f"Built quality-adjusted social graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
    return G


def build_social_graph(edges: List[Dict[str, Any]], users: List[Dict[str, Any]]) -> nx.DiGraph:
    """
    Build the User Interaction Graph - complete picture of music-related social activity.
    
    Nodes: Users
    Edges: ALL interactions between users on music casts (AUTHORED, LIKED, REPLIED, RECASTED)
    Used for: User PageRank, Centrality metrics, Community detection
    
    Args:
        edges: List of cast edge dictionaries from database
        users: List of user node dictionaries from database
        
    Returns:
        NetworkX directed graph with weighted edges
    """
    G = nx.DiGraph()
    edge_weights = get_edge_weights()
    
    # Add all users as nodes
    for user in users:
        G.add_node(user['node_id'], **user)
    
    # Add weighted edges for all interaction types
    edge_counts = defaultdict(lambda: defaultdict(float))
    
    for edge in edges:
        source_id = edge['source_user_id']
        target_id = edge['target_user_id']  
        edge_type = edge['edge_type']
        
        # Skip self-loops
        if source_id == target_id:
            continue
            
        # Accumulate weighted interactions between users
        weight = edge_weights.get(edge_type, 0.0)
        edge_counts[source_id][target_id] += weight
    
    # Add edges to graph
    for source_id, targets in edge_counts.items():
        for target_id, total_weight in targets.items():
            if total_weight > 0:
                G.add_edge(source_id, target_id, weight=total_weight)
    
    logger.info(f"Built social graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
    return G


def build_trust_graph(edges: List[Dict[str, Any]], users: List[Dict[str, Any]]) -> nx.DiGraph:
    """
    Build the Trust Network - filtered to only outgoing LIKED, REPLIED, RECASTED edges.
    
    Nodes: Users  
    Edges: Filtered to only outgoing LIKED, REPLIED, RECASTED edges with trust weights
    Used for: Trusted curator discovery, Trust-based recommendations
    
    Args:
        edges: List of cast edge dictionaries from database
        users: List of user node dictionaries from database
        
    Returns:
        NetworkX directed graph with trust-weighted edges
    """
    G = nx.DiGraph()
    trust_weights = get_trust_edge_weights()
    
    # Add all users as nodes
    for user in users:
        G.add_node(user['node_id'], **user)
    
    # Only include trust-relevant edge types (no AUTHORED)
    trust_edge_types = set(trust_weights.keys())
    
    # Add weighted edges for trust interactions only
    edge_counts = defaultdict(lambda: defaultdict(float))
    
    for edge in edges:
        edge_type = edge['edge_type']
        
        # Skip non-trust edge types
        if edge_type not in trust_edge_types:
            continue
            
        source_id = edge['source_user_id']
        target_id = edge['target_user_id']
        
        # Skip self-loops
        if source_id == target_id:
            continue
            
        # Accumulate trust-weighted interactions
        weight = trust_weights[edge_type]
        edge_counts[source_id][target_id] += weight
    
    # Add edges to graph  
    for source_id, targets in edge_counts.items():
        for target_id, total_weight in targets.items():
            if total_weight > 0:
                G.add_edge(source_id, target_id, weight=total_weight)
    
    logger.info(f"Built trust graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
    return G


def build_engagement_intensity_graph(posts: List[Dict[str, Any]], 
                                    engagements: List[Dict[str, Any]], 
                                    users: List[Dict[str, Any]]) -> nx.DiGraph:
    """
    Build Enhanced Engagement-Intensity Graph - measures engagement quality relative to content volume.
    
    This graph measures true curation influence by calculating engagement intensity as a percentage
    of a user's total posts. Someone who gets 5 likes on 10 posts (50% engagement rate) receives 
    higher influence than someone who gets 10 likes on 100 posts (10% engagement rate).
    
    Nodes: Users only
    Edges: Engaging User → Content Creator, weighted by engagement intensity
    
    Edge Weight Formula:
    engagement_intensity = (likes/total_posts × 1x) + (replies/total_posts × 2x) + (recasts/total_posts × 3x)
    
    Where:
    - total_posts = Content creator's posts in the analysis window
    - Only includes engagements with posts created in the analysis window
    - Eliminates users with 0 posts (can't receive engagement without content)
    
    Args:
        posts: List of AUTHORED edges (posts) created in the analysis window
        engagements: List of LIKED/REPLIED/RECASTED edges targeting those posts
        users: List of user node dictionaries for creating complete node set
        
    Returns:
        NetworkX directed graph with engagement-intensity weighted edges
    """
    # Initialize directed graph
    G = nx.DiGraph()
    
    # Add all users as nodes
    for user in users:
        G.add_node(user['node_id'])
    
    # Count posts per user in the analysis window
    user_post_counts = defaultdict(int)
    for post in posts:
        author_id = post['source_user_id']  # AUTHORED edges: source = author
        user_post_counts[author_id] += 1
    
    logger.info(f"Found {len(user_post_counts)} users with posts in the analysis window")
    
    # Debug: Log top users with posts
    top_posters = sorted(user_post_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    logger.info(f"Top users with posts: {top_posters}")
    
    # Track engagement intensity between users
    engagement_totals = defaultdict(lambda: defaultdict(lambda: {'likes': 0, 'replies': 0, 'recasts': 0}))
    
    # Process engagements to calculate intensity scores
    for engagement in engagements:
        edge_type = engagement['edge_type']
        engaging_user_id = engagement['source_user_id']  # User who engaged
        content_creator_id = engagement['target_user_id']  # User who created the content
        
        # Skip if content creator has no posts in the analysis window
        if content_creator_id not in user_post_counts:
            continue
            
        # Skip self-engagement
        if engaging_user_id == content_creator_id:
            continue
            
        # Count engagement by type
        if edge_type == 'LIKED':
            engagement_totals[engaging_user_id][content_creator_id]['likes'] += 1
        elif edge_type == 'REPLIED':
            engagement_totals[engaging_user_id][content_creator_id]['replies'] += 1
        elif edge_type == 'RECASTED':
            engagement_totals[engaging_user_id][content_creator_id]['recasts'] += 1
    
    # Calculate engagement intensity and create weighted edges
    edge_count = 0
    for engaging_user_id, targets in engagement_totals.items():
        for content_creator_id, counts in targets.items():
            total_posts = user_post_counts[content_creator_id]
            
            if total_posts == 0:  # Should not happen due to filtering above, but safety check
                logger.warning(f"Debug: User {content_creator_id} has 0 posts but received engagement - this should not happen!")
                continue
                
            # Calculate engagement intensity as percentage of creator's posts
            like_intensity = counts['likes'] / total_posts * 1.0      # 1x weight
            reply_intensity = counts['replies'] / total_posts * 2.0   # 2x weight  
            recast_intensity = counts['recasts'] / total_posts * 3.0  # 3x weight
            
            # Final engagement intensity score
            total_intensity = like_intensity + reply_intensity + recast_intensity
            
            if total_intensity > 0:
                G.add_edge(engaging_user_id, content_creator_id, weight=total_intensity)
                edge_count += 1
    
    logger.info(f"Added {edge_count} engagement intensity edges")
    
    logger.info(f"Built engagement-intensity graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
    return G


def build_engagement_weighted_social_graph(edges: List[Dict[str, Any]], 
                                         users: List[Dict[str, Any]]) -> nx.DiGraph:
    """
    Build Engagement-Weighted Social Graph - user-to-user influence based on content engagement.
    
    This graph captures true social influence by measuring how users engage with each other's content.
    Users who consistently engage with someone's posts create stronger weighted edges pointing to that creator.
    
    Nodes: Users only
    Edges: Source → Target weighted by engagement (LIKED, REPLIED, RECASTED)
    - If User B likes/replies/recasts User A's posts, creates edge B → A with accumulated weight
    - AUTHORED edges are excluded (no self-loops) - influence comes from others engaging with your content
    
    Edge Weights:
    - LIKED: 1.0 (basic endorsement)
    - REPLIED: 2.0 (active engagement)  
    - RECASTED: 3.0 (content amplification)
    
    Used for: PageRank analysis, identifying influential content creators, curator discovery
    
    Args:
        edges: List of cast edge dictionaries (LIKED, REPLIED, RECASTED interactions)
        users: List of user node dictionaries for creating complete node set
        
    Returns:
        NetworkX directed graph with weighted user-to-user edges
    """
    # Get engagement weights (excluding AUTHORED to avoid self-loops)
    engagement_weights = {
        'LIKED': 1.0,        # Basic endorsement
        'REPLIED': 2.0,      # Active engagement  
        'RECASTED': 3.0      # Content amplification
    }
    
    # Initialize directed graph
    G = nx.DiGraph()
    
    # Add all users as nodes
    for user in users:
        G.add_node(user['node_id'])
    
    # Track engagement between users: source_user -> target_user (content creator)
    engagement_weights_map = defaultdict(lambda: defaultdict(float))
    
    # Process edges to build user-to-user engagement connections
    for edge in edges:
        edge_type = edge['edge_type']
        
        # Skip AUTHORED edges (these create self-loops and don't represent user-to-user engagement)
        if edge_type == 'AUTHORED':
            continue
            
        # Database schema: source = engaging user, target = content creator
        engaging_user_id = edge['source_user_id']  # User who engaged (correct)
        content_creator_id = edge['target_user_id']  # Original content creator (correct)
        
        # Skip if no valid engagement weight
        if edge_type not in engagement_weights:
            continue
            
        # Skip self-loops (shouldn't happen with non-AUTHORED edges, but safety check)
        if engaging_user_id == content_creator_id:
            continue
            
        # Accumulate engagement weight: engaging_user → content_creator
        weight = engagement_weights[edge_type]
        engagement_weights_map[engaging_user_id][content_creator_id] += weight
    
    # Add weighted edges to graph
    for source_user_id, targets in engagement_weights_map.items():
        for target_user_id, total_weight in targets.items():
            if total_weight > 0:
                G.add_edge(source_user_id, target_user_id, weight=total_weight)
    
    logger.info(f"Built engagement-weighted social graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
    return G


def build_user_artist_graph(music_library: List[Dict[str, Any]], 
                           edges: List[Dict[str, Any]]) -> nx.Graph:
    """
    Build User-Artist Affinity Graph - bipartite graph connecting users to artists.
    
    Nodes: Users and Artists (two distinct sets)
    Edges: User → Artist based on interactions with casts mentioning artists  
    Used for: Basic collaborative filtering, user taste profiles, recommendation foundation
    
    Args:
        music_library: List of music library records with user-artist interactions
        edges: List of cast edge dictionaries for weighting interactions
        
    Returns:
        NetworkX bipartite graph with user and artist nodes
    """
    G = nx.Graph()
    edge_weights = get_edge_weights()
    
    # Build user-cast interaction weights first
    cast_weights = defaultdict(float)
    for edge in edges:
        cast_id = edge.get('cast_id')
        edge_type = edge['edge_type']
        source_id = edge['source_user_id']
        
        if cast_id:
            weight = edge_weights.get(edge_type, 0.0)
            cast_weights[(source_id, cast_id)] += weight
    
    # Build user-artist affinities from music library
    user_artist_weights = defaultdict(float)
    
    for record in music_library:
        user_id = record.get('user_id') 
        artist_name = record.get('artist_name')
        cast_id = record.get('cast_id')
        
        if not all([user_id, artist_name, cast_id]):
            continue
            
        # Get interaction weight for this user-cast pair
        interaction_weight = cast_weights.get((user_id, cast_id), 1.0)  # Default weight 1.0
        
        # Add to user-artist affinity
        user_artist_weights[(user_id, artist_name)] += interaction_weight
    
    # Add nodes and edges to bipartite graph
    users = set()
    artists = set()
    
    for (user_id, artist_name), weight in user_artist_weights.items():
        if weight > 0:
            # Add nodes with bipartite labels
            if user_id not in users:
                G.add_node(f"user_{user_id}", bipartite=0, user_id=user_id, node_type='user')
                users.add(user_id)
            
            if artist_name not in artists:
                G.add_node(f"artist_{artist_name}", bipartite=1, artist_name=artist_name, node_type='artist') 
                artists.add(artist_name)
            
            # Add weighted edge
            G.add_edge(f"user_{user_id}", f"artist_{artist_name}", weight=weight)
    
    logger.info(f"Built user-artist graph: {len(users)} users, {len(artists)} artists, {G.number_of_edges()} edges")
    return G


def build_artist_authority_graph(user_artist_graph: nx.Graph, 
                                social_graph: nx.DiGraph) -> nx.Graph:
    """
    Build Artist Authority Graph - projection showing artist relationships through shared curators.
    
    Nodes: Artists only
    Edges: Artist → Artist (connected if shared by same curators)
    Edge Weights: Number of common curators × their influence scores
    Used for: Artist PageRank, finding related artists, artist influence metrics
    
    Args:
        user_artist_graph: Bipartite user-artist graph
        social_graph: User interaction graph for curator influence scores
        
    Returns:
        NetworkX graph with artist nodes and weighted edges
    """
    G = nx.Graph()
    
    # Get PageRank scores from social graph for curator influence
    try:
        user_pagerank = nx.pagerank(social_graph, weight='weight')
    except:
        # Fallback to unweighted if graph has issues
        user_pagerank = defaultdict(lambda: 1.0)
    
    # Extract artist nodes and their connected users
    artist_curators = defaultdict(list)  # artist -> [(user_id, influence_score)]
    
    for node in user_artist_graph.nodes():
        node_data = user_artist_graph.nodes[node]
        
        if node_data.get('node_type') == 'artist':
            artist_name = node_data['artist_name']
            
            # Find all users connected to this artist
            for neighbor in user_artist_graph.neighbors(node):
                neighbor_data = user_artist_graph.nodes[neighbor]
                
                if neighbor_data.get('node_type') == 'user':
                    user_id = neighbor_data['user_id']
                    edge_weight = user_artist_graph.edges[node, neighbor]['weight']
                    
                    # Get user's influence score from PageRank
                    influence = user_pagerank.get(user_id, 0.0)
                    
                    # Combined curator strength: edge weight × influence
                    curator_strength = edge_weight * (1.0 + influence * 10)  # Scale PageRank 
                    
                    artist_curators[artist_name].append((user_id, curator_strength))
    
    # Add artist nodes
    artists = list(artist_curators.keys())
    for artist in artists:
        G.add_node(artist, artist_name=artist)
    
    # Connect artists that share curators
    for i, artist_a in enumerate(artists):
        for artist_b in artists[i+1:]:  # Avoid duplicates
            
            # Find common curators
            curators_a = {user_id for user_id, _ in artist_curators[artist_a]}
            curators_b = {user_id for user_id, _ in artist_curators[artist_b]}
            
            common_curators = curators_a & curators_b
            
            if common_curators:
                # Calculate edge weight as sum of shared curator influences
                edge_weight = 0.0
                
                curator_strengths_a = {user_id: strength for user_id, strength in artist_curators[artist_a]}
                curator_strengths_b = {user_id: strength for user_id, strength in artist_curators[artist_b]}
                
                for curator_id in common_curators:
                    # Use minimum strength to be conservative
                    strength_a = curator_strengths_a.get(curator_id, 0.0)
                    strength_b = curator_strengths_b.get(curator_id, 0.0)
                    edge_weight += min(strength_a, strength_b)
                
                if edge_weight > 0:
                    G.add_edge(artist_a, artist_b, 
                              weight=edge_weight,
                              common_curators=len(common_curators))
    
    logger.info(f"Built artist authority graph: {G.number_of_nodes()} artists, {G.number_of_edges()} edges")
    return G


def get_graph_summary(graph: nx.Graph, graph_name: str) -> Dict[str, Any]:
    """
    Get summary statistics for a graph.
    
    Args:
        graph: NetworkX graph
        graph_name: Name of the graph for logging
        
    Returns:
        Dictionary with graph statistics
    """
    is_directed = isinstance(graph, nx.DiGraph)
    
    summary = {
        'name': graph_name,
        'nodes': graph.number_of_nodes(),
        'edges': graph.number_of_edges(),
        'is_directed': is_directed,
        'density': nx.density(graph)
    }
    
    if graph.number_of_nodes() > 0:
        if is_directed:
            if nx.is_weakly_connected(graph):
                summary['connected'] = True
            else:
                summary['connected'] = False
                summary['weakly_connected_components'] = nx.number_weakly_connected_components(graph)
        else:
            if nx.is_connected(graph):
                summary['connected'] = True  
            else:
                summary['connected'] = False
                summary['connected_components'] = nx.number_connected_components(graph)
    
    return summary