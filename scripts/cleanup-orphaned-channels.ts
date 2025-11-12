/**
 * Script to cleanup orphaned cast nodes from unofficial channels
 * Run with: bun run scripts/cleanup-orphaned-channels.ts [--dry-run]
 *
 * This script removes cast_nodes that reference channels not in our official list.
 * Use --dry-run to preview what will be deleted without making changes.
 */

import { getSupabaseClient } from '../backend/lib/api-utils'

const supabase = getSupabaseClient()

interface OrphanedChannelStats {
  channel: string
  count: number
}

async function cleanupOrphanedChannels(dryRun: boolean) {
  console.log(`🧹 Starting orphaned channels cleanup ${dryRun ? '(DRY RUN)' : ''}...\n`)

  // 1. Get official channel list
  console.log('📋 Fetching official channels list...')
  const { data: officialChannels, error: channelsError } = await supabase
    .from('channels')
    .select('id, name')
    .eq('is_visible', true)

  if (channelsError) {
    console.error('❌ Error fetching official channels:', channelsError)
    process.exit(1)
  }

  if (!officialChannels || officialChannels.length === 0) {
    console.error('❌ No official channels found in database')
    process.exit(1)
  }

  const officialIds = officialChannels.map(c => c.id)
  console.log(`✅ Found ${officialIds.length} official channels:`)
  officialIds.forEach(id => console.log(`  - ${id}`))
  console.log()

  // 2. Find orphaned channels
  console.log('🔍 Finding orphaned cast nodes...')

  // Query for cast_nodes with channels NOT in official list
  const { data: orphanedNodes, error: orphanedError } = await supabase
    .from('cast_nodes')
    .select('node_id, channel, cast_text, created_at')
    .not('channel', 'is', null)
    .not('channel', 'in', `(${officialIds.join(',')})`)

  if (orphanedError) {
    console.error('❌ Error fetching orphaned nodes:', orphanedError)
    process.exit(1)
  }

  if (!orphanedNodes || orphanedNodes.length === 0) {
    console.log('✅ No orphaned cast nodes found!')
    console.log('   All cast nodes belong to official channels.')
    process.exit(0)
  }

  // 3. Group and count by channel
  const channelStats: Record<string, OrphanedChannelStats> = {}
  orphanedNodes.forEach(node => {
    if (!channelStats[node.channel]) {
      channelStats[node.channel] = { channel: node.channel, count: 0 }
    }
    channelStats[node.channel].count++
  })

  const sortedStats = Object.values(channelStats).sort((a, b) => b.count - a.count)

  console.log(`\n⚠️  Found ${orphanedNodes.length} orphaned cast nodes across ${sortedStats.length} channels:\n`)
  console.table(sortedStats)

  // Show sample casts
  console.log('\n📝 Sample orphaned casts (first 5):')
  orphanedNodes.slice(0, 5).forEach((node, i) => {
    console.log(`\n${i + 1}. Channel: ${node.channel}`)
    console.log(`   Hash: ${node.node_id}`)
    console.log(`   Date: ${new Date(node.created_at).toLocaleString()}`)
    console.log(`   Text: ${node.cast_text.substring(0, 100)}${node.cast_text.length > 100 ? '...' : ''}`)
  })

  if (dryRun) {
    console.log('\n🔍 DRY RUN - No changes made')
    console.log(`   Would delete: ${orphanedNodes.length} cast nodes`)
    console.log(`   Affected channels: ${sortedStats.map(s => s.channel).join(', ')}`)
    console.log('\n💡 Run without --dry-run to execute cleanup')
    process.exit(0)
  }

  // 4. Confirm deletion (wait for user input if interactive)
  console.log('\n⚠️  WARNING: This will permanently delete these cast nodes!')
  console.log(`   Total nodes to delete: ${orphanedNodes.length}`)
  console.log(`   Channels affected: ${sortedStats.length}`)
  console.log('\n   Proceeding in 5 seconds... (Ctrl+C to cancel)')

  await new Promise(resolve => setTimeout(resolve, 5000))

  // 5. Delete orphaned cast nodes by channel
  console.log('\n🗑️  Deleting orphaned cast nodes...')

  let totalDeleted = 0

  // Delete by channel to avoid query complexity issues
  for (const { channel } of sortedStats) {
    const { error: deleteError, count } = await supabase
      .from('cast_nodes')
      .delete()
      .eq('channel', channel)

    if (deleteError) {
      console.error(`  ❌ Error deleting channel "${channel}":`, deleteError)
      continue
    }

    totalDeleted += count || 0
    console.log(`  ✅ Deleted ${count || 0} nodes from "${channel}"`)
  }

  console.log(`\n  ✅ Total deleted: ${totalDeleted} orphaned cast nodes`)

  // 6. Clean up orphaned edges (interaction_edges)
  console.log('\n🧹 Cleaning up orphaned interaction edges...')

  const { error: edgesError, count: edgesCount } = await supabase
    .from('interaction_edges')
    .delete()
    .not('cast_id', 'in', `(SELECT node_id FROM cast_nodes)`)

  if (edgesError) {
    console.log(`  ⚠️  Could not clean up interaction edges: ${edgesError.message}`)
  } else {
    console.log(`  ✅ Deleted ${edgesCount || 0} orphaned interaction edges`)
  }

  // 7. Clean up orphaned music edges (cast_music_edges)
  console.log('\n🧹 Cleaning up orphaned music edges...')

  // First, check the schema to find the correct column name
  const { data: sampleMusicEdge } = await supabase
    .from('cast_music_edges')
    .select('*')
    .limit(1)

  let musicCount = 0
  if (sampleMusicEdge && sampleMusicEdge.length > 0) {
    const castIdColumn = 'cast_id' in sampleMusicEdge[0] ? 'cast_id' : 'cast_hash'

    const { error: musicError, count } = await supabase
      .from('cast_music_edges')
      .delete()
      .not(castIdColumn, 'in', `(SELECT node_id FROM cast_nodes)`)

    musicCount = count || 0

    if (musicError) {
      console.log(`  ⚠️  Could not clean up music edges: ${musicError.message}`)
    } else {
      console.log(`  ✅ Deleted ${musicCount} orphaned music edges`)
    }
  } else {
    console.log(`  ℹ️  No music edges found (table may be empty)`)
  }

  // 8. Summary
  console.log('\n📊 Cleanup Summary:')
  console.log(`  ✅ Deleted cast nodes: ${totalDeleted}`)
  console.log(`  ✅ Deleted interaction edges: ${edgesCount || 0}`)
  console.log(`  ✅ Deleted music edges: ${musicCount}`)
  console.log(`  🗑️  Total records deleted: ${totalDeleted + (edgesCount || 0) + musicCount}`)

  console.log('\n✅ Orphaned channels cleanup complete!')
}

// Parse command line arguments
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')

cleanupOrphanedChannels(dryRun)
  .then(() => {
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Unexpected error:', err)
    process.exit(1)
  })
