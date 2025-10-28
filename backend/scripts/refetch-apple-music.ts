/**
 * Script to re-fetch OpenGraph metadata for Apple Music tracks
 * Uses the new Odesli API fallback
 */

import { processMusicUrl } from '../lib/music-metadata-extractor'
import { getSupabaseClient } from '../lib/api-utils'

async function refetchAppleMusicTracks() {
  console.log('🎵 Re-fetching Apple Music tracks with Odesli API...\n')

  const supabase = getSupabaseClient()

  // Get all Apple Music tracks
  const { data: tracks, error } = await supabase
    .from('music_library')
    .select('platform_name, platform_id, url')
    .eq('platform_name', 'apple_music')
    .order('url')

  if (error) {
    console.error('❌ Failed to fetch Apple Music tracks:', error.message)
    process.exit(1)
  }

  if (!tracks || tracks.length === 0) {
    console.log('No Apple Music tracks found')
    process.exit(0)
  }

  console.log(`Found ${tracks.length} Apple Music tracks to re-fetch\n`)

  let successful = 0
  let failed = 0

  for (const track of tracks) {
    console.log(`Processing: ${track.url}`)

    try {
      const result = await processMusicUrl(track.url)

      if (result.success) {
        console.log(`  ✅ Success: ${result.metadata?.og_title || 'Unknown'} - ${result.metadata?.og_artist || 'Unknown'}`)
        successful++
      } else {
        console.log(`  ❌ Failed: ${result.error}`)
        failed++
      }
    } catch (error: any) {
      console.log(`  ❌ Error: ${error.message}`)
      failed++
    }

    console.log('')
  }

  console.log('\n📊 Summary:')
  console.log(`  Total processed: ${tracks.length}`)
  console.log(`  Successful: ${successful}`)
  console.log(`  Failed: ${failed}`)
}

// Run the script
refetchAppleMusicTracks()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message)
    process.exit(1)
  })
