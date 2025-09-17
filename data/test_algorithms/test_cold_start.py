#!/usr/bin/env python3
"""
Test Cold Start Algorithm

Tests PageRank-based fallback recommendations for new users with no trust relationships.
Validates that cold-start users receive reasonable curator and artist recommendations.
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
    build_trust_graph,
    build_user_artist_graph,
    calculate_pagerank,
    detect_communities,
    get_pagerank_fallback_curators,
    get_trusted_curators
)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def identify_cold_start_users(trust_graph, social_graph, min_trust_edges: int = 1) -> List[int]:
    """Identify users with few or no trust relationships (cold start users)."""
    print("\n=== Identifying Cold Start Users ===")
    
    cold_start_users = []
    
    # Find users with minimal trust relationships
    for user_id in social_graph.nodes():
        trust_edges = 0
        
        if user_id in trust_graph:
            trust_edges = trust_graph.out_degree(user_id)
        
        if trust_edges < min_trust_edges:
            cold_start_users.append(user_id)
    
    print(f"Found {len(cold_start_users)} cold start users (< {min_trust_edges} trust relationships)")
    
    # Sample for testing
    sample_size = min(8, len(cold_start_users))
    sample_cold_start = cold_start_users[:sample_size]
    
    print(f"Testing with {len(sample_cold_start)} sample cold start users")
    
    return sample_cold_start


def test_pagerank_fallback_curators(social_graph, community_assignments: Dict[int, int], 
                                  cold_start_users: List[int], users: List[Dict[str, Any]]):
    """Test PageRank-based curator recommendations for cold start users."""
    print("\n=== Testing PageRank Fallback Curators ===")
    
    user_lookup = {user['node_id']: user for user in users}
    fallback_results = []
    
    for user_id in cold_start_users:
        print(f"\n--- Testing Cold Start User {user_id} ---")
        
        # Get PageRank fallback curators
        fallback_curators = get_pagerank_fallback_curators(
            social_graph=social_graph,
            user_id=user_id,
            community_assignments=community_assignments,
            max_curators=10
        )
        
        print(f"Found {len(fallback_curators)} fallback curators")
        
        if fallback_curators:
            print("Top 5 PageRank curators:")
            for i, curator in enumerate(fallback_curators[:5], 1):
                username = curator['username']
                pagerank_score = curator['pagerank_score']
                source = curator['source']
                print(f"  {i}. {username} (PageRank: {pagerank_score:.6f}) - {source}")
        
        fallback_results.append({
            'user_id': user_id,
            'curators_found': len(fallback_curators),
            'fallback_curators': fallback_curators,
            'community_filtered': any(c['source'] == 'community' for c in fallback_curators),
            'avg_pagerank': sum(c['pagerank_score'] for c in fallback_curators) / len(fallback_curators) if fallback_curators else 0
        })
    
    return fallback_results


def compare_trust_vs_pagerank_coverage(trust_graph, social_graph, sample_users: List[int], 
                                     user_cast_counts: Dict[int, int]):
    """Compare recommendation coverage between trust-based and PageRank approaches."""
    print("\n=== Comparing Trust vs PageRank Coverage ===")
    
    coverage_comparison = []
    
    for user_id in sample_users:
        # Get trust-based curators
        trust_curators = get_trusted_curators(
            user_id=user_id,
            trust_graph=trust_graph,
            user_cast_counts=user_cast_counts,
            min_trust_score=0.05,
            max_curators=20
        )
        
        # Get PageRank fallback curators
        pagerank_curators = get_pagerank_fallback_curators(
            social_graph=social_graph,
            user_id=user_id,
            max_curators=20
        )
        
        coverage_comparison.append({
            'user_id': user_id,
            'trust_curators': len(trust_curators),
            'pagerank_curators': len(pagerank_curators),
            'has_trust_coverage': len(trust_curators) > 0,
            'needs_fallback': len(trust_curators) < 3,  # Arbitrary threshold
            'fallback_quality': sum(c['pagerank_score'] for c in pagerank_curators) / len(pagerank_curators) if pagerank_curators else 0
        })
    
    # Analyze coverage patterns
    total_users = len(coverage_comparison)
    trust_coverage = sum(1 for c in coverage_comparison if c['has_trust_coverage'])
    needs_fallback = sum(1 for c in coverage_comparison if c['needs_fallback'])
    
    print(f"Coverage Analysis:")
    print(f"  Total users tested: {total_users}")
    print(f"  Users with trust coverage: {trust_coverage} ({trust_coverage/total_users:.2%})")
    print(f"  Users needing fallback: {needs_fallback} ({needs_fallback/total_users:.2%})")
    
    return coverage_comparison


def test_cold_start_recommendation_pipeline(social_graph, user_artist_graph, 
                                          cold_start_users: List[int]):
    """Test end-to-end recommendation pipeline for cold start users."""
    print("\n=== Testing Cold Start Recommendation Pipeline ===")
    
    pipeline_results = []
    
    for user_id in cold_start_users[:3]:  # Test first 3 for detailed analysis
        print(f"\n--- Pipeline Test for User {user_id} ---")
        
        # Step 1: Get fallback curators
        fallback_curators = get_pagerank_fallback_curators(
            social_graph=social_graph,
            user_id=user_id,
            max_curators=5
        )
        
        print(f"Step 1: Found {len(fallback_curators)} fallback curators")
        
        # Step 2: Get their music preferences (simplified)
        curator_artists = {}
        if fallback_curators:
            for curator in fallback_curators[:3]:  # Top 3 curators
                curator_id = curator['user_id']
                curator_node = f"user_{curator_id}"
                
                if curator_node in user_artist_graph:
                    artists = []
                    for neighbor in user_artist_graph.neighbors(curator_node):
                        neighbor_data = user_artist_graph.nodes[neighbor]
                        if neighbor_data.get('node_type') == 'artist':
                            artists.append(neighbor_data['artist_name'])
                    
                    curator_artists[curator['username']] = artists[:5]  # Top 5 artists
        
        print(f"Step 2: Analyzed music preferences for {len(curator_artists)} curators")
        
        # Show sample recommendations
        total_artist_recommendations = 0
        for curator_name, artists in curator_artists.items():
            print(f"  {curator_name}: {', '.join(artists)}")
            total_artist_recommendations += len(artists)
        
        pipeline_results.append({
            'user_id': user_id,
            'fallback_curators': len(fallback_curators),
            'curator_artists_analyzed': len(curator_artists),
            'total_artist_recommendations': total_artist_recommendations,
            'pipeline_success': total_artist_recommendations > 0
        })
    
    return pipeline_results


def validate_cold_start_quality(fallback_results: List[Dict[str, Any]],
                               coverage_comparison: List[Dict[str, Any]],
                               pipeline_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Validate the quality of cold start algorithms."""
    print("\n=== Validating Cold Start Quality ===")
    
    validation = {
        'fallback_coverage': False,
        'recommendation_quality': False,
        'pipeline_success': False,
        'community_integration': False,
        'quality_indicators': []
    }
    
    # Fallback coverage
    users_with_fallback = sum(1 for r in fallback_results if r['curators_found'] > 0)
    if users_with_fallback / len(fallback_results) >= 0.8:
        validation['fallback_coverage'] = True
        validation['quality_indicators'].append("✅ Good fallback coverage (≥80% users)")
    else:
        validation['quality_indicators'].append("⚠️  Limited fallback coverage")
    
    # Recommendation quality
    if fallback_results:
        avg_curators = sum(r['curators_found'] for r in fallback_results) / len(fallback_results)
        if avg_curators >= 5:
            validation['recommendation_quality'] = True
            validation['quality_indicators'].append("✅ Sufficient fallback curators (≥5 avg)")
        else:
            validation['quality_indicators'].append("⚠️  Few fallback curators per user")
    
    # Pipeline success
    if pipeline_results:
        successful_pipelines = sum(1 for r in pipeline_results if r['pipeline_success'])
        if successful_pipelines / len(pipeline_results) >= 0.7:
            validation['pipeline_success'] = True
            validation['quality_indicators'].append("✅ Cold start pipeline generates recommendations")
        else:
            validation['quality_indicators'].append("⚠️  Cold start pipeline struggles")
    
    # Community integration
    community_filtered = sum(1 for r in fallback_results if r['community_filtered'])
    if community_filtered > 0:
        validation['community_integration'] = True
        validation['quality_indicators'].append("✅ Community-based curator filtering")
    else:
        validation['quality_indicators'].append("⚠️  No community-based filtering")
    
    print("Quality Assessment:")
    for indicator in validation['quality_indicators']:
        print(f"  {indicator}")
    
    return validation


