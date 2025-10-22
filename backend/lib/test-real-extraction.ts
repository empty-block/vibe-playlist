#!/usr/bin/env bun
/**
 * Real-world Integration Test for TASK-658
 * Fetches actual OpenGraph data from real URLs and shows extraction results
 */

import { fetchOpenGraph } from './opengraph'
import { extractMusicMetadata } from './ai-music-extractor'
import type { MusicContext } from './ai-music-extractor'

// Test URLs covering different platforms and scenarios
// These are actual track URLs with correct artist labels
const TEST_URLS = [
  {
    name: 'Spotify - Tame Impala',
    url: 'https://open.spotify.com/track/6K4t31amVTZDgR3sKmwUJJ',
    expected_artist: 'Tame Impala'
  },
  {
    name: 'Spotify - Post Malone',
    url: 'https://open.spotify.com/track/3a1lNhkSLSkpJE4MSHpDu9',
    expected_artist: 'Post Malone'
  },
  {
    name: 'Spotify - Tame Impala (Let It Happen)',
    url: 'https://open.spotify.com/track/2X485T9Z5Ly0xyaghN73ed',
    expected_artist: 'Tame Impala'
  },
  {
    name: 'Spotify - Lil Uzi Vert',
    url: 'https://open.spotify.com/track/7GX5flRQZVHRAGd6B4TmDO',
    expected_artist: 'Lil Uzi Vert'
  },
  {
    name: 'YouTube - Aesop Rock',
    url: 'https://www.youtube.com/watch?v=npcGql9Ir6Y',
    expected_artist: 'Aesop Rock'
  },
  {
    name: 'Spotify - Powfu',
    url: 'https://open.spotify.com/track/7eJMfftS33KTjuF7lTsMCx',
    expected_artist: 'Powfu'
  },
  {
    name: 'YouTube - Mac Miller',
    url: 'https://www.youtube.com/watch?v=aIHF7u9Wwiw',
    expected_artist: 'Mac Miller'
  },
  {
    name: 'YouTube - Kendrick Lamar',
    url: 'https://www.youtube.com/watch?v=tvTRZJ-4EyI',
    expected_artist: 'Kendrick Lamar'
  },
  {
    name: 'Spotify - Tyler, The Creator',
    url: 'https://open.spotify.com/track/5nujwm7jQFHmrA7wZn0MTh',
    expected_artist: 'Tyler, The Creator'
  },
  {
    name: 'YouTube - The Allman Brothers Band',
    url: 'https://www.youtube.com/watch?v=ih7N62ic20M',
    expected_artist: 'The Allman Brothers Band'
  }
]

