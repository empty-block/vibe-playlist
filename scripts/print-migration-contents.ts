/**
 * Script to print migration contents for easy copy/paste into Supabase SQL Editor
 * Run with: bun run scripts/print-migration-contents.ts
 */

import { readFileSync } from 'fs'

const files = [
  'database/migrations/20251014000000_create_missing_thread_functions.sql',
  'database/migrations/20251014000001_create_channels_table.sql',
  'database/migrations/20251014000002_seed_channels.sql',
  'database/functions/get_channels_list.sql',
  'database/functions/get_channel_feed.sql',
  'database/functions/get_channel_details.sql',
]

console.log('📋 CHANNELS MIGRATIONS - COPY/PASTE INTO SUPABASE SQL EDITOR')
console.log('=' .repeat(80))
console.log('')
console.log('Instructions:')
console.log('1. Open your Supabase project: https://supabase.com/dashboard/project/_')
console.log('2. Go to SQL Editor')
console.log('3. Create a new query')
console.log('4. Copy/paste each section below and run it')
console.log('5. Check for errors after each execution')
console.log('')
console.log('=' .repeat(80))

files.forEach((file, index) => {
  const fileName = file.split('/').pop()
  const content = readFileSync(file, 'utf8')

  console.log('')
  console.log('')
  console.log('=' .repeat(80))
  console.log(`STEP ${index + 1}: ${fileName}`)
  console.log('=' .repeat(80))
  console.log('')
  console.log(content)
  console.log('')
  console.log(`✅ After running this, verify no errors before proceeding to Step ${index + 2}`)
})

console.log('')
console.log('=' .repeat(80))
console.log('🎉 ALL DONE!')
console.log('=' .repeat(80))
console.log('')
console.log('Next steps:')
console.log('1. Run: bun run scripts/check-schema.ts')
console.log('2. Should see all channels and functions exist')
console.log('3. Then test the backend API endpoints')
console.log('')
