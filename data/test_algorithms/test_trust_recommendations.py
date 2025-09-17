#!/usr/bin/env python3
"""
Test Trust-Based Recommendations Algorithm

Validates trust-based artist recommendations with curator attribution.
Tests the core recommendation engine that leverages trusted curator relationships.
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
    fetch_user_cast_counts,
    build_trust_graph,
    build_user_artist_graph,
    get_trust_recommendations,
    get_trusted_curators
)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def test_user_artist_graph_construction(supabase):
    """Test building the user-artist bipartite graph."""
    print("\n=== Testing User-Artist Graph Construction ===")
    
    # Fetch data
    music_library = fetch_music_library(supabase, limit=10000)
    edges = fetch_cast_edges(supabase, limit=15000)
    
    if not music_library or not edges:
        print("❌ No music library or edges data available")
        return None
    
    print(f"Loaded {len(music_library)} music library records and {len(edges)} edges")
    
    # Build user-artist graph
    user_artist_graph = build_user_artist_graph(music_library, edges)
    
    print(f"Built user-artist graph: {user_artist_graph.number_of_nodes()} nodes, {user_artist_graph.number_of_edges()} edges")
    
    # Analyze graph structure
    user_nodes = [n for n in user_artist_graph.nodes() if user_artist_graph.nodes[n].get('node_type') == 'user']
    artist_nodes = [n for n in user_artist_graph.nodes() if user_artist_graph.nodes[n].get('node_type') == 'artist']
    
    print(f"  Users: {len(user_nodes)}")
    print(f"  Artists: {len(artist_nodes)}")
    
    # Sample some connections
    if artist_nodes:
        sample_artist = artist_nodes[0]
        artist_data = user_artist_graph.nodes[sample_artist]
        connected_users = list(user_artist_graph.neighbors(sample_artist))
        print(f"  Sample artist '{artist_data['artist_name']}' connected to {len(connected_users)} users")
    
    return user_artist_graph


def test_trust_recommendations_for_users(supabase, test_users: List[int]):
    """Test trust-based recommendations for sample users."""
    print("\n=== Testing Trust-Based Recommendations ===")
    
    # Fetch required data
    print("Fetching graph data...")
    users = fetch_user_nodes(supabase, limit=5000)
    trust_edges = fetch_cast_edges(supabase, edge_types=['LIKED', 'REPLIED', 'RECASTED'], limit=20000)
    music_library = fetch_music_library(supabase, limit=15000)
    all_edges = fetch_cast_edges(supabase, limit=25000)
    
    if not all([users, trust_edges, music_library, all_edges]):
        print("❌ Missing required data for recommendations")
        return []
    
    print(f"Loaded {len(users)} users, {len(trust_edges)} trust edges, {len(music_library)} music records")
    
    # Build graphs
    trust_graph = build_trust_graph(trust_edges, users)
    user_artist_graph = build_user_artist_graph(music_library, all_edges)
    
    # Get user cast counts
    all_user_ids = [user['node_id'] for user in users]
    user_cast_counts = fetch_user_cast_counts(supabase, all_user_ids)
    
    print(f"Built trust graph: {trust_graph.number_of_nodes()} nodes, {trust_graph.number_of_edges()} edges")
    print(f"Built user-artist graph: {user_artist_graph.number_of_nodes()} nodes, {user_artist_graph.number_of_edges()} edges")
    
    # Test recommendations for each user
    recommendation_results = []
    
    for user_id in test_users:
        print(f"\n--- Testing Recommendations for User {user_id} ---")
        
        # First get their trusted curators
        curators = get_trusted_curators(
            user_id=user_id,
            trust_graph=trust_graph,
            user_cast_counts=user_cast_counts,
            min_trust_score=0.05,
            max_curators=20
        )
        
        print(f"Found {len(curators)} trusted curators")
        
        if not curators:
            print("⚠️  No trusted curators found - skipping recommendations")
            recommendation_results.append({
                'user_id': user_id,
                'curators_found': 0,
                'recommendations': [],
                'error': 'No trusted curators'
            })
            continue
        
        # Get recommendations
        recommendations = get_trust_recommendations(
            user_id=user_id,
            trust_graph=trust_graph,
            user_artist_graph=user_artist_graph,
            user_cast_counts=user_cast_counts,
            min_trust_score=0.05,
            max_recommendations=15
        )
        
        print(f"Generated {len(recommendations)} recommendations")
        
        if recommendations:
            print("Top 5 recommendations:")
            for i, rec in enumerate(recommendations[:5], 1):
                top_curator = rec['curators'][0] if rec['curators'] else None
                curator_info = f"by {top_curator['username']} (trust: {top_curator['trust_score']:.3f})" if top_curator else "no curator info"
                print(f"  {i}. {rec['artist_name']} (score: {rec['score']:.2f}) - {curator_info}")
                print(f"     Recommended by {rec['curator_count']} curators")
        
        # Get user's current artists for analysis
        user_node = f"user_{user_id}"
        current_artists = []
        if user_node in user_artist_graph:
            for neighbor in user_artist_graph.neighbors(user_node):
                neighbor_data = user_artist_graph.nodes[neighbor]
                if neighbor_data.get('node_type') == 'artist':
                    current_artists.append(neighbor_data['artist_name'])
        
        recommendation_results.append({
            'user_id': user_id,
            'curators_found': len(curators),
            'current_artists': len(current_artists),
            'recommendations': recommendations,
            'top_curators': curators[:3],
            'sample_current_artists': current_artists[:5]
        })
    
    return recommendation_results


def analyze_recommendation_quality(recommendation_results: List[Dict[str, Any]]):
    """Analyze the quality and meaningfulness of generated recommendations."""
    print("\n=== Analyzing Recommendation Quality ===")
    
    if not recommendation_results:
        print("❌ No recommendation results to analyze")
        return {}
    
    analysis = {
        'total_users_tested': len(recommendation_results),
        'users_with_recommendations': 0,
        'avg_recommendations_per_user': 0,
        'avg_curator_attribution': 0,
        'recommendation_diversity': 0,
        'quality_indicators': []
    }
    
    total_recommendations = 0
    total_curator_attributions = 0
    unique_artists_recommended = set()
    users_with_recs = 0
    
    for result in recommendation_results:
        recommendations = result.get('recommendations', [])
        
        if recommendations:
            users_with_recs += 1
            total_recommendations += len(recommendations)
            
            for rec in recommendations:
                unique_artists_recommended.add(rec['artist_name'])
                total_curator_attributions += rec['curator_count']
    
    analysis['users_with_recommendations'] = users_with_recs
    
    if users_with_recs > 0:
        analysis['avg_recommendations_per_user'] = total_recommendations / users_with_recs
        analysis['avg_curator_attribution'] = total_curator_attributions / total_recommendations
    
    analysis['recommendation_diversity'] = len(unique_artists_recommended)
    
    # Quality assessment
    coverage_rate = users_with_recs / analysis['total_users_tested']
    
    print(f"Recommendation Coverage: {users_with_recs}/{analysis['total_users_tested']} users ({coverage_rate:.2%})")
    print(f"Average recommendations per user: {analysis['avg_recommendations_per_user']:.1f}")
    print(f"Average curator attribution: {analysis['avg_curator_attribution']:.1f} curators per recommendation")
    print(f"Unique artists recommended: {analysis['recommendation_diversity']}")
    
    # Quality indicators
    if coverage_rate >= 0.7:
        analysis['quality_indicators'].append("✅ Good coverage (≥70% users get recommendations)")
    else:
        analysis['quality_indicators'].append("⚠️  Low coverage (<70% users)")
    
    if analysis['avg_recommendations_per_user'] >= 5:
        analysis['quality_indicators'].append("✅ Sufficient recommendations (≥5 per user)")
    else:
        analysis['quality_indicators'].append("⚠️  Few recommendations per user")
    
    if analysis['avg_curator_attribution'] >= 1.5:
        analysis['quality_indicators'].append("✅ Good curator attribution (≥1.5 per recommendation)")
    else:
        analysis['quality_indicators'].append("⚠️  Weak curator attribution")
    
    if analysis['recommendation_diversity'] >= 20:
        analysis['quality_indicators'].append("✅ Good diversity (≥20 unique artists)")
    else:
        analysis['quality_indicators'].append("⚠️  Low recommendation diversity")
    
    print("\nQuality Assessment:")
    for indicator in analysis['quality_indicators']:
        print(f"  {indicator}")
    
    return analysis


def validate_recommendation_attribution(recommendation_results: List[Dict[str, Any]]):
    """Validate that recommendations properly attribute trusted curators."""
    print("\n=== Validating Recommendation Attribution ===")
    
    attribution_stats = {
        'total_recommendations': 0,
        'recommendations_with_attribution': 0,
        'avg_curators_per_recommendation': 0,
        'curator_trust_distribution': [],
        'attribution_quality': []
    }
    
    total_curator_count = 0
    
    for result in recommendation_results:
        for rec in result.get('recommendations', []):
            attribution_stats['total_recommendations'] += 1
            
            if rec['curators']:
                attribution_stats['recommendations_with_attribution'] += 1
                total_curator_count += len(rec['curators'])
                
                # Analyze curator trust scores
                for curator in rec['curators']:
                    attribution_stats['curator_trust_distribution'].append(curator['trust_score'])
    
    if attribution_stats['total_recommendations'] > 0:
        attribution_rate = attribution_stats['recommendations_with_attribution'] / attribution_stats['total_recommendations']
        attribution_stats['avg_curators_per_recommendation'] = total_curator_count / attribution_stats['total_recommendations']
        
        print(f"Attribution rate: {attribution_rate:.2%}")
        print(f"Average curators per recommendation: {attribution_stats['avg_curators_per_recommendation']:.1f}")
        
        if attribution_stats['curator_trust_distribution']:
            avg_trust = sum(attribution_stats['curator_trust_distribution']) / len(attribution_stats['curator_trust_distribution'])
            print(f"Average curator trust score: {avg_trust:.4f}")
        
        # Quality checks
        if attribution_rate >= 0.95:
            attribution_stats['attribution_quality'].append("✅ Excellent attribution (≥95%)")
        elif attribution_rate >= 0.8:
            attribution_stats['attribution_quality'].append("✅ Good attribution (≥80%)")
        else:
            attribution_stats['attribution_quality'].append("⚠️  Poor attribution (<80%)")
        
        print("\nAttribution Quality:")
        for quality in attribution_stats['attribution_quality']:
            print(f"  {quality}")
    
    return attribution_stats


def generate_markdown_report(recommendation_results: List[Dict[str, Any]], 
                           quality_analysis: Dict[str, Any],
                           attribution_stats: Dict[str, Any]) -> tuple:
    """Generate detailed markdown report."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Determine test status
    quality_passed = sum(1 for ind in quality_analysis['quality_indicators'] if ind.startswith('✅'))
    attribution_passed = sum(1 for ind in attribution_stats['attribution_quality'] if ind.startswith('✅'))
    test_passed = quality_passed >= 3 and attribution_passed >= 1
    
    markdown = f"""# Trust-Based Recommendations Test Report

**Generated:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
**Test Status:** {'✅ PASSED' if test_passed else '❌ NEEDS IMPROVEMENT'}
**Users Tested:** {quality_analysis['total_users_tested']}

## Executive Summary

{'Trust-based recommendations successfully generate meaningful artist suggestions with proper curator attribution.' if test_passed else 'Recommendation algorithm needs improvement in coverage or attribution quality.'}

**Key Metrics:**
- Recommendation Coverage: {quality_analysis['users_with_recommendations']}/{quality_analysis['total_users_tested']} users ({quality_analysis['users_with_recommendations']/quality_analysis['total_users_tested']:.2%})
- Average Recommendations per User: {quality_analysis['avg_recommendations_per_user']:.1f}
- Unique Artists Recommended: {quality_analysis['recommendation_diversity']}
- Curator Attribution Rate: {attribution_stats['recommendations_with_attribution']}/{attribution_stats['total_recommendations']} ({attribution_stats['recommendations_with_attribution']/attribution_stats['total_recommendations']:.2%} if attribution_stats['total_recommendations'] > 0 else 'N/A')

## Detailed Test Results

"""

    for result in recommendation_results:
        user_id = result['user_id']
        curators_found = result['curators_found']
        recommendations = result.get('recommendations', [])
        
        markdown += f"""### User {user_id}

**Trusted Curators Found:** {curators_found}
**Current Artists:** {result.get('current_artists', 0)}
**Recommendations Generated:** {len(recommendations)}

"""
        
        if result.get('error'):
            markdown += f"*Error: {result['error']}*\n\n"
            continue
        
        # Show top curators
        if result.get('top_curators'):
            markdown += "**Top Trusted Curators:**\n"
            for curator in result['top_curators']:
                markdown += f"- {curator['username']} (trust: {curator['trust_score']:.4f})\n"
            markdown += "\n"
        
        # Show sample current artists
        if result.get('sample_current_artists'):
            markdown += f"**Sample Current Artists:** {', '.join(result['sample_current_artists'])}\n\n"
        
        # Show top recommendations
        if recommendations:
            markdown += "**Top Recommendations:**\n"
            for i, rec in enumerate(recommendations[:8], 1):
                curators_text = ", ".join([f"{c['username']} ({c['trust_score']:.3f})" for c in rec['curators'][:2]])
                markdown += f"{i}. **{rec['artist_name']}** (score: {rec['score']:.2f})\n"
                markdown += f"   - Recommended by: {curators_text}\n"
                markdown += f"   - Total curators: {rec['curator_count']}\n\n"
        else:
            markdown += "*No recommendations generated*\n"
        
        markdown += "---\n\n"
    
    markdown += """## Algorithm Quality Assessment

### Recommendation Quality
"""
    
    for indicator in quality_analysis['quality_indicators']:
        markdown += f"- {indicator}\n"
    
    markdown += "\n### Attribution Quality\n"
    
    for quality in attribution_stats['attribution_quality']:
        markdown += f"- {quality}\n"
    
    markdown += f"""
## Performance Metrics

| Metric | Value | Assessment |
|--------|-------|------------|
| Coverage Rate | {quality_analysis['users_with_recommendations']}/{quality_analysis['total_users_tested']} | {'Excellent' if quality_analysis['users_with_recommendations']/quality_analysis['total_users_tested'] >= 0.8 else 'Good' if quality_analysis['users_with_recommendations']/quality_analysis['total_users_tested'] >= 0.6 else 'Needs Improvement'} |
| Avg Recommendations/User | {quality_analysis['avg_recommendations_per_user']:.1f} | {'Good' if quality_analysis['avg_recommendations_per_user'] >= 5 else 'Low'} |
| Unique Artists | {quality_analysis['recommendation_diversity']} | {'Good' if quality_analysis['recommendation_diversity'] >= 20 else 'Limited'} |
| Attribution Rate | {attribution_stats['recommendations_with_attribution']}/{attribution_stats['total_recommendations']} | {'Excellent' if attribution_stats['total_recommendations'] > 0 and attribution_stats['recommendations_with_attribution']/attribution_stats['total_recommendations'] >= 0.95 else 'Good' if attribution_stats['total_recommendations'] > 0 and attribution_stats['recommendations_with_attribution']/attribution_stats['total_recommendations'] >= 0.8 else 'Poor'} |

## Recommendations

"""
    
    if test_passed:
        markdown += """✅ **PROCEED** with trust-based recommendation implementation
- Algorithm generates meaningful recommendations with proper attribution
- Trust relationships successfully drive artist discovery
- Ready for integration into main recommendation pipeline

**Next Steps:**
1. Implement cold-start fallback for users without trust relationships
2. Compare recommendation quality against PageRank-based approaches  
3. Set up A/B testing framework for recommendation algorithms
"""
    else:
        markdown += """🔄 **IMPROVE** algorithm before full implementation
- Address coverage or attribution quality issues
- May need to lower trust score thresholds or improve curator discovery
- Consider hybrid approaches combining trust and collaborative filtering

**Improvement Areas:**
1. Increase recommendation coverage for more users
2. Improve curator attribution and trust relationship discovery
3. Enhance recommendation diversity and quality
"""
    
    return markdown, timestamp


