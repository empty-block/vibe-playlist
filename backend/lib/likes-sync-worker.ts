import { getSyncEngine } from './sync-engine'
import { getSupabaseClient } from './api-utils'
import { getNeynarService } from './neynar'

/**
 * Sync reactions for recent casts using efficient bulk polling
 *
 * Strategy:
 * - Query casts from last 7 days
 * - Batch check reaction counts using fetchBulkCasts (1 API call per 100 casts)
 * - Only sync full reactions for casts with changed counts
 * - Update tracking table for optimization
 *
 * Runs every 5 minutes:
 * - ~650 casts = 7 bulk API calls
 * - ~5-10% changed = 30-60 detail calls
 * - Total: ~40 API calls per run = 8 calls/min average
 */

interface SyncResult {
  castsChecked: number
  castsChanged: number
  reactionsAdded: number
  apiCalls: number
  duration: number
  errors: string[]
}

interface CastToCheck {
  node_id: string  // This is the cast hash
  author_fid: number
  last_known_likes?: number
  last_known_recasts?: number
}

/**
 * Main entry point for likes sync worker
 */
export async function syncRecentCastReactions(): Promise<SyncResult> {
  const startTime = Date.now()
  const supabase = getSupabaseClient()
  const syncEngine = getSyncEngine()
  const neynar = getNeynarService()

  const result: SyncResult = {
    castsChecked: 0,
    castsChanged: 0,
    reactionsAdded: 0,
    apiCalls: 0,
    duration: 0,
    errors: []
  }

  try {
    console.log('[Likes Sync] Starting bulk reaction sync...')

    // 1. Query recent casts from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentCasts, error: queryError } = await supabase
      .from('cast_nodes')
      .select('node_id, author_fid')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (queryError) {
      console.error('[Likes Sync] Failed to query recent casts:', queryError)
      result.errors.push(`Query error: ${queryError.message}`)
      return result
    }

    if (!recentCasts || recentCasts.length === 0) {
      console.log('[Likes Sync] No recent casts found')
      return result
    }

    console.log(`[Likes Sync] Found ${recentCasts.length} casts from last 7 days`)

    // 2. Batch casts into groups of 100
    const batches = chunkArray(recentCasts as CastToCheck[], 100)
    console.log(`[Likes Sync] Processing ${batches.length} batches of casts...`)

    // 3. Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]

      try {
        // 4. Get tracking data for this batch
        const castHashes = batch.map(c => c.node_id)
        const { data: trackingData } = await supabase
          .from('cast_likes_sync_status')
          .select('cast_hash, likes_count_at_sync, recasts_count_at_sync')
          .in('cast_hash', castHashes)

        // Build map of last known counts (default to 0)
        const trackingMap = new Map<string, { likes: number, recasts: number }>()
        trackingData?.forEach(t => {
          trackingMap.set(t.cast_hash, {
            likes: t.likes_count_at_sync || 0,
            recasts: t.recasts_count_at_sync || 0
          })
        })

        // 5. ONE bulk API call for up to 100 casts
        result.apiCalls++
        const bulkCasts = await neynar.fetchBulkCasts(castHashes)

        result.castsChecked += bulkCasts.length

        // 6. Detect casts with changed reaction counts
        const changedCasts = bulkCasts.filter(cast => {
          const currentLikes = cast.reactions?.likes_count || 0
          const currentRecasts = cast.reactions?.recasts_count || 0
          const lastKnown = trackingMap.get(cast.hash) || { likes: 0, recasts: 0 }

          return currentLikes > lastKnown.likes || currentRecasts > lastKnown.recasts
        })

        if (changedCasts.length > 0) {
          console.log(
            `[Likes Sync] Batch ${i + 1}/${batches.length}: ` +
            `${changedCasts.length}/${bulkCasts.length} casts have new reactions`
          )
        }

        result.castsChanged += changedCasts.length

        // 7. Sync full reactions ONLY for changed casts
        for (const cast of changedCasts) {
          try {
            result.apiCalls++
            const reactionsSynced = await syncEngine.syncCastReactions(
              cast.hash,
              cast.author.fid
            )
            result.reactionsAdded += reactionsSynced

            // 8. Update tracking table
            const newLikes = cast.reactions?.likes_count || 0
            const newRecasts = cast.reactions?.recasts_count || 0

            await supabase
              .from('cast_likes_sync_status')
              .upsert({
                cast_hash: cast.hash,
                last_sync_at: new Date().toISOString(),
                likes_count_at_sync: newLikes,
                recasts_count_at_sync: newRecasts,
                updated_at: new Date().toISOString()
              })

          } catch (error) {
            const errMsg = `Failed to sync ${cast.hash}: ${error}`
            console.error('[Likes Sync]', errMsg)
            result.errors.push(errMsg)
          }
        }

        // 9. Update tracking for unchanged casts too (mark as checked)
        const unchangedCasts = bulkCasts.filter(cast =>
          !changedCasts.find(c => c.hash === cast.hash)
        )

        if (unchangedCasts.length > 0) {
          const trackingUpdates = unchangedCasts.map(cast => ({
            cast_hash: cast.hash,
            last_sync_at: new Date().toISOString(),
            likes_count_at_sync: cast.reactions?.likes_count || 0,
            recasts_count_at_sync: cast.reactions?.recasts_count || 0,
            updated_at: new Date().toISOString()
          }))

          const { error: trackingError } = await supabase
            .from('cast_likes_sync_status')
            .upsert(trackingUpdates)

          if (trackingError) {
            console.warn('[Likes Sync] Failed to update tracking:', trackingError.message)
          }
        }

      } catch (error) {
        const errMsg = `Batch ${i + 1} failed: ${error}`
        console.error('[Likes Sync]', errMsg)
        result.errors.push(errMsg)
      }
    }

    result.duration = Date.now() - startTime

    // Log final results
    console.log(
      `[Likes Sync] ✓ Complete: ${result.castsChecked} checked, ` +
      `${result.castsChanged} changed, ${result.reactionsAdded} reactions added, ` +
      `${result.apiCalls} API calls, ${result.duration}ms`
    )

    if (result.errors.length > 0) {
      console.error(`[Likes Sync] ${result.errors.length} errors occurred`)
    }

  } catch (error) {
    console.error('[Likes Sync] Critical error:', error)
    result.errors.push(`Critical error: ${error}`)
    result.duration = Date.now() - startTime
  }

  return result
}

/**
 * Utility: Split array into chunks of specified size
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}
