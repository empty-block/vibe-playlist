"""
Cast Music Parser Flow

Production pipeline that extracts music information from Farcaster casts using AI.
Combines cast text with URL metadata for improved accuracy.
"""

import asyncio
from typing import Optional
from datetime import datetime, timezone, timedelta
from prefect import flow

from data.pipelines.cast_music_parser.lib.db import (
    test_db_task,
    get_stats_task,
    get_embeds_in_range_task,
    assemble_embed_contexts_task,
    store_extractions_task
)
from data.pipelines.cast_music_parser.lib.claude import extract_music_task

@flow(name="Cast Music Parser")
async def cast_music_parser_flow(
    start_time: str,
    end_time: str,
    model: str = "claude-3-5-haiku-20241022",
    batch_size: int = 100,
    testing: bool = False
):
    """
    Main flow for extracting music information from Farcaster cast embeds
    
    Args:
        start_time: Start time filter (YYYY-MM-DD HH:MM:SS)
        end_time: End time filter (YYYY-MM-DD HH:MM:SS)
        model: Claude model to use for extraction
        batch_size: Number of embeds to process per batch
        testing: If True, only process one batch for testing
    """
    
    print("\n=== CAST MUSIC PARSER FLOW ===\n")
    print(f"📅 Date Range: {start_time} to {end_time}")
    print(f"🤖 Model: {model}")
    print(f"📦 Batch size: {batch_size}")
    
    if testing:
        print(f"🧪 TESTING MODE: Processing only 1 batch of {batch_size} embeds")
    else:
        print(f"🚀 PRODUCTION MODE: Processing all embeds in date range")

    results = {
        "processed_embeds": 0,
        "music_extractions": 0,
        "batches_processed": 0,
        "success": False,
        "date_range": f"{start_time} to {end_time}"
    }
    
    # Test database connection
    print("🔗 Testing database connection...")
    db_ok = await test_db_task()
    if not db_ok:
        print("❌ Database connection failed")
        return results
    
    # Get initial stats
    print("📈 Getting current stats...")
    initial_stats = await get_stats_task()
    print(f"  Total casts: {initial_stats['total_casts']:,}")
    print(f"  Total embeds: {initial_stats['total_embeds']:,}")
    print(f"  Embeds with metadata: {initial_stats['embeds_with_metadata']:,}")
    print(f"  Music extractions: {initial_stats['music_extractions']:,}")
    
    print(f"\n🤖 Using model: {model} with batch size: {batch_size}")
    
    # Process embeds in batches using built-in pagination
    print("\n🔍 Processing embeds in batches...")
    
    total_processed = 0
    total_extractions = 0
    batches_processed = 0
    offset = 0
    
    while True:
        print(f"\n--- BATCH {batches_processed + 1} ---")
        print(f"🔍 Fetching next {batch_size} embeds (offset: {offset})...")
        
        # Get next batch of embeds
        batch_embeds = await get_embeds_in_range_task(
            limit=batch_size,
            offset=offset,
            start_time=start_time,
            end_time=end_time
        )
        
        if not batch_embeds:
            print("✅ No more embeds to process")
            break
        
        print(f"📋 Processing {len(batch_embeds)} embeds")
        
        # Assemble enhanced context for this batch
        print(f"🔧 Assembling enhanced context...")
        embed_contexts = await assemble_embed_contexts_task(batch_embeds)
        
        if not embed_contexts:
            print("⚠️ No valid contexts assembled for this batch")
            offset += len(batch_embeds)
            continue
        
        print(f"📝 Successfully assembled {len(embed_contexts)} contexts")
        
        # Process this batch with AI
        print(f"🎵 Processing with AI...")
        batch_extractions = await extract_music_task(embed_contexts, model)
        
        if batch_extractions:
            print(f"✅ AI extracted {len(batch_extractions)} music items")
        else:
            print(f"ℹ️ No music content found in this batch")
        
        # Store extractions (upsert handles duplicates)
        if batch_extractions:
            print(f"💾 Storing extractions...")
            success = await store_extractions_task(batch_extractions)
            if success:
                print(f"✅ Stored {len(batch_extractions)} extractions")
            else:
                print("❌ Failed to store extractions")
        
        # Update counters
        batch_successful = len(batch_extractions) if batch_extractions else 0
        total_processed += len(batch_embeds)
        total_extractions += batch_successful
        batches_processed += 1
        
        print(f"Batch summary: {batch_successful} extractions from {len(batch_embeds)} embeds")
        
        # Move to next batch
        offset += len(batch_embeds)
        
        # In testing mode, stop after first batch
        if testing:
            print("🧪 Testing mode - stopping after first batch")
            break
        
        # Stop if we got fewer embeds than requested (end of data)
        if len(batch_embeds) < batch_size:
            print("✅ Reached end of data")
            break
    
    # Calculate final metrics
    extraction_rate = total_extractions / total_processed * 100 if total_processed > 0 else 0
    
    # Final stats
    final_stats = await get_stats_task()
    results.update({
        "processed_embeds": total_processed,
        "music_extractions": total_extractions,
        "batches_processed": batches_processed,
        "success": True
    })
    
    print(f"\n=== PIPELINE COMPLETE ===")
    print(f"Batches processed: {batches_processed}")
    print(f"Embeds processed: {total_processed}")
    print(f"Music extractions: {total_extractions}")
    print(f"Extraction rate: {extraction_rate:.1f}%")
    print(f"Total embeds in system: {final_stats['total_embeds']:,}")
    print(f"Total music extractions overall: {final_stats['music_extractions']:,}")
    print("=============================\n")
    
    return results

@flow(name="Cast Music Parser - Stats Only")
async def show_stats_flow():
    """Flow that only shows current processing statistics"""
    print("📊 Cast Music Parser Statistics")
    
    # Test database connection
    db_ok = await test_db_task()
    if not db_ok:
        return {"error": "Database connection failed"}
    
    # Get stats
    stats = await get_stats_task()
    
    print(f"\n📈 Processing Overview:")
    print(f"  Total casts: {stats['total_casts']:,}")
    print(f"  Total embeds: {stats['total_embeds']:,}")
    print(f"  Embeds with metadata: {stats['embeds_with_metadata']:,}")
    print(f"  Music extractions: {stats['music_extractions']:,}")
    
    if stats['embeds_with_metadata'] > 0:
        extraction_rate = stats['music_extractions'] / stats['embeds_with_metadata'] * 100
        print(f"  Extraction rate: {extraction_rate:.1f}%")
    
    return stats

if __name__ == "__main__":
    print("🎵 Cast Music Parser Flow")

    today = datetime.now(timezone.utc)
    tomorrow = today + timedelta(days=1)

    # Configuration
    testing_mode = False  # Set to True for one batch only
    batch_size = 100  # Standard batch size
    
    start_time = "2025-06-07 00:00:00"  
    end_time = tomorrow.strftime("%Y-%m-%d %H:%M:%S")  
    
    
    async def main():
        # Run the pipeline
        result = await cast_music_parser_flow(
            start_time=start_time,
            end_time=end_time,
            model="claude-3-5-haiku-20241022",  # Cost-efficient model
            batch_size=batch_size,
            testing=testing_mode
        )
        print(f"\n🎯 Results: {result}")
    
    asyncio.run(main())
