"""
Claude API integration for cast music extraction
Updated to process enhanced context (cast text + URL metadata)
"""

import json
import asyncio
from typing import List, Dict, Any
import anthropic
import os
from dotenv import load_dotenv
from prefect import task
from datetime import datetime
import re

load_dotenv()

# Initialize Claude client
claude_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Test tracking globals
current_test_run = None
test_results = []
current_cast_id_map = {}  # Maps prompt index to actual cast_id

def start_test_run(model: str, prompt_version: str, batch_size: int, context_length: str = "full"):
    """Start tracking a new test run"""
    global current_test_run
    
    current_test_run = {
        "test_start_time": datetime.now(),
        "model": model,
        "prompt_version": prompt_version,
        "batch_size": batch_size,
        "context_length": context_length,
        "casts_processed": 0,
        "extracted_entries": 0,
        "api_calls": 0,
        "processing_start": None,
        "processing_end": None
    }

def log_batch_result(casts_in_batch: int, extractions_in_batch: int):
    """Log results from a batch (accumulates into current test run)"""
    global current_test_run
    
    if current_test_run:
        current_test_run["casts_processed"] += casts_in_batch
        current_test_run["extracted_entries"] += extractions_in_batch
        current_test_run["api_calls"] += 1

def finish_test_run(all_extractions: list):
    """Finish the current test run and log final results"""
    global current_test_run
    
    if not current_test_run:
        return None
        
    # Calculate final metrics
    processing_time = (current_test_run["processing_end"] - current_test_run["processing_start"]).total_seconds() if current_test_run["processing_start"] and current_test_run["processing_end"] else 0
    avg_confidence = sum(e.get('confidence_score', 0) for e in all_extractions) / len(all_extractions) if all_extractions else 0
    success_rate = (current_test_run["extracted_entries"] / current_test_run["casts_processed"] * 100) if current_test_run["casts_processed"] > 0 else 0
    estimated_cost = estimate_cost(current_test_run["model"], current_test_run["api_calls"], current_test_run["batch_size"])
    cost_per_extraction = estimated_cost / max(current_test_run["extracted_entries"], 1) if current_test_run["extracted_entries"] > 0 else 0
    extractions_per_second = current_test_run["extracted_entries"] / processing_time if processing_time > 0 else 0
    
    result = {
        "test_start_time": current_test_run["test_start_time"].strftime("%H:%M:%S"),
        "model": current_test_run["model"],
        "prompt_version": current_test_run["prompt_version"],
        "batch_size": current_test_run["batch_size"],
        "context_length": current_test_run["context_length"],
        "casts_processed": current_test_run["casts_processed"],
        "extracted_entries": current_test_run["extracted_entries"],
        "success_rate": f"{success_rate:.1f}%",
        "average_confidence": f"{avg_confidence:.3f}",
        "total_duration": f"{processing_time:.2f}s",
        "estimated_cost": f"{estimated_cost:.2f}¢",
        "cost_per_extraction": f"{cost_per_extraction:.2f}¢",
        "api_calls": current_test_run["api_calls"],
        "extractions_per_second": f"{extractions_per_second:.2f}"
    }
    
    test_results.append(result)
    current_test_run = None
    return result

def estimate_cost(model: str, api_calls: int, avg_batch_size: int) -> float:
    """Rough cost estimation in cents - updated with more realistic numbers"""
    
    # More realistic token estimates per batch (prompt + response)
    # Based on actual usage: 15 casts + URL metadata + response
    token_estimates = {
        "claude-3-5-sonnet-20241022": 4500,  # ~4.5k tokens per batch (was 2k)
        "claude-3-5-haiku-20241022": 3500,   # ~3.5k tokens per batch  
        "claude-3-7-sonnet-20250219": 4500,  # ~4.5k tokens per batch
    }
    
    # Updated pricing (input+output combined, in cents per 1k tokens)
    # Based on current Anthropic pricing
    pricing = {
        "claude-3-5-sonnet-20241022": 0.6,   # ~0.6¢ per 1k tokens (was 0.4¢)
        "claude-3-5-haiku-20241022": 0.08,   # ~0.08¢ per 1k tokens  
        "claude-3-7-sonnet-20250219": 1.2,   # ~1.2¢ per 1k tokens
    }
    
    tokens_per_call = token_estimates.get(model, 4500)
    cost_per_1k = pricing.get(model, 0.6)
    
    total_tokens = api_calls * tokens_per_call
    estimated_cost = (total_tokens / 1000) * cost_per_1k
    
    # Add a buffer for underestimation (10% safety margin)
    return estimated_cost * 1.1

