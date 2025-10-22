"""

Simple URL metadata extraction for AI processing
"""

import json
import re
import requests
import extruct
from typing import Dict, List, Optional, Any
from urllib.parse import urlparse

from prefect import task

from data.pipelines.metadata_extractor.lib.rate_limiter import (
    wait_for_rate_limit,
    get_request_headers
)

# Import database client
from data.lib.db import sb

# =============================================================================
# DOMAIN-SPECIFIC EXTRACTION
# =============================================================================

# Cache for domain to platform mapping
_domain_platform_cache = None
_cache_last_updated = None

async def get_domain_platform_mapping() -> Dict[str, str]:
    """Get domain to platform extraction key mapping from database with caching"""
    global _domain_platform_cache, _cache_last_updated
    
    try:
        # Cache for 5 minutes to avoid excessive DB queries
        from datetime import datetime, timedelta
        now = datetime.utcnow()
        
        if (_domain_platform_cache is None or 
            _cache_last_updated is None or 
            now - _cache_last_updated > timedelta(minutes=5)):
            
            # Fetch active music domains and platform extraction keys from database
            result = sb.table('music_sources').select('domain, platform_name').eq('is_active', True).execute()
            
            if result.data:
                # Build domain -> extraction_key mapping (platform_name is now the extraction key)
                _domain_platform_cache = {}
                for row in result.data:
                    domain = row['domain']
                    extraction_key = row['platform_name']  # This is now the extraction key directly
                    _domain_platform_cache[domain] = extraction_key
                
                _cache_last_updated = now
                print(f"🎵 Loaded {len(_domain_platform_cache)} domain->platform mappings from database")
            else:
                # Fallback to empty dict if database is empty
                _domain_platform_cache = {}
                _cache_last_updated = now
                print("⚠️ No domain mappings found in database")
        
        return _domain_platform_cache
        
    except Exception as e:
        print(f"❌ Error loading domain mappings from database: {str(e)}")
        # Return empty dict on error to be safe
        return {}

async def get_platform_type(url: str) -> Optional[str]:
    """Determine platform extraction type from URL using database"""
    try:
        domain = urlparse(url).netloc.lower()
        if domain.startswith('www.'):
            domain = domain[4:]
        
        # Special handling for Bandcamp subdomains
        if domain.endswith('.bandcamp.com'):
            domain = 'bandcamp.com'
        
        domain_mapping = await get_domain_platform_mapping()
        return domain_mapping.get(domain)
    except Exception:
        return None

def extract_spotify_metadata(metadata: Dict) -> str:
    """Extract key Spotify metadata into clean format"""
    try:
        # Get title and type from Open Graph
        title = None
        content_type = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:title':
                        title = prop[1]
                    elif prop[0] == 'og:type':
                        # Extract type from "music.song" -> "song"
                        og_type = prop[1]
                        if og_type.startswith('music.'):
                            content_type = og_type.replace('music.', '')
        
        # Get artist, album, year from description
        artist = album = year = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:description':
                        desc = prop[1]
                        # Format: "Artist(s) · Album · Song · Year"
                        parts = desc.split(' · ')
                        if len(parts) >= 2:
                            artist = parts[0]
                            if len(parts) >= 3:
                                album = parts[1]
                            if len(parts) >= 4:
                                year_part = parts[-1]
                                year_match = re.search(r'\b(19|20)\d{2}\b', year_part)
                                if year_match:
                                    year = year_match.group()
                        break
        
        # Get release date from music metadata (Phase 2 enhancement)
        release_date = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'music:release_date':
                        release_date = prop[1]
                        break
        
        # Get image
        image = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:image':
                        image = prop[1]
                        break
        
        # Build formatted string
        parts = []
        if title:
            parts.append(f"title - {title}")
        if artist:
            parts.append(f"artist - {artist}")
        if album:
            parts.append(f"album - {album}")
        if year:
            parts.append(f"year - {year}")
        if release_date:
            parts.append(f"release_date - {release_date}")
        if content_type:
            parts.append(f"type - {content_type}")
        if image:
            parts.append(f"image - {image}")
        
        return " | ".join(parts) if parts else "spotify - metadata extracted"
        
    except Exception as e:
        return f"spotify - extraction error: {str(e)}"