def generate_markdown_report(fallback_results: List[Dict[str, Any]],
                           coverage_comparison: List[Dict[str, Any]],
                           pipeline_results: List[Dict[str, Any]],
                           validation: Dict[str, Any]) -> tuple:
    """Generate detailed markdown report."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    quality_passed = sum(1 for ind in validation['quality_indicators'] if ind.startswith('✅'))
    test_passed = quality_passed >= 3
    
    markdown = f"""# Cold Start Algorithm Test Report

**Generated:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
**Test Status:** {'✅ PASSED' if test_passed else '❌ NEEDS IMPROVEMENT'}
**Cold Start Users Tested:** {len(fallback_results)}

## Executive Summary

{'Cold start algorithms successfully provide meaningful curator and artist recommendations for new users without trust relationships.' if test_passed else 'Cold start fallback mechanisms need improvement to adequately serve new users.'}

**Key Findings:**
- {len(fallback_results)} cold start users tested
- {sum(1 for r in fallback_results if r['curators_found'] > 0)} users received fallback curators
- {len(pipeline_results)} end-to-end pipeline tests completed

## Cold Start User Analysis

### Fallback Curator Results
"""
    
    for result in fallback_results:
        user_id = result['user_id']
        curators_found = result['curators_found']
        avg_pagerank = result['avg_pagerank']
        
        markdown += f"""
