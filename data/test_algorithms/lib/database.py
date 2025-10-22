"""
Database connection and data fetching utilities for graph analysis.

Functions for connecting to Supabase and fetching graph data from the database.
"""

import os
import logging
from typing import List, Dict, Any, Optional
from supabase import create_client, Client

logger = logging.getLogger(__name__)


def get_supabase_client() -> Client:
    """Get Supabase client using environment variables."""
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_ANON_KEY') or os.environ.get('SUPABASE_KEY')
    
    if not url or not key:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_ANON_KEY/SUPABASE_KEY environment variables. Please set these to your production Supabase credentials.")
    
    return create_client(url, key)


def fetch_user_nodes(supabase: Client, limit: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Fetch user nodes from the database.
    
    Args:
        supabase: Supabase client
        limit: Optional limit on number of users to fetch
        
    Returns:
        List of user node dictionaries
    """
    query = supabase.table('user_nodes').select('*')
    
    if limit:
        query = query.limit(limit)
        
    response = query.execute()
    
    if response.data:
        logger.info(f"Fetched {len(response.data)} user nodes")
        return response.data
    else:
        logger.warning("No user nodes found")
        return []


def fetch_posts_in_period(supabase: Client, start_date, end_date, limit: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Fetch posts (AUTHORED edges) created within the specified time period.
    
    Args:
        supabase: Supabase client
        start_date: Start date for filtering
        end_date: End date for filtering
        limit: Optional limit on number of posts to fetch
        
    Returns:
        List of AUTHORED edge dictionaries representing posts
    """
    query = supabase.table('cast_edges').select('*')
    
    # Filter for posts only
    query = query.eq('edge_type', 'AUTHORED')
    
    # Add date filtering
    query = query.gte('created_at', start_date.isoformat())
    query = query.lte('created_at', end_date.isoformat())
    
    if limit:
        query = query.limit(limit)
        
    response = query.execute()
    
    if response.data:
        logger.info(f"Fetched {len(response.data)} posts for date range {start_date.date()} to {end_date.date()}")
        return response.data
    else:
        logger.warning("No posts found for the specified date range")
        return []


def fetch_engagements_with_posts(supabase: Client, post_cast_ids: List[str], 
                                limit: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Fetch engagements (LIKED, REPLIED, RECASTED) with specific posts.
    
    Args:
        supabase: Supabase client
        post_cast_ids: List of cast IDs to get engagements for
        limit: Optional limit on number of engagements to fetch
        
    Returns:
        List of engagement edge dictionaries
    """
    if not post_cast_ids:
        return []
    
    query = supabase.table('cast_edges').select('*')
    
    # Filter for engagement types only
    query = query.in_('edge_type', ['LIKED', 'REPLIED', 'RECASTED'])
    
    # Filter for specific posts
    query = query.in_('cast_id', post_cast_ids)
    
    if limit:
        query = query.limit(limit)
        
    response = query.execute()
    
    if response.data:
        logger.info(f"Fetched {len(response.data)} engagements with posts")
        return response.data
    else:
        logger.warning("No engagements found for the specified posts")
        return []


def fetch_cast_edges_with_date_filter(supabase: Client, start_date, end_date, 
                                     edge_types: Optional[List[str]] = None, 
                                     limit: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Fetch cast edges (user interactions) from the database with date filtering.
    
    Args:
        supabase: Supabase client
        start_date: Start date for filtering
        end_date: End date for filtering
        edge_types: Optional list of edge types to filter by ('AUTHORED', 'LIKED', 'RECASTED', 'REPLIED')
        limit: Optional limit on number of edges to fetch
        
    Returns:
        List of edge dictionaries
    """
    query = supabase.table('cast_edges').select('*')
    
    # Add date filtering
    query = query.gte('created_at', start_date.isoformat())
    query = query.lte('created_at', end_date.isoformat())
    
    if edge_types:
        query = query.in_('edge_type', edge_types)
    
    if limit:
        query = query.limit(limit)
        
    response = query.execute()
    
    if response.data:
        logger.info(f"Fetched {len(response.data)} cast edges for date range {start_date.date()} to {end_date.date()}")
        return response.data
    else:
        logger.warning("No cast edges found for the specified date range")
        return []


def fetch_cast_edges(supabase: Client, edge_types: Optional[List[str]] = None, 
                     limit: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Fetch cast edges (user interactions) from the database.
    
    Args:
        supabase: Supabase client
        edge_types: Optional list of edge types to filter by ('AUTHORED', 'LIKED', 'RECASTED', 'REPLIED')
        limit: Optional limit on number of edges to fetch
        
    Returns:
        List of edge dictionaries
    """
    query = supabase.table('cast_edges').select('*')
    
    if edge_types:
        query = query.in_('edge_type', edge_types)
    
    if limit:
        query = query.limit(limit)
        
    response = query.execute()
    
    if response.data:
        logger.info(f"Fetched {len(response.data)} cast edges")
        return response.data
    else:
        logger.warning("No cast edges found")
        return []


def fetch_music_library(supabase: Client, limit: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Fetch music library data for user-artist relationships.
    
    Args:
        supabase: Supabase client
        limit: Optional limit on number of records to fetch
        
    Returns:
        List of music library dictionaries
    """
    query = supabase.table('music_library').select('*')
    
    if limit:
        query = query.limit(limit)
        
    response = query.execute()
    
    if response.data:
        logger.info(f"Fetched {len(response.data)} music library records")
        return response.data
    else:
        logger.warning("No music library records found")
        return []


def fetch_cast_nodes(supabase: Client, limit: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Fetch cast nodes (posts) from the database.
    
    Args:
        supabase: Supabase client  
        limit: Optional limit on number of casts to fetch
        
    Returns:
        List of cast node dictionaries
    """
    query = supabase.table('cast_nodes').select('*')
    
    if limit:
        query = query.limit(limit)
        
    response = query.execute()
    
    if response.data:
        logger.info(f"Fetched {len(response.data)} cast nodes")
        return response.data
    else:
        logger.warning("No cast nodes found")
        return []


def fetch_user_cast_counts(supabase: Client, user_ids: List[int]) -> Dict[int, int]:
    """
    Get count of music posts for each user (needed for trust score calculation).
    
    Args:
        supabase: Supabase client
        user_ids: List of user IDs to get counts for
        
    Returns:
        Dictionary mapping user_id to count of music posts
    """
    if not user_ids:
        return {}
    
    # Get cast counts by querying cast_edges for AUTHORED edges
    # For AUTHORED edges: source_user_id = author, target_user_id = cast/content
    response = supabase.table('cast_edges')\
        .select('source_user_id')\
        .eq('edge_type', 'AUTHORED')\
        .in_('source_user_id', user_ids)\
        .execute()
    
    if not response.data:
        return {user_id: 0 for user_id in user_ids}
    
    # Count posts per user
    counts = {}
    for edge in response.data:
        user_id = int(edge['source_user_id'])  # Convert to int to match expected type
        counts[user_id] = counts.get(user_id, 0) + 1
    
    # Ensure all requested user_ids are in the result
    for user_id in user_ids:
        if user_id not in counts:
            counts[user_id] = 0
            
    logger.info(f"Fetched post counts for {len(counts)} users")
    return counts


def get_edge_weights() -> Dict[str, float]:
    """
    Get the standard edge weights for different interaction types.
    
    Returns:
        Dictionary mapping edge type to weight
    """
    return {
        'AUTHORED': 10.0,    # User created the cast
        'LIKED': 1.0,        # User liked the cast  
        'RECASTED': 3.0,     # User recasted the cast
        'REPLIED': 2.0       # User replied to the cast
    }


def get_trust_edge_weights() -> Dict[str, float]:
    """
    Get the trust-specific edge weights (different from social graph weights).
    
    Returns:
        Dictionary mapping edge type to trust weight
    """
    return {
        'LIKED': 1.0,        # Explicit endorsement
        'REPLIED': 0.5,      # Engagement but not full endorsement  
        'RECASTED': 2.0      # Strongest signal - sharing with network
        # Note: AUTHORED is not included in trust calculations
    }