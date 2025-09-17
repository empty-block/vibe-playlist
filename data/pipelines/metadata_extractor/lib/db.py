"""
Database Operations for URL Metadata Extraction

Handles storage and retrieval of embed metadata and extracted music details
using simplified schema with raw Open Graph storage and AI-extracted results
"""

import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from urllib.parse import urlparse

from prefect import task

# Import the existing Supabase client
from data.lib.db import sb

# =============================================================================
# APPROVED MUSIC DOMAINS
# =============================================================================

# Cache for music domains to avoid repeated database queries
_music_domains_cache = None
_cache_last_updated = None

async def get_music_domains() -> set:
    """Get active music domains from database with caching"""
    global _music_domains_cache, _cache_last_updated
    
    try:
        # Cache for 5 minutes to avoid excessive DB queries
        from datetime import datetime, timedelta
        now = datetime.utcnow()
        
        if (_music_domains_cache is None or 
            _cache_last_updated is None or 
            now - _cache_last_updated > timedelta(minutes=5)):
            
            # Fetch active music domains from database
            result = sb.table('music_sources').select('domain').eq('is_active', True).execute()
            
            if result.data:
                _music_domains_cache = {row['domain'] for row in result.data}
                _cache_last_updated = now
                print(f"🎵 Loaded {len(_music_domains_cache)} music domains from database")
            else:
                # Fallback to empty set if database is empty
                _music_domains_cache = set()
                _cache_last_updated = now
                print("⚠️ No music domains found in database")
        
        return _music_domains_cache
        
    except Exception as e:
        print(f"❌ Error loading music domains from database: {str(e)}")
        # Return empty set on error to be safe
        return set()

def extract_domain(url: str) -> Optional[str]:
    """Extract domain from URL for music platform filtering"""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        
        # Remove www. prefix if present
        if domain.startswith('www.'):
            domain = domain[4:]
            
        return domain
    except Exception:
        return None

async def is_music_url(url: str) -> bool:
    """Check if URL belongs to a known music platform"""
    domain = extract_domain(url)
    if not domain:
        return False
    
    music_domains = await get_music_domains()
    
    # Direct domain match
    if domain in music_domains:
        return True
    
    # Check for subdomain matches (e.g., artist.bandcamp.com)
    for music_domain in music_domains:
        if domain.endswith('.' + music_domain):
            return True
    
    return False

# =============================================================================
# PREFECT TASKS FOR PIPELINE
# =============================================================================

@task(name="Fetch URL Embeds", log_prints=True, retries=1)
async def fetch_url_embeds_task(batch_size: int = 50, offset: int = 0, start_time: str = None, end_time: str = None) -> List[Dict[str, Any]]:
    """
    Prefect task to fetch embeds for metadata extraction (music platforms only)
    """
    print(f"Fetching up to {batch_size} URL embeds (offset: {offset})...")
    if start_time and end_time:
        print(f"Time range: {start_time} to {end_time}")
    
    # Get embeds for processing using simple offset pagination
    embeds = await get_embeds_for_processing(limit=batch_size, offset=offset, start_time=start_time, end_time=end_time)
    
    print(f"Found {len(embeds)} URL embeds to process")
    return embeds

@task(name="Store Metadata Results", log_prints=True, retries=1)
async def store_metadata_results_task(metadata_results: List[Dict[str, Any]]) -> bool:
    """
    Prefect task to store extracted metadata results in database
    """
    if not metadata_results:
        print("No metadata results to store")
        return True
    
    print(f"Storing {len(metadata_results)} metadata extraction results...")
    
    try:
        success = await insert_embed_metadata(metadata_results)
        if success:
            print(f"✅ Successfully stored {len(metadata_results)} metadata results")
        else:
            print(f"❌ Failed to store metadata results")
        return success
    
    except Exception as e:
        print(f"❌ Error storing metadata results: {str(e)}")
        return False

# =============================================================================
# EMBEDS TABLE OPERATIONS
# =============================================================================

async def insert_embeds(embeds: List[Dict[str, Any]]) -> bool:
    """
    Insert embed URLs into the embeds table
    
    Args:
        embeds: List of embed dictionaries with cast_id, embed_url, etc.
    
    Returns:
        bool: True if successful, False otherwise
    """
    if not embeds:
        print("No embeds to insert")
        return True
    
    try:
        # Prepare data for insertion
        prepared_data = []
        for embed in embeds:
            prepared_data.append({
                'cast_id': embed['cast_id'],
                'embed_url': embed['embed_url'],
                'embed_type': embed.get('embed_type', 'URL'),
                'embed_index': embed.get('embed_index', 0),
                'created_at': embed.get('created_at', datetime.utcnow().isoformat())  # Use cast creation time if available
            })
        
        # Insert with conflict handling (UPSERT)
        result = sb.table('embeds').upsert(
            prepared_data,
            on_conflict='cast_id,embed_url'
        ).execute()
        
        if result.data:
            print(f"✅ Successfully inserted {len(result.data)} embeds")
            return True
        else:
            print("❌ No data returned from embed insertion")
            return False
            
    except Exception as e:
        print(f"❌ Error inserting embeds: {str(e)}")
        return False



