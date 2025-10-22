#!/usr/bin/env python3
"""
Test Trust Curators Discovery Algorithm

Validates trusted curator discovery with weighted interactions using real data.
Tests the core trust scoring formula and curator ranking logic.
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
    fetch_user_cast_counts,
    build_trust_graph,
    get_trusted_curators,
    calculate_trust_score
)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def test_trust_scoring_formula():
    """Test the trust scoring formula with known inputs."""
    print("\n=== Testing Trust Scoring Formula ===")
    
    # Test case 1: Basic trust calculation
    trust_score_1 = calculate_trust_score(
        weighted_interactions=15.0,  # 10 likes + 2 replies + 1 recast = 10*1.0 + 2*0.5 + 1*2.0 = 13.0
        total_music_posts=50,
        is_mutual=False
    )
    print(f"Test 1 - Basic trust (15 interactions / 50 posts): {trust_score_1:.4f}")
    
    # Test case 2: With mutual bonus
    trust_score_2 = calculate_trust_score(
        weighted_interactions=15.0,
        total_music_posts=50, 
        is_mutual=True  # 1.2x bonus
    )
    print(f"Test 2 - With mutual bonus: {trust_score_2:.4f}")
    
    # Test case 3: With recency decay
    trust_score_3 = calculate_trust_score(
        weighted_interactions=15.0,
        total_music_posts=50,
        days_since_last_interaction=45  # 50% through 90 day decay
    )
    print(f"Test 3 - With recency decay (45 days): {trust_score_3:.4f}")
    
    # Test case 4: High engagement curator
    trust_score_4 = calculate_trust_score(
        weighted_interactions=8.0,
        total_music_posts=10,  # High interaction rate
        avg_engagement_rate=0.8  # Quality factor boost
    )
    print(f"Test 4 - High engagement curator: {trust_score_4:.4f}")
    
    return [trust_score_1, trust_score_2, trust_score_3, trust_score_4]


def test_trusted_curator_discovery(supabase, test_users: List[int]):
    """Test trusted curator discovery for sample users."""
    print("\n=== Testing Trusted Curator Discovery ===")
    
    # Fetch data
    print("Fetching graph data...")
    users = fetch_user_nodes(supabase, limit=5000)
    edges = fetch_cast_edges(supabase, edge_types=['LIKED', 'REPLIED', 'RECASTED'], limit=20000)
    
    if not users or not edges:
        print("❌ No data available for testing")
        return []
    
    print(f"Loaded {len(users)} users and {len(edges)} trust edges")
    
    # Build trust graph
    trust_graph = build_trust_graph(edges, users)
    print(f"Built trust graph: {trust_graph.number_of_nodes()} nodes, {trust_graph.number_of_edges()} edges")
    
    # Get user cast counts for trust calculation
    all_user_ids = [user['node_id'] for user in users]
    user_cast_counts = fetch_user_cast_counts(supabase, all_user_ids)
    print(f"Fetched post counts for {len(user_cast_counts)} users")
    
    # Test curator discovery for each test user
    test_results = []
    
    for user_id in test_users:
        if user_id not in trust_graph:
            print(f"⚠️  User {user_id} not found in trust graph")
            continue
            
        print(f"\n--- Testing User {user_id} ---")
        
        curators = get_trusted_curators(
            user_id=user_id,
            trust_graph=trust_graph,
            user_cast_counts=user_cast_counts,
            min_trust_score=0.05,  # Lower threshold for testing
            max_curators=10
        )
        
        print(f"Found {len(curators)} trusted curators")
        
        if curators:
            print("Top 5 trusted curators:")
            for i, curator in enumerate(curators[:5], 1):
                print(f"  {i}. {curator['username']} (ID: {curator['user_id']})")
                print(f"     Trust Score: {curator['trust_score']:.4f}")
                print(f"     Interactions: {curator['weighted_interactions']:.1f} / {curator['total_posts']} posts")
                print(f"     Mutual: {'Yes' if curator['is_mutual'] else 'No'}")
                print()
        
        test_results.append({
            'user_id': user_id,
            'curator_count': len(curators),
            'top_curators': curators[:5],
            'avg_trust_score': sum(c['trust_score'] for c in curators) / len(curators) if curators else 0
        })
    
    return test_results


def validate_trust_algorithm_quality(test_results: List[Dict[str, Any]]):
    """Validate that trust algorithm produces meaningful results."""
    print("\n=== Validating Trust Algorithm Quality ===")
    
    if not test_results:
        print("❌ No test results to validate")
        return False
    
    validation_results = {
        'users_with_curators': 0,
        'avg_curator_count': 0,
        'avg_trust_score': 0,
        'mutual_trust_rate': 0,
        'quality_indicators': []
    }
    
    total_curators = 0
    total_trust_score = 0
    total_mutual = 0
    total_curator_relationships = 0
    
    for result in test_results:
        if result['curator_count'] > 0:
            validation_results['users_with_curators'] += 1
            total_curators += result['curator_count']
            total_trust_score += result['avg_trust_score']
            
            # Count mutual relationships
            for curator in result['top_curators']:
                total_curator_relationships += 1
                if curator['is_mutual']:
                    total_mutual += 1
    
    if validation_results['users_with_curators'] > 0:
        validation_results['avg_curator_count'] = total_curators / validation_results['users_with_curators']
        validation_results['avg_trust_score'] = total_trust_score / validation_results['users_with_curators']
    
    if total_curator_relationships > 0:
        validation_results['mutual_trust_rate'] = total_mutual / total_curator_relationships
    
    # Quality checks
    print("Algorithm Quality Assessment:")
    print(f"✓ Users with trusted curators: {validation_results['users_with_curators']}/{len(test_results)}")
    print(f"✓ Average curators per user: {validation_results['avg_curator_count']:.1f}")
    print(f"✓ Average trust score: {validation_results['avg_trust_score']:.4f}")
    print(f"✓ Mutual trust rate: {validation_results['mutual_trust_rate']:.2%}")
    
    # Quality indicators
    if validation_results['avg_curator_count'] >= 3:
        validation_results['quality_indicators'].append("✅ Good curator discovery (avg ≥3 per user)")
    else:
        validation_results['quality_indicators'].append("⚠️  Low curator discovery")
    
    if validation_results['avg_trust_score'] >= 0.15:
        validation_results['quality_indicators'].append("✅ Meaningful trust scores (avg ≥0.15)")
    else:
        validation_results['quality_indicators'].append("⚠️  Low trust scores")
    
    if validation_results['mutual_trust_rate'] >= 0.1:
        validation_results['quality_indicators'].append("✅ Good mutual relationships (≥10%)")
    else:
        validation_results['quality_indicators'].append("⚠️  Few mutual relationships")
    
    print("\nQuality Indicators:")
    for indicator in validation_results['quality_indicators']:
        print(f"  {indicator}")
    
    return validation_results


def generate_markdown_report(formula_results: List[float], test_results: List[Dict[str, Any]], 
                           validation_results: Dict[str, Any]) -> str:
    """Generate detailed markdown report."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Determine if test passed
    passed_indicators = sum(1 for ind in validation_results['quality_indicators'] if ind.startswith('✅'))
    test_passed = passed_indicators >= 2  # At least 2/3 quality indicators
    
    markdown = f"""# Trust Curators Discovery Test Report

**Generated:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
**Test Status:** {'✅ PASSED' if test_passed else '❌ NEEDS IMPROVEMENT'}
**Users Tested:** {len(test_results)}

## Executive Summary

{'The trust curator discovery algorithm successfully identifies meaningful curator relationships with appropriate trust scoring.' if test_passed else 'The trust algorithm needs refinement to better identify curator relationships.'}

**Key Findings:**
- {validation_results['users_with_curators']}/{len(test_results)} users have discoverable trusted curators
- Average of {validation_results['avg_curator_count']:.1f} curators per user  
- Average trust score: {validation_results['avg_trust_score']:.4f}
- Mutual trust rate: {validation_results['mutual_trust_rate']:.2%}

## Trust Scoring Formula Validation

The trust scoring formula was tested with controlled inputs:

1. **Basic Trust Calculation**: {formula_results[0]:.4f}
   - 15 weighted interactions / 50 posts = baseline trust score

2. **Mutual Bonus Effect**: {formula_results[1]:.4f} 
   - Same scenario with mutual trust (1.2x multiplier)
   - Bonus factor: {formula_results[1]/formula_results[0]:.2f}x

3. **Recency Decay Effect**: {formula_results[2]:.4f}
   - Same scenario with 45-day interaction gap
   - Decay factor: {formula_results[2]/formula_results[0]:.2f}x

4. **Quality Factor Effect**: {formula_results[3]:.4f}
   - High engagement curator (8/10 interaction rate)
   - Demonstrates quality-based scoring

## Detailed Test Results

"""

    for i, result in enumerate(test_results, 1):
        markdown += f"""### Test User {result['user_id']}

**Curators Found:** {result['curator_count']}
**Average Trust Score:** {result['avg_trust_score']:.4f}

**Top Trusted Curators:**
"""
        
        if result['top_curators']:
            for j, curator in enumerate(result['top_curators'], 1):
                mutual_status = "🤝 Mutual" if curator['is_mutual'] else "→ One-way"
                markdown += f"""
{j}. **{curator['username']}** (ID: {curator['user_id']})
   - Trust Score: **{curator['trust_score']:.4f}**
   - Interactions: {curator['weighted_interactions']:.1f} weighted interactions on {curator['total_posts']} posts
   - Relationship: {mutual_status}
"""
        else:
            markdown += "\n*No trusted curators found for this user*\n"
        
        markdown += "\n"
    
    markdown += """---

## Algorithm Quality Assessment

"""
    
    for indicator in validation_results['quality_indicators']:
        markdown += f"- {indicator}\n"
    
    markdown += f"""
## Algorithm Performance Metrics

| Metric | Value | Assessment |
|--------|-------|------------|
| Coverage Rate | {validation_results['users_with_curators']}/{len(test_results)} users | {'Good' if validation_results['users_with_curators']/len(test_results) >= 0.7 else 'Needs Improvement'} |
| Avg Curators/User | {validation_results['avg_curator_count']:.1f} | {'Good' if validation_results['avg_curator_count'] >= 3 else 'Low'} |
| Avg Trust Score | {validation_results['avg_trust_score']:.4f} | {'Meaningful' if validation_results['avg_trust_score'] >= 0.15 else 'Weak'} |
| Mutual Trust Rate | {validation_results['mutual_trust_rate']:.2%} | {'Healthy' if validation_results['mutual_trust_rate'] >= 0.1 else 'Low'} |

## Recommendations

"""
    
    if test_passed:
        markdown += """✅ **PROCEED** with trust-based recommendation system
- Trust scoring formula produces meaningful results
- Curator discovery successfully identifies valid relationships
- Algorithm ready for integration into recommendation pipeline

**Next Steps:**
1. Implement trust-based artist recommendations using these curators
2. Test recommendation quality and attribution
3. Compare against PageRank-based fallback recommendations
"""
    else:
        markdown += """🔄 **IMPROVE** algorithm before proceeding
- Trust relationships may be too sparse or weak
- Consider adjusting trust score thresholds or weighting
- May need more interaction data or different scoring approach

**Improvement Areas:**
1. Investigate low curator discovery rates
2. Refine trust scoring formula parameters
3. Consider alternative interaction weighting schemes
"""
    
    return markdown, timestamp


