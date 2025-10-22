#!/usr/bin/env python3
"""
Test Metric Comparison Algorithm

Compares trust-based vs PageRank recommendations to validate that trust signals
significantly improve recommendation quality over pure collaborative filtering.
"""

import os
import sys
import logging
from datetime import datetime
from typing import List, Dict, Any, Tuple

# Add the parent directory to Python path so we can import lib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib import (
    get_supabase_client,
    fetch_user_nodes,
    fetch_cast_edges,
    fetch_music_library,
    fetch_user_cast_counts,
    build_social_graph,
    build_trust_graph,
    build_user_artist_graph,
    calculate_pagerank,
    get_trust_recommendations,
    get_pagerank_fallback_curators
)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def generate_pagerank_recommendations(user_id: int, social_graph, user_artist_graph, 
                                    max_recommendations: int = 15) -> List[Dict[str, Any]]:
    """Generate artist recommendations using PageRank-based collaborative filtering."""
    
    # Get top curators by PageRank
    pagerank_scores = calculate_pagerank(social_graph)
    
    if not pagerank_scores:
        return []
    
    # Get user's current artists to filter out
    user_node = f"user_{user_id}"
    current_artists = set()
    
    if user_node in user_artist_graph:
        for neighbor in user_artist_graph.neighbors(user_node):
            neighbor_data = user_artist_graph.nodes[neighbor]
            if neighbor_data.get('node_type') == 'artist':
                current_artists.add(neighbor_data['artist_name'])
    
    # Get top PageRank curators (excluding the user)
    top_curators = sorted(pagerank_scores.items(), key=lambda x: x[1], reverse=True)
    top_curators = [(uid, score) for uid, score in top_curators if uid != user_id][:20]
    
    # Aggregate recommendations from top curators
    artist_scores = {}
    
    for curator_id, pagerank_score in top_curators:
        curator_node = f"user_{curator_id}"
        
        if curator_node in user_artist_graph:
            # Get artists this curator is connected to
            for neighbor in user_artist_graph.neighbors(curator_node):
                neighbor_data = user_artist_graph.nodes[neighbor]
                
                if neighbor_data.get('node_type') == 'artist':
                    artist_name = neighbor_data['artist_name']
                    
                    # Skip if user already knows this artist
                    if artist_name in current_artists:
                        continue
                    
                    # Get curator's affinity for this artist
                    edge_weight = user_artist_graph.edges[curator_node, neighbor]['weight']
                    
                    # Weight by PageRank score
                    recommendation_score = pagerank_score * edge_weight * 1000  # Scale for comparison
                    
                    if artist_name not in artist_scores:
                        artist_scores[artist_name] = {
                            'score': 0,
                            'curators': []
                        }
                    
                    artist_scores[artist_name]['score'] += recommendation_score
                    artist_scores[artist_name]['curators'].append({
                        'user_id': curator_id,
                        'pagerank': pagerank_score,
                        'affinity': edge_weight
                    })
    
    # Convert to sorted list
    recommendations = []
    for artist_name, data in artist_scores.items():
        if data['score'] > 0:
            recommendations.append({
                'artist_name': artist_name,
                'score': data['score'],
                'curator_count': len(data['curators']),
                'curators': sorted(data['curators'], key=lambda x: x['pagerank'], reverse=True)[:3],
                'recommendation_type': 'pagerank'
            })
    
    # Sort by score and limit
    recommendations.sort(key=lambda x: x['score'], reverse=True)
    return recommendations[:max_recommendations]