def clear_test_results():
    """Clear all test results"""
    global test_results
    test_results = []
    print("🧹 Cleared test results history")

def print_test_comparison():
    """Print a comparison of all test results"""
    
    if not test_results:
        print("No test results to compare")
        return
    
    print(f"\n{'='*120}")
    print(f"🧪 TEST RESULTS COMPARISON ({len(test_results)} test runs)")
    print(f"{'='*120}")
    
    # Headers
    print(f"{'Time':<8} {'Model':<12} {'Prompt':<10} {'Casts':<6} {'Extracted':<9} {'Success':<8} {'Conf':<6} {'Duration':<8} {'Cost':<7} {'$/Ext':<7} {'API':<4} {'Ext/s':<6}")
    print(f"{'-'*8} {'-'*12} {'-'*10} {'-'*6} {'-'*9} {'-'*8} {'-'*6} {'-'*8} {'-'*7} {'-'*7} {'-'*4} {'-'*6}")
    
    # Results
    for result in test_results[-10:]:  # Show last 10 tests
        # Better model name parsing
        model_str = result['model']
        if 'claude-3-5-sonnet' in model_str:
            model_name = "3.5-sonnet"
        elif 'claude-3-5-haiku' in model_str:
            model_name = "3.5-haiku"
        elif 'claude-3-7-sonnet' in model_str:
            model_name = "3.7-sonnet"
        elif 'claude-sonnet-4' in model_str:
            model_name = "4.0-sonnet"
        else:
            model_name = model_str[:12]
            
        print(f"{result['test_start_time']:<8} {model_name:<12} {result['prompt_version']:<10} {result['casts_processed']:<6} {result['extracted_entries']:<9} {result['success_rate']:<8} {result['average_confidence']:<6} {result['total_duration']:<8} {result['estimated_cost']:<7} {result['cost_per_extraction']:<7} {result['api_calls']:<4} {result['extractions_per_second']:<6}")
    
    # Best results
    if len(test_results) > 1:
        best_success = max(test_results, key=lambda x: float(x['success_rate'].rstrip('%')))
        best_cost = min(test_results, key=lambda x: float(x['estimated_cost'].rstrip('¢')))
        
        # Better model names for summary
        def format_model_name(model_str):
            if 'claude-3-5-sonnet' in model_str:
                return "3.5-sonnet"
            elif 'claude-3-5-haiku' in model_str:
                return "3.5-haiku"
            elif 'claude-3-7-sonnet' in model_str:
                return "3.7-sonnet"
            elif 'claude-sonnet-4' in model_str:
                return "4.0-sonnet"
            else:
                return model_str
        
        print(f"\n🏆 Best Success Rate: {best_success['success_rate']} ({format_model_name(best_success['model'])} {best_success['prompt_version']})")
        print(f"💰 Best Cost: {best_cost['estimated_cost']} ({format_model_name(best_cost['model'])} {best_cost['prompt_version']})")
        
        # Show average performance for current config
        current_config_results = [r for r in test_results if r['model'] == test_results[-1]['model'] and r['prompt_version'] == test_results[-1]['prompt_version']]
        if len(current_config_results) > 1:
            avg_success = sum(float(r['success_rate'].rstrip('%')) for r in current_config_results) / len(current_config_results)
            avg_cost = sum(float(r['estimated_cost'].rstrip('¢')) for r in current_config_results) / len(current_config_results)
            print(f"📊 Current config ({format_model_name(test_results[-1]['model'])} {test_results[-1]['prompt_version']}): {avg_success:.1f}% success, {avg_cost:.1f}¢ avg cost over {len(current_config_results)} runs")

