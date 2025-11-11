/**
 * Test syncing with NO LIMIT to get ALL reactions
 */

import { getSyncEngine } from './lib/sync-engine'

const TEST_CAST_HASH = '0x082097b59df84cef4e47bc78bf55f1d98e39ad1c'
const VIEWER_FID = 3

async function main() {
  console.log('Testing sync with NO limit (should get all reactions)...')
  console.log()

  const syncEngine = getSyncEngine()

  // Sync with NO limit - should paginate until we get everything
  const reactionsAdded = await syncEngine.syncCastReactions(
    TEST_CAST_HASH,
    VIEWER_FID,
    {
      limit: 999999 // Effectively unlimited
    }
  )

  console.log()
  console.log(`Sync complete: ${reactionsAdded} reactions added`)
}

main().catch(console.error)
