import { createSignal, createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';
import { mockDataService, mockPlaylists, mockPlaylistTracks, mockTrackSubmissions } from '../data/mockData';
import { isInFarcasterSync } from './farcasterStore';
import { isSpotifyAuthenticated, initiateSpotifyAuth } from './authStore';

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

  // For YouTube: require manual play button click (two-click pattern)
  // For other sources: autoplay works fine
  if (track.source === 'youtube') {
    setIsPlaying(false);
    console.log('YouTube track loaded from feed - user must click play button');
  } else {
    setIsPlaying(true);
    console.log('Non-YouTube track loaded from feed - autoplaying');
  }
};

/**
 * Store pending track context in URL hash (for Spotify auth redirect)
 * URL hash survives redirects and doesn't rely on localStorage in iframes
 */
export const storePendingTrack = (track: Track, feedTracks: Track[], feedId: string) => {
  const pendingData = {
    track,
    feedTracks,
    feedId,
    timestamp: Date.now()
  };

  // Encode data in URL hash - this survives the redirect!
  const encoded = encodeURIComponent(JSON.stringify(pendingData));
  const currentUrl = new URL(window.location.href);
  currentUrl.hash = `pending_track=${encoded}`;

  // Update URL without reloading the page
  window.history.replaceState(null, '', currentUrl.toString());

  console.log('✅ Stored pending track in URL hash:', track.title);
  console.log('✅ Hash will survive Spotify redirect');
};

/**
 * Restore pending track after Spotify auth (if exists in URL hash)
 */
export const restorePendingTrack = (): boolean => {
  // Check URL hash for pending track data
  const hash = window.location.hash;
  if (!hash || !hash.includes('pending_track=')) {
    console.log('ℹ️ No pending track in URL hash');
    return false;
  }

  try {
    // Extract the encoded data from hash
    const match = hash.match(/pending_track=([^&]*)/);
    if (!match) return false;

    const encoded = match[1];
    const decoded = decodeURIComponent(encoded);
    const { track, feedTracks, feedId, timestamp } = JSON.parse(decoded);

    // Clear the hash from URL
    const cleanUrl = window.location.href.split('#')[0];
    window.history.replaceState(null, '', cleanUrl);

    // Check if data is stale (more than 5 minutes old)
    if (Date.now() - timestamp > 5 * 60 * 1000) {
      console.log('⏰ Pending track data is stale, ignoring');
      return false;
    }

    console.log('✅ Restoring pending track from URL hash:', track.title);
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
    console.log('🔐 Spotify track requires auth - storing for post-auth restoration');
    storePendingTrack(track, feedTracks, feedId);
    initiateSpotifyAuth();
    return;
  }

  // Otherwise play normally
  console.log('▶️ Playing track normally (already authed or not Spotify)');
  playTrackFromFeed(track, feedTracks, feedId);
};