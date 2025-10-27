import { Hono } from 'hono';
import { createClient } from '@farcaster/quick-auth';
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

const authApp = new Hono();

// Initialize Quick Auth client
const quickAuthClient = createClient();

// Initialize Neynar client for fetching user data
const neynarApiKey = process.env.NEYNAR_API_KEY;
const neynar = neynarApiKey
  ? new NeynarAPIClient(new Configuration({ apiKey: neynarApiKey }))
  : null;

/**
 * Verify a Farcaster Quick Auth JWT token
 * POST /api/auth/verify
 * Body: { token: string }
 * Returns: { valid: boolean, fid?: string, error?: string }
 */
authApp.post('/verify', async (c) => {
  try {
    const { token, domain } = await c.req.json();

    if (!token) {
      return c.json({ valid: false, error: 'Token is required' }, 400);
    }

    // Verify the JWT token
    // For local development, use a test domain or the actual domain in production
    const verifyDomain = domain || 'localhost';
    const payload = await quickAuthClient.verifyJwt({ token, domain: verifyDomain });

    if (!payload) {
      return c.json({ valid: false, error: 'Invalid token' }, 401);
    }

    // Extract FID from the 'sub' claim
    const fid = payload.sub;

    if (!fid) {
      return c.json({ valid: false, error: 'FID not found in token' }, 401);
    }

    return c.json({
      valid: true,
      fid,
      payload,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return c.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

/**
 * Get user profile data from Farcaster
 * GET /api/auth/user/:fid
 * Returns user profile data from Neynar
 */
authApp.get('/user/:fid', async (c) => {
  try {
    const fid = parseInt(c.req.param('fid'));

    if (isNaN(fid)) {
      return c.json({ error: 'Invalid FID' }, 400);
    }

    if (!neynar) {
      return c.json({ error: 'Neynar API key not configured' }, 500);
    }

    // Fetch user data from Neynar
    const userData = await neynar.fetchBulkUsers({ fids: [fid] });

    if (!userData.users || userData.users.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData.users[0];

    return c.json({
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
      bio: user.profile?.bio?.text,
      followerCount: user.follower_count,
      followingCount: user.following_count,
      verifications: user.verifications,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

/**
 * Middleware to verify auth token from Authorization header
 * Can be used to protect other endpoints
 */
export const verifyAuthMiddleware = async (c: any, next: any) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Authorization header required' }, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // For local development, use localhost as domain
    const payload = await quickAuthClient.verifyJwt({ token, domain: 'localhost' });

    if (!payload || !payload.sub) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Store FID in context for use in route handlers
    c.set('fid', payload.sub);

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Authentication failed',
      },
      401
    );
  }
};

/**
 * Protected route example - requires valid JWT token
 * GET /api/auth/me
 * Returns current user info based on token
 */
authApp.get('/me', verifyAuthMiddleware, async (c) => {
  try {
    const fidValue = c.get('fid' as never);
    const fid = parseInt(fidValue as string);

    if (!neynar) {
      return c.json({ error: 'Neynar API key not configured' }, 500);
    }

    // Fetch user data from Neynar
    const userData = await neynar.fetchBulkUsers({ fids: [fid] });

    if (!userData.users || userData.users.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData.users[0];

    return c.json({
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
      bio: user.profile?.bio?.text,
      followerCount: user.follower_count,
      followingCount: user.following_count,
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default authApp;
