"""
Graph Intelligence Test Library

Functional utilities for building and analyzing music social graphs.
"""

from .database import get_supabase_client, fetch_user_nodes, fetch_cast_edges, fetch_cast_edges_with_date_filter, fetch_posts_in_period, fetch_engagements_with_posts, fetch_music_library, fetch_user_cast_counts
from .graph_builders import (
    build_social_graph,
    build_quality_adjusted_social_graph,
    build_trust_graph,
    build_engagement_weighted_social_graph,
    build_engagement_intensity_graph,
    build_user_artist_graph,
    build_artist_authority_graph,
    get_graph_summary
)
from .analysis import (
    calculate_pagerank,
    calculate_centrality_metrics,
    detect_communities,
    calculate_trust_score,
    get_trusted_curators,
    get_trust_recommendations
)

__all__ = [
    # Database utilities
    'get_supabase_client',
    'fetch_user_nodes', 
    'fetch_cast_edges',
    'fetch_cast_edges_with_date_filter',
    'fetch_posts_in_period',
    'fetch_engagements_with_posts',
    'fetch_music_library',
    'fetch_user_cast_counts',
    
    # Graph builders
    'build_social_graph',
    'build_quality_adjusted_social_graph',
    'build_trust_graph',
    'build_engagement_weighted_social_graph',
    'build_engagement_intensity_graph',
    'build_user_artist_graph', 
    'build_artist_authority_graph',
    'get_graph_summary',
    
    # Analysis functions
    'calculate_pagerank',
    'calculate_centrality_metrics',
    'detect_communities',
    'calculate_trust_score',
    'get_trusted_curators',
    'get_trust_recommendations'
]