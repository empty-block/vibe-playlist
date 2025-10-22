#!/usr/bin/env python3
"""
Test Mutual Trust Relationships Algorithm

Validates mutual trust relationships and scoring patterns in the trust network.
Tests bidirectional trust identification and strength analysis.
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
    fetch_user_cast_counts,
    build_trust_graph,
    get_trusted_curators,
    calculate_trust_score
)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def find_mutual_trust_relationships(trust_graph, user_cast_counts: Dict[int, int]) -> List[Dict[str, Any]]:
    """Find all mutual trust relationships in the network."""
    print("\n=== Finding Mutual Trust Relationships ===")
    
    mutual_relationships = []
    processed_pairs = set()
    
    for user_a in trust_graph.nodes():
        # Get users that user_a trusts
        for user_b in trust_graph.successors(user_a):
            # Check if user_b also trusts user_a (mutual relationship)
            if trust_graph.has_edge(user_b, user_a):
                
                # Avoid duplicates by checking if pair already processed
                pair_key = tuple(sorted([user_a, user_b]))
                if pair_key in processed_pairs:
                    continue
                processed_pairs.add(pair_key)
                
                # Get edge weights (raw interaction counts)
                weight_a_to_b = trust_graph[user_a][user_b]['weight']
                weight_b_to_a = trust_graph[user_b][user_a]['weight']
                
                # Calculate trust scores
                posts_a = user_cast_counts.get(user_a, 1)
                posts_b = user_cast_counts.get(user_b, 1)
                
                trust_a_to_b = calculate_trust_score(weight_a_to_b, posts_b, is_mutual=True)
                trust_b_to_a = calculate_trust_score(weight_b_to_a, posts_a, is_mutual=True)
                
                # Get user metadata
                user_a_data = trust_graph.nodes[user_a]
                user_b_data = trust_graph.nodes[user_b]
                
                relationship = {
                    'user_a': {
                        'id': user_a,
                        'username': user_a_data.get('display_name', f'User_{user_a}'),
                        'posts': posts_a
                    },
                    'user_b': {
                        'id': user_b, 
                        'username': user_b_data.get('display_name', f'User_{user_b}'),
                        'posts': posts_b
                    },
                    'trust_a_to_b': trust_a_to_b,
                    'trust_b_to_a': trust_b_to_a,
                    'interactions_a_to_b': weight_a_to_b,
                    'interactions_b_to_a': weight_b_to_a,
                    'mutual_strength': min(trust_a_to_b, trust_b_to_a),  # Conservative measure
                    'trust_symmetry': abs(trust_a_to_b - trust_b_to_a),  # How balanced is the trust
                    'combined_trust': (trust_a_to_b + trust_b_to_a) / 2
                }
                
                mutual_relationships.append(relationship)
    
    # Sort by mutual strength
    mutual_relationships.sort(key=lambda x: x['mutual_strength'], reverse=True)
    
    print(f"Found {len(mutual_relationships)} mutual trust relationships")
    return mutual_relationships


def analyze_trust_symmetry(mutual_relationships: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze symmetry patterns in mutual trust relationships."""
    print("\n=== Analyzing Trust Symmetry ===")
    
    if not mutual_relationships:
        print("❌ No mutual relationships to analyze")
        return {}
    
    symmetry_analysis = {
        'total_mutual_relationships': len(mutual_relationships),
        'avg_mutual_strength': 0,
        'avg_trust_symmetry': 0,
        'symmetric_relationships': 0,  # Trust difference < 0.1
        'asymmetric_relationships': 0,  # Trust difference >= 0.1
        'strong_mutual_relationships': 0,  # Both trust scores > 0.2
        'symmetry_distribution': [],
        'strength_distribution': []
    }
    
    total_strength = 0
    total_symmetry = 0
    
    for rel in mutual_relationships:
        trust_diff = rel['trust_symmetry']
        mutual_strength = rel['mutual_strength']
        
        total_strength += mutual_strength
        total_symmetry += trust_diff
        
        symmetry_analysis['symmetry_distribution'].append(trust_diff)
        symmetry_analysis['strength_distribution'].append(mutual_strength)
        
        # Categorize relationships
        if trust_diff < 0.1:
            symmetry_analysis['symmetric_relationships'] += 1
        else:
            symmetry_analysis['asymmetric_relationships'] += 1
        
        if rel['trust_a_to_b'] > 0.2 and rel['trust_b_to_a'] > 0.2:
            symmetry_analysis['strong_mutual_relationships'] += 1
    
    symmetry_analysis['avg_mutual_strength'] = total_strength / len(mutual_relationships)
    symmetry_analysis['avg_trust_symmetry'] = total_symmetry / len(mutual_relationships)
    
    symmetric_rate = symmetry_analysis['symmetric_relationships'] / len(mutual_relationships)
    strong_rate = symmetry_analysis['strong_mutual_relationships'] / len(mutual_relationships)
    
    print(f"Average mutual strength: {symmetry_analysis['avg_mutual_strength']:.4f}")
    print(f"Average trust asymmetry: {symmetry_analysis['avg_trust_symmetry']:.4f}")
    print(f"Symmetric relationships: {symmetry_analysis['symmetric_relationships']}/{len(mutual_relationships)} ({symmetric_rate:.2%})")
    print(f"Strong mutual relationships: {symmetry_analysis['strong_mutual_relationships']}/{len(mutual_relationships)} ({strong_rate:.2%})")
    
    return symmetry_analysis


