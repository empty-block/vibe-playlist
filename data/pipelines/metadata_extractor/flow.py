"""
URL Metadata Extraction Pipeline

Extracts Open Graph metadata from embed URLs and stores raw results for AI processing.
Uses simple batch processing with rate limiting to respect platform limits.
"""

import os
import sys
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any

from prefect import flow
from dotenv import load_dotenv
load_dotenv()

from data.pipelines.metadata_extractor.lib.db import (
    fetch_url_embeds_task,
    store_metadata_results_task,
    test_database_connection
)
from data.pipelines.metadata_extractor.lib.metadata_extractor import (
    extract_metadata_batch_task
)

@flow(name="URL Metadata Extraction")
async def extract_url_metadata(
    batch_size: int = 50,
    testing: bool = False,
    start_time: str = None,
    end_time: str = None
) -> Dict[str, Any]:
    """
    Extract Open Graph metadata from embed URLs
    
    Args:
        batch_size: Number of URLs to process per batch
        testing: If True, only process one batch and log extra details
        start_time: Start time for filtering embeds (YYYY-MM-DD HH:MM:SS)
        end_time: End time for filtering embeds (YYYY-MM-DD HH:MM:SS)
    
    Returns:
        Dictionary with processing summary
    """
    print("\n=== URL METADATA EXTRACTION PIPELINE ===\n")
    
    if start_time and end_time:
        print(f"Processing embeds from {start_time} to {end_time}")
    
    # Test database connection first
    print("Testing database connection...")
    db_ok = await test_database_connection()
    if not db_ok:
        print("❌ Database connection failed - aborting pipeline")
        return {"error": "Database connection failed"}
    
    # In testing mode, limit to one batch
    if testing:
        print(f"🧪 TESTING MODE: Processing only 1 batch of {batch_size} URLs")
    else:
        print(f"🚀 PRODUCTION MODE: Processing all unprocessed embeds")
    
    total_processed = 0
    total_successful = 0
    batches_processed = 0
    offset = 0
    
    # Process batches using simple offset pagination
    batch_num = 1
    while True:
        print(f"\n--- BATCH {batch_num} ---")
        
        # Fetch next batch of URL embeds using offset
        embeds = await fetch_url_embeds_task(batch_size, offset, start_time, end_time)
        
        if not embeds:
            print("No more URL embeds to process - pipeline complete")
            break
        
        # Extract metadata from this batch
        metadata_results = await extract_metadata_batch_task(embeds, batch_num)
        
        # Store results in database
        stored_ok = await store_metadata_results_task(metadata_results)
        
        if not stored_ok:
            print(f"❌ Failed to store batch {batch_num} - continuing with next batch")
        
        # Update totals
        batch_successful = len(metadata_results)  # All results are successful since failures aren't stored
        total_processed += len(metadata_results)
        total_successful += batch_successful
        batches_processed += 1
        
        print(f"Batch {batch_num} summary: {batch_successful}/{len(metadata_results)} successful")
        
        # In testing mode, stop after first batch
        if testing:
            break
        
        # Move to next batch
        offset += batch_size
        batch_num += 1
    
    # Final summary
    print(f"\n=== PIPELINE COMPLETE ===")
    print(f"Batches processed: {batches_processed}")
    print(f"URLs processed: {total_processed}")
    print(f"Successful extractions: {total_successful}")
    print(f"Success rate: {(total_successful/total_processed*100):.1f}%" if total_processed > 0 else "N/A")
    print("=============================\n")
    
    return {
        "batches_processed": batches_processed,
        "urls_processed": total_processed,
        "successful_extractions": total_successful,
        "success_rate": (total_successful/total_processed*100) if total_processed > 0 else 0
    }

if __name__ == "__main__":
    # For local testing/execution
    print("""
    ========================================================================
    ░░░░██╗░█████╗░███╗░░░███╗███████╗██╗░░░██╗
    ░░░░██║██╔══██╗████╗░████║╚════██║╚██╗░██╔╝
    ░░░░██║███████║██╔████╔██║░░███╔═╝░╚████╔╝░
    ██╗░██║██╔══██║██║╚██╔╝██║██╔══╝░░░░╚██╔╝░░
    ╚█████╔╝██║░░██║██║░╚═╝░██║███████╗░░░██║░░░
    ░╚════╝░╚═╝░░╚═╝╚═╝░░░░░╚═╝╚══════╝░░░╚═╝░░░
    
    URL METADATA EXTRACTION PIPELINE
    ========================================================================
    
    This pipeline extracts Open Graph metadata from embed URLs:
    
    1. Fetches unprocessed URL embeds from database (music platforms only!)
    2. Extracts raw metadata using web scraping
    3. Stores results for later AI processing
    
    Features:
    - Batch processing with rate limiting
    - Automatic retry on failures
    - Progress tracking and logging
    - Testing mode for development
    - Time range filtering for incremental processing
    - Music platform filtering (Spotify, YouTube, SoundCloud, etc.)
    
    Options:
    - testing=True: Process only one batch for testing
    - batch_size: Number of URLs per batch (default: 50)
    - start_time/end_time: Filter embeds by creation time
    ========================================================================
    """)
    
    # Configuration
    testing_mode = False  # Set to True for one batch only
    batch_size = 20 if testing_mode else 50  # Smaller batch for testing
    
    # Set default time range if not provided
    today = datetime.now(timezone.utc)
    tomorrow = today + timedelta(days=1)
    
    start_time = "2025-05-01 00:00:00"
    end_time = "2025-05-07 00:00:00"  
    
    # Run the pipeline
    results = asyncio.run(extract_url_metadata(
        batch_size=batch_size,
        testing=testing_mode,
        start_time=start_time,
        end_time=end_time
    ))
    
    print(f"Final results: {results}")
    sys.exit(0) 