def extract_youtube_metadata(metadata: Dict) -> str:
    """Extract key YouTube metadata into clean format"""
    try:
        # Get title from Open Graph
        title = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:title':
                        title = prop[1]
                        break
        
        # Get channel from microdata
        channel = None
        if 'microdata' in metadata:
            for item in metadata['microdata']:
                if item.get('type') == 'http://schema.org/VideoObject':
                    author = item.get('properties', {}).get('author')
                    if author and isinstance(author, dict):
                        # Try name field first (if it's not a URL)
                        channel_name = author.get('properties', {}).get('name')
                        if channel_name and not channel_name.startswith('https://'):
                            channel = channel_name
                            break
                        
                        # If name is a URL, extract channel from url field
                        channel_url = author.get('properties', {}).get('url')
                        if channel_url and isinstance(channel_url, str):
                            # Extract channel name from URL like "http://www.youtube.com/@pattismithVEVO"
                            if '@' in channel_url:
                                channel = channel_url.split('@')[-1]
                                break
                elif item.get('type') == 'https://schema.org/BreadcrumbList':
                    # Fallback to breadcrumb
                    item_list = item.get('properties', {}).get('itemListElement')
                    if item_list and isinstance(item_list, dict):
                        item_props = item_list.get('properties', {}).get('item')
                        if item_props and isinstance(item_props, dict):
                            channel = item_props.get('properties', {}).get('name')
                            break
        
        # Get duration from microdata
        duration = None
        if 'microdata' in metadata:
            for item in metadata['microdata']:
                if item.get('type') == 'http://schema.org/VideoObject':
                    duration_raw = item.get('properties', {}).get('duration')
                    if duration_raw:
                        # Convert PT2M5S to readable format
                        match = re.search(r'PT(?:(\d+)M)?(?:(\d+)S)?', duration_raw)
                        if match:
                            minutes = int(match.group(1) or 0)
                            seconds = int(match.group(2) or 0)
                            if minutes > 0:
                                duration = f"{minutes}:{seconds:02d}"
                            else:
                                duration = f"0:{seconds}"
                    break
        
        # Get upload date from JSON-LD (Phase 2 enhancement)
        upload_date = None
        if 'json-ld' in metadata:
            for item in metadata['json-ld']:
                if isinstance(item, dict) and 'uploadDate' in item:
                    upload_date = item['uploadDate']
                    break
        
        # Get image
        image = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:image':
                        image = prop[1]
                        break
        
        # Build formatted string
        parts = []
        if title:
            parts.append(f"title - {title}")
        if channel:
            parts.append(f"channel - {channel}")
        if duration:
            parts.append(f"duration - {duration}")
        if upload_date:
            parts.append(f"upload_date - {upload_date}")
        if image:
            parts.append(f"image - {image}")
        
        return " | ".join(parts) if parts else "youtube - metadata extracted"
        
    except Exception as e:
        return f"youtube - extraction error: {str(e)}"

def extract_soundcloud_metadata(metadata: Dict) -> str:
    """Extract key SoundCloud metadata into clean format"""
    try:
        # Get title from Open Graph
        title = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:title':
                        title = prop[1]
                        break
        
        # Get artist from microdata
        channel = None
        if 'microdata' in metadata:
            for item in metadata['microdata']:
                if item.get('type') == 'http://schema.org/MusicRecording':
                    by_artist = item.get('properties', {}).get('byArtist')
                    if by_artist and isinstance(by_artist, dict):
                        channel = by_artist.get('properties', {}).get('name')
                        break
        
        # Get duration from microdata
        duration = None
        if 'microdata' in metadata:
            for item in metadata['microdata']:
                if item.get('type') == 'http://schema.org/MusicRecording':
                    duration_raw = item.get('properties', {}).get('duration')
                    if duration_raw:
                        # Convert PT00H05M56S to readable format
                        match = re.search(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration_raw)
                        if match:
                            hours = int(match.group(1) or 0)
                            minutes = int(match.group(2) or 0)
                            seconds = int(match.group(3) or 0)
                            if hours > 0:
                                duration = f"{hours}:{minutes:02d}:{seconds:02d}"
                            elif minutes > 0:
                                duration = f"{minutes}:{seconds:02d}"
                            else:
                                duration = f"0:{seconds:02d}"
                    break
        
        # Get genre from microdata
        genre = None
        if 'microdata' in metadata:
            for item in metadata['microdata']:
                if item.get('type') == 'http://schema.org/MusicRecording':
                    genre = item.get('properties', {}).get('genre')
                    break
        
        # Get image
        image = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:image':
                        image = prop[1]
                        break
        
        # Get play count and like count from rdfa
        play_count = like_count = None
        if 'rdfa' in metadata:
            for item in metadata['rdfa']:
                if 'soundcloud:play_count' in item:
                    play_count_data = item['soundcloud:play_count']
                    if isinstance(play_count_data, list) and play_count_data:
                        play_count = play_count_data[0].get('@value')
                if 'soundcloud:like_count' in item:
                    like_count_data = item['soundcloud:like_count']
                    if isinstance(like_count_data, list) and like_count_data:
                        like_count = like_count_data[0].get('@value')
        
        # Build formatted string
        parts = []
        if title:
            parts.append(f"title - {title}")
        if channel:
            parts.append(f"channel - {channel}")
        if duration:
            parts.append(f"duration - {duration}")
        if genre:
            parts.append(f"genre - {genre}")
        if play_count:
            parts.append(f"plays - {play_count}")
        if like_count:
            parts.append(f"likes - {like_count}")
        if image:
            parts.append(f"image - {image}")
        
        return " | ".join(parts) if parts else "soundcloud - metadata extracted"
        
    except Exception as e:
        return f"soundcloud - extraction error: {str(e)}"

