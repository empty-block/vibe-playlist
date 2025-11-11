/**
 * Invite code utilities for beta access control
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4201';

export interface InviteStatus {
  hasAccess: boolean;
  devMode?: boolean;
  redemption?: {
    id: string;
    redeemed_at: string;
    invite_code: string;
  } | null;
}

export interface RedemptionResult {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Check if a Farcaster ID has invite access
 */
export async function checkInviteStatus(fid: string): Promise<InviteStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/invites/check-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fid }),
    });

    if (!response.ok) {
      console.error('Failed to check invite status:', response.statusText);
      // If dev mode bypass is enabled, allow access even on error
      if (import.meta.env.DEV) {
        return { hasAccess: true, devMode: true };
      }
      return { hasAccess: false };
    }

    const data = await response.json();

    // Dev mode bypass - always grant access in development
    if (import.meta.env.DEV) {
      return { hasAccess: true, devMode: true };
    }

    return data;
  } catch (error) {
    console.error('Error checking invite status:', error);
    // If dev mode bypass is enabled, allow access even on error
    if (import.meta.env.DEV) {
      return { hasAccess: true, devMode: true };
    }
    return { hasAccess: false };
  }
}

/**
 * Verify if an invite code is valid (without redeeming)
 */
export async function verifyInviteCode(code: string): Promise<{ valid: boolean; error?: { code: string; message: string } }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/invites/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      return {
        valid: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to verify invite code'
        }
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying invite code:', error);
    return {
      valid: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Network error occurred'
      }
    };
  }
}

/**
 * Redeem an invite code for a Farcaster ID
 */
export async function redeemInviteCode(code: string, fid: string): Promise<RedemptionResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/invites/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, fid }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to redeem invite code'
        }
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error redeeming invite code:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Network error occurred'
      }
    };
  }
}
