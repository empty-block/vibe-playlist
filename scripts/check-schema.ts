/**
 * Script to check current database schema
 * Run with: bun run scripts/check-schema.ts
 */

import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('🔍 Checking cast_nodes table structure...\n')

  // Try alternative method - just select from cast_nodes to see structure
  console.log('📋 Inferring schema from sample data...\n')

  const { data: sampleData, error: sampleError } = await supabase
    .from('cast_nodes')
    .select('*')
    .limit(1)

  if (sampleError) {
    console.error('❌ Error fetching sample data:', sampleError)
    return
  }

  if (sampleData && sampleData.length > 0) {
    console.log('✅ Cast nodes columns (inferred from sample):')
    const sample = sampleData[0]
    Object.keys(sample).forEach(key => {
      const value = sample[key]
      const type = value === null ? 'unknown (null)' : typeof value
      console.log(`  - ${key}: ${type}`)
    })
  }

  // Check for existing channels table
  console.log('\n🔍 Checking if channels table exists...\n')

  const { data: channelsData, error: channelsError } = await supabase
    .from('channels')
    .select('*')
    .limit(1)

  if (channelsError) {
    console.log('❌ Channels table does not exist yet')
    console.log('   Error:', channelsError.message)
  } else {
    console.log('✅ Channels table already exists!')
    if (channelsData && channelsData.length > 0) {
      console.log('   Sample channel:', JSON.stringify(channelsData[0], null, 2))
      console.log('   Channel columns:', Object.keys(channelsData[0]).join(', '))
    } else {
      console.log('   (Table exists but is empty)')
    }
  }

  // Check how many cast_nodes have channel data
  console.log('\n📊 Checking cast_nodes channel data...\n')

  const { data: channelStats, error: statsError } = await supabase
    .from('cast_nodes')
    .select('channel, cast_channel')
    .not('channel', 'is', null)
    .limit(5)

  if (!statsError && channelStats) {
    console.log(`✅ Found ${channelStats.length} cast_nodes with channel data (showing first 5):`)
    channelStats.forEach((cast: any) => {
      console.log(`   - channel: "${cast.channel}", cast_channel: "${cast.cast_channel}"`)
    })
  } else {
    console.log('❌ No cast_nodes with channel data found')
  }

  // Check existing functions
  console.log('\n🔍 Checking existing PostgreSQL functions...\n')

  const functions = [
    'get_threads_feed',
    'get_thread_with_replies',
    'get_user_threads',
    'get_activity_feed',
    'get_channels_list',
    'get_channel_feed',
    'get_channel_details'
  ]

  for (const funcName of functions) {
    const { data, error } = await supabase.rpc(funcName, {}).limit(0)
    if (error) {
      console.log(`  ❌ ${funcName} - does not exist`)
    } else {
      console.log(`  ✅ ${funcName} - exists`)
    }
  }
}

checkSchema()
  .then(() => {
    console.log('\n✅ Schema check complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Error:', err)
    process.exit(1)
  })
