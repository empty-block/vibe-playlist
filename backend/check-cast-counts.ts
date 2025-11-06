import { getNeynarService } from './lib/neynar'

const castHash = '0x082097b59df84cef4e47bc78bf55f1d98e39ad1c'
const neynar = getNeynarService()

async function checkCounts() {
  const casts = await neynar.fetchBulkCasts([castHash])

  if (casts.length > 0) {
    const cast = casts[0]
    const likesCount = cast.reactions?.likes_count || 0
    const recastsCount = cast.reactions?.recasts_count || 0
    const repliesCount = cast.replies?.count || 0

    console.log('Cast reaction counts from Neynar:')
    console.log(`  Likes: ${likesCount}`)
    console.log(`  Recasts: ${recastsCount}`)
    console.log(`  Replies: ${repliesCount}`)
    console.log()
    console.log('Comparison with our DB:')
    console.log(`  Our DB has 254 likes (difference: ${254 - likesCount})`)
    console.log(`  Our DB has 47 recasts (difference: ${47 - recastsCount})`)
  } else {
    console.log('Cast not found')
  }
}

checkCounts().catch(console.error)