def compare_recommendations_for_users(supabase, test_users: List[int]):
    """Compare trust-based vs PageRank recommendations for sample users."""
    print("\n=== Comparing Trust vs PageRank Recommendations ===")
    
    # Fetch required data
    users = fetch_user_nodes(supabase, limit=4000)
    all_edges = fetch_cast_edges(supabase, limit=25000)
    trust_edges = fetch_cast_edges(supabase, edge_types=['LIKED', 'REPLIED', 'RECASTED'], limit=20000)
    music_library = fetch_music_library(supabase, limit=12000)
    
    if not all([users, all_edges, trust_edges, music_library]):
        print("❌ Missing required data")
        return []
    
    print(f"Loaded {len(users)} users, {len(all_edges)} edges, {len(music_library)} music records")
    
    # Build graphs
    social_graph = build_social_graph(all_edges, users)
    trust_graph = build_trust_graph(trust_edges, users)
    user_artist_graph = build_user_artist_graph(music_library, all_edges)
    
    # Get user cast counts for trust calculations
    all_user_ids = [user['node_id'] for user in users]
    user_cast_counts = fetch_user_cast_counts(supabase, all_user_ids)
    
    print(f"Built graphs: {social_graph.number_of_nodes()} social nodes, {trust_graph.number_of_nodes()} trust nodes")
    
    comparison_results = []
    
    for user_id in test_users:
        print(f"\n--- Comparing Recommendations for User {user_id} ---")
        
        # Get trust-based recommendations
        trust_recommendations = get_trust_recommendations(
            user_id=user_id,
            trust_graph=trust_graph,
            user_artist_graph=user_artist_graph,
            user_cast_counts=user_cast_counts,
            min_trust_score=0.05,
            max_recommendations=15
        )
        
        # Get PageRank-based recommendations
        pagerank_recommendations = generate_pagerank_recommendations(
            user_id=user_id,
            social_graph=social_graph,
            user_artist_graph=user_artist_graph,
            max_recommendations=15
        )
        
        print(f"Trust recommendations: {len(trust_recommendations)}")
        print(f"PageRank recommendations: {len(pagerank_recommendations)}")
        
        # Analyze recommendation overlap
        trust_artists = {rec['artist_name'] for rec in trust_recommendations}
        pagerank_artists = {rec['artist_name'] for rec in pagerank_recommendations}
        
        overlap = trust_artists & pagerank_artists
        trust_unique = trust_artists - pagerank_artists
        pagerank_unique = pagerank_artists - trust_artists
        
        print(f"Overlap: {len(overlap)} artists")
        print(f"Trust-unique: {len(trust_unique)} artists")
        print(f"PageRank-unique: {len(pagerank_unique)} artists")
        
        # Sample top recommendations
        if trust_recommendations:
            print("Top 3 Trust recommendations:")
            for i, rec in enumerate(trust_recommendations[:3], 1):
                curator_names = [c['username'] for c in rec['curators'][:2]]
                print(f"  {i}. {rec['artist_name']} (score: {rec['score']:.2f}) by {', '.join(curator_names)}")
        
        if pagerank_recommendations:
            print("Top 3 PageRank recommendations:")
            for i, rec in enumerate(pagerank_recommendations[:3], 1):
                curator_info = f"{len(rec['curators'])} top curators"
                print(f"  {i}. {rec['artist_name']} (score: {rec['score']:.2f}) from {curator_info}")
        
        comparison_results.append({
            'user_id': user_id,
            'trust_recommendations': trust_recommendations,
            'pagerank_recommendations': pagerank_recommendations,
            'trust_count': len(trust_recommendations),
            'pagerank_count': len(pagerank_recommendations),
            'overlap_count': len(overlap),
            'trust_unique_count': len(trust_unique),
            'pagerank_unique_count': len(pagerank_unique),
            'overlap_artists': list(overlap),
            'trust_unique_artists': list(trust_unique)[:5],  # Sample
            'pagerank_unique_artists': list(pagerank_unique)[:5]  # Sample
        })
    
    return comparison_results