**User {user_id}:**
- Fallback curators found: {curators_found}
- Average PageRank: {avg_pagerank:.6f}
- Community filtering: {'Yes' if result['community_filtered'] else 'No'}
"""
    
    markdown += """
### Trust vs PageRank Coverage Comparison
"""
    
    trust_coverage = sum(1 for c in coverage_comparison if c['has_trust_coverage'])
    needs_fallback = sum(1 for c in coverage_comparison if c['needs_fallback'])
    
    markdown += f"""
**Coverage Statistics:**
- Users with trust relationships: {trust_coverage}/{len(coverage_comparison)} ({trust_coverage/len(coverage_comparison):.2%})
- Users needing PageRank fallback: {needs_fallback}/{len(coverage_comparison)} ({needs_fallback/len(coverage_comparison):.2%})

**Sample Coverage Analysis:**
"""
    
    for comparison in coverage_comparison[:5]:
        markdown += f"""
- **User {comparison['user_id']}**: {comparison['trust_curators']} trust curators, {comparison['pagerank_curators']} PageRank curators
"""
    
    markdown += """
### End-to-End Pipeline Results
"""
    
    for result in pipeline_results:
        status = "✅ Success" if result['pipeline_success'] else "❌ Failed"
        markdown += f"""
**User {result['user_id']}** {status}
- Fallback curators: {result['fallback_curators']}
- Artists analyzed: {result['curator_artists_analyzed']}  
- Total artist recommendations: {result['total_artist_recommendations']}
"""
    
    markdown += """
---

## Algorithm Quality Assessment

"""
    
    for indicator in validation['quality_indicators']:
        markdown += f"- {indicator}\n"
    
    avg_fallback_curators = sum(r['curators_found'] for r in fallback_results) / len(fallback_results) if fallback_results else 0
    successful_pipelines = sum(1 for r in pipeline_results if r['pipeline_success']) if pipeline_results else 0
    
    markdown += f"""
## Performance Metrics

| Metric | Value | Assessment |
|--------|-------|------------|
| Fallback Coverage | {sum(1 for r in fallback_results if r['curators_found'] > 0)}/{len(fallback_results)} | {'Good' if sum(1 for r in fallback_results if r['curators_found'] > 0)/len(fallback_results) >= 0.8 else 'Limited'} |
| Avg Curators/User | {avg_fallback_curators:.1f} | {'Good' if avg_fallback_curators >= 5 else 'Low'} |
| Pipeline Success Rate | {successful_pipelines}/{len(pipeline_results)} | {'Good' if len(pipeline_results) > 0 and successful_pipelines/len(pipeline_results) >= 0.7 else 'Poor'} |
| Community Integration | {'Yes' if validation['community_integration'] else 'No'} | {'Good' if validation['community_integration'] else 'Missing'} |

## Recommendations

"""
    
    if test_passed:
        markdown += """✅ **PROCEED** with cold start recommendation features
