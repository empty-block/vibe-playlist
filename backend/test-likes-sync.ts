/**
 * Test script for the optimized likes sync worker
 *
 * Usage:
 *   bun run backend/test-likes-sync.ts [tier]
 *
 * Examples:
 *   bun run backend/test-likes-sync.ts recent
 *   bun run backend/test-likes-sync.ts medium
 *   bun run backend/test-likes-sync.ts old
 *   bun run backend/test-likes-sync.ts all
 */

import { syncReactionsForTier } from './lib/likes-sync-worker'

async function main() {
  const tier = (process.argv[2] || 'recent') as 'recent' | 'medium' | 'old' | 'all'

  console.log('='.repeat(60))
  console.log('LIKES SYNC TEST - TASK-718')
  console.log('='.repeat(60))
  console.log()

  if (tier === 'all') {
    console.log('Testing all tiers...\n')

    console.log('--- Tier 1: Recent (last 48 hours) ---')
    const tier1Result = await syncReactionsForTier('recent')
    printResult(tier1Result)

    console.log('\n--- Tier 2: Medium (48hr - 7 days) ---')
    const tier2Result = await syncReactionsForTier('medium')
    printResult(tier2Result)

    console.log('\n--- Tier 3: Old (older than 7 days) ---')
    const tier3Result = await syncReactionsForTier('old')
    printResult(tier3Result)

    console.log('\n' + '='.repeat(60))
    console.log('COMBINED RESULTS')
    console.log('='.repeat(60))
    console.log(`Total casts checked: ${tier1Result.castsChecked + tier2Result.castsChecked + tier3Result.castsChecked}`)
    console.log(`Total casts changed: ${tier1Result.castsChanged + tier2Result.castsChanged + tier3Result.castsChanged}`)
    console.log(`Total reactions added: ${tier1Result.reactionsAdded + tier2Result.reactionsAdded + tier3Result.reactionsAdded}`)
    console.log(`Total API calls: ${tier1Result.apiCalls + tier2Result.apiCalls + tier3Result.apiCalls}`)
    console.log(`Total duration: ${tier1Result.duration + tier2Result.duration + tier3Result.duration}ms`)
    console.log()

    // Cost estimation
    const totalCalls = tier1Result.apiCalls + tier2Result.apiCalls + tier3Result.apiCalls
    const tier1Monthly = tier1Result.apiCalls * 24 * 30 // hourly
    const tier2Monthly = tier2Result.apiCalls * 30 // daily
    const tier3Monthly = tier3Result.apiCalls * 4 // weekly (4 weeks/month)
    const totalMonthly = tier1Monthly + tier2Monthly + tier3Monthly

    console.log('ESTIMATED MONTHLY API CALLS:')
    console.log(`  Tier 1 (hourly): ${tier1Monthly.toLocaleString()} calls`)
    console.log(`  Tier 2 (daily): ${tier2Monthly.toLocaleString()} calls`)
    console.log(`  Tier 3 (weekly): ${tier3Monthly.toLocaleString()} calls`)
    console.log(`  TOTAL: ${totalMonthly.toLocaleString()} calls/month`)
    console.log()

    // Neynar credit estimation (rough - needs actual API response to be precise)
    // Bulk calls: 50 CU each
    // Individual calls: 2 CU × limit
    console.log('NOTE: Actual Neynar CU cost depends on delta sizes')
    console.log('Use the logged "limit" values to calculate precise costs')

  } else {
    console.log(`Testing tier: ${tier}\n`)
    const result = await syncReactionsForTier(tier)
    printResult(result)

    // Cost estimation for single tier
    let runsPerMonth: number
    let schedule: string

    switch (tier) {
      case 'recent':
        runsPerMonth = 24 * 30 // hourly
        schedule = 'hourly'
        break
      case 'medium':
        runsPerMonth = 30 // daily
        schedule = 'daily'
        break
      case 'old':
        runsPerMonth = 4 // weekly
        schedule = 'weekly'
        break
    }

    const monthlyApiCalls = result.apiCalls * runsPerMonth

    console.log('\n' + '='.repeat(60))
    console.log(`ESTIMATED MONTHLY USAGE (${schedule})`)
    console.log('='.repeat(60))
    console.log(`API calls per run: ${result.apiCalls}`)
    console.log(`Runs per month: ${runsPerMonth}`)
    console.log(`Total monthly API calls: ${monthlyApiCalls.toLocaleString()}`)
    console.log()
  }

  console.log('='.repeat(60))
  console.log('Test complete!')
  console.log('='.repeat(60))
}

function printResult(result: any) {
  console.log(`Tier: ${result.tier}`)
  console.log(`Casts checked: ${result.castsChecked}`)
  console.log(`Casts changed: ${result.castsChanged}`)
  console.log(`Reactions added: ${result.reactionsAdded}`)
  console.log(`API calls: ${result.apiCalls}`)
  console.log(`Duration: ${result.duration}ms`)

  if (result.errors.length > 0) {
    console.log(`\n⚠️  Errors: ${result.errors.length}`)
    result.errors.forEach((err: string, i: number) => {
      console.log(`  ${i + 1}. ${err}`)
    })
  } else {
    console.log('✓ No errors')
  }
}

main().catch(console.error)
