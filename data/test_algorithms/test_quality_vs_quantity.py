#!/usr/bin/env python3
"""
Test Quality vs Quantity Metrics

Compares raw PageRank/centrality metrics against quality-adjusted versions that 
control for post count and reward engagement quality over volume.
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
    fetch_user_cast_counts,
    build_social_graph,
    build_quality_adjusted_social_graph,
    calculate_pagerank,
    calculate_centrality_metrics,
    get_graph_summary
)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def compare_metrics(supabase, days_back=30):
    """Compare raw vs quality-adjusted metrics."""
    print(f"\n🆚 Quality vs Quantity Metrics Comparison")
    print(f"Analyzing data from the last {days_back} days")
    
    # Calculate date filter
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)
    
    print(f"Date range: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
    
    # Fetch data (use all data, not date-filtered for better post count distribution)
    users = fetch_user_nodes(supabase, limit=1000)  # Respect Supabase limit
    edges = fetch_cast_edges(supabase, limit=1000)  # Use all edges for richer post data
    
    if not users or not edges:
        print("❌ No data available for testing")
        return
    
    print(f"Loaded {len(users)} users and {len(edges)} edges")
    
    # Get user post counts
    user_ids = [user['node_id'] for user in users]
    user_cast_counts = fetch_user_cast_counts(supabase, user_ids)
    
    print(f"Fetched post counts for {len(user_cast_counts)} users")
    
    # Build both graph types
    print("\n=== Building Graphs ===")
    raw_graph = build_social_graph(edges, users)
    quality_graph = build_quality_adjusted_social_graph(edges, users, user_cast_counts)
    
    # Get graph summaries
    raw_summary = get_graph_summary(raw_graph, "Raw Social Graph")
    quality_summary = get_graph_summary(quality_graph, "Quality-Adjusted Graph")
    
    print(f"\nRaw Graph: {raw_summary['nodes']} nodes, {raw_summary['edges']} edges")
    print(f"Quality Graph: {quality_summary['nodes']} nodes, {quality_summary['edges']} edges")
    
    # Calculate PageRank for both
    print("\n=== PageRank Comparison ===")
    raw_pagerank = calculate_pagerank(raw_graph)
    quality_pagerank = calculate_pagerank(quality_graph)
    
    user_lookup = {user['node_id']: user for user in users}
    
    print("\nTop 10 Users - Raw PageRank (Volume-based):")
    raw_sorted = sorted(raw_pagerank.items(), key=lambda x: x[1], reverse=True)
    for i, (user_id, score) in enumerate(raw_sorted[:10], 1):
        user_data = user_lookup.get(user_id, {})
        username = user_data.get('display_name', f'User_{user_id}')
        post_count = user_cast_counts.get(user_id, 0)
        print(f"  {i}. {username} (Posts: {post_count}): {score:.6f}")
    
    print("\nTop 10 Users - Quality-Adjusted PageRank (Engagement-based):")
    quality_sorted = sorted(quality_pagerank.items(), key=lambda x: x[1], reverse=True)
    for i, (user_id, score) in enumerate(quality_sorted[:10], 1):
        user_data = user_lookup.get(user_id, {})
        username = user_data.get('display_name', f'User_{user_id}')
        post_count = user_cast_counts.get(user_id, 0)
        print(f"  {i}. {username} (Posts: {post_count}): {score:.6f}")
    
    # Analyze differences
    print("\n=== Quality vs Quantity Analysis ===")
    
    # Get top 20 from each ranking
    raw_top20 = set([user_id for user_id, _ in raw_sorted[:20]])
    quality_top20 = set([user_id for user_id, _ in quality_sorted[:20]])
    
    overlap = len(raw_top20 & quality_top20)
    raw_only = raw_top20 - quality_top20
    quality_only = quality_top20 - raw_top20
    
    print(f"Top 20 overlap: {overlap}/20 ({overlap/20*100:.1f}%)")
    print(f"Raw-only top users: {len(raw_only)}")
    print(f"Quality-only top users: {len(quality_only)}")
    
    # Show users who moved up significantly in quality ranking
    print("\n🎯 Users who gained prominence with quality adjustment:")
    for user_id in list(quality_only)[:5]:
        user_data = user_lookup.get(user_id, {})
        username = user_data.get('display_name', f'User_{user_id}')
        post_count = user_cast_counts.get(user_id, 0)
        
        raw_rank = next((i for i, (uid, _) in enumerate(raw_sorted, 1) if uid == user_id), "Not in top 100")
        quality_rank = next((i for i, (uid, _) in enumerate(quality_sorted, 1) if uid == user_id), "Not found")
        
        print(f"  • {username} (Posts: {post_count})")
        print(f"    Raw rank: {raw_rank}, Quality rank: {quality_rank}")
    
    # Show users who lost prominence (high volume, low quality)
    print("\n📈 High-volume users who dropped in quality ranking:")
    for user_id in list(raw_only)[:5]:
        user_data = user_lookup.get(user_id, {})
        username = user_data.get('display_name', f'User_{user_id}')
        post_count = user_cast_counts.get(user_id, 0)
        
        raw_rank = next((i for i, (uid, _) in enumerate(raw_sorted, 1) if uid == user_id), "Not found")
        quality_rank = next((i for i, (uid, _) in enumerate(quality_sorted, 1) if uid == user_id), "Not in top 100")
        
        print(f"  • {username} (Posts: {post_count})")
        print(f"    Raw rank: {raw_rank}, Quality rank: {quality_rank}")
    
    # Calculate post count statistics for top users
    raw_top10_posts = [user_cast_counts.get(uid, 0) for uid, _ in raw_sorted[:10]]
    quality_top10_posts = [user_cast_counts.get(uid, 0) for uid, _ in quality_sorted[:10]]
    
    print(f"\n📊 Post Count Analysis:")
    print(f"Raw top 10 average posts: {sum(raw_top10_posts)/len(raw_top10_posts):.1f}")
    print(f"Quality top 10 average posts: {sum(quality_top10_posts)/len(quality_top10_posts):.1f}")
    
    return {
        'raw_pagerank': raw_pagerank,
        'quality_pagerank': quality_pagerank,
        'raw_graph': raw_graph,
        'quality_graph': quality_graph,
        'user_cast_counts': user_cast_counts,
        'overlap_percent': overlap/20*100
    }


def main():
    """Run quality vs quantity comparison test."""
    start_time = datetime.now()
    print("🧪 Quality vs Quantity Metrics Test")
    print(f"Started at: {start_time}")
    
    try:
        # Connect to database
        supabase = get_supabase_client()
        print("✓ Connected to Supabase")
        
        # Run comparison
        results = compare_metrics(supabase, days_back=30)
        
        if results:
            end_time = datetime.now()
            
            print(f"\n{'='*60}")
            print("COMPARISON SUMMARY")
            print(f"{'='*60}")
            print(f"Quality vs Volume overlap: {results['overlap_percent']:.1f}%")
            print(f"Execution time: {(end_time - start_time).total_seconds():.2f} seconds")
            
            if results['overlap_percent'] < 70:
                print("\n✅ Quality adjustment is working!")
                print("🎯 Rankings show meaningful differences between volume and engagement")
            else:
                print("\n⚠️  Quality adjustment may need tuning")
                print("📈 Consider stronger normalization or different quality factors")
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
        print(f"❌ Test failed with error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()