# =============================================================================
# EMBEDS_METADATA TABLE OPERATIONS  
# =============================================================================

async def insert_embed_metadata(metadata_extractions: List[Dict[str, Any]]) -> bool:
    """
    Insert Open Graph metadata extraction results into database using UPSERT.
    Handles duplicates gracefully - no need for "processed" status checks.
    
    Args:
        metadata_extractions: List of extraction result dictionaries with og_metadata
    
    Returns:
        bool: True if successful, False otherwise
    """
    if not metadata_extractions:
        print("No metadata extractions to insert")
        return True
    
    try:
        # Prepare data for insertion using composite key
        prepared_data = []
        invalid_records = []
        
        for i, extraction in enumerate(metadata_extractions):
            # Validate required fields
            cast_id = extraction.get('cast_id')
            embed_index = extraction.get('embed_index')
            url = extraction.get('url')
            
            if not cast_id:
                invalid_records.append(f"Record {i}: missing cast_id")
                continue
            if embed_index is None:
                invalid_records.append(f"Record {i}: missing embed_index")
                continue
            if not url:
                invalid_records.append(f"Record {i}: missing url")
                continue
                
            # Extraction should have cast_id and embed_index from the embed data
            prepared_data.append({
                'cast_id': cast_id,
                'embed_index': embed_index,
                'url': url,  # The original URL
                'url_domain': extraction.get('url_domain'),
                'platform_name': extraction.get('platform_name'),
                'og_metadata': extraction.get('og_metadata'),
                'created_at': extraction.get('created_at'),  # Cast creation time from embed data
                'processed_at': datetime.utcnow().isoformat()
            })
        
        # Report validation issues
        if invalid_records:
            print(f"⚠️  Found {len(invalid_records)} invalid records:")
            for issue in invalid_records[:5]:  # Show first 5
                print(f"   {issue}")
            if len(invalid_records) > 5:
                print(f"   ... and {len(invalid_records) - 5} more")
        
        print(f"📝 Attempting to insert {len(prepared_data)} valid records (out of {len(metadata_extractions)} total)")
        
        # Log the exact (cast_id, embed_index) pairs being inserted
        print(f"🔍 INSERTING THESE RECORDS:")
        for i, record in enumerate(prepared_data):
            cast_id_short = record['cast_id'][-8:]  # Last 8 chars for readability
            print(f"   {i+1:2d}. cast_id: ...{cast_id_short}, embed_index: {record['embed_index']}, url: {record['url'][:50]}...")
        
        if not prepared_data:
            print("❌ No valid records to insert")
            return False
        
        # Use upsert to handle duplicates gracefully - no failures on conflicts
        result = sb.table('embeds_metadata').upsert(
            prepared_data,
            on_conflict='cast_id,embed_index'
        ).execute()
        
        if result.data:
            actual_inserted = len(result.data)
            print(f"✅ Database returned {actual_inserted} records after upsert")
            if actual_inserted != len(prepared_data):
                print(f"⚠️  Expected {len(prepared_data)} but got {actual_inserted} - some may have been duplicates")
            return True
        else:
            print("⚠️  Database returned no data - this might indicate all records were duplicates")
            return True  # This is OK - duplicates were handled gracefully
            
    except Exception as e:
        print(f"❌ Error inserting embed metadata: {str(e)}")
        return False

async def get_metadata_for_ai_processing(limit: int = 100) -> List[Dict[str, Any]]:
    """
    Get successful metadata extractions ready for AI music processing
    
    Args:
        limit: Maximum number of results
    
    Returns:
        List of metadata ready for AI parsing
    """
    try:
        result = sb.table('embeds_metadata').select(
            'cast_id, embed_index, url_domain, platform_name, og_metadata'
        ).not_.is_('og_metadata', 'null').limit(limit).execute()
        
        return result.data if result.data else []
        
    except Exception as e:
        print(f"❌ Error getting metadata for AI processing: {str(e)}")
        return []

# =============================================================================
# MUSIC_LIBRARY TABLE OPERATIONS
# =============================================================================

async def insert_extracted_music(music_extractions: List[Dict[str, Any]]) -> bool:
    """
    Insert AI-extracted music details into database
    
    Args:
        music_extractions: List of music extraction dictionaries
    
    Returns:
        bool: True if successful, False otherwise
    """
    if not music_extractions:
        print("No music extractions to insert")
        return True
    
    try:
        # Prepare data for insertion
        prepared_data = []
        for extraction in music_extractions:
            prepared_data.append({
                'cast_id': extraction['cast_id'],
                'author_fid': extraction['author_fid'],
                'music_type': extraction['music_type'],
                'title': extraction['title'],
                'artist': extraction.get('artist'),
                'album': extraction.get('album'),
                'platform_name': extraction.get('platform_name'),  # Add platform info
                'confidence_score': extraction.get('confidence_score'),
                'ai_model_version': extraction.get('ai_model_version', 'claude-3-sonnet'),
                'created_at': extraction.get('created_at', datetime.utcnow().isoformat()),
                'processed_at': datetime.utcnow().isoformat()
            })
        
        # Insert all records (allow duplicates since one cast can have multiple songs)
        result = sb.table('music_library').insert(prepared_data).execute()
        
        if result.data:
            print(f"✅ Successfully inserted {len(result.data)} music extractions")
            return True
        else:
            print("❌ No data returned from music extraction insertion")
            return False
            
    except Exception as e:
        print(f"❌ Error inserting extracted music: {str(e)}")
        return False

