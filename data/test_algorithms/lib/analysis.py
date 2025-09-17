"""
Graph analysis functions for computing trust scores, recommendations, and network metrics.

Implements the core algorithms for trust-based music discovery and social graph analysis.
"""

import logging
from typing import List, Dict, Any, Tuple, Optional, Set
from collections import defaultdict
from datetime import datetime, timedelta
import networkx as nx
import networkx.algorithms.community as nx_comm

logger = logging.getLogger(__name__)


def calculate_pagerank(graph: nx.Graph, alpha: float = 0.85, 
                      max_iter: int = 100) -> Dict[Any, float]:
    """
    Calculate PageRank scores for nodes in a graph.
    
    Args:
        graph: NetworkX graph
        alpha: Damping parameter (default 0.85)
        max_iter: Maximum iterations
        
    Returns:
        Dictionary mapping node to PageRank score
    """
    if graph.number_of_nodes() == 0:
        return {}
    
    try:
        if graph.number_of_edges() > 0:
            pagerank_scores = nx.pagerank(graph, alpha=alpha, max_iter=max_iter, weight='weight')
        else:
            # Handle empty graph case
            num_nodes = graph.number_of_nodes()
            pagerank_scores = {node: 1.0/num_nodes for node in graph.nodes()}
            
        logger.info(f"Calculated PageRank for {len(pagerank_scores)} nodes")
        return pagerank_scores
        
    except Exception as e:
        logger.error(f"PageRank calculation failed: {e}")
        # Fallback to uniform distribution
        num_nodes = graph.number_of_nodes()
        return {node: 1.0/num_nodes for node in graph.nodes()}


def calculate_centrality_metrics(graph: nx.Graph) -> Dict[str, Dict[Any, float]]:
    """
    Calculate various centrality metrics for graph nodes.
    
    Args:
        graph: NetworkX graph
        
    Returns:
        Dictionary with centrality metrics for each node
    """
    metrics = {}
    
    if graph.number_of_nodes() == 0:
        return metrics
    
    try:
        # In-degree centrality (for directed graphs)
        if isinstance(graph, nx.DiGraph):
            metrics['in_degree_centrality'] = nx.in_degree_centrality(graph)
            metrics['out_degree_centrality'] = nx.out_degree_centrality(graph)
        else:
            metrics['degree_centrality'] = nx.degree_centrality(graph)
        
        # Betweenness centrality (bridges between communities)
        if graph.number_of_nodes() < 1000:  # Only for smaller graphs due to complexity
            metrics['betweenness_centrality'] = nx.betweenness_centrality(graph, weight='weight')
        
        # Eigenvector centrality (connection to other important nodes)
        try:
            metrics['eigenvector_centrality'] = nx.eigenvector_centrality(graph, weight='weight', max_iter=1000)
        except:
            logger.warning("Eigenvector centrality calculation failed, using degree centrality as fallback")
            if isinstance(graph, nx.DiGraph):
                metrics['eigenvector_centrality'] = metrics.get('in_degree_centrality', {})
            else:
                metrics['eigenvector_centrality'] = metrics.get('degree_centrality', {})
        
        # Clustering coefficient (local connectivity)
        if not isinstance(graph, nx.DiGraph):
            metrics['clustering_coefficient'] = nx.clustering(graph, weight='weight')
        
        logger.info(f"Calculated {len(metrics)} centrality metrics")
        
    except Exception as e:
        logger.error(f"Centrality calculation failed: {e}")
    
    return metrics


def detect_communities(graph: nx.Graph, algorithm: str = 'louvain') -> Dict[Any, int]:
    """
    Detect communities in the graph using specified algorithm.
    
    Args:
        graph: NetworkX graph
        algorithm: Community detection algorithm ('louvain' or 'greedy_modularity')
        
    Returns:
        Dictionary mapping node to community ID
    """
    if graph.number_of_nodes() == 0:
        return {}
    
    try:
        if algorithm == 'louvain':
            # Convert to undirected for Louvain
            if isinstance(graph, nx.DiGraph):
                undirected_graph = graph.to_undirected()
            else:
                undirected_graph = graph
                
            communities = nx_comm.louvain_communities(undirected_graph, weight='weight')
            
        elif algorithm == 'greedy_modularity':
            # Convert to undirected for greedy modularity
            if isinstance(graph, nx.DiGraph):
                undirected_graph = graph.to_undirected()
            else:
                undirected_graph = graph
                
            communities = nx_comm.greedy_modularity_communities(undirected_graph, weight='weight')
            
        else:
            raise ValueError(f"Unknown algorithm: {algorithm}")
        
        # Convert to node -> community_id mapping
        node_communities = {}
        for i, community in enumerate(communities):
            for node in community:
                node_communities[node] = i
        
        logger.info(f"Detected {len(communities)} communities using {algorithm}")
        return node_communities
        
    except Exception as e:
        logger.error(f"Community detection failed: {e}")
        return {}


