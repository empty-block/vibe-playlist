import { getSyncEngine } from './sync-engine'
import { getSupabaseClient } from './api-utils'

/**
 * Sync all active channels periodically (cron job)
 *
 * Efficient implementation:
 * - Only processes NEW casts since last sync (incremental)
 * - Most channels won't have new casts → quick check and skip
 * - Only does work when there ARE new casts
 *
 * With 9 channels:
 * - Most runs: 0-2 new casts across all channels
 * - Busy times: 5-10 new casts
 * - Neynar API: 9 requests/min (well within limits)
 */
export async function syncAllChannels(): Promise<{
  channelsSynced: number
  totalNewCasts: number
  errors: string[]
}> {
  const supabase = getSupabaseClient()
  const syncEngine = getSyncEngine()

  // Get all active, visible channels
  const { data: channels, error } = await supabase
    .from('channels')
    .select('id, name')
    .eq('is_archived', false)
    .eq('is_visible', true)
    .order('name')

  if (error || !channels) {
    console.error('[Channel Sync] Failed to fetch channels:', error)
    return {
      channelsSynced: 0,
      totalNewCasts: 0,
      errors: [error?.message || 'No channels found']
    }
  }

  console.log(`[Channel Sync] Syncing ${channels.length} channels...`)

  let totalNewCasts = 0
  const errors: string[] = []

  // Sync each channel (incremental - only processes NEW casts)
  for (const channel of channels) {
    try {
      const result = await syncEngine.syncChannel(channel.id, {
        limit: 25  // Small batch for frequent syncs
      })

      if (result.newCasts > 0) {
        console.log(`[Channel Sync] ${channel.name}: ${result.newCasts} new casts`)
      }

      totalNewCasts += result.newCasts

      if (!result.success) {
        errors.push(...result.errors.map(e => `${channel.id}: ${e}`))
      }
    } catch (error) {
      const msg = `${channel.id}: ${error}`
      console.error('[Channel Sync]', msg)
      errors.push(msg)
    }
  }

  console.log(
    `[Channel Sync] Complete: ${channels.length} channels synced, ` +
    `${totalNewCasts} new casts, ${errors.length} errors`
  )

  return {
    channelsSynced: channels.length,
    totalNewCasts,
    errors
  }
}
