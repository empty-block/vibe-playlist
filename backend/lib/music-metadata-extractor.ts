/**
 * Music Metadata Extractor - Orchestration Service
 * Coordinates URL parsing, OpenGraph fetching, and database operations
 *
 * This is the main entry point for processing music embeds during Neynar sync
 */

import { parseMusicUrl, type ParsedMusicUrl } from './url-parser'
import { fetchOpenGraph, type OpenGraphMetadata } from './opengraph'
import { getSupabaseClient } from './api-utils'

export interface MusicMetadataResult {
  platform_name: string
  platform_id: string
  success: boolean
  error?: string
  metadata?: {
    og_title: string | null
    og_artist: string | null
    og_image_url: string | null
  }
}

/**
 * Process a music URL: parse, fetch OpenGraph, upsert to database
 *
 * @param url - Music URL to process
 * @returns Result with platform info and success status
 */
export async function processMusicUrl(url: string): Promise<MusicMetadataResult> {
  try {
    // Step 1: Parse URL to extract platform and ID
    const parsed = parseMusicUrl(url)
    if (!parsed) {
      return {
        platform_name: 'unknown',
        platform_id: 'unknown',
        success: false,
        error: 'URL is not from a known music platform'
      }
    }

    // Step 2: Fetch OpenGraph metadata
    console.log(`[Music Extractor] Fetching OpenGraph for: ${url}`)
    const ogData = await fetchOpenGraph(url, {
      timeout: 10000,
      retries: 2
    })

    if (!ogData.success) {
      console.warn(`[Music Extractor] OpenGraph fetch failed: ${ogData.error}`)
      // Still proceed with upserting - we'll use NULL values
    }

    // Step 3: Upsert to music_library
    await upsertMusicLibrary(parsed, ogData, url)

    // Step 4: Add to AI processing queue (TASK-640)
    await queueForAIProcessing(parsed.platform_name, parsed.platform_id)

    return {
      platform_name: parsed.platform_name,
      platform_id: parsed.platform_id,
      success: true,
      metadata: {
        og_title: ogData.og_title,
        og_artist: ogData.og_artist,
        og_image_url: ogData.og_image_url
      }
    }
  } catch (error: any) {
    console.error(`[Music Extractor] Failed to process URL ${url}:`, error)
    return {
      platform_name: 'unknown',
      platform_id: 'unknown',
      success: false,
      error: error.message
    }
  }
}

/**
 * Upsert music metadata to music_library table
 * Uses (platform_name, platform_id) as primary key for deduplication
 */
async function upsertMusicLibrary(
  parsed: ParsedMusicUrl,
  ogData: OpenGraphMetadata,
  url: string
): Promise<void> {
  const supabase = getSupabaseClient()

  const record = {
    platform_name: parsed.platform_name,
    platform_id: parsed.platform_id,
    url,
    og_title: ogData.og_title,
    og_artist: ogData.og_artist,
    og_image_url: ogData.og_image_url,
    og_metadata: ogData.og_metadata,
    og_fetched_at: new Date().toISOString(),
    processing_status: 'og_fetched',
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('music_library')
    .upsert(record, {
      onConflict: 'platform_name,platform_id',
      ignoreDuplicates: false // Always update with latest OG data
    })

  if (error) {
    throw new Error(`Failed to upsert music_library: ${error.message}`)
  }

  console.log(
    `[Music Extractor] Upserted to music_library: ${parsed.platform_name}/${parsed.platform_id}`
  )
}

/**
 * Add music track to AI processing queue
 * Will be processed by TASK-640 worker
 */
async function queueForAIProcessing(
  platform_name: string,
  platform_id: string
): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('music_ai_queue')
    .upsert(
      {
        platform_name,
        platform_id,
        status: 'pending',
        priority: 0,
        queued_at: new Date().toISOString()
      },
      {
        onConflict: 'platform_name,platform_id',
        ignoreDuplicates: true // Don't re-queue if already exists
      }
    )

  if (error) {
    console.warn(`[Music Extractor] Failed to queue for AI processing: ${error.message}`)
    // Non-fatal error - continue processing
  } else {
    console.log(
      `[Music Extractor] Queued for AI processing: ${platform_name}/${platform_id}`
    )
  }
}

/**
 * Process multiple music URLs in parallel
 * Useful for batch processing embeds from a cast
 */
export async function processMusicUrls(
  urls: string[],
  options?: {
    concurrency?: number
  }
): Promise<MusicMetadataResult[]> {
  const concurrency = options?.concurrency || 3 // Process 3 at a time
  const results: MusicMetadataResult[] = []

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency)
    const batchResults = await Promise.all(batch.map(url => processMusicUrl(url)))
    results.push(...batchResults)
  }

  return results
}

/**
 * Link music track to a cast in cast_music_edges junction table
 */
export async function linkMusicToCast(
  castId: string,
  platform_name: string,
  platform_id: string,
  embedIndex?: number
): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('cast_music_edges')
    .upsert(
      {
        cast_id: castId,
        music_platform_name: platform_name,
        music_platform_id: platform_id,
        embed_index: embedIndex ?? null,
        created_at: new Date().toISOString()
      },
      {
        onConflict: 'cast_id,music_platform_name,music_platform_id',
        ignoreDuplicates: true
      }
    )

  if (error) {
    throw new Error(`Failed to link music to cast: ${error.message}`)
  }

  console.log(
    `[Music Extractor] Linked ${platform_name}/${platform_id} to cast ${castId}`
  )
}
