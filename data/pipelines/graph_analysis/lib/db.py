"""
Database utility functions for graph analysis pipeline.

This module provides functions to query the database for edges
used to build user-to-user interaction graphs.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

# Import existing Supabase client setup
from data.lib.db import sb as supabase_client

logger = logging.getLogger(__name__)

async def get_user_node(user_id: str) -> Optional[Dict]:
    """
    Fetch a single user node by ID.
    
    Args:
        user_id: The user ID to fetch
        
    Returns:
        User node data or None if not found
    """
    try:
        response = supabase_client.from_("user_nodes").select("*").eq("node_id", user_id).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        logger.error(f"Error fetching user node {user_id}: {e}")
        return None

async def get_edges(
    days_lookback: Optional[int] = None,
    sampling_rate: Optional[float] = None,
    only_with_embeds: bool = False
) -> List[Dict]:
    """
    Fetch edges from the edge table with optional filtering.
    
    Args:
        days_lookback: Optional time window in days
        sampling_rate: Fraction of edges to include (0.0 to 1.0)
        only_with_embeds: Only return edges for casts that have embeds
        
    Returns:
        List of edge data with source_user_id and target_user_id
    """
    try:
        if only_with_embeds:
            # For edges with embeds, we need to join with the embeds table
            # Get cast_hashes from embeds table
            try:
                # Query uses cast_hash as per the schema
                embed_response = supabase_client.from_("embeds").select("cast_hash").execute()
                
                if not embed_response.data:
                    logger.warning("No embeds found")
                    return []
                    
                # Extract unique cast hashes 
                cast_hashes = list(set(item["cast_hash"] for item in embed_response.data))
                
                logger.info(f"Found {len(cast_hashes)} unique casts with embeds")
                
                # Now query edges for these cast hashes, matching cast_id with cast_hash
                query = supabase_client.from_("edges").select("*").in_("cast_id", cast_hashes)
            except Exception as e:
                logger.error(f"Error querying embeds: {e}")
                return []
        else:
            # Standard query without embed filtering
            query = supabase_client.from_("edges").select("*")
        
        # Apply date filter if specified
        if days_lookback:
            since = datetime.now() - timedelta(days=days_lookback)
            query = query.gte("created_at", since.isoformat())
            
        response = query.execute()
        
        logger.info(f"Found {len(response.data)} edges")
        
        # Apply sampling if needed
        if sampling_rate and sampling_rate < 1.0 and response.data:
            import random
            sampled_size = max(1, int(len(response.data) * sampling_rate))
            sampled_data = random.sample(response.data, sampled_size)
            logger.info(f"Sampled down to {len(sampled_data)} edges")
            return sampled_data
            
        return response.data
    except Exception as e:
        logger.error(f"Error fetching edges: {e}")
        return [] 