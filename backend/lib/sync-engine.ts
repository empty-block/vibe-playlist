import { getNeynarService } from './neynar'
import { getSupabaseClient } from './api-utils'

/**
 * Sync Engine - Orchestrates syncing Farcaster casts from Neynar to database
 *
 * Implements incremental processing: only syncs new casts since last sync.
 * Uses upsert pattern for duplicate-safe operations.
 */
export class SyncEngine {
  private neynar = getNeynarService()
  private supabase = getSupabaseClient()

  /**
   * Sync a channel's casts from Neynar
   *
   * @param channelId - The channel to sync (e.g., 'hip-hop')
   * @param options - Optional sync parameters
   * @returns Sync result with counts and status
   */
  async syncChannel(
    channelId: string,
    options?: {
      limit?: number
      forceFullSync?: boolean
    }
  ): Promise<{
    success: boolean
    castsProcessed: number
    newCasts: number
    errors: string[]
  }> {
    const startTime = Date.now()
    const errors: string[] = []
    let castsProcessed = 0
    let newCasts = 0

    try {
      console.log(`[Sync] Starting sync for channel: ${channelId}`)

      // Step 1: Get latest cast timestamp from our database
      let lastSyncTimestamp: string | null = null

      if (!options?.forceFullSync) {
        const { data: latestCast } = await this.supabase
          .from('cast_nodes')
          .select('created_at')
          .eq('channel', channelId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        lastSyncTimestamp = latestCast?.created_at || null
        console.log(`[Sync] Last synced cast timestamp: ${lastSyncTimestamp || 'none (first sync)'}`)
      }

      // Step 2: Fetch casts from Neynar
      const limit = options?.limit || 50
      const { casts, nextCursor } = await this.neynar.fetchChannelFeed(channelId, { limit })

      console.log(`[Sync] Fetched ${casts.length} casts from Neynar`)

      // Step 3: Filter to only NEW casts (if we have a last sync timestamp)
      let castsToProcess = casts

      if (lastSyncTimestamp) {
        const lastSync = new Date(lastSyncTimestamp).getTime()
        castsToProcess = casts.filter(cast => {
          const castTime = new Date(cast.timestamp).getTime()
          return castTime > lastSync
        })
        console.log(`[Sync] Filtered to ${castsToProcess.length} new casts since last sync`)
      }

      // Step 4: Process each cast
      for (const cast of castsToProcess) {
        try {
          await this.processCast(cast, channelId)
          newCasts++
        } catch (error) {
          const errorMsg = `Failed to process cast ${cast.hash}: ${error}`
          console.error(`[Sync] ${errorMsg}`)
          errors.push(errorMsg)
        }
        castsProcessed++
      }

      // Step 5: Update sync status
      await this.updateSyncStatus(channelId, {
        lastSyncAt: new Date().toISOString(),
        castsProcessed: newCasts,
        success: errors.length === 0
      })

      const duration = Date.now() - startTime
      console.log(
        `[Sync] Completed sync for ${channelId} in ${duration}ms: ` +
        `${newCasts} new casts, ${errors.length} errors`
      )

      return {
        success: errors.length === 0,
        castsProcessed,
        newCasts,
        errors
      }
    } catch (error) {
      const errorMsg = `Channel sync failed: ${error}`
      console.error(`[Sync] ${errorMsg}`)
      return {
        success: false,
        castsProcessed,
        newCasts,
        errors: [errorMsg, ...errors]
      }
    }
  }

  /**
   * Process a single cast - upsert to database
   *
   * @param cast - Cast data from Neynar
   * @param channelId - Channel this cast belongs to
   */
  private async processCast(cast: any, channelId: string): Promise<void> {
    const castData = {
      cast_hash: cast.hash,
      cast_text: cast.text,
      created_at: cast.timestamp,
      channel: channelId,
      parent_cast_hash: cast.parent_hash || null,
      root_parent_hash: cast.root_parent_url ? this.extractHashFromUrl(cast.root_parent_url) : null,
      author: {
        fid: cast.author.fid.toString(),
        username: cast.author.username,
        display_name: cast.author.display_name,
        avatar_url: cast.author.pfp_url
      },
      embeds: cast.embeds || []
    }

    // Debug: log first cast
    if (!this.hasLoggedCast) {
      console.log('[Sync] Sample cast data being sent to DB:', JSON.stringify(castData, null, 2))
      this.hasLoggedCast = true
    }

    // Call database upsert function
    const { data, error } = await this.supabase.rpc('upsert_cast_from_neynar', {
      cast_data: castData
    })

    if (error) {
      throw new Error(`Database upsert failed: ${error.message}`)
    }
  }

  private hasLoggedCast = false

  /**
   * Extract cast hash from Warpcast URL
   */
  private extractHashFromUrl(url: string): string | null {
    // URL format: https://warpcast.com/username/0x123abc...
    const match = url.match(/\/(0x[a-fA-F0-9]+)/)
    return match ? match[1] : null
  }

  /**
   * Update sync status tracking table
   */
  private async updateSyncStatus(
    channelId: string,
    status: {
      lastSyncAt: string
      castsProcessed: number
      success: boolean
    }
  ): Promise<void> {
    // Upsert to sync_status table (we'll create this in migration)
    const { error } = await this.supabase
      .from('channel_sync_status')
      .upsert({
        channel_id: channelId,
        last_sync_at: status.lastSyncAt,
        last_sync_cast_count: status.castsProcessed,
        last_sync_success: status.success,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'channel_id'
      })

    if (error) {
      console.warn(`[Sync] Failed to update sync status: ${error.message}`)
    }
  }

  /**
   * Get sync status for a channel
   */
  async getSyncStatus(channelId: string): Promise<{
    lastSyncAt: string | null
    lastSyncCastCount: number
    lastSyncSuccess: boolean
  } | null> {
    const { data } = await this.supabase
      .from('channel_sync_status')
      .select('*')
      .eq('channel_id', channelId)
      .single()

    if (!data) {
      return null
    }

    return {
      lastSyncAt: data.last_sync_at,
      lastSyncCastCount: data.last_sync_cast_count || 0,
      lastSyncSuccess: data.last_sync_success ?? true
    }
  }

  /**
   * Sync replies for a specific cast
   *
   * @param castHash - The cast to fetch replies for
   * @param channelId - Channel the cast belongs to
   */
  async syncReplies(castHash: string, channelId: string): Promise<number> {
    try {
      console.log(`[Sync] Syncing replies for cast: ${castHash}`)

      const conversation = await this.neynar.fetchCastWithReplies(castHash, { replyDepth: 2 })
      const replies = conversation.direct_replies || []

      let repliesProcessed = 0

      for (const reply of replies) {
        try {
          await this.processCast(reply, channelId)
          repliesProcessed++
        } catch (error) {
          console.error(`[Sync] Failed to process reply ${reply.hash}: ${error}`)
        }
      }

      console.log(`[Sync] Processed ${repliesProcessed} replies for ${castHash}`)
      return repliesProcessed
    } catch (error) {
      console.error(`[Sync] Failed to sync replies for ${castHash}: ${error}`)
      return 0
    }
  }
}

// Singleton instance
let syncEngine: SyncEngine | null = null

/**
 * Get or create the sync engine instance
 */
export function getSyncEngine(): SyncEngine {
  if (!syncEngine) {
    syncEngine = new SyncEngine()
  }
  return syncEngine
}
