"""
Jamzy Graph Analysis - Simplified User Graph Flow

This module provides a Prefect flow for analyzing a user-to-user interaction graph.
"""

import logging
from typing import Dict, Optional
from datetime import datetime
from prefect import flow

from data.pipelines.graph_analysis.lib.graphs import global_user_graph
from data.pipelines.graph_analysis.lib.analysis import (
    calculate_pagerank,
    calculate_centrality_metrics,
    calculate_eigenvector_centrality,
    detect_communities,
    print_graph_sample
)

# Configure logging - set higher threshold to suppress task completion logs
logging.basicConfig(
    level=logging.INFO,  # Changed to INFO to see more logs for debugging
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
# Configure Prefect's loggers specifically
logging.getLogger("prefect").setLevel(logging.WARNING)
logging.getLogger("prefect.task_run").setLevel(logging.WARNING)
logging.getLogger("prefect.flow_run").setLevel(logging.INFO)

logger = logging.getLogger(__name__)

def print_top_users(G: Dict, users: list, metric_name: str):
    """Helper function to print top users with a consistent format"""
    print(f"\n=== TOP {len(users)} USERS BY {metric_name.upper()} ===")
    print(f"{'Rank':<5} {'User ID':<15} {'Score':<12} {'Name'}")
    print("-" * 60)
    
    for i, (user_id, score) in enumerate(users):
        # Get display name if available
        fname = ""
        if user_id in G.nodes:
            fname = G.nodes[user_id].get('fname', G.nodes[user_id].get('username', ''))
        
        # Print the metrics
        print(f"{i+1:<5} {user_id:<15} {score:.8f}  {fname}")

@flow(name="Analyze User Graph")
async def analyze_user_graph(
    days_lookback: int = 30,
    sampling_rate: Optional[float] = None,
    top_results: int = 15,
    only_with_embeds: bool = False
) -> Dict:
    """
    Build and analyze a user-to-user interaction graph
    
    Args:
        days_lookback: How many days of history to include
        sampling_rate: Optional sampling rate to reduce data size
        top_results: Number of top results to display
        only_with_embeds: Only include edges for casts with embeds
        
    Returns:
        Dictionary with analysis results
    """
    print(f"\n=== ANALYZING USER INTERACTION GRAPH ===")
    print(f"Days lookback: {days_lookback}")
    if sampling_rate:
        print(f"Sampling rate: {sampling_rate}")
    if only_with_embeds:
        print(f"Only including casts with embeds")
    
    # Build the user graph
    start_time = datetime.now()
    print(f"Building user graph... (started at {start_time.strftime('%H:%M:%S')})")
    
    try:
        graph = await global_user_graph(
            days_lookback=days_lookback,
            sampling_rate=sampling_rate,
            only_with_embeds=only_with_embeds
        )
        
        build_time = (datetime.now() - start_time).total_seconds()
        print(f"Graph building completed in {build_time:.2f} seconds")
        print(f"Graph has {graph.number_of_nodes()} nodes and {graph.number_of_edges()} edges")
        
        # Print a sample of the graph
        print("\nGraph sample:")
        sample = print_graph_sample(graph, sample_nodes=5, sample_edges=10)
        print(sample)
        
        # Skip analysis if the graph is too small
        if graph.number_of_nodes() <= 1:
            print("\nNot enough data to perform analysis.")
            return {
                'graph': graph,
                'error': 'Not enough data'
            }
        
        # Calculate centrality metrics
        print("\nCalculating network metrics...")
        start_time = datetime.now()
        
        pagerank = await calculate_pagerank(graph)
        centrality = await calculate_centrality_metrics(graph)
        eigenvector = await calculate_eigenvector_centrality(graph)
        
        # Also calculate communities for visualization
        undirected_graph = graph.to_undirected()
        communities = await detect_communities(undirected_graph)
        
        analysis_time = (datetime.now() - start_time).total_seconds()
        print(f"Analysis completed in {analysis_time:.2f} seconds")
        
        # Print top users by influence score
        print(f"\n=== TOP {top_results} USERS BY INFLUENCE SCORE ===")
        
        # Sort users by influence score
        user_influence = {
            user_id: metrics.get('influence_score', 0)
            for user_id, metrics in centrality.items()
        }
        top_influence = sorted(user_influence.items(), key=lambda x: x[1], reverse=True)[:top_results]
        
        # Print results in a table format
        print(f"{'Rank':<5} {'User ID':<15} {'Influence':<10} {'PageRank':<10} {'In-Degree':<10} {'Betweenness':<10}")
        print("-" * 70)
        
        for i, (user_id, influence) in enumerate(top_influence):
            # Get the metrics for this user
            user_metrics = centrality.get(user_id, {})
            user_pagerank = pagerank.get(user_id, 0)
            
            # Get fname if available
            fname = ""
            if user_id in graph.nodes:
                fname = graph.nodes[user_id].get('fname', graph.nodes[user_id].get('username', ''))
            
            # Print the metrics
            print(f"{i+1:<5} {user_id:<15} {influence:.6f} {user_pagerank:.6f} "
                f"{user_metrics.get('in_degree', 0):.6f} {user_metrics.get('betweenness', 0):.6f}")
            
            if fname:
                print(f"      {fname}")
        
        # Print top users by PageRank
        top_pagerank = sorted(pagerank.items(), key=lambda x: x[1], reverse=True)[:top_results]
        print_top_users(graph, top_pagerank, "PageRank")
        
        # Print top users by eigenvector centrality
        top_eigenvector = sorted(eigenvector.items(), key=lambda x: x[1], reverse=True)[:top_results]
        print_top_users(graph, top_eigenvector, "Eigenvector Centrality")
        
        # Return the results
        return {
            'graph': graph,
            'pagerank': pagerank,
            'centrality': centrality,
            'eigenvector': eigenvector,
            'communities': communities,
            'top_influence': top_influence,
            'top_pagerank': top_pagerank,
            'top_eigenvector': top_eigenvector
        }
    except Exception as e:
        logger.error(f"Error during graph analysis: {e}")
        print(f"\nError during analysis: {e}")
        return {
            'error': str(e)
        }

if __name__ == "__main__":
    import asyncio
    
    # Run with and without embeds filter to see what's happening
    async def run_test():
        print("\n========== RUNNING WITHOUT EMBEDS FILTER ==========")
        await analyze_user_graph(
            days_lookback=30,     # Longer time period to get more data
            sampling_rate=0.5,    
            top_results=15,
            only_with_embeds=False
        )
        
        print("\n\n========== RUNNING WITH EMBEDS FILTER ==========")
        await analyze_user_graph(
            days_lookback=30,     # Longer time period to get more data
            sampling_rate=None,   # No sampling to get all available data
            top_results=15,
            only_with_embeds=True
        )
    
    # Run both tests
    asyncio.run(run_test()) 