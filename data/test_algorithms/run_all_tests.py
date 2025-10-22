#!/usr/bin/env python3
"""
Test Runner for TASK-315 Trust-Based Algorithm Validation

Runs all 7 trust algorithm tests and provides consolidated results for decision making.
Tests trust curators, recommendations, mutual relationships, graph metrics, artist authority,
cold start fallback, and trust vs PageRank comparison algorithms.
"""

import os
import sys
import subprocess
import time
from datetime import datetime

def run_test(test_file, test_name):
    """Run a single test file and capture results"""
    print(f"\n{'='*60}")
    print(f"Running {test_name}")
    print(f"{'='*60}")
    
    start_time = time.time()
    
    try:
        # Run the test
        result = subprocess.run([sys.executable, test_file], 
                              capture_output=True, text=True, timeout=300)
        
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"Test completed in {duration:.2f} seconds")
        
        if result.returncode == 0:
            print("✅ Test passed successfully")
            print(result.stdout)
        else:
            print("❌ Test failed")
            print("STDOUT:", result.stdout)
            print("STDERR:", result.stderr)
            
        return {
            'name': test_name,
            'file': test_file,
            'success': result.returncode == 0,
            'duration': duration,
            'stdout': result.stdout,
            'stderr': result.stderr
        }
        
    except subprocess.TimeoutExpired:
        print(f"❌ Test timed out after 300 seconds")
        return {
            'name': test_name,
            'file': test_file,
            'success': False,
            'duration': 300,
            'stdout': '',
            'stderr': 'Test timed out'
        }
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        return {
            'name': test_name,
            'file': test_file,
            'success': False,
            'duration': 0,
            'stdout': '',
            'stderr': str(e)
        }

def generate_markdown_report(results, total_duration):
    """Generate detailed markdown report of test results"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    passed = sum(1 for r in results if r['success'])
    failed = len(results) - passed
    
    # Create markdown content
    markdown = f"""# Graph Intelligence Algorithm Test Results

**Timestamp**: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}  
**Duration**: {total_duration:.2f} seconds  
**Result**: {'✅ **ALL TESTS PASSED**' if passed == len(results) else '❌ **SOME TESTS FAILED**'} ({passed}/{len(results)})

## Executive Summary

"""
    
    if passed == len(results):
        markdown += """The graph intelligence algorithm validation successfully demonstrates that our core algorithms produce **meaningful, intuitive results** that justify building the full infrastructure. All test suites passed with promising results.

**Recommendation**: ✅ **PROCEED with Phase 1 Infrastructure Build**

"""
    else:
        markdown += f"""Algorithm validation shows mixed results with {failed} test failures. Review and fix failing algorithms before proceeding with infrastructure build.

**Recommendation**: 🔄 **FIX FAILING TESTS BEFORE INFRASTRUCTURE BUILD**

"""
    
    markdown += "---\n\n## Test Results Overview\n\n"
    
    for i, result in enumerate(results, 1):
        status = "✅" if result['success'] else "❌"
        markdown += f"### {i}. {result['name']} {status}\n"
        markdown += f"**Duration**: {result['duration']:.2f} seconds  \n\n"
        
        if result['success']:
            markdown += "**Key Findings**:\n"
            # Extract key insights from stdout
            lines = result['stdout'].split('\n')
            in_summary = False
            for line in lines:
                if "Testing" in line or "Algorithm Quality" in line:
                    in_summary = True
                elif in_summary and line.strip():
                    if line.startswith('  ') or line.startswith('    '):
                        markdown += f"- {line.strip()}\n"
                    elif "===" in line:
                        break
            markdown += "\n"
        else:
            markdown += f"**Error**: {result['stderr']}\n\n"
    
    markdown += "---\n\n## Technical Details\n\n"
    
    for result in results:
        markdown += f"### {result['name']} - Full Output\n\n"
        markdown += "```\n"
        markdown += result['stdout']
        if result['stderr']:
            markdown += f"\n\nERROR:\n{result['stderr']}"
        markdown += "\n```\n\n"
    
    markdown += "---\n\n## Next Steps\n\n"
    
    if passed == len(results):
        markdown += """1. **Proceed with TASK-320** (Phase 1 Infrastructure Build)
2. **Implement LSH infrastructure** for larger-scale similarity computation
3. **Set up daily pipeline** for pre-computed similarity matrices
4. **Deploy analytics API endpoints** for real-time queries

"""
    else:
        markdown += """1. **Fix failing algorithms** identified in test results
