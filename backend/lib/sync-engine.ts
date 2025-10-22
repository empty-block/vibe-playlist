import { getNeynarService } from './neynar'
import { getSupabaseClient } from './api-utils'
import { processMusicUrl, linkMusicToCast } from './music-metadata-extractor'
import { isMusicUrl } from './url-parser'

/**
 * Sync Engine - Orchestrates syncing Farcaster casts from Neynar to database
 *
 * Implements incremental processing: only syncs new casts since last sync.
 * Uses upsert pattern for duplicate-safe operations.
 */
export class SyncEngine {
  private neynar = getNeynarService()
  private supabase = getSupabaseClient()
  private processedParentCasts = new Set<string>() // Cache for parent casts processed in this sync session

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

    // Create REPLIED edge if this is a reply (TASK-649 Phase 2)
    if (cast.parent_hash) {
      try {
        const userId = cast.author.fid.toString()
        const parentHash = cast.parent_hash

        // 1. Check if parent cast exists (check cache first, then database)
        let parentExists = this.processedParentCasts.has(parentHash)

        if (!parentExists) {
          // Check database
          const { data, error: checkError } = await this.supabase
            .from('cast_nodes')
            .select('cast_hash')
            .eq('cast_hash', parentHash)
            .maybeSingle()

          parentExists = !!data && !checkError
        }

        // 2. If parent doesn't exist, fetch and insert it
        if (!parentExists) {
          try {
            const parentCasts = await this.neynar.fetchBulkCasts([parentHash])
            if (parentCasts.length > 0) {
              const parentCast = parentCasts[0]
              // Recursively process the parent cast (this will insert it)
              // Use the channel from the parent cast if available, otherwise use current channel
              const parentChannel = parentCast.channel?.id || channelId
              await this.processCast(parentCast, parentChannel)
              // Mark as processed in cache
              this.processedParentCasts.add(parentHash)
            } else {
              console.warn(`[Sync] Could not fetch parent cast ${parentHash} from Neynar`)
              // Skip creating REPLIED edge if we can't get the parent
              return
            }
          } catch (error) {
            console.warn(`[Sync] Failed to fetch parent cast ${parentHash}:`, error)
            // Skip creating REPLIED edge if we can't get the parent
            return
          }
        }

        // 3. Upsert reply author to user_nodes (might already exist from AUTHORED edge)
        const { error: userError } = await this.supabase
          .from('user_nodes')
          .upsert({
            node_id: userId,
            fname: cast.author.username,
            display_name: cast.author.display_name,
            avatar_url: cast.author.pfp_url
          }, {
            onConflict: 'node_id'
          })

        if (userError) {
          console.warn(`[Sync] Failed to upsert reply author ${userId}:`, userError.message)
        } else {
          // 4. Insert REPLIED edge
          // source_id: user who replied
          // cast_id: the reply cast itself (this cast)
          // target_id: the parent cast being replied to
          const { error: edgeError } = await this.supabase
            .from('interaction_edges')
            .insert({
              source_id: userId,
              cast_id: cast.hash,
              target_id: cast.parent_hash,
              edge_type: 'REPLIED',
              created_at: cast.timestamp
            })
            .select()

          if (edgeError && !edgeError.message.includes('duplicate key')) {
            // Only warn on non-duplicate errors
            console.warn(`[Sync] Failed to insert REPLIED edge:`, edgeError.message)
          }
        }
      } catch (error) {
        console.warn(`[Sync] Failed to create REPLIED edge for cast ${cast.hash}:`, error)
        // Non-fatal - continue processing
      }
    }

    // Process music embeds (TASK-639)
    await this.processMusicEmbeds(cast.hash, cast.embeds || [])

