import { getSupabaseClient } from '../lib/api-utils'

const supabase = getSupabaseClient()

console.log('Adding total_casts_synced column to channel_sync_status...')

// First, check if column already exists
const { data: columns } = await supabase
  .from('channel_sync_status')
  .select('*')
  .limit(1)

console.log('Current columns:', Object.keys(columns?.[0] || {}))

// Check if total_casts_synced already exists
if (columns?.[0] && 'total_casts_synced' in columns[0]) {
  console.log('✓ Column already exists')
} else {
  console.log('Column does not exist yet - will need to add via Supabase SQL editor')
  console.log('\nPlease run this SQL in Supabase SQL editor:')
  console.log(`
ALTER TABLE channel_sync_status
ADD COLUMN IF NOT EXISTS total_casts_synced INTEGER DEFAULT 0;

UPDATE channel_sync_status cs
SET total_casts_synced = (
  SELECT COUNT(*)
  FROM cast_nodes cn
  WHERE cn.channel = cs.channel_id
);
  `)
}

// Get current cast count for hiphop channel
const { data: castCount } = await supabase
  .from('cast_nodes')
  .select('node_id', { count: 'exact', head: true })
  .eq('channel', 'hiphop')

console.log(`\nCurrent hiphop cast count in database: ${castCount?.length || 0}`)
