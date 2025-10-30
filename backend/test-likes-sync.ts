import { syncRecentCastReactions } from './lib/likes-sync-worker'

console.log('🧪 Testing likes sync function directly...\n')

try {
  const result = await syncRecentCastReactions()
  console.log('✅ SUCCESS!')
  console.log(JSON.stringify(result, null, 2))
  process.exit(0)
} catch (error: any) {
  console.error('❌ ERROR:', error.message)
  console.error('Stack:', error.stack)
  process.exit(1)
}
