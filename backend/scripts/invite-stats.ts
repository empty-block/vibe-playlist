/**
 * Display beta invite code statistics
 * Usage: bun run backend/scripts/invite-stats.ts
 */

import { getSupabaseClient } from '../lib/api-utils'

interface InviteStats {
  totalCodes: number
  totalRedemptions: number
  testCodes: number
  regularCodes: number
  unusedCodes: number
  redemptionRate: string
  recentRedemptions: Array<{
    redeemed_by_fid: string
    redeemed_at: string
    invite_code: string
  }>
}

async function getInviteStats(): Promise<InviteStats> {
  const supabase = getSupabaseClient()

  // Get total codes
  const { count: totalCodes } = await supabase
    .from('invite_codes')
    .select('*', { count: 'exact', head: true })

  // Get total redemptions
  const { count: totalRedemptions } = await supabase
    .from('invite_redemptions')
    .select('*', { count: 'exact', head: true })

  // Get test vs regular codes
  const { count: testCodes } = await supabase
    .from('invite_codes')
    .select('*', { count: 'exact', head: true })
    .eq('is_test_code', true)

  // Get unused codes
  const { count: unusedCodes } = await supabase
    .from('invite_codes')
    .select('*', { count: 'exact', head: true })
    .eq('current_uses', 0)
    .eq('is_active', true)

  // Get recent redemptions
  const { data: recentRedemptions } = await supabase
    .from('invite_redemptions')
    .select('redeemed_by_fid, redeemed_at, invite_code')
    .order('redeemed_at', { ascending: false })
    .limit(10)

  const regularCodes = (totalCodes || 0) - (testCodes || 0)
  const redemptionRate = totalCodes
    ? ((totalRedemptions || 0) / totalCodes * 100).toFixed(1) + '%'
    : '0%'

  return {
    totalCodes: totalCodes || 0,
    totalRedemptions: totalRedemptions || 0,
    testCodes: testCodes || 0,
    regularCodes,
    unusedCodes: unusedCodes || 0,
    redemptionRate,
    recentRedemptions: recentRedemptions || []
  }
}

async function displayStats() {
  console.log('\n📊 Beta Invite Code Statistics\n')
  console.log('═'.repeat(60))

  const stats = await getInviteStats()

  // Overall stats
  console.log('\n📈 OVERALL STATS')
  console.log('─'.repeat(60))
  console.log(`   Total Codes:        ${stats.totalCodes}`)
  console.log(`   Total Redemptions:  ${stats.totalRedemptions}`)
  console.log(`   Redemption Rate:    ${stats.redemptionRate}`)
  console.log(`   Unused Codes:       ${stats.unusedCodes}`)

  // Code breakdown
  console.log('\n🎫 CODE BREAKDOWN')
  console.log('─'.repeat(60))
  console.log(`   Regular Codes:      ${stats.regularCodes}`)
  console.log(`   Test Codes:         ${stats.testCodes}`)

  // Recent redemptions
  if (stats.recentRedemptions.length > 0) {
    console.log('\n🕐 RECENT REDEMPTIONS (Last 10)')
    console.log('─'.repeat(60))
    stats.recentRedemptions.forEach((redemption, index) => {
      const date = new Date(redemption.redeemed_at)
      const timeAgo = getTimeAgo(date)
      console.log(`   ${index + 1}. FID ${redemption.redeemed_by_fid} - ${timeAgo}`)
      console.log(`      Code: ${redemption.invite_code}`)
    })
  } else {
    console.log('\n🕐 RECENT REDEMPTIONS')
    console.log('─'.repeat(60))
    console.log('   No redemptions yet')
  }

  console.log('\n' + '═'.repeat(60))

  // Success metrics
  const redemptionPercent = parseFloat(stats.redemptionRate)
  if (redemptionPercent >= 75) {
    console.log('\n✅ Great! Redemption rate is above 75% target')
  } else if (redemptionPercent >= 50) {
    console.log('\n⚠️  Redemption rate is moderate. Consider distributing more codes.')
  } else if (stats.totalRedemptions > 0) {
    console.log('\n⚠️  Redemption rate is low. Codes may not be reaching users.')
  }

  console.log('\n')
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'just now'
}

// Run the script
displayStats()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error.message)
    console.error(error.stack)
    process.exit(1)
  })
