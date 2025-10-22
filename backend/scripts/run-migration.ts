import { getSupabaseClient } from '../lib/api-utils'
import { readFileSync } from 'fs'

const migrationFile = process.argv[2]

if (!migrationFile) {
  console.error('Usage: bun run scripts/run-migration.ts <migration-file>')
  process.exit(1)
}

const supabase = getSupabaseClient()
const sql = readFileSync(migrationFile, 'utf8')

console.log(`Running migration: ${migrationFile}`)
console.log('SQL:', sql)

// Split by semicolons and run each statement
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))

for (const statement of statements) {
  console.log('\nExecuting:', statement.substring(0, 100) + '...')

  const { data, error } = await supabase.rpc('exec_raw_sql', { sql_query: statement })

  if (error) {
    console.error('Error:', error)
    process.exit(1)
  }

  console.log('✓ Success')
}

console.log('\n✅ Migration completed successfully')
