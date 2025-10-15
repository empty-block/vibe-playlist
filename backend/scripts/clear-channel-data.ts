import { getSupabaseClient } from '../lib/api-utils'

/**
 * Clear all data for a specific channel
 * This will delete:
 * - All casts in the channel
 * - AUTHORED interactions for those casts
 * - Sync status for the channel
 */

const channelId = process.argv[2]

if (!channelId) {
  console.error('Usage: bun run scripts/clear-channel-data.ts <channelId>')
  process.exit(1)
}

const supabase = getSupabaseClient()

console.log(`Clearing all data for channel: ${channelId}`)

// Step 1: Get all cast hashes for this channel
const { data: casts, error: fetchError } = await supabase
  .from('cast_nodes')
  .select('node_id')
  .eq('channel', channelId)

if (fetchError) {
  console.error('Failed to fetch casts:', fetchError)
  process.exit(1)
}

console.log(`Found ${casts?.length || 0} casts to delete`)

if (casts && casts.length > 0) {
  const castHashes = casts.map(c => c.node_id)

  // Step 2: Delete AUTHORED interactions for these casts
  const { error: interactionError } = await supabase
    .from('interaction_edges')
    .delete()
    .in('cast_id', castHashes)
    .eq('edge_type', 'AUTHORED')

  if (interactionError) {
    console.error('Failed to delete interactions:', interactionError)
  } else {
    console.log(`Deleted AUTHORED interactions`)
  }

  // Step 3: Delete the casts themselves
  const { error: castError } = await supabase
    .from('cast_nodes')
    .delete()
    .eq('channel', channelId)

  if (castError) {
    console.error('Failed to delete casts:', castError)
  } else {
    console.log(`Deleted ${casts.length} casts`)
  }
}

// Step 4: Delete sync status
const { error: syncError } = await supabase
  .from('channel_sync_status')
  .delete()
  .eq('channel_id', channelId)

if (syncError) {
  console.error('Failed to delete sync status:', syncError)
} else {
  console.log(`Deleted sync status`)
}

console.log(`✅ Cleared all data for channel: ${channelId}`)
