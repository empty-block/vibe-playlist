"""
Music Parser Database Operations

Updated to use new schema: cast_nodes + music_library + embeds_metadata
- Simplified composite key approach using (cast_id, embed_index)
- AI extracted music results stored in music_library table
"""

import os
import polars as pl
from typing import List, Dict, Optional
from datetime import datetime
from prefect import task

# Import the existing Supabase client and batch insert function
from data.lib.db import sb, batch_insert

async def insert_music_extractions(extractions: List[Dict]) -> bool:
    """
    Insert music extraction results using the robust batch_insert infrastructure
    
    Args:
        extractions: List of extraction dictionaries with cast_id, embed_index, music data, etc.
        
    Returns:
        True if successful, False otherwise
    """
    try:
        if not extractions:
            print("No extractions to store")
            return True
            
        # Convert to polars DataFrame - let the existing infrastructure handle everything
        df = pl.DataFrame([
            {
                'cast_id': extraction['cast_id'],
                'embed_index': extraction['embed_index'],
                'author_fid': extraction['author_fid'],
                'music_type': extraction.get('music_type', 'song'),
                'title': extraction['title'],
                'artist': extraction.get('artist'),
                'album': extraction.get('album'),
                'genre': extraction.get('genres', []),  # Phase 3: Genre array (note: db column is 'genre')
                'release_date': extraction.get('release_date'),  # Phase 3: Release date
                'platform_name': extraction.get('platform_name'),  # Include platform info
                'confidence_score': extraction.get('confidence_score'),
                'ai_model_version': extraction.get('ai_model_version', 'claude-3-sonnet'),
                'created_at': extraction.get('created_at', datetime.utcnow().isoformat()),
                'processed_at': datetime.utcnow().isoformat()
            }
            for extraction in extractions
        ])
        
        print(f"Using robust batch_insert for {len(extractions)} music extractions...")
        
        # Use the existing robust batch insert infrastructure
        await batch_insert(df, table_name='music_library')
        
        print(f"✅ Successfully stored {len(extractions)} music extractions")
        return True
            
    except Exception as e:
        print(f"❌ Error storing music extractions: {str(e)}")
        return False

async def get_embeds_in_range(
    limit: int = 500,  # Higher default, more reasonable for batch processing
    offset: int = 0,
    start_time: Optional[str] = None, 
    end_time: Optional[str] = None
) -> List[Dict]:
    """
    Get embeds in date range using direct filtering on embeds_metadata.created_at
    No JOINs needed - much simpler and faster!
    """
    try:
        print(f"🔍 Fetching embeds with limit: {limit}, offset: {offset}")
        if start_time or end_time:
            print(f"📅 Date range: {start_time or 'beginning'} to {end_time or 'end'}")
        
        # Simple query - filter embeds_metadata directly by created_at
        query = sb.table('embeds_metadata').select(
            'cast_id, embed_index, platform_name, og_metadata, created_at'
        )
        
        # Apply date filters directly on embeds_metadata.created_at  
        if start_time and end_time:
            query = query.gte('created_at', start_time).lte('created_at', end_time)
        elif start_time:
            query = query.gte('created_at', start_time)
        elif end_time:
            query = query.lte('created_at', end_time)
        
        # Apply ordering and pagination
        query = query.order('created_at', desc=True).range(offset, offset + limit - 1)
        
        # Execute query
        result = query.execute()
        
        if not result.data:
            print("No embeds found in date range")
            return []
        
        print(f"📊 Found {len(result.data)} embeds_metadata records")
        
        # Get unique cast_ids to fetch cast data
        cast_ids = list(set([item['cast_id'] for item in result.data]))
        print(f"📊 Unique cast_ids: {len(cast_ids)}")
        
        # Get cast_nodes data for these cast_ids
        cast_query = sb.table('cast_nodes').select('node_id, cast_text, author_fid').in_('node_id', cast_ids)
        cast_result = cast_query.execute()
        
        if not cast_result.data:
            print("No cast_nodes found")
            return []
        
        print(f"📊 Found {len(cast_result.data)} cast_nodes")
        
        # Create lookup dict for cast data
        cast_lookup = {cast['node_id']: cast for cast in cast_result.data}
        
        # Combine the data
        result_embeds = []
        for metadata in result.data:
            cast_data = cast_lookup.get(metadata['cast_id'])
            if cast_data:  # Only include if we have cast data
                result_embeds.append({
                    'cast_id': metadata['cast_id'],
                    'embed_index': metadata['embed_index'],
                    'platform_name': metadata.get('platform_name'),
                    'og_metadata': metadata.get('og_metadata', ''),
                    'created_at': metadata.get('created_at', ''),
                    'cast_text': cast_data.get('cast_text', ''),
                    'author_fid': cast_data.get('author_fid', ''),
                })
        
        print(f"✅ Found {len(result_embeds)} embeds in date range")
        return result_embeds
        
    except Exception as e:
        print(f"❌ Error getting embeds: {str(e)}")
        import traceback
        print(f"🐛 DEBUG: Traceback: {traceback.format_exc()}")
        return []