2. **Re-run tests** to verify fixes
3. **Review algorithm approaches** if multiple failures persist
4. **Then proceed with infrastructure build** once all tests pass

"""
    
    return markdown, timestamp

def main():
    """Run all algorithm tests"""
    print("🧪 TASK-315 Trust-Based Algorithm Validation Suite")
    print(f"Started at: {datetime.now()}")
    print(f"Working directory: {os.getcwd()}")
    
    # Verify environment
    required_env_vars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY']
    missing_vars = [var for var in required_env_vars if not os.environ.get(var)]
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {missing_vars}")
        print("Please set these variables and try again.")
        sys.exit(1)
    
    # Test files to run - TASK-315 Trust-Based Algorithm Validation
    test_files = [
        ('test_trust_curators.py', 'Trust Curators Discovery (Weighted Interactions)'),
        ('test_trust_recommendations.py', 'Trust-Based Recommendations (Quality & Attribution)'),
        ('test_mutual_trust.py', 'Mutual Trust Relationships (Bidirectional Scoring)'),
        ('test_graph_metrics.py', 'Graph Metrics (PageRank, Centrality, Community Detection)'),
        ('test_artist_authority.py', 'Artist Authority (Artist PageRank Network)'),
        ('test_cold_start.py', 'Cold Start (PageRank Fallback for New Users)'),
        ('test_metric_comparison.py', 'Trust vs PageRank Comparison (Algorithm Validation)')
    ]
    
    # Run all tests
    results = []
    total_start_time = time.time()
    
    for test_file, test_name in test_files:
        test_path = os.path.join(os.path.dirname(__file__), test_file)
        
        if os.path.exists(test_path):
            result = run_test(test_path, test_name)
            results.append(result)
        else:
            print(f"❌ Test file not found: {test_path}")
            results.append({
                'name': test_name,
                'file': test_file,
                'success': False,
                'duration': 0,
                'stdout': '',
                'stderr': 'Test file not found'
            })
    
    total_duration = time.time() - total_start_time
    
    # Generate markdown report
    markdown_content, timestamp = generate_markdown_report(results, total_duration)
    
    # Save to timestamped file
    results_dir = os.path.join(os.path.dirname(__file__), 'results')
    os.makedirs(results_dir, exist_ok=True)
    
    report_filename = f"{timestamp}_algorithm_validation_report.md"
    report_path = os.path.join(results_dir, report_filename)
    
    with open(report_path, 'w') as f:
        f.write(markdown_content)
    
    print(f"\n📄 Detailed report saved to: {report_path}")
    
    # Print summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}")
    
    passed = sum(1 for r in results if r['success'])
    failed = len(results) - passed
    
    print(f"Total tests: {len(results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Total duration: {total_duration:.2f} seconds")
    
    print(f"\nDetailed Results:")
    for result in results:
        status = "✅ PASS" if result['success'] else "❌ FAIL"
        print(f"  {status} {result['name']} ({result['duration']:.2f}s)")
        
        if not result['success'] and result['stderr']:
            print(f"    Error: {result['stderr']}")
    
    # Decision recommendation
    print(f"\n{'='*60}")
    print("DECISION RECOMMENDATION")
    print(f"{'='*60}")
    
    if passed == len(results):
        print("🎉 All tests passed! Algorithms show promising results.")
        print("✅ RECOMMENDATION: Proceed with Phase 1 infrastructure build (TASK-320)")
        print("\nNext steps:")
        print("1. Review algorithm outputs for quality and intuition")
        print("2. Document any algorithm improvements needed")
        print("3. Begin LSH infrastructure implementation")
        print("4. Set up daily pipeline architecture")
        
    elif passed >= len(results) * 0.75:
        print("⚠️  Most tests passed, but some issues found.")
        print("🔄 RECOMMENDATION: Address failing tests before infrastructure build")
        print("\nNext steps:")
        print("1. Fix failing algorithms")
        print("2. Re-run tests to verify fixes")
        print("3. Then proceed with infrastructure build")
        
    else:
        print("❌ Multiple tests failed. Algorithm approach needs revision.")
        print("🛑 RECOMMENDATION: Iterate on algorithms before infrastructure build")
        print("\nNext steps:")
        print("1. Review algorithm failures and error messages")
        print("2. Revise similarity calculation approaches")
        print("3. Test with different user/artist combinations")
        print("4. Consider alternative graph algorithms")
    
    print(f"\nTest completed at: {datetime.now()}")
    
    # Exit with appropriate code
    sys.exit(0 if passed == len(results) else 1)

if __name__ == "__main__":
    main()