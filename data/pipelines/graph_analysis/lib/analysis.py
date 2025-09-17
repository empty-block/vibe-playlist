from typing import Dict, List, Optional
import networkx as nx
from prefect import task
from data.pipelines.graph_analysis.models import NodeType
import logging
import random

# Configure logging - reduce verbosity
logger = logging.getLogger(__name__)
logger.setLevel(logging.WARNING)

@task
async def calculate_pagerank(G: nx.DiGraph, damping_factor: float = 0.85) -> Dict[str, float]:
    """
    Calculate PageRank for a user-to-user graph
    
    Args:
        G: The user graph to analyze
        damping_factor: Damping factor for PageRank
        
    Returns:
        Dictionary mapping user IDs to their PageRank scores
    """
    if G.number_of_nodes() == 0:
        return {}
    
    try:
        # Calculate PageRank with weights on edges
        return nx.pagerank(
            G, 
            alpha=damping_factor,
            weight='weight'
        )
    except Exception as e:
        logger.error(f"Error in PageRank calculation: {e}")
        # Fall back to uniform distribution
        return {n: 1.0/G.number_of_nodes() for n in G.nodes()}

@task
async def calculate_eigenvector_centrality(G: nx.DiGraph) -> Dict[str, float]:
    """
    Calculate eigenvector centrality for a user-to-user graph
    
    Args:
        G: The user graph to analyze
        
    Returns:
        Dictionary mapping user IDs to their eigenvector centrality scores
    """
    if G.number_of_nodes() <= 1:
        return {n: 1.0 for n in G.nodes()}
    
    try:
        # Try the standard eigenvector centrality calculation with weights
        return nx.eigenvector_centrality(G, weight='weight')
    except Exception as e:
        logger.warning(f"Standard eigenvector centrality failed: {e}. Trying numpy implementation.")
        try:
            # Fall back to NumPy implementation
            return nx.eigenvector_centrality_numpy(G, weight='weight')
        except Exception as e2:
            logger.error(f"Eigenvector centrality calculation failed: {e2}")
            # Last resort - uniform values
            return {n: 1.0/G.number_of_nodes() for n in G.nodes()}

@task
async def calculate_betweenness_centrality(G: nx.DiGraph, sampling: Optional[int] = None) -> Dict[str, float]:
    """
    Calculate betweenness centrality for a user-to-user graph
    
    Args:
        G: The user graph to analyze
        sampling: Number of node pairs to sample for approximation (faster for large graphs)
        
    Returns:
        Dictionary mapping user IDs to their betweenness centrality scores
    """
    if G.number_of_nodes() <= 1:
        return {n: 0.0 for n in G.nodes()}
    
    try:
        # Use sampling for large graphs
        if sampling and G.number_of_nodes() > 100:
            return nx.betweenness_centrality(G, k=sampling, weight='weight')
        # Otherwise calculate exact betweenness
        return nx.betweenness_centrality(G, weight='weight')
    except Exception as e:
        logger.error(f"Error calculating betweenness centrality: {e}")
        return {n: 0.0 for n in G.nodes()}

@task
async def calculate_centrality_metrics(G: nx.DiGraph) -> Dict[str, Dict[str, float]]:
    """
    Calculate multiple centrality metrics for a user-to-user graph
    
    Args:
        G: The user graph to analyze
        
    Returns:
        Dictionary of user IDs to centrality metrics
    """
    # Initialize results dictionary
    metrics = {}
    
    try:
        # Calculate basic degree metrics
        in_degree = nx.in_degree_centrality(G)
        out_degree = nx.out_degree_centrality(G)
        
        # Calculate weighted PageRank (influence)
        pagerank = await calculate_pagerank(G)
        
        # Calculate betweenness with sampling for larger graphs
        sampling = 100 if G.number_of_nodes() > 500 else None
        betweenness = await calculate_betweenness_centrality(G, sampling=sampling)
        
        # Combine all metrics
        for node in G.nodes():
            metrics[node] = {
                'in_degree': in_degree.get(node, 0),           # Popularity
                'out_degree': out_degree.get(node, 0),         # Activity 
                'pagerank': pagerank.get(node, 0),             # Overall influence
                'betweenness': betweenness.get(node, 0)        # Bridge/connector role
            }
            
            # Add extra metrics derived from the base metrics
            metrics[node]['influence_score'] = (
                0.5 * pagerank.get(node, 0) + 
                0.3 * in_degree.get(node, 0) + 
                0.2 * betweenness.get(node, 0)
            )
        
        return metrics
    except Exception as e:
        logger.error(f"Error calculating centrality metrics: {e}")
        return {}

