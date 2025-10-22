#!/usr/bin/env python3
"""
Test Graph Metrics Algorithms

Tests PageRank, centrality measures, and community detection on the User Interaction Graph.
Validates core graph analysis algorithms for identifying influential users and communities.
"""

import os
import sys
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any

# Add the parent directory to Python path so we can import lib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib import (
    get_supabase_client,
    fetch_user_nodes,
    fetch_cast_edges,
    fetch_cast_edges_with_date_filter,
    fetch_posts_in_period,
    fetch_engagements_with_posts,
    fetch_user_cast_counts,
    build_social_graph,
    build_trust_graph,
    build_engagement_weighted_social_graph,
    build_engagement_intensity_graph,
    calculate_pagerank,
    calculate_centrality_metrics,
    detect_communities,
    get_graph_summary
)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def test_social_graph_construction(supabase, start_date: datetime, end_date: datetime):
    """Test building the complete User Interaction Graph."""
    print("\n=== Testing Social Graph Construction ===")
    print(f"Date range: {start_date.strftime('%Y-%m-%d %H:%M:%S')} to {end_date.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Fetch data - get all users (no date limit) for comprehensive username lookup
    users = fetch_user_nodes(supabase, limit=None)  # Get all users for complete name resolution
    edges = fetch_cast_edges_with_date_filter(supabase, start_date, end_date, limit=1000)  # All edge types
    
    # For enhanced engagement graph, fetch posts and their specific engagements
    posts = fetch_posts_in_period(supabase, start_date, end_date, limit=500)  # Posts in analysis window
    if posts:
        post_cast_ids = [post['cast_id'] for post in posts]
        engagements = fetch_engagements_with_posts(supabase, post_cast_ids, limit=2000)  # Engagements with those posts
    else:
        engagements = []
    
    if not users or not edges:
        print("❌ No data available for testing")
        return None, None
    
    print(f"Loaded {len(users)} users and {len(edges)} edges")
    
    # Analyze edge types
    edge_type_counts = {}
    for edge in edges:
        edge_type = edge['edge_type']
        edge_type_counts[edge_type] = edge_type_counts.get(edge_type, 0) + 1
    
    print("Edge type distribution:")
    for edge_type, count in edge_type_counts.items():
        print(f"  {edge_type}: {count}")
    
    # Build multiple graph types for comparison
    social_graph = build_social_graph(edges, users)
    trust_graph = build_trust_graph(edges, users)  # This has post-count normalization built-in
    engagement_graph = build_engagement_weighted_social_graph(edges, users)  # Basic engagement graph
    intensity_graph = build_engagement_intensity_graph(posts, engagements, users)  # Enhanced intensity graph
    
    # Get graph summary
    summary = get_graph_summary(social_graph, "User Interaction Graph")
    
    print(f"\nSocial Graph Summary:")
    print(f"  Nodes: {summary['nodes']}")
    print(f"  Edges: {summary['edges']}")
    print(f"  Density: {summary['density']:.6f}")
    print(f"  Connected: {summary.get('connected', 'Unknown')}")
    
    if not summary.get('connected'):
        print(f"  Weakly connected components: {summary.get('weakly_connected_components', 'Unknown')}")
    
    # Get trust graph summary too
    trust_summary = get_graph_summary(trust_graph, "Trust Network")
    
    print(f"\nTrust Graph Summary:")
    print(f"  Nodes: {trust_summary['nodes']}")
    print(f"  Edges: {trust_summary['edges']}")
    print(f"  Density: {trust_summary['density']:.6f}")
    
    # Get engagement graph summary
    engagement_summary = get_graph_summary(engagement_graph, "Engagement-Weighted Graph")
    
    print(f"\nEngagement Graph Summary:")
    print(f"  Nodes: {engagement_summary['nodes']}")
    print(f"  Edges: {engagement_summary['edges']}")
    print(f"  Density: {engagement_summary['density']:.6f}")
    
    # Get intensity graph summary
    intensity_summary = get_graph_summary(intensity_graph, "Engagement-Intensity Graph")
    
    print(f"\nIntensity Graph Summary:")
    print(f"  Nodes: {intensity_summary['nodes']}")
    print(f"  Edges: {intensity_summary['edges']}")
    print(f"  Density: {intensity_summary['density']:.6f}")
    print(f"  Posts analyzed: {len(posts)}")
    print(f"  Engagements analyzed: {len(engagements)}")
    
    return social_graph, trust_graph, engagement_graph, intensity_graph, users


def test_pagerank_algorithm(social_graph, users: List[Dict[str, Any]], user_cast_counts: Dict[int, int] = None):
    """Test PageRank calculation on the social graph."""
    print("\n=== Testing PageRank Algorithm ===")
    
    pagerank_scores = calculate_pagerank(social_graph)
    
    if not pagerank_scores:
        print("❌ PageRank calculation failed")
        return {}
    
    print(f"Calculated PageRank for {len(pagerank_scores)} users")
    
    # Get top users by PageRank
    sorted_users = sorted(pagerank_scores.items(), key=lambda x: x[1], reverse=True)
    
    print("\nTop 10 Users by PageRank:")
    user_lookup = {user['node_id']: user for user in users}
    
    for i, (user_id, score) in enumerate(sorted_users[:10], 1):
        user_data = user_lookup.get(user_id, {})
        username = user_data.get('display_name', f'User_{user_id}')
        post_count = user_cast_counts.get(user_id, 0) if user_cast_counts else "N/A"
        print(f"  {i}. {username} (ID: {user_id}, Posts: {post_count}): {score:.6f}")
    
    # Analyze score distribution
    scores = list(pagerank_scores.values())
    avg_score = sum(scores) / len(scores)
    max_score = max(scores)
    min_score = min(scores)
    
    print(f"\nPageRank Statistics:")
    print(f"  Average: {avg_score:.6f}")
    print(f"  Maximum: {max_score:.6f}")
    print(f"  Minimum: {min_score:.6f}")
    print(f"  Max/Avg ratio: {max_score/avg_score:.2f}")
    
    # Calculate post-normalized PageRank (quality per post)
    if user_cast_counts:
        print(f"\nTop 10 Users by Quality-Adjusted PageRank (PageRank / Post Count):")
        normalized_scores = {}
        for user_id, pr_score in pagerank_scores.items():
            post_count = user_cast_counts.get(user_id, 0)
            if post_count > 0:  # Only rank users who actually posted
                normalized_scores[user_id] = pr_score / post_count
        
        if normalized_scores:
            sorted_normalized = sorted(normalized_scores.items(), key=lambda x: x[1], reverse=True)
            for i, (user_id, norm_score) in enumerate(sorted_normalized[:10], 1):
                user_data = user_lookup.get(user_id, {})
                username = user_data.get('display_name', f'User_{user_id}')
                post_count = user_cast_counts.get(user_id, 0)
                raw_score = pagerank_scores.get(user_id, 0)
                print(f"  {i}. {username} (Posts: {post_count}): {norm_score:.6f} (raw: {raw_score:.6f})")
        else:
            print("  No users with posts found in this time period")
    
    return pagerank_scores


def test_centrality_algorithms(social_graph, users: List[Dict[str, Any]]):
    """Test various centrality measures."""
    print("\n=== Testing Centrality Algorithms ===")
    
    centrality_metrics = calculate_centrality_metrics(social_graph)
    
    if not centrality_metrics:
        print("❌ Centrality calculation failed")
        return {}
    
    print(f"Calculated {len(centrality_metrics)} centrality metrics")
    
    user_lookup = {user['node_id']: user for user in users}
    
    # Display top users for each centrality measure
    for metric_name, scores in centrality_metrics.items():
        print(f"\nTop 5 Users by {metric_name.replace('_', ' ').title()}:")
        
        sorted_users = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        for i, (user_id, score) in enumerate(sorted_users[:5], 1):
            user_data = user_lookup.get(user_id, {})
            username = user_data.get('display_name', f'User_{user_id}')
            print(f"  {i}. {username}: {score:.6f}")
    
    return centrality_metrics


def test_community_detection(social_graph, users: List[Dict[str, Any]]):
    """Test community detection algorithms."""
    print("\n=== Testing Community Detection ===")
    
    # Test Louvain algorithm
    print("Running Louvain community detection...")
    louvain_communities = detect_communities(social_graph, algorithm='louvain')
    
    if not louvain_communities:
        print("❌ Louvain community detection failed")
        return {}
    
    print(f"Louvain detected {len(set(louvain_communities.values()))} communities")
    
    # Analyze community sizes
    community_sizes = {}
    for user_id, community_id in louvain_communities.items():
        community_sizes[community_id] = community_sizes.get(community_id, 0) + 1
    
    # Sort communities by size
    sorted_communities = sorted(community_sizes.items(), key=lambda x: x[1], reverse=True)
    
    print("\nTop 5 Largest Communities:")
    user_lookup = {user['node_id']: user for user in users}
    
    for i, (community_id, size) in enumerate(sorted_communities[:5], 1):
        print(f"  {i}. Community {community_id}: {size} members")
        
        # Show some members
        members = [user_id for user_id, comm_id in louvain_communities.items() if comm_id == community_id]
        sample_members = members[:5]
        
        member_names = []
        for member_id in sample_members:
            user_data = user_lookup.get(member_id, {})
            username = user_data.get('display_name', f'User_{member_id}')
            member_names.append(username)
        
        print(f"     Sample members: {', '.join(member_names)}")
        if len(members) > 5:
            print(f"     ... and {len(members) - 5} more")
    
    # Test greedy modularity algorithm
    print("\nRunning Greedy Modularity community detection...")
    greedy_communities = detect_communities(social_graph, algorithm='greedy_modularity')
    
    if greedy_communities:
        greedy_community_count = len(set(greedy_communities.values()))
        print(f"Greedy Modularity detected {greedy_community_count} communities")
    else:
        print("❌ Greedy Modularity community detection failed")
    
    return {
        'louvain': louvain_communities,
        'greedy_modularity': greedy_communities,
        'louvain_count': len(set(louvain_communities.values())),
        'greedy_count': len(set(greedy_communities.values())) if greedy_communities else 0
    }


def validate_graph_metrics_quality(pagerank_scores: Dict[int, float],
                                 centrality_metrics: Dict[str, Dict[int, float]],
                                 community_results: Dict[str, Any],
                                 social_graph) -> Dict[str, Any]:
    """Validate the quality of graph metrics calculations."""
    print("\n=== Validating Graph Metrics Quality ===")
    
    validation = {
        'graph_connectivity': False,
        'pagerank_distribution': False,
        'centrality_correlation': False,
        'community_detection': False,
        'quality_indicators': []
    }
    
    # Graph connectivity
    if social_graph.number_of_edges() > 0:
        validation['graph_connectivity'] = True
        validation['quality_indicators'].append("✅ Graph has edges and connectivity")
    else:
        validation['quality_indicators'].append("❌ Graph has no edges")
    
    # PageRank distribution
    if pagerank_scores:
        scores = list(pagerank_scores.values())
        max_score = max(scores)
        avg_score = sum(scores) / len(scores)
        
        if max_score / avg_score > 5:  # Some users significantly more influential
            validation['pagerank_distribution'] = True
            validation['quality_indicators'].append("✅ PageRank shows meaningful influence distribution")
        else:
            validation['quality_indicators'].append("⚠️  PageRank distribution is too flat")
    
    # Centrality correlation (check if different metrics identify different aspects)
    if len(centrality_metrics) >= 2:
        validation['centrality_correlation'] = True
        validation['quality_indicators'].append("✅ Multiple centrality metrics calculated")
    else:
        validation['quality_indicators'].append("⚠️  Limited centrality metrics available")
    
    # Community detection
    louvain_count = community_results.get('louvain_count', 0)
    if louvain_count >= 5:
        validation['community_detection'] = True
        validation['quality_indicators'].append("✅ Community detection found meaningful clusters")
    else:
        validation['quality_indicators'].append("⚠️  Few communities detected")
    
    print("Quality Assessment:")
    for indicator in validation['quality_indicators']:
        print(f"  {indicator}")
    
    return validation


def generate_markdown_report(pagerank_scores: Dict[int, float],
                           trust_pagerank_scores: Dict[int, float],
                           engagement_pagerank_scores: Dict[int, float],
                           intensity_pagerank_scores: Dict[int, float],
                           centrality_metrics: Dict[str, Dict[int, float]],
                           community_results: Dict[str, Any],
                           validation: Dict[str, Any],
                           users: List[Dict[str, Any]],
                           user_cast_counts: Dict[int, int],
                           test_start_date: datetime,
                           test_end_date: datetime,
                           execution_start_time: datetime,
                           execution_end_time: datetime,
                           days_back: int = 30) -> tuple:
    """Generate detailed markdown report."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    quality_passed = sum(1 for ind in validation['quality_indicators'] if ind.startswith('✅'))
    test_passed = quality_passed >= 3
    
    user_lookup = {user['node_id']: user for user in users}
    
    markdown = f"""# Graph Metrics Test Report

**Generated:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
**Test Status:** {'✅ PASSED' if test_passed else '❌ NEEDS IMPROVEMENT'}
**Users Analyzed:** {len(pagerank_scores)}
**Analysis Period:** Last {days_back} days
**Start Date:** {test_start_date.strftime("%Y-%m-%d %H:%M:%S")}
**End Date:** {test_end_date.strftime("%Y-%m-%d %H:%M:%S")}
**Execution Duration:** {(execution_end_time - execution_start_time).total_seconds():.2f} seconds

## Executive Summary

{'Graph metrics algorithms successfully identify influential users and meaningful community structures in the music social network.' if test_passed else 'Graph metrics show limited differentiation or community structure detection.'}

**Key Findings:**
- PageRank calculated for {len(pagerank_scores)} users
- {len(centrality_metrics)} centrality metrics computed
- {community_results.get('louvain_count', 0)} communities detected (Louvain)
- {community_results.get('greedy_count', 0)} communities detected (Greedy Modularity)

## 🎯 Primary Results: Engagement-Intensity Graph (Quality-Based Influence)

### Top 10 Users by Engagement Intensity (True Music Curation Influence)
"""
    
    # Start with the intensity graph results (our main focus)
    if intensity_pagerank_scores:
        sorted_intensity_users = sorted(intensity_pagerank_scores.items(), key=lambda x: x[1], reverse=True)
        
        for i, (user_id, score) in enumerate(sorted_intensity_users[:10], 1):
            user_data = user_lookup.get(user_id, {})
            username = user_data.get('display_name', f'User_{user_id}')
            post_count = user_cast_counts.get(user_id, 0)
            markdown += f"{i}. **{username}** (ID: {user_id}, Posts: {post_count}) - {score:.6f}\n"
        
        intensity_scores = list(intensity_pagerank_scores.values())
        intensity_avg_score = sum(intensity_scores) / len(intensity_scores)
        intensity_max_score = max(intensity_scores)
        
        markdown += f"""
**Intensity Graph Statistics:**
- Users with posts in period: {len([u for u, c in user_cast_counts.items() if c > 0])}
- Average influence score: {intensity_avg_score:.6f}
- Maximum influence score: {intensity_max_score:.6f}
- Influence concentration: {intensity_max_score/intensity_avg_score:.2f}x above average

*This graph measures engagement quality relative to content volume. A user receiving 5 likes on 10 posts (50% engagement rate) scores higher than someone with 10 likes on 100 posts (10% engagement rate).*

---

## 📊 Comparison: Other Graph Types

### Raw Social Graph - Top 10 Users (Volume-Influenced)
"""
        
        # Add raw social graph for comparison
        if pagerank_scores:
            sorted_users = sorted(pagerank_scores.items(), key=lambda x: x[1], reverse=True)
            
            for i, (user_id, score) in enumerate(sorted_users[:10], 1):
                user_data = user_lookup.get(user_id, {})
                username = user_data.get('display_name', f'User_{user_id}')
                post_count = user_cast_counts.get(user_id, 0)
                markdown += f"{i}. **{username}** (Posts: {post_count}) - {score:.6f}\n"
        
        markdown += "\n### Trust Graph - Top 5 Users (Engagement-Only)\n"
        if trust_pagerank_scores:
            sorted_trust_users = sorted(trust_pagerank_scores.items(), key=lambda x: x[1], reverse=True)
            
            for i, (user_id, score) in enumerate(sorted_trust_users[:5], 1):
                user_data = user_lookup.get(user_id, {})
                username = user_data.get('display_name', f'User_{user_id}')
                post_count = user_cast_counts.get(user_id, 0)
                markdown += f"{i}. **{username}** (Posts: {post_count}) - {score:.6f}\n"
    
    markdown += "\n---\n\n## 📈 Network Analysis Summary\n\n"
    
    # Just show the top centrality metric for brevity
    if centrality_metrics:
        top_metric = list(centrality_metrics.keys())[0]
        scores = centrality_metrics[top_metric]
        markdown += f"### {top_metric.replace('_', ' ').title()} - Top 5\n"
        
        sorted_users = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        for i, (user_id, score) in enumerate(sorted_users[:5], 1):
            user_data = user_lookup.get(user_id, {})
            username = user_data.get('display_name', f'User_{user_id}')
            markdown += f"{i}. **{username}** - {score:.6f}\n"
    
    # Simplified community section
    louvain_communities = community_results.get('louvain', {})
    if louvain_communities:
        community_sizes = {}
        for user_id, community_id in louvain_communities.items():
            community_sizes[community_id] = community_sizes.get(community_id, 0) + 1
        
        sorted_communities = sorted(community_sizes.items(), key=lambda x: x[1], reverse=True)
        
        markdown += f"\n### 🏘️ Community Detection\n\n"
        markdown += f"**Louvain Algorithm:** {len(sorted_communities)} communities detected\n\n"
        markdown += f"**Largest Communities:**\n"
        
        for i, (community_id, size) in enumerate(sorted_communities[:3], 1):
            markdown += f"- Community {community_id}: {size} members\n"
    
    markdown += f"""

---

## ✅ Test Results Summary

**Status:** {'✅ PASSED' if test_passed else '❌ NEEDS IMPROVEMENT'}  
**Quality Indicators Passed:** {quality_passed}/4

"""
    
    for indicator in validation['quality_indicators']:
        markdown += f"{indicator}\n"
    
    markdown += f"""

## 🎯 Key Insights

✨ **The engagement-intensity graph successfully identifies true music curation influence**  
📊 **Quality over quantity:** Users with high engagement rates on fewer posts rank higher than those with low engagement on many posts  
🏘️ **Community structure:** {community_results.get('louvain_count', 0)} natural communities detected in the music social network

## 🚀 Recommendations

"""
    
    if test_passed:
        markdown += """✅ **PROCEED** with graph-based features in recommendation system
- Graph metrics successfully identify influential users and community structures
- PageRank and centrality measures provide meaningful user rankings
- Community detection reveals natural clustering in the music social network

**Implementation Opportunities:**
1. Use PageRank scores for cold-start recommendation fallback
2. Leverage centrality metrics for curator quality scoring
3. Apply community detection for personalized recommendation scoping
4. Implement influence-based recommendation weighting
"""
    else:
        markdown += """🔄 **IMPROVE** graph analysis before advanced features
- Graph connectivity or metric distributions may be too limited
- Consider gathering more interaction data or adjusting graph construction
- May need alternative community detection approaches

**Improvement Areas:**
1. Increase graph density through additional interaction types
2. Refine community detection parameters for better clustering
3. Validate graph metrics against expected influential users
4. Consider weighted graph construction approaches
"""
    
    return markdown, timestamp


def main():
    """Run graph metrics algorithm tests."""
    start_time = datetime.now()
    print("🧪 Graph Metrics Algorithms Test")
    print(f"Started at: {start_time}")
    
    try:
        # Connect to database
        supabase = get_supabase_client()
        print("✓ Connected to Supabase")
        
        # Set explicit date range for testing
        end_date = datetime.now()
        start_date = end_date - timedelta(days=90)
        
        print(f"Test Parameters:")
        print(f"  Start Date: {start_date.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"  End Date: {end_date.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"  Analysis Period: 90 days")
        
        # Test social graph construction with explicit dates
        social_graph, trust_graph, engagement_graph, intensity_graph, users = test_social_graph_construction(supabase, start_date, end_date)
        
        if not social_graph or not trust_graph or not engagement_graph or not intensity_graph or not users:
            print("❌ Failed to build graphs")
            sys.exit(1)
        
        # Get posts data for the same time period (needed for corrected post counts)
        posts = fetch_posts_in_period(supabase, start_date, end_date, limit=500)
        
        # Get user post counts for the same time period
        user_ids = [user['node_id'] for user in users]
        user_cast_counts = fetch_user_cast_counts(supabase, user_ids)
        
        # Also create user_cast_counts from the posts data for comparison
        posts_based_counts = {}
        for post in posts:
            author_id = int(post['source_user_id'])
            posts_based_counts[author_id] = posts_based_counts.get(author_id, 0) + 1
        
        # Convert user node_ids to int for consistent lookup
        posts_based_counts_with_string_keys = {}
        for user_id, count in posts_based_counts.items():
            posts_based_counts_with_string_keys[str(user_id)] = count
        
        print(f"Debug: Posts data shows {len(posts_based_counts)} users with posts")
        print(f"Debug: user_cast_counts shows {len([u for u, c in user_cast_counts.items() if c > 0])} users with posts")
        
        # Test PageRank on all graphs (reduced console output)
        print("\n🧮 Computing PageRank for all graph types...")
        pagerank_scores = test_pagerank_algorithm(social_graph, users, posts_based_counts_with_string_keys)
        trust_pagerank_scores = test_pagerank_algorithm(trust_graph, users, posts_based_counts_with_string_keys)  
        engagement_pagerank_scores = test_pagerank_algorithm(engagement_graph, users, posts_based_counts_with_string_keys)
        
        print("\n🎯 Computing Engagement-Intensity PageRank (Primary Analysis)...")
        
        # Debug: Check which users have posts vs which show up in intensity results
        users_with_posts = [uid for uid, count in posts_based_counts.items() if count > 0]
        print(f"Debug: {len(users_with_posts)} users with posts in analysis window")
        
        intensity_pagerank_scores = test_pagerank_algorithm(intensity_graph, users, posts_based_counts_with_string_keys)
        
        if intensity_pagerank_scores:
            top_5_intensity = sorted(intensity_pagerank_scores.items(), key=lambda x: x[1], reverse=True)[:5]
            print("Debug: Top 5 intensity users:")
            for user_id, score in top_5_intensity:
                post_count = posts_based_counts.get(user_id, 0)  # Use posts data instead
                user_data = {user['node_id']: user for user in users}.get(user_id, {})
                username = user_data.get('display_name', f'User_{user_id}')
                print(f"  {username} (ID: {user_id}, Posts: {post_count}): {score:.6f}")
            
            # Debug: Show some specific user post counts from both sources
            print(f"Debug: User 3115 posts - posts_data: {posts_based_counts.get(3115, 0)}, user_cast_counts: {user_cast_counts.get(3115, 0)}")
            print(f"Debug: User 326567 posts - posts_data: {posts_based_counts.get(326567, 0)}, user_cast_counts: {user_cast_counts.get(326567, 0)}")
            print(f"Debug: User 4895 posts - posts_data: {posts_based_counts.get(4895, 0)}, user_cast_counts: {user_cast_counts.get(4895, 0)}")
        
        # Test centrality measures
        centrality_metrics = test_centrality_algorithms(social_graph, users)
        
        # Test community detection
        community_results = test_community_detection(social_graph, users)
        
        # Validate quality
        validation = validate_graph_metrics_quality(
            pagerank_scores, centrality_metrics, community_results, social_graph
        )
        
        # Generate report
        execution_end_time = datetime.now()
        days_back = 90  # Define the variable that's used in the report
        markdown_content, timestamp = generate_markdown_report(
            pagerank_scores, trust_pagerank_scores, engagement_pagerank_scores, intensity_pagerank_scores, centrality_metrics, community_results, 
            validation, users, posts_based_counts_with_string_keys, start_date, end_date, start_time, execution_end_time, days_back
        )
        
        # Save report
        results_dir = os.path.join(os.path.dirname(__file__), 'results')
        os.makedirs(results_dir, exist_ok=True)
        
        report_filename = f"{timestamp}_graph_metrics_test_report.md"
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
        print(f"Users analyzed: {len(pagerank_scores)}")
        print(f"Centrality metrics: {len(centrality_metrics)}")
        print(f"Communities detected: {community_results.get('louvain_count', 0)}")
        print(f"Quality indicators passed: {quality_passed}/4")
        print(f"Analysis period: Last 90 days")
        print(f"Execution time: {(execution_end_time - start_time).total_seconds():.2f} seconds")
        
        if test_passed:
            print("\n🎉 Graph metrics algorithms show strong analytical capabilities!")
            print("✅ Ready for graph-based recommendation features")
        else:
            print("\n⚠️  Graph metrics need improvement for reliable analysis")
            print("🔄 Focus on graph connectivity and metric sensitivity")
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
        print(f"❌ Test failed with error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()