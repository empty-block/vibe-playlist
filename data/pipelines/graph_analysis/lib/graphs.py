from typing import Optional
import networkx as nx
from datetime import datetime, timedelta
import logging
from prefect import task
from data.pipelines.graph_analysis.models import NodeType
from data.pipelines.graph_analysis.lib.db import (
    get_user_node,
    get_edges,
)

# Configure logging - reduce verbosity
logging.basicConfig(
    level=logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@task
async def global_user_graph(
    days_lookback: Optional[int] = 30, 
    sampling_rate: Optional[float] = None,
    only_with_embeds: bool = False
) -> nx.DiGraph:
    """
    Build a graph connecting users to users based on their interactions
    
    Args:
        days_lookback: How many days of history to include
        sampling_rate: Optional sampling rate to reduce data size
        only_with_embeds: Only include edges for casts with embeds
        
    Returns:
        DiGraph where nodes are users and edges represent interactions between them
    """
    G = nx.DiGraph()
    
    # Get edges with optional sampling and embed filtering
    edges = await get_edges(
        days_lookback=days_lookback,
        sampling_rate=sampling_rate,
        only_with_embeds=only_with_embeds
    )
    
    # Keep track of all user IDs
    all_user_ids = set()
    
    # Process edges to connect users directly
    for edge in edges:
        # Skip AUTHORED edges as requested
        edge_type = edge.get("edge_type")
        if edge_type == "AUTHORED":
            continue
            
        source_user_id = edge.get("source_user_id")  # User who performed the action
        target_user_id = edge.get("target_user_id")  # User who received the action
        
        if not source_user_id or not target_user_id:
            logger.warning(f"Edge missing required user IDs: {edge}")
            continue
            
        all_user_ids.add(source_user_id)
        all_user_ids.add(target_user_id)
        
        # Determine edge weight based on interaction type
        weight = 1.0  # Default weight
        
        # Adjust weight based on edge_type
        if edge_type == "LIKED":
            weight = 1.0
        elif edge_type == "RECASTED":
            weight = 2.0
        elif edge_type == "REPLIED":
            weight = 3.0
            
        # Add or update edge between users
        if G.has_edge(source_user_id, target_user_id):
            # If edge already exists, increase the weight
            G[source_user_id][target_user_id]['weight'] += weight
        else:
            # Create new edge with initial weight
            G.add_edge(source_user_id, target_user_id, weight=weight, type=edge_type)
    
    # Fetch and add all user nodes with their data
    for user_id in all_user_ids:
        user_data = await get_user_node(user_id)
        if user_data:
            # Use available user attributes from the edge table if user_data is None
            G.add_node(user_id, type=NodeType.USER, **user_data)
        else:
            # Try to find this user in edges to get basic info
            for edge in edges:
                if str(edge.get("source_user_id")) == str(user_id):
                    G.add_node(user_id, type=NodeType.USER,
                              username=edge.get("user_fname", ""),
                              fname=edge.get("user_fname", ""),
                              avatar_url=edge.get("user_avatar_url", ""),
                              bio=edge.get("user_bio", ""))
                    break
            else:
                G.add_node(user_id, type=NodeType.USER)
    
    return G 