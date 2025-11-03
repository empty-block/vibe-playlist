#!/usr/bin/env bun
/**
 * Backfill Channel Script
 *
 * Fetches historical casts from Farcaster channels and processes them into the database.
 * Uses checkpoint system for resumable backfills.
 *
 * Usage:
 *   bun run scripts/backfill-channel.ts --channel hiphop --start 2024-01-01 --end 2025-01-01
 *   bun run scripts/backfill-channel.ts --all --start 2024-01-01 --end 2025-01-01
 */

import { parseArgs } from 'util'
import { getNeynarService } from '../lib/neynar'
import { getSupabaseClient } from '../lib/api-utils'
import { getSyncEngine } from '../lib/sync-engine'

interface BackfillOptions {
  channelId?: string
  allChannels: boolean
  startDate: Date
  endDate: Date
}

interface Checkpoint {
  channel_id: string
  last_cursor: string | null
  last_timestamp: string | null
  casts_processed: number
  started_at: string
  updated_at: string
}

class BackfillService {
  private neynar = getNeynarService()
  private supabase = getSupabaseClient()
  private syncEngine = getSyncEngine()

  /**
   * Backfill a single channel with historical casts
   */
  async backfillChannel(
    channelId: string,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Starting backfill for channel: ${channelId}`)
    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`)
    console.log(`${'='.repeat(60)}\n`)

    const startTime = Date.now()
    let totalCastsProcessed = 0
    let newCastsAdded = 0
    let errors: string[] = []

