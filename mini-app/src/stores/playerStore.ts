import { createSignal, createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';
import { mockDataService, mockPlaylists, mockPlaylistTracks, mockTrackSubmissions } from '../data/mockData';

export type TrackSource = 'youtube' | 'spotify' | 'soundcloud' | 'bandcamp';

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
    setIsPlaying(true);
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
    setIsPlaying(true);
  }
};