async def assemble_embed_context(embed: Dict) -> Dict:
    """
    Assemble context for a single embed including cast text and embed metadata
    
    Args:
        embed: Embed dictionary with cast_id, embed_index, og_metadata, cast_text, etc.
        
    Returns:
        Dictionary with cast text and embed metadata for AI processing
    """
    try:
        return {
            'cast_id': embed['cast_id'],
            'embed_index': embed['embed_index'],
            'cast_text': embed.get('cast_text', ''),
            'author_fid': embed.get('author_fid', ''),
            'created_at': embed.get('created_at', ''),
            'platform_name': embed.get('platform_name'),  # Include platform info
            'embed_metadata': clean_metadata_text(embed.get('og_metadata', ''))
        }
        
    except Exception as e:
        print(f"Error assembling embed context: {e}")
        return {
            'cast_id': embed.get('cast_id', ''),
            'embed_index': embed.get('embed_index', 0),
            'cast_text': '',
            'author_fid': '',
            'created_at': '',
            'platform_name': None,
            'embed_metadata': ''
        }

async def get_processing_stats() -> Dict:
    """
    Get comprehensive processing statistics for debugging
    """
    try:
        # Total casts in the system
        total_casts_result = sb.table('cast_nodes').select('node_id', count='exact').execute()
        total_casts = total_casts_result.count if total_casts_result.count else 0
        
        # Total embeds
        total_embeds_result = sb.table('embeds_metadata').select('cast_id, embed_index', count='exact').execute()
        total_embeds = total_embeds_result.count if total_embeds_result.count else 0
        
        # Total embeds with metadata
        embeds_with_metadata_result = sb.table('embeds_metadata').select(
            'cast_id, embed_index', count='exact'
        ).execute()
        embeds_with_metadata = embeds_with_metadata_result.count if embeds_with_metadata_result.count else 0
        
        # Music extractions (using upsert strategy, so no need to track processed vs unprocessed)
        music_extractions_result = sb.table('music_library').select('cast_id, embed_index', count='exact').execute()
        music_extractions = music_extractions_result.count if music_extractions_result.count else 0
        
        stats = {
            "total_casts": total_casts,
            "total_embeds": total_embeds,
            "embeds_with_metadata": embeds_with_metadata,
            "music_extractions": music_extractions,
        }
        
        print(f"📊 PROCESSING STATS:")
        print(f"   Total casts in system: {total_casts:,}")
        print(f"   Total embeds: {total_embeds:,}")
        print(f"   Embeds with metadata: {embeds_with_metadata:,}")
        print(f"   Music extractions: {music_extractions:,}")
        
        return stats
        
    except Exception as e:
        print(f"❌ Error getting processing stats: {e}")
        return {
            "total_casts": 0,
            "total_embeds": 0,
            "embeds_with_metadata": 0,
            "music_extractions": 0,
            "error": str(e)
        }

async def test_database_connection() -> bool:
    """Test database connection and table access"""
    try:
        # Test each table using composite key schema
        sb.table('cast_nodes').select('node_id').limit(1).execute()
        sb.table('music_library').select('cast_id, embed_index').limit(1).execute()
        sb.table('embeds_metadata').select('cast_id, embed_index').limit(1).execute()
        
        print("✅ Database connection successful - all tables accessible")
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        return False

# =============================================================================
# PREFECT TASK WRAPPERS
# =============================================================================

@task(name="Test Database Connection", log_prints=True)
async def test_db_task() -> bool:
    """Test database connection and table access"""
    return await test_database_connection()

@task(name="Get Processing Stats", log_prints=True) 
async def get_stats_task() -> Dict:
    """Get current processing statistics"""
    return await get_processing_stats()

@task(name="Get Embeds in Range", log_prints=True)
async def get_embeds_in_range_task(
    limit: int = 500,
    offset: int = 0,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None
) -> List[Dict]:
    """Get embeds in date range with single efficient JOIN query"""
    return await get_embeds_in_range(limit, offset, start_time, end_time)

@task(name="Assemble Embed Contexts", log_prints=True)
async def assemble_embed_contexts_task(embeds: List[Dict]) -> List[Dict]:
    """Assemble enhanced context for each embed (cast text + embed metadata)"""
    if not embeds:
        return []
    
    contexts = []
    for embed in embeds:
        context = await assemble_embed_context(embed)
        contexts.append(context)
    
    print(f"Assembled enhanced context for {len(contexts)} embeds")
    return contexts

@task(name="Store Music Extractions", log_prints=True)
async def store_extractions_task(extractions: List[Dict]) -> bool:
    """Store extracted music data in database"""
    if not extractions:
        print("No extractions to store")
        return True
    
    success = await insert_music_extractions(extractions)
    if success:
        print(f"✅ Successfully stored {len(extractions)} music extractions")
    else:
        print(f"❌ Failed to store extractions")
    
    return success

def clean_metadata_text(metadata: str) -> str:
    """Remove platform prefixes and clean up metadata text"""
    
    # Handle None or empty metadata
    if not metadata:
        return ""
    
    # Common platform prefixes to remove
    prefixes_to_remove = [
        "Spotify Track:",
        "Spotify Album:",
        "Spotify Playlist:",
        "YouTube Music:",
        "YouTube:",
        "Apple Music:",
        "SoundCloud:",
        "Bandcamp:",
        "Tidal:",
        "Deezer:",
        "Amazon Music:",
    ]
    
    cleaned = metadata
    
    # Remove platform prefixes
    for prefix in prefixes_to_remove:
        if cleaned.startswith(prefix):
            cleaned = cleaned[len(prefix):].strip()
            break
    
    # Remove extra whitespace and normalize
    cleaned = ' '.join(cleaned.split())
    
    return cleaned
