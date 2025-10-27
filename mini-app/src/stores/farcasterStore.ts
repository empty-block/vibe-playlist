import { createSignal, createEffect } from 'solid-js';
import sdk from '@farcaster/miniapp-sdk';

// Farcaster authentication state
export const [farcasterAuth, setFarcasterAuth] = createSignal<{
  isAuthenticated: boolean;
  fid: string | null;
  username: string | null;
  displayName: string | null;
  pfpUrl: string | null;
  token: string | null;
}>({
  isAuthenticated: false,
  fid: null,
  username: null,
  displayName: null,
  pfpUrl: null,
  token: null,
});

export const [farcasterLoading, setFarcasterLoading] = createSignal(false);
export const [farcasterError, setFarcasterError] = createSignal<string | null>(null);

// Cache the Mini App detection result to avoid repeated async checks
let cachedMiniAppStatus: boolean | null = null;

/**
 * Check if we're running in a Farcaster context
 * Uses the official SDK method to detect Mini App environment
 * Result is cached after first check for performance
 */
const isInFarcasterContext = async (): Promise<boolean> => {
  // Return cached result if available
  if (cachedMiniAppStatus !== null) {
    return cachedMiniAppStatus;
  }

  try {
    // Use the official SDK method to check if we're in a Mini App
    const isMiniApp = await sdk.isInMiniApp();
    console.log('SDK isInMiniApp check:', isMiniApp);
    cachedMiniAppStatus = isMiniApp;
    return isMiniApp;
  } catch (error) {
    // If the check fails, we're not in Farcaster
    console.log('isInMiniApp check failed:', error);
    cachedMiniAppStatus = false;
    return false;
  }
};

/**
 * Initialize Farcaster authentication
 * This will get the auth token and extract user info from the context
 */
export const initializeFarcaster = async () => {
  setFarcasterLoading(true);
  setFarcasterError(null);

  try {
    // Check if we're in a Farcaster context using the SDK's official method
    const isInMiniApp = await isInFarcasterContext();

    if (!isInMiniApp) {
      console.log('Not in Farcaster Mini App - running in standalone mode');
      // For local development, we can still work without Farcaster context
      setFarcasterAuth({
        isAuthenticated: false,
        fid: null,
        username: null,
        displayName: null,
        pfpUrl: null,
        token: null,
      });
      setFarcasterLoading(false);
      return;
    }

    console.log('Farcaster Mini App context detected!');
    console.log('SDK context:', sdk.context);

    // Get the authentication token using Quick Auth
    const token = await sdk.quickAuth.getToken();
    console.log('Got Quick Auth token:', token ? 'Yes' : 'No');

    // Extract FID from context
    const fid = sdk.context?.user?.fid?.toString() || null;
    const username = sdk.context?.user?.username || null;
    const displayName = sdk.context?.user?.displayName || null;
    const pfpUrl = sdk.context?.user?.pfpUrl || null;

    console.log('Farcaster user info:', {
      fid,
      username,
      displayName,
      pfpUrl: pfpUrl ? 'Yes' : 'No',
    });

    setFarcasterAuth({
      isAuthenticated: true,
      fid,
      username,
      displayName,
      pfpUrl,
      token,
    });

    // Store token in localStorage for API calls
    if (token) {
      localStorage.setItem('farcaster_token', token);
    }
  } catch (error) {
    console.log('Not in Farcaster context (caught error):', error);

    // Set to unauthenticated state - this is normal for local dev
    setFarcasterAuth({
      isAuthenticated: false,
      fid: null,
      username: null,
      displayName: null,
      pfpUrl: null,
      token: null,
    });
  } finally {
    setFarcasterLoading(false);
  }
};

/**
 * Refresh the auth token
 * Useful when the token expires or needs to be refreshed
 */
export const refreshFarcasterToken = async (): Promise<string | null> => {
  try {
    const isInMiniApp = await isInFarcasterContext();
    if (!isInMiniApp) {
      console.log('Not in Farcaster context - cannot refresh token');
      return null;
    }

    const token = await sdk.quickAuth.getToken();

    if (token) {
      localStorage.setItem('farcaster_token', token);
      setFarcasterAuth(prev => ({ ...prev, token }));
    }

    return token;
  } catch (error) {
    console.log('Failed to refresh Farcaster token (not in Farcaster):', error);
    return null;
  }
};

/**
 * Make an authenticated fetch request using Quick Auth
 * This automatically includes the Bearer token in the Authorization header
 *
 * IMPORTANT: For now, we're using regular fetch even in Farcaster context
 * because sdk.quickAuth.fetch() may have CORS/proxy issues in the WebView.
 * We'll add auth headers manually when backend auth is needed.
 */
export const farcasterFetch = async (
  url: string,
  options?: RequestInit
): Promise<Response> => {
  try {
    // For now, always use regular fetch to avoid SDK fetch issues
    // The API endpoints don't require auth yet
    return fetch(url, options);

    /* TODO: Re-enable when backend auth is implemented
    // Check if we're in a Farcaster context (cached check)
    const isInMiniApp = await isInFarcasterContext();

    // If we're not in a Farcaster context, use regular fetch
    if (!isInMiniApp) {
      return fetch(url, options);
    }

    // Get token and add to headers manually (more reliable than SDK fetch)
    const token = await sdk.quickAuth.getToken();
    if (token) {
      const headers = new Headers(options?.headers);
      headers.set('Authorization', `Bearer ${token}`);
      return fetch(url, { ...options, headers });
    }

    // No token, use regular fetch
    return fetch(url, options);
    */
  } catch (error) {
    // If anything fails, fall back to regular fetch
    console.log('farcasterFetch error, using regular fetch:', error);
    return fetch(url, options);
  }
};

/**
 * Sign out from Farcaster (clear local state)
 */
export const signOutFarcaster = () => {
  setFarcasterAuth({
    isAuthenticated: false,
    fid: null,
    username: null,
    displayName: null,
    pfpUrl: null,
    token: null,
  });
  localStorage.removeItem('farcaster_token');
};

// Auto-initialize when the store is imported
// This will be called after the SDK is ready
if (typeof window !== 'undefined') {
  // Wait a bit for SDK to initialize, then try to init Farcaster
  // This will gracefully fail if not in Farcaster context
  setTimeout(() => {
    initializeFarcaster().catch(() => {
      // Silently handle initialization failure for non-Farcaster environments
      console.log('Farcaster initialization skipped (not in Farcaster context)');
    });
  }, 100);
}
