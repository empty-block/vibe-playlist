/**
 * Generate beta invite codes
 * Usage:
 *   bun run backend/scripts/generate-invite-codes.ts 500
 *   bun run backend/scripts/generate-invite-codes.ts --test 3
 */

import { customAlphabet } from 'nanoid'
import { getSupabaseClient } from '../lib/api-utils'

// Generate invite codes without confusing characters (0, O, I, 1, l)
const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8)

interface GenerateOptions {
  count: number
  isTest: boolean
}

function parseArgs(): GenerateOptions {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('Usage: bun run backend/scripts/generate-invite-codes.ts <count>')
    console.error('       bun run backend/scripts/generate-invite-codes.ts --test <count>')
    console.error('')
    console.error('Examples:')
    console.error('  bun run backend/scripts/generate-invite-codes.ts 500     # Generate 500 regular codes')
    console.error('  bun run backend/scripts/generate-invite-codes.ts --test 3  # Generate 3 test codes (unlimited uses)')
    process.exit(1)
  }

  let isTest = false
  let count = 0

  if (args[0] === '--test') {
    isTest = true
    count = parseInt(args[1] || '1', 10)
  } else {
    count = parseInt(args[0], 10)
  }

  if (isNaN(count) || count < 1 || count > 1000) {
    console.error('Error: Count must be a number between 1 and 1000')
    process.exit(1)
  }

  return { count, isTest }
}

async function generateInviteCodes(options: GenerateOptions) {
  const { count, isTest } = options

  console.log(`\n🎫 Generating ${count} ${isTest ? 'test' : 'beta'} invite code${count > 1 ? 's' : ''}...\n`)

  const supabase = getSupabaseClient()
  const codes: string[] = []
  const codeRecords = []

  // Generate codes
  for (let i = 0; i < count; i++) {
    const code = `JAMZY-${nanoid()}`
    codes.push(code)
    codeRecords.push({
      code,
      max_uses: isTest ? 999999 : 1,
      is_test_code: isTest,
      is_active: true
    })
  }

  // Insert into database
  const { error } = await supabase
    .from('invite_codes')
    .insert(codeRecords)

  if (error) {
    console.error('❌ Error creating invite codes:', error.message)
    process.exit(1)
  }

  // Display results
  console.log(`✅ Successfully generated ${count} ${isTest ? 'test' : 'beta'} code${count > 1 ? 's' : ''}!\n`)

  if (isTest) {
    console.log('⚠️  TEST CODES (Unlimited uses - save these somewhere safe!)\n')
  }

  // Display codes in a nice format
  codes.forEach((code, index) => {
    console.log(`   ${index + 1}. ${code}`)
  })

  console.log('\n')

  // Save to CSV file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const filename = `invite-codes-${isTest ? 'test' : 'beta'}-${timestamp}.csv`
  const csvContent = [
    'code,type,max_uses,is_test',
    ...codes.map(code => `${code},${isTest ? 'test' : 'beta'},${isTest ? 999999 : 1},${isTest}`)
  ].join('\n')

  await Bun.write(filename, csvContent)
  console.log(`📝 Codes saved to: ${filename}\n`)

  if (isTest) {
    console.log('💡 Tip: Test codes have unlimited uses and won\'t count toward beta metrics.')
    console.log('   Keep them secret for testing/demo purposes only!\n')
  } else {
    console.log('💡 Tip: Each code can be redeemed once. Distribute via Farcaster DMs or posts.\n')
  }
}

// Run the script
const options = parseArgs()
generateInviteCodes(options)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error.message)
    process.exit(1)
  })
