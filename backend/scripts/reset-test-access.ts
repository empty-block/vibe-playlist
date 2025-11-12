#!/usr/bin/env bun
/**
 * Reset Test Access
 *
 * Clears invite redemption for test FID (3) so you can test the invite gate again.
 *
 * Usage:
 *   bun run backend/scripts/reset-test-access.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function resetTestAccess() {
  console.log('🧹 Clearing test FID (3) redemption...\n');

  const { error } = await supabase
    .from('invite_redemptions')
    .delete()
    .eq('redeemed_by_fid', '3');

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  console.log('✅ Test access reset! You can now test the invite gate again.');
  console.log('🎵 Use code: JAMZY-5RS389Q9 (unlimited uses)');
}

resetTestAccess();