    // Sync reactions (TASK-649 Phase 1 & 3)
    // Skip if cast has no reactions (optimization)
    const hasReactions = (cast.reactions?.likes_count || 0) > 0 || (cast.reactions?.recasts_count || 0) > 0
    if (hasReactions) {
      // Non-fatal - if reaction sync fails, we still want to continue
      try {
        await this.syncCastReactions(cast.hash, cast.author.fid)
      } catch (error) {
        console.warn(`[Sync] Failed to sync reactions for cast ${cast.hash}:`, error)
        // Continue processing - reaction sync failure is non-fatal
      }
    }
  }

  /**
   * Process music embeds from a cast
   * Extracts music URLs, fetches OpenGraph metadata, and links to cast
   */
  private async processMusicEmbeds(castHash: string, embeds: any[]): Promise<void> {
    if (!embeds || embeds.length === 0) {
      return
    }

    let musicEmbedsProcessed = 0

    for (let i = 0; i < embeds.length; i++) {
      const embed = embeds[i]
      const embedUrl = embed.url

      if (!embedUrl) {
        continue
      }

      // Check if this is a music URL
      if (!isMusicUrl(embedUrl)) {
        continue
      }

      try {
        // Process music URL: parse, fetch OpenGraph, upsert to music_library
        const result = await processMusicUrl(embedUrl)

        if (result.success) {
          // Link music track to this cast
          await linkMusicToCast(
            castHash,
            result.platform_name,
            result.platform_id,
            i // embed index
          )

          musicEmbedsProcessed++
          console.log(
            `[Sync] Processed music embed ${i + 1}/${embeds.length}: ${result.platform_name}/${result.platform_id}`
          )
        } else {
          console.warn(`[Sync] Failed to process music URL: ${result.error}`)
        }
      } catch (error) {
        console.error(`[Sync] Error processing music embed ${embedUrl}:`, error)
        // Non-fatal - continue processing other embeds
      }
    }

    if (musicEmbedsProcessed > 0) {
      console.log(`[Sync] ✓ Processed ${musicEmbedsProcessed} music embeds for cast ${castHash}`)
    }
  }

  private hasLoggedCast = false

  /**
   * Sync reactions (likes and recasts) for a specific cast
   *
   * @param castHash - The cast to fetch reactions for
   * @param viewerFid - FID of the viewer context (usually cast author)
   * @returns Number of reactions synced
   */
  async syncCastReactions(castHash: string, viewerFid: number): Promise<number> {
    console.log(`[Sync] Fetching reactions for cast: ${castHash} (viewer: ${viewerFid})`)
    try {
      // Fetch reactions from Neynar with viewer context
      const { likes, recasts } = await this.neynar.fetchCastReactions(castHash, {
        types: ['likes', 'recasts'],
        limit: 100,
        viewerFid
      })

      console.log(`[Sync] Got ${likes.length} likes and ${recasts.length} recasts for ${castHash}`)
      let totalReactionsSynced = 0

      // Process likes
      for (const like of likes) {
        try {
          const userId = like.user.fid.toString()

          // 1. Upsert reactor user
          const { error: userError } = await this.supabase
            .from('user_nodes')
            .upsert({
              node_id: userId,
              fname: like.user.username,
              display_name: like.user.display_name,
              avatar_url: like.user.pfp_url
            }, {
              onConflict: 'node_id'
            })

          if (userError) {
            console.warn(`[Sync] Failed to upsert user ${userId}:`, userError.message)
            continue
          }

          // 2. Insert LIKED edge
          const { error: edgeError } = await this.supabase
            .from('interaction_edges')
            .insert({
              source_id: userId,
              cast_id: castHash,
              edge_type: 'LIKED',
              created_at: like.reaction_timestamp || new Date().toISOString()
            })
            .select()

          if (edgeError) {
            // Ignore duplicate key errors (already synced)
            if (!edgeError.message.includes('duplicate key')) {
              console.warn(`[Sync] Failed to insert LIKED edge:`, edgeError.message)
            }
          } else {
            totalReactionsSynced++
          }
        } catch (error) {
          console.error(`[Sync] Error processing like reaction:`, error)
        }
      }

      // Process recasts
      for (const recast of recasts) {
        try {
          const userId = recast.user.fid.toString()

          // 1. Upsert recaster user
          const { error: userError } = await this.supabase
            .from('user_nodes')
            .upsert({
              node_id: userId,
              fname: recast.user.username,
              display_name: recast.user.display_name,
              avatar_url: recast.user.pfp_url
            }, {
              onConflict: 'node_id'
            })

          if (userError) {
            console.warn(`[Sync] Failed to upsert user ${userId}:`, userError.message)
            continue
          }

          // 2. Insert RECASTED edge
          const { error: edgeError } = await this.supabase
            .from('interaction_edges')
            .insert({
              source_id: userId,
              cast_id: castHash,
              edge_type: 'RECASTED',
              created_at: recast.reaction_timestamp || new Date().toISOString()
            })
            .select()

          if (edgeError) {
            // Ignore duplicate key errors (already synced)
            if (!edgeError.message.includes('duplicate key')) {
              console.warn(`[Sync] Failed to insert RECASTED edge:`, edgeError.message)
            }
          } else {
            totalReactionsSynced++
          }
        } catch (error) {
          console.error(`[Sync] Error processing recast reaction:`, error)
        }
      }

      if (totalReactionsSynced > 0) {
        console.log(
          `[Sync] ✓ Synced ${totalReactionsSynced} reactions for cast ${castHash} ` +
          `(${likes.length} likes, ${recasts.length} recasts)`
        )
      }

      return totalReactionsSynced
    } catch (error) {
      console.error(`[Sync] Failed to sync reactions for ${castHash}:`, error)
      return 0
    }
  }

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
   * @param replyCount - Optional reply count from cast metadata (optimization)
   */
  async syncReplies(castHash: string, channelId: string, replyCount?: number): Promise<number> {
    try {
      // Optimization (TASK-649 Phase 3): Skip if we know there are no replies
      if (replyCount === 0) {
        return 0
      }

      console.log(`[Sync] Syncing replies for cast: ${castHash}`)

      // fetchCastWithReplies returns the cast object with direct_replies nested inside
      const cast = await this.neynar.fetchCastWithReplies(castHash, { replyDepth: 2 })
      const replies = cast.direct_replies || []

      console.log(`[Sync] Found ${replies.length} direct replies`)

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

  /**
   * Sync reactions (likes/recasts) made by a specific user
   *
   * Fetches all reactions from Neynar API and processes each liked cast.
   * Uses pagination to handle users with many reactions.
   *
   * @param fid - Farcaster ID of the user
   * @param options - Optional sync parameters
   * @returns Sync result with counts and status
   */
  async syncUserReactions(
    fid: number,
    options?: {
      type?: 'likes' | 'recasts' | 'all'
      limit?: number
      forceFullSync?: boolean
    }
  ): Promise<{
    success: boolean
    reactionsProcessed: number
    castsProcessed: number
    errors: string[]
  }> {
    const startTime = Date.now()
    const errors: string[] = []
    let reactionsProcessed = 0
    let castsProcessed = 0

    try {
      const reactionType = options?.type || 'likes'
      console.log(`[Sync] Starting ${reactionType} sync for user: ${fid}`)

      // Fetch user reactions with pagination
      let cursor: string | undefined = undefined
      let hasMore = true
      const pageLimit = Math.min(options?.limit || 100, 100)

      while (hasMore) {
        const { reactions, nextCursor } = await this.neynar.fetchUserReactions(fid, {
          type: reactionType,
          limit: pageLimit,
          cursor
        })

        console.log(`[Sync] Fetched ${reactions.length} ${reactionType} from Neynar`)

        // Process each reaction
        for (const reaction of reactions) {
          try {
            const cast = reaction.cast
            if (!cast) {
              console.warn(`[Sync] Reaction missing cast data, skipping`)
              continue
            }

            // Determine channel (use cast's channel if available)
            const channelId = cast.channel?.id || 'unknown'

            // Process the cast (upsert to database)
            await this.processCast(cast, channelId)
            castsProcessed++

            // Create the reaction edge (LIKED or RECASTED)
            const edgeType = reaction.reaction_type === 'like' ? 'LIKED' : 'RECASTED'

            // Upsert the user who made the reaction
            const { error: userError } = await this.supabase
              .from('user_nodes')
              .upsert({
                node_id: fid.toString(),
                fname: reaction.user?.username || '',
                display_name: reaction.user?.display_name || '',
                avatar_url: reaction.user?.pfp_url || ''
              }, {
                onConflict: 'node_id'
              })

            if (userError) {
              console.warn(`[Sync] Failed to upsert user ${fid}:`, userError.message)
              continue
            }

            // Insert the reaction edge
            const { error: edgeError } = await this.supabase
              .from('interaction_edges')
              .insert({
                source_id: fid.toString(),
                cast_id: cast.hash,
                edge_type: edgeType,
                created_at: reaction.reaction_timestamp || new Date().toISOString()
              })
              .select()

            if (edgeError) {
              // Ignore duplicate key errors (already synced)
              if (!edgeError.message.includes('duplicate key')) {
                console.warn(`[Sync] Failed to insert ${edgeType} edge:`, edgeError.message)
                errors.push(`Failed to insert ${edgeType} edge for cast ${cast.hash}`)
              }
            } else {
              reactionsProcessed++
            }
          } catch (error) {
            const errorMsg = `Failed to process reaction: ${error}`
            console.error(`[Sync] ${errorMsg}`)
            errors.push(errorMsg)
          }
        }

        // Handle pagination
        if (nextCursor && reactions.length > 0) {
          cursor = nextCursor
          console.log(`[Sync] Fetching next page of ${reactionType} (cursor: ${cursor.substring(0, 10)}...)`)
        } else {
          hasMore = false
        }
      }

      const duration = Date.now() - startTime
      console.log(
        `[Sync] Completed ${reactionType} sync for user ${fid} in ${duration}ms: ` +
        `${reactionsProcessed} reactions, ${castsProcessed} casts processed, ${errors.length} errors`
      )

      return {
        success: errors.length === 0,
        reactionsProcessed,
        castsProcessed,
        errors
      }
    } catch (error) {
      const errorMsg = `User reactions sync failed: ${error}`
      console.error(`[Sync] ${errorMsg}`)
      return {
        success: false,
        reactionsProcessed,
        castsProcessed,
        errors: [errorMsg, ...errors]
      }
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
