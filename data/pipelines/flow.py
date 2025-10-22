"""
Unified Jamzy Data Pipeline

This orchestrator runs all three pipeline stages sequentially using Prefect task dependencies:
1. Data Importer: Import raw cast and user data from Dune
2. Metadata Extractor: Extract URL metadata from embeds  
3. Cast Music Parser: Parse music information using AI

Uses Prefect's wait_for dependencies to ensure proper completion sequencing.
"""

import asyncio
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from prefect import flow, task

# Import the three pipeline stages
from data.pipelines.data_importer.flow import import_jamzy_data
from data.pipelines.metadata_extractor.flow import extract_url_metadata
from data.pipelines.cast_music_parser.flow import cast_music_parser_flow
from data.pipelines.cast_music_parser.lib.claude import get_model_info

@task(name="Data Import Stage", log_prints=True)
async def data_import_stage(
    start_time: str,
    end_time: str,
    testing: bool = False
) -> Dict[str, Any]:
    """Task wrapper for data import pipeline"""
    print("🔄 STAGE 1: DATA IMPORT")
    print("-" * 40)
    
    stage_start = datetime.now(timezone.utc)
    result = await import_jamzy_data(
        run_edges=True,
        run_embeds=True,
        testing=testing,
        start_time=start_time,
        end_time=end_time
    )
    duration = (datetime.now(timezone.utc) - stage_start).total_seconds()
    
    print(f"✅ Stage 1 completed in {duration:.1f}s")
    print(f"   Result: {result}\n")
    
    return {
        "result": result,
        "duration_seconds": duration,
        "success": True
    }

@task(name="Metadata Extraction Stage", log_prints=True)
async def metadata_extraction_stage(
    start_time: str,
    end_time: str,
    batch_size: int = 50,
    testing: bool = False
) -> Dict[str, Any]:
    """Task wrapper for metadata extraction pipeline"""
    print("🔄 STAGE 2: METADATA EXTRACTION")
    print("-" * 40)
    
    stage_start = datetime.now(timezone.utc)
    result = await extract_url_metadata(
        batch_size=batch_size,
        testing=testing,
        start_time=start_time,
        end_time=end_time
    )
    duration = (datetime.now(timezone.utc) - stage_start).total_seconds()
    
    print(f"✅ Stage 2 completed in {duration:.1f}s")
    print(f"   Result: {result}\n")
    
    return {
        "result": result,
        "duration_seconds": duration,
        "success": True
    }

@task(name="Music Parsing Stage", log_prints=True)
async def music_parsing_stage(
    start_time: str,
    end_time: str,
    batch_size: int = 50,
    model: str = "claude-3-5-haiku-20241022",
    testing: bool = False
) -> Dict[str, Any]:
    """Task wrapper for music parsing pipeline"""
    print("🔄 STAGE 3: MUSIC PARSING")
    print("-" * 40)
    
    stage_start = datetime.now(timezone.utc)
    result = await cast_music_parser_flow(
        start_time=start_time,
        end_time=end_time,
        model=model,
        batch_size=batch_size,
        testing=testing
    )
    duration = (datetime.now(timezone.utc) - stage_start).total_seconds()
    
    print(f"✅ Stage 3 completed in {duration:.1f}s")
    print(f"   Result: {result}\n")
    
    return {
        "result": result,
        "duration_seconds": duration,
        "success": True
    }