def calculate_trust_score(weighted_interactions: float, total_music_posts: int,
                         days_since_last_interaction: int = 0, is_mutual: bool = False,
                         avg_engagement_rate: float = 1.0) -> float:
    """
    Calculate trust score using the formula from the specification.
    
    trust_score = (weighted_interactions / total_music_posts) × recency_factor × mutual_bonus × quality_factor
    
    Args:
        weighted_interactions: Sum of (likes × 1.0) + (replies × 0.5) + (recasts × 2.0)
        total_music_posts: Total number of music posts by the target user
        days_since_last_interaction: Days since last interaction (for recency factor)
        is_mutual: Whether they also interact with your posts (for mutual bonus)
        avg_engagement_rate: Average engagement rate on their posts (for quality factor)
        
    Returns:
        Trust score between 0.0 and 1.0
    """
    if total_music_posts == 0:
        return 0.0
    
    # Base score: weighted interactions / total posts
    base_score = weighted_interactions / total_music_posts
    
    # Recency factor: 0.5 to 1.0 (decays linearly over 90 days)
    recency_factor = max(0.5, 1.0 - (days_since_last_interaction / 90.0) * 0.5)
    
    # Mutual bonus: 1.2x if mutual, 1.0x otherwise
    mutual_bonus = 1.2 if is_mutual else 1.0
    
    # Quality factor: 1.0 to 1.2x based on engagement
    # Normalize engagement rate to 0-1 range and scale to 1.0-1.2
    quality_factor = 1.0 + min(0.2, avg_engagement_rate * 0.2)
    
    # Calculate final trust score
    trust_score = base_score * recency_factor * mutual_bonus * quality_factor
    
    # Cap at 1.0
    return min(1.0, trust_score)


def get_trusted_curators(user_id: int, trust_graph: nx.DiGraph, 
                        user_cast_counts: Dict[int, int],
                        min_trust_score: float = 0.1,
                        max_curators: int = 50) -> List[Dict[str, Any]]:
    """
    Find trusted curators for a specific user based on their interaction patterns.
    
    Args:
        user_id: Target user ID
        trust_graph: Trust network graph
        user_cast_counts: Dictionary mapping user_id to count of music posts
        min_trust_score: Minimum trust score threshold
        max_curators: Maximum number of curators to return
        
    Returns:
        List of trusted curators with scores and metadata
    """
    if user_id not in trust_graph:
        logger.warning(f"User {user_id} not found in trust graph")
        return []
    
    curators = []
    
    # Get all users this user has outgoing trust edges to
    for target_user, edge_data in trust_graph[user_id].items():
        weighted_interactions = edge_data.get('weight', 0.0)
        total_posts = user_cast_counts.get(target_user, 1)  # Avoid division by zero
        
        # Check if trust is mutual
        is_mutual = trust_graph.has_edge(target_user, user_id)
        
        # Calculate trust score
        trust_score = calculate_trust_score(
            weighted_interactions=weighted_interactions,
            total_music_posts=total_posts,
            is_mutual=is_mutual
        )
        
        if trust_score >= min_trust_score:
            # Get user metadata from graph
            user_data = trust_graph.nodes[target_user]
            
            curator = {
                'user_id': target_user,
                'username': user_data.get('display_name', f'User_{target_user}'),
                'trust_score': trust_score,
                'weighted_interactions': weighted_interactions,
                'total_posts': total_posts,
                'is_mutual': is_mutual,
                'raw_weight': weighted_interactions
            }
            
            curators.append(curator)
    
    # Sort by trust score and limit results
    curators.sort(key=lambda x: x['trust_score'], reverse=True)
    curators = curators[:max_curators]
    
    logger.info(f"Found {len(curators)} trusted curators for user {user_id}")
    return curators