async function testRealExtraction() {
  console.log('🧪 TASK-658 Real-world Integration Test')
  console.log('=' .repeat(80))
  console.log()

  const results = []

  for (let i = 0; i < TEST_URLS.length; i++) {
    const test = TEST_URLS[i]
    console.log(`\n[${i + 1}/${TEST_URLS.length}] Testing: ${test.name}`)
    console.log(`URL: ${test.url}`)
    console.log('-'.repeat(80))

    try {
      // Step 1: Fetch OpenGraph metadata
      console.log('📡 Fetching OpenGraph metadata...')
      const ogData = await fetchOpenGraph(test.url, { timeout: 15000, retries: 2 })

      if (!ogData.success) {
        console.log('❌ OpenGraph fetch failed:', ogData.error)
        results.push({
          name: test.name,
          url: test.url,
          success: false,
          error: ogData.error
        })
        continue
      }

      // Show what we got from OpenGraph
      console.log('\n📋 OpenGraph Results:')
      console.log(`  og_title: ${ogData.og_title}`)
      console.log(`  og_artist: ${ogData.og_artist}`)
      console.log(`  og_description: ${ogData.og_description}`)
      console.log(`  og_image_url: ${ogData.og_image_url ? 'Yes' : 'No'}`)

      // Highlight the description (this is what TASK-658 added!)
      if (ogData.og_description) {
        console.log('\n✨ og_description (NEW in TASK-658):')
        const preview = ogData.og_description.substring(0, 200)
        console.log(`  "${preview}${ogData.og_description.length > 200 ? '...' : ''}"`)
      } else {
        console.log('\n⚠️  og_description is NULL (no description metadata)')
      }

      // Step 2: Prepare context for AI extraction
      const platform = test.url.includes('spotify') ? 'spotify' : 'youtube'
      const platformId = test.url.split('/').pop()?.split('?')[0] || 'unknown'

      const context: MusicContext = {
        platform_name: platform,
        platform_id: platformId,
        og_title: ogData.og_title,
        og_artist: ogData.og_artist,
        og_description: ogData.og_description, // ← This is what TASK-658 added!
        og_metadata: ogData.og_metadata
      }

      console.log('\n🤖 Context sent to AI:')
      console.log(`  platform: ${context.platform_name}`)
      console.log(`  og_title: ${context.og_title}`)
      console.log(`  og_artist: ${context.og_artist}`)
      console.log(`  og_description: ${context.og_description ? '✓ Included' : '✗ Missing'}`)

      // Step 3: Run AI extraction
      console.log('\n🧠 Running AI extraction...')
      const extractions = await extractMusicMetadata([context], {
        model: 'claude-3-5-haiku-20241022',
        temperature: 0.1
      })

      if (extractions.length === 0) {
        console.log('❌ AI extraction returned no results')
        results.push({
          name: test.name,
          url: test.url,
          success: false,
          og_description: ogData.og_description,
          error: 'No extraction results'
        })
        continue
      }

      const extraction = extractions[0]

      // Show AI extraction results
      console.log('\n✅ AI Extraction Results:')
      console.log(`  title: ${extraction.title}`)
      console.log(`  artist: ${extraction.artist}`)
      console.log(`  album: ${extraction.album}`)
      console.log(`  genres: ${extraction.genres.join(', ')}`)
      console.log(`  release_date: ${extraction.release_date}`)
      console.log(`  music_type: ${extraction.music_type}`)
      console.log(`  confidence: ${(extraction.confidence_score * 100).toFixed(1)}%`)

      // Validate against expected
      const artistMatch = extraction.artist === test.expected_artist
      console.log(`\n${artistMatch ? '✓' : '✗'} Artist Extraction:`)
      console.log(`  Expected: "${test.expected_artist}"`)
      console.log(`  Got: "${extraction.artist}"`)
      console.log(`  Match: ${artistMatch ? 'YES ✓' : 'NO ✗'}`)

      results.push({
        name: test.name,
        url: test.url,
        success: true,
        og_description_present: !!ogData.og_description,
        og_description: ogData.og_description,
        extracted_artist: extraction.artist,
        expected_artist: test.expected_artist,
        artist_match: artistMatch,
        confidence: extraction.confidence_score,
        genres: extraction.genres
      })

      // Small delay between requests to be nice to servers
      await new Promise(resolve => setTimeout(resolve, 2000))

    } catch (error: any) {
      console.log('\n❌ Error during test:', error.message)
      results.push({
        name: test.name,
        url: test.url,
        success: false,
        error: error.message
      })
    }
  }

  // Print summary
  console.log('\n\n' + '='.repeat(80))
  console.log('📊 SUMMARY')
  console.log('='.repeat(80))

  const successful = results.filter(r => r.success)
  const withDescription = successful.filter(r => r.og_description_present)
  const artistMatches = successful.filter(r => r.artist_match)

  console.log(`\nTotal tests: ${results.length}`)
  console.log(`Successful OpenGraph + AI: ${successful.length}/${results.length}`)
  console.log(`With og_description: ${withDescription.length}/${successful.length}`)
  console.log(`Artist matches expected: ${artistMatches.length}/${successful.length}`)

  if (successful.length > 0) {
    const avgConfidence = successful.reduce((sum, r) => sum + (r.confidence || 0), 0) / successful.length
    console.log(`Average confidence: ${(avgConfidence * 100).toFixed(1)}%`)
  }

  console.log('\n📋 Detailed Results Table:')
  console.log('-'.repeat(80))
  console.table(results.map(r => ({
    Name: r.name,
    Success: r.success ? '✓' : '✗',
    'Has Description': r.og_description_present ? '✓' : '✗',
    'Artist Match': r.artist_match ? '✓' : '✗',
    'Confidence': r.confidence ? `${(r.confidence * 100).toFixed(0)}%` : 'N/A'
  })))

  console.log('\n💡 Key Findings:')
  console.log(`  • og_description was present in ${withDescription.length}/${successful.length} successful fetches`)
  console.log(`  • Artist extraction accuracy: ${(artistMatches.length / successful.length * 100).toFixed(1)}%`)
  console.log(`  • This demonstrates the value of TASK-658's og_description addition!`)

  return results
}

// Run the test
testRealExtraction()
  .then(results => {
    console.log('\n✅ Test complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })
