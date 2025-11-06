import { getSyncEngine } from './sync-engine'
import { getSupabaseClient } from './api-utils'
import { getNeynarService } from './neynar'

/**
 * Sync reactions for casts using efficient bulk polling with delta fetching
 *
 * NEW OPTIMIZED Strategy:
 * - Tiered time windows (recent = more frequent checks)
 * - Delta fetching (only fetch NEW reactions, not all reactions)
 * - Batch check reaction counts using fetchBulkCasts (50 CU per 100 casts)
 * - Only sync deltas for casts with changed counts (2 CU × delta)
 * - Update tracking table for optimization
 *
 * Cost breakdown with delta approach:
 * - Tier 1 (48hr, hourly): ~132K CU/month
 * - Tier 2 (7day, daily): ~14K CU/month
 * - Tier 3 (old, weekly): ~11K CU/month
 * - Total: ~157K CU/month (1.57% of 10M budget)
 */

interface SyncResult {
  castsChecked: number
  castsChanged: number
  reactionsAdded: number
  apiCalls: number
  duration: number
  errors: string[]
  tier: 'recent' | 'medium' | 'old'
}

interface CastToCheck {
  node_id: string  // This is the cast hash
  author_fid: number
  created_at: string
}

/**
 * Sync reactions for casts in a specific time window
 *
 * @param tier - Which time tier to sync:
 *   - 'recent': Last 48 hours (most active, check hourly)
 *   - 'medium': 48 hours - 7 days (check daily)
 *   - 'old': Older than 7 days (check weekly)
 */