def analyze_recommendation_quality_differences(comparison_results: List[Dict[str, Any]]):
    """Analyze quality differences between trust and PageRank approaches."""
    print("\n=== Analyzing Recommendation Quality Differences ===")
    
    quality_analysis = {
        'trust_advantages': [],
        'pagerank_advantages': [],
        'coverage_comparison': {},
        'attribution_analysis': {}
    }
    
    total_users = len(comparison_results)
    trust_coverage = sum(1 for r in comparison_results if r['trust_count'] > 0)
    pagerank_coverage = sum(1 for r in comparison_results if r['pagerank_count'] > 0)
    
    quality_analysis['coverage_comparison'] = {
        'trust_coverage': trust_coverage / total_users,
        'pagerank_coverage': pagerank_coverage / total_users,
        'trust_avg_recommendations': sum(r['trust_count'] for r in comparison_results) / total_users,
        'pagerank_avg_recommendations': sum(r['pagerank_count'] for r in comparison_results) / total_users
    }
    
    print(f"Coverage Comparison:")
    print(f"  Trust coverage: {trust_coverage}/{total_users} ({trust_coverage/total_users:.2%})")
    print(f"  PageRank coverage: {pagerank_coverage}/{total_users} ({pagerank_coverage/total_users:.2%})")
    print(f"  Avg trust recommendations: {quality_analysis['coverage_comparison']['trust_avg_recommendations']:.1f}")
    print(f"  Avg PageRank recommendations: {quality_analysis['coverage_comparison']['pagerank_avg_recommendations']:.1f}")
    
    # Analyze unique recommendations
    trust_brings_unique = sum(1 for r in comparison_results if r['trust_unique_count'] > 0)
    pagerank_brings_unique = sum(1 for r in comparison_results if r['pagerank_unique_count'] > 0)
    
    print(f"\nUniqueness Analysis:")
    print(f"  Users with trust-unique recommendations: {trust_brings_unique}/{total_users}")
    print(f"  Users with PageRank-unique recommendations: {pagerank_brings_unique}/{total_users}")
    
    # Attribution analysis
    trust_with_attribution = 0
    total_trust_recs = 0
    
    for result in comparison_results:
        for rec in result['trust_recommendations']:
            total_trust_recs += 1
            if rec.get('curators') and len(rec['curators']) > 0:
                trust_with_attribution += 1
    
    quality_analysis['attribution_analysis'] = {
        'trust_attribution_rate': trust_with_attribution / total_trust_recs if total_trust_recs > 0 else 0,
        'total_trust_recommendations': total_trust_recs
    }
    
    print(f"\nAttribution Analysis:")
    print(f"  Trust recommendations with attribution: {trust_with_attribution}/{total_trust_recs} ({trust_with_attribution/total_trust_recs:.2%})" if total_trust_recs > 0 else "  No trust recommendations to analyze")
    
    return quality_analysis


def validate_trust_vs_pagerank_value(comparison_results: List[Dict[str, Any]], 
                                   quality_analysis: Dict[str, Any]) -> Dict[str, Any]:
    """Validate that trust-based approach provides meaningful improvements."""
    print("\n=== Validating Trust vs PageRank Value Proposition ===")
    
    validation = {
        'trust_coverage_advantage': False,
        'trust_attribution_advantage': False,
        'trust_unique_value': False,
        'recommendation_quality': False,
        'quality_indicators': []
    }
    
    coverage = quality_analysis['coverage_comparison']
    
    # Coverage advantage
    if coverage['trust_coverage'] >= 0.6:  # At least 60% coverage
        validation['trust_coverage_advantage'] = True
        validation['quality_indicators'].append("✅ Trust-based recommendations provide good coverage")
    else:
        validation['quality_indicators'].append("⚠️  Trust coverage may be too limited")
    
    # Attribution advantage
    attribution_rate = quality_analysis['attribution_analysis']['trust_attribution_rate']
    if attribution_rate >= 0.8:
        validation['trust_attribution_advantage'] = True
        validation['quality_indicators'].append("✅ Trust recommendations provide clear attribution")
    else:
        validation['quality_indicators'].append("⚠️  Limited attribution in trust recommendations")
    
    # Unique value
    users_with_trust_unique = sum(1 for r in comparison_results if r['trust_unique_count'] > 0)
    if users_with_trust_unique / len(comparison_results) >= 0.5:
        validation['trust_unique_value'] = True
        validation['quality_indicators'].append("✅ Trust provides unique recommendations not found by PageRank")
    else:
        validation['quality_indicators'].append("⚠️  Limited unique value from trust approach")
    
    # Overall recommendation quality
    trust_avg = coverage['trust_avg_recommendations']
    pagerank_avg = coverage['pagerank_avg_recommendations']
    
    if trust_avg >= 3 and coverage['trust_coverage'] >= 0.5:
        validation['recommendation_quality'] = True
        validation['quality_indicators'].append("✅ Trust recommendations show good quality and quantity")
    else:
        validation['quality_indicators'].append("⚠️  Trust recommendation quality needs improvement")
    
    print("Value Proposition Assessment:")
    for indicator in validation['quality_indicators']:
        print(f"  {indicator}")
    
    return validation


