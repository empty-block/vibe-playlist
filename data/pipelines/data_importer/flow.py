"""
Jamzy Graph Import - Modular Pipeline

This module provides modular functions for importing Jamzy graph data:
- process_jamzy_edges_and_nodes: Process all graph edges and nodes, including users, casts, and reactions
- process_embeds: Process cast embeds

Each function is self-contained and handles its own referential integrity. The edge
processing is smart enough to extract and insert complete cast data from the edge query,
eliminating the need for placeholder casts and reducing database operations.
"""

from prefect import flow
import os
import sys
from dotenv import load_dotenv
load_dotenv()
import polars as pl
import asyncio
from datetime import datetime, timezone, timedelta
from data.pipelines.data_importer.lib.dune import batch_fetch_dune
from data.pipelines.data_importer.lib.data_cleaning import (
    polars_clean_text,
    ensure_valid_timestamps,
    normalize_cast_ids,
    format_timestamps
)
from data.pipelines.data_importer.lib.db import (
    insert_user_nodes,
    insert_cast_nodes,
    insert_edges,
    insert_embeds
)

@flow(name="Process Jamzy Graph Data")
async def process_edges(testing: bool = False, start_time: str = None, end_time: str = None):
    """
    Process complete Jamzy graph data including users, casts, and reactions:
    1. Fetch reaction edges with user info
    2. Extract users and insert them
    3. Extract complete cast data from the edges and insert casts
    4. Insert reactions
    
    This function provides a comprehensive solution for processing all graph elements in one step.
    
    Args:
        testing: If True, only process ~100 reactions for testing purposes and skip DB insertion
        start_time: Optional start time for the data import
        end_time: Optional end time for the data import
    """
    print("\n=== PROCESSING COMPLETE JAMZY GRAPH DATA ===\n")

    dune_params = {
        "start_time": start_time,
        "end_time": end_time
    }
    
    # STEP 1: Fetch all edges from Dune
    edge_df = batch_fetch_dune(
        query_id=4937382,  # music_cast_edges
        params=dune_params,
        api_key=os.environ.get("DUNE_API_KEY")
    )
    
    print(f"Fetched {edge_df.shape[0]} edges with user info")
    if edge_df.shape[0] == 0:
        print("No reactions to process")
        return {"reactions": 0, "reactors": 0}
    
    # Limit to ~100 rows if in testing mode
    if testing and edge_df.shape[0] > 100:
        print(f"TESTING MODE: Limiting to 100 reactions (out of {edge_df.shape[0]})")
        edge_df = edge_df.head(100)
    
    # Debug data types of key columns
    print(f"Column types: {edge_df.schema}")
    print(f"Sample edge data: {edge_df.head(3)}")
    
    # STEP 2: Extract and insert user data
    # First, extract source users
    source_users_df = edge_df.select([
        pl.col('source_user_id').alias('node_id'),
        pl.col('user_fname').alias('fname'),
        pl.col('user_display_name').alias('display_name'),
        pl.col('user_avatar_url').alias('avatar_url')
    ])
    
    # We need to also extract target users, but the query doesn't provide their details
    # So just grab the IDs to ensure they exist in the database
    target_user_ids = edge_df.select([
        pl.col('target_user_id').alias('node_id')
    ]).unique('node_id')
    
    # Add missing columns to target_user_ids to match source_users_df
    for col in source_users_df.columns:
        if col not in target_user_ids.columns and col != 'node_id':
            target_user_ids = target_user_ids.with_columns(pl.lit("").alias(col))
    
    # Combine source and target users, keeping all columns from source_users_df
    # Use 'vertical' for stacking dataframes and then deduplicate
    user_df = pl.concat([source_users_df, target_user_ids], how="vertical")
    user_df = user_df.unique('node_id')
    
    print(f"Extracted {user_df.shape[0]} unique users (including source and target)")
    
    # Clean text data for user fields
    text_columns = ['fname', 'display_name', 'avatar_url']
    user_df = polars_clean_text(user_df, text_columns)
    print(f"User sample after cleaning: {user_df.head(3)}")
    
    # Insert users
    print(f"Inserting {user_df.shape[0]} users")
    if not testing:
        await insert_user_nodes(user_df, batch_size=5000)
    else:
        print(f"TESTING MODE: Skipping database insertion of {user_df.shape[0]} users")
    
    # STEP 3: Extract and insert complete cast data from AUTHORED edges
    # Filter to just the AUTHORED edges which contain full cast data
    authored_edges = edge_df.filter(pl.col('edge_type') == 'AUTHORED')
    print(f"Found {authored_edges.shape[0]} AUTHORED edges with complete cast data")
    
    # Also extract REPLIED edges which contain reply cast data
    replied_edges = edge_df.filter(pl.col('edge_type') == 'REPLIED')
    print(f"Found {replied_edges.shape[0]} REPLIED edges with reply cast data")
    
    # Combine authored and replied edges to get all casts that need to be inserted
    cast_source_edges = pl.concat([authored_edges, replied_edges], how="vertical")
    print(f"Total edges with cast data: {cast_source_edges.shape[0]}")
    
    if cast_source_edges.shape[0] > 0:
        # Create a dataframe with all cast data
        cast_df = cast_source_edges.select([
            pl.col('cast_id').alias('node_id'),
            pl.col('source_user_id').alias('author_fid'),
            pl.col('created_at'),
            pl.col('cast_text'),
            pl.col('cast_channel'),
            # Uncomment if cast_embeds is needed
            # pl.col('cast_embeds'),
        ]).unique('node_id')
        
        # Clean text data for cast fields
        text_columns = ['cast_text']
        cast_df = polars_clean_text(cast_df, text_columns)
        
        # Format timestamps
        cast_df = format_timestamps(cast_df, ['created_at'])
        
        print(f"Extracted {cast_df.shape[0]} unique casts with complete data")
        print(f"Cast sample: {cast_df.head(3)}")
        
        # Insert casts - any duplicates will be ignored by the database
        if not testing:
            await insert_cast_nodes(cast_df, batch_size=10000)
        else:
            print(f"TESTING MODE: Skipping database insertion of {cast_df.shape[0]} casts")
    else:
        print("No cast-containing edges found, skipping cast insertion")
    
    # STEP 4: Create a clean edge dataframe with only necessary columns
    edge_insert_df = edge_df.select([
        pl.col('source_user_id'),
        pl.col('target_user_id'),
        pl.col('cast_id'),
        pl.col('edge_type'),
        pl.col('created_at')
    ])
    
    print("Edge data sample before processing:")
    print(edge_insert_df.head(3))
    
    # Format timestamps
    edge_insert_df = format_timestamps(edge_insert_df, ['created_at'])
    
    # Normalize cast IDs
    edge_insert_df = normalize_cast_ids(edge_insert_df, 'cast_id')
    
    # Insert edges
    if edge_insert_df.shape[0] == 0:
        print("WARNING: No edges left to insert!")
        return {"reactions": 0, "reactors": user_df.shape[0]}
    
    print(f"Inserting {edge_insert_df.shape[0]} edges")
    print("Final edge data sample:")
    print(edge_insert_df.head(3))
    
    if not testing:
        try:
            # Try direct insertion first
            await insert_edges(edge_insert_df, batch_size=10000)
            print("All edges inserted successfully")
        except Exception as e:
            error_str = str(e).lower()
            
            # Only handle foreign key constraints for missing casts
            if 'foreign key constraint' in error_str and 'cast_id' in error_str:
                print("Some edges reference non-existent casts. This indicates a problem with the cast extraction.")
                print(f"Error details: {str(e)}")
            else:
                # For other errors, re-raise
                raise
    else:
        print(f"TESTING MODE: Skipping database insertion of {edge_insert_df.shape[0]} edges")
    
    print("\n=== GRAPH DATA PROCESSING COMPLETE ===\n")
    return {
        "reactions": edge_insert_df.shape[0], 
        "reactors": user_df.shape[0], 
        "casts": cast_source_edges.shape[0],
        "authored": authored_edges.shape[0],
        "replies": replied_edges.shape[0]
    }

