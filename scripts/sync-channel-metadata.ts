/**
 * Script to sync channel metadata from Neynar API
 * Run with: bun run scripts/sync-channel-metadata.ts
 *
 * This script fetches channel descriptions, icons, and banners from Neynar
 * and updates the channels table in the database.
 */

import { getSupabaseClient } from '../backend/lib/api-utils'
import { getNeynarService } from '../backend/lib/neynar'

const supabase = getSupabaseClient()

interface ChannelMetadata {
  id: string
  name: string
  description: string
  image_url: string
  lead_fid?: number
  created_at: number
}

async function syncChannelMetadata() {
  console.log('🔄 Starting channel metadata sync...\n')

  // 1. Get all active channels from our database
  console.log('📋 Fetching channels from database...')
  const { data: channels, error: fetchError } = await supabase
    .from('channels')
    .select('id, name')
    .eq('is_archived', false)

  if (fetchError) {
    console.error('❌ Error fetching channels:', fetchError)
    process.exit(1)
  }

  if (!channels || channels.length === 0) {
    console.log('⚠️  No channels found in database')
    process.exit(0)
  }

  console.log(`✅ Found ${channels.length} channels to sync\n`)

  // 2. Fetch channel metadata from Neynar (bulk)
  console.log('🌐 Fetching metadata from Neynar API...')
  const neynar = getNeynarService()
  const channelIds = channels.map(c => c.id)

  let channelDetails: ChannelMetadata[]
  try {
    channelDetails = await neynar.fetchBulkChannelDetails(channelIds)
    console.log(`✅ Retrieved metadata for ${channelDetails.length} channels\n`)
  } catch (error) {
    console.error('❌ Error fetching from Neynar:', error)
    process.exit(1)
  }

  // 3. Update database with metadata
  console.log('💾 Updating database...\n')

  const results = {
    updated: 0,
    errors: [] as Array<{ channelId: string; error: string }>
  }

  for (const details of channelDetails) {
    try {
      const { error: updateError } = await supabase
        .from('channels')
        .update({
          description: details.description || null,
          icon_url: details.image_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', details.id)

      if (updateError) {
        results.errors.push({
          channelId: details.id,
          error: updateError.message
        })
        console.error(`  ❌ ${details.id}: ${updateError.message}`)
      } else {
        results.updated++
        console.log(`  ✅ ${details.id}: Updated (description: ${details.description?.substring(0, 50)}...)`)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      results.errors.push({
        channelId: details.id,
        error: errorMsg
      })
      console.error(`  ❌ ${details.id}: ${errorMsg}`)
    }
  }

  // 4. Summary
  console.log('\n📊 Sync Summary:')
  console.log(`  ✅ Successfully updated: ${results.updated}`)
  console.log(`  ❌ Errors: ${results.errors.length}`)

  if (results.errors.length > 0) {
    console.log('\n❌ Failed channels:')
    results.errors.forEach(({ channelId, error }) => {
      console.log(`  - ${channelId}: ${error}`)
    })
    process.exit(1)
  }

  console.log('\n✅ Channel metadata sync complete!')
}

syncChannelMetadata()
  .then(() => {
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Unexpected error:', err)
    process.exit(1)
  })
