#!/usr/bin/env python3
"""
Test Artist Authority Algorithm

Tests Artist PageRank on the Artist Authority Graph to identify influential artists
in the music network based on curator relationships and shared fan overlap.
"""

import os
import sys
import logging
from datetime import datetime
from typing import List, Dict, Any

# Add the parent directory to Python path so we can import lib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib import (
    get_supabase_client,
    fetch_user_nodes,
    fetch_cast_edges,
    fetch_music_library,
    build_social_graph,
    build_user_artist_graph,
    build_artist_authority_graph,
    calculate_pagerank
)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def test_artist_authority_graph_construction(supabase):
    """Test building the Artist Authority Graph."""
    print("\n=== Testing Artist Authority Graph Construction ===")
    
    # Fetch required data
    users = fetch_user_nodes(supabase, limit=3000)
    all_edges = fetch_cast_edges(supabase, limit=20000)
    music_library = fetch_music_library(supabase, limit=10000)
    
    if not all([users, all_edges, music_library]):
        print("❌ Missing required data")
        return None, None, None
    
    print(f"Loaded {len(users)} users, {len(all_edges)} edges, {len(music_library)} music records")
    
    # Build prerequisite graphs
    social_graph = build_social_graph(all_edges, users)
    user_artist_graph = build_user_artist_graph(music_library, all_edges)
    
    print(f"Social graph: {social_graph.number_of_nodes()} nodes, {social_graph.number_of_edges()} edges")
    print(f"User-artist graph: {user_artist_graph.number_of_nodes()} nodes, {user_artist_graph.number_of_edges()} edges")
    
    # Build artist authority graph
    artist_authority_graph = build_artist_authority_graph(user_artist_graph, social_graph)
    
    print(f"Artist authority graph: {artist_authority_graph.number_of_nodes()} artists, {artist_authority_graph.number_of_edges()} connections")
    
    # Analyze graph structure
    if artist_authority_graph.number_of_nodes() > 0:
        # Get sample of connected artists
        sample_artist = list(artist_authority_graph.nodes())[0]
        neighbors = list(artist_authority_graph.neighbors(sample_artist))
        
        print(f"Sample artist '{sample_artist}' connected to {len(neighbors)} other artists")
        if neighbors:
            print(f"  Connected to: {', '.join(neighbors[:5])}")
    
    return artist_authority_graph, user_artist_graph, social_graph


def test_artist_pagerank(artist_authority_graph):
    """Test Artist PageRank calculation."""
    print("\n=== Testing Artist PageRank ===")
    
    if artist_authority_graph.number_of_nodes() == 0:
        print("❌ No artists in authority graph")
        return {}
    
    # Calculate PageRank
    artist_pagerank = calculate_pagerank(artist_authority_graph)
    
    if not artist_pagerank:
        print("❌ Artist PageRank calculation failed")
        return {}
    
    print(f"Calculated PageRank for {len(artist_pagerank)} artists")
    
    # Show top artists
    sorted_artists = sorted(artist_pagerank.items(), key=lambda x: x[1], reverse=True)
    
    print("\nTop 15 Artists by Authority PageRank:")
    for i, (artist, score) in enumerate(sorted_artists[:15], 1):
        print(f"  {i}. {artist}: {score:.6f}")
    
    # Analyze score distribution
    scores = list(artist_pagerank.values())
    avg_score = sum(scores) / len(scores)
    max_score = max(scores)
    
    print(f"\nArtist PageRank Statistics:")
    print(f"  Average: {avg_score:.6f}")
    print(f"  Maximum: {max_score:.6f}")
    print(f"  Authority concentration: {max_score/avg_score:.2f}x above average")
    
    return artist_pagerank


def analyze_artist_fan_overlap(user_artist_graph, artist_authority_graph, top_artists: List[str]):
    """Analyze fan overlap patterns for top artists."""
    print("\n=== Analyzing Artist Fan Overlap ===")
    
    # Get fan counts for top artists
    artist_fans = {}
    
    for node in user_artist_graph.nodes():
        node_data = user_artist_graph.nodes[node]
        if node_data.get('node_type') == 'artist':
            artist_name = node_data['artist_name']
            if artist_name in top_artists:
                fans = []
                for neighbor in user_artist_graph.neighbors(node):
                    neighbor_data = user_artist_graph.nodes[neighbor]
                    if neighbor_data.get('node_type') == 'user':
                        fans.append(neighbor_data['user_id'])
                artist_fans[artist_name] = set(fans)
    
    print(f"Analyzed fan overlap for {len(artist_fans)} top artists")
    
    # Analyze overlap patterns
    overlap_analysis = []
    artist_names = list(artist_fans.keys())
    
    for i, artist_a in enumerate(artist_names):
        for artist_b in artist_names[i+1:]:
            fans_a = artist_fans.get(artist_a, set())
            fans_b = artist_fans.get(artist_b, set())
            
            if fans_a and fans_b:
                overlap = fans_a & fans_b
                union = fans_a | fans_b
                
                if union:
                    similarity = len(overlap) / len(union)
                    
                    overlap_analysis.append({
                        'artist_a': artist_a,
                        'artist_b': artist_b,
                        'fans_a': len(fans_a),
                        'fans_b': len(fans_b),
                        'shared_fans': len(overlap),
                        'similarity': similarity,
                        'connected': artist_authority_graph.has_edge(artist_a, artist_b)
                    })
    
    # Show top overlaps
    overlap_analysis.sort(key=lambda x: x['shared_fans'], reverse=True)
    
    print("\nTop 10 Artist Fan Overlaps:")
    for i, overlap in enumerate(overlap_analysis[:10], 1):
        connected = "🔗 Connected" if overlap['connected'] else "❌ Not connected"
        print(f"  {i}. {overlap['artist_a']} ↔ {overlap['artist_b']}")
        print(f"     Shared fans: {overlap['shared_fans']} | Similarity: {overlap['similarity']:.3f} | {connected}")
    
    return overlap_analysis