def extract_audius_metadata(metadata: Dict) -> str:
    """Extract key Audius metadata into clean format"""
    try:
        # Get title from Open Graph
        title = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:title':
                        raw_title = prop[1]
                        # Format: "Song Title by Artist • Audius"
                        if ' by ' in raw_title and ' • Audius' in raw_title:
                            # Extract just the song and artist part
                            title_part = raw_title.replace(' • Audius', '')
                            title = title_part
                        else:
                            title = raw_title
                        break
        
        # Get image
        image = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:image':
                        image = prop[1]
                        break
        
        # Build formatted string
        parts = []
        if title:
            parts.append(f"title - {title}")
        if image:
            parts.append(f"image - {image}")
        
        return " | ".join(parts) if parts else "audius - metadata extracted"
        
    except Exception as e:
        return f"audius - extraction error: {str(e)}"

def extract_songlink_metadata(metadata: Dict) -> str:
    """Extract key Songlink/Odesli metadata into clean format"""
    try:
        # Get title from Open Graph - already clean format "Title by Artist"
        title = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:title':
                        title = prop[1]
                        break
        
        # Get image
        image = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:image':
                        image = prop[1]
                        break
        
        # Build formatted string
        parts = []
        if title:
            parts.append(f"title - {title}")
        if image:
            parts.append(f"image - {image}")
        
        return " | ".join(parts) if parts else "songlink - metadata extracted"
        
    except Exception as e:
        return f"songlink - extraction error: {str(e)}"

def extract_youtube_music_metadata(metadata: Dict) -> str:
    """Extract key YouTube Music metadata into clean format"""
    try:
        # Get title from Open Graph and clean it
        title = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:title':
                        raw_title = prop[1]
                        # Remove "- YouTube Music" suffix
                        if raw_title.endswith(' - YouTube Music'):
                            title = raw_title.replace(' - YouTube Music', '')
                        else:
                            title = raw_title
                        break
        
        # Get artist from video tags
        artist = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:video:tag':
                        # First tag is usually the artist
                        artist = prop[1]
                        break
        
        # Get image
        image = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:image':
                        image = prop[1]
                        break
        
        # Build formatted string
        parts = []
        if title:
            parts.append(f"title - {title}")
        if artist:
            parts.append(f"artist - {artist}")
        if image:
            parts.append(f"image - {image}")
        
        return " | ".join(parts) if parts else "youtube_music - metadata extracted"
        
    except Exception as e:
        return f"youtube_music - extraction error: {str(e)}"