def test_mutual_trust_for_users(trust_graph, user_cast_counts: Dict[int, int], 
                               test_users: List[int]) -> List[Dict[str, Any]]:
    """Test mutual trust discovery for specific users."""
    print("\n=== Testing Mutual Trust for Sample Users ===")
    
    user_mutual_results = []
    
    for user_id in test_users:
        if user_id not in trust_graph:
            print(f"⚠️  User {user_id} not found in trust graph")
            continue
            
        print(f"\n--- Testing User {user_id} ---")
        
        # Get all trusted curators for this user
        curators = get_trusted_curators(
            user_id=user_id,
            trust_graph=trust_graph,
            user_cast_counts=user_cast_counts,
            min_trust_score=0.05,
            max_curators=50
        )
        
        # Filter to only mutual relationships
        mutual_curators = [c for c in curators if c['is_mutual']]
        one_way_curators = [c for c in curators if not c['is_mutual']]
        
        print(f"Total curators: {len(curators)}")
        print(f"Mutual curators: {len(mutual_curators)}")
        print(f"One-way curators: {len(one_way_curators)}")
        
        # Analyze mutual relationships in detail
        detailed_mutual = []
        for curator in mutual_curators[:5]:  # Top 5 mutual relationships
            curator_id = curator['user_id']
            
            # Get reverse trust score
            reverse_weight = trust_graph[curator_id][user_id]['weight']
            user_posts = user_cast_counts.get(user_id, 1)
            reverse_trust = calculate_trust_score(reverse_weight, user_posts, is_mutual=True)
            
            detailed = {
                'curator': curator,
                'reverse_trust_score': reverse_trust,
                'reverse_interactions': reverse_weight,
                'trust_symmetry': abs(curator['trust_score'] - reverse_trust),
                'mutual_strength': min(curator['trust_score'], reverse_trust)
            }
            detailed_mutual.append(detailed)
        
        if detailed_mutual:
            print("Top 3 mutual relationships:")
            for i, detail in enumerate(detailed_mutual[:3], 1):
                curator = detail['curator']
                print(f"  {i}. {curator['username']}")
                print(f"     Your trust in them: {curator['trust_score']:.4f}")
                print(f"     Their trust in you: {detail['reverse_trust_score']:.4f}")
                print(f"     Symmetry (diff): {detail['trust_symmetry']:.4f}")
                print(f"     Mutual strength: {detail['mutual_strength']:.4f}")
        
        user_mutual_results.append({
            'user_id': user_id,
            'total_curators': len(curators),
            'mutual_curators': len(mutual_curators),
            'one_way_curators': len(one_way_curators),
            'mutual_rate': len(mutual_curators) / len(curators) if curators else 0,
            'detailed_mutual': detailed_mutual,
            'top_mutual_strength': detailed_mutual[0]['mutual_strength'] if detailed_mutual else 0
        })
    
    return user_mutual_results


