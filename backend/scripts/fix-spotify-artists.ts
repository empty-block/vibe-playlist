/**
 * Fix Spotify artist URLs by re-fetching OpenGraph metadata
 *
 * This script finds all Spotify tracks with artist URLs (instead of names)
 * and re-fetches their OpenGraph metadata to extract proper artist names.
 */

import { getSupabaseClient } from '../lib/api-utils'
import { fetchOpenGraph } from '../lib/opengraph'

async function fixSpotifyArtists() {
  const supabase = getSupabaseClient()

  console.log('[Fix] Fetching Spotify tracks with URL artists...')

  // Get all Spotify tracks where og_artist starts with 'https://'
  const { data: tracks, error } = await supabase
    .from('music_library')
    .select('platform_id, url, og_artist')
    .eq('platform_name', 'spotify')
    .like('og_artist', 'https://%')

  if (error) {
    console.error('[Fix] Error fetching tracks:', error)
    return
  }

  if (!tracks || tracks.length === 0) {
    console.log('[Fix] No tracks with URL artists found!')
    return
  }

  console.log(`[Fix] Found ${tracks.length} tracks to fix`)

  let fixed = 0
  let failed = 0

  for (const track of tracks) {
    try {
      console.log(`\n[Fix] Processing ${track.platform_id}...`)
      console.log(`[Fix]   Current artist: ${track.og_artist}`)

      // Re-fetch OpenGraph metadata
      const ogData = await fetchOpenGraph(track.url, {
        timeout: 10000,
        retries: 1
      })

      if (!ogData.success || !ogData.og_artist) {
        console.log(`[Fix]   ✗ Failed to extract artist`)
        failed++
        continue
      }

      // Check if new artist is still a URL
      if (ogData.og_artist.startsWith('http')) {
        console.log(`[Fix]   ✗ Still got URL: ${ogData.og_artist}`)
        failed++
        continue
      }

      console.log(`[Fix]   ✓ New artist: ${ogData.og_artist}`)

      // Update the database
      const { error: updateError } = await supabase
        .from('music_library')
        .update({
          og_artist: ogData.og_artist,
          og_title: ogData.og_title,
          og_image_url: ogData.og_image_url,
          og_metadata: ogData.og_metadata,
          og_fetched_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('platform_name', 'spotify')
        .eq('platform_id', track.platform_id)

      if (updateError) {
        console.log(`[Fix]   ✗ Database update failed: ${updateError.message}`)
        failed++
      } else {
        fixed++
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))

    } catch (error: any) {
      console.error(`[Fix]   ✗ Error: ${error.message}`)
      failed++
    }
  }

  console.log(`\n[Fix] Complete: ${fixed} fixed, ${failed} failed out of ${tracks.length} total`)
}

// Run the fix
fixSpotifyArtists()
  .then(() => {
    console.log('[Fix] Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Fix] Script failed:', error)
    process.exit(1)
  })
