#!/usr/bin/env bun
/**
 * Backfill og_description for existing tracks
 * Re-fetch OpenGraph metadata and run AI extraction
 */

import { fetchOpenGraph } from './opengraph'
import { extractMusicMetadata } from './ai-music-extractor'
import { getSupabaseClient } from './api-utils'
import type { MusicContext } from './ai-music-extractor'

const BATCH_SIZE = 20 // Process 20 at a time (matches AI worker batch size)
const MAX_TOTAL = 227 // Process all tracks missing og_description

interface TrackToFix {
  platform_name: string
  platform_id: string
  url: string
  og_title: string | null
  og_artist: string | null
  og_description: string | null
}

async function backfillOgDescription() {
  const supabase = getSupabaseClient()

  console.log('🔧 Backfilling og_description for ALL tracks')
  console.log('=' .repeat(80))
  console.log(`Target: Up to ${MAX_TOTAL} tracks in batches of ${BATCH_SIZE}`)
  console.log('=' .repeat(80))

  let totalProcessed = 0
  let totalSuccessful = 0
  let batchNumber = 1

  while (totalProcessed < MAX_TOTAL) {
    console.log(`\n\n${'='.repeat(80)}`)
    console.log(`📦 BATCH ${batchNumber} (Processed so far: ${totalProcessed}/${MAX_TOTAL})`)
    console.log('=' .repeat(80))

    // Step 1: Get tracks that need fixing
    console.log(`\n📋 Fetching next ${BATCH_SIZE} tracks...`)
    const { data: tracks, error: fetchError } = await supabase
      .from('music_library')
      .select('platform_name, platform_id, url, og_title, og_artist, og_description')
      .is('og_description', null)
      .not('url', 'is', null)
      .limit(BATCH_SIZE)

  if (fetchError) {
    throw new Error(`Failed to fetch tracks: ${fetchError.message}`)
  }

    if (!tracks || tracks.length === 0) {
      console.log('✓ No more tracks to fix!')
      break
    }

    console.log(`Found ${tracks.length} tracks in this batch\n`)

    const results = []

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i] as TrackToFix
    console.log(`\n[${i + 1}/${tracks.length}] Processing: ${track.platform_name}/${track.platform_id}`)
    console.log(`URL: ${track.url}`)
    console.log('-'.repeat(80))

    try {
      // Step 2: Re-fetch OpenGraph with og_description
      console.log('📡 Re-fetching OpenGraph metadata (with og_description)...')
      const ogData = await fetchOpenGraph(track.url, { timeout: 15000, retries: 2 })

      if (!ogData.success) {
        console.log(`❌ OpenGraph fetch failed: ${ogData.error}`)
        results.push({
          track: `${track.platform_name}/${track.platform_id}`,
          status: 'og_fetch_failed',
          error: ogData.error
        })
        continue
      }

      console.log('✓ OpenGraph fetched')
      console.log(`  og_title: ${ogData.og_title}`)
      console.log(`  og_artist: ${ogData.og_artist}`)
      console.log(`  og_description: ${ogData.og_description ? '✓ Present' : '✗ Missing'}`)

      // Step 3: Update database with og_description
      console.log('\n💾 Updating database with og_description...')
      const { error: updateOgError } = await supabase
        .from('music_library')
        .update({
          og_description: ogData.og_description,
          og_metadata: ogData.og_metadata,
          og_fetched_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('platform_name', track.platform_name)
        .eq('platform_id', track.platform_id)

      if (updateOgError) {
        console.log(`❌ Database update failed: ${updateOgError.message}`)
        results.push({
          track: `${track.platform_name}/${track.platform_id}`,
          status: 'db_update_failed',
          error: updateOgError.message
        })
        continue
      }

      console.log('✓ Database updated with og_description')

      // Step 4: Run AI extraction with og_description
      console.log('\n🧠 Running AI extraction...')
      const context: MusicContext = {
        platform_name: track.platform_name,
        platform_id: track.platform_id,
        og_title: ogData.og_title,
        og_artist: ogData.og_artist,
        og_description: ogData.og_description, // ← The new field!
        og_metadata: ogData.og_metadata
      }

      const extractions = await extractMusicMetadata([context], {
        model: 'claude-3-5-haiku-20241022',
        temperature: 0.1
      })

      if (extractions.length === 0) {
        console.log('❌ AI extraction returned no results')
        results.push({
          track: `${track.platform_name}/${track.platform_id}`,
          status: 'ai_no_results',
          og_description_present: !!ogData.og_description
        })
        continue
      }

      const extraction = extractions[0]
      console.log('✓ AI extraction complete')
      console.log(`  title: ${extraction.title}`)
      console.log(`  artist: ${extraction.artist}`)
      console.log(`  album: ${extraction.album}`)
      console.log(`  genres: ${extraction.genres.join(', ')}`)
      console.log(`  confidence: ${(extraction.confidence_score * 100).toFixed(1)}%`)

      // Step 5: Update database with AI extraction
      console.log('\n💾 Updating database with AI extraction...')
      const { error: updateAiError } = await supabase
        .from('music_library')
        .update({
          title: extraction.title,
          artist: extraction.artist,
          album: extraction.album,
          genres: extraction.genres,
          release_date: extraction.release_date,
          music_type: extraction.music_type,
          confidence_score: extraction.confidence_score,
          processing_status: 'ai_completed',
          ai_processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('platform_name', track.platform_name)
        .eq('platform_id', track.platform_id)

      if (updateAiError) {
        console.log(`❌ AI update failed: ${updateAiError.message}`)
        results.push({
          track: `${track.platform_name}/${track.platform_id}`,
          status: 'ai_update_failed',
          error: updateAiError.message
        })
        continue
      }

      console.log('✅ SUCCESS! Track fully processed')

      results.push({
        track: `${track.platform_name}/${track.platform_id}`,
        status: 'success',
        og_description_present: !!ogData.og_description,
        artist: extraction.artist,
        title: extraction.title,
        confidence: extraction.confidence_score
      })

      // Small delay between tracks
      await new Promise(resolve => setTimeout(resolve, 1500))

    } catch (error: any) {
      console.log(`\n❌ Error: ${error.message}`)
      results.push({
        track: `${track.platform_name}/${track.platform_id}`,
        status: 'error',
        error: error.message
      })
    }
  }

    // Batch summary
    const successful = results.filter(r => r.status === 'success')
    totalProcessed += tracks.length
    totalSuccessful += successful.length

    console.log(`\n📊 Batch ${batchNumber} Summary: ${successful.length}/${tracks.length} successful`)

    batchNumber++

    // Small delay between batches to avoid rate limits
    if (totalProcessed < MAX_TOTAL) {
      console.log('\n⏳ Waiting 3 seconds before next batch...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }

  // Final summary
  console.log('\n\n' + '='.repeat(80))
  console.log('📊 FINAL BACKFILL SUMMARY')
  console.log('='.repeat(80))
  console.log(`\nTotal processed: ${totalProcessed}`)
  console.log(`Total successful: ${totalSuccessful}`)
  console.log(`Success rate: ${((totalSuccessful / totalProcessed) * 100).toFixed(1)}%`)
  console.log('\n✅ Backfill complete!')

  return { totalProcessed, totalSuccessful }
}

// Run the backfill
backfillOgDescription()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Backfill failed:', error)
    process.exit(1)
  })
