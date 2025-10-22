# Music Neighbors Algorithm Test Results

**Timestamp**: 2025-07-16 15:55:51
**Algorithm**: Trust-Based Music Discovery
**Test Users**: 3

## Algorithm Overview

The Music Neighbors algorithm uses **balanced trust-based discovery** with anti-prolific-poster measures:

1. **Trust Signal**: Find users whose music posts you've LIKED or REPLIED to
2. **Efficiency Scoring**: Weight by interaction rate (interactions/total_music_posts)
3. **Library Size Penalty**: Reduce influence of mega-curators (>100 artists) by 30%
4. **Diversification**: Limit recommendations per user to ensure variety
5. **Final Scoring**: Balanced Trust × Artist strength in trusted user's library

**Key Advantages**: Elevates selective curators over prolific posters, ensures diverse recommendations.

---

## Individual Test Results

### 1. User 326181 (Unknown)
**Music Library**: 27 artists

**Current Top Artists**:
1. Billy Strings (17.0)
2. Vampire Weekend (9.0)
3. Ol' Dirty Bastard (9.0)
4. Bob Marley & The Wailers (9.0)
5. Allman Brothers Band (9.0)

**Top Trusted Users** (based on your music interactions):
1. **248093 (blakefinucane)**: Balanced Trust Score 2.5
   - Interactions: 2 likes, 0 replies (Raw Trust: 2.0)
   - Efficiency: 0.250 (2.0/8 posts)
   - Music Library: 8 artists
2. **11770 (adam-)**: Balanced Trust Score 1.4
   - Interactions: 1 likes, 0 replies (Raw Trust: 1.0)
   - Efficiency: 0.143 (1.0/7 posts)
   - Music Library: 7 artists
3. **10215 (zoo)**: Balanced Trust Score 0.4
   - Interactions: 2 likes, 0 replies (Raw Trust: 2.0)
   - Efficiency: 0.040 (2.0/50 posts)
   - Music Library: 50 artists
4. **2802 (garrett)**: Balanced Trust Score 0.3
   - Interactions: 3 likes, 0 replies (Raw Trust: 3.0)
   - Efficiency: 0.032 (3.0/93 posts)
   - Music Library: 93 artists
5. **347050 (trupty)**: Balanced Trust Score 0.2
   - Interactions: 1 likes, 0 replies (Raw Trust: 1.0)
   - Efficiency: 0.021 (1.0/48 posts)
   - Music Library: 48 artists

**Music Recommendations**:
1. **Jorja Smith** (Score: 17.5)
   - From: 248093 (blakefinucane)
   - Balanced Trust: 2.5 × Artist Strength: 7.0
2. **Kodak Black** (Score: 17.5)
   - From: 248093 (blakefinucane)
   - Balanced Trust: 2.5 × Artist Strength: 7.0
3. **Tems** (Score: 15.0)
   - From: 248093 (blakefinucane)
   - Balanced Trust: 2.5 × Artist Strength: 6.0
4. **Boards of Canada** (Score: 10.0)
   - From: 11770 (adam-)
   - Balanced Trust: 1.4 × Artist Strength: 7.0
5. **Turnstile** (Score: 9.0)
   - From: 2802 (garrett)
   - Balanced Trust: 0.3 × Artist Strength: 27.8
6. **J Dilla** (Score: 7.5)
   - From: 10215 (zoo)
   - Balanced Trust: 0.4 × Artist Strength: 18.8
7. **Mount Kimbie** (Score: 7.2)
   - From: 10215 (zoo)
   - Balanced Trust: 0.4 × Artist Strength: 18.0
8. **Mac Miller** (Score: 4.8)
   - From: 2802 (garrett)
   - Balanced Trust: 0.3 × Artist Strength: 15.0
9. **Flying Lotus** (Score: 4.0)
   - From: 10215 (zoo)
   - Balanced Trust: 0.4 × Artist Strength: 9.9
10. **SZA** (Score: 3.9)
   - From: 10215 (zoo)
   - Balanced Trust: 0.4 × Artist Strength: 9.8

---

### 2. User 239 (Unknown)
**Music Library**: 11 artists

**Current Top Artists**:
1. Ravyn Lenae (9.0)
2. Maggie Rogers (8.0)
3. Disco Lines, GUDFELLA (8.0)
4. Audrey Hobert (7.0)
5. Camila Cabello, Playboi Carti (0.9)

**Top Trusted Users** (based on your music interactions):
1. **192300 (chrislarsc.eth)**: Balanced Trust Score 5.0
   - Interactions: 1 likes, 0 replies (Raw Trust: 1.0)
   - Efficiency: 0.500 (1.0/2 posts)
   - Music Library: 2 artists
2. **20270 (heavygweit)**: Balanced Trust Score 2.5
   - Interactions: 1 likes, 0 replies (Raw Trust: 1.0)
   - Efficiency: 0.250 (1.0/4 posts)
   - Music Library: 4 artists
3. **1689 (stephancill.eth)**: Balanced Trust Score 2.0
   - Interactions: 1 likes, 0 replies (Raw Trust: 1.0)
   - Efficiency: 0.200 (1.0/5 posts)
   - Music Library: 5 artists
4. **17582 (rphgrc.eth)**: Balanced Trust Score 0.4
   - Interactions: 1 likes, 0 replies (Raw Trust: 1.0)
   - Efficiency: 0.038 (1.0/26 posts)
   - Music Library: 26 artists
5. **18910 (viybz)**: Balanced Trust Score 0.0
   - Interactions: 1 likes, 0 replies (Raw Trust: 1.0)
   - Efficiency: 0.002 (1.0/554 posts)
   - Music Library: 554 artists