def extract_apple_music_metadata(metadata: Dict) -> str:
    """Extract key Apple Music metadata into clean format"""
    try:
        # Get title and artist from JSON-LD (most reliable)
        title = artist = album = year = None
        if 'json-ld' in metadata:
            for item in metadata['json-ld']:
                if item.get('@type') == 'MusicAlbum':
                    title = item.get('name')
                    year_str = item.get('datePublished', '')
                    if year_str and len(year_str) >= 4:
                        year = year_str[:4]
                    
                    # Get artist from byArtist array
                    by_artist = item.get('byArtist')
                    if by_artist and isinstance(by_artist, list) and by_artist:
                        artist = by_artist[0].get('name')
                    break
        
        # Fallback to Open Graph if JSON-LD doesn't have what we need
        if not title and 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:title':
                        raw_title = prop[1]
                        # Remove " su Apple Music" suffix and extract parts
                        if ' su Apple Music' in raw_title:
                            clean_title = raw_title.replace(' su Apple Music', '')
                            # Format is usually "Album di Artist"
                            if ' di ' in clean_title:
                                parts = clean_title.split(' di ')
                                title = parts[0]
                                if len(parts) > 1:
                                    artist = parts[1]
                        else:
                            title = raw_title
                        break
        
        # Get image
        image = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:image':
                        image = prop[1]
                        break
        
        # Get track count from Open Graph
        track_count = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'music:song_count':
                        track_count = prop[1]
                        break
        
        # Build formatted string
        parts = []
        if title:
            parts.append(f"title - {title}")
        if artist:
            parts.append(f"artist - {artist}")
        if album and album != title:  # Don't duplicate if album name same as title
            parts.append(f"album - {album}")
        if year:
            parts.append(f"year - {year}")
        if track_count:
            parts.append(f"tracks - {track_count}")
        if image:
            parts.append(f"image - {image}")
        
        return " | ".join(parts) if parts else "apple_music - metadata extracted"
        
    except Exception as e:
        return f"apple_music - extraction error: {str(e)}"

def extract_aux_metadata(metadata: Dict) -> str:
    """Extract key AUX metadata into clean format"""
    try:
        # Get title from Open Graph and clean it
        title = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:title':
                        raw_title = prop[1]
                        # Remove " - AUX" suffix
                        if raw_title.endswith(' - AUX'):
                            title = raw_title.replace(' - AUX', '')
                        else:
                            title = raw_title
                        break
        
        # Get description from Open Graph
        description = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:description':
                        desc = prop[1]
                        # Skip generic AUX description
                        if desc and desc != "The AUX for the internet":
                            description = desc
                        break
        
        # Get image
        image = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:image':
                        image = prop[1]
                        break
        
        # Build formatted string
        parts = []
        if title:
            parts.append(f"title - {title}")
        if description:
            parts.append(f"description - {description}")
        if image:
            parts.append(f"image - {image}")
        
        return " | ".join(parts) if parts else "aux - metadata extracted"
        
    except Exception as e:
        return f"aux - extraction error: {str(e)}"

def extract_tidal_metadata(metadata: Dict) -> str:
    """Extract key Tidal metadata into clean format"""
    try:
        # Get title from Open Graph and parse artist/song
        title = artist = song = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:title':
                        raw_title = prop[1]
                        # Format is "Artist - Song"
                        if ' - ' in raw_title:
                            parts = raw_title.split(' - ', 1)  # Split on first occurrence only
                            artist = parts[0].strip()
                            song = parts[1].strip()
                            title = raw_title  # Keep full title as backup
                        else:
                            title = raw_title
                        break
        
        # Get image
        image = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:image':
                        image = prop[1]
                        break
        
        # Build formatted string
        parts = []
        if song:
            parts.append(f"title - {song}")
        elif title:
            parts.append(f"title - {title}")
        if artist:
            parts.append(f"artist - {artist}")
        if image:
            parts.append(f"image - {image}")
        
        return " | ".join(parts) if parts else "tidal - metadata extracted"
        
    except Exception as e:
        return f"tidal - extraction error: {str(e)}"

def extract_rodeo_metadata(metadata: Dict) -> str:
    """Extract key Rodeo metadata into clean format"""
    try:
        # Get title from Open Graph (already clean, no suffix removal needed)
        title = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:title':
                        title = prop[1]
                        break
        
        # Get description from Open Graph
        description = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:description':
                        desc = prop[1]
                        if desc:
                            # Truncate long descriptions for readability
                            if len(desc) > 200:
                                description = desc[:200] + "..."
                            else:
                                description = desc
                        break
        
        # Get image
        image = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:image':
                        image = prop[1]
                        break
        
        # Build formatted string
        parts = []
        if title:
            parts.append(f"title - {title}")
        if description:
            parts.append(f"description - {description}")
        if image:
            parts.append(f"image - {image}")
        
        return " | ".join(parts) if parts else "rodeo - metadata extracted"
        
    except Exception as e:
        return f"rodeo - extraction error: {str(e)}"