async def get_user_music_library(author_fid: str, limit: int = 100) -> List[Dict[str, Any]]:
    """
    Get a user's music library (all extracted music by author_fid)
    
    Args:
        author_fid: User's FID
        limit: Maximum number of results
    
    Returns:
        List of music entries for the user
    """
    try:
        result = sb.table('music_library').select(
            'id, cast_id, music_type, title, artist, album, confidence_score, processed_at'
        ).eq('author_fid', author_fid).order('processed_at', desc=True).limit(limit).execute()
        
        return result.data if result.data else []
        
    except Exception as e:
        print(f"❌ Error getting user music library: {str(e)}")
        return []

async def get_cast_music_details(cast_id: str) -> List[Dict[str, Any]]:
    """
    Get all music extracted from a specific cast
    
    Args:
        cast_id: Cast ID to get music for
    
    Returns:
        List of music entries for the cast
    """
    try:
        result = sb.table('music_library').select(
            'id, music_type, title, artist, album, confidence_score'
        ).eq('cast_id', cast_id).order('title').execute()
        
        return result.data if result.data else []
        
    except Exception as e:
        print(f"❌ Error getting cast music details: {str(e)}")
        return []

async def get_unprocessed_casts_for_music_extraction(limit: int = 100) -> List[Dict[str, Any]]:
    """
    Get casts that have embed metadata but haven't been processed for music extraction yet
    
    Args:
        limit: Maximum number of casts to return
    
    Returns:
        List of cast data ready for music extraction
    """
    try:
        # Find casts with embed metadata but no extracted music
        query = """
        SELECT DISTINCT c.node_id as cast_id, c.author_fid, c.cast_text, c.created_at
        FROM cast_nodes c
        JOIN embeds e ON c.node_id = e.cast_id  
        JOIN embeds_metadata m ON e.cast_id = m.cast_id AND e.embed_index = m.embed_index
        LEFT JOIN music_library emd ON c.node_id = emd.cast_id
        WHERE m.og_metadata IS NOT NULL 
        AND emd.cast_id IS NULL
        """
        
        if limit:
            query += f" LIMIT {limit}"
        
        result = sb.rpc('exec_sql', {'sql': query}).execute()
        
        return result.data if result.data else []
        
    except Exception as e:
        print(f"❌ Error getting unprocessed casts: {str(e)}")
        return []

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

async def test_database_connection() -> bool:
    """
    Test database connection and table access
    
    Returns:
        bool: True if connection successful
    """
    try:
        # Test each table with composite key schema
        sb.table('embeds').select('cast_id, embed_index').limit(1).execute()
        sb.table('embeds_metadata').select('cast_id, embed_index').limit(1).execute()
        sb.table('music_library').select('cast_id, embed_index').limit(1).execute()
        
        print("✅ Database connection successful - all tables accessible")
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        return False

async def get_embeds_for_processing(limit: Optional[int] = None, offset: int = 0, start_time: str = None, end_time: str = None) -> List[Dict[str, Any]]:
    """
    Get embed URLs for metadata extraction, filtered to music platforms only.
    Uses simple OFFSET pagination - UPSERT handles duplicates gracefully.
    
    Args:
        limit: Maximum number of embeds to return
        offset: Number of records to skip (for pagination)
        start_time: Start time for filtering
        end_time: End time for filtering
    
    Returns:
        List of embed dictionaries ready for metadata extraction (music platforms only)
    """
    try:
        # Simple query - get ALL embeds in range, excluding images/videos
        query = sb.table('embeds').select('cast_id, embed_index, embed_url, embed_type, created_at').not_.in_('embed_type', ['image', 'video','cast'])
        
        # Add time filters if provided
        if start_time and end_time:
            query = query.gte('created_at', start_time).lte('created_at', end_time)
        
        # Add pagination
        if offset:
            query = query.range(offset, offset + (limit * 2) - 1 if limit else offset + 99)
        elif limit:
            query = query.limit(limit * 2)  # Get extra to account for music filtering
        
        # Execute the query
        result = query.execute()
        
        if not result.data:
            print("No embeds found")
            return []
        
        print(f"📝 Found {len(result.data)} total embeds (offset: {offset})")
        
        # Filter to only music platform URLs
        music_embeds = []
        for embed in result.data:
            embed_url = embed.get('embed_url', '')
            if embed_url and await is_music_url(embed_url):
                music_embeds.append(embed)
                
                # Stop when we have enough
                if limit and len(music_embeds) >= limit:
                    break
        
        print(f"🎵 Found {len(music_embeds)} music platform embeds to process (filtered from {len(result.data)} total)")
        return music_embeds
        
    except Exception as e:
        print(f"❌ Error getting embeds for processing: {str(e)}")
        return [] 