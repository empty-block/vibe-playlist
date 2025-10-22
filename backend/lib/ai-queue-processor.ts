/**
 * AI Queue Processor
 * Processes pending items from music_ai_queue table
 * Calls AI extractor and updates music_library with enriched metadata
 *
 * TASK-650: Queue-based async AI processing
 */

import { getSupabaseClient } from './api-utils'
import { extractMusicMetadata, type MusicContext, type ExtractedMusic } from './ai-music-extractor'

export interface QueueItem {
  platform_name: string
  platform_id: string
  url: string
  og_title: string | null
  og_artist: string | null
  og_description: string | null
  og_metadata: any
}

export interface ProcessingResult {
  totalProcessed: number
  successful: number
  failed: number
  errors: string[]
}

/**
 * Process a batch of pending items from the AI queue
 *
 * @param options - Processing options
 * @returns Processing statistics
 */
export async function processBatch(options?: {
  batchSize?: number
  model?: string
}): Promise<ProcessingResult> {
  const batchSize = options?.batchSize || 20
  const model = options?.model || 'claude-3-5-haiku-20241022'

  const supabase = getSupabaseClient()
  const errors: string[] = []
  let successful = 0
  let failed = 0

  try {
    console.log(`[AI Queue] Fetching next batch (size: ${batchSize})`)

    // Fetch next batch using database helper function
    const { data: queueItems, error: fetchError } = await supabase
      .rpc('get_next_ai_queue_batch', { batch_size: batchSize })

    if (fetchError) {
      throw new Error(`Failed to fetch queue batch: ${fetchError.message}`)
    }

    if (!queueItems || queueItems.length === 0) {
      console.log('[AI Queue] No pending items in queue')
      return { totalProcessed: 0, successful: 0, failed: 0, errors: [] }
    }

    console.log(`[AI Queue] Retrieved ${queueItems.length} items from queue`)

    // Mark items as processing
    const platformKeys = queueItems.map((item: QueueItem) => ({
      platform_name: item.platform_name,
      platform_id: item.platform_id
    }))

    await updateQueueStatus(platformKeys, 'processing')

    // Convert queue items to music contexts
    const contexts: MusicContext[] = queueItems.map((item: QueueItem) => ({
      platform_name: item.platform_name,
      platform_id: item.platform_id,
      og_title: item.og_title,
      og_artist: item.og_artist,
      og_description: item.og_description,
      og_metadata: item.og_metadata
    }))

    // Extract music metadata using AI
    let extractions: ExtractedMusic[]
    try {
      extractions = await extractMusicMetadata(contexts, { model })
    } catch (extractError: any) {
      // If extraction fails, mark all as failed
      console.error('[AI Queue] AI extraction failed:', extractError.message)
      await markBatchFailed(platformKeys, extractError.message)
      return {
        totalProcessed: queueItems.length,
        successful: 0,
        failed: queueItems.length,
        errors: [extractError.message]
      }
    }

    // Update music_library with extracted metadata
    for (const extraction of extractions) {
      try {
        await updateMusicLibrary(extraction)
        await markItemCompleted(extraction.platform_name, extraction.platform_id)
        successful++
        console.log(
          `[AI Queue] ✓ Updated ${extraction.platform_name}/${extraction.platform_id}: ${extraction.artist} - ${extraction.title}`
        )
      } catch (updateError: any) {
        const errorMsg = `Failed to update ${extraction.platform_name}/${extraction.platform_id}: ${updateError.message}`
        console.error(`[AI Queue] ${errorMsg}`)
        errors.push(errorMsg)
        await markItemFailed(extraction.platform_name, extraction.platform_id, updateError.message)
        failed++
      }
    }

    // Handle items that weren't extracted (no music found or extraction failed)
    const extractedKeys = new Set(
      extractions.map(e => `${e.platform_name}:${e.platform_id}`)
    )
    const notExtracted = platformKeys.filter(
      (k: { platform_name: string; platform_id: string }) => !extractedKeys.has(`${k.platform_name}:${k.platform_id}`)
    )

    for (const key of notExtracted) {
      const errorMsg = 'No music metadata extracted'
      await markItemFailed(key.platform_name, key.platform_id, errorMsg)
      failed++
      errors.push(`${key.platform_name}/${key.platform_id}: ${errorMsg}`)
    }

    console.log(
      `[AI Queue] Batch complete: ${successful} successful, ${failed} failed out of ${queueItems.length} total`
    )

    return {
      totalProcessed: queueItems.length,
      successful,
      failed,
      errors
    }

  } catch (error: any) {
    console.error('[AI Queue] Batch processing failed:', error.message)
    return {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      errors: [error.message]
    }
  }
}

