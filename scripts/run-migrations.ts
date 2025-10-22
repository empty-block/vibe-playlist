#!/usr/bin/env bun
/**
 * Apply Phase 1 (TASK-639) Migrations for OpenGraph Music Metadata
 * Run with: bun run scripts/run-migrations.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Phase 1 migrations for TASK-639
const migrations = [
  'database/migrations/20251015100000_redesign_music_library_for_opengraph.sql',
  'database/migrations/20251015100001_update_cast_music_edges_schema.sql',
  'database/migrations/20251015100002_create_music_ai_queue.sql'
]

async function executeSql(filePath: string, description: string) {
  console.log(`\n📄 Applying: ${description}`)
  console.log(`   File: ${filePath}`)

  try {
    const sql = readFileSync(filePath, 'utf8')

    // Try to execute via RPC (if exec_sql function exists)
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
      // exec_sql doesn't exist - need manual application
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
  console.log('🚀 Applying Phase 1 Migrations (TASK-639): OpenGraph Music Metadata')
  console.log('=' .repeat(70))

  let successCount = 0
  let failCount = 0

  console.log('\n📦 Applying Migrations:')
  for (const migration of migrations) {
    const success = await executeSql(migration, migration.split('/').pop()!)
    if (success) successCount++
    else failCount++
  }

  console.log('\n' + '='.repeat(70))
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
  } else {
    console.log('\n✅ All migrations applied successfully!')
  }

  console.log('\n💡 Next steps:')
  console.log('   1. Verify schema changes with: psql $DATABASE_URL -c "\\d music_library"')
  console.log('   2. Check cast_music_edges: psql $DATABASE_URL -c "\\d cast_music_edges"')
  console.log('   3. Check music_ai_queue: psql $DATABASE_URL -c "\\d music_ai_queue"')
  console.log('   4. Proceed to Phase 2: Backend services')
}

applyMigrations()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\n❌ Fatal error:', err)
    process.exit(1)
  })
