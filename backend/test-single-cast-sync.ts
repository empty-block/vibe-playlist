/**
 * Test script to manually sync a single cast's reactions
 * This will trigger the comprehensive error logging to see WHY reactions fail to insert
 */

import { getSyncEngine } from './lib/sync-engine'

const TEST_CAST_HASH = '0x082097b59df84cef4e47bc78bf55f1d98e39ad1c' // Khruangbin cast
const VIEWER_FID = 3 // fredwilson.eth

async function main() {
  console.log('='.repeat(80))
  console.log('MANUAL CAST SYNC TEST - Debugging Missing Likes')
  console.log('='.repeat(80))
  console.log()
  console.log(`Cast: ${TEST_CAST_HASH}`)
  console.log(`Expected: ~206+ likes on Farcaster`)
  console.log(`Currently in DB: 88 likes`)
  console.log()
  console.log('Starting sync with comprehensive error logging...')
  console.log('='.repeat(80))
  console.log()

  const syncEngine = getSyncEngine()

  // Sync with a high limit to capture all reactions
  const reactionsAdded = await syncEngine.syncCastReactions(
    TEST_CAST_HASH,
    VIEWER_FID,
    {
      limit: 300 // High enough to get all reactions
    }
  )

  console.log()
  console.log('='.repeat(80))
  console.log(`SYNC COMPLETE: ${reactionsAdded} new reactions added`)
  console.log('='.repeat(80))
  console.log()
  console.log('Check the logs above for detailed failure information.')
  console.log()
}

main().catch((error) => {
  console.error('Fatal error during sync:', error)
  process.exit(1)
})