@flow(name="Process Cast Embeds")
async def process_embeds(testing: bool = False, start_time: str = None, end_time: str = None):
    """
    Process cast embeds (music links, etc.)
    
    Args:
        testing: If True, only process ~100 embeds for testing purposes and skip DB insertion
        start_time: Optional start time for the data import
        end_time: Optional end time for the data import
    """
    print("\n=== PROCESSING CAST EMBEDS ===\n")
    
    dune_params = {
        "start_time": start_time,
        "end_time": end_time
    }
    
    # Fetch all cast embeds from Dune
    embed_df = batch_fetch_dune(
        query_id=4968426,  # music_cast_embeds
        params=dune_params,
        api_key=os.environ.get("DUNE_API_KEY")
    )
    
    print(f"Fetched {embed_df.shape[0]} cast embeds")
    if embed_df.shape[0] == 0:
        print("No embeds to process")
        return {"embeds": 0}
    
    # Limit to ~100 rows if in testing mode
    if testing and embed_df.shape[0] > 100:
        print(f"TESTING MODE: Limiting to 100 embeds (out of {embed_df.shape[0]})")
        embed_df = embed_df.head(100)
    
    # Debug data types of key columns
    print(f"Column types: {embed_df.schema}")
    print(f"Sample embed data: {embed_df.head(3)}")

    # Map cast_hash to cast_id if needed (Dune may return cast_hash but our table expects cast_id)
    if 'cast_hash' in embed_df.columns and 'cast_id' not in embed_df.columns:
        print("Mapping cast_hash to cast_id for schema compatibility")
        embed_df = embed_df.rename({'cast_hash': 'cast_id'})
    elif 'cast_hash' in embed_df.columns and 'cast_id' in embed_df.columns:
        print("Both cast_hash and cast_id present, dropping cast_hash")
        embed_df = embed_df.drop('cast_hash')
    
    # Clean text data for embed fields
    text_columns = ['embed_url']
    if 'embed_type' in embed_df.columns:
        text_columns.append('embed_type')
    
    print(f"Cleaning text data for embed fields: {text_columns}")
    embed_df = polars_clean_text(embed_df, text_columns)
    
    # Print sample after cleaning
    print(f"Sample after text cleaning: {embed_df.head(3)}")
    
    # Format timestamps
    timestamp_cols = ['created_at']
    embed_df = format_timestamps(embed_df, timestamp_cols)
    
    # Print sample after timestamp validation
    print("Sample after timestamp validation:")
    print(embed_df.select(timestamp_cols).head(3))
    
    # Insert all embeds at once - the insert_embeds function already handles batching
    print(f"Inserting {embed_df.shape[0]} embeds")
    if not testing:
        await insert_embeds(embed_df)
    else:
        print(f"TESTING MODE: Skipping database insertion of {embed_df.shape[0]} embeds")
    
    print("\n=== EMBED PROCESSING COMPLETE ===\n")
    return {"embeds": embed_df.shape[0]}

