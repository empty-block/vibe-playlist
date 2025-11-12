-- Beta invite code system for mini-app access control
-- Creates tables for invite codes and redemption tracking

CREATE TABLE invite_codes (
  code TEXT PRIMARY KEY,
  created_by_fid TEXT,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  is_test_code BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invite_redemptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invite_code TEXT NOT NULL REFERENCES invite_codes(code),
  redeemed_by_fid TEXT NOT NULL,
  redeemed_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  UNIQUE(redeemed_by_fid)  -- One redemption per FID
);

-- Indexes for performance
CREATE INDEX idx_invite_codes_active ON invite_codes(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_invite_codes_test ON invite_codes(is_test_code);
CREATE INDEX idx_redemptions_fid ON invite_redemptions(redeemed_by_fid);
CREATE INDEX idx_redemptions_code ON invite_redemptions(invite_code);

-- Table comments
COMMENT ON TABLE invite_codes IS 'Beta invite codes for mini-app access control';
COMMENT ON TABLE invite_redemptions IS 'Track which FIDs have redeemed invite codes (one per FID)';
COMMENT ON COLUMN invite_codes.is_test_code IS 'Test codes have unlimited uses and do not count toward beta user metrics';
COMMENT ON COLUMN invite_codes.max_uses IS 'Maximum number of times this code can be redeemed (999999 for test codes)';
COMMENT ON COLUMN invite_redemptions.redeemed_by_fid IS 'Farcaster ID that redeemed this code';

-- Function to atomically redeem an invite code
CREATE OR REPLACE FUNCTION redeem_invite_code(
  p_code TEXT,
  p_fid TEXT,
  p_ip_address TEXT DEFAULT NULL
) RETURNS TABLE (
  success BOOLEAN,
  error_code TEXT,
  error_message TEXT
) AS $$
DECLARE
  v_code_record RECORD;
  v_existing_redemption RECORD;
BEGIN
  -- Check if FID already has a redemption
  SELECT * INTO v_existing_redemption
  FROM invite_redemptions
  WHERE redeemed_by_fid = p_fid;

  IF FOUND THEN
    -- If they already redeemed this exact same code, just return success (idempotent)
    IF v_existing_redemption.invite_code = p_code THEN
      RETURN QUERY SELECT TRUE, NULL::TEXT, NULL::TEXT;
      RETURN;
    ELSE
      -- They're trying to use a different code - block this
      RETURN QUERY SELECT FALSE, 'ALREADY_REDEEMED'::TEXT, 'This account has already redeemed an invite code'::TEXT;
      RETURN;
    END IF;
  END IF;

  -- Get and lock the invite code
  SELECT * INTO v_code_record
  FROM invite_codes
  WHERE code = p_code
  FOR UPDATE;

  -- Check if code exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'INVALID_CODE'::TEXT, 'Invalid invite code'::TEXT;
    RETURN;
  END IF;

  -- Check if code is active
  IF NOT v_code_record.is_active THEN
    RETURN QUERY SELECT FALSE, 'INACTIVE_CODE'::TEXT, 'This invite code is no longer active'::TEXT;
    RETURN;
  END IF;

  -- Check if code has expired
  IF v_code_record.expires_at IS NOT NULL AND v_code_record.expires_at < NOW() THEN
    RETURN QUERY SELECT FALSE, 'EXPIRED_CODE'::TEXT, 'This invite code has expired'::TEXT;
    RETURN;
  END IF;

  -- Check if code has uses remaining
  IF v_code_record.current_uses >= v_code_record.max_uses THEN
    RETURN QUERY SELECT FALSE, 'CODE_EXHAUSTED'::TEXT, 'This invite code has already been used'::TEXT;
    RETURN;
  END IF;

  -- All checks passed, create redemption
  INSERT INTO invite_redemptions (invite_code, redeemed_by_fid, ip_address)
  VALUES (p_code, p_fid, p_ip_address);

  -- Increment usage count
  UPDATE invite_codes
  SET current_uses = current_uses + 1,
      updated_at = NOW()
  WHERE code = p_code;

  -- Return success
  RETURN QUERY SELECT TRUE, NULL::TEXT, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION redeem_invite_code IS 'Atomically redeem an invite code for a Farcaster ID with validation';

-- Grant permissions
GRANT ALL ON invite_codes TO anon, authenticated;
GRANT ALL ON invite_redemptions TO anon, authenticated;
GRANT EXECUTE ON FUNCTION redeem_invite_code TO anon, authenticated;