def validate_artist_authority_quality(artist_pagerank: Dict[str, float],
                                    artist_authority_graph,
                                    overlap_analysis: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Validate the quality of artist authority algorithms."""
    print("\n=== Validating Artist Authority Quality ===")
    
    validation = {
        'artist_coverage': False,
        'authority_distribution': False,
        'network_connectivity': False,
        'fan_overlap_correlation': False,
        'quality_indicators': []
    }
    
    # Artist coverage
    if len(artist_pagerank) >= 20:
        validation['artist_coverage'] = True
        validation['quality_indicators'].append("✅ Good artist coverage (≥20 artists)")
    else:
        validation['quality_indicators'].append("⚠️  Limited artist coverage (<20 artists)")
    
    # Authority distribution
    if artist_pagerank:
        scores = list(artist_pagerank.values())
        max_score = max(scores)
        avg_score = sum(scores) / len(scores)
        
        if max_score / avg_score > 3:
            validation['authority_distribution'] = True
            validation['quality_indicators'].append("✅ Meaningful authority distribution")
        else:
            validation['quality_indicators'].append("⚠️  Flat authority distribution")
    
    # Network connectivity
    if artist_authority_graph.number_of_edges() > 0:
        validation['network_connectivity'] = True
        validation['quality_indicators'].append("✅ Artists connected in authority network")
    else:
        validation['quality_indicators'].append("❌ No artist connections found")
    
    # Fan overlap correlation
    if overlap_analysis:
        connected_overlaps = [o for o in overlap_analysis if o['connected']]
        if len(connected_overlaps) >= 5:
            validation['fan_overlap_correlation'] = True
            validation['quality_indicators'].append("✅ Fan overlap drives artist connections")
        else:
            validation['quality_indicators'].append("⚠️  Weak fan overlap correlation")
    
    print("Quality Assessment:")
    for indicator in validation['quality_indicators']:
        print(f"  {indicator}")
    
    return validation


def generate_markdown_report(artist_pagerank: Dict[str, float],
                           overlap_analysis: List[Dict[str, Any]],
                           validation: Dict[str, Any],
                           artist_authority_graph) -> tuple:
    """Generate detailed markdown report."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    quality_passed = sum(1 for ind in validation['quality_indicators'] if ind.startswith('✅'))
    test_passed = quality_passed >= 3
    
    markdown = f"""# Artist Authority Test Report

**Generated:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
**Test Status:** {'✅ PASSED' if test_passed else '❌ NEEDS IMPROVEMENT'}
**Artists Analyzed:** {len(artist_pagerank)}

## Executive Summary

{'Artist authority algorithms successfully identify influential artists through curator relationships and fan overlap patterns.' if test_passed else 'Artist authority analysis shows limited coverage or weak relationship patterns.'}

**Key Findings:**
- Artist PageRank calculated for {len(artist_pagerank)} artists
- {artist_authority_graph.number_of_edges()} artist-artist connections identified
- {len(overlap_analysis)} fan overlap relationships analyzed

## Artist Authority Rankings

### Top 15 Most Influential Artists
"""
    
    if artist_pagerank:
        sorted_artists = sorted(artist_pagerank.items(), key=lambda x: x[1], reverse=True)
        
        for i, (artist, score) in enumerate(sorted_artists[:15], 1):
            markdown += f"{i}. **{artist}** - {score:.6f}\n"
        
        scores = list(artist_pagerank.values())
        avg_score = sum(scores) / len(scores)
        max_score = max(scores)
        
        markdown += f"""
### Authority Statistics
- **Average Score:** {avg_score:.6f}
- **Maximum Score:** {max_score:.6f}
- **Authority Concentration:** {max_score/avg_score:.2f}x above average

"""
    
    markdown += """## Fan Overlap Analysis

### Top 10 Artist Fan Overlaps
"""
    
    for i, overlap in enumerate(overlap_analysis[:10], 1):
        connected_status = "🔗 Connected in authority graph" if overlap['connected'] else "❌ Not connected"
        markdown += f"""
**{i}. {overlap['artist_a']} ↔ {overlap['artist_b']}**
- Shared fans: {overlap['shared_fans']}
- Fan similarity: {overlap['similarity']:.3f}
- Authority connection: {connected_status}
"""
    
    markdown += """
---

## Algorithm Quality Assessment

"""
    
    for indicator in validation['quality_indicators']:
        markdown += f"- {indicator}\n"
    
    markdown += f"""
## Performance Metrics

| Metric | Value | Assessment |
|--------|-------|------------|
| Artist Coverage | {len(artist_pagerank)} | {'Good' if len(artist_pagerank) >= 20 else 'Limited'} |
| Authority Distribution | {max(artist_pagerank.values())/sum(artist_pagerank.values())*len(artist_pagerank):.2f}x concentration | {'Meaningful' if validation['authority_distribution'] else 'Flat'} |
| Network Connectivity | {artist_authority_graph.number_of_edges()} connections | {'Good' if artist_authority_graph.number_of_edges() > 0 else 'None'} |
| Fan Overlap Patterns | {len(overlap_analysis)} relationships | {'Rich' if len(overlap_analysis) >= 20 else 'Limited'} |

## Recommendations

"""
    
    if test_passed:
        markdown += """✅ **PROCEED** with artist authority features
- Artist PageRank successfully identifies influential artists in the network
- Fan overlap patterns drive meaningful artist-artist connections
- Authority graph provides foundation for artist recommendation and discovery

**Implementation Opportunities:**
1. Use Artist PageRank for "trending artists" and discovery features
2. Leverage artist connections for "similar artists" recommendations  
3. Apply authority scores for artist ranking and prioritization
4. Implement artist influence metrics for curator quality assessment
"""
    else:
        markdown += """🔄 **IMPROVE** artist authority algorithms before deployment
- Artist coverage or authority patterns may be too limited
- May need more music interaction data or refined graph construction
- Consider alternative artist similarity calculation methods

**Improvement Areas:**
1. Increase music library coverage to capture more artist relationships
2. Refine artist authority graph construction parameters
3. Validate artist rankings against expected influential artists
4. Consider weighted fan overlap calculations
"""
    
    return markdown, timestamp


def main():
    """Run artist authority algorithm test."""
    print("🧪 Artist Authority Algorithm Test")
    print(f"Started at: {datetime.now()}")
    
    try:
        # Connect to database
        supabase = get_supabase_client()
        print("✓ Connected to Supabase")
        
        # Test artist authority graph construction
        artist_authority_graph, user_artist_graph, social_graph = test_artist_authority_graph_construction(supabase)
        
        if not artist_authority_graph:
            print("❌ Failed to build artist authority graph")
            sys.exit(1)
        
        # Test artist PageRank
        artist_pagerank = test_artist_pagerank(artist_authority_graph)
        
        if not artist_pagerank:
            print("❌ No artist PageRank results")
            sys.exit(1)
        
        # Analyze fan overlap
        top_artists = [artist for artist, _ in sorted(artist_pagerank.items(), key=lambda x: x[1], reverse=True)[:20]]
        overlap_analysis = analyze_artist_fan_overlap(user_artist_graph, artist_authority_graph, top_artists)
        
        # Validate quality
        validation = validate_artist_authority_quality(artist_pagerank, artist_authority_graph, overlap_analysis)
        
        # Generate report
        markdown_content, timestamp = generate_markdown_report(
            artist_pagerank, overlap_analysis, validation, artist_authority_graph
        )
        
        # Save report
        results_dir = os.path.join(os.path.dirname(__file__), 'results')
        os.makedirs(results_dir, exist_ok=True)
        
        report_filename = f"{timestamp}_artist_authority_test_report.md"
        report_path = os.path.join(results_dir, report_filename)
        
        with open(report_path, 'w') as f:
            f.write(markdown_content)
        
        print(f"\n📄 Report saved to: {report_path}")
        
        # Print summary
        print(f"\n{'='*60}")
        print("TEST SUMMARY")
        print(f"{'='*60}")
        
        quality_passed = sum(1 for ind in validation['quality_indicators'] if ind.startswith('✅'))
        test_passed = quality_passed >= 3
        
        print(f"Status: {'✅ PASSED' if test_passed else '❌ NEEDS IMPROVEMENT'}")
        print(f"Artists analyzed: {len(artist_pagerank)}")
        print(f"Artist connections: {artist_authority_graph.number_of_edges()}")
        print(f"Quality indicators passed: {quality_passed}/4")
        
        if test_passed:
            print("\n🎉 Artist authority algorithms show strong influence patterns!")
            print("✅ Ready for artist recommendation and discovery features")
        else:
            print("\n⚠️  Artist authority needs more data or refined algorithms")
            print("🔄 Focus on increasing music coverage and artist relationships")
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
        print(f"❌ Test failed with error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()