/**
 * Update queue status for multiple items
 */
async function updateQueueStatus(
  items: Array<{ platform_name: string; platform_id: string }>,
  status: 'pending' | 'processing' | 'completed' | 'failed'
): Promise<void> {
  const supabase = getSupabaseClient()

  for (const item of items) {
    const updateData: any = {
      status
    }

    if (status === 'processing') {
      updateData.processing_started_at = new Date().toISOString()
    } else if (status === 'completed' || status === 'failed') {
      updateData.processed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('music_ai_queue')
      .update(updateData)
      .eq('platform_name', item.platform_name)
      .eq('platform_id', item.platform_id)

    if (error) {
      console.warn(`[AI Queue] Failed to update queue status: ${error.message}`)
    }
  }
}

/**
 * Mark an item as completed
 */
async function markItemCompleted(
  platform_name: string,
  platform_id: string
): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('music_ai_queue')
    .update({
      status: 'completed',
      processed_at: new Date().toISOString(),
      error_message: null
    })
    .eq('platform_name', platform_name)
    .eq('platform_id', platform_id)

  if (error) {
    throw new Error(`Failed to mark item as completed: ${error.message}`)
  }
}

/**
 * Mark an item as failed with error message and retry logic
 */
async function markItemFailed(
  platform_name: string,
  platform_id: string,
  errorMessage: string
): Promise<void> {
  const supabase = getSupabaseClient()

  // Get current retry count
  const { data: queueItem } = await supabase
    .from('music_ai_queue')
    .select('retry_count')
    .eq('platform_name', platform_name)
    .eq('platform_id', platform_id)
    .single()

  const retryCount = (queueItem?.retry_count || 0) + 1
  const maxRetries = 5

  // If under max retries, set back to pending for retry
  const status = retryCount < maxRetries ? 'pending' : 'failed'

  const { error } = await supabase
    .from('music_ai_queue')
    .update({
      status,
      processed_at: new Date().toISOString(),
      error_message: errorMessage,
      retry_count: retryCount
    })
    .eq('platform_name', platform_name)
    .eq('platform_id', platform_id)

  if (error) {
    console.warn(`[AI Queue] Failed to mark item as failed: ${error.message}`)
  }

  if (status === 'pending') {
    console.log(
      `[AI Queue] Retry ${retryCount}/${maxRetries} for ${platform_name}/${platform_id}`
    )
  } else {
    console.log(
      `[AI Queue] Max retries reached for ${platform_name}/${platform_id}, marking as failed`
    )
  }
}

/**
 * Mark entire batch as failed
 */
async function markBatchFailed(
  items: Array<{ platform_name: string; platform_id: string }>,
  errorMessage: string
): Promise<void> {
  for (const item of items) {
    await markItemFailed(item.platform_name, item.platform_id, errorMessage)
  }
}

/**
 * Update music_library with AI-extracted metadata
 */
async function updateMusicLibrary(extraction: ExtractedMusic): Promise<void> {
  const supabase = getSupabaseClient()

  const updateData = {
    title: extraction.title,
    artist: extraction.artist,
    album: extraction.album,
    genres: extraction.genres,
    release_date: extraction.release_date,
    music_type: extraction.music_type,
    confidence_score: extraction.confidence_score,
    ai_processed_at: new Date().toISOString(),
    processing_status: 'ai_completed',
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('music_library')
    .update(updateData)
    .eq('platform_name', extraction.platform_name)
    .eq('platform_id', extraction.platform_id)

  if (error) {
    throw new Error(`Failed to update music_library: ${error.message}`)
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  pending: number
  processing: number
  completed: number
  failed: number
  totalQueued: number
}> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('music_ai_queue')
    .select('status')

  if (error) {
    throw new Error(`Failed to get queue stats: ${error.message}`)
  }

  const stats = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    totalQueued: data?.length || 0
  }

  for (const item of data || []) {
    if (item.status === 'pending') stats.pending++
    else if (item.status === 'processing') stats.processing++
    else if (item.status === 'completed') stats.completed++
    else if (item.status === 'failed') stats.failed++
  }

  return stats
}

/**
 * Get failed items with error messages
 */
export async function getFailedItems(limit: number = 10): Promise<Array<{
  platform_name: string
  platform_id: string
  error_message: string
  retry_count: number
}>> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('music_ai_queue')
    .select('platform_name, platform_id, error_message, retry_count')
    .eq('status', 'failed')
    .order('processed_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to get failed items: ${error.message}`)
  }

  return data || []
}