async def extract_music_from_embeds(
    embed_contexts: List[Dict], 
    model: str = "claude-3-5-sonnet-20241022"
) -> List[Dict]:
    """
    Extract music information from embeds using per-embed context
    
    Args:
        embed_contexts: List of embed contexts with cast text and embed metadata
        model: Claude model to use for extraction
        
    Returns:
        List of music extraction dictionaries
    """
    if not embed_contexts:
        return []
        
    try:
        print(f"Processing {len(embed_contexts)} embeds with {model}")
        
        if current_test_run:
            current_test_run["processing_start"] = datetime.now()
        
        # Build the extraction prompt
        prompt = build_extraction_prompt(embed_contexts)
        
        # Call Claude API
        try:
            response = claude_client.messages.create(
                model=model,
                max_tokens=4000,
                temperature=0.1,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            response_text = response.content[0].text
            
        except Exception as api_error:
            if "overloaded" in str(api_error).lower() or "529" in str(api_error):
                print(f"🚨 API overloaded (529 error) - this is a system-wide issue")
                print("💡 This requires stopping the entire flow and trying again later")
                raise Exception("API_OVERLOAD") from api_error
            else:
                print(f"❌ API call failed: {str(api_error)}")
                raise
        
        if current_test_run:
            current_test_run["processing_end"] = datetime.now()
            
        # Parse the response
        extractions = parse_claude_response(response_text, embed_contexts, model)
        
        # Log results for test tracking
        if current_test_run:
            log_batch_result(len(embed_contexts), len(extractions))
        
        return extractions
        
    except Exception as e:
        print(f"❌ Error in music extraction: {str(e)}")
        if current_test_run:
            current_test_run["processing_end"] = datetime.now()
        raise

def build_extraction_prompt(embed_contexts: List[Dict]) -> str:
    """Build the extraction prompt for per-embed processing"""
    
    context_blocks = []
    embed_id_map = {}  # Map index to actual (cast_id, embed_index)
    
    for i, context in enumerate(embed_contexts, 1):
        cast_text = context.get('cast_text', '').strip()
        embed_metadata = context.get('embed_metadata', '').strip()
        
        # Store mapping for later
        embed_id_map[str(i)] = (context['cast_id'], context['embed_index'])
        
        # Build structured but concise context block
        block = f"{i}."
        if cast_text:
            block += f" {cast_text}"
        if embed_metadata:
            block += f" → {embed_metadata}"  # Arrow to show embed metadata
            
        if cast_text or embed_metadata:
            context_blocks.append(block)
    
    contexts_text = "\n".join(context_blocks)
    
    prompt = f"""Extract music from these posts with embedded content:

{contexts_text}

GENRE CLASSIFICATION: Select 1-3 genres from this curated list only:
ambient, bluegrass, blues, christian rap, classic rock, classical, country, disco, drum-and-bass, electronic, folk, funk, hip-hop, house, indie, jazz, k-pop, lo-fi, metal, old school hip-hop, pop, pop punk, punk, r&b, reggae, rock, soul, synthwave

RELEASE DATE EXTRACTION: Look for release_date, upload_date, or year in metadata. Format as YYYY-MM-DD or YYYY.

Examples:
"I got so many theories and suspicions → title - YAH. | channel - Kendrick Lamar - Topic | release_date - 2017-04-14" → {{"embed_id":"1","music_type":"song","title":"YAH.","artist":"Kendrick Lamar","album":null,"genres":["hip-hop"],"release_date":"2017-04-14","confidence":0.9}}
"love this new track → title - Roudeep - Falling | channel - GEORGIA BEATS | genre - Deep House | release_date - 2023-08-15" → {{"embed_id":"2","music_type":"song","title":"Falling","artist":"Roudeep","album":null,"genres":["house","electronic"],"release_date":"2023-08-15","confidence":0.8}}
"qc your favorite album of 2025 so far → title - Black Hole Superette by Aesop Rock | release_date - 2025-01-15" → {{"embed_id":"3","music_type":"album","title":"Black Hole Superette","artist":"Aesop Rock","album":"Black Hole Superette","genres":["hip-hop"],"release_date":"2025-01-15","confidence":0.9}}
"My kind of Saturday vibes 🫶🏻✨ → title - The Cast of Buena Vista Social Club: Tiny Desk Concert | channel - NPR Music | upload_date - 2019-05-22" → {{"embed_id":"4","music_type":"song","title":"Tiny Desk Concert","artist":"The Cast of Buena Vista Social Club","album":null,"genres":["jazz","folk"],"release_date":"2019-05-22","confidence":0.8}}
"Is every New Yorker on the street just an undercover rapper?? → title - Guy in a SUIT Shocks EVERYONE with INCREDIBLE Freestyle | channel - ARIatHOME | upload_date - 2024-03-10" → {{"embed_id":"5","music_type":"song","title":"Guy in a SUIT Shocks EVERYONE with INCREDIBLE Freestyle","artist":"ARIatHOME","album":null,"genres":["hip-hop"],"release_date":"2024-03-10","confidence":0.7}}
"classic Worship DnB set → title - Sub Focus, Dimension, Culture Shock & 1991: LA Livestream | WORSHIP x DNBNL x UKF On Air | channel - UKF On Air | upload_date - 2022-11-18" → {{"embed_id":"6","music_type":"song","title":"Sub Focus, Dimension, Culture Shock & 1991: LA Livestream","artist":"Worship","album":null,"genres":["drum-and-bass","electronic"],"release_date":"2022-11-18","confidence":0.8}}
"loving this track → title - Stars As Eyes | artist - Robot Koch | album - The Next Billion Years | release_date - 2020-09-04" → {{"embed_id":"7","music_type":"song","title":"Stars As Eyes","artist":"Robot Koch","album":"The Next Billion Years","genres":["electronic","ambient"],"release_date":"2020-09-04","confidence":0.9}}
"absolutely loving this classic → title - Ain't Wastin' Time No More | artist - Allman Brothers Band | album - Eat A Peach | release_date - 1972-02-12" → {{"embed_id":"8","music_type":"song","title":"Ain't Wastin' Time No More","artist":"Allman Brothers Band","album":"Eat A Peach","genres":["rock","classic rock"],"release_date":"1972-02-12","confidence":0.9}}
"new lorde track hits different → title - Man Of The Year | artist - Lorde | album - Solar Power | release_date - 2025-06-27" → {{"embed_id":"9","music_type":"song","title":"Man Of The Year","artist":"Lorde","album":"Solar Power","genres":["pop","indie"],"release_date":"2025-06-27","confidence":0.9}}

Return JSON array (ONE extraction per embed - if no music found, return empty object):
[{{"embed_id":"1","music_type":"song","title":"Name","artist":"Artist","album":"Album","genres":["genre1","genre2"],"release_date":"YYYY-MM-DD","confidence":0.8}}]

Return [] if no music found."""

    # Store the mapping globally so parse function can access it
    global current_cast_id_map
    current_cast_id_map = embed_id_map
    
    return prompt

def parse_claude_response(response_text: str, contexts: List[Dict], model: str = "claude-3-5-sonnet-20241022") -> List[Dict]:
    """Parse Claude's response and format as extraction records for per-embed processing"""
    global current_cast_id_map
    
    try:
        # Try multiple approaches to extract JSON from Claude's response
        extractions_json = None
        
        # Method 1: Look for JSON inside markdown code blocks
        code_block_match = re.search(r'```json\s*(\[.*?\])\s*```', response_text, re.DOTALL | re.IGNORECASE)
        if code_block_match:
            try:
                extractions_json = json.loads(code_block_match.group(1))
                print("✅ Found JSON in markdown code block")
            except json.JSONDecodeError:
                pass
        
        # Method 2: Look for the last/final JSON array in the response
        if not extractions_json:
            # Find all JSON arrays and take the last one (usually the final output)
            json_matches = re.findall(r'\[(?:[^[\]]|(?:\[.*?\]))*\]', response_text, re.DOTALL)
            for match in reversed(json_matches):  # Start from the end
                try:
                    parsed = json.loads(match)
                    if isinstance(parsed, list):  # Make sure it's a list
                        extractions_json = parsed
                        print("✅ Found JSON array in response text")
                        break
                except json.JSONDecodeError:
                    continue
        
        # Method 3: Original simple regex approach
        if not extractions_json:
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                try:
                    extractions_json = json.loads(json_match.group())
                    print("✅ Found JSON with simple regex")
                except json.JSONDecodeError:
                    pass
        
        if not extractions_json:
            print("❌ No valid JSON array found in response")
            print(f"Response preview: {response_text[:200]}...")
            return []
        
        # Process the found JSON
        results = []
        for extraction in extractions_json:
            if not isinstance(extraction, dict):
                continue
                
            embed_index = extraction.get('embed_id', '')
            
            # Map index back to actual (cast_id, embed_index)
            embed_key = current_cast_id_map.get(str(embed_index))
            if not embed_key:
                print(f"⚠️ Could not map embed index {embed_index} to actual key")
                continue
            
            cast_id, embed_idx = embed_key
            
            # Find the context for this embed to get author_fid
            context = next((c for c in contexts if c['cast_id'] == cast_id and c['embed_index'] == embed_idx), None)
            if not context:
                print(f"⚠️ Could not find context for embed {cast_id}:{embed_idx}")
                continue
            
            # Parse genres array (Phase 3 enhancement)
            genres = extraction.get('genres', [])
            if isinstance(genres, list):
                # Validate genres against our taxonomy
                valid_genres = [
                    'ambient', 'bluegrass', 'blues', 'christian rap', 'classic rock', 'classical', 
                    'country', 'disco', 'drum-and-bass', 'electronic', 'folk', 'funk', 'hip-hop', 
                    'house', 'indie', 'jazz', 'k-pop', 'lo-fi', 'metal', 'old school hip-hop', 
                    'pop', 'pop punk', 'punk', 'r&b', 'reggae', 'rock', 'roots', 'soul', 'synthwave'
                ]
                filtered_genres = [g for g in genres if g in valid_genres][:3]  # Max 3 genres
            else:
                filtered_genres = []
            
            # Parse release date (Phase 3 enhancement)
            release_date = extraction.get('release_date')
            if release_date and release_date != 'null':
                # Normalize date format
                if len(str(release_date)) == 4:  # Just year
                    release_date = f"{release_date}-01-01"
            else:
                release_date = None

            result = {
                'cast_id': cast_id,
                'embed_index': embed_idx,
                'author_fid': context.get('author_fid', ''),
                'music_type': extraction.get('music_type', 'song'),  # Default to 'song'
                'title': extraction.get('title', '').strip() if extraction.get('title') else None,
                'artist': extraction.get('artist', '').strip() if extraction.get('artist') else None,
                'album': extraction.get('album', '').strip() if extraction.get('album') else None,
                'genres': filtered_genres,  # Phase 3: Genre classification
                'release_date': release_date,  # Phase 3: Release date extraction
                'platform_name': context.get('platform_name'),  # Include platform info from metadata
                'confidence_score': float(extraction.get('confidence', 0.0)),
                'ai_model_version': current_test_run.get('model') if current_test_run else model
            }
            
            # Validate music_type
            valid_music_types = ['song', 'album', 'playlist', 'artist']
            if result['music_type'] not in valid_music_types:
                result['music_type'] = 'song'  # Default fallback
            
            # Only store if we have an actual title (not just artist name)
            if result['title']:
                results.append(result)
        
        print(f"🎵 Successfully parsed {len(results)} music extractions from response")
        return results
        
    except Exception as e:
        print(f"❌ Error parsing response: {e}")
        print(f"Response preview: {response_text[:300]}...")
        return []

async def extract_music_batch(
    casts: List[Dict],
    model: str = "claude-3-5-sonnet-20241022"
) -> List[Dict]:
    """
    Legacy function for backward compatibility
    Converts old cast format to new context format
    """
    print("Warning: Using legacy extract_music_batch function")
    
    # Convert old format to new context format  
    cast_contexts = []
    for cast in casts:
        context = {
            'cast_id': cast.get('node_id', ''),
            'cast_text': cast.get('cast_text', ''),
            'author_fid': cast.get('author_fid', ''),
            'created_at': cast.get('created_at', ''),
            'url_metadata': []  # No URL metadata in legacy format
        }
        cast_contexts.append(context)
    
    return await extract_music_from_casts(cast_contexts, model)

def validate_extraction_result(extraction: Dict) -> bool:
    """Validate a single extraction result"""
    
    required_fields = ['cast_id', 'title']
    for field in required_fields:
        if not extraction.get(field):
            return False
            
    # Check confidence score range
    confidence = extraction.get('confidence_score')
    if confidence is not None and (confidence < 0 or confidence > 1):
        return False
        
    return True

def get_model_info(model: str) -> Dict[str, Any]:
    """Get information about a specific model"""
    
    model_info = {
        "claude-3-5-sonnet-20241022": {
            "name": "Claude 3.5 Sonnet", 
            "recommended_batch_size": 15,  # Increased for better cost efficiency
            "cost_tier": "balanced",
            "quality": "high"
        },
        "claude-3-5-haiku-20241022": {
            "name": "Claude 3.5 Haiku",
            "recommended_batch_size": 20,  # Back to original for efficiency
            "cost_tier": "low",
            "quality": "good"
        },
        "claude-3-7-sonnet-20250219": {
            "name": "Claude 3.7 Sonnet",
            "recommended_batch_size": 6,  # Smaller batches for premium model
            "cost_tier": "high", 
            "quality": "excellent"
        },
        "claude-sonnet-4-20250514": {
            "name": "Claude 4.0 Sonnet",
            "recommended_batch_size": 5,  # Very small batches for most expensive model
            "cost_tier": "premium",
            "quality": "best"
        }
    }
    
    return model_info.get(model, {
        "name": "Unknown Model",
        "recommended_batch_size": 8,
        "cost_tier": "unknown",
        "quality": "unknown"
    })

# =============================================================================
# PREFECT TASK WRAPPER
# =============================================================================

@task(name="Extract Music Information", log_prints=True, retries=3, retry_delay_seconds=[2, 4, 8])
async def extract_music_task(
    embed_contexts: List[Dict],
    model: str = "claude-3-5-sonnet-20241022"
) -> List[Dict]:
    """Extract music information using Claude AI with per-embed context"""
    if not embed_contexts:
        return []
    
    model_info = get_model_info(model)
    batch_size = model_info['recommended_batch_size']
    
    print(f"Processing {len(embed_contexts)} embeds with {model_info['name']}")
    
    # Process in batches if needed
    all_extractions = []
    for i in range(0, len(embed_contexts), batch_size):
        batch = embed_contexts[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(embed_contexts) + batch_size - 1) // batch_size
        
        print(f"🎵 Processing batch {batch_num}/{total_batches} ({len(batch)} embeds)...")
        
        try:
            batch_extractions = await extract_music_from_embeds(batch, model)
            all_extractions.extend(batch_extractions)
            
            if batch_extractions:
                print(f"✅ Batch {batch_num}: {len(batch_extractions)} extractions")
            else:
                print(f"ℹ️ Batch {batch_num}: No extractions")
                
        except Exception as batch_error:
            if "API_OVERLOAD" in str(batch_error):
                print(f"🚨 API overloaded - stopping entire flow")
                raise batch_error
            else:
                print(f"❌ Batch {batch_num} failed: {str(batch_error)}")
                raise
        
        # Brief pause between batches
        if i + batch_size < len(embed_contexts):
            await asyncio.sleep(1)
    
    print(f"✅ Total extractions: {len(all_extractions)}")
    return all_extractions
