#!/usr/bin/env bun
/**
 * Backfill og_description for existing tracks
 * Re-fetch OpenGraph metadata and run AI extraction
 */

import { fetchOpenGraph } from './opengraph'
import { extractMusicMetadata } from './ai-music-extractor'
import { getSupabaseClient } from './api-utils'
import type { MusicContext } from './ai-music-extractor'

const BATCH_SIZE = 10 // Process 10 at a time to start

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

  console.log('🔧 Backfilling og_description for tracks missing artist data')
  console.log('=' .repeat(80))

  // Step 1: Get tracks that need fixing
  console.log(`\n📋 Fetching ${BATCH_SIZE} tracks to fix...`)
  const { data: tracks, error: fetchError } = await supabase
    .from('music_library')
    .select('platform_name, platform_id, url, og_title, og_artist, og_description')
    .is('og_description', null)
    .is('artist', null)
    .not('url', 'is', null)
    .limit(BATCH_SIZE)

  if (fetchError) {
    throw new Error(`Failed to fetch tracks: ${fetchError.message}`)
  }

  if (!tracks || tracks.length === 0) {
    console.log('✓ No tracks need fixing!')
    return
  }

  console.log(`Found ${tracks.length} tracks to process\n`)

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

  // Print summary
  console.log('\n\n' + '='.repeat(80))
  console.log('📊 BACKFILL SUMMARY')
  console.log('='.repeat(80))

  const successful = results.filter(r => r.status === 'success')
  const withDescription = successful.filter(r => r.og_description_present)

  console.log(`\nTotal processed: ${results.length}`)
  console.log(`Successful: ${successful.length}/${results.length}`)
  console.log(`With og_description: ${withDescription.length}/${successful.length}`)

  if (successful.length > 0) {
    const avgConfidence = successful.reduce((sum, r) => sum + (r.confidence || 0), 0) / successful.length
    console.log(`Average confidence: ${(avgConfidence * 100).toFixed(1)}%`)
  }

  console.log('\n📋 Results Table:')
  console.log('-'.repeat(80))
  console.table(results.map(r => ({
    Track: r.track,
    Status: r.status,
    'Has og_description': r.og_description_present ? '✓' : '✗',
    Artist: r.artist || 'N/A',
    Confidence: r.confidence ? `${(r.confidence * 100).toFixed(0)}%` : 'N/A'
  })))

  console.log('\n✅ Backfill complete!')
  console.log(`\n💡 ${tracks.length - successful.length} tracks still need fixing`)
  console.log('   Run this script again to process more batches')

  return results
}

// Run the backfill
backfillOgDescription()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Backfill failed:', error)
    process.exit(1)
  })
