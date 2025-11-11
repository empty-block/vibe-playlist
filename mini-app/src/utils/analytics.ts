import posthog from 'posthog-js';

/**
 * PostHog Analytics for Jamzy Mini-App
 *
 * Privacy-friendly analytics tracking for beta testing.
 * - Session recordings enabled for beta (helps debug issues)
 * - All text inputs are automatically masked
 * - Only tracks in production (disabled in dev mode)
 * - Uses public Farcaster data (FID, username, display name)
 *
 * TODO: Before public launch, disable session recordings by setting:
 * disable_session_recording: true
 */

let isInitialized = false;

export const initAnalytics = () => {
  if (isInitialized) return;

  const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST;

  if (!apiKey) {
    console.warn('PostHog: API key not found. Analytics disabled.');
    return;
  }

  posthog.init(apiKey, {
    api_host: host,
    person_profiles: 'identified_only', // Only create profiles for logged-in users
    autocapture: false, // Disable automatic tracking (we'll be explicit)
    capture_pageview: false, // We'll track manually

    // Session recording - enabled for beta with privacy protections
    // TODO: Disable before public launch
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: true, // Mask all text inputs
      maskTextSelector: '[data-private]', // Custom masking for specific elements
      recordCrossOriginIframes: false, // Don't record embedded content
    },

    // Only track in production
    loaded: (posthog) => {
      if (import.meta.env.DEV) {
        posthog.opt_out_capturing();
        console.log('PostHog: Analytics disabled in development mode');
      } else {
        console.log('PostHog: Analytics initialized');
      }
    },
  });

  isInitialized = true;
};

/**
 * Identify a user by their Farcaster ID (FID)
 */
export const identifyUser = (
  fid: string,
  properties?: {
    username?: string;
    displayName?: string;
    pfpUrl?: string;
    isSpotifyAuthenticated?: boolean;
  }
) => {
  if (!isInitialized) return;
  posthog.identify(fid, properties);
};

/**
 * Track app opened event
 */
export const trackAppOpened = (properties?: {
  is_farcaster_context?: boolean;
  dev_mode?: boolean;
  has_spotify_auth?: boolean;
}) => {
  if (!isInitialized) return;
  posthog.capture('app_opened', properties);
};

/**
 * Track beta code redemption attempt
 */
export const trackBetaCodeEntered = (
  success: boolean,
  errorCode?: string
) => {
  if (!isInitialized) return;
  posthog.capture('beta_code_entered', {
    success,
    error_code: errorCode,
  });
};

/**
 * Track Spotify authentication completion
 */
export const trackSpotifyAuthCompleted = (
  success: boolean,
  error?: string
) => {
  if (!isInitialized) return;
  posthog.capture('spotify_auth_completed', {
    success,
    has_refresh_token: success,
    error_message: error,
  });
};

/**
 * Track when a track is played
 */
export const trackTrackPlayed = (
  platform: 'spotify' | 'soundcloud' | 'youtube' | 'tortoise',
  trackId?: string,
  source?: string
) => {
  if (!isInitialized) return;
  posthog.capture('track_played', {
    platform,
    track_id: trackId,
    source,
  });
};

/**
 * Track when a user clicks on a channel
 */
export const trackChannelClicked = (
  channelId: string,
  channelName?: string,
  source?: string
) => {
  if (!isInitialized) return;
  posthog.capture('channel_clicked', {
    channel_id: channelId,
    channel_name: channelName,
    source,
  });
};

/**
 * Track when a user views a profile
 */
export const trackProfileViewed = (
  fid: string,
  username?: string,
  source?: string
) => {
  if (!isInitialized) return;
  posthog.capture('profile_viewed', {
    fid,
    username,
    source,
  });
};

/**
 * Track navigation button clicks
 */
export const trackNavButtonClicked = (
  buttonName: 'trending' | 'channels' | 'profile' | 'threads'
) => {
  if (!isInitialized) return;
  posthog.capture('nav_button_clicked', {
    button_name: buttonName,
  });
};

/**
 * Track sort changes
 */
export const trackSortChanged = (
  sortType: string,
  page: string
) => {
  if (!isInitialized) return;
  posthog.capture('sort_changed', {
    sort_type: sortType,
    page,
  });
};

/**
 * Track filter toggles
 */
export const trackFilterToggled = (
  filterType: string,
  enabled: boolean,
  page: string
) => {
  if (!isInitialized) return;
  posthog.capture('filter_toggled', {
    filter_type: filterType,
    enabled,
    page,
  });
};

/**
 * Track add track button clicks
 */
export const trackAddTrackClicked = (
  source?: string
) => {
  if (!isInitialized) return;
  posthog.capture('add_track_clicked', {
    source,
  });
};