def extract_bandcamp_metadata(metadata: Dict) -> str:
    """Extract key Bandcamp metadata into clean format"""
    try:
        # Get title from Open Graph and parse artist/song
        title = artist = song_or_album = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:title':
                        raw_title = prop[1]
                        # Format is typically "Song Title, by Artist" or "Album Title by Artist"
                        if ', by ' in raw_title:
                            parts = raw_title.split(', by ', 1)
                            song_or_album = parts[0].strip()
                            artist = parts[1].strip()
                        elif ' by ' in raw_title:
                            parts = raw_title.split(' by ', 1)
                            song_or_album = parts[0].strip()
                            artist = parts[1].strip()
                        else:
                            title = raw_title
                        break
        
        # Get album info from description
        album = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:description':
                        desc = prop[1]
                        if desc:
                            # Extract album from "from the album [Album Name]"
                            album_match = re.search(r'from the album\s+(.+)', desc.strip())
                            if album_match:
                                album = album_match.group(1).strip()
                        break
        
        # Get image
        image = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:image':
                        image = prop[1]
                        break
        
        # Build formatted string
        parts = []
        if song_or_album:
            parts.append(f"title - {song_or_album}")
        elif title:
            parts.append(f"title - {title}")
        if artist:
            parts.append(f"artist - {artist}")
        if album:
            parts.append(f"album - {album}")
        if image:
            parts.append(f"image - {image}")
        
        return " | ".join(parts) if parts else "bandcamp - metadata extracted"
        
    except Exception as e:
        return f"bandcamp - extraction error: {str(e)}"

def extract_ffm_metadata(metadata: Dict) -> str:
    """Extract key FFM (Feature.fm) metadata into clean format"""
    try:
        # Get title from Open Graph (song name)
        title = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:title':
                        title = prop[1]
                        break
        
        # Get artist from description
        artist = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:description':
                        desc = prop[1]
                        if desc:
                            artist = desc.strip()
                        break
        
        # Get image
        image = None
        if 'opengraph' in metadata:
            for og_section in metadata['opengraph']:
                for prop in og_section.get('properties', []):
                    if prop[0] == 'og:image':
                        image = prop[1]
                        break
        
        # Build formatted string
        parts = []
        if title:
            parts.append(f"title - {title}")
        if artist:
            parts.append(f"artist - {artist}")
        if image:
            parts.append(f"image - {image}")
        
        return " | ".join(parts) if parts else "ffm - metadata extracted"
        
    except Exception as e:
        return f"ffm - extraction error: {str(e)}"

def is_empty_metadata(metadata: Dict) -> bool:
    """Check if metadata is essentially empty (no useful content)"""
    try:
        # Check if all main sections are empty or contain only empty structures
        for section_name in ['microdata', 'json-ld', 'opengraph', 'rdfa']:
            section = metadata.get(section_name, [])
            if section:  # If any section has content, it's not empty
                return False
        
        # Check dublincore separately as it has different structure
        dublincore = metadata.get('dublincore', [])
        if dublincore:
            for dc_item in dublincore:
                elements = dc_item.get('elements', [])
                terms = dc_item.get('terms', [])
                if elements or terms:  # If has actual content
                    return False
        
        return True  # All sections are empty
        
    except Exception:
        return False  # If error parsing, assume it has content

