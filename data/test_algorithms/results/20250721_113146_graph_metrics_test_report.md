# Graph Metrics Test Report

**Generated:** 2025-07-21 11:31:46
**Test Status:** ✅ PASSED
**Users Analyzed:** 1154
**Analysis Period:** Last 90 days
**Start Date:** 2025-04-22 11:31:45
**End Date:** 2025-07-21 11:31:45
**Execution Duration:** 1.19 seconds

## Executive Summary

Graph metrics algorithms successfully identify influential users and meaningful community structures in the music social network.

**Key Findings:**
- PageRank calculated for 1154 users
- 3 centrality metrics computed
- 615 communities detected (Louvain)
- 614 communities detected (Greedy Modularity)

## PageRank Analysis

### Raw Social Graph - Top 10 Users (Volume-Influenced)
1. **User_3115** (ID: 3115, Posts: 0) - 0.024835
2. **User_10081** (ID: 10081, Posts: 0) - 0.022861
3. **User_318473** (ID: 318473, Posts: 0) - 0.021475
4. **Stefen** (ID: 20907, Posts: 0) - 0.018373
5. **Kyle Patrick** (ID: 247143, Posts: 1) - 0.018172
6. **Mr. Wildenfree** (ID: 16353, Posts: 18) - 0.017702
7. **Maceo** (ID: 7341, Posts: 7) - 0.017614
8. **User_838** (ID: 838, Posts: 0) - 0.016191
9. **User_394023** (ID: 394023, Posts: 0) - 0.015661
10. **User_326567** (ID: 326567, Posts: 0) - 0.014039

### PageRank Statistics
- **Average Score:** 0.000867
- **Maximum Score:** 0.024835
- **Influence Concentration:** 28.66x above average

### Trust Graph PageRank - Top 10 Users (Quality-Adjusted)
1. **User_10081** (ID: 10081, Posts: 0) - 0.027540
2. **User_3115** (ID: 3115, Posts: 0) - 0.023861
3. **User_318473** (ID: 318473, Posts: 0) - 0.021356
4. **Stefen** (ID: 20907, Posts: 0) - 0.018305
5. **Kyle Patrick** (ID: 247143, Posts: 1) - 0.018175
6. **Maceo** (ID: 7341, Posts: 7) - 0.017371
7. **Mr. Wildenfree** (ID: 16353, Posts: 18) - 0.016441
8. **User_394023** (ID: 394023, Posts: 0) - 0.015668
9. **James Finnerty** (ID: 17910, Posts: 6) - 0.014621
10. **User_326567** (ID: 326567, Posts: 0) - 0.014003

### Trust Graph Statistics
- **Average Score:** 0.000867
- **Maximum Score:** 0.027540
- **Influence Concentration:** 31.78x above average

### Engagement Graph PageRank - Top 10 Users (True Influence)
1. **User_417360** (ID: 417360, Posts: 0) - 0.010377
2. **Mr. Wildenfree** (ID: 16353, Posts: 18) - 0.008475
3. **User_3115** (ID: 3115, Posts: 0) - 0.006068
4. **User_10081** (ID: 10081, Posts: 0) - 0.004827
5. **Calisay** (ID: 245024, Posts: 3) - 0.004596
6. **Sine** (ID: 236727, Posts: 0) - 0.004339
7. **James Finnerty** (ID: 17910, Posts: 6) - 0.003694
8. **User_355566** (ID: 355566, Posts: 0) - 0.003601
9. **Boona** (ID: 3406, Posts: 3) - 0.003367
10. **tricil** (ID: 4294, Posts: 17) - 0.003270

### Engagement Graph Statistics
- **Average Score:** 0.000867
- **Maximum Score:** 0.010377
- **Influence Concentration:** 11.98x above average

### Quality-Adjusted Rankings (PageRank ÷ Post Count)
1. **Kyle Patrick** (Posts: 1) - 0.018172 (raw: 0.018172)
2. **matthewb** (Posts: 1) - 0.006979 (raw: 0.006979)
3. **July** (Posts: 2) - 0.004810 (raw: 0.009621)
4. **** (Posts: 1) - 0.002820 (raw: 0.002820)
5. **levy.eth** (Posts: 1) - 0.002709 (raw: 0.002709)
6. **Maceo** (Posts: 7) - 0.002516 (raw: 0.017614)
7. **ted s alt** (Posts: 1) - 0.002495 (raw: 0.002495)
8. **comz** (Posts: 1) - 0.002345 (raw: 0.002345)
9. **kenny** (Posts: 6) - 0.002205 (raw: 0.013229)
10. **James Finnerty** (Posts: 6) - 0.002203 (raw: 0.013218)

## Centrality Analysis

### In Degree Centrality
1. **User_3115** - 0.041631
2. **User_10081** - 0.037294
3. **Mr. Wildenfree** - 0.022550
4. **Maceo** - 0.021683
5. **User_326567** - 0.019081

### Out Degree Centrality
1. **User_417360** - 0.025152
2. **User_3115** - 0.013010
3. **Mr. Wildenfree** - 0.011275
4. **zoo** - 0.006071
5. **Calisay** - 0.006071

### Eigenvector Centrality
1. **Maceo** - 0.480774
2. **User_838** - 0.432422
3. **User_3115** - 0.424931
4. **User_417360** - 0.259020
5. **Mr. Wildenfree** - 0.251529

## Community Detection Results

### Louvain Algorithm (615 communities)

**Community 34** (59 members)
- Sample members: Maryam, Christina BorrowLucid | Chones, masky, User_391793, Adam L
- ... and 54 more members

**Community 599** (48 members)
- Sample members: User_246847, overcount, User_535845, Nurol Sheikh, 
- ... and 43 more members

**Community 7** (44 members)
- Sample members: , rathermercurial.eth, dcposch, keccers, abril
- ... and 39 more members

**Community 12** (36 members)
- Sample members: User_316877, ETHN, Coded, typeof.eth, chris
- ... and 31 more members

**Community 104** (35 members)
- Sample members: Casii Mk, Aysun, Alireza, Aivan.eth, darkknight_utk
- ... and 30 more members

---

## Algorithm Quality Assessment

- ✅ Graph has edges and connectivity
- ✅ PageRank shows meaningful influence distribution
- ✅ Multiple centrality metrics calculated
- ✅ Community detection found meaningful clusters

## Performance Metrics

| Metric | Value | Assessment |
|--------|-------|------------|
| Graph Connectivity | Yes | Good |
| PageRank Distribution | Meaningful | Good |
| Centrality Metrics | 3 | Comprehensive |
| Communities (Louvain) | 615 | Good |

## Recommendations

✅ **PROCEED** with graph-based features in recommendation system
- Graph metrics successfully identify influential users and community structures
- PageRank and centrality measures provide meaningful user rankings
- Community detection reveals natural clustering in the music social network

**Implementation Opportunities:**
1. Use PageRank scores for cold-start recommendation fallback
2. Leverage centrality metrics for curator quality scoring
3. Apply community detection for personalized recommendation scoping
4. Implement influence-based recommendation weighting
