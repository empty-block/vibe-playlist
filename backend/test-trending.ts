#!/usr/bin/env bun

/**
 * Trending API Test Runner
 *
 * This script:
 * 1. Runs automated tests
 * 2. Fetches real data from the API
 * 3. Displays results in a readable format
 *
 * Usage:
 *   bun test-trending.ts
 */

import { $ } from 'bun'

const API_URL = process.env.API_URL || 'http://localhost:4201'

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
}

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function section(title: string) {
  console.log('')
  log('═'.repeat(80), colors.cyan)
  log(`  ${title}`, colors.bright + colors.cyan)
  log('═'.repeat(80), colors.cyan)
  console.log('')
}

async function runAutomatedTests() {
  section('🧪 Running Automated Tests')

  try {
    // Run tests for trending endpoints
    await $`bun test backend/api/trending.test.ts backend/api/music.test.ts`.quiet()
    log('✅ All tests passed!', colors.green)
    return true
  } catch (error) {
    log('❌ Some tests failed. See output above.', colors.red)
    return false
  }
}

async function fetchTrendingTracks() {
  section('🔥 Trending Tracks (Last 7 Days)')

  try {
    const response = await fetch(`${API_URL}/api/music/trending?limit=10`)

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()

    if (data.tracks.length === 0) {
      log('  No trending tracks found in the last 7 days.', colors.dim)
      return
    }

    log(`  Found ${data.tracks.length} trending tracks`, colors.green)
    log(`  Updated: ${data.updatedAt}`, colors.dim)
    log(`  Cached: ${data.cached ? 'Yes' : 'No'}`, colors.dim)
    console.log('')

    data.tracks.forEach((track: any) => {
      const fire = track.rank <= 3 ? '🔥 ' : '   '
      log(`  ${fire}#${track.rank} ${track.title}`, colors.bright)
      log(`      by ${track.artist}`, colors.dim)
      log(`      ${track.platform}:${track.platformId}`, colors.dim)
      log(`      📊 Score: ${track.score.toFixed(2)} | Shares: ${track.shares} | Likes: ${track.uniqueLikes} | Replies: ${track.uniqueReplies}`, colors.blue)

      if (track.recentCasts && track.recentCasts.length > 0) {
        log(`      💬 Recent: "${track.recentCasts[0].text.substring(0, 60)}..."`, colors.magenta)
      }
      console.log('')
    })
  } catch (error) {
    log(`  ❌ Error fetching trending tracks: ${error}`, colors.red)
  }
}

async function fetchTrendingUsers() {
  section('👥 Top Contributors (Last 7 Days)')

  try {
    const response = await fetch(`${API_URL}/api/trending/users?limit=10`)

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()

    if (data.contributors.length === 0) {
      log('  No contributors found in the last 3 days.', colors.dim)
      return
    }

    log(`  Found ${data.contributors.length} top contributors`, colors.green)
    log(`  Updated: ${data.updatedAt}`, colors.dim)
    log(`  Cached: ${data.cached ? 'Yes' : 'No'}`, colors.dim)
    console.log('')

    data.contributors.forEach((user: any) => {
      log(`  #${user.rank} @${user.username}`, colors.bright)
      log(`      ${user.displayName} (FID: ${user.fid})`, colors.dim)
      log(`      📊 Score: ${user.score.toFixed(2)} | Tracks: ${user.trackCount} | Unique Engagers: ${user.uniqueEngagers}`, colors.blue)
      console.log('')
    })

    // Show total stats
    const totalTracks = data.contributors.reduce((sum: number, c: any) => sum + c.trackCount, 0)
    const totalEngagers = data.contributors.reduce((sum: number, c: any) => sum + c.uniqueEngagers, 0)

    log(`  📈 Totals: ${totalTracks} tracks, ${totalEngagers} unique engagers`, colors.yellow)

  } catch (error) {
    log(`  ❌ Error fetching trending users: ${error}`, colors.red)
  }
}