**Music Recommendations**:
1. **The Clash** (Score: 22.5)
   - From: 20270 (heavygweit)
   - Balanced Trust: 2.5 × Artist Strength: 9.0
2. **Gift Of Gab** (Score: 22.5)
   - From: 20270 (heavygweit)
   - Balanced Trust: 2.5 × Artist Strength: 9.0
3. **flavourtrip** (Score: 17.5)
   - From: 20270 (heavygweit)
   - Balanced Trust: 2.5 × Artist Strength: 7.0
4. **113** (Score: 5.4)
   - From: 17582 (rphgrc.eth)
   - Balanced Trust: 0.4 × Artist Strength: 14.0
5. **A Tribe Called Quest** (Score: 4.5)
   - From: 192300 (chrislarsc.eth)
   - Balanced Trust: 5.0 × Artist Strength: 0.9
6. **Lorde** (Score: 4.0)
   - From: 192300 (chrislarsc.eth)
   - Balanced Trust: 5.0 × Artist Strength: 0.8
7. **Israel Vibration** (Score: 3.5)
   - From: 17582 (rphgrc.eth)
   - Balanced Trust: 0.4 × Artist Strength: 9.0
8. **Depeche Mode** (Score: 3.5)
   - From: 17582 (rphgrc.eth)
   - Balanced Trust: 0.4 × Artist Strength: 9.0
9. **Afro Medusa, Knee Deep** (Score: 3.5)
   - From: 17582 (rphgrc.eth)
   - Balanced Trust: 0.4 × Artist Strength: 9.0
10. **Billy Idol** (Score: 3.5)
   - From: 17582 (rphgrc.eth)
   - Balanced Trust: 0.4 × Artist Strength: 9.0

---

### 3. User 10215 (zoo)
**Music Library**: 50 artists

**Current Top Artists**:
1. J Dilla (18.8)
2. Mount Kimbie (18.0)
3. Flying Lotus (9.9)
4. SZA (9.8)
5. Tame Impala (9.0)

**Top Trusted Users** (based on your music interactions):
1. **198522 (osuji)**: Balanced Trust Score 0.8
   - Interactions: 2 likes, 0 replies (Raw Trust: 2.0)
   - Efficiency: 0.080 (2.0/25 posts)
   - Music Library: 25 artists
2. **441632 (archilles)**: Balanced Trust Score 0.6
   - Interactions: 1 likes, 0 replies (Raw Trust: 1.0)
   - Efficiency: 0.059 (1.0/17 posts)
   - Music Library: 17 artists
3. **10351 (zachharris.eth)**: Balanced Trust Score 0.6
   - Interactions: 1 likes, 0 replies (Raw Trust: 1.0)
   - Efficiency: 0.056 (1.0/18 posts)
   - Music Library: 18 artists
4. **238814 (sardius.eth)**: Balanced Trust Score 0.2
   - Interactions: 1 likes, 0 replies (Raw Trust: 1.0)
   - Efficiency: 0.024 (1.0/42 posts)
   - Music Library: 42 artists
5. **18570 (qt)**: Balanced Trust Score 0.2
   - Interactions: 1 likes, 0 replies (Raw Trust: 1.0)
   - Efficiency: 0.022 (1.0/46 posts)
   - Music Library: 46 artists

**Music Recommendations**:
1. **Drake** (Score: 22.8)
   - From: 441632 (archilles)
   - Balanced Trust: 0.6 × Artist Strength: 38.8
2. **Central Cee** (Score: 22.4)
   - From: 441632 (archilles)
   - Balanced Trust: 0.6 × Artist Strength: 38.0
3. **melvitto** (Score: 21.6)
   - From: 198522 (osuji)
   - Balanced Trust: 0.8 × Artist Strength: 27.0
4. **Wizkid** (Score: 11.2)
   - From: 198522 (osuji)
   - Balanced Trust: 0.8 × Artist Strength: 14.0
5. **I'll Take You There Choir** (Score: 8.2)
   - From: 441632 (archilles)
   - Balanced Trust: 0.6 × Artist Strength: 14.0
6. **JoÃ© DwÃ¨t FilÃ©, Burna Boy** (Score: 7.6)
   - From: 441632 (archilles)
   - Balanced Trust: 0.6 × Artist Strength: 13.0
7. **Burna Boy** (Score: 7.0)
   - From: 198522 (osuji)
   - Balanced Trust: 0.8 × Artist Strength: 8.8
8. **Kvng Vinci** (Score: 5.6)
   - From: 198522 (osuji)
   - Balanced Trust: 0.8 × Artist Strength: 7.0
9. **Sarkodie** (Score: 5.6)
   - From: 198522 (osuji)
   - Balanced Trust: 0.8 × Artist Strength: 7.0
10. **Shallipopi** (Score: 5.6)
   - From: 198522 (osuji)
   - Balanced Trust: 0.8 × Artist Strength: 7.0

---

## Algorithm Performance Analysis

- **Users with music data**: 3/3
- **Users with trust relationships**: 3/3

- **Average trust relationships per user**: 5.7

## Comparison with Traditional Similarity

**Traditional Approach** (Jaccard similarity):
- Finds users with overlapping artists
- No social context
- Low similarity scores (typically 0.05-0.15)
- Many single-artist overlaps

**Music Neighbors Approach** (Trust-based):
- Finds users whose taste you've validated through interactions
- Strong social signal (outgoing likes/replies)
- High-confidence recommendations
- Rich discovery potential from trusted users' full libraries

**Recommendation**: The Music Neighbors approach provides more actionable and contextually meaningful music discovery for sparse social music libraries.