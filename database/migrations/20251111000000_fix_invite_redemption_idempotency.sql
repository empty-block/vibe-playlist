-- Fix invite code redemption to be idempotent
-- Allow re-entering the same code, only block using different codes

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

COMMENT ON FUNCTION redeem_invite_code IS 'Atomically redeem an invite code for a Farcaster ID with validation. Idempotent - allows re-entering same code.';