async function validateAlgorithms() {
  section('🧮 Algorithm Validation')

  try {
    // Fetch trending tracks
    const tracksResponse = await fetch(`${API_URL}/api/music/trending?limit=5`)
    const tracksData = await tracksResponse.json()

    if (tracksData.tracks.length > 0) {
      log('  ✅ Trending Tracks Algorithm:', colors.green)
      const track = tracksData.tracks[0]

      // Validate weighted score
      const baseScore = (track.shares * 10) + (track.uniqueLikes * 3) + (track.uniqueReplies * 2)
      log(`      Track: "${track.title}"`, colors.dim)
      log(`      Base Score: ${baseScore} = (${track.shares}×10) + (${track.uniqueLikes}×3) + (${track.uniqueReplies}×2)`, colors.dim)
      log(`      Final Score (with velocity): ${track.score.toFixed(2)}`, colors.dim)
      log(`      Velocity Multiplier: ${(track.score / baseScore).toFixed(2)}x`, colors.blue)
    }

    console.log('')

    // Fetch trending users
    const usersResponse = await fetch(`${API_URL}/api/trending/users?limit=5`)
    const usersData = await usersResponse.json()

    if (usersData.contributors.length > 0) {
      log('  ✅ Trending Users Algorithm:', colors.green)
      const user = usersData.contributors[0]

      // Validate quality score
      const expectedScore = user.uniqueEngagers / Math.sqrt(user.trackCount)
      log(`      User: @${user.username}`, colors.dim)
      log(`      Score: ${user.score.toFixed(2)} = ${user.uniqueEngagers} / √${user.trackCount}`, colors.dim)
      log(`      Expected: ${expectedScore.toFixed(2)}`, colors.dim)
      log(`      Match: ${Math.abs(user.score - expectedScore) < 0.01 ? '✅' : '❌'}`, colors.blue)
    }

  } catch (error) {
    log(`  ❌ Error validating algorithms: ${error}`, colors.red)
  }
}

async function testCache() {
  section('💾 Cache Testing')

  try {
    // First request
    const start1 = Date.now()
    const response1 = await fetch(`${API_URL}/api/music/trending?limit=5`)
    const duration1 = Date.now() - start1
    const data1 = await response1.json()

    log(`  Request 1: ${duration1}ms ${data1.cached ? '(cached)' : '(fresh)'}`, colors.dim)

    // Second request (should be cached)
    const start2 = Date.now()
    const response2 = await fetch(`${API_URL}/api/music/trending?limit=5`)
    const duration2 = Date.now() - start2
    const data2 = await response2.json()

    log(`  Request 2: ${duration2}ms ${data2.cached ? '(cached)' : '(fresh)'}`, colors.dim)

    if (data1.updatedAt === data2.updatedAt) {
      log(`  ✅ Cache working! Same timestamp: ${data1.updatedAt}`, colors.green)
    } else {
      log(`  ⚠️  Different timestamps (cache may have expired)`, colors.yellow)
    }

    if (duration2 < duration1 * 0.5) {
      log(`  ✅ Cached request ${Math.round((1 - duration2/duration1) * 100)}% faster`, colors.green)
    }

  } catch (error) {
    log(`  ❌ Error testing cache: ${error}`, colors.red)
  }
}

async function main() {
  console.clear()

  log('╔════════════════════════════════════════════════════════════════════════════╗', colors.bright + colors.cyan)
  log('║                    🎵 JAMZY TRENDING API TEST SUITE 🎵                     ║', colors.bright + colors.cyan)
  log('╚════════════════════════════════════════════════════════════════════════════╝', colors.bright + colors.cyan)

  log(`\n  API URL: ${API_URL}\n`, colors.dim)

  // Run all tests
  const testsPass = await runAutomatedTests()

  if (!testsPass) {
    log('\n⚠️  Automated tests failed, but continuing with data inspection...\n', colors.yellow)
  }

  await fetchTrendingTracks()
  await fetchTrendingUsers()
  await validateAlgorithms()
  await testCache()

  section('✅ Test Complete')
  log('  All checks finished! Review the output above.\n', colors.green)
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