@flow(name="Unified Jamzy Data Pipeline")
async def unified_jamzy_pipeline(
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    testing: bool = False,
    batch_size: int = 50,
    model: str = "claude-3-5-haiku-20241022"
) -> Dict[str, Any]:
    """
    Unified pipeline that runs all three Jamzy data processing stages sequentially
    using Prefect task dependencies to ensure proper completion.
    
    1. Data Import → 2. Metadata Extraction → 3. Music Parsing
    
    Each stage is wrapped as a Prefect task with wait_for dependencies to ensure
    the previous stage fully completes before the next stage begins.
    
    Args:
        start_time: Start time for data processing (YYYY-MM-DD HH:MM:SS)
        end_time: End time for data processing (YYYY-MM-DD HH:MM:SS)
        testing: If True, run in testing mode (smaller batches, limited processing)
        batch_size: Batch size for processing (auto-optimized for AI efficiency)
        model: Claude model for Stage 3 music parsing (default: claude-3-5-haiku-20241022)
        
    Returns:
        Dictionary with comprehensive results from all stages
    """
    
    # Auto-optimize batch size for AI efficiency
    model_info = get_model_info(model)
    optimal_batch_size = model_info['recommended_batch_size']
    
    if batch_size != optimal_batch_size:
        print(f"⚡ Auto-optimizing batch size: {optimal_batch_size} (was {batch_size}) for {model_info['name']}")
        batch_size = optimal_batch_size
    
    print("\n" + "="*60)
    print("🎵 UNIFIED JAMZY DATA PIPELINE")
    print("="*60)
    print(f"📅 Time Range: {start_time or 'Auto'} to {end_time or 'Auto'}")
    print(f"🧪 Testing Mode: {'ON' if testing else 'OFF'}")
    print(f"🤖 AI Model: {model_info['name']}")
    print(f"📦 Optimized Batch Size: {batch_size}")
    print("🔄 Using Prefect task dependencies for proper sequencing")
    print("="*60 + "\n")
    
    # Set default time range if not provided
    if not start_time or not end_time:
        now = datetime.now(timezone.utc)
        if not end_time:
            end_time = now.strftime("%Y-%m-%d %H:%M:%S")
        if not start_time:
            # Default to 24 hours ago for incremental processing
            yesterday = now - timedelta(days=1)
            start_time = yesterday.strftime("%Y-%m-%d %H:%M:%S")
        
        print(f"📅 Using default time range: {start_time} to {end_time}\n")
    
    pipeline_start = datetime.now(timezone.utc)
    
    try:
        # Submit all tasks with proper dependencies
        # Stage 1: Data Import (no dependencies)
        stage1_future = data_import_stage.submit(
            start_time=start_time,
            end_time=end_time,
            testing=testing
        )
        
        # Stage 2: Metadata Extraction (waits for Stage 1)
        stage2_future = metadata_extraction_stage.submit(
            start_time=start_time,
            end_time=end_time,
            batch_size=batch_size,
            testing=testing,
            wait_for=[stage1_future]
        )
        
        # Stage 3: Music Parsing (waits for Stage 2)
        stage3_future = music_parsing_stage.submit(
            start_time=start_time,
            end_time=end_time,
            batch_size=batch_size,
            model=model,
            testing=testing,
            wait_for=[stage2_future]
        )
        
        # Get all results (they'll execute in dependency order, .result() is synchronous)
        print("⏳ Waiting for all pipeline stages to complete...")
        stage1_result = stage1_future.result()
        stage2_result = stage2_future.result()  
        stage3_result = stage3_future.result()
        
        # Calculate total duration
        total_duration = (datetime.now(timezone.utc) - pipeline_start).total_seconds()
        
        # Build comprehensive results
        pipeline_results = {
            "success": True,
            "start_time": start_time,
            "end_time": end_time,
            "testing_mode": testing,
            "total_processing_time": total_duration,
            "stage_results": {
                "data_import": stage1_result,
                "metadata_extraction": stage2_result,
                "music_parsing": stage3_result
            },
            "error": None
        }
        
    except Exception as e:
        # Any stage failure stops the entire pipeline
        total_duration = (datetime.now(timezone.utc) - pipeline_start).total_seconds()
        error_msg = f"Pipeline failed: {str(e)}"
        print(f"❌ PIPELINE FAILED: {error_msg}\n")
        
        pipeline_results = {
            "success": False,
            "start_time": start_time,
            "end_time": end_time,
            "testing_mode": testing,
            "total_processing_time": total_duration,
            "stage_results": {},
            "error": error_msg
        }
    
    # Final Summary
    print("="*60)
    print("📊 PIPELINE SUMMARY")
    print("="*60)
    print(f"⏱️  Total Duration: {pipeline_results['total_processing_time']:.1f}s")
    print(f"🎯 Overall Success: {'YES' if pipeline_results['success'] else 'NO'}")
    
    if pipeline_results["success"]:
        print(f"\n📈 Stage Performance:")
        for stage_name, stage_data in pipeline_results["stage_results"].items():
            duration = stage_data.get("duration_seconds", 0)
            print(f"   ✅ {stage_name}: {duration:.1f}s")
            
        # Show data processing summary
        data_import = pipeline_results["stage_results"]["data_import"]["result"]
        metadata_extraction = pipeline_results["stage_results"]["metadata_extraction"]["result"] 
        music_parsing = pipeline_results["stage_results"]["music_parsing"]["result"]
        
        print(f"\n📊 Data Processing Summary:")
        print(f"   📥 Data Import: {data_import}")
        print(f"   🔗 Metadata Extraction: {metadata_extraction.get('urls_processed', 0)} URLs processed")
        print(f"   🎵 Music Parsing: {music_parsing.get('music_extractions', 0)} extractions")
        
    else:
        print(f"\n❌ Pipeline Error: {pipeline_results.get('error', 'Unknown error')}")
    
    print("="*60 + "\n")
    
    return pipeline_results

