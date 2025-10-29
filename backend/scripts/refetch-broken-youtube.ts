/**
 * Script to re-fetch the 5 YouTube tracks corrupted by Cloudflare blocking
 */

import { processMusicUrl } from '../lib/music-metadata-extractor'
import { getSupabaseClient } from '../lib/api-utils'

async function refetchBrokenYouTube() {
  console.log('🎵 Re-fetching broken YouTube tracks...\n')

  // The 5 corrupted tracks from Oct 29
  const urls = [
    'https://www.youtube.com/watch?v=PpTPK_-0tXQ',
    'https://www.youtube.com/watch?v=-7vecA0zHtg',
    'https://youtu.be/jhgC3FncHBo?si=zxrCg2k3UQslogjU',
    'https://www.youtube.com/watch?v=FDvJFc9eJao',
    'https://www.youtube.com/watch?v=1eFVkb_6otg'
  ]

  console.log(`Refetching ${urls.length} YouTube tracks\n`)

  let successful = 0
  let failed = 0

  for (const url of urls) {
    console.log(`Processing: ${url}`)

    try {
      const result = await processMusicUrl(url)

      if (result.success && result.metadata) {
        console.log(`  ✅ Success: "${result.metadata.og_title}" by ${result.metadata.og_artist || 'Unknown'}`)
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
  console.log(`  Total processed: ${urls.length}`)
  console.log(`  Successful: ${successful}`)
  console.log(`  Failed: ${failed}`)
}

// Run the script
refetchBrokenYouTube()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message)
    process.exit(1)
  })