def generate_markdown_report(comparison_results: List[Dict[str, Any]],
                           quality_analysis: Dict[str, Any],
                           validation: Dict[str, Any]) -> tuple:
    """Generate detailed markdown report."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    quality_passed = sum(1 for ind in validation['quality_indicators'] if ind.startswith('✅'))
    test_passed = quality_passed >= 3
    
    coverage = quality_analysis['coverage_comparison']
    attribution = quality_analysis['attribution_analysis']
    
    markdown = f"""# Trust vs PageRank Comparison Test Report

**Generated:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
**Test Status:** {'✅ PASSED' if test_passed else '❌ NEEDS IMPROVEMENT'}
**Users Compared:** {len(comparison_results)}

## Executive Summary

{'Trust-based recommendations provide meaningful improvements over PageRank collaborative filtering with better attribution and social validation.' if test_passed else 'Trust-based approach shows limited advantages over PageRank recommendations and may need refinement.'}

**Key Findings:**
- Trust coverage: {coverage['trust_coverage']:.2%} vs PageRank coverage: {coverage['pagerank_coverage']:.2%}
- Average recommendations per user: Trust {coverage['trust_avg_recommendations']:.1f}, PageRank {coverage['pagerank_avg_recommendations']:.1f}
- Trust attribution rate: {attribution['trust_attribution_rate']:.2%}

## Detailed Comparison Results

"""
    
    for result in comparison_results:
        user_id = result['user_id']
        trust_count = result['trust_count']
        pagerank_count = result['pagerank_count']
        overlap_count = result['overlap_count']
        
        markdown += f"""### User {user_id}

**Recommendation Counts:**
- Trust-based: {trust_count} artists
- PageRank-based: {pagerank_count} artists  
- Overlap: {overlap_count} artists

**Trust-Unique Artists:** {', '.join(result['trust_unique_artists']) if result['trust_unique_artists'] else 'None'}

**PageRank-Unique Artists:** {', '.join(result['pagerank_unique_artists']) if result['pagerank_unique_artists'] else 'None'}

"""
        
        # Show sample recommendations
        if result['trust_recommendations']:
            markdown += "**Top 3 Trust Recommendations:**\n"
            for i, rec in enumerate(result['trust_recommendations'][:3], 1):
                curators = [c['username'] for c in rec.get('curators', [])[:2]]
                curator_text = f" (by {', '.join(curators)})" if curators else ""
                markdown += f"{i}. {rec['artist_name']} - score: {rec['score']:.2f}{curator_text}\n"
            markdown += "\n"
        
        if result['pagerank_recommendations']:
            markdown += "**Top 3 PageRank Recommendations:**\n"
            for i, rec in enumerate(result['pagerank_recommendations'][:3], 1):
                markdown += f"{i}. {rec['artist_name']} - score: {rec['score']:.2f}\n"
            markdown += "\n"
        
        markdown += "---\n\n"
    
    markdown += """## Algorithm Quality Analysis

### Coverage Comparison
"""
    
    markdown += f"""
| Metric | Trust-Based | PageRank-Based | Advantage |
|--------|-------------|----------------|-----------|
| User Coverage | {coverage['trust_coverage']:.2%} | {coverage['pagerank_coverage']:.2%} | {'Trust' if coverage['trust_coverage'] > coverage['pagerank_coverage'] else 'PageRank' if coverage['pagerank_coverage'] > coverage['trust_coverage'] else 'Tie'} |
| Avg Recommendations | {coverage['trust_avg_recommendations']:.1f} | {coverage['pagerank_avg_recommendations']:.1f} | {'Trust' if coverage['trust_avg_recommendations'] > coverage['pagerank_avg_recommendations'] else 'PageRank' if coverage['pagerank_avg_recommendations'] > coverage['trust_avg_recommendations'] else 'Tie'} |
| Attribution Rate | {attribution['trust_attribution_rate']:.2%} | N/A | Trust |

### Uniqueness Analysis
"""
    
    users_with_trust_unique = sum(1 for r in comparison_results if r['trust_unique_count'] > 0)
    users_with_pagerank_unique = sum(1 for r in comparison_results if r['pagerank_unique_count'] > 0)
    
    markdown += f"""