async def create_smart_metadata_result(url: str, url_domain: Optional[str], raw_metadata: Dict) -> Dict[str, Any]:
    """
    Create metadata result with smart platform-specific extraction
    """
    # DEBUG: Print what we're processing
    print(f"🔍 Processing URL: {url}")
    print(f"🔍 URL domain: {url_domain}")
    
    # Check if metadata is empty (e.g., imagedelivery URLs)
    is_empty = is_empty_metadata(raw_metadata)
    print(f"🔍 Metadata empty: {is_empty}")
    
    if is_empty:
        print(f"🔍 Returning early due to empty metadata")
        return {
            'url': url,
            'url_domain': url_domain,
            'platform_name': None,  # No platform for empty metadata
            'og_metadata': None,  # Store null instead of empty JSON
        }
    
    platform = await get_platform_type(url)
    print(f"🔍 Detected platform: {platform}")
    
    if platform == 'spotify':
        # Extract clean Spotify metadata
        clean_metadata = extract_spotify_metadata(raw_metadata)
        return {
            'url': url,
            'url_domain': url_domain,
            'platform_name': platform,
            'og_metadata': clean_metadata,
        }
    elif platform == 'youtube':
        # Extract clean YouTube metadata
        clean_metadata = extract_youtube_metadata(raw_metadata)
        return {
            'url': url,
            'url_domain': url_domain,
            'platform_name': platform,
            'og_metadata': clean_metadata,
        }
    elif platform == 'soundcloud':
        # Extract clean SoundCloud metadata
        clean_metadata = extract_soundcloud_metadata(raw_metadata)
        return {
            'url': url,
            'url_domain': url_domain,
            'platform_name': platform,
            'og_metadata': clean_metadata,
        }
    elif platform == 'audius':
        # Extract clean Audius metadata
        clean_metadata = extract_audius_metadata(raw_metadata)
        return {
            'url': url,
            'url_domain': url_domain,
            'platform_name': platform,
            'og_metadata': clean_metadata,
        }
    elif platform == 'songlink':
        # Extract clean Songlink metadata
        clean_metadata = extract_songlink_metadata(raw_metadata)
        return {
            'url': url,
            'url_domain': url_domain,
            'platform_name': platform,
            'og_metadata': clean_metadata,
        }
    elif platform == 'youtube_music':
        # Extract clean YouTube Music metadata
        clean_metadata = extract_youtube_music_metadata(raw_metadata)
        return {
            'url': url,
            'url_domain': url_domain,
            'platform_name': platform,
            'og_metadata': clean_metadata,
        }
    elif platform == 'apple_music':
        # Extract clean Apple Music metadata
        clean_metadata = extract_apple_music_metadata(raw_metadata)
        return {
            'url': url,
            'url_domain': url_domain,
            'platform_name': platform,
            'og_metadata': clean_metadata,
        }
    elif platform == 'aux':
        # Extract clean AUX metadata
        clean_metadata = extract_aux_metadata(raw_metadata)
        return {
            'url': url,
            'url_domain': url_domain,
            'platform_name': platform,
            'og_metadata': clean_metadata,
        }
    elif platform == 'tidal':
        # Extract clean Tidal metadata
        clean_metadata = extract_tidal_metadata(raw_metadata)
        return {
            'url': url,
            'url_domain': url_domain,
            'platform_name': platform,
            'og_metadata': clean_metadata,
        }
    elif platform == 'rodeo':
        # Extract clean Rodeo metadata
        clean_metadata = extract_rodeo_metadata(raw_metadata)
        return {
            'url': url,
            'url_domain': url_domain,
            'platform_name': platform,
            'og_metadata': clean_metadata,
        }
    elif platform == 'bandcamp':
        # Extract clean Bandcamp metadata
        clean_metadata = extract_bandcamp_metadata(raw_metadata)
        return {
            'url': url,
            'url_domain': url_domain,
            'platform_name': platform,
            'og_metadata': clean_metadata,
        }
    elif platform == 'ffm':
        # Extract clean FFM metadata
        clean_metadata = extract_ffm_metadata(raw_metadata)
        return {
            'url': url,
            'url_domain': url_domain,
            'platform_name': platform,
            'og_metadata': clean_metadata,
        }
    else:
        # Fallback: store full raw metadata for unknown platforms
        return {
            'url': url,
            'url_domain': url_domain,
            'platform_name': platform,  # Could be None for unknown platforms
            'og_metadata': json.dumps(raw_metadata),
        }

# =============================================================================
# PREFECT TASKS FOR PIPELINE
# =============================================================================