- PageRank fallback successfully provides curator recommendations for new users
- Cold start pipeline generates meaningful artist recommendations
- Community-based filtering enhances recommendation relevance

**Implementation Plan:**
1. Deploy PageRank fallback as default for users with <3 trust relationships
2. Implement community-aware curator recommendations when possible
3. Set up graduated recommendation pipeline: trust → community PageRank → global PageRank
4. Monitor cold start user engagement and recommendation acceptance rates
"""
    else:
        markdown += """🔄 **IMPROVE** cold start algorithms before deployment
- Fallback coverage or recommendation quality may be insufficient
- Pipeline success rate indicates potential issues with recommendation generation
- May need enhanced PageRank calculation or better community detection

**Improvement Areas:**
1. Increase PageRank calculation accuracy and curator quality scoring
2. Implement better community detection for targeted fallback recommendations
3. Enhance cold start pipeline robustness and error handling
4. Consider hybrid approaches combining multiple fallback strategies
"""
    
    return markdown, timestamp


def main():
    """Run cold start algorithm test."""
    print("🧪 Cold Start Algorithm Test")
    print(f"Started at: {datetime.now()}")
    
    try:
        # Connect to database
        supabase = get_supabase_client()
        print("✓ Connected to Supabase")
        
        # Fetch data
        users = fetch_user_nodes(supabase, limit=3000)
        all_edges = fetch_cast_edges(supabase, limit=20000)
        trust_edges = fetch_cast_edges(supabase, edge_types=['LIKED', 'REPLIED', 'RECASTED'], limit=15000)
        music_library = fetch_music_library(supabase, limit=8000)
        
        if not all([users, all_edges, trust_edges, music_library]):
            print("❌ Missing required data")
            sys.exit(1)
        
        # Build graphs
        social_graph = build_social_graph(all_edges, users)
        trust_graph = build_trust_graph(trust_edges, users)
        user_artist_graph = build_user_artist_graph(music_library, all_edges)
        
        print(f"Built social graph: {social_graph.number_of_nodes()} nodes, {social_graph.number_of_edges()} edges")
        print(f"Built trust graph: {trust_graph.number_of_nodes()} nodes, {trust_graph.number_of_edges()} edges")
        
        # Detect communities for filtering
        community_assignments = detect_communities(social_graph)
        
        # Identify cold start users
        cold_start_users = identify_cold_start_users(trust_graph, social_graph)
        
        # Test PageRank fallback curators
        fallback_results = test_pagerank_fallback_curators(
            social_graph, community_assignments, cold_start_users, users
        )
        
        # Compare trust vs PageRank coverage
        all_user_ids = [user['node_id'] for user in users]
        from .lib.database import fetch_user_cast_counts
        user_cast_counts = fetch_user_cast_counts(supabase, all_user_ids)
        
        sample_users = [user['node_id'] for user in users[:15]]  # Sample for comparison
        coverage_comparison = compare_trust_vs_pagerank_coverage(
            trust_graph, social_graph, sample_users, user_cast_counts
        )
        
        # Test recommendation pipeline
        pipeline_results = test_cold_start_recommendation_pipeline(
            social_graph, user_artist_graph, cold_start_users
        )
        
        # Validate quality
        validation = validate_cold_start_quality(fallback_results, coverage_comparison, pipeline_results)
        
        # Generate report
        markdown_content, timestamp = generate_markdown_report(
            fallback_results, coverage_comparison, pipeline_results, validation
        )
        
        # Save report
        results_dir = os.path.join(os.path.dirname(__file__), 'results')
        os.makedirs(results_dir, exist_ok=True)
        
        report_filename = f"{timestamp}_cold_start_test_report.md"
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
        print(f"Cold start users tested: {len(fallback_results)}")
        print(f"Fallback coverage: {sum(1 for r in fallback_results if r['curators_found'] > 0)}/{len(fallback_results)}")
        print(f"Quality indicators passed: {quality_passed}/4")
        
        if test_passed:
            print("\n🎉 Cold start algorithms provide effective fallback recommendations!")
            print("✅ Ready for new user onboarding and recommendation features")
        else:
            print("\n⚠️  Cold start mechanisms need improvement")
            print("🔄 Focus on fallback coverage and recommendation quality")
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
        print(f"❌ Test failed with error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()