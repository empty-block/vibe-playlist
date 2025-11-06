import { getNeynarService } from './lib/neynar'

const castHash = '0x082097b59df84cef4e47bc78bf55f1d98e39ad1c'
const neynar = getNeynarService()

async function checkReactions() {
  console.log('Fetching reactions for cast:', castHash)
  
  const result = await neynar.fetchCastReactions(castHash, {
    types: ['likes'],
    limit: 100,
    viewerFid: 3
  })
  
  console.log('\nTotal likes returned:', result.likes.length)
  
  console.log('\nFirst 10 likes user data check:')
  result.likes.slice(0, 10).forEach((like: any, i: number) => {
    console.log(`Like ${i+1}:`, {
      hasUser: like.user ? 'YES' : 'NO',
      hasFid: like.user?.fid ? 'YES' : 'NO',
      fid: like.user?.fid,
      username: like.user?.username,
      displayName: like.user?.display_name
    })
  })
  
  const nullUsers = result.likes.filter((like: any) => !like.user || !like.user.fid).length
  console.log(`\nLikes with null/undefined user: ${nullUsers} out of ${result.likes.length}`)
  
  if (result.likes.length > 0) {
    console.log('\nFull data for first like:')
    console.log(JSON.stringify(result.likes[0], null, 2))
  }
}

checkReactions().catch(console.error)