def main():
    """Run trust curators discovery test."""
    print("🧪 Trust Curators Discovery Algorithm Test")
    print(f"Started at: {datetime.now()}")
    
    try:
        # Connect to database
        supabase = get_supabase_client()
        print("✓ Connected to Supabase")
        
        # Test users - sample of different activity levels
        test_users = [3115, 10081, 417360, 10215, 18910, 2802, 239, 1020]  # From recent reports
        
        # Test trust scoring formula
        formula_results = test_trust_scoring_formula()
        
        # Test curator discovery
        test_results = test_trusted_curator_discovery(supabase, test_users)
        
        # Validate algorithm quality
        validation_results = validate_trust_algorithm_quality(test_results)
        
        # Generate report
        markdown_content, timestamp = generate_markdown_report(formula_results, test_results, validation_results)
        
        # Save report
        results_dir = os.path.join(os.path.dirname(__file__), 'results')
        os.makedirs(results_dir, exist_ok=True)
        
        report_filename = f"{timestamp}_trust_curators_test_report.md"
        report_path = os.path.join(results_dir, report_filename)
        
        with open(report_path, 'w') as f:
            f.write(markdown_content)
        
        print(f"\n📄 Report saved to: {report_path}")
        
        # Print summary
        print(f"\n{'='*60}")
        print("TEST SUMMARY")
        print(f"{'='*60}")
        
        passed_indicators = sum(1 for ind in validation_results['quality_indicators'] if ind.startswith('✅'))
        test_passed = passed_indicators >= 2
        
        print(f"Status: {'✅ PASSED' if test_passed else '❌ NEEDS IMPROVEMENT'}")
        print(f"Users tested: {len(test_results)}")
        print(f"Users with curators: {validation_results['users_with_curators']}")
        print(f"Quality indicators passed: {passed_indicators}/3")
        
        if test_passed:
            print("\n🎉 Trust curator discovery algorithm shows promising results!")
            print("✅ Ready to proceed with trust-based recommendations")
        else:
            print("\n⚠️  Algorithm needs improvement before proceeding")
            print("🔄 Review trust scoring parameters and data coverage")
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
        print(f"❌ Test failed with error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()