import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = 'https://slvausegbbrrzscxkghj.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsdmF1c2VnYmJycnpzY3hrZ2hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzM0MjExNSwiZXhwIjoyMDYyOTE4MTE1fQ.pWoKqZmrEhNq5fDkdfMKK5Nff4O6RE24jS_utdSHFIs'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  try {
    console.log('Reading migration file...')
    const sql = readFileSync('./migrations/20251008000000_create_threads_api_functions.sql', 'utf-8')

    console.log('Applying migration to remote database...')
    const { data, error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
      // Try direct query instead
      console.log('Trying direct SQL execution...')
      const result = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        },
        body: JSON.stringify({ query: sql })
      })

      if (!result.ok) {
        throw new Error(`Failed to apply migration: ${result.statusText}`)
      }

      console.log('Migration applied successfully via REST API!')
    } else {
      console.log('Migration applied successfully!')
    }
  } catch (error) {
    console.error('Error applying migration:', error)
    process.exit(1)
  }
}

applyMigration()
