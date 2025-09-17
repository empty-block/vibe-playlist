# Graph Metrics Test Report

**Generated:** 2025-07-21 11:19:21
**Test Status:** ✅ PASSED
**Users Analyzed:** 1453
**Analysis Period:** Last 30 days
**Start Date:** 2025-06-21 11:19:20
**End Date:** 2025-07-21 11:19:20
**Execution Duration:** 1.47 seconds

## Executive Summary

Graph metrics algorithms successfully identify influential users and meaningful community structures in the music social network.

**Key Findings:**
- PageRank calculated for 1453 users
- 3 centrality metrics computed
- 871 communities detected (Louvain)
- 872 communities detected (Greedy Modularity)

## PageRank Analysis

### Raw Social Graph - Top 10 Users (Volume-Influenced)
1. **User_3115** (ID: 3115, Posts: 0) - 0.046215
2. **User_417360** (ID: 417360, Posts: 0) - 0.045664
3. **User_1076300** (ID: 1076300, Posts: 0) - 0.043214
4. **zoo** (ID: 10215, Posts: 33) - 0.025503
5. **Jabo5779** (ID: 1047052, Posts: 0) - 0.024791
6. **Maxbrain Capital** (ID: 18910, Posts: 114) - 0.020685
7. **Mr. Wildenfree** (ID: 16353, Posts: 18) - 0.014471
8. **User_12915** (ID: 12915, Posts: 0) - 0.014101
9. **Garrett** (ID: 2802, Posts: 18) - 0.013742
10. **User_239** (ID: 239, Posts: 0) - 0.012957

### PageRank Statistics
- **Average Score:** 0.000688
- **Maximum Score:** 0.046215
- **Influence Concentration:** 67.15x above average

### Trust Graph PageRank - Top 10 Users (Quality-Adjusted)
1. **User_3115** (ID: 3115, Posts: 0) - 0.044967
2. **User_417360** (ID: 417360, Posts: 0) - 0.042037
3. **User_1076300** (ID: 1076300, Posts: 0) - 0.041868
4. **Maxbrain Capital** (ID: 18910, Posts: 114) - 0.024524
5. **Jabo5779** (ID: 1047052, Posts: 0) - 0.024033
6. **zoo** (ID: 10215, Posts: 33) - 0.020774
7. **User_12915** (ID: 12915, Posts: 0) - 0.015508
8. **Mr. Wildenfree** (ID: 16353, Posts: 18) - 0.014525
9. **Garrett** (ID: 2802, Posts: 18) - 0.013350
10. **JAKE** (ID: 1020, Posts: 12) - 0.013225

### Trust Graph Statistics
- **Average Score:** 0.000688
- **Maximum Score:** 0.044967
- **Influence Concentration:** 65.34x above average

### Quality-Adjusted Rankings (PageRank ÷ Post Count)
1. **s** (Posts: 1) - 0.005653 (raw: 0.005653)
2. **pugson** (Posts: 1) - 0.002987 (raw: 0.002987)
3. **Stephan** (Posts: 1) - 0.002420 (raw: 0.002420)
4. **Kamilla** (Posts: 1) - 0.002398 (raw: 0.002398)
5. **Rico** (Posts: 3) - 0.002067 (raw: 0.006202)
6. **dabus.base.eth** (Posts: 1) - 0.001903 (raw: 0.001903)
7. **musicben** (Posts: 3) - 0.001730 (raw: 0.005190)
8. **Dvyne** (Posts: 1) - 0.001416 (raw: 0.001416)
9. **Archilles** (Posts: 2) - 0.001213 (raw: 0.002427)
10. **July** (Posts: 2) - 0.001089 (raw: 0.002177)

## Centrality Analysis

### In Degree Centrality
1. **User_3115** - 0.050275
2. **User_239** - 0.026860
3. **User_417360** - 0.022727
4. **Mr. Wildenfree** - 0.020661
5. **Garrett** - 0.020661

### Out Degree Centrality
1. **User_702530** - 0.017218
2. **User_417360** - 0.013774
3. **Cristina Spinei** - 0.009642
4. **User_3115** - 0.006198
5. **Maxbrain Capital** - 0.005510

### Eigenvector Centrality
1. **User_3115** - 0.620528
2. **User_417360** - 0.566536
3. **User_12915** - 0.287179
4. **User_1076300** - 0.229392
5. **User_515449** - 0.194742

## Community Detection Results

### Louvain Algorithm (871 communities)

**Community 848** (58 members)
- Sample members: User_1109678, User_10197, User_5698, CryptoGeekPT, User_1106588
- ... and 53 more members

**Community 851** (58 members)
- Sample members: Rachna, User_421962, User_560478, User_1111370, Marina Ya
- ... and 53 more members

**Community 161** (49 members)
- Sample members: , Rajat Singh Thakur.base.eth, User_781112, User_1071137, Irina Liakh
- ... and 44 more members

**Community 860** (45 members)
- Sample members: eirrann | he/him, User_4513, User_243719, Christian Cambas, Maxbrain Capital
- ... and 40 more members

**Community 857** (44 members)
- Sample members: User_511905, 0ffline.xo, User_1096768, User_445796, zoo
- ... and 39 more members

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
| Communities (Louvain) | 871 | Good |

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