    try {
      // Load checkpoint (if exists)
      const checkpoint = await this.loadCheckpoint(channelId)
      let cursor = checkpoint?.last_cursor || undefined
      let castsProcessed = checkpoint?.casts_processed || 0

      console.log(
        checkpoint
          ? `[Backfill] Resuming from checkpoint: ${castsProcessed} casts processed, last cursor: ${cursor?.substring(0, 10)}...`
          : `[Backfill] Starting fresh backfill (no checkpoint found)`
      )

      // Track when we've reached the start date
      let reachedStartDate = false
      let batchCount = 0

      while (!reachedStartDate) {
        batchCount++
        console.log(`\n[Backfill] Fetching batch ${batchCount}...`)

        // Fetch batch from Neynar
        const { casts, nextCursor } = await this.neynar.fetchChannelFeed(channelId, {
          limit: 100,
          cursor
        })

        if (casts.length === 0) {
          console.log(`[Backfill] No more casts available from Neynar`)
          break
        }

        console.log(`[Backfill] Fetched ${casts.length} casts from Neynar`)

        // Filter casts to date range
        const castsInRange = casts.filter(cast => {
          const castDate = new Date(cast.timestamp)
          return castDate >= startDate && castDate <= endDate
        })

        console.log(`[Backfill] ${castsInRange.length} casts in date range`)

        // IMPORTANT: Reverse batch to process oldest-first
        // This ensures parent casts exist before replies
        const castsToProcess = [...castsInRange].reverse()

        // Process each cast
        for (const cast of castsToProcess) {
          try {
            // Use sync engine's processCast method with skipReactions flag
            // We'll access the private method via a public wrapper (we'll need to add this)
            // For now, we'll process the cast data directly similar to how sync engine does it

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

            // Call database upsert function
            const { error } = await this.supabase.rpc('upsert_cast_from_neynar', {
              cast_data: castData
            })

            if (error) {
              throw new Error(`Database upsert failed: ${error.message}`)
            }

            // Process music embeds using sync engine
            await this.processMusicEmbeds(cast.hash, cast.embeds || [])

            castsProcessed++
            newCastsAdded++

            // Log progress every 10 casts
            if (castsProcessed % 10 === 0) {
              const castDate = new Date(cast.timestamp)
              console.log(
                `[Backfill] Progress: ${castsProcessed} casts processed, ` +
                `current date: ${castDate.toISOString().split('T')[0]}`
              )
            }

          } catch (error) {
            const errorMsg = `Failed to process cast ${cast.hash}: ${error}`
            console.error(`[Backfill] ${errorMsg}`)
            errors.push(errorMsg)
          }
        }

        // Get oldest cast timestamp in this batch for checkpoint
        const oldestCast = casts[casts.length - 1]
        const oldestTimestamp = oldestCast?.timestamp

        // Update checkpoint
        await this.saveCheckpoint({
          channel_id: channelId,
          last_cursor: nextCursor || null,
          last_timestamp: oldestTimestamp || null,
          casts_processed: castsProcessed,
          started_at: checkpoint?.started_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

        // Check if we've reached or passed the start date
        if (oldestTimestamp) {
          const oldestDate = new Date(oldestTimestamp)
          if (oldestDate <= startDate) {
            console.log(`[Backfill] Reached start date: ${startDate.toISOString()}`)
            reachedStartDate = true
          }
        }

        // Check if there are more casts to fetch
        if (!nextCursor) {
          console.log(`[Backfill] No more casts available (no next cursor)`)
          break
        }

        // Update cursor for next iteration
        cursor = nextCursor

        // Throttle between batches (respect rate limits)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      const duration = (Date.now() - startTime) / 1000
      console.log(`\n${'='.repeat(60)}`)
      console.log(`Backfill completed for channel: ${channelId}`)
      console.log(`Duration: ${duration.toFixed(2)}s`)
      console.log(`Casts processed: ${castsProcessed}`)
      console.log(`New casts added: ${newCastsAdded}`)
      console.log(`Errors: ${errors.length}`)
      console.log(`${'='.repeat(60)}\n`)

      if (errors.length > 0) {
        console.log(`\nErrors encountered:`)
        errors.forEach(err => console.log(`  - ${err}`))
      }

    } catch (error) {
      console.error(`[Backfill] Fatal error during backfill: ${error}`)
      throw error
    }
  }

  /**
   * Process music embeds from a cast (copied from sync engine)
   */
  private async processMusicEmbeds(castHash: string, embeds: any[]): Promise<void> {
    if (!embeds || embeds.length === 0) {
      return
    }

    // Import these dynamically to avoid circular dependencies
    const { isMusicUrl } = await import('../lib/url-parser')
    const { processMusicUrl, linkMusicToCast } = await import('../lib/music-metadata-extractor')

    for (let i = 0; i < embeds.length; i++) {
      const embed = embeds[i]
      const embedUrl = embed.url

      if (!embedUrl || !isMusicUrl(embedUrl)) {
        continue
      }

      try {
        const result = await processMusicUrl(embedUrl)

        if (result.success) {
          await linkMusicToCast(
            castHash,
            result.platform_name,
            result.platform_id,
            i
          )
        }
      } catch (error) {
        console.error(`[Backfill] Error processing music embed ${embedUrl}:`, error)
      }
    }
  }

  /**
   * Extract cast hash from Warpcast URL
   */
  private extractHashFromUrl(url: string): string | null {
    const match = url.match(/\/(0x[a-fA-F0-9]+)/)
    return match ? match[1] : null
  }

  /**
   * Load checkpoint for a channel
   */
  private async loadCheckpoint(channelId: string): Promise<Checkpoint | null> {
    const { data, error } = await this.supabase
      .from('backfill_checkpoints')
      .select('*')
      .eq('channel_id', channelId)
      .maybeSingle()

    if (error) {
      console.warn(`[Backfill] Failed to load checkpoint: ${error.message}`)
      return null
    }

    return data
  }

  /**
   * Save checkpoint for a channel
   */
  private async saveCheckpoint(checkpoint: Checkpoint): Promise<void> {
    const { error } = await this.supabase
      .from('backfill_checkpoints')
      .upsert(checkpoint, {
        onConflict: 'channel_id'
      })

    if (error) {
      console.warn(`[Backfill] Failed to save checkpoint: ${error.message}`)
    }
  }

  /**
   * Get all visible, non-archived channels
   */
  async getAllChannels(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('channels')
      .select('id')
      .eq('is_visible', true)
      .eq('is_archived', false)
      .order('sort_order')

    if (error) {
      throw new Error(`Failed to fetch channels: ${error.message}`)
    }

    return data.map(c => c.id)
  }
}

/**
 * Parse command line arguments
 */
function parseCliArgs(): BackfillOptions {
  const { values } = parseArgs({
    options: {
      channel: {
        type: 'string',
        short: 'c'
      },
      all: {
        type: 'boolean',
        short: 'a',
        default: false
      },
      start: {
        type: 'string',
        short: 's'
      },
      end: {
        type: 'string',
        short: 'e'
      }
    }
  })

  // Validate arguments
  if (!values.all && !values.channel) {
    console.error('Error: Must specify either --channel or --all')
    console.log('\nUsage:')
    console.log('  bun run scripts/backfill-channel.ts --channel hiphop --start 2024-01-01 --end 2025-01-01')
    console.log('  bun run scripts/backfill-channel.ts --all --start 2024-01-01 --end 2025-01-01')
    process.exit(1)
  }

  if (!values.start || !values.end) {
    console.error('Error: Must specify --start and --end dates')
    console.log('\nUsage:')
    console.log('  bun run scripts/backfill-channel.ts --channel hiphop --start 2024-01-01 --end 2025-01-01')
    process.exit(1)
  }

  // Parse dates
  const startDate = new Date(values.start)
  const endDate = new Date(values.end)

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error('Error: Invalid date format. Use YYYY-MM-DD')
    process.exit(1)
  }

  if (startDate >= endDate) {
    console.error('Error: Start date must be before end date')
    process.exit(1)
  }

  return {
    channelId: values.channel,
    allChannels: values.all,
    startDate,
    endDate
  }
}

/**
 * Main execution
 */
async function main() {
  const options = parseCliArgs()
  const backfillService = new BackfillService()

  try {
    if (options.allChannels) {
      // Backfill all channels
      const channels = await backfillService.getAllChannels()
      console.log(`\nBackfilling ${channels.length} channels: ${channels.join(', ')}\n`)

      for (const channelId of channels) {
        await backfillService.backfillChannel(
          channelId,
          options.startDate,
          options.endDate
        )
      }

      console.log(`\n✓ All channels backfilled successfully!`)
    } else if (options.channelId) {
      // Backfill single channel
      await backfillService.backfillChannel(
        options.channelId,
        options.startDate,
        options.endDate
      )

      console.log(`\n✓ Backfill completed successfully!`)
    }
  } catch (error) {
    console.error(`\n✗ Backfill failed: ${error}`)
    process.exit(1)
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n[Backfill] Interrupted by user. Checkpoint has been saved.')
  console.log('[Backfill] Re-run the same command to resume from checkpoint.')
  process.exit(0)
})

main()
