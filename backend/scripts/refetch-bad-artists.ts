/**
 * Script to re-fetch OpenGraph metadata for tracks with bad artist data
 * Fixes platform names ("YouTube", "Spotify") and NULL artists
 */

import { processMusicUrl } from '../lib/music-metadata-extractor'
import { getSupabaseClient } from '../lib/api-utils'

async function refetchBadArtists() {
  console.log('🎵 Re-fetching tracks with bad artist data...\n')

  const supabase = getSupabaseClient()

  // Get all tracks with problematic artist data
  const { data: tracks, error } = await supabase
    .from('music_library')
    .select('platform_name, platform_id, url, og_artist, og_title')
    .or(`og_artist.eq.YouTube,og_artist.ilike.%Spotify%,og_artist.eq.SoundCloud,and(og_artist.is.null,og_title.not.is.null)`)
    .order('url')

  if (error) {
    console.error('❌ Failed to fetch tracks:', error.message)
    process.exit(1)
  }

  if (!tracks || tracks.length === 0) {
    console.log('No tracks with bad artist data found')
    process.exit(0)
  }

  console.log(`Found ${tracks.length} tracks to re-fetch\n`)

  // Group by issue type for reporting
  const youtube = tracks.filter(t => t.og_artist === 'YouTube')
  const spotify = tracks.filter(t => t.og_artist?.includes('Spotify'))
  const soundcloud = tracks.filter(t => t.og_artist === 'SoundCloud')
  const nullArtist = tracks.filter(t => !t.og_artist && t.og_title)

  console.log('📊 Breakdown:')
  console.log(`  YouTube as artist: ${youtube.length}`)
  console.log(`  Spotify in artist: ${spotify.length}`)
  console.log(`  SoundCloud as artist: ${soundcloud.length}`)
  console.log(`  NULL artist (with title): ${nullArtist.length}`)
  console.log('')

  let successful = 0
  let failed = 0
  let improved = 0

  for (const track of tracks) {
    console.log(`Processing: ${track.url}`)
    console.log(`  Current: og_artist="${track.og_artist}", og_title="${track.og_title}"`)

    try {
      const result = await processMusicUrl(track.url)

      if (result.success && result.metadata) {
        const newArtist = result.metadata.og_artist
        const newTitle = result.metadata.og_title

        // Check if it actually improved
        const wasImproved = (
          (track.og_artist === 'YouTube' && newArtist && newArtist !== 'YouTube') ||
          (track.og_artist?.includes('Spotify') && newArtist && !newArtist.includes('Spotify')) ||
          (track.og_artist === 'SoundCloud' && newArtist && newArtist !== 'SoundCloud') ||
          (!track.og_artist && newArtist)
        )

        if (wasImproved) {
          console.log(`  ✅ Improved: og_artist="${newArtist}", og_title="${newTitle}"`)
          improved++
        } else if (newArtist) {
          console.log(`  ✓ Processed: og_artist="${newArtist}", og_title="${newTitle}"`)
        } else {
          console.log(`  ⚠️  Still NULL: og_artist=null, og_title="${newTitle}"`)
        }
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
  console.log(`  Improved: ${improved}`)
  console.log(`  Failed: ${failed}`)
  console.log(`  Improvement rate: ${((improved / tracks.length) * 100).toFixed(1)}%`)
}

// Run the script
refetchBadArtists()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message)
    process.exit(1)
  })
