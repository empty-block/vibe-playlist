import { getSupabaseClient } from '../lib/api-utils'

const supabase = getSupabaseClient()

console.log('🧹 Clearing ALL data from database...')
console.log('This will delete:')
console.log('  - All interaction_edges')
console.log('  - All cast_nodes')
console.log('  - All user_nodes')
console.log('  - All channel_sync_status')
console.log('')

// Step 1: Delete all interaction edges
console.log('Deleting interaction_edges...')
const { error: edgesError } = await supabase
  .from('interaction_edges')
  .delete()
  .in('edge_type', ['LIKED', 'RECASTED', 'REPLIED', 'AUTHORED'])  // Delete all edge types

if (edgesError) {
  console.error('Failed to delete interaction_edges:', edgesError)
} else {
  console.log('✓ Deleted all interaction_edges')
}

// Step 2: Delete all casts
console.log('Deleting cast_nodes...')
const { error: castsError } = await supabase
  .from('cast_nodes')
  .delete()
  .neq('node_id', 'IMPOSSIBLE_VALUE')  // Delete all rows

if (castsError) {
  console.error('Failed to delete cast_nodes:', castsError)
} else {
  console.log('✓ Deleted all cast_nodes')
}

// Step 3: Delete all users
console.log('Deleting user_nodes...')
const { error: usersError } = await supabase
  .from('user_nodes')
  .delete()
  .neq('node_id', 'IMPOSSIBLE_VALUE')  // Delete all rows

if (usersError) {
  console.error('Failed to delete user_nodes:', usersError)
} else {
  console.log('✓ Deleted all user_nodes')
}

// Step 4: Delete all sync status
console.log('Deleting channel_sync_status...')
const { error: syncError } = await supabase
  .from('channel_sync_status')
  .delete()
  .neq('channel_id', 'IMPOSSIBLE_VALUE')  // Delete all rows

if (syncError) {
  console.error('Failed to delete channel_sync_status:', syncError)
} else {
  console.log('✓ Deleted all channel_sync_status')
}

console.log('')
console.log('✅ Database cleared! Ready for fresh sync.')