def main():
    """Run trust-based recommendations test."""
    print("🧪 Trust-Based Recommendations Algorithm Test")
    print(f"Started at: {datetime.now()}")
    
    try:
        # Connect to database
        supabase = get_supabase_client()
        print("✓ Connected to Supabase")
        
        # Test user-artist graph construction
        user_artist_graph = test_user_artist_graph_construction(supabase)
        
        if not user_artist_graph:
            print("❌ Failed to build user-artist graph")
            sys.exit(1)
        
        # Test users - mix of high and moderate activity users
        test_users = [3115, 10081, 417360, 10215, 18910, 2802, 1020, 239]
        
        # Test recommendations
        recommendation_results = test_trust_recommendations_for_users(supabase, test_users)
        
        # Analyze quality
        quality_analysis = analyze_recommendation_quality(recommendation_results)
        
        # Validate attribution
        attribution_stats = validate_recommendation_attribution(recommendation_results)
        
        # Generate report
        markdown_content, timestamp = generate_markdown_report(
            recommendation_results, quality_analysis, attribution_stats
        )
        
        # Save report
        results_dir = os.path.join(os.path.dirname(__file__), 'results')
        os.makedirs(results_dir, exist_ok=True)
        
        report_filename = f"{timestamp}_trust_recommendations_test_report.md"
        report_path = os.path.join(results_dir, report_filename)
        
        with open(report_path, 'w') as f:
            f.write(markdown_content)
        
        print(f"\n📄 Report saved to: {report_path}")
        
        # Print summary
        print(f"\n{'='*60}")
        print("TEST SUMMARY")
        print(f"{'='*60}")
        
        quality_passed = sum(1 for ind in quality_analysis['quality_indicators'] if ind.startswith('✅'))
        attribution_passed = sum(1 for ind in attribution_stats['attribution_quality'] if ind.startswith('✅'))
        test_passed = quality_passed >= 3 and attribution_passed >= 1
        
        print(f"Status: {'✅ PASSED' if test_passed else '❌ NEEDS IMPROVEMENT'}")
        print(f"Users tested: {quality_analysis['total_users_tested']}")
        print(f"Users with recommendations: {quality_analysis['users_with_recommendations']}")
        print(f"Quality indicators passed: {quality_passed}/4")
        print(f"Attribution quality: {attribution_passed}/1")
        
        if test_passed:
            print("\n🎉 Trust-based recommendations algorithm shows excellent results!")
            print("✅ Ready for implementation in recommendation pipeline")
        else:
            print("\n⚠️  Algorithm needs improvement before full deployment")
            print("🔄 Focus on coverage and attribution quality")
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
        print(f"❌ Test failed with error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()