def get_trust_recommendations(user_id: int, trust_graph: nx.DiGraph,
                            user_artist_graph: nx.Graph, user_cast_counts: Dict[int, int],
                            min_trust_score: float = 0.1, max_recommendations: int = 20) -> List[Dict[str, Any]]:
    """
    Generate artist recommendations based on trusted curators.
    
    Args:
        user_id: Target user ID
        trust_graph: Trust network graph  
        user_artist_graph: User-artist bipartite graph
        user_cast_counts: Dictionary mapping user_id to count of music posts
        min_trust_score: Minimum trust score for curators
        max_recommendations: Maximum number of recommendations
        
    Returns:
        List of artist recommendations with attribution
    """
    # Get trusted curators
    trusted_curators = get_trusted_curators(
        user_id, trust_graph, user_cast_counts, min_trust_score
    )
    
    if not trusted_curators:
        logger.warning(f"No trusted curators found for user {user_id}")
        return []
    
    # Get user's current artists to filter out
    user_node = f"user_{user_id}"
    current_artists = set()
    
    if user_node in user_artist_graph:
        for neighbor in user_artist_graph.neighbors(user_node):
            neighbor_data = user_artist_graph.nodes[neighbor]
            if neighbor_data.get('node_type') == 'artist':
                current_artists.add(neighbor_data['artist_name'])
    
    # Aggregate recommendations from trusted curators
    artist_scores = defaultdict(lambda: {'score': 0.0, 'curators': []})
    
    for curator in trusted_curators:
        curator_id = curator['user_id']
        trust_score = curator['trust_score']
        curator_node = f"user_{curator_id}"
        
        if curator_node in user_artist_graph:
            # Get artists this curator is connected to
            for neighbor in user_artist_graph.neighbors(curator_node):
                neighbor_data = user_artist_graph.nodes[neighbor]
                
                if neighbor_data.get('node_type') == 'artist':
                    artist_name = neighbor_data['artist_name']
                    
                    # Skip if user already knows this artist
                    if artist_name in current_artists:
                        continue
                    
                    # Get curator's affinity for this artist
                    edge_weight = user_artist_graph.edges[curator_node, neighbor]['weight']
                    
                    # Weight by trust score
                    recommendation_score = trust_score * edge_weight
                    
                    artist_scores[artist_name]['score'] += recommendation_score
                    artist_scores[artist_name]['curators'].append({
                        'user_id': curator_id,
                        'username': curator['username'],
                        'trust_score': trust_score,
                        'affinity': edge_weight
                    })
    
    # Convert to sorted list
    recommendations = []
    for artist_name, data in artist_scores.items():
        if data['score'] > 0:
            recommendations.append({
                'artist_name': artist_name,
                'score': data['score'],
                'curator_count': len(data['curators']),
                'curators': sorted(data['curators'], 
                                 key=lambda x: x['trust_score'], reverse=True)[:3]  # Top 3 curators
            })
    
    # Sort by score and limit
    recommendations.sort(key=lambda x: x['score'], reverse=True)
    recommendations = recommendations[:max_recommendations]
    
    logger.info(f"Generated {len(recommendations)} recommendations for user {user_id}")
    return recommendations


def get_pagerank_fallback_curators(social_graph: nx.DiGraph, user_id: int,
                                 community_assignments: Dict[int, int] = None,
                                 max_curators: int = 10) -> List[Dict[str, Any]]:
    """
    Get top curators using PageRank for cold start users (no trust relationships).
    
    Args:
        social_graph: Full user interaction graph
        user_id: Target user ID  
        community_assignments: Optional community assignments for filtering
        max_curators: Maximum number of curators to return
        
    Returns:
        List of top curators by PageRank
    """
    pagerank_scores = calculate_pagerank(social_graph)
    
    if not pagerank_scores:
        return []
    
    # Filter to same community if available
    target_community = None
    if community_assignments and user_id in community_assignments:
        target_community = community_assignments[user_id]
    
    curators = []
    for user, score in pagerank_scores.items():
        if user == user_id:  # Skip self
            continue
            
        # Filter by community if specified
        if target_community is not None:
            user_community = community_assignments.get(user)
            if user_community != target_community:
                continue
        
        # Get user metadata
        user_data = social_graph.nodes.get(user, {})
        
        curator = {
            'user_id': user,
            'username': user_data.get('display_name', f'User_{user}'),
            'pagerank_score': score,
            'source': 'community' if target_community is not None else 'global'
        }
        
        curators.append(curator)
    
    # Sort by PageRank and limit
    curators.sort(key=lambda x: x['pagerank_score'], reverse=True)
    curators = curators[:max_curators]
    
    logger.info(f"Found {len(curators)} PageRank fallback curators for user {user_id}")
    return curators