def validate_mutual_trust_quality(mutual_relationships: List[Dict[str, Any]], 
                                user_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Validate the quality of mutual trust detection."""
    print("\n=== Validating Mutual Trust Quality ===")
    
    validation = {
        'network_mutual_rate': 0,
        'avg_mutual_strength': 0,
        'user_mutual_rates': [],
        'quality_indicators': []
    }
    
    # Network-level analysis
    if mutual_relationships:
        validation['avg_mutual_strength'] = sum(r['mutual_strength'] for r in mutual_relationships) / len(mutual_relationships)
    
    # User-level analysis
    mutual_rates = [r['mutual_rate'] for r in user_results if r['total_curators'] > 0]
    if mutual_rates:
        validation['network_mutual_rate'] = sum(mutual_rates) / len(mutual_rates)
        validation['user_mutual_rates'] = mutual_rates
    
    print(f"Network mutual trust rate: {validation['network_mutual_rate']:.2%}")
    print(f"Average mutual strength: {validation['avg_mutual_strength']:.4f}")
    
    # Quality indicators
    if validation['network_mutual_rate'] >= 0.2:
        validation['quality_indicators'].append("✅ Healthy mutual trust rate (≥20%)")
    else:
        validation['quality_indicators'].append("⚠️  Low mutual trust rate (<20%)")
    
    if validation['avg_mutual_strength'] >= 0.15:
        validation['quality_indicators'].append("✅ Strong mutual relationships (≥0.15)")
    else:
        validation['quality_indicators'].append("⚠️  Weak mutual relationships")
    
    if len(mutual_relationships) >= 10:
        validation['quality_indicators'].append("✅ Sufficient mutual relationships found (≥10)")
    else:
        validation['quality_indicators'].append("⚠️  Few mutual relationships detected")
    
    users_with_mutual = sum(1 for r in user_results if r['mutual_curators'] > 0)
    if users_with_mutual / len(user_results) >= 0.7:
        validation['quality_indicators'].append("✅ Good mutual trust coverage (≥70% users)")
    else:
        validation['quality_indicators'].append("⚠️  Low mutual trust coverage")
    
    print("\nQuality Assessment:")
    for indicator in validation['quality_indicators']:
        print(f"  {indicator}")
    
    return validation


def generate_markdown_report(mutual_relationships: List[Dict[str, Any]],
                           symmetry_analysis: Dict[str, Any],
                           user_results: List[Dict[str, Any]], 
                           validation: Dict[str, Any]) -> tuple:
    """Generate detailed markdown report."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    quality_passed = sum(1 for ind in validation['quality_indicators'] if ind.startswith('✅'))
    test_passed = quality_passed >= 3
    
    markdown = f"""# Mutual Trust Relationships Test Report

**Generated:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
**Test Status:** {'✅ PASSED' if test_passed else '❌ NEEDS IMPROVEMENT'}
**Mutual Relationships Found:** {len(mutual_relationships)}

## Executive Summary

{'Mutual trust detection successfully identifies meaningful bidirectional curator relationships with balanced trust scoring.' if test_passed else 'Mutual trust relationships may be too sparse or weak for effective collaborative filtering.'}

**Key Metrics:**
- Total Mutual Relationships: {len(mutual_relationships)}
- Network Mutual Rate: {validation['network_mutual_rate']:.2%}
- Average Mutual Strength: {validation['avg_mutual_strength']:.4f}
- Average Trust Symmetry: {symmetry_analysis.get('avg_trust_symmetry', 0):.4f}

## Network-Level Mutual Trust Analysis

### Trust Symmetry Distribution
- **Symmetric relationships** (diff < 0.1): {symmetry_analysis.get('symmetric_relationships', 0)}/{len(mutual_relationships)}
- **Asymmetric relationships** (diff ≥ 0.1): {symmetry_analysis.get('asymmetric_relationships', 0)}/{len(mutual_relationships)}
- **Strong mutual relationships** (both > 0.2): {symmetry_analysis.get('strong_mutual_relationships', 0)}/{len(mutual_relationships)}

### Top 10 Mutual Trust Relationships

"""
    
    for i, rel in enumerate(mutual_relationships[:10], 1):
        symmetry_status = "🔄 Symmetric" if rel['trust_symmetry'] < 0.1 else "⚖️ Asymmetric"
        strength_status = "💪 Strong" if rel['mutual_strength'] > 0.2 else "🤝 Moderate"
        
        markdown += f"""**{i}. {rel['user_a']['username']} ↔ {rel['user_b']['username']}**
- Mutual Strength: **{rel['mutual_strength']:.4f}** {strength_status}
- Trust A→B: {rel['trust_a_to_b']:.4f} ({rel['interactions_a_to_b']:.0f} interactions)
- Trust B→A: {rel['trust_b_to_a']:.4f} ({rel['interactions_b_to_a']:.0f} interactions)  
- Symmetry: {rel['trust_symmetry']:.4f} {symmetry_status}

"""
    
    markdown += """## User-Level Mutual Trust Analysis

"""
    
    for result in user_results:
        user_id = result['user_id']
        mutual_rate = result['mutual_rate']
        
        markdown += f"""### User {user_id}

**Trust Relationships:**
- Total Curators: {result['total_curators']}
- Mutual Curators: {result['mutual_curators']} ({mutual_rate:.2%})
- One-way Curators: {result['one_way_curators']}

"""
        
        if result['detailed_mutual']:
            markdown += "**Top Mutual Relationships:**\n"
            for detail in result['detailed_mutual'][:3]:
                curator = detail['curator']
                markdown += f"""
- **{curator['username']}**
  - Your trust: {curator['trust_score']:.4f} | Their trust: {detail['reverse_trust_score']:.4f}
  - Mutual strength: {detail['mutual_strength']:.4f}
  - Trust symmetry: {detail['trust_symmetry']:.4f}
"""
        else:
            markdown += "*No mutual relationships found*\n"
        
        markdown += "\n"
    
    markdown += """---

## Algorithm Quality Assessment

"""
    
    for indicator in validation['quality_indicators']:
        markdown += f"- {indicator}\n"
    
    markdown += f"""
## Performance Metrics

| Metric | Value | Assessment |
|--------|-------|------------|
| Network Mutual Rate | {validation['network_mutual_rate']:.2%} | {'Healthy' if validation['network_mutual_rate'] >= 0.2 else 'Low'} |
| Avg Mutual Strength | {validation['avg_mutual_strength']:.4f} | {'Strong' if validation['avg_mutual_strength'] >= 0.15 else 'Weak'} |
| Total Mutual Relationships | {len(mutual_relationships)} | {'Sufficient' if len(mutual_relationships) >= 10 else 'Limited'} |
| Symmetric Relationships | {symmetry_analysis.get('symmetric_relationships', 0)}/{len(mutual_relationships)} | {'Good Balance' if len(mutual_relationships) > 0 and symmetry_analysis.get('symmetric_relationships', 0)/len(mutual_relationships) >= 0.3 else 'Mostly Asymmetric'} |

## Recommendations

"""
    
    if test_passed:
        markdown += """✅ **PROCEED** with mutual trust features in recommendation system
- Mutual trust relationships show meaningful patterns and strengths
- Trust symmetry analysis reveals balanced curator relationships  
- Ready for enhanced recommendation attribution and social features

**Implementation Ideas:**
1. Boost recommendations from mutual trust relationships (1.2x weight)
2. Create "trusted by your curators" badges for artists
3. Implement mutual curator discovery features
4. Use mutual trust for community detection refinement
"""
    else:
        markdown += """🔄 **IMPROVE** mutual trust detection before advanced features
- Mutual relationships may be too sparse for reliable social features
- Consider lowering trust thresholds or improving interaction data coverage
- Focus on building stronger trust networks before mutual features

**Improvement Areas:**
1. Increase overall trust relationship coverage  
2. Improve trust scoring sensitivity for mutual detection
3. Gather more interaction data to strengthen trust signals
4. Consider alternative mutual trust identification methods
"""
    
    return markdown, timestamp


def main():
    """Run mutual trust relationships test."""
    print("🧪 Mutual Trust Relationships Algorithm Test")
    print(f"Started at: {datetime.now()}")
    
    try:
        # Connect to database
        supabase = get_supabase_client()
        print("✓ Connected to Supabase")
        
        # Fetch data
        print("Fetching graph data...")
        users = fetch_user_nodes(supabase, limit=5000)
        edges = fetch_cast_edges(supabase, edge_types=['LIKED', 'REPLIED', 'RECASTED'], limit=20000)
        
        if not users or not edges:
            print("❌ No data available for testing")
            sys.exit(1)
        
        # Build trust graph
        trust_graph = build_trust_graph(edges, users)
        print(f"Built trust graph: {trust_graph.number_of_nodes()} nodes, {trust_graph.number_of_edges()} edges")
        
        # Get user cast counts
        all_user_ids = [user['node_id'] for user in users]
        user_cast_counts = fetch_user_cast_counts(supabase, all_user_ids)
        
        # Find all mutual relationships
        mutual_relationships = find_mutual_trust_relationships(trust_graph, user_cast_counts)
        
        # Analyze trust symmetry  
        symmetry_analysis = analyze_trust_symmetry(mutual_relationships)
        
        # Test specific users
        test_users = [3115, 10081, 417360, 10215, 18910, 2802, 1020, 239]
        user_results = test_mutual_trust_for_users(trust_graph, user_cast_counts, test_users)
        
        # Validate quality
        validation = validate_mutual_trust_quality(mutual_relationships, user_results)
        
        # Generate report
        markdown_content, timestamp = generate_markdown_report(
            mutual_relationships, symmetry_analysis, user_results, validation
        )
        
        # Save report
        results_dir = os.path.join(os.path.dirname(__file__), 'results')
        os.makedirs(results_dir, exist_ok=True)
        
        report_filename = f"{timestamp}_mutual_trust_test_report.md"
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
        print(f"Mutual relationships found: {len(mutual_relationships)}")
        print(f"Network mutual rate: {validation['network_mutual_rate']:.2%}")
        print(f"Quality indicators passed: {quality_passed}/4")
        
        if test_passed:
            print("\n🎉 Mutual trust detection shows strong relationship patterns!")
            print("✅ Ready for mutual trust features in recommendation system")
        else:
            print("\n⚠️  Mutual trust relationships need strengthening")
            print("🔄 Focus on improving trust network density")
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
        print(f"❌ Test failed with error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()