@flow(name="Unified Jamzy Pipeline - Quick Stats")
async def pipeline_stats():
    """
    Quick flow to show current pipeline statistics without processing data
    """
    print("\n📊 JAMZY PIPELINE STATISTICS")
    print("="*50)
    
    try:
        # Import the stats functions from each pipeline
        from data.pipelines.data_importer.lib.db import test_database_connection
        from data.pipelines.cast_music_parser.lib.db import get_stats_task, test_db_task
        
        # Test connections
        print("🔗 Testing database connections...")
        
        # Test main database
        main_db_ok = await test_database_connection()
        print(f"   Main Database: {'✅ Connected' if main_db_ok else '❌ Failed'}")
        
        # Test music parser database
        music_db_ok = await test_db_task()
        print(f"   Music Parser DB: {'✅ Connected' if music_db_ok else '❌ Failed'}")
        
        if music_db_ok:
            # Get music parser stats
            print("\n📈 Music Processing Statistics:")
            stats = await get_stats_task()
            print(f"   Total casts: {stats['total_casts']:,}")
            print(f"   Total embeds: {stats['total_embeds']:,}")
            print(f"   Successful embeds: {stats['successful_embeds']:,}")
            print(f"   Processed casts: {stats['processed_casts']:,}")
        
        print("\n" + "="*50)
        return {"connection_status": {"main_db": main_db_ok, "music_db": music_db_ok}}
        
    except Exception as e:
        print(f"❌ Error getting stats: {str(e)}")
        return {"error": str(e)}

if __name__ == "__main__":
    """
    Local execution script for testing the unified pipeline
    """
    print("""
    ========================================================================
    🎵 JAMZY UNIFIED DATA PIPELINE 🎵
    ========================================================================
    
    This unified pipeline orchestrates three sequential stages:
    
    1. 📥 DATA IMPORT: Fetch raw cast and user data from Dune Analytics
    2. 🔗 METADATA EXTRACTION: Extract URL metadata from embeds
    3. 🎵 MUSIC PARSING: Parse music information using Claude AI
    
    Features:
    - Sequential execution with dependency management
    - Comprehensive error handling and recovery
    - Unified parameter interface
    - Progress tracking and detailed reporting
    - Testing mode for development
    - Stage-selective execution
    ========================================================================
    """)
    
    # Configuration
    testing_mode = False  # Set to False for production runs
    
    # Time range (adjust as needed)
    now = datetime.now(timezone.utc)
    tomorrow = now + timedelta(days=1)

    start_time = (now - timedelta(days=3)).strftime("%Y-%m-%d %H:%M:%S")
    end_time = now.strftime("%Y-%m-%d %H:%M:%S")
    

    start_time = datetime(2025, 8, 1).strftime("%Y-%m-%d %H:%M:%S")
    end_time = datetime(2025, 9, 17).strftime("%Y-%m-%d %H:%M:%S")
    
    
    print(f"Configuration:")
    print(f"  Testing Mode: {testing_mode}")
    print(f"  Time Range: {start_time} to {end_time}")
    print(f"  Batch Size: 20")
    print("\nStarting pipeline...\n")
    
    # Run the unified pipeline
    try:
        results = asyncio.run(unified_jamzy_pipeline(
            start_time=start_time,
            end_time=end_time,
            testing=testing_mode,
            batch_size=50
        ))
        
        print(f"Pipeline completed with success: {results['success']}")
        
    except KeyboardInterrupt:
        print("\n🛑 Pipeline interrupted by user")
    except Exception as e:
        print(f"\n💥 Pipeline failed with error: {str(e)}") 