@task(name="Extract URL Metadata", log_prints=True, retries=2)
async def extract_metadata_batch_task(embeds: List[Dict[str, Any]], batch_num: int = 1) -> List[Dict[str, Any]]:
    """
    Prefect task to extract metadata from a batch of URL embeds
    """
    if not embeds:
        print("No embeds to process")
        return []
    
    print(f"📦 Batch {batch_num}: Extracting metadata from {len(embeds)} URLs...")
    results = []
    failed_urls = []
    
    for i, embed in enumerate(embeds):
        cast_id = embed['cast_id']
        embed_index = embed['embed_index']
        embed_url = embed['embed_url']
        
        print(f"🔄 Batch {batch_num} [{i+1}/{len(embeds)}]: {embed_url}")
        
        try:
            # Extract metadata using our existing function
            metadata_result = await extract_single_url(embed_url)
            
            # Add composite key to link back to embeds table
            metadata_result['cast_id'] = cast_id
            metadata_result['embed_index'] = embed_index
            metadata_result['created_at'] = embed.get('created_at')  # Carry forward the creation time
            
            results.append(metadata_result)
            
            # Debug platform detection
            platform = metadata_result.get('platform_name')
            if platform:
                print(f"🔍 Detected platform: {platform}")
            
            # Log success with batch context
            print(f"✅ Batch {batch_num} [{i+1}/{len(embeds)}]: Success - {embed_url}")
        
        except Exception as e:
            # Track failed URLs with detailed error info
            failed_info = {
                'url': embed_url,
                'cast_id': cast_id,
                'embed_index': embed_index,
                'error': str(e),
                'error_type': type(e).__name__
            }
            failed_urls.append(failed_info)
            print(f"❌ Batch {batch_num} [{i+1}/{len(embeds)}]: FAILED - {embed_url}: {str(e)}")
    
    # Detailed batch summary
    success_count = len(results)
    failure_count = len(failed_urls)
    total_count = len(embeds)
    
    print(f"\n📊 BATCH SUMMARY:")
    print(f"   Total URLs processed: {total_count}")
    print(f"   ✅ Successful extractions: {success_count}")
    print(f"   ❌ Failed extractions: {failure_count}")
    print(f"   Success rate: {(success_count/total_count)*100:.1f}%")
    
    if failed_urls:
        print(f"\n🔍 FAILED URLS BREAKDOWN:")
        error_counts = {}
        for fail in failed_urls:
            error_type = fail['error_type']
            error_counts[error_type] = error_counts.get(error_type, 0) + 1
        
        for error_type, count in error_counts.items():
            print(f"   {error_type}: {count} failures")
        
        print(f"\n📝 FAILED URLs (first 10):")
        for fail in failed_urls[:10]:
            print(f"   • {fail['url']} - {fail['error_type']}: {fail['error'][:100]}")
        
        if len(failed_urls) > 10:
            print(f"   ... and {len(failed_urls) - 10} more failures")
    
    return results

# =============================================================================
# CORE EXTRACTION FUNCTIONS
# =============================================================================

def extract_domain(url: str) -> Optional[str]:
    """Extract domain name from URL"""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        if domain.startswith('www.'):
            domain = domain[4:]
        return domain
    except Exception:
        return None

async def extract_single_url(url: str) -> Dict[str, Any]:
    """
    Extract raw metadata from a single URL
    Returns smart-extracted metadata for known platforms, raw for others
    """
    url_domain = extract_domain(url)
    
    # Simple rate limiting
    await wait_for_rate_limit(url)
    
    try:
        # Make request
        headers = get_request_headers()
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Extract metadata
        metadata = extruct.extract(response.text, base_url=url)
        
        # Use smart extraction for known platforms
        return await create_smart_metadata_result(url, url_domain, metadata)
        
    except requests.exceptions.Timeout as e:
        raise Exception(f"Request timeout after 10s: {str(e)}")
    except requests.exceptions.ConnectionError as e:
        raise Exception(f"Connection error: {str(e)}")
    except requests.exceptions.HTTPError as e:
        raise Exception(f"HTTP error {response.status_code}: {str(e)}")
    except requests.exceptions.RequestException as e:
        raise Exception(f"Request failed: {str(e)}")
    except Exception as e:
        # For any other failures, provide more context
        raise Exception(f"Metadata extraction failed: {str(e)}")

def extract_urls_from_embeds(embeds_json: Any) -> List[str]:
    """Extract URLs from Farcaster cast embeds JSON"""
    urls = []
    
    if not embeds_json:
        return urls
    
    try:
        if isinstance(embeds_json, str):
            embeds = json.loads(embeds_json)
        else:
            embeds = embeds_json
        
        if isinstance(embeds, list):
            for embed in embeds:
                if isinstance(embed, dict) and 'url' in embed:
                    urls.append(embed['url'])
    except (json.JSONDecodeError, TypeError):
        pass
    
    return urls 