@task
async def detect_communities(G: nx.Graph) -> Dict[str, int]:
    """
    Detect user communities in the graph
    
    Args:
        G: The user graph to analyze
        
    Returns:
        Dictionary mapping user IDs to community IDs
    """
    try:
        # Convert to undirected graph for community detection
        if G.is_directed():
            G_undirected = G.to_undirected()
        else:
            G_undirected = G
            
        # Use Louvain algorithm for community detection
        communities = nx.community.louvain_communities(G_undirected, weight='weight')
        
        # Map nodes to their community IDs
        community_map = {}
        for i, community in enumerate(communities):
            for node in community:
                community_map[node] = i
                
        return community_map
    except Exception as e:
        logger.error(f"Error detecting communities: {e}")
        return {}

def print_graph_sample(G: nx.DiGraph, sample_nodes: int = 5, sample_edges: int = 10) -> str:
    """
    Generate a human-readable sample of the graph structure
    
    Args:
        G: The graph to sample
        sample_nodes: Number of nodes to include in the sample
        sample_edges: Number of edges to include in the sample
        
    Returns:
        String representation of the graph sample
    """
    if G.number_of_nodes() == 0:
        return "Empty graph - no nodes found."
    
    # Start building the output string
    output = []
    output.append(f"Graph Summary:")
    output.append(f"  Total nodes: {G.number_of_nodes()}")
    output.append(f"  Total edges: {G.number_of_edges()}")
    
    # Add type distribution if available
    node_types = {}
    for node, data in G.nodes(data=True):
        node_type = data.get('type', 'UNKNOWN')
        node_types[node_type] = node_types.get(node_type, 0) + 1
    
    if node_types:
        output.append("\nNode Types:")
        for node_type, count in node_types.items():
            output.append(f"  {node_type}: {count}")
    
    # Sample some nodes
    output.append("\nSample Nodes:")
    nodes = list(G.nodes(data=True))
    sampled_nodes = random.sample(nodes, min(sample_nodes, len(nodes)))
    
    for node, data in sampled_nodes:
        # Format node information
        node_info = f"  Node {node}"
        
        # Add some attributes if available
        fname = data.get('fname')
        if fname:
            node_info += f" - {fname}"
            
        username = data.get('username')
        if username and username != fname:
            node_info += f" (@{username})"
            
        output.append(node_info)
        
        # Add degree information
        in_degree = G.in_degree(node, weight='weight')
        out_degree = G.out_degree(node, weight='weight')
        output.append(f"    In-degree: {in_degree:.2f}, Out-degree: {out_degree:.2f}")
    
    # Sample some edges
    output.append("\nSample Edges:")
    edges = list(G.edges(data=True))
    sampled_edges = random.sample(edges, min(sample_edges, len(edges)))
    
    for source, target, data in sampled_edges:
        # Get node display names if available
        source_name = G.nodes[source].get('fname', source)
        target_name = G.nodes[target].get('fname', target)
        
        # Format edge information
        edge_info = f"  {source_name} → {target_name}"
        
        # Add edge attributes
        edge_type = data.get('type', 'UNKNOWN')
        weight = data.get('weight', 1.0)
        
        edge_info += f" ({edge_type}, weight: {weight:.2f})"
        output.append(edge_info)
    
    return "\n".join(output)