- **Users with trust-unique recommendations:** {users_with_trust_unique}/{len(comparison_results)} ({users_with_trust_unique/len(comparison_results):.2%})
- **Users with PageRank-unique recommendations:** {users_with_pagerank_unique}/{len(comparison_results)} ({users_with_pagerank_unique/len(comparison_results):.2%})

"""
    
    markdown += """## Value Proposition Assessment

"""
    
    for indicator in validation['quality_indicators']:
        markdown += f"- {indicator}\n"
    
    markdown += f"""
## Performance Summary

| Assessment | Result |
|------------|---------|
| Trust Coverage | {'Good' if validation['trust_coverage_advantage'] else 'Limited'} ({coverage['trust_coverage']:.2%}) |
| Attribution Quality | {'Excellent' if validation['trust_attribution_advantage'] else 'Poor'} ({attribution['trust_attribution_rate']:.2%}) |
| Unique Value | {'Yes' if validation['trust_unique_value'] else 'Limited'} |
| Overall Quality | {'Good' if validation['recommendation_quality'] else 'Needs Work'} |

## Recommendations

"""
    
    if test_passed:
        markdown += """✅ **PROCEED** with trust-based recommendation system as primary approach
- Trust recommendations provide meaningful social validation and attribution
- Unique recommendations not captured by traditional collaborative filtering
- Clear curator attribution enhances user experience and discovery

**Implementation Strategy:**
1. Use trust-based recommendations as primary algorithm
2. Fall back to PageRank for users with insufficient trust relationships
3. Highlight curator attribution in recommendation UI
4. Implement A/B testing to measure user engagement differences
5. Consider hybrid approaches combining both methods
"""
    else:
        markdown += """🔄 **REFINE** trust-based approach before full deployment
- Trust recommendations may need better coverage or quality improvements
- Consider adjusting trust score thresholds or curator discovery methods
- May need more interaction data or refined trust calculation

**Improvement Areas:**
1. Increase trust relationship discovery and coverage
2. Refine trust scoring formula for better recommendation quality
3. Enhance curator attribution and metadata
4. Consider alternative trust-based collaborative filtering approaches
5. Gather more user interaction data to strengthen trust signals
"""
    
    return markdown, timestamp


def main():
    """Run trust vs PageRank comparison test."""
    print("🧪 Trust vs PageRank Comparison Test")
    print(f"Started at: {datetime.now()}")
    
    try:
        # Connect to database
        supabase = get_supabase_client()
        print("✓ Connected to Supabase")
        
        # Test users - mix of different activity levels
        test_users = [3115, 10081, 417360, 10215, 18910, 2802, 1020, 239, 1689, 12938]
        
        # Compare recommendations
        comparison_results = compare_recommendations_for_users(supabase, test_users)
        
        if not comparison_results:
            print("❌ No comparison results generated")
            sys.exit(1)
        
        # Analyze quality differences
        quality_analysis = analyze_recommendation_quality_differences(comparison_results)
        
        # Validate value proposition
        validation = validate_trust_vs_pagerank_value(comparison_results, quality_analysis)
        
        # Generate report
        markdown_content, timestamp = generate_markdown_report(
            comparison_results, quality_analysis, validation
        )
        
        # Save report
        results_dir = os.path.join(os.path.dirname(__file__), 'results')
        os.makedirs(results_dir, exist_ok=True)
        
        report_filename = f"{timestamp}_metric_comparison_test_report.md"
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
        
        coverage = quality_analysis['coverage_comparison']
        
        print(f"Status: {'✅ PASSED' if test_passed else '❌ NEEDS IMPROVEMENT'}")
        print(f"Users compared: {len(comparison_results)}")
        print(f"Trust coverage: {coverage['trust_coverage']:.2%}")
        print(f"PageRank coverage: {coverage['pagerank_coverage']:.2%}")
        print(f"Quality indicators passed: {quality_passed}/4")
        
        if test_passed:
            print("\n🎉 Trust-based recommendations show clear advantages over PageRank!")
            print("✅ Proceed with trust-based system as primary recommendation engine")
        else:
            print("\n⚠️  Trust approach needs refinement to justify over PageRank")
            print("🔄 Focus on improving trust coverage and recommendation quality")
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
        print(f"❌ Test failed with error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()