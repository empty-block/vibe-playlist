import { createSignal, createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';
import { mockDataService, mockPlaylists, mockPlaylistTracks, mockTrackSubmissions } from '../data/mockData';
import { isInFarcasterSync } from './farcasterStore';
import { isSpotifyAuthenticated, initiateSpotifyAuth } from './authStore';
import { trackTrackPlayed } from '../utils/analytics';

export type TrackSource = 'youtube' | 'spotify' | 'soundcloud' | 'bandcamp' | 'songlink' | 'apple_music' | 'tortoise';

export interface Reply {
  id: string;
  username: string;
  userAvatar: string;
  comment: string;
  timestamp: string;
  likes: number;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  source: TrackSource;
  sourceId: string; // videoId for YouTube, track ID for Spotify, etc.
  thumbnail: string;
  addedBy: string;
  userFid?: string; // Farcaster ID of the user who added the track
  userAvatar: string;
  timestamp: string;
  comment: string;
  likes: number;
  replies: number;
  recasts: number;
  tags?: string[]; // New tags field
  repliesData?: Reply[]; // Actual reply objects
  // Keep videoId for backward compatibility during transition
  videoId?: string;
  // Filter-specific flags for ProfilePage
  isLiked?: boolean;
  isConversation?: boolean;
  // Track original source if resolved from songlink/apple_music
  originalSource?: TrackSource;
  url?: string; // Original URL for resolution
  castHash?: string; // Farcaster cast hash for opening in Farcaster client
  // Content type for Spotify/SoundCloud collections (albums, playlists, sets)
  contentType?: 'track' | 'album' | 'playlist';
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  image?: string;
  trackCount: number;
  createdBy: string;
  creatorAvatar: string;
  createdAt: string;
  memberCount?: number;
  isCollaborative?: boolean;
}

// Convert array to Record for backward compatibility
export const playlists: Record<string, Playlist> = mockPlaylists.reduce((acc, playlist) => {
  acc[playlist.id] = playlist;
  return acc;
}, {} as Record<string, Playlist>);

// Helper function to get playlist tracks from the centralized data
const getPlaylistTracksFromData = (playlistId: string): Track[] => {
  const trackIds = mockPlaylistTracks[playlistId] || [];
  return mockTrackSubmissions.filter(track => trackIds.includes(track.id));
};

// Convert centralized data to the expected format for backward compatibility
const playlistSongs: Record<string, Track[]> = mockPlaylists.reduce((acc, playlist) => {
  acc[playlist.id] = getPlaylistTracksFromData(playlist.id);
  return acc;
}, {} as Record<string, Track[]>);

// Signals and stores
export const [currentPlaylistId, setCurrentPlaylistId] = createSignal<string>('grunge_master_jams');
export const [playingPlaylistId, setPlayingPlaylistId] = createSignal<string>('grunge_master_jams'); // Tracks which playlist is actually playing
export const [playlistTracks, setPlaylistTracks] = createStore<Record<string, Track[]>>(playlistSongs);
export const [currentTrack, setCurrentTrack] = createSignal<Track | null>(null);
export const [isPlaying, setIsPlaying] = createSignal(false);

// Derived signal for player visibility - true when player should occupy space
export const isPlayerVisible = createMemo(() => !!currentTrack());

// Player controls state
export const [shuffleMode, setShuffleMode] = createSignal(false);
export const [repeatMode, setRepeatMode] = createSignal<'none' | 'all' | 'one'>('none');
export const [playerHeight, setPlayerHeight] = createSignal(155);

// Progress tracking
export const [currentTime, setCurrentTime] = createSignal(0);
export const [duration, setDuration] = createSignal(0);
export const [isSeekable, setIsSeekable] = createSignal(false);

// Error handling
export const [playerError, setPlayerError] = createSignal<string | null>(null);

export const handleTrackError = (errorMessage: string, autoSkip: boolean = true) => {
  console.error('Track playback error:', errorMessage);
  setPlayerError(errorMessage);

  if (autoSkip) {
    // Auto-skip to next track after a delay
    setTimeout(() => {
      console.log('Auto-skipping to next track due to error');
      setPlayerError(null);
      playNextTrack();
    }, 2000);
  }
};

// Temporary migration function to add missing source fields
const addMissingSourceFields = (track: any): Track => {
  if (!track.source && track.videoId) {
    console.log('Migrating track:', track.title, 'from videoId:', track.videoId);
    return {
      ...track,
      source: 'youtube' as TrackSource,
      sourceId: track.videoId
    };
  }
  console.log('Track already has source:', track.title, track.source);
  return track as Track;
};

export const getCurrentPlaylistTracks = () => {
  const tracks = playlistTracks[currentPlaylistId()] || [];
  console.log('getCurrentPlaylistTracks called, raw tracks:', tracks.length);
  const migratedTracks = tracks.map(addMissingSourceFields);
  console.log('After migration:', migratedTracks.map(t => ({ title: t.title, source: t.source })));
  return migratedTracks;
};

// Add helper functions to use the new mock data service
export const getPlaylistsAsync = async () => {
  return await mockDataService.getPlaylists();
};

export const getPlaylistTracksAsync = async (playlistId: string) => {
  return await mockDataService.getPlaylistTracks(playlistId);
};

export const getAllTracksAsync = async () => {
  return await mockDataService.getAllTracks();
};

export const getTracksByUserAsync = async (username: string) => {
  return await mockDataService.getTracksByUser(username);
};

// Playlist navigation helpers
export const getCurrentTrackIndex = (): number => {
  const current = currentTrack();
  if (!current) return -1;

  const tracks = getCurrentPlaylistTracks();
  return tracks.findIndex(track => track.id === current.id);
};

export const playNextTrack = () => {
  const tracks = getCurrentPlaylistTracks();
  if (tracks.length === 0) return;

  const currentIndex = getCurrentTrackIndex();
  const repeat = repeatMode();

  // Handle repeat one mode
  if (repeat === 'one' && currentIndex >= 0) {
    // Replay the same track
    const current = currentTrack();
    if (current) {
      console.log('Repeating current track:', current.title);
      setCurrentTrack(null); // Reset to trigger reload
      setTimeout(() => setCurrentTrack(current), 50);
      setIsPlaying(true);
    }
    return;
  }

  let nextIndex: number;

  if (shuffleMode()) {
    // Random track (but not the current one)
    const availableIndices = tracks
      .map((_, index) => index)
      .filter(index => index !== currentIndex);
    nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  } else {
    // Sequential play
    nextIndex = currentIndex + 1;
  }

  // Handle end of playlist
  if (nextIndex >= tracks.length) {
    if (repeat === 'all') {
      nextIndex = 0; // Loop back to start
    } else {
      console.log('End of playlist reached');
      setIsPlaying(false);
      return;
    }
  }

  const nextTrack = tracks[nextIndex];
  if (nextTrack) {
    console.log('Playing next track:', nextTrack.title);
    setCurrentTrack(nextTrack);

    // For YouTube: require manual play button click (two-click pattern)
    // For other sources: autoplay works fine
    if (nextTrack.source === 'youtube') {
      setIsPlaying(false);
      console.log('YouTube track loaded - user must click play button');
    } else {
      setIsPlaying(true);
    }
  }
};

export const playPreviousTrack = () => {
  const tracks = getCurrentPlaylistTracks();
  if (tracks.length === 0) return;

  const currentIndex = getCurrentTrackIndex();
  if (currentIndex <= 0) {
    console.log('Already at first track');
    return;
  }

  let previousIndex: number;

  if (shuffleMode()) {
    // Random track (but not the current one)
    const availableIndices = tracks
      .map((_, index) => index)
      .filter(index => index !== currentIndex);
    previousIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  } else {
    // Sequential play
    previousIndex = currentIndex - 1;
  }

  const previousTrack = tracks[previousIndex];
  if (previousTrack) {
    console.log('Playing previous track:', previousTrack.title);
    setCurrentTrack(previousTrack);

    // For YouTube: require manual play button click (two-click pattern)
    // For other sources: autoplay works fine
    if (previousTrack.source === 'youtube') {
      setIsPlaying(false);
      console.log('YouTube track loaded - user must click play button');
    } else {
      setIsPlaying(true);
    }
  }
};

/**
 * Play a track from a feed (channel, trending, profile, etc.)
 * This function properly sets up the playlist context so skip prev/next work correctly
 */
export const playTrackFromFeed = (track: Track, feedTracks: Track[], feedId: string) => {
  console.log(`Setting up playlist context for feed: ${feedId} with ${feedTracks.length} tracks`);

  // Update the playlist tracks store with this feed's tracks
  setPlaylistTracks(feedId, feedTracks);

  // Set the current playlist IDs
  setCurrentPlaylistId(feedId);
  setPlayingPlaylistId(feedId);

  // Play the track
  setCurrentTrack(track);

  // For YouTube and Spotify: require manual play button click (two-click pattern)
  // Spotify in Farcaster requires user to click "Play on Spotify" button
  // For other sources (SoundCloud): autoplay works fine
  if (track.source === 'youtube' || track.source === 'spotify') {
    setIsPlaying(false);
    console.log(`${track.source} track loaded from feed - user must click play button`);
  } else {
    setIsPlaying(true);
    console.log('Non-YouTube/Spotify track loaded from feed - autoplaying');

    // Track playback for autoplaying tracks (YouTube/Spotify tracked on manual play)
    trackTrackPlayed(track.source, track.id, feedId);
  }
};

/**
 * Prepare pending track context for Spotify auth redirect
 * Returns minimal data to be passed via OAuth state parameter
 * Only stores IDs - full track data will be fetched on return
 */
export const storePendingTrack = (track: Track, feedTracks: Track[], feedId: string) => {
  // Extract platform info from track URL
  const platformName = track.source; // 'spotify', 'youtube', 'soundcloud'
  const platformId = track.sourceId; // Platform-specific track ID (Spotify ID, YouTube video ID, etc.)

  const pendingData = {
    platformName,
    platformId,
    feedId,
    castHash: track.castHash, // Optional - for specific cast context
    // Preserve user info for display after OAuth redirect
    addedBy: track.addedBy,
    userAvatar: track.userAvatar,
    userFid: track.userFid,
    timestamp: Date.now()
  };

  console.log('✅ Prepared pending track data for OAuth state:', {
    platform: platformName,
    id: platformId,
    feedId,
    user: track.addedBy
  });

  // Return data to be passed via OAuth state parameter
  return pendingData;
};

/**
 * Restore pending track after Spotify auth (from OAuth state parameter)
 * Fetches full track data from API using stored IDs
 */
export const restorePendingTrack = async (pendingData?: any): Promise<boolean> => {
  // If no pending data provided, nothing to restore
  if (!pendingData) {
    console.log('ℹ️ No pending track data provided');
    return false;
  }

  try {
    const { platformName, platformId, feedId, castHash, timestamp, addedBy, userAvatar, userFid } = pendingData;

    // Check if data is stale (more than 5 minutes old)
    if (Date.now() - timestamp > 5 * 60 * 1000) {
      console.log('⏰ Pending track data is stale, ignoring');
      return false;
    }

    console.log('✅ Fetching pending track from API:', { platformName, platformId, feedId });

    // Dynamically import to avoid circular dependency
    const { fetchTrack, fetchHomeFeed, fetchChannelFeed } = await import('../services/api');

    // Fetch the track data from API
    const { track: apiTrack } = await fetchTrack(platformName, platformId);

    if (!apiTrack) {
      console.error('❌ Track not found in database');
      return false;
    }

    console.log('📦 API Track Data:', {
      platformId: apiTrack.platformId,
      title: apiTrack.title,
      artist: apiTrack.artist,
      thumbnail: apiTrack.thumbnail,
      url: apiTrack.url,
      platform: apiTrack.platform,
      fullApiResponse: apiTrack
    });

    // Convert API track to Track type
    const track: Track = {
      id: castHash || apiTrack.id, // Use castHash if available, fallback to API id
      sourceId: apiTrack.platformId || platformId, // Spotify track ID, YouTube video ID, etc.
      title: apiTrack.title,
      artist: apiTrack.artist,
      thumbnail: apiTrack.thumbnail || '', // Album art image URL
      url: apiTrack.url || '', // Platform URL (spotify:track:xxx or youtube.com/watch?v=xxx)
      source: (apiTrack.platform || platformName) as TrackSource,
      // Restore user info from pending track data
      addedBy: addedBy || '',
      userAvatar: userAvatar || '',
      userFid: userFid || '',
      timestamp: apiTrack.timestamp || new Date().toISOString(),
      comment: '',
      likes: 0,
      replies: 0,
      recasts: 0,
      duration: '',
      castHash: castHash || undefined
    };

    console.log('🎨 Built Track Object:', {
      id: track.id,
      sourceId: track.sourceId,
      title: track.title,
      thumbnail: track.thumbnail,
      thumbnailLength: track.thumbnail?.length,
      url: track.url
    });

    // Fetch feed data to get playlist context
    let feedTracks: Track[] = [];
    try {
      if (feedId === 'home') {
        const feedData = await fetchHomeFeed({});
        // Convert feed threads to tracks (simplified - you may need to adapt this)
        feedTracks = [track]; // For now, just use the single track
      } else if (feedId.startsWith('channel-')) {
        const channelId = feedId.replace('channel-', '');
        const feedData = await fetchChannelFeed(channelId, {});
        feedTracks = [track];
      } else {
        // For other feed types, just use the single track
        feedTracks = [track];
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch feed context, using single track only:', error);
      feedTracks = [track];
    }

    console.log('✅ Restoring pending track:', track.title);
    playTrackFromFeed(track, feedTracks, feedId);
    return true;
  } catch (error) {
    console.error('❌ Failed to restore pending track from URL hash:', error);
    // Clean up the hash on error
    const cleanUrl = window.location.href.split('#')[0];
    window.history.replaceState(null, '', cleanUrl);
    return false;
  }
};

/**
 * Play track with Spotify auth check - stores pending track if auth needed
 * This is the function that UI components should call instead of playTrackFromFeed directly
 */
export const playTrackWithAuthCheck = (track: Track, feedTracks: Track[], feedId: string) => {
  console.log('🎵 playTrackWithAuthCheck called:', {
    track: track.title,
    source: track.source,
    isSpotifyAuth: isSpotifyAuthenticated()
  });

  // If it's a Spotify track and user is not authenticated, store for later and start auth
  if (track.source === 'spotify' && !isSpotifyAuthenticated()) {
    console.log('🔐 Spotify track requires auth - preparing data for OAuth state parameter');
    const pendingData = storePendingTrack(track, feedTracks, feedId);
    initiateSpotifyAuth(pendingData);
    return;
  }

  // Otherwise play normally
  console.log('▶️ Playing track normally (already authed or not Spotify)');
  playTrackFromFeed(track, feedTracks, feedId);
};