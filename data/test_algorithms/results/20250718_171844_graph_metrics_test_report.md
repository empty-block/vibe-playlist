# Graph Metrics Test Report

**Generated:** 2025-07-18 17:18:44
**Test Status:** ✅ PASSED
**Users Analyzed:** 1468
**Analysis Period:** Last 30 days
**Start Time:** 2025-07-18 17:18:43
**End Time:** 2025-07-18 17:18:44
**Execution Duration:** 1.33 seconds

## Executive Summary

Graph metrics algorithms successfully identify influential users and meaningful community structures in the music social network.

**Key Findings:**
- PageRank calculated for 1468 users
- 3 centrality metrics computed
- 864 communities detected (Louvain)
- 867 communities detected (Greedy Modularity)

## PageRank Analysis

### Raw Social Graph - Top 10 Users (Volume-Influenced)
1. **User_417360** (ID: 417360, Posts: 0) - 0.045423
2. **User_3115** (ID: 3115, Posts: 0) - 0.040236
3. **User_1076300** (ID: 1076300, Posts: 0) - 0.038110
4. **zoo** (ID: 10215, Posts: 33) - 0.023960
5. **Mr. Wildenfree** (ID: 16353, Posts: 18) - 0.022618
6. **Jabo5779** (ID: 1047052, Posts: 0) - 0.021939
7. **Maxbrain Capital** (ID: 18910, Posts: 114) - 0.015536
8. **User_194372** (ID: 194372, Posts: 0) - 0.013754
9. **User_12915** (ID: 12915, Posts: 0) - 0.013060
10. **Garrett** (ID: 2802, Posts: 18) - 0.012909

### PageRank Statistics
- **Average Score:** 0.000681
- **Maximum Score:** 0.045423
- **Influence Concentration:** 66.68x above average

### Trust Graph PageRank - Top 10 Users (Quality-Adjusted)
1. **User_417360** (ID: 417360, Posts: 0) - 0.040813
2. **User_1076300** (ID: 1076300, Posts: 0) - 0.039327
3. **User_3115** (ID: 3115, Posts: 0) - 0.037945
4. **zoo** (ID: 10215, Posts: 33) - 0.022715
5. **Jabo5779** (ID: 1047052, Posts: 0) - 0.022629
6. **Mr. Wildenfree** (ID: 16353, Posts: 18) - 0.021148
7. **Maxbrain Capital** (ID: 18910, Posts: 114) - 0.017700
8. **User_12915** (ID: 12915, Posts: 0) - 0.013963
9. **User_194372** (ID: 194372, Posts: 0) - 0.013079
10. **User_355566** (ID: 355566, Posts: 0) - 0.012896

### Trust Graph Statistics
- **Average Score:** 0.000681
- **Maximum Score:** 0.040813
- **Influence Concentration:** 59.91x above average

### Quality-Adjusted Rankings (PageRank ÷ Post Count)
1. **Arjan | That Poetry Guy** (Posts: 1) - 0.008345 (raw: 0.008345)
2. **s** (Posts: 1) - 0.005585 (raw: 0.005585)
3. **pugson** (Posts: 1) - 0.004271 (raw: 0.004271)
4. **** (Posts: 1) - 0.002424 (raw: 0.002424)
5. **Kamilla** (Posts: 1) - 0.002391 (raw: 0.002391)
6. **July** (Posts: 2) - 0.002211 (raw: 0.004422)
7. **dabus.base.eth** (Posts: 1) - 0.002040 (raw: 0.002040)
8. **YON** (Posts: 2) - 0.001862 (raw: 0.003724)
9. **musicben** (Posts: 3) - 0.001652 (raw: 0.004956)
10. **androidsixteen** (Posts: 1) - 0.001463 (raw: 0.001463)

## Centrality Analysis

### In Degree Centrality
1. **User_3115** - 0.038855
2. **User_417360** - 0.022495
3. **User_239** - 0.022495
4. **Mr. Wildenfree** - 0.021813
5. **Maxbrain Capital** - 0.020450

### Out Degree Centrality
1. **User_702530** - 0.018405
2. **User_417360** - 0.013633
3. **Cristina Spinei** - 0.008180
4. **User_355566** - 0.006135
5. **Maxbrain Capital** - 0.005453

### Eigenvector Centrality
1. **User_3115** - 0.597822
2. **User_417360** - 0.561241
3. **User_12915** - 0.303625
4. **User_1076300** - 0.251679
5. **User_515449** - 0.208976

## Community Detection Results

### Louvain Algorithm (864 communities)

**Community 114** (71 members)
- Sample members: User_1089447, User_649043, User_2987, User_1099271, User_702530
- ... and 66 more members

**Community 842** (60 members)
- Sample members: User_1081816, User_1061021, User_386021, User_1058918, User_1077311
- ... and 55 more members

**Community 841** (46 members)
- Sample members: User_901499, FBI, User_1109376, User_631404, User_979983
- ... and 41 more members

**Community 843** (43 members)
- Sample members: User_1082770, User_559723, User_10044, User_653098, CryptoGeekPT
- ... and 38 more members

**Community 845** (40 members)
- Sample members: User_415872, User_3609, User_846335, Maryam, User_476033
- ... and 35 more members

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
| Communities (Louvain) | 864 | Good |

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