@flow(name="Jamzy Data Import")
async def import_jamzy_data(
    run_edges: bool = True, 
    run_embeds: bool = True, 
    testing: bool = False, 
    start_time: str = None, 
    end_time: str = None
):
    """
    Orchestration flow that runs one or both Jamzy data import processes.
    
    Args:
        run_edges: Whether to run the edge/graph data import
        run_embeds: Whether to run the embeds data import
        testing: If True, only process ~100 items for testing purposes and skip DB insertion
        start_time: Optional start time for the data import
        end_time: Optional end time for the data import
    
    Returns:
        Dictionary with summary of processed items
    """
    results = {}
    
    # Set default time range if not provided
    if not start_time or not end_time:
        today = datetime.now(timezone.utc)
        tomorrow = today + timedelta(days=1)
        
        if not start_time:
            start_time = "2025-01-01 00:00:00"  # Use 2025 as the data uses 2025 dates
        
        if not end_time:
            end_time = tomorrow.strftime("%Y-%m-%d %H:%M:%S")  # Use tomorrow as the end date
    
    # Process graph data if requested
    if run_edges:
        print("\n=== STARTING EDGE/GRAPH DATA IMPORT ===\n")
        edge_results = await process_edges(
            testing=testing,
            start_time=start_time, 
            end_time=end_time
        )
        results.update(edge_results)
    
    # Process embeds if requested
    if run_embeds:
        print("\n=== STARTING EMBED DATA IMPORT ===\n")
        embed_results = await process_embeds(
            testing=testing,
            start_time=start_time, 
            end_time=end_time
        )
        results.update(embed_results)
    
    # Print overall summary
    print("\n=== COMPLETE IMPORT SUMMARY ===")
    if run_edges:
        print(f"Processed {results.get('reactions', 0)} edges")
        print(f"Processed {results.get('reactors', 0)} users")
        print(f"Processed {results.get('casts', 0)} casts (authored: {results.get('authored', 0)}, replies: {results.get('replies', 0)})")
    
    if run_embeds:
        print(f"Processed {results.get('embeds', 0)} embeds")
    print("=============================\n")
    
    return results

if __name__ == "__main__":
    # For local testing/execution
    print("""
    ========================================================================
          
           ██╗ █████╗ ███╗   ███╗███████╗██╗   ██╗
           ██║██╔══██╗████╗ ████║╚══███╔╝╚██╗ ██╔╝
           ██║███████║██╔████╔██║  ███╔╝  ╚████╔╝ 
      ██   ██║██╔══██║██║╚██╔╝██║ ███╔╝    ╚██╔╝  
      ╚█████╔╝██║  ██║██║ ╚═╝ ██║███████╗   ██║   
       ╚════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝   ╚═╝   
                   
             🎧 Data Import Pipeline 🎧
    ========================================================================
    
    This script processes Farcaster music data in a modular way:
    
    1. Process graph data: Creates all nodes (users, casts) and edges (reactions)
       in one comprehensive step
    2. Process embeds: Inserts music embed data for casts
    
    Options:
    - testing=True: Limit processing to ~100 entries of each type and skip DB insertion
    - run_edges=True/False: Control whether to process graph data
    - run_embeds=True/False: Control whether to process embed data
    ========================================================================
    """)
    
    # Set testing mode - change to True to only process ~100 entries of each type and skip DB insertion
    testing_mode = False
    
    # Control which processes to run
    run_edges_process = True
    run_embeds_process = True

    today = datetime.now(timezone.utc)
    tomorrow = today + timedelta(days=1)

    start_time = "2025-06-01 00:00:00"  
    end_time = tomorrow.strftime("%Y-%m-%d %H:%M:%S")  # Use tomorrow as the end date
    
    # Run the orchestration flow
    results = asyncio.run(import_jamzy_data(
        run_edges=run_edges_process,
        run_embeds=run_embeds_process,
        testing=testing_mode,
        start_time=start_time, 
        end_time=end_time
    ))
    
    # Ensure the script terminates properly
    sys.exit(0)