export async function syncReactionsForTier(
  tier: 'recent' | 'medium' | 'old' = 'recent'
): Promise<SyncResult> {
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
    errors: [],
    tier
  }

  try {
    console.log(`[Likes Sync] Starting ${tier} tier sync...`)

    // 1. Determine time window based on tier
    const now = new Date()
    let startDate: Date
    let endDate: Date | null = null

    switch (tier) {
      case 'recent':
        // Last 48 hours
        startDate = new Date(now.getTime() - 48 * 60 * 60 * 1000)
        break
      case 'medium':
        // 48 hours to 7 days ago
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        endDate = new Date(now.getTime() - 48 * 60 * 60 * 1000)
        break
      case 'old':
        // Older than 7 days
        endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        // No startDate = all casts older than endDate
        break
    }

    // 2. Query casts in the time window
    let query = supabase
      .from('cast_nodes')
      .select('node_id, author_fid, created_at')
      .order('created_at', { ascending: false })

    if (tier === 'old') {
      // For old tier: get casts older than 7 days
      query = query.lt('created_at', endDate!.toISOString())
    } else if (tier === 'medium') {
      // For medium tier: get casts between 48hr and 7 days
      query = query
        .gte('created_at', startDate!.toISOString())
        .lt('created_at', endDate!.toISOString())
    } else {
      // For recent tier: get casts from last 48 hours
      query = query.gte('created_at', startDate!.toISOString())
    }

    const { data: casts, error: queryError } = await query

    if (queryError) {
      console.error(`[Likes Sync] Failed to query ${tier} casts:`, queryError)
      result.errors.push(`Query error: ${queryError.message}`)
      return result
    }

    if (!casts || casts.length === 0) {
      console.log(`[Likes Sync] No ${tier} casts found`)
      return result
    }

    console.log(`[Likes Sync] Found ${casts.length} ${tier} casts`)

    // 3. Batch casts into groups of 100
    const batches = chunkArray(casts as CastToCheck[], 100)
    console.log(`[Likes Sync] Processing ${batches.length} batches...`)

    // 4. Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]

      try {
        // 5. Get tracking data for this batch
        const castHashes = batch.map(c => c.node_id)
        const { data: trackingData } = await supabase
          .from('cast_likes_sync_status')
          .select('cast_hash, likes_count_at_sync, recasts_count_at_sync')
          .in('cast_hash', castHashes)

        // Build map of last known counts
        const trackingMap = new Map<string, { likes: number, recasts: number }>()
        trackingData?.forEach(t => {
          trackingMap.set(t.cast_hash, {
            likes: t.likes_count_at_sync || 0,
            recasts: t.recasts_count_at_sync || 0
          })
        })

        // 6. ONE bulk API call for up to 100 casts (50 CU)
        result.apiCalls++
        const bulkCasts = await neynar.fetchBulkCasts(castHashes)

        result.castsChecked += bulkCasts.length

        // 7. Detect casts with changed reaction counts AND calculate delta
        const changedCasts = bulkCasts
          .map(cast => {
            const currentLikes = cast.reactions?.likes_count || 0
            const currentRecasts = cast.reactions?.recasts_count || 0
            const lastKnown = trackingMap.get(cast.hash) || { likes: 0, recasts: 0 }

            const likesDelta = currentLikes - lastKnown.likes
            const recastsDelta = currentRecasts - lastKnown.recasts

            // Changed if either count changed (increased OR decreased)
            const hasChanged = likesDelta !== 0 || recastsDelta !== 0

            return {
              cast,
              currentLikes,
              currentRecasts,
              likesDelta,
              recastsDelta,
              hasChanged
            }
          })
          .filter(item => item.hasChanged)

        if (changedCasts.length > 0) {
          console.log(
            `[Likes Sync] Batch ${i + 1}/${batches.length}: ` +
            `${changedCasts.length}/${bulkCasts.length} casts have changed reactions`
          )
        }

        result.castsChanged += changedCasts.length

        // 8. Sync ONLY the delta reactions for changed casts
        for (const item of changedCasts) {
          const { cast, currentLikes, currentRecasts, likesDelta, recastsDelta } = item

          try {
            // Calculate how many NEW reactions to fetch
            const totalDelta = Math.abs(likesDelta) + Math.abs(recastsDelta)

            // If count decreased (someone unliked), we need to refetch all to reconcile
            // Otherwise, just fetch the delta
            const limit = (likesDelta < 0 || recastsDelta < 0)
              ? currentLikes + currentRecasts // Refetch all (sum both types!)
              : totalDelta // Just fetch new ones

            if (limit > 0) {
              result.apiCalls++
              const reactionsSynced = await syncEngine.syncCastReactions(
                cast.hash,
                cast.author.fid,
                {
                  limit,
                  currentLikesCount: currentLikes,
                  currentRecastsCount: currentRecasts
                }
              )
              result.reactionsAdded += reactionsSynced

              console.log(
                `[Likes Sync] ${cast.hash}: ` +
                `likes ${likesDelta > 0 ? '+' : ''}${likesDelta}, ` +
                `recasts ${recastsDelta > 0 ? '+' : ''}${recastsDelta} ` +
                `(limit: ${limit}, synced: ${reactionsSynced})`
              )
            }

          } catch (error) {
            const errMsg = `Failed to sync ${cast.hash}: ${error}`
            console.error('[Likes Sync]', errMsg)
            result.errors.push(errMsg)
          }
        }

        // 9. Update tracking for ALL casts in batch (changed + unchanged)
        // This marks them as "checked" even if unchanged
        const trackingUpdates = bulkCasts.map(cast => ({
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

      } catch (error) {
        const errMsg = `Batch ${i + 1} failed: ${error}`
        console.error('[Likes Sync]', errMsg)
        result.errors.push(errMsg)
      }
    }

    result.duration = Date.now() - startTime

    // Log final results
    console.log(
      `[Likes Sync] ✓ ${tier} tier complete: ${result.castsChecked} checked, ` +
      `${result.castsChanged} changed, ${result.reactionsAdded} reactions added, ` +
      `${result.apiCalls} API calls, ${result.duration}ms`
    )

    if (result.errors.length > 0) {
      console.error(`[Likes Sync] ${result.errors.length} errors occurred`)
    }

  } catch (error) {
    console.error(`[Likes Sync] Critical error in ${tier} tier:`, error)
    result.errors.push(`Critical error: ${error}`)
    result.duration = Date.now() - startTime
  }

  return result
}

/**
 * Legacy function for backward compatibility
 * Now delegates to tier-based sync
 */
export async function syncRecentCastReactions(): Promise<SyncResult> {
  return syncReactionsForTier('recent')
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
