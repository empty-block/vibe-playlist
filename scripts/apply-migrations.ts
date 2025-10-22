/**
 * Script to apply channels migrations to remote Supabase database
 * Run with: bun run scripts/apply-migrations.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// Migration files in order
const migrations = [
  'database/migrations/20251014000000_create_missing_thread_functions.sql',
  'database/migrations/20251014000001_create_channels_table.sql',
  'database/migrations/20251014000002_seed_channels.sql',
]

const functions = [
  'database/functions/get_channels_list.sql',
  'database/functions/get_channel_feed.sql',
  'database/functions/get_channel_details.sql',
]

async function executeSql(filePath: string, description: string) {
  console.log(`\n📄 Applying: ${description}`)
  console.log(`   File: ${filePath}`)

  try {
    const sql = readFileSync(filePath, 'utf8')

    // For Supabase, we need to execute via RPC or direct query
    // Since Supabase doesn't have a direct SQL execution API in the client,
    // we'll need to use the REST API directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ sql })
    })

    if (!response.ok) {
      // If exec_sql doesn't exist, try to execute via pg query
      // This is a workaround - ideally use Supabase SQL Editor
      console.log('   ⚠️  Cannot execute via API - please use Supabase SQL Editor')
      console.log('   📋 Copy/paste this file into SQL Editor:')
      console.log(`      ${filePath}`)
      return false
    }

    console.log('   ✅ Applied successfully')
    return true
  } catch (error: any) {
    console.error('   ❌ Error:', error.message)
    console.log('   📋 Please apply manually via Supabase SQL Editor')
    console.log(`      File: ${filePath}`)
    return false
  }
}

async function applyMigrations() {
  console.log('🚀 Applying Channels Migrations to Remote Supabase')
  console.log('=' .repeat(60))

  // Try to apply migrations
  let successCount = 0
  let failCount = 0

  console.log('\n📦 Step 1: Applying Migrations')
  for (const migration of migrations) {
    const success = await executeSql(migration, migration.split('/').pop()!)
    if (success) successCount++
    else failCount++
  }

  console.log('\n📦 Step 2: Creating Functions')
  for (const func of functions) {
    const success = await executeSql(func, func.split('/').pop()!)
    if (success) successCount++
    else failCount++
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Summary:')
  console.log(`   ✅ Successful: ${successCount}`)
  console.log(`   ❌ Failed: ${failCount}`)

  if (failCount > 0) {
    console.log('\n⚠️  Some migrations could not be applied automatically.')
    console.log('   Please apply them manually via Supabase SQL Editor:')
    console.log('   1. Go to your Supabase project dashboard')
    console.log('   2. Navigate to SQL Editor')
    console.log('   3. Copy/paste and run each file in order:')

    console.log('\n   Migrations:')
    migrations.forEach(m => console.log(`      - ${m}`))

    console.log('\n   Functions:')
    functions.forEach(f => console.log(`      - ${f}`))

    console.log('\n   See database/APPLY_MIGRATIONS.md for detailed instructions.')
  }

  console.log('\n✅ Migration script complete!')
  console.log('\n💡 Next steps:')
  console.log('   1. Run: bun run scripts/check-schema.ts')
  console.log('   2. Verify channels exist and functions work')
  console.log('   3. Test API endpoints')
}

applyMigrations()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\n❌ Fatal error:', err)
    process.exit(1)
  })
